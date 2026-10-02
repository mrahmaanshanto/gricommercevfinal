'use client';
// DamagedStockPanel — the real damaged stock (Damaged & expired page): every damaged hold sitting in the
// 'Returns & damaged' bay, with where it came from, what happened, how many and since when.
//   Write off                 the hold ends as 'disposed'; the pieces leave the stock for good
//   Send back to supplier     opens Supplier return with the product and quantity
//   Repaired · back on sale   the hold ends as 'released'; the pieces go on sale at the place chosen
// Stock numbers (stockAt) stay right: a damaged hold that came off a shelf still counts in that shelf's
// base, so ending it needs a stock move at that shelf (−qty to write it off, or −qty there and +qty at
// another place when it goes back on sale elsewhere). A hold that came straight into the bay (damaged on
// arrival, or a damaged customer or courier return) came in with a +qty move at the bay: writing it off
// moves −qty there, putting it on sale moves it from the bay to the chosen place.
// Front end only: holds come from src/lib/stockHolds.js, moves go to src/lib/stock.js.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog, EmptyState } from '@/components/ui';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { getHolds, closeHold, DAMAGED_PLACE } from '@/lib/stockHolds';
import { productBy, addMove } from '@/lib/stock';
import { STOCK_PLACES, getStockPlaces, placeByName, placeName } from '@/lib/locations';
import { unitCost } from '@/lib/purchaseOrders';
import { getStockSetup } from '@/lib/stockSetup';

const WRITE_OFF_REASONS = ['Broken beyond repair', 'Expired', 'Leaked or spoiled', 'Eaten by rats or pests', 'Water damage', 'Missing parts'];
// any shelf place, also one renamed or deactivated since (the pieces were counted there)
const cameFromShelf = (h) => !!h.from && h.from !== DAMAGED_PLACE && (STOCK_PLACES.includes(h.from) || !!placeByName(h.from));

const CSS = `
.dsp{overflow:hidden;font-family:var(--font-sans)}
.dsp-head{display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:var(--space-3);padding:var(--space-4) var(--space-5)}
.dsp-head h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.dsp-head p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.dsp-totals{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-5);padding:0 var(--space-5) var(--space-4)}
.dsp-total{display:flex;flex-direction:column;gap:2px}
.dsp-total span{font-size:var(--text-xs);color:var(--text-muted)}
.dsp-total b{font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
.dsp-total b.is-bad{color:var(--text-danger)}
.dsp .gc-table th,.dsp .gc-table td{padding-left:var(--space-3);padding-right:var(--space-3);white-space:normal}
.dsp .gc-table th:first-child,.dsp .gc-table td:first-child{padding-left:var(--space-5)}
.dsp .gc-table th:last-child,.dsp .gc-table td:last-child{padding-right:var(--space-5)}
.dsp .gc-badge,.dsp .gc-btn,.dsp-num{white-space:nowrap}
.dsp-num{text-align:right;font-variant-numeric:tabular-nums}
.dsp-strong{font-weight:var(--weight-medium);color:var(--text-heading)}
.dsp-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.dsp-id{font-family:var(--font-data)}
.dsp-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:var(--space-2)}
.dsp-form{display:flex;flex-direction:column;gap:var(--space-4)}
/* phones: the four totals sit 2 x 2; a held item's three actions share one row */
@media (max-width:640px){
  .dsp-totals{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3);padding:0 var(--space-4) var(--space-4)}
  .dsp .gc-table .dsp-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-2);width:100%}
  .dsp .gc-table .dsp-actions>.gc-btn{min-width:0;padding:0 var(--space-2);justify-content:center}
  .dsp .gc-table .dsp-actions>.gc-btn svg{display:none}
}
`;

