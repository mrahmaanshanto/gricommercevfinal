'use client';
// Merchant app · Order (/m-order-detail?id=<order no>). The design board's layout (design/templates/app/
// MOrderDetail.dc.html: step dots, customer card with Call / WhatsApp, items with totals, Cancel + main action at the
// bottom) with what an order manager does on the web order page (src/screens/order-detail/OrderDetail.jsx), through
// the same lib calls:
//   steps        "Step n of n" over the board's dots (lib/orderStatus.js › ORDER_STEPS; digital orders skip packing
//                and the courier)
//   next step    New: verify by auto call (orderFlow.startAutoCall, answered by settleAutoCall) or a logged call
//                (recordCall), then Approve (orders.approveOrder, once) / Take advance + approve (requestAdvance,
//                receiveAdvance) / Cancel with a reason (orders.cancelOrder).
//                Approved: the packing checklist (prepOf / updatePrep, Print slip, markReady); digital: Mark as sent
//                (sendDigital). Ready for courier: Send to courier (sendToCourier; a second press returns the parcel
//                already booked). Sent to courier: courier updates (courierWebhook: out for delivery, delivered,
//                failed, return) and the tracking (trackingOf). Returned: receive the parcel on the web
//                (/courier-returns, a full flow).
//   customer     Call, WhatsApp, SMS; the customer's page (/m-customer)
//   items        photos (orderFlow.setLinePhoto, shrunk to 480 px), totals, payment; counter sales show Sold by, each
//                item's IMEI / serial (customerWarranty.serialsOfLine) and warranty (warranty.coverOf)
//   notes        Order note and Internal note, saved when the field is left (orders.patchOrder + logOrder)
//   activity     orders.logOf, Add a comment
//   more         Resend receipt (receipts.sendReceipt), Print invoice (SaleInvoice), Return or exchange (the web flow
//                /return-exchange?ref=), Open on the web, Cancel order
// Payment proofs, Edit order, holds by hand, sub-status and tags stay on the web page (linked).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AppScreen, AppBar, Content, ActionBar, Sheet, Section, Card, ListRow, Chips, Segmented, Pill, OrderPill, Avatar,
  IconButton, Button, Field, TextInput, Switch, Note, EmptyState, Skeleton, Icon, useAppData, useQuery, money, dateText,
  timeText, initials, toast, confirmDialog, refresh,
} from './kit/AppKit';
import { canUse } from './kit/appNav';
import { ORDER_STEPS, STEP_LABEL, orderStatus, isNewOrder } from '@/lib/orderStatus';
import {
  getOrders, findOrder, duplicatesOf, availability, approveOrder, cancelOrder, mergeInto, logOrder, logOf, patchOrder,
  isCounterSale, holdsOfOrder, holdPlaceOf, rtoState, CAN_CANCEL,
} from '@/lib/orders';
import {
  verifyOf, startAutoCall, settleAutoCall, recordCall, CALL_RESULTS, callResultLabel, requestAdvance, receiveAdvance,
  ADVANCE_METHODS, COURIERS, courierCharge, prepOf, prepDone, updatePrep, markReady, sendToCourier, trackingOf,
  courierWebhook, syncCourier, HOOK_LABEL, setLinePhoto, isDigitalOrder, sendDigital,
} from '@/lib/orderFlow';
import { courierHistory } from '@/lib/orderLinks';
import { holdsStock } from '@/lib/edition';
import { getStockPlaces } from '@/lib/locations';
import { clockNow } from '@/lib/settlements';
import { completionOf } from '@/lib/orderRules';
import { proofToReview, methodLabel } from '@/lib/paymentProof';
import { sendReceipt, receiptsSent } from '@/lib/receipts';
import { SaleInvoice, invoiceFromOrder, printInvoice } from '@/components/SaleInvoice';
import { QrCode } from '@/components/QrCode';
import { printNode } from '@/lib/printNode';
import { MERCHANT } from '@/lib/merchant';
import { coverOf } from '@/lib/warranty';
import { allProducts } from '@/lib/products';
import { productOfLine, saleOfOrder, serialsOfLine, coverStart } from '@/lib/customerWarranty';
import { payPill, digitsOf, plural, byName, shrinkPhoto } from './orders/orderData';

const CANCEL_REASONS = ['Customer cancelled', 'No answer', 'Fake order', 'Out of stock', 'Duplicate order', 'Other'];
const SHORT = { new: 'Placed', verified: 'Verified', approved: 'Approved', ready: 'Packed', shipped: 'Shipped', delivered: 'Delivered' };
const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };

const CSS = `
[data-screen="MOrderDetail"] .chips{overflow-x:auto;scrollbar-width:none;padding:0;flex-wrap:wrap}
[data-screen="MOrderDetail"] .line{display:flex;align-items:center;gap:10px;font-size:var(--text-sm);color:var(--body);line-height:20px}
[data-screen="MOrderDetail"] .line b{color:var(--ink);font-weight:var(--weight-medium)}
[data-screen="MOrderDetail"] .sum{display:flex;justify-content:space-between;gap:12px;color:var(--body)}
[data-screen="MOrderDetail"] .thumb{flex:none;width:40px;height:40px;padding:0;border:0;border-radius:var(--radius-xl);overflow:hidden;cursor:pointer;display:flex;align-items:center;justify-content:center;font-weight:var(--weight-semibold);background:#fff4e0;color:#003087}
[data-screen="MOrderDetail"] .thumb img{width:100%;height:100%;object-fit:cover}
[data-screen="MOrderDetail"] .kv{display:flex;justify-content:space-between;gap:12px;padding:10px 16px;font-size:var(--text-sm)}
[data-screen="MOrderDetail"] .kv + .kv{border-top:1px solid var(--line)}
[data-screen="MOrderDetail"] .kv span:first-child{color:var(--muted)}
[data-screen="MOrderDetail"] .kv span:last-child{text-align:right;color:var(--ink);min-width:0;overflow-wrap:anywhere}
[data-screen="MOrderDetail"] .tl{position:relative;display:flex;gap:12px;padding:0 0 14px}
[data-screen="MOrderDetail"] .tl:last-child{padding-bottom:0}
[data-screen="MOrderDetail"] .tl::before{content:"";position:absolute;left:5px;top:16px;bottom:0;width:2px;background:var(--line)}
[data-screen="MOrderDetail"] .tl:last-child::before{display:none}
[data-screen="MOrderDetail"] .tl i{flex:none;width:12px;height:12px;margin-top:4px;border-radius:var(--radius-full);background:#cbd5e1}
[data-screen="MOrderDetail"] .tl:first-child i{background:var(--brand);box-shadow:0 0 0 3px rgba(0,48,135,.12)}
[data-screen="MOrderDetail"] .note-in{display:block;width:100%;min-height:64px;padding:10px 14px;border-radius:var(--radius-lg);border:1px solid #dbe2ec;background:var(--card);font:inherit;font-size:var(--text-sm);line-height:20px;color:var(--ink);resize:vertical;outline:0}
[data-screen="MOrderDetail"] .note-in:focus{border-color:var(--brand);box-shadow:0 0 0 3px rgba(0,48,135,.12)}
[data-screen="MOrderDetail"] .slip{position:absolute;left:-10000px;top:0;width:100mm}
`;

