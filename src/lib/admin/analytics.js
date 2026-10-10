// admin/analytics — GridCommerce's own analytics (super admin › Analytics): the website gridcommerce.net, where the
// merchants come from (UTM campaigns, ads, affiliates, organic, referrals, field sales, events), how the business grows
// (trials, paying stores, revenue, retention, churn, packages, modules) and what the stores use (API, SMS, AI, storage,
// messaging). Front end only.
//
// Where the numbers come from
//   · Stores, trials, paying, payments, MRR, churn, modules, usage: the platform's demo records (lib/platform, read
//     through lib/admin/merchants and lib/admin/dashboard), so they agree with the Merchants and Billing pages.
//   · Leads per day: lib/admin/company › funnel (the dashboard's sales funnel); each lead is drawn as a record with its
//     channel, form, landing page, device, division and campaign (fixed seed per day).
//   · Website traffic: a day-by-day model of gridcommerce.net (fixed seed per date, growing over time, quieter on
//     Fridays, busier while a campaign runs), so any period always adds up to the same numbers.
//   · Ad spend: lib/admin/company › adSpendOn (the dashboard's marketing cost), split between Meta and Google.
//   · This store (createStore key `analytics`): the UTM campaigns with their windows and costs, the trials that ended
//     without paying (the platform archives those stores), and the scheduled report deliveries (Reports › Scheduled).
//
//   Lists        CHANNELS · SOURCES (website channels) · PAGES · DEVICES · DIVISIONS · COUNTRIES · CONVERSIONS · PERIODS
//   Periods      periodRange(key, t) · compareRange(range, mode) · buckets(from, to) · rangeLabel(from, to)
//   Website      website(data, from, to, t, acq) · trafficTrend(data, from, to, t) · leadsIn(data, from, to, t)
//   Acquisition  acquisitions(db, data, t) (one row per store, plus lapsed trials) · attribution(db, data, from, to, t,
//                { model: 'last'|'first', by: 'channel'|'campaign', acq }) · touchShares(acq, from, to, t)
//   Growth       growth(db, data, from, to, t, acq) · growthFunnel(acq, from, to, t) · moduleAdoption(db, t, ladder)
//   Usage        usage(db, t)
//   Overview     overview(db, data, from, to, t, acq)
//   Schedules    schedules() · addSchedule({ reportId, title, via, freq, to, time }) · removeSchedule(id) · nextRun(s, t)
//   (acq: pass one acquisitions() result to several calls in a render; t clips every period at now.)

import { createStore } from './store';
import { staff } from '@/lib/platform/store';
import { DAY, TZ, rng, hash, dhaka, startOfDay, startOfMonth, addMonths, monthOf, dayOfMonth, dm, dmy, yearOf } from '@/lib/platform/util';
import { MODULES, SETS, PLAN_NAME, ladderLabel, READONLY_DAYS } from '@/lib/platform/catalogue';
import { subOf, subState, isPaying, isLiveStore, mrrOf } from '@/lib/platform/billing';
import { merchantRow, modulesOf, usageOf } from './merchants';
import { executive } from './dashboard';
import { funnel, adSpendOn } from './company';

const H = 3600e3;

// ---- lists ----------------------------------------------------------------------------------------------------------
/** Acquisition channels. Website channels first (each keeps its chart colour everywhere), then offline ones. */
export const CHANNELS = [
  { key: 'meta', name: 'Meta ads', color: 'var(--viz-1)', web: true, utm: 'facebook / paid_social' },
  { key: 'google', name: 'Google ads', color: 'var(--viz-2)', web: true, utm: 'google / cpc' },
  { key: 'organic', name: 'Organic search', color: 'var(--viz-3)', web: true, utm: 'google / organic' },
  { key: 'direct', name: 'Direct', color: 'var(--viz-4)', web: true, utm: '(direct) / (none)' },
  { key: 'affiliate', name: 'Affiliate', color: 'var(--viz-5)', web: true, utm: 'partner / affiliate' },
  { key: 'referral', name: 'Referral', color: 'var(--viz-6)', web: true, utm: '(referral) / referral' },
  { key: 'whatsapp', name: 'WhatsApp', color: 'var(--viz-7)', web: true, utm: 'whatsapp / broadcast' },
  { key: 'email', name: 'Email', color: 'var(--viz-8)', web: true, utm: 'newsletter / email' },
  { key: 'field', name: 'Field sales', color: 'var(--viz-quiet)', web: false, utm: 'offline' },
  { key: 'events', name: 'Events', color: 'var(--viz-quiet)', web: false, utm: 'offline' },
];
export const CH = Object.fromEntries(CHANNELS.map((c) => [c.key, c]));
export const SOURCES = CHANNELS.filter((c) => c.web);
export const channelName = (k) => (CH[k] || {}).name || k;

