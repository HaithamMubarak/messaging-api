import os
import threading
import http.server
from pathlib import Path
import pytest
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
# WEB_AGENT_DIR should point to the web-agent folder under the repository's agents directory
WEB_AGENT_DIR = ROOT / 'agents' / 'web-agent'


class _WebAgentHandler(http.server.SimpleHTTPRequestHandler):
    """Explicit subclass used to satisfy type checkers when creating the HTTP server."""
    pass


def pytest_addoption(parser):
    """Add a CLI option to show the browser (run non-headless)."""
    # default=True makes the browser visible by default; use --show-browser to explicitly set (keeps API simple)
    parser.addoption("--show-browser", action="store_true", default=True,
                     help="Run browser in visible (non-headless) mode for debugging")


@pytest.fixture(scope='session')
def web_agent_server():
    """Start a simple HTTP server to serve the web-agent static files."""
    os.chdir(WEB_AGENT_DIR)
    # Use an explicit subclass as handler and pass it through Any to satisfy static analyzers
    _handler: Any = _WebAgentHandler
    httpd = http.server.ThreadingHTTPServer(('127.0.0.1', 0), _handler)
    port = httpd.server_address[1]
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    base_url = f'http://127.0.0.1:{port}'
    yield base_url
    httpd.shutdown()
    thread.join(timeout=1)


@pytest.fixture
def chrome_driver(request):
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    # Expect chromedriver on PATH
    opts = Options()

    # Decide whether to run visible or headless: CLI --show-browser takes precedence, then SHOW_BROWSER env var
    show_browser_cli = bool(request.config.getoption("show_browser"))
    env_val = os.getenv('SHOW_BROWSER', '')
    show_browser_env = str(env_val).lower() in ('1', 'true', 'yes', 'on')
    show_browser = show_browser_cli or show_browser_env

    if not show_browser:
        opts.add_argument('--headless=new')
    else:
        # in visible mode, specify a default window size for consistency
        opts.add_argument('--window-size=1400,900')

    opts.add_argument('--no-sandbox')
    opts.add_argument('--disable-dev-shm-usage')
    driver = webdriver.Chrome(options=opts)
    yield driver
    try:
        driver.quit()
    except Exception:
        pass
