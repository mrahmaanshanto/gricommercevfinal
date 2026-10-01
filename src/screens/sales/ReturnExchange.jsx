'use client';
// ReturnExchange — the one place goods come back, for every channel: counter (POS) sales, wholesale
// invoices and online orders.
//   1  find the sale: memo / invoice / order number or the customer's mobile number
//      (?ref=<sale id, invoice id or order id> opens it straight away; &mode=exchange starts on Exchange)
//   2  tick what is coming back (never more than is left to return), say why, then refund it or
//      exchange it for another item, and say whether it can be sold again
// The summary shows who pays whom and where the stock goes. Credit is what the customer really paid
// for the item: its share of every discount is taken off and VAT is included (same as the register).
// Confirm saves the return to the history, marks the quantities on the sale so they cannot come back
// twice, takes money off the due when chosen, and moves the stock (back on sale, or to damaged).
// Money paid out (cash, bKash, Nagad, card) or collected on an exchange is posted to the ledger, so
// Accounts shows it; "Cut from due" and store credit move no money.
// Front end only: sales, invoices and orders come from this browser plus two demo memos.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { PageHeader, EmptyState } from '@/components/ui';
import { ManagerPin } from '@/components/ManagerPin';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { addReturn, getReturns, returnedFromHistory, cutFromHistory, storeCreditFor } from '@/lib/returns';
import { POS_KEYS, load, save, getSettings, getCounters, EMPLOYEES } from '@/lib/posStore';
import { getInvoices, saveInvoice, stockOutAtSale, sentOf } from '@/lib/invoices';
import { extraOrders, updateOrder } from '@/lib/orderLinks';
import { CATALOG, productBy, addMove, stockAt } from '@/lib/stock';
import { addHolds, holdsFor, closeHold } from '@/lib/stockHolds';
import { DAMAGED_PLACE } from '@/lib/locations';
import { postEntry, accountForMethod, accountBy } from '@/lib/ledger';

const DAY = 86400000;
const r2 = (n) => Math.round(n * 100) / 100;
const money = (n) => { const v = r2(n); return formatBDT(v, { decimals: Number.isInteger(v) ? 0 : 2 }); };
const digitsOf = (t) => String(t || '').replace(/\D/g, '').replace(/^88(?=01)/, '');
const prettyPhone = (p) => { const d = digitsOf(p); return d.length === 11 ? d.slice(0, 5) + '-' + d.slice(5) : p || ''; };
const amountOf = (t) => Number(String(t || '').replace(/[^0-9.]/g, '')) || 0;

// two counter memos from yesterday, kept as demo sales (their returns are counted from the history)
const memoAt = (day, h, m) => new Date(2026, 8, day, h, m).getTime();
const memoLine = (memo, i, name, qty) => ({ id: memo + '-' + i, name, price: (productBy(name) || { price: 0 }).price, qty, disc: 0 });
const MEMOS = [
  { id: '1038', at: memoAt(29, 9, 55), customer: { name: '', phone: '' }, cashier: 'Moumita Das', place: 'Mirpur branch', due: 0,
    lines: [memoLine('1038', 1, 'Premium Cotton Oversized T-Shirt', 1), memoLine('1038', 2, 'Daily Care Shampoo 340ml', 1), memoLine('1038', 3, 'Steel Water Bottle 750ml', 1), memoLine('1038', 4, 'Hyaluronic Toner 150ml', 1)] },
  { id: '1040', at: memoAt(29, 10, 21), customer: { name: 'Karim Saheb', phone: '01711234567' }, cashier: 'Arif Rahman', place: 'Mirpur branch', due: -1,
    lines: [memoLine('1040', 1, 'Premium Miniket Rice 5kg', 1), memoLine('1040', 2, 'Soybean Cooking Oil 2L', 2), memoLine('1040', 3, 'Atta Wheat Flour 2kg', 5), memoLine('1040', 4, 'Chickpeas Boot Dal 1kg', 5), memoLine('1040', 5, 'Wireless Earbuds Pro', 1)] },
];

const REASONS = [['bad', 'Faulty item', 'triangle-alert'], ['size', 'Wrong size', 'ruler'], ['wrong', 'Wrong item given', 'repeat'], ['mind', 'Changed mind', 'user-round'], ['exp', 'Expired', 'calendar-x']];
const PAY_METHODS = ['Cash', 'bKash', 'Nagad', 'Card'];
const CHANNEL_TONE = { Retail: 'info', Wholesale: 'primary', Online: 'secondary' };

/** "30 Sep, 2:05 PM" (orders list stamp, no year) -> time */
function parsePlaced(text) {
  const m = /^(\d{1,2}) (\w{3}),? (\d{1,2}):(\d{2}) (AM|PM)$/.exec(String(text || '').trim());
  if (!m) return Date.now();
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(m[2]);
  const now = new Date();
  const d = new Date(now.getFullYear(), Math.max(0, month), Number(m[1]), (Number(m[3]) % 12) + (m[5] === 'PM' ? 12 : 0), Number(m[4]));
  if (d.getTime() > now.getTime() + DAY) d.setFullYear(d.getFullYear() - 1);
  return d.getTime();
}

/** One shape for every sale that can take a return. */
function shape(s) {
  const t = s.totals;
  const base = t.gross - (t.lineDisc || 0);
  const share = base ? t.total / base : 1;           // what the customer really paid per taka of line price
  const vat = t.taxable ? t.tax / t.taxable : 0;
  const lines = s.lines.map((l) => {
    const done = Math.min(l.qty, s.returned[l.id] || 0);
    return { ...l, unit: l.price - (l.disc || 0) / l.qty, each: r2((l.price - (l.disc || 0) / l.qty) * share), done, left: l.qty - done };
  });
  return { ...s, share, vat, lines, due: Math.max(0, r2(s.due)), open: lines.some((l) => l.left > 0) };
}

