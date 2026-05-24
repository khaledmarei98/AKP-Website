# AKP Consulting Platform

Egypt-based financial services platform for accounting, tax, HR, and business consulting — with a client dashboard, online courses, booking system, partner portal, and Firebase-powered authentication.

## Run & Operate

- `pnpm --filter @workspace/akp-website run dev` — run the website (via workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- Required env: See Firebase section below

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS 4
- Auth & DB: Firebase (Auth + Firestore + Storage)
- Animation: Framer Motion
- Routing: Wouter
- UI: Radix UI + shadcn/ui components

## Where things live

```
artifacts/akp-website/src/
  lib/
    firebase.ts          ← Firebase app init (reads VITE_FIREBASE_* env vars)
    firestore.ts         ← Firestore collection helpers + typed interfaces
    storage.ts           ← Firebase Storage upload/download helpers
  context/
    AuthContext.tsx      ← Auth state (Firebase real or mock fallback)
    LanguageContext.tsx  ← Language toggle (EN/AR)
  types/index.ts         ← Shared TypeScript types (User, Booking, Course, etc.)
  pages/
    home.tsx             ← Landing page
    about.tsx            ← About page
    pricing.tsx          ← Pricing tiers
    tools.tsx            ← Financial calculators (VAT, Salary, Margin, Loan)
    booking.tsx          ← 3-step consultation booking wizard
    partner-portal.tsx   ← B2B partner program + application form
    auth/
      login.tsx          ← Sign in (Firebase + demo fallback)
      register.tsx       ← 2-step registration
      forgot-password.tsx← Password reset (Firebase email)
    dashboard/index.tsx  ← Client dashboard (8 sections)
  components/
    layout/Navbar.tsx    ← Auth-aware navigation
    layout/Footer.tsx    ← Updated footer with all new page links
    ChatWidget.tsx       ← AI chat assistant
```

## Firebase Configuration

Firebase is **fully configured** and connected to project `akpconsulting-dafe9`. All 7 environment variables are set as Replit shared secrets and in `artifacts/akp-website/.env` (gitignored).

| Variable | Purpose |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `akpconsulting-dafe9.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `akpconsulting-dafe9` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `akpconsulting-dafe9.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Google Analytics measurement ID (`G-BNDG2XG2HX`) |

Services enabled in Firebase Console that must remain active:
- **Authentication** — Email/Password provider
- **Firestore Database** — main data store
- **Storage** — file uploads
- **Analytics** — auto-initialized when supported by the browser

## Firestore Collections

| Collection | Purpose |
|---|---|
| `users` | User profiles + role assignment |
| `bookings` | Consultation bookings |
| `supportTickets` | Client support requests |
| `notifications` | Per-user notifications |
| `subscriptions` | Plan/billing records |
| `clientDocuments` | Client file metadata (actual files in Storage) |
| `courses` | Course catalog |
| `articles` | Blog/article content |
| `resources` | Library resources |
| `enrollments` | Course enrollment records |

## Architecture decisions

- **Dual-mode auth**: `AuthContext` detects whether Firebase is configured (`VITE_FIREBASE_*` env vars present) and uses real Firebase Auth if yes, mock localStorage auth if no. No code change needed to switch modes.
- **Role-based architecture**: 5 user roles defined in types (`super_admin`, `admin_staff`, `instructor`, `client`, `student`, `accounting_partner`) — stored in Firestore `users` collection.
- **Route protection**: `ProtectedRoute` (requires auth) and `PublicOnlyRoute` (redirects authenticated users) wrap routes in `App.tsx`.
- **Storage paths**: Structured as `clients/{uid}/documents/`, `courses/{id}/resources/`, `avatars/{uid}/` — all managed through `lib/storage.ts` helpers.
- **Design preserved**: Gold (#C9A84C) + dark navy (#060E1E / #0A1628) brand palette kept intact. Firebase integration is purely functional — no UI changes.

## User preferences

- Dark/gold premium design must not be changed
- Mock/demo mode must work without Firebase credentials
- Egyptian context: EGP currency, Egyptian tax law (VAT 14%), Egyptian labor law
- Bilingual prep: EN/AR language toggle exists in Navbar/LanguageContext

## Gotchas

- `VITE_` prefix is required on all Firebase env vars — Vite strips non-prefixed env vars from client bundles
- Firebase SDK is in `devDependencies` (it's a client-only Vite app — all deps are devDependencies)
- Dashboard has its own layout (no Navbar/Footer) — intentional for app-like feel
- Auth pages also skip Navbar/Footer — intentional full-screen dark layouts
- Old `/portal` route redirects to `/dashboard` for backwards compatibility
