'use client';
// SalesOrder — Create order's sales-order mode for wholesale buyers (WH-F2): an order taken at the office desk, by
// phone or WhatsApp, instead of at the POS register. Opened from Wholesale orders (New sales order) and from Create
// order when the customer picked is a wholesale buyer (?buyer=<phone>&items=SKU:qty,…).
//   buyer      a wholesale buyer (or a company that buys wholesale): their price list, payment terms, credit and dues
//   products   priced by the one price rule (wholesalePrice.js › priceFor: price list, quantity slabs, wholesale price,
//              group price); "Wholesale only" products can be added; MOQ and free stock per line; a price typed by
//              hand is kept and shown against the list price
//   payment    on account (an unpaid invoice due by the buyer's terms), advance now, or paid in full
//   goods      hold the stock at a place until it is delivered, or deliver now (the invoice opens on its delivery,
//              where the IMEI / serial numbers are taken and the challan is printed)
// The same checks as the POS (salesOrder.js › checkSale): credit limit and overdue hold (a manager's PIN), the
// buyer's restrictions, MOQ, free stock. Booked by salesOrder.js › makeSale: order + invoice + stock holds.
// Front end only (browser storage), like the rest of the demo.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { Sidebar, Topbar } from '@/shell/Shell';
import { EmptyState } from '@/components/ui';
import { RecordHeader, KV } from '@/components/ui/IndexKit';
import { ManagerPin } from '@/components/ManagerPin';
import { formatBDT, formatDate } from '@/lib/format';
import { orderableItems } from '@/lib/sellable';
import { phoneDigits } from '@/lib/customers';
import { usePlaceList } from '@/lib/usePlaces';
import { onlinePlace } from '@/lib/locations';
import { currentUser } from '@/lib/team';
import { useWholesale } from '@/lib/useWholesale';
import { creditCheck, pricingLabel, SOURCE_WORDS } from '@/lib/wholesalePrice';
import { termsOf, dueByTerms } from '@/lib/buyerTerms';
import { getInvoices, recordPayment } from '@/lib/invoices';
import { businessBuyers, buyerOfQuote, linePrice, checkSale, makeSale } from '@/lib/salesOrder';

const METHODS = ['Cash', 'bKash', 'Nagad', 'Bank transfer', 'Card'];
const PAY = [['account', 'On account', 'Unpaid invoice, due by the buyer’s terms'], ['advance', 'Advance now', 'Part now, the rest on terms'], ['full', 'Paid in full', 'Paid now']];
const GOODS = [['hold', 'Hold the stock', 'Goods wait at the place until delivered'], ['now', 'Deliver now', 'Opens the delivery: serial numbers and challan']];
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

