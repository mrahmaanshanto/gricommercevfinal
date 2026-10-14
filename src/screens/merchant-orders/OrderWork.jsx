'use client';
// OrderWork — Orders › Order work (/order-work?q=…): focused queues around the order list (Nayeem's Sales & Orders
// brief #4: "child workspaces" — courier review, payment review, pick & pack, print queue, quotes, edits to review).
//   confirm   On hold (COD) orders to confirm by phone: Call / WhatsApp and one-tap answers (Confirmed approves; No
//             answer and Call later set the next call and add a follow-up to Calls; Wants a change, Needs advance,
//             Cancel). orderFlow.js › confirmQueue / recordConfirm
//   issues    parcels the courier couldn't deliver or keeps at its hub: call, reschedule, fix the address, tell the
//             courier, approve the return. orderFlow.js › deliveryIssues / issueAction
//   courier   Ready for courier orders with a check per order (courier, phone, address); book the selected ones in
//             the background (orderJobs.js), results per order with Retry
//   payment   orders with a payment proof waiting; Review opens Accept / Reject (paymentProof.js)
//   pick      Approved orders not packed yet; select them for one pick list grouped by product (with bins) and a
//             packing checklist per order, printed together
//   print     Approved orders whose slip isn't printed; labels are prepared in the background and print together
//   (quotes moved to their own page, Orders › Quotes /quotes; ?q=quotes forwards there)
//   edits     changes asked for review (orderEdit.js); each is reviewed on its order page
// A list page (docs/shopify-style.md): ShopHeader, one card with the queue tabs, bulk bar, table / phone list.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { Sidebar, Topbar } from '@/shell/Shell';
import { EmptyState, StatusBadge, Dialog } from '@/components/ui';
import { ShopHeader, IndexTabs, LearnMore, Menu } from '@/components/ui/IndexKit';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { getOrders, orderHref, holdPlaceOf, isCounterSale, findOrder, RTO_REASONS } from '@/lib/orders';
import { prepOf, COURIERS, syncCourier, confirmQueue, recordConfirm, confirmLabel, CANCEL_REASONS, whenText, deliveryIssues, issueAction, ISSUE_ACTIONS, seedDeliveryIssues, demoFailedDelivery, dayText } from '@/lib/orderFlow';
import { clockNow } from '@/lib/settlements';
import { currentUser } from '@/lib/team';
import { productBy } from '@/lib/stock';
import { binsFor } from '@/lib/racks';
import { ordersToReview, proofToReview, methodLabel } from '@/lib/paymentProof';
import { ordersWithEditRequests, editRequestOf } from '@/lib/orderEdit';
import { startJob } from '@/lib/orderJobs';
import { printNode } from '@/lib/printNode';
import { OrderJobs } from '@/screens/merchant-orders/OrderJobs';
import { ReviewProofDialog } from '@/screens/merchant-orders/ProofDialogs';

const QUEUES = [
  { key: 'confirm', label: 'Confirm' },
  { key: 'issues', label: 'Delivery issues' },
  { key: 'courier', label: 'Courier review' },
  { key: 'payment', label: 'Payment review' },
  { key: 'pick', label: 'Pick & pack' },
  { key: 'print', label: 'Print queue' },
  { key: 'edits', label: 'Edits to review' },
];
const EMPTY = { confirm: 'No orders to confirm', issues: 'No delivery problems', courier: 'No orders ready for the courier', payment: 'No payments to review', pick: 'Nothing to pick', print: 'No labels to print', edits: 'No edits to review' };
const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many || one + 's');
const digits = (p) => String(p || '').replace(/\D/g, '').replace(/^88/, '');
const me = () => { try { return currentUser().name || 'Staff'; } catch { return 'Staff'; } };
// when to call again: presets from now (No answer, Call later)
const HOUR = 36e5;
const tomorrowAt = (now, h) => { const d = new Date(now); d.setDate(d.getDate() + 1); d.setHours(h, 0, 0, 0); return d.getTime(); };
const RETRY = [['30m', 'In 30 minutes', (n) => n + HOUR / 2], ['1h', 'In 1 hour', (n) => n + HOUR], ['3h', 'In 3 hours', (n) => n + 3 * HOUR], ['tom', 'Tomorrow 10 AM', (n) => tomorrowAt(n, 10)]];
const localInput = (t) => { const d = new Date(t); const p = (x) => String(x).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };
const dayInput = (t) => localInput(t).slice(0, 10);
/** The confirmation call's last answer as a badge: [text, tone]. */
function answerBadge(o, now) {
  const c = o.confirmInfo || {};
  const l = c.last;
  if (!l) return ['Not called', 'neutral'];
  if (l.outcome === 'no-answer' || l.outcome === 'call-later') return [confirmLabel(l.outcome) + ' · ' + (c.retryAt > now ? 'call ' + whenText(c.retryAt, now) : 'call now'), c.retryAt > now ? 'neutral' : 'warning'];
  if (l.outcome === 'needs-advance') return [o.advance && o.advance.state === 'paid' ? 'Advance paid' : 'Advance asked', 'info'];
  return [confirmLabel(l.outcome), l.outcome === 'wants-change' ? 'warning' : 'neutral'];
}
// the courier's reason → the return reason it usually ends as (orders.js › RTO_REASONS)
const RTO_OF = { 'Address not found': 'Wrong address', 'Address unclear': 'Wrong address', 'Customer refused the parcel': 'Customer refused the parcel' };
/** What was last done on a delivery issue, in a few words. */
function issueNext(i) {
  const l = i.last;
  if (!l) return 'Not handled yet';
  if (l.kind === 'reschedule') return 'Rescheduled for ' + dayText(l.date);
  return ISSUE_ACTIONS[l.kind] + (l.note ? ': ' + l.note : '');
}

