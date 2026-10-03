// automationRules — the Automation › Rules as data, with a simulator and version history (Nayeem's brief #11,
// "Auto-reply rules: add simulator, version history").
//   RULES                    each rule: trigger (event), conditions, an optional wait, actions
//   getRules()               the rules with the merchant's changes (on / off, edits)
//   setRuleOn(id, on)        turn a rule on or off
//   saveRule(id, patch, by, note)   change a rule: a new version is kept (the old one stays in its history)
//   ruleVersions(id)         newest first: { v, at, by, note, snapshot, current }
//   restoreVersion(id, v, by)       bring an old version back (as a new version)
//   SAMPLE_EVENTS            ready test events per trigger (an order, a delivery, low stock …)
//   simulate(rule, event, at) → { matched, steps: [{ kind, label, ok, detail }], sends: [{ channel, cls, status, reason }] }
//     Nothing is sent and nothing changes: messages are checked with the send layer (consent, suppression, quiet hours,
//     caps) and business actions say which area would be asked to do them (a rule can't change an order by itself).
// Front end only: kept in this browser.

import { checkSend, templateBy, fill, baseVars } from './messaging';
import { capsOf } from './channelCaps';
import { clockNow } from './settlements';

const K = { edits: 'gc.auto.rules', versions: 'gc.auto.versions' };
export const RULES_EVENT = 'gc:auto';
const isBrowser = typeof window !== 'undefined';
const read = (k, fb) => { if (!isBrowser) return fb; try { const v = JSON.parse(window.localStorage.getItem(k)); return v == null ? fb : v; } catch { return fb; } };
const write = (k, v) => { try { window.localStorage.setItem(k, JSON.stringify(v)); window.dispatchEvent(new CustomEvent(RULES_EVENT)); } catch { /* ignore */ } };
const tk = (n) => '৳' + Math.round(n || 0).toLocaleString('en-IN');

