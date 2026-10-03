// campaigns — Messaging Campaigns (Nayeem's brief #11): an outbound message to a group of customers. Pick a segment,
// channels, a template and a time; see before sending how many can get it (eligible / no consent / suppressed or
// unreachable / quiet hours / over the cap) and what it costs from the GridCommerce credits; then the results
// (sent, delivered, read, clicked, orders). Every message goes out through messaging.js, which checks each person
// again at the moment it sends.
//
//   getSegments()                   the customer groups to pick from: All customers + the CRM's segments (segments.js)
//   audienceOf(segmentId)           the people in a segment (CRM rows: id, name, phone, email)
//   getCampaigns() · campaignBy(id) · saveCampaign(c, by) · deleteCampaign(id) · setCampaignStatus(id, status)
//   precheck(c, at)                 { segment, eligible, noConsent, suppressed, invalid, quiet, capped, byChannel, cost, credits, enough }
//   sendCampaign(id)                sends now (each person once); runDue(now) sends scheduled ones whose time came
//   resultsOf(c)                    { sent, delivered, read, clicked, failed, suppressed, queued, cost, orders, revenue }
// Consent is the CRM's (consent.js, read through commsConsent.js). Front end only: campaigns are kept in this browser.

import { segmentsForCampaign, segmentMembers } from './segments';
import { getCrmRows } from './crm';
import { clockNow } from './settlements';
import { creditsLeft } from './platformUsage';
import { checkSend, sendMany, deliveryLog, costOf, templateBy, fill, baseVars, runQueued } from './messaging';

const KEY = 'gc.msg.campaigns';
export const CAMPAIGN_EVENT = 'gc:campaigns';
const DAY = 864e5;
const isBrowser = typeof window !== 'undefined';
const now = () => (isBrowser ? clockNow() : new Date(2026, 9, 3, 12).getTime());
const read = () => { if (!isBrowser) return null; try { return JSON.parse(window.localStorage.getItem(KEY)); } catch { return null; } };
const write = (rows) => { try { window.localStorage.setItem(KEY, JSON.stringify(rows)); window.dispatchEvent(new CustomEvent(CAMPAIGN_EVENT)); } catch { /* ignore */ } };
const hash = (s) => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 1000003; return h; };
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
export const STATUS = { draft: ['Draft', 'neutral'], scheduled: ['Scheduled', 'info'], sending: ['Sending', 'info'], paused: ['Paused', 'warning'], completed: ['Completed', 'success'], cancelled: ['Cancelled', 'neutral'] };

// ---- audience: the CRM's segments (segments.js, Customers & CRM) -------------------------------------------------------
// The customer master and its segments belong to Customers & CRM; a campaign only picks one. "All customers" is the
// whole customer list. A segment is worked out again at send time (the people in it then are the ones who get it).
export function getSegments() {
  let list = [];
  try { list = segmentsForCampaign('sms').map((x) => ({ id: x.id, name: x.name, count: x.count, crm: true })); } catch { list = []; }
  return [{ id: 'all', name: 'All customers' }, ...list];
}
export const segmentName = (id) => (getSegments().find((x) => x.id === id) || { name: id }).name;
/** The people in a segment, each with name, phone, email and customer ID. */
export function audienceOf(segmentId) {
  let rows = [];
  try { rows = segmentId === 'all' ? getCrmRows() : segmentMembers(segmentId); } catch { rows = []; }
  return rows.filter((c) => c.kind !== 'company' || c.phone || c.email).map((c) => ({ ...c, customerId: c.id }));
}

