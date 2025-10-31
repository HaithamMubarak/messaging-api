import argparse
import logging
import signal
import threading
import time

# TCP/UDP server support has been removed

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")


class Agent:
    """
    Minimal agent entrypoint (TCP/UDP server support removed).
    Use AgentConnection API directly in your application code.
    """

    def __init__(self):
        self._stop_event = threading.Event()

    def stop(self):
        logging.info("Stopping Agent")
        self._stop_event.set()

    def wait_for_stop(self):
        # simple loop to keep process alive until signal
        while not self._stop_event.wait(timeout=1.0):
            time.sleep(0.01)


def main():
    parser = argparse.ArgumentParser(description="Python Agent - TCP/UDP server support removed")
    args = parser.parse_args()

    logging.info("TCP/UDP server functionality has been removed from Agent service.")
    logging.info("Please use AgentConnection API directly in your application code.")
    logging.info("See examples in agents/examples/python-agent-chat for usage patterns.")

    agent = Agent()

    def _shutdown_handler(signum, frame):
        logging.info("Received shutdown signal (%s), stopping...", signum)
        agent.stop()

    signal.signal(signal.SIGINT, _shutdown_handler)
    signal.signal(signal.SIGTERM, _shutdown_handler)

    try:
        agent.wait_for_stop()
    finally:
        agent.stop()
        logging.info("Agent stopped.")


if __name__ == "__main__":
    main()

