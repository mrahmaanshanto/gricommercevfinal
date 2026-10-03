# Building the new features from Nayeem's briefs: rules for the parallel run (Oct 2026)

Eight agents build, at the same time and in one working tree, the features Nayeem's briefs ask for that the app does
not have yet. Their list is in `docs/proposal-vs-build.md`, in the "New capabilities" tables, on the rows marked
"Not built". Every agent follows these rules.

## What to read first
1. `AGENTS.md`: the project rules (front end only, demo data in localStorage, editions, roles, Bangla).
2. `docs/shopify-style.md`: the approved page style. Every new or changed screen follows it. Use the kit in
   `src/components/ui/IndexKit.jsx` and its classes at the end of `src/styles/design-system.css`. The reference pages
   are `MerchantOrders.jsx`, `AllProducts.jsx` and `Home.jsx`.
3. Your briefs. Nayeem's originals are HTML files in `/Users/mostafiz/Downloads/Grid Commerce Review - Nayeem/`,
   one per brief. For your brief numbers, also read the matching section in `docs/proposal-vs-build.md`
   ("Area by area" → "#N …": screen by screen, new capabilities, built differently).

## How to build
- **Logic** goes in `src/lib/` (new files are fine), kept in localStorage like the existing libs. Use the existing
  libs (`orders.js`, `stock.js`, `ledger.js`, `customers.js` …) rather than copying them.
- **No backend.** Where a brief needs a server (real sending, real payments, idempotency across devices), build the
  front-end model and the UI. The demo behaves as if the server answered. Say so in a code comment, never in the UI.
- **Screens.**
  - Put new features into the existing page where they belong.
  - Add a new route only when the brief asks for a new workspace or a record page.
  - A new route needs `src/app/(merchant)/<route>/page.jsx` and its screen at `src/screens/<folder>/<Name>.jsx`.
  - Don't edit `registry.js`, `navigation.js`, `edition.js` or `team.js`. Agent A owns those and the lead adds your
    menu entries. List them in your report.
- **UI copy** is short and plain (Shopify style), and order text is short. One word per idea: see
  `docs/terminology.md`.
- **Keep everything that works today.** Add to it. Don't remove features or change behaviour that isn't in your list.

## Files
- Only edit the files your brief lists as yours. You may also create new files under `src/lib/`,
  `src/screens/<your folders>/` and `src/app/(merchant)/<new route>/`, as long as the names can't clash with
  another agent's.
- These files are off-limits (the lead edits them after the run, from your report):
  - `src/styles/design-system.css`, `src/components/ui/**`, `src/lib/i18n/bn.js`, `src/screens/registry.js`;
  - `AGENTS.md`, `docs/**` (except this file, read-only), `next.config.mjs`, `package.json`.
  - Put CSS in your screen's own `CSS` const.
- If you need a change in another agent's lib, don't make it. Add a small function in a new lib of your own that
  reads theirs, or ask for the change in your report.

## Checking
- Do NOT run `npm run build`, `npm run dev`, `pattern` or `convert`, and don't start or stop the shared servers.
- Don't use git to change anything, and don't commit.
- Syntax: `node scripts/check-jsx.mjs <your files>`. Tokens: `npm run check:screens`.
- Pages: the dev server is at http://localhost:3000. Read pages with curl.
  - For a real browser, run your own headless Chrome on port 94NN, where NN is your agent number (A=01 … H=08), with
    a profile folder named after you.
  - Never use the shared browser pane, another agent's port, or `?edition=` (it is stored in that browser).
- Put your scratch files in `scratchpad/<your letter>-*`.

## Report (your final reply)
1. Features built, one line each: where they live (route and files), and how to try them.
2. Features you could not build or only partly built, and why.
3. New routes, with the area and the module each belongs to (for the menu).
4. New English UI strings (for Bangla).
5. Requests to other owners' files.
6. Doubts.
