// recovery — recovery opportunities (brief #13, Recovery & customer intelligence). Abandoned carts reads them.
// An opportunity is a cart left, a checkout left or a payment that failed or is pending. Its state is worked out
// from what it records, every time it is read:
//   waiting        left less than the first reminder's wait ago, nothing sent yet
//   contactable    can be reminded or called now
//   suppressed     no usable contact or no consent (or the account is suspended)
//   stock_blocked  an item in it is out of stock — wait for stock
//   payment_issue  the payment failed or is still pending (checked before any message)
//   call_queued    a staff call is queued (big carts)
//   recovered      an order followed within the recovery window (operational rule, not ad attribution)
//   expired        the recovery window passed
// Before any message: the payment is checked again (no "complete your payment" once the money is in), the cart is
// checked for stock, consent is checked (lib/consent.js) and the shared quiet hours and message limits are read
// (lib/recoveryPolicy.js → Communications). Offers come from Promotions (recoveryPolicy.listOffers / issueCode).
// Recovered orders are counted here as "recovered"; whether an ad or a reminder earned the sale is Analytics' job,
// so recoveredOrderIds() lets ad reports leave them out instead of claiming them.
// Front end only: opportunities, reminder settings and the send log are kept in this browser; the demo behaves as
// if the storefront, payment gateway and Communications answered.

import { resolveCustomer, getDirectory } from './customers';
import { whyNotAllowed } from './consent';
import { canSendNow, withinCaps, noteSent, offerBy, issueCode } from './recoveryPolicy';
import { enrol } from './triggers';

export const OPPS_KEY = 'gc.recovery.opps';
export const REMINDERS_KEY = 'gc.recovery.reminders';
export const RECOVERY_EVENT = 'gc:recovery';
const MIN = 60 * 1000, HOUR = 60 * MIN, DAY = 24 * HOUR;

export const OPP_TYPES = { cart: 'Cart', checkout: 'Checkout', payment: 'Payment issue' };
export const OPP_STATES = {
  waiting: { label: 'Waiting', tone: 'neutral' },
  contactable: { label: 'Contactable', tone: 'info' },
  call_queued: { label: 'Call queued', tone: 'primary' },
  payment_issue: { label: 'Payment issue', tone: 'error' },
  stock_blocked: { label: 'Stock blocked', tone: 'warning' },
  suppressed: { label: 'Suppressed', tone: 'neutral' },
  recovered: { label: 'Recovered', tone: 'success' },
  expired: { label: 'Expired', tone: 'neutral' },
};
export const OPEN_STATES = ['waiting', 'contactable', 'call_queued', 'payment_issue', 'stock_blocked', 'suppressed'];
export const RECOVERY_BASIS = 'An order from the same customer within 7 days of leaving the cart';

// ---- reminder settings (Auto reminders) ----------------------------------------------------------------------
export const DEFAULT_REMINDERS = {
  on: true, windowDays: 7, minCart: 500, bigCart: 5000, skipRepeat: true, repeatLimit: 3, stricterCap: 0, backStock: true, linkDays: 7,
  steps: [
    { title: 'Gentle reminder', wait: 1, ch: { wa: true, sms: true }, offerId: null, trigger: 'cart_abandoned', on: true, text: 'Hi {name}, you left something in your cart at Dazzle Shop. Finish your order here: {link}' },
    { title: 'Small coupon', wait: 24, ch: { wa: true, email: true }, offerId: 'PR-EID300', trigger: 'cart_abandoned', on: true, text: 'আপনার কার্টের পণ্যগুলো এখনও আছে! কোড {code} দিয়ে ছাড় পান, ৪৮ ঘণ্টার মধ্যে। {link}' },
    { title: 'Last chance', wait: 72, ch: { sms: true, email: true }, offerId: 'PR-EID300', trigger: 'cart_abandoned', on: true, text: 'Last chance, {name}! Use code {code} on your cart. Ends in 48 hours: {link}' },
  ],
};
const ssr = () => typeof window === 'undefined';
function readJSON(key, fallback) { if (ssr()) return fallback; try { const v = JSON.parse(window.localStorage.getItem(key)); return v == null ? fallback : v; } catch { return fallback; } }
function writeJSON(key, v) { try { window.localStorage.setItem(key, JSON.stringify(v)); window.dispatchEvent(new CustomEvent(RECOVERY_EVENT)); } catch { /* storage blocked */ } }
export const getReminderSettings = () => ({ ...DEFAULT_REMINDERS, ...readJSON(REMINDERS_KEY, {}) });
export function saveReminderSettings(next) { writeJSON(REMINDERS_KEY, next); }

