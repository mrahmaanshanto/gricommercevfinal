// storefront/customs — custom sections (Online Store › HTML blocks › Custom sections; Batch A step 6): the shop's own
// HTML and CSS with named settings, added to any layout like a built-in section. The code is allow-listed and scoped
// (customCode.js), so it can't run scripts or restyle the rest of the store.
//
//   custom  { id, name, html, css, fields: [{ key, label, type, default }], updatedAt, by }
//   getCustoms() · getCustom(id) · newCustom() · saveCustom(def, by) · duplicateCustom(id) · deleteCustom(id)
//   customUsedIn(id) → [{ where, href }]   the layouts that show it
//   codeLock() → '' when this shop may write code, else why not (Business plan, and the theme's "code" switch)
// Who writes code: shops on the Business plan, and GridCommerce's designers (their design files and library themes
// bring custom sections to any shop; the shop then only fills in the settings).

import { read, update, sfId } from './store';
import { lockOf } from './access';
import { customProblem } from './customCode.js';

export const getCustoms = () => (read().customs || []).slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
export const getCustom = (id) => (read().customs || []).find((c) => c.id === id) || null;
export const codeLock = () => lockOf({ lock: 'code', plan: 'business' });

export const newCustom = () => ({
  id: sfId('cs'), name: '',
  html: '<div class="promo">\n  <h2>{{title}}</h2>\n  <p>{{text}}</p>\n  <a class="btn" href="{{link}}">{{button}}</a>\n</div>',
  css: '.promo{padding:40px 24px;border-radius:16px;background:{{bg}};text-align:center}\n.promo h2{margin:0 0 8px}\n.btn{display:inline-block;margin-top:12px;padding:10px 20px;border-radius:999px;background:#111;color:#fff;text-decoration:none}',
  fields: [
    { key: 'title', label: 'Title', type: 'text', default: 'Your headline' },
    { key: 'text', label: 'Text', type: 'area', default: 'One short line about it.' },
    { key: 'button', label: 'Button', type: 'text', default: 'Shop now' },
    { key: 'link', label: 'Button link', type: 'link', default: '/offers' },
    { key: 'bg', label: 'Background', type: 'color', default: '#f1f5f9' },
  ],
  updatedAt: 0,
});

/** Insert or replace. Returns { ok, error, custom }. Needs code rights (codeLock). */
export function saveCustom(def, by = '') {
  const lock = codeLock();
  if (lock) return { ok: false, error: lock };
  const p = customProblem(def);
  if (p) return { ok: false, error: p };
  const saved = { ...def, name: String(def.name).trim(), updatedAt: Date.now(), by };
  update((d) => {
    const list = d.customs || [];
    const i = list.findIndex((x) => x.id === def.id);
    if (i >= 0) list[i] = saved; else list.unshift(saved);
    d.customs = list;
  });
  return { ok: true, custom: saved };
}
export function duplicateCustom(id) {
  const src = getCustom(id);
  if (!src) return { ok: false, error: 'This section is gone.' };
  return saveCustom({ ...JSON.parse(JSON.stringify(src)), id: sfId('cs'), name: 'Copy of ' + src.name });
}
/** Delete; layouts that used it simply show nothing there until another is picked. */
export function deleteCustom(id) {
  update((d) => { d.customs = (d.customs || []).filter((c) => c.id !== id); });
}
/** The layouts (draft or published) with a section that uses it. */
export function customUsedIn(id) {
  const d = read();
  return (d.layouts || []).filter((l) => [l.doc && l.doc.draft, l.doc && l.doc.live].some((L) => L && (L.sections || []).some((s) => s.type === 'custom' && s.custom === id)))
    .map((l) => ({ where: `Layout · ${l.name}`, href: '/layout-edit?id=' + encodeURIComponent(l.id) }));
}
