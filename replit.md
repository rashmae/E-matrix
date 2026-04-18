# IE Matrix - Industrial Engineering Curriculum System

## Project Overview
An interactive, AI-powered Student Curriculum Information System for Industrial Engineering students at CTU Main Campus. Features study roadmaps, GWA tracking, subject catalogs, resource sharing, and collaborative community tools.

## Tech Stack
- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4 + Framer Motion + Radix UI / Shadcn UI
- **Backend/Database**: Firebase (Auth, Firestore, Storage)
- **AI Integration**: Google Gemini AI (`@google/generative-ai`)
- **Data Visualization**: Recharts + React Calendar

## Project Structure
All source files are in the **root directory** (flat structure from GitHub import):
- `main.tsx` — App entry point
- `App.tsx` — Routing configuration
- `index.html` — HTML entry with script pointing to `/main.tsx`
- `index.css` — Global styles and Tailwind directives
- Page components: `Dashboard.tsx`, `Login.tsx`, `Catalog.tsx`, `Progress.tsx`, etc.
- UI components: `button.tsx`, `card.tsx`, `badge.tsx`, etc. (in root)
- `firebase.ts` — Firebase initialization (root)
- `firebase-applet-config.json` — Firebase project config
- `constants.ts` — Static data (IE subjects, announcements, etc.)
- `index.ts` — TypeScript type definitions
- `gemini.ts`, `geminiService.ts` — AI integration

### Supporting `src/` structure (aliases)
To support `@/src/...` imports, files are also mirrored in:
- `src/components/layout/` — Sidebar, BottomNav
- `src/components/resources/` — UploadResourceModal
- `src/components/` — ThemeToggle, AIAssistant
- `src/lib/` — firebase.ts, constants.ts, firebase-applet-config.json
- `src/services/` — gemini.ts, geminiService.ts
- `src/types/index.ts` — Type definitions

## Vite Alias Configuration
The `vite.config.ts` has custom aliases to handle the flat file structure:
- `@/components/ui` → root directory (UI components at root)
- `@/components` → `src/components/`
- `@/lib` → `lib/` (root-level lib folder)
- `@/src` → `src/`
- `@` → root directory

## Workflow
- **Start application**: `npm run dev` on port 5000
- Server runs on `0.0.0.0:5000` with `allowedHosts: true` for Replit proxy

## Deployment
- Configured as **static** deployment
- Build: `npm run build` → outputs to `dist/`

## Environment Variables
- `GEMINI_API_KEY` — Google Gemini API key (loaded via Vite's `loadEnv`)

## Firebase Configuration
Firebase is configured via `firebase-applet-config.json` in the root (and mirrored in `src/lib/`).

## Session Management
Centralized via `src/lib/session.ts` which exposes:
- `getSession()` — reads from sessionStorage first, falls back to localStorage
- `setSession(data)` — writes to both storages for cross-tab compatibility
- `updateSession(partial)` — merges partial data into existing session
- `clearSession()` — removes from both storages (used on logout)

All logout handlers (`Sidebar.tsx`, `Profile.tsx`, `src/` mirrors) import from this utility. Session key: `ie_matrix_session`.

## Authentication Flow
- **Primary**: Google popup sign-in (`signInWithGoogle`)
- **Fallback**: Google redirect sign-in (handles Replit's iframe/cross-origin restrictions)
- Pending login data (fullName, idNumber, yearLevel) is stored in `sessionStorage` under `ie_matrix_pending_login` before redirect and restored after `getGoogleRedirectResult()` resolves
- **Auth domain fix**: If `auth/unauthorized-domain` error occurs, the current Replit domain must be added to Firebase Console → Authentication → Settings → Authorized Domains

## User Data Model
Users stored in Firestore `users/{uid}`:
- `uid`, `fullName`, `idNumber`, `email`, `role` ('student' | 'admin')
- `yearLevel` — one of '1st Year', '2nd Year', '3rd Year', '4th Year' (enforced by Firestore rules)
- `photoURL`, `lastLogin`, `createdAt`

Admin email: `rashmae26@gmail.com`

## Security
- `firestore.rules` enforces: authentication, data ownership, yearLevel validation, role protection
- Users cannot escalate their own role; only admins can change roles
- Resources are readable only if `isPublic == true` or owned by the user
