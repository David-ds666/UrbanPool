# 10 — Chat with Driver (Real-time Communication)

## What is it?
A real-time chat between the passenger and their driver, accessible from the sidebar during an active ride. It uses **WebSockets** (Socket.io) so messages appear instantly without page refresh.

## How it's different from the AI chatbot
| Feature | AI Chatbot | Chat with Driver |
|---------|-----------|-----------------|
| Who answers | Google Gemini AI | The driver (simulated) |
| When available | Always | Only during active ride |
| Location | Bottom-right bubble | Inside the sidebar |
| Technology | REST API + Gemini | Socket.io WebSockets |

## How it works

### Connection
1. User has an active booking (sidebar shows "Active Ride")
2. User clicks "Chat with Driver" in the sidebar
3. Frontend connects to the Socket.io server: `io('http://localhost:5001')`
4. Emits `join_chat` with the booking ID as the room name
5. Both driver and passenger are now in the same "room"

### Sending a message
1. User types a message and presses Enter
2. Frontend emits: `socket.emit('send_message', { rideId, senderId, text })`
3. Backend receives the event, saves the message to MySQL (`Messages` table)
4. Backend broadcasts to the room: `io.to(rideId).emit('receive_message', message)`
5. Passenger and driver both receive the message instantly

### Driver typing indicator
- When driver is typing, a `driver_typing` event is emitted
- Frontend shows "Driver is typing..." text
- When they stop, `driver_typing_stop` is emitted and the indicator disappears

### Loading old messages
When chat opens, it first loads all previous messages:
```
GET /api/chat/:rideId → returns array of past messages
```

## WebSockets vs REST API — what's the difference?

### REST API (normal HTTP)
- Client requests → Server responds → Connection closes
- Like sending a letter: you wait for a reply
- One-way at a time

### WebSocket (Socket.io)
- Connection stays open continuously
- Both server and client can send messages at any time
- Like a phone call: both can talk whenever
- Used for: chat, live location, real-time notifications

## When does the chat disconnect?
- When the sidebar closes
- When the ride is marked complete
- Socket is disconnected: `socket.disconnect()`
- This prevents memory leaks

## Key files
- `src/components/common/Sidebar/Sidebar.jsx` — chat UI and socket logic
- `backend/server.js` → `send_message`, `join_chat`, `receive_message` socket events
- `backend/server.js` → `GET /api/chat/:rideId`, messages stored in `Messages` table
