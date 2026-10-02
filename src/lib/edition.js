// edition — GridCommerce is sold in editions, each a set of modules. Every edition is its own site, built with
// NEXT_PUBLIC_EDITION set (see AGENTS.md › Editions); without it the site is the full product, where
// ?edition=<id> previews an edition (kept in this browser) so the four can be compared side by side.
//
//   MODULES   module → the menu item ids it brings (src/shell/navigation.js) and the pages outside the menu it owns
//   EDITIONS  edition → its modules, sales channels and name
//   inEditionNav(id) · routeInEdition(path) · editionChannels() · hasModule(key) · currentEdition()
// The menu, the page guard (components/RoleGuard.jsx), Home, Reports, Settings, Help and the sign-in page read these.

import { NAV, NAV_ALIAS } from '../shell/navigation';
import { routeOf } from '../runtime/routes';

export const MODULES = {
  core: {
    label: 'Core', desc: 'Dashboard, team tasks and chat, customers and leads, settings',
    nav: ['home', 'my-dash', 'tasks', 'team-chat', 'customers', 'leads', 'connections', 'settings', 'set-store', 'set-billing', 'set-help'],
    routes: ['/connect', '/grid-ai', '/set-profile', '/customer-crm', '/customer-statement', '/sales-leads', '/set-general', '/set-preference', '/set-security', '/set-storage', '/set-media', '/set-chrome', '/set-rail', '/set-topbar', '/merchant-sign-in', '/mobile-sign-in', '/mobile-sign-up', '/merchant-onboarding'],
  },
  catalog: {
    label: 'Products, stock & purchases', desc: 'Products, stock, direct purchases, suppliers and their dues, damaged and expired stock, warranty',
    nav: ['products', 'products-all', 'products-add', 'products-cats', 'products-setup', 'products-media', 'stock-list', 'po-buy', 'po-suppliers', 'stock-more', 'stock-expiry', 'stock-labels', 'stock-wpol', 'stock-wclaims'],
    routes: ['/add-product-tabs', '/supplier-detail', '/supplier-return', '/buy-goods', '/stock-setup'],
  },
  places: {
    label: 'Warehouses & branches', desc: 'Many stock places, racks and bins, transfers, adjustments, counts and stock holds',
    nav: ['stock-places', 'stock-wh', 'stock-branches', 'stock-racks', 'stock-transfers', 'stock-adjust', 'stock-count', 'stock-holds'],
    routes: ['/new-transfer'],
  },
  purchasing: {
    label: 'Purchase orders', desc: 'Order from suppliers, receive in parts, report damage or wrong items on arrival',
    nav: ['po-orders', 'po-receive', 'po-requests'],
    routes: ['/new-po', '/po-detail', '/mobile-receive'],
  },
  money: {
    label: 'Money', desc: 'Cash, bank and wallets, dues, payouts, income and expenses, bills to pay, VAT',
    nav: ['acc-home', 'acc-money', 'acc-dues', 'acc-settle', 'acc-spend', 'acc-liab', 'acc-setup'],
    routes: ['/account-reports', '/chart-of-accounts', '/journals', '/sales-profit', '/vat'],
  },
  reports: {
    label: 'Reports', desc: 'Every report, the daily summary and scheduled reports',
    nav: ['rep-all', 'rep-daily', 'auto-reports'],
    routes: ['/report'],
  },
  hr: {
    label: 'Staff & HR', desc: 'Staff, attendance, leave, payroll, increments, gratuity',
    nav: ['hr-home', 'hr-people', 'hr-staff', 'hr-add', 'hr-positions', 'hr-idcards', 'hr-time', 'hr-attendance', 'hr-shifts', 'hr-leave', 'hr-devices', 'hr-pay', 'hr-payroll', 'hr-statements', 'hr-changes', 'hr-gratuity', 'hr-loans', 'hr-setup'],
    routes: ['/staff-profile', '/staff-create'],
  },
  commerce: {
    label: 'Orders & returns', desc: 'All orders, returns and exchanges, payment settings',
    nav: ['orders', 'orders-all', 'sales-return', 'pay-setup'],
    routes: ['/order-detail', '/return-history', '/set-payments', '/set-notifications'],
  },
  marketing: {
    label: 'Offers & loyalty', desc: 'Offers, coupons, loyalty points, wallets and referrals',
    nav: ['promo-offers', 'promo-home', 'promo-coupons', 'loyalty', 'loy-home', 'loy-members', 'loy-products', 'loy-wallet', 'loy-referrals'],
    routes: ['/member-detail', '/new-coupon'],
  },
  pos: {
    label: 'POS', desc: 'The counter register, counters, shifts, cash pickups and the sales book',
    nav: ['pos-register', 'pos-counters'],
    routes: ['/new-sale', '/sales-book', '/return-exchange', '/pos-active', '/pos-close', '/pos-idle', '/pos-keypad', '/pos-offline', '/pos-open', '/pos-pay', '/pos-return', '/pos-sales'],
  },
  wholesale: {
    label: 'Wholesale', desc: 'Wholesale orders, invoices on credit, deliveries in parts, price lists',
    nav: ['orders-wholesale', 'sales-invoices', 'products-catalogue'],
    routes: ['/sales-invoice', '/wholesale-customer', '/wholesale-invoices', '/wholesale-invoice-edit'],
  },
  online: {
    label: 'Online', desc: 'Online orders and couriers, the online store, blog, flash sales, cart recovery and ads tracking',
    nav: ['orders-rto', 'promo-flash', 'promo-page', 'rec-carts', 'rec-auto', 'tracking', 'ta-track', 'ta-health', 'ta-setup', 'storefront', 'blog', 'blog-posts', 'blog-new', 'blog-cats', 'blog-authors'],
    routes: ['/ad-accounts', '/new-order', '/new-flash-sale', '/customer-profile', '/analytics-hub', '/attribution', '/campaigns', '/products-traffic', '/reports-alerts', '/setup-clarity', '/setup-ga4', '/setup-google-ads', '/setup-gtm', '/setup-meta-pixel', '/setup-tik-tok', '/author-profile', '/set-delivery', '/set-seo', '/checkout', '/offer-detail', '/offers', '/order-link'],
  },
  channels: {
    label: 'Sales channels', desc: 'Product sync to the Meta catalog, Google Merchant Center, WooCommerce and Shopify; Google Business Profile',
    nav: ['ch-home', 'ch-meta', 'ch-gmc', 'ch-woo', 'ch-shopify', 'ch-gbp', 'ch-issues', 'ch-settings'],
    routes: ['/connect-channel', '/woo-sync'],
  },
  comms: {
    label: 'Communication', desc: 'Inbox for Facebook, Instagram, WhatsApp and more, calls, AI calls, support tickets, social posts',
    nav: ['inbox', 'calls', 'comm-ai', 'tickets', 'social', 'comm-cal', 'comm-new', 'set-wallet'],
    routes: ['/social-connections', '/auto-call-settings', '/team-report', '/set-ai', '/set-rules', '/set-usage'],
  },
  automation: {
    label: 'Automation', desc: 'Rules, the workflow builder and workflow settings',
    nav: ['automation', 'auto-rules', 'auto-builder', 'auto-settings'],
    routes: [],
  },
};

