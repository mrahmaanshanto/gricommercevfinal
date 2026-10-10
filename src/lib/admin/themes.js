// admin/themes — storefront themes and landing page templates (super admin › Storefront themes). A FUTURE module:
// the themes themselves (files, renderer, builder) are not built yet, so this is the administration around them, with
// placeholder previews. Front end only: createStore key `themes` (localStorage gc.admin.themes). Never reads the
// merchant panel's libs; stores are the platform's (lib/platform db().shops, by id).
//
//   item:     { id, kind 'theme'|'template', name, family, category, accent, tagline, features[], sections[], modules[]
//               (MODULES codes), packages[] (PACKAGES keys), author, createdAt, updatedAt, state 'active'|'deprecated'|
//               'disabled', stateReason, replacement (item id), file ('nokshi-2.3.1.zip'), access { edit[], publish[] },
//               editable { section: bool } (merchant editing, Planned) }
//   release:  { id 'REL-0142', itemId, version '2.4.0', notes, stage 'draft'|'review'|'approved'|'published'|'rolledback',
//               uploadedBy, uploadedAt, submittedAt, approvedBy, approvedAt, scheduledAt, publishedBy, publishedAt,
//               rollout 'all'|'selected'|'next-visit', stores [shopId] (selected), rejected { by, at, reason },
//               rolledBackBy, rolledBackAt, rollbackReason }
//   assign:   { [shopId]: { themeId, version, pending (version waiting for the next visit) | null, by, at } }
//   pages:    [{ id, shopId, templateId, version, title, at }]  landing pages made from a template
//   log:      [{ id, at, by, itemId, kind 'release'|'state'|'assign'|'edit'|'package', text }]
// Status (Draft · In review · Published · Deprecated · Disabled) is worked out from the item's state and its releases.
// The publishing rule: the person who uploaded a version never approves it; Technical ops (platform role ops) or an
// admin approves and publishes. Change functions commit and return { ok, error?, … }.

import { createStore } from './store';
import { db as platformDB, staff } from '@/lib/platform/store';
import { DAY, rng, startOfDay } from '@/lib/platform/util';
import { moduleBy } from '@/lib/platform/catalogue';
import { subOf } from '@/lib/platform/billing';

const H = 3600e3;
const pl = (n, one, many) => `${n} ${n === 1 ? one : many || one + 's'}`;

// ---- lists ---------------------------------------------------------------------------------------------------------
export const CATEGORIES = ['Single product', 'Fashion', 'Electronics', 'Beauty', 'Grocery', 'General e-commerce', 'Landing page', 'Multi-product store'];
export const TEMPLATE_CATEGORIES = ['Campaign', 'Product', 'Lead', 'Event', 'App'];
/** The theme families on gridcommerce.net/themes (website repo, src/data/sample/pages.ts › THEMES). */
export const FAMILIES = [
  { id: 'nokshi', name: 'Nokshi', label: 'Clothing and fashion', tagline: 'Large imagery for products people want to look at.', accent: '#7c3aed' },
  { id: 'counter', name: 'Counter', label: 'Retail and grocery', tagline: 'Dense catalogue browsing for shops with a lot of lines.', accent: '#15803d' },
  { id: 'signal', name: 'Signal', label: 'Electronics', tagline: 'Specification tables that stay readable on a phone.', accent: '#0070a0' },
  { id: 'tuli', name: 'Tuli', label: 'Beauty and home', tagline: 'Warm, editorial pages for small-batch brands.', accent: '#c2410c' },
  { id: 'padma', name: 'Padma', label: 'Wholesale', tagline: 'Built for buyers ordering by the carton, not the piece.', accent: '#0f766e' },
  { id: 'rickshaw', name: 'Rickshaw', label: 'Food and quick commerce', tagline: 'Short menus, fast checkout, delivery windows up front.', accent: '#b91c1c' },
];
export const familyBy = (id) => FAMILIES.find((f) => f.id === id) || null;
export const familyName = (id) => (familyBy(id) || {}).name || (id ? id : 'No family');

export const STATUSES = ['Published', 'In review', 'Draft', 'Deprecated', 'Disabled'];
export const STATUS_TONE = { Published: 'success', 'In review': 'warning', Draft: 'neutral', Deprecated: 'primary', Disabled: 'error' };

/** The packages a theme can be offered on (an Online storefront comes with these). */
export const PACKAGES = [
  { id: 'online-growth', label: 'Online Growth', short: 'Growth' },
  { id: 'online-business', label: 'Online Business', short: 'Business' },
  { id: 'online-enterprise', label: 'Online Enterprise', short: 'Enterprise' },
  { id: 'retail-online', label: 'Retail + Online', short: 'Retail + Online' },
  { id: 'wholesale-online', label: 'Wholesale + Online', short: 'Wholesale + Online' },
];
export const packageLabel = (id) => (PACKAGES.find((p) => p.id === id) || {}).label || id;

/** Modules a theme or template can carry blocks for (codes from lib/platform/catalogue › MODULES). */
export const THEME_MODULES = ['M06', 'M02', 'M12', 'M09', 'M20', 'M21', 'M10', 'G4', 'M08', 'M23', 'G1', 'M28', 'M14', 'M25'];
export const moduleName = (code) => (moduleBy(code) || {}).name || code;

/** Sections a placeholder preview draws, and what merchants will one day edit. */
export const SECTIONS = [
  ['announce', 'Announcement bar'], ['header', 'Header and menu'], ['hero', 'Hero banner'], ['categories', 'Category tiles'],
  ['grid', 'Product grid'], ['spec', 'Spec table'], ['banner', 'Offer banner'], ['reviews', 'Reviews'], ['countdown', 'Countdown'],
  ['form', 'Order form'], ['footer', 'Footer'],
];
export const sectionName = (k) => (SECTIONS.find((s) => s[0] === k) || [k, k])[1];
/** Merchant editing (Planned): what a merchant may change in their copy of a theme. */
export const EDITABLE = [
  ['colours', 'Colours and fonts'], ['logo', 'Logo and favicon'], ['header', 'Header and menu'], ['hero', 'Hero banner'],
  ['sections', 'Add, hide and reorder sections'], ['footer', 'Footer'], ['css', 'Custom CSS'], ['code', 'Theme files (code)'],
];
const EDIT_DEFAULT = { colours: true, logo: true, header: true, hero: true, sections: true, footer: true, css: false, code: false };

export const TEAMS = ['Design', 'Technical ops'];
export const DESIGNERS = ['Sumaiya Ahmed', 'Tanvir Alam', 'Nabila Chowdhury'];
export const APPROVERS = ['Rakib Hasan', 'Mahin Khan'];
export const AUTHOR = 'GridCommerce design team';
export const ROLLOUTS = [
  ['all', 'All stores using it, now'],
  ['selected', 'Selected stores only'],
  ['next-visit', 'Each store on its next visit'],
];
export const rolloutLabel = (k) => (ROLLOUTS.find((r) => r[0] === k) || [k, k])[1];
export const STAGES = [['draft', 'Draft'], ['review', 'In review'], ['approved', 'Approved'], ['published', 'Published']];
export const stageLabel = (k) => (k === 'rolledback' ? 'Rolled back' : (STAGES.find((s) => s[0] === k) || [k, k])[1]);

// ---- versions ------------------------------------------------------------------------------------------------------
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
export const isSemver = (v) => SEMVER.test(String(v || '').trim());
/** -1 · 0 · 1 */
export function cmpVer(a, b) {
  const x = String(a).split('.').map(Number);
  const y = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) < (y[i] || 0) ? -1 : 1; }
  return 0;
}
/** The next patch / minor / major after v. */
export function bump(v, part = 'minor') {
  const [a, b, c] = String(v || '0.0.0').split('.').map(Number);
  if (part === 'major') return `${a + 1}.0.0`;
  if (part === 'patch') return `${a}.${b}.${c + 1}`;
  return `${a}.${b + 1}.0`;
}