// ---- demo opportunities (times are set when this browser first opens recovery, then the clock runs) ---------
const I = (name, qty, price, inStock = true) => ({ name, qty, price, inStock });
function seed(now) {
  const o = (id, type, ago, f) => ({ id, type, leftAt: now - ago, contacts: [], step: 0, callQueued: false, recovered: null, closed: null, payment: null, guest: null, customerId: null, channel: 'Website', ...f });
  return [
    o('ABN-8931', 'cart', 35 * MIN, { customerId: 'C-10482', items: [I('Anker 20W USB-C Charger', 1, 1250), I('SIM Ejector Pin Pack', 2, 240), I('Cotton Face Towel (pack of 3)', 1, 1510)] }),
    o('ABN-8929', 'checkout', 2 * HOUR, { guest: { name: 'Guest', phone: '01716-4X8-220', consent: { sms: 'in', whatsapp: 'unknown' } }, items: [I('Baseus Car Phone Holder', 1, 1890), I('Canvas Belt', 1, 290)], step: 1, contacts: [{ at: now - HOUR, channel: 'sms', by: 'Automation', kind: 'auto', step: 1 }] }),
    o('ABN-8927', 'cart', 3 * HOUR, { customerId: 'C-10519', items: [I('iPhone 15 Pro (old stock)', 1, 124500)], callQueued: true }),
    o('ABN-8924', 'checkout', 5 * HOUR, { customerId: 'C-10077', items: [I('Liquid Silicone Case · Navy · M', 2, 1290), I('Chino Trousers · Khaki · 32', 1, 1790), I('Leather Wallet', 1, 1490)], step: 1, contacts: [{ at: now - 3 * HOUR, channel: 'whatsapp', by: 'Rupa', kind: 'manual' }] }),
    o('ABN-8920', 'cart', 26 * HOUR, { customerId: 'C-10233', items: [I('Magnetic Wireless Charger 15W', 1, 1540)], contacts: [{ at: now - 22 * HOUR, channel: 'call', by: 'Shanto', kind: 'manual' }], recovered: { at: now - 20 * HOUR, orderId: '#136790', value: 1540, basis: 'operational' } }),
    o('ABN-8918', 'checkout', 30 * HOUR, { customerId: 'C-10538', items: [I('5G Smartphone 128GB', 1, 32990, false)], step: 1, contacts: [{ at: now - 29 * HOUR, channel: 'sms', by: 'Automation', kind: 'auto', step: 1 }] }),
    o('ABN-8915', 'cart', 50 * HOUR, { customerId: 'C-10501', items: [I('Baseus USB-C Cable 100W 1m', 1, 520), I('USB-C OTG Adapter', 1, 320), I('Camera Lens Protector', 2, 160), I('Phone Lanyard Strap', 1, 160)], step: 1, contacts: [{ at: now - 49 * HOUR, channel: 'whatsapp', by: 'Automation', kind: 'auto', step: 1 }] }),
    o('ABN-8912', 'cart', 52 * HOUR, { customerId: 'C-09311', items: [I('Magnetic Wireless Charger 15W', 1, 1290), I('Phone Ring Holder', 2, 300)], step: 1, contacts: [{ at: now - 51 * HOUR, channel: 'sms', by: 'Automation', kind: 'auto', step: 1 }], recovered: { at: now - 40 * HOUR, orderId: '#136801', value: 1890, basis: 'operational' } }),
    o('PAY-4410', 'payment', 50 * MIN, { customerId: 'C-09654', items: [I('Smart Watch Series 5', 1, 7450)], payment: { provider: 'bKash', state: 'pending', amount: 7450, ref: 'BK-8KQ21' } }),
    o('PAY-4407', 'payment', 4 * HOUR, { customerId: 'C-09120', items: [I('Hair Dryer 1800W', 1, 2990)], payment: { provider: 'SSLCOMMERZ', state: 'failed', amount: 2990, ref: 'SSL-77120', arrivesAt: now - 3 * HOUR } }),
    o('ABN-8907', 'cart', 6 * HOUR, { customerId: 'C-10140', items: [I('Wireless Earbuds Pro', 1, 2450)] }),
    o('ABN-8890', 'cart', 8 * DAY, { customerId: 'C-10544', items: [I('Galaxy Buds FE', 1, 980)], step: 2, contacts: [{ at: now - 8 * DAY + HOUR, channel: 'sms', by: 'Automation', kind: 'auto', step: 1 }, { at: now - 7 * DAY, channel: 'whatsapp', by: 'Automation', kind: 'auto', step: 2 }] }),
  ];
}
function readOpps() {
  if (ssr()) return seed(Date.now());
  const v = readJSON(OPPS_KEY, null);
  if (Array.isArray(v)) return v;
  const s = seed(Date.now());
  writeJSON(OPPS_KEY, s);
  return s;
}
function saveOpps(list) { writeJSON(OPPS_KEY, list); }
function patchOpp(id, f) { const list = readOpps().map((o) => (o.id === id ? f({ ...o }) : o)); saveOpps(list); return list.find((o) => o.id === id); }

