'use client';
// CourierReturns — parcels the courier brings back (RTO). Every online order marked Returned is listed.
// Open one, count what arrived per item and say whether it is good or damaged. A partial return is
// fine: the rest stays "still with the courier" until the next receipt.
//   good     the stock hold is released (or the stock is added back) at the order's hold place
//   damaged  set aside at Returns & damaged, not for sale
// Each receipt is also written to the returns history.
// When the order was paid or part paid, the receive dialog also asks for the refund (default: the value
// of what came back, never more than was paid and not yet refunded). A refund is kept on the history row
// (money 'refunded', amount, method) and posted to the ledger; "No refund" is for COD not collected.
// Laid out like Shopify's lists (components/ui/IndexKit.jsx): the list shows the order, date, customer, courier,
// what is back and the state; phone, tracking ID, reason and items are in the receive dialog (the record).
// Front end only: orders and receipts come from src/lib/orders.js.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Dialog, EmptyState, StatusBadge } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, LearnMore } from '@/components/ui/IndexKit';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { DAMAGED_PLACE } from '@/lib/locations';
import { EMPLOYEES } from '@/lib/posStore';
import { getOrders, courierReturns, rtoState, receiveReturn, holdPlaceOf, orderHref, logOrder } from '@/lib/orders';
import { setRefund, refundedFor } from '@/lib/returns';
import { postEntry, accountForMethod, accountBy } from '@/lib/ledger';

const TABS = [['waiting', 'Still with courier'], ['done', 'Received'], ['all', 'All']];
const STATE = { courier: ['With courier', 'warning'], partial: ['Partly received', 'info'], received: ['Received', 'success'] };
const COURIERS = ['Steadfast', 'Pathao', 'Carrybee', 'RedX'];
const pc = (n) => n + (n === 1 ? ' pc' : ' pcs');   // "1 pc", "3 pcs"
const num = (v) => Math.max(0, Math.floor(Number(v) || 0));
const digits = (t) => String(t || '').replace(/\D/g, '');
const REFUND_METHODS = [['bKash', 'bKash'], ['Nagad', 'Nagad'], ['Cash', 'Cash'], ['Bank', 'Bank transfer'], ['none', 'No refund (COD not collected)']];
/** What the customer paid on an order before it came back (0 for cash on delivery). */
const paidOn = (o) => (o.paid != null ? o.paid : o.payment === 'Paid' || o.payment === 'Partial' ? o.amount : 0);

const CSS = `
.cr-id{font-family:var(--font-data)}
.cr-pbtn{width:100%;border:0;background:none;font:inherit;text-align:left;cursor:pointer}
.cr-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.cr-strong{font-weight:var(--weight-medium);color:var(--text-heading)}
.cr-num{text-align:right;font-variant-numeric:tabular-nums}
.cr-form{display:flex;flex-direction:column;gap:var(--space-4)}
.cr-lines{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.cr-lines th{padding:0 var(--space-2) var(--space-2) 0;border-bottom:1px solid var(--border-subtle);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:left}
.cr-lines td{padding:var(--space-2) var(--space-2) var(--space-2) 0;border-bottom:1px solid var(--border-subtle);vertical-align:middle}
.cr-lines .cr-num{padding-right:var(--space-3)}
.cr-qty{width:80px}
.cr-err{color:var(--text-danger)}
.cr-receipts{display:flex;flex-direction:column;gap:var(--space-2);margin:0;padding:0;list-style:none}
.cr-receipts li{padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm);color:var(--text-body)}
.cr-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.cr-refund{display:flex;flex-direction:column;gap:var(--space-3);margin:0;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.cr-refund h3{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
@media (max-width:599px){.cr-two{grid-template-columns:1fr}.cr-qty{width:64px}}
`;

