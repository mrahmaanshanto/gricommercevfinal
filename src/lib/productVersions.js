// productVersions — version history, edit locks and price approvals for products (Nayeem's Product brief #1 ›
// "Two staff edit same product: optimistic-lock warning", "Bulk price update is wrong: audit/history and rollback",
// and approval for big price changes).
//
//   Versions   every save keeps a copy of the product (products.js › saveProduct calls recordVersion): who, when,
//              what changed, and a note ("Bulk edit JOB-0003", "Restored version 4"). versionsOf(id) newest first;
//              any version can be viewed and restored (restoring saves it as a new version).
//   Edit locks openEdit(id, user) marks the product as open by that user (a heartbeat every 30 s while the form is
//              open); editorsOf(id, me) lists other people who have it open now. The demo also shows a colleague on
//              the Hyaluronic Toner page. A save also checks the version the form was opened at (staleSince): if
//              someone saved after that, the form asks before overwriting.
//   Approvals  a price change of more than priceLimit() % (default 20) needs a manager: approved on the spot with the
//              manager PIN, or saved as a request (requestPrice) that waits on the product page.
// Front end only (localStorage). In a real build the server owns the lock and the version number; the demo behaves as
// if it did, and other tabs see changes through the storage event.

import { currentUser } from './team';

const VERS = 'gc.products.versions';
const LOCKS = 'gc.products.locks';
const APPROVALS = 'gc.products.priceApprovals';
const LIMIT = 'gc.products.priceLimit';
export const VERSIONS_EVENT = 'gc:product-versions';
const MAX = 25;
const FRESH = 90 * 1000;   // a lock without a heartbeat for 90 s is stale

const ssr = () => typeof window === 'undefined';
const readJson = (k, d) => { if (ssr()) return d; try { const v = JSON.parse(window.localStorage.getItem(k)); return v == null ? d : v; } catch { return d; } };
const writeJson = (k, v) => { try { window.localStorage.setItem(k, JSON.stringify(v)); window.dispatchEvent(new CustomEvent(VERSIONS_EVENT)); } catch { /* ignore */ } };

// fields compared to say what changed (labels as the form shows them)
const FIELDS = [['name', 'Title'], ['price', 'Selling price'], ['mrp', 'MRP'], ['cost', 'Cost'], ['wholesale', 'Wholesale price'], ['moq', 'Minimum order'], ['sku', 'SKU'], ['barcode', 'Barcode'],
  ['st', 'Status'], ['cat', 'Category'], ['brand', 'Brand'], ['tags', 'Tags'], ['short', 'Short description'], ['long', 'Long description'], ['seoT', 'Page title'], ['seoD', 'Meta description'],
  ['unit', 'Unit'], ['packs', 'Packs'], ['ids', 'Identifiers'], ['template', 'Template'], ['data', 'Specifications'], ['format', 'Format'], ['oversell', 'Pre-order'], ['backorder', 'Backorder'],
  ['giftOnly', 'Gift only'], ['bundle', 'Bundle'], ['variants', 'Variants'], ['digital', 'Download']];
const same = (a, b) => JSON.stringify(a == null ? null : a) === JSON.stringify(b == null ? null : b);
/** Labels of the fields that differ between two versions of a product. */
export const changedFields = (a, b) => FIELDS.filter(([k]) => !(a && a.partial && !(k in a)) && !same((a || {})[k], (b || {})[k])).map(([, l]) => l);

const DEMO_BY = 'Jannatul Ferdous';
const vAt = (d, h, m) => new Date(2026, 8, d, h, m).getTime();
// Two older versions for the phone so the history is not empty in the demo.
const SEED = {
  'p-phone-5gp': [
    { v: 2, at: vAt(26, 15, 40), by: 'Farhana Yasmin', note: '', changes: ['Selling price', 'MRP'], rec: { partial: true, id: 'p-phone-5gp', name: '5G Smartphone Pro 256GB', price: 64990, mrp: 74999, cost: 56200, st: 'active' } },
    { v: 1, at: vAt(14, 11, 5), by: DEMO_BY, note: 'Created', changes: [], rec: { partial: true, id: 'p-phone-5gp', name: '5G Smartphone Pro 256GB', price: 66990, mrp: 74999, cost: 56200, st: 'draft' } },
  ],
};
const allVersions = () => ({ ...SEED, ...readJson(VERS, {}) });

/** Versions of one product, newest first: [{ v, at, by, note, changes, rec }]. */
export const versionsOf = (id) => (allVersions()[id] || []).slice().sort((a, b) => b.v - a.v);
export const latestVersion = (id) => (versionsOf(id)[0] || null);

