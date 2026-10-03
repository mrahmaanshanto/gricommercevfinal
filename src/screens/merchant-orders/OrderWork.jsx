'use client';
// OrderWork — Orders › Order work (/order-work?q=…): focused queues around the order list (Nayeem's Sales & Orders
// brief #4: "child workspaces" — courier review, payment review, pick & pack, print queue, quotes, edits to review).
//   courier   Ready for courier orders with a check per order (courier, phone, address); book the selected ones in
//             the background (orderJobs.js), results per order with Retry
//   payment   orders with a payment proof waiting; Review opens Accept / Reject (paymentProof.js)
//   pick      Approved orders not packed yet; select them for one pick list grouped by product (with bins) and a
//             packing checklist per order, printed together
//   print     Approved orders whose slip isn't printed; labels are prepared in the background and print together
//   quotes    quotes / proformas for wholesale buyers that convert into an order (quotes.js, QuoteDialog.jsx)
//   edits     changes asked for review (orderEdit.js); each is reviewed on its order page
// A list page (docs/shopify-style.md): ShopHeader, one card with the queue tabs, bulk bar, table / phone list.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { Sidebar, Topbar } from '@/shell/Shell';
import { EmptyState, StatusBadge, Dialog } from '@/components/ui';
import { ShopHeader, IndexTabs, LearnMore } from '@/components/ui/IndexKit';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { getOrders, orderHref, holdPlaceOf, isCounterSale, findOrder } from '@/lib/orders';
import { prepOf, COURIERS, syncCourier } from '@/lib/orderFlow';
import { productBy } from '@/lib/stock';
import { binsFor } from '@/lib/racks';
import { ordersToReview, proofToReview, methodLabel } from '@/lib/paymentProof';
import { ordersWithEditRequests, editRequestOf } from '@/lib/orderEdit';
import { getQuotes, quoteTotals, quoteState, QUOTE_STATE } from '@/lib/quotes';
import { startJob } from '@/lib/orderJobs';
import { printNode } from '@/lib/printNode';
import { OrderJobs } from '@/screens/merchant-orders/OrderJobs';
import { ReviewProofDialog } from '@/screens/merchant-orders/ProofDialogs';
import QuoteDialog from '@/screens/merchant-orders/QuoteDialog';

