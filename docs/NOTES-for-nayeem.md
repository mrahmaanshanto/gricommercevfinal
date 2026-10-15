# Notes for Nayeem (from Mostafiz's side) · 14 Oct 2026

What came back from your 14 Oct work package: Stage 1 (your 74 fixes), Stage 2 (Modules A, B, C, D), Stage 3 (all 56
starred items and the 7 loose ends) and what Mostafiz vai asked for along the way (Inbox email, Hosting, logos, a calmer
top bar). The change-record PDF has a page per change with Before / Now pictures; this file is the short version plus
what is partly done, the decisions for you, and what changed in your 74 fixes.

**In short**
- 107 change records: Module A 8, Module B 6, Module C 9, Module D 6, Stage 3 57 (incl. one extra), loose ends 7,
  asked along the way 14. Partly done: 6 (listed below), each with why.
- Checks on the final copy: `npm run build`, `npx tsc --noEmit`, `npm run check:screens`, `npm run test:nav`
  (450 menus, 448 routes) pass; every new page loaded at 1440 and 390 px with no errors and no sideways overflow.
- Branch on this side: `module-a-stage3` (on top of `nayeem-update-2026-10-14`, which holds Stage 1 + Modules B, C, D,
  pushed to GitHub as commit 5f87136). Preview: https://gridc-backend.netlify.app has 5f87136; Module A, Stage 3 and
  Hosting are in this zip and not deployed yet.
- Front end only, like the rest: every place a server is needed says so in a code comment (and in the PDF's small print).

## Stage 1 · 74 fixes applied (14 Oct 2026)

- Branch `nayeem-update-2026-10-14`, from `claude/super-admin` at 9cbb39b (includes the mobile app and super admin work
  done after your 12 Oct handover).
- `git apply --3way changes.patch`: no conflicts. The 8 paths in deleted.txt are gone; their addresses redirect.
- Build, `npx tsc --noEmit`, check:screens and test:nav (450 menus, 405 routes) pass.
- All 9 spot-checks pass in the browser (wholesale checked on a local run with `NEXT_PUBLIC_WHOLESALE=true`).
- New pages checked at 390 px: no sideways overflow, one h1 each.

### Changed in your 74 fixes

- **Orders › Sort said "not available in the demo yet".** The sort icon wraps a hidden select; the shared "control with
  no handler" check (`components/ui/index.jsx › Overlays`) gave the icon a button role and answered the click with that
  toast. Now a click on a select, input or text box is left alone, and a box that wraps one is not made a button.
  The sort itself already worked.

- **CLAUDE.md**: your patch replaced ours with your working rules. Ours is back to `@AGENTS.md`; your rules are kept word
  for word in `docs/nayeem-working-rules.md` (their change-record format is the one used for what comes back to you).

## Stage 2 · Module C · SEO controls (14 Oct 2026)

Done: one SEO panel in all five editors (pages, posts, products, categories, landing pages) with the nine controls;
automatic schema with the shop's own replacing the same type; customer pages for posts, products, categories and landing
pages (store pages already had one) that write the head tags once each; Online Store › SEO (Health with Fix, Redirects
made automatically on address changes, Not found, Sitemap, robots.txt, Settings) and the bulk editor. Change records:
`docs/records/mostafiz-2026-10-14/record.json`.

Partly done (needs the server):
- Head tags are added after the page loads, so they show in the inspector, not in "View page source". The live server
  must write them into the HTML.
- Redirects are followed by the demo's customer pages; the live server must answer with a real 301 / 302.
- The Not found log has demo rows; the live server fills it from its visits. Sitemap and robots.txt are shown here; the
  server must serve /sitemap.xml and /robots.txt.

Decisions for you:
- Customer pages for products and categories are plain on purpose; Module A (storefront builder) should draw them with
  the theme, keeping `storeChrome.jsx`'s `useStoreItem` (redirects, not-found log) and `SeoHead`.
- Bangla addresses default to Latin letters (মোবাইল কভার → mobail-kabhar). Shops can keep Bangla in SEO › Settings.

Changed in your 74 fixes:
- `RichText.jsx` sanitizer now keeps a link's nofollow / sponsored / ugc and target="_blank" (it used to drop them).
- `StorePage.jsx` now uses the shared `storeChrome.jsx` (same header, footer and preview bar as before).
- The page editor's "Hide from search engines" switch moved into the SEO panel (Search engines › Show in search results).

## Stage 2 · Module B · Services (14 Oct 2026)

Done: merchant Services shop (catalogue, packages, brief, demo payment, My services with messages, deliveries, monthly
reports, store access approval, extra work, approve / change, rating) and super admin Services (orders board with a
deadline that pauses while waiting, assignment with suggestions, quality check, quotes, refunds, catalogue with brief form
builder, experts, reports). Money reaches Finance by itself (income, partner payouts owed, refunds).

How the two sides meet: `lib/platform/services.js` is one shared store (like a server), and Dazzle Shop is now platform store
#0090 (`lib/platform/seed.js`, DATA_VERSION 4 — saved super admin demo data restarts once).

Needs the server: payments, file uploads, SMS to the owner for access requests, enforcing the access scope (the session
says "Online Store only", the server must enforce it).

Decision for you: Services sits in the merchant menu under Team & settings (module `core`, every edition; each service
picks its editions and plans in the catalogue).

## Stage 2 · Module D · Business email (14 Oct 2026)

Done, provider-neutral: setup (domain from Settings › Domains, plan, verify, MX / SPF / DKIM / DMARC with copy and status,
"Add records for me" for domains whose DNS GridCommerce hosts), mailboxes (invite link or password, reset, two-step,
storage, forward, auto-reply, suspend, delete with 30-day restore), aliases, groups, forwarders, catch-all, webmail stand-in,
phone setup with QR, IMAP import, plan & usage with buying mailboxes and storage, spam quarantine, shop emails from the own
domain. Users & roles' invite makes a mailbox; HR leaving suspends it and forwards mail. Super admin: directory with DNS
health, usage, revenue vs provider cost and alerts; plans & provider; abuse & limits with suspension.

Needs the server: the mail provider itself (choice is the partners' and Bablu vai's: own servers or a reseller), real DNS
checks, sending order mail from the shop's address, single sign-on to webmail, the import job.

Decision for you: mailbox prices and the free mailboxes per plan are demo numbers (Basic ৳150 / Business ৳300 / Pro ৳600 a
mailbox a month; Starter 0, Growth 1, Business 3 free) — set them in super admin › Business email › Plans & provider.

## Stage 3 · Loose ends you listed (14 Oct 2026)

All seven fixed: Home's today-vs-yesterday figure (same time of day), the product VAT box (saved, used before the
category rate by the register, Create order and order links), the order link's VAT on top (follows the VAT setup), the
demo customer's Gold badge (real tier), IMEI for courier orders including converted quotes (asked when packing, web and
phone; sent-to-courier marks the units sold), the wholesale switch read too early (`returnChannels()`, `importFields()`,
`getQuotes()`), and the GridAI button over save bars on computers (lifted above them).
(The 56 starred items were done after this; see below.)

