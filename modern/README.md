# Modern Banking App

A modernized version of the Legacy Banking App, built with **Spring Boot 3** (backend) and **React 18 + Material UI** (frontend). It connects to the same `legacybank.db` SQLite database — no data migration required.

![CI](https://github.com/ceozenti/ibmbobcheck/actions/workflows/ci.yml/badge.svg?branch=modernization)

---

## Architecture

```
modern/
├── backend/        Spring Boot 3 (Java 21) — REST API, JWT Auth, Spring Data JPA
└── frontend/       React 18 + Vite + Material UI — SPA
```

Both the legacy app and the modern app read/write the same `legacybank.db` (not concurrently during the demo).

| Component | Technology |
|-----------|-----------|
| Backend   | Spring Boot 3.2, Java 21, Spring Security + JWT, Spring Data JPA |
| Database  | SQLite (existing `legacybank.db`) via xerial sqlite-jdbc + Hibernate SQLite dialect |
| Frontend  | React 18, Vite, Material UI (MUI) v6, React Router v6, Axios |
| DevOps    | Docker Compose (local dev), GitHub Actions CI |

---

## Prerequisites

| Tool | Version |
|------|---------|
| JDK  | 21+     |
| Maven | 3.9+   |
| Node | 20+     |
| Docker | (optional, for Docker Compose) |

---

## Quick Start

### Option A — Docker Compose (recommended)

```bash
# From the repository root:
docker compose up
```

- Backend: http://localhost:8080
- Frontend: http://localhost:5173

### Option B — Manual

**Backend:**
```bash
cd modern/backend
mvn spring-boot:run
```

**Frontend (in a separate terminal):**
```bash
cd modern/frontend
npm install
npm run dev
```

Then open http://localhost:5173.

---

## Login Credentials

| Field    | Value      |
|----------|-----------|
| Username | `admin`    |
| Password | `admin123` |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET  | `/api/health` | Health check |
| POST | `/api/auth/login` | Login → JWT |
| GET  | `/api/customers/{id}` | Customer by ID |
| GET  | `/api/customers?accountNumber=` | Customer by account |
| GET  | `/api/accounts/{accountNumber}` | Account details |
| POST | `/api/transactions/deposit` | Deposit |
| POST | `/api/transactions/withdrawal` | Withdrawal |
| POST | `/api/transactions/transfer` | Fund transfer |
| GET  | `/api/transactions/history/{accountNumber}` | Transaction history |

All endpoints except `/api/health` and `/api/auth/**` require `Authorization: Bearer <token>`.

---

## Running Tests

```bash
# Backend unit + integration tests
cd modern/backend
mvn test

# Frontend build check
cd modern/frontend
npm run build
```

---

## Guardrails

- Never modifies `src/`, `database/`, `pom.xml`, `legacybank.db`, `run.bat`, or `run.command`.
- `spring.jpa.hibernate.ddl-auto=validate` — schema never altered.
- Passwords remain plain-text (demo only).

---

## Legacy App

See the root [`README.md`](../README.md) for instructions on running the original Java Swing application.
