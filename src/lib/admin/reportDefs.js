// admin/reportDefs — every super admin report, as a definition (the merchant panel's report idea, lib/reports/catalogue.js,
// with GridCommerce's own data). /admin/reports lists them by group; /admin/reports/view?id=<id> renders one with the
// period and compare, filters, key figures, chart, table (column chooser), CSV and print.
//
// Definition: { id, group, title, description, icon (Lucide), filters: [filter keys], defaultPeriod (a PERIODS key),
//               snapshot?: true (figures as of now: no period), compare?: false, compute(ctx) → { kpis, chart, table, notes } }
//   ctx   = { db, t, data, from, to, filters: { key: value ('' = all) }, acq() (stores with where they came from) }
//   kpis  = [{ key, label, value, format, good: 'up'|'down'|'none', sub }]   (compare is matched by key)
//   chart = { type: 'bar'|'stacked'|'line'|'hbar'|'donut', labels, series: [{ name, values, tone }], format }
//   table = { columns: [{ key, label, format, total: 'sum'|value }], rows: [{ …, _href }], sort: { key, dir } }
//   format: 'money0' · 'int' · 'num' · 'pct' (a share: 0.12) · 'date' · 'days' · 'text'
// Data: lib/platform (stores, subscriptions, invoices, payments, calls), lib/admin/merchants, lib/admin/analytics,
// lib/admin/company (sales funnel, support desk, costs). Nothing here changes data.

import { DAY, startOfDay, monthOf } from '@/lib/platform/util';
import { METHODS, PLAN_NAME, ladderLabel, SETS, LADDERS } from '@/lib/platform/catalogue';
import { subOf, subState, isPaying, isLiveStore, mrrOf, planOf, openInvoices, balance } from '@/lib/platform/billing';
import { merchantRow } from './merchants';
import { CHANNELS, channelName, acquisitions, website, trafficTrend, attribution, moduleAdoption, usage, buckets, growthFunnel, ratio } from './analytics';
import { support, costs, otherIncome } from './company';

export const GROUPS = [
  { id: 'merchants', label: 'Merchants', icon: 'store', help: 'Stores by place, health and when they joined' },
  { id: 'revenue', label: 'Revenue & billing', icon: 'receipt', help: 'Recurring revenue, invoices, dues and payments' },
  { id: 'sales', label: 'Sales', icon: 'trending-up', help: 'Trials, conversion, churn and the modules stores use' },
  { id: 'marketing', label: 'Marketing', icon: 'megaphone', help: 'Website traffic, landing pages and campaigns' },
  { id: 'support', label: 'Support', icon: 'life-buoy', help: 'The support desk: tickets, replies and load' },
  { id: 'usage', label: 'Usage', icon: 'gauge', help: 'Messaging, API and storage across the stores' },
  { id: 'finance', label: 'Finance', icon: 'landmark', help: 'Revenue against costs, and messaging margin' },
  { id: 'people', label: 'People', icon: 'users', help: 'Collections by staff and account managers' },
];
export const GROUP_BY_ID = Object.fromEntries(GROUPS.map((g) => [g.id, g]));

const uniq = (list) => [...new Set(list.filter(Boolean))];
export const FILTERS = {
  ladder: { label: 'Segment', all: 'All segments', options: () => LADDERS.map((l) => [l.id, l.label]) },
  channel: { label: 'Channel', all: 'All channels', options: () => CHANNELS.map((c) => [c.key, c.name]) },
  district: { label: 'District', all: 'All districts', options: (db) => uniq(db.shops.map((s) => s.dist)).sort().map((d) => [d, d]) },
  method: { label: 'Method', all: 'All methods', options: () => METHODS.map((m) => [m, m]) },
  band: { label: 'Health', all: 'Any health', options: () => [['Healthy', 'Healthy'], ['Watch', 'Watch'], ['At risk', 'At risk']] },
  due: { label: 'Due', all: 'Due and overdue', options: () => [['due', 'Not due yet'], ['overdue', 'Overdue']] },
  model: { label: 'Model', all: 'Last touch', options: () => [['first', 'First touch']] },
  set: { label: 'Module set', all: 'All sets', options: () => SETS.filter((s) => !s.always).map((s) => [s.id, s.label]) },
};

const sum = (list, f) => list.reduce((s, x) => s + (Number(f(x)) || 0), 0);
const count = (list, f) => list.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m; }, {});
const merchantHref = (id) => '/admin/merchant?id=' + id;
const inRange = (x, ctx) => x >= ctx.from && x < Math.min(ctx.to, ctx.t);
/** Chart buckets over the period: labels and the [from, to) of each. */
const periodBuckets = (ctx) => buckets(ctx.from, Math.min(ctx.to, startOfDay(ctx.t) + DAY)).list;

