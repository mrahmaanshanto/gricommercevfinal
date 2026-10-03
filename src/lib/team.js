// team — who is signed in (demo), the 13 staff roles and what each one can open.
//   USERS       the demo accounts on the sign-in page (one per role); `staff` links to the HR staff list when the
//               person is on it (attendance, leave and salary on their dashboard). A person can hold several roles
//               (`roles`, the first is `role`): what they can open is the union of those roles (brief #21).
//   ROLE_ACCESS menu item ids from src/shell/navigation.js each role sees ('*' = everything)
//   currentUser() / signInAs(id) / signOut()  — kept in this browser; SESSION_EVENT fires on change
//   rolesOf(u) · roleOf(u) (one role, or the roles merged: titles joined with " + ", access = union) · roleTitles(u)
//   navFor(u, { ed, plan, setup })  the menu resolved in the brief's order: role(s) → edition → stock setup →
//               plan (a module the plan lacks is `locked`, shown only to people who manage billing) → "Set up" state
//               (`setup` on an area, from lib/navSetup.js) → areas left with no page are dropped
//   pinsFor(u, nav) · landingChoices(u, nav) · homeOf(u)  the person's pins and start page (lib/navProfile.js)
// The side menu shows only the role's items; a page in the menu that the role cannot open shows a notice
// (components/RoleGuard.jsx). Front end only: there are no passwords in the demo.

import { NAV, NAV_ALIAS } from '../shell/navigation';
import { routeOf } from '../runtime/routes';
import { navForEdition, currentEditionId, hasModule, moduleOfNav } from './edition';
import { navForSetup, getStockSetup } from './stockSetup';
import { currentPlanId, entitled } from './plans';
import { landingOf, pinsOf } from './navProfile';

export const SESSION_KEY = 'gc.session';
export const SESSION_EVENT = 'gc:session';

// the items everyone has
const BASE = ['my-dash', 'tasks', 'team-chat'];

