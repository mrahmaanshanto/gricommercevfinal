# GridCommerce — merchant web app (front end)

Front-end only. There is no backend, database or API: every screen runs on the demo data written
into its own logic, exactly as in the design. The screens come from the design canvas
**GridCommerce · Merged** (279 boards on 22 canvas pages) and are built with **Next.js 16 (App Router)**
and **React 19**.

```bash
npm install
npm run dev        # http://localhost:3000 — the index lists every screen
npm run build      # production build; every route is prerendered as static HTML
```

## Layout

```
design/                     The design canvas as exported: read-only reference, not shipped.
  templates/<module>/<Page>.dc.html   one file per board (markup + logic)
  templates/_shell/                   the original <gc-sidebar> / <gc-topbar> elements
  tokens/, css/, ds/                  design tokens and component recipes
  assets/                             uploaded images (+ the Lucide build the canvas used)
  canvas.json                         board titles, sizes and canvas pages

scripts/convert-design.mjs  Converts design/templates into src/screens + src/app routes.

src/
  app/
    layout.jsx              <html>, fonts, global styles, client-side navigation bridge
    page.jsx                "All screens" index grouped by canvas page
    (merchant)/<route>/     merchant app screens (Home, Orders, Products, Accounts, …)
    (auth)/                 sign in, onboarding
    (pos)/                  POS register screens (own frame + screen switcher)
    (settings)/             settings screens (own frame + screen switcher)
    (storefront)/           customer-facing offers and checkout
    (dev-reference)/        UI kit, icon set, flows, developer reference
    (platform-console)/     GridCommerce's own admin console (out of scope for this build)
    (phone-app)/            phone app screens (deferred)
  screens/<module>/<Page>.jsx   one React component per board — edit these
  screens/registry.js       every screen: route, title, canvas page, design size
  shell/
    navigation.js           the left menu (groups, items, sub-items, counts, targets)
    gc-sidebar.js, gc-topbar.js   shared menu and top bar (custom elements, shadow DOM)
    Shell.jsx               React wrappers, POS / Settings switchers, POS stage fit
  runtime/
    dc.jsx                  DCLogic base class, <Icon>, dynamic links, style helpers
    routes.js               design file name -> route, asset URLs, client navigation
  styles/
    design-system.css       tokens + gc-* component recipes (from design/tokens, design/css)
    globals.css             base element styles (scoped), switcher styles
public/assets/              images referenced by the screens
```

Route groups in parentheses don't appear in URLs.

## Routes

A board `templates/<module>/<PageName>.dc.html` is served at `/<kebab-page-name>`, for example
`MerchantOrders` → `/merchant-orders` and `SetupGA4` → `/setup-ga4`. Page names are unique across the
design, so the name alone identifies a screen. Links inside the screens (`Foo.dc.html`) were
rewritten to these routes and use client-side navigation.

Entry points: `/merchant-overview` (Home), `/merchant-sign-in`, `/merchant-onboarding`, `/site-map`
(the logo's target) and `/` (index of all screens).

## How a screen is built

Each `src/screens/<module>/<Page>.jsx` has three parts, all converted from the board:

1. **Logic** — the board's `class Component extends DCLogic` kept verbatim. `renderVals()` returns
   the values and handlers the markup uses; state changes go through `setState`.
2. **Styles** — the board's own CSS, injected while the screen is mounted.
3. **Markup** — a `render()` that returns JSX. `v` holds the result of `renderVals()`.

The template syntax became plain JSX:

| Design                              | Here                                              |
| ----------------------------------- | ------------------------------------------------- |
| `{{ path }}`                        | `{v.path}` (or the loop variable)                 |
| `<sc-if value="{{ x }}">`           | `{v.x ? (…) : null}`                              |
| `<sc-for list="{{ xs }}" as="x">`   | `{__list(v.xs).map((x, $index) => …)}`            |
| `<dc-import name="Card">`           | `<__Card />` imported from its screen file        |
| `<i data-lucide="search">`          | `<__Icon name="search" />`                        |
| `<a href="Foo.dc.html">`            | `<__Link href="/foo">` (Next.js Link)             |
| `style-hover="…"`                   | a generated `dc-h*` class with a `:hover` rule    |
| `<gc-sidebar>`, `<gc-topbar>`       | `<__Sidebar>`, `<__Topbar>` from `@/shell/Shell`  |

Screens that loaded the design system (`ds-base.js`) get the `ds` class, which applies the
token-based element defaults from `tokens/base.css`; other screens are unaffected, as in the design.

## Working on the UI

Edit the screen's `.jsx` directly: after conversion it is the source of truth.
`scripts/convert-design.mjs` regenerates **all** of `src/screens` and the route folders from
`design/`, so run it again only when importing a new export of the design, and only before
hand edits (or re-apply them).

The handoff notes (build order, data that must stay consistent, known gaps) are in the
Claude Code handoff doc that accompanies the design.