// ---- Merchants ------------------------------------------------------------------------------------------------------
const merchants = [
  {
    id: 'stores-by-district', group: 'merchants', title: 'Stores by district', icon: 'map-pin', snapshot: true, filters: ['ladder'],
    description: 'Live stores per district: paying, on trial, behind on payment, and the recurring revenue each district brings.',
    compute(ctx) {
      const rows = ctx.db.shops.map((s) => merchantRow(ctx.db, s, ctx.t)).filter((r) => isLiveStore(r.state) && (!ctx.filters.ladder || r.ladder === ctx.filters.ladder));
      const by = {};
      for (const r of rows) {
        const x = by[r.dist] || (by[r.dist] = { district: r.dist, stores: 0, paying: 0, trial: 0, late: 0, mrr: 0 });
        x.stores++; if (r.view === 'paying' || r.view === 'late') x.paying++; if (r.view === 'trial') x.trial++; if (r.view === 'late') x.late++; x.mrr += r.monthly;
      }
      const list = Object.values(by).sort((a, b) => b.stores - a.stores);
      const dhaka = (by.Dhaka || { stores: 0 }).stores;
      return {
        kpis: [
          { key: 'stores', label: 'Live stores', value: rows.length, format: 'int' },
          { key: 'districts', label: 'Districts', value: list.length, format: 'int' },
          { key: 'outside', label: 'Outside Dhaka', value: ratio(rows.length - dhaka, rows.length), format: 'pct' },
          { key: 'mrr', label: 'Recurring revenue', value: sum(rows, (r) => r.monthly), format: 'money0' },
        ],
        chart: { type: 'hbar', labels: list.map((x) => x.district), series: [{ name: 'Stores', values: list.map((x) => x.stores) }], format: 'int' },
        table: {
          columns: [
            { key: 'district', label: 'District' }, { key: 'stores', label: 'Stores', format: 'int', total: 'sum' }, { key: 'paying', label: 'Paying', format: 'int', total: 'sum' },
            { key: 'trial', label: 'On trial', format: 'int', total: 'sum' }, { key: 'late', label: 'Behind on payment', format: 'int', total: 'sum' }, { key: 'mrr', label: 'MRR', format: 'money0', total: 'sum' },
          ],
          rows: list.map((x) => ({ ...x, _key: x.district, _href: '/admin/merchants?dist=' + encodeURIComponent(x.district) })), sort: { key: 'stores', dir: 'desc' },
        },
        notes: ['Live stores: paying, on trial, behind on payment, suspended or paused. Closed stores are left out.'],
      };
    },
  },
  {
    id: 'new-stores', group: 'merchants', title: 'New stores', icon: 'store', defaultPeriod: 'year', filters: ['channel', 'ladder'],
    description: 'Stores that signed up in the period: package, where they came from, district and whether they became paying or let the trial end.',
    compute(ctx) {
      const list = ctx.acq().filter((a) => inRange(a.createdAt, ctx) && (!ctx.filters.channel || a.channel === ctx.filters.channel) && (!ctx.filters.ladder || a.ladder === ctx.filters.ladder));
      const bk = periodBuckets(ctx);
      return {
        kpis: [
          { key: 'new', label: 'New stores', value: list.length, format: 'int' },
          { key: 'paying', label: 'Became paying', value: list.filter((a) => a.converted).length, format: 'int' },
          { key: 'trial', label: 'Still on trial', value: list.filter((a) => a.stateKey === 'trial').length, format: 'int', good: 'none' },
          { key: 'lapsed', label: 'Trial ended, not paying', value: list.filter((a) => a.lapsed).length, format: 'int', good: 'down' },
          { key: 'ads', label: 'From ads', value: ratio(list.filter((a) => a.channel === 'meta' || a.channel === 'google').length, list.length), format: 'pct', good: 'none' },
        ],
        chart: { type: 'bar', labels: bk.map((b) => b.label), series: [{ name: 'New stores', values: bk.map((b) => list.filter((a) => a.createdAt >= b.from && a.createdAt < b.to).length) }], format: 'int' },
        table: {
          columns: [
            { key: 'name', label: 'Store' }, { key: 'createdAt', label: 'Signed up', format: 'date' }, { key: 'packageName', label: 'Package' },
            { key: 'channelName', label: 'Channel' }, { key: 'dist', label: 'District' }, { key: 'state', label: 'State' }, { key: 'revenue', label: 'Paid so far', format: 'money0', total: 'sum' },
          ],
          rows: list.map((a) => ({ _key: a.id, _href: a.lapsed ? null : merchantHref(a.id), name: a.name, createdAt: a.createdAt, packageName: a.packageName, channelName: channelName(a.channel), dist: a.dist, state: a.state.label, revenue: a.revenue })),
          sort: { key: 'createdAt', dir: 'desc' },
        },
        notes: ['Trials that ended without paying are kept here after the platform archives the store.'],
      };
    },
  },
  {
    id: 'store-health', group: 'merchants', title: 'Store health', icon: 'heart-pulse', snapshot: true, filters: ['band', 'ladder'],
    description: 'Every live store’s health score (activation, activity, billing, integrations, technical, support), last sign-in and what it owes.',
    compute(ctx) {
      const rows = ctx.db.shops.map((s) => merchantRow(ctx.db, s, ctx.t)).filter((r) => isLiveStore(r.state) && (!ctx.filters.ladder || r.ladder === ctx.filters.ladder));
      const shown = rows.filter((r) => !ctx.filters.band || r.healthBand === ctx.filters.band);
      const bands = ['Healthy', 'Watch', 'At risk'];
      return {
        kpis: [
          { key: 'avg', label: 'Average score', value: rows.length ? sum(rows, (r) => r.health) / rows.length : null, format: 'num' },
          ...bands.map((b) => ({ key: b, label: b, value: rows.filter((r) => r.healthBand === b).length, format: 'int', good: b === 'Healthy' ? 'up' : 'down' })),
        ],
        chart: { type: 'donut', labels: bands, series: [{ name: 'Stores', values: bands.map((b) => rows.filter((r) => r.healthBand === b).length) }], format: 'int' },
        table: {
          columns: [
            { key: 'name', label: 'Store' }, { key: 'packageName', label: 'Package' }, { key: 'health', label: 'Score', format: 'int' }, { key: 'healthBand', label: 'Health' },
            { key: 'lastActive', label: 'Last sign-in', format: 'days' }, { key: 'stateLabel', label: 'State' }, { key: 'owed', label: 'Owed', format: 'money0', total: 'sum' }, { key: 'am', label: 'Account manager' },
          ],
          rows: shown.map((r) => ({ _key: r.id, _href: merchantHref(r.id), name: r.name, packageName: r.packageName, health: r.health, healthBand: r.healthBand, lastActive: r.lastActive, stateLabel: r.stateLabel, owed: r.owed, am: r.am || '—' })),
          sort: { key: 'health', dir: 'asc' },
        },
        notes: ['Last sign-in: days since the owner or a team member last signed in.'],
      };
    },
  },
];