// ---- the stores that have a storefront -----------------------------------------------------------------------------
/** The package a store's storefront sits on, or null when the store has no Online segment. */
export function packageOfShop(db, shop) {
  if (!shop || !(shop.segs || []).includes('Online')) return null;
  const sub = subOf(db, shop.id);
  if (!sub) return null;
  if (sub.ladder === 'online') return (shop.segs || []).includes('Retail') ? 'retail-online' : 'online-' + sub.plan;
  if (sub.ladder === 'retail') return 'retail-online';
  if (sub.ladder === 'wholesale') return 'wholesale-online';
  return null;
}
/** Live stores with an online storefront: [{ shop, pkg }]. */
export function onlineStores(db) {
  return db.shops
    .filter((s) => s.status === 'live' && (s.segs || []).includes('Online'))
    .filter((s) => { const sub = subOf(db, s.id); return sub && sub.status !== 'archived' && sub.status !== 'cancelled'; })
    .map((shop) => ({ shop, pkg: packageOfShop(db, shop) }))
    .filter((r) => r.pkg);
}

// ---- the demo ------------------------------------------------------------------------------------------------------
const NOTES = [
  'Faster product images on 3G: pictures below the fold load as you scroll',
  'Bangla menu labels no longer wrap on small phones',
  'Sticky Add to cart on phones',
  'Checkout button moved above the delivery charge',
  'Reviews show the reviewer’s district',
  'Category tiles use the store’s own icons',
  'Fixed prices overlapping in the product grid on small iPhones',
  'Hero banner takes a short video',
  'Footer shows the bKash and Nagad marks',
  'The cart remembers the delivery area',
  'Spec table folds into rows on phones',
  'Out-of-stock items show a Notify me button',
  'Delivery charge shown on the product page',
  'Product page shows COD and return rules up front',
];

// [id, name, family, category, accent, tagline, features, sections, modules, packages, history, extra]
const THEME_SEED = [
  ['nokshi', 'Nokshi', 'nokshi', 'Fashion', '#7c3aed', 'Large imagery for products people want to look at.',
    ['Lookbook grid', 'Size guide block', 'Fast on 3G', 'Bangla and English menus', 'Wishlist'],
    ['announce', 'header', 'hero', 'categories', 'grid', 'reviews', 'footer'],
    ['M06', 'M02', 'M09', 'M20', 'M21', 'M10', 'G4', 'M08'], ['online-growth', 'online-business', 'online-enterprise', 'retail-online'],
    ['1.0.0', '1.4.0', '2.0.0', '2.3.0', '2.3.1'], { months: 22, next: { v: '2.4.0', stage: 'review', by: 'Tanvir Alam', notes: 'Lookbook grid takes portrait photos; size guide opens as a bottom sheet' } }],
  ['nokshi-saree', 'Nokshi Saree', 'nokshi', 'Fashion', '#9333ea', 'Long scrolls of drape photos, fabric and weave up front.',
    ['Drape gallery', 'Fabric and weave block', 'Blouse piece note', 'Video try-on'],
    ['announce', 'header', 'hero', 'grid', 'banner', 'reviews', 'footer'],
    ['M06', 'M02', 'M09', 'M21', 'M10', 'M08'], ['online-business', 'online-enterprise', 'retail-online'],
    ['1.0.0', '1.2.0', '1.4.0'], { months: 14 }],
  ['nokshi-lookbook', 'Nokshi Lookbook', 'nokshi', 'Fashion', '#6d28d9', 'An editorial lookbook that shops straight from the photo.',
    ['Shop the look', 'Full-bleed photos', 'Collection stories'],
    ['header', 'hero', 'banner', 'grid', 'footer'],
    ['M06', 'M02', 'M10'], ['online-business', 'online-enterprise'],
    [], { months: 1, next: { v: '1.0.0', stage: 'review', by: 'Nabila Chowdhury', notes: 'First version for review' } }],
  ['counter', 'Counter', 'counter', 'Grocery', '#15803d', 'Dense catalogue browsing for shops with a lot of lines.',
    ['Category-first layout', 'Stock badges', 'Counter pickup option', 'Quick add from the list', 'Weight and unit prices'],
    ['announce', 'header', 'categories', 'grid', 'banner', 'footer'],
    ['M06', 'M02', 'M21', 'M20', 'G4', 'M08', 'M23', 'M25'], ['online-growth', 'online-business', 'online-enterprise', 'retail-online'],
    ['1.0.0', '2.0.0', '3.0.0', '3.1.0'], { months: 24, lastRollout: 'next-visit', next: { v: '3.2.0', stage: 'draft', by: 'Sumaiya Ahmed', notes: 'Basket reorder from the account page; bigger stock badges' } }],
  ['counter-fresh', 'Counter Fresh', 'counter', 'Grocery', '#16a34a', 'Fresh food with delivery slots on the first screen.',
    ['Delivery slot picker', 'Fresh today shelf', 'Weight-based prices'],
    ['announce', 'header', 'hero', 'categories', 'grid', 'footer'],
    ['M06', 'M02', 'M21', 'M08', 'M23'], ['online-growth', 'online-business', 'online-enterprise', 'retail-online'],
    ['1.0.0', '1.2.0', '1.2.2'], { months: 10 }],
  ['signal', 'Signal', 'signal', 'Electronics', '#0070a0', 'Specification tables that stay readable on a phone.',
    ['Spec comparison', 'Warranty block', 'EMI display', 'IMEI-ready product page'],
    ['announce', 'header', 'hero', 'categories', 'grid', 'spec', 'reviews', 'footer'],
    ['M06', 'M02', 'M09', 'M28', 'M21', 'M10', 'M08', 'G1'], ['online-growth', 'online-business', 'online-enterprise', 'retail-online'],
    ['1.0.0', '1.5.0', '2.0.0', '2.0.4'], { months: 20, next: { v: '2.1.0', stage: 'approved', by: 'Tanvir Alam', notes: 'Compare up to four phones; EMI table by bank', schedule: 3 } }],
  ['signal-compare', 'Signal Compare', 'signal', 'Electronics', '#0284c7', 'A comparison-first store for phones and gadgets.',
    ['Side-by-side compare', 'Price drop alerts', 'Accessory bundles'],
    ['header', 'hero', 'spec', 'grid', 'footer'],
    ['M06', 'M02', 'M28', 'M21'], ['online-business', 'online-enterprise'],
    [], { months: 1, next: { v: '0.9.0', stage: 'draft', by: 'Sumaiya Ahmed', notes: 'First draft', rejected: 'The compare table scrolls sideways on a 360px phone; please fold it into rows' } }],
  ['tuli', 'Tuli', 'tuli', 'Beauty', '#c2410c', 'Warm, editorial pages for small-batch brands.',
    ['Ingredient block', 'Review-led product page', 'Bundle builder', 'Skin type filter'],
    ['announce', 'header', 'hero', 'grid', 'reviews', 'banner', 'footer'],
    ['M06', 'M02', 'M09', 'M20', 'M21', 'G4', 'M08'], ['online-growth', 'online-business', 'online-enterprise', 'retail-online'],
    ['1.0.0', '1.3.0', '1.5.0', '1.6.0', '1.6.1'], { months: 18, rolledBack: { v: '1.6.1', reason: 'The checkout button was hidden behind the chat bubble on iPhone Safari' } }],
  ['tuli-glow', 'Tuli Glow', 'tuli', 'Single product', '#ea580c', 'One hero product, its story and a short COD order form.',
    ['One-page order form', 'Before and after slider', 'COD and delivery note'],
    ['header', 'hero', 'reviews', 'form', 'footer'],
    ['M06', 'M02', 'M23', 'M08', 'M09'], ['online-growth', 'online-business', 'online-enterprise', 'retail-online'],
    ['1.0.0', '1.1.0'], { months: 8 }],
  ['padma', 'Padma', 'padma', 'Multi-product store', '#0f766e', 'Built for buyers ordering by the carton, not the piece.',
    ['Tier price table', 'Minimum order rules', 'Quick reorder', 'Buyer account prices'],
    ['header', 'categories', 'grid', 'spec', 'footer'],
    ['M06', 'M02', 'M14', 'M25', 'M08'], ['online-enterprise', 'wholesale-online'],
    ['1.0.0', '1.0.3'], { months: 9 }],
  ['rickshaw', 'Rickshaw', 'rickshaw', 'Grocery', '#b91c1c', 'Short menus, fast checkout, delivery windows up front.',
    ['Menu sections', 'Delivery window picker', 'Repeat last order'],
    ['announce', 'header', 'categories', 'grid', 'footer'],
    ['M06', 'M02', 'M08', 'M23', 'M21'], ['online-growth', 'online-business', 'online-enterprise'],
    ['1.0.0', '1.1.0', '1.2.0'], { months: 11 }],
  ['haat', 'Haat', 'counter', 'Multi-product store', '#2e559d', 'A general store with many departments and a strong search.',
    ['Department menu', 'Search with Bangla spelling', 'Deals shelf', 'Brand pages'],
    ['announce', 'header', 'hero', 'categories', 'grid', 'banner', 'footer'],
    ['M06', 'M02', 'M09', 'M20', 'M21', 'M10', 'G4', 'M08'], ['online-growth', 'online-business', 'online-enterprise', 'retail-online', 'wholesale-online'],
    ['1.0.0', '1.3.0', '2.0.0'], { months: 16 }],
  ['ekpata', 'Ekpata', 'tuli', 'Landing page', '#be185d', 'One page that sells one offer, for stores that run on ads.',
    ['Single scroll', 'Order form in the page', 'Countdown', 'Pixel and server tracking'],
    ['header', 'hero', 'countdown', 'reviews', 'form', 'footer'],
    ['M06', 'M12', 'M23', 'G1', 'M08'], ['online-growth', 'online-business', 'online-enterprise', 'retail-online'],
    ['1.0.0', '1.2.0'], { months: 7 }],
  ['bazar-classic', 'Bazar Classic', 'counter', 'General e-commerce', '#64748b', 'The first GridCommerce storefront, kept for stores that still use it.',
    ['Classic grid', 'Sidebar categories'],
    ['header', 'categories', 'grid', 'footer'],
    ['M06', 'M02', 'M08'], ['online-growth', 'online-business', 'online-enterprise', 'retail-online'],
    ['1.0.0', '1.5.0', '1.9.2'], { months: 30, state: 'deprecated', replacement: 'haat', reason: 'Replaced by Haat: no Bangla search and slow on 3G' }],
  ['dokan-starter', 'Dokan Starter', 'counter', 'General e-commerce', '#475569', 'A plain starter store for testing new sections.',
    ['Plain grid', 'Basic product page'],
    ['header', 'grid', 'footer'],
    ['M06', 'M02'], ['online-growth'],
    ['0.8.0'], { months: 5, state: 'disabled', reason: 'The cart lost items when the phone went offline; off until 0.9 is reviewed' }],
];

