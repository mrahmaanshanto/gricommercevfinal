// storefront/access — what this shop may change in its storefront, and which presets it is offered.
// Two inputs, read-only:
//   1. Super admin › Storefront themes (lib/admin/themes.js, saved in this browser as gc.admin.themes): the theme the
//      platform gave this store (assign['0090'], Dazzle Shop) and that theme's "Merchant editing" switches, else the
//      default switches for new themes; and each preset family's theme `packages` and state.
//   2. The shop's plan (lib/plans.js) and edition: Custom CSS needs the Business plan.
// The merchant panel never writes the admin's store; when nothing is saved the defaults below apply.
//
//   SWITCHES · editing() → { colours, logo, header, hero, sections, footer, css, code }
//   lockOf(thing) → '' or the reason it is locked ("Your theme doesn't let you change the header" / "Business plan")
//     thing: an option ({ lock, plan }), a section type ({ lock }), 'header', 'footer', 'sections', 'logo', 'css'
//   shopPackage() · presetOffer(id) → { ok, why } · ACCESS_EVENT (the admin's store or the plan changed)

import { currentPlanId, PLANS } from '../plans';
import { currentEditionId } from '../edition';

const ADMIN_KEY = 'gc.admin.themes';
export const SHOP_ID = '0090';
export const ACCESS_EVENT = 'storage';
const ssr = () => typeof window === 'undefined';

export const SWITCHES = [
  ['colours', 'Colours and fonts', 'The Brand & colours and Typography options'],
  ['logo', 'Logo and favicon', 'The logo’s size in the header builder'],
  ['header', 'Header and menu', 'The header builder and the announcement bar'],
  ['hero', 'Hero banner', 'Hero / slider sections in layouts'],
  ['sections', 'Add, hide and reorder sections', 'Adding, hiding and moving sections in layouts'],
  ['footer', 'Footer', 'The Footer options'],
  ['css', 'Custom CSS', 'The Custom CSS option'],
  ['code', 'Custom section code', 'Writing HTML and CSS for custom sections (Business plan only)'],
];
const DEFAULT = { colours: true, logo: true, header: true, hero: true, sections: true, footer: true, css: false, code: true };

function admin() {
  if (ssr()) return null;
  try { const v = JSON.parse(window.localStorage.getItem(ADMIN_KEY)); return v && Array.isArray(v.items) ? v : null; } catch { return null; }
}
/** The theme the platform assigned to this store (or null). */
export function assignedTheme() {
  const a = admin();
  if (!a) return null;
  const as = (a.assign || {})[SHOP_ID];
  return as ? (a.items.find((i) => i.id === as.themeId) || null) : null;
}
/** The merchant-editing switches that apply to this store. */
export function editing() {
  const a = admin();
  if (!a) return { ...DEFAULT };
  const it = assignedTheme();
  return { ...DEFAULT, ...((it && it.editable) || a.editing || {}) };
}

const PLAN_RANK = { starter: 0, growth: 1, business: 2 };
const SWITCH_TEXT = { colours: 'colours and fonts', logo: 'the logo', header: 'the header', hero: 'hero banners', sections: 'sections', footer: 'the footer', css: 'custom CSS', code: 'custom section code' };
/** '' when the shop may change it, else why not (shown next to the locked control). */
export function lockOf(thing) {
  const t = typeof thing === 'string' ? { lock: thing } : thing || {};
  const ed = editing();
  if (t.lock && ed[t.lock] === false) return `Your theme doesn’t let you change ${SWITCH_TEXT[t.lock] || t.lock}. GridCommerce sets this.`;
  if (t.plan) {
    const plan = currentPlanId();
    if ((PLAN_RANK[plan] ?? 0) < (PLAN_RANK[t.plan] ?? 0)) return `Comes with the ${(PLANS[t.plan] || {}).name || t.plan} plan.`;
  }
  return '';
}

/** The package this shop's storefront is on (how the super admin offers themes). */
export function shopPackage() {
  const ed = currentEditionId();
  if (ed === 'online') return 'online-' + currentPlanId();
  return 'retail-online';
}
const PKG_NAME = { 'online-starter': 'Online Starter', 'online-growth': 'Online Growth', 'online-business': 'Online Business', 'retail-online': 'Retail + Online' };
/** Is a preset offered to this shop? Its theme family's main theme must be on and offered on the shop's package. */
export function presetOffer(id) {
  const a = admin();
  if (!a) return { ok: true, why: '' };
  const it = a.items.find((i) => i.id === id && i.kind === 'theme');
  if (!it) return { ok: true, why: '' };
  if (it.state === 'disabled') return { ok: false, why: 'GridCommerce has turned this theme off for now.' };
  const pkg = shopPackage();
  if (!(it.packages || []).includes(pkg)) return { ok: false, why: `Not offered on ${PKG_NAME[pkg] || pkg}.` };
  return { ok: true, why: it.state === 'deprecated' ? 'Being replaced; still works.' : '' };
}

/**
 * Themes from GridCommerce's theme library that carry a store kit (super admin › Storefront themes › a release with a
 * .gcstore.json, published): [{ id, name, family, label, tagline, accent, version, kit, offer }]. A library theme with
 * the same id as a built-in preset replaces its kit (a newer version).
 */
export function libraryKits() {
  const a = admin();
  if (!a) return [];
  const rels = Array.isArray(a.releases) ? a.releases : [];
  return a.items.filter((i) => i.kind === 'theme' && i.state !== 'disabled').map((i) => {
    const rel = rels.filter((r) => r.itemId === i.id && r.stage === 'published' && r.kit).sort((x, y) => (y.publishedAt || 0) - (x.publishedAt || 0))[0];
    return rel ? { id: i.id, name: i.name, family: i.family, label: i.category || '', tagline: i.tagline || '', accent: i.accent || '#003087', version: rel.version, kit: rel.kit, offer: presetOffer(i.id) } : null;
  }).filter(Boolean);
}
