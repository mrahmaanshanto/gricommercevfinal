// proposal — switches that turn parts of Nayeem's proposal on inside the running app, so each change can be compared
// with today's build on the same page (docs/handoff-nayeem-merge.md › 5; the comparison is docs/proposal-vs-build.md).
// Every switch is off by default, and with all of them off the app is today's build.
//
//   FLAGS     every experiment in the backlog (handoff › 6): key, kind, label, briefs, decisions, today, target, size,
//             page (where it shows, for the Today / Proposal links) and built
//   isOn(key) · onKeys() · setFlag(key, on) · setFlags(keys) · allOff() · tabPinned() · followSwitches() · PROPOSAL_EVENT
// Two levels:
//   the switches   set on /dev/proposal, kept in this browser (gc.proposal); every tab follows them, open tabs at once
//   a ?p= link     ?p=nav,modes turns exactly those on, ?p=off is today's build, for that tab only and every page it opens
//                  next (gc.proposal.tab), so /x?p=off and /x?p=nav sit side by side without touching the switches
// Flipping a switch on /dev/proposal makes that tab follow the switches again.
// Only while developing, or on a build with NEXT_PUBLIC_SHOW_STORYBOARD=true (the same rule as the /dev pages);
// anywhere else every switch reads off, so the live sites can never show an experiment.
//
// An experiment checks isOn('<key>') (useProposal('<key>') in React, lib/useProposal.js) at the narrowest point: the menu
// builder, one screen's tab list. Set `built: true` when it does something; /dev/proposal only offers built switches.

export const PROPOSAL_EVENT = 'gc:proposal';
const KEY = 'gc.proposal';
const TAB_KEY = 'gc.proposal.tab';
/** Can switches be turned on in this build? */
export const PROPOSALS_AVAILABLE = process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_SHOW_STORYBOARD === 'true';

export const KINDS = {
  subtract: { label: 'Subtract', note: 'Remove a duplicate. Do these first: they make the build cleaner whatever is decided.' },
  merge: { label: 'Merge', note: 'Reshape or move what exists.' },
  add: { label: 'Add', note: 'A new workspace or engine, built thin on today’s libraries.' },
};

// Nayeem's 21 briefs: number → [business area, title], as headed in docs/proposal-vs-build.md › 5
export const BRIEFS = {
  1: ['Products', 'Product'], 2: ['Products', 'Inventory'], 3: ['Products', 'Purchase & Suppliers'],
  4: ['Orders', 'Sales, Orders, Fulfilment & Delivery'], 5: ['Finances', 'Payments & Settlement'],
  6: ['Finances', 'Finance & Cash Management'], 7: ['Customers', 'Customers & CRM'], 8: ['Orders', 'POS Register'],
  9: ['Customers', 'Loyalty, Promotions & Offers'], 10: ['Home', 'Merchant Dashboard & Overview'],
  11: ['Communications', 'Communications, Notifications & Campaigns'], 12: ['Orders', 'Support, Returns, Warranty & After-sales'],
  13: ['Customers', 'Recovery & Customer Intelligence'], 14: ['Analytics', 'Tracking, Analytics, Reports & Profitability'],
  15: ['Online Store', 'Storefront, Checkout, Landing Pages & Reviews'], 16: ['Platform', 'Settings, Billing & Merchant Configuration'],
  17: ['Home', 'Onboarding, Migration & Merchant Setup'], 18: ['Platform', 'Staff, HR, Roles & Security'],
  19: ['Platform', 'Grid Platform Console & Core Backend'], 20: ['Platform', 'Design System & Developer Reference'],
  21: ['Shell', 'Navigation Architecture'],
};

