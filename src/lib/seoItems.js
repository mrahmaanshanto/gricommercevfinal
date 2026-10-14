// seoItems — every page the website shows, in one list, for Online Store › SEO (health, sitemap, bulk editor) and the
// customer views. One adapter per type reads the item where it lives and saves SEO back through that type's own save,
// so a page saved here is the same as a page saved in its editor (and an address change still makes its redirect).
//
//   ADAPTERS[kind]   { list(), live(item), handle(item), title(item), editHref(item), save(item, patch) }
//   allItems()       [{ kind, id, title, handle, path, live, item, seo, editHref }] — store pages, blog posts, products
//                    (not deleted or archived), categories and landing pages
//   contextOf(kind, item)   what the SEO panel, the checks and the head need: title, description, images, text, faq,
//                    breadcrumbs, the product's price / stock / rating, the post's author and dates, the shop
//   findByHandle(kind, handle) · saveSeo(kind, id, seoPatch) · saveHandle(kind, id, handle) · saveAlt(kind, id, image, alt)
//   healthOf(rows) → [{ kind, id, title, score, issues: [{ id, label, level, fix }] }] · siteIssues(rows)
//   sitemap(rows) → { included: [{ path, kind, lastmod }], excluded: [{ path, why }] }
// Front end only (each type's own browser storage).

import { getPages, getPage, savePage, pageByHandle } from './storePages';
import { getPosts, getPost, savePost, getAuthor, getCategories as blogCategories, blockText } from './blog';
import { allProducts, getSavedProducts, saveProduct, productHandle } from './products';
import { getCategories, saveCategory, productsIn, categoryHandle as catHandle } from './productCategories';
import { getLandingPages, getLandingPage, saveLandingPage } from './landingPages';
import { businessProfile } from './businessProfile';
import { summaryOf } from './productReviews';
import { readSettings } from './settingsStore';
import { toHandle } from './handles';
import { KINDS, livePath, liveUrl, readSeo, seoPatch, seoChecks, seoScore, plainOf, linksInHtml, blockLinks, parsePath, LIMITS } from './seo';
import { resolve } from './redirects';

const changed = () => { try { window.dispatchEvent(new CustomEvent('gc:seo')); } catch { /* ignore */ } };
const clean = (p) => { const r = JSON.parse(JSON.stringify(p)); ['savedAt', 'version', 'savedNew', 'vars'].forEach((k) => { delete r[k]; }); return r; };
const postLive = (p, now = Date.now()) => p.status === 'published' && p.visibility !== 'private' && (!p.publishAt || new Date(p.publishAt).getTime() <= now);

export const ADAPTERS = {
  page: {
    list: () => getPages(),
    get: (id) => getPage(id),
    live: (p) => p.status === 'published',
    handle: (p) => p.handle,
    title: (p) => p.title || 'Untitled page',
    editHref: (p) => '/store-page-edit?id=' + encodeURIComponent(p.id),
    save: (p, patch) => savePage({ ...p, ...patch }),
  },
  post: {
    list: () => getPosts().filter((p) => p.status !== 'archived'),
    get: (id) => getPost(id),
    live: (p) => postLive(p),
    handle: (p) => p.slug,
    title: (p) => p.title || 'Untitled post',
    editHref: (p) => '/blog-editor?id=' + encodeURIComponent(p.id),
    save: (p, patch) => savePost({ ...p, ...patch }),
  },
  product: {
    list: () => allProducts(getSavedProducts()).filter((p) => p.st !== 'deleted' && p.st !== 'archived'),
    get: (id) => allProducts(getSavedProducts()).find((p) => p.id === id) || null,
    live: (p) => p.st === 'active',
    handle: productHandle,
    title: (p) => p.name || 'Untitled product',
    editHref: (p) => '/add-product?id=' + encodeURIComponent(p.id),
    save: (p, patch) => saveProduct(clean({ ...p, ...patch }), { note: 'SEO' }),
  },
  category: {
    list: () => getCategories(),
    get: (id) => getCategories().find((c) => c.id === id) || null,
    live: (c) => !c.hidden,
    handle: catHandle,
    title: (c) => c.name,
    editHref: (c) => '/categories?id=' + encodeURIComponent(c.id),
    save: (c, patch) => saveCategory(c.id, patch),
  },
  landing: {
    list: () => getLandingPages(),
    get: (id) => getLandingPage(id),
    live: (p) => p.status === 'published',
    handle: (p) => p.handle,
    title: (p) => p.title || p.productName || 'Landing page',
    editHref: (p) => '/landing-page-builder?id=' + encodeURIComponent(p.id),
    save: (p, patch) => saveLandingPage({ ...p, ...patch }),
  },
};
export const KIND_ORDER = ['product', 'category', 'page', 'post', 'landing'];

