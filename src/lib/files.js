// files — the shop's file library (Settings › Files, /files): every picture, video and document the shop uses, in one
// place. Product photos, brand logos and blog covers saved with their own records are listed here too (read-only rows,
// "from a product"), so the library shows everything the store serves.
//
//   Library file  { id, name, mime, kind 'image'|'video'|'doc', size, w, h, folder, alt, tags, at, by, src, thumb }
//                 src = 'gcfile:<id>' for an upload (the bytes are in IndexedDB), or a plain address (/assets/…, https://…)
//   FOLDERS (built in) + the shop's own · getFiles() · allFiles() (library + product / brand / blog pictures)
//   addFiles(fileList, folder) → Promise<[file]>  pictures are resized (2000 px and 800 px, WebP) with a 200 px preview
//   updateFile(id, patch) · moveFiles(ids, folder) · replaceFile(id, file) (same id and address) · removeFiles(ids, force)
//   addFolder(name) · renameFolder(id, name) · deleteFolder(id) (its files move to Unfiled)
//   usedIn(src) → [{ label, href }] — layouts, headers, HTML blocks, menus, pages, products, brands, blog posts
//   isFileRef(src) · fileUrl(src, size) → Promise<url> · useFileSrc(src, size) (hook) · storageBytes() · FILES_EVENT
// Front end only: uploads stay in this browser (IndexedDB 'gc-files'); the list is in localStorage (gc.files). A live
// shop keeps files in object storage behind a CDN, and the address stays the same when a file is replaced.

import { useEffect, useState } from 'react';
import { allProducts } from './products';
import { getBrands } from './brands';
import { getPosts } from './blog';
import { getMenus } from './storeMenus';
import { getPages } from './storePages';

const KEY = 'gc.files';
const DB = 'gc-files';
const STORE = 'blobs';
export const FILES_EVENT = 'gc:files';
export const REF = 'gcfile:';
export const MAX_UPLOAD = 20 * 1024 * 1024;   // 20 MB a file
const ssr = () => typeof window === 'undefined';

export const FOLDERS = [
  { id: 'products', name: 'Product photos', icon: 'package', builtIn: true },
  { id: 'sections', name: 'Banners & sections', icon: 'gallery-horizontal', builtIn: true },
  { id: 'brand', name: 'Logos & brand', icon: 'badge-check', builtIn: true },
  { id: 'blog', name: 'Blog', icon: 'newspaper', builtIn: true },
  { id: 'docs', name: 'Documents', icon: 'file-text', builtIn: true },
];
export const KINDS = { image: 'Picture', video: 'Video', doc: 'Document' };

// the demo shop's own pictures (the store sections use them), so the library is not empty on first open
const SEED = [
  ['99e39eac40a8abf8968649c253b23f9e.webp', 'Phone accessories counter', 'sections', 896, 1120, 186000],
  ['901f735d539a8b71fb8e8162bb755ec3.webp', 'Packing an online order', 'sections', 896, 1120, 142000],
  ['cfbbbbd758347fbb3f71590345d24674.webp', 'Online seller with a parcel', 'sections', 896, 1120, 151000],
  ['dec2496b57e91a856eaa9f8fd17d9124.webp', 'Shop counter with customers', 'sections', 896, 1120, 164000],
  ['937ca529653ad58861f011f257ebc4df.webp', 'Owner at the shop', 'sections', 896, 1120, 158000],
].map(([f, name, folder, w, h, size], i) => ({ id: 'seed-' + i, name, mime: 'image/webp', kind: 'image', size, w, h, folder, alt: name, tags: [], at: Date.UTC(2026, 8, 1 + i), by: 'GridCommerce', src: '/assets/' + f, thumb: '/assets/' + f, seed: true }));