const TEMPLATE_SEED = [
  ['eid-offer', 'Eid offer', 'Campaign', '#047857', 'Eid collection with a countdown to the last delivery day.',
    ['Countdown to last delivery', 'Gift note', 'Bundle offer'], ['announce', 'hero', 'countdown', 'grid', 'form', 'footer'],
    ['M12', 'M06', 'M21', 'M08'], ['online-growth', 'online-business', 'online-enterprise', 'retail-online'], ['1.0.0', '1.1.0', '2.0.0'], { months: 15 }],
  ['flash-sale', 'Flash sale', 'Campaign', '#dc2626', 'A timed sale with stock left on every item.',
    ['Stock left bar', 'Countdown', 'Coupon box'], ['announce', 'hero', 'countdown', 'grid', 'footer'],
    ['M12', 'M06', 'M21'], ['online-growth', 'online-business', 'online-enterprise', 'retail-online'], ['1.0.0', '1.2.0'], { months: 12 }],
  ['cod-single', 'Single product COD', 'Product', '#0070a0', 'One product, the reasons to buy and a COD form on the same page.',
    ['COD order form', 'Delivery charge by area', 'WhatsApp button'], ['hero', 'reviews', 'form', 'footer'],
    ['M12', 'M06', 'M23', 'M08', 'G1'], ['online-growth', 'online-business', 'online-enterprise', 'retail-online'], ['1.0.0', '1.3.0', '1.4.2'], { months: 18 }],
  ['pre-order', 'Pre-order', 'Product', '#7c3aed', 'Take advance payment for stock that is on its way.',
    ['Advance amount', 'Expected arrival date', 'Pre-order count'], ['hero', 'grid', 'form', 'footer'],
    ['M12', 'M06', 'M02'], ['online-business', 'online-enterprise', 'retail-online'], ['1.0.0', '1.1.0'], { months: 9 }],
  ['lead-form', 'Lead form', 'Lead', '#0f766e', 'Collect a name and phone number for a call back.',
    ['Short form', 'Thank-you page', 'Lead to CRM'], ['hero', 'form', 'footer'],
    ['M12'], ['online-growth', 'online-business', 'online-enterprise', 'retail-online', 'wholesale-online'], ['1.0.0'], { months: 6 }],
  ['webinar', 'Webinar sign-up', 'Event', '#2e559d', 'Sign up for a live class or product demo.',
    ['Date and time block', 'Speaker cards', 'Reminder by SMS'], ['hero', 'countdown', 'form', 'footer'],
    ['M12'], ['online-business', 'online-enterprise'], [], { months: 1, next: { v: '1.0.0', stage: 'review', by: 'Tanvir Alam', notes: 'First version for review' } }],
  ['app-download', 'App download', 'App', '#334155', 'Send visitors to the store’s app with a QR code.',
    ['Store badges', 'QR code', 'Screens carousel'], ['hero', 'banner', 'footer'],
    ['M12'], ['online-enterprise'], [], { months: 0, next: { v: '0.1.0', stage: 'draft', by: 'Nabila Chowdhury', notes: 'First draft' } }],
  ['boishakh', 'Pohela Boishakh sale', 'Campaign', '#c2410c', 'Red-and-white Boishakh offer page with a gift on big orders.',
    ['Gift over an amount', 'Festive banner', 'Bundle offer'], ['announce', 'hero', 'grid', 'banner', 'form', 'footer'],
    ['M12', 'M06', 'M21'], ['online-growth', 'online-business', 'online-enterprise', 'retail-online'], ['1.0.0', '1.1.0'], { months: 8 }],
  ['puja-offer', 'Puja offer', 'Campaign', '#b45309', 'Puja collection with delivery dates by district.',
    ['Delivery dates by district', 'Collection grid', 'Coupon box'], ['announce', 'hero', 'grid', 'form', 'footer'],
    ['M12', 'M06', 'M21', 'M08'], ['online-growth', 'online-business', 'online-enterprise', 'retail-online'], ['1.0.0'], { months: 2 }],
  ['winter-sale', 'Winter sale 2025', 'Campaign', '#1d4ed8', 'Last winter’s sale page.',
    ['Countdown', 'Size chart'], ['hero', 'countdown', 'grid', 'footer'],
    ['M12', 'M06', 'M21'], ['online-growth', 'online-business', 'online-enterprise', 'retail-online'], ['1.0.0', '1.0.1'], { months: 11, state: 'deprecated', replacement: 'flash-sale', reason: 'Seasonal: Flash sale does the same with any season' }],
  ['coming-soon', 'Coming soon', 'Lead', '#475569', 'A launch page that collects phone numbers.',
    ['Countdown', 'Notify me form'], ['hero', 'countdown', 'form'],
    ['M12'], ['online-growth', 'online-business', 'online-enterprise'], ['1.0.0'], { months: 4, state: 'disabled', reason: 'The countdown shows the wrong time in Dhaka; off until 1.0.1' }],
];