export function allItems() {
  const out = [];
  KIND_ORDER.forEach((kind) => {
    const a = ADAPTERS[kind];
    a.list().forEach((item) => {
      const handle = a.handle(item) || '';
      out.push({ kind, id: item.id, title: a.title(item), handle, path: livePath(kind, handle), live: a.live(item), item, seo: readSeo(kind, item), editHref: a.editHref(item) });
    });
  });
  return out;
}
export function findByHandle(kind, handle) {
  const h = String(handle || '').toLowerCase();
  if (kind === 'page') return pageByHandle(h);
  const a = ADAPTERS[kind];
  return a ? a.list().find((x) => String(a.handle(x) || '').toLowerCase() === h) || null : null;
}

// ---- context -------------------------------------------------------------------------------------------------
function shop() {
  let p = null;
  try { p = businessProfile(); } catch { p = null; }
  const c = (p && p.contact) || {};
  let map = '';
  try { map = (readSettings('general').values || {}).map_url || ''; } catch { map = ''; }
  return { name: (p && p.brand && p.brand.name) || 'Dazzle Shop', logo: (p && p.brand && p.brand.logo) || '', phone: c.phone || '', email: c.email || '', address: c.address || '', map };
}
const blocksText = (blocks) => (blocks || []).map(blockText).join(' ');
const blockImages = (blocks) => (blocks || []).filter((b) => b.type === 'image' && b.src).map((b, i) => ({ src: b.src, alt: b.alt || '', where: 'Image ' + (i + 1) + ' in the text', block: b.id }));
const blockFaq = (blocks) => (blocks || []).filter((b) => b.type === 'faq').flatMap((b) => b.items || []);
const catCrumbs = (path) => {
  const cats = getCategories();
  return String(path || '').split(' › ').filter(Boolean).map((name, i, all) => {
    const c = cats.find((x) => x.path === all.slice(0, i + 1).join(' › '));
    return c ? { name, path: livePath('category', catHandle(c)) } : null;
  }).filter(Boolean);
};
function productFacts(p) {
  const stock = (p.variants || []).length ? p.variants.reduce((a, v) => a + (Number(v.stock) || 0), 0) : Number(p.inv) || 0;
  const code = String(p.barcode || '');
  let rating = { avg: 0, count: 0 };
  try { rating = summaryOf(p); } catch { /* ignore */ }
  return { name: p.name, sku: p.sku, brand: p.brand, price: p.price, mrp: p.mrp, stock, oversell: !!p.oversell, gtin: p.barcodeType !== 'internal' && /^\d{13}$/.test(code) && code[0] !== '2' ? code : '', rating };
}

/** What the SEO panel, the checks and the head need for an item (also an unsaved one, as it is in its editor). */
export function contextOf(kind, item) {
  const it = item || {};
  const a = ADAPTERS[kind];
  const handle = (a && a.handle(it)) || '';
  const base = { kind, handle, url: liveUrl(kind, handle), title: a ? a.title(it) : '', live: a ? a.live(it) : false, shop: shop() };
  if (kind === 'page') {
    const text = blocksText(it.blocks);
    return { ...base, description: text, text, images: blockImages(it.blocks), faq: blockFaq(it.blocks), links: blockLinks(it.blocks), breadcrumbs: [{ name: base.title, path: livePath('page', handle) }] };
  }
  if (kind === 'post') {
    const text = blocksText(it.blocks);
    const cover = it.cover && it.cover.src ? [{ src: it.cover.src, alt: it.cover.alt || '', where: 'Cover', cover: true }] : [];
    let author = null;
    try { author = getAuthor(it.authorId); } catch { author = null; }
    const cat = (blogCategories() || []).find((c) => (it.categoryIds || [])[0] === c.id);
    return {
      ...base, description: it.excerpt || text, text, images: [...cover, ...blockImages(it.blocks)], faq: blockFaq(it.blocks),
      links: blockLinks(it.blocks),
      article: { author: author ? author.name : '', published: it.publishAt || it.createdAt || '', modified: it.updatedAt || '' },
      breadcrumbs: [{ name: 'Blog', path: '/blog' }, ...(cat ? [{ name: cat.name, path: '/blog/category/' + cat.slug }] : []), { name: base.title, path: livePath('post', handle) }],
    };
  }
  if (kind === 'product') {
    const text = plainOf(it.long) || plainOf(it.short);
    return {
      ...base, defaultTitle: it.name ? it.name + ' Price in Bangladesh' : '', description: plainOf(it.short) || text, text,
      images: (it.media || []).map((m, i) => ({ m, i })).filter(({ m }) => m.src && (m.kind || 'image') === 'image').map(({ m, i }) => ({ src: m.src, alt: m.alt || '', where: i === 0 ? 'Main photo' : 'Photo ' + (i + 1), media: i })),
      faq: (it.faqs || []).map((x) => (Array.isArray(x) ? { q: x[0], a: x[1] } : { q: x.q, a: x.a })), links: linksInHtml(it.long), product: productFacts(it),
      breadcrumbs: [...catCrumbs(it.cat), { name: it.name, path: livePath('product', handle) }],
    };
  }
  if (kind === 'category') {
    const n = (() => { try { return productsIn(it.path).length; } catch { return 0; } })();
    return { ...base, description: it.desc || '', text: it.desc || '', images: it.image ? [{ src: it.image, alt: it.imageAlt || '', where: 'Banner' }] : [], products: n, breadcrumbs: catCrumbs(it.path) };
  }
  if (kind === 'landing') {
    const p = allProducts(getSavedProducts()).find((x) => x.id === it.productId || x.sku === it.sku);
    const pc = p ? contextOf('product', p) : {};
    return { ...base, description: it.offerLine || pc.description || '', text: [it.offerLine, pc.text].filter(Boolean).join(' '), images: pc.images || [], faq: pc.faq || [], product: pc.product || null, breadcrumbs: [] };
  }
  return base;
}

