'use client';
// StockHolds — stock that is in the building but not free to sell, by place:
//   held for online orders (from the moment an order is Approved),
//   held for retail orders and invoices, and damaged stock set aside.
// A hold ends one of three ways: delivered (the goods left), released (back on sale, for example a
// parcel returned without damage) or damaged (moved to damaged stock).
// Damaged stock moves to the 'Returns & damaged' bay (DAMAGED_PLACE); the place filter lists it too.
// Laid out like a Shopify list (components/ui/IndexKit.jsx): the holds by view (On hold, Online orders, Retail
// orders, Damaged, Closed) with a place picker; a click on a hold opens it (order, customer, who, note) with
// "End hold". Stock by product (on the shelf, held, damaged, free to sell) is folded away below the list.
// Front end only: rows come from src/lib/stockHolds.js.

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Dialog, EmptyState, Sheet, StatusBadge } from '@/components/ui';
import { ShopHeader, IndexTabs, LearnMore, KV } from '@/components/ui/IndexKit';
import { formatDate, formatTime } from '@/lib/format';
import { getHolds, addHolds, closeHold, HOLD_TYPES, DAMAGED_PLACE } from '@/lib/stockHolds';
import { usePlaceList } from '@/lib/usePlaces';
import { CATALOG as STOCK, productBy, stockAt, getMoves } from '@/lib/stock';
import { addReturn } from '@/lib/returns';
import { ProductPicker, PICKER_CSS } from '@/components/ProductPicker';

const TABS = [['held', 'On hold'], ['online', 'Online orders'], ['retail', 'Retail orders'], ['damaged', 'Damaged'], ['closed', 'Closed']];
const STATUS = { held: ['On hold', 'warning'], released: ['Released', 'success'], delivered: ['Delivered', 'neutral'], damaged: ['Damaged', 'error'], returned: ['Back to supplier', 'info'], disposed: ['Written off', 'neutral'] };
const num = (v) => Math.max(0, Math.round(Number(v) || 0));
const has = (x) => x && x !== '—';

