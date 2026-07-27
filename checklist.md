# Jitsu Frontend Candidate Exercise - Shipping Checklist

Use this as a definition of done. Finish the **Core** section before working on Stretch or Extra Credit.

## 1. Core - required

### Shipment list - left panel

- [x] Show shipments grouped into `OPEN`, `IN_TRANSIT`, and `DELIVERED`.
- [x] Show client name, shipment label, and arrival date in every row.
- [x] Make every row clickable.
- [x] Visually identify the selected shipment.
- [x] Add search that filters by shipment label or client name.
- [x] Design the list for 100,000+ daily shipments.
  - [x] Do not render the entire dataset at once; use server pagination, virtualization, or another documented strategy.
  - [x] Keep searching, grouping, and scrolling responsive.
  - [x] Loading skeleton and handle error, empty states.
- [x] Improve Shipment list UX
  - [x] Listen keyboard event when input time picker value, up and down key to select hour and minute

### Shipment detail - right panel

- [x] Selecting a shipment opens its details without leaving the page.
- [x] Display the shipment fields, including client, label, status, dates, warehouse, assignment, and coordinates.
- [x] Make only these Core fields editable:
  - [x] `delivery_by_date`
  - [x] `lat`
  - [x] `lng`
- [x] Validate edited dates and coordinates before saving.
- [x] Add a save action that persists the changes through an API call.
- [x] Show saving, success, and failure feedback.
- [x] After saving, keep the list and detail views consistent with the persisted data.

## 2. Stretch - senior-level target

### Status transitions

- [x] Add a status dropdown in shipment detail.
- [x] Show only valid target statuses:
  - [x] `OPEN -> IN_TRANSIT`
  - [x] `IN_TRANSIT -> DELIVERED`
  - [x] `IN_TRANSIT -> OPEN`
  - [x] No transition out of `DELIVERED`
- [x] For `OPEN -> IN_TRANSIT`, require the user to select an assignment and persist `assignment_id`.
- [x] For `IN_TRANSIT -> OPEN`, clear `assignment_id`.
- [x] Prevent invalid transitions such as `OPEN -> DELIVERED` in the UI and business logic.
- [x] Persist a valid status change through the API and refresh affected UI state.

### Map

- [x] Show a map in shipment detail.
- [x] Place a pin at the selected shipment's `lat` and `lng`.
- [x] Update the pin when the selected shipment or its coordinates change.

### Shipment CRUD

- [x] Allow users to create a shipment with sensible defaults.
- [x] Validate required fields before creation.
- [x] Persist new shipments through the API and add them to the correct status group.
- [x] Allow users to delete a shipment.
- [x] Confirm deletion and handle API failure.
- [x] Remove a successfully deleted shipment from the list and clear or update the detail panel.

## 3. Extra Credit - optional

### Assignment page and routing

- [x] Add a second routed page for assignment management.
- [x] Define the assignment model with `id`, `label`, `status`, `clients`, and `shipment_count`.

### Three-panel assignment workflow

- [ ] Panel 1 - Assignment list:
  - [x] Group assignments by `OPEN` and `COMPLETED`.
  - [x] Search assignments by label.
- [x] Panel 2 - Assignment detail:
  - [x] Show all assignment details.
  - [x] List shipments associated with the assignment.
- [x] Panel 3 - Shipment detail:
  - [x] Clicking an assigned shipment shows its details.
  - [x] Show every shipment in the assignment on the map.
  - [x] Connect the shipment pins with lines.
  - [x] Center the map on the selected shipment.

### Assignment CRUD

- [x] Allow users to create an assignment with sensible defaults.
- [x] Allow users to delete an assignment only when it is empty.
- [x] Prevent deletion of non-empty assignments and explain why.

## 4. Engineering and UX review

- [x] Keep components focused and reusable.
- [x] Make list, selection, detail, edit, and API state flow easy to follow.
- [x] Keep business rules outside presentation-only components and make them testable.
- [x] Add focused tests for search, editing/saving, and any implemented status-transition rules.
- [x] Make controls keyboard-accessible and clearly labeled.
- [x] Use readable date and status formatting.
- [x] Make the two-panel Core layout usable at the supported screen sizes.
- [x] Keep the code readable, maintainable, and free of unexplained dead code.
- [x] Ensure you can explain every library, abstraction, and design decision used.

## 5. README and assumptions

- [x] Add `README.md` with:
  - [x] Prerequisites.
  - [x] Dependency installation steps.
  - [x] How to generate or obtain the sample data.
  - [x] How to run the data/API server, if used.
  - [x] How to run the React application.
  - [x] A brief architecture and state-management overview.
  - [x] Performance strategy for 100,000+ shipments.
  - [x] Tradeoffs and intentionally omitted tiers/features.
  - [x] Every reasonable assumption made for ambiguous requirements.
- [x] Document any sample-data gaps you resolve, especially missing `assignment_id` values or assignment records needed for Stretch/Extra Credit.

## 6. Final submission

- [ ] Verify the minimum Core workflow end to end:
  - [ ] Load grouped shipments.
  - [ ] Search by label and client.
  - [ ] Select a shipment.
  - [ ] Edit `delivery_by_date`, `lat`, or `lng`.
  - [ ] Save and confirm the persisted result.
- [x] Run tests, type checking, linting, and a production build.
- [ ] Check the app in a clean install using only the README instructions.
- [ ] Push the project to a **public GitHub repository**.
- [ ] Record a **2-5 minute video** that:
  - [ ] Demonstrates the features implemented.
  - [ ] Explains one or two design decisions.
- [ ] Include or link the video as instructed for the submission.
- [ ] Confirm the public repository and video are accessible without requesting permission.
