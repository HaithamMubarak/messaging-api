from abc import ABC, abstractmethod
from hmdev.messaging.agent.util.api_response import ApiResponse


class ConnectionChannelApi(ABC):
    @abstractmethod
    def connect(self, channel_name: str, channel_key: str, agent_name: str, session_id: str | None = None) -> ApiResponse:
        ...

    @abstractmethod
    def receive(self, session: str, range_str: str) -> ApiResponse:
        ...

    @abstractmethod
    def get_active_agents(self, session: str) -> ApiResponse:
        ...

    @abstractmethod
    def send(self, msg: str, to_user: str | None, session: str) -> ApiResponse:
        ...

    @abstractmethod
    def disconnect(self, channel_key: str, session: str) -> ApiResponse:
        ...