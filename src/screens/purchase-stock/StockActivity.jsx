'use client';
// StockActivity — every stock movement in one list (Nayeem's Inventory brief #2 › "Stock Activity / Ledger"), laid out
// like Shopify's list pages (docs/shopify-style.md): views by kind of movement, search and filters by product, place,
// reference, user, batch and serial / IMEI, a compact table, and the movement's details on click.
// Also here, because they are stock movements too:
//   - Trace a serial / IMEI: one unit's life (received, moved, held, sold, returned, with a vendor) — serialTrace.js
//   - Stock with vendors (external custody): send to a vendor or service centre, receive back — custody.js
//   - Moves waiting to sync (posted offline) — stock.js › getQueue / flushQueue
// Data: lib/stockActivity.js. URL: ?group= ?ref= ?serial= ?q= ?place= (links from other pages open a filtered list).

import React, { useEffect, useMemo, useState } from 'react';
import __Link from 'next/link';
import { Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { EmptyState as __EmptyState, StatusBadge as __StatusBadge, Sheet as __Sheet, Dialog as __Dialog } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, Pager, LearnMore, KV } from '@/components/ui/IndexKit';
import { toast as __toast } from '@/runtime/ui';
import { formatDateTime, formatDate } from '@/lib/format';
import { activity, activityUsers, GROUPS } from '@/lib/stockActivity';
import { getQueue, flushQueue, getCatalog, productBy, isVirtualRow, STOCK_EVENT, stockAt } from '@/lib/stock';
import { getStockPlaces, STOCK_PLACES } from '@/lib/locations';
import { traceSerial, getUnits, SERIAL_KIND, SERIAL_STATUS, SERIAL_EVENT } from '@/lib/serialTrace';
import { openCustody, sendToVendor, receiveBack, closeCustody, CUSTODY_REASONS, CUSTODY_EVENT } from '@/lib/custody';
import { fmtQty } from '@/lib/units';
import { currentUser } from '@/lib/team';

const PAGE = 50;
// a badge only where the status adds something to the type (held / on the way already say it)
const BADGE = { waiting: 1, rejected: 1, queued: 1 };
const STATUS = { waiting: ['Waiting for approval', 'warning'], rejected: ['Rejected', 'error'], transit: ['On the way', 'info'], held: ['Held', 'info'], queued: ['Waiting to sync', 'warning'] };
const EFFECT = { onhand: 'On hand', available: 'Available only', none: 'Nothing moved yet' };
const getQ = (k) => (typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get(k) || '');
function setQ(k, v) { const u = new URL(window.location.href); if (v) u.searchParams.set(k, v); else u.searchParams.delete(k); window.history.replaceState(window.history.state, '', u.pathname + u.search + u.hash); }
const sign = (n) => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(Math.round(n * 1000) / 1000);

const CSS = `
.sa-qty{font-family:var(--font-data);font-variant-numeric:tabular-nums;font-weight:var(--weight-medium);white-space:nowrap}
.sa-up{color:var(--text-success)}.sa-down{color:var(--text-danger)}.sa-none{color:var(--text-muted)}
.sa-in{height:28px;width:150px;padding:0 10px;border:1px dashed var(--border-strong);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs-plus);color:var(--text-body)}
.sa-in.is-set{border-style:solid;border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.sa-name{display:block;max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sa-ref{font-family:var(--font-data);font-size:var(--text-xs)}
.sa-sync{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);margin:0;font-size:var(--text-sm);color:var(--text-warning)}
.sa-life{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.sa-life li{position:relative;display:grid;grid-template-columns:16px minmax(0,1fr);gap:var(--space-3);padding:0 0 var(--space-3)}
.sa-life li::before{content:"";position:absolute;left:7px;top:14px;bottom:0;width:2px;background:var(--border-subtle)}
.sa-life li:last-child::before{display:none}
.sa-dot{width:16px;height:16px;margin-top:2px;border-radius:var(--radius-full);background:var(--fill-primary-soft);box-shadow:inset 0 0 0 4px var(--primary)}
.sa-life b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.sa-life small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.sa-form{display:grid;gap:var(--space-3)}
.sa-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.sa-field>.gc-label{margin:0}
.sa-grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.sa-cust{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.sa-cust li{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.sa-cust li:first-child{border-top:0}
.sa-cust li>span{flex:1 1 240px;min-width:0}
.sa-cust small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.sa-units{display:flex;flex-wrap:wrap;gap:6px}
@media (max-width:640px){.sa-grid2{grid-template-columns:minmax(0,1fr)}.sa-in{width:100%;max-width:none;height:36px}}
`;