export default function DamagedStockPanel() {
  const [holds, setHolds] = useState([]);
  const [dispose, setDispose] = useState(null);   // { hold, reason, note }
  const [repair, setRepair] = useState(null);     // { hold, place }
  const [returns, setReturns] = useState(true);   // suppliers take back faulty items (Settings › Stock setup)
  useEffect(() => { setReturns(getStockSetup().supplierChanges !== false); }, []);

  useEffect(() => { setHolds(getHolds()); }, []);

  const damaged = holds.filter((h) => h.status === 'damaged').sort((a, b) => (b.closedAt || b.at) - (a.closedAt || a.at));
  const costOf = (h) => unitCost(h.product) * h.qty;
  const pcs = damaged.reduce((a, h) => a + h.qty, 0);
  const value = damaged.reduce((a, h) => a + costOf(h), 0);
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const writtenOff = holds.filter((h) => h.status === 'disposed' && (h.closedAt || 0) >= monthStart.getTime()).reduce((a, h) => a + costOf(h), 0);

  // received damaged at Receive goods: the stock move went into the bay itself (see stockAt in lib/stock.js)
  const arrivedDamaged = (h) => !!h.from && placeName(h.from) === DAMAGED_PLACE;
  const doDispose = (e) => {
    e.preventDefault();
    const h = dispose.hold;
    const why = dispose.reason + (dispose.note.trim() ? ` · ${dispose.note.trim()}` : '');
    const p = productBy(h.product);
    setHolds(closeHold(h.id, 'disposed', `Written off: ${why}`));
    // the pieces still counted at the shelf they came from leave the stock for good
    if (p && cameFromShelf(h)) addMove({ sku: p.sku, place: h.from, qty: -h.qty, kind: 'write-off', reason: `Written off from ${DAMAGED_PLACE}: ${why}`, by: 'Staff', ref: h.id });
    // pieces that arrived damaged were received straight into the bay: they leave the bay
    else if (p && arrivedDamaged(h)) addMove({ sku: p.sku, place: DAMAGED_PLACE, qty: -h.qty, kind: 'write-off', reason: `Written off: ${why}`, by: 'Staff', ref: h.id });
    toast(`${h.qty} × ${h.product} written off · loss of ${formatBDT(costOf(h))} at cost`);
    setDispose(null);
  };

  const doRepair = (e) => {
    e.preventDefault();
    const h = repair.hold;
    const to = repair.place;
    const p = productBy(h.product);
    setHolds(closeHold(h.id, 'released', `Repaired · back on sale at ${to}`));
    if (p) {
      if (cameFromShelf(h)) {
        // ending the hold puts the pieces back where they came from; move them when they go elsewhere
        if (placeName(h.from) !== placeName(to)) {
          addMove({ sku: p.sku, place: h.from, qty: -h.qty, kind: 'transfer', reason: `Repaired · sent to ${to}`, by: 'Staff', ref: h.id });
          addMove({ sku: p.sku, place: to, qty: h.qty, kind: 'repaired', reason: `Repaired · from ${DAMAGED_PLACE}`, by: 'Staff', ref: h.id });
        }
      } else {
        if (arrivedDamaged(h)) addMove({ sku: p.sku, place: DAMAGED_PLACE, qty: -h.qty, kind: 'transfer', reason: `Repaired · sent to ${to}`, by: 'Staff', ref: h.id });
        addMove({ sku: p.sku, place: to, qty: h.qty, kind: 'repaired', reason: `Repaired · from ${DAMAGED_PLACE}`, by: 'Staff', ref: h.id });
      }
    }
    toast(p ? `${h.qty} × ${h.product} back on sale at ${to}` : `${h.product} released · it has no stock record, so the stock count is unchanged`);
    setRepair(null);
  };

  const supplierHref = (h) => '/supplier-return?' + new URLSearchParams({ product: h.product, qty: String(h.qty), hold: h.id }).toString();

  return (
    <section className="gc-card dsp" aria-labelledby="dsp-title">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="dsp-head">
        <div>
          <h2 id="dsp-title">Damaged stock in {DAMAGED_PLACE}</h2>
        </div>
        <Link href="/stock-holds?tab=damaged" className="gc-btn gc-btn--neutral gc-btn--sm"><Icon name="lock" width="16" height="16" aria-hidden="true" /> Stock holds</Link>
      </div>
      <div className="dsp-totals">
        <div className="dsp-total"><span>Items</span><b>{damaged.length}</b></div>
        <div className="dsp-total"><span>Pieces</span><b>{pcs}</b></div>
        <div className="dsp-total"><span>Value at cost</span><b className="is-bad">{formatBDT(value)}</b></div>
        <div className="dsp-total"><span>Written off this month</span><b>{formatBDT(writtenOff)}</b></div>
      </div>
      {damaged.length === 0 ? <EmptyState icon="package-check" title="No damaged stock" body="Items set aside as damaged show here until they are written off, sent back or repaired." /> : (
        <div className="gc-table-wrap">
          <table className="gc-table gc-table--compact gc-table--hoverable">
            <thead><tr><th scope="col">Product</th><th scope="col">Came from</th><th scope="col">What happened</th><th scope="col" className="dsp-num">Qty</th><th scope="col" className="dsp-num">Value at cost</th><th scope="col">Since</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {damaged.map((h) => (
                <tr key={h.id}>
                  <td><span className="dsp-strong">{h.product}</span><span className="dsp-sub dsp-id">{h.id}</span></td>
                  <td>{h.from && h.from !== DAMAGED_PLACE ? h.from : 'Customer return'}{h.ref && h.ref !== '—' ? <span className="dsp-sub">{h.ref}{h.who && h.who !== '—' ? ' · ' + h.who : ''}</span> : null}</td>
                  <td>{h.note || '—'}</td>
                  <td className="dsp-num dsp-strong">{h.qty}</td>
                  <td className="dsp-num">{formatBDT(costOf(h))}</td>
                  <td>{formatDate(h.closedAt || h.at)}<span className="dsp-sub">{formatTime(h.closedAt || h.at)} · {h.by}</span></td>
                  <td>
                    <div className="dsp-actions">
                      <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => { const live = getStockPlaces(); setRepair({ hold: h, place: cameFromShelf(h) && live.includes(placeName(h.from)) ? placeName(h.from) : live[0] }); }} aria-label={`Repaired, put ${h.product} back on sale`}><Icon name="wrench" width="16" height="16" aria-hidden="true" /> Repaired</button>
                      {returns ? <Link href={supplierHref(h)} className="gc-btn gc-btn--sm gc-btn--neutral" aria-label={`Send ${h.product} back to the supplier`}><Icon name="undo-2" width="16" height="16" aria-hidden="true" /> To supplier</Link> : null}
                      <button type="button" className="gc-btn gc-btn--sm gc-btn--soft gc-btn--error" onClick={() => setDispose({ hold: h, reason: WRITE_OFF_REASONS[0], note: '' })} aria-label={`Write off ${h.product}`}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /> Write off</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!dispose} title={dispose ? `Write off · ${dispose.hold.product}` : 'Write off'} onClose={() => setDispose(null)} width={480}>
        {dispose ? (
          <form className="dsp-form" onSubmit={doDispose}>
            <p className="dsp-sub" style={{ margin: 0 }}>{dispose.hold.qty} pcs leave the stock for good. This is recorded as a loss of {formatBDT(costOf(dispose.hold))} at cost and cannot be undone.</p>
            <div><label className="gc-label" htmlFor="dsp-reason">Why is it thrown away?</label><select id="dsp-reason" className="gc-input gc-select" value={dispose.reason} onChange={(e) => setDispose({ ...dispose, reason: e.target.value })}>{WRITE_OFF_REASONS.map((r) => <option key={r}>{r}</option>)}</select></div>
            <div><label className="gc-label" htmlFor="dsp-note">Note</label><input id="dsp-note" className="gc-input" placeholder="Optional, for example: checked by the branch manager" value={dispose.note} onChange={(e) => setDispose({ ...dispose, note: e.target.value })} /></div>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setDispose(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid gc-btn--error">Write off {dispose.hold.qty} pcs</button></div>
          </form>
        ) : null}
      </Dialog>

      <Dialog open={!!repair} title={repair ? `Back on sale · ${repair.hold.product}` : 'Back on sale'} onClose={() => setRepair(null)} width={480}>
        {repair ? (
          <form className="dsp-form" onSubmit={doRepair}>
            <p className="dsp-sub" style={{ margin: 0 }}>{repair.hold.qty} pcs were repaired or checked and can be sold again. They leave {DAMAGED_PLACE}.</p>
            <div><label className="gc-label" htmlFor="dsp-place">Put it on sale at</label><select id="dsp-place" className="gc-input gc-select" value={repair.place} onChange={(e) => setRepair({ ...repair, place: e.target.value })}>{getStockPlaces().map((x) => <option key={x}>{x}</option>)}</select></div>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setRepair(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid">Back on sale</button></div>
          </form>
        ) : null}
      </Dialog>
    </section>
  );
}
