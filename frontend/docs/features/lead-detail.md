# Lead Detail Page & Activity Timeline — Feature Documentation

This document outlines the purpose, database methods, components, and layout for the Lead Detail feature.

## Overview
Currently, leads are created and edited via a pop-up modal on `/leads`. The Lead Detail page (`/leads/:id`) offers a comprehensive dashboard for sales reps to manage all B2B parameters of a physical wholesale client, draft quick notes, and review historical activity logs in a timeline interface.

## Database API Additions
We have updated `src/lib/leadsApi.js` to support:
1. **`getLead(leadId)`**: Fetches a single lead record matching the ID.
2. **`logActivity` (exported as `logLeadActivity`)**: Exposes the local logging method so the UI can insert custom timeline records (e.g. `note_added`, `call_logged`, `sample_sent`).

## Page Structure (`src/pages/LeadDetail.jsx`)
The interface is split into a header and two main panels:

### 1. Header
- Back navigation button linking to `/leads`.
- Business name (with title styles) and dynamic dropdown selector for the lead's status.
- Edit/Save toggle and Delete button.

### 2. Left Column: Lead Profile Editor
Includes view-only and inline-editing representations for the following groupings:
- **Company Profile:** Business Name, Business Type (e.g. Cafe, Baker, Distributor), Current Supplier, Interested Products.
- **Client Contact:** Contact Name, Job Title, Phone, Email, Website, Instagram, Google Maps location.
- **Consumption & Revenue Metrics:** Estimated Monthly Consumption (weight/qty), Potential Monthly Revenue (monetary values), Lead Source, Initial Contact Date, Next Scheduled Follow-up.
- **Additional Context:** General Notes, Internal Notes.

### 3. Right Column: Timeline & Action Sandbox
- **Action Sandbox:** Tabs to choose between logging a Note, a Call, or a Sample Sent, with a text box. Clicking logs the event in the DB and immediately updates the timeline list.
- **Chronological Timeline:** Scrollable feed showing all audit logs (lead creation, status updates, deletions) and client interaction logs (calls, notes, samples). Each event renders with a specific icon, description, and relative date.
