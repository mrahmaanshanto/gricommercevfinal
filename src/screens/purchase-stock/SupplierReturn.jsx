'use client';
// SupplierReturn — goods waiting to go back to suppliers, and the returns made.
// - Waiting: damaged holds at the Returns & damaged bay (DAMAGED_PLACE) that came from a delivery —
//   their ref is a purchase order, or their note names the supplier (Receive goods reports:
//   'Wrong item · return to <supplier>' / 'Arrived damaged · <PO>'). Grouped by supplier.
// - Making a return closes those holds (returned when the supplier picks up, delivered when we send
//   them), takes the pieces off the bay's stock (a 'supplier return' stock move) and adds a credit
//   note for their value at the order price, which lowers what the shop owes that supplier.
// - Return bought items: anything bought from a supplier (their bills' item lines), up to what was bought less
//   what already went back; ?supplier=<id or name>&bill=<bill no> opens it (Supplier ledger › Return goods).
// - Each return is settled one of two ways: a credit note that lowers what the shop owes, or a replacement the
//   supplier sends; a waiting replacement is received from the return (stock comes back in at the chosen place).
// - /supplier-return?hold=<hold id>&product=<name>&qty=<n> (from Damaged & expired) opens the return for
//   that hold, or the product's first set-aside hold, with that many pieces. A damaged hold that did not
//   come from a delivery can go back too: the window then asks which supplier takes it.
// Front end only: holds from src/lib/stockHolds.js, bills and returns from src/lib/supplierBills.js.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Dialog, EmptyState, InfoTip } from '@/components/ui';
import { RecordHeader, MetricStrip, KV } from '@/components/ui/IndexKit';
import { formatBDT, formatDate } from '@/lib/format';
import { EMPLOYEES } from '@/lib/posStore';
import { DAMAGED_PLACE, getStockPlaces, STOCK_PLACES } from '@/lib/locations';
import { productBy, addMove } from '@/lib/stock';
import { getHolds, addHolds, closeHold } from '@/lib/stockHolds';
import { getPO, lineCost, unitCost } from '@/lib/purchaseOrders';
import { getDb, demoDb, supplierByName, findSupplier, payableOf, addSupplierReturn, boughtFrom, receiveReplacement, settleText } from '@/lib/supplierBills';

