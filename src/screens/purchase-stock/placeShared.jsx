'use client';
// placeShared — what Warehouses and Branches share: the live data of every place, the place card,
// the add / edit form, the stock-at-a-place dialog and the checks before a place is switched off.
//   Places      src/lib/locations.js (getPlaces, savePlace, setPlaceActive, deletePlace)
//   Stock       src/lib/stock.js (placeStock → on hand, held, value, in transit, low, below zero)
//   Bins        src/lib/racks.js (placeBinStats, binsFor)
//   Counters    src/lib/posStore.js (counters at the place, the shift open on this device, POS sales)
// A place that still has stock on hand, stock held for orders, transfers on the way, POS counters
// switched on or stock listed in bins cannot be switched off or removed: the dialog says what blocks
// it and links to the screen that fixes it.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Dialog, EmptyState } from '@/components/ui';
import { formatBDT } from '@/lib/format';
import { getPlaces, savePlace, setPlaceActive, deletePlace, checkPlace, STAFF_NAMES, codeOf } from '@/lib/locations';
import { CATALOG, getCatalog, getMoves, placeStock, allowNegative, setAllowNegative } from '@/lib/stock';
import { getHolds } from '@/lib/stockHolds';
import { getTransfers } from '@/lib/transfers';
import { getCounters, load, POS_KEYS } from '@/lib/posStore';
import { getRackData, placeBinStats, binsFor, SEED as RACK_SEED } from '@/lib/racks';

// ---- data ----------------------------------------------------------------------------------------
/** The first render uses built-in data only (the same on the server); the browser's data after mount. */
const FIRST = { ready: false, places: getPlaces({ saved: [] }), holds: [], moves: [], transfers: null, catalog: CATALOG, counters: [], shift: null, sales: [], racks: RACK_SEED };
export function usePlaceData() {
  const [data, setData] = useState(FIRST);
  const reload = useCallback(() => setData({
    ready: true, places: getPlaces(), holds: getHolds(), moves: getMoves(), transfers: getTransfers(), catalog: getCatalog(),
    counters: getCounters(), shift: load(POS_KEYS.shift, null), sales: load(POS_KEYS.sales, []), racks: getRackData(),
  }), []);
  useEffect(() => {
    reload();
    const onStore = () => reload();
    window.addEventListener('storage', onStore);
    return () => window.removeEventListener('storage', onStore);
  }, [reload]);
  return [data, reload];
}
export const namesOfPlace = (pl) => [pl.name, ...(pl.aka || [])];
/** Stock figures of one place from the loaded data. */
export const stockOf = (pl, d) => placeStock(pl.name, { holds: d.holds, moves: d.moves, transfers: d.transfers, catalog: d.catalog });
/** POS counters registered at a place: [{ c, on, open, cashier }]. */
export function countersAt(pl, d) {
  const names = namesOfPlace(pl);
  return d.counters.filter((c) => names.includes(c.location) || names.includes(c.stock)).map((c) => {
    const open = !!(d.shift && d.shift.counter === c.name);
    return { c, on: !!c.active, open, cashier: open ? d.shift.cashier : '' };
  });
}
const shortCounter = (name) => { const parts = String(name).split(' · '); return parts[parts.length - 1]; };
const plural = (n, one, many) => `${n} ${n === 1 ? one : many || one + 's'}`;

