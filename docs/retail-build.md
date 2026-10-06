# GridCommerce Retail: build architecture and facility list

Edition: **GridCommerce Retail** (`NEXT_PUBLIC_EDITION=retail-wholesale`, shown as "Retail"; wholesale is switched off).
Demo shop: **Dazzle Shop**, a mobile phone and accessories shop in Dhaka with 1 warehouse and 2 branches.
Build state: branch `claude/grid-ai-support` on top of commit 3471fca, uncommitted work as of 6 Oct 2026.

Testers and developers use this document as the reference for the Retail build: test notes, facility notes and
developer tests. Every facility has an ID (for example `POS-12`). Quote the ID in bug reports and test cases.

Contents
1. How to test this build
2. Architecture
3. Who uses it: roles, plans, access
4. The shell (on every page)
5. Facilities by menu area (Home, Orders, Products, Inventory, Payments, Customers, Finances, Analytics, Marketing,
   POS, Staff & HR, Team, Settings)
6. Pages outside the menu (records, create flows, tools)
7. Settings
8. Cross-cutting services
9. Messages the customer, staff or owner receive
10. Money and stock: where every action posts
11. POS keyboard shortcuts
12. What is not in Retail
13. Simulated parts, known gaps and open decisions
14. Developer checks
15. Appendix: every reachable route

---

## 1. How to test this build

| ID | Item | Detail |
|---|---|---|
| T-01 | Retail site | A site built with `NEXT_PUBLIC_EDITION=retail-wholesale` is Retail only. |
| T-02 | Preview on the full site | Add `?edition=retail-wholesale` to any address, or use Settings › Subscription & billing › edition switcher, or pick **Retail** on the sign-in page. The choice is kept in `gc.edition.preview`. |
| T-03 | Sign in | `/` opens `/merchant-sign-in`. A Retail site shows no system choice: **Open the Retail demo** signs in with one tap (demo), or sign in with any email and password, or by phone code; it opens Home. The full site keeps a "Demo: preview a system" picker (Retail, Online, Retail + Online). |
| T-03b | Sign up | "Create an account" opens `/merchant-onboarding`; on a Retail site step 4 asks about shops (one shop, branches, warehouse), sales a month and payments (Cash, Card, bKash, Nagad); step 5 is the shop address; the first to-dos are Add your first product, Open your counter, Add your branches and warehouse, Connect your card machine and bKash / Nagad. No Facebook, courier or cash-on-delivery choices. |
| T-04 | Sign in as a person | `?as=<user id>` on any page (ids in §3.2), or Settings › Profile type (`/set-profile`), or the account menu › Switch account. |
| T-05 | Manager PIN | Every manager's PIN is **1234** (demo). Every PIN tried is written to the PIN log. |
| T-06 | Demo data | All data lives in this browser's `localStorage` under `gc.*` keys. The first visit after a data version change (`DEMO_DATA = 'dazzle-1'` in `src/app/layout.jsx`) clears every `gc.*` key except `gc.edition.preview`, `gc.locale`, `gc.session`, `gc.platform.db`. To start over by hand: clear the site's storage. |
| T-07 | Quiet mode | `?quiet=1` stops the evening payout check from opening (screenshots, automated tests). |
| T-08 | Clock offset | `gc.clock.offset` (milliseconds, localStorage) moves the clock for the evening check. |
| T-09 | Phone width | Check every page at 390 px. Tables become cards, statistic rows become a swipe strip, the main button shares the title row. |
| T-10 | Language | English and Bangla: the account menu, sign-in page and Help panel switch it. Every visible string should change; IDs and figures keep their format. |
| T-11 | Dark mode | Not a feature of this build; pages are light. |

---

## 2. Architecture

### 2.1 Stack and runtime

| ID | Part | Detail |
|---|---|---|
| A-01 | Framework | Next.js 16 (App Router), React. Every route is prerendered at build (`npm run build`). |
| A-02 | Front end only | No backend, database or API. Screens run on demo data and save to the browser (`localStorage`). Two browsers = two separate shops. |
| A-03 | Hydration rule | Server render = the design's demo moment; anything read from `localStorage` is read after mount, so the first paint and the hydrated page match. |
| A-04 | Screens | `src/screens/<module>/<Page>.jsx`, one file per screen; routes are `src/app/(group)/<route>/page.jsx`; `src/screens/registry.js` lists every screen. |
| A-05 | Shared logic | `src/lib/*.js`: one library per business object (stock, orders, ledger …). Screens never keep their own copy of shared data. |
| A-06 | Design system | `src/styles/design-system.css` tokens; pages built from `components/ui/IndexKit.jsx` (ShopHeader / RecordHeader, MetricStrip, IndexTabs, SearchField, Pager, Menu, KV). Shopify-admin density: 13 px text, 32 px controls (44 px on phones), 40 px table rows. |
| A-07 | Route groups | `(auth)` sign-in, `(merchant)` the admin, `(pos)` the register, `(settings)` settings pages. Phone-app prototypes and the platform console are separate groups (§15). |

### 2.2 Editions and modules

The product is sold as editions; each edition is a list of modules (`src/lib/edition.js › MODULES`, `EDITIONS`). A
module owns menu items and the pages outside the menu. A page outside the edition shows **"Not in Retail"**
(`components/RoleGuard.jsx`).

Retail = `core`, `catalog`, `places`, `purchasing`, `money`, `reports`, `hr`, `commerce`, `marketing`, `pos`.
Sales channel: **Retail** only (orders, sales book and reports are filtered to it by `editionChannels()`).

| Module | What it covers in Retail |
|---|---|
| core | Home, customers (list, profile, statement, settings), leads, tasks, team chat, GridAI, Connections, store settings, subscription, help & support, sign-in |
| catalog | Products, categories, brands, catalog setup, customer catalogue, media, stock list, stock activity, direct purchases, suppliers, supplier returns, damaged & expired, barcode labels, warranty policies and claims, bulk edit, stock setup |
| places | Warehouses, branches, racks & bins, transfers, stock adjustments, stock count, stock holds |
| purchasing | Purchase orders, receive goods (desktop and phone), purchase requests |
| money | Finances (overview, money, income & expenses, dues, bills to pay, approvals, statement match, setup, reports, sales & profit, VAT, chart of accounts, journals), invoices, payment operations, payouts |
| reports | Reports centre, report viewer, daily summary, scheduled reports |
| hr | Staff & HR (16 pages) |
| commerce | Orders list, order page, return history, payment setup |
| marketing | Offers, coupons, loyalty, members, product points, store credit, invite a friend, Google Business |
| pos | Register, POS manage, sales book, return & exchange |

`WHOLESALE = false`: the wholesale module, the Wholesale channel and every wholesale-only field, view and report are
hidden (`docs/wholesale-audit.md`). Setting it to `true` brings them back.

### 2.3 Data layer (browser storage)

| Library | Holds | Used by |
|---|---|---|
| `locations.js` | The one list of places: Central Warehouse (main, online place), Returns & damaged bay (no sale), Dhanmondi branch, Mirpur branch | Every place picker |
| `stock.js` | Catalogue (stock rows + products), on hand / held / available / in transit per place, stock moves, offline move queue | Stock, POS, orders, counts, transfers |
| `products.js`, `brands.js`, `productTemplates.js` | Products (25 demo phones and accessories), brands, product templates and spec fields | Products area, POS |
| `stockHolds.js`, `stockAdjustments.js`, `countSessions.js`, `transfers.js`, `racks.js`, `batches.js`, `serials.js`, `custody.js` | Holds, adjustments, counts, transfers, bins, expiry batches, IMEI / serial register, stock with vendors | Inventory |
| `purchaseOrders.js`, `supplierBills.js`, `productCost.js` | Purchase orders, supplier bills, payments, credit notes, supplier returns, buying prices | Purchasing |
| `posStore.js`, `posSale.js`, `hardware.js`, `scaleBarcode.js` | Counters, shifts, held / completed sales, cash movements, POS settings, offline queue, device state | POS |
| `orders.js`, `orderLinks.js`, `orderStates.js`, `returns.js`, `receipts.js` | Orders (counter sales become orders), returns, receipt sends | Orders, POS, returns |
| `invoices.js`, `creditRules.js` | Invoices (sales on due), payments, acceptance, revisions; retail credit rules | Invoices, POS, Dues |
| `ledger.js`, `ledgerSeed.js`, `settlements.js`, `approvals.js`, `paymentRefs.js`, `refunds.js`, `liabilities.js`, `categories.js`, `profit.js`, `salesBook.js`, `vat.js`, `statementImport.js` | Accounts and every money movement, payouts, approvals, transaction IDs, refunds, bills to pay, categories, profit, VAT | Finances, Payments |
| `customers` / `crm.js`, `segments.js`, `customFields.js`, `consent.js`, `restrictions.js`, `customerWarranty.js` | Customer book, segments, custom fields, consent, restrictions, warranty items and service requests | Customers |
| `loyalty.js`, `storeCredit.js`, `promotions.js` | Members, points, levels, store credit, referrals; the one promotion engine | Marketing, POS |
| `hr.js` | Staff, shifts, roster, attendance, leave, loans, payroll runs, changes, devices, positions, gratuity | Staff & HR |
| `tasks.js`, `teamChat.js`, `leads.js` | Tasks, team chat, leads | Team, Customers |
| `messaging.js` | The one send layer (simulated) with delivery log | Receipts, loyalty, scheduled reports |
| `auditLog.js`, `settingsHistory.js` | Manager PIN log, settings changes | Reports, Settings |
| `moduleSetup.js` | Setup checklists per area | Area main pages |
| `reports/*` | Report definitions (`defs/<group>.js`), catalogue, metrics, daily summary | Analytics |

