// platform/catalogue — what GridCommerce sells and who works in the console.
//   MODULES · SETS        the module catalogue (codes as in the console's Module catalogue), grouped in sets
//   LADDERS · PLAN_IDS    one plan ladder per segment (Online, Retail, Wholesale); prices and limits live in the
//                         versioned plan catalogue (db().plans, seeded from basePlans())
//   ADDONS                modules and items billed on their own (Merchant page › Add a module or item)
//   STAFF · ROLES · can() console staff, their role and what the role may do (Staff and roles screen)
//   REASONS · METHODS · VIA · SOURCES · CATEGORIES · DISTRICTS   the lists the forms offer

import { startOfMonth } from './util';

export const SETS = [
  { id: 'platform', label: 'Platform core', sub: 'Runs in every store', always: true },
  { id: 'everyday', label: 'Everyday core', sub: 'Every segment, every plan', always: true },
  { id: 'online', label: 'Online set', sub: 'Online segment', ladder: 'online' },
  { id: 'retail', label: 'Retail set', sub: 'Retail segment', ladder: 'retail' },
  { id: 'wholesale', label: 'Wholesale set', sub: 'Wholesale segment', ladder: 'wholesale' },
  { id: 'grow', label: 'Grow set', sub: 'Offers, loyalty, recovery, analytics' },
  { id: 'scale', label: 'Scale set', sub: 'Locations, people, custom plans' },
  { id: 'credits', label: 'Credit add-ons', sub: 'Bought as credits' },
  { id: 'service', label: 'Service add-on', sub: 'Managed service' },
];

export const MODULES = [
  ['F1', 'Multi-tenancy', 'platform'], ['F3', 'Plans', 'platform'], ['F2', 'Billing', 'platform'], ['B1', 'Design system', 'platform'],
  ['S4', 'Roles', 'platform'], ['S8', 'Onboarding', 'platform'], ['S9', 'Merchant notices', 'platform'], ['S3', 'Notifications', 'platform'],
  ['M01', 'Dashboard', 'everyday'], ['S2', 'Reports', 'everyday'], ['M07', 'Products', 'everyday'], ['M15', 'Stock ledger', 'everyday'],
  ['S1', 'Customer record', 'everyday'], ['M22', 'Customer CRM', 'everyday'], ['M17', 'Payments', 'everyday'], ['M24', 'Staff access', 'everyday'],
  ['M18', 'Returns', 'everyday'], ['S7', 'Support tickets', 'everyday'],
  ['M06', 'Checkout', 'online'], ['M02', 'Online orders', 'online'], ['M25', 'Manual order', 'online'], ['M23', 'Quick order link', 'online'],
  ['M26', 'Bulk actions', 'online'], ['M08', 'Courier and COD', 'online'], ['M11', 'Themes', 'online'], ['M12', 'Landing pages', 'online'],
  ['M10', 'SEO', 'online'], ['M09', 'Reviews', 'online'], ['G1', 'Server tracking', 'online'],
  ['M04', 'POS', 'retail'], ['M03', 'Counter sales', 'retail'], ['M16', 'Cash and expenses', 'retail'], ['M28', 'Warranty', 'retail'],
  ['M13', 'Purchasing', 'wholesale'], ['M14', 'Wholesale dues', 'wholesale'], ['M27', 'Partners', 'wholesale'],
  ['M21', 'Promotions', 'grow'], ['M20', 'Loyalty', 'grow'], ['G4', 'Cart recovery', 'grow'], ['G2', 'Analytics', 'grow'],
  ['M05', 'Warehouse', 'scale'], ['M19', 'HR and payroll', 'scale'],
  ['G3', 'Inbox', 'credits'], ['G6', 'Blasts', 'credits'], ['G5', 'AI products', 'credits'],
  ['S6', 'Migration', 'service'],
].map(([code, name, set]) => ({ code, name, set }));
export const moduleBy = (code) => MODULES.find((m) => m.code === code) || null;

