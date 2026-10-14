// productCategories — the shop's product categories (Products › Categories): one tree that the Categories page edits
// and the product form's category picker, All products' Change category and its filter read.
// (lib/categories.js is a different list: income and expense categories for the books.)
//
// A category: { id, name, p (parent id, '' = top level), desc, hidden (not in the shop menu), featured,
//   tax, wp, sg, track, unit (shop defaults shown on the page; the demo's top-level categories have them) }.
// Its path is the names from the top, joined with ' › ' ('Accessories › Cases & covers'): products keep their
// category as that path (products.js › cat, subcats).
//   getCategories()            the tree in order (parents before their children), each with lv (0–2) and path
//   categoryPaths()            every path
//   productsIn(path)           products (not deleted) whose category or a subcategory is this one or inside it
//   addCategory({ name, parent })                         → { ok, error, cat }
//   saveCategory(id, { name, parent, desc, hidden, featured })  → { ok, error, moved } — a new name or place moves the
//                              products and the category's template defaults (productTemplates.js) with it
//   deleteCategory(id)         → { ok, error } — only an empty category with nothing inside it
//   importCategories(csvText)  → { added, skipped, errors } (Categories › Import)
//   formTables(list)           the shape the product form uses: [[name, isSub, label]], parent (name → top name),
//                              mains, path (name → path)
// Names are unique in the whole tree (the product form picks a category by its name). At most three levels.
// Front end only: kept in this browser (gc.products.categories) once changed; the demo tree until then.

import { allProducts, getSavedProducts, saveProduct } from './products';
import { categoryDefaults, setCategoryTemplate } from './productTemplates';
import { toHandle } from './handles';
import { autoRedirect } from './redirects';

const KEY = 'gc.products.categories';
export const CATEGORIES_EVENT = 'gc:categories';
const MAX_LV = 2;
const SEP = ' › ';
const C = (id, name, p, extra) => ({ id, name, p: p || '', ...(extra || {}) });
const VAT = 'Standard VAT 15%';
// Dazzle Shop's categories (a mobile phone shop)
export const CATEGORY_SEED = [
  C('ph', 'Phones', '', { tax: VAT, wp: '1 year official brand warranty', sg: 'No size guide', track: 'IMEI', unit: 'Piece' }),
  C('sm', 'Smartphones', 'ph'), C('fp', 'Feature phones', 'ph'),
  C('tab', 'Tablets', '', { tax: VAT, wp: '1 year official brand warranty', sg: 'No size guide', track: 'IMEI', unit: 'Piece' }),
  C('acc', 'Accessories', '', { tax: VAT, wp: '6 months shop warranty', sg: 'Case sizes by model', track: 'No tracking', unit: 'Piece' }),
  C('cse', 'Cases & covers', 'acc'), C('sil', 'Silicone cases', 'cse'), C('arm', 'Rugged cases', 'cse'),
  C('chg', 'Chargers & cables', 'acc'), C('scr', 'Screen protection', 'acc'), C('hld', 'Holders & stands', 'acc'), C('bat', 'Batteries', 'acc', { hidden: true }),
  C('aud', 'Audio', '', { tax: VAT, wp: '6 months shop warranty', sg: 'No size guide', track: 'Serial number', unit: 'Piece' }),
  C('ebd', 'Earbuds', 'aud'), C('eph', 'Earphones', 'aud'),
  C('wr', 'Wearables', '', { tax: VAT, wp: '1 year official brand warranty', sg: 'Strap sizes', track: 'Serial number', unit: 'Piece' }),
  C('pb', 'Power banks', '', { tax: VAT, wp: '6 months shop warranty', sg: 'No size guide', track: 'No tracking', unit: 'Piece' }),
  C('svc', 'Services', ''), C('rpr', 'Repairs', 'svc'),
  C('sw', 'Software', ''), C('dig', 'Digital', ''), C('gft', 'Gifts', ''),
];

const read = () => {
  if (typeof window === 'undefined') return null;
  try { const v = JSON.parse(window.localStorage.getItem(KEY)); return Array.isArray(v) ? v : null; } catch { return null; }
};
const write = (list) => {
  const clean = list.map(({ lv, path, ...c }) => c);   // eslint-disable-line no-unused-vars
  try { window.localStorage.setItem(KEY, JSON.stringify(clean)); window.dispatchEvent(new CustomEvent(CATEGORIES_EVENT)); } catch { /* ignore */ }
};

