'use client';
// BuyGoods — New purchase (/buy-goods): the merchant buys from a supplier, pays in full, in part or later, takes the
// goods and enters it here in one step. No purchase order, no receiving report, no damage or exchange at receiving.
// Save: stock comes in at the place (the one place in a one-place shop) as 'receive' moves, a supplier bill with the
// due date for what is left (supplierBills.addBill), the payment from the chosen account (paySupplier → ledger), the
// latest buying price per product (productCost.setBuyingPrice) and expiry dates (batches.addBatches).
// Text stays short (Shopify style).

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { Sidebar, Topbar } from '@/shell/Shell';
import { PhoneActionBar } from '@/components/ui';
import { RecordHeader, KV } from '@/components/ui/IndexKit';
import { formatBDT } from '@/lib/format';
import { getSuppliers, ensureSupplier, findSupplier, addBill, paySupplier, DEFAULT_TERMS, dayStart } from '@/lib/supplierBills';
import { searchProducts, addMove } from '@/lib/stock';
import { productCostOf, setBuyingPrice } from '@/lib/productCost';
import { accountsForMethod, balanceOf, getEntries } from '@/lib/ledger';
import { getReceivingPlaces, onlinePlace } from '@/lib/locations';
import { getStockSetup } from '@/lib/stockSetup';
import { addBatches } from '@/lib/batches';

const DAY = 864e5;
const METHODS = ['Cash', 'bKash', 'Nagad', 'Bank'];
const money = (n) => formatBDT(Math.round(Number(n) || 0));
const iso = (t) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const fromIso = (s) => { const [y, m, d] = String(s).split('-').map(Number); return y ? new Date(y, m - 1, d, 12).getTime() : null; };

const CSS = `
.bg-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.bg-body{display:flex;flex-direction:column;gap:var(--space-3)}
.bg-find{position:relative}
.bg-hits{position:absolute;z-index:5;left:0;right:0;top:calc(100% + 4px);margin:0;padding:var(--space-1);list-style:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);box-shadow:var(--shadow-lg)}
.bg-hits button{display:flex;justify-content:space-between;gap:var(--space-3);width:100%;min-height:36px;padding:0 var(--space-3);border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-sm);text-align:left;cursor:pointer;color:var(--text-heading)}
.bg-hits button:hover,.bg-hits button:focus-visible{background:var(--surface-subtle)}
.bg-hits small{color:var(--text-muted);font-family:var(--font-data)}
.bg-lines{display:flex;flex-direction:column}
.bg-line{display:grid;grid-template-columns:minmax(0,1fr) 72px 104px 140px auto 32px;gap:var(--space-2);align-items:end;padding:var(--space-2) 0;border-top:1px solid var(--border-subtle)}
.bg-line:first-child{border-top:0}
.bg-name{display:flex;flex-direction:column;min-width:0;align-self:center}
.bg-name b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bg-name small{font-size:var(--text-xs);color:var(--text-muted);font-family:var(--font-data)}
.bg-amt{font-family:var(--font-data);font-size:var(--text-sm);color:var(--text-heading);text-align:right;white-space:nowrap;align-self:center;min-width:72px}
.bg-x{align-self:center}
.bg-seg{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.bg-seg button{flex:1 1 0;min-width:72px;height:32px;padding:0 var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs-plus);cursor:pointer}
.bg-seg button[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary);font-weight:var(--weight-medium)}
.bg-check{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-body);cursor:pointer}
.bg-check input{width:16px;height:16px;accent-color:var(--primary)}
.bg-err{margin:0;font-size:var(--text-xs);color:var(--text-danger)}
.bg-total dd{font-weight:var(--weight-semibold)}
@media (max-width:640px){
  .bg-two{grid-template-columns:minmax(0,1fr)}
  .bg-line{grid-template-columns:minmax(0,1fr) minmax(0,1fr) 36px;row-gap:var(--space-2)}
  .bg-name{grid-column:1 / 3}
  .bg-line .bg-x{grid-column:3;grid-row:1}
  .bg-line .bg-amt{grid-column:1 / -1;text-align:left}
  .bg-seg button{height:36px}
}
`;

