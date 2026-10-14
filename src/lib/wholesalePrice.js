// wholesalePrice — the one price rule for business buyers (WH-U1), price lists (WH-F1), cartons (WH-F3) and the
// credit check (WH-F8). The POS, quotes, Create order and Return & exchange all price through priceFor, so a buyer
// pays the same everywhere.
//
//   priceFor({ customer, sku, qty, channel, retail })
//     → { price, listPrice, source, listId?, listName?, note?, moq }
//     The first rule that gives a price wins:
//       1. 'pricelist'  the buyer's price list has a line for this product (fixed price or % off retail)
//       2. 'slab'       …and that line has a quantity slab the quantity reaches (e.g. 12+ pcs ৳1,063)
//       3. 'wholesale'  the product's own wholesale price (Add product › Pricing)
//       4. 'tier'       the buyer's group % below retail (Wholesale A 10%, B 15%) when the product has no wholesale price
//       5. 'retail'     the retail price: not a business buyer, wholesale off, a "Retail only" product, or
//                       channel 'retail' (a buyer who buys both, sold at retail on purpose)
//     `customer` is a customer row, a customer ID or a mobile number; `retail` overrides the catalogue's retail price.
//   priceListsFor(customer) → the active lists that apply to this buyer, in the order they are tried:
//     given to the buyer → to their company → to one of their tags → to their customer group (A / B)
//   unitsFor(sku) → [{ unit: 'pc' | pack id, label, short, per }]   pieces first, then the product's packs (units.js)
//   toPieces(sku, qty, unit) → pieces;  parseQty(sku, '3 ctn + 4 pcs') → { pieces, parts } | { error }
//   packText(sku, pieces) → '3 cartons + 4 pcs'
//   creditCheck(customer, amount, { owedBefore }) → { ok, needPin, hold, over, reason, limit, owed, after, overdue }
//     `amount` is what this sale leaves unpaid. Over the credit limit (wholesale) or on hold for invoices more
//     than N days overdue (Settings › Customers › Credit & dues) → refused, or a manager's PIN (the setting).
//     Retail customers also go through creditRules.checkDue (selling on due must be on).
//
// Price lists: { id, name, note, active, assign: { buyers: [id], companies: [id], tags: [tag], groups: ['A'|'B'] },
//   lines: [{ sku, mode: 'fixed' | 'off', value, slabs: [{ min, value }] }] } — `value` is ৳ for 'fixed', % for 'off';
//   a slab uses its line's mode. Three demo lists for Dazzle Shop: Dealer, Retailer, Corporate.
// Front end only: lists live in this browser (gc.priceLists). Wholesale must be on (edition.js) for any of it to apply.

import { getCatalog, productBy } from './stock';
import { packsOf, unitOf, fmtQty } from './units';
import { getCustomers, findCustomer, phoneDigits, resolveCustomer, PRICE_TIERS } from './customers';
import { wholesaleOn } from './edition';
import { getInvoices, dueDateOf } from './invoices';
import { getCreditRules, checkDue } from './creditRules';
import { getHoldRules } from './buyerTerms';

export { TERMS, termsOf, termsForPhone, setTerms, dueByTerms, getHoldRules, saveHoldRules, HOLD_ACTIONS, HOLD_SCOPES } from './buyerTerms';

const KEY = 'gc.priceLists';
export const PRICE_LISTS_EVENT = 'gc:price-lists';
const DAY = 864e5;
const ssr = () => typeof window === 'undefined';
const r0 = (n) => Math.round(Number(n) || 0);
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

