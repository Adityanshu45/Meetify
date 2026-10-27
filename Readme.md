# 📹 Meetify — Real-Time Video Conferencing Application

**Live Demo:** https://meetify-azure.vercel.app/

Meetify is a **full-stack, real-time video conferencing application** built with the MERN stack, WebRTC, and Socket.IO.
The project focuses strongly on **seamless peer-to-peer video communication**, **automated meeting lifecycle management**, and a **clean, dark-themed user interface**.

---

## 🧭 Table of Contents

- [Overview](#-overview)
- [Demo](#-demo)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Real-Time & Automation Workflow](#-real-time--automation-workflow)
- [API & Socket Events](#-api--socket-events)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)
- [Future Improvements](#-future-improvements)
- [What I Learned](#-what-i-learned)
- [Author](#-author)

---

## 📖 Overview

Meetify helps users instantly connect via high-quality video calls or schedule meetings for later.
The system features secure cross-domain authentication and an automated backend that intelligently handles meeting statuses (Scheduled, Live, Completed, Cancelled) without manual intervention.

The project combines:

- Practical **real-time peer-to-peer WebRTC media streaming**
- Real-time signaling and chat via **Socket.IO**
- Secure JWT authentication with HttpOnly cookies
- Automated database cleanup using Cron Jobs

---

## 🎥 Demo

🔗 **Live Application:** https://meetify-azure.vercel.app/

Users can:

- Start an instant meeting with a unique 18-character secure room code.
- Schedule future meetings and track them in a dedicated dashboard.
- Chat in real-time during live video calls.
- View meeting history, including total call duration and past participants.

---

## ✨ Features

- 📹 **HD Video & Audio Calling** (WebRTC)
- 💬 **Real-Time Group Chat** (Socket.IO)
- 📅 **Meeting Scheduling & Dashboard**
- 🤖 **Automated Lifecycle Management** (Cron jobs for zombie/expired meetings)
- 🔐 **JWT Authentication** (Access & Refresh Tokens with cross-domain support)
- 🎨 **Responsive Dark-Theme UI** (CSS Modules)
- 🌐 **Deployed on Vercel (Frontend) & Render (Backend)**

---

## 🏗️ System Architecture

User  
↓  
React Frontend (Vite)  
↓  
Node.js & Express API (REST)  
↓  
Socket.IO (Signaling Server) ↔ WebRTC (Peer-to-Peer Media)  
↓  
MongoDB Atlas (Database)

---

## 🧰 Tech Stack

| Layer      | Technology                                  |
| ---------- | ------------------------------------------- |
| Frontend   | React (Vite), JavaScript, HTML, CSS Modules |
| Backend    | Node.js, Express.js                         |
| Real-Time  | WebRTC, Socket.IO                           |
| Database   | MongoDB, Mongoose                           |
| Auth & Sec | JWT, bcrypt, Cookie-Parser, CORS            |
| Automation | node-cron                                   |
| Deployment | Vercel (Frontend), Render (Backend)         |

---

## 🔄 Real-Time & Automation Workflow

### WebRTC Signaling

1. Client joins a room and emits `join-room` via Socket.IO.
2. Server broadcasts `user-connected` to existing participants.
3. WebRTC Offer/Answer and ICE candidates are exchanged through Socket.IO.
4. Peer-to-peer connection is established for video/audio streams.

### Automated Cron Jobs

Running daily at 3:00 AM to optimize database performance:

- **Zombie Sweeper:** Scans for meetings stuck in "live" status for > 12 hours and marks them as "completed".
- **Schedule Canceller:** Identifies "scheduled" meetings older than 24 hours and marks them as "cancelled".

---

## 🔌 API & Socket Events

### Key REST Endpoints

**Get Scheduled Meetings**

```http
GET /api/meeting/scheduledmeetings?hostId={userId}&limit=10
```

**Get Past Meetings**

```http
GET /api/meeting/pastmeetings?userId={userId}&limit=10
```

### Key Socket Events

- `join-room` / `user-connected`
- `offer` / `answer` / `ice-candidate`
- `chat-message`
- `user-disconnected`

---

## ⚙️ Installation

```bash
git clone https://github.com/Adityanshu45/Meetify
cd Meetify
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file in the **Backend**:

```env
PORT=8080
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

Create a `.env` file in the **Frontend**:

```env
VITE_API_BASE_URL=https://meetify-backend-yourid.onrender.com/api
VITE_SOCKET_URL=https://meetify-backend-yourid.onrender.com
```

_(Note: Ensure you replace the dummy Render URLs above with your actual backend URL)._

---

## 🚀 Usage

- Open the frontend in your browser.
- Register/Login to access the dashboard.
- Allow Camera and Microphone permissions.
- Click "New Meeting" to start instantly, or "Schedule" for later.
- Share the unique room code with others to join.

---

## 🏗️ Future Improvements

- [ ] In-meeting recording feature
- [ ] Interactive whiteboard

---

## 📚 What I Learned

- Implementing WebRTC for peer-to-peer media streaming.
- Handling real-time bi-directional events with Socket.IO.
- Managing strict cross-domain cookies (`secure: true`, `sameSite: "none"`) between Vercel and Render.
- Automating database tasks using `node-cron`.
- Solving React single-page application (SPA) routing issues on Vercel using `vercel.json` rewrites.

---

## 👤 Author

**Aditya Chaudhary**  
BN College of Engineering and Technology, Lucknow  
CSE (AI & ML)

- 📧 Email: adityanshu45@gmail.com
- 🌐 GitHub: https://github.com/Adityanshu45
