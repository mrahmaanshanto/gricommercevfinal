# Handoff: testing Nayeem's proposal against the build (merge · add · subtract)

Written 2 Oct 2026 for the next working session, whether a person or Claude. It holds everything needed to try Nayeem's proposals inside the real build without breaking the live product. You can take a proposal, switch it on, compare it with today's version, keep it or throw it away.

---

## 0. Start here

**Paste this into a new Claude Code session opened on this repo:**

> Read `docs/handoff-nayeem-merge.md` in full, then `AGENTS.md`, then sections 1, 4 and 8 of `docs/proposal-vs-build.md`. We are going to try parts of Nayeem's proposal inside the build behind switchable flags, on a separate branch, never deploying to the four live sites. Start with step 5 (the proposal flag system), then the experiment I name. Ask me before any multi-agent run or deploy.

**The one-paragraph situation:**
- Today's build (commit `7c766c0`) is a wide front-end demo: 333 routes and 102 menu items, with data held in the browser. It is live on four Netlify sites.
- Nayeem wrote 21 architecture and UX briefs, one per product area. Each says which area owns what, goes screen by screen, and adds new workspaces and engines.
- They were checked row by row against the build. Of 1,271 rows, 217 are built, 430 partly built, 443 not built (19 of those need a server), 154 built differently, and 27 refer to design screens that no longer exist.
- My recommendation is **merge by subtraction first**: remove duplicated concepts using Nayeem's "one owner per idea" rule, then reshape the menu, then add engines and workspaces in priority order.
- **Merging by addition** (keep everything and add everything) produces messy software.
- **Enterprise-grade** needs a real backend, which neither side has today.

---

## 1. Where everything is

| What | Where |
|---|---|
| Repo | `/Users/mostafiz/Documents/gricommercevfinal-claude-intelligent-keller-qtcxud` (git remote `mrahmaanshanto/gricommercevfinal`) |
| Live branch | `claude/intelligent-keller-qtcxud`, commit `7c766c0` = what all four sites run |
| Nayeem's proposal | `~/Downloads/Grid Commerce Review - Nayeem (2).zip`: 21 HTML briefs, about 1.25M characters |
| The comparison (Markdown) | `docs/proposal-vs-build.md` (uncommitted) |
| The comparison (shareable page) | https://claude.ai/artifact/NB1f212RJYw5q7kGoMTKKq (private; share from its Share menu) |
| Project rules | `AGENTS.md`; read it before touching code |
| Words and Bangla | `docs/terminology.md`, `src/lib/i18n/bn.js`, `src/shell/i18n.js` |
| Offline backups | `~/Documents/GridCommerce-backups/gridcommerce-milestone-2026-10-02.{bundle,zip,sha256}`; tag `milestone-2026-10-02` (local) |
| Untracked folder in the repo | `Manual Backup Oct 2,7.24/` (21 MB, made by the user). Do not commit it; ask before moving it |

**Live sites.** Do not deploy experiments here.

| Site | URL | Netlify site ID |
|---|---|---|
| Online | gricommerce-online.netlify.app | `29f76484-26df-42d2-804d-aac0482a316b` |
| Retail + Wholesale | gricommerce-retail-wholesale.netlify.app | `d43df22c-12b3-47e3-ac5f-814509aab03b` |
| Retail + Wholesale + Online | gricommerce-retail-online.netlify.app | `8055acb9-54b4-45ce-81bb-5e743aba8de9` |
| Full product | gricommerce-final.netlify.app | `a3e1bc9e-65c9-4c57-a2ad-2b037718e839` |

---

## 2. Nayeem's 21 briefs and how to read them

