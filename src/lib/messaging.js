// messaging — the one send layer (Nayeem's brief #11, "one delivery engine"). The business areas decide why a message
// goes out; this file decides whether, how and on which channel, and writes one delivery log for all of them:
//   Orders     notifications.js › notify() checks every customer message here (checkSend) before it goes out
//   Loyalty    loyalty.js and storeCredit.js send points, tier, store credit and referral messages with send()
//   Recovery   cart reminders and back-in-stock messages: send({ source: 'Recovery', cls: 'Marketing', … })
//   Campaigns  campaigns.js sends each recipient with send({ campaignId, cls: 'Marketing' })
//   Reports    sendReport() delivers a scheduled report to staff (Automation › Scheduled reports)
//
//   send({ source, event, cls, channel | channels, to, template | text, subject, vars, once, campaignId, ref, at, internal })
//        → { status, row, duplicate }
//     to        { name, phone, email, customerId }   (internal: true = staff; no consent, caps or quiet hours)
//     channels  tried in order: the next one is used when this one can't reach the person (fallback)
//     once      a key: the same key sends once (a webhook or a retry sends nothing the second time)
//   checkSend({ to, channel, cls, at, internal }) → { ok, code, reason, nextAt, address }
//     code: 'invalid' | 'channel' | 'consent' | 'suppressed' | 'quiet' | 'capped'. Everything is checked again at
//     the moment a queued message goes out (runQueued), so an unsubscribe while it waits still stops it.
//   deliveryLog({ source, campaignId, channel, status, ref }) one log across every area, newest first
//   retry(id) · runQueued(now) · usageFromLog(from, to) · sendReport(…) · reportDeliveries(reportId)
//   Templates: getTemplates() · templateBy(id) · saveTemplate(t, by) (each change is a new version) · templateVersions(id)
//
// Statuses: Queued (waiting for quiet hours to end) · Delivered · Read (opened for email) · Failed · Suppressed (blocked by
// consent, suppression, an invalid address or a cap; the reason says which) · Cancelled. A channel that sends no read
// signal (SMS) never shows Read (channelCaps.js).
// Front end only: nothing leaves the browser. A message "goes out" as a log row and the provider's answer is simulated
// the way the real gateways answer (a bad number fails, most messages are delivered, some are read).

import { MERCHANT } from './merchant';
import { clockNow } from './settlements';
import { SERVICES } from './platformCosts';
import { capsOf } from './channelCaps';
import { CLASSES, MSG_LOG_KEY, canSendNow, withinCaps } from './messagePolicy';
import { isSuppressed, REASONS } from './suppression';
import { consentOf } from './commsConsent';
import { customerKey } from './customerRef';

export { CLASSES };
const TPL_KEY = 'gc.msg.templates';
const NOTIFY_LOG_KEY = 'gc.notify.log';       // notifications.js keeps the order messages here
export const MSG_EVENT = 'gc:messages';
const isBrowser = typeof window !== 'undefined';
const read = (k, fb) => { if (!isBrowser) return fb; try { const v = JSON.parse(window.localStorage.getItem(k)); return v == null ? fb : v; } catch { return fb; } };
const write = (k, v) => { try { window.localStorage.setItem(k, JSON.stringify(v)); window.dispatchEvent(new CustomEvent(MSG_EVENT)); } catch { /* full or private mode */ } };
const now = () => (isBrowser ? clockNow() : Date.now());
const digits = (p) => String(p || '').replace(/\D/g, '').replace(/^88/, '');
const hash = (s) => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 1000003; return h; };
const uid = () => 'MSG-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
export const CHANNEL_WORD = { sms: 'SMS', whatsapp: 'WhatsApp', email: 'Email', facebook: 'Messenger' };
export const SOURCES = ['Orders', 'Campaigns', 'Recovery', 'Loyalty', 'Automations', 'Reports', 'Calls'];
export const STATUS_TONE = { Queued: 'info', Delivered: 'success', Read: 'success', Failed: 'error', Suppressed: 'warning', Cancelled: 'neutral' };

