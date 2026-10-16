// storefront/kit — the store kit: one file (`<name>.gcstore.json`) that holds a whole store design — theme settings,
// headers, page layouts, HTML blocks, menus (with mega menus), sample pages, store notices and block placements. It
// never carries products, customers or orders. Kits are how designs move: a shop exports its look, GridCommerce's
// design service delivers one, a theme in the super admin's library is one, and Claude writes one from a brief
// (tools/store-kit/SKILL.md). This file is pure (no imports but schema.js, no browser): the app (kitStore.js) and the
// checker (`node tools/store-kit/check.mjs`) both use it.
//
//   KIT_VERSION · KIT_EXT · KIT_PARTS · KIT_TOKENS · KIT_LIMITS
//   parseKit(text) → { kit, error }
//   checkKit(input, ctx?) → { ok, errors: [{ path, text }], warnings: [{ path, text }], kit (normalised), counts }
//       ctx (optional, from the shop): { categories: [path], pages: [{ id, handle }], products: [id], blocks: [id],
//       menus: [id], offers: [id] } — with it, links to things the shop doesn't have are reported.
//   fillTokens(x, shop) — {{shop_name}} … replaced with the shop's own details (on apply)
//   kitToStore(kit, { now }) → { meta, theme, headers, defaultHeader, layouts, blocks, menus, pages, notices, placements }
//       in the store's own shapes (lib/storefront/store.js, storeMenus.js, storePages.js), every part published unless
//       the kit marks it `draft: true`
//   storeToKit({ data, menus, pages, meta, parts }) → kit (export; settings equal to their defaults are left out)
//
// THE FORMAT (version 1). Every part is optional except meta.name. Ids are short words of your choice (a-z, 0-9, -).
//   {
//     "gcstore": 1,
//     "meta": { "id": "signal", "name": "Signal", "description": "…", "for": "Electronics", "version": "1.0",
//               "author": "GridCommerce", "made": "2026-10-15" },
//     "theme": { "<option>": value, … },                       only options that differ from the default
//     "headers": [ { "id", "name", "default": true, "overHero": false, "shrink": false,
//                    "desktop": { "top" | "main" | "bottom": Row | null },
//                    "mobile":  { "top" | "main" | "bottom": Row | null, "drawer": [item], "bottomNav": bool, "navItems": [item] } } ],
//         Row = { "height": px, "tone", "sticky": bool, "left": [El], "center": [El], "right": [El] }
//         El  = "logo" | { "type": "search", "cats": true, … }   (an element's settings; left out = its default)
//     "layouts": [ { "id", "kind", "name", "when": { "type": "all" | "category" | "product" | "page", "ref" },
//                    "header": "<header id>", "sections": [ { "type", …fields, "tone", "hidden" } ] } ],
//         every kind but home has one { "type": "main" } section (the page's own content)
//     "blocks": [ { "id", "name", "type": "content" | "banner" | …, "content": [ContentBlock] } ]
//         ContentBlock = { "type": "p", "text": "…" } · h2 · h3 · list · quote · image · product · cta · divider · embed · table · faq
//     "menus": [ { "id": "main", "name", "place": "header" | "footer", "items": [Item] } ]
//         Item = { "label", "link": { "type": "home" | "page" | "category" | "product" | "offers" | "blog" | "url", "ref", "url" },
//                  "children": [Item] (one level), "mega": { "on", "width", "px", "cols": [Col], "promo" } }
//         a page link's ref is the page's address (handle), e.g. "about-us"
//     "pages": [ { "handle", "title", "content": [ContentBlock], "status": "published" } ]
//     "notices": [ { "id", "text", "textBn", "from": "" | "offers", "button", "link", "code", "countdown", "tone", "place", "show", "start", "end", "dismiss" } ]
//     "placements": [ { "id", "block", "spot", "show", "start", "end", "order" } ]
//     "customs": [ { "id", "name", "html", "css", "fields": [ { "key", "label", "type", "default" } ] } ]
//         custom sections (customCode.js): {{key}} in the HTML is a setting; a layout uses one with
//         { "type": "custom", "custom": "<id>", "values": { "<key>": "…" } }. Scripts, frames, forms and event handlers
//         are taken out, and the CSS is scoped to the section.
//         show = { "pages": "all" | [kind], "categories": [path], "products": [id], "devices": "all" | "desktop" | "mobile" }
//   }
// Any part may carry "draft": true (imported but not published). Text may use {{shop_name}}, {{shop_phone}},
// {{shop_email}}, {{shop_address}}, {{shop_hours}}, {{whatsapp}}: they become the shop's own details when applied; a
// colour option may be {{brand_primary}} or {{brand_accent}} (the brand colours in Settings › General).
// The full list of allowed values: `node tools/store-kit/check.mjs --vocab`.

import {
  OPTIONS, optionBy, DEFAULTS, ELEMENTS, elementBy, ROWS, AREAS, ROW_TONES, DRAWER_ITEMS, NAV_ITEMS, KINDS, kindBy,
  SECTION_TYPES, sectionType, SECTION_TONES, SLIDE_FIELDS, BLOCK_KINDS, CONTENT_BLOCK_TYPES, CONTENT_BLOCK_FIELDS,
  LINK_TYPES, MENU_PLACES, MEGA_WIDTHS, MEGA_KINDS, NOTICE_PLACES, NOTICE_TONES, NOTICE_SOURCES, SPOTS, PAGE_KINDS, DEVICES,
  HEADER_SWITCHES, ITEM_ICONS, ICONS, fromOldSection,
} from './schema.js';
const LIST_ICONS = [...new Set([...ITEM_ICONS, ...ICONS])];
import { renderCustom, customProblem, checkCss, CUSTOM_FIELD_TYPES, CUSTOM_LIMITS } from './customCode.js';

export const KIT_VERSION = 1;
export const KIT_EXT = '.gcstore.json';
export const KIT_PARTS = [
  { key: 'theme', label: 'Theme settings', hint: 'Colours, fonts, product card, product and category pages, footer, extras' },
  { key: 'headers', label: 'Headers', hint: 'The ready headers; the one marked default becomes the default' },
  { key: 'layouts', label: 'Page layouts', hint: 'Home, product, category, page, cart, search and page-not-found layouts' },
  { key: 'blocks', label: 'HTML blocks', hint: 'Reusable content: banners, delivery info, size guides, footers' },
  { key: 'menus', label: 'Menus', hint: 'Header menu with mega menus, footer menus' },
  { key: 'pages', label: 'Pages', hint: 'Ready pages (added, or replaced when the address is the same)' },
  { key: 'notices', label: 'Store notices', hint: 'Messages above or under the header' },
  { key: 'placements', label: 'Block placements', hint: 'Where HTML blocks show across the store' },
  { key: 'customs', label: 'Custom sections', hint: 'Sections with their own HTML and CSS (scripts are never kept)' },
];
export const KIT_TOKENS = [
  ['shop_name', 'The shop’s name'], ['shop_phone', 'Support phone'], ['shop_email', 'Support email'],
  ['shop_address', 'Shop address'], ['shop_hours', 'Opening hours'], ['whatsapp', 'WhatsApp number (8801…)'],
  ['brand_primary', 'The brand colour (Settings › General), for a colour option'], ['brand_accent', 'The brand’s second colour, for a colour option'],
];
const BRAND_TOKEN = /^\{\{\s*brand_(primary|accent)\s*\}\}$/;
export const KIT_LIMITS = { bytes: 2_000_000, inlineImage: 400_000, text: 300, area: 2000, css: 20000, headers: 12, layouts: 40, sections: 30, blocks: 80, content: 60, menus: 8, items: 40, pages: 20, notices: 12, placements: 60, slides: 8, faq: 20, picked: 24 };