/** The website's landing pages (its real routes). conv: how much more often a visit here ends in a lead. */
export const PAGES = [
  { path: '/', title: 'Home', conv: 1, bounce: 0.38, time: 74 },
  { path: '/pricing', title: 'Pricing', conv: 2.2, bounce: 0.31, time: 118 },
  { path: '/features', title: 'Features', conv: 1.1, bounce: 0.36, time: 96 },
  { path: '/features/orders', title: 'Features · Orders', conv: 1.4, bounce: 0.42, time: 88 },
  { path: '/features/pos', title: 'Features · POS', conv: 1.6, bounce: 0.4, time: 92 },
  { path: '/features/inventory', title: 'Features · Inventory', conv: 1.2, bounce: 0.44, time: 81 },
  { path: '/solutions/online-commerce', title: 'Online commerce', conv: 1.5, bounce: 0.45, time: 79 },
  { path: '/solutions/retail-commerce', title: 'Retail commerce', conv: 1.5, bounce: 0.43, time: 84 },
  { path: '/compare', title: 'Compare', conv: 1.3, bounce: 0.33, time: 132 },
  { path: '/migration', title: 'Migration', conv: 1.9, bounce: 0.35, time: 101 },
  { path: '/themes', title: 'Themes', conv: 0.7, bounce: 0.29, time: 145 },
  { path: '/blog', title: 'Blog', conv: 0.25, bounce: 0.68, time: 156 },
  { path: '/help', title: 'Help', conv: 0.15, bounce: 0.58, time: 112 },
  { path: '/signup', title: 'Sign up', conv: 6, bounce: 0.22, time: 64 },
  { path: '/contact', title: 'Contact', conv: 4.2, bounce: 0.27, time: 58 },
];
/** Where each channel's visits land (weights). */
const LANDING = {
  meta: { '/features/orders': 22, '/solutions/online-commerce': 24, '/pricing': 16, '/': 12, '/features/pos': 10, '/migration': 8, '/signup': 8 },
  google: { '/pricing': 24, '/features/pos': 20, '/solutions/retail-commerce': 16, '/': 14, '/features/inventory': 10, '/compare': 8, '/signup': 8 },
  organic: { '/': 22, '/blog': 26, '/help': 12, '/compare': 9, '/features': 8, '/features/inventory': 6, '/pricing': 7, '/themes': 5, '/features/orders': 5 },
  direct: { '/': 46, '/pricing': 14, '/signup': 12, '/help': 10, '/features': 8, '/contact': 5, '/themes': 5 },
  affiliate: { '/': 30, '/pricing': 28, '/signup': 22, '/features': 10, '/migration': 10 },
  referral: { '/': 34, '/compare': 18, '/themes': 16, '/blog': 14, '/features': 10, '/pricing': 8 },
  whatsapp: { '/pricing': 30, '/signup': 26, '/': 18, '/contact': 14, '/features/pos': 12 },
  email: { '/blog': 30, '/features': 18, '/migration': 16, '/pricing': 14, '/features/inventory': 12, '/signup': 10 },
};
/** Per channel: sessions per visitor, pages per session, bounce rate, seconds per session, visit share. */
const BEHAVIOUR = {
  meta: { spv: 1.18, pps: 1.9, bounce: 0.58, sec: 62, share: 0.22 },
  google: { spv: 1.24, pps: 2.6, bounce: 0.44, sec: 96, share: 0.12 },
  organic: { spv: 1.31, pps: 3.1, bounce: 0.41, sec: 128, share: 0.29 },
  direct: { spv: 1.46, pps: 3.6, bounce: 0.33, sec: 154, share: 0.17 },
  affiliate: { spv: 1.2, pps: 2.4, bounce: 0.39, sec: 102, share: 0.04 },
  referral: { spv: 1.22, pps: 2.8, bounce: 0.37, sec: 118, share: 0.06 },
  whatsapp: { spv: 1.15, pps: 2.1, bounce: 0.46, sec: 71, share: 0.05 },
  email: { spv: 1.28, pps: 2.9, bounce: 0.35, sec: 133, share: 0.05 },
};
export const DEVICES = [
  { key: 'mobile', name: 'Mobile', color: 'var(--viz-1)' },
  { key: 'desktop', name: 'Desktop', color: 'var(--viz-3)' },
  { key: 'tablet', name: 'Tablet', color: 'var(--viz-4)' },
];
const DEVICE_MIX = {
  meta: [86, 11, 3], google: [64, 32, 4], organic: [62, 34, 4], direct: [55, 41, 4], affiliate: [70, 27, 3],
  referral: [60, 36, 4], whatsapp: [92, 6, 2], email: [58, 38, 4],
};
export const DIVISIONS = [
  ['Dhaka', 51], ['Chattogram', 16], ['Rajshahi', 7], ['Khulna', 7], ['Sylhet', 6], ['Rangpur', 5], ['Mymensingh', 4], ['Barishal', 4],
];
export const COUNTRIES = [
  ['Bangladesh', 91.5], ['United Arab Emirates', 2.4], ['Saudi Arabia', 1.7], ['India', 1.3], ['Malaysia', 1.2],
  ['United Kingdom', 0.8], ['United States', 0.7], ['Qatar', 0.4],
];
/** A store's district → its division. */
const DIVISION_OF = {
  Dhaka: 'Dhaka', Narayanganj: 'Dhaka', Gazipur: 'Dhaka', Tangail: 'Dhaka', Chattogram: 'Chattogram', Sylhet: 'Sylhet',
  Khulna: 'Khulna', Bogura: 'Rajshahi', Pabna: 'Rajshahi', Rajshahi: 'Rajshahi',
};
export const CONVERSIONS = [
  ['signup', 'Signup started'], ['trial', 'Trial created'], ['demo', 'Demo requested'], ['contact', 'Contact form'],
];
/** Lead mix by channel (weights) and the form a website lead used. */
const LEAD_MIX = [['meta', 28], ['organic', 17], ['google', 12], ['referral', 9], ['affiliate', 8], ['direct', 8], ['whatsapp', 7], ['email', 3], ['field', 5], ['events', 3]];
const FORM_MIX = [['signup', 55], ['demo', 28], ['contact', 17]];
/** A store's recorded source (platform `src`) → channel. Website sign-ups split between organic search and direct. */
const SRC_CHANNEL = { 'Meta ads': 'meta', 'YouTube ads': 'google', Reference: 'referral', Affiliate: 'affiliate', 'Physical visit': 'field', Event: 'events' };
/** First touch: how often the first channel is the same as the last; otherwise where people first came from. */
const STAY = { meta: 0.68, google: 0.6, organic: 0.72, direct: 0.35, affiliate: 0.85, referral: 0.75, whatsapp: 0.42, email: 0.3, field: 0.9, events: 0.95 };
const FIRST_POOL = [['organic', 34], ['meta', 30], ['referral', 14], ['google', 10], ['whatsapp', 6], ['direct', 6]];
/** Share of a channel's visits that carry a campaign's UTM while one runs. */
const COVER = { meta: 0.92, google: 0.86, email: 0.95, whatsapp: 0.85, affiliate: 1, organic: 0, direct: 0, referral: 0 };
/** Ad spend split. */
const SPEND = { meta: 0.66, google: 0.34 };
const AFFILIATE_RATE = 0.2;

export const PERIODS = [
  ['7', 'Last 7 days'], ['30', 'Last 30 days'], ['90', 'Last 90 days'], ['month', 'This month'], ['lastmonth', 'Last month'], ['year', 'Last 12 months'],
];
export const COMPARE = [['previous', 'The period before'], ['year', 'Same dates last year'], ['none', 'No comparison']];

// ---- helpers --------------------------------------------------------------------------------------------------------
function pickW(r, list) {
  const total = list.reduce((s, [, w]) => s + w, 0);
  let x = r() * total;
  for (const [k, w] of list) { x -= w; if (x < 0) return k; }
  return list[list.length - 1][0];
}
const W = (ms) => { const d = new Date(ms + TZ); return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate() }; };
const shiftYear = (ms, n = -1) => { const d = W(ms); return dhaka(d.y + n, d.m, Math.min(d.d, 28)) + ((ms + TZ) % DAY); };
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const sum = (list, f) => list.reduce((s, x) => s + (Number(f(x)) || 0), 0);
export const ratio = (a, b) => (b ? a / b : null);

// ---- periods ----------------------------------------------------------------------------------------------------------
/** [from, to) of a period at t (Dhaka days). The current day is part of every period except Last month. */
export function periodRange(key, t) {
  const end = startOfDay(t) + DAY;
  if (key === 'month') return { from: startOfMonth(t), to: end };
  if (key === 'lastmonth') return { from: addMonths(startOfMonth(t), -1, 1), to: startOfMonth(t) };
  if (key === 'year') return { from: addMonths(startOfMonth(t), -11, 1), to: end };
  const n = Number(key) || 30;
  return { from: end - n * DAY, to: end };
}
/** The period to compare with: 'previous' (same length just before), 'year' (same dates last year) or null. */
export function compareRange(r, mode) {
  if (!r || !mode || mode === 'none') return null;
  if (mode === 'year') return { from: shiftYear(r.from), to: shiftYear(r.to) };
  const len = r.to - r.from;
  return { from: r.from - len, to: r.from };
}
/** "12 Sep – 11 Oct 2026" */
export function rangeLabel(from, to) {
  const last = to - DAY;
  if (startOfDay(from) === startOfDay(last)) return dmy(from);
  return yearOf(from) === yearOf(last) ? `${dm(from)} – ${dmy(last)}` : `${dmy(from)} – ${dmy(last)}`;
}
/** Time buckets for a trend over [from, to): days up to 45 days, weeks up to ~6 months, else months. */
export function buckets(from, to) {
  const days = Math.round((to - from) / DAY);
  const out = [];
  if (days <= 45) {
    for (let d = startOfDay(from); d < to; d += DAY) out.push({ from: d, to: d + DAY, label: String(W(d).d), title: dmy(d) });
    return { unit: 'day', list: out };
  }
  if (days <= 190) {
    for (let d = startOfDay(from); d < to; d += 7 * DAY) out.push({ from: d, to: Math.min(to, d + 7 * DAY), label: dm(d), title: 'Week of ' + dm(d) });
    return { unit: 'week', list: out };
  }
  for (let m = startOfMonth(from); m < to; m = addMonths(m, 1, 1)) out.push({ from: Math.max(from, m), to: Math.min(to, addMonths(m, 1, 1)), label: monthOf(m), title: monthOf(m) + ' ' + yearOf(m) });
  return { unit: 'month', list: out };
}

