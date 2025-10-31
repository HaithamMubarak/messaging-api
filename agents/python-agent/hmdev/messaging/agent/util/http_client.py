import logging
from typing import Dict, Optional, Any
import time
import requests

logger = logging.getLogger(__name__)


class HttpClient:
    USER_AGENT = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")

    def __init__(self, remote_url: str, requests_limit: int = 12):
        self.remote_url = remote_url.rstrip("/")
        self._last_window_start = time.time()
        self._requests_in_window = 0
        self._requests_limit = requests_limit
        # Optional default headers (e.g., X-Api-Key). Agents should pass any default headers explicitly.
        self._default_headers = {}

    def set_default_header(self, name: str, value: Optional[str]) -> None:
        """Set or clear a default header applied to every request (e.g. X-Api-Key).

        Pass value=None to remove the header.
        """
        if value is None:
            self._default_headers.pop(name, None)
        else:
            self._default_headers[name] = value

    def _throttle(self) -> None:
        now = time.time()
        if now - self._last_window_start >= 1.0:
            self._last_window_start = now
            self._requests_in_window = 0
        self._requests_in_window += 1
        if self._requests_in_window > self._requests_limit:
            sleep_time = max(0.0, 1.0 - (now - self._last_window_start))
            if sleep_time:
                time.sleep(sleep_time)
            self._last_window_start = time.time()
            self._requests_in_window = 1

    def request(self, method: str, path: str, params: Optional[Dict[str, Any]] = None, json_body: Optional[Dict[str, Any]] = None, timeout: int = 30):
        self._throttle()
        url = self.remote_url + path
        headers = {"User-Agent": self.USER_AGENT}
        # Merge default headers if present (e.g., DEFAULT_API_KEY)
        if hasattr(self, '_default_headers') and self._default_headers:
            headers.update(self._default_headers)
        try:
            if method.upper() == "GET":
                r = requests.get(url, params=params or {}, headers=headers, timeout=timeout)
            else:
                r = requests.post(url, params=params or {}, json=json_body or {}, headers=headers, timeout=timeout)
            r.raise_for_status()
            return r.text
        except Exception as e:
            raise

    def close_all(self):
        # requests is stateless; nothing to close here
        pass