/** Keep a copy of a saved product. Called by products.js › saveProduct. Returns the new version number. */
export function recordVersion(rec, { by, note } = {}) {
  if (!rec || !rec.id || ssr()) return 0;
  const all = allVersions();
  const list = all[rec.id] || [];
  const prev = list.slice().sort((a, b) => b.v - a.v)[0];
  const changes = prev ? changedFields(prev.rec, rec) : [];
  if (prev && !changes.length && !note) return prev.v;    // nothing changed: no new version
  const v = (prev ? prev.v : 0) + 1;
  const copy = JSON.parse(JSON.stringify(rec));
  const next = [{ v, at: Date.now(), by: by || currentName(), note: note || (prev ? '' : 'Created'), changes, rec: copy }, ...list].sort((a, b) => b.v - a.v).slice(0, MAX);
  writeJson(VERS, { ...readJson(VERS, {}), [rec.id]: next });
  return v;
}

// who is signed in (team.js keeps the demo session)
function currentName() { try { return currentUser().name; } catch { return 'Staff'; } }

// ---- edit locks ----------------------------------------------------------------------------------------------
// The demo colleague: Jannatul (content) has Hyaluronic Toner open, unless you are Jannatul or you took it over.
const DEMO_OPEN = { 'p-toner-150': { id: 'jannatul', name: DEMO_BY } };
const TAKEN = 'gc.products.lockTaken';
/** Mark a product as open in the form by `user` ({ id, name }). Call again every 30 s while it stays open. */
export function openEdit(productId, user, tab) {
  if (!productId || !user || ssr()) return;
  const all = readJson(LOCKS, {});
  const list = (all[productId] || []).filter((x) => Date.now() - x.at < FRESH && x.tab !== tab);
  list.push({ id: user.id, name: user.name, at: Date.now(), tab });
  all[productId] = list;
  writeJson(LOCKS, all);
}
export function closeEdit(productId, tab) {
  if (!productId || ssr()) return;
  const all = readJson(LOCKS, {});
  all[productId] = (all[productId] || []).filter((x) => x.tab !== tab);
  writeJson(LOCKS, all);
}
/** Other people who have this product open now (not `me`, not this tab): [{ id, name, at }]. */
export function editorsOf(productId, me, tab) {
  if (!productId) return [];
  const live = (readJson(LOCKS, {})[productId] || []).filter((x) => Date.now() - x.at < FRESH && x.tab !== tab && (!me || x.id !== me.id));
  const demo = DEMO_OPEN[productId];
  const taken = readJson(TAKEN, {})[productId];
  if (demo && (!me || me.id !== demo.id) && !taken && !live.some((x) => x.id === demo.id)) live.push({ id: demo.id, name: demo.name, at: Date.now() - 2 * 60 * 1000, demo: true });
  return live;
}
/** "Edit anyway": the demo colleague's lock is set aside for this product. */
export const takeOver = (productId) => writeJson(TAKEN, { ...readJson(TAKEN, {}), [productId]: Date.now() });

/** Has someone saved this product since the form opened it at version `v`? The newer version, or null. */
export function staleSince(productId, v) {
  if (!productId || v == null) return null;
  const top = latestVersion(productId);
  return top && top.v > v ? top : null;
}

// ---- price approvals ---------------------------------------------------------------------------------------
export const priceLimit = () => { const n = Number(readJson(LIMIT, 20)); return n > 0 ? n : 20; };
export const setPriceLimit = (n) => writeJson(LIMIT, Math.max(1, Math.round(Number(n) || 20)));
/** The % change from `from` to `to`, or 0 when there was no price. */
export const priceChangePct = (from, to) => (Number(from) > 0 && Number(to) > 0 ? Math.round(Math.abs(to - from) / from * 1000) / 10 : 0);
export const needsPriceApproval = (from, to) => priceChangePct(from, to) > priceLimit();

const readApprovals = () => readJson(APPROVALS, []);
export const priceRequests = (productId) => readApprovals().filter((r) => (!productId || r.productId === productId));
export const openPriceRequests = (productId) => priceRequests(productId).filter((r) => r.status === 'waiting');
/** Ask for a price change: { productId, name, field ('price' | 'wholesale'), from, to, by }. */
export function requestPrice(req) {
  const list = readApprovals();
  const id = 'PRC-' + String(list.length + 1).padStart(4, '0');
  const row = { id, at: Date.now(), status: 'waiting', field: 'price', ...req };
  writeJson(APPROVALS, [row, ...list.map((r) => (r.productId === req.productId && r.field === row.field && r.status === 'waiting' ? { ...r, status: 'replaced' } : r))]);
  return row;
}
export function decidePrice(id, ok, by, note) {
  const list = readApprovals().map((r) => (r.id === id && r.status === 'waiting' ? { ...r, status: ok ? 'approved' : 'rejected', decidedBy: by, decidedAt: Date.now(), note: note || '' } : r));
  writeJson(APPROVALS, list);
  return list.find((r) => r.id === id) || null;
}