// ---- Revenue & billing -------------------------------------------------------------------------------------------------
function openRows(ctx) {
  const out = [];
  const today = startOfDay(ctx.t);
  for (const shop of ctx.db.shops) {
    const sub = subOf(ctx.db, shop.id);
    if (ctx.filters.ladder && sub.ladder !== ctx.filters.ladder) continue;
    for (const inv of openInvoices(ctx.db, shop.id)) {
      const b = balance(ctx.db, inv);
      if (b <= 0) continue;
      const days = Math.round((today - startOfDay(inv.dueAt)) / DAY);
      out.push({ _key: inv.id, _href: '/admin/invoices/view?id=' + inv.id, id: inv.id, shopId: shop.id, name: shop.name, period: monthOf(inv.period) + ' ' + inv.period.slice(0, 4), issuedAt: inv.issuedAt, dueAt: inv.dueAt, days: Math.max(0, days), overdue: days > 0, total: inv.total, balance: b });
    }
  }
  return out;
}
const revenue = [
  {
    id: 'mrr-by-package', group: 'revenue', title: 'MRR by package', icon: 'repeat', snapshot: true, filters: ['ladder'],
    description: 'Monthly recurring revenue by segment and plan: paying stores, revenue, average per store and its share.',
    compute(ctx) {
      const by = {};
      for (const shop of ctx.db.shops) {
        const sub = subOf(ctx.db, shop.id);
        const st = subState(ctx.db, shop.id, ctx.t);
        if (!isPaying(st) || (ctx.filters.ladder && sub.ladder !== ctx.filters.ladder)) continue;
        const k = sub.ladder + ':' + sub.plan;
        const x = by[k] || (by[k] = { name: `${ladderLabel(sub.ladder)} · ${PLAN_NAME[sub.plan]}`, list: planOf(ctx.db, sub).price, stores: 0, mrr: 0, late: 0 });
        x.stores++; x.mrr += mrrOf(ctx.db, sub, ctx.t); if (st.key !== 'active') x.late++;
      }
      const list = Object.values(by).sort((a, b) => b.mrr - a.mrr);
      const total = sum(list, (x) => x.mrr);
      const stores = sum(list, (x) => x.stores);
      return {
        kpis: [
          { key: 'mrr', label: 'Recurring revenue', value: total, format: 'money0' },
          { key: 'arr', label: 'Annual run rate', value: total * 12, format: 'money0' },
          { key: 'paying', label: 'Paying stores', value: stores, format: 'int' },
          { key: 'arpa', label: 'Average per store', value: stores ? total / stores : null, format: 'money0' },
        ],
        chart: { type: 'hbar', labels: list.map((x) => x.name), series: [{ name: 'MRR', values: list.map((x) => x.mrr) }], format: 'money0' },
        table: {
          columns: [
            { key: 'name', label: 'Package' }, { key: 'list', label: 'List price', format: 'money0' }, { key: 'stores', label: 'Paying stores', format: 'int', total: 'sum' },
            { key: 'late', label: 'Behind on payment', format: 'int', total: 'sum' }, { key: 'mrr', label: 'MRR', format: 'money0', total: 'sum' }, { key: 'arpa', label: 'Average per store', format: 'money0' }, { key: 'share', label: 'Share', format: 'pct' },
          ],
          rows: list.map((x) => ({ ...x, _key: x.name, _href: '/admin/packages', arpa: x.stores ? x.mrr / x.stores : null, share: ratio(x.mrr, total) })), sort: { key: 'mrr', dir: 'desc' },
        },
        notes: ['MRR includes add-on modules and credit packs billed monthly; yearly plans count one twelfth a month.'],
      };
    },
  },
  {
    id: 'invoices-due', group: 'revenue', title: 'Invoices due', icon: 'file-clock', snapshot: true, filters: ['due', 'ladder'],
    description: 'Every unpaid invoice: store, billing month, due date, days overdue and what is left to pay.',
    compute(ctx) {
      const all = openRows(ctx);
      const rows = all.filter((r) => !ctx.filters.due || (ctx.filters.due === 'overdue' ? r.overdue : !r.overdue));
      const over = all.filter((r) => r.overdue);
      return {
        kpis: [
          { key: 'open', label: 'Unpaid invoices', value: all.length, format: 'int', good: 'down' },
          { key: 'owed', label: 'Owed to us', value: sum(all, (r) => r.balance), format: 'money0', good: 'down' },
          { key: 'overdue', label: 'Overdue', value: sum(over, (r) => r.balance), format: 'money0', good: 'down' },
          { key: 'stores', label: 'Stores overdue', value: uniq(over.map((r) => r.shopId)).length, format: 'int', good: 'down' },
        ],
        chart: { type: 'donut', labels: ['Not due yet', 'Overdue'], series: [{ name: 'Owed', values: [sum(all.filter((r) => !r.overdue), (r) => r.balance), sum(over, (r) => r.balance)] }], format: 'money0' },
        table: {
          columns: [
            { key: 'id', label: 'Invoice' }, { key: 'name', label: 'Store' }, { key: 'period', label: 'Month' }, { key: 'issuedAt', label: 'Issued', format: 'date' },
            { key: 'dueAt', label: 'Due', format: 'date' }, { key: 'days', label: 'Days overdue', format: 'int' }, { key: 'total', label: 'Amount', format: 'money0', total: 'sum' }, { key: 'balance', label: 'Left to pay', format: 'money0', total: 'sum' },
          ],
          rows, sort: { key: 'days', dir: 'desc' },
        },
        notes: ['Grace runs 7 days after the due date, read-only to day 14, then the store is suspended.'],
      };
    },
  },
  {
    id: 'collections-aging', group: 'revenue', title: 'Collections aging', icon: 'hourglass', snapshot: true, filters: ['ladder'],
    description: 'What each store owes, split by how late it is: not due, 1–7 days (grace), 8–14 (read-only), 15–30 and over 30.',
    compute(ctx) {
      const AGES = [['notdue', 'Not due', (d, o) => !o], ['d7', '1–7 days', (d, o) => o && d <= 7], ['d14', '8–14 days', (d) => d > 7 && d <= 14], ['d30', '15–30 days', (d) => d > 14 && d <= 30], ['d31', 'Over 30 days', (d) => d > 30]];
      const by = {};
      for (const r of openRows(ctx)) {
        const x = by[r.shopId] || (by[r.shopId] = { _key: r.shopId, _href: merchantHref(r.shopId), name: r.name, notdue: 0, d7: 0, d14: 0, d30: 0, d31: 0, total: 0 });
        const age = AGES.find(([, , f]) => f(r.days, r.overdue));
        x[age[0]] += r.balance; x.total += r.balance;
      }
      const rows = Object.values(by);
      const tot = (k) => sum(rows, (r) => r[k]);
      return {
        kpis: [
          { key: 'owed', label: 'Owed to us', value: tot('total'), format: 'money0', good: 'down' },
          { key: 'overdue', label: 'Overdue', value: tot('total') - tot('notdue'), format: 'money0', good: 'down' },
          { key: 'over14', label: 'Over 14 days', value: tot('d30') + tot('d31'), format: 'money0', good: 'down' },
          { key: 'stores', label: 'Stores owing', value: rows.length, format: 'int', good: 'down' },
        ],
        chart: { type: 'bar', labels: AGES.map((a) => a[1]), series: [{ name: 'Owed', values: AGES.map((a) => tot(a[0])) }], format: 'money0' },
        table: {
          columns: [{ key: 'name', label: 'Store' }, ...AGES.map(([k, l]) => ({ key: k, label: l, format: 'money0', total: 'sum' })), { key: 'total', label: 'Total', format: 'money0', total: 'sum' }],
          rows, sort: { key: 'total', dir: 'desc' },
        },
      };
    },
  },
  {
    id: 'payments-by-method', group: 'revenue', title: 'Payments by method', icon: 'wallet', defaultPeriod: 'month', filters: ['method'],
    description: 'Money collected from stores in the period by method (bKash, Nagad, card, bank …) and how it came in: the panel, a call or auto-charge.',
    compute(ctx) {
      const pays = ctx.db.payments.filter((p) => p.status === 'ok' && inRange(p.at, ctx) && (!ctx.filters.method || p.method === ctx.filters.method));
      const methods = uniq(pays.map((p) => p.method));
      const bk = periodBuckets(ctx);
      const total = sum(pays, (p) => p.amount);
      const tones = ['primary', 'success', 'warning', 'info', 'danger', 'slate'];
      return {
        kpis: [
          { key: 'collected', label: 'Collected', value: total, format: 'money0' },
          { key: 'count', label: 'Payments', value: pays.length, format: 'int' },
          { key: 'avg', label: 'Average payment', value: pays.length ? total / pays.length : null, format: 'money0', good: 'none' },
          { key: 'panel', label: 'Paid from the panel', value: ratio(pays.filter((p) => p.via === 'panel').length, pays.length), format: 'pct' },
        ],
        chart: { type: 'stacked', labels: bk.map((b) => b.label), series: methods.map((m, i) => ({ name: m, tone: tones[i % tones.length], values: bk.map((b) => sum(pays.filter((p) => p.method === m && p.at >= b.from && p.at < b.to), (p) => p.amount)) })), format: 'money0' },
        table: {
          columns: [
            { key: 'method', label: 'Method' }, { key: 'count', label: 'Payments', format: 'int', total: 'sum' }, { key: 'amount', label: 'Collected', format: 'money0', total: 'sum' },
            { key: 'share', label: 'Share', format: 'pct' }, { key: 'panel', label: 'From the panel', format: 'int', total: 'sum' }, { key: 'call', label: 'On a call', format: 'int', total: 'sum' }, { key: 'auto', label: 'Auto-charge', format: 'int', total: 'sum' },
          ],
          rows: methods.map((m) => { const l = pays.filter((p) => p.method === m); const a = sum(l, (p) => p.amount); return { _key: m, method: m, count: l.length, amount: a, share: ratio(a, total), panel: l.filter((p) => p.via === 'panel').length, call: l.filter((p) => p.via === 'call').length, auto: l.filter((p) => p.via === 'auto').length }; }),
          sort: { key: 'amount', dir: 'desc' },
        },
      };
    },
  },
];

