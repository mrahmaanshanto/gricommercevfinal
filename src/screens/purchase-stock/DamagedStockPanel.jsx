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
// A Shopify-style card (components/ui/IndexKit.jsx): the totals as one line under the title and a compact table;
// a click on a row opens the item (order, customer, who, when) with the three actions.
// Front end only: holds come from src/lib/stockHolds.js, moves go to src/lib/stock.js.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from '@/runtime/ui';
import { Icon } from '@/runtime/dc';
import { Dialog, EmptyState, Sheet } from '@/components/ui';
import { KV } from '@/components/ui/IndexKit';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { getHolds, closeHold, DAMAGED_PLACE } from '@/lib/stockHolds';
import { productBy, addMove } from '@/lib/stock';
import { STOCK_PLACES, getStockPlaces, placeByName, placeName } from '@/lib/locations';
import { unitCost } from '@/lib/purchaseOrders';
import { getStockSetup, isOnePlace } from '@/lib/stockSetup';

const WRITE_OFF_REASONS = ['Broken beyond repair', 'Expired', 'Leaked or spoiled', 'Eaten by rats or pests', 'Water damage', 'Missing parts'];
// any shelf place, also one renamed or deactivated since (the pieces were counted there)
const cameFromShelf = (h) => !!h.from && h.from !== DAMAGED_PLACE && (STOCK_PLACES.includes(h.from) || !!placeByName(h.from));

const CSS = `
.dsp-head{align-items:flex-start;padding-bottom:var(--space-3)}
.dsp-cell{display:block;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsp-id{font-family:var(--font-data)}
.dsp-form{display:flex;flex-direction:column;gap:var(--space-4)}
.dsp-sub{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
`;

