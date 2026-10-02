'use client';
// DeliveryDialog — hand over the goods of a wholesale order: everything at once or only part of it.
// For each item the merchant says where the goods go out from and how many pieces go out now; what
// is left stays to be delivered. Every delivery can be printed as a delivery challan / gate pass
// (ChallanDialog), right after saving it and later from the invoice's delivery history.
// Stock: the pieces sent leave the chosen place (a 'delivery' stock move) and the invoice's holds
// there end (a hold bigger than what went out is ended and the rest held again). When the goods
// already left the shelf at the sale (stockOutAtSale), the delivery only records the hand-over.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog } from '@/components/ui';
import { formatDate, formatTime } from '@/lib/format';
import { EMPLOYEES } from '@/lib/posStore';
import { MERCHANT } from '@/lib/merchant';
import { LOCATIONS, STOCK_PLACES, getStockPlaces, placeByName } from '@/lib/locations';
import { usePlaceList } from '@/lib/usePlaces';
import { stockAt, productBy, addMove } from '@/lib/stock';
import { getHolds, closeHold, addHolds } from '@/lib/stockHolds';
import { getCustomers, findCustomer } from '@/lib/customers';
import { sentOf, recordDelivery, challanNo, stockOutAtSale } from '@/lib/invoices';

export const DELIVERY = { none: ['Not delivered', 'warning'], partial: ['Partly delivered', 'info'], full: ['Delivered', 'success'] };
const HOW = ['Customer collected from the shop', 'Our own delivery', 'Courier'];

export const DELIVERY_CSS = `
.dl-form{display:flex;flex-direction:column;gap:var(--space-4)}
.dl-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.dl-line{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:var(--space-3);min-height:48px;padding:6px 0;border-bottom:1px solid var(--border-subtle)}
.dl-line b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.dl-line small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.dl-line small.is-short{color:var(--text-danger)}
.dl-line small.is-ok{color:var(--text-success)}
.dl-step{display:flex;align-items:center;gap:2px;padding:2px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.dl-step button{display:grid;place-items:center;width:28px;height:28px;border:0;border-radius:var(--radius-md);background:none;color:var(--text-body);cursor:pointer}
.dl-step button:disabled{opacity:.4;cursor:not-allowed}
.dl-step input{width:48px;height:28px;border:0;background:none;text-align:center;font:inherit;font-weight:var(--weight-medium);color:var(--text-heading);font-variant-numeric:tabular-nums}
.dl-total{display:flex;align-items:baseline;justify-content:space-between;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--fill-primary-soft);font-size:var(--text-sm);color:var(--primary)}
.dl-total b{font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
.dl-quick{display:flex;gap:var(--space-2)}
.dl-sheet .iv-paper__title b{font-size:var(--text-xl)}
.dl-sheet .iv-paper__items td.iv-num{white-space:nowrap}
.dl-signs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-5);padding-top:var(--space-4)}
.dl-sign{display:flex;flex-direction:column;gap:2px;padding-top:var(--space-2);margin-top:var(--space-8);border-top:1px solid var(--border-strong);font-size:var(--text-xs);color:var(--text-muted)}
.dl-sign b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
@media (max-width:599px){.dl-two,.dl-signs{grid-template-columns:1fr}}
@media (max-width:640px){.dl-step button{width:36px;height:36px}.dl-step input{height:36px}}
`;

const pcs = (lines) => Object.values(lines || {}).reduce((a, n) => a + n, 0);
/** Pieces of one product this invoice already has on hold at a place (they are for this order, so they can go out). */
const heldForOrder = (holds, inv, name, place) => holds.filter((h) => h.ref === inv.id && h.status === 'held' && h.product === name && h.place === place).reduce((a, h) => a + h.qty, 0);

