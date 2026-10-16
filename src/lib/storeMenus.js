// storeMenus — the online store's navigation (Online Store › Menus): the header menu and the footer menus. Each item
// has a label and a link, and may hold one level of items under it (a drop-down in the header, a column's links in the
// footer).
//
//   menu   { id, name, place 'header' | 'footer', fixed (the two built-in menus can't be deleted), items[] }
//   item   { id, label, link: { type, ref?, url? }, children: item[] (one level only) }
//   link types: home · page (ref = page id, lib/storePages.js) · category (ref = category path) · product (ref = product
//          id) · offers · blog (ref = '' blog home, or a post id) · url (url = '/…' or 'https://…')
//
//   getMenus() · getMenu(id) · saveMenu(menu) · addMenu(name) · deleteMenu(id) · resetMenus()
//   LINK_TYPES · linkTargets(type) → [{ value, label, note }] (from the real pages, categories, products and posts)
//   resolveLink(link) → { url (as on the live site), href (opens here), title, broken, note }
//   urlProblem(url) · removeLinksTo(type, ref) · menusLinking(type, ref) → menu names · newItem() · STORE_MENUS_EVENT
//   setMenus(list) — replace every menu (Theme › import a preset; a restore point is made first)
//
// Mega menu (A5, Module A): a header menu's top item may carry
//   mega { on, width 'full'|'container'|'custom', px, cols: [Column] (2–5), promo: { src, title, href } | null }
//   Column { id, kind 'cats'|'links'|'image'|'block', title, ref (category path), src, href, block (HTML block id) }
//   'links' lists the item's own sub-items. Phones never show the mega menu: they show the item's sub-items as a list.
//   MEGA_WIDTHS · MEGA_KINDS · newMegaColumn(kind) · blankMega() · megaProblem(mega)
//
// Front end only: kept in this browser (gc.storeMenus). On the live website the theme draws these menus.

import { uid, slugify, getPosts } from './blog';
import { previewValue } from './storefront/store';
import { getPages, getPage, pageByHandle, PAGE_BASE, storefrontHref } from './storePages';
import { allProducts, productHandle } from './products';
import { categoryDefaults } from './productTemplates';
import { getCategories, categoryHandle } from './productCategories';

const KEY = 'gc.storeMenus';
export const STORE_MENUS_EVENT = 'gc:store-menus';
const SITE = 'dazzleshop.com.bd';

export { LINK_TYPES } from './storefront/schema.js';
import { LINK_TYPES } from './storefront/schema.js';
export const linkTypeOf = (type) => LINK_TYPES.find((t) => t.type === type) || LINK_TYPES[0];

// ---- where links can point ----------------------------------------------------------------------------
/** Every product category path, with its parents (Phones, Phones › Smartphones …). */
export function categoryPaths() {
  const set = new Set();
  const add = (path) => {
    const parts = String(path || '').split('›').map((x) => x.trim()).filter(Boolean);
    parts.forEach((_, i) => set.add(parts.slice(0, i + 1).join(' › ')));
  };
  Object.keys(categoryDefaults()).forEach(add);
  allProducts().forEach((p) => add(p.cat));
  return [...set].sort((a, b) => a.localeCompare(b));
}
const catSlug = (path) => String(path || '').split('›').map((x) => slugify(x.trim())).filter(Boolean).join('/');
const sellable = (p) => p.st === 'active';

/** The choices for a link type: [{ value, label, note }]. */
export function linkTargets(type) {
  if (type === 'page') return getPages().map((p) => ({ value: p.id, label: p.title || 'Untitled page', note: p.status === 'published' ? '' : (p.status === 'draft' ? 'Draft' : 'Hidden') }));
  if (type === 'category') return categoryPaths().map((c) => ({ value: c, label: c, note: '' }));
  if (type === 'product') return allProducts().filter(sellable).map((p) => ({ value: p.id, label: p.name, note: p.cat || '' }));
  if (type === 'blog') return [{ value: '', label: 'Blog home (all posts)', note: '' }, ...getPosts().filter((p) => p.status === 'published').map((p) => ({ value: p.id, label: p.title || 'Untitled post', note: 'Post' }))];
  return [];
}

