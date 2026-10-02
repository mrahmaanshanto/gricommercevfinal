'use client';
// Branches — the branches from the one list of places (src/lib/locations.js) with real figures from
// the stock list (src/lib/stock.js placeStock), bins (src/lib/racks.js), the POS counters registered at
// each branch and today's POS sales there (src/lib/posStore.js, read-only; counters are managed in
// /pos-manage). Add, edit (name, code, address, area, phone, manager, opening hours, opening date,
// sells at a counter, receives deliveries, negative stock) and deactivate a branch. A branch with stock,
// holds, transfers on the way or counters switched on cannot be deactivated (placeShared.jsx).

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { PageHeader, EmptyState } from '@/components/ui';
import { formatBDT, formatTime } from '@/lib/format';
import { usePlaceData, stockOf, countersAt, namesOfPlace, PLACE_CSS, PlaceCard, PlaceStockDialog, usePlaceForm, usePlaceToggle } from './placeShared';

const startOfToday = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t.getTime(); };
/** POS sales made at a place today (in this browser). */
function salesToday(pl, d) {
  if (!d.ready) return { count: 0, total: 0 };
  const names = namesOfPlace(pl), from = startOfToday();
  const mine = d.sales.filter((s) => s.at >= from && names.includes(s.place));
  return { count: mine.length, total: mine.reduce((a, s) => a + ((s.totals && s.totals.total) || 0), 0) };
}

function BranchExtra({ pl, d }) {
  const cs = countersAt(pl, d);
  const sold = salesToday(pl, d);
  return (<>
    <span><Icon name="clock" width="14" height="14" aria-hidden="true" /> {pl.hours || 'Opening hours not set'}</span>
    {pl.counter || cs.length ? <span><Icon name="receipt" width="14" height="14" aria-hidden="true" /> Sales today: <b>{formatBDT(sold.total)}</b> · {sold.count} {sold.count === 1 ? 'sale' : 'sales'}</span> : null}
    <div className="pl-counters" aria-label={`POS counters at ${pl.name}`}>
      {cs.length ? cs.map((x) => (
        <div key={x.c.id} className="pl-counter">
          <span><Icon name="monitor" width="14" height="14" aria-hidden="true" /> {x.c.name} <span className="pl-id">{x.c.id}</span></span>
          {!x.on ? <span className="gc-badge gc-badge--slate">Off</span> : x.open ? <span className="gc-badge gc-badge--success">Open · {x.cashier}{d.shift ? ` since ${formatTime(d.shift.openedAt)}` : ''}</span> : <span className="gc-badge gc-badge--warning">Closed</span>}
        </div>
      )) : <span>{pl.counter ? 'No POS counter registered yet.' : 'Does not sell at a counter.'} {pl.counter ? <Link href="/pos-manage">Register one in POS manage</Link> : null}</span>}
      {cs.length ? <Link href="/pos-manage" style={{ fontSize: 'var(--text-xs)' }}>Manage counters in POS manage</Link> : null}
    </div>
  </>);
}

export default function Branches() {
  const [d, reload] = usePlaceData();
  const [view, setView] = useState(null);
  const [showOff, setShowOff] = useState(false);
  const form = usePlaceForm(d, reload);
  const toggle = usePlaceToggle(d, reload);

  const all = d.places.filter((p) => p.type === 'Branch');
  const active = all.filter((p) => p.active !== false);
  const inactive = all.filter((p) => p.active === false);
  const shown = showOff ? all : active;
  const figs = active.map((p) => stockOf(p, d));
  const total = (k) => figs.reduce((a, f) => a + f[k], 0);
  const open = active.filter((p) => !p.opening).length;
  const counters = active.reduce((a, p) => a + countersAt(p, d).filter((x) => x.on).length, 0);
  const openNow = active.reduce((a, p) => a + countersAt(p, d).filter((x) => x.open).length, 0);
  const sold = active.reduce((a, p) => { const s = salesToday(p, d); return { total: a.total + s.total, count: a.count + s.count }; }, { total: 0, count: 0 });
  const viewing = view ? d.places.find((p) => p.id === view) : null;

  return (
    <div className="dc-screen ds" data-screen="Branches">
      <style dangerouslySetInnerHTML={{ __html: PLACE_CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="stock-branches" />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb="Products & stock" page="Branches" />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <PageHeader
              title="Branches"
              about="Your shops. Each one keeps its own stock, sells at its POS counters and gets stock from a warehouse by transfer."
              actions={<>
                <Link href="/pos-manage" className="gc-btn gc-btn--neutral"><Icon name="monitor" width="18" height="18" aria-hidden="true" /> POS counters</Link>
                <button type="button" className="gc-btn gc-btn--solid" onClick={() => form.open(null, 'Branch')}><Icon name="plus" width="18" height="18" aria-hidden="true" /> Add branch</button>
              </>}
            />

            <div className="gc-kpis">
              <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-primary-soft)', color: 'var(--primary)' }}><Icon name="store" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Branches</p><p className="gc-kpi__value">{open}<small>open{active.length - open ? ` · ${active.length - open} opening soon` : ''}{inactive.length ? ` · ${inactive.length} inactive` : ''}</small></p></div></div>
              <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-success-soft)', color: 'var(--text-success)' }}><Icon name="receipt" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">POS sales today</p><p className="gc-kpi__value">{formatBDT(sold.total)}<small>{sold.count} sales</small></p></div></div>
              <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-info-soft)', color: 'var(--text-info)' }}><Icon name="monitor" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">POS counters</p><p className="gc-kpi__value">{counters}<small>switched on · {openNow} open now</small></p></div></div>
              <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-warning-soft)', color: 'var(--text-warning)' }}><Icon name="package" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Stock in branches</p><p className="gc-kpi__value">{formatBDT(total('value'))}<small>{total('onHand').toLocaleString('en-IN')} pcs · {total('low')} low</small></p></div></div>
            </div>

            {inactive.length ? (
              <div className="gc-seg" role="group" aria-label="Which branches" style={{ alignSelf: 'flex-start' }}>
                <button type="button" className={'gc-seg__btn' + (!showOff ? ' gc-seg__btn--active' : '')} aria-pressed={!showOff} onClick={() => setShowOff(false)}>Active · {active.length}</button>
                <button type="button" className={'gc-seg__btn' + (showOff ? ' gc-seg__btn--active' : '')} aria-pressed={showOff} onClick={() => setShowOff(true)}>All · {all.length}</button>
              </div>
            ) : null}

            {shown.length === 0 ? (
              <section className="gc-card"><EmptyState icon="store" title="No branches yet" body="Add your first shop." actionLabel="Add branch" onAction={() => form.open(null, 'Branch')} /></section>
            ) : (
              <div className="pl-grid">
                {shown.map((pl) => (
                  <PlaceCard key={pl.id} pl={pl} d={d} extra={<BranchExtra pl={pl} d={d} />}
                    onView={() => setView(pl.id)} onEdit={() => form.open(pl)}
                    onToggle={() => toggle.ask(pl, pl.active === false ? 'on' : 'off')} onDelete={() => toggle.ask(pl, 'delete')} />
                ))}
              </div>
            )}
            <p className="gc-help" style={{ margin: 0 }}>A branch can only be deactivated when it is empty and its counters are switched off.</p>
          </div>
        </main>
      </div>
      {form.dialog}
      {toggle.dialog}
      {viewing ? <PlaceStockDialog pl={viewing} d={d} onClose={() => setView(null)} /> : null}
    </div>
  );
}
