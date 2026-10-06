// callTasks — outbound call tasks (Nayeem's brief #11, "Calls only executes the queue"). Another area decides that a
// customer should get a call and why — Recovery for a big abandoned cart, Accounts for a payment that is due, Orders
// for a delivery to confirm — and adds a task here. The Calls page shows them as a queue; an agent calls, records the
// outcome, and the task closes. Before dialling, a task is checked again (a cart that became an order, a due that was
// paid): such a task is skipped by itself.
//
//   addCallTask({ source, reason, customer: { name, phone, id }, amount, ref, due, priority, check, once, note })
//        → { task } | { duplicate, task }      once: the same key adds one task (e.g. `cart|${cartId}`)
//        check: what makes the task pointless later — { kind: 'cart-ordered' | 'due-paid' | 'order-delivered', ref }
//   getCallTasks({ status }) · openCallTasks() · callTaskBy(id)
//   startCallTask(id, by) · completeCallTask(id, { outcome, note, by }) · skipCallTask(id, reason) · snoozeCallTask(id, until)
//   revalidate(isDone)   isDone(task) → reason string when the task no longer needs a call; those tasks are skipped
//   CALL_SOURCES · CALL_OUTCOMES
// Recovery, Accounts and Orders call addCallTask(); they don't edit the queue. Front end only: kept in this browser.

import { clockNow } from './settlements';

const KEY = 'gc.calls.tasks';
export const CALL_TASK_EVENT = 'gc:calltasks';
const isBrowser = typeof window !== 'undefined';
const now = () => (isBrowser ? clockNow() : Date.now());
const read = () => { if (!isBrowser) return null; try { return JSON.parse(window.localStorage.getItem(KEY)); } catch { return null; } };
const write = (rows) => { try { window.localStorage.setItem(KEY, JSON.stringify(rows)); window.dispatchEvent(new CustomEvent(CALL_TASK_EVENT)); } catch { /* ignore */ } };
const digits = (p) => String(p || '').replace(/[^0-9]/g, '').replace(/^88/, '');

export const CALL_SOURCES = { Recovery: 'shopping-cart', Accounts: 'wallet', Orders: 'package', Loyalty: 'gift', Support: 'life-buoy' };
export const CALL_OUTCOMES = ['Order placed', 'Will pay', 'Paid', 'Confirmed', 'Call back later', 'Not interested', 'No answer', 'Wrong number'];
export const PRIORITY = { high: ['High', 'error'], normal: ['Normal', 'neutral'], low: ['Low', 'neutral'] };

function seed(t) {
  const h = (n) => t - n * 36e5;
  const S = (id, source, reason, name, phone, amount, ref, at, more = {}) => ({ id, source, reason, customer: { name, phone }, amount, ref, at, due: at + 4 * 36e5, priority: 'normal', status: 'open', note: '', attempts: 0, ...more });
  return [
    S('CT-101', 'Recovery', 'Cart above ৳5,000', 'Tasnim Ahmed', '01716223419', 8450, 'CART-2291', h(1), { priority: 'high', check: { kind: 'cart-ordered', ref: 'CART-2291' }, note: 'Wireless Earbuds Pro, Anker 20W Charger ×2' }),
    S('CT-102', 'Accounts', 'Payment follow-up', 'Jamal Telecom', '01819447210', 24600, 'INV-0042', h(26), { priority: 'high', due: h(2), check: { kind: 'due-paid', ref: 'INV-0042' }, attempts: 1, note: 'Promised to pay by Friday' }),
    S('CT-103', 'Recovery', 'Cart above ৳5,000', 'Anika Tabassum', '01911874503', 15990, 'CART-2287', h(3), { check: { kind: 'cart-ordered', ref: 'CART-2287' }, note: 'Budget Android Phone' }),
    S('CT-104', 'Orders', 'Confirm delivery address', 'Sadia Afrin', '01966330012', 10140, '#136764', h(5), { check: { kind: 'order-delivered', ref: '#136764' }, note: 'Sylhet · RedX' }),
    S('CT-105', 'Accounts', 'Payment follow-up', 'Habib Telecom', '01715332908', 18200, 'INV-0039', h(50), { status: 'done', outcome: 'Will pay', doneAt: h(48), by: 'Mehedi Karim', attempts: 2 }),
    S('CT-106', 'Recovery', 'Cart above ৳5,000', 'Fahim Chowdhury', '01819340276', 6200, 'CART-2270', h(30), { status: 'skipped', skipReason: 'The cart became order #136790', doneAt: h(20) }),
  ];
}
export function getCallTasks({ status } = {}) {
  const rows = read() || seed(now());
  return rows.filter((r) => !status || r.status === status).sort((a, b) => (a.status === 'open' ? 0 : 1) - (b.status === 'open' ? 0 : 1) || (a.priority === 'high' ? 0 : 1) - (b.priority === 'high' ? 0 : 1) || a.due - b.due);
}
export const openCallTasks = () => getCallTasks().filter((t) => t.status === 'open' && !(t.snoozeUntil > now()));
export const callTaskBy = (id) => getCallTasks().find((t) => t.id === id) || null;
const save = (rows) => write(rows);
const patch = (id, p) => { const rows = getCallTasks(); save(rows.map((r) => (r.id === id ? { ...r, ...p } : r))); return rows.find((r) => r.id === id) ? { ...rows.find((r) => r.id === id), ...p } : null; };

