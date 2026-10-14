// orderDrafts — orders saved half-made from Create order ("Save as draft"), as in Shopify's Drafts.
// A draft keeps what was typed: customer, products, discount, delivery, VAT, payment terms, status, notes and tags.
// Orders › Drafts lists them; /new-order?draft=<id> opens one again; placing the order removes it.
// Front end only: kept in this browser (gc.orders.drafts). Read in the browser only (after mount).

export const DRAFTS_KEY = 'gc.orders.drafts';
export const DRAFTS_EVENT = 'gc:order-drafts';

const ssr = () => typeof window === 'undefined';
function read() {
  if (ssr()) return [];
  try { const v = JSON.parse(window.localStorage.getItem(DRAFTS_KEY)); return Array.isArray(v) ? v : []; } catch { return []; }
}
function write(list) {
  try { window.localStorage.setItem(DRAFTS_KEY, JSON.stringify(list)); window.dispatchEvent(new CustomEvent(DRAFTS_EVENT)); } catch { /* storage blocked */ }
}

/** Every draft, the last saved first. */
export const getDrafts = () => read().slice().sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
export const getDraft = (id) => read().find((d) => d.id === id) || null;
export const draftCount = () => read().length;

/** The next draft number: D-1001, D-1002 … (never reused while drafts exist). */
function nextId(list) {
  const top = list.reduce((n, d) => Math.max(n, parseInt(String(d.id).replace(/\D/g, ''), 10) || 1000), 1000);
  return 'D-' + (top + 1);
}

/**
 * Save the Create order form as a draft. `form` = { customer, lines, discount, delivery, vat, terms, advance, method,
 * status, note, tags, total }. With `id` the draft is updated in place; otherwise a new one is made. Returns the draft.
 */
export function saveDraft(form, id) {
  const list = read();
  const at = Date.now();
  const old = id ? list.find((d) => d.id === id) : null;
  const draft = { ...form, id: old ? old.id : nextId(list), createdAt: old ? old.createdAt : at, savedAt: at };
  write(old ? list.map((d) => (d.id === old.id ? draft : d)) : [draft, ...list]);
  return draft;
}

export function deleteDraft(id) { write(read().filter((d) => d.id !== id)); }

/** One line for the products of a draft: "2 × Redmi Note 13, 1 more". */
export function draftItems(d) {
  const lines = (d && d.lines) || [];
  if (!lines.length) return 'No products';
  const first = lines[0];
  return `${first.qty} × ${first.name}${lines.length > 1 ? `, ${lines.length - 1} more` : ''}`;
}
