# BrewFlow AI — Complete User & System Manual

Welcome to BrewFlow AI! This manual explains how to use every part of the BrewFlow B2B Sales Operating System. It is designed for beginners and non-technical business users.

---

## 1. System Overview

BrewFlow AI helps wholesale brands, manufacturers, coffee roasters, and B2B suppliers manage their sales funnel. 
All data is stored securely in **Supabase** (a cloud Postgres database) and protected by **Row-Level Security (RLS)**. This means users from one company can never view, edit, or delete leads belonging to another company.

---

## 2. Walkthrough of Every Screen & Button

### A. Landing Page (Public Website)
- **"Log In" / "Start Free" buttons:** Found in the top navigation bar. Redirects you to the authentication pages.
- **"Go to Workspace" button:** Appears instead of authentication links if you are already signed in.
- **Interactive Sandbox Selector:** Click status tags (e.g. "Sample Sent", "Customer") to see how metrics and deal pipelines update dynamically.
- **Mobile Menu Button (Hamburger):** Toggle trigger on phone layouts. Slides down a responsive mobile menu overlay.

### B. Sign-in & Sign-up Portals
- **"Back to Home" Link:** Tapping this returns you to the public landing page.
- **"Sign In" / "Create Account" buttons:** Submits your credentials to Supabase Auth.
- **Organization Name Input:** Required during Sign-up to establish your segregated database tenant workspace.

### C. Sales Dashboard Page
- **Metrics Cards:**
  - **Total B2B Leads:** Total counts of active contacts.
  - **Samples Sent:** Number of deals marked "Sample Sent".
  - **Closed Won:** Number of deals marked "Customer".
  - **Projected Revenue:** Projected revenue sums based on lead metrics.
- **Pipeline Snapshot:** A progress meter breakdown of how many leads are in each stage.
- **Recent AI Generations log:** Lists the 6 most recent outreach files compiled by your team.

### D. Lead Scout (AI Sourcing Sandbox)
This is where you find new customers without hallucinated info.
- **USP Text Input:** Describe your company (e.g. "Specialty coffee roaster").
- **"Target Location" & "Target Industry" selectors:** Select where you want to source customers.
- **"Scout Prospects" button:** Queries pre-verified registry of actual B2B targets.
- **"Accept & Save to CRM" button:** Inserts the prospect record into your database `leads` table and initiates tracking.
- **"Dismiss" button:** Removes the prospect from the temporary inbox feed.
- **Qualification Stats box:** Computes Lead Score, ICP Fit %, Competitor supplier matches, and logistics distance from your hub.

### E. Leads Directory (CRM)
- **Tab Swapping buttons:** Switch between "Active Directory" (table list) and "Kanban Pipeline" (drag-and-drop board).
- **"New Lead" button:** Opens the lead creation form modal.
- **Form Inputs:** Business Name, Type, Status, Contact, Phone, Email, Website, Address, City, Current Supplier, Monthly Consumption, Potential Revenue, and general notes.
- **Drag-and-Drop Cards:** Inside the Kanban view, drag cards between columns (e.g., "New Lead" to "Sample Sent") to update the deal stage.

### F. Lead Profile Detail Page
- **"Status" Dropdown:** Swap deal pipeline stages with one click.
- **"Edit Profile" / "Save" buttons:** Opens inputs to edit addresses, websites, contacts, or metrics.
- **"Log Interaction" buttons:** Select Call, Email, Meeting, or Sample Sent, type a note, and click **Log** to record an action.
- **Chronological Timeline Feed:** Displays all logged notes, updates, and creation dates in chronological order.
- **"Delete Lead" button:** Securely removes the lead from the active workspace.

### G. Outreach AI Assistant
- **Outreach prompts list (Sidebar):** Select "Cold Email", "WhatsApp Follow-up", "Competitor Analysis", etc.
- **"Lead Sourcing" Selector:** Choose a B2B contact.
- **"Generate Outreach Script" button:** Calls the Deno Edge Function.
- **Post-Generation actions:**
  - **"Copy" button:** Copy to clipboard.
  - **"Save to Lead Notes" button:** Appends copy draft to the lead's database record.
  - **"Save to Activity Timeline" button:** Adds log to the lead timeline.
  - **"Discard" button:** Clears out the draft box.

### H. Workspace Settings
- **"Save Profile Details" button:** Update email and organizational name profiles.
- **"Danger Zone / Delete Workspace" button:** Prompts you to type the workspace name to cascades delete all database records and sign out.

---

## 3. Database Architecture & Row-Level Security (RLS)

All tables use your unique `organization_id` to enforce multitenant isolation:
1. `organizations`: Core workspace profile.
2. `leads`: Contains B2B customer records.
3. `lead_activity`: Timeline log entries.
4. `ai_generations`: History of copywriter prompts.

Every query executed from the frontend is evaluated against Supabase RLS policies:
```sql
CREATE POLICY "Users can only view their own organization's data" 
ON leads FOR SELECT 
USING (organization_id = auth.jwt() ->> 'org_id');
```
This ensures one company can never access another company's records.

---

## 4. Troubleshooting & Errors

### AI Provider Is Not Configured
- **Why it happens:** The Supabase Edge Function is not deployed, or the `GEMINI_API_KEY` was not configured.
- **The solution:** Run `supabase secrets set GEMINI_API_KEY=your_key` and deploy.

### 403 Access Denied
- **Why it happens:** You are trying to query or edit a lead that does not belong to your active organization session.
- **The solution:** Log out and log in again to verify your active workspace session.
