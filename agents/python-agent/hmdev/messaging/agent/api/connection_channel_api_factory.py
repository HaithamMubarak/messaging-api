import re
from typing import Optional
from hmdev.messaging.agent.api.impl.messaging_channel_api import MessagingChannelApi


class ConnectionChannelApiFactory:
    @staticmethod
    def get_connection_api(remote_url: str, developer_api_key: Optional[str] = None) -> MessagingChannelApi:
        if re.match(r"^https?://", remote_url):
            return MessagingChannelApi(remote_url, developer_api_key=developer_api_key)
        else:
            raise RuntimeError("Connection channel descriptor is not supported")