const PAGE_TITLES = {
  'eid-offer': ['Eid collection', 'Eid gift box', 'Eid ul-Adha offer'], 'flash-sale': ['11.11 flash sale', 'Friday flash sale', 'Weekend deals'],
  'cod-single': ['Order now, pay on delivery', 'Hair oil COD', 'Smart watch offer'], 'pre-order': ['Pre-order: new arrivals', 'Pre-order: winter stock'],
  'lead-form': ['Call me back', 'Wholesale enquiry'], boishakh: ['Boishakh offer', 'Boishakh saree fair'], 'puja-offer': ['Puja collection', 'Puja gift offer'],
  'winter-sale': ['Winter sale'], 'coming-soon': ['Coming soon'],
};

/** Which themes suit a store's category (the demo's deterministic picks). */
const CAT_THEMES = {
  Fashion: ['nokshi', 'nokshi', 'nokshi-saree', 'haat', 'bazar-classic'],
  'Jewellery and accessories': ['nokshi', 'tuli', 'haat'],
  Electronics: ['signal', 'signal', 'haat', 'bazar-classic'],
  Grocery: ['counter', 'counter', 'counter-fresh', 'rickshaw', 'haat'],
  Beauty: ['tuli', 'tuli', 'tuli-glow', 'ekpata'],
};

function seed(now) {
  const R = rng('gridcommerce-themes');
  const data = { items: [], releases: [], assign: {}, pages: [], log: [], seq: { rel: 101, log: 1, page: 1 }, editing: { ...EDIT_DEFAULT } };
  const day0 = startOfDay(now);
  const log = (at, by, itemId, kind, text) => { data.log.push({ id: 'L' + data.seq.log++, at, by, itemId, kind, text }); };
  const relId = () => 'REL-' + String(data.seq.rel++).padStart(4, '0');

  const build = (row, kind) => {
    const [id, name, a, b, c, d, e, f, g, h, hist, x] = kind === 'theme' ? row : [row[0], row[1], null, row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10]];
    const family = a; const category = b; const accent = c; const tagline = d; const features = e; const sections = f; const modules = g; const packages = h;
    const r = rng('item' + id);
    const createdAt = day0 - Math.max(1, x.months * 30) * DAY + r.int(9, 17) * H;
    const item = {
      id, kind, name, family, category, accent, tagline, features: [...features], sections: [...sections], modules: [...modules], packages: [...packages],
      author: AUTHOR, createdAt, updatedAt: createdAt, state: x.state || 'active', stateReason: x.reason || null, replacement: x.replacement || null,
      file: null, access: { edit: ['Design'], publish: ['Technical ops'] }, editable: { ...EDIT_DEFAULT },
    };
    data.items.push(item);
    // published history, spaced from the first upload to the last release (between 10 days and 5 months ago)
    const start = createdAt + 2 * DAY;
    const end = Math.max(start, day0 - Math.min(r.int(10, 150), Math.max(10, x.months * 30 - 20)) * DAY);
    const note = () => {
      const a = r.int(0, NOTES.length - 1);
      const b = (a + r.int(1, NOTES.length - 1)) % NOTES.length;
      return r.chance(0.5) ? `${NOTES[a]}; ${NOTES[b][0].toLowerCase()}${NOTES[b].slice(1)}` : NOTES[a];
    };
    hist.forEach((v, i) => {
      const pubAt = startOfDay(start + (hist.length > 1 ? (end - start) * (i / (hist.length - 1)) : 0)) + r.int(10, 17) * H + r.int(0, 59) * 60000;
      const up = DESIGNERS[(i + r.int(0, 2)) % DESIGNERS.length];
      const appr = APPROVERS[(i + id.length) % APPROVERS.length];
      const rel = {
        id: relId(), itemId: id, version: v, notes: i === 0 ? 'First release' : note(),
        stage: 'published', uploadedBy: up, uploadedAt: pubAt - 3 * DAY, submittedAt: pubAt - 2 * DAY - 4 * H, approvedBy: appr, approvedAt: pubAt - DAY,
        scheduledAt: null, publishedBy: appr, publishedAt: Math.min(pubAt, now - 6 * H), rollout: i === hist.length - 1 && x.lastRollout ? x.lastRollout : 'all', stores: [], rejected: null,
        rolledBackBy: null, rolledBackAt: null, rollbackReason: null,
      };
      if (x.rolledBack && x.rolledBack.v === v) {
        rel.publishedAt = day0 - 9 * DAY + 11 * H;
        rel.uploadedAt = rel.publishedAt - 3 * DAY; rel.submittedAt = rel.publishedAt - 2 * DAY; rel.approvedAt = rel.publishedAt - DAY;
        rel.stage = 'rolledback'; rel.rolledBackBy = 'Rakib Hasan'; rel.rolledBackAt = rel.publishedAt + 26 * H; rel.rollbackReason = x.rolledBack.reason;
      }
      data.releases.push(rel);
      log(rel.uploadedAt, up, id, 'release', `${v} uploaded`);
      log(rel.approvedAt, appr, id, 'release', `${v} approved`);
      log(rel.publishedAt, appr, id, 'release', i === 0 ? `${v} published · first release` : `${v} published · ${rolloutLabel(rel.rollout).toLowerCase()}`);
      if (rel.stage === 'rolledback') log(rel.rolledBackAt, rel.rolledBackBy, id, 'release', `${v} rolled back · ${rel.rollbackReason}`);
      item.updatedAt = Math.max(item.updatedAt, rel.rolledBackAt || rel.publishedAt);
      item.file = `${id}-${v}.zip`;
    });
    if (x.next) {
      const n = x.next;
      const upAt = startOfDay(now - r.int(1, 4) * DAY) + r.int(10, 17) * H + r.int(0, 59) * 60000;
      const rel = {
        id: relId(), itemId: id, version: n.v, notes: n.notes, stage: n.stage, uploadedBy: n.by, uploadedAt: upAt,
        submittedAt: n.stage === 'draft' ? null : upAt + 2 * H, approvedBy: n.stage === 'approved' ? 'Rakib Hasan' : null,
        approvedAt: n.stage === 'approved' ? upAt + 20 * H : null, scheduledAt: n.schedule ? day0 + n.schedule * DAY + 10 * H : null,
        publishedBy: null, publishedAt: null, rollout: 'next-visit', stores: [], rejected: null, rolledBackBy: null, rolledBackAt: null, rollbackReason: null,
      };
      if (n.rejected) rel.rejected = { by: 'Rakib Hasan', at: upAt + 22 * H, reason: n.rejected };
      data.releases.push(rel);
      log(upAt, n.by, id, 'release', `${n.v} uploaded`);
      if (rel.submittedAt) log(rel.submittedAt, n.by, id, 'release', `${n.v} sent for review`);
      if (rel.rejected) log(rel.rejected.at, rel.rejected.by, id, 'release', `${n.v} sent back · ${rel.rejected.reason}`);
      if (rel.approvedAt) log(rel.approvedAt, rel.approvedBy, id, 'release', `${n.v} approved`);
      if (rel.scheduledAt) log(rel.approvedAt + H, rel.approvedBy, id, 'release', `${n.v} scheduled`);
      item.updatedAt = Math.max(item.updatedAt, upAt);
      item.createdAt = Math.min(item.createdAt, upAt);
      if (!item.file) item.file = `${id}-${n.v}.zip`;
    }
    if (x.state) {
      const at0 = now - r.int(12, 40) * DAY;
      log(at0, 'Mahin Khan', id, 'state', x.state === 'deprecated' ? `Deprecated · ${x.reason}` : `Disabled · ${x.reason}`);
      item.updatedAt = Math.max(item.updatedAt, at0);
    }
  };
  THEME_SEED.forEach((row) => build(row, 'theme'));
  TEMPLATE_SEED.forEach((row) => build(row, 'template'));

  // ---- which store uses which theme ----
  const pdb = platformDB();
  const stores = onlineStores(pdb);
  for (const { shop, pkg } of stores) {
    const r = rng('theme' + shop.id);
    // a few stores in their trial have not picked a theme yet
    if ((subOf(pdb, shop.id) || {}).status === 'trial' && r.chance(0.3)) continue;
    const options = (CAT_THEMES[shop.cat] || ['haat']).filter((tid) => { const it = data.items.find((z) => z.id === tid); return it && it.packages.includes(pkg); });
    const themeId = options.length ? options[r.int(0, options.length - 1)] : 'haat';
    const vers = publishedVersions(data, themeId);
    const live = vers[0];
    let version = live;
    let pending = null;
    const rel = liveReleaseOf(data, themeId);
    if (rel && rel.rollout === 'next-visit' && vers[1] && r.chance(0.45)) { version = vers[1]; pending = live; }
    else if (vers[1] && r.chance(0.18)) version = vers[1];
    const assignedAt = Math.min(now - DAY, shop.createdAt + r.int(1, 6) * H);
    const by = r.chance(0.7) ? 'Store owner · setup' : r.pick(['Rakib Hasan', 'Farhana Akter', 'Tania Sultana']);
    data.assign[shop.id] = { themeId, version, pending, by, at: assignedAt };
  }
  // three recent changes in the log
  stores.slice(0, 40).filter((_, i) => i % 13 === 4).forEach(({ shop }) => {
    const a = data.assign[shop.id];
    if (a.by !== 'Store owner · setup') log(a.at, a.by, a.themeId, 'assign', `${shop.name} moved to ${data.items.find((z) => z.id === a.themeId).name} ${a.version}`);
  });

  // ---- landing pages made from templates ----
  for (const tpl of data.items.filter((z) => z.kind === 'template')) {
    const vers = publishedVersions(data, tpl.id);
    if (!vers.length) continue;
    const r = rng('pages' + tpl.id);
    const n = tpl.state === 'active' ? r.int(3, 9) : r.int(1, 3);
    const pool = stores.filter((s) => tpl.packages.includes(s.pkg));
    const picked = new Set();
    for (let i = 0; i < n && pool.length; i++) {
      const s = pool[r.int(0, pool.length - 1)];
      if (picked.has(s.shop.id)) continue;
      picked.add(s.shop.id);
      const count = r.int(1, 3);
      for (let k = 0; k < count; k++) {
        const titles = PAGE_TITLES[tpl.id] || [tpl.name];
        data.pages.push({
          id: 'LP' + data.seq.page++, shopId: s.shop.id, templateId: tpl.id, version: vers[1] && r.chance(0.3) ? vers[1] : vers[0],
          title: titles[(k + i) % titles.length], at: Math.max(tpl.createdAt + DAY, now - r.int(2, 160) * DAY),
        });
      }
    }
  }
  data.log.sort((a, b) => b.at - a.at);
  return data;
}

