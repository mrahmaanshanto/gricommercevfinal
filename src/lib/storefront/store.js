// storefront/store — the one browser store behind the storefront builder (Module A · Online Store › Theme, Header
// builder, HTML blocks, Layouts). theme.js, headers.js, blocks.js and layouts.js each own a part of it; this file keeps
// the raw storage, the change event, draft / live documents, live preview from the editors and the restore points.
//
//   data { v, preset, theme: doc, headers: [{ id, name, doc, updatedAt }], defaultHeader, blocks: [block],
//          layouts: [{ id, name, kind, cond, header, doc, updatedAt }], restore: [{ id, at, label, kind, snap }] }
//   doc  { draft, live (null = never published), draftAt, liveAt } — the customer pages read `live`; editors and
//        ?preview=1 read `draft` (and the editor's unsaved copy, sent to its preview frame with sendPreview)
//
//   read() · update(fn) · SF_EVENT ('gc:storefront') · newDoc(v) · isDirty(doc) · publishDoc(doc) · discardDoc(doc)
//   isPreview() · listenPreview() · sendPreview(frame, part, value) · previewValue(part) · pickDoc(doc, part)
//   restorePoints() · makeRestorePoint(label, { content }) · restoreTo(id) — a restore point keeps the whole look and,
//   for an import, the menus and the store's pages; going back makes a restore point first, so it can be undone too.
//
// First open: nothing saved → the Signal preset (presets.js › seedData), published, so the store looks finished.
// Front end only: kept in this browser (gc.storefront). A live store keeps the published look on its server.

import { seedData, upgradeData } from './presets';

const KEY = 'gc.storefront';
export const SF_EVENT = 'gc:storefront';
export const SF_VERSION = 5;   // 2: every home has every kind of section, per-theme fonts; 5: Signal's premium home (presets.js › upgradeData)
const MENUS_KEY = 'gc.storeMenus';
const PAGES_KEY = 'gc.storePages';
const MAX_POINTS = 6;   // each keeps the whole look (~35 KB); the newest six are kept
const ssr = () => typeof window === 'undefined';
const clone = (x) => (x == null ? x : JSON.parse(JSON.stringify(x)));
export const sfId = (p = 'sf') => p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

let cache = { raw: undefined, data: null };
let serverSeed = null;
const presetLooks = {};
/** ?preview=1&preset=<id> — Theme › a preset's live preview: that preset's look over the shop's own products. */
export function previewPreset() {
  if (ssr()) return '';
  try { const q = new URLSearchParams(window.location.search); return q.get('preview') === '1' ? q.get('preset') || '' : ''; } catch { return ''; }
}

/** The whole store (the Signal preset until something is saved). On the server: the seed, never saved. */
export function read() {
  if (ssr()) { if (!serverSeed) serverSeed = seedData(0); return serverSeed; }
  // a preview frame showing a whole other design (a kit: a library theme, a delivered design, a GridAI draft)
  if (OV.store && isPreview()) return OV.store;
  const pp = previewPreset();
  if (pp) { if (!presetLooks[pp]) presetLooks[pp] = seedData(Date.now(), pp); return presetLooks[pp]; }
  let raw = null;
  try { raw = window.localStorage.getItem(KEY); } catch { raw = null; }
  if (raw && raw === cache.raw && cache.data) return cache.data;
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }
  if (data && data.v >= 1 && data.v < SF_VERSION) {
    try { data = upgradeData(data); raw = JSON.stringify(data); window.localStorage.setItem(KEY, raw); } catch { data = null; }
  }
  if (!data || data.v !== SF_VERSION) {
    data = seedData(Date.now());
    try { raw = JSON.stringify(data); window.localStorage.setItem(KEY, raw); } catch { raw = null; }
  }
  cache = { raw, data };
  return data;
}

function write(data) {
  if (ssr() || previewPreset()) return data;
  try {
    const raw = JSON.stringify(data);
    window.localStorage.setItem(KEY, raw);
    cache = { raw, data };
  } catch { cache = { raw: null, data }; }
  try { window.dispatchEvent(new CustomEvent(SF_EVENT)); } catch { /* ignore */ }
  return data;
}

/** Change the store: fn(copy, now) edits a copy; it is saved and every open page redraws. Returns fn's result. */
export function update(fn) {
  const d = clone(read());
  const out = fn(d, Date.now());
  write(d);
  return out;
}

// ---- draft / live documents -------------------------------------------------------------------------------------
export const newDoc = (value, live = true, now = Date.now()) => ({ draft: clone(value), live: live ? clone(value) : null, draftAt: now, liveAt: live ? now : 0 });
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
/** Draft differs from what customers see (or it was never published). */
export const isDirty = (doc) => !!doc && (!doc.live || !same(doc.draft, doc.live));
export const publishDoc = (doc, now = Date.now()) => ({ ...doc, live: clone(doc.draft), liveAt: now });
/** Throw the draft away: back to what customers see. */
export const discardDoc = (doc, now = Date.now()) => (doc.live ? { ...doc, draft: clone(doc.live), draftAt: now } : doc);
/** Draft · Published · Unpublished changes */
export const docStatus = (doc) => (!doc || !doc.live ? 'draft' : isDirty(doc) ? 'changed' : 'live');
export const DOC_STATUS = {
  draft: { label: 'Draft', tone: 'neutral' },
  changed: { label: 'Unpublished changes', tone: 'warning' },
  live: { label: 'Published', tone: 'success' },
};

