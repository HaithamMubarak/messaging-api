from abc import ABC, abstractmethod
from typing import List, Dict, Any


class AgentConnectionEventHandler(ABC):
    @abstractmethod
    def on_message_events(self, message_events: List[Dict[str, Any]]) -> None:
        ...