export const themes = createStore({ key: 'themes', version: 1, seed });

// ---- reading -------------------------------------------------------------------------------------------------------
export const itemsOf = (data, kind) => data.items.filter((i) => !kind || i.kind === kind);
export const itemById = (data, id) => data.items.find((i) => i.id === id) || null;
export const releaseById = (data, id) => data.releases.find((r) => r.id === id) || null;
export const releasesOf = (data, itemId) => data.releases.filter((r) => r.itemId === itemId).sort((a, b) => cmpVer(b.version, a.version));
/** The release stores get today: the newest published one that was not rolled back. */
export function liveReleaseOf(data, itemId) {
  return data.releases.filter((r) => r.itemId === itemId && r.stage === 'published').sort((a, b) => cmpVer(b.version, a.version))[0] || null;
}
export const liveVersion = (data, itemId) => (liveReleaseOf(data, itemId) || {}).version || null;
/** Published versions, newest first. */
export function publishedVersions(data, itemId) {
  return data.releases.filter((r) => r.itemId === itemId && r.stage === 'published').map((r) => r.version).sort((a, b) => cmpVer(b, a));
}
/** The release waiting in the workflow (draft, in review or approved), if any. */
export const pendingReleaseOf = (data, itemId) => data.releases.find((r) => r.itemId === itemId && ['draft', 'review', 'approved'].includes(r.stage)) || null;

export function statusOf(data, item) {
  if (!item) return 'Draft';
  if (item.state === 'disabled') return 'Disabled';
  if (item.state === 'deprecated') return 'Deprecated';
  if (liveReleaseOf(data, item.id)) return 'Published';
  if (data.releases.some((r) => r.itemId === item.id && (r.stage === 'review' || r.stage === 'approved'))) return 'In review';
  return 'Draft';
}
/** The version shown on a card: the live one, else the one being worked on. */
export function shownVersion(data, item) {
  return liveVersion(data, item.id) || (pendingReleaseOf(data, item.id) || {}).version || '—';
}

/** Stores using a theme: [{ shop, pkg, version, pending, behind, by, at }]. */
export function storesOn(data, db, themeId) {
  const live = liveVersion(data, themeId);
  return onlineStores(db).filter(({ shop }) => data.assign[shop.id] && data.assign[shop.id].themeId === themeId).map(({ shop, pkg }) => {
    const a = data.assign[shop.id];
    return { shop, pkg, version: a.version, pending: a.pending, behind: !!(live && cmpVer(a.version, live) < 0), by: a.by, at: a.at };
  }).sort((x, y) => x.shop.name.localeCompare(y.shop.name));
}
/** Every store with a storefront and its theme: [{ shop, pkg, a (assignment | null), item, live, behind }]. */
export function assignmentRows(data, db) {
  return onlineStores(db).map(({ shop, pkg }) => {
    const a = data.assign[shop.id] || null;
    const item = a ? itemById(data, a.themeId) : null;
    const live = item ? liveVersion(data, item.id) : null;
    return { shop, pkg, a, item, live, behind: !!(a && live && cmpVer(a.version, live) < 0) };
  });
}
/** Stores using a template, with their landing pages: [{ shop, pages: [page] }]. */
export function templateUse(data, db, templateId) {
  const byShop = new Map();
  for (const p of data.pages.filter((x) => x.templateId === templateId)) {
    if (!byShop.has(p.shopId)) byShop.set(p.shopId, []);
    byShop.get(p.shopId).push(p);
  }
  return [...byShop.entries()].map(([shopId, pages]) => ({ shop: db.shops.find((s) => s.id === shopId) || { id: shopId, name: '#' + shopId }, pages: pages.sort((a, b) => b.at - a.at) }))
    .sort((a, b) => a.shop.name.localeCompare(b.shop.name));
}
/** How many stores use an item (themes: assigned stores; templates: stores with a page from it). */
export function usageCount(data, db, item) {
  if (item.kind === 'template') return new Set(data.pages.filter((p) => p.templateId === item.id).map((p) => p.shopId)).size;
  const ids = new Set(onlineStores(db).map((r) => r.shop.id));
  return Object.entries(data.assign).filter(([sid, a]) => a.themeId === item.id && ids.has(sid)).length;
}
export const logOf = (data, itemId) => data.log.filter((l) => !itemId || l.itemId === itemId).sort((a, b) => b.at - a.at);

