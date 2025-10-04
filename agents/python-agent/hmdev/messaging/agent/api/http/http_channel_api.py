import json
import logging
from typing import Optional

from hmdev.messaging.agent.api.connection_channel_api import ConnectionChannelApi
from hmdev.messaging.agent.util.api_response import ApiResponse, Status
from hmdev.messaging.agent.util.http_client import HttpClient
from hmdev.messaging.agent.security.my_security import MySecurity

logger = logging.getLogger(__name__)


class HTTPChannelApi(ConnectionChannelApi):
    PUBLIC_KEY = "/?action=get-pubkey"

    def __init__(self, remote_url: str, use_public_key: bool = False) -> None:
        self.remote_url = remote_url
        self.use_public_key = use_public_key
        self.client = HttpClient(remote_url)
        self.channel_secret = None

    def _url(self, action: str) -> str:
        return f"/?use-pubkey={str(self.use_public_key).lower()}&action={action}"

    def connect(self, channel_name: str, channel_key: str, agent_name: str, session_id: Optional[str] = None) -> ApiResponse:
        self.channel_secret = MySecurity.derive_channel_secret(channel_name, channel_key)

        payload = {"channelName": channel_name, "channelPassword": MySecurity.hash(channel_key, self.channel_secret),
                   "agentName": agent_name,
                   "agentContext": self.create_agent_context()}

        if session_id:
            payload["session"] = session_id
        try:
            txt = self.client.request("POST", self._url("connect"), json_body=payload)
            data = json.loads(txt)['data']
            return ApiResponse(Status.SUCCESS, json.dumps(data))
        except Exception as e:
            return ApiResponse(Status.ERROR, str(e))

    def receive(self, session: str, range_str: str) -> ApiResponse:
        params = {"session": session, "range": range_str}
        try:
            txt = self.client.request("POST", self._url("receive"), json_body=params)
            # Expecting JSON list and optional updateLength
            try:
                obj = json.loads(txt)

                obj = obj['data']
                cipher_array = obj.get("events", [])
                data_array = []

                for item in cipher_array:
                    if item.get("encrypted"):
                        plain = MySecurity.decrypt_and_verify(json.dumps(item.get("content", {})), self.channel_secret)

                        if not plain:  # None or empty string
                            item = {}
                        else:
                            item.pop("content", None)
                            item.pop("encrypted", None)
                            item["content"] = plain

                    data_array.append(item)

                if isinstance(obj, dict) and "updateLength" in obj:
                    return ApiResponse(Status.SUCCESS, json.dumps(data_array), obj.get("updateLength"))
            except Exception as exception:
                logger.warning(exception)
                pass
            return ApiResponse(Status.SUCCESS, txt)
        except Exception as e:
            return ApiResponse(Status.ERROR, str(e))

    def get_active_agents(self, session: str) -> ApiResponse:
        params = {"session": session}
        try:
            txt = self.client.request("POST", self._url("active-agents"), json_body=params)
            # Expecting JSON list and optional updateLength
            try:
                obj = json.loads(txt)
                return ApiResponse(Status.SUCCESS, obj['data'])
            except Exception as exception:
                logger.warning(exception)
                pass
            return ApiResponse(Status.SUCCESS, txt)
        except Exception as e:
            return ApiResponse(Status.ERROR, str(e))

    def send(self, msg: str, to_agent: Optional[str], session: str) -> ApiResponse:
        payload = {
            "type": "chat-text",
            "to" : to_agent,
            "encrypted" : True,
            "content": json.loads(MySecurity.encrypt_and_sign(msg, self.channel_secret)),
            "session": session
        }
        try:
            txt = self.client.request("POST", self._url("event"), json_body=payload)
            return ApiResponse(Status.SUCCESS, txt)
        except Exception as e:
            return ApiResponse(Status.ERROR, str(e))

    def disconnect(self, channel_key: str, session: str) -> ApiResponse:
        payload = {"key": channel_key, "session": session}
        try:
            txt = self.client.request("POST", self._url("disconnect"), json_body=payload)
            self.client.close_all()
            return ApiResponse(Status.SUCCESS, txt)
        except Exception as e:
            return ApiResponse(Status.ERROR, str(e))

    def create_agent_context(self):
        return {
            "agentType" : "PYTHON-AGENT",
            "descriptor": "hmdev/messaging/agent/api/http/http_channel_api.py"
        }
