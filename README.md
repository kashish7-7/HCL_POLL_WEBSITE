# 📊 PollNow (Live Realtime Polling Tool)

> **HCL GUVI Developer Internship Task Submission**  
> A full-stack, real-time live polling application featuring instant live updates with Redis & WebSockets, MongoDB persistence, and Google OAuth 2.0 authentication.

---

## 🌟 Live Demo & Repository
- **GitHub Repository**: `https://github.com/your-username/hcl-poll-website` *(Replace with your GitHub repo URL)*
- **Live Application**: `https://your-gazette-app.vercel.app` *(Replace with your live deployed URL)*
- **Submission Email**: `devhiring@hclguvi.com`

---

## ⚡ Technical Stack & Architecture

| Layer | Technology Required | Implementation Details |
| :--- | :--- | :--- |
| **Frontend** | **React** | Vite, Tailwind CSS, Old Newspaper Broadside Theme, Rolling Digit Ticker, Web Audio API Click Synthesizer |
| **Backend** | **Go (Gin)** | Gin Web Framework, JWT Token Auth, `bcrypt` Password Hashing, Gorilla WebSockets, Input Validation |
| **Database** | **MongoDB** | MongoDB Driver, Stores Users, Poll Documents, Options, and Immutable Vote Logs |
| **Realtime** | **Redis** | `go-redis/v9`, Atomic Hashes (`HINCRBY`), Voter Sets (`SADD`), Pub/Sub Channel Broadcasts |

### 📐 System Data Flow
```
 [ User Action: Vote ]
         │
         ▼
 ┌────────────────────────────────────────────────────────┐
 │                   Go Gin Backend                       │
 │  1. Validates inputs & checks JWT / Cookie Fingerprint │
 │  2. Checks Redis Set (poll:voters:<id>) for dupes      │
 └───────────────────────┬────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
┌───────────────────────┐     ┌───────────────────────────────────┐
│     Redis Engine      │     │          MongoDB Storage          │
│ 1. Atomic HINCRBY     │     │ (Async audit logging of vote      │
│ 2. Redis Pub/Sub Msg  │     │  documents & total counters for   │
└──────────┬────────────┘     │  permanent historical persistence)│
           │                  └───────────────────────────────────┘
           ▼
┌───────────────────────────────────┐
│     Go WebSocket Broadcast Hub    │
└──────────┬────────────────────────┘
           │ (WS Push)
           ▼
┌───────────────────────────────────┐
│     All Connected React Clients   │
│ 1. Rolling Number Roll Ticker     │
│ 2. Web Audio Mechanical Click     │
└───────────────────────────────────┘
```

---

## 🚀 Key Features

1. **Authentic 19th-Century Newspaper Aesthetic**:
   - Broadside masthead, woodcut border frames, aged parchment paper background (`#F5E6CA`), and classic serif typography.
2. **True Low-Latency Real-Time Sync**:
   - Votes update instantly for all connected viewers across the globe without requiring a page refresh.
3. **Mechanical Live Counter & Telegraph Sound**:
   - Custom rolling digit ticker component that flips numbers smoothly when votes arrive.
   - Built-in Web Audio API sound synthesizer producing vintage mechanical press clicks on vote events (includes a Sound Mute toggle button).
4. **Instant Shareable Poll Links**:
   - One-click copy shareable link (`?poll=<ID>`) to invite audience participation.
5. **Authentication & Editor Dashboard**:
   - User Registration/Login with JWT authentication.
   - Dedicated "Editor's Desk" to publish and retract/delete polls.
6. **Backend Security & Duplicate Vote Prevention**:
   - Strictly validated payload structures (min 2, max 10 options, non-blank text).
   - IP + Session hash fingerprinting via Redis Sets (`SADD`) to prevent vote spam.

---

## 🛠️ Local Development Setup Guide

### Prerequisites
- [Go (1.22+)](https://go.dev/dl/)
- [Node.js (v18+)](https://nodejs.org/) & NPM
- [Docker & Docker Compose](https://www.docker.com/) (or local MongoDB + Redis services)

---

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/hcl-poll-website.git
cd hcl-poll-website
```

---

### Step 2: Start MongoDB & Redis via Docker
```bash
docker-compose up -d
```
This spins up MongoDB on `localhost:27017` and Redis on `localhost:6379`.

---

### Step 3: Run Go Backend Service
```bash
cd backend

# Create .env file from example
cp .env.example .env

# Run Go server
go run cmd/server/main.go
```
The Go Gin server will start listening on `http://localhost:8080`.

---

### Step 4: Run React Frontend
In a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🌐 Free Public Deployment Instructions

### 1. MongoDB Setup (MongoDB Atlas)
1. Sign up for a free M0 cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database named `gazette_polletin`.
3. Obtain your connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/gazette_polletin`.

### 2. Redis Setup (Upstash Redis)
1. Create a free serverless Redis database at [Upstash Redis](https://upstash.com/).
2. Copy the `rediss://...` connection URL.

### 3. Backend Deployment (Render / Railway / Koyeb)
1. Connect your GitHub repository to [Render](https://render.com/).
2. Create a new **Web Service** pointing to the `/backend` directory using the provided `Dockerfile`.
3. Set environment variables:
   - `PORT`: `8080`
   - `MONGO_URI`: *Your MongoDB Atlas URI*
   - `REDIS_URI`: *Your Upstash Redis URL*
   - `JWT_SECRET`: *Your secure secret key*
   - `ENV`: `production`

### 4. Frontend Deployment (Vercel / Netlify)
1. Connect your GitHub repository to [Vercel](https://vercel.com/).
2. Set Root Directory to `frontend`.
3. Set Environment Variable:
   - `VITE_API_URL`: *Your deployed Render backend URL (e.g., `https://gazette-backend.onrender.com`)*
4. Deploy!

---

## 🎥 Submission Video Outline (3–5 Minutes)

When recording your video for `devhiring@hclguvi.com`, follow this breakdown:

1. **Demonstration (1.5 mins)**:
   - Open your deployed live URL side-by-side in two browser windows.
   - Log in as an editor, create a new poll, and copy the share link.
   - Cast a vote in Browser A → show Browser B updating instantly with the rolling counter animation and mechanical click sound without refreshing!
2. **Technical Challenge (1 min)**:
   - *Challenge*: Achieving zero-latency realtime updates while keeping vote counts consistent and preventing duplicate spam.
   - *Solution*: Leveraged Redis atomic hashes (`HINCRBY`) for instantaneous counting paired with Redis Pub/Sub to relay payloads to Go Gorilla WebSockets, backed asynchronously by MongoDB for persistent audit storage.
3. **AI Tools Disclosure (30 sec)**:
   - State clearly which AI tools (e.g. Antigravity / Gemini) were utilized for assistance in architecting the broadsheet CSS layout, Web Audio synthesis, and Go Gin setup, and how you thoroughly verified and understood the underlying Go and Redis codebase.

---

## 📄 License & Credits
Built for the **HCL GUVI Developer Internship Application**.  
Designed & Developed by **Kashish**.
