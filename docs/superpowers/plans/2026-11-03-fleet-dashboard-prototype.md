# Fleet Dashboard Prototype Implementation Plan

> **For agentic workers:** Implement natively in this session. Scope follows the user's request to make a functional prototype for the active fleet dashboard and keep the current app running without modifying its files.

**Goal:** Add an independently runnable fleet dashboard prototype with interactive local demo data.

**Architecture:** Create a static page in `prototype/` that can open directly in a browser. Keep all prototype markup, styling, demo data, and state interactions inside new files; do not import from or change the React app.

**Tech Stack:** HTML, CSS, vanilla JavaScript, inline SVG.

**Spec:** User request from 2026-11-03; “full functional prototype” for `src/pages/Dashboard.jsx`, with no disruption to existing files or app runtime.

## Global Constraints

- Keep all existing app source, configuration, and assets unchanged.
- Use local sample data; no authentication, Supabase, API calls, package installs, or external map keys.
- Make the prototype runnable by opening `prototype/index.html` in a browser.
- Prototype interactions: search and status filters, synchronized map/list selection, vehicle details, alert acknowledgment, and resettable demo state.
- Responsive layout with accessible labels and keyboard-operable controls.

## Review Focus

- Empty search/filter results remain clear and recoverable by clearing controls.
- Selecting a vehicle from either the map or list updates the same details view.
- Acknowledging alerts updates counts and the visible alert list.
- Local browser execution works without fetch/module/server requirements.
- Narrow screens keep navigation and primary actions usable.

---

### Task 1: Create the standalone prototype

**Files:**
- Create: `prototype/index.html`
- Create: `prototype/prototype.css`
- Create: `prototype/prototype.js`

**Interfaces:**
- `prototype.js` owns demo data and all interaction state; `index.html` loads it as a classic script.
- Map, vehicle list, KPIs, alerts, and the detail panel render from one vehicle/alert data model.

- [x] Build semantic dashboard markup with responsive navigation, fleet summary, schematic map, vehicle list, active alerts, and a vehicle details dialog/panel.
- [x] Add local demo records using the existing project fixture conventions and Malaybalay location context.
- [x] Implement search/status filters, map/list selection, acknowledge alerts, zoom/reset controls, and demo reset with vanilla JavaScript.
- [x] Add brand-aligned responsive styling and accessible focus/labels.
- [x] Verify the standalone script with `node --check prototype/prototype.js`; `npm run build` completed successfully in a temporary output folder. Browser preview was unavailable in this session.