export default function DamagedStockPanel() {
  const [holds, setHolds] = useState([]);
  const [dispose, setDispose] = useState(null);   // { hold, reason, note }
  const [repair, setRepair] = useState(null);     // { hold, place }
  const [returns, setReturns] = useState(true);   // suppliers take back faulty items (Settings › Stock setup)
  const [one, setOne] = useState(false);          // one-place shop: no Stock holds page
  const [view, setView] = useState(null);         // id of the item open in the side panel
  useEffect(() => { setReturns(getStockSetup().supplierChanges !== false); setOne(isOnePlace()); }, []);

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
  const cameFrom = (h) => (h.from && h.from !== DAMAGED_PLACE ? h.from : 'Customer return');
  const has = (x) => x && x !== '—';
  // the three ways out of the bay are on the item's panel (a click on the row)
  const startRepair = (h) => { const live = getStockPlaces(); setView(null); setRepair({ hold: h, place: cameFromShelf(h) && live.includes(placeName(h.from)) ? placeName(h.from) : live[0] }); };
  const startDispose = (h) => { setView(null); setDispose({ hold: h, reason: WRITE_OFF_REASONS[0], note: '' }); };
  const openRow = (h) => (e) => { if (e.target.closest && e.target.closest('a,button,input,select,label')) return; setView(h.id); };
  const viewing = view ? damaged.find((h) => h.id === view) : null;

  return (
    <section className="ix-card" aria-labelledby="dsp-title">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ix-card__head dsp-head">
        <div>
          <h2 id="dsp-title">Damaged stock in {DAMAGED_PLACE}</h2>
          <p className="ix-card__sub">{`${damaged.length} items · ${pcs} pcs · `}<span className="ix-bad">{`${formatBDT(value)} at cost`}</span>{` · ${formatBDT(writtenOff)} written off this month`}</p>
        </div>
        {one ? null : <Link href="/stock-holds?tab=damaged">Stock holds</Link>}
      </div>
      {damaged.length === 0 ? <div className="ix-empty"><EmptyState icon="package-check" title="No damaged stock" body="Items set aside as damaged show here until they are written off, sent back or repaired." /></div> : (<>
        <ul className="ix-plist" aria-label="Damaged stock">
          {damaged.map((h) => (
            <li key={h.id}>
              <button type="button" className="ix-pitem" onClick={() => setView(h.id)}>
                <span className="ix-pitem__top"><b>{h.product}</b><span>{`${h.qty} pcs`}</span></span>
                <span className="ix-pitem__mid">{cameFrom(h)} · {h.note || '—'} · {formatBDT(costOf(h))}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="ix-table-wrap">
          <table className="ix-table gc-table--keep">
            <caption className="sr-only">Damaged stock in {DAMAGED_PLACE}</caption>
            <thead><tr><th scope="col">Product</th><th scope="col">Came from</th><th scope="col">What happened</th><th scope="col" className="ix-num">Qty</th><th scope="col" className="ix-num">Value at cost</th><th scope="col">Since</th></tr></thead>
            <tbody>
              {damaged.map((h) => (
                <tr key={h.id} onClick={openRow(h)}>
                  <td><button type="button" className="ix-strong dsp-cell" onClick={() => setView(h.id)}>{h.product}</button></td>
                  <td className="ix-muted"><span className="dsp-cell">{cameFrom(h)}</span></td>
                  <td className="ix-muted"><span className="dsp-cell">{h.note || '—'}</span></td>
                  <td className="ix-num ix-strong">{h.qty}</td>
                  <td className="ix-num">{formatBDT(costOf(h))}</td>
                  <td className="ix-muted">{formatDate(h.closedAt || h.at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>)}

      {/* one damaged item: where it came from, and the three ways out of the bay */}
      <Sheet open={!!viewing} title={viewing ? viewing.product : ''} onClose={() => setView(null)}
        footer={viewing ? <>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--soft gc-btn--error" onClick={() => startDispose(viewing)}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /> Write off</button>
          {returns ? <Link href={supplierHref(viewing)} className="gc-btn gc-btn--sm gc-btn--neutral"><Icon name="undo-2" width="16" height="16" aria-hidden="true" /> To supplier</Link> : null}
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => startRepair(viewing)}><Icon name="wrench" width="16" height="16" aria-hidden="true" /> Repaired</button>
        </> : null}>
        {viewing ? (
          <KV rows={[
            ['Hold', <span key="i" className="dsp-id">{viewing.id}</span>],
            ['Came from', cameFrom(viewing)],
            has(viewing.ref) ? ['Order or invoice no.', viewing.ref] : null,
            has(viewing.who) ? ['Customer', viewing.who] : null,
            ['What happened', viewing.note || '—'],
            ['Qty', viewing.qty],
            ['Value at cost', formatBDT(costOf(viewing))],
            ['Since', `${formatDate(viewing.closedAt || viewing.at)} · ${formatTime(viewing.closedAt || viewing.at)}`],
            ['By', viewing.by],
          ]} />
        ) : null}
      </Sheet>

      <Dialog open={!!dispose} title={dispose ? `Write off · ${dispose.hold.product}` : 'Write off'} onClose={() => setDispose(null)} width={480}>
        {dispose ? (
          <form className="dsp-form" onSubmit={doDispose}>
            <p className="dsp-sub">{dispose.hold.qty} pcs leave the stock for good. This is recorded as a loss of {formatBDT(costOf(dispose.hold))} at cost and cannot be undone.</p>
            <div><label className="gc-label" htmlFor="dsp-reason">Why is it thrown away?</label><select id="dsp-reason" className="gc-input gc-select" value={dispose.reason} onChange={(e) => setDispose({ ...dispose, reason: e.target.value })}>{WRITE_OFF_REASONS.map((r) => <option key={r}>{r}</option>)}</select></div>
            <div><label className="gc-label" htmlFor="dsp-note">Note</label><input id="dsp-note" className="gc-input" placeholder="Optional, for example: checked by the branch manager" value={dispose.note} onChange={(e) => setDispose({ ...dispose, note: e.target.value })} /></div>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setDispose(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid gc-btn--error">Write off {dispose.hold.qty} pcs</button></div>
          </form>
        ) : null}
      </Dialog>

      <Dialog open={!!repair} title={repair ? `Back on sale · ${repair.hold.product}` : 'Back on sale'} onClose={() => setRepair(null)} width={480}>
        {repair ? (
          <form className="dsp-form" onSubmit={doRepair}>
            <p className="dsp-sub">{repair.hold.qty} pcs were repaired or checked and can be sold again. They leave {DAMAGED_PLACE}.</p>
            <div><label className="gc-label" htmlFor="dsp-place">Put it on sale at</label><select id="dsp-place" className="gc-input gc-select" value={repair.place} onChange={(e) => setRepair({ ...repair, place: e.target.value })}>{getStockPlaces().map((x) => <option key={x}>{x}</option>)}</select></div>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setRepair(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid">Back on sale</button></div>
          </form>
        ) : null}
      </Dialog>
    </section>
  );
}
