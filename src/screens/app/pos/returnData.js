// returnData — the phone's return & exchange (MReturn.jsx, AP-F5), on the same books and rules as the web's
// /return-exchange (screens/sales/ReturnExchange.jsx). Kept small: one sale, the lines coming back, a refund or one
// replacement item, back on sale or to the damaged bay.
//   saleSources()          every sale this phone can take a return on: POS counter sales (posStore), delivered online
//                          orders, and the counters' live sales after September (liveCounterSales). Each line knows how
//                          many are left to return and what the customer really paid for one (its share of discounts).
//   findSales(q, list)     by memo / order number, the customer's mobile, or an IMEI / serial sold on the sale
//   saveReturn(input)      does what the web does on Confirm: the history row (lib/returns.js › addReturn), the quantities
//                          marked on a POS sale, stock back at the place (or into the damaged bay with a hold), the money
//                          (cash out of the shop's cash account; bKash / Nagad / card as a tracked refund, lib/refunds;
//                          store credit to the member wallet; cut from the sale's due), an exchange's extra payment posted
//                          with its transaction ID (used once), IMEI / serial numbers back on the register.
// The shared logic lives in the web screen today; a later pass can move both into one lib (lib/returnFlow.js).

import { POS_KEYS, load, save, getSettings, getCounters } from '@/lib/posStore';
import { addReturn, returnedFromHistory, cutFromHistory } from '@/lib/returns';
import { getOrders, orderChannel } from '@/lib/orders';
import { updateOrder } from '@/lib/orderLinks';
import { serialsOfLine } from '@/lib/customerWarranty';
import { productBy, addMove } from '@/lib/stock';
import { addHolds } from '@/lib/stockHolds';
import { DAMAGED_PLACE, onlinePlace } from '@/lib/locations';
import { postEntry, accountForMethod } from '@/lib/ledger';
import { claimRef, refMessage } from '@/lib/paymentRefs';
import { requestRefund } from '@/lib/refunds';
import { issueCredit } from '@/lib/storeCredit';
import { returnSerial } from '@/lib/serials';
import { liveCounterSales } from '@/lib/liveCounterSales';

const DAY = 864e5;
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
export const digitsOf = (t) => String(t || '').replace(/\D/g, '').replace(/^88(?=01)/, '');
export const REASONS = [['bad', 'Faulty item'], ['size', 'Wrong size'], ['wrong', 'Wrong item given'], ['mind', 'Changed mind'], ['exp', 'Expired']];
export const REFUND_METHODS = ['Cash', 'bKash', 'Nagad', 'Card'];
export const PAY_IN_METHODS = ['Cash', 'bKash', 'Nagad', 'Card'];
export const returnDays = () => safe(() => getSettings().returnDays || 7, 7);
export { refMessage };

function shape(s) {
  const t = s.totals || {};
  const base = (t.gross || 0) - (t.lineDisc || 0);
  const share = base ? (t.total || base) / base : 1;
  const lines = (s.lines || []).map((l) => {
    const done = Math.min(l.qty, (s.returned || {})[l.id] || 0);
    const unit = l.price - (l.disc || 0) / (l.qty || 1);
    return { ...l, each: r2(unit * share), done, left: Math.max(0, l.qty - done), serials: (l.serials || []).filter(Boolean) };
  });
  return { ...s, share, lines, due: Math.max(0, r2(s.due || 0)), open: lines.some((l) => l.left > 0), total: r2(t.total || lines.reduce((a, l) => a + l.price * l.qty, 0)) };
}