// ---- demo lists (Dazzle Shop) -------------------------------------------------------------------------------------
const L = (sku, mode, value, slabs) => ({ sku, mode, value, slabs: slabs || [] });
export const SEED_LISTS = [
  { id: 'PL-DEALER', name: 'Dealer', note: 'Distributors who buy by the carton', active: true,
    assign: { buyers: [], companies: [], tags: [], groups: ['B'] },
    lines: [
      L('AU-EAR-PRO', 'fixed', 3050, [{ min: 20, value: 2990 }]),
      L('AC-CHG-20', 'fixed', 1040, [{ min: 48, value: 1000 }]),
      L('AC-CBL-100', 'off', 12),
      L('AC-GLS-9H', 'fixed', 340, [{ min: 60, value: 320 }]),
      L('AC-CBL-LTG', 'fixed', 370, [{ min: 48, value: 355 }]),
      L('PH-RLM-N50', 'fixed', 13300),
      L('PB-ANK-10K', 'fixed', 2450, [{ min: 12, value: 2400 }]),
    ] },
  { id: 'PL-RETAILER', name: 'Retailer', note: 'Mobile shops that buy a few at a time', active: true,
    assign: { buyers: [], companies: [], tags: [], groups: ['A'] },
    lines: [
      L('AU-EAR-PRO', 'fixed', 3141),
      L('AC-CHG-20', 'fixed', 1100, [{ min: 12, value: 1063 }]),
      L('AC-GLS-9H', 'off', 8),
      L('AC-CBL-LTG', 'fixed', 390, [{ min: 24, value: 378 }]),
      L('PH-SYM-D50', 'fixed', 1540),
    ] },
  { id: 'PL-CORPORATE', name: 'Corporate', note: 'Company accounts (phones for staff)', active: true,
    assign: { buyers: [], companies: ['C-30001'], tags: [], groups: [] },
    lines: [
      L('PH-GAL-A15', 'fixed', 18900),
      L('PH-RDM-N13', 'fixed', 25500),
      L('AU-EAR-PRO', 'off', 10),
      L('PB-ANK-10K', 'fixed', 2600),
    ] },
];
export const GROUPS = Object.values(PRICE_TIERS).map((t) => ({ k: t.id, label: t.label, off: t.off }));

// ---- storage ------------------------------------------------------------------------------------------------------
let memo = { raw: undefined, lists: SEED_LISTS };
export function getPriceLists() {
  if (ssr()) return SEED_LISTS;
  let raw = null;
  try { raw = window.localStorage.getItem(KEY); } catch { /* storage blocked */ }
  if (raw === memo.raw) return memo.lists;
  let lists = SEED_LISTS;
  try { const v = JSON.parse(raw); if (Array.isArray(v)) lists = v; } catch { /* keep the demo lists */ }
  memo = { raw, lists: lists.map(cleanList) };
  return memo.lists;
}
function writeLists(lists) {
  try { window.localStorage.setItem(KEY, JSON.stringify(lists.map(cleanList))); window.dispatchEvent(new CustomEvent(PRICE_LISTS_EVENT)); } catch { /* storage blocked */ }
  profiles.clear();
}
const uniq = (a) => [...new Set((Array.isArray(a) ? a : []).map((x) => String(x).trim()).filter(Boolean))];
function cleanLine(l) {
  const mode = l.mode === 'off' ? 'off' : 'fixed';
  const v = Math.max(0, Number(l.value) || 0);
  const slabs = (Array.isArray(l.slabs) ? l.slabs : []).map((s) => ({ min: Math.max(2, r0(s.min)), value: Math.max(0, Number(s.value) || 0) }))
    .filter((s) => s.min > 1 && s.value > 0).sort((a, b) => a.min - b.min)
    .filter((s, i, a) => !a.slice(i + 1).some((x) => x.min === s.min));
  return { sku: String(l.sku || '').trim(), mode, value: mode === 'off' ? Math.min(90, v) : r2(v), slabs: slabs.map((s) => ({ ...s, value: mode === 'off' ? Math.min(90, s.value) : r2(s.value) })) };
}
function cleanList(x) {
  const a = x.assign || {};
  return {
    id: x.id, name: String(x.name || 'Price list').trim(), note: String(x.note || ''), active: x.active !== false,
    assign: { buyers: uniq(a.buyers), companies: uniq(a.companies), tags: uniq(a.tags), groups: uniq(a.groups) },
    lines: (Array.isArray(x.lines) ? x.lines : []).map(cleanLine).filter((l) => l.sku && l.value > 0)
      .filter((l, i, all) => all.findIndex((m) => m.sku.toLowerCase() === l.sku.toLowerCase()) === i),
    updatedAt: x.updatedAt || 0,
  };
}
export const listBy = (id) => getPriceLists().find((l) => l.id === id) || null;
/** Add or replace a list. Returns the saved list. */
export function saveList(list) {
  const all = getPriceLists();
  const id = list.id || nextListId(all);
  const row = cleanList({ ...list, id, updatedAt: Date.now() });
  writeLists(all.some((l) => l.id === id) ? all.map((l) => (l.id === id ? row : l)) : [...all, row]);
  return row;
}
export function deleteList(id) { writeLists(getPriceLists().filter((l) => l.id !== id)); }
function nextListId(all) {
  let n = all.length + 1;
  while (all.some((l) => l.id === 'PL-' + n)) n += 1;
  return 'PL-' + n;
}
/** Put the demo lists back (Settings and tests). */
export function resetLists() { try { window.localStorage.removeItem(KEY); window.dispatchEvent(new CustomEvent(PRICE_LISTS_EVENT)); } catch { /* ignore */ } profiles.clear(); }

