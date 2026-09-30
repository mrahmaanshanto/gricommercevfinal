<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# GridCommerce front end

- Front end only: no backend, database or API. Screens run on the demo data in their own logic.
- `src/screens/<module>/<Page>.jsx` is the source for each screen; edit it directly. It was
  generated from `design/templates/<module>/<Page>.dc.html` by `scripts/convert-design.mjs`.
  Re-running the converter overwrites every screen and route, so don't run it after hand edits.
- `design/` is the read-only design export (reference only).
- Shared shell: `src/shell/navigation.js` (menu), `gc-sidebar.js`, `gc-topbar.js`, `Shell.jsx`.
- Routes are `/<kebab-page-name>`; `src/screens/registry.js` lists every screen.
- Check changes with `npm run build` (prerenders every route) and by loading the screen.
