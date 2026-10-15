'use client';
// ReturnRequests — Orders › Return requests (/return-requests, ON-F8): returns customers asked for on the tracking page
// (or staff asked for them on the order page), worked through in steps: approve or reject → book the courier pickup →
// receive and check it (good back on sale, damaged to the damaged bay) → refund (refunds.js) or send the same items
// again as a new order. The list shows the stage; a row opens the request in a side panel with its next step in the
// footer. ?id=RR-0001 opens one. Logic: src/lib/returnRequests.js. Counter returns stay on Return & exchange.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { EmptyState, StatusBadge, Sheet } from '@/components/ui';
import { ShopHeader, IndexTabs, KV, LearnMore } from '@/components/ui/IndexKit';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { orderHref } from '@/lib/orders';
import { COURIERS } from '@/lib/orderFlow';
import { currentUser } from '@/lib/team';
import {
  returnRequests, returnRequestBy, approveReturn, rejectReturn, bookReturnPickup, receiveReturnRequest, refundReturn, exchangeReturn,
  requestValue, RR_LABEL, RR_TONE, RR_REJECT, REFUND_TO, RETURN_REQUESTS_EVENT,
} from '@/lib/returnRequests';

const TABS = [['open', 'Open', ['requested', 'approved', 'pickup', 'received']], ['requested', 'To review', ['requested']], ['pickup', 'To collect', ['approved', 'pickup']], ['received', 'To refund', ['received']], ['done', 'Done', ['refunded', 'exchanged']], ['rejected', 'Rejected', ['rejected']]];
const tone = (stage) => (RR_TONE[stage] === 'primary' ? 'info' : RR_TONE[stage]);
const formFor = (r) => ({ courier: COURIERS[0], reject: RR_REJECT[0], amount: String(requestValue(r)), method: (r.refundTo && r.refundTo.method) || 'bKash', number: (r.refundTo && r.refundTo.number) || String(r.phone || '').replace(/\D/g, '').replace(/^88(?=01)/, ''), rows: Object.fromEntries(r.lines.map((l) => [l.name, { good: l.qty, damaged: 0 }])) });
const me = () => { try { return currentUser().name || 'Staff'; } catch { return 'Staff'; } };

const CSS = `
.rr-id{font-family:var(--font-data)}
.rr-items{display:block;max-width:280px;overflow:hidden;text-overflow:ellipsis}
.rr-body{display:flex;flex-direction:column;gap:var(--space-4)}
.rr-sec h3{margin:0 0 var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.rr-rows{display:flex;flex-direction:column;gap:var(--space-2)}
.rr-row{display:grid;grid-template-columns:minmax(0,1fr) 76px 76px;gap:var(--space-2);align-items:center;font-size:var(--text-sm)}
.rr-row input{text-align:right}
.rr-row.is-head{font-size:var(--text-xs);color:var(--text-muted)}
.rr-row.is-head span:not(:first-child){text-align:right}
.rr-hist{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;font-size:var(--text-xs);color:var(--text-muted)}
.rr-hist b{font-weight:var(--weight-medium);color:var(--text-heading)}
.rr-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
@media (max-width:640px){.rr-two{grid-template-columns:minmax(0,1fr)}}
`;