/** Every sale this browser knows about: POS sales, invoices, online orders and the demo memos. */
function buildSources() {
  const counters = getCounters();
  const placeOf = (counter) => (counters.find((c) => c.name === counter) || {}).stock || 'Dhanmondi branch';
  const sales = load(POS_KEYS.sales, []);
  const out = sales.map((s) => shape({
    key: 'pos:' + s.id, kind: 'pos', id: s.id, ref: s.id, label: s.id, at: s.at, channel: s.wholesale ? 'Wholesale' : 'Retail',
    customer: s.customer || {}, lines: s.lines, totals: s.totals, due: s.due || 0, place: s.place || placeOf(s.counter), cashier: s.cashier,
    returned: s.returned || {}, orderId: s.orderId || '',
    // paid (partly) from the customer's wallet: money given back goes back to the wallet by default
    byWallet: (s.tenders || []).some((x) => x.method === 'Wallet'),
  }));
  getInvoices().filter((inv) => inv.src !== 'pos').forEach((inv) => out.push(shape({
    key: 'inv:' + inv.id, kind: 'invoice', id: inv.id, ref: inv.id, label: inv.id, at: inv.at, channel: 'Wholesale',
    customer: inv.customer || {}, lines: inv.lines, totals: inv.totals, due: inv.due || 0, place: placeOf(inv.counter), cashier: inv.cashier,
    returned: inv.returned || {}, orderId: '',
  })));
  const posOrders = new Set(sales.map((s) => s.orderId).filter(Boolean));
  extraOrders().filter((o) => !posOrders.has(o.id) && !/^(POS|Wholesale) ·/.test(o.channel || '')).forEach((o) => {
    const meta = /^(\d+) items? · (.+)$/.exec(o.itemMeta || '');
    const count = meta ? Number(meta[1]) : 1;
    const value = meta ? amountOf(meta[2]) : amountOf(o.total);
    out.push(shape({
      key: 'ord:' + o.id, kind: 'online', id: o.id, ref: o.id, label: 'Order ' + o.id, at: parsePlaced(o.placed), channel: 'Online',
      customer: { name: o.customer, phone: digitsOf(o.phone) }, lines: [{ id: o.id + '-1', name: o.itemTitle || 'Items from the order', price: r2(value / count), qty: count, disc: 0 }],
      totals: { gross: value, lineDisc: 0, total: value }, due: o.payment === 'Unpaid' ? amountOf(o.total) - cutFromHistory(o.id) : 0,
      place: 'Central Warehouse', cashier: '', returned: returnedFromHistory(o.id), orderId: o.id,
    }));
  });
  MEMOS.forEach((m) => {
    const gross = m.lines.reduce((a, l) => a + l.price * l.qty, 0);
    const ref = 'Memo #' + m.id;
    out.push(shape({
      key: 'memo:' + m.id, kind: 'memo', id: '#' + m.id, ref, label: ref, at: m.at, channel: 'Retail', customer: m.customer, lines: m.lines,
      totals: { gross, lineDisc: 0, total: gross }, due: (m.due < 0 ? gross : m.due) - cutFromHistory(ref), place: m.place, cashier: m.cashier,
      returned: returnedFromHistory(ref), orderId: '',
    }));
  });
  return out.sort((a, b) => b.at - a.at);
}