/** What stops a place from being switched off: [{ text, href, fix }]. Empty when it can go. */
export function placeBlockers(pl, d) {
  if (pl.fixed) return [{ text: 'Returns, damaged stock and supplier returns use this bay', href: '/stock-holds?tab=damaged', fix: 'Damaged stock' }];
  const names = namesOfPlace(pl);
  const st = stockOf(pl, d);
  const out = [];
  if (st.onHand > 0) out.push({ text: `${st.onHand} pieces on hand`, href: `/new-transfer?from=${encodeURIComponent(pl.name)}`, fix: 'Move it with a transfer' });
  if (st.negative.length) out.push({ text: `${plural(st.negative.length, 'product')} below zero`, href: '/stock-adjustments', fix: 'Correct the count' });
  const held = d.holds.filter((h) => h.status === 'held' && names.includes(h.place)).reduce((a, h) => a + (Number(h.qty) || 0), 0);
  if (held) out.push({ text: `${held} held for orders`, href: '/stock-holds', fix: 'End or move the holds' });
  const way = (d.transfers || []).filter((t) => t.status === 'way' && (names.includes(t.from) || names.includes(t.to)));
  if (way.length) out.push({ text: `${plural(way.length, 'transfer')} on the way`, href: '/transfers', fix: 'Receive or cancel them' });
  const cs = countersAt(pl, d).filter((x) => x.on);
  if (cs.length) out.push({ text: cs.map((x) => `${shortCounter(x.c.name)} ${x.open ? 'open' : 'switched on'}`).join(' · '), href: '/pos-manage', fix: 'Close and switch off counters' });
  const binned = placeBinStats(pl.id, d.racks).pieces;
  if (binned > 0 && st.onHand <= 0) out.push({ text: `${binned} pieces still listed in bins`, href: `/racks?place=${pl.id}`, fix: 'Empty the bins' });
  return out;
}

// ---- styles --------------------------------------------------------------------------------------
export const PLACE_CSS = `
.pl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr));gap:var(--space-4)}
.pl-card{display:flex;flex-direction:column;gap:var(--space-4);padding:var(--space-5);min-width:0}
.pl-card.is-off{background:var(--surface-page)}
.pl-top{display:flex;align-items:flex-start;gap:var(--space-3);min-width:0}
.pl-code{width:44px;height:44px;flex:none;border-radius:var(--radius-xl);background:var(--fill-primary-soft);color:var(--primary);display:flex;align-items:center;justify-content:center;font-family:var(--font-data);font-size:var(--text-xs);font-weight:var(--weight-semibold)}
.pl-card.is-off .pl-code{background:var(--surface-subtle);color:var(--text-muted)}
.pl-title{flex:1;min-width:0}
.pl-title h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading);overflow-wrap:anywhere}
.pl-title p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted);overflow-wrap:anywhere}
.pl-badges{display:flex;flex-wrap:wrap;gap:var(--space-1);justify-content:flex-end}
.pl-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3) var(--space-4);margin:0}
.pl-stats div{min-width:0}
.pl-stats dt{font-size:var(--text-xs);color:var(--text-muted)}
.pl-stats dd{margin:2px 0 0;font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.pl-stats dd.is-warn{color:var(--text-warning)}
.pl-stats dd.is-bad{color:var(--text-danger)}
.pl-cap{display:flex;flex-direction:column;gap:var(--space-2)}
.pl-cap__row{display:flex;justify-content:space-between;gap:var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.pl-cap__row b{font-weight:var(--weight-medium);color:var(--text-heading)}
.pl-meta{display:flex;flex-direction:column;gap:var(--space-1);font-size:var(--text-xs);color:var(--text-muted)}
.pl-meta span{display:flex;align-items:center;gap:var(--space-2);min-width:0;overflow-wrap:anywhere}
.pl-meta b{font-weight:var(--weight-medium);color:var(--text-body)}
.pl-flags{display:flex;flex-wrap:wrap;gap:var(--space-1)}
.pl-actions{display:flex;flex-wrap:wrap;gap:var(--space-2);margin-top:auto;padding-top:var(--space-3);border-top:1px solid var(--border-subtle)}
.pl-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.pl-id{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.pl-strong{font-weight:var(--weight-medium);color:var(--text-heading)}
.pl-num{text-align:right;font-variant-numeric:tabular-nums;font-family:var(--font-data)}
.pl-neg{color:var(--text-danger);font-weight:var(--weight-semibold)}
.pl-form{display:flex;flex-direction:column;gap:var(--space-4)}
.pl-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.pl-sw{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-3) 0;border-top:1px solid var(--border-subtle)}
.pl-sw span{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.pl-sw small{display:block;font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.pl-sw small.is-bad{color:var(--text-danger)}
.pl-warn{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);background:var(--fill-warning-soft);color:var(--text-warning);font-size:var(--text-xs)}
.pl-warn b{font-weight:var(--weight-semibold)}
.pl-warn ul{margin:0;padding-left:var(--space-4)}
.pl-block{display:flex;flex-direction:column;gap:var(--space-3)}
.pl-block__sum{margin:0;padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);background:var(--fill-error-soft);color:var(--text-danger);font-size:var(--text-sm);font-weight:var(--weight-medium)}
.pl-block__row{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-2);padding:var(--space-3) 0;border-bottom:1px solid var(--border-subtle);font-size:var(--text-sm)}
.pl-search{display:flex;flex-wrap:wrap;gap:var(--space-3);align-items:center;justify-content:space-between}
.pl-search .gc-input{flex:1;min-width:200px}
.pl-mini{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:var(--space-3)}
.pl-mini div{padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.pl-mini dt{font-size:var(--text-xs);color:var(--text-muted)}
.pl-mini dd{margin:2px 0 0;font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pl-dlg{display:flex;flex-direction:column;gap:var(--space-4)}
.pl-dlg .gc-table-wrap{max-height:52vh;overflow:auto;border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.pl-counters{display:flex;flex-direction:column;gap:var(--space-1)}
.pl-counter{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);font-size:var(--text-xs)}
@media (max-width:599px){.pl-two{grid-template-columns:1fr}.pl-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
`;

