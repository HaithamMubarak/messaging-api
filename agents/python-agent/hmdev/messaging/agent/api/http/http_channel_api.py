import json
import logging
from typing import Optional, List, Dict, Any

import requests
from hmdev.messaging.agent.api.connection_channel_api import ConnectionChannelApi
from hmdev.messaging.agent.api.models import ConnectResponse, EventMessageResult, AgentInfo, ChannelMetadata
from hmdev.messaging.agent.util.http_client import HttpClient
from hmdev.messaging.agent.security.my_security import MySecurity

# 4 SECONDS
POLLING_TIMEOUT = 40

logger = logging.getLogger(__name__)


class HTTPChannelApi(ConnectionChannelApi):
    PUBLIC_KEY = "/?action=get-pubkey"

    def __init__(self, remote_url: str, use_public_key: bool = False) -> None:
        self.remote_url = remote_url
        self.use_public_key = use_public_key
        self.client = HttpClient(remote_url)
        self.channel_secret = None
        # track readiness and current session like the Java implementation
        self.ready_state: bool = False
        self.session_id: Optional[str] = None
        # store channel metadata returned by the server (topicName, channelId)
        self.channel_metadata: Optional[ChannelMetadata] = None

    def _url(self, action: str) -> str:
        return f"/{action}?use-pubkey={str(self.use_public_key).lower()}"

    def is_channel_ready(self) -> bool:
        """Return True when channel is ready (mirrors Java isChannelReady).

        Success when both `ready_state` is truthy and `session_id` is not None.
        Logs a debug message and returns False when not ready.
        """
        if not getattr(self, 'ready_state', False) or getattr(self, 'session_id', None) is None:
            logger.debug("Unable use channel operation, channel is not ready")
            return False
        return True

    def connect(self, channel_name: str, channel_key: str, agent_name: str, session_id: Optional[str] = None) -> ConnectResponse:
        try:
            self.channel_secret = MySecurity.derive_channel_secret(channel_name, channel_key)
            payload = {
                "channelName": channel_name,
                "channelPassword": MySecurity.hash(channel_key, self.channel_secret),
                "agentName": agent_name,
                "agentContext": self.create_agent_context()
            }

            if session_id:
                payload["sessionId"] = session_id

            response_text = self.client.request("POST", self._url("connect"), json_body=payload)
            json_data = json.loads(response_text)

            # server uses {status: 'success', data: {...}}
            if isinstance(json_data, dict) and str(json_data.get('status')) == 'success':
                data = json_data.get('data', {})
                session = None
                date = None
                metadata = None
                channel_id = None
                if isinstance(data, dict):
                    session = data.get('sessionId') or data.get('session')
                    date = data.get('date')
                    # parse channel metadata if provided
                    md = data.get('metadata') or data.get('channelMetadata')
                    if isinstance(md, dict):
                        metadata = ChannelMetadata(topicName=md.get('topicName'), channelId=md.get('channelId'))
                        channel_id = metadata.channelId or data.get('channelId')

                # mark as ready and store session + metadata on the instance
                self.ready_state = True
                self.session_id = session
                if isinstance(metadata, ChannelMetadata):
                    self.channel_metadata = metadata
                return ConnectResponse(sessionId=session, channelId=channel_id, date=date, metadata=metadata)

            # fallback: if server returned plain JSON object with sessionId
            if isinstance(json_data, dict):
                session = json_data.get('sessionId') or json_data.get('session')
                # try to extract metadata if present
                md = json_data.get('metadata') or json_data.get('channelMetadata')
                metadata = None
                if isinstance(md, dict):
                    metadata = ChannelMetadata(topicName=md.get('topicName'), channelId=md.get('channelId'))
                    self.channel_metadata = metadata
                self.ready_state = True
                self.session_id = session
                return ConnectResponse(sessionId=session, channelId=(metadata.channelId if metadata else None), metadata=metadata)

            # plain string session id
            if isinstance(response_text, str) and response_text.strip():
                session = response_text.strip()
                self.ready_state = True
                self.session_id = session
                return ConnectResponse(sessionId=session)

        except Exception as ex:
            logger.error("Unable to connect to the channel: %s", ex)

        return ConnectResponse()

    def receive(self, session_id: str, start_offset: int, limit: int) -> Optional[EventMessageResult]:
        params = {"sessionId": session_id, "offsetRange": {"startOffset": start_offset, "limit": limit}}
        try:
            txt = self.client.request("POST", self._url("receive"), json_body=params, timeout=POLLING_TIMEOUT)

            # Expecting JSON like {status: 'success', data: {events: [...], nextOffset: N}}
            obj = json.loads(txt)
            if isinstance(obj, dict) and str(obj.get('status')) == 'success':
                data = obj.get('data', {})
                if not isinstance(data, dict):
                    return EventMessageResult(events=[], nextOffset=None)
                cipher_array = data.get('events', [])
                data_array: List[Dict[str, Any]] = []

                for item in cipher_array:
                    if isinstance(item, dict) and item.get("encrypted"):
                        plain = MySecurity.decrypt_and_verify(item.get("content", ""), self.channel_secret)
                        item["content"] = plain
                        item["encrypted"] = False

                    data_array.append(item)

                return EventMessageResult(events=data_array, nextOffset=data.get('nextOffset'))

            # fallback: if server returned raw list
            if isinstance(obj, list):
                return EventMessageResult(events=obj, nextOffset=None)

        except requests.exceptions.Timeout:
            logger.warning("Receive request timed out")
            return EventMessageResult(events=[], nextOffset=None)
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

    def disconnect(self, session_id: str) -> bool:
        payload = {"sessionId": session_id}
        try:
            txt = self.client.request("POST", self._url("disconnect"), json_body=payload)
            self.client.close_all()
            obj = json.loads(txt)
            # clear ready state
            self.ready_state = False
            self.session_id = None
            return isinstance(obj, dict) and str(obj.get('status')) == 'success'
        except Exception as e:
            logger.warning(e)
            return False

    def create_agent_context(self) -> Dict[str, str]:
        return {
            "agentType": "PYTHON-AGENT",
            "descriptor": "hmdev/messaging/agent/api/http/http_channel_api.py"
        }
