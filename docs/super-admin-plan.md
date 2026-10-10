# GridCommerce super admin (/admin)

GridCommerce's own panel: the SaaS side (merchants, plans, billing, the platform) and the company side (sales, inbox,
support, marketing, people, finance), plus the website and storefront themes. UI only: every figure is demo data in
the browser; no API, database or live integration.

Started 11 Oct 2026 on branch `claude/super-admin`. The old platform console (`src/screens/console`, 54 routes) was
deleted that day; its data layer `src/lib/platform` (62 demo stores, plans, invoices, payments, billing rules) stays and
the new pages read it.

## Where things are

| | |
|---|---|
| Menu (areas, pages, build step, merchant source) | `src/screens/admin/adminNav.js` |
| Shell (menu, top bar, Ctrl K search, alerts, staff switch, platform status) | `src/screens/admin/AdminShell.jsx`, `src/styles/admin.css` |
| Sign-in entry | the sign-in page's system picker (`components/SystemPicker.jsx`) has a **Super admin** row → `/admin` |
| Who sees which area | `src/lib/admin/roles.js` (built-in roles) + Administration › Roles & permissions (`lib/admin/admin.js` matrix, read by `access.js › canOpen` once loaded) |
| Platform data (stores, plans, invoices, payments, events) | `src/lib/platform` |
| One browser store per module | `src/lib/admin/store.js › createStore / useAdminStore / resetAdminStores` (`gc.admin.<key>`) |
| Module data | `lib/admin/`: `merchants` · `packages` · `licences` · `crm` · `meetings` · `tasks` · `inbox` · `comms` · `support` · `gridai` · `marketing` (campaigns, ads, UTM) · `marketing2` (social, Google Business, promotions, affiliates) · `analytics` + `reportDefs` · `people` · `finance` · `website` (pages, content, blog, SEO — a snapshot of gricommercev1) · `website2` (media, landing pages, forms) · `themes` · `ops` · `admin` |
| Dashboard figures | `src/lib/admin/dashboard.js` (reads the modules above; `company.js` is left only for messaging resold) |
| Screens | `src/screens/admin/<module>/`, routes `src/app/(admin)/admin/…` |
| A page not built yet | `/admin/<path>` → `Planned.jsx` through the `[...slug]` catch-all (none left; kept for new pages) |

Data agreements between modules: salaries in Finance follow People › Payroll (≈ ৳24.7 lakh a month; seed capital ৳1.2 crore +
৳2 crore), the marketing funnel is scaled to the platform's trials (`LEAD_SCALE`), the open incident everywhere is INC-114
(Steadfast webhooks, 38 stores, ticket T-2291, store 0031), and the dashboard's lead funnel counts stage moves in the period.

## Rules

- Same look as the merchant panel: `ix-*` page parts (IndexKit), `gc-*` controls, design tokens, `DashCharts`.
- Reuse merchant screens as UI only. A reused page is copied into `src/screens/admin/` and reads admin data
  (`lib/platform`, `lib/admin`), never the merchant libs (orders, inbox, team …), so the two panels stay apart.
- Pages: title → one main action → 3–5 key figures → the work list → details on the record. At most five urgent rows.
- Work out anything date-based after the data loads (`usePlatform().live`), so the UTC prerender never mismatches.

## Sites

| | Code | Hosting |
|---|---|---|
| Merchant panel + super admin | github.com/mrahmaanshanto/gricommercevfinal (`claude/grid-ai-support`, this work on `claude/super-admin`) | Netlify sites per edition (gricommerce-online, gridcommerce-retail-dazzle, gricommerce-retail-online …) |
| Public website, gridcommerce.net | github.com/mrahmaanshanto/gricommercev1 (`main`, 223367b), local `~/Documents/gricommercev1` | Netlify `gridcommerce-website`, deployed by upload on 8 Oct 2026 (not linked to Git) |

The website's pages are its `src/app` routes; its copy is typed data in `src/data/copy/*.ts` and `src/data/sample/*.ts`
(English + Bangla through `loc()`); forms post through `src/services/*.service.ts`. Step 10 builds the Website area
around exactly these.

## Build checklist

### Step 1 · Shell and dashboard

| | Page | Area | Address | Approach | Starts from |
|---|---|---|---|---|---|
| ✅ | Dashboard | Dashboard | `/admin` | New | `Merchant Home (layout)` |

### Step 2 · Merchants