// ---- who a list applies to ----------------------------------------------------------------------------------------
const profiles = new Map();
let profAt = 0;
function safeResolve(ref) { try { return ssr() ? null : resolveCustomer(ref); } catch { return null; } }
/** { id, phone, name, types, tier, tags, companyId, kind } for a customer row, ID or mobile number. */
export function buyerOf(customer) {
  if (!customer) return null;
  if (Date.now() - profAt > 3000) { profiles.clear(); profAt = Date.now(); }
  const key = typeof customer === 'string' ? customer : customer.id || customer.phone || customer.name;
  if (key && profiles.has(key)) return profiles.get(key);
  let row = typeof customer === 'object' ? customer : null;
  if (!row) {
    const d = phoneDigits(customer);
    row = (d.length >= 10 && !ssr() && findCustomer(getCustomers(), d)) || safeResolve(customer);
  }
  if (!row) return null;
  const dir = row.id ? safeResolve(row.id) : null;
  const p = {
    id: row.id || (dir && dir.id) || '', phone: phoneDigits(row.phone || (dir && dir.phone)), name: row.name || (dir && dir.name) || '',
    types: row.types || (dir && dir.types) || [], tier: row.tier || (dir && dir.tier) || '',
    tags: (dir && dir.tags) || row.tags || [], companyId: row.companyId || (dir && dir.companyId) || '', kind: row.kind || (dir && dir.kind) || 'person',
    creditLimit: Number(row.creditLimit != null ? row.creditLimit : dir && dir.creditLimit) || 0,
  };
  if (key) profiles.set(key, p);
  return p;
}
/** True when this customer buys at business prices: a wholesale buyer, or one with a price list of their own. */
export function isBusinessBuyer(customer) {
  const b = buyerOf(customer);
  if (!b) return false;
  if (b.types.includes('Wholesale')) return true;
  return getPriceLists().some((l) => l.active && (l.assign.buyers.includes(b.id) || (b.companyId && l.assign.companies.includes(b.companyId)) || l.assign.companies.includes(b.id)));
}
/** Why a list applies to this buyer: 'buyer' | 'company' | 'tag' | 'group', or '' when it doesn't. */
export function assignedBy(list, b) {
  if (!b || !list.active) return '';
  if (list.assign.buyers.includes(b.id)) return 'buyer';
  if (list.assign.companies.includes(b.id) || (b.companyId && list.assign.companies.includes(b.companyId))) return 'company';
  if (b.tags.some((t) => list.assign.tags.includes(t))) return 'tag';
  if (b.types.includes('Wholesale') && list.assign.groups.includes(b.tier || 'A')) return 'group';
  return '';
}
const ORDER = { buyer: 0, company: 1, tag: 2, group: 3 };
/** The active lists that apply to this buyer, in the order they are tried. */
export function priceListsFor(customer) {
  const b = buyerOf(customer);
  if (!b) return [];
  return getPriceLists().map((l) => ({ l, by: assignedBy(l, b) })).filter((x) => x.by).sort((a, z) => ORDER[a.by] - ORDER[z.by]).map((x) => ({ ...x.l, by: x.by }));
}
/** Give a list to a buyer, a company, a tag or a group (kind: 'buyers' | 'companies' | 'tags' | 'groups'). */
export function assignList(id, kind, value, on = true) {
  const list = listBy(id);
  if (!list || !list.assign[kind]) return null;
  const cur = list.assign[kind].filter((x) => x !== value);
  return saveList({ ...list, assign: { ...list.assign, [kind]: on ? [...cur, value] : cur } });
}

