import logging
import threading
import re
from typing import Optional, List
import uuid
import json

from hmdev.messaging.agent.core.agent_connection_event_handler import AgentConnectionEventHandler
from hmdev.messaging.agent.util import session_recovery_utility as Sess
from hmdev.messaging.agent.util.utils import sleep
from hmdev.messaging.agent.api.connection_channel_api_factory import ConnectionChannelApiFactory
from hmdev.messaging.agent.api.models import ConnectResponse, EventMessageResult, AgentInfo, ReceiveConfig
from hmdev.messaging.agent.api.impl.messaging_channel_api import MessagingChannelApi
from hmdev.messaging.agent.security.my_security import MySecurity

logger = logging.getLogger(__name__)

# Mirror Java-agent constants
DEFAULT_RECEIVE_LIMIT = 20
PASSWORD_WAIT_TIMEOUT_SECONDS = 5


class AgentConnection:

    def __init__(self, api_url: str) -> None:
        self.connection_time: Optional[float] = None
        self._agent_name: Optional[str] = None
        self._channel_api = ConnectionChannelApiFactory.get_connection_api(api_url)
        self._check_last_session = True
        self._session_id: Optional[str] = None
        self._ready_state = False
        self._channel_password: Optional[str] = None
        self._receive_thread: Optional[threading.Thread] = None
        # Private key generated when requesting a password. Kept until a PASSWORD_REPLY is received
        # or the request is cancelled/fulfilled.
        self._pending_private_key = None
        # Track the request id associated with the pending private key so replies can be correlated
        self._pending_request_id: Optional[str] = None

    # New constructor-like factory: accept optional developer_api_key
    @classmethod
    def with_api_key(cls, api_url: str, developer_api_key: Optional[str] = None):
        inst = cls(api_url)
        # Replace channel_api with one using developer_api_key
        inst._channel_api = ConnectionChannelApiFactory.get_connection_api(api_url, developer_api_key)
        return inst

    def connect(self, channel_name: str, channel_password: str, agent_name: str) -> bool:

        self._agent_name = agent_name

        if self._ready_state and self._session_id is not None:
            raise Exception(f"Agent {self._agent_name} is already connected with session {self._session_id}")

        if self._session_id is None and self._check_last_session:
            self._session_id = Sess.load_session_id(channel_name)

        resp: ConnectResponse = self._channel_api.connect(channel_name, channel_password, self._agent_name, self._session_id)

        if resp and resp.sessionId:
            try:
                # connection_time may be provided in response.date
                self._session_id = resp.sessionId
                self.connection_time = resp.date if resp.date is not None else None
            except Exception:
                # fallback: keep existing session id
                pass

            self._ready_state = True
            self._channel_password = channel_password
            if self._session_id:
                Sess.save_session_id(channel_name, self._session_id)
            logger.info("Connected to session %s", self._session_id)

            return True
        else:
            logger.warning("Connect failed: %s", resp)
            return False

    def disconnect(self) -> bool:
        if not self.is_ready():
            return False

        result: bool = self._channel_api.disconnect(self._session_id)

        if result:
            self._session_id = None
            self._ready_state = False
            # Clear any pending private key when disconnecting to avoid keeping sensitive key material alive
            self._pending_private_key = None
            self._pending_request_id = None

        return result

    def receive(self, offset_range: ReceiveConfig) -> Optional[EventMessageResult]:
        # Allow receiving messages even before the local channel password/secret is known.
        if not (self._ready_state and self._session_id):
            return None
        resp = self._channel_api.receive(self._session_id, offset_range)
        return resp

    def receive_async(self, handler: AgentConnectionEventHandler) -> None:
        if self._receive_thread is None:
            self._receive_thread = threading.Thread(target=self._run_receive, args=(handler,), daemon=True)
            self._receive_thread.start()

    def _run_receive(self, handler: AgentConnectionEventHandler) -> None:
        offset_range = ReceiveConfig(globalOffset=0, localOffset=0, limit=DEFAULT_RECEIVE_LIMIT)

        while self.is_ready():
            resp = self.receive(offset_range)
            if resp is None:
                sleep(0.5)
                continue

            events = resp.events or []
            if events:
                try:
                    handler.on_message_events(events)
                except Exception as e:
                    logger.warning("Handler raised exception: %s", e)

            if resp.nextGlobalOffset is not None:
                offset_range.globalOffset = resp.nextGlobalOffset

            if resp.nextLocalOffset is not None:
                offset_range.localOffset = resp.nextLocalOffset

            sleep(0.5)

    def send_message(self, msg: str, destination: Optional[str] = "*", as_filter_regex: Optional[bool] = True) -> bool:
        if not self.is_ready():
            return False

        # If not using regex, escape the destination (similar to Pattern.quote in Java)
        dest = destination if as_filter_regex else re.escape(destination)

        try:
            result = self._channel_api.send(msg, dest, self._session_id)
            return bool(result)
        except Exception as e:
            logger.warning("Send failed: %s", e)
            return False

    def udp_push_message(self, msg: str, destination: str) -> bool:
        """Send a message through the UDP bridge (fire-and-forget)."""
        if not self.is_ready():
            return False
        try:
            return bool(self._channel_api.udp_push(msg, destination, self._session_id))
        except Exception as e:
            logger.warning("udp_push_message failed: %s", e)
            return False

    def udp_pull(self, offset_range: ReceiveConfig) -> Optional[EventMessageResult]:
        """Pull messages through the UDP bridge with a short timeout."""
        if not self.is_ready():
            return None
        try:
            return self._channel_api.udp_pull(self._session_id, offset_range)
        except Exception as e:
            logger.warning("udp_pull failed: %s", e)
            return None

    def get_active_agents(self) -> Optional[List[AgentInfo]]:
        if not self.is_ready():
            return None

        try:
            resp = self._channel_api.get_active_agents(self._session_id)
            return resp
        except Exception as e:
            logger.warning("get_active_agents failed: %s", e)
            return None

    def set_check_last_session(self, check: bool) -> None:
        self._check_last_session = check

    def is_ready(self) -> bool:
        """Return True when the connection is ready and session id is present (matches Java isChannelReady)."""
        if not self._ready_state or self._session_id is None:
            logger.debug("Unable use channel operation, channel is not ready")
            return False
        else:
            return True

    def connect_with_channel_id(self, channel_id: str, agent_name: str, maybe_channel_name: Optional[str] = None) -> bool:
        """Connect using channelId and perform password-request flow if channel secret not available."""
        self._agent_name = agent_name
        if self._ready_state and self._session_id is not None:
            raise Exception(f"Agent {self._agent_name} is already connected with session {self._session_id}")

        if self._session_id is None and self._check_last_session:
            self._session_id = Sess.load_session_id(channel_id)

        resp: ConnectResponse = self._channel_api.connect(None, None, self._agent_name, self._session_id, channel_id)

        if resp and resp.sessionId:
            self._session_id = resp.sessionId
            self.connection_time = resp.date if resp.date is not None else None
            self._ready_state = True

            # NOTE: The automatic password-request flow has been removed from connect.
            # Call `request_password()` explicitly if needed.

            if self._session_id:
                Sess.save_session_id(channel_id, self._session_id)
            logger.info("Connected to session %s", self._session_id)
            return True
        else:
            logger.warning("Connect with channel id failed: %s", resp)
            return False

    def request_password(self, maybe_channel_name: Optional[str] = None, timeout_seconds: int = 10) -> bool:
        # Use default timeout aligned with Java agent unless caller overrides
        """Send a 'password-request' event containing a newly generated public key PEM string.

        The method will wait up to timeout_seconds for a private PASSWORD_REPLY addressed to this agent.
        The PASSWORD_REPLY content is expected to be a base64-encoded ciphertext which will be
        decrypted using the generated private key. On success the channel password is set and
        (optionally) channel secret is derived when maybe_channel_name is provided.

        Returns True if the password was received and processed, False otherwise.
        """
        if not self.is_ready() or not self._session_id:
            logger.warning("Cannot request password: connection not ready")
            return False

        if self._channel_password is not None:
            logger.debug("Channel password already known, skipping request_password")
            return True

        if not isinstance(self._channel_api, MessagingChannelApi):
            logger.warning("request_password requires MessagingChannelApi implementation")
            return False

        try:
            # use utility to generate RSA keypair and wait for reply
            from hmdev.messaging.agent.util import password_utils as PWU
            import base64, uuid, time

            priv_key, pub_pem = PWU.generate_rsa_keypair()

            # store pending private key and request id for correlation
            request_id = str(uuid.uuid4())
            self._pending_private_key = priv_key
            self._pending_request_id = request_id

            # send password-request with JSON { requestId, publicKeyPem }
            req_payload = json.dumps({"requestId": request_id, "publicKeyPem": pub_pem})
            self._channel_api.send_event('password-request', req_payload, '*', False, self._session_id)

            # wait for a PASSWORD_REPLY addressed to this agent and matching request id
            success = PWU.wait_for_password_reply(
                agent_name=self._agent_name,
                receive=lambda cfg: self.receive(cfg),
                private_key=priv_key,
                channel_api=self._channel_api,
                connection_time=self.connection_time,
                expected_request_id=request_id,
                maybe_channel_name=maybe_channel_name,
                timeout_seconds=timeout_seconds or PASSWORD_WAIT_TIMEOUT_SECONDS,
                poll_interval=0.4
            )

            # clear pending key/request id after attempt
            self._pending_private_key = None
            self._pending_request_id = None

            if success:
                # if password obtained, update local channel_password from channel_api state if set
                try:
                    # channel_api may not expose channel_password directly; keep agent's copy consistent
                    # If channel_api.channel_secret is set, we assume channel_password is derivable only if maybe_channel_name was provided
                    pass
                except Exception:
                    pass

            return bool(success)

        except Exception as e:
            logger.warning("request_password flow failed: %s", e)
            self._pending_private_key = None
            self._pending_request_id = None

        return False