// ---- small helpers --------------------------------------------------------------------------------------------------
const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
const str = (x) => (x == null ? '' : String(x));
const clone = (x) => (x == null ? x : JSON.parse(JSON.stringify(x)));
const ID_RE = /^[a-z0-9][a-z0-9-]{0,47}$/i;
const COLOR_RE = /^#[0-9a-f]{6}$/i;
const choiceValues = (list) => (list || []).map((c) => (typeof c === 'string' ? c : Array.isArray(c) ? c[0] : c.value));
let seq = 0;
const genId = (p) => p + '-' + Date.now().toString(36) + (seq++).toString(36) + Math.random().toString(36).slice(2, 5);

/** '' when a link or picture address is safe, else why not. kind: 'link' | 'image' */
export function urlProblem(u, kind = 'link') {
  const s = str(u).trim();
  if (!s) return '';
  if (/^\s*(javascript|vbscript|file):/i.test(s)) return 'is not allowed (scripts and local files can’t be linked)';
  if (/^data:/i.test(s)) {
    if (kind !== 'image') return 'can only be a picture';
    if (!/^data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,/i.test(s)) return 'is not a PNG, JPG, WebP, GIF or SVG picture';
    if (s.length > KIT_LIMITS.inlineImage) return `is a picture over ${Math.round(KIT_LIMITS.inlineImage / 1000)} KB; link to it instead`;
    return '';
  }
  if (/^(https?:\/\/|\/|#|mailto:|tel:|\?)/i.test(s)) return '';
  if (/^\{\{[a-z_]+\}\}/.test(s)) return '';
  return 'must start with /, https://, mailto: or tel:';
}

/** Replace {{shop_name}} and the other tokens in every string of x. */
export function fillTokens(x, shop = {}) {
  const map = { shop_name: shop.name, shop_phone: shop.phone, shop_email: shop.email, shop_address: shop.address, shop_hours: shop.hours, whatsapp: shop.whatsapp, brand_primary: shop.brandPrimary || '#003087', brand_accent: shop.brandAccent || '#009cde' };
  const one = (s) => s.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (m, k) => (map[k] != null && map[k] !== '' ? String(map[k]) : m));
  const walk = (v) => (typeof v === 'string' ? one(v) : Array.isArray(v) ? v.map(walk) : isObj(v) ? Object.fromEntries(Object.entries(v).map(([k, w]) => [k, walk(w)])) : v);
  return walk(x);
}

/** Read a kit from text. */
export function parseKit(text) {
  const s = str(text);
  if (!s.trim()) return { kit: null, error: 'The file is empty.' };
  if (s.length > KIT_LIMITS.bytes) return { kit: null, error: `The file is ${(s.length / 1e6).toFixed(1)} MB; a store kit can be up to ${KIT_LIMITS.bytes / 1e6} MB. Link to big pictures instead of putting them inside.` };
  try { return { kit: JSON.parse(s), error: '' }; } catch (e) {
    const m = /position (\d+)/.exec(String(e && e.message));
    let where = '';
    if (m) { const pos = Number(m[1]); const line = s.slice(0, pos).split('\n').length; where = ` (line ${line})`; }
    return { kit: null, error: 'This isn’t a readable store kit: the JSON is broken' + where + '.' };
  }
}

// ---- checking -------------------------------------------------------------------------------------------------------
/**
 * Check a kit and return it normalised (defaults filled in, elements as objects). Errors stop an import; warnings
 * don't (they say what will be left out or what to look at).
 */
export function checkKit(input, ctx = null) {
  const errors = [];
  const warnings = [];
  const err = (path, text) => errors.push({ path, text });
  const warn = (path, text) => warnings.push({ path, text });

  let raw = input;
  if (typeof input === 'string') { const r = parseKit(input); if (r.error) return { ok: false, errors: [{ path: '', text: r.error }], warnings, kit: null, counts: {} }; raw = r.kit; }
  if (!isObj(raw)) return { ok: false, errors: [{ path: '', text: 'A store kit is one JSON object: { "gcstore": 1, "meta": { … }, … }.' }], warnings, kit: null, counts: {} };
  if (raw.gcstore !== KIT_VERSION) {
    if (raw.gcstore == null) err('gcstore', 'This isn’t a store kit: it has no "gcstore": 1 line.');
    else err('gcstore', `This kit is version ${raw.gcstore}; this store reads version ${KIT_VERSION}.`);
    return { ok: false, errors, warnings, kit: null, counts: {} };
  }
  const known = new Set(['gcstore', 'meta', ...KIT_PARTS.map((p) => p.key)]);
  Object.keys(raw).filter((k) => !known.has(k)).forEach((k) => warn(k, `“${k}” isn’t part of a store kit and is left out.`));

  const kit = { gcstore: KIT_VERSION };
  const tokenCheck = (path, s) => { String(s).replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (m, k) => { if (!KIT_TOKENS.some(([t]) => t === k)) warn(path, `{{${k}}} isn’t a known shop detail; it will show as typed.`); return m; }); };
  const text = (path, v, max = KIT_LIMITS.text, label = 'Text') => {
    if (v == null) return '';
    if (typeof v !== 'string' && typeof v !== 'number') { err(path, `${label} must be words, not a list or object.`); return ''; }
    const s = String(v);
    if (s.length > max) err(path, `${label} is ${s.length} characters; the most is ${max}.`);
    if (/<\s*script/i.test(s)) err(path, `${label} can’t hold a script.`);
    tokenCheck(path, s);
    return s;
  };
  const link = (path, v, kind = 'link') => { const s = text(path, v, 2000, kind === 'image' ? 'A picture address' : 'A link'); const p = urlProblem(s, kind); if (p) err(path, `“${s.slice(0, 60)}” ${p}.`); return s; };
  const idOf = (path, v, label) => { const s = str(v).trim(); if (!s) { err(path, `${label} needs an id (a short word: letters, numbers and -).`); return ''; } if (!ID_RE.test(s)) err(path, `The id “${s}” can only use letters, numbers and -, up to 48 characters.`); return s; };
  const nameOf = (o, fallback) => (isObj(o) && (o.name || o.label || o.title || o.id)) ? `‘${o.name || o.label || o.title || o.id}’` : fallback;
  const list = (path, v, max, label) => { if (v == null) return []; if (!Array.isArray(v)) { err(path, `${label} must be a list [ … ].`); return []; } if (v.length > max) err(path, `${label}: ${v.length}; the most is ${max}.`); return v; };
  const choice = (path, v, choices, label) => { const vals = choiceValues(choices); if (!vals.includes(v)) { err(path, `${label} “${str(v)}” isn’t one of: ${vals.join(', ')}.`); return vals[0]; } return v; };
  const bool = (path, v, label) => { if (typeof v !== 'boolean') { err(path, `${label} must be true or false.`); return !!v; } return v; };
  const num = (path, v, min, max, label) => { const n = Number(v); if (v === '' || v == null || !Number.isFinite(n)) { err(path, `${label} must be a number.`); return min; } if (n < min || n > max) err(path, `${label} ${n} is outside ${min}–${max}.`); return n; };
  const dateOf = (path, v, label) => { if (v == null || v === '') return ''; const t = Date.parse(v); if (!Number.isFinite(t)) { err(path, `${label} “${str(v)}” isn’t a date (use 2026-10-20T09:00:00+06:00).`); return ''; } return str(v); };

  // meta
  const m = isObj(raw.meta) ? raw.meta : {};
  if (!isObj(raw.meta)) err('meta', 'The kit needs "meta": { "name": "…" }.');
  kit.meta = {
    id: m.id ? idOf('meta.id', m.id, 'The kit') : '',
    name: text('meta.name', m.name, 60, 'The name'),
    description: text('meta.description', m.description, 400, 'The description'),
    for: text('meta.for', m.for, 60, '“For”'),
    version: text('meta.version', m.version, 20, 'The version'),
    author: text('meta.author', m.author, 80, 'The author'),
    made: text('meta.made', m.made, 40, 'The date'),
  };
  if (!kit.meta.name) err('meta.name', 'The kit needs a name.');

  const has = (k) => raw[k] != null;
  const blockIds = new Set(has('blocks') && Array.isArray(raw.blocks) ? raw.blocks.filter(isObj).map((b) => str(b.id)) : []);
  const blockTypes = new Map(has('blocks') && Array.isArray(raw.blocks) ? raw.blocks.filter(isObj).map((b) => [str(b.id), str(b.type || 'content')]) : []);
  const headerIds = new Set(has('headers') && Array.isArray(raw.headers) ? raw.headers.filter(isObj).map((h) => str(h.id)) : []);
  const menuIds = new Set(has('menus') && Array.isArray(raw.menus) ? raw.menus.filter(isObj).map((x) => str(x.id)) : []);
  const customIds = new Set(has('customs') && Array.isArray(raw.customs) ? raw.customs.filter(isObj).map((c) => str(c.id)) : []);
  const pageHandles = new Set(has('pages') && Array.isArray(raw.pages) ? raw.pages.filter(isObj).map((p) => str(p.handle)) : []);
  const blockRef = (path, id, want) => {
    if (!id) return;
    if (blockIds.has(id)) { if (want && blockTypes.get(id) !== want && want !== 'any') warn(path, `Block ‘${id}’ is a ${blockTypes.get(id)} block; a ${want} block fits here better.`); return; }
    if (ctx && Array.isArray(ctx.blocks)) { if (!ctx.blocks.includes(id)) err(path, `Uses HTML block ‘${id}’, which isn’t in the file or in the shop.`); return; }
    warn(path, `Uses HTML block ‘${id}’, which isn’t in the file: the shop must already have it.`);
  };
  const catRef = (path, ref) => { if (ref && ctx && Array.isArray(ctx.categories) && !ctx.categories.includes(ref)) warn(path, `The shop has no category “${ref}”: this link or list will be empty until it does.`); };

  // ---- theme ----
  if (has('theme')) {
    if (!isObj(raw.theme)) err('theme', 'Theme settings must be { "option": value, … }.');
    else {
      const t = {};
      Object.entries(raw.theme).forEach(([k, v]) => {
        const o = optionBy(k);
        const path = 'theme.' + k;
        if (k === 'words' && isObj(v)) { t.words = Object.fromEntries(Object.entries(v).slice(0, 400).map(([wk, wv]) => [wk, text(`${path}.${wk}`, wv == null ? '' : String(wv), KIT_LIMITS.area, 'A word')])); return; }
        if (!o) { warn(path, `“${k}” isn’t a theme setting and is left out.`); return; }
        if (o.type === 'image') { t[k] = link(path, v, 'image'); return; }
        if (o.type === 'color') { if (BRAND_TOKEN.test(str(v))) { t[k] = str(v).replace(/\s/g, ''); return; } if (!COLOR_RE.test(str(v))) err(path, `${o.label} must be a colour like #0f172a (or {{brand_primary}}).`); t[k] = str(v).toLowerCase(); }
        else if (o.type === 'choice') t[k] = choice(path, str(v), o.choices, o.label);
        else if (o.type === 'bool') t[k] = bool(path, v, o.label);
        else if (o.type === 'number') t[k] = num(path, v, o.min != null ? o.min : 0, o.max != null ? o.max : 1e6, o.label);
        else if (o.type === 'block') { t[k] = text(path, v, 48, o.label); blockRef(path, t[k], o.blockType); }
        else if (o.type === 'css') { t[k] = text(path, v, KIT_LIMITS.css, o.label); const cc = String(t[k] || '').trim() ? checkCss(t[k], { max: KIT_LIMITS.css }) : { ok: true }; if (!cc.ok) err(path, 'Custom CSS: ' + cc.problems[0]); }
        else t[k] = text(path, v, KIT_LIMITS.text, o.label);
      });
      kit.theme = t;
    }
  }

  // ---- blocks (before headers and layouts point at them) ----
  const contentList = (path, v, label = 'Content') => list(path, v, KIT_LIMITS.content, label).map((b, i) => contentBlock(`${path}[${i}]`, b)).filter(Boolean);
  function contentBlock(path, b) {
    if (!isObj(b)) { err(path, 'Each content block must be { "type": "p", "text": "…" }.'); return null; }
    const type = str(b.type || 'p');
    if (!CONTENT_BLOCK_TYPES.some((t) => t.type === type)) { err(path, `“${type}” isn’t a content block. Use: ${CONTENT_BLOCK_TYPES.map((t) => t.type).join(', ')}.`); return null; }
    const out = { type };
    Object.entries(CONTENT_BLOCK_FIELDS[type]).forEach(([k, kind]) => {
      const v = b[k];
      const p = path + '.' + k;
      if (Array.isArray(kind)) { out[k] = v == null ? kind[0] : choice(p, str(v), kind.map((x) => [x, x]), k); return; }
      if (kind === 'text') out[k] = text(p, v, type === 'p' || type === 'quote' ? KIT_LIMITS.area : KIT_LIMITS.text);
      else if (kind === 'link') out[k] = link(p, v, 'link');
      else if (kind === 'image') { out[k] = link(p, v, 'image'); if (!out[k]) err(p, 'An image block needs a picture address.'); }
      else if (kind === 'bool') out[k] = v == null ? (k === 'header') : bool(p, v, k);
      else if (kind === 'strings') out[k] = list(p, v, 40, 'List items').map((x, i) => text(`${p}[${i}]`, x, KIT_LIMITS.text));
      else if (kind === 'table') out[k] = list(p, v, 40, 'Table rows').map((r, i) => (Array.isArray(r) ? r.slice(0, 8).map((c, j) => text(`${p}[${i}][${j}]`, c, KIT_LIMITS.text)) : (err(`${p}[${i}]`, 'Each table row must be a list of cells.'), [])));
      else if (kind === 'faq') out[k] = list(p, v, KIT_LIMITS.faq, 'Questions').map((q, i) => ({ q: text(`${p}[${i}].q`, isObj(q) ? q.q : '', KIT_LIMITS.text, 'A question'), a: text(`${p}[${i}].a`, isObj(q) ? q.a : '', KIT_LIMITS.area, 'An answer') }));
    });
    return out;
  }
  if (has('blocks')) {
    const seen = new Set();
    kit.blocks = list('blocks', raw.blocks, KIT_LIMITS.blocks, 'HTML blocks').map((b, i) => {
      const path = `blocks[${i}]`;
      if (!isObj(b)) { err(path, 'Each HTML block must be { "id", "name", "type", "content": [ … ] }.'); return null; }
      const id = idOf(path + '.id', b.id, 'Each HTML block');
      if (id && seen.has(id)) err(path + '.id', `Two HTML blocks share the id ‘${id}’.`);
      seen.add(id);
      const type = b.type == null ? 'content' : choice(path + '.type', str(b.type), BLOCK_KINDS.map((k) => [k.type, k.label]), 'Block type');
      const content = contentList(path + '.content', b.content != null ? b.content : b.blocks);
      if (!content.length) warn(path, `HTML block ${nameOf(b, id)} is empty.`);
      return { id, name: text(path + '.name', b.name || id, 60, 'The name'), type, content, ...(b.draft ? { draft: true } : {}) };
    }).filter(Boolean);
  }

  // ---- custom sections (before layouts point at them) ----
  if (has('customs')) {
    const seen = new Set();
    kit.customs = list('customs', raw.customs, CUSTOM_LIMITS.customs, 'Custom sections').map((c, i) => {
      const path = `customs[${i}]`;
      if (!isObj(c)) { err(path, 'Each custom section must be { "id", "name", "html", "css", "fields": [ … ] }.'); return null; }
      const id = idOf(path + '.id', c.id, 'Each custom section');
      if (id && seen.has(id)) err(path + '.id', `Two custom sections share the id ‘${id}’.`);
      seen.add(id);
      const fields = list(path + '.fields', c.fields, CUSTOM_LIMITS.fields, 'Settings').map((f, j) => {
        const fp = `${path}.fields[${j}]`;
        if (!isObj(f)) { err(fp, 'Each setting is { "key", "label", "type", "default" }.'); return null; }
        return { key: str(f.key), label: text(fp + '.label', f.label || f.key, 60, 'The label'), type: f.type == null ? 'text' : choice(fp + '.type', str(f.type), CUSTOM_FIELD_TYPES, 'Setting type'), default: text(fp + '.default', f.default == null ? '' : String(f.default), KIT_LIMITS.area, 'The default') };
      }).filter(Boolean);
      // code: only its type and length here; what it may not do is taken out when it shows (customCode.js)
      const code = (cp, v, label) => { if (v == null) return ''; if (typeof v !== 'string') { err(cp, `${label} must be text.`); return ''; } if (v.length > CUSTOM_LIMITS.html) err(cp, `${label} is ${v.length} characters; the most is ${CUSTOM_LIMITS.html}.`); return v; };
      const def = { id, name: text(path + '.name', c.name || id, 60, 'The name'), html: code(path + '.html', c.html, 'The HTML'), css: code(path + '.css', c.css, 'The CSS'), fields };
      const keys = new Set(fields.map((f) => f.key));
      [['html', def.html], ['css', def.css]].forEach(([w, t]) => String(t).replace(/\{\{\s*([a-zA-Z][\w-]*)\s*\}\}/g, (m, k) => { if (!keys.has(k) && !KIT_TOKENS.some(([x]) => x === k)) warn(`${path}.${w}`, `{{${k}}} is neither a setting of this section nor a shop detail; it shows as nothing.`); return m; }));
      const p = customProblem(def);
      if (p) err(path, `Custom section ${nameOf(c, id)}: ${p}`);
      const rendered = renderCustom(def, {});
      const gone = rendered.removed;
      if (gone.length) warn(path, `Custom section ${nameOf(c, id)}: these are taken out when it shows: ${gone.join(', ')}.`);
      return def;
    }).filter(Boolean);
  }

  // ---- headers ----
  const element = (path, e) => {
    const o = typeof e === 'string' ? { type: e } : isObj(e) ? e : null;
    if (!o) { err(path, 'An element is a word like "logo" or { "type": "search", … }.'); return null; }
    const def = elementBy(str(o.type));
    if (!def) { err(path, `“${str(o.type)}” isn’t a header element. Use: ${ELEMENTS.map((x) => x.type).join(', ')}.`); return null; }
    const out = { type: def.type };
    def.settings.forEach(([k, label, type, d, choices]) => {
      const v = o[k];
      const p = path + '.' + k;
      if (v == null) { out[k] = d; return; }
      if (type === 'choice') out[k] = choice(p, str(v), choices, label);
      else if (type === 'bool') out[k] = bool(p, v, label);
      else if (type === 'block') { out[k] = text(p, v, 48, label); blockRef(p, out[k], 'any'); }
      else if (type === 'menu') { out[k] = text(p, v, 48, label); if (out[k] && has('menus') && !menuIds.has(out[k])) warn(p, `Menu ‘${out[k]}’ isn’t in the file: the shop must already have it.`); }
      else if (k === 'href') out[k] = link(p, v);
      else out[k] = text(p, v, KIT_LIMITS.text, label);
    });
    Object.keys(o).filter((k) => k !== 'type' && k !== 'id' && !def.settings.some(([s]) => s === k)).forEach((k) => warn(path + '.' + k, `A ${def.type} element has no “${k}” setting; it is left out.`));
    return out;
  };
  const rowOf = (path, r, key) => {
    if (r == null || r === false) return null;
    if (!isObj(r)) { err(path, 'A header row is { "height", "tone", "sticky", "left": [], "center": [], "right": [] } or null.'); return null; }
    const out = {
      height: r.height == null ? (key === 'main' ? 64 : 40) : num(path + '.height', r.height, 24, 160, 'Row height'),
      tone: r.tone == null ? 'theme' : choice(path + '.tone', str(r.tone), ROW_TONES, 'Row colours'),
      sticky: r.sticky == null ? false : bool(path + '.sticky', r.sticky, 'Sticky'),
    };
    AREAS.forEach(([a]) => { out[a] = list(path + '.' + a, r[a], 8, 'Elements in one area').map((e, i) => element(`${path}.${a}[${i}]`, e)).filter(Boolean); });
    return out;
  };
  if (has('headers')) {
    const seen = new Set();
    let defaults = 0;
    kit.headers = list('headers', raw.headers, KIT_LIMITS.headers, 'Headers').map((h, i) => {
      const path = `headers[${i}]`;
      if (!isObj(h)) { err(path, 'Each header must be { "id", "name", "desktop": { … }, "mobile": { … } }.'); return null; }
      const id = idOf(path + '.id', h.id, 'Each header');
      if (id && seen.has(id)) err(path + '.id', `Two headers share the id ‘${id}’.`);
      seen.add(id);
      if (h.default) defaults++;
      const dev = (k) => {
        const d0 = isObj(h[k]) ? h[k] : {};
        const d = isObj(d0.rows) ? { ...d0, ...d0.rows } : d0;   // a checked kit keeps its rows under "rows"; both read
        if (!isObj(h[k])) warn(`${path}.${k}`, `Header ${nameOf(h, id)} has no ${k === 'desktop' ? 'computer' : 'phone'} version; a plain one is used.`);
        const rows = {};
        ROWS.forEach(([r]) => { rows[r] = rowOf(`${path}.${k}.${r}`, d[r], r); });
        if (!rows.main) warn(`${path}.${k}.main`, `Header ${nameOf(h, id)} has no main row on ${k === 'desktop' ? 'a computer' : 'a phone'}.`);
        const out = { rows };
        if (k === 'mobile') {
          out.drawer = d.drawer == null ? ['search', 'menu', 'account', 'lang', 'phone'] : list(`${path}.mobile.drawer`, d.drawer, 10, 'Drawer items').map((x, j) => choice(`${path}.mobile.drawer[${j}]`, str(x), DRAWER_ITEMS, 'Drawer item'));
          out.bottomNav = d.bottomNav == null ? true : bool(`${path}.mobile.bottomNav`, d.bottomNav, 'Bottom bar');
          out.navItems = d.navItems == null ? ['home', 'cats', 'cart', 'account'] : list(`${path}.mobile.navItems`, d.navItems, 5, 'Bottom bar items').map((x, j) => choice(`${path}.mobile.navItems[${j}]`, str(x), NAV_ITEMS, 'Bottom bar item'));
        }
        return out;
      };
      const sw = Object.fromEntries(HEADER_SWITCHES.map(([k, l]) => [k, h[k] == null ? false : bool(`${path}.${k}`, h[k], l)]));
      return { id, name: text(path + '.name', h.name || id, 60, 'The name'), default: !!h.default, ...sw, desktop: dev('desktop'), mobile: dev('mobile'), ...(h.draft ? { draft: true } : {}) };
    }).filter(Boolean);
    if (kit.headers.length && defaults === 0) { kit.headers[0].default = true; warn('headers', `No header is marked "default": true; ${nameOf(kit.headers[0], 'the first')} is used.`); }
    if (defaults > 1) err('headers', 'Only one header can be the default.');
  }

  // ---- layouts ----
  const sectionOf = (path, s0, kind) => {
    if (!isObj(s0)) { err(path, 'Each section must be { "type": "hero", … }.'); return null; }
    const s = fromOldSection(s0);
    const t = sectionType(str(s.type));
    if (!t) { err(path, `“${str(s.type)}” isn’t a section. Use: main, ${SECTION_TYPES.map((x) => x.type).join(', ')}.`); return null; }
    if (t.type === 'main' && kind === 'home') { err(path, 'Home has no “main” section.'); return null; }
    const out = { type: t.type, tone: s.tone == null ? 'none' : choice(path + '.tone', str(s.tone), SECTION_TONES, 'Section colours'), hidden: s.hidden == null ? false : bool(path + '.hidden', s.hidden, 'Hidden') };
    if (s.variant != null && t.styles) out.variant = choice(path + '.variant', str(s.variant), t.styles.map((x) => [x.id, x.label]), 'Look');
    if (s.box != null) { if (isObj(s.box)) out.box = JSON.parse(JSON.stringify(s.box)); else warn(path + '.box', 'Style settings must be { … }; they are left out.'); }
    t.fields.forEach(([k, label, type, d, choices0, , sub]) => {
      const choices = type === 'list' && !(choices0 && choices0.of) ? { max: 24, of: sub || [] } : choices0;
      const v = s[k];
      const p = path + '.' + k;
      if (v == null) { out[k] = Array.isArray(d) ? d.slice() : d; return; }
      if (k === 'href') out[k] = link(p, v);
      else if (type === 'text') out[k] = text(p, v, KIT_LIMITS.text, label);
      else if (type === 'area') out[k] = text(p, v, KIT_LIMITS.area, label);
      else if (type === 'number') out[k] = num(p, v, 1, 48, label);
      else if (type === 'choice' || type === 'look') out[k] = choice(p, str(v), choices, label);
      else if (type === 'bool') out[k] = bool(p, v, label);
      else if (type === 'list') out[k] = list(p, v, choices.max, label).map((x, j) => {
        const ip = `${p}[${j}]`;
        if (!isObj(x)) { err(ip, `Each item is { ${choices.of.map((f) => '"' + f[0] + '"').join(', ')} }.`); return null; }
        const it = typeof x.id === 'string' && x.id ? { id: x.id.slice(0, 40) } : {};
        choices.of.forEach(([fk, fl, ft, fc]) => {
          const fv = x[fk];
          if (ft === 'choice') it[fk] = fv == null ? fc[0][0] : choice(`${ip}.${fk}`, str(fv), fc, fl);
          else if (ft === 'icon') it[fk] = fv == null ? LIST_ICONS[0] : choice(`${ip}.${fk}`, str(fv), LIST_ICONS, fl);
          else if (ft === 'number') it[fk] = fv == null ? 0 : num(`${ip}.${fk}`, fv, 0, 1e6, fl);
          else if (ft === 'bool') it[fk] = fv == null ? false : bool(`${ip}.${fk}`, fv, fl);
          else if (ft === 'image') it[fk] = link(`${ip}.${fk}`, fv, 'image');
          else if (ft === 'link') it[fk] = link(`${ip}.${fk}`, fv);
          else it[fk] = text(`${ip}.${fk}`, fv, ft === 'area' ? KIT_LIMITS.area : KIT_LIMITS.text, fl);
        });
        Object.keys(x).filter((kk) => kk !== 'id' && !choices.of.some((f) => f[0] === kk)).forEach((kk) => warn(`${ip}.${kk}`, `An item has no “${kk}” field; it is left out.`));
        return it;
      }).filter(Boolean);
      else if (type === 'category') { out[k] = text(p, v, 120, label); catRef(p, out[k]); }
      else if (type === 'products') out[k] = list(p, v, KIT_LIMITS.picked, label).map((x, j) => text(`${p}[${j}]`, x, 60, 'A product id'));
      else if (type === 'block') { out[k] = text(p, v, 48, label); blockRef(p, out[k], 'any'); }
      else if (type === 'image') out[k] = link(p, v, 'image');
      else if (type === 'offer') out[k] = text(p, v, 60, label);
      else if (type === 'custom') {
        out[k] = text(p, v, 48, label);
        if (out[k] && !customIds.has(out[k])) { if (ctx && Array.isArray(ctx.customs) && !ctx.customs.includes(out[k])) err(p, `Uses custom section ‘${out[k]}’, which isn’t in the file or in the shop.`); else if (!ctx) warn(p, `Uses custom section ‘${out[k]}’, which isn’t in the file: the shop must already have it.`); }
      }
      else if (type === 'values') {
        if (!isObj(v)) { err(p, 'Settings must be { "key": "value", … }.'); out[k] = {}; }
        else out[k] = Object.fromEntries(Object.entries(v).slice(0, CUSTOM_LIMITS.fields).map(([vk, vv]) => [vk, text(`${p}.${vk}`, vv == null ? '' : String(vv), KIT_LIMITS.area, 'A setting')]));
      }
      else if (type === 'slides') out[k] = list(p, v, KIT_LIMITS.slides, 'Slides').map((x, j) => {
        const sp = `${p}[${j}]`;
        if (!isObj(x)) { err(sp, 'Each slide is { "title", "text", "button", "href", "image", "tone" }.'); return null; }
        const sl = {};
        SLIDE_FIELDS.forEach(([fk, fl, ft, fc]) => {
          const fv = x[fk];
          if (ft === 'choice') sl[fk] = fv == null ? fc[0][0] : choice(`${sp}.${fk}`, str(fv), fc, fl);
          else if (ft === 'image') sl[fk] = link(`${sp}.${fk}`, fv, 'image');
          else if (fk === 'href') sl[fk] = link(`${sp}.${fk}`, fv);
          else sl[fk] = text(`${sp}.${fk}`, fv, KIT_LIMITS.text, fl);
        });
        return sl;
      }).filter(Boolean);
      else if (type === 'faq') out[k] = list(p, v, KIT_LIMITS.faq, 'Questions').map((q, j) => ({ q: text(`${p}[${j}].q`, isObj(q) ? q.q : '', KIT_LIMITS.text, 'A question'), a: text(`${p}[${j}].a`, isObj(q) ? q.a : '', KIT_LIMITS.area, 'An answer') }));
      else out[k] = v;
    });
    const allowed = new Set(['type', 'tone', 'hidden', 'id', 'variant', 'box', ...t.fields.map((f) => f[0])]);
    Object.keys(s).filter((k) => !allowed.has(k)).forEach((k) => warn(path + '.' + k, `A ${t.type} section has no “${k}” field; it is left out.`));
    if (t.type === 'products' && out.source === 'category' && !out.cat) err(path + '.cat', 'A products section showing a category needs "cat": "<category path>".');
    if (t.type === 'hero' && !(out.slides || []).length) warn(path, 'This hero has no slides and won’t show.');
    if (t.type === 'html' && !out.block) err(path + '.block', 'An HTML block section needs "block": "<block id>".');
    if (t.type === 'custom' && !out.custom) err(path + '.custom', 'A custom section needs "custom": "<custom section id>".');
    return out;
  };
  if (has('layouts')) {
    const seen = new Set();
    kit.layouts = list('layouts', raw.layouts, KIT_LIMITS.layouts, 'Layouts').map((l, i) => {
      const path = `layouts[${i}]`;
      if (!isObj(l)) { err(path, 'Each layout must be { "id", "kind", "name", "sections": [ … ] }.'); return null; }
      const id = idOf(path + '.id', l.id, 'Each layout');
      if (id && seen.has(id)) err(path + '.id', `Two layouts share the id ‘${id}’.`);
      seen.add(id);
      const kind = choice(path + '.kind', str(l.kind), KINDS.map((k) => [k.kind, k.label]), 'Page kind');
      const kd = kindBy(kind);
      const w = isObj(l.when) ? l.when : { type: 'all' };
      const when = { type: choice(path + '.when.type', str(w.type || 'all'), kd.conds.map((c) => [c, c]), `A ${kd.label.toLowerCase()} layout’s condition`) };
      if (when.type !== 'all') { when.ref = text(path + '.when.ref', w.ref, 120, 'The condition'); if (!when.ref) err(path + '.when.ref', `Say which ${when.type} this layout is for ("ref").`); if (when.type === 'category') catRef(path + '.when.ref', when.ref); }
      const header = l.header ? text(path + '.header', l.header, 48, 'The header') : '';
      if (header && has('headers') && !headerIds.has(header)) err(path + '.header', `Header ‘${header}’ isn’t in the file.`);
      else if (header && !has('headers')) warn(path + '.header', `Header ‘${header}’ isn’t in the file: the shop must already have it.`);
      let sections = list(path + '.sections', l.sections, KIT_LIMITS.sections, 'Sections').map((s, j) => sectionOf(`${path}.sections[${j}]`, s, kind)).filter(Boolean);
      const mains = sections.filter((s) => s.type === 'main').length;
      if (kind !== 'home' && mains === 0) { sections = [{ type: 'main', tone: 'none', hidden: false }, ...sections]; warn(path, `${kd.label} layout ${nameOf(l, id)} had no "main" section; it was added at the top.`); }
      if (mains > 1) err(path, `${kd.label} layout ${nameOf(l, id)} has ${mains} "main" sections; it can have one.`);
      if (kind === 'home' && !sections.length) warn(path, 'This Home layout has no sections.');
      return { id, kind, name: text(path + '.name', l.name || kd.label, 60, 'The name'), when, header, sections, ...(l.draft ? { draft: true } : {}) };
    }).filter(Boolean);
    const conds = {};
    kit.layouts.forEach((l) => { const k = l.kind + '|' + l.when.type + '|' + (l.when.ref || ''); if (conds[k]) warn('layouts', `‘${conds[k]}’ and ‘${l.name}’ are both for ${l.when.type === 'all' ? 'every ' + kindBy(l.kind).label.toLowerCase() : l.when.ref}; the first one is used.`); else conds[k] = l.name; });
  }

  // ---- menus ----
  const linkOf = (path, v) => {
    if (typeof v === 'string') return { type: 'url', url: link(path, v) };
    if (!isObj(v)) { err(path, 'A link is { "type": "category", "ref": "Phones" } or { "type": "url", "url": "/offers" }.'); return { type: 'home' }; }
    const type = choice(path + '.type', str(v.type), LINK_TYPES.map((t) => [t.type, t.label]), 'Link type');
    const out = { type };
    if (type === 'url') { out.url = link(path + '.url', v.url); if (!out.url) err(path + '.url', 'A web address link needs "url".'); }
    else if (['page', 'category', 'product'].includes(type)) {
      out.ref = text(path + '.ref', v.ref, 120, 'The link');
      if (!out.ref) err(path + '.ref', `A ${type} link needs "ref".`);
      if (type === 'category') catRef(path + '.ref', out.ref);
      if (type === 'page' && out.ref && !pageHandles.has(out.ref) && ctx && Array.isArray(ctx.pages) && !ctx.pages.some((p) => p.handle === out.ref || p.id === out.ref)) warn(path + '.ref', `The shop has no page “${out.ref}”: this link won’t open until it does.`);
      if (type === 'product' && out.ref && ctx && Array.isArray(ctx.products) && !ctx.products.includes(out.ref)) warn(path + '.ref', `The shop has no product “${out.ref}”.`);
    } else if (type === 'blog') out.ref = text(path + '.ref', v.ref || '', 60, 'The post');
    return out;
  };
  const megaOf = (path, mg) => {
    if (mg == null || mg === false) return null;
    if (!isObj(mg)) { err(path, 'A mega menu is { "on": true, "cols": [ … ] }.'); return null; }
    const out = {
      on: mg.on == null ? true : bool(path + '.on', mg.on, 'On'),
      width: mg.width == null ? 'container' : choice(path + '.width', str(mg.width), MEGA_WIDTHS, 'Width'),
      px: mg.px == null ? 960 : num(path + '.px', mg.px, 480, 1600, 'Width in px'),
      cols: list(path + '.cols', mg.cols, 5, 'Mega menu columns').map((c, j) => {
        const cp = `${path}.cols[${j}]`;
        if (!isObj(c)) { err(cp, 'A column is { "kind": "cats", "ref": "Phones" }.'); return null; }
        const kind = choice(cp + '.kind', str(c.kind), MEGA_KINDS.map((k) => [k.kind, k.label]), 'Column kind');
        const col = { kind, title: text(cp + '.title', c.title, 60, 'The title'), ref: text(cp + '.ref', c.ref, 120, 'The category'), src: link(cp + '.src', c.src, 'image'), href: link(cp + '.href', c.href), block: text(cp + '.block', c.block, 48, 'The block') };
        if (kind === 'cats') { if (!col.ref) err(cp + '.ref', 'A category list needs "ref": "<category path>".'); catRef(cp + '.ref', col.ref); }
        if (kind === 'image' && !col.src) err(cp + '.src', 'An image column needs "src".');
        if (kind === 'block') { if (!col.block) err(cp + '.block', 'A block column needs "block".'); blockRef(cp + '.block', col.block, 'any'); }
        return col;
      }).filter(Boolean),
      promo: null,
    };
    if (out.on && (out.cols.length < 2 || out.cols.length > 5)) err(path + '.cols', 'A mega menu has 2 to 5 columns.');
    return out;
  };
  const itemOf = (path, it, depth) => {
    if (!isObj(it)) { err(path, 'A menu item is { "label", "link": { … } }.'); return null; }
    const out = { label: text(path + '.label', it.label, 60, 'The label'), link: linkOf(path + '.link', it.link == null ? { type: 'home' } : it.link), children: [] };
    if (!out.label) err(path + '.label', 'A menu item needs a label.');
    if (it.children != null && !(Array.isArray(it.children) && !it.children.length)) {
      if (depth > 0) err(path + '.children', 'Menus go one level deep: an item under an item can’t have its own items.');
      else out.children = list(path + '.children', it.children, KIT_LIMITS.items, 'Items').map((c, j) => itemOf(`${path}.children[${j}]`, c, 1)).filter(Boolean);
    }
    if (it.mega != null) { if (depth > 0) err(path + '.mega', 'Only a top item can open a mega menu.'); else { const mg = megaOf(path + '.mega', it.mega); if (mg) out.mega = mg; } }
    return out;
  };
  if (has('menus')) {
    const seen = new Set();
    kit.menus = list('menus', raw.menus, KIT_LIMITS.menus, 'Menus').map((mn, i) => {
      const path = `menus[${i}]`;
      if (!isObj(mn)) { err(path, 'Each menu must be { "id", "name", "place", "items": [ … ] }.'); return null; }
      const id = idOf(path + '.id', mn.id, 'Each menu');
      if (id && seen.has(id)) err(path + '.id', `Two menus share the id ‘${id}’.`);
      seen.add(id);
      const place = choice(path + '.place', str(mn.place || 'header'), MENU_PLACES, 'Place');
      return { id, name: text(path + '.name', mn.name || id, 60, 'The name'), place, items: list(path + '.items', mn.items, KIT_LIMITS.items, 'Items').map((it, j) => itemOf(`${path}.items[${j}]`, it, 0)).filter(Boolean) };
    }).filter(Boolean);
    if (kit.menus.length && !kit.menus.some((x) => x.place === 'header')) warn('menus', 'No header menu in the file; the shop keeps its own.');
  }

  // ---- pages ----
  if (has('pages')) {
    const seen = new Set();
    kit.pages = list('pages', raw.pages, KIT_LIMITS.pages, 'Pages').map((p, i) => {
      const path = `pages[${i}]`;
      if (!isObj(p)) { err(path, 'Each page must be { "handle", "title", "content": [ … ] }.'); return null; }
      const handle = idOf(path + '.handle', p.handle, 'Each page').toLowerCase();
      if (handle && seen.has(handle)) err(path + '.handle', `Two pages share the address ‘${handle}’.`);
      seen.add(handle);
      const title = text(path + '.title', p.title, 120, 'The title');
      if (!title) err(path + '.title', 'A page needs a title.');
      const status = p.status == null ? 'published' : choice(path + '.status', str(p.status), [['published', 'Published'], ['draft', 'Draft'], ['hidden', 'Hidden']], 'Status');
      if (ctx && Array.isArray(ctx.pages) && ctx.pages.some((x) => x.handle === handle)) warn(path, `The shop already has a page at “${handle}”; importing pages replaces it.`);
      return { handle, title, status, content: contentList(path + '.content', p.content != null ? p.content : p.blocks) };
    }).filter(Boolean);
  }

  // ---- notices and placements ----
  const showOf = (path, sh) => {
    const s = isObj(sh) ? sh : {};
    if (sh != null && !isObj(sh)) err(path, 'show is { "pages": "all", "devices": "all" }.');
    const pages = s.pages == null || s.pages === 'all' ? 'all' : list(path + '.pages', s.pages, PAGE_KINDS.length, 'Pages').map((x, j) => choice(`${path}.pages[${j}]`, str(x), PAGE_KINDS, 'Page kind'));
    const out = { pages, devices: s.devices == null ? 'all' : choice(path + '.devices', str(s.devices), DEVICES, 'Devices') };
    if (s.categories != null) { out.categories = list(path + '.categories', s.categories, 20, 'Categories').map((x, j) => { const c = text(`${path}.categories[${j}]`, x, 120, 'A category'); catRef(`${path}.categories[${j}]`, c); return c; }); }
    if (s.products != null) out.products = list(path + '.products', s.products, 40, 'Products').map((x, j) => text(`${path}.products[${j}]`, x, 60, 'A product id'));
    return out;
  };
  const window2 = (path, o, out) => {
    out.start = dateOf(path + '.start', o.start, 'The start');
    out.end = dateOf(path + '.end', o.end, 'The end');
    if (out.start && out.end && Date.parse(out.end) <= Date.parse(out.start)) err(path + '.end', 'The end is before the start.');
  };
  if (has('notices')) {
    const seen = new Set();
    kit.notices = list('notices', raw.notices, KIT_LIMITS.notices, 'Store notices').map((n, i) => {
      const path = `notices[${i}]`;
      if (!isObj(n)) { err(path, 'Each notice must be { "id", "text", … }.'); return null; }
      const id = idOf(path + '.id', n.id, 'Each notice');
      if (id && seen.has(id)) err(path + '.id', `Two notices share the id ‘${id}’.`);
      seen.add(id);
      const out = {
        id, on: n.on == null ? true : bool(path + '.on', n.on, 'On'),
        text: text(path + '.text', n.text, 140, 'The notice'), textBn: text(path + '.textBn', n.textBn, 140, 'The Bangla notice'),
        from: n.from == null || n.from === '' ? '' : choice(path + '.from', str(n.from), NOTICE_SOURCES, 'Text from'),
        button: text(path + '.button', n.button, 30, 'The button'), link: link(path + '.link', n.link), code: text(path + '.code', n.code, 30, 'The coupon code'),
        countdown: n.countdown == null ? false : bool(path + '.countdown', n.countdown, 'Countdown'),
        tone: n.tone == null ? 'accent' : choice(path + '.tone', str(n.tone), NOTICE_TONES, 'Colours'),
        place: n.place == null ? 'top' : choice(path + '.place', str(n.place), NOTICE_PLACES, 'Place'),
        show: showOf(path + '.show', n.show), dismiss: n.dismiss == null ? false : bool(path + '.dismiss', n.dismiss, 'Can be closed'),
      };
      if (!out.text && !out.from) err(path + '.text', 'A notice needs its text (or "from": "offers").');
      window2(path, n, out);
      if (out.countdown && !out.end) err(path + '.countdown', 'A countdown needs an "end" time.');
      if (out.button && !out.link) warn(path + '.button', 'The button has no link; it won’t show.');
      return out;
    }).filter(Boolean);
  }
  if (has('placements')) {
    const seen = new Set();
    kit.placements = list('placements', raw.placements, KIT_LIMITS.placements, 'Block placements').map((p, i) => {
      const path = `placements[${i}]`;
      if (!isObj(p)) { err(path, 'Each placement must be { "id", "block", "spot", … }.'); return null; }
      const id = idOf(path + '.id', p.id, 'Each placement');
      if (id && seen.has(id)) err(path + '.id', `Two placements share the id ‘${id}’.`);
      seen.add(id);
      const block = text(path + '.block', p.block, 48, 'The block');
      if (!block) err(path + '.block', 'A placement needs "block".'); else blockRef(path + '.block', block, 'any');
      const out = { id, on: p.on == null ? true : bool(path + '.on', p.on, 'On'), block, spot: choice(path + '.spot', str(p.spot), SPOTS.map((s) => [s.spot, s.label]), 'Spot'), show: showOf(path + '.show', p.show), order: p.order == null ? 0 : num(path + '.order', p.order, 0, 99, 'Order') };
      window2(path, p, out);
      return out;
    }).filter(Boolean);
  }

  const counts = Object.fromEntries(KIT_PARTS.map((p) => [p.key, p.key === 'theme' ? (kit.theme ? Object.keys(kit.theme).length : 0) : (kit[p.key] || []).length]));
  return { ok: errors.length === 0, errors, warnings, kit, counts };
}