/** What stops the courier taking this order ('' when nothing). Same checks as orderFlow.sendToCourier. */
function courierCheck(o) {
  const c = prepOf(o).courier;
  if (!COURIERS.includes(c)) return 'Choose a courier';
  if (!/^01[3-9]\d{8}$/.test(digits(o.phone))) return 'Phone number not valid';
  if (!String(o.address || '').trim()) return 'No address';
  return '';
}

const CSS = `
.ow-id{font-family:var(--font-data)}
.ow-ok{color:var(--text-success)}
.ow-bad{color:var(--text-danger)}
.ow-pick{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.ow-pick th{padding:0 var(--space-2) var(--space-2) 0;border-bottom:1px solid var(--border-subtle);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:left}
.ow-pick td{padding:6px var(--space-2) 6px 0;border-bottom:1px solid var(--border-subtle);vertical-align:top}
.ow-pick .r{text-align:right;font-variant-numeric:tabular-nums}
.ow-pick small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.ow-pack{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:var(--space-3)}
.ow-pack>div{padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-size:var(--text-sm)}
.ow-pack b{display:block;color:var(--text-heading)}
.ow-pack ul{margin:var(--space-2) 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:4px}
.ow-pack li::before{content:"☐ ";color:var(--text-muted)}
.ow-sec{margin:0 0 var(--space-2);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ow-acts{display:inline-flex;align-items:center;justify-content:flex-end;gap:6px;white-space:nowrap}
.ow-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.ow-later td{color:var(--text-muted)}
.ow-pacts{display:flex;flex-wrap:wrap;gap:6px;padding-top:4px}
.ow-chips{display:flex;flex-wrap:wrap;gap:8px}
.ow-chip{height:32px;padding:0 12px;border:1px solid var(--border-strong);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-sm);color:var(--text-body);cursor:pointer}
.ow-chip[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary);font-weight:var(--weight-medium)}
@media (max-width:640px){.ow-chip{height:36px}}
`;