// ---- Sales ----------------------------------------------------------------------------------------------------------------
const sales = [
  {
    id: 'trial-conversion-by-source', group: 'sales', title: 'Trial conversion by source', icon: 'flask-conical', defaultPeriod: 'year', filters: ['ladder', 'model'],
    description: 'Trials that ended in the period by the channel that brought the store, and how many became paying.',
    compute(ctx) {
      const end = Math.min(ctx.to, ctx.t);
      const first = ctx.filters.model === 'first';
      const A = ctx.acq().filter((a) => !ctx.filters.ladder || a.ladder === ctx.filters.ladder);
      const started = A.filter((a) => inRange(a.createdAt, ctx));
      const ended = A.filter((a) => a.trialEnd >= ctx.from && a.trialEnd < end);
      const chOf = (a) => (first ? a.first : a.channel);
      const rows = CHANNELS.map((c) => {
        const e = ended.filter((a) => chOf(a) === c.key);
        const won = e.filter((a) => a.converted).length;
        return { _key: c.key, name: c.name, started: started.filter((a) => chOf(a) === c.key).length, ended: e.length, won, lost: e.length - won, rate: ratio(won, e.length), revenue: sum(e.filter((a) => a.converted), (a) => a.revenue) };
      }).filter((r) => r.started || r.ended);
      const won = sum(rows, (r) => r.won), endedN = sum(rows, (r) => r.ended);
      return {
        kpis: [
          { key: 'started', label: 'Trials started', value: started.length, format: 'int' },
          { key: 'ended', label: 'Trials ended', value: endedN, format: 'int', good: 'none' },
          { key: 'won', label: 'Became paying', value: won, format: 'int' },
          { key: 'rate', label: 'Conversion', value: ratio(won, endedN), format: 'pct' },
        ],
        chart: { type: 'hbar', labels: rows.map((r) => r.name), series: [{ name: 'Became paying', tone: 'success', values: rows.map((r) => r.won) }, { name: 'Did not pay', tone: 'slate', values: rows.map((r) => r.lost) }], format: 'int' },
        table: {
          columns: [
            { key: 'name', label: 'Channel' }, { key: 'started', label: 'Trials started', format: 'int', total: 'sum' }, { key: 'ended', label: 'Trials ended', format: 'int', total: 'sum' },
            { key: 'won', label: 'Became paying', format: 'int', total: 'sum' }, { key: 'rate', label: 'Conversion', format: 'pct' }, { key: 'revenue', label: 'Paid so far', format: 'money0', total: 'sum' },
          ],
          rows, sort: { key: 'ended', dir: 'desc' },
        },
        notes: [first ? 'First touch: where the owner first came from.' : 'Last touch: the channel recorded when the store signed up.', 'Trials that ended without paying are counted from Analytics’ own record; the platform archives those stores after 40 days.'],
      };
    },
  },
  {
    id: 'churn-by-reason', group: 'sales', title: 'Churn by reason', icon: 'user-minus', defaultPeriod: 'year', filters: ['ladder'],
    description: 'Paying stores that cancelled, closed, paused or were suspended in the period, with the reason, how long they paid and what they paid.',
    compute(ctx) {
      const A = ctx.acq();
      const gone = A.filter((a) => a.converted && a.leftAt && inRange(a.leftAt, ctx) && (!ctx.filters.ladder || a.ladder === ctx.filters.ladder));
      const reasons = count(gone, (a) => a.cancelReason || 'No reason given');
      const names = Object.keys(reasons).sort((a, b) => reasons[b] - reasons[a]);
      const g = growthFunnel(A, ctx.from, ctx.to, ctx.t);
      const lost = (a) => planOf(ctx.db, subOf(ctx.db, a.id)).price || 0;
      return {
        kpis: [
          { key: 'left', label: 'Stores that left', value: gone.length, format: 'int', good: 'down' },
          { key: 'churn', label: 'Churn in the period', value: g.churn, format: 'pct', good: 'down', sub: `of ${g.payingStart} paying at the start` },
          { key: 'lost', label: 'Monthly revenue lost', value: sum(gone, lost), format: 'money0', good: 'down' },
          { key: 'top', label: 'Most common reason', value: names[0] || '—', format: 'text', good: 'none' },
        ],
        chart: { type: 'hbar', labels: names, series: [{ name: 'Stores', tone: 'danger', values: names.map((n) => reasons[n]) }], format: 'int' },
        table: {
          columns: [
            { key: 'name', label: 'Store' }, { key: 'packageName', label: 'Package' }, { key: 'leftAt', label: 'Left', format: 'date' }, { key: 'reason', label: 'Reason' },
            { key: 'months', label: 'Months paying', format: 'int' }, { key: 'revenue', label: 'Paid in total', format: 'money0', total: 'sum' }, { key: 'lost', label: 'Monthly list price', format: 'money0', total: 'sum' },
          ],
          rows: gone.map((a) => ({ _key: a.id, _href: merchantHref(a.id), name: a.name, packageName: a.packageName, leftAt: a.leftAt, reason: a.cancelReason || 'No reason given', months: Math.max(0, Math.round((a.leftAt - a.paidAt) / (30.44 * DAY))), revenue: a.revenue, lost: lost(a) })),
          sort: { key: 'leftAt', dir: 'desc' },
        },
      };
    },
  },
  {
    id: 'module-adoption', group: 'sales', title: 'Module adoption', icon: 'blocks', snapshot: true, filters: ['ladder', 'set'],
    description: 'How many paying and trial stores use each module (in the package, as an add-on or on trial), by module set.',
    compute(ctx) {
      const all = moduleAdoption(ctx.db, ctx.t, ctx.filters.ladder || '');
      const list = all.filter((m) => !ctx.filters.set || m.set === ctx.filters.set);
      const opt = all.filter((m) => m.optional);
      const top = list.slice(0, 15);
      return {
        kpis: [
          { key: 'stores', label: 'Stores counted', value: all[0] ? all[0].of : 0, format: 'int' },
          { key: 'used', label: 'Modules in use', value: list.filter((m) => m.stores).length, format: 'int' },
          { key: 'top', label: 'Most used optional module', value: opt[0] ? opt[0].name : '—', format: 'text', good: 'none' },
          { key: 'trials', label: 'Module trials running', value: sum(list, (m) => m.trials), format: 'int' },
        ],
        chart: { type: 'hbar', labels: top.map((m) => m.name), series: [{ name: 'Share of stores', values: top.map((m) => m.share || 0) }], format: 'pct' },
        table: {
          columns: [
            { key: 'name', label: 'Module' }, { key: 'code', label: 'Code' }, { key: 'setLabel', label: 'Set' }, { key: 'stores', label: 'Stores using it', format: 'int' },
            { key: 'trials', label: 'On trial', format: 'int', total: 'sum' }, { key: 'share', label: 'Share of stores', format: 'pct' },
          ],
          rows: list.map((m) => ({ ...m, _key: m.code, _href: '/admin/modules' })), sort: { key: 'stores', dir: 'desc' },
        },
        notes: ['Platform and everyday core modules run in every store and are left out.'],
      };
    },
  },
];