// ---- templates ----------------------------------------------------------------------------------------------------------
// { id, name, channel, cls, lang, subject, body, buttons, providerId, providerStatus, version, versions: [{ v, at, by, body, subject }] }
const T = (id, name, channel, cls, body, more = {}) => ({ id, name, channel, cls, lang: 'English', subject: '', body, buttons: [], providerId: '', providerStatus: channel === 'whatsapp' ? 'Approved' : '', version: 1, versions: [], at: new Date(2026, 8, 1).getTime(), by: 'Shanto', ...more });
const TEMPLATE_SEED = [
  T('T-EID-WA', 'Eid early access', 'whatsapp', 'Marketing', 'Hi {{customer_name}}, Eid early access is open. {{offer}} with code {{coupon_code}}. Shop now: {{link}}', { buttons: ['Shop now'], providerId: 'eid_early_access_v3', version: 3 }),
  T('T-WINBACK-SMS', 'We miss you', 'sms', 'Marketing', '{{store_name}}: We miss you, {{customer_name}}! {{offer}} with code {{coupon_code}}. {{link}}', { version: 2 }),
  T('T-NEW-EMAIL', 'New this week', 'email', 'Marketing', 'Hi {{customer_name}},\n\nNew products just arrived. {{offer}} with code {{coupon_code}}.\n\n{{link}}\n\n{{store_name}}', { subject: 'New this week at {{store_name}}' }),
  T('T-NEW-BN-SMS', 'New arrivals (Bangla)', 'sms', 'Marketing', '{{store_name}}: নতুন পণ্য এসেছে! কোড {{coupon_code}} দিয়ে {{offer}}। {{link}}', { lang: 'Bangla' }),
  T('T-CART-WA', 'Cart reminder', 'whatsapp', 'Marketing', 'Hi {{customer_name}}, your cart is waiting. Finish your order: {{link}}', { buttons: ['Finish order'], providerId: 'cart_reminder_bn_v4', version: 4 }),
  T('T-POINTS-EXP', 'Points expiring', 'sms', 'Marketing', '{{store_name}}: {{points}} points expire on {{date}}. Use them on your next order.'),
  T('T-BIRTHDAY', 'Birthday gift', 'sms', 'Marketing', '{{store_name}}: Happy birthday, {{customer_name}}! {{points}} points are in your account.'),
  T('T-TIER', 'New level', 'sms', 'Service', '{{store_name}}: You are now {{tier}}. You earn {{mult}} points on every order.'),
  T('T-CREDIT', 'Store credit added', 'sms', 'Service', '{{store_name}}: {{amount}} store credit added. Balance: {{balance}}.'),
  T('T-REFERRAL', 'Invite reward ready', 'sms', 'Service', '{{store_name}}: Your invite reward of {{amount}} is ready to use.'),
  T('T-PAY-REMIND', 'Payment reminder', 'sms', 'Service', '{{store_name}}: {{amount}} is due for order {{order_id}}. Pay: {{link}}'),
  T('T-REPORT-EMAIL', 'Scheduled report', 'email', 'Service', 'Hi {{name}},\n\n{{report}} for {{period}} is ready:\n{{link}}\n\n{{store_name}}', { subject: '{{report}} · {{period}}' }),
  T('T-REPORT-WA', 'Scheduled report (WhatsApp)', 'whatsapp', 'Service', '{{report}} for {{period}}: {{link}}', { providerId: 'report_ready_v1' }),
  T('T-OTP', 'Sign-in code', 'sms', 'Security', '{{store_name}}: Your sign-in code is {{code}}. Do not share it.'),
];
export const getTemplates = () => { const mine = read(TPL_KEY, {}); return [...Object.values(mine).filter((t) => !TEMPLATE_SEED.some((s) => s.id === t.id)), ...TEMPLATE_SEED.map((t) => mine[t.id] || t)]; };
export const templateBy = (id) => getTemplates().find((t) => t.id === id) || null;
/** Save a template. A change to its text is a new version; the old text is kept in versions. */
export function saveTemplate(input, by = 'Shanto') {
  const all = read(TPL_KEY, {});
  const old = input.id ? templateBy(input.id) : null;
  const id = input.id || 'T-' + Date.now().toString(36).toUpperCase();
  if (!String(input.body || '').trim()) return { error: 'Write the message' };
  if (!input.name) return { error: 'Name the template' };
  const changed = !old || old.body !== input.body || (old.subject || '') !== (input.subject || '') || old.channel !== input.channel;
  const next = { ...(old || T(id, input.name, input.channel, input.cls, input.body)), ...input, id, at: Date.now(), by };
  if (old && changed) { next.version = (old.version || 1) + 1; next.versions = [{ v: old.version || 1, at: old.at, by: old.by, body: old.body, subject: old.subject }, ...(old.versions || [])].slice(0, 20); if (next.channel === 'whatsapp') next.providerStatus = 'Pending'; }
  all[id] = next;
  write(TPL_KEY, all);
  return { template: next };
}
export const templateVersions = (id) => { const t = templateBy(id); return t ? [{ v: t.version, at: t.at, by: t.by, body: t.body, subject: t.subject, current: true }, ...(t.versions || [])] : []; };

