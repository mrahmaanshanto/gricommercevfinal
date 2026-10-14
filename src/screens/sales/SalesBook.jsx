'use client';
// Sales book (/sales-book, POS › Sales book) — the counter's day book (RT-U2): every memo rung up at the counters, what
// sold, who sold it and how the money came in. Laid out like Shopify's lists (components/ui/IndexKit.jsx): the period,
// five figures for it (sales with a trend line, memos, profit, sold on due, returns), then one card with the payment
// views, search and the "Sold by" filter, and the memo list. A memo opens in a side panel.
// Real data only:
//   memos     the POS sales made in this browser (gc.pos.sales) and the counters' own sales that keep coming every day
//             from 1 October (lib/liveCounterSales.js), newest first; "today" is the app clock (settlements.clockNow)
//   profit    each sale's revenue before VAT less its cost of goods (lib/salesBook.js › getSales, the same as reports)
//   returns   Retail returns in the period (lib/returns.js)
//   staff     the cashier on each sale
// Actions: Export (CSV for Excel), Print (the book with the shop's letterhead), and per memo Open order, Return /
// exchange, Print invoice (components/SaleInvoice.jsx) and Send receipt by SMS (lib/receipts.js, logged per sale).
// Demo September has day totals only (no memos); its figures are in Reports. Front end only.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Sheet, EmptyState, StatusBadge } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, LearnMore, KV } from '@/components/ui/IndexKit';
import { POS_KEYS, load } from '@/lib/posStore';
import { liveCounterSales } from '@/lib/liveCounterSales';
import { getSales } from '@/lib/salesBook';
import { getReturns } from '@/lib/returns';
import { clockNow } from '@/lib/settlements';
import { orderHref } from '@/lib/orders';
import { sendReceipt, receiptAddressError, receiptsSent } from '@/lib/receipts';
import { invoiceIdentity } from '@/lib/businessProfile';
import { printNode } from '@/lib/printNode';
import { downloadCsv } from '@/lib/reports/period';
import { currentUser } from '@/lib/team';
import { formatBDT, formatDate, formatTime, groupIndian } from '@/lib/format';
import { SaleInvoice, invoiceFromSale, printInvoice } from '@/components/SaleInvoice';

const DAY = 864e5;
const PAY = { cash: ['Cash', 'success', 'banknote'], bkash: ['bKash', 'info', 'smartphone'], nagad: ['Nagad', 'info', 'smartphone'], card: ['Card', 'neutral', 'credit-card'], due: ['Due', 'error', 'circle-alert'], other: ['Other', 'neutral', 'wallet'] };
const RANGES = [['today', 'Today'], ['yday', 'Yesterday'], ['week', 'Last 7 days'], ['month', 'This month'], ['custom', 'Pick dates']];
const PAY_TABS = [['all', 'All'], ['cash', 'Cash'], ['bkash', 'bKash'], ['nagad', 'Nagad'], ['card', 'Card'], ['due', 'Due']];
const PAGE = 25;

const money = (n) => (n < 0 ? '−' : '') + formatBDT(Math.round(Math.abs(n)));
const dayStart = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const iso = (t) => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const fromIso = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '')); return m ? new Date(+m[1], +m[2] - 1, +m[3]).getTime() : null; };
const tenders = (x) => (x.tenders || []).filter((tn) => tn.amount > 0);
const totalOf = (x) => (x.totals && x.totals.total) || 0;
/** A sale's payment view: its biggest tender, or Due when something is still owed. */
function payKey(x) {
  if (x.due > 0) return 'due';
  const ts = tenders(x).slice().sort((a, b) => b.amount - a.amount);
  const m = ts.length ? String(ts[0].method).toLowerCase() : 'cash';
  return m === 'bkash' ? 'bkash' : m === 'nagad' || m === 'rocket' ? 'nagad' : m === 'card' ? 'card' : m === 'cash' ? 'cash' : 'other';
}
function payLabel(x) {
  const ms = tenders(x).map((tn) => tn.method).filter((m, j, a) => a.indexOf(m) === j);
  if (x.due > 0) return ms.length ? 'Part due' : 'Due';
  return ms.length ? ms.join(' + ') : 'Cash';
}
const custOf = (x) => (x.customer && x.customer.name) || 'Walk-in customer';
const phoneOf = (x) => (x.customer && x.customer.phone) || '';

