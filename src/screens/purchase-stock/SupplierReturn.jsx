'use client';
// SupplierReturn — goods waiting to go back to suppliers, and the returns made.
// - Waiting: damaged holds at the Returns & damaged bay (DAMAGED_PLACE) that came from a delivery —
//   their ref is a purchase order, or their note names the supplier (Receive goods reports:
//   'Wrong item · return to <supplier>' / 'Arrived damaged · <PO>'). Grouped by supplier.
// - Making a return closes those holds (returned when the supplier picks up, delivered when we send
//   them), takes the pieces off the bay's stock (a 'supplier return' stock move) and adds a credit
//   note for their value at the order price, which lowers what the shop owes that supplier.
// - /supplier-return?hold=<hold id>&product=<name>&qty=<n> (from Damaged & expired) opens the return for
//   that hold, or the product's first set-aside hold, with that many pieces. A damaged hold that did not
//   come from a delivery can go back too: the window then asks which supplier takes it.
// Front end only: holds from src/lib/stockHolds.js, bills and returns from src/lib/supplierBills.js.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Dialog, PageHeader, EmptyState } from '@/components/ui';
import { formatBDT, formatDate } from '@/lib/format';
import { EMPLOYEES } from '@/lib/posStore';
import { DAMAGED_PLACE } from '@/lib/locations';
import { productBy, addMove } from '@/lib/stock';
import { getHolds, addHolds, closeHold } from '@/lib/stockHolds';
import { getPO, lineCost, unitCost } from '@/lib/purchaseOrders';
import { getDb, demoDb, supplierByName, payableOf, addSupplierReturn } from '@/lib/supplierBills';

const REASONS = ['Damaged', 'Wrong item or size', 'Poor quality', 'Expired', 'Sent too many'];
const HOW = [['pickup', 'Supplier picks up', 'They collect the goods from the Returns & damaged bay.'], ['send', 'We send them', 'We deliver the goods back to the supplier.']];
const HOW_LABEL = { pickup: 'Supplier picked up', send: 'We sent them' };
// the demo purchase orders' suppliers (orders made in this browser carry their own)
const DEMO_PO_SUPPLIER = { 'PO-2609-0020': 'Nabil Fashion House', 'PO-2609-0019': 'Dhaka Beauty Imports', 'PO-2608-0017': 'Mim Enterprise', 'PO-2608-0015': 'Rahman Traders' };
const num = (v) => Math.max(0, Math.round(Number(v) || 0));
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

/** Which supplier a damaged hold goes back to, or '' when it is not from a delivery. */
function supplierOfHold(h, suppliers) {
  const po = /^PO-/.test(h.ref || '') ? h.ref : '';
  if (po) return (getPO(po) || {}).supplier || DEMO_PO_SUPPLIER[po] || (h.who !== '—' ? h.who : '');
  const note = String(h.note || '');
  const m = note.match(/return to (.+)$/i);
  if (m) return m[1].trim();
  const named = suppliers.find((s) => note.toLowerCase().includes(s.name.toLowerCase()));
  return named ? named.name : '';
}

const holdCost = (h, po) => (po ? lineCost(po, h.product) : unitCost(h.product));

/** Damaged holds at the bay, each with its supplier name ('' when not from a delivery), PO and order price. */
function setAside(holds, suppliers) {
  return holds.filter((h) => h.status === 'damaged' && h.place === DAMAGED_PLACE).map((h) => {
    const po = /^PO-/.test(h.ref || '') ? h.ref : '';
    return { ...h, supName: supplierOfHold(h, suppliers), po, cost: holdCost(h, po) };
  });
}
function groupOf(name, items, db) {
  const sup = supplierByName(name, db.suppliers);
  return { name, sup, items, pieces: items.reduce((a, h) => a + h.qty, 0), value: items.reduce((a, h) => a + h.qty * h.cost, 0), owe: sup ? payableOf(sup.id, db) : 0 };
}

