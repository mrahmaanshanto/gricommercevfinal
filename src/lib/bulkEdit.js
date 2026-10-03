// bulkEdit — the spreadsheet bulk editor's logic (Nayeem's Product brief #1 › "Bulk Editor requirements": configurable
// columns, formula actions, preview before apply, validation and per-row errors, jobs, audit history, rollback).
//
//   COLUMNS                  the product fields the editor can change (stock is not one: stock changes are adjustments)
//   applyFormula(text, cur, p, field)  "+10%", "-5%", "+100", "-৳100", "x1.1", "=cost*1.3", "=price-50", or a plain value
//   previewChanges(products, edits)    edits { id: { field: text } } → [{ id, name, field, before, after, error }]
//   runJob(changes, { by, note })      saves every valid change (one product version each) as a job: JOB-0001 …
//   getJobs() · rollbackJob(id)        rollback puts back the old value where nobody changed the field since
// Front end only: jobs in gc.products.bulkJobs; products through products.js › saveProduct.

import { allProducts, saveProduct, codeOwner } from './products';

const KEY = 'gc.products.bulkJobs';
export const BULK_EVENT = 'gc:bulk-jobs';

export const COLUMNS = [
  { k: 'name', label: 'Title', type: 'text', always: true },
  { k: 'price', label: 'Selling price', type: 'money' },
  { k: 'mrp', label: 'MRP', type: 'money' },
  { k: 'cost', label: 'Estimated cost', type: 'money' },
  { k: 'wholesale', label: 'Wholesale price', type: 'money', ws: true },
  { k: 'moq', label: 'Minimum order', type: 'int', ws: true },
  { k: 'st', label: 'Status', type: 'status' },
  { k: 'sku', label: 'SKU', type: 'code' },
  { k: 'barcode', label: 'Barcode', type: 'code' },
  { k: 'cat', label: 'Category', type: 'text' },
  { k: 'brand', label: 'Brand', type: 'text' },
  { k: 'tags', label: 'Tags', type: 'tags' },
  { k: 'seoT', label: 'Page title', type: 'text' },
  { k: 'seoD', label: 'Meta description', type: 'text' },
];
export const DEFAULT_COLS = ['price', 'mrp', 'cost', 'st'];
export const STATUSES = { active: 'Active', draft: 'Draft', archived: 'Archived' };
export const colBy = (k) => COLUMNS.find((c) => c.k === k) || null;

const num = (v) => (v === null || v === undefined || v === '' || Number.isNaN(Number(v)) ? null : Number(v));
const r2 = (n) => Math.round(n * 100) / 100;
/** The value a cell shows. */
export function cellText(p, k) {
  const v = p[k];
  if (k === 'tags') return (v || []).join(', ');
  if (k === 'st') return STATUSES[v] || v || '';
  return v == null ? '' : String(v);
}

/**
 * Work out a cell's new value from what was typed. Returns { value } or { error }.
 *   numbers: "+10%" "-5%" "x1.1" "+100" "-৳100" "=cost*1.3" "=price-50" "=mrp*0.9" "1250"
 *   tags: "+new tag" adds, "-old tag" removes, anything else replaces
 *   text: "+ suffix" appends, anything else replaces
 */
export function applyFormula(text, cur, p, field) {
  const col = colBy(field);
  const t = String(text == null ? '' : text).trim();
  if (!col) return { error: 'Unknown column' };
  if (col.type === 'money' || col.type === 'int') {
    if (t === '') return { value: null };
    const clean = t.replace(/[৳,\s]/g, '');
    let v = null, m;
    const base = num(cur);
    if ((m = clean.match(/^([+-])(\d+(?:\.\d+)?)%$/))) { if (base == null) return { error: 'No value to change' }; v = base * (1 + (m[1] === '+' ? 1 : -1) * Number(m[2]) / 100); }
    else if ((m = clean.match(/^[x×*](\d+(?:\.\d+)?)$/i))) { if (base == null) return { error: 'No value to change' }; v = base * Number(m[1]); }
    else if ((m = clean.match(/^([+-])(\d+(?:\.\d+)?)$/))) { if (base == null) return { error: 'No value to change' }; v = base + (m[1] === '+' ? 1 : -1) * Number(m[2]); }
    else if ((m = clean.match(/^=(price|mrp|cost|wholesale)([*x×/+-])(\d+(?:\.\d+)?)(%?)$/i))) {
      const src = num(p[m[1].toLowerCase()]);
      if (src == null) return { error: 'No ' + m[1].toLowerCase() + ' to start from' };
      const k = m[4] ? Number(m[3]) / 100 : Number(m[3]);
      const op = m[2];
      v = op === '+' ? src + (m[4] ? src * k : k) : op === '-' ? src - (m[4] ? src * k : k) : op === '/' ? src / k : src * k;
    } else if ((m = clean.match(/^=(price|mrp|cost|wholesale)$/i))) { v = num(p[m[1].toLowerCase()]); if (v == null) return { error: 'No ' + m[1].toLowerCase() }; }
    else if (/^\d+(\.\d+)?$/.test(clean)) v = Number(clean);
    else return { error: 'Use a number, +10%, -৳100, x1.1 or =cost*1.3' };
    if (v < 0) return { error: 'Can’t be below 0' };
    if (col.type === 'int') { v = Math.round(v); if (v < 1) return { error: 'At least 1' }; }
    else v = col.k === 'price' || col.k === 'mrp' || col.k === 'wholesale' ? Math.round(v) : r2(v);
    if (col.k === 'price' && v === 0) return { error: 'The selling price must be more than ৳0' };
    return { value: v };
  }
  if (col.type === 'status') {
    const k = Object.keys(STATUSES).find((x) => x === t.toLowerCase() || STATUSES[x].toLowerCase() === t.toLowerCase());
    return k ? { value: k } : { error: 'Active, Draft or Archived' };
  }
  if (col.type === 'tags') {
    const list = (cur || []).slice();
    if (/^\+/.test(t)) { const add = t.slice(1).split(',').map((x) => x.trim()).filter(Boolean); return { value: Array.from(new Set(list.concat(add))) }; }
    if (/^-/.test(t)) { const rm = t.slice(1).split(',').map((x) => x.trim().toLowerCase()).filter(Boolean); return { value: list.filter((x) => !rm.includes(x.toLowerCase())) }; }
    return { value: t ? t.split(',').map((x) => x.trim()).filter(Boolean) : [] };
  }
  if (col.k === 'name' && !t) return { error: 'A title is needed' };
  if (col.type === 'code') {
    if (t && codeOwner(col.k, t, p.id)) return { error: 'Used by ' + codeOwner(col.k, t, p.id).name };
    return { value: t };
  }
  if (/^\+\s/.test(t)) return { value: String(cur || '') + ' ' + t.slice(2) };
  if (t.length > 160) return { error: 'Too long' };
  return { value: t };
}

