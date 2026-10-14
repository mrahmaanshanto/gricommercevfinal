// redirects — Online Store › SEO › Redirects and Not found (review item ON-F19).
//   A redirect: { id, from, to, type 301 (moved for good) | 302 (for now), auto (made when an address changed), note, at, hits }
//   Paths are the live website's ("/products/galaxy-a15"); a full https://dazzleshop.com.bd/… address is cut to its path.
//
//   getRedirects() · addRedirect({ from, to, type, note }) → { ok, error, redirect } · updateRedirect(id, patch)
//   deleteRedirects(ids) · importRedirects(csvText) → { added, skipped, errors[] } · redirectsCsv()
//   autoRedirect(oldPath, newPath, note) — when a live item's address changes (store pages, posts, products, categories
//     and landing pages call it from their save): old → new, and redirects that pointed at the old address now point at
//     the new one, so no chain is made; a redirect from the new address is dropped (it would loop)
//   resolve(path) → { to, type, hops } (follows up to 5 hops) · problemsOf(list) → { [id]: 'loop'|'chain'|'self'|'dup' }
//   Not found log: getMisses() · logMiss(path, from) · dismissMiss(path) · fixMiss(path, to)
// Front end only: kept in this browser (gc.seo.redirects). The live website's server answers with the redirect; the
// demo's customer views (/page, /product …) follow it in the browser and log addresses they can't find.

import { SITE } from './seo';

const KEY = 'gc.seo.redirects';
export const SEO_EVENT = 'gc:seo';
const DAY = 864e5;

export function normPath(p) {
  let s = String(p || '').trim();
  s = s.replace(/^https?:\/\/(www\.)?[^/]+/i, '');
  if (!s) return '';
  if (s[0] !== '/') s = '/' + s;
  s = s.split('#')[0];
  if (s.length > 1) s = s.replace(/\/+$/, '');
  return s.toLowerCase();
}
const isExternal = (p) => /^https?:\/\//i.test(String(p || '').trim()) && String(p).indexOf(SITE) < 0;
const target = (p) => (isExternal(p) ? String(p).trim() : normPath(p));

function seed() {
  const now = Date.now();
  const r = (id, from, to, type, auto, days, hits, note) => ({ id, from, to, type, auto, note: note || '', at: new Date(now - days * DAY).toISOString(), hits });
  return {
    list: [
      r('rd-1', '/products/galaxy-a14-6-128gb', '/products/galaxy-a15-6-128gb', 301, true, 41, 212, 'Product renamed'),
      r('rd-2', '/pages/about', '/pages/about-us', 301, false, 120, 88, 'Old address from the first website'),
      r('rd-3', '/collections/covers', '/collections/cases-and-covers', 301, true, 63, 57, 'Category renamed'),
      r('rd-4', '/blog/eid-offer', '/pages/return-refund', 302, false, 9, 14, 'Offer over: send people to the policy for now'),
      r('rd-5', '/products/iphone-13', '/products/iphone-15-128gb', 301, false, 150, 301, 'Old model, sold out'),
    ],
    misses: [
      { path: '/products/iphone-14-pro', hits: 38, last: new Date(now - 0.2 * DAY).toISOString(), from: 'google.com' },
      { path: '/collections/smart-watch', hits: 19, last: new Date(now - 0.6 * DAY).toISOString(), from: 'facebook.com' },
      { path: '/blog/best-phone-under-15000', hits: 12, last: new Date(now - 1.4 * DAY).toISOString(), from: 'google.com' },
      { path: '/pages/emi-offer', hits: 7, last: new Date(now - 3 * DAY).toISOString(), from: 'Direct' },
      { path: '/products/redmi-note-12', hits: 5, last: new Date(now - 5 * DAY).toISOString(), from: 'google.com' },
    ],
  };
}