// ---- Marketing ------------------------------------------------------------------------------------------------------------
const marketing = [
  {
    id: 'website-landing-pages', group: 'marketing', title: 'Website landing pages', icon: 'panel-top', defaultPeriod: '30', filters: [],
    description: 'gridcommerce.net pages where sessions start: sessions, bounce rate, time on the site, leads, conversion and trials.',
    compute(ctx) {
      const w = website(ctx.data, ctx.from, ctx.to, ctx.t, ctx.acq());
      const top = w.pages.slice(0, 10);
      return {
        kpis: [
          { key: 'sessions', label: 'Sessions', value: w.sessions, format: 'int' },
          { key: 'leads', label: 'Leads', value: w.leads, format: 'int' },
          { key: 'conv', label: 'Conversion', value: w.conv, format: 'pct' },
          { key: 'bounce', label: 'Bounce rate', value: w.bounce, format: 'pct', good: 'down' },
        ],
        chart: { type: 'hbar', labels: top.map((p) => p.path), series: [{ name: 'Sessions', values: top.map((p) => p.sessions) }], format: 'int' },
        table: {
          columns: [
            { key: 'title', label: 'Page' }, { key: 'path', label: 'Address' }, { key: 'sessions', label: 'Sessions', format: 'int', total: 'sum' }, { key: 'bounce', label: 'Bounce rate', format: 'pct' },
            { key: 'avgSec', label: 'Avg. time (s)', format: 'int' }, { key: 'leads', label: 'Leads', format: 'int', total: 'sum' }, { key: 'conv', label: 'Conversion', format: 'pct' }, { key: 'trials', label: 'Trials', format: 'int', total: 'sum' },
          ],
          rows: w.pages.map((p) => ({ ...p, _key: p.path })), sort: { key: 'sessions', dir: 'desc' },
        },
      };
    },
  },
  {
    id: 'traffic-sources', group: 'marketing', title: 'Website traffic by source', icon: 'globe', defaultPeriod: '30', filters: [],
    description: 'Visitors, sessions, bounce rate, leads and trials per source (Meta ads, Google ads, organic, direct, affiliate, referral, WhatsApp, email).',
    compute(ctx) {
      const w = website(ctx.data, ctx.from, ctx.to, ctx.t, ctx.acq());
      const tr = trafficTrend(ctx.data, ctx.from, ctx.to, ctx.t);
      const tones = ['primary', 'warning', 'success', 'info', 'danger', 'slate', 'primary', 'success'];
      const src = CHANNELS.filter((c) => c.web);
      return {
        kpis: [
          { key: 'visitors', label: 'Visitors', value: w.visitors, format: 'int' },
          { key: 'sessions', label: 'Sessions', value: w.sessions, format: 'int' },
          { key: 'leads', label: 'Leads', value: w.leads, format: 'int' },
          { key: 'conv', label: 'Conversion', value: w.conv, format: 'pct' },
        ],
        chart: { type: 'stacked', labels: tr.list.map((x) => x.label), series: src.map((c, i) => ({ name: c.name, tone: tones[i], values: tr.list.map((x) => x.values[i] || 0) })), format: 'int' },
        table: {
          columns: [
            { key: 'name', label: 'Source' }, { key: 'visitors', label: 'Visitors', format: 'int', total: 'sum' }, { key: 'sessions', label: 'Sessions', format: 'int', total: 'sum' },
            { key: 'pageviews', label: 'Page views', format: 'int', total: 'sum' }, { key: 'bounce', label: 'Bounce rate', format: 'pct' }, { key: 'leads', label: 'Leads', format: 'int', total: 'sum' },
            { key: 'conv', label: 'Conversion', format: 'pct' }, { key: 'trials', label: 'Trials', format: 'int', total: 'sum' },
          ],
          rows: w.channels.map((c) => ({ ...c, _key: c.key })), sort: { key: 'visitors', dir: 'desc' },
        },
      };
    },
  },
  {
    id: 'campaign-attribution', group: 'marketing', title: 'Campaign attribution', icon: 'git-branch', defaultPeriod: 'year', filters: ['channel', 'model'],
    description: 'Each UTM campaign’s visits, leads, trials and paid stores, with revenue to date, cost, cost to win a store and return on spend.',
    compute(ctx) {
      const model = ctx.filters.model === 'first' ? 'first' : 'last';
      const a = attribution(ctx.db, ctx.data, ctx.from, ctx.to, ctx.t, { model, by: 'campaign', acq: ctx.acq() });
      const rows = a.rows.filter((r) => !ctx.filters.channel || r.channel === ctx.filters.channel);
      const cost = sum(rows, (r) => r.cost), paid = sum(rows, (r) => r.paid), rev = sum(rows, (r) => r.revenue);
      const top = rows.slice().sort((x, y) => y.trials - x.trials).slice(0, 10);
      return {
        kpis: [
          { key: 'cost', label: 'Cost', value: cost, format: 'money0', good: 'none' },
          { key: 'paid', label: 'Paid stores', value: paid, format: 'int' },
          { key: 'cac', label: 'Cost to win a store', value: paid && cost ? cost / paid : null, format: 'money0', good: 'down' },
          { key: 'roas', label: 'Return on spend', value: cost ? rev / cost : null, format: 'num', sub: 'revenue to date ÷ cost' },
        ],
        chart: { type: 'hbar', labels: top.map((r) => r.name), series: [{ name: 'Trials', values: top.map((r) => r.trials) }], format: 'int' },
        table: {
          columns: [
            { key: 'name', label: 'Campaign' }, { key: 'channelName', label: 'Channel' }, { key: 'utm', label: 'UTM source / medium / campaign' }, { key: 'visits', label: 'Visits', format: 'int', total: 'sum' },
            { key: 'leads', label: 'Leads', format: 'int', total: 'sum' }, { key: 'trials', label: 'Trials', format: 'int', total: 'sum' }, { key: 'paid', label: 'Paid', format: 'int', total: 'sum' },
            { key: 'revenue', label: 'Revenue to date', format: 'money0', total: 'sum' }, { key: 'cost', label: 'Cost', format: 'money0', total: 'sum' }, { key: 'cac', label: 'CAC', format: 'money0' }, { key: 'roas', label: 'ROAS', format: 'num' },
          ],
          rows: rows.map((r) => ({ ...r, _key: r.key })), sort: { key: 'trials', dir: 'desc' },
        },
        notes: [model === 'first' ? 'First touch: credit goes to where the owner first came from.' : 'Last touch: credit goes to the campaign recorded at signup.', 'Field sales and events have no website visits.'],
      };
    },
  },
];

