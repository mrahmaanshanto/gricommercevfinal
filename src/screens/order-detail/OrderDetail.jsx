'use client';
// OrderDetail — one order in full, opened from Orders (/order-detail?id=<order no>): fulfilment stepper,
// duplicate warning, line items and payment, the stock held for it, the actions (approve with a hold
// place, hold, cancel, deliver, courier return), the linked invoice or memo, and activity.
// Front end only: the order comes from src/lib/orders.js (demo orders, orders made in this browser and
// demo wholesale invoices); status changes and activity are kept in this browser.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Dialog, EmptyState, StatusBadge } from '@/components/ui';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { ORDER_STEPS, orderStatus } from '@/lib/orderStatus';
import { usePlaceList } from '@/lib/usePlaces';
import { productBy } from '@/lib/stock';
import { holdsFor } from '@/lib/stockHolds';
import { courierHistory } from '@/lib/orderLinks';
import {
  getOrders, duplicatesOf, holdsOfOrder, heldText, availability, approveOrder, holdOrderStock, cancelOrder, deliverOrder, markReturned, mergeInto,
  logOrder, logOf, rtoState, invoiceHref, orderHref, isCounterSale, holdPlaceOf,
  CAN_APPROVE, CAN_CANCEL, CAN_DELIVER, CAN_RETURN, DEFAULT_HOLD_PLACE, RTO_REASONS,
} from '@/lib/orders';

const DEFAULT_ID = '#136779';   // what opens when a link carries no order number
const STEP_NOTES = { pending: 'Awaiting confirmation', approved: 'Not approved yet', ready: 'No courier yet', shipped: 'Not shipped yet', delivered: 'Not delivered yet' };
const PAYMENTS = { Paid: ['success', 'check'], Unpaid: ['error', 'circle-alert'], Partial: ['warning', 'circle-dashed'], COD: ['neutral', 'banknote'] };
const HOLD_STATUS = { held: ['On hold', 'warning'], released: ['Released', 'success'], delivered: ['Delivered', 'slate'], damaged: ['Damaged', 'error'] };
const ACTIONS = ['Approve', 'Hold', 'Cancel', 'Mark delivered', 'Courier return'];
const COURIERS = ['Steadfast', 'Pathao', 'Carrybee', 'RedX'];
const digitsOf = (t) => String(t || '').replace(/\D/g, '');
const units = (list) => list.reduce((a, h) => a + h.qty, 0);
const minutesApart = (a, b) => {
  const m = Math.round(Math.abs(a - b) / 60000);
  return m < 60 ? `${m} min apart` : m < 48 * 60 ? `${Math.round(m / 60)} h apart` : `${Math.round(m / 1440)} days apart`;
};