export default function OrderWork() {
  const [ready, setReady] = useState(false);
  const [q, setQ] = useState('confirm');
  const [tick, setTick] = useState(0);
  const [sel, setSel] = useState({});
  const [review, setReview] = useState(null);    // order id whose payment proof is open
  const [pickIds, setPickIds] = useState(null);  // order ids on the pick list being shown
  const [ask, setAsk] = useState(null);          // an answer or a step that needs more: { kind: 'confirm'|'issue', id, act, … }
  const docRef = useRef(null);
  const refresh = () => setTick((t) => t + 1);

  useEffect(() => {
    const read = () => { const p = new URLSearchParams(window.location.search).get('q'); if (p === 'quotes') { navigate('/quotes'); return; } setQ(QUEUES.some((x) => x.key === p) ? p : 'confirm'); };
    read(); syncCourier(); seedDeliveryIssues(); setReady(true);
    window.addEventListener('popstate', read);
    return () => window.removeEventListener('popstate', read);
  }, []);
  const go = (key) => {
    setQ(key); setSel({});
    window.history.replaceState(null, '', '/order-work?q=' + key);
    window.dispatchEvent(new CustomEvent('gc:route'));
  };

  const all = useMemo(() => (ready ? getOrders() : []), [ready, tick]);
  const online = all.filter((o) => !isCounterSale(o) && !o.isInvoice);
  const now = ready ? clockNow() : 0;
  const lists = useMemo(() => ({
    confirm: ready ? confirmQueue(all) : [],
    issues: ready ? deliveryIssues(all) : [],
    courier: online.filter((o) => o.statusKey === 'ready'),
    payment: ordersToReview(all),
    pick: online.filter((o) => o.statusKey === 'approved' && !prepOf(o).packed),
    print: online.filter((o) => o.statusKey === 'approved' && !prepOf(o).slipPrinted),
    edits: ordersWithEditRequests(all),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [all]);
  const counts = Object.fromEntries(Object.entries(lists).map(([k, v]) => [k, v.length]));
  const rows = lists[q] || [];
  const chosen = rows.filter((o) => sel[o.id]);
  const selectable = ['courier', 'pick', 'print'].includes(q);
  const allOn = rows.length > 0 && rows.every((o) => sel[o.id]);
  const toggleAll = () => setSel(allOn ? {} : Object.fromEntries(rows.map((o) => [o.id, true])));
  const toggle = (id) => setSel({ ...sel, [id]: !sel[id] });

  // ---- bulk actions ---------------------------------------------------------------------------------------
  const book = () => {
    const ok = chosen.filter((o) => !courierCheck(o));
    if (!ok.length) { toast('None of these can be booked yet: fix them on the order first', { tone: 'error' }); return; }
    startJob('courier', chosen);
    setSel({});
    toast('Booking ' + plural(ok.length, 'order') + ' in the background', { tone: 'info' });
  };
  // ---- confirmation calls -------------------------------------------------------------------------------
  const answer = (o, outcome, more = {}) => {
    const r = recordConfirm(findOrder(o.id) || o, outcome, { ...more, by: me() });
    if (!r.ok) { toast(r.error, { tone: 'error' }); return false; }
    setAsk(null); refresh();
    if (outcome === 'confirmed') toast(r.approved ? o.id + ' confirmed and approved' : o.id + ' confirmed');
    else if (r.retryAt) toast('Call ' + o.customer + ' again ' + whenText(r.retryAt) + (r.task ? ' · added to Calls' : ''));
    else toast({ 'wants-change': 'Change noted on ' + o.id, 'needs-advance': 'Advance asked · payment link sent', cancel: o.id + ' cancelled' }[outcome] || 'Saved');
    return true;
  };
  const openAnswer = (o, act) => {
    const n = clockNow();
    setAsk({ kind: 'confirm', id: o.id, act, retry: '1h', when: n + HOUR, custom: localInput(n + HOUR), note: '', amount: String(o.shipping || 200), reason: '' });
  };
  // ---- delivery issues -----------------------------------------------------------------------------------
  const openStep = (o, act) => {
    const n = clockNow();
    setAsk({ kind: 'issue', id: o.id, act, note: '', date: dayInput(tomorrowAt(n, 10)), min: dayInput(n), address: o.address || '', reason: RTO_OF[(o.issue && o.issue.reason) || ''] || 'Customer not reachable' });
  };
  const step = () => {
    const o = findOrder(ask.id);
    const r = issueAction(o, ask.act, { note: ask.note, date: ask.date, address: ask.address, reason: ask.reason, by: me() });
    if (!r.ok) { toast(r.error, { tone: 'error' }); return; }
    setAsk(null); refresh();
    toast(ask.act === 'reschedule' ? 'Delivery rescheduled for ' + dayText(ask.date) : ask.act === 'return' ? 'Return approved · ' + o.id + ' is coming back' : ISSUE_ACTIONS[ask.act]);
  };
  const demoFail = () => {
    const id = demoFailedDelivery();
    refresh();
    if (id) toast('Demo: delivery failed for ' + id, { tone: 'info' }); else toast('No parcel is with the courier right now', { tone: 'info' });
  };
  const printLabels = () => { startJob('print', chosen); setSel({}); toast('Preparing ' + plural(chosen.length, 'label') + ' in the background', { tone: 'info' }); };

  // ---- pick list: one line per product (and place), with the orders it goes to --------------------------
  const pick = useMemo(() => {
    if (!pickIds) return null;
    const orders = pickIds.map((id) => findOrder(id, all)).filter(Boolean);
    const by = {};
    orders.forEach((o) => {
      const place = holdPlaceOf(o.id);
      o.lines.forEach((l) => {
        const k = place + '|' + l.name;
        const p = productBy(l.name);
        if (!by[k]) by[k] = { name: l.name, sku: p ? p.sku : l.sku || '', place, qty: 0, orders: [], bins: p ? binsFor(place, p.sku).map((b) => b.code) : [] };
        by[k].qty += l.qty; by[k].orders.push(o.id + (l.qty > 1 ? ' ×' + l.qty : ''));
      });
    });
    return { orders, lines: Object.values(by).sort((a, b) => a.place.localeCompare(b.place) || (a.bins[0] || 'zz').localeCompare(b.bins[0] || 'zz') || a.name.localeCompare(b.name)) };
  }, [pickIds, all]);
  const printPick = () => printNode(docRef.current, { title: 'Pick list' });

  const reviewOrder = review ? findOrder(review, all) : null;
  const tabLabel = (QUEUES.find((x) => x.key === q) || QUEUES[0]).label;

  // ---- one table per queue ------------------------------------------------------------------------------
  const cols = {
    courier: ['Order', 'Customer', 'Courier', 'COD', 'Check'],
    payment: ['Order', 'Customer', 'Paid by', 'Transaction ID', 'Amount', 'Due'],
    pick: ['Order', 'Customer', 'Items', 'From', 'Approved'],
    print: ['Order', 'Customer', 'Courier', 'Zone', 'Approved'],
    edits: ['Order', 'Customer', 'Asked by', 'Change', 'Asked'],
  }[q] || [];
  const cells = (o) => {
    const cod = o.codAmount != null ? o.codAmount : Math.max(0, o.amount - (o.paid || 0));
    if (q === 'courier') { const why = courierCheck(o); return [o.customer, prepOf(o).courier || '—', formatBDT(cod), why ? <span key="w" className="ow-bad">{why}</span> : <span key="w" className="ow-ok">Ready</span>]; }
    if (q === 'payment') { const p = proofToReview(o); return [o.customer, methodLabel(p.method), <span key="t" className="ow-id">{p.txn}</span>, formatBDT(p.amount), formatBDT(Math.max(0, o.amount - (o.paid || 0)))]; }
    if (q === 'pick') return [o.customer, String(o.units), holdPlaceOf(o.id), o.times && o.times.approved ? formatDate(o.times.approved) : '—'];
    if (q === 'print') return [o.customer, prepOf(o).courier || 'Not chosen', o.zone, o.times && o.times.approved ? formatDate(o.times.approved) : '—'];
    const r = editRequestOf(o);
    return [o.customer, r.by + (r.from === 'Customer' ? ' (customer)' : ''), r.note || '—', formatDate(r.at)];
  };
  const open = (o) => (q === 'payment' ? setReview(o.id) : navigate(orderHref(o.id, encodeURIComponent('/merchant-orders'))));
  const NUM = { COD: 1, Amount: 1, Due: 1, Items: 1 };

  return (
    <div className="dc-screen ds" data-screen="OrderWork">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="orders-all" />
        <main className="gc-shell__main">
          <Topbar crumb="Orders" page="Order work" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="list-checks" title="Order work"
                about="Queues around the order list: COD orders to confirm by phone, delivery problems to fix, courier booking, payment review, pick and pack, labels to print and edits to review."
                more={[{ label: 'All orders', href: '/merchant-orders' }, ...(q === 'issues' ? [{ label: 'Demo: make a failed delivery', onClick: demoFail }] : []), { label: 'Order settings', href: '/order-settings' }]} />

              {q === 'courier' || q === 'print' ? <OrderJobs kind={q} onChange={refresh} /> : null}

              <section className="ix-card" aria-label={tabLabel}>
                {selectable && chosen.length ? (
                  <div className="ix-bulk" role="toolbar" aria-label="Selected orders">
                    <input type="checkbox" checked={allOn} onChange={toggleAll} aria-label="Select every order" style={{ width: 16, height: 16, margin: '0 6px', accentColor: 'var(--primary)' }} />
                    <span className="ix-bulk__n">{chosen.length} selected</span>
                    {q === 'courier' ? <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={book}><Icon name="truck" width="16" height="16" aria-hidden="true" />Book with courier</button> : null}
                    {q === 'pick' ? <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => setPickIds(chosen.map((o) => o.id))}><Icon name="list-checks" width="16" height="16" aria-hidden="true" />Pick list</button> : null}
                    {q === 'print' ? <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={printLabels}><Icon name="printer" width="16" height="16" aria-hidden="true" />Print labels</button> : null}
                    <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setSel({})}>Clear</button>
                  </div>
                ) : (
                  <div className="ix-bar">
                    <IndexTabs label="Queues" tabs={QUEUES.map((x) => ({ ...x, id: 'ow-tab-' + x.key, count: ready ? counts[x.key] : null, on: q === x.key, onClick: () => go(x.key) }))} />
                  </div>
                )}

                {!ready ? <div className="ix-empty" /> : rows.length === 0 ? (
                  <div className="ix-empty"><EmptyState icon="circle-check" title={EMPTY[q]} actionLabel={q === 'issues' ? 'Demo: make a failed delivery' : undefined} onAction={q === 'issues' ? demoFail : undefined} /></div>
                ) : q === 'confirm' ? (<>
                  <ul className="ix-plist" aria-label={tabLabel}>
                    {rows.map((o) => { const [txt, tone] = answerBadge(o, now); return (
                      <li key={o.id}>
                        <div className="ix-pitem">
                          <span className="ix-pitem__top"><Link href={orderHref(o.id)} className="ow-id ix-strong">{o.id}</Link><span>{o.total}</span></span>
                          <span className="ix-pitem__mid">{o.customer} · {o.phone} · {o.placed}</span>
                          <span className="ix-pitem__tags"><StatusBadge tone={tone}>{txt}</StatusBadge>{o.confirmInfo.attempts ? <StatusBadge tone="neutral" icon="phone">{plural(o.confirmInfo.attempts, 'call')}</StatusBadge> : null}</span>
                          <ConfirmActs o={o} answer={answer} openAnswer={openAnswer} wrap />
                        </div>
                      </li>
                    ); })}
                  </ul>
                  <div className="ix-table-wrap">
                    <table className="ix-table gc-table--keep">
                      <caption className="sr-only">{tabLabel}</caption>
                      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" className="ix-num">COD</th><th scope="col">Placed</th><th scope="col" className="ix-num">Calls</th><th scope="col">Last answer</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                      <tbody>{rows.map((o) => { const [txt, tone] = answerBadge(o, now); return (
                        <tr key={o.id} className={o.dueNow ? '' : 'ow-later'} onClick={(e) => { if (e.target.closest('a,button,input,label')) return; open(o); }}>
                          <td><Link href={orderHref(o.id)} className="ix-strong ow-id">{o.id}</Link></td>
                          <td>{o.customer}<span className="ow-sub">{o.phone}</span></td>
                          <td className="ix-num">{formatBDT(Math.max(0, o.amount - (o.paid || 0)))}</td>
                          <td className="ix-muted">{o.placed}</td>
                          <td className="ix-num">{o.confirmInfo.attempts || '—'}</td>
                          <td><StatusBadge tone={tone}>{txt}</StatusBadge>{o.confirmInfo.last && o.confirmInfo.last.note ? <span className="ow-sub">{o.confirmInfo.last.note}</span> : null}</td>
                          <td className="ix-num"><ConfirmActs o={o} answer={answer} openAnswer={openAnswer} /></td>
                        </tr>
                      ); })}</tbody>
                    </table>
                  </div>
                </>) : q === 'issues' ? (<>
                  <ul className="ix-plist" aria-label={tabLabel}>
                    {rows.map((o) => (
                      <li key={o.id}>
                        <div className="ix-pitem">
                          <span className="ix-pitem__top"><Link href={orderHref(o.id)} className="ow-id ix-strong">{o.id}</Link><span>{o.total}</span></span>
                          <span className="ix-pitem__mid">{o.customer} · {o.courier} · {whenText(o.issue.at, now)}</span>
                          <span className="ix-pitem__tags"><StatusBadge tone={o.issue.code === 'failed' ? 'error' : 'warning'}>{o.issue.label}{o.issue.reason ? ' · ' + o.issue.reason : ''}</StatusBadge><StatusBadge tone="neutral">{issueNext(o.issue)}</StatusBadge></span>
                          <IssueActs o={o} openStep={openStep} wrap />
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="ix-table-wrap">
                    <table className="ix-table gc-table--keep">
                      <caption className="sr-only">{tabLabel}</caption>
                      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Courier</th><th scope="col">Problem</th><th scope="col" className="ix-num">Failed tries</th><th scope="col">Since</th><th scope="col">Next</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                      <tbody>{rows.map((o) => (
                        <tr key={o.id} onClick={(e) => { if (e.target.closest('a,button,input,label')) return; open(o); }}>
                          <td><Link href={orderHref(o.id)} className="ix-strong ow-id">{o.id}</Link></td>
                          <td>{o.customer}<span className="ow-sub">{o.phone}</span></td>
                          <td>{o.courier}<span className="ow-sub ow-id">{o.consignment}</span></td>
                          <td><StatusBadge tone={o.issue.code === 'failed' ? 'error' : 'warning'}>{o.issue.label}</StatusBadge>{o.issue.reason ? <span className="ow-sub">{o.issue.reason}</span> : null}</td>
                          <td className="ix-num">{o.issue.tries || '—'}</td>
                          <td className="ix-muted">{whenText(o.issue.at, now)}</td>
                          <td className="ix-muted">{issueNext(o.issue)}</td>
                          <td className="ix-num"><IssueActs o={o} openStep={openStep} /></td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </>) : (<>
                  <ul className="ix-plist" aria-label={tabLabel}>
                    {rows.map((o) => { const c = cells(o); return (
                      <li key={o.id}>
                        <div className="ix-pitem" role="button" tabIndex={0} onClick={(e) => { if (e.target.closest('input,label')) return; open(o); }}>
                          <span className="ix-pitem__top"><span>{selectable ? <input type="checkbox" checked={!!sel[o.id]} onChange={() => toggle(o.id)} aria-label={'Select ' + o.id} style={{ marginRight: 8 }} /> : null}<b className="ow-id">{o.id}</b></span><span>{o.total}</span></span>
                          <span className="ix-pitem__mid">{c.filter((x) => typeof x === 'string').slice(0, 2).join(' · ')}</span>
                          {q === 'courier' ? <span className="ix-pitem__tags">{c[3]}</span> : null}
                        </div>
                      </li>
                    ); })}
                  </ul>
                  <div className="ix-table-wrap">
                    <table className="ix-table gc-table--keep">
                      <caption className="sr-only">{tabLabel}</caption>
                      <thead><tr>
                        {selectable ? <th scope="col" className="ix-check"><input type="checkbox" checked={allOn} onChange={toggleAll} aria-label="Select every order" /></th> : null}
                        {cols.map((h) => <th key={h} scope="col" className={NUM[h] ? 'ix-num' : undefined}>{h}</th>)}
                      </tr></thead>
                      <tbody>{rows.map((o) => (
                        <tr key={o.id} className={sel[o.id] ? 'is-sel' : ''} onClick={(e) => { if (e.target.closest('a,button,input,label')) return; open(o); }}>
                          {selectable ? <td className="ix-check"><input type="checkbox" checked={!!sel[o.id]} onChange={() => toggle(o.id)} aria-label={'Select ' + o.id} /></td> : null}
                          <td>{q === 'payment' ? <button type="button" className="ix-strong ow-id" onClick={() => setReview(o.id)}>{o.id}</button> : <Link href={orderHref(o.id)} className="ix-strong ow-id">{o.id}</Link>}</td>
                          {cells(o).map((c, i) => <td key={i} className={NUM[cols[i + 1]] ? 'ix-num' : i === 0 ? undefined : 'ix-muted'}>{c}</td>)}
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </>)}
                <div className="ix-foot"><span>{plural(rows.length, 'order')}</span></div>
              </section>
              <LearnMore topic="order work" />
            </div>
          </div>
        </main>
      </div>

      <ReviewProofDialog open={!!reviewOrder} order={reviewOrder} proof={reviewOrder ? proofToReview(reviewOrder) : null} onClose={() => setReview(null)} onDone={() => { setReview(null); refresh(); }} />

      <AskDialog ask={ask} setAsk={setAsk} order={ask ? findOrder(ask.id, all) : null} answer={answer} step={step} />

      <Dialog open={!!pick} title={pick ? `Pick list · ${plural(pick.orders.length, 'order')}` : 'Pick list'} onClose={() => setPickIds(null)} width={720}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setPickIds(null)}>Close</button><button type="button" className="gc-btn gc-btn--solid" onClick={printPick}><Icon name="printer" width="16" height="16" aria-hidden="true" /> Print</button></>}>
        {pick ? (
          <div ref={docRef} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <section>
              <h3 className="ow-sec">Pick</h3>
              <table className="ow-pick">
                <thead><tr><th scope="col">Product</th><th scope="col">From</th><th scope="col">Bin</th><th scope="col" className="r">Qty</th><th scope="col">Orders</th></tr></thead>
                <tbody>{pick.lines.map((l) => (
                  <tr key={l.place + l.name}><td>{l.name}{l.sku ? <small className="ow-id">{l.sku}</small> : null}</td><td>{l.place}</td><td className="ow-id">{l.bins.length ? l.bins.join(', ') : '—'}</td><td className="r"><b>{l.qty}</b></td><td><small className="ow-id">{l.orders.join(', ')}</small></td></tr>
                ))}</tbody>
              </table>
            </section>
            <section>
              <h3 className="ow-sec">Pack</h3>
              <div className="ow-pack">
                {pick.orders.map((o) => (
                  <div key={o.id}>
                    <b className="ow-id">{o.id}</b>{o.customer} · {o.zone}
                    <ul>{o.lines.map((l, i) => <li key={i}>{l.qty} × {l.name}</li>)}<li>Slip printed and attached</li><li>Packed</li></ul>
                  </div>
                ))}
              </div>
            </section>
            <p className="gc-help" style={{ margin: 0 }}>Made {formatTime(Date.now())}, {formatDate(Date.now())}</p>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}

/** Call, WhatsApp and the answers for one order in the confirmation queue. */
function ConfirmActs({ o, answer, openAnswer, wrap }) {
  const tel = digits(o.phone);
  return (
    <span className={wrap ? 'ow-pacts' : 'ow-acts'}>
      <a className="ix-btn ix-btn--sm ix-btn--icon" href={'tel:' + tel} aria-label={'Call ' + o.phone} title="Call"><Icon name="phone" width="16" height="16" aria-hidden="true" /></a>
      <a className="ix-btn ix-btn--sm ix-btn--icon" href={'https://wa.me/88' + tel} target="_blank" rel="noreferrer" aria-label={'WhatsApp ' + o.phone} title="WhatsApp"><Icon name="message-circle" width="16" height="16" aria-hidden="true" /></a>
      <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => answer(o, 'confirmed')}><Icon name="check" width="16" height="16" aria-hidden="true" />Confirmed</button>
      <button type="button" className="ix-btn ix-btn--sm" onClick={() => openAnswer(o, 'no-answer')}>No answer</button>
      <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" items={[
        { label: 'Call later', icon: 'alarm-clock', onClick: () => openAnswer(o, 'call-later') },
        { label: 'Wants a change', icon: 'pencil', onClick: () => openAnswer(o, 'wants-change') },
        { label: 'Needs advance', icon: 'hand-coins', onClick: () => openAnswer(o, 'needs-advance') },
        { label: 'Cancel order', icon: 'circle-x', tone: 'danger', onClick: () => openAnswer(o, 'cancel') },
      ]} />
    </span>
  );
}

/** Call and the steps for one parcel in the delivery issues queue. */
function IssueActs({ o, openStep, wrap }) {
  const tel = digits(o.phone);
  return (
    <span className={wrap ? 'ow-pacts' : 'ow-acts'}>
      <a className="ix-btn ix-btn--sm ix-btn--icon" href={'tel:' + tel} aria-label={'Call ' + o.phone} title="Call"><Icon name="phone" width="16" height="16" aria-hidden="true" /></a>
      <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => openStep(o, 'reschedule')}><Icon name="calendar-clock" width="16" height="16" aria-hidden="true" />Reschedule</button>
      <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" items={[
        { label: 'Log call', icon: 'phone-call', onClick: () => openStep(o, 'called') },
        { label: 'Fix address', icon: 'map-pin', onClick: () => openStep(o, 'address') },
        { label: 'Tell courier', icon: 'truck', onClick: () => openStep(o, 'courier') },
        { label: 'Approve return', icon: 'undo-2', tone: 'danger', onClick: () => openStep(o, 'return') },
      ]} />
    </span>
  );
}

const ASK_TITLE = { 'no-answer': 'No answer', 'call-later': 'Call later', 'wants-change': 'Wants a change', 'needs-advance': 'Ask for an advance', cancel: 'Cancel order', called: 'Log call', reschedule: 'Reschedule delivery', address: 'Fix address', courier: 'Tell courier', return: 'Approve return' };

/** The one dialog for an answer or a step that needs a time, a note, an amount or a reason. */
function AskDialog({ ask, setAsk, order, answer, step }) {
  if (!ask || !order) return null;
  const set = (patch) => setAsk({ ...ask, ...patch });
  const close = () => setAsk(null);
  const isConfirm = ask.kind === 'confirm';
  const danger = ask.act === 'cancel' || ask.act === 'return';
  const save = () => {
    if (!isConfirm) { step(); return; }
    if (ask.act === 'no-answer' || ask.act === 'call-later') answer(order, ask.act, { retryAt: ask.retry === 'custom' ? new Date(ask.custom).getTime() || 0 : ask.when, note: ask.note.trim() });
    else if (ask.act === 'wants-change') answer(order, ask.act, { note: ask.note.trim() });
    else if (ask.act === 'needs-advance') answer(order, ask.act, { amount: Number(ask.amount) || 0, note: ask.note.trim() });
    else if (ask.act === 'cancel') answer(order, ask.act, { reason: ask.reason });
  };
  const label = { cancel: 'Cancel order', return: 'Approve return', 'needs-advance': 'Send payment link', courier: 'Send message' }[ask.act] || 'Save';
  const id = (n) => 'ow-ask-' + n;
  return (
    <Dialog open title={ASK_TITLE[ask.act] + ' · ' + order.id} onClose={close} width={460}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={close}>Back</button><button type="button" className={'gc-btn gc-btn--solid' + (danger ? ' gc-btn--error' : '')} onClick={save}>{label}</button></>}>
      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        <p className="gc-help" style={{ margin: 0 }}>{order.customer} · <a href={'tel:' + digits(order.phone)}>{order.phone}</a> · {order.total}</p>
        {ask.act === 'no-answer' || ask.act === 'call-later' ? (<>
          <div>
            <span className="gc-label" id={id('when')}>Call again</span>
            <div className="ow-chips" role="group" aria-labelledby={id('when')}>
              {RETRY.map(([k, l, f]) => <button key={k} type="button" className="ow-chip" aria-pressed={ask.retry === k} onClick={() => set({ retry: k, when: f(clockNow()) })}>{l}</button>)}
              <button type="button" className="ow-chip" aria-pressed={ask.retry === 'custom'} onClick={() => set({ retry: 'custom' })}>Pick a time</button>
            </div>
          </div>
          {ask.retry === 'custom' ? <div><label className="gc-label" htmlFor={id('at')}>Date and time</label><input id={id('at')} type="datetime-local" className="gc-input" value={ask.custom} onChange={(e) => set({ custom: e.target.value })} /></div> : null}
          <div><label className="gc-label" htmlFor={id('note')}>Note (optional)</label><input id={id('note')} className="gc-input" value={ask.note} onChange={(e) => set({ note: e.target.value })} placeholder={ask.act === 'call-later' ? 'e.g. In a meeting, call after 5 PM' : 'e.g. Phone switched off'} /></div>
          <p className="gc-help" style={{ margin: 0 }}>The order stays on hold. The next call is added to Calls.</p>
        </>) : null}
        {ask.act === 'wants-change' ? <div><label className="gc-label" htmlFor={id('note')}>What should change?</label><textarea id={id('note')} className="gc-input" rows="3" data-autofocus value={ask.note} onChange={(e) => set({ note: e.target.value })} placeholder="e.g. Blue colour instead of black, deliver after 6 PM" /><p className="gc-help">Edit the order on its page, then confirm it.</p></div> : null}
        {ask.act === 'needs-advance' ? (<>
          <div><label className="gc-label" htmlFor={id('amt')}>Advance (৳)</label><input id={id('amt')} className="gc-input" type="number" min="1" inputMode="numeric" data-autofocus value={ask.amount} onChange={(e) => set({ amount: e.target.value })} /></div>
          <p className="gc-help" style={{ margin: 0 }}>A payment link for this amount goes to the customer. Approve the order on its page once the advance is in.</p>
        </>) : null}
        {ask.act === 'cancel' ? <div><label className="gc-label" htmlFor={id('why')}>Why is it cancelled?</label><select id={id('why')} className="gc-input gc-select" data-autofocus value={ask.reason} onChange={(e) => set({ reason: e.target.value })}><option value="">Choose a reason</option>{CANCEL_REASONS.map((r) => <option key={r}>{r}</option>)}</select><p className="gc-help">Held stock goes back on sale.</p></div> : null}
        {ask.act === 'called' ? <div><label className="gc-label" htmlFor={id('note')}>What did the customer say?</label><textarea id={id('note')} className="gc-input" rows="3" data-autofocus value={ask.note} onChange={(e) => set({ note: e.target.value })} placeholder="e.g. Will be home after 6 PM tomorrow" /></div> : null}
        {ask.act === 'reschedule' ? (<>
          <div><label className="gc-label" htmlFor={id('day')}>New delivery day</label><input id={id('day')} type="date" className="gc-input" min={ask.min} value={ask.date} onChange={(e) => set({ date: e.target.value })} /></div>
          <div><label className="gc-label" htmlFor={id('note')}>Note for the rider (optional)</label><input id={id('note')} className="gc-input" value={ask.note} onChange={(e) => set({ note: e.target.value })} placeholder="e.g. Call 30 minutes before" /></div>
        </>) : null}
        {ask.act === 'address' ? <div><label className="gc-label" htmlFor={id('addr')}>Delivery address</label><textarea id={id('addr')} className="gc-input" rows="3" data-autofocus value={ask.address} onChange={(e) => set({ address: e.target.value })} /></div> : null}
        {ask.act === 'courier' ? <div><label className="gc-label" htmlFor={id('note')}>Message for {order.courier}</label><textarea id={id('note')} className="gc-input" rows="3" data-autofocus value={ask.note} onChange={(e) => set({ note: e.target.value })} placeholder="e.g. Customer is available after 6 PM, please try again" /></div> : null}
        {ask.act === 'return' ? <div><label className="gc-label" htmlFor={id('why')}>Reason</label><select id={id('why')} className="gc-input gc-select" data-autofocus value={ask.reason} onChange={(e) => set({ reason: e.target.value })}>{RTO_REASONS.map((r) => <option key={r}>{r}</option>)}</select><p className="gc-help">The courier brings the parcel back. Receive it in Courier returns.</p></div> : null}
      </div>
    </Dialog>
  );
}