// ---- the place card ------------------------------------------------------------------------------
export function StatusOf({ pl }) {
  if (pl.active === false) return <span className="gc-badge gc-badge--slate">Inactive</span>;
  if (pl.opening) return <span className="gc-badge gc-badge--warning">Opens {pl.opening}</span>;
  if (pl.type === 'Branch') return <span className="gc-badge gc-badge--success">Open</span>;
  const role = pl.role || 'Warehouse';
  return <span className={'gc-badge gc-badge--' + (role === 'Main' ? 'primary' : role === 'Returns' ? 'error' : 'info')}>{role}</span>;
}
export function PlaceCard({ pl, d, extra, onView, onEdit, onToggle, onDelete }) {
  const st = stockOf(pl, d);
  const bins = placeBinStats(pl.id, d.racks);
  const pct = bins.bins ? Math.round((bins.used / bins.bins) * 100) : 0;
  const neg = d.ready && allowNegative(pl.name);
  const off = pl.active === false;
  return (
    <article className={'gc-card pl-card' + (off ? ' is-off' : '')} aria-label={pl.name}>
      <div className="pl-top">
        <span className="pl-code" aria-hidden="true">{pl.code}</span>
        <div className="pl-title"><h2>{pl.name}</h2>{pl.area ? <p title={pl.address || undefined}>{pl.area}</p> : null}</div>
        <div className="pl-badges"><StatusOf pl={pl} /></div>
      </div>
      <dl className="pl-stats">
        <div><dt>Products</dt><dd>{st.products}</dd></div>
        <div><dt>On hand</dt><dd>{st.onHand.toLocaleString('en-IN')} pcs</dd></div>
        <div><dt>Stock value</dt><dd>{formatBDT(st.value)}</dd></div>
        <div><dt>Held</dt><dd className={st.held ? 'is-warn' : ''}>{st.held}</dd></div>
        <div><dt>On the way</dt><dd title="Coming in · going out">↓{st.transitIn} · ↑{st.transitOut}</dd></div>
        <div><dt>Low stock</dt><dd className={st.negative.length ? 'is-bad' : st.low ? 'is-warn' : ''}>{st.low}{st.negative.length ? ` · ${st.negative.length} below 0` : ''}</dd></div>
      </dl>
      <div className="pl-cap">
        {bins.bins ? (<>
          <div className="pl-cap__row"><span>Bins used · {bins.racks} {bins.racks === 1 ? 'rack' : 'racks'}</span><b>{bins.used} of {bins.bins} · {pct}%</b></div>
          <div className="gc-progress" role="progressbar" aria-label={`Bins used at ${pl.name}`} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><div className="gc-progress__fill" style={{ width: pct + '%', background: pct > 85 ? 'var(--warning)' : 'var(--primary)' }} /></div>
        </>) : <div className="pl-cap__row"><span>No racks set up yet</span><Link href={`/racks?place=${pl.id}`}>Set up racks</Link></div>}
      </div>
      <div className="pl-meta">
        <span><Icon name="user" width="14" height="14" aria-hidden="true" /> Manager: <b>{pl.manager || 'Not set'}</b>{pl.phone ? <> · <span className="pl-id">{pl.phone}</span></> : null}</span>
        {extra}
      </div>
      <div className="pl-flags">
        {pl.type === 'Branch' ? <span className={'gc-badge gc-badge--' + (pl.counter ? 'info' : 'slate')}>{pl.counter ? 'Sells at a counter' : 'No counter sales'}</span> : null}
        {pl.receives ? <span className="gc-badge gc-badge--info">Receives deliveries</span> : null}
        {neg ? <span className="gc-badge gc-badge--error">Negative stock allowed</span> : null}
      </div>
      <div className="pl-actions">
        <button type="button" className="gc-btn gc-btn--sm gc-btn--soft" onClick={onView}><Icon name="boxes" width="16" height="16" aria-hidden="true" /> View stock</button>
        <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={onEdit}><Icon name="pencil" width="16" height="16" aria-hidden="true" /> Edit</button>
        {!off && !pl.noSale ? <Link className="gc-btn gc-btn--sm gc-btn--neutral" href={`/new-transfer?from=${encodeURIComponent(pl.name)}`}><Icon name="arrow-left-right" width="16" height="16" aria-hidden="true" /> New transfer</Link> : null}
        {!pl.fixed ? <button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={onToggle}>{off ? 'Activate' : 'Deactivate'}</button> : null}
        {!pl.builtIn ? <button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={onDelete} aria-label={`Remove ${pl.name}`}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button> : null}
      </div>
    </article>
  );
}