// ---- campaigns (this module's store) ------------------------------------------------------------------------------------
// cost: { ads: weight } (a share of the channel's ad spend while it runs) · { monthly: ৳ } · { total: ৳ } (spread over
// its days) · { commission: rate } (of what the stores it brought pay). always: runs all the time (no traffic boost).
function seedCampaigns() {
  const d = (y, m, day) => dhaka(y, m - 1, day);
  const c = (id, name, channel, source, medium, start, end, cost, always = false) => ({ id, name, channel, source, medium, slug: id, start, end, cost, always });
  return [
    c('meta-retarget', 'Retargeting · always on', 'meta', 'facebook', 'paid_social', d(2024, 9, 1), null, { ads: 1 }, true),
    c('meta-eid25', 'Eid ul-Fitr 2025 · Sell online', 'meta', 'facebook', 'paid_social', d(2025, 3, 1), d(2025, 3, 31), { ads: 2 }),
    c('meta-migrate', 'Free migration from your Facebook page', 'meta', 'facebook', 'paid_social', d(2025, 7, 1), d(2025, 9, 15), { ads: 1.5 }),
    c('meta-pos', 'POS for phone shops', 'meta', 'instagram', 'paid_social', d(2025, 11, 10), d(2026, 1, 20), { ads: 1.5 }),
    c('meta-eid26', 'Eid ul-Fitr 2026 · Sell online', 'meta', 'facebook', 'paid_social', d(2026, 2, 20), d(2026, 3, 22), { ads: 2 }),
    c('meta-online15', 'Online store in 15 minutes', 'meta', 'facebook', 'paid_social', d(2026, 8, 15), d(2026, 10, 31), { ads: 2 }),
    c('g-brand', 'Brand search · always on', 'google', 'google', 'cpc', d(2024, 9, 1), null, { ads: 1 }, true),
    c('g-pos-search', 'POS software Bangladesh · search', 'google', 'google', 'cpc', d(2025, 5, 1), null, { ads: 1.2 }, true),
    c('g-yt-demo', 'YouTube · two-minute demo', 'google', 'youtube', 'video', d(2025, 10, 1), d(2025, 12, 31), { ads: 1.4 }),
    c('g-pmax', 'Performance Max · online store', 'google', 'google', 'pmax', d(2026, 6, 1), d(2026, 10, 31), { ads: 1.6 }),
    c('em-newsletter', 'Monthly newsletter', 'email', 'newsletter', 'email', d(2024, 9, 1), null, { monthly: 1500 }, true),
    c('em-nurture', 'Trial nurture series', 'email', 'lifecycle', 'email', d(2025, 6, 1), null, { monthly: 900 }, true),
    c('wa-trial', 'Trial offer broadcast', 'whatsapp', 'whatsapp', 'broadcast', d(2025, 8, 1), d(2025, 8, 31), { total: 4200 }),
    c('wa-eid', 'Eid offer broadcast', 'whatsapp', 'whatsapp', 'broadcast', d(2026, 3, 1), d(2026, 3, 20), { total: 3800 }),
    c('wa-oct', 'No setup fee in October', 'whatsapp', 'whatsapp', 'broadcast', d(2026, 10, 1), d(2026, 10, 31), { total: 4500 }),
    c('aff-programme', 'Affiliate programme', 'affiliate', 'partner', 'affiliate', d(2024, 9, 1), null, { commission: AFFILIATE_RATE }, true),
    c('field-dhaka', 'Dhaka market visits', 'field', 'field', 'offline', d(2024, 9, 1), null, { monthly: 14000 }, true),
    c('field-elephant', 'Elephant Road campaign', 'field', 'field', 'offline', d(2025, 6, 1), d(2025, 9, 30), { monthly: 18000 }),
    c('ev-sme25', 'SME Fair Dhaka 2025', 'events', 'event', 'offline', d(2025, 2, 10), d(2025, 2, 20), { total: 65000 }),
    c('ev-expo26', 'E-commerce Expo Chattogram 2026', 'events', 'event', 'offline', d(2026, 1, 15), d(2026, 1, 18), { total: 48000 }),
  ];
}
function seedSchedules(now) {
  const by = ['Mahin Khan', 'Nusrat Islam', 'Tania Sultana'];
  return [
    { id: 'SCH-1', reportId: 'mrr-by-package', title: 'MRR by package', via: 'email', freq: 'monthly', to: 'founders@gridcommerce.net', time: '09:00', by: by[0], at: now - 40 * DAY },
    { id: 'SCH-2', reportId: 'invoices-due', title: 'Invoices due', via: 'whatsapp', freq: 'daily', to: '+880 1711-420310', time: '10:00', by: by[1], at: now - 21 * DAY },
    { id: 'SCH-3', reportId: 'campaign-attribution', title: 'Campaign attribution', via: 'email', freq: 'weekly', to: 'marketing@gridcommerce.net', time: '08:30', by: by[2], at: now - 9 * DAY },
  ];
}
/** Trials that ended without paying. The platform archives such a store 40 days after its trial and removes it, so
 *  analytics keeps the record (who, when, from where, why) to count trials and trial conversion honestly. */
const LAPSE_A = ['Nabil', 'Shapla', 'Rupkotha', 'Ananya', 'Bismillah', 'Moina', 'Kashful', 'Jui', 'Tahsin', 'Chandni', 'Shimu', 'Megher', 'Notun', 'Sonar', 'Priyo', 'Ruposh', 'Nirjhor', 'Alpona'];
const LAPSE_B = ['Fashion', 'Gadgets', 'Mart', 'Boutique', 'Store', 'Foods', 'Cosmetics', 'Shoes', 'Telecom', 'Crafts', 'Bazar', 'Collection', 'Organics', 'Kitchen'];
const LAPSE_WHY = [['No reply after the trial', 30], ['Not ready to sell online yet', 18], ['Too expensive for now', 16], ['Chose another platform', 12], ['Needed a feature we lack', 10], ['Only testing', 8], ['Selling on Facebook only', 6]];
const LAPSE_CH = [['meta', 32], ['organic', 16], ['google', 12], ['direct', 10], ['whatsapp', 8], ['affiliate', 6], ['referral', 6], ['field', 5], ['email', 3], ['events', 2]];
const LAPSE_DIST = [['Dhaka', 46], ['Chattogram', 14], ['Gazipur', 8], ['Narayanganj', 7], ['Sylhet', 6], ['Khulna', 5], ['Rajshahi', 5], ['Bogura', 4], ['Tangail', 3], ['Pabna', 2]];
function seedLapsed(now) {
  const out = [];
  let n = 1;
  for (let m = dhaka(2024, 9, 1); m < now; m = addMonths(m, 1, 1)) {
    const r = rng('an-lapsed:' + m);
    const age = Math.max(0, (m - dhaka(2024, 9, 1)) / (30.44 * DAY));
    const count = 2 + Math.floor(age / 5) + r.int(0, 3);
    for (let i = 0; i < count; i++) {
      const createdAt = m + r.int(0, 27) * DAY + r.int(9, 21) * H;
      if (createdAt + 16 * DAY > now) continue;
      const ladder = pickW(r, [['online', 70], ['retail', 20], ['wholesale', 10]]);
      out.push({
        id: 'LT-' + String(n++).padStart(4, '0'), name: r.pick(LAPSE_A) + ' ' + r.pick(LAPSE_B), createdAt, ladder,
        plan: pickW(r, [['growth', 60], ['business', 33], ['enterprise', 7]]), dist: pickW(r, LAPSE_DIST), channel: pickW(r, LAPSE_CH), reason: pickW(r, LAPSE_WHY),
      });
    }
  }
  return out;
}
export const analytics = createStore({
  key: 'analytics',
  version: 2,
  seed: (now) => ({ campaigns: seedCampaigns(), schedules: seedSchedules(now), lapsed: seedLapsed(now), seq: 4 }),
});