const CSS = PICKER_CSS + `
.sh-id{font-family:var(--font-data)}
.ix-strong.sh-id{font-family:var(--font-data)}
.sh-cell{display:block;max-width:260px;overflow:hidden;text-overflow:ellipsis}
.sh-free{font-weight:var(--weight-semibold);color:var(--text-success)}
.sh-sub{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.sh-form{display:flex;flex-direction:column;gap:var(--space-4)}
.sh-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.sh-opts{display:flex;flex-direction:column;gap:var(--space-2)}
.sh-opt{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);cursor:pointer}
.sh-opt.is-on{border-color:var(--primary);background:var(--fill-primary-soft)}
.sh-opt b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.sh-opt small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
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
  const [view, setView] = useState(null);   // id of the hold open in the side panel

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
    setView(null);
  };
  const shown = groups[tab];
  const tabs = TABS.map(([id, label]) => ({ key: id, id: 'sh-tab-' + id, label, count: groups[id].length, on: tab === id, onClick: () => setTab(id) }));
  const forText = (h) => HOLD_TYPES[h.type] + (h.type !== 'damaged' && has(h.ref) ? ' · ' + h.ref : '');
  const openRow = (h) => (e) => { if (e.target.closest && e.target.closest('a,button,input,select,label')) return; setView(h.id); };
  const viewing = view ? holds.find((h) => h.id === view) : null;
  const newHold = () => setForm({ type: 'retail', sku: STOCK[0].sku, qty: '1', place: HOLD_PLACES.includes(place) ? place : HOLD_PLACES[0], ref: '', who: '', note: '' });

  return (
    <div className="dc-screen ds" data-screen="StockHolds">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="stock-holds" />
        <main className="gc-shell__main">
          <Topbar crumb="Products & stock" page="Stock holds" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="lock" title="Stock holds"
                about="Stock that is in the building but not free to sell: held for online orders, held for retail orders, or damaged."
                more={[{ label: 'Stock list', href: '/stock' }, { label: 'Damaged & expired', href: '/expiry-disposal' }]}
                primary={{ label: 'Hold stock', onClick: newHold }} />

              <section className="ix-card" aria-label="Stock holds">
                <div className="ix-bar">
                  <IndexTabs tabs={tabs} label="Stock holds" />
                  <span className="ix-tools">
                    <select className="ix-pick" aria-label="Warehouse or branch" value={place} onChange={(e) => setPlace(e.target.value)}><option value="">All warehouses and branches</option>{HOLD_FILTER_PLACES.map((x) => <option key={x}>{x}</option>)}</select>
                  </span>
                </div>
                {shown.length === 0 ? (
                  <div className="ix-empty"><EmptyState icon="package-check" title="Nothing here" body={tab === 'damaged' ? 'No damaged stock at this place.' : 'No stock is in this group at this place.'} /></div>
                ) : (<>
                  <ul className="ix-plist" aria-label="Stock holds">
                    {shown.map((h) => (
                      <li key={h.id}>
                        <button type="button" className="ix-pitem" onClick={() => setView(h.id)}>
                          <span className="ix-pitem__top"><b>{h.product}</b><span>{`${h.qty} pcs`}</span></span>
                          <span className="ix-pitem__mid">{forText(h)} · {h.place}</span>
                          <span className="ix-pitem__tags"><StatusBadge tone={STATUS[h.status][1]}>{STATUS[h.status][0]}</StatusBadge></span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="ix-table-wrap">
                    <table className="ix-table gc-table--keep">
                      <caption className="sr-only">{TABS.find((x) => x[0] === tab)[1]}, {place || 'all warehouses and branches'}</caption>
                      <thead><tr><th scope="col">Hold</th><th scope="col">Since</th><th scope="col">Product</th><th scope="col" className="ix-num">Qty</th><th scope="col">For</th><th scope="col">Place</th><th scope="col">Status</th></tr></thead>
                      <tbody>
                        {shown.map((h) => (
                          <tr key={h.id} onClick={openRow(h)}>
                            <td><button type="button" className="ix-strong sh-id" onClick={() => setView(h.id)}>{h.id}</button></td>
                            <td className="ix-muted">{formatDate(h.at)}</td>
                            <td><span className="sh-cell">{h.product}</span></td>
                            <td className="ix-num ix-strong">{h.qty}</td>
                            <td className="ix-muted"><span className="sh-cell">{forText(h)}</span></td>
                            <td className="ix-muted">{h.place}</td>
                            <td><StatusBadge tone={STATUS[h.status][1]}>{STATUS[h.status][0]}</StatusBadge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>)}
                <div className="ix-foot"><span>{(shown.length === 1 ? '1 hold' : `${shown.length} holds`) + ` · ${units(shown)} pcs`}</span></div>
              </section>

              <details className="ix-card gc-disclose">
                <summary>Stock by product · {place || 'all warehouses and branches'}</summary>
                <p className="sh-sub">{place === DAMAGED_PLACE ? 'Stock in the damaged bay is never for sale.' : 'Free to sell is what is on the shelf minus everything held or damaged.'}</p>
                <div className="ix-table-wrap ix-table-wrap--show">
                  <table className="ix-table ix-table--static gc-table--keep">
                    <thead><tr><th scope="col">Product</th><th scope="col">SKU</th><th scope="col" className="ix-num">On the shelf</th><th scope="col" className="ix-num">Held · online</th><th scope="col" className="ix-num">Held · retail</th><th scope="col" className="ix-num">Damaged</th><th scope="col" className="ix-num">Free to sell</th></tr></thead>
                    <tbody>
                      {table.map((p) => (
                        <tr key={p.sku}>
                          <td className="ix-strong">{p.name}</td>
                          <td className="ix-muted sh-id">{p.sku}</td>
                          <td className="ix-num">{p.onHand}</td>
                          <td className="ix-num">{p.online || '—'}</td>
                          <td className="ix-num">{p.retail || '—'}</td>
                          <td className="ix-num">{p.damaged || '—'}</td>
                          <td className="ix-num sh-free">{p.free}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="sh-sub">{`${table.reduce((a, p) => a + p.free, 0)} pcs free to sell`}</p>
              </details>
              <LearnMore topic="stock holds" />
            </div>
          </div>
        </main>
      </div>

      {/* one hold: what it is for, who asked, and how it ends */}
      <Sheet open={!!viewing && !end} title={viewing ? viewing.id : ''} onClose={() => setView(null)}
        footer={viewing && viewing.status === 'held'
          ? <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => setEnd({ hold: viewing, pick: 0 })}>End hold</button>
          : <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => setView(null)}>Done</button>}>
        {viewing ? (<>
          <div><StatusBadge tone={STATUS[viewing.status][1]}>{STATUS[viewing.status][0]}</StatusBadge></div>
          <KV rows={[
            ['Product', viewing.product],
            ['Qty', viewing.qty],
            ['For', HOLD_TYPES[viewing.type]],
            viewing.type !== 'damaged' || has(viewing.ref) ? ['Order or invoice no.', has(viewing.ref) ? viewing.ref : ''] : null,
            viewing.type !== 'damaged' || has(viewing.who) ? ['Customer', has(viewing.who) ? viewing.who : ''] : null,
            ['Place', viewing.place],
            viewing.from && viewing.from !== viewing.place ? ['From', viewing.from] : null,
            ['Since', `${formatDate(viewing.at)} · ${formatTime(viewing.at)}`],
            ['By', viewing.by],
            viewing.note ? ['Note', viewing.note] : null,
          ]} />
        </>) : null}
      </Sheet>

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
            <p className="sh-sub">{end.hold.qty} × {end.hold.product} · {HOLD_TYPES[end.hold.type]} {end.hold.ref} · {end.hold.place}</p>
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
