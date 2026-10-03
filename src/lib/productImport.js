// productImport — importing products from a CSV file (Nayeem's Product brief #1 › "Import validation: field mapping,
// dry run, row errors, retries").
//   1. parseCsv(text)                 rows of cells (quotes, commas and new lines inside quotes, a UTF-8 BOM)
//   2. autoMap(headers)               which column is which field, guessed from the header names (the user can change it)
//   3. dryRun(rows, mapping, opts)    every row checked without saving: Ready / Warning / Error with the reasons, and
//                                     whether it adds a new product or updates one (same SKU)
//   4. importRows(checked, opts)      saves the Ready and Warning rows; returns { added, updated, skipped, job }
//   templateCsv()                     the header row and two example rows, for "Download template"
// Front end only: products are saved through products.js › saveProduct (each one gets a version); the last imports are
// kept in gc.products.imports.

import { allProducts, saveProduct, newProductId, codeOwner } from './products';
import { gtinOk } from './identifiers';
import { UNITS } from './units';

const KEY = 'gc.products.imports';
export const IMPORT_FIELDS = [
  { k: 'name', label: 'Title', need: true, alias: ['title', 'name', 'product', 'product name', 'item'] },
  { k: 'sku', label: 'SKU', alias: ['sku', 'code', 'item code', 'product code'] },
  { k: 'barcode', label: 'Barcode', alias: ['barcode', 'ean', 'gtin', 'upc', 'ean-13'] },
  { k: 'price', label: 'Selling price', alias: ['price', 'selling price', 'retail price', 'sale price'] },
  { k: 'mrp', label: 'MRP', alias: ['mrp', 'compare at', 'compare-at price', 'regular price'] },
  { k: 'cost', label: 'Cost', alias: ['cost', 'buying price', 'purchase price', 'estimated cost'] },
  { k: 'wholesale', label: 'Wholesale price', alias: ['wholesale', 'wholesale price', 'dealer price'] },
  { k: 'moq', label: 'Minimum order', alias: ['moq', 'minimum order', 'wholesale moq', 'min qty'] },
  { k: 'cat', label: 'Category', alias: ['category', 'categories', 'type', 'product type'] },
  { k: 'brand', label: 'Brand', alias: ['brand', 'vendor', 'maker'] },
  { k: 'st', label: 'Status', alias: ['status', 'state'] },
  { k: 'tags', label: 'Tags', alias: ['tags', 'labels'] },
  { k: 'unit', label: 'Unit', alias: ['unit', 'uom', 'base unit'] },
  { k: 'short', label: 'Short description', alias: ['short description', 'summary'] },
  { k: 'long', label: 'Description', alias: ['description', 'long description', 'body', 'details'] },
];
export const STATUS_OK = { active: 'active', draft: 'draft', archived: 'archived', published: 'active', live: 'active', hidden: 'draft' };