// ---- the list (localStorage) -----------------------------------------------------------------------------------------
let cache = { raw: undefined, data: null };
function read() {
  const blank = { v: 1, folders: [], files: SEED.slice() };
  if (ssr()) return blank;
  let raw = null;
  try { raw = window.localStorage.getItem(KEY); } catch { raw = null; }
  if (raw && raw === cache.raw && cache.data) return cache.data;
  let d = null;
  try { d = raw ? JSON.parse(raw) : null; } catch { d = null; }
  if (!d || d.v !== 1) d = blank;
  cache = { raw, data: d };
  return d;
}
function write(d) {
  if (ssr()) return;
  try { const raw = JSON.stringify(d); window.localStorage.setItem(KEY, raw); cache = { raw, data: d }; } catch { cache = { raw: null, data: d }; }
  try { window.dispatchEvent(new CustomEvent(FILES_EVENT)); } catch { /* ignore */ }
}
const change = (fn) => { const d = JSON.parse(JSON.stringify(read())); const out = fn(d); write(d); return out; };
const fid = () => 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export const folders = () => [...FOLDERS, ...read().folders];
export const folderBy = (id) => folders().find((f) => f.id === id) || null;
export const getFiles = () => read().files.slice().sort((a, b) => b.at - a.at);
export const getFile = (id) => read().files.find((f) => f.id === id) || null;
export const isFileRef = (src) => typeof src === 'string' && src.indexOf(REF) === 0;
export const kindOfMime = (m) => (/^image\//.test(m) ? 'image' : /^video\//.test(m) ? 'video' : 'doc');
export const bytes = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + ' MB' : n >= 1e3 ? Math.round(n / 1e3) + ' KB' : (n || 0) + ' B');
const dataSize = (url) => Math.round(String(url || '').length * 0.75);

// ---- pictures saved with their own records (read-only rows) ---------------------------------------------------------
/** Product photos, brand logos and blog covers, as library rows. */
export function recordFiles() {
  if (ssr()) return [];
  const out = [];
  try {
    allProducts().forEach((p) => (p.media || []).forEach((m, i) => {
      if (!m.src || (m.kind || 'image') !== 'image' || isFileRef(m.src)) return;
      out.push({ id: 'p:' + p.id + ':' + i, name: m.name || p.name + (i ? ' · ' + (i + 1) : ''), mime: 'image/jpeg', kind: 'image', size: m.src.indexOf('data:') === 0 ? dataSize(m.src) : 0, folder: 'products', alt: m.alt || '', tags: [], at: p.savedAt || 0, by: '', src: m.src, thumb: m.src, owner: { label: 'Product · ' + p.name, href: '/add-product?id=' + encodeURIComponent(p.id) } });
    }));
  } catch { /* ignore */ }
  try {
    getBrands().forEach((b) => { if (b.image && !isFileRef(b.image)) out.push({ id: 'b:' + b.id, name: b.name + ' logo', mime: 'image/png', kind: 'image', size: b.image.indexOf('data:') === 0 ? dataSize(b.image) : 0, folder: 'brand', alt: b.name, tags: [], at: b.updatedAt || 0, by: '', src: b.image, thumb: b.image, owner: { label: 'Brand · ' + b.name, href: '/brands' } }); });
  } catch { /* ignore */ }
  try {
    getPosts().forEach((p) => { const c = p.cover && p.cover.src; if (c && !isFileRef(c)) out.push({ id: 'g:' + p.id, name: (p.title || 'Post') + ' cover', mime: 'image/jpeg', kind: 'image', size: c.indexOf('data:') === 0 ? dataSize(c) : 0, folder: 'blog', alt: (p.cover && p.cover.alt) || '', tags: [], at: p.updatedAt || 0, by: '', src: c, thumb: c, owner: { label: 'Blog post · ' + (p.title || 'Untitled'), href: '/blog-editor?id=' + encodeURIComponent(p.id) } }); });
  } catch { /* ignore */ }
  return out;
}
/** Library files plus the pictures saved with products, brands and posts. */
export const allFiles = () => [...getFiles(), ...recordFiles()];
/** Bytes used by everything in the library (uploads and record pictures). */
export function storageBytes() { return allFiles().reduce((a, f) => a + (f.seed ? 0 : f.size || 0), 0); }

