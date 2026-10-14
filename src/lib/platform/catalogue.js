// platform/catalogue — what GridCommerce sells and who works in the console.
//   LADDERS               what a store buys first: one of the product's editions (lib/edition.js: Online, Retail,
//                         Retail + Online, Connect). Each has the product's three plans (lib/plans.js: Starter,
//                         Growth, Business); prices and limits live in the versioned plan catalogue (db().plans,
//                         seeded from basePlans())
//   SETS · MODULES        the product's modules (lib/edition.js › MODULES) and the console's feature codes (M01 …),
//                         each feature filed under the product module it belongs to. Wholesale is hidden while
//                         edition.js › WHOLESALE is off.
//   ADDONS                modules and items billed on their own (Merchant page › Add a module or item)
//   STAFF · ROLES · can() console staff, their role and what the role may do (Staff and roles screen)
//   REASONS · METHODS · VIA · SOURCES · CATEGORIES · DISTRICTS   the lists the forms offer
// The editions and plans are read from the merchant product as plain data (names and module lists) so the super
// admin sells exactly what the product is; nothing else of the merchant panel is read here.

import { startOfMonth } from './util';
import { EDITIONS, MODULES as PRODUCT_MODULES, WHOLESALE } from '../edition';
import { PLANS as PRODUCT_PLANS, PLAN_IDS as PRODUCT_PLAN_IDS, entitled } from '../plans';

// ---- editions (ladders) --------------------------------------------------------------------------------------------
const shortName = (ed) => String(EDITIONS[ed].name).replace(/^GridCommerce\s*/, '') || EDITIONS[ed].short;
/** The editions a store can buy. `id` is the console's key (kept short), `edition` the product's edition id. */
export const LADDERS = [
  { id: 'online', edition: 'online', label: shortName('online') },
  { id: 'retail', edition: 'retail-wholesale', label: shortName('retail-wholesale') },
  { id: 'retail-online', edition: 'retail-online', label: shortName('retail-online') },
  { id: 'connect', edition: 'comms', label: shortName('comms') },
];
export const LADDER_IDS = LADDERS.map((l) => l.id);
export const ladderLabel = (id) => (LADDERS.find((l) => l.id === id) || {}).label || id;
/** The product edition id of a ladder ('retail' → 'retail-wholesale'). */
export const editionOf = (id) => (LADDERS.find((l) => l.id === id) || {}).edition || id;
/** What a store on this ladder sells through (the edition's channels): ['Online'] · ['Retail'] · ['Retail', 'Online'] … */
export const channelsOf = (id) => (EDITIONS[editionOf(id)] || { channels: [] }).channels.slice();
/** Does the edition use this product module? */
export const inEdition = (id, module) => ((EDITIONS[editionOf(id)] || { modules: [] }).modules).includes(module);

// ---- plans -----------------------------------------------------------------------------------------------------------
export const PLAN_IDS = PRODUCT_PLAN_IDS.slice();
export const PLAN_NAME = Object.fromEntries(PLAN_IDS.map((p) => [p, PRODUCT_PLANS[p].name]));
export const planIdByName = (name) => PLAN_IDS.find((p) => PLAN_NAME[p] === name) || null;

// ---- modules ---------------------------------------------------------------------------------------------------------
/** The product's modules on sale (wholesale only while it is switched on). */
export const PRODUCT_MODULE_IDS = Object.keys(PRODUCT_MODULES).filter((k) => k !== 'wholesale' || WHOLESALE);
export const SETS = [
  { id: 'platform', label: 'Platform core', sub: 'Runs in every store', always: true },
  ...PRODUCT_MODULE_IDS.map((k) => ({ id: k, label: PRODUCT_MODULES[k].label, sub: PRODUCT_MODULES[k].desc, product: true })),
  { id: 'credits', label: 'Credit add-ons', sub: 'Bought as credits' },
  { id: 'service', label: 'Service add-on', sub: 'Managed service' },
];
export const setLabelOf = (id) => (SETS.find((s) => s.id === id) || {}).label || id;