// ---- campaigns ------------------------------------------------------------------------------------------------------------
const T0 = new Date(2026, 9, 3).getTime();
const C = (id, more) => ({ id, name: '', objective: '', segment: 'all', channels: ['whatsapp'], template: '', vars: {}, schedule: { mode: 'now', at: null }, status: 'draft', createdAt: T0 - 10 * DAY, by: 'Shanto', utm: '', ...more });
function seed() {
  return [
    C('CMP-101', { name: 'Eid VIP early access', objective: 'Sales', segment: 'TPL-big-spenders', channels: ['whatsapp', 'sms'], template: 'T-EID-WA', vars: { offer: '15% off', coupon_code: 'VIPEID15', link: 'https://gridshop.com.bd/eid' }, schedule: { mode: 'later', at: new Date(2026, 8, 27, 20).getTime() }, status: 'completed', sentAt: new Date(2026, 8, 27, 20).getTime(), utm: 'cmp-eid-vip',
      results: { audience: 6, sent: 5, delivered: 5, read: 4, clicked: 2, failed: 0, suppressed: 1, queued: 0, cost: 5.5, orders: 1, revenue: 4850 } }),
    C('CMP-102', { name: 'Month-end winback', objective: 'Win back', segment: 'TPL-one-time', channels: ['sms', 'email'], template: 'T-WINBACK-SMS', vars: { offer: '৳200 off', coupon_code: 'BACK200', link: 'https://gridshop.com.bd/offers' }, schedule: { mode: 'later', at: T0 + 2 * DAY + 10 * 36e5 }, status: 'scheduled', utm: 'cmp-winback' }),
    C('CMP-103', { name: 'New arrivals', objective: 'Sales', segment: 'SEG-1002', channels: ['whatsapp', 'email'], template: 'T-NEW-EMAIL', vars: { offer: '10% off', coupon_code: 'NEW10', link: 'https://gridshop.com.bd/new' }, status: 'draft' }),
    C('CMP-100', { name: 'Puja preview', objective: 'Sales', segment: 'SEG-1001', channels: ['whatsapp'], template: 'T-EID-WA', vars: { offer: '20% off', coupon_code: 'PUJA20', link: 'https://gridshop.com.bd/puja' }, schedule: { mode: 'later', at: new Date(2026, 8, 12, 19).getTime() }, status: 'completed', sentAt: new Date(2026, 8, 12, 19).getTime(), utm: 'cmp-puja',
      results: { audience: 4, sent: 4, delivered: 4, read: 3, clicked: 1, failed: 0, suppressed: 0, queued: 0, cost: 4.4, orders: 1, revenue: 3200 } }),
  ];
}
export function getCampaigns() { const mine = read(); const s = seed(); return (mine || s).slice().sort((a, b) => (b.sentAt || b.schedule.at || b.createdAt) - (a.sentAt || a.schedule.at || a.createdAt)); }
export const campaignBy = (id) => getCampaigns().find((c) => c.id === id) || null;
const store = (rows) => write(rows);
/** Save a campaign (new or changed). Returns { campaign } | { error }. */
export function saveCampaign(input, by = 'Shanto') {
  if (!String(input.name || '').trim()) return { error: 'Name the campaign' };
  if (!input.template) return { error: 'Choose a template' };
  if (!(input.channels || []).length) return { error: 'Choose a channel' };
  if (input.schedule && input.schedule.mode === 'later' && !(input.schedule.at > now())) return { error: 'Pick a time in the future' };
  const rows = getCampaigns();
  const c = C(input.id || 'CMP-' + Date.now().toString(36).toUpperCase(), { createdAt: now(), by, ...input });
  store([c, ...rows.filter((x) => x.id !== c.id)]);
  return { campaign: c };
}
export function deleteCampaign(id) { store(getCampaigns().filter((c) => c.id !== id)); }
export function setCampaignStatus(id, status) { store(getCampaigns().map((c) => (c.id === id ? { ...c, status } : c))); }