// The backlog, in the order to try it: subtract, then merge, then add (market priority). `decisions` are the row
// numbers in the comparison's section 8. `doc` points somewhere more exact than the first brief's section.
export const FLAGS = [
  // ---- subtract: remove duplicated concepts ----
  { key: 'one-promo', kind: 'subtract', size: 'M', page: '/coupons', briefs: [9], label: 'One promotion engine for coupon codes',
    today: 'Three code sets: Coupons list, POS (EIDSAVE10, WELCOME50) and Checkout (EID300)', target: 'One lib/promotions.js read by all three' },
  { key: 'one-customer', kind: 'subtract', size: 'L', page: '/all-customers', briefs: [7, 13], decisions: [26], label: 'One customer profile and a stable customer ID',
    today: 'Four profile pages (CRM, Recovery, wholesale, member), all keyed by phone', target: 'One profile with Insights and Company mode; the ID is not the phone' },
  { key: 'one-quiet-hours', kind: 'subtract', size: 'S', page: '/workflow-settings', briefs: [11, 13], decisions: [32], label: 'One message policy (quiet hours, caps)',
    today: 'Workflow settings and Auto reminders each have their own', target: 'One policy in Communications that both read' },
  { key: 'one-gateway-setup', kind: 'subtract', size: 'S', page: '/connections', briefs: [5, 16], label: 'One place to set up payment gateways',
    today: 'Settings › Payment Gateway, Money setup › Payment partners and Connections all open the setup', target: 'One Payments setup; the others link to it' },
  { key: 'one-role-model', kind: 'subtract', size: 'M', page: '/hr-setup', briefs: [18], decisions: [41], label: 'One role model',
    today: 'team.js roles (menu), hr.js login roles (staff record) and HR setup’s static table', target: 'One role list for the menu, staff and POS limits' },
  { key: 'analytics-real-numbers', kind: 'subtract', size: 'M', page: '/analytics-hub', briefs: [14], label: 'Analytics pages read the shared books',
    today: 'Tracking & analytics pages show static numbers that don’t match Reports', target: 'Fed from the sales book, profit and ad spend' },
  { key: 'settings-save', kind: 'subtract', size: 'M', page: '/set-general', briefs: [16], label: 'Settings forms that actually save',
    today: 'General, Delivery, SEO, Security, Storage, AI and Preference keep values only while open; delivery charge ৳130 vs ৳150', target: 'A small settings store; one delivery charge' },
  { key: 'no-legal-claims', kind: 'subtract', size: 'S', page: '/hr-setup', briefs: [1, 14, 18], label: 'Remove wording Nayeem flags',
    today: 'Labour Act lines, “PTA approved”, “Real return”, “raw data never leaves”, “Google still gets anonymous signals”', target: 'Neutral wording' },
  // ---- merge: reshape and move ----
  { key: 'nav', kind: 'merge', size: 'M', page: '/merchant-overview', briefs: [21], decisions: [3, 4], doc: '4-4-master-move-table-every-current-menu-item', label: 'Menu as business areas with page tabs',
    today: '10 groups with sub-menus in the sidebar (102 items)', target: '7 core areas + mode areas, sub-items as page tabs, Settings at the bottom' },
  { key: 'modes', kind: 'merge', size: 'M', page: '/subscription', briefs: [21, 17], decisions: [1], label: 'Combinable Online / Retail / Wholesale modes',
    today: 'Four fixed editions, each its own site', target: 'Tick modes in any mix on one account; editions stay as presets' },
  { key: 'one-home', kind: 'merge', size: 'M', page: '/merchant-overview', briefs: [10], decisions: [6], label: 'One role-aware Home',
    today: 'Home, Online Home, Connect Home and My dashboard', target: 'One Home ordered by role: attention → pulse → orders → money → stock → customers' },
  { key: 'order-views', kind: 'merge', size: 'M', page: '/merchant-orders', briefs: [4], decisions: [9, 10], label: 'Order tabs as working views',
    today: 'Order tabs are the saved statuses', target: 'Views worked out from status, payment, verification and packing; Payment shows “Unpaid · COD”' },
  { key: 'returns-home', kind: 'merge', size: 'S', page: '/return-exchange', briefs: [12], decisions: [14], label: 'Returns live under Orders › After-sales',
    today: 'Return & exchange page; courier returns and warranty claims under stock tools', target: 'After-sales tab with Returns, Warranty and Repairs; courier returns kept apart' },
  { key: 'warranty-to-product', kind: 'merge', size: 'S', page: '/warranty-policies', briefs: [1, 12], decisions: [25], label: 'Warranty policies under Catalog setup',
    today: 'Warranty policies under More stock tools', target: 'A Catalog setup section; claims go to After-sales' },
  { key: 'money-to-finances', kind: 'merge', size: 'M', page: '/accounts-home', briefs: [5, 6, 14], decisions: [35, 36], label: 'Money becomes Finances',
    today: 'Seven Money pages with P&L, VAT and payouts inside', target: 'Overview · Payments · Money & cash · Receivables · Reconciliation; P&L and VAT move out' },
  { key: 'analytics-area', kind: 'merge', size: 'S', page: '/reports-centre', briefs: [14], decisions: [39], label: 'Reports and Ads tracking become Analytics',
    today: 'Reports group; Marketing › Ads tracking', target: 'Analytics: Overview · Profitability · Marketing · Customers · Reports · Tracking' },
  { key: 'comms-area', kind: 'merge', size: 'M', page: '/merchant-inbox', briefs: [11], decisions: [5, 33], label: 'Customer support, Automation and order notifications become Communications',
    today: 'Customer support group; Automation; Settings › Notifications', target: 'Communications in every edition: Inbox · Calls · Campaigns · Automations · Templates · Delivery log' },
  { key: 'wallet-store-credit', kind: 'merge', size: 'M', page: '/wallet', briefs: [9], decisions: [28], label: 'Customer wallet becomes store credit',
    today: 'Wallet with cash top-up and cash-out, shown as money owed', target: 'Store credit only, no cash in or out' },
  { key: 'inventory-quantities', kind: 'merge', size: 'M', page: '/stock', briefs: [2], decisions: [18], label: 'Committed, unavailable and incoming stock',
    today: 'Stock shows on hand, held, available and in transit', target: 'Worked out from holds, the damaged bay and open purchase orders, plus a stock activity list' },
  // ---- add: new workspaces and engines, in market-priority order ----
  { key: 'after-sales', kind: 'add', size: 'L', page: '/return-exchange', briefs: [12], decisions: [14], label: 'After-sales cases',
    today: 'Return & exchange, warranty claims and support tickets apart', target: 'A case with items, inspection, remedy and SLA' },
  { key: 'roles-security', kind: 'add', size: 'L', page: '/hr-setup', briefs: [18], decisions: [41], label: 'Roles & Security',
    today: 'Access lives in HR and the demo roles', target: 'Roles matrix, access policy, sessions and audit, without HR' },
  { key: 'setup-migration', kind: 'add', size: 'L', page: '/stock-setup', briefs: [17], decisions: [8], label: 'Setup & Migration',
    today: 'Stock setup page and its banner', target: 'A checklist from owner facts and a CSV import with a dry run' },
  { key: 'payments-ops', kind: 'add', size: 'M', page: '/settlements', briefs: [5], decisions: [35], label: 'Payments Operations',
    today: 'Payouts and refunds spread over Money pages', target: 'One page for transactions, refunds and settlements' },
  { key: 'assisted-order', kind: 'add', size: 'M', page: '/new-order', briefs: [4], decisions: [12], label: 'Assisted New Order',
    today: 'New order (online) and New sale (POS) apart', target: 'Hold and resume, barcode, shortcuts and a B2B quote mode' },
  { key: 'segments', kind: 'add', size: 'L', page: '/all-customers', briefs: [7, 13], label: 'One segment engine and consent fields',
    today: 'Saved views on All customers', target: 'One segment engine; consent kept apart from preference' },
  { key: 'campaigns', kind: 'add', size: 'L', page: '/merchant-inbox', briefs: [11], label: 'Messaging Campaigns',
    today: 'Broadcast in the inbox composer', target: 'Segment → template → schedule → results' },
  { key: 'stock-activity', kind: 'add', size: 'S', page: '/stock', briefs: [2], label: 'Stock activity list',
    today: 'Stock moves are stored but not listed in one place', target: 'Every move, filterable' },
  { key: 'quick-create', kind: 'add', size: 'M', page: '/merchant-overview', briefs: [21], label: '“+ Create” menu and command search',
    today: 'Top-bar search with a scope', target: '+ Create and Ctrl/Cmd+K search that reach everything' },
  { key: 'storefront', kind: 'add', size: 'L', page: '/landing-page-builder', briefs: [15], decisions: [40], label: 'Storefront, checkout and reviews',
    today: 'Landing page builder; WooCommerce and Shopify sync', target: 'Storefront & Theme, Checkout & Account and Reviews workspaces' },
];

