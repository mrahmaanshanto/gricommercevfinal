<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# GridCommerce front end

- Front end only: no backend, database or API. Screens run on the demo data in their own logic.
- `src/screens/<module>/<Page>.jsx` is the source for each screen; edit it directly. It was
  generated from `design/templates/<module>/<Page>.dc.html` by `scripts/convert-design.mjs`.
  Re-running the converter overwrites every screen and route, so don't run it after hand edits.
- `design/` is the read-only design export (reference only).
- Shared shell: `src/shell/navigation.js` (menu), `gc-sidebar.js`, `gc-topbar.js`, `Shell.jsx`.
- Routes are `/<kebab-page-name>`; `src/screens/registry.js` lists every screen.
- One design pattern for every screen, defined in `src/styles/design-system.css` (read the two
  comment blocks above the type and radius tokens). Screens use tokens, never literals:
  - Text: main text (body, labels, inputs, buttons, table cells) is 13px `var(--text-sm)`; helper
    text, small headings, table headers and badges are 12px `var(--text-xs)`. Weights are 400 body,
    500 labels/buttons/badges, 600 headings and prices; 700 is not used.
  - Fonts: `var(--font-sans)` everywhere, `var(--font-bn)` for Bangla, `var(--font-data)` for IDs
    and figures. Monospace (`var(--font-code)`) is for code blocks only.
  - Shape: buttons, inputs and selects are 44px tall with `var(--radius-lg)` (8px); cards and
    panels `var(--radius-xl)` (12px); badges, chips, tabs and icon buttons `var(--radius-full)`.
  - Muted text is `var(--text-muted)`, never `#94a3b8`.
  `npm run pattern` snaps literals back onto the tokens and re-applies the shell hooks (safe to
  rerun; needed after `npm run convert`).
- Layout: no screen has a fixed width. Merchant screens use the shared shell classes (`gc-shell`,
  `gc-shell__main`, `gc-shell__content`) and the reflow hooks `gc-cols-2…6`, `gc-split`, `gc-side`,
  `gc-cardrow`, `gc-table-wrap`; their rules are at the end of `design-system.css`. The sidebar is a
  rail below 1280px and a drawer below 1024px. One `<h1>` per screen (`<PageHeader>` or the hero title).
- Shared behaviour lives in `src/components/ui` (`Overlays`, `Dialog`, `PageHeader`, `EmptyState`,
  `ChannelIcon`, `StatusBadge`) and `src/runtime/ui.js` (`toast`, `confirmDialog`, `getLocale`/`setLocale`).
  Success feedback is a `toast`, destructive actions ask with `confirmDialog`, a control without a
  handler says so with a toast. `src/lib/format.js` writes money/dates/times; `src/lib/orderStatus.js`
  is the one list of order statuses (sidebar, tabs, badges and stepper read it).
- UX patterns (docs/ux-audit.md): every page has Help — the top-bar Help button (or Shift+?) opens
  `components/ui/HelpPanel.jsx` with the page's entry in `src/lib/help.js` (English + Bangla; pages without an
  entry get one built from the menu and the header). `PageHeader` keeps one primary action (`gc-btn--solid`); the
  others fold into "More" on phones (`PhoneMore` does the same for hand-made headers and toolbars). Filters:
  `components/ui/FilterBar.jsx` (`FilterBar` for new lists; `MobileFilters` wraps a page's own selects so phones get
  a "Filter (n)" bottom sheet). `Sheet` is the side panel / bottom sheet; `PhoneActionBar` pins a form's main action
  to the bottom on phones. On phones list tables become cards on their own (`src/runtime/mobileTables.js`; a grid that
  must scroll sideways gets `gc-table--keep`), and statistic rows (`gc-kpis`, `gc-cardrow`) become a swipe strip.
  Never show statistic cards that repeat the tabs under them: make the tabs summary tabs (`gc-stattabs` /
  `gc-stattab`: label, count and amount, tap to filter — see Invoices). On phones the title and main button share a row.