// ---- saving ----------------------------------------------------------------------------------------------------
export function saveSeo(kind, id, patch) {
  const a = ADAPTERS[kind];
  const item = a && a.get(id);
  if (!item) return { ok: false, error: 'This item is gone.' };
  const res = a.save(item, seoPatch(kind, item, patch));
  changed();
  return res && res.ok === false ? res : { ok: true };
}
export function saveHandle(kind, id, handle) {
  const a = ADAPTERS[kind];
  const item = a && a.get(id);
  const h = toHandle(handle);
  if (!item) return { ok: false, error: 'This item is gone.' };
  if (!h) return { ok: false, error: 'Enter an address.' };
  const taken = allItems().find((x) => x.kind === kind && x.id !== id && x.handle === h);
  if (taken) return { ok: false, error: '“' + taken.title + '” already uses /' + h + '.' };
  const res = a.save(item, kind === 'post' ? { slug: h } : { handle: h });
  changed();
  return res && res.ok === false ? res : { ok: true, handle: h };
}

/** Save one image's alt text (an image from contextOf(kind, item).images). */
export function saveAlt(kind, id, img, alt) {
  const res = saveAltIn(kind, id, img, alt);
  if (res.ok) changed();
  return res;
}
function saveAltIn(kind, id, img, alt) {
  const a = ADAPTERS[kind];
  const item = a && a.get(id);
  if (!item || !img) return { ok: false, error: 'This item is gone.' };
  if (kind === 'product') return a.save(item, { media: (item.media || []).map((m, i) => (i === img.media ? { ...m, alt } : m)) }) && { ok: true };
  if (kind === 'post' && img.cover) return a.save(item, { cover: { ...item.cover, alt } }) && { ok: true };
  if ((kind === 'post' || kind === 'page') && img.block) return a.save(item, { blocks: (item.blocks || []).map((b) => (b.id === img.block ? { ...b, alt } : b)) }) && { ok: true };
  if (kind === 'category') { const r = a.save(item, { imageAlt: alt }); return r && r.ok === false ? r : { ok: true }; }
  return { ok: false, error: 'This image’s alt text is set in its editor.' };
}

// ---- health ------------------------------------------------------------------------------------------------------
/** Does an internal link lead somewhere? (a page / product … that exists, or a redirect) */
function linkWorks(url) {
  const u = String(url || '');
  if (!/^\/|dazzleshop\.com\.bd/i.test(u)) return true;
  const p = parsePath(u);
  if (!p) return true;
  return !!findByHandle(p.kind, p.handle) || !!resolve(livePath(p.kind, p.handle));
}
export const ISSUE_WORD = {
  desc: 'No meta description', 'title-len': 'Title too long', 'desc-len': 'Description too long', alt: 'Images without alt text',
  index: 'Hidden from Google', schema: 'Own schema has an error', dup: 'Same title as another page', links: 'Broken link inside',
};
/** Each live item's score and issues (hidden, draft and unpublished items are not checked: Google can't see them). */
export function healthOf(rows = allItems()) {
  const live = rows.filter((r) => r.live);
  const titles = new Map();
  const ctxs = new Map(live.map((r) => [r.kind + ':' + r.id, contextOf(r.kind, r.item)]));
  live.forEach((r) => {
    const ctx = ctxs.get(r.kind + ':' + r.id);
    const t = String(r.seo.metaTitle || ctx.defaultTitle || ctx.title || '').trim().toLowerCase();
    if (t) titles.set(t, (titles.get(t) || 0) + 1);
  });
  return live.map((r) => {
    const ctx = ctxs.get(r.kind + ':' + r.id);
    const checks = seoChecks(r.kind, r.item, ctx).filter((c) => !c.id.startsWith('kw'));
    const t = String(r.seo.metaTitle || ctx.defaultTitle || ctx.title || '').trim().toLowerCase();
    checks.push({ id: 'dup', label: 'Title is its own', ok: (titles.get(t) || 0) < 2, level: 'warning', tip: 'Another page has the same title. Make each one say what is different.' });
    const broken = (ctx.links || []).filter((l) => !linkWorks(l.url));
    checks.push({ id: 'links', label: 'Links inside work', ok: !broken.length, level: 'error', tip: broken.map((l) => l.url).join(', ') });
    const sc = seoScore(checks);
    return { ...r, ctx, score: sc.score, tone: sc.tone, issues: checks.filter((c) => !c.ok).map((c) => ({ id: c.id, label: ISSUE_WORD[c.id] || c.label, level: c.level, tip: c.tip })) };
  });
}

