// seo — one SEO model for every page type the website shows: store pages, blog posts, products, categories and landing
// pages (Module C, work package of 14 Oct 2026). The SEO panel (components/seo/SeoPanel.jsx) edits it in all five
// editors; the customer views (components/seo/SeoHead.jsx) write the head tags from it; Online Store › SEO (/seo) and the
// bulk editor (/seo-bulk) read it through lib/seoItems.js.
//
//   An item's SEO:  { metaTitle, metaDescription, focusKeyword, keywords[], canonical, noindex, nofollow,
//                     ogTitle, ogDescription, ogImage, schema (the shop's own JSON-LD, as text) }
//   Empty fields fall back to the item: the title, the excerpt / short description, the featured image, the address.
//   Older fields still read: a store page's seo.title / seo.description / noindex, a product's seoT / seoD / noindex.
//
//   readSeo(kind, item) · seoPatch(kind, item, seo)  read an item's SEO / the item fields to save it back
//   KINDS · livePath(kind, handle) · liveUrl(kind, handle) · demoHref(kind, handle)   where each type lives
//   links in content   [text](url){nofollow sponsored ugc new}: linksInText, setLinkInText, linksInHtml, setLinkInHtml
//   schema             autoSchema(kind, ctx) · parseSchema(text) · mergeSchema(auto, custom) — the shop's own schema
//                      replaces the automatic one of the same type, so a page never says the same thing twice
//   headFor(kind, item, ctx) → { title, description, robots, canonical, og, jsonld } · headHtml(head) (the tags as text)
//   seoChecks(kind, item, ctx) · seoScore(checks)
// Front end only. On the live website the store's server writes these tags into the HTML it sends (search engines
// read that first); here the customer views add them after the page loads, so they show in the browser's inspector,
// not in "View page source".

export const SITE = 'dazzleshop.com.bd';
export const ORIGIN = 'https://' + SITE;
export const LIMITS = { title: 60, desc: 155 };

