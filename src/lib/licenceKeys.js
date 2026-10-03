// licenceKeys — digital licence products (Nayeem's Product brief #1 › "Digital Products": "Licence keys behave like
// digital serial inventory"). A licence product has a pool of keys; what can be sold is the number of free keys, and
// each sale takes one key per piece (stock.js › addMove calls takeKeys for a 'sale' move of a licence product, so
// the register and online orders assign keys without knowing about them). A returned or cancelled sale puts unused
// keys back; a key that failed can be replaced (the old one is kept, marked replaced, for the audit).
//
//   A key: { key, status ('free' | 'assigned' | 'replaced' | 'void'), ref, who, at, by, replacedBy }
//   keysOf(sku) · freeKeys(sku) · addKeys(sku, text) → { added, dupes } · takeKeys(sku, n, ref) → keys
//   releaseKeys(sku, ref, n) · replaceKey(sku, key, why, by) → new key or null
// Front end only: gc.products.licenceKeys. In a real build the server hands out keys so two tills never get the same
// one; the demo behaves as if it did.

const KEY = 'gc.products.licenceKeys';
export const LICENCE_EVENT = 'gc:licence-keys';
const at = (d, h) => new Date(2026, 8, d, h || 10).getTime();
const K = (key, status, ref, who, t) => ({ key, status, ref: ref || '', who: who || '', at: t || at(1), by: status === 'free' ? '' : 'System' });
const SEED = {
  'DG-AV-1Y': [
    K('GRID-AV1Y-7KQ2-M9XD-44PL', 'assigned', 'INV-0214', 'Mahmudul Karim', at(12, 15)), K('GRID-AV1Y-3TZ8-QW1R-90HN', 'assigned', '#136760', 'Shirin Akter', at(20, 11)),
    K('GRID-AV1Y-8PL5-ZC3V-11KM', 'free'), K('GRID-AV1Y-5RX9-HT2B-67QJ', 'free'), K('GRID-AV1Y-1MN4-YU8E-25WS', 'free'),
    K('GRID-AV1Y-6DF3-KP7A-38GT', 'free'), K('GRID-AV1Y-9BV1-LE6C-52XR', 'free'), K('GRID-AV1Y-2HJ7-NO4F-83YU', 'free'),
  ],
};

const read = () => { if (typeof window === 'undefined') return SEED; try { const v = JSON.parse(window.localStorage.getItem(KEY)); return v && typeof v === 'object' ? v : SEED; } catch { return SEED; } };
const write = (all) => { try { window.localStorage.setItem(KEY, JSON.stringify(all)); window.dispatchEvent(new CustomEvent(LICENCE_EVENT)); } catch { /* ignore */ } };

export const keysOf = (sku) => read()[sku] || [];
export const freeKeys = (sku) => keysOf(sku).filter((k) => k.status === 'free').length;
/** Hide most of a key: "GRID-AV1Y-••••-••••-44PL". */
export const maskKey = (k) => { const s = String(k || ''); return s.length <= 8 ? s : s.slice(0, 9) + s.slice(9, -4).replace(/[A-Z0-9]/gi, '•') + s.slice(-4); };

/** Add keys, one per line (or comma-separated). Keys already in any pool are skipped. */
export function addKeys(sku, text) {
  const all = read();
  const known = new Set(Object.values(all).flat().map((k) => k.key.toUpperCase()));
  const list = all[sku] ? all[sku].slice() : [];
  let added = 0, dupes = 0;
  String(text || '').split(/[\n,;]+/).map((x) => x.trim()).filter(Boolean).forEach((key) => {
    if (known.has(key.toUpperCase())) { dupes++; return; }
    known.add(key.toUpperCase()); list.push(K(key, 'free', '', '', Date.now())); added++;
  });
  write({ ...all, [sku]: list });
  return { added, dupes };
}
/** A sale takes n free keys (oldest first) for `ref`. Returns the keys given (fewer when the pool runs out). */
export function takeKeys(sku, n, ref, who) {
  const all = read();
  if (!all[sku]) return [];
  let left = Math.max(0, Math.round(Number(n) || 0));
  const given = [];
  const list = all[sku].map((k) => {
    if (!left || k.status !== 'free') return k;
    left--; const x = { ...k, status: 'assigned', ref: ref || '', who: who || '', at: Date.now(), by: 'System' };
    given.push(x); return x;
  });
  write({ ...all, [sku]: list });
  return given;
}
/** A cancelled or returned sale puts up to n of its keys back in the pool. */
export function releaseKeys(sku, ref, n) {
  const all = read();
  if (!all[sku] || !ref) return 0;
  let left = n == null ? Infinity : Math.max(0, Math.round(Number(n) || 0)), back = 0;
  const list = all[sku].map((k) => { if (left > 0 && k.status === 'assigned' && k.ref === ref) { left--; back++; return { ...k, status: 'free', ref: '', who: '', at: Date.now() }; } return k; });
  write({ ...all, [sku]: list });
  return back;
}
/** A key that does not work: give the customer the next free key; the old one stays on record as replaced. */
export function replaceKey(sku, key, why, by) {
  const all = read();
  const list = (all[sku] || []).slice();
  const i = list.findIndex((k) => k.key === key && k.status === 'assigned');
  const j = list.findIndex((k) => k.status === 'free');
  if (i < 0 || j < 0) return null;
  const old = list[i];
  list[j] = { ...list[j], status: 'assigned', ref: old.ref, who: old.who, at: Date.now(), by: by || 'Staff' };
  list[i] = { ...old, status: 'replaced', replacedBy: list[j].key, note: why || '', at: Date.now(), by: by || 'Staff' };
  write({ ...all, [sku]: list });
  return list[j];
}
