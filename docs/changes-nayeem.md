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

## 2026-10-16 · nayeem/batch-e · Batch F: Grid Career (hiring)
- What: one hiring engine for GridCommerce and for stores (`lib/platform/career.js`, `gc.career`): jobs with an
  application-form builder (text, choice, yes/no, number, CV; required; a knockout answer rejects at once), share links per
  source (`?src=` Facebook, WhatsApp, LinkedIn …), applicants board (New → Shortlisted → Interview → Offer → Hired /
  Rejected) and table, rating, notes, interviews, messages (simulated), Hire → `/staff-create` with the details filled in.
  Merchant Staff & HR › Hiring (`/hiring`, `/hiring-job`, `/hiring-applicants`) with the careers page settings; the
  store's careers page `/careers` (store look, Apply with CV) and the candidate status page `/application?code=`.
  Super admin area Grid Career: GridCommerce's own jobs, applicants, careers page `/jobs`, and a control centre of stores
  hiring (hide a job with a reason). Who may use it: Services › Access › Grid Career (chosen stores; Dazzle Shop open).
- Why: Nayeem's brief: hiring for super admin and for stores who ask for it, replacing Google Forms, Sheets and posts.
- Files: `lib/platform/career.js`, `screens/career/*`, `screens/storefront/StoreCareers.jsx`, `screens/admin/career/*`,
  their routes (new); `marketAccess.js`, `MarketAccess.jsx`, `StaffCreate.jsx`, `navigation.js`, `edition.js`, `team.js`,
  `registry.js`, `adminNav.js`, `roles.js`, `GridAi.jsx`, `help.js`, `bn.js`.
- See it: `/hiring`, `/hiring-applicants?job=JOB-106`, `/careers`, `/jobs`, `/admin/career`, `/admin/career/stores`.

## 2026-10-16 · nayeem/batch-e · Batch E: Grid Partners (models, influencers, video creators)
- What: `lib/platform/partners.js` (`gc.partners`): creators apply (`/grid-partners/join`: type, platforms and followers,
  samples, rate card, phone code, ID declaration) and are reviewed in super admin against editable minimum standards
  (5 checks; approve only when all pass, reject with a reason). Creators' own app: `/gp-sign-in`, `/gp` (requests, views,
  share card with QR and a downloadable picture), `/gp-profile`, `/gp-requests`; public profile `/p?h=` (no contact
  details). Stores: Services › Grid Partners (`/partners` with filters, `/partner?h=`, Request a quote, `/partner-requests`;
  contact shared after the creator accepts; rate after done). Super admin area Grid Partners: directory, applications,
  requests, settings; verify, feature, suspend. No money goes through GridCommerce.
- Why: Nayeem's brief: a place for stores to find models, influencers and video creators, with a shareable profile.
- Files: `lib/platform/partners.js`, `screens/partners/*`, `screens/partners/portal/*`, `screens/admin/partners/*`, their
  routes (new); `marketAccess.js`, `svcShared.jsx`, `navigation.js`, `edition.js`, `team.js`, `registry.js`, `adminNav.js`,
  `roles.js`, `GridAi.jsx`, `help.js`, `bn.js`.
- See it: `/partners`, `/partner?h=nadia-glow`, `/gp-sign-in`, `/p?h=nadia-glow`, `/admin/partners/applications`.

## 2026-10-16 · nayeem/batch-e · Batch E: Grid Shop vendors and pricing
- What: Grid Shop's suppliers became vendors with their own portal (`/vendor-sign-in`, `/vendor`, products with approval of
  new items and price changes, parcels: accept, pack, book a courier or enter one, delivered; money: owed, payouts, monthly
  fees; profile). Pricing per vendor: commission (default: the vendor sets the store price, GridCommerce takes a %) or
  markup, a fee per parcel and a monthly fee; pricing rules for both sides (store fees and markups, discounts funded by
  GridCommerce or the vendor, dates, stores) with Try a price (`gridShop.priceFor`). Each order line keeps its price
  breakdown. Super admin: Vendors, vendor record, Pricing rules, Products › Waiting for approval; stores see Sold by,
  discounts and any platform fee. The old suppliers address forwards to Vendors.
- Why: Nayeem: vendors such as Star Tech sell and ship through Grid Shop from their own dashboard; GridCommerce can charge
  or discount either side.
- Files: `lib/platform/gridShop.js`, `lib/admin/gridShopSync.js`, `screens/vendor/*` and routes (new),
  `screens/admin/gridshop/GsVendors.jsx`, `GsVendor.jsx`, `GsPricing.jsx` (new), `GsSuppliers.jsx` (deleted),
  `GsProducts.jsx`, `GsOrder.jsx`, `screens/services/GridShop*.jsx`, `gsShared.jsx`, `adminNav.js`.