/** A web address must start with / or https:// (or http://, mailto:, tel:). '' when it is fine. */
export function urlProblem(url) {
  const u = String(url || '').trim();
  if (!u) return 'Enter a web address.';
  if (/\s/.test(u)) return 'A web address has no spaces.';
  if (!/^(\/|https?:\/\/[^/]+\.[^/]+|mailto:|tel:)/i.test(u)) return 'Start with / for a page of your store, or https:// for another website.';
  return '';
}

/** What a link opens: { url (as on the live site), href (opens here, or '' when only the live site has it), title,
 *  broken (the page or product it points to is gone), note (not on the website yet …) }. */
export function resolveLink(link) {
  const l = link || { type: 'home' };
  switch (l.type) {
    case 'page': {
      // a page link points at the page's id; a store kit may point at its address (handle) instead
      const p = getPage(l.ref) || pageByHandle(l.ref);
      if (!p) return { url: '', href: '', title: 'Deleted page', broken: true, note: 'The page was deleted' };
      return { url: PAGE_BASE + p.handle, href: storefrontHref(p.handle), title: p.title || 'Untitled page', broken: false, note: p.status === 'published' ? '' : 'Not on the website: the page is ' + (p.status === 'draft' ? 'a draft' : 'hidden') };
    }
    case 'category': {
      const ok = !!l.ref && categoryPaths().includes(l.ref);
      // the storefront's category page (/category?handle=) — the category's own handle (Products › Categories)
      let c = null;
      try { c = getCategories().find((x) => x.path === l.ref) || null; } catch { c = null; }
      return { url: `${SITE}/collections/${catSlug(l.ref)}`, href: c ? '/category?handle=' + encodeURIComponent(categoryHandle(c)) : '', title: l.ref || 'Category', broken: !ok, note: ok ? '' : 'This category no longer exists' };
    }
    case 'product': {
      const p = allProducts().find((x) => x.id === l.ref);
      if (!p) return { url: '', href: '', title: 'Deleted product', broken: true, note: 'The product was deleted' };
      return { url: `${SITE}/products/${slugify(p.name)}`, href: '/product?handle=' + encodeURIComponent(productHandle(p)), title: p.name, broken: false, note: sellable(p) ? '' : 'Not on sale: the product is ' + (p.st || 'not active') };
    }
    case 'offers': return { url: `${SITE}/offers`, href: '/offers', title: 'Offers', broken: false, note: '' };
    case 'blog': {
      if (!l.ref) return { url: `${SITE}/blog`, href: '/blog', title: 'Blog', broken: false, note: '' };
      const p = getPosts().find((x) => x.id === l.ref);
      if (!p) return { url: '', href: '', title: 'Deleted post', broken: true, note: 'The post was deleted' };
      return { url: `${SITE}/blog/${p.slug}`, href: '/blog-post?slug=' + encodeURIComponent(p.slug), title: p.title, broken: false, note: p.status === 'published' ? '' : 'The post is not published' };
    }
    case 'url': {
      const u = String(l.url || '').trim();
      const bad = !!urlProblem(u);
      return { url: u.startsWith('/') ? SITE + u : u, href: u.startsWith('/') && !bad ? u : '', title: u || 'Web address', broken: bad, note: bad ? 'Check the web address' : '' };
    }
    default: return { url: SITE + '/', href: '/store', title: 'Home', broken: false, note: '' };
  }
}

