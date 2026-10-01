// reports/catalogue — every report the merchant has, in one list, grouped for the Reports page.
// A report is either a definition rendered by the generic report screen (/report?id=…, see defs/*.js)
// or a link to a page that already is a report (kind: 'page').
//
// Definition contract (defs/<group>.js export default [ … ]):
//   { id, group, title, description, icon (Lucide), keywords?, filters: [filter keys], defaultPeriod (a preset id),
//     snapshot?: true (figures "as of now" — no period picker), compare?: false (hide compare),
//     compute(ctx) → { kpis, chart, table, notes } }
//   ctx = { from, to, now, filters: { key: value } }   (period [from, to), values '' = all)
//   kpis:  [{ key, label, value, format, good: 'up'|'down'|'none', sub }]   (compare is matched by key)
//   chart: { type: 'bar'|'stacked'|'line'|'hbar'|'donut'|'heatmap', labels, series: [{ name, values, tone }], format }
//          heatmap: { type: 'heatmap', rows: [labels], cols: [labels], values: [[…]], format }
//   table: { columns: [{ key, label, format, align, total: 'sum'|'none'|value }], rows: [{ …, _href }], sort: { key, dir } }
//   notes: [text]

import { CHANNELS } from '../categories';
import { getPlaces } from '../locations';
import { getCounters } from '../posStore';
import { CATALOG, getCatalog } from '../stock';
import { PARTNERS } from '../settlements';
import { getSuppliers } from '../supplierBills';
import { OWN_ACCOUNTS } from '../ledger';
import { loadSnapshot } from '../hr';

import sales from './defs/sales';
import online from './defs/online';
import wholesale from './defs/wholesale';
import customers from './defs/customers';
import inventory from './defs/inventory';
import purchase from './defs/purchase';
import finance from './defs/finance';
import pos from './defs/pos';
import hr from './defs/hr';
import marketing from './defs/marketing';

export const GROUPS = [
  { id: 'sales', label: 'Sales', icon: 'chart-column', help: 'What sold, where, by whom and how it was paid' },
  { id: 'online', label: 'Online & delivery', icon: 'truck', help: 'Orders, couriers, cash on delivery and returns to origin' },
  { id: 'wholesale', label: 'Wholesale', icon: 'warehouse', help: 'Wholesale customers, invoices, dues and deliveries' },
  { id: 'customers', label: 'Customers & loyalty', icon: 'users', help: 'New and returning customers, best buyers, points and wallets' },
  { id: 'inventory', label: 'Stock', icon: 'boxes', help: 'Stock value, low and slow stock, movements and shrinkage' },
  { id: 'purchase', label: 'Purchase & suppliers', icon: 'shopping-bag', help: 'What you bought, from whom, and what you owe' },
  { id: 'finance', label: 'Finance', icon: 'landmark', help: 'Profit, cash, expenses, dues and VAT' },
  { id: 'pos', label: 'POS', icon: 'monitor-smartphone', help: 'Shifts, counters, cash over and short' },
  { id: 'hr', label: 'Staff & HR', icon: 'contact', help: 'Attendance, leave, payroll and staff cost' },
  { id: 'marketing', label: 'Marketing & support', icon: 'megaphone', help: 'Discounts, promotions, inbox, calls and blog' },
];
export const GROUP_BY_ID = Object.fromEntries(GROUPS.map((g) => [g.id, g]));