export const KINDS = {
  page: { label: 'Page', plural: 'Pages', icon: 'file-text', base: '/pages/', demo: '/page?handle=', ogType: 'website' },
  post: { label: 'Blog post', plural: 'Blog posts', icon: 'newspaper', base: '/blog/', demo: '/blog-post?slug=', ogType: 'article' },
  product: { label: 'Product', plural: 'Products', icon: 'package', base: '/products/', demo: '/product?handle=', ogType: 'product' },
  category: { label: 'Category', plural: 'Categories', icon: 'folder-tree', base: '/collections/', demo: '/category?handle=', ogType: 'website' },
  landing: { label: 'Landing page', plural: 'Landing pages', icon: 'rocket', base: '/lp/', demo: '/lp?handle=', ogType: 'product' },
};
export const livePath = (kind, handle) => (KINDS[kind] ? KINDS[kind].base : '/') + (handle || '');
export const liveUrl = (kind, handle) => ORIGIN + livePath(kind, handle);
export const demoHref = (kind, handle) => (KINDS[kind] ? KINDS[kind].demo : '/page?handle=') + encodeURIComponent(handle || '');
/** The kind and handle of a live-site path ("/products/x" → { kind: 'product', handle: 'x' }), or null. */
export function parsePath(path) {
  const p = String(path || '').replace(/^https?:\/\/[^/]+/i, '').split(/[?#]/)[0];
  for (const [kind, k] of Object.entries(KINDS)) if (p.indexOf(k.base) === 0 && p.length > k.base.length) return { kind, handle: decodeURIComponent(p.slice(k.base.length).replace(/\/$/, '')) };
  return null;
}

export const blankSeo = () => ({ metaTitle: '', metaDescription: '', focusKeyword: '', keywords: [], canonical: '', noindex: false, nofollow: false, ogTitle: '', ogDescription: '', ogImage: '', schema: '' });

/** An item's SEO in the one shape (older fields mapped in). */
export function readSeo(kind, item) {
  const it = item || {};
  const s = { ...blankSeo(), ...(it.seo || {}) };
  if (kind === 'page') {
    if (!s.metaTitle && it.seo && it.seo.title) s.metaTitle = it.seo.title;
    if (!s.metaDescription && it.seo && it.seo.description) s.metaDescription = it.seo.description;
    s.noindex = !!(it.noindex || s.noindex);
  }
  if (kind === 'product') {
    s.metaTitle = it.seoT != null ? it.seoT : s.metaTitle;
    s.metaDescription = it.seoD != null ? it.seoD : s.metaDescription;
    s.noindex = !!(it.noindex || s.noindex);
  }
  if (!Array.isArray(s.keywords)) s.keywords = [];
  return s;
}
/** The item fields that store `seo` (older fields kept in step, so screens that read them still work). */
export function seoPatch(kind, item, seo) {
  const s = { ...readSeo(kind, item), ...seo };
  if (kind === 'page') return { seo: { ...s, title: s.metaTitle, description: s.metaDescription }, noindex: !!s.noindex };
  if (kind === 'product') { const { metaTitle, metaDescription, noindex, ...rest } = s; return { seoT: metaTitle, seoD: metaDescription, noindex: !!noindex, seo: rest }; }
  return { seo: s };
}

// ---- lengths and robots --------------------------------------------------------------------------
export function lengthTone(len, max) {
  if (!len) return 'muted';
  if (len > max) return 'error';
  return len >= max * 0.5 ? 'success' : 'warning';
}
export const robotsOf = (seo) => (seo && seo.noindex ? 'noindex' : 'index') + ', ' + (seo && seo.nofollow ? 'nofollow' : 'follow');
const cut = (s, n) => { const t = String(s || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : t; };
export const plainOf = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

// ---- links in content ------------------------------------------------------------------------------
// In the block editor's text a link is [text](url), optionally followed by its options: {nofollow sponsored ugc new}.
// In a product description (HTML) the same options are the <a> tag's rel and target.
export const RELS = [
  ['nofollow', 'Nofollow', 'Don’t pass ranking to this site'],
  ['sponsored', 'Sponsored', 'A paid or affiliate link'],
  ['ugc', 'User content', 'Written by a customer (reviews, comments)'],
];
export const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)(\{([a-z ,]*)\})?/g;
export function parseLinkOpts(str) {
  const words = String(str || '').toLowerCase().split(/[\s,]+/).filter(Boolean);
  return { rel: RELS.map((r) => r[0]).filter((r) => words.includes(r)), newTab: words.includes('new') };
}
export function linkOptsText({ rel = [], newTab = false } = {}) {
  const w = [...rel, ...(newTab ? ['new'] : [])];
  return w.length ? '{' + w.join(' ') + '}' : '';
}
/** Links in block-editor text: [{ n, text, url, rel[], newTab }]. */
export function linksInText(text) {
  const out = [];
  const re = new RegExp(LINK_RE.source, 'g');
  let m, n = 0;
  while ((m = re.exec(String(text || '')))) out.push({ n: n++, text: m[1], url: m[2], ...parseLinkOpts(m[4]) });
  return out;
}
/** The text with link n's options changed. */
export function setLinkInText(text, n, patch) {
  let i = -1;
  return String(text || '').replace(new RegExp(LINK_RE.source, 'g'), (all, t, url, _o, opts) => {
    i++;
    if (i !== n) return all;
    const cur = parseLinkOpts(opts);
    return `[${t}](${url})` + linkOptsText({ ...cur, ...patch });
  });
}
/** Links in the block editor's blocks (paragraphs, quotes, list items): [{ key, block, item, n, text, url, rel, newTab }]. */
export function blockLinks(blocks) {
  const out = [];
  (blocks || []).forEach((b) => {
    if (b.type === 'list') (b.items || []).forEach((x, item) => linksInText(x).forEach((l) => out.push({ ...l, key: b.id + ':' + item + ':' + l.n, block: b.id, item })));
    else if (b.text) linksInText(b.text).forEach((l) => out.push({ ...l, key: b.id + ':' + l.n, block: b.id, item: null }));
  });
  return out;
}
/** The blocks with one link's options changed. */
export function setBlockLink(blocks, link, patch) {
  return (blocks || []).map((b) => {
    if (b.id !== link.block) return b;
    if (link.item != null) return { ...b, items: (b.items || []).map((x, i) => (i === link.item ? setLinkInText(x, link.n, patch) : x)) };
    return { ...b, text: setLinkInText(b.text, link.n, patch) };
  });
}
const A_RE = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
const attr = (attrs, name) => { const m = String(attrs).match(new RegExp('\\b' + name + '\\s*=\\s*("([^"]*)"|\'([^\']*)\')', 'i')); return m ? (m[2] != null ? m[2] : m[3]) : ''; };
/** Links in HTML (a product description): [{ n, text, url, rel[], newTab }]. */
export function linksInHtml(html) {
  const out = [];
  let m, n = 0;
  const re = new RegExp(A_RE.source, 'gi');
  while ((m = re.exec(String(html || '')))) {
    const rel = attr(m[1], 'rel').toLowerCase().split(/\s+/);
    out.push({ n: n++, text: plainOf(m[2]) || attr(m[1], 'href'), url: attr(m[1], 'href'), rel: RELS.map((r) => r[0]).filter((r) => rel.includes(r)), newTab: attr(m[1], 'target') === '_blank' });
  }
  return out;
}
export function setLinkInHtml(html, n, patch) {
  let i = -1;
  return String(html || '').replace(new RegExp(A_RE.source, 'gi'), (all, attrs, inner) => {
    i++;
    if (i !== n) return all;
    const href = attr(attrs, 'href');
    const cur = { rel: RELS.map((r) => r[0]).filter((r) => attr(attrs, 'rel').toLowerCase().split(/\s+/).includes(r)), newTab: attr(attrs, 'target') === '_blank' };
    const next = { ...cur, ...patch };
    const rel = [...next.rel, ...(next.newTab ? ['noopener'] : [])];
    return `<a href="${href}"${rel.length ? ` rel="${rel.join(' ')}"` : ''}${next.newTab ? ' target="_blank"' : ''}>${inner}</a>`;
  });
}
/** The rel and target a link gets on the website. */
export function linkAttrs(url, { rel = [], newTab = false } = {}) {
  const ext = /^https?:/i.test(url) && url.indexOf(SITE) < 0;
  const r = [...rel, ...(newTab ? ['noopener'] : []), ...(newTab && ext ? ['noreferrer'] : [])];
  return { rel: r.length ? r.join(' ') : undefined, target: newTab ? '_blank' : undefined };
}

// ---- structured data (schema.org JSON-LD) --------------------------------------------------------------
const FAMILY = { localbusiness: 'organization', organization: 'organization', store: 'organization', onlinestore: 'organization', blogposting: 'article', newsarticle: 'article', article: 'article', faqpage: 'faqpage', product: 'product', productgroup: 'product', breadcrumblist: 'breadcrumblist' };
const familyOf = (t) => FAMILY[String(t || '').toLowerCase()] || String(t || '').toLowerCase();
const typesOf = (o) => [].concat(o && o['@type'] ? o['@type'] : []);
/** The shop's own schema: { ok, error, items[], types[] }. Empty text is fine (ok, no items). */
export function parseSchema(text) {
  const t = String(text || '').trim();
  if (!t) return { ok: true, error: '', items: [], types: [] };
  let v;
  try { v = JSON.parse(t.replace(/^<script[^>]*>|<\/script>$/gi, '')); } catch (e) { return { ok: false, error: 'This is not valid JSON: ' + String(e.message || e).replace(/^JSON\.parse: /, ''), items: [], types: [] }; }
  const list = Array.isArray(v) ? v : v && Array.isArray(v['@graph']) ? v['@graph'] : [v];
  if (!list.length || list.some((x) => !x || typeof x !== 'object')) return { ok: false, error: 'Each item must be an object like { "@type": "Product", … }.', items: [], types: [] };
  const missing = list.find((x) => !x['@type']);
  if (missing) return { ok: false, error: 'Every item needs an "@type" (for example "Product" or "FAQPage").', items: [], types: [] };
  const items = list.map((x) => ({ '@context': 'https://schema.org', ...x }));
  return { ok: true, error: '', items, types: items.flatMap(typesOf) };
}
/** Automatic + the shop's own: an automatic item is left out when the shop's own has the same type (or family). */
export function mergeSchema(auto, custom) {
  const own = new Set((custom || []).flatMap(typesOf).map(familyOf));
  return [...(auto || []).filter((a) => !typesOf(a).some((t) => own.has(familyOf(t)))), ...(custom || [])];
}
/** Which automatic types a custom schema replaces: ['Product', …]. */
export function replacedTypes(auto, custom) {
  const own = new Set((custom || []).flatMap(typesOf).map(familyOf));
  return (auto || []).flatMap(typesOf).filter((t) => own.has(familyOf(t)));
}

const AVAIL = { in: 'https://schema.org/InStock', out: 'https://schema.org/OutOfStock', pre: 'https://schema.org/PreOrder' };
/** The automatic schema for an item, from its context (lib/seoItems.js › contextOf). */
export function autoSchema(kind, ctx = {}) {
  const C = 'https://schema.org';
  const out = [];
  const url = ctx.url || liveUrl(kind, ctx.handle);
  const shop = ctx.shop || {};
  if (kind === 'product' || kind === 'landing') {
    const p = ctx.product || {};
    const o = {
      '@context': C, '@type': 'Product', name: p.name || ctx.title, url,
      ...(ctx.images && ctx.images.length ? { image: ctx.images.map((x) => x.src).filter(Boolean) } : {}),
      ...(ctx.description ? { description: cut(ctx.description, 300) } : {}),
      ...(p.sku ? { sku: p.sku } : {}),
      ...(p.gtin ? { gtin13: p.gtin } : {}),
      ...(p.brand ? { brand: { '@type': 'Brand', name: p.brand } } : {}),
      offers: { '@type': 'Offer', url, priceCurrency: 'BDT', price: String(p.price || 0), availability: AVAIL[p.stock > 0 ? 'in' : p.oversell ? 'pre' : 'out'], itemCondition: 'https://schema.org/NewCondition', seller: { '@type': 'Organization', name: shop.name || 'Dazzle Shop' } },
      ...(p.rating && p.rating.count ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: Number(p.rating.avg).toFixed(1), reviewCount: p.rating.count } } : {}),
    };
    out.push(o);
  }
  if (kind === 'post') {
    const a = ctx.article || {};
    out.push({
      '@context': C, '@type': 'BlogPosting', headline: cut(ctx.title, 110), url, mainEntityOfPage: url,
      ...(ctx.images && ctx.images[0] && ctx.images[0].src ? { image: [ctx.images[0].src] } : {}),
      ...(a.author ? { author: { '@type': 'Person', name: a.author } } : {}),
      ...(a.published ? { datePublished: a.published } : {}), ...(a.modified ? { dateModified: a.modified } : {}),
      publisher: { '@type': 'Organization', name: shop.name || 'Dazzle Shop', ...(shop.logo ? { logo: { '@type': 'ImageObject', url: shop.logo } } : {}) },
      ...(ctx.description ? { description: cut(ctx.description, 300) } : {}),
    });
  }
  if (kind === 'category') {
    out.push({ '@context': C, '@type': 'CollectionPage', name: ctx.title, url, ...(ctx.description ? { description: cut(ctx.description, 300) } : {}) });
  }
  if (kind === 'page') {
    out.push({
      '@context': C, '@type': 'LocalBusiness', name: shop.name || 'Dazzle Shop', url: ORIGIN,
      ...(shop.logo ? { logo: shop.logo, image: shop.logo } : {}), ...(shop.phone ? { telephone: shop.phone } : {}), ...(shop.email ? { email: shop.email } : {}),
      ...(shop.address ? { address: { '@type': 'PostalAddress', streetAddress: shop.address, addressCountry: 'BD' } } : {}),
      ...(shop.map ? { hasMap: shop.map } : {}), priceRange: '৳৳',
    });
  }
  const faq = (ctx.faq || []).filter((x) => x && x.q && x.a);
  if (faq.length) out.push({ '@context': C, '@type': 'FAQPage', mainEntity: faq.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })) });
  const crumbs = ctx.breadcrumbs || [];
  if (crumbs.length) out.push({ '@context': C, '@type': 'BreadcrumbList', itemListElement: crumbs.map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.name, item: ORIGIN + b.path })) });
  return out;
}