/** What a store sees change when its theme changes: { sections: { added, removed }, features: { gained, lost }, modules: { needed } , pkgOk }. */
export function changePreview(data, db, shopId, themeId) {
  const shop = db.shops.find((s) => s.id === shopId);
  const pkg = packageOfShop(db, shop);
  const a = data.assign[shopId] || null;
  const from = a ? itemById(data, a.themeId) : null;
  const to = itemById(data, themeId);
  if (!to) return null;
  const fs = from ? from.sections : [];
  const ff = from ? from.features : [];
  return {
    from, to, fromVersion: a ? a.version : null, toVersion: liveVersion(data, themeId),
    sectionsAdded: to.sections.filter((s) => !fs.includes(s)), sectionsRemoved: fs.filter((s) => !to.sections.includes(s)),
    featuresGained: to.features.filter((f) => !ff.includes(f)), featuresLost: ff.filter((f) => !to.features.includes(f)),
    pkgOk: !!pkg && to.packages.includes(pkg), pkg,
  };
}

// ---- who acts ------------------------------------------------------------------------------------------------------
const me = () => { try { return staff(); } catch { return { name: 'Mahin Khan', role: 'admin' }; } };
const canPublish = (s) => s && (s.role === 'admin' || s.role === 'ops');
export const mayPublish = () => canPublish(me());
const fail = (error) => ({ ok: false, error });
const pushLog = (data, now, itemId, kind, text, by) => { data.log.unshift({ id: 'L' + data.seq.log++, at: now, by: by || me().name, itemId, kind, text }); };
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32) || 'item';

// ---- changing ------------------------------------------------------------------------------------------------------
/** Upload a theme or template: it appears as a Draft with its first release waiting to be sent for review. */
export function uploadItem(f) {
  const name = String(f.name || '').trim();
  const version = String(f.version || '').trim();
  const file = String(f.file || '').trim();
  const kind = f.kind === 'template' ? 'template' : 'theme';
  const cats = kind === 'template' ? TEMPLATE_CATEGORIES : CATEGORIES;
  if (name.length < 3) return fail('Give it a name of at least 3 letters.');
  if (!cats.includes(f.category)) return fail('Pick a category.');
  if (!isSemver(version)) return fail('Write the version as three numbers, like 1.0.0.');
  if (!file) return fail('Choose the .zip file.');
  if (!/\.zip$/i.test(file)) return fail('The file must be a .zip.');
  if (!(f.packages || []).length) return fail('Pick at least one package it is offered on.');
  return themes.commit((data, now) => {
    if (data.items.some((i) => i.name.toLowerCase() === name.toLowerCase())) return fail(`There is already a ${kind} called ${name}.`);
    let id = slug(name);
    while (data.items.some((i) => i.id === id)) id += '-2';
    const fam = familyBy(f.family);
    const item = {
      id, kind, name, family: fam ? fam.id : null, category: f.category, accent: fam ? fam.accent : '#2e559d',
      tagline: String(f.tagline || '').trim(), features: [], sections: kind === 'template' ? ['hero', 'form', 'footer'] : ['header', 'hero', 'grid', 'footer'],
      modules: [...(f.modules || [])], packages: [...f.packages], author: AUTHOR, createdAt: now, updatedAt: now, state: 'active',
      stateReason: null, replacement: null, file, access: { edit: ['Design'], publish: ['Technical ops'] }, editable: { ...data.editing },
    };
    data.items.push(item);
    const rel = {
      id: 'REL-' + String(data.seq.rel++).padStart(4, '0'), itemId: id, version, notes: 'First version', stage: 'draft', uploadedBy: me().name,
      uploadedAt: now, submittedAt: null, approvedBy: null, approvedAt: null, scheduledAt: null, publishedBy: null, publishedAt: null,
      rollout: 'all', stores: [], rejected: null, rolledBackBy: null, rolledBackAt: null, rollbackReason: null,
    };
    data.releases.push(rel);
    pushLog(data, now, id, 'release', `${version} uploaded · ${file}`);
    return { ok: true, id, releaseId: rel.id };
  });
}

/** Change a theme's details (name, category, family, tagline, features, modules, packages, who may edit / publish). */
export function editItem(id, f) {
  const name = String(f.name || '').trim();
  if (name.length < 3) return fail('Give it a name of at least 3 letters.');
  return themes.commit((data, now) => {
    const it = itemById(data, id);
    if (!it) return fail('That theme no longer exists.');
    if (data.items.some((i) => i.id !== id && i.name.toLowerCase() === name.toLowerCase())) return fail(`There is already one called ${name}.`);
    const cats = it.kind === 'template' ? TEMPLATE_CATEGORIES : CATEGORIES;
    if (f.category && !cats.includes(f.category)) return fail('Pick a category.');
    if (f.packages && !f.packages.length) return fail('Keep at least one package.');
    if (f.access && (!f.access.edit.length || !f.access.publish.length)) return fail('At least one team must be able to edit and one to publish.');
    const changed = [];
    if (it.name !== name) changed.push('name');
    if (f.category && f.category !== it.category) changed.push('category');
    if (f.family !== undefined && (f.family || null) !== it.family) changed.push('family');
    if (f.tagline !== undefined && f.tagline.trim() !== it.tagline) changed.push('description');
    if (f.features && f.features.join('|') !== it.features.join('|')) changed.push('features');
    if (f.modules && f.modules.slice().sort().join() !== it.modules.slice().sort().join()) changed.push('modules');
    if (f.packages && f.packages.slice().sort().join() !== it.packages.slice().sort().join()) changed.push('packages');
    if (f.access && JSON.stringify(f.access) !== JSON.stringify(it.access)) changed.push('access');
    if (!changed.length) return { ok: true, changed: [] };
    it.name = name;
    if (f.category) it.category = f.category;
    if (f.family !== undefined) { it.family = f.family || null; const fam = familyBy(it.family); if (fam && changed.includes('family')) it.accent = fam.accent; }
    if (f.tagline !== undefined) it.tagline = f.tagline.trim();
    if (f.features) it.features = f.features.map((x) => x.trim()).filter(Boolean);
    if (f.modules) it.modules = [...f.modules];
    if (f.packages) it.packages = [...f.packages];
    if (f.access) it.access = { edit: [...f.access.edit], publish: [...f.access.publish] };
    it.updatedAt = now;
    pushLog(data, now, id, 'edit', `Details changed: ${changed.join(', ')}`);
    return { ok: true, changed };
  });
}

/** Turn a theme off (reason needed) or back on. A disabled theme can't be assigned or published; stores keep it. */
export function setEnabled(id, on, reason) {
  const why = String(reason || '').trim();
  if (!on && why.length < 5) return fail('Say why it is turned off (a few words).');
  return themes.commit((data, now) => {
    const it = itemById(data, id);
    if (!it) return fail('That theme no longer exists.');
    if (on && it.state === 'active') return fail('It is already on.');
    if (!on && it.state === 'disabled') return fail('It is already off.');
    const was = it.state;
    it.state = on ? 'active' : 'disabled';
    it.stateReason = on ? null : why;
    if (on) it.replacement = null;
    it.updatedAt = now;
    pushLog(data, now, id, 'state', on ? (was === 'deprecated' ? 'Brought back from deprecated' : 'Turned on again') : `Disabled · ${why}`);
    return { ok: true };
  });
}

/** Deprecate: no new stores can pick it; stores on it see the replacement. moveStores moves them to it now. */
export function deprecate(id, { reason, replacement, moveStores }) {
  const why = String(reason || '').trim();
  if (why.length < 5) return fail('Say why it is deprecated (a few words).');
  if (!replacement) return fail('Choose the theme that replaces it.');
  return themes.commit((data, now) => {
    const it = itemById(data, id);
    const rep = itemById(data, replacement);
    if (!it) return fail('That theme no longer exists.');
    if (!rep || rep.id === id || rep.kind !== it.kind) return fail('Choose another one to replace it.');
    if (rep.state !== 'active' || !liveReleaseOf(data, rep.id)) return fail(`${rep.name} isn't published and on, so it can't replace it.`);
    it.state = 'deprecated'; it.stateReason = why; it.replacement = rep.id; it.updatedAt = now;
    let moved = 0;
    if (moveStores && it.kind === 'theme') {
      const v = liveVersion(data, rep.id);
      for (const [sid, a] of Object.entries(data.assign)) {
        if (a.themeId !== id) continue;
        data.assign[sid] = { themeId: rep.id, version: v, pending: null, by: me().name, at: now };
        moved++;
      }
    }
    pushLog(data, now, id, 'state', `Deprecated · ${why} · replaced by ${rep.name}${moved ? ` · ${pl(moved, 'store')} moved` : ''}`);
    if (moved) pushLog(data, now, rep.id, 'assign', `${pl(moved, 'store')} moved here from ${it.name}`);
    return { ok: true, moved };
  });
}