// feature code · name · the product module it belongs to ('platform' = runs everywhere, 'service' = a paid service)
export const MODULES = [
  ['F1', 'Multi-tenancy', 'platform'], ['F3', 'Plans', 'platform'], ['F2', 'Billing', 'platform'], ['B1', 'Design system', 'platform'],
  ['S4', 'Roles', 'platform'], ['S8', 'Onboarding', 'platform'], ['S9', 'Merchant notices', 'platform'], ['S3', 'Notifications', 'platform'],
  ['M01', 'Dashboard', 'core'], ['S1', 'Customer record', 'core'], ['M22', 'Customer CRM', 'core'], ['M24', 'Staff access', 'core'],
  ['M07', 'Products', 'catalog'], ['M15', 'Stock ledger', 'catalog'], ['M28', 'Warranty', 'catalog'],
  ['M05', 'Warehouse', 'places'], ['M13', 'Purchasing', 'purchasing'],
  ['M17', 'Payments', 'money'], ['M16', 'Cash and expenses', 'money'],
  ['S2', 'Reports', 'reports'], ['G2', 'Analytics', 'reports'],
  ['M19', 'HR and payroll', 'hr'],
  ['M25', 'Manual order', 'commerce'], ['M18', 'Returns', 'commerce'], ['M26', 'Bulk actions', 'commerce'],
  ['M21', 'Promotions', 'marketing'], ['M20', 'Loyalty', 'marketing'],
  ['M04', 'POS', 'pos'], ['M03', 'Counter sales', 'pos'],
  ['M14', 'Wholesale dues', 'wholesale'], ['M27', 'Partners', 'wholesale'],
  ['M06', 'Checkout', 'online'], ['M02', 'Online orders', 'online'], ['M23', 'Quick order link', 'online'], ['M08', 'Courier and COD', 'online'],
  ['M11', 'Themes', 'online'], ['M12', 'Landing pages', 'online'], ['M10', 'SEO', 'online'], ['M09', 'Reviews', 'online'],
  ['G1', 'Server tracking', 'online'], ['G4', 'Cart recovery', 'online'],
  ['M29', 'Product sync', 'channels'],
  ['G3', 'Inbox', 'comms'], ['G6', 'Blasts', 'comms'], ['S7', 'Support tickets', 'comms'],
  ['G5', 'AI products', 'gridai'],
  ['M30', 'Automation rules', 'automation'],
  ['S6', 'Migration', 'service'],
].filter(([, , set]) => set !== 'wholesale' || WHOLESALE).map(([code, name, set]) => ({ code, name, set }));
export const moduleBy = (code) => MODULES.find((m) => m.code === code) || null;

/** What a set does in a plan: 'Included' · 'Locked · upgrade' · 'Add-on' · 'Hidden'. */
export const SET_STATES = ['Included', 'Locked · upgrade', 'Add-on', 'Hidden'];
export const LIMIT_KEYS = [
  ['orders', 'Orders a month', 'orders'], ['products', 'Products', 'products'], ['seats', 'Staff seats', 'seats'],
  ['storage', 'Storage', 'GB'], ['couriers', 'Courier connections', 'couriers'], ['pages', 'Landing pages', 'pages'],
  ['sms', 'SMS included', 'a month'], ['ai', 'AI product credits', 'a month'],
];
export const UNLIMITED = 999999;

/** Modules sold on their own when the plan does not include them (the add-on that brings it). */
const ADDON_FOR = { places: 'M05', hr: 'M19' };
/** What a product module does in a plan of an edition, from the product's own plan list (lib/plans.js). */
export function ruleFor(ladder, plan, set) {
  if (set === 'platform') return 'Included';
  if (set === 'credits' || set === 'service') return 'Add-on';
  if (!inEdition(ladder, set)) return 'Hidden';
  if (entitled(set, plan)) return 'Included';
  return ADDON_FOR[set] ? 'Add-on' : 'Locked · upgrade';
}

// Prices per edition (৳ a month · a year). Yearly is about ten months' price.
const PRICES = {
  online: { starter: [1000, 10000], growth: [2500, 25000], business: [5000, 50000] },
  retail: { starter: [1000, 10000], growth: [2500, 25000], business: [5000, 50000] },
  'retail-online': { starter: [1500, 15000], growth: [3500, 35000], business: [7000, 70000] },
  connect: { starter: [800, 8000], growth: [1800, 18000], business: [3500, 35000] },
};
const TAGLINE = {
  starter: 'Sell with the everyday core of the edition.',
  growth: 'Adds stock places, purchase orders, marketing, sales channels and automation.',
  business: 'Every module of the edition, Staff & HR included.',
};

