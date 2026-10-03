'use client';
// OrderEditDialog — edit an order that hasn't shipped: items (add, remove, quantity, price) and delivery (zone, charge,
// address). Before saving it shows what the change does: stock held or released, the total, what is due, the COD
// amount, a refund owed, and whether the courier booking must be updated or cancelled. Save changes (version + 1)
// or Send for review; a request that is waiting is reviewed here too (Apply changes / Decline).
// Logic: src/lib/orderEdit.js. Used on the order page.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog } from '@/components/ui';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { DELIVERY_RATES } from '@/lib/orderLinks';
import { orderableItems } from '@/lib/sellable';
import { draftOf, previewEdit, applyEdit, requestEdit, applyEditRequest, discardEditRequest, versionOf } from '@/lib/orderEdit';

const CSS = `
.oe{display:flex;flex-direction:column;gap:var(--space-4)}
.oe h3{margin:0 0 var(--space-2);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.oe-lines{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.oe-lines th{padding:0 var(--space-2) var(--space-2) 0;border-bottom:1px solid var(--border-subtle);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:left}
.oe-lines td{padding:6px var(--space-2) 6px 0;border-bottom:1px solid var(--border-subtle);vertical-align:middle}
.oe-lines .r{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.oe-lines input{width:84px;height:32px}
.oe-lines .oe-name{min-width:140px}
.oe-lines .oe-name small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.oe-add{position:relative}
.oe-hits{position:absolute;z-index:5;left:0;right:0;top:calc(100% + 4px);max-height:220px;overflow:auto;margin:0;padding:4px;list-style:none;background:var(--surface-card);border-radius:var(--radius-lg);box-shadow:var(--shadow-card)}
.oe-hits button{display:flex;justify-content:space-between;gap:var(--space-3);width:100%;min-height:36px;padding:0 var(--space-2);border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-sm);color:var(--text-heading);text-align:left;cursor:pointer}
.oe-hits button:hover,.oe-hits button:focus-visible{background:var(--surface-subtle)}
.oe-hits small{color:var(--text-muted);white-space:nowrap}
.oe-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.oe-fx{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3)}
.oe-fx>div{padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.oe-fx ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:4px;font-size:var(--text-sm);color:var(--text-body)}
.oe-fx b{font-weight:var(--weight-medium);color:var(--text-heading)}
.oe-fx .is-warn{color:var(--text-warning)}
.oe-req{display:flex;gap:var(--space-2);align-items:flex-start;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--fill-info-soft);font-size:var(--text-sm);color:var(--text-body)}
.oe-req svg{flex:none;margin-top:2px;color:var(--primary)}
@media (max-width:640px){
.oe-two,.oe-fx{grid-template-columns:minmax(0,1fr)}
.oe-lines input{width:64px}
}
`;