// ---- sitemap ------------------------------------------------------------------------------------------------------
const SITEMAP_KEY = 'gc.seo.sitemap';
export const SITEMAP_TYPES = KIND_ORDER;
export function sitemapTypes() {
  if (typeof window === 'undefined') return Object.fromEntries(KIND_ORDER.map((k) => [k, true]));
  try { const v = JSON.parse(window.localStorage.getItem(SITEMAP_KEY)) || {}; return Object.fromEntries(KIND_ORDER.map((k) => [k, v[k] !== false])); } catch { return Object.fromEntries(KIND_ORDER.map((k) => [k, true])); }
}
export function setSitemapType(kind, on) {
  const v = sitemapTypes();
  v[kind] = !!on;
  try { window.localStorage.setItem(SITEMAP_KEY, JSON.stringify(v)); window.dispatchEvent(new CustomEvent('gc:seo')); } catch { /* ignore */ }
}
const lastmodOf = (r) => r.item.updatedAt || (r.item.savedAt ? new Date(r.item.savedAt).toISOString() : '') || r.item.publishedAt || '';
export function sitemap(rows = allItems()) {
  const types = sitemapTypes();
  const included = [], excluded = [];
  rows.forEach((r) => {
    if (!r.live) return;
    if (!types[r.kind]) { excluded.push({ ...r, why: KINDS[r.kind].plural + ' are left out of the sitemap' }); return; }
    if (r.seo.noindex) { excluded.push({ ...r, why: 'Hidden from search engines (noindex)' }); return; }
    if (r.seo.canonical && r.seo.canonical !== liveUrl(r.kind, r.handle)) { excluded.push({ ...r, why: 'Points to another address (canonical)' }); return; }
    included.push({ ...r, lastmod: lastmodOf(r) });
  });
  return { included, excluded };
}
export function sitemapXml(rows) {
  const { included } = sitemap(rows);
  return ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...included.map((r) => `  <url><loc>${liveUrl(r.kind, r.handle)}</loc>${r.lastmod ? `<lastmod>${String(r.lastmod).slice(0, 10)}</lastmod>` : ''}</url>`), '</urlset>'].join('\n');
}

// ---- robots.txt ---------------------------------------------------------------------------------------------------------
const ROBOTS_KEY = 'gc.seo.robots';
export const DEFAULT_ROBOTS = ['User-agent: *', 'Disallow: /checkout', 'Disallow: /cart', 'Disallow: /account', 'Disallow: /search', 'Disallow: /*?sort=', '', 'Sitemap: https://dazzleshop.com.bd/sitemap.xml'].join('\n');
export function getRobots() {
  if (typeof window === 'undefined') return DEFAULT_ROBOTS;
  try { return window.localStorage.getItem(ROBOTS_KEY) || DEFAULT_ROBOTS; } catch { return DEFAULT_ROBOTS; }
}
export function setRobots(text) { try { window.localStorage.setItem(ROBOTS_KEY, String(text || '')); window.dispatchEvent(new CustomEvent('gc:seo')); } catch { /* ignore */ } }
/** Does this robots.txt keep every search engine off the whole website? ("Disallow: /" under User-agent: *) */
export function blocksWholeSite(text) {
  let star = false;
  return String(text || '').split(/\r?\n/).some((l) => {
    const line = l.replace(/#.*/, '').trim();
    if (/^user-agent:/i.test(line)) { star = /^user-agent:\s*\*\s*$/i.test(line); return false; }
    return star && /^disallow:\s*\/\s*$/i.test(line);
  });
}
export { LIMITS };
