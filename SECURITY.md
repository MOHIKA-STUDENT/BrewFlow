# Security Architecture & Policies — BrewFlow AI

This document details the enterprise-grade security and multitenancy isolation implemented in BrewFlow AI.

---

## 1. Multi-tenant Database Isolation

BrewFlow AI uses shared database multitenancy. Separation is strictly enforced by Postgres **Row-Level Security (RLS)**:

- **Token Handshake:** When a user logs in, Supabase issues a JWT access token containing their user ID and organization ID (`org_id`).
- **Database Evaluation:** All database read/write queries from the client automatically append the user's active session token. 
- **Enforcement Rules:** The database queries verify matching IDs before executing:
  `organization_id = (auth.jwt()->>'org_id')::uuid`
  If a malicious client alters their browser request to scan arbitrary IDs, Supabase rejects the command or returns zero rows because the request's JWT organization claim does not match.

---

## 2. API Key Safety & Secrets Isolation

The frontend codebase is completely keyless. No AI API keys or Supabase service keys are stored in the bundle, local configurations, or browser storage.

- **Safe Boundaries:** The client makes calls to abstract Supabase Edge Functions (`supabase.functions.invoke`).
- **Secrets Management:** The Gemini API Key is stored inside Deno Edge environment variables (`Deno.env.get('GEMINI_API_KEY')`).
- **Verification checks:** The Edge Function decodes the user's Auth JWT, verifies they own the lead ID, and calls Gemini only if the authorization checks pass.

---

## 3. Input Sanitization & Form Protections

- **Casting Mismatch prevention:** All lead submissions are parsed through a strict whitelist helper (`sanitizeFields`) in `leadsApi.js`. This prevents SQL injection and filters out blank form strings into standard database NULL types.
- **Verification modal:** Destructive workspace operations require spelling confirmation (e.g. typing your organization's exact name) to confirm deletion.