// ---- Support --------------------------------------------------------------------------------------------------------------
const supportDefs = [
  {
    id: 'support-desk', group: 'support', title: 'Support desk', icon: 'life-buoy', defaultPeriod: '30', filters: [],
    description: 'Tickets resolved in the period, first reply and resolution times, and the open tickets each agent holds now.',
    compute(ctx) {
      const end = Math.min(ctx.to, ctx.t);
      const s = support(ctx.from, end, ctx.t);
      const bk = periodBuckets(ctx);
      return {
        kpis: [
          { key: 'resolved', label: 'Resolved', value: s.resolved, format: 'int' },
          { key: 'open', label: 'Open now', value: s.open, format: 'int', good: 'down' },
          { key: 'critical', label: 'Critical now', value: s.critical, format: 'int', good: 'down' },
          { key: 'reply', label: 'First reply (min)', value: s.firstReply, format: 'int', good: 'down' },
          { key: 'resolve', label: 'Time to resolve (h)', value: s.resolveHours, format: 'num', good: 'down' },
        ],
        chart: { type: 'bar', labels: bk.map((b) => b.label), series: [{ name: 'Resolved', values: bk.map((b) => (b.from < ctx.t ? support(b.from, Math.min(b.to, end), ctx.t).resolved : 0)) }], format: 'int' },
        table: {
          columns: [{ key: 'name', label: 'Agent' }, { key: 'open', label: 'Open tickets', format: 'int', total: 'sum' }, { key: 'share', label: 'Share of open', format: 'pct' }],
          rows: s.load.map((a) => ({ _key: a.name, _href: '/admin/tickets', name: a.name, open: a.open, share: ratio(a.open, s.open) })), sort: { key: 'open', dir: 'desc' },
        },
        notes: ['Every ticket is on the Tickets page; Performance has the targets per agent.'],
      };
    },
  },
];

// ---- Usage ----------------------------------------------------------------------------------------------------------------
const usageDefs = [
  {
    id: 'messaging-usage', group: 'usage', title: 'Messaging usage by store', icon: 'messages-square', snapshot: true, filters: ['ladder'],
    description: 'This month’s SMS, WhatsApp, email, AI replies and call minutes per store, and what they cost the store in credits.',
    compute(ctx) {
      const u = usage(ctx.db, ctx.t);
      const rows = u.stores.filter((s) => !ctx.filters.ladder || (subOf(ctx.db, s.id) || {}).ladder === ctx.filters.ladder);
      const top = rows.slice().sort((a, b) => b.cost - a.cost).slice(0, 10);
      return {
        kpis: [
          { key: 'sms', label: 'SMS', value: sum(rows, (s) => s.sms), format: 'int' },
          { key: 'wa', label: 'WhatsApp', value: sum(rows, (s) => s.whatsapp), format: 'int' },
          { key: 'email', label: 'Email', value: sum(rows, (s) => s.email), format: 'int' },
          { key: 'ai', label: 'AI replies', value: sum(rows, (s) => s.aiReplies), format: 'int' },
          { key: 'cost', label: 'Charged to credits', value: sum(rows, (s) => s.cost), format: 'money0' },
        ],
        chart: { type: 'hbar', labels: top.map((s) => s.name), series: [{ name: 'Cost', values: top.map((s) => s.cost) }], format: 'money0' },
        table: {
          columns: [
            { key: 'name', label: 'Store' }, { key: 'packageName', label: 'Package' }, { key: 'sms', label: 'SMS', format: 'int', total: 'sum' }, { key: 'whatsapp', label: 'WhatsApp', format: 'int', total: 'sum' },
            { key: 'email', label: 'Email', format: 'int', total: 'sum' }, { key: 'aiReplies', label: 'AI replies', format: 'int', total: 'sum' }, { key: 'calls', label: 'Call minutes', format: 'int', total: 'sum' }, { key: 'cost', label: 'Cost', format: 'money0', total: 'sum' },
          ],
          rows: rows.map((s) => ({ ...s, _key: s.id, _href: merchantHref(s.id) + '&tab=messaging' })), sort: { key: 'cost', dir: 'desc' },
        },
        notes: ['Prices: SMS ৳0.35, WhatsApp ৳0.90, email ৳0.05, AI reply ৳2, call minute ৳1.20.'],
      };
    },
  },
  {
    id: 'api-storage', group: 'usage', title: 'API and storage by store', icon: 'hard-drive', snapshot: true, filters: ['ladder'],
    description: 'This month’s API requests and the storage each store uses, against its package’s limits.',
    compute(ctx) {
      const u = usage(ctx.db, ctx.t);
      const rows = u.stores.filter((s) => !ctx.filters.ladder || (subOf(ctx.db, s.id) || {}).ladder === ctx.filters.ladder)
        .map((s) => ({ ...s, _key: s.id, _href: merchantHref(s.id) + '&tab=resources', apiUse: ratio(s.api, s.apiLimit), storageUse: s.storageLimit ? s.storage / s.storageLimit : null }));
      const top = rows.slice().sort((a, b) => b.api - a.api).slice(0, 10);
      return {
        kpis: [
          { key: 'api', label: 'API requests', value: sum(rows, (s) => s.api), format: 'int' },
          { key: 'storage', label: 'Storage (GB)', value: sum(rows, (s) => s.storage), format: 'num' },
          { key: 'api80', label: 'Over 80% of API', value: rows.filter((s) => s.apiUse >= 0.8).length, format: 'int', good: 'down' },
          { key: 'st70', label: 'Over 70% of storage', value: rows.filter((s) => s.storageUse >= 0.7).length, format: 'int', good: 'down' },
        ],
        chart: { type: 'hbar', labels: top.map((s) => s.name), series: [{ name: 'API requests', values: top.map((s) => s.api) }], format: 'int' },
        table: {
          columns: [
            { key: 'name', label: 'Store' }, { key: 'packageName', label: 'Package' }, { key: 'api', label: 'API requests', format: 'int', total: 'sum' }, { key: 'apiUse', label: 'Of API limit', format: 'pct' },
            { key: 'storage', label: 'Storage (GB)', format: 'num', total: 'sum' }, { key: 'storageLimit', label: 'Storage limit (GB)', format: 'int' }, { key: 'storageUse', label: 'Of storage', format: 'pct' },
          ],
          rows, sort: { key: 'apiUse', dir: 'desc' },
        },
      };
    },
  },
];

