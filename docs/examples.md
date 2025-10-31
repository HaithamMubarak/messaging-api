# Messaging API Examples

This document provides full examples of **service requests and responses** for the Messaging API.

---

## 🔌 Connect

**Request:**
```bash
curl 'https://hmdevonline.com/messaging-platform/api/v1/messaging-service/connect'   --data-raw '{
    "channelName":"system001",
    "channelPassword":"25d55ad283aa400af464c76d713c07ad",
    "agentName":"web-agent-001",
    "agentContext":{
      "agentType":"WEB-AGENT",
      "descriptor":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0"
    }
  }'
```

**Response:**
```json
{
  "status": "ok",
  "message": "Success",
  "data": {
    "channelId": "97ccdac593b8b0b3e39cd7825008eb612743d075",
    "sessionId": "da44fb94d3d04833a8c5755c791dfb84",
    "role": null,
    "date": 1759472687154
  }
}
```

---

## 👥 List Active Agents

**Request:**
```bash
curl 'https://hmdevonline.com/messaging-platform/api/v1/messaging-service/list-agents'   --data-raw '{"session":"042e84ca3232416f9eaecc3818fd67be"}'
```

**Response:**
```json
{
  "status": "ok",
  "message": "Success",
  "data": [
    {
      "agentName": "web-agent-001",
      "date": 1759472711724,
      "agentContext": {
        "agentType": "WEB-AGENT",
        "descriptor": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0",
        "ip_address": "77.91.175.9"
      }
    },
    {
      "agentName": "web-agent-002",
      "date": 1759472701422,
      "agentContext": {
        "agentType": "WEB-AGENT",
        "descriptor": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0",
        "ip_address": "77.91.175.9"
      }
    }
  ]
}
```

---

## 📥 Receive Messages

**Request:**
```bash
curl 'https://hmdevonline.com/messaging-platform/api/v1/messaging-service/receive'   --data-raw '{"session":"da44fb94d3d04833a8c5755c791dfb84","offsetRange":"3-22"}'
```

**Response:**
```json
{
  "status": "ok",
  "message": "Success",
  "data": {
    "updateLength": 1,
    "events": [
      {
        "type": "chat-text",
        "encrypted": true,
        "content": {
          "cipher": "UAM8dkFs32hyQg==",
          "hash": "444bcb3a3fcf8389296c49467f27e1d6"
        },
        "from": "web-agent-001s",
        "date": 1759472704944
      }
    ]
  }
}
```

---

## 📤 Send Event

**Request:**
```bash
curl 'https://hmdevonline.com/messaging-platform/api/v1/messaging-service/event'   --data-raw '{
    "type":"chat-text",
    "to":".*",
    "encrypted":true,
    "content":{
      "cipher":"mAOcVDds32g9Lg==",
      "hash":"c1a5298f939e87e8f962a5edfc206918"
    },
    "session":"da44fb94d3d04833a8c5755c791dfb84"
  }'
```

**Response:**
```json
{"status":"ok","message":"Success","data":null}
```

---

## ❌ Disconnect

**Request:**
```bash
curl 'https://hmdevonline.com/messaging-platform/api/v1/messaging-service/disconnect'   --data-raw '{"session":"da44fb94d3d04833a8c5755c791dfb84"}'
```

**Response:**
```json
{"status":"ok","message":"Success","data":null}
```
