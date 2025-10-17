import logging
import threading
import re
from typing import Optional, List

from hmdev.messaging.agent.core.agent_connection_event_handler import AgentConnectionEventHandler
from hmdev.messaging.agent.util import session_recovery_utility as Sess
from hmdev.messaging.agent.util.utils import sleep
from hmdev.messaging.agent.api.connection_channel_api_factory import ConnectionChannelApiFactory
from hmdev.messaging.agent.api.models import ConnectResponse, EventMessageResult, AgentInfo

logger = logging.getLogger(__name__)


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

    def connect(self, channel_name: str, channel_password: str, agent_name: str) -> bool:

        self._agent_name = agent_name

        if self._ready_state and self._session_id is not None:
            raise Exception(f"Agent {self._agent_name} is already connected with session {self._session_id}")

        if self._session_id is None and self._check_last_session:
            self._session_id = Sess.load_session_id(channel_name)

        resp: ConnectResponse = self._channel_api.connect(channel_name, channel_password, self._agent_name, self._session_id)

        if resp and resp.sessionId:
            try:
                # connection_time may be provided in response.date or in raw payload
                self._session_id = resp.sessionId
                self.connection_time = resp.date if resp.date is not None else (resp.raw.get('date') if isinstance(resp.raw, dict) else None)
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

    def disconnect(self) -> None:
        if not self.is_ready():
            return

        result: bool = self._channel_api.disconnect(self._session_id)

        if result:
            self._session_id = None
            self._ready_state = False

        return result

    def receive(self, start_offset: int, limit: int) -> Optional[EventMessageResult]:
        if not (self._ready_state and self._session_id and self._channel_password):
            return None
        resp = self._channel_api.receive(self._session_id, start_offset, limit)
        return resp

    def receive_async(self, handler: AgentConnectionEventHandler) -> None:
        if self._receive_thread is None:
            self._receive_thread = threading.Thread(target=self._run_receive, args=(handler,), daemon=True)
            self._receive_thread.start()

    def _run_receive(self, handler: AgentConnectionEventHandler) -> None:
        start_offset = 0
        limit = 20

        while self.is_ready():
            resp = self.receive(start_offset, limit)
            if resp is None:
                sleep(0.5)
                continue

            events = resp.events or []
            if events:
                try:
                    handler.on_message_events(events)
                except Exception as e:
                    logger.warning("Handler raised exception: %s", e)

            if resp.nextOffset is not None:
                start_offset = resp.nextOffset

            sleep(0.5)

    def send_message(self, msg: str, destination: Optional[str] = ".*", as_filter_regex: Optional[bool] = True) -> bool:
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