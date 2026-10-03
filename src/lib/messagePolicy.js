// messagePolicy — one message policy for the whole shop (Nayeem's brief #11, "Global frequency & quiet-hours
// policy"): quiet hours and how many messages one customer may get, per message class. It is set once in
// Communications settings (Automation › Workflow settings) and every sender reads it: campaigns, automations,
// recovery reminders, loyalty messages and order notifications all go through messaging.js, which asks here.
// A campaign or an automation may be stricter, never looser.
//
//   CLASSES                      Transactional · Service · Marketing · Security
//   getPolicy() / savePolicy(p)  { quiet: { on, from, to }, classes: { [cls]: { quiet, perDay, perWeek, gapHours } }, dailySpend }
//   canSendNow(cls, at)          → { ok, reason, nextAt }   quiet hours (a class that respects them waits until they end)
//   withinCaps(customerKey, cls, at) → { ok, reason, sentDay, sentWeek, lastAt }   the frequency caps
//   quietText(p)                 "9 PM – 9 AM"
// Quiet hours use the shop's clock (Bangladesh time in the demo; a server would use Asia/Dhaka).
// Front end only: the policy and the log it counts are kept in this browser.

import { clockNow } from './settlements';

const KEY = 'gc.comms.policy';
export const MSG_LOG_KEY = 'gc.msg.log';     // the delivery log messaging.js writes (counted here for the caps)
export const POLICY_EVENT = 'gc:comms';
const isBrowser = typeof window !== 'undefined';
const read = (k, fb) => { if (!isBrowser) return fb; try { const v = JSON.parse(window.localStorage.getItem(k)); return v == null ? fb : v; } catch { return fb; } };

export const CLASSES = ['Transactional', 'Service', 'Marketing', 'Security'];
export const CLASS_INFO = {
  Transactional: { tone: 'info', about: 'About an order or payment the customer made. Always allowed.' },
  Service: { tone: 'neutral', about: 'Help the customer asked for, delivery problems, store credit. Waits for quiet hours to end.' },
  Marketing: { tone: 'warning', about: 'Offers and news. Needs consent; quiet hours and caps apply.' },
  Security: { tone: 'error', about: 'Sign-in codes and account alerts. Always sent at once.' },
};
export const DEFAULT_POLICY = {
  quiet: { on: true, from: 21, to: 9, friday: true },   // friday: also quiet 12:30–2:30 PM on Fridays (prayers)
  classes: {
    Transactional: { quiet: false, perDay: 0, perWeek: 0, gapHours: 0 },
    Service: { quiet: true, perDay: 3, perWeek: 0, gapHours: 0 },
    Marketing: { quiet: true, perDay: 1, perWeek: 4, gapHours: 24 },
    Security: { quiet: false, perDay: 0, perWeek: 0, gapHours: 0 },
  },
  dailySpend: 2000,     // ৳ of messages a day across the shop (0 = no limit)
};
export function getPolicy() {
  const s = read(KEY, {});
  const classes = {};
  CLASSES.forEach((c) => { classes[c] = { ...DEFAULT_POLICY.classes[c], ...((s.classes || {})[c] || {}) }; });
  return { ...DEFAULT_POLICY, ...s, quiet: { ...DEFAULT_POLICY.quiet, ...(s.quiet || {}) }, classes };
}
export function savePolicy(p) { try { window.localStorage.setItem(KEY, JSON.stringify(p)); window.dispatchEvent(new CustomEvent(POLICY_EVENT)); } catch { /* ignore */ } }

const hourText = (h) => { const x = ((Number(h) % 24) + 24) % 24; return `${x % 12 || 12} ${x < 12 ? 'AM' : 'PM'}`; };
export const quietText = (p = getPolicy()) => `${hourText(p.quiet.from)} – ${hourText(p.quiet.to)}`;
const normClass = (c) => CLASSES.find((x) => x.toLowerCase() === String(c || '').toLowerCase()) || 'Transactional';

/** Inside quiet hours now? Handles a night that runs over midnight (21 → 9) and a daytime one (13 → 15). */
export function inQuietHours(at = isBrowser ? clockNow() : Date.now(), p = getPolicy()) {
  if (!p.quiet.on) return false;
  const h = new Date(at).getHours() + new Date(at).getMinutes() / 60;
  if (p.quiet.friday && new Date(at).getDay() === 5 && h >= 12.5 && h < 14.5) return true;
  const { from, to } = p.quiet;
  if (from === to) return false;
  return from < to ? h >= from && h < to : h >= from || h < to;
}
/** When quiet hours end after `at`. */
function quietEnds(at, p) {
  const d = new Date(at);
  d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0);
  for (let i = 0; i < 96; i += 1) { if (!inQuietHours(d.getTime(), p)) return d.getTime(); d.setMinutes(d.getMinutes() + 30); }
  return at;
}

/** May a message of this class go out now? A class that keeps quiet hours waits: nextAt is when it may go. */
export function canSendNow(cls, at = isBrowser ? clockNow() : Date.now(), p = getPolicy()) {
  const c = p.classes[normClass(cls)];
  if (!c.quiet || !inQuietHours(at, p)) return { ok: true, reason: '', nextAt: at };
  return { ok: false, reason: `Quiet hours (${quietText(p)})`, nextAt: quietEnds(at, p) };
}

const SENT = new Set(['Sent', 'Delivered', 'Read', 'Clicked', 'Queued']);
/** Is this customer still under the class's caps? Counts every message the log sent them in this class. */
export function withinCaps(customerKey, cls, at = isBrowser ? clockNow() : Date.now(), { p = getPolicy(), log = read(MSG_LOG_KEY, []), extra = [] } = {}) {
  const c = p.classes[normClass(cls)];
  if (!customerKey || (!c.perDay && !c.perWeek && !c.gapHours)) return { ok: true, reason: '', sentDay: 0, sentWeek: 0, lastAt: 0 };
  const mine = [...log, ...extra].filter((r) => r.customerKey === customerKey && normClass(r.cls) === normClass(cls) && SENT.has(r.status) && r.at <= at);
  const day = new Date(at); day.setHours(0, 0, 0, 0);
  const sentDay = mine.filter((r) => r.at >= day.getTime()).length;
  const sentWeek = mine.filter((r) => r.at > at - 7 * 864e5).length;
  const lastAt = mine.reduce((a, r) => Math.max(a, r.at), 0);
  if (c.perDay && sentDay >= c.perDay) return { ok: false, reason: `Already got ${sentDay} today`, sentDay, sentWeek, lastAt };
  if (c.perWeek && sentWeek >= c.perWeek) return { ok: false, reason: `Already got ${sentWeek} this week`, sentDay, sentWeek, lastAt };
  if (c.gapHours && lastAt && at - lastAt < c.gapHours * 36e5) return { ok: false, reason: `Last one less than ${c.gapHours} hours ago`, sentDay, sentWeek, lastAt };
  return { ok: true, reason: '', sentDay, sentWeek, lastAt };
}