const CSS = `
.so-card--items{overflow:visible}
.so-search{position:relative}
.so-pop{position:absolute;left:0;right:0;top:calc(100% + 4px);z-index:20;max-height:280px;overflow:auto;margin:0;padding:4px;list-style:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);box-shadow:var(--shadow-lg)}
.so-pop button{display:flex;align-items:center;gap:var(--space-3);width:100%;min-height:40px;padding:4px var(--space-2);border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-sm);text-align:left;color:var(--text-heading);cursor:pointer}
.so-pop button:hover,.so-pop button:focus-visible{background:var(--surface-subtle)}
.so-pop small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.so-pop .so-amt{margin-left:auto;font-variant-numeric:tabular-nums;white-space:nowrap}
.so-lines{width:100%;margin-top:var(--space-3);border-collapse:collapse;font-size:var(--text-sm)}
.so-lines th{height:32px;padding:0 var(--space-2) 0 0;border-bottom:1px solid var(--border-subtle);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:left}
.so-lines td{padding:var(--space-2) var(--space-2) var(--space-2) 0;border-bottom:1px solid var(--border-subtle);vertical-align:top}
.so-lines .r{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.so-lines input{width:84px;height:32px}
.so-lines b{font-weight:var(--weight-medium);color:var(--text-heading)}
.so-lines small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.so-lines small.is-warn{color:var(--text-warning)}
.so-lines small.is-bad{color:var(--text-danger)}
.so-sum{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:var(--space-2) var(--space-3);align-items:center;font-size:var(--text-sm)}
.so-sum .v{text-align:right;font-variant-numeric:tabular-nums;color:var(--text-heading)}
.so-sum input{width:96px;height:32px;text-align:right}
.so-total{grid-column:1/-1;display:flex;justify-content:space-between;padding-top:var(--space-2);border-top:1px solid var(--border-subtle);font-weight:var(--weight-semibold);color:var(--text-heading)}
.so-opts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-2);margin:var(--space-4) 0 0;padding:0;border:0;min-width:0}
.so-opts--2{grid-template-columns:minmax(0,1fr)}
.so-radio{display:flex;align-items:flex-start;gap:var(--space-2);padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-size:var(--text-sm);cursor:pointer}
.so-radio:has(input:checked){border-color:var(--primary);background:var(--fill-primary-soft)}
.so-radio input{margin-top:3px;accent-color:var(--primary)}
.so-radio b{display:block;font-weight:var(--weight-medium);color:var(--text-heading)}
.so-radio small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.so-row{display:flex;flex-wrap:wrap;gap:var(--space-3);margin-top:var(--space-3)}
.so-row>div{flex:1 1 160px}
.so-checks{display:flex;flex-direction:column;gap:6px;margin:var(--space-4) 0 0;padding:var(--space-3);list-style:none;border-radius:var(--radius-lg);font-size:var(--text-sm)}
.so-checks.is-bad{background:var(--fill-danger-soft);color:var(--text-danger)}
.so-checks.is-warn{background:var(--fill-warning-soft);color:var(--text-warning)}
.so-checks li{display:flex;gap:8px;align-items:flex-start}
.so-checks svg{flex:none;margin-top:2px}
.so-foot{display:flex;justify-content:flex-end;gap:var(--space-2);margin-top:var(--space-4);padding-top:var(--space-3);border-top:1px solid var(--border-subtle)}
.so-empty{margin:var(--space-3) 0 0;padding:var(--space-5);border:1px dashed var(--border-strong);border-radius:var(--radius-lg);text-align:center;font-size:var(--text-sm);color:var(--text-muted)}
@media (max-width:640px){.so-opts{grid-template-columns:minmax(0,1fr)}.so-lines input{width:64px}}
`;

