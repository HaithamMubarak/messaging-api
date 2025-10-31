# Backwards-compatible alias: old HTTPChannelApi name now refers to the new generic MessagingChannelApi
from hmdev.messaging.agent.api.impl.messaging_channel_api import MessagingChannelApi as _MessagingChannelApi
HTTPChannelApi = _MessagingChannelApi
__all__ = ["HTTPChannelApi"]
