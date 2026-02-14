# 🎴 Red or Black – Real-Time Card Game (Socket.io + Redis + RabbitMQ)

A real-time multiplayer **Red or Black card game** where players predict whether the next card drawn will be **Red** or **Black**.

This project demonstrates real-time backend development using **Socket.io**, caching/state management using **Redis**, asynchronous processing using **RabbitMQ**, and persistent storage using **MySQL**.  
It also includes a separate **Admin/Wallet Service** for user validation and credit/debit operations.

---

## 🚀 Live Deployment

- **Admin Service (Wallet API):** https://red-black-admin-service.onrender.com  
- **Game Service (Socket.io Server):** `<ADD_GAME_SERVICE_RENDER_URL_HERE>`

---

## 📌 Project Structure

```bash
red-or-black-game/
│
├── admin-service/         # User validation + credit/debit APIs
├── game-service/          # Real-time Socket.io game engine
└── README.md
````

---

## ⚙️ Tech Stack

* Node.js + TypeScript
* Express.js
* Socket.io
* Redis
* RabbitMQ
* MySQL
* Docker (local development)
* Render (deployment)

---

## 🧩 Services

### 1) Admin Service (User / Wallet Service)

Handles:

* user validation via token
* user details API
* credit / debit operations

Folder: `admin-service`

---

### 2) Game Service (Real-Time Engine)

Handles:

* socket connections
* infinite lobby game rounds
* game logic (Red / Black prediction)
* card outcome generation
* credit/debit integration (Admin Service API)
* Redis state management
* RabbitMQ event publishing
* MySQL storage for game/round records

Folder: `game-service`

---

## 🎮 Game Flow

1. Player connects to the Socket.io game server
2. Game server validates the player using Admin Service
3. Player selects Red/Black for the current round
4. Round timer ends and server generates the next card color
5. Server evaluates player selections and updates balance (credit/debit)
6. Results are broadcast to all players in real-time
7. Next round starts automatically (infinite lobby)

---

## 🏃 Local Setup

### 1) Clone Repository

```bash
git clone https://github.com/Jeevanguru/RedOrBlack
cd red-or-black-game
```

---

### 2) Start Redis & RabbitMQ using Docker

```bash
docker run -d --name redis -p 6379:6379 redis
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

RabbitMQ Dashboard:

```
http://localhost:15672
username: guest
password: guest
```

---

### 3) Run Admin Service

```bash
cd admin-service
npm install
npm start
```

Runs at:

```
http://localhost:5800
```

---

### 4) Run Game Service

```bash
cd ../game-service
npm install
npm start
```

Runs at:

```
http://localhost:4000
```

---

## 📌 Deployment Notes

This project is deployed using:

* **Render** for Node.js backend hosting
* **Upstash Redis** (cloud Redis)
* **CloudAMQP** (RabbitMQ hosting)
* **MySQL Cloud Provider** (Railway / PlanetScale)

---

## 👨‍💻 Author

**Jeevan (solve)**
Backend Developer | Real-Time Multiplayer Systems
