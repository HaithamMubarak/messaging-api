from dataclasses import dataclass
from enum import Enum
from typing import Optional
import json

class Status(str, Enum):
    SUCCESS = "success"
    ERROR = "error"


@dataclass
class ApiResponse:
    status: Status
    data: str
    update_length: Optional[int] = None

    def to_json(self) -> str:

        return json.dumps({
            "status": self.status.value,
            "data": self.data,
            "updateLength": self.update_length
        })