/** The plan catalogue as first published: one entry per edition, each with its versions. */
export function basePlans(anchor) {
  const sets = (ladder, plan) => Object.fromEntries(SETS.filter((s) => s.id !== 'service').map((s) => [s.id, ruleFor(ladder, plan, s.id)]));
  const plans = (ladder, v) => {
    const pr = PRICES[ladder];
    return {
      starter: {
        name: PLAN_NAME.starter, price: pr.starter[0], yearly: pr.starter[1], setup: 0, trialDays: 15, visibility: 'Public',
        tagline: TAGLINE.starter, sets: sets(ladder, 'starter'),
        limits: { orders: 500, products: 200, seats: 2, storage: 5, couriers: 1, pages: 2, sms: 500, ai: 0 },
        warnAt: 80, topup: 300, atLimit: 'block',
      },
      growth: {
        name: PLAN_NAME.growth, price: pr.growth[0], yearly: ladder === 'online' && v >= 3 ? 27000 : pr.growth[1], setup: 0, trialDays: 15, visibility: 'Public',
        tagline: TAGLINE.growth, sets: sets(ladder, 'growth'),
        limits: { orders: ladder === 'online' && v >= 3 ? 2500 : 2000, products: 2000, seats: 5, storage: 25, couriers: 3, pages: 10, sms: 1000, ai: 100 },
        warnAt: 80, topup: 300, atLimit: 'block',
      },
      business: {
        name: PLAN_NAME.business, price: pr.business[0], yearly: pr.business[1], setup: 0, trialDays: 15, visibility: 'Public',
        tagline: TAGLINE.business, sets: sets(ladder, 'business'),
        limits: { orders: 10000, products: UNLIMITED, seats: 15, storage: 100, couriers: UNLIMITED, pages: 50, sms: 5000, ai: 500 },
        warnAt: 80, topup: 300, atLimit: 'block',
      },
    };
  };
  const sep1 = startOfMonth(anchor);
  const NOTE = { 1: 'First prices', 2: 'Prices checked, no change', 3: 'Growth orders 2,000 → 2,500; yearly ৳25,000 → ৳27,000' };
  const v = (n, liveFrom, ladder, note) => ({ v: n, liveFrom, plans: plans(ladder, n), by: 'Mahin Khan', approvedBy: 'Nusrat Islam', note: note || NOTE[n] });
  const year = 365 * 864e5;
  return {
    online: { live: 3, versions: [v(1, sep1 - 2 * year, 'online'), v(2, sep1 - year, 'online'), v(3, sep1, 'online')] },
    retail: { live: 2, versions: [v(1, sep1 - 2 * year, 'retail'), v(2, sep1 - 200 * 864e5, 'retail')] },
    'retail-online': { live: 1, versions: [v(1, sep1 - 2 * year, 'retail-online', 'First prices for Retail + Online')] },
    connect: { live: 1, versions: [v(1, sep1 - 2 * year, 'connect', 'First prices for Connect')] },
  };
}

/** Billed on their own, on top of the plan. */
export const ADDONS = [
  { code: 'M05', label: 'Warehouse (M05)', name: 'Warehouse (M05)', kind: 'module', price: 1000, period: 'Monthly' },
  { code: 'M19', label: 'HR and payroll (M19)', name: 'HR and payroll (M19)', kind: 'module', price: 1500, period: 'Monthly' },
  { code: 'G5', label: 'AI product creation (G5)', name: 'AI product creation (G5)', kind: 'module', price: 800, period: 'Monthly' },
  { code: 'G3', label: 'Inbox and automation (G3)', name: 'Inbox and automation (G3)', kind: 'module', price: 1200, period: 'Monthly' },
  { code: 'SMS', label: 'SMS credits pack', name: 'SMS credits · 10,000 pack', kind: 'credits', price: 600, period: 'Monthly' },
  { code: 'LP5', label: 'Landing pages +5', name: '5 extra landing pages', kind: 'oneoff', price: 300, period: 'Once' },
  { code: 'S6', label: 'Assisted migration (S6)', name: 'Assisted migration (S6)', kind: 'oneoff', price: 5000, period: 'Once' },
];
export const addonBy = (code) => ADDONS.find((a) => a.code === code) || null;
/** Module trials offered on the Merchant page. */
export const TRIALABLE = [
  { code: 'M19', label: 'HR and payroll (M19)', price: 1500 },
  { code: 'G5', label: 'AI product creation (G5)', price: 800 },
  { code: 'G3', label: 'Inbox and automation (G3)', price: 1200 },
  { code: 'M05', label: 'Warehouse (M05) · extend', price: 1000 },
  { code: 'ONLINE', label: 'Online set (storefront, checkout, courier)', price: 1000 },
];

