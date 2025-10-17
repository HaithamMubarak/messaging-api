from dataclasses import dataclass
from typing import List, Optional, Any, Dict


@dataclass
class ChannelMetadata:
    topicName: Optional[str] = None
    channelId: Optional[str] = None


@dataclass
class ConnectResponse:
    sessionId: Optional[str] = None
    channelId: Optional[str] = None
    date: Optional[float] = None
    metadata: Optional[ChannelMetadata] = None


@dataclass
class EventMessageResult:
    events: List[Dict[str, Any]]
    nextOffset: Optional[int] = None


@dataclass
class AgentInfo:
    agentName: str
    date: Optional[float] = None
    meta: Optional[Dict[str, Any]] = None
