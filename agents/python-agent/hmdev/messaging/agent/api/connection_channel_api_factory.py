from hmdev.messaging.agent.api.http.http_channel_api import HTTPChannelApi


class ConnectionChannelApiFactory:
    @staticmethod
    def get_connection_api(remote_url: str) -> HTTPChannelApi:
        return HTTPChannelApi(remote_url)