// ---- IndexedDB (the bytes of uploads) -----------------------------------------------------------------------------------
let dbp = null;
function db() {
  if (ssr() || typeof indexedDB === 'undefined') return Promise.reject(new Error('This browser cannot keep files.'));
  if (!dbp) {
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => { r.result.createObjectStore(STORE); };
      r.onsuccess = () => res(r.result);
      r.onerror = () => { dbp = null; rej(r.error || new Error('Could not open the file store.')); };
    });
  }
  return dbp;
}
function tx(mode, fn) {
  return db().then((d) => new Promise((res, rej) => {
    const t = d.transaction(STORE, mode);
    const out = fn(t.objectStore(STORE));
    t.oncomplete = () => res(out && 'result' in out ? out.result : undefined);
    t.onerror = () => rej(t.error);
    t.onabort = () => rej(t.error || new Error('Not saved'));
  }));
}
const putBlobs = (id, rec) => tx('readwrite', (s) => s.put(rec, id));
const getBlobs = (id) => tx('readonly', (s) => s.get(id));
const delBlobs = (id) => tx('readwrite', (s) => s.delete(id));

// ---- reading an upload (object URLs, cached for the session) ---------------------------------------------------------
const urls = new Map();
const waiting = new Map();
/** The address to draw a file with: plain addresses as they are; 'gcfile:' refs from this browser's file store. */
export function fileUrl(src, size = 'md') {
  if (!isFileRef(src)) return Promise.resolve(src || '');
  const id = src.slice(REF.length);
  const k = id + ':' + size;
  if (urls.has(k)) return Promise.resolve(urls.get(k));
  if (waiting.has(k)) return waiting.get(k);
  const p = getBlobs(id).then((rec) => {
    const b = rec && (rec[size] || rec.md || rec.full);
    const u = b ? URL.createObjectURL(b) : '';
    urls.set(k, u);
    waiting.delete(k);
    return u;
  }, () => { waiting.delete(k); return ''; });
  waiting.set(k, p);
  return p;
}
/** Synchronously: the address if it is ready ('' while an upload is still being read). */
export function fileUrlNow(src, size = 'md') {
  if (!isFileRef(src)) return src || '';
  return urls.get(src.slice(REF.length) + ':' + size) || '';
}
/** Hook: a drawable address for src (a plain address at once; an upload after it is read). */
export function useFileSrc(src, size = 'md') {
  const [u, setU] = useState(() => fileUrlNow(src, size));
  useEffect(() => {
    let on = true;
    if (!isFileRef(src)) { setU(src || ''); return undefined; }
    setU(fileUrlNow(src, size));
    fileUrl(src, size).then((x) => { if (on) setU(x); });
    return () => { on = false; };
  }, [src, size]);
  return u;
}
/** Swap 'gcfile:' addresses inside an element (HTML blocks, rich text) for drawable ones. */
export function resolveIn(el) {
  if (!el || !el.querySelectorAll) return;
  el.querySelectorAll('[src^="' + REF + '"],[data-gcfile]').forEach((n) => {
    const src = n.getAttribute('data-gcfile') || n.getAttribute('src');
    if (!n.getAttribute('data-gcfile')) { n.setAttribute('data-gcfile', src); n.removeAttribute('src'); }
    fileUrl(src).then((u) => { if (u) n.setAttribute('src', u); });
  });
}

