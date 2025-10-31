import os
import subprocess
import time
import socket
import json
import shutil
from pathlib import Path
import pytest

ROOT = Path(__file__).resolve().parents[2]
JAVA_AGENT_DIR = ROOT / 'agents' / 'java-agent'
GRADLEW = ROOT / 'gradlew.bat' if os.name == 'nt' else ROOT / 'gradlew'


def find_jar():
    # common build output
    candidates = [
        JAVA_AGENT_DIR / 'build' / 'libs',
        ROOT / 'agents' / 'build' / 'libs'
    ]
    for d in candidates:
        if d.exists():
            for f in d.iterdir():
                if f.suffix == '.jar':
                    return str(f)
    return None


@pytest.mark.integration
def test_java_agent_connect_by_channel_id():
    """
    Integration test for the Java agent:
    - TCP/UDP server support has been removed from the Java agent
    - This test is now skipped as the local TCP control server no longer exists
    - Use AgentConnection API directly in application code instead
    
    The test previously started an agent process with a local TCP control server
    and sent commands like connect, udpPush, udpPull, disconnect.
    
    Since TCP/UDP server functionality has been removed, this test is no longer applicable.
    """
    pytest.skip('TCP/UDP server support has been removed from Java agent; test no longer applicable')

