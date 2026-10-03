// attribution — how online sales receive marketing credit (Nayeem's brief #14, "Attribution & UTM").
//
// Raw touchpoints are kept per order and never rewritten; a model is applied when the numbers are read, so changing
// the model changes every report at once and the raw journey stays the same.
//   touchesOf(order) → [{ at, source, medium, campaign, raw: { utm_source, utm_medium, utm_campaign }, channel, platform, paid }]
//   MODELS           first click · last click · last non-direct · linear · position-based, each with its version
//   creditOf(order, { model, windowDays }) → [{ channel, platform, campaign, share }]   (shares add up to 1)
//   creditTable({ from, to, model, windowDays, basis }) → rows by channel with orders, net sales and delivered orders
//   getSetting() / setSetting({ model, windowDays }) — the model the shop reports with, with a history of changes
//
// Demo data: an order's journey is made up the same way every time from its id (a fixed seed), and always ends at the
// source the order records (Website, Facebook, Phone, Order link). Paid Meta touches carry the ad campaign that was
// running (adSpend.js). A real shop reads the journeys from the tracking server; front end only.

import { getOnlineOrders } from './salesBook';
import { getAdSpend } from './adSpend';

const DAY = 864e5;
const KEY = 'gc.attr.setting';
const HIST_KEY = 'gc.attr.history';
export const ATTR_EVENT = 'gc:attribution';

/** Models. `version` goes up when a rule changes; reports print "Model · vN". */
export const MODELS = [
  { id: 'first_click', name: 'First click', version: 1, short: 'All credit to the first touch.', rule: 'The first touch inside the window gets all the credit.' },
  { id: 'last_click', name: 'Last click', version: 1, short: 'All credit to the last touch.', rule: 'The last touch before the order gets all the credit, even a direct visit.' },
  { id: 'last_non_direct', name: 'Last non-direct', version: 2, short: 'All credit to the last touch that wasn’t direct.', rule: 'The last touch that wasn’t a direct visit gets all the credit. Only direct visits: direct gets it.', changes: [{ v: 1, at: '2026-07-01', note: 'First version' }, { v: 2, at: '2026-09-20', note: 'Order links sent in chat count as a touch (WhatsApp & chat), not direct.' }] },
  { id: 'linear', name: 'Linear', version: 1, short: 'Credit shared equally.', rule: 'Every touch inside the window gets an equal share.' },
  { id: 'position_based', name: 'Position-based', version: 1, short: '40% first, 40% last, 20% the rest.', rule: 'The first and last touches get 40% each; the touches in between share 20%. Two touches: 50% each.' },
];
export const modelBy = (id) => MODELS.find((m) => m.id === id) || MODELS[2];
export const WINDOWS = [1, 7, 28];
export const DEFAULT_SETTING = { model: 'last_non_direct', windowDays: 7 };

/** Channels after cleaning (one name per idea; "fb", "Facebook" and "facebook.com" are one source). */
export const CHANNELS = [
  { id: 'meta_ads', name: 'Meta ads', platform: 'meta', paid: true },
  { id: 'google_ads', name: 'Google ads', platform: 'google', paid: true },
  { id: 'tiktok_ads', name: 'TikTok ads', platform: 'tiktok', paid: true },
  { id: 'social', name: 'Facebook & Instagram posts', platform: '', paid: false },
  { id: 'google_search', name: 'Google search', platform: '', paid: false },
  { id: 'chat', name: 'WhatsApp & chat', platform: '', paid: false },
  { id: 'email_sms', name: 'Email & SMS', platform: '', paid: false },
  { id: 'direct', name: 'Direct', platform: '', paid: false },
];
export const channelBy = (id) => CHANNELS.find((c) => c.id === id) || CHANNELS[CHANNELS.length - 1];

