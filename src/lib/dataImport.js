// dataImport — bringing data from another system (Settings › Import data, /import-data; Customers › Import). Three
// kinds, each: read a CSV or Excel file → match the columns → check every row (nothing saved) → import in the background
// → a result with what was added, updated and skipped, and why.
//   customers   name, phone, email, address, city, type, tags, ID in the old system. Matched on the phone (01…, 8801…,
//               +880… are the same number), then email, then the old ID: a match is a Duplicate (update it or skip it)
//   stock       opening stock per place: SKU or barcode, place, quantity. "Set on hand to" posts the difference as an
//               opening move; "Add to on hand" posts the quantity
//   orders      past orders, read only: one row per item, grouped by order number. No notifications, no stock moves,
//               no money in the books; they are kept apart (importedOrders) and linked to the customer by phone
//
//   readFile(file) → Promise<rows>            CSV / TXT (productImport.parseCsv) or .xlsx (xlsx.js)
//   FIELDS[kind] · autoMap(kind, headers) · check(kind, rows, map, opts) · templateCsv(kind)
//   startImport(kind, checked, opts) → job    runs in the background (progress follows the clock), applied once by
//   tickJobs() (the Import page and the Customers list call it)  · getJobs() · progressOf(job) · importedOrders()
// Front end only (gc.import.*). A real shop runs the job on the server; WooCommerce and Shopify pulls need the server and
// the store's API keys (Connections), so here they come in as the stores' own CSV exports.

import { parseCsv } from './productImport';
import { readXlsx } from './xlsx';
import { getDirectory, normalizePhone, addCustomers, updateIdentities, getCustomers, EXTERNAL_SOURCES } from './customers';
import { getCatalog, productBy, stockAt, addMovesBatch, getMoves } from './stock';
import { getHolds } from './stockHolds';
import { getTransfers } from './transfers';
import { getPlaces, onlinePlace } from './locations';
import { isOnePlace } from './stockSetup';
import { isFractional } from './units';

export const JOBS_KEY = 'gc.import.jobs';
export const ORDERS_KEY = 'gc.import.orders';
export const IMPORT_EVENT = 'gc:import';
export const MAX_ROWS = { customers: 20000, stock: 5000, orders: 20000 };
const ssr = () => typeof window === 'undefined';

export const KINDS = {
  customers: { label: 'Customers', one: 'customer', many: 'customers' },
  stock: { label: 'Opening stock', one: 'stock row', many: 'stock rows' },
  orders: { label: 'Past orders', one: 'order', many: 'orders' },
};
export const SOURCES = { file: 'CSV or Excel file', woo: 'WooCommerce', shopify: 'Shopify' };

