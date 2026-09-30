'use client';
// HoldStockDialog — set stock aside for an invoice, line by line, from one place. Each line starts at
// what is still needed (ordered − delivered − already held) and can be changed; the place picker shows
// how many are free there. One hold is made per line with pieces. Used by the invoice page and list.
// Pieces already delivered or already held can never be held again, and nothing can be held for an
// invoice whose goods left the shelf when it was sold (stockOutAtSale).

import React, { useEffect, useState } from 'react';
import { toast } from '@/runtime/ui';
import { Dialog } from '@/components/ui';
import { EMPLOYEES } from '@/lib/posStore';
import { stockAt, productBy } from '@/lib/stock';
import { getHolds, addHolds, HOLD_PLACES, getHoldPlaces } from '@/lib/stockHolds';
import { sentOf, stockOutAtSale } from '@/lib/invoices';

export const HOLD_CSS = `
.hs-form{display:flex;flex-direction:column;gap:var(--space-4)}
.hs-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.hs-line{display:grid;grid-template-columns:minmax(0,1fr) 96px;align-items:center;gap:var(--space-3);padding:var(--space-2) 0;border-bottom:1px solid var(--border-subtle)}
.hs-line b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.hs-line small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.hs-line small.is-short{color:var(--text-danger)}
.hs-line small.is-ok{color:var(--text-success)}
.hs-line input{text-align:right;font-variant-numeric:tabular-nums}
.hs-line .gc-badge{justify-self:end;white-space:nowrap}
@media (max-width:599px){.hs-two{grid-template-columns:1fr}}
`;

/** Pieces of each line still to hold: { need, sent, held, heldAt, gone } per line id. */
export function holdNeeds(inv, holds = getHolds()) {
  const sent = sentOf(inv);
  const gone = stockOutAtSale(inv);
  const mine = holds.filter((h) => h.ref === inv.id && h.status === 'held');
  return Object.fromEntries(inv.lines.map((l) => {
    const rows = mine.filter((h) => h.product === l.name);
    const held = rows.reduce((a, h) => a + h.qty, 0);
    const need = gone ? 0 : Math.max(0, l.qty - (sent[l.id] || 0) - held);
    return [l.id, { sent: sent[l.id] || 0, held, heldAt: [...new Set(rows.map((h) => h.place))].join(', '), need, gone }];
  }));
}
/** True when some line of the invoice still has pieces that are neither sent nor held. */
export const canHold = (inv, holds) => Object.values(holdNeeds(inv, holds)).some((x) => x.need > 0);

/** `inv` opens the dialog (null closes it); `onDone()` runs after the holds are saved. */
export function HoldStockDialog({ inv, onClose, onDone }) {
  const [place, setPlace] = useState(HOLD_PLACES[0]);
  const [qty, setQty] = useState({});
  const [by, setBy] = useState(EMPLOYEES[0].name);
  const [holds, setHolds] = useState([]);
  useEffect(() => {
    if (!inv) return;
    const all = getHolds(), needs = holdNeeds(inv, all);
    setHolds(all);
    setQty(Object.fromEntries(inv.lines.map((l) => [l.id, String(needs[l.id].need)])));
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [inv && inv.id]);
  if (!inv) return null;
  const needs = holdNeeds(inv, holds);
  const who = inv.customer.name || 'Walk-in customer';
  const n = (l) => Math.max(0, Math.min(needs[l.id].need, Math.round(Number(qty[l.id]) || 0)));
  const free = (l) => (productBy(l.name) ? stockAt(l.name, place, holds).available : null);
  const short = inv.lines.filter((l) => free(l) !== null && n(l) > free(l));
  const total = inv.lines.reduce((a, l) => a + n(l), 0);
  const save = (e) => {
    e.preventDefault();
    if (!total) { toast('Set how many pieces to hold', { tone: 'error' }); return; }
    if (short.length) { toast(`Only ${free(short[0])} ${short[0].name} free at ${place}`, { tone: 'error' }); return; }
    // checked again against the holds saved now, so pieces held meanwhile (another tab) are not held twice
    const fresh = holdNeeds(inv, getHolds());
    const lines = inv.lines.map((l) => ({ name: l.name, qty: Math.min(n(l), fresh[l.id].need) })).filter((l) => l.qty > 0);
    if (!lines.length) { toast('Every piece of this invoice is already held or delivered', { tone: 'error' }); onDone(); return; }
    addHolds({ type: 'retail', ref: inv.id, who, place, note: 'Held for the invoice', by }, lines);
    const pcs = lines.reduce((a, l) => a + l.qty, 0);
    toast(`${pcs} pcs held at ${place} for ${inv.id} · ${lines.length} hold${lines.length === 1 ? '' : 's'} made`);
    onDone();
  };
  return (
    <Dialog open title={`Hold stock · ${inv.id}`} onClose={onClose} width={560}>
      <form className="hs-form" onSubmit={save}>
        <p className="gc-help" style={{ margin: 0 }}>The pieces are set aside for {who} and cannot be sold to anyone else until the hold ends in Stock holds.</p>
        <div className="hs-two">
          <div><label className="gc-label" htmlFor="hs-place">Hold the stock from</label><select id="hs-place" className="gc-input gc-select" data-autofocus value={place} onChange={(e) => setPlace(e.target.value)}>{getHoldPlaces().map((x) => <option key={x}>{x}</option>)}</select></div>
          <div><label className="gc-label" htmlFor="hs-by">Held by</label><select id="hs-by" className="gc-input gc-select" value={by} onChange={(e) => setBy(e.target.value)}>{EMPLOYEES.map((m) => <option key={m.name}>{m.name}</option>)}</select></div>
        </div>
        <div>
          {inv.lines.map((l) => {
            const x = needs[l.id], f = free(l), over = f !== null && n(l) > f;
            const facts = `Ordered ${l.qty}${x.sent ? ` · ${x.sent} delivered` : ''}${x.held ? ` · ${x.held} held at ${x.heldAt}` : ''}`;
            return (
              <div key={l.id} className="hs-line">
                <div>
                  <b>{l.name}</b>
                  <small>{facts}</small>
                  {x.need ? <small className={over ? 'is-short' : 'is-ok'}>{f === null ? 'Not in the stock list' : over ? `Only ${f} available here` : `${f} available here`}</small> : null}
                </div>
                {x.need ? (
                  <input className="gc-input" type="number" min="0" max={x.need} inputMode="numeric" aria-label={`Pieces of ${l.name} to hold, up to ${x.need}`} value={qty[l.id] ?? ''} onChange={(e) => setQty({ ...qty, [l.id]: e.target.value })} />
                ) : <span className={'gc-badge gc-badge--' + (x.sent >= l.qty ? 'success' : 'slate')}>{x.sent >= l.qty ? 'Delivered' : x.gone ? 'Taken at the sale' : x.sent ? 'Held · rest sent' : 'Fully held'}</span>}
              </div>
            );
          })}
        </div>
        <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid" disabled={!total || short.length > 0}>Hold {total} pcs</button></div>
      </form>
    </Dialog>
  );
}
