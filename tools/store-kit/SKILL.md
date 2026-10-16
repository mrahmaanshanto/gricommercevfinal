---
name: gridcommerce-store-kit
description: Build a GridCommerce store design (a .gcstore.json store kit) from a shop's brief, check it, render it on the demo shop, fix what looks wrong, and deliver it. Use for the Custom store design service, new themes for the theme library, and "make my store look like …" requests.
---

# Building a GridCommerce store kit

A store kit is one JSON file that holds a whole store design: theme settings, headers, page layouts, HTML blocks,
menus, sample pages, store notices and block placements. The shop imports it from Online Store › Theme (a restore point
is made first), or GridCommerce delivers it through a design service order. A kit never holds products, customers or
orders, so it can be applied to any shop.

The format is described at the top of `src/lib/storefront/kit.js`. Every allowed value is in `tools/store-kit/VOCAB.md`
(regenerate it with `node tools/store-kit/check.mjs --vocab`). Three finished kits are in `src/lib/storefront/kits/`:
`signal` (electronics), `nokshi` (fashion) and `counter` (grocery and everyday retail).

## Inputs

Collect these from the brief or the service order before writing anything:

- **Shop:** what it sells, who buys, Bangla-first or English-first, price level (budget, mid, premium).
- **Brand:** logo colours (hex), any fonts. If only a logo is given, pick the primary colour from it.
- **References:** sites the owner likes, and what they like about each.
- **Must-haves:** banners, offers, delivery promises, branches, hotline, WhatsApp.
- **Tier:** Quick restyle about 30 minutes, Standard about 1 hour, Premium 2–3 hours. Stay inside the tier's time.

## Steps

1. **Start from the closest sample.** Copy the nearest kit from `src/lib/storefront/kits/` to `<shop>.gcstore.json` and set `meta`
   (`id`, `name`, `description`, `for`, `version`, `author`, `made`). Don't write from a blank file.
2. **Set the direction in three lines before editing:** the mood (calm premium, loud bazaar, playful, technical), the
   one thing the home page must sell first, and the one detail that makes this shop recognisable.
3. **Theme.** Set `primary`, `accent`, `text`, `bg`, `surface`, `sale`, then:
   - `fontPair`: `bangla` for Bangla-first shops, `elegant` for fashion and beauty, `inter` or `poppins` for tech,
     `friendly` for kids and grocery;
   - `corners` and `buttons`;
   - `cardRatio`: `portrait` for clothing, `square` for gadgets and grocery;
   - `colsDesktop`, `filters`.

   A whole-store style is one of the `STYLE_PRESETS` in VOCAB.md (clean, bold, soft, elegant, compact, bangla); start
   from its values, then change what the brief needs. Leave out every option that should stay at its default.
4. **Header.** Pick one main header and mark it `"default": true`. Keep 2–3 alternatives at most. Phones get
   their own `mobile` rows, a `drawer` and a `bottomNav`. Put the hotline or WhatsApp where this shop's customers expect it.
5. **Home layout.** Use 6–9 sections, in this order: hero → what to buy (category tiles or products) → proof (reviews,
   brands, trust) → offer → more products → newsletter or trust. Every title should read like the shop wrote it.
   Write no lorem ipsum.
   Give each section a `look` that fits the mood (every section's looks are in VOCAB.md): a calm premium shop might use
   hero `split`, products `panel`, reviews `quote`; a busy bazaar hero `overlay`, offer `strip`, trust `bar`. Don't use
   the same look twice in a row. Newer sections: `gallery` (look `lookbook` links pictures to products), `icons`,
   `testimonials` (only quotes the owner gave you, never invented), `locator` (`source: "branches"` uses the shop's own
   branches) and `social` (only pages the owner gave you).
   When no section or look can do what the brief needs (a trade-in steps strip, a size finder table, a branded
   countdown), write a **custom section** in `customs` (Premium design: up to 2): plain HTML and CSS with settings as
   `{{key}}`, then add `{ "type": "custom", "custom": "<id>", "values": { … } }` to a layout. No scripts, frames, forms
   or event handlers (they are taken out); the CSS only applies inside the section; use the store's colours through
   `var(--sf-primary)`, `--sf-accent`, `--sf-text`, `--sf-surface`, `--sf-soft`, `--sf-radius`. Make it work at 390 px.
6. **Other layouts.** `product`, `category`, `page`, `cart`, `search` and `404`, each with its `main` section, plus one
   condition layout if the brief needs a special category.
7. **Blocks.** Add delivery info, a size guide or warranty tab (`tab` blocks), a mega-menu column (`mega`) and an
   offer banner (`banner`).
8. **Menus.** One header menu. Give the biggest category a mega menu with 2–5 columns. Add footer menus. Link pages by
   their address (`"ref": "about-us"`).
9. **Shop details.** Write the shop's own details as tokens: `{{shop_name}}`, `{{shop_phone}}`, `{{whatsapp}}`,
   `{{shop_email}}`, `{{shop_address}}`, `{{shop_hours}}`. They are filled in when the kit is applied, which keeps the
   kit reusable.
10. **Check.** Run `node tools/store-kit/check.mjs <file>`. Fix every ERROR. Read every warning and either fix it or
    say why it stays.
11. **Render and look.** Start the app, then run
    `node tools/store-kit/render.mjs <file> --url http://localhost:3000 --out kit-shots`. Open the screenshots: computer
    and phone, Home, category, product, cart. Fix and re-render until all of these hold:
    - the first screen sells the shop's main thing;
    - text is readable on every colour (the check also warns about contrast in the theme editor);
    - the phone header is not crowded: at most 3 icons in the main row;
    - no empty sections, no sample text, nothing cut off.
12. **Deliver.** For a service order, upload the file to the order (super admin › Services › the order ›
    Deliver store kit). For the theme library, add it to Storefront themes. Write two lines for the owner: what the
    design does, and what they can change themselves (Theme › Customize, Layouts, Header builder).

## Rules

- **Keep it valid.** Only values from VOCAB.md. Ids are short words (`a-z`, `0-9`, `-`). Text has no HTML and no
  scripts: use `**bold**`, `*italic*` and `[link](/offers)`.
- **Pictures:** use `/assets/…` (the shop's own) or `https://` addresses. Inline `data:` images only when small (under
  400 KB each; the whole kit stays under 2 MB).
- **Bangla:** Bangla-first shops get Bangla titles and buttons.
- **Prices and delivery promises** come from the brief, never invented. Leave a section out rather than guess.
- **Readability:** text on `primary` and `sale` must stay readable (white or near-black text is chosen
  automatically); avoid light primaries on white.
- **Plan locks:** custom CSS (`customCss`, `css`) is Business-plan only and should be rare.
- **Don't touch the shop's data:** a kit never changes products, categories, customers or orders. If the design needs a
  category the shop doesn't have, say so in the delivery note.