/** `inv` is the order to deliver (null closes the dialog); `onDone(next)` gets the updated order. */
export function DeliveryDialog({ inv, onClose, onDone }) {
  const [now, setNow] = useState({});
  const [meta, setMeta] = useState({ from: STOCK_PLACES[0], how: HOW[0], by: EMPLOYEES[0].name, taker: '', note: '' });
  const [holds, setHolds] = useState([]);
  const [done, setDone] = useState(null);   // the saved order, while its challan is shown
  const places = usePlaceList('stock');
  const sent = inv ? sentOf(inv) : {};
  const left = (l) => l.qty - (sent[l.id] || 0);
  // opens with everything that is still to go, from the place the stock is held at (if any)
  useEffect(() => {
    if (!inv) return;
    const all = getHolds();
    const heldAt = (all.find((h) => h.ref === inv.id && h.status === 'held') || {}).place;
    setHolds(all); setDone(null);
    setNow(Object.fromEntries(inv.lines.map((l) => [l.id, left(l)])));
    setMeta((m) => ({ ...m, from: getStockPlaces().includes(heldAt) ? heldAt : getStockPlaces().includes(m.from) ? m.from : getStockPlaces()[0] || m.from, taker: '', note: '' }));
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [inv && inv.id]);
  if (!inv) return null;
  if (done) {
    const finish = () => { const next = done; setDone(null); onDone(next); };
    return <ChallanDialog inv={done} index={done.deliveries.length - 1} onClose={finish} saved />;
  }
  // goods that left the shelf at the sale are not counted again
  const gone = stockOutAtSale(inv);
  // stock free at the chosen place for each line, counting what is already held for this order
  const free = (l) => (!gone && productBy(l.name) ? stockAt(l.name, meta.from, holds).available + heldForOrder(holds, inv, l.name, meta.from) : null);
  const short = inv.lines.filter((l) => free(l) !== null && (now[l.id] || 0) > free(l));
  const going = inv.lines.reduce((a, l) => a + (now[l.id] || 0), 0);
  const remaining = inv.lines.reduce((a, l) => a + left(l), 0);
  const set = (l, n) => setNow({ ...now, [l.id]: Math.max(0, Math.min(left(l), Math.round(Number(n) || 0))) });
  const save = (e) => {
    e.preventDefault();
    if (!going) { toast('Set how many pieces are going out', { tone: 'error' }); return; }
    if (short.length) { toast(`Not enough ${short[0].name} at ${meta.from}. Lower the pieces or choose another place.`, { tone: 'error' }); return; }
    const lines = Object.fromEntries(Object.entries(now).filter(([, n]) => n > 0));
    const next = recordDelivery(inv, lines, { from: meta.from, how: meta.how, by: meta.by, taker: meta.taker.trim(), note: meta.note.trim() });
    const no = challanNo(next, next.deliveries.length - 1);
    // the pieces sent leave the place, and the holds for this order there end as delivered: a hold
    // for more than went out ends and the rest is held again
    let ended = 0;
    inv.lines.forEach((l) => {
      const out = lines[l.id] || 0;
      if (!out) return;
      const p = productBy(l.name);
      if (p && !gone) addMove({ sku: p.sku, place: meta.from, qty: -out, kind: 'delivery', reason: `Delivered · challan ${no}`, by: meta.by, ref: inv.id });
      let n = out;
      holds.filter((h) => h.ref === inv.id && h.status === 'held' && h.product === l.name && h.place === meta.from).sort((a, b) => a.at - b.at).forEach((h) => {
        if (n <= 0) return;
        if (h.qty <= n) { closeHold(h.id, 'delivered', `Delivered · challan ${no}`); n -= h.qty; ended++; return; }
        closeHold(h.id, 'delivered', `${n} of ${h.qty} delivered · challan ${no} · the rest held again`);
        addHolds({ type: h.type, ref: h.ref, who: h.who, place: h.place, note: `Rest of ${h.id} · still to deliver`, by: meta.by }, [{ name: h.product, qty: h.qty - n }]);
        n = 0; ended++;
      });
    });
    toast((going >= remaining ? `${inv.id} is fully delivered · ${going} pcs handed over from ${meta.from}` : `Partial delivery saved · ${going} pcs sent from ${meta.from}, ${remaining - going} pcs still to deliver`) + (ended ? ` · ${ended} stock hold${ended === 1 ? '' : 's'} ended` : ''));
    setDone(next);
  };
  return (
    <Dialog open title={`Deliver · ${inv.id}`} onClose={onClose} width={580}>
      <form className="dl-form" onSubmit={save}>
        <div><label className="gc-label" htmlFor="dl-from">Goods go out from</label><select id="dl-from" className="gc-input gc-select" value={meta.from} onChange={(e) => setMeta({ ...meta, from: e.target.value })}>{places.map((x) => <option key={x}>{x}</option>)}</select></div>
        <div className="dl-quick">
          <button type="button" className="gc-btn gc-btn--sm gc-btn--soft" onClick={() => setNow(Object.fromEntries(inv.lines.map((l) => [l.id, left(l)])))}>Send everything left</button>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setNow({})}>Clear</button>
        </div>
        <div>
          {inv.lines.map((l) => {
            const f = free(l), over = f !== null && (now[l.id] || 0) > f;
            return (
              <div key={l.id} className="dl-line">
                <div>
                  <b>{l.name}</b>
                  <small>Ordered {l.qty} · already sent {sent[l.id] || 0} · {left(l)} left</small>
                  {left(l) ? <small className={over ? 'is-short' : 'is-ok'}>{gone ? 'Taken out of stock at the sale' : f === null ? `Not in the stock list · check ${meta.from} by hand` : over ? `Only ${f} available at ${meta.from}` : `${f} available at ${meta.from}`}</small> : null}
                </div>
                <span className="dl-step">
                  <button type="button" aria-label={`Fewer ${l.name}`} disabled={!(now[l.id] > 0)} onClick={() => set(l, (now[l.id] || 0) - 1)}><Icon name="minus" width="16" height="16" /></button>
                  <input type="number" min="0" max={left(l)} inputMode="numeric" aria-label={`Pieces of ${l.name} going out now`} value={now[l.id] || 0} disabled={!left(l)} onChange={(e) => set(l, e.target.value)} />
                  <button type="button" aria-label={`More ${l.name}`} disabled={(now[l.id] || 0) >= left(l)} onClick={() => set(l, (now[l.id] || 0) + 1)}><Icon name="plus" width="16" height="16" /></button>
                </span>
              </div>
            );
          })}
        </div>
        <div className="dl-total" role="status"><span>{going >= remaining && going ? 'Full delivery' : going ? `Partial delivery · ${remaining - going} pcs will be left` : 'Nothing going out yet'}</span><b>{going} pcs</b></div>
        <div className="dl-two">
          <div><label className="gc-label" htmlFor="dl-how">How it goes</label><select id="dl-how" className="gc-input gc-select" value={meta.how} onChange={(e) => setMeta({ ...meta, how: e.target.value })}>{HOW.map((x) => <option key={x}>{x}</option>)}</select></div>
          <div><label className="gc-label" htmlFor="dl-by">Handed over by</label><select id="dl-by" className="gc-input gc-select" value={meta.by} onChange={(e) => setMeta({ ...meta, by: e.target.value })}>{EMPLOYEES.map((m) => <option key={m.name}>{m.name}</option>)}</select></div>
        </div>
        <div className="dl-two">
          <div><label className="gc-label" htmlFor="dl-taker">Received by (customer’s side)</label><input id="dl-taker" className="gc-input" placeholder="Name of the person who took it" value={meta.taker} onChange={(e) => setMeta({ ...meta, taker: e.target.value })} /></div>
          <div><label className="gc-label" htmlFor="dl-note">Vehicle or note</label><input id="dl-note" className="gc-input" placeholder="Vehicle no., optional" value={meta.note} onChange={(e) => setMeta({ ...meta, note: e.target.value })} /></div>
        </div>
        <p className="gc-help" style={{ margin: 0 }}>Saving makes challan {challanNo({ id: inv.id }, (inv.deliveries || []).length)}, ready to print as the gate pass.</p>
        <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid" disabled={!going || short.length > 0}>{going >= remaining ? 'Deliver in full' : 'Save partial delivery'}</button></div>
      </form>
    </Dialog>
  );
}

