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
  `npm run pattern` snaps literals back onto the tokens and re-applies the shell hooks (needed after `npm run convert`).
  **Don't run it on today's screens** (checked 16 Oct 2026): it rewrites ~340 hand-edited files (a second scroll box
  around tables already inside `ix-table-wrap`, an extra `<PageHeader>` h1, heights and weights snapped). When
  `check:screens` flags a literal, replace that one value with the token of the same size by hand.
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
  space reserved at the bottom (`--host-badge` rules at the end of design-system.css) so it never covers a save bar; full-height apps (the Inbox) fill the window instead and only move what sits under the badge's corner (`--host-badge-w`).
- Editions (`src/lib/edition.js`): the product is sold as editions, each its own site built with `NEXT_PUBLIC_EDITION`
  = `retail-wholesale` (shown as **Retail**) | `online` | `retail-online` (Retail + Online) | `comms` (GridCommerce Connect:
  communication, CRM, POS, automation).
  Unset = the full product, where `?edition=<id>` previews an edition (Settings › Subscription & billing has a switcher).
  `MODULES` maps each module to its menu ids and the pages outside the menu it owns; every menu id belongs to exactly one
  module. The menu (`team.js › navFor`), the page guard (`components/RoleGuard.jsx`), Home (Comms edition: `CommsHome.jsx`),
  Reports (`catalogue.js › editionReports`), Settings' section list, Help links, the top bar, My dashboard and the demo
  accounts follow it; orders and sales are filtered to the edition's channels (`editionChannels()` in `orders.getOrders`,
  `salesBook.getSales`). New page or menu item → add it to a module in `MODULES`. Stock and purchase are three modules:
  `catalog` (products, stock, stock adjustments and counts, Purchases, suppliers, damaged & expired, warranty), `places`
  (warehouses, branches, racks, transfers, holds) and `purchasing` (purchase orders, receiving, requests); the Online edition has
  only `catalog`.
- Sign-in: `/` opens `/merchant-sign-in`, which asks "Choose your system" (`components/SystemPicker.jsx`, `lib/systems.js`:
  Retail, Online, Retail + Online — each its own site; on the full site it previews the edition).
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
- Sales channels (an area; module `channels` in online and retail-online): product sync to Meta
  Commerce, Google Merchant Center, WooCommerce and Shopify. UI only — `src/lib/channels.js` simulates syncs (progress
  follows the clock: connecting → syncing → success / partly synced / processing / failed; `?sync=failed` makes the next one
  fail), product statuses from the real product list (`channelProducts`, `PRODUCT_CHS`), plain-word problems with the fix
  (`ISSUES`; channel codes only under Technical details), retry, fix (barcode, SKU, photo, weight), publish / remove. Pages
  in `src/screens/channels/` share `chShared.jsx`: `/channels`, `/meta-commerce`, `/google-merchant`, `/woocommerce`,
  `/shopify` (one page, `ProductChannel.jsx`; WooCommerce's store settings are `/woo-sync`), `/sync-issues`,
  `/channel-settings`. Google Business (`/google-business?tab=`: locations, reviews + AI reply drafts, business info and
  hours, posts, media, services) is under Marketing. The product page has a Sales channels card
  (`components/ProductChannels.jsx`); All products has a Channels filter, a mark per connected channel and bulk actions.
- Inbox, Messenger style (Oct 2026): an **Inbox** area right under Home (Chats, Comments `?view=comments`, Mentions
  `?view=mentions`, Support tickets, Calls, AI calls) with live counts (`lib/liveCounts.js`, menu items name theirs with
  `live`; the sidebar and top bar re-read on `gc:inbox`). The top bar has a chat button (unread chats badge) with a
  Messenger list; a chat picked there opens as a floating window (`components/inbox/ChatDock.jsx`, mounted in the root
  layout, only on pages with the top bar, chat heads when minimised, full screen on phones; event `gc:chat-open`).
  Messages are drawn by `Thread.jsx › MessageList` (grouped bubbles, time between groups, Seen avatar, hover/tap to react
  ❤️😆😮😢😠👍 or reply, big emoji, story-mention and call bubbles, new messages slide in; `actions={false}` for read-only
  lists such as the ticket conversation). `components/inbox/Messenger.jsx`: VoiceNote (real audio for recordings made in
  this session, `inbox.keepVoice/voiceUrl`; speed 1×–2×), VoiceRecorder (MediaRecorder + live waveform, falls back to a
  timed demo), CallScreen (ringing → timer → call bubble + call log row), ReactPicker, Mentioned (@Name in notes).
  `lib/inbox.js` adds reactions (`reactTo`), `replyTo`, `bigEmoji`, `unreadCount` (chats with unread), social mentions
  (`getMentions`, `chatFromMention`) and team mentions (`teamMentions`: notes with @FirstName). Comments are drawn
  Facebook-style (bubble, "time · Like · Reply" line, nested replies).
- **Inbox › Email** (`/email-inbox`, `screens/merchant-inbox/EmailInbox.jsx`, `lib/emailInbox.js`, browser storage `gc.emailbox`):
  the shop's email to info@, sales@, support@ and orders@ as conversations (one row per thread: everyone in it, message count;
  views Inbox · Assigned to me · Starred · Sent (threads the shop wrote in) · Archived · Spam, Deleted when it has any; address
  filter, search). Wide screens read beside the list, smaller ones in a side panel. A thread lists its messages in order, the
  middle ones folded ("n earlier messages"); each message shows To / Cc (Bcc on the shop's own), its quoted mail behind "•••"
  and Reply · Reply all · Forward for that message. The writing box does Reply / Reply all (`recipientsFor`: sender, plus
  everyone on To and Cc without the shop's addresses) / Forward (quotes the message and its attachments) with To, Cc, Bcc, or a
  Note; messages keep `to`, `cc`, `bcc`, `kind`, `replyTo`, `quote`. Demo: a customer's answer joins the thread 45 s after the
  shop's first reply and makes it unread (`answer` → `pending`). Assign, star, archive, spam, delete with Undo, Compose (From,
  To, Cc, Bcc, Subject). The sender is
  matched to a customer by email and `#1xxxxx` order numbers link to the order. Menu count `live: 'email'` (unread in Inbox,
  part of the Inbox area total). The domain is the Business email domain once active, else sample mail with a "Set up" line.
- Inbox channels follow Connections (`connectedInbox(use)`, `components/inbox/useLiveChannels.js`): chat chips show the
  connected chat channels, Comments only connected channels' posts, and a Reviews view shows Google reviews (the Google
  Business review list); the header's Channels button lists every inbox channel with Connect / Reconnect.
- Phone (checked page by page at 390 px, Oct 2026): `.gc-shell__content` clips sideways overflow on phones, so anything
  wider than the screen must scroll inside its own box (`gc-table-wrap`, a bordered `overflow-x:auto` strip) or be made to
  fit — never rely on the page scrolling sideways. Tap targets are ≥36px (the shared rules cover switches, `.ib`, small
  square icon buttons and card-row actions). Grids marked `gc-cols-2/3` stack on phones unless they also have
  `gc-cols--keep`. A title shares its row with the page's main button; long titles wrap between words. Put phone rules in
  the screen's own CSS inside `@media (max-width:640px)`; app screens (`src/screens/app`) use `src/styles/phone-app.css`,
  design boards use `src/styles/console-responsive.css` (its header comment lists the table/form/chart hooks).
- Phone pass 2 (Oct 2026, every page at 390 px): one control scale on phones — 44px fields and `gc-btn`, 40px `ix-btn` and
  the list search, 36px small buttons, chips, tabs, segments (never under 36). GridAI has no floating button where the top
  bar is: the bar's sparkles button fires `gc:gridai`; Help moves into the account menu. Figure strips snap to whole
  cards and fade at the right edge while there is more. `<small>` never drops under 12px. A kept table that is a grid of
  figures adds `gc-table--scroll` (scrolls in its box, no wrapping); list tables drop `gc-table--keep` and become cards.
  The POS register scrolls as one page on phones (header and View cart stay pinned).
