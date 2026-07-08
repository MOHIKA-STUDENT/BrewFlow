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
  status text default 'completed',
  tokens_used integer,
  latency_ms integer,
  error_message text,
  created_at timestamptz default now()
);

-- 2. Enable Row Level Security
alter table public.ai_generations enable row level security;

-- 3. Create RLS policies (Isolated per organization owner)
drop policy if exists "Users can view their own org's AI generations" on public.ai_generations;
create policy "Users can view their own org's AI generations"
  on public.ai_generations for select
  using (
    organization_id in (select id from public.organizations where owner_id = auth.uid())
  );

drop policy if exists "Users can insert their own org's AI generations" on public.ai_generations;
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

## 6. Complete Free Tier Deployment Guide

BrewFlow AI is built to be hosted entirely on **Free Tier** services:
- **Database & Edge Functions:** Hosted on **Supabase** (Free Tier - includes free Postgres, Auth, and 5 Edge Functions).
- **React Frontend:** Hosted on **Vercel** (Free Tier - includes free SSL, global CDN, and automatic Git deployments).

---

### Part A: Database & AI Edge Function (Supabase)

#### 1. Create logging tables
Run the SQL Setup script from **Section 5** inside the **Supabase SQL Editor** to create the RLS logging tables and grant database schema usage privileges.

#### 2. Install Supabase CLI on Windows
To deploy Edge Functions, you need the Supabase CLI. Open **PowerShell** as Administrator on your computer and run:
```powershell
winget install Supabase.CLI
```
*Note: After the installation finishes, close and reopen your PowerShell window to refresh environment paths.*

#### 3. Login and link project
In your PowerShell window, navigate to your project directory (`brewflow-ai`) and run:
```powershell
# 1. Log in to your Supabase CLI account
supabase login

# 2. Link your local directory to your online Supabase project
# (Replace 'your-project-ref' with the reference ID from your Supabase Dashboard url)
supabase link --project-ref your-project-ref
```

#### 4. Configure Gemini API Secrets
Set the secure environment variable on Supabase (get your free key from [Google AI Studio](https://aistudio.google.com/)):
```powershell
supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here
```

#### 5. Deploy the Edge Function
Run the deploy command from the project root folder:
```powershell
supabase functions deploy generate-sales-copy
```

---

### Part B: Frontend Deployment (Vercel)

Vercel hosts frontend React applications for free and automatically redeploys them every time you push changes to GitHub.

#### 1. Push code to GitHub
Make sure all your local files are committed and pushed to your repository:
```bash
git add .
git commit -m "deploy: prep config"
git push
```

#### 2. Connect and Deploy on Vercel
1. Go to [Vercel](https://vercel.com/) and sign up using your **GitHub** account.
2. Click **"Add New"** -> **"Project"**.
3. Locate your **BrewFlow** repository and click **"Import"**.
4. In the **Environment Variables** section, add your frontend environment variables:
   - `VITE_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-public-key`
5. Click **"Deploy"**.

Vercel will compile your code and build your application. Within 1 minute, it will provide you with a public URL (e.g. `https://brewflow-ai.vercel.app`) to access your app from anywhere!
