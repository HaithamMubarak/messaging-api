# Messaging Agents

Agents are client-side programs that connect to the Messaging API service.  
They authenticate with **channelName + channelPassword**, derive a secure AES key, and exchange encrypted events.

---

## 🌐 [Web Agent](web-agent/README.md)
1. Open `/messaging-api/web-agent/index.html` in your browser.  
2. Enter: channel name, password, nickname.  
3. Click **Connect** → start messaging.  

- Multiple agents (Web/Java/Python) joining the same channel can securely exchange messages.  

---

## ☕ [Java Agent](java-agent/README.md)
- Connects with channel credentials.  
- Derives channel secret (AES-CTR).  
- Encrypts/decrypts messages.  
- Uses **Logback** for logging.  

### Code Snippet
```java
String apiUrl = "https://hmdevonline.com/messaging-api/origin-service";

AgentConnection agentConnection = new AgentConnection(apiUrl, "java-agent-001");
try {
    agentConnection.connect("system001", "12345678");
    boolean sendMessageResult = agentConnection.sendMessage("Hello, I am a java-agent");
} finally {
    agentConnection.disconnect();
}
```

---

## 🐍 [Python Agent](python-agent/README.md)
- Lightweight scripting client.  
- Connects using channel credentials.  
- AES-CTR encryption.  

### Code Snippet
```python
agent = AgentConnection("https://hmdevonline.com/messaging-api/origin-service", "python-agent-001")

try:
    connected = agent.connect("system001", "python-agent-001")
    if not connected:
        print("Failed to connect")
        return

    agent.send_message(f"Hi, I am python-agent-001")
finally:
    agent.disconnect()
```