export const FIELDS = {
  customers: [
    { k: 'name', label: 'Name', need: true, alias: ['name', 'full name', 'customer', 'customer name', 'billing name', 'contact name'] },
    { k: 'first', label: 'First name', alias: ['first name', 'firstname', 'billing first name', 'given name'] },
    { k: 'last', label: 'Last name', alias: ['last name', 'lastname', 'billing last name', 'surname', 'family name'] },
    { k: 'phone', label: 'Mobile number', need: true, alias: ['phone', 'mobile', 'phone number', 'mobile number', 'contact', 'contact number', 'billing phone', 'cell', 'default address phone'] },
    { k: 'email', label: 'Email', alias: ['email', 'e-mail', 'email address', 'billing email'] },
    { k: 'address', label: 'Address', alias: ['address', 'address 1', 'address1', 'billing address 1', 'street', 'default address address1', 'shipping address'] },
    { k: 'city', label: 'City or area', alias: ['city', 'area', 'district', 'billing city', 'default address city', 'town'] },
    { k: 'type', label: 'Buys (Online / Retail)', alias: ['type', 'customer type', 'buys', 'channel'] },
    { k: 'tags', label: 'Tags', alias: ['tags', 'labels', 'groups', 'segment'] },
    { k: 'oldId', label: 'ID in the old system', alias: ['id', 'customer id', 'user id', 'old id', 'customer no', 'customer number'] },
  ],
  stock: [
    { k: 'code', label: 'SKU or barcode', need: true, alias: ['sku', 'barcode', 'code', 'item code', 'product code', 'ean', 'variant sku', 'lineitem sku'] },
    { k: 'place', label: 'Place', alias: ['place', 'location', 'warehouse', 'branch', 'store', 'shop', 'outlet'] },
    { k: 'qty', label: 'Quantity', need: true, alias: ['qty', 'quantity', 'stock', 'on hand', 'opening stock', 'available', 'count', 'inventory'] },
  ],
  orders: [
    { k: 'number', label: 'Order number', need: true, alias: ['order', 'order number', 'order no', 'order id', 'order #', 'invoice', 'invoice no', 'invoice number', 'number'] },
    { k: 'date', label: 'Date', need: true, alias: ['date', 'order date', 'created at', 'created', 'placed at', 'paid at'] },
    { k: 'name', label: 'Customer name', alias: ['customer', 'customer name', 'name', 'billing name', 'shipping name'] },
    { k: 'phone', label: 'Mobile number', alias: ['phone', 'mobile', 'customer phone', 'billing phone', 'shipping phone'] },
    { k: 'item', label: 'Item', need: true, alias: ['item', 'product', 'product name', 'item name', 'lineitem name', 'line item'] },
    { k: 'sku', label: 'SKU', alias: ['sku', 'item sku', 'lineitem sku', 'product code'] },
    { k: 'qty', label: 'Quantity', alias: ['qty', 'quantity', 'lineitem quantity', 'units'] },
    { k: 'price', label: 'Unit price', alias: ['price', 'unit price', 'lineitem price', 'rate', 'item price'] },
    { k: 'total', label: 'Order total', alias: ['total', 'order total', 'grand total', 'amount', 'net total'] },
    { k: 'status', label: 'Status', alias: ['status', 'order status', 'fulfillment status', 'state'] },
    { k: 'payment', label: 'Payment', alias: ['payment', 'payment method', 'gateway', 'paid by', 'payment type'] },
  ],
};