const CSS = `
.sr-card{overflow:hidden}
.sr-card .gc-table th,.sr-card .gc-table td{padding-left:var(--space-3);padding-right:var(--space-3);white-space:normal}
.sr-card .gc-table th:first-child,.sr-card .gc-table td:first-child{padding-left:var(--space-5)}
.sr-card .gc-table th:last-child,.sr-card .gc-table td:last-child{padding-right:var(--space-5)}
.sr-card .gc-badge,.sr-card .gc-btn,.sr-num{white-space:nowrap}
.sr-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-4) var(--space-5)}
.sr-head h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sr-head p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.sr-who{display:flex;align-items:center;gap:var(--space-3)}
.sr-avatar{display:grid;place-items:center;width:36px;height:36px;flex:none;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary);font-weight:var(--weight-medium)}
.sr-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.sr-strong{font-weight:var(--weight-medium);color:var(--text-heading)}
.sr-id{font-family:var(--font-data)}
.sr-num{text-align:right;font-variant-numeric:tabular-nums}
.sr-acts{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.sr-section{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sr-form{display:flex;flex-direction:column;gap:var(--space-4)}
.sr-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.sr-lines{margin:0;padding:0;list-style:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden}
.sr-lines li{display:flex;align-items:center;gap:var(--space-3);min-height:56px;padding:6px var(--space-3);border-top:1px solid var(--border-subtle)}
.sr-lines li:first-child{border-top:0}
.sr-lines label{display:flex;align-items:center;gap:var(--space-3);flex:1;min-width:0;cursor:pointer}
.sr-lines .gc-input{width:84px}
.sr-opts{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2)}
.sr-opt{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);cursor:pointer}
.sr-opt.is-on{border-color:var(--primary);background:var(--fill-primary-soft)}
.sr-opt b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.sr-opt small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.sr-total{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:var(--space-2);padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary);font-size:var(--text-sm)}
.sr-total b{font-size:var(--text-xl);font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
@media (max-width:599px){.sr-two,.sr-opts{grid-template-columns:1fr}}
`;