/** The tree in order, each with lv and path. `raw` = a stored list (default: this browser's, else the demo tree). */
export function getCategories(raw) {
  const src = (raw || read() || CATEGORY_SEED).filter((c) => c && c.id && c.name);
  const by = new Map(src.map((c) => [c.id, c]));
  const out = [];
  const walk = (pid, lv, path) => src.filter((c) => (c.p || '') === pid && (pid === '' || by.has(pid))).forEach((c) => {
    const pth = path ? path + SEP + c.name : c.name;
    out.push({ ...c, p: c.p || '', lv, path: pth });
    if (lv < 5) walk(c.id, lv + 1, pth);
  });
  walk('', 0, '');
  return out;
}
/** A category's web address: its own handle, else made from its name (dazzleshop.com.bd/collections/<handle>). */
export const categoryHandle = (c) => (c && (c.handle || toHandle(c.name))) || '';
export const categoryPaths = (list = getCategories()) => list.map((c) => c.path);
const under = (path, x) => !!x && (x === path || String(x).indexOf(path + SEP) === 0);

/** Products (not deleted) filed in this category or inside it, as their category or a subcategory. */
export function productsIn(path, products = allProducts(getSavedProducts())) {
  if (!path) return [];
  return products.filter((p) => p.st !== 'deleted' && (under(path, p.cat) || (Array.isArray(p.subcats) && p.subcats.some((x) => under(path, x)))));
}

/** A problem with a category name ('' when it can be saved). */
export function checkName(name, id, list = getCategories()) {
  const n = String(name || '').trim();
  if (!n) return 'Enter a category name.';
  if (n.length < 2) return 'Use at least 2 letters.';
  if (n.length > 60) return 'Keep the name under 60 letters.';
  if (n.indexOf('›') >= 0) return 'A name can’t contain “›”.';
  const other = list.find((c) => c.id !== id && c.name.toLowerCase() === n.toLowerCase());
  if (other) return 'There is already a category called “' + other.name + '”.';
  return '';
}
const depthBelow = (id, list) => { const kids = list.filter((c) => c.p === id); return kids.length ? 1 + Math.max(...kids.map((k) => depthBelow(k.id, list))) : 0; };

export function addCategory({ name, parent } = {}) {
  const list = getCategories();
  const error = checkName(name, '', list);
  if (error) return { ok: false, error };
  const par = parent ? list.find((c) => c.id === parent) : null;
  if (par && par.lv >= MAX_LV) return { ok: false, error: 'Categories go three levels deep at most. Pick a higher one.' };
  const cat = { id: 'c-' + Date.now().toString(36), name: String(name).trim(), p: par ? par.id : '' };
  write(list.concat(cat));
  return { ok: true, error: '', cat: getCategories().find((c) => c.id === cat.id) };
}

/** Move products and template defaults from one path to another. Returns how many products moved. */
function movePath(from, to) {
  if (!from || from === to) return 0;
  const swap = (x) => (under(from, x) ? to + String(x).slice(from.length) : x);
  let n = 0;
  allProducts(getSavedProducts()).forEach((p) => {
    const subs = Array.isArray(p.subcats) ? p.subcats : null;
    if (!under(from, p.cat) && !(subs && subs.some((x) => under(from, x)))) return;
    const rec = JSON.parse(JSON.stringify(p));
    ['savedAt', 'version', 'savedNew', 'vars'].forEach((k) => { delete rec[k]; });
    rec.cat = swap(rec.cat);
    if (subs) rec.subcats = subs.map(swap);
    saveProduct(rec, { note: 'Category ' + from + ' is now ' + to });
    n++;
  });
  const defs = categoryDefaults();
  Object.keys(defs).filter((k) => under(from, k)).forEach((k) => { setCategoryTemplate(swap(k), defs[k].template, defs[k].values); });
  return n;
}