/** The period [from, to) for a range key; `now` is the app clock. */
function periodOf(rng, now, from, to) {
  const t0 = dayStart(now);
  if (rng === 'today') return { from: t0, to: t0 + DAY, label: formatDate(t0) };
  if (rng === 'yday') return { from: t0 - DAY, to: t0, label: formatDate(t0 - DAY) };
  if (rng === 'week') return { from: t0 - 6 * DAY, to: t0 + DAY, label: formatDate(t0 - 6 * DAY) + ' – ' + formatDate(t0) };
  if (rng === 'month') { const m = new Date(t0); m.setDate(1); return { from: m.getTime(), to: t0 + DAY, label: formatDate(m.getTime()) + ' – ' + formatDate(t0) }; }
  const f = fromIso(from), t = fromIso(to);
  return f != null && t != null && t >= f ? { from: f, to: t + DAY, label: formatDate(f) + ' – ' + formatDate(t) } : { from: 0, to: 0, label: 'Pick both dates' };
}

const CSS = `
.sb-period{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.sb-period label{display:inline-flex;align-items:center;gap:6px;font-size:var(--text-sm);color:var(--text-body)}
.sb-period input{width:150px}
.sb-note{font-size:var(--text-sm);color:var(--text-muted)}
.sb-no{padding:0;border:0;background:none;font:inherit;font-family:var(--font-data);cursor:pointer}
.sb-pbtn{width:100%;border:0;background:none;font:inherit;text-align:left;cursor:pointer}
.sb-lines{display:flex;flex-direction:column;margin-top:4px}
.sb-line{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:40px;padding:6px 0;border-bottom:1px solid var(--border-subtle);font-size:var(--text-sm)}
.sb-line>span:first-child{display:flex;flex-direction:column;min-width:0}
.sb-line b{font-weight:var(--weight-medium);color:var(--text-heading)}
.sb-line small{font-size:var(--text-xs);color:var(--text-muted);font-variant-numeric:tabular-nums}
.sb-line>span:last-child{flex:none;font-weight:var(--weight-medium);color:var(--text-heading);font-variant-numeric:tabular-nums}
.sb-sum{display:grid;grid-template-columns:1fr auto;gap:6px var(--space-3);margin:0;font-size:var(--text-sm);font-variant-numeric:tabular-nums}
.sb-sum dt{color:var(--text-body)}
.sb-sum dd{margin:0;text-align:right;color:var(--text-heading)}
.sb-sum .is-total{padding-top:6px;border-top:1px solid var(--border-subtle);font-weight:var(--weight-semibold)}
.sb-sum .is-due{font-weight:var(--weight-semibold);color:var(--text-danger)}
.sb-sms{display:flex;flex-direction:column;gap:6px}
.sb-sms__row{display:flex;gap:var(--space-2)}
.sb-sms__row .gc-input{flex:1;min-width:0}
.sb-sent{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.sb-more{display:flex;justify-content:center;padding:var(--space-3)}
.sb-off{position:absolute;left:-10000px;top:0}
.sbp{width:794px;box-sizing:border-box;padding:36px 40px;background:#fff;color:var(--slate-900);font-family:var(--font-sans);font-size:var(--text-2xs)}
.sbp-head{display:flex;justify-content:space-between;gap:24px;padding-bottom:10px;margin-bottom:12px;border-bottom:2px solid var(--primary)}
.sbp-head b{display:block;font-size:var(--text-base);font-weight:var(--weight-semibold)}
.sbp-head span{display:block}
.sbp-kind{text-align:right}
.sbp table{width:100%;border-collapse:collapse}
.sbp th{padding:5px 6px;border-bottom:1px solid var(--slate-300);background:var(--slate-100);text-align:left;font-weight:var(--weight-semibold)}
.sbp td{padding:4px 6px;border-bottom:1px solid var(--slate-200)}
.sbp .n{text-align:right;font-family:var(--font-data);white-space:nowrap}
.sbp-sum{display:flex;flex-wrap:wrap;gap:6px 24px;margin:0 0 12px}
.sbp-sum b{font-weight:var(--weight-semibold)}
@media (max-width:640px){.sb-period label{flex:1 1 40%}.sb-period input{flex:1;width:auto}}
`;