export default function SupplierReturn() {
  const [db, setDb] = useState(demoDb);
  const [holds, setHolds] = useState([]);
  const [form, setForm] = useState(null);   // { sup, qty: { holdId: n }, reason, how, note, by }

  const reload = () => { const d = getDb(), hs = getHolds(); setDb(d); setHolds(hs); return { d, hs }; };
  useEffect(() => {
    const { d, hs } = reload();
    // opened from Damaged & expired: start the return for that hold (or product) and quantity
    const q = new URLSearchParams(window.location.search);
    const holdId = q.get('hold'), product = q.get('product'), want = num(q.get('qty'));
    if (!holdId && !product) return;
    const all = setAside(hs, d.suppliers);
    const h = all.find((x) => x.id === holdId) || all.find((x) => x.product === product && x.supName) || all.find((x) => x.product === product);
    if (!h) { toast(`No ${product || 'item'} is set aside at ${DAMAGED_PLACE} to return`, { tone: 'info' }); return; }
    const name = h.supName;
    const g = name ? groupOf(name, all.filter((x) => x.supName === name), d) : { ...groupOf('', [h], d), pick: true };
    const qty = Object.fromEntries(g.items.map((x) => [x.id, x.id === h.id ? Math.min(h.qty, want || h.qty) : 0]));
    setForm({ g, qty, reason: /^Wrong/.test(h.note || '') ? REASONS[1] : REASONS[0], how: 'pickup', note: '', by: EMPLOYEES[2].name });
  }, []);

  // damaged holds from deliveries, waiting at the bay, grouped by supplier
  const waiting = setAside(holds, db.suppliers).filter((h) => h.supName);
  const groups = [...new Set(waiting.map((h) => h.supName))].map((name) => groupOf(name, waiting.filter((h) => h.supName === name), db));
  const returns = db.returns;
  const supName = (id) => (db.suppliers.find((s) => s.id === id) || {}).name || id;
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
  const thisMonth = returns.filter((r) => r.at >= monthStart);
  const totalPieces = waiting.reduce((a, h) => a + h.qty, 0);
  const totalValue = waiting.reduce((a, h) => a + h.qty * h.cost, 0);

  const open = (g) => setForm({ g, qty: Object.fromEntries(g.items.map((h) => [h.id, h.qty])), reason: /^Wrong/.test(g.items[0].note || '') ? REASONS[1] : REASONS[0], how: 'pickup', note: '', by: EMPLOYEES[2].name });
  const picked = form ? form.g.items.filter((h) => num(form.qty[h.id]) > 0).map((h) => ({ h, qty: Math.min(h.qty, num(form.qty[h.id])) })) : [];
  const credit = picked.reduce((a, x) => a + x.qty * x.h.cost, 0);
  const pieces = picked.reduce((a, x) => a + x.qty, 0);

  const save = (e) => {
    e.preventDefault();
    if (!picked.length) { toast('Tick at least one item to send back', { tone: 'error' }); return; }
    if (!form.g.name) { toast('Choose the supplier the goods go back to', { tone: 'error' }); return; }
    const g = form.g;
    const note = form.note.trim();
    const closeNote = `${HOW_LABEL[form.how]} · ${form.reason}${note ? ' · ' + note : ''}`;
    const lines = picked.map(({ h, qty }) => ({ holdId: h.id, name: h.product, sku: productBy(h.product)?.sku || '', qty, cost: h.cost, po: h.po }));
    const { ret, credit: cn } = addSupplierReturn({ supplier: g.sup ? g.sup.id : g.name, lines, reason: form.reason, how: form.how, note, by: form.by });
    picked.forEach(({ h, qty }) => {
      closeHold(h.id, form.how === 'pickup' ? 'returned' : 'delivered', `${closeNote} · ${ret.no}`);
      // part of a hold goes back: the rest stays set aside at the bay (still counted off the shelf it came from)
      if (qty < h.qty) addHolds({ type: 'damaged', ref: h.ref, who: h.who, place: h.from || DAMAGED_PLACE, note: h.note, by: form.by }, [{ name: h.product, qty: h.qty - qty }]);
      // delivery items were booked into the bay, so they leave the bay; stock set aside from a shelf
      // only counts off that shelf while the hold is open, so the move is recorded there
      const at = h.from && h.from !== DAMAGED_PLACE ? h.from : DAMAGED_PLACE;
      addMove({ sku: productBy(h.product)?.sku || h.product, place: at, qty: -qty, kind: 'supplier return', reason: `Returned to ${g.name} · ${form.reason}`, by: form.by, ref: ret.no });
    });
    reload();
    setForm(null);
    toast(`${ret.no}: ${plural(pieces, 'piece')} back to ${g.name}${cn ? ` · credit note ${cn.no} for ${formatBDT(cn.amount)}` : ''}`);
  };

  const kpi = (icon, bg, fg, label, value, note) => (
    <div className="gc-kpi">
      <span className="gc-kpi__icon" style={{ background: bg, color: fg }}><Icon name={icon} width="24" height="24" aria-hidden="true" /></span>
      <span className="gc-kpi__text"><span className="gc-kpi__label" style={{ display: 'block' }}>{label}</span><span className="gc-kpi__value">{value}<small title={note}>{note}</small></span></span>
    </div>
  );

  return (
    <div className="dc-screen ds" data-screen="SupplierReturn">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="po-suppliers" />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb="Purchase › Suppliers & payables" page="Return goods to supplier" placeholder="Search or scan any barcode" />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <PageHeader
              title="Return goods to supplier"
              about="Damaged or wrong items from deliveries wait here. Sending them back takes them off stock and lowers what you owe."
              actions={<>
                <Link href="/receive-goods" className="gc-btn gc-btn--neutral"><Icon name="package-check" width="18" height="18" aria-hidden="true" /> Receive goods</Link>
                <Link href="/suppliers" className="gc-btn gc-btn--neutral"><Icon name="wallet" width="18" height="18" aria-hidden="true" /> Suppliers & payables</Link>
              </>}
            />

            <div className="gc-kpis">
              {kpi('package-x', 'var(--fill-error-soft)', 'var(--text-danger)', 'Waiting to go back', plural(totalPieces, 'piece'), plural(groups.length, 'supplier'))}
              {kpi('coins', 'var(--fill-warning-soft)', 'var(--text-warning)', 'Their value', formatBDT(totalValue), 'at the order price')}
              {kpi('undo-2', 'var(--fill-primary-soft)', 'var(--primary)', 'Returned this month', plural(thisMonth.length, 'return'), plural(thisMonth.reduce((a, r) => a + r.lines.reduce((n, l) => n + l.qty, 0), 0), 'piece'))}
              {kpi('receipt', 'var(--fill-success-soft)', 'var(--text-success)', 'Credit from returns', formatBDT(thisMonth.reduce((a, r) => a + r.value, 0)), 'this month')}
            </div>

            <h2 className="sr-section">Waiting to go back</h2>
            {groups.length === 0 ? (
              <section className="gc-card">
                <EmptyState icon="package-check" title="Nothing is waiting to go back" body="Damaged or wrong items from Receive goods show here." />
              </section>
            ) : groups.map((g) => (
              <section key={g.name} className="gc-card sr-card" aria-label={`Waiting to go back to ${g.name}`}>
                <div className="sr-head">
                  <div className="sr-who">
                    <span className="sr-avatar" aria-hidden="true">{g.name[0]}</span>
                    <div><h2>{g.name}</h2><p>{plural(g.pieces, 'piece')} · {formatBDT(g.value)} · you owe them {formatBDT(g.owe)}</p></div>
                  </div>
                  <div className="sr-acts">
                    {g.sup ? <Link href={`/supplier-detail?id=${encodeURIComponent(g.sup.id)}`} className="gc-btn gc-btn--sm gc-btn--neutral">Ledger</Link> : null}
                    <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => open(g)}><Icon name="undo-2" width="16" height="16" aria-hidden="true" /> Create return</button>
                  </div>
                </div>
                <div className="gc-table-wrap">
                  <table className="gc-table gc-table--compact">
                    <thead><tr><th scope="col">Product</th><th scope="col">From</th><th scope="col" className="sr-num">Pieces</th><th scope="col" className="sr-num">Order price</th><th scope="col" className="sr-num">Value</th><th scope="col">Set aside</th></tr></thead>
                    <tbody>
                      {g.items.map((h) => (
                        <tr key={h.id}>
                          <td><span className="sr-strong">{h.product}</span><span className="sr-sub sr-id">{h.id}</span></td>
                          <td>{h.po ? <span className="sr-id">{h.po}</span> : '—'}<span className="sr-sub">{h.note}</span></td>
                          <td className="sr-num">{h.qty}</td>
                          <td className="sr-num">{formatBDT(h.cost)}</td>
                          <td className="sr-num sr-strong">{formatBDT(h.qty * h.cost)}</td>
                          <td>{formatDate(h.at)}<span className="sr-sub">by {h.by}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}

            <section className="gc-card sr-card" aria-label="Returns made">
              <div className="sr-head"><div><h2>Returns made</h2><p>Each return took the pieces off stock and added a credit note to the supplier’s ledger.</p></div></div>
              {returns.length === 0 ? <EmptyState icon="undo-2" title="No returns yet" body="Returns you make show here with their credit notes." /> : (
                <div className="gc-table-wrap">
                  <table className="gc-table gc-table--compact">
                    <thead><tr><th scope="col">Return</th><th scope="col">Supplier</th><th scope="col">Items</th><th scope="col">Reason</th><th scope="col" className="sr-num">Credit note</th><th scope="col">By</th></tr></thead>
                    <tbody>
                      {returns.map((r) => (
                        <tr key={r.no}>
                          <td><span className="sr-strong sr-id">{r.no}</span><span className="sr-sub">{formatDate(r.at)}</span></td>
                          <td><Link href={`/supplier-detail?id=${encodeURIComponent(r.supplier)}`}>{supName(r.supplier)}</Link></td>
                          <td>{r.lines.map((l) => <span key={l.holdId + l.name} className="sr-sub" style={{ color: 'var(--text-body)' }}>{l.qty} × {l.name}</span>)}</td>
                          <td>{r.reason}<span className="sr-sub">{HOW_LABEL[r.how]}{r.note ? ' · ' + r.note : ''}</span></td>
                          <td className="sr-num"><span className="sr-strong">{formatBDT(r.value)}</span><span className="sr-sub sr-id">{r.credit || '—'}</span></td>
                          <td>{r.by}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      <Dialog open={!!form} title={form && form.g.name ? `Return to ${form.g.name}` : 'Return to supplier'} onClose={() => setForm(null)} width={600}>
        {form ? (
          <form className="sr-form" onSubmit={save}>
            {form.g.pick ? (
              <div>
                <label className="gc-label" htmlFor="sr-sup">Supplier *</label>
                <select id="sr-sup" className="gc-input gc-select" aria-required="true" value={form.g.name} onChange={(e) => setForm({ ...form, g: { ...groupOf(e.target.value, form.g.items, db), pick: true } })}>
                  <option value="">Choose who takes it back</option>
                  {db.suppliers.map((x) => <option key={x.id} value={x.name}>{x.name}</option>)}
                </select>
                <p className="gc-help">This item was not reported on a delivery, so choose the supplier.</p>
              </div>
            ) : null}
            <ul className="sr-lines" aria-label="Items going back">
              {form.g.items.map((h) => {
                const on = num(form.qty[h.id]) > 0;
                return (
                  <li key={h.id}>
                    <label>
                      <input type="checkbox" className="gc-check" checked={on} onChange={(e) => setForm({ ...form, qty: { ...form.qty, [h.id]: e.target.checked ? h.qty : 0 } })} />
                      <span style={{ minWidth: 0 }}><span className="sr-strong">{h.product}</span><span className="sr-sub">{h.po || h.note || 'Set aside'} · {h.qty} set aside · {formatBDT(h.cost)} each</span></span>
                    </label>
                    <input className="gc-input" type="number" min="0" max={h.qty} inputMode="numeric" aria-label={`Pieces of ${h.product} going back`} value={form.qty[h.id]} onChange={(e) => setForm({ ...form, qty: { ...form.qty, [h.id]: Math.min(h.qty, num(e.target.value)) } })} />
                  </li>
                );
              })}
            </ul>
            <div className="sr-two">
              <div><label className="gc-label" htmlFor="sr-reason">Reason</label><select id="sr-reason" className="gc-input gc-select" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}>{REASONS.map((x) => <option key={x}>{x}</option>)}</select></div>
              <div><label className="gc-label" htmlFor="sr-by">Handled by</label><select id="sr-by" className="gc-input gc-select" value={form.by} onChange={(e) => setForm({ ...form, by: e.target.value })}>{EMPLOYEES.map((m) => <option key={m.name}>{m.name}</option>)}</select></div>
            </div>
            <div className="sr-opts" role="radiogroup" aria-label="How the goods go back">
              {HOW.map(([k, label, sub]) => (
                <label key={k} className={'sr-opt' + (form.how === k ? ' is-on' : '')}>
                  <input type="radio" name="sr-how" checked={form.how === k} onChange={() => setForm({ ...form, how: k })} />
                  <span><b>{label}</b><small>{sub}</small></span>
                </label>
              ))}
            </div>
            <div><label className="gc-label" htmlFor="sr-note">Note</label><textarea id="sr-note" className="gc-input" rows="2" placeholder="For example: 2 jeans are size 36 instead of 34" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
            <div className="sr-total" role="status"><span>{plural(pieces, 'piece')}{form.g.name ? ` · you will owe ${form.g.name} ${formatBDT(Math.max(0, form.g.owe - credit))}` : ''}</span><b>{formatBDT(credit)} credit</b></div>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setForm(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid" disabled={!pieces}>Return {plural(pieces, 'piece')}</button></div>
          </form>
        ) : null}
      </Dialog>
    </div>
  );
}
