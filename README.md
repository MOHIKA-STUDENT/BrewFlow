# BrewFlow AI — B2B Sales Operating System

BrewFlow AI is an enterprise-grade Sales Operating System tailored for B2B brands and distributors selling physical goods (e.g. oat milk suppliers, wholesale coffee providers, bakeries, and packaging companies). It replaces scattered spreadsheets with a secure, multi-tenant workspace to track deals, manage pipeline stages, log calling notes, and automatically draft AI-personalized outreach materials.

---

## 1. Tech Stack

- **Frontend:** React + Vite, Tailwind CSS v4 (Design Token styling, selector-based dark mode).
- **Backend/Database:** Supabase (PostgreSQL database, Row Level Security, secure Edge Functions).
- **Icons:** Lucide React.
- **Routing:** React Router v6.

---

## 2. Directory Structure

```
brewflow-ai/
├── .gitignore                      # Root-level Git exclude configuration
├── README.md                       # Core project documentation (this file)
├── frontend/                       # React frontend source files
│   ├── .gitignore                  # Frontend Git ignore
│   ├── index.html                  # Core HTML container
│   ├── package.json                # Project dependencies and startup scripts
│   ├── src/
│   │   ├── App.jsx                 # App router, page layouts, and theme wrapper
│   │   ├── main.jsx                # DOM entry point
│   │   ├── index.css               # Design system tokens and styles
│   │   ├── components/             # Reusable UI component modules
│   │   │   ├── Sidebar.jsx         # Permanently dark sidebar navigation
│   │   │   ├── Topbar.jsx          # Clickable organization dropdown and theme toggle
│   │   │   ├── KanbanBoard.jsx     # Pipeline board with HTML5 drag-and-drop
│   │   │   ├── LeadFormModal.jsx   # Expanded B2B fields modal form
│   │   │   └── StatusPill.jsx      # Dynamic pipeline stage colors
│   │   ├── lib/                    # Library modules & contexts
│   │   │   ├── AuthContext.jsx     # Workspace loading and user sessions
│   │   │   ├── supabaseClient.js   # Supabase client connector
│   │   │   ├── leadsApi.js         # Whitelisted CRUD datastore transactions
│   │   │   ├── aiService.js        # AI abstraction service with local templates
│   │   │   └── theme.js            # Theme toggling and localStorage persistence
│   │   └── pages/                  # Page modules
│   │       ├── Landing.jsx         # Marketing landing page
│   │       ├── Login.jsx           # Split-screen sign-in view
│   │       ├── Signup.jsx          # Split-screen workspace creator
│   │       ├── Dashboard.jsx       # Analytics metrics and follow-up alerts
│   │       ├── Leads.jsx           # Sales list and pipeline board selector
│   │       ├── LeadDetail.jsx      # Lead profile editor and note logger
│   │       ├── FollowUps.jsx       # Live overdue/upcoming scheduler
│   │       └── AIAssistant.jsx     # sales copy generation interface
└── supabase/
    └── functions/                  # Deno Edge Functions
        └── generate-sales-copy/    # Secure AI copywriter
            └── index.ts            # Edge Function entry point
```

---

## 3. Database Schema

BrewFlow AI secures data at the Postgres query layer. Every table is isolated using **Row Level Security (RLS)**, ensuring users can only interact with rows belonging to an organization they own.

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
                  ┌───────────┴───────────┐
                  │  (Activity & Logs)   │
                  │  ─ lead_activity      │
                  │  ─ ai_generations     │
                  └───────────────────────┘
```

- **`organizations`:** Custom business profile linked to owner auth UUID.
- **`leads`:** B2B prospect records (e.g. business name, metrics, city, current supplier).
- **`lead_activity`:** Timeline audit trail logging deal movements.
- **`ai_generations`:** Generation auditing logs storing prompt metadata.

---

## 4. Secure AI Architecture Flow

To comply with enterprise-grade B2B security, API keys and secrets are never stored in localStorage or exposed to the client browser.

```
React UI 
  │
  │ 1. invoke('generate-sales-copy', { leadId, promptType })
  ▼
Supabase Edge Function (Deno) ───[Reads GEMINI_API_KEY from secure Vault]
  │
  ├─ 2. Fetch Lead details from Postgres (Validates organization owner)
  ├─ 3. POST https://generativelanguage.googleapis.com/...
  ├─ 4. Log prompt metadata to `ai_generations`
  ▼
Return Copy Text to React UI
```

- **Graceful Fallback:** If the Supabase Edge Function is not deployed or fails due to network issues, the frontend client automatically falls back to a **local rule-based template copywriter**, ensuring zero downtime.

---

## 5. Step-by-Step Configuration Guide

Follow these steps to configure your database and enable the AI Sales Assistant.

### Step 1: Run Table Creation and SQL Grants
Go to your **Supabase Dashboard** -> click **SQL Editor** in the left sidebar -> click **New Query** -> Paste the following SQL script -> click **Run**:

```sql
-- 1. Create AI generations logging table
create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) not null,
  lead_id uuid references public.leads(id),
  user_id uuid references auth.users(id),
  prompt_type text not null,
  provider text not null,
  model text not null,
  prompt text not null,
  response text not null,
  created_at timestamptz default now()
);

-- 2. Enable Row Level Security
alter table public.ai_generations enable row level security;

-- 3. Create RLS policies (Isolated per organization owner)
create policy "Users can view their own org's AI generations"
  on public.ai_generations for select
  using (
    organization_id in (select id from public.organizations where owner_id = auth.uid())
  );

create policy "Users can insert their own org's AI generations"
  on public.ai_generations for insert
  with check (
    organization_id in (select id from public.organizations where owner_id = auth.uid())
  );

-- 4. Grant table privileges to client roles
GRANT ALL ON public.ai_generations TO anon, authenticated, service_role;
```

### Step 2: Set your Gemini API Key in Supabase
Set the environment variable in your Supabase project so the Edge Function can access it. Run this in your terminal using the Supabase CLI:
```bash
supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here
```
*(Alternatively, you can add it in the Supabase Dashboard under Project Settings -> API -> Secrets).*

### Step 3: Deploy the Edge Function
Deploy the sales copywriter Edge Function from your local workspace to your Supabase project:
```bash
supabase functions deploy generate-sales-copy
```

---

## 6. How to Run Locally

1. **Install Dependencies:**
   ```bash
   cd frontend
   npm install
   ```
2. **Configure Environment Variables:**
   Create a `.env` file in the `frontend` folder with your Supabase keys:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
3. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` to interact with the Sales Operating System.
