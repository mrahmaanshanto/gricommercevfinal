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
//
// Front end only: kept in this browser (gc.storeMenus). On the live website the theme draws these menus.

import { uid, slugify, getPosts } from './blog';
import { getPages, getPage, PAGE_BASE, storefrontHref } from './storePages';
import { allProducts } from './products';
import { categoryDefaults } from './productTemplates';

const KEY = 'gc.storeMenus';
export const STORE_MENUS_EVENT = 'gc:store-menus';
const SITE = 'dazzleshop.com.bd';

export const LINK_TYPES = [
  { type: 'home', label: 'Home page', icon: 'house' },
  { type: 'page', label: 'Page', icon: 'file-text' },
  { type: 'category', label: 'Category', icon: 'folder-tree' },
  { type: 'product', label: 'Product', icon: 'package' },
  { type: 'offers', label: 'Offers page', icon: 'ticket-percent' },
  { type: 'blog', label: 'Blog', icon: 'newspaper' },
  { type: 'url', label: 'Web address', icon: 'link' },
];
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
      const p = getPage(l.ref);
      if (!p) return { url: '', href: '', title: 'Deleted page', broken: true, note: 'The page was deleted' };
      return { url: PAGE_BASE + p.handle, href: storefrontHref(p.handle), title: p.title || 'Untitled page', broken: false, note: p.status === 'published' ? '' : 'Not on the website: the page is ' + (p.status === 'draft' ? 'a draft' : 'hidden') };
    }
    case 'category': {
      const ok = !!l.ref && categoryPaths().includes(l.ref);
      return { url: `${SITE}/collections/${catSlug(l.ref)}`, href: '', title: l.ref || 'Category', broken: !ok, note: ok ? '' : 'This category no longer exists' };
    }
    case 'product': {
      const p = allProducts().find((x) => x.id === l.ref);
      if (!p) return { url: '', href: '', title: 'Deleted product', broken: true, note: 'The product was deleted' };
      return { url: `${SITE}/products/${slugify(p.name)}`, href: '', title: p.name, broken: false, note: sellable(p) ? '' : 'Not on sale: the product is ' + (p.st || 'not active') };
    }
    case 'offers': return { url: `${SITE}/offers`, href: '/offers', title: 'Offers', broken: false, note: '' };
    case 'blog': {
      if (!l.ref) return { url: `${SITE}/blog`, href: '', title: 'Blog', broken: false, note: '' };
      const p = getPosts().find((x) => x.id === l.ref);
      if (!p) return { url: '', href: '', title: 'Deleted post', broken: true, note: 'The post was deleted' };
      return { url: `${SITE}/blog/${p.slug}`, href: '', title: p.title, broken: false, note: p.status === 'published' ? '' : 'The post is not published' };
    }
    case 'url': {
      const u = String(l.url || '').trim();
      const bad = !!urlProblem(u);
      return { url: u.startsWith('/') ? SITE + u : u, href: u.startsWith('/') && !bad ? u : '', title: u || 'Web address', broken: bad, note: bad ? 'Check the web address' : '' };
    }
    default: return { url: SITE + '/', href: '', title: 'Home', broken: false, note: '' };
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
      I('Phones', cat('Phones'), [I('Smartphones', cat('Phones › Smartphones')), I('Feature phones', cat('Phones › Feature phones'))]),
      I('Accessories', cat('Accessories'), [I('Cases & covers', cat('Accessories › Cases & covers')), I('Chargers & cables', cat('Accessories › Chargers & cables')), I('Holders & stands', cat('Accessories › Holders & stands'))]),
      I('Audio', cat('Audio')),
      I('Offers', { type: 'offers' }),
      ...(prod ? [I('New arrival', { type: 'product', ref: prod.id })] : []),
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
  let raw = null;
  try { raw = window.localStorage.getItem(KEY); } catch { /* ignore */ }
  if (raw === cache.raw && cache.list) return cache.list;
  let list = null;
  try { list = raw ? JSON.parse(raw) : null; } catch { list = null; }
  if (!Array.isArray(list) || !list.length) list = seed();
  cache = { raw, list };
  return list;
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