// ---- seed -------------------------------------------------------------------------------------------
const I = (label, link, children = []) => ({ id: uid('mi-'), label, link, children });
const cat = (ref) => ({ type: 'category', ref });
const page = (ref) => ({ type: 'page', ref });
function seed() {
  const prod = allProducts().find((p) => p.st === 'active' && /smartphones/i.test(p.cat || ''));
  return [
    { id: 'main', name: 'Main menu', place: 'header', fixed: true, items: [
      I('Home', { type: 'home' }),
      // a mega menu (the Signal preset's): categories, the sub-items, an HTML block and a picture
      { ...I('Phones', cat('Phones'), [I('Smartphones', cat('Phones › Smartphones')), I('Feature phones', cat('Phones › Feature phones'))]),
        mega: { on: true, width: 'container', px: 960, promo: null, cols: [
          { ...newMegaColumn('cats'), title: 'Phones', ref: 'Phones' }, { ...newMegaColumn('links'), title: 'Popular' },
          { ...newMegaColumn('block'), block: 'blk-signal-deals' }, { ...newMegaColumn('image'), title: 'Trade in', src: '/assets/99e39eac40a8abf8968649c253b23f9e.webp', href: '/page?handle=contact-us' },
        ] } },
      I('Accessories', cat('Accessories'), [I('Cases & covers', cat('Accessories › Cases & covers')), I('Chargers & cables', cat('Accessories › Chargers & cables')), I('Holders & stands', cat('Accessories › Holders & stands'))]),
      I('Audio', cat('Audio')),
      I('Offers', { type: 'offers' }),
      ...(prod ? [I('New arrival', { type: 'product', ref: prod.id })] : []),
      I('Blog', { type: 'blog', ref: '' }),
    ] },
    { id: 'footer', name: 'Footer menu', place: 'footer', fixed: true, items: [
      I('Shop', { type: 'home' }, [I('Phones', cat('Phones')), I('Accessories', cat('Accessories')), I('Offers', { type: 'offers' }), I('Blog', { type: 'blog', ref: '' })]),
      I('Company', page('pg-about'), [I('About us', page('pg-about')), I('Contact us', page('pg-contact'))]),
    ] },
    { id: 'care', name: 'Customer care', place: 'footer', fixed: false, items: [
      I('Shipping & delivery', page('pg-shipping')),
      I('Return & refund', page('pg-returns')),
      I('Privacy policy', page('pg-privacy')),
      I('WhatsApp us', { type: 'url', url: 'https://wa.me/8801811843300' }),
    ] },
  ];
}

// ---- storage ------------------------------------------------------------------------------------------
let cache = { raw: undefined, list: null };
function read() {
  if (typeof window === 'undefined') return [];
  const ov = previewValue('menus');   // a preview frame showing another design's menus (a store kit)
  if (Array.isArray(ov)) return ov;
  let raw = null;
  try { raw = window.localStorage.getItem(KEY); } catch { /* ignore */ }
  if (raw === cache.raw && cache.list) return cache.list;
  let list = null;
  try { list = raw ? JSON.parse(raw) : null; } catch { list = null; }
  if (!Array.isArray(list) || !list.length) list = seed();
  else list = withBlog(list, raw);
  cache = { raw, list };
  return list;
}
// menus saved before the blog list page (/blog, Oct 2026) get a Blog link at the end of the header menu, once; a merchant
// who removes it later keeps it removed
const BLOG_KEY = 'gc.storeMenus.blog';
function withBlog(list, raw) {
  try { if (window.localStorage.getItem(BLOG_KEY)) return list; window.localStorage.setItem(BLOG_KEY, '1'); } catch { return list; }
  const has = (items) => (items || []).some((it) => (it.link && it.link.type === 'blog') || has(it.children));
  const out = list.map((m) => (m.place === 'header' && !has(m.items) ? { ...m, items: [...(m.items || []), I('Blog', { type: 'blog', ref: '' })] } : m));
  try { const next = JSON.stringify(out); window.localStorage.setItem(KEY, next); cache = { raw: next, list: out }; } catch { /* ignore */ }
  return out;
}
function write(list) {
  try {
    const raw = JSON.stringify(list);
    window.localStorage.setItem(KEY, raw);
    cache = { raw, list };
    window.dispatchEvent(new CustomEvent(STORE_MENUS_EVENT));
  } catch { /* ignore */ }
  return list;
}