// ---- the head ---------------------------------------------------------------------------------------
/** What the customer view writes into <head>. ctx from lib/seoItems.js › contextOf. */
export function headFor(kind, item, ctx = {}) {
  const seo = readSeo(kind, item);
  const url = ctx.url || liveUrl(kind, ctx.handle);
  const title = seo.metaTitle || ctx.defaultTitle || ctx.title || '';
  const description = seo.metaDescription || cut(ctx.description, LIMITS.desc);
  const image = seo.ogImage || (ctx.images && ctx.images[0] && ctx.images[0].src) || '';
  const own = parseSchema(seo.schema);
  return {
    title, description, robots: robotsOf(seo), canonical: seo.canonical || url,
    og: {
      'og:type': (KINDS[kind] || {}).ogType || 'website', 'og:site_name': (ctx.shop && ctx.shop.name) || 'Dazzle Shop', 'og:url': seo.canonical || url,
      'og:title': seo.ogTitle || title, 'og:description': seo.ogDescription || description, ...(image ? { 'og:image': image.indexOf('http') === 0 ? image : ORIGIN + image } : {}),
      'twitter:card': image ? 'summary_large_image' : 'summary',
    },
    jsonld: mergeSchema(autoSchema(kind, ctx), own.ok ? own.items : []),
    schemaError: own.ok ? '' : own.error,
  };
}
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
/** The head tags as the website's HTML would carry them (for "What search engines see"). */
export function headHtml(head) {
  if (!head) return '';
  const lines = [
    `<title>${esc(head.title)}</title>`,
    head.description ? `<meta name="description" content="${esc(head.description)}">` : null,
    `<meta name="robots" content="${esc(head.robots)}">`,
    `<link rel="canonical" href="${esc(head.canonical)}">`,
    ...Object.entries(head.og || {}).filter(([, v]) => v).map(([k, v]) => (k.indexOf('twitter:') === 0 ? `<meta name="${k}" content="${esc(v)}">` : `<meta property="${k}" content="${esc(v)}">`)),
    ...(head.jsonld || []).map((j) => `<script type="application/ld+json">${JSON.stringify(j, null, 2)}</script>`),
  ];
  return lines.filter(Boolean).join('\n');
}