// ---- payment check (Payments owns the truth; the demo gateway answers here) ---------------------------------
/** Ask the gateway again. → { state: 'paid' | 'pending' | 'failed' | 'unknown', paid } */
export function paymentCheck(o, now = Date.now()) {
  if (!o.payment) return { state: 'none', paid: false };
  const state = o.payment.arrivesAt && o.payment.arrivesAt <= now ? 'paid' : o.payment.state;
  return { state, paid: state === 'paid' };
}

// ---- reading -------------------------------------------------------------------------------------------------
function who(o, dir) { return o.customerId ? resolveCustomer(o.customerId, dir) : null; }
const valueOf = (o) => o.items.reduce((a, i) => a + i.qty * i.price, 0);
/** Can anyone be reached about it? '' when yes, otherwise why not. */
function contactBlock(o, c) {
  if (c) {
    const chans = ['whatsapp', 'sms', 'email'];
    if (chans.every((k) => whyNotAllowed(c, k, o.type === 'payment' ? 'service' : 'marketing'))) return whyNotAllowed(c, 'sms', 'marketing') || 'No channel can be used.';
    return '';
  }
  if (o.guest && o.guest.phone) return Object.values(o.guest.consent || {}).includes('in') ? '' : 'The guest did not agree to messages at checkout.';
  return 'No phone or email for this cart.';
}
export function stateOf(o, now = Date.now(), c, s = getReminderSettings()) {
  if (o.recovered) return 'recovered';
  if (o.closed === 'expired' || now - o.leftAt > (s.windowDays || 7) * DAY) return 'expired';
  if (o.type === 'payment') { if (paymentCheck(o, now).paid) return 'recovered'; return 'payment_issue'; }
  if (o.items.some((i) => !i.inStock)) return 'stock_blocked';
  if (o.callQueued && (c ? !whyNotAllowed(c, 'call', 'service') : !!(o.guest && o.guest.phone))) return 'call_queued';
  if (contactBlock(o, c)) return 'suppressed';
  const firstWait = ((s.steps || [])[0] || { wait: 1 }).wait * HOUR;
  if (!o.contacts.length && now - o.leftAt < firstWait) return 'waiting';
  return 'contactable';
}
function nextAction(o, st, now, s) {
  if (st === 'recovered') return o.recovered ? 'Order ' + (o.recovered.orderId || '') : 'Payment arrived';
  if (st === 'expired') return '—';
  if (st === 'payment_issue') return 'Check payment, then follow up';
  if (st === 'stock_blocked') return 'Wait for stock';
  if (st === 'suppressed') return 'No contact allowed';
  if (st === 'call_queued') return 'Staff call';
  const step = (s.steps || [])[o.step];
  if (!s.on || !step || !step.on) return 'Contact by hand';
  const due = o.leftAt + step.wait * HOUR;
  if (due <= now) return 'Reminder ' + (o.step + 1) + ' next run';
  const mins = Math.round((due - now) / MIN);
  return 'Reminder ' + (o.step + 1) + ' in ' + (mins < 60 ? mins + 'm' : mins < 48 * 60 ? Math.round(mins / 60) + 'h' : Math.round(mins / 1440) + 'd');
}
const ownerOf = (o, st) => (st === 'call_queued' ? 'Calls' : st === 'payment_issue' ? 'Payments' : st === 'stock_blocked' ? 'Recovery' : o.contacts.some((x) => x.kind === 'manual') ? (o.contacts.find((x) => x.kind === 'manual') || {}).by : 'Automation');

/** Every opportunity with its state worked out: [{ ...record, state, value, customer, name, phone, nextAction, owner, lastContact }]. */
export function getOpportunities(now = Date.now()) {
  const s = getReminderSettings();
  const dir = getDirectory();
  return readOpps().map((o) => {
    const c = who(o, dir);
    const st = stateOf(o, now, c, s);
    const last = o.contacts[0] || null;
    return { ...o, state: st, value: valueOf(o), customer: c, name: c ? c.name : (o.guest ? 'Guest · ' + o.guest.phone : 'Guest'), phone: c ? c.phone : (o.guest || {}).phone || '',
      nextAction: nextAction(o, st, now, s), owner: ownerOf(o, st), lastContact: last, block: contactBlock(o, c), pay: paymentCheck(o, now) };
  }).sort((a, b) => b.leftAt - a.leftAt);
}
export const opportunitiesOf = (customerId, now) => getOpportunities(now).filter((o) => o.customerId === customerId);

