# Database Schema & Security Policies — BrewFlow AI

This document maps the Postgres database structure, tables, columns, foreign keys, and RLS policies of BrewFlow AI.

---

## 1. Entity Relationship Model

```mermaid
erDiagram
    organizations {
        uuid id PK
        text name
        timestamp created_at
    }
    leads {
        uuid id PK
        uuid organization_id FK
        text business_name
        text business_type
        text status
        text contact_person
        text phone
        text email
        text website
        text current_supplier
        text interested_products
        numeric potential_monthly_revenue
        text general_notes
        boolean is_deleted
        timestamp created_at
    }
    lead_activity {
        uuid id PK
        uuid lead_id FK
        uuid organization_id FK
        uuid user_id
        text event_type
        text previous_value
        text new_value
        timestamp created_at
    }
    ai_generations {
        uuid id PK
        uuid organization_id FK
        uuid lead_id FK
        uuid user_id
        text prompt_type
        text provider
        text model
        text prompt
        text response
        text status
        integer tokens_used
        integer latency_ms
        text error_message
        timestamp created_at
    }

    organizations ||--o{ leads : "owns"
    leads ||--o{ lead_activity : "logs"
    leads ||--o{ ai_generations : "tracks"
```

---

## 2. Row-Level Security (RLS) Definitions

All tables have RLS enabled. No query can bypass RLS constraints.

### Leads Isolation Policy
```sql
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow workspace reads"
ON leads FOR SELECT
USING (organization_id = (auth.jwt()->>'org_id')::uuid);

CREATE POLICY "Allow workspace inserts"
ON leads FOR INSERT
WITH CHECK (organization_id = (auth.jwt()->>'org_id')::uuid);

CREATE POLICY "Allow workspace updates"
ON leads FOR UPDATE
USING (organization_id = (auth.jwt()->>'org_id')::uuid);

CREATE POLICY "Allow workspace soft-delete"
ON leads FOR DELETE
USING (organization_id = (auth.jwt()->>'org_id')::uuid);
```

### AI Generations History Policy
```sql
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow generation history read"
ON ai_generations FOR SELECT
USING (organization_id = (auth.jwt()->>'org_id')::uuid);

CREATE POLICY "Allow generation logs insert"
ON ai_generations FOR INSERT
WITH CHECK (organization_id = (auth.jwt()->>'org_id')::uuid);
```
