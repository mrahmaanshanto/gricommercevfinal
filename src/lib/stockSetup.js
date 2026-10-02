// stockSetup — the shop's inventory shape. One data model for every edition; the shape decides what the screens show:
//   mode      'one'   one stock place (the Online edition: no warehouses, branches, racks, transfers, counts, holds)
//             'many'  warehouses and branches (editions with the 'places' module)
//   homeId    the place online orders ship from and come back to (in 'one' mode, the only place) — by id, so a rename
//             keeps it (locations.js › onlinePlace() gives its name)
//   buying    'direct' (Purchases: buy, pay full or part, stock comes in at once) · 'orders' (purchase orders → receive in
//             parts, damage and exchange at receiving) · 'both'. Editions without the 'purchasing' module are always direct.
//   supplierChanges  goods from a direct purchase can go back to the supplier (Supplier return) — off when the supplier
//             takes nothing back after the sale
//   wholesale  wholesale price, MOQ and "sell to" on products (only with the 'wholesale' module)
//   edition   the edition the setup was made for: when the shop moves to another edition, Stock setup (/stock-setup)
//             asks again (name the online place, how you buy, merge stock into one place)
// Kept in this browser (gc.stock.setup). Leaf module: imports only edition.js.

import { currentEditionId, hasModule } from './edition';

const KEY = 'gc.stock.setup';
export const STOCK_SETUP_EVENT = 'gc:stock-setup';
export const DEFAULT_HOME_ID = 'cw';   // Central Warehouse
export const BUYING = [['direct', 'Direct purchase', 'Buy, pay full or part, and the stock comes in at once'], ['orders', 'Purchase orders', 'Order first, receive in parts, report damage or wrong items on arrival'], ['both', 'Both', 'Use whichever fits each purchase']];

const read = () => { if (typeof window === 'undefined') return null; try { const v = JSON.parse(window.localStorage.getItem(KEY)); return v && typeof v === 'object' ? v : null; } catch { return null; } };

/** One stock place in this edition (no 'places' module)? */
export const isOnePlace = (ed = currentEditionId()) => !hasModule('places', ed);

/** What a new shop in this edition starts with. */
export function defaultsFor(ed = currentEditionId()) {
  return { mode: isOnePlace(ed) ? 'one' : 'many', homeId: DEFAULT_HOME_ID, buying: hasModule('purchasing', ed) ? 'both' : 'direct', supplierChanges: true, wholesale: hasModule('wholesale', ed) };
}

/** The setup in use. What the edition allows always wins (an online-only shop is one place, buys direct, no wholesale). */
export function getStockSetup(ed = currentEditionId()) {
  const saved = read();
  const out = { ...defaultsFor(ed), ...(saved || {}) };
  out.mode = isOnePlace(ed) ? 'one' : 'many';
  if (!hasModule('purchasing', ed)) out.buying = 'direct';
  if (!hasModule('wholesale', ed)) out.wholesale = false;
  out.saved = !!saved;
  // the shop moved to another edition since the setup was made: ask again
  out.needsSetup = !!(saved && saved.edition && saved.edition !== ed);
  out.edition = ed;
  out.savedFor = saved ? saved.edition : null;
  return out;
}

export function saveStockSetup(patch, ed = currentEditionId()) {
  const next = { ...(read() || defaultsFor(ed)), ...patch, edition: ed, at: Date.now() };
  delete next.mode; delete next.saved; delete next.needsSetup; delete next.savedFor;
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); window.dispatchEvent(new CustomEvent(STOCK_SETUP_EVENT)); } catch { /* ignore */ }
  return getStockSetup(ed);
}

/** The first time a shop is opened, remember its edition (so a later move to another edition is noticed). */
export function rememberEdition(ed = currentEditionId()) {
  if (typeof window === 'undefined' || read()) return;
  try { window.localStorage.setItem(KEY, JSON.stringify({ ...defaultsFor(ed), edition: ed, at: Date.now() })); } catch { /* ignore */ }
}

/** The menu without what the shop's buying choice leaves out: direct only → no purchase orders, receiving or requests;
 *  orders only → no Purchases page. */
export function navForSetup(nav, s = getStockSetup()) {
  const hide = new Set([...(usesOrders(s) ? [] : ['po-orders', 'po-receive', 'po-requests']), ...(buysDirect(s) ? [] : ['po-buy'])]);
  if (!hide.size) return nav;
  return nav.map((g) => ({
    ...g,
    items: g.items.map((it) => (hide.has(it.id) ? null : it.children ? { ...it, children: it.children.filter((c) => !hide.has(c.id)) } : it)).filter((it) => it && (!it.children || it.children.length)),
  })).filter((g) => g.items.length);
}
/** Purchases (direct) and purchase orders: which are switched on. */
export const buysDirect = (s = getStockSetup()) => s.buying !== 'orders';
export const usesOrders = (s = getStockSetup()) => s.buying !== 'direct';