export const ROLES = {
  ceo: { title: 'CEO', icon: 'crown', tone: 'primary', blurb: 'Everything: sales, profit, cash, people and approvals.', access: '*' },
  cto: { title: 'CTO', icon: 'cpu', tone: 'info', blurb: 'Website, integrations, payment gateways, devices and automations.', access: ['connections', 'ch-woo', 'ch-shopify', 'ch-home', 'ch-meta', 'ch-gmc', 'ch-gbp', 'ch-issues', 'ch-settings', 'storefront', 'storefront-pages', 'storefront-wp', 'storefront-theme', 'storefront-nav', 'settings', 'set-store', 'set-all', 'set-wallet', 'set-billing', 'set-help', 'auto-rules', 'auto-builder', 'auto-settings', 'auto-reports', 'ta-track', 'ta-health', 'ta-conn', 'ta-setup', 'comm-conn', 'hr-devices', 'pos-settings', 'acc-setup', 'pay-setup', 'tickets', 'products-setup', 'rep-all', 'rep-daily'] },
  content: { title: 'Social media & content', icon: 'clapperboard', tone: 'secondary', blurb: 'Posts, blog, comments and the post calendar.', access: ['ch-gbp', 'comm-cal', 'comm-new', 'comm-conn', 'blog', 'blog-posts', 'blog-new', 'blog-cats', 'blog-authors', 'storefront-pages', 'products-media', 'promo-page', 'promo-flash', 'rep-marketing'] },
  orders: { title: 'Order management', icon: 'package-check', tone: 'warning', blurb: 'Confirm, pack, ship and follow up every order.', access: ['orders', 'orders-all', 'orders-work', 'orders-online', 'orders-pos', 'orders-wholesale', 'orders-rto', 'orders-courier', 'sales-invoices', 'sales-return', 'customers', 'leads', 'inbox', 'inbox-comments', 'inbox-mentions', 'calls', 'comm-ai', 'rec-carts', 'rec-auto', 'stock-holds', 'products-all', 'rep-online', 'rep-daily'] },
  comms: { title: 'Communications', icon: 'messages-square', tone: 'info', blurb: 'Inbox, calls, comments and support tickets.', access: ['inbox', 'inbox-comments', 'inbox-mentions', 'calls', 'tickets', 'comm-ai', 'comm-cal', 'customers', 'leads', 'orders', 'orders-all', 'orders-online', 'rec-carts', 'rep-marketing'] },
  ads: { title: 'Ads & tracking', icon: 'target', tone: 'error', blurb: 'Ad spend, return on ads, pixels, offers and campaigns.', access: ['ch-woo', 'ch-shopify', 'ch-home', 'ch-meta', 'ch-gmc', 'ch-issues', 'ta-track', 'ta-health', 'ta-conn', 'ta-setup', 'promo-home', 'promo-coupons', 'promo-flash', 'promo-page', 'rec-carts', 'rec-auto', 'rec-audiences', 'comm-conn', 'loy-home', 'loy-referrals', 'rep-marketing', 'rep-online', 'rep-customers'] },
  'wh-manager': { title: 'Warehouse manager', icon: 'warehouse', tone: 'warning', blurb: 'Stock, purchase, receiving, transfers and the warehouse team.', access: ['po-orders', 'po-receive', 'po-requests', 'po-buy', 'po-suppliers', 'stock-list', 'stock-activity', 'stock-holds', 'stock-adjust', 'stock-count', 'stock-transfers', 'stock-expiry', 'stock-wpol', 'stock-wclaims', 'stock-wh', 'stock-racks', 'stock-labels', 'products', 'products-all', 'products-inventory', 'products-low', 'products-barcodes', 'orders', 'orders-online', 'hr-time', 'hr-attendance', 'hr-shifts', 'hr-leave', 'rep-inventory', 'rep-purchase'] },
  'wh-supervisor': { title: 'Warehouse supervisor', icon: 'boxes', tone: 'slate', blurb: 'Picking, packing, receiving and counts on the floor.', access: ['po-receive', 'po-buy', 'stock-list', 'stock-holds', 'stock-count', 'stock-transfers', 'stock-expiry', 'stock-racks', 'stock-labels', 'orders', 'orders-online', 'products-low', 'hr-time', 'hr-attendance'] },
  'shop-manager': { title: 'Shop manager', icon: 'store', tone: 'success', blurb: 'Branch sales, counters, cash, stock and the shop team.', access: ['ch-gbp', 'sales', 'sales-new', 'sales-invoices', 'sales-return', 'orders', 'orders-pos', 'pos', 'pos-register', 'pos-counters', 'pos-shifts', 'pos-cash', 'customers', 'leads', 'stock-list', 'stock-transfers', 'stock-count', 'stock-branches', 'products', 'products-all', 'products-low', 'promo-coupons', 'loy-members', 'hr-time', 'hr-attendance', 'hr-shifts', 'hr-leave', 'rep-sales', 'rep-pos', 'rep-daily'] },
  'shop-supervisor': { title: 'Shop supervisor', icon: 'clipboard-check', tone: 'success', blurb: 'Counters, shifts, cash pickups and the floor.', access: ['sales', 'sales-new', 'sales-return', 'orders', 'orders-pos', 'pos', 'pos-register', 'pos-counters', 'pos-shifts', 'pos-cash', 'customers', 'stock-list', 'products-low', 'hr-time', 'hr-attendance', 'hr-shifts'] },
  seller: { title: 'Shop seller', icon: 'shopping-bag', tone: 'primary', blurb: 'Sell at the counter, look up stock, help customers.', access: ['sales', 'sales-new', 'sales-return', 'pos', 'pos-register', 'customers', 'products', 'products-all', 'stock-list', 'loy-members'] },
  hr: { title: 'HR', icon: 'contact', tone: 'secondary', blurb: 'People, attendance, leave, payroll and documents.', access: ['hr-home', 'hr-people', 'hr-staff', 'hr-add', 'hr-positions', 'hr-idcards', 'hr-time', 'hr-attendance', 'hr-shifts', 'hr-leave', 'hr-devices', 'hr-pay', 'hr-payroll', 'hr-statements', 'hr-changes', 'hr-gratuity', 'hr-loans', 'hr-setup', 'pos-shifts', 'acc-liab', 'rep-hr'] },
  'online-sales': { title: 'Online sales expert', icon: 'trending-up', tone: 'success', blurb: 'Leads, follow-ups, online orders and repeat buyers.', access: ['leads', 'orders', 'orders-all', 'orders-online', 'sales', 'sales-new', 'customers', 'inbox', 'inbox-comments', 'inbox-mentions', 'calls', 'rec-carts', 'rec-auto', 'promo-coupons', 'loy-home', 'loy-members', 'rep-online', 'rep-customers', 'rep-sales'] },
};