// ---- reading --------------------------------------------------------------------------------------------------------
/** A picked file → rows of cells. CSV / TXT, or the first sheet of an .xlsx file. */
export async function readFile(file) {
  if (!file) throw new Error('Choose a file.');
  if (/\.xls$/i.test(file.name)) throw new Error('This is an old Excel file (.xls). In Excel: File › Save as › Excel workbook (.xlsx) or CSV.');
  if (/\.xlsx$/i.test(file.name)) return readXlsx(await file.arrayBuffer());
  if (!/\.(csv|txt)$/i.test(file.name)) throw new Error('Choose a .csv or .xlsx file.');
  return parseCsv(await file.text());
}
/** Which column is which field, guessed from the header names: { columnIndex: fieldKey | '' }. */
export function autoMap(kind, headers) {
  const used = new Set(); const map = {};
  headers.forEach((h, i) => {
    const t = String(h || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const f = FIELDS[kind].find((x) => !used.has(x.k) && (x.alias.includes(t) || x.label.toLowerCase() === t));
    map[i] = f ? f.k : '';
    if (f) used.add(f.k);
  });
  return map;
}
const valuesOf = (cells, map) => { const v = {}; Object.keys(map).forEach((ci) => { const k = map[ci]; if (k) v[k] = String(cells[ci] == null ? '' : cells[ci]).trim(); }); return v; };
const num = (v) => { const t = String(v == null ? '' : v).replace(/[৳,\s]|tk|bdt/gi, ''); return t === '' ? null : /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN; };
const isMobile = (d) => /^01[3-9]\d{8}$/.test(d);
/** Is the mapping complete enough to check? '' when it is, else what is missing. */
export function mappingProblem(kind, map) {
  const got = new Set(Object.values(map).filter(Boolean));
  if (kind === 'customers' && !got.has('name') && !got.has('first')) return 'Match a column to Name (or First name).';
  const miss = FIELDS[kind].filter((f) => f.need && !got.has(f.k) && !(kind === 'customers' && f.k === 'name'));
  return miss.length ? 'Match a column to ' + miss.map((f) => f.label).join(' and ') + '.' : '';
}

// ---- checking (nothing is saved) --------------------------------------------------------------------------------------
/**
 * Check every row. Returns [{ n (row in the file), status: 'new' | 'duplicate' | 'invalid', errors, warnings, name, rec,
 * match? }]. opts: customers { source }, stock { mode: 'set' | 'add' }, orders { source }.
 */
export function check(kind, rows, map, opts = {}) {
  if (kind === 'customers') return checkCustomers(rows, map, opts);
  if (kind === 'stock') return checkStock(rows, map, opts);
  return checkOrders(rows, map, opts);
}

function directoryIndex() {
  const dir = getDirectory();
  const byPhone = new Map(), byEmail = new Map(), byExt = new Map();
  dir.forEach((c) => {
    (c.phones || []).forEach((p) => { const d = normalizePhone(p.value); if (d && !byPhone.has(d)) byPhone.set(d, c); });
    (c.emails || []).forEach((e) => { const k = String(e.value).toLowerCase(); if (k && !byEmail.has(k)) byEmail.set(k, c); });
    (c.externalIds || []).forEach((x) => byExt.set(x.source + ':' + String(x.value).toLowerCase(), c));
  });
  return { byPhone, byEmail, byExt };
}
const TYPE_WORDS = { online: 'Online', web: 'Online', website: 'Online', facebook: 'Online', retail: 'Retail', shop: 'Retail', pos: 'Retail', store: 'Retail', counter: 'Retail' };

function checkCustomers(rows, map, { source = 'file' } = {}) {
  const idx = directoryIndex();
  const seenPhone = new Map(), seenEmail = new Map();
  const extSource = source === 'woo' || source === 'shopify' ? source : 'import';
  return rows.map((cells, i) => {
    const v = valuesOf(cells, map); const n = i + 2;
    const errors = [], warnings = [];
    const name = (v.name || [v.first, v.last].filter(Boolean).join(' ')).replace(/\s+/g, ' ').trim();
    if (!name) errors.push('No name');
    const raw = v.phone || '';
    const d = normalizePhone(raw);
    if (!raw) errors.push('No mobile number');
    else if (!d) errors.push('“' + raw + '” is not a phone number');
    else if (!isMobile(d) && d[0] !== '+') errors.push('“' + raw + '” is not an 11-digit mobile number');
    else if (d[0] === '+') warnings.push('Not a Bangladeshi number: SMS may not reach it');
    const email = (v.email || '').toLowerCase();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { warnings.push('Email “' + v.email + '” looks wrong: left out'); }
    const okEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
    if (d && seenPhone.has(d)) errors.push('Same number as row ' + seenPhone.get(d));
    else if (d) seenPhone.set(d, n);
    if (okEmail && seenEmail.has(okEmail) && !errors.length) warnings.push('Same email as row ' + seenEmail.get(okEmail));
    else if (okEmail) seenEmail.set(okEmail, n);
    let types = ['Retail'];
    if (v.type) {
      const t = v.type.split(/[,/|+]/).map((x) => TYPE_WORDS[x.trim().toLowerCase()]).filter(Boolean);
      if (t.length) types = [...new Set(t)]; else warnings.push('Unknown type “' + v.type + '”: saved as Retail');
    }
    const tags = v.tags ? [...new Set(v.tags.split(/[,|;]/).map((x) => x.trim()).filter(Boolean))].slice(0, 10) : [];
    const address = [v.address, v.city].filter(Boolean).join(', ');
    const match = d ? idx.byPhone.get(d) : null;
    const byMail = !match && okEmail ? idx.byEmail.get(okEmail) : null;
    const byOld = !match && !byMail && v.oldId ? idx.byExt.get(extSource + ':' + v.oldId.toLowerCase()) : null;
    const found = match || byMail || byOld;
    const rec = { name, phone: d, email: okEmail, address, types, tags, oldId: v.oldId || '', source: extSource };
    const status = errors.length ? 'invalid' : found ? 'duplicate' : 'new';
    return { n, status, errors, warnings, name: name || '(no name)', rec, match: found ? { id: found.id, name: found.name, by: match ? 'phone' : byMail ? 'email' : 'old ID' } : null };
  });
}

function placeIndex() {
  const list = getPlaces({ active: true });
  const m = new Map();
  list.forEach((p) => [p.name, p.code, ...(p.aka || [])].filter(Boolean).forEach((x) => m.set(String(x).toLowerCase(), p)));
  return { list, m };
}
function checkStock(rows, map, { mode = 'set' } = {}) {
  const catalog = getCatalog();
  const { m } = placeIndex();
  const one = isOnePlace();
  const home = (() => { try { return onlinePlace(); } catch { return ''; } })();
  const holds = getHolds(), moves = getMoves(), transfers = getTransfers();
  const seen = new Map();
  return rows.map((cells, i) => {
    const v = valuesOf(cells, map); const n = i + 2;
    const errors = [], warnings = [];
    const p = v.code ? productBy(v.code, catalog) || productBy(v.code.toUpperCase(), catalog) : null;
    if (!v.code) errors.push('No SKU or barcode');
    else if (!p) errors.push('No product with “' + v.code + '”. Add or import the product first');
    else if (p.format === 'digital' || p.format === 'service' || p.format === 'licence') errors.push(p.name + ' isn’t counted in stock');
    else if (p.bundle && p.bundle.type !== 'kit') errors.push(p.name + ' is a bundle: import its parts');
    let place = '';
    if (v.place) { const pl = m.get(v.place.toLowerCase()); if (pl) place = pl.name; else errors.push('No place called “' + v.place + '”'); }
    else if (one || !v.place) { place = home; if (!one) warnings.push('No place: put at ' + home); }
    if (place && one && place !== home && !errors.length) { warnings.push('One-place shop: put at ' + home); place = home; }
    const q = num(v.qty);
    if (v.qty == null || v.qty === '') errors.push('No quantity');
    else if (Number.isNaN(q)) errors.push('Quantity “' + v.qty + '” is not a number');
    else if (q < 0) errors.push('Quantity is below zero');
    else if (p && !isFractional(p) && !Number.isInteger(q)) errors.push('Quantity must be a whole number');
    const key = p && place ? p.sku + '@' + place : '';
    if (key && seen.has(key)) errors.push('Same product and place as row ' + seen.get(key));
    else if (key) seen.set(key, n);
    let onHand = 0;
    if (p && place && !errors.length) { try { onHand = stockAt(p.sku, place, holds, moves, transfers).onHand || 0; } catch { onHand = 0; } }
    const change = mode === 'add' ? q : q - onHand;
    if (!errors.length && mode === 'set' && change === 0) warnings.push('Already ' + q + ' on hand: nothing changes');
    const status = errors.length ? 'invalid' : onHand ? 'duplicate' : 'new';
    return { n, status, errors, warnings, name: p ? p.name + (p.variant ? ' · ' + p.variant : '') : v.code || '(no code)', rec: p && !errors.length ? { sku: p.sku, place, qty: q, onHand, change } : null, match: onHand ? { name: onHand + ' on hand now', by: 'place' } : null };
  });
}

/** A date from the file: 2026-09-14, 14/09/2026, 14-09-2026, 14 Sep 2026, or an Excel day number. NaN when not a date. */
export function parseDate(text) {
  const t = String(text || '').trim();
  if (!t) return NaN;
  if (/^\d{5}(\.\d+)?$/.test(t)) { const n = Number(t); if (n > 20000 && n < 80000) return Math.round((n - 25569) * 864e5 + new Date().getTimezoneOffset() * 6e4); }
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?/.exec(t);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 12), +(m[5] || 0)).getTime();
  m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?/.exec(t);
  if (m) { const y = +m[3] < 100 ? 2000 + +m[3] : +m[3]; if (+m[2] > 12) return NaN; return new Date(y, +m[2] - 1, +m[1], +(m[4] || 12), +(m[5] || 0)).getTime(); }
  const p = Date.parse(t);
  return Number.isNaN(p) ? NaN : p;
}
const STATUS_WORDS = [[/deliver|complete|fulfil|paid|closed|done/i, 'Delivered'], [/cancel|void/i, 'Cancelled'], [/return|refund|rto/i, 'Returned'], [/pending|hold|processing|unfulfil|open/i, 'Not finished']];
const statusWord = (s) => { if (!s) return 'Delivered'; const hit = STATUS_WORDS.find(([re]) => re.test(s)); return hit ? hit[1] : s; };