---

## 3. Who uses it: roles, plans, access

### 3.1 Access is worked out in this order
role → edition → stock setup → plan → setup state (`team.js › navFor`). The sidebar shows only what passes;
`RoleGuard` covers a page opened by address: **"Not in Retail"** (edition), **Upgrade** (plan) or no access (role).

### 3.2 Demo people (menu areas each one sees in Retail; number of pages in brackets)

| User id | Name | Role | Place | Retail menu |
|---|---|---|---|---|
| ceo | Mehedi Rahman | CEO | Head office | Everything: Home(2), Orders(3), Products(7), Inventory(18), Payments(3), Customers(3), Finances(8), Analytics(3), Marketing(8), POS(2), Staff & HR(15), Team(2), Settings(4) |
| cto | Tanvir Hossain | CTO | Head office | Home, Products(1), Payments(1), Finances(1), Analytics(3), Marketing(1), POS(1), Staff & HR(1), Team, Settings(4) |
| jannatul | Jannatul Ferdous | Social media & content | Head office | Home, Products(1), Analytics(1), Marketing(1), Team, Settings(1) |
| farhana | Farhana Yasmin | Order management | Central Warehouse | Home, Orders(3), Products(1), Inventory(1), Customers(2), Analytics(2), Team |
| lamia | Lamia Sultana | Communications | Head office | Home, Orders(1), Customers(2), Analytics(1), Team |
| shakil | Shakil Ahmed | Ads & tracking | Head office | Home, Analytics(1), Marketing(4), Team, Settings(1) |
| tareq | Tareq Aziz | Warehouse manager | Central Warehouse | Home, Orders(1), Products(1), Inventory(17), Analytics(1), Staff & HR(3), Team |
| sabbir | Sabbir Hossain | Warehouse supervisor | Central Warehouse | Home, Orders(1), Inventory(9), Staff & HR(1), Team |
| rakib | Rakib Hasan | Shop manager | Dhanmondi branch | Home, Orders(3), Products(1), Inventory(10), Customers(2), Analytics(2), Marketing(3), POS(2), Staff & HR(3), Team |
| sadia | Sadia Akter | Shop supervisor | Dhanmondi branch | Home, Orders(3), Inventory(1), Customers(1), POS(2), Staff & HR(2), Team |
| rafi | Rafi Ahmed | Shop seller | Dhanmondi branch | Home, Orders(2), Products(1), Inventory(1), Customers(1), Marketing(1), POS(1), Team |
| sharmin | Sharmin Akter | HR | Head office | Home, Finances(1), Analytics(1), POS(1), Staff & HR(15), Team |
| arafat | Arafat Hossain | Online sales expert | Head office | Home, Orders(2), Customers(2), Analytics(1), Marketing(3), POS(1), Team |

Roles built for online work (content, communications, ads, online sales) still exist in Retail with a small menu;
see open decision D-05.

### 3.3 Plans (`src/lib/plans.js`, Settings › Subscription & billing)

| Plan | Retail modules included | Locked (shows Upgrade) |
|---|---|---|
| Starter | core, catalog, commerce, money, reports, pos | places, purchasing, marketing, hr |
| Growth | Starter + places, purchasing, marketing | hr |
| Business (demo default) | every module | none |

Usage & limits (`planLimits.js`): orders, products, staff seats, SMS & WhatsApp, storage, places, domains against the
plan's limits. Changing plan shows what a downgrade takes away before it saves.

---

## 4. The shell (on every page)

| ID | Facility | What should happen |
|---|---|---|
| SH-01 | Sidebar | Areas (§5) in two groups, Commerce and Team & settings; the open area lists its pages under a guide line; current page highlighted; edition chip "Retail" under the logo; the person's card at the bottom (opens My dashboard). 264 px panel, a 76 px rail below 1280 px, a drawer below 1024 px. |
| SH-02 | Sidebar counts and setup badges | Live counts on items that have them; an area with unfinished setup shows a badge (`pendingSetup`). |
| SH-03 | Top bar: menu and crumb | Menu button (drawer on small screens); breadcrumb = area / page. |
| SH-03b | Icon rail | On the 76 px rail (POS, windows under 1280 px) each icon has a short name under it and a tooltip. |
| SH-04 | Top bar: Help | Opens the Help panel for this page (also **Shift + ?**). English and Bangla. |
| SH-05 | Top bar: search | Scope picker (All, Orders, Products, Customers …), ⌘K / Ctrl K focuses it, results as you type. |
| SH-06 | Top bar: Scan | Opens the scan box: type or scan a barcode / SKU / IMEI; shows the product with Open product / stock. |
| SH-07 | Top bar: Settings | Opens Store settings. |
| SH-08 | Top bar: Invoices | Quick list of invoices (latest, unpaid) with links. |
| SH-09 | Top bar: Files | Recent files; "Upload a file" (images, PDF, CSV, Excel, 20 MB) is a demo toast. |
| SH-10 | Top bar: Notifications | Retail notes list, payout check note (card machine), Mark all read. No online-order notes in Retail. |
| SH-11 | Top bar: account menu | The store name (Settings › General) with the plan and the real branch count; name and role, Switch account, Profile type, Start page (choose the page that opens after sign-in), Language EN / বাংলা, Sign out. |
| SH-12 | Setup strip | On a page whose setup is not finished, a one-line note with the fix link (dismissable). |
| SH-13 | Not in Retail | A page from another edition opened by address shows "Not in Retail" with a way back. |
| SH-14 | Upgrade | A page in a module the plan lacks shows Upgrade (opens `/subscription?upgrade=<module>`). |
| SH-15 | Help panel | Per-page help from `src/lib/help.js` (pages without an entry get one built from the menu and header); the page's longer explanation (`about`) is read here. |
| SH-16 | Translation | Shell (`shell/i18n.js`) and pages (`runtime/translateDom.js` with `lib/i18n/bn.js`) switch whole strings; switching back restores English. |
| SH-17 | Evening payout check | 8 PM check of expected payouts (`components/EveningCheck.jsx`); opens from the bell only (`AUTO_OPEN` off). |
| SH-18 | Toasts and confirms | Success = toast; destructive actions ask with a confirm dialog; a control not built yet says so with a toast. |
| SH-19 | Phone layout | Lists become cards (`mobileTables.js`), filters go into a "Filter (n)" bottom sheet, extra header buttons fold into More, forms pin their main action at the bottom. |
| SH-20 | Hosting badge space | Space is reserved at the bottom so the Netlify badge never covers a save bar. |

Not in the Retail shell: chat button and floating chats, meeting alerts and video icon, View store link, Proposal chip
(development only).

---

## 5. Facilities by menu area

### 5.1 Home