// [id, name, role, email, phone, staff code on the HR list (or ''), place, more roles]
const ROWS = [
  ['ceo', 'Mehedi Rahman', 'ceo', 'mehedi@gridshop.com.bd', '01711-000001', '', 'Head office'],
  ['cto', 'Tanvir Hossain', 'cto', 'tanvir@gridshop.com.bd', '01711-000002', '', 'Head office'],
  ['jannatul', 'Jannatul Ferdous', 'content', 'jannatul.f@gmail.com', '01404-XX8872', 'EMP-0161', 'Head office'],
  ['farhana', 'Farhana Yasmin', 'orders', 'orders@gridshop.com.bd', '01819-000004', '', 'Central Warehouse', ['comms']],
  ['lamia', 'Lamia Sultana', 'comms', 'lamia.sultana@gridshop.com.bd', '01521-XX4467', 'EMP-0137', 'Head office'],
  ['shakil', 'Shakil Ahmed', 'ads', 'ads@gridshop.com.bd', '01911-000006', '', 'Head office'],
  ['tareq', 'Tareq Aziz', 'wh-manager', 'tareq.aziz@gmail.com', '01556-XX7713', 'EMP-0133', 'Central Warehouse'],
  ['sabbir', 'Sabbir Hossain', 'wh-supervisor', 'sabbir@gridshop.com.bd', '01798-XX3301', 'EMP-0155', 'Central Warehouse'],
  ['rakib', 'Rakib Hasan', 'shop-manager', 'rakib.hasan@gridshop.com.bd', '01712-XX4410', 'EMP-0118', 'Dhanmondi branch', ['wh-supervisor']],
  ['sadia', 'Sadia Akter', 'shop-supervisor', 'sadia.akter@gmail.com', '01712-XX8821', 'EMP-0142', 'Dhanmondi branch'],
  ['rafi', 'Rafi Ahmed', 'seller', 'rafi.ahmed@gmail.com', '01819-XX2207', 'EMP-0151', 'Dhanmondi branch'],
  ['sharmin', 'Sharmin Akter', 'hr', 'hr@gridshop.com.bd', '01711-000012', '', 'Head office'],
  ['arafat', 'Arafat Hossain', 'online-sales', 'sales@gridshop.com.bd', '01611-000013', '', 'Head office'],
];
export const USERS = ROWS.map(([id, name, role, email, phone, staff, place, more = []]) => ({ id, name, role, roles: [role, ...more], email, phone, staff, place, initials: name.split(' ').map((x) => x[0]).slice(0, 2).join('') }));
export const userBy = (id) => USERS.find((u) => u.id === id) || null;
/** The role ids a person holds (the first is their main role). */
export const rolesOf = (u) => ((u && Array.isArray(u.roles) && u.roles.length ? u.roles : [(u || {}).role]).filter((r) => ROLES[r]));
/** The person's role; with several roles, one merged role: titles joined with " + ", access = the union. */
export function roleOf(u) {
  const ids = rolesOf(u);
  if (!ids.length) return ROLES.ceo;
  if (ids.length === 1) return ROLES[ids[0]];
  const list = ids.map((r) => ROLES[r]);
  return {
    ...list[0],
    title: list.map((r) => r.title).join(' + '),
    blurb: list.map((r) => r.blurb).join(' '),
    access: list.some((r) => r.access === '*') ? '*' : [...new Set(list.flatMap((r) => r.access))],
    roles: ids,
  };
}
export const roleTitles = (u) => rolesOf(u).map((r) => ROLES[r].title);
export const firstName = (u) => String((u || {}).name || '').split(' ')[0];

const ssr = () => typeof window === 'undefined';
/** The signed-in demo user (the CEO until someone signs in as another role). */
export function currentUser() {
  if (ssr()) return USERS[0];
  try { return userBy(window.localStorage.getItem(SESSION_KEY)) || USERS[0]; } catch { return USERS[0]; }
}
export function signInAs(id) {
  try { window.localStorage.setItem(SESSION_KEY, id); window.dispatchEvent(new CustomEvent(SESSION_EVENT)); } catch { /* ignore */ }
  return userBy(id);
}
export function signOut() {
  try { window.localStorage.removeItem(SESSION_KEY); window.dispatchEvent(new CustomEvent(SESSION_EVENT)); } catch { /* ignore */ }
}

// ---- access ----------------------------------------------------------------------------------------
/** Can this user see a menu item (by id)? With several roles: if any of them can. */
export function canSee(u, id) {
  const r = roleOf(u);
  if (r.access === '*') return true;
  if (BASE.includes(id)) return true;
  // an old menu id in a role's list still opens the item it was merged into
  return r.access.includes(id) || r.access.some((a) => NAV_ALIAS[a] === id);
}
/** Does this person manage the subscription (sees locked modules with "Upgrade")? */
export const managesBilling = (u) => canSee(u, 'set-billing');