// ---- the price ----------------------------------------------------------------------------------------------------
const lineValue = (mode, value, retail) => (mode === 'off' ? r0(retail * (100 - value) / 100) : r2(value));
const findLine = (list, sku) => list.lines.find((l) => l.sku.toLowerCase() === String(sku || '').toLowerCase()) || null;
/** The price one line of a list gives at this quantity: { price, slab } (slab = the slab used, or null). */
export function linePrice(line, retail, qty = 1) {
  const slab = (line.slabs || []).filter((s) => qty >= s.min).pop() || null;
  return { price: lineValue(line.mode, slab ? slab.value : line.value, retail), slab };
}
const money = (n) => '৳' + Math.round(n).toLocaleString('en-IN');

export function priceFor({ customer, sku, qty = 1, channel = 'wholesale', retail } = {}) {
  const row = sku ? productBy(sku, getCatalog()) : null;
  const listPrice = r2(retail != null && retail !== '' ? retail : row ? row.price : 0);
  const moq = row ? Number(row.moq) || 0 : 0;
  const plain = (note) => ({ price: listPrice, listPrice, source: 'retail', moq, ...(note ? { note } : {}) });
  if (ssr() || !wholesaleOn() || channel === 'retail' || channel === 'online') return plain();
  if (!customer || !isBusinessBuyer(customer)) return plain();
  if (row && row.sell === 'retail') return plain('Retail only');
  const n = Math.max(1, Number(qty) || 1);
  for (const list of priceListsFor(customer)) {
    const line = findLine(list, (row && row.sku) || sku);
    if (!line) continue;
    const { price, slab } = linePrice(line, listPrice, n);
    return slab
      ? { price, listPrice, source: 'slab', listId: list.id, listName: list.name, note: `${list.name} list · ${slab.min}+ pcs`, moq }
      : { price, listPrice, source: 'pricelist', listId: list.id, listName: list.name, note: `${list.name} list`, moq };
  }
  if (row && Number(row.wholesale) > 0) return { price: r2(row.wholesale), listPrice, source: 'wholesale', note: 'Wholesale price', moq };
  const b = buyerOf(customer);
  const tier = b && b.types.includes('Wholesale') ? PRICE_TIERS[b.tier] || PRICE_TIERS.A : null;
  if (tier) return { price: r0(listPrice * (100 - tier.off) / 100), listPrice, source: 'tier', note: `${tier.label.split(' · ')[0]} · ${tier.off}% below retail`, moq };
  return plain();
}
/** Short words for a price's source, for a line's small print. */
export const SOURCE_WORDS = { pricelist: 'Price list', slab: 'Quantity price', wholesale: 'Wholesale price', tier: 'Group price', retail: 'Retail price' };
/** What a buyer's prices come from, in a few words ("Dealer list", "Wholesale A · 10% below retail"), or ''. */
export function pricingLabel(customer) {
  if (ssr() || !wholesaleOn() || !isBusinessBuyer(customer)) return '';
  const lists = priceListsFor(customer);
  if (lists.length) return lists.map((l) => l.name).join(' + ') + ' price list';
  const b = buyerOf(customer);
  const tier = PRICE_TIERS[(b && b.tier) || 'A'] || PRICE_TIERS.A;
  return `Wholesale prices · ${tier.label.split(' · ')[0]}`;
}

// ---- cartons and packs --------------------------------------------------------------------------------------------
const rowOf = (sku) => (sku ? productBy(sku, getCatalog()) : null) || { sku };
/** The units a product is sold in: pieces first, then its packs, largest first. */
export function unitsFor(sku) {
  const row = rowOf(sku);
  const u = unitOf(row.unit);
  return [{ unit: u.k, label: u.label, short: u.short, per: 1 }, ...packsOf(row).map((p) => ({ unit: p.id, label: p.name, short: shortPack(p.name), per: p.qty }))];
}
export function toPieces(sku, qty, unit) {
  const u = unitsFor(sku).find((x) => x.unit === unit);
  return Math.round((Number(qty) || 0) * (u ? u.per : 1) * 1000) / 1000;
}
export const packText = (sku, pieces) => fmtQty(rowOf(sku), pieces);
const WORD = { ctn: 'carton', ctns: 'carton', cartons: 'carton', crtn: 'carton', bx: 'box', boxes: 'box', bxs: 'box', pk: 'packet', pkt: 'packet', pack: 'packet', packs: 'packet', bales: 'bale', sacks: 'sack', dz: 'dozen' };
const BASE = ['pc', 'pcs', 'piece', 'pieces', 'pis', 'unit', 'units', 'nos'];
function shortPack(name) {
  const w = String(name).split(' ')[0].toLowerCase();
  return w === 'carton' ? 'ctn' : w;
}
/**
 * Read "3 ctn + 4 pcs", "2 cartons 5", "1 box", "36" for a product: { pieces, parts: [{ n, unit, per }] }, or
 * { error } naming the word it could not match. A bare number is pieces.
 */