- Menu: `src/shell/navigation.js` (9 groups, at most two levels). Old menu ids still used by a screen's `active`
  map to the new item through `NAV_ALIAS` (sidebar highlight and role access both read it).
- Language: the switch in the account menu, on sign-in and in Help calls `setLocale`. The shell translates itself
  (`src/shell/i18n.js`); every page is translated by `src/runtime/translateDom.js`, which swaps whole strings
  found in `src/lib/i18n/bn.js` (plus number patterns) and restores English on switch back. Words follow
  `docs/terminology.md` (one word per idea, EN + BN): add a string to both when you add UI copy. Never select
  elements in CSS/JS by their visible text, placeholder or a control's aria-label (they change in Bangla).
- Home (`/merchant-overview`, `screens/merchant-overview/Home.jsx`) is built from the shared books via
  `reports/dailySummary` (no sample numbers); sections can be hidden with Customise (`gc.home.layout`). The old
  design screen `MerchantOverview.jsx` stays as reference. The top bar crumb comes from the menu group.
- POS: `/pos` (`src/screens/pos-register/Pos.jsx`) is the one register; `/pos-manage` (`PosManage.jsx`) is its
  back office (counters, employees and shifts, cash pickups, settings). Both read and write
  `src/lib/posStore.js` (browser storage). Register shortcuts are listed in `SHORTCUTS` in `Pos.jsx` (F1 on screen).
- Sales has no separate wholesale module. A wholesale customer (`src/lib/customers.js`, with a price list set
  when the customer is added) is chosen in New sale (`/pos`): the prices load on their own and the sale can be
  completed as an unpaid invoice. `/sales-invoices` (`src/screens/sales/SalesInvoices.jsx`, `src/lib/invoices.js`)
  lists invoices as Unpaid or Paid; recording the payment completes the sale and its order.
