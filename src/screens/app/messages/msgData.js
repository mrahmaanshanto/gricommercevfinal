// msgData — the data side of the app's Calls, Inbox and GridAI screens. Everything here composes the merchant libs the
// web panel uses (lib/inbox.js, lib/orders.js, lib/customers.js, lib/callTasks.js, lib/aiReply.js, lib/gridai/*,
// lib/settingsStore.js), so a reply, a call or a decision made in the app shows on the web and the other way round.
//   access(route, ctx)            the route's edition module and web menu ids (appNav.APP_ROUTES), without the
//                                 ROUTES_BUILT gate (a screen checks itself while the lead wires the menu)
//   ordersOf(phone) · factsOf(phone) → { orders, count, spent }   the customer's orders by phone (newest first)
//   convOfPhone(phone)            their newest conversation
//   nameOfPhone(phone, convs)     a name for a number (chats, then the customer book)
//   fmtPhone(p)                   01711-234567
//   isDue(call)                   a missed call / voicemail / "Callback needed" not called back yet (as on the web)
//   live call (this tab only, sessionStorage): getLiveCall() · setLiveCall(c) · clearLiveCall()
//   ringing queue (demo, once a visit, like the web Calls page): getRinging() · dropRinging(id)
//   call settings (settingsStore form 'calls', shared with the web): CALL_DEFAULTS · getCallSettings() · saveCallSettings(v)
//   aiSetup() → { comms, chats, providers, ready, control, settings }   is GridAI messaging set up?
//   waitingDrafts(convs)          chats in Assist where the customer waits: what GridAI would send (sandbox preview)
//   personReply(id, msgs, opts)   send as a person: reopen, first-reply assignment, Autopilot takeover (web act.send)
//   autopilotReply(id, onTyping)  GridAI answers by itself when the chat is on Auto (web MerchantInbox › aiReply)

import { APP_ROUTES } from '../kit/appNav';
import { hasModule } from '@/lib/edition';
import { getOrders } from '@/lib/orders';
import { getCustomers } from '@/lib/customers';
import {
  ME, staffName, getConvs, addMessages, patchConv, statusOf, lastAt, samePhone, phoneDigits, lockOf, releaseLock, comeback,
  addCall, patchCall,
} from '@/lib/inbox';
import { completeCallTask } from '@/lib/callTasks';
import { readSettings, writeSettings } from '@/lib/settingsStore';
import { connectedInbox } from '@/lib/connections';
import { getAiSettings, shopControl, controlFor } from '@/lib/aiReply';
import { getModels } from '@/lib/gridai/models';
import { customerTurn } from '@/lib/gridai/engine';
import { autopilotOn } from '@/lib/gridai/inboxAi';
import { logAi } from '@/lib/gridai/activity';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const isBrowser = typeof window !== 'undefined';
export const mid = () => 'm-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
export const sys = (icon, text) => ({ id: mid(), from: 'system', type: 'text', icon, text });
export const ME_NAME = staffName(ME);

// ---- access ----------------------------------------------------------------------------------------------------
/** Can this person open the route in this edition (module + web menu ids)? */
export function access(route, ctx) {
  const r = APP_ROUTES[route];
  if (!r || !ctx) return true;
  if (r.module && !hasModule(r.module, ctx.ed)) return false;
  if (!r.nav) return true;
  return r.nav.some((id) => ctx.ids.has(id));
}

// ---- people ----------------------------------------------------------------------------------------------------
export const fmtPhone = (p) => { const d = phoneDigits(p); return /^01\d{9}$/.test(d) ? d.slice(0, 5) + '-' + d.slice(5) : String(p || ''); };
export function ordersOf(phone, all) {
  if (!phone) return [];
  return (all || safe(() => getOrders(), [])).filter((o) => samePhone(o.phone, phone)).sort((a, b) => (b.at || 0) - (a.at || 0));
}
/** The customer's orders and what they spent (cancelled and returned orders left out of the money). */
export function factsOf(phone, all) {
  const orders = ordersOf(phone, all);
  const spent = orders.filter((o) => !['cancelled', 'returned'].includes(o.statusKey)).reduce((s, o) => s + (Number(o.amount) || 0), 0);
  return { orders, count: orders.length, spent };
}
export function convOfPhone(phone, convs) {
  if (!phone) return null;
  return (convs || safe(() => getConvs(), [])).filter((c) => samePhone(c.phone, phone)).sort((a, b) => lastAt(b) - lastAt(a))[0] || null;
}
export function nameOfPhone(phone, convs) {
  if (!phone) return '';
  const c = convOfPhone(phone, convs);
  if (c) return c.name;
  const cu = safe(() => getCustomers(), []).find((x) => samePhone(x.phone, phone));
  return cu ? cu.name : '';
}
/** Everyone the shop can call: chats with a number and the customer book. */
export function callBook(convs) {
  const seen = new Map();
  (convs || safe(() => getConvs(), [])).forEach((c) => { if (c.phone && !seen.has(phoneDigits(c.phone))) seen.set(phoneDigits(c.phone), { name: c.name, phone: c.phone, avatar: c.avatar, pos: c.pos }); });
  safe(() => getCustomers(), []).forEach((c) => { const k = phoneDigits(c.phone); if (!k) return; seen.set(k, { avatar: '', pos: '', ...(seen.get(k) || {}), name: c.name, phone: c.phone }); });
  return [...seen.values()].sort((a, b) => String(a.name).localeCompare(String(b.name)));
}