/** Another area asks for a call. The same `once` key adds one open task. */
export function addCallTask({ source = 'Support', reason, customer = {}, amount = 0, ref = '', due, priority = 'normal', check = null, once = '', note = '' }) {
  if (!reason) return { error: 'Say why the customer should be called' };
  if (!/^01[3-9]\d{8}$/.test(digits(customer.phone))) return { error: 'No valid mobile number' };
  const rows = getCallTasks();
  const key = once || `${source}|${ref}|${digits(customer.phone)}`;
  const same = rows.find((r) => r.once === key && r.status === 'open');
  if (same) return { duplicate: true, task: same };
  const t = now();
  const task = { id: 'CT-' + Date.now().toString(36).toUpperCase(), source, reason, customer: { name: customer.name || digits(customer.phone), phone: digits(customer.phone), id: customer.id || '' }, amount, ref, at: t, due: due || t + 4 * 36e5, priority, check, once: key, note, status: 'open', attempts: 0 };
  save([task, ...rows]);
  return { task };
}
export const startCallTask = (id, by = 'Rina Ahmed') => { const t = callTaskBy(id); return t ? patch(id, { attempts: (t.attempts || 0) + 1, lastTry: now(), by }) : null; };
/** Record the call's outcome. "Call back later" and "No answer" keep the task open for another try. */
export function completeCallTask(id, { outcome, note = '', by = 'Rina Ahmed', retryInHours = 3 } = {}) {
  if (!outcome) return { error: 'Choose the outcome' };
  const again = outcome === 'Call back later' || outcome === 'No answer';
  return { task: patch(id, again ? { lastOutcome: outcome, note: note || callTaskBy(id).note, snoozeUntil: now() + retryInHours * 36e5, due: now() + retryInHours * 36e5, by } : { status: 'done', outcome, note: note || callTaskBy(id).note, doneAt: now(), by }) };
}
export const skipCallTask = (id, reason = 'Skipped') => patch(id, { status: 'skipped', skipReason: reason, doneAt: now() });
export const snoozeCallTask = (id, until) => patch(id, { snoozeUntil: until, due: until });
/** Check open tasks again before dialling: isDone(task) returns a reason when the task no longer needs a call. */
export function revalidate(isDone) {
  if (typeof isDone !== 'function') return 0;
  let n = 0;
  const rows = getCallTasks().map((r) => { if (r.status !== 'open') return r; const why = isDone(r); if (!why) return r; n += 1; return { ...r, status: 'skipped', skipReason: why, doneAt: now() }; });
  if (n) save(rows);
  return n;
}
