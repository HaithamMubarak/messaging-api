import argparse
import json
import logging
import threading
import signal
import sys
import time

from hmdev.messaging.agent.core.agent_connection import AgentConnection
from hmdev.messaging.agent.core.agent_connection_event_handler import AgentConnectionEventHandler

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

EXIT_COMMAND = "/python-agent:exit"

class PrintHandler(AgentConnectionEventHandler):
    def __init__(self, agent_connection: AgentConnection, wait_event: threading.Event):
        self.wait_event = wait_event
        self.agent_connection = agent_connection

    def on_message_events(self, message_events):
        print("New Message events:")
        for event in message_events:
            print(json.dumps(event, indent=2))

        # check for EXIT_COMMAND *after* connection_time
        for event in message_events:
            if isinstance(event, dict):
                if (
                        event.get("content") == EXIT_COMMAND
                        and event.get("date", 0) > self.agent_connection.connection_time
                ):
                    print("EXIT_COMMAND received, shutting down...")
                    self.agent_connection.send_message(
                        "Bye bye from your Python Agent - have a great day! :)"
                    )
                    time.sleep(2)
                    if self.wait_event is not None:
                        self.wait_event.set()


def main():
    wake_event = threading.Event()

    parser = argparse.ArgumentParser(description="Python Agent for Messaging API")
    parser.add_argument(
        "--url",
        default="https://hmdevonline.com/messaging-api/origin-service",
        help="Messaging API base URL (default: %(default)s)",
    )
    parser.add_argument("--channel", required=False, help="Channel name", default="system001")
    parser.add_argument("--password", required=False, help="Channel password", default="12345678")
    parser.add_argument(
        "--agent-name", required=False, help="Agent name", default="system001-python-agent1"
    )

    args = parser.parse_args()

    agent = AgentConnection(args.url, args.agent_name)

    # handle Ctrl+C and termination signals
    def shutdown_handler(signum, frame):
        print("Received shutdown signal, disconnecting...")
        wake_event.set()

    signal.signal(signal.SIGINT, shutdown_handler)   # Ctrl+C
    signal.signal(signal.SIGTERM, shutdown_handler)  # kill

    try:
        connected = agent.connect(args.channel, args.password)
        if not connected:
            print("Failed to connect")
            return

        active_agents = agent.get_active_agents()
        print(f"Active agents are: {active_agents.data}")

        agent.send_message(f"Hi, I am {args.agent_name}")
        agent.receive_async(PrintHandler(agent, wake_event))

        # wait until EXIT_COMMAND, Ctrl+C
        while not wake_event.wait(timeout=2):
            pass

    finally:
        agent.disconnect()
        print("Agent disconnected.")


if __name__ == "__main__":
    main()
