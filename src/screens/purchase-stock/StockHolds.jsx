'use client';
// StockHolds — stock that is in the building but not free to sell, by place:
//   held for online orders (from the moment an order is Approved),
//   held for retail orders and invoices, and damaged stock set aside.
// A hold ends one of three ways: delivered (the goods left), released (back on sale, for example a
// parcel returned without damage) or damaged (moved to damaged stock).
// Damaged stock moves to the 'Returns & damaged' bay (DAMAGED_PLACE); the place filter lists it too.
// Front end only: rows come from src/lib/stockHolds.js.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Dialog, PageHeader, EmptyState } from '@/components/ui';
import { formatDate, formatTime } from '@/lib/format';
import { getHolds, addHolds, closeHold, HOLD_TYPES, DAMAGED_PLACE } from '@/lib/stockHolds';
import { usePlaceList } from '@/lib/usePlaces';
import { CATALOG as STOCK, productBy, stockAt, getMoves } from '@/lib/stock';
import { addReturn } from '@/lib/returns';
import { ProductPicker, PICKER_CSS } from '@/components/ProductPicker';

const TABS = [['held', 'On hold'], ['online', 'Online orders'], ['retail', 'Retail orders'], ['damaged', 'Damaged'], ['closed', 'Closed']];
const STATUS = { held: ['On hold', 'warning'], released: ['Released', 'success'], delivered: ['Delivered', 'slate'], damaged: ['Damaged', 'error'], returned: ['Back to supplier', 'info'], disposed: ['Written off', 'slate'] };
const TYPE_TONE = { online: 'primary', retail: 'info', damaged: 'error' };
const num = (v) => Math.max(0, Math.round(Number(v) || 0));

const CSS = PICKER_CSS + `
.sh-card{overflow:hidden}
.sh-card .gc-table th,.sh-card .gc-table td{padding-left:var(--space-3);padding-right:var(--space-3)}
.sh-card .gc-table th:first-child,.sh-card .gc-table td:first-child{padding-left:var(--space-5)}
.sh-bar{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:var(--space-3);padding:0 var(--space-4)}
.sh-tab b{margin-left:6px;font-weight:var(--weight-medium);color:var(--text-muted);font-variant-numeric:tabular-nums}
.sh-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-4) var(--space-5)}
.sh-head h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sh-head p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.sh-card td .sh-sub{white-space:normal;min-width:120px}
.sh-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.sh-strong{font-weight:var(--weight-medium);color:var(--text-heading)}
.sh-id{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.sh-num{text-align:right;font-variant-numeric:tabular-nums}
.sh-free{font-weight:var(--weight-semibold);color:var(--text-success)}
.sh-actions{display:flex;justify-content:flex-end;gap:var(--space-2)}
.sh-form{display:flex;flex-direction:column;gap:var(--space-4)}
.sh-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.sh-opts{display:flex;flex-direction:column;gap:var(--space-2)}
.sh-opt{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);cursor:pointer}
.sh-opt.is-on{border-color:var(--primary);background:var(--fill-primary-soft)}
.sh-opt b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.sh-opt small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.sh-place{width:auto;min-width:200px;margin-bottom:var(--space-2)}
@media (max-width:599px){.sh-two{grid-template-columns:1fr}}
`;

const ENDINGS = {
  online: [['delivered', 'Delivered to the customer', 'The goods left. They come off the stock.'], ['released', 'Returned without damage', 'The parcel came back in good condition. The stock goes back on sale.'], ['damaged', 'Returned damaged', 'The stock moves to damaged and is not sold.'], ['released', 'Order cancelled', 'Nothing was sent. The stock goes back on sale.']],
  retail: [['delivered', 'Collected by the customer', 'The goods left. They come off the stock.'], ['released', 'No longer needed', 'The stock goes back on sale.'], ['damaged', 'Found damaged', 'The stock moves to damaged and is not sold.']],
};