export const getMenus = () => read();
export const getMenu = (id) => read().find((m) => m.id === id) || null;
/** The header menu and the footer menus, for the storefront. */
export const headerMenu = () => read().find((m) => m.place === 'header') || null;
export const footerMenus = () => read().filter((m) => m.place === 'footer');

/** One level of nesting only: grandchildren move up to their parent's level. */
function flatten(items) {
  return (items || []).map((it) => {
    const kids = [];
    (it.children || []).forEach((c) => { kids.push({ ...c, children: [] }); (c.children || []).forEach((g) => kids.push({ ...g, children: [] })); });
    return { ...it, children: kids };
  });
}
export function saveMenu(menu) {
  const list = read().slice();
  const saved = { ...menu, name: String(menu.name || '').trim() || 'Menu', items: flatten(menu.items), updatedAt: new Date().toISOString() };
  const i = list.findIndex((m) => m.id === menu.id);
  if (i >= 0) list[i] = saved; else list.push(saved);
  write(list);
  return saved;
}
/** A new footer menu (a column of links). */
export function addMenu(name) {
  return saveMenu({ id: uid('menu-'), name: String(name || '').trim() || 'New menu', place: 'footer', fixed: false, items: [] });
}
export function deleteMenu(id) {
  const m = getMenu(id);
  if (!m || m.fixed) return false;
  write(read().filter((x) => x.id !== id));
  return true;
}
export function resetMenus() { try { window.localStorage.removeItem(KEY); } catch { /* ignore */ } cache = { raw: undefined, list: null }; write(seed()); }

export const newItem = (label = '', link = { type: 'page', ref: '' }) => ({ id: uid('mi-'), label, link, children: [] });
/** Replace every menu at once (a preset import). The header menu must stay first and fixed. */
export function setMenus(list) { if (Array.isArray(list) && list.length) write(list); }

// ---- mega menu ----------------------------------------------------------------------------------------------------
import { MEGA_WIDTHS, MEGA_KINDS } from './storefront/schema.js';
export { MEGA_WIDTHS, MEGA_KINDS };
export const newMegaColumn = (kind = 'cats') => ({ id: uid('col-'), kind, title: '', ref: '', src: '', href: '', block: '' });
export const blankMega = () => ({ on: true, width: 'container', px: 960, cols: [newMegaColumn('cats'), newMegaColumn('links')], promo: null });
/** '' when the mega menu can be saved, else what to fix. */
export function megaProblem(mega) {
  if (!mega || !mega.on) return '';
  const n = (mega.cols || []).length;
  if (n < 2 || n > 5) return 'A mega menu has 2 to 5 columns.';
  const bad = (mega.cols || []).find((c) => (c.kind === 'cats' && !c.ref) || (c.kind === 'image' && !c.src) || (c.kind === 'block' && !c.block));
  if (bad) return bad.kind === 'cats' ? 'Choose a category for each category list.' : bad.kind === 'image' ? 'Choose a picture for each image banner.' : 'Choose a block for each HTML block column.';
  if (mega.width === 'custom' && !(Number(mega.px) >= 480 && Number(mega.px) <= 1600)) return 'A custom width is 480 to 1600 px.';
  return '';
}
const hits = (it, type, ref) => it.link && it.link.type === type && String(it.link.ref || '') === String(ref || '');
/** Names of the menus with a link to this page / product / … */
export function menusLinking(type, ref) {
  return read().filter((m) => (m.items || []).some((it) => hits(it, type, ref) || (it.children || []).some((c) => hits(c, type, ref)))).map((m) => m.name);
}
/** Take every link to this page / product out of the menus (its children move up a level). Returns how many. */
export function removeLinksTo(type, ref) {
  let n = 0;
  const strip = (items) => {
    const out = [];
    items.forEach((it) => {
      const kids = strip(it.children || []);
      if (hits(it, type, ref)) { n++; kids.forEach((k) => out.push(k)); } else out.push({ ...it, children: kids });
    });
    return out;
  };
  const list = read().map((m) => ({ ...m, items: flatten(strip(m.items || [])) }));
  if (n) write(list);
  return n;
}