- See it: `/vendor-sign-in` (Star Tech), `/admin/grid-shop/pricing`, `/admin/grid-shop/vendor?id=star-tech`, `/grid-shop`.

## 2026-10-16 · nayeem/batch-e · Batch E: pictures in tables
- What: a small picture column in tables listing things people recognise by sight: products and stock (own photo, else a
  demo picture, else a letter tile), people (photo or initials on a steady colour), companies (logo or initials), services,
  pages and offers (cover). One component, `components/ui/Pic.jsx` (`Pic`, `PicStack`), and `lib/pictures.js`
  (`productPic`). 48 demo pictures drawn without brand marks (`tools/records/product-photos.cjs`). Money, orders, logs,
  reports and settings tables have no pictures on purpose.
- Why: Nayeem's finding: tables were hard to scan; add a picture column where it is justified.
- Files: `components/ui/Pic.jsx`, `lib/pictures.js`, `lib/productPhotos.js`, `public/assets/products/*`,
  `public/assets/gridshop/*` (new); `design-system.css`; about 60 list screens (products, stock, purchasing, channels,
  customers, HR, users, leads, suppliers, payouts, offers, store pages, and super admin merchants, services, people, mail,
  Merchant AI, website, themes, marketing).
- See it: `/all-products`, `/all-customers`, `/coupons`, `/admin/merchants`, `/admin/services/experts`.
- Record for Batches E and F: `docs/records/batch-e/` (17 entries); PDF `GridCommerce-batch-e-change-record.pdf`.

