// admin/company — GridCommerce's own business, as demo figures (front end only). The SaaS side (stores, plans,
// invoices, payments) is real demo data in lib/platform; this file fills in what the company does around it until
// those pages get their own data: leads and the sales funnel, ad spend, support tickets, services and costs.
// Every figure is worked out from the date (fixed seed per day), so a period always adds up to the same numbers.

import { rng, DAY, startOfDay } from '@/lib/platform/util';

/** The day's draw, the same every time for that date. */
const dayRng = (key, day) => rng(key + ':' + Math.floor((day + 6 * 3600e3) / DAY));

/** Count of something per day, between lo and hi, a little higher on weekdays. */
function perDay(key, day, lo, hi) {
  const r = dayRng(key, day);
  const wd = new Date(day + 6 * 3600e3).getUTCDay();
  const weekend = wd === 5 ? 0.6 : 1;   // Friday is the weekend in Bangladesh
  return Math.round((lo + r() * (hi - lo)) * weekend);
}

/** Sum fn(day) over the days in [from, to). */
function sumDays(from, to, fn) {
  let s = 0;
  for (let d = startOfDay(from); d < to; d += DAY) s += fn(d);
  return s;
}

// ---- sales funnel ----------------------------------------------------------------------------------------------
export const FUNNEL = [
  ['new', 'New leads'], ['qualified', 'Qualified'], ['meeting', 'Meetings booked'], ['demo', 'Demos done'],
  ['proposal', 'Proposals sent'], ['won', 'Won'],
];
const RATE = { qualified: 0.5, meeting: 0.62, demo: 0.8, proposal: 0.58, won: 0.46 };

/** The funnel for a period: each stage counted from the one before it. lost = proposals that did not win. */
export function funnel(from, to) {
  const out = { new: sumDays(from, to, (d) => perDay('leads', d, 4, 10)) };
  let prev = out.new;
  for (const [k] of FUNNEL.slice(1)) { out[k] = Math.round(prev * RATE[k]); prev = out[k]; }
  out.lost = Math.round((out.proposal - out.won) * 0.6);
  out.conversion = out.new ? out.won / out.new : 0;
  return out;
}

/** Lead sources in a period (shares follow the platform's SOURCES). */
export function leadSources(from, to) {
  const total = funnel(from, to).new;
  const shares = [['Meta ads', 0.34], ['Website', 0.2], ['Google ads', 0.12], ['Reference', 0.11], ['Affiliate', 0.09], ['WhatsApp', 0.08], ['Trade fair', 0.06]];
  return shares.map(([name, s]) => ({ name, value: Math.round(total * s) }));
}

// ---- marketing spend --------------------------------------------------------------------------------------------
/** Ad spend per day (Meta + Google), taka. */
export const adSpendOn = (day) => perDay('ads', day, 1300, 2100);
export const adSpend = (from, to) => sumDays(from, to, adSpendOn);

// ---- support ------------------------------------------------------------------------------------------------------
export const AGENTS = ['Farhana Akter', 'Sadia Rahman', 'Jamil Haque', 'Rakib Hasan'];
/** The desk now, and the period's averages. */
export function support(from, to, t) {
  const r = dayRng('desk', t);
  const resolved = sumDays(from, to, (d) => perDay('tickets', d, 6, 14));
  const load = AGENTS.map((name, i) => ({ name, open: [9, 7, 4, 3][i] + Math.round(r() * 2) }));
  const open = load.reduce((s, a) => s + a.open, 0);
  return {
    open, pending: 7 + Math.round(r() * 3), critical: 2, unassigned: 3, resolved,
    firstReply: 14 + Math.round(r() * 8),       // minutes
    resolveHours: 6.5 + Math.round(r() * 30) / 10,
    load,
  };
}

// ---- services -------------------------------------------------------------------------------------------------------
/** What the platform runs on and connects to, now. One incident is open: Steadfast webhooks (as on the merchant page). */
export function services(t) {
  const r = dayRng('svc', t);
  const ms = (base) => Math.round(base + r() * base * 0.2);
  return [
    { key: 'api', name: 'API', kind: 'Core', status: 'ok', uptime: 99.98, p95: ms(380) },
    { key: 'db', name: 'Database', kind: 'Core', status: 'ok', uptime: 99.99, p95: ms(24) },
    { key: 'jobs', name: 'Background jobs', kind: 'Core', status: 'ok', uptime: 99.95, p95: ms(900), note: '112 waiting' },
    { key: 'storage', name: 'File storage', kind: 'Core', status: 'ok', uptime: 100, p95: ms(120) },
    { key: 'steadfast', name: 'Steadfast', kind: 'Courier', status: 'warn', uptime: 98.7, p95: ms(2400), note: 'Webhooks delayed · 38 stores', incident: 'INC-114' },
    { key: 'pathao', name: 'Pathao', kind: 'Courier', status: 'ok', uptime: 99.9, p95: ms(610) },
    { key: 'redx', name: 'RedX', kind: 'Courier', status: 'ok', uptime: 99.8, p95: ms(700) },
    { key: 'sslcommerz', name: 'SSLCOMMERZ', kind: 'Payments', status: 'ok', uptime: 99.95, p95: ms(820) },
    { key: 'bkash', name: 'bKash', kind: 'Payments', status: 'ok', uptime: 99.9, p95: ms(940) },
    { key: 'sms', name: 'SMS gateway', kind: 'Messaging', status: 'ok', uptime: 99.7, p95: ms(1500) },
    { key: 'email', name: 'Email', kind: 'Messaging', status: 'ok', uptime: 99.99, p95: ms(300) },
    { key: 'meta', name: 'Meta', kind: 'Channels', status: 'ok', uptime: 99.6, p95: ms(1100) },
    { key: 'google', name: 'Google', kind: 'Channels', status: 'ok', uptime: 99.9, p95: ms(650) },
  ];
}
/** Server load now (percent). */
export function serverLoad(t) {
  const r = dayRng('load', t + Math.floor((t % DAY) / 3600e3) * 3600e3);
  return { cpu: 34 + Math.round(r() * 18), ram: 58 + Math.round(r() * 12), disk: 61, errorRate: 0.3 + Math.round(r() * 3) / 10 };
}

// ---- costs and the money that is not subscriptions ----------------------------------------------------------------
/** The company's costs for a period by category (taka). Marketing is the ad spend. */
export function costs(from, to) {
  const days = Math.max(1, (to - from) / DAY);
  const month = days / 30;
  return [
    { key: 'salaries', name: 'Salaries', value: Math.round(240000 * month) },
    { key: 'marketing', name: 'Marketing', value: adSpend(from, to) },
    { key: 'infra', name: 'Servers & hosting', value: Math.round(38000 * month) },
    { key: 'comms', name: 'SMS, email & AI', value: sumDays(from, to, (d) => perDay('commcost', d, 380, 560)) },
    { key: 'office', name: 'Office & other', value: Math.round(22000 * month) },
  ];
}
/** Messaging resold to stores (SMS, WhatsApp, AI credits), refunds given, for a period. */
export function otherIncome(from, to) {
  return {
    comms: sumDays(from, to, (d) => perDay('commrev', d, 520, 780)),
    refunds: sumDays(from, to, (d) => (perDay('refund', d, 0, 10) > 8 ? 1500 : 0)),
  };
}
