# GridCommerce — UX audit (1 Oct 2026)

Scope: the merchant product — 190 pages in 30 modules (the platform console, phone-app mock-ups and developer
reference pages are out of scope). Every page was loaded at 375 px and 1440 px and measured (header, actions,
statistic cards, tabs, filters above the content, tables, row buttons, page height, icon-only buttons, help);
the source copy was scanned for terminology; the menu was analysed for depth and duplicates; the daily pages were
reviewed by screenshot at phone and desktop width.

## Key numbers

| Measure | Result |
|---|---|
| Pages with contextual Help | **0 of 190** |
| Pages where a wide table scrolls sideways on a phone | **93** |
| Pages where the main list starts below the first phone screen | **86** (statistic cards + filters first) |
| Pages with a row of 4+ statistic cards before the content | **45** |
| Pages not using the shared page header | **80** (each draws its own) |
| Phone page height over 6,000 px | 19 (Reports 14,078 px, Payment settings 12,191 px, Add product 8,581 px) |
| Menu | 13 groups, 69 items + 59 sub-items = **128 entries**, 6 places where several entries open the same page |
| Pages with Bangla | Shell and sign-in only |

## A. Global UX problems
1. No Help anywhere; explanation lives in long permanent descriptions under titles (20 pages over 120 characters).
2. Two header patterns: the shared `PageHeader` (110 pages) and hand-made headers in converted design screens (80).
   On phones the hand-made ones squeeze the description into a narrow column beside the buttons.
3. Statistic cards are used as decoration: 45 pages open with 4–5 big cards, several repeating the tab counts
   right below them (Invoices, Transfers, Orders).
4. Secondary actions compete with the primary one (Order detail: Auto call, Return, Print invoice, Print POS as equal
   buttons; Settlements: two primary-looking buttons).
5. Status words differ for the same meaning (see F).
6. The Home dashboard is a static design: fixed date (29 Sep), sample rows, six large "quick action" tiles before
   any number, no money-to-collect or incoming-stock view.

## B. Mobile problems
1. Desktop tables forced onto phones (93 pages) — horizontal scrolling for simple lists (orders, products, stock,
   customers, invoices, purchase orders, transfers, staff).
2. Statistic cards stack one per row, pushing the list 700–3,800 px down (Accounts overview 3,792 px, Stock
   adjustments 1,893 px, All products 1,181 px).
3. Filters shown in full above the list (Orders 4, Products 5, Stock adjustments 6, Tasks 6 controls).
4. Header actions wrap into 2–3 rows; no "More" menu.
5. Long forms in one column without sticky save (Add product 8,581 px, New flash sale 6,564 px).

## C. Navigation problems
1. 128 menu entries in 13 groups; "General" alone has 10 items with 3 drill-downs (Orders, Sales, Products, POS).
2. Duplicates: Stock list = "Inventory" = "Low stock"; "Barcodes" (Products) = "Barcode labels" (Stock);
   "Collections" = "Categories"; Storefront "Landing pages" = "Theme" = "Navigation"; "New sale" = "Open register".
3. Vague / misplaced groups: "Management" holds Inbox, Calls, Tickets, Storefront, Blog and Settings; "AI calls"
   sits in Communication while "Calls" is in Management; two different pages are both called "Connections".
4. Settings › "All settings at a glance" opens a developer storyboard.
5. Reports group repeats the same page 10 times (one per report group).

## D. Duplicate / unnecessary pages
| Page(s) | Finding | Action |
|---|---|---|
| `/cash-book`, `/money-in-out`, `/fund-transfers`, `/transactions`, `/bank-accounts`, `/mfs-accounts`, `/bank-deposits` | Old Accounts pages, already redirected to Money | Keep redirects; remove from audit lists |
| `/staff-overview`, `/staff-access`, … `/staff-docs` | Design fragments, now tabs of the staff profile | Already redirected |
| `/add-product-tabs` | Second design of Add product | Keep only `/add-product` in the product; dev only |
| `/pos-idle`, `/pos-active`, `/pos-pay` … | POS design states | Storyboard only (hidden in production) |
| `/dev/storyboards/settings-console` | Linked from the real menu | Remove from menu |
| `/collections` vs `/categories`, Storefront theme / navigation | Same page under several names | One menu entry each |

## E. Pages that should be combined (without losing anything)
| Flow today | Proposal |
|---|---|
| Orders: All / Online / Retail (3 menu items, one page) | One "Orders" entry; channel is a filter on the page |
| Stock list, Low stock, Inventory (3 entries, one page) | One "Stock" entry; "Low stock" is a saved filter |
| POS: Open register, Counters, Employees & shifts, Cash pickups, POS settings | "POS" (register) + "POS manage" with its tabs |
| Promo: Offers & promo, Discount codes, Flash sales, Offers page + Loyalty (5) + Recovery (2) | One "Marketing" group |
| Inbox, Calls, AI calls, Support tickets (two groups) | One "Customer support" group |
| Storefront, Blog, Settings, Automation, Subscription | "Online store & settings" group |
| Reports: 10 group links | One "Reports" entry (groups are chips on the page) + Daily summary |