const BACK_OFFICE = ['core', 'catalog', 'money', 'reports', 'hr', 'commerce', 'marketing'];
// a shop with a store or a warehouse network: many stock places and purchase orders (stockSetup.js)
const STORE = ['places', 'purchasing'];
export const EDITIONS = {
  full: { name: 'GridCommerce', short: 'All modules', modules: Object.keys(MODULES), channels: ['Online', 'Retail', 'Wholesale'] },
  'retail-wholesale': { name: 'GridCommerce Retail + Wholesale', short: 'Retail + Wholesale', modules: [...BACK_OFFICE, ...STORE, 'pos', 'wholesale', 'channels'], channels: ['Retail', 'Wholesale'] },
  // an online-only shop: one stock place, direct purchases, no holds (an approved order takes its stock out at once,
  // it may go below zero), purchase and sale prices only
  online: { name: 'GridCommerce Online', short: 'Online', modules: [...BACK_OFFICE, 'online', 'channels', 'comms', 'automation'], channels: ['Online'], noHolds: true },
  'retail-online': { name: 'GridCommerce Retail + Wholesale + Online', short: 'Retail + Wholesale + Online', modules: [...BACK_OFFICE, ...STORE, 'pos', 'wholesale', 'online', 'channels', 'comms', 'automation'], channels: ['Retail', 'Wholesale', 'Online'] },
  comms: { name: 'GridCommerce Connect', short: 'Communication & CRM', modules: ['core', 'comms', 'automation', 'pos'], channels: ['Retail'] },
};
export const EDITION_IDS = Object.keys(EDITIONS);

