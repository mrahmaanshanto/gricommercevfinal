// storefront/layouts — page layouts (Online Store › Layouts, A4): Home, Product page, Category page, Page, Cart, Search
// and Page not found, each built from sections. A layout has conditions (all pages of its kind, one category, one
// product or one page) and can pick its own header. Draft → preview → publish, undo to last published.
//
//   layout   { id, name, kind, doc: { draft: L, live: L | null }, updatedAt }   L = { sections: [Section], cond, header }
//   Section  { id, type, hidden, title, tone, ...settings }   cond { type: 'all'|'category'|'product'|'page', ref }
//   KINDS · kindBy(kind) · SECTION_TYPES (the addable kinds; `styles` = the looks a kind comes in, each with a `sketch`
//   for its thumbnail) · sectionType(type) · variantOf(s) · styleOf(s) · newSection(type, patch) · CONDS
//   Section also keeps `variant` (its style) and `box` (Style / Advanced tabs: storefront/styles.js).
//   getLayouts() · getLayout(id) · saveLayoutDraft(id, L, name) · publishLayout(id, L) · discardLayout(id)
//   addLayout(kind, name) · duplicateLayout(id) · deleteLayout(id)
//   layoutFor(kind, ctx) → { id, name, sections, header } — the layout a customer page draws (most specific condition
//   first: product › category › page › all; live for customers, draft with ?preview=1), else the built-in default
//   condText(cond) · condProblem(kind, cond)
// Every kind except Home has a "main" section (the product, the category's products, the page, the cart …): it can
// move but not be removed or hidden.

import { read, update, newDoc, publishDoc, discardDoc, pickDoc, sfId, makeRestorePoint, isPreview } from './store';

// The kinds, section types and their looks live in schema.js (shared with the store kit and its checker).
import { KINDS, kindBy, CONDS, TONES, CARD_STYLES, SECTION_TYPES, PRODUCT_LOOKS, LIB_GROUPS, ICONS, groupOf, MAIN, sectionType, fromOldSection } from './schema.js';
export { KINDS, kindBy, CONDS, TONES, CARD_STYLES, SECTION_TYPES, PRODUCT_LOOKS, LIB_GROUPS, ICONS, groupOf, MAIN, sectionType, fromOldSection };
/** The style (look) a section uses: its own, the old Category tiles "style" field, or the type's first. */
export function variantOf(s) {
  const t = s && sectionType(s.type);
  if (!t || !t.styles) return '';
  const want = s.variant || (s.look != null ? fromOldSection(s).variant : '') || (s.type === 'cattiles' ? s.style : '');
  return t.styles.some((x) => x.id === want) ? want : t.styles[0].id;
}
export const styleOf = (s) => { const t = s && sectionType(s.type); const v = variantOf(s); return (t && t.styles && t.styles.find((x) => x.id === v)) || null; };
export function newSection(type, patch = {}) {
  const t = sectionType(type);
  const out = { id: sfId('sec'), type, hidden: false, tone: 'none' };
  if (t && t.styles) out.variant = t.styles[0].id;
  (t ? t.fields : []).forEach(([k, , , d]) => { out[k] = Array.isArray(d) ? d.slice() : d; });
  return { ...out, ...patch };
}
export const slide = (title, text, button, href, image = '', tone = 'primary') => ({ id: sfId('sl'), title, text, button, href, image, tone });

// ---- built-in defaults (a store with no layout of a kind) -----------------------------------------------------------
export function defaultSections(kind) {
  const S = newSection;
  switch (kind) {
    case 'home': return [S('hero', { slides: [slide('New phones, official warranty', 'Cash on delivery all over Bangladesh.', 'Shop phones', '/category?handle=phones')] }), S('cattiles'), S('products'), S('trust')];
    case 'product': return [S('main'), S('products', { title: 'You may also like', source: 'related', count: 4 })];
    case 'category': return [S('main')];
    case 'page': return [S('main')];
    case 'cart': return [S('main'), S('products', { title: 'Add to your order', source: 'best', count: 4 })];
    case 'search': return [S('main')];
    case '404': return [S('main'), S('products', { title: 'Popular right now', source: 'best', count: 4 })];
    default: return [S('main')];
  }
}

// ---- reading --------------------------------------------------------------------------------------------------------
export const getLayouts = () => read().layouts || [];
export const getLayout = (id) => getLayouts().find((l) => l.id === id) || null;