/** Offer (or stop offering) an item on a package. Stores already using it keep it. */
export function setPackage(id, pkg, on) {
  if (!PACKAGES.some((p) => p.id === pkg)) return fail('Unknown package.');
  return themes.commit((data, now) => {
    const it = itemById(data, id);
    if (!it) return fail('That theme no longer exists.');
    const has = it.packages.includes(pkg);
    if (on === has) return { ok: true };
    if (!on && it.packages.length === 1) return fail('Keep it on at least one package, or disable it instead.');
    it.packages = on ? [...it.packages, pkg] : it.packages.filter((p) => p !== pkg);
    it.updatedAt = now;
    pushLog(data, now, id, 'package', `${on ? 'Offered on' : 'Taken off'} ${packageLabel(pkg)}`);
    return { ok: true };
  });
}

/** Merchant editing (Planned): which parts merchants may change. itemId null = the default for new themes. */
export function setEditable(itemId, key, on) {
  return themes.commit((data, now) => {
    const target = itemId ? itemById(data, itemId) : null;
    if (itemId && !target) return fail('That theme no longer exists.');
    if (target) { target.editable = { ...target.editable, [key]: !!on }; target.updatedAt = now; } else data.editing = { ...data.editing, [key]: !!on };
    return { ok: true };
  });
}

/** Put a new version into the workflow. submit = straight to review (the usual "Release update"). */
export function newRelease(itemId, { version, notes, rollout, stores, submit = true }) {
  const v = String(version || '').trim();
  const n = String(notes || '').trim();
  if (!isSemver(v)) return fail('Write the version as three numbers, like 2.4.0.');
  if (n.length < 5) return fail('Write what changed in this version.');
  if (!ROLLOUTS.some((r) => r[0] === rollout)) return fail('Choose how it reaches the stores.');
  if (rollout === 'selected' && !(stores || []).length) return fail('Pick the stores that get it.');
  return themes.commit((data, now) => {
    const it = itemById(data, itemId);
    if (!it) return fail('That theme no longer exists.');
    if (it.state === 'disabled') return fail('Turn it on before releasing a version.');
    const pend = pendingReleaseOf(data, itemId);
    if (pend) return fail(`${pend.version} is already in the workflow (${stageLabel(pend.stage).toLowerCase()}). Finish or remove it first.`);
    const top = data.releases.filter((r) => r.itemId === itemId).map((r) => r.version).sort((a, b) => cmpVer(b, a))[0];
    if (top && cmpVer(v, top) <= 0) return fail(`The new version must be higher than ${top}.`);
    const rel = {
      id: 'REL-' + String(data.seq.rel++).padStart(4, '0'), itemId, version: v, notes: n, stage: submit ? 'review' : 'draft', uploadedBy: me().name,
      uploadedAt: now, submittedAt: submit ? now : null, approvedBy: null, approvedAt: null, scheduledAt: null, publishedBy: null, publishedAt: null,
      rollout, stores: rollout === 'selected' ? [...stores] : [], rejected: null, rolledBackBy: null, rolledBackAt: null, rollbackReason: null,
    };
    data.releases.push(rel);
    it.file = `${it.id}-${v}.zip`;
    it.updatedAt = now;
    pushLog(data, now, itemId, 'release', `${v} uploaded${submit ? ' and sent for review' : ''}`);
    return { ok: true, id: rel.id };
  });
}

export function submitRelease(relId) {
  return themes.commit((data, now) => {
    const r = releaseById(data, relId);
    if (!r || r.stage !== 'draft') return fail('Only a draft can be sent for review.');
    r.stage = 'review'; r.submittedAt = now;
    pushLog(data, now, r.itemId, 'release', `${r.version} sent for review`);
    return { ok: true };
  });
}

/** Approve a version in review. Never the uploader; Technical ops or an admin. */
export function approveRelease(relId) {
  const s = me();
  if (!canPublish(s)) return fail('Only Technical ops or an admin approves releases.');
  return themes.commit((data, now) => {
    const r = releaseById(data, relId);
    if (!r || r.stage !== 'review') return fail('Only a version in review can be approved.');
    if (r.uploadedBy === s.name) return fail('You uploaded this version, so someone else approves it.');
    r.stage = 'approved'; r.approvedBy = s.name; r.approvedAt = now; r.rejected = null;
    pushLog(data, now, r.itemId, 'release', `${r.version} approved`);
    return { ok: true };
  });
}

/** Send a version in review back to draft with the reason. */
export function rejectRelease(relId, reason) {
  const why = String(reason || '').trim();
  if (why.length < 5) return fail('Say what needs to change (a few words).');
  const s = me();
  if (!canPublish(s)) return fail('Only Technical ops or an admin reviews releases.');
  return themes.commit((data, now) => {
    const r = releaseById(data, relId);
    if (!r || (r.stage !== 'review' && r.stage !== 'approved')) return fail('Only a version in review can be sent back.');
    if (r.uploadedBy === s.name) return fail('You uploaded this version, so someone else reviews it.');
    r.stage = 'draft'; r.submittedAt = null; r.approvedBy = null; r.approvedAt = null; r.scheduledAt = null;
    r.rejected = { by: s.name, at: now, reason: why };
    pushLog(data, now, r.itemId, 'release', `${r.version} sent back · ${why}`);
    return { ok: true };
  });
}

function publishNow(data, r, now, by) {
  const it = itemById(data, r.itemId);
  r.stage = 'published'; r.publishedAt = now; r.publishedBy = by; r.scheduledAt = null;
  let updated = 0; let waiting = 0;
  if (it.kind === 'theme') {
    for (const [sid, a] of Object.entries(data.assign)) {
      if (a.themeId !== it.id) continue;
      if (r.rollout === 'all') { a.version = r.version; a.pending = null; updated++; }
      else if (r.rollout === 'selected') { if (r.stores.includes(sid)) { a.version = r.version; a.pending = null; updated++; } }
      else { a.pending = r.version; waiting++; }
    }
  } else {
    for (const p of data.pages) {
      if (p.templateId !== it.id) continue;
      if (r.rollout === 'all' || (r.rollout === 'selected' && r.stores.includes(p.shopId))) { p.version = r.version; updated++; } else if (r.rollout === 'next-visit') waiting++;
    }
  }
  it.updatedAt = now;
  pushLog(data, now, it.id, 'release', `${r.version} published · ${r.rollout === 'next-visit' ? `${pl(waiting, it.kind === 'theme' ? 'store' : 'page')} update on the next visit` : `${pl(updated, it.kind === 'theme' ? 'store' : 'page')} updated`}`, by);
  return { updated, waiting };
}

/** Publish an approved version now, or schedule it (at: ms in the future). */
export function publishRelease(relId, at) {
  const s = me();
  if (!canPublish(s)) return fail('Only Technical ops or an admin publishes releases.');
  return themes.commit((data, now) => {
    const r = releaseById(data, relId);
    if (!r || r.stage !== 'approved') return fail('Only an approved version can be published.');
    const it = itemById(data, r.itemId);
    if (!it || it.state === 'disabled') return fail('Turn the theme on before publishing.');
    if (at && at > now + 60000) {
      r.scheduledAt = at;
      pushLog(data, now, r.itemId, 'release', `${r.version} scheduled`);
      return { ok: true, scheduled: true };
    }
    return { ok: true, ...publishNow(data, r, now, s.name) };
  });
}