// ---- people ----------------------------------------------------------------------------------------
// areas: merchants · pin · tickets · crm · billing · packaging · ops · staff — 'edit' | 'view' | 'approve' | null
export const ROLES = {
  admin: { title: 'Admin', areas: { merchants: 'edit', pin: 'edit', tickets: 'edit', crm: 'edit', billing: 'edit', packaging: 'edit', ops: 'edit', staff: 'edit' } },
  ops: { title: 'Operations', areas: { merchants: 'view', pin: 'view', tickets: 'view', crm: 'view', billing: 'view', packaging: 'view', ops: 'edit', staff: 'view' } },
  support: { title: 'Support', areas: { merchants: 'edit', pin: 'edit', tickets: 'edit', crm: 'view', billing: 'view', packaging: 'view', ops: null, staff: null } },
  sales: { title: 'Sales', areas: { merchants: 'view', pin: 'view', tickets: null, crm: 'edit', billing: 'view', packaging: null, ops: null, staff: null } },
  finance: { title: 'Finance', areas: { merchants: 'view', pin: null, tickets: null, crm: 'view', billing: 'approve', packaging: 'view', ops: null, staff: null } },
};
export const STAFF = [
  { id: 'mahin', name: 'Mahin Khan', ini: 'MK', role: 'admin', title: 'Admin', team: 'Engineering', color: '#00567a' },
  { id: 'rakib', name: 'Rakib Hasan', ini: 'RH', role: 'ops', title: 'Operations', team: 'Engineering', color: '#0070a0' },
  { id: 'farhana', name: 'Farhana Akter', ini: 'FA', role: 'support', title: 'Support lead', team: 'Support', color: '#003087' },
  { id: 'tania', name: 'Tania Sultana', ini: 'TS', role: 'sales', title: 'Sales', team: 'Sales', color: '#2e559d' },
  { id: 'nusrat', name: 'Nusrat Islam', ini: 'NI', role: 'finance', title: 'Finance', team: 'Finance', color: '#7d94bf' },
  { id: 'sadia', name: 'Sadia Rahman', ini: 'SR', role: 'support', title: 'Support', team: 'Support', color: '#64748b', invite: true },
  { id: 'jamil', name: 'Jamil Haque', ini: 'JH', role: 'support', title: 'Support', team: 'Support', color: '#64748b', inactive: true },
];
export const staffBy = (idOrName) => STAFF.find((s) => s.id === idOrName || s.name === idOrName) || null;
export const staffColor = (name) => (staffBy(name) || {}).color || '#64748b';
export const staffIni = (name) => (staffBy(name) || {}).ini || String(name || '').split(' ').map((w) => w[0]).join('').slice(0, 2);
/** Staff who take collection calls and record payments. */
export const COLLECTORS = ['Farhana Akter', 'Rakib Hasan', 'Mahin Khan'];
/** Staff who can be the second person on money and plans. */
export const APPROVERS = ['Nusrat Islam', 'Mahin Khan'];
export const ONBOARDERS = ['Rakib Hasan', 'Farhana Akter', 'Tania Sultana', 'Mahin Khan'];

const RANK = { view: 1, edit: 2, approve: 2 };
/** Can this staff member do this? level: 'view' | 'edit' | 'approve'. Admin can do everything. */
export function can(staff, area, level = 'view') {
  const role = ROLES[(staff || {}).role];
  if (!role) return false;
  if (staff.role === 'admin') return true;
  const has = role.areas[area];
  if (!has) return false;
  if (level === 'approve') return has === 'approve';
  return RANK[has] >= RANK[level];
}

// ---- lists the forms offer ----------------------------------------------------------------------------
export const REASONS = ['OUTAGE-CREDIT', 'PREPAY-DISCOUNT', 'GOODWILL', 'BILLING-ERROR'];
export const REASON_LABEL = { 'OUTAGE-CREDIT': 'Outage credit', 'PREPAY-DISCOUNT': 'Prepay discount', GOODWILL: 'Goodwill', 'BILLING-ERROR': 'Billing error' };
export const METHODS = ['bKash', 'Nagad', 'Rocket', 'Bank transfer', 'Cash at office', 'Card'];
export const VIA = [
  ['call', 'Taken on a call'], ['panel', 'Paid from merchant panel'], ['bank', 'Bank deposit'], ['person', 'Collected in person'],
];
export const viaLabel = (k) => (VIA.find((x) => x[0] === k) || [k, k])[1];
export const SOURCES = ['Physical visit', 'Meta ads', 'YouTube ads', 'Reference', 'Affiliate', 'Website', 'Event'];
export const CATEGORIES = ['Jewellery and accessories', 'Fashion', 'Electronics', 'Grocery', 'Beauty'];
export const DISTRICTS = ['Dhaka', 'Chattogram', 'Sylhet', 'Khulna', 'Narayanganj', 'Bogura', 'Pabna', 'Tangail', 'Rajshahi', 'Gazipur'];
export const CONTROL_REASONS = ['Owner asked', 'Unpaid bills', 'Abuse or fraud', 'Legal request', 'Duplicate store', 'Other'];
/** Stages a new store goes through, with their usual time (ms). */
export const STAGES = [
  ['store', 'Store', 2000], ['owner', 'Owner', 1000], ['theme', 'Theme', 6000], ['search', 'Search', 14000],
  ['domain', 'Domain', 41000], ['billing', 'Billing', 3000], ['wizard', 'Wizard', 1000],
];
/** Trial length when the plan says nothing else. */
export const TRIAL_DAYS = 15;
/** Days overdue before a store moves on: grace → read-only → suspended. */
export const GRACE_DAYS = 7;
export const READONLY_DAYS = 14;
/** Retention after suspension or cancellation before the store may be archived. */
export const ARCHIVE_AFTER = 40;
