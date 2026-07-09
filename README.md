# BrewFlow AI — B2B Sales Operating System (Handbook & Tech Stack)

BrewFlow AI is an enterprise-grade Sales Operating System tailored for B2B brands and physical goods distributors (e.g., oat milk suppliers, wholesale coffee providers, bakeries, and packaging companies). It replaces scattered spreadsheets with a secure, multi-tenant workspace to track deals, manage pipeline stages, log calling notes, scout verified prospects, and automatically draft AI-personalized outreach materials.

---

## 🛠️ Complete Tech Stack Deep-Dive

### 1. Frontend Framework
* **React + Vite:** Chosen for lightning-fast compilation, zero bundling overhead, and standard single-page app (SPA) performance.
* **React Router v6:** Configured with semantic paths (`/` for Landing page, `/leads` for CRM, `/leads/:id` for Profiles, `/scout` for Sourcing, `/ai-assistant` for Copylab, `/settings` for Workspaces).
* **Framer Motion:** Handles all smooth animations, Kanban drag state changes, side-drawer transitions, and floating notification boxes.
* **Lucide React:** Selected as the centralized vector iconography library.
* **Tailwind CSS v4:** Leverages design token utilities for full responsiveness and selector-based dark mode (`dark` class toggle on the HTML element).

### 2. Backend & Serverless Layers
* **Supabase (PostgreSQL):** Relational database storing tabular records with schema relation constraints.
* **Row-Level Security (RLS):** All data operations (reads, updates, inserts, deletes) are filtered at the SQL layer using JWT auth context mapping. One tenant organization can never read/manipulate rows belonging to another organization.
* **Deno Edge Functions (`generate-sales-copy`):** Abstracted TypeScript serverless function that securely interacts with external web APIs and hides private access credentials from client-side inspectors.

### 3. AI Sourcing & Integration Stack
* **OpenStreetMap Geocoding (Nominatim API):** Used in the lead scout scanner to convert unstructured location inputs (e.g., *"Mumbai"*, *"San Francisco"*) into exact latitude and longitude coordinates.
* **Overpass API (OSM Query Engine):** Runs a spatial query within a 15km radius (`around:15000`) of geocoded coordinates to extract real B2B entities (Cafés, Bakeries, Ice Cream shops, etc.) to prevent hallucinated lead information.
* **Universal AI Router (Serverless LLM Gateway):** Smart router built into the Deno Edge Function that automatically selects the API endpoint and model based on the prefix of the configured key:
  * **OpenRouter** (`sk-or-v1-`) ➔ Llama-3.2-3b-instruct:free
  * **Anthropic** (`sk-ant-`) ➔ Claude-3-5-Sonnet
  * **Groq** (`gsk_`) ➔ Llama-3-8b
  * **OpenAI** (`sk-` / `sk-proj-`) ➔ GPT-4o
  * **Google Gemini** (Default) ➔ Gemini-1.5-Flash

---

## ⚙️ How It Works (System Architecture Flow)

```
                            ┌──────────────────────────────────┐
                            │            React UI              │
                            └────────────────┬─────────────────┘
                                             │
                                             │ 1. Invoke Edge Function
                                             ▼
                            ┌──────────────────────────────────┐
                            │    Supabase Edge Function (Deno) │
                            └────────────────┬─────────────────┘
                                             │
                      ┌──────────────────────┴──────────────────────┐
                      │ 2. Read Secrets & Keys (Vault)              │
                      │ 3. Fetch Context from Postgres (RLS check)  │
                      ▼                                             ▼
    ┌──────────────────────────────────┐          ┌──────────────────────────────────┐
    │    OpenStreetMap / Overpass API  │          │      Universal AI Gateway        │
    │  (Queries real-world coordinates)│          │  (Queries Gemini, GPT-4o, etc.)  │
    └──────────────────────────────────┘          └──────────────────────────────────┘
```

### 1. Multi-Tenant Registration & Login
When a user registers:
1. An organization profile is added to the `organizations` table.
2. The user UUID is mapped directly to the organization.
3. Every subsequent query automatically checks that the user's active session token matches the data rows.

### 2. CRM & Kanban Operations
The Leads table operates on standard **CRUD** actions:
* **Create:** Submits data through a slide-out modal. This records a timeline activity entry of type `created`.
* **Read:** Grabs all leads in real time, ignoring soft-deleted entries.
* **Update:** Updates fields. Dragging cards across Kanban lanes instantly modifies the `status` and writes a `status_changed` transaction activity.
* **Delete:** Performs a soft delete to mark the lead as `is_deleted = true`, protecting record history.

### 3. Sourcing Verified B2B Prospects
When scouting prospects:
1. The user describes their business and specifies a region.
2. The system calls Nominatim to find the location coordinates.
3. Overpass queries OpenStreetMap nodes within 15km matching `amenity=cafe` or `amenity=bakery`.
4. The verified list is fed to the LLM along with the company details.
5. The LLM rates the lead scoring, ICP fit, competitor supplier threats, monthly consumption volume, and returns a structured JSON payload.
6. The user views these targets and can accept them directly to the CRM database.

### 4. Personal Copywriter & Generations Tracking
For outreach scripts:
1. The React app triggers a server request with the `leadId` and `promptType`.
2. The Edge Function verifies the client owns the lead.
3. It fetches the lead details (business name, interested products, current supplier, city) and merges them with specialized B2B templates.
4. The universal router invokes the active LLM.
5. Transaction metadata (latency, provider name, prompt text) is stored in the `ai_generations` log table.
6. Copy outputs can be saved straight back to the lead's database records.

---

## 📂 Core Database Schema

```
                  ┌───────────────────────┐
                  │     organizations     │
                  └───────────┬───────────┘
                              │ 1
                              │
                              │ *
                  ┌───────────▼───────────┐
                  │         leads         │
                  └───────────┬───────────┘
                              │
                   ┌──────────┴───────────┐
                   │  (Activity & Logs)   │
                   │  ─ lead_activity      │
                   │  ─ ai_generations     │
                   └───────────────────────┘
```

* **`organizations`:** Custom business profile linked to the owner auth UUID.
* **`leads`:** B2B prospect records (e.g. business name, metrics, city, current supplier).
* **`lead_activity`:** Chronological timeline audit trails logging deal status movements and call logs.
* **`ai_generations`:** Auditing logs storing generation prompt history, latency metrics, and status configurations.

---

## 🚀 Setup & Execution Guide

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment Keys
Add a `.env` file inside your `frontend/` directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_public_key
```

### 3. Deploy Edge Functions & Secrets
Configure your AI provider keys inside Supabase Vault and deploy the functions:
```bash
# Example for Google Gemini
supabase secrets set GEMINI_API_KEY=your_api_key_here

# Deploy the Edge Function
supabase functions deploy generate-sales-copy
```

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
