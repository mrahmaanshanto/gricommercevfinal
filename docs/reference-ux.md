# Reference UX: how each page behaves

Source: Nayeem's UI/UX reference app (`grid-commerce-uiux-reference-jbgu2npaj-space4next.vercel.app`, Vercel login
required), read page by page on 2 Oct 2026. This file records what each page does, so our build can follow the same
UX. Section 6 says what our build does with it.

## 1. The rule: one area, many views, no page explosion

- The sidebar lists **business areas**, not pages. Its order is Home · Orders · Products · Inventory · Purchasing ·
  Payments · Customers · Communications · Finances · Analytics · Marketing · Online Store · POS · Staff & HR · Settings.
- An area keeps its tools as **views of one page**. Three ways of switching appear, all without opening a new page:
  - **Sidebar sub-items that swap the view in place.** The address does not change.
    - Products: All products · Categories · Catalog setup.
    - Inventory: Stock · Stock activity · Stock counts · Damage & loss · Transfers · Expiry & disposal · Locations ·
      Barcode labels.
    - Purchasing: Purchases · Suppliers & dues · Staff requests · Receive goods.
  - **Page tabs under the title.**
    - Finance: Overview · Money accounts · Cash & expenses · Transfers · Receivables · Closing & reconciliation. Each
      tab is a sub-address (`/finances/accounts`).
    - Payments: Transactions · Refunds · Settlements & reconciliation.
    - Payments setup: Integrated gateways · Manual payment methods · Retail accounts & terminals.
    - Customer profile: Overview · Orders & Commerce · Insights · Activity & Communication · Details & Addresses ·
      Controls.
  - **Status tabs with counts that filter one list.**
    - Orders: All · Needs action · Confirmation · Processing · Ready to dispatch · In transit · Delivered · Exceptions.
    - Products: All · Active · Draft · Missing information · Archived.
    - Customers: All · New · Repeat · High value · Lapsed · Companies · Possible duplicates · Needs data cleanup ·
      Restrictions.
- Only two kinds of screen get their own address:
  - **A record**, such as `/orders/ORD-2026-18422` or `/customers/C-10482`. It opens with a breadcrumb back to the list.
  - **A create flow**, such as `/orders/new`.
  - The product editor is an exception: it opens in place on `/products`, with a ‹ back arrow.
- "Create" is a button on the view that owns it (+ New order, + Add product, + New purchase, + Create offer). It is
  never a menu item.
- Not built in the reference:
  - Home, Communications, Analytics, Online Store, Staff & HR and Settings are dead buttons in the sidebar.
  - `/legacy` shows "could not start".
  - The menu differs a little from page to page. For example, Products › Inventory is a third level on `/inventory`
    but a link on `/products`. The rule above is what all pages share.

## 2. Anatomy of a list view

Every list view is built the same way, top to bottom:

1. **Title** (one per view) and **one line of purpose** under it.
2. **Actions on the right:** secondary buttons, plus one solid primary button. Examples: Export · + New order;
   Import · Export · + Add product; Count stock · Transfer · Adjust stock.
3. **A strip of 4 key figures.** Each figure has a value and a one-line meaning, for example:
   - "Awaiting action 4 · Confirmation, payment or dispatch attention";
   - "Customer COD to collect ৳121,249 · not merchant cash".
   Some views add a second row of 5 small counters (Inventory: On hand · Available · Committed · Unavailable ·
   Incoming).
4. **Status tabs with counts.** Some views also have a view picker on the right (Products: Default view · Channel
   readiness · Needs product data · Wholesale catalogue).
5. **A toolbar:**
   - search with a ⌕ prefix and a specific placeholder ("Search order, customer, phone, item or consignment…");
   - dropdown filters ("All sources · All payments · All couriers · All areas");
   - **Saved views ▾**, a list of named filters (On hold / Verify payment · Pick today · POS sales · Online orders);
   - **Columns**, a checkbox list for showing and hiding columns.
6. **The table:**
   - checkbox column;
   - the record's ID in data type with a small meta line ("30 Sep · 6:42 PM · WhatsApp");
   - status chips;
   - a last column with **one next-step button per row**, worded by state: Confirm · Review payment · Start
     fulfilment · Send to courier · Track · Open · Receive · Approve · Review bill · Pay;
   - a ••• menu.
7. **A footer line:** the row count ("4 orders in this view"), and sometimes one plain sentence on which area owns
   what ("Receiving, Billing and Payment remain independent").

## 3. Anatomy of a record

Order `/orders/ORD-…` and customer `/customers/C-…` follow the same layout.

