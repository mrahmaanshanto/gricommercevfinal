// storefront/headers — the header builder (Online Store › Header builder, A2). A shop keeps several saved headers; one
// is the default and a layout can pick another. Desktop and phone are built separately: 3 rows (top bar · main ·
// bottom) × 3 areas (left · centre · right), each row with its height, colours and "sticky". The phone also has its
// drawer (what the ☰ menu holds) and the bottom navigation bar (Home · Categories · Cart · Account).
//
//   header  { id, name, doc: { draft: H, live: H }, updatedAt }       H = { desktop: Device, mobile: Device & { drawer, bottomNav } }
//   Device  { rows: { top: Row, main: Row, bottom: Row } }
//   Row     { on, height (px), tone 'theme'|'light'|'dark'|'brand'|'accent', sticky, left: [El], center: [El], right: [El] }
//   El      { id, type, ...settings }   ELEMENTS lists the types and their settings
//
//   ELEMENTS · elementBy(type) · ROWS · AREAS · ROW_TONES · DRAWER_ITEMS · NAV_ITEMS · newElement(type)
//   getHeaders() · getHeader(id) · defaultHeaderId() · headerFor(id) → H (live; draft / editor copy with ?preview=1)
//   saveHeaderDraft(id, H, name) · publishHeader(id) · discardHeader(id) · addHeader(name, fromId) · duplicateHeader(id)
//   deleteHeader(id) (not the default) · setDefaultHeader(id) · headerUses(id) (layouts that pick it)
//   blankHeader() · headerFromSpec(spec) — presets build their headers with it

import { read, update, newDoc, publishDoc, discardDoc, pickDoc, sfId, makeRestorePoint, isPreview } from './store';

export const ROWS = [['top', 'Top bar'], ['main', 'Main row'], ['bottom', 'Bottom row']];
export const AREAS = [['left', 'Left'], ['center', 'Centre'], ['right', 'Right']];
export const ROW_TONES = [['theme', 'Header colours'], ['light', 'Light'], ['dark', 'Dark'], ['brand', 'Primary colour'], ['accent', 'Accent colour']];