const activeOn = (campaigns, ch, at) => campaigns.filter((c) => c.channel === ch && c.start <= at && (!c.end || at < c.end + DAY));
/** The campaign a visit, lead or store on `ch` at `at` belongs to (or null). Draws exactly two numbers from r. */
function campaignFor(campaigns, ch, at, r) {
  const a = r(), b = r();
  if (CH[ch] && !CH[ch].web) {
    // offline: the latest campaign of that channel that started within 120 days
    const list = campaigns.filter((c) => c.channel === ch && c.start <= at && at - c.start <= 120 * DAY && (!c.end || at - c.end <= 120 * DAY));
    const recent = list.filter((c) => !c.always).sort((x, y) => y.start - x.start);
    return (recent[0] || list[0] || null);
  }
  const list = activeOn(campaigns, ch, at);
  if (!list.length || a >= (COVER[ch] || 0)) return null;
  const w = list.map((c) => [c.id, c.cost.ads || 1]);
  const id = pickW(() => b, w);
  return list.find((c) => c.id === id) || null;
}
function firstTouch(ch, r) {
  const a = r(), b = r();
  if (a < (STAY[ch] ?? 0.7)) return ch;
  const pool = FIRST_POOL.filter(([k]) => k !== ch);
  return pickW(() => b, pool);
}

// ---- website traffic, day by day ------------------------------------------------------------------------------------------
const T0 = dhaka(2024, 0, 1);
const DAYS = new Map();   // day → { ch: { v, s, pv, b, sec } }
/** The site's traffic on a whole day, per channel. */
function trafficOn(campaigns, day) {
  if (DAYS.has(day)) return DAYS.get(day);
  const r = rng('an-traffic:' + day);
  const months = Math.max(0, (day - T0) / (30.44 * DAY));
  const wd = new Date(day + TZ).getUTCDay();
  const week = wd === 5 ? 0.68 : wd === 6 ? 0.9 : wd === 4 ? 0.94 : 1;
  const base = (380 + months * 21) * week * (0.88 + r() * 0.24);
  const out = {};
  for (const c of SOURCES) {
    const b = BEHAVIOUR[c.key];
    const boost = 1 + 0.32 * activeOn(campaigns, c.key, day + 12 * H).filter((x) => !x.always).length;
    const v = Math.round(base * b.share * boost * (0.85 + r() * 0.3));
    const s = Math.round(v * b.spv * (0.95 + r() * 0.1));
    out[c.key] = { v, s, pv: Math.round(s * b.pps * (0.92 + r() * 0.16)), b: Math.round(s * b.bounce * (0.92 + r() * 0.16)), sec: Math.round(s * b.sec * (0.9 + r() * 0.2)) };
  }
  if (DAYS.size > 3000) DAYS.clear();
  DAYS.set(day, out);
  return out;
}
/** How much of a day falls inside [from, min(to, t)) — today counts the hours gone. */
const dayPart = (day, from, to, t) => clamp01((Math.min(to, t, day + DAY) - Math.max(from, day)) / DAY);

/** Each day's leads as records: { at, channel, type, page, device, division, campaign, first, firstCampaign }. */
const LEADS = new Map();
function leadsOn(campaigns, day) {
  if (LEADS.has(day)) return LEADS.get(day);
  const n = funnel(day, day + DAY).new;
  const r = rng('an-lead:' + day);
  const out = [];
  for (let i = 0; i < n; i++) {
    const at = day + (8 + r() * 15) * H;
    const channel = pickW(r, LEAD_MIX);
    const web = CH[channel].web;
    const form = pickW(r, FORM_MIX);
    const page = web ? pickW(r, Object.entries(LANDING[channel]).map(([p, w]) => [p, w * (PAGES.find((x) => x.path === p) || { conv: 1 }).conv])) : null;
    const dev = web ? pickW(r, DEVICES.map((d, k) => [d.key, DEVICE_MIX[channel][k]])) : null;
    const division = pickW(r, DIVISIONS);
    const campaign = campaignFor(campaigns, channel, at, r);
    const first = firstTouch(channel, r);
    const back = at - (3 + r() * 25) * DAY;
    const firstCampaign = first === channel ? campaign : campaignFor(campaigns, first, back, r);
    out.push({ at, channel, type: web ? form : channel === 'field' ? 'visit' : 'event', page, device: dev, division, campaign: campaign && campaign.id, first, firstCampaign: firstCampaign && firstCampaign.id });
  }
  if (LEADS.size > 3000) LEADS.clear();
  LEADS.set(day, out);
  return out;
}
/** Every lead in [from, min(to, t)). */
export function leadsIn(data, from, to, t) {
  const end = Math.min(to, t);
  const out = [];
  for (let d = startOfDay(from); d < end; d += DAY) for (const l of leadsOn(data.campaigns, d)) if (l.at >= from && l.at < end) out.push(l);
  return out;
}

/** Traffic totals per channel over [from, to), today counted so far. */
function trafficIn(data, from, to, t) {
  const by = Object.fromEntries(SOURCES.map((c) => [c.key, { v: 0, s: 0, pv: 0, b: 0, sec: 0 }]));
  for (let d = startOfDay(from); d < Math.min(to, t); d += DAY) {
    const part = dayPart(d, from, to, t);
    if (part <= 0) continue;
    const day = trafficOn(data.campaigns, d);
    for (const k in day) for (const f in day[k]) by[k][f] += day[k][f] * part;
  }
  for (const k in by) for (const f in by[k]) by[k][f] = Math.round(by[k][f]);
  return by;
}

// ---- acquisition: one row per store ---------------------------------------------------------------------------------------
function payIndex(db) {
  const by = {};
  for (const p of db.payments) {
    if (p.status !== 'ok') continue;
    const x = by[p.shopId] || (by[p.shopId] = { total: 0, first: null, list: [] });
    x.total += p.amount; x.list.push(p);
    if (x.first == null || p.at < x.first) x.first = p.at;
  }
  return by;
}
/** Every store with where it came from (last and first touch, campaign), whether it became paying, when, and what it
 *  has paid so far, plus the trials that ended without paying (lapsed: true, kept by this module). Stores still being
 *  set up are left out. */