// ---- Finance --------------------------------------------------------------------------------------------------------------
const finance = [
  {
    id: 'revenue-vs-costs', group: 'finance', title: 'Revenue and costs', icon: 'scale', defaultPeriod: 'year', filters: [],
    description: 'Subscriptions collected and messaging resold against salaries, marketing, servers, messaging and office costs, per month or week.',
    compute(ctx) {
      const bk = periodBuckets(ctx);
      const end = Math.min(ctx.to, ctx.t);
      const rows = bk.filter((b) => b.from < ctx.t).map((b) => {
        const to = Math.min(b.to, end);
        const subs = sum(ctx.db.payments.filter((p) => p.status === 'ok' && p.at >= b.from && p.at < to), (p) => p.amount);
        const other = otherIncome(b.from, to);
        const c = Object.fromEntries(costs(b.from, to).map((x) => [x.key, x.value]));
        const out = c.salaries + c.marketing + c.infra + c.comms + c.office;
        const revenueB = subs + other.comms - other.refunds;
        return { _key: b.from, label: b.title, subs, comms: other.comms, refunds: other.refunds, revenue: revenueB, salaries: c.salaries, marketing: c.marketing, infra: c.infra, commsCost: c.comms, office: c.office, costs: out, net: revenueB - out };
      });
      const T = (k) => sum(rows, (r) => r[k]);
      return {
        kpis: [
          { key: 'revenue', label: 'Revenue', value: T('revenue'), format: 'money0' },
          { key: 'costs', label: 'Costs', value: T('costs'), format: 'money0', good: 'down' },
          { key: 'net', label: 'Net', value: T('net'), format: 'money0' },
          { key: 'margin', label: 'Margin', value: ratio(T('net'), T('revenue')), format: 'pct' },
        ],
        chart: { type: 'bar', labels: rows.map((r) => String(r.label).split(' ')[0]), series: [{ name: 'Revenue', tone: 'primary', values: rows.map((r) => r.revenue) }, { name: 'Costs', tone: 'warning', values: rows.map((r) => r.costs) }], format: 'money0' },
        table: {
          columns: [
            { key: 'label', label: 'Period' }, { key: 'subs', label: 'Subscriptions', format: 'money0', total: 'sum' }, { key: 'comms', label: 'Messaging resold', format: 'money0', total: 'sum' },
            { key: 'refunds', label: 'Refunds', format: 'money0', total: 'sum' }, { key: 'salaries', label: 'Salaries', format: 'money0', total: 'sum' }, { key: 'marketing', label: 'Marketing', format: 'money0', total: 'sum' },
            { key: 'infra', label: 'Servers & hosting', format: 'money0', total: 'sum' }, { key: 'commsCost', label: 'SMS, email & AI', format: 'money0', total: 'sum' }, { key: 'office', label: 'Office & other', format: 'money0', total: 'sum' },
            { key: 'net', label: 'Net', format: 'money0', total: 'sum' },
          ],
          rows,
        },
        notes: ['Subscriptions are bills paid in the period (cash basis). Detailed books are in Finance.'],
      };
    },
  },
  {
    id: 'messaging-margin', group: 'finance', title: 'Messaging margin', icon: 'percent', defaultPeriod: 'year', filters: [],
    description: 'SMS, WhatsApp, email and AI credits sold to stores against what GridCommerce pays its providers.',
    compute(ctx) {
      const bk = periodBuckets(ctx);
      const end = Math.min(ctx.to, ctx.t);
      const rows = bk.filter((b) => b.from < ctx.t).map((b) => {
        const to = Math.min(b.to, end);
        const sold = otherIncome(b.from, to).comms;
        const cost = (costs(b.from, to).find((c) => c.key === 'comms') || { value: 0 }).value;
        return { _key: b.from, label: b.title, sold, cost, margin: sold - cost, rate: ratio(sold - cost, sold) };
      });
      const sold = sum(rows, (r) => r.sold), cost = sum(rows, (r) => r.cost);
      return {
        kpis: [
          { key: 'sold', label: 'Sold to stores', value: sold, format: 'money0' },
          { key: 'cost', label: 'Provider cost', value: cost, format: 'money0', good: 'down' },
          { key: 'margin', label: 'Margin', value: sold - cost, format: 'money0' },
          { key: 'rate', label: 'Margin rate', value: ratio(sold - cost, sold), format: 'pct' },
        ],
        chart: { type: 'bar', labels: rows.map((r) => String(r.label).split(' ')[0]), series: [{ name: 'Sold', tone: 'success', values: rows.map((r) => r.sold) }, { name: 'Provider cost', tone: 'warning', values: rows.map((r) => r.cost) }], format: 'money0' },
        table: {
          columns: [{ key: 'label', label: 'Period' }, { key: 'sold', label: 'Sold to stores', format: 'money0', total: 'sum' }, { key: 'cost', label: 'Provider cost', format: 'money0', total: 'sum' }, { key: 'margin', label: 'Margin', format: 'money0', total: 'sum' }, { key: 'rate', label: 'Margin rate', format: 'pct' }],
          rows,
        },
      };
    },
  },
];

