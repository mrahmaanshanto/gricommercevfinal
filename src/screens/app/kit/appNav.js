// appNav — the mobile app's map: the tab bar and the More hub, by edition and by person.
// The app is the merchant panel on a phone for the day's work (no store design, automation builders, menu or role
// setup). It follows the web panel's rules: a page shows when the edition has its module (lib/edition.js › MODULES)
// and the person's role can open the web page it stands for (lib/team.js › navFor: role → edition → stock setup →
// plan; a page the plan locks is left out).
//
//   APP_ROUTES[route]  { label, icon, group, module, nav, any }
//       label   text (or (ctx) => text, e.g. "Purchases" in the Online edition)
//       icon    a name from AppKit's ICONS
//       module  the edition module the page needs (null: every edition)
//       nav     web menu ids the page stands for; the person needs one of them (null: everyone)
//   GROUPS             the More hub's groups in order: [{ key, label, routes: [...] }]
//   ROUTES_BUILT       the app routes that exist. The lead adds a route here when its screen lands; More, Home's
//                      quick actions and the tab bar never link to a route that is not in it.
//   appContext()       { user, ed, ids } for the signed-in person (call after mount; ids = web menu ids they see)
//   canUse(route, ctx) is the route built, in the edition and open to the person?
//   moreGroups(ctx)    GROUPS with the usable routes only: [{ key, label, items: [{ href, label, icon }] }]
//   tabsFor(ctx)       the tab bar: Home · Orders (Sales in the Retail edition) · Inbox (editions with comms) ·
//                      Stock · More → [{ key, href, label, icon, count }] (count: 'orders' | 'inbox' | undefined)
//   tabCounts()        { orders, inbox }: new online orders waiting (On hold / Processing / Pending) and chats
//                      with unread messages (lib/liveCounts.js)
//   tabOf(path)        which tab a route belongs to (detail pages light their list's tab)
//   routeLabel(route, ctx) · routeIcon(route)

import { hasModule, currentEditionId } from '@/lib/edition';
import { currentUser, navFor } from '@/lib/team';
import { getOrders, isCounterSale } from '@/lib/orders';
import { NEW_KEYS } from '@/lib/orderStatus';
import { liveCount } from '@/lib/liveCounts';