// ---- calls -----------------------------------------------------------------------------------------------------
export const isDue = (c) => (((c.dir === 'missed' || c.dir === 'voicemail') && c.callback === 'due') || (c.result === 'Callback needed' && c.callback !== 'done'));

const LIVE = 'gc.app.call';
const RING = 'gc.app.ringing';
const ss = () => (isBrowser ? window.sessionStorage : null);
const readSS = (k) => { try { return JSON.parse(ss().getItem(k)); } catch { return null; } };
const writeSS = (k, v) => { try { if (v == null) ss().removeItem(k); else ss().setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };
/** The call on now in this tab: { id, phone, name, dir, line, state, start, liveAt, wait, reason, from, task, conv, back }. */
export const getLiveCall = () => readSS(LIVE);
export const setLiveCall = (c) => { writeSS(LIVE, c); notify(); };
export const clearLiveCall = () => { writeSS(LIVE, null); notify(); };
function notify() { try { window.dispatchEvent(new CustomEvent('gc:app')); } catch { /* ignore */ } }
/** A valid number to dial (the web dialer's rule): an 11-digit mobile or a 09 hotline. */
export const dialable = (p) => /^(01[3-9]\d{8}|09\d{8,9})$/.test(phoneDigits(p));
/**
 * Start a call (outgoing rings first; incoming = answered now). Returns false when a call is already on.
 * call: { phone, name, dir = 'out', line, reason, from (callback row id), task (call task id), conv, back (where to go after) }
 */
export function startCall(call) {
  if (getLiveCall()) return false;
  const now = Date.now();
  const dir = call.dir || 'out';
  setLiveCall({ id: now, line: 'support', reason: '', from: '', task: '', conv: '', back: '/m-calls', wait: 0, ...call, dir, phone: phoneDigits(call.phone), state: dir === 'in' ? 'live' : 'ringing', start: call.start || now, liveAt: dir === 'in' ? now : 0, muted: false, hold: false, speaker: false });
  return true;
}
const RING_MS = 2200;
/** The live call with its ringing worked out from the clock (an outgoing call is answered after a few rings). */
export function liveNow(now = Date.now()) {
  const c = getLiveCall();
  if (!c) return null;
  if (c.state === 'ringing' && now - c.start >= RING_MS) { const up = { ...c, state: 'live', liveAt: c.start + RING_MS }; writeSS(LIVE, up); return up; }
  return c;
}
export const patchLiveCall = (patch) => { const c = getLiveCall(); if (c) setLiveCall({ ...c, ...patch }); };
/**
 * After a call: the call log row with its outcome (web MerchantCalls › saveOutcome), the callback it answered marked
 * done, its call task closed, and a call bubble in the chat when it started from one (web Thread › endCall).
 * o: { dur, reason, result, followUp, order, note }   skip = save without an outcome.
 */
export function saveCallOutcome(call, o, skip = false) {
  const rec = !!(getCallSettings().values.record && o.dur > 0);
  const row = addCall({
    dir: call.dir, phone: call.phone, name: call.name, dur: o.dur, wait: call.wait || 0, agent: ME, line: call.line || 'support',
    reason: skip ? '' : o.reason, result: skip ? '' : o.result, followUp: skip ? '' : o.followUp || '', order: skip ? '' : o.order || '', note: (o.note || '').trim(),
    rec, transcript: rec ? 'Transcript is being prepared — it appears here a few minutes after the call.' : '',
    callback: !skip && o.result === 'Callback needed' ? 'due' : '',
  });
  if (call.from) patchCall(call.from, { callback: 'done', doneAt: Date.now() });
  if (call.task) completeCallTask(call.task, { outcome: skip ? 'No answer' : o.result === 'Callback needed' ? 'Call back later' : o.result, note: (o.note || '').trim(), by: ME_NAME });
  if (call.conv) addMessages(call.conv, { from: 'agent', by: ME, type: 'call', dir: o.dur ? (call.dir === 'in' ? 'in' : 'out') : 'missed', dur: o.dur, status: 'sent' });
  clearLiveCall();
  return row;
}
/** Hand the call to a teammate (web MerchantCalls › transfer). */
export function transferCall(call, to, dur) {
  addCall({ dir: call.dir, phone: call.phone, name: call.name, dur, wait: call.wait || 0, agent: ME, line: call.line || 'support', reason: call.reason || '', result: 'Transferred', note: [call.note, `Transferred to ${staffName(to)}`].filter(Boolean).join(' · '), rec: dur > 0 });
  if (call.from) patchCall(call.from, { callback: 'done', doneAt: Date.now() });
  clearLiveCall();
}
/** A ringing caller sent to the callback queue (web MerchantCalls › decline). */
export function declineCall(w) {
  addCall({ dir: 'missed', phone: w.phone, name: w.name, wait: Math.max(0, Math.round((Date.now() - w.since) / 1000)), agent: '', callback: 'due', reason: w.ivr });
  dropRinging(w.id);
}
/** Calls ringing now (the demo puts one caller in the queue on the first visit, as the web Calls page does). */
export function getRinging(now = Date.now()) {
  let q = readSS(RING);
  if (!Array.isArray(q)) {
    q = [{ id: 'r1', phone: '01553336655', name: 'Nusrat Jahan', ivr: 'Order status', since: now - 42000 }];
    writeSS(RING, q);
  }
  return q;
}
export const dropRinging = (id) => { writeSS(RING, getRinging().filter((x) => x.id !== id)); notify(); };
/** Demo: someone calls (the web's "Simulate an incoming call"). */
export function ringAgain(person) {
  const q = getRinging();
  writeSS(RING, [...q, { id: 'r' + Date.now(), phone: person.phone, name: person.name, ivr: 'Order status', since: Date.now() }]);
  notify();
}

// ---- call settings (shared with the web through settingsStore) ---------------------------------------------------
export const CALL_FORM = 'calls';
export const CALL_DEFAULTS = { line: 'support', forward: false, forwardTo: '', afterHours: 'voicemail', record: true, aiAnswer: false, codConfirm: true, missedReply: true };
export function getCallSettings() {
  const s = safe(() => readSettings(CALL_FORM), { values: {}, version: 0 });
  return { values: { ...CALL_DEFAULTS, ...(s.values || {}) }, version: s.version || 0 };
}
export function saveCallSettings(values, baseVersion, by) {
  const changes = {};
  const cur = getCallSettings().values;
  Object.keys(values).forEach((k) => { if (values[k] !== cur[k]) changes[k] = values[k]; });
  if (!Object.keys(changes).length) return { ok: true, same: true };
  return writeSettings(CALL_FORM, changes, { baseVersion, by });
}

// ---- GridAI messaging -------------------------------------------------------------------------------------------
/** Is GridAI messaging set up: an inbox chat channel connected and an AI provider on. */
export function aiSetup(ed) {
  const comms = hasModule('comms', ed);
  const chats = comms ? safe(() => connectedInbox('Messages'), []) : [];
  const providers = safe(() => Object.values(getModels().providers || {}).some(Boolean), false);
  const settings = safe(() => getAiSettings(), null);
  return { comms, chats, providers, ready: comms && chats.length > 0 && providers, control: settings ? shopControl(settings) : 'off', settings };
}
export const channelControl = (ch, s) => safe(() => controlFor({ channel: ch }, s || getAiSettings()).mode, 'off');

/** The customer's waiting message, when they have the last word. */
export function waitingMsg(conv) {
  const msgs = (conv && conv.messages) || [];
  for (let i = msgs.length - 1; i >= 0; i -= 1) {
    if (msgs[i].from === 'agent') return null;
    if (msgs[i].from === 'customer') return msgs[i];
  }
  return null;
}
/** Chats where GridAI drafts and a person sends (Assist), the customer is waiting and the AI has a reply ready. */
export function waitingDrafts(convs, now = Date.now(), hidden = {}) {
  return (convs || []).filter((c) => !c.blocked && statusOf(c, now) === 'open' && !autopilotOn(c) && channelOrChatMode(c) !== 'off')
    .map((c) => ({ c, w: waitingMsg(c) }))
    .filter((x) => x.w && !hidden[x.c.id + ':' + x.w.id])
    .map((x) => ({ ...x, run: safe(() => customerTurn(x.c, { sandbox: true }), null) }))
    .filter((x) => x.run && x.run.reply)
    .sort((a, b) => a.w.at - b.w.at);
}
const channelOrChatMode = (c) => safe(() => controlFor({ conv: c }).mode, 'assist');

// ---- sending (the web's MerchantInbox › act.send) ----------------------------------------------------------------
const timers = [];
const later = (ms, fn) => { if (isBrowser) timers.push(window.setTimeout(fn, ms)); };
const demoDone = new Set();
let replyN = 0;
/**
 * Send messages in a conversation as a person (or as GridAI when every row has ai: true).
 * opts.onTyping(id | '') shows the customer typing; opts.isOpen() says whether the chat is on screen (unread count).
 * Returns false when a teammate holds the send lock.
 */
export function personReply(id, msgs, { onTyping, isOpen } = {}) {
  const c = getConvs().find((x) => x.id === id);
  if (!c) return false;
  const rows = msgs.map((m) => ({ ...m, id: mid(), at: Date.now() }));
  const reply = rows.some((m) => m.from === 'agent');
  if (reply && lockOf(id)) return false;
  if (reply) releaseLock(id);
  const st = statusOf(c, Date.now());
  const pre = [];
  const patch = { unread: 0 };
  if (reply && (st === 'closed' || st === 'snoozed')) { pre.push(sys('rotate-ccw', `Reopened by ${ME_NAME} with a reply`)); patch.status = 'open'; patch.snoozeUntil = null; }
  if (reply && !c.assignee) { pre.push(sys('user-round-check', `Assigned to ${ME_NAME} (first reply)`)); patch.assignee = ME; }
  if (reply && autopilotOn(c) && !rows.some((m) => m.ai)) {
    pre.push(sys('hand', `${ME_NAME} took over · GridAI Autopilot paused for this chat`));
    patch.autopilot = false;
    logAi({ kind: 'override', title: 'A person took over', detail: c.name, channel: c.ch, customer: c.name, by: ME_NAME });
  }
  addMessages(id, [...pre, ...rows], patch);
  if (!reply) return true;
  const ids = rows.map((m) => m.id);
  later(900, () => patchConv(id, (x) => ({ messages: x.messages.map((m) => (ids.includes(m.id) && m.status === 'sent' ? { ...m, status: 'delivered' } : m)) })));
  // demo: the first reply in each conversation gets a short answer back
  if (demoDone.has(id) || c.blocked) return true;
  demoDone.add(id);
  later(1800, () => onTyping && onTyping(id));
  later(4400, () => {
    if (onTyping) onTyping('');
    patchConv(id, (x) => ({ messages: x.messages.map((m) => (m.from === 'agent' && m.status !== 'read' ? { ...m, status: 'read' } : m)) }));
    addMessages(id, { from: 'customer', type: 'text', text: comeback(replyN++) }, (x) => ({ unread: isOpen && isOpen(id) ? 0 : (x.unread || 0) + 1 }));
  });
  return true;
}

const aiDemo = new Set();
/** GridAI Autopilot answers the waiting customer (simple questions only; the rest go to a person). */
export function autopilotReply(id, { onTyping, isOpen } = {}) {
  later(500, () => onTyping && onTyping(id));
  later(1700, () => {
    if (onTyping) onTyping('');
    const c = getConvs().find((x) => x.id === id);
    if (!c || !autopilotOn(c)) return;
    const run = customerTurn(c);
    if (run.decision.act === 'person') {
      addMessages(id, sys('arrow-up-right', `GridAI handed this to a person: ${run.decision.reason}`), { autopilot: false, priority: 'high' });
      logAi({ kind: 'escalation', title: 'Handed to a person', detail: run.decision.reason, channel: c.ch, customer: c.name, conv: id });
      return;
    }
    if (run.decision.act !== 'auto') { addMessages(id, sys('wand-sparkles', 'GridAI drafted a reply for a person to check: ' + run.decision.reason)); return; }
    const cards = (run.intents.includes('recommend') ? run.products : []).slice(0, 3).map((p) => ({ id: mid(), at: Date.now(), from: 'agent', by: 'gridai', ai: true, run: run.id, type: 'product', sku: p.sku, status: 'sent' }));
    addMessages(id, [{ id: mid(), at: Date.now(), from: 'agent', by: 'gridai', ai: true, run: run.id, type: 'text', text: run.reply, status: 'sent' }, ...cards], { unread: 0 });
    logAi({ kind: 'reply', title: 'Answered by itself', detail: run.reply.slice(0, 90), channel: c.ch, customer: c.name, conv: id });
    if (aiDemo.has(id)) return;
    aiDemo.add(id);
    later(3800, () => onTyping && onTyping(id));
    later(6000, () => {
      if (onTyping) onTyping('');
      const next = run.intents.includes('recommend') || run.intents.includes('price') || run.intents.includes('stock') ? 'Thik ache, eta nibo. Delivery charge koto?' : 'Ok, dhonnobad!';
      addMessages(id, { from: 'customer', type: 'text', text: next }, (x) => ({ unread: isOpen && isOpen(id) ? 0 : (x.unread || 0) + 1 }));
      autopilotReply(id, { onTyping, isOpen });
    });
  });
}