// ---- live preview (the editors' frames) ---------------------------------------------------------------------------
const OV = {};
let listening = false;
/** ?preview=1 — staff see drafts (the editors' preview frames, "Preview" links). */
export function isPreview() {
  if (ssr()) return false;
  try { return new URLSearchParams(window.location.search).get('preview') === '1'; } catch { return false; }
}
/** In a preview frame: take the editor's unsaved copy (posted by sendPreview) and redraw. */
export function listenPreview() {
  if (ssr() || listening || !isPreview()) return;
  listening = true;
  window.addEventListener('message', (e) => {
    if (e.origin !== window.location.origin || !e.data || !e.data.gcSf) return;
    const { part, value } = e.data.gcSf;
    if (!part) return;
    if (value == null) delete OV[part]; else OV[part] = value;
    try { window.dispatchEvent(new CustomEvent(SF_EVENT)); } catch { /* ignore */ }
  });
  // tell the editor this frame is ready for its copy
  try { if (window.parent && window.parent !== window) window.parent.postMessage({ gcSfReady: true }, window.location.origin); } catch { /* ignore */ }
}
/** The editor sends its unsaved copy of a part ('theme', 'header:<id>', 'layout:<id>', 'notices', 'placements', or a
 *  whole design: 'store' + 'menus' — kitStore.js › kitPreviewParts) to a preview frame. */
export function sendPreview(frame, part, value) {
  try { if (frame && frame.contentWindow) frame.contentWindow.postMessage({ gcSf: { part, value: clone(value) } }, window.location.origin); } catch { /* ignore */ }
}
export const previewValue = (part) => (isPreview() ? OV[part] : undefined);
/** ?preview=1&edit=1 — the layout editor's frame: clicking a section selects it in the editor instead of following links. */
export function isEditing() {
  if (ssr() || !isPreview()) return false;
  try { return new URLSearchParams(window.location.search).get('edit') === '1' && window.parent !== window; } catch { return false; }
}
/** In the editor's frame: tell the editor which section was clicked. */
export function selectInEditor(id) {
  try { window.parent.postMessage({ gcSfSelect: id, gcSfPick: id }, window.location.origin); } catch { /* ignore */ }
}
/** What a page draws for a document: live for customers; the editor's copy or the draft in preview. */
export function pickDoc(doc, part) {
  if (!doc) return null;
  if (isPreview()) { const ov = OV[part]; return ov !== undefined ? ov : doc.draft; }
  return doc.live;
}

// ---- restore points -------------------------------------------------------------------------------------------------
const rawOf = (k) => { try { return window.localStorage.getItem(k); } catch { return null; } };
const setRaw = (k, v) => { try { if (v == null) window.localStorage.removeItem(k); else window.localStorage.setItem(k, v); } catch { /* ignore */ } };

export const restorePoints = () => (read().restore || []);
/** Keep the look as it is now. content: also the menus and the store's pages (an import changes them). */
export function makeRestorePoint(label, { content = false, kind = 'manual' } = {}) {
  if (ssr()) return null;
  const cur = read();
  const { restore, ...rest } = cur;   // eslint-disable-line no-unused-vars
  const point = { id: sfId('rp'), at: Date.now(), label: String(label || 'Restore point'), kind, snap: { sf: JSON.stringify(rest), menus: content ? rawOf(MENUS_KEY) : undefined, pages: content ? rawOf(PAGES_KEY) : undefined, content } };
  update((d) => { d.restore = [point, ...(d.restore || [])].slice(0, MAX_POINTS); });
  return point;
}
/** Go back to a restore point (a restore point of now is made first). Returns the point, or null. */
export function restoreTo(id) {
  const rp = restorePoints().find((p) => p.id === id);
  if (!rp) return null;
  makeRestorePoint(`Before going back to “${rp.label}”`, { content: !!rp.snap.content, kind: 'undo' });
  let back = null;
  try { back = JSON.parse(rp.snap.sf); } catch { back = null; }
  if (!back) return null;
  const keep = read().restore || [];
  write({ ...back, restore: keep });
  if (rp.snap.content) {
    setRaw(MENUS_KEY, rp.snap.menus);
    setRaw(PAGES_KEY, rp.snap.pages);
    try { window.dispatchEvent(new CustomEvent('gc:store-menus')); window.dispatchEvent(new CustomEvent('gc:store-pages')); } catch { /* ignore */ }
  }
  return rp;
}
export function deleteRestorePoint(id) { update((d) => { d.restore = (d.restore || []).filter((p) => p.id !== id); }); }

/** Start again from the Signal preset (the demo's "Reset"); the menus and pages stay. */
export function resetStorefront() { write(seedData(Date.now())); }