/** The values every template can use, plus the send's own. */
export const baseVars = () => ({ store_name: MERCHANT.name, support_phone: MERCHANT.phone, link: 'https://dazzleshop.com.bd' });
export const fill = (text, vars) => String(text || '').replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m));
const smsParts = (text) => { const t = String(text || ''); const per = /[^\x00-\x7F৳]/.test(t.replace(/৳/g, '')) ? 70 : 160; return Math.max(1, Math.ceil(t.length / per)); };
const priceOf = (key) => (SERVICES.find((s) => s.key === key) || { price: 0 }).price;
/** What one message costs from the GridCommerce credits (৳). */
export function costOf(channel, text) {
  if (channel === 'sms') return Math.round(priceOf('sms') * smsParts(text) * 100) / 100;
  if (channel === 'whatsapp') return priceOf('whatsapp');
  if (channel === 'email') return priceOf('email');
  return 0;
}

// ---- eligibility --------------------------------------------------------------------------------------------------------
/** The address a channel needs for this person, or ''. */
export function addressOf(to, channel) {
  if (!to) return '';
  if (channel === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(to.email || '').trim()) ? String(to.email).trim().toLowerCase() : '';
  if (channel === 'sms' || channel === 'whatsapp') {
    if (/^01[3-9]\d{8}$/.test(digits(to.phone))) return digits(to.phone);
    // the CRM's demo customers show their number masked (01711-2X4-518); the server would hold the full one
    const masked = String(to.phone || '').replace(/[\s-]/g, '').replace(/^\+?88/, '');
    return /^01[3-9][\dX]{8}$/.test(masked) && /X/.test(masked) ? masked : '';
  }
  return to.handle || to.phone || '';
}
const normClass = (c) => CLASSES.find((x) => x.toLowerCase() === String(c || '').toLowerCase()) || 'Transactional';
/** May this message go to this person on this channel now? Checked again when a queued message goes out. */
export function checkSend({ to, channel, cls = 'Transactional', at = now(), internal = false, log }) {
  const c = normClass(cls);
  const address = addressOf(to, channel);
  if (!address) return { ok: false, code: 'invalid', reason: channel === 'email' ? 'No email address' : 'No valid mobile number', address };
  if (internal) return { ok: true, code: '', reason: '', address, nextAt: at };
  if (c === 'Marketing' && !capsOf(channel).marketing) return { ok: false, code: 'channel', reason: `${capsOf(channel).name} can't send offers`, address };
  const consent = consentOf(to, channel, c);
  if (!consent.ok) return { ok: false, code: 'consent', reason: consent.reason || 'No consent', address };
  const sup = isSuppressed(channel, address, c);
  if (sup) return { ok: false, code: 'suppressed', reason: (REASONS[sup.reason] || { label: 'Suppressed' }).label, address };
  const key = customerKey(to);
  const caps = withinCaps(key, c, at, log ? { log } : undefined);
  if (!caps.ok) return { ok: false, code: 'capped', reason: caps.reason, address };
  const q = canSendNow(c, at);
  if (!q.ok) return { ok: false, code: 'quiet', reason: q.reason, nextAt: q.nextAt, address };
  return { ok: true, code: '', reason: '', address, nextAt: at };
}

