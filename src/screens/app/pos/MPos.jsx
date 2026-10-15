'use client';
// Merchant app · POS register (/m-pos) — the counter on a phone, for the editions with the POS (Retail, Retail + Online,
// Connect; the Online edition has none). The same books and rules as the web register (screens/pos-register/Pos.jsx):
//   shift      one shift per counter and drawer (posStore: claimCounter / counterBusy / releaseCounter). Opening: counter,
//              cashier, float from the shop safe or the last shift; a different count needs a reason, and above the POS
//              limit a manager's PIN (postCashMove, postVariance). Closing: expected cash from shiftReport, counted, note;
//              a difference above the limit or unsynced sales need a PIN; the shift is saved (saveShifts).
//   selling    Active products only (sellable.isStatusSellable) with what is available at the counter's place
//              (stock.stockAt, less sales queued offline); search, category chips, scan (camera / typed; identifiers
//              resolveScan; /m-scan?for=pos hands back too). A tracked product asks for its IMEI / serial
//              (serials.checkSerial; quick picks from serialsAt). Stock past zero only where the place allows it.
//   cart       quantities, the customer's mobile and name, a discount (amount or %, up to the POS settings' cap);
//              VAT per category (vat.vatRateFor), as on the web.
//   checkout   Cash (change), Card (the counter's terminal), bKash / Nagad (account from hardware.payAccounts and the
//              transaction ID, used once: paymentRefs.claimRef), Due (creditRules.checkDue: off unless Credit & dues
//              allows it; over the limit a manager approves), split into parts. One operation id per checkout, so a
//              double tap makes one sale. posSale.commitSale posts the order, stock, money, serials and the customer;
//              offline (cash only) the sale waits in the queue (queueSale) like the web register.
//   receipt    the sale, its change or due, Send receipt by SMS (receipts.sendReceipt, each send logged), New sale.
// The cart is kept in sessionStorage so going to Scan and back keeps it.

import React, { useEffect, useMemo, useState } from 'react';
import { AppScreen, Content, AppBar, ActionBar, Button, IconButton, Field, TextInput, Stepper, Segmented, Chips, Sheet, SearchField, ListRow, Note, Pill, EmptyState, Skeleton, Icon, useAppData, money, toast, confirmDialog } from '../kit/AppKit';
import { POS_KEYS as KEYS, load, save, getCounters, getCash, saveCash, getShifts, saveShifts, getSettings, shiftReport, nextId, postCashMove, postVariance, claimCounter, counterBusy, releaseCounter, limitsFor } from '@/lib/posStore';
import { commitSale, queueSale, newOpId, saleForOp, getQueue, queuedQty, nextSaleNo } from '@/lib/posSale';
import { trackingOf, checkSerial, serialsAt } from '@/lib/serials';
import { payAccounts, devicesAt } from '@/lib/hardware';
import { getCatalog, stockAt, allowNegative } from '@/lib/stock';
import { isStatusSellable } from '@/lib/sellable';
import { getStockPlaces, placeName } from '@/lib/locations';
import { loadVat, billVat } from '@/lib/vat';
import { getCustomers, findCustomer, phoneDigits } from '@/lib/customers';
import { dueForPhone } from '@/lib/invoices';
import { getCreditRules, limitFor, dueDateFor, checkDue, DEFAULT_CREDIT_RULES } from '@/lib/creditRules';
import { freezeLine } from '@/lib/productCost';
import { claimRef, refMessage } from '@/lib/paymentRefs';
import { sendReceipt, receiptsSent } from '@/lib/receipts';
import { checkOrder } from '@/lib/restrictions';
import { resolveScan } from '@/lib/identifiers';
import { Thumb, ScanSheet, PinSheet, Select } from '../stock/Scanner';
import { takeScan, SCAN_EVENT } from '../stock/scanReturn';
import { allowed, safe, plural } from '../stock/stockData';

const CART = 'gc.app.pos.cart';
const CREDIT = 'Due / credit';
const METHODS = [['Cash', 'Cash'], ['Card', 'Card'], ['bKash', 'bKash'], ['Nagad', 'Nagad'], [CREDIT, 'Due']];
const WALLETS = ['bKash', 'Nagad', 'Rocket'];
const r2 = (n) => Math.round(n * 100) / 100;
const num = (v) => Math.max(0, Number(v) || 0);
const m2 = (n) => money(n);

/** The web register's totals, without coupons and member points (the phone register has neither). */
function totalsOf(lines, discount, vat) {
  const gross = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const lineDisc = lines.reduce((s, l) => s + Math.min(l.price * l.qty, l.disc || 0), 0);
  let left = gross - lineDisc;
  const cartDisc = !discount ? 0 : Math.min(left, discount.type === 'percent' ? Math.round((left * discount.value) / 100) : discount.value);
  left -= cartDisc;
  const base = gross - lineDisc;
  const share = base ? left / base : 0;
  // VAT inside the shelf price (MRP, the default) or added on top, as on the web register (lib/vat)
  const { tax, included } = billVat(lines, share, vat);
  return { gross: r2(gross), lineDisc, cartDisc, couponDisc: 0, promo: null, memberDisc: 0, pointsUsed: 0, pointsDisc: 0, taxable: r2(included ? left - tax : left), tax, vatIncluded: included, total: r2(included ? left : left + tax), units: lines.reduce((s, l) => s + l.qty, 0) };
}
const readCart = () => { try { return JSON.parse(window.sessionStorage.getItem(CART)) || null; } catch { return null; } };
const writeCart = (c) => { try { window.sessionStorage.setItem(CART, JSON.stringify(c)); } catch { /* ignore */ } };

