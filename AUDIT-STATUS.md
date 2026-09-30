# UI/UX audit — implementation status

Source: `gridcommerce-ui-ux-audit.md` (63 issues). Status as of 30 Sep 2026.

**Done** = implemented and checked (build, scripted probe of 152 product routes at 1440 / 1280 / 1024 / 768 / 390px,
and the named flows exercised in the browser). **Partly** = the systemic part is in, something named remains.
**Owner** = waiting on a product decision.

## Measured result (152 product routes)

| Check | Before | After |
|---|---|---|
| Routes with horizontal page scroll at 1024px | 205 | 0 |
| Routes with horizontal page scroll at 768px | 207 | 0 |
| Routes with horizontal page scroll at 390px | 256 | 1 (`/staff-attendance`, +10px) |
| Shell routes with exactly one `<h1>` | about 58 of 143 | all except the 8 staff sub-panels and 5 preview pages |
| Text under 12px | 11.8% | 0.06% |
| Text failing contrast | 9.4% | 0.8% |
| Buttons in the browser default font | about 60 pages | 0 |
| Unlabelled form controls | 40+ | 1 (`/set-media`) |

At 390px, 63 routes still let their content area scroll sideways inside the page (wide tables and multi-column
panels that have not been individually reflowed). The page itself does not scroll sideways.

## Global

| ID | Status | Notes |
|---|---|---|
| GLOBAL-001 | Done | Fluid shell on 114 screens; settings, POS, sign-in, onboarding and staff profile made fluid too. |
| GLOBAL-002 | Partly | Shared layer built and used for all new behaviour (`src/components/ui`, `src/runtime/ui.js`, tokens, hook classes, `npm run check:screens`). Screens are still inline-styled JSX, not rebuilt from components. |
| GLOBAL-003 | Done | Hero titles are white and are the page `<h1>`; dark bands carry on-dark colours. |
| GLOBAL-004 | Done | One `<h1>` per shell screen (`PageHeader` or hero title); top bar shows a breadcrumb only. The five header patterns were not redrawn into one layout. |
| GLOBAL-005 | Partly | Heights snapped to 28/32/36/44/52 by script. 40px pill tabs/icon buttons and some 24px inline buttons remain off-scale. |
| GLOBAL-006 | Done | Font reset for controls (document and shadow roots); glyph buttons replaced on the audited pages. |
| GLOBAL-007 | Partly | One header style and cell padding through the shared recipes, tables scroll inside `gc-table-wrap`, row checkboxes labelled. No `DataTable` component, no sticky header, no `aria-sort`. |
| GLOBAL-008 | Done | Five radii (4/6/8/12/pill), tokens only. |
| GLOBAL-009 | Done | Accessible text and fill tokens; 0.8% of text still fails (mostly POS product tiles and a few chips). |
| GLOBAL-010 | Done | Nothing under 12px except print previews. |
| GLOBAL-011 | Done | 64px, responsive search, overflow into the account menu, "Clear cache" removed, second search bar on orders removed. |
| GLOBAL-012 | Done | Parent click navigates, active item from the URL, collapse persisted, rail/drawer, `<nav>`, focusable tooltips. |
| GLOBAL-013 | Partly / Owner | The switch works, persists and sets `<html lang>`. Translated: menu, top bar, overlays, sign-in. Screen content is still English; a full catalogue needs an i18n approach decision. |
| GLOBAL-014 | Done | Every control listed in the audit table is wired. Any other control without a handler says so with a toast. |
| GLOBAL-015 | Done | Real forms with required markers, validation, dirty state and toasts on add product (both), categories, new coupon, new flash sale, new PO, new transfer, branches, chart of accounts, bank accounts, settings (10), sign-in, onboarding. |
| GLOBAL-016 | Partly | URL state + ARIA on orders, products, customers, coupons, chart of accounts, bank accounts, stock, journals, money in/out, home. Not on purchase orders, staff, or leave (ARIA only). |
| GLOBAL-017 | Done | `src/lib/orderStatus.js` drives sidebar, tabs, badges and stepper. |
| GLOBAL-018 | Done | Storyboards and reference pages under `/dev`; switchers and `/dev` in production only with `NEXT_PUBLIC_SHOW_STORYBOARD=true`; sidebar "POS register" opens the live register. |
| GLOBAL-019 | Done | On every page the audit names. |
| GLOBAL-020 | Done | No "Sellino" string left. |
| GLOBAL-021 | Done | "BDT" remains only as the ISO code in currency and tracking settings. |
| GLOBAL-022 | Done | `8:48 PM` everywhere; `formatTime` for new code. |
| GLOBAL-023 | Done | Sign-in form visible at once; bulk bar does not shift the table; banners replaced by toasts. |
| GLOBAL-024 | Owner | No route removed. Needs a decision on the canonical add-product and customer pages. No shared `KpiCard`. |
| GLOBAL-025 | Not done | Card titles are still `<h2>` at 14px. |
| GLOBAL-026 | Partly | One page inset for every shell screen. Gaps and card padding inside screens are unchanged. |
| GLOBAL-027 | Owner | "Seller marketplace" and SEO left in place pending a decision. |