export function acquisitions(db, data, t) {
  const pays = payIndex(db);
  const out = [];
  for (const shop of db.shops) {
    const st = subState(db, shop.id, t);
    if (st.key === 'setup' || st.key === 'failed') continue;
    const sub = subOf(db, shop.id);
    const r = rng('an-acq:' + shop.id);
    const channel = SRC_CHANNEL[shop.src] || (hash(shop.id) % 10 < 6 ? 'organic' : 'direct');
    const named = shop.campaign ? data.campaigns.find((c) => c.name === shop.campaign) : null;
    const campaign = named || campaignFor(data.campaigns, channel, shop.createdAt, r);
    const first = firstTouch(channel, r);
    const firstCampaign = first === channel ? campaign : campaignFor(data.campaigns, first, shop.createdAt - (4 + r() * 30) * DAY, r);
    const page = CH[channel].web ? pickW(r, Object.entries(LANDING[channel])) : null;
    const p = pays[shop.id];
    const converted = !!(p && p.total > 0) || isPaying(st);
    const paidAt = converted ? (p && p.first) || sub.trialStart + (sub.trialDays || 15) * DAY : null;
    let leftAt = sub.cancelledAt || sub.pausedAt || null;
    if (!leftAt && st.key === 'suspended') leftAt = t - Math.max(0, (st.days || 0) - READONLY_DAYS) * DAY;
    out.push({
      id: shop.id, name: shop.name, createdAt: shop.createdAt, ladder: sub.ladder, plan: sub.plan,
      packageName: `${ladderLabel(sub.ladder)} · ${PLAN_NAME[sub.plan]}`, dist: shop.dist, division: DIVISION_OF[shop.dist] || 'Dhaka',
      src: shop.src, channel, first, campaign: campaign && campaign.id, firstCampaign: firstCampaign && firstCampaign.id, page,
      converted, paidAt, revenue: p ? p.total : 0, payments: p ? p.list : [], state: st, stateKey: st.key,
      trialEnd: sub.trialStart + (sub.trialDays || 15) * DAY, leftAt, cancelReason: sub.cancelReason || (sub.pausedAt ? 'Paused by the owner' : st.key === 'suspended' ? 'Suspended for unpaid bills' : null),
      paying: isPaying(st), mrr: isPaying(st) ? mrrOf(db, sub, t) : 0,
    });
  }
  for (const l of data.lapsed || []) {
    if (l.createdAt > t) continue;
    const r = rng('an-acq:' + l.id);
    const campaign = campaignFor(data.campaigns, l.channel, l.createdAt, r);
    const first = firstTouch(l.channel, r);
    const firstCampaign = first === l.channel ? campaign : campaignFor(data.campaigns, first, l.createdAt - (4 + r() * 30) * DAY, r);
    const page = CH[l.channel].web ? pickW(r, Object.entries(LANDING[l.channel])) : null;
    out.push({
      id: l.id, name: l.name, lapsed: true, createdAt: l.createdAt, ladder: l.ladder, plan: l.plan, packageName: `${ladderLabel(l.ladder)} · ${PLAN_NAME[l.plan]}`,
      dist: l.dist, division: DIVISION_OF[l.dist] || 'Dhaka', src: null, channel: l.channel, first, campaign: campaign && campaign.id, firstCampaign: firstCampaign && firstCampaign.id, page,
      converted: false, paidAt: null, revenue: 0, payments: [], state: { key: 'lapsed', label: 'Trial ended, not paying' }, stateKey: 'lapsed',
      trialEnd: l.createdAt + 15 * DAY, leftAt: null, cancelReason: null, lapseReason: l.reason, paying: false, mrr: 0,
    });
  }
  return out;
}
/** Paying at moment x (became paying by then and had not left). */
const payingAt = (a, x) => a.converted && a.paidAt <= x && a.createdAt <= x && !(a.leftAt && a.leftAt <= x);

// ---- website --------------------------------------------------------------------------------------------------------------
/** Everything the Website page shows for [from, to). */
export function website(data, from, to, t, acq = null) {
  const by = trafficIn(data, from, to, t);
  const leads = leadsIn(data, from, to, t).filter((l) => CH[l.channel].web);
  const trials = (acq || []).filter((a) => CH[a.channel].web && a.createdAt >= from && a.createdAt < Math.min(to, t));
  const totals = { v: 0, s: 0, pv: 0, b: 0, sec: 0 };
  for (const k in by) for (const f in totals) totals[f] += by[k][f];
  const count = (list, f) => list.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m; }, {});
  const leadBy = count(leads, (l) => l.channel);
  const trialBy = count(trials, (a) => a.channel);
  const forms = count(leads, (l) => l.type);
  const channels = SOURCES.map((c) => {
    const x = by[c.key];
    const l = leadBy[c.key] || 0;
    return { key: c.key, name: c.name, color: c.color, visitors: x.v, sessions: x.s, pageviews: x.pv, bounce: ratio(x.b, x.s), avgSec: ratio(x.sec, x.s), leads: l, trials: trialBy[c.key] || 0, conv: ratio(l, x.s) };
  }).sort((a, b) => b.visitors - a.visitors);

  // landing pages: each channel's sessions spread over where it lands
  const pageRows = PAGES.map((p) => ({ ...p, sessions: 0, bounces: 0, sec: 0, leads: 0, trials: 0 }));
  const pageBy = Object.fromEntries(pageRows.map((p) => [p.path, p]));
  for (const c of SOURCES) {
    const land = LANDING[c.key];
    const wsum = sum(Object.values(land), (w) => w);
    for (const [path, w] of Object.entries(land)) {
      const p = pageBy[path];
      const s = by[c.key].s * (w / wsum);
      p.sessions += s;
      p.bounces += s * p.bounce * (BEHAVIOUR[c.key].bounce / 0.42);
      p.sec += s * p.time * (BEHAVIOUR[c.key].sec / 110);
    }
  }
  for (const l of leads) if (pageBy[l.page]) pageBy[l.page].leads++;
  for (const a of trials) if (pageBy[a.page]) pageBy[a.page].trials++;
  const pages = pageRows.map((p) => ({ path: p.path, title: p.title, sessions: Math.round(p.sessions), bounce: ratio(p.bounces, p.sessions), avgSec: ratio(p.sec, p.sessions), leads: p.leads, trials: p.trials, conv: ratio(p.leads, p.sessions) }))
    .sort((a, b) => b.sessions - a.sessions);

  const devices = DEVICES.map((d, k) => ({ ...d, visitors: Math.round(sum(SOURCES, (c) => by[c.key].v * DEVICE_MIX[c.key][k] / 100)), leads: leads.filter((l) => l.device === d.key).length }));
  const bd = totals.v * COUNTRIES[0][1] / 100;
  const divisionLeads = count(leads, (l) => l.division);
  const divisions = DIVISIONS.map(([name, w]) => ({ name, visitors: Math.round(bd * w / 100), leads: divisionLeads[name] || 0 }));
  const countries = COUNTRIES.map(([name, w]) => ({ name, visitors: Math.round(totals.v * w / 100) }));
  const conversions = CONVERSIONS.map(([key, label]) => {
    const n = key === 'trial' ? trials.length : forms[key] || 0;
    return { key, label, count: n, rate: ratio(n, totals.s) };
  });
  return {
    visitors: totals.v, sessions: totals.s, pageviews: totals.pv, bounce: ratio(totals.b, totals.s), avgSec: ratio(totals.sec, totals.s),
    pagesPerSession: ratio(totals.pv, totals.s), leads: leads.length, signups: forms.signup || 0, trials: trials.length,
    conv: ratio(leads.length, totals.s), channels, pages, devices, divisions, countries, conversions,
  };
}
/** Visitors per bucket and channel over [from, to). */
export function trafficTrend(data, from, to, t) {
  const b = buckets(from, to);
  return {
    unit: b.unit,
    list: b.list.map((x) => {
      const by = x.from < t ? trafficIn(data, x.from, x.to, t) : null;
      return { label: x.label, title: x.title, values: SOURCES.map((c) => (by ? by[c.key].v : null)), total: by ? sum(SOURCES, (c) => by[c.key].v) : null };
    }),
  };
}