- **Breadcrumb:** Orders / ORD-2026-18422.
- **Title** with a status chip. A meta line under it: time · source · version, or ID · phone · verified · since ·
  owner.
- **Independent state chips:** Confirmation Waiting · Payment Part paid · Fulfilment Unfulfilled · Delivery Not booked.
- **Actions on the right:** Documents ▾ · Auto call · More · and one primary button that is the next step (Confirm
  customer).
- **A stepper:** Order received → Gates → Fulfilment → Delivery.
- **Main column, cards in the order work happens:**
  - Order items: frozen at the time of sale; each line shows list price, change and final price; "Edit unfulfilled
    lines".
  - Payment: total · verified paid · balance · collection mode, plus Record / verify · Send payment link · Request
    advance.
  - Fulfilment: reserved · fulfilled · outstanding · source; serial and quantity per line; Start fulfilment · Print
    pick list.
  - Delivery: charge, courier, consignment, address and instruction; Send to courier · Sync tracking · Delivery
    exception.
  - Documents: invoice, thermal receipt, packing slip, pick list, challan and courier label, each with a state.
  - Activity: who did what, when.
- **Side column:**
  - Customer, with Call · WhatsApp · SMS · Open CRM.
  - Customer history & checks: orders, courier history, duplicate check, due; "Why these signals?".
  - Notes: customer note, courier instruction, internal note.
  - Attribution (role-gated).
  - Tags & tasks.
- **Customer profile:** 4 key figures, then the six tabs listed in section 1.

## 4. Create flows

- **New order** (`/orders/new`, breadcrumb Orders / New order). Buttons: Hold · Cancel · Create order. Layout:
  - A choice at the top: Assisted sale (phone / social / staff) or Quote / Sales Order (dealer / B2B).
  - Left column:
    - Customer: phone-first lookup with an order-history summary.
    - Products: search or scan, quick chips, a branch picker, and cards showing price · available.
    - Customer & fulfilment: source, delivery area, fulfil from, delivery charge rule with Override, notes.
  - Right column:
    - Order: lines with qty ± and Adjust price; list subtotal · manual line adjustments · order discount · delivery ·
      total.
    - Payment: advance and balance; Add payment · Send payment link · Request advance.
    - Checks: duplicate, merchant history, courier history and stock. The checks advise; they never block.
- **Product editor** (in place). Buttons: ‹ · Preview · Duplicate · Save.
  - Main column:
    - title and short description;
    - long description in a visual editor with an HTML switch;
    - media;
    - classification: main category, subcategories, template;
    - specifications, in groups you can reorder;
    - pricing, with margin, last purchase cost and current stock cost read-only;
    - product model: format · selling mode · sellability (Normal · Preorder · Backorder · Gift-only · Catalogue-only ·
      Made-to-order);
    - variants: options, a combinations table and read-only stock;
    - inventory policy, shipping, SEO preview and relationships.
  - Side column: Status (Active · Draft · Archived) · Publishing per channel · Organization · Product data · Google
    listing readiness · Warranty · Activity & governance.

## 5. Page by page