## 2026-10-16 · nayeem/batch-d · Batch D steps 7–8: Grid Shop and Share
- What: Grid Shop (`lib/platform/gridShop.js`): business supplies merchants buy from GridCommerce, hybrid per product (our
  stock, or shipped by a supplier straight to the store). Merchant Services › Business supplies (`/grid-shop`, item page,
  cart side panel, checkout, My supply orders and the order with each parcel's courier and tracking). Super admin area
  Grid Shop: orders (pack, ship with courier and our cost; pass supplier parcels on by WhatsApp or email; supplier shipped =
  owed our cost; delivered), products (stock, cost and margin, bulk prices, pictures, on sale / paused), suppliers (payout
  account, owed, paid), profit; income and supplier payouts reach Finance (`lib/admin/gridShopSync.js`). Share button on
  services (Catalogue, editor) and Grid Shop products: an automatic summary that can be edited and kept, email / SMS to
  picked stores through Communications, WhatsApp per store, social share pages, copy.
- Why: the brief's "a small Grid Commerce shop for merchants" (hybrid, answer 3) and "share existing services and shop
  products with a small summary and a link; the summary is automatic but we can override it".
- Files: `lib/platform/gridShop.js`, `lib/admin/gridShopSync.js`, `screens/services/GridShop*.jsx`, `gsShared.jsx`,
  `screens/admin/gridshop/*`, `screens/admin/services/ShareSheet.jsx`, their routes (new); `AdminShell.jsx`, `adminNav.js`,
  `roles.js`, `finance.js`, `SvcCatalogue.jsx`, `SvcEdit.jsx`, `navigation.js`, `edition.js`, `team.js`, `registry.js`,
  `help.js`, `bn.js`.
- See it: `/grid-shop`, `/grid-shop-orders`, `/admin/grid-shop`, `/admin/grid-shop/products` (Share), `/admin/services/catalogue`.

## 2026-10-16 · nayeem/batch-d · Batch D steps 4–6: custom offers, teams, tasks and payouts, updates, profit
- What: instant custom offers (`createOffer`): super admin › Service orders › New custom offer (store, work, price, days,
  cover, who, valid for), the payment link `/service-offer?code=` sent by email / SMS / WhatsApp / social (ShareSheet,
  logged on the order), extend or withdraw; the store pays to confirm (or from My services). Stores ask for custom work
  (My services › Ask for a custom offer → Service orders › Requests › Make an offer). Orders go to an expert or a team
  (Experts › Teams; lead = expert). Tasks per order for an expert or team with what they are paid; done → owed → Finance
  expense to their bank / bKash / Nagad → paid shows on the task. Progress updates with a percent, shared with the store or
  kept for the team; the store sees shared ones on its order. Other costs and profit per order; Reports with cost and profit
  by service and order.
- Why: the brief's instant services with a payment link, appoint an expert or team, post updates the store can track,
  every task's cost paid to the expert's or team's bank, and profit counted.
- Files: `lib/platform/services.js` (v3), `lib/admin/servicesSync.js`, `lib/admin/finance.js`, `screens/admin/services/`
  (`SvcOffer.jsx`, `SvcOrderWork.jsx`, `ShareSheet.jsx` new; `SvcOrder.jsx`, `SvcOrders.jsx`, `SvcExperts.jsx`,
  `SvcReports.jsx`), `screens/services/` (`OfferPay.jsx` new; `MyService.jsx`, `MyServices.jsx`, `Services.jsx`,
  `svcShared.jsx`), routes `/service-offer`, `/admin/service-offer`, `GridAi.jsx` (hidden on the payment page).
- See it: `/admin/services?tab=requests`, `/admin/service-offer`, `/admin/service-order?id=SO-1012` and `SO-1002`,
  `/service-offer?code=` (code on SO-1012), `/my-service?id=SO-1001`, `/admin/services/experts` › Teams, `/admin/services/reports`.

## 2026-10-16 · nayeem/batch-d · Batch D step 3: every service on its own page
- What: services carry a cover, a gallery and proof of work (our own store and panel screenshots in
  `public/assets/services/`, demo photos). `/service-detail` is laid out like a Fiverr gig: big picture with thumbnails and a
  large view, About, Proof of work, Who does the work, What shops said, Questions; packages as tabs at the side with
  Continue; on phones a bar jumps to the packages. Service cards show the cover. Super admin › edit a service has a
  Pictures card (upload, made 960 px, or pick from the library; captions; proof entries).
- Why: the brief's "cover, gallery and proof of work pictures; every service its own page like a Fiverr gig".
- Files: `services.js`, `lib/readPicture.js` (new), `ServiceDetail.jsx`, `Services.jsx`, `svcShared.jsx`,
  `screens/admin/services/SvcMedia.jsx` (new), `SvcEdit.jsx`, `public/assets/services/*` (new).
- See it: `/services`, `/service-detail?id=store-design`, `/admin/service-edit?id=store-design`.

## 2026-10-16 · nayeem/batch-d · Batch D steps 1–2: super admin message design; who may use Services and Grid Shop
- What: Communications › Message design in super admin (Email design + SMS design with sender, every SMS, EN/BN phone
  preview, quick edit); Communications › Email moved to `/admin/comms/email`. Access control (`lib/platform/marketAccess.js`):
  Services and Grid Shop each on or off for every store, open to chosen stores only, blocked stores with a reason the store
  sees; Services › Access page and per store on the merchant's Modules tab; merchant pages show why when closed.
- Why: "emails, email designs and sms modules for super admin" and "full control: on/off the whole module, open it for
  particular members, block any merchant".
- Files: `screens/admin/comms/MessageDesign.jsx`, `lib/platform/marketAccess.js`, `screens/admin/services/MarketAccess.jsx`
  and routes (new); `EmailDesign.jsx`, `adminNav.js`, `comms.js`, `CommsOverview.jsx`, `Templates.jsx`, `TemplateDesign.jsx`,
  `ProfileModules.jsx`, `svcShared.jsx`, `Services.jsx`, `ServiceDetail.jsx`, `ServiceOrder.jsx`, `next.config.mjs`.
- See it: `/admin/message-design`, `/admin/services/access`, `/admin/merchant?id=0090&tab=modules`, `/services` after blocking.

---

## 2026-10-16 · nayeem/batch-c · Batch C step 8: safe code snippets
- What: Online Store › Snippets (`/snippets`, `lib/storefront/snippets.js`): tracking and verification by ID only (Meta Pixel,
  GA4, GTM, TikTok, Google and Bing verification) with the code made from fixed templates; CSS refused unless it passes
  `customCode.js › checkCss` (no tags, escapes, @import or other @-rules but @media / @supports / @keyframes, url() to other
  sites, expression / behavior / javascript:, attr(), value / placeholder / partial-match attribute selectors,
  position:fixed) and scoped under `.sf-theme`; text / HTML through `sanitizeHtml` (refused if anything would be stripped),
  below the header or above the footer. Per-snippet on / off; failing snippets are not saved and are re-checked when
  drawn; CSS and HTML never on /checkout, /account, /order-link, /track. Super admin kill switch per shop (merchant ›
  Modules › Code snippets, `lib/admin/snippetGuard.js`, `gc.admin.snippets`). Theme › Custom CSS and design-file imports use
  the same check; Custom CSS is also kept off those pages.
- Why: Batch C item 8.
- Files: `lib/storefront/snippets.js`, `screens/online-store/Snippets.jsx`, `app/(merchant)/snippets`, `lib/admin/snippetGuard.js`
  (new); `customCode.js`, `theme.js`, `kit.js`, `ThemeEditor.jsx`, `storeChrome.jsx`, `ProfileModules.jsx`, `navigation.js`,
  `edition.js`, `team.js`, `registry.js`, `help.js`, `bn.js`.
- See it: `/snippets`, `/store`, `/checkout`, `/admin/merchant?id=0090&tab=modules`.

## 2026-10-16 · nayeem/batch-c · Batch C step 7: partial payment
- What: `lib/partialPayment.js`: rules by delivery zone, order total above an amount, or products; fixed (per unit for
  products) or %; largest part wins; online methods to take it (Settings › Checkout › Partial payment,
  `components/PartialPaymentSettings.jsx`). Checkout turns the COD choice into "Pay part now, rest on delivery" with
  method chips and a Pay now / On delivery split; the part is a payment link and the order's `advance` is requested.
  Order page: Request part payment (amount from Payment setup's advance %, SMS / WhatsApp / email / Messenger through
  `messaging.send`, a real `paymentLinks` link); "Send payment link" in Take advance + approve opens it. A paid link marks
  the advance paid and sets the COD rest (`paymentLinks.payLink › onLinkPaid`). Staff still approve the order.
- Why: Batch C item 7.
- Files: `lib/partialPayment.js`, `components/PartialPaymentSettings.jsx` (new); `Checkout.jsx`, `SetCheckout.jsx`,
  `OrderDetail.jsx`, `paymentLinks.js`.
- See it: cart with a phone → `/checkout` › Outside Dhaka; `/set-checkout#partial`; `/order-detail?id=%23136811` › Request part payment.

## 2026-10-16 · nayeem/batch-c · Batch C step 6: affiliate withdrawal requests
- What: `lib/affiliates.js`: rules (`wdOn`, `wdMax`, `wdEvery` days, `wdApproval` manual / auto, `wdMethods`; minimum =
  `minPayout`), `withdrawRules`, `requestPlan` (whole orders, largest first), `requestWithdrawal`, `approveWithdrawal`
  (one Liabilities line per request), `rejectWithdrawal` (reason); commissions in a waiting request are `requested`.
  My account › Affiliate › Withdraw; Marketing › Affiliates › Withdrawals tab + review drawer; rules in Settings. Demo:
  Nabila has ৳1,448 payable (early-October live orders), Deal Hunters BD has WD-0001 waiting. Fix: affiliate tables were
  hidden on phones (`ix-table-wrap--show`).
- Why: Batch C item 6.
- Files: `lib/affiliates.js`, `Affiliates.jsx`, `AffiliateProfile.jsx`, `StoreAccount.jsx`.
- See it: `/account?tab=affiliate` (01755 123456, code 1234), `/affiliates?tab=wd`, `/affiliates?tab=settings`, `/liabilities`.

## 2026-10-16 · nayeem/batch-c · Batch C step 5: full-screen store editor
- What: `/store-editor` has no app sidebar, top bar or GridAI button; its own 52 px bar (← Theme with an unsaved check,
  page picker, Computer / Phone, Undo / Redo, More, Save draft, Publish); wraps on phones.
- Why: Batch C item 5.
- Files: `StoreEditor.jsx`, `components/ui/GridAi.jsx`.
- See it: `/store-editor`.

## 2026-10-16 · nayeem/batch-c · Batch C step 4: Communications › Message design, white email preview
- What: `/message-design?tab=email|sms` (Communications area, menu id `msg-design`, module `commerce`): Email design
  (moved from Settings › Notifications, `components/email/EmailDesignPanel.jsx`) and SMS design (`components/sms/SmsDesignPanel.jsx`,
  `lib/smsDesign.js`: sender name, every SMS with parts, Short / Friendly / Bangla wordings, variables, phone preview, test,
  reset). `/email-design` forwards (`next.config.mjs`). Email previews pinned to light with `emailKit.previewHtml` (the
  reader's dark-mode rule leaked in); Light / Dark switch on the design page; admin previews too.
- Why: Batch C item 4.
- Files: `MessageDesign.jsx`, `EmailDesignPanel.jsx`, `SmsDesignPanel.jsx`, `smsDesign.js`, `app/(merchant)/message-design` (new);
  `SetEmailDesign.jsx` + `app/(settings)/email-design` (removed); `emailKit.js`, `EmailStudio.jsx`, `EmailEditor.jsx`,
  `SetNotifications.jsx`, `shopEmails.js`, admin `EmailDesign.jsx` / `TemplateEditor.jsx`, `navigation.js`, `edition.js`,
  `team.js`, `registry.js`, `help.js`, `next.config.mjs`.
- See it: `/message-design`, `/email-editor?event=approved` with the computer in dark mode.

## 2026-10-16 · nayeem/batch-c · Batch C steps 1–3: My account (wishlist tab, Profile first, profile picture)
- What: Wishlist is a tab of My account (compact grid, remove, add to cart, share, add all); header heart and the
  figure open it for signed-in shoppers; `/wishlist` stays for shared links and guests. Profile is first in the list
  (page still opens on Orders). Profile picture: `AvatarCrop.jsx` (pick, square crop with drag / zoom / keys, 256 px JPEG),
  `account.setAvatar / removeAvatar / initialsOf`; shown in My account, the header account button and the phone bar.
- Why: Batch C items 1–3.
- Files: `StoreAccount.jsx`, `StoreWishlist.jsx`, `storeHeader.jsx`, `lib/storefront/account.js`, `AvatarCrop.jsx` (new).
- See it: `/account?tab=wishlist`, `/account?tab=profile` (01553 336655, code 1234).

## 2026-10-16 · main · Batch B merged
- What: Batch B (steps 1–3: designed emails, customer accounts, affiliates) merged into `main`; wholesale stays on.
- Why: Nayeem approved the main update. Build, tsc, check:screens and test:nav passed; pages checked in a browser.
- Files: as in the three Batch B entries below; records in `docs/records/batch-b/`.
- See it: https://gridcommerce-studio.netlify.app (handover zip `GridCommerce-update-2026-10-15-batch-b.zip`).

## 2026-10-15 · nayeem/batch-b · Batch B step 3: affiliate programme
- What: `lib/affiliates.js`: programme settings (10% or fixed, rates per category, 30-day link, ৳500 minimum, manual or
  automatic approval, 7-day return window, terms), affiliates (the three in September's payout) with code, link, own rate
  and payout method, applications, clicks from `/store?ref=CODE`, orders tied by link or by the code typed at checkout
  (never the affiliate's own), commission pending → payable after delivery + return window → in a payout → paid (cancelled
  when the order is cancelled, returned or refunded), Make payouts = one Affiliate payout row in Finances › Liabilities.
  Shop: Marketing › Affiliates (`/affiliates?tab=`: affiliates, applications in a side panel, commissions, settings) and
  one affiliate (`/affiliate?id=`). Store: Become an affiliate (`/affiliate-program`) and My account › Affiliate (link,
  code, QR, figures, orders, payouts, payout method).
- Why: item 5 of the remaining work (part 2).
- Files: `lib/affiliates.js`, `loyalty-promo/Affiliates.jsx`, `loyalty-promo/AffiliateProfile.jsx`,
  `storefront/StoreAffiliate.jsx`, `app/(merchant)/{affiliates,affiliate}`, `app/(storefront)/affiliate-program` (new);
  `StoreAccount.jsx`, `Checkout.jsx`, `storeKit.jsx`, `navigation.js`, `edition.js`, `team.js`, `routes.js`,
  `registry.js`, `help.js`, `bn.js`.
- See it: `/affiliates`, `/affiliate?id=AF-002`, `/store?ref=NABILA` then checkout, `/affiliate-program`,
  `/account?tab=affiliate` (01755 123456, code 1234).

## 2026-10-15 · nayeem/batch-b · Batch B step 2: customer accounts, wishlist, compare
- What: shoppers' accounts on the online store (`lib/storefront/account.js`): sign in with the mobile number and a code
  by SMS or WhatsApp (demo code 1234; a new number gets an account) or email and password when allowed. My account
  (`/account?tab=`): Orders (status, Track, Buy again, Invoice), Returns, Addresses (district and area), Points & credit,
  Coupons, Warranty (days left, claim), Profile (details, password, offers by SMS / WhatsApp / email = the shop's
  consent record). Wishlist (`/wishlist`, share link `?ids=`) and Compare (`/compare`, up to 4, template specs, only
  differences) from a heart and a compare button on every product card and page, a compare bar, header badges. Checkout
  fills in for a signed-in shopper; the thank-you page offers "Save my details". Settings › Checkout › Customer accounts
  (off / optional / required, sign-in ways, Save my details); the customer page shows "Has an account · last sign-in".
  The order page (`/track`) opens directly for the signed-in owner. Demo checkout code is 1234.
- Why: item 5 of the remaining work (part 1; affiliates are step 3).
- Files: `lib/storefront/account.js`, `StoreAccount.jsx`, `StoreWishlist.jsx`, `StoreCompare.jsx`, `storeAccount.jsx`,
  `app/(storefront)/{account,wishlist,compare}/page.jsx` (new); `storeKit.jsx`, `storeHeader.jsx`, `storeChrome.jsx`,
  `StoreProduct.jsx`, `TrackOrder.jsx`, `Checkout.jsx`, `checkoutSettings.js`, `SetCheckout.jsx`, `settingsRegistry.js`,
  `CustomerCRM.jsx`, `consent.js`, `edition.js`, `registry.js`, `help.js`, `bn.js`.
- See it: `/account` (01553 336655, code 1234), `/wishlist`, `/compare`, `/set-checkout#accounts`,
  `/customer-crm?phone=01553336655`.

## 2026-10-15 · nayeem/batch-b · Batch B step 1: designed emails (shop and GridCommerce)
- What: one email kit (`lib/email/emailKit.js`: parts, 600 px table HTML, dark colours, plain-text part) used by both
  sides. Shop: Settings › Notifications › Email design (`/email-design`: look, language, every email, test emails) and
  the editor (`/email-editor?event=`: English and Bangla, parts, variables, computer / phone, light / dark, save, reset,
  test). 5 new customer emails (return requested / approved, cart reminder, back in stock, review request). Super
  admin: Communications › Email design (`/admin/email-design`), a designer per email template
  (`/admin/templates/design?id=`), 8 new platform emails; comms demo data version 2.
- Why: item 4 of the remaining work.
- Files: `lib/email/*`, `components/email/*`, `SetEmailDesign.jsx`, `EmailEditor.jsx`, `admin/comms/EmailDesign.jsx`,
  `TemplateDesign.jsx` (new); `notifications.js`, `SetNotifications.jsx`, `admin/comms.js`, `TemplateEditor.jsx`,
  `adminNav.js`, `edition.js`, `registry.js`, `help.js`, `bn.js`.
- See it: `/email-design`, `/email-editor?event=in-transit`, `/admin/email-design`.

## 2026-10-15 · main · Batch A merged; wholesale switched on for our site
- What: Batch A (steps 1–7) merged into `main`; `netlify.toml` builds the site with `NEXT_PUBLIC_WHOLESALE=true`.
- Why: Nayeem approved the main update with wholesale on. Builds checked with the switch off and on.
- Files: `netlify.toml`, this log.
- See it: https://gridcommerce-studio.netlify.app

## 2026-10-15 · nayeem/batch-a-design · Batch A step 7: one visual editor (Edit store)
- What: Online Store › Theme › Edit store (`/store-editor`): the live page beside a panel with Sections (click a part
  of the page or a row to edit it with the same fields as Layouts, drag to reorder, hide, remove, Add section from the
  library showing each type's looks), Style (one-switch styles and the main options) and Header (this page's header);
  any layout can be picked; Undo / Redo for every change; Save draft / Publish (layout + style). The preview frame
  outlines and picks sections (`editBridge.jsx`, only with `?preview=1&edit=1`). Theme's main button is Edit store;
  Layouts has "Open in the store editor".
- Why: item 1 of the remaining work: one place to design the store, by looking at it.
- Files: `StoreEditor.jsx`, `editBridge.jsx`, `app/(merchant)/store-editor/page.jsx` (new); `LayoutEdit.jsx`
  (`SectionFields`, `previewPath`, `STARTER`, `summary`, `LE_CSS` exported), `ThemeEditor.jsx` (`OptControl`, `TE_CSS`),
  `Theme.jsx`, `sections.jsx` (`data-sec-id`), `storeChrome.jsx`, `navigation.js`, `edition.js`, `team.js`,
  `registry.js`, `help.js`, `bn.js`.
- See it: `/store-editor`.

## 2026-10-15 · nayeem/batch-a-design · Batch A step 6: custom sections (HTML and CSS)
- What: Online Store › HTML blocks › Custom sections (`/html-blocks?view=custom`): write a section in HTML and CSS with
  settings (`{{key}}`), live preview, and a list of anything unsafe that is taken out; add it to a layout as "Custom
  section" and fill in its settings there. Allow-list sanitiser and CSS scoping in `customCode.js` (no scripts, frames,
  forms, event handlers, javascript: links, @import, fixed positioning). Writing code: Business plan + the theme's
  "Custom section code" switch (now on by default); design files carry custom sections (always from GridCommerce, from
  other files only on Business).
- Why: item 1 of the remaining work: designs the built-in sections can't make, without app code.
- Files: `customCode.js`, `customs.js`, `CustomSections.jsx` (new); `HtmlBlocks.jsx`, `LayoutEdit.jsx`, `Theme.jsx`,
  `MyService.jsx`, `sections.jsx`, `schema.js`, `kit.js`, `kitStore.js`, `access.js`, `admin/themes.js`, `bn.js`,
  `tools/store-kit/render.mjs`, `SKILL.md`, `VOCAB.md`.
- See it: `/html-blocks?view=custom` › New custom section; `?plan=starter` shows the locked view.

## 2026-10-15 · nayeem/batch-a-design · Batch A step 5: section looks, new sections, store styles
- What:
  - Most layout sections have 3–4 looks (hero, category tiles, products, offer, brands, reviews, blog, text and picture,
    FAQ, newsletter, why shop with us); the look is a chip row in the section's settings and never loses typed content.
  - New sections: Gallery / lookbook, Icon row, Testimonials, Store locator (the shop's branches), Follow us.
  - Customize › Style: six whole-store styles (Clean, Bold, Soft, Elegant, Compact, Bangla first), one tap, Undo.
  - Design files carry looks and the new sections (checker, VOCAB.md, SKILL.md updated); GridAI's Try another varies
    the Home banner's look.
- Why: item 1 of the remaining work (more design freedom without code) and the agreed "make customisation easier".
- Files: `schema.js`, `kit.js`, `catalog.js` (`storeBranches`), `kitDraft.js`, `sections.jsx`, `LayoutEdit.jsx`,
  `ThemeEditor.jsx`, `bn.js`, `tools/store-kit/check.mjs`, `VOCAB.md`, `SKILL.md`.
- See it: `/layout-edit?id=lay-signal-home` › Add section; `/theme-editor` › Style.

## 2026-10-15 · nayeem/batch-a-design · Batch A step 4: designs as files, theme library, design service, GridAI drafts
- What:
  - Online Store › Theme: export the whole design as one file; import a design file (checked, previewed on the shop's
    own products, choose the parts, restore point first); preview any design before importing. Signal, Nokshi and
    Counter are now design files (`src/lib/storefront/kits/`).
  - Super admin › Storefront themes: a release can carry a design file; once approved and published it shows on every
    shop's Theme page (marked New).
  - Services › Custom store design: repriced to ৳2,500 / ৳5,000 / ৳10,000; the designer delivers a design file, the shop
    previews it and applies it in one click with Undo. The demo shop has an order in progress (SO-1002) to try it.
  - Build with GridAI (Theme): five answers → a drafted design with what was chosen and why; Try another, Save file,
    Import. Simulated by rules (no AI model call).
- Why: items 1 and 3 of the remaining work, and the agreed design-service model (paid design delivered as a file the
  shop can tweak).
- Files: `src/lib/storefront/kitDraft.js`, `src/lib/storefront/kits/*.gcstore.json` (new); `Theme.jsx`, `presets.js`,
  `access.js`, `store.js`, `storeMenus.js`, `kitStore.js`, `sfShared.jsx`, `MyService.jsx`, `SvcOrder.jsx`,
  `services.js`, `admin/themes.js`, `themeShared.jsx`, `ThemeView.jsx`, `bn.js`, `tools/records/shoot.cjs` (file step).
- See it: `/theme` (Preview, Design file, Build with GridAI); `/admin/service-order?id=SO-1002` then `/my-service?id=SO-1002`.

## 2026-10-15 · nayeem/batch-a-design · Batch A step 3: HTML block push (placements)
- What: Online Store › HTML blocks › Placements (`/html-blocks?view=placements`) and "Place in the store" on a block:
  one block into many of 12 spots at once (above / under the header, top of Home, before the footer, product page under
  the price / under Add to cart / as a tab, category top / bottom, cart, checkout, thank-you), for pages, categories,
  products and devices, between two dates, with an order; turn off, edit, remove. "Used in" lists placements; deleting
  a block removes its placements. Placements travel in a store kit.
- Why: item 2 of the remaining work (HTML block push).
- Files: `src/lib/storefront/placements.js`, `src/screens/online-store/PlacementSheet.jsx`,
  `src/screens/storefront/storePlaced.jsx` (new); `HtmlBlocks.jsx`, `HtmlBlockEdit.jsx`, `blocks.js`, `storeChrome.jsx`,
  `StoreProduct.jsx`, `StoreCategory.jsx`, `StoreCart.jsx`, `Checkout.jsx`, `bn.js`.
- See it: `/html-blocks` › Placements › Place a block; then `/store` and a product page.

## 2026-10-15 · nayeem/batch-a-design · Batch A step 2: store notices and header behaviour
- What: Online Store › Store notices (`/store-notices`): many notices (English + Bangla or today's offer line), button
  and link, coupon code with Copy, countdown, colours, place (top bar, under the header, inside the header via a new
  Store notice element, floating bar on phones), pages / categories / products / devices, start and end, "can be
  closed"; notices in one place take turns; live preview; fill from a Marketing offer. Header builder › Behaviour: Over
  the Home banner (see-through over the first hero, solid on scroll; the hero goes full width) and Shrink when scrolling.
  The old one-line announcement shows as the first notice until the shop saves its own, and Customize links to the new page.
- Why: item 3 of the remaining work (header and store notice).
- Files: `src/lib/storefront/notices.js`, `show.js` (new), `src/screens/online-store/StoreNotices.jsx` (new),
  `src/screens/storefront/storeNotices.jsx` (new), `storeChrome.jsx`, `storeHeader.jsx`, `StoreProduct.jsx`,
  `StoreCategory.jsx`, `StoreBlogPost.jsx`, `HeaderBuilder.jsx`, `ThemeEditor.jsx`, `schema.js`, `kit.js`, `kitStore.js`,
  `headers.js`, `theme.js`, route `src/app/(merchant)/store-notices`, navigation, edition, team, registry, help, bn;
  store kit samples now carry their notice; VOCAB.md regenerated.
- See it: `/store-notices` (Add notice), then `/store`; `/header-builder` › Behaviour › Publish, then `/store`.

## 2026-10-15 · nayeem/batch-a-design · Batch A step 1: store kit format, checker, renderer, skill
- What: a store design is now one file (`.gcstore.json`): theme, headers, layouts, HTML blocks, menus, pages, store
  notices and block placements. `checkKit` reads it and says in plain words what is wrong; `kitToStore` /
  `storeToKit` turn it into the store's own data and back (round trip tested on Signal, Nokshi and Counter);
  `applyKit` imports chosen parts with a restore point first; `{{shop_name}}`-style tokens become the shop's details.
- Why: designs must be made fast (Claude writes a kit from a brief), delivered through the design service, kept as
  themes in a library, and tweaked by the shop. Mostafiz vai's themes should arrive as kits, not code.
- Files: `src/lib/storefront/schema.js` (new: every option, element, section, block kind, link type, notice place and
  placement spot, moved here from theme.js, headers.js, layouts.js, blocks.js, storeMenus.js and blog.js, which re-export
  them), `src/lib/storefront/kit.js` (new), `src/lib/storefront/kitStore.js` (new), `src/lib/storefront/presets.js`
  (presetMenus, presetPages), `src/lib/storeMenus.js` (a page link may name the page's address),
  `tools/store-kit/` (new: check.mjs, render.mjs, SKILL.md, README.md, VOCAB.md, samples/).
- See it: `node tools/store-kit/check.mjs tools/store-kit/samples/*.gcstore.json`; with the app running,
  `node tools/store-kit/render.mjs tools/store-kit/samples/nokshi.gcstore.json --url http://localhost:3000`. The import
  and export screens come in step 4.

## 2026-10-15 · nayeem/merge-mostafiz-2026-10-14 · Mostafiz vai's return (Stages 1–3) brought in
- What: Mostafiz vai's return of 14–15 Oct (`GridCommerce-from-Mostafiz-2026-10-14.zip`) kept unchanged on the frozen
  branch `handover/mostafiz-2026-10-14`, and brought onto this branch on top of `main`: our 74 fixes (applied, 79 of our
  files further changed by him — reasons in `docs/NOTES-for-nayeem.md`), Modules A Storefront builder, B Services,
  C SEO, D Business email, the 56 starred launch items, the 7 loose ends, Inbox › Email, Settings › Hosting.
- Kept from our side: `CLAUDE.md` (his copy points to `@AGENTS.md` only; our rules are also in
  `docs/nayeem-working-rules.md` for his side) and `docs/records/phase1/` (left out of the zip we sent).
- Checked: tsc, check:screens, test:nav (450 menus, 448 routes) and build pass; 41 pages (old fixes + new modules)
  load at 1440 and 390 px with one h1, no page errors and no sideways scroll.
- His change record: `GridCommerce-Stages-2-3-change-record.pdf` (114 pages; 107 changes, 6 partly done). Records and
  screenshots in `docs/records/mostafiz-stage2-3/`.
- See it: this branch's preview link.

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
