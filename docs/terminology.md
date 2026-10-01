# GridCommerce — words we use

One word per idea, everywhere: menu, page titles, buttons, table headers, statuses, Help and reports.
The Bangla column is how a shop owner in Bangladesh says it — familiar business words stay in English
letters (Order, Stock, Invoice, Payment, Due, Courier, Supplier, Report), verbs and explanations are simple
Bangla. Money is always `৳12,500` (Latin digits, comma groups) in both languages.

The Bangla interface reads these words from `src/lib/i18n/bn.js`; add a word there when you add it here.

## Statuses (badges, tabs, filters)

| Use | Not | Bangla | Meaning |
|---|---|---|---|
| Pending | Waiting, Awaiting, On hold (for approval) | Pending | Not done yet / needs someone's action |
| Approved | Accepted, OK | Approved | A manager said yes |
| Rejected | Declined, Denied | Rejected | A manager said no |
| Paid | Settled, Cleared | Paid | Nothing left to pay |
| Unpaid | Not paid yet, Open (bill) | Unpaid | Nothing paid yet |
| Partly paid | Part paid, Partially paid, Partial | আংশিক Paid | Some paid, some still due |
| Overdue | Late (for money), Past due | Overdue | Past its due date |
| Due | Owed, Outstanding (amount) | Due | The amount still to pay |
| Draft | Unsaved, Not sent | Draft | Saved but not sent / not live |
| Active | Live, Enabled (for records) | চালু | In use |
| Paused | Disabled, Inactive (when it can be turned back on) | বন্ধ রাখা | Off for now |
| Cancelled | Voided (orders) | Cancelled | Stopped and will not happen |
| Delivered | Completed (delivery) | Delivered | Reached the customer |
| Returned | RTO (in labels) | Returned | Came back; "RTO" only in courier reports |
| On hold (stock) | Reserved, Blocked | Hold-এ | Stock kept aside for an order |
| Late (attendance only) | — | দেরি | Staff came after the grace time |

## Actions (buttons)

| Use | When | Bangla |
|---|---|---|
| Delete | Removes a record for good (asks first) | Delete |
| Remove | Takes an item out of a list, the record stays | সরান |
| Discard | Throws away unsaved changes | বাদ দিন |
| Cancel | Closes a dialog without doing anything | বাতিল |
| Cancel order | Stops an order (status Cancelled) | Order Cancel |
| Save | Keeps changes | Save |
| Add … | Creates a new record ("Add product") | … যোগ করুন |
| New … | Opens a creation flow with steps ("New order") | নতুন … |
| Edit | Opens a record to change it | Edit |
| Approve / Reject | Manager decision | Approve / Reject |
| Record payment | Money received or paid | Payment নিন / Payment দিন |
| Export CSV | Downloads the list as a spreadsheet | CSV নামান |
| Print | Paper copy | Print |
| Clear all | Removes every filter | সব মুছুন |
| More | Folded secondary actions | আরও |

## Business words

| Use | Not | Bangla |
|---|---|---|
| Stock | Inventory | Stock |
| Product | Item (in menus), SKU (as a label) | Product |
| Order | Sale (for online), Booking | Order |
| Sale | Transaction (at the counter) | Sale / বিক্রি |
| Invoice | Bill (to a customer) | Invoice |
| Bill | Invoice (from a supplier) | Bill |
| Customer | Client, Buyer | Customer |
| Wholesale customer | Dealer, B2B | Wholesale customer |
| Supplier | Vendor | Supplier |
| Purchase order | PO (in titles) | Purchase order |
| Coupon | Discount code, Promo code | Coupon |
| Offer | Promotion, Campaign (for discounts) | অফার |
| Payout | Settlement | Payout |
| Payment partners | Gateways, Holding accounts (in labels) | Payment partner |
| Bills to pay | Liabilities | যা দিতে হবে |
| Money | Accounts (as the module name) | টাকা-পয়সা |
| Cash, bank & wallets | Ledger accounts | Cash, Bank আর Wallet |
| Expense | Cost, Spend (as a record) | খরচ |
| Profit | Margin (in labels) | লাভ |
| Place | Location, Outlet | জায়গা |
| Branch | Shop, Store (a physical place) | Branch |
| Warehouse | Godown, Depot | Warehouse / গুদাম |
| Transfer | Stock move (in labels) | Transfer |
| Courier | Delivery partner | Courier |
| Cash on delivery (COD) | Collect on delivery | Cash on delivery |
| Staff | Employee (in menus), Worker | Staff |
| Seller | Sales associate, Salesperson | Seller |
| Shift | Session | Shift |
| Report | Analytics, Insight (as page names) | Report |
| Dashboard | Home overview | Dashboard |

## Words kept out of labels
Liability, Ledger, Journal, Reconcile, SLA, ROAS, Funnel, Attribution, Accrual — use plain words on screens
("Bills to pay", "Cash, bank & wallets", "Check against the bank", "Reply time", "Sales per ৳1 of ads").
The technical term may appear in Help, in a report's explanation, or in brackets after the plain word.

## Writing style
- Sentence case for titles and buttons ("Add product", not "Add Product").
- Buttons say what happens: "Save delivery", "Send to courier", not "Submit" or "OK".
- One short line under a page title; the rest goes in Help.
- Errors say what is wrong and how to fix it: "Enter the customer's phone (11 digits)".
- Empty states say why it is empty and what to do next.
- Dates "1 Oct 2026", times "4:30 PM", money "৳12,500".
