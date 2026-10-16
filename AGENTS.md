<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Spent — Agent Guidelines & Project Knowledge Base

## 1. Project Overview & Core Mission
**Spent** is a mobile-first, offline-capable daily budget tracker designed for rapid micro-expense logging (under 3 taps), real-time balance calculations, and cross-platform installation (Desktop, Android, and iOS).

* **Live Deployment:** `https://spent-wave.vercel.app/`
* **Official Slogan & Metadata Title:** `Spent | Track Every Cents`
* **Default Currency:** Philippine Peso (`₱`), formatted via `en-PH` locale (`₱0.00`).
* **Design Identity:** Signature violet and yellow color palette supporting automatic system light and dark modes.

---

## 2. Technology Stack & Tooling
* **Framework:** Next.js 16 (App Router, Turbopack, Cache Components, Partial Prefetching)
* **Language:** TypeScript
* **Styling:** Tailwind CSS v4 with semantic CSS variables (`@theme inline` in `src/app/globals.css`)
* **Backend & Auth:** Supabase (PostgreSQL, Row Level Security, Auth with SSR cookie handling)
* **PWA & Offline Layer:** Custom Service Worker (`sw.js`), Web App Manifest (`manifest.json`), and `localStorage` queued sync engine

---

## 3. Strict Next.js 16 Engineering Rules

### A. Next.js 16 Cache Components & Prerendering
* **Never use `export const dynamic = 'force-dynamic'`**: This legacy config throws compilation errors when `nextConfig.cacheComponents` is enabled.
* **Avoid prerender clock halts (`Date.now()`, `new Date()`):** Supabase `getUser()` token validation and real-time dates trip the `blocking-prerender-current-time` build guard. Always call `await connection()` from `next/server` inside any dynamic async Server Component fetching cookies or user data.
* **Strict `<Suspense>` Isolation:** Shell layouts and headers must render statically, while data-fetching children must be encapsulated inside `<Suspense>` boundaries with fallback skeletons.

### B. Routing Structure Constraints
* **Dashboard Path:** Must live in `src/app/dashboard/` (explicit segment). **DO NOT** wrap the dashboard in a Route Group `(dashboard)` without an internal segment, or Next.js will strip the folder name from the route tree and cause `404 Not Found` collisions with the landing page.
* **Authentication Path:** Managed inside `src/app/(auth)/login/` and `src/app/(auth)/signup/` using server actions in `src/app/(auth)/actions.ts`.
* **Auth Callback:** Hosted at `src/app/auth/callback/route.ts` to exchange verification codes for persistent session cookies.

---

## 4. Design System & Theming Tokens

### Color Palette (Exclusively Violet & Yellow)
* `--spent-violet`: `#6b46c1`
* `--spent-violet-dark`: `#44337a`
* `--spent-violet-light`: `#9f7aea`
* `--spent-violet-bg`: `#f3e8ff`
* `--spent-yellow`: `#ecc94b`
* `--spent-yellow-light`: `#fef08a`
* `--spent-yellow-dark`: `#d69e2e`

### Theme Switching Mechanism
Colors are governed by CSS variables in `src/app/globals.css`. System theme changes are captured automatically via `@media (prefers-color-scheme: dark)`:
* **Light Mode:** `--background: var(--spent-violet-bg);` with clean white cards (`#ffffff`).
* **Dark Mode:** Deep brand-aligned dark background (`#1a103c`) with dark slate cards (`#111827`).
* Components must use semantic Tailwind classes (`bg-card`, `text-card-foreground`, `bg-input-bg`, `text-input-text`, `border-card-border`) rather than hardcoded white or slate utilities.

### Logo & Favicon
* Browser tab icon resides at `src/app/icon.svg` and `public/icon.svg`.
* The logo consists exclusively of a violet squircle background, a yellow currency notch, a yellow dynamic "S" ribbon, and a yellow center accent spark (no white fills or strokes).

---

## 5. Offline-First Architecture & PWA

1. **Service Worker (`public/sw.js`):** Intercepts network calls to serve cached application shells, fonts, and icons when the device is disconnected.
2. **Offline Queue Mechanism:** If `navigator.onLine` is `false`, `AddTransactionModal.tsx` serializes the entry and appends it to `localStorage` under `spent_offline_queue`.
3. **Automatic Flush & Sync:** `PwaManager.tsx` monitors the `online` window event. As soon as connectivity returns, it iterates through `spent_offline_queue`, executes the server actions, and flushes the queue.
4. **Platform Install Support:**
    * **Desktop & Android:** Intercepts `beforeinstallprompt` to trigger native app installation via a top-bar CTA button.
    * **iOS Safari:** Detects Apple standalone status and provides tailored "Add to Home Screen" instructions.

---

## 6. Milestones & Accomplishments Log

* **Milestone 1 (Public Portal & Deployment):** Built the marketing landing page with high-conversion CTAs and deployed the application to Vercel (`spent-wave.vercel.app`).
* **Milestone 2 (Authentication & Dark Mode):** Implemented email/password authentication via Supabase SSR, enforcing an 8-character minimum password rule and dynamic `origin` resolution to support both localhost and production confirmation links.
* **Milestone 3 (Route Resolution):** Restructured `/dashboard` from a route group to an explicit route segment, resolving 404 navigation errors.
* **Milestone 4 (Next.js 16 Build Stabilization):** Replaced legacy `force-dynamic` flags with Next.js 16 `await connection()` and `<Suspense>` boundaries, resolving `blocking-prerender-dynamic` and `Date.now()` timestamp conflicts during production builds.
* **Milestone 5 (Branding & Localization):** Updated the application title to "Spent | Track Every Cents", switched all currency displays and transaction modals from `$` to `₱` (Philippine Peso), and designed a dedicated vector favicon.
* **Milestone 6 (PWA & Offline Capability):** Configured web app manifests, service workers, install prompts, and an offline transaction queue with automatic sync on network reconnection.