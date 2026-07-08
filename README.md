# BrewFlow AI — B2B Sales Operating System

BrewFlow AI is an enterprise-grade Sales Operating System tailored for B2B brands and distributors selling physical goods (e.g. oat milk suppliers, wholesale coffee providers, bakeries, and packaging companies). It replaces scattered spreadsheets with a secure, multi-tenant workspace to track deals, manage pipeline stages, log calling notes, scout verified prospects, and automatically draft AI-personalized outreach materials.

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
├── ARCHITECTURE.md                 # System topological flow
├── DATABASE.md                     # Database ERD & table mappings
├── API.md                          # API connector endpoints
├── FEATURES.md                     # Detailed product feature lists
├── SECURITY.md                     # Row-Level Security configurations
├── CHANGELOG.md                    # Historical updates tracker
├── PROJECT_STATUS.md               # Readiness scoreboards
├── DEPLOYMENT.md                   # Hosting/Edge setup guides
├── ROADMAP.md                      # Upcoming engineering goals
├── TESTING.md                      # QA manual checklists
├── USER_MANUAL.md                  # Comprehensive user guides
├── frontend/                       # React frontend source files
│   ├── src/
│   │   ├── App.jsx                 # App router, page layouts, and theme wrapper
│   │   ├── main.jsx                # DOM entry point
│   │   ├── index.css               # Design system tokens and styles
│   │   ├── components/             # Reusable UI component modules
│   │   │   ├── Sidebar.jsx         # Navigation panel (with mobile close triggers)
│   │   │   ├── Topbar.jsx          # Clickable profile menu and theme toggle
│   │   │   ├── CustomSelect.jsx    # Animated glassmorphic select dropdowns
│   │   │   ├── KanbanBoard.jsx     # Pipeline board with HTML5 drag-and-drop
│   │   │   └── StatusPill.jsx      # Dynamic pipeline stage colors
│   │   └── pages/                  # Page modules
│   │       ├── Landing.jsx         # Marketing landing page
│   │       ├── Dashboard.jsx       # Analytics metrics and follow-up alerts
│   │       ├── Leads.jsx           # Sales list and pipeline board selector
│   │       ├── LeadDetail.jsx      # Lead profile editor and note logger
│   │       ├── LeadScout.jsx       # AI Sourced prospecting inbox
│   │       └── AIAssistant.jsx     # Sales copy generation interface
└── supabase/
    └── functions/                  # Deno Edge Functions
        └── generate-sales-copy/    # Secure AI copywriter
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
  │
  ▼
Gemini API (Returns dynamic content based on whitelisted data context)
```

---

## 5. Local Development Setup

To boot up the project locally:

1. **Install Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Run Dev Server:**
   ```bash
   npm run dev
   ```

3. **Deploy Edge functions:**
   Configure your `GEMINI_API_KEY` inside Supabase secrets and run:
   ```bash
   supabase functions deploy generate-sales-copy
   ```
