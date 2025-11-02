import json
import logging
from typing import Optional, List, Dict, Any
from urllib.parse import urlparse
import os

import requests
from hmdev.messaging.agent.api.connection_channel_api import ConnectionChannelApi
from hmdev.messaging.agent.api.models import ConnectResponse, EventMessageResult, AgentInfo, ChannelMetadata, ReceiveConfig
from hmdev.messaging.agent.util.http_client import HttpClient
from hmdev.messaging.agent.security.my_security import MySecurity
from hmdev.messaging.agent.api.impl.udp_client import UdpClient
from hmdev.messaging.agent.api.impl.udp_envelope import UdpEnvelope

# polling timeout in seconds
POLLING_TIMEOUT = 40
DEFAULT_UDP_PORT = 9999

logger = logging.getLogger(__name__)


class MessagingChannelApi(ConnectionChannelApi):
    PUBLIC_KEY = "/?action=get-pubkey"

    def __init__(self, remote_url: str, use_public_key: bool = False, udp_port: Optional[int] = None, developer_api_key: Optional[str] = None) -> None:
        self.remote_url = remote_url
        self.use_public_key = use_public_key
        self.client = HttpClient(remote_url)
        # Do not read DEFAULT_API_KEY from environment here. Caller/agent may provide developer_api_key.
        if developer_api_key:
            self.client.set_default_header('X-Api-Key', developer_api_key)

        self.channel_secret: Optional[str] = None
        # track readiness and current session
        self.ready_state: bool = False
        self.session_id: Optional[str] = None
        self.channel_metadata: Optional[ChannelMetadata] = None
        # next per-channel offset for chained reads
        self.next_channel_offset: Optional[int] = None

        # UDP setup based on remote URL host/port similar to Java
        host = "localhost"
        port = DEFAULT_UDP_PORT
        try:
            parsed = urlparse(remote_url)
            if parsed.hostname:
                host = parsed.hostname
            if parsed.port and parsed.port > 0:
                port = parsed.port
        except Exception:
            logger.warning("Unable to parse remoteUrl host/port (%s), defaulting to localhost:%s", remote_url, port)

        # Allow overriding UDP port via constructor, env var MESSAGING_UDP_PORT
        try:
            env_val = os.getenv("MESSAGING_UDP_PORT")
            chosen = udp_port if udp_port is not None else (int(env_val.strip()) if env_val and env_val.strip() else None)
            if chosen is not None:
                if 0 < int(chosen) <= 65535:
                    port = int(chosen)
                    logger.info("Using UDP port override: %s", port)
                else:
                    logger.warning("Ignoring invalid UDP port override: %s", chosen)
        except ValueError as nfe:
            logger.warning("Invalid UDP port override value; must be an integer: %s", nfe)

        self._udp_port = port
        self._udp_client = UdpClient(host, self._udp_port)

    def _url(self, action: str) -> str:
        # Align exactly with messaging-service controller paths
        return f"/{action}"

    def is_channel_ready(self) -> bool:
        if not self.ready_state or not self.session_id:
            logger.debug("Unable use channel operation, channel is not ready")
            return False
        return True

    def _create_channel(self, name: str, password: str) -> Optional[str]:
        try:
            payload = {"channelName": name, "channelPassword": password}
            txt = self.client.request("POST", self._url("create-channel"), json_body=payload)
            obj = json.loads(txt)
            if isinstance(obj, dict) and str(obj.get('status')) == 'success':
                data = obj.get('data', {})
                if isinstance(data, dict):
                    return data.get('channelId')
        except Exception as e:
            logger.warning("create-channel failed: %s", e)
        return None

    def connect(self, channel_name: Optional[str], channel_password: Optional[str], agent_name: str, session_id: Optional[str] = None, channel_id: Optional[str] = None) -> ConnectResponse:
        try:
            # set local secret only when we have name+key to derive it; otherwise secret remains None until PASSWORD_REPLY handled on agent side
            password_hash = None
            if channel_name and channel_password:
                self.channel_secret = MySecurity.derive_channel_secret(channel_name, channel_password)
                password_hash = MySecurity.hash(channel_password, self.channel_secret)

            payload: Dict[str, Any] = {}
            if channel_id:
                cid = channel_id
            else:
                # If channel_name+key provided derive secret and attempt create-channel to register the channel and get id
                if channel_name and channel_password:
                    # Create channel on server using channelName and passwordHash (protected password)
                    cid = self._create_channel(channel_name, password_hash)
                else:
                    raise ValueError("Missing channelId or channelName+channelPassword for connect operation")

            # prefer sending channelId to server if known
            payload["channelId"] = cid
            if channel_name and password_hash:
                # keep backward compatible fields for servers expecting name/password
                payload["channelName"] = channel_name
                # Send hashed channel password (derive locally and send hash) to align with Java agent behavior
                payload["channelPassword"] = password_hash

            payload.update({
                "agentName": agent_name,
                "agentContext": self.create_agent_context()
            })
            if session_id:
                payload["sessionId"] = session_id

            response_text = self.client.request("POST", self._url("connect"), json_body=payload)
            json_data = json.loads(response_text)

            if isinstance(json_data, dict) and str(json_data.get('status')) == 'success':
                data = json_data.get('data', {})
                session = None
                date = None
                metadata = None
                channel_id_resp = None
                if isinstance(data, dict):
                    session = data.get('sessionId') or data.get('session')
                    date = data.get('date')
                    md = data.get('metadata') or data.get('channelMetadata')
                    if isinstance(md, dict):
                        metadata = ChannelMetadata(topicName=md.get('topicName'), channelId=md.get('channelId'),
                                                   channelName=md.get('channelName'), channelPassword=md.get('channelPassword'))
                        channel_id_resp = metadata.channelId or data.get('channelId')

                self.ready_state = True
                self.session_id = session
                if isinstance(metadata, ChannelMetadata):
                    self.channel_metadata = metadata
                return ConnectResponse(sessionId=session, channelId=channel_id_resp, date=date, metadata=metadata)

            if isinstance(json_data, dict):
                session = json_data.get('sessionId') or json_data.get('session')
                md = json_data.get('metadata') or json_data.get('channelMetadata')
                metadata = None
                if isinstance(md, dict):
                    metadata = ChannelMetadata(topicName=md.get('topicName'), channelId=md.get('channelId'),
                                               channelName=md.get('channelName'), channelPassword=md.get('channelPassword'))
                    self.channel_metadata = metadata
                self.ready_state = True
                self.session_id = session
                return ConnectResponse(sessionId=session, channelId=(metadata.channelId if metadata else None), metadata=metadata)

            if isinstance(response_text, str) and response_text.strip():
                session = response_text.strip()
                self.ready_state = True
                self.session_id = session
                return ConnectResponse(sessionId=session)

        except Exception as ex:
            logger.error("Unable to connect to the channel: %s", ex)

        return ConnectResponse()

    def receive(self, session_id: str, offset_range: ReceiveConfig) -> Optional[EventMessageResult]:
        # Use new JSON names: globalOffset / localOffset when sending; accept legacy keys in responses
        params: Dict[str, Any] = {
            "sessionId": session_id,
            "offsetRange": {"globalOffset": offset_range.globalOffset, "limit": offset_range.limit, "localOffset": offset_range.localOffset}
        }
        try:
            txt = self.client.request("POST", self._url("receive"), json_body=params, timeout=POLLING_TIMEOUT)
            obj = json.loads(txt)
            if isinstance(obj, dict) and str(obj.get('status')) == 'success':
                data = obj.get('data', {})
                if not isinstance(data, dict):
                    return EventMessageResult(events=[], nextGlobalOffset=None)
                cipher_array = data.get('events', [])
                data_array: List[Dict[str, Any]] = []
                for item in cipher_array:
                    if isinstance(item, dict) and item.get("encrypted"):
                        plain = MySecurity.decrypt_and_verify(item.get("content", ""), self.channel_secret)
                        item["content"] = plain
                        item["encrypted"] = False
                    data_array.append(item)

                return EventMessageResult(events=data_array, nextGlobalOffset=data.get('nextGlobalOffset'),
                                          nextLocalOffset=data.get('nextLocalOffset'))
            if isinstance(obj, list):
                return EventMessageResult(events=obj, nextGlobalOffset=None)
        except requests.exceptions.Timeout:
            logger.warning("Receive request timed out")
            return EventMessageResult(events=[], nextGlobalOffset=None)
        except Exception as exception:
            logger.warning(exception)
            return None
        return None

    def get_active_agents(self, session_id: str) -> Optional[List[AgentInfo]]:
        params = {"sessionId": session_id}
        try:
            txt = self.client.request("POST", self._url("list-agents"), json_body=params)
            obj = json.loads(txt)
            data: List[Any] = []
            if isinstance(obj, dict) and str(obj.get('status')) == 'success':
                data = obj.get('data', [])
            agents: List[AgentInfo] = []
            for item in data:
                if isinstance(item, dict):
                    agents.append(AgentInfo(agentName=item.get('agentName', ''), date=item.get('date'), meta=item))
            return agents
        except Exception as e:
            logger.warning(e)
            return None

    def send(self, msg: str, to_agent: Optional[str], session_id: str) -> bool:
        # Support two call styles:
        # 1) Legacy: send(msg, to_agent, session_id) -> sends encrypted chat-text
        # 2) New: send(type, content, to_agent, encrypted, session_id)
        try:
            # detect new-style call by argument types: if msg looks like an event type string and
            # a keyword "to_agent" is not the destination but positional parsing will show args
            # Python callers that want the new signature should call with five positional args.
            # We can detect by checking if "session_id" is None (unlikely) or by caller using kwargs.
            # For simplicity, attempt to interpret when user passed 5 args via positional use.
            import inspect
            frame = inspect.currentframe().f_back
            args_info = frame.f_locals.get('args', None)
        except Exception:
            args_info = None

        # Simple heuristic: if caller passed exactly 3 parameters into this function as usual, use legacy behavior.
        # Unfortunately Python doesn't provide an easy way to introspect caller's argcount, so keep backward compatible
        # by default: treat this call as legacy encrypted chat-text unless caller used the new helper `send_event` or
        # calls `send` with keyword arguments matching the new signature.

        # Legacy behavior: encrypted chat-text
        payload = {
            "type": "chat-text",
            "to": to_agent,
            "encrypted": True,
            "content": MySecurity.encrypt_and_sign(msg, self.channel_secret),
            "sessionId": session_id
        }
        try:
            txt = self.client.request("POST", self._url("event"), json_body=payload)
            obj = json.loads(txt)
            return isinstance(obj, dict) and str(obj.get('status')) == 'success'
        except Exception as e:
            logger.warning(e)
            return False

    def send_event(self, type_name: str, content: str, to_agent: Optional[str], encrypted: bool, session_id: str) -> bool:
        """Send an event with explicit type and encrypted flag.

        Use this when sending non-chat types (e.g. 'password-request' / 'password-reply').
        """
        payload = {
            "type": type_name,
            "to": to_agent,
            "encrypted": encrypted,
            "content": (MySecurity.encrypt_and_sign(content, self.channel_secret) if encrypted else content),
            "sessionId": session_id
        }
        try:
            txt = self.client.request("POST", self._url("event"), json_body=payload)
            obj = json.loads(txt)
            return isinstance(obj, dict) and str(obj.get('status')) == 'success'
        except Exception as e:
            logger.warning("send_event failed: %s", e)
            return False

    def send_raw_event(self, type_name: str, from_agent: str, to_agent: Optional[str], encrypted: bool, content: str, session_id: str) -> bool:
        """Send a raw (un-encrypted) event message. Used for REQUEST_PASSWORD prior to having channel_secret."""
        # Delegate to the new send_event API to centralize behavior
        return self.send_event(type_name, content, to_agent, encrypted, session_id)

    def disconnect(self, session_id: str) -> bool:
        try:
            # close UDP client first
            try:
                self._udp_client.close()
            except Exception as e:
                logger.debug("Error while closing udp client: %s", e)
            payload = {"sessionId": session_id}
            txt = self.client.request("POST", self._url("disconnect"), json_body=payload)
            self.client.close_all()
            obj = json.loads(txt)
            self.ready_state = False
            self.session_id = None
            return isinstance(obj, dict) and str(obj.get('status')) == 'success'
        except Exception as e:
            logger.warning(e)
            return False

    # UDP operations
    def udp_push(self, msg: str, to_agent: Optional[str], session_id: str) -> bool:
        try:
            payload = {
                "type": "chat-text",
                "to": to_agent,
                "encrypted": True,
                "content": MySecurity.encrypt_and_sign(msg, self.channel_secret),
                "sessionId": session_id
            }
            env = UdpEnvelope("push", payload).to_dict()
            return self._udp_client.send(env)
        except Exception as e:
            logger.error("Exception for udp_push: %s", e)
            return False

    def udp_pull(self, session_id: str, offset_range: ReceiveConfig) -> Optional[EventMessageResult]:
        result = EventMessageResult(events=[], nextGlobalOffset=offset_range.globalOffset)
        try:
            payload = {
                "sessionId": session_id,
                "offsetRange": {"globalOffset": offset_range.globalOffset, "limit": offset_range.limit, "localOffset": offset_range.localOffset}
            }
            env = UdpEnvelope("pull", payload).to_dict()
            resp = self._udp_client.send_and_receive(env, 5000)
            if resp is None:
                logger.debug("No UDP response received for udp_pull (timeout)")
                return result
            # messaging-service UDP response: { status: "ok", result: { status: "success", data: {...} } }
            if isinstance(resp, dict) and resp.get('status') == 'ok':
                result_node = resp.get('result')
                if isinstance(result_node, dict) and result_node.get('status') == 'success':
                    data = result_node.get('data')
                    if isinstance(data, dict):
                        events = data.get('events', [])
                        for item in events:
                            if isinstance(item, dict) and item.get("encrypted"):
                                plain = MySecurity.decrypt_and_verify(item.get("content", ""), self.channel_secret)
                                item["content"] = plain
                                item["encrypted"] = False

                        return EventMessageResult(events=events, nextGlobalOffset=data.get('nextGlobalOffset'), nextLocalOffset=data.get('nextLocalOffset'))
                else:
                    logger.warning("UDP pull non-success result: %s", result_node)
                    return result
            else:
                logger.warning("UDP pull returned non-ok response: %s", resp)
                return result
        except Exception as e:
            logger.error("Exception for udp_pull: %s", e)
        return result

    def create_agent_context(self) -> Dict[str, str]:
        return {
            "agentType": "PYTHON-AGENT",
            "descriptor": "hmdev/messaging/agent/api/http/messaging_channel_api.py"
        }
