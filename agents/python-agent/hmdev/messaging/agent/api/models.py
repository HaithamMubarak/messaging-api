from dataclasses import dataclass
from typing import List, Optional, Any, Dict


@dataclass
class ChannelMetadata:
    topicName: Optional[str] = None
    channelId: Optional[str] = None
    channelName: Optional[str] = None
    channelPassword: Optional[str] = None


@dataclass
class ConnectResponse:
    sessionId: Optional[str] = None
    channelId: Optional[str] = None
    date: Optional[float] = None
    metadata: Optional[ChannelMetadata] = None


@dataclass
class ReceiveConfig:
    # JSON field names are globalOffset, localOffset, limit — keep those names so conversion is straightforward
    globalOffset: Optional[int] = None
    localOffset: Optional[int] = None
    limit: Optional[int] = None
    # Optional poll source: 'CACHE', 'KAFKA', or 'AUTO' (default AUTO)
    pollSource: Optional[str] = "AUTO"


@dataclass
class EventMessageResult:
    events: List[Dict[str, Any]]
    nextGlobalOffset: Optional[int] = None
    nextLocalOffset: Optional[int] = None


@dataclass
class AgentInfo:
    agentName: str
    date: Optional[float] = None
    meta: Optional[Dict[str, Any]] = None