export const APP_ROUTES = {
  '/m-home': { label: 'Home', icon: 'home', module: null, nav: null },
  '/m-more': { label: 'More', icon: 'grid', module: null, nav: null },
  // reached from other screens (quick actions, lists), not listed in More
  '/m-product-edit': { label: 'Add product', icon: 'box', module: 'catalog', nav: ['products-add', 'products-all'] },
  '/m-purchase-new': { label: 'New purchase', icon: 'clipboard', module: 'catalog', nav: ['po-orders', 'po-buy'] },
  // Sell
  '/m-orders': { label: (c) => (c && !hasModule('online', c.ed) ? 'Sales' : 'Orders'), icon: 'bag', group: 'sell', module: 'commerce', nav: ['orders-all'] },
  '/m-new-order': { label: 'New order', icon: 'plus', group: 'sell', module: 'online', nav: ['orders-all'] },
  '/m-customers': { label: 'Customers', icon: 'users', group: 'sell', module: 'core', nav: ['customers'] },
  '/m-pos': { label: 'POS register', icon: 'cart', group: 'sell', module: 'pos', nav: ['pos-register'] },
  '/m-return': { label: 'Return or exchange', icon: 'undo', group: 'sell', module: 'commerce', nav: ['sales-return', 'pos-register'] },
  '/m-calls': { label: 'Calls', icon: 'phone', group: 'sell', module: 'comms', nav: ['calls'] },
  // Stock
  '/m-products': { label: 'Products', icon: 'box', group: 'stock', module: 'catalog', nav: ['products-all'] },
  '/m-stock': { label: 'Stock', icon: 'layers', group: 'stock', module: 'catalog', nav: ['stock-list'] },
  '/m-scan': { label: 'Scan', icon: 'scan', group: 'stock', module: 'catalog', nav: ['stock-list', 'products-all', 'pos-register'] },
  '/m-purchase': { label: (c) => (c && !hasModule('purchasing', c.ed) ? 'Purchases' : 'Purchase orders'), icon: 'clipboard', group: 'stock', module: 'catalog', nav: ['po-orders', 'po-buy'] },
  '/m-receive': { label: 'Receive goods', icon: 'download', group: 'stock', module: 'purchasing', nav: ['po-receive'] },
  '/m-transfers': { label: 'Transfers', icon: 'arrows', group: 'stock', module: 'places', nav: ['stock-transfers'] },
  '/m-adjust': { label: 'Adjust & count', icon: 'edit', group: 'stock', module: 'catalog', nav: ['stock-adjust', 'stock-count'] },
  // Messages
  '/m-inbox': { label: 'Inbox', icon: 'chat', group: 'messages', module: 'comms', nav: ['inbox', 'inbox-comments', 'inbox-mentions'] },
  '/m-gridai': { label: 'GridAI', icon: 'sparkles', group: 'messages', module: 'gridai', nav: ['ai-assistant'] },
  '/m-social': { label: 'Social posts', icon: 'megaphone', group: 'messages', module: 'comms', nav: ['comm-cal', 'comm-new'] },
  // Money
  '/m-finance': { label: 'Finance', icon: 'wallet', group: 'money', module: 'money', nav: ['acc-home', 'acc-money'] },
  '/m-payouts': { label: 'Payouts', icon: 'cash', group: 'money', module: 'money', nav: ['acc-settle'] },
  '/m-dues': { label: 'Dues', icon: 'receipt', group: 'money', module: 'money', nav: ['acc-dues', 'sales-invoices'] },
  '/m-expense-new': { label: 'Add expense', icon: 'minus', group: 'money', module: 'money', nav: ['acc-spend'] },
  '/m-reports': { label: 'Reports', icon: 'chart', group: 'money', module: 'reports', nav: ['rep-all', 'rep-daily'] },
  // Team
  '/m-hr': { label: 'Staff & HR', icon: 'briefcase', group: 'team', module: 'hr', nav: ['hr-home', 'hr-attendance', 'hr-leave', 'hr-time'] },
  '/m-tasks': { label: 'Tasks', icon: 'tasks', group: 'team', module: 'core', nav: ['tasks'] },
  // Settings
  '/m-settings': { label: 'Settings', icon: 'gear', group: 'settings', module: null, nav: null },
  '/m-tickets': { label: 'Support', icon: 'ticket', group: 'settings', module: 'comms', nav: ['tickets'] },
  '/m-notifications': { label: 'Notifications', icon: 'bell', group: 'settings', module: null, nav: null },
};

export const GROUPS = [
  { key: 'sell', label: 'Sell', routes: ['/m-orders', '/m-new-order', '/m-customers', '/m-pos', '/m-return', '/m-calls'] },
  { key: 'stock', label: 'Stock', routes: ['/m-products', '/m-stock', '/m-scan', '/m-purchase', '/m-receive', '/m-transfers', '/m-adjust'] },
  { key: 'messages', label: 'Messages', routes: ['/m-inbox', '/m-gridai', '/m-social'] },
  { key: 'money', label: 'Money', routes: ['/m-finance', '/m-payouts', '/m-dues', '/m-expense-new', '/m-reports'] },
  { key: 'team', label: 'Team', routes: ['/m-hr', '/m-tasks'] },
  { key: 'settings', label: 'Settings', routes: ['/m-settings', '/m-tickets', '/m-notifications'] },
];

/** App routes whose screens exist. Add a route here when its screen is built. */
export const ROUTES_BUILT = new Set([
  '/m-home', '/m-more',
  '/m-orders', '/m-new-order', '/m-order-detail', '/m-calls',
  '/m-products', '/m-product-edit', '/m-stock', '/m-scan', '/m-purchase', '/m-purchase-new', '/m-purchase-detail',
  '/m-inbox', '/m-chat',
  '/m-tickets', '/m-ticket-detail', '/m-ticket-new', '/m-notifications', '/m-call-settings',
  '/m-finance', '/m-payouts', '/m-dues', '/m-expense-new', '/m-reports', '/m-report',
  '/m-customers', '/m-customer',
  '/m-social', '/m-post-new', '/m-hr', '/m-tasks', '/m-task',
  '/m-settings', '/m-profile', '/m-settings-devices',
  '/m-receive', '/m-transfers', '/m-adjust', '/m-pos', '/m-return',
  '/m-gridai', '/m-call-active',
]);

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };

