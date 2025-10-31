# filepath: agents/examples/python-agent-chat/chat_example.py
import argparse
import os
import sys
import threading
import time
from typing import List, Dict, Any

# Ensure repository local Python package is importable when running directly
# Adds <repo>/agents/python-agent to sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PY_AGENT_PATH = os.path.normpath(os.path.join(CURRENT_DIR, "..", "..", "python-agent"))
if PY_AGENT_PATH not in sys.path:
    sys.path.insert(0, PY_AGENT_PATH)

from hmdev.messaging.agent.core.agent_connection import AgentConnection
from hmdev.messaging.agent.core.agent_connection_event_handler import AgentConnectionEventHandler


EXIT_COMMAND = "/python-agent:exit"


class _PrintAndExitHandler(AgentConnectionEventHandler):
    def __init__(self, connection: AgentConnection, stop_event: threading.Event) -> None:
        self._connection = connection
        self._stop_event = stop_event

    def on_message_events(self, message_events: List[Dict[str, Any]]) -> None:
        try:
            print("New Message events:")
            for ev in message_events:
                print(ev)

            # check for exit command in events that arrived after connection time
            conn_time = getattr(self._connection, "connection_time", None) or 0
            for ev in message_events:
                date = ev.get("date") or 0
                content = ev.get("content")
                if date > conn_time and content and isinstance(content, str) and content.strip() == EXIT_COMMAND:
                    self._connection.send_message("Bye bye from your Python Agent - have a great day! :)")
                    # small sleep to give time for message to send
                    time.sleep(1.5)
                    self._stop_event.set()
                    return
        except Exception as e:
            print("Handler exception:", e)


def main() -> None:
    parser = argparse.ArgumentParser(description="Python Agent Example - simple chat usage")

    # production: "https://hmdevonline.com/messaging-platform/api/v1/messaging-service"
    # Local dev/test: "http://localhost:8082/messaging-platform/api/v1/messaging-service"

    parser.add_argument("--url", default="https://hmdevonline.com/messaging-platform/api/v1/messaging-service")
    parser.add_argument("--channel", default="system001")
    parser.add_argument("--password", default="12345678")
    parser.add_argument("--agent-name", default="python-agent-example-001")
    parser.add_argument("--api-key", default="c9b1c8f2-3a5b-4f2a-8d2b-1234567890ab", help="Optional developer API key id to include in requests")
    args = parser.parse_args()

    # If api-key provided on CLI, prefer passing it into the AgentConnection factory so
    # the underlying HTTP client will include X-Api-Key. This avoids reading env vars
    # from within messaging API classes.
    if args.api_key:
        agent = AgentConnection.with_api_key(args.url, args.api_key)
    else:
        # Fall back to reading environment var at the agent entrypoint if desired
        api_key = os.environ.get('DEFAULT_API_KEY')
        agent = AgentConnection.with_api_key(args.url, api_key) if api_key else AgentConnection(args.url)

    try:
        if not agent.connect(args.channel, args.password, args.agent_name):
            print("Connect failed")
            return
        print("Connected.")
        print("Active agents:", agent.get_active_agents())
        ok = agent.send_message(f"Hello from {args.agent_name}! To exit, send '{EXIT_COMMAND}' command.")
        print("send_message:", ok)

        # start async receive thread and wait for exit command
        stop_event = threading.Event()
        handler: AgentConnectionEventHandler = _PrintAndExitHandler(agent, stop_event)
        # Cast to AgentConnectionEventHandler to satisfy static type checkers

        # todo: consider using agent.receive_forever(handler) instead
        time.sleep(2)  # brief pause before starting receive
        agent.receive_async(handler)

        waited = stop_event.wait(timeout=10*60)  # 10 minutes
        if not waited:
            print("Timed out waiting for exit command")

    finally:
        agent.disconnect()
        print("Disconnected.")


if __name__ == "__main__":
    main()
