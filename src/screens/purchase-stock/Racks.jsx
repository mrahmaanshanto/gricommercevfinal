'use client';
// Racks & bins — where stock sits inside a warehouse or branch: rack → shelf → bin (code A-2-05 is
// rack A, shelf 2, bin 5). Per place: add, edit and remove racks, set how many pieces a bin holds, put
// products into bins, move them between bins and take them out. Find a product's bin by name, SKU or
// barcode. "Not in a bin yet" is on hand (stock list) minus what is in bins, so staff know what to put away.
// Rules (src/lib/racks.js): bins for a product can't hold more than its on hand at the place, a bin
// can't go over its capacity, a rack with stock can't be removed (the dialog names the bins).
// Places come from src/lib/locations.js, on hand from src/lib/stock.js.
// Laid out like a Shopify page (components/ui/IndexKit.jsx): the place picker leads the key figures, then the bin
// finder, one card per rack (the bin map; Edit opens the rack, where it can also be removed) and the put-away list.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Dialog, EmptyState, StatusBadge } from '@/components/ui';
import { ShopHeader, MetricStrip, SearchField, LearnMore } from '@/components/ui/IndexKit';
import { productBy, placeStock, stockAt } from '@/lib/stock';
import { racksAt, binsOf, binCode, slotsIn, binUsed, binnedAt, placeBinStats, findInBins, saveRack, removeRack, binsWithStock, putAway, takeOut, moveBetweenBins } from '@/lib/racks';
import { ProductPicker, PICKER_CSS } from '@/components/ProductPicker';
import { usePlaceData, PLACE_CSS } from './placeShared';

const CSS = PICKER_CSS + PLACE_CSS + `
.rk-hits{display:flex;flex-direction:column}
.rk-hit{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);padding:var(--space-2) var(--space-4);border-bottom:1px solid var(--border-subtle);font-size:var(--text-sm)}
.rk-hit:last-child{border-bottom:0}
.rk-hit__p{flex:1 1 220px;min-width:0}
.rk-chips{display:flex;flex-wrap:wrap;gap:var(--space-1)}
.rk-chip{display:inline-flex;align-items:center;gap:var(--space-1);height:28px;padding:0 var(--space-3);border-radius:var(--radius-full);border:1px solid var(--border-subtle);background:var(--surface-card);font:inherit;font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-heading);cursor:pointer}
.rk-chip:hover{border-color:var(--primary);color:var(--primary)}
.rk-head{align-items:flex-start}
.rk-map{overflow-x:auto;padding-bottom:var(--space-1)}
.rk-shelf{display:grid;grid-template-columns:56px repeat(var(--bins),minmax(52px,1fr));gap:var(--space-1);align-items:stretch;margin-bottom:var(--space-1)}
.rk-shelf__label{display:flex;align-items:center;font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.rk-bin{position:relative;display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;gap:2px;min-height:44px;padding:var(--space-1) var(--space-2) var(--space-2);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;text-align:left;cursor:pointer;overflow:hidden}
.rk-bin:hover{border-color:var(--primary)}
.rk-bin:focus-visible{outline:2px solid var(--primary);outline-offset:1px}
.rk-bin__code{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.rk-bin__qty{font-family:var(--font-data);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.rk-bin__fill{position:absolute;left:0;bottom:0;height:4px;background:var(--primary)}
.rk-bin.is-full .rk-bin__fill{background:var(--warning)}
.rk-bin.is-hit{border-color:var(--warning);box-shadow:inset 0 0 0 1px var(--warning);background:var(--fill-warning-soft)}
.rk-legend{display:flex;flex-wrap:wrap;gap:var(--space-4);font-size:var(--text-xs);color:var(--text-muted)}
.rk-legend span{display:inline-flex;align-items:center;gap:var(--space-2)}
.rk-legend i{display:inline-block;width:18px;height:4px;border-radius:var(--radius-full);background:var(--primary)}
.rk-legend i.is-full{background:var(--warning)}
.rk-legend i.is-hit{height:12px;width:12px;background:var(--fill-warning-soft);border:1px solid var(--warning)}
.rk-over{color:var(--text-danger);font-weight:var(--weight-medium)}
.rk-act{text-align:right}
.rk-pitem{cursor:default}
.rk-pitem__ctl{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2)}
.rk-lines{display:flex;flex-direction:column}
.rk-line{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-2);padding:var(--space-3) 0;border-bottom:1px solid var(--border-subtle)}
.rk-line__acts{display:flex;gap:var(--space-2)}
.rk-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3)}
.rk-foot{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:var(--space-2)}
.rk-foot .is-end{margin-right:auto}
@media (max-width:599px){.rk-three{grid-template-columns:1fr 1fr}}
/* phones: the shelf name sits above its bins so a whole shelf fits the width; bin codes never break */
@media (max-width:640px){
  .rk-shelf{grid-template-columns:repeat(auto-fill,minmax(72px,1fr));row-gap:var(--space-1);margin-bottom:var(--space-2)}
  .rk-shelf__label{grid-column:1/-1}
  .rk-bin{padding:var(--space-1) 5px var(--space-2)}
  .rk-bin__code{white-space:nowrap}
}
`;