/** The web menu ids a person can open in an edition (locked pages left out). */
function visibleIds(user, ed) {
  const ids = new Set();
  safe(() => navFor(user, { ed }), []).forEach((g) => g.items.forEach((it) => {
    if (!it.locked) ids.add(it.id);
    (it.children || []).forEach((c) => { if (!c.locked) ids.add(c.id); });
  }));
  return ids;
}

/** Who is using the app and in which edition. Read after mount (browser storage). */
export function appContext() {
  const ed = safe(() => currentEditionId(), 'full');
  const user = safe(() => currentUser(), null);
  return { ed, user, ids: visibleIds(user, ed) };
}

const ctxOf = (ctx) => ctx || appContext();

/** Is the route built, in the edition and open to the person? */
export function canUse(route, ctx) {
  const r = APP_ROUTES[route];
  if (!r || !ROUTES_BUILT.has(route)) return false;
  const c = ctxOf(ctx);
  if (r.module && !hasModule(r.module, c.ed)) return false;
  // everyone on the staff list has their own HR page (check in, leave, payslips), even without the web's HR pages
  if (route === '/m-hr' && c.user && c.user.staff) return true;
  if (!r.nav) return true;
  return r.nav.some((id) => c.ids.has(id));
}

export const routeLabel = (route, ctx) => { const r = APP_ROUTES[route]; if (!r) return ''; return typeof r.label === 'function' ? r.label(ctx) : r.label; };
export const routeIcon = (route) => (APP_ROUTES[route] || {}).icon || 'grid';

/** The More hub: groups with the routes this person can use in this edition. */
export function moreGroups(ctx) {
  const c = ctxOf(ctx);
  return GROUPS.map((g) => ({
    key: g.key,
    label: g.label,
    items: g.routes.filter((r) => canUse(r, c)).map((r) => ({ href: r, label: routeLabel(r, c), icon: routeIcon(r) })),
  })).filter((g) => g.items.length);
}

/** The tab bar for this person and edition. */
export function tabsFor(ctx) {
  const c = ctxOf(ctx);
  return [
    { key: 'home', href: '/m-home', label: 'Home', icon: 'home' },
    canUse('/m-orders', c) && { key: 'orders', href: '/m-orders', label: routeLabel('/m-orders', c), icon: 'bag', count: hasModule('online', c.ed) ? 'orders' : undefined },
    canUse('/m-inbox', c) && { key: 'inbox', href: '/m-inbox', label: 'Inbox', icon: 'chat', count: 'inbox' },
    canUse('/m-stock', c) && { key: 'stock', href: '/m-stock', label: 'Stock', icon: 'layers' },
    { key: 'more', href: '/m-more', label: 'More', icon: 'grid' },
  ].filter(Boolean);
}

/** The live numbers on the tab bar. */
export function tabCounts() {
  if (typeof window === 'undefined') return { orders: 0, inbox: 0 };
  const orders = safe(() => getOrders().filter((o) => !isCounterSale(o) && NEW_KEYS.includes(o.statusKey)).length, 0);
  const inbox = safe(() => liveCount('chats'), 0) || 0;
  return { orders, inbox };
}

// detail and create pages light the tab of their list
const TAB_OF = {
  '/m-home': 'home',
  '/m-orders': 'orders', '/m-order-detail': 'orders', '/m-new-order': 'orders',
  '/m-inbox': 'inbox', '/m-chat': 'inbox',
  '/m-stock': 'stock', '/m-transfers': 'stock', '/m-adjust': 'stock', '/m-receive': 'stock',
  '/m-products': 'stock', '/m-product-edit': 'stock', '/m-scan': 'stock',
  '/m-customers': 'orders', '/m-customer': 'orders',
};
/** The tab a route belongs to ('more' for everything reached from the More hub). */
export function tabOf(path) {
  const p = String(path || '').split('?')[0].replace(/\/$/, '');
  return TAB_OF[p] || 'more';
}
