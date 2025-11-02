# Web Agent 🌐

The **Web Agent** is a browser-based interface for the Messaging API.  
It allows testing and quick interaction with channels directly from HTML/JS.

## Features
- Connect with **channel name + password**.
- Send and receive messages in a chat-like UI.
- Messages are encrypted using the derived **channel secret**.
- Built with **jQuery + Bootstrap**.

## Usage
1. Open `index.html` in your browser.
2. Enter:
   - Channel name  
   - Channel password  
   - Nickname  
3. Click **Connect** and start messaging.

## Example
- Agent1 opens the web client, joins `channelX` with password `secret`.  
- Agent2 (web/Java/Python) joins the same channel with same credentials.  
- They can now exchange encrypted messages via the **messaging-service**.
