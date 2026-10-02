# GridCommerce: current build vs Nayeem's proposal

## 1. Summary

Nayeem's proposal is **21 architecture and UX briefs** written 28–30 September 2026, one per area of the product (#1 Product … #21 Navigation). Each brief does four things:
- names what its area owns and what it must leave to others;
- goes screen by screen with Keep / Modify / Add / Remove-or-move;
- lists new capabilities;
- ends with a build brief.

This document checks every one of those points against **today's build**: commit `7c766c0`, live on the Online, Retail + Wholesale, Retail + Wholesale + Online and full sites.

> **The baseline differs.** The briefs reviewed the **original design files** (for example `MerchantDashboard.dc.html` and the first sidebar), not the code. The build has moved on since: Money ledger and payouts, Connections hub, Sales channels, the Online edition's one-place stock, the order flow, HR, the Reports centre and team features. So some "missing" items already exist, some exist in a different shape, and some design screens the briefs name are gone. Each section says which.

### What Nayeem proposes, in ten points

1. **One owner per idea.** Each concept (an order, a payment, a stock quantity, a customer, a message) has exactly one owning area. Every other screen links to it and never keeps its own copy.
2. **A shallower menu built from business areas.**
   - Seven core areas: Home · Orders · Products · Customers · Communications · Finances · Analytics.
   - Optional areas: Marketing, Online Store, POS, Wholesale, Sales channels, Staff & HR.
   - Settings sits at the bottom.
   - Today's sub-menus become **tabs inside each area**.
   - Search (Ctrl/Cmd+K), a "+ Create" menu and personal pins reach everything else.
3. **Modes instead of editions.** Online, Retail and Wholesale are ticked in any mix on one account and can change at any time. The plan, the person's role and their scope decide each person's sidebar.
4. **One Home** for everyone, with priority by role: needs attention → business pulse → orders → money → stock → customers.
5. **Orders run on separate states** (confirmation, payment, fulfilment, delivery, return, receivable) shown as working views. One **Assisted New Order** workspace, plus proper documents (A4, thermal, packing slip, pick list, challan, label).
6. **Products, stock and buying:**
   - one dynamic product editor with templates;
   - one **immutable inventory ledger** with explicit quantities (on hand, available, committed, unavailable, incoming) and a Stock Activity screen;
   - buying where PO, goods receipt, supplier bill and payment are separate records.
7. **Customers:** a stable customer ID (not the phone), Person and Company profiles, **one segment engine**, consent kept apart from preference. The Recovery customer profile folds into the CRM.
8. **Money:**
   - a **Payments Operations** page for transactions, refunds and settlements;
   - Finance as six areas with add-only movements, per-branch cash custody and statement matching;
   - P&L and statutory accounting left to Analytics, or out of v1.
9. **Eight new workspaces:**
   - Setup & Migration;
   - Messaging Campaigns;
   - Notifications & Automations;
   - After-sales Cases;
   - Storefront & Theme;
   - Checkout & Customer Account;
   - Reviews;
   - Roles & Security.
10. **Shared engines and contracts:**
    - a promotion engine shared by POS and online;
    - points and store-credit ledgers;
    - one message delivery engine with consent and quiet hours;
    - a metric dictionary with an explicit date basis;
    - a machine-readable design token source;
    - a capability catalogue and support-access sessions on the platform side.

### How much of it exists today

Every row in every brief's own tables was checked against the code. A screen can appear in more than one of a brief's tables, so these are rows, not unique features.

| Status | Rows | Share |
|---|---|---|
| Built | 217 | 17% |
| Partly built | 430 | 34% |
| Not built | 424 | 33% |
| Not built (needs a backend) | 19 | 2% |
| Built differently | 154 | 12% |
| N/A (the named screen is gone) | 27 | 2% |
| **Total checked** | **1,271** | |

**Areas furthest along today:**
- Home;
- Finance (ledger, payouts, dues, expenses);
- POS register and cash;
- HR (staff, attendance, leave, payroll);
- order flow and courier steps;
- the Reports centre;
- the design token pattern.

**Least built:**
- customer identity and segments;
- the promotion engine and store credit;
- after-sales cases and support tickets;
- storefront, checkout and reviews;
- Settings registries;
- onboarding and migration;
- roles and security;
- everything that needs a real server.

### What today's build has that the briefs do not count

These were added after the design files the briefs reviewed, or sit outside the briefs:
- **Money ledger** with gateway and courier holding accounts, payout calendar (BD holidays), the 8 PM evening check, Dues, Bills to pay, Sales & profit, Money reports and VAT.
- **Connections hub** (`/connections`, one connect flow) and **Sales channels** (Meta, Google Merchant, WooCommerce, Shopify product sync).
- **Online edition shape:** one stock place, direct purchases (`/buy-goods`), expiry batches, platform costs posted as expenses, and the Stock setup page that can merge stock into one place.
- **Order flow:** verification calls, advance + approve, packing checklist, courier send, webhooks and tracking, per-event SMS/email notifications, item photos, courier history.
- **HR extras:** positions & grades, ID cards & QR, attendance devices, increments, gratuity & leaving, salary statements and the review drawer.
- **Team features:** My dashboard, Tasks, Team chat, Leads & follow-ups.
- **Reports centre** with about 95 report definitions, saved views, schedules and a letterhead PDF.
- **Editions as separate sites,** including Connect (communication & CRM) as its own product.

### The biggest UX moves Nayeem proposes