// ---- switch a place off / on / remove -----------------------------------------------------------
/** Hook: returns { ask(pl, 'off'|'on'|'delete'), dialog } — the dialog shows what blocks a place. */
export function usePlaceToggle(d, reload) {
  const [blocked, setBlocked] = useState(null);   // { pl, what, items }
  const ask = async (pl, what) => {
    if (what === 'on') {
      setPlaceActive(pl.id, true); reload();
      toast(`${pl.name} is active again. It shows in the place lists that read the live list.`);
      return;
    }
    const items = placeBlockers(pl, d);
    if (items.length) { setBlocked({ pl, what, items }); return; }
    const del = what === 'delete';
    const ok = await confirmDialog({
      title: del ? `Remove ${pl.name}?` : `Deactivate ${pl.name}?`,
      body: del ? 'It has no stock, holds, transfers or counters. It is removed from your places.' : 'It has no stock, holds, transfers or counters. It stops showing in place lists; you can activate it again later.',
      confirmLabel: del ? 'Remove' : 'Deactivate', tone: 'danger',
    });
    if (!ok) return;
    if (del) deletePlace(pl.id); else setPlaceActive(pl.id, false);
    reload();
    toast(del ? `${pl.name} removed` : `${pl.name} deactivated`);
  };
  const dialog = (
    <Dialog open={!!blocked} title={blocked ? `${blocked.pl.name} can't be ${blocked.what === 'delete' ? 'removed' : 'deactivated'} yet` : ''} onClose={() => setBlocked(null)} width={520}>
      {blocked ? (
        <div className="pl-block">
          <p className="pl-block__sum">{blocked.items.map((x) => x.text).join(' · ')}</p>
          <div>
            {blocked.items.map((x) => (
              <div key={x.text} className="pl-block__row"><span>{x.text}</span>{x.href ? <Link className="gc-btn gc-btn--sm gc-btn--soft" href={x.href}>{x.fix} <Icon name="arrow-right" width="14" height="14" aria-hidden="true" /></Link> : null}</div>
            ))}
          </div>
          <p className="gc-help" style={{ margin: 0 }}>Stock, holds and counters stay at their place until they are moved, so a place must be empty before it goes.</p>
          <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setBlocked(null)}>Close</button></div>
        </div>
      ) : null}
    </Dialog>
  );
  return { ask, dialog };
}

