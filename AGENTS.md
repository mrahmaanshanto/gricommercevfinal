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
  - Shape: buttons, inputs and selects are 32px tall on a desktop and 44px on phones (`--control-height`), with
    `var(--radius-lg)` (8px); cards and panels `var(--radius-xl)` (12px) with the soft card shadow; badges, chips and
    icon buttons `var(--radius-full)`.
  - Density (Shopify's admin, approved Oct 2026; `docs/shopify-style.md`): 20px page titles, 16px icons in buttons and
    lists, 40px table rows, figures 14px. A page shows the main thing and the rest is one click away on the record.
    Pages are built from `components/ui/IndexKit.jsx` (ShopHeader / RecordHeader, MetricStrip, IndexTabs, SearchField,
    Pager, Menu, KV; classes `ix-*` at the end of design-system.css). References: `MerchantOrders.jsx`, `AllProducts.jsx`,
    `Home.jsx`.
  - Muted text is `var(--text-muted)`, never `#94a3b8`.
  `npm run pattern` snaps literals back onto the tokens and re-applies the shell hooks (safe to
  rerun; needed after `npm run convert`).
- Layout: no screen has a fixed width. Merchant screens use the shared shell classes (`gc-shell`,
  `gc-shell__main`, `gc-shell__content`) and the reflow hooks `gc-cols-2…6`, `gc-split`, `gc-side`,
  `gc-cardrow`, `gc-table-wrap`; their rules are at the end of `design-system.css`. The sidebar is a
  rail below 1280px and a drawer below 1024px. One `<h1>` per screen (`ShopHeader` / `RecordHeader`, `<PageHeader>` or
  the hero title).
- Shared behaviour lives in `src/components/ui` (`Overlays`, `Dialog`, `PageHeader`, `EmptyState`, `InfoTip`,
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
  Never show statistic cards that repeat the tabs under them: the counts go on the list's view tabs (`IndexTabs`) and
  amounts in the card's foot line (see Invoices). On phones the title and main button share a row.
- Short pages (UI/UX audit, Oct 2026): title → main action → 3–5 key facts → work list → details on click. No intro
  paragraphs or card subtitles that repeat what the page shows: a page's longer explanation goes in `PageHeader`'s
  `about` (hidden, read by Help); an explanation tied to one figure or setting goes behind `InfoTip` (components/ui,
  an (i) that opens on tap); setup steps and background fold into `<details className="gc-disclose">`. Keep a warning
  only where it prevents a mistake (payments, payroll, security, irreversible actions), next to the control. Empty
  states are one line plus one action. Dashboards show at most five urgent rows, grouped (e.g. "10 missing
  punch-outs"), with View all. Requests are reviewed in a drawer, never decided in the list: HR leave, loan and
  attendance-fix requests open `screens/staff-hr/HrReview.jsx` (summary, facts, cover by day, Approve / Deny in the
  footer, Deny asks for a reason). Settings pages hide field help behind "Show field tips" (`SetTips` in
  `SetChrome.jsx`; `set-help--keep` keeps a line that prevents an error). The Netlify badge (`#nl-badge-frame`) gets
  space reserved at the bottom (`--host-badge` rules at the end of design-system.css) so it never covers a save bar.
- Editions (`src/lib/edition.js`): the product is sold as editions, each its own site built with `NEXT_PUBLIC_EDITION`
  = `retail-wholesale` | `online` | `retail-online` (Retail + Wholesale + Online) | `comms` (GridCommerce Connect:
  communication, CRM, POS, automation).
  Unset = the full product, where `?edition=<id>` previews an edition (Settings › Subscription & billing has a switcher).
  `MODULES` maps each module to its menu ids and the pages outside the menu it owns; every menu id belongs to exactly one
  module. The menu (`team.js › navFor`), the page guard (`components/RoleGuard.jsx`), Home (Comms edition: `CommsHome.jsx`),
  Reports (`catalogue.js › editionReports`), Settings' section list, Help links, the top bar, My dashboard and the demo
  accounts follow it; orders and sales are filtered to the edition's channels (`editionChannels()` in `orders.getOrders`,
  `salesBook.getSales`). New page or menu item → add it to a module in `MODULES`. Stock and purchase are three modules:
  `catalog` (products, stock, Purchases, suppliers, damaged & expired, warranty), `places` (warehouses, branches, racks,
  transfers, adjustments, counts, holds) and `purchasing` (purchase orders, receiving, requests); the Online edition has
  only `catalog`.
- Sign-in: `/` opens `/merchant-sign-in`, which asks "Choose your system" (`components/SystemPicker.jsx`, `lib/systems.js`:
  Retail + Wholesale, Online, Retail + Wholesale + Online — each its own site; on the full site it previews the edition).
  For now (demo) tapping a system signs in at once and opens its dashboard; email / phone sign-in still works below it.
  Team profiles (owner/CEO, HR, warehouse, shop …) are switched in Settings › Profile type (`/set-profile`) and the account menu.
- One inventory, two shapes (`src/lib/stockSetup.js`, Settings › Stock setup `/stock-setup`): `mode` one place (Online
  edition: `locations.getPlaces()` shows only that place and the damaged bay; `stockAt` without a place = that place) or
  many; `homeId` = where online orders ship from and come back to (`locations.onlinePlace()`); `buying` direct / orders /
  both (`navForSetup` hides the other); `supplierChanges`; `wholesale` (product form and list hide wholesale price, MOQ,
  sell-to when off). Moving to another edition shows a banner (`components/StockSetupBanner.jsx`); moving to one place merges
  every other place's stock into it (`lib/stockMerge.js`). Direct purchases: `/purchases` + `/buy-goods`
  (`supplierBills.addBill({ direct: true })`, receive moves, `paySupplier`, `productCost.setBuyingPrice`, expiry batches
  `lib/batches.js` → Damaged & expired › Expiry). Damaged customer/courier returns add a +qty move at the bay.
- Platform costs (`src/lib/platformCosts.js`, `platformUsage.js`): SMS, WhatsApp, email, AI calls and voice are billed from
  the prepaid "GridCommerce credits" account once a month (one expense row per service when the month closes); the
  subscription (by edition) and server & storage are charged to the card's bank on the 12th. They are generated ledger rows
  (`ledger.getEntries`), so Income & expenses, profit and reports show them; report "Platform & messaging costs".
- Connections (`/connections`, Settings › Connections; `src/lib/connections.js`): the one place where every
  outside app and service is connected — Sell online (Meta catalog, Google Merchant, WooCommerce, Shopify), Inbox & social
  (Facebook, Instagram, WhatsApp, TikTok, YouTube, Google Business, LinkedIn, X, Pinterest, Threads, Telegram), Ads &
  tracking, Payments, Delivery, SMS & email, Devices & tools. `APPS` lists them (group, brand for `components/BrandLogo`,
  kind, module, page); `statusOf` reads the lib that owns each (channels.js, settlements.js gateways, hr.js devices, or
  `gc.connections`). One connect flow, `/connect?app=` (`screens/connections/ConnectApp.jsx`: sign in · choose · what to
  use · review · done; stores take an address and keys; SMS / email take a provider); gateways and couriers open
  `GatewaySetup` (prop `provider`) on the Connections page; devices and tools go to their page. Every other "Connect"
  button points here (old Social accounts, Ad accounts and WordPress sync menu items are aliases of it / the WooCommerce
  channel; `/social-connections` redirects; the ad-accounts screen is `/ad-accounts`). New outside service → add it to `APPS`.
- Sales channels (an area; module `channels` in retail-wholesale, online, retail-online): product sync to Meta
  Commerce, Google Merchant Center, WooCommerce and Shopify. UI only — `src/lib/channels.js` simulates syncs (progress
  follows the clock: connecting → syncing → success / partly synced / processing / failed; `?sync=failed` makes the next one
  fail), product statuses from the real product list (`channelProducts`, `PRODUCT_CHS`), plain-word problems with the fix
  (`ISSUES`; channel codes only under Technical details), retry, fix (barcode, SKU, photo, weight), publish / remove. Pages
  in `src/screens/channels/` share `chShared.jsx`: `/channels`, `/meta-commerce`, `/google-merchant`, `/woocommerce`,
  `/shopify` (one page, `ProductChannel.jsx`; WooCommerce's store settings are `/woo-sync`), `/sync-issues`,
  `/channel-settings`. Google Business (`/google-business?tab=`: locations, reviews + AI reply drafts, business info and
  hours, posts, media, services) is under Marketing. The product page has a Sales channels card
  (`components/ProductChannels.jsx`); All products has a Channels filter, a mark per connected channel and bulk actions.
- Inbox channels follow Connections (`connectedInbox(use)`, `components/inbox/useLiveChannels.js`): chat chips show the
  connected chat channels, Comments only connected channels' posts, and a Reviews view shows Google reviews (the Google
  Business review list); the header's Channels button lists every inbox channel with Connect / Reconnect.
- Phone (checked page by page at 390 px, Oct 2026): `.gc-shell__content` clips sideways overflow on phones, so anything
  wider than the screen must scroll inside its own box (`gc-table-wrap`, a bordered `overflow-x:auto` strip) or be made to
  fit — never rely on the page scrolling sideways. Tap targets are ≥36px (the shared rules cover switches, `.ib`, small
  square icon buttons and card-row actions). Grids marked `gc-cols-2/3` stack on phones unless they also have
  `gc-cols--keep`. A title shares its row with the page's main button; long titles wrap between words. Put phone rules in
  the screen's own CSS inside `@media (max-width:640px)`; app screens (`src/screens/app`) use `src/styles/phone-app.css`,
  the platform console uses `src/styles/console-responsive.css` (its header comment lists the table/form/chart hooks).
- Menu: business areas, as in Shopify's admin (`docs/reference-ux.md`, `docs/shopify-style.md`).
  - `src/shell/navigation.js` lists the areas in two groups:
    - Commerce: Home · Orders · Products · Inventory · Purchasing · Payments · Customers · Communications · Finances ·
      Analytics · Marketing · Online Store · Sales channels · POS.
    - Team & settings: Staff & HR · Team · Settings.
  - An area's pages are its `children`:
    - the sidebar shows the areas, and the open area lists its pages under it;
    - an area row opens its first page the role can open.
  - Page fields:
    - `hidden` pages are create flows. They are not listed; they light up the page named in `under`.
    - `tab` is a shorter name for the page under its area.
  - Records (an order, a profile) and create flows keep their own address.
  - A new page goes into an area's `children`, and into a module in `MODULES`.
  - Page ids never change. Area ids are `area-*`. Old menu ids still used by a screen's `active` (including the old
    parents, such as `stock-more` or `hr-time`) map to a page through `NAV_ALIAS`. The sidebar highlight and role
    access both read it.
- Language: the switch in the account menu, on sign-in and in Help calls `setLocale`. The shell translates itself
  (`src/shell/i18n.js`); every page is translated by `src/runtime/translateDom.js`, which swaps whole strings
  found in `src/lib/i18n/bn.js` (plus number patterns) and restores English on switch back. Words follow
  `docs/terminology.md` (one word per idea, EN + BN): add a string to both when you add UI copy. Never select
  elements in CSS/JS by their visible text, placeholder or a control's aria-label (they change in Bangla).
- Home (`/merchant-overview`, `screens/merchant-overview/Home.jsx`) is built from the shared books via
  `reports/dailySummary` (no sample numbers), laid out like Shopify's Home: the key figures (Sales, Orders, Money in
  hand, This month against the target in `gc.home.layout`), a greeting with "Ask GridAI" (fires `gc:gridai`, which
  opens the GridAI panel and asks), the day's to-do as pills, then Sales · last 7 days and Best sellers. The old
  design screen `MerchantOverview.jsx` stays as reference. The top bar crumb is the page's area.
  The Online edition has its own Home, `OnlineHome.jsx`, laid out like Home (figures: Sales, Orders, Visitors,
  Conversion, Money in hand; greeting with Ask GridAI and to-do pills; Sales · last 30 days and Latest orders); the
  Connect edition's `CommsHome.jsx` follows the same pattern. Charts are drawn
  with `components/charts/DashCharts.jsx` (ColumnChart with an optional line, Sparkline, Donut, StackBar, HBars,
  Legend: hover and arrow-key tooltips, a hidden table per chart, bars rise once on first show). Chart colours are
  the `--viz-1…8` tokens (checked for colour-blind separation; keep the order; a colour follows one thing across the
  page, e.g. Facebook is always `--viz-1`). Orders keep coming after the demo September: `lib/liveOrders.js` makes
  each day's online orders from 1 October up to now (fixed seed per date; statuses move with the clock); orders.js
  lists them and the sales book counts them. Website visitors by hour and source: `lib/traffic.js`.