const QUEUES = [
  { key: 'courier', label: 'Courier review' },
  { key: 'payment', label: 'Payment review' },
  { key: 'pick', label: 'Pick & pack' },
  { key: 'print', label: 'Print queue' },
  { key: 'quotes', label: 'Quotes' },
  { key: 'edits', label: 'Edits to review' },
];
const EMPTY = { courier: 'No orders ready for the courier', payment: 'No payments to review', pick: 'Nothing to pick', print: 'No labels to print', quotes: 'No quotes yet', edits: 'No edits to review' };
const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many || one + 's');
const digits = (p) => String(p || '').replace(/\D/g, '').replace(/^88/, '');

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
`;

export default function OrderWork() {
  const [ready, setReady] = useState(false);
  const [q, setQ] = useState('courier');
  const [tick, setTick] = useState(0);
  const [sel, setSel] = useState({});
  const [review, setReview] = useState(null);    // order id whose payment proof is open
  const [pickIds, setPickIds] = useState(null);  // order ids on the pick list being shown
  const [quote, setQuote] = useState(null);      // { id } open in the quote dialog ('' = new)
  const docRef = useRef(null);
  const refresh = () => setTick((t) => t + 1);

  useEffect(() => {
    const read = () => { const p = new URLSearchParams(window.location.search).get('q'); setQ(QUEUES.some((x) => x.key === p) ? p : 'courier'); };
    read(); syncCourier(); setReady(true);
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
  const lists = useMemo(() => ({
    courier: online.filter((o) => o.statusKey === 'ready'),
    payment: ordersToReview(all),
    pick: online.filter((o) => o.statusKey === 'approved' && !prepOf(o).packed),
    print: online.filter((o) => o.statusKey === 'approved' && !prepOf(o).slipPrinted),
    edits: ordersWithEditRequests(all),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [all]);
  const quotes = useMemo(() => (ready ? getQuotes() : []), [ready, tick]);
  const counts = { ...Object.fromEntries(Object.entries(lists).map(([k, v]) => [k, v.length])), quotes: quotes.filter((x) => ['draft', 'sent', 'accepted'].includes(quoteState(x))).length };
  const rows = q === 'quotes' ? [] : lists[q] || [];
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
                about="Queues around the order list: courier booking, payment review, pick and pack, labels to print, quotes for wholesale buyers and edits to review."
                more={[{ label: 'All orders', href: '/merchant-orders' }, { label: 'Order settings', href: '/order-settings' }]}
                primary={q === 'quotes' ? { label: 'New quote', onClick: () => setQuote({ id: '' }) } : undefined} />

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

                {q === 'quotes' ? (
                  quotes.length ? (<>
                    <ul className="ix-plist" aria-label="Quotes">
                      {quotes.map((x) => { const st = quoteState(x); return (
                        <li key={x.id}><button type="button" className="ix-pitem" onClick={() => setQuote({ id: x.id })}>
                          <span className="ix-pitem__top"><b className="ow-id">{x.id}</b><span>{formatBDT(quoteTotals(x).total)}</span></span>
                          <span className="ix-pitem__mid">{x.customer.name} · {formatDate(x.at)}</span>
                          <span className="ix-pitem__tags"><StatusBadge tone={QUOTE_STATE[st][1]}>{QUOTE_STATE[st][0]}</StatusBadge></span>
                        </button></li>
                      ); })}
                    </ul>
                    <div className="ix-table-wrap">
                      <table className="ix-table gc-table--keep">
                        <caption className="sr-only">Quotes</caption>
                        <thead><tr><th scope="col">Quote</th><th scope="col">Date</th><th scope="col">Buyer</th><th scope="col" className="ix-num">Total</th><th scope="col">Valid until</th><th scope="col">Status</th></tr></thead>
                        <tbody>{quotes.map((x) => { const st = quoteState(x); return (
                          <tr key={x.id} onClick={() => setQuote({ id: x.id })}>
                            <td><button type="button" className="ix-strong ow-id" onClick={(e) => { e.stopPropagation(); setQuote({ id: x.id }); }}>{x.id}</button></td>
                            <td className="ix-muted">{formatDate(x.at)}</td>
                            <td>{x.customer.name}</td>
                            <td className="ix-num">{formatBDT(quoteTotals(x).total)}</td>
                            <td className="ix-muted">{x.validUntil ? formatDate(x.validUntil) : '—'}</td>
                            <td><StatusBadge tone={QUOTE_STATE[st][1]}>{QUOTE_STATE[st][0]}</StatusBadge>{x.orderId ? <span className="ix-muted"> · {x.orderId}</span> : null}</td>
                          </tr>
                        ); })}</tbody>
                      </table>
                    </div>
                  </>) : <div className="ix-empty"><EmptyState icon="file-text" title={EMPTY.quotes} actionLabel="New quote" onAction={() => setQuote({ id: '' })} /></div>
                ) : !ready ? <div className="ix-empty" /> : rows.length === 0 ? (
                  <div className="ix-empty"><EmptyState icon="circle-check" title={EMPTY[q]} /></div>
                ) : (<>
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
                <div className="ix-foot"><span>{q === 'quotes' ? plural(quotes.length, 'quote') : plural(rows.length, 'order')}</span></div>
              </section>
              <LearnMore topic="order work" />
            </div>
          </div>
        </main>
      </div>

      <ReviewProofDialog open={!!reviewOrder} order={reviewOrder} proof={reviewOrder ? proofToReview(reviewOrder) : null} onClose={() => setReview(null)} onDone={() => { setReview(null); refresh(); }} />
      <QuoteDialog open={quote} onClose={() => setQuote(null)} onDone={() => { setQuote(null); refresh(); }} />

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