/** Every sale this phone can take a return on, newest first. */
export function saleSources() {
  const counters = safe(() => getCounters(), []);
  const placeOf = (counter) => (counters.find((c) => c.name === counter) || {}).stock || 'Dhanmondi branch';
  const out = [];
  safe(() => load(POS_KEYS.sales, []), []).filter((s) => !s.voided).forEach((s) => out.push(shape({
    key: 'pos:' + s.id, kind: 'pos', id: s.id, ref: s.id, label: 'Sale ' + s.id, at: s.at, channel: s.wholesale ? 'Wholesale' : 'Retail',
    customer: s.customer || {}, lines: s.lines, totals: s.totals, due: s.due || 0, place: s.place || placeOf(s.counter), counter: s.counter || '',
    returned: s.returned || {}, orderId: s.orderId || '', byWallet: (s.tenders || []).some((x) => x.method === 'Wallet'),
  })));
  safe(() => getOrders(), []).filter((o) => orderChannel(o) === 'Online' && o.statusKey === 'delivered' && (o.lines || []).length).forEach((o) => {
    const lines = o.lines.map((l, i) => ({ id: `${o.id}-${i + 1}`, sku: l.sku || '', name: l.name, price: Number(l.price) || 0, qty: Number(l.qty) || 0, disc: 0, serials: safe(() => serialsOfLine(o, l, null), []) }));
    const gross = r2(lines.reduce((a, l) => a + l.price * l.qty, 0));
    const goods = r2(Math.max(0, (o.amount || 0) - (o.shipping || 0)));
    out.push(shape({
      key: 'ord:' + o.id, kind: 'online', id: o.id, ref: o.id, label: 'Order ' + o.id, at: (o.times && o.times.delivered) || o.at, channel: 'Online',
      customer: { name: o.customer, phone: digitsOf(o.phone) }, lines, totals: { gross, lineDisc: 0, total: goods || gross },
      due: Math.max(0, o.paid == null ? 0 : r2(o.amount - o.paid)) - safe(() => cutFromHistory(o.id), 0),
      place: (o.stockOut && o.stockOut.place) || safe(() => onlinePlace(), 'Central Warehouse'), counter: '', returned: safe(() => returnedFromHistory(o.id), {}), orderId: o.id,
    }));
  });
  safe(() => liveCounterSales(), []).forEach((x) => out.push(shape({
    key: 'live:' + x.id, kind: 'memo', id: x.id, ref: x.id, label: 'Sale ' + x.id, at: x.at, channel: 'Retail', customer: x.customer || {}, lines: x.lines,
    totals: x.totals, due: 0, place: x.place, counter: x.counter || '', returned: safe(() => returnedFromHistory(x.id), {}), orderId: x.id,
  })));
  return out.sort((a, b) => b.at - a.at);
}

