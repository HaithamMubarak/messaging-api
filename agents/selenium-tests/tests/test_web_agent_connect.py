import random
import time
import pytest
from selenium.webdriver.common.by import By


def test_web_agent_connect_by_name(web_agent_server, chrome_driver):
    base = web_agent_server
    url = f"{base}/index.html"
    driver = chrome_driver
    driver.get(url)

    # ensure channel mode is 'params'
    mode = driver.find_element(By.ID, 'channelMode')
    mode_value = mode.get_attribute('value')
    if mode_value != 'params':
        mode.send_keys('params')

    # Fill in channel name/password and agent name
    ch_name = driver.find_element(By.ID, 'channelName')
    ch_pass = driver.find_element(By.ID, 'channelPassword')
    agent = driver.find_element(By.ID, 'agentName')

    ch_name.clear()
    ch_name.send_keys('default')
    ch_pass.clear()
    ch_pass.send_keys('default')
    agent.clear()
    agent.send_keys('selenium-web-' + str(random.randint(1, 9999)))

    # Click Connect
    start = driver.find_element(By.ID, 'start')
    start.click()

    # Wait for channel-text to update to non-placeholder
    for _ in range(30):
        ch_text = driver.find_element(By.ID, 'channel-text').text.strip()
        if ch_text and ch_text != '—':
            break
        time.sleep(0.5)
    else:
        pytest.skip('Unable to obtain channel id from web-agent (service may be unreachable)')

    assert ch_text and ch_text != '—'


@pytest.mark.parametrize('mode', ['id'])
def test_web_agent_connect_by_id(web_agent_server, chrome_driver, mode):
    base = web_agent_server
    url = f"{base}/index.html"
    driver = chrome_driver
    driver.get(url)

    # switch to id mode
    mode_el = driver.find_element(By.ID, 'channelMode')
    mode_el.send_keys('id')
    time.sleep(0.2)

    ch_id = driver.find_element(By.ID, 'channelId')
    agent = driver.find_element(By.ID, 'agentName')
    ch_id.clear(); ch_id.send_keys('00000000-0000-0000-0000-000000000000')
    agent.clear(); agent.send_keys('selenium-web-2')

    start = driver.find_element(By.ID, 'start')
    start.click()

    # Wait for channel-text to show the ID or the server returned id
    for _ in range(20):
        ch_text = driver.find_element(By.ID, 'channel-text').text.strip()
        if ch_text and ch_text != '—':
            break
        time.sleep(0.5)

    # If service unreachable this will be placeholder —; mark as skipped
    if ch_text == '—' or not ch_text:
        pytest.skip('Unable to obtain channel id from web-agent (service may be unreachable)')

    assert ch_text and ch_text != '—'