function checkOrders(rows, map, { source = 'file' } = {}) {
  const idx = directoryIndex();
  const done = new Set(importedOrders().map((o) => o.source + ':' + o.number.toLowerCase()));
  const groups = new Map();
  rows.forEach((cells, i) => {
    const v = valuesOf(cells, map); const n = i + 2;
    const key = (v.number || '').toLowerCase() || '#row' + n;
    if (!groups.has(key)) groups.set(key, { first: n, rows: [] });
    groups.get(key).rows.push({ v, n });
  });
  const now = Date.now();
  return [...groups.values()].map((g) => {
    const errors = [], warnings = [];
    const h = g.rows[0].v;
    if (!h.number) errors.push('No order number');
    const at = parseDate(h.date);
    if (!h.date) errors.push('No date');
    else if (Number.isNaN(at)) errors.push('Date “' + h.date + '” not understood: use 2026-09-14 or 14/09/2026');
    else if (at > now + 864e5) errors.push('Date is in the future');
    const lines = [];
    g.rows.forEach(({ v, n }) => {
      if (!v.item && !v.sku) { errors.push('Row ' + n + ': no item'); return; }
      const qty = v.qty ? num(v.qty) : 1;
      const price = v.price ? num(v.price) : null;
      if (Number.isNaN(qty) || qty <= 0) errors.push('Row ' + n + ': quantity “' + v.qty + '” is not a number');
      if (Number.isNaN(price)) errors.push('Row ' + n + ': price “' + v.price + '” is not a number');
      lines.push({ name: v.item || v.sku, sku: v.sku || '', qty: Number.isNaN(qty) ? 0 : qty, price: price == null || Number.isNaN(price) ? 0 : price });
    });
    const sum = lines.reduce((a, l) => a + l.qty * l.price, 0);
    const tot = h.total ? num(h.total) : null;
    if (Number.isNaN(tot)) errors.push('Total “' + h.total + '” is not a number');
    const total = tot != null && !Number.isNaN(tot) ? tot : sum;
    if (tot == null && !sum) warnings.push('No prices: total is ৳0');
    const d = normalizePhone(h.phone || '');
    const cust = d ? idx.byPhone.get(d) : null;
    if (!d) warnings.push('No mobile number: not linked to a customer');
    else if (!cust) warnings.push('Customer not in your book: import customers first to link it');
    const src = source || 'file';
    const dupe = h.number && done.has(src + ':' + h.number.toLowerCase());
    const status = errors.length ? 'invalid' : dupe ? 'duplicate' : 'new';
    const rec = { number: h.number || '', at, name: h.name || (cust ? cust.name : ''), phone: d, customerId: cust ? cust.id : '', lines, total, status: statusWord(h.status), payment: h.payment || '', source: src };
    return { n: g.first, status, errors, warnings, name: (h.number ? '#' + h.number : '(no number)') + (rec.name ? ' · ' + rec.name : ''), rec, match: dupe ? { name: 'Imported before', by: 'number' } : null };
  });
}