// ---- add / edit a place ----------------------------------------------------------------------------
const blank = (type) => ({ id: '', name: '', type, code: '', address: '', area: '', phone: '', manager: '', hours: type === 'Branch' ? 'Sat–Thu 10:00 AM – 9:00 PM' : '', opening: '', counter: type === 'Branch', receives: true, neg: false });
/** Hook: returns { open(pl | null, type), dialog }. */
export function usePlaceForm(d, reload) {
  const [form, setForm] = useState(null);
  const [errs, setErrs] = useState({});
  const open = (pl, type) => {
    setErrs({});
    setForm(pl ? { ...blank(pl.type), ...pl, neg: allowNegative(pl.name), was: pl.name } : blank(type));
  };
  const close = useCallback(() => setForm(null), []);
  const pl = form && form.id ? d.places.find((p) => p.id === form.id) : null;
  const negative = useMemo(() => (pl ? stockOf(pl, d).negative : []), [pl, d]);
  const put = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrs((e) => { const n = { ...e }; delete n[k]; return n; }); };
  const toggleNeg = async () => {
    if (form.neg) { put('neg', false); return; }
    const ok = await confirmDialog({ title: `Allow negative stock at ${form.name || 'this place'}?`, body: 'Sales can take stock below zero, counts will go wrong and you may sell goods you do not have. Only turn this on while stock is being received late.', confirmLabel: 'Allow negative stock', tone: 'danger' });
    if (ok) put('neg', true);
  };
  const submit = async (e) => {
    e.preventDefault();
    const found = checkPlace({ ...form, name: form.name.trim() }, d.places);
    if (Object.keys(found).length) {
      setErrs(found);
      const first = ['name', 'type', 'code', 'phone'].find((k) => found[k]);
      setTimeout(() => { const el = document.getElementById('pl-' + first); if (el) el.focus(); }, 0);
      return;
    }
    const wasNeg = pl ? allowNegative(pl.name) : false;
    if (pl && wasNeg && !form.neg && negative.length) {
      const ok = await confirmDialog({ title: `${negative.length} ${negative.length === 1 ? 'product is' : 'products are'} already below zero`, body: `${negative.map((r) => `${r.p.name} ${r.onHand}`).join(' · ')}. With negative stock off the register stops selling them until the count is corrected in Stock adjustments.`, confirmLabel: 'Turn it off anyway', tone: 'danger' });
      if (!ok) return;
    }
    const res = savePlace(form);
    if (!res.ok) { setErrs(res.errors); return; }
    setAllowNegative(res.place.name, !!form.neg);
    setForm(null);
    reload();
    const renamed = pl && pl.name !== res.place.name;
    toast(!pl ? `${res.place.name} added` : renamed ? `${pl.name} is now ${res.place.name}. Its stock, holds and transfers moved with it.` : `${res.place.name} saved`);
  };
  const isBranch = form && form.type === 'Branch';
  const fixed = pl && pl.fixed;
  const inv = (k) => (errs[k] ? { 'aria-invalid': 'true', 'aria-describedby': 'pl-' + k + '-err' } : {});
  const err = (k) => (errs[k] ? <span id={'pl-' + k + '-err'} className="gc-help gc-help--error">{errs[k]}</span> : null);
  const dialog = (
    <Dialog open={!!form} title={form ? (pl ? `Edit ${pl.name}` : `Add ${form.type === 'Branch' ? 'branch' : 'warehouse'}`) : ''} onClose={close} width={620}>
      {form ? (
        <form className="pl-form" onSubmit={submit} noValidate>
          <div className="pl-two">
            <div><label className="gc-label" htmlFor="pl-name">Name *</label><input id="pl-name" className="gc-input" data-autofocus value={form.name} disabled={fixed} onChange={(e) => put('name', e.target.value)} placeholder={isBranch ? 'Bashundhara branch' : 'Narayanganj warehouse'} aria-required="true" {...inv('name')} />{err('name')}{fixed ? <span className="gc-help">Returns and damaged stock always go to this bay, so its name stays.</span> : null}</div>
            <div><label className="gc-label" htmlFor="pl-type">Type *</label><select id="pl-type" className="gc-input gc-select" value={form.type} disabled={fixed} onChange={(e) => put('type', e.target.value)} {...inv('type')}><option>Warehouse</option><option>Branch</option></select>{err('type')}</div>
          </div>
          {pl && pl.name !== form.name.trim() && form.name.trim() ? <p className="gc-help" style={{ margin: 0 }}>Renaming keeps its stock, holds, transfers and counters: they belong to the place, not the name.</p> : null}
          <div className="pl-two">
            <div><label className="gc-label" htmlFor="pl-code">Short code</label><input id="pl-code" className="gc-input" value={form.code} onChange={(e) => put('code', e.target.value.toUpperCase())} placeholder={codeOf(form.name) || 'BA-1'} {...inv('code')} />{err('code') || <span className="gc-help">Printed on transfer slips and bin labels.</span>}</div>
            <div><label className="gc-label" htmlFor="pl-manager">Manager</label><select id="pl-manager" className="gc-input gc-select" value={form.manager} onChange={(e) => put('manager', e.target.value)}><option value="">Not set</option>{STAFF_NAMES.map((n) => <option key={n}>{n}</option>)}</select></div>
          </div>
          <div><label className="gc-label" htmlFor="pl-address">Address</label><input id="pl-address" className="gc-input" value={form.address} onChange={(e) => put('address', e.target.value)} placeholder="House, road, block" /></div>
          <div className="pl-two">
            <div><label className="gc-label" htmlFor="pl-area">Area / city</label><input id="pl-area" className="gc-input" value={form.area} onChange={(e) => put('area', e.target.value)} placeholder="Bashundhara, Dhaka" /></div>
            <div><label className="gc-label" htmlFor="pl-phone">Phone</label><input id="pl-phone" className="gc-input" inputMode="tel" value={form.phone} onChange={(e) => put('phone', e.target.value)} placeholder="01712-345678" {...inv('phone')} />{err('phone')}</div>
          </div>
          {isBranch ? (
            <div className="pl-two">
              <div><label className="gc-label" htmlFor="pl-hours">Opening hours</label><input id="pl-hours" className="gc-input" value={form.hours} onChange={(e) => put('hours', e.target.value)} placeholder="Sat–Thu 10:00 AM – 9:00 PM" /></div>
              <div><label className="gc-label" htmlFor="pl-opening">Opens on</label><input id="pl-opening" className="gc-input" value={form.opening} onChange={(e) => put('opening', e.target.value)} placeholder="Leave empty when open" /><span className="gc-help">Until it opens, its stock is not sold.</span></div>
            </div>
          ) : null}
          <div>
            {isBranch ? <div className="pl-sw"><span>Sells at a counter<small>POS counters can be registered here in POS manage.</small></span><button type="button" role="switch" aria-checked={!!form.counter} aria-label="Sells at a counter" className="gc-switch" onClick={() => put('counter', !form.counter)}><span className="gc-switch__knob" /></button></div> : null}
            <div className="pl-sw"><span>Can receive purchase deliveries<small>Suppliers can deliver here; it shows in Receive goods.</small></span><button type="button" role="switch" aria-checked={!!form.receives} aria-label="Can receive purchase deliveries" className="gc-switch" onClick={() => put('receives', !form.receives)}><span className="gc-switch__knob" /></button></div>
            <div className="pl-sw"><span>Allow negative stock<small className={form.neg ? 'is-bad' : ''}>{form.neg ? 'On: sales can take stock below zero here.' : 'Off: selling stops when stock reaches zero.'}</small></span><button type="button" role="switch" aria-checked={!!form.neg} aria-label="Allow negative stock" className="gc-switch" onClick={toggleNeg}><span className="gc-switch__knob" /></button></div>
          </div>
          {pl && !form.neg && negative.length ? (
            <div className="pl-warn" role="status">
              <b>{negative.length} {negative.length === 1 ? 'product is' : 'products are'} already below zero at {pl.name}:</b>
              <ul>{negative.slice(0, 8).map((r) => <li key={r.p.sku}>{r.p.name} · <span className="pl-id">{r.p.sku}</span> · {r.onHand}</li>)}</ul>
              {negative.length > 8 ? <span>and {negative.length - 8} more</span> : null}
              <span>The register will not sell them until the count is corrected. <Link href="/stock-adjustments">Stock adjustments</Link></span>
            </div>
          ) : null}
          <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={close}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid">{pl ? 'Save changes' : `Add ${isBranch ? 'branch' : 'warehouse'}`}</button></div>
        </form>
      ) : null}
    </Dialog>
  );
  return { open, dialog };
}