// ---- acting ------------------------------------------------------------------------------------------------------
const CH_LABEL = { sms: 'SMS', whatsapp: 'WhatsApp', email: 'Email', call: 'Call' };
/**
 * Contact the customer about an opportunity, after the checks. channel: 'sms' | 'whatsapp' | 'email' | 'call'.
 * → { ok, message } — when not ok, message says why (payment arrived, out of stock, no consent, quiet hours …).
 */
export function contactOpportunity(id, channel, { by = 'Staff', kind = 'manual', step, now = Date.now() } = {}) {
  const raw = readOpps().find((o) => o.id === id);
  if (!raw) return { ok: false, message: 'This cart is no longer here.' };
  const dir = getDirectory();
  const c = who(raw, dir);
  // 1. payment first: never ask for a payment that has already arrived
  if (raw.type === 'payment' && paymentCheck(raw, now).paid) {
    patchOpp(id, (o) => ({ ...o, recovered: { at: now, orderId: o.payment.ref, value: o.payment.amount, basis: 'operational', note: 'Payment arrived' } }));
    return { ok: false, message: 'The payment has arrived. Nothing was sent, and the order goes ahead.' };
  }
  const st = stateOf(raw, now, c);
  if (st === 'recovered') return { ok: false, message: 'They already ordered. Nothing was sent.' };
  if (st === 'expired') return { ok: false, message: 'The recovery window has passed.' };
  if (st === 'stock_blocked' && channel !== 'call') return { ok: false, message: 'An item is out of stock. It waits for stock.' };
  // 2. consent (Customers) — cart reminders are marketing; payment follow-ups and calls are service
  const cls = raw.type === 'payment' || channel === 'call' ? 'service' : 'marketing';
  if (c) { const why = whyNotAllowed(c, channel, cls); if (why) return { ok: false, message: why }; }
  else if (raw.guest) { const g = (raw.guest.consent || {})[channel]; if (channel !== 'call' && g !== 'in') return { ok: false, message: 'The guest did not agree to ' + CH_LABEL[channel] + ' at checkout.' }; }
  // 3. shared quiet hours and limits (Communications)
  const q = canSendNow(c, channel, now, cls); if (!q.ok) return { ok: false, message: q.reason };
  const capOk = withinCaps(c, now, cls); if (channel !== 'call' && !capOk.ok) return { ok: false, message: capOk.reason };
  const s = getReminderSettings();
  const stepDef = step != null ? s.steps[step - 1] : null;
  const found = stepDef && stepDef.offerId ? offerBy(stepDef.offerId) : null;
  const offer = found && found.usable ? found : null;
  const code = offer && c ? issueCode(offer.id, c.id) : '';
  patchOpp(id, (o) => ({ ...o, step: step != null ? Math.max(o.step, step) : o.step, contacts: [{ at: now, channel, by, kind, step, offerId: offer ? offer.id : '', code }, ...o.contacts] }));
  if (channel !== 'call') noteSent(c, channel, now, cls);
  enrol(raw.type === 'payment' ? 'payment_failed' : raw.type === 'checkout' ? 'checkout_abandoned' : 'cart_abandoned', id, { customerId: raw.customerId || '' });
  const where = c ? c.phone : (raw.guest || {}).phone;
  return { ok: true, message: channel === 'call' ? 'Call logged for ' + where + '.' : raw.type === 'payment' ? CH_LABEL[channel] + ' sent: a link to finish the payment.' : CH_LABEL[channel] + ' sent to ' + where + ' with a link back to the cart' + (code ? ' and code ' + code : '') + '.' };
}
export function queueCall(id, by = 'Staff') { patchOpp(id, (o) => ({ ...o, callQueued: true, queuedBy: by })); }
export function unqueueCall(id) { patchOpp(id, (o) => ({ ...o, callQueued: false })); }
/** An order followed: the opportunity is recovered (operational rule; ads are not credited here). */
export function markRecovered(id, orderId, value) { patchOpp(id, (o) => ({ ...o, recovered: { at: Date.now(), orderId, value: value != null ? value : valueOf(o), basis: 'operational' } })); }
/** Stock came back for the blocked items (Inventory's back-in-stock event; resumes the journey once). */
export function stockBack(id) {
  const r = enrol('back_in_stock', id);
  if (!r.duplicate) patchOpp(id, (o) => ({ ...o, items: o.items.map((i) => ({ ...i, inStock: true })) }));
  return !r.duplicate;
}