const REASONS = ['Damaged', 'Wrong item or size', 'Poor quality', 'Expired', 'Sent too many'];
const HOW = [['pickup', 'Supplier picks up', 'They collect the goods from the Returns & damaged bay.'], ['send', 'We send them', 'We deliver the goods back to the supplier.']];
const HOW_LABEL = { pickup: 'Supplier picked up', send: 'We sent them' };
const SETTLE = [['credit', 'Deduct from what we owe', 'A credit note lowers the supplier’s balance.'], ['replace', 'Send a replacement', 'The supplier sends the same items again. Receive them here.']];
// the demo purchase orders' suppliers (orders made in this browser carry their own)
const DEMO_PO_SUPPLIER = { 'PO-2609-0020': 'Nabil Mobile House', 'PO-2609-0019': 'Dhaka Audio Imports', 'PO-2608-0017': 'Mim Enterprise', 'PO-2608-0015': 'Rahman Telecom' };
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
.sr-id{font-family:var(--font-data)}
.sr-idbtn{padding:0;border:0;background:none;font-size:inherit;cursor:pointer}
.sr-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.sr-strong{font-weight:var(--weight-medium);color:var(--text-heading)}
.sr-section{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sr-tw{overflow-x:auto}
.sr-tw .ix-table tbody tr{cursor:default}
.sr-tw .ix-table tbody tr:hover td{background:none}
.sr-tw .ix-table td:first-child{white-space:normal;min-width:180px}
.sr-tw--link .ix-table tbody tr{cursor:pointer}
.sr-tw--link .ix-table tbody tr:hover td{background:var(--surface-subtle)}
.sr-meta{margin:0;padding:0 var(--space-4) var(--space-2);font-size:var(--text-xs-plus);color:var(--text-muted)}
.sr-form{display:flex;flex-direction:column;gap:var(--space-4)}
.sr-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.sr-lines{margin:0;padding:0;list-style:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden}
.sr-lines li{display:flex;align-items:center;gap:var(--space-3);min-height:48px;padding:6px var(--space-3);border-top:1px solid var(--border-subtle)}
.sr-lines li:first-child{border-top:0}
.sr-lines label{display:flex;align-items:center;gap:var(--space-3);flex:1;min-width:0;cursor:pointer}
.sr-lines .gc-input{width:76px}
.sr-opts{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2)}
.sr-opt{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);cursor:pointer}
.sr-opt.is-on{border-color:var(--primary);background:var(--fill-primary-soft)}
.sr-opt b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.sr-opt small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.sr-total{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary);font-size:var(--text-sm)}
.sr-total b{font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
.sr-items{display:flex;flex-direction:column;gap:4px;margin:0;padding:0;list-style:none;font-size:var(--text-sm)}
@media (max-width:599px){.sr-two,.sr-opts{grid-template-columns:1fr}}
`;

export default function SupplierReturn() {
  const [db, setDb] = useState(demoDb);
  const [holds, setHolds] = useState([]);
  const [form, setForm] = useState(null);   // { sup, qty: { holdId: n }, reason, how, note, by }
  const [seen, setSeen] = useState(null);   // a return made, opened from the list
  const [buy, setBuy] = useState(null);     // { sup, bill, qty: { key: n }, reason, how, settle, from, note, by } — returning bought items
  const [rep, setRep] = useState({ place: STOCK_PLACES[0], by: EMPLOYEES[2].name });   // receiving a replacement
  const [places, setPlaces] = useState(STOCK_PLACES);

  const reload = () => { const d = getDb(), hs = getHolds(); setDb(d); setHolds(hs); return { d, hs }; };
  useEffect(() => {
    const { d, hs } = reload();
    setPlaces(getStockPlaces());
    // opened from Damaged & expired: start the return for that hold (or product) and quantity
    const q = new URLSearchParams(window.location.search);
    const holdId = q.get('hold'), product = q.get('product'), want = num(q.get('qty'));
    const supKey = q.get('supplier'), billNo = q.get('bill');
    if (supKey || billNo) {
      const bill = billNo ? d.bills.find((b) => b.no === billNo) : null;
      const sup = findSupplier(supKey || (bill ? bill.supplier : ''), d.suppliers);
      if (sup) openBuy(sup, bill ? bill.no : '', d);
      return;
    }
    if (!holdId && !product) return;
    const all = setAside(hs, d.suppliers);
    const h = all.find((x) => x.id === holdId) || all.find((x) => x.product === product && x.supName) || all.find((x) => x.product === product);
    if (!h) { toast(`No ${product || 'item'} is set aside at ${DAMAGED_PLACE} to return`, { tone: 'info' }); return; }
    const name = h.supName;
    const g = name ? groupOf(name, all.filter((x) => x.supName === name), d) : { ...groupOf('', [h], d), pick: true };
    const qty = Object.fromEntries(g.items.map((x) => [x.id, x.id === h.id ? Math.min(h.qty, want || h.qty) : 0]));
    setForm({ g, qty, reason: /^Wrong/.test(h.note || '') ? REASONS[1] : REASONS[0], how: 'pickup', settle: 'credit', note: '', by: EMPLOYEES[2].name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const open = (g) => setForm({ g, qty: Object.fromEntries(g.items.map((h) => [h.id, h.qty])), reason: /^Wrong/.test(g.items[0].note || '') ? REASONS[1] : REASONS[0], how: 'pickup', settle: 'credit', note: '', by: EMPLOYEES[2].name });
  // returning bought items: the supplier's bill lines, up to what was bought less what already went back
  function openBuy(sup, bill = '', d = db) { setBuy({ sup: sup ? sup.id : '', bill, qty: {}, reason: REASONS[0], how: 'send', settle: 'credit', from: STOCK_PLACES[0], note: '', by: EMPLOYEES[2].name }); }
  const buySup = buy && buy.sup ? findSupplier(buy.sup, db.suppliers) : null;
  const buyRows = buySup ? boughtFrom(buySup.id, db, buy.bill).filter((r) => r.left > 0) : [];
  const buyPicked = buy ? buyRows.filter((r) => num(buy.qty[r.key]) > 0).map((r) => ({ r, qty: Math.min(r.left, num(buy.qty[r.key])) })) : [];
  const buyValue = buyPicked.reduce((a, x) => a + x.qty * x.r.cost, 0);
  const buyPieces = buyPicked.reduce((a, x) => a + x.qty, 0);
  const saveBuy = (e) => {
    e.preventDefault();
    if (!buySup) { toast('Choose the supplier', { tone: 'error' }); return; }
    if (!buyPicked.length) { toast('Enter how many of an item go back', { tone: 'error' }); return; }
    const lines = buyPicked.map(({ r, qty }) => ({ name: r.name, sku: r.sku, qty, cost: r.cost, bill: buy.bill || r.bills[r.bills.length - 1] }));
    const { ret, credit: cn } = addSupplierReturn({ supplier: buySup.id, lines, reason: buy.reason, how: buy.how, settle: buy.settle, from: buy.from, note: buy.note.trim(), by: buy.by });
    lines.forEach((l) => addMove({ sku: l.sku || l.name, place: buy.from, qty: -l.qty, kind: 'supplier return', reason: `Returned to ${buySup.name} · ${buy.reason}`, by: buy.by, ref: ret.no }));
    reload(); setBuy(null);
    toast(`${ret.no}: ${plural(buyPieces, 'piece')} back to ${buySup.name}${cn ? ` · credit note ${cn.no} for ${formatBDT(cn.amount)}` : ' · replacement to come'}`);
  };
  // a replacement arrived: the pieces come back into stock at the chosen place, against the return's number
  const receiveRep = () => {
    const r = seen;
    r.lines.forEach((l) => addMove({ sku: l.sku || productBy(l.name)?.sku || l.name, place: rep.place, qty: l.qty, kind: 'receive', reason: `Replacement from ${supName(r.supplier)} for ${r.no}`, by: rep.by, ref: r.no }));
    receiveReplacement(r.no, { place: rep.place, by: rep.by });
    const { d } = reload();
    setSeen(d.returns.find((x) => x.no === r.no) || null);
    toast(`Replacement for ${r.no} received at ${rep.place}`);
  };
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
    const { ret, credit: cn } = addSupplierReturn({ supplier: g.sup ? g.sup.id : g.name, lines, reason: form.reason, how: form.how, settle: form.settle, note, by: form.by });
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
    toast(`${ret.no}: ${plural(pieces, 'piece')} back to ${g.name}${cn ? ` · credit note ${cn.no} for ${formatBDT(cn.amount)}` : form.settle === 'replace' ? ' · replacement to come' : ''}`);
  };

  const ledgerOf = (id) => `/supplier-detail?id=${encodeURIComponent(id)}`;

  return (
    <div className="dc-screen ds" data-screen="SupplierReturn">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="po-suppliers" />
        <main className="gc-shell__main">
          <Topbar crumb="Purchase › Suppliers & payables" page="Return goods to supplier" placeholder="Search or scan any barcode" />
          <div className="gc-shell__content">
            <div className="ix-page ix-page--narrow">
              <RecordHeader back="/suppliers" backLabel="Back to Suppliers & payables" title="Return goods to supplier"
                about="Send anything you bought back to its supplier, or the damaged and wrong items from deliveries that wait here. A return takes the pieces off stock and either lowers what you owe (credit note) or waits for a replacement."
                more={[{ label: 'Receive goods', href: '/receive-goods' }, { label: 'Suppliers & payables', href: '/suppliers' }]}
                primary={{ label: 'Return bought items', onClick: () => openBuy(null) }} />

              <MetricStrip label="Returns" items={[
                { label: 'Waiting to go back', value: plural(totalPieces, 'piece'), sub: plural(groups.length, 'supplier') },
                { label: 'Their value', value: formatBDT(totalValue), sub: 'at the order price' },
                { label: 'Returned this month', value: plural(thisMonth.length, 'return'), sub: plural(thisMonth.reduce((a, r) => a + r.lines.reduce((n, l) => n + l.qty, 0), 0), 'piece') },
                { label: 'Credit from returns', value: formatBDT(thisMonth.reduce((a, r) => a + r.value, 0)), sub: 'this month' },
              ]} />

              <h2 className="sr-section">Waiting to go back</h2>
              {groups.length === 0 ? (
                <section className="ix-card">
                  <div className="ix-empty"><EmptyState icon="package-check" title="Nothing is waiting to go back" /></div>
                </section>
              ) : groups.map((g) => (
                <section key={g.name} className="ix-card" aria-label={`Waiting to go back to ${g.name}`}>
                  <div className="ix-card__head">
                    <h2>{g.sup ? <Link href={ledgerOf(g.sup.id)}>{g.name}</Link> : g.name}</h2>
                    <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => open(g)}><Icon name="undo-2" width="16" height="16" aria-hidden="true" /><span>Create return</span></button>
                  </div>
                  <p className="sr-meta">{plural(g.pieces, 'piece')} · {formatBDT(g.value)} · you owe them {formatBDT(g.owe)}</p>
                  <div className="sr-tw">
                    <table className="ix-table">
                      <caption className="sr-only">Waiting to go back to {g.name}</caption>
                      <thead><tr><th scope="col">Product</th><th scope="col">From</th><th scope="col" className="ix-num">Pieces</th><th scope="col" className="ix-num">Value</th><th scope="col">Set aside</th></tr></thead>
                      <tbody>
                        {g.items.map((h) => (
                          <tr key={h.id}>
                            <td><span className="sr-strong">{h.product}</span></td>
                            <td>{h.po ? <span className="sr-id">{h.po}</span> : <span className="ix-muted">—</span>}</td>
                            <td className="ix-num">{h.qty}</td>
                            <td className="ix-num">{formatBDT(h.qty * h.cost)}</td>
                            <td className="ix-muted">{formatDate(h.at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ))}

              <section className="ix-card" aria-labelledby="sr-made">
                <div className="ix-card__head"><h2 id="sr-made">Returns made <InfoTip text="Each return took the pieces off stock and added a credit note to the supplier’s ledger." /></h2></div>
                {returns.length === 0 ? <div className="ix-empty"><EmptyState icon="undo-2" title="No returns yet" /></div> : (
                  <div className="sr-tw sr-tw--link">
                    <table className="ix-table">
                      <caption className="sr-only">Returns made</caption>
                      <thead><tr><th scope="col">Return</th><th scope="col">Date</th><th scope="col">Supplier</th><th scope="col">Reason</th><th scope="col" className="ix-num">Pieces</th><th scope="col">Settled</th><th scope="col" className="ix-num">Value</th></tr></thead>
                      <tbody>
                        {returns.map((r) => (
                          <tr key={r.no} onClick={(e) => { if (!e.target.closest('a,button')) setSeen(r); }}>
                            <td><button type="button" className="ix-strong sr-id sr-idbtn" onClick={() => setSeen(r)}>{r.no}</button></td>
                            <td className="ix-muted">{formatDate(r.at)}</td>
                            <td><Link href={ledgerOf(r.supplier)}>{supName(r.supplier)}</Link></td>
                            <td>{r.reason}</td>
                            <td className="ix-num">{r.lines.reduce((n, l) => n + l.qty, 0)}</td>
                            <td>{r.settle === 'replace' && !(r.replacement && r.replacement.status === 'received') ? <span className="gc-badge gc-badge--warning">{settleText(r)}</span> : settleText(r)}</td>
                            <td className="ix-num">{formatBDT(r.value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={!!seen} title={seen ? seen.no : 'Return'} onClose={() => setSeen(null)} width={480}>
        {seen ? (
          <div className="sr-form">
            <ul className="sr-items" aria-label="Items">{seen.lines.map((l) => <li key={l.holdId + l.name}>{l.qty} × {l.name}{l.po ? <span className="sr-sub sr-id">{l.po}</span> : null}</li>)}</ul>
            <KV rows={[
              ['Date', formatDate(seen.at)],
              ['Supplier', supName(seen.supplier)],
              ['Reason', seen.reason],
              ['How', HOW_LABEL[seen.how]],
              seen.note ? ['Note', seen.note] : null,
              ['Handled by', seen.by],
              seen.settle === 'replace' ? ['Settled', settleText(seen) + (seen.replacement && seen.replacement.at ? ' · ' + formatDate(seen.replacement.at) + ' at ' + seen.replacement.place : '')] : ['Credit note', <span key="cn"><span className="sr-id">{seen.credit || '—'}</span> · {formatBDT(seen.value)}</span>],
            ]} />
            {seen.settle === 'replace' && seen.replacement && seen.replacement.status !== 'received' ? (
              <div className="sr-form" style={{ gap: 'var(--space-3)' }}>
                <h3 className="sr-section">Receive the replacement</h3>
                <div className="sr-two">
                  <div><label className="gc-label" htmlFor="sr-rep-place">Put it at</label><select id="sr-rep-place" className="gc-input gc-select" value={rep.place} onChange={(e) => setRep({ ...rep, place: e.target.value })}>{places.map((p) => <option key={p}>{p}</option>)}</select></div>
                  <div><label className="gc-label" htmlFor="sr-rep-by">Received by</label><select id="sr-rep-by" className="gc-input gc-select" value={rep.by} onChange={(e) => setRep({ ...rep, by: e.target.value })}>{EMPLOYEES.map((m) => <option key={m.name}>{m.name}</option>)}</select></div>
                </div>
                <span><button type="button" className="gc-btn gc-btn--solid" onClick={receiveRep}><Icon name="package-check" width="16" height="16" aria-hidden="true" />Receive {plural(seen.lines.reduce((n, l) => n + l.qty, 0), 'piece')}</button></span>
              </div>
            ) : null}
          </div>
        ) : null}
      </Dialog>

      <Dialog open={!!buy} title={buySup ? `Return to ${buySup.name}` : 'Return bought items'} onClose={() => setBuy(null)} width={620}>
        {buy ? (
          <form className="sr-form" onSubmit={saveBuy}>
            <div className="sr-two">
              <div><label className="gc-label" htmlFor="sr-b-sup">Supplier *</label><select id="sr-b-sup" className="gc-input gc-select" aria-required="true" value={buy.sup} onChange={(e) => setBuy({ ...buy, sup: e.target.value, bill: '', qty: {} })}><option value="">Choose a supplier</option>{db.suppliers.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
              <div><label className="gc-label" htmlFor="sr-b-bill">From bill</label><select id="sr-b-bill" className="gc-input gc-select" value={buy.bill} disabled={!buySup} onChange={(e) => setBuy({ ...buy, bill: e.target.value, qty: {} })}><option value="">Any bill</option>{buySup ? db.bills.filter((b) => b.supplier === buySup.id && (b.lines || []).length).sort((a, b) => b.at - a.at).map((b) => <option key={b.no} value={b.no}>{b.no} · {formatDate(b.at)}</option>) : null}</select></div>
            </div>
            {!buySup ? <p className="gc-help" style={{ margin: 0 }}>Choose who the goods go back to. Everything you bought from them is listed.</p> : buyRows.length === 0 ? <p className="gc-help" style={{ margin: 0 }}>Nothing left to return: every item on {buy.bill || 'their bills'} has gone back already, or the bills have no item lines.</p> : (
              <ul className="sr-lines" aria-label="Items bought">
                {buyRows.map((r) => (
                  <li key={r.key}>
                    <span style={{ flex: 1, minWidth: 0 }}><span className="sr-strong">{r.name}</span><span className="sr-sub">{r.bought} bought{r.returned ? ` · ${r.returned} returned` : ''} · {formatBDT(r.cost)} each · {r.bills.slice(-2).join(', ')}</span></span>
                    <input className="gc-input" type="number" min="0" max={r.left} inputMode="numeric" placeholder="0" aria-label={`Pieces of ${r.name} going back, up to ${r.left}`} value={buy.qty[r.key] || ''} onChange={(e) => setBuy({ ...buy, qty: { ...buy.qty, [r.key]: Math.min(r.left, num(e.target.value)) } })} />
                  </li>
                ))}
              </ul>
            )}
            <div className="sr-two">
              <div><label className="gc-label" htmlFor="sr-b-from">Take from</label><select id="sr-b-from" className="gc-input gc-select" value={buy.from} onChange={(e) => setBuy({ ...buy, from: e.target.value })}>{places.map((p) => <option key={p}>{p}</option>)}</select></div>
              <div><label className="gc-label" htmlFor="sr-b-reason">Reason</label><select id="sr-b-reason" className="gc-input gc-select" value={buy.reason} onChange={(e) => setBuy({ ...buy, reason: e.target.value })}>{REASONS.map((x) => <option key={x}>{x}</option>)}</select></div>
            </div>
            <div className="sr-opts" role="radiogroup" aria-label="How the supplier settles it">
              {SETTLE.map(([k, label, sub]) => (
                <label key={k} className={'sr-opt' + (buy.settle === k ? ' is-on' : '')}>
                  <input type="radio" name="sr-b-settle" checked={buy.settle === k} onChange={() => setBuy({ ...buy, settle: k })} />
                  <span><b>{label}</b><small>{sub}</small></span>
                </label>
              ))}
            </div>
            <div className="sr-two">
              <div><label className="gc-label" htmlFor="sr-b-how">How they go back</label><select id="sr-b-how" className="gc-input gc-select" value={buy.how} onChange={(e) => setBuy({ ...buy, how: e.target.value })}>{HOW.map(([k, label]) => <option key={k} value={k}>{label}</option>)}</select></div>
              <div><label className="gc-label" htmlFor="sr-b-by">Handled by</label><select id="sr-b-by" className="gc-input gc-select" value={buy.by} onChange={(e) => setBuy({ ...buy, by: e.target.value })}>{EMPLOYEES.map((m) => <option key={m.name}>{m.name}</option>)}</select></div>
            </div>
            <div><label className="gc-label" htmlFor="sr-b-note">Note</label><textarea id="sr-b-note" className="gc-input" rows="2" placeholder="For example: 2 screens dead out of the box" value={buy.note} onChange={(e) => setBuy({ ...buy, note: e.target.value })} /></div>
            <div className="sr-total" role="status"><span>{plural(buyPieces, 'piece')}{buySup && buy.settle === 'credit' ? ` · you will owe ${buySup.name} ${formatBDT(Math.max(0, payableOf(buySup.id, db) - buyValue))}` : ''}</span><b>{buy.settle === 'replace' ? 'Replacement' : formatBDT(buyValue) + ' credit'}</b></div>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setBuy(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid" disabled={!buyPieces}>Return {plural(buyPieces, 'piece')}</button></div>
          </form>
        ) : null}
      </Dialog>

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
            <div className="sr-opts" role="radiogroup" aria-label="How the supplier settles it">
              {SETTLE.map(([k, label, sub]) => (
                <label key={k} className={'sr-opt' + (form.settle === k ? ' is-on' : '')}>
                  <input type="radio" name="sr-settle" checked={form.settle === k} onChange={() => setForm({ ...form, settle: k })} />
                  <span><b>{label}</b><small>{sub}</small></span>
                </label>
              ))}
            </div>
            <div><label className="gc-label" htmlFor="sr-note">Note</label><textarea id="sr-note" className="gc-input" rows="2" placeholder="For example: 2 chargers are 18W instead of 20W" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
            <div className="sr-total" role="status"><span>{plural(pieces, 'piece')}{form.g.name && form.settle !== 'replace' ? ` · you will owe ${form.g.name} ${formatBDT(Math.max(0, form.g.owe - credit))}` : ''}</span><b>{form.settle === 'replace' ? 'Replacement' : formatBDT(credit) + ' credit'}</b></div>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setForm(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid" disabled={!pieces}>Return {plural(pieces, 'piece')}</button></div>
          </form>
        ) : null}
      </Dialog>
    </div>
  );
}