// ---- People ---------------------------------------------------------------------------------------------------------------
const people = [
  {
    id: 'collections-by-staff', group: 'people', title: 'Collections by staff', icon: 'hand-coins', defaultPeriod: 'month', filters: ['method'],
    description: 'Payments staff took on calls in the period, against what owners paid themselves in the panel and auto-charge, with the calls each person made.',
    compute(ctx) {
      const pays = ctx.db.payments.filter((p) => p.status === 'ok' && inRange(p.at, ctx) && (!ctx.filters.method || p.method === ctx.filters.method));
      const calls = (ctx.db.calls || []).filter((c) => inRange(c.at, ctx));
      const who = (p) => (p.via === 'panel' ? 'Owner, in the panel' : p.via === 'auto' ? 'Auto-charge' : p.by || 'Staff');
      const names = uniq([...pays.map(who), ...calls.map((c) => c.by)]);
      const rows = names.map((n) => {
        const l = pays.filter((p) => who(p) === n);
        const c = calls.filter((x) => x.by === n);
        return { _key: n, name: n, staff: !/Owner|Auto-charge/.test(n), payments: l.length, amount: sum(l, (p) => p.amount), stores: uniq(l.map((p) => p.shopId)).length, calls: c.length, promised: c.filter((x) => x.outcome === 'promised').length };
      });
      const staffRows = rows.filter((r) => r.staff);
      const total = sum(rows, (r) => r.amount);
      return {
        kpis: [
          { key: 'staff', label: 'Taken by staff', value: sum(staffRows, (r) => r.amount), format: 'money0' },
          { key: 'self', label: 'Paid by owners', value: sum(rows.filter((r) => !r.staff), (r) => r.amount), format: 'money0' },
          { key: 'share', label: 'Share taken by staff', value: ratio(sum(staffRows, (r) => r.amount), total), format: 'pct', good: 'none' },
          { key: 'calls', label: 'Collection calls', value: calls.length, format: 'int' },
        ],
        chart: { type: 'hbar', labels: rows.map((r) => r.name), series: [{ name: 'Collected', values: rows.map((r) => r.amount) }], format: 'money0' },
        table: {
          columns: [
            { key: 'name', label: 'Who' }, { key: 'payments', label: 'Payments', format: 'int', total: 'sum' }, { key: 'amount', label: 'Collected', format: 'money0', total: 'sum' },
            { key: 'stores', label: 'Stores', format: 'int' }, { key: 'calls', label: 'Calls', format: 'int', total: 'sum' }, { key: 'promised', label: 'Promises to pay', format: 'int', total: 'sum' },
          ],
          rows, sort: { key: 'amount', dir: 'desc' },
        },
      };
    },
  },
  {
    id: 'am-portfolio', group: 'people', title: 'Account managers', icon: 'contact', snapshot: true, filters: ['ladder'],
    description: 'Each account manager’s stores: paying, on trial, at risk, the recurring revenue they look after and what their stores owe.',
    compute(ctx) {
      const rows = ctx.db.shops.map((s) => merchantRow(ctx.db, s, ctx.t)).filter((r) => isLiveStore(r.state) && (!ctx.filters.ladder || r.ladder === ctx.filters.ladder));
      const by = {};
      for (const r of rows) {
        const k = r.am || 'No manager';
        const x = by[k] || (by[k] = { _key: k, name: k, stores: 0, paying: 0, trial: 0, risk: 0, mrr: 0, owed: 0, health: 0 });
        x.stores++; if (r.view === 'paying' || r.view === 'late') x.paying++; if (r.view === 'trial') x.trial++; if (r.healthBand === 'At risk') x.risk++;
        x.mrr += r.monthly; x.owed += r.owed; x.health += r.health;
      }
      const list = Object.values(by).map((x) => ({ ...x, health: x.stores ? x.health / x.stores : null, _href: x.name === 'No manager' ? null : '/admin/merchants?am=' + encodeURIComponent(x.name) })).sort((a, b) => b.mrr - a.mrr);
      return {
        kpis: [
          { key: 'managers', label: 'Account managers', value: list.filter((x) => x.name !== 'No manager').length, format: 'int' },
          { key: 'none', label: 'Stores without a manager', value: (by['No manager'] || { stores: 0 }).stores, format: 'int', good: 'down' },
          { key: 'mrr', label: 'MRR looked after', value: sum(list.filter((x) => x.name !== 'No manager'), (x) => x.mrr), format: 'money0' },
          { key: 'risk', label: 'Stores at risk', value: sum(list, (x) => x.risk), format: 'int', good: 'down' },
        ],
        chart: { type: 'hbar', labels: list.map((x) => x.name), series: [{ name: 'MRR', values: list.map((x) => x.mrr) }], format: 'money0' },
        table: {
          columns: [
            { key: 'name', label: 'Account manager' }, { key: 'stores', label: 'Stores', format: 'int', total: 'sum' }, { key: 'paying', label: 'Paying', format: 'int', total: 'sum' },
            { key: 'trial', label: 'On trial', format: 'int', total: 'sum' }, { key: 'risk', label: 'At risk', format: 'int', total: 'sum' }, { key: 'health', label: 'Average health', format: 'int' },
            { key: 'mrr', label: 'MRR', format: 'money0', total: 'sum' }, { key: 'owed', label: 'Owed', format: 'money0', total: 'sum' },
          ],
          rows: list, sort: { key: 'mrr', dir: 'desc' },
        },
      };
    },
  },
];

export const REPORTS = [...merchants, ...revenue, ...sales, ...marketing, ...supportDefs, ...usageDefs, ...finance, ...people]
  .map((r) => ({ defaultPeriod: '30', filters: [], ...r, href: '/admin/reports/view?id=' + r.id }));
export const reportBy = (id) => REPORTS.find((r) => r.id === id) || null;
export const reportsIn = (group) => REPORTS.filter((r) => r.group === group);

/** Run a report: ctx gets the stores' acquisition rows on first use (they are shared by the current and compared run). */
export function runReport(def, { db, t, data, from, to, filters }, shared = {}) {
  const ctx = {
    db, t, data, from, to, filters: filters || {},
    acq: () => shared.acq || (shared.acq = acquisitions(db, data, t)),
  };
  return def.compute(ctx);
}