// ---- kit → the store's own shapes -----------------------------------------------------------------------------------
const withId = (p) => (x) => ({ id: genId(p), ...x });
const contentToStore = (list) => (list || []).map((b) => ({ id: genId('b'), ...clone(b) }));
const rowToStore = (r, key) => (r
  ? { on: true, height: r.height, tone: r.tone, sticky: !!r.sticky, left: r.left.map(withId('el')), center: r.center.map(withId('el')), right: r.right.map(withId('el')) }
  : { on: false, height: key === 'main' ? 64 : 40, tone: 'theme', sticky: false, left: [], center: [], right: [] });
const devToStore = (d, mobile) => {
  const rows = {};
  ROWS.forEach(([k]) => { rows[k] = rowToStore(d.rows[k], k); });
  return mobile ? { rows, drawer: d.drawer.slice(), bottomNav: d.bottomNav, navItems: d.navItems.slice() } : { rows };
};
const doc = (value, live, now) => ({ draft: clone(value), live: live ? clone(value) : null, draftAt: now, liveAt: live ? now : 0 });
const itemToStore = (it) => ({ id: genId('mi'), label: it.label, link: clone(it.link), children: (it.children || []).map(itemToStore), ...(it.mega ? { mega: { ...clone(it.mega), cols: it.mega.cols.map((c) => ({ id: genId('col'), ...c })) } } : {}) });