export default function ReturnRequests() {
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);
  const [tab, setTab] = useState('open');
  const [openId, setOpenId] = useState('');
  const [form, setForm] = useState({});   // the step being filled in the side panel

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (id) { setOpenId(id); const r = returnRequestBy(id); if (r) { setTab(TABS.find((t) => t[2].includes(r.stage))[0]); setForm(formFor(r)); } }
    setReady(true);
    const again = () => setTick((t) => t + 1);
    window.addEventListener(RETURN_REQUESTS_EVENT, again);
    return () => window.removeEventListener(RETURN_REQUESTS_EVENT, again);
  }, []);

  const all = useMemo(() => (ready ? returnRequests() : []), [ready, tick]);
  const inTab = (t) => all.filter((r) => TABS.find((x) => x[0] === t)[2].includes(r.stage));
  const rows = inTab(tab);
  const tabs = TABS.map(([k, label]) => ({ key: k, id: 'rr-tab-' + k, label, count: inTab(k).length, on: tab === k, onClick: () => setTab(k) }));
  const rq = openId ? all.find((r) => r.id === openId) || null : null;

  const open = (r) => {
    setOpenId(r.id);
    setForm(formFor(r));
    window.history.replaceState(null, '', '/return-requests?id=' + encodeURIComponent(r.id));
  };
  const close = () => { setOpenId(''); window.history.replaceState(null, '', '/return-requests'); };
  const done = (msg, ok = true) => { setTick((t) => t + 1); toast(msg, ok ? undefined : { tone: 'error' }); };

  const act = {
    approve: () => { if (approveReturn(rq.id, me())) done('Return approved'); },
    reject: () => { if (rejectReturn(rq.id, form.reject, me())) { done('Return rejected'); close(); } },
    pickup: () => { const r = bookReturnPickup(rq.id, form.courier, me()); if (r) done(`Pickup booked · ${r.pickup.courier} ${r.pickup.id}`); },
    receive: () => {
      const r = receiveReturnRequest(rq.id, Object.entries(form.rows || {}).map(([name, x]) => ({ name, good: x.good, damaged: x.damaged })), me());
      if (r) done('Received · stock updated'); else done('Enter what came back', false);
    },
    refund: () => { const r = refundReturn(rq.id, { amount: form.amount, method: form.method, number: form.number }, me()); if (r.ok) { done(r.refund ? `Refund ${r.refund.id} made` : 'Store credit given'); } else done(r.error, false); },
    exchange: () => { const r = exchangeReturn(rq.id, me()); if (r.ok) done('New order ' + r.order.id + ' made'); else done(r.error, false); },
  };
  const setRow = (name, k) => (e) => setForm((f) => ({ ...f, rows: { ...f.rows, [name]: { ...f.rows[name], [k]: Math.max(0, Number(e.target.value) || 0) } } }));

  const footer = !rq ? null : rq.stage === 'requested' ? (<>
    <button type="button" className="gc-btn gc-btn--neutral" onClick={act.reject}>Reject</button>
    <button type="button" className="gc-btn gc-btn--solid" onClick={act.approve}>Approve</button>
  </>) : rq.stage === 'approved' ? (<>
    <button type="button" className="gc-btn gc-btn--neutral" onClick={act.receive}>Received at the shop</button>
    <button type="button" className="gc-btn gc-btn--solid" onClick={act.pickup}>Book pickup</button>
  </>) : rq.stage === 'pickup' ? (
    <button type="button" className="gc-btn gc-btn--solid" onClick={act.receive}>Mark as received</button>
  ) : rq.stage === 'received' ? (<>
    <button type="button" className={'gc-btn ' + (rq.want === 'exchange' ? 'gc-btn--neutral' : 'gc-btn--solid')} onClick={act.refund}>Refund</button>
    <button type="button" className={'gc-btn ' + (rq.want === 'exchange' ? 'gc-btn--solid' : 'gc-btn--neutral')} onClick={act.exchange}>Send again</button>
  </>) : null;

  return (
    <div className="dc-screen ds" data-screen="ReturnRequests">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="orders-returns" />
        <main className="gc-shell__main">
          <Topbar crumb="Orders" page="Return requests" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="undo-2" title="Return requests"
                about="Returns of delivered online orders, asked for by customers on their tracking page or by staff on the order page. Approve or reject, book the courier pickup, check what came back, then refund or send the items again. Counter returns are done on Return & exchange."
                secondary={[{ label: 'Return & exchange', href: '/return-exchange' }]}
                more={[{ label: 'Return history', href: '/return-history' }, { label: 'Refunds', href: '/payment-ops' }, { label: 'Order settings', href: '/order-settings' }]} />

              <section className="ix-card" aria-label="Return requests">
                <div className="ix-bar"><IndexTabs tabs={tabs} label="Return requests by stage" /></div>
                {!ready ? <div style={{ minHeight: 160 }} aria-busy="true" /> : rows.length === 0 ? (
                  <div className="ix-empty"><EmptyState icon="undo-2" title={tab === 'open' ? 'No open returns' : 'Nothing here'} /></div>
                ) : (<>
                  <ul className="ix-plist" aria-label="Return requests">
                    {rows.map((r) => (
                      <li key={r.id}>
                        <button type="button" className="ix-pitem" onClick={() => open(r)} style={{ width: '100%', border: 0, background: 'none', textAlign: 'left', font: 'inherit' }}>
                          <span className="ix-pitem__top"><b className="rr-id">{r.id} · {r.order}</b><span>{formatBDT(requestValue(r))}</span></span>
                          <span className="ix-pitem__mid">{r.customer} · {r.lines.map((l) => `${l.name} × ${l.qty}`).join(', ')}</span>
                          <span className="ix-pitem__tags"><StatusBadge tone={tone(r.stage)}>{RR_LABEL[r.stage]}</StatusBadge><StatusBadge tone="neutral">{r.want === 'exchange' ? 'Exchange' : 'Refund'}</StatusBadge></span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="ix-table-wrap">
                    <table className="ix-table gc-table--keep">
                      <caption className="sr-only">Return requests</caption>
                      <thead><tr><th scope="col">Request</th><th scope="col">Asked</th><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Items</th><th scope="col">Wants</th><th scope="col">Stage</th><th scope="col" className="ix-num">Value</th></tr></thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr key={r.id} onClick={(e) => { if (!e.target.closest('a,button')) open(r); }} style={{ cursor: 'pointer' }}>
                            <td><button type="button" className="ix-strong rr-id" style={{ border: 0, background: 'none', padding: 0, font: 'inherit', cursor: 'pointer' }} onClick={() => open(r)}>{r.id}</button></td>
                            <td className="ix-muted">{formatDate(r.at)}</td>
                            <td><Link href={orderHref(r.order)} className="rr-id">{r.order}</Link></td>
                            <td>{r.customer}</td>
                            <td className="ix-muted"><span className="rr-items">{r.lines.map((l) => `${l.name} × ${l.qty}`).join(', ')}</span></td>
                            <td>{r.want === 'exchange' ? 'Exchange' : 'Refund'}</td>
                            <td><StatusBadge tone={tone(r.stage)}>{RR_LABEL[r.stage]}</StatusBadge></td>
                            <td className="ix-num">{formatBDT(requestValue(r))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>)}
              </section>
              <LearnMore topic="returns" />
            </div>
          </div>
        </main>
      </div>

      <Sheet open={!!rq} title={rq ? 'Return ' + rq.id : 'Return'} onClose={close} footer={footer}>
        {rq ? (
          <div className="rr-body">
            <KV rows={[
              ['Stage', <StatusBadge key="s" tone={tone(rq.stage)}>{RR_LABEL[rq.stage]}</StatusBadge>],
              ['Order', <Link key="o" href={orderHref(rq.order)} className="rr-id">{rq.order}</Link>],
              ['Customer', rq.customer + (rq.phone ? ' · ' + rq.phone : '')],
              ['Reason', rq.reason + (rq.note ? ' · ' + rq.note : '')],
              ['Wants', rq.want === 'exchange' ? 'The same item again' : 'Money back' + (rq.refundTo ? ` · ${rq.refundTo.method}${rq.refundTo.number ? ' ' + rq.refundTo.number : ''}` : '')],
              rq.pickup ? ['Pickup', `${rq.pickup.courier} · ${rq.pickup.id}`] : null,
              rq.refund ? ['Refund', `${formatBDT(rq.refund.amount)} · ${rq.refund.method}${rq.refund.id ? ' · ' + rq.refund.id : ''}`] : null,
              rq.exchange ? ['New order', <Link key="x" href={orderHref(rq.exchange.order)} className="rr-id">{rq.exchange.order}</Link>] : null,
              rq.rejectReason ? ['Rejected', rq.rejectReason] : null,
            ].filter(Boolean)} />

            <div className="rr-sec">
              <h3>Items</h3>
              {['approved', 'pickup'].includes(rq.stage) ? (
                <div className="rr-rows">
                  <div className="rr-row is-head"><span>Item</span><span>Good</span><span>Damaged</span></div>
                  {rq.lines.map((l) => (
                    <div key={l.name} className="rr-row">
                      <span>{l.name} × {l.qty}</span>
                      <input className="gc-input" type="number" min="0" max={l.qty} inputMode="numeric" aria-label={'Good ' + l.name} value={(form.rows && form.rows[l.name] ? form.rows[l.name].good : l.qty)} onChange={setRow(l.name, 'good')} />
                      <input className="gc-input" type="number" min="0" max={l.qty} inputMode="numeric" aria-label={'Damaged ' + l.name} value={(form.rows && form.rows[l.name] ? form.rows[l.name].damaged : 0)} onChange={setRow(l.name, 'damaged')} />
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="rr-hist">{rq.lines.map((l) => <li key={l.name}><b>{l.name} × {l.qty}</b> · {formatBDT(l.price * l.qty)}</li>)}</ul>
              )}
            </div>

            {rq.stage === 'requested' ? (
              <div><label className="gc-label" htmlFor="rr-reject">If you reject it</label><select id="rr-reject" className="gc-input gc-select" value={form.reject || RR_REJECT[0]} onChange={(e) => setForm({ ...form, reject: e.target.value })}>{RR_REJECT.map((x) => <option key={x}>{x}</option>)}</select></div>
            ) : null}
            {rq.stage === 'approved' ? (
              <div><label className="gc-label" htmlFor="rr-courier">Pickup by</label><select id="rr-courier" className="gc-input gc-select" value={form.courier || COURIERS[0]} onChange={(e) => setForm({ ...form, courier: e.target.value })}>{COURIERS.map((x) => <option key={x}>{x}</option>)}</select></div>
            ) : null}
            {rq.stage === 'received' ? (
              <div className="rr-two">
                <div><label className="gc-label" htmlFor="rr-amt">Refund (৳)</label><input id="rr-amt" className="gc-input" type="number" min="1" inputMode="numeric" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
                <div><label className="gc-label" htmlFor="rr-method">Refund to</label><select id="rr-method" className="gc-input gc-select" value={form.method || 'bKash'} onChange={(e) => setForm({ ...form, method: e.target.value })}>{REFUND_TO.map((x) => <option key={x}>{x}</option>)}</select></div>
                {['bKash', 'Nagad'].includes(form.method) ? <div><label className="gc-label" htmlFor="rr-num">{form.method} number</label><input id="rr-num" className="gc-input" inputMode="tel" value={form.number || ''} onChange={(e) => setForm({ ...form, number: e.target.value })} /></div> : null}
              </div>
            ) : null}

            <div className="rr-sec">
              <h3>History</h3>
              <ul className="rr-hist">
                {(rq.history || []).slice().reverse().map((h, i) => <li key={i}><b>{RR_LABEL[h.stage] || h.stage}</b> · {formatTime(h.at)}, {formatDate(h.at)} · {h.by}{h.note ? ' · ' + h.note : ''}</li>)}
              </ul>
            </div>
          </div>
        ) : null}
      </Sheet>
    </div>
  );
}