// pages that already are reports (kept at their own address)
const PAGES = [
  { id: 'page-sales-profit', kind: 'page', group: 'finance', title: 'Sales & profit by channel', description: 'Online, Retail and Wholesale sales, cost of goods, channel costs and profit.', icon: 'chart-column', href: '/sales-profit' },
  { id: 'page-account-reports', kind: 'page', group: 'finance', title: 'Profit & loss, cash flow, partner fees, VAT', description: 'The cash-basis P&L with comparison, cash flow per account, partner fees and VAT.', icon: 'file-bar-chart', href: '/account-reports' },
  { id: 'page-sales-book', kind: 'page', group: 'sales', title: 'Sales book', description: 'Every counter memo with filters by day, staff and payment.', icon: 'notebook', href: '/sales-book' },
  { id: 'page-return-history', kind: 'page', group: 'sales', title: 'Return & exchange history', description: 'Every return and exchange from Online, Retail and Wholesale.', icon: 'undo-2', href: '/return-history' },
  { id: 'page-dues', kind: 'page', group: 'finance', title: 'Dues (receivable and payable)', description: 'What customers and partners owe you and what you owe, with ageing.', icon: 'scale', href: '/dues' },
  { id: 'page-settlements', kind: 'page', group: 'online', title: 'Settlements & COD payouts', description: 'Money gateways and couriers hold, expected payouts, late and short payouts.', icon: 'hourglass', href: '/settlements' },
  { id: 'page-liabilities', kind: 'page', group: 'finance', title: 'Liabilities', description: 'Salaries, commission, affiliates, promotions and money held for customers.', icon: 'file-clock', href: '/liabilities' },
  { id: 'page-team-report', kind: 'page', group: 'marketing', title: 'Team report', description: 'Agent leaderboard, conversations and revenue from chat.', icon: 'bar-chart-3', href: '/team-report' },
  { id: 'page-analytics-hub', kind: 'page', group: 'marketing', title: 'Analytics hub', description: 'Delivered revenue against ad spend, new and repeat buyers.', icon: 'bar-chart-3', href: '/analytics-hub' },
  { id: 'page-campaigns', kind: 'page', group: 'marketing', title: 'Campaigns & creatives', description: 'Spend, cost per delivered order and return rate by campaign.', icon: 'layers', href: '/campaigns' },
  { id: 'page-products-traffic', kind: 'page', group: 'marketing', title: 'Products & traffic', description: 'Sessions, search queries, landing pages and profit after ads.', icon: 'filter', href: '/products-traffic' },
  { id: 'page-attribution', kind: 'page', group: 'marketing', title: 'Attribution & UTM', description: 'Which links, creators and campaigns brought the orders.', icon: 'git-branch', href: '/attribution' },
  { id: 'page-reports-alerts', kind: 'page', group: 'marketing', title: 'Report builder & alerts', description: 'Build a custom report and set alerts on numbers.', icon: 'bell-ring', href: '/reports-alerts' },
  { id: 'page-ai-calls', kind: 'page', group: 'online', title: 'AI call results', description: 'Order confirmation calls made by the AI and their results.', icon: 'phone-call', href: '/ai-calls' },
];

const DEFS = [...sales, ...online, ...wholesale, ...customers, ...inventory, ...purchase, ...finance, ...pos, ...hr, ...marketing];
/** Every report: definitions first, then report pages. */
export const REPORTS = [...DEFS.map((d) => ({ kind: 'def', ...d, href: '/report?id=' + d.id })), ...PAGES];
export const reportBy = (id) => REPORTS.find((r) => r.id === id) || null;
export const reportsIn = (group) => REPORTS.filter((r) => r.group === group);

// ---- filters ------------------------------------------------------------------------------------
const uniq = (list) => [...new Set(list.filter(Boolean))];
const safe = (fn, fb) => { try { return fn(); } catch { return fb; } };
/** Filter definitions: key → { label, all, options() → [[value, label]] }. options() runs in the browser. */
export const FILTERS = {
  channel: { label: 'Channel', all: 'All channels', options: () => CHANNELS.map((c) => [c, c]) },
  place: { label: 'Branch or warehouse', all: 'All places', options: () => safe(() => getPlaces({}).map((p) => [p.name, p.name + (p.active === false ? ' (closed)' : '')]), []) },
  branch: { label: 'Branch', all: 'All branches', options: () => safe(() => getPlaces({}).filter((p) => p.type === 'Branch').map((p) => [p.name, p.name]), []) },
  counter: { label: 'Counter', all: 'All counters', options: () => safe(() => getCounters().map((c) => [c.name, c.name]), []) },
  staff: { label: 'Staff', all: 'All staff', options: () => safe(() => loadSnapshot().staff.map((s) => [s.name, s.name]), []) },
  category: { label: 'Category', all: 'All categories', options: () => uniq(safe(() => getCatalog(), CATALOG).map((p) => p.cat)).sort().map((c) => [c, c]) },
  courier: { label: 'Courier', all: 'All couriers', options: () => PARTNERS.filter((p) => p.kind === 'Courier').map((p) => [p.short, p.short]) },
  zone: { label: 'Area', all: 'All areas', options: () => [['Inside Dhaka', 'Inside Dhaka'], ['Sub-Dhaka', 'Sub-Dhaka'], ['Outside Dhaka', 'Outside Dhaka']] },
  customerType: { label: 'Customer type', all: 'All customers', options: () => [['Online', 'Online'], ['Retail', 'Retail'], ['Wholesale', 'Wholesale']] },
  supplier: { label: 'Supplier', all: 'All suppliers', options: () => safe(() => getSuppliers().map((s) => [s.id, s.name]), []) },
  account: { label: 'Account', all: 'All accounts', options: () => safe(() => OWN_ACCOUNTS().map((a) => [a.id, a.name]), []) },
};