- Shared operations data (front end, localStorage): `src/lib/locations.js` is the one list of places (every
  place dropdown reads it); `src/lib/stock.js` is the catalogue with on hand / held / available / in transit
  (`stockAt`) and stock moves (`addMove`); `src/lib/stockHolds.js` holds; `src/lib/orders.js` orders;
  `src/lib/invoices.js` invoices, payments, credit, deliveries; `src/lib/returns.js` return history;
  `src/components/ManagerPin.jsx` manager approval (demo PIN 1234). `/return-exchange` is the only return flow.
  Money: `src/lib/ledger.js` (accounts + every movement; post where money actually moves; demo September in
  `ledgerSeed.js`). Gateways (bKash/Nagad online, SSLCOMMERZ, EPS), the card machine and couriers hold money in
  `Holding` accounts; posting into one also queues it for that partner's payout. `src/lib/settlements.js` has the
  partner rules (fee, payout days, weekend + BD holidays), expected payouts, confirm / delay / withdraw and the
  evening check (`components/EveningCheck.jsx`, 8 PM). Accounts is six pages (`/accounts-home`, `/money`,
  `/settlements`, `/expenses-bills`, `/account-reports`, `/account-setup`) sharing `screens/accounts/accShared.jsx`;
  old Accounts addresses redirect in `next.config.mjs`. Gateways and couriers are set up with
  `components/GatewaySetup.jsx` (Settings › Payment Gateway and Accounts › Setup): straight to an account or settled
  later (automatic T+n, set weekdays / dates of the month, or manual withdraw), API keys, and the accounts it needs.
  Sales by channel (Online / Retail / Wholesale, with cost of goods) is `src/lib/salesBook.js`; profit by channel
  `src/lib/profit.js` (counted when sold / owed); expense and income categories, each expense tied to a channel or
  Shared, `src/lib/categories.js`; salaries, sales commission, affiliate payouts and promotions owed
  `src/lib/liabilities.js` (payments post with `liab` so profit doesn't count them twice). Pages: `/sales-profit`,
  `/dues`, `/liabilities`; Income & expenses is `/expenses-bills`. `gc.clock.offset` (ms, localStorage) moves the check's clock for testing.
  suppliers: `src/lib/supplierBills.js` (bills from receiving, payments, credit notes). `docs/GridCommerce-flows.pdf` maps the flows.
- More shared data: places are live (`getPlaces()` in `locations.js`, `usePlaceList(kind)` in `lib/usePlaces.js` for
  pickers: first render = built-in list, then the live one); racks and bins `lib/racks.js`; HR (staff, shifts, roster,
  attendance, leave, loans, payroll runs, increments / promotions (`changes`), attendance machines (`devices`), positions,
  gratuity and final settlement, salary statements) `lib/hr.js` — payroll approval makes the month's salary liability;
  new staff join through `/staff-create` (the 7-step flow) and each person has `/staff-profile?code=&tab=`; field groups
  are shared in `screens/staff-profile/staffForm.jsx`; HR pages: `/pay-changes`, `/positions`, `/gratuity`,
  `/salary-statements`, `/id-cards`, `/attendance-devices`. QR codes: `lib/qr.js` + `components/QrCode.jsx`; print one
  element (letters, ID cards) with `lib/printNode.js`; loyalty
  (members, points, wallets, referrals; POS checkout reads it) `lib/loyalty.js`; blog posts, categories, authors
  `lib/blog.js`; inbox chats, comments and calls `lib/inbox.js`.
- Reports: one menu group (after Accounts) and one page, `/reports-centre`. Every report is a definition in
  `src/lib/reports/defs/<group>.js` (contract at the top of `src/lib/reports/catalogue.js`) rendered by
  `/report?id=<id>` (`screens/reports/ReportView.jsx`: period + compare, filters, KPIs, `components/reports/ReportChart`,
  `ReportTable` with a per-report column chooser, CSV and a letterhead PDF via print; `components/reports/PrintLetterhead`
  for other report pages). Scheduled reports (email/WhatsApp) live under Automation (`/scheduled-reports`, `lib/reports/prefs.js`). Report pages that existed
  before (Sales & profit, Account reports, Sales book …) are listed in the catalogue as `kind: 'page'`. Sale lines with
  cost/place/staff/source come from `salesBook.getSaleLines()`; demo online orders from `getOnlineOrders()`; the
  manager PIN log from `lib/auditLog.js`; ad spend from `lib/adSpend.js`. Add a report = add a definition object.
- Team (demo sign-in): `src/lib/team.js` has the 13 staff roles (CEO, CTO, content, order management, communications,
  ads, warehouse manager / supervisor, shop manager / supervisor / seller, HR, online sales), the demo users and what each
  role can open. The sign-in page lists them (`components/DemoAccounts.jsx`); `?as=<user id>` on any page signs in too.
  The side menu shows only the role's items (`navFor`), `components/RoleGuard.jsx` covers menu pages outside the role,
  and the top bar shows the user with Switch account. `/my-dashboard` (`screens/team/MyDashboard.jsx`) is each role's
  day, built from the report definitions plus role widgets; `/tasks` is the task manager (`lib/tasks.js`: teams, tags,
  several assignees, watchers, IT requests / bugs / requests, blocked-by, time, history; list, board, calendar,
  workload, bulk changes, Ask IT), `/team-chat` the team chat (`lib/teamChat.js`: channels per team, DMs) and
  `/sales-leads` leads & follow-ups (`lib/leads.js`; `/leads` is taken by the platform console).
- Responsive rules for the platform console frame (`.cs`) and fixed design boards (`data-board`, zoomed to fit) are in
  `src/styles/console-responsive.css`. `?quiet=1` stops the evening payout check from opening by itself (tests, screenshots).
- Reference pages (UI kit, flows, site map, storyboards) are under `/dev/…`. They and the POS /
  settings screen switchers only show in a production build when `NEXT_PUBLIC_SHOW_STORYBOARD=true`.
- `npm run check:screens` fails when a screen brings back a literal the tokens replace.
- Check changes with `npm run build` (prerenders every route) and by loading the screen.