const CSS = `
.od-bar{position:sticky;top:64px;z-index:90;display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-6);background:var(--surface-header);backdrop-filter:blur(8px);border-bottom:1px solid var(--border-subtle)}
.od-back{display:grid;place-items:center;width:44px;height:44px;flex:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);color:var(--text-body)}
.od-title{margin:0;font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--text-heading);font-family:var(--font-data)}
.od-meta{font-size:var(--text-xs);color:var(--text-muted)}
.od-bar__actions{margin-left:auto;display:flex;flex-wrap:wrap;gap:var(--space-2)}
.od-grid{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:var(--space-5);align-items:start}
.od-col{display:flex;flex-direction:column;gap:var(--space-5);min-width:0}
.od-card{overflow:hidden}
.od-card__head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-4) var(--space-5) var(--space-3)}
.od-card__head h2{margin:0;display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.od-card__head p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.od-card__body{display:flex;flex-direction:column;gap:var(--space-4);padding:0 var(--space-5) var(--space-5)}
.od-card .gc-table th,.od-card .gc-table td{padding-left:var(--space-3);padding-right:var(--space-3);white-space:normal}
.od-card .gc-table th:first-child,.od-card .gc-table td:first-child{padding-left:var(--space-5)}
.od-card .gc-table th:last-child,.od-card .gc-table td:last-child{padding-right:var(--space-5)}
.od-card .gc-badge,.od-num{white-space:nowrap}
.od-num{text-align:right;font-variant-numeric:tabular-nums}
.od-strong{font-weight:var(--weight-medium);color:var(--text-heading)}
.od-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.od-id{font-family:var(--font-data)}
.od-sum{display:grid;grid-template-columns:1fr auto;gap:6px var(--space-5);margin:0 0 0 auto;padding:var(--space-4) var(--space-5);width:min(100%,340px);font-size:var(--text-sm);font-variant-numeric:tabular-nums}
.od-sum dt{color:var(--text-body)}
.od-sum dd{margin:0;text-align:right;color:var(--text-heading)}
.od-sum .is-total{padding-top:6px;border-top:1px solid var(--border-strong);font-weight:var(--weight-semibold);color:var(--primary)}
.od-dup{display:flex;flex-direction:column;gap:var(--space-3);align-items:stretch}
.od-dup__row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.od-dup__row p{margin:0 auto 0 0;color:var(--text-heading)}
.od-place{border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden}
.od-place__head{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-2) var(--space-4);background:var(--surface-subtle);font-size:var(--text-sm)}
.od-place .gc-table th:first-child,.od-place .gc-table td:first-child{padding-left:var(--space-4)}
.od-seg{display:flex;flex-wrap:wrap;gap:6px;padding:5px;border-radius:var(--radius-xl);background:var(--surface-subtle)}
.od-seg button{flex:1 1 110px;height:36px;border:0;border-radius:var(--radius-lg);background:none;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.od-seg button[aria-pressed="true"]{background:var(--surface-card);color:var(--primary);box-shadow:var(--shadow-soft)}
.od-panel{display:flex;flex-direction:column;gap:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);padding:var(--space-4)}
.od-panel h3{margin:0;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.od-panel p{margin:0;font-size:var(--text-xs-plus);color:var(--text-muted)}
.od-two{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:var(--space-3)}
.od-short{color:var(--text-danger);font-weight:var(--weight-medium)}
.od-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:var(--space-2)}
.od-stat{padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.od-stat span{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.od-stat b{display:block;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
.od-kv{display:grid;grid-template-columns:auto 1fr;gap:6px var(--space-4);margin:0;font-size:var(--text-sm)}
.od-kv dt{color:var(--text-muted)}
.od-kv dd{margin:0;text-align:right;color:var(--text-heading);overflow-wrap:anywhere}
.od-kvs{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:var(--space-3)}
.od-box{border:1px solid var(--border-subtle);border-radius:var(--radius-lg);padding:var(--space-3) var(--space-4)}
.od-box h3{margin:0 0 var(--space-2);font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-heading)}
.od-who{display:flex;align-items:center;gap:var(--space-3)}
.od-avatar{display:grid;place-items:center;width:44px;height:44px;flex:none;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary);font-weight:var(--weight-semibold)}
.od-contact{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-2)}
.od-addr{margin:0;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm);line-height:1.6;color:var(--text-body)}
.od-log{display:flex;flex-direction:column}
.od-log__row{display:flex;gap:var(--space-3);padding:var(--space-3) 0;border-bottom:1px solid var(--border-subtle)}
.od-log__row:last-child{border-bottom:0}
.od-log__icon{display:grid;place-items:center;width:30px;height:30px;flex:none;border-radius:var(--radius-full);background:var(--surface-subtle);color:var(--text-body)}
.od-tags{display:flex;flex-wrap:wrap;gap:6px}
.od-tag{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 4px 0 10px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-body)}
.od-tag button{display:grid;place-items:center;width:22px;height:22px;border:0;border-radius:var(--radius-full);background:none;color:var(--text-muted);cursor:pointer}
.od-linkbtn{border:0;background:none;padding:0;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--primary);cursor:pointer}
.od-steps{display:grid;grid-template-columns:repeat(var(--steps),minmax(0,1fr));gap:8px;margin:0;padding:0;list-style:none}
.od-step{position:relative;min-width:0;text-align:center}
.od-step__dot{position:relative;z-index:1;width:32px;height:32px;margin:0 auto;border-radius:var(--radius-full);display:grid;place-items:center;background:var(--surface-subtle);color:var(--text-muted);border:1.5px solid transparent}
.od-step--done .od-step__dot{background:var(--fill-success);color:#fff}
.od-step--current .od-step__dot{background:var(--surface-card);color:var(--text-warning);border-color:currentColor;box-shadow:0 0 0 3px var(--fill-warning-soft)}
.od-step::after{content:"";position:absolute;top:15px;left:calc(50% + 22px);width:calc(100% - 36px);height:3px;border-radius:var(--radius-full);background:var(--border-subtle)}
.od-step--done::after{background:var(--fill-success)}
.od-step:last-child::after{display:none}
.od-step__label{margin:8px 0 0;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-muted)}
.od-step--done .od-step__label{color:var(--text-heading)}
.od-step--current .od-step__label{color:var(--text-heading);font-weight:var(--weight-semibold)}
.od-step__note{margin:1px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:1100px){.od-grid{grid-template-columns:minmax(0,1fr)}}
@media (max-width:767px){
.od-bar{padding:var(--space-3) 16px;top:56px}
.od-steps{grid-template-columns:minmax(0,1fr);gap:0}
.od-step{display:grid;grid-template-columns:32px minmax(0,1fr);column-gap:12px;text-align:left;padding-bottom:18px}
.od-step:last-child{padding-bottom:0}
.od-step__dot{grid-row:1 / span 2;margin:0}
.od-step__label{margin:0;align-self:end}
.od-step::after{top:36px;bottom:4px;left:15px;width:3px;height:auto}
}
`;

// demo session data from the storefront (the same for every online order)
const ATTRIBUTION = [['Primary source', 'first_visit'], ['Channel', 'Web'], ['Traffic source', 'Direct'], ['Confidence', 'Medium']];
const SESSION = [['Duration', '1 min'], ['Page views', '1'], ['Visitor', 'Returning'], ['Landing page', '/']];
const DEVICE = [['Device', 'Desktop'], ['Browser', 'Safari 26'], ['Platform', 'macOS'], ['Resolution', '1512×779'], ['Language', 'en-US']];
const LOCATION = [['Country', 'Bangladesh'], ['Region', 'Dhaka Division'], ['City', 'Dhaka'], ['ZIP', '1230']];

function Shell({ children, page }) {
  return (
    <div className="dc-screen ds" data-screen="OrderDetail">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="orders-all" />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb="Orders / All orders" page={page} />
          {children}
        </main>
      </div>
    </div>
  );
}

