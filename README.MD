# GameVerse Nexus - Project Summary & Developer Guide

**Version:** 5.0 (Multiplayer Ready)
**Status:** Production Ready 🚀

## 1. Project Overview
GameVerse Nexus is a high-performance, futuristic gaming platform that combines a **Spring Boot** backend with a cutting-edge **React (Vite)** frontend. Features include 3D visualizations, real-time hand tracking ("Neural Link"), dynamic themes, competitive ranking, and **multiplayer games**.

## 2. Technology Stack

### Backend (Spring Boot)
- **Language:** Java 17
- **Framework:** Spring Boot 3.2.3
- **Database:** PostgreSQL (Supabase)
- **Security:** Spring Security (CORS + CSRF protection)
- **Build Tool:** Maven
- **Deployment:** Render (Docker)

### Frontend (React)
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS + Custom Design Tokens
- **Animations:** GSAP (Greensock), Framer Motion
- **3D Graphics:** Three.js, @react-three/fiber, @react-three/drei
- **Data Viz:** Recharts (Radar, Area, Pie, Radial Charts)
- **AI/ML:** TensorFlow.js + Handpose (Gesture Control)
- **Icons:** Lucide React
- **Deployment:** Vercel

## 3. Setup Instructions

### Prerequisites
- JDK 17+
- Node.js 18+
- PostgreSQL database (or Supabase account)

### Database Setup (Supabase)
1. Create a project at [supabase.com](https://supabase.com)
2. Note your database credentials from Settings → Database
3. Tables are auto-created by Hibernate on first run

### Environment Variables

#### Backend (`backend/src/main/resources/application.properties`)
```properties
spring.datasource.url=jdbc:postgresql://YOUR_HOST:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
app.cors.allowed-origins=http://localhost:5173,https://your-vercel-app.vercel.app
```

#### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8080
# For production: VITE_API_URL=https://your-render-backend.onrender.com
```

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

## 4. Deployment

### Backend → Render
1. Push code to GitHub
2. Create new **Web Service** on Render
3. Connect your repository, select `backend` directory
4. Build Command: (auto-detected from Dockerfile)
5. Set environment variables:
   - `SPRING_DATASOURCE_URL`: Your Supabase PostgreSQL URL
   - `SPRING_DATASOURCE_USERNAME`: `postgres`
   - `SPRING_DATASOURCE_PASSWORD`: Your Supabase password
   - `CORS_ORIGINS`: Your Vercel frontend URL

### Frontend → Vercel
1. Push code to GitHub
2. Import project on Vercel
3. Set root directory to `frontend`
4. Set environment variable:
   - `VITE_API_URL`: Your Render backend URL
5. Deploy!

---

## 5. API Documentation

### Root (`/`)
- **GET** `/` - Health check, returns service info

### Authentication (`/api/auth`)
- **POST** `/signup` - Register new user
- **POST** `/login` - Login user

### Games & Stats (`/api/games`)
- **GET** `/` - List all available games
- **POST** `/submit` - Submit game result (score, wins, etc.)

### Users (`/api/users`)
- **GET** `/{username}/stats` - Get full profile
- **PUT** `/{userId}/bio` - Update biography

---

## 6. Available Games

### Single Player
| Game | Description |
|------|-------------|
| **Snake Protocol** | Classic snake with high score tracking |
| **Tic-Tac-Toe Siege** | Play against AI |

### Multiplayer
| Game | Description |
|------|-------------|
| **Tactical Grid** | 2-player Tic-Tac-Toe with room codes |
| **Gravity Drop** | Connect Four with animated drops |
| **Neon Pong** | Real-time paddle combat (W/S + ↑/↓) |

---

## 7. Project Structure

```text
root/
├── backend/
│   ├── src/main/java/com/example/demo/
│   │   ├── controller/   # API Endpoints
│   │   ├── config/       # Security & CORS
│   │   ├── model/        # JPA Entities
│   │   ├── repository/   # Data Access Layer
│   │   └── service/      # Business Logic
│   ├── Dockerfile        # Render deployment
│   ├── render.yaml       # Render config
│   └── pom.xml           # Maven dependencies
│
└── frontend/
    ├── src/
    │   ├── api.js        # Axios configuration
    │   ├── components/   # Reusable UI
    │   ├── context/      # Global State (Theme, Audio)
    │   ├── pages/        # Route Views
    │   └── App.jsx       # Routing
    ├── vercel.json       # Vercel config
    └── package.json      # Dependencies
```

## 8. Troubleshooting
- **CORS errors:** Ensure `CORS_ORIGINS` includes your frontend URL
- **Database connection:** Verify Supabase credentials and IP whitelist
- **Build fails:** Run `mvn clean install` locally first
- **Frontend 404s on refresh:** Vercel rewrites handle this via `vercel.json`

---
*Built with ❤️ by GameVerse Team*