export default function SalesOrder() {
  const ws = useWholesale();
  const places = usePlaceList('stock');
  const [ready, setReady] = useState(false);
  const [buyers, setBuyers] = useState([]);
  const [key, setKey] = useState('');
  const [place, setPlace] = useState('Central Warehouse');
  const [lines, setLines] = useState([]);       // [{ sku, name, qty, price, listPrice, manual }]
  const [query, setQuery] = useState('');
  const [discount, setDiscount] = useState('');
  const [vatRate, setVatRate] = useState('5');
  const [pay, setPay] = useState('account');
  const [advance, setAdvance] = useState('');
  const [method, setMethod] = useState('Cash');
  const [goods, setGoods] = useState('hold');
  const [note, setNote] = useState('');
  const [pin, setPin] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    const list = businessBuyers().filter((b) => b.kind !== 'lead' && (b.types || []).includes('Wholesale'));
    setBuyers(list);
    setPlace(onlinePlace());
    const p = new URLSearchParams(window.location.search);
    const ref = p.get('buyer');
    const hit = ref ? list.find((b) => b.id === ref || phoneDigits(b.phone) === phoneDigits(ref)) : null;
    if (hit) setKey(hit.key);
    // items handed over from Create order: SKU:qty,SKU:qty
    const items = (p.get('items') || '').split(',').map((x) => x.split(':')).filter(([s]) => s);
    if (items.length) setLines(items.map(([sku, qty]) => ({ sku, name: sku, qty: Math.max(1, Number(qty) || 1) })));
    setReady(true);
  }, []);

  const buyer = buyers.find((b) => b.key === key) || null;
  const catalog = useMemo(() => (ready && ws ? orderableItems({ channel: 'wholesale', place }) : []), [ready, ws, place]);
  // every line priced by the one price rule for this buyer, unless its price was typed by hand
  const priced = useMemo(() => lines.map((l) => {
    const p = linePrice(buyer, l.sku, Number(l.qty) || 1);
    const it = catalog.find((x) => x.sku === l.sku);
    return { ...l, name: it ? it.name : l.name, price: l.manual ? Number(l.price) || 0 : p.price, listPrice: p.listPrice, info: p };
  }), [lines, buyer, catalog]);
  const gross = r2(priced.reduce((s, l) => s + l.price * (Number(l.qty) || 0), 0));
  const disc = Math.min(gross, Math.max(0, Number(discount) || 0));
  const tax = r2((gross - disc) * (Number(vatRate) || 0) / 100);
  const total = r2(gross - disc + tax);
  const paidNow = pay === 'full' ? total : pay === 'advance' ? Math.min(total, Math.max(0, Number(advance) || 0)) : 0;
  const unpaid = r2(total - paidNow);
  const terms = buyer ? termsOf(buyerOfQuote(buyer)) : null;
  const credit = buyer ? creditCheck(buyerOfQuote(buyer), 0) : null;
  const check = buyer && priced.length ? checkSale({ customer: buyer, lines: priced, unpaid, place, wholesale: true }) : null;
  const dueAt = buyer ? dueByTerms(buyerOfQuote(buyer), Date.now()) : null;

  const needle = query.trim().toLowerCase();
  const hits = needle ? catalog.filter((it) => (it.name + ' ' + it.sku + ' ' + it.barcode).toLowerCase().includes(needle)).slice(0, 12) : [];
  const add = (it) => {
    const moq = Number(linePrice(buyer, it.sku, 1).moq) || 0;
    setLines((cur) => (cur.some((l) => l.sku === it.sku) ? cur.map((l) => (l.sku === it.sku ? { ...l, qty: (Number(l.qty) || 0) + 1 } : l)) : [...cur, { sku: it.sku, name: it.name, qty: Math.max(1, moq) }]));
    setQuery('');
  };
  const setLine = (sku, patch) => setLines((cur) => cur.map((l) => (l.sku === sku ? { ...l, ...patch } : l)));

  const create = (approvedBy = '') => {
    if (busy.current) return;
    if (!buyer) { toast('Choose the buyer', { tone: 'error' }); return; }
    if (!priced.some((l) => Number(l.qty) > 0)) { toast('Add at least one product', { tone: 'error' }); return; }
    if (pay === 'advance' && !(paidNow > 0 && paidNow < total)) { toast(`Enter an advance between ৳1 and ${formatBDT(total - 1)}`, { tone: 'error' }); return; }
    if (!check.ok) { toast(check.blocks[0], { tone: 'error' }); return; }
    if (check.needPin && !approvedBy) { setPin(true); return; }
    busy.current = true;
    const by = (currentUser() || {}).name || 'Staff';
    const r = makeSale({ customer: buyer, lines: priced.map(({ info, manual, ...l }) => l), discount: disc, vatRate, note: note.trim(), place, by, approvedBy, dueAt: dueAt || undefined, label: 'Sales order' });
    setPin(false);
    if (!r.ok) { busy.current = false; toast(r.error, { tone: 'error' }); return; }
    // money taken now goes on the invoice as its first payment (and into the method's account)
    if (paidNow > 0) { const inv = getInvoices().find((x) => x.id === r.invoiceId); if (inv) recordPayment(inv, method, paidNow, by); }
    toast(`Sales order ${r.orderId} made · invoice ${r.invoiceId}${unpaid > 0 ? ' · ' + formatBDT(unpaid) + ' on account' : ''}`);
    navigate('/sales-invoice?id=' + encodeURIComponent(r.invoiceId) + (goods === 'now' ? '&deliver=1' : ''));
  };

  const body = !ready ? null : !ws ? (
    <EmptyState icon="truck" title="Wholesale is off in this system" body="Sales orders are for wholesale buyers." />
  ) : (
    <div className="ix-record">
      <div className="ix-main">
        <section className="ix-card" aria-labelledby="so-buyer-h">
          <header className="ix-card__head"><h2 id="so-buyer-h">Buyer</h2></header>
          <div className="ix-card__body">
            <label className="gc-label" htmlFor="so-buyer">Wholesale buyer</label>
            <select id="so-buyer" className="gc-input gc-select" value={key} onChange={(e) => setKey(e.target.value)} autoFocus>
              <option value="">Choose buyer</option>
              {buyers.map((b) => <option key={b.key} value={b.key}>{b.label}</option>)}
            </select>
            {buyer ? (
              <div style={{ marginTop: 'var(--space-3)' }}>
                <KV rows={[
                  ['Prices', pricingLabel(buyerOfQuote(buyer)) || 'Retail prices'],
                  ['Payment terms', terms ? terms.label : 'Pay on the invoice'],
                  ['Credit limit', credit && credit.limit ? formatBDT(credit.limit) : 'No limit'],
                  ['Owes now', credit ? formatBDT(credit.owed) : '—'],
                ]} />
              </div>
            ) : null}
          </div>
        </section>

        <section className="ix-card so-card--items" aria-labelledby="so-items-h">
          <header className="ix-card__head"><h2 id="so-items-h">Products</h2></header>
          <div className="ix-card__body">
            <div className="so-search">
              <label className="ix-search"><Icon name="search" width="16" height="16" aria-hidden="true" /><input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Product name, SKU or barcode" aria-label="Search products" /></label>
              {hits.length ? (
                <ul className="so-pop" role="listbox" aria-label="Matching products">
                  {hits.map((it) => { const p = linePrice(buyer, it.sku, 1); return (
                    <li key={it.sku}><button type="button" role="option" aria-selected="false" onClick={() => add(it)}>
                      <span><span>{it.name}</span><small>{it.sku} · {it.stock} free{p.moq ? ' · MOQ ' + p.moq : ''}</small></span>
                      <span className="so-amt">{formatBDT(p.price)}</span>
                    </button></li>
                  ); })}
                </ul>
              ) : null}
            </div>
            {!priced.length ? <p className="so-empty">No products yet. Search to add one.</p> : (
              <div className="gc-table-wrap">
                <table className="so-lines">
                  <caption className="sr-only">Products in this sales order</caption>
                  <thead><tr><th scope="col">Product</th><th scope="col">Qty</th><th scope="col">Price</th><th scope="col" className="r">Amount</th><th scope="col"><span className="sr-only">Remove</span></th></tr></thead>
                  <tbody>{priced.map((l, i) => {
                    const ln = check && check.lines[i];
                    const moq = l.info.moq || 0;
                    return (
                      <tr key={l.sku}>
                        <td><b>{l.name}</b>
                          {l.manual ? <small>Price typed by hand · list {formatBDT(l.info.price)}</small> : <small>{l.info.note || SOURCE_WORDS[l.info.source]}</small>}
                          {moq ? <small className={Number(l.qty) < moq ? 'is-warn' : ''}>{Number(l.qty) < moq ? `MOQ ${moq} · only ${Number(l.qty) || 0}` : `MOQ ${moq}`}</small> : null}
                          {ln && ln.free != null ? <small className={ln.short ? 'is-bad' : ''}>{Math.max(0, ln.free)} free at {place}</small> : null}
                        </td>
                        <td><input className="gc-input" type="number" min="1" inputMode="numeric" aria-label={'Quantity: ' + l.name} value={l.qty} onChange={(e) => setLine(l.sku, { qty: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)) })} /></td>
                        <td><input className="gc-input" type="number" min="0" inputMode="numeric" aria-label={'Price: ' + l.name} value={l.price} onChange={(e) => setLine(l.sku, { price: e.target.value, manual: true })} /></td>
                        <td className="r">{formatBDT(l.price * (Number(l.qty) || 0))}</td>
                        <td className="r"><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={'Remove ' + l.name} onClick={() => setLines((cur) => cur.filter((x) => x.sku !== l.sku))}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button></td>
                      </tr>
                    );
                  })}</tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="ix-card" aria-labelledby="so-pay-h">
          <header className="ix-card__head"><h2 id="so-pay-h">Payment</h2></header>
          <div className="ix-card__body">
            <div className="so-sum">
              <span>Subtotal</span><span className="v">{formatBDT(gross)}</span>
              <label htmlFor="so-disc">Discount (৳)</label><input id="so-disc" className="gc-input" type="number" min="0" inputMode="numeric" value={discount} onChange={(e) => setDiscount(e.target.value)} />
              <label htmlFor="so-vat">VAT (%)</label><input id="so-vat" className="gc-input" type="number" min="0" inputMode="decimal" value={vatRate} onChange={(e) => setVatRate(e.target.value)} />
              <span>VAT</span><span className="v">{formatBDT(tax)}</span>
              <div className="so-total"><span>Total</span><span>{formatBDT(total)}</span></div>
            </div>
            <fieldset className="so-opts">
              <legend className="sr-only">Payment</legend>
              {PAY.map(([k, label, sub]) => <label key={k} className="so-radio"><input type="radio" name="so-pay" checked={pay === k} onChange={() => setPay(k)} /><span><b>{label}</b><small>{k === 'account' && dueAt ? 'Due ' + formatDate(dueAt) + (terms ? ' · ' + terms.terms : '') : sub}</small></span></label>)}
            </fieldset>
            {pay !== 'account' ? (
              <div className="so-row">
                {pay === 'advance' ? <div><label className="gc-label" htmlFor="so-adv">Advance received (৳)</label><input id="so-adv" className="gc-input" type="number" min="1" inputMode="numeric" value={advance} onChange={(e) => setAdvance(e.target.value)} /></div> : null}
                <div><label className="gc-label" htmlFor="so-method">Paid by</label><select id="so-method" className="gc-input gc-select" value={method} onChange={(e) => setMethod(e.target.value)}>{METHODS.map((m) => <option key={m}>{m}</option>)}</select></div>
              </div>
            ) : null}
            {check ? (
              check.blocks.length ? <ul className="so-checks is-bad" role="alert" aria-label="Can't create yet">{check.blocks.map((x, i) => <li key={i}><Icon name="circle-x" width="16" height="16" aria-hidden="true" />{x}</li>)}</ul>
                : check.needPin || check.warnings.length ? <ul className="so-checks is-warn" aria-label="Check before creating">{check.needPin ? <li><Icon name="lock" width="16" height="16" aria-hidden="true" />{check.pinReason} A manager approves with their PIN.</li> : null}{check.warnings.map((x, i) => <li key={i}><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" />{x}</li>)}</ul> : null
            ) : null}
            <div className="so-foot">
              <Link href="/wholesale-orders" className="gc-btn gc-btn--neutral">Cancel</Link>
              <button type="button" className="gc-btn gc-btn--solid" disabled={!!check && !check.ok} onClick={() => create()}>{check && check.needPin ? 'Create · manager PIN' : 'Create sales order'}</button>
            </div>
          </div>
        </section>
      </div>

      <div className="ix-side">
        <section className="ix-card" aria-labelledby="so-goods-h">
          <header className="ix-card__head"><h2 id="so-goods-h">Goods</h2></header>
          <div className="ix-card__body">
            <label className="gc-label" htmlFor="so-place">From</label>
            <select id="so-place" className="gc-input gc-select" value={place} onChange={(e) => setPlace(e.target.value)}>{places.map((x) => <option key={x}>{x}</option>)}</select>
            <fieldset className="so-opts so-opts--2">
              <legend className="sr-only">Goods</legend>
              {GOODS.map(([k, label, sub]) => <label key={k} className="so-radio"><input type="radio" name="so-goods" checked={goods === k} onChange={() => setGoods(k)} /><span><b>{label}</b><small>{sub}</small></span></label>)}
            </fieldset>
          </div>
        </section>
        <section className="ix-card" aria-labelledby="so-note-h">
          <header className="ix-card__head"><h2 id="so-note-h">Note</h2></header>
          <div className="ix-card__body"><textarea className="gc-input" rows="3" aria-labelledby="so-note-h" placeholder="Printed on the invoice" value={note} onChange={(e) => setNote(e.target.value)} /></div>
        </section>
      </div>
    </div>
  );

  return (
    <div className="dc-screen ds" data-screen="SalesOrder">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="orders-sales-new" />
        <main className="gc-shell__main">
          <Topbar crumb="Orders" page="New sales order" />
          <div className="gc-shell__content">
            <div className="ix-page ix-page--narrow">
              <RecordHeader back="/wholesale-orders" backLabel="Back to wholesale orders" title="New sales order"
                about="An order taken at the desk for a wholesale buyer: their prices, MOQ and credit are checked, the goods are held or delivered now, and the invoice is due by their payment terms." />
              {body}
            </div>
          </div>
        </main>
      </div>
      <ManagerPin open={pin} reason={check ? check.pinReason : ''} action="Credit limit" amount={unpaid} onApprove={(who) => create(who)} onClose={() => setPin(false)} />
    </div>
  );
}
