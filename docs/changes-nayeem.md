# Changes made on Nayeem's copy

Starting point: Mostafiz vai's handover of 12 Oct 2026, kept unchanged on branch `handover/mostafiz-2026-10-12`.

**Our preview site:** https://gridcommerce-studio.netlify.app (start at `/merchant-sign-in`). Each work branch also gets
its own preview link.

**For us — see every difference at once (GitHub, private):**
https://github.com/nayeem-hello/GridCommerce/compare/handover/mostafiz-2026-10-12...main

**For Mostafiz vai:** he does not get repo access. He receives a handover package as local files (see "Handing work to
Mostafiz vai" in `CLAUDE.md`) and gives it to his own Claude, which reads `README-for-Claude.md` inside it and applies
the changes to his copy.

Newest first. One entry per change: date · branch · what and why · files · how to see it.

---

## 2026-10-14 · nayeem/phase1-must-fix · Phase 1: all 74 must-fix items (includes B1)
- Plain-language record with Before/Now screenshots: `docs/records/phase1/` (PDF via `tools/records/build-pdf.cjs`). Replaces the B1 record.
- Preview: https://nayeem-phase1-must-fix--gridcommerce-studio.netlify.app
- Wholesale: built behind the switch; `WHOLESALE` now reads `NEXT_PUBLIC_WHOLESALE=true` (off by default).
- **Online selling**: ON-U1 Delivered online orders can be returned; ON-U2 Landing pages: a real list and builder (partly); ON-U3 Checkout now places a real order; ON-U4 Offers page shows the shop's real offers; ON-U5 Save as draft keeps a real draft; ON-U6 Block customer now really blocks; ON-F1 Store pages: About, Contact, policies; ON-F2 Header and footer menus; ON-F3 Product reviews: check, publish and reply; ON-F4 All orders: filter by date and sort; ON-F5 Confirm queue for cash-on-delivery orders; ON-F6 Delivery issues queue to save parcels
- **Products & stock**: PR-U1 Product list shows the real stock; PR-F1 Online shops can adjust and count stock; PR-U2 Product bulk actions really change products; PR-U3 Stock history shows only real moves; PR-U4 Add product: plain words, no jargon; PR-F4 Approve or reject purchase orders; PR-U5 Opening stock for every place and variant; PR-F5 Edit, cancel, close and send purchase orders; PR-F6 Print barcode labels for any product; PR-F7 Categories save and reach the product form; PR-F2 Low-stock level per product and per place; PR-F3 Scan IMEIs and batches when goods arrive
- **Retail & POS**: RT-U1 Retail demo sells every day up to today; RT-U2 Sales book shows the real counter sales; RT-U3 One sale, one number everywhere; RT-U4 Counter sale order shows each discount and VAT; RT-U5 Drawer counts refunds when they happen; RT-U6 Repairs sell by quantity, not by weight; RT-U7 Pick the IMEI of the phone that came back; RT-F1 Automatic offers work at the counter; RT-F2 Prices include VAT (MRP), VAT by real category
- **Wholesale (switch stays off)**: WH-U1 One wholesale price everywhere; WH-U2 Quotes have their own page; WH-U3 Converting a quote runs the POS checks; WH-U4 Quote items use the buyer’s prices and MOQ; WH-U5 Customer catalogue shows real products; WH-U6 Wholesale fields follow the system you preview; WH-F1 Price lists for dealers, shops and companies; WH-F2 Take wholesale orders at the office desk; WH-F3 Sell by carton at the register; WH-F4 Quotes for companies and leads; WH-F5 Send documents on WhatsApp and as PDF; WH-F6 Payment terms per buyer; WH-F7 Collections and money receipts; WH-F8 Hold buyers with overdue invoices; WH-F9 IMEI and serial numbers on wholesale deliveries
- **Customers & marketing**: CX-U1 Workflow builder opens, edits and saves real rules; CX-U2 Inbox Profile opens the right customer; CX-U3 Customers › More filters now filter the list; CX-U4 Customer coupons, points, credit, Call and Print work; CX-F1 Import customers from CSV or Excel; CX-F2 WhatsApp order messages next to SMS and email
- **Money, team & settings**: MS-F1 Search box finds orders, customers, products and more; MS-U1 Server settings removed; simple backup status added; MS-U2 Seller settings removed from Preference; MS-U3 Demo dates now follow today; MS-U4 Gateways and AI set up in one place; MS-F5 Sign-up keeps your shop's answers (partly); MS-F2 Users & roles: invite staff, custom roles (partly); MS-F3 My account: profile, password, two-step sign-in; MS-F4 Forgot password and Google sign-in work (demo); MS-F6 Import data from another system (partly)
- **Super admin**: SA-U1 Packages now match what we sell; SA-F2 Store actions follow each person's rights; SA-U2 Yearly plans billed the full year; SA-F1 Support access to a store, owner approved (partly)
- **Phone app**: AP-U1 Home shows each person their own sales; AP-U2 A way back to the app from web pages; AP-F1 Create a shop on the phone (partly); AP-F2 App sign-in and sign-out; AP-F3 Alerts for new orders, chats and payments; AP-F4 Edit orders and check payments on the phone

## 2026-10-14 · nayeem/b1-honest-demo · Batch B1 "Make the demo honest" (13 review items)
- Record with before/after screenshots: `docs/records/b1/` (PDF built with `tools/records/build-pdf.cjs`).
- Preview: https://nayeem-b1-honest-demo--gridcommerce-studio.netlify.app
- **CX-U2** (fix): Inbox: 'Profile' now opens the real customer page. Files: `src/components/inbox/CustomerPanel.jsx`
- **CX-U4** (fix): Customers: coupons, points, store credit, Call and Print now really happen. Files: `src/screens/customers-crm/AllCustomers.jsx`, `src/screens/customers-crm/CustomerCRM.jsx`, `src/screens/customers-crm/AssignCoupon.jsx (new)`, `src/lib/personalCoupons.js (new)`, `src/lib/promotions.js (one-customer check also accepts the customer's phone)`, `src/lib/i18n/bn.js`
- **MS-F4** (new): Sign-in: 'Forgot password?' and 'Continue with Google' now work (demo). Files: `src/screens/merchant-signin/MerchantSignIn.jsx`
- **MS-U1** (fix): Settings: server and hosting internals removed; a simple Backups & data status instead. Files: `src/screens/settings-console/SetSecurity.jsx (rewritten)`, `src/screens/settings-console/SetRail.jsx`, `src/screens/settings-console/SetStorage.jsx (deleted)`, `src/screens/settings-console/SetAi.jsx (deleted)`, `src/screens/settings-console/SetUsage.jsx (deleted)`, `src/app/(settings)/set-storage, set-ai, set-usage (deleted)`, `src/app/(settings)/set-security/page.jsx`, `src/screens/settings-console/SettingsConsole.jsx`, `src/screens/registry.js`, `src/shell/Shell.jsx`, `src/lib/settingsRegistry.js`, `src/lib/settingsHistory.js`, `src/lib/connections.js`, `src/lib/edition.js`, `src/lib/help.js`, `src/lib/i18n/bn.js`, `src/screens/core-backend/CoreUIPlan.jsx`, `next.config.mjs`
- **MS-U2** (fix): Preference: marketplace seller settings removed. Files: `src/screens/settings-console/SetPreference.jsx`, `src/lib/settingsRegistry.js`
- **MS-U3** (fix): Demo dates follow today: attendance, bills, renewal, trials, VAT, leads, tasks. Files: `src/lib/demoClock.js (new)`, `src/components/DemoClockReady.jsx (new)`, `src/app/layout.jsx`, `src/lib/hr.js`, `src/lib/liabilities.js`, `src/lib/leads.js`, `src/lib/tasks.js`, `src/lib/approvals.js`, `src/screens/billing/Subscription.jsx`, `src/screens/accounts/Vat.jsx`, `src/lib/i18n/bn.js`
- **MS-U4** (fix): One place per setup: Add gateway opens the shared gateway setup; AI is set up only in Grid AI. Files: `src/screens/settings-console/SetPayments.jsx`, `src/screens/settings-console/SetRail.jsx`, `src/screens/settings-console/SetRules.jsx (deleted)`, `src/app/(settings)/set-rules (deleted)`, `src/lib/settingsRegistry.js`, `src/lib/connections.js`, `src/lib/help.js`, `src/lib/edition.js`, `next.config.mjs`
- **ON-U5** (fix): Create order: 'Save as draft' now saves a real draft. Files: `src/lib/orderDrafts.js (new)`, `src/screens/merchant-orders/NewOrder.jsx`, `src/screens/merchant-orders/MerchantOrders.jsx`, `src/lib/i18n/bn.js`
- **ON-U6** (fix): Order page: 'Block customer' now really blocks the customer. Files: `src/screens/order-detail/OrderDetail.jsx`, `src/lib/i18n/bn.js`
- **PR-U2** (fix): All products: bulk Change category, Archive and Delete now really change the products; tab counts are real. Files: `src/screens/products/AllProducts.jsx`, `src/lib/i18n/bn.js (new Bangla strings and patterns)`
- **PR-U3** (fix): Stock list: a product's stock history shows only its real stock moves. Files: `src/screens/purchase-stock/Stock.jsx`, `src/lib/i18n/bn.js (new Bangla strings)`
- **PR-U4** (fix): Add product: plain shop words instead of brief jargon. Files: `src/screens/products/AddProduct.jsx`, `src/lib/i18n/bn.js (Bangla for the new wording; old entries replaced)`
- **RT-U1** (fix): Retail demo keeps selling after September: daily counter sales up to today. Files: `src/lib/liveCounterSales.js (new)`, `src/lib/orders.js`, `src/lib/salesBook.js`, `src/lib/ledger.js`, `src/lib/customerWarranty.js`, `src/screens/sales/ReturnExchange.jsx`

## 2026-10-13 · main · Working rules for this copy
- What: added a rules section to `CLAUDE.md` (separation, branches, scope, deploys, handover) and created this log.
- Why: the handover's `CLAUDE.md` only pointed to `AGENTS.md`; our copy needs its own rules so no session deploys to
  the live sites or edits the frozen handover branch.
- Files: `CLAUDE.md` (edited), `docs/changes-nayeem.md` (new).
- See it: no change in the app.
