# 🎴 Red or Black – Real-Time Card Game

A high-performance, real-time multiplayer **Red or Black** card game. Players predict whether the next card drawn will be **Red** or **Black** in an infinite lobby system.

This project showcases a robust distributed architecture using **Socket.io** for real-time communication, **Redis** for state management, **RabbitMQ** for asynchronous event processing, and **MySQL** for persistent storage.

---

## 🚀 Live Deployment

* **Admin Service (Wallet API):** [https://red-black-admin-service.onrender.com](https://red-black-admin-service.onrender.com)
* **Game Service (Socket.io Server):** [https://red-black-game-service.onrender.com/](https://red-black-game-service.onrender.com/)

---

## ⚙️ Tech Stack

| Category | Technology |
| --- | --- |
| **Runtime & Language** | Node.js + TypeScript |
| **Real-Time Engine** | Socket.io |
| **Caching & State** | Redis |
| **Message Broker** | RabbitMQ |
| **Database** | MySQL |
| **Infrastructure** | Docker, Render, Upstash, CloudAMQP |

---

## 🧩 System Architecture

### 1. Admin Service (Wallet & Auth)

Responsible for user management and financial integrity.

* **User Validation:** Verifies players via secure tokens.
* **Wallet Operations:** Handles atomic credit/debit transactions.
* **API:** RESTful endpoints for user metadata.

### 2. Game Service (The Engine)

The core real-time loop managing gameplay logic.

* **Socket Management:** Handles concurrent player connections.
* **Game Logic:** Automated infinite rounds, card generation, and outcome calculation.
* **Event-Driven:** Uses RabbitMQ to decouple game results from database writes.
* **Stateful:** Uses Redis for millisecond-latency access to active round data.

---

## 🎮 Game Flow

1. **Authentication:** Player connects to the Socket.io server with a valid token.
2. **Lobby Join:** Server validates the player via the Admin Service and adds them to the active game.
3. **Prediction:** Player selects **Red** or **Black** before the round timer expires.
4. **Draw:** The server generates a random card; outcomes are evaluated instantly.
5. **Settlement:** Balances are updated via the Wallet API.
6. **Broadcast:** Results are pushed to all connected clients.
7. **Reset:** A new round begins automatically.

---

## 🏃 Local Setup

### 1. Clone & Install

```bash
git clone https://github.com/Jeevanguru/RedOrBlack
cd red-or-black-game

# Install dependencies for both services
cd admin-service && npm install
cd ../game-service && npm install

```

### 2. Infrastructure (Docker)

Ensure Redis and RabbitMQ are running locally:

```bash
# Start Redis
docker run -d --name redis -p 6379:6379 redis

# Start RabbitMQ with Management UI
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

```

> **RabbitMQ UI:** http://localhost:15672 (guest/guest)

### 3. Start Services

Open two terminal windows:

```bash
# Window 1: Admin Service
cd admin-service && npm start

# Window 2: Game Service
cd game-service && npm start

```

---

## 🔌 Socket.IO Client Implementation

To test the connection, use the following configuration in your frontend or a test script:

```javascript
import { io } from "socket.io-client";

const socket = io("https://red-black-game-service.onrender.com", {
  transports: ["websocket"],
  auth: {
    token: "22202607092003", // Sample Test Token
    game_id: "11",           // Sample Game ID
  },
});

socket.on("connect", () => {
  console.log("✅ Connected to Game Server:", socket.id);
});

socket.on("round_start", (data) => {
  console.log("🎲 Round Started:", data);
});

socket.on("round_end", (result) => {
  console.log("🏁 Result:", result);
});

socket.on("connect_error", (err) => {
  console.error("❌ Connection Failed:", err.message);
});

```

---

## 📌 Project Notes

* **Database:** Hosted on Aiven (MySQL).
* **Messaging:** CloudAMQP handles the asynchronous message queue.
* **Cache:** Upstash Redis manages the real-time lobby state.
* **Error Handling:** The server will forcefully disconnect any socket missing required `auth` parameters (`token` and `game_id`).

---

## 👨‍💻 Author

**Jeevan (solve)**
*Backend Developer | Specialized in Real-Time Multiplayer Systems*
---