export default function OrderDetail() {
  const [ready, setReady] = useState(false);
  const [id, setId] = useState('');
  const [back, setBack] = useState('/merchant-orders');
  const [tick, setTick] = useState(0);
  const [action, setAction] = useState('Approve');
  const [place, setPlace] = useState(DEFAULT_HOLD_PLACE);
  const holdPlaces = usePlaceList('stock');   // live places after mount (built-in list first)
  const [courier, setCourier] = useState(COURIERS[0]);
  const [reason, setReason] = useState(RTO_REASONS[0]);
  const [holdOpen, setHoldOpen] = useState(false);     // hold stock for an order approved without a hold
  const [blocked, setBlocked] = useState(false);
  const [tracking, setTracking] = useState(true);
  const [comment, setComment] = useState(null);        // text of the comment being written, null when closed
  const [tags, setTags] = useState(['call-first']);
  const [tagText, setTagText] = useState('');

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setId(p.get('id') || DEFAULT_ID);
    // Return to the list view the user came from (tab, filters, page). Only same-site list URLs are accepted.
    const from = p.get('from');
    if (from && /^\/merchant-orders(\?|$)/.test(from)) setBack(from);
    setReady(true);
  }, []);

  const all = useMemo(() => (ready ? getOrders() : []), [ready, tick]);
  const o = all.find((x) => x.id === id) || null;
  const holds = useMemo(() => (o ? holdsOfOrder(o.id) : []), [o, tick]);
  const refresh = () => setTick((t) => t + 1);

  useEffect(() => {
    if (!o) return;
    // open on the action that fits the order's status
    setAction(CAN_APPROVE.includes(o.statusKey) ? 'Approve' : CAN_DELIVER.includes(o.statusKey) ? 'Mark delivered' : o.statusKey === 'returned' ? 'Courier return' : 'Approve');
    setPlace(holdPlaceOf(o.id));
    if (COURIERS.includes(o.courier)) setCourier(o.courier);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [o && o.id]);

  if (!ready || !o) {
    return (
      <Shell page="Order">
        <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px' }}>
          {ready ? <><h1 className="sr-only">Order not found</h1><EmptyState icon="file-x" title="This order was not found" body={`There is no order ${id} in this browser.`} /><p style={{ textAlign: 'center' }}><Link href={back} className="gc-btn gc-btn--soft">Back to orders</Link></p></> : null}
        </div>
      </Shell>
    );
  }

  const status = orderStatus(o.statusKey) || { label: o.status, tone: 'neutral', icon: 'circle' };
  const pay = PAYMENTS[o.payment] || PAYMENTS.COD;
  const stepAt = ORDER_STEPS.indexOf(o.statusKey);
  const offPath = stepAt < 0;
  const dups = duplicatesOf(o, all);
  const open = holds.filter((h) => h.status === 'held');
  const places = [...new Set(holds.map((h) => h.place))].map((pl) => ({ place: pl, list: holds.filter((h) => h.place === pl), held: units(holds.filter((h) => h.place === pl && h.status === 'held')) }));
  const stock = availability(o.lines, place);
  const short = stock.filter((x) => x.short);
  const record = courierHistory(o.phone);
  const samePhone = digitsOf(o.phone).length >= 10 ? all.filter((x) => digitsOf(x.phone) === digitsOf(o.phone)) : [o];
  const openOrders = samePhone.filter((x) => ['pending', 'approved', 'ready'].includes(x.statusKey)).length;
  const adj = o.amount - o.subtotal - (o.shipping || 0);
  const due = o.paid == null ? null : Math.max(0, o.amount - o.paid);
  const returnRef = o.invoiceId || o.id;
  const rto = o.statusKey === 'returned' && !isCounterSale(o) ? rtoState(o) : null;
  const counter = isCounterSale(o);
  const activity = [
    ...logOf(o.id),
    { at: o.at, icon: counter ? 'store' : 'shopping-bag', title: counter ? 'Sold at the counter' : 'Order placed', meta: o.channel },
  ];

  // ---- actions -------------------------------------------------------------------------------
  const approve = () => {
    approveOrder(o, place);
    refresh();
    toast(`Order ${o.id} approved · ${units(o.lines)} pcs held at ${place}${short.length ? ` · ${short.length} short, restock before packing` : ''}`);
  };
  const holdStock = (e) => {
    e.preventDefault();
    holdOrderStock(o, place, 'Held from the order page');
    logOrder(o.id, 'lock', 'Stock held', `${place} · Staff`);
    setHoldOpen(false); refresh();
    toast(`Stock for ${o.id} is held at ${place}`);
  };
  const askCancel = async (why) => {
    const held = holdsFor(o.id);
    const ok = await confirmDialog({
      title: why ? `Cancel ${o.id} as a duplicate?` : `Cancel order ${o.id}?`,
      body: `${o.customer} is told by SMS. ` + (held.length ? `These held items go back to stock: ${heldText(held)}.` : 'No stock is held for this order.'),
      confirmLabel: 'Cancel order', cancelLabel: 'Keep order', tone: 'danger',
    });
    if (!ok) return;
    const ended = cancelOrder(o, why || 'Order cancelled');
    refresh();
    toast(`Order ${o.id} cancelled${ended.length ? ` · ${units(ended)} pcs back in stock` : ''}`);
  };
  const askMerge = async (target) => {
    const held = holdsFor(o.id);
    const ok = await confirmDialog({
      title: `Merge ${o.id} into ${target.id}?`,
      body: `${o.lines.map((l) => `${l.name} × ${l.qty}`).join(', ')} move to ${target.id} (delivery is charged once), then ${o.id} is cancelled. `
        + (held.length ? `Its held items go back to stock: ${heldText(held)}.` : 'No stock is held for it.'),
      confirmLabel: 'Merge and cancel', tone: 'danger',
    });
    if (!ok) return;
    mergeInto(o, target);
    toast(`${o.id} merged into ${target.id} and cancelled`);
    navigate(orderHref(target.id, encodeURIComponent(back)));
    setId(target.id); refresh();
  };
  const putOnHold = () => {
    logOrder(o.id, 'pause-circle', 'Order put on hold', 'Held back from courier pushes · Staff');
    refresh();
    toast(`Order ${o.id} is on hold · it stays out of courier pushes until released`);
  };
  const deliver = async () => {
    const ok = await confirmDialog({ title: `Mark ${o.id} as delivered?`, body: `The held items leave the stock: ${open.length ? heldText(open) : 'nothing is held'}.`, confirmLabel: 'Mark delivered' });
    if (!ok) return;
    deliverOrder(o); refresh();
    toast(`Order ${o.id} delivered`);
  };
  const returning = () => {
    markReturned(o, reason); refresh();
    toast(`${o.id} marked as returned by ${o.courier}. Book it in at Courier returns when it arrives.`);
  };
  const toggleBlock = async () => {
    if (blocked) { setBlocked(false); toast(o.customer + ' unblocked', { tone: 'info' }); return; }
    const ok = await confirmDialog({ title: 'Block this customer?', body: `${o.customer} (${o.phone}) will not be able to place new orders, and order ${o.id} is held back from courier pushes.`, confirmLabel: 'Block customer', tone: 'danger' });
    if (!ok) return;
    setBlocked(true);
    toast(o.customer + ' blocked', { undo: () => setBlocked(false) });
  };
  const saveComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    logOrder(o.id, 'message-square', 'Comment', comment.trim() + ' · Staff');
    setComment(null); refresh();
    toast('Comment added');
  };
  const addTag = () => { const t = tagText.trim(); if (t && !tags.includes(t)) setTags([...tags, t]); setTagText(''); };

  const panel = {
    Approve: CAN_APPROVE.includes(o.statusKey) ? (
      <>
        <h3>Approve order for delivery</h3>
        <p>Pick where the stock is held. The items stay held there until the order is delivered, cancelled or comes back.</p>
        <div className="od-two">
          <div><label className="gc-label" htmlFor="od-place">Hold stock from</label><select id="od-place" className="gc-input gc-select" value={place} onChange={(e) => setPlace(e.target.value)}>{holdPlaces.map((x) => <option key={x}>{x}</option>)}</select></div>
          <div><label className="gc-label" htmlFor="od-courier">Courier</label><select id="od-courier" className="gc-input gc-select" value={courier} onChange={(e) => setCourier(e.target.value)}>{COURIERS.map((x) => <option key={x}>{x}</option>)}</select></div>
        </div>
        <div className="gc-table-wrap">
          <table className="gc-table gc-table--compact">
            <caption className="sr-only">Free stock at {place}</caption>
            <thead><tr><th scope="col">Item</th><th scope="col" className="od-num">Ordered</th><th scope="col" className="od-num">Free at {place}</th></tr></thead>
            <tbody>{stock.map((x) => <tr key={x.name}><td className="od-strong">{x.name}{!x.known ? <span className="od-sub">Not in the stock list</span> : null}</td><td className="od-num">{x.qty}</td><td className={'od-num' + (x.short ? ' od-short' : '')}>{x.known ? x.available : '—'}</td></tr>)}</tbody>
          </table>
        </div>
        {short.length ? <p className="gc-help gc-help--error" style={{ margin: 0 }}>{short.map((x) => x.name).join(', ')} {short.length === 1 ? 'is' : 'are'} short at {place}. Pick another place or restock before packing.</p> : null}
        <button type="button" className="gc-btn gc-btn--solid gc-btn--block" onClick={approve}>Approve and hold stock</button>
      </>
    ) : <><h3>Approve order</h3><p>Only Pending orders can be approved. This order is {status.label}.</p></>,
    Hold: (
      <>
        <h3>Put order on hold</h3>
        <p>The order stays in the pipeline but is kept out of courier pushes until you release it. Held stock stays held.</p>
        <button type="button" className="gc-btn gc-btn--solid gc-btn--block" disabled={!CAN_CANCEL.includes(o.statusKey)} onClick={putOnHold}>Hold order</button>
      </>
    ),
    Cancel: CAN_CANCEL.includes(o.statusKey) ? (
      <>
        <h3>Cancel this order</h3>
        <p>{open.length ? `These held items go back to stock: ${heldText(open)}.` : 'No stock is held for this order.'} The customer is told by SMS.</p>
        <button type="button" className="gc-btn gc-btn--solid gc-btn--error gc-btn--block" onClick={() => askCancel('')}>Cancel order</button>
      </>
    ) : <><h3>Cancel order</h3><p>{o.statusKey === 'cancelled' ? 'This order is already cancelled.' : `A ${status.label.toLowerCase()} order cannot be cancelled. Use Return for items that came back.`}</p></>,
    'Mark delivered': CAN_DELIVER.includes(o.statusKey) ? (
      <>
        <h3>Mark as delivered</h3>
        <p>Closes the order. The held items leave the stock{open.length ? `: ${heldText(open)}` : ''}.</p>
        <button type="button" className="gc-btn gc-btn--solid gc-btn--success gc-btn--block" onClick={deliver}>Mark as delivered</button>
      </>
    ) : <><h3>Mark as delivered</h3><p>Only approved, packed or shipped orders can be marked delivered. This order is {status.label}.</p></>,
    'Courier return': rto ? (
      <>
        <h3>Courier return</h3>
        <p>{rto.left ? `${rto.left} of ${rto.sent} pcs are still with ${o.courier}.` : `All ${rto.sent} pcs are back.`} {o.rtoReason ? `Reason: ${o.rtoReason}.` : ''}</p>
        <Link href={'/courier-returns?id=' + encodeURIComponent(o.id)} className="gc-btn gc-btn--solid gc-btn--block"><Icon name="package-open" width="18" height="18" aria-hidden="true" /> {rto.left ? 'Receive the parcel' : 'See what came back'}</Link>
      </>
    ) : CAN_RETURN.includes(o.statusKey) && !counter ? (
      <>
        <h3>Courier is returning the parcel</h3>
        <p>The order moves to Returned and shows in Courier returns. The held stock stays held until the parcel is received.</p>
        <div><label className="gc-label" htmlFor="od-rto">Reason</label><select id="od-rto" className="gc-input gc-select" value={reason} onChange={(e) => setReason(e.target.value)}>{RTO_REASONS.map((x) => <option key={x}>{x}</option>)}</select></div>
        <button type="button" className="gc-btn gc-btn--solid gc-btn--error gc-btn--block" onClick={returning}>Mark as returned</button>
      </>
    ) : <><h3>Courier return</h3><p>Only packed or shipped online orders can be returned by the courier. {counter ? 'For a counter sale use Return.' : `This order is ${status.label}.`}</p></>,
  };

  return (
    <Shell page={'Order ' + o.id}>
      <div className="od-bar">
        <Link href={back} className="od-back" aria-label="Back to all orders"><Icon name="arrow-left" width="18" height="18" /></Link>
        <h1 className="od-title">Order {o.id}</h1>
        <StatusBadge tone={status.tone} icon={status.icon}>{status.label}</StatusBadge>
        <StatusBadge tone={pay[0]} icon={pay[1]}>{o.payment}</StatusBadge>
        {dups.length ? <span className="gc-badge gc-badge--warning">Possible duplicate</span> : null}
        {blocked ? <StatusBadge tone="error" icon="ban">Customer blocked</StatusBadge> : null}
        <span className="od-meta">Placed {o.placed} · {o.channel}</span>
        <div className="od-bar__actions">
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => toast('Auto call queued to ' + o.phone + ' (attempt 1 of 3)', { tone: 'info' })}><Icon name="phone-call" width="16" height="16" aria-hidden="true" /> Auto call</button>
          <Link href={'/return-exchange?ref=' + encodeURIComponent(returnRef)} className="gc-btn gc-btn--sm gc-btn--neutral"><Icon name="undo-2" width="16" height="16" aria-hidden="true" /> Return</Link>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => toast('Invoice for order ' + o.id + ' sent to the printer', { tone: 'info' })}><Icon name="printer" width="16" height="16" aria-hidden="true" /> Print invoice</button>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => toast('POS receipt for order ' + o.id + ' sent to the printer', { tone: 'info' })}><Icon name="receipt" width="16" height="16" aria-hidden="true" /> Print POS</button>
        </div>
      </div>

      <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {dups.length ? (
          <div className="gc-alert gc-alert--soft gc-alert--warning od-dup" role="alert">
            {dups.map((d) => {
              const same = o.lines.filter((l) => d.lines.some((x) => x.name === l.name)).map((l) => l.name);
              const canMerge = CAN_CANCEL.includes(o.statusKey) && CAN_CANCEL.includes(d.statusKey) && !isCounterSale(d) && !d.isInvoice;
              return (
                <div key={d.id} className="od-dup__row">
                  <Icon name="copy" width="18" height="18" aria-hidden="true" />
                  <p><b>Possible duplicate of <Link href={orderHref(d.id, encodeURIComponent(back))} className="od-id">{d.id}</Link></b> · same phone {o.phone} and {same.join(', ')} · {d.status}, placed {minutesApart(o.at, d.at)}.</p>
                  {CAN_CANCEL.includes(o.statusKey) ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => askCancel('Cancelled as a duplicate of ' + d.id)}>Cancel as duplicate</button> : null}
                  {canMerge ? <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => askMerge(d)}>Merge into {d.id}</button> : null}
                </div>
              );
            })}
          </div>
        ) : null}

        <div className="od-grid">
          <div className="od-col">
            <section className="gc-card od-card">
              <div className="od-card__head">
                <div><h2>Order status</h2><p>{offPath ? (o.statusKey === 'cancelled' ? 'This order was cancelled.' : o.statusKey === 'returned' ? `Returned by the courier${o.rtoReason ? ': ' + o.rtoReason.toLowerCase() : ''}.` : status.label) : 'Track the current fulfilment stage'}</p></div>
                <button type="button" className={'gc-btn gc-btn--sm ' + (blocked ? 'gc-btn--solid gc-btn--error' : 'gc-btn--neutral')} onClick={toggleBlock} aria-pressed={blocked}><Icon name="ban" width="15" height="15" aria-hidden="true" /> {blocked ? 'Blocked · Unblock' : 'Quick block'}</button>
              </div>
              <div className="od-card__body">
                <ol className="od-steps" aria-label="Order progress" style={{ '--steps': ORDER_STEPS.length }}>
                  {ORDER_STEPS.map((key, i) => {
                    const info = orderStatus(key);
                    const state = offPath ? 'todo' : i < stepAt ? 'done' : i === stepAt ? 'current' : 'todo';
                    return (
                      <li key={key} className={'od-step od-step--' + state} aria-current={state === 'current' ? 'step' : undefined}>
                        <span className="od-step__dot"><Icon name={state === 'done' ? 'check' : state === 'current' ? 'clock' : info.icon} width="16" height="16" aria-hidden="true" /></span>
                        <p className="od-step__label">{info.label}<span className="sr-only"> ({state === 'done' ? 'Completed' : state === 'current' ? 'Current step' : 'Not started'})</span></p>
                        <p className="od-step__note">{state === 'current' ? (key === 'pending' ? 'Since ' + o.placed : 'In progress') : state === 'done' ? 'Done' : STEP_NOTES[key]}</p>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </section>

            <section className="gc-card od-card">
              <div className="od-card__head">
                <h2>Order items <span className="gc-badge gc-badge--primary">{o.units} {o.units === 1 ? 'item' : 'items'}</span></h2>
                <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => toast('Changing the items of a placed order is not in this demo. Cancel it and create a new order instead.', { tone: 'info' })}><Icon name="pencil" width="15" height="15" aria-hidden="true" /> Update items</button>
              </div>
              <div className="gc-table-wrap">
                <table className="gc-table gc-table--compact">
                  <thead><tr><th scope="col">Item</th><th scope="col" className="od-num">Qty</th><th scope="col" className="od-num">Unit price</th><th scope="col" className="od-num">Amount</th></tr></thead>
                  <tbody>{o.lines.map((l, i) => { const p = productBy(l.name); return <tr key={l.name + i}><td className="od-strong">{l.name}<span className="od-sub">{[l.variant || (p && p.variant), p && p.sku].filter(Boolean).join(' · ') || 'Custom item'}</span></td><td className="od-num">{l.qty}</td><td className="od-num">{formatBDT(l.price)}</td><td className="od-num od-strong">{formatBDT(l.price * l.qty)}</td></tr>; })}</tbody>
                </table>
              </div>
              <dl className="od-sum">
                <dt>Products ({o.units} {o.units === 1 ? 'item' : 'items'})</dt><dd>{formatBDT(o.subtotal)}</dd>
                {o.shipping ? <><dt>Delivery · {o.zone}</dt><dd>{formatBDT(o.shipping)}</dd></> : null}
                {adj > 0 ? <><dt>VAT and charges</dt><dd>{formatBDT(adj)}</dd></> : adj < 0 ? <><dt>Discount</dt><dd>−{formatBDT(-adj)}</dd></> : null}
                <dt>Paid by customer</dt><dd>{o.paid == null ? 'Partly paid' : formatBDT(o.paid)}</dd>
                <dt className="is-total">{due === 0 ? 'Total' : 'Total due'}</dt><dd className="is-total">{formatBDT(due == null || due === 0 ? o.amount : due)}</dd>
              </dl>
            </section>

            <section className="gc-card od-card" aria-labelledby="od-holds">
              <div className="od-card__head">
                <div><h2 id="od-holds"><Icon name="lock" width="17" height="17" aria-hidden="true" />Stock held for this order</h2><p>{open.length ? `${units(open)} pcs on hold at ${[...new Set(open.map((h) => h.place))].join(', ')}` : 'Nothing is on hold right now'}</p></div>
                <span style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  {!open.length && ['approved', 'ready'].includes(o.statusKey) && !counter ? <button type="button" className="gc-btn gc-btn--sm gc-btn--soft" onClick={() => setHoldOpen(true)}><Icon name="lock" width="15" height="15" aria-hidden="true" /> Hold stock</button> : null}
                  <Link href="/stock-holds" className="gc-btn gc-btn--sm gc-btn--neutral">Stock holds</Link>
                </span>
              </div>
              <div className="od-card__body">
                {places.length === 0 ? <p className="od-sub" style={{ margin: 0 }}>{o.statusKey === 'pending' ? 'Stock is held when the order is approved. You choose the place then.' : 'No stock was held for this order.'}</p> : places.map((g) => (
                  <div key={g.place} className="od-place">
                    <div className="od-place__head"><span className="od-strong">{g.place}</span><span className="od-sub">{g.held ? `${g.held} pcs on hold` : 'Nothing on hold now'}</span></div>
                    <div className="gc-table-wrap">
                      <table className="gc-table gc-table--compact">
                        <thead><tr><th scope="col">Item</th><th scope="col" className="od-num">Pcs</th><th scope="col">Status</th><th scope="col">Since</th></tr></thead>
                        <tbody>{g.list.map((h) => (
                          <tr key={h.id}>
                            <td className="od-strong">{h.product}<span className="od-sub od-id">{h.id}</span></td>
                            <td className="od-num od-strong">{h.qty}</td>
                            <td><span className={'gc-badge gc-badge--' + HOLD_STATUS[h.status][1]}>{HOLD_STATUS[h.status][0]}</span>{h.note ? <span className="od-sub">{h.note}</span> : null}</td>
                            <td>{formatDate(h.at)}<span className="od-sub">{formatTime(h.at)} · {h.by}</span></td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="gc-card od-card" aria-labelledby="od-admin">
              <div className="od-card__head"><div><h2 id="od-admin"><Icon name="shield-check" width="17" height="17" aria-hidden="true" />Admin management</h2><p>{samePhone.length} {samePhone.length === 1 ? 'order' : 'orders'} from this phone number · {openOrders} open</p></div></div>
              <div className="od-card__body">
                <div className="od-box">
                  <h3>Courier delivery history</h3>
                  {record && record.total ? (
                    <div className="od-stats">
                      <div className="od-stat"><span>Parcels</span><b>{record.total}</b></div>
                      <div className="od-stat"><span>Delivered</span><b>{record.delivered}</b></div>
                      <div className="od-stat"><span>Returned</span><b>{record.returned}</b></div>
                      <div className="od-stat"><span>Success</span><b>{record.rate}%</b></div>
                    </div>
                  ) : <p className="od-sub" style={{ margin: 0 }}>{record ? `No parcels to ${o.phone} with the connected couriers yet.` : 'No mobile number to check.'}</p>}
                  {record && record.couriers.length ? <p className="od-sub" style={{ margin: 'var(--space-2) 0 0' }}>{record.couriers.map((c) => `${c.name}: ${c.delivered} of ${c.total} delivered`).join(' · ')}</p> : null}
                </div>
                <div className="od-seg" role="group" aria-label="Order action">
                  {ACTIONS.map((k) => <button key={k} type="button" aria-pressed={action === k} onClick={() => setAction(k)}>{k}</button>)}
                </div>
                <div className="od-panel">{panel[action]}</div>
              </div>
            </section>

            <section className="gc-card od-card">
              <div className="od-card__head"><h2><Icon name="activity" width="17" height="17" aria-hidden="true" />Tracking details</h2><button type="button" className="od-linkbtn" aria-expanded={tracking} onClick={() => setTracking(!tracking)}>{tracking ? 'Hide summary' : 'Show summary'}</button></div>
              {tracking ? (
                <div className="od-card__body">
                  {counter ? <p className="od-sub" style={{ margin: 0 }}>Counter sale · no storefront session.</p> : (
                    <div className="od-kvs">
                      {[['Attribution & campaign', ATTRIBUTION], ['Session', SESSION], ['Device & browser', DEVICE], ['Location', LOCATION]].map(([title, rows]) => (
                        <div key={title} className="od-box"><h3>{title}</h3><dl className="od-kv">{rows.map(([k, v]) => <React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>)}</dl></div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </section>

            <section className="gc-card od-card">
              <div className="od-card__head"><h2><Icon name="history" width="17" height="17" aria-hidden="true" />Activity</h2><button type="button" className="od-linkbtn" onClick={() => setComment('')}>Add a comment</button></div>
              <div className="od-card__body">
                <div className="od-log">
                  {activity.map((e, i) => (
                    <div key={i} className="od-log__row">
                      <span className="od-log__icon"><Icon name={e.icon} width="15" height="15" aria-hidden="true" /></span>
                      <span style={{ minWidth: 0 }}><span className="od-strong" style={{ display: 'block', fontSize: 'var(--text-sm)' }}>{e.title}</span><span className="od-sub">{formatDate(e.at)}, {formatTime(e.at)}{e.meta ? ' · ' + e.meta : ''}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <aside className="od-col">
            <section className="gc-card od-card">
              <div className="od-card__head"><h2>Customer</h2>{blocked ? <StatusBadge tone="error" icon="ban">Blocked</StatusBadge> : null}</div>
              <div className="od-card__body">
                <div className="od-who">
                  <span className="od-avatar" aria-hidden="true">{o.initials}</span>
                  <span style={{ minWidth: 0 }}><span className="od-strong" style={{ display: 'block' }}>{o.customer}</span><span className="od-sub od-id">{o.phone}</span><span className="od-sub">{samePhone.length > 1 ? `${samePhone.length} orders from this number` : 'First order from this number'}</span></span>
                </div>
                {digitsOf(o.phone).length >= 10 ? (
                  <div className="od-contact">
                    <a className="gc-btn gc-btn--sm gc-btn--neutral" href={'tel:' + digitsOf(o.phone)}>Call</a>
                    <a className="gc-btn gc-btn--sm gc-btn--neutral" href={'https://wa.me/88' + digitsOf(o.phone)} target="_blank" rel="noreferrer">WhatsApp</a>
                    <a className="gc-btn gc-btn--sm gc-btn--neutral" href={'sms:' + digitsOf(o.phone)}>SMS</a>
                  </div>
                ) : <p className="od-sub" style={{ margin: 0 }}>No mobile number on this order.</p>}
              </div>
            </section>

            <section className="gc-card od-card">
              <div className="od-card__head"><h2><Icon name="file-text" width="16" height="16" aria-hidden="true" />Order and invoice</h2></div>
              <div className="od-card__body">
                <dl className="od-kv">
                  <dt>Order no.</dt><dd className="od-id">{o.id}</dd>
                  <dt>{o.invoiceKind || 'Invoice'}</dt><dd>{o.invoiceId ? <Link href={invoiceHref(o.invoiceId)} className="od-id">{o.invoiceId}</Link> : 'Not made yet'}</dd>
                  <dt>Channel</dt><dd>{o.channel}</dd>
                  <dt>Courier</dt><dd>{o.courier}{o.consignment !== '—' ? <span className="od-sub od-id">{o.consignment}</span> : null}</dd>
                  <dt>Stock</dt><dd>{open.length ? `Held at ${[...new Set(open.map((h) => h.place))].join(', ')}` : 'Not held'}</dd>
                </dl>
                <Link href={'/return-exchange?ref=' + encodeURIComponent(returnRef)} className="gc-btn gc-btn--sm gc-btn--neutral gc-btn--block"><Icon name="undo-2" width="16" height="16" aria-hidden="true" /> Return or exchange items</Link>
                {rto ? <Link href={'/courier-returns?id=' + encodeURIComponent(o.id)} className="gc-btn gc-btn--sm gc-btn--soft gc-btn--block"><Icon name="package-open" width="16" height="16" aria-hidden="true" /> Courier return · {rto.left ? `${rto.left} pcs still with courier` : 'all back'}</Link> : null}
              </div>
            </section>

            <section className="gc-card od-card">
              <div className="od-card__head"><h2><Icon name="map-pin" width="16" height="16" aria-hidden="true" />Shipping address</h2><span className="gc-badge gc-badge--success">{o.zone}</span></div>
              <div className="od-card__body"><p className="od-addr">{o.address || (counter ? 'Counter sale · no delivery' : 'No address on this order')}</p></div>
            </section>

            {!counter ? (
              <section className="gc-card od-card">
                <div className="od-card__head"><h2><Icon name="shield-check" width="16" height="16" aria-hidden="true" />Order verification</h2><span className="gc-badge gc-badge--success">Low risk</span></div>
                <div className="od-card__body">
                  <p className="od-addr">Dhaka, Dhaka Division, BD<span className="od-sub od-id">104.28.117.2 · Cloudflare AS13335</span></p>
                  <div className="od-tags"><span className="gc-badge gc-badge--slate">Desktop</span><span className="gc-badge gc-badge--slate">Direct</span><span className="gc-badge gc-badge--warning">1 min session</span><span className="gc-badge gc-badge--slate">Returning</span></div>
                </div>
              </section>
            ) : null}

            <section className="gc-card od-card">
              <div className="od-card__head"><h2><Icon name="sticky-note" width="16" height="16" aria-hidden="true" />Notes</h2></div>
              <div className="od-card__body">
                <div><label className="gc-label" htmlFor="od-note">Order note</label><textarea id="od-note" className="gc-input" rows="2" placeholder="Visible to courier and on the invoice" /></div>
                <div><label className="gc-label" htmlFor="od-inote">Internal note</label><textarea id="od-inote" className="gc-input" rows="2" placeholder="Only staff can read this" /></div>
              </div>
            </section>

            <section className="gc-card od-card">
              <div className="od-card__head"><h2><Icon name="tag" width="16" height="16" aria-hidden="true" />Tags</h2></div>
              <div className="od-card__body">
                {tags.length ? <div className="od-tags">{tags.map((t) => <span key={t} className="od-tag">{t}<button type="button" aria-label={'Remove tag ' + t} onClick={() => setTags(tags.filter((x) => x !== t))}><Icon name="x" width="12" height="12" /></button></span>)}</div> : null}
                <input className="gc-input" aria-label="Type a tag and press Enter" placeholder="Type a tag and press Enter" value={tagText} onChange={(e) => setTagText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
              </div>
            </section>
          </aside>
        </div>
      </div>

      <Dialog open={holdOpen} title={`Hold stock · ${o.id}`} onClose={() => setHoldOpen(false)} width={480}>
        <form onSubmit={holdStock} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p className="gc-help" style={{ margin: 0 }}>The items are set aside for {o.customer} until the order is delivered, cancelled or comes back.</p>
          <div><label className="gc-label" htmlFor="od-hold-place">Hold stock from</label><select id="od-hold-place" className="gc-input gc-select" data-autofocus value={place} onChange={(e) => setPlace(e.target.value)}>{holdPlaces.map((x) => <option key={x}>{x}</option>)}</select></div>
          <p className="gc-help" style={{ margin: 0 }}>{stock.map((x) => `${x.name}: ${x.qty} needed, ${x.known ? x.available + ' free' : 'not in the stock list'}`).join(' · ')}</p>
          <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setHoldOpen(false)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid">Hold stock</button></div>
        </form>
      </Dialog>

      <Dialog open={comment != null} title="Add a comment" onClose={() => setComment(null)} width={440}>
        <form onSubmit={saveComment} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div><label className="gc-label" htmlFor="od-comment">Comment</label><textarea id="od-comment" className="gc-input" rows="3" data-autofocus value={comment || ''} onChange={(e) => setComment(e.target.value)} placeholder="Only staff can see it" /></div>
          <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setComment(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid" disabled={!(comment || '').trim()}>Add comment</button></div>
        </form>
      </Dialog>
    </Shell>
  );
}