- **Sub-menus become page tabs.** Of the 102 current menu items, 53 become tabs inside an area, 20 move to another area, 3 merge, 4 retire and 10 stay as they are. The brief places neither Tasks nor Team chat, Leads, Blog, Social posts, Google Business, Customer catalogue or Media library (12 items in all).
- **New top-level areas:**
  - **Communications** (Inbox, Calls, Campaigns, Automations, Templates, Delivery log);
  - **Finances** (today's Money);
  - **Analytics** (today's Reports plus Ads tracking);
  - **Online Store**, **POS** and **Wholesale** as mode areas.
- **Into Products as tabs:** Inventory and Purchasing & Suppliers.
- **Warranty leaves stock tools:**
  - policies go to Product / Catalog setup;
  - claims become After-sales Cases under Orders.
- **Automation moves under Communications; Ads tracking moves under Analytics.**
- **Settings becomes a fixed bottom item.** Storage and backups leave the merchant side. Billing, usage, tax, locations and API keys become Settings groups.
- **Folded into one place:**
  - My dashboard into Home;
  - the Recovery customer profile into CRM;
  - Customer wallet into Store credit;
  - AI calls into Calls.

### Decisions the two of you need to make

Section 8 lists every point where today's build and the proposal take different routes, with both positions side by side. The largest are:
- editions vs combinable modes;
- the menu shape;
- the order status model;
- where returns live;
- the customer wallet vs store credit;
- what "Money" contains;
- whether staff access depends on the HR module.

## 2. How to read this document

- **Status** describes today's build against what Nayeem asks for in that row:
  - **Built**: exists and does what the proposal asks.
  - **Partly built**: exists, but part of the ask is missing.
  - **Not built**: nothing for it yet.
  - **Not built (backend)**: needs a real server; the build is front-end only.
  - **Built differently**: solved another way; see Decisions.
  - **N/A**: the design screen the brief names no longer exists.
- **"Built" means it exists in the front-end demo** (demo data in the browser). It does not mean a production backend exists.
- **The "Show rows" filter** (left side, or the menu at the top on phones) hides table rows by status.
- **Evidence** cites files and lines in the repo, such as `Home.jsx:331`. "Message only" means the button just shows a toast.
- **UX move** shows today's place → the proposed place. "(done)" means the build already made that move.
- **Area headings in section 5** follow Nayeem's business areas. The number after the area is the brief's package number.
- **How it was checked.** Seven reviewers each read three briefs in full and checked every row against the code. Each section ends with a coverage line: rows in the brief's tables vs rows reported.

## 3. Two structures side by side

Nayeem organises the product as **21 owner packages**. Today's build organises it as **editions** (Online, Retail + Wholesale, Retail + Wholesale + Online, Connect), made of **15 modules** (`src/lib/edition.js`). The modules decide the menu, page access and which Home shows. Underneath, shared libraries in `src/lib` hold the data.

| # | Nayeem's package | Proposed menu area | Today's module(s) | Today's menu group | Today's source of truth |
|---|---|---|---|---|---|
| 1 | Product | Products | catalog | Products & stock › Products | `products.js`, `productCost.js` |
| 2 | Inventory | Products › Inventory | catalog + places | Products & stock, More stock tools, Warehouses & branches | `stock.js`, `stockHolds.js`, `locations.js`, `racks.js`, `batches.js`, `stockSetup.js` |
| 3 | Purchase & Suppliers | Products › Purchasing & Suppliers | catalog (direct buying) + purchasing (POs) | Products & stock | `supplierBills.js` |
| 4 | Sales & Orders | Orders (+ Wholesale mode area) | commerce + wholesale | Sales | `orders.js`, `orderStatus.js`, `orderFlow.js`, `invoices.js`, `liveOrders.js` |
| 5 | Payments & Settlement | Finances › Payments | money | Money › Payouts; Settings › Payment Gateway | `settlements.js`, `GatewaySetup.jsx` |
| 6 | Finance & Cash | Finances | money | Money | `ledger.js`, `liabilities.js`, `categories.js`, `profit.js` |
| 7 | Customers & CRM | Customers | core | Sales › Customers, Leads | `customers.js`, `leads.js` |
| 8 | POS Register | POS (Retail mode) | pos | Sales › POS, POS manage | `posStore.js` |
| 9 | Loyalty, Promotions & Offers | Marketing › Promotions, Loyalty | marketing (+ online for flash sales) | Marketing | `loyalty.js` (no shared promotion library) |
| 10 | Merchant Dashboard | Home | core | General › Dashboard | `reports/dailySummary` |
| 11 | Communications | Communications | comms + automation | Customer support; Online store & settings › Automation; Marketing › Social posts | `inbox.js`, `notifications.js` |
| 12 | Support & After-sales | Orders › After-sales | commerce (+ catalog for warranty) | Sales › Returns; More stock tools › Warranty; Customer support › Tickets | `returns.js` |
| 13 | Recovery & Intelligence | Marketing › Recovery | online | Marketing › Abandoned carts, Auto reminders | none (screen data) |
| 14 | Analytics & Reports | Analytics | reports (+ online for tracking) | Reports; Marketing › Ads tracking | `reports/catalogue.js`, `reports/defs/*`, `adSpend.js`, `traffic.js` |
| 15 | Storefront & Checkout | Online Store (Online mode) | online | Online store & settings › Online store, Blog | `orderLinks.js`, `blog.js` |
| 16 | Settings & Billing | Settings (bottom) | core | Online store & settings › Settings, Connections | `SetChrome.jsx`, `platformCosts.js`, `vat.js`, `connections.js` |
| 17 | Onboarding & Setup | Home / Settings › Setup & Migration | — | Sign-in; Settings › Stock setup | `systems.js`, `stockSetup.js` |
| 18 | Staff, HR, Roles & Security | Staff & HR; Roles & Security | hr | Staff & HR | `hr.js`, `team.js`, `auditLog.js` |
| 19 | Platform console | Grid's admin console | — | Console (separate) | none (design screens) |
| 20 | Design System | Foundation | — | `/dev` reference | `design-system.css`, `components/ui` |
| 21 | Navigation | Shell | — | — | `navigation.js`, `edition.js`, `team.js` |

**Where the two structures meet:**
- The build already follows "one owner per idea" for money, stock, orders and HR: the ledger, stock moves, order flow and HR library are each one shared source.
- **Promotions, customers, recovery, storefront and settings** are still mostly screen-level demo data with no shared owner.


## 4. Navigation and UX: what moves where

Source: brief #21 Navigation Architecture (v1.0, 30 Sep). Every current menu item below comes from `src/shell/navigation.js`. The menu has **102 leaves** across 10 groups.

### 4.1 Nayeem's navigation model in one page

- **The rule.** The sidebar shows *business areas*. Each area has its own tabs for its tools. Actions sit on the record or task. Search reaches everything the user is allowed to see.
- **Seven core areas, in a fixed order:** Home · Orders · Products · Customers · Communications · Finances · Analytics.
  - These are what the business does, not guaranteed links for every user.
  - A cashier may see only POS, Orders, Customers and Communications.
- **Optional and mode areas.** These appear only when the merchant uses them:
  - **Marketing** (Promotions · Loyalty · Recovery · Audiences);
  - **Online Store** (Online mode);
  - **POS** (Retail mode);
  - **Wholesale** (Wholesale mode; a view onto Orders, not a separate engine);
  - **Sales channels** (named only in the all-three example);
  - **Staff & HR** (promoted for HR and manager roles).
- **Settings becomes a fixed utility at the bottom** of the sidebar.
- **Modes, entitlements and roles are separate things:**
  - Online, Retail and Wholesale are *combinable modes* the merchant can tick and change at any time, without deleting data.
  - The plan decides *entitlements*.
  - The *role and scope* decide what each person sees.
  - One resolver turns these into each person's sidebar.
- **Communications is a core area for everyone** (Inbox · Calls · Campaigns · Automations · Templates · Delivery log). Nayeem treats it as Grid's main selling point.
- **Badges** only for things that need action. One Communications unread count. No totals such as "412 products".
- **Search and command menu (Ctrl/Cmd+K)** covering records, destinations, actions and settings, filtered by permission.
- **"+ Create" quick menu** for Order, Product, Customer, PO, Expense, Campaign and Staff.
- **Pins** (3–5) and a preferred landing page per person.
- **Mobile:** a bottom bar of 4 + More, chosen by role and mode.

### 4.2 Today's sidebar vs Nayeem's, by business shape

Today's sidebars are taken from the edition bundles (`src/lib/edition.js`) for the CEO view.

| Nayeem's mode | Proposed top level (incl. Settings) | Closest edition today | Today's sidebar (CEO view) |
|---|---|---|---|
| Online-first | Home · Orders · Products · Customers · Communications · Marketing · Online Store · Finances · Analytics · Settings (10) | Online | 10 groups, 50 top-level rows, 87 leaves. General · Sales · Products & stock (no PO, receiving, transfers or places) · Sales channels · Money · Reports · Staff & HR · Marketing · Customer support · Online store & settings |
| Retail-first | Home · POS · Orders · Products · Customers · Communications · Finances · Analytics · Staff & HR (if relevant) · Settings (10) | No Retail-only edition; nearest is Retail + Wholesale | — |
| Wholesale-first | Home · Wholesale · Orders · Products · Customers · Communications · Finances · Analytics · Staff & HR (if relevant) · Settings (10) | No Wholesale-only edition; nearest is Retail + Wholesale | — |
| Retail + Wholesale | A valid combination; the brief gives no example | Retail + Wholesale | 9 groups, 47 rows, 79 leaves. Includes POS, invoices, warehouses & branches, Sales channels, Money, Reports, Staff & HR, Marketing (offers, loyalty, Google Business). **No Inbox, Calls or Online store** |
| Online + Retail | Home · Orders · POS · Products · Customers · Communications · Marketing · Online Store · Finances · Analytics · Settings (11) | None; nearest is Retail + Wholesale + Online | — |
| Online + Wholesale | Home · Orders · Products · Customers · Communications · Marketing · Online Store · Wholesale · Finances · Analytics · Settings (11) | None; nearest is Retail + Wholesale + Online | — |
| All three | Home · Orders · POS · Products · Customers · Communications · Marketing · Sales channels · Online Store · Wholesale · Finances · Analytics · Settings (13) | Retail + Wholesale + Online (same as the full product) | 10 groups, 57 rows, 102 leaves (the full menu) |
| Not in the brief | — | Connect (communication & CRM) | 5 groups, 16 rows, 22 leaves: General · Sales (POS, Customers, Leads, POS manage) · Marketing (Social posts) · Customer support · Automation & settings |

### 4.3 Today's menus vs Nayeem's, by role

Today, every non-CEO role also gets My dashboard · Tasks · Team chat. Only the CEO sees "Dashboard", and every role lands on My dashboard (`src/lib/team.js`).

| Nayeem's role preset | Proposed first level | Closest role today | Today's menu (beyond My dashboard, Tasks, Team chat) |
|---|---|---|---|
| Owner / Administrator | Home · Orders · Products · Customers · Communications · Finances · Analytics + mode areas (+ Marketing, Staff & HR) | CEO | Full menu: 10 groups, 57 rows |
| Order Operations | Home · Orders · Customers · Communications · Products | Order management | Orders [All, Wholesale, Courier returns], Invoices, Returns & exchanges, Customers, Leads · All products · Stock holds · Reports · Abandoned carts, Auto reminders · Inbox, Calls, AI calls |
| Customer Support | Home · Communications · Customers · Orders | Communications | All orders, Customers, Leads · All reports · Abandoned carts, Post calendar · Inbox, Calls, AI calls, Tickets |
| Retail / Cashier (POS can be the landing page) | POS · Orders · Customers · Communications | Shop seller | POS · New sale, Invoices, Returns & exchanges, Customers · All products, Stock · Members. No Orders, no Inbox |
| Branch Manager | Home · POS · Orders · Inventory shortcut · Customers · Communications · Analytics (+ Staff shortcut) | Shop manager (Shop supervisor is a subset) | All orders, POS, Invoices, Returns, Customers, Leads, POS manage · All products, Stock, Transfers, Stock count, Branches · Reports · Time & attendance · Coupons, Members, Google Business. No Inbox |
| Inventory / Warehouse | Home · Inventory · Purchasing · Products · Orders · Communications (+ Analytics) | Warehouse manager (Warehouse supervisor is a subset) | All orders · All products, Stock, Purchases, Receive goods, Transfers, POs, Suppliers, More stock tools [8], Warehouses, Racks · All reports · Time & attendance |
| Marketing / Growth | Home · Customers · Communications · Marketing · Online Store · Analytics | Ads & tracking; Social media & content | Ads: Sales channels, Reports, Offers & coupons, Loyalty, Abandoned carts, Auto reminders, Ads tracking, Connections. Content: Media library, Reports, Flash sales, Offers page, Social posts, Google Business, Online store, Blog, Connections |
| Wholesale Sales | Home · Wholesale · Orders · Customers · Communications · Products (+ Finances if permitted) | **No such role today** | — |
| Finance / Accountant | Home · Finances · Orders · Analytics (Payroll only with permission) | **No such role today**; Money pages reach only the CEO | — |
| HR / People | Home · Staff & HR · Communications | HR | POS manage · Bills to pay · All reports · all of Staff & HR (18 leaves) |
| Not in the brief | — | CTO | Setup-type pages: POS manage, Catalog setup, Sales channels, Money setup, Reports, Attendance devices, Google Business, Ads tracking, Support tickets, Online store, Automation, Connections, Settings |
| Not in the brief | — | Online sales expert | All orders, POS, Invoices, Customers, Leads · Reports · Coupons, Loyalty, Abandoned carts, Auto reminders · Inbox, Calls |

### 4.4 Master move table: every current menu item

**Totals across 102 items:**

| Move type | Items |
|---|---|
| Stays (top level or own area) | 10 |
| Becomes a tab inside an area | 53 |
| Moves to another area | 20 |
| Merges | 3 |
| Retired or alias | 4 |
| Brief silent | 12 |

"Brief silent" means the brief does not place the item; the nearest fit is shown in brackets.

| # | Today: group › item (route) | Nayeem's place | Move type |
|---|---|---|---|
| 1 | General › Dashboard (`/merchant-overview`) | **Home** (core) | Stays (renamed Home) |
| 2 | General › My dashboard (`/my-dashboard`) | Home's role-aware priority ("one Home", #10) | Merge |
| 3 | General › Tasks (`/tasks`) | Brief silent (nearest: shell utility or search) | Brief silent |
| 4 | General › Team chat (`/team-chat`) | Brief silent (Communications in the brief is customer-facing) | Brief silent |
| 5 | Sales › Orders › All orders (`/merchant-orders`) | **Orders** › All orders; statuses become filters | Stays |
| 6 | Sales › Orders › Wholesale orders (`/wholesale-orders`) | **Wholesale** (Wholesale mode) and Orders › Wholesale tab | Moves to another area |
| 7 | Sales › Orders › Courier returns (`/courier-returns`) | Orders › Delivery / After-sales tab | Becomes a tab |
| 8 | Sales › POS · New sale (`/pos`) | **POS** (Retail mode + role; full screen) | Stays (own top level) |
| 9 | Sales › Invoices (`/sales-invoices`) | Wholesale workspace; dues go to Finances › Receivables | Moves to another area |
| 10 | Sales › Returns & exchanges (`/return-exchange`) | Orders › After-sales tab, plus an action on each order | Becomes a tab |
| 11 | Sales › Customers (`/all-customers`) | **Customers** (core) | Stays (own top level) |
| 12 | Sales › Leads & follow-ups (`/sales-leads`) | Brief silent (nearest: Customers or Wholesale) | Brief silent |
| 13 | Sales › POS manage (`/pos-manage`) | POS › admin tab, or contextual | Becomes a tab |
| 14 | Products › All products (`/all-products`) | **Products** › Products | Stays |
| 15 | Products › Add product (`/add-product`) | "+ Create" and the "+ Add product" button | Retired (contextual action) |
| 16 | Products › Categories (`/categories`) | Products › Categories | Becomes a tab |
| 17 | Products › Catalog setup (`/catalog-setup`) | Settings / search | Moves to another area (Settings) |
| 18 | Products › Customer catalogue (`/customer-catalogue`) | Brief silent (nearest: Wholesale or Products) | Brief silent |
| 19 | Products › Media library (`/set-media`) | Brief silent (nearest: top-bar Files or search) | Brief silent |
| 20 | Products & stock › Stock (`/stock`) | Products › Inventory (warehouse roles can promote it) | Becomes a tab |
| 21 | Products & stock › Purchases (`/purchases`) | Products › Purchasing & Suppliers | Becomes a tab |
| 22 | Products & stock › Receive goods (`/receive-goods`) | Products › Purchasing & Suppliers | Becomes a tab |
| 23 | Products & stock › Transfers (`/transfers`) | Products › Inventory | Becomes a tab |
| 24 | Products & stock › Purchase orders (`/purchase-orders`) | Products › Purchasing & Suppliers | Becomes a tab |
| 25 | Products & stock › Suppliers (`/suppliers`) | Products › Purchasing & Suppliers | Becomes a tab |
| 26 | More stock tools › Stock adjustments (`/stock-adjustments`) | Products › Inventory | Becomes a tab |
| 27 | More stock tools › Stock count (`/stock-count`) | Products › Inventory › Stock count | Becomes a tab |
| 28 | More stock tools › Stock holds (`/stock-holds`) | Products › Inventory | Becomes a tab |
| 29 | More stock tools › Damaged & expired (`/expiry-disposal`) | Products › Inventory | Becomes a tab |
| 30 | More stock tools › Purchase requests (`/requests`) | Products › Purchasing & Suppliers | Becomes a tab |
| 31 | More stock tools › Barcode labels (`/barcode-labels`) | Products › Inventory | Becomes a tab |
| 32 | More stock tools › Warranty policies (`/warranty-policies`) | Product policy (#1), not Inventory | Moves to another area |
| 33 | More stock tools › Warranty claims (`/warranty-claims`) | Orders › After-sales (#12) | Moves to another area |
| 34 | Warehouses & branches › Warehouses (`/warehouses`) | Products › Inventory | Becomes a tab |
| 35 | Warehouses & branches › Branches (`/branches`) | Products › Inventory | Becomes a tab |
| 36 | Warehouses & branches › Racks & bins (`/racks`) | Products › Inventory | Becomes a tab |
| 37 | Sales channels › Overview (`/channels`) | "Sales channels" top level (named only in the all-three example) or Online mode | Stays (brief unclear) |
| 38 | Sales channels › Meta Commerce (`/meta-commerce`) | Sales channels tab | Becomes a tab |
| 39 | Sales channels › Google Merchant Center (`/google-merchant`) | Sales channels tab | Becomes a tab |
| 40 | Sales channels › WooCommerce (`/woocommerce`) | Sales channels tab | Becomes a tab |
| 41 | Sales channels › Shopify (`/shopify`) | Sales channels tab | Becomes a tab |
| 42 | Sales channels › Sync issues (`/sync-issues`) | Sales channels tab; one attention badge | Becomes a tab |
| 43 | Sales channels › Settings (`/channel-settings`) | Settings / contextual | Moves to another area (Settings) |
| 44 | Money › Money overview (`/accounts-home`) | **Finances** (core) › Overview | Stays (renamed Finances) |
| 45 | Money › Cash, bank & wallets (`/money`) | Finances › Money & Cash | Becomes a tab |
| 46 | Money › Dues (`/dues`) | Finances › Receivables | Becomes a tab |
| 47 | Money › Payouts (`/settlements`) | Finances › Payments / Reconciliation | Becomes a tab |
| 48 | Money › Income & expenses (`/expenses-bills`) | Finances › Money & Cash | Becomes a tab |
| 49 | Money › Bills to pay (`/liabilities`) | Finances (no named tab; nearest Money & Cash) | Becomes a tab |
| 50 | Money › Money setup (`/account-setup`) | Settings / contextual | Moves to another area (Settings) |
| 51 | Reports › All reports (`/reports-centre`) | **Analytics** (core) › Reports | Merge (group becomes Analytics) |
| 52 | Reports › Daily summary (`/daily-summary`) | Analytics › Overview (nearest; brief silent) | Becomes a tab |
| 53 | Staff & HR › HR dashboard (`/hr-dashboard`) | **Staff & HR** landing page (promoted for HR roles) | Stays |
| 54 | Staff › All staff (`/all-staff`) | Staff & HR › Staff | Becomes a tab |
| 55 | Staff › Add staff (`/staff-create`) | "+ Create" › Staff | Retired (contextual action) |
| 56 | Staff › Positions & grades (`/positions`) | Staff & HR tab | Becomes a tab |
| 57 | Staff › ID cards & QR (`/id-cards`) | Staff & HR › Staff (contextual) | Becomes a tab |
| 58 | Time & attendance › Attendance (`/attendance`) | Staff & HR › Attendance | Becomes a tab |
| 59 | Time & attendance › Shifts & roster (`/shifts`) | Staff & HR › Shifts | Becomes a tab |
| 60 | Time & attendance › Leave (`/leave`) | Staff & HR › Leave | Becomes a tab |
| 61 | Time & attendance › Attendance devices (`/attendance-devices`) | Staff & HR › Attendance | Becomes a tab |
| 62 | Pay › Payroll (`/payroll`) | Staff & HR › Payroll (accountant shortcut only with permission) | Becomes a tab |
| 63 | Pay › Salary statements (`/salary-statements`) | Staff & HR › Payroll | Becomes a tab |
| 64 | Pay › Increments & promotions (`/pay-changes`) | Staff & HR › Payroll / Staff | Becomes a tab |
| 65 | Pay › Gratuity & leaving (`/gratuity`) | Staff & HR › Payroll | Becomes a tab |
| 66 | Pay › Loans & advances (`/loans-advances`) | Staff & HR › Payroll | Becomes a tab |
| 67 | Staff & HR › HR setup (`/hr-setup`) | Settings / contextual | Moves to another area (Settings) |
| 68 | Offers & coupons › Offers (`/promo`) | **Marketing** › Promotions | Becomes a tab |
| 69 | Offers & coupons › Coupons (`/coupons`) | Marketing › Promotions | Becomes a tab |
| 70 | Offers & coupons › Flash sales (`/flash-sales`) | Marketing › Promotions | Becomes a tab |
| 71 | Offers & coupons › Offers page (website) (`/offers`) | Online Store (Storefront #15 shows offers) | Moves to another area |
| 72 | Loyalty › Loyalty & rewards (`/loyalty`) | Marketing › Loyalty | Becomes a tab |
| 73 | Loyalty › Members (`/members`) | Marketing › Loyalty (and the customer's 360 view) | Becomes a tab |
| 74 | Loyalty › Product points (`/product-points`) | Marketing › Loyalty | Becomes a tab |
| 75 | Loyalty › Customer wallet (`/wallet`) | Marketing › Loyalty as **Store credit** (the brief calls "wallet" a legacy label) | Retired (renamed) |
| 76 | Loyalty › Invite a friend (`/referrals`) | Marketing › Loyalty | Becomes a tab |
| 77 | Marketing › Abandoned carts (`/abandoned-carts`) | Marketing › Recovery | Becomes a tab |
| 78 | Marketing › Auto reminders (`/auto-reminders`) | Marketing › Recovery | Becomes a tab |
| 79 | Social posts › Post calendar (`/calendar`) | Brief silent (nearest: Communications › Campaigns) | Brief silent |
| 80 | Social posts › Create post (`/composer`) | Brief silent (nearest: "+ Create" › Campaign) | Brief silent |
| 81 | Marketing › Google Business (`/google-business`) | Brief silent (nearest: Online Store › Reviews or Sales channels) | Brief silent |
| 82 | Ads tracking › Pixels & events (`/pixels-events`) | Analytics › Tracking | Moves to another area |
| 83 | Ads tracking › Event health (`/event-health`) | Analytics › Tracking | Moves to another area |
| 84 | Ads tracking › Setup guides (`/setup-guide`) | Analytics › Tracking (contextual) | Moves to another area |
| 85 | Customer support › Inbox (`/merchant-inbox`) | **Communications** (core) › Inbox | Moves to another area |
| 86 | Customer support › Calls (`/merchant-calls`) | Communications › Calls | Moves to another area |
| 87 | Customer support › AI calls (`/ai-calls`) | Communications › Calls (nearest; brief silent) | Merge |
| 88 | Customer support › Support tickets (`/support-tickets`) | Orders › After-sales (owner #12), linked from Communications | Moves to another area |
| 89 | Online store & settings › Online store (`/landing-page-builder`) | **Online Store** (Online mode) › Landing pages | Stays (own top level) |
| 90 | Blog › Posts (`/blog-posts`) | Brief silent (nearest: Online Store) | Brief silent |
| 91 | Blog › New post (`/blog-editor`) | Brief silent (nearest: contextual create) | Brief silent |
| 92 | Blog › Categories (`/blog-categories`) | Brief silent | Brief silent |
| 93 | Blog › Authors (`/blog-authors`) | Brief silent | Brief silent |
| 94 | Automation › Rules (`/automations`) | Communications › Automations | Moves to another area |
| 95 | Automation › Workflow builder (`/workflow-builder`) | Communications › Automations | Moves to another area |
| 96 | Automation › Workflow settings (`/workflow-settings`) | Communications › Automations / Settings | Moves to another area |
| 97 | Automation › Scheduled reports (`/scheduled-reports`) | Analytics › Reports (contextual) | Moves to another area |
| 98 | Online store & settings › Connections (`/connections`) | Settings (bottom); ad connections also under Analytics › Tracking | Moves to another area (Settings) |
| 99 | Settings › Store settings (`/set-general`) | **Settings** (fixed bottom utility) | Stays (moves to bottom) |
| 100 | Settings › Wallet & credits (`/credit-wallet`) | Settings › billing | Becomes a tab |
| 101 | Settings › Subscription & billing (`/subscription`) | Settings › billing | Becomes a tab |
| 102 | Settings › Help & support (`/help-support`) | Shell utility (Help) | Retired (utility) |

Nayeem's Staff & HR area also has a **Roles & Security** tab, which has no menu item today. Profiles are switched at `/set-profile`.

### 4.5 Tabs inside each area (Nayeem's level 2)

| Area | Proposed tabs | Notes from the brief |
|---|---|---|
| Orders | All orders · Fulfilment · Delivery · After-sales · Wholesale | Pending / Processing / Delivered become filters, not menu items. Abandoned carts move to Marketing › Recovery |
| Products | Products · Categories · Inventory · Purchasing & Suppliers | "Add product" becomes a button. Barcode labels, counts, transfers, warehouses and racks sit inside Inventory |
| Customers | Customers · Companies · Segments | Companies appear when B2B applies |
| Communications | Inbox · Calls · Campaigns · Automations · Templates · Delivery log | Opens on the tab that fits the role (Inbox for support, Campaigns for marketers) |
| Finances | Overview · Payments · Money & Cash · Receivables · Reconciliation | — |
| Marketing | Overview · Promotions · Loyalty · Recovery · Audiences | Messaging campaigns stay under Communications |
| Analytics | Overview · Profitability · Marketing · Customers · Reports · Tracking | — |
| Online Store | Storefront & Theme · Checkout & Account · Landing pages · Reviews | — |
| Staff & HR | Staff · Attendance · Shifts · Leave · Payroll · Roles & Security | — |

### 4.6 Shell features: proposal vs today

| Topic | Nayeem proposes | Today | Status | Evidence |
|---|---|---|---|---|
| Global search / command menu | Ctrl/Cmd+K over records, destinations, actions, settings and setup; filtered by permission | Search box with a scope picker, ⌘K focus and barcode scan. The pop-over shows recent chips and 5 "Jump to" links. Typing returns no results. A command menu exists only in the UI kit | Partly built | `gc-topbar.js:166,183-192,233-235`; `/dev/ui-kit01-shell` |
| "+ Create" quick menu | Order, Product, Customer, PO, Expense, Campaign, Staff | No global menu. Home has a shortcut row; the top-bar Invoices pop-over has "New invoice" | Not built | `Home.jsx:302-307`; `gc-topbar.js:198` |
| Pins and preferred landing | 3–5 pins, landing choice, collapse state | Collapse state saved; no pins; every role lands on My dashboard | Partly built | `gc-sidebar.js:104,110,131`; `team.js:107` |
| Badges | Only things needing action, supplied by the owning area | 12 hard-coded counts, including "412" on All products; bell badge | Built differently | `navigation.js` counts; `gc-topbar.js:245` |
| Settings at the bottom | Fixed bottom utility | A sub-menu in the last group; also a top-bar gear and account-menu link | Built differently | `navigation.js:156-161` |
| Help and notifications | Shell utilities | Help button and Shift+?; bell with notes and the evening payout check | Built | `gc-topbar.js:231,245` |
| Mobile navigation | Bottom bar of 4 + More, by role and mode; POS full screen | Below 1024 px the full role-filtered menu opens as a drawer. The phone app has fixed tabs Home · Orders · Products · Inbox · More | Partly built | `gc-sidebar.js:85-86`; `MHome.jsx:304` |
| Changing mode | Tick or untick Online / Retail / Wholesale at any time; triggers setup; no data loss; audited | An edition is picked at sign-in and each edition is its own site. The full site previews editions. Changing edition shows a banner; Stock setup can merge stock into one place | Built differently | `edition.js:94-129`; `StockSetupBanner.jsx`; `stockMerge.js` |
| Navigation is not security | The owning area rejects guessed URLs | RoleGuard covers pages outside the role or edition (front end only) | Partly built | `RoleGuard.jsx:13-20` |

### 4.7 Brief #21's own tables, checked against the build

**The brief's audit of the old sidebar (9 rows).** Several points are already done in today's build.

| Brief's area | Today | Nayeem's change | Status | Evidence | UX move |
|---|---|---|---|---|---|
| General: Dashboard · Store overview · Orders · Products · Customers · POS | General: Dashboard, My dashboard, Tasks, Team chat | One Home; Orders and Products top level; POS gated by mode and permission | Partly built | Dashboard and Store overview are already one item; POS needs the `pos` module and a role | Dashboard → Home |
| Purchase: PO · Receive · Requests · Suppliers | Rows inside Products & stock; Requests in More stock tools | Products › Purchasing & Suppliers; can be promoted for buying roles | Partly built | Hidden by the buying setting (`stockSetup.js:62-69`) and the `purchasing` module | → Products › Purchasing |
| Stocks & Inventory (11 links) | Stock, Transfers, More stock tools [8], Warehouses & branches [3] | One Inventory tab under Products; warranty leaves Inventory | Partly built | Warranty still under More stock tools | → Products › Inventory |
| Tracking & Analytics (8 links) | Reports: All reports, Daily summary. Ads tracking sits in Marketing | One Analytics area with tabs | Built differently | Reports already one page with report definitions | Reports → Analytics; Ads tracking → Analytics › Tracking |
| Staff & HR (8 links) | Staff & HR: 5 rows, 18 leaves | One Staff & HR area with tabs | Partly built | Role-filtered (full for CEO and HR only); sub-items still in the sidebar | Sub-items → tabs |
| Loyalty + Promo + Recovery (14+ links, 3 groups) | One Marketing group: 7 rows, 19 leaves | Marketing with Promotions · Loyalty · Recovery · Audiences | Partly built | Already one group; no Audiences; also holds Social posts, Google Business, Ads tracking | Sub-items → tabs |
| Management: Inbox · Calls · Tickets · Storefront · Settings | "Customer support" and "Online store & settings" groups | Communications core; Online Store mode area; Settings at the bottom | Built differently | No Inbox or Calls in Retail + Wholesale | Customer support → Communications |
| Counts everywhere | 12 static counts | Badges only for things needing action | Not built | Hard-coded counts, including a total | — |
| Sub-menus opening inside the sidebar | Sub-menus open under their parent | Second level moves into page tabs | Built differently | Group headings stay visible; second level is still in the sidebar | Sub-items → tabs |

**The brief's execution list (20 rows).**

| Brief's area | Today | Nayeem's change | Status | Evidence | UX move |
|---|---|---|---|---|---|
| Shared sidebar | `<gc-sidebar>` | Keep the component; feed it from one registry | Partly built | Data is still a hand-written array | — |
| Dashboard + Store overview | One Dashboard item | One Home | Built | `navigation.js:10` | Dashboard → Home |
| Communications | Customer support group | Core area | Not built | Not top level; missing from Retail + Wholesale | → Communications |
| Order sub-items | Orders › All / Wholesale / Courier returns | Statuses as filters; tabs Fulfilment / Delivery / After-sales / Wholesale | Partly built | Statuses are filters; no such tabs | → Orders tabs |
| Products / Inventory / Purchase | Products & stock: 9 rows, 25 leaves | Products top level; Inventory and Purchasing as tabs | Partly built | Rare tools already folded into "More stock tools" | → Products + tabs |
| Analytics | Reports group | One Analytics area | Built differently | Reports already consolidated; tracking in Marketing | Reports → Analytics |
| Promo / Loyalty / Recovery | Marketing group | Marketing area | Partly built | Sub-items still in the sidebar | → tabs |
| Staff & HR | Staff & HR group | One area for relevant users | Partly built | See above | → tabs |
| Online / Retail / Wholesale | 4 fixed editions | Combinable, editable modes | Built differently | Each edition is its own site | — |
| POS | POS · New sale row | Gated by mode, role and setup | Built (no "Set up" state) | `pos` module and shop roles | → POS top level |
| Online Store | "Online store" row | Online-mode area | Partly built | Only with the `online` module, inside a mixed group | → Online Store |
| Wholesale | `wholesale` module rows | Wholesale workspace onto Orders | Partly built | Rows spread across groups; no Wholesale area | → Wholesale |
| Finances | Money group (7 pages) | Finances core area | Built differently | Named "Money" by choice (`docs/terminology.md`) | Money → Finances |
| Setup & Migration | — | Prominent during setup, then in Settings/Home/search | Not built | Only `StockSetupBanner` | — |
| Badges | Static counts | Action counts only | Not built | — | — |
| Global search | Top-bar search | Records, destinations, actions and settings | Partly built | No results while typing | — |
| Quick Create | Home shortcut row | One "+ Create" | Not built | Add rows still in the menu | Add rows → "+ Create" |
| Personalization | Collapse flag | Pins, landing, collapse | Partly built | Collapse only | — |
| Mobile | Drawer and the phone app | Role/mode-resolved 4 + More | Partly built | Fixed phone-app tabs | — |
| Navigation data | NAV + MODULES + NAV_ALIAS | One versioned registry | Partly built | Shared by sidebar, top bar, Help, editions and roles | — |

#### New capabilities in #21

| Proposal | Status | Evidence / note |
|---|---|---|
| Navigation registry (modes, permissions, scope, setup behaviour, promotable, pinnable, mobile priority, badge source, keywords, aliases) | Partly built | Today's data has only label, icon, route, module and count |
| Merchant operating profile with combinable modes | Built differently | Fixed edition bundles; `stockSetup.js` stores edition, buying choice and the wholesale flag |
| Per-user navigation profile (pins, landing, last tab) | Not built | Collapse flag only |
| Resolver order: mode → entitlement → flag → permission/scope → setup → role → pins → device | Partly built | Today: role → edition → buying setup (`team.js:81-93`) |
| Entitlements separate from mode | Not built | The edition stands for both |
| "Set up" state for chosen but unconfigured areas | Not built | Nearest: StockSetupBanner |
| Several roles per person, merged | Not built | One role per user |
| Area tabs inside the page (level 2) | Not built | Second level lives in the sidebar; some pages use `?tab=` |
| Breadcrumb from the menu | Built | `gc-topbar.js:16-33` |
| Route aliases during migration | Built | `NAV_ALIAS`; `next.config.mjs` redirects |
| English and Bangla labels | Built | `shell/i18n.js` |
| Accessibility (landmark, current item, rail tooltips) | Built | `gc-sidebar.js` |
| Navigation analytics and tests (modes × roles × plans) | Not built | No test runner beyond `check:screens` |

#### Built differently / conflicts in #21

- **Packaging.**
  - Today the product is sold as four fixed editions, each its own site.
  - Nayeem wants combinable Online / Retail / Wholesale modes on one account, editable at any time.
  - Retail-only, Wholesale-only, Online + Retail and Online + Wholesale have no edition today.
- **Connect edition.** Today Connect (communication, CRM, POS) is sold as its own product. The brief has no communication-only shape.
- **Communications everywhere.** Today Retail + Wholesale has no Inbox or Calls. The brief makes Communications core in every mode.
- **Sales channels.**
  - Today the group is in all three store editions, including Retail + Wholesale.
  - The brief ties it to Online mode.
  - The brief only names "Sales channels" as a top-level item in the all-three example.
- **Home.** Today only the CEO sees Dashboard; everyone else uses My dashboard, and Online and Connect have their own Homes. The brief wants one role-aware Home.
- **Names.** Money vs Finances (Money was chosen in `docs/terminology.md`). Reports vs Analytics. Customer support vs Communications.
- **Placements.**
  - Automation sits in "Online store & settings" today; the brief puts it in Communications.
  - Ads tracking sits in Marketing; the brief puts it in Analytics.
  - Support tickets sit in Customer support; the brief gives them to After-sales.
  - Warranty sits under stock; the brief moves it out of Inventory.
- **Team features.** Tasks, Team chat, Leads and My dashboard have no place in the brief.
- **Old baseline.** The brief audits the original sidebar. Today's build already has:
  - one Home;
  - Reports cut to 2 items;
  - one Marketing group;
  - Purchase inside Products & stock.
- **Legacy items the brief names that are still there:** "Customer wallet", and Warranty under stock.
- **#21 vs #17.**
  - #21 keeps Setup & Migration out of the core menu once the store is live.
  - #17 calls it a permanent workspace.
  - The briefs do not reconcile the two.

Coverage: brief tables 29 rows (9 + 20), all checked. Master move table: 102 of 102 current items.


## 5. Area by area

One section per brief, grouped by Nayeem's business areas: Home, Orders, Products, Customers & Marketing, Communications, Finances, Analytics, Online Store, then Platform (Settings, Staff, Console, Design System). Navigation (#21) is covered in section 4.

Each section has the same parts:
- Nayeem's decision, plus what that area owns and does not own;
- what exists today;
- the brief's own tables, checked row by row;
- the new capabilities the brief adds;
- where today's build went another way.


### Home · #10 Merchant Dashboard & Overview

*Brief v1.0, 29 Sep. Business area: Home.*

**Nayeem's decision.**
- `MerchantOverview` becomes the one Home; `MerchantDashboard` is retired, but its Monthly Target, average order value, New Customers and comparison ideas are kept.
- Home has three jobs: summarize, prioritize and launch into the owning page.
- It never duplicates another area's figures. Its order is: needs attention → business pulse → orders → money → stock & purchasing → customers.

**Owns:**
- the dashboard layout and KPI mix;
- the attention list and its priority;
- date, place and role context;
- deep links;
- the first-run handoff;
- small insights.

**Does not own:** order status, balances, stock, settlement, supplier ledger, customers, promotions, cases, report maths or permissions.

**Today:**
- `/merchant-overview` runs `Home.jsx`, built from the shared books.
- The Online edition has its own `OnlineHome.jsx`, and Connect has `CommsHome.jsx`.
- Each role also has `/my-dashboard`.

#### Screen by screen

| Brief's area | Today in the build | Nayeem proposes | Status | Evidence | UX move |
|---|---|---|---|---|---|
| Snapshot: MerchantOverview | `/merchant-overview` → `Home.jsx` | Canonical Home | Built differently | Rebuilt from the books; the old `MerchantOverview.jsx` is kept as reference only | — |
| Snapshot: MerchantDashboard | No file, no route | Merge, then retire | N/A | Only in the old design bundle | — |
| Header | Home header | Keep date, comparison, EN/BN, Export and Open POS; add a place picker and a role-aware main button | Partly built | Today/Yesterday and an "All places" picker (`Home.jsx:331-337`); buttons follow the edition, not the role; no Export, no date range | — |
| Alerts | "Needs your attention" | Cross-module action centre with priority, age and value | Partly built | Orders to verify, overdue payouts, supplier bills, bills to pay, approvals, courier returns (`Home.jsx:228-238`); no drawers, reconciliation, receivables or warranty; no age column | — |
| Revenue / Profit / Orders / Purchases cards | "At a glance" row | Rename Profit to Gross Profit; use Net Sales; add AOV and Target | Built differently | Full Home: Sales, Online orders, Money in hand, Payouts this week, Expenses. Online Home: Revenue, Orders, Average order, Conversion. No profit KPI on Home | — |
| Entity-count row | — | Remove (optional Store snapshot) | Built | Already removed | — |
| Sales summary / trend | "Last 7 days" card | Net Sales by default; target line | Partly built | Stacked by channel, labelled "Sales"; no target line. Online Home has a 30-day revenue chart | — |
| Fulfilment pipeline | Orders card | Operational views: Needs confirmation … Exceptions | Built differently | Uses the real order statuses (`orderStatus.js`); verification is a step; no Exceptions view | — |
| Revenue vs Profit chart | — | "Net Sales vs Gross Profit" with a tooltip | Not built on Home | Profit lives in Sales & profit and Reports | Stays in Reports |
| Prepaid vs COD (old dashboard) | Money cards | Money snapshot: cash · bank + MFS · COD/clearing · receivables · expenses | Built | Money in hand; Money to collect (COD with couriers, gateway payouts, invoices due); Money you owe; Expenses | — |
| Purchase trend / card | Stock card | Open PO · overdue PO · due to receive · restock | Partly built | "Coming from suppliers" and POs to approve; no overdue PO | — |
| Latest orders | Orders card list | Actionable rows by role; exception icon | Partly built | Latest 5 with status badges; not role-aware; no exception icon | — |
| Stock alert | Stock card | By place; Low / Out / Incoming / Transfer; Restock or Transfer | Partly built | Low list by place, "Out" / "n left", Reorder → New PO; incoming and transfer boxes | — |
| Top products | "Best sellers" | Top sellers / Needs restock, with stock context | Partly built | Qty and revenue; no stock context | — |
| Customers | Online Home only | Top / New / At risk, compact | Partly built | Online Home: Top customers with repeat count | — |
| Monthly Target (old dashboard) | "Monthly target" card | Part of Business Pulse; the target is set in Reports/Settings | Built differently | Target is stored in Home's Customise sheet | — |
| AOV / New customers (old dashboard) | — | Into Pulse; add returning-customer rate | Partly built | AOV on Online Home only; no new-customer count | — |
| Exec: keep MerchantOverview as the one Home | Home + edition Homes | One Home | Built differently | Edition Homes split it | — |
| Exec: retire MerchantDashboard | — | Retire | N/A | — | — |
| Exec: add location to header | Place picker | Date + place + comparison | Partly built | `Home.jsx:334-337` | — |
| Exec: expand alerts | Needs your attention | Cross-module | Partly built | See Alerts | — |
| Exec: rename Profit | — | Gross Profit | Built (in Reports) | Reports already say "Gross profit" | — |
| Exec: refine revenue wording | "Sales" / "Revenue" | Net Sales | Built differently | Home says Sales; Reports say Net sales | — |
| Exec: de-emphasize entity counts | — | Optional snapshot | Built | Removed | — |
| Exec: consolidate Business Pulse | Glance row | Net Sales · Orders · AOV · Gross Profit · Target | Built differently | See cards row | — |
| Exec: fix fulfilment pipeline | Orders card | Operational views | Built differently | See pipeline | — |
| Exec: replace Prepaid vs COD | Money cards | Money snapshot | Built | See Money | — |
| Exec: make purchase summary actionable | Stock card | Open / overdue / due | Partly built | See purchase | — |
| Exec: harden stock alert | Stock card | Place-based facts | Partly built | See stock | — |
| Exec: top products with action context | Best sellers | Restock mode | Partly built | See top products | — |
| Exec: compact customers | Online Home only | Top / New / At risk | Partly built | See customers | — |
| Exec: role awareness | Edition Homes + My dashboard | One Home with role priorities | Built differently | Three edition Homes plus a My dashboard per role; Dashboard menu item is CEO only | My dashboard → Home |
| Exec: new-merchant state | — | Setup readiness instead of empty charts | Not built | Home shows plain empty states | — |
| Exec: insights (small, later) | — | 2–3 evidence-backed insights | Not built | — | — |

#### New capabilities in #10

| Proposal | Status | Evidence / note |
|---|---|---|
| Normalized action items (owner, severity, age, de-duplication, resolution) | Not built | Computed inline in `Home.jsx` |
| One metric contract (time basis, scope, comparison) shared with Reports | Partly built | Home reads `reports/dailySummary`, the same source as the 8 PM summary |
| Place carried to every widget; company-wide cards labelled | Partly built | Place filter on sales and stock |
| Widgets hidden for modules the merchant does not use | Built | `SECTION_MODULE` in `Home.jsx` |
| "As of" freshness | Not built | — |
| Export scoped to date and place | Not built | — |
| Sales target set in Reports/Settings | Built differently | Stored on the dashboard |
| First-run readiness from Setup (#17) | Not built | — |
| Insights kept separate from alerts | Not built | — |
| Phone order: attention and pulse first | Partly built | Glance row is a swipe strip on phones |
| Light personalization (no builder) | Built | Customise sheet hides sections |

#### Built differently / conflicts in #10

- **Base screen.** The brief starts from the `MerchantOverview` design file. Today's Home was rebuilt from the shared books; the design screen is kept as reference only.
- **Number of dashboards.** The brief says "do not build a third dashboard". Today there are:
  - Home, Online Home and Connect Home;
  - My dashboard (13 role variants);
  - area overviews (HR dashboard, Money overview, Channels overview).
- **Business pulse.**
  - The brief wants Net Sales · Orders · AOV · Gross Profit · Target.
  - Full Home shows Sales · Online orders · Money in hand · Payouts · Expenses.
  - Online Home shows Revenue · Orders · Average order · Conversion.
- **Period.** The brief wants a date range with comparison. Today: Today/Yesterday compared with the day before.
- **Pipeline.** The brief wants dashboard-only operational views. Today uses the real order statuses, with verification as a step.
- **Money.** Today's Home adds "Money you owe" (supplier bills, liabilities), which the brief does not list.

Coverage: brief tables 34 rows (2 + 15 + 17) · reported 34.


### Home · #17 Onboarding, Migration & Merchant Setup

*Brief v1.0, 30 Sep. Business area: Home / Settings.*

**Nayeem's decision.**
- Keep the 5-step signup.
- Add **one permanent "Setup & Migration" workspace** with four tabs: Setup checklist · Import & migrate · Migration runs · Launch readiness.
- A setup task counts as done only when the owning area says so.
- Migration is a safe process: map, dry run, keep provenance, reconcile, cut over.

**Owns:**
- onboarding profile;
- setup recommendations;
- checklist and readiness rules;
- migration runs (source, mapping, dry run, issues, reconciliation, provenance);
- launch/cutover checklist;
- onboarding assignments and milestones;
- activation measure.

**Does not own:**
- provisioning, plans, billing and sign-in;
- the imported products, stock, customers, orders and reviews;
- payment, courier, domain and tracking engines;
- roles and balances.

#### Screen by screen

| Brief's screen | Today in the build | Nayeem proposes | Status | Evidence | UX move |
|---|---|---|---|---|---|
| MerchantOnboarding | `/merchant-onboarding` | Keep as the main signup | Built | 5 steps | — |
| MobileSignUp | `/mobile-sign-up` | Keep as its phone state | Built (separate code) | Repeats the lists | — |
| MerchantSignIn | `/merchant-sign-in` | Tie into staff security (#18) | Built differently | "Choose your system" picker; demo signs in at once; link to sign-up | — |
| Console · FormProvision | `/form-provision` | Keep as the staff-assisted entry | Built (console UI) | Start empty / CSV / WordPress; assisted migration | — |
| Console · Provisioning | `/provisioning` | Belongs to the platform (#19) | Built (console UI) | Stages and retry | — |
| Console · MerchantDetail | `/merchant-detail` | Keep as the staff/success view | Built (console UI) | Onboarded by, helper, Activation, Health | — |
| UI kit setup checklist | `/dev/ui-kit07-feedback` | Becomes real setup UX | Not built | Component exists in the UI kit only | → Setup & Migration |
| Step 1 Account | Onboarding step 1 | Keep; trial copy from the plan catalogue; auth belongs to #18 | Partly built | Hard-coded "No card needed — start free"; Google sign-up; Terms | — |
| Step 2 Verify | Step 2 | Keep OTP and +880; store numbers in E.164 | Built (UI) | +880 field, phone check, resend | — |
| Step 3 Business | Step 3 | Category drives recommendations only | Partly built | Category only changes the story slide | — |
| Step 4 How you sell | Step 4 | Add Website (Woo / Shopify / Other) and Wholesale/B2B | Not built | No Website or B2B option; the edition is picked at sign-in instead | — |
| Step 5 Shop link | Step 5 | Reserve the subdomain; handle name clashes | Partly built | Minimum 3 characters; always says "available" | — |
| Ready / first tasks | Ready step | Preview of the lasting checklist; card stays on Home | Partly built | 3 hard-coded tasks; "Go to my dashboard"; no setup card on Home | Ready → Setup & Migration |
| MobileSignUp (recheck) | `/mobile-sign-up`; phone app `/onb-*` | One state model | Built differently | Separate copies plus a third flow in the phone app | — |
| FormProvision · staff setup | `/form-provision` | CSV/WordPress becomes a Migration Plan; add Shopify / Other | Partly built (console) | No Shopify / Other | — |
| FormProvision · what happens next | `/form-provision` | Formal stages; a merchant-facing "Creating your store" screen | Partly built | No merchant progress screen | — |
| Provisioning (recheck) | `/provisioning` | Setup reads its status; failures in plain words | Partly built (console) | Console only | — |
| MerchantDetail · onboarded / helper / history | `/merchant-detail` | Formal assignment, sessions, milestones, migration links; Activation kept apart from Health | Partly built (display) | "Activation 100% on day 7"; Health shown separately | — |
| UI kit setup checklist (recheck) | `/dev/ui-kit07-feedback` | Lasting workspace | Not built | — | → Setup & Migration |
| Exec: MerchantOnboarding | 5-step flow | Keep the shape | Built | — | — |
| Exec: MobileSignUp | Separate component | Same state | Built differently | — | — |
| Exec: Step 4 selling model | Fixed list | Add Website / B2B | Not built | — | — |
| Exec: Ready screen | Hard-coded tasks | Preview the owner-driven plan | Not built | — | — |
| Exec: Provisioning | Console | Platform owns it; merchant progress screen | Partly built | Console only | — |
| Exec: Setup checklist | UI kit | Real workspace | Not built | — | — |
| Exec: Setup & Migration | — | One lasting workspace | Not built | No route | New workspace |
| Exec: Migration | FormProvision options; Products "Import CSV" | Source → map → dry run → import → reconcile | Not built | Import CSV only shows a message | — |
| Exec: WooCommerce / Shopify | Sales channels pages and `/woo-sync` | Treat as migration sources | Built differently | Today they are ongoing sales channels (Grid → store sync) | — |
| Exec: Historical orders | — | Import mode with no side effects | Not built | — | — |
| Exec: Customers | CRM merge exists | Normalize, match, review merge on import | Partly built | Merge exists; no import | — |
| Exec: Opening stock | Stock move ledger | Opening movement by place | Not built | `addMove` exists; no opening import | — |
| Exec: Reviews import | — | Provenance and verification | Not built | — | — |
| Exec: SEO / domain cutover | `/set-seo`; console `/domains` | Readiness checks | Not built | — | — |
| Exec: Assisted onboarding | MerchantDetail helper | Assignments, sessions, milestones | Partly built (display) | — | — |
| Exec: Activation | Console percentage | From milestones; separate from Health | Partly built | — | — |

#### New capabilities in #17

| Proposal | Status | Evidence / note |
|---|---|---|
| Versioned onboarding profile (the merchant's answers) | Not built | — |
| Setup Plan engine (Required / Recommended / Optional / Complete / Dismissed; completion from owner facts) | Not built | `/stock-setup` is the nearest setup page |
| Readiness profiles (Online, FB/WhatsApp, Retail, Wholesale, Migrating, Enterprise) and states | Not built | — |
| Migration runs (13 states), adapters and mapping templates | Not built | — |
| Dry run with Ready / Warning / Blocked / Ignored and an issue report | Not built | — |
| Provenance on every imported record; safe retries | Not built | — |
| Reconciliation counts and checksums | Not built | — |
| Historical-order import mode (no messages, stock, payments, courier, loyalty or recovery events) | Not built | — |
| Serial / IMEI / lot import checks | Not built | Products already carry IMEI/Serial flags |
| Customer import with duplicate review and consent provenance | Partly built | CRM merge and "not the same" pairs exist |
| Review import with verification provenance | Not built | — |
| Redirect mapping and domain cutover checks | Not built | — |
| Launch readiness checks and a real test order / sale | Not built | — |
| Onboarding assignments, sessions, milestones, merchant tasks | Not built | Console shows helper text only |
| Activation % from milestones, separate from Health | Partly built | Both shown in the console, without a definition |
| "Creating your store" progress screen | Not built | — |
| Signup copy from the plan catalogue | Not built | — |
| One state model for desktop and phone onboarding | Not built | Three separate flows |

#### Built differently / conflicts in #17

- **Front door.**
  - Today the front door is sign-in with "Choose your system", where an edition is picked and the demo signs in at once.
  - In the brief, the front door is the 5-step wizard, and Step 4 drives recommendations rather than a fixed edition.
- **WooCommerce and Shopify.** Today they are ongoing sales channels. The brief treats them as sources to migrate from.
- **Stock setup.**
  - Today `/stock-setup` sets the inventory shape: one place or many, how you buy, wholesale on/off, and stock merge.
  - The brief has no such page; its checklist has "Set opening stock" and "Configure supplier/purchase workflow".
- **Three onboarding flows today** (desktop, MobileSignUp, phone app). The brief asks for one.
- **Where Setup lives.** #17 makes Setup & Migration a permanent workspace. #21 moves it to Settings/Home/search once the store is live.

Coverage: brief tables 35 rows (7 + 12 + 16) · reported 35.


### Orders · #4 Sales, Orders, Fulfilment & Delivery

*Brief v1.2, 28 Sep (freeze candidate).*

**Nayeem's decision.**
- There is one Sale/Order record for every source.
- **All orders** (MerchantOrders) is the one list of every sale and order; **Order detail** is where an order is run.
- The status tabs become *working views* worked out from separate states: Order, Confirmation, Payment, Fulfilment, Delivery, Return, Receivable.
- Only one new screen: an **Assisted New Order** workspace behind the New order button.

**Owns:**
- order and line snapshots;
- confirmation;
- assisted order entry;
- negotiated-price audit;
- order edits;
- fulfilment;
- courier booking, labels, tracking and exceptions;
- sales documents;
- wholesale quote → Sales Order.

**Does not own:** stock quantity, payment records, balances, the customer master, message sending, return/warranty cases, the POS cashier screen, loyalty, P&L.

**Today:**
- `/merchant-orders` (`MerchantOrders.jsx`, MO below) and `/order-detail` (`OrderDetail.jsx`, OD).
- Order entry is `/new-order` (`NewOrder.jsx`, NO), plus `/pos` for retail and wholesale.
- Status and steps live in `src/lib/orderStatus.js` and `src/lib/orderFlow.js`.

#### Screen by screen

| Brief's area | Today in the build | Nayeem proposes | Status | Evidence | UX move |
|---|---|---|---|---|---|
| MerchantOrders (snapshot) | `/merchant-orders` | Keep the look; one status → working views over separate states | Partly built | Look kept; tabs are still one status list (MO:27) | — |
| OrderDetail (snapshot) | `/order-detail` | Keep; contextual next actions; add Payment, Fulfilment, Delivery and Documents cards | Partly built | One next-step card per status (OD:485-575); stock-held card; no Documents card | — |
| New order button (snapshot) | `/new-order`; POS and wholesale views send it to `/pos` | One Assisted New Order workspace | Partly built | Create-order page exists | — |
| All orders · overall | `/merchant-orders` | "All Sales & Orders"; saved views and columns, source filters, exception badges, next-step column, bulk documents | Partly built | Online + POS + wholesale in one list with a channel filter; no saved views or next-step column | — |
| All orders · status tabs | MO | Working views: All · Needs action · Confirmation · Processing · Ready to dispatch · In transit · Delivered · Exceptions | Built differently | 9 saved statuses (`orderStatus.js:13-23`); status dropdown on phones | — |
| All orders · Payment column | MO | Payment status first; COD shown as the method under it | Not built | Payment values are Paid / Unpaid / Partial / COD | — |
| All orders · Returned | MO + `/courier-returns` | Courier RTO kept apart from a customer return case; RTO filter; return indicator | Partly built | "Returned" means courier RTO only; customer returns go through Return & exchange; no indicator on rows | — |
| All orders · bulk actions | MO | Eligibility review and a result per order; print documents; assign place; export | Partly built | Ineligible orders skipped, per-order courier results; bulk Approve with stock check; Print labels is a message only; CSV export works | — |
| All orders · KPIs | MO | Rename to "Customer COD to collect"; add on-hold and delivery-exception counts | Partly built | "Cash on delivery to collect"; no on-hold or exception KPI | — |
| Order detail · header | OD | Workflow + Confirmation / Payment / Fulfilment / Delivery badges; Documents menu; one main action + More | Partly built | Status, payment, duplicate and blocked badges; Return; both Print buttons are messages only | — |
| Order detail · quick block | OD | Milestones with partial and exception states | Built differently | 6-step stepper New → Verification → Approved → Ready for courier → In transit → Delivered | — |
| Order detail · action block | OD | Replace Approve/Hold/Cancel/Mark delivered; confirming ≠ courier booking; delivered ≠ settled | Built differently | Next-step card per status: Verify / Approve / Advance / Cancel → Prepare parcel → Send to courier → In transit → Delivered; button still says "Approve" | — |
| Order detail · delivery form | OD | Remove "Advance collected"; use Record payment / Request advance; customer charge ≠ courier cost; consignment, label, retry | Partly built | No advance field; "Take advance + approve" posts to the money ledger; courier charge kept apart; no editable address/zone form | — |
| Order detail · courier history / fraud | OD | "No history" ≠ low risk; explainable facts; "Why?" | Partly built | No record shows "New customer" / "No courier record"; parcel counts per courier; still Low/Medium/High labels | — |
| Order detail · tracking details | OD | Fold under Advanced; limit by role; mark IP location as approximate | Partly built | "Visit details" folded; IP and network shown to everyone | — |
| Order detail · notes | OD | Separate Customer note · Courier instruction · Internal note | Not built | "Order note" plus internal note; neither is saved | — |
| New order (missing) | `/new-order` | Assisted New Order: phone lookup, live search, negotiated price, source, delivery, fulfil-from, payment/advance, checks, hold, barcode, shortcuts | Partly built | Has customer search and quick add, courier history, name/SKU search, editable price, delivery rates, COD/partial/full + advance, fulfil-from place, approve-now vs verify-later, order link. Missing: source picker, barcode, shortcuts, real hold/resume, duplicate check | — |
| Row design · Order column | MO | Order ID and date; source under it | Built | ID, invoice number, date · channel | — |
| Row design · Customer column | MO | Phone/area; risk or duplicate icon only with evidence | Partly built | Phone · zone; "Possible duplicate" badge sits in the Order cell; no risk icon | — |
| Row design · Items column | MO | Summary; partial-fulfilment mark | Partly built | Summary only | — |
| Row design · Courier column | MO | Not booked / booking error / exception | Partly built | "No tracking ID" only | — |
| Row design · Status column | MO | Workflow headline + exception badge | Partly built | One status badge | — |
| Row design · Payment column | MO | Status first, method under it | Not built | — | — |
| Row design · Total column | MO | Keep; optionally show what is outstanding | Built | Total only | — |
| Row design · Action column | MO | Contextual action (Review payment / Confirm / Send to courier …) | Not built | Open, plus More (message only) | — |
| Header · Pending + Unpaid | OD header | Workflow headline + 4 state badges | Partly built | Status and payment badges only | — |
| Header · Auto call | OD Verify card | Keep where it applies; log attempts | Built | Auto call in the Verify card; attempts logged and messaged | Header → Verify card |
| Header · Print POS | OD header | Documents menu (A4, thermal, packing, pick, challan, label) | Not built | Print buttons are messages; the shipping slip prints from Prepare parcel | — |
| Action: All orders scope | MO | All Sales & Orders; channel is a filter | Built | One list with a channel filter | — |
| Action: status tabs | MO | Working views | Built differently | One saved status | — |
| Action: Payment column | MO | Status + method | Not built | — | — |
| Action: Returned state | MO / Courier returns / Return & exchange | Courier RTO ≠ customer return | Built | Kept apart | — |
| Action: bulk courier send | MO | Eligibility review, per-order result, safe retry | Partly built | Ineligible skipped, per-order errors; no review step or retry key | — |
| Action: COD KPI | MO | Rename | Built | "Cash on delivery to collect" | — |
| Action: New order | NO | One workspace | Partly built | `/new-order` | — |
| Action: Order detail header | OD | Workflow + badges + Documents + contextual main action | Partly built | See header | — |
| Action: quick block | OD | Gated milestones | Built differently | Stepper | — |
| Action: Approve | OD | Confirming and courier booking are separate | Built | Approve and Send to courier are separate actions | — |
| Action: Mark delivered | OD | Synced from courier; delivered ≠ remittance settled | Built | No manual "delivered"; courier webhook; Delivered card says "settlement pending" | — |
| Action: Advance collected field | OD | Remove; use payments | Built | Advance dialog posts a ledger entry | — |
| Action: Shipping charge | OD | Customer charge ≠ courier cost | Built | `shipping` vs `courierCharge` | — |
| Action: Delivery operations | OD / `orderFlow.js` | Booking, consignment, label, retry, tracking sync, exceptions | Partly built | Simulated API check, consignment number, tracking link, webhook de-duplication, slip print; no retry or exception queue | — |
| Action: Courier history / risk | OD | Explainable | Partly built | See courier history | — |
| Action: Technical tracking | OD | Fold and limit by role | Partly built | Folded, not limited | — |
| Action: Notes | OD | Three notes | Not built | — | — |
| Action: Payment actions | OD | Verify / Record / Link / Advance | Partly built | Payment link + advance; no proof check or later payment on online orders (invoices have one) | — |
| Action: Fulfilment | OD | Allocation, pick/pack, partial, serial/batch | Partly built | Stock-held card and packing checklist; no pick list, partial or serial | — |
| Action: Documents | OD | A4, thermal, packing slip, pick list, challan, label; frozen once issued | Partly built | Shipping slip, invoice sheet, challan | — |
| Action: Order editing | OD | Preview consequences; version checks | Not built | "Update items" is a message only | — |
| Action: Wholesale / B2B | `/pos`, `/sales-invoices`, `/wholesale-orders` | Quote / Sales Order mode inside New Order | Built differently | Wholesale customers with price tiers sold at POS; unpaid/paid invoices; deliveries with challans | New Order mode → POS + Invoices |
| Action: Navigation | Sales group (9 items) | Sales & Orders plus child workspaces only | Built differently | Orders ▸ All / Wholesale / Courier returns, POS, Invoices, Returns, Customers, Leads, POS manage | — |

#### New capabilities in #4

| Proposal | Status | Evidence / note |
|---|---|---|
| One sale record with source / workflow / customer mode / fulfilment mode | Partly built | `channel` + `source`; POS sales are order rows too |
| 7 independent state dimensions plus a headline worked out from them | Built differently | One status plus payment, verify, prep and holds |
| Headline set of 12 values (Draft … Completed) | Built differently | 9 statuses; no Draft / Picking / Packed / Completed |
| Exception flags (payment, stock, partial, delivery, RTO) | Partly built | Duplicate badge and Returned; "Delivery failed" only logged |
| Custom statuses tied to the real states | Not built | — |
| Frozen line snapshot (list / promo / manual / final / tax / cost) | Partly built | POS lines keep SKU, category, cost and approver; online lines keep name, qty, price |
| "Adjust price" (final price first; amount or %; reason; limits; margin floor) | Partly built | POS keypad + manager PIN; New order price editable without audit; order discount with reason |
| Pricing order list → price list → promo → manual → order | Partly built | POS uses a fixed order; wholesale tier price |
| Stock reservation with 5 merchant choices | Built differently | Fixed by edition (held on approval; taken out on approval in Online) |
| Multi-place allocation | Partly built | One place chosen at approval; no split |
| COD confirmation queue with outcomes, attempts and follow-up | Partly built | Auto call / Log call with 4 results; AI calls page; no queue view or follow-up rule |
| Next action: manual payment proof → Review payment | Not built | No proof submission |
| Next action: COD → Confirm customer | Built differently | Verify order card |
| Next action: confirmed → Start fulfilment | Built differently | Prepare parcel checklist |
| Next action: packed → Send to courier | Built | — |
| Next action: in transit → Track | Partly built | Tracking timeline and link; demo updates |
| Next action: delivered → Complete by rule | Partly built | Delivered card; Return in the header |
| Payment / Fulfilment / Delivery cards | Partly built | Total / Paid / COD tiles; stock-held card; courier and tracking cards |
| Sales document engine (A4, 58/80 mm, packing slip, pick list, challan, label, quote) | Partly built | Slip, invoice sheet, challan |
| Separate order / invoice / receipt numbers; revision trail | Partly built | Separate invoice number; invoice revisions |
| Order editing with stock/payment/courier effects | Not built | Duplicate merge only |
| Multiple or partial fulfilments, pickup, digital, substitution | Partly built | Wholesale partial deliveries; "Shop pickup" delivery rate |
| Completion rules ("Completed" worked out) | Not built | Delivered is the last state |
| Wholesale quote / proforma → Sales Order | Built differently | No quote; POS + Invoices |
| Duplicate review (No concern / Possible / Strong) | Partly built | Same phone + same product within 48 h; cancel as duplicate / merge |
| Courier booking and webhooks that can't double up | Partly built | Webhook event IDs de-duplicated; booking guarded by status only |
| Child workspaces (courier review, payment review, pick/pack, print, quote, edit review) | Not built | Bulk approve dialog only |
| Bulk print and booking in the background, failures per order | Not built | — |

#### Built differently / conflicts in #4

- **Status model.**
  - Today each order has one saved status, first chosen by how it is paid (On hold = COD waiting for verification, Processing = paid in full, Pending = payment due).
  - The brief wants separate states with a headline worked out from them.
- **Same words, different meanings:**
  - "On hold" is any open gate in the brief.
  - "Processing" means ready to fulfil in the brief.
  - The brief splits "Pending" into payment and confirmation.
- **COD.** Today COD is a payment value, and the order becomes Paid on delivery while courier remittance runs in Payouts. The brief wants "Unpaid · COD".
- **Verification.** Today verification is a step and "Approve" is the decision. The brief renames it "Confirm customer".
- **Reservation.** Fixed by edition today; a merchant choice in the brief.
- **Order entry.** Today there are two entries (`/new-order` for online/manual, `/pos` for retail and wholesale). The brief wants one Assisted New Order with a B2B mode.
- **Brief vs brief.** The Sales brief gives customer returns to After-sales (#12). The POS and Support briefs keep the return screen in POS. Today there is one Return & exchange page in Sales, which POS opens.
- **Old baseline.** The brief describes list statuses Pending / Approved / Ready to ship / Shipped, a Hold/Mark delivered selector, an "Advance collected" field and "Low risk" with 0 parcels. All four have changed.

Coverage: brief tables 51 rows · reported 51.


### Orders · #8 POS Register

*Brief v1.0, 29 Sep.*

**Nayeem's decision.**
- The 13 POS design files are one register:
  - Idle, Active, Tablet and Dark are its states;
  - Pay and Keypad are sheets;
  - Sales is a drawer;
  - Return, Open, Close and Offline are bounded workflows.
- No new permanent POS page. Only small child sheets are added: serial/IMEI, weighed items, manager approval, terminal chooser, cash movement, hardware status, offline sync.
- Cashier speed comes first. Every money and stock record belongs to its owning area.

**Owns:**
- register, counter and device context;
- shift UX;
- cart, scanning, hold/resume;
- the payment interaction;
- drawer count;
- approval challenge;
- receipts and reprints;
- hardware state;
- offline queue.

**Does not own:** product price, stock ledger, settlement, customer master, loyalty/coupon engines, return/warranty cases, balances, tax setup, staff roles.

**Today:**
- `/pos` (`Pos.jsx`) is the one register.
- `/pos-manage` (`PosManage.jsx`) is its back office.
- Shared data lives in `src/lib/posStore.js`.

#### Screen by screen

| Brief's area | Today in the build | Nayeem proposes | Status | Evidence | UX move |
|---|---|---|---|---|---|
| PosIdle (snapshot) | `/pos` with an empty cart | Main register, empty state | Built | `/pos-idle` redirects to `/pos` | — |
| PosActive (snapshot) | `/pos` | Main register, active state | Built | One screen | — |
| PosTablet (snapshot) | `/pos` responsive | A responsive state | Built differently | No separate file; breakpoints in `posStyles.js` | — |
| PosDark (snapshot) | — | A theme state | Not built | No dark rules | — |
| PosPay (snapshot) | POS checkout panel | Payment sheet | Built | One-page checkout | — |
| PosKeypad (snapshot) | POS edit panel | Entry/approval sheet | Built | Pos.jsx:533-566 | — |
| PosSales (snapshot) | POS Held + Recent dialogs | Drawer | Built | Pos.jsx:1032-1066 | — |
| PosReturn (snapshot) | `/return-exchange` | Return/exchange workflow inside POS | Built differently | `/pos-return` → `/pos?panel=recent`; returns open the shared page | POS → Sales › Returns & exchanges |
| PosOpen (snapshot) | POS open-shift screen | Opening the register session | Partly built | Pos.jsx:490-498 | — |
| PosClose (snapshot) | POS close dialog | Closing the session | Partly built | Pos.jsx:503-513 | — |
| PosOffline (snapshot) | POS offline mode | Offline state | Partly built | Pos.jsx:214-218, 789 | — |
| PosRegister (snapshot) | `/dev/storyboards/pos-register` | Reference only | Built | — | — |
| PosSheet (snapshot) | — | Design-system reference | N/A | Not in this repo's design export | — |
| Idle/Active · products and customer | `/pos` | Stock "available here" and "elsewhere"; serial / weighed / pack badges; customer from CRM | Partly built | Stock per counter place; customer by mobile number; no "elsewhere", serial, weight or pack | — |
| Active · basket | `/pos` | One fixed pricing order; approval state; tax from setup; checks before Complete | Partly built | Fixed order line → cart → coupon → member → points → VAT; approver on the line; no serial or approval gates | — |
| Keypad | POS edit panel | Rules, limits and a reason; decimals only where the unit allows; approval sheet | Partly built | Lower price or bigger discount needs a manager PIN; discount cap; whole units only; no reason | — |
| Pay | POS checkout | Remove Due/credit from payment buttons; pick the exact terminal/account; failure and retry | Built differently | Cash / Card / bKash / Nagad / Rocket / Due / Wallet; split payments; one card account | — |
| Sales · Held | Held dialog | Hold reason, expiry, stock reservation, lock across registers | Not built | Resume only | — |
| Sales · Recent | Recent dialog | Reprint keeps the same number; a paid sale can't be reopened | Built | Reprint creates no new sale | — |
| Return | Return & exchange | Window and fees from policy; item disposition; serial match; no-receipt return with permission | Built differently | One page for all channels; window from settings + PIN; "sell again" yes/no; no fee, serial or no-receipt return | POS → Returns & exchanges |
| Open | POS open shift | Float tied to a money source; prior-shift warning; drawer lock; blind count | Not built | Counter, cashier and a typed float; nothing posted to the money ledger | — |
| Close | POS close | Variance limit from policy; non-cash per account; handover; manager approval; unsynced warning | Partly built | Expected vs counted, totals by method, note; difference saved with the shift; variance report exists | — |
| Offline | `/pos` | What works offline (by terminal); local IDs; queue and sync states | Partly built | Cash only, with a banner; no queue | — |
| Tablet | POS responsive | Controls ≥44px; no separate logic | Built | — | — |
| Dark | — | Same components, accessible contrast | Not built | — | — |
| Register / Sheet references | Dev storyboard | Reference only | Partly built | Register reference exists; no sheet | — |
| Return rule: "within 7 days" | Return & exchange | From policy | Built | Return-days setting in POS manage | — |
| Return rule: "perishable — not returnable" | — | Policy result plus an allowed exception | Not built | Only in the old, unused POS return screen | — |
| Return rule: promotion clawback | Return & exchange | Worked out from the promotion snapshot | Built differently | Refund = the customer's paid share after all discounts | — |
| Return rule: VAT reversal | Return & exchange | Original tax snapshot | Built | Sale's own VAT rate | — |
| Return rule: restocking fee | — | From policy, auditable | Not built | — | — |
| Return rule: original card | Return & exchange | Refund through the provider | Built differently | Card refund posted to the card account | — |
| Return rule: cash from drawer | Return & exchange | Refund + drawer outflow | Built | Shift report counts cash refunds | — |
| Return rule: store credit + bonus | Return & exchange → wallet | Owned by the credit programme | Partly built | Store credit goes to the customer wallet; no bonus | — |
| Return rule: returned stock | Return & exchange | Available / Quarantine / Damaged | Partly built | Back on sale or damaged bay | — |
| Return rule: serial/IMEI | — | Must match the unit sold | Not built | — | — |
| Action: main register | `/pos` | Stock at this place; tracked/weighed items | Partly built | Place yes; tracked/weighed no | — |
| Action: tablet / dark | `/pos` | One state engine | Partly built | Responsive yes; dark no | — |
| Action: availability | `/pos` | Here + elsewhere | Partly built | No "elsewhere" | — |
| Action: barcode | `/pos` | Variant, internal, GTIN and pack codes; duplicates; repeat scans | Partly built | Matches barcode/SKU/name; repeat scan adds qty; several matches → message | — |
| Action: weighed goods | — | Decimal by unit and scale barcode | Not built | — | — |
| Action: serial/IMEI | — | Capture before completing | Not built | Products are flagged IMEI/Serial but POS ignores it | — |
| Action: pricing | `/pos` | Fixed stacking + snapshot | Partly built | List price lost after an override | — |
| Action: manager approval | `ManagerPin.jsx` | Named approver; re-checked if the basket changes | Partly built | Named manager + demo PIN 1234 + audit log; no re-check | — |
| Action: tax | `vat.js` | Tax snapshot per line | Built differently | VAT rates by category (Money › VAT) | — |
| Action: Pay | `/pos` | Exact account/terminal; offline-aware | Partly built | Ledger posting per method; no terminal chooser | — |
| Action: Due / credit | `/pos` | Remove from payment buttons; separate "Sell on credit" | Built differently | Kept as a payment button; needs a customer and a credit-limit PIN; creates an unpaid invoice | — |
| Action: held sales | `/pos` | Expiry by reason; ownership lock | Not built | — | — |
| Action: recent sales | `/pos` | Reprint same document; not editable | Built | — | — |
| Action: returns | Return & exchange | Eligibility from policy, disposition, serial | Built differently | Separate shared page | POS → Returns & exchanges |
| Action: opening | `/pos` | Float source; drawer ownership | Not built | — | — |
| Action: cash movement | POS cash panel | Add float · drop to safe · payout → Finance | Built | Pickup / cash in / paid out posted to the ledger; pickup limit | — |
| Action: closing | `/pos` | Configurable variance, manager, handover | Partly built | — | — |
| Action: offline | `/pos` | Local IDs, safe sync, capability matrix | Partly built | — | — |
| Action: offline card | `/pos` | Card only when the terminal supports it | Built differently | All non-cash payments blocked offline | — |
| Action: hardware | POS header | Hardware status sheet; terminal, scale, customer display | Partly built | Fixed Online / Printer / Drawer chips; printer per counter | — |
| Action: permissions | POS / ManagerPin | Controls for discount, return, drawer, cash, offline card, negative stock, variance | Partly built | PIN for price, discount, credit and late return; negative stock per place; void audited | — |
| Action: navigation | `/pos` | One POS destination | Built | Old `/pos-*` routes redirect; `/pos-manage` is a separate menu item | — |

#### New capabilities in #8

| Proposal | Status | Evidence / note |
|---|---|---|
| Serial/IMEI capture sheet | Not built | — |
| Weighed item / scale barcode review | Not built | — |
| Manager approval sheet (identified, permissioned, re-checked) | Partly built | ManagerPin |
| Payment account / terminal chooser | Not built | One card account |
| Cash movement sheet | Built | — |
| Hardware status sheet | Not built | Fixed chips |
| Offline sync result / conflict view | Not built | — |
| "Sell on credit" as its own action | Built differently | Due/credit payment button |
| Register / counter / device / drawer / session as separate objects | Partly built | Counters (place, printer, float, staff) and shifts; one shared drawer account; no device object |
| Expected drawer cash formula | Built | `posStore.js:125` |
| Float source and opening-difference event | Not built | — |
| Variance policy + posting approved shortage/overage | Not built | Difference saved on the shift only |
| Safe completion (stable operation ID, no duplicates on retry) | Not built | Front-end demo |
| Held-sale stock reservation with expiry | Not built | — |
| "Elsewhere" stock + fulfil from another place | Not built | — |
| Negative-stock policy | Built | Per place |
| Walk-in sale without a fake customer | Built | — |
| No-sale drawer open (permission + audit) | Not built | — |
| *Build-only:* keyboard shortcuts (F1 list) | Built | Pos.jsx:99-108 |
| *Build-only:* POS back office (counters, staff, shifts, pickups, settings) | Built | `/pos-manage` |

#### Built differently / conflicts in #8

- **Returns.** The brief keeps the return screen inside POS. Today returns are one shared page (`/return-exchange`); POS holds the current sale, then opens it.
- **Due / credit.** Today it is a payment button, guarded by "require full payment", the credit limit and a manager PIN. The brief removes it from the payment buttons.
- **Offline.** Today all non-cash payments are blocked offline. The brief wants a capability list per terminal and provider.
- **Tax.** Today VAT is set by product category. The brief wants a tax class per product, kept as a snapshot.
- **Manager approval.** Today it is a named manager with one demo PIN. The brief wants the PIN tied to a real staff identity.
- **Extra page.** The brief says "no new permanent POS page". Today `/pos-manage` is its own menu item.
- **Old baseline.** The brief describes:
  - a denomination count;
  - a 12-hour hold expiry;
  - a ৳200 variance limit;
  - "Card still works" offline;
  - company-wide stock.

  The build has none of these, and it already shows stock per place.

Coverage: brief tables 58 rows · reported 58.


### Orders · #12 Support, Returns, Warranty & After-sales

*Brief v1.0, 30 Sep.*

**Nayeem's decision.** Two main workspaces:
- **Support Tickets**, the support work queue;
- **After-sales Cases**, grown from Warranty claims, with Returns & Exchanges / Warranty / Repairs views.

A ticket, an after-sales case and a refund are separate records that link to each other. Warranty *policies* move to Product, supplier returns stay in Purchase, and the POS return screen uses this engine.

**Owns:**
- tickets (status, priority, team, SLA);
- return/exchange and warranty/service cases;
- eligibility, inspection and the remedy decision;
- repair coordination;
- reverse-logistics requests;
- return rules.

**Does not own:** conversations, the warranty-policy definition, supplier returns, couriers, refund execution, stock and serial master, replacement fulfilment, store credit, promotion maths, customers, cash.

**Today:**
- Returns are immediate transactions in `/return-exchange`, recorded in `/return-history` (`src/lib/returns.js`).
- Courier RTO is received in `/courier-returns`.
- Warranty claims and Support tickets are design-level pages with no data behind them.

#### Screen by screen

| Brief's area | Today in the build | Nayeem proposes | Status | Evidence | UX move |
|---|---|---|---|---|---|
| SupportTickets (snapshot) | `/support-tickets` | Keep as the main support desk | Built | Static design demo; Customer support › Support tickets | — |
| WarrantyClaims (snapshot) | `/warranty-claims` | Grow into After-sales Cases | Not built | Still "Warranty claims & serials" with 2 tabs | More stock tools → After-sales Cases |
| WarrantyPolicies (snapshot) | `/warranty-policies` | Owner moves to Product | Partly built | Product form picks a policy; Catalog setup lists policies; the page sits under More stock tools | More stock tools → Product |
| PosReturn (snapshot) | `/return-exchange` | Keep the POS screen; use this engine | Built differently | One page for all channels | POS → Sales › Returns & exchanges |
| SupplierReturn (snapshot) | `/supplier-return` | Purchase only | Built | Opened from Suppliers and Damaged & expired | — |
| MerchantInbox (snapshot) | `/merchant-inbox` | Can create or link a ticket or case | Not built | Customer panel offers "New order" only | — |
| CustomerCRM (snapshot) | Customer profile | Shows a summary only | Built | Support tickets tab and returns timeline (static) | — |
| Support tickets · board/list | `/support-tickets` | Add Reopened and a waiting reason; configurable views; queue age | Not built | Static statuses New / Assigned / In progress / Waiting on customer / Solved | — |
| Support tickets · ticket detail | `/support-tickets` | Linked cases, type, resolution, first-response and resolution SLA, remedy shortcuts | Not built | Static "First reply 12m"; buttons do nothing | — |
| Support tickets · statuses | `/support-tickets` | Add Closed and Reopened; waiting reason as its own field | Not built | "Waiting on courier" is a static badge | — |
| Warranty claims · lookup | `/warranty-claims` | Warranty mode inside After-sales; policy version, provider, eligibility | Partly built | Lookup + "Within warranty · policy v2 · proof"; still standalone | — |
| Warranty claims · list/detail | `/warranty-claims` | After-sales Cases with case types and separate states | Not built | Repair steps only | — |
| Warranty claims · Repair / Replace / Refund / Credit / Reject | `/warranty-claims` | A standard remedy engine with execution status | Not built | Design buttons only | — |
| Warranty claims · serial/IMEI register | `/warranty-claims` | Serial master moves to Inventory | Not built | Still on the claims page | Claims page → Inventory |
| Warranty claims · expiry SMS | `/warranty-claims` | Send a "warranty expiring" event to Communications | Not built | Switch on the page; no such event in `notifications.js` | — |
| Warranty policies | `/warranty-policies` | Product owns it; the case reads the policy as sold | Partly built | Product form picks a policy; definition page in stock tools | More stock tools → Product |
| POS return · sale lookup + lines | `/return-exchange` | Eligibility from return rules; a case created underneath | Built differently | Lookup by memo / invoice / order / phone; can't return more than is left; no case record | — |
| POS return · settlement | `/return-exchange` | Standard breakdown + approval limits | Partly built | Discount share and VAT included; exchange difference; no fee or shipping lines | — |
| POS return · "restock to Central Warehouse" | Return & exchange / Courier returns | 6 dispositions after inspection | Partly built | Two outcomes: back on sale or damaged bay | — |
| Supplier return | `/supplier-return` | Stay in Purchase; a case can raise a vendor reference | Partly built | No link from a case | — |
| Action: Support tickets | `/support-tickets` | Ticket model, waiting reason, Reopened, links, SLA | Not built | Static | — |
| Action: ticket messages | `/support-tickets` | Replies go through the Communications conversation | Not built | Static reply box; the Inbox is separate | — |
| Action: Warranty claims | `/warranty-claims` | Becomes After-sales Cases (3 views) | Not built | — | More stock tools → After-sales |
| Action: desktop returns queue | `/return-exchange`, `/return-history` | Views inside After-sales | Built differently | Sales › Returns & exchanges + Return history | — |
| Action: return rules | POS manage setting | Versioned policy shown through Settings | Partly built | One "return within N days" setting | — |
| Action: warranty policies | Policies page / Add product | Product owns them | Partly built | — | More stock tools → Product |
| Action: serial/IMEI master | `/warranty-claims` | Remove from After-sales | Not built | — | — |
| Action: POS return | `/return-exchange` | Same engine behind the cashier screen | Built differently | One page, no case engine | — |
| Action: return settlement | `/return-exchange` | Standard breakdown | Partly built | — | — |
| Action: physical return | Return & exchange / Courier returns | Inspection + disposition | Partly built | Good / damaged only | — |
| Action: reverse courier | — | After-sales requests a pickup; Orders books it | Not built | Courier RTO receiving only | — |
| Action: repair / service | `/warranty-claims` | A repair-job child workflow | Partly built | Demo steps Received → Inspecting → Sent to brand → Repairing → Ready → Returned | — |
| Action: supplier warranty recovery | Supplier return | Link only | Partly built | "Sent to brand" step; no link | — |
| Action: refund | `/return-exchange` | After-sales approves; Payments executes | Built differently | Refund posts to the ledger as soon as the return is confirmed | — |
| Action: store credit | Return & exchange → loyalty | After-sales approves; Loyalty issues | Built differently | The wallet reads the return rows | — |
| Action: CSAT | `/support-tickets` | Trigger / send / report | Not built | Static "CSAT 4.7" | — |
| Action: self-service | Storefront | Customer requests and tracks a return | Not built | Storefront has Checkout / Offers / Order link only | — |

#### New capabilities in #12

| Proposal | Status | Evidence / note |
|---|---|---|
| After-sales Cases workspace (Returns & Exchanges · Warranty · Repairs) | Not built | — |
| Case + case-item records with their own IDs | Not built | Return rows (`RT-xxxx`) are finished transactions |
| 3 state dimensions (case / item custody / remedy execution) | Not built | — |
| Eligibility snapshot with reasons | Partly built | Return-window notice; warranty demo text |
| Inspection record | Not built | — |
| 7 dispositions | Partly built | Restock or damaged bay → Damaged & expired → supplier return |
| Settlement breakdown (lines, promo, tax, shipping, fee, adjustment) | Partly built | Return & exchange |
| Remedies: refund / exchange / replacement / repair / store credit / reject | Partly built | Returns: refund, exchange, store credit, cut from due. Claims demo: repair, replace, refund, credit, reject |
| Approval limits (amount / reason / role) | Partly built | Late-return PIN only |
| Reverse logistics (drop-off / pickup / ship back / on-site / service centre) | Not built | — |
| Return & exchange rules (9 settings, versioned) | Partly built | One setting: days |
| Warranty policy "as sold" by version | Partly built | Policy version history in the design; no data model |
| SLA policy (first response, resolution, pause, hours, escalation) | Not built | — |
| CSAT trigger | Not built | — |
| Customer self-service | Not built | — |
| Ticket model (type, waiting reason, Closed/Reopened, SLA snapshot) | Not built | — |
| Ticket ↔ case links | Not built | — |
| Guard against returning the same item twice | Partly built | Quantity guard; no serial |
| *Build-only:* one return history across all channels | Built | `/return-history` |
| "Warranty expiring" event to Communications | Not built | — |
| Vendor RMA linked from a case | Not built | — |

#### Built differently / conflicts in #12

- **No case object today.**
  - Returns are immediate transactions.
  - Courier RTO writes "Courier return (RTO)" rows into the same return history, while the Sales brief says RTO must not create a customer return case.
  - Warranty claims are a design-level page under Products & stock.
- **Three homes for warranty policy today:** the policy page under stock tools, "Made in Settings" in Catalog setup, and the picker on the product form. The brief puts ownership in Product.
- **Return rules, three answers:**
  - the Support brief says After-sales owns them, shown in Settings;
  - the POS brief calls the window a product/merchant policy;
  - today the return window sits in POS manage and applies to every channel.
- **Old baseline.**
  - The brief says no desktop returns queue exists. Today there are Return & exchange, Return history and Courier returns.
  - `PosReturn` now redirects.

Coverage: brief tables 37 rows · reported 37.


### Products · #1 Product

*Brief v4.4, 28 Sep (freeze candidate).*

**Nayeem's decision.**
- One dynamic Product Editor. The product's format, template, category, stock behaviour, selling mode and publishing decide which fields appear.
- Keep the five existing Product screens.
- Bulk Edit, Manage Publishing, Variant Editor and View-all Product Data become drawers or child workspaces, not new menu pages.

**Owns:**
- identity and content;
- media;
- category and brand;
- variants;
- structured data;
- format;
- base price and MRP;
- SKU and identifiers;
- units and packs;
- product SEO;
- publishing availability;
- the customer-facing warranty policy.

**Does not own:** stock and movements, batch/serial instances, supplier terms and purchase cost, negotiated or customer-group pricing, discounts, tax setup, warranty claims, global navigation.

**Today:** `/all-products` (`AllProducts.jsx`), `/add-product` (`AddProduct.jsx`), `/categories`, `/catalog-setup`, plus Customer catalogue and Media library in the Products menu. Product data: `src/lib/products.js`; cost: `src/lib/productCost.js`.

#### Screen by screen

| Brief's area | Today in the build | Nayeem proposes | Status | Evidence | UX move |
|---|---|---|---|---|---|
| All products | `/all-products` | Keep KPIs, table, filters, AI fill, bulk bar, import/export. Change: Bulk edit; Missing info clickable; Archive as the default delete; hide Own/Seller. Add: saved views, columns, select all matching, duplicate, quality/channel/format filters, job progress | Partly built | Missing-info tab; No SKU / barcode / category filters; channel filter and bulk publish. No bulk editor, saved views or duplicate. Import CSV is a message only | — |
| Add product | `/add-product` | Estimated cost + live cost; GTIN apart from internal barcode; preorder ≠ backorder; Manage Publishing; fix warranty copy; hide seller. Add format, identifiers, units, variant editor, data drawer, Google readiness, handle, social SEO, history | Partly built | Sales channels card replaced the "Sell on" boxes; no seller. Still "Buying price (cost)", one "Barcode (EAN-13) · Make one", a "pre-order" box and "Details are managed in Stock" | Sell-on boxes → Sales channels card (done) |
| Add product (tabbed version) | `/add-product-tabs` | Not the default editor; a library of controls. Remove Add batch / Batches in stock; near-expiry discount → Promotions | Partly built | Not in the menu, route kept; still has near-expiry discount, batches and "Sold by" | — |
| Categories | `/categories` | Stock-behaviour defaults instead of "Track by"; hide seller commission; show inheritance impact; add category SEO, template defaults, channel taxonomy | Not built | "Track by" and "Seller commission" remain; web-address field exists; no SEO or template | — |
| Catalog setup | `/catalog-setup` | Warranty policies managed here; Units → Units & Packaging; typed fields; add templates, spec library, identifier types, field properties, pack conversions | Not built | Same sections as the design. Warranty says "Made in Settings" | Warranty → Catalog setup (proposed) |
| Action: All products bulk | `/all-products` | Spreadsheet Bulk Editor | Not built | Bulk bar = AI fill, category, labels, archive, delete, channels | — |
| Action: selection | `/all-products` | Select all matching, saved views, job progress | Not built | Page-level "Select all" only | — |
| Action: data quality | `/all-products` | Missing info as a work queue | Partly built | Tab uses a demo flag; untagged filters exist | — |
| Action: publishing | Add product + Sales channels | Manage Publishing drawer (channel, catalogue, place, variant, readiness) | Built differently | Per-channel switch, status and Fix; bulk publish; no catalogues, places or variant exceptions | — |
| Action: barcode / GTIN | `/add-product` | Manufacturer GTIN apart from a generated internal code | Not built | One field; "Make one" generates a code that Google Merchant then treats as a GTIN | — |
| Action: variants | `/add-product` | Inline fields + Variant Editor; stock read-only | Partly built | Price / Stock / SKU / Barcode display only; wholesale and MOQ editable | — |
| Action: inventory card | `/add-product` | Policy only; opening stock posts a ledger move | Not built | Static Available/Reserved; opening stock not wired | — |
| Action: expiry | Add product + `batches.js` | Policy in Product; batches in Inventory | Partly built | Expiry policy card; batches from purchases; tabbed editor still has batches | Batches → Damaged & expired (done) |
| Action: near-expiry discount | — | Link to Promotions | Partly built | Only in the tabbed editor | — |
| Action: warranty | Add product / Catalog setup | One source in Catalog setup; fix copy | Not built | "managed in Stock", "Written once in Stock › Warranty policies", "Made in Settings": three homes named | — |
| Action: supplier | `/add-product` | Read-only preferred supplier and last cost | Not built | — | — |
| Action: cost | Add product + `productCost.js` | "Estimated/default cost"; show live cost | Built differently | "Buying price (cost)" required; calculations already prefer the latest purchase price | — |
| Action: wholesale pricing | `/add-product` | Summary only; price lists belong to Sales/CRM | Built differently | Wholesale price and MOQ per product and variant (gated by Stock setup); customer price lists in `customers.js` | — |
| Action: preorder | `/add-product` | Separate backorder and preorder | Not built | One "keep selling when out of stock (pre-order)" | — |
| Action: product data | Add product + Catalog setup | Typed fields, templates, overrides, View-all drawer | Partly built | Category fields + "add a field just for this product"; typed custom fields; no templates | — |
| Action: Catalog setup | `/catalog-setup` | Templates, spec library, units & packaging, identifier types | Not built | — | — |
| Action: Categories | `/categories` | SEO, template defaults, inheritance; gate commission | Not built | — | — |
| Action: SEO | `/add-product` | Editable handle, social preview, readiness | Partly built | Title/meta with AI; handle shown only | — |
| Action: Google product data | Sales channels | GMC category, GTIN, brand, MPN, condition | Partly built | Issue list: missing GTIN, photo, size, price, shipping | — |
| Action: marketplace leftovers | Products | Hide or remove | Partly built | Gone from Add/All products; still in Categories and the tabbed editor | — |
| Action: tabbed editor | `/add-product-tabs` | De-emphasise | Partly built | Out of the menu | — |
| Action: navigation | Products menu | Product menu lists product destinations only | Built | Products submenu is product-only | — |
| Action: Bangladesh copy | `/add-product` | "PTA approved" → NEIR/BTRC | Not built | "PTA approved" appears 4 times | — |
| Menu: All products | `/all-products` | Keep | Built | — | — |
| Menu: Add product | `/add-product` | An action button, not a menu item | Built differently | Menu item kept | Menu item → "+ Add product" button |
| Menu: Categories | `/categories` | Keep | Built | — | — |
| Menu: Catalog setup | `/catalog-setup` | Keep as the setup hub | Built | Without warranty | — |
| Menu: Collections | alias → Categories | No new screen | Built | Free-text Collections field | — |
| Menu: Inventory / Low stock / Barcode labels | Stock, Barcode labels | Not Product menu items | Built | Separate items with aliases | — |
| Menu: Purchase orders / Suppliers | `/purchase-orders`, `/suppliers` | Not Product menu items | Built | Separate items in "Products & stock" | — |
| Menu: Media library | `/set-media` | No new screen | Built differently | Products › Media library | Settings media → Products menu (done) |

#### New capabilities in #1

| Proposal | Status | Evidence / note |
|---|---|---|
| Independent dimensions: format, template, category, stock behaviour, selling mode, sellability | Partly built | Only Sell-to (retail / wholesale / both) and category fields |
| 19 product templates + Custom; defaults business → category → product | Not built | — |
| Specification engine (groups, 3 field levels, field properties) | Partly built | Custom fields with type, required, shown, filter and AI flags |
| Field value precedence and source labels | Not built | — |
| Visibility levels Core / Contextual / Advanced / Module-gated | Built differently | Edition modules; Stock setup hides wholesale fields |
| Merchant-profile capability presets | Built differently | System picker and editions; Stock setup buying mode |
| Identifier & scan model (alternate, variant, supplier, pack, PLU, scale, MPN, ISBN) | Not built | One barcode; IMEI/Serial only as flags |
| Barcode → unit/pack; Units & Packaging conversions | Not built | Single unit |
| Preorder vs backorder; gift-only SKU; bundles | Not built | — |
| Digital / licence formats | Not built | — |
| Spreadsheet bulk editor (formulas, preview, rollback, jobs, audit) | Not built | — |
| Channel registry instead of a column per channel | Built | `channels.js` (Meta, Google, Woo, Shopify, Google Business) |
| Google listing readiness | Partly built | Issue / fix list |
| Duplicate SKU/barcode blocking | Built | `products.js` `codeOwner` |
| Archive instead of delete; frozen transaction snapshots | Partly built | Deleted tab with restore; cost frozen on sale lines |
| Autosave and draft recovery | Not built | Unsaved-changes guard and Save as draft |
| Optimistic lock, approvals, version history | Not built | — |
| Product relationship graph | Not built | — |
| Import validation (mapping, dry run, row errors) | Not built | Import is a message; CSV export works |
| Duplicate product | Not built | — |
| Scheduled publish | Built | "Go live on a date" |

#### Built differently / conflicts in #1

- **Warranty policy home.** The brief wants it in Catalog setup. Today the page is under Products & stock › More stock tools, while Add product says "Stock" and Catalog setup says "Settings".
- **Wholesale pricing.** The brief keeps only a summary in Product. Today wholesale price and MOQ are stored on each product and variant, and customer price lists exist too.
- **Cost label.** Today it reads "Buying price (cost)", and profit uses the latest purchase price. The brief wants "estimated/default cost".
- **Generated barcodes.** A barcode made with "Make one" can reach Google as a GTIN.
- **Publishing scope.** Today: Meta, Google, WooCommerce and Shopify per product and in bulk. The brief's publishing adds TikTok, catalogues, places and per-variant exceptions, and does not mention WooCommerce or Shopify.
- **Old baseline.** The brief counts five Product screens; today Customer catalogue and Media library are also in the Products menu.
- **Inside the brief.** Its sidebar mock puts Inventory, POs and Transfers under Products, while its own navigation table says they are not Product items.

Coverage: brief tables 36 rows (5 + 23 + 8) · reported 36.


### Products · #2 Inventory

*Brief v1.3, 28 Sep (freeze candidate).*

**Nayeem's decision.**
- **One immutable Inventory Ledger is the only quantity truth.** Every other screen triggers or shows inventory operations.
- Refine the existing screens: Stock Changes becomes **Stock Activity**, and Replenishment becomes a saved view inside Stock.
- No new permanent pages.

**Owns:**
- the ledger and stock states;
- reservations, adjustments, counts and transfers;
- locations, zones, racks and bins;
- lot, serial and IMEI tracing;
- expiry custody and disposal;
- internal labels;
- reorder suggestions.

**Does not own:** supplier/PO/GRN workflow, warranty policy and claims, vendor RMA, promotions, cash and P&L, branch cash and POS setup, branch profile, tax.

**Today:**
- Stock is `src/lib/stock.js`: on hand / held / available / in transit, plus a list of stock moves.
- Holds live in `stockHolds.js` and places in `locations.js`.
- One-place vs many-places mode comes from `stockSetup.js`.

#### Screen by screen

| Brief's area | Today in the build | Nayeem proposes | Status | Evidence | UX move |
|---|---|---|---|---|---|
| Stock | `/stock` | State columns; "inventory locations"; "Inventory cost"; saved views. Add On hand / Available / Committed / Unavailable / Incoming, detail drawer, Replenishment view, ageing filters | Partly built | On hand / Held / Available / In transit from `stockAt`; "at real cost"; per-product history. No Incoming or Unavailable column, no saved views | — |
| Stock Changes | Nearest: `/stock-adjustments` | Becomes Stock Activity covering all movements | Not built | Adjustments only; moves are stored but no screen lists them all | — |
| Stock count | `/stock-count` | Quick / Blind / Cycle / Full modes, snapshot, recount, batch/serial, several counters | Not built | One mode; "Don't look at the system number" next to a "System says" column; selling paused during a count; PIN posts the count | — |
| Report damage | Holds, Damaged & expired, Receive goods | Change state, not location; disposition | Built differently | A damaged hold moves pieces to a "Returns & damaged" bay; write off / send back / repaired; the "Record damage" drawer is a message only | Damage reporting split across 3 screens |
| Transfers + New transfer | `/transfers`, `/new-transfer` | In-transit custody; partial dispatch/receipt; discrepancy; approval; serial/batch | Built differently | Stock stays at the sender until scan-in; short lines written off / claimed / found; copy says "Stock goes down when you send" | — |
| Expiry & disposal | `/expiry-disposal` (Damaged & expired) | Keep; remove duplicate engines; fix "keep selling"; soften BSTI copy | Built differently | Rebuilt as an Expiry panel (batches, write off) + Damaged panel; no FEFO list, discount, witness or BSTI | — |
| Warehouses | `/warehouses` | Keep zones, quarantine, pick, cadence; add capability profile and negative-stock policy | Built differently | Place cards with live stock, "receives deliveries" and negative-stock switches; no zones or pick | — |
| Branches | `/branches` | Inventory keeps only stock, allocation and replenishment | Built differently | Stock, hours, manager, read-only counters and today's POS sales | Counters and cash → POS manage (done) |
| Racks | `/racks` | Module-gated; moves/counts post to the ledger; put-away hints | Partly built | Rack → shelf → bin with capacity; bins kept apart from stock moves; gated by the `places` module | — |
| Barcode labels | `/barcode-labels` | "Internal barcode" wording; label sources | Not built | Design data; "make" and "print" are messages | — |
| Mobile receive | `/mobile-receive` | Not Inventory-owned | Partly built | In the `purchasing` module; design mock | — |
| Warranty claims | `/warranty-claims` | Split tracing out; claims → After-sales | Not built | Mock under More stock tools | — |
| Warranty policies | `/warranty-policies` | Move to Product / Catalog setup | Not built | Mock with versions under More stock tools | — |
| Structure | `/dev/structure` | Reference only | Built | Dev reference page | — |
| Action: Stock | `/stock` | Five explicit quantities | Partly built | Held / Available / In transit; damaged counted but no column | — |
| Action: stock value | `/stock` | Inventory cost with its basis | Not built | "at real cost" | — |
| Action: Stock changes | — | Stock Activity | Not built | — | — |
| Action: damage/loss | Holds / bay | Available → Unavailable; on hand unchanged | Built differently | Moved to the damaged-bay place | — |
| Action: damage location | Holds | Physical places only | Built | No "Online orders" place | — |
| Action: stock count | `/stock-count` | Modes, snapshot, recount | Not built | — | — |
| Action: transfers | `/transfers` | In transit, partial receipt, discrepancy | Built differently | Short handling exists; no in-transit at dispatch | — |
| Action: expiry & disposal | `/expiry-disposal` | Inventory owns hold and disposal | Partly built | Write-off move; supplier-return link; no Promotions or Comms links | — |
| Action: expiry "keep selling" | — | Near-expiry only | N/A | No such action today | — |
| Action: compliance copy | — | Neutral audit wording | N/A | No BSTI/VAT copy today | — |
| Action: Warehouses | `/warehouses` | One location engine | Built | `locations.js` | — |
| Action: Branches | `/branches` | Split ownership | Partly built | POS and cash moved to POS manage | — |
| Action: walk-in reserve | — | Allocation policy | Not built | — | — |
| Action: racks & bins | `/racks` | Advanced; same ledger | Partly built | Separate bin data | — |
| Action: barcode labels | `/barcode-labels` | Product-owned internal barcode | Not built | Mock | — |
| Action: mobile receive | `/mobile-receive` | Purchase owns it | Partly built | Mock | — |
| Action: warranty claims | `/warranty-claims` | Split | Not built | — | — |
| Action: warranty policies | `/warranty-policies` | Move to Product | Not built | — | — |
| Action: replenishment | Stock banner + Reports | Saved view inside Stock | Built differently | "X products need buying" banner → New PO; Reports › Low stock & reorder | Replenishment lives in Reports today |
| Action: safety / channel reserve | — | Policies, not states | Not built | — | — |
| Action: external custody | — | Custody dimension | Not built | — | — |
| Action: kitting | — | Bundle vs kit | Not built | — | — |
| Action: global navigation | Menu | Inventory destinations only | Built differently | One "Products & stock" group mixing product, stock and purchase items | — |
| Menu: Stock | `/stock` | Keep + Replenishment view | Partly built | View is in Reports | — |
| Menu: Stock Activity | — | Use Stock Changes | Not built | — | — |
| Menu: Stock count | `/stock-count` | Four modes | Partly built | — | — |
| Menu: Transfers | `/transfers` | Only when there are several places | Built | `places` module | — |
| Menu: Expiry & disposal | `/expiry-disposal` | Contextual (only with expiry-tracked stock) | Built differently | Always in the menu | — |
| Menu: Warehouses / Racks | `/warehouses`, `/racks` | Advanced, module-gated | Built | Hidden in the Online edition | — |
| Menu: Branches | `/branches` | Shared screen | Partly built | — | — |
| Menu: Barcode labels | `/barcode-labels` | Keep | Built | Screen is a mock | — |
| Menu: serial/IMEI tracing | — | Contextual child workspace | Not built | — | — |
| Menu: Receive goods / Mobile receive | `/receive-goods` | Not Inventory items | Built differently | `purchasing` module, same menu group | — |
| Menu: Warranty claims / policies | More stock tools | Not Inventory items | Not built | Still there | — |

#### New capabilities in #2

| Proposal | Status | Evidence / note |
|---|---|---|
| Immutable ledger with balances worked out from it | Partly built | Demo base counts + moves (sku, place, qty, kind, reason, by, ref); no from/to, unit cost or running balance |
| Several explicit quantities | Partly built | on hand / held / damaged / available / in transit |
| Reservations (Committed) | Built differently | Hold on approval; the Online edition takes stock out on approval (may go below zero) |
| Stock Activity filters (reference, user, batch, serial) | Not built | — |
| One location engine with virtual locations | Partly built | One place list + damaged bay; no In transit / Quarantine / Receiving / External places |
| Online store as a channel, not a place | Built | `onlinePlace()` = a real home place |
| Count sessions (scope, snapshot, attribution) | Not built | — |
| Transfer lifecycle | Partly built | draft / on the way / received + short handling |
| Batch record and FEFO | Partly built | Batches from direct purchases only; earliest expiry assumed sold first |
| Replenishment formula | Partly built | Report uses velocity, days of cover and on order |
| Insights (dead stock, ageing, expiry risk, valuation) | Built (as reports) | slow-moving, ageing, damaged & expired, valuation at a date, shrinkage |
| Base-unit normalisation | Not built | — |
| Serial/IMEI unit trace | Not built | — |
| External custody / vendor RMA | Not built | — |
| Virtual bundles and physical kits | Not built | — |
| Adjustment approval (rejection posts nothing) | Built | `stockAdjustments.js` |
| Negative-stock policy per place | Built | `stock.js` |
| Can't close a place that holds stock | Built | `placeShared.jsx` |
| Idempotency keys / offline queue | Not built | Front-end demo |
| *Build-only:* one-place mode and stock merge | Built | `stockSetup.js`, `stockMerge.js` |

#### Built differently / conflicts in #2

- **Transfers.**
  - The brief moves stock to "in transit" at dispatch.
  - Today it stays at the sender until scan-in and shows as "in transit" at the receiver.
  - Today's New transfer copy ("Stock goes down when you send") does not match the build's own logic.
- **Damage.** The brief keeps damaged stock at the same place as *unavailable*. Today it moves to a separate "Returns & damaged" bay place.
- **Counts.** The brief counts from a snapshot while selling continues. Today selling pauses at the place during a count.
- **Module split.** The brief has one Inventory package. Today it is split into `catalog`, `places` and `purchasing` (so the Online edition can hide places).
- **Old baseline.**
  - Stock Changes and Report Damage never existed in this repo.
  - Expiry & disposal is the merged version.
  - Warehouses and Branches have been rewritten.
- **Overlap.** "Suggest a transfer before buying" appears in both this brief's Replenishment and the Purchase brief's Buying Run.

Coverage: brief tables 48 rows (14 + 23 + 11) · reported 48.


### Products · #3 Purchase & Suppliers

*Brief v1.1, 28 Sep (freeze candidate).*

**Nayeem's decision.**
- One procurement engine with several ways in: quick, PO, request, replenishment, RFQ and agreement.
- **PO ≠ goods receipt (GRN) ≠ supplier bill ≠ payment.**
- Purchase orders becomes **"Purchases"**, and New PO gets a **Quick Purchase** mode.
- Bills, three-way matching, buying runs and RFQ are child workspaces.

**Owns:**
- supplier master and supplier–product terms;
- requests;
- quick purchase;
- POs and amendments;
- the goods-receipt document;
- supplier bills;
- what you owe suppliers;
- credits and advances;
- payment allocation;
- purchase returns;
- landed cost;
- supplier performance;
- supplier warranty terms.

**Does not own:** the stock ledger, cash and bank balances, customer warranty cases, product truth, roles, messaging, P&L.

**Today:**
- `/purchases` + `/buy-goods` for direct purchases.
- `/purchase-orders`, `/new-po`, `/po-detail` and `/receive-goods` for orders.
- `/suppliers`, `/supplier-detail` and `/supplier-return`.
- `/requests`.
- Supplier bills and payments live in `src/lib/supplierBills.js`.

#### Screen by screen

| Brief's area | Today in the build | Nayeem proposes | Status | Evidence | UX move |
|---|---|---|---|---|---|
| Suppliers | `/suppliers` | Real bills, ageing, advances; payment allocation linked to Finance | Built differently | Due-date tabs; pay from a ledger account; add supplier; return goods; no ageing buckets or advances | Bills → `/purchases`; ageing → Reports |
| Supplier detail | `/supplier-detail` | Statement reconciliation; add Products & Prices, Terms & Warranty, Performance | Partly built | Tabs Ledger / Bills / Payment history / Due dates / POs; running balance; no opening balance or advance | Performance and price history → Reports |
| Purchase orders | `/purchase-orders` | Rename to Purchases; intent chooser; separate receiving / billing / payment; configurable approval | Built differently | Items received / total / payment / status; "৳50,000" approval text; direct purchases on `/purchases` | Quick purchases → separate `/purchases` |
| New PO | `/new-po` | Two modes; inventory location; quotation ref; unit price; estimated landed cost; bonus | Not built | "Receive at warehouse", "Supplier invoice no.", "Real cost / unit", ৳50,000 limit | Quick mode → `/buy-goods` |
| PO detail | `/po-detail` | Drop "Closed after full payment"; separate states; record bill, variance, amendment | Not built | Stepper ends "Closed · after full payment" | — |
| Receive goods | `/receive-goods` | Challan ≠ bill; landed-cost impact; safe to retry; serial/batch/pack/bonus | Partly built | Over-delivery keep/return; damaged/wrong held at the bay; bill created automatically on save; no serial, batch or bonus | — |
| Supplier return | `/supplier-return` | Supplier credit / expected refund / replacement due | Partly built | Always a credit note on open bills | — |
| Requests | `/requests` | Check own stock first; transfer / buy / split / defer; Buying Run | Partly built | Approve → POs grouped by supplier; no own-stock check | — |
| Mobile receive | `/mobile-receive` | Keep under Purchase; serial/batch; offline queue | Partly built | Design mock | — |
| Structure | `/dev/structure` | Update lifecycle; "internal barcode" wording | Not built | — | — |
| Action: Purchase orders | `/purchase-orders` | Repurpose as Purchases | Built differently | Separate `/purchases` page | — |
| Action: Quick purchase | `/buy-goods` | A New PO mode; one save = receipt + bill + payment | Built differently | One save makes the bill, stock moves, payment, batches and buying price | New PO mode → Purchases › New purchase (done as its own page) |
| Action: Purchase from photo | — | AI draft from an invoice photo | Not built | — | — |
| Action: supplier invoice field on PO | `/new-po` | Use quotation/reference instead | Not built | — | — |
| Action: receiving location | `/new-po` | "Inventory location" wording | Partly built | Says "warehouse" but lists branches too | — |
| Action: PO cost field | `/new-po` | Estimated landed cost | Not built | — | — |
| Action: bonus quantity | — | Free qty apart from paid qty | Not built | — | — |
| Action: approval | `/new-po` | Configurable policy | Not built | Fixed ৳50,000 | — |
| Action: PO lifecycle | `/po-detail` | Closing not tied to payment | Not built | — | — |
| Action: PO states | PO list / detail | Five separate state dimensions | Partly built | List shows receiving and payment; detail has one stepper | — |
| Action: PO amendment | — | Versions | Not built | — | — |
| Action: Receive goods | `/receive-goods` | Keep and harden | Partly built | — | — |
| Action: supplier bill | `supplierBills.js` | Child workspace; partial/combined bills; duplicate check | Built differently | Bills made automatically from receipts and direct buys; listed on `/purchases`; no duplicate check | — |
| Action: 3-way matching | Reports | PO ↔ receipt ↔ bill review | Not built | Only Reports › Receiving problems | — |
| Action: Suppliers | `/suppliers` | Ageing, advances, mismatch | Partly built | Ageing report | — |
| Action: Supplier detail | `/supplier-detail` | Products & Prices, Terms, Performance | Partly built | Scorecard and price history are reports | — |
| Action: supplier–product terms | — | Supplier SKU, unit, MOQ, cost, lead time, warranty | Not built | Suppliers carry credit terms only | — |
| Action: pay supplier | Suppliers / Purchases | Allocation in Purchase + a Finance money move | Built | One action allocates and posts to the ledger; overpayment not kept as an advance | — |
| Action: supplier return | `/supplier-return` | Credit / refund / replacement | Partly built | Credit only | — |
| Action: requests | `/requests` | Transfer first; no double fulfilment | Not built | — | — |
| Action: Buying Run | `/requests` | Combine branch demand | Partly built | Several requests → POs by supplier | — |
| Action: RFQ / agreements | — | Advanced, hidden until on | Not built | — | — |
| Action: Mobile receive | `/mobile-receive` | Same rules as Receive goods | Partly built | Mock | — |
| Action: global navigation | Menu | Purchase destinations only | Built differently | Purchases, Receive goods, Purchase orders, Suppliers top-level; requests under More stock tools; shown/hidden by buying mode | — |
| Menu: Purchases | `/purchases` + `/purchase-orders` | Rename the PO screen | Built differently | Two separate pages | — |
| Menu: Suppliers & dues | `/suppliers` | Keep the four tabs | Built differently | Due-date tabs instead | — |
| Menu: staff requests | `/requests` | Keep when on | Built | `purchasing` module | — |
| Menu: Receive goods | `/receive-goods` | Keep as an action | Built | — | — |
| Menu: Supplier return | `/supplier-return` | Contextual, not a menu item | Built | Opened from Suppliers and Damaged & expired | — |
| Menu: Quick purchase | `/buy-goods` | Not a permanent page | Built differently | Own route, reached from Purchases | — |
| Menu: Supplier bills / 3-way match | — | Child workspace | Not built | — | — |
| Menu: Buying Run | `/requests` | Advanced child workspace | Partly built | Grouping only | — |
| Menu: RFQ / agreements | — | Advanced / contextual | Not built | — | — |

#### New capabilities in #3

| Proposal | Status | Evidence / note |
|---|---|---|
| PO, receipt, bill and payment as separate records | Partly built | PO deliveries carry receipt numbers; a bill per receipt; payments carry allocations |
| Quick purchase in one step | Built | `/buy-goods` |
| Five status dimensions | Partly built | Receiving and payment only |
| Full supplier master (code, credit limit, tax IDs, lead time, payout details, files) | Partly built | Name, phone, kind, terms, person, address |
| Supplier–product terms | Not built | — |
| AI invoice capture | Not built | — |
| Bill duplicate check; partial/combined bills | Not built | — |
| 3-way match with tolerances | Not built | — |
| Landed-cost allocation and later revaluation | Partly built | New PO extras split by value or pieces; receipt extras added to the bill; no revaluation |
| Cost layers (last purchase, moving average) | Partly built | Latest buying price only |
| Supplier credit applied to the oldest due first | Built | `supplierBills.js` |
| Supplier advance; expected refund; replacement due | Not built | — |
| Several payment methods linked to the money ledger | Built | `ledger.postEntry` |
| Ageing / performance / price history | Built (as reports) | Purchase reports |
| PO versions; configurable approval; split-order detection | Not built | — |
| Over / wrong / damaged on receipt | Built | `ReceiveGoods.jsx` |
| Serial/IMEI and batch capture on receipt | Partly built | Expiry dates on direct purchases only |
| Bonus / free quantity | Not built | — |
| Vendor RMA link | Not built | — |
| *Build-only:* buying mode direct / orders / both | Built | `stockSetup.js` |
| *Build-only:* "supplier takes back faulty items" flag | Built | `BuyGoods.jsx` |

#### Built differently / conflicts in #3

- **Quick purchase.**
  - The brief reuses New PO behind an intent chooser on a renamed Purchase orders page.
  - Today there are three separate pages: Purchases, New purchase and Purchase orders.
  - Buying mode shows or hides them.
- **Receiving makes the bill.**
  - The brief keeps the delivery challan as evidence only, with no bill by default.
  - Today a supplier bill is created on every Receive save.
- **Supplier returns.** Today these always issue a credit note, and they start from damaged stock in the bay, not from a chosen receipt.
- **Supplier insights.** Ageing, scorecard and price history are Reports today. The brief puts them on Suppliers and Supplier detail.
- **Old baseline.** The brief's Suppliers page (Bills to pay / Payments made / Returns tabs) has been rebuilt.
- **Overlap.** The Buying Run's "use spare stock elsewhere first" overlaps the Inventory brief's replenishment.

Coverage: brief tables 43 rows (10 + 24 + 9) · reported 43.


### Customers · #7 Customers & CRM

*Brief v1.0, 28 Sep.*

**Nayeem's decision.**
- CRM owns customer identity, relationships, segments, consent, controls and the 360° view.
- There is **one customer list** (All customers), **one Person/Company profile** (Customer CRM) and **one segment engine**.
- The old MerchantCustomers page is retired. The Recovery "Customer profile" becomes a source of insights only.

**Owns:**
- person and company identity, contact points and external IDs;
- type, status, contacts and company relationships;
- addresses and receivers;
- tags, custom fields and assigned staff;
- segments and consent facts;
- commerce restrictions;
- duplicate and merge history;
- notes, risk and history facts.

**Does not own:** order, payment and refund truth, receivables, the loyalty engine, message sending, support/return cases, recovery predictions, logins, raw analytics, the POS cashier UX.

**Today:**
- `/all-customers` (`AllCustomers.jsx`) and the profile `/customer-crm` (`CustomerCRM.jsx`, one demo profile).
- Customers are keyed by phone in `src/lib/customers.js`.
- Separate pages exist for `/customer-profile` (Recovery), `/wholesale-customer` and `/member-detail`.

#### Screen by screen

| Brief's area | Today in the build | Nayeem proposes | Status | Evidence | UX move |
|---|---|---|---|---|---|
| All customers (snapshot) | `/all-customers` | Keep as the only customer list | Built | Customers → All customers | — |
| Customer CRM (snapshot) | `/customer-crm` | The one Person/Company 360° | Partly built | Person only; one static demo profile; wholesale buyers open `/wholesale-customer` | — |
| MerchantCustomers (snapshot) | — | Retire; keep its KPI strip and drawer | N/A | Never in this repo | — |
| Recovery customer profile (snapshot) | `/customer-profile` | Insights only; move into CRM | Not built | Still its own page, linked from Abandoned carts, Online Home and the Inbox | `/customer-profile` → CRM › Insights |
| Recovery customer groups (snapshot) | — | Use the one CRM segment engine | N/A | No such page; nearest are the ready views in All customers | — |
| All customers · list | `/all-customers` | Only list; Person/Company; separate status and restriction filters; evidence-based risk; duplicates and merge; owner, consent, custom-field and type filters; data-quality views; segment builder; select all matching | Partly built | Duplicates view and merge built. Status filter still mixes Active / Suspended / COD blocked / Gateway blocked; "Fraud watch" tag; filter panel not applied | — |
| All customers · bulk actions | `/all-customers` | SMS via Communications with a consent check; coupon via Promotions; masked background export; assign staff; segment tag; merge from a 2-row selection | Partly built | SMS, coupon, tag and CSV are messages only; merge works per detected pair | Bulk SMS / coupon → Communications / Promotions |
| Profile · header | `/customer-crm` | Type, verified contacts, duplicate warning, status, explained health; Merge, Add company, Custom fields, Consent, Audit | Partly built | Since, source, ID, "looked after by" and KPIs; actions Edit / Call / Coupon / Credit / Message; no type, duplicate warning or Merge | — |
| Profile · 10 tabs | `/customer-crm` | Fold into 6 areas | Not built | Still 10 tabs | 10 tabs → 6 areas |
| Profile · next best action | `/customer-crm` | Advisory with reason and source; no made-up %; launch through Promotions/Communications | Not built | "Customers like her come back 38%…"; Send issues a code directly | — |
| Profile · payment methods / limits | `/customer-crm` | Rename to Commerce controls; each restriction with reason, who, dates; policy preview | Partly built | Per-method allowed/blocked switches (not saved); max COD and advance limits; Suspend with a reason; no expiry or audit | Quick controls + Controls tab → Commerce controls |
| Profile · offers by SMS/WhatsApp/email | `/customer-crm` | Preferred channel apart from consent (in/out/unknown, source, time) | Partly built | "Likes messages by" already separate; "Offers by" are yes/no switches with no source or time | → Controls › Consent |
| Profile · risk / logins & IPs | `/customer-crm` | Normal / Review / Insufficient history; raw IPs behind permission | Not built | "Risk check: No risk"; IP table open to any role with Customers access | Logins & IPs → Controls › Advanced |
| Profile · addresses | `/customer-crm` | Customer ≠ receiver; label, postcode, zone, raw and cleaned text, delivery and RTO evidence | Partly built | Label, receiver name/phone, default, "used in N orders"; add form has label and line only | — |
| MerchantCustomers (recheck) | — | Retire; move KPIs and a quick-preview drawer into All customers | Partly built | Retired, but All customers has no KPI strip or row drawer | — |
| Recovery customer profile (recheck) | `/customer-profile` | Stop being a profile; cards → CRM Insights with sources | Not built | Live page owned by the Online module | → CRM › Insights |
| Customer groups (recheck) | — | CRM segment engine; consent-aware launch | N/A | — | — |
| Action: All customers | `/all-customers` | Only list + type, duplicate, field, consent, restriction views | Partly built | See list row | — |
| Action: Customer CRM | `/customer-crm` | Keep, simplify to 6 areas | Not built | — | 10 → 6 |
| Action: MerchantCustomers | — | Retire; keep KPIs and drawer | Partly built | — | — |
| Action: Recovery profile | `/customer-profile` | Into CRM Insights | Not built | — | → CRM |
| Action: customer groups | — | One segment engine | Not built | No segment engine anywhere | — |
| Action: identity | `customers.js` | Stable ID; cleaned phones and emails; verification; external IDs | Not built | Customers keyed by phone digits; "C-10482" is display text | — |
| Action: phone cleaning | `customers.js` | Local and +880 forms match; international supported | Partly built | +88/88 accepted and stripped; only BD 01X mobiles | — |
| Action: duplicate merge | `/all-customers` | Candidates, compare, choose fields, non-destructive merge, audit | Partly built | Same phone or similar name; "not the same"; keep-one dialog; dropped record kept with `mergedInto` + merge log | — |
| Action: B2B / company | `/wholesale-customer` | Company → Locations → Contacts in the same profile | Built differently | Buying types Online / Retail / Wholesale, price list A/B, credit limit; separate wholesale profile and statement; Leads "Corporate" kind | — |
| Action: segments | All customers views | AND/OR builder, preview count, live membership | Not built | Fixed views; "Save as a view" is a message | — |
| Action: custom fields | — | Typed fields with search/filter/segment flags | Not built | — | — |
| Action: consent | Profile | Preference apart from consent | Partly built | See consent row | — |
| Action: status / controls | List + profile | Separate status, commerce, payment, consent and risk | Partly built | "COD blocked" used as a status | — |
| Action: risk | Profile | Explained facts; "insufficient history"; raw data gated | Not built (in CRM) | Evidence-style courier record exists on orders only (`CourierHistory.jsx`) | — |
| Action: addresses | Profile | Expand | Partly built | — | — |
| Action: assigned staff | Profile | Primary owner; permissioned reassignment; audit | Partly built | "Looked after by" dropdown, not saved | — |
| Action: next best action | Profile | Evidence, source, time | Not built | — | — |
| Action: bulk messaging | All customers | Consent-eligible count, then a Communications job | Not built | Message only | Bulk → Communications |
| Action: bulk coupon | All customers | Launch Promotions with the selection | Not built | Message only | Bulk → Promotions |
| Action: customer export | All customers | Permissions, masking, background job, audit | Not built | CSV/Print are messages | — |
| Action: customer deletion | Profile | Active / Suspended / Closed; privacy deletion separate | Partly built | Active / Suspended only | — |
| Profile area: Overview | Overview tab | Summary + next best action | Partly built | KPIs, spend, outcome donut, categories, addresses, timeline, quick controls | Quick controls → Controls; timeline → Activity |
| Profile area: Orders & commerce | Orders + Coupons & rewards tabs | One area | Not built | — | 2 tabs → 1 |
| Profile area: Insights | Cart & favourites + Searches & views tabs | One area, adding propensity | Not built | Propensity only on `/customer-profile` | 2 tabs + Recovery profile → Insights |
| Profile area: Activity & communication | Messages + Support tickets tabs; timeline | One area | Not built | — | → Activity |
| Profile area: Details & addresses | About / tags / owner in Controls; addresses in Overview; Notes tab | One area | Not built | — | → Details |
| Profile area: Controls | Controls + Logins & IPs tabs | Status, restrictions, consent, security | Partly built | Limits and Suspend exist | Logins & IPs → Controls |

#### New capabilities in #7

| Proposal | Status | Evidence / note |
|---|---|---|
| Stable customer ID, not the phone | Not built | Phone is the key in customers, loyalty and coupons |
| Person / Company / Company location / relationship model | Not built | Nearest: buying types, price list, credit limit; Leads "Corporate" |
| Several contact points per customer, with verification | Not built | One phone per customer |
| External identities (Woo, POS legacy, Facebook lead) | Not built | — |
| BD phone cleaning | Partly built | BD mobiles only |
| Merge workflow with candidates, compare, alias and audit | Partly built | See duplicate merge |
| Quick add that suggests an existing customer | Built differently | Add is blocked on a duplicate phone; orders, POS and leads reuse by phone |
| One segment engine (AND/OR, preview, saved) | Not built | — |
| Tags kept apart from segments | Partly built | Tags exist (not saved); no segments |
| Typed custom fields, set up in Settings | Not built | — |
| Channel consent with source and time | Not built | — |
| Restriction records (type, reason, who, start, expiry, approval) | Not built | — |
| Explained risk with "insufficient history" | Not built in CRM | Exists on orders |
| Raw IP/device data behind permissions | Not built | Page-level access only |
| Receiver-aware address model | Partly built | — |
| Six-area profile and Company mode | Not built | — |
| Background bulk jobs with consent counts | Not built | — |
| CRM as a view fed by other areas | Partly built | List rows read invoices; profile uses static data |

#### Built differently / conflicts in #7

- **Customer profiles.**
  - The brief wants one profile. Today there are four:
    - `/customer-crm`, from All customers;
    - `/customer-profile`, from Online Home, the Inbox and Abandoned carts;
    - `/wholesale-customer`;
    - `/member-detail`.
  - Each finds the person by phone separately, and the CRM profile is one static demo.
- **B2B.**
  - The brief models Company → Locations → Contacts.
  - Today it uses customer buying types plus a wholesale price list and credit limit, a wholesale profile and statement, and price loading at New sale.
  - Leads (`/sales-leads`) adds Corporate and company fields; the brief does not mention Leads.
- **Merge.** The brief wants a field-by-field choice. Today one whole record is kept, and orders, spend and dues carry across.
- **Duplicates on add.** The brief suggests the existing customer. Today the duplicate is blocked.
- **Restriction automation.** Today an Automation rule ("Flag customers who return twice → tag Risky, turn off COD") sets a restriction outside CRM. The brief doesn't cover it.
- **Old baseline.** MerchantCustomers and CustomerGroups were never in this repo.

Coverage: brief tables 44 rows (5 + 12 + 21 + 6) · reported 44.


### Customers · #13 Recovery & Customer Intelligence

*Brief v1.0, 30 Sep. Proposed home: Marketing › Recovery.*

**Nayeem's decision.**
- Keep the six-screen foundation: Abandoned carts, Auto reminders, Smart offers, Customer groups, Ad audiences.
- Retire the standalone Customer profile into CRM.
- Recovery spots opportunities, works out signals and decides journeys. It hands incentives to Promotions (#9), sending to Communications (#11) and attribution to Analytics (#14).

**Owns:**
- recovery opportunities;
- journey and stop/re-entry rules;
- behaviour features and signals;
- intelligence segment templates;
- Smart Offer eligibility;
- ad-audience sync state.

**Does not own:** the customer master and segment engine, cart and checkout, raw events, discounts and points, message and call sending, consent enforcement, attribution, stock, order and return truth.

**Today:**
- `/abandoned-carts` (a simple contact list), `/auto-reminders` and `/customer-profile`.
- Trigger → action logic sits in Automation › Rules / Workflow builder.

#### Screen by screen

| Brief's area | Today in the build | Nayeem proposes | Status | Evidence | UX move |
|---|---|---|---|---|---|
| Abandoned carts (snapshot) | `/abandoned-carts` | Keep as the main overview | Built differently | Simpler: 3 KPIs, one reminder switch, Call / WhatsApp / SMS; no big-cart flag, coupon action, channel or drop-off sections | — |
| Auto reminders (snapshot) | `/auto-reminders` | Keep; shared send limits move to Communications | Partly built | Full UI; caps and quiet hours still on this page | Caps / quiet hours → Communications |
| Smart offers (snapshot) | — | Keep UI; drop duplicate engines | N/A | The trigger → action role sits in Automation | — |
| Customer groups (snapshot) | — | Intelligence segment view | N/A | — | — |
| Customer profile (snapshot) | `/customer-profile` | Merge into the CRM 360° | Not built | Still its own page | → CRM › Insights |
| Ad audiences (snapshot) | — | Audience activation | N/A | No audience sync anywhere | — |
| Abandoned carts · KPIs | `/abandoned-carts` | "Money waiting" → Cart value at risk; recovered numbers show basis and window | Not built | "Money waiting"; "Came back and ordered" | — |
| Abandoned carts · table / actions | `/abandoned-carts` | 8 recovery states; recheck before acting | Not built | Not contacted / Contacted / Ordered; actions are messages | — |
| Abandoned carts · channel recovery | — | Sending and cost from Communications; results from Analytics | N/A | Auto reminders shows cost per channel and "Brought back" | — |
| Abandoned carts · "where people stop" | — | Evidence with sample and period | N/A | — | — |
| Auto reminders · 3 reminders | `/auto-reminders` | Keep; add step status, eligibility, offer reference, run stats | Partly built | 3 steps, first without a discount, stops on order, preview | — |
| Auto reminders · skip small / frequent / blocked | `/auto-reminders` | Neutral wording; blocklist from Communications | Not built | "They get a coupon too easily and learn to wait"; local blocklist switch | — |
| Auto reminders · max messages / quiet hours | `/auto-reminders` | Inherit the Communications policy (this flow may be stricter) | Not built | Local "per week" and 9 AM–9 PM; separate global quiet hours in Workflow settings | → inherit from Communications |
| Auto reminders · big-cart calls | `/auto-reminders` | Keep threshold; recheck before calling | Partly built | Threshold points to a "call these" list that Abandoned carts lacks | — |
| Auto reminders · back in stock | `/auto-reminders` | Pause/resume from Inventory | Partly built | Switch only | — |
| Auto reminders · no-login link | `/auto-reminders` | Scoped expiring token; recheck price and stock | Partly built | Text only ("stops working after 7 days or once they order") | — |
| Smart offers · trigger catalogue | Automation | Standard triggers (event, segment, date, predictive) | Built differently | Automation triggers: order placed / status / AI call / delivered / stock low / schedule; "no order 60 days" rule | — |
| Smart offers · customer groups targeting | — | CRM segment reference | N/A | — | — |
| Smart offers · "what do we offer?" | — | Pick/create the offer in Promotions | N/A | Automation rule text "offer with code COMEBACK10" | — |
| Smart offers · per-customer code | — | Promotions issues unique codes | N/A | Smart-offer codes only in CRM demo data | — |
| Smart offers · copy / send log | Automation | From Communications | Built differently | Automation "Recent runs" | — |
| Smart offers · rest time / quiet hours | Workflow settings | Communications baseline | Built differently | Workflow settings | — |
| Smart offers · discount cap | — | Promotions budget | N/A | Workflow settings has a daily spend cap | — |
| Smart offers · sales/cost KPIs | — | Analytics-attributed; costs separate | N/A | Automation rules show runs and cost per message | — |
| Customer groups | — | Segments on the CRM engine; rule vs predictive labels | N/A | — | — |
| Customer groups · give offer / show ads | — | Route to Smart offer / Ad audiences | N/A | — | — |
| Customer profile · commercial summary | `/customer-profile` | Into CRM Insights with source labels | Not built | Standalone; CRM Overview repeats LTV, orders, AOV | → CRM |
| Customer profile · "chance to buy again" | `/customer-profile` | Repurchase signal with version, time, "insufficient data" | Not built | — | — |
| Customer profile · "safety check: no risk" | `/customer-profile` | Normal / Review / Insufficient | Not built | — | — |
| Customer profile · first came from / last visit | `/customer-profile` + CRM | Analytics source with label and date | Partly built | "Came from Facebook ad" in CRM; last visit only on the Recovery profile | — |
| Customer profile · viewed / search / wishlist | CRM tabs | Freshness and source; zero-result search is a demand signal | Partly built | CRM Searches & views and favourites | — |
| Ad audiences | — | Segment reference, provider ID, sync, match rate | N/A | — | — |
| Ad audiences · privacy wording | — | Hashing is not anonymity | N/A | — | — |
| Action: Abandoned carts | `/abandoned-carts` | Clear states and attribution | Not built | — | — |
| Action: "Money waiting" | `/abandoned-carts` | Rename | Not built | — | — |
| Action: recovery metrics | Carts / Reminders | Operational vs attributed; adjust for returns | Not built | "Brought back ৳1,42,600" | — |
| Action: checkout friction insight | — | Evidence-backed | N/A | — | — |
| Action: Auto reminders | `/auto-reminders` | Keep; send pressure → Communications | Partly built | — | → Communications |
| Action: frequent abandoner | `/auto-reminders` | Reword | Not built | — | — |
| Action: recovery links | `/auto-reminders` | Harden token | Partly built | — | — |
| Action: back in stock | `/auto-reminders` | Resume on an Inventory event | Partly built | — | — |
| Action: big-cart call | `/auto-reminders` | Recovery task, Communications calls | Partly built | — | — |
| Action: Smart-offer triggers | Automation | Standardise | Built differently | — | — |
| Action: reward builder | Reminder steps | Use Promotions offers | Not built | Steps hold their own % and cap | — |
| Action: Smart-offer sending | Automation | Use Communications | Built differently | Automation sends WhatsApp/SMS itself | — |
| Action: Smart-offer budget | — | Promotions budget | N/A | — | — |
| Action: customer groups | — | View on the CRM engine | N/A | — | — |
| Action: customer profile | `/customer-profile` | Merge and retire | Not built | — | → CRM |
| Action: chance to buy again | `/customer-profile` | Formalise | Not built | — | — |
| Action: safety check | `/customer-profile` | Fix | Not built | — | — |
| Action: ad audiences | — | Keep | Not built | — | — |
| Action: ad privacy wording | — | Fix | N/A | — | — |
| Keep block: spent / orders / AOV / returned | CRM Overview + Recovery profile | Source-labelled summary | Partly built | No source labels | → CRM Insights |
| Keep block: chance to buy again | Recovery profile | Versioned repurchase signal | Not built | — | — |
| Keep block: first came from | CRM header | Source with label | Partly built | — | — |
| Keep block: last visit from | Recovery profile only | With freshness | Not built (in CRM) | — | → CRM |
| Keep block: approximate area | Recovery profile; CRM IP table | Permitted source and precision only | Partly built | — | — |
| Keep block: mobile · Android | CRM Logins & IPs | Advanced, permission-gated | Built differently | Open tab | → Advanced |
| Keep block: likes messages by WhatsApp | CRM About | Preference ≠ consent | Built | — | — |
| Keep block: safety check | Both profiles | Evidence-based states | Not built | — | — |
| Keep block: viewed 4× | CRM Searches & views | Count, window, last seen | Partly built | "4 times · Hot", no window | — |
| Keep block: what she searched | CRM Searches tab | Zero-result search as a signal | Partly built | — | — |
| Keep block: wishlist | CRM favourites | Storefront snapshot | Built | — | — |

#### New capabilities in #13

| Proposal | Status | Evidence / note |
|---|---|---|
| Recovery opportunity record (cart / checkout / payment issue / recovered; 8 states) | Not built | Demo list |
| Customer feature records (as-of time, window, version) | Not built | — |
| Customer signal (model version, valid-until, insufficient data) | Not built | Static "High" |
| Journey definitions and enrolment, run once | Built differently | Automation When/Then rules and the workflow builder |
| Standard trigger catalogue with owner | Not built | Automation has 6 order/stock/schedule triggers |
| Intelligence segment templates on the CRM engine | Not built | — |
| Ad audience sync (segment → Meta/TikTok) | Not built | Connections lists ad accounts only |
| Scoped expiring recovery token with rechecks | Partly built | Text only |
| Operational recovery kept apart from attribution | Not built | — |
| Global frequency and quiet hours from Communications | Not built | Two separate settings today |
| Offers chosen from Promotions; unique codes issued there | Not built | Reminder steps hold their own discounts |
| Payment-state check before messaging | Not built | — |
| Privacy and retention for derived data; audience removal | Not built | — |
| Anonymous carts not turned into CRM customers | Built differently | Guest carts with a phone are contactable; a guest row sits in All customers |

#### Built differently / conflicts in #13

- **Old baseline.** The brief audits six screens; this repo only ever had three (Abandoned carts, Auto reminders, Customer profile). Today's Abandoned carts is simpler than the brief describes.
- **Journeys.** The brief puts journey decisions in Smart offers. Today trigger → message logic sits in Automation › Rules / Workflow builder, which the brief does not mention.
- **Two quiet-hours settings today:** Auto reminders and Automation › Workflow settings. The brief wants both to inherit from Communications.
- **Agrees with #7.** Both briefs say the Customer profile becomes CRM Insights. Today `/customer-profile` is still the live profile for Home and the Inbox, and it belongs to the Online module while Customers is core.

Coverage: brief tables 63 rows (6 + 27 + 19 + 11) · reported 63.


### Customers · #9 Loyalty, Promotions & Offers

*Brief v1.0, 29 Sep. Proposed home: Marketing › Promotions / Loyalty.*

**Nayeem's decision.**
- **One Promotion Rule Engine** sits under coupon, flash, automatic, BOGO and other offers, giving the same result at POS and online.
- Points and store credit become **immutable ledgers**.
- **Members are CRM customers** with a loyalty account.
- **Wallet becomes Store Credit**, with no cash top-up or cash-out.

**Owns:**
- promotion definitions and the rules for combining offers;
- codes and offer types;
- earn and redeem rules;
- the points ledger and tiers;
- the referral reward lifecycle;
- the store credit ledger;
- offer visibility and content.

**Does not own:** customer and segment master, price and stock, orders, payments, storefront rendering, message sending, finance balances, return cases, analytics.

**Today:**
- `/promo`, `/coupons`, `/new-coupon`, `/flash-sales`, `/new-flash-sale`, `/loyalty`, `/product-points`, `/members`, `/member-detail`, `/referrals` and `/wallet`.
- Loyalty data lives in `src/lib/loyalty.js`.
- Coupons are three separate code sets: the Coupons list, the POS and Checkout.

#### Screen by screen

| Brief's area | Today in the build | Nayeem proposes | Status | Evidence | UX move |
|---|---|---|---|---|---|
| Promo (snapshot) | `/promo` | The offers hub | Built | KPIs, running and coming soon, calendar, banner; header Create offer / Flash sale / Offers page | — |
| Coupons (snapshot) | `/coupons` | A filtered view of the shared offers | Built differently | Its own static list | — |
| New coupon (snapshot) | `/new-coupon` | Base offer builder | Partly built | Full UI; Save is a message | — |
| Flash sales (snapshot) | `/flash-sales` | Specialised view | Built differently | Its own list | — |
| New flash sale (snapshot) | `/new-flash-sale` | Builder mode | Built (UI) | Save is a message | — |
| Loyalty (snapshot) | `/loyalty` | Programme settings | Built | Settings saved (`loyalty.js`) | — |
| Product points (snapshot) | `/product-points` | Exception view | Built | — | — |
| Members (snapshot) | `/members` | Loyalty view of CRM customers | Built differently | Separate member store keyed by phone | — |
| Member detail (snapshot) | `/member-detail` | Loyalty account detail | Built | — | — |
| Referrals (snapshot) | `/referrals` | Referral programme | Built | — | — |
| Wallet (snapshot) | `/wallet` | Becomes Store Credit | Not built | Top-up and cash-out requests remain | Customer wallet → Store credit |
| Promo | `/promo` | Show type, activation, channel, audience, schedule; more offer types | Partly built | Coupon and flash types only | — |
| Coupons | `/coupons` | Same engine; combination, reserved usage, audience, channel, pause reason | Partly built | Tabs and on/off; not shared: POS hard-codes EIDSAVE10 / WELCOME50, checkout hard-codes EID300 and bKash 10% | — |
| New coupon | `/new-coupon` | Becomes the Offer Builder: CRM segments, customer ID, combination policy, activation, channel and place, AND/OR, BOGO/gift, reservation, test cart | Partly built | Taka / % / free delivery; who: everyone / first order / Gold+Plat / one by phone; where: web + POS / web / POS; payment, bank and split offers; "checked by phone number"; one combine switch; preview; not saved | — |
| Flash sales | `/flash-sales` | Shared rules; overlap, channel, quota, estimated margin | Partly built | Tabs, KPIs, sold vs pieces; no overlap or channel | — |
| New flash sale | `/new-flash-sale` | Margin warning with approval; "estimated gross margin"; quota ≠ stock; stacking, limits, budget, reserve, conflicts | Partly built | Price floor at cost +5%; below-cost price warns without approval; "If all are sold, profit"; max 2 per customer; coupons also work; hide items already in a sale | — |
| Loyalty | `/loyalty` | Points basis, pending, reversal, tier lifecycle, enrolment setting, redemption caps | Partly built | Earn per ৳100, welcome, birthday, point value, min use, max %, tiers move up only, expiry, POS switch | — |
| Product points | `/product-points` | Exceptions over one earn engine; more than 2× optional | Built (no >2×) | Normal / Double / Off | — |
| Members | `/members` | Use CRM customers; enrolment, tier expiry, pending points, store credit, consent count | Built differently | Own list and "Add member"; KPIs and filters | — |
| Member detail | `/member-detail` | Ledger adjustments with approval; Wallet → Store credit; tier history | Partly built | `adjustPoints` saves reason and staff; balance from entries; no approval | Wallet section → Store credit |
| Referrals | `/referrals` | Pending until an approval period; reversal; caps; anti-self-referral; no cash by default | Partly built | Waiting → due → given; pays into wallet or cash / bKash / bank; how-it-works folded | — |
| Wallet | `/wallet` | Store credit; remove deposit and cash-out | Not built | Add money / Pay back / Give credit + requests | → Store credit |
| Action: Promo hub | `/promo` | All offer types | Partly built | — | — |
| Action: coupon engine | — | Shared builder (segments, channels, combinations, reservation, test) | Not built | No engine; 3 separate code sets | — |
| Action: automatic discounts | — | Add | Not built | Only the member-level % at POS | — |
| Action: Buy X Get Y | — | Add | Not built | — | — |
| Action: free delivery / gift / tiered qty | New coupon | Builder modes | Partly built | Free delivery only | — |
| Action: combination logic | New coupon | Classes and priorities | Not built | One switch | — |
| Action: limited usage | — | Reserve / commit / release | Not built | — | — |
| Action: one use per customer | New coupon | Real customer ID | Not built | By phone | — |
| Action: flash pricing | New flash sale | Margin warning with approval | Partly built | Warning only | — |
| Action: flash profit wording | New flash sale | Rename | Not built | — | — |
| Action: flash quantity | New flash sale | Cap apart from stock | Partly built | Separate number, not explained as a cap | — |
| Action: loyalty points | `loyalty.js` | Ledger states | Partly built | Entries exist; no Pending; return reversal only in demo data | — |
| Action: points basis | `loyalty.js` | Define it and record the rule version | Partly built | Fixed "amount after discounts" | — |
| Action: product points | Product points | Rule view | Built | — | — |
| Action: members | Members | Tie to CRM | Not built | Separate store | — |
| Action: manual points | Member detail | Approval | Partly built | No approval | — |
| Action: tiers | Loyalty | Full lifecycle | Not built | Move up only | — |
| Action: enrolment | Loyalty | Auto-enrol or opt-in setting | Not built | Anyone with points becomes a member | — |
| Action: referrals | Referrals | Harden | Partly built | — | — |
| Action: referral cash | Referrals | De-emphasise | Built differently | Cash payout posts to the ledger as "referral reward" | — |
| Action: wallet | Wallet | Store credit | Not built | — | → Store credit |
| Action: messaging | Loyalty / CRM | Loyalty emits; Communications sends | Not built | CRM sends coupons itself | — |
| Action: offer banners / pages | New coupon, Promo, `/offers` | Promotions stores intent; Storefront renders | Built | Offer post, top banner, Offers page | — |
| Flash rule: suggested price above cost | New flash sale | Warning with approval | Partly built | Warning only | — |
| Flash rule: "profit if all sold" | New flash sale | Estimated gross margin | Not built | — | — |
| Flash rule: pieces for sale | New flash sale | Promotional quota | Built | Separate from stock | — |
| Flash rule: reserve campaign stock | — | Optional Inventory reserve | Not built | — | — |
| Flash rule: overlapping offer | New flash sale | Warn or block | Partly built | Hide-items filter | — |
| Flash rule: coming soon / countdown | New flash sale | Timing intent; Storefront renders | Built | — | — |
| Flash rule: reminder | New flash sale | Trigger; Communications sends | Built (UI) | "Remind me" switch not connected to sending | — |

#### New capabilities in #9

| Proposal | Status | Evidence / note |
|---|---|---|
| One promotion engine shared by POS and online | Not built | 3 separate code sets |
| Offer type: coupon code | Built (UI) | — |
| Offer type: automatic discount | Not built | Member % at POS only |
| Offer type: Buy X Get Y | Not built | — |
| Offer type: spend X get Y | Partly built | Code-based minimum bill only |
| Offer type: quantity / tiered | Not built | — |
| Offer type: free delivery | Built | — |
| Offer type: gift with purchase | Not built | — |
| Offer type: flash sale | Built (UI) | — |
| Offer type: payment-method offer | Built (UI) | Includes bank and split-by-payment |
| Offer type: loyalty / referral reward | Built | Birthday, welcome and referral points |
| Lifecycle Draft → Scheduled → Active → Paused → Exhausted → Ended → Archived | Partly built | Running / Coming soon / Ended / Turned off |
| "Test this offer" preview | Partly built | Bill and payment preview only |
| Points ledger with Pending and automatic reversal | Partly built | Entry-based; no Pending |
| Redemption controls | Partly built | Min and max %; no exclusions |
| Tier lifecycle and history | Not built | — |
| Members = CRM customer + loyalty account | Not built | — |
| Referral pending, reversal, caps, self-referral checks | Not built | — |
| Store credit ledger (issue, redeem, expire, reverse, adjust; no cash-out) | Not built | Wallet keeps top-up and cash-out; return store credit flows into the wallet |
| Communications triggers instead of direct sends | Not built | — |
| Six areas | Partly built | Menu: Offers & coupons [4] + Loyalty [5] |

#### Built differently / conflicts in #9

- **Wallet.**
  - The brief keeps stored money out of scope ("not a Finance cash account").
  - Today the customer wallet is money held for customers: top-ups post into real accounts, and the balance shows as a liability in Money › Bills to pay.
  - Loyalty costs also feed profit.
- **Referral payouts.** The brief defers cash payouts to Finance later. Today they are already paid from an account through the ledger, and Bills to pay has an "Affiliate payout" type.
- **Points timing.** The brief keeps points pending until delivery or the return period. Today POS points are credited at once and online points on delivery.
- **Flash sale below cost.** Today it warns rather than blocks, which matches the brief, but there is no approval step.
- **Depends on #7.** "Members = CRM customers" needs #7's stable customer ID, which doesn't exist yet. Members, CRM rows and coupon limits are all keyed by phone.

Coverage: brief tables 52 rows (11 + 11 + 23 + 7) · reported 52.


### Communications · #11 Communications, Notifications & Campaigns

*Brief v1.0, 29 Sep.*

**Nayeem's decision.**
- Keep the Inbox as the one shared inbox and Calls as a call centre that can be switched off.
- Add two permanent workspaces:
  - **Messaging Campaigns**;
  - **Notifications & Automations** (Transactional · Automations · Templates · Delivery log).
- Both sit on **one delivery engine**. The business areas decide *why* a message goes out; Communications decides *how*, *whether* and *on which channel*.

**Owns:**
- conversations, channel identities, assignment and SLA;
- comment moderation and saved replies;
- calls;
- outbound campaigns;
- templates and transactional notification setup;
- automation runs and channel adapters;
- consent and suppression enforcement;
- the global frequency and quiet-hours policy;
- the delivery log, send cost, retry and fallback;
- AI reply behaviour.

**Does not own:** the customer master and consent facts, orders, payments, support cases, recovery strategy, promotion rules, ad analytics, credentials, Finance, storefront, the platform's own messaging.

**Today:**
- `/merchant-inbox` (chats, comments, Google reviews) and `/merchant-calls`, both on `src/lib/inbox.js`.
- AI calls.
- Order notifications at `/set-notifications` (`src/lib/notifications.js`).
- Automation (Rules, Workflow builder, Workflow settings, Scheduled reports) under "Online store & settings".
- Social posts (Calendar, Composer) under Marketing.

#### Screen by screen

| Brief's area | Today in the build | Nayeem proposes | Status | Evidence | UX move |
|---|---|---|---|---|---|
| Inbox · conversations | `/merchant-inbox` (`MerchantInbox.jsx`, `Thread.jsx`, `inbox.js`) | Keep views, assignment, SLA, notes, saved replies, CRM panel. Reply limits come from a channel adapter; keep original per-channel threads. Add reply-capability badge, "template required" state, disconnected/suppressed state, identity audit, a send lock between agents | Partly built | Mine/Unassigned, notes and saved replies exist. Reply window is a fixed sentence per channel. Merge folds the dropped thread into one record. No send lock (first reply auto-assigns). Connect/Reconnect per channel. No suppressed state | — |
| Public comments | `/merchant-inbox?view=comments` | Keep reply, move to DM, hide, block, auto-hide. Attributed sales and sentiment come from Analytics/AI. Add moderation audit, channel capability, comment→conversation link | Partly built | Reply, DM, hide, hide-spam and auto-rules exist; "attributed sales" is a fixed demo number; no block-author action | — |
| Inbox business actions | Thread menu and composer | Keep new order / refund / delivery / ticket entry points as guarded launches; permission-aware | Partly built | Create order → `/new-order`; Call; payment-link card. No refund, ticket or delivery actions | — |
| Calls | `/merchant-calls` | Keep queue, dialer, IVR, callbacks, hold/transfer/mute, recordings, outcomes, tickets. Switchable module; provider capabilities. Add recording retention/access, callback SLA, provider failure state | Partly built | IVR queue, transfer, outcome form, callbacks, recordings with transcripts, WhatsApp voice line. No ticket creation or retention rules. Switches off only with the whole `comms` module | — |
| Auto reminders (recovery → sending) | `/auto-reminders` | Keep 3 steps, stop-on-order, discount, big-cart call, back in stock. Drop its own cap and quiet hours (use the Communications policy). Add per-step template, eligible/suppressed estimate, delivery summary | Built differently | Own "max messages per week", labelled "shared with all your marketing" (it isn't); own 9 AM–9 PM window; settings live only on the page | — |
| Smart offers | — | Rest time and quiet hours from Communications; send log from Communications; consent-eligible estimate | N/A | Not in this repo; smart-offer sends appear only as CRM demo rows | — |
| Order notifications | `/set-notifications` (`SetNotifications.jsx`, `notifications.js`) | Keep order-status switches. Event-driven notifications across Order, Payment, Delivery, Refund, Return, Loyalty, Security. Channel, template, language and fallback per event | Partly built | 20 order-life events by SMS and email, customer/shop switches, `{{variables}}`, preview, test send. No WhatsApp, refund, loyalty or security events; no language variants or fallback | Settings › Notifications → Communications › Notifications & Automations › Transactional |
| Auto-reply rules | `/set-rules` | Keep priority, triggers, channels, variables, "Then" action. Business actions through the owning area. Add simulator, version history, match stats | Partly built | No simulator, history or stats | — |
| AI auto-reply | `/set-ai` | Provider, model, key and budget → Settings; behaviour → Communications. Modes Off / Draft only / Auto for approved intents / Broad with escalation | Not built | One form holds everything; office-hours rule: AI drafts inside hours, replies directly outside them | Split between Settings and Communications |
| Ad campaigns (analytics) | `/campaigns` | Paid-ad analytics; don't merge with messaging campaigns; link by UTM | Built (separate) | A report page; no messaging-campaign screen exists | Reports › All reports |
| Console messaging | `/messaging` (console) | Internal; add merchant usage, cost and health summaries | Built | Merchant side: Wallet & credits, "Platform & messaging costs" report, SMS/email providers in Connections | — |

#### New capabilities in #11

| Proposal | Status | Evidence / note |
|---|---|---|
| **Messaging Campaigns** workspace: segment, channels, template, schedule, pre-send counts, cost, results | Not built | Closest: Composer's "WhatsApp broadcast" (to opted-in customers, with cost) and the "Win back quiet customers" rule; no segment picker |
| **Notifications & Automations** workspace | Built differently | Split across Settings › Order notifications, Automation › Rules / Workflow builder / Workflow settings / Scheduled reports, and the order page's Notifications card |
| Event list expanded to refund, loyalty and security | Partly built | Order-life events only, SMS + email |
| Versioned templates per channel, language and class, with provider template IDs | Partly built | Per-event templates, preview, SMS-part counter, test send |
| Saved replies kept apart from templates | Built | — |
| One delivery log across all areas | Partly built | Per-order log with delivered/failed/skipped and retry; automation run list is static |
| Communication classes (Transactional / Service / Marketing / Security) | Not built | — |
| Consent separate from suppression, rechecked at send time | Not built | No consent fields on customers; "skip blocked numbers" and conversation block only |
| One global frequency and quiet-hours policy | Built differently | Workflow settings has quiet hours, a daily per-customer cap, a daily ৳ limit, senders and retries (page only); Auto reminders keeps its own |
| Recovery keeps its UI; Communications sends | Not built | No shared send layer |
| AI reply modes; office-hours fix | Not built | — |
| Rule simulator and version history | Not built | — |
| One-time transactional events (no double sends) | Built | `once` key in `notifications.js` |
| Channel adapter capabilities | Not built | Hard-coded per channel |
| Channel identity kept apart from the CRM customer | Partly built | `links` and `via` on merge; phone match |
| Agent send lock | Not built | — |
| Call record with recording, transcript, retention | Partly built | Recording, transcript and callback fields only |
| Outbound call tasks from other areas | Not built | Auto reminders' "call me for carts above" isn't a Calls queue |
| Report and alert sending through Communications | Not built | Scheduled reports only preview ("sending needs the server") |
| Provider credentials kept outside Communications | Built | Connections › SMS & email |

#### Built differently / conflicts in #11

- **Reply limits.** Today each channel shows a fixed sentence. The brief wants live capability states from each channel adapter.
- **Merging duplicates.** Today duplicates merge into one conversation. The brief keeps separate per-channel threads under one customer.
- **Order notifications.** Today they sit in Settings (commerce module), SMS and email only. The brief puts them in a Communications workspace and adds WhatsApp.
- **Quiet hours and caps.** Today Workflow settings and Auto reminders set these independently; Auto reminders' copy says its cap is shared, but it isn't. The brief wants one policy.
- **Calls switch.** Today Calls turns on or off only with the whole `comms` module. The brief wants Calls optional on its own.
- **Not in the brief:** Social posts (Calendar, Composer, WhatsApp broadcast), AI calls, Google reviews in the Inbox, Team chat.
- **Old baseline.**
  - Preference no longer holds order emails.
  - Smart offers is not in this repo.
  - The tracking Connections page is now `/ad-accounts`.
- **Across briefs.**
  - #15 sends review requests and offer reminders through Communications. Today the review request is an Automation rule and "Remind me" only changes the page.
  - #14 sends alerts through Communications. Today recipients are set on the alerts page itself.

Coverage: screen table 11 rows · reported 11. The brief's 9 snapshot rows map into the same rows, and its 16 action rows are covered above.


### Finances · #5 Payments & Settlement

*Brief v1.2, 28 Sep (freeze candidate).*

**Nayeem's decision.**
- **One customer-payment engine**, with each channel keeping its own way of taking money:
  - staff check manual e-commerce payments inside Orders;
  - POS takes payment in its pay sheet;
  - Finance owns where the money sits.
- Exactly one new screen: **Payments Operations** (Transactions · Refunds · Settlements & reconciliation).

**Owns:**
- payment requests, attempts and customer-submitted claims;
- verified payments and their allocation;
- manual-check evidence and payment links;
- gateway connection state;
- refunds, fees and payment methods;
- shop payment accounts and card terminals;
- each POS payment record;
- gateway, card and COD payouts and their matching;
- chargebacks.

**Does not own:** bank, MFS and cash balances, drawer open/close, cash to safe, expenses, customers, order truth, return cases, promotions, checkout layout, the settings shell.

**Today:**
- Partner rules, expected payouts and payout confirmation live in `src/lib/settlements.js`, with `/settlements` (Money › Payouts) and the 8 PM evening check.
- Gateway setup is `GatewaySetup.jsx`, opened from Settings, Money setup and Connections.
- Each partner has a holding account in `ledger.js`.

#### Screen by screen

| Brief's area | Today in the build | Nayeem proposes | Status | Evidence | UX move |
|---|---|---|---|---|---|
| Payment settings (snapshot) | `/set-payments` | Keep the look; rename "Payments Setup"; three groups (integrated gateways, manual methods, shop accounts & terminals); drop hard-coded provider claims, discount and exchange rates | Partly built | Title still "Payment Gateway"; a "Settlement & accounts" list was added | — |
| POS pay (snapshot) | `/pos` checkout | Keep; each payment goes to the exact account/terminal; Due/credit out of the payment buttons | Partly built | General buttons Cash / Card / bKash / Nagad / Rocket; Due still a button | — |
| Order payment actions (snapshot) | `/order-detail` | Keep in the order; Payments owns the record behind it | Partly built | "Take advance + approve" and "Send payment link"; customers can't submit proof | — |
| POS open/close (snapshot) | `/pos` + `/pos-manage` | Integration only; totals per account/terminal later | Partly built | Totals per method only | — |
| POS return (snapshot) | `/return-exchange` | Integration only; Payments runs the refund; store credit ≠ cash refund | Partly built | Refund by Cash / bKash / Nagad / Card / Store credit / Cut from due, posted at once | POS return → shared Return & exchange (done) |
| Console payment checks (snapshot) | `/payment-checks` → `/collections` | Keep removed | Built | Redirect | — |
| Payment operations (missing) | Spread across `/settlements`, `/money`, `/return-history` | Add one Payments Operations workspace | Built differently | Payouts tabs: Partners / Paid out / Needs a look; type filter in Money | Money › Payouts + Cash, bank & wallets → "Payments" |
| Payment settings · gateway list | `/set-payments` + `/connections` › Payments | Rename; COD stays a checkout option; capability badges (refund API, webhook, query, payout import, sandbox, part refund) | Partly built | Live/sandbox, masked keys, connection test; COD "needs no credentials"; no capability badges | Connecting starts in Connections (done) |
| Payment settings · bKash detail | `/set-payments` | Remove fixed limit, "cashback 1–2%", "refund only in portal"; add health, last webhook, key-rotation date | Not built | Those claims are still there; webhook health is demo text | — |
| Payment settings · payment rules | `/set-payments` | A method only says which uses it allows; prepay amount worked out by Sales/Checkout; preview | Not built | Payment modes × zone × customer type × category grid still here | Prepay rules → Sales/Checkout |
| Payment settings · payment discount | `/set-payments` | Only a summary of the linked Promotions offer | Not built | Discount fields still here | → Marketing › Offers |
| Payment settings · offline gateways | `/set-payments` | Rename "Manual payment methods"; add Nagad/Upay/custom, QR, reference/sender/proof rules, channels; a claim puts the order On hold / verify | Not built | Three numbers only (bKash, Rocket, bank) | — |
| Payment settings · exchange rates | `/set-payments` | Move to a currency setting | Not built | USD/EUR/GBP/INR rates here | → Settings/Finance |
| Payment settings · shop accounts | GatewayList | "Retail accounts & terminals": provider, terminal ID, branch, registers, confirmation, payout account, dates | Partly built | One card machine with terminal ID + bank; payout account and rule; no branch or register link | — |
| POS pay | `/pos` | Cash to the open register's drawer; card/MFS to the exact account/terminal with a chooser; reference kept | Partly built | Cash → one shared "Counter drawers" account; bKash → one wallet; card → one account; no reference field | — |
| POS pay · Due / credit | `/pos` | Remove from payment buttons; separate "Sell on due" | Built differently | Still a button; moves no money; creates an unpaid invoice with credit-limit check and PIN | — |
| POS open/close | `/pos` + POS manage | Totals per account and terminal; optional terminal batch / wallet check | Partly built | Only cash is counted against expected | — |
| Order payment actions | `/order-detail` | Proof review, record payment, link, advance stay in the order; "view all payment transactions"; refund status | Partly built | Advance and link; no proof review, reject or transactions link | — |
| POS return refund | `/return-exchange` | Refund with stages; cash is a drawer move; store credit is credit | Partly built | Posted at once; store credit to the wallet; no pending/failed refunds | — |
| Console payment checks | `/payment-checks` | Stay deleted; checking = an Orders filter + Order detail | Built (removal) / Not built (filter) | No "verify payment" filter | — |
| Action: payment settings | `/set-payments` | Regroup into three families | Partly built | Current sections: settlement & accounts, online, exchange rates, offline | — |
| Action: gateway capabilities | `GatewaySetup.jsx` | Each gateway declares what it supports | Not built | Keys and fees only | — |
| Action: SSLCOMMERZ and similar | — | Server-side check, payment notifications, no double count | Not built (backend) | Payments are browser demo data | — |
| Action: manual payment methods | `/set-payments` | Rename and expand | Not built | — | — |
| Action: manual verification | `/order-detail` | Keep checking inside Orders | Partly built | "Verification" is a phone call; no transaction ID, proof or duplicate-reference check | — |
| Action: payment rules | `/set-payments` | Clear owner | Not built | — | → Sales/Checkout |
| Action: payment discount | `/set-payments` | Move owner | Not built | — | → Promotions |
| Action: exchange rates | `/set-payments` | Move | Not built | — | → Settings/Finance |
| Action: shop accounts / terminals | GatewayList | Add | Partly built | One card machine | — |
| Action: POS pay | `/pos` | Exact accounts | Partly built | Split payments post one entry per method | — |
| Action: Due / credit | `/pos` | Remove from payment buttons | Built differently | — | — |
| Action: POS shift close | `/pos`, POS manage | Payments only supplies totals | Partly built | — | — |
| Action: refunds | Return & exchange, Return history | Into Payments Operations | Partly built | No stages or failed-refund queue | Refunds → Payments Operations › Refunds |
| Action: Payments Operations | `/settlements` + `/money` | One page | Built differently | Money group | Money › Payouts → "Payments" |
| Action: gateway payouts | `/settlements` | View: gross, fees, net, bank receipt, matched, age | Built differently | Expected payouts by working day, gross/fee/net, confirm/delay, "Needs a look" | — |
| Action: COD payouts | `/settlements` | Into Payments | Built | Delivered → held by courier; returned → removed from the next payout | — |
| Action: where checked MFS money lands | ledger | Lock the boundary | Built | Advance by bKash goes straight to the bKash merchant account | — |
| Action: payment link | `/order-detail` | Keep | Partly built | Sends a message only; no link record, expiry or paid state | — |
| Action: navigation | Money group + Settings › Payment Gateway | One Payments page + Settings › Payments | Built differently | — | Money › Payouts / Cash, bank & wallets → Payments; Settings › Payment Gateway → Payments Setup |

#### New capabilities in #5

| Proposal | Status | Evidence / note |
|---|---|---|
| Payments Operations workspace (transactions, refunds, settlements; failed attempts, refunds pending, payouts pending, exceptions) | Built differently | Payouts + Money + Return history + evening check |
| Separate records: request, attempt, claim, verified payment, allocation, refund, fee, payout, match | Partly built | Ledger entries, payout items and records, invoice payments; no request/attempt/claim records |
| Separate status sets (order payment, claim, attempt, refund, payout) | Partly built | Order payment Paid/Unpaid/Partial/COD; payout expected/delayed/review/received |
| Customer submits a manual payment (transaction ID, sender, proof) → waits for checking | Not built for orders | A similar queue exists for wallet top-ups |
| Duplicate transaction-reference check; one checker at a time | Not built | — |
| Gateway rules (server check, no double count, query, refund API, real fees, payout import) | Not built (backend) | Front end only |
| Shop payment accounts / terminals / card network / holding account per provider | Partly built | Holding account per partner; one card machine |
| Terminal end-of-day batch match | Not built | — |
| Shift close per account | Not built | Per method only |
| COD payout exceptions (not remitted, short, fee mismatch, return charged as delivered, unknown parcel, duplicate line) | Partly built | Short/extra explained by reason; paste-and-match a partner statement |
| Refund stages, approval threshold, age, failed queue | Not built | PIN only for late returns |
| Refund before payout removes the money from the payout | Built | `settlements.js` |
| Payment link record (amount, expiry, one-time or reusable, paid state) | Not built | — |
| Partner statement fee wins over the set % | Partly built | "Higher fee" reason |
| Separate permissions for setup, checking, refund approval, matching | Partly built | Role menus + manager PIN audit log |
| Payment-account settings with start/end dates and history | Not built | — |
| Keys encrypted and write-only | Not built (backend) | Stored in the browser |
| *Build-only:* working-day payout calendar (BD holidays), delay, wallet withdraw (EPS), 8 PM evening check | Built | `settlements.js`, `EveningCheck.jsx` |

#### Built differently / conflicts in #5

- **"On hold".** In the brief, it means a manual payment is waiting to be checked. Today it means a COD order waiting for a verification call.
- **Payouts.**
  - The brief puts gateway and COD payouts in a Payments workspace. Today they are in Money › Payouts.
  - Partner holding accounts are ledger accounts, so neither side keeps a second balance. Only the screen location differs.
- **Gateway setup has three entry points today:** Settings › Payment Gateway, `/connections` and Money setup › Payment partners. The brief wants one Payments Setup.
- **Due/credit** is still a payment button, but it behaves as an unpaid invoice.
- **Wallet top-ups** are a manual MFS check queue outside Orders. The brief only covers order payments.
- **Inside the brief.** §0A/§6 move COD payouts into Payments, but its Bangladesh table says COD remittance stays in Delivery Operations.
- **Across briefs.** The owner of exchange rates differs: #5 says Settings/Finance, #16 says Finance later, #6 says not in v1.

Coverage: brief tables 39 rows (7 + 13 + 19) · reported 39.


### Finances · #6 Finance & Cash Management

*Brief v1.0, 29 Sep.*

**Nayeem's decision.**
- **Day-to-day money control first, not a full accounting system.**
- Every money account's balance is worked out from its movements, never typed in. Movements can only be added, never changed.
- Movements are matched against statements, and differences become exceptions.
- Six areas in plain shop language. No chart of accounts, journals, trial balance or statutory VAT in v1.

**Owns:**
- money accounts and balances;
- cash custody per branch and register (drawer, safe, petty cash, bank, MFS, holding, in transit);
- transfers, expenses and other money in/out;
- cash handover;
- opening and closing adjustments;
- approved shortages and overages;
- customer dues, their age and credit exposure;
- bank/MFS statement matching;
- owner money in/out;
- an audit of who handled the money.

**Does not own:** customer payment records, the supplier bill ledger, the POS cashier flow, orders and invoices, stock, promotions, payroll, journals, statutory VAT, the formal P&L.

**Today:**
- Ledger: `src/lib/ledger.js` (accounts + every movement; balances = opening + movements).
- Seven Money pages: Money overview, Cash/bank & wallets, Dues, Payouts, Income & expenses, Bills to pay and Money setup.
- Also `/account-reports`, `/sales-profit` and VAT.

#### Screen by screen

| Brief's area | Today in the build | Nayeem proposes | Status | Evidence | UX move |
|---|---|---|---|---|---|
| POS open (design gap) | `/pos` open-shift form | Reuse; Finance owns the drawer balance, where the float came from and any opening difference | Not built | Float typed per shift; nothing posted; differences not handled | — |
| POS close (design gap) | `/pos` close + POS manage | Finance owns drawer → safe, handover, posting shortages/overages | Partly built | Pickups during a shift post drawer → safe/bank/head office; closing difference saved on the shift only | — |
| Suppliers (design gap) | `/suppliers`, `/supplier-detail`, `/purchases` | Integration only; Purchase owns bills; Finance records which account paid | Built | Supplier payment posts to the chosen account | — |
| Payment settings (design gap) | GatewayList + GatewaySetup | Integration only | Built | Setting up a gateway creates its holding or direct account | — |
| Payments & settlement (design gap) | `settlements.js` + holding accounts | Link the records, don't duplicate them | Built | — | — |
| Dashboards (design gap) | Home, Money overview | Read Finance figures only | Built | `AccountsHome.jsx` | — |
| Console invoices / collections / adjustments (design gap) | Console pages | Keep out of merchant Finance | Built | Merchant side only posts its GridCommerce bills as expenses | — |
| Action: merchant Finance module | Money group (7 pages) + reports | Six bounded areas | Built differently | — | "Money" (7 pages) → "Finance" (6 areas) |
| Action: money accounts | `ledger.js` accounts | Drawer, safe, petty cash, bank, MFS, card holding, COD holding, cash in transit | Partly built | Types Cash / Bank / Mobile / Holding; one "Counter drawers" and one "Shop safe"; no petty cash or in-transit; not tied to a branch | — |
| Action: balance | `balanceOf` | Always worked out, never typed over | Built | Opening + entries; no balance edit | — |
| Action: money movement | `postEntry` | Add-only, with ID, source, who, approval, reversal, matching | Partly built | Entry has id/at/account/amount/kind/ref/party/note/by; no status, approver, attachment or reversal link; date can be back-dated | — |
| Action: Finance overview | `/accounts-home` | Money position + exceptions | Built | Cash / In banks / Mobile wallets / On the way + "Needs you" | — |
| Action: expenses | `/expenses-bills` | Category, account, branch, payee, receipt, approval | Partly built | No receipt, branch or approval | — |
| Action: owner money in/out | `/money`, `/expenses-bills` | Kept apart from sales and expenses | Built | Owner-money types, left out of P&L | — |
| Action: internal transfer | "Move money" in `/money` | Fees, pending / in transit / received, handover | Partly built | Posts both sides; no fee or confirmation | Money dialog → own "Transfers" area |
| Action: cash in transit | — | Add (advanced) | Not built | A bank-deposit pickup goes drawer → bank directly | — |
| Action: POS opening float | `/pos` | Connect to Finance | Not built | — | — |
| Action: POS cash drop | POS cash pickup | Finance movement | Built | Drawer → safe/bank pickup | — |
| Action: POS shortage/overage | `/pos` close | Post approved shortage/overage | Partly built | Saved on the shift, not posted, no approval | — |
| Action: branch daily close | — | Add | Not built | Only an alert when drawers hold over ৳50,000 | — |
| Action: receivables | `/dues` "You will get" | Outstanding, age, exposure, allocations, advances, write-offs | Partly built | Age from invoice date; customer credit/advance; credit limit at POS; no write-off; one payment pays one invoice | — |
| Action: supplier bills | `/suppliers`; `/dues` "You owe" | Don't duplicate in Finance | Built differently | Paid on Suppliers; Dues shows them aged, read-only | — |
| Action: gateway/card holding | Holding accounts | Add the account | Built | Payout posts to the bank plus the fee | — |
| Action: COD holding | Courier holding accounts | Add the account | Built | — | — |
| Action: bank/MFS statement matching | `/settlements` payout dialog | Statement import and matching | Partly built | Paste a partner payout statement only; `/reconciliation` redirects to `/settlements` | — |
| Action: profit & loss | `/account-reports`, `/sales-profit` | Leave to Analytics (#14) | Built differently | P&L, cash flow, partner fees and VAT sit inside Money | Money › reports → Analytics |
| Action: full accounting | `/chart-of-accounts`, `/journals`, `/vat` | Out of v1 | Built differently | Under Money setup › Advanced; chart of accounts and journals are static design screens | — |

#### New capabilities in #6

| Proposal | Status | Evidence / note |
|---|---|---|
| Six areas: Overview · Money accounts & activity · Cash & expenses · Transfers · Receivables · Closing & reconciliation | Partly built | Overview ✓, Money ✓, Income & expenses ✓; transfers only as a dialog; Dues partly; closing/matching = Payouts + evening check, no branch close |
| Child workflows (expense, money in/out, transfer, handover, count, opening balance, statement import, match, adjustment/reversal) | Partly built | Expense, in/out and transfer exist; opening balance only when an account is added; invoice payment edit/void posts corrections; no count, import or general reversal |
| Account properties (currency, branch, roles, matching, linked payment account, last matched, status) | Not built | Name, type, brand, opening only |
| Block deactivating an account that holds money | Not built | Accounts can't be deactivated at all |
| Expected drawer = float + cash sales − refunds + added − drops − payouts ± adjustments | Built | `posStore.js:125` |
| Block two shifts on the same drawer | Not built | — |
| Editable expense categories; old entries keep their category | Built | Archive keeps the name; each category is also tied to a sales channel (build-only) |
| Approval limits by amount, category, account or branch | Not built | Manager PIN covers POS and stock only |
| Separate duties (cashier, custodian, approver, reconciler) | Not built | No finance role; Money is CEO-only (+ HR for Bills to pay) |
| One payment across several invoices; write-offs | Not built | — |
| Statement import that can be re-run safely | Not built | — |
| *Build-only:* GridCommerce platform costs posted as expenses | Built | `platformCosts.js` |
| *Build-only:* Bills to pay (salaries, commission, affiliate payouts, promotions) | Built | `liabilities.js` |

#### Built differently / conflicts in #6

- **Name and shape.** The brief: "Finance", six areas. Today: "Money", seven pages.
- **P&L and VAT.** The brief leaves P&L to Analytics and keeps VAT, chart of accounts and journals out of v1. Today Money hosts P&L, Sales & profit and VAT (Mushak 6.3/9.1), with chart of accounts and journals under Advanced.
- **Payroll and supplier bills.** The brief says others own them. Today "Bills to pay" holds the salary debt made when payroll is approved, and Dues shows supplier bills read-only.
- **Matching.** The brief means bank and MFS statement matching. Today it means confirming partner payouts (arrived / other amount / not yet) plus the evening check.
- **Branches.** Today money accounts are company-wide, with one drawer account and one safe. The brief scopes them per branch and register.
- **Dates.**
  - The brief keeps the business date apart from the posting time. Today the Money dialog uses the chosen date as the entry time.
  - The demo-only "Reset demo money data" deletes entries.
- **Old baseline.** The brief says there is no merchant Finance UI. Today there is a working ledger, payouts, dues and expenses.
- **Across briefs.** #5 puts payout matching in Payments Operations, and #6 puts statement matching in Finance. Today one page (`/settlements`) does both.

Coverage: brief tables 27 rows (7 + 20) · reported 27.


### Analytics · #14 Tracking, Analytics, Reports & Profitability

*Brief v1.0, 30 Sep.*

**Nayeem's decision.**
- Keep all eight tracking screens and the Team report.
- **Analytics Hub** becomes the main analytics entry, and **Reports & Alerts** the main custom and scheduled reporting workspace.
- No new page: profitability becomes a view inside them.
- Supporting rules:
  - one event schema;
  - one **versioned metric dictionary**;
  - an explicit **date basis** (placed / paid / delivered / cash);
  - attribution labelled with its model;
  - visible **cost completeness**.

**Owns:**
- the event schema and pipeline, deduplication and health;
- UTM normalisation;
- attribution models;
- the metric dictionary and date bases;
- profitability;
- report definitions, schedules and exports;
- alerts;
- data freshness.

**Does not own:** source transactions, the inventory cost engine, Finance, customers, promotions, message sending, support, storefront, roles, statutory accounting.

**Today:**
- The working reporting system is the **Reports centre**: `/reports-centre` and `/report?id=`, with definitions in `src/lib/reports/defs/*`. It has periods, compare, filters, a column chooser, CSV, a letterhead PDF, saved views and schedules.
- Sales & profit (`/sales-profit`, `src/lib/profit.js`) and the daily summary run on the same shared books.
- The 8 tracking/analytics screens are design conversions with their own static numbers. They are reached as page links inside Reports, except Pixels & events, Event health and Setup guides, which are in the Marketing menu.

#### Screen by screen

| Brief's area | Today in the build | Nayeem proposes | Status | Evidence | UX move |
|---|---|---|---|---|---|
| Analytics Hub | `/analytics-hub` | Widen to business analytics with Overview / Profitability / Marketing / Customers views; show the date basis and "data through" | Partly built | Periods, previous period, claimed vs delivered, leaks, new vs repeat, messages → orders; headline still ad-centric; numbers static | Not in the menu (a Reports page link) → the main analytics entry |
| Analytics Hub · "Real return" | `/analytics-hub` | Rename to Delivered ROAS; "platform claims" → "platform-reported" | Not built | Tile and chart label unchanged | — |
| Analytics Hub · delivered revenue | `/analytics-hub` | Choosable basis (placed / paid / delivered / cash), labelled on every chart | Not built in the hub | Delivered basis only; other bases live in separate reports | — |
| Campaigns & creatives | `/campaigns` | Columns: delivered orders, attributed net sales, delivered ROAS, RTO, return rate, contribution after ads, coverage | Partly built | Spend, delivered, cost per delivered, return rate, budget pace, search terms; no contribution or coverage | Reports page link |
| Campaigns · "judged after courier and return cost" | `/campaigns` | Don't squeeze sales and costs into one number | Not built | "Real return" subtracts courier, return and packing costs and is the default sort | — |
| Attribution · "Who really brought the sale" | `/attribution` | Rename; show model and window; keep self-reported source apart | Partly built | Title unchanged; credit window; "How did you hear about us" shown separately | Reports page link |
| Attribution · creator codes | `/attribution` | Explicit rule/view, not a silent override | Built (separate section) | No rule setting | — |
| Attribution · UTM builder | `/attribution` | Taxonomy and aliases, campaign/creator IDs, landing reference, raw + cleaned values | Partly built | Builder with lowercase/dash note | — |
| Products & traffic · "Profit after ads" | `/products-traffic` | Rename to Contribution after ads; show cost completeness and how ad spend was split | Not built | Headline and catalogue entry still say "profit after ads" | Reports page link |
| Products & traffic · "each ৳100" | `/products-traffic` | Use the defined profitability ladder | Partly built | Breakdown exists, not the defined ladder | — |
| Products & traffic · funnel / landing pages / search | `/products-traffic` | Coverage and sample size; zero-result searches as a demand signal; SEO links out | Partly built | Biggest leak, no-result searches, Search Console, "Fix in SEO" → `/set-seo`; no coverage | — |
| Pixels & events | `/pixels-events` | One Grid event schema mapped to each platform; dedup by event identity | Partly built (UI only) | Event map, "Delivered is the conversion that counts", retry; no schema | Marketing › Ads tracking |
| Pixels & events · "raw data never leaves" | `/pixels-events` | Replace the absolute privacy claim | Not built | Text unchanged | — |
| Event health · browser vs server | `/event-health` | Show coverage, dedup rate, failures, lag; don't call the gap "missed sales" | Partly built | Chart, live feed with dedup status, missing details / queues | — |
| Event health · Google consent wording | `/event-health` | Remove the universal promise | Not built | "Google still gets anonymous signals when someone says no" | — |
| Event health · data-sharing log | `/event-health` | Fields, hashing, consent state, result; restricted access | Partly built | — | — |
| Ad connections | `/ad-accounts` + `/connections` | Last successful sync, "data through", missing-permission state; secrets stay in Settings | Partly built | Token and sync health; hub last-sync and attention notes; no "data through" or permission state | Connecting moved to Connections; this page renamed "Ad accounts" |
| Reports & Alerts · alerts | `/reports-alerts` | Alerts on a defined metric with filters, period, threshold, consecutive periods, cooldown; sent via Communications | Partly built (static) | Rules and recipients; metric list includes "Real return"; no cooldown; Reports centre has no alerts | Reports page link |
| Reports & Alerts · custom report | `/reports-alerts` + `/reports-centre` | Filters, basis, segment, cost completeness, saved views, permissions; metrics from the dictionary only | Built differently | The static builder vs the working Reports centre (period, compare, filters, columns, CSV, PDF, saved views, schedules); no dictionary or basis choice | Proposed main page: Reports & Alerts. Build's main page: Reports centre |
| Team report | `/team-report` | Keep as a prebuilt report; rename "Revenue from chat" | Partly built | Listed in Reports; label unchanged | Already in Reports |

#### New capabilities in #14

| Proposal | Status | Evidence / note |
|---|---|---|
| Versioned metric dictionary | Not built | Shared libraries give the same figures to Home, Reports and Sales & profit; the analytics pages use their own static numbers |
| Profitability ladder: gross profit → contribution before ads → after ads → operating profit | Built differently | `profit.js`: net sales − COGS = gross profit − channel costs = channel profit − shared costs + other income = **net profit**; on `/sales-profit` and P&L reports |
| Cost completeness: complete / estimated / partial / missing | Partly built | COGS "~ estimated" flag; VAT "estimate"; nothing for courier or ad spend |
| Date basis shown next to the date picker | Built differently | Separate reports per basis (sales on the day made, cash-basis P&L, COD payouts, order funnel); no basis picker |
| Delivered ROAS and cost per delivered order | Partly built | Report "Ad spend & ROAS" (ROAS = all online sales ÷ spend); cost per delivered order |
| Platform-reported figures kept beside Grid's own | Partly built | Hub side-by-side (static) |
| Customer return kept apart from courier RTO | Built | Separate RTO and returns reports |
| Customer shipping charge apart from courier cost | Partly built | Delivery charges booked as a channel cost |
| Ad-spend facts and allocation method | Partly built | `adSpend.js` (entered by hand, posted to the ledger); split by spend; "not matched" rows; no platform import |
| Attribution models with versions; raw touchpoints kept | Not built | — |
| Standard event schema, dedup on intake | Not built | UI only |
| Alert engine | Not built | — |
| Scheduled reports sent through Communications | Built differently | Automation › Scheduled reports (email/WhatsApp, PDF/CSV, test preview); "sending needs the server" |
| "Data through" / "as of" times | Partly built | "As of" on snapshot reports |
| Customer lifetime value | Built | "Customer value" report |
| Team report refinements (7 rows) | Partly built | "Team inbox" report computed from inbox data; CSAT and roster insight static |

#### Built differently / conflicts in #14

- **Main analytics page.** Today the Reports centre is the main reporting page, and Analytics Hub, Campaigns, Attribution, Products & traffic, Reports & Alerts and Team report are links inside it. The brief makes Analytics Hub and Reports & Alerts the main pages.
- **"Net profit".** Today's ladder ends at net profit plus a simple balance sheet. The brief stops product-level views at "contribution after ads" and warns against statutory-profit claims.
- **Wording the brief flags is still in the code:** "Real return", "Who really brought the sale", "Profit after ads", "raw data never leaves", "Google still gets anonymous signals", "Revenue from chat".
- **Two sets of numbers.** The analytics pages show their own static figures, which don't match the shared-library numbers on Home and in Reports. This is the risk the brief's "one metric definition" rule is meant to remove.
- **Across briefs.**
  - Scheduled reports and alerts go through Communications in both #14 and #11; today they sit under Automation.
  - #15's consent banner vs #14's consent settings: today the settings are in Event health only.

Coverage: screen table 20 rows · reported 20. The brief's 9 snapshot rows, 18 action rows and 7 Team-report rows are covered above.


### Online Store · #15 Storefront, Checkout, Landing Pages & Reviews

*Brief v1.0, 30 Sep.*

**Nayeem's decision.**
- Keep the Landing page builder, Offers and Offer detail.
- Add exactly three workspaces:
  - **Storefront & Theme**;
  - **Checkout & Customer Account**;
  - **Reviews**.
- Everything runs on one commerce runtime. Storefront pages only display facts that other areas own.

**Owns:**
- the storefront runtime;
- themes, templates, navigation and pages;
- landing pages;
- the cart and checkout experience;
- guest and account experience;
- search, filters and wishlist;
- the thank-you and order-status pages;
- offer pages;
- reviews and moderation;
- SEO rendering;
- the consent banner;
- publish, versions and rollback;
- performance and accessibility.

**Does not own:** prices and variants, stock, orders and fulfilment, payments, courier booking, customers, promotion maths, loyalty, after-sales, attribution, credentials, domains/SSL.

**Today:**
- "Online store" in the menu opens the Landing page builder (`/landing-page-builder`).
- `/offers`, `/offer-detail` and `/checkout` are design conversions with demo data.
- `/order-link` creates real orders.
- Selling also happens through WooCommerce/Shopify sync and the WordPress-synced blog.

#### Screen by screen

| Brief's area | Today in the build | Nayeem proposes | Status | Evidence | UX move |
|---|---|---|---|---|---|
| Landing builder · step 1 product | `/landing-page-builder` | Keep product from the catalogue with price/stock/variants/reviews; add publishable status and availability reason | Partly built | Demo product rows; no catalogue import; no publishable state | — |
| Landing builder · templates | same | Keep the 4 starting templates; rename "COD" to "Direct order / COD" | Built (rename not done) | "COD single product" … "Blank page" | — |
| Landing builder · parts library | same | Shared block IDs and versions; Reviews block reads real reviews; Bundle block reads Promotions | Partly built | Reviews / Bundle / Upsell blocks are static | — |
| Landing builder · direct order form | same | Same checkout checks, duplicate-order protection, delivery zones and payments; no direct order insert | Partly built | Bangla form not wired to orders; delivery ৳70/৳130 vs Settings ৳70/110/150; the working direct-order path is `/order-link` | — |
| Landing builder · 4 fields, no account, no OTP | same | OTP becomes a merchant/risk setting | Not built | Fixed label | — |
| Landing builder · AI writing | same | Extend the "no AI" rule to delivery promise, warranty, offer terms, ratings, returns | Partly built | "Price, stock and variants have no AI"; Rewrite/Generate | — |
| Landing builder · publish checks | same | Broken references, checkout readiness, legal pages, accessibility/performance, versions and rollback | Partly built | Must-fix list, mobile warning, "check on my phone first"; no versions | — |
| Offers page | `/offers` | All values from the Promotions engine; "Remind me" through Communications; items link to product views | Partly built | Static offers; "Remind me" only changes the page; countdown on the browser clock | — |
| Offers · "best offer picked at checkout" | `/offers` + `/checkout` | Promotions works out the best offer; checkout explains why | Not built | Checkout only applies EID300 and a bKash 10% offer | — |
| Offer detail | `/offer-detail` | Terms and payment rules generated from Promotions/Payments | Built (static) | Hand-written terms | — |
| Reviews (UI kit specimen) | `/dev/ui-kit08-commerce` | Promote to a real Reviews workspace | Built differently | No product reviews; Google Business location reviews with reply and AI draft; Inbox Reviews view | → new Reviews workspace |
| Checkout (site map: "intended, not designed") | `/checkout` | A canonical checkout | Partly built (brief's baseline is old) | `/checkout` has details, 3 zones, 5 payment methods, coupon, confirmation, on a demo cart; creates no order | — |
| SEO / Media / General settings | `/set-seo`, `/set-media`, `/set-general` | Used through Settings | Built | — | Media library is in the Products menu |

#### New capabilities in #15

| Proposal | Status | Evidence / note |
|---|---|---|
| **Storefront & Theme** workspace | Not built | "Online store" opens the landing builder; Theme/Navigation entries were merged into it in the UX audit |
| Theme model and templates (Home / Product / Collection / Search / Content / 404) with dynamic data | Not built | — |
| **Checkout & Customer Account** editor | Not built | Customer pages exist: `/checkout` (static), `/order-link` (real order) |
| Cart: cart ID, recheck on change, guest/account merge | Not built | Fixed item list |
| Place-order duplicate protection | Not built | — |
| COD treated as a collection method, not "Paid" | Built differently | New COD order → On hold; order link sends COD vs Unpaid |
| Thank-you page shows the real payment state | Partly built | Online payment shows "Payment received" at once |
| Customer order-status page | Not built | SMS templates link to `/track/…`, which has no page |
| "Offers for you" / best offer | Not built | — |
| Customer account; OTP sign-in; guest claims an account | Not built | — |
| Storefront search, filters, wishlist | Not built | Only as recovery and analytics data |
| **Reviews** workspace: verified buyers, review requests | Not built / Built differently | Review request is an SMS automation rule |
| SEO: canonical, sitemap, robots, structured data, landing-page index rule | Partly built | Global SEO fields only |
| Tracking consent banner | Built differently | Configured in Event health › Consent & privacy |
| Publish versions and rollback | Not built | Builder has blockers only |
| Single-product landing pages for v1; Landing pages workspace kept | Built | — |

#### Built differently / conflicts in #15

- **Old baseline.** The brief says Cart/Checkout was never designed, but `/checkout` and `/order-link` exist.
- **"Online store".** Today there is no Storefront & Theme workspace; "Online store" is the landing builder, and Theme/Navigation were merged into it. The brief adds Storefront & Theme as a new permanent workspace.
- **External stores.** Today selling also runs through WooCommerce and Shopify sync, `/woo-sync`, and a WordPress-synced blog. The brief assumes a Grid-native storefront and does not mention WooCommerce.
- **Delivery charges disagree today.** The landing preview says ৳130 outside Dhaka; Settings, Checkout and the order link use ৳150.
- **COD naming.** The brief says "Unpaid · COD". Today the status is "On hold" and the payment is COD.
- **Reviews.** Today there are Google location reviews only. The brief requires verified-buyer product reviews.
- **Across briefs.**
  - Consent banner (#15) vs consent settings (#14): today the settings are in Event health only.
  - Review requests should be sent by Communications (#11); today an Automation rule sends them.

Coverage: screen table 11 rows + 2 snapshot rows · reported 13. The brief's 6 snapshot rows, 4 structure rows and 16 action rows are covered above.


### Platform · #16 Settings, Billing & Merchant Configuration

*Brief v1.1, 30 Sep (post #12–#15 integration, freeze candidate).*

**Nayeem's decision.**
- **Keep the Settings shell:** grouped menu, search down to single fields, pinned save bar, and the unsaved / secret / connection-test patterns.
- Every rule has one owner. Settings shows it and links to it; the owning area defines how it works.
- **Add:**
  - Plan & Billing;
  - Usage & Limits;
  - Tax & Documents;
  - Locations;
  - a structured business profile.
- **Remove** server storage and backup settings for normal merchants.
- **Replace** the one store API key with several named keys, each with limited access.

**Owns:**
- the settings shell, search, saving and history;
- business, legal and billing profile;
- locale and defaults;
- location profile;
- tax registrations, rates and document numbering;
- the GridCommerce subscription and billing;
- plan limits and usage display;
- the connections and keys list;
- states for settings the plan doesn't include.

**Does not own:** payment records, delivery operations, message sending, the POS register, staff and roles, stock and pricing, campaigns, platform storage and backups, statutory filing.

**Today:**
- The settings pages from the design (General, Payments, Delivery, SEO, Security, Storage, AI, Preference) keep values only while the page is open.
- Settings that drive behaviour live in the shared logic: gateways, notifications, stock setup, POS settings, Money setup and VAT.

#### Screen by screen

| Brief's area | Today in the build | Nayeem proposes | Status | Evidence | UX move |
|---|---|---|---|---|---|
| General (snapshot) | `/set-general` | Keep; expand the business profile | Not built | Store identity / formats / brand / support / location; trade licence inside the copyright text | — |
| Media (snapshot) | `/set-media` | Keep | Built | "Brand assets"; opened from Products › Media library | Settings › General → Products › Media library (done) |
| Preference (snapshot) | `/set-preference` | Split by owner | Partly built | Order emails moved to Notifications; IDs, security, seller approvals stay | — |
| Payments (snapshot) | `/set-payments` | Follow the Payments brief | Partly built | See #5 | — |
| Delivery (snapshot) | `/set-delivery` | Keep and refine | Partly built | Fixed Inside / Sub / Outside Dhaka fields | — |
| AI (snapshot) | `/set-ai` | Settings keeps provider, model, budget; Communications owns behaviour | Not built | Channels, office hours, escalation still here | — |
| Usage (snapshot) | `/set-usage` | Keep as AI Usage | Built | Titled "AI Usage"; credits are separate | — |
| Rules (snapshot) | `/set-rules` | Owned by Communications | Not built | Under Communication in the settings menu | — |
| SEO (snapshot) | `/set-seo` | Split SEO from tracking | Not built | GA and Pixel IDs still here | — |
| Storage (snapshot) | `/set-storage` | Remove for normal merchants | Not built | Also listed in Connections › Devices & tools | — |
| Security (snapshot) | `/set-security` | Split API key from platform backups | Not built | One app API key, Drive token, mysqldump path | — |
| Settings shell | `SetRail.jsx` + `SetChrome.jsx` | Add an Account & Billing group; explain plan-locked settings with an upgrade action; search shows owner | Partly built | Groups: Store, Commerce, Notifications, Communication, Discovery, Platform; billing pages sit under Settings in the main menu; sections not in the edition are hidden | — |
| Settings search | Settings menu search | Field-level search with owner label and link | Partly built | Matches section names only | — |
| Unsaved / dialog / save bar | Save bar | Warn when another admin saved the same setting | Partly built | Unsaved count, discard with undo, Ctrl+S; no leave-page dialog or conflict state | — |
| General (recheck) | `/set-general` | Split brand / legal / contact / billing; add units; warn before changing currency or country | Not built | — | — |
| Media (recheck) | `/set-media` | Rename seller-specific uses when there's no marketplace | Partly built | "Seller profile" uses remain | — |
| Preference · identifiers | `/set-preference` | Move to "Documents & IDs" | Not built | Customer / seller / admin / order prefixes | → Documents & IDs |
| Preference · security | `/set-preference` | Admin sign-in security → Staff & Security; delivery OTP → Sales/Delivery | Not built | Admin OTP and delivery OTP fields | → Staff & Security (#18) |
| Preference · order emails | `/set-preference` → `/set-notifications` | Link to Communications | Built | — | Done: Preference → Notifications › Order notifications |
| Preference · seller approvals | `/set-preference` | Hide unless marketplace is on | Not built | Shown for everyone | — |
| Payments (recheck) | `/set-payments` | Remove discount, rates, provider claims, old API links | Not built | — | — |
| Delivery (recheck) | `/set-delivery` | Named zones; courier cost as an estimate; per-place overrides; start dates | Not built | — | — |
| AI (recheck) | `/set-ai` | Remove channels, office hours, escalation; link to Communications | Not built | — | → Communications |
| Usage (recheck) | `/set-usage` | AI Usage, apart from plan usage | Built | — | — |
| Rules (recheck) | `/set-rules` | Communications-owned or linked | Not built | — | — |
| SEO (recheck) | `/set-seo` | Remove GA and Pixel IDs | Not built | GA4 and Meta Pixel also in Connections | SEO tracking IDs → Connections › Ads & tracking |
| Storage (recheck) | `/set-storage` | Not for normal merchants | Not built | — | — |
| Security · app API key | `/set-security` | Named keys with limited access, expiry, last used, rotate/revoke | Not built | Single key with Regenerate | — |
| Security · backups | `/set-security` | Managed backup status, export, restore request only | Not built | Drive token, folder IDs, mysqldump path | → Platform console (#19) |
| Action: settings shell | SetChrome / SetRail | Keep and freeze | Built | Grouped menu, save bar, field-tips switch | — |
| Action: one owner per rule | — | Refine | Partly built | Notifications moved out; Connections is the central list | — |
| Action: General | `/set-general` | Structured profiles | Not built | — | — |
| Action: Locations | `locations.js`; Warehouses, Branches | A Settings view of the shared location list | Built differently | One list of places, managed under Products & stock | Warehouses & branches → Settings › Locations |
| Action: Tax & Documents | `/vat` (Money setup › Advanced) | Add a tab | Built differently | BIN, rates by category, Mushak forms; used by POS and the sales book | Money › Setup › VAT → Settings › Tax & Documents |
| Action: Plan & Billing | `/subscription` | Permanent page | Partly built | Edition card, modules (trial / activate / stop at renewal), billing history, saved card, auto-renew; no billing profile, change preview or grace period | — |
| Action: Usage & Limits | `/credit-wallet` | Plan meters and limits | Not built | Credit usage only | — |
| Action: AI usage | `/set-usage` | Keep | Built | — | — |
| Action: Preference | `/set-preference` | Split | Partly built | Only notifications moved | — |
| Action: Payments | `/set-payments` | Apply #5 | Not built | — | — |
| Action: Delivery | `/set-delivery` | Generalise | Not built | — | — |
| Action: SEO | `/set-seo` | Split | Not built | — | — |
| Action: Storage | `/set-storage` | Remove for normal merchants | Not built | — | — |
| Action: Backups | `/set-security` | Move to the platform | Not built | — | — |
| Action: API key | `/set-security` | Named, limited keys | Not built | — | — |
| Action: plan-locked settings | `RoleGuard.jsx` | Explain and offer an upgrade | Partly built | Page-level "Not in {edition}" lists which editions include it; settings sections are just hidden | — |
| Action: marketplace leftovers | Preference, Media | Hide unless marketplace | Not built | — | — |
| Action: After-sales (#12) entries | — | Add to settings search | Not built | Return days live in POS settings | — |
| Action: Recovery (#13) entries | — | Add | Not built | — | — |
| Action: Analytics (#14) entries | — | Refine | Not built | — | — |
| Action: storefront / domain | — | Expand | Not built | Console `/domains` only | — |
| Action: consent / privacy | — | Formalise | Not built | — | — |
| Action: plan downgrade check | `/subscription` | Show what a downgrade affects | Not built | Module "Cancel" says it stops at renewal | — |

#### New capabilities in #16

| Proposal | Status | Evidence / note |
|---|---|---|
| Settings entries for After-sales, Recovery, Analytics, Storefront | Not built in Settings | Owner pages exist; no domain, checkout, review or policy-page settings |
| Settings groups (Business / Commerce / Comms & AI / Integrations & Security / Account & Billing / Advanced / Customer experience) | Built differently | Six menu groups + Settings menu items + `/connections` |
| Brand / legal / contact / defaults / billing profile | Not built | — |
| Warning before risky changes (currency, country, timezone) | Not built | Help text only |
| One shared location list; block deactivation while something depends on it | Built differently | `locations.js`; places with stock, holds, transfers or counters can't be closed; not a Settings view |
| Tax registrations, classes and rates with start dates; legal identity on invoices | Built differently | `/vat`; no start dates |
| Plan & Billing (cycle, charges, method, profile, bills, change preview, trial/grace/cancel) | Partly built | `/subscription` + edition card |
| Usage & Limits meters | Not built | Only in the platform console |
| Connections list with one card pattern | Built differently | `/connections` + `/connect` |
| Named API keys with limited access | Not built | — |
| Save-conflict warning; leave-page dialog | Not built | — |
| Settings change history | Not built | Design-form values live only in page state |
| Settings registry (owner, link, permission, plan) for field search | Not built | — |
| Keys shown once, then only replaced; any reveal recorded | Partly built | Masked; secrets hidden while typing |
| Separate consent types (marketing, limits, cookies, legal) | Not built | — |
| Domain settings (subdomain, custom domain, SSL) | Not built | — |
| Billing limited to the owner / billing admin | Built differently | CEO and CTO can open billing |
| POS defaults in Settings | Built differently | POS settings tab in POS manage; the settings-menu "POS" item has no screen |
| *Build-only:* Profile type, Stock setup, Order notifications, edition switcher | Built | — |

#### Built differently / conflicts in #16

- **Most design-based settings forms don't save.** Their values are lost when the page closes and nothing else reads them. Working settings live in the shared logic.
- **Billing placement.** The brief puts Plan & Billing and Usage in an "Account & Billing" group inside Settings. Today they are items under Settings in the main menu, outside the settings-page menu.
- **Connections.** The brief keeps mail, SMS and social connections as Settings tabs. Today every outside connection moved to `/connections`, and those settings items open it.
- **Tracking IDs in two places.** The brief moves them to Analytics. Today GA4 and Meta Pixel are in Connections, while the SEO page still holds the IDs.
- **Courier cost in two places.** Today it is in the Delivery form (form only) and in Money setup › Payment partners as a per-zone charge, which orders actually use.
- **Tax.** Today tax sits in Money › Setup › VAT, including Mushak forms. The brief puts tax in Settings and keeps statutory filing out.
- **Locations** are managed in Warehouses and Branches, not Settings.
- **Old baseline.** The brief counts 24 settings artboards; the build has 17 settings files.
- **Across briefs.** The exchange-rate owner is unresolved, and delivery OTP and admin 2FA are still in Preference.

Coverage: brief tables 52 rows (11 + 18 + 23) · reported 52.


### Platform · #18 Staff, HR, Roles & Security

*Brief v1.0, 30 Sep. Proposed home: Staff & HR (promoted for HR and manager roles).*

**Nayeem's decision.**
- **A login, a person's access to one merchant, and an employee/HR record are three separate things.**
- Add exactly one new workspace, **Roles & Security**, with five parts: Roles · Access policies · Sessions & devices · Security policy · Access audit.
- Roles move out of HR setup, and access must work even when HR/Payroll is switched off.
- HR and Payroll stay optional, with versioned policies and money linked to Finance.

**Owns:**
- membership;
- roles, the permission catalogue, scope and personal overrides;
- data visibility and limits;
- staff sessions, devices and security policy;
- employee profile and departments;
- shifts and roster;
- attendance, leave and holidays;
- payroll and loan schedules;
- staff documents;
- on- and offboarding;
- the staff audit view.

**Does not own:** Grid's own staff, merchant billing, customers, payments, Finance balances, POS sales, platform audit, API secrets and backups.

**Today:**
- The HR pages run on `src/lib/hr.js`: dashboard, staff, attendance, shifts, leave, payroll, loans, positions, ID cards, devices, pay changes, gratuity and salary statements.
- One staff profile (`/staff-profile`, 8 tabs) and a 7-step Add staff flow.
- Menu roles are in `src/lib/team.js`: 13 fixed demo roles.

#### Screen by screen

| Brief's area | Today in the build | Nayeem proposes | Status | Evidence | UX move |
|---|---|---|---|---|---|
| All staff | `/all-staff` | Keep as the staff directory | Built | Rebuilt on `hr.js` | — |
| HR dashboard | `/hr-dashboard` | Keep | Built | Rewritten 2 Oct: counters, attention, on duty, approvals drawer, payroll, next dates | Headcount/history/charts → their own pages (done) |
| Attendance | `/attendance` | Keep; harden timekeeping | Partly built | One record per person per day with source; fix requests; register | — |
| Shifts | `/shifts` | Keep | Built | Definitions, roster, copy week, publish, warnings | — |
| Leave | `/leave` | Keep; remove legal overclaims | Partly built | Requests, calendar, balances; "Defaults follow the Bangladesh Labour Act, 2006" still shown | — |
| Payroll | `/payroll` | Keep; add a run lock / Finance boundary | Partly built | Owner approval locks lines and creates a liability; Pay posts through the ledger; no "payment prepared" state | — |
| Loans & advances | `/loans-advances` | Keep; payout linked to Finance | Built | Payout posts a ledger entry with the loan reference | — |
| HR setup | `/hr-setup` | Keep HR settings; move roles out | Not built | "Roles and permissions" section still there | HR setup › Roles → Roles & Security |
| Staff profile | `/staff-profile` | Keep as the profile shell | Built differently | One page, 8 tabs; More menu: increment / promotion / transfer / suspend / leaving | Design fragments → tabs (done) |
| Staff overview | `?tab=overview` | Sourced metrics, no opaque score | Built differently | Attendance, job, shift, salary, leave, ID card; no sales metrics | Performance → Reports (sales by staff, staff cost vs sales) |
| Staff access | `?tab=access` | Per-person access | Partly built | Role, sign-in method, 2FA flag, place scope, discount/refund limits, phone mask, cost hidden, invite; no matrix, overrides, devices or history | Shared roles → Roles & Security |
| Staff attendance | `?tab=attendance` | Keep | Built | Month register, fix requests, machine enrolment | — |
| Staff leave | `?tab=leave` | Keep | Built | Balance, approve/reject, apply on behalf | — |
| Staff salary | `?tab=salary` | Keep; sensitive access | Partly built | Statement, loans, masked payout account, structure, gratuity; no salary-visibility lock | — |
| Staff activity | `?tab=activity` | Per-user audit view | Built differently | HR timeline only; no sales, login or permission events | — |
| Staff documents | `?tab=docs` | Harden privacy | Partly built | Checklist + upload; file details stored in the browser | — |
| Add staff | `/staff-create` | Keep; shorten by context | Partly built | Same 7 steps for everyone; "No login" hides access fields; NID optional | — |
| All staff · states | `/all-staff` | Separate employment / access / today; salary column by permission; "No login" state | Partly built | Today column separate; one Status mixes employment and access; salary always shown | — |
| Add staff · paths | `/staff-create` | Access-only path; employee-without-login path; NID not required | Partly built | No-login employee gets no account; no collaborator path | — |
| Profile · status | Profile › More | Employment state apart from access state; offboarding as a multi-step flow | Not built | "Suspend" = no shifts, no salary, login paused at once; Leaving is one dialog | Login suspension → an access control |
| Access · role matrix | `?tab=access` | Shared role matrix in Roles & Security; profile shows effective permissions and overrides | Not built | Single role dropdown; HR setup has a static role table | → Roles & Security |
| Access · permission changes | `?tab=access` | Revoked on the next request; step-up or force logout | Not built (backend) | "Sign out everywhere" is a message | — |
| Access · security | `?tab=access` | Role/risk-aware MFA, trusted devices, owner recovery | Partly built | Per-person SMS two-step switch only | — |
| Activity · audit | `?tab=activity` | Record who, approver, source, IP, device | Partly built | Manager-PIN log → Reports › Manager approvals; none on the profile | — |
| Overview · performance | Overview tab | Descriptive metrics with their basis; no score | Built differently | Moved to Reports | Profile → Reports |
| Attendance · rules | `/attendance` | POS login counts only by policy; missing/overnight/split/duplicate punches; correction lifecycle | Partly built | "POS log-in counts as clock-in" switch; overnight handled; fix wait/ok/no; no punch ledger | — |
| Attendance · geofence | HR setup | Location check at check-in/out only | Built | "Staff app check-in only inside the shop … 100 m" | — |
| Attendance · fingerprint device | `/attendance-devices` | Take in punch events, not fingerprints | Built | Enrolment keeps counts and card numbers only | — |
| Shifts · versions | `/shifts` | Draft/published versions, conflicts, overnight, revisions; publish event | Partly built | Week published time; leave / overlap / >48 h / short-cover warnings; publish SMS is a message | — |
| Leave · policy | `/leave`, HR setup | Drop the Labour Act promise; dated policy with accrual, proration, carry-forward | Partly built | Accrual, carry cap, opening balances; no start dates | — |
| Payroll · run | `/payroll` | Run lifecycle, lock, exceptions, reconciliation, corrections; payment file ≠ Paid | Partly built | Check → review → approve (lock) → pay → payslips; no bank/bKash file; correction = a one-time line next month | — |
| Loans · payout | `/loans-advances` | Linked to Finance; early settlement / write-off | Partly built | Ledger payout, cash repayment, deducted at leaving; no write-off | — |
| HR setup · roles | `/hr-setup` | Remove; link to Roles & Security | Not built | Section links to the profile's access tab | → Roles & Security |
| HR setup · legal defaults | `/hr-setup` | Dated templates; "check current law" | Not built | "3 lates = 1 day cut", OT 2×, salary split 55/25/7.5/7.5/5; gratuity cites the Act | — |
| Salary · structure | `?tab=salary` | Dated pay structure, payroll snapshots, masked payment details, audited access | Partly built | Increments with effective month; lines frozen at approval; account masked | — |
| Documents · storage | `?tab=docs` | Encrypted private storage, signed access, retention, audit | Not built (backend) | File details in the browser | — |
| Action: All staff | `/all-staff` | Separate states; no-login and collaborator | Partly built | — | — |
| Action: profile shell | `/staff-profile` | Keep; HR tabs switch off with the HR module | Partly built | The whole profile belongs to the `hr` module | — |
| Action: Add staff | `/staff-create` | Three paths | Partly built | — | — |
| Action: staff access | `?tab=access` | Server authorisation, high-risk marks, several roles | Not built (backend) | One role per person; POS ignores per-person limits | — |
| Action: Roles & Security | — | Add one workspace | Not built | No route; closest are the roles in `team.js` and Settings › Profile type | New workspace |
| Action: HR setup roles | `/hr-setup` | Move | Not built | — | → Roles & Security |
| Action: identity model | `team.js` / `hr.js` / `posStore.js` | Identity ↔ Membership ↔ Employee | Built differently | Three unlinked lists: 13 sign-in users, 14 HR staff, 6 POS employees | — |
| Action: attendance | `/attendance` | Keep + harden | Partly built | — | — |
| Action: biometric device | `/attendance-devices` | Events, not templates | Built | — | — |
| Action: shifts | `/shifts` | Versions, conflicts, Communications event | Partly built | — | — |
| Action: leave | `/leave` | Keep, localise safely | Partly built | — | — |
| Action: payroll | `/payroll` | Keep + lock run | Partly built | — | — |
| Action: loans/advances | `/loans-advances` | Keep + Finance link | Built | No write-off | — |
| Action: salary visibility | Profile, payroll | Permission, masking, audit | Partly built | Payroll menu CEO/HR only; profile pages open to every role | — |
| Action: staff documents | `?tab=docs` | Keep + harden | Not built (backend) | — | — |
| Action: offboarding | Profile › Leaving; `/gratuity` | Multi-step flow | Partly built | One dialog: salary to last day + earned leave + gratuity − loans → liability; status Left | Multi-step workflow |
| Action: performance | Overview tab | Keep with context | Built differently | In Reports | Profile → Reports |

#### New capabilities in #18

| Proposal | Status | Evidence / note |
|---|---|---|
| **Roles & Security** workspace (5 tabs) | Not built | No route or screen |
| Identity vs membership vs employee profile | Built differently | Sign-in users and HR records are separate lists, not linked |
| One identity across many merchants | Not built (backend) | Single-merchant demo |
| Role templates (Owner / Manager / Cashier / Order confirmer / Packer / Marketer / Accountant / Custom) | Built differently | 13 fixed job roles that drive the menu + 10 login roles on staff records; no custom roles |
| Detailed permission catalogue and matrix | Not built | Roles are lists of menu items |
| Scope, data visibility and transaction limits per person | Partly built | Stored per person; not used by POS or lists |
| Manager approval identity | Partly built | Named manager + demo PIN, every try logged |
| Per-person POS PIN | Not built | Cashier picked by name at shift open |
| MFA policy / step-up / sessions & devices / force logout | Not built (backend) | 2FA flag only |
| Last-owner protection | Not built | — |
| Read-only, audited "Preview as staff" | Built differently | `?as=` / Switch account signs in fully as a demo user |
| Dated HR policies; policy version on records | Not built | Only pay changes carry an effective month |
| Bangladesh templates instead of legal claims | Not built | Labour Act wording in several places |
| Payroll states (payment prepared / partly paid / closed) | Partly built | Draft / waiting for owner / approved / paid |
| Immutable payslips sent via Communications | Partly built | Printed from locked lines; "sent by SMS" is a message |
| Roster publish → Communications event | Not built | Message only |
| CSV staff import with dry run | Not built | Import button is a message |
| Staff export with permission, masking, audit | Not built | Exports every column including salary |
| Organisation-wide access audit | Partly built | Manager-PIN log only |
| *Build-only (not in the brief):* positions & grades, ID cards & QR, attendance devices, increments & promotions, gratuity & leaving, salary statements, HR review drawer, My dashboard | Built | — |

#### Built differently / conflicts in #18

- **Where access lives.**
  - The brief makes access core and HR optional.
  - Today All staff, the profile and Add staff all belong to the `hr` module.
  - So the Connect edition, which has no `hr`, has no staff or access management; its menu access comes only from the fixed demo roles.
- **Roles.** The brief wants one Roles & Security workspace. Today there are three unlinked role sets: team roles (control the menu), login roles (on the staff record) and HR setup's static role table.
- **"Suspended".** The brief says this must not mean three things. Today Suspend means no shifts, salary on hold and login paused, all at once.
- **Legal wording.** The brief asks to remove Labour Act claims. The build has added more: gratuity citing s.2(10), an 18+ age check, and the HR setup line.
- **Finance boundary.**
  - Partly matches already: payroll approval creates a liability and payments go through the ledger.
  - But "Pay" moves the money at once, with no "file prepared ≠ paid" step.
- **Old baseline.** The brief describes a 7-tab profile with separate Access/Activity screens. Today these are tabs of one 8-tab page.

Coverage: brief tables 53 rows (17 + 19 + 17) · reported 53.


### Platform · #19 Grid Platform Console & Core Backend

*Brief v1.0, 30 Sep. This is Grid's own admin console, not the merchant app.*

**Nayeem's decision.**
- No new console screen. Harden and reconcile the 55 console screens and the 7 core backend boards.
- Replace the "48 modules / nine sets" model with a **versioned Capability Catalogue**, where each capability has one owner package.
- Tenant context is resolved on the server, and platform and merchant identities are separate.
- One time-boxed **Support Access Session** replaces "view as owner".
- Entitlement, feature flag and staff permission are three separate checks.
- Billing is collected by hand in v1.

**Owns:**
- the tenant registry, isolation and lifecycle;
- provisioning, domains and TLS;
- platform identity and the support-access broker;
- the capability and plan catalogue and entitlements;
- meters, Grid → merchant billing and trials;
- flags;
- health and cost to serve;
- backups;
- audit and observability;
- queues, webhooks, incidents and releases;
- platform messaging.

**Does not own:** any merchant business record (products, orders, payments, Finance, CRM, POS, Communications, HR, Analytics, Storefront, Design System meaning).

**Today:**
- 55 console screens under `src/screens/console/` and 7 core boards under `src/screens/core-backend/`.
- All are design conversions with no data behind them and no sign-in.
- Items that need a real server are marked "Not built (backend)".

#### Screen by screen

| Brief's area | Today in the build | Nayeem proposes | Status | Evidence | UX move |
|---|---|---|---|---|---|
| Core board · plan | `/core-plan` | Keep intent; replace stale counts and module IDs | Not built | "Forty-eight modules exist"; M-codes | — |
| Core board · architecture | `/core-architecture` | Keep | Built | Unchanged board | — |
| Core board · packaging | `/core-packaging` | Keep concept; replace the module model | Not built | "Package the modules", sets | — |
| Core board · monitoring | `/core-monitoring` | Make health explainable | Partly built | Static | — |
| Core board · UI plan | `/core-ui-plan` | Historical plan | Built | Still says "43" screens and "48 modules in nine sets"; not labelled historical | — |
| Core board · UI data | `/core-ui-data` | Keep as a Design System reference | Built | Static | — |
| Core board · steps | `/core-steps` | Keep as the build plan; update dependencies | Not built | Unchanged | — |
| Retire: "48 modules" with M/G codes | Console Module catalogue; merchant `edition.js` | Capability Catalogue with stable keys and owner | Built differently | Console still shows 48; merchant side uses 15 modules | — |
| Retire: "nine sets hold every module once" | Same | One owner per capability, many bundles | Built differently | Merchant modules are shared by editions; console keeps nine sets | — |
| Retire: "43 console screens" | 55 console routes | Use the real screen list | Partly built | 55 exist; the UI plan still says 43 | — |
| Retire: "about 30 new tables" | — | Freeze entity responsibilities instead | Not built (backend) | — | — |
| Console shell | `/console-shell` | Keep; permission-filtered search | Partly built | Production badge, Ctrl K, staff with 2FA shown | — |
| Console shell (dark) | `/console-shell-dark` | Theme state | Built | — | — |
| Chart kit | `/chart-kit` | Use the Design System chart contract | Built differently | Console has its own kit; merchant charts use `DashCharts.jsx` | — |
| System states | `/system-states` | Keep / Design System | Built | Static reference | — |
| Tenant context bar | `/tenant-context-bar` | Harden; unify; no owner impersonation | Not built | Still "Viewing as owner" | → one Support Access Session |
| Merchants | `/merchants` | Health, activation and billing as separate filters | Built | — | — |
| Merchant detail | `/merchant-detail` | Support session, capability labels, no silent trial billing | Not built | "View as owner"; "48 modules"; "add it to his bill … unless he says no" | — |
| New store form | `/form-provision` | Migration handed to Setup (#17) | Partly built | CSV / WordPress choices | — |
| Provisioning | `/provisioning` | Stages that are safe to retry | Partly built | "Retry; the first four stages are kept" | — |
| Domains | `/domains` | Provider-agnostic DNS steps | Not built | "BTCL for .com.bd", fixed IP | — |
| Backups | `/backups` | Dry run / diff, two-person approval | Partly built | Dry run, diff, typed confirm; no second approver | — |
| Module catalogue | `/module-catalogue` | Rename to Capability Catalogue | Not built | "All 48 modules … nine sets" | Rename |
| Set form | `/form-set` | Bundle builder | Partly built | Still "edit module set" | — |
| Plans | `/plans` | Versioned ladders | Built | "14 stores still on version 2" | — |
| Plan form | `/form-plan` | Publishing makes a new version | Built | — | — |
| Entitlements | `/entitlements` | Clear precedence | Partly built | Plan + overrides + trials with reasons | — |
| Entitlement form | `/form-entitlement` | Reason, duration, charge, approval | Built | — | — |
| Limits | `/limits` | One meter registry | Partly built | Usage per store; warn and block at 100% | — |
| Limits form | `/form-limits` | Dated rules | Partly built | — | — |
| Subscriptions | `/subscriptions` | Separate commercial state from access/lifecycle | Not built | One state list | — |
| Invoices | `/invoices` | Immutable, credit notes | Built | "corrections are credit notes" | — |
| Collections | `/collections` | Manual collection in v1 | Built | "No auto-charge" | — |
| Adjustments | `/adjustments` | Configurable approval threshold | Partly built | "above ৳500" hard-coded | — |
| Adjustment form | `/form-adjustment` | Preview the effect | Built | — | — |
| Payment checks | `/payment-checks` | Stays removed | Built | Redirects to Collections | — |
| Health & risk | `/health-risk` | Explain it (parts, version, freshness) | Partly built | "Why … dropped 21 points"; no rule version | — |
| Trial funnel | `/trial-funnel` | Uses Setup milestones | Built | — | — |
| Trials | `/trials` | Trial length is a policy, not 15 days | Not built | "15-day trial" | — |
| Cost to serve | `/cost-to-serve` | Label as estimates | Partly built | — | — |
| Support desk | `/support-desk` | Keep | Built | — | — |
| Ticket form | `/form-ticket` | Keep | Built | — | — |
| Support performance | `/support-performance` | Keep | Built | — | — |
| Store access | `/store-access` | One session model (PIN, scope, duration, ticket, audit) | Partly built | Single-use 10-min PIN, ticket, 60 min, "+15 min", logged | → one session model |
| Merchant PIN access | `/merchant-pin-access` | Owner picks duration/scope and can end access | Built differently | Console screen only; no merchant "Support access" page | — |
| Access log | `/access-log` | Sessions can't be deleted | Built | — | — |
| Leads (Grid's own sales) | `/leads` | Keep | Built | Merchant leads are `/sales-leads` | — |
| Lead profile | `/lead-profile` | Explainable score | Built | — | — |
| Lead form | `/form-lead` | Duplicate checks | Built | — | — |
| Lead import | `/lead-import` | Dry run + dedup | Built | — | — |
| Ops centre | `/ops-centre` | Keep | Built | — | — |
| Platform health | `/platform-health` | Targets as objectives | Built | — | — |
| Integrations | `/integrations` | No raw credentials | Built | — | — |
| Webhooks | `/webhooks` | Preview and cap replays | Partly built | One-click "Replay all" | — |
| Queues & jobs | `/queues-jobs` | Audited Discard | Partly built | Discard with no reason | — |
| Incidents | `/incidents` | Add postmortem link | Partly built | — | — |
| Incident form | `/form-incident` | Keep | Built | — | — |
| Releases | `/releases` | Migrations safe to deploy | Partly built | — | — |
| Flags & notices | `/flags-notices` | Keep apart | Built | — | — |
| Flag form | `/form-flag` | Key, owner, expiry, guardrail | Built | — | — |
| Scheduled tasks | `/scheduled-tasks` | Registered jobs only | Partly built | — | — |
| Messaging | `/messaging` | Platform messaging | Built | — | — |
| Security | `/security` | Break-glass audited | Partly built | No break-glass | — |
| Staff & roles | `/staff-roles` | Rename "Platform staff & roles" | Not built | — | Rename |
| Staff form | `/form-staff` | Work identity + MFA | Built | — | — |
| Audit log | `/audit-log` | Split audit / security / telemetry | Partly built | Rows say "Viewed store as owner" | — |
| Action: console screens | 55 routes | Keep; no new page | Built | — | — |
| Action: "48 modules" | Console + `edition.js` | Capabilities | Built differently | — | — |
| Action: module sets | Same | One owner, many bundles | Built differently | — | — |
| Action: tenant context | — | Harden + negative tests | Not built (backend) | Single-merchant demo | — |
| Action: platform vs merchant identity | Console staff; `team.js` | Keep them apart | Built differently | Separate data, but the console has no sign-in | — |
| Action: support access | 3 boards + phone screen | One session | Not built | — | → one session |
| Action: provisioning | `/provisioning` | Safe-to-retry stages | Not built (backend) | — | — |
| Action: domains | `/domains` | Provider-agnostic | Not built | — | — |
| Action: plans | `/plans` | Keep | Built | — | — |
| Action: entitlements | `/entitlements`; `edition.js` | Clear precedence | Partly built | Merchant side checks modules; RoleGuard shows "Not in {edition}" | — |
| Action: usage meters | `/limits`; `platformUsage.js` | Typed, counted once | Partly built | Merchant usage counted from real logs; closed months frozen | — |
| Action: module trial auto-billing | Merchant detail | Opt-in only | Not built | — | — |
| Action: subscription billing | Collections; `platformCosts.js` | Manual collection in v1 | Built differently | Console says manual; merchant side charges the card on the 12th | — |
| Action: state model | `/subscriptions` | Separate 5 dimensions | Not built | — | — |
| Action: backups | `/backups` | Harden | Partly built | — | — |
| Action: health | `/health-risk` | Versioned | Partly built | — | — |
| Action: webhooks | `/webhooks` | Harden | Partly built | — | — |
| Action: queues/jobs | `/queues-jobs` | Harden | Partly built | — | — |
| Action: scheduled tasks | `/scheduled-tasks` | Constrain | Not built (backend) | — | — |
| Action: flags | `/flags-notices` | Keep + separate | Built | — | — |
| Action: audit/security logs | `/audit-log`, `/security`; `auditLog.js` | Split by purpose | Partly built | Merchant audit covers manager PINs only | — |
| Action: platform staff roles | `/staff-roles` | Rename | Not built | — | Rename |

#### New capabilities in #19

| Proposal | Status | Evidence / note |
|---|---|---|
| Trusted tenant resolver + isolation tests (database, cache, search, storage, jobs, webhooks, restore) | Not built (backend) | — |
| Separate platform identity with MFA, no shared accounts | Not built (backend) | Shown statically in the console |
| Support Access Session with break-glass | Not built (backend) | UI pieces exist |
| Provisioning orchestrator; domain service | Not built (backend) | — |
| Capability Catalogue (keys, owner package, meters) | Built differently | Front-end modules and editions |
| Entitlement ≠ flag ≠ permission | Built differently | Module gating + role menus; no flags on the merchant side |
| Platform billing engine, immutable invoices | Partly built | Merchant ledger rows for subscription and usage; console static |
| Separate tenant / subscription / dunning / access / storefront states | Not built | — |
| Backup/restore orchestrator, observability, webhook gateway, job registry | Not built (backend) | — |
| Explainable, versioned health | Partly built | Static breakdown |
| Control-plane SDK / contracts | Not built (backend) | — |

#### Built differently / conflicts in #19

- **Two packaging models.**
  - The console keeps 48 modules, nine sets and M-codes with Growth/Business ladders.
  - The merchant app sells editions over 15 modules, with prices hard-coded per edition.
- **Collection.** The console (and the brief) say "no auto-charge" in v1. The merchant side says the subscription is charged to the card on the 12th and has a "Renew automatically" switch.
- **Support access, merchant side.** Store access tells Grid staff the owner opens "Settings › Support access", but no such merchant page exists.
- **"View as owner" wording** remains in Merchant detail, the tenant bar and the audit log. The brief rejects it.
- **No console sign-in.** Console pages have no sign-in or role guard.
- **Health vs activation.** The brief says these must never be one score. The console's health score includes "Activation 88" as one of its parts.
- **Across briefs (#19 ↔ #20).** The brief says console charts and states come from the Design System. Today console screens keep their own colours and are excluded from the token check.

Coverage: brief tables 88 rows (7 + 4 + 55 + 22) · reported 88.


### Platform · #20 Design System & Developer Reference

*Brief v1.0, 30 Sep.*

**Nayeem's decision.**
- No new Design System screen; keep the 10 reference screens.
- **One machine-readable token source** that generates the CSS and docs.
- A **versioned component API**.
- No business logic in the Design System.
- Accessibility, localisation, testing and versioning become component contracts.
- Navigation layout moves to #21.

**Owns:**
- tokens and themes;
- type, spacing, radius, elevation, motion and layers;
- generic controls, surfaces, tables, feedback and charts;
- the nine page templates;
- responsive and accessibility behaviour;
- formatter interfaces;
- docs, versions and the test harness;
- the shell's visual pieces.

**Does not own:** business statuses and rules, metric formulas, entitlements, permissions, data, navigation layout and modes, platform backend.

**Today:**
- One handwritten `src/styles/design-system.css`, with rules in AGENTS.md, guarded by `npm run check:screens`.
- Shared components in `src/components/ui`.
- Reference pages under `/dev/…`, hidden in production.

#### Screen by screen

| Brief's area | Today in the build | Nayeem proposes | Status | Evidence | UX move |
|---|---|---|---|---|---|
| Developer reference | `/dev/dev-reference` | Keep as the entry | Built | Says header 72px vs token 64px | — |
| UI kit 01 · shell | `/dev/ui-kit01-shell` | Keep; nav layout → #21 | Built | Menu config lives in navigation.js + team.js + edition.js | — |
| UI kit 02 · actions | `/dev/ui-kit02-actions` | Semantic tones | Built | StatusBadge takes a tone | — |
| UI kit 03 · controls | `/dev/ui-kit03-controls` | Formalise accessibility and locale | Built | — | — |
| UI kit 04 · form layouts | `/dev/ui-kit04-form-layouts` | Keep | Built | — | — |
| UI kit 05 · tables | `/dev/ui-kit05-tables` | Server/responsive contract | Partly built | Phone card layout in the product | — |
| UI kit 06 · data | `/dev/ui-kit06-data` | No metric ownership | Built | Generic `DashCharts.jsx` | — |
| UI kit 07 · feedback | `/dev/ui-kit07-feedback` | Standard system states | Partly built | Toasts, confirm, EmptyState, RoleGuard | — |
| UI kit 08 · commerce | `/dev/ui-kit08-commerce` | Keep visuals; strip business meaning | Not built | Unchanged specimens (e.g. EID20) | — |
| UI kit 09 · templates | `/dev/ui-kit09-templates` | Templates mandatory | Partly built | Product follows shell classes and PageHeader rules | — |
| Design file · fonts | `src/app/layout.jsx` | Generated / production font loading | Built differently | Google Fonts link | — |
| Design file · colours | `design-system.css` | Primitive + semantic colours | Built | Merged, dark tokens included | — |
| Design file · typography | `design-system.css` | Type scale | Built | — | — |
| Design file · spacing | `design-system.css` | Spacing and shell sizes | Built | Header 72 → 64 | — |
| Design file · radius | `design-system.css` | Corners | Built | Five radii | — |
| Design file · elevation | `design-system.css` | Shadows | Built | — | — |
| Design file · motion | `design-system.css` | Duration, easing, reduced motion | Built | — | — |
| Design file · layers | `design-system.css` | Z layers | Built | — | — |
| Design file · base | `globals.css` | Element defaults | Built differently | Defaults scoped to `.ds` | — |
| Design file · controls | `design-system.css` | Control recipes | Built | Buttons 44px | — |
| Design file · surfaces | `design-system.css` | Surfaces | Built | — | — |
| Design file · data | `design-system.css` | Tables/data | Built | — | — |
| Design file · styles bundle | `globals.css` imports | Convenience bundle | Built differently | — | — |
| Design file · component bundle | `components/ui`, `runtime/dc.jsx` | A versioned package | Built differently | React components, not versioned | — |
| Design file · sidebar/topbar | `gc-sidebar.js`, `gc-topbar.js` | Visual pieces fed by #21 | Built differently | Sidebar imports the menu, roles and edition itself | — |
| Developer reference · refinement | `/dev/dev-reference` | DS version, generated values, changelog, links | Not built | — | — |
| UI kit 01 · refinement | shell | Sizes from tokens; shell per breakpoint; sidebar visual-only | Partly built | Rail <1280px / drawer <1024px in CSS | — |
| UI kit 02 · refinement | actions | Fix size drift; destructive levels; async states | Partly built | CSS 44/36/52; kit still shows 40px specimens | — |
| UI kit 03 · refinement | controls | Accessible names/errors, keyboard, masking, locale inputs | Partly built | Labels and `aria-invalid` in 32 files; no shared form field | — |
| UI kit 04 · refinement | forms | Read-only/locked states; autosave vs save; dirty state | Partly built | Drafts and "leave without saving?" in Add staff | — |
| UI kit 05 · refinement | tables | Server contract, column memory, bulk selection | Partly built | Report column chooser per report; "select all shown" | — |
| UI kit 06 · refinement | data | Chart API, tooltips, accessible data | Built | Hover and arrow-key tooltip, hidden data table | — |
| UI kit 07 · refinement | feedback | Live-region priority, focus, no-permission/locked/stale states | Partly built | Focus trap/return/Esc; one polite live region | — |
| UI kit 08 · refinement | commerce | Mark example values; remove business constants | Not built | — | — |
| UI kit 09 · refinement | templates | Mandatory templates; longer handoff checklist | Not built | AGENTS.md acts as the rule book | — |
| Drift · sidebar 272 vs 280 | `--sidebar-panel-width` | One token | Built | 280px | — |
| Drift · header 76 vs 72 | `--header-height` | One token | Built differently | Token is 64px; reference says 72 | — |
| Drift · button 44/40/36 | `.gc-btn` | One value | Built | 44px | — |
| Drift · small button 36 vs 34 | `.gc-btn--sm` | One value | Built | 36px | — |
| Drift · large/POS 52 vs 48 | `.gc-btn--lg` | One value | Built | 52px; some 40px pills remain | — |
| Drift · screen count 197 vs 198 | docs | Generate or omit counts | Not built | Docs say "190 screens"; registry has 333 routes | — |
| Action: reference screens | `/dev/*` | Keep 10, add none | Built | Plus flows, icon set, site map, structure, storyboards | — |
| Action: navigation architecture | `shell/navigation.js` | Move to #21 | Built differently | Filtering by role/edition/setup happens inside the sidebar | — |
| Action: token source | `design-system.css` | One machine-readable source | Not built | Handwritten CSS custom properties | — |
| Action: dimension drift | tokens | Fix | Partly built | — | — |
| Action: prototype inline CSS | converted screens | Don't copy into production | Built differently | Screens are converted design markup snapped to tokens | — |
| Action: component bundle | `components/ui` | Versioned package | Partly built | Dialog, Sheet, PageHeader, EmptyState, InfoTip, StatusBadge, FilterBar, HelpPanel | — |
| Action: business constants in DS | libs | Remove | Partly built | Status → tone mapping lives in `orderStatus.js`; one constant left in the reference | — |
| Action: Bangladesh formatting | `lib/format.js` | Formatter interfaces | Partly built | BDT, Indian grouping, Bangla digits; no currency/timezone parameters | — |
| Action: Bangla typography | tokens + translateDom | Formalise | Partly built | `--font-bn`, `bn.js`, terminology; no Bangla tests | — |
| Action: fonts | root layout | Self-host / offline | Not built | Google Fonts CDN | — |
| Action: accessibility | components | Component contract + tests | Partly built | Focus management; no tests | — |
| Action: tables | product | Harden | Partly built | — | — |
| Action: charts | DashCharts / ReportChart | Generic only | Built | — | — |
| Action: system states | Overlays, RoleGuard | Standardise | Partly built | No stale/partial patterns | — |
| Action: commerce kit | UI kit 08 | Label examples | Not built | — | — |
| Action: nine templates | shell classes | Mandatory | Partly built | — | — |
| Action: versioning | — | Add | Not built | package 0.1.0, no changelog | — |
| Action: testing | `check:screens` | Add a pipeline | Not built | Literal guard and manual audits only | — |
| Action: developer handoff | AGENTS.md | "Use the component or recipe" | Partly built | The converter copies prototype markup | — |

#### New capabilities in #20

| Proposal | Status | Evidence / note |
|---|---|---|
| Four layers: Foundations → Components → Patterns → Templates | Partly built | Tokens + recipes + `components/ui`; no governance layer |
| Token source → generated CSS/TS/docs | Not built | — |
| Versioned component package with a deprecation policy | Not built | — |
| Formatter contract (locale / currency / timezone) | Partly built | — |
| Destructive-action levels 1–4 | Partly built | `confirmDialog`, ManagerPin, console typed confirm |
| 10 universal system states | Partly built | Empty, no-permission, edition-locked, offline (POS) |
| Component QA gallery + visual regression | Not built | — |
| WCAG 2.2 AA target | Partly built | Contrast and label fixes |
| Light/dark themes | Partly built | Dark tokens; no merchant theme switch |
| Chart colour tokens | Built | `--viz-1…8`, colour-blind checked |

#### Built differently / conflicts in #20

- **Token source.** The brief wants one machine-readable source. Today the 12 design CSS files are merged into one handwritten `design-system.css`, guarded by scripts.
- **Sizes.** These were settled differently from the brief's examples:
  - header 64px (neither 72 nor 76);
  - buttons 44 / 36 / 52.
- **Navigation.** The brief says the sidebar must not know business menus. Today it imports the menu and role/edition filters directly.
- **Prototype code.** The brief says don't copy prototype markup into production. The build's method is exactly that (`convert-design.mjs`), followed by token snapping.
- **Old baseline.**
  - "198 design files": the export now has 279, and the registry 333 routes.
  - The old JS bundle has already been replaced by React.
- **Still open.** Fonts load from Google's CDN. The reference pages carry stale values and business examples.

Coverage: brief tables 60 rows (10 + 15 + 10 + 6 + 19) · reported 60.


## 6. What the proposal adds

The new pieces Nayeem introduces across all 21 briefs, gathered in one place. Detail and evidence are in each area's section.

### 6.1 New or reshaped workspaces

| Workspace | Brief | What it is | Status | Closest thing today |
|---|---|---|---|---|
| Setup & Migration | #17 | Setup checklist · Import & migrate · Migration runs · Launch readiness | Not built | Stock setup page; the UI-kit checklist component |
| Assisted New Order | #4 | Fast phone-led order entry with hold/resume, barcode, shortcuts, B2B mode | Partly built | `/new-order` (online/manual) and `/pos` (retail, wholesale) |
| After-sales Cases | #12 | Returns & Exchanges · Warranty · Repairs as cases with inspection and remedies | Not built | Return & exchange, Return history, Courier returns, the Warranty claims design page |
| Payments Operations | #5 | Transactions · Refunds · Settlements & reconciliation | Built differently | Money › Payouts + Cash, bank & wallets + Return history + evening check |
| Finance (six areas) | #6 | Overview · Money accounts · Cash & expenses · Transfers · Receivables · Closing & reconciliation | Partly built | Money (7 pages) |
| Stock Activity | #2 | Every stock movement in one filterable list | Not built | Moves stored in `stock.js`; per-product history dialog |
| Messaging Campaigns | #11 | Segment-based outbound messages with counts, cost and results | Not built | Composer's WhatsApp broadcast |
| Notifications & Automations | #11 | Transactional · Automations · Templates · Delivery log | Built differently | Settings › Order notifications + Automation (Rules, Workflow builder, Workflow settings, Scheduled reports) |
| Storefront & Theme | #15 | Theme, templates, navigation, pages | Not built | "Online store" = landing page builder |
| Checkout & Customer Account | #15 | Checkout editor, customer account, order-status page | Not built | `/checkout` (static), `/order-link` (real orders) |
| Reviews | #15 | Product reviews with verified buyers and moderation | Built differently | Google Business location reviews in the Inbox and on the Google Business page |
| Roles & Security | #18 | Roles · Access policies · Sessions & devices · Security policy · Access audit | Not built | Fixed roles in `team.js`; Settings › Profile type; access tab on the staff profile |
| Customers › Companies / Segments | #7 | Company profiles and one segment builder | Not built | Wholesale customer type and price list; fixed customer views |
| Marketing › Audiences | #13, #21 | Customer audiences synced to Meta/TikTok | Not built | — |
| Analytics Hub as the main analytics page | #14 | Overview / Profitability / Marketing / Customers views | Built differently | The Reports centre is the main page today |
| Settings: Plan & Billing, Usage & Limits, Tax & Documents, Locations, Documents & IDs | #16 | New Settings groups | Partly built | Subscription & billing, Wallet & credits, Money › VAT, Warehouses & branches |
| Capability Catalogue (console) | #19 | Replaces the "48 modules" catalogue | Not built | Console Module catalogue; merchant `edition.js` |
| One Support Access Session (console) | #19 | Replaces "view as owner", store access and PIN access | Not built | Three separate console screens |

### 6.2 New engines, models and rules

| Proposal | Brief | Status | Note |
|---|---|---|---|
| Navigation registry and resolver (mode → plan → permission → setup → role → pins → device) | #21 | Partly built | Today: role → edition → buying setup |
| Combinable Online / Retail / Wholesale modes on one account | #21, #17 | Built differently | Fixed editions, each its own site |
| Order states as separate dimensions with working views | #4 | Built differently | One saved status + payment / verify / prep fields |
| Immutable inventory ledger with explicit quantities | #2 | Partly built | Stock moves exist; no Committed / Unavailable / Incoming columns or running balance |
| Product templates and specification engine | #1 | Not built | Category fields and typed custom fields only |
| PO ≠ goods receipt ≠ supplier bill ≠ payment; 3-way match | #3 | Partly built | Separate records exist; a bill is created on every receipt; no matching |
| Stable customer ID; Person/Company; contact points | #7 | Not built | Customers keyed by phone |
| One segment engine shared by CRM, Recovery, Promotions, Communications | #7, #13 | Not built | — |
| Consent apart from preference, rechecked at send time | #7, #11 | Not built | — |
| One promotion engine for POS and online | #9 | Not built | Three separate code sets today |
| Points ledger with Pending; Store credit ledger (no cash-out) | #9 | Partly built | Points entries exist; the wallet takes cash top-ups and cash-outs |
| Payment records: request · attempt · customer claim · verified payment · refund · payout | #5 | Partly built | Ledger entries and payout records; no request/attempt/claim records |
| Add-only money movements with approval and reversal | #6 | Partly built | Entries can't be edited; no approval or reversal link |
| Per-branch, per-register cash custody | #6, #8 | Not built | One shared drawer and one safe account |
| One message delivery engine (classes, quiet hours, frequency caps, fallback, delivery log) | #11 | Not built | Two separate quiet-hours settings; a per-order delivery log |
| After-sales case model (case, items, inspection, dispositions, remedies, SLA) | #12 | Not built | Returns are immediate transactions |
| Recovery opportunities and versioned customer signals | #13 | Not built | Demo lists |
| Metric dictionary, date basis, profitability ladder, cost completeness | #14 | Not built / Built differently | Shared libraries keep Home and Reports consistent; analytics pages use static numbers |
| Cart, checkout and account runtime; publish versions and rollback | #15 | Not built | — |
| Settings registry, change history and named API keys | #16 | Not built | — |
| Setup plan engine and migration runs (dry run, provenance, reconcile) | #17 | Not built | — |
| Identity ≠ membership ≠ employee; permission matrix; several roles per person | #18 | Built differently / Not built | Three unlinked lists today |
| Tenant isolation, platform identity, support-access broker | #19 | Not built (backend) | — |
| Machine-readable design token source; versioned components; tests | #20 | Not built | One handwritten CSS file + `check:screens` |


## 7. Retire, merge and rename

What Nayeem proposes to fold into something else, rename or remove, and whether today's build has done it.

| Today | Proposed | Brief | Status |
|---|---|---|---|
| MerchantDashboard (design screen) | Merged into Home | #10 | Built (already gone) |
| My dashboard (`/my-dashboard`) | Merged into one role-aware Home | #10, #21 | Built differently (both exist) |
| Online Home and Connect Home | One Home with role/mode priority | #10 | Built differently |
| Recovery customer profile (`/customer-profile`) | Folded into the CRM profile as Insights | #7, #13 | Not built |
| CRM profile's 10 tabs | 6 areas | #7 | Not built |
| Customer wallet (`/wallet`) | Store credit; no cash top-up or cash-out | #9, #21 | Not built |
| Coupons and Flash sales as separate lists | Filtered views of one offer engine | #9 | Not built |
| "Add product" menu item | "+ Add product" button and "+ Create" | #1, #21 | Built differently (menu item kept) |
| "Add staff" menu item | "+ Create" › Staff | #21 | Built differently (menu item kept) |
| Help & support menu item | Shell utility (Help) | #21 | Built differently |
| AI calls (menu item) | Merged into Communications › Calls | #21 | Not built |
| Reports group | Becomes Analytics | #14, #21 | Built differently (name kept) |
| Money group | Becomes Finances (six areas) | #6, #21 | Built differently |
| Customer support group | Becomes Communications | #11, #21 | Not built |
| "Online store & settings" group | Online Store mode area + Settings fixed at the bottom | #15, #21 | Not built |
| Automation (Rules, Workflow builder, Workflow settings) | Communications › Automations | #11, #21 | Not built |
| Scheduled reports | Analytics › Reports | #14, #21 | Not built |
| Ads tracking (Pixels & events, Event health, Setup guides) | Analytics › Tracking | #14, #21 | Not built |
| Warranty policies (More stock tools) | Product / Catalog setup | #1, #12 | Partly built (product form picks a policy) |
| Warranty claims (More stock tools) | After-sales Cases | #12 | Not built |
| Support tickets (Customer support) | After-sales owner, linked from Communications | #12, #21 | Not built |
| Stock adjustments ("Stock changes") | Stock Activity | #2 | Not built |
| Replenishment (Stock banner + report) | A view inside Stock | #2 | Built differently (in Reports) |
| Purchase orders page | Renamed "Purchases" with an intent chooser | #3 | Built differently (separate Purchases page) |
| Quick purchase | A mode of New PO | #3 | Built differently (`/buy-goods`) |
| HR setup › Roles and permissions | Roles & Security | #18 | Not built |
| Suspend (no shifts + salary hold + login paused) | Separate employment and access states | #18 | Not built |
| Payment settings: payment discount | Summary only; owned by Promotions | #5, #16 | Not built |
| Payment settings: exchange rates | A currency setting (owner unresolved) | #5, #16 | Not built |
| Payment settings: payment-mode rules | Sales/Checkout | #5 | Not built |
| SEO page: Google Analytics and Pixel IDs | Connections / Analytics | #16 | Partly built (also in Connections) |
| AI auto-reply behaviour | Communications (provider and budget stay in Settings) | #11, #16 | Not built |
| Auto-reply rules | Communications | #16 | Not built |
| Storage and Backups settings | Removed for normal merchants (platform side) | #16, #19 | Not built |
| One store API key | Several named keys with limited access | #16 | Not built |
| "Real return", "Profit after ads", "Who really brought the sale" | Delivered ROAS, Contribution after ads, model-labelled attribution | #14 | Not built |
| Console "Module catalogue" (48 modules) | Capability Catalogue | #19 | Not built |
| Console "Staff and roles" | "Platform staff & roles" | #19 | Not built |
| Console "view as owner", store access, PIN access | One Support Access Session | #19 | Not built |
| Core UI plan board ("43 screens, 48 modules") | Marked as historical | #19 | Not built |


## 8. Decisions to make

These are the points where today's build and Nayeem's proposal take different routes, or where the briefs disagree with each other. Each lists both positions without a verdict.

### 8.1 Product shape and navigation

| # | Topic | Today's build | Nayeem's proposal | Briefs |
|---|---|---|---|---|
| 1 | How the product is sold | Four fixed editions, each its own site (Online; Retail + Wholesale; Retail + Wholesale + Online; Connect) | Online, Retail and Wholesale as modes ticked in any mix on one account and changed at any time; the plan is separate from the mode | #21, #17 |
| 2 | Connect (communication & CRM) product | Sold as its own edition | Not in the proposal; Communications is a core area for every merchant | #21, #11 |
| 3 | Menu shape | 10 groups with sub-menus in the sidebar (102 items) | 7 core areas + optional mode areas; sub-menus become page tabs; Settings at the bottom | #21 |
| 4 | Area names | Money · Reports · Customer support · Online store & settings | Finances · Analytics · Communications · Online Store + Settings | #21, #6, #14 |
| 5 | Communications in Retail + Wholesale | No Inbox or Calls in that edition | Communications in every mode | #21 |
| 6 | Home | Dashboard (CEO), My dashboard per role, separate Online and Connect Homes | One Home with role priority; "do not build a third dashboard" | #10, #21 |
| 7 | Team features | Tasks, Team chat, Leads & follow-ups, My dashboard | Not placed in the proposal | #21 |
| 8 | Setup & Migration | Stock setup page and a banner | A permanent workspace (#17), or contextual after launch (#21); the two briefs differ | #17, #21 |

### 8.2 Orders, POS and returns

| # | Topic | Today's build | Nayeem's proposal | Briefs |
|---|---|---|---|---|
| 9 | Order status model | One saved status (On hold = COD to verify; Processing = paid; Pending = payment due → Approved → Ready for courier → In transit → Delivered) | Separate state dimensions with a headline and working views; "On hold" = any open gate | #4, #5, #10 |
| 10 | COD | A payment value; the order becomes Paid on delivery; remittance runs in Payouts | "Unpaid · COD", a collection method | #4, #15 |
| 11 | Verify vs confirm | Verification is a step; "Approve" is the decision | "Confirm customer" | #4 |
| 12 | Order entry | `/new-order` (online/manual) and `/pos` (retail, wholesale) | One Assisted New Order with a B2B quote mode | #4 |
| 13 | Stock reservation | Fixed by edition (held on approval; taken out on approval in Online) | A merchant choice of five options | #4 |
| 14 | Where returns live | One Return & exchange page for all channels, opened from POS; immediate transactions | POS keeps its return screen (#8, #12); After-sales owns cases (#12); Sales says customer returns belong to #12 | #4, #8, #12 |
| 15 | Who sets return rules | One "return within N days" setting in POS manage, applied everywhere | After-sales rules in Settings (#12) vs product/merchant policy (#8) | #8, #12 |
| 16 | Due / credit at POS | A payment button that makes an unpaid invoice (credit limit + PIN) | Removed from payment buttons; a separate "Sell on credit" | #5, #8 |
| 17 | POS back office | `/pos-manage` is its own menu item | "No new permanent POS page" | #8 |

### 8.3 Products, stock and buying

| # | Topic | Today's build | Nayeem's proposal | Briefs |
|---|---|---|---|---|
| 18 | Damaged stock | Moved to a separate "Returns & damaged" bay place | Stays at the same place as "unavailable" | #2 |
| 19 | Transfers | Stock stays at the sender until scan-in | Moves to "in transit" at dispatch | #2 |
| 20 | Stock counts | Selling pauses at the place during a count | Snapshot count while selling continues | #2 |
| 21 | Stock module split | catalog / places / purchasing modules (lets Online hide places) | One Inventory package with role-promoted shortcuts | #2, #21 |
| 22 | Receiving and bills | A supplier bill is created on every receive | The challan is evidence only; bill entered separately; 3-way match | #3 |
| 23 | Purchase pages | Purchases, New purchase and Purchase orders as separate pages, shown by buying mode | One renamed "Purchases" page with an intent chooser | #3 |
| 24 | Wholesale price on products | Stored per product and variant, plus customer price lists | Product keeps only a summary; price lists live in Sales/CRM | #1 |
| 25 | Warranty policy home | Policy page under stock tools; Catalog setup says "Settings"; product form picks one | Product / Catalog setup | #1, #12 |

### 8.4 Customers, marketing and communications

| # | Topic | Today's build | Nayeem's proposal | Briefs |
|---|---|---|---|---|
| 26 | Customer identity | Keyed by phone; four separate profile pages | Stable customer ID; one Person/Company profile | #7, #9, #13 |
| 27 | B2B customers | Wholesale buying type, price list and credit limit; Leads "Corporate" | Company → Locations → Contacts | #7 |
| 28 | Customer wallet | Money held for customers (cash top-up and cash-out, shown as a liability) | Store credit only; no cash in or out | #9 |
| 29 | Referral rewards | Paid in cash or to the wallet now, through the ledger | Pending until approved; cash deferred | #9 |
| 30 | Points timing | POS points at once; online points on delivery | Pending until delivery or the return window | #9 |
| 31 | Journeys and triggers | Automation rules and the workflow builder | Smart offers (Recovery) decide; Communications sends | #11, #13 |
| 32 | Quiet hours and message caps | Two separate settings (Auto reminders, Workflow settings) | One global policy in Communications | #11, #13 |
| 33 | Order notifications | Settings › Notifications (SMS, email) | Communications › Notifications & Automations (+ WhatsApp) | #11, #16 |
| 34 | Merging duplicate conversations | Merged into one conversation | Separate per-channel threads under one customer | #11 |

### 8.5 Money, analytics, storefront, staff and platform

| # | Topic | Today's build | Nayeem's proposal | Briefs |
|---|---|---|---|---|
| 35 | Payouts and matching | Money › Payouts (partner payout confirmation + evening check) | Payments Operations (#5) and Finance statement matching (#6) | #5, #6 |
| 36 | P&L, VAT, chart of accounts | Inside Money (P&L, Sales & profit, VAT with Mushak forms; chart and journals under Advanced) | P&L in Analytics; statutory VAT and accounting out of v1; tax setup in Settings | #6, #14, #16 |
| 37 | Money accounts | Company-wide: one drawer account, one safe | Per branch and register | #6 |
| 38 | Profit wording | Ladder ends at "net profit" | Stop at "contribution after ads"; no statutory claims | #14 |
| 39 | Main analytics page | Reports centre (95 reports); tracking pages are links | Analytics Hub + Reports & Alerts | #14 |
| 40 | Online store | "Online store" = landing page builder; WooCommerce/Shopify sync; WordPress blog | Grid-native Storefront & Theme, Checkout & Account and Reviews workspaces; Woo/Shopify as migration sources (#17) | #15, #17 |
| 41 | Staff access | Inside the HR module (Connect has none); three unlinked role lists | Core Roles & Security that works without HR | #18 |
| 42 | Subscription billing | Merchant side: card charged on the 12th, auto-renew switch | Manual collection in v1 (also what the console says) | #19 |
| 43 | Design system source | One handwritten CSS file; screens converted from design markup | Machine-readable token source; no prototype markup in production | #20 |
| 44 | Exchange-rate setting | Inside Payment settings | Owner unresolved: Settings/Finance (#5), Finance later (#16), not in v1 (#6) | #5, #6, #16 |


## 9. Appendix

### 9.1 The 21 briefs

Rows checked = status rows in that brief's section of this document, including the new-capabilities table.

| # | Brief | Version | Date | Proposed area | Rows checked | Section |
|---|---|---|---|---|---|---|
| 1 | Product | 4.4 (freeze candidate) | 28 Sep | Products | 57 | [Products · #1](#products-1-product) |
| 2 | Inventory | 1.3 (freeze candidate) | 28 Sep | Products › Inventory | 68 | [Products · #2](#products-2-inventory) |
| 3 | Purchase & Suppliers | 1.1 (freeze candidate) | 28 Sep | Products › Purchasing | 64 | [Products · #3](#products-3-purchase-suppliers) |
| 4 | Sales, Orders, Fulfilment & Delivery | 1.2 (freeze candidate) | 28 Sep | Orders | 79 | [Orders · #4](#orders-4-sales-orders-fulfilment-delivery) |
| 5 | Payments & Settlement | 1.2 (freeze candidate) | 28 Sep | Finances › Payments | 57 | [Finances · #5](#finances-5-payments-settlement) |
| 6 | Finance & Cash Management | 1.0 | 29 Sep | Finances | 40 | [Finances · #6](#finances-6-finance-cash-management) |
| 7 | Customers & CRM | 1.0 | 28 Sep | Customers | 62 | [Customers · #7](#customers-7-customers-crm) |
| 8 | POS Register | 1.0 | 29 Sep | POS | 78 | [Orders · #8](#orders-8-pos-register) |
| 9 | Loyalty, Promotions & Offers | 1.0 | 29 Sep | Marketing | 73 | [Customers · #9](#customers-9-loyalty-promotions-offers) |
| 10 | Merchant Dashboard & Overview | 1.0 | 29 Sep | Home | 45 | [Home · #10](#home-10-merchant-dashboard-overview) |
| 11 | Communications, Notifications & Campaigns | 1.0 | 29 Sep | Communications | 31 | [Communications · #11](#communications-11-communications-notifications-campaigns) |
| 12 | Support, Returns, Warranty & After-sales | 1.0 | 30 Sep | Orders › After-sales | 58 | [Orders · #12](#orders-12-support-returns-warranty-after-sales) |
| 13 | Recovery & Customer Intelligence | 1.0 | 30 Sep | Marketing › Recovery | 77 | [Customers · #13](#customers-13-recovery-customer-intelligence) |
| 14 | Tracking, Analytics, Reports & Profitability | 1.0 | 30 Sep | Analytics | 36 | [Analytics · #14](#analytics-14-tracking-analytics-reports-profitability) |
| 15 | Storefront, Checkout, Landing Pages & Reviews | 1.0 | 30 Sep | Online Store | 29 | [Online Store · #15](#online-store-15-storefront-checkout-landing-pages-reviews) |
| 16 | Settings, Billing & Merchant Configuration | 1.1 (freeze candidate) | 30 Sep | Settings | 71 | [Platform · #16](#platform-16-settings-billing-merchant-configuration) |
| 17 | Onboarding, Migration & Merchant Setup | 1.0 | 30 Sep | Setup & Migration | 53 | [Home · #17](#home-17-onboarding-migration-merchant-setup) |
| 18 | Staff, HR, Roles & Security | 1.0 | 30 Sep | Staff & HR; Roles & Security | 73 | [Platform · #18](#platform-18-staff-hr-roles-security) |
| 19 | Grid Platform Console & Core Backend | 1.0 | 30 Sep | Grid's admin console | 99 | [Platform · #19](#platform-19-grid-platform-console-core-backend) |
| 20 | Design System & Developer Reference | 1.0 | 30 Sep | Foundation | 70 | [Platform · #20](#platform-20-design-system-developer-reference) |
| 21 | Navigation Architecture | 1.0 | 30 Sep | Shell | 51 | [Section 4](#4-navigation-and-ux-what-moves-where) |

### 9.2 Design files the briefs name, and where they are today

| Design file (brief) | Today |
|---|---|
| MerchantOverview / MerchantDashboard | `/merchant-overview` (`Home.jsx`); Online `OnlineHome.jsx`; MerchantDashboard is gone |
| gc-sidebar.js / gc-topbar.js | `src/shell/gc-sidebar.js`, `gc-topbar.js`, menu in `navigation.js` |
| MerchantOrders / OrderDetail | `/merchant-orders`, `/order-detail` |
| PosIdle / PosActive / PosPay / PosKeypad / PosSales / PosOpen / PosClose / PosOffline | All one register at `/pos`; old routes redirect |
| PosReturn | `/return-exchange` (shared by all channels) |
| AllProducts / AddProduct / AddProductTabs / Categories / CatalogSetup | `/all-products`, `/add-product`, `/add-product-tabs` (not in menu), `/categories`, `/catalog-setup` |
| Stock / StockCount / Transfers / NewTransfer / ExpiryDisposal | `/stock`, `/stock-count`, `/transfers`, `/new-transfer`, `/expiry-disposal` (Damaged & expired) |
| StockChanges / ReportDamage | Not in this repo; nearest `/stock-adjustments`, Stock holds |
| Warehouses / Branches / Racks / BarcodeLabels | `/warehouses`, `/branches`, `/racks`, `/barcode-labels` |
| WarrantyPolicies / WarrantyClaims | `/warranty-policies`, `/warranty-claims` (design pages) |
| PurchaseOrders / NewPO / PODetail / ReceiveGoods / MobileReceive / Requests | `/purchase-orders`, `/new-po`, `/po-detail`, `/receive-goods`, `/mobile-receive`, `/requests`; plus `/purchases` and `/buy-goods` |
| Suppliers / SupplierDetail / SupplierReturn | `/suppliers`, `/supplier-detail`, `/supplier-return` |
| SetPayments / SetGeneral / SetPreference / SetDelivery / SetSeo / SetSecurity / SetStorage / SetAi / SetRules / SetUsage / SetMedia | `/set-…` pages; working settings live in Notifications, Stock setup, POS manage, Money setup, VAT and Connections |
| AllCustomers / CustomerCRM | `/all-customers`, `/customer-crm` |
| MerchantCustomers / CustomerGroups / SmartOffers / AdAudiences | Never in this repo |
| Recovery CustomerProfile / AbandonedCarts / AutoReminders | `/customer-profile`, `/abandoned-carts`, `/auto-reminders` |
| Promo / Coupons / NewCoupon / FlashSales / NewFlashSale / Loyalty / Members / MemberDetail / ProductPoints / Referrals / Wallet | Same names under `/promo`, `/coupons` … `/wallet` |
| MerchantInbox / MerchantCalls | `/merchant-inbox`, `/merchant-calls` |
| LandingPageBuilder / Offers / OfferDetail / Checkout | `/landing-page-builder` ("Online store"), `/offers`, `/offer-detail`, `/checkout`; plus `/order-link` |
| AnalyticsHub / Campaigns / Attribution / ProductsTraffic / PixelsEvents / EventHealth / Connections / ReportsAlerts / TeamReport | Same names; tracking Connections is now `/ad-accounts`; reporting runs in `/reports-centre` |
| SupportTickets | `/support-tickets` (design page) |
| AllStaff / HrDashboard / Attendance / Shifts / Leave / Payroll / LoansAdvances / HrSetup / StaffProfile (+ tabs) / StaffCreate | `/all-staff` … `/staff-create`; the profile's separate screens are tabs of `/staff-profile` |
| MerchantOnboarding / MobileSignUp / MerchantSignIn | `/merchant-onboarding`, `/mobile-sign-up`, `/merchant-sign-in` (system picker) |
| 55 console screens + 7 core boards | `src/screens/console/*`, `src/screens/core-backend/*` (design pages) |
| DevReference + UIKit01–09 | `/dev/…` (hidden in production) |

### 9.3 How this document was made

- **Reading.** Each brief was read in full: seven reviewers took three briefs each.
- **Checking.** Every row of every brief table was checked against the code at commit `7c766c0`. Coverage lines at the end of each section compare the brief's row count with the rows reported.
- **What "Built" means.** Status is judged from the front-end code. Data lives in the browser (demo), so "Built" means the screen and its logic exist in the demo.
- **No verdicts.** Nothing in this document says which side should win. Section 8 lists both positions so the two of you can decide.