// ---- the log ------------------------------------------------------------------------------------------------------------
const getLog = () => read(MSG_LOG_KEY, []);
const saveLog = (rows) => write(MSG_LOG_KEY, rows.slice(0, 5000));
/** What the provider answers (simulated): delivered, read where the channel tells, a click now and then, or a failure. */
function deliver(row) {
  const caps = capsOf(row.channel);
  const h = hash(row.id + row.address);
  if (h % 31 === 0) return { ...row, status: 'Failed', reason: 'The provider did not accept it' };
  const out = { ...row, status: 'Delivered', deliveredAt: row.at + 4000 };
  if (caps.read && h % 10 < (row.cls === 'Marketing' ? 6 : 8)) { out.status = 'Read'; out.readAt = row.at + (h % 50 + 2) * 60000; }
  if (caps.clicked && row.cls === 'Marketing' && h % 100 < 12) out.clickedAt = row.at + (h % 90 + 5) * 60000;
  return out;
}
const BLOCK_STATUS = { invalid: 'Suppressed', channel: 'Suppressed', consent: 'Suppressed', suppressed: 'Suppressed', capped: 'Suppressed' };

/**
 * Send one message through the shared layer. Tries `channels` in order; quiet hours queue it (it goes when they end,
 * after a fresh check). Returns { status, row, duplicate }.
 */
export function send({ source = 'Automations', event = '', cls = 'Transactional', channel, channels, to = {}, template, text, subject, vars = {}, once = '', campaignId = '', ref = '', at, internal = false, log: batchLog, write: doWrite = true } = {}) {
  const t = at || now();
  const list = batchLog || getLog();
  if (once && list.some((r) => r.once === once && r.status !== 'Failed' && r.status !== 'Cancelled')) return { status: 'Duplicate', duplicate: true, row: list.find((r) => r.once === once) };
  const tpl = template ? templateBy(template) : null;
  const tries = (channels && channels.length ? channels : [channel || (tpl && tpl.channel) || 'sms']);
  const c = normClass(cls || (tpl && tpl.cls));
  const allVars = { ...baseVars(), customer_name: (to.name || 'there').split(' ')[0], name: to.name || '', ...vars };
  let last = null;
  for (let i = 0; i < tries.length; i += 1) {
    const ch = tries[i];
    const chk = checkSend({ to, channel: ch, cls: c, at: t, internal, log: list });
    const body = fill(text != null ? text : tpl ? tpl.body : '', allVars);
    const base = { id: uid(), at: t, source, event, cls: c, channel: ch, to: to.name || chk.address || '', address: chk.address, customerKey: internal ? '' : customerKey(to), text: body, subject: fill(subject != null ? subject : tpl ? tpl.subject : '', allVars), templateId: tpl ? tpl.id : '', templateVersion: tpl ? tpl.version : 0, once, campaignId, ref, internal, cost: 0, retries: 0, fallback: i > 0 ? tries[i - 1] : '' };
    if (chk.ok) {
      const row = deliver({ ...base, cost: costOf(ch, body) });
      last = row;
      break;
    }
    if (chk.code === 'quiet') { last = { ...base, status: 'Queued', reason: chk.reason, nextAt: chk.nextAt }; break; }
    last = { ...base, status: BLOCK_STATUS[chk.code] || 'Suppressed', reason: chk.reason, block: chk.code };
    if (chk.code === 'capped') break;          // a cap counts the person, not the channel: no fallback
  }
  if (doWrite) saveLog([last, ...list]);
  return { status: last.status, row: last, duplicate: false };
}
/** Send many at once (one write): items are send() arguments. Returns the rows. */
export function sendMany(items) {
  let list = getLog();
  const rows = [];
  items.forEach((it) => { const r = send({ ...it, log: list, write: false }); if (r.row && !r.duplicate) { list = [r.row, ...list]; rows.push(r.row); } });
  saveLog(list);
  return rows;
}
/** Queued messages whose quiet hours are over go out now, each checked again first. */
export function runQueued(at = now()) {
  const list = getLog();
  let changed = false;
  const next = list.map((r) => {
    if (r.status !== 'Queued' || !(r.nextAt <= at)) return r;
    changed = true;
    const chk = checkSend({ to: { name: r.to, phone: r.channel === 'email' ? '' : r.address, email: r.channel === 'email' ? r.address : '', customerId: r.customerKey && !r.customerKey.startsWith('P:') ? r.customerKey : '' }, channel: r.channel, cls: r.cls, at, internal: r.internal, log: list.filter((x) => x.id !== r.id) });
    if (chk.ok) return deliver({ ...r, at, cost: costOf(r.channel, r.text), queuedAt: r.at });
    if (chk.code === 'quiet') return { ...r, nextAt: chk.nextAt };
    return { ...r, status: 'Cancelled', reason: chk.reason, block: chk.code };
  });
  if (changed) saveLog(next);
  return next.filter((r, i) => r !== list[i]).length;
}
/** Send a failed message again (the demo provider takes it the second time). */
export function retry(id) {
  const list = getLog();
  const r = list.find((x) => x.id === id);
  if (!r || r.status !== 'Failed') return null;
  const next = { ...r, status: 'Delivered', reason: '', retries: (r.retries || 0) + 1, deliveredAt: now(), cost: costOf(r.channel, r.text) };
  saveLog(list.map((x) => (x.id === id ? next : x)));
  return next;
}

