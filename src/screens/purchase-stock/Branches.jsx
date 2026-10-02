'use client';
// Branches — the branches from the one list of places (src/lib/locations.js) with real figures from
// the stock list (src/lib/stock.js placeStock), bins (src/lib/racks.js), the POS counters registered at
// each branch and today's POS sales there (src/lib/posStore.js, read-only; counters are managed in
// /pos-manage). Add, edit (name, code, address, area, phone, manager, opening hours, opening date,
// sells at a counter, receives deliveries, negative stock) and deactivate a branch. A branch with stock,
// holds, transfers on the way or counters switched on cannot be deactivated (placeShared.jsx).
// Laid out like a Shopify list (components/ui/IndexKit.jsx): key figures, then Active / All and a compact table;
// a click on a branch opens it (hours, sales today, counters, figures, its stock, and edit / transfer / deactivate).

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { EmptyState, StatusBadge } from '@/components/ui';
import { ShopHeader, MetricStrip, LearnMore } from '@/components/ui/IndexKit';
import { formatBDT, formatTime } from '@/lib/format';
import { usePlaceData, stockOf, countersAt, namesOfPlace, PLACE_CSS, PlaceList, PlaceDialog, usePlaceForm, usePlaceToggle } from './placeShared';

const startOfToday = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t.getTime(); };
/** POS sales made at a place today (in this browser). */
function salesToday(pl, d) {
  if (!d.ready) return { count: 0, total: 0 };
  const names = namesOfPlace(pl), from = startOfToday();
  const mine = d.sales.filter((s) => s.at >= from && names.includes(s.place));
  return { count: mine.length, total: mine.reduce((a, s) => a + ((s.totals && s.totals.total) || 0), 0) };
}

/** The POS counters of a branch, on its window. */
function Counters({ pl, d }) {
  const cs = countersAt(pl, d);
  return (
    <div className="pl-counters" aria-label={`POS counters at ${pl.name}`}>
      <h3 className="ix-section-title">POS counters</h3>
      {cs.length ? cs.map((x) => (
        <div key={x.c.id} className="pl-counter">
          <span><Icon name="monitor" width="14" height="14" aria-hidden="true" /> {x.c.name} <span className="pl-id">{x.c.id}</span></span>
          {!x.on ? <StatusBadge tone="neutral">Off</StatusBadge> : x.open ? <StatusBadge tone="success">{`Open · ${x.cashier}${d.shift ? ` since ${formatTime(d.shift.openedAt)}` : ''}`}</StatusBadge> : <StatusBadge tone="warning">Closed</StatusBadge>}
        </div>
      )) : <span className="pl-sub">{pl.counter ? 'No POS counter registered yet.' : 'Does not sell at a counter.'} {pl.counter ? <Link href="/pos-manage">Register one in POS manage</Link> : null}</span>}
      {cs.length ? <Link href="/pos-manage" className="pl-sub">Manage counters in POS manage</Link> : null}
    </div>
  );
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
  const figs = active.map((p) => stockOf(p, d));
  const total = (k) => figs.reduce((a, f) => a + f[k], 0);
  const open = active.filter((p) => !p.opening).length;
  const counters = active.reduce((a, p) => a + countersAt(p, d).filter((x) => x.on).length, 0);
  const openNow = active.reduce((a, p) => a + countersAt(p, d).filter((x) => x.open).length, 0);
  const sold = active.reduce((a, p) => { const s = salesToday(p, d); return { total: a.total + s.total, count: a.count + s.count }; }, { total: 0, count: 0 });
  const viewing = view ? d.places.find((p) => p.id === view) : null;
  const add = () => form.open(null, 'Branch');
  const countersText = (pl) => { const cs = countersAt(pl, d); return cs.length ? `${cs.filter((x) => x.on).length} on · ${cs.filter((x) => x.open).length} open` : '—'; };
  const viewSold = viewing ? salesToday(viewing, d) : null;

  return (
    <div className="dc-screen ds" data-screen="Branches">
      <style dangerouslySetInnerHTML={{ __html: PLACE_CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="stock-branches" />
        <main className="gc-shell__main">
          <Topbar crumb="Products & stock" page="Branches" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="store" title="Branches"
                about="Your shops. Each one keeps its own stock, sells at its POS counters and gets stock from a warehouse by transfer. A branch can only be deactivated when it is empty and its counters are switched off."
                secondary={[{ label: 'POS counters', href: '/pos-manage' }]}
                more={[{ label: 'Transfers', href: '/transfers' }, { label: 'Warehouses', href: '/warehouses' }, { label: 'Racks & bins', href: '/racks' }]}
                primary={{ label: 'Add branch', onClick: add }} />

              <MetricStrip label="Branch figures" items={[
                { label: 'Branches', value: String(open), sub: `open${active.length - open ? ` · ${active.length - open} opening soon` : ''}${inactive.length ? ` · ${inactive.length} inactive` : ''}` },
                { label: 'POS sales today', value: formatBDT(sold.total), sub: `${sold.count} sales` },
                { label: 'POS counters', value: String(counters), sub: `switched on · ${openNow} open now`, href: '/pos-manage' },
                { label: 'Stock in branches', value: formatBDT(total('value')), sub: `${total('onHand').toLocaleString('en-IN')} pcs · ${total('low')} low` },
              ]} />

              <PlaceList label="Branches" nouns={['branch', 'branches']} all={all} active={active} showOff={showOff} setShowOff={setShowOff} d={d}
                onOpen={(pl) => setView(pl.id)}
                mid={(pl, st) => [pl.area, `${st.onHand.toLocaleString('en-IN')} pcs`, formatBDT(salesToday(pl, d).total) + ' today'].filter(Boolean).join(' · ')}
                cols={[
                  { h: 'Counters', cell: (pl) => countersText(pl) },
                  { h: 'Sales today', num: true, cell: (pl) => formatBDT(salesToday(pl, d).total) },
                  { h: 'On hand', num: true, cell: (pl, st) => st.onHand.toLocaleString('en-IN') },
                  { h: 'Stock value', num: true, cell: (pl, st) => formatBDT(st.value) },
                  { h: 'Low stock', num: true, cell: (pl, st) => <span className={st.negative.length ? 'pl-badc' : st.low ? 'pl-warnc' : ''}>{st.low}{st.negative.length ? ` · ${st.negative.length} below 0` : ''}</span> },
                ]}
                empty={<EmptyState icon="store" title="No branches yet" body="Add your first shop." actionLabel="Add branch" onAction={add} />} />
              <LearnMore topic="branches" />
            </div>
          </div>
        </main>
      </div>
      {form.dialog}
      {toggle.dialog}
      {viewing ? <PlaceDialog pl={viewing} d={d} onClose={() => setView(null)}
        facts={[
          ['Opening hours', viewing.hours || 'Opening hours not set'],
          viewing.counter || countersAt(viewing, d).length ? ['Sales today', `${formatBDT(viewSold.total)} · ${viewSold.count} ${viewSold.count === 1 ? 'sale' : 'sales'}`] : null,
        ]}
        extra={<Counters pl={viewing} d={d} />}
        onEdit={() => { setView(null); form.open(viewing); }}
        onToggle={() => { setView(null); toggle.ask(viewing, viewing.active === false ? 'on' : 'off'); }}
        onDelete={() => { setView(null); toggle.ask(viewing, 'delete'); }} /> : null}
    </div>
  );
}