// ---- attribution ------------------------------------------------------------------------------------------------------------
/** What each campaign cost per channel over [from, to): ad spend split by the campaigns running, monthly and one-off
 *  costs spread over their days, affiliate commission on what affiliate stores paid in the period. */
function costsIn(data, acq, from, to, t) {
  const camp = {};
  const chan = {};
  const add = (ch, id, v) => { chan[ch] = (chan[ch] || 0) + v; const k = id || ch + ':none'; camp[k] = (camp[k] || 0) + v; };
  const end = Math.min(to, t);
  for (let d = startOfDay(from); d < end; d += DAY) {
    const part = dayPart(d, from, to, t);
    if (part <= 0) continue;
    const spend = adSpendOn(d) * part;
    for (const ch of ['meta', 'google']) {
      const list = activeOn(data.campaigns, ch, d + 12 * H).filter((c) => c.cost.ads);
      const w = sum(list, (c) => c.cost.ads);
      if (!list.length) add(ch, null, spend * SPEND[ch]);
      else for (const c of list) add(ch, c.id, spend * SPEND[ch] * (c.cost.ads / w));
    }
    for (const c of data.campaigns) {
      if (c.start > d + 12 * H || (c.end && d > c.end)) continue;
      if (c.cost.monthly) add(c.channel, c.id, (c.cost.monthly / 30) * part);
      if (c.cost.total) {
        const days = Math.max(1, Math.round(((c.end || c.start) - c.start) / DAY) + 1);
        add(c.channel, c.id, (c.cost.total / days) * part);
      }
    }
  }
  for (const a of acq) {
    if (a.channel !== 'affiliate') continue;
    const paid = sum(a.payments.filter((p) => p.at >= from && p.at < end), (p) => p.amount);
    if (paid) add('affiliate', a.campaign || 'aff-programme', paid * AFFILIATE_RATE);
  }
  return { camp, chan };
}
/** Visits per campaign over [from, to): a running campaign carries its share of its channel's visits. */
function campaignVisits(data, from, to, t) {
  const out = {};
  const end = Math.min(to, t);
  for (let d = startOfDay(from); d < end; d += DAY) {
    const part = dayPart(d, from, to, t);
    if (part <= 0) continue;
    const day = trafficOn(data.campaigns, d);
    for (const c of SOURCES) {
      const v = day[c.key].v * part;
      const list = activeOn(data.campaigns, c.key, d + 12 * H);
      const cover = list.length ? COVER[c.key] || 0 : 0;
      const w = sum(list, (x) => x.cost.ads || 1);
      for (const x of list) out[x.id] = (out[x.id] || 0) + v * cover * ((x.cost.ads || 1) / w);
      out[c.key + ':none'] = (out[c.key + ':none'] || 0) + v * (1 - cover);
    }
  }
  return out;
}
/** The attribution table over [from, to): by 'channel' or 'campaign', under the 'last' or 'first' touch model.
 *  Visits and cost don't depend on the model; leads, trials, paid and revenue follow it. Revenue is what the paid
 *  stores have paid so far. CAC = cost ÷ paid; ROAS = revenue ÷ cost. */
export function attribution(db, data, from, to, t, { model = 'last', by = 'channel', acq = null } = {}) {
  const A = acq || acquisitions(db, data, t);
  const end = Math.min(to, t);
  const traffic = trafficIn(data, from, to, t);
  const leads = leadsIn(data, from, to, t);
  const trials = A.filter((a) => a.createdAt >= from && a.createdAt < end);
  const cost = costsIn(data, A, from, to, t);
  const chOf = (x) => (model === 'first' ? x.first : x.channel);
  const cpOf = (x) => { const ch = chOf(x); const id = model === 'first' ? x.firstCampaign : x.campaign; return id || ch + ':none'; };
  const rows = {};
  const row = (key) => rows[key] || (rows[key] = { key, visits: 0, leads: 0, trials: 0, paid: 0, revenue: 0, cost: 0 });
  if (by === 'campaign') {
    const visits = campaignVisits(data, from, to, t);
    for (const [k, v] of Object.entries(visits)) row(k).visits += v;
    for (const l of leads) row(cpOf(l)).leads++;
    for (const a of trials) { const r = row(cpOf(a)); r.trials++; if (a.converted) { r.paid++; r.revenue += a.revenue; } }
    for (const [k, v] of Object.entries(cost.camp)) row(k).cost += v;
  } else {
    for (const c of SOURCES) row(c.key).visits = traffic[c.key].v;
    for (const l of leads) row(chOf(l)).leads++;
    for (const a of trials) { const r = row(chOf(a)); r.trials++; if (a.converted) { r.paid++; r.revenue += a.revenue; } }
    for (const [k, v] of Object.entries(cost.chan)) row(k).cost += v;
  }
  const list = Object.values(rows).map((r) => {
    let name, channel, utm = '';
    if (by === 'campaign') {
      const c = data.campaigns.find((x) => x.id === r.key);
      channel = c ? c.channel : r.key.split(':')[0];
      name = c ? c.name : channelName(channel) + ' · no campaign';
      utm = c ? `${c.source} / ${c.medium} / ${c.slug}` : '';
    } else { channel = r.key; name = channelName(r.key); utm = (CH[r.key] || {}).utm || ''; }
    const visits = Math.round(r.visits);
    const costR = Math.round(r.cost);
    return {
      ...r, visits: CH[channel] && CH[channel].web ? visits : null, cost: costR, name, channel, channelName: channelName(channel), utm,
      leadRate: ratio(r.leads, visits), trialRate: ratio(r.trials, r.leads), paidRate: ratio(r.paid, r.trials),
      cac: r.paid && costR ? costR / r.paid : null, roas: costR ? r.revenue / costR : null,
    };
  }).filter((r) => r.visits || r.leads || r.trials || r.cost)
    .sort((a, b) => b.trials - a.trials || b.leads - a.leads || (b.visits || 0) - (a.visits || 0));
  const total = list.reduce((s, r) => ({ visits: s.visits + (r.visits || 0), leads: s.leads + r.leads, trials: s.trials + r.trials, paid: s.paid + r.paid, revenue: s.revenue + r.revenue, cost: s.cost + r.cost }), { visits: 0, leads: 0, trials: 0, paid: 0, revenue: 0, cost: 0 });
  total.cac = total.paid && total.cost ? total.cost / total.paid : null;
  total.roas = total.cost ? total.revenue / total.cost : null;
  return { rows: list, total };
}
/** Share of trials (or paid stores) per channel under each model, for the first vs last touch bars. */
export function touchShares(acq, from, to, t, field = 'trials') {
  const end = Math.min(to, t);
  const list = acq.filter((a) => a.createdAt >= from && a.createdAt < end && (field === 'paid' ? a.converted : true));
  const n = list.length || 1;
  return CHANNELS.map((c) => ({
    key: c.key, name: c.name, color: c.color,
    last: list.filter((a) => a.channel === c.key).length / n,
    first: list.filter((a) => a.first === c.key).length / n,
  })).filter((r) => r.last || r.first);
}

// ---- growth -------------------------------------------------------------------------------------------------------------
/** Leads in [from, to) (the sales funnel), trials started, trials that ended and became paying, stores whose first paid
 *  month started, and paying stores that left. */