const KEYS = new Set(FLAGS.map((f) => f.key));
export const flagBy = (key) => FLAGS.find((f) => f.key === key) || null;

/** The heading id of a section in docs/proposal-vs-build.md (the same ids its own links use). */
export const slugOf = (text) => String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
/** Where a brief is discussed in the comparison (#21 is the whole of section 4). */
export const briefAnchor = (n) => (n === 21 ? slugOf('4. Navigation and UX: what moves where') : slugOf(`${BRIEFS[n][0]} · #${n} ${BRIEFS[n][1]}`));
const DECISION_GROUPS = [[8, '8.1 Product shape and navigation'], [17, '8.2 Orders, POS and returns'], [25, '8.3 Products, stock and buying'], [34, '8.4 Customers, marketing and communications'], [44, '8.5 Money, analytics, storefront, staff and platform']];
/** The section 8 table that holds a decision row. */
export const decisionAnchor = (n) => slugOf((DECISION_GROUPS.find(([last]) => n <= last) || DECISION_GROUPS[0])[1]);
export const docAnchor = (f) => f.doc || briefAnchor(f.briefs[0]);

// ---- which switches are on ---------------------------------------------------------------------------
const clean = (list) => [...new Set(list)].filter((k) => KEYS.has(k));
const parse = (raw) => (raw === 'off' || raw === 'none' ? [] : clean(raw.split(',').map((s) => s.trim()).filter(Boolean)));
const read = () => { try { const v = JSON.parse(window.localStorage.getItem(KEY)); return Array.isArray(v) ? clean(v) : []; } catch { return []; } };
const write = (keys) => { try { if (keys.length) window.localStorage.setItem(KEY, JSON.stringify(keys)); else window.localStorage.removeItem(KEY); } catch { /* private mode: this page only */ } };
// this tab's set from a ?p= link: null = none, [] = today's build
const readTab = () => { try { const v = JSON.parse(window.sessionStorage.getItem(TAB_KEY)); return Array.isArray(v) ? clean(v) : null; } catch { return null; } };
const writeTab = (keys) => { try { if (keys) window.sessionStorage.setItem(TAB_KEY, JSON.stringify(keys)); else window.sessionStorage.removeItem(TAB_KEY); } catch { /* ignore */ } };
const inOrder = (keys) => FLAGS.filter((f) => keys.includes(f.key)).map((f) => f.key);