const key = (r, s, b) => `${r}|${s}|${b}`;
const unkey = (k) => { const [rack, shelf, bin] = String(k || '').split('|'); return { rack, shelf: Number(shelf), bin: Number(bin) }; };
const whole = (v) => Math.floor(Number(v) || 0);

export default function Racks() {
  const [d, reload] = usePlaceData();
  const [placeId, setPlaceId] = useState('cw');
  const [q, setQ] = useState('');
  const [rackForm, setRackForm] = useState(null);   // { id?, code, name, shelves, bins, capacity }
  const [rackErr, setRackErr] = useState(null);     // { field, error }
  const [bin, setBin] = useState(null);             // open bin: key
  const [put, setPut] = useState(null);             // { sku, bin (key), qty, fixed }
  const [move, setMove] = useState(null);           // { slot, to (key), qty }
  const [out, setOut] = useState(null);             // { slot, qty }
  const [err, setErr] = useState(null);             // { field, error } for put / move / out
  const [full, setFull] = useState(null);           // { rack, bins } a rack that still has stock

  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    if (u.get('place')) setPlaceId(u.get('place'));
    if (u.get('q')) setQ(u.get('q'));
  }, []);

  const places = d.places.filter((p) => p.active !== false || p.id === placeId);
  const place = d.places.find((p) => p.id === placeId) || places[0];
  const pid = place.id;
  const racks = racksAt(pid, d.racks);
  const stats = placeBinStats(pid, d.racks);
  const onHand = (sku) => stockAt(sku, place.name, d.holds, d.moves, d.transfers).onHand;

  // products at this place: on hand vs in bins
  const rows = useMemo(() => {
    const st = placeStock(place.name, { holds: d.holds, moves: d.moves, transfers: d.transfers, catalog: d.catalog });
    const skus = new Set(st.rows.map((r) => r.p.sku));
    d.racks.slots.filter((x) => x.place === pid).forEach((x) => skus.add(x.sku));
    return [...skus].map((sku) => {
      const p = productBy(sku, d.catalog);
      if (!p) return null;
      const have = onHand(sku), binned = binnedAt(pid, sku, d.racks);
      return { p, onHand: have, binned, loose: Math.max(0, have - binned), over: Math.max(0, binned - Math.max(0, have)) };
    }).filter(Boolean);
  }, [d, pid]);   // eslint-disable-line react-hooks/exhaustive-deps
  const loose = rows.filter((r) => r.loose > 0 || r.over > 0).sort((a, b) => b.over - a.over || b.loose - a.loose);
  const looseTotal = rows.reduce((a, r) => a + r.loose, 0);

  // find a product's bin
  const hits = useMemo(() => (d.ready && q.trim() ? findInBins(q, d.racks).slice(0, 12) : []), [q, d]);
  const hitBins = new Set(hits.filter((h) => h.place === pid).flatMap((h) => h.bins.map((b) => key(b.slot.rack, b.slot.shelf, b.slot.bin))));

  // every bin at this place, for pickers
  const binOptions = racks.flatMap((r) => binsOf(r).map((b) => ({ k: key(r.id, b.shelf, b.bin), code: b.code, room: r.capacity - binUsed(r.id, b.shelf, b.bin, d.racks), cap: r.capacity }))).sort((a, b) => a.code.localeCompare(b.code, 'en', { numeric: true }));
  const rackOf = (id) => d.racks.racks.find((r) => r.id === id);
  const codeOfKey = (k) => { const x = unkey(k); const r = rackOf(x.rack); return r ? binCode(r, x.shelf, x.bin) : ''; };

  const pickPlace = (id) => { setPlaceId(id); setBin(null); };
  const openBinAt = (placeKey, k) => { setPlaceId(placeKey); setBin(k); };

  // ---- racks
  const newRack = () => {
    const used = racks.map((r) => r.code);
    const next = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').find((c) => !used.includes(c)) || '';
    setRackErr(null);
    setRackForm({ code: next, name: '', shelves: '4', bins: '6', capacity: '40' });
  };
  const saveRackForm = (e) => {
    e.preventDefault();
    const res = saveRack({ ...rackForm, place: pid });
    if (!res.ok) { setRackErr(res); setTimeout(() => { const el = document.getElementById('rk-' + (res.field || 'code')); if (el) el.focus(); }, 0); return; }
    setRackForm(null); reload();
    toast(rackForm.id ? `Rack ${res.rack.code} saved` : `Rack ${res.rack.code} added · ${res.rack.shelves * res.rack.bins} bins at ${place.name}`);
  };
  const askRemove = async (r) => {
    const stocked = binsWithStock(r, d.racks);
    if (stocked.length) { setFull({ rack: r, bins: stocked }); return; }
    if (!(await confirmDialog({ title: `Remove rack ${r.code}?`, body: `Its ${r.shelves * r.bins} bins are empty. They are removed from ${place.name}.`, confirmLabel: 'Remove rack', tone: 'danger' }))) return;
    const res = removeRack(r.id);
    if (!res.ok) { toast(res.error, { tone: 'error' }); return; }
    reload(); toast(`Rack ${r.code} removed`);
  };

  // ---- put away / move / take out
  const startPut = (sku, k, fixed) => {
    setErr(null);
    const first = k || (binOptions.find((b) => b.room > 0) || binOptions[0] || {}).k || '';
    const loosePcs = sku ? Math.max(0, onHand(sku) - binnedAt(pid, sku, d.racks)) : 0;
    const room = first ? (binOptions.find((b) => b.k === first) || {}).room || 0 : 0;
    setPut({ sku: sku || '', bin: first, qty: sku ? String(Math.max(1, Math.min(loosePcs, room)) || '') : '', fixed: !!fixed });
  };
  const savePut = (e) => {
    e.preventDefault();
    const at = unkey(put.bin);
    const res = putAway({ rack: at.rack, shelf: at.shelf, bin: at.bin, sku: put.sku, qty: put.qty });
    if (!res.ok) { setErr(res); return; }
    setPut(null); reload();
    toast(`${res.qty} × ${res.product.name} put into ${res.code}`);
  };
  const saveMove = (e) => {
    e.preventDefault();
    const at = unkey(move.to);
    const res = moveBetweenBins({ slot: move.slot.id, rack: at.rack, shelf: at.shelf, bin: at.bin, qty: move.qty });
    if (!res.ok) { setErr(res); return; }
    const p = productBy(move.slot.sku, d.catalog);
    setMove(null); reload();
    toast(`${whole(move.qty)} × ${p ? p.name : move.slot.sku} moved to ${res.code}`);
  };
  const saveOut = (e) => {
    e.preventDefault();
    const res = takeOut(out.slot.id, out.qty);
    if (!res.ok) { setErr(res); return; }
    const p = productBy(out.slot.sku, d.catalog);
    setOut(null); reload();
    toast(`${whole(out.qty)} × ${p ? p.name : out.slot.sku} taken out of ${codeOfKey(key(out.slot.rack, out.slot.shelf, out.slot.bin))}`);
  };

  const openBin = bin ? unkey(bin) : null;
  const openRack = openBin ? rackOf(openBin.rack) : null;
  const inBin = openRack ? slotsIn(openRack.id, openBin.shelf, openBin.bin, d.racks) : [];
  const binQty = inBin.reduce((a, x) => a + x.qty, 0);
  const looseOf = (sku) => Math.max(0, onHand(sku) - binnedAt(pid, sku, d.racks));
  const fieldErr = (f) => (err && (err.field === f || (!err.field && f === 'qty')) ? <span id={'rk-err-' + f} className="gc-help gc-help--error">{err.error}</span> : null);

  return (
    <div className="dc-screen ds" data-screen="Racks">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="stock-racks" />
        <main className="gc-shell__main">
          <Topbar crumb="Products & stock" page="Racks & bins" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="layout-grid" title="Racks & bins"
                about="Where stock sits inside each warehouse and branch. Bin A-2-05 is rack A, shelf 2, bin 5."
                secondary={[{ label: 'Put away', onClick: () => startPut('', '', false), disabled: !binOptions.length }]}
                more={[{ label: 'Stock list', href: '/stock' }, { label: 'Warehouses', href: '/warehouses' }, { label: 'Branches', href: '/branches' }]}
                primary={{ label: 'Add rack', onClick: newRack }} />

              <MetricStrip label={`Racks at ${place.name}`}
                lead={<select className="ix-pick" aria-label="Warehouse or branch" value={pid} onChange={(e) => pickPlace(e.target.value)}>{places.map((p) => <option key={p.id} value={p.id}>{p.name}{p.active === false ? ' (inactive)' : ''}</option>)}</select>}
                items={[
                  { label: 'Racks', value: String(stats.racks), sub: `${stats.bins} bins` },
                  { label: 'Bins used', value: stats.bins ? Math.round((stats.used / stats.bins) * 100) + '%' : '—', sub: `${stats.used} of ${stats.bins}` },
                  { label: 'Pieces in bins', value: String(stats.pieces), sub: `room for ${Math.max(0, stats.capacity - stats.pieces)}` },
                  { label: 'Not in a bin yet', value: String(looseTotal), sub: 'pcs to put away' },
                ]} />

              <section className="ix-card" aria-label="Find a product's bin">
                <div className="ix-bar">
                  <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a product's bin" onDone={() => setQ('')} />
                  {q.trim() ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setQ('')}>Clear</button> : null}
                </div>
                {q.trim() ? (
                  <div className="rk-hits" role="status" aria-live="polite">
                    {hits.length === 0 ? <div className="rk-hit"><span className="pl-sub">No product matches “{q.trim()}”.</span></div> : hits.map((h) => (
                      <div key={h.p.sku + h.place} className="rk-hit">
                        <div className="rk-hit__p"><span className="pl-strong">{h.p.name}</span><span className="pl-sub pl-id">{h.p.sku}{h.p.barcode ? ` · ${h.p.barcode}` : ''}</span></div>
                        {h.bins.length ? (<>
                          <span className="pl-sub">{h.placeName} · {h.binned} pcs</span>
                          <div className="rk-chips">{h.bins.map((b) => <button key={b.code} type="button" className="rk-chip" onClick={() => openBinAt(h.place, key(b.slot.rack, b.slot.shelf, b.slot.bin))} aria-label={`Open bin ${b.code} at ${h.placeName}, ${b.qty} pieces`}><Icon name="map-pin" width="12" height="12" aria-hidden="true" />{b.code} · {b.qty}</button>)}</div>
                        </>) : <StatusBadge tone="neutral">Not in any bin</StatusBadge>}
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>

              {racks.length === 0 ? (
                <section className="ix-card"><div className="ix-empty"><EmptyState icon="layout-grid" title={`No racks at ${place.name} yet`} body="Add a rack with its shelves and bins, then put stock away into the bins." actionLabel="Add rack" onAction={newRack} /></div></section>
              ) : (<>
                <div className="rk-legend" aria-hidden="true"><span><i /> Filled part of the bin</span><span><i className="is-full" /> 90% full or more</span>{hitBins.size ? <span><i className="is-hit" /> Has the product you searched</span> : null}</div>
                {racks.map((r) => {
                  const bs = binsOf(r);
                  const usedBins = new Set(d.racks.slots.filter((x) => x.rack === r.id && x.qty > 0).map((x) => x.shelf + '-' + x.bin)).size;
                  const shelves = [];
                  for (let s = r.shelves; s >= 1; s--) shelves.push(s);
                  return (
                    <section key={r.id} className="ix-card" aria-label={`Rack ${r.code}`}>
                      <div className="ix-card__head rk-head">
                        <div><h2>Rack {r.code}{r.name ? ` · ${r.name}` : ''}</h2><p className="ix-card__sub">{r.shelves} shelves × {r.bins} bins · {r.capacity} pcs per bin · {usedBins} of {bs.length} bins used</p></div>
                        <button type="button" className="ix-btn ix-btn--sm" onClick={() => { setRackErr(null); setRackForm({ id: r.id, code: r.code, name: r.name, shelves: String(r.shelves), bins: String(r.bins), capacity: String(r.capacity) }); }} aria-label={`Edit rack ${r.code}`}>Edit</button>
                      </div>
                      <div className="ix-card__body rk-map">
                        {shelves.map((s) => (
                          <div key={s} className="rk-shelf" style={{ '--bins': r.bins }}>
                            <span className="rk-shelf__label">Shelf {s}</span>
                            {Array.from({ length: r.bins }, (_, i) => i + 1).map((b) => {
                              const used = binUsed(r.id, s, b, d.racks);
                              const pct = Math.min(100, Math.round((used / r.capacity) * 100));
                              const k = key(r.id, s, b), code = binCode(r, s, b), hit = hitBins.has(k);
                              return (
                                <button key={b} type="button" className={'rk-bin' + (pct >= 90 ? ' is-full' : '') + (hit ? ' is-hit' : '')} onClick={() => setBin(k)} aria-label={`Bin ${code}, ${used ? `${used} of ${r.capacity} pieces` : 'empty'}${hit ? ', has the product you searched' : ''}`}>
                                  <span className="rk-bin__code">{code}</span>
                                  <span className="rk-bin__qty">{used || '—'}</span>
                                  {used ? <span className="rk-bin__fill" style={{ width: pct + '%' }} /> : null}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </>)}

              <section className="ix-card" aria-labelledby="rk-loose-h">
                <div className="ix-card__head"><h2 id="rk-loose-h">Not in a bin yet · {place.name}</h2><Link href="/stock">Stock list</Link></div>
                {loose.length === 0 ? <div className="ix-empty"><EmptyState icon="package-check" title="Everything is in a bin" body={racks.length ? 'Every piece on hand here has a bin.' : 'Add racks first, then put stock away.'} /></div> : (<>
                  <ul className="ix-plist" aria-label="Not in a bin yet">
                    {loose.map((r) => (
                      <li key={r.p.sku}>
                        <div className="ix-pitem rk-pitem">
                          <span className="ix-pitem__top"><b>{r.p.name}</b><span>{r.over ? null : `${r.loose} pcs`}</span></span>
                          <span className="ix-pitem__mid">{r.p.sku} · {`${r.onHand} on hand · ${r.binned} in bins`}</span>
                          <span className="rk-pitem__ctl">
                            {r.over ? <span className="rk-over">Bins list {r.over} more than on hand</span> : <span />}
                            {r.over ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => setQ(r.p.sku)}>Show bins</button> : <button type="button" className="ix-btn ix-btn--sm" disabled={!binOptions.length} onClick={() => startPut(r.p.sku, '', false)}>Put away</button>}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="ix-table-wrap">
                    <table className="ix-table ix-table--static gc-table--keep">
                      <caption className="sr-only">Not in a bin yet at {place.name}</caption>
                      <thead><tr><th scope="col">Product</th><th scope="col">SKU</th><th scope="col" className="ix-num">On hand</th><th scope="col" className="ix-num">In bins</th><th scope="col" className="ix-num">Not in a bin</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                      <tbody>
                        {loose.map((r) => (
                          <tr key={r.p.sku}>
                            <td className="ix-strong">{r.p.name}</td>
                            <td className="ix-muted pl-id">{r.p.sku}</td>
                            <td className={'ix-num' + (r.onHand < 0 ? ' pl-neg' : '')}>{r.onHand}</td>
                            <td className="ix-num">{r.binned}</td>
                            <td className="ix-num">{r.over ? <span className="rk-over">Bins list {r.over} more than on hand</span> : <b>{r.loose}</b>}</td>
                            <td className="rk-act">{r.over ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => setQ(r.p.sku)}>Show bins</button> : <button type="button" className="ix-btn ix-btn--sm" disabled={!binOptions.length} onClick={() => startPut(r.p.sku, '', false)}>Put away</button>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>)}
              </section>
              <LearnMore topic="racks and bins" />
            </div>
          </div>
        </main>
      </div>

      {/* add / edit a rack */}
      <Dialog open={!!rackForm} title={rackForm && rackForm.id ? `Edit rack ${rackForm.code}` : `Add a rack · ${place.name}`} onClose={() => setRackForm(null)} width={560}>
        {rackForm ? (() => {
          const sh = whole(rackForm.shelves), bn = whole(rackForm.bins), code = String(rackForm.code || '').toUpperCase() || '?';
          const set = (k) => (e) => { setRackForm({ ...rackForm, [k]: e.target.value }); setRackErr(null); };
          const inv = (f) => (rackErr && rackErr.field === f ? { 'aria-invalid': 'true', 'aria-describedby': 'rk-rack-err' } : {});
          return (
            <form className="pl-form" onSubmit={saveRackForm} noValidate>
              <div className="pl-two">
                <div><label className="gc-label" htmlFor="rk-code">Rack code *</label><input id="rk-code" className="gc-input" data-autofocus maxLength={3} value={rackForm.code} onChange={(e) => { setRackForm({ ...rackForm, code: e.target.value.toUpperCase() }); setRackErr(null); }} aria-required="true" {...inv('code')} /><span className="gc-help">Starts every bin code, for example A.</span></div>
                <div><label className="gc-label" htmlFor="rk-name">Zone or use</label><input id="rk-name" className="gc-input" value={rackForm.name} onChange={set('name')} placeholder="Fast movers, cold room …" /></div>
              </div>
              <div className="rk-three">
                <div><label className="gc-label" htmlFor="rk-shelves">Shelves *</label><input id="rk-shelves" className="gc-input" type="number" min="1" max="12" inputMode="numeric" value={rackForm.shelves} onChange={set('shelves')} {...inv('shelves')} /></div>
                <div><label className="gc-label" htmlFor="rk-bins">Bins per shelf *</label><input id="rk-bins" className="gc-input" type="number" min="1" max="30" inputMode="numeric" value={rackForm.bins} onChange={set('bins')} {...inv('bins')} /></div>
                <div><label className="gc-label" htmlFor="rk-capacity">Each bin holds *</label><input id="rk-capacity" className="gc-input" type="number" min="1" inputMode="numeric" value={rackForm.capacity} onChange={set('capacity')} {...inv('capacity')} /><span className="gc-help">pieces</span></div>
              </div>
              {rackErr ? <p id="rk-rack-err" className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{rackErr.error}</p> : sh > 0 && bn > 0 ? <p className="gc-help" style={{ margin: 0 }}>{sh * bn} bins: {code}-1-01 to {code}-{sh}-{String(bn).padStart(2, '0')}.</p> : null}
              <div className="gc-modal__foot rk-foot" style={{ marginTop: 0 }}>
                {rackForm.id && rackOf(rackForm.id) ? <button type="button" className="gc-btn gc-btn--flat is-end" onClick={() => { const r = rackOf(rackForm.id); setRackForm(null); askRemove(r); }}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /> Remove rack</button> : null}
                <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setRackForm(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid">{rackForm.id ? 'Save rack' : 'Add rack'}</button>
              </div>
            </form>
          );
        })() : null}
      </Dialog>

      {/* a rack that still holds stock */}
      <Dialog open={!!full} title={full ? `Rack ${full.rack.code} still holds stock` : ''} onClose={() => setFull(null)} width={480}>
        {full ? (
          <div className="pl-block">
            <p className="pl-block__sum">Empty {full.bins.length === 1 ? 'this bin' : `these ${full.bins.length} bins`} before the rack can be removed.</p>
            <div className="rk-chips">{full.bins.map((b) => <button key={b.code} type="button" className="rk-chip" onClick={() => { const [, s, n] = b.code.split('-'); setFull(null); setBin(key(full.rack.id, Number(s), Number(n))); }}>{b.code} · {b.qty} pcs</button>)}</div>
            <p className="gc-help" style={{ margin: 0 }}>Open a bin to move its stock to another rack or take it out.</p>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setFull(null)}>Close</button></div>
          </div>
        ) : null}
      </Dialog>

      {/* one bin */}
      <Dialog open={!!openRack && !put && !move && !out} title={openRack ? `Bin ${binCode(openRack, openBin.shelf, openBin.bin)}` : ''} onClose={() => setBin(null)} width={560}>
        {openRack ? (
          <div className="pl-dlg">
            <p className="pl-sub" style={{ margin: 0 }}>{place.name} · rack {openRack.code}{openRack.name ? ` (${openRack.name})` : ''} · shelf {openBin.shelf} · bin {openBin.bin}</p>
            <div className="pl-cap">
              <div className="pl-cap__row"><span>Holds {openRack.capacity} pieces</span><b>{binQty} in · room for {Math.max(0, openRack.capacity - binQty)}</b></div>
              <div className="gc-progress" role="progressbar" aria-label="Bin filled" aria-valuenow={Math.round((binQty / openRack.capacity) * 100)} aria-valuemin={0} aria-valuemax={100}><div className="gc-progress__fill" style={{ width: Math.min(100, Math.round((binQty / openRack.capacity) * 100)) + '%' }} /></div>
            </div>
            {inBin.length === 0 ? <EmptyState icon="package-open" title="Empty bin" body="Ready for put-away." /> : (
              <div className="rk-lines">
                {inBin.map((x) => { const p = productBy(x.sku, d.catalog); return (
                  <div key={x.id} className="rk-line">
                    <div><span className="pl-strong">{p ? p.name : x.sku}</span><span className="pl-sub pl-id">{x.sku} · {x.qty} pcs</span></div>
                    <div className="rk-line__acts">
                      <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => { setErr(null); setMove({ slot: x, to: (binOptions.find((b) => b.k !== bin && b.room > 0) || {}).k || '', qty: String(x.qty) }); }} disabled={binOptions.length < 2}>Move</button>
                      <button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={() => { setErr(null); setOut({ slot: x, qty: String(x.qty) }); }}>Take out</button>
                    </div>
                  </div>
                ); })}
              </div>
            )}
            <div className="gc-modal__foot" style={{ marginTop: 0 }}>
              <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setBin(null)}>Close</button>
              <button type="button" className="gc-btn gc-btn--solid" disabled={binQty >= openRack.capacity} onClick={() => startPut('', bin, true)}><Icon name="package-plus" width="16" height="16" aria-hidden="true" /> Put away here</button>
            </div>
          </div>
        ) : null}
      </Dialog>

      {/* put a product into a bin */}
      <Dialog open={!!put} title={put && put.fixed ? `Put away into ${codeOfKey(put.bin)}` : `Put away · ${place.name}`} onClose={() => setPut(null)} width={520}>
        {put ? (
          <form className="pl-form" onSubmit={savePut} noValidate>
            <div><label className="gc-label" htmlFor="rk-product">Product *</label><ProductPicker id="rk-product" value={put.sku} onChange={(sku) => { setPut((f) => ({ ...f, sku })); setErr(null); }} hint={(p) => { const n = looseOf(p.sku); return { text: `${n} not in a bin here`, none: n <= 0 }; }} invalid={!!(err && err.field === 'sku')} /></div>
            {put.sku ? <p className="gc-help" style={{ margin: 0 }}>{onHand(put.sku)} on hand at {place.name} · {binnedAt(pid, put.sku, d.racks)} in bins · <b>{looseOf(put.sku)} not in a bin</b></p> : null}
            <div className="pl-two">
              <div><label className="gc-label" htmlFor="rk-bin">Bin *</label><select id="rk-bin" className="gc-input gc-select" value={put.bin} disabled={put.fixed} onChange={(e) => { setPut({ ...put, bin: e.target.value }); setErr(null); }}>{binOptions.map((b) => <option key={b.k} value={b.k}>{b.code} · room {Math.max(0, b.room)} of {b.cap}</option>)}</select></div>
              <div><label className="gc-label" htmlFor="rk-qty">Pieces *</label><input id="rk-qty" className="gc-input" type="number" min="1" inputMode="numeric" value={put.qty} onChange={(e) => { setPut({ ...put, qty: e.target.value }); setErr(null); }} {...(err ? { 'aria-invalid': 'true', 'aria-describedby': 'rk-err-qty' } : {})} />{fieldErr('qty')}</div>
            </div>
            {err && err.field === 'sku' ? fieldErr('sku') : null}
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setPut(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid" disabled={!put.sku || !whole(put.qty)}>Put away</button></div>
          </form>
        ) : null}
      </Dialog>

      {/* move between bins */}
      <Dialog open={!!move} title={move ? `Move from ${codeOfKey(key(move.slot.rack, move.slot.shelf, move.slot.bin))}` : ''} onClose={() => setMove(null)} width={480}>
        {move ? (
          <form className="pl-form" onSubmit={saveMove} noValidate>
            <p className="pl-sub" style={{ margin: 0 }}>{(productBy(move.slot.sku, d.catalog) || {}).name || move.slot.sku} · {move.slot.qty} pcs in this bin</p>
            <div className="pl-two">
              <div><label className="gc-label" htmlFor="rk-to">To bin *</label><select id="rk-to" className="gc-input gc-select" data-autofocus value={move.to} onChange={(e) => { setMove({ ...move, to: e.target.value }); setErr(null); }}>{binOptions.filter((b) => b.k !== key(move.slot.rack, move.slot.shelf, move.slot.bin)).map((b) => <option key={b.k} value={b.k}>{b.code} · room {Math.max(0, b.room)}</option>)}</select>{err && err.field === 'to' ? fieldErr('to') : null}</div>
              <div><label className="gc-label" htmlFor="rk-mqty">Pieces *</label><input id="rk-mqty" className="gc-input" type="number" min="1" max={move.slot.qty} inputMode="numeric" value={move.qty} onChange={(e) => { setMove({ ...move, qty: e.target.value }); setErr(null); }} />{err && err.field !== 'to' ? fieldErr('qty') : null}</div>
            </div>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setMove(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid" disabled={!move.to || !whole(move.qty)}>Move</button></div>
          </form>
        ) : null}
      </Dialog>

      {/* take out of a bin */}
      <Dialog open={!!out} title={out ? `Take out of ${codeOfKey(key(out.slot.rack, out.slot.shelf, out.slot.bin))}` : ''} onClose={() => setOut(null)} width={440}>
        {out ? (
          <form className="pl-form" onSubmit={saveOut} noValidate>
            <p className="pl-sub" style={{ margin: 0 }}>{(productBy(out.slot.sku, d.catalog) || {}).name || out.slot.sku} · {out.slot.qty} pcs in this bin. Taking pieces out of a bin does not change the stock list; they count as not in a bin until they leave the place.</p>
            <div><label className="gc-label" htmlFor="rk-oqty">Pieces *</label><input id="rk-oqty" className="gc-input" data-autofocus type="number" min="1" max={out.slot.qty} inputMode="numeric" value={out.qty} onChange={(e) => { setOut({ ...out, qty: e.target.value }); setErr(null); }} />{fieldErr('qty')}</div>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setOut(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid" disabled={!whole(out.qty)}>Take out</button></div>
          </form>
        ) : null}
      </Dialog>
    </div>
  );
}
