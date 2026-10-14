'use client';
// Merchant app · Stock (/m-stock). The board's layout (design/templates/app/MStock.dc.html) with live data:
//   places     All places + each stock place (locations.getStockPlaces; hidden in a one-place shop)
//   summary    stock value at cost (stock.js › unitValue; people without cost access — kit/appScope.js › seesCost — see
//              the pieces in stock instead) and three tiles: Out of stock, Low stock (under the web Stock
//              page's reorder level), Expiring (batches.js › expiryList, 30 days)
//   tools      Transfer · Count · Adjust · Damage (/m-transfers, /m-adjust), each when the edition and role allow it
//   views      Needs action (out + low, worst first) · All items · Expiring (batches, with Write off)
//   rows       available against the reorder level, what is on the way (transfers) or on order (purchase orders), days of
//              cover from the last 30 days' sales; a tap opens the product's numbers per place (on hand, held, damaged,
//              available, in transit) with Adjust / Transfer / Reorder / Open product
// ?q=<sku or code> shows one product (Products › ⋯ › Stock by place). Read after mount; redraws on gc:stock.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AppScreen, Content, AppBar, TabBar, Chips, Segmented, Sheet, Button, IconButton, Icon, Stat, StatRow, Tile, TileGrid, EmptyState, Skeleton, Note, useAppData, useQuery, money, toast, confirmDialog, refresh } from './kit/AppKit';
import { stockAt, unitValue, isVirtualRow } from '@/lib/stock';
import { expiryList, writeOffBatch } from '@/lib/batches';
import { getPOs, DEMO_POS } from '@/lib/purchaseOrders';
import { resolveScan } from '@/lib/identifiers';
import { Thumb, ScanSheet } from './stock/Scanner';
import { rowsOf, placeList, onePlace, reorderOf, stockTone, soldPerDay, allowed, me, safe, dayText, plural } from './stock/stockData';
import { seesCost } from './kit/appScope';

const BAR = { err: '#ff5724', warn: '#ff9800', ok: '#10b981' };
const TEXT = { err: 'var(--err)', warn: 'var(--warn)', ok: 'var(--muted)' };
const SHAPE = { err: 'var(--text-danger)', warn: 'var(--text-warning)', ok: 'var(--text-success)' };
const OPEN_DEMO = ['approved', 'ordered', 'partial'];
// the board's stock-row rules (names wrap to two lines, one fixed action column so the bars line up)
const CSS = `
[data-screen="MStock"] .st-name{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:20px}
[data-screen="MStock"] .st-end{flex:none;width:40px;display:flex;justify-content:flex-end}
[data-screen="MStock"] .st-act{width:40px;height:40px;background:var(--soft);color:var(--brand)}
`;

/** Pieces still coming on placed purchase orders, by SKU. */
function onOrder() {
  const out = {};
  const add = (l) => { if (l.sku) out[l.sku] = (out[l.sku] || 0) + Math.max(0, (l.qty || 0) - (l.received || 0)); };
  safe(() => getPOs(), []).filter((p) => p.status === 'Sent' || p.status === 'Partly received').forEach((p) => p.lines.forEach(add));
  DEMO_POS.filter((p) => OPEN_DEMO.includes(p.s)).forEach((p) => p.lines.forEach(add));
  return out;
}

