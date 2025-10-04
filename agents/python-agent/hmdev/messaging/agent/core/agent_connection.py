import json
import logging
import threading
import re
from typing import Optional, List, Dict, Any

from hmdev.messaging.agent.core.agent_connection_event_handler import AgentConnectionEventHandler
from hmdev.messaging.agent.util.api_response import ApiResponse, Status
from hmdev.messaging.agent.util import session_recovery_utility as Sess
from hmdev.messaging.agent.util.utils import sleep
from hmdev.messaging.agent.api.connection_channel_api_factory import ConnectionChannelApiFactory

logger = logging.getLogger(__name__)


class AgentConnection:

    def __init__(self, api_url: str, agent_name: str) -> None:
        self.connection_time: Optional[float] = None
        self._agent_name = agent_name
        self._channel_api = ConnectionChannelApiFactory.get_connection_api(api_url)
        self._check_last_session = True
        self._session_id: Optional[str] = None
        self._ready_state = False
        self._channel_password: Optional[str] = None
        self._receive_thread: Optional[threading.Thread] = None

    def connect(self, channel_name: str, channel_password: str) -> bool:
        if self._ready_state and self._session_id is not None:
            raise Exception(f"Agent {self._agent_name} is already connected with session {self._session_id}")

        if self._session_id is None and self._check_last_session:
            self._session_id = Sess.load_session_id(channel_name)

        resp = self._channel_api.connect(channel_name, channel_password, self._agent_name, self._session_id)
        if resp.status == Status.SUCCESS:
            try:
                data = json.loads(resp.data)
                self._session_id = data.get("sessionId", self._session_id)
                self.connection_time = data['date']
            except Exception:
                # If server returns plain session ID
                self._session_id = self._session_id or resp.data
            self._ready_state = True
            self._channel_password = channel_password
            if self._session_id:
                Sess.save_session_id(channel_name, self._session_id)
            logger.info("Connected to session %s", self._session_id)

            return True
        else:
            logger.warning("Connect failed: %s", resp.data)
            return False

    def disconnect(self) -> None:
        if not self._ready_state or not self._session_id or not self._channel_password:
            return
        self._channel_api.disconnect(self._channel_password, self._session_id)
        self._session_id = None
        self._ready_state = False

    def receive(self, start: int, end: int) -> Optional[ApiResponse]:
        if not (self._ready_state and self._session_id and self._channel_password):
            return None
        rng = f"{start}-{end}"
        resp = self._channel_api.receive( self._session_id, rng)
        return resp

    def receive_async(self, handler: AgentConnectionEventHandler) -> None:
        if self._receive_thread is None:
            self._receive_thread = threading.Thread(target=self._run_receive, args=(handler,), daemon=True)
            self._receive_thread.start()

    def _run_receive(self, handler: AgentConnectionEventHandler) -> None:
        size = 10
        start, end = 0, size
        while self._ready_state:
            resp = self.receive(start, end)
            if resp and resp.status == Status.SUCCESS:
                try:
                    events: List[Dict[str, Any]] = json.loads(resp.data)
                except Exception:
                    events = []
                if events:
                    handler.on_message_events(events)
                delta = resp.update_length or len(events)
                start += delta
                end += delta
            sleep(1)

    def send_message(self, msg: str, destination: Optional[str] = ".*", as_filter_regex: Optional[bool] = True) -> bool:
        if not self._ready_state or self._session_id is None:
            logger.debug(f"Channel {self._agent_name} is not ready")
            return False

        # If not using regex, escape the destination (similar to Pattern.quote in Java)
        dest = destination if as_filter_regex else re.escape(destination)

        resp = self._channel_api.send(msg, dest, self._session_id)
        return resp.status == Status.SUCCESS

    def get_active_agents(self) -> Optional[ApiResponse]:
        if not self._ready_state or self._session_id is None:
            logger.debug(f"Channel {self._agent_name} is not ready")
            return None

        resp = self._channel_api.get_active_agents(self._session_id)
        return resp

    def set_check_last_session(self, check: bool) -> None:
        self._check_last_session = check