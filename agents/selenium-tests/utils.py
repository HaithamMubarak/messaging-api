import subprocess
import os
import signal
import time
import shlex
import psutil


def start_process(cmd, cwd=None, env=None):
    """Start a subprocess and return subprocess.Popen instance."""
    if isinstance(cmd, str):
        cmd = shlex.split(cmd)
    proc = subprocess.Popen(cmd, cwd=cwd, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return proc


def kill_process(proc):
    try:
        proc.terminate()
        proc.wait(timeout=3)
    except Exception:
        try:
            proc.kill()
        except Exception:
            pass