export function saveCategory(id, patch = {}) {
  const list = getCategories();
  const cur = list.find((c) => c.id === id);
  if (!cur) return { ok: false, error: 'This category no longer exists.' };
  const name = patch.name != null ? String(patch.name).trim() : cur.name;
  const error = checkName(name, id, list);
  if (error) return { ok: false, error };
  const parent = patch.parent != null ? patch.parent : cur.p;
  if (parent) {
    const par = list.find((c) => c.id === parent);
    if (!par) return { ok: false, error: 'Pick where it goes.' };
    if (par.id === id || under(cur.path, par.path)) return { ok: false, error: 'A category can’t go inside itself.' };
    if (par.lv + 1 + depthBelow(id, list) > MAX_LV) return { ok: false, error: 'Categories go three levels deep at most. Pick a higher one.' };
  }
  const next = list.map((c) => (c.id === id ? { ...c, name, p: parent || '', ...pick(patch, ['desc', 'hidden', 'featured', 'handle', 'seo', 'image', 'imageAlt']) } : c));
  write(next);
  const now = getCategories().find((c) => c.id === id);
  // a category in the shop menu whose address changed keeps its old address working
  if (!cur.hidden && categoryHandle(cur) !== categoryHandle(now)) autoRedirect('/collections/' + categoryHandle(cur), '/collections/' + categoryHandle(now), cur.name !== now.name ? 'Category renamed' : 'Category address changed');
  const moved = movePath(cur.path, now.path);
  return { ok: true, error: '', moved, cat: now };
}
const pick = (o, keys) => keys.reduce((a, k) => (o[k] !== undefined ? { ...a, [k]: o[k] } : a), {});

/** Delete an empty category (no products, nothing inside it). */
export function deleteCategory(id) {
  const list = getCategories();
  const cur = list.find((c) => c.id === id);
  if (!cur) return { ok: false, error: 'This category no longer exists.' };
  const kids = list.filter((c) => c.p === id).length;
  if (kids) return { ok: false, error: kids === 1 ? 'It has a category inside it. Move or delete that one first.' : 'It has ' + kids + ' categories inside it. Move or delete them first.' };
  const n = productsIn(cur.path).length;
  if (n) return { ok: false, error: (n === 1 ? '1 product is' : n + ' products are') + ' in it. Move ' + (n === 1 ? 'it' : 'them') + ' to another category first.' };
  write(list.filter((c) => c.id !== id));
  return { ok: true, error: '' };
}

/** Add the categories in a CSV (name, parent, description, show_in_menu; a parent listed before its children).
 *  Categories that already exist are skipped. Returns { added, skipped, errors: ['Row 3: …'] }. */
export function importCategories(text) {
  const rows = parseCsv(String(text || ''));
  const head = (rows.shift() || []).map((h) => h.trim().toLowerCase());
  const col = (k) => head.indexOf(k);
  const out = { added: 0, skipped: 0, errors: [] };
  if (col('name') < 0) { out.errors.push('The first row must name the columns, with a “name” column.'); return out; }
  rows.forEach((r, i) => {
    const name = String(r[col('name')] || '').trim();
    if (!name) return;
    const list = getCategories();
    if (list.some((c) => c.name.toLowerCase() === name.toLowerCase())) { out.skipped++; return; }
    const pn = col('parent') >= 0 ? String(r[col('parent')] || '').trim() : '';
    const par = pn ? list.find((c) => c.name.toLowerCase() === pn.toLowerCase()) : null;
    if (pn && !par) { out.skipped++; out.errors.push('Row ' + (i + 2) + ': no category called “' + pn + '”.'); return; }
    const res = addCategory({ name, parent: par ? par.id : '' });
    if (!res.ok) { out.skipped++; out.errors.push('Row ' + (i + 2) + ': ' + res.error); return; }
    const desc = col('description') >= 0 ? String(r[col('description')] || '').trim() : '';
    const menu = col('show_in_menu') >= 0 ? String(r[col('show_in_menu')] || '').trim().toLowerCase() : '';
    if (desc || menu === 'no') saveCategory(res.cat.id, { desc: desc || undefined, hidden: menu === 'no' ? true : undefined });
    out.added++;
  });
  return out;
}
function parseCsv(t) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (q) { if (ch === '"' && t[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') q = false; else cell += ch; continue; }
    if (ch === '"') q = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && t[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.map((r) => r.map((c) => c.replace(/^﻿/, ''))).filter((r) => r.some((c) => c.trim()));
}

/** The product form's tables (see the header). */
export function formTables(list = getCategories()) {
  const by = new Map(list.map((c) => [c.id, c]));
  const top = (c) => { let x = c; while (x.p && by.has(x.p)) x = by.get(x.p); return x; };
  const cats = [], parent = {}, path = {}, mains = [];
  list.forEach((c) => {
    path[c.name] = c.path;
    if (!c.lv) { mains.push(c.name); cats.push([c.name, 0, c.name]); return; }
    const t = top(c);
    parent[c.name] = t.name;
    cats.push([c.name, 1, c.path.slice(t.name.length + SEP.length)]);
  });
  return { cats, parent, mains, path };
}
