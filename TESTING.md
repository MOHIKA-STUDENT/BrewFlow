# Testing & QA Manual — BrewFlow AI

Testing methodology, automated build checks, and manual verification checklists for BrewFlow AI.

---

## 1. Automated Build Verification
Verify that the project compiles with no warnings or syntax errors:
```bash
cd frontend
npm run build
```
Verify that the build successfully outputs the compiled client asset bundle inside the `/dist` directory.

---

## 2. Manual QA Validation Checklists

### Checklist A: Row-Level Security Isolation (Multitenancy)
1. Sign up with Account A (`alpha@test.com`) and create Organization `"Alpha Wholesale"`.
2. Add a new lead `"Coffee Bean Shop"`.
3. Sign out.
4. Sign up with Account B (`beta@test.com`) and create Organization `"Beta Sourcing"`.
5. Go to the Leads table. Verify that the table is completely empty. The lead `"Coffee Bean Shop"` must not be visible.
6. Verify that trying to directly route the browser to `/leads/<id-of-coffee-bean-shop>` triggers a `403 Access Denied` alert.

### Checklist B: AI Lead Scout Sourcing
1. Go to the **Lead Scout** view in the sidebar.
2. Enter company details: `"Organic oat milk supplier"`.
3. Set Location to `"San Francisco"` and Industry to `"Specialty Cafes"`.
4. Click **Scout Prospects**. Verify that the inbox displays prospects.
5. Click **Accept & Save to CRM** on `"Sightglass Coffee"`. Verify that the card disappears from the scout inbox and that a green success message appears.
6. Go to the **Leads** dashboard page. Verify that `"Sightglass Coffee"` is now listed inside the Active Directory table with the exact pre-verified address, email, and phone number.