let cache = { raw: undefined, db: null };
function read() {
  if (typeof window === 'undefined') return { list: [], misses: [] };
  let raw = null;
  try { raw = window.localStorage.getItem(KEY); } catch { /* ignore */ }
  if (raw === cache.raw && cache.db) return cache.db;
  let db = null;
  try { db = raw ? JSON.parse(raw) : null; } catch { db = null; }
  if (!db || !Array.isArray(db.list)) db = seed();
  if (!Array.isArray(db.misses)) db.misses = [];
  cache = { raw, db };
  return db;
}
function write(db) {
  try {
    const raw = JSON.stringify(db);
    window.localStorage.setItem(KEY, raw);
    cache = { raw, db };
    window.dispatchEvent(new CustomEvent(SEO_EVENT));
  } catch { /* ignore */ }
  return db;
}
const uid = () => 'rd-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

export const getRedirects = () => read().list.slice().sort((a, b) => new Date(b.at) - new Date(a.at));

function check(from, to, list, selfId) {
  if (!from) return 'Enter the old address.';
  if (!to) return 'Enter where it should go.';
  if (from === '/') return 'The home page can’t be redirected.';
  if (from === to) return 'The old and new addresses are the same.';
  if (list.some((x) => x.id !== selfId && x.from === from)) return 'There is already a redirect from ' + from + '.';
  // would it loop? follow the new address through the other redirects
  let cur = to, n = 0;
  while (n++ < 10) {
    const next = list.find((x) => x.id !== selfId && x.from === cur);
    if (!next) break;
    if (next.to === from) return 'This would go round in a loop: ' + to + ' already leads back to ' + from + '.';
    cur = next.to;
  }
  return '';
}

export function addRedirect({ from, to, type = 301, note = '', auto = false } = {}) {
  const db = read();
  const f = normPath(from), t = target(to);
  const error = check(f, t, db.list);
  if (error) return { ok: false, error };
  const redirect = { id: uid(), from: f, to: t, type: Number(type) === 302 ? 302 : 301, auto: !!auto, note: String(note || ''), at: new Date().toISOString(), hits: 0 };
  write({ ...db, list: [redirect, ...db.list], misses: db.misses.filter((m) => m.path !== f) });
  return { ok: true, error: '', redirect };
}
export function updateRedirect(id, patch = {}) {
  const db = read();
  const cur = db.list.find((x) => x.id === id);
  if (!cur) return { ok: false, error: 'This redirect is gone.' };
  const next = { ...cur, ...patch, from: patch.from != null ? normPath(patch.from) : cur.from, to: patch.to != null ? target(patch.to) : cur.to, type: Number(patch.type || cur.type) === 302 ? 302 : 301 };
  const error = check(next.from, next.to, db.list, id);
  if (error) return { ok: false, error };
  write({ ...db, list: db.list.map((x) => (x.id === id ? next : x)) });
  return { ok: true, error: '', redirect: next };
}
export function deleteRedirects(ids) {
  const set = new Set([].concat(ids));
  const db = read();
  write({ ...db, list: db.list.filter((x) => !set.has(x.id)) });
}

/** A live item's address changed: old → new, with no chains or loops left behind. Returns the redirect or null. */
export function autoRedirect(oldPath, newPath, note = 'Address changed') {
  const f = normPath(oldPath), t = normPath(newPath);
  if (!f || !t || f === t || typeof window === 'undefined') return null;
  const db = read();
  const list = db.list
    .filter((x) => x.from !== t)                                  // going back to an old address: its redirect would loop
    .map((x) => (x.to === f ? { ...x, to: t, note: x.note || 'Pointed at the new address' } : x)); // no chains
  const existing = list.find((x) => x.from === f);
  const redirect = existing ? { ...existing, to: t, type: 301, auto: true, note, at: new Date().toISOString() } : { id: uid(), from: f, to: t, type: 301, auto: true, note, at: new Date().toISOString(), hits: 0 };
  write({ ...db, list: existing ? list.map((x) => (x.id === existing.id ? redirect : x)) : [redirect, ...list], misses: db.misses.filter((m) => m.path !== f) });
  return redirect;
}

/** Where a path ends up: { to, type, hops } or null. Counts a hit on the first redirect. */
export function resolve(path, { count = false } = {}) {
  const db = read();
  let cur = normPath(path), hops = 0, type = 301, first = null;
  while (hops < 5) {
    const r = db.list.find((x) => x.from === cur);
    if (!r) break;
    if (!first) first = r;
    if (r.type === 302) type = 302;
    cur = r.to; hops++;
    if (isExternal(cur)) break;
  }
  if (!first) return null;
  if (count) write({ ...db, list: db.list.map((x) => (x.id === first.id ? { ...x, hits: (x.hits || 0) + 1 } : x)) });
  return { to: cur, type, hops };
}