const under = (path, cat) => !!path && !!cat && (cat === path || String(cat).indexOf(path + ' › ') === 0);
function matchScore(cond, ctx) {
  const c = cond || { type: 'all' };
  if (c.type === 'all') return 1;
  if (c.type === 'product') return ctx.product && ctx.product.id === c.ref ? 4 : 0;
  if (c.type === 'category') {
    if (ctx.product) return under(c.ref, ctx.product.cat) ? 3 : 0;
    if (ctx.category) return under(c.ref, ctx.category.path) ? (ctx.category.path === c.ref ? 3 : 2) : 0;
    return 0;
  }
  if (c.type === 'page') return ctx.page && ctx.page.id === c.ref ? 4 : 0;
  return 0;
}
/** The layout a customer page draws. ctx: { product, category, page }. */
export function layoutFor(kind, ctx = {}) {
  // the layout editor's preview frame shows the layout being edited (?preview=1&layout=<id>), whatever its condition
  if (isPreview()) {
    let want = '';
    try { want = new URLSearchParams(window.location.search).get('layout') || ''; } catch { want = ''; }
    const l = want ? getLayout(want) : null;
    if (l && l.kind === kind) { const L = pickDoc(l.doc, 'layout:' + l.id) || l.doc.draft; return { id: l.id, name: l.name, sections: (L.sections || []).filter((s) => !s.hidden), header: L.header || '' }; }
  }
  let best = null;
  getLayouts().filter((l) => l.kind === kind).forEach((l) => {
    const L = pickDoc(l.doc, 'layout:' + l.id);
    if (!L) return;   // never published: customers don't see it yet
    const sc = matchScore(L.cond, ctx);
    if (sc && (!best || sc > best.sc)) best = { sc, l, L };
  });
  if (!best) return { id: '', name: 'Default', sections: defaultSections(kind), header: '' };
  return { id: best.l.id, name: best.l.name, sections: (best.L.sections || []).filter((s) => !s.hidden), header: best.L.header || '' };
}
export const layoutPreviewing = () => isPreview();

export function condText(cond, names = {}) {
  const c = cond || { type: 'all' };
  if (c.type === 'all') return 'All';
  const n = names[c.ref] || c.ref || '…';
  return c.type === 'category' ? 'Category: ' + n : c.type === 'product' ? 'Product: ' + n : 'Page: ' + n;
}
export function condProblem(kind, cond) {
  const c = cond || { type: 'all' };
  if (!kindBy(kind).conds.includes(c.type)) return 'This condition does not fit this kind of page.';
  if (c.type !== 'all' && !c.ref) return 'Choose which ' + c.type + '.';
  return '';
}

// ---- changing -------------------------------------------------------------------------------------------------------
const clean = (L) => ({ sections: (L.sections || []).map((s) => ({ ...s })), cond: L.cond || { type: 'all' }, header: L.header || '' });
export function saveLayoutDraft(id, L, name) {
  update((d, now) => { d.layouts = d.layouts.map((l) => (l.id === id ? { ...l, name: name != null ? String(name).trim() || l.name : l.name, doc: { ...l.doc, draft: clean(L), draftAt: now }, updatedAt: now } : l)); });
}
export function publishLayout(id, L, name) {
  makeRestorePoint('Before publishing a layout', { kind: 'publish' });
  update((d, now) => { d.layouts = d.layouts.map((l) => (l.id === id ? { ...l, name: name != null ? String(name).trim() || l.name : l.name, doc: publishDoc({ ...l.doc, draft: clean(L || l.doc.draft) }, now), updatedAt: now } : l)); });
}
export function discardLayout(id) { update((d, now) => { d.layouts = d.layouts.map((l) => (l.id === id ? { ...l, doc: discardDoc(l.doc, now) } : l)); }); }
export function addLayout(kind, name) {
  const l = { id: sfId('lay'), name: String(name || '').trim() || kindBy(kind).label, kind, doc: newDoc({ sections: defaultSections(kind), cond: { type: 'all' }, header: '' }, false), updatedAt: Date.now() };
  update((d) => { d.layouts = [...(d.layouts || []), l]; });
  return l;
}
export function duplicateLayout(id) {
  const src = getLayout(id);
  if (!src) return null;
  const L = JSON.parse(JSON.stringify(src.doc.draft));
  L.sections = L.sections.map((s) => ({ ...s, id: sfId('sec') }));
  const l = { id: sfId('lay'), name: 'Copy of ' + src.name, kind: src.kind, doc: newDoc(L, false), updatedAt: Date.now() };
  update((d) => { d.layouts = [...(d.layouts || []), l]; });
  return l;
}
export function deleteLayout(id) { update((d) => { d.layouts = (d.layouts || []).filter((l) => l.id !== id); }); }
/** Make a layout from a preset spec: { kind, name, sections, cond?, header? } (published). */
export function layoutFromSpec(spec, now = Date.now()) {
  return { id: spec.id || sfId('lay'), name: spec.name || kindBy(spec.kind).label, kind: spec.kind, doc: newDoc({ sections: spec.sections, cond: spec.cond || { type: 'all' }, header: spec.header || '' }, true, now), updatedAt: now };
}
