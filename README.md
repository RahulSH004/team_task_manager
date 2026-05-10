# Team Task Manager

A full-stack project management application with role-based access control, letting teams collaborate on projects, manage tasks, and track progress — all from a clean, unified dashboard.

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)

---

## Overview

Team Task Manager allows users to create projects, invite team members, and manage tasks with role-scoped permissions. Project creators become admins automatically and control member access and task assignments. Members can update their own task statuses as work progresses.

---
## Demo video
[![Watch the demo](https://img.youtube.com/vi/0Yq3tv5giII/hqdefault.jpg)](https://youtu.be/0Yq3tv5giII)


## Features

- **Authentication** — Register & login with JWT (access + refresh tokens via httpOnly cookies)
- **Project Management** — Create projects; creator is auto-assigned as `ADMIN`
- **Role-Based Access Control** — Per-project roles: `ADMIN` and `MEMBER`
- **Member Invites** — ADMINs add members by email
- **Task Lifecycle** — ADMINs create & assign tasks with priority and due date; MEMBERs update status
- **Task Status Flow** — `TODO` → `IN_PROGRESS` → `DONE`
- **Task Priorities** — `LOW`, `MEDIUM`, `HIGH`
- **Dashboard** — Overview of projects, tasks by status, and member activity
- **Rate Limiting** — Auth endpoints are protected against brute-force (10 req / 15 min)

---

## Tech Stack

| Layer       | Technology                                              |
|-------------|----------------------------------------------------------|
| Frontend    | React 19, TypeScript, Vite, Tailwind CSS v4, Shadcn UI  |
| Backend     | Node.js, Express 5, TypeScript                           |
| Database    | PostgreSQL (Supabase), Prisma ORM                        |
| Auth        | JWT — access + refresh tokens, httpOnly cookies          |
| Validation  | Zod (client & server)                                    |
| Forms       | React Hook Form                                          |
| HTTP Client | Axios                                                    |
| Package Mgr | pnpm                                                     |

---

## Project Structure

```
assignment/
├── cilent/          # React frontend (Vite)
│   └── src/
│       ├── api/         # Axios API calls
│       ├── components/  # Reusable UI components
│       ├── context/     # Auth & global state
│       ├── hooks/       # Custom React hooks
│       ├── pages/       # Route-level pages
│       └── types/       # Shared TypeScript types
│
└── server/          # Express backend
    ├── src/
    │   ├── controllers/ # Route handlers
    │   ├── middleware/  # Auth & RBAC middleware
    │   ├── routes/      # API route definitions
    │   ├── schema/      # Zod validation schemas
    │   └── lib/         # Utilities (validate, prisma client)
    └── prisma/
        └── schema.prisma
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/) — `npm install -g pnpm`
- A PostgreSQL database (e.g., [Supabase](https://supabase.com))

---

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd assignment
```

---

### 2. Backend Setup

```bash
cd server
pnpm install
```

Create a `.env` file in `server/`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"
PORT=3000
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CLIENT_URL=http://localhost:5173
```

Run database migrations and generate Prisma client:

```bash
pnpm db:migrate
pnpm db:generate
```

Start the dev server:

```bash
pnpm dev
```

> Server runs on `http://localhost:3000`

---

### 3. Frontend Setup

```bash
cd cilent
pnpm install
```

Create a `.env` file in `cilent/`:

```env
VITE_API_URL=http://localhost:3000/api
```

Start the dev server:

```bash
pnpm dev
```

> Client runs on `http://localhost:5173`

---

## API Overview

All protected routes require a valid JWT sent as an httpOnly cookie.

### Auth — `/api/auth`

| Method | Endpoint    | Access | Description              |
|--------|-------------|--------|--------------------------|
| POST   | `/register` | Public | Register a new user      |
| POST   | `/login`    | Public | Login and receive tokens |

### Projects — `/api/projects`

| Method | Endpoint                    | Access | Description                        |
|--------|-----------------------------|--------|------------------------------------|
| POST   | `/`                         | Auth   | Create a project (caller = ADMIN)  |
| GET    | `/`                         | Auth   | List all user's projects           |
| GET    | `/:projectId`               | Auth   | Get a single project               |
| DELETE | `/:projectId`               | ADMIN  | Delete a project                   |
| POST   | `/:projectId/members`       | ADMIN  | Add a member by email              |
| POST   | `/:projectId/tasks`         | ADMIN  | Create and assign a task           |
| GET    | `/:projectId/tasks`         | Auth   | List tasks for a project           |

### Tasks — `/api/tasks`

| Method | Endpoint              | Access | Description                    |
|--------|-----------------------|--------|--------------------------------|
| PATCH  | `/:taskId/status`     | Auth   | Update task status             |
| DELETE | `/:taskId`            | Auth   | Delete a task                  |

### Dashboard — `/api/dashboard`

| Method | Endpoint | Access | Description              |
|--------|----------|--------|--------------------------|
| GET    | `/`      | Auth   | Fetch dashboard stats    |

---

## Environment Variables

### Server (`server/.env`)

| Variable            | Description                                  | Required |
|---------------------|----------------------------------------------|----------|
| `DATABASE_URL`      | PostgreSQL connection string (pooled)        | ✅       |
| `DIRECT_URL`        | PostgreSQL direct URL (for migrations)       | ✅       |
| `PORT`              | Port the Express server listens on           | ✅       |
| `JWT_SECRET`        | Secret for signing access tokens             | ✅       |
| `JWT_REFRESH_SECRET`| Secret for signing refresh tokens            | ✅       |
| `CLIENT_URL`        | Frontend origin for CORS                     | ✅       |

### Client (`cilent/.env`)

| Variable        | Description                    | Required |
|-----------------|-------------------------------|----------|
| `VITE_API_URL`  | Base URL of the backend API   | ✅       |

---

## Database Schema

```
User          ─── ProjectMember ─── Project
                       │                └── Task
                       └── Role (ADMIN | MEMBER)

Task.status:   TODO | IN_PROGRESS | DONE
Task.priority: LOW  | MEDIUM      | HIGH
```

---

## Scripts

### Server

| Command           | Description                      |
|-------------------|----------------------------------|
| `pnpm dev`        | Start dev server with hot reload |
| `pnpm build`      | Compile TypeScript               |
| `pnpm start`      | Run compiled production server   |
| `pnpm db:migrate` | Run Prisma migrations            |
| `pnpm db:generate`| Regenerate Prisma client         |
| `pnpm db:studio`  | Open Prisma Studio               |

### Client

| Command       | Description              |
|---------------|--------------------------|
| `pnpm dev`    | Start Vite dev server    |
| `pnpm build`  | Build for production     |
| `pnpm preview`| Preview production build |

---

## License

MIT