/**
 * The automatic reminders, run as the server would: each open cart whose next step is due gets it once, on the
 * first channel that passes the checks. Returns how many went out and how many were held (with reasons).
 */
export function runReminders(now = Date.now()) {
  const s = getReminderSettings();
  if (!s.on) return { sent: 0, held: [] };
  const dir = getDirectory();
  const thisMonth = (cid) => readOpps().filter((x) => x.customerId && x.customerId === cid && now - x.leftAt < 30 * DAY).length;
  let sent = 0; const held = [];
  readOpps().forEach((o) => {
    if (o.type === 'payment') return;
    const c = who(o, dir);
    const st = stateOf(o, now, c, s);
    if (st !== 'contactable' && st !== 'waiting') return;
    if (valueOf(o) < s.minCart) return;
    if (s.skipRepeat && o.customerId && thisMonth(o.customerId) >= (s.repeatLimit || 3)) return;
    if (valueOf(o) >= s.bigCart && !o.callQueued) { queueCall(o.id, 'Automation'); return; }
    const step = s.steps[o.step];
    if (!step || !step.on || now - o.leftAt < step.wait * HOUR) return;
    const key = enrol('cart_abandoned', o.id + '#step' + (o.step + 1), { customerId: o.customerId || '', journey: 'reminders' });
    if (key.duplicate) return;
    const chans = Object.keys(step.ch || {}).filter((k) => step.ch[k]).map((k) => (k === 'wa' ? 'whatsapp' : k));
    let done = null, why = '';
    chans.some((ch) => { const r = contactOpportunity(o.id, ch, { by: 'Automation', kind: 'auto', step: o.step + 1, now }); if (r.ok) done = ch; else why = r.message; return r.ok; });
    if (done) sent += 1; else held.push({ id: o.id, why });
  });
  return { sent, held };
}

// ---- reporting (operational; attribution is Analytics') -------------------------------------------------------
/** Figures for the last `days` days: opportunities, value at risk, recovered orders and value, recovery rate. */
export function recoveryReport(days = 30, now = Date.now()) {
  const all = getOpportunities(now).filter((o) => now - o.leftAt <= days * DAY);
  const open = all.filter((o) => OPEN_STATES.includes(o.state));
  const rec = all.filter((o) => o.state === 'recovered');
  rec.forEach((o) => { if (!o.recovered && o.payment) o.recovered = { orderId: o.payment.ref, value: o.payment.amount, basis: 'operational', note: 'Payment arrived' }; });
  const settled = all.filter((o) => o.state === 'recovered' || o.state === 'expired' || now - o.leftAt > DAY);
  return {
    days, count: all.length, newToday: all.filter((o) => now - o.leftAt < DAY).length,
    atRisk: open.reduce((a, o) => a + o.value, 0), openCount: open.length,
    recovered: rec.length, recoveredValue: rec.reduce((a, o) => a + ((o.recovered || {}).value || o.value), 0),
    rate: settled.length ? Math.round((rec.length / settled.length) * 100) : 0,
    basis: RECOVERY_BASIS, attribution: 'Not counted as sales from ads or messages. Analytics decides that.',
    byState: Object.keys(OPP_STATES).reduce((m, k) => { m[k] = all.filter((o) => o.state === k).length; return m; }, {}),
  };
}
/** Orders counted as recovered: ad and campaign reports should not claim them from this list. */
export const recoveredOrderIds = () => getOpportunities().filter((o) => o.state === 'recovered').map((o) => (o.recovered ? o.recovered.orderId : (o.payment || {}).ref)).filter(Boolean);
export const isRecoveredOrder = (orderId) => recoveredOrderIds().includes(orderId);

// ---- privacy and retention ----------------------------------------------------------------------------------------
/** Drop closed opportunities older than `days` (recovered and expired ones; open ones stay). → how many went. */
export function purgeOld(days, now = Date.now()) {
  const list = readOpps();
  const keep = list.filter((o) => !(o.recovered || now - o.leftAt > 7 * DAY) || now - o.leftAt <= days * DAY);
  saveOpps(keep);
  return list.length - keep.length;
}
/** Remove a customer from recovery (privacy request): their opportunities are deleted. → how many. */
export function forgetCustomer(customerId) {
  const list = readOpps();
  const keep = list.filter((o) => o.customerId !== customerId);
  saveOpps(keep);
  return list.length - keep.length;
}
export { valueOf as cartValue, HOUR, DAY };