## Stage 2 · Module A · Storefront builder (15 Oct 2026)

Done, all of A1–A6: one engine in `src/lib/storefront/` (theme 59 options in 9 groups with search, draft / publish /
undo / reset; header builder for computer and phone, 3 rows × 3 areas, 16 elements, phone drawer and bottom bar;
HTML blocks with "used in" and safe delete; layouts for Home, Product, Category, Page, Cart, Search and 404 from 15
section types with conditions; mega menus in Menus; Signal / Nokshi / Counter presets with preview on the shop's own
products, choose what to import, what will be replaced, and a restore point first). Customer pages `/store`, `/cart`,
`/search`, the themed 404, and product, category, page, offers, offer detail, checkout and order link all draw with the
published theme (`?preview=1` shows drafts). Super admin's merchant-editing switches now lock options in the editor.

Not built (the package's "don't build now" list): theme code editor, popup builder, slider plugin, per-element
animations, maintenance mode. Customer accounts, wishlist and compare buttons say they aren't built yet.

## Stage 3 · the 56 starred items (15 Oct 2026)

Built by area with separate builder agents, then every page checked in a browser at 1440 and 390 px by separate checker
agents, who fixed about 60 problems they found (two crashes on every store page among them). ON-U14 was already done.
Highlights:
- Online selling: `/track?id=` tracking page (unlocked by the mobile number), return requests (`/return-requests`),
  district → area address picker (64 districts, sets the zone and charge), order source, assign to staff, courier
  handover with a printed manifest, digital orders send keys and links, Settings › Checkout, one delivery-rates source,
  badges use the tab words, Return only after delivery.
- Products & POS: real catalog lists, versioned warranty policies, real claims on IMEI, supplier edit / archive /
  ledger print, Pricing third on Add product, Purchasing group in Inventory, Collect due at the register, Z-report
  80 mm / A4, PIN and limits per person, counter sales are invoices only when owed, receipt from Settings › General,
  Settings › Invoices & receipts, retail rows in Needs you.
- Customers & marketing: notification matrix beyond orders, Create order and New ticket on the customer, the full
  customer picture for every customer, Automations in one place, Marketing in 5 rows, live menu counts, GridAI button.
- Money & settings: open and reverse a money movement, expense place / VAT / receipt / repeat, notification centre,
  Analytics menu, Home widgets, no fixed counts, Profile type only on review builds, placeholder copy removed, ~1,100
  more Bangla strings.
- Super admin & app: business verification (KYC), merchant notices with a banner, health and at-risk, failed
  auto-charges, VAT on subscription bills, returns and Today's cash on the phone.

### Partly done (and why)
- AP-F5 Returns on the phone: receiving courier return parcels stays on the web (`/courier-returns`).
- AP-U3 Phone app Bangla: the order page and order list got a smaller pass than the rest.
- CX-F3 Notifications matrix: "Invoice sent" and "Sign-in code" say Not sent yet (nothing sends an invoice by itself;
  sign-in codes need the server). Loyalty keeps sending its own messages.
- CX-U6 Automations: Grid AI › Automations keeps its row in Grid AI so the Retail edition still reaches it.
- MS-U12 Bangla: sentences built with numbers, HR setup, shifts and money setup still have English lines.
- PR-U7 Inventory menu: Barcode labels stays a plain row (not folded under More).

## Asked along the way (14–15 Oct 2026)
- Inbox › Email (`/email-inbox`): the shop's info@ / sales@ / support@ / orders@ mail as conversations; Reply, Reply
  all, Forward with To / Cc / Bcc, quoted mail, notes, assign; date search (a day or a range), filters, numbered pages.
- Support tickets: an Urgent tab. Meetings: Zoom and Google Meet logos. RedX: its own logo.
- Settings › Hosting (`/set-hosting`): Overview, Domains (the old Domains page), DNS (GridCommerce nameservers or the
  registrar, full record editor, templates, zone import / export, DNSSEC), Email (provider, SPF / DKIM / DMARC /
  MTA-STS built and checked, test email), SSL & security, Speed & cache, Files & verification, Backups, Usage.
  Backups moved here from Settings › API keys & backups (now "API keys").
- Top bar: the Settings, Invoices and Files buttons were removed (Store settings is in the account menu).


## Decisions for you
- Still open from the package (three partners): wholesale on at launch or later; editions, plans and prices the super
  admin sells; prices for service packages and mailboxes; email on own servers or a reseller (with Bablu vai).
- Menu: the storefront builder lives in Online Store (Theme, Header builder, Layouts, HTML blocks first); "Online
  store" stays "Landing pages". Marketing is 5 rows (Offers and Loyalty have tabs) and Automations is one page with tabs.
  Please confirm these shapes.
- Hosting: demo numbers to set — bandwidth / storage per plan (Starter 50 GB / 2 GB, Growth 250 / 10, Business 1000 /
  50), overage ৳8 a GB bandwidth and ৳25 a GB storage, nameservers `ns1/ns2.gridcommerce.com.bd`. Hosting is in every
  edition (domains and email matter for Retail too); Speed and Files show only with the online store.
- Storefront presets follow each theme's packages in super admin; Custom CSS is Business plan only and off by default.
- The demo shop now runs on its own domain `dazzleshop.com.bd` (verified, primary) so Hosting has something to show.
- Demo figures that disagree (from fixed demo data, left alone): e.g. Nusrat Jahan's order count differs between the
  customer header and her Orders tab; loyalty keeps its own spend total.
- Return logic exists twice (web `ReturnExchange.jsx` and phone `app/pos/returnData.js`); merging them into one lib is
  worth doing during module separation.

## Changed in your 74 fixes (Stage 3 and Module A work on top of them)
- ON-F1 Pages, ON-F2 Menus, ON-U4 Offers, ON-U2 Landing pages: customer pages now sit inside the theme's header and
  footer and follow its colours; menu items can open a mega menu, and menu links point to the new store addresses
  (`/store`, `/product`, `/category`). On Offers the "Design preview / jump to 10 seconds before start" control shows
  only with `?preview=1`.
- ON-U3 Checkout: still creates the real order; it now reads the store cart, the district / area picker, Settings ›
  Checkout (guest, phone code, email, COD fee, limits, terms) and empties the cart after the order.
- ON-F4 Orders filters: the old filter key `assigned` (it meant "has a tracking ID") is now `tracking`, shown as
  "Courier tracking"; "Assigned to me" is a real assignee now. Badges show the tab word with the step in grey.
- RT-F2 / RT-U3 / RT-U4 counter sales: unchanged sums; a counter sale becomes an invoice only when money is owed, and
  counts as accepted. RT-U5 refunds: Return & exchange asks a manager's own PIN when the cashier's role can't refund.
- PR-F7 Categories and Add product: a category now has its own address and the SEO panel (Module C); Add product
  has the SEO panel too, reads the real catalog lists (units, tax rates, shop fields, size charts) and puts Pricing third.
- MS-U1 Settings › API keys & backups: backups moved to Settings › Hosting; the page is "API keys" and points there.
- Settings list: "Domains" became "Hosting & domains"; Profile type shows only on review builds.
- Super admin: Merchants list has Health and Last sign-in columns (Email column dropped; still in search and CSV),
  Collections has an Auto-charge failed group, the dashboard adds at-risk and verification rows.
- Your record tools: `tools/records/shoot.cjs` gained `scroll` and `eval` steps; `tools/records/build-pdf.cjs` groups
  by a record's own `section` (module names) and takes `meta.compared`. Old phase1 records build the same as before.
  `tools/records/stage2-3.py` turns this batch's records into the generator's format with a screenshot plan.