export default function OrderEditDialog({ open, order, request, onClose, onDone }) {
  const [draft, setDraft] = useState(null);
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  useEffect(() => {
    if (!open || !order) return;
    setDraft(request ? { ...draftOf(order), ...request.draft, baseVersion: versionOf(order) } : draftOf(order));
    setQ('');
    setItems(orderableItems({ channel: 'online' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, order && order.id, request && request.at]);
  const pv = useMemo(() => (open && order && draft ? previewEdit(order, draft) : null), [open, order, draft]);
  if (!order || !draft || !pv) return null;

  const setLine = (i, k) => (e) => { const lines = draft.lines.slice(); lines[i] = { ...lines[i], [k]: e.target.value === '' ? '' : Number(e.target.value) }; setDraft({ ...draft, lines }); };
  const removeLine = (i) => setDraft({ ...draft, lines: draft.lines.filter((_, j) => j !== i) });
  const addItem = (it) => {
    const at = draft.lines.findIndex((l) => (l.sku && l.sku === it.sku) || (!l.sku && l.name === it.name));
    const lines = draft.lines.slice();
    if (at >= 0) lines[at] = { ...lines[at], qty: (Number(lines[at].qty) || 0) + 1 };
    else lines.push({ name: it.name, qty: 1, price: it.price, listPrice: it.listPrice, sku: it.sku, variant: it.variant === 'Single' ? '' : it.variant, productId: it.productId });
    setDraft({ ...draft, lines });
    setQ('');
  };
  const zones = [...DELIVERY_RATES.map((r) => r.label), ...(DELIVERY_RATES.some((r) => r.label === order.zone) || !order.zone ? [] : [order.zone])];
  const setZone = (e) => { const z = e.target.value; const r = DELIVERY_RATES.find((x) => x.label === z); setDraft({ ...draft, zone: z, shipping: r ? r.fee : draft.shipping }); };
  const needle = q.trim().toLowerCase();
  const hits = needle ? items.filter((it) => (it.name + ' ' + it.sku + ' ' + it.variant).toLowerCase().includes(needle)).slice(0, 8) : [];
  const m = pv.money;

  const done = (msg) => { toast(msg); onDone && onDone(); };
  const save = () => {
    const r = request ? applyEditRequest(order, 'Staff', draft) : applyEdit(order, draft);
    if (r.ok) { done(`Order updated · version ${r.version}`); return; }
    toast(r.error, { tone: 'error' });
    // changed in another tab meanwhile: close, so the order is read again before editing
    if (r.conflict && onDone) onDone();
  };
  const sendForReview = () => { const r = requestEdit(order, draft, { by: 'Staff' }); if (r.ok) done('Sent for review'); else toast(r.error, { tone: 'error' }); };
  const decline = () => { discardEditRequest(order, '', 'Staff'); done('Edit request declined'); };

  return (
    <Dialog open={open} title={`Edit ${order.id}`} onClose={onClose} width={720}
      footer={<>
        {request ? <button type="button" className="gc-btn gc-btn--neutral" onClick={decline}>Decline request</button>
          : <button type="button" className="gc-btn gc-btn--neutral" onClick={sendForReview} disabled={!!pv.error}>Send for review</button>}
        <button type="button" className="gc-btn gc-btn--solid" onClick={save} disabled={!!pv.error}>{request ? 'Apply changes' : 'Save changes'}</button>
      </>}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="oe">
        {request ? <div className="oe-req"><Icon name="git-pull-request" width="16" height="16" aria-hidden="true" /><span><b>{request.by}{request.from === 'Customer' ? ' (customer)' : ''}</b> asked {formatTime(request.at)}, {formatDate(request.at)}{request.note ? ': ' + request.note : ''}{request.draft.baseVersion && request.draft.baseVersion !== versionOf(order) ? '. The order changed since.' : ''}</span></div> : null}
        <section>
          <h3>Items</h3>
          <div className="gc-table-wrap" style={{ border: 0 }}>
            <table className="oe-lines">
              <thead><tr><th scope="col">Item</th><th scope="col">Qty</th><th scope="col">Price</th><th scope="col" className="r">Amount</th><th scope="col"><span className="sr-only">Remove</span></th></tr></thead>
              <tbody>
                {draft.lines.map((l, i) => (
                  <tr key={(l.orig != null ? 'o' + l.orig : 'n' + i) + l.name}>
                    <td className="oe-name">{l.name}{l.orig == null ? <small>New</small> : null}</td>
                    <td><input className="gc-input" type="number" min="0" inputMode="numeric" aria-label={'Quantity: ' + l.name} value={l.qty} onChange={setLine(i, 'qty')} /></td>
                    <td><input className="gc-input" type="number" min="0" inputMode="numeric" aria-label={'Price: ' + l.name} value={l.price} onChange={setLine(i, 'price')} /></td>
                    <td className="r">{formatBDT((Number(l.price) || 0) * (Number(l.qty) || 0))}</td>
                    <td className="r"><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={'Remove ' + l.name} onClick={() => removeLine(i)}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="oe-add" style={{ marginTop: 'var(--space-2)' }}>
            <label className="ix-search"><Icon name="search" width="16" height="16" aria-hidden="true" /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Add a product: name or SKU" aria-label="Add a product: name or SKU" /></label>
            {hits.length ? <ul className="oe-hits">{hits.map((it) => <li key={it.sku}><button type="button" onClick={() => addItem(it)}><span>{it.name}{it.variant && it.variant !== 'Single' ? ' · ' + it.variant : ''}</span><small>{formatBDT(it.price)} · {it.stock} free</small></button></li>)}</ul> : null}
          </div>
        </section>
        <section>
          <h3>Delivery</h3>
          <div className="oe-two">
            <div><label className="gc-label" htmlFor="oe-zone">Zone</label><select id="oe-zone" className="gc-input gc-select" value={draft.zone} onChange={setZone}>{zones.map((z) => <option key={z}>{z}</option>)}</select></div>
            <div><label className="gc-label" htmlFor="oe-ship">Delivery charge (৳)</label><input id="oe-ship" className="gc-input" type="number" min="0" inputMode="numeric" value={draft.shipping} onChange={(e) => setDraft({ ...draft, shipping: e.target.value })} /></div>
          </div>
          <div style={{ marginTop: 'var(--space-3)' }}><label className="gc-label" htmlFor="oe-addr">Address</label><textarea id="oe-addr" className="gc-input" rows="2" value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} /></div>
        </section>
        <div><label className="gc-label" htmlFor="oe-reason">Reason</label><input id="oe-reason" className="gc-input" value={draft.reason} onChange={(e) => setDraft({ ...draft, reason: e.target.value })} placeholder="e.g. Customer changed the size" /></div>
        <section aria-live="polite">
          <h3>What changes</h3>
          {pv.error && pv.empty ? <p className="gc-help" style={{ margin: 0 }}>{pv.error}</p> : pv.error ? <p className="gc-help gc-help--error" style={{ margin: 0 }}>{pv.error}</p> : (
            <div className="oe-fx">
              <div>
                <h3>Stock</h3>
                <ul>
                  {pv.stockMode === 'none' ? <li>{['onhold', 'processing', 'pending'].includes(order.statusKey) ? 'Held when the order is approved' : 'No stock held for this order'}</li>
                    : pv.stock.length ? pv.stock.map((s) => <li key={s.name} className={s.short ? 'is-warn' : ''}>{{ hold: 'Hold', release: 'Release', take: 'Take out', return: 'Put back' }[s.action]} {Math.abs(s.delta)} × {s.name}{s.short ? ` (${s.free} free)` : ''}</li>)
                    : <li>No change</li>}
                  {pv.stock.length ? <li>At {pv.place}</li> : null}
                </ul>
              </div>
              <div>
                <h3>Money</h3>
                <ul>
                  <li>Total <b>{formatBDT(m.before)} → {formatBDT(m.after)}</b></li>
                  {m.paid ? <li>Paid {formatBDT(m.paid)}</li> : null}
                  <li>Due {formatBDT(m.dueBefore)} → <b>{formatBDT(m.due)}</b></li>
                  {m.wasCod ? <li>COD {formatBDT(m.codBefore)} → <b>{formatBDT(m.codAfter)}</b></li> : null}
                  {m.refund ? <li className="is-warn">Refund owed {formatBDT(m.refund)}</li> : null}
                </ul>
              </div>
              <div>
                <h3>Courier</h3>
                <ul>
                  <li className={pv.courier.action !== 'none' ? 'is-warn' : ''}>{pv.courier.text}</li>
                  {pv.repack ? <li className="is-warn">{pv.repack}</li> : null}
                </ul>
              </div>
            </div>
          )}
          {!pv.error ? <p className="gc-help" style={{ margin: 'var(--space-2) 0 0' }}>{pv.changes.join(' · ')} · saves as version {versionOf(order) + 1}</p> : null}
        </section>
      </div>
    </Dialog>
  );
}
