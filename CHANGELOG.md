# Changelog — BrewFlow AI

All notable changes to the BrewFlow B2B Sales Operating System are documented in this file.

---

## [v2.2.0] — 2026-07-09

### Added
- **AI Lead Scout Page:** Introduced prospect discovery sandbox (`LeadScout.jsx`) where users search for real B2B clients in major regions and instantly insert accepted records.
- **Custom Select Component:** Built animated glassmorphic dropdown replacements (`CustomSelect.jsx`) with checkmark indicators and spring animations.
- **Responsive Mobile Layouts:** Implemented sidebar drawers and public landing hamburger overlays.
- **Provider Abstraction Layer:** Added provider-independent methods to `aiService.js` (e.g., `generateColdEmail`, `generateCompetitorAnalysis`).

### Changed
- **Soften Dark mode colors:** Modified `index.css` to use midnight navy tones instead of flat gray.
- **Dynamic CSS Classes:** Bind landing background states to Tailwind variables.

---

## [v2.1.0] — 2026-07-08

### Added
- **Timeline Interaction logger:** Quick logs for calls, emails, and catalog shipments.
- **Workspace Cascades:** Delete workspace validations requiring name matches.
- **Back to Home Navigation:** Links added to Login and Signup interfaces.

### Fixed
- **Dashboard Count bug:** Corrected snapshot metric checks to count active leads properly.
- **Sidebar Active pill:** Fixed absolute layout overlap bugs.
