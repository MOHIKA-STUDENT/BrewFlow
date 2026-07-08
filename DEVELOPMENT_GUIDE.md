# Developer Guide — Component Mapping, Styles, & API Architecture

Welcome to the BrewFlow AI codebase. This guide details the folder structure, component maps, visual styles, and API integrations so you can locate and modify any code with confidence.

---

## 1. Directory Blueprint

```
brewflow-ai/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable layout and widget blocks
│   │   │   ├── Sidebar.jsx    # Left navigation deck (Framer Motion tabs, Coffee logo)
│   │   │   ├── Topbar.jsx     # Header profile menu and theme toggle buttons
│   │   │   ├── StatCard.jsx   # Dashboard metrics cards with spring hover effects
│   │   │   ├── StatusPill.jsx # Outbound stage badges (sage won, gold interested)
│   │   │   └── KanbanBoard.jsx# Interactive drag-and-drop lanes
│   │   ├── pages/            # Page routing endpoints
│   │   │   ├── Landing.jsx    # Public marketing site with parallax and floating cards
│   │   │   ├── Login.jsx      # Sign-in portal with "Back to Home" nav link
│   │   │   ├── Signup.jsx     # Workspace creation with "Back to Home" nav link
│   │   │   ├── Dashboard.jsx  # Main data feed, task calendar, and progress snapshot
│   │   │   ├── Leads.jsx      # Attio-style leads directories & filtering tabs
│   │   │   ├── LeadDetail.jsx # Lead profiles inline editor & chronological activities timeline
│   │   │   ├── FollowUps.jsx  # Linear-style task calendar divided by due date
│   │   │   ├── AIAssistant.jsx# ChatGPT-style workspace draft editor & sidebar history
│   │   │   └── Settings.jsx   # Workspace naming, emails, and Danger Zone deletions
│   │   ├── lib/              # Connectors, contexts, and helper files
│   │   │   ├── AuthContext.jsx# Supabase auth session wrapper & workspace checking
│   │   │   ├── leadsApi.js    # Sanitized database CRUD connector queries
│   │   │   ├── aiService.js   # Edge function boundary & client template fallbacks
│   │   │   └── theme.js       # Persistent theme helper (localStorage)
│   │   ├── App.jsx            # React route router mappings
│   │   ├── index.css          # Main stylesheet (fonts, custom color tokens)
│   │   └── main.jsx           # Main entry point hook
│   └── package.json           # Frontend dependency config
└── supabase/                  # Deno Edge functions & migrations
```

---

## 2. Design Tokens & Visual Styling

The design follows a premium ivory-navy brand color scheme with gold accents. All variables are loaded as CSS custom properties in [index.css](file:///c:/Users/MOHIKA/Downloads/brewflow-ai-with-crud/brewflow-ai/frontend/src/index.css):

### Color Variables
- **Warm Ivory Background:** `rgba(247, 245, 239, 0.4)` (loaded as light theme canvas background)
- **Deep Navy Text/Surface:** `#14213D` (loaded as primary headers and dark theme elements)
- **Luxury Gold Accent:** `#D8A64C` (loaded as logo highlights, active states, and focus borders)
- **Sage Success Tone:** `#5B7553` (used on Closed Won status indicators)
- **Brick Danger Tone:** `#E06656` (used on Overdue tasks, alerts, and deletion confirmation panels)

### Typography
- **Space Grotesk:** Set for uppercase display tags and main section titles (`font-display`).
- **Inter:** Set for standard descriptions and layout grids (`font-body`).
- **IBM Plex Mono:** Set for numeric prices, dates, weights, and logs (`font-mono`).

---

## 3. Database API Connectors

All data queries are routed through Supabase JS clients:

- **Auth Session Tracking:** Managed within [AuthContext.jsx](file:///c:/Users/MOHIKA/Downloads/brewflow-ai-with-crud/brewflow-ai/frontend/src/lib/AuthContext.jsx).
- **Leads CRUD Queries:** Managed inside [leadsApi.js](file:///c:/Users/MOHIKA/Downloads/brewflow-ai-with-crud/brewflow-ai/frontend/src/lib/leadsApi.js). 
  - *Note:* If you add any custom fields to the postgres tables, you must whitelist them inside the `LEADS_COLUMNS` array in [leadsApi.js](file:///c:/Users/MOHIKA/Downloads/brewflow-ai-with-crud/brewflow-ai/frontend/src/lib/leadsApi.js#L1-L25) to allow sanitization and prevent Postgres casting errors.

---

## 4. Animation Settings (Framer Motion)

Animations use spring physics parameters rather than simple ease curves to feel responsive:

- **Magnetic Hover Lift:**
  ```javascript
  whileHover={{ y: -6, scale: 1.01 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
  ```
- **Active Navigation Glide:**
  We use `layoutId="activeTab"` on NavLinks inside [Sidebar.jsx](file:///c:/Users/MOHIKA/Downloads/brewflow-ai-with-crud/brewflow-ai/frontend/src/components/Sidebar.jsx). This tells Framer Motion to automatically animate the background overlay pill when switching tabs.
- **Infinite Floating Loop:**
  Applied to the Landing page deck preview cards:
  ```javascript
  animate={{ y: [110, 98, 110] }}
  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
  ```

---

## 5. Modifying Specific UI Sections

### Want to change status bar colors?
Open [StatusPill.jsx](file:///c:/Users/MOHIKA/Downloads/brewflow-ai-with-crud/brewflow-ai/frontend/src/components/StatusPill.jsx) and adjust the border or background properties inside the `STYLES` object map.

### Want to edit custom fields on the lead create form?
1. Open [LeadFormModal.jsx](file:///c:/Users/MOHIKA/Downloads/brewflow-ai-with-crud/brewflow-ai/frontend/src/components/LeadFormModal.jsx).
2. Insert your new input field.
3. Update the initial state variables.
4. Add the key name to the `LEADS_COLUMNS` whitelist in [leadsApi.js](file:///c:/Users/MOHIKA/Downloads/brewflow-ai-with-crud/brewflow-ai/frontend/src/lib/leadsApi.js).
