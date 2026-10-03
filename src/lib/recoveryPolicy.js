// recoveryPolicy — what Recovery borrows from other areas, behind one small adapter (brief #13):
//   canSendNow(customer, channel, now, cls) / withinCaps(customer, now, cls)
//       quiet hours and message limits come from Communications (messagePolicy.js): one shop-wide policy per message
//       class. Recovery reminders are Marketing; payment follow-ups are Service; calls are not counted. Reminders
//       sent here are added to the count, so a customer never gets more than the policy allows.
//   listOffers() / offerBy(id) / issueCode(offerId, customerId)
//       offers come from Promotions (promotions.js): a recovery step picks one of its coupons. Promotions does not
//       issue per-customer codes yet, so issueCode makes a one-time code tied to that offer and customer here
//       (kept in this browser) until Promotions does.
// Front end only: the send log and issued codes are kept in this browser.

import * as Policy from './messagePolicy';
import * as Promo from './promotions';

export const POLICY_SOURCE = 'Communications';
const SENT_KEY = 'gc.recovery.sent';          // [{ customerId, channel, cls, at }]
const CODES_KEY = 'gc.recovery.codes';        // [{ code, offerId, customerId, at }]
const ssr = () => typeof window === 'undefined';
function read(key) { if (ssr()) return []; try { return JSON.parse(window.localStorage.getItem(key)) || []; } catch { return []; } }
function write(key, v) { try { window.localStorage.setItem(key, JSON.stringify(v.slice(0, 1000))); } catch { /* storage blocked */ } }
const clsName = (cls) => ({ marketing: 'Marketing', service: 'Service', transactional: 'Transactional' }[String(cls || 'marketing').toLowerCase()] || 'Marketing');

/** Quiet hours: may a message go out now? → { ok, reason, next } (next = when it can, in ms). Calls are not held. */
export function canSendNow(customer, channel, now = Date.now(), cls = 'marketing') {
  if (String(channel).toLowerCase() === 'call') return { ok: true, reason: '' };
  const r = Policy.canSendNow(clsName(cls), now);
  return r.ok ? { ok: true, reason: '' } : { ok: false, reason: r.reason + '. It can go out after that.', next: r.nextAt };
}
/** Message limits from the shop's policy, counting the reminders sent here too. → { ok, reason, sentWeek } */
export function withinCaps(customer, now = Date.now(), cls = 'marketing') {
  const id = customer && customer.id;
  if (!id) return { ok: true, reason: '' };
  const extra = read(SENT_KEY).filter((s) => s.customerId === id).map((s) => ({ customerKey: id, cls: clsName(s.cls), status: 'Sent', at: s.at }));
  const r = Policy.withinCaps(id, clsName(cls), now, { extra });
  return r.ok ? { ok: true, reason: '', sentWeek: r.sentWeek } : { ok: false, reason: r.reason + ' (your message limits).', sentWeek: r.sentWeek };
}
/** Count a message against the limits. */
export function noteSent(customer, channel, now = Date.now(), cls = 'marketing') { if (customer && customer.id) write(SENT_KEY, [{ customerId: customer.id, channel, cls, at: now }, ...read(SENT_KEY)]); }
/** The shared policy in words, for the Auto reminders page. */
export function policySummary() {
  const p = Policy.getPolicy();
  const m = p.classes.Marketing || {};
  return { quiet: p.quiet && p.quiet.on ? Policy.quietText(p) : 'Off', perDay: m.perDay || 0, perWeek: m.perWeek || 0, gapHours: m.gapHours || 0, source: POLICY_SOURCE };
}

// ---- offers (Promotions) ---------------------------------------------------------------------------------------
/** Coupons a recovery step can offer: Promotions' code offers that are running or about to. */
export function listOffers() {
  return Promo.listOffers('coupons').filter((o) => ['Active', 'Scheduled'].includes(o.life))
    .map((o) => ({ id: o.id, name: o.name, terms: o.summary + (o.limits.perCustomer ? ' · ' + o.limits.perCustomer + ' per customer' : ''), code: o.code, life: o.life, owner: 'Promotions' }));
}
export function offerBy(id) {
  const o = id ? Promo.offerBy(id) : null;
  if (!o) return null;
  const life = Promo.lifecycleOf(o);
  return { id: o.id, name: o.name, terms: Promo.describe(o), code: o.code, life, usable: life === 'Active', owner: 'Promotions' };
}
/** A one-time code for this customer and offer (the same code again if one was already issued). */
export function issueCode(offerId, customerId) {
  const all = read(CODES_KEY);
  const hit = all.find((c) => c.offerId === offerId && c.customerId === customerId);
  if (hit) return hit.code;
  const o = offerBy(offerId);
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let tail = '';
  for (let i = 0; i < 4; i++) tail += abc[Math.floor(Math.random() * abc.length)];
  const code = ((o && o.code) || 'CART').slice(0, 6) + '-' + tail;
  write(CODES_KEY, [{ code, offerId, customerId, at: Date.now() }, ...all]);
  return code;
}
export const issuedCodes = (customerId) => read(CODES_KEY).filter((c) => !customerId || c.customerId === customerId);
