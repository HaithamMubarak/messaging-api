from abc import ABC, abstractmethod
from typing import List, Optional

from hmdev.messaging.agent.api.models import ConnectResponse, EventMessageResult, AgentInfo, ReceiveConfig


class ConnectionChannelApi(ABC):
    @abstractmethod
    def connect(self, channel_name: str, channel_key: str, agent_name: str, session_id: str | None = None) -> ConnectResponse:
        ...

    @abstractmethod
    def receive(self, session_id: str, receive_config: ReceiveConfig) -> Optional[EventMessageResult]:
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

    # UDP bridge operations via the messaging-service UDP listener
    @abstractmethod
    def udp_push(self, msg: str, to_user: str | None, session_id: str) -> bool:
        ...

    @abstractmethod
    def udp_pull(self, session_id: str, receive_config: ReceiveConfig) -> Optional[EventMessageResult]:
        ...