// settings: [key, label, type, default, choices?]
export const ELEMENTS = [
  { type: 'logo', label: 'Logo', icon: 'store', lock: 'logo', settings: [['size', 'Size', 'choice', 'M', [['S', 'Small'], ['M', 'Medium'], ['L', 'Large']]], ['name', 'Show the shop name', 'bool', true]] },   // a logo picture (Customize › Brand) replaces the mark and name
  { type: 'menu', label: 'Main menu', icon: 'menu', settings: [['menu', 'Menu', 'menu', 'main'], ['weight', 'Links', 'choice', 'normal', [['normal', 'Normal'], ['bold', 'Bold']]], ['look', 'Look', 'choice', 'plain', [['plain', 'Plain'], ['caps', 'Capitals'], ['chips', 'Chips'], ['divided', 'With dividers']]], ['pills', 'Last items as colour pills', 'number', 0]] },
  { type: 'catmenu', label: 'All categories', icon: 'list-tree', settings: [['label', 'Button text', 'text', 'All categories']] },
  { type: 'search', label: 'Search', icon: 'search', settings: [['cats', 'Category picker', 'bool', true], ['size', 'Width', 'choice', 'L', [['S', 'Narrow'], ['M', 'Medium'], ['L', 'Wide']]], ['placeholder', 'Hint text', 'text', 'Search phones, chargers…'], ['look', 'Look', 'choice', 'box', [['box', 'Box'], ['soft', 'Soft grey'], ['pill', 'Rounded, coloured edge'], ['button', 'With a coloured button']]]] },
  { type: 'cart', label: 'Cart', icon: 'shopping-cart', settings: [['total', 'Show the total', 'bool', false], ['label', 'Label', 'choice', 'none', [['none', 'Icon only'], ['beside', 'Beside the icon'], ['below', 'Below the icon'], ['two', 'Two lines']]]] },
  { type: 'account', label: 'Account', icon: 'user', settings: [['label', 'Label', 'choice', 'none', [['none', 'Icon only'], ['beside', 'Beside the icon'], ['below', 'Below the icon'], ['two', 'Two lines']]], ['sub', 'Second line', 'text', '']] },
  { type: 'wishlist', label: 'Wishlist', icon: 'heart', settings: [['label', 'Label', 'choice', 'none', [['none', 'Icon only'], ['beside', 'Beside the icon'], ['below', 'Below the icon'], ['two', 'Two lines']]], ['sub', 'Second line', 'text', '']] },
  { type: 'compare', label: 'Compare', icon: 'git-compare', settings: [['label', 'Label', 'choice', 'none', [['none', 'Icon only'], ['beside', 'Beside the icon'], ['below', 'Below the icon'], ['two', 'Two lines']]], ['sub', 'Second line', 'text', '']] },
  { type: 'lang', label: 'Language EN / বাং', icon: 'languages', settings: [] },
  { type: 'phone', label: 'Hotline', icon: 'phone', settings: [['label', 'Label', 'text', 'Hotline'], ['number', 'Number', 'text', '']] },
  { type: 'whatsapp', label: 'WhatsApp button', icon: 'message-circle', settings: [['label', 'Label', 'text', 'WhatsApp'], ['number', 'Number', 'text', '']] },
  { type: 'button', label: 'Button', icon: 'mouse-pointer-click', settings: [['label', 'Text', 'text', 'Track order'], ['href', 'Link', 'text', '/offers'], ['style', 'Style', 'choice', 'solid', [['solid', 'Solid'], ['outline', 'Outline'], ['gradient', 'Glowing pill'], ['pill', 'Pill']]], ['icon', 'Icon', 'icon', '']] },
  { type: 'iconlink', label: 'Icon link', icon: 'link', settings: [['icon', 'Icon', 'icon', 'truck'], ['label', 'Text', 'text', 'Track order'], ['sub', 'Second line', 'text', ''], ['href', 'Link', 'text', '/track'], ['look', 'Label', 'choice', 'below', [['beside', 'Beside the icon'], ['below', 'Below the icon'], ['two', 'Two lines']]]] },
  { type: 'html', label: 'HTML block', icon: 'blocks', settings: [['block', 'Block', 'block', '']] },
  { type: 'social', label: 'Social icons', icon: 'share-2', settings: [['facebook', 'Facebook page', 'text', 'https://facebook.com/dazzleshopbd'], ['instagram', 'Instagram', 'text', 'https://instagram.com/dazzleshopbd'], ['youtube', 'YouTube', 'text', '']] },
  { type: 'text', label: 'Short text', icon: 'text', settings: [['text', 'Text', 'text', 'Official warranty on every phone']] },
  { type: 'divider', label: 'Divider or space', icon: 'separator-vertical', settings: [['kind', 'Kind', 'choice', 'line', [['line', 'Line'], ['space', 'Space']]]] },
];
export const elementBy = (type) => ELEMENTS.find((e) => e.type === type) || null;
export function newElement(type) {
  const e = elementBy(type);
  const out = { id: sfId('el'), type };
  (e ? e.settings : []).forEach(([k, , , d]) => { out[k] = d; });
  return out;
}

export const DRAWER_ITEMS = [['search', 'Search'], ['menu', 'Main menu'], ['catmenu', 'All categories'], ['account', 'Account'], ['lang', 'Language'], ['phone', 'Hotline'], ['social', 'Social icons']];
export const NAV_ITEMS = [['home', 'Home', 'house'], ['cats', 'Categories', 'layout-grid'], ['search', 'Search', 'search'], ['cart', 'Cart', 'shopping-cart'], ['account', 'Account', 'user'], ['wishlist', 'Wishlist', 'heart']];

const row = (on, height, tone, sticky, left = [], center = [], right = []) => ({ on, height, tone, sticky, left, center, right });
const els = (list) => (list || []).map((x) => (typeof x === 'string' ? newElement(x) : { ...newElement(x[0]), ...x[1] }));
export function blankHeader() {
  return {
    desktop: { rows: { top: row(false, 36, 'dark', false), main: row(true, 72, 'theme', true, els(['logo']), els(['menu']), els(['search', 'cart'])), bottom: row(false, 48, 'theme', false) } },
    mobile: { rows: { top: row(false, 32, 'dark', false), main: row(true, 56, 'theme', true, els(['logo']), [], els(['search', 'cart'])), bottom: row(false, 44, 'theme', false) },
      drawer: ['search', 'menu', 'account', 'lang', 'phone'], bottomNav: true, navItems: ['home', 'cats', 'cart', 'account'] },
  };
}
/** spec: { desktop: { top|main|bottom: [height, tone, sticky, left[], center[], right[]] | null }, mobile: { …, drawer, bottomNav, navItems } } */
export function headerFromSpec(spec) {
  const dev = (s) => {
    const rows = {};
    ROWS.forEach(([k]) => {
      const r = s && s[k];
      rows[k] = r ? row(true, r[0], r[1], !!r[2], els(r[3]), els(r[4]), els(r[5])) : row(false, k === 'main' ? 64 : 40, 'theme', false);
    });
    return { rows };
  };
  const m = spec.mobile || {};
  return { desktop: dev(spec.desktop), mobile: { ...dev(m), drawer: m.drawer || ['search', 'menu', 'account', 'lang', 'phone'], bottomNav: m.bottomNav !== false, navItems: m.navItems || ['home', 'cats', 'cart', 'account'] } };
}

