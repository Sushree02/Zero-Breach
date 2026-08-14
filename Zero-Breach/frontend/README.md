# Zero Breach — Frontend

React + Vite + Tailwind CSS dashboard for the Zero Breach OSINT Investigation platform.

## Setup

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` by default and expects the backend at `http://localhost:5000/api` (override with a `VITE_API_URL` env var if needed).

## Visual identity

Dark navy/black background, crimson accent, subtle glow — built around a decorative SVG world-map hero (dot-grid continents with a few glowing connection nodes; purely aesthetic, not live data). Layout is a slim left sidebar (Dashboard / Domain / IP Address / Username — only real, functional destinations) plus a minimal top bar.

## Structure

```text
src/
├── components/    Sidebar, Topbar, WorldMapBackground, forms, cards, charts, detail sections
├── pages/         Home (hero + investigation form) and Dashboard (results view)
├── services/       api.js — all backend HTTP calls
└── assets/         logo.jpeg — Zero Breach brand mark
```

## Pages

- **Home (`/`)** — world-map hero, target-type tabs, input field, validation, loading state, capability overview.
- **Dashboard (`/dashboard`)** — risk score gauge, threat distribution pie chart, key findings, full investigation details, sources, and PDF download.

No investigation history, favorites, or account features exist — the app is intentionally stateless, so the sidebar and dashboard only show real, working functionality (no fabricated stats or activity feeds).