/** CSV text → rows of cells. */
export function parseCsv(text) {
  const s = String(text || '').replace(/^﻿/, '');
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (q) {
      if (ch === '"' && s[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') q = false; else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',' || ch === ';' || ch === '\t') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && s[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => String(c).trim() !== ''));
}
/** Guess the field of each column from its header: { columnIndex: fieldKey | '' }. */
export function autoMap(headers) {
  const used = new Set(), map = {};
  headers.forEach((h, i) => {
    const t = String(h || '').trim().toLowerCase();
    const f = IMPORT_FIELDS.find((x) => !used.has(x.k) && (x.alias.includes(t) || x.label.toLowerCase() === t));
    map[i] = f ? f.k : '';
    if (f) used.add(f.k);
  });
  return map;
}
const money = (v) => { const t = String(v == null ? '' : v).replace(/[৳,\s]|tk|bdt/gi, ''); return t === '' ? null : /^\d+(\.\d+)?$/.test(t) ? Number(t) : NaN; };

/**
 * Check every row without saving. `rows` excludes the header. Returns
 * [{ n (file row number), status ('ready' | 'warning' | 'error'), action ('add' | 'update'), errors, warnings, rec, name }].
 */
export function dryRun(rows, mapping, { updateExisting = true } = {}) {
  const products = allProducts();
  const bySku = new Map(products.filter((p) => p.sku).map((p) => [p.sku.toLowerCase(), p]));
  const seenSku = new Map(), seenBc = new Map();
  return rows.map((cells, i) => {
    const v = {};
    Object.keys(mapping).forEach((ci) => { const k = mapping[ci]; if (k) v[k] = String(cells[ci] == null ? '' : cells[ci]).trim(); });
    const errors = [], warnings = [];
    const name = v.name || '';
    if (!name) errors.push('No title');
    else if (name.length > 120) errors.push('Title over 120 letters');
    const nums = {};
    ['price', 'mrp', 'cost', 'wholesale'].forEach((k) => { if (v[k] == null || v[k] === '') return; const n = money(v[k]); if (Number.isNaN(n)) errors.push(IMPORT_FIELDS.find((f) => f.k === k).label + ' is not a number'); else nums[k] = n; });
    let moq = null;
    if (v.moq) { if (!/^\d+$/.test(v.moq) || Number(v.moq) < 1) errors.push('Minimum order is not a whole number'); else moq = Number(v.moq); }
    const sku = v.sku || '';
    const existing = sku ? bySku.get(sku.toLowerCase()) : null;
    if (sku) {
      if (seenSku.has(sku.toLowerCase())) errors.push('SKU also on row ' + seenSku.get(sku.toLowerCase()));
      else seenSku.set(sku.toLowerCase(), i + 2);
      if (existing && !updateExisting) errors.push('SKU already used by “' + existing.name + '”');
    }
    if (v.barcode) {
      if (seenBc.has(v.barcode)) errors.push('Barcode also on row ' + seenBc.get(v.barcode));
      else seenBc.set(v.barcode, i + 2);
      const owner = codeOwner('barcode', v.barcode, existing ? existing.id : '');
      if (owner) errors.push('Barcode used by “' + owner.name + '”');
      else if (!gtinOk(v.barcode)) warnings.push('Barcode is not a valid GTIN: saved as an in-store code');
    }
    let st = 'active';
    if (v.st) { st = STATUS_OK[v.st.toLowerCase()]; if (!st) { errors.push('Status must be Active, Draft or Archived'); st = 'draft'; } }
    if (nums.price == null && nums.wholesale == null) { warnings.push('No price: saved as a draft'); st = 'draft'; }
    if (!v.cat) warnings.push('No category');
    if (nums.mrp != null && nums.price != null && nums.mrp < nums.price) warnings.push('MRP is below the selling price');
    let unit = 'pc';
    if (v.unit) { const u = UNITS.find((x) => x.k === v.unit.toLowerCase() || x.label.toLowerCase() === v.unit.toLowerCase() || x.short === v.unit.toLowerCase()); if (u) unit = u.k; else warnings.push('Unknown unit “' + v.unit + '”: set to Piece'); }
    const base = existing && updateExisting ? existing : null;
    const rec = {
      ...(base || {}), id: base ? base.id : newProductId() + i, name, sku, st: base && !v.st ? base.st : st,
      ...(v.barcode ? { barcode: v.barcode, barcodeType: gtinOk(v.barcode) && v.barcode[0] !== '2' ? 'gtin' : 'internal' } : {}),
      ...(nums.price != null ? { price: nums.price } : {}), ...(nums.mrp != null ? { mrp: nums.mrp } : {}), ...(nums.cost != null ? { cost: nums.cost } : {}),
      ...(nums.wholesale != null ? { wholesale: nums.wholesale, sell: nums.price != null ? 'both' : 'wholesale' } : {}), ...(moq != null ? { moq } : {}),
      ...(v.cat ? { cat: v.cat.replace(/\s*[>/]\s*/g, ' › ') } : {}), ...(v.brand ? { brand: v.brand } : {}),
      ...(v.tags ? { tags: v.tags.split(/[,|]/).map((x) => x.trim()).filter(Boolean) } : {}),
      ...(v.short ? { short: v.short } : {}), ...(v.long ? { long: v.long } : {}), ...(v.unit ? { unit } : {}),
    };
    if (!base) { rec.inv = 0; rec.loc = 0; }
    return { n: i + 2, name: name || '(no title)', status: errors.length ? 'error' : warnings.length ? 'warning' : 'ready', action: base ? 'update' : 'add', errors, warnings, rec };
  });
}
/** Save the Ready and Warning rows. Returns { added, updated, skipped, job }. */
export function importRows(checked, { by = 'Staff', file = '' } = {}) {
  let added = 0, updated = 0, skipped = 0;
  checked.forEach((r) => {
    if (r.status === 'error') { skipped++; return; }
    saveProduct(r.rec, { by, note: 'Imported' + (file ? ' from ' + file : '') });
    if (r.action === 'update') updated++; else added++;
  });
  const job = { id: 'IMP-' + Date.now().toString(36).toUpperCase(), at: Date.now(), by, file, added, updated, skipped };
  try { const list = JSON.parse(window.localStorage.getItem(KEY)) || []; window.localStorage.setItem(KEY, JSON.stringify([job, ...list].slice(0, 20))); } catch { /* ignore */ }
  return { added, updated, skipped, job };
}
export const recentImports = () => { try { return JSON.parse(window.localStorage.getItem(KEY)) || []; } catch { return []; } };
/** The template: headers and two example rows. */
export function templateCsv() {
  return [
    ['Title', 'SKU', 'Barcode', 'Selling price', 'MRP', 'Cost', 'Wholesale price', 'Minimum order', 'Category', 'Brand', 'Status', 'Tags', 'Unit'],
    ['Cotton Panjabi · White', 'CL-PNJ-WH', '', '1890', '2200', '1100', '', '', 'Clothing › Men', 'GridShop', 'Active', 'Eid, Cotton', 'Piece'],
    ['Basin Mixer Tap', 'HW-MIX-01', '8941600100014', '4500', '5200', '3100', '3900', '6', 'Home', 'RAK', 'Draft', 'Bathroom', 'Piece'],
  ];
}