// ---- reading ------------------------------------------------------------------------------------------------------
export const getHeaders = () => read().headers || [];
export const getHeader = (id) => getHeaders().find((h) => h.id === id) || null;
export const defaultHeaderId = () => { const d = read(); return (d.headers || []).some((h) => h.id === d.defaultHeader) ? d.defaultHeader : ((d.headers || [])[0] || {}).id || ''; };
/** The header a page draws: the named one (a layout's pick) or the default; live for customers, draft in preview. */
export function headerFor(id) {
  // the header builder's preview frame asks for the header being edited (?preview=1&header=<id>)
  let want = id;
  if (isPreview()) { try { want = new URLSearchParams(window.location.search).get('header') || id; } catch { want = id; } }
  const h = getHeader(want) || getHeader(defaultHeaderId());
  if (!h) return { id: '', header: blankHeader() };
  return { id: h.id, header: pickDoc(h.doc, 'header:' + h.id) || h.doc.live || h.doc.draft };
}
/** Layouts that use this header instead of the default: [names]. */
export const headerUses = (id) => (read().layouts || []).filter((l) => l.header === id).map((l) => l.name);

// ---- changing -----------------------------------------------------------------------------------------------------
export function saveHeaderDraft(id, H, name) {
  update((d, now) => { d.headers = d.headers.map((h) => (h.id === id ? { ...h, name: name != null ? String(name).trim() || h.name : h.name, doc: { ...h.doc, draft: H, draftAt: now }, updatedAt: now } : h)); });
}
export function publishHeader(id, H, name) {
  makeRestorePoint('Before publishing a header', { kind: 'publish' });
  update((d, now) => { d.headers = d.headers.map((h) => (h.id === id ? { ...h, name: name != null ? String(name).trim() || h.name : h.name, doc: publishDoc({ ...h.doc, draft: H || h.doc.draft }, now), updatedAt: now } : h)); });
}
export function discardHeader(id) { update((d, now) => { d.headers = d.headers.map((h) => (h.id === id ? { ...h, doc: discardDoc(h.doc, now) } : h)); }); }
export function addHeader(name, fromId) {
  const src = fromId ? getHeader(fromId) : null;
  const H = src ? JSON.parse(JSON.stringify(src.doc.draft)) : blankHeader();
  const h = { id: sfId('hdr'), name: String(name || '').trim() || 'New header', doc: newDoc(H, false), updatedAt: Date.now() };
  update((d) => { d.headers = [...(d.headers || []), h]; });
  return h;
}
export const duplicateHeader = (id) => { const h = getHeader(id); return h ? addHeader('Copy of ' + h.name, id) : null; };
/** Delete a header that is not the default; layouts that used it fall back to the default. */
export function deleteHeader(id) {
  if (id === defaultHeaderId()) return false;
  update((d) => { d.headers = d.headers.filter((h) => h.id !== id); d.layouts = (d.layouts || []).map((l) => (l.header === id ? { ...l, header: '' } : l)); });
  return true;
}
export function setDefaultHeader(id) { update((d) => { if (d.headers.some((h) => h.id === id)) d.defaultHeader = id; }); }
/** Every element in a header (both devices), for "used in" and checks. */
export function elementsOf(H) {
  const out = [];
  ['desktop', 'mobile'].forEach((dv) => ROWS.forEach(([r]) => AREAS.forEach(([a]) => ((((H || {})[dv] || {}).rows || {})[r] || {})[a] && H[dv].rows[r][a].forEach((e) => out.push({ ...e, device: dv, row: r, area: a })))));
  return out;
}
