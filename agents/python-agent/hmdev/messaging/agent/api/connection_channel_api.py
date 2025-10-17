from abc import ABC, abstractmethod
from typing import List, Optional

from hmdev.messaging.agent.api.models import ConnectResponse, EventMessageResult, AgentInfo


class ConnectionChannelApi(ABC):
    @abstractmethod
    def connect(self, channel_name: str, channel_key: str, agent_name: str, session_id: str | None = None) -> ConnectResponse:
        ...

    @abstractmethod
    def receive(self, session_id: str, start_offset: int, limit: int) -> Optional[EventMessageResult]:
        ...

    @abstractmethod
    def get_active_agents(self, session_id: str) -> Optional[List[AgentInfo]]:
        ...

    @abstractmethod
    def send(self, msg: str, to_user: str | None, session_id: str) -> bool:
        ...

    @abstractmethod
    def disconnect(self, session_id: str) -> bool:
        ...