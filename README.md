# Jitsu Shipment Exercise

React + TypeScript implementation of the shipment management exercise. The app includes shipment management, status transitions, map views, shipment CRUD, and a routed assignment workflow.

## Prerequisites

- Node.js 20+
- npm

## Install

```bash
npm install
```

## Sample Data

The repository includes `shipments.json` and `data/generated-data.js`. The UI expects a JSON API with `/shipments`, `/assignments`, and `/statuses` resources.

This exercise assumes the API supports:

- `GET /shipments?status=OPEN&q=search&_page=1&_per_page=50`
- `GET /shipments/:id`
- `PUT /shipments/:id`
- `POST /shipments`
- `DELETE /shipments/:id`
- `GET /assignments`
- `GET /assignments/:id`
- `POST /assignments`
- `DELETE /assignments/:id`

The `q` parameter is used for label/client search.

Regenerate the sample data when needed:

```bash
node data/generated-data.js
```

## Run

Start the local JSON API in one terminal:

```bash
npm run api
```

Start the React app in another terminal:

```bash
npm run dev
```

Build the production bundle:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

Run focused tests:

```bash
npm run test
```

## Architecture

- `src/features/shipment/components/shipment-page.tsx` owns the selected shipment id, create dialog state, and the responsive two-panel layout.
- `ShipmentListPanel` renders the search box and one grouped `ShipmentGroupList` per status.
- `ShipmentGroupList` uses TanStack Query for paginated server data and TanStack Virtual so only visible rows are mounted.
- `ShipmentDetailPanel` uses React Hook Form and Zod for editable delivery date, coordinates, status, and assignment transitions.
- `src/features/shipment/lib/status-transitions.ts` keeps status-transition business rules outside presentation components.
- `src/features/assignment` contains assignment API hooks, routing, list/detail UI, and assignment CRUD rules.
- `ShipmentMap` wraps React Leaflet for single-shipment pins and assignment route maps.
- `src/features/shipment/api/shipment.api.ts` contains the API calls.
- `useUpdateShipment` updates the detail cache and invalidates list queries after a save so the UI reflects persisted data.

## Performance Strategy

The list is designed for 100,000+ daily shipments:

- Each status group requests 50 shipments at a time through server-side pagination.
- Each group has its own infinite query and scroll state.
- Search is debounced for 300 ms and sent to the API instead of filtering a large client-side array.
- TanStack Virtual renders only the visible rows plus a small overscan buffer.
- Loading, empty, and retryable error states are handled per group.

## Implemented Scope

Core shipment list/detail requirements are implemented, including grouped shipments, clickable/selected rows, search, paginated virtual scrolling, editable delivery deadline and coordinates, validation, save feedback, and cache refresh after save.

Stretch work is implemented: valid status transitions, assignment requirement for moving open shipments into transit, assignment clearing when reverting to open, map pin updates, shipment create, and shipment delete.

Extra credit is implemented: `/assignments` routing, grouped/searchable assignments, assignment detail, associated shipment selection, multi-pin assignment map with connecting lines, assignment create, and delete prevention for non-empty assignments.

## Assumptions

- `q` searches both `client_name` and `label` in the backing API.
- `PUT /shipments/:id` replaces the whole shipment, so the detail form merges edits into the loaded shipment before saving.
- Missing `assignment_id` values are valid for open shipments and displayed as `Unassigned`.
- Assignment `shipment_count` is part of the sample model; the UI derives the detail count from associated shipments so it stays accurate after local edits.
- Map tiles are loaded from OpenStreetMap through React Leaflet.