| | Page | Area | Address | Approach | Starts from |
|---|---|---|---|---|---|
| ✅ | All merchants | Merchants | `/admin/merchants` | New | `Merchant Orders list (layout)` |
| ✅ | Onboarding | Merchants | `/admin/onboarding` | New | — |
| ✅ | Merchant profile | Merchants | `/admin/merchant` | New | — |
| ✅ | New merchant | Merchants | `/admin/merchants/new` | New | — |

### Step 3 · Plans, modules, billing

| | Page | Area | Address | Approach | Starts from |
|---|---|---|---|---|---|
| ✅ | Subscriptions | Plans & modules | `/admin/subscriptions` | New | — |
| ✅ | Packages | Plans & modules | `/admin/packages` | New | — |
| ✅ | Modules | Plans & modules | `/admin/modules` | New | — |
| ✅ | Licences | Plans & modules | `/admin/licences` | New | — |
| ✅ | Invoices | Billing & credits | `/admin/invoices` | Adapt | `/sales-invoices` |
| ✅ | Collections | Billing & credits | `/admin/collections` | New | — |
| ✅ | Credits & adjustments | Billing & credits | `/admin/credits` | New | — |

### Step 4 · Sales & CRM

| | Page | Area | Address | Approach | Starts from |
|---|---|---|---|---|---|
| ✅ | Leads | Sales & CRM | `/admin/leads` | Reuse | `/sales-leads` |
| ✅ | Pipeline | Sales & CRM | `/admin/pipeline` | Adapt | `/sales-leads (board)` |
| ✅ | Meetings | Sales & CRM | `/admin/meetings` | Reuse | `/meetings` |
| ✅ | Tasks | Sales & CRM | `/admin/tasks` | Reuse | `/tasks` |

### Step 5 · Inbox and communications

| | Page | Area | Address | Approach | Starts from |
|---|---|---|---|---|---|
| ✅ | Conversations | Inbox | `/admin/inbox` | Reuse | `/merchant-inbox` |
| ✅ | Calls | Inbox | `/admin/calls` | Reuse | `/merchant-calls` |
| ✅ | Overview | Communications | `/admin/comms` | Adapt | `/campaigns-messaging` |
| ✅ | SMS | Communications | `/admin/sms` | Adapt | `/campaigns-messaging` |
| ✅ | Email | Communications | `/admin/email` | Adapt | `/campaigns-messaging` |
| ✅ | Templates | Communications | `/admin/templates` | Adapt | `/set-notifications (templates)` |
| ✅ | Automations | Communications | `/admin/automations` | Reuse | `/automations` |

### Step 6 · Support and GridAI

| | Page | Area | Address | Approach | Starts from |
|---|---|---|---|---|---|
| ✅ | Tickets | Support | `/admin/tickets` | Adapt | `/support-tickets` |
| ✅ | Performance | Support | `/admin/support-performance` | New | — |
| ✅ | Training | GridAI | `/admin/gridai` | Reuse | `/ai-knowledge` |
| ✅ | Test chat | GridAI | `/admin/gridai/test` | New | — |
| ✅ | Behaviour | GridAI | `/admin/gridai/behaviour` | Reuse | `/ai-behaviour` |
| ✅ | Performance | GridAI | `/admin/gridai/performance` | New | — |
| ✅ | Usage & credits | Merchant AI | `/admin/merchant-ai` | Adapt | `/ai-usage` |
| ✅ | AI plans & limits | Merchant AI | `/admin/merchant-ai/plans` | Adapt | `/ai-models` |
| ✅ | Models & cost | Merchant AI | `/admin/merchant-ai/models` | Adapt | `/ai-models` |

GridAI (Company) is GridCommerce's own assistant. **Merchant AI** (Platform, added 12 Oct 2026) controls the Grid AI that
stores use (merchant panel `lib/gridai/*`): per-plan AI (allowance, agents, model tiers, Autopilot, knowledge storage,
automations, channels, assistant questions, the rule at the allowance), trial AI and markup; every store's usage, cost
and allowance with credits, limit rule, rate limit and suspend / restore; providers (pause → fallback), models per tier
for every store, model releases that must pass the platform test set before they roll out, and six months of provider
cost against AI billing. Data: `lib/admin/merchantAi.js` (store `merchantAi`; usage generated per store and month).

### Step 7 · Marketing

| | Page | Area | Address | Approach | Starts from |
|---|---|---|---|---|---|
| ✅ | Overview | Marketing | `/admin/marketing` | New | — |
| ✅ | Campaigns | Marketing | `/admin/campaigns` | Adapt | `/campaigns` |
| ✅ | Social media | Marketing | `/admin/social` | Reuse | `/calendar + /composer` |
| ✅ | Ads | Marketing | `/admin/ads` | Reuse | `/ad-accounts` |
| ✅ | Affiliates | Marketing | `/admin/affiliates` | Adapt | `/referrals` |
| ✅ | UTM links | Marketing | `/admin/utm` | New | — |
| ✅ | Promotions | Marketing | `/admin/promotions` | Adapt | `/coupons` |