const CSS = `
.re-grid{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:var(--space-4);align-items:start}
.re-col{display:flex;flex-direction:column;gap:var(--space-4);min-width:0}
.re-card{padding:var(--space-4);gap:var(--space-3)}
.re-head{display:flex;align-items:center;gap:var(--space-3)}
.re-head h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.re-head p{margin:0 0 0 auto;font-size:var(--text-xs);color:var(--text-muted)}
.re-step{display:grid;place-items:center;width:24px;height:24px;flex:none;border-radius:var(--radius-full);background:var(--primary);color:#fff;font-size:var(--text-xs);font-weight:var(--weight-medium)}
.re-step.is-off{background:var(--slate-300)}
.re-find{display:flex;flex-wrap:wrap;gap:var(--space-2);margin:0}
.re-search{position:relative;flex:1 1 220px;min-width:0}
.re-search svg{position:absolute;left:12px;top:13px;color:var(--text-muted);pointer-events:none}
.re-search input{padding-left:38px;font-family:var(--font-data)}
.re-chip{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border:1px solid var(--border-field);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);white-space:nowrap;cursor:pointer}
.re-chip:hover{border-color:var(--border-field-hover)}
.re-chip.is-on{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.re-chip:disabled{opacity:.5;cursor:not-allowed}
.re-memo{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-4);padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.re-memo__ico{display:grid;place-items:center;width:36px;height:36px;flex:none;border-radius:var(--radius-lg);background:var(--surface-card);color:var(--primary)}
.re-memo__main{flex:1;min-width:180px}
.re-strong{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.re-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.re-memo__total{font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
.re-results{display:flex;flex-direction:column;gap:var(--space-1)}
.re-res{display:grid;grid-template-columns:minmax(120px,1fr) minmax(0,1.3fr) 92px 96px 88px;align-items:center;gap:var(--space-3);min-height:48px;padding:6px var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;font-size:var(--text-sm);color:var(--text-body);text-align:left;cursor:pointer}
.re-res:hover{border-color:var(--primary);background:var(--fill-primary-soft)}
.re-res__id{font-family:var(--font-data);font-weight:var(--weight-medium);color:var(--primary);overflow-wrap:anywhere}
.re-res__who{min-width:0;color:var(--text-heading)}
.re-res__who small{display:block;font-size:var(--text-xs);color:var(--text-muted);font-family:var(--font-data)}
.re-res__when{font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.re-res__total{text-align:right;font-weight:var(--weight-medium);color:var(--text-heading);font-variant-numeric:tabular-nums;white-space:nowrap}
.re-res .gc-badge{justify-self:end;white-space:nowrap}
.re-items{margin:0;padding:0;list-style:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden}
.re-item{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);min-height:52px;padding:6px var(--space-3);border-top:1px solid var(--border-subtle)}
.re-item:first-child{border-top:0}
.re-item.is-on{background:var(--fill-primary-soft)}
.re-item.is-done{background:var(--surface-subtle)}
.re-item.is-done .re-strong{color:var(--text-muted)}
.re-item label{flex:1 1 220px;min-width:0;display:flex;align-items:center;gap:var(--space-3);cursor:pointer}
.re-item.is-done label{cursor:not-allowed}
.re-item__val{flex:none;min-width:64px;margin-left:auto;text-align:right;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);font-variant-numeric:tabular-nums;white-space:nowrap}
.re-item__val.is-off{font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.re-stepper{display:flex;align-items:center;gap:2px;flex:none;padding:2px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.re-stepper button{display:grid;place-items:center;width:32px;height:32px;border:0;border-radius:var(--radius-md);background:none;color:var(--text-body);cursor:pointer}
.re-stepper button:hover{background:var(--surface-subtle)}
.re-stepper button:disabled{opacity:.4;cursor:not-allowed}
.re-stepper b{min-width:24px;text-align:center;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);font-variant-numeric:tabular-nums}
.re-cap{font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted)}
.re-block{display:flex;flex-direction:column;gap:var(--space-2)}
.re-row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.re-lock{display:flex;flex-direction:column;gap:var(--space-3);min-width:0;margin:0;padding:0;border:0}
.re-seg{display:grid;grid-template-columns:1fr 1fr;gap:3px;padding:3px;border-radius:var(--radius-lg);background:var(--slate-150)}
.re-seg button{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:38px;border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.re-seg button.is-on{background:#fff;color:var(--primary);box-shadow:0 1px 2px rgba(48,46,56,.12)}
.re-seg--sm{display:inline-grid;grid-template-columns:auto auto}
.re-seg--sm button{height:32px;padding:0 14px}
.re-cands{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2)}
.re-cand{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);min-height:52px;padding:4px var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;font-size:var(--text-sm);color:var(--text-heading);text-align:left;cursor:pointer}
.re-cand.is-on{border-color:var(--primary);background:var(--fill-primary-soft)}
.re-cand:disabled{opacity:.55;cursor:not-allowed}
.re-cand small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.re-cand__price{flex:none;font-variant-numeric:tabular-nums;color:var(--text-body)}
.re-note{display:flex;align-items:flex-start;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);font-size:var(--text-xs);line-height:18px}
.re-note svg{flex:none;margin-top:1px}
.re-note--ok{background:var(--fill-success-soft);color:var(--text-success)}
.re-note--warn{background:var(--fill-warning-soft);color:var(--text-warning)}
.re-note--info{background:var(--fill-primary-soft);color:var(--primary)}
.re-resell{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-2) var(--space-3);padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.re-sum{display:grid;grid-template-columns:1fr auto;gap:6px var(--space-3);margin:0;font-size:var(--text-sm)}
.re-sum dt{color:var(--text-body)}
.re-sum dd{margin:0;text-align:right;font-weight:var(--weight-medium);color:var(--text-heading);font-variant-numeric:tabular-nums}
.re-facts{display:grid;grid-template-columns:auto minmax(0,1fr);gap:6px var(--space-3);margin:0;font-size:var(--text-sm)}
.re-facts dt{color:var(--text-muted)}
.re-facts dd{margin:0;text-align:right;color:var(--text-heading);overflow-wrap:anywhere}
.re-big{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);border-radius:var(--radius-lg)}
.re-big__ico{display:grid;place-items:center;width:40px;height:40px;flex:none;border-radius:var(--radius-lg);background:rgba(255,255,255,.7)}
.re-big span{display:block;font-size:var(--text-xs);font-weight:var(--weight-medium)}
.re-big b{display:block;font-size:var(--text-2xl);line-height:30px;font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
.re-big--out{background:var(--fill-warning-soft);color:var(--text-warning)}
.re-big--in{background:var(--fill-success-soft);color:var(--text-success)}
.re-big--due{background:var(--fill-primary-soft);color:var(--primary)}
.re-big--even{background:var(--surface-subtle);color:var(--text-body)}
.re-switch{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);font-size:var(--text-sm);color:var(--text-body)}
.re-done__ico{display:grid;place-items:center;width:32px;height:32px;flex:none;border-radius:var(--radius-full);background:var(--fill-success-soft);color:var(--text-success)}
.re-actions{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2)}
@media (max-width:1100px){.re-grid{grid-template-columns:minmax(0,1fr)}}
@media (max-width:760px){.re-res{grid-template-columns:minmax(0,1fr) auto}.re-res__when{grid-column:1}.re-res .gc-badge{grid-column:2;grid-row:1}}
@media (max-width:599px){.re-cands{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){
  /* step heads: number + title on one row, the helper line under the title */
  .re-head{flex-wrap:wrap;row-gap:2px}
  .re-head h2{flex:1 1 0;min-width:0}
  .re-head p{flex:1 0 100%;margin:0}
  .re-head > .re-step ~ p{padding-left:36px}
  .re-head > .re-done__ico ~ p{padding-left:44px}
}
`;