export default function CourierReturns() {
  const [all, setAll] = useState([]);
  const [tab, setTab] = useState('waiting');
  const [find, setFind] = useState(false);
  const [q, setQ] = useState('');
  const [courier, setCourier] = useState('');
  const [form, setForm] = useState(null);   // { id, rows: { [name]: { good, damaged } }, by }

  const openFor = (o) => setForm({ id: o.id, by: EMPLOYEES[0].name, rows: Object.fromEntries(o.lines.map((l) => [l.name, { good: '', damaged: '' }])), refund: null, method: 'bKash' });
  useEffect(() => {
    const list = getOrders();
    setAll(list);
    const want = new URLSearchParams(window.location.search).get('id');
    const o = want && courierReturns(list).find((x) => x.id === want);
    if (o) { openFor(o); if (!rtoState(o).left) setTab('done'); }
  }, []);

  const rows = courierReturns(all).map((o) => ({ o, s: rtoState(o) }));
  const groups = { waiting: rows.filter((r) => r.s.left > 0), done: rows.filter((r) => r.s.left === 0), all: rows };
  const needle = q.trim().toLowerCase();
  const shown = groups[tab].filter(({ o }) => (!courier || o.courier === courier)
    && (!needle || [o.id, o.customer, o.phone, o.consignment].join(' ').toLowerCase().includes(needle) || (digits(needle).length > 2 && digits(o.id + ' ' + o.phone).includes(digits(needle)))));
  const pcs = (list, k) => list.reduce((a, r) => a + r.s[k], 0);
  const searching = find || !!q || !!courier;
  const closeFind = () => { setFind(false); setQ(''); setCourier(''); };

  const cur = form ? rows.find((r) => r.o.id === form.id) : null;
  const setRow = (name, k, value) => setForm({ ...form, rows: { ...form.rows, [name]: { ...form.rows[name], [k]: value } } });
  const lineErr = (l) => { const x = form.rows[l.name]; return num(x.good) + num(x.damaged) > l.left; };
  const taking = cur ? cur.s.lines.reduce((a, l) => a + num(form.rows[l.name].good) + num(form.rows[l.name].damaged), 0) : 0;
  const bad = cur ? cur.s.lines.some(lineErr) : false;

  // refund: only for orders the customer paid (fully or in part) before the parcel came back
  const paid = cur ? paidOn(cur.o) : 0;
  const refundedBefore = cur && paid > 0 ? refundedFor(cur.o.id) : 0;
  const canRefund = Math.max(0, paid - refundedBefore);
  const backValue = cur ? cur.s.lines.reduce((a, l) => a + (num(form.rows[l.name].good) + num(form.rows[l.name].damaged)) * (Number(l.price) || 0), 0) : 0;
  const asksRefund = !!cur && paid > 0 && cur.s.left > 0;
  const noRefund = form ? form.method === 'none' : true;
  const refundAmt = !asksRefund || noRefund ? 0 : form.refund == null ? Math.min(backValue, canRefund) : Math.max(0, Number(form.refund) || 0);
  const refundErr = asksRefund && !noRefund && refundAmt > canRefund ? `No more than ${formatBDT(canRefund)} can be refunded on this order.` : '';

  const allGood = () => setForm({ ...form, rows: Object.fromEntries(cur.s.lines.map((l) => [l.name, { good: String(l.left), damaged: '' }])) });
  const save = (e) => {
    e.preventDefault();
    if (!taking || bad || refundErr) return;
    const since = Date.now();
    const lines = cur.s.lines.map((l) => ({ name: l.name, good: num(form.rows[l.name].good), damaged: num(form.rows[l.name].damaged) }));
    const place = holdPlaceOf(cur.o.id);
    receiveReturn(cur.o, lines, form.by);
    const good = lines.reduce((a, l) => a + l.good, 0), damaged = lines.reduce((a, l) => a + l.damaged, 0);
    const left = cur.s.left - good - damaged;
    let refundText = '';
    if (asksRefund) {
      if (refundAmt > 0) {
        const account = accountForMethod(form.method, false);
        const entry = postEntry({ account, amount: -refundAmt, kind: 'refund', ref: cur.o.id, party: cur.o.customer, note: `Courier return (RTO) · ${cur.o.courier}`, by: form.by });
        setRefund(cur.o.id, since, { amount: refundAmt, method: form.method, account, ledger: entry ? [entry.id] : [] });
        logOrder(cur.o.id, 'hand-coins', 'Refund given', `${formatBDT(refundAmt)} by ${form.method} from ${(accountBy(account) || {}).name} · ${form.by}`);
        refundText = `${formatBDT(refundAmt)} refunded by ${form.method}`;
      } else {
        setRefund(cur.o.id, since, { amount: 0, method: '', note: noRefund ? 'No refund: COD not collected' : 'No refund' });
        refundText = 'no refund';
      }
    }
    toast([good ? `${pc(good)} back on sale at ${place}` : '', damaged ? `${pc(damaged)} to ${DAMAGED_PLACE}` : '', left ? `${pc(left)} still with ${cur.o.courier}` : 'parcel fully received', refundText].filter(Boolean).join(' · '));
    setForm(null);
    setAll(getOrders());
  };

  const tabs = TABS.map(([id, label]) => ({ key: id, id: 'cr-tab-' + id, label, count: groups[id].length, on: tab === id, onClick: () => setTab(id) }));
  const backOf = (s) => `${s.good + s.damaged} of ${s.sent}`;

  return (
    <div className="dc-screen ds" data-screen="CourierReturns">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="orders-rto" />
        <main className="gc-shell__main">
          <Topbar crumb="Orders" page="Courier returns" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="undo-2" title="Courier returns"
                about="Parcels the courier brings back. Count what arrived, good or damaged. Good items go back on sale, damaged ones are set aside."
                more={[{ label: 'Returned orders', href: '/merchant-orders?status=returned' }, { label: 'Returns history', href: '/return-history' }]} />

              <MetricStrip label="Courier returns" items={[
                { label: 'With courier', value: pc(pcs(rows, 'left')) },
                { label: 'Back on sale', value: pc(pcs(rows, 'good')) },
                { label: 'Damaged', value: pc(pcs(rows, 'damaged')), sub: DAMAGED_PLACE },
              ]} />

              <section className="ix-card" aria-label="Courier returns">
                <div className="ix-bar">
                  {searching ? (<>
                    <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order, customer, phone or tracking ID" onDone={closeFind} autoFocus />
                    <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
                  </>) : (<>
                    <IndexTabs tabs={tabs} label="Courier returns" />
                    <span className="ix-tools">
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
                    </span>
                  </>)}
                </div>
                {searching ? (
                  <div className="ix-filters" role="group" aria-label="Filters">
                    <select aria-label="Courier" className={'ix-filter' + (courier ? ' is-set' : '')} value={courier} onChange={(e) => setCourier(e.target.value)}>
                      <option value="">Courier</option>{COURIERS.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    {q || courier ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setQ(''); setCourier(''); }}>Clear all</button> : null}
                  </div>
                ) : null}

                {shown.length === 0 ? (
                  <div className="ix-empty"><EmptyState icon="package-check" title={q || courier ? 'No returns match these filters' : tab === 'waiting' ? 'No parcels with couriers' : 'Nothing here yet'} /></div>
                ) : (<>
                  <ul className="ix-plist" aria-label="Courier returns">
                    {shown.map(({ o, s }) => (
                      <li key={o.id}>
                        <button type="button" className="ix-pitem cr-pbtn" onClick={() => openFor(o)}>
                          <span className="ix-pitem__top"><b className="cr-id">{o.id}</b><span>{backOf(s)} back</span></span>
                          <span className="ix-pitem__mid">{o.customer} · {o.courier}</span>
                          <span className="ix-pitem__tags"><StatusBadge tone={STATE[s.status][1]}>{STATE[s.status][0]}</StatusBadge></span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="ix-table-wrap">
                    <table className="ix-table gc-table--keep">
                      <caption className="sr-only">Courier returns, {shown.length} shown</caption>
                      <thead><tr><th scope="col">Order</th><th scope="col">Date</th><th scope="col">Customer</th><th scope="col">Courier</th><th scope="col" className="ix-num">Back</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                      <tbody>
                        {shown.map(({ o, s }) => (
                          <tr key={o.id} onClick={(e) => { if (!e.target.closest('a,button')) openFor(o); }}>
                            <td><Link href={orderHref(o.id)} className="ix-strong cr-id">{o.id}</Link></td>
                            <td className="ix-muted">{o.placed}</td>
                            <td>{o.customer}</td>
                            <td className="ix-muted">{o.courier}</td>
                            <td className="ix-num">{backOf(s)}</td>
                            <td><StatusBadge tone={STATE[s.status][1]}>{STATE[s.status][0]}</StatusBadge></td>
                            <td className="ix-num">{s.left ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => openFor(o)} aria-label={'Receive the parcel for ' + o.id}>Receive</button> : null}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>)}
                <div className="ix-foot"><span>{shown.length === 1 ? '1 return' : shown.length + ' returns'}</span></div>
              </section>
              <LearnMore topic="courier returns" />
            </div>
          </div>
        </main>
      </div>

      <Dialog open={!!cur} title={cur ? `Courier return · ${cur.o.id}` : 'Courier return'} onClose={() => setForm(null)} width={640}>
        {cur ? (
          <form className="cr-form" onSubmit={save} noValidate>
            <p className="cr-sub" style={{ margin: 0 }}>{cur.o.customer} · {cur.o.phone} · {cur.o.courier} {cur.o.consignment !== '—' ? cur.o.consignment : 'No tracking ID'}{cur.o.rtoReason ? ' · ' + cur.o.rtoReason : ''} · good items go back to {holdPlaceOf(cur.o.id)}, damaged ones to {DAMAGED_PLACE}.</p>
            {cur.s.left ? (
              <>
                <table className="cr-lines">
                  <caption className="sr-only">Items received from the courier</caption>
                  <thead><tr><th scope="col">Item</th><th scope="col" className="cr-num">Still with courier</th><th scope="col">Good</th><th scope="col">Damaged</th></tr></thead>
                  <tbody>
                    {cur.s.lines.map((l) => (
                      <tr key={l.name}>
                        <td><span className="cr-strong">{l.name}</span><span className="cr-sub">Sent {l.qty}{l.good + l.damaged ? ` · back ${l.good} good, ${l.damaged} damaged` : ''}</span>{lineErr(l) ? <span className="cr-sub cr-err" role="alert">Only {l.left} left with the courier</span> : null}</td>
                        <td className="cr-num cr-strong">{l.left}</td>
                        <td>{l.left ? <input className="gc-input cr-qty" type="number" min="0" max={l.left} inputMode="numeric" placeholder="0" aria-label={`Good ${l.name} received`} aria-invalid={lineErr(l) ? 'true' : undefined} value={form.rows[l.name].good} onChange={(e) => setRow(l.name, 'good', e.target.value)} /> : '—'}</td>
                        <td>{l.left ? <input className="gc-input cr-qty" type="number" min="0" max={l.left} inputMode="numeric" placeholder="0" aria-label={`Damaged ${l.name} received`} aria-invalid={lineErr(l) ? 'true' : undefined} value={form.rows[l.name].damaged} onChange={(e) => setRow(l.name, 'damaged', e.target.value)} /> : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="cr-two">
                  <div><label className="gc-label" htmlFor="cr-by">Received by</label><select id="cr-by" className="gc-input gc-select" value={form.by} onChange={(e) => setForm({ ...form, by: e.target.value })}>{EMPLOYEES.map((m) => <option key={m.name} value={m.name}>{m.name} · {m.role}</option>)}</select></div>
                  <div style={{ alignSelf: 'end' }}><button type="button" className="gc-btn gc-btn--soft gc-btn--block" onClick={allGood}>Everything arrived in good condition</button></div>
                </div>
                {asksRefund ? (
                  <fieldset className="cr-refund">
                    <legend className="sr-only">Refund to the customer</legend>
                    <div><h3>Refund to the customer</h3><span className="cr-sub">{cur.o.customer} paid {formatBDT(paid)} ({cur.o.payment}){refundedBefore ? ` · ${formatBDT(refundedBefore)} already refunded` : ''} · up to {formatBDT(canRefund)} can go back</span></div>
                    <div className="cr-two">
                      <div><label className="gc-label" htmlFor="cr-method">Refund by</label><select id="cr-method" className="gc-input gc-select" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>{REFUND_METHODS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
                      <div><label className="gc-label" htmlFor="cr-amount">Amount</label><input id="cr-amount" className="gc-input" type="number" min="0" max={canRefund} inputMode="decimal" disabled={noRefund} aria-invalid={refundErr ? 'true' : undefined} aria-describedby="cr-amount-help" value={noRefund ? '' : form.refund == null ? String(refundAmt) : form.refund} placeholder="0" onChange={(e) => setForm({ ...form, refund: e.target.value })} /></div>
                    </div>
                    <p id="cr-amount-help" className={'gc-help' + (refundErr ? ' gc-help--error' : '')} style={{ margin: 0 }}>{refundErr || (noRefund ? 'Nothing is paid back. Use this when the cash on delivery was never collected.' : `Paid from ${(accountBy(accountForMethod(form.method, false)) || {}).name}. Suggested: ${formatBDT(Math.min(backValue, canRefund))}, the value of the items being booked in.`)}</p>
                  </fieldset>
                ) : null}
                <p className="gc-help" style={{ margin: 0 }}>{taking ? `Booking in ${taking} of ${pc(cur.s.left)}. ${cur.s.left - taking > 0 ? `${cur.s.left - taking} stay with the courier.` : 'The parcel is then fully received.'}` : 'Enter how many pieces arrived. Leave the rest at 0 if they are still with the courier.'}</p>
              </>
            ) : <p className="gc-help" style={{ margin: 0 }}>Everything the courier had has been received.{refundedBefore ? ` ${formatBDT(refundedBefore)} was refunded to ${cur.o.customer}.` : ''}</p>}
            {cur.s.receipts.length ? (
              <div>
                <p className="gc-label" style={{ margin: '0 0 var(--space-2)' }}>Received so far</p>
                <ul className="cr-receipts">
                  {cur.s.receipts.map((r, i) => <li key={i}>{formatDate(r.at)}, {formatTime(r.at)} · {r.by}<span className="cr-sub">{r.lines.map((x) => `${x.name}: ${[x.good ? x.good + ' good' : '', x.damaged ? x.damaged + ' damaged' : ''].filter(Boolean).join(', ')}`).join(' · ')}</span></li>)}
                </ul>
              </div>
            ) : null}
            <div className="gc-modal__foot" style={{ marginTop: 0 }}>
              <Link href={orderHref(cur.o.id)} className="gc-btn gc-btn--neutral" style={{ marginRight: 'auto' }}>Open order</Link>
              <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setForm(null)}>{cur.s.left ? 'Cancel' : 'Close'}</button>
              {cur.s.left ? <button type="submit" className="gc-btn gc-btn--solid" disabled={!taking || bad || !!refundErr}>Book in {taking ? pc(taking) : 'pcs'}{refundAmt ? ` · refund ${formatBDT(refundAmt)}` : ''}</button> : null}
            </div>
          </form>
        ) : null}
      </Dialog>
    </div>
  );
}
