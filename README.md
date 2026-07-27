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

## Approach

The code is organized by domain under `src/features/shipment` and
`src/features/assignment`. Each feature keeps API functions, query hooks, types, and
components together. Shared UI primitives live in `src/components/ui`; feature code uses
those first for dialogs, sheets, forms, search, and async states.

The shipment page owns only the current selection and dialog state. Selecting a list row
passes its ID to the detail panel, which loads the canonical record independently. TanStack
Query owns server state: mutations update the detail cache and invalidate affected list and
assignment queries through feature query-key factories, so all views converge on persisted
data. React Hook Form and Zod manage editable values and validation.

Additional refactor rationale is documented in `docs/refactor-decisions.md`.

Status rules are isolated in `src/features/shipment/lib/status-transitions.ts` instead of
being embedded in presentation components:

| Current status | Allowed next status | Assignment behavior |
| --- | --- | --- |
| `OPEN` | `IN_TRANSIT` | An open assignment is required |
| `IN_TRANSIT` | `DELIVERED` | Existing assignment is retained |
| `IN_TRANSIT` | `OPEN` | Assignment is cleared |
| `DELIVERED` | None | Treated as a terminal state |

For large datasets, each status group requests 50 records at a time. Search is debounced
for 300 ms and sent to the API, while TanStack Virtual mounts only the visible rows. This
avoids loading or rendering the full shipment collection in the browser.

## Tradeoffs

- JSON Server keeps the submission self-contained, but it is not a production backend:
  persistence is file-based and there is no authentication, authorization, transactional
  update, or concurrency handling.
- Selection stays in page-local state because only sibling list/detail panels need it.
  URL-based selection would improve deep-linking and browser history in a larger product.
- Assignment shipment counts are synchronized by the client after shipment create, update,
  and delete. A real backend should enforce this invariant atomically.
- Server-side search and pagination keep the UI scalable, but require the backing API to
  support the documented query parameters.
- OpenStreetMap provides a useful map without credentials, but map rendering depends on an
  internet connection and the public tile service.

## Assumptions

Where the exercise was ambiguous, I made the following assumptions:

- `q` performs case-insensitive full-text search across `client_name` and `label`.
- The API supports `_page`, `_per_page`, and an `X-Total-Count` response header.
- `PUT /shipments/:id` replaces the resource, so edits are merged into the loaded shipment
  before the complete object is sent.
- An `OPEN` shipment may be unassigned, but moving it to `IN_TRANSIT` requires an `OPEN`
  assignment.
- Returning an `IN_TRANSIT` shipment to `OPEN` removes its assignment.
- `DELIVERED` is terminal and cannot transition to another status.
- An assignment containing shipments cannot be deleted; its shipments must first be
  reassigned or returned to `OPEN`.
- Times are stored as ISO strings and displayed in the browser's local timezone.

## Suggested demo walkthrough

The submission video can cover the following in 2–5 minutes:

1. Search and select shipments across the three status groups.
2. Edit a delivery deadline or coordinate, save it, and show the map/list refresh.
3. Move an `OPEN` shipment to `IN_TRANSIT`, demonstrating the required assignment rule.
4. Open `/assignments`, select an assignment and shipment, and show the route map.
5. Briefly explain feature-based organization and the paginated/virtualized list tradeoff.
