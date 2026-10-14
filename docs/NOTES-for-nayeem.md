# Notes for Nayeem (Mostafiz's side)

Kept as the work goes; becomes NOTES.md in the zip at Stage 4.

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
The 56 starred Stage 3 items are not started yet (Mostafiz vai chose Modules B and D first).
