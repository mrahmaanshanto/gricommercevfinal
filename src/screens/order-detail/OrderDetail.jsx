'use client';
// OrderDetail — one order in full, opened from Orders (/order-detail?id=<order no>): the steps (New order →
// Verification → Approved → Ready for courier → In transit → Delivered), the next step's card (verify by call,
// approve / take advance + approve / cancel, prepare the parcel, send to courier, courier updates), courier
// tracking, the order's messages (notifications.js), items, stock held, activity.
// Front end only: the order comes from src/lib/orders.js; the steps are src/lib/orderFlow.js.
// Text stays short and plain (Shopify style).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Dialog, EmptyState, StatusBadge } from '@/components/ui';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { ORDER_STEPS, STEP_LABEL, NEW_KEYS, orderStatus, isNewOrder } from '@/lib/orderStatus';
import { usePlaceList } from '@/lib/usePlaces';
import { productBy } from '@/lib/stock';
import { holdsFor } from '@/lib/stockHolds';
import { courierHistory } from '@/lib/orderLinks';
import {
  getOrders, findOrder, duplicatesOf, holdsOfOrder, heldText, availability, approveOrder, holdOrderStock, cancelOrder, mergeInto,
  logOrder, logOf, rtoState, invoiceHref, orderHref, isCounterSale, holdPlaceOf,
  CAN_CANCEL, DEFAULT_HOLD_PLACE,
} from '@/lib/orders';
import {
  verifyOf, startAutoCall, settleAutoCall, recordCall, CALL_RESULTS, callResultLabel, requestAdvance, receiveAdvance, ADVANCE_METHODS,
  COURIERS, courierCharge, prepOf, prepDone, updatePrep, markReady, sendToCourier, trackingOf, courierWebhook, syncCourier, HOOK_LABEL,
} from '@/lib/orderFlow';
import { notificationLog, retryNotification, NOTIFY_EVENT } from '@/lib/notifications';
import { clockNow } from '@/lib/settlements';
import { printNode } from '@/lib/printNode';
import { QrCode } from '@/components/QrCode';
import { MERCHANT } from '@/lib/merchant';

