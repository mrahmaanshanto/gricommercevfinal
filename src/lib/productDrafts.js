// productDrafts — autosave and draft recovery for the product form (Nayeem's Product brief #1 › "Internet drops while
// creating product: autosave server/local draft and restore").
//
// While the Add / Edit product form has unsaved changes it writes them here every few seconds (one draft per product,
// 'new' for a product that has not been saved yet). Coming back to the form, a draft newer than the product's last save
// is offered: "Recover unsaved product work?" with Restore / Dismiss. Saving or discarding the form deletes the draft.
//
//   saveDraft(key, state) · draftFor(key, savedAt) → { at, state } or null · dropDraft(key) · AUTOSAVE_MS
// Front end only: gc.products.drafts in this browser (a real build would also keep a server copy).

const KEY = 'gc.products.drafts';
export const AUTOSAVE_MS = 5000;
const MAX_AGE = 14 * 864e5;   // drafts older than two weeks are dropped

const read = () => { if (typeof window === 'undefined') return {}; try { return JSON.parse(window.localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const write = (all) => { try { window.localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* ignore */ } };

/** Keep the form's state as the draft of `key` (the product id, or 'new'). */
export function saveDraft(key, state) {
  if (!key || typeof window === 'undefined') return 0;
  const all = read();
  const now = Date.now();
  Object.keys(all).forEach((k) => { if (now - all[k].at > MAX_AGE) delete all[k]; });
  all[key] = { at: now, state };
  write(all);
  return now;
}
/** The draft of `key` when it is newer than the product's last save (savedAt), else null. */
export function draftFor(key, savedAt) {
  const d = read()[key];
  if (!d || !d.state) return null;
  if (savedAt && d.at <= savedAt) return null;
  return d;
}
export function dropDraft(key) {
  const all = read();
  if (all[key]) { delete all[key]; write(all); }
}
/** "just now", "2 min ago", "at 14:05". */
export function agoText(t, now = Date.now()) {
  const s = Math.round((now - t) / 1000);
  if (s < 45) return 'just now';
  if (s < 3600) return Math.round(s / 60) + ' min ago';
  const d = new Date(t);
  return 'at ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
