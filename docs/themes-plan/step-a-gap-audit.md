# Storefront themes — Step A: what exists, what is missing

13 Oct 2026 · Nayeem's copy (`main`, based on Mostafiz vai's handover of 12 Oct 2026) · No code changed.

Mostafiz vai's tasks: (1) plan the themes we need, (2) decide modular pattern vs WoodMart style and what the options look
like, (3) add any options missing from the current build. This document is the audit for task 3. Step B decides the
pattern, Step C picks the themes, Step D builds the agreed options.

## In short

- The **super admin side** of themes is built: a library of 11 themes in 6 families, releases with review and rollback,
  assignment to stores, landing-page templates, and a "what merchants may edit" switch list (marked Planned).
- The **themes themselves do not exist.** There is no storefront home, category or product page drawn by a theme; the
  super admin shows placeholder previews.
- The **merchant has no theme workspace.** Menu › Online Store › "Online store" opens the single-product landing page
  builder. A merchant cannot pick a theme, change its look, edit the menu or footer, or preview their store.
- **Brand colours exist but do nothing on the store.** Settings › General saves a brand and accent colour; only invoices
  use them. The customer pages (Offers, Offer detail, Checkout) have their colours written into the page.
- So "missing options" is most of a theme system. 13 groups are proposed for v1 below and 6 for later.

## 1. What exists today

| Where | What it does | Theme-related options it already has |
|---|---|---|
| Super admin › Storefront themes › Library (`/admin/themes`) | 11 themes in 6 families: Nokshi (fashion), Counter (grocery/retail), Signal (electronics), Tuli (beauty), Padma (wholesale), Rickshaw (food). Status, category, package filters. | Per theme: category, accent colour, features, the sections it carries (11 kinds: announcement bar, header and menu, hero, category tiles, product grid, spec table, offer banner, reviews, countdown, order form, footer), modules, packages. |
| Super admin › Theme record (`/admin/themes/view`) | Placeholder preview (desktop, tablet, phone), versions, stores using it, history. | "Merchant editing" switches: colours and fonts, logo and favicon, header and menu, hero, add/hide/reorder sections, footer, custom CSS, theme code. **Planned: saved, but nothing reads them.** |
| Super admin › Releases, Assignments | Upload → review → approve → publish; rollout to all, selected stores or on next visit; rollback; uploader can't approve. Which store runs which theme and version. | Version and rollout control (platform side only). |
| Super admin › Templates (`/admin/themes/templates`) | Landing-page template library (Eid offer, Flash sale, Single product COD, Pre-order, Lead form …). | Same release workflow as themes. |
| Merchant › Online Store › Online store (`/landing-page-builder`) | Single-product landing page builder. | Product picker; 17 page parts (hero, gallery, video, benefits, features/specs, before/after, reviews, offer line, bundle discount, countdown, stock urgency, variant selection, order form, FAQ, footer/contact, WhatsApp button, related product); drag to reorder, hide; phone/desktop preview; AI copy; publish checks; page link; saved parts. |
| Merchant › Online Store › Offers page, Blog | Offers page (customer side), blog posts, categories, authors. | Content only; no look settings. |
| Settings › General (`/set-general`) | Store identity, support info, address, map. | Store name, light and dark logo, favicon, **brand colour and accent colour (used on invoices only)**, footer about text, copyright line. |
| Settings › Media (`/set-media`) | Brand and trust images. | Logos, favicon, fallback product image, payment-gateway, delivery-partner, verified-badge and licence images ("where each asset appears" is listed). |
| Settings › SEO, Domains, Privacy | Search and social preview, pixels; GridCommerce address and custom domains with SSL; consent and policy settings. | SEO title, meta and social card; domain. |
| Customer pages: `/offers`, `/offer-detail`, `/checkout`, `/order-link` | What a shopper sees today. | None: fixed design, colours written into each page, no logo or theme from settings. |

Not in scope here: Super admin › Website manages gridcommerce.net (our own marketing site), not merchants' stores.

## 2. What is missing

**v1** = needed so a merchant can run a branded store on a theme. **Later** = useful, not needed for the first version.
**Step B** = the shape of this item depends on the modular-vs-WoodMart decision; build waits for it.

