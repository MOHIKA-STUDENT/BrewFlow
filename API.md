# API Documentation & Contracts — BrewFlow AI

This document catalogs the system API boundaries, Edge Function contracts, and client-side database queries.

---

## 1. Supabase Edge Function: `generate-sales-copy`

- **Endpoint:** `POST https://<project-ref>.supabase.co/functions/v1/generate-sales-copy`
- **Security:** Requires a bearer token authorization header (JWT). The Deno script uses this token to connect to Supabase and verify ownership of the lead.

### Request Body Payload
```json
{
  "leadId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "promptType": "cold_email",
  "organizationId": "6c2ded4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "userId": "1a2ded4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
}
```
*Note:* Valid `promptType` keys are: `cold_email`, `whatsapp_followup`, `call_script`, `meeting_summary`, `lead_summary`, `next_best_action`, `prospect_research`, `competitor_analysis`, `followup_sequence`.

### Successful Response (HTTP 200)
```json
{
  "text": "Subject: Wholesale catalog for Blue Bottle Coffee...",
  "provider": "gemini",
  "model": "gemini-1.5-flash"
}
```

### Error Responses
- **HTTP 401 Unauthorized:** Missing or invalid Authorization header.
- **HTTP 403 Forbidden:** Lead does not belong to the caller's organization.
- **HTTP 500 Server Error:** Gemini API Key is missing from Supabase secrets, or connection failed.

---

## 2. Client-Side Database Connectors (`leadsApi.js`)

All client operations execute against the Supabase Client:

### Read Leads
```javascript
export async function getLeads()
// Returns Array of leads where is_deleted = false
```

### Create Lead
```javascript
export async function createLead(organizationId, userId, fields)
// Inserts new lead row, registers timeline creation log, and returns created row object
```

### Update Lead
```javascript
export async function updateLead(leadId, organizationId, userId, fields)
// Updates lead columns and logs activity timeline updates
```