/** The delivery challan / gate pass of the `index`-th delivery of `inv`, in a dialog with Print. */
export function ChallanDialog({ inv, index, onClose, saved }) {
  const d = inv && (inv.deliveries || [])[index];
  if (!d) return null;
  const no = challanNo(inv, index);
  return (
    <Dialog open title={saved ? `Delivery saved · challan ${no}` : `Challan ${no}`} onClose={onClose} width={820}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>{saved ? 'Done' : 'Close'}</button><button type="button" className="gc-btn gc-btn--solid" onClick={() => window.print()}><Icon name="printer" width="16" height="16" aria-hidden="true" /> Print challan / gate pass</button></>}>
      <ChallanPaper inv={inv} index={index} />
    </Dialog>
  );
}

/** The printable sheet. It uses the invoice sheet's classes, so PAPER_CSS prints only this sheet. */
export function ChallanPaper({ inv, index }) {
  const d = inv.deliveries[index];
  const cust = typeof window === 'undefined' ? null : findCustomer(getCustomers(), inv.customer.phone);
  const place = placeByName(d.from) || LOCATIONS.find((x) => x.name === d.from);
  const before = sentOf({ deliveries: inv.deliveries.slice(0, index) });
  const rows = inv.lines.filter((l) => d.lines[l.id]);
  const no = challanNo(inv, index);
  return (
    <article className="iv-paper dl-sheet" aria-label={`Delivery challan ${no}`}>
      <header className="iv-paper__head">
        <div className="iv-paper__brand">
          <svg width="52" height="52" viewBox="0 0 52 52" role="img" aria-label={`${MERCHANT.name} logo`}><rect width="52" height="52" rx="12" fill="#003087" /><path d="M35 19a10 10 0 1 0 1 13v-6h-9" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <div><b>{MERCHANT.name}</b><span>{MERCHANT.address}</span><span style={{ display: 'block' }}>{MERCHANT.phone} · BIN {MERCHANT.bin}</span></div>
        </div>
        <div className="iv-paper__title"><b>DELIVERY CHALLAN · GATE PASS</b><span>{no}</span><span>{formatDate(d.at)}, {formatTime(d.at)}</span></div>
      </header>
      <div className="iv-paper__meta">
        <div><span className="iv-cap">Goods go out from</span><b>{d.from || 'Not recorded'}</b>{place ? <span>{place.address}</span> : null}<span>{d.how}</span></div>
        <div><span className="iv-cap">Deliver to</span><b>{inv.customer.name || 'Walk-in customer'}</b><span>{(cust && cust.address) || 'Address not on file'}</span><span>{inv.customer.phone || 'No mobile number'}</span></div>
        <div><span className="iv-cap">Details</span><span>Invoice no.: <b>{inv.id}</b></span><span>Invoice date: {formatDate(inv.at)}</span><span>Vehicle / note: {d.note || '—'}</span><span>Delivery {index + 1} of this order</span></div>
      </div>
      <table className="iv-paper__items">
        <thead><tr><th scope="col">#</th><th scope="col">Item</th><th scope="col" className="iv-num">Ordered</th><th scope="col" className="iv-num">Sent before</th><th scope="col" className="iv-num">Pieces now</th></tr></thead>
        <tbody>
          {rows.map((l, i) => <tr key={l.id}><td>{i + 1}</td><td>{l.name}{l.meta ? <span className="iv-sub">{l.meta}</span> : null}</td><td className="iv-num">{l.qty}</td><td className="iv-num">{before[l.id] || 0}</td><td className="iv-num"><b>{d.lines[l.id]}</b></td></tr>)}
          <tr><td /><td><b>Total pieces</b></td><td /><td /><td className="iv-num"><b>{pcs(d.lines)}</b></td></tr>
        </tbody>
      </table>
      <div className="dl-signs">
        <div className="dl-sign"><span>Handed over by</span><b>{d.by || '—'}</b><span>Signature</span></div>
        <div className="dl-sign"><span>Received by</span><b>{d.taker || '—'}</b><span>Signature · goods received in good condition</span></div>
        <div className="dl-sign"><span>Checked at the gate</span><b>&nbsp;</b><span>Security signature and time</span></div>
      </div>
      <footer className="iv-paper__end">
        <span>This challan is the gate pass for the goods above. Prices are on invoice {inv.id}.</span>
        <span>{MERCHANT.web}</span>
      </footer>
    </article>
  );
}