/** Redirects that need a look: { [id]: 'loop' | 'chain' | 'self' }. */
export function problemsOf(list = getRedirects()) {
  const out = {};
  const by = new Map(list.map((x) => [x.from, x]));
  list.forEach((x) => {
    if (x.from === x.to) { out[x.id] = 'self'; return; }
    let cur = x.to, n = 0;
    const seen = new Set([x.from]);
    while (by.has(cur) && n++ < 10) {
      if (seen.has(cur)) { out[x.id] = 'loop'; return; }
      seen.add(cur);
      cur = by.get(cur).to;
    }
    if (by.has(x.to)) out[x.id] = 'chain';
  });
  return out;
}
export const PROBLEM_WORD = { loop: 'Goes round in a loop', chain: 'Goes through another redirect', self: 'Points at itself' };
/** Point a chained redirect straight at the end of its chain. */
export function shortenChain(id) {
  const db = read();
  const x = db.list.find((r) => r.id === id);
  if (!x) return { ok: false, error: 'This redirect is gone.' };
  const end = resolve(x.to);
  if (!end) return { ok: true };
  return updateRedirect(id, { to: end.to });
}

// ---- CSV ------------------------------------------------------------------------------------------------
function parseCsv(text) {
  return String(text || '').split(/\r?\n/).filter((l) => l.trim()).map((l) => {
    const out = []; let cur = '', q = false;
    for (let i = 0; i < l.length; i++) {
      const c = l[i];
      if (q) { if (c === '"' && l[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
      else if (c === '"') q = true; else if (c === ',') { out.push(cur); cur = ''; } else cur += c;
    }
    out.push(cur);
    return out.map((x) => x.trim());
  });
}
/** Rows "old address, new address, type (301/302, optional)"; a first row with "from" or "old" is a header. */
export function importRedirects(text) {
  const rows = parseCsv(text);
  if (rows.length && /^(from|old|redirect from)/i.test(rows[0][0] || '')) rows.shift();
  let added = 0, skipped = 0;
  const errors = [];
  rows.forEach((r, i) => {
    const res = addRedirect({ from: r[0], to: r[1], type: /302/.test(r[2] || '') ? 302 : 301, note: 'Imported' });
    if (res.ok) added++; else if (/already a redirect/.test(res.error)) skipped++; else errors.push('Row ' + (i + 1) + ': ' + res.error);
  });
  return { added, skipped, errors };
}
export function redirectsCsv(list = getRedirects()) {
  const q = (s) => (/[",\n]/.test(String(s)) ? '"' + String(s).replace(/"/g, '""') + '"' : String(s));
  return ['from,to,type,made,note'].concat(list.map((x) => [x.from, x.to, x.type, x.auto ? 'automatic' : 'by hand', x.note].map(q).join(','))).join('\n');
}

// ---- not found ----------------------------------------------------------------------------------------------
export const getMisses = () => read().misses.slice().sort((a, b) => b.hits - a.hits);
export function logMiss(path, from = 'Direct') {
  const p = normPath(path);
  if (!p || typeof window === 'undefined') return;
  const db = read();
  const cur = db.misses.find((m) => m.path === p);
  const misses = cur ? db.misses.map((m) => (m.path === p ? { ...m, hits: m.hits + 1, last: new Date().toISOString(), from } : m)) : [{ path: p, hits: 1, last: new Date().toISOString(), from }, ...db.misses];
  write({ ...db, misses: misses.slice(0, 200) });
}
export function dismissMiss(path) { const db = read(); write({ ...db, misses: db.misses.filter((m) => m.path !== normPath(path)) }); }
export function fixMiss(path, to) { return addRedirect({ from: path, to, type: 301, note: 'From the not-found log' }); }
export function resetRedirects() { try { window.localStorage.removeItem(KEY); } catch { /* ignore */ } cache = { raw: undefined, db: null }; write(seed()); }
