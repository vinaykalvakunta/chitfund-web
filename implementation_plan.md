# Full-Stack PWA for ChitFund Manager

This plan outlines the steps to build a local-first-to-cloud PWA for managing chit groups, members, auctions, and contributions. The architecture is schema-driven, using Drizzle ORM and Zod for end-to-end type safety, TanStack Query for state management, and Express.js for the API.

> [!WARNING]
> The current workspace contains a Next.js (`app/`) project. The requested tech stack requires React + Vite + Express.js. **I will need to delete the Next.js specific files and re-scaffold the project with Vite and Express.** Please confirm if this is acceptable in your review.

## Proposed Changes

We will restructure the application into a unified monolithic structure optimized for Replit/AWS, separating concerns into `client`, `server`, and `shared` directories.

---

### Shared Schema & Types
The source of truth for the entire application.

#### [NEW] shared/schema.ts
- Define Drizzle PostgreSQL tables: `chit_groups`, `users`/`members`, `contributions`, `auctions`.
- Export Zod schemas using `drizzle-zod` for validation on both frontend and backend.

---

### Backend (Express.js + Drizzle ORM)
The backend API to interact with the PostgreSQL database.

#### [NEW] server/db.ts
- Setup PostgreSQL connection using `pg` and `drizzle-orm/node-postgres`.

#### [NEW] server/index.ts
- Initialize Express server.
- Implement RESTful endpoints (`/api/groups`, `/api/members`, `/api/contributions`, `/api/auctions`).
- Add SHA-256 password hashing logic for local authentication.
- Serve Vite frontend in production mode.

---

### Frontend (React + Vite + TanStack Query)
The user interface and PWA logic.

#### [NEW] client/src/lib/queryClient.ts
- Configure TanStack Query client.

#### [NEW] hooks/useChitFund.ts
- Define `useQuery` and `useMutation` hooks for fetching and modifying data, completely replacing `localStorage` logic.

#### [NEW] public/manifest.json
- PWA manifest configuration for installability, icons, and theme colors.

#### [NEW] public/sw.js
- Service Worker script for native offline caching and PWA support.

---

## Open Questions
- Do you have an existing PostgreSQL database URL, or should I write the code assuming it will be provided in an environment variable (`DATABASE_URL`)?
- Should I clear out the existing Next.js `app/` directory and next package dependencies immediately after you approve this plan?
- Do you want me to provide just the code for the requested files (the core logic for the Express API and React Query hooks as requested), or generate the entire Vite boilerplate and overwrite the project?

## Verification Plan
### Automated & Manual Verification
- Start the development server and verify the API responds correctly.
- Check browser dev tools to ensure the Service Worker registers and the app acts as an installable PWA.
- Verify end-to-end type safety between the Express endpoints and React Query hooks.
