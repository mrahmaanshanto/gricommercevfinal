// reportData — the app's reports, from the web's one catalogue (lib/reports/catalogue.js): the same definitions run
// with the same period, so a figure here matches /report?id=… on the web.
//   phoneReports(ed)   the edition's reports (editionReports) that read well on a phone: definitions, minus heat maps
//                      and wide registers; report pages only where the app has the page (Dues, Payouts)
//   PERIODS            Today · Yesterday · 7 days · This month · Last month → periodFor(key, now)
//   run(def, period)   compute + the previous period of the same length for the change on each figure
//   bars(chart)        the chart as a simple bar list: [{ label, value }] (series added up per label)
//   cardColumns(table) which columns make a row card: title, the figure on the right, two more for the sub line
//   csvRows(def, res, periodText)   the rows for downloadCsv (title, period, figures, then the table)

import { editionReports, GROUPS, GROUP_BY_ID, reportBy } from '@/lib/reports/catalogue';
import { periodOf, compareOf, addDays, startOfDay, fmt, csvValue, change, rangeText } from '@/lib/reports/period';

export { GROUPS, GROUP_BY_ID, reportBy, fmt, change, rangeText };

/** Definitions left out of the app: a heat map, wide registers and admin views better read on a computer. */
const SKIP = new Set(['hour-weekday-heatmap', 'bin-utilisation', 'valuation-at-date', 'price-history', 'pos-audit', 'blog-report', 'roster-cover', 'customer-value']);
/** Report pages the app has its own screen for. */
export const PAGE_ROUTES = { 'page-dues': '/m-dues', 'page-settlements': '/m-payouts' };
/** Kit icon per report group. */
export const GROUP_ICON = { sales: 'chart', online: 'truck', wholesale: 'store', customers: 'users', inventory: 'layers', purchase: 'clipboard', finance: 'wallet', pos: 'cart', hr: 'briefcase', marketing: 'megaphone' };

/** The edition's reports that the app shows, each with its app address. */
export function phoneReports(ed) {
  return editionReports(ed)
    .filter((r) => (r.kind === 'def' ? !SKIP.has(r.id) : !!PAGE_ROUTES[r.id]))
    .map((r) => ({ ...r, appHref: r.kind === 'def' ? '/m-report?id=' + encodeURIComponent(r.id) : PAGE_ROUTES[r.id] }));
}

export const PERIODS = [
  { key: 'today', label: 'Today' }, { key: 'yesterday', label: 'Yesterday' }, { key: '7', label: '7 days' },
  { key: 'month', label: 'This month' }, { key: 'lastmonth', label: 'Last month' },
];
/** The period [from, to) of a picker key; '7' = the last 7 days with today. Anything else falls back to the report's own. */
export function periodFor(key, now, def) {
  const today = startOfDay(now);
  if (key === '7') return { from: addDays(today, -6), to: addDays(today, 1) };
  if (['today', 'yesterday', 'month', 'lastmonth'].includes(key)) return periodOf(key, now);
  return periodOf((def && def.defaultPeriod) || 'month', now);
}
/** The picker key for a report's default period (week → 7 days; quarter / year → this month). */
export function defaultKey(def) {
  const p = (def && def.defaultPeriod) || 'month';
  if (p === 'week' || p === 'lastweek') return '7';
  return PERIODS.some((x) => x.key === p) ? p : 'month';
}

/** Run a definition for a period; `before` is the previous period of the same length (null for a snapshot). */
export function run(def, period, now) {
  const ctx = { from: period.from, to: period.to, now, filters: {} };
  const cur = def.compute(ctx);
  let before = null;
  if (!def.snapshot && def.compare !== false) {
    const cmp = compareOf(period, 'previous');
    if (cmp) { try { before = def.compute({ ...ctx, from: cmp.from, to: cmp.to }); } catch { before = null; } }
  }
  return { cur, before };
}

/** The chart as bars: one per label, its series added up; heat maps and empty charts give none. */
export function bars(chart) {
  if (!chart || chart.type === 'heatmap' || !Array.isArray(chart.labels) || !chart.labels.length) return null;
  const series = chart.series || [];
  const list = chart.labels.map((label, i) => ({ label: String(label), value: series.reduce((a, s) => a + (Number((s.values || [])[i]) || 0), 0) }));
  if (!list.some((b) => b.value)) return null;
  const time = ['bar', 'stacked', 'line'].includes(chart.type);
  return { time, format: chart.format || 'money', list: time ? list : list.slice().sort((a, b) => b.value - a.value).slice(0, 8) };
}

const NUM = ['money', 'money0', 'int', 'num', 'pct'];
/** title = the first text column; end = the sorted figure (else the first money column); sub = two more columns. */
export function cardColumns(table) {
  const cols = (table && table.columns) || [];
  const title = cols.find((c) => !NUM.includes(c.format) && !['date', 'datetime'].includes(c.format)) || cols[0];
  const sortKey = table && table.sort && table.sort.key;
  const end = cols.find((c) => c.key === sortKey && NUM.includes(c.format)) || cols.find((c) => c.format === 'money' || c.format === 'money0') || cols.find((c) => NUM.includes(c.format));
  const sub = cols.filter((c) => c !== title && c !== end).slice(0, 2);
  return { title, end, sub, all: cols };
}

/** CSV rows: title, period, the figures, then the table with its columns. */
export function csvRows(def, res, periodText) {
  const rows = [[def.title], [periodText], []];
  (res.kpis || []).forEach((k) => rows.push([k.label, csvValue(k.value, k.format)]));
  if (res.table && res.table.rows && res.table.rows.length) {
    rows.push([]);
    const cols = res.table.columns || [];
    rows.push(cols.map((c) => c.label));
    res.table.rows.forEach((r) => rows.push(cols.map((c) => csvValue(r[c.key], c.format))));
  }
  return rows;
}

/** A report row's web link as an app address, when the app has that page. */
export function appLink(href) {
  if (!href) return null;
  const [path, q] = String(href).split('?');
  if (path === '/order-detail' || path === '/merchant-order-detail') return '/m-order-detail' + (q ? '?' + q : '');
  if (path === '/settlements') return '/m-payouts';
  if (path === '/dues') return '/m-dues';
  if (path === '/expenses-bills' || path === '/money') return '/m-finance';
  return null;
}