/** Sales matching a number, a mobile number or an IMEI / serial (at most 8). */
export function findSales(q, list) {
  const text = String(q || '').trim().toLowerCase().replace(/^#/, '');
  if (!text) return list.filter((s) => s.open).slice(0, 6);
  const d = digitsOf(q);
  const up = String(q || '').trim().toUpperCase().replace(/\s+/g, '');
  return list.filter((s) => {
    const ids = [s.id, s.ref, s.orderId].filter(Boolean).map((x) => String(x).toLowerCase().replace(/#/g, ''));
    return ids.some((x) => x.includes(text.replace(/#/g, '')))
      || (d.length >= 4 && digitsOf(s.customer.phone).includes(d))
      || (up.length >= 6 && s.lines.some((l) => l.serials.includes(up)))
      || (text.length >= 2 && !d && String(s.customer.name || '').toLowerCase().includes(text));
  }).slice(0, 8);
}

/** Is the sale older than the return window (needs a manager)? */
export const outsideWindow = (sale, now = Date.now()) => now - sale.at > returnDays() * DAY;

/**
 * Save the return or exchange.
 * input: { sale, picks { lineId: qty }, reason (label), resell (bool), method (refund: Cash | bKash | Nagad | Card |
 *          Store credit | Cut from due), refundTo (wallet number), exchange: { sku, name, price, qty } | null,
 *          pay: { method, ref } (when the customer pays extra), by, approvedBy, counter }
 * Returns { ok, id, moneyText, stockText } or { ok: false, error }.
 */
export function saveReturn(input) {
  const { sale, picks, reason, resell, by, approvedBy = '', exchange = null } = input;
  const back = sale.lines.filter((l) => picks[l.id] > 0);
  if (!back.length) return { ok: false, error: 'Tick the items coming back first.' };
  if (back.some((l) => picks[l.id] > l.left)) return { ok: false, error: 'That is more than is left to return on this sale.' };
  const now = Date.now();
  const custName = sale.customer.name || 'Walk-in customer';
  const phone = digitsOf(sale.customer.phone);
  const credit = r2(back.reduce((a, l) => a + picks[l.id] * l.each, 0));
  const newVal = exchange ? r2(exchange.price * (exchange.qty || 1)) : 0;
  const diff = exchange ? r2(newVal - credit) : -credit;
  const dir = diff > 0 ? 'in' : diff < 0 ? 'out' : 'even';
  const amt = Math.abs(diff);
  const kindWord = exchange ? 'Exchange' : 'Return';
  const stockPlace = resell ? sale.place : DAMAGED_PLACE;
  const m = dir === 'out' ? input.method || 'Cash' : dir === 'in' ? (input.pay && input.pay.method) || 'Cash' : '';
  if (dir === 'out' && m === 'Store credit' && !phone) return { ok: false, error: 'Store credit needs the customer’s mobile number on the sale.' };
  if (dir === 'out' && m === 'Cut from due' && !(sale.due > 0)) return { ok: false, error: 'Nothing is due on this sale.' };
  const payRef = dir === 'in' && m !== 'Cash' ? String((input.pay && input.pay.ref) || '').trim() : '';
  if (dir === 'in' && m !== 'Cash' && !payRef) return { ok: false, error: m === 'Card' ? 'Type the card slip number.' : `Type the ${m} transaction ID.` };
  if (payRef) { const why = refMessage(payRef, sale.ref); if (why) return { ok: false, error: `${payRef}: ${why}` }; }
  const cut = m === 'Cut from due' ? r2(Math.min(sale.due, amt)) : 0;
  const rest = m === 'Cut from due' ? r2(amt - cut) : 0;

  // money
  const posts = [];
  const post = (method, amount, kind, extra = {}) => {
    const account = accountForMethod(method, true);
    if (!account || !amount) return;
    const e = postEntry({ account, amount, kind, ref: sale.ref, party: custName, note: `${kindWord} on ${sale.label} (phone app)`, by, ...extra });
    if (e) posts.push(e);
  };
  let refund = null;
  if (dir === 'in') {
    post(m, amt, 'sale', payRef ? { txn: payRef } : {});
    if (payRef) claimRef(payRef, sale.ref, { by, what: kindWord.toLowerCase() + ' payment' });
  } else if (dir === 'out' && m === 'Cash') post('Cash', -amt, 'refund');
  else if (dir === 'out' && REFUND_METHODS.includes(m)) refund = safe(() => requestRefund({ ref: sale.ref, customer: custName, phone: (m === 'bKash' || m === 'Nagad') && input.refundTo ? digitsOf(input.refundTo) : phone, amount: amt, method: m, reason: reason + ((m === 'bKash' || m === 'Nagad') && input.refundTo ? ` · send to ${digitsOf(input.refundTo)}` : ''), source: kindWord }), null);
  else if (dir === 'out' && m === 'Cut from due' && rest) post('Cash', -rest, 'refund');

  const items = back.map((l) => `${l.name} × ${picks[l.id]}`).join(', ');
  const given = exchange ? `${exchange.name} × ${exchange.qty || 1}` : '';
  const moneyKind = dir === 'in' ? 'collected' : dir === 'even' ? 'even' : m === 'Store credit' || m === 'Cut from due' ? 'credited' : 'refunded';
  const drawer = { out: dir === 'out' ? (m === 'Cash' ? amt : rest) : 0, in: dir === 'in' && m === 'Cash' ? amt : 0 };
  const qtyMap = Object.fromEntries(back.map((l) => [l.id, picks[l.id]]));
  const row = addReturn({
    at: now, channel: sale.channel, ref: sale.ref, source: sale.kind, customer: custName, phone,
    items: items + (exchange ? ` → ${given}` : ''), returned: qtyMap, type: exchange ? 'exchange' : 'return',
    amount: amt, credit, money: moneyKind, method: m, cut, stock: resell ? 'restock' : 'damaged', reason,
    place: stockPlace, by, approvedBy, account: posts.length ? posts[0].account : '', ledger: posts.map((e) => e.id),
    counter: input.counter || sale.counter || '', drawer, via: 'app',
    ...(dir === 'in' ? { payments: [{ method: m, amount: amt, ref: payRef }] } : {}),
  });

  if (dir === 'out' && m === 'Store credit') safe(() => issueCredit({ phone, amount: amt, source: 'return', ref: row.id, by, channel: sale.channel === 'Online' ? 'Online' : 'Retail' }), null);
  back.forEach((l) => l.serials.slice(0, picks[l.id]).forEach((x) => safe(() => returnSerial(x, { ref: row.id, place: stockPlace }), null)));

  // a POS sale keeps what came back, so it can't come back twice, and its due goes down
  if (sale.kind === 'pos') {
    let paidOff = false;
    const entry = { type: exchange ? 'exchange' : 'return', reason, at: now, items, rt: row.id, counter: input.counter || sale.counter || '', amount: dir === 'out' ? amt : 0, method: m, ...(dir === 'in' ? { collected: amt } : {}), ...(exchange ? { given: [`${exchange.qty || 1} × ${exchange.name}`] } : {}) };
    const next = load(POS_KEYS.sales, []).map((x) => {
      if (x.id !== sale.id) return x;
      const returned = { ...(x.returned || {}) };
      Object.entries(qtyMap).forEach(([id, n]) => { returned[id] = (returned[id] || 0) + n; });
      const newDue = Math.max(0, r2((x.due || 0) - cut));
      paidOff = cut > 0 && newDue === 0;
      return { ...x, returned, refunds: [...(x.refunds || []), entry], due: newDue };
    });
    save(POS_KEYS.sales, next);
    if (paidOff && sale.orderId) safe(() => updateOrder(sale.orderId, { payment: 'Paid' }), null);
  }

  // stock
  const noRecord = [];
  if (resell) {
    back.forEach((l) => { const p = productBy(l.name) || (l.sku ? { sku: l.sku } : null); if (p) addMove({ sku: p.sku, place: sale.place, qty: picks[l.id], kind: 'return', reason, by, ref: sale.ref }); else noRecord.push(l.name); });
  } else {
    safe(() => addHolds({ type: 'damaged', ref: sale.ref, who: custName, place: DAMAGED_PLACE, note: `${reason} · returned on ${sale.label}`, by }, back.map((l) => ({ name: l.name, qty: picks[l.id] }))), null);
    back.forEach((l) => { const p = productBy(l.name) || (l.sku ? { sku: l.sku } : null); if (p && picks[l.id]) addMove({ sku: p.sku, place: DAMAGED_PLACE, qty: picks[l.id], kind: 'return', reason: reason + ' · damaged', by, ref: sale.ref }); });
  }
  if (exchange) addMove({ sku: exchange.sku, place: sale.place, qty: -(exchange.qty || 1), kind: 'exchange', reason: 'Given in exchange', by, ref: sale.ref });

  const money = (n) => '৳' + Math.round(n).toLocaleString('en-IN');
  const moneyText = dir === 'in' ? `${money(amt)} collected by ${m}` : dir === 'even' ? 'Even swap, nothing paid'
    : m === 'Cut from due' ? `${money(cut)} taken off the due${rest ? ` · ${money(rest)} given back in cash` : ''}`
      : m === 'Store credit' ? `${money(amt)} kept as store credit`
        : refund ? `Refund ${refund.id} of ${money(amt)} by ${m} ${refund.stage === 'requested' ? 'waits for approval' : 'is ready to send'}` : `${money(amt)} given back in cash`;
  const stockText = (resell ? `Back on sale at ${sale.place}` : `Moved to ${DAMAGED_PLACE}`) + (noRecord.length ? ` · no stock record for ${noRecord.join(', ')}` : '') + (exchange ? ` · ${given} taken from ${sale.place}` : '');
  return { ok: true, id: row.id, moneyText, stockText, exchange: !!exchange };
}