// ---- background jobs -----------------------------------------------------------------------------------------------
const readJobs = () => { if (ssr()) return []; try { return JSON.parse(window.localStorage.getItem(JOBS_KEY)) || []; } catch { return []; } };
const writeJobs = (list) => { try { window.localStorage.setItem(JOBS_KEY, JSON.stringify(list.slice(0, 30))); window.dispatchEvent(new CustomEvent(IMPORT_EVENT)); return true; } catch { return false; } };

/**
 * Start an import of the checked rows. opts: { file, source, by, dupes: 'update' | 'skip' (customers), mode (stock) }.
 * Invalid rows are skipped; duplicates are updated or skipped (customers), changed (stock) or skipped (orders).
 * Returns the job, or null when it couldn't be saved (browser storage full).
 */
export function startImport(kind, checked, { file = '', source = 'file', by = 'Staff', dupes = 'update', mode = 'set' } = {}) {
  const take = checked.filter((r) => r.status === 'new' || (r.status === 'duplicate' && (kind === 'stock' || (kind === 'customers' && dupes === 'update'))));
  const skipped = checked.filter((r) => !take.includes(r)).map((r) => ({ n: r.n, name: r.name, why: r.status === 'invalid' ? r.errors.join('; ') : kind === 'orders' ? 'Imported before' : 'Already a customer (skipped)' }));
  const now = Date.now();
  const job = {
    id: 'IMP-' + now.toString(36).toUpperCase().slice(-6), kind, file, source, by, startedAt: now,
    runMs: Math.min(9000, 1800 + take.length * 3), total: checked.length, opts: { dupes, mode },
    payload: take.map((r) => ({ n: r.n, name: r.name, status: r.status, rec: r.rec, match: r.match ? r.match.id || '' : '' })), skipped, done: false,
  };
  return writeJobs([job, ...readJobs()]) ? job : null;
}
/** 0…1: how far a running job is. */
export const progressOf = (job, now = Date.now()) => (job.done ? 1 : Math.min(1, Math.max(0, (now - job.startedAt) / job.runMs)));
/** Apply every job whose time is up (once). Returns the jobs that finished just now. */
export function tickJobs(now = Date.now()) {
  const list = readJobs();
  const due = list.filter((j) => !j.done && now >= j.startedAt + j.runMs);
  if (!due.length) return [];
  due.forEach((j) => {
    let res;
    try { res = j.kind === 'customers' ? applyCustomers(j) : j.kind === 'stock' ? applyStock(j) : applyOrders(j); }
    catch (e) { res = { added: 0, updated: 0, failed: j.payload.map((p) => ({ n: p.n, name: p.name, why: 'Not saved: ' + (e && e.message ? e.message : 'error') })) }; }
    j.result = { added: res.added || 0, updated: res.updated || 0, skipped: j.skipped.length + (res.failed || []).length, problems: [...j.skipped, ...(res.failed || [])].slice(0, 500) };
    j.done = true; j.finishedAt = now; delete j.payload;
  });
  writeJobs(list);
  return due;
}
export const getJobs = () => readJobs();