/** A checked kit in the store's own shapes. Page links (ref = address) are turned into page ids by the caller. */
export function kitToStore(kit, { now = Date.now() } = {}) {
  const out = { meta: clone(kit.meta || {}) };
  if (kit.theme) out.theme = { ...DEFAULTS, ...clone(kit.theme) };
  if (kit.headers) {
    out.headers = kit.headers.map((h) => ({ id: h.id, name: h.name, doc: doc({ ...Object.fromEntries(HEADER_SWITCHES.map(([k]) => [k, !!h[k]])), desktop: devToStore(h.desktop, false), mobile: devToStore(h.mobile, true) }, !h.draft, now), updatedAt: now }));
    out.defaultHeader = (kit.headers.find((h) => h.default) || kit.headers[0] || {}).id || '';
  }
  if (kit.layouts) out.layouts = kit.layouts.map((l) => ({ id: l.id, name: l.name, kind: l.kind, doc: doc({ sections: l.sections.map((s) => ({ id: genId('sec'), ...clone(s) })), cond: clone(l.when), header: l.header || '' }, !l.draft, now), updatedAt: now }));
  if (kit.blocks) out.blocks = kit.blocks.map((b) => ({ id: b.id, name: b.name, type: b.type, blocks: contentToStore(b.content), updatedAt: now }));
  if (kit.menus) out.menus = kit.menus.map((m) => ({ id: m.id, name: m.name, place: m.place, fixed: m.id === 'main' || m.id === 'footer', items: m.items.map(itemToStore) }));
  if (kit.pages) out.pages = kit.pages.map((p) => ({ handle: p.handle, title: p.title, status: p.status, blocks: contentToStore(p.content) }));
  if (kit.notices) out.notices = clone(kit.notices);
  if (kit.placements) out.placements = clone(kit.placements);
  if (kit.customs) out.customs = kit.customs.map((c) => ({ ...clone(c), updatedAt: now, by: (kit.meta && kit.meta.author) || '' }));
  return out;
}