// ---- checks ------------------------------------------------------------------------------------------
const lower = (s) => String(s || '').toLowerCase();
/** What a search engine and a reader see: [{ id, label, ok, tip, level ('error'|'warning') }]. */
export function seoChecks(kind, item, ctx = {}) {
  const seo = readSeo(kind, item);
  const head = headFor(kind, item, ctx);
  const kw = lower(seo.focusKeyword).trim();
  const imgs = ctx.images || [];
  const out = [
    { id: 'desc', label: 'Has a meta description', ok: !!String(seo.metaDescription).trim(), level: 'error', tip: 'Write one or two sentences for the search result. Without it Google picks text from the page.' },
    { id: 'title-len', label: `Title fits (up to ${LIMITS.title} characters)`, ok: head.title.length > 0 && head.title.length <= LIMITS.title, level: 'warning', tip: `Now ${head.title.length}. Google cuts longer titles.` },
    { id: 'desc-len', label: `Description fits (up to ${LIMITS.desc} characters)`, ok: !seo.metaDescription || seo.metaDescription.length <= LIMITS.desc, level: 'warning', tip: `Now ${String(seo.metaDescription).length}. Google cuts longer descriptions.` },
    { id: 'alt', label: 'Images have alt text', ok: imgs.every((x) => String(x.alt || '').trim()), level: 'warning', tip: `${imgs.filter((x) => !String(x.alt || '').trim()).length} of ${imgs.length} images have none. Describe what each shows.` },
    { id: 'index', label: 'Search engines may list it', ok: !seo.noindex || !ctx.live, level: 'warning', tip: 'It is on the website but hidden from Google (noindex). Turn this off unless you mean it.' },
    { id: 'schema', label: 'Own schema is valid', ok: !head.schemaError, level: 'error', tip: head.schemaError },
  ];
  if (kw) {
    out.push({ id: 'kw-title', label: 'Keyword in the title', ok: lower(head.title).includes(kw), level: 'warning', tip: 'Put the keyword near the start of the title.' });
    out.push({ id: 'kw-desc', label: 'Keyword in the description', ok: lower(head.description).includes(kw), level: 'warning', tip: 'Use the keyword once in the description.' });
    out.push({ id: 'kw-text', label: 'Keyword in the text', ok: lower(ctx.text || ctx.description).includes(kw), level: 'warning', tip: 'Mention the keyword in the opening lines.' });
  }
  return out;
}
/** { score 0–100, tone, label } from the checks (an error costs 20, a warning 10). */
export function seoScore(checks) {
  const lost = (checks || []).reduce((a, c) => a + (c.ok ? 0 : c.level === 'error' ? 20 : 10), 0);
  const score = Math.max(0, 100 - lost);
  const tone = score >= 80 ? 'success' : score >= 50 ? 'warning' : 'error';
  return { score, tone, label: tone === 'success' ? 'Good' : tone === 'warning' ? 'Needs work' : 'Poor' };
}

// ---- Bangladesh time for scheduling (the same whatever the browser's time zone) ---------------------------------
const BD = 6 * 3600e3;
/** An ISO time as a datetime-local value in Asia/Dhaka. */
export const toDhakaInput = (iso) => { const t = iso ? new Date(iso).getTime() : NaN; return isNaN(t) ? '' : new Date(t + BD).toISOString().slice(0, 16); };
/** A datetime-local value read as Asia/Dhaka, as an ISO time ('' when empty). */
export const fromDhakaInput = (v) => (v ? new Date(v + ':00+06:00').toISOString() : '');
/** "Fri 17 Oct, 9:00 AM" in Asia/Dhaka. */
export function dhakaText(iso) {
  if (!iso) return '';
  const d = new Date(new Date(iso).getTime() + BD);
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()];
  const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()];
  const h = d.getUTCHours(), m = String(d.getUTCMinutes()).padStart(2, '0');
  return `${day} ${d.getUTCDate()} ${mon}, ${(h % 12) || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
}
