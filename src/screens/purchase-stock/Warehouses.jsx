'use client';
// Warehouses — the warehouses from the one list of places (src/lib/locations.js), with real figures
// from the stock list (src/lib/stock.js placeStock): products stocked, pieces on hand, stock value,
// held, in transit in / out, low stock and bins used (src/lib/racks.js).
// Add, edit (name, code, address, area, phone, manager, receives deliveries, negative stock) and
// deactivate a warehouse. A warehouse with stock, holds, transfers on the way or counters switched on
// cannot be deactivated: the dialog says what blocks it and links to the fix (placeShared.jsx).
// Laid out like a Shopify list (components/ui/IndexKit.jsx): key figures, then Active / All and a compact table;
// a click on a warehouse opens it (manager, contact, figures, its stock, and edit / transfer / deactivate).

import React, { useState } from 'react';
import { Sidebar, Topbar } from '@/shell/Shell';
import { EmptyState } from '@/components/ui';
import { ShopHeader, MetricStrip, LearnMore } from '@/components/ui/IndexKit';
import { formatBDT } from '@/lib/format';
import { placeBinStats } from '@/lib/racks';
import { usePlaceData, stockOf, PLACE_CSS, PlaceList, PlaceDialog, usePlaceForm, usePlaceToggle } from './placeShared';

export default function Warehouses() {
  const [d, reload] = usePlaceData();
  const [view, setView] = useState(null);
  const [showOff, setShowOff] = useState(false);
  const form = usePlaceForm(d, reload);
  const toggle = usePlaceToggle(d, reload);

  const all = d.places.filter((p) => p.type === 'Warehouse');
  const active = all.filter((p) => p.active !== false);
  const inactive = all.filter((p) => p.active === false);
  const figs = active.map((p) => stockOf(p, d));
  const total = (k) => figs.reduce((a, f) => a + f[k], 0);
  const bins = active.reduce((a, p) => { const b = placeBinStats(p.id, d.racks); return { used: a.used + b.used, all: a.all + b.bins }; }, { used: 0, all: 0 });
  const viewing = view ? d.places.find((p) => p.id === view) : null;
  const add = () => form.open(null, 'Warehouse');
  const binsOf = (pl) => { const b = placeBinStats(pl.id, d.racks); return b.bins ? `${Math.round((b.used / b.bins) * 100)}%` : '—'; };

  return (
    <div className="dc-screen ds" data-screen="Warehouses">
      <style dangerouslySetInnerHTML={{ __html: PLACE_CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="stock-wh" />
        <main className="gc-shell__main">
          <Topbar crumb="Products & stock" page="Warehouses" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="warehouse" title="Warehouses"
                about="Where stock is kept in bulk and sent to your branches. Figures come from the stock list. A warehouse can only be deactivated when it is empty: no stock on hand, nothing held, no transfer on the way and no POS counter switched on."
                secondary={[{ label: 'Racks & bins', href: '/racks' }]}
                more={[{ label: 'Transfers', href: '/transfers' }, { label: 'Branches', href: '/branches' }]}
                primary={{ label: 'Add warehouse', onClick: add }} />

              <MetricStrip label="Warehouse figures" items={[
                { label: 'Warehouses', value: String(active.length), sub: `active${inactive.length ? ` · ${inactive.length} inactive` : ''}` },
                { label: 'Stock value', value: formatBDT(total('value')), sub: `${total('onHand').toLocaleString('en-IN')} pcs` },
                { label: 'On the way', value: String(total('transitOut')), sub: `pcs out · ${total('transitIn')} in`, href: '/transfers' },
                { label: 'Bins used', value: bins.all ? Math.round((bins.used / bins.all) * 100) + '%' : '—', sub: bins.all ? `${bins.used} of ${bins.all} bins` : 'no racks yet', href: '/racks' },
              ]} />

              <PlaceList label="Warehouses" nouns={['warehouse', 'warehouses']} all={all} active={active} showOff={showOff} setShowOff={setShowOff} d={d}
                onOpen={(pl) => setView(pl.id)}
                mid={(pl, st) => [pl.area, `${st.onHand.toLocaleString('en-IN')} pcs`, formatBDT(st.value)].filter(Boolean).join(' · ')}
                cols={[
                  { h: 'Products', num: true, cell: (pl, st) => st.products },
                  { h: 'On hand', num: true, cell: (pl, st) => st.onHand.toLocaleString('en-IN') },
                  { h: 'Stock value', num: true, cell: (pl, st) => formatBDT(st.value) },
                  { h: 'Low stock', num: true, cell: (pl, st) => <span className={st.negative.length ? 'pl-badc' : st.low ? 'pl-warnc' : ''}>{st.low}{st.negative.length ? ` · ${st.negative.length} below 0` : ''}</span> },
                  { h: 'Bins used', num: true, cell: (pl) => binsOf(pl) },
                ]}
                empty={<EmptyState icon="warehouse" title="No warehouses yet" body="Add the first place where you keep stock in bulk." actionLabel="Add warehouse" onAction={add} />} />
              <LearnMore topic="warehouses" />
            </div>
          </div>
        </main>
      </div>
      {form.dialog}
      {toggle.dialog}
      {viewing ? <PlaceDialog pl={viewing} d={d} onClose={() => setView(null)}
        onEdit={() => { setView(null); form.open(viewing); }}
        onToggle={() => { setView(null); toggle.ask(viewing, viewing.active === false ? 'on' : 'off'); }}
        onDelete={() => { setView(null); toggle.ask(viewing, 'delete'); }} /> : null}
    </div>
  );
}