## F. Terminology problems (counts in the visible copy)
| Concept | Words in use today | Standard |
|---|---|---|
| Not done yet | Waiting 54, Pending 23, On hold 8, Awaiting 2, Processing 3 | **Pending** (status); "Waiting for approval" only where an approval is meant |
| Money not paid | Due 87, Unpaid 28, Owed 14, Outstanding 4 | **Due** (amount), **Unpaid** (status) |
| Part payment | Part paid, Partially paid, Partial | **Partly paid** |
| Late | Late 2d, Overdue 6 days | **Overdue** |
| Remove a record | Delete 77, Remove 95, Discard 21 | **Delete** for records, **Remove** from a list, **Discard** only for unsaved changes |
| Stock | Stock 218, Inventory 35 | **Stock** |
| Discount code | Coupon 36, Discount code (menu) | **Coupon** |
| Payment partner money | Settlement 66, Payout 16, Holding 36, Partner 101 | **Payout** (money a partner pays you); "Payment partners" |
| Staff who sell | Seller 16, Sales associate 10, Sales staff 8, Salesperson 2 | **Seller** (role), designation stays HR's |
| Jargon to avoid in labels | Liability 117, SLA 101, Ledger 43, Journal 44, Reconcile 21, ROAS 14, Funnel 11, Attribution 11 | Plain words in labels; the term only in Help / reports |

The full dictionary (English + Bangla) is `docs/terminology.md`, used by `src/lib/i18n` for the Bangla interface.

## G. Bangla localization strategy
- One language switch (account menu, sign-in, Help panel). Changing language never changes data or numbers.
- Bangla is written the way shop owners talk: familiar business words stay in English letters where that is what
  people say (Order, Stock, POS, Invoice, Payment, Due, Courier, Supplier, Report, Dashboard); verbs and
  explanations in simple Bangla ("Order দিন", "Payment নিন", "Stock দেখুন").
- Short labels; no textbook or government Bangla.
- Money stays `৳12,500` with Latin digits for fast scanning; dates "1 Oct" stay as they are.
- Implementation: a shared dictionary applied to the whole interface (menu, headers, buttons, labels, table
  headers, statuses, empty states, help), so every page is covered without rewriting 190 screens. Long free text
  that is not in the dictionary stays English until it is added.

## H. Dashboard problems
- Static numbers and fixed date; does not read the shop's real data.
- Starts with quick-action tiles instead of what needs attention.
- Missing: money to collect (COD with couriers, wholesale dues, payouts arriving), incoming stock, transfers.
- "Orders to confirm" lists wholesale invoices; the order pipeline is separate from the attention list.
- New design: Today at a glance → Needs your attention → Orders → Money to collect → Stock → 7-day trend →
  Recent activity, with Customize (show / hide sections). Deep analysis stays in Reports.

## I. Module-specific problems and changes

| Module | Existing problems | Recommended changes |
|---|---|---|
| Home | Static, decorative tiles, no money / stock view | Rebuilt as the morning briefing (H) |
| Orders | 4 KPI + tabs repeat the same counts; filters above list; wide table on phone | Counts only in tabs; filter sheet on phone; order cards on phone |
| Order detail | 4 equal action buttons | Primary action + More |
| Sales / Invoices | KPI cards repeat tab counts | Tabs carry the counts; cards on phone |
| POS | Works well; 5 menu entries | One menu entry + POS manage |
| Products | Big stat cards; description squeezed on phone; Add product 8,581 px | Compact stats strip; stacked header; sticky Save |
| Stock | 5 stat cards before the list; same page under 3 names | Stats strip; one menu entry |
| Purchase | Hub page with 4 large tiles before the PO list | Tiles become a compact strip |
| Customers | Header squeezed; wide table | Stacked header; cards on phone |
| Accounts | Overview 3,792 px on phone; many cards | Stats strip; cards on phone |
| Reports | 14,078 px page; 10 menu links | One menu entry; groups as chips |
| Staff & HR | Good structure; wide registers (correct to scroll) | Keep registers scrolling; lists as cards |
| Marketing (Promo, Loyalty, Recovery, Social, Tracking) | 5 groups | One group |
| Support (Inbox, Calls, AI calls, Tickets) | 2 groups | One group |
| Settings | Storyboard in menu; Payment settings 12,191 px | Remove storyboard link; sections collapse |
| Team (dashboards, tasks, chat, leads) | New, consistent | Help + Bangla |

## J. Design system adjustments
1. **Help** — one shared Help button in the top bar of every page, opening a side panel: What is this page, How to
   use it, Good to know, Video tutorial (placeholder), Related pages. Content in `src/lib/help.js`.
2. **Page header** — title, one short line of context (long text moves into Help), one primary action; other
   actions collapse into "More" on phones; the header stacks on phones.
3. **Statistic strip** — on phones, statistic cards become a compact, swipeable strip (one row) instead of a stack.
4. **Tables** — on phones, lists become cards automatically (label : value rows, actions at the bottom);
   registers and comparison tables keep horizontal scrolling (`gc-table--keep`).
5. **Filters** — shared `FilterBar`: search + key filters inline on desktop, "Filter (n)" bottom sheet on phones,
   active filters as removable chips with "Clear all".
6. **Statuses** — one list of status words and colours (`src/lib/statusWords.js`), used by badges.
7. **Spacing** — content padding 24 → 16 px on phones, section gap 20 → 16 px; tighter card padding on phones.
8. **Language** — dictionary-driven Bangla (`src/lib/i18n`), switch in the account menu, sign-in and Help.

## Business logic
No change to orders, stock, prices, money, payroll or purchase logic is needed for any of the above.