export const TRIGGERS = {
  'order.confirmed': 'An order is AI confirmed', 'order.packed': 'An order moves to Packed', 'order.delivered': 'A parcel is delivered',
  'stock.low': 'Stock falls below its alert level', 'customer.returned': 'A customer returns an order', 'blog.published': 'A blog post is published',
  'order.placed': 'An order is placed', 'customer.quiet': 'A customer has not ordered for a while',
};
// cond: { field, op: 'is' | 'gt' | 'gte' | 'lt', value, label }
// action: { kind: 'message', channel, cls, template, text } | { kind: 'task', owner, label }
const R = (id, cat, name, trigger, conditions, actions, more = {}) => ({ id, cat, name, trigger, conditions, actions, wait: 0, on: true, custom: false, runs: 0, cost: 'No charge', ...more });
export const RULES = [
  R('r1', 'orders', 'Thank customers after AI confirmation', 'order.confirmed', [], [{ kind: 'message', channel: 'whatsapp', cls: 'Transactional', text: 'Hi {{customer_name}}, order {{order_id}} is confirmed. Delivery by {{delivery_date}}.' }], { runs: 212, cost: '৳1.10 per message' }),
  R('r2', 'delivery', 'Book the courier when an order is packed', 'order.packed', [], [{ kind: 'task', owner: 'Orders', label: 'Book the default courier and print the label' }], { runs: 164 }),
  R('r3', 'delivery', 'Ask for a review after delivery', 'order.delivered', [], [{ kind: 'message', channel: 'sms', cls: 'Marketing', text: '{{store_name}}: How was your order {{order_id}}? Review it: {{link}}' }], { wait: 48, runs: 138, cost: '৳0.60 per SMS' }),
  R('r4', 'stock', 'Request stock when it runs low', 'stock.low', [{ field: 'available', op: 'lt', value: 'alert', label: 'Available is below the alert level' }], [{ kind: 'task', owner: 'Purchasing', label: 'Create a purchase request for the manager' }], { runs: 9 }),
  R('r5', 'customers', 'Flag customers who return twice', 'customer.returned', [{ field: 'returns', op: 'gte', value: 2, label: 'Returned orders are 2 or more' }], [{ kind: 'task', owner: 'Customers', label: 'Tag the customer “Risky” and turn off COD' }], { on: false }),
  R('r6', 'marketing', 'Share new blog posts', 'blog.published', [], [{ kind: 'task', owner: 'Social posts', label: 'Schedule it for the Facebook Page and LinkedIn' }], { on: false }),
  R('c1', 'orders', 'Big orders need a manager call', 'order.placed', [{ field: 'payment', op: 'is', value: 'COD', label: 'Payment is COD' }, { field: 'total', op: 'gt', value: 10000, label: 'Total is over ৳10,000' }, { field: 'newCustomer', op: 'is', value: true, label: 'New customer' }], [{ kind: 'task', owner: 'Orders', label: 'Hold the order' }, { kind: 'task', owner: 'Staff', label: 'Notify the Dhanmondi manager' }], { custom: true, runs: 6 }),
  R('c2', 'marketing', 'Win back quiet customers', 'customer.quiet', [{ field: 'days', op: 'gte', value: 60, label: 'No order for 60 days' }], [{ kind: 'message', channel: 'whatsapp', cls: 'Marketing', template: 'T-WINBACK-SMS', text: '' }, { kind: 'message', channel: 'sms', cls: 'Marketing', template: 'T-WINBACK-SMS', fallback: true }], { custom: true, runs: 41, cost: '৳1.10 per message' }),
];
const P = (name, phone) => ({ name, phone });
export const SAMPLE_EVENTS = {
  'order.confirmed': [{ id: 's1', label: 'Order #ORD-0929-011 · Farhana Akter', data: { order_id: '#ORD-0929-011', customer: P('Farhana Islam', '01744556677'), total: 2400, payment: 'COD', delivery_date: '5 Oct' } }],
  'order.packed': [{ id: 's1', label: 'Order #ORD-0929-004 packed', data: { order_id: '#ORD-0929-004', customer: P('Karim Saheb', '01718445120'), total: 3520 } }],
  'order.delivered': [
    { id: 's1', label: 'Order #136801 delivered · Nusrat Jahan', data: { order_id: '#136801', customer: P('Nusrat Jahan', '01553336655'), total: 2000 } },
    { id: 's2', label: 'Order #136790 delivered · Rakib Uddin', data: { order_id: '#136790', customer: P('Rakib Uddin', '01677220945'), total: 3520 } },
  ],
  'stock.low': [{ id: 's1', label: 'Sunscreen at Dhanmondi: 4 left (alert 10)', data: { sku: 'SK-SUN-50', place: 'Dhanmondi branch', available: 4, alert: 10 } }],
  'customer.returned': [{ id: 's1', label: 'Karim Saheb · 2nd return', data: { customer: P('Karim Saheb', '01718445120'), returns: 2 } }, { id: 's2', label: 'Sadia Afrin · 1st return', data: { customer: P('Sadia Afrin', '01966330012'), returns: 1 } }],
  'blog.published': [{ id: 's1', label: '“Eid skin care tips”', data: { title: 'Eid skin care tips' } }],
  'order.placed': [
    { id: 's1', label: '#ORD-0929-007 · ৳12,400 COD · new customer', data: { order_id: '#ORD-0929-007', customer: P('Imran Hossain', '01819554120'), total: 12400, payment: 'COD', newCustomer: true } },
    { id: 's2', label: '#ORD-0929-012 · ৳4,800 bKash', data: { order_id: '#ORD-0929-012', customer: P('Tanvir Ahmed', '01914622045'), total: 4800, payment: 'bKash', newCustomer: false } },
  ],
  'customer.quiet': [{ id: 's1', label: 'Sharmin Sultana · 64 days', data: { customer: P('Sharmin Sultana', '01678492281'), days: 64 } }, { id: 's2', label: 'Shirin Akter · 21 days', data: { customer: P('Shirin Akter', '01811843300'), days: 21 } }],
};

// ---- the rules with the merchant's changes ------------------------------------------------------------------------------
const snap = (r) => ({ name: r.name, trigger: r.trigger, conditions: r.conditions, actions: r.actions, wait: r.wait });
export function getRules() {
  const e = read(K.edits, {});
  return RULES.map((r) => ({ ...r, ...(e[r.id] || {}) }));
}
export const ruleBy = (id) => getRules().find((r) => r.id === id) || null;
export function setRuleOn(id, on) { const e = read(K.edits, {}); e[id] = { ...(e[id] || {}), on }; write(K.edits, e); }