const same = (a, b) => JSON.stringify(a == null ? null : a) === JSON.stringify(b == null ? null : b);
/** What the edits would change: one row per changed cell, with an error when the value can't be used. */
export function previewChanges(products, edits) {
  const out = [];
  products.forEach((p) => {
    const e = edits[p.id] || {};
    // apply columns in table order so "=price*…" uses the new price when price is edited in the same row
    const next = { ...p };
    COLUMNS.forEach((c) => {
      if (!(c.k in e)) return;
      const r = applyFormula(e[c.k], p[c.k], next, c.k);
      if (r.error) { out.push({ id: p.id, name: p.name, field: c.k, label: c.label, before: p[c.k], after: null, error: r.error }); return; }
      if (same(r.value, p[c.k])) return;
      next[c.k] = r.value;
      out.push({ id: p.id, name: p.name, field: c.k, label: c.label, before: p[c.k], after: r.value, error: '' });
    });
  });
  return out;
}

const read = () => { if (typeof window === 'undefined') return []; try { const v = JSON.parse(window.localStorage.getItem(KEY)); return Array.isArray(v) ? v : []; } catch { return []; } };
const write = (list) => { try { window.localStorage.setItem(KEY, JSON.stringify(list)); window.dispatchEvent(new CustomEvent(BULK_EVENT)); } catch { /* ignore */ } };
export const getJobs = () => read();
export const jobBy = (id) => read().find((j) => j.id === id) || null;

/** Save every change without an error as one job. Returns the job. */
export function runJob(changes, { by = 'Staff', note = '' } = {}) {
  const ok = changes.filter((c) => !c.error);
  if (!ok.length) return null;
  const list = read();
  const id = 'JOB-' + String(list.length + 1).padStart(4, '0');
  const byId = new Map(allProducts().map((p) => [p.id, p]));
  const groups = {};
  ok.forEach((c) => { (groups[c.id] = groups[c.id] || {})[c.field] = c.after; });
  Object.keys(groups).forEach((pid) => { const p = byId.get(pid); if (p) saveProduct({ ...p, ...groups[pid] }, { by, note: 'Bulk edit ' + id }); });
  const job = { id, at: Date.now(), by, note, status: 'done', products: Object.keys(groups).length, changes: ok.map((c) => ({ id: c.id, name: c.name, field: c.field, label: c.label, before: c.before, after: c.after })), skipped: changes.length - ok.length };
  write([job, ...list]);
  return job;
}
/** Put back the old values of a job. A field someone changed after the job is left as it is. Returns { back, kept }. */
export function rollbackJob(id, by = 'Staff') {
  const list = read();
  const job = list.find((j) => j.id === id);
  if (!job || job.status !== 'done') return { back: 0, kept: 0 };
  const byId = new Map(allProducts().map((p) => [p.id, p]));
  const groups = {}; let kept = 0;
  job.changes.forEach((c) => {
    const p = byId.get(c.id);
    if (!p || !same(p[c.field], c.after)) { kept++; return; }
    (groups[c.id] = groups[c.id] || {})[c.field] = c.before;
  });
  let back = 0;
  Object.keys(groups).forEach((pid) => { saveProduct({ ...byId.get(pid), ...groups[pid] }, { by, note: 'Rolled back ' + id }); back += Object.keys(groups[pid]).length; });
  write(list.map((j) => (j.id === id ? { ...j, status: 'rolled back', rolledBackAt: Date.now(), rolledBackBy: by, kept } : j)));
  return { back, kept };
}