| # | Brief | Version | Proposed area | Section in the comparison |
|---|---|---|---|---|
| 1 | Product | 4.4 | Products | 5 › Products · #1 |
| 2 | Inventory | 1.3 | Products › Inventory | 5 › Products · #2 |
| 3 | Purchase & Suppliers | 1.1 | Products › Purchasing | 5 › Products · #3 |
| 4 | Sales, Orders, Fulfilment & Delivery | 1.2 | Orders | 5 › Orders · #4 |
| 5 | Payments & Settlement | 1.2 | Finances › Payments | 5 › Finances · #5 |
| 6 | Finance & Cash Management | 1.0 | Finances | 5 › Finances · #6 |
| 7 | Customers & CRM | 1.0 | Customers | 5 › Customers · #7 |
| 8 | POS Register | 1.0 | POS | 5 › Orders · #8 |
| 9 | Loyalty, Promotions & Offers | 1.0 | Marketing | 5 › Customers · #9 |
| 10 | Merchant Dashboard | 1.0 | Home | 5 › Home · #10 |
| 11 | Communications, Notifications & Campaigns | 1.0 | Communications | 5 › Communications · #11 |
| 12 | Support, Returns, Warranty & After-sales | 1.0 | Orders › After-sales | 5 › Orders · #12 |
| 13 | Recovery & Customer Intelligence | 1.0 | Marketing › Recovery | 5 › Customers · #13 |
| 14 | Tracking, Analytics, Reports & Profitability | 1.0 | Analytics | 5 › Analytics · #14 |
| 15 | Storefront, Checkout, Landing Pages & Reviews | 1.0 | Online Store | 5 › Online Store · #15 |
| 16 | Settings, Billing & Merchant Configuration | 1.1 | Settings | 5 › Platform · #16 |
| 17 | Onboarding, Migration & Merchant Setup | 1.0 | Setup & Migration | 5 › Home · #17 |
| 18 | Staff, HR, Roles & Security | 1.0 | Staff & HR; Roles & Security | 5 › Platform · #18 |
| 19 | Grid Platform Console & Core Backend | 1.0 | Grid's admin console | 5 › Platform · #19 |
| 20 | Design System & Developer Reference | 1.0 | Foundation | 5 › Platform · #20 |
| 21 | Navigation Architecture | 1.0 | Shell | 4 (whole section) |

**Read a brief straight from the zip.** This prints the text and extracts nothing to disk. Change `SUB` to part of the file name (e.g. `Sales_Orders`, `Navigation_Architecture`) and page through with `START`:

```bash
python3 - <<'EOF'
import zipfile, re, html
SUB='Navigation_Architecture'; START=0; LEN=25000
z=zipfile.ZipFile("/Users/mostafiz/Downloads/Grid Commerce Review - Nayeem (2).zip")
n=[x for x in z.namelist() if SUB in x][0]
s=z.read(n).decode('utf-8','ignore')
b=re.sub(r'<(script|style)[^>]*>.*?</\1>','',s,flags=re.S)
b=re.sub(r'<(h[1-4])[^>]*>','\n\n### ',b); b=re.sub(r'</(p|li|tr|div|h[1-4])>','\n',b); b=re.sub(r'<(td|th)[^>]*>',' | ',b)
t=html.unescape(re.sub(r'<[^>]+>','',b)); t=re.sub(r'[ \t]+',' ',t); t=re.sub(r'\n\s*\n+','\n',t)
print(n,'TOTAL',len(t)); print(t[START:START+LEN])
EOF
```

**Each brief has the same parts:**
1. the "lock" decision;
2. an ownership boundary;
3. a §0A screen-by-screen table (Keep / Modify / Add / Remove-Move);
4. new models and rules;
5. a §6 action table;
6. a final build brief.

**Important.** The briefs reviewed the *original design files* (`design/templates/**/*.dc.html`), not today's code. Always check the current code in `src/` before believing "missing".

---

## 3. How the build works (cheat sheet)

**Stack.** Next.js 16 App Router + React 19, front-end only. Data lives in browser storage, and screens run on demo data.
- Screens are `src/screens/<module>/<Page>.jsx`, listed with their routes in `src/screens/registry.js`.
- Never run `npm run convert`; it overwrites hand edits.

**Editions and modules** (`src/lib/edition.js`):
- `MODULES` holds 15 modules: core, catalog, places, purchasing, money, reports, hr, commerce, marketing, pos, wholesale, online, channels, comms, automation.
- `EDITIONS`: `retail-wholesale`, `online`, `retail-online`, `comms` (Connect), and the full product (when `NEXT_PUBLIC_EDITION` is unset).
- `hasModule()` and `navForEdition()` decide what an edition gets.
- **Rule:** every menu id belongs to exactly one module. A new page or menu item must be added to a module in `MODULES`.

**Menu:**
- `src/shell/navigation.js` holds `NAV` (10 groups, 102 leaves) and `NAV_ALIAS` (old ids → new).
- `gc-sidebar.js` renders it. `team.js › navFor()` filters by role, then edition, then `stockSetup.js › navForSetup()`.