// ---- the store → a kit (export) ---------------------------------------------------------------------------------------
const strip = (x) => { const { id, ...rest } = x; return rest; };   // eslint-disable-line no-unused-vars
const elToKit = (e) => {
  const def = elementBy(e.type);
  if (!def) return null;
  const changed = def.settings.filter(([k, , , d]) => e[k] !== undefined && JSON.stringify(e[k]) !== JSON.stringify(d));
  return changed.length ? { type: e.type, ...Object.fromEntries(changed.map(([k]) => [k, e[k]])) } : e.type;
};
const rowToKit = (r) => (r && r.on ? { height: r.height, tone: r.tone, sticky: !!r.sticky, left: (r.left || []).map(elToKit).filter(Boolean), center: (r.center || []).map(elToKit).filter(Boolean), right: (r.right || []).map(elToKit).filter(Boolean) } : null);
const devToKit = (d, mobile) => {
  const out = {};
  ROWS.forEach(([k]) => { out[k] = rowToKit(((d || {}).rows || {})[k]); });
  if (mobile) { out.drawer = (d && d.drawer) || []; out.bottomNav = d ? d.bottomNav !== false : true; out.navItems = (d && d.navItems) || []; }
  return out;
};
const sectionToKit = (s) => {
  const t = sectionType(s.type);
  const out = { type: s.type };
  if (s.tone && s.tone !== 'none') out.tone = s.tone;
  if (s.hidden) out.hidden = true;
  if (s.variant) out.variant = s.variant;
  if (s.box && Object.keys(s.box).length) out.box = clone(s.box);
  (t ? t.fields : []).forEach(([k, , , d]) => { if (s[k] !== undefined && JSON.stringify(s[k]) !== JSON.stringify(d)) out[k] = k === 'slides' ? s[k].map(strip) : clone(s[k]); });
  return out;
};
const pickPublished = (dc) => (dc && dc.live ? { value: dc.live, draft: false } : { value: dc ? dc.draft : null, draft: true });

