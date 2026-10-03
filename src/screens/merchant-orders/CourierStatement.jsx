'use client';
// CourierStatement — the full courier statement (Orders › Courier statement, /courier-statement): for a date range
// (by dispatch day) and one courier or all, how many parcels were dispatched, are waiting pickup, in transit, out for
// delivery, delivered, coming back and returned, with the money (COD collected, charges, net, paid out, due, held).
// Then a statement per courier: its numbers, a bar of where its parcels are, and every parcel (filter by state).
// Export CSV and Print. Logic: src/lib/courierStatement.js. Received returns are booked on Courier returns.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { StatusBadge, EmptyState } from '@/components/ui';
import { ShopHeader, MetricStrip, LearnMore } from '@/components/ui/IndexKit';
import { BrandLogo } from '@/components/BrandLogo';
import { formatBDT, formatDate } from '@/lib/format';
import { orderHref } from '@/lib/orders';
import { downloadCsv } from '@/lib/reports/period';
import { courierStatement, COURIERS, STATE, FLOW } from '@/lib/courierStatement';

const DAY = 864e5;
const dayStart = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const iso = (t) => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const fromIso = (s) => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d).getTime(); };
const money = (n) => { const v = Math.round(n || 0); return v < 0 ? '−' + formatBDT(-v) : formatBDT(v); };
const COLOR = { pickup: 'var(--slate-400)', transit: 'var(--viz-1)', out: 'var(--viz-7)', failed: 'var(--viz-4)', delivered: 'var(--viz-3)', returning: 'var(--viz-2)', partial: 'var(--viz-5)', returned: 'var(--viz-8)' };
const RANGES = [
  ['today', 'Today', (n) => [dayStart(n), dayStart(n)]],
  ['7d', 'Last 7 days', (n) => [dayStart(n) - 6 * DAY, dayStart(n)]],
  ['month', 'This month', (n) => { const d = new Date(n); return [new Date(d.getFullYear(), d.getMonth(), 1).getTime(), dayStart(n)]; }],
  ['last', 'Last month', (n) => { const d = new Date(n); return [new Date(d.getFullYear(), d.getMonth() - 1, 1).getTime(), new Date(d.getFullYear(), d.getMonth(), 0).getTime()]; }],
  ['30d', 'Last 30 days', (n) => [dayStart(n) - 29 * DAY, dayStart(n)]],
];
const COLS = [['dispatched', 'Dispatched'], ['pickup', 'Waiting pickup'], ['active', 'On the way'], ['delivered', 'Delivered'], ['back', 'Coming back / returned']];

function Bar({ counts, label }) {
  const total = FLOW.reduce((a, k) => a + counts[k], 0);
  return (
    <div className="cst-bar" role="img" aria-label={label + ': ' + FLOW.filter((k) => counts[k]).map((k) => `${STATE[k][0]} ${counts[k]}`).join(', ')}>
      {total ? FLOW.map((k) => (counts[k] ? <i key={k} style={{ width: (counts[k] / total) * 100 + '%', background: COLOR[k] }} title={`${STATE[k][0]}: ${counts[k]}`} /> : null)) : <i className="is-empty" />}
    </div>
  );
}

