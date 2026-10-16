// admin/snippetGuard — GridCommerce's kill switch for a store's code snippets (Batch C step 8). Super admin › merchant ›
// Modules › Code snippets turns every snippet of one store off (with a reason the merchant sees) or back on. Saved in
// this browser as gc.admin.snippets ({ [shopId]: { off, reason, by, at } }); the merchant side reads it read-only
// (lib/storefront/snippets.js › killOf), the same way theme switches are read (gc.admin.themes).

const KEY = 'gc.admin.snippets';
export const SNIPPET_GUARD_EVENT = 'gc:admin-snippets';
const read = () => { if (typeof window === 'undefined') return {}; try { return JSON.parse(window.localStorage.getItem(KEY)) || {}; } catch { return {}; } };
export const snippetGuardOf = (shopId) => read()[shopId] || { off: false };
export function setSnippetGuard(shopId, off, reason = '', by = 'Staff') {
  const map = read();
  map[shopId] = { off: !!off, reason: off ? String(reason || '').trim() : '', by, at: Date.now() };
  try { window.localStorage.setItem(KEY, JSON.stringify(map)); window.dispatchEvent(new CustomEvent(SNIPPET_GUARD_EVENT)); } catch { /* ignore */ }
  return map[shopId];
}