| ID | Facility | What should happen |
|---|---|---|
| HOME-01 | Dashboard `/merchant-overview` | Key figures for the day from the shared books (`reports/dailySummary`): Sales, Money in hand, This month against the target. No online-order figure in Retail. |
| HOME-02 | Monthly target | Tap "This month" to change the target (kept in `gc.home.layout`). |
| HOME-03 | Greeting + Ask GridAI | "Ask GridAI" opens the GridAI panel with the question. |
| HOME-04 | Needs you | The day's work (owner, severity, age): Pay bills, Pay suppliers, Restock, Approve purchase orders, Approve stock adjustments, Check payouts … A "Needs you" button with the count sits in the top row next to Create and Export; it opens the full list (snooze, dismiss, Open). Each row opens the page where it is done. No Verify orders / Send to courier / Receive returns in Retail. |
| HOME-05 | Snooze / dismiss | A pill's ⋯ snoozes or dismisses it; View all lists every action item. |
| HOME-06 | As of + refresh | Shows when figures were worked out; refresh recalculates. |
| HOME-07 | Export | Saves the chosen day and place's figures as CSV. |
| HOME-08 | Charts | Sales · last 7 days (column chart with tooltip, keyboard arrows, hidden data table) and Best sellers. |
| HOME-09 | Home widgets | Sales summary (revenue / cost / profit, date range, category), Order summary rings, Top customers, Latest orders, Latest customers, Top products, Stock alert (category + place). |
| HOME-10 | New shop checklist | A shop with no data sees a setup checklist instead of empty charts; Insights card. |
| HOME-11 | Create menu | New sale (opens `/pos`), Add product, Receive goods, Add expense. Retail has no New order. |
| HOME-12 | My dashboard `/my-dashboard` (hidden page, from the person's card) | The signed-in person's day: three figures, role shortcuts, top 5 tasks, follow-ups, role report blocks, role widgets (approvals, team chat, me at work, team on duty, HR today). |

### 5.2 Orders

In Retail every order is a counter sale (finished or on due). Courier, verification and packing steps do not apply.

| ID | Facility | What should happen |
|---|---|---|
| ORD-01 | All orders `/merchant-orders` | Title "Orders"; today's figures: Orders, Order value, **Payment due** (→ Dues), Return rate. |
| ORD-02 | Retail views | Tabs: All · Payment due · Completed · Cancelled · Returned, with counts. |
| ORD-03 | Search and filters | Search by order no., customer, phone; filters for payment (Paid / Unpaid / Partly paid) and the rest; Apply filters / Reset; phone bottom sheet. |
| ORD-04 | Create order | Opens the register `/pos` (Retail creates orders only by selling). |
| ORD-05 | Bulk: Send receipts | Tick orders → Send receipts: each with a phone gets an SMS receipt; result says how many were sent / not sent. |
| ORD-06 | Export | CSV of the list, including the worked-out order states (confirmation, payment, fulfilment, due, completed, next step). |
| ORD-07 | More › Return history | Opens `/return-history`. |
| ORD-08 | Setup checklist | Orders setup checklist on top until done (§8.10). |
| ORD-09 | Order page `/order-detail?id=` (counter sale) | Items with price, qty, discount; **Sold by**; per line **IMEI / serial** and **Warranty** (period, until date, claim place) and any warranty service logged; Payment card (method parts, paid, due); Activity. No steps card, no courier, no shipping address, no visit details for a counter sale. |
| ORD-10 | Order page: Print invoice | A4 invoice with letterhead (trading name, address, phone, email, BIN), invoice no., date, place, Bill to, Sold by, items with IMEI and warranty, subtotal / discount / VAT / total, each payment, change, due, thank-you line. |
| ORD-11 | Order page: Print POS receipt | Under More actions. |
| ORD-12 | Order page: Send / Resend receipt | Dialog: SMS or Email, the address (prefilled from the customer); validates an 11-digit mobile (01XXXXXXXXX) or an email; lists every earlier send with time, by whom, "sent" / "not sent". |
| ORD-13 | Order page: Return | Opens `/return-exchange?ref=<order>`. |
| ORD-14 | Order page: notes and tags | Order note and Internal note save when the field is left; tags add / remove. |
| ORD-15 | Order page: Add a comment, Cancel order, Block customer | Under More actions; Cancel asks first. |
| ORD-16 | Invoices `/sales-invoices` | Sales on due made out to a customer. Tabs All · **To accept** · Unpaid · Partly paid · Paid; search; row opens the invoice. |
| ORD-17 | Invoice page `/sales-invoice?id=` | Items, payment, payments taken (correct or void), deliveries (challan / gate pass), **Revisions**, previous orders, customer standing and advance credit. |
| ORD-18 | Accept invoice | A staff member accepts the invoice before payment can be recorded (who, when, which revision). |
| ORD-19 | Record payment | Method, amount, reference, received by; extra can be kept as the customer's advance or given back as change; fully paid = completed sale and order. |
| ORD-20 | Edit invoice (revision) | Unpaid only; asks **"Why is it changed?"**; makes a new revision; pieces already delivered cannot be edited away; a changed invoice must be accepted again. "Save and send again" sends the new revision. |
| ORD-21 | Send invoice | Sends (demo: toast) the invoice by SMS to the customer's mobile; marks it sent. |
| ORD-22 | Statement / Customer statement | Opens `/customer-statement?phone=`. |
| ORD-23 | Returns & exchanges `/return-exchange` | See §5.10 POS (POS-40 to POS-55). |

### 5.3 Products

| ID | Facility | What should happen |
|---|---|---|
| PRD-01 | All products `/all-products` | Views All · Active · Draft · Archived · Deleted; search; filters (category, missing info: no SKU / barcode / category); compact table with stock. |
| PRD-02 | Bulk actions | Change category, Archive, Delete, Duplicate, Print labels, Bulk edit, Fill with AI. |
| PRD-03 | Import / Export | Import products from CSV (template, preview, errors); Export CSV. |
| PRD-04 | Add product `/add-product` | Main column: Title, rich-text description, Media, Classification (main category + subcategories, template), Specifications (template fields; key features first, "View all product data"), Pricing, Product model (format, selling mode, sellability), Variants (+ variant editor drawer), one-line cards: Inventory & identifiers & units, Shipping, SEO. Side: Status, Publishing, Organization, Product data, Warranty, Activity. New products start as Draft. |
| PRD-05 | Retail product form | Online-only cards (Google listing readiness, online publishing, sales channels) and **Product relationships** are hidden in Retail (`SHOW_RELATIONS = false`). |
| PRD-06 | Identifiers | SKU, barcode ("Make one" = in-store EAN-13 starting with 2), IMEI / serial tracking, batch / expiry, units. |
| PRD-07 | Opening stock | Posts once as an `opening` stock move at the chosen place. |
| PRD-08 | Warranty on the product | Pick a warranty policy; drives the warranty shown on invoices, order page and customer profile. |
| PRD-09 | Preview, Duplicate, Save draft, versions | Header actions; All versions / Restore this version; approval flow (Send for approval / Approve / Reject) when set. |
| PRD-10 | AI writing assistant | Generates description text (demo). |
| PRD-11 | Sellable rules | Only Active products with a price sell; "Keep selling when out of stock" allows pre-order (`sellable.js`). |
| PRD-12 | One product editor | `/add-product-tabs` forwards to Add product. |
| PRD-13 | Bulk edit `/bulk-edit` | Spreadsheet: pick products and columns, formulas (+10%, x1.1, =cost*1.3, +tag), fill column, paste from Excel, preview before / after, save as a job, Jobs list with audit and Roll back. Stock is not edited here. |
| PRD-14 | Categories `/categories` | Category tree (phones, accessories …), add / edit / delete, category fields, See products, Import with template, Write with AI. |
| PRD-15 | Brands `/brands` | Gallery or List view (remembered), search; add / edit (name, description, image upload / replace / remove), delete asks first; product counts. |
| PRD-16 | Catalog setup `/catalog-setup` | Product templates (open in a side panel: turn Grid fields off, add the shop's own fields, reset), custom fields, units, tax rates, size charts, warranty policies link. |
| PRD-17 | Customer catalogue `/customer-catalogue` | Shareable catalogue: settings on the left, sharing and live phone preview on the right, Save. |
| PRD-18 | Media library `/set-media` | Logos and brand images: upload, replace, remove, where each asset appears. |
| PRD-19 | Setup checklist | Products setup checklist on All products. |

### 5.4 Inventory

| ID | Facility | What should happen |
|---|---|---|
| INV-01 | Stock `/stock` | Place picker with that place's figures (products in stock, stock value, low, out, held, in transit); views All · Low stock · Out of stock · Expiring soon; table Product · SKU · Damaged · Held · Available · On hand · In transit (on hand = damaged + held + available). |
| INV-02 | Product stock panel | Click a row: cost, value, reorder level, bins, stock history; actions Adjust, Move, Print label, Open product, Make purchase order, Assemble / Take apart (bundles). |
| INV-03 | Stock activity `/stock-activity` (hidden, from Stock) | Every stock move: views by kind (received, sold, moved, adjusted, counted, sent back to supplier …), filters (product, place, reference, user, batch, serial / IMEI), export. |
| INV-04 | Trace a serial / IMEI | One unit's life: received, moved, held, sold, returned, with a vendor. |
| INV-05 | Stock with vendors | Send to a vendor or service centre, receive back, close without return. |
| INV-06 | Moves waiting to sync | Moves posted offline, posted when online. |
| INV-07 | Purchases `/purchases` | Everything bought: views All · To pay · Overdue · Paid; supplier filter; side panel with items, payments, what is left, **Pay**; **New purchase**; Return goods. |
| INV-08 | New purchase `/buy-goods` | Supplier, products (qty, buying price, expiry), place, payment Paid in full / Part paid / Pay later, from which account. Saves stock `receive` moves, a supplier bill for what is left, the payment (ledger), the latest buying price, expiry batches. |
| INV-09 | Receive goods `/receive-goods` | Choose a purchase order → scan each item → extra (keep or return), unknown barcode (add or set aside), damaged / wrong items (held at Returns & damaged), extra costs (transport, labour) → Save: stock moves + supplier bill. |
| INV-10 | Receive goods on a phone `/mobile-receive` | Camera scan of a delivery. |
| INV-11 | Transfers `/transfers` | Views All · On the way · Received · With a problem · Not sent yet; next step per row (Send, Scan in, Resolve); short pieces written off, claimed from carrier or kept pending. |
| INV-12 | New transfer `/new-transfer` | Route (from / to), scan items, who carries it, Save and send later or Send and print slip. |
| INV-13 | Purchase orders `/purchase-orders` | Views (Draft, Waiting approval, Ordered, Partly received, Received, Closed, Cancelled, Overdue, Unpaid); supplier filter; export; New purchase order. |
| INV-14 | New PO `/new-po` | Supplier and delivery, products (low-stock list, copy a past order, import CSV), extra costs, payment terms, files, note; Save as draft or place. |
| INV-15 | PO page `/po-detail?no=` | Products and what arrived, deliveries, extra costs, files, history, payment; Mark as sent, Receive next delivery, Record a payment, Return to supplier, Print, Supplier ledger. |
| INV-16 | Suppliers `/suppliers` | Total payable, views by due date (Overdue, Due today, This week, Nothing due); Add supplier; Pay (one bill, several or part, from an account). |
| INV-17 | Supplier page `/supplier-detail?id=` | Ledger, bills, payment history, due dates, purchase orders, contact, credit terms; New purchase order; **Return goods**. |
| INV-18 | Supplier return `/supplier-return` | Waiting to go back (damaged holds from deliveries) and Returns made. **Return bought items**: anything bought from the supplier up to what was bought less already returned. Settle as **credit** (lowers what the shop owes) or **replacement** (stays Waiting until **Receive replacement** adds the stock at a chosen place). |
| INV-19 | Stock adjustments `/stock-adjustments` | Adjust with a reason (damaged, lost, found, count correction …); any decrease or a change over 20 pieces needs a manager: PIN now or "Waiting for approval"; views Pending · Approved · Rejected. |
| INV-20 | Stock count `/stock-count` | Place, what to count, kind (Quick / Blind / Cycle / Full); snapshot; scan (pack barcode counts the pack, a serial counts one); several counters; save and continue later; finish → differences, recount big ones, manager PIN → each difference saved once as a `count` move. |
| INV-21 | Stock holds `/stock-holds` | Views On hold · Retail orders · Damaged · Closed; place picker; End hold (delivered, released, damaged); stock by product folded below. |
| INV-22 | Damaged & expired `/expiry-disposal` | Expiring / expired batches; damaged stock at the bay; Record damage (reason: broken, water damage, expired …; then sell cheap / throw away / return). |
| INV-23 | Purchase requests `/requests` | Staff ask for stock; owner approves (or changes qty) or rejects; approved requests become purchase orders, one per supplier, with a preview. |
| INV-24 | Barcode labels `/barcode-labels` | Pick items and layout, live preview, Print. |
| INV-25 | Warranty policies `/warranty-policies` | Policies list; a policy record: basics, coverage, claim process, terms, what it applies to, customer's view, versions; Save draft / Publish; bulk attach to products. |
| INV-26 | Warranty claims `/warranty-claims` | Figures (open claims, average turnaround, rejected this month); claims list (side panel with steps and decision); New claim starts with a warranty look-up (invoice, phone, serial / IMEI); Serial & IMEI register; add numbers for received goods; print warranty cards; CSV. |
| INV-27 | Warehouses `/warehouses` | Figures from the stock list; add / edit / deactivate (blocked while it has stock, holds, transfers or counters). **Central Warehouse is the online place**: badge, cannot be deactivated. |
| INV-28 | Branches `/branches` | Same as warehouses plus hours, sells at a counter, POS counters and today's POS sales. |
| INV-29 | Racks & bins `/racks` | Per place: racks → shelves → bins (A-2-05); capacity; put away, move, take out; bin finder; "Not in a bin yet"; rules (no more in bins than on hand, capacity, a rack with stock cannot be removed). |
| INV-30 | Setup checklist | Inventory and Purchases checklists on Stock and Purchases. |

### 5.5 Payments

| ID | Facility | What should happen |
|---|---|---|
| PAY-01 | Payment operations `/payment-ops` | Figures (to check, references used twice, open refunds, failed refunds, card batch differences). Views: **Transactions** (manual bKash / Nagad / Rocket / bank payments with the duplicate-reference check; review panel), **Refunds** (requested → approved → sent → done / failed, Retry), **Payment links** (amount, expiry, one-time / reusable, paid), **Card batches** (terminal end-of-day total against card sales). |
| PAY-02 | Record refund, create payment link, enter / import card batches | From the header. |
| PAY-03 | Payouts `/settlements` (browser tab "Payouts") | Money partners hold and pay later (card machine and any gateway in use). Views Coming in · Needs a look · Paid out · Partners; tick a payout off when it lands, give a new date, explain a different amount; withdraw from wallets. |
| PAY-04 | Payment setup `/set-payments` | Retail shows the card machine and the counter's send-money / bank transfer rows (add gateway, test connection). Online checkout gateways, COD rules and exchange rates are hidden in Retail. |
| PAY-05 | Setup checklist | Payments checklist on Payment operations. |

### 5.6 Customers

| ID | Facility | What should happen |
|---|---|---|
| CUS-01 | All customers `/all-customers` | One list of persons and companies with a stable customer ID; views (All, New this week, Repeat buyers, Big spenders, Birthday this month, Members, Points expiring, Possible duplicates, Needs cleanup, Suspended …); search any phone, email, customer ID; filters (status, restrictions, type, consent, segment); Columns chooser. |
| CUS-02 | Add customer / Add company / Edit | Dialog; phone number checks. |
| CUS-03 | Bulk actions | Add / remove tag, Add to segment, Change consent, Assign coupon, Export, Print, Send SMS (shows how many can get it by consent). |
| CUS-04 | Merge duplicates | Possible duplicates view: Merge these 2 / Not the same. |
| CUS-05 | Segments | Segment builder, save as a segment, manage segments. |
| CUS-06 | Customer profile `/customer-crm?id=` | Five areas: **Overview · Orders · Invoices · Messages & activity · Details**. Header figures (lifetime value, orders, average order, due, points). |
| CUS-07 | Profile › Overview | Latest 3 orders (hidden when there are none), **Warranty** card (top 3 covered items), "Good to know" side card. |
| CUS-08 | Profile › Orders | Every order; full **Warranty** card: each item with warranty, IMEI / serial, policy, bought date and order link, **days left**, until date, progress bar, Covered / Ending soon (≤ 30 days) / Ended, claim place; **Log service** (what is wrong) records a warranty service request (WR-0001 …), shown on the order page. |
| CUS-09 | Profile › Invoices | Figures (owed, overdue, credit); Unpaid / Accepted / Paid / All; invoice drawer with lines, revisions, **Accept**, **Record payment**, Edit (revision with reason), pay link, pay several. Header refreshes after a payment. |
| CUS-10 | Profile › Messages & activity | Messages sent to the customer and the activity history; Add note. |
| CUS-11 | Profile › Details | Phones (primary), emails, addresses (default), custom fields, consent, restrictions, account (suspend / close, password reset, log out of all devices), Merge customer, Add to a company. |
| CUS-12 | Profile actions | Call, Message, Add credit, Give or take points, Assign coupon. No "Schedule meeting" in Retail. |
| CUS-13 | Customer statement `/customer-statement?phone=` | Invoiced, paid, due, advance credit; running ledger (invoices, payments, voided struck through, credit, returns); date range; Print statement. |
| CUS-14 | Leads & follow-ups `/sales-leads` | Follow-ups (overdue, today, coming) with "log the call and set the next"; Pipeline board (drag); List; lead page with history, call / WhatsApp, move stage, Won (adds the customer) or Lost; Make a task; Mine / Everyone. No meetings in Retail. |
| CUS-15 | Customer settings `/customer-settings` | Custom fields; Segments; **Credit & dues** (retail due: allow, default limit, due days, phone needed, manager above limit); who sees IP addresses and devices; data kept (delete old data now). |
| CUS-16 | Setup checklist | Customers checklist on All customers. |

### 5.7 Finances

| ID | Facility | What should happen |
|---|---|---|
| FIN-01 | Overview `/accounts-home` | Figures: cash, banks, mobile wallets, with partners, this month's net profit; Needs you pills (late or short payouts, wallets to withdraw, money waiting for approval, payments to check, statement lines, bills due, a full drawer); Coming in chart; In and out by kind. |
| FIN-02 | Cash, bank & wallets `/money` | Every account (cash, counter drawers, safe, banks, wallets) and every movement with a running balance; views by account type; filters (account, kind, dates, moves between own accounts). **Add money**, **Take out**, **Move money**. Over the approval limit → waits in Approvals. |
| FIN-03 | Split payments in Money | Each part of a split payment (from POS or Return & exchange) is its own row with its method and reference ("part i of n"). |
| FIN-04 | Income & expenses `/expenses-bills` | Every taka out and non-sale taka in: expenses, salaries, commission, promotions, supplier payments, owner withdrawals / investment, partner fees, other income; views per type; month; search; Spend by category. **Record expense**, **Record income**, owner puts in / takes out. |
| FIN-05 | Dues `/dues` | You will get (customers with money due; ageing; Record payment across invoices; Write off small balance → approval; Remind copies a message; Statement) and You owe (supplier bills by due date, liabilities). |
| FIN-06 | Bills to pay `/liabilities` | Salaries, commission, promotions and other bills: views All · Open · Paid; a bill's lines and payments; Pay (tick people, part payments, from usual or one account); Add bill; Fill from payroll; held for customers (points + store credit). |
| FIN-07 | Approvals `/money-approvals` | Expenses, money moves, refunds, write-offs over a limit; Waiting · Approved · Denied · All; review panel; Approve posts it, Deny asks a reason; the maker cannot decide (can take it back); deciding needs the Approver duty. |
| FIN-08 | Match statements `/statement-match` | Import a bank / wallet CSV (sample BRAC Bank statement); auto-match by amount and date; To match · Matched · Ignored · All; match, make the missing entry, ignore with a reason, unmatch; importing twice adds nothing twice. |
| FIN-09 | Money setup `/account-setup` | Payment partners (fee, payout days, account, holidays), Categories (expense / income, channel or shared), Banks & wallets (add), Holidays, Evening check, Approvals (limits and duties), Advanced. |
| FIN-10 | Account reports `/account-reports` | Profit & loss, Cash flow, Partner fees, VAT for a period; Download CSV, Print. |
| FIN-11 | Sales & profit `/sales-profit` | Retail channel: sales, returns, cost of goods, gross profit, channel costs, shared costs, other income, net profit; sales trend; "What stands out". |
| FIN-12 | VAT `/vat` | VAT collected and paid, owed this month, rate per category, monthly return (Mushak-9.1), sample VAT invoice (Mushak-6.3); not-registered mode. The POS charges VAT from these rates. |
| FIN-13 | Chart of accounts `/chart-of-accounts` | Accounts by group with balances and trial balance; Add account. |
| FIN-14 | Journals `/journals` | Auto and manual journals; New journal (debits must equal credits). |
| FIN-15 | Platform costs | SMS, email and AI use billed monthly from GridCommerce credits; subscription and server charged on the 12th; generated ledger rows appear in Income & expenses and profit. |

### 5.8 Analytics

| ID | Facility | What should happen |
|---|---|---|
| REP-01 | Reports `/reports-centre` | Groups as views, search, Recently viewed; a row opens `/report?id=` or its page. **70 reports in Retail** (list below). |
| REP-02 | Report viewer `/report?id=` | Period (Today … This year, Custom), compare (previous period / last year), filters the report needs (place, branch, counter, staff, category …), key figures with change, one chart, table (sort, search, drill-down), column chooser kept per report, Download PDF (letterhead, period, filters, sign-off), Download CSV, "How is this calculated?" on dictionary metrics. |
| REP-03 | Daily summary `/daily-summary` | One day's pack: sales by branch, money at closing, payouts, low stock, dues collected, expenses, top 5 products; Download PDF / CSV. No online orders card in Retail. |
| REP-04 | Scheduled reports `/scheduled-reports` | Schedules (report, how often, next run, send to, WhatsApp / email, format, on / off); New, Edit, Delete; **Send a test now** (shows the message, goes through the send layer). |

Reports in Retail (70):
- **Sales (12)**: Sales summary · Sales by branch & counter · Sales by product · Sales by category · Sales by staff & cashier ·
  Busy hours & days · Payment methods · Discounts given · Returns analysis · Cancelled & void sales · Sales book (page) ·
  Return & exchange history (page).
- **Customers (6)**: New and returning customers · Top customers and segments · Inactive customers (win-back list) ·
  Customer lifetime value · Customers by area · Loyalty, wallet and referrals.
- **Inventory (12)**: Stock on hand & value · Low stock & reorder list · Slow-moving & dead stock · Stock movement · Stock
  value at a date · Stock ageing · Shrinkage: adjustments & counts · Damaged & expired stock · Transfers between places ·
  Stock holds · Racks & bin use · ABC analysis & sell-through.
- **Purchase (8)**: Purchases by supplier · Purchases by product · Purchase order status · Receiving problems · Supplier
  dues by age · Supplier returns, credits & bonuses · Purchase price history · Supplier scorecard.
- **Finance (17)**: Expenses by category · Daily closing (cash) · Cash flow summary · Bank & wallet balances · Profit by
  channel · Profit & loss by month · Expenses by channel · Receivables & payables · Partner fees & delivery charges · VAT
  summary (Mushak 9.1) · Balance sheet (simple) · Owner investment & withdrawals · Platform & messaging costs · Sales &
  profit by channel (page) · Profit & loss, cash flow, partner fees, VAT (page) · Dues (page) · Liabilities (page).
- **POS (5)**: Shift Z-reports · Counter performance · Cash over & short by cashier · Cash pickups & paid-outs · Manager
  approvals (PIN log).
- **HR (7)**: Attendance summary · Leave report & balances · Payroll register · Staff loans & advances · Staff cost vs
  sales · Roster cover · Sales & commission by salesperson.
- **Marketing (3)**: Discounts & coupons · Flash sale & promo results · Invite a friend (referrals).

### 5.9 Marketing

| ID | Facility | What should happen |
|---|---|---|
| MKT-01 | Offers `/promo` | This month's figures (sales from offers, discount given, codes used); running and coming soon (pause / start again everywhere); month at a glance; top banner setting. |
| MKT-02 | Coupons `/coupons` | Codes with what they give, dates, uses, sales, on / off; tap to copy; turning off pauses it everywhere. |
| MKT-03 | New offer / coupon `/new-coupon` | A code or automatic offer; taka / % off, free delivery, Buy X get Y, quantity discount, free gift; who (everyone, first order, member levels, one customer), products / category, payment method, where (POS counter only, website …), when and how many times, combine rules; **Test this offer** on a sample cart; Save and turn on. The POS applies it at once. |
| MKT-04 | Loyalty & rewards `/loyalty` | Rules: how points are earned and used, member levels, on / off, value of a point; messages to members (New level, Store credit added, Invite reward ready, Points expiring, Birthday gift) with templates; In your books (points value as a liability, loyalty cost); worked example; Remove expired points. |
| MKT-05 | Members `/members` | Level tabs, search, filters; Add member (also adds to customers); Download list. |
| MKT-06 | Member page `/member-detail?phone=` | Points (and ৳ value), level progress, store credit, buying, invites; Give or take points with a reason; Give credit; Correct store credit (manager PIN); level history. |
| MKT-07 | Product points `/product-points` | Per product: Normal / Double / No points; Set all. |
| MKT-08 | Store credit `/wallet` | Balances and all changes (added, used, expired, reversed, corrected); Give credit; Correct a balance (manager); Expire old credit; never topped up or paid out in cash. |
| MKT-09 | Invite a friend `/referrals` | Reward rule (share of first order or points), sharers, friends who joined, rewards pending until the return period ends, returned order cancels, caps, self-referral refused; Pay reward (into store credit, or cash / bKash / bank from an account). |
| MKT-10 | Google Business `/google-business` | Locations (status, open now, rating), Reviews (all, unanswered, by stars; reply / edit; AI draft never published by itself), Business info (name, category, description, phone, website, address, hours, special hours, attributes), Posts, Media, Services; Sync now, Disconnect. |
| MKT-11 | Setup checklist | Marketing checklist on Offers. |

### 5.10 POS

| ID | Facility | What should happen |
|---|---|---|
| POS-01 | Register `/pos` | Every "new sale" in the app opens it. Icon rail, status header (counter, cashier, device chips), product cards, cart with scan field. |
| POS-02 | Open register | Choose counter (REG-01 Dhanmondi · Counter 1, REG-02 Dhanmondi · Counter 2, REG-03 Mirpur · Counter 1), opening float and where it came from (safe or last shift), any difference. One shift per counter and drawer across devices. |
| POS-03 | Products | Cards show stock available at the counter's place; search (F2), category filter, scan or type SKU (F3). Non-Active products are not shown. |
| POS-04 | IMEI / serial | A tracked product asks for its number when added; the number is checked (valid IMEI, not already sold) and kept on the line; scanning a number in stock adds its product. |
| POS-05 | Weighed items | Scale label (EAN-13 starting with 2) read into product + weight or price, confirmed in a sheet. |
| POS-06 | Cart editing | Qty +/−, remove, line keypad (Quantity, Unit price ৳, Discount ৳); a price change asks for the manager PIN. |
| POS-07 | Out of stock here | Shows stock at other places; can be sold here and shipped from there. Negative stock only where the place allows it. |
| POS-08 | Customer | Walk-in by default; mobile number finds the customer and the loyalty member (F9 / Alt M); customer restrictions are checked. |
| POS-09 | Hold / held sales | Hold (F6), Held sales (F7), Resume; held sales hold their stock until they expire (minutes set in POS manage). |
| POS-10 | Recent sales | F8: reprint, return. |
| POS-11 | Checkout on one page | Amount received, split payment (**Add as part payment**), methods Cash · Card · bKash · Nagad · Rocket · Due · Wallet (Alt 1–7); card and wallet payments name the account / terminal; change worked out. |
| POS-12 | Discounts | Cart discount (Alt D), coupon code (Alt C, promotion engine), member level discount, use member points (Alt R). |
| POS-13 | Sold by | Alt S: the salesperson (cashier unless changed), saved on the sale for staff sales and commission. |
| POS-14 | VAT | Charged from the VAT rates (Finances › VAT). |
| POS-15 | Due / credit | Allowed only when Customer settings › Credit & dues allows it: phone needed, limit = customer's credit limit or the default, over the limit asks the manager PIN; due date = sale + due days; restrictions still apply. |
| POS-16 | Complete sale | F4 / Enter. Operation id: a double tap or retry returns the first sale ("Already completed"). Stock leaves the place; serials marked sold; money posted to the ledger per method; loyalty points earned / used; becomes an order. |
| POS-17 | Sale complete: receipt | Receipt on screen with a **printing animation** (paper moves up from the slot, "Printing…"; reduced-motion shows it at once); Print receipt on / off (Alt P). |
| POS-18 | Sale complete: Print invoice | A4 invoice (same as ORD-10) next to Print receipt. |
| POS-19 | Sale complete: Send receipt | SMS or Email, address field (prefilled from the customer), validation, result "Sent" / reason; each send is recorded on the sale and shown on the order page. |
| POS-20 | Sale complete: New sale | Enter or the button; buttons wrap without overlapping the receipt. |
| POS-21 | Cash drawer | F10: cash pickup, cash in, paid out; Open drawer without a sale (reason, PIN, audit). |
| POS-22 | Hardware | Alt H: printer, scanner, terminal, drawer, scale status (demo) with Test. |
| POS-23 | Offline mode | Sales queued with local number and operation id; posted when online; conflicts (stock below zero, price changed, serial sold) wait in the Sync sheet. |
| POS-24 | Cancel sale / New sale | Alt X / Alt N. |
| POS-25 | End shift | Alt Z: expected vs counted per account; a difference above the POS limit needs a manager PIN and posts to the ledger; Z-report print. |
| POS-26 | Shortcuts | F1 shows the list (§11). |
| POS-30 | POS manage `/pos-manage` | Four tabs: **Counters** (register a counter at a branch or warehouse, who may work it, printer, drawer, float), **Shifts** (who is on now, what each sold, closed shifts with report; end another device's shift with PIN), **Cash pickups** (pickups / cash in from any drawer, drawer opens without a sale), **Settings** (register rules: drawer difference limit, held-sale minutes …). |
| POS-31 | Sales book `/sales-book` | Every counter memo: period, figures (sales, memos, profit, sold on due, returns), payment views, "Sold by" filter, memo panel (items, totals, print again, return / exchange, edit memo, send by SMS), export. |
| POS-40 | Return & exchange `/return-exchange` | Find the sale by memo / invoice / order no. or mobile number (`?ref=` opens it; `&mode=exchange`). |
| POS-41 | What is coming back | Tick items, never more than is left to return; reason; can it be sold again (back on sale or to damaged). |
| POS-42 | Credit worked out | What the customer really paid for the item: its share of every discount taken off, VAT included. |
| POS-43 | Exchange | Pick the new item; the summary shows who pays whom. |
| POS-44 | Detailed payment | Customer pays the difference or gets a refund: method (Cash, Card, bKash, Nagad, Rocket …), amount, **reference / transaction ID** where the method needs one (checked: used once), **several parts** (broken / split payment) with remaining shown; change worked out; "Leave the rest as due" adds to the sale's due when allowed. |
| POS-45 | Refund to mobile wallet | bKash / Nagad refunds ask "Send the refund to" number and create a refund in Payment operations. |
| POS-46 | Posts to Money | Each payment part is its own ledger row ("part i of n") with its reference; refunds post out. |
| POS-47 | Manager approval | Return after the return window or above limits asks the manager PIN. |
| POS-48 | Confirm | Saves to the return history, marks quantities on the sale, takes money off the due when chosen, moves stock; Print return slip; New return. |
| POS-49 | Return history `/return-history` | Every return / exchange: when, who, what, money (each part), where stock went; side panel with order, reason, staff, method, place; views Returns · Exchanges · Back in stock · Went to damaged. |
| POS-50 | Setup checklist | POS checklist on POS manage. |

### 5.11 Staff & HR

| ID | Facility | What should happen |
|---|---|---|
| HR-01 | HR dashboard `/hr-dashboard` | Today's attendance figures and open payroll; needs-you pills (top five, grouped, View all); approvals (Review opens the drawer); on duty now per place (shift drawer); coming up. |
| HR-02 | All staff `/all-staff` | Views Active · On leave · Probation · Suspended · All; search; place filter; bulk: assign shift, quick edit, export, send SMS (demo toast); import. |
| HR-03 | Add staff `/staff-create` | 7 steps: Personal → Job → Login and access → Shift and attendance → Salary (bank or bKash) → Leave → Review; draft kept; then open profile / print ID card / add another. |
| HR-04 | Staff profile `/staff-profile?code=&tab=` | Tabs Overview · Job & pay history · Attendance · Leave · Salary & payroll · Login & access · Documents · Activity; edit; increment / promotion / transfer / confirm after probation with letters; machine enrolment; bank / MFS payout; statement PDF; loans; leaving (final settlement); invitation, password reset, sign out everywhere; documents upload. |
| HR-05 | Attendance `/attendance` | Day view (date stepper), Month register, Fix requests (review drawer); add / mark / remove; bulk entry; import from device; print register; feeds payroll. |
| HR-06 | Shifts & roster `/shifts` | Roster per person per week; Cover per shift; Shifts (time, break, grace, colour, places, minimum staff); copy last week; publish roster; warnings (leave clash, overlap, cover under minimum, over 48 hours). |
| HR-07 | Leave `/leave` | Pending · Approved · Rejected · All · Calendar · Balances; review drawer (balance, cover by day, Approve / Deny with reason); apply on behalf; policies. |
| HR-08 | Payroll `/payroll` | Five steps: check attendance → review sheet → owner approval → pay → payslips; one-time lines; festival bonus run; approval creates the salary liability; paying posts one ledger row per person and takes loan instalments; print payslips; export. |
| HR-09 | Salary statements `/salary-statements` | Per person per tax year (July–June) or months; everyone at once; PDF on letterhead or CSV. |
| HR-10 | Increments & promotions `/pay-changes` | Increments, promotions, transfers, confirmations, cuts; due for review; yearly increment for many; planned changes; letters. |
| HR-11 | Loans & advances `/loans-advances` | Running, Requests, By person, Paid back / rejected; give (from an account, ledger); repayment plan cut from payroll; cash repayment; request review drawer. |
| HR-12 | Gratuity & leaving `/gratuity` | Rule (days of basic per year, after how many years); built up so far; eligible within a year; people who left with final settlement. |
| HR-13 | Positions & grades `/positions` | Positions by department, grade, salary band, holders, to hire; who reports to whom; new department / position. |
| HR-14 | ID cards & QR `/id-cards` | Print cards (front / back, several per A4) with QR (employee number or link); check a card by scanning. |
| HR-15 | Attendance devices `/attendance-devices` | Machines per place (connection, last sync, punches today), Sync / Edit / Remove, enrolment, today's punches, add machine. |
| HR-16 | HR setup `/hr-setup` | Departments, salary split, leave types and quota, attendance rules (weekly off, late, half day, overtime), holidays (shared with Finances), roles and permissions, payroll settings (pay day, rounding, bonus, advance limit, pay accounts), employee numbers & ID cards; "Show field tips". |
| HR-17 | Setup checklist | HR checklist on the HR dashboard. |

### 5.12 Team

| ID | Facility | What should happen |
|---|---|---|
| TEAM-01 | Tasks `/tasks` | Views My tasks · My teams · I gave · Watching · IT desk · Everyone; List / Board (drag) / Calendar / Workload; filters; bulk changes; Ask IT; teams and tags; a task: team, people, watchers, tags, type, dates, estimate, time logged, checklist, files, blocked by, comments, history, discuss in chat. |
| TEAM-02 | Team chat `/team-chat` | #general, #announcements, team channels, direct messages; @mentions, #TK task links, reactions, replies, pins, edit / delete own, search; make a task from a message; ask another team. |

### 5.13 Settings (menu items)

| ID | Facility | What should happen |
|---|---|---|
| SET-01 | Store settings `/set-general` | Opens the settings frame (§7). |
| SET-02 | Connections `/connections` | Every outside app: views All · Connected · Needs attention · Not connected; group filter; Connect (one flow `/connect?app=`), Reconnect, Manage, Disconnect. Retail lists: Google Business Profile; payments bKash, Nagad, SSLCOMMERZ, EPS, Rocket, Card machine; SMS gateway, Email sending; Attendance machines, AI assistant, File storage, Google Drive backup. |
| SET-03 | Subscription & billing `/subscription` | Plan, modules (trial, validity), billing history, next renewal, payment method, usage & limits, plan change with downgrade warning, edition switcher (full site). |
| SET-04 | Help & support `/help-support` | Support tickets to GridCommerce: Open · Solved · All; ticket conversation in a side panel (reply, mark solved / reopen); New ticket. |
| SET-05 | Wallet & credits (menu item) | See open decision D-01. |

---

## 6. Pages outside the menu (records, create flows, tools)

| ID | Page | Opened from |
|---|---|---|
| X-01 | `/order-detail?id=` | Orders list, customer profile, warranty card |
| X-02 | `/sales-invoice?id=` | Invoices, customer profile, Dues |
| X-03 | `/customer-crm?id=` / `?phone=` | Customers list, orders, invoices |
| X-04 | `/customer-statement?phone=` | Invoice, Dues, profile |
| X-05 | `/member-detail?phone=` | Members |
| X-06 | `/new-coupon` (`?type=auto`) | Coupons, Offers |
| X-07 | `/supplier-detail?id=` | Suppliers |
| X-08 | `/supplier-return` (`?supplier=&bill=`) | Purchases, supplier page, PO page |
| X-09 | `/buy-goods` | Purchases › New purchase |
| X-10 | `/new-po`, `/po-detail?no=` | Purchase orders |
| X-11 | `/mobile-receive` | Receive goods on a phone |
| X-12 | `/new-transfer` | Transfers |
| X-13 | `/stock-activity` | Stock |
| X-14 | `/bulk-edit` | All products |
| X-16 | `/staff-create`, `/staff-profile` | All staff |
| X-17 | `/report?id=` | Reports centre |
| X-18 | `/sales-book` | POS, Analytics |
| X-19 | `/return-history` | Orders, Return & exchange |
| X-20 | `/stock-setup` | Settings › Stock setup, edition banner |
| X-21 | `/connect?app=` | Connections |
| X-22 | `/grid-ai` | GridAI page: chat and voice over orders, stock and sales, confirm-first actions |
| X-23 | `/my-dashboard` | Person's card |
| X-24 | `/new-sale` | Redirects to the register |
| X-25 | `/pos-open`, `/pos-active`, `/pos-pay`, `/pos-keypad`, `/pos-return`, `/pos-sales`, `/pos-close`, `/pos-idle`, `/pos-offline` | POS design states (register screen switcher); the live register is `/pos` |
| X-26 | `/merchant-sign-in`, `/mobile-sign-in`, `/mobile-sign-up`, `/merchant-onboarding` | Sign-in and sign-up (system picker, demo accounts, onboarding steps) |

---

## 7. Settings (settings frame, `/set-general` and the list on its left)

The settings list (search finds sections and single settings; a setting opens its page with the field highlighted).
Every settings page has a save bar with History, conflict handling ("Keep their changes / Save mine over theirs") and
a leave-page prompt; field help hides behind "Show field tips".

| ID | Section | Page | What it holds in Retail |
|---|---|---|---|
| ST-01 | Connections | `/connections` | §5.13 |
| ST-02 | General | `/set-general` | Store identity, brand assets and colours, legal business (BIN), store location, support information, billing profile. Currency, country and timezone ask for the shop name before saving. Used by invoices and receipts. |
| ST-03 | Profile type | `/set-profile` | Switch between the team's profiles (demo). |
| ST-04 | Stock setup | `/stock-setup` | Where online orders ship from (Central Warehouse); one place or many; how the shop buys (direct, purchase orders, both); after a purchase (supplier takes back faulty items). |
| ST-05 | Preference | `/set-preference` | Identifiers, security, seller approvals, discovery. |
| ST-06 | Privacy & consent | `/set-privacy` | Marketing messages, terms & privacy, cookies: texts with versions. |
| ST-07 | Business setup | each area's page | Products & catalog (`/catalog-setup`), Customers (`/customer-settings`), Staff & HR (`/hr-setup`), Accounts (`/account-setup`), POS counters (`/pos-manage`). Online-only items (Orders, Sales channels, Auto-call, Communications) are hidden in Retail. |
| ST-09 | Payment Gateway | `/set-payments` | PAY-04 |
| ST-10 | Mail, SMS | `/connections?group=messages` | Email sending and SMS gateway providers. |
| ST-12 | Storage | `/set-storage` | Storage driver, S3-compatible credentials, test connection. |
| ST-14 | API Security, Database backup, File backup | `/set-security` | App API key (reveal, regenerate), backups (run now, history, restore). |
| ST-15 | Settings history | `/settings-history` | Every saved settings change: when, who, page, setting, old → new; filter and search. |
| ST-16 | Plan & billing, Usage & limits | `/subscription` | SET-03 |

Settings that live on their own area page: Customer settings (`/customer-settings`, incl. Credit & dues), Catalog setup,
Money setup, HR setup, POS manage › Settings, Loyalty rules, Media library.

---

## 8. Cross-cutting services

| ID | Service | Rules to test |
|---|---|---|
| S-01 | Manager PIN (`components/ManagerPin.jsx`) | Asked for: price change at POS, due over limit, return after window, stock adjustment decrease / over 20, stock count difference, drawer difference, drawer open without sale, end another device's shift, store credit correction. Wrong PIN refused; every try logged (Manager approvals report). |
| S-02 | Approvals (`approvals.js`) | Money moved / taken out, expenses, refunds and write-offs over the limit wait for a second person; no self-approval. |
| S-03 | Transaction IDs (`paymentRefs.js`) | A transaction ID / reference is accepted once across POS, returns, manual payments; reuse is refused with where it was used. |
| S-04 | Ledger (`ledger.js`) | Every place money moves posts an entry; balances = opening + entries; Money page lists them. |
| S-05 | Stock moves (`stock.js › addMove`) | Every stock change is a move with kind, place, reference, user; Stock activity lists them. |
| S-06 | Serial / IMEI register (`serials.js`) | Received → in stock → sold (sale id) → returned (back in stock); a number cannot be sold twice. |
| S-07 | Warranty (`warranty.js`, `customerWarranty.js`) | Cover starts at the sale (counter) or delivery (online), runs for the product's policy; days left; Ending soon at ≤ 30 days; service requests logged. |
| S-08 | Promotion engine (`promotions.js`) | One engine for coupons and automatic offers; POS applies; uses counted on commit; pausing stops it everywhere. |
| S-09 | Loyalty (`loyalty.js`, `storeCredit.js`) | Points earned / used on sale, levels, store credit used as payment (Alt 7), returns can be kept as credit. |
| S-10 | Credit rules (`creditRules.js`) | `checkDue`, `limitFor`, `dueDateFor`; off by default. |
| S-11 | Setup checklists (`moduleSetup.js`, `ModuleSetup.jsx`) | Shown on these Retail area pages: Orders, Products, Stock, Purchases, Payments, Customers, Offers, HR dashboard, POS manage; ticks when the step is done; folds to "Setup complete"; dismiss per page. |
| S-12 | GridAI (`/grid-ai`, Ask GridAI) | Chat (and voice) over orders, stock and sales; actions ask to confirm first. |
| S-13 | Help (`help.js`, `HelpPanel.jsx`) | Every page has help (EN + BN). |
| S-14 | Printing (`printNode.js`) | Invoices, receipts, letters, ID cards, statements, labels print one element; reports use the letterhead. |
| S-15 | Exports | CSV on lists and reports; PDF via print with letterhead. |
| S-16 | Duplicate protection | POS operation id; same order within 20 s returns the first (`duplicate: true`), never for counter sales without phone. |
| S-17 | Settings history | Every settings save is recorded. |
| S-18 | Action items (`actionItems.js`) | One to-do list feeding Home pills; snooze, dismiss. |
| S-19 | Edition banner (`StockSetupBanner.jsx`) | Moving to another edition opens Stock setup; moving to one place merges stock (`stockMerge.js`). |

---

## 9. Messages the customer, staff or owner receive

All sending is simulated by the one send layer (`messaging.js › send`): consent, suppression, caps, quiet hours and a
delivery log; about 1 in 31 sends fails on purpose so failure handling can be tested. No real SMS or email leaves the
browser.

| ID | Message | To | Channel | When | Automatic? |
|---|---|---|---|---|---|
| MSG-01 | Sale receipt (shop name, receipt no., date, total, paid / due, link) | Customer | SMS or email (staff choose) | Sale complete › Send receipt | No, staff send it |
| MSG-02 | Receipt resend | Customer | SMS or email | Order page › Send / Resend receipt | No |
| MSG-03 | Receipts in bulk | Customers with a phone | SMS | Orders › select › Send receipts | No |
| MSG-04 | Invoice / new revision | Customer | SMS (demo toast only) | Invoice › Send / Save and send again | No |
| MSG-05 | New loyalty level | Member | SMS / WhatsApp | Member moves up a level | Yes (if the message is on in Loyalty) |
| MSG-06 | Store credit added | Member | SMS / WhatsApp | Credit given with "tell the customer" | Yes |
| MSG-07 | Invite reward ready | Sharer | SMS / WhatsApp | Referral reward paid into store credit | Yes |
| MSG-08 | Points expiring | Members with expiring points | SMS / WhatsApp | `remindExpiring()` (once per member per month) | Built, but nothing calls it yet (gap G-06) |
| MSG-09 | Birthday gift | Member | SMS / WhatsApp | Template exists | No trigger yet (gap G-06) |
| MSG-10 | Scheduled report | Owner / chosen people | WhatsApp or email | Send a test now | Test only (gap G-04) |
| MSG-11 | Due reminder | Customer | Copied text to paste into SMS / WhatsApp | Dues › Remind | No, manual copy |
| MSG-12 | Lead WhatsApp / call | Lead | Opens WhatsApp / phone | Lead page | No |
| MSG-13 | Bulk customer SMS | Customers with consent | SMS | All customers › Send SMS | Hands over to Communications (gap G-03) |
| MSG-14 | Staff SMS | Staff | SMS | All staff › Send SMS | Demo toast only |
| MSG-15 | In-app notifications | Staff | Bell | Payout check, Retail notes | Yes |

Not sent in Retail: automatic order notifications (order placed, approved, shipped, delivered …) are online-only
(`notifications.js`, Settings › Order notifications is not in Retail). A counter sale does not send anything by itself.

---

## 10. Money and stock: where every action posts

| Action | Money (ledger) | Stock |
|---|---|---|
| POS sale | One entry per payment method / part into its account (cash drawer, bank, wallet, card terminal holding) | `sale` move out of the counter's place; serials sold |
| POS sale on due | Paid part posted; due goes to the invoice / Dues | Out of the place |
| Invoice payment | Into the chosen account | — |
| Return (refund) | Out of the chosen account(s), one row per part; bKash / Nagad refunds also create a refund in Payment operations | Back on sale at the place, or to Returns & damaged |
| Exchange | Difference in or out, each part with reference | Returned item in, new item out |
| Direct purchase | Payment out of the chosen account; supplier bill for the rest | `receive` moves in; buying price; expiry batches |
| Receive goods (PO) | Supplier bill | `receive` moves; damaged / wrong to holds |
| Supplier payment | Out of an account | — |
| Supplier return | Credit note lowers what is owed (credit) | `supplier return` move out; replacement later as `receive` |
| Transfer | — | Out of sender, into receiver; short lines resolved |
| Adjustment / count | — | `adjust` / `count` move after approval |
| Expense / income | Out / in of the account | — |
| Money move / add / take out | Between / into / out of accounts (approval over limit) | — |
| Payroll pay | One entry per person; loan instalments | — |
| Staff loan | Out (`staff loan`); repayment in | — |
| Cash pickup / drawer | Drawer to safe / bank | — |
| Shift close difference | Over / short posted (PIN above limit) | — |
| Referral reward in cash | Out (`referral reward`) | — |
| Platform costs | Generated monthly rows | — |

---

## 11. POS keyboard shortcuts

| While selling | | At checkout | |
|---|---|---|---|
| F2 | Search products | Enter | Take the amount and complete the sale |
| F3 | Scan or type a SKU | F4 | Complete the sale |
| + / − | Quantity of the last item (scan field empty) | Alt 1–5 | Cash, Card, bKash, Nagad, Rocket |
| Delete | Remove the last item (scan field empty) | Alt 6 | Due / credit |
| F4 | Complete order | Alt 7 | Customer wallet (members) |
| F6 | Hold sale | Alt A | Amount received |
| F7 | Held sales | Alt M | Customer mobile number |
| F8 | Recent sales and reprints | Alt S | Sold by (salesperson) |
| Alt E | Exchange or return (opens Return & exchange) | Alt D | Discount |
| F9 | Customer | Alt C | Coupon code |
| F10 | Cash drawer: pickup, cash in, paid out | Alt R | Use member points |
| Alt H | Hardware | Alt P | Print receipt on or off |
| Alt N | New sale | Alt T | Wholesale take-now (inactive while wholesale is off) |
| Alt X | Cancel sale | Enter | New sale, once the receipt shows |
| Alt Z | End shift | | |
| F1 | This list | | |
| Esc | Close a window | | |

---

## 12. What is not in Retail

Opening these addresses shows "Not in Retail".

- **Online selling**: online orders, verification, packing, courier booking and tracking, courier returns, courier
  statement, order work, order settings, order notifications, Create order (`/new-order`), abandoned-cart recovery,
  storefront, blog, flash sales page, smart offers, ads tracking, delivery and courier settings, SEO, domains.
- **Sales channels**: Meta catalog, Google Merchant, WooCommerce, Shopify sync, sync issues.
- **Communications (Connect)**: Inbox (chats, comments, mentions, tickets, calls, AI calls), Messenger chat dock,
  campaigns and messaging, GridAI knowledge and behaviour, auto-reply rules, AI usage, **Meetings** (Zoom / Google Meet),
  Wallet & credits page.
- **Automation**: automation rules, triggers.
- **Wholesale** (switched off): quotes, price lists, MOQ, wholesale customers and invoices, wholesale views and reports.

---

## 13. Simulated parts, known gaps and open decisions

### 13.1 Simulated (works in the demo, needs a server for real use)

| ID | Part |
|---|---|
| SIM-01 | All data in browser storage; nothing is shared between devices or people. |
| SIM-02 | SMS, email, WhatsApp sending (send layer with a delivery log, random failures). |
| SIM-03 | Payment gateways, card terminals, payouts, statement import (CSV only). |
| SIM-04 | Hardware: printer, scanner, drawer, scale, card terminal, attendance machines (demo state + Test). |
| SIM-05 | Google Business connection, reviews and posts. |
| SIM-06 | GridAI answers; AI writing / Fill with AI. |
| SIM-07 | Backups, storage, API keys, support tickets. |
| SIM-08 | Sign-in (system picker signs in at once; demo PIN 1234). |
| SIM-09 | The receipt link (`dazzleshop.com.bd/r/<no>`) has no page behind it. |

### 13.2 Known gaps

| ID | Gap | Suggested fix |
|---|---|---|
| G-01 | A counter sale sends nothing automatically (no receipt or order email by itself). | Optional "Send the receipt automatically when the customer has a phone / email" in POS manage › Settings. |
| G-02 | Retail has no page to see the message delivery log (it lives in Communications). Receipt sends show only on the order page. | A small "Messages sent" view in Retail (Settings or Customers). |
| G-03 | All customers › Send SMS says "handed to Communications", which is not in Retail. | Send through the send layer directly in Retail, or hide the action. |
| G-04 | Scheduled reports are saved but only "Send a test now" sends; nothing runs on time. | Needs a server scheduler. |
| G-05 | Invoice › Send only marks it sent with a toast; it does not go through the send layer. | Route it through `messaging.send` like receipts. |
| G-06 | Loyalty "Birthday gift" has a template but no trigger, and the "Points expiring" reminder (`remindExpiring`) is never called. | Add a daily run for both (needs a server for real timing). |
| G-08 | Staff "Send SMS" is a demo toast. | Route through the send layer. |
| G-09 | No warranty override at the POS (warranty always comes from the product's policy). | Optional per-line warranty change at checkout. |

### 13.3 Open decisions

| ID | Decision needed |
|---|---|
| D-01 | **Wallet & credits** belongs to the Connect module. The Settings list no longer shows it in Retail, but Subscription and Usage & limits still link to it ("Not in Retail"), and Retail does use credits (SMS receipts, loyalty SMS). Either add the page to Retail or remove those links. |
| D-02 | Should a counter sale send a receipt automatically (G-01)? |
| D-03 | Should Retail keep Google Business under Marketing (kept on purpose for now)? |
| D-04 | Payment setup in Retail: keep online gateways hidden, or show them for payment links? |
| D-05 | Online-focused roles (content, communications, ads, online sales) still appear in Retail with a small menu; keep or hide them in Retail. |

---

## 14. Developer checks

| Command | What it checks |
|---|---|
| `npm run test:nav` | Every menu (edition × plan × person × setup) resolves; 324 routes. |
| `npm run check:screens` | No screen brings back a literal the design tokens replace. |
| `npm run build` | Prerenders every route. |
| Load the page | No console errors, one `<h1>`, works at 390 px, Bangla switch, Help opens. |

Rules for new work: a new page goes into a menu area's `children` and a module in `MODULES`; add every new string to
`lib/i18n/bn.js`; read `localStorage` only after mount; use tokens, not literals; success is a toast, destructive
actions confirm.

---

## 15. Appendix: every reachable route in Retail

**Merchant (101 pages, plus 33 old addresses that forward)**
- core (14): /all-customers /connect /connections /customer-crm /customer-settings /customer-statement /grid-ai
  /help-support /merchant-overview /my-dashboard /sales-leads /subscription /tasks /team-chat
- catalog (18): /add-product /all-products /barcode-labels /brands /bulk-edit /buy-goods
  /catalog-setup /categories /customer-catalogue /expiry-disposal /purchases /stock /stock-activity /supplier-detail
  /supplier-return /suppliers /warranty-claims /warranty-policies
- places (8): /branches /new-transfer /racks /stock-adjustments /stock-count /stock-holds /transfers /warehouses
- purchasing (6): /mobile-receive /new-po /po-detail /purchase-orders /receive-goods /requests
- money (17): /account-reports /account-setup /accounts-home /chart-of-accounts /dues /expenses-bills /journals
  /liabilities /money /money-approvals /payment-ops /sales-invoice /sales-invoices /sales-profit /settlements
  /statement-match /vat
- reports (4): /daily-summary /report /reports-centre /scheduled-reports
- hr (16): /all-staff /attendance /attendance-devices /gratuity /hr-dashboard /hr-setup /id-cards /leave /loans-advances
  /pay-changes /payroll /positions /salary-statements /shifts /staff-create /staff-profile
- commerce (3): /merchant-orders /order-detail /return-history
- marketing (10): /coupons /google-business /loyalty /member-detail /members /new-coupon /product-points /promo
  /referrals /wallet
- pos (4): /new-sale /pos-manage /return-exchange /sales-book
- Old addresses that forward (no page any more): /cash-book /money-book /transactions /money-in-out /bank-accounts
  /banks /bank-deposits /mfs-accounts /mfs-providers /fund-transfers /payment-sessions /reconciliation /expenses /investment
  /owner-withdraw /liability-settlement /commissions /reports /staff-overview /staff-access /staff-attendance /staff-leave
  /staff-salary /staff-activity /staff-docs /wholesale-invoices /wholesale-invoice-edit /social-connections /add-product-tabs
  /set-chrome /set-rail /set-topbar (`next.config.mjs › MOVED`). Test that each lands on its new page.

**POS (10)**: /pos /pos-active /pos-close /pos-idle /pos-keypad /pos-offline /pos-open /pos-pay /pos-return /pos-sales

**Settings (10)**: /set-general /set-media /set-preference /set-privacy /set-profile /set-security /set-storage
/settings-history /set-payments /stock-setup

**Sign-in (4)**: /merchant-onboarding /merchant-sign-in /mobile-sign-in /mobile-sign-up

**Out of scope for Retail tests**: phone-app prototypes (44 routes: /m-*, /c-*, /onb-*, /app-system) and the
GridCommerce platform console (62 routes). They are not part of any edition's menu.
