import json
import os
from pathlib import Path
from typing import Optional


BASE_DIR = Path.home() / ".agent_sessions"
BASE_DIR.mkdir(parents=True, exist_ok=True)


def _key(channel_name: str) -> Path:
    safe = channel_name.replace("/", "_")
    return BASE_DIR / f"{safe}.json"


def save_session_id(channel_name: str, session_id: str) -> None:
    p = _key(channel_name)
    with open(p, "w", encoding="utf-8") as f:
        json.dump({"sessionId": session_id}, f)


def load_session_id(channel_name: str) -> Optional[str]:
    p = _key(channel_name)
    if not p.exists():
        return None
    try:
        with open(p, "r", encoding="utf-8") as f:
            obj = json.load(f)
            return obj.get("sessionId")
    except Exception:
        return None


def clear_session(channel_name: str) -> None:
    p = _key(channel_name)
    try:
        if p.exists():
            p.unlink()
    except Exception:
        pass