| # | Gap | Today | v1 / Later | Step B? |
|---|---|---|---|---|
| G1 | **Storefront & Theme workspace** for the merchant: current theme, preview, Customize, Publish | Missing. "Online store" opens the landing builder | v1 | No |
| G2 | **Theme library for merchants**: browse, preview with own products, apply; locked by plan/package | Exists only in super admin | v1 | No |
| G3 | **Global style**: colours (start from the brand colours in Settings), fonts (incl. a Bangla font), button and corner style, page width | Brand colours saved but unused | v1 | Yes (how many options) |
| G4 | **Header and menu**: announcement bar, logo position, main menu editor (links to categories, pages, offers), search, cart, language switch | Missing; no menu editor | v1 (mega menu: Later) | Yes |
| G5 | **Footer**: columns and links, contact, social links, payment and delivery marks (images already in Media), copyright | Text fields only (footer about, copyright) | v1 | Yes |
| G6 | **Page templates**: Home, Category, Product, Content page | Missing | v1 (Search results, 404: Later) | Yes |
| G7 | **Home sections**: hero/slider, category tiles, product grid or carousel (by category, new, best sellers, offers), offer banner, countdown, reviews, brand logos, blog posts, rich text, video | Exists only as names on super-admin cards and as landing-builder parts | v1 (about 10 kinds) | Yes |
| G8 | **Product page options**: gallery layout, variant picker style, sticky Add to cart on phones, spec table (from product templates), warranty, delivery charge, COD and return note, related products, reviews | Missing (the product data exists) | v1 | Yes |
| G9 | **Category page options**: grid columns, filters (product-template fields already carry a `filter` flag), sort, products per page | Missing | v1 (quick view: Later) | Yes |
| G10 | **Content pages**: About, Contact, Refund/return, Privacy, Terms (payment gateways and ad platforms usually ask for these) | Terms and privacy text exist (versioned, Settings › Privacy) but no store pages; no page editor | v1 (reuse that text) | No |
| G11 | **Draft, preview, publish, undo**: edit a draft, preview on phone and desktop, publish, go back to the last published version | Exists for the landing builder and for super-admin releases, not for a store's theme | v1 | No |
| G12 | **Merchant editing switches enforced**: the customizer only offers what super admin allows for that theme | Switches saved, not read | v1 | No |
| G13 | **Customer pages follow the theme**: Offers, Offer detail, Checkout use the theme's colours, fonts and logo | Colours written into each page | v1 | No |
| L1 | Customer account (orders, addresses, wishlist) | Missing | Later | — |
| L2 | Reviews workspace for merchants (moderate, reply, show on product pages) | Missing (Google reviews only, in Marketing) | Later | — |
| L3 | Custom CSS and theme code editing | Super admin keeps them off by default | Later | — |
| L4 | Shared parts between landing builder and theme sections (one block library) | Two separate sets | Later | Yes |
| L5 | Ready-made presets / demo import (WoodMart style) | Missing | Decide in Step B | Yes |
| L6 | Bangla translation of store content (menus and labels are v1 under G4) | Missing | Later | — |

## 3. Conflicts to settle (flagged, not decided)

1. **Menu naming.** "Online store" currently means the landing builder. Proposal: "Online store" becomes the theme
   workspace (G1) and the builder is renamed "Landing pages" under the same area. Changes Mostafiz vai's menu, so it needs
   his OK.
2. **Padma (wholesale theme).** Wholesale is switched off in the build (`WHOLESALE = false`). Padma stays in the super
   admin library but is not offered to merchants in v1.
3. **Brand colours in two places.** Settings › General keeps the brand colour for invoices; the theme gets its own
   colours, starting from the brand colour. Alternative: one colour setting for both. Decide in Step B.
4. **Scope ceiling.** Everything here is front end with demo data, like the rest of the build. Real theme files,
   rendering a live store on a merchant's domain, and publishing to customers are Bablu vai's backend work.

## 4. What Step B must answer before any of the "Step B = Yes" rows are built

- Modular (sections and blocks), WoodMart style (one theme, large options panel, demo imports), or a hybrid.
- How many options per section: a short, opinionated set or a full panel.
- Whether themes differ by layout and sections (each family has its own) or only by presets over one shared engine.
- Whether landing-page parts and theme sections share one library (L4).

## 5. Proposed v1 cut (for agreement)

v1 = G1–G13. Later = L1–L6. Step D builds only the agreed v1 rows, front end only, on branch `nayeem/storefront-themes`,
with Home, Category and Product previews on demo data.
