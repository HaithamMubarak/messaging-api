# Python Agent 🐍

The **Python Agent** allows scripting and automation against the Messaging API.

## ✨ Features
- Connects to channels with name + password.
- Derives channel secret using **PBKDF2 / AES CTR** (same as Java/Web).
- Encrypts & decrypts messages consistently with other agents.
- Great for quick tests, bots, or IoT integrations.

---

## ⚙️ Setup
Create a virtual environment and install dependencies:

```bash
python -m venv .venv
. .venv/bin/activate     # Linux / macOS
.venv\Scripts\activate   # Windows PowerShell / CMD

pip install -r requirements.txt
```

---

## 🚀 Run

From the `agents/python-agent` folder:

```bash
# Run by module
python -m hmdev.messaging.agent.main --channel myChannel --password myPassword --agent-name myAgent

# Or by main file path:
python hmdev/messaging/agent/main.py --channel myChannel --password myPassword --agent-name myAgent
```
---

## 📝 Notes
- Works seamlessly with **Web Agent** and **Java Agent**.
- Use a unique `--agent-name` per instance (e.g. `python-agent-001`, `python-agent-002`).
- You can run two agents from different terminals, browsers, or incognito windows to test encrypted communication.
