# Kanban Board, SaaS Theme & Diagnostics — Feature Documentation

This document logs details for the design system update, dropdown profile menu, loading diagnostics, and the Kanban pipeline board.

## 1. Sleek Slate & Indigo Theme System
The design variables in `src/index.css` are updated to map variables to a modern tech SaaS look:
- **Backgrounds:** Slate-50 (light mode base) and slate-950 (dark mode base).
- **Cards/Panels:** Pure white (light mode) and slate-900 (dark mode).
- **Primary Accent:** Royal Indigo (`#4f46e5`).
- **Won/Lost States:** Emerald-500 (`#10b981`) and Rose-500 (`#f43f5e`).

## 2. Tailwind v4 Class-based Dark Mode
Vite + Tailwind v4 utilizes media query queries for dark variants by default. We enable class-based dark mode by appending this custom variant line in `index.css`:
```css
@variant dark (&:where(.dark, .dark *));
```
This forces Tailwind to look at the presence of the `.dark` class on the `<html>` element, resolving the toggle issues.

## 3. Clickable Topbar Profile Avatar Menu
The Topbar avatar `div` is updated to a clickable state, showing user credentials and organization details (fetched from `useAuth`) in a pop-over dropdown list. It features a working "Sign out" button linking to Supabase's auth state controller.

## 4. Database Setup & Diagnostic Alerts
Because Supabase table privileges can sometimes be restricted (returning code `42501` permission errors), we've updated `AuthContext.jsx` to catch and expose database queries errors:
- If `organization` is null, the workspace loading screen dynamically displays the error message.
- It displays a helpful guide with the exact queries to run in the Supabase SQL editor to grant SELECT/INSERT permissions.

## 5. Kanban Board (`src/components/KanbanBoard.jsx`)
- **Status Lanes:** Displays leads grouped into: `New Lead`, `Contacted`, `Interested`, `Sample Sent`, `Negotiation`, `Customer`, and `Lost`.
- **Pipeline Estimator:** Sums lead counts and potential monthly revenues for each column dynamically.
- **HTML5 Drag-and-Drop:** Native API bindings:
  - Dragging a card stores the lead ID in dataTransfer: `e.dataTransfer.setData("text/plain", leadId)`.
  - Dropping on a column lane fires a callback to call `updateLead(id, updates)` in the database, automatically updating client status and logging timeline activity.
