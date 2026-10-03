// consent — what each customer said yes or no to, per channel (brief #7, Customers & CRM).
// Four channels: SMS, WhatsApp, email and calls. Each has a state (Opted in · Opted out · Unknown), where it came
// from (checkout, POS, WhatsApp chat, unsubscribe link …) and when; every change is kept in a history.
// The preferred channel ("likes messages by") lives on the customer and is not consent.
// Communications asks isAllowed(customer, channel, class) before it sends:
//   'marketing'     offers, campaigns, cart reminders        → needs Opted in on that channel
//   'service'       follow-ups about the customer's own cart, payment or order → anything but Opted out
//   'transactional' order updates, OTPs, delivery messages   → only needs a usable phone / email
// Front end only: kept in this browser (gc.crm.consent); the demo customers start with seeded answers.

import { resolveCustomer, normalizePhone } from './customers';

export const CONSENT_KEY = 'gc.crm.consent';
export const CONSENT_EVENT = 'gc:crm-consent';
export const CONSENT_CHANNELS = [
  { k: 'sms', label: 'SMS' },
  { k: 'whatsapp', label: 'WhatsApp' },
  { k: 'email', label: 'Email' },
  { k: 'call', label: 'Calls' },
];
export const CONSENT_STATES = { in: 'Opted in', out: 'Opted out', unknown: 'Unknown' };
export const CONSENT_TONE = { in: 'success', out: 'error', unknown: 'neutral' };
export const CONSENT_SOURCES = ['Checkout', 'Shop counter (POS)', 'Sign-up form', 'WhatsApp chat', 'Phone call', 'Unsubscribe link', 'Replied STOP', 'Import', 'Staff'];
const ALIAS = { wa: 'whatsapp', phone: 'call', calls: 'call', voice: 'call', mail: 'email' };
export const channelKey = (ch) => { const k = String(ch || '').toLowerCase(); return ALIAS[k] || k; };
export const channelLabel = (ch) => (CONSENT_CHANNELS.find((c) => c.k === channelKey(ch)) || { label: ch }).label;

const ssr = () => typeof window === 'undefined';
function read() { if (ssr()) return {}; try { return JSON.parse(window.localStorage.getItem(CONSENT_KEY)) || {}; } catch { return {}; } }
function write(all) { try { window.localStorage.setItem(CONSENT_KEY, JSON.stringify(all)); window.dispatchEvent(new CustomEvent(CONSENT_EVENT)); } catch { /* storage blocked */ } }

const D = (y, m, d) => new Date(y, m - 1, d, 11, 0).getTime();
// Answers of the demo customers that the story needs; the rest are spread by their ID (below).
const SEEDED = {
  'C-10482': { sms: ['in', 'Checkout', D(2026, 3, 2)], whatsapp: ['in', 'WhatsApp chat', D(2026, 3, 9)], email: ['out', 'Unsubscribe link', D(2026, 9, 4)], call: ['unknown'] },
  'C-10140': { sms: ['out', 'Replied STOP', D(2026, 8, 3)], whatsapp: ['out', 'Staff', D(2026, 8, 3)], email: ['unknown'], call: ['unknown'] },
  'C-10538': { sms: ['in', 'Checkout', D(2026, 9, 18)], whatsapp: ['unknown'], email: ['unknown'], call: ['unknown'] },
  'C-30001': { sms: ['in', 'Sales team', D(2025, 2, 12)], whatsapp: ['in', 'Sales team', D(2025, 2, 12)], email: ['in', 'Sales team', D(2025, 2, 12)], call: ['in', 'Sales team', D(2025, 2, 12)] },
};
function hash(text) { let h = 7; String(text).split('').forEach((ch) => { h = (h * 31 + ch.charCodeAt(0)) % 100003; }); return h; }
function seedFor(id) {
  if (SEEDED[id]) {
    const out = {};
    CONSENT_CHANNELS.forEach(({ k }) => { const s = SEEDED[id][k] || ['unknown']; out[k] = { state: s[0], source: s[1] || '', at: s[2] || null, by: s[1] ? 'Customer' : '' }; });
    return out;
  }
  const h = hash(id);
  const pick = (n, inUpTo, outAt) => (n % 10 < inUpTo ? 'in' : n % 10 === outAt ? 'out' : 'unknown');
  const when = D(2026, 1 + (h % 8), 1 + (h % 27));
  const st = { sms: pick(h, 7, 9), whatsapp: pick(h >> 1, 6, 8), email: pick(h >> 2, 4, 9), call: pick(h >> 3, 5, 8) };
  const out = {};
  Object.keys(st).forEach((k) => { out[k] = { state: st[k], source: st[k] === 'in' ? (k === 'whatsapp' ? 'WhatsApp chat' : 'Checkout') : st[k] === 'out' ? (k === 'email' ? 'Unsubscribe link' : 'Replied STOP') : '', at: st[k] === 'unknown' ? null : when, by: st[k] === 'unknown' ? '' : 'Customer' }; });
  return out;
}