export function growthFunnel(A, from, to, t) {
  const end = Math.min(to, t);
  const leads = funnel(from, end).new;
  const trials = A.filter((a) => a.createdAt >= from && a.createdAt < end).length;
  const ended = A.filter((a) => a.trialEnd >= from && a.trialEnd < end && a.trialEnd <= t);
  const won = ended.filter((a) => a.converted).length;
  const newPaying = A.filter((a) => a.converted && a.paidAt >= from && a.paidAt < end).length;
  const left = A.filter((a) => a.leftAt && a.leftAt >= from && a.leftAt < end && a.converted).length;
  const payingStart = A.filter((a) => payingAt(a, from)).length;
  return { leads, trials, ended: ended.length, won, newPaying, left, payingStart, leadToTrial: ratio(trials, leads), trialToPaid: ratio(won, ended.length), churn: ratio(left, payingStart) };
}

/** Sales & growth for [from, to): the lead → trial → paid funnel, 12 months of subscriptions and revenue, retention by
 *  sign-up month, churn and its reasons, packages, modules and lifetime value. */
export function growth(db, data, from, to, t, acq = null) {
  const A = acq || acquisitions(db, data, t);
  const x = executive(db, t, 'year');

  // 12 months
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const mFrom = addMonths(startOfMonth(t), -i, 1);
    const mTo = i === 0 ? t : addMonths(startOfMonth(t), -i + 1, 1);
    const mrr = x.mrr.months[11 - i];
    months.push({
      label: monthOf(mFrom), title: monthOf(mFrom) + ' ' + yearOf(mFrom) + (i === 0 ? ' (so far)' : ''), from: mFrom, to: mTo,
      mrrBy: mrr.values, mrr: sum(mrr.values, (v) => v),
      paying: A.filter((a) => payingAt(a, mTo - 1)).length,
      payingBy: ['online', 'retail', 'wholesale'].map((l) => A.filter((a) => a.ladder === l && payingAt(a, mTo - 1)).length),
      trials: A.filter((a) => a.createdAt >= mFrom && a.createdAt < mTo).length,
      newPaying: A.filter((a) => a.converted && a.paidAt >= mFrom && a.paidAt < mTo).length,
      left: A.filter((a) => a.converted && a.leftAt && a.leftAt >= mFrom && a.leftAt < mTo).length,
      collected: sum(db.payments.filter((p) => p.status === 'ok' && p.at >= mFrom && p.at < mTo), (p) => p.amount),
    });
  }

  // retention by sign-up month: of the stores that became paying, the share still paying 1, 3 and 6 months later
  const cohorts = [];
  for (let i = 11; i >= 0; i--) {
    const mFrom = addMonths(startOfMonth(t), -i, 1);
    const mTo = addMonths(startOfMonth(t), -i + 1, 1);
    const group = A.filter((a) => a.createdAt >= mFrom && a.createdAt < mTo);
    const conv = group.filter((a) => a.converted);
    const after = (k) => {
      const due = conv.filter((a) => addMonths(a.paidAt, k) <= t);
      if (!due.length) return null;
      return due.filter((a) => payingAt(a, addMonths(a.paidAt, k))).length / due.length;
    };
    cohorts.push({ key: mFrom, label: monthOf(mFrom) + ' ' + yearOf(mFrom), signed: group.length, converted: conv.length, convRate: ratio(conv.length, group.length), m1: after(1), m3: after(3), m6: after(6), stillTrial: group.filter((a) => a.stateKey === 'trial').length });
  }

  // churn reasons: stores that stopped paying (cancelled, archived, paused, suspended), all time and in the period
  const gone = A.filter((a) => a.converted && a.leftAt && a.leftAt <= t).sort((p, q) => q.leftAt - p.leftAt);
  const reasonCount = {};
  for (const a of gone) reasonCount[a.cancelReason || 'No reason given'] = (reasonCount[a.cancelReason || 'No reason given'] || 0) + 1;
  const reasons = Object.entries(reasonCount).map(([name, n]) => ({ name, count: n })).sort((p, q) => q.count - p.count);
  // why trials that ended in the period did not pay
  const lapseCount = {};
  for (const a of A) if (a.lapsed && a.trialEnd >= from && a.trialEnd < Math.min(to, t)) lapseCount[a.lapseReason] = (lapseCount[a.lapseReason] || 0) + 1;
  const lapseReasons = Object.entries(lapseCount).map(([name, n]) => ({ name, count: n })).sort((p, q) => q.count - p.count);

  // packages: live stores by ladder and plan
  const live = A.filter((a) => !a.lapsed && isLiveStore(a.state));
  const packages = [];
  for (const ladder of ['online', 'retail', 'wholesale']) {
    for (const plan of ['growth', 'business', 'enterprise']) {
      const g = live.filter((a) => a.ladder === ladder && a.plan === plan);
      if (!g.length) continue;
      packages.push({ key: ladder + ':' + plan, ladder, plan, name: `${ladderLabel(ladder)} · ${PLAN_NAME[plan]}`, stores: g.length, paying: g.filter((a) => a.paying).length, trial: g.filter((a) => a.stateKey === 'trial').length, mrr: sum(g, (a) => a.mrr) });
    }
  }
  const mrrTotal = sum(packages, (p) => p.mrr);
  packages.forEach((p) => { p.share = ratio(p.mrr, mrrTotal); });
  packages.sort((p, q) => q.mrr - p.mrr || q.stores - p.stores);

  // modules: share of live stores using each (sets every store has are left out)
  const modules = moduleAdoption(db, t);

  // lifetime value
  const u = x.unit;
  const churn = x.figs.churn / 100;
  return {
    funnel: growthFunnel(A, from, to, t),
    months, cohorts, gone, reasons, lapseReasons, packages, modules,
    mrr: x.figs.mrr, mrrChange: x.figs.mrrChange, arr: x.mrr.arr, paying: x.merchants.paying, trial: x.merchants.trial,
    ltv: { arpa: u.arpa, churn, ltv: u.ltv, cac: u.cac, ratio: u.cac ? u.ltv / u.cac : null, months: churn > 0 ? 1 / churn : null },
  };
}
const LADDER_SETS = ['online', 'retail', 'wholesale'];
/** Module adoption across live stores (paying and on trial). optional: not part of a segment's own set (grow, scale,
 *  credit add-ons, services), so it shows a real choice rather than the segment mix. */
export function moduleAdoption(db, t, ladder = '') {
  const live = db.shops.filter((s) => { const st = subState(db, s.id, t); return isPaying(st) || st.key === 'trial'; })
    .filter((s) => !ladder || (subOf(db, s.id) || {}).ladder === ladder);
  const counts = {};
  const trials = {};
  for (const s of live) for (const m of modulesOf(db, s, t)) {
    if (!m.active) continue;
    counts[m.code] = (counts[m.code] || 0) + 1;
    if (m.state === 'trial') trials[m.code] = (trials[m.code] || 0) + 1;
  }
  return MODULES.filter((m) => m.set !== 'platform' && m.set !== 'everyday').map((m) => ({
    code: m.code, name: m.name, set: m.set, setLabel: (SETS.find((x) => x.id === m.set) || {}).label || m.set,
    stores: counts[m.code] || 0, trials: trials[m.code] || 0, share: ratio(counts[m.code] || 0, live.length),
    of: live.length, optional: !LADDER_SETS.includes(m.set),
  })).sort((a, b) => b.stores - a.stores || a.name.localeCompare(b.name));
}