// ---- resizing -------------------------------------------------------------------------------------------------------
function loadImage(file) {
  return new Promise((res, rej) => {
    const u = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => res({ img, u });
    img.onerror = () => { URL.revokeObjectURL(u); rej(new Error(file.name + ' is not a picture this browser can open.')); };
    img.src = u;
  });
}
function scaled(img, max, type = 'image/webp', q = 0.84) {
  const r = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(img.naturalWidth * r));
  c.height = Math.max(1, Math.round(img.naturalHeight * r));
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return new Promise((res) => {
    if (c.toBlob) c.toBlob((b) => res({ blob: b, w: c.width, h: c.height, canvas: c }), type, q);
    else res({ blob: null, w: c.width, h: c.height, canvas: c });
  });
}
async function prepare(file) {
  const kind = kindOfMime(file.type || '');
  if (file.size > MAX_UPLOAD) throw new Error(file.name + ' is over 20 MB.');
  if (kind !== 'image' || /svg|gif/.test(file.type)) {
    // SVG and GIF keep their own bytes (resizing would break them); videos and documents too
    const thumb = kind === 'image' ? await new Promise((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => res(''); r.readAsDataURL(file); }) : '';
    return { kind, rec: { full: file, md: file }, size: file.size, w: 0, h: 0, thumb: thumb.length < 60000 ? thumb : '' };
  }
  const { img, u } = await loadImage(file);
  try {
    const full = await scaled(img, 2000);
    const md = await scaled(img, 800);
    const sm = await scaled(img, 200, 'image/webp', 0.7);
    const thumb = sm.canvas.toDataURL('image/webp', 0.7);
    return { kind, rec: { full: full.blob || file, md: md.blob || file }, size: (full.blob || file).size + (md.blob ? md.blob.size : 0), w: img.naturalWidth, h: img.naturalHeight, thumb };
  } finally { URL.revokeObjectURL(u); }
}

// ---- changing -------------------------------------------------------------------------------------------------------
/** Upload files into a folder. Returns the new library rows; a file that fails is skipped (errors listed in `failed`). */
export async function addFiles(list, folder = 'sections', by = '') {
  const files = Array.prototype.slice.call(list || []);
  const added = [];
  const failed = [];
  for (const file of files) {
    try {
      const p = await prepare(file);
      const id = fid();
      await putBlobs(id, p.rec);
      const row = { id, name: String(file.name || 'file').replace(/\.[a-z0-9]+$/i, ''), mime: file.type || 'application/octet-stream', kind: p.kind, size: p.size, w: p.w, h: p.h, folder, alt: '', tags: [], at: Date.now(), by, src: REF + id, thumb: p.thumb };
      change((d) => { d.files.unshift(row); });
      added.push(row);
    } catch (e) { failed.push({ name: file.name, error: (e && e.message) || 'Could not add it.' }); }
  }
  added.failed = failed;
  return added;
}
export function updateFile(id, patch) {
  change((d) => { d.files = d.files.map((f) => (f.id === id ? { ...f, ...patch, id: f.id, src: f.src } : f)); });
}
export function moveFiles(ids, folder) { const s = new Set(ids); change((d) => { d.files = d.files.map((f) => (s.has(f.id) ? { ...f, folder } : f)); }); }
/** Put new bytes behind the same address (every page using it shows the new file). */
export async function replaceFile(id, file) {
  const cur = getFile(id);
  if (!cur) throw new Error('This file no longer exists.');
  if (!isFileRef(cur.src)) throw new Error('This file is part of the demo and cannot be replaced. Upload a new one instead.');
  const p = await prepare(file);
  await putBlobs(id, p.rec);
  ['full', 'md'].forEach((s) => { const k = id + ':' + s; if (urls.has(k)) { try { URL.revokeObjectURL(urls.get(k)); } catch { /* ignore */ } urls.delete(k); } });
  updateFile(id, { mime: file.type, kind: p.kind, size: p.size, w: p.w, h: p.h, thumb: p.thumb, at: Date.now(), replacedAt: Date.now() });
}
/** Delete library files. Files still used somewhere are kept unless force. Returns { removed, kept: [{ file, uses }] }. */
export function removeFiles(ids, force = false) {
  const out = { removed: [], kept: [] };
  ids.forEach((id) => {
    const f = getFile(id);
    if (!f) return;
    const uses = usedIn(f.src);
    if (uses.length && !force) { out.kept.push({ file: f, uses }); return; }
    out.removed.push(f);
  });
  const gone = new Set(out.removed.map((f) => f.id));
  if (gone.size) change((d) => { d.files = d.files.filter((f) => !gone.has(f.id)); });
  out.removed.forEach((f) => { if (isFileRef(f.src)) delBlobs(f.id).catch(() => {}); });
  return out;
}
export function addFolder(name) {
  const n = String(name || '').trim().slice(0, 40);
  if (!n) return null;
  const f = { id: 'fd' + Date.now().toString(36), name: n, icon: 'folder' };
  change((d) => { d.folders.push(f); });
  return f;
}
export function renameFolder(id, name) { const n = String(name || '').trim().slice(0, 40); if (n) change((d) => { d.folders = d.folders.map((f) => (f.id === id ? { ...f, name: n } : f)); }); }
export function deleteFolder(id) { change((d) => { d.folders = d.folders.filter((f) => f.id !== id); d.files = d.files.map((f) => (f.folder === id ? { ...f, folder: '' } : f)); }); }

