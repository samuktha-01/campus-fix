# SmartCampus AI — Intelligent Campus Ticketing and Issue Resolution System

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Language-Python_3.12-3776AB?logo=python)](https://www.python.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_%2B_pgvector-4169E1?logo=postgresql)](https://github.com/pgvector/pgvector)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?logo=tailwindcss)](https://tailwindcss.com)

SmartCampus AI is an enterprise-grade campus ticketing and issue resolution platform. It integrates AI-driven categorization, vector duplicate detection, dynamic priority calculation, strict SLA tracking with automated escalation, and closed-loop student feedback.

---

## Key Highlights

- **AI-Powered Categorization & Routing**: Automatically routes complaints (Hostel, IT, Estate, Sanitation, Academic, Transport) with confidence scoring.
- **pgvector Duplicate Detection**: Prevents ticket clutter by detecting semantically similar complaints and linking them into clusters.
- **Dynamic Priority & SLA Engine**: Computes severity and urgency, calculates deadlines, and flags at-risk issues.
- **Automated Escalation**: Escalates unresolved complaints to Department Heads and Admins upon SLA warning or breach.
- **5 Role-Based Workspaces**:
  1. **Student**: Ticket submission, AI similarity preview, real-time tracking, resolution feedback.
  2. **Staff**: Queue management, status transitions, internal notes.
  3. **Department Head**: Department overview, ticket re-assignment, duplicate merges, escalations.
  4. **Admin**: User RBAC, department & category master config, SLA policy definitions.
  5. **Management**: High-level campus analytics, SLA compliance metrics, departmental resolution trends.
- **Configurable AI Providers**: Supports Google Gemini, OpenAI, or a zero-dependency deterministic Mock Fallback.

---

## Architecture Overview

Detailed architectural diagrams and specifications are available in:
👉 [`docs/architecture.md`](docs/architecture.md)

---

## Project Structure

```
campus-fix/
├── docs/                   # Architectural specs & ER diagrams
├── backend/                # FastAPI application
│   ├── app/
│   │   ├── api/            # API endpoints & dependency injection
│   │   ├── core/           # Config, database, security, logging
│   │   ├── models/         # SQLAlchemy ORM models
│   │   ├── schemas/        # Pydantic validation schemas
│   │   ├── services/       # Business logic layer
│   │   ├── ai/             # AI provider abstraction & prompt engine
│   │   └── workers/        # SLA monitor background worker
│   ├── alembic/            # Database migrations
│   └── tests/              # Test suite
└── frontend/               # React + Vite + TypeScript application
    └── src/
        ├── components/     # UI primitives & layout components
        ├── contexts/       # Auth & Theme state management
        ├── pages/          # Role-based views (Student, Staff, Dept, Admin, Mgmt)
        └── routes/         # Role-guarded route definitions
```

---

## Quickstart Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- PostgreSQL 15+ with `pgvector` (or Docker, or use SQLite fallback for local dev)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```
Swagger UI will be accessible at: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will be accessible at: `http://localhost:5173`

### 3. Docker Compose (All-in-One)
```bash
docker-compose up --build
```
