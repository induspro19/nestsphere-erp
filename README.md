# Society Management ERP SaaS Platform - Enterprise Foundation (Phase 1)

This repository contains the production-grade foundation architecture for a multi-tenant Society Management ERP SaaS platform.

## 🚀 Tech Stack

### Backend
- **Node.js & NestJS v10+**: Modular TypeScript server architecture.
- **PostgreSQL & Prisma ORM v5+**: Multi-tenant database schema with soft deletes and audit logging.
- **JWT & Refresh Tokens**: Dual-token authentication with HTTP-only secure cookie support.
- **Redis & BullMQ**: Caching framework and asynchronous job processing queue setup.
- **URI API Versioning**: `/api/v1/` prefix with modular extensibility.
- **Categorized Logging**: Centralized logging system (Application, API, Auth, Security, Error logs).

### Frontend
- **React 18 & Vite**: Fast TypeScript frontend architecture.
- **Tailwind CSS & Glassmorphic Utilities**: Modern CSS variables supporting Light & Dark themes with 16px rounded radius design system.
- **Zustand**: Fast, lightweight state management.
- **shadcn/ui & Lucide Icons**: Premium accessible design components.
- **Axios Client**: Unified API client with automatic JWT token refresh queue.
- **Shell Layout**: Top Header, Collapsible Sidebar, Quick Search Command Palette (Ctrl+K), Notification Panel, User Profile Menu, Theme Switcher, Breadcrumbs, and Footer.

---

## 📁 Project Structure

```
society-erp/
├── backend/                  # NestJS API Server
│   ├── prisma/
│   │   └── schema.prisma     # Production-grade database schema
│   ├── src/
│   │   ├── common/           # Guards, Interceptors, Decorators, Redis, Logger
│   │   ├── modules/          # Core Auth & Infrastructure modules
│   │   └── main.ts           # NestJS Server Entrypoint
│   └── package.json
├── frontend/                 # React + Vite Client
│   ├── src/
│   │   ├── api/              # Axios Client & API Endpoints
│   │   ├── components/       # Layout Shell & Shared UI Components
│   │   ├── hooks/            # Custom Hooks (useAuth, useTheme, usePermission)
│   │   ├── routes/           # Protected Router Configuration
│   │   ├── store/            # Zustand Stores (authStore, themeStore)
│   │   └── styles/           # Tailwind CSS Variables & Glassmorphism
│   └── package.json
├── docker-compose.yml        # PostgreSQL & Redis services
└── README.md
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- Docker Desktop & Docker Compose (or local PostgreSQL & Redis services)

### Step 1: Clone & Environment Setup
1. Copy `.env.example` to `.env` in the root:
   ```bash
   cp .env.example .env
   ```

### Step 2: Start Database & Redis via Docker
```bash
docker-compose up -d
```

### Step 3: Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```
The NestJS API server will run at `http://localhost:4000/api/v1`.

### Step 4: Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The React Vite development server will run at `http://localhost:3000`.

---

## 🔒 Role-Based Access Control (RBAC)
Supported Foundation Roles:
1. `SUPER_ADMIN`
2. `SOCIETY_ADMIN`
3. `COMMITTEE`
4. `SECURITY`
5. `RESIDENT`
6. `TENANT`
7. `VENDOR`
8. `MAINTENANCE_STAFF`

---

## 📝 License
Enterprise Proprietary Software. All rights reserved.