**Roles** (`src/lib/team.js`):
- `ROLES` has 13 roles. `USERS` has one demo user per role:
  - `ceo`, `cto`, `jannatul` (content), `farhana` (orders), `lamia` (comms), `shakil` (ads);
  - `tareq` (warehouse manager), `sabbir` (warehouse supervisor);
  - `rakib` (shop manager), `sadia` (shop supervisor), `rafi` (seller);
  - `sharmin` (HR), `arafat` (online sales).
- `components/RoleGuard.jsx` covers pages outside the role or edition.

**Sources of truth** (`src/lib`). These are the pieces Nayeem's "one owner" rule maps onto:

| Area | Files |
|---|---|
| Orders | `orders.js`, `orderStatus.js` (`ORDER_STATUSES`, `statusKeyOf`), `orderFlow.js`, `orderLinks.js`, `liveOrders.js`, `notifications.js` (`notify`) |
| Stock | `stock.js` (`stockAt`, `addMove`), `stockHolds.js`, `locations.js` (`onlinePlace`), `racks.js`, `batches.js`, `stockSetup.js` (`getStockSetup`), `stockMerge.js` |
| Buying | `supplierBills.js`, `productCost.js` |
| Money | `ledger.js` (`postEntry`, `balanceOf`), `settlements.js`, `liabilities.js`, `categories.js`, `salesBook.js`, `profit.js`, `platformCosts.js`, `vat.js` |
| Customers & loyalty | `customers.js` (`phoneDigits`, `mergeCustomers`), `leads.js`, `loyalty.js` (`walletLiability`) |
| POS | `posStore.js` |
| HR | `hr.js` (`LOGIN_ROLES`), `auditLog.js` |
| Reports | `reports/catalogue.js` + `reports/defs/*` (about 95 reports) |
| Inbox and connections | `inbox.js`, `connections.js`, `channels.js` |

**UI rules:**
- One pattern, defined in `src/styles/design-system.css`, using tokens only. `npm run check:screens` fails on literal values.
- Shared parts live in `src/components/ui`: `PageHeader` (+ `about`), `Sheet`, `Dialog`, `EmptyState`, `InfoTip`, `StatusBadge`, `FilterBar` / `MobileFilters`, `HelpPanel`.
- Every new string goes into `bn.js`.
- Phones must work at 390 px.

**Handy switches:**

| Switch | Effect |
|---|---|
| `?edition=online` (or `retail-wholesale`, `retail-online`, `comms`, `full`) | Previews an edition on the full site |
| `?as=<user id>` | Signs in as that role |
| `?quiet=1` | Stops the 8 PM payout check from popping up |
| Demo manager PIN | `1234` |
| `gc.clock.offset` (localStorage, in ms) | Moves the clock |

---

## 4. Ground rules for experiments

1. **Work on a new branch.** For example `git switch -c explore/nayeem-merge` from `claude/intelligent-keller-qtcxud`, or in a separate worktree. Never commit experiments to the live branch.
2. **Never deploy to the four live sites.** If you want a shareable preview, ask the user first; a new Netlify site is needed.
3. **Default behaviour must not change.** Every experiment sits behind a proposal flag (step 5) that is off by default. With all flags off, the app must behave exactly like `7c766c0`.
4. **Follow `AGENTS.md`:**
   - tokens only;
   - Bangla for every new string;
   - new pages go in `registry.js` and in a module in `MODULES`;
   - check phones at 390 px;
   - order text stays short and plain (Shopify style).
5. **Check every change** with `npm run check:screens` and `npm run build`. Stop the prod preview server before building.
6. **Ask before multi-agent runs, and say the rough cost.** The comparison used about 2.6M tokens across 7 agents.
7. **Commits** use author `mrahmaanshanto <mushfikpro016@gmail.com>` and end with the Co-Authored-By line the session gives.

---

## 5. The proposal switch system (built 2 Oct 2026, branch `explore/nayeem-merge`)

This lets you play with "merge / add / subtract" by flipping switches and comparing with today's version on the same running app.