function applyCustomers(j) {
  const book = new Set(getCustomers().map((c) => c.phone));
  const dir = getDirectory();
  const byId = new Map(dir.map((c) => [c.id, c]));
  const adds = [], patches = {}, failed = [];
  let updated = 0;
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  j.payload.forEach((p) => {
    const r = p.rec;
    const ext = r.oldId ? [{ source: r.source, value: r.oldId, at: Date.now() }] : [];
    if (p.status === 'new') {
      if (book.has(String(r.phone).replace(/^\+/, ''))) { failed.push({ n: p.n, name: p.name, why: 'Added meanwhile (skipped)' }); return; }
      adds.push({ name: r.name, phone: r.phone, address: r.address, types: r.types, signup: today, src: 'Import', addedFrom: 'Import', email: r.email, tags: r.tags, externalIds: ext });
      return;
    }
    const c = byId.get(p.match);
    if (!c) { failed.push({ n: p.n, name: p.name, why: 'Customer not found any more' }); return; }
    // fill what is missing; never overwrite the name, phone or what the shop already has
    const patch = {};
    if (r.email && !(c.emails || []).some((e) => String(e.value).toLowerCase() === r.email)) patch.emails = [...(c.emails || []).map((e) => ({ ...e })), { value: r.email, label: 'Personal', verified: false, primary: !(c.emails || []).length }];
    const tags = [...new Set([...(c.tags || []), ...r.tags])];
    if (tags.length !== (c.tags || []).length) patch.tags = tags;
    if (ext.length && !(c.externalIds || []).some((x) => x.source === r.source && String(x.value).toLowerCase() === r.oldId.toLowerCase())) patch.externalIds = [...(c.externalIds || []), ...ext];
    if (r.address && (!c.address || c.address === '—')) patch.address = r.address;
    if (Object.keys(patch).length) { patches[c.id] = { ...(patches[c.id] || {}), ...patch }; updated += 1; }
    else failed.push({ n: p.n, name: p.name, why: 'Nothing new for ' + c.name });
  });
  const saved = addCustomers(adds);
  if (Object.keys(patches).length) updateIdentities(patches);
  return { added: saved.length, updated, failed };
}
function applyStock(j) {
  const holds = getHolds(), moves = getMoves(), transfers = getTransfers();
  const list = [], failed = [];
  let updated = 0, added = 0;
  j.payload.forEach((p) => {
    const r = p.rec;
    let onHand = 0;
    try { onHand = stockAt(r.sku, r.place, holds, moves, transfers).onHand || 0; } catch { onHand = 0; }
    const change = j.opts.mode === 'add' ? r.qty : r.qty - onHand;
    if (!change) { failed.push({ n: p.n, name: p.name, why: 'Already ' + r.qty + ' on hand' }); return; }
    list.push({ sku: r.sku, place: r.place, qty: change, kind: 'opening', reason: 'Opening stock (import ' + j.id + ')', by: j.by, ref: j.id, op: j.id + ':' + p.n });
    if (onHand) updated += 1; else added += 1;
  });
  const posted = addMovesBatch(list);
  if (posted < list.length) return { added: 0, updated: 0, failed: [...failed, ...list.map((m) => ({ n: Number(m.op.split(':')[1]), name: m.sku, why: 'Not saved' }))] };
  return { added, updated, failed };
}
function applyOrders(j) {
  const have = importedOrders();
  const keys = new Set(have.map((o) => o.source + ':' + o.number.toLowerCase()));
  const fresh = [], failed = [];
  j.payload.forEach((p) => {
    const r = p.rec;
    if (keys.has(r.source + ':' + r.number.toLowerCase())) { failed.push({ n: p.n, name: p.name, why: 'Imported before' }); return; }
    keys.add(r.source + ':' + r.number.toLowerCase());
    fresh.push({ ...r, id: 'IMP-' + r.number, job: j.id });
  });
  try { window.localStorage.setItem(ORDERS_KEY, JSON.stringify([...fresh, ...have])); } catch { return { added: 0, failed: [...failed, ...fresh.map((o) => ({ n: 0, name: '#' + o.number, why: 'Not saved: browser storage is full' }))] }; }
  return { added: fresh.length, failed };
}

