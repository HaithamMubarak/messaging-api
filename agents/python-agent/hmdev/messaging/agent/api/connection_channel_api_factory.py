import re
from hmdev.messaging.agent.api.http.http_channel_api import HTTPChannelApi


class ConnectionChannelApiFactory:
    @staticmethod
    def get_connection_api(remote_url: str) -> HTTPChannelApi:
        if re.match(r"^https?://", remote_url):
            return HTTPChannelApi(remote_url)
        else:
            raise RuntimeError("Connection channel descriptor is not supported")
