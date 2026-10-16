// storefront/show — who sees a store notice or a block placement (pure; kit.js checks the same shape).
//   show { pages: 'all' | [kind], categories: [path], products: [id], devices: 'all' | 'desktop' | 'mobile' }
//   showMatches(show, ctx) — ctx { kind, product, category } (product id, category path of the page or the product)
//   inWindow(x, now) — x.start / x.end (dates) hold at `now`
//   deviceClass(devices) — the CSS class that hides it on the other device ('sf-only-desktop' | 'sf-only-mobile' | '')
//   showText(show) — "Every page · phones only"

import { PAGE_KINDS, DEVICES } from './schema.js';

const under = (path, cat) => !!path && !!cat && (cat === path || String(cat).indexOf(path + ' › ') === 0);

export function showMatches(show, ctx = {}) {
  const s = show || {};
  const pages = s.pages == null || s.pages === 'all' ? 'all' : s.pages;
  if (pages !== 'all' && !(pages || []).includes(ctx.kind)) return false;
  const cats = s.categories || [];
  const prods = s.products || [];
  if (!cats.length && !prods.length) return true;
  if (prods.length && ctx.product && prods.includes(ctx.product)) return true;
  if (cats.length && ctx.category && cats.some((c) => under(c, ctx.category))) return true;
  return false;
}

export function inWindow(x, now = Date.now()) {
  const a = x && x.start ? Date.parse(x.start) : NaN;
  const b = x && x.end ? Date.parse(x.end) : NaN;
  if (Number.isFinite(a) && now < a) return false;
  if (Number.isFinite(b) && now >= b) return false;
  return true;
}

export const deviceClass = (d) => (d === 'desktop' ? 'sf-only-desktop' : d === 'mobile' ? 'sf-only-mobile' : '');

export function showText(show) {
  const s = show || {};
  const pages = s.pages == null || s.pages === 'all' ? 'Every page' : (s.pages || []).map((k) => ((PAGE_KINDS.find((x) => x[0] === k) || [k, k])[1])).join(', ') || 'No page';
  const extra = [...(s.categories || []), ...((s.products || []).length ? [`${s.products.length} product${s.products.length === 1 ? '' : 's'}`] : [])];
  const dev = s.devices && s.devices !== 'all' ? (DEVICES.find((x) => x[0] === s.devices) || ['', ''])[1].toLowerCase() : '';
  return [pages + (extra.length ? ' (' + extra.join(', ') + ')' : ''), dev].filter(Boolean).join(' · ');
}