export function cancelSchedule(relId) {
  return themes.commit((data, now) => {
    const r = releaseById(data, relId);
    if (!r || r.stage !== 'approved' || !r.scheduledAt) return fail('That release is not scheduled.');
    r.scheduledAt = null;
    pushLog(data, now, r.itemId, 'release', `${r.version} schedule cancelled`);
    return { ok: true };
  });
}

/** Publish the scheduled releases whose time has come (the page calls it after load and on the clock). */
export function runSchedule() {
  const data = themes.get();
  const t = themes.now();
  if (!themes.isLive() || !data.releases.some((r) => r.stage === 'approved' && r.scheduledAt && r.scheduledAt <= t)) return 0;
  return themes.commit((d, now) => {
    let n = 0;
    for (const r of d.releases.filter((x) => x.stage === 'approved' && x.scheduledAt && x.scheduledAt <= now)) { publishNow(d, r, r.scheduledAt, r.approvedBy || 'Schedule'); n++; }
    return n;
  });
}

/** Roll back the live version: stores on it go back to the one before. */
export function rollback(relId, reason) {
  const why = String(reason || '').trim();
  if (why.length < 5) return fail('Say why it is rolled back (a few words).');
  const s = me();
  if (!canPublish(s)) return fail('Only Technical ops or an admin rolls back a release.');
  return themes.commit((data, now) => {
    const r = releaseById(data, relId);
    if (!r || r.stage !== 'published') return fail('Only a published version can be rolled back.');
    const live = liveReleaseOf(data, r.itemId);
    if (!live || live.id !== r.id) return fail(`Only the live version (${live ? live.version : '—'}) can be rolled back.`);
    const prev = data.releases.filter((x) => x.itemId === r.itemId && x.stage === 'published' && x.id !== r.id).sort((a, b) => cmpVer(b.version, a.version))[0];
    if (!prev) return fail('This is its first version, so there is nothing to go back to. Disable it instead.');
    const it = itemById(data, r.itemId);
    r.stage = 'rolledback'; r.rolledBackBy = s.name; r.rolledBackAt = now; r.rollbackReason = why;
    let moved = 0;
    for (const a of Object.values(data.assign)) {
      if (a.themeId !== r.itemId) continue;
      if (a.version === r.version) { a.version = prev.version; moved++; }
      if (a.pending === r.version) a.pending = null;
    }
    for (const p of data.pages) if (p.templateId === r.itemId && p.version === r.version) { p.version = prev.version; moved++; }
    if (it) it.updatedAt = now;
    pushLog(data, now, r.itemId, 'release', `${r.version} rolled back to ${prev.version} · ${why}${moved ? ` · ${pl(moved, it && it.kind === 'template' ? 'page' : 'store')} moved back` : ''}`);
    return { ok: true, to: prev.version, moved };
  });
}

/** Remove a draft that will not go out. */
export function deleteDraft(relId) {
  return themes.commit((data, now) => {
    const r = releaseById(data, relId);
    if (!r || r.stage !== 'draft') return fail('Only a draft can be removed.');
    data.releases = data.releases.filter((x) => x.id !== relId);
    pushLog(data, now, r.itemId, 'release', `${r.version} draft removed`);
    // an item that never had a release is removed with its last draft
    if (!data.releases.some((x) => x.itemId === r.itemId)) {
      const it = itemById(data, r.itemId);
      data.items = data.items.filter((x) => x.id !== r.itemId);
      return { ok: true, removedItem: it ? it.name : null };
    }
    return { ok: true };
  });
}

/** Give a store a theme (its live version unless one is named). */
export function assignStore(shopId, themeId, version) {
  const pdb = platformDB();
  const shop = pdb.shops.find((s) => s.id === shopId);
  const pkg = packageOfShop(pdb, shop);
  if (!shop || !pkg) return fail('That store has no online storefront.');
  return themes.commit((data, now) => {
    const it = itemById(data, themeId);
    if (!it || it.kind !== 'theme') return fail('Choose a theme.');
    if (it.state !== 'active') return fail(`${it.name} is ${it.state}, so it can't be given to a store.`);
    const vers = publishedVersions(data, themeId);
    if (!vers.length) return fail(`${it.name} has no published version yet.`);
    if (!it.packages.includes(pkg)) return fail(`${it.name} isn't offered on ${packageLabel(pkg)}. Turn it on for that package first.`);
    const v = version && vers.includes(version) ? version : vers[0];
    const was = data.assign[shopId];
    if (was && was.themeId === themeId && was.version === v) return fail(`${shop.name} already uses ${it.name} ${v}.`);
    data.assign[shopId] = { themeId, version: v, pending: null, by: me().name, at: now };
    const from = was ? itemById(data, was.themeId) : null;
    pushLog(data, now, themeId, 'assign', `${shop.name} ${from && from.id !== themeId ? `moved from ${from.name} ` : ''}to ${it.name} ${v}`);
    return { ok: true, version: v };
  });
}

/** Give every store on a package a theme. Without replace only stores with no theme or a retired (deprecated or
 *  disabled) one change; replace = every store on the package. */
export function bulkAssign(themeId, pkg, { replace }) {
  const pdb = platformDB();
  const stores = onlineStores(pdb).filter((r) => r.pkg === pkg);
  if (!PACKAGES.some((p) => p.id === pkg)) return fail('Choose a package.');
  if (!stores.length) return fail(`No store is on ${packageLabel(pkg)} yet.`);
  return themes.commit((data, now) => {
    const it = itemById(data, themeId);
    if (!it || it.kind !== 'theme') return fail('Choose a theme.');
    if (it.state !== 'active') return fail(`${it.name} is ${it.state}, so it can't be given to stores.`);
    const v = liveVersion(data, themeId);
    if (!v) return fail(`${it.name} has no published version yet.`);
    if (!it.packages.includes(pkg)) return fail(`${it.name} isn't offered on ${packageLabel(pkg)}. Turn it on for that package first.`);
    let n = 0;
    for (const { shop } of stores) {
      const a = data.assign[shop.id];
      if (a && a.themeId === themeId && a.version === v) continue;
      if (a && a.themeId !== themeId && !replace) { const cur = itemById(data, a.themeId); if (cur && cur.state === 'active') continue; }
      data.assign[shop.id] = { themeId, version: v, pending: null, by: me().name, at: now };
      n++;
    }
    if (!n) return fail('No store needed a change.');
    pushLog(data, now, themeId, 'assign', `${pl(n, 'store')} on ${packageLabel(pkg)} given ${it.name} ${v}`);
    return { ok: true, count: n };
  });
}

/** A store waiting for "next visit" takes the new version now. */
export function applyPending(shopId) {
  return themes.commit((data, now) => {
    const a = data.assign[shopId];
    if (!a || !a.pending) return fail('Nothing is waiting for this store.');
    const it = itemById(data, a.themeId);
    const v = a.pending;
    a.version = v; a.pending = null;
    const shop = platformDB().shops.find((s) => s.id === shopId);
    pushLog(data, now, a.themeId, 'assign', `${shop ? shop.name : '#' + shopId} updated to ${it ? it.name : ''} ${v}`);
    return { ok: true, version: v };
  });
}

/** Counts for the library's figures. */
export function librarySummary(data, db) {
  const rows = assignmentRows(data, db);
  return {
    stores: rows.length,
    withTheme: rows.filter((r) => r.a).length,
    behind: rows.filter((r) => r.behind).length,
    waiting: rows.filter((r) => r.a && r.a.pending).length,
    onDeprecated: rows.filter((r) => r.item && r.item.state !== 'active').length,
    inReview: data.releases.filter((r) => r.stage === 'review').length,
  };
}