// ---- UTM cleaning --------------------------------------------------------------------------------
const SOURCE_ALIASES = {
  facebook: ['fb', 'facebook', 'facebook.com', 'm.facebook.com', 'l.facebook.com', 'meta'],
  instagram: ['ig', 'instagram', 'instagram.com', 'insta'],
  google: ['google', 'google.com', 'adwords', 'gads'],
  tiktok: ['tiktok', 'tik tok', 'tiktok.com', 'tt'],
  whatsapp: ['whatsapp', 'wa', 'wa.me', 'messenger', 'chat'],
  email: ['email', 'newsletter', 'mail'],
  sms: ['sms', 'text'],
  direct: ['(direct)', 'direct', ''],
};
const MEDIUM_ALIASES = { paid: ['cpc', 'paid', 'paid-social', 'paid_social', 'ppc', 'ads', 'paidsocial'], organic: ['organic', 'social', 'post', 'reel', 'referral'], chat: ['chat', 'message', 'dm'], email: ['email'], sms: ['sms'], none: ['(none)', 'none', ''] };
/** 'Facebook' / 'fb' / 'facebook.com' → 'facebook'. Unknown values are kept, lower case with dashes. */
export function cleanSource(raw) {
  const x = String(raw || '').trim().toLowerCase();
  const hit = Object.entries(SOURCE_ALIASES).find(([, list]) => list.includes(x));
  return hit ? hit[0] : x.replace(/[\s_]+/g, '-');
}
export function cleanMedium(raw) {
  const x = String(raw || '').trim().toLowerCase();
  const hit = Object.entries(MEDIUM_ALIASES).find(([, list]) => list.includes(x));
  return hit ? hit[0] : x.replace(/[\s_]+/g, '-');
}
/** The channel a cleaned source + medium belongs to. */
export function channelOf(source, medium) {
  if (source === 'facebook' || source === 'instagram') return medium === 'paid' ? 'meta_ads' : 'social';
  if (source === 'google') return medium === 'paid' ? 'google_ads' : 'google_search';
  if (source === 'tiktok') return medium === 'paid' ? 'tiktok_ads' : 'social';
  if (source === 'whatsapp') return 'chat';
  if (source === 'email' || source === 'sms') return 'email_sms';
  return 'direct';
}