/** The consent of one customer (object with an id, or an id / phone): { sms, whatsapp, email, call } each { state, source, at, by }. */
export function getConsent(ref) {
  const id = typeof ref === 'object' && ref ? ref.id : (resolveCustomer(ref) || {}).id || String(ref || '');
  const mine = (read()[id] || {});
  const base = seedFor(id);
  const out = {};
  CONSENT_CHANNELS.forEach(({ k }) => { out[k] = mine[k] || base[k]; });
  out.adsOut = !!mine.adsOut;
  return out;
}
/** Every change, newest first: { channel, from, to, source, at, by, note }. */
export function consentHistory(id) {
  const mine = read()[id] || {};
  const seeded = seedFor(id);
  const first = CONSENT_CHANNELS.filter(({ k }) => seeded[k].state !== 'unknown').map(({ k }) => ({ channel: k, from: 'unknown', to: seeded[k].state, source: seeded[k].source, at: seeded[k].at, by: 'Customer' }));
  return [...(mine.history || []), ...first].sort((a, b) => (b.at || 0) - (a.at || 0));
}
/** Record a new answer for one channel. state: 'in' | 'out' | 'unknown'. */
export function setConsent(id, channel, state, { source = 'Staff', by = 'Staff', note = '' } = {}) {
  const k = channelKey(channel);
  if (!id || !CONSENT_STATES[state] || !CONSENT_CHANNELS.some((c) => c.k === k)) return false;
  const all = read();
  const cur = getConsent(id)[k];
  if (cur.state === state) return false;
  const now = Date.now();
  const me = all[id] || {};
  me[k] = { state, source, at: now, by };
  me.history = [{ channel: k, from: cur.state, to: state, source, at: now, by, note }, ...(me.history || [])].slice(0, 100);
  all[id] = me;
  write(all);
  return true;
}
/** Leave a customer out of ad audiences (separate from message consent). */
export function setAdsOptOut(id, out, by = 'Staff') {
  const all = read();
  const me = all[id] || {};
  me.adsOut = !!out;
  me.history = [{ channel: 'ads', from: out ? 'in' : 'out', to: out ? 'out' : 'in', source: 'Staff', at: Date.now(), by }, ...(me.history || [])].slice(0, 100);
  all[id] = me;
  write(all);
}

/** Why a message can't go out ('' when it can). */
export function whyNotAllowed(customer, channel, cls = 'marketing') {
  const c = customer && customer.phones ? customer : resolveCustomer(customer);
  if (!c) return 'Not a known customer.';
  const k = channelKey(channel);
  const hasPhone = (c.phones || []).some((p) => normalizePhone(p.value).length >= 9);
  const hasEmail = (c.emails || []).some((e) => /@/.test(e.value));
  if ((k === 'email' && !hasEmail) || (k !== 'email' && !hasPhone)) return k === 'email' ? 'No email address.' : 'No phone number.';
  if (cls === 'transactional') return '';
  if (c.status === 'Closed') return 'The account is closed.';
  const st = getConsent(c)[k].state;
  if (cls === 'service') return st === 'out' ? 'Opted out of ' + channelLabel(k) + '.' : '';
  if (c.status === 'Suspended') return 'The account is suspended.';
  return st === 'in' ? '' : st === 'out' ? 'Opted out of ' + channelLabel(k) + '.' : 'No yes on file for ' + channelLabel(k) + '.';
}
/** Can this customer get a message of this class on this channel? (Communications calls this before sending.) */
export const isAllowed = (customer, channel, cls = 'marketing') => !whyNotAllowed(customer, channel, cls);

/** How many of these customers can get a message on each channel: { sms, whatsapp, email, call }. */
export function consentCounts(customers, cls = 'marketing') {
  const out = { sms: 0, whatsapp: 0, email: 0, call: 0 };
  (customers || []).forEach((c) => { CONSENT_CHANNELS.forEach(({ k }) => { if (isAllowed(c, k, cls)) out[k] += 1; }); });
  return out;
}
/** The customers who can get a message on this channel. */
export const eligibleFor = (customers, channel, cls = 'marketing') => (customers || []).filter((c) => isAllowed(c, channel, cls));
