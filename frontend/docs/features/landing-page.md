# Public Landing Page — Feature Documentation

This document tracks the purpose, architecture, design system, and integration details for the public-facing marketing Landing Page.

## Overview
The Landing Page serves as the entryway for users who are not yet authenticated. It introduces BrewFlow AI's core value proposition as a B2B Sales Operating System for physical product sellers (roasters, bakeries, food/beverage brands, distributors).

## Key Design Tokens Used
We strictly followed the **Roast & Ledger** palette from `src/index.css`:
- **Primary background:** `--color-paper-100` (`#F7F5EF`) or `--color-paper-50` (`#FBFAF6`) for light mode. In dark mode, `--color-ink-950` (`#0F1826`) or `--color-ink-900` (`#14213D`).
- **Primary text:** `--color-ink-900` (`#14213D`) (light mode) or `--color-paper-50` (dark mode).
- **Accent:** `--color-gold-500` (`#D8A64C`) for key call-to-actions, highlight lines, and brand icons.
- **outcome colors:** `--color-moss-500` (`#5B7553`) and `--color-coral-500` (`#E06656`) represent growth metrics and pipeline state simulations.
- **Typography:**
  - **Display / Headings:** Space Grotesk (`font-display`) for high impact and modern utility aesthetic.
  - **Body text:** Inter (`font-body`) for high readability.
  - **Numerical Data:** IBM Plex Mono (`font-mono`) for simulating dashboard data and pricing tiers.

## Routing Schema
- **Public URL `/`:** Renders the public `Landing` page.
- **Redirects:**
  - If a logged-in user visits `/`, they can click a button or be automatically routed to `/dashboard`.
  - When hitting `/login` or `/signup`, authenticated users are redirected to `/dashboard`.
  - All logged-in core app routes live under the authenticated wildcard path `/*` leading to `/dashboard`, `/leads`, `/follow-ups`, `/ai-assistant`, and `/settings`.

## Components Built
- **Navigation Navbar:** Includes theme toggle, logo branding, and CTA.
- **Hero Section:** Clear marketing header, mock application interface constructed using native CSS for performance and crisp rendering.
- **Features Showcase:** Details B2B leads, lead activity logging, and intelligent follow-ups.
- **Pricing Stack:** Three interactive cards representing SaaS tier options (Starter, Roast Master, Enterprise).
- **FAQ Accordion:** Answers common questions regarding importing, security, and setup.