export default function StockHolds() {
  const HOLD_PLACES = usePlaceList('stock');
  const HOLD_FILTER_PLACES = [...usePlaceList('filter'), DAMAGED_PLACE].filter((x, i, a) => a.indexOf(x) === i);
  const [holds, setHolds] = useState([]);
  const [moves, setMoves] = useState([]);
  const [tab, setTab] = useState('held');
  const [place, setPlace] = useState('');
  const [form, setForm] = useState(null);   // new hold
  const [end, setEnd] = useState(null);     // { hold, pick }

  useEffect(() => {
    setHolds(getHolds());
    setMoves(getMoves());
    const want = new URLSearchParams(window.location.search).get('tab');
    if (TABS.some((x) => x[0] === want)) setTab(want);
  }, []);

  // a place shows its own holds and the damaged stock that came from it
  const here = holds.filter((h) => !place || h.place === place || h.from === place);
  const groups = {
    held: here.filter((h) => h.status === 'held'),
    online: here.filter((h) => h.type === 'online' && h.status === 'held'),
    retail: here.filter((h) => h.type === 'retail' && h.status === 'held'),
    damaged: here.filter((h) => h.status === 'damaged'),
    closed: here.filter((h) => ['released', 'delivered', 'returned', 'disposed'].includes(h.status)),
  };
  const units = (list) => list.reduce((a, h) => a + h.qty, 0);
  // per product: on the shelf, held for online, held for retail, damaged, free to sell
  const table = useMemo(() => STOCK.map((p) => {
    const st = stockAt(p.sku, place, holds, moves);
    const of = (f) => units(holds.filter((h) => h.product === p.name && (!place || h.place === place) && f(h)));
    const online = of((h) => h.type === 'online' && h.status === 'held'), retail = of((h) => h.type === 'retail' && h.status === 'held');
    return { ...p, onHand: st.onHand, online, retail, damaged: st.damaged, free: st.available };
  }), [holds, moves, place]);
  const freeAt = (sku, at) => stockAt(sku, at, holds, moves).available;

  const saveHold = (e) => {
    e.preventDefault();
    const qty = num(form.qty);
    if (!qty) return;
    const p = productBy(form.sku);
    if (!p) { toast('Choose a product to hold', { tone: 'error' }); return; }
    const free = freeAt(p.sku, form.place);
    if (qty > free) { toast(`Only ${free} of ${p.name} is free at ${form.place}`, { tone: 'error' }); return; }
    setHolds(addHolds({ type: form.type, ref: form.ref.trim(), who: form.who.trim(), place: form.place, note: form.note.trim(), by: 'Staff' }, [{ name: p.name, qty }]));
    setForm(null);
    toast(form.type === 'damaged' ? `${qty} × ${p.name} moved from ${form.place} to ${DAMAGED_PLACE}` : `${qty} × ${p.name} held at ${form.place}`);
  };
  const finish = (e) => {
    e.preventDefault();
    const [status, label] = ENDINGS[end.hold.type][end.pick];
    setHolds(closeHold(end.hold.id, status, label));
    if (/^Returned/.test(label)) addReturn({ channel: end.hold.type === 'online' ? 'Online' : 'Retail', ref: end.hold.ref, customer: end.hold.who, items: `${end.hold.product} × ${end.hold.qty}`, type: 'return', amount: 0, money: 'even', method: '', stock: status === 'damaged' ? 'damaged' : 'restock', reason: label, place: end.hold.place, by: 'Staff' });
    toast(status === 'released' ? `${end.hold.qty} × ${end.hold.product} released · back on sale at ${end.hold.place}` : status === 'damaged' ? `${end.hold.qty} × ${end.hold.product} moved to ${DAMAGED_PLACE}` : `${end.hold.qty} × ${end.hold.product} delivered · taken off the stock`);
    setEnd(null);
  };
  const shown = groups[tab];

  return (
    <div className="dc-screen ds" data-screen="StockHolds">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="stock-holds" />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb="Products & stock" page="Stock holds" />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <PageHeader
              title="Stock holds"
              about="Stock that is in the building but not free to sell: held for online orders, held for retail orders, or damaged."
              actions={<>
                <Link href="/stock" className="gc-btn gc-btn--neutral"><Icon name="boxes" width="18" height="18" aria-hidden="true" /> Stock list</Link>
                <button type="button" className="gc-btn gc-btn--solid" onClick={() => setForm({ type: 'retail', sku: STOCK[0].sku, qty: '1', place: HOLD_PLACES.includes(place) ? place : HOLD_PLACES[0], ref: '', who: '', note: '' })}><Icon name="lock" width="18" height="18" aria-hidden="true" /> Hold stock</button>
              </>}
            />

            <div className="gc-kpis">
              <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-primary-soft)', color: 'var(--primary)' }}><Icon name="globe" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Held for online orders</p><p className="gc-kpi__value">{units(groups.online)}<small>units · {groups.online.length} orders</small></p></div></div>
              <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-info-soft)', color: 'var(--text-info)' }}><Icon name="store" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Held for retail orders</p><p className="gc-kpi__value">{units(groups.retail)}<small>units · {groups.retail.length} holds</small></p></div></div>
              <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-error-soft)', color: 'var(--text-danger)' }}><Icon name="package-x" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Damaged</p><p className="gc-kpi__value">{units(groups.damaged)}<small>units set aside</small></p></div></div>
              <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-success-soft)', color: 'var(--text-success)' }}><Icon name="package-check" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Free to sell</p><p className="gc-kpi__value">{table.reduce((a, p) => a + p.free, 0)}<small>units · {place || 'all places'}</small></p></div></div>
            </div>

            <section className="gc-card sh-card">
              <div className="sh-bar">
                <div className="gc-tabs" role="tablist" aria-label="Stock holds" style={{ borderBottom: 0, overflow: 'visible', flexWrap: 'wrap' }}>
                  {TABS.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={'gc-tab sh-tab' + (tab === id ? ' gc-tab--active' : '')} onClick={() => setTab(id)}>{label}<b>{groups[id].length}</b></button>)}
                </div>
                <select className="gc-input gc-select sh-place" aria-label="Warehouse or branch" value={place} onChange={(e) => setPlace(e.target.value)}><option value="">All warehouses and branches</option>{HOLD_FILTER_PLACES.map((x) => <option key={x}>{x}</option>)}</select>
              </div>
              {shown.length === 0 ? <EmptyState icon="package-check" title="Nothing here" body={tab === 'damaged' ? 'No damaged stock at this place.' : 'No stock is in this group at this place.'} /> : (
                <div className="gc-table-wrap">
                  <table className="gc-table gc-table--compact gc-table--hoverable">
                    <thead><tr><th scope="col">Hold</th><th scope="col">Product</th><th scope="col" className="sh-num">Qty</th><th scope="col">For</th><th scope="col">From</th><th scope="col">Since</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                    <tbody>
                      {shown.map((h) => (
                        <tr key={h.id}>
                          <td className="sh-id">{h.id}</td>
                          <td className="sh-strong">{h.product}</td>
                          <td className="sh-num sh-strong">{h.qty}</td>
                          <td><span className={'gc-badge gc-badge--' + TYPE_TONE[h.type]}>{HOLD_TYPES[h.type]}</span><span className="sh-sub">{h.type === 'damaged' ? h.note : `${h.ref} · ${h.who}`}</span></td>
                          <td>{h.place}{h.from && h.from !== h.place ? <span className="sh-sub">from {h.from}</span> : null}</td>
                          <td>{formatDate(h.at)}<span className="sh-sub">{formatTime(h.at)} · {h.by}</span></td>
                          <td><span className={'gc-badge gc-badge--' + STATUS[h.status][1]}>{STATUS[h.status][0]}</span>{h.status !== 'held' && h.type !== 'damaged' ? <span className="sh-sub">{h.note}</span> : null}</td>
                          <td><div className="sh-actions">{h.status === 'held' ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setEnd({ hold: h, pick: 0 })} aria-label={`End the hold ${h.id}`}>End hold</button> : null}</div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="gc-card sh-card">
              <div className="sh-head"><div><h2>Stock by product · {place || 'all warehouses and branches'}</h2><p>{place === DAMAGED_PLACE ? 'Stock in the damaged bay is never for sale.' : 'Free to sell is what is on the shelf minus everything held or damaged.'}</p></div></div>
              <div className="gc-table-wrap">
                <table className="gc-table gc-table--compact gc-table--hoverable">
                  <thead><tr><th scope="col">Product</th><th scope="col" className="sh-num">On the shelf</th><th scope="col" className="sh-num">Held · online</th><th scope="col" className="sh-num">Held · retail</th><th scope="col" className="sh-num">Damaged</th><th scope="col" className="sh-num">Free to sell</th></tr></thead>
                  <tbody>
                    {table.map((p) => (
                      <tr key={p.sku}>
                        <td><span className="sh-strong">{p.name}</span><span className="sh-sub sh-id">{p.sku}</span></td>
                        <td className="sh-num">{p.onHand}</td>
                        <td className="sh-num">{p.online || '—'}</td>
                        <td className="sh-num">{p.retail || '—'}</td>
                        <td className="sh-num">{p.damaged || '—'}</td>
                        <td className="sh-num sh-free">{p.free}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* hold stock by hand */}
      <Dialog open={!!form} title="Hold stock" onClose={() => setForm(null)} width={520}>
        {form ? (
          <form className="sh-form" onSubmit={saveHold}>
            <div><label className="gc-label" htmlFor="sh-type">Hold it for *</label><select id="sh-type" className="gc-input gc-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{Object.entries(HOLD_TYPES).map(([k, l]) => <option key={k} value={k}>{k === 'damaged' ? `Damaged · move to ${DAMAGED_PLACE}` : l}</option>)}</select></div>
            <div><label className="gc-label" htmlFor="sh-product">Product *</label><ProductPicker id="sh-product" value={form.sku} onChange={(sku) => setForm((f) => ({ ...f, sku }))} hint={(p) => { const n = freeAt(p.sku, form.place); return { text: `${n} available here`, none: n <= 0 }; }} /></div>
            <div className="sh-two">
              <div><label className="gc-label" htmlFor="sh-place">From where *</label><select id="sh-place" className="gc-input gc-select" value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })}>{HOLD_PLACES.map((x) => <option key={x}>{x}</option>)}</select></div>
              <div><label className="gc-label" htmlFor="sh-qty">Quantity *</label><input id="sh-qty" className="gc-input" type="number" min="1" inputMode="numeric" aria-required="true" data-autofocus value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} /></div>
            </div>
            {form.type === 'damaged' ? <p className="gc-help" style={{ margin: 0 }}>It leaves {form.place} and goes to {DAMAGED_PLACE}. It is not sold from there.</p> : null}
            {form.type !== 'damaged' ? (
              <div className="sh-two">
                <div><label className="gc-label" htmlFor="sh-ref">Order or invoice no.</label><input id="sh-ref" className="gc-input" placeholder={form.type === 'online' ? '#136812' : 'INV-0231'} value={form.ref} onChange={(e) => setForm({ ...form, ref: e.target.value })} /></div>
                <div><label className="gc-label" htmlFor="sh-who">Customer</label><input id="sh-who" className="gc-input" value={form.who} onChange={(e) => setForm({ ...form, who: e.target.value })} /></div>
              </div>
            ) : null}
            <div><label className="gc-label" htmlFor="sh-note">{form.type === 'damaged' ? 'What is wrong with it' : 'Note'}</label><input id="sh-note" className="gc-input" placeholder={form.type === 'damaged' ? 'For example: box crushed, screen cracked' : 'Optional'} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setForm(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid" disabled={!num(form.qty)}>{form.type === 'damaged' ? 'Move to damaged' : 'Hold stock'}</button></div>
          </form>
        ) : null}
      </Dialog>

      {/* end a hold */}
      <Dialog open={!!end} title={end ? `End hold · ${end.hold.id}` : 'End hold'} onClose={() => setEnd(null)} width={480}>
        {end ? (
          <form className="sh-form" onSubmit={finish}>
            <span className="sh-sub">{end.hold.qty} × {end.hold.product} · {HOLD_TYPES[end.hold.type]} {end.hold.ref} · {end.hold.place}</span>
            <div className="sh-opts" role="radiogroup" aria-label="What happened">
              {ENDINGS[end.hold.type].map(([, label, help], i) => (
                <label key={label} className={'sh-opt' + (end.pick === i ? ' is-on' : '')}>
                  <input type="radio" name="sh-end" className="gc-check gc-check--radio" checked={end.pick === i} onChange={() => setEnd({ ...end, pick: i })} />
                  <span><b>{label}</b><small>{help}</small></span>
                </label>
              ))}
            </div>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEnd(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid">Confirm</button></div>
          </form>
        ) : null}
      </Dialog>
    </div>
  );
}