- Orders (online): statuses are `src/lib/orderStatus.js` — a new order is On hold (COD), Processing (paid in full) or
  Pending (payment due) by its payment (`statusKeyOf` maps saved labels, 'New' and old labels), then Approved → Ready for
  courier → In transit → Delivered (or Cancelled / Returned). Verification is a step, not a status. The steps are
  `src/lib/orderFlow.js`: auto / manual verification call, approve / cancel (orders.js) / take advance + approve (the rest
  becomes the COD amount), packing checklist (courier, checks, slip printed, packed, slip attached → Ready for courier),
  `sendToCourier` (In transit: tracking ID, COD locked, charge), `courierWebhook` (out for delivery, delivered, failed,
  return; the same event twice does nothing), `trackingOf` (courier scans: shown in Tracking only). Every event sends
  SMS / email through `src/lib/notifications.js › notify` (once per order and event; per-order log with retry), set up
  at Settings › Notifications › Order notifications (`/set-notifications`, `SetNotifications.jsx`: per-event SMS / email /
  customer / shop toggles and templates with `{{variables}}`). Order text is short and plain (Shopify style).
  Stock: an approved order holds its stock, except in the Online edition (`edition.js › holdsStock`), where approval
  takes it out at once (`orders.js › takeOrderStock`, may go below zero) and cancelling puts it back. Order items can
  carry a photo (`orderFlow.js › setLinePhoto`, resized to 480 px). The order page's Order verification card shows the
  customer's courier record (`orderLinks.js › courierHistory`: totals and each courier).