## Pages, flows, responsive, accessibility

| ID | Status | Notes |
|---|---|---|
| UI-001, UX-003 | Done | Quick actions grid; money in/out opens the requested mode. |
| UI-002 | Done | KPI grid, toolbar, real filtering, pagination and CSV export. "More filters" is a dialog, not a drawer. |
| UI-003, UX-001 | Done | One back link that restores the list, stepper from the shared list. |
| UI-004 | Done | Chips + "More views", search with empty state, add-customer dialog. |
| UI-005 | Done | Hero and gradient card contrast. |
| UI-006, UI-007 | Done | Title first, sticky save bar, tab strip without a scrollbar. |
| UI-008, UI-022 | Done | Rows are buttons, channel icons, labels, compact h1, switchable panes under 1024px. |
| UI-009 | Done | 24px bins, labels, patterns, arrow keys. |
| UI-010, UI-016 | Done | Channel icons, labelled event buttons, contrast. |
| UI-011 | Done | Fluid settings shell; "On this page" hidden under 1440px. |
| UI-012, RESP-003 | Done | 44/52px targets, labels, real layout with a bottom-sheet cart; no transform scaling. Language toggle hidden under 480px on POS. |
| UI-013, UI-014, RESP-002 | Done | One sign-up entry, numbered stepper, phone layout. |
| UI-015 | Done | Brand tokens, Lucide icons. |
| UI-017 | Done | Hero CTA focuses the validated form. |
| UI-018 | Done | Hero tiles wrap, 13px body, non-colour series cues. |
| UI-019, UI-020 | Done | Dot in its own column, z-index, focus returns, "View all", menu kept in the viewport. |
| UI-021 | Done | Standard headers and padding; expanders are buttons. |
| UX-002 | Partly | Confirm + toast on Quick block, leave, loans, block bin. "Cancel order" on order detail still has none. |
| RESP-001 | Done | Rail under 1280px, drawer under 1024px with backdrop, Esc and focus. |
| RESP-004 | Partly | Grid hooks on 271 grids and the named pages; no shared `CardGrid`. |
| RESP-005 | Partly | Tables scroll inside their wrapper at every width. No card layout for rows on phones. |
| A11Y-001 | Done | 1 unlabelled control left. |
| A11Y-002 | Done | Converted on the audited pages; elsewhere click-only elements get a button role and keyboard activation at runtime. |
| A11Y-003 | Partly | Racks, onboarding, shifts, POS fixed. Two 23px buttons on `/set-general`; not swept everywhere. |
| A11Y-004 | Done | `<nav>`, skip link, `lang` follows the locale. Bangla runs are not individually marked `lang="bn"`. |
| A11Y-005 | Partly | Racks, order stepper, calendar, analytics. Supplier payment calendar not done. |
| A11Y-006 | Done | Shared dialog and confirm trap focus, close on Esc and return focus; popovers return focus. |

## Not covered by the audit and not changed

The platform console (`src/screens/console`), the phone-app boards (`src/screens/app`) and the developer
reference pages were outside the audit's 143 routes. They only received the earlier type and shape pattern.