- **Grid AI (Oct 2026)**: one shared AI for the whole shop (module `gridai`, every edition and plan), front end only, simulated
  over the real demo data. `lib/gridai/engine.js` is the one orchestrator: `customerTurn(conv)` (understand Bangla /
  Banglish / English, budget, product → pick an agent → knowledge (live shop data beats documents) → tools (`TOOLS`, risk
  1 read · 2 draft · 3 switched-on action · 4 approval; customer tools return public fields only, an order is shown only to
  its own number) → policy → reply → decision auto / suggest / person → `usage.meter`), `merchantTurn(q, user)` (answers
  from the books, refused outside the person's access via `team.canSee`), `summarize(conv)`. Agents are settings
  (`agents.js`, nine: support, sales, order, lead, follow-up, marketing, inventory, analytics, operations). Models and
  routing (`models.js`: providers, tiers 0 rules · 1 efficient · 2 standard · 3 reasoning, main + fallback, budget, limits,
  security), cost metering and the demo history (`usage.js`), feedback and corrections that wait for review before
  becoming knowledge (`quality.js`), the test set and release gate (`evals.js`: a model change runs it; a critical failure
  blocks it), risk-4 approvals with 24 h expiry and a re-check (`aiApprovals.js`), Inbox helpers (`inboxAi.js`: Autopilot
  state, priority, follow-up, list views). AI automations are `automationRules.js` rules with `cat: 'ai'` and
  `{ kind: 'ai' }` actions. Pages (`screens/gridai/`): Overview `/ai-overview`, Assistant `/grid-ai`, Agents, Knowledge &
  training (with Corrections), Test AI (playground + test cases), Automations, Activity & approvals, Analytics, Usage &
  billing, Settings = Behaviour `/ai-behaviour` + Models & limits `/ai-models`. The assistant chat is
  `components/gridai/Assistant.jsx` (floating panel `GridAi.jsx` and `/grid-ai`); shared pieces (trace, product cards,
  order summary, answer blocks) `components/gridai/parts.jsx`. Inbox: `components/inbox/Copilot.jsx` (Copilot card with
  Accept · Edit · Regenerate · Copy · Dismiss and Why; Autopilot / Copilot switch per chat; Take over bar; Sent by GridAI +
  Rate → correction), a person's reply stops Autopilot for that chat (takeover), GridAI summary in the customer panel,
  list views Unread / GridAI handling / People / Follow-up / High priority. Every person may open the assistant (`BASE`).
- Menu: business areas, as in Shopify's admin (`docs/reference-ux.md`, `docs/shopify-style.md`).
  - `src/shell/navigation.js` lists the areas in two groups:
    - Commerce: Home · Inbox · Orders · Products · Inventory · Payments · Customers · Communications · Finances ·
      Analytics · Marketing · Online Store · Sales channels · POS.
    - Inventory keeps the old menu's stock pages and order (build 7c766c0), its "More stock tools" listed openly.
      Pages with the same `sub` fold into one row under the area (its `subs`: Warehouses & branches).
    - Team & settings: Staff & HR · Team · Settings.
  - An area's pages are its `children`:
    - the sidebar shows the areas, and the open area lists its pages under it;
    - an area row opens its first page the role can open.
  - Page fields:
    - `hidden` pages are create flows. They are not listed; they light up the page named in `under`.
    - `tab` is a shorter name for the page under its area.
  - Records (an order, a profile) and create flows keep their own address.
  - A new page goes into an area's `children`, and into a module in `MODULES`.
  - Look (Oct 2026, from the platform console's ConsoleShell): 264px panel, compact 36px rows with 28px icon tiles (the
    open / current area's tile is the navy gradient), a chevron that turns, pages indented under a guide line (current
    page: light-blue pill + navy bar), the edition chip under the logo and the person's card at the bottom; the 76px rail
    keeps the tiles. All of it is in `gc-sidebar.js`'s own CSS.
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
  Conversion, Money in hand; greeting with Ask GridAI and the Needs you list; Sales · last 30 days and Latest orders, then
  the same Home widgets as the full Home without its Latest orders, `HomeWidgets skip={['latest-orders']}`); the
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
  - **Add product layout** (Oct 2026) follows Nayeem's reference page exactly (`docs/reference-add-product.md`): main
    column Title/descriptions (rich text, `RichText.jsx`, HTML in `long`) → Media → Classification (main category +
    subcategories `subcats`, template) → Specifications (per-product layout `specLayout`, shop template untouched) →
    Pricing → Product model (format, selling mode `sell`, sellability `sellability`: catalogue-only isn't sellable) →
    Variants (+ Variant editor drawer) → one-line cards with drawers (identifiers/units `invMode`, shipping, SEO;
    relationships are hidden, `SHOW_RELATIONS` in AddProduct.jsx); side column Status · Publishing · Organization · Product data · Google listing readiness · Warranty ·
    Activity. Shared parts in `AddProductParts.jsx`; new products start as Draft.
  - **Barcodes.** "Make one" makes an in-store EAN-13 (starts with 2, `barcodeType: 'internal'`). Google Merchant
    treats it as no GTIN (`channels.js`).
- **SEO (Module C, Oct 2026)**: one model, `lib/seo.js` (an item's `seo`: metaTitle, metaDescription, focusKeyword, canonical,
  noindex, nofollow, og*, schema; older page `seo.title/description` and product `seoT/seoD/noindex` still read via `readSeo` /
  `seoPatch`), links in text as `[text](url){nofollow sponsored ugc new}` (product HTML keeps rel/target), automatic schema
  (`autoSchema`: Product, BlogPosting, LocalBusiness, CollectionPage, FAQPage, BreadcrumbList) merged with the shop's own
  JSON-LD (same type replaces), `headFor` / `headHtml`, Bangladesh-time scheduling (`toDhakaInput`). One panel,
  `components/seo/SeoPanel.jsx`, in the page, post, product, category and landing-page editors. `lib/seoItems.js` = every
  website item through one adapter per type (`allItems`, `contextOf`, `saveSeo`, `saveHandle`, `saveAlt`, `healthOf`, sitemap,
  robots.txt). `lib/redirects.js`: 301/302 list, `autoRedirect` called by each type's save when a live item's address
  changes (no chains / loops), not-found log. Addresses come from `lib/handles.js › toHandle` (Bangla → Latin letters, or
  kept). Pages: Online Store › SEO `/seo` (Health · Redirects · Not found · Sitemap · robots.txt · Settings) and `/seo-bulk`.
  Customer views (`screens/storefront/storeChrome.jsx`: shared header/footer, `useStoreItem` follows redirects and logs
  misses, `SeoHead` writes the head tags): `/page`, `/blog-post?slug=`, `/product?handle=`, `/category?handle=`,
  `/lp?handle=`. Front end only: tags are added after load (inspector, not View source); the server must send them.
- **Services (Module B, Oct 2026)**: merchants buy expert help (SEO, Meta / Google ads, branding, store design, product
  upload, migration, setup, descriptions). One shared store, `lib/platform/services.js` (catalogue with packages, add-ons,
  brief form, editions / plans; experts; orders with statuses brief → progress ⇄ waiting (deadline paused) → qa → delivered →
  closed, monthly reports, store access, extra-work quotes, refunds; `billables` / `payables`). Dazzle Shop is platform store
  #0090 (`SELF_SHOP`; platform `DATA_VERSION` 4). Merchant: Team & settings › Services (`/services`, `/service-detail`,
  `/service-order`, `/my-services`, `/my-service`; `screens/services/`; paying also books an expense in the shop's ledger).
  Super admin: Services area (`/admin/services`, `/admin/service-order`, `/admin/services/catalogue` + `/admin/service-edit`
  with the brief form builder, `/admin/services/experts`, `/admin/services/reports`; `screens/admin/services/`).
  `lib/admin/servicesSync.js` (run by AdminShell) books charges into Finance › Income, partner payouts as expenses waiting
  (owed), sent refunds, and approves the access session the owner approved in their panel (`supportAccess.approvedInPanel`).
- **Business email (Module D, Oct 2026)**: name@shop mailboxes sold per mailbox, provider-neutral (`settings.provider` is a
  placeholder: own servers or a reseller). One shared store, `lib/platform/mail.js` (settings: plans, storage add-ons,
  included mailboxes per plan, yearly discount, caps, provider cost; domains with verify + MX/SPF/DKIM/DMARC that turn green
  with the clock, seats, extra GB, catch-all, shop sending, quarantine, imports, charges; mailboxes; addresses
  alias/group/forward; `shopSender`, `offboard`, `alerts`). Merchant: Settings › Business email `/email` (setup steps, then
  Mailboxes · Addresses · Domain & DNS · Plan & usage · Apps (QR, IMAP import) · Spam) and `/webmail` (provider stand-in).
  Users & roles' invite can make a mailbox; HR `settleLeaving` suspends it and forwards its mail; Order notifications show
  the sending address. Super admin: Business email area (`/admin/email` directory with money and alerts, `/plans`,
  `/abuse`; `screens/admin/email/`).
- **Storefront builder (Module A, Oct 2026)**: one engine in `src/lib/storefront/`. `store.js` is one browser store
  (`gc.storefront`, event `gc:storefront`); theme, headers and layouts each keep a draft and a published copy (customers see
  the published one); restore points (newest 6) are made before every import and publish, and `restoreTo` makes one first, so
  going back can be undone. First open seeds the Signal preset, published.
  - `theme.js`: `OPTIONS` (59 in 9 `GROUPS`; an option may carry `lock` = a super admin switch, or `plan`), `contrastIssues`,
    `themeVars` (CSS variables `--sf-*` scoped to `.sf-theme`). `presets.js`: `PRESETS` Signal / Nokshi / Counter,
    `whatWillChange`, `importPreset(id, parts)` (never products, customers or orders), `resetThemeToPreset`.
  - `headers.js` (computer and phone, 3 rows × 3 areas, `ELEMENTS`, phone drawer + bottom bar, `headerFor(id)`), `layouts.js`
    (`KINDS` home/product/category/page/cart/search/404, 15 `SECTION_TYPES`, conditions; `layoutFor(kind, ctx)`: product beats
    category beats page beats all), `blocks.js` (HTML blocks from blog blocks; `usedIn`), mega menus on menu items
    (`item.mega` in `storeMenus.js`, `megaProblem`). `access.js` reads the super admin's `gc.admin.themes` READ-ONLY (the theme
    assigned to `0090` gives the merchant-editing switches; presets follow the theme's `packages` and the plan; `lockOf(x)`).
    `cart.js` (`gc.store.cart`; the side cart opens on `gc:store-cart-open`; Checkout reads it).
  - Customer pages are drawn by `screens/storefront/storeChrome.jsx` (StoreChrome / ThemeChrome, `storeHeader.jsx`,
    `sections.jsx` › `useLayout` + `<Sections main>`): `/store`, `/cart`, `/search`, the themed not-found, `/product`,
    `/category`, `/page`, `/blog-post`, `/lp`, `/offers`, `/offer-detail`, `/checkout`, `/order-link`. `?preview=1` shows
    drafts; editors push unsaved copies into preview frames (`sendPreview`; `&header=`, `&layout=`, `&preset=`).
  - Merchant screens (Online Store, first rows): Theme `/theme` (presets, import with choose-what + what-will-be-replaced,
    restore points), Customize `/theme-editor` (fills the window; option search; live preview computer / phone; draft,
    publish, undo, reset), Header builder `/header-builder`, Layouts `/layouts` + `/layout-edit`, HTML blocks `/html-blocks` +
    `/html-block-edit`, mega menu in Menus. Shared parts `screens/online-store/sfShared.jsx`. Super admin › theme record:
    the merchant-editing switches are live (each says what it hides).
- **Website editor, phase 0 (Oct 2026; the plan for the whole editor: every section in several looks, page / checkout /
  sign-in / account styles, pop-ups, SEO + AEO / LLM settings, 7 themes, JSON import / export)**:
  - Looks: a `SECTION_TYPES` entry may carry `styles: [{ id, label, sketch }]` (`sketch` = rectangles in a 100×62 box,
    drawn by `sfShared.jsx › StyleSketch`); the section keeps `variant` (`layouts.js › variantOf`, which also reads the
    old Category tiles `style`). Built so far: Hero (full, boxed, split, banners + `side`, video + `video`/`poster`),
    Category tiles (tiles, circles, cards, carousel, list), FAQ (accordion, columns, topics with `item.topic`, split).
    `LIB_GROUPS` / `groupOf` order the section library.
  - Style controls: `lib/storefront/styles.js` (`box` on a section: steps None…XL per device `{d,t,m}` for padding and
    margin, width, alignment, background colour / picture + shade, pattern (`PATTERNS`: grid, dots, lines, diagonal, waves), text colour, heading font and size, button look,
    hide per device, entrance animation, anchor, CSS class). `boxProps` → CSS variables + classes read by `BOX_CSS`
    (wrapper class `sfsx`; `sfx` is the side cart's). Computer ≥1024, tablet 641–1023, phone ≤640.
  - Global styles (Theme › Customize): `buttons` (solid / outline / soft / pill), `fieldStyle`, `badgeStyle`, `shadow`,
    `iconStyle`, `spacing` adds Airy; `themeClasses(values)` on the store root + `TOKENS_CSS`.
  - `/layout-edit` fills the window (menu folded): Sections list (select, drag, arrows, hide, copy, remove, Add section
    library with looks), live preview (computer / tablet / phone; `?preview=1&edit=1` makes the frame's sections
    clickable: `store.js › isEditing / selectInEditor`, the editor sends `select`), and the panel Content (look + fields) ·
    Style · Advanced. Undo / Redo (Ctrl+Z / Ctrl+Shift+Z). `cleanBox` trims `box` on save.
- **Theme pack: 8 themes from Bangladeshi stores (Oct 2026; research in `docs/theme-research-oct-2026.md`)**:
  `lib/storefront/presetsPack.js` (`PACK`, joined into `PRESETS`): GhorPure (Ghorer Bazar), NovaByte (Star Tech),
  NaturaNest (Naturo), Haatly (HT Bazar), Rupkotha (Shajgoj), GlowMuse (Beauty Booth), Voltiva (Shei Tech), GizmoLane
  (GadStyle). Each copies a store's layout, sections and styles, never its logo, photos, text or exact colours; logos are
  the owner's own (`public/assets/themes/<id>-logo|stacked|logo-light.png`, shown only with `?preview=1&preset=<id>` or
  once the theme is imported). A pack theme sets the theme values (card, product page `productStyle` / `detailsStyle`,
  checkout), one header (`hdr-<id>-main`), home / product / category layouts and menus (`presetMenus`). New sections for
  them are in `screens/storefront/sections2.jsx` (`moreBody`; trust, brands, reviews, product tabs, bento, deal, banner
  grid, coupons, quick links, steps, CTA, reels, YouTube feed, visit outlet, SEO text).
  - Checkout styles (Customize › Cart & checkout; `Checkout.jsx` root class `ck-style-<id>`): `checkoutStyle` classic ·
    grocery (order review first, login bar, payment tiles, the district sets the charge) · quick (products, zone cards,
    details; cash on delivery only) · specs (points banner, payment beside delivery with store pickup) · compact · advance
    (notice bar; COD with a bKash / Nagad advance of `advanceAmount`: the number paid from + transaction ID go to
    `manualPayments.submitManualPayment`, without them a payment link is made) · steps (secure header, 3 steps, Full /
    advance switch, tip cards) · signin (phone + code before the form). `checkoutBump` = one add-on offer in the summary.
    `checkoutMode: 'popup'` opens checkout over the page (`storeChrome › CheckoutPop`, `CheckoutBody popup`; the side
    cart's Checkout and Buy now call `cart.js › goCheckout`).
  - **All sections** (`/store-showcase`, `screens/storefront/StoreShowcase.jsx`; linked from Online Store › Theme and its
    preview): one page with every section of every theme's layouts (one per look, labelled with the themes that use it; a
    look no theme uses gets sample content from `sectionStarters.js`, shared with `/layout-edit`), every header of every
    theme, the 10 product cards, the product page (buy box × details switch) and checkout (style switch, `CheckoutBody`
    props `cs` / `bump`; pop-up button) and every footer. `?preview=1&preset=<id>` draws it in that theme. noindex.
  - **Complete home + tweak panel (16 Oct)**: every home layout has every kind of section (`completeHome.js`: the theme's
    own sections first, each missing kind at its place in `HOME_ORDER`; Video starts hidden until it has a link). Stores
    saved before `SF_VERSION` 2 are upgraded once (`presets.js › upgradeData`: missing sections, the look's new font).
    `/store` has a "Tweak this page" button → `/store?preview=1&tweak=1` (`StoreTweak.jsx`, lazy, portal in the admin
    look): click a part on the page (sections carry `data-sec`, header rows, product cards, footer) or pick it from the
    list; look thumbnails, words, products, background, spacing, width, hide / move, add a missing kind; theme fonts,
    colours, corners, buttons, titles; header, cards, footer, product page and checkout styles. Every change saves the
    draft at once; Publish / Discard. Demo: everyone sees the button; a live store shows it to signed-in staff only.
  - **Looks for every section (16 Oct)**: every kind has 3–10 looks (`SECTION_TYPES[].styles`; products' layouts are
    `PRODUCT_LOOKS`). A look is a class on the kind's own markup (`is-<look>`; Text and picture uses `look-<look>`
    because `is-left/right` is the picture side), styled in `screens/storefront/sectionLooks.js › LOOKS_CSS`; a few looks
    have their own markup (Reviews big / compact, Deal split, CTA split / centre / outline, Visit our shops cards / list /
    split, Best sellers grid, FAQ cards, Brands circles / moving strip). Kinds that had one look keep it as the first.
  - **Page styles (16 Oct, WoodMart + the 8 reference stores)**: theme options `productLayout` (7: photos left / right,
    stacked with sticky details, big photos, centred, compact, tinted panel; `.spd-lay-<id>` in StoreProduct.jsx), `gallery`
    (+ slider, stacked), `detailsStyle` (+ side tabs), `checkoutStyle` (+ split, centre = 10), and group `pages`:
    `aboutStyle`, `policyStyle` (privacy, terms, returns, delivery = `POLICY_TEMPLATES`), `blogStyle` (the new `/blog`,
    `StoreBlog.jsx`), `postStyle` — 5 each, drawn by `screens/storefront/pageStyles.jsx` (About adds section looks around the
    page's words; policies split the text at its headings). Every pack theme sets its own. Sketches: `lib/storefront/pageLooks.js`
    (`PAGE_LOOKS`, `PAGE_PARTS`). The tweak panel's **Pages** part shows them, and "Tweak this page" works on the product,
    checkout, page and blog screens (`storeChrome › TweakDock`, `?preview=1&tweak=1&part=pg:<id>`). Checkout reads
    `themeValues()` (draft in a preview) and follows `gc:storefront`.
  - **About us + Contact us, picture slots, phones (16 Oct)**: `screens/storefront/shopInfo.jsx` holds the shop facts
    (`useShopInfo`: contact from Settings › General, branches from `locations.getPlaces` with their hours, `SHOP_SOCIALS`),
    `openState(hours)` (reads "Sat–Thu 10:00 AM – 10:00 PM", Dhaka time, after mount, every minute: Open now / Closing soon /
    Closed · Opens …), and the parts `OpenBadge`, `ShopCards`, `SocialLinks`, `Testimonials` (published 4–5★ reviews +
    the average), `ContactChannels`, `ContactForm` (makes a support ticket via `supportTickets.addTicket`), `QuickAnswers`.
    Every About look ends with reviews, shops and socials; `aboutStyle: 'classic'` is now "Figures, values and shops". Contact
    has `contactStyle` (cards · split · map, `ContactPage`); StorePage draws About and Contact always in their style.
    The blog link: `resolveLink` gives `{ type: 'blog' }` the address `/blog`; every theme's header menu ends with Blog
    (`presets.js › menusFor`), and saved menus get it once (`storeMenus.js › withBlog`, flag `gc.storeMenus.blog`).
    Picture slots: `sectionLooks.js › FIT_CSS` pins each picture box to its own shape (`grid-template:minmax(0,1fr)/
    minmax(0,1fr)` on aspect-ratio boxes, aspect ratios on offer / text-and-picture / deal banner), so any upload shows at the
    theme's size; `storeKit › SF_CSS` clips sideways overflow on `.sf-theme` and caps media at 100%. Phones: quick links two
    per row, steps as a tight list, coupons and blog posts as swipe strips, bento lower row 2 cards, 28px logo, 44px taps,
    the Tweak button a round icon at the bottom left. Check a new section by swapping every picture for a 300×1500 and a
    1800×200 one: no picture box may change size.
  - **Global settings, WoodMart's elements, edit everything (16 Oct)**:
    - Global settings (`theme.js`, groups Global styles · Form fields · Icons and details · Shop details, plus Typography /
      Product card / Product page / Extras additions): button size, text, hover; field look (outlined, filled, underline,
      raised, pill), height, corners, focus; tick boxes; quantity buttons; option buttons; icon frame, line, size, colour;
      social icons; stars; heading weight, spacing, title colour; links; motion; price colour / size / old price; badge
      position; card brand, stock bar, wishlist heart, quick view, zoom; catalogue mode; age check; social links. They are
      CSS variables from `themeVars › detailVars` (`--sf-field-*`, `--sf-fbt/fbx/fbb`, `--sf-focus-ring`, `--sf-btn-*`,
      `--sf-icon-*`, `--sf-star`, `--sf-price*`) plus root classes (`themeClasses`, rules in `TOKENS_CSS`). Every field skin
      in the store (`.sf-input`, `.ck-in`, `.shi-field`, category sort, `.gc-input` inside the store) reads the variables, so
      a component's own error / focus rule still wins.
    - WoodMart features: wishlist and compare (`lib/storefront/saved.js`, `/wishlist`, `/compare` with template specs and
      "Only the differences", `StoreSaved.jsx`), quick view (`storeExtras.jsx`, event `gc:store-quick-view`), card actions
      (heart, quick view, compare; `data-pid` on cards), My account (`/account`, `StoreAccount.jsx`: mobile + one-time code,
      shown on screen in the demo; orders by that number), product page stock bar, sold count, sale countdown (only when a
      live flash sale lists the product) and Frequently bought together from real orders, else "Goes well with"
      (`productExtras.jsx`), catalogue mode, age check, section dividers (Style › Top / Bottom edge, `styles.js › DIVIDERS`).
    - 14 new section kinds (`layouts.js`, drawn by `screens/storefront/sections3.jsx`, starters in `sectionStarters.js`;
      not added to the home by `completeHome`, shown on `/store-showcase` and in Add section): hotspot (Shop the look, pins),
      compare (before / after), testimonials, team, timeline, counters, pricelist, marquee, gallery, table, iconlist,
      social, spotlight, contact — 3–5 looks each.
    - Editing: the section field editor is shared (`screens/online-store/SectionFields.jsx › Field`, new `pins` type: click
      the picture to drop a pin) and the tweak panel uses it, so every field of every section (items, pictures, links,
      icons, products) is edited on the store. The panel adds Global styles (live preview), Words and labels, Shop details,
      All settings (every Customize group), a setting search, "Edit this product" after clicking a card, and "This section
      shows your … · Open …" links to where the data lives. Store words: `lib/storefront/words.js` (`WORDS`, `w(key, vars)`,
      saved as theme `words`, draft → publish); a word drawn with `data-w` opens in the panel on a click.
  - **Premium home (16 Oct)**: Signal's home (`/store`) is a running shop, not every kind at once: `completeHome.js ›
    premiumPlan()` (19 sections in a buying order: hero + PC banner, promises, category rings, flash sale, New arrivals,
    one product big (iPhone 18 Pro, dark), banner mosaic, best sellers by category, Shop our counter (pins), brand strip,
    figures, real reviews, shops, guides, Instagram, FAQ, newsletter, recently viewed, about text) and `premiumHome`
    (kept sections keep their ids; every other kind stays in the layout, hidden, for the tweak panel's eye button).
    `PREMIUM_LOOK` (presets.js) is Signal's global settings. Store `SF_VERSION` 5 gives a saved Signal store the premium
    home and look once (`upgradeData`); `premiumPlan` is a function so no ids are made while the modules load (store.js ↔
    presets.js cycle). The plan's photos are the gadget ones (banners, products, the shop counter).
  - **Blog authors and related posts (16 Oct)**: `/author?slug=` (`StoreAuthor.jsx`: hero with avatar, role, bio, topics,
    links; figures only when they have live posts; their posts with topic chips; More writers; Person schema; email and
    phone never shown). Under every post `blogExtras.jsx › PostMore`: More from <author> and Related posts (shared topic,
    then tag; a small blog lets the author's posts fill it). The post byline and author box link to the author page
    (`PostPreview` with `live`). The blog list's look class is `sbl is-<look>` (`sbl-grid` is the inner grid; the old
    `sbl-<look>` made the Grid look's wrapper a grid too).
  - **Brand kit** (tweak panel, first part; `lib/storefront/brandKit.js`): upload the logo → `logoColours` reads its
    brand colours on a canvas, `suggestPalettes` gives five colour sets (button colour darkened to 4.5:1 for white text),
    `suggestFonts` three `FONT_PAIRS` by the colour's mood; one tap applies to the draft.
  - **Type per theme**: `FONT_PAIRS` carry a display face, a text face, heading weight `hw` and tracking `tr`
    (`--sf-head-w`, `--sf-head-track`; capitals get +0.04em). Signal Plus Jakarta Sans, Nokshi Bodoni Moda + Jost, Counter
    Lexend, GhorPure Fraunces + Figtree, NovaByte Archivo, NaturaNest Young Serif + Nunito Sans, Haatly Bricolage + DM Sans,
    Rupkotha DM Serif + Jost, GlowMuse Instrument Serif + Manrope, Voltiva Unbounded + Manrope, GizmoLane Sora + Figtree.
    Hero and section titles use `clamp()` sizes; body 15px (M). Only the pair's weights load.
  - Demo products with photos (`public/assets/products/`): Smart Watch S2, Fastrack FPods, FPods ANC, Magnetic Phone
    Cooler, SKE Mini DC UPS, Redmi 17, Redmi Turbo 4 / 4 Pro, Redmi Note 15 4G / 15 Pro+, iPhone 18 Pro, iPhone Duo
    (pre-order, `oversell`), MacBook Neo (category Laptops), Galaxy Tab A11+. `catalog.js › productsBy` puts products with a
    photo first in every list (not hand-picked). Banners (`public/assets/banners/`): `completeHome.js › withBanners` puts
    `HOME_BANNERS` (Galaxy S26 Ultra, iPhone 18 Pro series, Mac mini) first in every home slider and a PC parts tile first in
    the banner grid (store `SF_VERSION` 3 upgrades saved stores). A slide with a picture and no title, text or button is a
    picture-only banner (`.sfs-slide.is-pic`, shown whole at 15:8; a slider holding one gives every slide that shape,
    `.has-pics`). Brands: 31 more names and 24 logos (`public/assets/brand-logos/`, `brands.js › LOGOS`; merged once into a
    saved list, a saved brand without a logo gets it); the brand wall shows brands with products or a logo. Shop logo: the
    Dazzle wordmark (`public/assets/brand/dazzle-logo.svg` + `-white.svg`) is `businessProfile().brand.logo / logoOnDark`
    unless Settings › Brand assets has one; the store header, footer and letterheads use it. Flash sale's default look
    (`panel`) is a dark panel with the sale colour's glow, product photos (matched by name) and a pill button.
- **Landing pages (16 Oct)**: one-product sales pages that take cash-on-delivery orders.
  - **Data.** A page (`lib/landingPages.js`, `gc.landingPages`) holds `parts` and `style` (accent, theme, font from every
    `FONT_PAIRS` entry incl. the Bangla display faces, corners, `pattern`, sticky order bar).
    - Sales parts: `lib/landingParts.js › PARTS` (20: hero, countdown, benefits, order form, offer cards, callout box,
      customer proof, picture banner, certificates and logos, reviews, FAQ, …), with SectionFields-style fields.
    - **Store sections**: any kind of the store's library (`SECTION_TYPES`, every look). Such a part is the section itself
      with `sf: true` (`isStorePart`); `partKind` / `partLabel` / `partIcon` read either kind.
    - Every part may carry `box` (Style / Advanced tabs, `lib/storefront/styles.js`) and `orderBtn` (an "Order now" under it).
    - `partsFor(template, factsOf(product))` fills sales parts from the product; `ensureParts` upgrades an old page.
  - **Drawing.** `screens/storefront/landingView.jsx` draws the page inside the store theme (`.sf-theme`, `lpTheme(style)`:
    the shop theme with the page's accent, font, corners, colours) with the store's CSS, so store sections are drawn by
    `sections.jsx › Section` with their looks. Sales parts get the box classes (spacing per device, background, pattern,
    colours, fonts, show per device, animation).
  - **Order form.** `mode`: quantity offers of the page's product (`tiers`) or several offers (`choices`: any product or
    a bundle product, qty, price, old price, tag, picture, note); `offersOf(part, product, products)`. Offer cards show the
    same offers and their button picks one in the form. AreaPicker, delivery fee from `deliveryRates`, free delivery over an
    amount, `orderLinks.addOrder` (tag "Landing page"). The visit's `utm_*` / `fbclid` / `gclid` are kept for the session
    (`gc.lp.utm`) and saved on the order (`utm`, source Facebook / Instagram / TikTok / WhatsApp / Website);
    `attribution.touchesOf` uses a recorded `utm` instead of the demo journey. Drafts and the builder make no order.
  - **Builder** (`/landing-page-builder`, `LandingPageBuilder.jsx`, full window):
    - start: pick a product, then a template or "Build it with AI";
    - left: Parts (drag, arrows, hide; Add part = Sales page parts + Store sections with looks, `LayoutEdit › LibraryBody`),
      Page (product, link, style, pattern, checks), AI builder;
    - middle: a preview frame `/lp?draft=1&preview=1&edit=1` at phone / tablet / computer width (real media queries); the
      unsaved page is posted with `sendPreview('landing')`, the selection with `'select'`; a click selects
      (`gcSfSelect`);
    - right: Content (fields, or `SectionFields` for a store section; Rewrite with AI) · Style (`StyleTab`) · Advanced
      ("Order now" under it + `AdvancedTab`), the same tabs as Online Store › Layouts;
    - Undo / Redo, SEO (SeoPanel `landing`), Save, Publish / Unpublish.
  - **The AI** (`aiBuild`, `aiRewrite`, `headlineIdeas`) is GridAI's marketing agent, simulated and metered (surface `landing`).
  - Templates built from the new parts (e.g. a combo-offer page) are still to come.
- **Settings › Files (Oct 2026)** (`/files`, menu id `products-media` moved from Products to Settings, module core;
  `screens/files/Files.jsx`, `lib/files.js`, `components/files/FileParts.jsx` + `FilePicker.jsx`): every picture, video and
  document. Uploads are resized (2000 / 800 px WebP + a 200 px preview) and kept in IndexedDB `gc-files`; the list is
  `gc.files`; an upload's address is `gcfile:<id>` (draw it with `FileImg` / `useFileSrc`; HTML blocks resolve with
  `resolveIn`). Product photos, brand logos and blog covers saved with their records are listed read-only. `usedIn(src)`
  (layouts, headers, blocks, menus, pages, products, brands, posts) keeps a used file from being deleted by mistake;
  Replace keeps the address. `ImageField` / `FilePicker` (Library · Upload · Web address) replace the old picture
  select (`sfShared › ImagePick` now uses it). Storage counts in Hosting › Usage.
- **Merge with Nayeem's Batches A–F (16 Oct, branch `nayeem-update-2026-10-16`)**. Nayeem built A–F on the 14 Oct
  handover, before the 16 Oct storefront work. The owner's decisions, and what they mean for the code:
  - **Store engine: ours is the base.**
    - `lib/storefront/schema.js` is the one vocabulary, as in Nayeem's design, but it holds this build's lists: the 14
      option groups, the 41 section types with their looks (`styles`, `variant`), `PRODUCT_LOOKS` and `LIB_GROUPS`.
    - His additions are kept: the `notice` header element, `HEADER_SWITCHES`, the `custom` section, `ITEM_ICONS`,
      `STYLE_PRESETS`, notices, spots, block kinds and link types.
    - `theme.js`, `headers.js` and `layouts.js` re-export from it. It has no imports: `tools/store-kit/check.mjs` runs it
      in Node.
  - **Older design files** (his section `look`, Category tiles `style`, types `icons` / `locator`) are converted by
    `schema.js › fromOldSection` before `kit.js › checkKit`. The conversion is `OLD_LOOKS` / `OLD_TYPES`: icons →
    iconlist, locator → outlet, testimonials `place` / `image` → `role` / `photo`.
  - **Design files hold our parts too.** `kit.js` keeps a section's `variant` and `box`, list items' `id`, theme pictures
    and the store's `words`. `presets.js › presetKit(id)` makes each of the 11 built-in themes a design file from the
    preset itself, so Theme › Preview / Import / Export work for all of them. `designName(id)` reads library themes.
    `kits/*.gcstore.json` are his originals, read only by `kitDraft.js` (Build with GridAI).
  - **Two editors, for now.**
    - Theme › Edit store opens his `/store-editor`. The store's "Tweak this page" stays ours, and is hidden inside
      editor frames.
    - Both use `LayoutEdit.jsx`'s exports: `SectionFields` (our looks + fields + colours), `summary`, `previewPath`,
      `STARTER` (our `sectionStarters`; values may be functions), `LE_CSS`.
    - In an edit frame, sections carry `data-sec-id` / `data-sec-label`. A click posts both `gcSfSelect` (Layouts) and
      `gcSfPick` (store editor).
    - `SectionFields.jsx › Field` gained his `custom` / `values` types; `sections.jsx` draws `custom` with `CustomBody`.
    - His own section renderers and look CSS were dropped: they targeted the same classes as our looks.
  - **Accounts: his.** `lib/storefront/account.js`, `/account` (`StoreAccount.jsx`), `/wishlist` (`StoreWishlist.jsx`),
    `/compare` (`StoreCompare.jsx`).
    - Our card heart / quick view / compare and the product page use `saved.js`, now a thin layer over `account.js`.
    - A plain wishlist saved under the same key (`gc.store.wishlist`) by the old `saved.js` is read as the guest's list
      (`account.js › wishMap`).
    - His `storeAccount.jsx` is `accountParts.jsx`: a Mac can't hold both names. `StoreSaved.jsx` is gone.
  - **Advance payment: his settings drive both.**
    - Settings › Checkout › Partial payment (`lib/partialPayment.js › partFor`) sets the amount.
    - The Advance and Steps checkout styles use `part.now` when a rule matches, else the theme's `advanceAmount`. They
      keep their bKash / Nagad number + transaction ID (or a payment link) and hide his part-payment choice.
    - Every other style shows his "Pay part now, rest on delivery".
  - **Store chrome.** His notices (top / under the header / in the header / phone bar), placements (`Placed` spots, product
    tabs), snippets and the compare bar sit around our header, footer, looks CSS, tweak dock and pop-up checkout.
    `StoreChrome` takes `subject` (product / category) for notices and placements.
  - **Still ours, in spite of his notes:** `npm run pattern` is never run on today's screens.
- **Store design engine (Batch A, Oct 2026; Nayeem's copy)**: designs are files, not code.
  - **Store kit** (`<name>.gcstore.json`, `gcstore: 1`): theme, headers, layouts, HTML blocks, menus, pages, notices,
    placements and custom sections; never products, customers or orders. `lib/storefront/schema.js` is the one vocabulary
    (options, elements, section types and their looks, block kinds, link types, notice places, spots, `ITEM_ICONS`,
    `STYLE_PRESETS`); the editors, the checker and `tools/store-kit/VOCAB.md` all read it. `kit.js` (pure): `checkKit`,
    `kitToStore`, `storeToKit`, `fillTokens` ({{shop_name}} …, {{brand_primary}}), `kitSummary`. `kitStore.js`: `applyKit`
    (restore point first; `trusted` for GridCommerce's own files), `exportKit`, `kitPreviewParts` (a whole kit in a preview
    frame), `appliedKit`. Tools: `tools/store-kit/check.mjs`, `render.mjs`, `SKILL.md` (how Claude builds a kit from a brief).
    New option or section → `schema.js`, then `node tools/store-kit/check.mjs --vocab > tools/store-kit/VOCAB.md`.
  - Signal, Nokshi and Counter are kits in `lib/storefront/kits/` (`presets.js` reads them); super admin theme releases can
    carry a kit and published ones show on the merchant Theme page (`access.js › libraryKits`). New themes are kits.
  - **Store notices** (`/store-notices`, `notices.js`, `show.js`, `storefront/storeNotices.jsx`): many notices, places top /
    below-header / header element / phone bar, schedule, countdown, code, take turns. Header switches `overHero`, `shrink`.
  - **Block placements** (`/html-blocks?view=placements`, `placements.js`, `storefront/storePlaced.jsx` `<Placed spot>`):
    one HTML block into 12 spots for pages, categories, products, devices and dates.
  - **Theme page** (`/theme`): Edit store (main), design file import / export / preview, library designs, **Build with
    GridAI** (`kitDraft.js`, rules only), restore points.
  - **Design service** (`lib/platform/services.js` store-design ৳2,500 / 5,000 / 10,000): the expert attaches a kit to the
    delivery (`SvcOrder.jsx`), the merchant previews and applies it from `/my-service` (`KitPreviewSheet` in sfShared).
  - **Section looks and new sections**: a `look` field per section (CSS classes `sfs--look-*` in `storefront/sections.jsx`);
    new types gallery, icons, testimonials, locator (`catalog.storeBranches`), social; field type `list` (repeating items).
    Customize › Style applies a `STYLE_PRESETS` entry.
  - **Custom sections** (`/html-blocks?view=custom`, `customs.js`, `customCode.js`, `CustomSections.jsx`; section type
    `custom` + `values`): HTML + CSS with `{{key}}` settings, allow-list sanitiser and scoped CSS; writing code needs the
    Business plan and the theme's `code` switch. The server must repeat the sanitising.
  - **Store editor** (`/store-editor`, `StoreEditor.jsx`; `storefront/editBridge.jsx` in the frame with
    `?preview=1&edit=1`, sections carry `data-sec-id`): click to edit, drag, section library, style, header, undo / redo.
    It shares `SectionFields` / `previewPath` / `STARTER` with `LayoutEdit.jsx` and `OptControl` with `ThemeEditor.jsx`.
- **Designed emails (Batch B, Oct 2026; Nayeem's copy)**: one pure kit, `lib/email/emailKit.js` (parts heading · text ·
  button · order · products · coupon · tracking · info · image · divider · spacer; `renderEmail` = 600 px table HTML with
  inline styles and dark colours, `plainText`, `blocksFromText`, `emailProblem`; `{{var}}`, **bold**, [link](url)), used by
  both sides. Shop: `lib/email/shopEmails.js` (`gc.email.*`, event `gc:email`; the look starts from Settings › General;
  every notification event has an English and a Bangla designed email: `emailFor`, `saveEmail`, `resetEmail`,
  `sendTestEmail`), Settings › Notifications › Email design `/email-design` and the editor `/email-editor?event=`
  (`components/email/EmailStudio.jsx`, `EmailDesignForm.jsx`). Super admin: `lib/admin/emailDesign.js`,
  `/admin/email-design`, `/admin/templates/design?id=` (comms store version 2). Sending stays simulated.
- **Customer accounts (Batch B, Oct 2026; Nayeem's copy)**: `lib/storefront/account.js` (`gc.store.accounts`,
  `gc.store.session`, `gc.store.wishlist`, `gc.store.compare`; event `gc:store-account`). One account per mobile number;
  sign-in with a code (`sendCode`, `signInWithCode`; demo code `DEMO_CODE` 1234, demo shopper Nusrat Jahan 01553 336655)
  or email + password (`signInWithPassword`, demo hash only); `createFromCheckout` ("Save my details"); addresses with
  `bdAreas`; message choices write `lib/consent.js` (source "My account"); `ordersOf`, `buyAgainSkus`; wishlist per
  account or guest (joins at sign-in, `wishlistLink`), compare up to `COMPARE_MAX` 4. Settings › Checkout › Customer
  accounts (`accountSettings()`: accounts Off / Optional / Required — Required turns guest checkout off — code,
  password, save_details). Pages: `/account?tab=` (`StoreAccount.jsx`), `/wishlist` (`?ids=` shared), `/compare`
  (`StoreCompare.jsx`, template spec groups, `gc-table--keep`); shared pieces `storeAccount.jsx` (`useAccount`,
  `WishButton`, `CompareButton`, `CompareBar`); the header's Account / Wishlist / Compare link to them with counts
  (`useStorefront` › `me`, `wishCount`, `compareCount`). Checkout fills in from the account; `/track` opens for the
  signed-in owner; the customer page meta shows "Has an account · last sign-in".
- **Affiliates (Batch B, Oct 2026; Nayeem's copy)**: `lib/affiliates.js` (`gc.aff.*`, event `gc:affiliates`; module
  `online`, menu `mkt-affiliates` / hidden `mkt-affiliate`). Settings `affSettings()` (`AFF_DEFAULTS`: 10%, 30-day link,
  ৳500 minimum, manual approval, 7-day return window). `captureRef` runs in `useStorefront` for `?ref=`; Checkout calls
  `attributeOrder(row, { phone, code })` (an affiliate code typed in the coupon box, `isAffiliateCode`, wins; own orders
  never count). `getCommissions()` derives each order's state from the order (pending → approved after delivery + return
  window → owed / paid from its Liabilities line → cancelled). `makePayouts` adds one `affiliate` liability
  (`liabilities.addLiability`); payouts are paid in Finances › Liabilities. Pages: `/affiliates?tab=`
  (`loyalty-promo/Affiliates.jsx`), `/affiliate?id=` (`AffiliateProfile.jsx`, NAMED_ROUTES), store `/affiliate-program`
  (`StoreAffiliate.jsx`) and My account › Affiliate (`StoreAccount.jsx › AffiliateTab`). Demo affiliate login 01755 123456.
- **Batch C (Oct 2026; Nayeem's copy)**:
  - My account (`StoreAccount.jsx`): Profile first in `ACCOUNT_TABS`; Wishlist is a tab (`WishlistTab`); `/wishlist` is for
    shared links (`?ids=`) and guests (a signed-in shopper's own list forwards to the tab; `storeHeader.jsx › wishHref`).
    Profile picture: `AvatarCrop.jsx` (`AvatarField`, `Avatar`), `account.js › setAvatar / removeAvatar / initialsOf /
    AVATAR_SIZE` (256 px JPEG data URL on the account; header `IconBtn pic`).
  - Communications › Message design (`/message-design?tab=email|sms`, `screens/communication/MessageDesign.jsx`, menu
    `msg-design`, module `commerce`): `components/email/EmailDesignPanel.jsx` (was SetEmailDesign; `/email-design`
    forwards in `next.config.mjs`) and `components/sms/SmsDesignPanel.jsx` (+ `lib/smsDesign.js` wordings; texts stay in
    `notifications.getNotifySettings`). Every email preview frame uses `emailKit.previewHtml(html, dark)`.
  - Store editor is full screen (own `.se-bar`, no Sidebar / Topbar; GridAI hidden on `/store-editor`).
  - Affiliate withdrawals: `affiliates.js › withdrawRules / requestPlan / requestWithdrawal / approveWithdrawal /
    rejectWithdrawal / getWithdrawals` (`gc.aff.withdrawals`; settings `wdOn wdMax wdEvery wdApproval wdMethods`; state
    `requested`); Withdrawals tab in `/affiliates`; My account › Affiliate › Withdraw.
  - Partial payment: `lib/partialPayment.js` (`partFor`, `requestPartPayment`, `onLinkPaid`, `gc.partpay`), Settings ›
    Checkout › Partial payment (`components/PartialPaymentSettings.jsx`), Checkout's COD option, order page "Request part
    payment"; `paymentLinks.payLink` calls `onLinkPaid`.
  - Code snippets: `lib/storefront/snippets.js` (`gc.store.snippets`, `liveSnippets(path)`, `NO_CODE_PAGES`, `killOf`;
    kill switch `lib/admin/snippetGuard.js` / `gc.admin.snippets`), `/snippets`. All shop CSS (snippets, Theme › Custom CSS,
    design files) must pass `customCode.js › checkCss` and is scoped to `.sf-theme`; never on checkout, account, order-link
    or tracking pages. No shop-written JavaScript anywhere.
- **Batch D (Oct 2026; Nayeem's copy): Services control, gig pages, custom offers, teams, Grid Shop**:
  - Super admin Communications › Message design (`/admin/message-design?tab=email|sms`, `screens/admin/comms/MessageDesign.jsx`;
    Email design = `EmailDesign.jsx › EmailDesignBody`; `/admin/email-design` forwards). Communications › Email moved to
    `/admin/comms/email` (Business email owns `/admin/email`).
  - Who may use Services and Grid Shop: `lib/platform/marketAccess.js` (`gc.platform.market`, `gc:market`; per module on/off,
    every store or chosen stores, blocked stores with a reason; `canUse(module, shopId)`). Super admin › Services › Access
    (`/admin/services/access?m=services|shop`) and a merchant's Modules tab (`MarketCard`). Merchant pages pass
    `gate="services"|"shop"` to `SvcFrame` (`svcShared.jsx › useMarket`, `MarketClosed`).
  - `lib/platform/services.js` v3: service `cover`, `gallery[{src,caption}]`, `proof[{src,title,result,client}]`
    (pictures in `public/assets/services/`, `PICTURE_LIBRARY`); teams (`getTeams`, `saveTeam`, `assignTeam`; the lead is the
    order's expert); experts and teams carry `bank` (`bankText`, `BANK_METHODS`); order `tasks[]` (who, cost, status; done →
    payout `owed`; `payables()` = task payouts, booked by `servicesSync` as Finance expenses and read back as paid via
    `markTaskPaid`), `costs[]`, `updates[]` (`postUpdate`, `publishUpdate`, `sharedUpdates`); `profitOf(order)`;
    `reportOf` adds cost, profit, `byOrder`. Custom offers: `createOffer` (hidden service `custom: true`, status 'custom'; order
    status `unpaid`, `paid.pending`, `offer { code, expiresAt, sent[] }`; `expired` worked out), `payOffer(code, method)`,
    `extendOffer`, `withdrawOffer`, `logOfferSent`; store requests `requestCustom` / `getRequests` / `closeRequest`.
    `autoShareText` / `shareText` / `saveShareText` (svc.share.text overrides).
  - Merchant: `/service-detail` is a gig page (`ServiceDetail.jsx`: gallery + `Lightbox`, proof, who does it, ratings,
    package tabs, phone bar); `/service-offer?code=` the payment link page (`OfferPay.jsx`, no menu); My services shows
    offers to pay, Ask for a custom offer, and shared Progress updates on the order.
  - Super admin: `SvcMedia.jsx` (pictures editor, `PicturePicker`), `SvcOffer.jsx` (`/admin/service-offer?request=`),
    `SvcOrderWork.jsx` (OfferCard, TeamPick, TasksCard, UpdatesCard, ProfitCard), Orders tabs Requests and Offers, Experts ›
    Teams tab and payout accounts, Reports with cost and profit. `ShareSheet.jsx` shares any item: editable automatic
    text, email / SMS to picked stores through `admin/comms.sendMessage`, WhatsApp per store, social share pages, copy.
  - Grid Shop (`lib/platform/gridShop.js`, `gc.gridshop`, `gc:gridshop`): products sold from our stock (`fulfil:'stock'`,
    stock goes down on order) or shipped by a supplier (`'supplier'`); bulk `tiers`, `moq`; carts per store; orders split
    into shipments (stock + one per supplier; supplier shipments owe our cost once shipped: `supplierPayables`);
    `statusOf`, `profitOf`, `report`. `lib/admin/gridShopSync.js` books income and supplier payouts (AdminShell runs it).
    Merchant (Services area, module of the Services menu): `/grid-shop`, `/grid-shop-item`, `/grid-shop-checkout`,
    `/grid-shop-orders`, `/grid-shop-order` (`screens/services/GridShop*.jsx`, `gsShared.jsx`; menu `gs-*`). Super admin
    area Grid Shop: `/admin/grid-shop` (orders), `/order`, `/products`, `/product`, `/suppliers` (`screens/admin/gridshop/`).
- **Batch E (Oct 2026; Nayeem's copy): picture columns, Grid Shop vendors, Grid Partners**:
  - Picture columns: a row gets a small picture only when it is one thing recognised faster by sight (a product, a person,
    a company or visual content); money, logs, orders, settings and reports stay text-only. `components/ui/Pic.jsx`
    (`Pic` kind item | person | logo | cover, `PicStack`, `PicRow`; styles `.gc-pic*` at the end of design-system.css), in
    the first cell beside the name (`.gc-picrow`) and at the start of phone list items. `lib/pictures.js`: `productPic(row)`
    (own photo, else the demo photo from `lib/productPhotos.js` by id / SKU / name), `initialsOf`, `toneOf`. Demo pictures are
    drawn by `tools/records/product-photos.cjs` into `public/assets/products/` and `public/assets/gridshop/` (no brand marks);
    the demo's two "No photo" products keep their tile. HR (`staff-hr/hrShared.jsx › Avatar`) and super admin People
    (`admin/people/peopleShared.jsx › Avatar`) avatars render through Pic.
  - Grid Shop vendors (`lib/platform/gridShop.js` v2; the header comment is the price rule book): vendors replace suppliers
    (aliases kept); pricing model per vendor `commission` (default: the vendor sets the store price, we take a %) or `markup`
    (the vendor sets what they get, we add a %); fee per parcel, monthly fee; rules (`rules[]`: side vendor | store, kind
    commission | fee-per-order | monthly-fee | platform-fee | markup | discount, scope, dates, `fundedBy`; one rule per side and
    kind, the most specific wins, no stacking); `priceFor(product, shopId, qty)` → breakdown, frozen on each order line
    (`line.pb`); vendor products need approval (`review`, `pendingChange`); vendor payouts owed per delivered parcel;
    `gridShopSync` books payouts. Vendor portal (own frame, no merchant menu): `/vendor-sign-in`, `/vendor`, `/vendor-products`,
    `/vendor-product`, `/vendor-orders`, `/vendor-order`, `/vendor-money`, `/vendor-profile` (`screens/vendor/`). Super admin:
    Grid Shop › Vendors (`/admin/grid-shop/vendors`, record `/vendor?id=`; page id stays `gshop-suppliers`), Products ›
    Waiting for approval, Pricing rules `/admin/grid-shop/pricing` (rules + Try a price). Merchant shop shows Sold by, the
    discount and a Platform fee line.
  - Grid Partners (models, influencers, video creators; matching only, no money through GridCommerce):
    `lib/platform/partners.js` (`gc.partners`: partners with handle, type, platforms + followers, samples, packages,
    budget, availability, status applied | approved | rejected | suspended, verified, featured; requests sent → accepted |
    declined → done (rated) | cancelled, contact released only after accept; settings = minimum standards,
    `checkStandards`). Access: marketAccess module `partners`. Merchant Services › Grid Partners (`/partners`, `/partner?h=`,
    `/partner-requests`; menu `gp-browse`, hidden `gp-profile`, `gp-requests`). Creators' app (own frame, reuses the vendor
    frame styles): `/grid-partners`, `/grid-partners/join`, `/gp-sign-in`, `/gp`, `/gp-profile`, `/gp-requests`; public
    profile `/p?h=<handle>` (approved only) with share links, QR and a downloadable share card (`screens/partners/`). Super
    admin area Grid Partners: `/admin/partners` (+ `/applications`, `/requests`, `/settings`, record `/admin/partner?id=`).
- **Batch F (Oct 2026; Nayeem's copy): Grid Career (hiring)**: one engine `lib/platform/career.js` (`gc.career`; employers
  'gc' and stores with a careers page; jobs with an application-form builder and knockout answers; applications with stage
  new → shortlisted → interview → offer → hired | rejected, rating, notes, tags, interviews, messages (logged), status
  code; `?src=` source per share link; `hire` → prefill for `/staff-create?name=&phone=&email=&position=&branch=&from=`).
  Access: marketAccess module `career` (chosen stores; Dazzle Shop open). Shared screens `screens/career/` (JobsList,
  JobEditor, ShareJob, Applicants board/table/sheet, CareerSettings, PublicJob). Merchant Staff & HR › Hiring (`/hiring`,
  `/hiring-job`, `/hiring-applicants`; menu `hr-hiring`, hidden `hr-job`, `hr-applicants`). Public: store `/careers`
  (store theme), GridCommerce `/jobs`, candidate `/application?code=`. Super admin area Grid Career (`/admin/career`, `/job`,
  `/applicants`, `/page`, `/stores` control centre; `screens/admin/career/`).
- **Settings › Hosting (Oct 2026)** (`/set-hosting?tab=`, `screens/settings-console/SetHosting.jsx` + `hosting/*`,
  `lib/hosting.js`, browser storage `gc.hosting` + `gc.hosting.backups`, event `gc:hosting`): the store is hosted on
  GridCommerce and this section holds everything a web host offers. Tabs: Overview (address, certificate, email checks,
  bandwidth, `healthItems` to-do) · Domains (the old `/set-domains` page embedded; that address opens this tab; the demo
  shop seeds `dazzleshop.com.bd` verified and primary) · DNS (a zone per custom domain: `mode` 'gc' = GridCommerce DNS
  via `NAMESERVERS`, or 'registrar'; records A/AAAA/CNAME/MX/TXT/SRV/CAA/NS with TTL, `recordProblem` checks, `sys`
  records locked, `managed: 'email'` kept by the Email tab, go live after `LIVE_MS`; service templates, BIND import /
  export, DNSSEC with the DS record) · Email (mailbox provider, order emails from the shop's domain through GridCommerce,
  SPF built from every sender with the 10-lookup check, DKIM `gc1` + the provider's selector, bounce CNAME, DMARC builder,
  MTA-STS; `emailRecords`, `emailStatus`, `applyEmailRecords` keeps records that already match, `checkEmail`, `testEmail`;
  Business email (`lib/platform/mail.js`) decides the records when it runs on the domain) · SSL & security (automatic
  certificates + renew, own certificate on Business, Force HTTPS, HSTS, TLS, www or bare domain, headers, request limit,
  challenge, blocked countries and IPs, store password) · Speed & cache and Files & verification (online module only:
  cache times and purge, image formats, speed test; `verificationMeta()` is added to the storefront head by
  `components/seo/SeoHead.jsx`; root files, robots.txt and the sitemap stay in SEO) · Backups (website and settings
  snapshots in this browser: back up, download, upload, restore with a snapshot first; nightly server backups: restore is a
  request; Settings › API keys points here) · Usage (bandwidth by day, requests, storage against `PLAN_LIMITS`).
- **Stage 3 · online selling (Oct 2026)**: `lib/deliveryRates.js` is the one source for zone charges, extra per unit,
  delivery times (Settings › Delivery) and the advance % (Payment setup): `feeFor(zone, units)`, `zoneFee`, `advanceFor`
  (read after mount; `DEFAULT_RATES` for the first render). Structured address: `lib/bdAreas.js` (64 districts → areas → zone)
  + `components/AreaPicker.jsx` on Create order, order link and Checkout; orders keep `district` / `thana`. Tracking page
  `/track?id=` (`storefront/TrackOrder.jsx`, unlocked by the order's mobile; `orderStatus.trackingLink` = `{{tracking_url}}`).
  Return requests `lib/returnRequests.js` + `/return-requests` (requested → approved → pickup → received → refunded /
  exchanged, or rejected; customers ask on `/track`). Courier handover `/courier-handover` (`orderFlow.handoverParcels /
  handOver / handovers`, `gc.courierHandovers`, printed manifest). Orders carry `source` (`orderLinks.ORDER_SOURCES`, Source
  filter) and `assignee` (`orders.assignOrder`, "Assigned to me", bulk Assign); badges use `orderStatus.tabOf()`; the order
  page shows Return only after delivery, Resend receipt when paid / delivered. Digital orders: `sendDigital` takes licence
  keys and makes download links (`o.digital`, `digital-sent` message), `resendDigital`. Checkout settings `/set-checkout`
  (`lib/checkoutSettings.js`). `/new-order?phone=&name=` and `/pos?phone=&name=` preset the customer.
- **Stage 3 · products, POS (Oct 2026)**: warranty policies are one versioned list (`lib/warranty.js`: `getPolicies`,
  `newPolicy`, `publishPolicy`, `archivePolicy`, `setDefault`; `coverOf(product, soldAt)` uses the version live at the sale);
  claims `customerWarranty.js` (`CLAIM_STEPS` received → centre → ready → returned / rejected, `moveClaim`, `openClaim`,
  `lookupWarranty`; `/warranty-claims` with a live count). Catalog setup lists are real (`lib/catalogSetup.js` shop fields +
  size charts, `units.getUnits/addUnit`, `vat.getTaxRates`); Add product shows Shop fields (`product.custom`), Pricing is the
  third card. Suppliers: `updateSupplier`, `archiveSupplier`, `restoreSupplier` (opening balance = bill `OB-<id>`, advance =
  credit note `ADV-<id>`), Print ledger. Inventory menu: a Purchasing group (`stock-buying`); warranty pages under Products.
  POS people come from Staff & HR + Team (`posStore.EMPLOYEES/MANAGERS`, `getEmployees()`); limits per role (`POS_ROLES`,
  `POS_PERMS`, `limitsFor`, `approversFor`) and a PIN per person (`pinOf`, `checkPin`, `setPin`; demo 1234); `ManagerPin`
  takes `need` and refuses self-approval. Register: Collect due (`allocations.allocatePayment`, `posStore.addCollection`,
  money receipt), Z-report `pos-register/ZReport.jsx` (80 mm / A4); a counter sale is an invoice only when money is owed
  (`invoices.isCounterSale`). Settings › Invoices & receipts `/set-invoices` (`lib/docSettings.js`, `docNumber`), read by
  `SaleInvoice.jsx` and the receipt (shop identity from `businessProfile.invoiceIdentity()`). Home Needs you adds `pos:*`
  rows when POS is on.
- **Stage 3 · customers, marketing (Oct 2026)**: notifications beyond orders (`notifications.js › CUSTOMER_EVENTS`:
  refunds & returns, store credit & loyalty, invoices & dues, support tickets, warranty & service, account; `scope`, `mod`,
  `sender` ('' = "Not sent yet"), `owner: 'loyalty'`), sent with `notifyCustomer(event, to, vars, { ref, once })` through
  `messaging.send`; `/set-notifications` is one matrix ("Notifications", every edition). Customer profile reads every
  customer's tickets (`supportTickets.ticketsFor`), store credit, loyalty progress, offers used, messages, next meeting and
  Insights (`signalsOf`); Create order and New ticket (`/support-tickets?new=1&phone=&name=`, `?id=`). Automations is the one
  place (`/automations?tab=`: rule groups, AI, Notifications, Reminders, Smart offers, Auto-call). Folded menu pages:
  `fold: true` (+ `hidden`, `under`) = a tab of `under`; `team.js › navFor` unfolds it for people who can't open `under`.
  Marketing has 5 rows (Offers and Loyalty carry page tabs, `screens/loyalty-promo/MarketingTabs.jsx`). Live counts add
  `tickets`, `aicalls`, `coupons`, `carts`. The GridAI button on desktop is a round icon that widens on hover; pages keep
  88px of room at the bottom.
- **Stage 3 · money, team, settings (Oct 2026)**: a money movement opens in `screens/accounts/EntrySheet.jsx`
  (`/money?entry=`); nothing is edited or deleted: `ledger.reverseEntry(id, why, by)` posts a mirror (`reverses` /
  `reversedBy`; transfers both sides via `pair`), `reverseCheck` refuses generated rows and money owned by another record;
  notes and receipts in `gc.ledger.meta`. Cost filters count reversals (`e.amount < 0 || e.reverses`). Record expense has a
  place, VAT, a receipt photo and Repeat every month (`ledger.addRecurring / stopRecurring`; generated `REC-<rule>-<yyyymm>`
  rows). Notification centre `lib/notificationCentre.js` + `/notifications` (per person `gc.notify.read`, `gc.notify.prefs`,
  event `gc:notify`); the bell shows the newest 6. Top bar: Scan uses `identifiers.resolveScan`; the Settings, Invoices and Files
  buttons were taken out of the bar (Oct 2026, owner's request): Store settings is in the account menu. Menu items carry no fixed `count:`; SetRail dots follow `connections.statusOf`. "Profile
  type" shows only with `NEXT_PUBLIC_SHOW_STORYBOARD=true`. Home widgets follow the page's day and place (Sales summary,
  Order summary with `ORDER_TABS` names, Stock alert). HelpPanel shows a tutorial only when an entry has `video[2]`.
- **Stage 3 · super admin, phone app (Oct 2026)**: business verification `shop.kyc` (`lib/platform/shops.js`: `kycOf`,
  `submitKyc`, `reviewKyc`, `kycQueue`): the owner sends it from Settings › Business verification `/set-verification`, staff
  review at `/admin/kyc`. Merchant notices `lib/platform/notices.js` (`gc.platform.notices`, `gc:notices`; audience all /
  plan / edition / stores, maintenance window) written at `/admin/notices`, shown by `components/MerchantNotices.jsx` (root
  layout; banner under the top bar, "What's new" on `gc:whats-new`). Merchants list: Health, Last sign-in, At risk view.
  Billing: `failedCharges`, `retryCharge` (staff retries don't use the 3 automatic tries), `askUpdateMethod`; Collections
  "Auto-charge failed". Bills carry VAT (`db.settings.vatPct`, 15) and `billTo` (`shop.billing`: name, BIN, email);
  platform `DATA_VERSION` 5. Phone: returns `/m-return` (`screens/app/pos/MReturn.jsx` + `returnData.js`, `?ref=&back=`),
  Today's cash card (`screens/app/money/TodayCash.jsx`) on Home and Finance.
- Courier statement (`/courier-statement`, Orders › Courier statement; `lib/courierStatement.js`): for a period (by
  dispatch day) and one courier or all, each parcel's state (waiting pickup, in transit, out for delivery, delivery failed,
  delivered, coming back, partly received, returned — from the order times, courier hooks and Courier returns receipts)
  and the money (COD to collect / collected, charges, net, paid to you and payout due from Settlements, holding now from
  the ledger). Courier-by-courier table, a section per courier with its parcels, CSV and print. Linked from Courier returns.
- Home widgets (`components/dashboard/HomeWidgets.jsx`, under Home's figures and to-do; Stage 3 MS-U9): they follow the
  page's day and place and are three cards: Sales summary (revenue / cost / profit), Order summary (a ring per Orders tab)
  and Stock alert. No copies of list pages. Home is one page in the menu; My dashboard opens from the person's card at the
  bottom of the menu (`my-dash` is hidden under `home`; a role without the main Dashboard gets My dashboard instead).
- POS: `/pos` (`src/screens/pos-register/Pos.jsx`) is the one register; `/pos-manage` (`PosManage.jsx`) is its
  back office (counters, employees and shifts, cash pickups, settings). Both read and write
  `src/lib/posStore.js` (browser storage). Register shortcuts are listed in `SHORTCUTS` in `Pos.jsx` (F1 on screen).
- **Wholesale is switched off (Oct 2026)**: `WHOLESALE` in `src/lib/edition.js` (true only when built with `NEXT_PUBLIC_WHOLESALE=true`) removes the `wholesale` module and
  the Wholesale channel from every edition; screens check `wholesaleOn()` (Quotes, price lists, MOQ, Wholesale views,
  types, filters, columns, demo wholesale invoices and returns). `docs/wholesale-audit.md` lists every item; setting the
  switch to true brings it back. Invoices stay (module `money`): `/sales-invoices` (`src/screens/sales/SalesInvoices.jsx`,
  `src/lib/invoices.js`) lists sales on due as Unpaid / Partly paid / Paid; recording the payment completes the sale and
  its order. The credit limit is for every customer.
- **Retail edition = counter selling only (Oct 2026)**: no `online` / `channels` module. Screens check
  `hasModule('online')` after mount: Orders (`MerchantOrders.jsx`) shows All / Payment due / Completed / Cancelled /
  Returned with a "Payment due" figure, and Create order opens `/pos`; Add product hides the long description, Shipping,
  Search engine listing, Publishing and Google listing readiness; `settlements.js › partnerInEdition` drops couriers and
  online checkout gateways (card machine and own partners stay); Payment setup hides Online gateways and exchange rates;
  Daily summary, Home's order summary and the top bar's notifications show counter sales only. Order work, Order
  settings and Order notifications belong to the `online` module; Google Business to `marketing`.
- **Demo shop = Dazzle Shop (Oct 2026)**: a mobile phone shop (phones, accessories, audio, wearables, power banks,
  repairs) with one warehouse (Central Warehouse) and two branches (Dhanmondi, Mirpur) plus the Returns & damaged bay.
  Products `products.js`, the catalogue `stock.js › CATALOG`, categories (Categories page, product form `CATS`,
  `productTemplates.js › CAT_SEED`), brands, suppliers, the money history (`ledgerSeed.js`), chats, reviews, leads and
  offers all follow it. Old place names map in `locations.js › OLD`. The root layout clears browser data saved under an
  older demo once (`DEMO_DATA` in `app/layout.jsx`; bump it when the demo data changes shape). The platform console's
  other stores keep their own names.
- **Invoices: accept, then pay** (`invoices.js`): an unpaid invoice is accepted by staff (`acceptInvoice`, `stageOf`:
  To accept → Accepted → Paid) before a payment is recorded; editing it (`reviseInvoice(…, reason)`) makes a revision that
  must be accepted again (`revisionsOf`, `invoiceChanges`). The customer page has an **Invoices** area
  (`customers-crm/CustomerInvoices.jsx`: owed, overdue, credit; To accept · To pay · Paid; side panel to accept and pay).
  The customer page shows five areas (Overview · Orders · Invoices · Messages & activity · Details); its Insights and
  Controls areas stay in the code, hidden, with their actions in the header's More menu;
  `/sales-invoices` has a To accept tab; `/sales-invoice` gates Receive payment behind Accept.
- **Selling on due** (`lib/creditRules.js`, Customer settings › Credit & dues `/customer-settings#credit`): off by
  default; default credit limit, days to pay (sets the invoice's `dueAt`), phone needed, manager PIN over the limit or
  refuse. The POS "Due" tender and Require full payment follow it (`checkDue`).
- **Supplier returns** (`/supplier-return`, `supplierBills.js`): return anything bought from a supplier (`boughtFrom`:
  bought less returned, per bill) or damaged delivery items; settle by credit note (`settle: 'credit'`) or replacement
  (`'replace'`, waits until `receiveReplacement`, stock comes back in at the chosen place). `?supplier=`/`?bill=` opens it.
- **Online place**: Central Warehouse (Settings › Stock setup `homeId`) is shown as "Online orders ship from here" and
  can't be switched off while it is; orders hold stock there (`locations.onlinePlace()`).
- **Meetings** (`/meetings`, Customers › Meetings; `lib/meetings.js`; module `comms`, so Online, Retail + Online and
  Connect have it, Retail does not): Zoom / Google Meet (Connections group
  Meetings) / phone / at the shop; booking makes the link and sends the invite (`messaging.send`), a reminder an hour
  before; staff reminders and "add a note" in the bell (`components/MeetingAlerts.jsx`, `window.__gcMeet`); after the
  meeting a note, outcome and next follow-up (logged on the lead). Schedule meeting on the lead and customer pages;
  Home to-do "Write meeting notes" (all three Homes: Home, Online Home, Connect Home); live count in the menu.
- **Order page for counter sales**: no steps, holds, shipping, courier or visit cards; it shows **Sold by** (the POS
  sale's cashier, or the order's `soldBy`), each item's **IMEI / serial** (serials.js, by sale id) and its **warranty**
  with the end date (`lib/warranty.js` › `coverOf`: the product's own setting, else its category's default when flagged).
  The customer profile has a **Warranty** card (Overview: 3 covered items; Orders area: all) from
  `lib/customerWarranty.js` › `warrantyItems(phone)`: every delivered online order and counter sale with a warranty, days
  left (cover starts at delivery / the sale), IMEI, where to claim; "Log service" (`requestService`) shows on the order page.
- **Receipts and invoices** (`lib/receipts.js`, `components/SaleInvoice.jsx`): after a POS sale the receipt panel has
  Send receipt (SMS / email, number prefilled; each send logged, a failed one says so) and Print invoice (A4 with the
  letterhead, IMEI and warranty per item, Sold by). The order page has Resend receipt and Print invoice; the orders list
  has a Send receipts bulk action (SMS to every selected order with a number).
- **Return & exchange payments** (`ReturnExchange.jsx`): when the customer pays extra, the payment box takes one or
  several parts (split payment: method, amount, bKash / Nagad transaction ID or card slip, cash received and change);
  each part posts to its own account in Money (`part 1 of 2 …`, transaction ID as `txn`, claimed once via paymentRefs);
  what is left can stay as due on a POS sale when selling on due is on. A bKash / Nagad refund asks which number it goes to.
- **POS receipt printing**: the receipt rises out of the printer slot in line-feed steps with a "Printing…" tag after a
  printed sale and on Print again (`posStyles.js › pos-print`; off with reduced motion).
- **Setup checklists** (`lib/moduleSetup.js` + `components/ModuleSetup.jsx`): each area's main page shows "Set up …"
  steps that tick themselves from the libs, then folds to one line; Hide keeps it away (`gc.setup.hidden`).
- **UX fixes, pass 1 + 2 (Nayeem's "Grid Commerce UX Fixes", Oct 2026)**:
  - Routes: `/add-product-tabs`, `/set-chrome`, `/set-rail`, `/set-topbar` and 29 old Accounts / staff-tab / wholesale /
    social pages are gone; their addresses forward in `next.config.mjs › MOVED`. SetChrome / SetRail / SetTopbar stay as
    components.
  - Orders: the courier status is **Sent to courier** (key `shipped`; saved "In transit" still resolves). The Orders tabs
    are `orderStatus.js › ORDER_TABS` (On hold = On hold + Pending, Processing = Processing + Approved + Ready for courier,
    Sent to courier, Delivered, Returned, Cancelled; `tabKeys(tab)`); Retail keeps its own tabs. A **digital order** (every
    item's product format is digital or licence, `orderFlow.js › isDigitalOrder`) skips Ready for courier and Sent to
    courier: approved → "Send the download or key" → `sendDigital` → Delivered.
  - Create order: Customer comes first (search focused). Order page: the Customer card is the first card of the side
    column (first on the page below 1024px) with Call, WhatsApp and SMS; on phones the steps fold to one "Step n of n" line.
  - Home (all three Homes): a **Needs you** button with the count in the top row next to Create and Export
    (`ActionPills variant="button"`), opening the full list with snooze / dismiss. A side panel was tried and removed: it
    squeezed the dashboard.
  - Sign-in: an edition site shows no system choice, only "Open the <edition> demo" (one tap signs in; any email and
    password work too); the full site's picker reads "Demo: preview a system".
  - Payouts: the page is called Payouts everywhere (address stays `/settlements`); with both couriers and gateways it
    opens on **Courier COD** with a Gateway payouts switch and a link to Courier statement.
  - Settings list (`SetRail.jsx`): a **Business setup** group (Orders, Products & catalog, Customers, Sales channels,
    Auto-call, Communications, Staff & HR, Accounts, POS counters); items with no page or outside the edition are hidden.
  - Top bar account menu: the store name from Settings › General and the real branch count. Page titles carry no
    "G2 ·" / "G3 ·". The icon rail (POS, narrow windows) shows a short name under each icon and a tooltip. Product
    channel switches say On / Off and keep their colour when locked.
- Shared operations data (front end, localStorage): `src/lib/locations.js` is the one list of places (every
  place dropdown reads it); `src/lib/stock.js` is the catalogue with on hand / held / available / in transit
  (`stockAt`) and stock moves (`addMove`); `src/lib/stockHolds.js` holds; `src/lib/orders.js` orders;
  `src/lib/invoices.js` invoices, payments, credit, deliveries; `src/lib/returns.js` return history;
  `src/components/ManagerPin.jsx` manager approval (demo PIN 1234). `/return-exchange` is the only return flow.
  Money: `src/lib/ledger.js` (accounts + every movement; post where money actually moves; demo September in
  `ledgerSeed.js`). Gateways (bKash/Nagad online, SSLCOMMERZ, EPS), the card machine and couriers hold money in
  `Holding` accounts; posting into one also queues it for that partner's payout. `src/lib/settlements.js` has the
  partner rules (fee, payout days, weekend + BD holidays), expected payouts, confirm / delay / withdraw and the
  evening check (`components/EveningCheck.jsx`, 8 PM; it does not open by itself for now — `AUTO_OPEN` — only from the bell). Accounts is six pages (`/accounts-home`, `/money`,
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
  (members, points, wallets, referrals; POS checkout reads it) `lib/loyalty.js`; brands (name, optional description and
  image; Products › Brands `/brands`, the product form's Brand list) `lib/brands.js`; smart offers (triggers, rewards, send rules, send
  log; Marketing › Smart offers `/smart-offers`) `lib/smartOffers.js`; blog posts, categories, authors
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
  `/sales-leads` leads & follow-ups (`lib/leads.js`).
- **Mobile app (Oct 2026)**: the merchant panel on a phone, for running the business (no customisation). Same data and libs
  as the web, so a change on either shows on both. Entry `/app` (→ `/m-home`), installable (`src/app/manifest.js`), linked
  from the web account menu. Design = the mobileview boards (`src/screens/app/M*.jsx`, `design/templates/app/`), shared
  through `src/screens/app/kit/` (`AppKit.jsx` components + `appCss.js`; `appNav.js`: tab bar, More hub, `APP_ROUTES`
  with module + web menu ids so edition and role decide what shows, `ROUTES_BUILT`). Screens: Home, More, Orders (list,
  detail with the full order flow, new order), Customers, Products / quick edit, Stock, Scan (`?for=order|pos|receive|count`),
  Purchase orders, Receive, Transfers, Adjust & count, POS (`/m-pos`, posStore/posSale), Calls, Inbox + Chat, GridAI
  (`/m-gridai`; setup stays on the web), Finance, Payouts, Dues, Add expense, Reports, Social posts (`lib/socialPosts.js`,
  shared with the web calendar and composer), Staff & HR, Tasks, Settings (profile, devices, phone notifications, switch
  system), Support tickets (`lib/supportTickets.js`, shared with `/support-tickets`), Notifications. Phone rules:
  `src/styles/phone-app.css` (the 390×844 board is the real app below 480px; above it the screen sits in an iPhone frame
  scaled to the window's height, with "← All screens" from the root layout). `/app-screens` (`screens/app/AppScreens.jsx`)
  is the gallery of every app screen as live thumbnails (framed pages get `html[data-framed]`: no host badge, no camera;
  `/m-call-active?preview=1` shows a sample call without saving one). AppScreen draws the tab bar on every screen
  (`tabs={false}` for call, scanner, live chat, Ask GridAI).
- Responsive rules for fixed design boards (`data-board`, zoomed to fit) are in
  `src/styles/console-responsive.css`. `?quiet=1` stops the evening payout check from opening by itself (tests, screenshots).
- Super admin (`/admin`, GridCommerce's own panel; branch `claude/super-admin`, Oct 2026; map, data agreements and the
  page checklist in `docs/super-admin-plan.md`). Opened from the sign-in page's system picker (**Super admin** row). The old
  platform console was deleted; its data layer `src/lib/platform/` stays (62 demo stores, plans, invoices, payments, billing
  engine; `?staff=<id>` switches the demo staff member, default Mahin Khan / admin; `?reset=1` restarts every demo store).
  All 72 menu pages are built, in the merchant panel's look (IndexKit, tokens, DashCharts) inside their own shell
  (`screens/admin/AdminShell.jsx` + `styles/admin.css`): Dashboard, Analytics + Reports, Merchants (list, add, onboarding,
  11-tab profile), Plans & modules, Billing & credits, Platform ops, Sales & CRM, Inbox, Communications, Support, GridAI,
  Marketing, People, Finance, Website (managing gridcommerce.net's real pages and copy), Storefront themes, Administration.
  Each module keeps its demo data in `lib/admin/<module>.js` through `lib/admin/store.js` (`createStore`, `useAdminStore`
  — `live` only after mount, so the UTC prerender always matches), and never reads the merchant panel's libs. Menu areas
  per role: `lib/admin/roles.js`, overridden by Administration › Roles & permissions once loaded. The top bar
  (`screens/admin/AdminTopbar.jsx`) mirrors the merchant one (Help, scoped search, quick links, View website, Inbox, Alerts,
  person menu). Service income (paid onboarding, migration, training and future services) is Finance › Income
  (`/admin/income`, catalogue + records in `lib/admin/finance.js`, feeding the books, dashboard and merchant profile).
  **Merchant AI** (Platform area, `/admin/merchant-ai`, `/plans`, `/models`; `lib/admin/merchantAi.js`) controls the
  Grid AI stores use: AI per plan and trial, markup, each store's usage / credits / limit rule / rate limit / suspend,
  providers, models per tier for every store, model releases gated by the platform test set, cost against AI billing.
  A Roles & permissions matrix saved before an area existed falls back to the built-in roles for it (`access.js`).
- Reference pages (UI kit, flows, site map, storyboards) are under `/dev/…`. They and the POS /
  settings screen switchers only show in a production build when `NEXT_PUBLIC_SHOW_STORYBOARD=true`.
- New features from Nayeem's briefs (Oct 2026; built in a parallel run, rules in `docs/new-features-run.md`). The skipped
  briefs (#3, #12, #15, #17–#20) are not built. Libs are front-end models; where a server is needed a code comment says so.
  - Home / menu: `actionItems.js` (one to-do list: `trackItems(source, rows)`, snooze, dismiss; `ActionPills.jsx`),
    `HomeExtras.jsx` (setup checklist, insights), `navProfile.js` (pins, start page), `navSetup.js` (menu by setup),
    `plans.js` + `planLimits.js` (Starter / Growth / Business; RoleGuard shows Upgrade), `team.js` users may have `roles[]`.
    `npm run test:nav` checks every menu (edition × plan × person × setup).
  - Orders: `orderRules.js`, `paymentProof.js`, `orderEdit.js`, `quotes.js`, `orderJobs.js` (background bulk jobs);
    `/order-work`, `/order-settings`. Create order checks the customer's restrictions.
  - POS: `posSale.js` (commit, offline queue and conflicts), `serials.js` (IMEI / serial register; returns put them back),
    `scaleBarcode.js`, `hardware.js`, `PosSheets.jsx`. The coupon box uses the promotion engine.
  - Product templates (`lib/productTemplates.js`): 19 Grid templates + Custom, each a full grouped spec schema (Mobile:
    11 groups, 43 fields) built from shared parts (General, Body, Warranty …). Fields carry flags (`key` feature, `filter`,
    `compare`, `req`, `variant`); keys never change. Catalog setup › Product templates opens a template in a side panel
    (`TemplatesCard.jsx`): turn Grid fields off (`setFieldHidden`), add the shop's own fields (`addTemplateField`), reset.
    The product form shows key features (or what is filled in) and keeps the rest behind "View all product data".
  - Products & stock: `productTemplates`, `identifiers` (`resolveScan`), `units`, `licenceKeys`, `bulkEdit` (`/bulk-edit`),
    `productDrafts`, `productVersions`, `productRelations`, `productImport`, `stockActivity` (`/stock-activity`, every move),
    `countSessions`, `serialTrace`, `custody`, `bundles`.
  - Customers & recovery: `segments`, `customFields`, `consent` (per channel; `isAllowed`), `restrictions` (`checkOrder`:
    blocked, no COD, prepaid above, order cap, credit hold, method), `crmAccess`, `crmPrivacy`, `bulkJobs`, `customerSignals`,
    `customerRef` (one customer key), `recovery`, `recoveryPolicy`, `triggers`, `audiences`; `/customer-settings`, `/ad-audiences`.
  - Loyalty & communications: `promotions.js` is the one promotion engine (`evaluate`, `applyCode`, `reserve` / `commit` /
    `release` / `reverse`); the POS coupon box and the storefront Checkout use it. `storeCredit.js` (the member wallet as store
    credit; returns kept as credit land here). `messaging.js` is the one send layer (consent, suppression, caps, quiet hours,
    delivery log) with `messagePolicy`, `suppression`, `commsConsent`, `channelCaps`, `aiReply`, `automationRules`,
    `callTasks`, `campaigns`; `/campaigns-messaging`.
  - Payments & finance: `refunds.js` (requested → approved → sent → done / failed; Return & exchange makes one for bKash,
    Nagad and card refunds), `approvals.js` + `approvalActions.js` (`/money-approvals`; no self-approval), `paymentRefs`
    (a transaction ID is used once), `allocations`, `paymentLinks`, `manualPayments`, `terminalBatches`, `statementImport`
    (`/statement-match`), `financeDuties`; `/payment-ops` (`screens/payments/`).
  - Analytics & settings: `reports/metrics.js` (one definition per figure), `reports/analytics.js`, `attribution`, `events`,
    `alerts`, `businessProfile` (`invoiceIdentity()`), `apiKeys`, `settingsStore` + `settingsHistory` + `settingsRegistry`
    (`/settings-history`), `consents` (`/set-privacy`), `domains` (`/set-domains`).
- Proposal switches (branch `explore/nayeem-merge`; `docs/handoff-nayeem-merge.md`): parts of Nayeem's proposal are tried
  behind switches in `src/lib/proposal.js` (`FLAGS` = the backlog; `isOn(key)`, `useProposal(key)` in `lib/useProposal.js`),
  off by default, so all off = today's build. `/dev/proposal` flips them (only `built: true` ones) and opens a page both
  ways; `/dev/proposal/doc` is `docs/proposal-vs-build.md` with the briefs' sections linked. `?p=a,b` / `?p=off` pins one
  tab. The top bar (or a corner badge on pages without it) says "Proposal: N on". Switches only work while developing or
  with `NEXT_PUBLIC_SHOW_STORYBOARD=true`. An experiment checks its key at the narrowest point, then sets `built: true`.
- Netlify prerenders every page on a UTC server. Anything that depends on today's date or time (today's figures,
  sparklines by day, "Prepared" dates, a date picker's `max`) is worked out after mount, or the page fails to hydrate in
  Dhaka time. Test with `TZ=UTC npx next dev` (a copy of the repo) and a page-by-page load.
- `npm run check:screens` fails when a screen brings back a literal the tokens replace.
- Check changes with `npm run build` (prerenders every route) and by loading the screen.