/** Past orders brought in from another system (read only), newest first. */
export function importedOrders() {
  if (ssr()) return [];
  try { return (JSON.parse(window.localStorage.getItem(ORDERS_KEY)) || []).slice().sort((a, b) => b.at - a.at); } catch { return []; }
}
/** A customer's imported past orders (by customer ID or phone). */
export const importedOrdersOf = (id, phone) => { const d = normalizePhone(phone || ''); return importedOrders().filter((o) => (id && o.customerId === id) || (d && o.phone === d)); };

// ---- templates --------------------------------------------------------------------------------------------------------
export function templateCsv(kind) {
  if (kind === 'customers') return [
    ['Name', 'Mobile', 'Email', 'Address', 'City', 'Type', 'Tags', 'Customer ID'],
    ['Farzana Akter', '01712-345678', 'farzana@example.com', 'House 5, Road 3, Dhanmondi', 'Dhaka', 'Online', 'VIP', 'OLD-1001'],
    ['Karim Uddin', '+8801819000111', '', 'Shop 12, New Market', 'Chattogram', 'Retail', 'Wholesale buyer', 'OLD-1002'],
    // the same number as a customer the demo shop already has, written another way: matched, not added twice
    ['Nusrat Jahan', '+880 1553-336655', 'nusrat.j@example.com', '', 'Dhaka', 'Online', 'Repeat buyer', 'OLD-1003'],
  ];
  if (kind === 'stock') return [
    ['SKU', 'Place', 'Quantity'],
    ['PH-GAL-A15', 'Central Warehouse', '25'],
    ['8941100100011', 'Dhanmondi branch', '60'],
  ];
  return [
    ['Order number', 'Date', 'Customer', 'Mobile', 'Item', 'SKU', 'Quantity', 'Unit price', 'Order total', 'Status', 'Payment'],
    ['10045', '2026-03-14', 'Farzana Akter', '01712-345678', 'Phone case', '', '2', '350', '1050', 'Delivered', 'Cash on delivery'],
    ['10045', '2026-03-14', 'Farzana Akter', '01712-345678', 'Screen protector', '', '1', '350', '1050', 'Delivered', 'Cash on delivery'],
    ['10046', '15/03/2026', 'Karim Uddin', '01819-000111', 'Power bank 10000 mAh', '', '1', '1800', '1800', 'Cancelled', 'bKash'],
  ];
}
export const sourceLabel = (s) => SOURCES[s] || EXTERNAL_SOURCES[s] || 'File';