// ---- usage across every store ---------------------------------------------------------------------------------------------
export const USAGE_KEYS = [
  ['api', 'API requests', 'requests'], ['sms', 'SMS', 'messages'], ['ai', 'AI', 'replies and credits'],
  ['messaging', 'WhatsApp, email & calls', 'messages and minutes'], ['storage', 'Storage', 'GB'],
];
/** This month's usage per store and in total, and 12 months of trend. */
export function usage(db, t) {
  const day = Math.max(1, dayOfMonth(t));
  const stores = [];
  for (const shop of db.shops) {
    const st = subState(db, shop.id, t);
    if (!isLiveStore(st)) continue;
    const u = usageOf(db, shop, t);
    const c = Object.fromEntries(u.comms.map((x) => [x.key, x]));
    const res = Object.fromEntries(u.resources.map((x) => [x.key, x]));
    const row = merchantRow(db, shop, t);
    stores.push({
      id: shop.id, name: shop.name, packageName: row.packageName, stateLabel: st.label, tone: row.tone, createdAt: shop.createdAt,
      api: res.api.used, apiLimit: res.api.limit, sms: c.sms.count, smsIncluded: res.sms.limit, whatsapp: c.whatsapp.count, email: c.email.count,
      aiReplies: c.ai.count, aiCredits: res.ai.used, ai: c.ai.count + res.ai.used, calls: c.calls.count,
      messaging: c.whatsapp.count + c.email.count + c.calls.count, storage: res.storage.used, storageLimit: res.storage.unlimited ? null : res.storage.limit,
      cost: sum(u.comms, (x) => x.cost), orders: u.orders, leftAt: (subOf(db, shop.id) || {}).cancelledAt || null,
    });
  }
  const totals = {};
  for (const k of ['api', 'sms', 'whatsapp', 'email', 'aiReplies', 'aiCredits', 'ai', 'calls', 'messaging', 'storage', 'cost', 'orders']) totals[k] = sum(stores, (s) => s[k]);
  totals.storage = Math.round(totals.storage * 10) / 10;

  // trend: each store's monthly pace, back through the months it was live (newer stores grew into it)
  const trend = [];
  for (let i = 11; i >= 0; i--) {
    const mFrom = addMonths(startOfMonth(t), -i, 1);
    const mTo = i === 0 ? t : addMonths(startOfMonth(t), -i + 1, 1);
    const v = { api: 0, sms: 0, ai: 0, messaging: 0, storage: 0 };
    for (const s of stores) {
      if (s.createdAt >= mTo) continue;
      if (i === 0) { v.api += s.api; v.sms += s.sms; v.ai += s.ai; v.messaging += s.messaging; v.storage += s.storage; continue; }
      const r = rng('an-use:' + s.id + ':' + mFrom);
      const age = clamp01((mTo - s.createdAt) / (120 * DAY));
      const grow = Math.sqrt(age) * (1 - 0.035 * i) * (0.94 + r() * 0.12);
      const full = 30 / day;
      v.api += s.api * full * grow; v.sms += s.sms * full * grow; v.ai += s.ai * full * grow * (0.7 + 0.3 * (1 - i / 11));
      v.messaging += s.messaging * full * grow; v.storage += s.storage * (0.4 + 0.6 * age) * (1 - i * 0.045);
    }
    trend.push({ label: monthOf(mFrom), title: monthOf(mFrom) + ' ' + yearOf(mFrom) + (i === 0 ? ' (so far)' : ''), api: Math.round(v.api), sms: Math.round(v.sms), ai: Math.round(v.ai), messaging: Math.round(v.messaging), storage: Math.round(v.storage * 10) / 10 });
  }
  return { stores, totals, trend, day };
}

// ---- overview -------------------------------------------------------------------------------------------------------------
/** The headline for [from, to): visitors → signups → trials → paying, MRR, churn and the top channels. */
export function overview(db, data, from, to, t, acq = null) {
  const A = acq || acquisitions(db, data, t);
  const w = website(data, from, to, t, A);
  const end = Math.min(to, t);
  const trials = A.filter((a) => a.createdAt >= from && a.createdAt < end);
  const paying = A.filter((a) => a.converted && a.paidAt >= from && a.paidAt < end);
  const left = A.filter((a) => a.converted && a.leftAt && a.leftAt >= from && a.leftAt < end);
  const payingStart = A.filter((a) => payingAt(a, from)).length;
  const channels = CHANNELS.map((c) => ({
    key: c.key, name: c.name, color: c.color,
    visitors: c.web ? (w.channels.find((x) => x.key === c.key) || {}).visitors || 0 : null,
    trials: trials.filter((a) => a.channel === c.key).length,
    paid: trials.filter((a) => a.channel === c.key && a.converted).length,
  })).sort((a, b) => b.trials - a.trials || (b.visitors || 0) - (a.visitors || 0));
  return {
    visitors: w.visitors, sessions: w.sessions, signups: w.signups, leads: w.leads, trials: trials.length, newPaying: paying.length,
    left: left.length, churnRate: ratio(left.length, payingStart), conv: w.conv, channels,
  };
}

// ---- scheduled reports (UI only: nothing is sent) ---------------------------------------------------------------------------
export const FREQS = [['daily', 'Every day'], ['weekly', 'Every week (Saturday)'], ['monthly', 'Every month (1st)']];
export const SEND_VIA = [['email', 'Email'], ['whatsapp', 'WhatsApp']];
export const schedules = () => analytics.get().schedules;
/** The next time a schedule sends after t. */
export function nextRun(s, t) {
  const [h, m] = String(s.time || '09:00').split(':').map(Number);
  let at = startOfDay(t) + (h || 0) * H + (m || 0) * 6e4;
  if (s.freq === 'daily') { if (at <= t) at += DAY; return at; }
  if (s.freq === 'weekly') {
    while (new Date(at + TZ).getUTCDay() !== 6 || at <= t) at += DAY;   // Saturday, the first day of the week here
    return at;
  }
  let first = startOfMonth(t) + (h || 0) * H + (m || 0) * 6e4;
  if (first <= t) first = addMonths(startOfMonth(t), 1, 1) + (h || 0) * H + (m || 0) * 6e4;
  return first;
}
/** Add a schedule. { reportId, title, via: 'email'|'whatsapp', freq, to, time 'HH:MM' } */
export function addSchedule(f) {
  if (!f || !f.reportId) return { ok: false, field: 'report', error: 'Pick a report.' };
  const to = String(f.to || '').trim();
  if (f.via === 'whatsapp') {
    if (!/^\+?[0-9][0-9 -]{9,16}$/.test(to)) return { ok: false, field: 'to', error: 'Enter a WhatsApp number, e.g. +880 1711-420310.' };
  } else if (!to.split(/[,;]\s*/).every((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e))) return { ok: false, field: 'to', error: 'Enter an email address (several with commas).' };
  if (!FREQS.some(([k]) => k === f.freq)) return { ok: false, field: 'freq', error: 'Pick how often.' };
  if (!/^\d{2}:\d{2}$/.test(f.time || '')) return { ok: false, field: 'time', error: 'Pick a time.' };
  return analytics.commit((data, now) => {
    const dup = data.schedules.find((s) => s.reportId === f.reportId && s.via === f.via && s.freq === f.freq && s.to === to);
    if (dup) return { ok: false, error: 'This report already goes there on that schedule.' };
    const n = data.seq || data.schedules.length + 1;
    data.seq = n + 1;
    const id = 'SCH-' + n;
    data.schedules.unshift({ id, reportId: f.reportId, title: f.title || f.reportId, via: f.via, freq: f.freq, to, time: f.time, by: staff().name, at: now });
    return { ok: true, id };
  });
}
export function removeSchedule(id) {
  return analytics.commit((data) => {
    const i = data.schedules.findIndex((s) => s.id === id);
    if (i < 0) return { ok: false, error: 'This schedule is already gone.' };
    data.schedules.splice(i, 1);
    return { ok: true };
  });
}
