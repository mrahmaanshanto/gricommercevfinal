# Wholesale — audit report (switched off, Oct 2026)

GridCommerce has **no wholesale system for now**. Wholesale is **switched off, not deleted**: one switch,
`WHOLESALE = false` in `src/lib/edition.js`, removes the `wholesale` module and the `Wholesale` sales channel from
every edition. Everything below follows `hasModule('wholesale')` / `wholesaleOn()`, so setting the switch back to
`true` brings it all back.

Legend — **Hidden**: not shown anywhere while wholesale is off · **Kept**: shared with retail, still in use ·
**Changed**: demo data or copy adjusted · **Untouched**: no effect on what merchants see.

## 1. Editions, sign-in, plans

| Item | Status | Notes |
|---|---|---|
| Module `wholesale` in the Full, Retail and Retail + Online editions | Hidden | `edition.js › EDITIONS` (`W` / `WC` follow `WHOLESALE`) |
| Sales channel "Wholesale" (orders, sales book, profit, Home, finance reports) | Hidden | `editionChannels()` no longer has it |
| Edition "GridCommerce Retail + Wholesale" | Changed | Now **GridCommerce Retail** (id `retail-wholesale` unchanged: same site and links) |
| Edition "Retail + Wholesale + Online" | Changed | Now **Retail + Online** (id `retail-online` unchanged) |
| Sign-in "Choose your system" blurbs | Changed | "Shops, counters and stock" · "Shops and online together" (`lib/systems.js`) |
| Sign-in hero copy for Retail / Retail + Online | Changed | No wholesale wording (`MerchantSignIn.jsx`) |
| Plan Growth lists `wholesale` | Untouched | Harmless: no edition has the module (`plans.js`) |
| Platform console / core-backend boards ("Wholesale set", "Wholesale ladder") | Untouched | Static design copy in GridCommerce's own back office |

## 2. Pages and menu items

| Page / item | Status | Notes |
|---|---|---|
| Orders › Wholesale orders (`/wholesale-orders`) | Hidden | Menu item and page guard |
| Wholesale customer profile (`/wholesale-customer`) | Hidden | Customers now always open the customer profile |
| `/wholesale-invoices`, `/wholesale-invoice-edit` | Hidden | Old redirects |
| Order work › **Quotes** tab, "Quotes" in All orders › More | Hidden | Quotes were for wholesale buyers |
| All orders › "Wholesale orders" in More, "Wholesale" channel filter | Hidden | |
| **Invoices** (`/sales-invoices`) and invoice page (`/sales-invoice`) | **Kept** | Moved from the wholesale module to **Money**: retail sales on due, Dues, statements, pay links and write-offs use them |
| Invoices › "Customer type" filter, "Wholesale orders" link | Hidden | "Dues" link added |
| Customer catalogue (`/customer-catalogue`) | **Kept** | Moved to Products; its "Only wholesale customers" price mode is hidden |
| Report group "Wholesale" (5 reports) | Hidden | Already followed the module |

## 3. Products

| Field / option | Status | Notes |
|---|---|---|
| Wholesale price, MOQ, "Sell to" on Add product, All products, Bulk edit | Hidden | Follow Settings › Stock setup › wholesale (forced off without the module) |
| "Sell to: Wholesale only" option | Hidden | `products.js › SELL_TO` |
| All products CSV export columns (Sell to, Wholesale price, MOQ) | Hidden | Export has one "Price" column |
| Product import columns Wholesale price, Minimum order | Hidden | `productImport.js › IMPORT_FIELDS` |
| Add product (tabs version) wholesale fields | Hidden | `/add-product-tabs` |
| `wholesale` / `moq` data on products and stock rows | Kept (data only) | Stock value still falls back to them when no buying price is known |
| Demo products "Miniket Rice 25kg Sack" and "Clear Phone Case" (were wholesale-only) | Changed | Now have a retail price (৳3,650 / ৳250) and sell to Both |
| Settings search "Wholesale prices" | Hidden | Filed under the wholesale module |

## 4. Customers, POS, invoices

| Item | Status | Notes |
|---|---|---|
| All customers › "Wholesale customers" view, Wholesale type, tag, badge | Hidden | New companies default to Retail |
| Wholesale price list (add / edit customer, customer profile, statement) | Hidden | |
| **Credit limit** | **Kept, for every customer** | Caps what a customer may owe (retail dues) |
| Customer profile "Wholesale profile" link | Hidden | |
| New order customer type "Wholesale" | Hidden | |
| POS wholesale price lists, MOQ warnings, "Unpaid" wholesale invoice, take-goods-now | Hidden | Every buyer pays retail prices |
| POS "Due" tender, credit limit with manager PIN | **Kept** | Retail dues (to be controlled by Settings › Customers › Credit & dues) |
| Demo wholesale invoices INV-0226 … 0231 | Hidden | Retail demo invoices on due added: INV-0232 … 0234 |
| Demo wholesale returns RT-0006, RT-0007 | Hidden | |
| Leads kind "Wholesale" | Changed | Shown as "Corporate"; won leads become Retail customers |
| Settings › Payments › Wholesale payment rule | Hidden | |
| Delivery in parts, challans, stock held for an invoice | Hidden | Only drawn for wholesale invoices |

## 5. Reports and money

| Item | Status | Notes |
|---|---|---|
| Sales & profit "Wholesale" column | Hidden | |
| Sales by branch/counter, staff commission "Wholesale" columns | Hidden | |
| Reports & alerts "Wholesale" channel row | Hidden | |
| Expense / income channel "Wholesale", loyalty and promotion wholesale buckets | Untouched | Not reachable without the channel |

## 6. Copy

Help (POS, Invoices, Returns, All customers, Orders related links), the top bar's "New invoice" hint and settings
search no longer mention wholesale. Bangla strings added for the new edition names.

## To bring wholesale back
Set `WHOLESALE = true` in `src/lib/edition.js`, run `npm run test:nav` and `npm run build`. Demo wholesale invoices,
returns and lead kinds reappear on their own.