export const LADDERS = [
  { id: 'online', label: 'Online', set: 'online' },
  { id: 'retail', label: 'Retail', set: 'retail' },
  { id: 'wholesale', label: 'Wholesale', set: 'wholesale' },
];
export const ladderLabel = (id) => (LADDERS.find((l) => l.id === id) || {}).label || id;
export const PLAN_IDS = ['growth', 'business', 'enterprise'];
export const PLAN_NAME = { growth: 'Growth', business: 'Business', enterprise: 'Enterprise' };
export const planIdByName = (name) => PLAN_IDS.find((p) => PLAN_NAME[p] === name) || null;

/** What a set does in a plan: 'Included' · 'Locked · upgrade' · 'Add-on' · 'Hidden'. */
export const SET_STATES = ['Included', 'Locked · upgrade', 'Add-on', 'Hidden'];
export const LIMIT_KEYS = [
  ['orders', 'Orders a month', 'orders'], ['products', 'Products', 'products'], ['seats', 'Staff seats', 'seats'],
  ['storage', 'Storage', 'GB'], ['couriers', 'Courier connections', 'couriers'], ['pages', 'Landing pages', 'pages'],
  ['sms', 'SMS included', 'a month'], ['ai', 'AI product credits', 'a month'],
];
export const UNLIMITED = 999999;

/** The plan catalogue as first published: one entry per ladder, each with its versions. */
export function basePlans(anchor) {
  const sets = (ladder, grow, scale) => ({ platform: 'Included', everyday: 'Included', [ladder]: 'Included', grow, scale, credits: 'Add-on' });
  const plans = (ladder, v) => ({
    growth: {
      name: 'Growth', price: 1000, yearly: 10000, setup: 0, trialDays: 15, visibility: 'Public',
      tagline: 'Start selling in one segment with the everyday core.',
      sets: sets(ladder, 'Locked · upgrade', 'Locked · upgrade'),
      limits: { orders: 500, products: 200, seats: 2, storage: 5, couriers: 1, pages: 2, sms: 500, ai: 0 },
      warnAt: 80, topup: 300, atLimit: 'block',
    },
    business: {
      name: 'Business', price: 2500, yearly: v >= 3 ? 27000 : 25000, setup: 0, trialDays: 15, visibility: 'Public',
      tagline: 'Adds offers, loyalty, cart recovery and analytics.',
      sets: sets(ladder, 'Included', 'Locked · upgrade'),
      limits: { orders: v >= 3 ? 2500 : 2000, products: 2000, seats: 5, storage: 25, couriers: 3, pages: 10, sms: 1000, ai: 100 },
      warnAt: 80, topup: 300, atLimit: 'block',
    },
    enterprise: {
      name: 'Enterprise', price: 5000, yearly: 50000, setup: 0, trialDays: 15, visibility: 'Public',
      tagline: 'Adds warehouses, payroll and custom terms.',
      sets: sets(ladder, 'Included', 'Included'),
      limits: { orders: 10000, products: UNLIMITED, seats: 15, storage: 100, couriers: UNLIMITED, pages: 50, sms: 5000, ai: 500 },
      warnAt: 80, topup: 300, atLimit: 'block',
    },
  });
  const sep1 = startOfMonth(anchor);
  const v = (n, liveFrom, ladder) => ({ v: n, liveFrom, plans: plans(ladder, n), by: 'Mahin Khan', approvedBy: 'Nusrat Islam', note: n === 1 ? 'First prices' : 'Business orders 2,000 → 2,500; yearly ৳25,000 → ৳27,000' });
  const year = 365 * 864e5;
  return {
    online: { live: 3, versions: [v(1, sep1 - 2 * year, 'online'), v(2, sep1 - year, 'online'), v(3, sep1, 'online')] },
    retail: { live: 2, versions: [v(1, sep1 - 2 * year, 'retail'), v(2, sep1 - 200 * 864e5, 'retail')] },
    wholesale: { live: 1, versions: [v(1, sep1 - 2 * year, 'wholesale')] },
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