/** The menu for the person's role(s): NAV with items (and children) they cannot see removed. */
function byRole(u) {
  if (roleOf(u).access === '*') return NAV;
  return NAV.map((g) => ({
    ...g,
    items: g.items.map((it) => {
      if (!it.children) return canSee(u, it.id) ? it : null;
      const kids = it.children.filter((c) => canSee(u, c.id));
      if (!kids.length) return canSee(u, it.id) ? { ...it, children: undefined } : null;
      return { ...it, children: kids };
    }).filter(Boolean),
  })).filter((g) => g.items.length);
}
const lockOf = (id, plan) => { const m = moduleOfNav(id); return m && !entitled(m, plan) ? m : null; };
/** Pages of modules the plan lacks: `locked` (with the module) for people who manage billing, else removed. */
function byPlan(nav, plan, admin) {
  return nav.map((g) => ({
    ...g,
    items: g.items.map((it) => {
      if (!it.children) { const m = lockOf(it.id, plan); return m ? (admin ? { ...it, locked: m } : null) : it; }
      const kids = it.children.map((c) => { const m = lockOf(c.id, plan); return m ? (admin && !c.hidden ? { ...c, locked: m } : null) : c; }).filter(Boolean);
      if (!kids.length) return null;
      const open = kids.filter((c) => !c.hidden && !c.locked);
      if (open.length) return { ...it, children: kids };
      // only hidden pages left (e.g. a role without the main Dashboard): the first one becomes the area's page
      const hid = kids.find((c) => c.hidden && !c.locked);
      if (hid) return { ...it, children: kids.map((c) => (c === hid ? { ...c, hidden: false, under: undefined } : c)) };
      const lk = kids.find((c) => c.locked);
      return lk ? { ...it, children: kids, locked: lk.locked } : null;
    }).filter(Boolean),
  })).filter((g) => g.items.length);
}
/** "Set up" on an area: setup = the checks still to do (lib/navSetup.js); shown to people who can open the fix. */
function bySetup(nav, setup, u, ed, plan) {
  const want = (setup || []).filter((s) => hasModule(s.module, ed) && entitled(s.module, plan) && canSee(u, s.fix));
  if (!want.length) return nav;
  return nav.map((g) => ({ ...g, items: g.items.map((it) => { const s = want.find((x) => x.area === it.id); return s && !it.locked ? { ...it, setup: s } : it; }) }));
}
/** Areas with no page left to list are dropped (never an empty area). */
const tidy = (nav) => nav.map((g) => ({
  ...g,
  items: g.items.filter((it) => (it.children ? it.children.some((c) => !c.hidden) : !!it.to)),
})).filter((g) => g.items.length);

/** The menu for a user, resolved: role(s) → edition → stock setup → plan → "Set up" state. */
export function navFor(u, { ed = currentEditionId(), plan = currentPlanId(), setup = [] } = {}) {
  const nav = navForSetup(navForEdition(byRole(u), ed), getStockSetup(ed));
  return tidy(bySetup(byPlan(nav, plan, managesBilling(u)), setup, u, ed, plan));
}
/** Does this role have work in the site's edition (anything beyond the shared tasks / chat / my dashboard)? */
export const hasWorkInEdition = (u) => navFor(u).some((g) => g.items.some((it) => (it.children || [it]).some((p) => !BASE.includes(p.id))));
const pathOf = (it) => (it.to ? routeOf(it.to).split('?')[0] : '');
/** Can this user open a page? Pages that are not in the menu (details, profiles) are always allowed. */
export function canOpen(u, path) {
  const r = roleOf(u);
  if (r.access === '*') return true;
  const all = NAV.flatMap((g) => g.items.flatMap((it) => [it, ...(it.children || [])]));
  const items = all.filter((it) => pathOf(it) === path);
  if (!items.length) return true;
  return items.some((it) => canSee(u, it.id));
}

// ---- the person's own shortcuts (lib/navProfile.js) ------------------------------------------------------
const pages = (nav) => nav.flatMap((g) => g.items.flatMap((it) => (it.children || []).filter((c) => !c.hidden && !c.locked).map((c) => ({ ...c, area: it }))));
export const hrefOfItem = (it) => (it.to ? routeOf(it.to) + (it.q ? '?' + it.q : '') : '');
/** The person's pinned pages that they can still open, in their order. */
export function pinsFor(u, nav = navFor(u)) {
  const list = pages(nav);
  return pinsOf(u && u.id).map((id) => list.find((p) => p.id === id)).filter(Boolean);
}
/** Start pages to choose from: every page the person can open, by area ({ area, items: [{ href, label }] }). */
export function landingChoices(u, nav = navFor(u)) {
  const out = [];
  nav.forEach((g) => g.items.forEach((it) => {
    const items = (it.children || []).filter((c) => !c.hidden && !c.locked).map((c) => ({ href: hrefOfItem(c), label: c.label }));
    if (items.length) out.push({ area: it.label, items });
  }));
  return out;
}
const DEFAULT_HOME = '/my-dashboard';
/** Where a user lands after signing in: their start page when they can still open it, else My dashboard. */
export function homeOf(u) {
  const want = landingOf(u && u.id);
  if (want && landingChoices(u).some((a) => a.items.some((x) => x.href === want))) return want;
  return DEFAULT_HOME;
}