export default function MPos() {
  const { ready, tick, ctx } = useAppData([SCAN_EVENT, 'online', 'offline']);
  const [shift, setShift] = useState(null);
  const [counters, setCounters] = useState([]);
  const [cfg, setCfg] = useState(null);
  const [vat, setVat] = useState(null);
  const [rules, setRules] = useState(DEFAULT_CREDIT_RULES);
  const [openForm, setOpenForm] = useState({ counter: '', cashier: '', float: '', from: 'Shop safe', reason: '' });
  const [place, setPlace] = useState('');
  const [stockTick, setStockTick] = useState(0);
  // the sale
  const [lines, setLines] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [discount, setDiscount] = useState(null);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  // sheets
  const [sheet, setSheet] = useState('');       // '' | cart | pay | receipt | shift | close
  const [scan, setScan] = useState(false);
  const [serialFor, setSerialFor] = useState(null);
  const [snText, setSnText] = useState('');
  const [pin, setPin] = useState(null);         // { kind: 'open' | 'close' | 'credit', reason, amount }
  // checkout
  const [opId, setOpId] = useState('');
  const [parts, setParts] = useState([]);       // [{ method, amount, account, terminal, via, txn }]
  const [tender, setTender] = useState({ method: 'Cash', amount: '', acct: '', txn: '' });
  const [receipt, setReceipt] = useState(null);
  const [sendTo, setSendTo] = useState('');
  const [sentTick, setSentTick] = useState(0);
  // closing
  const [counted, setCounted] = useState('');
  const [closeNote, setCloseNote] = useState('');

  const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
  const canPos = !ctx || allowed('/m-pos', ctx);

  useEffect(() => {
    if (!ready) return;
    const list = safe(() => getCounters().filter((c) => c.active), []);
    const set = safe(() => getSettings(), {});
    setCounters(list); setCfg(set); setVat(safe(() => loadVat(), null)); setRules(safe(() => getCreditRules(), DEFAULT_CREDIT_RULES));
    const open = load(KEYS.shift, null);
    setShift(open);
    if (open) { const c = list.find((x) => x.name === open.counter); if (c) safe(() => claimCounter(c, open), null); }
    const first = list.find((c) => !safe(() => counterBusy(c), null)) || list[0];
    if (first) setOpenForm({ counter: first.name, cashier: first.staff[0] || '', float: String(first.float ?? set.float ?? 0), from: 'Shop safe', reason: '' });
    const cart = readCart();
    if (cart) { setLines(cart.lines || []); setCustomer(cart.customer || { name: '', phone: '' }); setDiscount(cart.discount || null); }
  }, [ready]);

  const counterRow = shift ? counters.find((c) => c.name === shift.counter) || { id: shift.counterId, name: shift.counter } : null;
  useEffect(() => {
    if (!ready) return;
    const live = safe(() => getStockPlaces(), []);
    const want = counterRow && counterRow.stock ? placeName(counterRow.stock) : '';
    setPlace(want && live.includes(want) ? want : live[0] || '');
  }, [ready, shift, counters]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (ready) writeCart({ lines, customer, discount }); }, [ready, lines, customer, discount]);

  const products = useMemo(() => (ready ? safe(() => getCatalog().filter(isStatusSellable), []).map((c) => ({ sku: c.sku, name: c.name, meta: c.variant || '', cat: c.cat, price: c.price, code: c.barcode || c.sku, row: c, track: safe(() => trackingOf(c.sku), '') })) : []), [ready]);
  const stock = useMemo(() => {
    if (!ready || !place) return {};
    const sold = safe(() => queuedQty(place), {});
    return Object.fromEntries(products.map((p) => { const s = safe(() => stockAt(p.sku, place), { available: 0 }); return [p.sku, sold[p.sku] ? Math.max(0, s.available - sold[p.sku]) : s.available]; }));
  }, [ready, products, place, stockTick, tick]);
  const negOk = useMemo(() => ready && place && safe(() => allowNegative(place), false), [ready, place]);
  const cats = useMemo(() => [...new Set(products.map((p) => p.cat).filter(Boolean))], [products]);
  const k = q.trim().toLowerCase();
  const shown = products.filter((p) => (!cat || p.cat === cat) && (!k || (p.name + ' ' + p.code + ' ' + p.sku + ' ' + p.meta).toLowerCase().includes(k)));

  // ---- cart ----
  const add = (p, serial) => {
    const avail = stock[p.sku] ?? 0;
    const have = (lines.find((l) => l.sku === p.sku) || {}).qty || 0;
    if (avail < 9999 && have + 1 > avail && !negOk) { toast(!avail ? `${p.name} is out of stock at ${place}` : `Only ${avail} of ${p.name} at ${place}`, { tone: 'error' }); return; }
    if (p.track && !serial) { setSnText(''); setSerialFor(p); return; }
    setLines((cur) => {
      const inCart = cur.find((l) => l.sku === p.sku);
      const serials = serial ? [...((inCart && inCart.serials) || []), serial] : inCart && inCart.serials;
      const patch = { qty: (inCart ? inCart.qty : 0) + 1, stock: avail, ...(serials ? { serials } : {}) };
      if (!inCart) return [...cur, { id: p.sku, sku: p.sku, name: p.name, meta: p.meta, cat: p.cat, price: p.price, basePrice: p.price, disc: 0, ...(p.track ? { track: p.track } : {}), ...patch }];
      return cur.map((l) => (l.sku === p.sku ? { ...l, ...patch } : l));
    });
    toast(`${p.name} added`);
  };
  const setQty = (sku, n) => {
    const line = lines.find((l) => l.sku === sku);
    if (!line) return;
    if (line.track && n > line.qty) { const p = products.find((x) => x.sku === sku); if (p) add(p); return; }
    if (n > line.stock && !negOk) { toast(`Only ${line.stock} of ${line.name} at ${place}`, { tone: 'error' }); return; }
    setLines((cur) => cur.flatMap((l) => (l.sku !== sku ? [l] : n <= 0 ? [] : [{ ...l, qty: n, ...(l.serials ? { serials: l.serials.slice(0, n) } : {}) }])));
  };
  const onCode = (code) => {
    const hit = safe(() => resolveScan(code), null);
    const p = hit ? products.find((x) => x.sku === hit.sku) : null;
    if (!p) { toast(hit ? `${hit.row ? hit.row.name : hit.sku} is not for sale` : `No product for “${code}”`, { tone: 'error' }); return; }
    if (p.track && hit.serial) { const r = checkSerial(hit.serial, { sku: p.sku, kind: p.track, place, taken: lines.flatMap((l) => l.serials || []) }); if (r.ok) add(p, r.serial); else toast(r.error, { tone: 'error' }); return; }
    add(p);
  };
  useEffect(() => { if (!ready || !products.length || !shift) return; const s = takeScan('pos'); if (s) onCode(s.serial || s.code || s.sku); }, [ready, products, shift, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const takeSerial = (raw) => {
    const p = serialFor;
    const r = checkSerial(raw, { sku: p.sku, kind: p.track, place, taken: lines.flatMap((l) => l.serials || []) });
    if (!r.ok) { toast(r.error, { tone: 'error' }); return; }
    if (r.warn) toast(r.warn, { tone: 'info' });
    setSerialFor(null); add(p, r.serial);
  };
  const clearSale = () => { setLines([]); setCustomer({ name: '', phone: '' }); setDiscount(null); setParts([]); setTender({ method: 'Cash', amount: '', acct: '', txn: '' }); };

  const t = totalsOf(lines, discount, vat);
  const units = t.units;
  const setDisc = (patch) => {
    const next = { type: 'amount', value: 0, ...(discount || {}), ...patch };
    // the cashier's own limit (POS management › Settings › POS limits); more needs the web register's approval
    const capPct = shift && shift.cashier ? safe(() => limitsFor(shift.cashier).discount, 0) : 0;
    const cap = next.type === 'percent' ? capPct : Math.floor((t.gross - t.lineDisc) * capPct / 100);
    if (next.value > cap) { next.value = cap; toast(`${(shift && shift.cashier) || 'You'} can give up to ${capPct}% discount`, { tone: 'error' }); }
    setDiscount(next.value > 0 ? next : { ...next, value: 0 });
  };

  // ---- checkout ----
  const phone = phoneDigits(customer.phone);
  const book = useMemo(() => (ready ? safe(() => getCustomers(), []) : []), [ready, tick]);
  const buyer = useMemo(() => (phone ? findCustomer(book, phone) : null), [book, phone]);
  const owedBefore = useMemo(() => (buyer ? safe(() => dueForPhone(buyer.phone), 0) : 0), [buyer, tick]);
  const devices = useMemo(() => (ready && counterRow ? safe(() => devicesAt(counterRow), []) : []), [ready, counterRow && counterRow.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const acctOptions = counterRow ? safe(() => payAccounts(tender.method, counterRow, devices), []) : [];
  const acct = acctOptions.find((o) => o.id === tender.acct) || acctOptions.find((o) => !o.down) || acctOptions[0] || null;
  const paid = parts.reduce((s, x) => s + x.amount, 0);
  const due = Math.max(0, r2(t.total - paid));
  const pending = due ? (tender.amount === '' ? due : num(tender.amount)) : 0;
  const stillDue = Math.max(0, r2(due - pending));
  const change = Math.max(0, r2(paid + pending - t.total));
  const partOf = (method, amount, a, txn) => ({ method, amount, ...(a ? { account: a.account, ...(a.terminal ? { terminal: a.terminal } : {}), via: a.label } : {}), ...(txn ? { txn } : {}) });
  const partsNow = pending ? [...parts, partOf(tender.method, pending, acct, tender.txn.trim())] : parts;
  const owedNow = r2(partsNow.filter((x) => x.method === CREDIT).reduce((s, x) => s + x.amount, 0));
  const creditLimit = limitFor(buyer, rules);
  const creditOver = creditLimit > 0 && owedNow > 0 && r2(owedBefore + owedNow) > creditLimit;
  const missingSerial = lines.find((l) => l.track && (l.serials || []).length < l.qty);

  const startPay = () => {
    if (!lines.length) return;
    if (missingSerial) { toast(`Scan the ${missingSerial.track === 'imei' ? 'IMEI' : 'serial number'} of ${missingSerial.name}`, { tone: 'error' }); return; }
    setParts([]); setTender({ method: 'Cash', amount: '', acct: '', txn: '' }); setOpId(newOpId(shift.counterId)); setSheet('pay');
  };
  const pickMethod = (m) => {
    if (offline && m !== 'Cash') { toast('Offline: only cash can be taken right now', { tone: 'error' }); return; }
    if (m === CREDIT && !rules.allowRetailDue) { toast('Selling on due is off. Turn it on in Settings › Customers › Credit & dues.', { tone: 'error' }); return; }
    if (m === CREDIT && cfg && cfg.requireFull) { toast('Turn off “Require full payment” in POS settings to leave money on the customer’s account', { tone: 'error' }); return; }
    if (m === 'Card' && !safe(() => payAccounts('Card', counterRow, devices), []).some((o) => !o.down)) { toast('No card terminal is connected at this counter', { tone: 'error' }); return; }
    setTender({ method: m, amount: '', acct: '', txn: '' });
  };
  const partOk = () => {
    if (!pending) return false;
    if (tender.method !== 'Cash' && pending > due) { toast(`${tender.method === CREDIT ? 'Due' : tender.method} cannot be more than the ${m2(due)} still due`, { tone: 'error' }); return false; }
    if (acct && acct.down) { toast(`${acct.label} is not connected`, { tone: 'error' }); return false; }
    if (WALLETS.includes(tender.method)) {
      const txn = tender.txn.trim();
      if (!txn) { toast(`Type the ${tender.method} transaction ID`, { tone: 'error' }); return false; }
      const used = refMessage(txn);
      if (used || parts.some((x) => x.txn && x.txn.toUpperCase() === txn.toUpperCase())) { toast(`This transaction ID is ${used ? used.toLowerCase() : 'already in this sale'}`, { tone: 'error' }); return false; }
    }
    return true;
  };
  const addPart = () => { if (!partOk()) return; setParts([...parts, partOf(tender.method, pending, acct, tender.txn.trim())]); setTender({ method: tender.method === 'Cash' ? 'Card' : 'Cash', amount: '', acct: '', txn: '' }); };

  const complete = (approver) => {
    const before = saleForOp(opId);
    if (before && before.totals) { toast(`Already completed · ${before.id}`, { tone: 'info' }); setReceipt(before); setSheet('receipt'); return; }
    if (!lines.length) return;
    if (pending && !partOk()) return;
    if (stillDue) { toast(`${m2(stillDue)} is still to pay`, { tone: 'error' }); return; }
    const list = partsNow;
    if (!list.length) return;
    if (phone) {
      const rc = safe(() => checkOrder(customer.phone, { amount: t.total, payment: list.some((x) => x.method === CREDIT) ? 'credit' : (list[0] || {}).method }), { ok: true });
      if (!rc.ok) { toast(rc.blocks[0], { tone: 'error' }); return; }
    }
    const dueCheck = checkDue({ phone: customer.phone, customer: buyer, owedNow, owedBefore, wholesale: false }, rules);
    if (!dueCheck.ok) { toast(dueCheck.reason, { tone: 'error' }); return; }
    const creditBy = typeof approver === 'string' ? approver : '';
    if (creditOver && !creditBy) { setPin({ kind: 'credit', reason: `${buyer ? buyer.name : 'The customer'} would owe ${m2(r2(owedBefore + owedNow))}, over the ${m2(creditLimit)} credit limit. A manager approves leaving ${m2(owedNow)} unpaid.`, amount: owedNow }); return; }
    const sales = load(KEYS.sales, []);
    const orderNo = nextSaleNo(counterRow, Date.now(), [...sales, ...getQueue()]);   // one number per sale, as on the web register
    const who = { name: customer.name.trim() || (buyer ? buyer.name : ''), phone: customer.phone.trim() };
    const sale = { id: orderNo, opId, wholesale: false, tier: '', atRetail: false, invoice: !!(who.name || who.phone), rev: 1, payments: [], at: Date.now(), lines: lines.map(freezeLine), customer: who, member: null, earned: 0, totals: t, coupon: '', tenders: list, change, due: owedNow, creditBy, printed: false, cashier: shift.cashier, salesperson: shift.cashier, counter: shift.counter, counterId: shift.counterId, place, offline, returned: {}, stockOut: true, deliveries: [] };
    if (owedNow > 0) sale.dueAt = dueDateFor(sale.at, rules);
    const res = offline ? queueSale(sale) : commitSale(sale);
    if (res.already) { toast(`Already completed · ${res.sale.id}`, { tone: 'info' }); setReceipt(res.sale); setSheet('receipt'); return; }
    list.forEach((x) => { if (x.txn) safe(() => claimRef(x.txn, res.sale.id, { by: shift.cashier, what: 'POS sale' }), null); });
    setPin(null); setReceipt(res.sale); setSendTo(who.phone || ''); setSheet('receipt'); clearSale(); setStockTick((n) => n + 1);
    toast(offline ? `Saved offline · ${res.sale.id} posts when you are back online` : `Sale ${res.sale.id} complete`);
  };
  const sendRcpt = () => {
    const r = sendReceipt(receipt, { via: 'sms', to: sendTo.trim(), by: receipt.cashier });
    setSentTick((n) => n + 1);
    toast(r.ok ? `Receipt sent to ${sendTo.trim()}` : `Not sent: ${r.reason || r.status}`, r.ok ? undefined : { tone: 'error' });
  };
  const sent = useMemo(() => (receipt ? safe(() => receiptsSent(receipt.id), []) : []), [receipt, sentTick]);

  // ---- shift (the web register's logic) ----
  const lastShift = (name) => safe(() => getShifts().find((x) => x.counter === name), null);
  const planned = (f) => { const c = counters.find((x) => x.name === f.counter); const last = lastShift(f.counter); return f.from === 'Last shift' && last ? last.counted : c ? c.float ?? (cfg ? cfg.float : 0) : cfg ? cfg.float : 0; };
  const pickCounter = (name) => { const c = counters.find((x) => x.name === name); const f = { counter: name, cashier: c ? c.staff[0] || '' : '', from: 'Shop safe', reason: '' }; setOpenForm({ ...f, float: String(planned(f)) }); };
  const openShift = (approver) => {
    const at = counters.find((c) => c.name === openForm.counter);
    if (!at || !openForm.cashier) { toast('Choose the counter and who works it', { tone: 'error' }); return; }
    const busy = counterBusy(at);
    if (busy) { toast(`${at.name} is open on ${busy.deviceName} by ${busy.cashier}. End that shift first.`, { tone: 'error' }); return; }
    const plan = planned(openForm), count0 = num(openForm.float), diff = r2(count0 - plan), why = openForm.reason.trim();
    if (diff && !why) { toast('Say why the drawer is different', { tone: 'error' }); return; }
    const by = typeof approver === 'string' ? approver : '';
    if (Math.abs(diff) > cfg.varianceLimit && !by) { setPin({ kind: 'open', amount: Math.abs(diff), reason: `Opening cash is ${diff > 0 ? 'over' : 'short'} by ${m2(Math.abs(diff))}, above the ${m2(cfg.varianceLimit)} limit. ${why}` }); return; }
    const next = { counter: at.name, counterId: at.id, cashier: openForm.cashier, float: count0, openedAt: Date.now(), floatFrom: openForm.from, floatPlanned: plan, ...(diff ? { openDiff: diff, openReason: why, openBy: by } : {}) };
    const claim = claimCounter(at, next);
    if (!claim.ok) { toast(`${at.name} is open on ${claim.by.deviceName} by ${claim.by.cashier}`, { tone: 'error' }); return; }
    setPin(null); setShift(next); save(KEYS.shift, next);
    const all = getCash();
    const float = { id: nextId('CM', all), type: 'float', counter: at.name, amount: plan, by: next.cashier, to: openForm.from, note: '', cashier: next.cashier, at: next.openedAt, shiftAt: next.openedAt };
    const moves = [float, ...all];
    postCashMove(float);
    if (diff) {
      const d = { id: nextId('CM', moves), type: 'opendiff', counter: at.name, amount: Math.abs(diff), diff, by: by || next.cashier, to: '', note: `${diff > 0 ? 'Over' : 'Short'} · ${why}`, cashier: next.cashier, at: next.openedAt, shiftAt: next.openedAt };
      moves.unshift(d);
      postVariance(diff, { when: 'opening', shiftRef: d.id, counter: at.name, cashier: next.cashier, approvedBy: by, reason: why });
    }
    saveCash(moves);
    toast(`${at.name} opened by ${next.cashier} with ${m2(count0)} in the drawer`);
  };
  const rep = useMemo(() => (shift && ready ? safe(() => shiftReport(shift, [...load(KEYS.sales, []), ...getQueue()], getCash()), null) : null), [shift, ready, stockTick, sheet]);
  const waiting = useMemo(() => (ready ? safe(() => getQueue().filter((s) => s.syncState === 'queued' || s.syncState === 'review'), []) : []), [ready, stockTick, sheet]);
  const closeShift = (approver) => {
    if (counted === '' || !rep) { toast('Count the cash in the drawer', { tone: 'error' }); return; }
    const diff = r2(num(counted) - rep.expected);
    const by = typeof approver === 'string' ? approver : '';
    const over = Math.abs(diff) > cfg.varianceLimit;
    if ((over || waiting.length) && !by) {
      setPin({ kind: 'close', amount: Math.abs(diff), reason: [over && `Cash ${diff > 0 ? 'over' : 'short'} by ${m2(Math.abs(diff))}, above the ${m2(cfg.varianceLimit)} limit.`, waiting.length && `${plural(waiting.length, 'sale')} not synced.`].filter(Boolean).join(' ') });
      return;
    }
    const { moves, ...numbers } = rep;
    const byAccount = rep.byAccount.map((a) => (a.account === 'drawer' ? { ...a, label: 'Cash · drawer', counted: num(counted), diff } : { ...a, label: a.method, counted: a.expected, diff: 0 }));
    const all = getShifts();
    const record = { id: nextId('SH', all), ...shift, closedAt: Date.now(), ...numbers, byAccount, counted: num(counted), diff, note: closeNote.trim(), ...(by ? { approvedBy: by } : {}), ...(waiting.length ? { unsynced: waiting.length } : {}) };
    saveShifts([record, ...all]);
    if (diff) postVariance(diff, { when: 'closing', shiftRef: record.id, counter: shift.counter, cashier: shift.cashier, approvedBy: over ? by : '', reason: closeNote.trim() });
    releaseCounter(shift.counterId);
    setPin(null); setShift(null); save(KEYS.shift, null); setSheet(''); setCounted(''); setCloseNote(''); clearSale();
    toast(`Shift ${record.id} closed · ${m2(rep.sold)} in ${plural(rep.count, 'sale')} · cash ${diff === 0 ? 'matches' : (diff > 0 ? 'over by ' : 'short by ') + m2(Math.abs(diff))}`);
  };
  const leaveSale = async () => { if (!lines.length) return; if (await confirmDialog({ title: 'Clear this sale?', body: `${plural(units, 'item')} will be removed from the cart.`, confirmLabel: 'Clear', tone: 'danger' })) { clearSale(); setSheet(''); } };

  // ---- screens ----
  if (ready && !canPos) {
    return (
      <AppScreen name="MPos" title="POS register">
        <AppBar title="POS register" back="/m-more" />
        <Content top={103}><div className="card" style={{ margin: '4px 20px 0' }}><EmptyState icon="cart" title="The register is not part of this plan" action={{ label: 'Home', href: '/m-home' }} /></div></Content>
      </AppScreen>
    );
  }
  if (!ready || !cfg) {
    return (
      <AppScreen name="MPos" title="POS register"><AppBar title="POS register" back="/m-more" /><Content top={103}><Skeleton rows={4} /></Content></AppScreen>
    );
  }
  if (!shift) {
    const c = counters.find((x) => x.name === openForm.counter);
    const plan = planned(openForm), diff = r2(num(openForm.float) - plan);
    const last = lastShift(openForm.counter);
    return (
      <AppScreen name="MPos" title="Open shift">
        <AppBar title="Open shift" back="/m-more" />
        <Content top={103} bottom={98} style={{ padding: '2px 20px 0' }} gap={16}>
          <Note tone="info" icon="cart">Open a shift to start selling. The drawer is counted at the start and the end.</Note>
          {counters.length ? (
            <>
              <Field label="Counter"><Select value={openForm.counter} onChange={pickCounter} options={counters.map((x) => { const b = safe(() => counterBusy(x), null); return [x.name, x.name + (b ? ` · open on ${b.deviceName}` : '')]; })} label="Counter" /></Field>
              <Field label="Who works it"><Select value={openForm.cashier} onChange={(v) => setOpenForm((f) => ({ ...f, cashier: v }))} options={(c ? c.staff : []).length ? c.staff : ['']} label="Cashier" /></Field>
              <div className="field"><span className="lab">Float comes from</span><Segmented items={[{ key: 'Shop safe', label: 'Shop safe' }, ...(last ? [{ key: 'Last shift', label: 'Last shift' }] : [])]} value={openForm.from} onChange={(v) => { const f = { ...openForm, from: v }; setOpenForm({ ...f, float: String(planned(f)) }); }} style={{ margin: 0 }} /></div>
              <Field label="Cash in the drawer" help={`Expected ${m2(plan)}`}><TextInput value={openForm.float} onChange={(v) => setOpenForm((f) => ({ ...f, float: v.replace(/[^\d.]/g, '') }))} prefix="৳" inputMode="decimal" /></Field>
              {diff ? <Field label={`Why is it ${diff > 0 ? 'over' : 'short'} by ${m2(Math.abs(diff))}?`}><TextInput value={openForm.reason} onChange={(v) => setOpenForm((f) => ({ ...f, reason: v }))} placeholder="e.g. Change taken for the bank" /></Field> : null}
            </>
          ) : <div className="card"><EmptyState icon="cart" title="No counter is set up" action={{ label: 'POS counters on the web', href: '/pos-manage' }} /></div>}
        </Content>
        <ActionBar><Button onClick={() => openShift()} disabled={!counters.length}>Open shift</Button></ActionBar>
        <PinSheet open={!!pin} onClose={() => setPin(null)} reason={pin ? pin.reason : ''} action="Opening difference" amount={pin ? pin.amount : undefined} by={openForm.cashier} onApprove={(m) => openShift(m)} />
      </AppScreen>
    );
  }

  const sel = serialFor;
  const quick = sel ? safe(() => serialsAt(sel.sku, place), []).filter((u) => !lines.some((l) => (l.serials || []).includes(u.serial))).slice(0, 6) : [];
  return (
    <AppScreen name="MPos" title="POS register">
      <AppBar title={shift.counter} back="/m-more" actions={<IconButton icon="dots" label="Shift" onClick={() => setSheet('shift')} />} />
      <Content top={103} bottom={98}>
        {offline ? <Note tone="warn" icon="alert" style={{ margin: '2px 20px 12px' }}>Offline: cash only. Sales post when you are back online.</Note> : null}
        <SearchField value={q} onChange={setQ} placeholder="Name, SKU or barcode" onScan={() => setScan(true)} style={{ marginTop: '2px' }} />
        <Chips items={[{ key: '', label: 'All' }, ...cats.map((c) => ({ key: c, label: c }))]} value={cat} onChange={setCat} style={{ marginTop: '14px', overflowX: 'auto' }} />
        <div className="card" style={{ margin: '14px 20px 0' }}>
          {shown.slice(0, 60).map((p) => {
            const a = stock[p.sku] ?? 0, inCart = (lines.find((l) => l.sku === p.sku) || {}).qty || 0;
            const out = a < 9999 && a - inCart <= 0 && !negOk;
            return (
              <button key={p.sku} type="button" className="row" onClick={() => add(p)} style={{ opacity: out ? 0.55 : 1 }}>
                <Thumb row={p.row} size={44} />
                <span className="m">
                  <span className="t ell" style={{ display: 'block', fontWeight: 'var(--weight-medium)' }}>{p.name}</span>
                  <span className="s ell" style={{ display: 'block', color: out ? 'var(--err)' : undefined }}>{a >= 9999 ? 'Not counted' : out ? 'Out here' : `${a - inCart} here`}{p.track ? ` · ${p.track === 'imei' ? 'IMEI' : 'serial'}` : ''}</span>
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{m2(p.price)}</span>
                  {inCart ? <Pill tone="nav">{inCart} in cart</Pill> : null}
                </span>
              </button>
            );
          })}
          {!shown.length ? <EmptyState icon="search" title={q ? `Nothing matches “${q}”` : 'No products for sale'} /> : null}
        </div>
        <div style={{ height: '8px' }} />
      </Content>
      <ActionBar>
        <Button kind="line" icon="cart" onClick={() => setSheet('cart')}>{units ? units : 'Cart'}</Button>
        <Button onClick={startPay} disabled={!lines.length} style={{ flex: 2 }}>{lines.length ? `Charge ${m2(t.total)}` : 'Add items'}</Button>
      </ActionBar>

      <Sheet open={sheet === 'cart'} onClose={() => setSheet('')} title={`Cart · ${plural(units, 'item')}`} footer={<><Button kind="line" onClick={leaveSale} disabled={!lines.length}>Clear</Button><Button onClick={startPay} disabled={!lines.length} style={{ flex: 2 }}>Charge {m2(t.total)}</Button></>}>
        {lines.length ? (
          <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
            {lines.map((l) => (
              <div key={l.sku} className="row" style={{ minHeight: '60px' }}>
                <span className="m">
                  <span className="t ell" style={{ display: 'block', fontWeight: 'var(--weight-medium)' }}>{l.name}</span>
                  <span className="s ell" style={{ display: 'block' }}>{m2(l.price)} each{l.serials && l.serials.length ? ' · ' + l.serials.map((s) => '…' + s.slice(-4)).join(', ') : ''}</span>
                </span>
                <Stepper value={l.qty} min={0} label={'Quantity of ' + l.name} onChange={(n) => setQty(l.sku, n)} />
              </div>
            ))}
          </div>
        ) : <EmptyState icon="cart" title="The cart is empty" />}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '14px' }}>
          <Field label="Mobile"><TextInput value={customer.phone} onChange={(v) => setCustomer((c) => ({ ...c, phone: v }))} placeholder="01XXXXXXXXX" type="tel" inputMode="tel" /></Field>
          <Field label="Name"><TextInput value={customer.name} onChange={(v) => setCustomer((c) => ({ ...c, name: v }))} placeholder={buyer ? buyer.name : 'Walk-in'} /></Field>
        </div>
        {buyer ? <div className="help" style={{ marginTop: '6px' }}>{buyer.name}{owedBefore ? ` · owes ${m2(owedBefore)}` : ''}</div> : null}
        <div className="field" style={{ marginTop: '14px' }}>
          <span className="lab">Discount</span>
          <span style={{ display: 'flex', gap: '8px' }}>
            <Segmented items={[{ key: 'amount', label: '৳' }, { key: 'percent', label: '%' }]} value={(discount && discount.type) || 'amount'} onChange={(k2) => setDisc({ type: k2, value: 0 })} style={{ margin: 0, width: '108px', flex: 'none' }} />
            <span style={{ flex: 1 }}><TextInput value={discount && discount.value ? String(discount.value) : ''} onChange={(v) => setDisc({ value: num(v.replace(/[^\d.]/g, '')) })} placeholder="0" inputMode="decimal" /></span>
          </span>
        </div>
        <div style={{ marginTop: '14px', padding: '12px 14px', borderRadius: 'var(--radius-xl)', background: 'var(--bg)', fontSize: 'var(--text-sm)' }}>
          {[['Subtotal', t.gross], t.cartDisc ? ['Discount', -t.cartDisc] : null, t.tax ? [t.vatIncluded ? 'VAT included' : 'VAT', t.tax] : null].filter(Boolean).map(([k2, v]) => <div key={k2} style={{ display: 'flex', justifyContent: 'space-between' }}><span>{k2}</span><span className="num">{m2(v)}</span></div>)}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'var(--weight-semibold)', marginTop: '4px' }}><span>Total</span><span className="num">{m2(t.total)}</span></div>
        </div>
      </Sheet>

      <Sheet open={sheet === 'pay'} onClose={() => setSheet('')} title="Payment" footer={<><Button kind="line" onClick={() => setSheet('cart')}>Back</Button><Button onClick={() => complete()} disabled={!!stillDue} style={{ flex: 2 }}>{stillDue ? `${m2(stillDue)} to go` : 'Complete sale'}</Button></>}>
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <div className="k">{paid ? 'Still to pay' : 'Total'}</div>
          <div className="num" style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-tight)' }}>{m2(paid ? due : t.total)}</div>
          {paid ? <div className="help">of {m2(t.total)}</div> : null}
        </div>
        {parts.length ? (
          <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)', marginBottom: '14px' }}>
            {parts.map((x, i) => <ListRow key={i} compact title={x.method === CREDIT ? 'Due' : x.method} sub={[x.via, x.txn].filter(Boolean).join(' · ')} end={<span className="num" style={{ fontWeight: 'var(--weight-medium)' }}>{m2(x.amount)}</span>} onClick={() => setParts(parts.filter((_, j) => j !== i))} chevron={false} />)}
          </div>
        ) : null}
        <Chips items={METHODS.map(([key, label]) => ({ key, label }))} value={tender.method} onChange={pickMethod} style={{ padding: 0, overflowX: 'auto' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
          <Field label={tender.method === 'Cash' ? 'Cash received' : 'Amount'} help={tender.method === 'Cash' && change ? `Change ${m2(change)}` : pending < due ? `${m2(stillDue)} left for another payment` : ''}>
            <TextInput value={tender.amount} onChange={(v) => setTender((x) => ({ ...x, amount: v.replace(/[^\d.]/g, '') }))} prefix="৳" inputMode="decimal" placeholder={String(due)} />
          </Field>
          {acctOptions.length > 1 ? <Chips items={acctOptions.map((o) => ({ key: o.id, label: o.label + (o.down ? ' · off' : '') }))} value={acct ? acct.id : ''} onChange={(id) => setTender((x) => ({ ...x, acct: id }))} style={{ padding: 0, overflowX: 'auto' }} /> : null}
          {WALLETS.includes(tender.method) ? <Field label={`${tender.method} transaction ID`} help="Each ID is used once"><TextInput value={tender.txn} onChange={(v) => setTender((x) => ({ ...x, txn: v.toUpperCase() }))} placeholder="e.g. 9GH3K2LQ1P" /></Field> : null}
          {tender.method === CREDIT ? <Note tone={creditOver ? 'warn' : 'info'} icon="receipt">{phone ? `Due in ${rules.dueDays} days${creditLimit ? ` · limit ${m2(creditLimit)}` : ''}${owedBefore ? ` · owes ${m2(owedBefore)} already` : ''}` : 'Add the customer’s mobile in the cart to sell on due.'}</Note> : null}
          {pending && pending < due ? <Button kind="soft" onClick={addPart}>Take {m2(pending)} {tender.method === CREDIT ? 'as due' : 'by ' + tender.method} · then the rest</Button> : null}
        </div>
      </Sheet>

      <Sheet open={sheet === 'receipt' && !!receipt} onClose={() => { setSheet(''); setReceipt(null); }} title="Sale complete" footer={<Button onClick={() => { setSheet(''); setReceipt(null); }}>New sale</Button>}>
        {receipt ? (
          <>
            <div style={{ textAlign: 'center' }}>
              <span className="ico" style={{ width: '56px', height: '56px', margin: '0 auto', background: 'var(--okbg)', color: 'var(--ok)', borderRadius: 'var(--radius-full)' }}><Icon name="check" size={28} stroke={2.4} /></span>
              <div className="num" style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-semibold)', marginTop: '10px' }}>{m2(receipt.totals.total)}</div>
              <div className="mono help">{receipt.id}{receipt.offline ? ' · waiting to sync' : ''}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginTop: '16px', padding: '14px', borderRadius: 'var(--radius-xl)', background: 'var(--bg)' }}>
              <div><div className="k">Paid</div><div className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{m2(receipt.totals.total - (receipt.due || 0))}</div></div>
              <div><div className="k">Change</div><div className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{m2(receipt.change || 0)}</div></div>
              <div><div className="k">Due</div><div className="num" style={{ fontWeight: 'var(--weight-semibold)', color: receipt.due ? 'var(--err)' : undefined }}>{m2(receipt.due || 0)}</div></div>
            </div>
            <div className="field" style={{ marginTop: '16px' }}>
              <span className="lab">Send receipt by SMS</span>
              <span style={{ display: 'flex', gap: '8px' }}><span style={{ flex: 1 }}><TextInput value={sendTo} onChange={setSendTo} placeholder="01XXXXXXXXX" type="tel" inputMode="tel" /></span><Button kind="soft" onClick={sendRcpt}>Send</Button></span>
              {sent.length ? <span className="help">{sent.map((x) => `${x.ok ? 'Sent' : 'Not sent'} to ${x.to}`).join(' · ')}</span> : null}
            </div>
          </>
        ) : null}
      </Sheet>

      <Sheet open={sheet === 'shift'} onClose={() => setSheet('')} title={shift.counter} footer={<Button kind="danger" onClick={() => { setCounted(''); setCloseNote(''); setSheet('close'); }}>End shift</Button>}>
        <div className="help" style={{ marginTop: '-8px', marginBottom: '12px' }}>{shift.cashier} · opened {new Date(shift.openedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · {place}</div>
        {rep ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', padding: '14px', borderRadius: 'var(--radius-xl)', background: 'var(--bg)' }}>
            <div><div className="k">Sales</div><div className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{rep.count}</div></div>
            <div><div className="k">Sold</div><div className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{m2(rep.sold)}</div></div>
            <div><div className="k">Cash now</div><div className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{m2(rep.expected)}</div></div>
          </div>
        ) : null}
        {waiting.length ? <Note tone="warn" icon="alert" style={{ marginTop: '12px' }}>{plural(waiting.length, 'sale')} waiting to sync.</Note> : null}
        <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)', marginTop: '14px' }}>
          <ListRow href="/pos?panel=cash" icon="cash" title="Cash pickups and paid out" sub="On the register" />
          <ListRow href="/m-return?back=/m-pos" icon="undo" title="Return or exchange" sub="Find the sale, refund or swap" />
        </div>
      </Sheet>

      <Sheet open={sheet === 'close'} onClose={() => setSheet('shift')} title="End shift" footer={<><Button kind="line" onClick={() => setSheet('shift')}>Back</Button><Button onClick={() => closeShift()} style={{ flex: 2 }}>Close shift</Button></>}>
        {rep ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-xl)', background: 'var(--bg)', fontSize: 'var(--text-sm)' }}>
              {[['Opening float', shift.float], ...Object.entries(rep.byMethod).map(([mth, v]) => [mth === CREDIT ? 'Due' : mth, v]), rep.pickups ? ['Cash pickups', -rep.pickups] : null, rep.paidOut ? ['Paid out', -rep.paidOut] : null].filter(Boolean).map(([k2, v]) => <div key={k2} style={{ display: 'flex', justifyContent: 'space-between' }}><span>{k2}</span><span className="num">{m2(v)}</span></div>)}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'var(--weight-semibold)', marginTop: '4px' }}><span>Cash expected</span><span className="num">{m2(rep.expected)}</span></div>
            </div>
            <Field label="Cash counted" help={counted !== '' ? (r2(num(counted) - rep.expected) === 0 ? 'Matches' : `${num(counted) > rep.expected ? 'Over' : 'Short'} by ${m2(Math.abs(r2(num(counted) - rep.expected)))}`) : ''}><TextInput value={counted} onChange={(v) => setCounted(v.replace(/[^\d.]/g, ''))} prefix="৳" inputMode="decimal" /></Field>
            <Field label="Note"><TextInput value={closeNote} onChange={setCloseNote} placeholder="Optional" /></Field>
          </div>
        ) : null}
      </Sheet>

      <Sheet open={!!sel} onClose={() => setSerialFor(null)} title={sel ? `${sel.track === 'imei' ? 'IMEI' : 'Serial number'} · ${sel.name}` : ''} footer={<Button onClick={() => takeSerial(snText)} disabled={!snText.trim()}>Add</Button>}>
        {sel ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ display: 'flex', gap: '8px' }}><span style={{ flex: 1 }}><TextInput value={snText} onChange={setSnText} placeholder={sel.track === 'imei' ? '15 digits' : 'Serial number'} inputMode={sel.track === 'imei' ? 'numeric' : 'text'} autoFocus /></span><IconButton icon="scan" label="Scan the number" soft onClick={() => setScan(true)} /></span>
            {quick.length ? <><span className="lab">In stock here</span><div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{quick.map((u) => <button key={u.serial} type="button" className="chip mono" onClick={() => takeSerial(u.serial)}>{u.serial}</button>)}</div></> : null}
          </div>
        ) : null}
      </Sheet>
      <ScanSheet open={scan} onClose={() => setScan(false)} onCode={(c) => { if (sel) { setScan(false); takeSerial(c); } else onCode(c); }} title={sel ? 'Scan the number' : 'Scan to sell'} />
      <PinSheet open={!!pin} onClose={() => setPin(null)} reason={pin ? pin.reason : ''} action={pin && pin.kind === 'credit' ? 'Credit limit' : pin && pin.kind === 'close' ? 'Cash variance' : 'Manager approval'} amount={pin ? pin.amount : undefined} by={shift.cashier}
        onApprove={(m) => (pin.kind === 'credit' ? complete(m) : closeShift(m))} />
    </AppScreen>
  );
}