export default function StockActivity() {
  const [tick, setTick] = useState(0);
  const [ready, setReady] = useState(false);
  const [f, setF] = useState({ group: 'all', q: '', place: '', ref: '', user: '', batch: '', serial: '' });
  const [find, setFind] = useState(false);
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(null);          // a row's details
  const [trace, setTrace] = useState(null);        // { code } for the serial sheet
  const [traceQ, setTraceQ] = useState('');
  const [send, setSend] = useState(null);          // the "Send to vendor" form
  const [back, setBack] = useState(null);          // { row, qty, place }
  const [places, setPlaces] = useState(STOCK_PLACES);

  useEffect(() => {
    const g = getQ('group');
    setF((x) => ({ ...x, group: GROUPS.some((t) => t.k === g) ? g : 'all', q: getQ('q') || getQ('sku'), place: getQ('place'), ref: getQ('ref'), user: getQ('user'), batch: getQ('batch'), serial: getQ('serial') }));
    if (getQ('ref') || getQ('serial') || getQ('q') || getQ('sku') || getQ('batch') || getQ('user') || getQ('place')) setFind(true);
    if (getQ('trace')) { setTrace({ code: getQ('trace') }); setTraceQ(getQ('trace')); }
    setPlaces(getStockPlaces());
    setReady(true);
    const re = () => setTick((n) => n + 1);
    [STOCK_EVENT, SERIAL_EVENT, CUSTODY_EVENT, 'storage', 'online', 'offline'].forEach((e) => window.addEventListener(e, re));
    return () => [STOCK_EVENT, SERIAL_EVENT, CUSTODY_EVENT, 'storage', 'online', 'offline'].forEach((e) => window.removeEventListener(e, re));
  }, []);

  const all = useMemo(() => (ready ? activity({}) : []), [ready, tick]);
  const rows = useMemo(() => (ready ? activity(f) : []), [ready, tick, f]);
  const users = useMemo(() => activityUsers(all), [all]);
  const counts = useMemo(() => {
    const base = ready ? activity({ ...f, group: 'all' }) : [];
    const c = {}; GROUPS.forEach((g) => { c[g.k] = g.k === 'all' ? base.length : base.filter((r) => r.group === g.k).length; });
    return c;
  }, [ready, tick, f]);
  const queue = ready ? getQueue() : [];
  const custody = ready ? openCustody() : [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const shown = rows.slice(page * PAGE, page * PAGE + PAGE);

  const put = (k, v) => { setF((x) => ({ ...x, [k]: v })); setPage(0); setQ(k === 'q' ? 'q' : k, k === 'group' && v === 'all' ? '' : v); };
  const filtered = !!(f.q || f.place || f.ref || f.user || f.batch || f.serial);
  const clearAll = () => { ['q', 'place', 'ref', 'user', 'batch', 'serial', 'sku'].forEach((k) => setQ(k, '')); setF((x) => ({ ...x, q: '', place: '', ref: '', user: '', batch: '', serial: '' })); setPage(0); };
  const closeFind = () => { clearAll(); setFind(false); };

  const tabs = GROUPS.map((g) => ({ key: g.k, id: 'sa-tab-' + g.k, label: g.label, count: counts[g.k], on: f.group === g.k, onClick: () => put('group', g.k) }));
  const row0 = (r) => productBy(r.sku);
  const qtyText = (r) => { const p = row0(r); return r.qty === 0 ? '0' : (r.qty > 0 ? '+' : '−') + (p ? fmtQty(p, Math.abs(r.qty)) : Math.abs(r.qty)); };
  const tone = (r) => (r.effect === 'none' || r.status === 'rejected' ? 'sa-none' : r.qty > 0 ? 'sa-up' : r.qty < 0 ? 'sa-down' : 'sa-none');

  // ---- serial trace ----
  const traced = trace && trace.code ? traceSerial(trace.code) : null;
  const openTrace = (code) => { setTrace({ code: code || '' }); setTraceQ(code || ''); };

  // ---- send to vendor ----
  const me = ready ? currentUser().name : 'Staff';
  const physical = ready ? getCatalog().filter((p) => !isVirtualRow(p)) : [];
  const newSend = () => setSend({ sku: '', qty: '1', place: places[0], party: '', rma: '', reason: CUSTODY_REASONS[0], expected: '', serials: '', note: '', err: '' });
  const saveSend = () => {
    const r = sendToVendor({ ...send, serials: send.serials.split(/[\s,]+/).filter(Boolean), expectedAt: send.expected ? new Date(send.expected).getTime() : null, by: me });
    if (!r.ok) { setSend({ ...send, err: r.error }); return; }
    setSend(null); __toast(r.row.qty + ' × ' + r.row.name + ' sent to ' + r.row.party);
  };
  const saveBack = () => {
    const r = receiveBack(back.row.id, { qty: back.qty, place: back.place, by: me });
    if (!r.ok) { __toast(r.error, { tone: 'error' }); return; }
    setBack(null); __toast('Received back into ' + back.place);
  };

  const exportCsv = () => {
    if (!rows.length) { __toast('Nothing to export. Change the filters first.', { tone: 'info' }); return; }
    const cell = (c) => { const t = c == null ? '' : String(c); return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
    const lines = [['Date', 'Type', 'Product', 'SKU', 'Place', 'Change', 'Reference', 'By', 'Batch', 'Serial', 'Status', 'Note']].concat(rows.map((r) => [formatDateTime(r.at), r.label, r.name, r.sku, r.place, r.qty, r.ref, r.by, r.batch, r.serial, (STATUS[r.status] || ['Done'])[0], r.reason]));
    const blob = new Blob(['﻿' + lines.map((l) => l.map(cell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'stock-activity.csv'; document.body.appendChild(a); a.click(); a.remove();
    __toast('Exported ' + rows.length + ' rows as CSV.');
  };

  const o = open;
  return (
    <div className="dc-screen ds" data-screen="StockActivity">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <__Sidebar sticky="" active="stock-list" />
        <main className="gc-shell__main">
          <__Topbar crumb="Stock" page="Stock activity" placeholder="Search or scan any barcode" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="history" title="Stock activity"
                about="Every stock movement in one list: received, sold, moved, held, counted, adjusted, written off and sent to vendors. Search by product, reference, person, batch or serial number. Open a row for its details."
                secondary={[{ label: 'Export', onClick: exportCsv }, { label: 'Trace a serial', onClick: () => openTrace('') }]}
                more={[{ label: 'Stock list', href: '/stock' }, { label: 'Stock adjustments', href: '/stock-adjustments' }, { label: 'Stock count', href: '/stock-count' }]}
                primary={{ label: 'Send to vendor', onClick: newSend }} />

              <MetricStrip label="Stock activity"
                items={[
                  { label: 'Moves today', value: String(all.filter((r) => r.at >= today.getTime() && r.effect !== 'none').length), icon: false },
                  { label: 'Waiting for approval', value: String(all.filter((r) => r.status === 'waiting').length), icon: false, onClick: () => { put('group', 'adjust'); }, on: false },
                  { label: 'On the way', value: String(all.filter((r) => r.status === 'transit').length), icon: false, onClick: () => put('group', 'move') },
                  { label: 'With vendors', value: String(custody.reduce((a, c) => a + c.qty - (c.back || 0), 0)), icon: false },
                ]} />

              {queue.length ? (
                <p className="sa-sync" role="status">
                  <__Icon name="cloud-off" width="16" height="16" aria-hidden="true" />
                  <span>{queue.length === 1 ? '1 move is waiting to sync' : queue.length + ' moves are waiting to sync'}</span>
                  <button type="button" className="ix-btn ix-btn--sm" onClick={() => { const n = flushQueue(); setTick((x) => x + 1); __toast(n ? n + ' moves sent' : 'Still offline. They will go when you are back online.', n ? undefined : { tone: 'info' }); }}>Send now</button>
                </p>
              ) : null}

              {custody.length ? (
                <section className="ix-card" aria-labelledby="sa-cust-h">
                  <div className="ix-card__head"><h2 id="sa-cust-h">With vendors</h2></div>
                  <ul className="sa-cust">
                    {custody.map((c) => (
                      <li key={c.id}>
                        <span><b>{c.qty - (c.back || 0)} × {c.name}</b><small>{c.party}{c.rma ? ' · ' + c.rma : ''} · from {c.place} · sent {formatDate(c.sentAt)}{c.expectedAt ? ' · due ' + formatDate(c.expectedAt) : ''}</small></span>
                        {c.serials && c.serials.length ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => openTrace(c.serials[0])}>{c.serials[0]}</button> : null}
                        <button type="button" className="ix-btn ix-btn--sm" onClick={() => setBack({ row: c, qty: String(c.qty - (c.back || 0)), place: c.place })}>Receive back</button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section className="ix-card" aria-label="Stock activity">
                <div className="ix-bar">
                  {find ? (<>
                    <SearchField value={f.q} onChange={(e) => put('q', e.target.value)} placeholder="Search product or SKU" onDone={closeFind} autoFocus />
                    <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
                  </>) : (<>
                    <IndexTabs tabs={tabs} label="Kind of movement" />
                    <span className="ix-tools">
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={() => setFind(true)}><__Icon name="search" width="16" height="16" aria-hidden="true" /></button>
                    </span>
                  </>)}
                </div>
                {find ? (
                  <div className="ix-filters" role="group" aria-label="Filters">
                    <select aria-label="Place" className={'ix-filter' + (f.place ? ' is-set' : '')} value={f.place} onChange={(e) => put('place', e.target.value)}>
                      <option value="">Place</option>
                      {places.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select aria-label="Person" className={'ix-filter' + (f.user ? ' is-set' : '')} value={f.user} onChange={(e) => put('user', e.target.value)}>
                      <option value="">Person</option>
                      {users.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <input className={'sa-in' + (f.ref ? ' is-set' : '')} value={f.ref} onChange={(e) => put('ref', e.target.value)} placeholder="Reference" aria-label="Reference" />
                    <input className={'sa-in' + (f.batch ? ' is-set' : '')} value={f.batch} onChange={(e) => put('batch', e.target.value)} placeholder="Batch" aria-label="Batch" />
                    <input className={'sa-in' + (f.serial ? ' is-set' : '')} value={f.serial} onChange={(e) => put('serial', e.target.value)} placeholder="Serial or IMEI" aria-label="Serial or IMEI" />
                    {filtered ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={clearAll}>Clear all</button> : null}
                  </div>
                ) : null}

                {!rows.length ? (
                  <div className="ix-empty"><__EmptyState icon="history" title={ready ? 'No stock movements match' : 'Loading stock activity'} actionLabel={filtered ? 'Clear filters' : undefined} onAction={filtered ? clearAll : undefined} /></div>
                ) : (<>
                  <ul className="ix-plist" aria-label="Stock activity">
                    {shown.map((r) => (
                      <li key={r.id}>
                        <button type="button" className="ix-pitem" onClick={() => setOpen(r)}>
                          <span className="ix-pitem__top"><b>{r.name}</b><span className={'sa-qty ' + tone(r)}>{qtyText(r)}</span></span>
                          <span className="ix-pitem__mid">{r.label} · {r.place || '—'} · {formatDateTime(r.at)}</span>
                          {BADGE[r.status] ? <span className="ix-pitem__tags"><__StatusBadge tone={STATUS[r.status][1]}>{STATUS[r.status][0]}</__StatusBadge></span> : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="ix-table-wrap">
                    <table className="ix-table gc-table--keep">
                      <caption className="sr-only">Stock activity, {rows.length} rows</caption>
                      <thead>
                        <tr>
                          <th scope="col">Date</th>
                          <th scope="col">Product</th>
                          <th scope="col">Type</th>
                          <th scope="col">Place</th>
                          <th scope="col" className="ix-num">Change</th>
                          <th scope="col">Reference</th>
                          <th scope="col">By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shown.map((r) => (
                          <tr key={r.id} onClick={(e) => { if (e.target.closest && e.target.closest('a,button')) return; setOpen(r); }}>
                            <td className="ix-muted">{formatDateTime(r.at)}</td>
                            <td><button type="button" className="ix-strong sa-name" onClick={() => setOpen(r)}>{r.name}</button></td>
                            <td>{BADGE[r.status] ? <__StatusBadge tone={STATUS[r.status][1]}>{STATUS[r.status][0]}</__StatusBadge> : r.label}</td>
                            <td className="ix-muted">{r.place || '—'}</td>
                            <td className={'ix-num sa-qty ' + tone(r)}>{qtyText(r)}</td>
                            <td className="ix-muted sa-ref">{r.ref || '—'}</td>
                            <td className="ix-muted">{String(r.by).split(' · ')[0] || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>)}
                {rows.length > PAGE ? (
                  <Pager label={(page * PAGE + 1) + '–' + Math.min(rows.length, (page + 1) * PAGE) + ' of ' + rows.length} atStart={page === 0} atEnd={(page + 1) * PAGE >= rows.length} prev={() => setPage(page - 1)} next={() => setPage(page + 1)} />
                ) : <div className="ix-foot"><span>{rows.length === 1 ? '1 movement' : rows.length + ' movements'}</span></div>}
              </section>
              <LearnMore topic="stock activity" />
            </div>
          </div>
        </main>
      </div>

      {/* one movement */}
      <__Sheet open={!!o} title={o ? o.label : ''} onClose={() => setOpen(null)}
        footer={<button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => setOpen(null)}>Done</button>}>
        {o ? (<>
          <KV rows={[
            ['Product', o.name],
            ['SKU', o.sku],
            ['Place', o.place || '—'],
            ['Change', <b key="q" className={tone(o)}>{qtyText(o)}</b>],
            o.pack ? ['Entered as', Math.abs(o.qty / o.pack.qty) + ' × ' + o.pack.name] : null,
            ['Counts in', EFFECT[o.effect]],
            ['Status', STATUS[o.status] ? STATUS[o.status][0] : 'Done'],
            ['When', formatDateTime(o.at)],
            ['Reference', o.ref || '—'],
            ['By', o.by || '—'],
            o.reason ? ['Note', o.reason] : null,
            o.part ? ['Part of', o.part] : null,
            o.batch ? ['Batch', o.batch] : null,
            o.serial ? ['Serial / IMEI', <button key="s" type="button" className="ix-strong" onClick={() => { setOpen(null); openTrace(o.serial); }}>{o.serial}</button>] : null,
            o.keys && o.keys.length ? ['Licence keys', o.keys.length + ' given'] : null,
            o.sync ? ['Sync', o.sync === 'queued' ? 'Waiting to sync' : 'Sent'] : null,
          ]} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {o.ref ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => { setOpen(null); setFind(true); put('ref', o.ref); }}>Same reference</button> : null}
            <__Link href={'/stock?sku=' + encodeURIComponent(o.sku)} className="ix-btn ix-btn--sm">Stock of this product</__Link>
          </div>
        </>) : null}
      </__Sheet>

      {/* serial / IMEI trace */}
      <__Sheet open={!!trace} title="Trace a serial or IMEI" onClose={() => setTrace(null)}
        footer={<button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => setTrace(null)}>Done</button>}>
        {trace ? (<>
          <form className="sa-form" onSubmit={(e) => { e.preventDefault(); setTrace({ code: traceQ.trim() }); }}>
            <label className="ix-search">
              <__Icon name="scan-barcode" width="16" height="16" aria-hidden="true" />
              <input type="search" value={traceQ} onChange={(e) => setTraceQ(e.target.value)} placeholder="Scan or type a serial or IMEI" aria-label="Serial or IMEI" autoFocus />
            </label>
          </form>
          {!trace.code ? (
            <div className="sa-form">
              <p className="ix-muted" style={{ margin: 0, fontSize: 'var(--text-sm)' }}>Recent numbers</p>
              <div className="sa-units">{getUnits().slice(0, 8).map((u) => <button key={u.code} type="button" className="ix-chip" onClick={() => { setTraceQ(u.code); setTrace({ code: u.code }); }}>{u.code}</button>)}</div>
            </div>
          ) : !traced ? (
            <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>No unit has the number “{trace.code}”.</p>
          ) : (<>
            <KV rows={[
              [traced.unit.type, <b key="c" className="sa-ref">{traced.unit.code}</b>],
              ['Product', traced.unit.name],
              ['Status', <__StatusBadge key="s" tone={SERIAL_STATUS[traced.unit.status] || 'neutral'}>{traced.unit.status.charAt(0).toUpperCase() + traced.unit.status.slice(1)}</__StatusBadge>],
              ['Where now', traced.unit.status === 'sold' ? 'With the customer' : traced.unit.place || '—'],
            ]} />
            <h3 className="ix-section-title">Its life</h3>
            <ol className="sa-life">
              {traced.events.slice().reverse().map((e, i) => (
                <li key={i}>
                  <span className="sa-dot" aria-hidden="true" />
                  <span><b>{SERIAL_KIND[e.kind] || e.kind}{e.place ? ' · ' + e.place : ''}</b><small>{formatDateTime(e.at)}{e.ref ? ' · ' + e.ref : ''}{e.who ? ' · ' + e.who : ''}{e.by ? ' · by ' + e.by : ''}{e.note ? ' · ' + e.note : ''}</small></span>
                </li>
              ))}
            </ol>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              <button type="button" className="ix-btn ix-btn--sm" onClick={() => { setTrace(null); setFind(true); put('serial', traced.unit.code); }}>Show in stock activity</button>
              {traced.unit.status !== 'with vendor' && traced.unit.status !== 'sold' ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => { setTrace(null); setSend({ sku: traced.unit.sku, qty: '1', place: traced.unit.place && places.includes(traced.unit.place) ? traced.unit.place : places[0], party: '', rma: '', reason: CUSTODY_REASONS[0], expected: '', serials: traced.unit.code, note: '', err: '' }); }}>Send to vendor</button> : null}
            </div>
          </>)}
        </>) : null}
      </__Sheet>

      {/* send to a vendor or service centre */}
      <__Dialog open={!!send} title="Send to vendor" onClose={() => setSend(null)} width={560} footer={<>
        <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setSend(null)}>Cancel</button>
        <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={saveSend}>Send</button>
      </>}>
        {send ? (
          <div className="sa-form">
            <p className="ix-muted" style={{ margin: 0, fontSize: 'var(--text-sm)' }}>Still yours, but out of stock until it comes back.</p>
            <label className="sa-field"><span className="gc-label">Product</span>
              <select className="gc-input gc-select" value={send.sku} onChange={(e) => setSend({ ...send, sku: e.target.value, err: '' })}>
                <option value="">Pick a product</option>
                {physical.map((p) => <option key={p.sku} value={p.sku}>{p.name}{p.variant ? ' · ' + p.variant : ''}</option>)}
              </select>
            </label>
            <div className="sa-grid2">
              <label className="sa-field"><span className="gc-label">From</span>
                <select className="gc-input gc-select" value={send.place} onChange={(e) => setSend({ ...send, place: e.target.value })}>{places.map((p) => <option key={p}>{p}</option>)}</select>
              </label>
              <label className="sa-field"><span className="gc-label">How many{send.sku ? ' (' + Math.max(0, stockAt(send.sku, send.place).available) + ' free)' : ''}</span>
                <input className="gc-input" inputMode="numeric" value={send.qty} onChange={(e) => setSend({ ...send, qty: e.target.value })} />
              </label>
              <label className="sa-field"><span className="gc-label">Vendor or service centre</span>
                <input className="gc-input" value={send.party} onChange={(e) => setSend({ ...send, party: e.target.value, err: '' })} placeholder="For example Samsung service centre" />
              </label>
              <label className="sa-field"><span className="gc-label">RMA or job number</span>
                <input className="gc-input" value={send.rma} onChange={(e) => setSend({ ...send, rma: e.target.value })} />
              </label>
              <label className="sa-field"><span className="gc-label">Why</span>
                <select className="gc-input gc-select" value={send.reason} onChange={(e) => setSend({ ...send, reason: e.target.value })}>{CUSTODY_REASONS.map((r) => <option key={r}>{r}</option>)}</select>
              </label>
              <label className="sa-field"><span className="gc-label">Expected back</span>
                <input className="gc-input" type="date" value={send.expected} onChange={(e) => setSend({ ...send, expected: e.target.value })} />
              </label>
            </div>
            <label className="sa-field"><span className="gc-label">Serial or IMEI numbers</span>
              <input className="gc-input" value={send.serials} onChange={(e) => setSend({ ...send, serials: e.target.value })} placeholder="Scan each number" />
            </label>
            {send.err ? <p role="alert" style={{ margin: 0, color: 'var(--text-danger)', fontSize: 'var(--text-xs)' }}>{send.err}</p> : null}
          </div>
        ) : null}
      </__Dialog>

      {/* receive back */}
      <__Dialog open={!!back} title="Receive back" onClose={() => setBack(null)} footer={<>
        <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => { const r = back.row; closeCustody(r.id, 'Closed without return', me); setBack(null); __toast(r.id + ' closed. No stock came back.'); }}>Close without return</button>
        <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={saveBack}>Receive</button>
      </>}>
        {back ? (
          <div className="sa-form">
            <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>{back.row.name} from {back.row.party}{back.row.rma ? ' · ' + back.row.rma : ''}</p>
            <div className="sa-grid2">
              <label className="sa-field"><span className="gc-label">How many came back</span><input className="gc-input" inputMode="numeric" value={back.qty} onChange={(e) => setBack({ ...back, qty: e.target.value })} /></label>
              <label className="sa-field"><span className="gc-label">Into</span><select className="gc-input gc-select" value={back.place} onChange={(e) => setBack({ ...back, place: e.target.value })}>{places.map((p) => <option key={p}>{p}</option>)}</select></label>
            </div>
          </div>
        ) : null}
      </__Dialog>
    </div>
  );
}