// demo rows so the log shows every area on a fresh browser (not counted for caps or cost)
function demoRows(t) {
  const m = (min) => t - min * 60000;
  const R = (id, min, source, event, cls, channel, to, address, text, status, more = {}) => ({ id, at: m(min), source, event, cls, channel, to, address, text, status, cost: status === 'Suppressed' ? 0 : costOf(channel, text), demo: true, ...more });
  return [
    R('MSG-D01', 35, 'Recovery', 'Cart reminder · step 2', 'Marketing', 'whatsapp', 'Nusrat Jahan', '01553336655', 'Hi Nusrat, your cart is waiting. Finish your order: https://dazzleshop.com.bd/cart/88', 'Read', { templateId: 'T-CART-WA', templateVersion: 4, readAt: m(31) }),
    R('MSG-D02', 80, 'Loyalty', 'Store credit added', 'Service', 'sms', 'Rakibul Hasan', '01819072332', 'Dazzle Shop: ৳750 store credit added. Balance: ৳1,250.', 'Delivered', { templateId: 'T-CREDIT', templateVersion: 1 }),
    R('MSG-D03', 140, 'Recovery', 'Cart reminder · step 1', 'Marketing', 'whatsapp', 'Rakib Uddin', '01677220945', 'Hi Rakib, your cart is waiting.', 'Suppressed', { reason: 'Marked as spam', block: 'suppressed', templateId: 'T-CART-WA' }),
    R('MSG-D04', 300, 'Loyalty', 'Points expiring', 'Marketing', 'sms', 'Tanvir Ahmed', '01914622045', 'Dazzle Shop: 120 points expire on 31 Oct. Use them on your next order.', 'Delivered', { templateId: 'T-POINTS-EXP' }),
    R('MSG-D05', 620, 'Reports', 'Daily sales summary', 'Service', 'email', 'Shanto', 'owner@dazzleshop.com.bd', 'Daily sales summary for yesterday is ready.', 'Read', { internal: true, readAt: m(600), templateId: 'T-REPORT-EMAIL' }),
    R('MSG-D06', 1500, 'Calls', 'Payment follow-up', 'Service', 'sms', 'Jamal Telecom', '01819447210', 'Dazzle Shop: ৳24,600 is due for invoice INV-0042. Pay: https://dazzleshop.com.bd/pay/INV-0042', 'Delivered', { templateId: 'T-PAY-REMIND' }),
  ];
}
// the order messages (notifications.js) in the shape of this log
function orderRows() {
  return read(NOTIFY_LOG_KEY, []).filter((r) => !r.quiet && r.channel).map((r) => ({
    id: r.id, at: r.at, source: 'Orders', event: r.label, cls: r.cls || 'Transactional', channel: String(r.channel).toLowerCase(), to: r.recipient === 'Shop' ? 'Shop' : r.to, address: r.to,
    text: r.text, subject: r.subject, status: r.status === 'Skipped' ? 'Suppressed' : r.status === 'Off' ? 'Cancelled' : r.status, reason: r.error || '', ref: r.order, cost: r.status === 'Delivered' ? costOf(String(r.channel).toLowerCase(), r.text) : 0, internal: r.recipient === 'Shop', retries: r.retries || 0, fromNotify: true,
  }));
}
/** One delivery log across every area, newest first. Filters: { source, campaignId, channel, status, ref, from, to }. */
export function deliveryLog(f = {}, t = now()) {
  return [...getLog(), ...orderRows(), ...demoRows(t)]
    .filter((r) => (!f.source || r.source === f.source) && (!f.campaignId || r.campaignId === f.campaignId) && (!f.channel || r.channel === f.channel)
      && (!f.status || r.status === f.status) && (!f.ref || r.ref === f.ref) && (!f.from || r.at >= f.from) && (!f.to || r.at < f.to))
    .sort((a, b) => b.at - a.at);
}
/** Messages this browser actually sent in [from, to) by service, for the credits bill (order SMS are counted by platformUsage already). */
export function usageFromLog(from, to) {
  const out = { sms: 0, whatsapp: 0, email: 0, cost: 0 };
  getLog().forEach((r) => { if (r.at < from || r.at >= to || !['Delivered', 'Read'].includes(r.status)) return; if (out[r.channel] != null) out[r.channel] += 1; out.cost += r.cost || 0; });
  out.cost = Math.round(out.cost * 100) / 100;
  return out;
}

