# Jitsu Shipment Exercise

A React and TypeScript shipment-management application built for the Jitsu frontend exercise.
It implements the core list, detail, and edit workflow, plus shipment status transitions,
assignment management, maps, and create/delete flows.

## Prerequisites

- [Node.js](https://nodejs.org/) `20.19+` or `22.12+`
- npm `10+` (included with supported Node.js versions)
- A network connection for OpenStreetMap map tiles

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

### Technical decisions

#### Architecture

- React was chosen for a lightweight, component-driven UI with strong ecosystem support
  for routing, forms, data fetching, maps, and testing.
- Client UI state (selection, search, active tab) lives in local component state via
  `useState`/props. Server data stays in TanStack Query, so a global state library like
  Redux or Zustand would add boilerplate without solving a problem this app actually has.
- shadcn/ui was chosen over Ant Design or MUI because it provides accessible primitives
  that are easy to own, theme, and keep visually close to the product instead of a heavier
  pre-styled design system.

#### Performance
- The UI never loads all shipments at once. Each status group requests 50 records per page with `_page` and `_per_page`.
- Search is debounced for 300 ms and sent to the API, avoiding expensive client-side scans.
- TanStack Virtual mounts only visible rows, so rendering cost stays stable even when the total dataset is very large.
- TanStack Query caches pages by status and search term, deduplicates requests, and
  refreshes only affected queries after mutations.
- Detail panels fetch a shipment by ID, keeping list payloads small and avoiding duplicated canonical state.
- Routes (`/`, `/assignments`, `/assignments/:id`) and the map (Leaflet + leaflet-routing-machine)
  are code-split via `React.lazy`/`Suspense` instead of bundled into the initial chunk, since the
  map is only needed once a shipment is selected and each route pulls in feature code the others
  don't need.

## Tradeoffs

- shadcn/ui keeps components lightweight and easy to customize compared with Ant Design or
  MUI, but the app owns more composition, styling, and design-system consistency work.
- Plain component state avoids pulling in a state library for the small amount of shared
  client state in this app, but a store (Zustand/Redux Toolkit) would provide stronger
  conventions if state flows became more complex or needed to be shared across many
  distant components.
