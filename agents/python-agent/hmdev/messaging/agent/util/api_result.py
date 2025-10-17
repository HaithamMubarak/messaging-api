from enum import Enum
from dataclasses import dataclass
from typing import Any, Optional


class Status(str, Enum):
    SUCCESS = "success"
    ERROR = "error"


@dataclass
class ApiResponse:
    status: Status
    data: Any = ""
    nextOffset: Optional[int] = None
