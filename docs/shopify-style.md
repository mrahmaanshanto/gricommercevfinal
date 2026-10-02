# Shopify-style pages: the rulebook

Approved on 3 Oct 2026, after a trial on Home, Orders and Products. Every merchant page follows these rules.

**The aim.** Build the UX exactly like Shopify's admin, but keep GridCommerce's font, colours and shadow style. What
changes is spacing, card size, type size and icon size. The other thing that changes is how much a page shows: **a
page shows the main thing; whoever needs more clicks through to the record.**

**Reference implementations** (copy their patterns):

| Kind of page | File | Route |
|---|---|---|
| List page | `src/screens/merchant-orders/MerchantOrders.jsx` | `/merchant-orders` |
| List page | `src/screens/products/AllProducts.jsx` | `/all-products` |
| Overview / dashboard | `src/screens/merchant-overview/Home.jsx` | `/merchant-overview` |

**Building blocks.** `src/components/ui/IndexKit.jsx` provides:
- `ShopHeader` and `RecordHeader` (title rows);
- `MetricStrip` and `Spark` (key figures);
- `IndexTabs`, `SearchField`, `Pager` and `LearnMore` (list card parts);
- `Menu` and `Act` (menus and buttons);
- `KV` (label / value rows).

Their styles are under "Index kit" at the end of `src/styles/design-system.css`. The same file sets the Shopify
density for every shared class. Shopify references on Mobbin:
- [Home](https://mobbin.com/screens/a14400bb-6617-4890-af09-01c012c69998)
- [Orders](https://mobbin.com/screens/2f59c8fc-2374-4fc4-9157-0767616b7f74)
- [Products](https://mobbin.com/screens/5f122fb7-7cef-4372-97c1-b9598df21c3d)

**Kit additions** (3 Oct, from the first agents' requests):
- `Menu`'s list is now drawn on the page body, so ⋯ menus inside cards, tables and the bulk bar are never cut off. Per-row
  ⋯ menus are fine.
- `MetricStrip` items take `onClick` (plus `on` for the pressed look), so a figure can filter the list.
- `RecordHeader` takes `onBack` for a guarded back, such as "discard changes?".
- New classes:
  - `ix-table--static`: a record's table, not clickable and wrapping. Add `ix-table-wrap--show` on its wrapper so it
    stays on phones.
  - `button.ix-pitem` and `button.ix-strong`: rows and identifiers that open a dialog or side panel.
  - `ix-chip` (with `aria-pressed`) inside `ix-chips`: toggle pills.
  - `ix-card--open`: a card that lets its dropdowns spill out.
  - `ix-card__sub`: a sub-line under a card's h2.
  - `ix-sum`: a totals `<dl>`; give the total row's `dt` and `dd` the `is-total` class.
  - `ix-date`: a small date input.

  Prefer these over local stand-ins.

## 1. Sizes (the design system already does this; don't fight it)

- **Controls.** Buttons, inputs and selects are 32px tall on a desktop and 44px on phones (`--control-height`). Small
  buttons are 28px. In kit markup use `ix-btn`, `ix-btn--sm`, `ix-btn--primary`, `ix-btn--plain` and
  `ix-btn--icon`. Existing `gc-btn` buttons are already resized.
- **Icons.** 16px in buttons, toolbars and lists. 18px only beside a page title. Never 20–24px icon tiles in lists or
  figures.
- **Type.**
  - Page title: 20px, weight 600 (`ix-head__title`).
  - Body text and table cells: 13px.
  - Table headers, labels, helper text and badges: 12px.
  - Figures: 14px, weight 600 (`ix-metric__value`).
  - Nothing above 20px on a working page. The Home greeting (24px) is the only exception.
- **Spacing.**
  - 16px between cards (`ix-page` gap).
  - 12–16px inside cards (`ix-card__body`, `ix-card--pad`).
  - Table rows are 40px; table headers are 36px.
  - No inline `padding: 28px`, `gap: 24px` or similar on new markup.
- **Cards.** `ix-card`: soft shadow (`--shadow-card`), 12px corners, no border.
- **Colours.** Tokens only. `npm run check:screens` must pass.
- **Badges.** `StatusBadge` from `components/ui`, which is 20px tall. Use one badge per meaning, and at most two
  badges per row.

## 2. Page kinds

Every page keeps the shell exactly as it is:

```jsx
<div className="gc-shell"><Sidebar active=…/><main className="gc-shell__main"><Topbar …/><div className="gc-shell__content"> … </div></main></div>
```

Inside `gc-shell__content`, use one `<div className="ix-page">` (or `ix-page ix-page--narrow` for Home-like pages,
forms and settings).

### List page (anything whose main content is a table or a list of records)
Build it in this order:
1. **`ShopHeader`.**
   - A small icon and the title.
   - `secondary`: one or two quiet actions, such as Export or Import.
   - `more`: links to related pages and rarely used actions.
   - `primary`: one primary action, such as Create order or Add product.
   - `about`: the page's longer explanation, which Help reads. Keep the text that was in the page's `PageHeader`
     about or description.
2. **Optional `MetricStrip`.**
   - At most 5 figures, with no icons.
   - Only when the figures help someone decide what to do on this list.
   - Delete stat cards that only repeat the tab counts.
3. **One `ix-card`, containing in order:**
   - **`ix-bar`.** `IndexTabs` holds the status views and their counts. The `ix-tools` slot on the right holds a search
     icon button. Tapping it swaps the tabs for a `SearchField` plus Cancel. Cancel clears the search and filters.
   - **`ix-filters`.** Shown while searching. Each filter is a dashed-pill `<select className="ix-filter">`, which gets
     `is-set` when used. Add "More filters" if the page has a dialog for them, and "Clear all".
   - **`ix-bulk`.** Replaces the bar while rows are selected. Show the count, 2–3 small buttons, and a `Menu` (⋯) for
     the rest, including anything destructive.
   - **The table.** `<table className="ix-table gc-table--keep">` inside `ix-table-wrap`.
   - **The phone list.** An `ix-plist` (`ix-pitem`: top line = name + amount or status, middle line = 1–2 facts,
     optional tags line). On phones it replaces the table.
   - **`Pager`.** Or `<div className="ix-foot">` with the count.
4. **`<LearnMore topic="…" />`.**

**What a list row shows.** The main thing only:
- the identifier (name, number);
- the date;
- who (customer, supplier, staff);
- the amount;
- one or two statuses;
- one count.

That is 5–8 columns at most. Everything else (phone, address, courier, SKU, notes, secondary dates, breakdowns, per-row
action-button clusters) moves to the record. A click anywhere on the row opens the record. Keep a link on the
identifier.

Per-row buttons are allowed only when there is no record page to open. Then there is one small `ix-btn--sm` or a ⋯
`Menu`.

### Record page (an order, a supplier, a staff member, a purchase order …)
- **`RecordHeader`.**
  - `back` points to the list.
  - The title.
  - `badges`: 1–3 `StatusBadge`s.
  - `meta`: one line, such as "Placed 2 Oct · Facebook".
  - `secondary`, `more` and `primary`, as on a list page.
- **`<div className="ix-record">` with `ix-main` and `ix-side`.**
  - `ix-main`: the work, as cards in the order the work happens (items, payment, fulfilment, activity).
  - `ix-side`: facts (customer, notes, tags) in small cards with `KV` rows.
- Each card is `ix-card` with an `ix-card__head` (an `h2` plus at most one link or button) and an `ix-card__body`.

### Form, settings and create page
- `ix-page ix-page--narrow`, with `RecordHeader` (`back` + title). The primary Save goes in the header unless the page
  already has a sticky save bar or a `PhoneActionBar`; keep those.
- Group fields into `ix-card`s with a short `h2`. Two columns of fields at most. Field help stays behind "Show field
  tips" or an `InfoTip`.

### Overview / dashboard page (area home, report hub)
- Like Home: a row of key figures (no icons), the to-dos as short pills, then 1–2 cards (one chart, one short list).
- At most 5 rows per list, with a "View all" link. Remove sections that repeat another page.

## 3. Keep, never break

- **All logic stays.** Keep data, handlers, URL query parameters, dialogs, sheets, toasts, `confirmDialog`,
  `ManagerPin` and keyboard support. Change the markup (and that screen's own `CSS` const), not `src/lib/*`.
- **Features move; they are not removed.** A dropped column or button moves to the record, into "More actions", into
  the filter row or into the bulk ⋯ menu. If something truly has no other home, keep it.
- **What must stay as it is:**
  - the `data-screen` attribute;
  - the `Sidebar` `active` id;
  - the `Topbar` `crumb` and `page` props;
  - one `<h1>` per page.
- **Bangla.** Visible strings are translated by matching whole English strings in `src/lib/i18n/bn.js`. Reuse existing
  wording where you can. List every new English UI string in your report, and the lead adds the Bangla. Never select
  elements by their visible text, placeholder or aria-label.
- **Phones (390px).**
  - Nothing may be wider than the screen.
  - Lists use `ix-plist`.
  - Header buttons fold into ⋯ by themselves.
  - Put screen-specific phone rules in the screen's CSS inside `@media (max-width:640px)`.
- **Tidy up.** Delete CSS, helpers and imports that the new markup no longer uses. Don't leave dead code. Old
  generated CSS often contains global rules such as `body{…}` or `.btn{…}`. Drop them when the markup no longer uses
  them, because they leak into other pages.

## 4. Working rules for parallel work

- **Edit only your own screen files.** Do not edit:
  - `src/styles/design-system.css`, `src/components/**` or `src/shell/**`;
  - `src/lib/**` or `src/screens/registry.js`;
  - `AGENTS.md`, `docs/**` (except your report) or `next.config.mjs`;
  - another agent's files.

  If you need something in the kit, write it in your screen's `CSS` const for now and ask for it in your report.
- **Do not run** `npm run build`, `npm run dev`, `npm run pattern` or `npm run convert`, and do not start servers. Do
  not commit and do not use git to change files.
- **Check your work:**
  - `node scripts/check-jsx.mjs <your files>` (syntax);
  - `npm run check:screens` (design tokens; it reads every screen, so ignore problems in files that aren't yours);
  - read your markup against this rulebook.
- **Report back:**
  - the files you changed;
  - per page, what you removed from the main view and where it lives now;
  - new English strings;
  - kit requests;
  - anything you were unsure about.