// ---- which edition is this ---------------------------------------------------------------------------
const BUILD = process.env.NEXT_PUBLIC_EDITION && EDITIONS[process.env.NEXT_PUBLIC_EDITION] ? process.env.NEXT_PUBLIC_EDITION : 'full';
const PREVIEW_KEY = 'gc.edition.preview';
export const EDITION_EVENT = 'gc:edition';
/** True on a site built for one edition (it cannot be switched). */
export const LOCKED = BUILD !== 'full';

/** The edition in use: the site's own, or on the full site a preview picked with ?edition=. */
export function currentEditionId() {
  if (LOCKED || typeof window === 'undefined') return BUILD;
  try {
    const q = new URLSearchParams(window.location.search).get('edition');
    if (q && EDITIONS[q]) { window.localStorage.setItem(PREVIEW_KEY, q); return q; }
    if (q === 'full') { window.localStorage.removeItem(PREVIEW_KEY); return 'full'; }
    const v = window.localStorage.getItem(PREVIEW_KEY);
    return v && EDITIONS[v] ? v : 'full';
  } catch { return 'full'; }
}
export const currentEdition = () => ({ id: currentEditionId(), ...EDITIONS[currentEditionId()] });
/** Preview another edition on the full site (no effect on an edition's own site). */
export function previewEdition(id) {
  if (LOCKED) return;
  try { if (id === 'full') window.localStorage.removeItem(PREVIEW_KEY); else window.localStorage.setItem(PREVIEW_KEY, id); } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent(EDITION_EVENT, { detail: id }));
}

// ---- what is in it -------------------------------------------------------------------------------------
const navSet = (ed) => new Set(EDITIONS[ed].modules.flatMap((m) => MODULES[m].nav));
const routeSet = (ed) => new Set(EDITIONS[ed].modules.flatMap((m) => MODULES[m].routes));
const pathOf = (it) => (it.to ? routeOf(it.to).split('?')[0] : '');
const ALL_ITEMS = NAV.flatMap((g) => g.items.flatMap((it) => [it, ...(it.children || [])]));
const OWNED = new Set(Object.values(MODULES).flatMap((m) => m.routes));

export const hasModule = (key, ed = currentEditionId()) => EDITIONS[ed].modules.includes(key);
/** Is a menu item (by id, old ids too) part of the edition? */
export function inEditionNav(id, ed = currentEditionId()) {
  if (ed === 'full') return true;
  const s = navSet(ed);
  return s.has(id) || s.has(NAV_ALIAS[id]);
}
/** Is a page part of the edition? Pages no module claims (reference pages, the phone app, the console) always are. */
export function routeInEdition(path, ed = currentEditionId()) {
  if (ed === 'full') return true;
  const p = (path || '/').replace(/\/$/, '') || '/';
  if (routeSet(ed).has(p)) return true;
  const items = ALL_ITEMS.filter((it) => pathOf(it) === p);
  if (items.length) return items.some((it) => inEditionNav(it.id, ed));
  return !OWNED.has(p);
}
/** The menu with everything outside the edition removed (empty groups dropped). */
export function navForEdition(nav, ed = currentEditionId()) {
  if (ed === 'full') return nav;
  return nav.map((g) => ({
    ...g,
    items: g.items.map((it) => {
      if (!it.children) return inEditionNav(it.id, ed) ? it : null;
      const kids = it.children.filter((c) => inEditionNav(c.id, ed));
      if (!kids.length) return inEditionNav(it.id, ed) ? { ...it, children: undefined } : null;
      return { ...it, children: kids };
    }).filter(Boolean),
  })).filter((g) => g.items.length);
}
/** Does an approved order hold its stock (true) or take it out at once (the Online edition)? */
export const holdsStock = (ed = currentEditionId()) => !EDITIONS[ed].noHolds;
/** The sales channels this edition sells through (Online / Retail / Wholesale). */
export const editionChannels = (ed = currentEditionId()) => EDITIONS[ed].channels;
/** Which module a page belongs to (for the "not in your edition" note). */
export function moduleOfRoute(path) {
  const p = (path || '/').replace(/\/$/, '') || '/';
  for (const [k, m] of Object.entries(MODULES)) if (m.routes.includes(p)) return k;
  const it = ALL_ITEMS.find((x) => pathOf(x) === p);
  if (it) for (const [k, m] of Object.entries(MODULES)) if (m.nav.includes(it.id)) return k;
  return null;
}
/** The editions that include a module, for "Available in …". */
export const editionsWith = (key) => EDITION_IDS.filter((e) => e !== 'full' && EDITIONS[e].modules.includes(key));