export default function ReturnExchange() {
  const [ready, setReady] = useState(false);
  const [sources, setSources] = useState([]);
  const [hist, setHist] = useState([]);
  const [returnDays, setReturnDays] = useState(7);
  const [q, setQ] = useState('');
  const [selKey, setSelKey] = useState('');
  const [picks, setPicks] = useState({});              // line id -> qty coming back
  const [reason, setReason] = useState('bad');
  const [resellPick, setResellPick] = useState(null);  // null: suggested by the reason
  const [mode, setMode] = useState('ret');             // ret | exch
  const [method, setMethod] = useState('');            // '' = the suggested one
  const [newSku, setNewSku] = useState('');
  const [newQty, setNewQty] = useState(1);
  const [nq, setNq] = useState('');
  const [slip, setSlip] = useState(true);
  const [by, setBy] = useState('');
  const [approvedBy, setApprovedBy] = useState('');
  const [pinOpen, setPinOpen] = useState(false);
  const [saved, setSaved] = useState(null);            // the confirmed return; the form is locked while set
  const [tick, setTick] = useState(0);                 // bumps after a save so stock figures re-read

  const reload = () => { const list = buildSources(); setSources(list); setHist(getReturns()); setTick((n) => n + 1); return list; };
  const matchRef = (s, ref) => { const r = String(ref).trim().toLowerCase(); return [s.id, s.ref, s.orderId, s.label].some((x) => x && String(x).toLowerCase() === r); };

  useEffect(() => {
    const list = reload();
    setReturnDays(getSettings().returnDays || 7);
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setQ(ref);
      const hit = list.find((s) => matchRef(s, ref));
      if (hit) { setSelKey(hit.key); if (params.get('mode') === 'exchange') setMode('exch'); }
      else toast(`No sale ${ref} was found in this browser. Search by number or mobile.`, { tone: 'error' });
    }
    setReady(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sel = sources.find((s) => s.key === selKey) || null;

  // ---- search ------------------------------------------------------------------------------------
  const text = q.trim().toLowerCase().replace(/^#/, '');
  const qDigits = digitsOf(q);
  const matches = !text ? sources.filter((s) => s.open).slice(0, 5) : sources.filter((s) => {
    const ids = [s.id, s.ref, s.orderId, s.label].filter(Boolean).map((x) => String(x).toLowerCase().replace(/#/g, ''));
    return ids.some((x) => x.includes(text.replace(/#/g, '')))
      || (qDigits.length >= 4 && digitsOf(s.customer.phone).includes(qDigits))
      || (text.length >= 2 && !qDigits && (s.customer.name || '').toLowerCase().includes(text));
  }).slice(0, 8);

  const choose = (s) => {
    setSelKey(s.key); setPicks({}); setMode('ret'); setMethod(''); setNewSku(''); setNewQty(1); setNq('');
    setReason('bad'); setResellPick(null); setApprovedBy(''); setBy('');
  };
  const find = (e) => {
    e.preventDefault();
    if (!text) { toast('Type a memo, invoice or order number, or the customer’s mobile number.', { tone: 'error' }); return; }
    const exact = sources.find((s) => matchRef(s, q) || matchRef(s, '#' + text));
    if (exact) { choose(exact); return; }
    if (matches.length === 1) { choose(matches[0]); return; }
    toast(matches.length ? `${matches.length} sales match. Pick one from the list.` : 'No sale matches that. Check the number or the mobile number.', matches.length ? undefined : { tone: 'error' });
  };

  // ---- the return --------------------------------------------------------------------------------
  const custName = sel ? sel.customer.name || 'Walk-in customer' : '';
  const phone = sel ? digitsOf(sel.customer.phone) : '';
  const back = sel ? sel.lines.filter((l) => picks[l.id]) : [];
  const pcs = back.reduce((n, l) => n + picks[l.id], 0);
  const credit = sel ? r2(back.reduce((a, l) => a + picks[l.id] * l.unit, 0) * sel.share) : 0;
  const reasonLabel = (REASONS.find((r) => r[0] === reason) || REASONS[0])[1];
  const suggestResell = !(reason === 'bad' || reason === 'exp');
  const resell = resellPick == null ? suggestResell : resellPick;
  const staff = by || (sel && EMPLOYEES.some((e) => e.name === sel.cashier) ? sel.cashier : EMPLOYEES[0].name);

  // the item given instead (exchange); priced like the sale: wholesale price for wholesale, same VAT
  const firstBack = back[0] || (sel ? sel.lines[0] : null);
  const newP = productBy(newSku) || (firstBack && productBy(firstBack.name)) || CATALOG[0];
  const unitOf = (p) => r2((sel && sel.channel === 'Wholesale' ? p.wholesale : p.price) * (1 + (sel ? sel.vat : 0)));
  const availOf = useMemo(() => {
    const cache = {};
    return (p) => { if (!sel) return 0; if (cache[p.sku] == null) cache[p.sku] = stockAt(p.sku, sel.place).available; return cache[p.sku]; };
  }, [sel && sel.place, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const newAvail = availOf(newP);
  const qtyNew = Math.max(1, Math.min(newQty, newAvail || 1));
  const newVal = r2(unitOf(newP) * qtyNew);
  const diff = r2(newVal - credit);
  const cands = [newP, ...CATALOG.filter((p) => p.sku !== newP.sku && (!nq.trim() || (p.name + ' ' + p.sku + ' ' + p.barcode).toLowerCase().includes(nq.trim().toLowerCase())))].slice(0, 6);

  // who pays whom
  const dir = mode === 'ret' ? (credit > 0 ? 'out' : 'even') : diff > 0 ? 'in' : diff < 0 ? 'out' : 'even';
  const amt = mode === 'ret' ? credit : Math.abs(diff);
  const due = sel ? sel.due : 0;
  const methods = dir === 'in' ? PAY_METHODS : dir === 'out' ? [...PAY_METHODS, 'Store credit', ...(due > 0 ? ['Cut from due'] : [])] : [];
  const m = methods.includes(method) && (method !== 'Store credit' || phone) ? method : dir === 'out' && due > 0 ? 'Cut from due' : dir === 'out' && sel && sel.byWallet && phone ? 'Store credit' : dir === 'even' ? '' : 'Cash';
  const cut = m === 'Cut from due' ? r2(Math.min(due, amt)) : 0;
  const rest = m === 'Cut from due' ? r2(amt - cut) : 0;
  const credits = sel && phone ? storeCreditFor(phone) : 0;
  const big = dir === 'in' ? ['in', 'Customer pays extra', amt, `The new item costs more · into ${(accountBy(accountForMethod(m, true)) || { name: m }).name}`, 'arrow-down-to-line']
    : dir === 'even' ? ['even', mode === 'ret' ? 'Nothing to give back' : 'Even swap', 0, 'Nobody pays anything', 'equal']
      : m === 'Cut from due' ? ['due', `Taken off ${custName}’s due`, amt, rest ? `Only ${money(cut)} was due · give ${money(rest)} back in cash` : `No cash goes out · ${money(due - cut)} still due`, 'wallet']
        : m === 'Store credit' ? ['due', 'Kept as store credit', amt, `${custName} can spend it on a later purchase`, 'wallet']
          : ['out', `${mode === 'ret' ? 'Give back to customer' : 'You give back'} (${m})`, amt, `Paid from ${(accountBy(accountForMethod(m, true)) || { name: m }).name}`, 'hand-coins'];

  // return window
  const ageDays = sel ? Math.floor((Date.now() - sel.at) / DAY) : 0;
  const outside = !!sel && Date.now() - sel.at > returnDays * DAY;

  const setPick = (id, n) => { const o = { ...picks }; if (n) o[id] = n; else delete o[id]; setPicks(o); };

  const confirm = () => {
    if (!sel) { toast('Find the sale first.', { tone: 'error' }); return; }
    if (!pcs) { toast('Tick the items coming back first.', { tone: 'error' }); return; }
    if (mode === 'exch' && !newAvail) { toast(`${newP.name} is out of stock at ${sel.place}. Pick another item.`, { tone: 'error' }); return; }
    if (outside && !approvedBy) { setPinOpen(true); return; }
    doSave(approvedBy);
  };

  const doSave = (approver) => {
    const now = Date.now();
    const exch = mode === 'exch';
    const qtyMap = Object.fromEntries(back.map((l) => [l.id, picks[l.id]]));
    const items = back.map((l) => `${l.name} × ${picks[l.id]}`).join(', ');
    const given = exch ? `${newP.name} × ${qtyNew}` : '';
    const moneyKind = dir === 'in' ? 'collected' : dir === 'even' ? 'even' : m === 'Store credit' || m === 'Cut from due' ? 'credited' : 'refunded';
    const stockPlace = resell ? sel.place : DAMAGED_PLACE;
    // money that really moves goes to the ledger: refunds out of cash / bKash / Nagad / card, and the
    // extra an exchange collects; "Cut from due" and store credit move no money (only the cash rest does)
    const kindWord = exch ? 'Exchange' : 'Return';
    const posts = [];
    const post = (method, amount, kind) => {
      const account = accountForMethod(method, true);
      if (!account || !amount) return;
      const e = postEntry({ account, amount, kind, ref: sel.ref, party: custName, note: `${kindWord} on ${sel.label}`, by: staff });
      if (e) posts.push(e);
    };
    if (dir === 'in') post(m, amt, 'sale');
    else if (dir === 'out' && PAY_METHODS.includes(m)) post(m, -amt, 'refund');
    else if (dir === 'out' && m === 'Cut from due' && rest) post('Cash', -rest, 'refund');
    const row = addReturn({
      at: now, channel: sel.channel, ref: sel.ref, source: sel.kind, customer: custName, phone,
      items: items + (exch ? ` → ${given}` : ''), returned: qtyMap, type: exch ? 'exchange' : 'return',
      amount: amt, credit, money: moneyKind, method: m, cut, stock: resell ? 'restock' : 'damaged', reason: reasonLabel,
      place: stockPlace, by: staff, approvedBy: approver || '',
      account: posts.length ? posts[0].account : '', ledger: posts.map((e) => e.id),
    });

    // mark the quantities on the sale itself so they cannot come back twice, and take money off the due
    if (sel.kind === 'pos') {
      const base = { type: exch ? 'exchange' : 'return', reason: reasonLabel, at: now, items, rt: row.id, ...(exch ? { given: [`${qtyNew} × ${newP.name}`] } : {}) };
      const entries = dir === 'in' ? [{ ...base, amount: 0, collected: amt, method: m }]
        : cut && rest ? [{ ...base, amount: cut, method: 'Cut from due' }, { ...base, amount: rest, method: 'Cash' }]
          : [{ ...base, amount: dir === 'out' ? amt : 0, method: m }];
      let paidOff = false;
      const next = load(POS_KEYS.sales, []).map((x) => {
        if (x.id !== sel.id) return x;
        const had = x.returned || {};
        const returned = { ...had };
        Object.entries(qtyMap).forEach(([id, n]) => { returned[id] = (had[id] || 0) + n; });
        const newDue = Math.max(0, r2((x.due || 0) - cut));
        paidOff = cut > 0 && newDue === 0;
        return { ...x, returned, refunds: [...(x.refunds || []), ...entries], due: newDue };
      });
      save(POS_KEYS.sales, next);
      if (paidOff && sel.orderId) updateOrder(sel.orderId, { payment: 'Paid' });
    } else if (sel.kind === 'invoice') {
      const inv = getInvoices().find((x) => x.id === sel.id && x.src !== 'pos');
      if (inv) {
        const returned = { ...(inv.returned || {}) };
        Object.entries(qtyMap).forEach(([id, n]) => { returned[id] = (returned[id] || 0) + n; });
        saveInvoice({ ...inv, returned, due: Math.max(0, r2(inv.due - cut)) });
      }
    }
    // online orders and memos count their returns from the history row saved above

    // stock
    const noRecord = [];
    // wholesale goods that were only held (never handed over) are still on the shelf: taking them
    // back just ends the hold for those pieces, whatever their condition decides next
    if (sel.kind === 'invoice') {
      const invNow = getInvoices().find((x) => x.id === sel.id);
      if (invNow && !stockOutAtSale(invNow)) {
        const sent = sentOf(invNow);
        back.forEach((l) => {
          let notLeft = Math.max(0, picks[l.id] - (sent[l.id] || 0));
          if (!notLeft) return;
          holdsFor(sel.ref).filter((h) => h.product === l.name).forEach((h) => {
            if (!notLeft) return;
            const take = Math.min(notLeft, h.qty);
            closeHold(h.id, 'released', 'Returned before delivery');
            if (h.qty > take) addHolds({ type: h.type, ref: h.ref, who: h.who, place: h.place, note: h.note, by: staff }, [{ name: h.product, qty: h.qty - take }]);
            notLeft -= take;
          });
          if (resell) picks[l.id] = Math.min(picks[l.id], sent[l.id] || 0);   // only delivered pieces come back onto the shelf
        });
      }
    }
    if (resell) {
      back.forEach((l) => { const p = productBy(l.name); if (p) addMove({ sku: p.sku, place: sel.place, qty: picks[l.id], kind: 'return', reason: reasonLabel, by: staff, ref: sel.ref }); else noRecord.push(l.name); });
    } else {
      addHolds({ type: 'damaged', ref: sel.ref, who: custName, place: DAMAGED_PLACE, note: `${reasonLabel} · returned on ${sel.label}`, by: staff }, back.map((l) => ({ name: l.name, qty: picks[l.id] })));
    }
    if (exch) addMove({ sku: newP.sku, place: sel.place, qty: -qtyNew, kind: 'exchange', reason: 'Given in exchange', by: staff, ref: sel.ref });

    const moneyText = (dir === 'in' ? `${money(amt)} collected by ${m}` : dir === 'even' ? 'Even swap, nothing paid'
      : m === 'Cut from due' ? `${money(cut)} taken off the due${rest ? ` · ${money(rest)} given back in cash` : ''}`
        : m === 'Store credit' ? `${money(amt)} kept as store credit` : `${money(amt)} given back by ${m}`)
      + (posts.length ? ` · ${posts.map((e) => (accountBy(e.account) || {}).name).join(', ')} updated` : '');
    const stockText = (resell ? `Back on sale at ${sel.place}` : `Moved to ${DAMAGED_PLACE}, not for sale`)
      + (noRecord.length ? ` · no stock record for ${noRecord.join(', ')}` : '')
      + (exch ? ` · ${given} taken from ${sel.place}` : '');
    setSaved({ id: row.id, exch, label: sel.label, items, given, moneyText, stockText, approver: approver || '', by: staff, at: now });
    setPinOpen(false);
    reload();
    toast(`${exch ? 'Exchange' : 'Return'} ${row.id} saved · ${moneyText}.${slip ? ' Return slip sent to the printer.' : ''}`);
  };

  const newReturn = () => { setSaved(null); setSelKey(''); setQ(''); setPicks({}); setApprovedBy(''); setMethod(''); setMode('ret'); setNewSku(''); setNewQty(1); setNq(''); };

  // today, from the history
  const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
  const todays = hist.filter((r) => r.at >= dayStart.getTime());
  const refundedToday = todays.reduce((a, r) => a + (r.money === 'refunded' || r.money === 'credited' ? r.amount || 0 : 0), 0);
  const lock = !!saved;

  return (
    <div className="dc-screen ds" data-screen="ReturnExchange">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="sales-return" />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb="Sales" page="Return & exchange" />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <PageHeader
              title="Return & exchange"
              description="Counter sales, wholesale invoices and online orders. Find the sale, tick what is coming back; money and stock are updated for you."
              actions={<>
                <Link href="/return-history" className="gc-btn gc-btn--neutral"><Icon name="history" width="18" height="18" aria-hidden="true" /> Return history</Link>
                <Link href="/sales-book" className="gc-btn gc-btn--neutral"><Icon name="book-open" width="18" height="18" aria-hidden="true" /> Sales book</Link>
              </>}
            />

            <div className="gc-kpis gc-kpis--tight">
              <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-warning-soft)', color: 'var(--text-warning)' }}><Icon name="undo-2" width="20" height="20" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Returns today</p><p className="gc-kpi__value">{todays.filter((r) => r.type === 'return').length}</p></div></div>
              <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-error-soft)', color: 'var(--text-danger)' }}><Icon name="hand-coins" width="20" height="20" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Given back today</p><p className="gc-kpi__value">{money(refundedToday)}</p></div></div>
              <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-primary-soft)', color: 'var(--primary)' }}><Icon name="arrow-left-right" width="20" height="20" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Exchanges today</p><p className="gc-kpi__value">{todays.filter((r) => r.type === 'exchange').length}</p></div></div>
              <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-info-soft)', color: 'var(--text-info)' }}><Icon name="calendar-clock" width="20" height="20" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Return window</p><p className="gc-kpi__value">{returnDays} days<small>Older sales need a manager</small></p></div></div>
            </div>

            <div className="re-grid">
              <div className="re-col">
                {/* step 1 */}
                <section className="gc-card re-card">
                  <div className="re-head"><span className="re-step">1</span><h2>Find the sale</h2></div>
                  <form className="re-find" onSubmit={find}>
                    <label className="re-search"><Icon name="search" width="18" height="18" aria-hidden="true" /><input className="gc-input" value={q} disabled={lock} onChange={(e) => { setQ(e.target.value); if (sel) setSelKey(''); }} placeholder="Memo, invoice or mobile" aria-label="Memo, invoice or order number, or customer’s mobile number" /></label>
                    <button type="submit" className="gc-btn gc-btn--solid" disabled={lock}><Icon name="search" width="18" height="18" aria-hidden="true" /> Find</button>
                  </form>
                  {sel ? (
                    <>
                      <div className="re-memo" role="status">
                        <span className="re-memo__ico" aria-hidden="true"><Icon name={sel.channel === 'Online' ? 'package' : sel.kind === 'invoice' ? 'file-text' : 'receipt-text'} width="18" height="18" /></span>
                        <div className="re-memo__main">
                          <span className="re-strong">{sel.label} · {custName}</span>
                          <span className="re-sub">{formatDate(sel.at)}, {formatTime(sel.at)} · {sel.lines.length} {sel.lines.length === 1 ? 'line' : 'lines'}{sel.cashier ? ' · sold by ' + sel.cashier : ''}{phone ? ' · ' + prettyPhone(phone) : ''} · {sel.place}</span>
                        </div>
                        <span className={'gc-badge gc-badge--' + CHANNEL_TONE[sel.channel]}>{sel.channel}</span>
                        <span className={'gc-badge gc-badge--' + (due > 0 ? 'warning' : 'success')}>{due > 0 ? `${money(due)} due` : 'Paid'}</span>
                        <span className="re-memo__total">{money(sel.totals.total)}</span>
                        {!lock ? <button type="button" className="gc-btn gc-btn--neutral gc-btn--sm" onClick={() => setSelKey('')}>Change</button> : null}
                      </div>
                      {outside ? (
                        approvedBy
                          ? <div className="re-note re-note--ok" role="status"><Icon name="shield-check" width="16" height="16" aria-hidden="true" />Outside the {returnDays}-day return window · approved by {approvedBy}</div>
                          : <div className="re-note re-note--warn" role="status"><Icon name="clock-alert" width="16" height="16" aria-hidden="true" />Outside the {returnDays}-day return window (sold {ageDays} days ago). A manager must approve before you confirm.</div>
                      ) : null}
                      {!sel.open && !lock ? <div className="re-note re-note--warn" role="status"><Icon name="circle-slash" width="16" height="16" aria-hidden="true" />Everything on this sale has already come back.</div> : null}
                    </>
                  ) : !ready ? null : (
                    <div className="re-results">
                      <span className="re-cap">{text ? (matches.length ? `${matches.length} ${matches.length === 1 ? 'sale' : 'sales'} found` : 'Nothing found') : 'Recent sales'}</span>
                      {matches.map((s) => (
                        <button key={s.key} type="button" className="re-res" onClick={() => choose(s)} aria-label={`Open ${s.label}, ${s.customer.name || 'Walk-in customer'}`}>
                          <span className="re-res__id">{s.label}</span>
                          <span className="re-res__who">{s.customer.name || 'Walk-in customer'}{s.customer.phone ? <small>{prettyPhone(s.customer.phone)}</small> : null}</span>
                          <span className="re-res__when">{formatDate(s.at)}</span>
                          <span className="re-res__total">{money(s.totals.total)}</span>
                          <span className={'gc-badge gc-badge--' + CHANNEL_TONE[s.channel]}>{s.channel}</span>
                        </button>
                      ))}
                      {text && !matches.length ? <div className="re-note re-note--warn" role="status"><Icon name="search-x" width="16" height="16" aria-hidden="true" />No sale matches that. Check the memo, invoice or order number, or the customer’s mobile number.</div> : null}
                    </div>
                  )}
                </section>

                {/* step 2 */}
                <section className="gc-card re-card">
                  <div className="re-head"><span className={'re-step' + (sel ? '' : ' is-off')}>2</span><h2>What is coming back?</h2><p>Tick the items, then set how many</p></div>
                  {!sel ? <EmptyState icon="receipt-text" title="Find the sale first" body="The items on the memo, invoice or order appear here." /> : (
                    <fieldset className="re-lock" disabled={lock}>
                      <legend className="sr-only">Items and how they are settled</legend>
                      <ul className="re-items">
                        {sel.lines.map((l) => {
                          const n = picks[l.id] || 0;
                          return (
                            <li key={l.id} className={'re-item' + (n ? ' is-on' : '') + (l.left ? '' : ' is-done')}>
                              <label>
                                <input type="checkbox" className="gc-check" disabled={!l.left} checked={n > 0} onChange={() => setPick(l.id, n ? 0 : 1)} />
                                <span><span className="re-strong">{l.name}</span><span className="re-sub">Sold {l.qty} · {money(l.each)} paid each{l.done ? ` · ${l.done} already returned` : ''}</span></span>
                              </label>
                              {!l.left ? <span className="gc-badge gc-badge--slate">Returned</span> : n ? (
                                <span className="re-stepper">
                                  <button type="button" aria-label={`One less ${l.name}`} disabled={n <= 1} onClick={() => setPick(l.id, n - 1)}><Icon name="minus" width="16" height="16" /></button>
                                  <b aria-label={`${n} coming back`}>{n}</b>
                                  <button type="button" aria-label={`One more ${l.name}`} disabled={n >= l.left} onClick={() => setPick(l.id, n + 1)}><Icon name="plus" width="16" height="16" /></button>
                                </span>
                              ) : null}
                              <span className={'re-item__val' + (n ? '' : ' is-off')}>{n ? money(l.each * n) : l.left ? `${l.left} can come back` : 'Nothing left'}</span>
                            </li>
                          );
                        })}
                      </ul>

                      <div className="re-block">
                        <span className="re-cap">Why is it coming back?</span>
                        <div className="re-row" role="group" aria-label="Reason">
                          {REASONS.map(([id, label, icon]) => <button key={id} type="button" className={'re-chip' + (reason === id ? ' is-on' : '')} aria-pressed={reason === id} onClick={() => { setReason(id); setResellPick(null); }}><Icon name={icon} width="14" height="14" aria-hidden="true" />{label}</button>)}
                        </div>
                      </div>

                      <div className="re-block">
                        <span className="re-cap">What will you do?</span>
                        <div className="re-seg" role="group" aria-label="Return or exchange">
                          <button type="button" aria-pressed={mode === 'ret'} className={mode === 'ret' ? 'is-on' : ''} onClick={() => setMode('ret')}><Icon name="undo-2" width="16" height="16" aria-hidden="true" />Return (refund)</button>
                          <button type="button" aria-pressed={mode === 'exch'} className={mode === 'exch' ? 'is-on' : ''} onClick={() => setMode('exch')}><Icon name="arrow-left-right" width="16" height="16" aria-hidden="true" />Exchange (other item)</button>
                        </div>
                      </div>

                      {mode === 'exch' ? (
                        <div className="re-block">
                          <label className="re-search"><Icon name="search" width="18" height="18" aria-hidden="true" /><input className="gc-input" style={{ fontFamily: 'inherit' }} value={nq} onChange={(e) => setNq(e.target.value)} placeholder="Search the item the customer takes instead" aria-label="Search the item the customer takes instead" /></label>
                          <div className="re-cands">
                            {cands.map((p) => {
                              const av = availOf(p);
                              return (
                                <button key={p.sku} type="button" className={'re-cand' + (p.sku === newP.sku ? ' is-on' : '')} aria-pressed={p.sku === newP.sku} disabled={!av} onClick={() => { setNewSku(p.sku); setNewQty(1); }}>
                                  <span><span>{p.name}</span><small>{av ? `${av} at ${sel.place}` : `Out of stock at ${sel.place}`}</small></span>
                                  <span className="re-cand__price">{money(unitOf(p))}</span>
                                </button>
                              );
                            })}
                          </div>
                          <div className="re-row">
                            <span className="re-sub">Taking: <b style={{ color: 'var(--text-heading)', fontWeight: 'var(--weight-medium)' }}>{newP.name}</b>{sel.vat ? ' · price includes VAT' : ''}</span>
                            <span className="re-stepper">
                              <button type="button" aria-label="One less of the new item" disabled={qtyNew <= 1} onClick={() => setNewQty(qtyNew - 1)}><Icon name="minus" width="16" height="16" /></button>
                              <b aria-label={`${qtyNew} of the new item`}>{qtyNew}</b>
                              <button type="button" aria-label="One more of the new item" disabled={qtyNew >= newAvail} onClick={() => setNewQty(qtyNew + 1)}><Icon name="plus" width="16" height="16" /></button>
                            </span>
                          </div>
                        </div>
                      ) : null}

                      {dir !== 'even' ? (
                        <div className="re-block">
                          <div className="re-row" role="group" aria-label={dir === 'in' ? 'Customer pays by' : 'Refund by'}>
                            <span className="re-sub">{dir === 'in' ? 'Customer pays by:' : 'Refund by:'}</span>
                            {methods.map((id) => {
                              const off = id === 'Store credit' && !phone;
                              return <button key={id} type="button" className={'re-chip' + (m === id ? ' is-on' : '')} aria-pressed={m === id} disabled={off} title={off ? 'Store credit needs the customer’s mobile number' : undefined} onClick={() => setMethod(id)}>{id === 'Cut from due' ? `Cut from due (${money(due)})` : id}</button>;
                            })}
                          </div>
                          {m === 'Store credit' ? <p className="gc-help" style={{ margin: 0 }}>{sel && sel.byWallet ? 'The sale was paid from the customer’s wallet, so it goes back to the wallet. ' : ''}{custName} has {money(credits)} store credit now; this adds {money(amt)}.</p> : null}
                          {!phone && dir === 'out' ? <p className="gc-help" style={{ margin: 0 }}>Store credit needs the customer’s mobile number on the sale.</p> : null}
                        </div>
                      ) : null}

                      <div className="re-resell">
                        <div>
                          <span className="re-strong">Can the returned item be sold again?</span>
                          <span className="re-sub" style={{ color: resell ? 'var(--text-success)' : 'var(--text-danger)' }}>{resell ? `It goes back on sale at ${sel.place}` : `It goes to “${DAMAGED_PLACE}”, not back on sale`}</span>
                          <span className="re-sub">{resellPick == null ? `Suggested for “${reasonLabel}”. Change it if needed.` : `You chose ${resell ? 'Yes' : 'No'}.`}</span>
                        </div>
                        <div className="re-seg re-seg--sm" role="group" aria-label="Can it be sold again">
                          <button type="button" aria-pressed={resell} className={resell ? 'is-on' : ''} onClick={() => setResellPick(true)}>Yes</button>
                          <button type="button" aria-pressed={!resell} className={resell ? '' : 'is-on'} onClick={() => setResellPick(false)}>No</button>
                        </div>
                      </div>
                    </fieldset>
                  )}
                </section>
              </div>

              <aside className="re-col">
                {saved ? (
                  <section className="gc-card re-card" role="status" aria-live="polite">
                    <div className="re-head"><span className="re-done__ico" aria-hidden="true"><Icon name="check" width="18" height="18" /></span><h2>{saved.exch ? 'Exchange saved' : 'Return saved'}</h2><p>{formatTime(saved.at)}</p></div>
                    <dl className="re-facts">
                      <dt>Return no.</dt><dd style={{ fontFamily: 'var(--font-data)' }}>{saved.id}</dd>
                      <dt>Sale</dt><dd>{saved.label}</dd>
                      <dt>Came back</dt><dd>{saved.items}</dd>
                      {saved.exch ? <><dt>Given instead</dt><dd>{saved.given}</dd></> : null}
                      <dt>Money</dt><dd>{saved.moneyText}</dd>
                      <dt>Stock</dt><dd>{saved.stockText}</dd>
                      <dt>Taken back by</dt><dd>{saved.by}</dd>
                      {saved.approver ? <><dt>Approved by</dt><dd>{saved.approver}</dd></> : null}
                    </dl>
                    <div className="re-actions">
                      <button type="button" className="gc-btn gc-btn--neutral" onClick={() => toast(`Return slip ${saved.id} sent to the printer`)}><Icon name="printer" width="18" height="18" aria-hidden="true" /> Print return slip</button>
                      <button type="button" className="gc-btn gc-btn--solid" onClick={newReturn}><Icon name="plus" width="18" height="18" aria-hidden="true" /> New return</button>
                    </div>
                  </section>
                ) : sel ? (
                  <section className="gc-card re-card">
                    <div className="re-head"><h2>Summary</h2><p>{sel.label}</p></div>
                    <dl className="re-sum">
                      <dt>Items coming back</dt><dd>{pcs} {pcs === 1 ? 'piece' : 'pieces'}</dd>
                      <dt>Credit for them (paid price{sel.vat ? ', VAT incl.' : ''})</dt><dd>{money(credit)}</dd>
                      {mode === 'exch' ? <><dt>New item · {newP.name} × {qtyNew}</dt><dd>{money(newVal)}</dd></> : null}
                    </dl>
                    <div className={'re-big re-big--' + big[0]} role="status">
                      <span className="re-big__ico" aria-hidden="true"><Icon name={big[4]} width="20" height="20" /></span>
                      <div><span>{big[1]}</span><b>{money(big[2])}</b><span style={{ fontWeight: 'var(--weight-regular)' }}>{big[3]}</span></div>
                    </div>
                    <div className={'re-note ' + (resell ? 're-note--ok' : 're-note--warn')}><Icon name={resell ? 'package-check' : 'package-x'} width="16" height="16" aria-hidden="true" />{pcs ? back.map((l) => `${l.name} × ${picks[l.id]}`).join(', ') + (resell ? ` — back on sale at ${sel.place}` : ` — goes to ${DAMAGED_PLACE}`) : 'No item ticked yet'}</div>
                    {mode === 'exch' ? <div className="re-note re-note--info"><Icon name="package-minus" width="16" height="16" aria-hidden="true" />{newP.name} × {qtyNew} will leave stock at {sel.place}</div> : null}
                    <div>
                      <label className="gc-label" htmlFor="re-by">Taken back by</label>
                      <select id="re-by" className="gc-input gc-select" value={staff} onChange={(e) => setBy(e.target.value)}>{EMPLOYEES.map((e) => <option key={e.name} value={e.name}>{e.name} · {e.branch}</option>)}</select>
                    </div>
                    <div className="re-switch"><span>Print a return slip</span><button type="button" role="switch" aria-checked={slip} aria-label="Print a return slip" className="gc-switch" onClick={() => setSlip(!slip)}><span className="gc-switch__knob" /></button></div>
                    <button type="button" className="gc-btn gc-btn--solid gc-btn--lg gc-btn--block" onClick={confirm} disabled={!sel.open}>
                      <Icon name={outside && !approvedBy ? 'shield-check' : 'check'} width="18" height="18" aria-hidden="true" /> {outside && !approvedBy ? 'Get manager approval' : mode === 'ret' ? 'Confirm return' : 'Confirm exchange'}
                    </button>
                  </section>
                ) : null}
              </aside>
            </div>
          </div>
        </main>
      </div>
      <ManagerPin
        open={pinOpen}
        reason={sel ? `${sel.label} was sold ${ageDays} days ago, outside the ${returnDays}-day return window. A manager must approve this ${mode === 'ret' ? 'return' : 'exchange'}.` : ''}
        onApprove={(name) => { setApprovedBy(name); doSave(name); }}
        onClose={() => setPinOpen(false)}
      />
    </div>
  );
}