export default function BuyGoods() {
  const [ready, setReady] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [sup, setSup] = useState('');            // supplier id, or 'new'
  const [supName, setSupName] = useState('');
  const [invoice, setInvoice] = useState('');
  const [date, setDate] = useState(iso(Date.now()));
  const [find, setFind] = useState('');
  const [lines, setLines] = useState([]);        // { key, sku, name, qty, cost, expiry }
  const [extra, setExtra] = useState('');
  const [discount, setDiscount] = useState('');
  const [payWhen, setPayWhen] = useState('full'); // full | part | later
  const [paidNow, setPaidNow] = useState('');
  const [method, setMethod] = useState('Cash');
  const [account, setAccount] = useState('');
  const [due, setDue] = useState('');
  const [place, setPlace] = useState('Central Warehouse');
  const [places, setPlaces] = useState([]);
  const [returnable, setReturnable] = useState(true);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    setSuppliers(getSuppliers());
    const s = getStockSetup();
    setReturnable(s.supplierChanges !== false);
    setPlace(onlinePlace()); setPlaces(getReceivingPlaces());
    const a = accountsForMethod('Cash')[0]; setAccount(a ? a.id : '');
    setReady(true);
  }, []);

  const supplier = sup && sup !== 'new' ? findSupplier(sup, suppliers) : null;
  const terms = supplier ? supplier.terms ?? DEFAULT_TERMS : DEFAULT_TERMS;
  useEffect(() => { setDue(iso(dayStart(fromIso(date) || Date.now()) + terms * DAY)); }, [sup, date, terms]);

  const hits = useMemo(() => (find.trim().length >= 1 ? searchProducts(find).slice(0, 6) : []), [find]);
  const addLine = (p) => {
    setFind('');
    if (lines.some((l) => l.sku === p.sku)) { setLines(lines.map((l) => (l.sku === p.sku ? { ...l, qty: String((Number(l.qty) || 0) + 1) } : l))); return; }
    setLines([...lines, { key: p.sku + Date.now(), sku: p.sku, name: p.name, qty: '1', cost: String(Math.round(productCostOf(p.sku) || productCostOf(p.name) || 0)), expiry: '' }]);
  };
  const setLine = (key, patch) => setLines(lines.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const itemsTotal = lines.reduce((a, l) => a + (Number(l.qty) || 0) * (Number(l.cost) || 0), 0);
  const total = Math.max(0, Math.round(itemsTotal + (Number(extra) || 0) - (Number(discount) || 0)));
  const paid = payWhen === 'full' ? total : payWhen === 'part' ? Math.round(Number(paidNow) || 0) : 0;
  const left = Math.max(0, total - paid);
  const entries = ready ? getEntries() : [];
  const accounts = ready ? accountsForMethod(method).map((a) => ({ ...a, balance: balanceOf(a.id, entries) })) : [];

  const errs = {};
  if (!sup || (sup === 'new' && !supName.trim())) errs.sup = 'Choose a supplier.';
  if (!lines.length) errs.lines = 'Add at least one product.';
  else if (lines.some((l) => !(Number(l.qty) > 0) || !(Number(l.cost) > 0))) errs.lines = 'Enter quantity and price for every product.';
  if (payWhen === 'part' && !(paid > 0 && paid < total)) errs.paid = `Enter an amount below ${money(total)}.`;
  if (paid > 0 && !account) errs.account = 'Choose where the money is paid from.';
  if (left > 0 && !fromIso(due)) errs.due = 'Choose a date.';
  const ok = !Object.keys(errs).length;

  const save = () => {
    setTried(true);
    if (!ok) { toast(Object.values(errs)[0], { tone: 'error' }); return; }
    const s = sup === 'new' ? ensureSupplier(supName.trim()) : supplier;
    const at = fromIso(date) || Date.now();
    const clean = lines.map((l) => ({ sku: l.sku, name: l.name, qty: Number(l.qty), cost: Number(l.cost), expiry: fromIso(l.expiry) }));
    const bill = addBill({ supplier: s.id, ref: invoice.trim(), at, amount: total, lines: clean.map(({ expiry, ...l }) => l), extra: Number(extra) || 0, discount: Number(discount) || 0, due: left > 0 ? dayStart(fromIso(due)) : dayStart(at), direct: true, place, returnable });
    clean.forEach((l) => {
      addMove({ sku: l.sku, place, qty: l.qty, kind: 'receive', reason: `Bought from ${s.name}`, by: 'Staff', ref: bill.no });
      setBuyingPrice(l.sku, l.name, l.cost);
    });
    addBatches(clean.filter((l) => l.expiry), { place, ref: bill.no, supplier: s.name });
    if (paid > 0) paySupplier({ supplier: s.id, bills: [bill.no], amount: paid, method, account, ref: invoice.trim() });
    toast('Purchase saved');
    navigate('/purchases');
  };

  const err = (k) => (tried && errs[k] ? <p className="bg-err">{errs[k]}</p> : null);

  return (
    <div className="dc-screen ds" data-screen="BuyGoods">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="po-buy" />
        <main className="gc-shell__main">
          <Topbar crumb="Products & stock / Purchases" page="New purchase" />
          <div className="gc-shell__content">
            <div className="ix-page ix-page--narrow">
              <RecordHeader back="/purchases" backLabel="Back to purchases" title="New purchase"
                about="Bought, paid and in stock — one step."
                primary={{ label: 'Save purchase', icon: 'check', onClick: save }} />
              <div className="ix-record">
                <div className="ix-main">
                  <section className="ix-card" aria-labelledby="bg-sup">
                    <div className="ix-card__head"><h2 id="bg-sup">Supplier</h2></div>
                    <div className="ix-card__body bg-two">
                      <div>
                        <label className="gc-label" htmlFor="bg-s">Supplier</label>
                        <select id="bg-s" className="gc-input gc-select" value={sup} onChange={(e) => setSup(e.target.value)} aria-invalid={tried && !!errs.sup}>
                          <option value="">Choose</option>
                          {suppliers.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                          <option value="new">+ New supplier</option>
                        </select>
                        {sup === 'new' ? <input className="gc-input" style={{ marginTop: 'var(--space-2)' }} aria-label="New supplier name" placeholder="Supplier name" value={supName} onChange={(e) => setSupName(e.target.value)} /> : null}
                        {err('sup')}
                      </div>
                      <div><label className="gc-label" htmlFor="bg-d">Date</label><input id="bg-d" className="gc-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
                      <div><label className="gc-label" htmlFor="bg-inv">Supplier invoice no.</label><input id="bg-inv" className="gc-input" placeholder="Optional" value={invoice} onChange={(e) => setInvoice(e.target.value)} /></div>
                      {places.length > 1 ? <div><label className="gc-label" htmlFor="bg-pl">Stock in at</label><select id="bg-pl" className="gc-input gc-select" value={place} onChange={(e) => setPlace(e.target.value)}>{places.map((x) => <option key={x}>{x}</option>)}</select></div> : null}
                    </div>
                  </section>

                  <section className="ix-card" aria-labelledby="bg-items">
                    <div className="ix-card__head"><h2 id="bg-items">Products</h2>{lines.length ? <span className="ix-muted">{money(itemsTotal)}</span> : null}</div>
                    <div className="ix-card__body bg-body">
                      <div className="bg-find">
                        <input className="gc-input" type="search" aria-label="Find a product" placeholder="Search products by name or SKU" value={find} onChange={(e) => setFind(e.target.value)} />
                        {hits.length ? (
                          <ul className="bg-hits">{hits.map((p) => <li key={p.sku}><button type="button" onClick={() => addLine(p)}><span>{p.name}</span><small>{p.sku}</small></button></li>)}</ul>
                        ) : null}
                      </div>
                      {lines.length ? (
                        <div className="bg-lines">
                          {lines.map((l) => (
                            <div key={l.key} className="bg-line">
                              <span className="bg-name"><b>{l.name}</b><small>{l.sku}</small></span>
                              <div><label className="gc-label" htmlFor={'q' + l.key}>Qty</label><input id={'q' + l.key} className="gc-input" type="number" inputMode="numeric" min="1" value={l.qty} onChange={(e) => setLine(l.key, { qty: e.target.value })} /></div>
                              <div><label className="gc-label" htmlFor={'c' + l.key}>Buying price</label><input id={'c' + l.key} className="gc-input" type="number" inputMode="decimal" min="0" value={l.cost} onChange={(e) => setLine(l.key, { cost: e.target.value })} /></div>
                              <div><label className="gc-label" htmlFor={'x' + l.key}>Expires</label><input id={'x' + l.key} className="gc-input" type="date" value={l.expiry} onChange={(e) => setLine(l.key, { expiry: e.target.value })} /></div>
                              <span className="bg-amt">{money((Number(l.qty) || 0) * (Number(l.cost) || 0))}</span>
                              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain bg-x" aria-label={'Remove ' + l.name} onClick={() => setLines(lines.filter((x) => x.key !== l.key))}><Icon name="x" width="16" height="16" aria-hidden="true" /></button>
                            </div>
                          ))}
                        </div>
                      ) : <p className="gc-help" style={{ margin: 0 }}>Search above to add products. Expiry is optional.</p>}
                      {err('lines')}
                    </div>
                  </section>
                </div>

                <div className="ix-side">
                  <section className="ix-card" aria-labelledby="bg-pay">
                    <div className="ix-card__head"><h2 id="bg-pay">Payment</h2></div>
                    <div className="ix-card__body bg-body">
                      <div className="bg-two">
                        <div><label className="gc-label" htmlFor="bg-ex">Transport & other</label><input id="bg-ex" className="gc-input" type="number" inputMode="numeric" min="0" placeholder="0" value={extra} onChange={(e) => setExtra(e.target.value)} /></div>
                        <div><label className="gc-label" htmlFor="bg-dc">Discount</label><input id="bg-dc" className="gc-input" type="number" inputMode="numeric" min="0" placeholder="0" value={discount} onChange={(e) => setDiscount(e.target.value)} /></div>
                      </div>
                      <div className="bg-total"><KV rows={[['Products', money(itemsTotal)], ['Total', money(total)]]} /></div>
                      <div className="bg-seg" role="group" aria-label="Paid">
                        {[['full', 'Paid in full'], ['part', 'Part paid'], ['later', 'Pay later']].map(([k, l]) => <button key={k} type="button" aria-pressed={payWhen === k} onClick={() => setPayWhen(k)}>{l}</button>)}
                      </div>
                      {payWhen === 'part' ? <div><label className="gc-label" htmlFor="bg-pn">Paid now (৳)</label><input id="bg-pn" className="gc-input" type="number" inputMode="numeric" min="1" value={paidNow} onChange={(e) => setPaidNow(e.target.value)} />{err('paid')}</div> : null}
                      {paid > 0 ? (<>
                        <div className="bg-seg" role="group" aria-label="Paid by">{METHODS.map((m) => <button key={m} type="button" aria-pressed={method === m} onClick={() => { setMethod(m); const a = accountsForMethod(m)[0]; setAccount(a ? a.id : ''); }}>{m}</button>)}</div>
                        {accounts.length > 1 ? <div><label className="gc-label" htmlFor="bg-acc">From</label><select id="bg-acc" className="gc-input gc-select" value={account} onChange={(e) => setAccount(e.target.value)}>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name} · {money(a.balance)}</option>)}</select></div> : null}
                        {err('account')}
                      </>) : null}
                      {left > 0 ? <div><label className="gc-label" htmlFor="bg-due">Pay {money(left)} by</label><input id="bg-due" className="gc-input" type="date" value={due} onChange={(e) => setDue(e.target.value)} />{err('due')}</div> : null}
                      <label className="bg-check"><input type="checkbox" checked={returnable} onChange={(e) => setReturnable(e.target.checked)} />Supplier takes back faulty items</label>
                    </div>
                  </section>
                </div>
              </div>
              <PhoneActionBar note={money(total)}><button type="button" className="gc-btn gc-btn--solid" onClick={save}>Save purchase</button></PhoneActionBar>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