/** The switches on for this page, in backlog order. */
export function onKeys() {
  if (!PROPOSALS_AVAILABLE || typeof window === 'undefined') return [];
  const q = new URLSearchParams(window.location.search).get('p');
  if (q != null) { const keys = parse(q); writeTab(keys); return inOrder(keys); }
  return inOrder(readTab() || read());
}
export const isOn = (key) => onKeys().includes(key);

/** Is this tab following a ?p= link instead of the switches? */
export const tabPinned = () => PROPOSALS_AVAILABLE && typeof window !== 'undefined' && (new URLSearchParams(window.location.search).has('p') || readTab() !== null);

/** Set the switches (everything not listed off). This tab follows them again: ?p= leaves the address. */
export function setFlags(keys) {
  if (!PROPOSALS_AVAILABLE || typeof window === 'undefined') return;
  write(clean(keys));
  writeTab(null);
  const url = new URL(window.location.href);
  if (url.searchParams.has('p')) { url.searchParams.delete('p'); window.history.replaceState(null, '', url.pathname + url.search + url.hash); }
  window.dispatchEvent(new CustomEvent(PROPOSAL_EVENT));
}
export function setFlag(key, on) {
  const now = onKeys().filter((k) => k !== key);
  setFlags(on ? [...now, key] : now);
}
/** Back to today's build. */
export const allOff = () => setFlags([]);
/** Drop this tab's ?p= link and follow the switches. */
export const followSwitches = () => setFlags(read());

/** The same page with exactly these switches on (`[]` = today's build), for links that compare the two. */
export function linkWith(path, keys) {
  const [base, query = ''] = String(path).split('?');
  const qs = new URLSearchParams(query);
  qs.set('p', keys.length ? keys.join(',') : 'off');
  return `${base}?${qs.toString().replace(/%2C/g, ',')}`;
}

// another tab flipped a switch: tell this tab's listeners
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => { if (e.key === KEY || e.key === null) window.dispatchEvent(new CustomEvent(PROPOSAL_EVENT)); });
}