/** Who can get it, before it is sent. Quiet hours and caps are judged at the send time (now, or the scheduled time). */
export function precheck(c, at) {
  const t = at || (c.schedule && c.schedule.mode === 'later' && c.schedule.at) || now();
  const list = audienceOf(c.segment);
  const tpl = templateBy(c.template);
  const log = isBrowser ? deliveryLog({}, t).filter((r) => !r.demo) : [];
  const out = { segment: list.length, eligible: 0, noConsent: 0, suppressed: 0, invalid: 0, quiet: 0, capped: 0, byChannel: {}, cost: 0 };
  const sample = fill(tpl ? tpl.body : '', { ...baseVars(), customer_name: 'Customer', ...(c.vars || {}) });
  list.forEach((p) => {
    let first = null;
    for (const ch of c.channels || []) {
      const r = checkSend({ to: p, channel: ch, cls: 'Marketing', at: t, log });
      if (r.ok) { out.eligible += 1; out.byChannel[ch] = (out.byChannel[ch] || 0) + 1; out.cost += costOf(ch, sample); return; }
      if (!first || r.code === 'quiet' || r.code === 'capped') first = r;   // a policy block applies to every channel
      if (r.code === 'quiet' || r.code === 'capped') break;
    }
    const k = first ? first.code : 'invalid';
    if (k === 'consent') out.noConsent += 1; else if (k === 'quiet') { out.quiet += 1; out.cost += costOf((c.channels || [])[0], sample); } else if (k === 'capped') out.capped += 1; else if (k === 'invalid') out.invalid += 1; else out.suppressed += 1;
  });
  out.cost = r2(out.cost);
  out.credits = isBrowser ? creditsLeft() : 0;
  out.enough = out.credits >= out.cost;
  out.at = t;
  return out;
}

/** Send a campaign now: each person in the segment once, through the shared send layer. */
export function sendCampaign(id) {
  const c = campaignBy(id);
  if (!c) return { error: 'No such campaign' };
  if (c.status === 'completed' || c.status === 'cancelled') return { error: 'This campaign is already done' };
  const t = now();
  const list = audienceOf(c.segment);
  const rows = sendMany(list.map((p) => ({ source: 'Campaigns', event: c.name, cls: 'Marketing', channels: c.channels, to: p, template: c.template, vars: c.vars || {}, campaignId: c.id, ref: c.utm || c.id, once: `${c.id}|${p.customerId || p.phone}`, at: t })));
  const queued = rows.filter((r) => r.status === 'Queued').length;
  store(getCampaigns().map((x) => (x.id === id ? { ...x, status: queued ? 'sending' : 'completed', sentAt: t, audience: list.length } : x)));
  return { sent: rows.filter((r) => ['Delivered', 'Read', 'Failed'].includes(r.status)).length, queued, suppressed: rows.filter((r) => r.status === 'Suppressed').length };
}
/** Send the scheduled campaigns whose time has come, and finish ones whose queued messages went out. */
export function runDue(t = now()) {
  runQueued(t);
  let n = 0;
  getCampaigns().forEach((c) => {
    if (c.status === 'scheduled' && c.schedule && c.schedule.at && c.schedule.at <= t) { sendCampaign(c.id); n += 1; }
    if (c.status === 'sending' && !deliveryLog({ campaignId: c.id }).some((r) => r.status === 'Queued')) { setCampaignStatus(c.id, 'completed'); n += 1; }
  });
  return n;
}
/** Results from the delivery log (demo campaigns carry their own). Orders and revenue come from clicks (Analytics owns attribution). */
export function resultsOf(c) {
  if (c.results) return c.results;
  const rows = deliveryLog({ campaignId: c.id });
  const n = (f) => rows.filter(f).length;
  const clicked = n((r) => r.clickedAt);
  const orders = rows.filter((r) => r.clickedAt && hash(r.id) % 3 === 0).length;
  return { audience: c.audience || rows.length, sent: n((r) => ['Delivered', 'Read', 'Failed'].includes(r.status)), delivered: n((r) => r.status === 'Delivered' || r.status === 'Read'), read: n((r) => r.status === 'Read'), clicked, failed: n((r) => r.status === 'Failed'), suppressed: n((r) => r.status === 'Suppressed' || r.status === 'Cancelled'), queued: n((r) => r.status === 'Queued'), cost: r2(rows.reduce((a, r) => a + (r.cost || 0), 0)), orders, revenue: orders * 2650 };
}