export function parseQty(sku, text) {
  const units = unitsFor(sku);
  const packs = units.slice(1);
  const parts = [];
  const re = /(\d+(?:\.\d+)?)\s*([a-zA-Zঀ-৿]*)/g;
  const src = String(text || '').replace(/[,+&]|\band\b/gi, ' ');
  let m;
  while ((m = re.exec(src))) {
    const n = Number(m[1]);
    const word = m[2].toLowerCase();
    if (!word || BASE.includes(word)) { parts.push({ n, unit: units[0].unit, per: 1 }); continue; }
    const w = WORD[word] || word.replace(/e?s$/, '');
    const hit = packs.find((p) => p.label.toLowerCase().split(' ')[0].startsWith(w) || p.short === word) || null;
    if (!hit) return { error: packs.length ? `No “${m[2]}” pack for this product. Packs: ${packs.map((p) => p.label).join(', ')}.` : `This product has no packs. Type pieces.` };
    parts.push({ n, unit: hit.unit, per: hit.per });
  }
  if (!parts.length) return { error: 'Type a quantity, e.g. 3 ctn + 4 pcs' };
  return { pieces: Math.round(parts.reduce((s, p) => s + p.n * p.per, 0) * 1000) / 1000, parts };
}

// ---- credit check -------------------------------------------------------------------------------------------------
const dayOf = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
/** Whole calendar days from the due date to today (0 = due today or not due yet). */
export const daysLate = (due, now = Date.now()) => Math.max(0, Math.round((dayOf(now) - dayOf(due)) / DAY));
/** The buyer's unpaid invoices more than `days` past their due date: { count, amount, days (the oldest) , list }. */
export function overdueOf(customer, days = getHoldRules().days, now = Date.now()) {
  const b = buyerOf(customer);
  const d = b ? b.phone : phoneDigits(typeof customer === 'string' ? customer : '');
  if (!d || ssr()) return { count: 0, amount: 0, days: 0, list: [] };
  const list = getInvoices().filter((inv) => inv.due > 0 && phoneDigits(inv.customer && inv.customer.phone) === d)
    .map((inv) => ({ inv, late: daysLate(dueDateOf(inv), now) })).filter((x) => x.late > days);
  return { count: list.length, amount: r2(list.reduce((s, x) => s + x.inv.due, 0)), days: list.reduce((a, x) => Math.max(a, x.late), 0), list };
}
const owedByPhone = (d) => r2(getInvoices().filter((inv) => inv.due > 0 && phoneDigits(inv.customer && inv.customer.phone) === d).reduce((s, inv) => s + inv.due, 0));

/**
 * May this buyer leave `amount` unpaid on a new sale (quote → order, Create order, POS)?
 * opts: { owedBefore (else read from the invoices), phone (for a walk-in typed number), rules, hold }.
 */
