# GameVerse Nexus - Project Summary & Developer Guide

**Version:** 4.2 (Neural Link Enabled)
**Status:** Active Development

## 1. Project Overview
GameVerse Nexus is a high-performance, futuristic gaming platform that combines a **Spring Boot** backend with a cutting-edge **React (Vite)** frontend. It features 3D visualizations, real-time hand tracking ("Neural Link"), dynamic themes, and a competitive ranking system.

## 2. Technology Stack

### Backend (Spring Boot)
- **Language:** Java 17
- **Framework:** Spring Boot 3.2.3
- **Database:** MySQL (`gameverse_db`)
- **Security:** Spring Security (Basic Auth / JWT structure ready)
- **Build Tool:** Maven

### Frontend (React)
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS + Custom Design Tokens
- **Animations:** GSAP (Greensock), Framer Motion
- **3D Graphics:** Three.js, @react-three/fiber, @react-three/drei
- **Data Viz:** Recharts (Radar, Area, Pie, Radial Charts)
- **AI/ML:** TensorFlow.js + Handpose (Gesture Control)
- **Icons:** Lucide React

## 3. Setup Instructions

### Prerequisites
- JDK 17+
- Node.js 18+
- MySQL Server

### Database Setup
1.  Ensure MySQL is running on port `3306`.
2.  Create database: `CREATE DATABASE gameverse_db;` (Optional, app creates it automatically).
3.  **Credentials:**
    - User: `root`
    - Pass: `Root@123`
    - *Config location:* [backend/src/main/resources/application.properties](file:///c:/Users/kshit/Desktop/gaming%20site/backend/src/main/resources/application.properties)

### Backend Launch
```bash
cd backend
mvn spring-boot:run
```
*Server runs on: `http://localhost:8080`*

### Frontend Launch
```bash
cd frontend
npm install
npm run dev
```
*Client runs on: `http://localhost:5173`*

---

## 4. API Documentation

### Authentication (`/api/auth`)
- **POST** `/signup`
    - Body: `{ "username": "...", "password": "...", "email": "..." }`
    - Returns: User ID & Success Message.
- **POST** `/login`
    - Body: `{ "username": "...", "password": "..." }`
    - Returns: User info (Mock JWT behavior).

### Games & Stats (`/api/games`)
- **GET** `/` - List all available games.
- **POST** `/init` - Seem database with default games (Cyberpunk Arena, etc.).
- **POST** `/submit`
    - Body: `{ "username": "...", "game": "SNAKE", "score": 1500, "result": "WIN", "duration": 300 }`
    - **Logic:** Updates XP, Rank Badge (Bronze -> Diamond), Snake High Score, and Playtime.

### Users (`/api/users`)
- **GET** `/{username}/stats` - Get full profile (Wins, Loss, K/D, Bio, Rank).
- **PUT** `/{userId}/bio` - Update user biography.

---

## 5. Key Features & Components

### 🧠 Neural Link (Hand Tracking)
- **Component:** [HandControlOverlay.jsx](file:///c:/Users/kshit/Desktop/gaming%20site/frontend/src/components/HandControlOverlay.jsx)
- **Tech:** TensorFlow.js `handpose` model.
- **Functionality:**
    - **Virtual Cursor:** Follows index finger index `[8]`.
    - **Click:** Pinch gesture (Thumb `[4]` + Index `[8]` distance < 30px).
    - **Scroll:** Move hand to top/bottom 10% of screen.
- **Activation:** Toggle via "Crosshair" icon in Dashboard sidebar.

### 💎 Interactive Dashboard ([Dashboard.jsx](file:///c:/Users/kshit/Desktop/gaming%20site/frontend/src/pages/Dashboard.jsx))
- **3D Crystal:** React Three Fiber mesh that reacts to hover/mouse interaction.
- **Charts:**
    - **Win/Loss:** Pie Chart.
    - **Skill Graph:** Radar Chart (Tactics, Reflexes, etc.).
    - **Playtime:** Radial Bar Chart.
    - **Trend:** Area Chart (Last 10 matches).
- **Audio:** Background Phonk music + SFX on hover/click ([AudioContext.jsx](file:///c:/Users/kshit/Desktop/gaming%20site/frontend/src/context/AudioContext.jsx)).

### 🎨 Dynamic Theme System ([ThemeContext.jsx](file:///c:/Users/kshit/Desktop/gaming%20site/frontend/src/context/ThemeContext.jsx))
- **Themes:** CYBER, MIDAS, OLYMPUS.
- **Mechanism:** Updates CSS Variables (`--primary`, `--bg-core`) globally on the `document.documentElement`.
- **Switcher:** Palette icon in Sidebar.

---

## 6. Project Structure

```text
root/
├── backend/
│   ├── src/main/java/com/example/demo/
│   │   ├── controller/   # API Endpoints
│   │   ├── model/        # JPA Entities (User, Game, Match)
│   │   ├── repository/   # data Access Layer
│   │   └── service/      # Business Logic
│   └── pom.xml           # Backend Dependencies
│
└── frontend/
    ├── src/
    │   ├── components/   # Reusable UI (HandControlOverlay, Navbar)
    │   ├── context/      # Global State (Theme, Audio)
    │   ├── pages/        # Route Views (Dashboard, Login, Games)
    │   ├── App.jsx       # Routing & Context Providers
    │   └── main.jsx      # Entry Point
    └── package.json      # Frontend Dependencies
```

## 7. Troubleshooting
- **Login fails (403):** Check [SecurityConfig.java](file:///c:/Users/kshit/Desktop/gaming%20site/backend/src/main/java/com/example/demo/config/SecurityConfig.java). Ensure `/api/auth/**` is permitted.
- **Hand Tracking lag:** Ensure WebGL is enabled in browser. Requires decent GPU.
- **Database connection error:** Verify MySQL is running and password matches [application.properties](file:///c:/Users/kshit/Desktop/gaming%20site/backend/src/main/resources/application.properties).

---
*Generated by Antigravity AI*