function CourierSection({ row, open, onToggle }) {
  const [state, setState] = useState('');
  const [all, setAll] = useState(false);
  const list = row.parcels.filter((p) => !state || p.state === state);
  const shown = all ? list : list.slice(0, 10);
  const c = row.counts;
  const facts = [
    ['Dispatched', row.dispatched], ['Waiting pickup', c.pickup], ['In transit', c.transit], ['Out for delivery', c.out], ['Delivery failed', c.failed],
    ['Delivered', c.delivered], ['Coming back', c.returning + c.partial], ['Returned', c.returned],
  ];
  return (
    <section className="ix-card cst-courier" aria-labelledby={'cst-h-' + row.name}>
      <button type="button" className="cst-chead" aria-expanded={open} onClick={onToggle}>
        <BrandLogo brand={row.brand} size={36} decorative />
        <span className="cst-chead__name"><b id={'cst-h-' + row.name}>{row.name}</b><small>{row.parcels.length} parcels · {row.rate == null ? 'no finished parcels' : row.rate + '% delivered'}{row.avgDays != null ? ' · ' + row.avgDays.toFixed(1) + ' days on average' : ''}</small></span>
        <span className="cst-chead__money"><small>Net for these parcels</small><b>{money(row.net)}</b></span>
        <Icon name="chevron-down" width="16" height="16" aria-hidden="true" className="cst-chev" />
      </button>
      <div className="cst-cbody">
        <Bar counts={c} label={row.name} />
        <dl className="cst-facts">
          {facts.map(([l, n]) => <div key={l}><dt>{l}</dt><dd>{n}</dd></div>)}
        </dl>
        <dl className="cst-money">
          <div><dt>COD to collect</dt><dd>{money(row.cod)}</dd></div>
          <div><dt>COD collected</dt><dd>{money(row.collected)}</dd></div>
          <div><dt>Courier charges</dt><dd>− {money(row.charges)}</dd></div>
          <div className="is-total"><dt>Net</dt><dd>{money(row.net)}</dd></div>
          <div><dt>Paid to you</dt><dd>{money(row.paid)}</dd></div>
          <div><dt>Payout due</dt><dd>{money(row.due)}</dd></div>
          <div><dt>Holding now</dt><dd>{money(row.held)}</dd></div>
        </dl>
        {open ? (
          <div className="cst-parcels">
            <div className="cst-ptools">
              <h3>Parcels</h3>
              <select className={'ix-filter' + (state ? ' is-set' : '')} value={state} onChange={(e) => { setState(e.target.value); setAll(false); }} aria-label={'State of ' + row.name + ' parcels'}>
                <option value="">All states</option>{FLOW.filter((k) => c[k]).map((k) => <option key={k} value={k}>{STATE[k][0]} · {c[k]}</option>)}
              </select>
            </div>
            {list.length ? (
              <div className="ix-table-wrap ix-table-wrap--show">
                <table className="ix-table ix-table--static gc-table--keep">
                  <caption className="sr-only">{row.name} parcels</caption>
                  <thead><tr><th>Order</th><th>Tracking</th><th>Customer</th><th>Zone</th><th>Dispatched</th><th>State</th><th className="ix-num">Days</th><th className="ix-num">COD</th><th className="ix-num">Charge</th></tr></thead>
                  <tbody>
                    {shown.map((p) => (
                      <tr key={p.id}>
                        <td><Link href={orderHref(p.id, 'courier')} className="ix-strong cst-id">{p.id}</Link></td>
                        <td className="cst-id ix-muted">{p.consignment || '—'}</td>
                        <td>{p.customer}</td>
                        <td className="ix-muted">{p.zone || '—'}</td>
                        <td className="ix-muted">{p.dispatched ? formatDate(p.dispatched) : 'Not yet'}</td>
                        <td><StatusBadge tone={STATE[p.state][1]}>{STATE[p.state][0]}</StatusBadge>{p.rtoReason && (p.state === 'returned' || p.state === 'returning') ? <small className="cst-why">{p.rtoReason}</small> : null}</td>
                        <td className="ix-num">{p.dispatched ? p.days.toFixed(1) : '—'}</td>
                        <td className="ix-num">{p.cod ? money(p.cod) : 'Paid'}</td>
                        <td className="ix-num">{p.charge ? money(p.charge) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="cst-none">No parcels in this state.</p>}
            {list.length > 10 ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain cst-more" onClick={() => setAll((v) => !v)}>{all ? 'Show fewer' : `Show all ${list.length}`}</button> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default function CourierStatement() {
  const [now, setNow] = useState(0);
  const [range, setRange] = useState('30d');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [courier, setCourier] = useState('');
  const [open, setOpen] = useState({});
  useEffect(() => {
    const t = Date.now();
    setNow(t);
    const [a, b] = RANGES.find((r) => r[0] === '30d')[2](t);
    setFrom(iso(a)); setTo(iso(b));
    const q = new URLSearchParams(window.location.search).get('courier');
    if (q && COURIERS.includes(q)) setCourier(q);
  }, []);
  const pickRange = (k) => { const [a, b] = RANGES.find((r) => r[0] === k)[2](now || Date.now()); setRange(k); setFrom(iso(a)); setTo(iso(b)); };
  const data = useMemo(() => (now && from && to ? courierStatement({ from: fromIso(from), to: fromIso(to) + DAY, courier, now }) : null), [now, from, to, courier]);
  const t = data ? data.totals : null;
  const exportCsv = () => {
    if (!data) return;
    const rows = [
      ['GridCommerce · Courier statement', from + ' to ' + to, courier || 'All couriers'],
      [],
      ['Courier', 'Dispatched', 'Waiting pickup', 'In transit', 'Out for delivery', 'Delivery failed', 'Delivered', 'Coming back', 'Returned', 'Delivered %', 'COD to collect', 'COD collected', 'Charges', 'Net', 'Paid to you', 'Payout due', 'Holding now'],
      ...[...data.couriers, data.totals].map((r) => [r.name, r.dispatched, r.counts.pickup, r.counts.transit, r.counts.out, r.counts.failed, r.counts.delivered, r.counts.returning + r.counts.partial, r.counts.returned, r.rate == null ? '' : r.rate, Math.round(r.cod), Math.round(r.collected), Math.round(r.charges), Math.round(r.net), Math.round(r.paid), Math.round(r.due), Math.round(r.held)]),
      [],
      ['Order', 'Courier', 'Tracking', 'Customer', 'Phone', 'Zone', 'Dispatched', 'State', 'Days', 'COD', 'Charge', 'Return reason'],
      ...data.parcels.map((p) => [p.id, p.courier, p.consignment, p.customer, p.phone, p.zone, p.dispatched ? iso(p.dispatched) : '', STATE[p.state][0], p.dispatched ? p.days.toFixed(1) : '', Math.round(p.cod), Math.round(p.charge), p.rtoReason]),
    ];
    downloadCsv(`courier-statement-${from}-to-${to}${courier ? '-' + courier.toLowerCase() : ''}.csv`, rows);
    toast('Courier statement exported');
  };
  return (
    <div className="dc-screen ds" data-screen="CourierStatement">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="orders-courier" />
        <main className="gc-shell__main">
          <Topbar crumb="Orders" page="Courier statement" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="truck" title="Courier statement"
                about="Every parcel handed to a courier, courier by courier: how many were dispatched, are in transit, delivered, coming back or returned, and the money — cash on delivery collected, courier charges, what was paid to you and what is still due."
                secondary={[{ label: 'Export', icon: 'download', onClick: exportCsv }, { label: 'Print', icon: 'printer', onClick: () => window.print() }]}
                more={[{ label: 'Courier returns', href: '/courier-returns' }, { label: 'Courier payouts', href: '/settlements' }, { label: 'All orders', href: '/merchant-orders' }]} />

              <section className="ix-card cst-filters" aria-label="Statement period">
                <div className="ix-chips" role="group" aria-label="Period">
                  {RANGES.map(([k, l]) => <button key={k} type="button" className="ix-chip" aria-pressed={range === k} onClick={() => pickRange(k)}>{l}</button>)}
                </div>
                <span className="cst-range">
                  <input type="date" className="ix-date" value={from} max={to} onChange={(e) => { if (e.target.value) { setFrom(e.target.value); setRange(''); } }} aria-label="From" />
                  <span className="ix-muted">to</span>
                  <input type="date" className="ix-date" value={to} min={from} onChange={(e) => { if (e.target.value) { setTo(e.target.value); setRange(''); } }} aria-label="To" />
                </span>
                <select className={'ix-filter' + (courier ? ' is-set' : '')} value={courier} onChange={(e) => setCourier(e.target.value)} aria-label="Courier">
                  <option value="">All couriers</option>{COURIERS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </section>

              {!data ? <div className="cst-skel" aria-busy="true" /> : (<>
                <MetricStrip label="Courier totals" items={[
                  { label: 'Dispatched', value: t.dispatched, icon: 'send' },
                  { label: 'On the way', value: t.active, sub: t.counts.out ? t.counts.out + ' out for delivery' : '', icon: 'truck' },
                  { label: 'Delivered', value: t.counts.delivered, sub: t.rate == null ? '' : t.rate + '%', icon: 'package-check' },
                  { label: 'Coming back', value: t.counts.returning + t.counts.partial, icon: 'undo-2' },
                  { label: 'Returned', value: t.counts.returned, icon: 'package-x' },
                  { label: 'COD collected', value: money(t.collected), icon: 'banknote' },
                  { label: 'Payout due', value: money(t.due), sub: 'holding ' + money(t.held), icon: 'hourglass' },
                ]} />

                <section className="ix-card" aria-labelledby="cst-h-all">
                  <div className="ix-card__head"><h2 id="cst-h-all">Courier by courier</h2><span className="ix-muted cst-small">{from ? formatDate(fromIso(from)) : ''} – {to ? formatDate(fromIso(to)) : ''}</span></div>
                  <div className="ix-table-wrap ix-table-wrap--show">
                    <table className="ix-table ix-table--static gc-table--keep cst-sum">
                      <caption className="sr-only">Courier statement by courier</caption>
                      <thead><tr>
                        <th>Courier</th><th className="ix-num">Dispatched</th><th className="ix-num">Waiting pickup</th><th className="ix-num">On the way</th>
                        <th className="ix-num">Delivered</th><th className="ix-num">Coming back</th><th className="ix-num">Returned</th><th className="ix-num">Delivered %</th>
                        <th className="ix-num">COD collected</th><th className="ix-num">Net</th><th className="ix-num">Payout due</th>
                      </tr></thead>
                      <tbody>
                        {data.couriers.map((r) => (
                          <tr key={r.name}>
                            <td><button type="button" className="cst-cname" onClick={() => { setOpen((o) => ({ ...o, [r.name]: true })); const el = document.getElementById('cst-h-' + r.name); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}><BrandLogo brand={r.brand} size={24} decorative />{r.name}</button></td>
                            <td className="ix-num">{r.dispatched}</td><td className="ix-num">{r.counts.pickup}</td><td className="ix-num">{r.active}{r.counts.out ? <small className="cst-sub">{r.counts.out} out</small> : null}</td>
                            <td className="ix-num">{r.counts.delivered}</td><td className="ix-num">{r.counts.returning + r.counts.partial}</td><td className="ix-num">{r.counts.returned}</td>
                            <td className="ix-num">{r.rate == null ? '—' : <span className={'cst-rate' + (r.rate < 80 ? ' is-low' : '')}>{r.rate}%</span>}</td>
                            <td className="ix-num">{money(r.collected)}</td><td className="ix-num"><b>{money(r.net)}</b></td><td className="ix-num">{money(r.due)}</td>
                          </tr>
                        ))}
                      </tbody>
                      {data.couriers.length > 1 ? (
                        <tfoot><tr>
                          <th>Total</th><td className="ix-num">{t.dispatched}</td><td className="ix-num">{t.counts.pickup}</td><td className="ix-num">{t.active}</td>
                          <td className="ix-num">{t.counts.delivered}</td><td className="ix-num">{t.counts.returning + t.counts.partial}</td><td className="ix-num">{t.counts.returned}</td><td className="ix-num">{t.rate == null ? '—' : t.rate + '%'}</td>
                          <td className="ix-num">{money(t.collected)}</td><td className="ix-num"><b>{money(t.net)}</b></td><td className="ix-num">{money(t.due)}</td>
                        </tr></tfoot>
                      ) : null}
                    </table>
                  </div>
                  <div className="cst-legend" aria-hidden="true">{FLOW.map((k) => <span key={k}><i style={{ background: COLOR[k] }} />{STATE[k][0]}</span>)}</div>
                </section>

                {data.parcels.length ? data.couriers.filter((r) => r.parcels.length).map((r, i) => (
                  <CourierSection key={r.name} row={r} open={open[r.name] ?? (i === 0 || !!courier)} onToggle={() => setOpen((o) => ({ ...o, [r.name]: !(o[r.name] ?? (i === 0 || !!courier)) }))} />
                )) : <section className="ix-card"><div className="ix-empty"><EmptyState icon="truck" title="No parcels in this period" body="Pick another period or courier." /></div></section>}
              </>)}
              <LearnMore topic="courier statements" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const CSS = `
.cst-filters{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);padding:var(--space-3) var(--space-4)}
.cst-range{display:inline-flex;align-items:center;gap:var(--space-1-5)}
.cst-small{font-size:var(--text-xs)}
.cst-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.cst-skel{height:240px;border-radius:var(--radius-xl);background:var(--surface-subtle)}
.cst-sum td{white-space:nowrap}
.cst-sum thead th{white-space:normal;line-height:1.25;vertical-align:bottom;padding-top:var(--space-2);padding-bottom:var(--space-2)}
.cst-sum tfoot th,.cst-sum tfoot td{border-top:2px solid var(--border-strong);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cst-cname{display:inline-flex;align-items:center;gap:var(--space-2);padding:0;border:0;background:none;color:var(--text-heading);font:inherit;font-weight:var(--weight-medium);cursor:pointer}
.cst-cname:hover{color:var(--primary)}
.cst-rate{font-weight:var(--weight-semibold);color:var(--text-success)}
.cst-rate.is-low{color:var(--text-warning)}
.cst-legend{display:flex;flex-wrap:wrap;gap:var(--space-1-5) var(--space-4);padding:var(--space-2-5) var(--space-4) var(--space-3);font-size:var(--text-xs);color:var(--text-muted)}
.cst-legend span{display:inline-flex;align-items:center;gap:6px}
.cst-legend i{width:10px;height:10px;border-radius:var(--radius-sm)}
.cst-courier{overflow:hidden}
.cst-chead{display:flex;align-items:center;gap:var(--space-3);width:100%;padding:var(--space-3) var(--space-4);border:0;border-bottom:1px solid var(--border-subtle);background:none;font:inherit;text-align:left;cursor:pointer}
.cst-chead:hover{background:var(--surface-page)}
.cst-chead__name{flex:1;min-width:0;display:flex;flex-direction:column}
.cst-chead__name b{font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cst-chead__name small,.cst-chead__money small{font-size:var(--text-xs);color:var(--text-muted)}
.cst-chead__money{display:flex;flex-direction:column;align-items:flex-end}
.cst-chead__money b{font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
.cst-chev{flex:none;color:var(--text-muted);transition:transform var(--duration-fast) ease}
.cst-chead[aria-expanded="false"] .cst-chev{transform:rotate(-90deg)}
.cst-cbody{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-3) var(--space-4) var(--space-4)}
.cst-bar{display:flex;gap:2px;height:10px;border-radius:var(--radius-full);overflow:hidden;background:var(--surface-quiet)}
.cst-bar i{display:block;height:100%;min-width:3px;animation:cst-grow 600ms cubic-bezier(.23,1,.32,1) both;transform-origin:left}
.cst-bar i.is-empty{width:100%;background:var(--surface-quiet)}
@keyframes cst-grow{from{transform:scaleX(0)}}
.cst-facts,.cst-money{display:grid;gap:var(--space-2);margin:0}
.cst-facts{grid-template-columns:repeat(8,minmax(0,1fr))}
.cst-money{grid-template-columns:repeat(7,minmax(0,1fr))}
@media (max-width:1180px){.cst-facts,.cst-money{grid-template-columns:repeat(4,minmax(0,1fr))}}
.cst-facts div,.cst-money div{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-page)}
.cst-facts dt,.cst-money dt{font-size:var(--text-xs);color:var(--text-muted)}
.cst-facts dd,.cst-money dd{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
.cst-money .is-total{background:var(--fill-primary-soft)}
.cst-money .is-total dd{color:var(--primary)}
.cst-parcels{display:flex;flex-direction:column;gap:var(--space-2)}
.cst-ptools{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2)}
.cst-ptools h3{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cst-id{font-family:var(--font-data)}
.cst-why{display:block;margin-top:2px;font-size:var(--text-xs);color:var(--text-muted);white-space:normal;max-width:220px}
.cst-none{margin:0;font-size:var(--text-sm);color:var(--text-muted)}
.cst-more{align-self:flex-start}
@media (max-width:640px){
  .cst-chead__money{display:none}
  .cst-facts,.cst-money{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media print{
  gc-sidebar,gc-topbar,.ix-head__actions,.cst-filters .ix-chips,.cst-more,.cst-ptools select,.ix-learn{display:none!important}
  .gc-shell__main{box-shadow:none!important;border:0!important}
  .cst-courier{break-inside:avoid-page}
}
@media (prefers-reduced-motion:reduce){.cst-bar i{animation:none}.cst-chev{transition:none}}
`;