export function creditCheck(customer, amount = 0, opts = {}) {
  const b = buyerOf(customer);
  const phone = (b && b.phone) || phoneDigits(opts.phone || (typeof customer === 'string' ? customer : ''));
  const owed = opts.owedBefore != null ? r2(opts.owedBefore) : phone ? owedByPhone(phone) : 0;
  const unpaid = Math.max(0, r2(amount));
  const after = r2(owed + unpaid);
  const hold = opts.hold || getHoldRules();
  const business = !!b && wholesaleOn() && isBusinessBuyer(b);
  const base = { ok: true, needPin: false, hold: false, over: false, reason: '', reasons: [], limit: 0, owed, after, overdue: { count: 0, amount: 0, days: 0, list: [] } };
  // 1. selling on due at all (retail rules; business buyers buy on their terms)
  if (!business && unpaid > 0) {
    const r = checkDue({ phone, customer: b, owedNow: unpaid, owedBefore: owed, wholesale: false }, opts.rules || getCreditRules());
    if (!r.ok) return { ...base, ok: false, reason: r.reason, reasons: [r.reason], limit: r.limit };
    base.limit = r.limit;
    if (r.needPin) { base.over = true; base.needPin = true; base.reasons.push(`This takes ${b ? b.name : 'the customer'} to ${money(after)}, over the ${money(r.limit)} credit limit.`); }
  }
  // 2. a business buyer's own credit limit (0 = no limit); over it a manager approves
  if (business && unpaid > 0 && b.creditLimit > 0 && after > b.creditLimit) {
    base.limit = b.creditLimit; base.over = true; base.needPin = true;
    base.reasons.push(`${b.name} would owe ${money(after)}, over the ${money(b.creditLimit)} credit limit.`);
  } else if (business) base.limit = b.creditLimit;
  // 3. the overdue hold: invoices more than N days past their due date
  if (hold.on && phone && (unpaid > 0 || hold.scope === 'all')) {
    const od = overdueOf(b || phone, hold.days);
    base.overdue = od;
    if (od.count) {
      const why = `${b ? b.name : 'This customer'} has ${od.count} invoice${od.count > 1 ? 's' : ''} more than ${hold.days} days overdue (${money(od.amount)}, oldest ${od.days} days late).`;
      base.hold = true;
      if (hold.action === 'block') return { ...base, ok: false, needPin: false, reason: why + ' Take the overdue payment first.', reasons: [...base.reasons, why] };
      base.needPin = true; base.reasons.push(why);
    }
  }
  base.reason = base.reasons.join(' ');
  return base;
}

// ---- CSV ----------------------------------------------------------------------------------------------------------
// One row per line: List, SKU, Product, Price type (fixed | % off), Value, Quantity slabs ("48:1000|96:980").
export const CSV_HEAD = ['List', 'SKU', 'Product', 'Price type', 'Value', 'Quantity slabs'];
/** The lists (or one) as CSV rows, header first. */
export function listsToCsv(lists = getPriceLists()) {
  const rows = [CSV_HEAD];
  lists.forEach((l) => l.lines.forEach((x) => {
    const row = productBy(x.sku, getCatalog());
    rows.push([l.name, x.sku, row ? row.name : '', x.mode === 'off' ? '% off' : 'fixed', x.value, x.slabs.map((s) => s.min + ':' + s.value).join('|')]);
  }));
  return rows;
}
/**
 * Read CSV rows (from productImport.parseCsv) into the lists: a list is matched by name (a new name makes a new list,
 * given to nobody yet); a row replaces that product's line. Returns { lists: n, lines: n, skipped: [why] }.
 */
export function importCsv(rows) {
  const body = rows.length && /list/i.test(String(rows[0][0] || '')) ? rows.slice(1) : rows;
  const all = getPriceLists().map((l) => ({ ...l, lines: l.lines.slice() }));
  const touched = new Set();
  const skipped = [];
  let lines = 0;
  body.forEach((r, i) => {
    const [name, sku, , type, value, slabs] = r.map((c) => String(c == null ? '' : c).trim());
    const at = 'Row ' + (i + 2);
    if (!name || !sku) { skipped.push(at + ': list name and SKU are needed'); return; }
    const row = productBy(sku, getCatalog());
    if (!row) { skipped.push(at + ': no product with SKU ' + sku); return; }
    const v = Number(String(value).replace(/[^0-9.]/g, ''));
    if (!(v > 0)) { skipped.push(at + ': no price'); return; }
    let list = all.find((l) => l.name.toLowerCase() === name.toLowerCase());
    if (!list) { list = cleanList({ id: nextListId(all), name, active: true, assign: {}, lines: [] }); all.push(list); }
    const line = cleanLine({ sku: row.sku, mode: /off|%/i.test(type) ? 'off' : 'fixed', value: v,
      slabs: String(slabs || '').split(/[|/]/).map((s) => s.split(':')).filter((p) => p.length === 2).map(([min, val]) => ({ min: Number(min), value: Number(val) })) });
    list.lines = [...list.lines.filter((x) => x.sku.toLowerCase() !== row.sku.toLowerCase()), line];
    touched.add(list.id); lines += 1;
  });
  if (lines) writeLists(all.map((l) => (touched.has(l.id) ? { ...l, updatedAt: Date.now() } : l)));
  return { lists: touched.size, lines, skipped };
}
