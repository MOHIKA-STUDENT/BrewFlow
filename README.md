# BrewFlow AI — Enterprise B2B Sales Operating System

BrewFlow AI is an enterprise-grade Sales Operating System designed for B2B brands and physical goods distributors (e.g., specialty wholesale coffee roasters, oat milk suppliers, bakeries, packaging companies, and logistics hubs). 

It replaces cluttered spreadsheets with a secure, multi-tenant workspace to track deals, manage pipeline stages, log calling interactions, scout verified target prospects, and dynamically generate hyper-personalized sales outreach copy.

---

## 🚀 Key Modules & Functional Features

### 1. CRM Lead Directory & Kanban Pipeline
* **Dual-View Interface:** Seamlessly toggle between a dense tabular directory (Attio CRM style) with search capabilities, and a visual Kanban Board.
* **Drag-and-Drop Deal Funnel:** Move leads across columns (`New Lead` ➔ `Contacted` ➔ `Interested` ➔ `Sample Sent` ➔ `Negotiation` ➔ `Customer` ➔ `Lost`) to instantly update database states.
* **Real-time Pipeline Analytics:** Projected revenue values automatically aggregate at the top of each Kanban lane.
* **Comprehensive CRM CRUD Operations:**
  * **Create:** Add new leads using a slide-over modal containing business parameters (contact info, address, current supplier, consumption patterns, potential values, and notes).
  * **Read:** View detailed profile sheets for individual leads, showing contact details and interaction logs.
  * **Update:** In-line editing of profiles, status changes, and follow-up targets.
  * **Soft-Delete:** Standard soft-delete flow allows recovery of records, and danger zone controls allow absolute removal.

### 2. AI Lead Scout (Prospect Finder)
* **Pre-verified Sourcing Inbox:** Discover real, pre-verified B2B targets based on region and industry, avoiding AI hallucinations.
* **ICP Match & Score Engine:** Enter your company's USP (e.g., *"We roast organic single-origin coffee"*), specify the region, and let the engine score prospects (Match %, estimated B2B consumption volumes, distance from your logistics hub).
* **Inbox Integration:** View prospects in a temporary list. Click **Accept & Save to CRM** to insert them directly into your database leads table, or **Dismiss** to clear them.

### 3. Outreach AI Assistant
* **Contextual Copywriter:** Generates tailored sales copy (Cold Emails, WhatsApp Follow-ups, Cold Call Hooks, Competitor Analysis, and Follow-up sequences) utilizing the specific details of a lead (current supplier, business type, address).
* **Dual Execution Modes:**
  * **Live AI Mode:** Hits a Supabase Deno Edge Function calling Google Gemini (`gemini-1.5-flash`), auditing token counts and execution times straight to the DB.
  * **Local Fallback Mode:** Operates automatically when keys are missing or offline, showing clear warning overlays.
* **Direct CRM Commits:** Copy output to your clipboard, or save drafts instantly to the Lead's database notes or activity timeline with a single click.

### 4. Chronological Activity & Timeline Audit
* **Audit Trails:** Every deal movement (e.g., dragging a lead from "Interested" to "Sample Sent") automatically writes an event trail to the database.
* **Interaction Logging:** Record manual interactions (Calls, Emails, Meetings, Catalog/Sample Shipments) with detailed summaries directly inside the lead's detail panel.
* **Timeline Feed:** A vertical, responsive, chronological stream displays all history logs for full sales transparency.

### 5. Workspace Tenancy & Danger Zone Controls
* **Tenant Isolation:** Users manage their organization profile.
* **Cascade deletion:** Authorize workspace deletion by matching the profile's name in a protection modal, triggering cascade removals of all organization tables, logging the session out, and cleaning resources.

---

## 🛠️ Tech Stack & Architecture

### Frontend
* **Core:** React, Vite, ES6 Javascript.
* **Styling:** Tailwind CSS v4, custom theme selector-based dark mode, and custom glassmorphism components.
* **Animations:** Framer Motion for smooth transitions, slide-over sheets, and modal animations.
* **Icons:** Lucide React.
* **Routing:** React Router v6.

### Backend & Serverless
* **Database:** Supabase PostgreSQL Database.
* **Security:** Row Level Security (RLS) policies ensuring tenant partition isolation at the query layer.
* **Serverless Functions:** Supabase Edge Functions written in TypeScript (run via Deno).
* **AI Orchestrator:** Google Gemini Pro API.

---

## 📁 Directory Structure

```
brewflow-ai/
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
│   └── package.json
└── supabase/
    ├── functions/                  # Deno Edge Functions
    │   └── generate-sales-copy/    # Secure AI copywriter edge function
    └── config.toml
```

---

## 🔒 Row-Level Security (RLS) & Multi-Tenancy

Every database query routes through PostgreSQL security gates. Table access is strictly limited using auth validation context:
```sql
CREATE POLICY "Users can only view their own organization's data" 
ON leads FOR SELECT 
USING (organization_id = auth.jwt() ->> 'org_id');
```
This guarantees that different organizations running on the same database cluster can never view or modify each other's leads, activities, or logs.

---

## 🌐 Secure AI Architecture Flow

To comply with enterprise standards, Google API Keys are never bundled with the frontend source or sent to client browsers.

```
React App (UI)
   │
   │ 1. Invoke('generate-sales-copy', { leadId, promptType })
   ▼
Supabase Edge Function (Deno) ─── [Reads GEMINI_API_KEY from secure Vault]
   │
   ├─ 2. Fetch Lead details from PostgreSQL (Validates organization owner)
   ├─ 3. POST https://generativelanguage.googleapis.com/...
   │
   ▼
Gemini API (Returns dynamic copy based on lead-specific context attributes)
```

---

## ⚙️ Local Development Setup

To boot up the project locally:

### 1. Install Dependencies
Navigate to the frontend directory and install dependencies:
```bash
cd frontend
npm install
```

### 2. Configure environment keys
Create a `.env` file in the `frontend/` directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
```

### 3. Deploy Supabase Edge Functions & Configure AI
Configure your Gemini API key inside the Supabase secure secrets vault, and deploy the copywriting serverless function:
```bash
# Set your Gemini API key in Supabase
supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here

# Deploy the Edge Function
supabase functions deploy generate-sales-copy
```

### 4. Run Development Server
Start the local Vite development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