// ---- demo journeys ---------------------------------------------------------------------------------
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function seeded(n) { let a = n >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const pick = (r, mix) => { const tot = mix.reduce((a, m) => a + m[0], 0); let x = r() * tot; for (const m of mix) { x -= m[0]; if (x <= 0) return m[1]; } return mix[mix.length - 1][1]; };
// raw spellings as they arrive from links (cleaned on read)
const RAW = {
  facebook: ['facebook', 'fb', 'Facebook', 'facebook.com'], instagram: ['instagram', 'ig', 'Instagram'], google: ['google', 'Google'], tiktok: ['tiktok', 'TikTok'],
  whatsapp: ['whatsapp', 'wa.me', 'WhatsApp'], email: ['email', 'newsletter'], sms: ['sms'], direct: ['(direct)'],
};
const RAW_MED = { paid: ['cpc', 'paid', 'paid-social', 'CPC'], organic: ['organic', 'social', 'reel'], chat: ['chat'], email: ['email'], sms: ['sms'], none: ['(none)'] };
// [weight, [source, medium]]
const EARLY = [[30, ['facebook', 'paid']], [12, ['instagram', 'paid']], [10, ['instagram', 'organic']], [18, ['google', 'organic']], [12, ['tiktok', 'paid']], [6, ['google', 'paid']], [12, ['direct', 'none']]];
const LAST_OF = {
  Facebook: [[62, ['facebook', 'paid']], [18, ['instagram', 'paid']], [20, ['facebook', 'organic']]],
  Website: [[22, ['google', 'paid']], [30, ['google', 'organic']], [26, ['direct', 'none']], [12, ['tiktok', 'paid']], [10, ['email', 'email']]],
  Phone: [[70, ['direct', 'none']], [30, ['facebook', 'organic']]],
  'Order link': [[100, ['whatsapp', 'chat']]],
  Chat: [[100, ['whatsapp', 'chat']]],
};

let adMemo = { at: 0, list: [] };
function adsNow() {
  const t = Date.now();
  if (t - adMemo.at > 5000) adMemo = { at: t, list: getAdSpend() };
  return adMemo.list;
}
const PLATFORMS_OF = { meta_ads: ['Facebook', 'Instagram'], google_ads: ['Google'], tiktok_ads: ['TikTok'] };
/** The ad campaign of a paid channel that was running at `t` (paid in the 14 days before), weighted by spend; '' if none. */
function adCampaign(channel, t, x, ig) {
  const plats = PLATFORMS_OF[channel] || [];
  const live = adsNow().filter((a) => plats.includes(a.platform) && a.at <= t && t - a.at <= 14 * DAY);
  const pool = channel === 'meta_ads' ? live.filter((a) => (ig ? a.platform === 'Instagram' : a.platform === 'Facebook')) : live;
  const list = pool.length ? pool : live;
  if (!list.length) return '';
  const r = () => x;   // one draw per touch, so adding ad spend later never shifts other touches
  return pick(r, list.map((a) => [a.amount, a.campaign]));
}

const MEMO = new Map();
/** The raw journey of one online order, oldest first. Never changes for the same order. */
export function touchesOf(o) {
  if (!o || !o.id) return [];
  const key = o.id + '|' + o.at;
  if (MEMO.has(key)) return MEMO.get(key);
  const r = seeded(hash(String(o.id)));
  const lastMix = LAST_OF[o.source] || LAST_OF.Website;
  const last = pick(r, lastMix);
  const extra = r() < 0.3 ? 0 : 1 + Math.floor(r() * 3);   // 0–3 touches before the last; most buyers come back once or twice
  const plan = [];
  let t = o.at - (5 + r() * 90) * 60 * 1000;   // the last touch: minutes before the order
  plan.unshift([last, t]);
  for (let i = 0; i < extra; i++) { t -= (0.3 + r() * (i ? 9 : 4)) * DAY; plan.unshift([pick(r, EARLY), t]); }
  const out = plan.map(([[src, med], at]) => {
    const rawSrc = RAW[src][Math.floor(r() * RAW[src].length)];
    const rawMed = (RAW_MED[med] || ['(none)'])[Math.floor(r() * (RAW_MED[med] || ['']).length)];
    const source = cleanSource(rawSrc);
    let medium = cleanMedium(rawMed);
    let channel = channelOf(source, medium);
    let campaign = '';
    const draw = r();
    let rawMedium = rawMed;
    if (PLATFORMS_OF[channel]) {
      campaign = adCampaign(channel, at, draw, source === 'instagram');
      // no ad of that platform was running then: the visit came from a post or a search, not an ad
      if (!campaign) { medium = 'organic'; rawMedium = source === 'google' ? 'organic' : 'social'; channel = channelOf(source, 'organic'); }
    }
    else if (channel === 'email_sms') campaign = 'Weekly offers';
    const c = channelBy(channel);
    const rawCampaign = campaign ? (r() < 0.5 ? campaign.toLowerCase().replace(/[^a-z0-9]+/g, '-') : campaign) : '';
    return { at: Math.round(at), source, medium, campaign, channel, platform: c.platform, paid: c.paid, raw: { utm_source: rawSrc, utm_medium: rawMedium, utm_campaign: rawCampaign } };
  });
  MEMO.set(key, out);
  return out;
}

/** Credit for one order under a model: [{ channel, platform, campaign, share }], shares add up to 1. */
export function creditOf(o, { model = DEFAULT_SETTING.model, windowDays = DEFAULT_SETTING.windowDays } = {}) {
  const all = touchesOf(o);
  const inWin = all.filter((t) => o.at - t.at <= windowDays * DAY);
  const list = inWin.length ? inWin : [];
  if (!list.length) return [{ channel: 'direct', platform: '', campaign: '', share: 1 }];
  const one = (t, share) => ({ channel: t.channel, platform: t.platform, campaign: t.campaign, share });
  switch (model) {
    case 'first_click': return [one(list[0], 1)];
    case 'last_click': return [one(list[list.length - 1], 1)];
    case 'linear': return list.map((t) => one(t, 1 / list.length));
    case 'position_based': {
      if (list.length === 1) return [one(list[0], 1)];
      if (list.length === 2) return [one(list[0], 0.5), one(list[1], 0.5)];
      const mid = list.slice(1, -1);
      return [one(list[0], 0.4), ...mid.map((t) => one(t, 0.2 / mid.length)), one(list[list.length - 1], 0.4)];
    }
    case 'last_non_direct':
    default: {
      const nd = list.filter((t) => t.channel !== 'direct');
      return [one(nd.length ? nd[nd.length - 1] : list[list.length - 1], 1)];
    }
  }
}

// ---- reading orders with credit -------------------------------------------------------------------
const DELIVERED = 'Delivered';
const isCancelled = (o) => o.status === 'Cancelled';
/** When the order counts under a date basis: 'placed' = order time, 'delivered' = delivery time (null if not delivered). */
export function basisTime(o, basis) {
  if (basis === 'delivered') return o.times && o.times.delivered ? o.times.delivered : (o.status === DELIVERED && !o.times ? o.at : null);
  return o.at;
}

let ordMemo = { at: 0, list: [] };
/** Online orders (salesBook.getOnlineOrders), read at most every few seconds. */
export function onlineOrders() {
  const t = Date.now();
  if (t - ordMemo.at > 3000) { try { ordMemo = { at: t, list: getOnlineOrders() }; } catch { ordMemo = { at: t, list: [] }; } }
  return ordMemo.list;
}

/**
 * Credit by channel for orders in [from, to) on a date basis:
 * { rows: [{ channel, name, platform, paid, orders, sales, delivered, deliveredSales }], total: {…}, model, version, windowDays, basis }
 * orders and sales are fractional under shared models.
 */
export function creditTable({ from, to, model, windowDays, basis = 'delivered', orders } = {}) {
  const set = { ...getSetting(), ...(model ? { model } : {}), ...(windowDays ? { windowDays } : {}) };
  const list = (orders || onlineOrders()).filter((o) => !isCancelled(o)).filter((o) => { const t = basisTime(o, basis); return t != null && t >= from && t < to; });
  const by = new Map(CHANNELS.map((c) => [c.id, { channel: c.id, name: c.name, platform: c.platform, paid: c.paid, orders: 0, sales: 0, delivered: 0, deliveredSales: 0, campaigns: new Map() }]));
  list.forEach((o) => {
    const dl = !!(o.times && o.times.delivered) || o.status === DELIVERED;
    creditOf(o, set).forEach((c) => {
      const row = by.get(c.channel) || by.get('direct');
      row.orders += c.share; row.sales += c.share * (o.subtotal || 0);
      if (dl) { row.delivered += c.share; row.deliveredSales += c.share * (o.subtotal || 0); }
      if (c.campaign) {
        const k = c.campaign;
        const cp = row.campaigns.get(k) || row.campaigns.set(k, { campaign: k, orders: 0, sales: 0, delivered: 0, deliveredSales: 0, returned: 0 }).get(k);
        cp.orders += c.share; cp.sales += c.share * (o.subtotal || 0);
        if (dl) { cp.delivered += c.share; cp.deliveredSales += c.share * (o.subtotal || 0); }
        if (o.status === 'Returned') cp.returned += c.share;
      }
    });
  });
  const rows = [...by.values()].map((r) => ({ ...r, campaigns: [...r.campaigns.values()] }));
  const total = rows.reduce((a, r) => ({ orders: a.orders + r.orders, sales: a.sales + r.sales, delivered: a.delivered + r.delivered, deliveredSales: a.deliveredSales + r.deliveredSales }), { orders: 0, sales: 0, delivered: 0, deliveredSales: 0 });
  const m = modelBy(set.model);
  return { rows, total, count: list.length, model: m.id, modelName: m.name, version: m.version, windowDays: set.windowDays, basis };
}

/** "Last non-direct · v2 · 7-day window" — the label every attributed figure carries. */
export function modelLabel(set = getSetting()) {
  const m = modelBy(set.model);
  return `${m.name} · v${m.version} · ${set.windowDays}-day window`;
}

// ---- the shop's reporting model ------------------------------------------------------------------
const read = (k, fb) => { try { const v = JSON.parse(window.localStorage.getItem(k)); return v == null ? fb : v; } catch { return fb; } };
/** { model, windowDays, changedAt?, changedBy? } */
export function getSetting() {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTING };
  const s = read(KEY, null);
  return s && MODELS.some((m) => m.id === s.model) ? { ...DEFAULT_SETTING, ...s } : { ...DEFAULT_SETTING };
}
/** Change the reporting model or window; kept with who changed it, so old exports can be told apart. */
export function setSetting(patch, by = 'You') {
  const before = getSetting();
  const next = { ...before, ...patch, changedAt: Date.now(), changedBy: by };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    const hist = read(HIST_KEY, []);
    hist.unshift({ at: next.changedAt, by, from: modelLabel(before), to: modelLabel(next) });
    window.localStorage.setItem(HIST_KEY, JSON.stringify(hist.slice(0, 30)));
    window.dispatchEvent(new CustomEvent(ATTR_EVENT));
  } catch { /* ignore */ }
  return next;
}
export const settingHistory = () => (typeof window === 'undefined' ? [] : read(HIST_KEY, []));