// ---- stock at a place ------------------------------------------------------------------------------
export function PlaceStockDialog({ pl, d, onClose }) {
  const [q, setQ] = useState('');
  const st = useMemo(() => (pl ? stockOf(pl, d) : null), [pl, d]);
  if (!pl || !st) return <Dialog open={false} title="" onClose={onClose} />;
  const needle = q.trim().toLowerCase();
  const rows = st.rows.filter((r) => !needle || [r.p.name, r.p.sku, r.p.barcode, r.p.variant].some((x) => String(x || '').toLowerCase().includes(needle)));
  const bins = placeBinStats(pl.id, d.racks);
  return (
    <Dialog open title={`Stock at ${pl.name}`} onClose={onClose} width={900}>
      <div className="pl-dlg">
        <dl className="pl-mini">
          <div><dt>Products</dt><dd>{st.products}</dd></div>
          <div><dt>On hand</dt><dd>{st.onHand} pcs</dd></div>
          <div><dt>Stock value</dt><dd>{formatBDT(st.value)}</dd></div>
          <div><dt>Held</dt><dd>{st.held}</dd></div>
          <div><dt>On the way</dt><dd>↓{st.transitIn} · ↑{st.transitOut}</dd></div>
          <div><dt>In bins</dt><dd>{bins.bins ? `${bins.pieces} pcs` : 'No racks'}</dd></div>
        </dl>
        <div className="pl-search">
          <input className="gc-input" type="search" placeholder="Search product, SKU or barcode" aria-label={`Search stock at ${pl.name}`} value={q} onChange={(e) => setQ(e.target.value)} data-autofocus />
          <Link className="gc-btn gc-btn--neutral" href={`/racks?place=${pl.id}`}><Icon name="layout-grid" width="16" height="16" aria-hidden="true" /> Racks & bins</Link>
        </div>
        {rows.length === 0 ? <EmptyState icon="package-search" title={needle ? 'No product matches' : 'No stock here yet'} body={needle ? 'Try the SKU or barcode.' : 'Stock arrives with a transfer or a supplier delivery.'} /> : (
          <div className="gc-table-wrap">
            <table className="gc-table gc-table--compact">
              <thead><tr><th scope="col">Product</th><th scope="col" className="pl-num">On hand</th><th scope="col" className="pl-num">Held</th><th scope="col" className="pl-num">Free</th><th scope="col" className="pl-num">Coming</th><th scope="col">Bins</th><th scope="col" className="pl-num">Value</th></tr></thead>
              <tbody>
                {rows.map((r) => {
                  const b = binsFor(pl.id, r.p.sku, d.racks);
                  return (
                    <tr key={r.p.sku}>
                      <td><span className="pl-strong">{r.p.name}</span><span className="pl-sub pl-id">{r.p.sku}</span></td>
                      <td className={'pl-num' + (r.onHand < 0 ? ' pl-neg' : '')}>{r.onHand}</td>
                      <td className="pl-num">{r.held || '—'}</td>
                      <td className="pl-num">{r.available}{r.low ? <span className="pl-sub">low</span> : null}</td>
                      <td className="pl-num">{r.transit || '—'}</td>
                      <td>{b.length ? <span className="pl-id">{b.map((x) => `${x.code} (${x.qty})`).join(', ')}</span> : <span className="pl-sub">Not in a bin</span>}</td>
                      <td className="pl-num">{formatBDT(r.value)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {st.transfersIn.length || st.transfersOut.length ? (
          <p className="gc-help" style={{ margin: 0 }}>
            On the way: {[...st.transfersIn.map((t) => `${t.no} from ${t.from}`), ...st.transfersOut.map((t) => `${t.no} to ${t.to}`)].join(' · ')}. <Link href="/transfers">Transfers</Link>
          </p>
        ) : null}
        <p className="gc-help" style={{ margin: 0 }}>Value is on-hand pieces × cost (wholesale price where cost is not set).</p>
      </div>
    </Dialog>
  );
}