- Product ↔ orders (Nayeem's briefs #1 Product + #4 Sales & Orders, merged Oct 2026; logic only, the UI is fixed):
  - **One product master.** `stock.js › getCatalog()` is the stock catalogue plus the product list (`products.js`
    demo rows and products saved in this browser). Each product or variant is one SKU row, carrying `st`,
    `oversell`, `productId`, `mrp` and `barcodeType`. A demo product brings its own stock at Central Warehouse; a new
    product starts at 0, and Add product › Opening stock posts it once as an `opening` stock move.
  - **What can be sold** is decided in `lib/sellable.js`:
    - only Active products are sellable;
    - online and retail also need "sold to" Retail or Both and a price (wholesale needs a wholesale price);
    - "Keep selling when out of stock (pre-order)" = `oversell` lets an out-of-stock item be ordered.
    Create order uses `orderableItems()`. The register (`Pos.jsx`) and the inbox product pickers drop non-Active products.
  - **Orders keep what was sold.** `orderLinks.js › addOrder` freezes each line (`listPrice`, `price`, `priceChanged`,
    `cost`, `productId`, share of `discount` and `tax`) and stores the order's discount, VAT, note and tags.
    - A hand-typed price and the discount are written to the order's activity.
    - The same order sent twice within 20 s returns the first one (`duplicate: true`). Counter sales and orders with no
      phone are never treated as repeats.
  - **Order states.** `lib/orderStates.js` works out confirmation, payment, fulfilment, delivery, due, completed,
    exceptions and the next step from what the order records. The orders CSV export carries them.
  - **Each step happens once.**
    - `approveOrder` returns false when the order is no longer new.
    - `sendToCourier` returns the parcel already booked and refuses orders that aren't approved or packed.
  - **Order notes.** Order detail's Order note and Internal note save when the field is left.
  - **Barcodes.** "Make one" makes an in-store EAN-13 (starts with 2, `barcodeType: 'internal'`). Google Merchant
    treats it as no GTIN (`channels.js`).
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
  `/settlements`, `/expenses-bills`, `/account-reports`, `/account-setup`) sharing `screens/accounts/accShared.jsx`
  (in the menu: the Finances area, and Payments for `/settlements` with Payment setup `/set-payments`);
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
- Reports: the Analytics area (with Daily summary, Scheduled reports and Ads tracking) and one page, `/reports-centre`. Every report is a definition in
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
- Proposal switches (branch `explore/nayeem-merge`; `docs/handoff-nayeem-merge.md`): parts of Nayeem's proposal are tried
  behind switches in `src/lib/proposal.js` (`FLAGS` = the backlog; `isOn(key)`, `useProposal(key)` in `lib/useProposal.js`),
  off by default, so all off = today's build. `/dev/proposal` flips them (only `built: true` ones) and opens a page both
  ways; `/dev/proposal/doc` is `docs/proposal-vs-build.md` with the briefs' sections linked. `?p=a,b` / `?p=off` pins one
  tab. The top bar (or a corner badge on pages without it) says "Proposal: N on". Switches only work while developing or
  with `NEXT_PUBLIC_SHOW_STORYBOARD=true`. An experiment checks its key at the narrowest point, then sets `built: true`.
- `npm run check:screens` fails when a screen brings back a literal the tokens replace.
- Check changes with `npm run build` (prerenders every route) and by loading the screen.