// ---- reports through Communications (Automation › Scheduled reports) -----------------------------------------------------
/**
 * Deliver a report to its recipients. recipients: [{ name, channel: 'email' | 'whatsapp' | 'sms', to }] (to = address).
 * once: e.g. `${reportId}|${periodKey}` so a schedule that runs twice sends once. Returns { sent, failed, rows }.
 */
export function sendReport({ reportId, name, period = '', link = '', recipients = [], at, once = '' }) {
  const items = recipients.map((p) => ({
    source: 'Reports', event: name, cls: 'Service', internal: true, channel: p.channel || 'email', ref: reportId, at,
    to: { name: p.name || p.to, email: p.channel === 'email' || !p.channel ? p.to : '', phone: p.channel !== 'email' ? p.to : '' },
    template: (p.channel || 'email') === 'email' ? 'T-REPORT-EMAIL' : 'T-REPORT-WA', vars: { report: name, period, link: link || 'https://app.gridcommerce.com.bd/report?id=' + reportId, name: p.name || '' },
    once: once ? `${once}|${p.channel || 'email'}|${p.to}` : '',
  }));
  const rows = sendMany(items);
  return { sent: rows.filter((r) => ['Delivered', 'Read'].includes(r.status)).length, failed: rows.filter((r) => !['Delivered', 'Read'].includes(r.status)).length, rows };
}
/** The delivery log of reports (one report, or all of them). */
export const reportDeliveries = (reportId) => deliveryLog({ source: 'Reports', ...(reportId ? { ref: reportId } : {}) });
