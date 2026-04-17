# JZ License Manager

Browser-based license management dashboard. No backend required — all data persists in IndexedDB.

## Features

- Manage **Licenses**, **Users**, **Products**, **Bundles**, and **Clients**
- License statuses: `active`, `inactive`, `expired`, `revoked`
- Create, edit, revoke, and delete licenses
- Automatic expiry detection
- Accessible UI (ARIA labels, keyboard navigation, live regions)
- Fully offline — data stored in browser's IndexedDB

## Tech Stack

| Layer | Tech |
|---|---|
| Build | Vite + TypeScript |
| Styles | Tailwind CSS v4 |
| Storage | IndexedDB (browser-native) |
| Architecture | Hexagonal / Clean Architecture |
| Framework | Courvux |

## Architecture

```
src/
├── core/
│   ├── domain/
│   │   ├── entities/       # License, User, Product, Bundle, Client
│   │   └── value-objects/  # LicenseId, LicenseKey, LicenseStatus
│   └── ports/
│       ├── input/          # Use case interfaces
│       └── output/         # Repository interfaces
├── application/
│   └── use-cases/          # LicenseService, UserService, etc.
├── infrastructure/
│   ├── db/                 # IndexedDB wrapper (IDBRepository)
│   └── repositories/       # IDB implementations per entity
├── ui/
│   ├── auth/               # Auth state
│   └── shared/             # Badges, reusable UI helpers
├── lib/
│   ├── cvx.ts              # DOM utility library (selectors, events, templates)
│   └── reactive.ts         # Reactive state with watchers
└── main.ts                 # Router + page renderers
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Development

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`

**Demo credentials:**
```
Email:    admin@example.com
Password: admin
```

### Production Build

```bash
npm run build
npm run preview
```

## Docker

```bash
# Build image
npm run docker:build

# Run on port 3000
npm run docker:run
```

Or with Docker Compose:

```bash
docker compose up -d
```

Runs on `http://localhost:9098`

## Deploy to Coolify

1. Push repo to GitHub
2. In Coolify: **Add New Resource → Git Repository**
3. Configure:
   - **Build Pack**: `Dockerfile`
   - **Port**: `80` (container internal port — Coolify's proxy handles external routing)
   - **Domain**: your custom domain
4. Click **Deploy**

> The nginx container listens on port **80**. Do not set port `9098` in Coolify — that's only for direct host access via Docker Compose.

## Path Aliases

| Alias | Path |
|---|---|
| `@core` | `src/core` |
| `@application` | `src/application` |
| `@infrastructure` | `src/infrastructure` |
| `@ui` | `src/ui` |
| `@shared` | `src/shared` |