export default function SalesBook() {
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(0);
  const [sales, setSales] = useState([]);       // every counter memo (POS sale shape), newest first
  const [profitOf, setProfitOf] = useState(() => new Map());
  const [rets, setRets] = useState([]);
  const [rng, setRng] = useState('today');
  const [payF, setPayF] = useState('all');
  const [stF, setStF] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [find, setFind] = useState(false);
  const [q, setQ] = useState('');
  const [shown, setShown] = useState(PAGE);
  const [sel, setSel] = useState('');
  const [smsTo, setSmsTo] = useState('');
  const [sent, setSent] = useState([]);
  const [printing, setPrinting] = useState(false);
  const [shop, setShop] = useState(null);
  const invRef = useRef(null);

  useEffect(() => {
    const t = clockNow();
    const mine = load(POS_KEYS.sales, []).filter((s) => !s.wholesale);
    const ids = new Set(mine.map((s) => s.id));
    const all = [...mine, ...liveCounterSales(t).filter((s) => !ids.has(s.id))].sort((a, b) => b.at - a.at);
    const pm = new Map();
    try { getSales().filter((r) => r.channel === 'Retail').forEach((r) => pm.set(r.id, (r.revenue || 0) - (r.cost || 0))); } catch { /* ignore */ }
    setNow(t); setSales(all); setProfitOf(pm);
    setRets(getReturns().filter((r) => r.channel === 'Retail'));
    setFrom(iso(dayStart(t) - 6 * DAY)); setTo(iso(t));
    const r0 = new URLSearchParams(window.location.search).get('range');   // ?range=yday|week|month opens that period
    if (RANGES.some(([k]) => k === r0)) setRng(r0);
    try { setShop(invoiceIdentity()); } catch { setShop(null); }
    setReady(true);
  }, []);

  const per = useMemo(() => periodOf(rng, now || 0, from, to), [rng, now, from, to]);
  const inPer = useMemo(() => sales.filter((x) => x.at >= per.from && x.at < per.to), [sales, per]);

  // ---- the figures ----------------------------------------------------------------------------------
  const fig = useMemo(() => {
    const r = inPer.reduce((a, x) => ({
      sales: a.sales + totalOf(x), memos: a.memos + 1, profit: a.profit + (profitOf.get(x.id) ?? 0),
      due: a.due + Math.max(0, x.due || 0), dueN: a.dueN + (x.due > 0 ? 1 : 0),
    }), { sales: 0, memos: 0, profit: 0, due: 0, dueN: 0 });
    const rr = rets.filter((x) => x.at >= per.from && x.at < per.to && x.type === 'return');
    r.ret = rr.reduce((a, x) => a + (x.money === 'refunded' ? x.amount || 0 : 0), 0); r.retN = rr.length;
    // the trend: by hour for one day, else by day
    const oneDay = per.to - per.from <= DAY;
    const n = oneDay ? 12 : Math.max(1, Math.round((per.to - per.from) / DAY));
    const spark = Array.from({ length: Math.min(n, 62) }, () => 0);
    inPer.forEach((x) => { const i = oneDay ? Math.min(11, Math.max(0, new Date(x.at).getHours() - 10)) : Math.floor((dayStart(x.at) - per.from) / DAY); if (spark[i] != null) spark[i] += totalOf(x); });
    r.spark = spark;
    return r;
  }, [inPer, rets, per, profitOf]);

  // ---- the list: payment view, staff filter, search -------------------------------------------------
  const needle = q.trim().toLowerCase().replace(/^#/, '');
  const match = (x) => !needle || String(x.id).toLowerCase().includes(needle) || custOf(x).toLowerCase().includes(needle) || phoneOf(x).replace(/\D/g, '').includes(needle.replace(/\D/g, '') || '§');
  const staffAll = [...new Set(inPer.map((x) => x.cashier).filter(Boolean))].sort();
  const base = inPer.filter((x) => (stF === 'all' || x.cashier === stF) && match(x));
  const list = base.filter((x) => payF === 'all' || payKey(x) === payF);
  const rows = list.slice(0, shown);
  const searching = find || !!q || stF !== 'all';
  const closeFind = () => { setFind(false); setQ(''); setStF('all'); };
  const tabs = PAY_TABS.map(([k, label]) => ({ key: k, id: 'sb-tab-' + k, label, count: k === 'all' ? base.length : base.filter((x) => payKey(x) === k).length, on: payF === k, onClick: () => { setPayF(k); setShown(PAGE); } }));
  const time = (x) => (rng === 'today' || rng === 'yday' ? '' : formatDate(x.at).replace(/ \d{4}$/, '') + ' · ') + formatTime(x.at);

  // ---- actions --------------------------------------------------------------------------------------
  const exportCsv = () => {
    if (!list.length) { toast('No memos to export in this view.', { tone: 'error' }); return; }
    downloadCsv(`sales-book-${iso(per.from)}.csv`, [['Memo no.', 'Date', 'Time', 'Counter', 'Sold by', 'Customer', 'Mobile', 'Items', 'Payment', 'Total (BDT)', 'Due (BDT)'],
      ...list.map((x) => [x.id, formatDate(x.at), formatTime(x.at), x.counter || '', x.cashier || '', custOf(x), phoneOf(x), (x.lines || []).reduce((a, l) => a + l.qty, 0), payLabel(x), Math.round(totalOf(x)), Math.max(0, Math.round(x.due || 0))])]);
  };
  useEffect(() => {
    if (!printing) return;
    const node = document.getElementById('sb-print');
    if (node) printNode(node, { title: 'Sales book ' + per.label, css: '@page{size:A4 portrait;margin:10mm}' });
    setPrinting(false);
  }, [printing]);   // eslint-disable-line react-hooks/exhaustive-deps
  const printBook = () => { if (!list.length) { toast('No memos to print in this view.', { tone: 'error' }); return; } setPrinting(true); };

  const memo = sel ? sales.find((x) => x.id === sel) || null : null;
  useEffect(() => { if (memo) { setSmsTo(phoneOf(memo)); setSent(receiptsSent(memo.id)); } }, [sel]);   // eslint-disable-line react-hooks/exhaustive-deps
  const sendSms = () => {
    const bad = receiptAddressError('sms', smsTo);
    if (bad) { toast(bad, { tone: 'error' }); return; }
    const me = currentUser();
    const r = sendReceipt(memo, { via: 'sms', to: smsTo, by: me ? me.name : 'Staff' });
    setSent(receiptsSent(memo.id));
    if (r.ok) toast('Receipt sent by SMS to ' + smsTo);
    else toast('The SMS was not sent: ' + (r.reason || r.status), { tone: 'error' });
  };
  const printInv = () => { if (invRef.current) printInvoice(invRef.current, invoiceFromSale(memo)); };

  const d = memo ? (() => {
    const tt = memo.totals || {};
    const disc = (tt.lineDisc || 0) + (tt.cartDisc || 0) + (tt.couponDisc || 0) + (tt.memberDisc || 0) + (tt.pointsDisc || 0);
    const n = (memo.lines || []).length;
    return {
      when: formatDate(memo.at) + ' · ' + formatTime(memo.at) + (memo.counter ? ' · ' + memo.counter : ''),
      pay: payLabel(memo), itemsN: n + (n === 1 ? ' item' : ' items'),
      lines: (memo.lines || []).map((l) => ({ name: l.name, qp: l.qty + ' × ' + money(l.price) + (l.serials && l.serials.length ? ' · IMEI ' + l.serials.join(', ') : ''), total: money(l.price * l.qty - (l.disc || 0)) })),
      sub: money(tt.gross || 0), disc: money(disc), vat: tt.tax ? money(tt.tax) + (tt.vatIncluded ? ' (in the price)' : '') : '', grand: money(tt.total || 0),
      paid: money(Math.max(0, (tt.total || 0) - Math.max(0, memo.due || 0))), isDue: memo.due > 0, due: money(Math.max(0, memo.due || 0)),
    };
  })() : null;

  return (
    <div className="dc-screen ds" data-screen="SalesBook">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="pos-book" />
        <main className="gc-shell__main">
          <Topbar crumb="POS" page="Sales book" placeholder="Search products, customers or memo no." />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="book-open" title="Sales book"
                about="The counters' day book: every memo, what sold, who sold it and how the money came in. Click a memo to see it in full."
                secondary={[{ label: 'Export', onClick: exportCsv }, { label: 'Print', onClick: printBook }]}
                more={[{ label: 'Sales by hour', href: '/report?id=hour-weekday-heatmap' }, { label: 'Return & exchange', href: '/return-exchange' }]}
                primary={{ label: 'New sale', href: '/pos' }} />

              <div className="sb-period">
                <select className="ix-pick" aria-label="Date" value={rng} onChange={(e) => { setRng(e.target.value); setSel(''); setShown(PAGE); }}>
                  {RANGES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
                {rng === 'custom' ? (<>
                  <label>From<input className="gc-input" type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} aria-label="From" /></label>
                  <label>To<input className="gc-input" type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} aria-label="To" /></label>
                </>) : <span className="sb-note">{ready ? per.label : ''}</span>}
              </div>

              <MetricStrip label="Sales in this period" items={[
                { label: 'Total sales', value: money(fig.sales), spark: fig.spark },
                { label: 'Memos', value: groupIndian(fig.memos), sub: 'avg ' + money(fig.memos ? fig.sales / fig.memos : 0) },
                { label: 'Profit', value: money(fig.profit), sub: (fig.sales ? Math.round((fig.profit / fig.sales) * 100) : 0) + '% margin' },
                { label: 'Sold on due', value: money(fig.due), sub: fig.dueN + (fig.dueN === 1 ? ' memo' : ' memos') },
                { label: 'Returns', value: money(fig.ret), sub: fig.retN + (fig.retN === 1 ? ' return' : ' returns') },
              ]} />

              <section className="ix-card" aria-label="Memos">
                <div className="ix-bar">
                  {searching ? (<>
                    <SearchField value={q} onChange={(e) => { setQ(e.target.value); setShown(PAGE); }} placeholder="Memo no., customer or mobile" onDone={closeFind} autoFocus />
                    <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
                  </>) : (<>
                    <IndexTabs tabs={tabs} label="Payment" />
                    <span className="ix-tools">
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
                    </span>
                  </>)}
                </div>
                {searching ? (
                  <div className="ix-filters" role="group" aria-label="Filters">
                    <select aria-label="Sold by" className={'ix-filter' + (stF !== 'all' ? ' is-set' : '')} value={stF} onChange={(e) => { setStF(e.target.value); setShown(PAGE); }}>
                      <option value="all">Sold by</option>
                      {staffAll.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                    {payF !== 'all' ? <select aria-label="Payment" className="ix-filter is-set" value={payF} onChange={(e) => setPayF(e.target.value)}>{PAY_TABS.map(([k, l]) => <option key={k} value={k}>{k === 'all' ? 'Payment' : l}</option>)}</select> : null}
                    {q || stF !== 'all' || payF !== 'all' ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setQ(''); setStF('all'); setPayF('all'); }}>Clear all</button> : null}
                  </div>
                ) : null}

                {!ready ? <div className="ix-empty"><EmptyState icon="receipt-text" title="Loading the memos…" /></div> : rows.length === 0 ? (
                  <div className="ix-empty"><EmptyState icon="receipt-text" title={inPer.length ? 'No memos match this filter.' : per.to <= new Date(2026, 9, 1).getTime() ? 'No memos before 1 Oct 2026. Earlier days are in Reports.' : 'No memos in this period.'} /></div>
                ) : (<>
                  <ul className="ix-plist" aria-label="Memos">
                    {rows.map((x) => { const k = payKey(x); return (
                      <li key={x.id}>
                        <button type="button" className="ix-pitem sb-pbtn" onClick={() => setSel(x.id)}>
                          <span className="ix-pitem__top"><b className="sb-no">{x.id}</b><span>{money(totalOf(x))}</span></span>
                          <span className="ix-pitem__mid">{custOf(x)} · {time(x)} · {x.cashier || '—'}</span>
                          <span className="ix-pitem__tags"><StatusBadge tone={PAY[k][1]} icon={PAY[k][2]}>{payLabel(x)}</StatusBadge></span>
                        </button>
                      </li>
                    ); })}
                  </ul>
                  <div className="ix-table-wrap">
                    <table className="ix-table gc-table--keep">
                      <caption className="sr-only">Memos, newest first</caption>
                      <thead><tr><th scope="col">Memo no.</th><th scope="col">Time</th><th scope="col">Customer</th><th scope="col">Items</th><th scope="col">Payment</th><th scope="col" className="ix-num">Amount</th><th scope="col">Sold by</th></tr></thead>
                      <tbody>
                        {rows.map((x) => { const k = payKey(x), n = (x.lines || []).length; return (
                          <tr key={x.id} className={x.id === sel ? 'is-sel' : ''} onClick={() => setSel(x.id)}>
                            <td><button type="button" className="sb-no ix-strong" onClick={() => setSel(x.id)}>{x.id}</button></td>
                            <td className="ix-muted">{time(x)}</td>
                            <td>{custOf(x)}</td>
                            <td className="ix-muted">{n + (n === 1 ? ' item' : ' items')}</td>
                            <td><StatusBadge tone={PAY[k][1]} icon={PAY[k][2]}>{payLabel(x)}</StatusBadge></td>
                            <td className="ix-num">{money(totalOf(x))}</td>
                            <td className="ix-muted">{x.cashier || '—'}</td>
                          </tr>
                        ); })}
                      </tbody>
                    </table>
                  </div>
                  {list.length > rows.length ? <div className="sb-more"><button type="button" className="ix-btn ix-btn--sm" onClick={() => setShown(shown + PAGE)}>Show {Math.min(PAGE, list.length - rows.length)} more</button></div> : null}
                </>)}
                <div className="ix-foot"><span>{rows.length} of {groupIndian(list.length)} memos · newest first</span></div>
              </section>
              <LearnMore topic="the sales book" />
            </div>
          </div>
        </main>
      </div>

      <Sheet open={!!memo} title={memo ? 'Memo ' + memo.id : ''} onClose={() => setSel('')}
        footer={memo ? <>
          <Link href={'/return-exchange?ref=' + encodeURIComponent(memo.id)} className="gc-btn gc-btn--neutral"><Icon name="undo-2" width="16" height="16" aria-hidden="true" />Return / exchange</Link>
          <button type="button" className="gc-btn gc-btn--solid" onClick={printInv}><Icon name="printer" width="16" height="16" aria-hidden="true" />Print invoice</button>
        </> : null}>
        {memo && d ? (<>
          <p className="sb-note" style={{ margin: 0 }}>{d.when}</p>
          <KV rows={[['Customer', custOf(memo)], ['Mobile number', phoneOf(memo) || 'No mobile number'], ['Sold by', memo.cashier || '—'], memo.salesperson && memo.salesperson !== memo.cashier ? ['Salesperson', memo.salesperson] : null, ['Payment', d.pay]]} />
          <div>
            <h3 className="ix-section-title">Items bought · {d.itemsN}</h3>
            <div className="sb-lines">
              {d.lines.map((ln, i) => <div key={i} className="sb-line"><span><b>{ln.name}</b><small>{ln.qp}</small></span><span>{ln.total}</span></div>)}
            </div>
          </div>
          <dl className="sb-sum">
            <dt>Subtotal</dt><dd>{d.sub}</dd>
            <dt>Discount</dt><dd>{d.disc}</dd>
            {d.vat ? <><dt>VAT</dt><dd>{d.vat}</dd></> : null}
            <dt className="is-total">Grand total</dt><dd className="is-total">{d.grand}</dd>
            <dt>Received ({d.pay})</dt><dd>{d.paid}</dd>
            {d.isDue ? <><dt className="is-due">Left as due</dt><dd className="is-due">{d.due}</dd></> : null}
          </dl>
          <div className="sb-sms">
            <label className="gc-label" htmlFor="sb-sms">Send the receipt by SMS</label>
            <div className="sb-sms__row">
              <input id="sb-sms" className="gc-input" inputMode="tel" placeholder="01XXXXXXXXX" value={smsTo} onChange={(e) => setSmsTo(e.target.value)} />
              <button type="button" className="ix-btn" onClick={sendSms}><Icon name="send" width="16" height="16" aria-hidden="true" />Send</button>
            </div>
            {sent.length ? <p className="sb-sent">Sent {sent.length === 1 ? 'once' : sent.length + ' times'} · last to {sent[0].to}, {formatDate(sent[0].at)} {formatTime(sent[0].at)}{sent[0].ok ? '' : ' (failed)'}</p> : null}
          </div>
          <Link href={orderHref(memo.orderId || memo.id)} className="ix-btn ix-btn--sm" style={{ alignSelf: 'flex-start' }}><Icon name="external-link" width="16" height="16" aria-hidden="true" />Open the order</Link>
          <SaleInvoice doc={invoiceFromSale(memo)} innerRef={invRef} />
        </>) : null}
      </Sheet>

      {printing ? (
        <div className="sb-off" aria-hidden="true">
          <div id="sb-print" className="sbp">
            <header className="sbp-head">
              <div><b>{shop ? shop.tradingName || shop.name : ''}</b>{shop ? <span>{shop.address}</span> : null}{shop && shop.bin ? <span>BIN {shop.bin}</span> : null}</div>
              <div className="sbp-kind"><b>Sales book</b><span>{per.label}</span>{stF !== 'all' ? <span>Sold by {stF}</span> : null}{payF !== 'all' ? <span>Paid by {PAY[payF][0]}</span> : null}</div>
            </header>
            <p className="sbp-sum"><span>Memos <b>{list.length}</b></span><span>Sales <b>{money(list.reduce((a, x) => a + totalOf(x), 0))}</b></span><span>Due <b>{money(list.reduce((a, x) => a + Math.max(0, x.due || 0), 0))}</b></span></p>
            <table>
              <thead><tr><th>Memo no.</th><th>Date and time</th><th>Customer</th><th>Payment</th><th>Sold by</th><th className="n">Amount</th></tr></thead>
              <tbody>{list.map((x) => <tr key={x.id}><td>{x.id}</td><td>{formatDate(x.at)} {formatTime(x.at)}</td><td>{custOf(x)}</td><td>{payLabel(x)}</td><td>{x.cashier || ''}</td><td className="n">{money(totalOf(x))}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
