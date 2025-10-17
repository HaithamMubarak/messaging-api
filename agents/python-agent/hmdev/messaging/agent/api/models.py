from dataclasses import dataclass
from typing import List, Optional, Any, Dict


@dataclass
class ConnectResponse:
    sessionId: Optional[str] = None
    channelId: Optional[str] = None
    date: Optional[float] = None


@dataclass
class EventMessageResult:
    events: List[Dict[str, Any]]
    nextOffset: Optional[int] = None


@dataclass
class AgentInfo:
    agentName: str
    date: Optional[float] = None
    meta: Optional[Dict[str, Any]] = None