/**
 * The store's design as a kit. data = the storefront store (store.js read()), menus = getMenus(), pages = getPages().
 * parts: which parts to include (default every part but pages). Page links point at page addresses.
 */
export function storeToKit({ data, menus = [], pages = [], meta = {}, parts = null }) {
  const want = parts || { theme: true, headers: true, layouts: true, blocks: true, menus: true, pages: false, notices: true, placements: true, customs: true };
  const kit = { gcstore: KIT_VERSION, meta: { id: meta.id || '', name: meta.name || 'My store design', description: meta.description || '', for: meta.for || '', version: meta.version || '1.0', author: meta.author || '', made: meta.made || '' } };
  if (want.theme && data.theme) {
    const v = pickPublished(data.theme).value || {};
    kit.theme = Object.fromEntries(OPTIONS.filter((o) => v[o.key] !== undefined && JSON.stringify(v[o.key]) !== JSON.stringify(o.default)).map((o) => [o.key, v[o.key]]));
    if (v.words && Object.keys(v.words).length) kit.theme.words = clone(v.words);   // the store's own words (words.js)
  }
  if (want.headers) kit.headers = (data.headers || []).map((h) => {
    const { value, draft } = pickPublished(h.doc);
    const sw = Object.fromEntries(HEADER_SWITCHES.filter(([k]) => value && value[k]).map(([k]) => [k, true]));
    return { id: h.id, name: h.name, ...(h.id === data.defaultHeader ? { default: true } : {}), ...sw, desktop: devToKit(value && value.desktop, false), mobile: devToKit(value && value.mobile, true), ...(draft ? { draft: true } : {}) };
  });
  if (want.layouts) kit.layouts = (data.layouts || []).map((l) => {
    const { value, draft } = pickPublished(l.doc);
    const L = value || { sections: [], cond: { type: 'all' } };
    return { id: l.id, kind: l.kind, name: l.name, when: clone(L.cond || { type: 'all' }), ...(L.header ? { header: L.header } : {}), sections: (L.sections || []).map(sectionToKit), ...(draft ? { draft: true } : {}) };
  });
  if (want.blocks) kit.blocks = (data.blocks || []).map((b) => ({ id: b.id, name: b.name, type: b.type || 'content', content: (b.blocks || []).map(strip) }));
  const handleOf = (ref) => { const p = pages.find((x) => x.id === ref || x.handle === ref); return p ? p.handle : ref; };
  const itemToKit = (it) => {
    const link = clone(it.link || { type: 'home' });
    if (link.type === 'page') link.ref = handleOf(link.ref);
    const out = { label: it.label, link };
    if ((it.children || []).length) out.children = it.children.map(itemToKit);
    if (it.mega && it.mega.on) out.mega = { on: true, width: it.mega.width, px: it.mega.px, cols: (it.mega.cols || []).map((c) => { const { id, ...rest } = c; return Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== '' && v != null)); }) }; // eslint-disable-line no-unused-vars
    return out;
  };
  if (want.menus) kit.menus = (menus || []).map((m) => ({ id: m.id, name: m.name, place: m.place, items: (m.items || []).map(itemToKit) }));
  if (want.pages) kit.pages = (pages || []).filter((p) => p.status === 'published').map((p) => ({ handle: p.handle, title: p.title, status: 'published', content: (p.blocks || []).map(strip) }));
  if (want.notices && data.notices && data.notices.length) kit.notices = clone(data.notices);
  if (want.placements && data.placements && data.placements.length) kit.placements = clone(data.placements);
  if (want.customs && data.customs && data.customs.length) kit.customs = data.customs.map((c) => ({ id: c.id, name: c.name, html: c.html, css: c.css || '', fields: clone(c.fields || []) }));
  return kit;
}

/** Short counts for a kit card: "4 headers · 9 layouts · 7 blocks". */
export function kitSummary(kit) {
  if (!kit) return '';
  const n = (k, one, many) => { const c = k === 'theme' ? (kit.theme ? 1 : 0) : (kit[k] || []).length; return c ? (k === 'theme' ? 'theme settings' : `${c} ${c === 1 ? one : many}`) : ''; };
  return [n('theme'), n('headers', 'header', 'headers'), n('layouts', 'layout', 'layouts'), n('blocks', 'block', 'blocks'), n('menus', 'menu', 'menus'), n('pages', 'page', 'pages'), n('notices', 'notice', 'notices'), n('placements', 'placement', 'placements'), n('customs', 'custom section', 'custom sections')].filter(Boolean).join(' · ');
}
