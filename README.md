# CivicResolve AI 🏛️

**AI-powered Civic Complaint & Resolution Platform with SQL Database Storage & REST Backend**

> A full-stack civic operations platform that allows citizens to report civic issues (potholes, garbage, drainage, water supply, broken streetlights) with AI-powered classification, intelligent department routing, permanent SQL database storage, and real-time ticket tracking.

---

## 🌟 Key Architecture & Features

- 🧠 **AI Complaint Analysis Engine** — Automated issue title generation, category detection, priority scoring, and department assignment.
- 🗄️ **Permanent SQL Database Storage** — PostgreSQL compatible database schema with persistent `complaints` table and unique ticket ID generation (`CR-YYYY-XXXXXX`).
- ⚡ **Node.js & Express REST API** — Clean, modular backend structure with controllers, models, routes, and error handling.
- 📊 **Real-Time Operations Dashboard** — Live metrics and aggregate counts directly calculated from SQL database records.
- 🔍 **Live Citizen Tracking** — Track resolution progress, timestamps, and authority response stages via Ticket ID.
- 🛡️ **Graceful Dual-Mode Storage** — Instant zero-config local persistence out of the box, with direct PostgreSQL connection when `DATABASE_URL` is configured.

---

## 📁 Project Structure

```
civic-resolve-ai/
├── backend/
│   ├── config/
│   │   └── env.ts                  # Environment variables & configuration
│   ├── controllers/
│   │   ├── complaintController.ts  # Input validation, ticket generator, CRUD handlers
│   │   └── dashboardController.ts  # SQL aggregation for dashboard statistics
│   ├── database/
│   │   ├── db.ts                   # PostgreSQL pool connection & schema initializer
│   │   ├── schema.sql              # Clean PostgreSQL table DDL with indexes
│   │   ├── seed.sql                # SQL seed script
│   │   └── seed.ts                 # TypeScript seeding runner
│   ├── models/
│   │   └── complaintModel.ts       # Database queries & types for complaints table
│   ├── routes/
│   │   ├── complaintRoutes.ts      # /api/complaints endpoints
│   │   └── dashboardRoutes.ts      # /api/dashboard endpoints
│   ├── server/
│   │   ├── app.ts                  # Express app, CORS, JSON parsing, error handler
│   │   └── server.ts               # HTTP server entry point (Port 5000)
│   ├── test_api.ts                 # Automated API test suite
│   ├── tsconfig.json               # Backend TypeScript configuration
│   └── .env.example                # Backend environment template
├── src/
│   ├── components/                 # UI components (preserved 100%)
│   ├── pages/                      # Citizen & Authority pages (connected to backend)
│   ├── services/
│   │   ├── aiService.ts            # AI analysis engine
│   │   └── complaintService.ts     # Frontend REST API & SQL client
│   ├── types/                      # TypeScript definitions
│   ├── App.tsx                     # Main router
│   ├── main.tsx                    # React root
│   └── index.css                   # Tailwind styles
├── vite.config.ts                  # Configured with /api proxy to localhost:5000
└── package.json                    # Full-stack dependencies & scripts
```

---

## 🗄️ SQL Database Schema (`complaints` table)

```sql
CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(50) UNIQUE NOT NULL,
    citizen_name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    complaint_title VARCHAR(255) NOT NULL,
    complaint_description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(50) NOT NULL DEFAULT 'REGISTERED',
    location VARCHAR(255) NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    authority VARCHAR(255),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 Getting Started Locally

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables (Optional for Postgres)

Create a `.env` file in the root or in `backend/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/civicresolve
CORS_ORIGIN=http://localhost:5173
```

*(Note: If `DATABASE_URL` is omitted, the backend automatically runs in local persistent SQL mode for instant zero-friction testing!)*

### 3. Run Development Server

```bash
# Starts both frontend (port 5173) and backend (port 5000) concurrently
npm run dev
```

Or run them individually in separate terminals:

```bash
# Terminal 1: Backend Server (Port 5000)
npm run dev:server

# Terminal 2: Frontend Client (Port 5173)
npm run dev:client
```

### 4. Test the API Endpoints

```bash
npm run test:api
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status & database connectivity |
| `POST` | `/api/complaints` | Register a new complaint, generate unique ticket ID & store in SQL |
| `GET` | `/api/complaints` | Retrieve all complaints (supports category/priority/status filters) |
| `GET` | `/api/complaints/:ticket_id` | Get complaint details by Ticket ID |
| `PUT` | `/api/complaints/:ticket_id/status` | Update complaint status (`REGISTERED`, `IN_PROGRESS`, `RESOLVED`, etc.) |
| `DELETE` | `/api/complaints/:ticket_id` | Delete a complaint (Admin utility) |
| `GET` | `/api/dashboard/stats` | Return aggregate counts for the live operations dashboard |

---

## ☁️ Deployment Guide

### A. Deploy Backend & PostgreSQL (e.g. Render / Railway / Supabase / Neon)

1. **Create PostgreSQL Database**:
   - Go to [Neon.tech](https://neon.tech), [Supabase](https://supabase.com), or [Render](https://render.com) and create a free PostgreSQL database.
   - Copy your PostgreSQL connection string (`postgresql://user:password@host/dbname?sslmode=require`).

2. **Deploy Node.js Backend** (e.g. Render / Railway):
   - Connect your GitHub repository.
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Set Environment Variables:
     - `DATABASE_URL`: `[your postgres connection string]`
     - `PORT`: `5000` (or leave default on Render)
     - `CORS_ORIGIN`: `https://your-civicresolve-frontend.vercel.app`

### B. Connect Deployed Frontend (Vercel)

1. Open your Vercel Project Dashboard.
2. Go to **Settings** → **Environment Variables**.
3. Add the variable:
   - `VITE_API_BASE_URL` = `https://your-backend-service.onrender.com` (your deployed backend URL)
4. Redeploy the frontend. Your Vercel frontend will now communicate directly with your live PostgreSQL backend!