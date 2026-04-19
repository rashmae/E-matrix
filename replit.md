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

## Features Implemented (7-Feature Spec)

### Feature 1 — Auth & Session
- Centralized session via `src/lib/session.ts` (getSession/setSession/updateSession/clearSession)
- All primary pages use `getSession()` for auth gating

### Feature 2 & 3 — Dashboard Enhancements
- Debounced search (300ms) filtering the "Recommended for You" scroll row
- Year level chips (All/1st/2nd/3rd/4th) persisted to `localStorage`
- Quick filter chips: All Subjects / Favorites / Upcoming / In Progress
- Heart (favorite) toggle on each subject card, persisted to `localStorage`
- Empty state with "Clear Filters" button when no results match
- Clear all filter shortcut

### Feature 3 — Horizontal Scroll Fix
- Replaced ScrollArea with native `overflow-x-scroll` + CSS scroll-snap
- Left/right arrow navigation buttons (hidden on mobile, shown on desktop)
- Scroll state tracking (buttons disable when at edges)

### Feature 4 — Catalog Advanced Filters + Sorting
- Sort dropdown: Relevance / A→Z / Z→A / Units ↑↓
- Collapsible filter panel with active filter count badge
- Semester filter (All / 1st / 2nd / Summer)
- Units range dual-slider
- Favorites-only toggle
- Multi-year selection (independent chips)
- "Clear all" shortcut
- Search history persistence + removal
- Animated results with AnimatePresence

### Feature 5 — Rating Reviewer List (SubjectDetail)
- Star breakdown bars (clickable → filters reviews modal)
- 2-review preview inline on the page
- "See All Reviews" dialog with full reviewer list
- Star filter chips in the reviews modal (filter by star count)
- Reviewer cards with avatar, name, date, star display, feedback
- Anonymous option on rating submission toggle
- "Rate Subject" + "See All Reviews" button pair

### Feature 6 — Study Hub Redesign
- Hero section with day streak and completion counters
- 7-card grid (AI Advisor, Study Notebook NEW, Matrix Map, Study Groups, Q&A Forum, Flashcards, Practice Quiz)
- Card grid replaces tabs as the hub home; tabs appear only on entering a feature
- "← Hub" breadcrumb navigation back to home
- Header hides redundant title when on home tab

### Feature 7 — Study Notebook (NotebookLM-style)
- Route: `/study/notebook`
- Three-panel layout: Notebooks sidebar | AI Guide | Q&A Chat
- Source management: add text/URL sources, enable/disable per-source
- AI guide generation via Gemini (summary, key topics, definitions, study questions)
- Grounded Q&A chat — answers cite sources; out-of-scope questions rejected
- Copy button on AI responses
- Notebook rename, delete, create
- Persisted to `localStorage` under `ie_matrix_notebooks`

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
