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
