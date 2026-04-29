# CLAUDE.md

This file gives Claude a fast orientation to the `personal-finance-mobile-first` codebase.

## Project Summary

- Full-stack personal finance dashboard.
- Frontend: React 18 + Vite + React Router + React Query + Tailwind CSS.
- Backend: Express + Mongoose + session auth.
- Auth: Google OAuth, session stored in MongoDB via `connect-mongo`.
- Main product areas: overview, transactions, budgets, pots, recurring bills.

## Run Commands

- Install deps: `npm install`
- Run frontend + backend in dev: `npm run dev`
- Run frontend only: `npm run dev:client`
- Run backend only: `npm run dev:server`
- Production build: `npm run build`
- Start server: `npm run start`

## High-Level Structure

- `src/`
  - React app
  - pages live in `src/pages`
  - shared UI lives in `src/components`
  - fetch/query helpers live in `src/lib`
  - app state providers live in `src/state`
- `server/`
  - Express app, auth, Mongo connection, routes, models
- `docs/superpowers/`
  - implementation notes and plans for recent feature work

## Frontend Architecture

- Entry routes are defined in `src/App.jsx`.
- Protected app pages are wrapped in `AppShell`.
- Data loading is handled with React Query hooks in `src/lib/hooks.js`.
- All API requests go through `src/lib/api.js` and hit `/api/*`.
- Period-sensitive pages read month/year from `PeriodProvider` in `src/state/period-context.jsx`.
- Shared visual primitives are in `src/components/ui.jsx`.
- Global styling is in `src/styles.css`.

## Main Frontend Files

- `src/App.jsx`
  - route setup and auth gate
- `src/components/app-shell.jsx`
  - main authenticated layout and navigation
- `src/components/ui.jsx`
  - reusable cards, inputs, modal, tables/lists, empty/error states
  - `BillsList` supports optional `onPay`/`payingId` and `onRemoveRecurring`/`removingRecurringId` props for action buttons
  - `PaidIndicator` (green checkmark) and `ActionButton` helpers
- `src/components/date-picker-field.jsx`
  - shared themed date picker built on `react-day-picker`
- `src/lib/hooks.js`
  - React Query hooks for auth, overview, transactions, budgets, pots, bills, categories
- `src/lib/api.js`
  - fetch wrapper with JSON parsing and error normalization
- `src/styles.css`
  - theme styles, glassmorphism classes, calendar styling

## Backend Architecture

- Server entry is `server/index.js`.
- API routes are in `server/routes.js`.
- Auth routes and auth middleware are in `server/auth.js`.
- Mongo models are in `server/models.js`.
- DB connection is in `server/db.js`.
- Utility functions are in `server/utils.js`.

## Data Model

Defined in `server/models.js`.

- `Transaction`
  - `userId`, `senderRecipient`, `category`, `date`, `amount`, `avatar`
- `Budget`
  - `userId`, `category`, `maximum`, `spent`, `theme`, `month`, `year`
- `Pot`
  - `userId`, `name`, `target`, `saved`
- `Bill`
  - `userId`, `title`, `dueDate`, `amount`, `isRecurring`, `status`
- `Category`
  - `userId`, `name`

Important indexes:

- budget uniqueness: `userId + category + month + year`
- category uniqueness: `userId + name`

## Auth Flow

- `GET /api/auth/me` returns current session state.
- `GET /api/auth/google/start` begins Google OAuth.
- `GET /api/auth/google/callback` completes OAuth and stores user in session.
- `POST /api/auth/logout` destroys the session.
- All app API routes under `server/routes.js` are protected by `requireAuth`.

## API Surface

Defined mainly in `server/routes.js`.

- `GET /api/health`
- `GET /api/overview`
- `GET/POST/PUT/DELETE /api/transactions`
- `GET/POST/PUT/DELETE /api/budgets`
- `GET /api/categories`
- `GET/POST/PUT/DELETE /api/pots`
- `GET/POST/PUT/DELETE /api/bills`
- `GET/POST/PUT/DELETE /api/bill-templates`
- `POST /api/bills/:id/remove-recurring`

When changing frontend forms, keep payload keys aligned with backend expectations:

- transactions use `date`
- bills use `dueDate`
- budgets use `month` and `year`

## UI Conventions

- Prefer existing shared components from `src/components/ui.jsx` before adding one-off markup.
- Theme uses `glass`, `glass-card`, `overlay-panel`, `page-title`, and `section-title` classes.
- Mobile-first layouts are common; many list/table components have both mobile and desktop render paths.
- Styling is Tailwind-based with custom finance color tokens from the Tailwind config.

## Date Picker Notes

- Shared picker is `src/components/date-picker-field.jsx`.
- It uses `react-day-picker` and project helpers from `src/lib/date-picker.js`.
- The picker currently reserves vertical space with a spacer element while open so modals do not feel cramped near the bottom.
- Outside-close uses a document `click` listener, not `mousedown`, to avoid breaking modal close button interactions.

## React Query Notes

- Query keys include the current period for overview, budgets, transactions, and bills.
- After mutations, the common pattern is to invalidate relevant queries such as:
  - `['overview']`
  - `['transactions']`
  - `['budgets']`
  - `['pots']`
  - `['bills']`

## Environment Variables

Backend expects at least:

- `MONGO_URI`
- `SESSION_SECRET`
- `FRONTEND_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL` optional, otherwise derived from `FRONTEND_URL`
- `PORT` optional, defaults to `5002`
- `SESSION_TTL_DAYS` optional, defaults to `7`

## Working Rules For Changes

- Check shared components before editing page-local UI.
- Keep API contracts stable unless backend and frontend are both intentionally updated.
- Respect the current visual language; do not introduce a new design system.
- For date fields, prefer the shared `DatePickerField` instead of native `input type="date"`.
- Preserve mobile behavior when editing table/list layouts.

## Good Starting Points

If Claude needs to answer questions quickly:

- Routing / page ownership: `src/App.jsx`
- Shared UI patterns: `src/components/ui.jsx`
- Server behavior: `server/routes.js`
- Database schema: `server/models.js`
- Fetch/query wiring: `src/lib/hooks.js`
- Global styles/theme: `src/styles.css`

## Recent Context

- The app recently replaced native date inputs with a shared themed calendar.
- Bills modal date picker spacing and close interaction were recently adjusted in `src/components/date-picker-field.jsx`.
- Bills page no longer uses `PeriodSelector`; period is still applied via `useBills` hook internally.
- `BillsList` now supports pay and remove-recurring actions via optional `onPay`/`onRemoveRecurring` props. Compact mode (overview) works without them.
- There are planning/spec notes in `docs/superpowers/` if implementation intent is unclear.