- **`src/lib/proposal.js`:**
  - `FLAGS`: every experiment in section 6, `{ key, kind: 'subtract'|'merge'|'add', size, page, briefs, decisions, label, today, target, built }`;
  - `isOn(key)`, `onKeys()`, `setFlag(key, on)`, `setFlags(keys)`, `allOff()`, `PROPOSAL_EVENT`; React: `useProposal(key)` in `src/lib/useProposal.js`;
  - **the switches** (set on `/dev/proposal`) are kept in this browser (localStorage `gc.proposal`); every tab follows them at once;
  - **a `?p=nav,modes` link** (or `?p=off` = today's build) pins that one tab, and every page it opens next, without touching the switches (sessionStorage `gc.proposal.tab`). Flipping a switch on `/dev/proposal` makes that tab follow the switches again;
  - switches work only while developing or with `NEXT_PUBLIC_SHOW_STORYBOARD=true`; on any other build every switch reads off.
- **`/dev/proposal`:** a switch per experiment, grouped Subtract → Merge → Add, with its briefs and decision rows linked to `/dev/proposal/doc` (this comparison read inside the app, built from `docs/proposal-vs-build.md`), an "All off" reset, and Today / Proposal links that open a page both ways in new tabs. Only experiments marked `built: true` can be switched on.
- **"Proposal: N on"** shows in the top bar (or as a corner badge on POS, Settings and other pages without it) while anything is on.
- **Each experiment checks `isOn('<key>')`** at the narrowest possible point, such as the menu builder or one screen's tab list, then sets `built: true` on its entry.

---

## 6. Experiment backlog

**How to read each entry:**
- **Type:**
  - *Subtract*: remove a duplicate;
  - *Merge*: reshape or move existing things;
  - *Add*: new workspace or engine.
- **Size:** S = hours, M = a day or two, L = several days.
- The brief number points to the matching section of the comparison.

### 6.1 Subtract: remove duplicated concepts (do these first; they make the build cleaner whatever is decided)

| Key | What | Today (files) | Nayeem's target | Size |
|---|---|---|---|---|
| `one-promo` | One promotion engine for coupon codes | Three separate code sets: Coupons list (`loyalty-promo/Coupons.jsx`), POS (`pos-register/Pos.jsx:87` EIDSAVE10/WELCOME50), Checkout (`storefront/Checkout.jsx:28` EID300) | New `lib/promotions.js` read by all three (#9) | M |
| `one-customer` | One customer profile and a stable customer ID | `/customer-crm` (static demo), `/customer-profile` (Recovery), `/wholesale-customer`, `/member-detail`; all keyed by phone in `customers.js` | One profile with Insights and Company mode; ID ≠ phone (#7, #13) | L |
| `one-quiet-hours` | One message policy (quiet hours, caps) | `automation/WorkflowSettings.jsx` and `recovery/AutoReminders.jsx` each have their own | One policy in Communications that both read (#11, #13) | S |
| `one-gateway-setup` | One place to set up payment gateways | Settings › Payment Gateway, Money setup › Payment partners, `/connections` (all open `GatewaySetup.jsx`) | One Payments Setup; others link to it (#5, #16) | S |
| `one-role-model` | One role model | `team.js ROLES` (menu), `hr.js LOGIN_ROLES` (staff record), HR setup's static role table | One role list used by menu, staff and POS limits (#18) | M |
| `analytics-real-numbers` | Analytics pages read the shared books | `tracking-analytics/*` show static numbers that don't match Reports | Feed them from `salesBook`, `profit`, `adSpend` (#14) | M |
| `settings-save` | Design-based settings forms that actually save | `SetGeneral`, `SetDelivery`, `SetSeo`, `SetSecurity`, `SetStorage`, `SetAi`, `SetPreference` keep values only while open (`SetChrome.jsx:121-135`) | A small settings store; delivery charges become one source (landing page says ৳130, others ৳150) (#16) | M |
| `no-legal-claims` | Remove wording Nayeem flags | Labour Act lines (`HrSetup.jsx:186`, `Gratuity.jsx:67`), "PTA approved" (`AddProduct.jsx`), "Real return", "raw data never leaves", "Google still gets anonymous signals" | Neutral wording (#1, #14, #18) | S |

### 6.2 Merge: reshape and move

| Key | What | Today (files) | Nayeem's target | Size |
|---|---|---|---|---|
| `nav` | Menu as business areas with page tabs | `navigation.js NAV` (10 groups, sub-menus in the sidebar), `gc-sidebar.js` | 7 core areas + mode areas, Settings at the bottom, sub-items as tabs. Use the **master move table** (comparison §4.4: all 102 items mapped) and the area tab list (§4.5). Build an alternative `NAV` behind the flag plus an area-tabs component in the page header (#21) | M |
| `modes` | Combinable Online / Retail / Wholesale modes | `edition.js EDITIONS` (fixed bundles), `?edition=` preview | On the full site, `?modes=online,retail` maps ticked modes → module sets; editions stay as presets (#21, #17) | M |
| `one-home` | One role-aware Home | `merchant-overview/Home.jsx`, `OnlineHome.jsx`, `CommsHome.jsx`, `team/MyDashboard.jsx` | Home picks section order by role: attention → pulse → orders → money → stock → customers (#10) | M |
| `order-views` | Order tabs as working views | `MerchantOrders.jsx` tabs = `ORDER_STATUSES` | Work out views (Needs action, Confirmation, Processing, Ready to dispatch, In transit, Delivered, Exceptions) from status + payment + verify + prep without changing stored data; add the Payment column "Unpaid · COD" (#4) | M |
| `returns-home` | Where returns live | `/return-exchange` (one shared page), `/courier-returns`, `/warranty-claims` under stock tools | Orders › After-sales tab with Returns, Warranty, Repairs; courier RTO kept apart (#12) | S (menu) / L (case model) |
| `warranty-to-product` | Warranty policies under Product / Catalog setup | `/warranty-policies` under More stock tools | Catalog setup section; claims → After-sales (#1, #12) | S |
| `money-to-finances` | Money becomes Finances with six areas | 7 Money pages (`screens/accounts`) | Overview · Payments · Money & cash · Receivables · Reconciliation; P&L and VAT out to Analytics / Settings (#5, #6, #14) | M |
| `analytics-area` | Reports + Ads tracking become one Analytics area | Reports group; Marketing › Ads tracking | Analytics with Overview · Profitability · Marketing · Customers · Reports · Tracking (#14) | S (menu) |
| `comms-area` | Customer support + Automation + order notifications become Communications | Customer support group; Online store & settings › Automation; Settings › Notifications | Communications: Inbox · Calls · Campaigns · Automations · Templates · Delivery log; in every edition (#11) | M |
| `wallet-store-credit` | Customer wallet becomes store credit | `loyalty-promo/Wallet.jsx`; `loyalty.js` top-up and cash-out | Store credit only, no cash in or out; check the effect on Bills to pay (#9) | M |
| `inventory-quantities` | Committed / Unavailable / Incoming columns | `purchase-stock/Stock.jsx` (On hand / Held / Available / In transit) | Worked out from holds, the damaged bay and open POs; add a Stock Activity list from the stored moves (#2) | M |

### 6.3 Add: new workspaces and engines (in market-priority order; build each as a thin front-end version on today's libraries)

| Key | What | Builds on | Brief | Size |
|---|---|---|---|---|
| `after-sales` | After-sales Cases (case, items, inspection, remedy, SLA) | `returns.js`, `ReturnExchange.jsx`, `WarrantyClaims.jsx`, `SupportTickets.jsx` | #12 | L |
| `roles-security` | Roles & Security (roles matrix, access policy, sessions, audit) | `team.js`, `hr.js` access fields, `auditLog.js`, `ManagerPin.jsx` | #18 | L |
| `setup-migration` | Setup & Migration (checklist from owner facts, CSV import with dry run) | `stockSetup.js`, `StockSetupBanner.jsx`, UI-kit checklist | #17 | L |
| `payments-ops` | Payments Operations (transactions, refunds, settlements) | `settlements.js`, `ledger.js`, `returns.js`, `Settlements.jsx` | #5 | M |
| `assisted-order` | Assisted New Order (hold/resume, barcode, shortcuts, B2B quote) | `NewOrder.jsx`, `Pos.jsx` shortcuts, `invoices.js` | #4 | M |
| `segments` | One segment engine + consent fields | `customers.js`, `AllCustomers.jsx` views | #7, #13 | L |
| `campaigns` | Messaging Campaigns (segment → template → schedule → results) | `Composer.jsx` broadcast, `notifications.js`, `connections.js` | #11 | L |
| `stock-activity` | Stock Activity list (every move, filterable) | `stock.js` moves | #2 | S |
| `quick-create` | "+ Create" menu and command search | `gc-topbar.js` search | #21 | M |
| `storefront` | Storefront & Theme, Checkout & Account, Reviews | `LandingPageBuilder.jsx`, `Checkout.jsx`, `orderLinks.js` | #15 | L (lowest priority; WooCommerce/Shopify cover it) |

**Not doable in this front-end build** (record as "needs backend"):
- tenant isolation, server-side permissions, sessions and force logout;
- encrypted keys, idempotent payment webhooks, gateway server checks;
- backups, the platform console's real data (#19).

---

## 7. Testing recipes

**Dev server.** Use the preview tool, not Bash: `.claude/launch.json` defines `gridcommerce-dev` (port 3000) and `gridcommerce-prod` (`next start -p 3100`). Open pages with `?quiet=1`.

**Compare today vs proposal on the same page:** open `/x?quiet=1&p=off` and `/x?quiet=1&p=<flag>` side by side (each tab keeps its set), use the Today / Proposal links on `/dev/proposal`, or flip a switch there while the page is open in another tab.

**Matrix to cover for any menu, Home or access change.** Test editions × roles:
- editions: `?edition=online`, `retail-wholesale`, `retail-online`, `comms`, `full`;
- roles: `?as=ceo`, `farhana`, `rafi`, `rakib`, `tareq`, `sharmin`, `lamia`.

**Checks before calling an experiment done:**
- Run `npm run check:screens` and `npm run build`; all routes prerender.
- Phone at 390 px: no sideways scroll; tap targets ≥ 36 px.
- Bangla on (account menu → language): new strings translate.
- With every flag off, the page matches `7c766c0`.

**Headless screenshots** (gitignored helper `public/__frame.html`). With the prod server on :3100:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=9000 --window-size=1440,1000 --screenshot=shot.png "http://localhost:3100/__frame.html?w=1440&h=1000&clock=11:00&src=%2Fmerchant-overview%3Fquiet%3D1"
```

Headless Chrome won't go narrower than about 500 px. For phones use the frame's `w=390`.

**Reset demo data:** clear site data in the browser; Money setup also has "Reset demo money data".

---

## 8. Decisions only the founders can make

The comparison's section 8 lists 44 decisions with both positions. Experiments can show each option, but someone has to choose. The six that unlock the most:

1. **Editions vs combinable modes.** Today: four fixed sites. Nayeem: tick Online / Retail / Wholesale in any mix on one account.
2. **Order status model.** Today: one saved status ("On hold" = COD waiting for a call). Nayeem: separate state dimensions and working views.
3. **Where returns live.** Today: one shared Return & exchange page. Nayeem: After-sales cases, with POS keeping a cashier return screen.
4. **Customer wallet vs store credit.** Today: money held for customers, with cash top-up and cash-out. Nayeem: store credit only.
5. **What Money contains.** Today: P&L, VAT (Mushak) and partner payouts are inside Money. Nayeem: Payments Operations + Finance; P&L to Analytics; statutory accounting out of v1.
6. **Staff access vs HR.** Today: staff and access live inside the HR module, so Connect has none. Nayeem: core Roles & Security that works without HR.

Also unresolved inside the briefs themselves:
- Setup & Migration: permanent (#17) or contextual after launch (#21);
- the owner of exchange rates (#5 / #6 / #16);
- where Tasks, Team chat, Leads and My dashboard go (not in any brief).

---

## 9. Assessment to keep in mind

**What each side brings:**
- Nayeem's briefs are mostly **discipline** (one owner per idea, separate state models, a shallow menu, power hidden per mode and role) plus a large **scope**: 8 workspaces and about 25 engines.
- The build is **wide**, and its mess comes from **duplicated concepts**, not from feature count. The 6.1 list covers all of them.

**What follows:**
- **Subtract first, then merge, then add.** That way the merged product gets cleaner as it grows.
- **Guard against SME overload.** Seven order state dimensions, 3-way matching and RFQ are enterprise depth. Keep them hidden until a merchant's mode, size or role needs them; that is Nayeem's own "power underneath, simplicity on top" rule.
- **Keep the build's Bangladesh strengths:**
  - payout calendar with BD holidays;
  - evening payout check;
  - COD courier flow;
  - Bangla throughout;
  - POS speed and shortcuts.

---

## 10. Landmines

- **Two different design-file families.** Many screens are converted design files with static demo data (most settings forms, analytics, console, support tickets, warranty, storefront). Changing their look does not change any shared data. Check whether a screen reads `src/lib` before trusting it.
- **Some menu ids point to different routes than you'd expect.** For example, the old `storefront-theme` id now opens the landing builder (see `NAV_ALIAS`). Use `registry.js` to map ids → routes.
- **Online edition specifics:**
  - approval takes stock out at once (`edition.js › holdsStock`), and stock may go below zero;
  - there is one stock place (`stockSetup.js`).

  Any order or stock experiment must be checked in both shapes.
- **The ledger is shared** by orders, POS, payouts, payroll, platform costs and returns. A change to how money posts shows up in Home, Money, Reports and profit at once. Test across them.
- **The evening check** opens at 8 PM unless `?quiet=1` is set or the clock is moved.
- **`npm run convert` overwrites every screen.** Never run it.