const DEFAULT_ID = '#136779';   // what opens when a link carries no order number
const CANCEL_REASONS = ['Customer cancelled', 'No answer', 'Fake order', 'Out of stock', 'Duplicate order', 'Other'];
const PAYMENTS = { Paid: ['success', 'check'], Unpaid: ['error', 'circle-alert'], Partial: ['warning', 'circle-dashed'], COD: ['neutral', 'banknote'] };
const HOLD_STATUS = { held: ['On hold', 'warning'], released: ['Released', 'success'], delivered: ['Delivered', 'slate'], damaged: ['Damaged', 'error'] };
const SEND_STATUS = { Delivered: 'success', Failed: 'error', Skipped: 'slate', Off: 'slate', Sent: 'info' };
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
.od-next{border-color:var(--primary);box-shadow:0 0 0 3px var(--fill-primary-soft)}
.od-line{display:flex;align-items:center;gap:var(--space-2);flex-wrap:wrap;margin:0;font-size:var(--text-sm);color:var(--text-body)}
.od-line b{font-weight:var(--weight-medium);color:var(--text-heading)}
.od-acts{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.od-acts .gc-btn{flex:0 1 auto}
.od-hr{height:1px;margin:0;border:0;background:var(--border-subtle)}
.od-checks{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.od-checks li{display:flex;align-items:center;gap:var(--space-3);min-height:52px;padding:var(--space-2) 0;border-top:1px solid var(--border-subtle)}
.od-checks li:first-child{border-top:0}
.od-checks label{display:flex;align-items:center;gap:var(--space-3);flex:1;min-width:0;cursor:pointer}
.od-checks input[type=checkbox]{width:20px;height:20px;flex:none;accent-color:var(--primary)}
.od-checks label>span{display:flex;flex-direction:column;min-width:0}
.od-checks b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.od-checks small{font-size:var(--text-xs);color:var(--text-muted);overflow-wrap:anywhere}
.od-money{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-2)}
.od-money div{padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.od-money span{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.od-money b{display:block;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
.od-money .is-cod{background:var(--fill-primary-soft)}
.od-time{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.od-time li{position:relative;display:grid;grid-template-columns:12px minmax(0,1fr) auto;gap:var(--space-3);align-items:baseline;padding:0 0 var(--space-4)}
.od-time li::before{content:"";position:absolute;left:5px;top:16px;bottom:0;width:2px;background:var(--border-subtle)}
.od-time li:last-child{padding-bottom:0}
.od-time li:last-child::before{display:none}
.od-time i{width:12px;height:12px;border-radius:var(--radius-full);background:var(--border-strong);transform:translateY(1px)}
.od-time li:first-child i{background:var(--primary);box-shadow:0 0 0 3px var(--fill-primary-soft)}
.od-time b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.od-time span{font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.od-msgs{display:flex;flex-direction:column}
.od-msg{display:grid;grid-template-columns:32px minmax(0,1fr) auto;gap:var(--space-3);align-items:center;padding:var(--space-3) 0;border-top:1px solid var(--border-subtle)}
.od-msg:first-child{border-top:0}
.od-msg__ic{display:grid;place-items:center;width:32px;height:32px;border-radius:var(--radius-full);background:var(--surface-subtle);color:var(--text-body)}
.od-msg__main{display:flex;flex-direction:column;min-width:0}
.od-msg__main b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.od-msg__main span{font-size:var(--text-xs);color:var(--text-muted);overflow-wrap:anywhere}
.od-msg__end{display:flex;align-items:center;gap:var(--space-2);flex-wrap:wrap;justify-content:flex-end}
.od-hooks{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.od-demo{padding:var(--space-3);border:1px dashed var(--border-strong);border-radius:var(--radius-lg)}
.od-demo>p{margin:0 0 var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.od-slip{display:none}
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
@media (max-width:640px){
.od-money{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
.od-money .is-cod{grid-column:1 / -1}
.od-msg{grid-template-columns:32px minmax(0,1fr)}
.od-msg__end{grid-column:2;justify-content:flex-start}
/* totals: the line above Total runs across both columns */
.od-sum{column-gap:0}
.od-sum dt{padding-right:var(--space-5)}
/* held stock: the place is a plain heading over its item cards (no box around the cards) */
.od-place{border:0;border-radius:0;overflow:visible}
.od-place__head{flex-wrap:wrap;padding:0 0 var(--space-2);background:none}
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
  const [place, setPlace] = useState(DEFAULT_HOLD_PLACE);
  const holdPlaces = usePlaceList('stock');   // live places after mount (built-in list first)
  const [holdOpen, setHoldOpen] = useState(false);     // hold stock for an order approved without a hold
  const [dlg, setDlg] = useState(null);                // 'approve' | 'advance' | 'cancel' | 'call'
  const [adv, setAdv] = useState({ amount: '', method: 'bkash online' });
  const [cancel, setCancel] = useState({ reason: CANCEL_REASONS[0], tell: true });
  const [call, setCall] = useState({ result: 'confirmed', note: '' });
  const [lastHook, setLastHook] = useState(null);      // the last courier update, to send it again (it is ignored)
  const [blocked, setBlocked] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [comment, setComment] = useState(null);        // text of the comment being written, null when closed
  const [tags, setTags] = useState(['call-first']);
  const [tagText, setTagText] = useState('');
  const slipRef = React.useRef(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setId(p.get('id') || DEFAULT_ID);
    // Return to the list view the user came from (tab, filters, page). Only same-site list URLs are accepted.
    const from = p.get('from');
    if (from && /^\/merchant-orders(\?|$)/.test(from)) setBack(from);
    syncCourier();   // courier updates that came in while away
    setReady(true);
    const again = () => setTick((t) => t + 1);
    window.addEventListener(NOTIFY_EVENT, again);
    return () => window.removeEventListener(NOTIFY_EVENT, again);
  }, []);

  const all = useMemo(() => (ready ? getOrders() : []), [ready, tick]);
  const o = all.find((x) => x.id === id) || null;
  const holds = useMemo(() => (o ? holdsOfOrder(o.id) : []), [o, tick]);
  const refresh = () => setTick((t) => t + 1);
  const v = o ? verifyOf(o) : null;

  useEffect(() => {
    if (!o) return;
    setPlace(holdPlaceOf(o.id));
    setAdv((a) => ({ ...a, amount: String(o.shipping || 200) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [o && o.id]);

  // an automatic call answers by itself after a few seconds
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

  if (!ready || !o) {
    return (
      <Shell page="Order">
        <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px' }}>
          {ready ? <><h1 className="sr-only">Order not found</h1><EmptyState icon="file-x" title="Order not found" body={`There is no order ${id}.`} /><p style={{ textAlign: 'center' }}><Link href={back} className="gc-btn gc-btn--soft">Back to orders</Link></p></> : null}
        </div>
      </Shell>
    );
  }

  const status = orderStatus(o.statusKey) || { label: o.status, tone: 'neutral', icon: 'circle' };
  const pay = PAYMENTS[o.payment] || PAYMENTS.COD;
  const isNew = isNewOrder(o.statusKey);
  const offPath = ['cancelled', 'returned'].includes(o.statusKey);
  const dups = duplicatesOf(o, all);
  const open = holds.filter((h) => h.status === 'held');
  const places = [...new Set(holds.map((h) => h.place))].map((pl) => ({ place: pl, list: holds.filter((h) => h.place === pl), held: units(holds.filter((h) => h.place === pl && h.status === 'held')) }));
  const stock = availability(o.lines, place);
  const short = stock.filter((x) => x.short);
  const record = courierHistory(o.phone);
  const samePhone = digitsOf(o.phone).length >= 10 ? all.filter((x) => digitsOf(x.phone) === digitsOf(o.phone)) : [o];
  const openOrders = samePhone.filter((x) => [...NEW_KEYS, 'approved', 'ready'].includes(x.statusKey)).length;
  const adj = o.amount - o.subtotal - (o.shipping || 0);
  const due = o.paid == null ? null : Math.max(0, o.amount - o.paid);
  const paid = o.paid || 0;
  const cod = o.codAmount != null ? o.codAmount : Math.max(0, o.amount - paid);
  const returnRef = o.invoiceId || o.id;
  const rto = o.statusKey === 'returned' && !isCounterSale(o) ? rtoState(o) : null;
  const counter = isCounterSale(o) || o.isInvoice;
  const prep = prepOf(o);
  const track = trackingOf(o);
  const msgs = counter ? [] : notificationLog(o);
  const activity = [
    ...logOf(o.id),
    { at: o.at, icon: counter ? 'store' : 'shopping-bag', title: counter ? 'Sold at the counter' : 'Order placed', meta: o.channel },
  ];
  const advNum = Math.round(Number(adv.amount) || 0);
  const advOk = advNum > 0 && advNum < o.amount - paid;

  // ---- the steps ------------------------------------------------------------------------------------------
  const reached = {
    new: true,
    verified: (v && v.state === 'confirmed') || (!isNew && !offPath) || (offPath && v && v.state === 'confirmed'),
    approved: ['approved', 'ready', 'shipped', 'delivered'].includes(o.statusKey) || (o.statusKey === 'returned'),
    ready: ['ready', 'shipped', 'delivered'].includes(o.statusKey) || (o.statusKey === 'returned'),
    shipped: ['shipped', 'delivered'].includes(o.statusKey) || (o.statusKey === 'returned'),
    delivered: o.statusKey === 'delivered',
  };
  const nextStep = offPath ? null : ORDER_STEPS.find((k) => !reached[k]) || null;
  const t = o.times || {};
  const when = (x) => (x ? formatTime(x) + ', ' + formatDate(x) : '');
  const stepNote = {
    new: isNew ? status.label : formatDate(o.at),
    verified: v ? (v.state === 'calling' ? 'Calling…' : `${callResultLabel(v.state)} · ${v.method === 'auto' ? 'Auto call' : 'Call'}`) : 'Not yet',
    approved: t.approved ? when(t.approved) : '',
    ready: t.ready ? when(t.ready) : '',
    shipped: t.shipped ? o.courier : '',
    delivered: t.delivered ? when(t.delivered) : '',
  };

  // ---- actions -------------------------------------------------------------------------------
  const autoCall = () => { startAutoCall(o); refresh(); toast('Calling ' + o.customer + '…', { tone: 'info' }); };
  const saveCall = (e) => {
    e.preventDefault();
    recordCall(o, call.result, call.note.trim());
    setDlg(null); setCall({ result: 'confirmed', note: '' }); refresh();
    toast('Call saved');
  };
  const approve = (e) => {
    if (e) e.preventDefault();
    approveOrder(o, place);
    setDlg(null); refresh();
    toast(`Order ${o.id} approved`);
  };
  const askAdvance = () => {
    if (!advOk) return;
    requestAdvance(o, advNum); refresh();
    toast('Payment link sent');
  };
  const takeAdvance = (e) => {
    e.preventDefault();
    if (!advOk) return;
    receiveAdvance(o, { amount: advNum, method: adv.method, place });
    setDlg(null); refresh();
    toast(`Advance received · order ${o.id} approved`);
  };
  const doCancel = (e) => {
    e.preventDefault();
    cancelOrder(o, 'Cancelled', 'Staff', cancel.reason === 'Other' ? '' : cancel.reason);
    setDlg(null); refresh();
    toast(`Order ${o.id} cancelled`);
  };
  const holdStock = (e) => {
    e.preventDefault();
    holdOrderStock(o, place, 'Held from the order page');
    logOrder(o.id, 'lock', 'Stock held', place);
    setHoldOpen(false); refresh();
    toast('Stock held');
  };
  const askCancelDuplicate = async (why) => {
    const ok = await confirmDialog({ title: `Cancel ${o.id}?`, body: why + '.', confirmLabel: 'Cancel order', cancelLabel: 'Keep order', tone: 'danger' });
    if (!ok) return;
    cancelOrder(o, why, 'Staff', 'Duplicate order');
    refresh();
    toast(`Order ${o.id} cancelled`);
  };
  const askMerge = async (target) => {
    const held = holdsFor(o.id);
    const ok = await confirmDialog({
      title: `Merge ${o.id} into ${target.id}?`,
      body: `Its items move to ${target.id}, then ${o.id} is cancelled.` + (held.length ? ` Held items go back to stock.` : ''),
      confirmLabel: 'Merge and cancel', tone: 'danger',
    });
    if (!ok) return;
    mergeInto(o, target);
    toast(`Merged into ${target.id}`);
    navigate(orderHref(target.id, encodeURIComponent(back)));
    setId(target.id); refresh();
  };
  const setPrep = (patch) => {
    const next = updatePrep(o, patch);
    // all packing steps done: the order is ready for the courier by itself
    if (prepDone(next) && o.statusKey === 'approved') { markReady(findOrder(o.id) || o); toast('Ready for courier'); }
    refresh();
  };
  const printSlip = () => {
    if (!prep.courier) { toast('Choose a courier first', { tone: 'error' }); return; }
    printNode(slipRef.current, { title: `Slip ${o.id}`, css: '@page{size:100mm 150mm;margin:4mm} .od-slip{display:block!important}' });
    setPrep({ slipPrinted: true });
  };
  const ready2 = () => { markReady(o); refresh(); toast('Ready for courier'); };
  const send = () => {
    const r = sendToCourier(o);
    refresh();
    if (r.ok) toast(`Sent to ${r.courier} · ${r.id}`); else toast(r.error, { tone: 'error' });
  };
  const hook = (code, again) => {
    const eventId = again && lastHook ? lastHook.eventId : `${code}-${o.id}-${Date.now().toString(36)}`;
    const r = courierWebhook(findOrder(o.id) || o, again && lastHook ? lastHook.code : code, eventId);
    if (!again) setLastHook({ code, eventId });
    refresh();
    toast(r.duplicate ? 'Already received · nothing sent' : HOOK_LABEL[code], { tone: r.duplicate ? 'info' : 'success' });
  };
  const retry = (rid) => { const r = retryNotification(rid); refresh(); toast(r && r.status === 'Delivered' ? 'Sent' : 'Still failing', { tone: r && r.status === 'Delivered' ? 'success' : 'error' }); };
  const toggleBlock = async () => {
    if (blocked) { setBlocked(false); toast(o.customer + ' unblocked', { tone: 'info' }); return; }
    const ok = await confirmDialog({ title: 'Block this customer?', body: `${o.customer} can't place new orders.`, confirmLabel: 'Block customer', tone: 'danger' });
    if (!ok) return;
    setBlocked(true);
    toast(o.customer + ' blocked', { undo: () => setBlocked(false) });
  };
  const saveComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    logOrder(o.id, 'message-square', 'Comment', comment.trim());
    setComment(null); refresh();
    toast('Comment added');
  };
  const addTag = () => { const x = tagText.trim(); if (x && !tags.includes(x)) setTags([...tags, x]); setTagText(''); };

  // ---- the next step card ------------------------------------------------------------------------------
  const verifyLine = v ? (
    <p className="od-line"><Icon name={v.state === 'confirmed' ? 'circle-check' : v.state === 'calling' ? 'phone-outgoing' : 'phone-missed'} width="16" height="16" aria-hidden="true" style={{ color: v.state === 'confirmed' ? 'var(--text-success)' : v.state === 'calling' ? 'var(--primary)' : 'var(--text-warning)' }} />
      <b>{v.state === 'calling' ? 'Calling…' : callResultLabel(v.state)}</b><span className="od-sub">{v.method === 'auto' ? 'Auto call' : 'Call'}{v.at ? ' · ' + formatTime(v.at) : ''}{v.note ? ' · ' + v.note : ''}</span></p>
  ) : <p className="od-line"><Icon name="phone" width="16" height="16" aria-hidden="true" /><span>Not verified yet</span></p>;
  const recordLine = record && record.total ? <p className="od-line"><Icon name="truck" width="16" height="16" aria-hidden="true" /><span>{record.total} past parcels · {record.rate}% delivered</span></p> : null;

  let next = null;
  if (counter) next = null;
  else if (isNew) next = (
    <section className="gc-card od-card od-next" aria-labelledby="od-next">
      <div className="od-card__head"><div><h2 id="od-next">{v && v.state === 'confirmed' ? 'Approve order' : 'Verify order'}</h2><p>{o.advance && o.advance.state === 'requested' ? `Advance ${formatBDT(o.advance.amount)} requested` : status.hint}</p></div></div>
      <div className="od-card__body">
        {verifyLine}
        {recordLine}
        <div className="od-acts">
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={autoCall} disabled={v && v.state === 'calling'}><Icon name="phone-outgoing" width="16" height="16" aria-hidden="true" /> Auto call</button>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setDlg('call')}><Icon name="phone" width="16" height="16" aria-hidden="true" /> Log call</button>
        </div>
        <hr className="od-hr" />
        <div className="od-acts">
          <button type="button" className="gc-btn gc-btn--solid" onClick={() => setDlg('approve')}><Icon name="check" width="18" height="18" aria-hidden="true" /> Approve</button>
          {o.payment !== 'Paid' ? <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setDlg('advance')}><Icon name="hand-coins" width="18" height="18" aria-hidden="true" /> Take advance + approve</button> : null}
          <button type="button" className="gc-btn gc-btn--neutral" style={{ color: 'var(--text-danger)' }} onClick={() => setDlg('cancel')}>Cancel order</button>
        </div>
      </div>
    </section>
  );
  else if (o.statusKey === 'approved') next = (
    <section className="gc-card od-card od-next" aria-labelledby="od-next">
      <div className="od-card__head"><div><h2 id="od-next">Prepare parcel</h2><p>Pack it, print the slip, attach it.</p></div></div>
      <div className="od-card__body">
        <div className="od-two">
          <div><label className="gc-label" htmlFor="od-courier">Courier</label><select id="od-courier" className="gc-input gc-select" value={prep.courier} onChange={(e) => setPrep({ courier: e.target.value, slipPrinted: false, slipAttached: false })}><option value="">Choose courier</option>{COURIERS.map((x) => <option key={x} value={x}>{x} · {formatBDT(courierCharge(x, o.zone))}</option>)}</select></div>
        </div>
        <div className="od-money"><div><span>Total</span><b>{formatBDT(o.amount)}</b></div><div><span>Paid</span><b>{formatBDT(paid)}</b></div><div className="is-cod"><span>COD to collect</span><b>{formatBDT(cod)}</b></div></div>
        <ul className="od-checks">
          <li><label><input type="checkbox" checked={!!prep.addressOk} onChange={(e) => setPrep({ addressOk: e.target.checked })} /><span><b>Shipping info checked</b><small>{o.customer} · {o.phone} · {o.address || 'No address'}</small></span></label></li>
          <li><label><input type="checkbox" checked={!!prep.amountsOk} onChange={(e) => setPrep({ amountsOk: e.target.checked })} /><span><b>Amounts confirmed</b><small>COD {formatBDT(cod)}</small></span></label></li>
          <li><label><input type="checkbox" checked={!!prep.slipPrinted} onChange={(e) => setPrep({ slipPrinted: e.target.checked })} disabled={!prep.courier} /><span><b>Slip printed</b><small>{prep.courier ? prep.courier + ' label' : 'Choose a courier first'}</small></span></label><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={printSlip}><Icon name="printer" width="16" height="16" aria-hidden="true" /> Print slip</button></li>
          <li><label><input type="checkbox" checked={!!prep.packed} onChange={(e) => setPrep({ packed: e.target.checked })} /><span><b>Packed</b></span></label></li>
          <li><label><input type="checkbox" checked={!!prep.slipAttached} onChange={(e) => setPrep({ slipAttached: e.target.checked })} disabled={!prep.slipPrinted} /><span><b>Slip attached</b></span></label></li>
        </ul>
        <button type="button" className="gc-btn gc-btn--solid" disabled={!prepDone(prep)} onClick={ready2}><Icon name="package-check" width="18" height="18" aria-hidden="true" /> Mark as ready for courier</button>
      </div>
    </section>
  );
  else if (o.statusKey === 'ready') next = (
    <section className="gc-card od-card od-next" aria-labelledby="od-next">
      <div className="od-card__head"><div><h2 id="od-next">Send to courier</h2><p>Packed and labelled.</p></div></div>
      <div className="od-card__body">
        <div className="od-two"><div><label className="gc-label" htmlFor="od-courier">Courier</label><select id="od-courier" className="gc-input gc-select" value={prep.courier} onChange={(e) => setPrep({ courier: e.target.value })}>{COURIERS.map((x) => <option key={x} value={x}>{x} · {formatBDT(courierCharge(x, o.zone))}</option>)}</select></div></div>
        <div className="od-money"><div><span>Total</span><b>{formatBDT(o.amount)}</b></div><div><span>Paid</span><b>{formatBDT(paid)}</b></div><div className="is-cod"><span>COD to collect</span><b>{formatBDT(cod)}</b></div></div>
        <button type="button" className="gc-btn gc-btn--solid" onClick={send}><Icon name="truck" width="18" height="18" aria-hidden="true" /> Send to courier</button>
      </div>
    </section>
  );
  else if (o.statusKey === 'shipped') next = (
    <section className="gc-card od-card" aria-labelledby="od-next">
      <div className="od-card__head"><div><h2 id="od-next">In transit</h2><p>{o.courier} · {o.consignment}</p></div>{o.trackingUrl ? <a className="od-linkbtn" href={o.trackingUrl} target="_blank" rel="noreferrer">Track</a> : null}</div>
      <div className="od-card__body">
        <div className="od-money"><div><span>Total</span><b>{formatBDT(o.amount)}</b></div><div><span>Paid</span><b>{formatBDT(paid)}</b></div><div className="is-cod"><span>COD to collect</span><b>{formatBDT(cod)}</b></div></div>
        <div className="od-demo">
          <p>Courier updates (demo)</p>
          <div className="od-hooks">
            {['out', 'delivered', 'failed', 'return'].map((k) => <button key={k} type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => hook(k)}>{HOOK_LABEL[k]}</button>)}
            {lastHook ? <button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={() => hook(lastHook.code, true)}>Send again</button> : null}
          </div>
        </div>
      </div>
    </section>
  );
  else if (o.statusKey === 'delivered') next = (
    <section className="gc-card od-card" aria-labelledby="od-next">
      <div className="od-card__head"><div><h2 id="od-next">Delivered</h2><p>{when(t.delivered)}</p></div></div>
      <div className="od-card__body">
        {o.codCollected ? <p className="od-line"><Icon name="hand-coins" width="16" height="16" aria-hidden="true" /><b>{formatBDT(o.codCollected)}</b><span>COD with {o.courier} · settlement pending</span><Link href="/settlements" className="od-linkbtn">Settlements</Link></p>
          : <p className="od-line"><Icon name="circle-check" width="16" height="16" aria-hidden="true" style={{ color: 'var(--text-success)' }} /><span>Complete</span></p>}
      </div>
    </section>
  );
  else if (rto) next = (
    <section className="gc-card od-card" aria-labelledby="od-next">
      <div className="od-card__head"><div><h2 id="od-next">Returned</h2><p>{o.rtoReason || 'Brought back by the courier'}</p></div></div>
      <div className="od-card__body">
        <p className="od-line">{rto.left ? `${rto.left} of ${rto.sent} pcs still with ${o.courier}` : 'All items back'}</p>
        <Link href={'/courier-returns?id=' + encodeURIComponent(o.id)} className="gc-btn gc-btn--solid"><Icon name="package-open" width="18" height="18" aria-hidden="true" /> {rto.left ? 'Receive parcel' : 'View return'}</Link>
      </div>
    </section>
  );
  else if (o.statusKey === 'cancelled') next = (
    <section className="gc-card od-card" aria-labelledby="od-next">
      <div className="od-card__head"><div><h2 id="od-next">Cancelled</h2><p>{o.cancelReason || when(t.cancelled) || 'This order was cancelled'}</p></div></div>
    </section>
  );

  return (
    <Shell page={'Order ' + o.id}>
      <div className="od-bar">
        <Link href={back} className="od-back" aria-label="Back to all orders"><Icon name="arrow-left" width="18" height="18" /></Link>
        <h1 className="od-title">Order {o.id}</h1>
        <StatusBadge tone={status.tone} icon={status.icon}>{status.label}</StatusBadge>
        <StatusBadge tone={pay[0]} icon={pay[1]}>{o.payment}</StatusBadge>
        {dups.length ? <span className="gc-badge gc-badge--warning">Possible duplicate</span> : null}
        {blocked ? <StatusBadge tone="error" icon="ban">Customer blocked</StatusBadge> : null}
        <span className="od-meta">{o.placed} · {o.channel}</span>
        <div className="od-bar__actions">
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
                  <p><b>Possible duplicate of <Link href={orderHref(d.id, encodeURIComponent(back))} className="od-id">{d.id}</Link></b> · same phone and {same.join(', ')} · {minutesApart(o.at, d.at)}</p>
                  {CAN_CANCEL.includes(o.statusKey) ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => askCancelDuplicate('Duplicate of ' + d.id)}>Cancel as duplicate</button> : null}
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
                <div><h2>Order status</h2><p>{o.statusKey === 'cancelled' ? 'Cancelled' : o.statusKey === 'returned' ? 'Returned' : nextStep ? 'Next: ' + STEP_LABEL[nextStep] : 'Complete'}</p></div>
                <button type="button" className={'gc-btn gc-btn--sm ' + (blocked ? 'gc-btn--solid gc-btn--error' : 'gc-btn--neutral')} onClick={toggleBlock} aria-pressed={blocked}><Icon name="ban" width="15" height="15" aria-hidden="true" /> {blocked ? 'Unblock' : 'Block'}</button>
              </div>
              <div className="od-card__body">
                <ol className="od-steps" aria-label="Order progress" style={{ '--steps': ORDER_STEPS.length }}>
                  {ORDER_STEPS.map((key) => {
                    const state = reached[key] ? 'done' : key === nextStep ? 'current' : 'todo';
                    const icon = { new: 'shopping-bag', verified: 'phone', approved: 'circle-check', ready: 'package', shipped: 'truck', delivered: 'package-check' }[key];
                    return (
                      <li key={key} className={'od-step od-step--' + state} aria-current={state === 'current' ? 'step' : undefined}>
                        <span className="od-step__dot"><Icon name={state === 'done' ? 'check' : icon} width="16" height="16" aria-hidden="true" /></span>
                        <p className="od-step__label">{key === 'new' ? (isNew ? status.label : STEP_LABEL.new) : STEP_LABEL[key]}<span className="sr-only"> ({state === 'done' ? 'done' : state === 'current' ? 'next' : 'not yet'})</span></p>
                        <p className="od-step__note">{stepNote[key] || (state === 'current' ? 'Next' : '')}</p>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </section>

            {next}

            {track.length ? (
              <section className="gc-card od-card" aria-labelledby="od-track">
                <div className="od-card__head"><div><h2 id="od-track"><Icon name="map-pin" width="17" height="17" aria-hidden="true" />Tracking</h2><p>{o.courier} · {o.consignment}</p></div>{o.trackingUrl ? <a className="od-linkbtn" href={o.trackingUrl} target="_blank" rel="noreferrer">Open tracking</a> : null}</div>
                <div className="od-card__body">
                  <ol className="od-time">
                    {track.map((e, i) => <li key={e.code + e.at + i}><i aria-hidden="true" /><b>{e.text}</b><span>{formatTime(e.at)}, {formatDate(e.at)}</span></li>)}
                  </ol>
                </div>
              </section>
            ) : null}

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
                {places.length === 0 ? <p className="od-sub" style={{ margin: 0 }}>{isNew ? 'Held when the order is approved.' : 'No stock held.'}</p> : places.map((g) => (
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

            {!counter ? (
              <section className="gc-card od-card" aria-labelledby="od-msgs">
                <div className="od-card__head"><div><h2 id="od-msgs"><Icon name="send" width="17" height="17" aria-hidden="true" />Notifications</h2><p>{msgs.length ? `${msgs.length} sent` : 'None yet'}</p></div><Link href="/set-notifications" className="od-linkbtn">Settings</Link></div>
                {msgs.length ? (
                  <div className="od-card__body">
                    <div className="od-msgs">
                      {msgs.map((m) => (
                        <div key={m.id} className="od-msg">
                          <span className="od-msg__ic" aria-hidden="true"><Icon name={m.channel === 'Email' ? 'mail' : 'message-square'} width="15" height="15" /></span>
                          <span className="od-msg__main"><b>{m.label}</b><span>{m.channel} · {m.recipient}{m.to ? ' · ' + m.to : ''} · {formatTime(m.at)}, {formatDate(m.at)}</span>{m.error ? <span>{m.error}</span> : null}</span>
                          <span className="od-msg__end">
                            <span className={'gc-badge gc-badge--' + (SEND_STATUS[m.status] || 'slate')}>{m.status}{m.retries ? ` · retried ${m.retries}` : ''}</span>
                            {m.status === 'Failed' && !m.demo ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => retry(m.id)}>Retry</button> : null}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>
            ) : null}

            <section className="gc-card od-card">
              <div className="od-card__head"><h2><Icon name="activity" width="17" height="17" aria-hidden="true" />Visit details</h2><button type="button" className="od-linkbtn" aria-expanded={tracking} onClick={() => setTracking(!tracking)}>{tracking ? 'Hide' : 'Show'}</button></div>
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

      <Dialog open={dlg === 'call'} title="Log call" onClose={() => setDlg(null)} width={440}>
        <form onSubmit={saveCall} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p className="gc-help" style={{ margin: 0 }}>{o.customer} · <a href={'tel:' + digitsOf(o.phone)}>{o.phone}</a></p>
          <div><label className="gc-label" htmlFor="od-call">Result</label><select id="od-call" className="gc-input gc-select" data-autofocus value={call.result} onChange={(e) => setCall({ ...call, result: e.target.value })}>{CALL_RESULTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          <div><label className="gc-label" htmlFor="od-call-note">Note</label><input id="od-call-note" className="gc-input" value={call.note} onChange={(e) => setCall({ ...call, note: e.target.value })} placeholder="Optional" /></div>
          <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setDlg(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid">Save</button></div>
        </form>
      </Dialog>

      <Dialog open={dlg === 'approve'} title={`Approve ${o.id}`} onClose={() => setDlg(null)} width={480}>
        <form onSubmit={approve} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {!v || v.state !== 'confirmed' ? <p className="gc-help" style={{ margin: 0 }}>Not verified yet.</p> : null}
          <div><label className="gc-label" htmlFor="od-place">Hold stock at</label><select id="od-place" className="gc-input gc-select" data-autofocus value={place} onChange={(e) => setPlace(e.target.value)}>{holdPlaces.map((x) => <option key={x}>{x}</option>)}</select></div>
          <div className="gc-table-wrap">
            <table className="gc-table gc-table--compact">
              <caption className="sr-only">Free stock at {place}</caption>
              <thead><tr><th scope="col">Item</th><th scope="col" className="od-num">Qty</th><th scope="col" className="od-num">Free</th></tr></thead>
              <tbody>{stock.map((x) => <tr key={x.name}><td className="od-strong">{x.name}</td><td className="od-num">{x.qty}</td><td className={'od-num' + (x.short ? ' od-short' : '')}>{x.known ? x.available : '—'}</td></tr>)}</tbody>
            </table>
          </div>
          {short.length ? <p className="gc-help gc-help--error" style={{ margin: 0 }}>Not enough stock at {place}.</p> : null}
          <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setDlg(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid">Approve</button></div>
        </form>
      </Dialog>

      <Dialog open={dlg === 'advance'} title="Take advance + approve" onClose={() => setDlg(null)} width={480}>
        <form onSubmit={takeAdvance} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="od-two">
            <div><label className="gc-label" htmlFor="od-adv">Advance (৳)</label><input id="od-adv" className="gc-input" type="number" min="1" inputMode="numeric" data-autofocus value={adv.amount} onChange={(e) => setAdv({ ...adv, amount: e.target.value })} aria-invalid={!advOk} /></div>
            <div><label className="gc-label" htmlFor="od-adv-m">Paid by</label><select id="od-adv-m" className="gc-input gc-select" value={adv.method} onChange={(e) => setAdv({ ...adv, method: e.target.value })}>{ADVANCE_METHODS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          </div>
          <div className="od-money"><div><span>Total</span><b>{formatBDT(o.amount)}</b></div><div><span>Advance</span><b>{formatBDT(advOk ? advNum : 0)}</b></div><div className="is-cod"><span>COD after</span><b>{formatBDT(Math.max(0, o.amount - paid - (advOk ? advNum : 0)))}</b></div></div>
          {!advOk ? <p className="gc-help gc-help--error" style={{ margin: 0 }}>Enter an amount below {formatBDT(o.amount - paid)}.</p> : null}
          <div><label className="gc-label" htmlFor="od-adv-place">Hold stock at</label><select id="od-adv-place" className="gc-input gc-select" value={place} onChange={(e) => setPlace(e.target.value)}>{holdPlaces.map((x) => <option key={x}>{x}</option>)}</select></div>
          <div className="gc-modal__foot" style={{ marginTop: 0, flexWrap: 'wrap' }}>
            <button type="button" className="gc-btn gc-btn--neutral" disabled={!advOk} onClick={askAdvance}><Icon name="send" width="16" height="16" aria-hidden="true" /> Send payment link</button>
            <button type="submit" className="gc-btn gc-btn--solid" disabled={!advOk}>Received · approve</button>
          </div>
        </form>
      </Dialog>

      <Dialog open={dlg === 'cancel'} title={`Cancel ${o.id}?`} onClose={() => setDlg(null)} width={440}>
        <form onSubmit={doCancel} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div><label className="gc-label" htmlFor="od-cancel">Reason</label><select id="od-cancel" className="gc-input gc-select" data-autofocus value={cancel.reason} onChange={(e) => setCancel({ ...cancel, reason: e.target.value })}>{CANCEL_REASONS.map((x) => <option key={x}>{x}</option>)}</select></div>
          {open.length ? <p className="gc-help" style={{ margin: 0 }}>Held stock goes back.</p> : null}
          <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setDlg(null)}>Keep order</button><button type="submit" className="gc-btn gc-btn--solid gc-btn--error">Cancel order</button></div>
        </form>
      </Dialog>

      {/* the shipping slip: printed on its own (lib/printNode) */}
      <div className="od-slip" aria-hidden="true">
        <div ref={slipRef} style={{ fontFamily: 'var(--font-sans)', color: '#0f172a', padding: '4mm', display: 'flex', flexDirection: 'column', gap: '3mm' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #0f172a', paddingBottom: '2mm' }}><b style={{ fontSize: 'var(--text-lg)' }}>{prep.courier || 'Courier'}</b><span>{MERCHANT.name}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '3mm' }}>
            <div><div style={{ fontSize: 'var(--text-xs)' }}>Order</div><b style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-data)' }}>{o.id}</b></div>
            <QrCode text={o.id} size={72} label={'Order ' + o.id} />
          </div>
          <div><div style={{ fontSize: 'var(--text-xs)' }}>To</div><b>{o.customer}</b><div>{o.phone}</div><div>{o.address}</div><div>{o.zone}</div></div>
          <div style={{ border: '2px solid #0f172a', borderRadius: 'var(--radius-lg)', padding: '2mm 3mm', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>COD</span><b style={{ fontSize: 'var(--text-2xl)' }}>{formatBDT(cod)}</b></div>
          <div style={{ fontSize: 'var(--text-xs)' }}>{o.units} {o.units === 1 ? 'item' : 'items'} · From {MERCHANT.name}, {MERCHANT.phone}</div>
        </div>
      </div>

      <Dialog open={comment != null} title="Add a comment" onClose={() => setComment(null)} width={440}>
        <form onSubmit={saveComment} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div><label className="gc-label" htmlFor="od-comment">Comment</label><textarea id="od-comment" className="gc-input" rows="3" data-autofocus value={comment || ''} onChange={(e) => setComment(e.target.value)} placeholder="Only staff can see it" /></div>
          <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setComment(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid" disabled={!(comment || '').trim()}>Add comment</button></div>
        </form>
      </Dialog>
    </Shell>
  );
}