export default function MStockScreen() {
  const { ready, tick, ctx } = useAppData(['gc:stock', 'gc:batches']);
  const query = useQuery();
  const [place, setPlace] = useState('');
  const [view, setView] = useState('action');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState('');
  const [scan, setScan] = useState(false);
  useEffect(() => { if (query && query.get('q')) setQ(query.get('q')); if (query && query.get('view')) setView(query.get('view')); }, [query]);

  const places = useMemo(() => (ready ? placeList() : []), [ready]);
  const data = useMemo(() => {
    if (!ready) return null;
    const coming = onOrder();
    const rows = rowsOf().filter((r) => !isVirtualRow(r)).map((r) => {
      const st = safe(() => stockAt(r.sku, place), { onHand: 0, held: 0, damaged: 0, available: 0, transit: 0 });
      const re = reorderOf(r.sku);
      const stocked = !place || Object.keys(r.on || {}).some((k) => k === place && r.on[k] > 0) || st.onHand || st.transit;
      return { r, st, re, tone: stockTone(st.available, re), stocked, order: coming[r.sku] || 0, rate: soldPerDay(r.sku) };
    }).filter((x) => x.stocked);
    const exp = safe(() => expiryList({ days: 30 }), []).filter((b) => !place || b.place === place);
    const value = rows.reduce((a, x) => a + Math.max(0, x.st.onHand) * safe(() => unitValue(x.r), 0), 0);
    const pieces = rows.reduce((a, x) => a + Math.max(0, x.st.onHand), 0);
    return { rows, exp, value, pieces, out: rows.filter((x) => x.tone === 'err' && x.r.st !== 'archived'), low: rows.filter((x) => x.tone === 'warn' && x.r.st !== 'archived') };
  }, [ready, tick, place]);

  const hit = useMemo(() => (q ? safe(() => resolveScan(q), null) : null), [q]);
  const k = q.trim().toLowerCase();
  const match = (x) => !k || (hit && hit.sku === x.r.sku) || [x.r.sku, x.r.name, x.r.barcode].some((v) => String(v || '').toLowerCase().includes(k));
  const list = data ? (view === 'all' ? data.rows : [...data.out, ...data.low.slice().sort((a, b) => a.st.available / a.re - b.st.available / b.re)]).filter(match) : [];
  const can = (r) => ctx && allowed(r, ctx);
  // buying prices only for people who may see them (the stock value is at cost)
  const cost = !ctx || seesCost(ctx.user);
  const tools = [
    ['/m-transfers?new=1' + (place ? '&from=' + encodeURIComponent(place) : ''), 'Transfer', 'arrows', '/m-transfers'],
    ['/m-adjust?tab=count' + (place ? '&place=' + encodeURIComponent(place) : ''), 'Count', 'clipboard', '/m-adjust'],
    ['/m-adjust' + (place ? '?place=' + encodeURIComponent(place) : ''), 'Adjust', 'edit', '/m-adjust'],
    ['/m-adjust?reason=Damaged' + (place ? '&place=' + encodeURIComponent(place) : ''), 'Damage', 'alert', '/m-adjust'],
  ].filter((t) => can(t[3]));

  const writeOff = async (b) => {
    const ok = await confirmDialog({ title: `Write off ${b.left} ${b.name}?`, body: `${b.expired ? 'Expired' : 'Expires'} ${dayText(b.expiry)} at ${b.place}. The pieces leave the stock for good.`, confirmLabel: 'Write off', tone: 'danger' });
    if (!ok) return;
    const r = writeOffBatch(b.id, me());
    refresh();
    toast(r ? `${r.left} written off · ${b.name}` : 'Nothing left to write off');
  };

  const line = (x) => {
    const { st, re, tone, order, rate } = x;
    let text;
    if (st.available <= 0) text = 'Out of stock' + (st.transit ? ` · ${st.transit} on the way` : order ? ` · ${order} on order` : '');
    else if (tone === 'warn') text = `${st.available} left · reorder at ${re}` + (st.transit ? ` · ${st.transit} on the way` : '');
    else {
      const days = rate > 0 ? Math.floor(st.available / rate) : 0;
      text = `${st.available} in stock` + (days ? ` · ${days >= 14 ? Math.floor(days / 7) + ' weeks' : plural(days, 'day')} left` : '');
    }
    const pct = tone === 'ok' ? 100 : Math.max(0, Math.min(100, Math.round((st.available / (re * 2)) * 100)));
    return { text, pct };
  };
  const sel = open && data ? data.rows.find((x) => x.r.sku === open) || null : null;

  return (
    <AppScreen name="MStock" title="Stock" css={CSS}>
      <AppBar title="Stock" back="/m-more" actions={<IconButton icon="scan" label="Scan" onClick={() => setScan(true)} />} />
      <Content top={103} bottom={0}>
        {places.length > 1 ? (
          <Chips items={[{ key: '', label: 'All places' }, ...places.map((p) => ({ key: p, label: p.replace(/ branch$/, '') }))]} value={place} onChange={setPlace} style={{ marginTop: '2px', overflowX: 'auto' }} />
        ) : null}
        <div className="card" style={{ margin: '16px 20px 0', padding: '18px 18px 16px' }}>
          <div className="k">{cost ? 'Stock value · at cost' : 'Pieces in stock'}{onePlace() && places[0] ? ` · ${places[0]}` : ''}</div>
          <div className="v num" style={{ fontSize: 'var(--text-3xl)' }}>{data ? (cost ? money(data.value) : data.pieces.toLocaleString('en-IN')) : '—'}</div>
          <StatRow cols={3} style={{ marginTop: '14px' }}>
            <Stat tone="err" value={data ? data.out.length : '—'} label="Out of stock" onClick={() => setView('action')} />
            <Stat tone="warn" value={data ? data.low.length : '—'} label="Low stock" onClick={() => setView('action')} />
            <Stat tone="nav" value={data ? data.exp.length : '—'} label="Expiring" onClick={() => setView('exp')} />
          </StatRow>
        </div>
        {tools.length ? <TileGrid cols={4} style={{ padding: '18px 20px 0' }}>{tools.map(([href, label, icon]) => <Tile key={label} href={href} icon={icon} label={label} />)}</TileGrid> : null}
        <Segmented items={[{ key: 'action', label: 'Needs action' }, { key: 'all', label: 'All items' }, { key: 'exp', label: 'Expiring' }]} value={view} onChange={setView} style={{ marginTop: '20px' }} />
        {q ? (
          <div className="chips" style={{ marginTop: '12px' }}>
            <button type="button" className="chip on" onClick={() => setQ('')} aria-label="Show every product">{hit && hit.row ? hit.row.name : q} <Icon name="x" size={14} /></button>
          </div>
        ) : null}

        {!data ? <div style={{ marginTop: '14px' }}><Skeleton rows={4} /></div> : view === 'exp' ? (
          data.exp.length ? (
            <div className="card" style={{ margin: '14px 20px 0' }}>
              {data.exp.map((b) => {
                const row = data.rows.find((x) => x.r.sku === b.sku);
                const tone = b.expired || b.daysLeft <= 7 ? 'err' : 'warn';
                return (
                  <div key={b.id} className="lrow">
                    {row ? <Thumb row={row.r} size={48} /> : <span className="av" style={{ width: '48px', height: '48px', background: '#eef2f6', color: '#003087' }}>{b.name.charAt(0)}</span>}
                    <span style={{ flex: '1', minWidth: '0' }}>
                      <span className="st-name" style={{ fontSize: 'var(--text-sm-plus)', fontWeight: 'var(--weight-medium)' }}>{b.name}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs-plus)', color: TEXT[tone], marginTop: '2px' }}><span className={'sh ' + tone} style={{ color: SHAPE[tone] }} />{b.left} left · {b.expired ? 'expired ' + dayText(b.expiry) : 'expires ' + dayText(b.expiry)}</span>
                      <span className="s" style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{b.place} · {b.ref}{cost ? ' · ' + money(b.value) : ''}</span>
                    </span>
                    <span className="st-end">{ctx && (ctx.ids.has('stock-expiry') || ctx.ids.has('stock-adjust')) ? <button type="button" className="ib st-act" aria-label={'Write off ' + b.name} onClick={() => writeOff(b)}><Icon name="minus" size={20} /></button> : null}</span>
                  </div>
                );
              })}
            </div>
          ) : <div className="card" style={{ margin: '14px 20px 0' }}><EmptyState icon="check" title="Nothing expires in the next 30 days" /></div>
        ) : list.length ? (
          <div className="card" style={{ margin: '14px 20px 0' }}>
            {list.slice(0, 80).map((x) => {
              const l = line(x);
              return (
                <div key={x.r.sku} className="lrow" role="button" tabIndex={0} onClick={() => setOpen(x.r.sku)} onKeyDown={(e) => { if (e.key === 'Enter') setOpen(x.r.sku); }} style={{ cursor: 'pointer' }}>
                  <Thumb row={x.r} size={48} />
                  <span style={{ flex: '1', minWidth: '0' }}>
                    <span className="st-name" style={{ fontSize: 'var(--text-sm-plus)', fontWeight: 'var(--weight-medium)' }}>{x.r.name}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs-plus)', color: TEXT[x.tone], marginTop: '2px' }}><span className={'sh ' + x.tone} style={{ color: SHAPE[x.tone] }} />{l.text}</span>
                    <span className="bar" style={{ display: 'block', marginTop: '8px' }}><i style={{ width: l.pct + '%', background: BAR[x.tone] }} /></span>
                  </span>
                  <span className="st-end">
                    {x.tone !== 'ok' && can('/m-purchase-new') ? <Link className="ib st-act" href={'/m-purchase-new?sku=' + encodeURIComponent(x.r.sku)} aria-label={'Reorder ' + x.r.name} onClick={(e) => e.stopPropagation()}><Icon name="plus" size={20} /></Link> : null}
                  </span>
                </div>
              );
            })}
          </div>
        ) : <div className="card" style={{ margin: '14px 20px 0' }}><EmptyState icon="check" title={view === 'action' ? 'Nothing is low or out' : 'No products here'} action={view === 'action' ? { label: 'All items', onClick: () => setView('all') } : null} /></div>}
        <div style={{ height: '8px' }} />
      </Content>

      <Sheet open={!!sel} onClose={() => setOpen('')} title={sel ? sel.r.name : ''}
        footer={sel ? <>
          {can('/m-adjust') ? <Button kind="line" href={'/m-adjust?sku=' + encodeURIComponent(sel.r.sku) + (place ? '&place=' + encodeURIComponent(place) : '')}>Adjust</Button> : null}
          {can('/m-transfers') && places.length > 1 ? <Button kind="line" href={'/m-transfers?new=1&sku=' + encodeURIComponent(sel.r.sku) + (place ? '&from=' + encodeURIComponent(place) : '')}>Transfer</Button> : null}
          <Button href={'/m-product-edit?sku=' + encodeURIComponent(sel.r.sku)}>Open product</Button>
        </> : null}>
        {sel ? (
          <>
            <div className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '-8px', marginBottom: '12px' }}>{[sel.r.sku, sel.r.barcode].filter(Boolean).join(' · ')}</div>
            <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
              {(places.length > 1 ? places : [places[0] || '']).map((pl) => {
                const s = safe(() => stockAt(sel.r.sku, pl), null) || {};
                return (
                  <div key={pl} className="row" style={{ minHeight: '56px' }}>
                    <span className="m">
                      <span className="t" style={{ fontWeight: 'var(--weight-medium)', display: 'block' }}>{pl}</span>
                      <span className="s" style={{ display: 'block' }}>{[`${s.onHand || 0} on hand`, s.held ? `${s.held} held` : '', s.damaged ? `${s.damaged} damaged` : '', s.transit ? `${s.transit} on the way` : ''].filter(Boolean).join(' · ')}</span>
                    </span>
                    <span className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{s.available || 0}</span>
                  </div>
                );
              })}
            </div>
            <div className="help" style={{ marginTop: '8px' }}>Available = on hand − held − damaged. Reorder at {sel.re}{sel.rate ? ` · sells ${sel.rate} a day` : ''}{sel.order ? ` · ${sel.order} on order` : ''}.</div>
            {sel.tone !== 'ok' && can('/m-purchase-new') ? <Note tone="warn" icon="alert" style={{ marginTop: '12px' }}><Link href={'/m-purchase-new?sku=' + encodeURIComponent(sel.r.sku)} style={{ fontWeight: 'var(--weight-medium)' }}>Reorder from the supplier</Link></Note> : null}
          </>
        ) : null}
      </Sheet>
      <ScanSheet open={scan} onClose={() => setScan(false)} onCode={(c) => { setScan(false); setQ(c); setView('all'); const h = safe(() => resolveScan(c), null); if (h) setOpen(h.sku); else toast(`No product for “${c}”`, { tone: 'error' }); }} title="Find a product" />
    </AppScreen>
  );
}
