# Jitsu Shipment Exercise

A React and TypeScript shipment-management application built for the Jitsu frontend exercise.
It implements the core list, detail, and edit workflow, plus shipment status transitions,
assignment management, maps, and create/delete flows.

- **Public repository:** https://github.com/junitvn/jitsu-exercise
- **Demo video (2–5 minutes):** _Add the public recording URL here before submission._

## Prerequisites

- [Node.js](https://nodejs.org/) `20.19+` or `22.12+`
- npm `10+` (included with supported Node.js versions)
- A network connection for OpenStreetMap map tiles

No external database or API credentials are required. The repository includes a local
JSON Server API and sample data.

## Install

Clone the public repository and install the locked dependencies:

```bash
git clone https://github.com/junitvn/jitsu-exercise.git
cd jitsu-exercise
npm ci
```

## Run the application

The application and its local API run as separate processes.

In the first terminal, start the API at `http://localhost:3001`:

```bash
npm run api
```

In a second terminal, start the React application:

```bash
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

To point the UI at a different compatible API, set `VITE_API_BASE_URL` before starting
Vite:

```bash
VITE_API_BASE_URL=http://localhost:3001 npm run dev
```

## Implemented features

### Core

- Shipments grouped by `OPEN`, `IN_TRANSIT`, and `DELIVERED`
- Search by client name or shipment label
- Paginated, virtualized lists with loading, empty, error, and retry states
- Selected-row state shared between the list and detail views
- Shipment detail view with editable delivery deadline and coordinates
- Form validation, save progress, success/error feedback, and refreshed list data
- Responsive desktop split view and mobile detail sheet

### Additional scope

- Valid status-transition controls and assignment requirements
- Live map updates when coordinates change
- Shipment creation and deletion
- `/assignments` workflow with grouped/searchable assignments
- Assignment detail, related shipments, and a multi-stop route map
- Assignment creation and guarded deletion

### Technical decisions

#### Architecture

- React was chosen for a lightweight, component-driven UI with strong ecosystem support
  for routing, forms, data fetching, maps, and testing.
- Zustand is used instead of Redux because the app only needs small client UI state.
  Server data stays in TanStack Query, so Redux would add boilerplate without much value.
- shadcn/ui was chosen over Ant Design or MUI because it provides accessible primitives
  that are easy to own, theme, and keep visually close to the product instead of a heavier
  pre-styled design system.

#### Business rules

Status rules are isolated in `src/features/shipment/lib/status-transitions.ts` instead of
being embedded in presentation components:

| Current status | Allowed next status | Assignment behavior |
| --- | --- | --- |
| `OPEN` | `IN_TRANSIT` | An open assignment is required |
| `IN_TRANSIT` | `DELIVERED` | Existing assignment is retained |
| `IN_TRANSIT` | `OPEN` | Assignment is cleared |
| `DELIVERED` | None | Treated as a terminal state |

#### Performance

- The UI never loads all shipments at once. Each status group requests 50 records per page
  with `_page` and `_per_page`.
- Search is debounced for 300 ms and sent to the API, avoiding expensive client-side scans.
- TanStack Virtual mounts only visible rows, so rendering cost stays stable even when the
  total dataset is very large.
- TanStack Query caches pages by status and search term, deduplicates requests, and
  refreshes only affected queries after mutations.
- Detail panels fetch a shipment by ID, keeping list payloads small and avoiding duplicated
  canonical state.

## Tradeoffs

- shadcn/ui keeps components lightweight and easy to customize compared with Ant Design or
  MUI, but the app owns more composition, styling, and design-system consistency work.
- Zustand avoids Redux boilerplate for the small amount of shared client state in this app,
  but Redux Toolkit would provide stronger conventions and tooling if state flows became
  more complex.