/** The board's step dots, with "Step n of n" above them. */
function Steps({ steps, reached, next, status, stopped }) {
  const at = next ? steps.indexOf(next) + 1 : steps.length;
  const label = next ? STEP_LABEL[next] : 'Completed';
  return (
    <div className="card" style={{ margin: '4px 20px 0', padding: '12px 16px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{ flex: '1', minWidth: '0', fontSize: 'var(--text-sm)', color: 'var(--body)' }} className="ell">{stopped ? <b style={{ color: 'var(--ink)', fontWeight: 'var(--weight-semibold)' }}>{stopped}</b> : <>Step {at} of {steps.length} · <b style={{ color: 'var(--ink)', fontWeight: 'var(--weight-semibold)' }}>{label}</b></>}</span>
        {status}
      </div>
      <ol style={{ display: 'flex', margin: '0', padding: '0', listStyle: 'none' }} aria-label="Order progress">
        {steps.map((k, i) => {
          const done = reached[k];
          const cur = k === next;
          const lineOn = reached[k] || cur;
          return (
            <li key={k} style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', position: 'relative', minWidth: '0' }} aria-current={cur ? 'step' : undefined}>
              {i > 0 ? <span style={{ position: 'absolute', top: '11px', right: '50%', width: '100%', height: '2px', background: lineOn ? 'var(--brand)' : '#e2e8f0', zIndex: 0 }} /> : null}
              {done ? (
                <span style={{ position: 'relative', zIndex: 1, width: '24px', height: '24px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand)', color: '#fff' }}><Icon name="check" size={14} stroke={3} /></span>
              ) : (
                <span style={{ position: 'relative', zIndex: 1, width: '24px', height: '24px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '2px solid ' + (cur ? 'var(--brand)' : '#cbd5e1') }}>
                  {cur ? <span style={{ width: '8px', height: '8px', borderRadius: 'var(--radius-full)', background: 'var(--brand)' }} /> : null}
                </span>
              )}
              <span className="ell" style={{ maxWidth: '100%', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', color: done || cur ? 'var(--ink)' : 'var(--muted)' }}>{SHORT[k]}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** A switch row of the packing checklist. */
function CheckRow({ title, sub, on, onChange, end }) {
  return (
    <div className="row" style={{ minHeight: '56px', padding: '9px 16px' }}>
      <span className="m">
        <span className="t" style={{ display: 'block', fontWeight: 'var(--weight-medium)' }}>{title}</span>
        {sub ? <span className="s ell" style={{ display: 'block' }}>{sub}</span> : null}
      </span>
      {end}
      <Switch on={on} onChange={onChange} label={title} />
    </div>
  );
}

export default function MOrderDetailScreen() {
  const { ready, tick, ctx } = useAppData(['gc:notify', 'gc:receipts']);
  const query = useQuery();
  const id = query ? query.get('id') || '' : '';
  const from = query ? query.get('from') || '' : '';
  const back = /^\/m-[a-z-]+(\?|$)/.test(from) ? from : '/m-orders';
  const [sheet, setSheet] = useState(null);   // more · call · approve · advance · cancel · resend · comment · photo
  const [place, setPlace] = useState('');
  const [call, setCall] = useState({ result: 'confirmed', note: '' });
  const [adv, setAdv] = useState({ amount: '', method: 'bkash online' });
  const [cancel, setCancel] = useState(CANCEL_REASONS[0]);
  const [resend, setResend] = useState({ via: 'sms', to: '' });
  const [comment, setComment] = useState('');
  const [photoAt, setPhotoAt] = useState(null);
  const [allLog, setAllLog] = useState(false);
  const invoiceRef = useRef(null);
  const slipRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => { if (ready) safe(() => syncCourier(), 0); }, [ready]);
  const all = useMemo(() => (ready ? safe(() => getOrders(), []) : []), [ready, tick]);
  // a shared or typed link may leave out the order number's '#': #136811 and 136811 open the same order
  const o = useMemo(() => (id ? all.find((x) => x.id === id || x.id === '#' + id.replace(/^#/, '')) || null : null), [all, id]);
  const now = useMemo(() => (ready ? clockNow() : 0), [ready, tick]);
  const v = o ? safe(() => verifyOf(o, now), null) : null;

  useEffect(() => {
    if (!o) return;
    setPlace(safe(() => holdPlaceOf(o.id), 'Central Warehouse'));
    setAdv((a) => ({ ...a, amount: a.amount || String(o.shipping || 200) }));
    setResend({ via: 'sms', to: digitsOf(o.phone).length >= 10 ? o.phone : '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [o && o.id]);

  // an automatic call answers by itself after a few seconds (as on the web page)
  useEffect(() => {
    if (!o || !v || (v.state !== 'calling' && !v.pending)) return undefined;
    const wait = v.pending ? 0 : Math.max(0, 6000 - (clockNow() - v.at)) + 50;
    const t = window.setTimeout(() => {
      const fresh = findOrder(o.id);
      const res = fresh ? settleAutoCall(fresh) : null;
      if (res) toast(res === 'confirmed' ? 'Customer confirmed' : 'Auto call: ' + callResultLabel(res).toLowerCase(), { tone: res === 'confirmed' ? 'success' : 'info' });
      refresh();
    }, wait);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [o && o.id, v && v.state, v && v.at]);

  const places = useMemo(() => (ready ? safe(() => getStockPlaces(), []) : []), [ready]);
  const products = useMemo(() => (ready ? safe(() => allProducts(), []) : []), [ready, tick]);

  if (!ready || !query) {
    return (
      <AppScreen name="MOrderDetail" title="Order" css={CSS}>
        <AppBar title="Order" back={back} />
        <Content top={103}><div style={{ height: '4px' }} /><Skeleton rows={4} /></Content>
      </AppScreen>
    );
  }
  if (!o) {
    return (
      <AppScreen name="MOrderDetail" title="Order not found" css={CSS}>
        <AppBar title="Order" back={back} />
        <Content top={103}><Card><EmptyState icon="search" title={id ? `There is no order ${id}` : 'No order chosen'} action={{ label: 'Back to orders', href: back }} /></Card></Content>
      </AppScreen>
    );
  }

  // ---- the facts ---------------------------------------------------------------------------------------------
  const by = byName();
  const counter = isCounterSale(o) || !!o.isInvoice;
  const isNew = isNewOrder(o.statusKey);
  const offPath = ['cancelled', 'returned'].includes(o.statusKey);
  const digital = !counter && safe(() => isDigitalOrder(o, products), false);
  const steps = digital ? ORDER_STEPS.filter((k) => k !== 'ready' && k !== 'shipped') : ORDER_STEPS;
  const reached = {
    new: true,
    verified: (v && v.state === 'confirmed') || (!isNew && !offPath),
    approved: ['approved', 'ready', 'shipped', 'delivered', 'returned'].includes(o.statusKey),
    ready: ['ready', 'shipped', 'delivered', 'returned'].includes(o.statusKey),
    shipped: ['shipped', 'delivered', 'returned'].includes(o.statusKey),
    delivered: o.statusKey === 'delivered',
  };
  const next = offPath ? null : steps.find((k) => !reached[k]) || null;
  const paid = o.paid || 0;
  const due = o.paid == null ? null : Math.max(0, o.amount - o.paid);
  const cod = o.codAmount != null ? o.codAmount : Math.max(0, o.amount - paid);
  const adj = o.amount - o.subtotal - (o.shipping || 0);
  const prep = safe(() => prepOf(o), { courier: '' });
  const track = safe(() => trackingOf(o, now), []);
  const record = !counter ? safe(() => courierHistory(o.phone), null) : null;
  const risk = !record || record.rate == null || !record.total ? ['New customer', 'grey'] : record.rate >= 80 ? ['Low risk', 'ok'] : record.rate >= 50 ? ['Medium risk', 'warn'] : ['High risk', 'err'];
  const dups = counter ? [] : safe(() => duplicatesOf(o, all), []);
  const samePhone = digitsOf(o.phone).length >= 10 ? all.filter((x) => digitsOf(x.phone) === digitsOf(o.phone)) : [o];
  const completion = safe(() => completionOf(o), { done: false, text: '' });
  const toReview = counter ? null : safe(() => proofToReview(o), null);
  const rto = o.statusKey === 'returned' && !counter ? safe(() => rtoState(o), null) : null;
  const sale = counter ? safe(() => saleOfOrder(o), null) : null;
  const soldBy = (sale && sale.cashier) || o.soldBy || '';
  const wStart = coverStart(o);
  const invDoc = safe(() => invoiceFromOrder(o, sale), null);
  const holds = safe(() => holdsOfOrder(o.id).filter((h) => h.status === 'held'), []);
  const heldAt = [...new Set(holds.map((h) => h.place))].join(', ');
  const log = [...safe(() => logOf(o.id), []), { at: o.at, icon: counter ? 'store' : 'bag', title: counter ? 'Sold at the counter' : 'Order placed', meta: o.channel }];
  const canCancel = !counter && CAN_CANCEL.includes(o.statusKey);
  const phoneOk = digitsOf(o.phone).length >= 10;
  const tel = digitsOf(o.phone);
  const photos = o.photos || {};
  const stock = sheet === 'approve' ? safe(() => availability(o.lines, place), []) : [];
  const advNum = Math.round(Number(adv.amount) || 0);
  const advOk = advNum > 0 && advNum < o.amount - paid;
  const custHref = ctx && canUse('/m-customers', ctx) && phoneOk ? '/m-customer?phone=' + encodeURIComponent(tel) : null;
  const pay = payPill(o);
  const status = orderStatus(o.statusKey);

  // ---- actions (the web order page's, one by one) ---------------------------------------------------------
  const fresh = () => findOrder(o.id) || o;
  const close = () => setSheet(null);
  const autoCall = () => { startAutoCall(o); refresh(); toast('Calling ' + o.customer + '…', { tone: 'info' }); };
  const saveCall = () => { recordCall(o, call.result, call.note.trim(), by); close(); setCall({ result: 'confirmed', note: '' }); refresh(); toast('Call saved'); };
  const approve = () => {
    const done = approveOrder(fresh(), place, by);
    close(); refresh();
    toast(done ? `Order ${o.id} approved` : 'This order was already approved', done ? undefined : { tone: 'info' });
  };
  const askAdvance = () => { if (!advOk) return; requestAdvance(o, advNum); refresh(); toast('Payment link sent'); };
  const takeAdvance = () => {
    if (!advOk) return;
    if (!isNewOrder(fresh().statusKey)) { close(); toast('This order was already approved', { tone: 'info' }); return; }
    receiveAdvance(o, { amount: advNum, method: adv.method, place });
    close(); refresh();
    toast(`Advance received · order ${o.id} approved`);
  };
  const doCancel = () => {
    if (!CAN_CANCEL.includes(fresh().statusKey)) { close(); toast('This order can no longer be cancelled', { tone: 'info' }); return; }
    cancelOrder(fresh(), 'Cancelled', by, cancel === 'Other' ? '' : cancel);
    close(); refresh();
    toast(`Order ${o.id} cancelled`);
  };
  const setPrep = (patch) => {
    const nextPrep = updatePrep(o, patch);
    // every packing step done: Ready for courier by itself (as on the web)
    if (prepDone(nextPrep) && fresh().statusKey === 'approved') { markReady(fresh()); toast('Ready for courier'); }
    refresh();
  };
  const printSlip = () => {
    if (!prep.courier) { toast('Choose a courier first', { tone: 'error' }); return; }
    printNode(slipRef.current, { title: `Slip ${o.id}`, css: '@page{size:100mm 150mm;margin:4mm}' });
    setPrep({ slipPrinted: true });
  };
  const toReady = () => { if (fresh().statusKey !== 'approved') return; markReady(fresh()); refresh(); toast('Ready for courier'); };
  const send = () => {
    const r = sendToCourier(fresh());
    refresh();
    if (r.ok) toast(r.duplicate ? `Already booked · ${r.courier} ${r.id}` : `Sent to ${r.courier} · ${r.id}`, r.duplicate ? { tone: 'info' } : undefined); else toast(r.error, { tone: 'error' });
  };
  const hook = async (code) => {
    if (code === 'return') {
      const ok = await confirmDialog({ title: 'Return started?', body: `${o.courier} is bringing the parcel back. The order becomes Returned.`, confirmLabel: 'Return started', tone: 'danger' });
      if (!ok) return;
    }
    const r = courierWebhook(fresh(), code, `${code}-${o.id}-${Date.now().toString(36)}`);
    refresh();
    toast(r.duplicate ? 'Already received' : HOOK_LABEL[code], { tone: r.duplicate ? 'info' : code === 'failed' ? 'info' : 'success' });
  };
  const sentDigital = () => { if (sendDigital(fresh(), by)) { refresh(); toast('Sent · ' + o.id + ' is delivered'); } else toast('This order was already sent', { tone: 'info' }); };
  const saveNote = (field, value) => {
    const text = String(value || '').trim();
    if (text === String(fresh()[field] || '').trim()) return;
    patchOrder(fresh(), { [field]: text });
    logOrder(o.id, 'sticky-note', field === 'note' ? 'Order note changed' : 'Internal note changed', text ? (text.length > 60 ? text.slice(0, 60) + '…' : text) : 'Removed');
    refresh();
    toast('Note saved');
  };
  const doResend = () => {
    const to = resend.to.trim();
    if (!to) { toast(resend.via === 'sms' ? 'Type the mobile number' : 'Type the email address', { tone: 'error' }); return; }
    const r = sendReceipt(invDoc, { via: resend.via, to, by });
    if (r.ok) { close(); toast(`Receipt sent by ${resend.via === 'sms' ? 'SMS' : 'email'} to ${to}`); } else toast(`Not sent: ${r.reason || r.status}`, { tone: 'error' });
  };
  const doPrint = () => { close(); if (invoiceRef.current && invDoc) printInvoice(invoiceRef.current, invDoc); };
  const saveComment = () => { if (!comment.trim()) return; logOrder(o.id, 'message-square', 'Comment', comment.trim() + ' · ' + by); setComment(''); close(); refresh(); toast('Comment added'); };
  const pickPhoto = (i) => { setPhotoAt(i); if (fileRef.current) { fileRef.current.value = ''; fileRef.current.click(); } };
  const onPhoto = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || photoAt == null) return;
    try { const url = await shrinkPhoto(file); setLinePhoto(fresh(), photoAt, url); setSheet(null); refresh(); toast('Photo added'); } catch (err) { toast(err.message, { tone: 'error' }); }
  };
  const removePhoto = (i) => { setLinePhoto(fresh(), i, null); setSheet(null); refresh(); toast('Photo removed'); };
  const cancelDuplicate = async (d) => {
    const ok = await confirmDialog({ title: `Cancel ${o.id}?`, body: `Duplicate of ${d.id}.`, confirmLabel: 'Cancel order', cancelLabel: 'Keep order', tone: 'danger' });
    if (!ok) return;
    cancelOrder(fresh(), 'Duplicate of ' + d.id, by, 'Duplicate order'); refresh(); toast(`Order ${o.id} cancelled`);
  };
  const merge = async (d) => {
    const ok = await confirmDialog({ title: `Merge ${o.id} into ${d.id}?`, body: `Its items move to ${d.id}, then ${o.id} is cancelled.`, confirmLabel: 'Merge and cancel', tone: 'danger' });
    if (!ok) return;
    mergeInto(fresh(), d, by); refresh(); toast(`Merged into ${d.id}`);
    window.location.assign('/m-order-detail?id=' + encodeURIComponent(d.id));
  };

  // ---- the next step: its card and the bottom buttons ----------------------------------------------------------
  let stepTitle = null, stepBody = null, bar = null;
  const cancelBtn = canCancel ? <Button kind="line" onClick={() => setSheet('cancel')}>Cancel</Button> : null;
  if (counter) {
    bar = <><Button kind="line" icon="receipt" onClick={doPrint}>Print invoice</Button><Button kind="primary" style={{ flex: '2' }} onClick={() => setSheet('resend')}>Resend receipt</Button></>;
  } else if (isNew) {
    stepTitle = v && v.state === 'confirmed' ? 'Approve order' : 'Verify order';
    stepBody = (
      <>
        <div className="line">
          <Icon name={v && v.state === 'confirmed' ? 'check' : 'phone'} size={18} style={{ color: v && v.state === 'confirmed' ? 'var(--ok)' : v && v.state !== 'calling' ? 'var(--warn)' : 'var(--brand)' }} />
          {v ? <span><b>{v.state === 'calling' ? 'Calling…' : callResultLabel(v.state)}</b> · {v.method === 'auto' ? 'Auto call' : 'Call'}{v.at ? ' · ' + timeText(v.at) : ''}{v.note ? ' · ' + v.note : ''}</span> : <span>Not verified yet</span>}
        </div>
        <div className="line" style={{ marginTop: '8px' }}>
          <Icon name="truck" size={18} />
          <span style={{ flex: '1' }}>{record && record.total ? `${record.total} past parcels · ${record.rate}% delivered` : 'No courier record'}</span>
          <Pill tone={risk[1]}>{risk[0]}</Pill>
        </div>
        {o.advance && o.advance.state === 'requested' ? <Note tone="info" icon="wallet" style={{ marginTop: '12px' }}>Advance {money(o.advance.amount)} requested</Note> : null}
        <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
          <Button kind="soft" icon="phone" style={{ flex: '1' }} disabled={!!(v && v.state === 'calling')} onClick={autoCall}>Auto call</Button>
          <Button kind="line" style={{ flex: '1' }} onClick={() => setSheet('call')}>Log call</Button>
        </div>
        {o.payment !== 'Paid' ? <Button kind="line" icon="wallet" style={{ width: '100%', marginTop: '10px' }} onClick={() => setSheet('advance')}>Take advance + approve</Button> : null}
      </>
    );
    bar = <>{cancelBtn}<Button kind="primary" icon="check" style={{ flex: '2' }} onClick={() => setSheet('approve')}>Approve</Button></>;
  } else if (o.statusKey === 'approved' && digital) {
    stepTitle = 'Send the download or key';
    stepBody = <div className="line"><Icon name="chat" size={18} /><span>No parcel: send the link or licence key to {o.customer}{phoneOk ? ' · ' + o.phone : ''}.</span></div>;
    bar = <>{cancelBtn}<Button kind="primary" icon="check" style={{ flex: '2' }} onClick={sentDigital}>Mark as sent</Button></>;
  } else if (o.statusKey === 'approved') {
    stepTitle = 'Prepare parcel';
    stepBody = null;
    bar = <>{cancelBtn}<Button kind="primary" icon="box" style={{ flex: '2' }} disabled={!prepDone(prep)} onClick={toReady}>Ready for courier</Button></>;
  } else if (o.statusKey === 'ready') {
    stepTitle = 'Send to courier';
    stepBody = (
      <>
        <div className="lab" style={{ marginBottom: '8px' }}>Courier</div>
        <Chips value={prep.courier} onChange={(k) => setPrep({ courier: k })} items={COURIERS.map((c) => ({ key: c, label: `${c} · ${money(safe(() => courierCharge(c, o.zone), 0))}` }))} />
        <div className="line" style={{ marginTop: '14px' }}><Icon name="cash" size={18} /><span style={{ flex: '1' }}>COD to collect</span><b className="num">{money(cod)}</b></div>
      </>
    );
    bar = <>{cancelBtn}<Button kind="primary" icon="truck" style={{ flex: '2' }} onClick={send}>Send to courier</Button></>;
  } else if (o.statusKey === 'shipped') {
    stepTitle = 'With the courier';
    stepBody = (
      <>
        <div className="line"><Icon name="truck" size={18} /><span style={{ flex: '1' }}><b>{o.courier}</b> · <span className="mono">{o.consignment}</span></span>{o.trackingUrl ? <a href={o.trackingUrl} target="_blank" rel="noreferrer" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--brand)' }}>Track</a> : null}</div>
        <div className="line" style={{ marginTop: '8px' }}><Icon name="cash" size={18} /><span style={{ flex: '1' }}>COD to collect</span><b className="num">{money(cod)}</b></div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
          <Button kind="soft" style={{ flex: '1' }} onClick={() => hook('out')}>Out for delivery</Button>
          <Button kind="danger" style={{ flex: '1' }} onClick={() => hook('return')}>Return started</Button>
        </div>
      </>
    );
    bar = <><Button kind="line" onClick={() => hook('failed')}>Delivery failed</Button><Button kind="primary" icon="check" style={{ flex: '2' }} onClick={() => hook('delivered')}>Mark delivered</Button></>;
  } else if (o.statusKey === 'delivered') {
    stepTitle = completion.done ? 'Completed' : 'Delivered';
    stepBody = (
      <>
        {o.times && o.times.delivered ? <div className="line"><Icon name="check" size={18} style={{ color: 'var(--ok)' }} /><span>Delivered {dateText(o.times.delivered, { time: true })}</span></div> : null}
        {o.codCollected ? <div className="line" style={{ marginTop: '8px' }}><Icon name="cash" size={18} /><span style={{ flex: '1' }}><b className="num">{money(o.codCollected)}</b> COD with {o.courier} · payout pending</span></div> : null}
        {completion.text ? <div className="line" style={{ marginTop: '8px' }}><Icon name="clock" size={18} /><span>{completion.text}</span></div> : null}
      </>
    );
    bar = <><Button kind="line" icon="receipt" onClick={doPrint}>Invoice</Button><Button kind="primary" style={{ flex: '2' }} onClick={() => setSheet('resend')}>Resend receipt</Button></>;
  } else if (rto) {
    stepTitle = 'Returned';
    stepBody = (
      <>
        <div className="line"><Icon name="undo" size={18} /><span>{o.rtoReason || 'Brought back by the courier'}</span></div>
        <div className="line" style={{ marginTop: '8px' }}><Icon name="box" size={18} /><span>{rto.left ? `${rto.left} of ${rto.sent} pcs still with ${o.courier}` : 'All items back'}</span></div>
      </>
    );
    bar = <Button kind="primary" icon="download" href={'/courier-returns?id=' + encodeURIComponent(o.id)}>{rto.left ? 'Receive parcel' : 'View return'}</Button>;
  } else if (o.statusKey === 'cancelled') {
    stepTitle = 'Cancelled';
    stepBody = <div className="line"><Icon name="x" size={18} /><span>{o.cancelReason || (o.times && o.times.cancelled ? 'Cancelled ' + dateText(o.times.cancelled, { time: true }) : 'This order was cancelled')}</span></div>;
  }

  const lineSub = (l, i) => {
    const bits = ['×' + l.qty];
    if (l.variant && l.variant !== 'Single') bits.push(l.variant);
    if (l.qty > 1) bits.push(money(l.price) + ' each');
    if (counter) {
      const serials = safe(() => serialsOfLine(o, l, sale), []);
      if (serials.length) bits.push((serials.length > 1 ? 'IMEI ' : 'IMEI ') + serials.join(', '));
      const w = safe(() => coverOf(productOfLine(l, products), wStart), null);
      if (w) bits.push(`${w.label} · to ${dateText(w.until)}`);
    }
    return bits.join(' · ');
  };

  const more = [
    { key: 'resend', icon: 'chat', label: 'Resend receipt', run: () => setSheet('resend') },
    { key: 'print', icon: 'receipt', label: 'Print invoice', run: doPrint },
    { key: 'return', icon: 'undo', label: 'Return or exchange', sub: 'Opens the web flow', href: '/return-exchange?ref=' + encodeURIComponent(o.invoiceId || o.id) },
    { key: 'comment', icon: 'edit', label: 'Add a comment', run: () => setSheet('comment') },
    { key: 'web', icon: 'globe', label: 'Open on the web', sub: 'Edit order, payment proofs, tags', href: '/order-detail?id=' + encodeURIComponent(o.id) },
    canCancel && { key: 'cancel', icon: 'x', label: 'Cancel order', run: () => setSheet('cancel') },
  ].filter(Boolean);

  return (
    <AppScreen name="MOrderDetail" title={'Order ' + o.id} css={CSS}>
      <AppBar title={'Order ' + o.id} back={back} actions={<IconButton icon="dots" label="More actions" onClick={() => setSheet('more')} />} />
      <Content top={103} bottom={bar ? 98 : 0}>
        {!counter ? <Steps steps={steps} reached={reached} next={next} stopped={offPath ? (o.statusKey === 'cancelled' ? 'Order stopped' : 'Came back from the courier') : ''} status={completion.done ? <Pill tone="ok">Completed</Pill> : <OrderPill statusKey={o.statusKey} />} /> : (
          <div className="card" style={{ margin: '4px 20px 0', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ flex: '1', minWidth: '0', fontSize: 'var(--text-sm)', color: 'var(--body)' }} className="ell">{o.placed} · {o.channel}</span>
            <OrderPill statusKey={o.statusKey} />
          </div>
        )}

        {toReview ? (
          <div style={{ margin: '12px 20px 0' }}>
            <Note tone="warn" icon="receipt">Payment to review · {safe(() => methodLabel(toReview.method), '')} {money(toReview.amount)}. <Link href={'/order-detail?id=' + encodeURIComponent(o.id)} style={{ fontWeight: 'var(--weight-medium)', textDecoration: 'underline' }}>Review on the web</Link></Note>
          </div>
        ) : null}
        {dups.map((d) => (
          <div key={d.id} style={{ margin: '12px 20px 0' }}>
            <Note tone="warn" icon="alert">
              <div>Possible duplicate of <Link href={'/m-order-detail?id=' + encodeURIComponent(d.id)} className="mono" style={{ fontWeight: 'var(--weight-medium)', textDecoration: 'underline' }}>{d.id}</Link> · same phone and item</div>
              {CAN_CANCEL.includes(o.statusKey) ? (
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <Button kind="line" style={{ flex: '1', height: '36px' }} onClick={() => cancelDuplicate(d)}>Cancel this one</Button>
                  {CAN_CANCEL.includes(d.statusKey) && !isCounterSale(d) ? <Button kind="soft" style={{ flex: '1', height: '36px' }} onClick={() => merge(d)}>Merge into {d.id}</Button> : null}
                </div>
              ) : null}
            </Note>
          </div>
        ))}

        <div className="card" style={{ margin: '12px 20px 0', padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Avatar text={o.initials || initials(o.customer)} tone={{ bg: '#e0f3fb', fg: '#003087' }} />
            <div style={{ flex: '1', minWidth: '0' }}>
              {custHref ? <Link href={custHref} className="ell" style={{ display: 'block', fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)' }}>{o.customer || 'Walk-in customer'}</Link>
                : <div className="ell" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)' }}>{o.customer || 'Walk-in customer'}</div>}
              <div className="num ell" style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{phoneOk ? o.phone : 'No mobile number'}{phoneOk ? ` · ${samePhone.length > 1 ? plural(samePhone.length, 'order') : 'First order'}` : ''}</div>
            </div>
            {custHref ? <Icon name="chev" size={18} style={{ color: 'var(--muted)' }} /> : null}
          </div>
          {!counter || o.address ? <div style={{ fontSize: 'var(--text-sm)', color: 'var(--body)', marginTop: '12px', lineHeight: '21px' }}>{o.address || 'No address on this order'}{o.zone && !counter ? <span style={{ color: 'var(--muted)' }}> · {o.zone}</span> : null}</div> : null}
          {phoneOk ? (
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <a className="btn btns" href={'tel:' + tel} style={{ flex: '1', height: '44px', fontSize: 'var(--text-sm-plus)', padding: '0 10px' }}><Icon name="phone" size={18} />Call</a>
              <a className="btn btns" href={'https://wa.me/88' + tel} target="_blank" rel="noreferrer" style={{ flex: '1', height: '44px', fontSize: 'var(--text-sm-plus)', padding: '0 10px', background: '#e7f7f0', color: '#0f7a55' }}><Icon name="whatsapp" size={18} />WhatsApp</a>
              <a className="btn btns" href={'sms:' + tel} style={{ flex: '1', height: '44px', fontSize: 'var(--text-sm-plus)', padding: '0 10px' }}><Icon name="chat" size={18} />SMS</a>
            </div>
          ) : null}
        </div>

        {stepTitle ? (
          <Section title={stepTitle} style={{ marginTop: '16px' }} action={o.statusKey === 'approved' && !digital ? <span style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>Pack, print, attach</span> : null}>
            {o.statusKey === 'approved' && !digital ? (
              <div className="card" style={{ margin: '0 20px' }}>
                <div style={{ padding: '14px 16px 4px' }}>
                  <div className="lab" style={{ marginBottom: '8px' }}>Courier</div>
                  <Chips value={prep.courier} onChange={(k) => setPrep(prep.courier === k ? {} : { courier: k, slipPrinted: false, slipAttached: false })} items={COURIERS.map((c) => ({ key: c, label: `${c} · ${money(safe(() => courierCharge(c, o.zone), 0))}` }))} />
                </div>
                <CheckRow title="Shipping info checked" sub={`${o.customer} · ${o.phone} · ${o.address || 'No address'}`} on={!!prep.addressOk} onChange={(x) => setPrep({ addressOk: x })} />
                <CheckRow title="Amounts confirmed" sub={'COD ' + money(cod)} on={!!prep.amountsOk} onChange={(x) => setPrep({ amountsOk: x })} />
                <CheckRow title="Slip printed" sub={prep.courier ? prep.courier + ' label' : 'Choose a courier first'} on={!!prep.slipPrinted}
                  onChange={(x) => (prep.courier ? setPrep({ slipPrinted: x }) : toast('Choose a courier first', { tone: 'error' }))}
                  end={<Button kind="soft" style={{ height: '36px', padding: '0 12px' }} onClick={printSlip}>Print</Button>} />
                <CheckRow title="Packed" on={!!prep.packed} onChange={(x) => setPrep({ packed: x })} />
                <CheckRow title="Slip attached" on={!!prep.slipAttached} onChange={(x) => (prep.slipPrinted ? setPrep({ slipAttached: x }) : toast('Print the slip first', { tone: 'error' }))} />
              </div>
            ) : (
              <Card pad="14px 16px">{stepBody}</Card>
            )}
          </Section>
        ) : null}

        <div className="sec" style={{ marginTop: '16px' }}>
          <h2>{plural(o.units || o.lines.length, 'item')}</h2>
          <span style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{o.source || o.channel}</span>
        </div>
        <div className="card" style={{ margin: '0 20px' }}>
          {o.lines.map((l, i) => (
            <div key={l.name + i} className="row" style={{ minHeight: '56px', padding: '9px 16px' }}>
              <button type="button" className="thumb" aria-label={photos[i] ? 'Photo of ' + l.name : 'Add a photo of ' + l.name} onClick={() => (photos[i] ? (setPhotoAt(i), setSheet('photo')) : pickPhoto(i))}>
                {photos[i] ? <img src={photos[i]} alt="" /> : (l.name || '?').charAt(0).toUpperCase()}
              </button>
              <span className="m">
                <span className="t" style={{ display: 'block', fontWeight: 'var(--weight-medium)' }}>{l.name}</span>
                <span className="s" style={{ display: 'block' }}>{lineSub(l, i)}</span>
              </span>
              <span className="num" style={{ fontWeight: 'var(--weight-medium)' }}>{money(l.price * l.qty)}</span>
            </div>
          ))}
          <div style={{ padding: '12px 16px 16px', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 'var(--text-sm)' }}>
            <div className="sum"><span>Products</span><span className="num">{money(o.subtotal)}</span></div>
            {o.shipping ? <div className="sum"><span>Delivery{o.zone ? ' · ' + o.zone : ''}</span><span className="num">{money(o.shipping)}</span></div> : null}
            {adj > 0 ? <div className="sum"><span>VAT and charges</span><span className="num">{money(adj)}</span></div> : adj < 0 ? <div className="sum"><span>Discount{o.discountReason ? ' · ' + o.discountReason : ''}</span><span className="num">−{money(-adj)}</span></div> : null}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', marginTop: '4px' }}>
              <span>Total</span>
              <span className="num">{money(o.amount)}</span>
            </div>
            {o.paid != null && o.paid > 0 && due ? <div className="sum"><span>Paid</span><span className="num">{money(o.paid)}</span></div> : null}
            {due && o.statusKey !== 'cancelled' ? <div className="sum" style={{ color: 'var(--err)', fontWeight: 'var(--weight-medium)' }}><span>Due</span><span className="num">{money(due)}</span></div> : null}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
              <Pill tone={pay.tone} shape>{pay.text}{o.payment === 'Paid' && o.method && o.method !== 'Gateway' && o.method !== 'COD' ? ' · ' + o.method : ''}</Pill>
              {!counter && cod > 0 && !['delivered', 'cancelled', 'returned'].includes(o.statusKey) ? <Pill tone="grey">COD {money(cod)}</Pill> : null}
              {o.refundDue > 0 ? <Pill tone="err">Refund owed {money(o.refundDue)}</Pill> : null}
            </div>
          </div>
        </div>

        {track.length && o.statusKey !== 'ready' ? (
          <Section title="Tracking" action={<span className="mono" style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{o.consignment}</span>}>
            <Card pad="16px">
              {track.map((e, i) => (
                <div key={e.code + e.at + i} className="tl">
                  <i aria-hidden="true" />
                  <span style={{ flex: '1', minWidth: '0', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>{e.text}</span>
                  <span style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{timeText(e.at)}, {dateText(e.at)}</span>
                </div>
              ))}
            </Card>
          </Section>
        ) : null}

        <Section title="Notes">
          <Card pad="14px 16px" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label className="field">
              <span className="lab">Order note</span>
              <textarea key={'note-' + o.id + '-' + (o.note || '')} className="note-in" rows={2} defaultValue={o.note || ''} placeholder={counter ? 'Printed on the invoice' : 'Seen by the courier and on the invoice'} onBlur={(e) => saveNote('note', e.target.value)} />
            </label>
            <label className="field">
              <span className="lab">Internal note</span>
              <textarea key={'inote-' + o.id + '-' + (o.internalNote || '')} className="note-in" rows={2} defaultValue={o.internalNote || ''} placeholder="Only staff can read this" onBlur={(e) => saveNote('internalNote', e.target.value)} />
            </label>
          </Card>
        </Section>

        <Section title="Order">
          <div className="card" style={{ margin: '0 20px' }}>
            <div className="kv"><span>Placed</span><span>{o.placed}</span></div>
            <div className="kv"><span>Channel</span><span>{o.channel}{o.source && !counter ? ' · ' + o.source : ''}</span></div>
            {o.invoiceId ? <div className="kv"><span>{o.invoiceKind || 'Invoice'}</span><span className="mono">{o.invoiceId}</span></div> : null}
            {soldBy ? <div className="kv"><span>Sold by</span><span>{soldBy}</span></div> : null}
            {!counter ? <div className="kv"><span>Courier</span><span>{o.courier}{o.consignment && o.consignment !== '—' ? ' · ' + o.consignment : ''}</span></div> : null}
            {!counter ? <div className="kv"><span>Stock</span><span>{holdsStock() ? (holds.length ? 'Held at ' + heldAt : isNew ? 'Held when approved' : 'Not held') : o.stockOut ? 'Taken from ' + o.stockOut.place : isNew ? 'Taken out when approved' : 'Not taken out'}</span></div> : null}
            {!counter && record && record.total ? <div className="kv"><span>Courier record</span><span>{record.delivered} of {record.total} delivered</span></div> : null}
          </div>
        </Section>

        <Section title="Activity" action={{ label: 'Add a comment', onClick: () => setSheet('comment') }}>
          <Card pad="16px">
            {(allLog ? log : log.slice(0, 5)).map((e, i) => (
              <div key={i} className="tl">
                <i aria-hidden="true" />
                <span style={{ flex: '1', minWidth: '0' }}>
                  <span style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>{e.title}</span>
                  <span style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{dateText(e.at, { time: true })}{e.meta ? ' · ' + e.meta : ''}</span>
                </span>
              </div>
            ))}
            {log.length > 5 ? <Button kind="soft" style={{ width: '100%', marginTop: '12px', height: '36px' }} onClick={() => setAllLog(!allLog)}>{allLog ? 'Show less' : `Show all ${log.length}`}</Button> : null}
          </Card>
        </Section>
        <div style={{ height: '8px' }} />
      </Content>

      {bar ? <ActionBar>{bar}</ActionBar> : null}

      {/* the invoice paper and the shipping slip, printed on their own (off screen) */}
      {invDoc ? <SaleInvoice doc={invDoc} innerRef={invoiceRef} /> : null}
      {!counter ? <div className="slip" aria-hidden="true">
        <div ref={slipRef} style={{ fontFamily: 'var(--font-sans)', color: '#0f172a', padding: '4mm', display: 'flex', flexDirection: 'column', gap: '3mm' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #0f172a', paddingBottom: '2mm' }}><b style={{ fontSize: 'var(--text-lg)' }}>{prep.courier || 'Courier'}</b><span>{MERCHANT.name}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '3mm' }}>
            <div><div style={{ fontSize: 'var(--text-xs)' }}>Order</div><b style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-data)' }}>{o.id}</b></div>
            <QrCode text={o.id} size={72} label={'Order ' + o.id} />
          </div>
          <div><div style={{ fontSize: 'var(--text-xs)' }}>To</div><b>{o.customer}</b><div>{o.phone}</div><div>{o.address}</div><div>{o.zone}</div></div>
          <div style={{ border: '2px solid #0f172a', borderRadius: 'var(--radius-lg)', padding: '2mm 3mm', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>COD</span><b style={{ fontSize: 'var(--text-2xl)' }}>{money(cod)}</b></div>
          <div style={{ fontSize: 'var(--text-xs)' }}>{plural(o.units || 0, 'item')} · From {MERCHANT.name}, {MERCHANT.phone}</div>
        </div>
      </div> : null}
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhoto} />

      <Sheet open={sheet === 'more'} onClose={close} title={'Order ' + o.id}>
        <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
          {more.map((m) => <ListRow key={m.key} compact icon={m.icon} title={m.label} sub={m.sub} href={m.href} onClick={m.run} />)}
        </div>
      </Sheet>

      <Sheet open={sheet === 'call'} onClose={close} title="Log call"
        footer={<><Button kind="line" onClick={close}>Cancel</Button><Button kind="primary" style={{ flex: '2' }} onClick={saveCall}>Save</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {phoneOk ? <a className="btn btns" href={'tel:' + tel} style={{ width: '100%' }}><Icon name="phone" size={18} />Call {o.phone}</a> : null}
          <div className="field"><span className="lab">Result</span><Chips value={call.result} onChange={(k) => setCall({ ...call, result: k })} items={CALL_RESULTS.map(([k, l]) => ({ key: k, label: l }))} /></div>
          <Field label="Note"><TextInput value={call.note} onChange={(t) => setCall({ ...call, note: t })} placeholder="Optional" /></Field>
        </div>
      </Sheet>

      <Sheet open={sheet === 'approve'} onClose={close} title={'Approve ' + o.id}
        footer={<><Button kind="line" onClick={close}>Cancel</Button><Button kind="primary" icon="check" style={{ flex: '2' }} onClick={approve}>Approve</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {!v || v.state !== 'confirmed' ? <Note tone="warn" icon="phone">Not verified yet.</Note> : null}
          {places.length > 1 ? <div className="field"><span className="lab">{holdsStock() ? 'Hold stock at' : 'Take stock from'}</span><Chips value={place} onChange={setPlace} items={places.map((p) => ({ key: p, label: p }))} /></div> : null}
          <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
            {stock.map((x) => (
              <ListRow key={x.name} compact chevron={false} title={x.name} sub={`${x.qty} needed`}
                end={<span className="num" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: x.short ? 'var(--err)' : 'var(--ok)' }}>{x.known ? `${x.available} free` : '—'}</span>} />
            ))}
          </div>
        </div>
      </Sheet>

      <Sheet open={sheet === 'advance'} onClose={close} title="Take advance + approve"
        footer={<><Button kind="line" disabled={!advOk} onClick={askAdvance}>Send link</Button><Button kind="primary" style={{ flex: '2' }} disabled={!advOk} onClick={takeAdvance}>Received · approve</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Field label="Advance" help={advOk ? `COD after the advance: ${money(o.amount - paid - advNum)}` : `Between ৳1 and ${money(Math.max(1, o.amount - paid - 1))}`}>
            <TextInput value={adv.amount} onChange={(t) => setAdv({ ...adv, amount: t.replace(/[^0-9]/g, '') })} prefix="৳" inputMode="numeric" />
          </Field>
          <div className="field"><span className="lab">Paid by</span><Chips value={adv.method} onChange={(k) => setAdv({ ...adv, method: k })} items={ADVANCE_METHODS.map(([k, l]) => ({ key: k, label: l }))} /></div>
          {places.length > 1 ? <div className="field"><span className="lab">{holdsStock() ? 'Hold stock at' : 'Take stock from'}</span><Chips value={place} onChange={setPlace} items={places.map((p) => ({ key: p, label: p }))} /></div> : null}
        </div>
      </Sheet>

      <Sheet open={sheet === 'cancel'} onClose={close} title={`Cancel ${o.id}?`}
        footer={<><Button kind="line" onClick={close}>Keep order</Button><Button kind="danger" style={{ flex: '2' }} onClick={doCancel}>Cancel order</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="field"><span className="lab">Reason</span><Chips value={cancel} onChange={setCancel} items={CANCEL_REASONS.map((r) => ({ key: r, label: r }))} /></div>
          {holds.length || o.stockOut ? <Note tone="info" icon="box">Stock goes back.</Note> : null}
        </div>
      </Sheet>

      <Sheet open={sheet === 'resend'} onClose={close} title="Resend receipt"
        footer={<><Button kind="line" onClick={close}>Cancel</Button><Button kind="primary" style={{ flex: '2' }} onClick={doResend}>Send receipt</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Segmented style={{ margin: '0' }} value={resend.via} onChange={(k) => setResend({ via: k, to: k === 'sms' && phoneOk ? o.phone : '' })} items={[{ key: 'sms', label: 'SMS' }, { key: 'email', label: 'Email' }]} />
          <Field label={resend.via === 'sms' ? 'Mobile number' : 'Email'}>
            <TextInput value={resend.to} onChange={(t) => setResend({ ...resend, to: t })} type={resend.via === 'sms' ? 'tel' : 'email'} inputMode={resend.via === 'sms' ? 'tel' : 'email'} placeholder={resend.via === 'sms' ? '01XXXXXXXXX' : 'name@example.com'} />
          </Field>
          {(() => {
            const sent = safe(() => receiptsSent(o.id).concat(sale ? receiptsSent(sale.id) : []), []);
            return sent.length ? <span className="help">Sent before: {sent.slice(0, 3).map((x) => `${x.via === 'sms' ? 'SMS' : 'email'} to ${x.to}, ${dateText(x.at)}`).join(' · ')}</span> : null;
          })()}
        </div>
      </Sheet>

      <Sheet open={sheet === 'comment'} onClose={close} title="Add a comment"
        footer={<><Button kind="line" onClick={close}>Cancel</Button><Button kind="primary" style={{ flex: '2' }} disabled={!comment.trim()} onClick={saveComment}>Add comment</Button></>}>
        <Field label="Comment" help="Only staff can see it"><TextInput multiline value={comment} onChange={setComment} autoFocus /></Field>
      </Sheet>

      <Sheet open={sheet === 'photo' && photoAt != null} onClose={close} title={photoAt != null && o.lines[photoAt] ? o.lines[photoAt].name : 'Photo'}
        footer={<><Button kind="danger" onClick={() => removePhoto(photoAt)}>Remove</Button><Button kind="primary" style={{ flex: '2' }} onClick={() => pickPhoto(photoAt)}>Replace</Button></>}>
        {photoAt != null && photos[photoAt] ? <img src={photos[photoAt]} alt={o.lines[photoAt] ? o.lines[photoAt].name : ''} style={{ display: 'block', width: '100%', maxHeight: '50vh', objectFit: 'contain', borderRadius: 'var(--radius-lg)', background: 'var(--bg)' }} /> : null}
      </Sheet>
    </AppScreen>
  );
}