| Area › view | Title · purpose | Figures | Tabs / filters | Main actions |
|---|---|---|---|---|
| Orders | Sales & Orders: all sales from one queue | Awaiting action · With courier · Delivery success · Customer COD to collect | 8 status tabs; source, payment, courier and area filters; Saved views; Columns | Export · + New order; a next step per row |
| Products › All products | Products: catalogue, data and publishing readiness | Total · Active · Draft · Missing information · Archived | 5 status tabs + view picker; Filters; Columns | Import · Export · + Add product; banner "Recover unsaved product work?" |
| Products › Categories | Categories: taxonomy, defaults, inheritance | — | Table: template, tax class, warranty, storefront, SEO | Import taxonomy · + Add category |
| Products › Catalog setup | Catalog setup: low-frequency configuration | — | 9 cards: templates, specification library, brands, attributes, units, identifier types, size charts, warranty policies, data fields | Open a card |
| Inventory › Stock | Inventory: what you own, can sell and is moving | Stock value · Replenishment risk · In transit · Expiry risk, + 5 counters | All inventory · Low stock · Replenishment · Ageing / dead stock · Expiry risk · Serial / IMEI; location and state filters | Count stock · Transfer · Adjust stock |
| Inventory › Stock activity | Stock activity: every movement | Movements · Adjustment value · Awaiting approval · Referenced | All · Adjustments · Reservations · Transfers · Counts · Damage / holds · Serial / batch | Export ledger · New adjustment |
| Inventory › Stock counts | Stock counts | — | A form: Quick · Blind · Cycle · Full count; location, scope, variance policy | Start count |
| Inventory › Damage & loss | Damage & loss | — | Form: reason · product · location · qty · disposition · evidence, with a live "inventory effect" sentence | Review & submit |
| Inventory › Transfers | Transfers: through In Transit custody | In transit units · Discrepancies · Value · Ready | All · Ready · In Transit · Partially Received · Received | + New transfer; Receive / View per row |
| Inventory › Expiry & disposal | Expiry & disposal: batches, FEFO | Near-expiry · Blocked · Cost at risk · FEFO | Intervention · Expired / blocked · Disposal · All | Keep selling · Discount · Move · Supplier return |
| Inventory › Locations | Locations: one engine for warehouses and branches | — | List + detail panel: capabilities, pick strategy, count frequency, negative stock, receiving state | + Add location · Archive · Edit |
| Inventory › Barcode labels | Barcode labels | — | Source, content, layout and live preview | Printer setup · Print / export PDF |
| Purchasing › Purchases | Purchases: what needs buying, receiving, checking or paying | Supplier payable · Overdue · Open POs · Incoming value, + 4 counters | Needs action · All purchases · Receiving · Bill mismatch · Payment due · Quick purchases | Receive goods · + New purchase |
| Purchasing › Suppliers & dues | Suppliers & dues | Total due · Overdue · Advances · Bill mismatches | Suppliers · Bills to pay · Payments made · Returns | + Add supplier · Pay supplier |
| Purchasing › Staff requests | Staff requests: internal stock first | — | Request cards: transfer / split / purchase / reject | Start buying run |
| Purchasing › Receive goods | Receive goods: scanner-first | — | PO picker, lines with received / bonus / condition, evidence | Scan · Save draft · Post receipt |
| Payments | Payments: customer payments, refunds, settlements | 6 figures | Transactions · Refunds · Settlements & reconciliation; method, source and status filters | Export · Payments setup |
| Customers | Customers: one list across online, POS, social and B2B | Total · Repeat rate · Avg lifetime value · Possible duplicates | 9 tabs; Segments · Filters · Columns | Import / Export · Custom fields · Add customer ▾ |
| Finances | Finance: what you can use now, what is coming, what needs attention | Money you control · Waiting to arrive · Customers owe · Needs attention | 6 page tabs; an assistant panel on the right | Export · Reconcile · + Record money ▾ |
| Marketing | Overview · Offers & promotions · Coupons · Flash sales · Loyalty program · Members · Referrals · Store credit | Active offers · Scheduled · Members · Pending rewards | "What do you want to run?" cards, current offers, needs attention | View promotions · + Create offer |
| POS | The register, full screen | — | Category chips, product cards with stock here and elsewhere | Held / recent · Return · Hardware · Pay |

## 6. What our build does with it

We take the reference's navigation and Shopify's page layout. The look stays ours: our font, colours and shadows.

- **The sidebar shows areas only:**
  - Commerce group, in the reference order: Home · Orders · Products · Inventory · Purchasing · Payments · Customers ·
    Communications · Finances · Analytics · Marketing · Online Store · Sales channels · POS.
  - Team & settings group: Staff & HR · Team · Settings.
  - The open area lists its pages under it, as Shopify's admin does: Orders › Drafts, Abandoned checkouts.
  - Tapping an area opens its first page that the role can open.
  - The pages are the area's `children` in `src/shell/navigation.js`.
  - The role, edition and stock setup filters apply.
  - Create pages are `hidden`. They are reached from their button and light up their parent page, the way Add product
    lights All products.
- **Inside a page, views are tabs in the list card**, as in Shopify's index tables: All · On hold · Processing …
- **No tab strip under the top bar.** A short trial with one was dropped for Shopify's pattern.
- Records, such as an order or a staff profile, and create flows keep their own address.
- **Moves that follow the reference and brief #21:**
  - Inventory and Purchasing leave "Products & stock".
  - Warranty policies go to Products.
  - Warranty claims go to Orders, which owns after-sales.
  - Payouts become their own Payments area.
  - Money becomes Finances.
  - Reports and Ads tracking become Analytics.
  - Customer support and Automation become Communications.
  - The blog and the website offers page join Online Store.

## 7. Page layout: Shopify's admin

Approved on 3 Oct 2026. The rules, the kit and the reference pages are in `docs/shopify-style.md`:
- a one-line title row;
- one strip of key figures;
- one card holding the view tabs, search and filters, the bulk bar, a compact table and the pager;
- records with work on the left and facts on the right.

A list shows the main thing; the rest is on the record.