### Step 8 · Analytics and Google Business

| | Page | Area | Address | Approach | Starts from |
|---|---|---|---|---|---|
| ✅ | Overview | Analytics | `/admin/analytics` | Adapt | `/reports-centre` |
| ✅ | Website | Analytics | `/admin/analytics/website` | Adapt | `/analytics-hub` |
| ✅ | Sales & growth | Analytics | `/admin/analytics/growth` | New | — |
| ✅ | Attribution | Analytics | `/admin/analytics/attribution` | Adapt | `/attribution` |
| ✅ | Usage | Analytics | `/admin/analytics/usage` | New | — |
| ✅ | Reports | Analytics | `/admin/reports` | Adapt | `/reports-centre + /report` |
| ✅ | Google Business | Marketing | `/admin/google-business` | Reuse | `/google-business` |

### Step 9 · People

| | Page | Area | Address | Approach | Starts from |
|---|---|---|---|---|---|
| ✅ | Staff | People | `/admin/staff` | Reuse | `/all-staff` |
| ✅ | Attendance | People | `/admin/attendance` | Reuse | `/attendance` |
| ✅ | Leave | People | `/admin/leave` | Reuse | `/leave` |
| ✅ | Payroll | People | `/admin/payroll` | Reuse | `/payroll` |
| ✅ | Performance | People | `/admin/reviews` | New | — |

### Step 10 · Website

| | Page | Area | Address | Approach | Starts from |
|---|---|---|---|---|---|
| ✅ | Overview | Website | `/admin/website` | New | — |
| ✅ | Pages | Website | `/admin/website/pages` | New | — |
| ✅ | Content | Website | `/admin/website/content` | New | — |
| ✅ | Blog | Website | `/admin/website/blog` | Reuse | `/blog-posts` |
| ✅ | Media | Website | `/admin/website/media` | Adapt | `/set-media` |
| ✅ | Landing pages | Website | `/admin/website/landing-pages` | Adapt | `/landing-page-builder` |
| ✅ | Forms | Website | `/admin/website/forms` | New | — |
| ✅ | SEO | Website | `/admin/website/seo` | Adapt | `/set-seo` |

### Step 11 · Storefront themes

| | Page | Area | Address | Approach | Starts from |
|---|---|---|---|---|---|
| ✅ | Theme library | Storefront themes | `/admin/themes` | New | — |
| ✅ | Templates | Storefront themes | `/admin/themes/templates` | New | — |
| ✅ | Assignments | Storefront themes | `/admin/themes/assignments` | New | — |
| ✅ | Releases | Storefront themes | `/admin/themes/releases` | New | — |

### Step 12 · Finance

| | Page | Area | Address | Approach | Starts from |
|---|---|---|---|---|---|
| ✅ | Overview | Finance | `/admin/finance` | Adapt | `/accounts-home` |
| ✅ | Revenue | Finance | `/admin/revenue` | New | — |
| ✅ | Payments | Finance | `/admin/payments` | Adapt | `/money` |
| ✅ | Expenses | Finance | `/admin/expenses` | Adapt | `/expenses-bills` |
| ✅ | Accounts | Finance | `/admin/accounts` | Adapt | `/money` |

### Step 13 · Platform ops

| | Page | Area | Address | Approach | Starts from |
|---|---|---|---|---|---|
| ✅ | Servers | Platform ops | `/admin/servers` | New | — |
| ✅ | APIs | Platform ops | `/admin/apis` | New | — |
| ✅ | Integrations | Platform ops | `/admin/integrations` | Adapt | `/connections` |
| ✅ | Resource limits | Platform ops | `/admin/limits` | New | — |
| ✅ | Incidents | Platform ops | `/admin/incidents` | New | — |

### Step 14 · Administration

| | Page | Area | Address | Approach | Starts from |
|---|---|---|---|---|---|
| ✅ | Activity log | Administration | `/admin/activity` | New | — |
| ✅ | Roles & permissions | Administration | `/admin/roles` | New | — |
| ✅ | Security | Administration | `/admin/security` | New | — |
| ✅ | Settings | Administration | `/admin/settings` | New | — |

### Step 15 · UI/UX audit

✅ Done 12 Oct 2026: every page (72 menu pages + 18 records and forms) loaded at 1366 px and 390 px — one h1, no dev errors, no sideways overflow, no undefined/NaN on screen; UTC production build.