// ---- where a file is used -------------------------------------------------------------------------------------------
const has = (x, src) => !!src && JSON.stringify(x == null ? '' : x).indexOf(JSON.stringify(src).slice(1, -1)) >= 0;
/** Every place that shows this address: [{ label, href }]. */
export function usedIn(src) {
  if (ssr() || !src) return [];
  const out = [];
  const add = (label, href) => { if (!out.some((x) => x.label === label)) out.push({ label, href }); };
  try {
    const raw = window.localStorage.getItem('gc.storefront');
    const sf = raw ? JSON.parse(raw) : null;
    if (sf) {
      (sf.layouts || []).forEach((l) => { if (has(l.doc, src)) add('Layout · ' + l.name, '/layout-edit?id=' + encodeURIComponent(l.id)); });
      (sf.headers || []).forEach((h) => { if (has(h.doc, src)) add('Header · ' + h.name, '/header-builder?id=' + encodeURIComponent(h.id)); });
      (sf.blocks || []).forEach((b) => { if (has(b, src)) add('HTML block · ' + (b.name || 'Untitled'), '/html-block-edit?id=' + encodeURIComponent(b.id)); });
      if (sf.theme && has(sf.theme, src)) add('Theme settings', '/theme-editor');
    }
  } catch { /* ignore */ }
  const tries = [
    () => (getMenus() || []).forEach((x) => { if (has(x, src)) add('Menu · ' + (x.name || x.title || 'Menu'), '/store-menus'); }),
    () => (getPages() || []).forEach((x) => { if (has(x, src)) add('Page · ' + (x.title || 'Untitled'), '/store-page-edit?id=' + encodeURIComponent(x.id)); }),
    () => allProducts().forEach((p) => { if (has(p.media, src)) add('Product · ' + p.name, '/add-product?id=' + encodeURIComponent(p.id)); }),
    () => getBrands().forEach((b) => { if (b.image === src) add('Brand · ' + b.name, '/brands'); }),
    () => getPosts().forEach((p) => { if (has(p, src)) add('Blog post · ' + (p.title || 'Untitled'), '/blog-editor?id=' + encodeURIComponent(p.id)); }),
  ];
  tries.forEach((fn) => { try { fn(); } catch { /* ignore */ } });
  return out;
}

/** The library after mount; re-read on every change ({ ready, files, folders, n }). */
export function useFiles() {
  const [st, setSt] = useState({ ready: false, files: [], folders: FOLDERS, n: 0 });
  useEffect(() => {
    const load = () => setSt((s) => ({ ready: true, files: allFiles(), folders: folders(), n: s.n + 1 }));
    load();
    window.addEventListener(FILES_EVENT, load);
    window.addEventListener('storage', load);
    return () => { window.removeEventListener(FILES_EVENT, load); window.removeEventListener('storage', load); };
  }, []);
  return st;
}
