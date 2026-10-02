'use client';
// Warehouses — the warehouses from the one list of places (src/lib/locations.js), with real figures
// from the stock list (src/lib/stock.js placeStock): products stocked, pieces on hand, stock value,
// held, in transit in / out, low stock and bins used (src/lib/racks.js).
// Add, edit (name, code, address, area, phone, manager, receives deliveries, negative stock) and
// deactivate a warehouse. A warehouse with stock, holds, transfers on the way or counters switched on
// cannot be deactivated: the dialog says what blocks it and links to the fix (placeShared.jsx).

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { PageHeader, EmptyState } from '@/components/ui';
import { formatBDT } from '@/lib/format';
import { placeBinStats } from '@/lib/racks';
import { usePlaceData, stockOf, PLACE_CSS, PlaceCard, PlaceStockDialog, usePlaceForm, usePlaceToggle } from './placeShared';

const WH_CSS = `
@media (max-width:640px){
  /* page title + "More" + main button share one row: the title keeps whole words (never split mid-word),
     the main button is a little narrower; if they still do not fit, the row wraps */
  [data-screen="Warehouses"] .gc-shell__content .gc-pagehead>.gc-pagehead__text{flex-basis:0!important;min-width:min-content!important}
  [data-screen="Warehouses"] .gc-pagehead__actions .gc-btn--solid{padding:0 var(--space-3)}
}
`;

export default function Warehouses() {
  const [d, reload] = usePlaceData();
  const [view, setView] = useState(null);
  const [showOff, setShowOff] = useState(false);
  const form = usePlaceForm(d, reload);
  const toggle = usePlaceToggle(d, reload);

  const all = d.places.filter((p) => p.type === 'Warehouse');
  const active = all.filter((p) => p.active !== false);
  const inactive = all.filter((p) => p.active === false);
  const shown = showOff ? all : active;
  const figs = active.map((p) => stockOf(p, d));
  const total = (k) => figs.reduce((a, f) => a + f[k], 0);
  const bins = active.reduce((a, p) => { const b = placeBinStats(p.id, d.racks); return { used: a.used + b.used, all: a.all + b.bins }; }, { used: 0, all: 0 });
  const viewing = view ? d.places.find((p) => p.id === view) : null;

  return (
    <div className="dc-screen ds" data-screen="Warehouses">
      <style dangerouslySetInnerHTML={{ __html: PLACE_CSS + WH_CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="stock-wh" />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb="Products & stock" page="Warehouses" />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <PageHeader
              title="Warehouses"
              about="Where stock is kept in bulk and sent to your branches. Figures come from the stock list."
              actions={<>
                <Link href="/racks" className="gc-btn gc-btn--neutral"><Icon name="layout-grid" width="18" height="18" aria-hidden="true" /> Racks & bins</Link>
                <button type="button" className="gc-btn gc-btn--solid" onClick={() => form.open(null, 'Warehouse')}><Icon name="plus" width="18" height="18" aria-hidden="true" /> Add warehouse</button>
              </>}
            />

            <div className="gc-kpis">
              <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-primary-soft)', color: 'var(--primary)' }}><Icon name="warehouse" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Warehouses</p><p className="gc-kpi__value">{active.length}<small>active{inactive.length ? ` · ${inactive.length} inactive` : ''}</small></p></div></div>
              <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-success-soft)', color: 'var(--text-success)' }}><Icon name="banknote" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Stock value</p><p className="gc-kpi__value">{formatBDT(total('value'))}<small>{total('onHand').toLocaleString('en-IN')} pcs</small></p></div></div>
              <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-info-soft)', color: 'var(--text-info)' }}><Icon name="truck" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">On the way</p><p className="gc-kpi__value">{total('transitOut')}<small>pcs out · {total('transitIn')} in</small></p></div></div>
              <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-warning-soft)', color: 'var(--text-warning)' }}><Icon name="layout-grid" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Bins used</p><p className="gc-kpi__value">{bins.all ? Math.round((bins.used / bins.all) * 100) + '%' : '—'}<small>{bins.all ? `${bins.used} of ${bins.all} bins` : 'no racks yet'}</small></p></div></div>
            </div>

            {inactive.length ? (
              <div className="gc-seg" role="group" aria-label="Which warehouses" style={{ alignSelf: 'flex-start' }}>
                <button type="button" className={'gc-seg__btn' + (!showOff ? ' gc-seg__btn--active' : '')} aria-pressed={!showOff} onClick={() => setShowOff(false)}>Active · {active.length}</button>
                <button type="button" className={'gc-seg__btn' + (showOff ? ' gc-seg__btn--active' : '')} aria-pressed={showOff} onClick={() => setShowOff(true)}>All · {all.length}</button>
              </div>
            ) : null}

            {shown.length === 0 ? (
              <section className="gc-card"><EmptyState icon="warehouse" title="No warehouses yet" body="Add the first place where you keep stock in bulk." actionLabel="Add warehouse" onAction={() => form.open(null, 'Warehouse')} /></section>
            ) : (
              <div className="pl-grid">
                {shown.map((pl) => (
                  <PlaceCard key={pl.id} pl={pl} d={d}
                    onView={() => setView(pl.id)} onEdit={() => form.open(pl)}
                    onToggle={() => toggle.ask(pl, pl.active === false ? 'on' : 'off')} onDelete={() => toggle.ask(pl, 'delete')} />
                ))}
              </div>
            )}
            <p className="gc-help" style={{ margin: 0 }}>A warehouse can only be deactivated when it is empty: no stock on hand, nothing held, no transfer on the way and no POS counter switched on.</p>
          </div>
        </main>
      </div>
      {form.dialog}
      {toggle.dialog}
      {viewing ? <PlaceStockDialog pl={viewing} d={d} onClose={() => setView(null)} /> : null}
    </div>
  );
}