// ---- versions ------------------------------------------------------------------------------------------------------------
const D = (d, h = 11) => new Date(2026, 8, d, h).getTime();
const VERSION_SEED = {
  r3: [{ v: 1, at: D(2), by: 'Shanto', note: 'Created', snapshot: { ...snap(RULES[2]), wait: 24 } }, { v: 2, at: D(19), by: 'Rina Ahmed', note: 'Wait 2 days instead of 1', snapshot: snap(RULES[2]) }],
  c2: [{ v: 1, at: D(8), by: 'Shanto', note: 'Created · after 90 days', snapshot: { ...snap(RULES[7]), conditions: [{ field: 'days', op: 'gte', value: 90, label: 'No order for 90 days' }] } }, { v: 2, at: D(22), by: 'Shanto', note: 'After 60 days; SMS if WhatsApp can’t reach them', snapshot: snap(RULES[7]) }],
};
/** A rule's versions, newest first. A rule nobody changed has one version: how it was made. */
export function ruleVersions(id) {
  const r = ruleBy(id);
  if (!r) return [];
  const list = [...(read(K.versions, {})[id] || []), ...(VERSION_SEED[id] || [{ v: 1, at: D(1), by: 'GridCommerce', note: r.custom ? 'Created' : 'Ready-made rule', snapshot: snap(RULES.find((x) => x.id === id)) }])];
  const top = list.reduce((a, x) => Math.max(a, x.v), 0);
  return list.sort((a, b) => b.v - a.v).map((x) => ({ ...x, current: x.v === top }));
}
/** Change a rule; the change is a new version. */
export function saveRule(id, patch, by = 'Shanto', note = 'Changed') {
  const r = ruleBy(id);
  if (!r) return { error: 'No such rule' };
  const e = read(K.edits, {});
  e[id] = { ...(e[id] || {}), ...patch };
  write(K.edits, e);
  const all = read(K.versions, {});
  const v = ruleVersions(id)[0].v + 1;
  all[id] = [{ v, at: Date.now(), by, note, snapshot: snap({ ...r, ...patch }) }, ...(all[id] || [])];
  write(K.versions, all);
  return { version: v };
}
export function restoreVersion(id, v, by = 'Shanto') {
  const old = ruleVersions(id).find((x) => x.v === v);
  if (!old) return { error: 'No such version' };
  return saveRule(id, old.snapshot, by, `Restored version ${v}`);
}

// ---- simulator -----------------------------------------------------------------------------------------------------------
const check = (c, data) => {
  const got = data[c.field];
  const want = c.value === 'alert' ? data.alert : c.value;
  if (c.op === 'is') return got === want;
  if (c.op === 'gt') return Number(got) > Number(want);
  if (c.op === 'gte') return Number(got) >= Number(want);
  if (c.op === 'lt') return Number(got) < Number(want);
  return false;
};
const show = (v) => (typeof v === 'boolean' ? (v ? 'yes' : 'no') : typeof v === 'number' && v > 999 ? tk(v) : String(v));
/** Run a rule against a sample event without sending or changing anything. */
export function simulate(rule, event, at = isBrowser ? clockNow() : Date.now()) {
  const r = typeof rule === 'string' ? ruleBy(rule) : rule;
  const data = (event && event.data) || {};
  const steps = [{ kind: 'trigger', label: TRIGGERS[r.trigger] || r.trigger, ok: true, detail: event ? event.label : 'Sample event' }];
  if (!r.on) steps.push({ kind: 'note', label: 'This rule is off', ok: true, detail: 'Shown as if it were on' });
  let matched = true;
  r.conditions.forEach((c) => { const ok = check(c, data); if (!ok) matched = false; steps.push({ kind: 'condition', label: c.label, ok, detail: `${c.field}: ${show(data[c.field])}` }); });
  const sends = [];
  if (!matched) return { matched, steps: [...steps, { kind: 'stop', label: 'Stops here', ok: false, detail: 'A condition is not met, so nothing happens' }], sends };
  const sendAt = at + (r.wait || 0) * 36e5;
  if (r.wait) steps.push({ kind: 'wait', label: `Wait ${r.wait >= 24 && r.wait % 24 === 0 ? r.wait / 24 + ' days' : r.wait + ' hours'}`, ok: true, detail: 'Then the steps below run' });
  let reached = false;
  r.actions.forEach((a) => {
    if (a.kind === 'task') { steps.push({ kind: 'action', label: a.label, ok: true, detail: `Asks ${a.owner} to do it (the rule can't change it by itself)` }); return; }
    if (a.fallback && reached) { steps.push({ kind: 'action', label: `${capsOf(a.channel).name} (if the first can’t reach them)`, ok: true, detail: 'Not needed' }); return; }
    const to = data.customer || {};
    const chk = checkSend({ to, channel: a.channel, cls: a.cls, at: sendAt });
    const tpl = a.template ? templateBy(a.template) : null;
    const text = fill(a.text || (tpl ? tpl.body : ''), { ...baseVars(), customer_name: String(to.name || 'there').split(' ')[0], offer: '10% off', coupon_code: 'COMEBACK10', ...data });
    const status = chk.ok ? 'Would send' : chk.code === 'quiet' ? 'Would wait for quiet hours to end' : 'Would not send';
    if (chk.ok || chk.code === 'quiet') reached = true;
    sends.push({ channel: a.channel, cls: a.cls, status, reason: chk.reason, text });
    steps.push({ kind: 'action', label: `${capsOf(a.channel).name} · ${a.cls}`, ok: chk.ok || chk.code === 'quiet', detail: chk.ok ? text : `${status}: ${chk.reason}` });
  });
  return { matched, steps, sends };
}
