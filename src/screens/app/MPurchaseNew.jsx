'use client';
// Merchant app · New purchase (/m-purchase-new). The board's layout (design/templates/app/MPurchaseNew.dc.html) with
// live data. Two ways to buy, as Settings › Stock setup allows (stockSetup.js › buying; the Online edition buys direct):
//   Purchase order  supplier, deliver to (receiving places), items with quantities and buying prices. Choosing a
//                   supplier fills the items running low that were bought from them before (quantities cover 20 days of
//                   sales, else twice the reorder level). Save draft, or Send to supplier (purchaseOrders.addPOs,
//                   status Sent); staff orders above ৳50,000 wait for an admin (approval 'waiting'), like New PO on the web.
//   Bought now      the web's New purchase (/buy-goods) in one step: stock comes in at the place ('receive' moves), a
//                   supplier bill with what is left and its due date (supplierBills.addBill direct), the payment from an
//                   account (paySupplier → ledger), the latest buying price (productCost.setBuyingPrice) and expiry
//                   batches for products that track expiry (batches.addBatches).
// ?sku= starts with that product (Stock › Reorder) and its last supplier; ?mode=direct|order picks the way.

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppScreen, Content, AppBar, ActionBar, Button, IconButton, Field, TextInput, Stepper, Segmented, Chips, Sheet, Note, Avatar, Icon, useAppData, useQuery, money, toast, refresh, initials } from './kit/AppKit';
import { addPOs } from '@/lib/purchaseOrders';
import { findSupplier, ensureSupplier, addBill, paySupplier, payableOf, termsLabel, DEFAULT_TERMS, dayStart } from '@/lib/supplierBills';
import { addMove } from '@/lib/stock';
import { setBuyingPrice } from '@/lib/productCost';
import { addBatches } from '@/lib/batches';
import { accountsForMethod, balanceOf, getEntries } from '@/lib/ledger';
import { getReceivingPlaces, onlinePlace } from '@/lib/locations';
import { getStockSetup } from '@/lib/stockSetup';
import { resolveScan } from '@/lib/identifiers';
import { ProductSheet, ScanSheet } from './stock/Scanner';
import { SupplierSheet } from './stock/PurchaseParts';
import { buyingMode, supplierLines, lastSupplierOf } from './stock/purchaseData';
import { rowBy, stockOf, costOf, soldPerDay, reorderOf, tracksExpiry, isAdmin, me, onePlace, safe, plural, isoDay, fromIso } from './stock/stockData';

const LIMIT = 50000;
const METHODS = ['Cash', 'bKash', 'Nagad', 'Bank'];
const DAY = 864e5;

/** A line for a product: buying price and what it sells. */
function lineFor(row, place, qty) {
  const st = stockOf(row.sku, place);
  return { sku: row.sku, name: row.name, code: row.barcode || '', qty: Math.max(1, qty || 1), cost: String(costOf(row)), have: st.available, rate: soldPerDay(row.sku), expiry: '', exp: tracksExpiry(row) };
}
/** How many to order: 20 days of sales, else twice the reorder level, less what is there. */
const suggest = (row, place) => { const st = stockOf(row.sku, place); const r = soldPerDay(row.sku); const want = r > 0 ? Math.ceil(r * 20) : reorderOf(row.sku) * 2; return Math.max(1, want - Math.max(0, st.available)); };

export default function MPurchaseNewScreen() {
  const router = useRouter();
  const q = useQuery();
  const { ready } = useAppData();
  const [mode, setMode] = useState('');            // 'order' | 'direct'
  const [sup, setSup] = useState('');
  const [place, setPlace] = useState('');
  const [lines, setLines] = useState([]);
  const [filled, setFilled] = useState(0);
  const [pickSup, setPickSup] = useState(false);
  const [pickItem, setPickItem] = useState(false);
  const [scan, setScan] = useState(false);
  const [edit, setEdit] = useState(null);         // sku of the line being edited
  const [invoice, setInvoice] = useState('');
  const [payWhen, setPayWhen] = useState('full');
  const [paidNow, setPaidNow] = useState('');
  const [method, setMethod] = useState('Cash');
  const [account, setAccount] = useState('');
  const [due, setDue] = useState('');
  const [busy, setBusy] = useState(false);

  const ways = useMemo(() => (ready ? buyingMode() : { orders: true, direct: false }), [ready]);
  const places = useMemo(() => (ready ? (onePlace() ? [safe(() => onlinePlace(), 'Central Warehouse')] : safe(() => getReceivingPlaces(), ['Central Warehouse'])) : []), [ready]);
  useEffect(() => {
    if (!ready || !q) return;
    const want = q.get('mode');
    setMode(want === 'direct' && ways.direct ? 'direct' : want === 'order' && ways.orders ? 'order' : ways.orders ? 'order' : 'direct');
    const home = safe(() => onlinePlace(), places[0]);
    setPlace(places.includes(home) ? home : places[0] || '');
    const sku = q.get('sku');
    const row = sku ? rowBy(sku) : null;
    if (row) {
      const s = lastSupplierOf(row.sku);
      if (s) setSup(s);
      setLines([lineFor(row, home, suggest(row, home))]);
      setFilled(-1);
    }
  }, [ready, q, ways, places]);

  const supplier = sup ? safe(() => findSupplier(sup), null) : null;
  const terms = supplier ? supplier.terms ?? DEFAULT_TERMS : DEFAULT_TERMS;
  useEffect(() => { if (ready) setDue(isoDay(dayStart() + terms * DAY)); }, [ready, terms]);
  const accounts = useMemo(() => (ready ? safe(() => { const e = getEntries(); return accountsForMethod(method).map((a) => ({ ...a, balance: balanceOf(a.id, e) })); }, []) : []), [ready, method]);
  useEffect(() => { setAccount(accounts[0] ? accounts[0].id : ''); }, [accounts]);

  const choose = (name) => {
    setPickSup(false);
    setSup(name);
    // fill with what is low from this supplier (order mode, no items yet)
    if (mode === 'order' && !lines.length) {
      const low = supplierLines(name).map((s) => rowBy(s)).filter(Boolean).filter((r) => stockOf(r.sku, place).available < reorderOf(r.sku));
      if (low.length) { setLines(low.slice(0, 8).map((r) => lineFor(r, place, suggest(r, place)))); setFilled(low.length); }
    }
  };
  const addRow = (row, n = 1) => {
    setPickItem(false);
    setLines((cur) => (cur.some((l) => l.sku === row.sku) ? cur.map((l) => (l.sku === row.sku ? { ...l, qty: l.qty + n } : l)) : [...cur, lineFor(row, place, n)]));
  };
  const onScan = (code) => {
    const hit = safe(() => resolveScan(code), null);
    if (!hit || !hit.row) { toast(`No product for “${code}”`, { tone: 'error' }); return; }
    addRow(hit.row, hit.qty || 1);
    toast(`${hit.row.name} +${hit.qty || 1}`);
  };
  const setLine = (sku, patch) => setLines((cur) => cur.flatMap((l) => (l.sku !== sku ? [l] : patch.qty === 0 ? [] : [{ ...l, ...patch }])));

  const pcs = lines.reduce((a, l) => a + l.qty, 0);
  const total = Math.round(lines.reduce((a, l) => a + l.qty * (Number(l.cost) || 0), 0));
  const paid = payWhen === 'full' ? total : payWhen === 'part' ? Math.round(Number(paidNow) || 0) : 0;
  const left = Math.max(0, total - paid);
  const needsApproval = mode === 'order' && !isAdmin() && total > LIMIT;
  const owe = supplier ? safe(() => payableOf(supplier.id), 0) : 0;
  const editing = edit ? lines.find((l) => l.sku === edit) : null;

  const check = (draft) => {
    if (!sup.trim()) { toast('Choose the supplier', { tone: 'error' }); setPickSup(true); return false; }
    if (!draft && !lines.length) { toast('Add at least one product', { tone: 'error' }); return false; }
    if (lines.some((l) => !(Number(l.cost) > 0))) { toast('Enter the buying price of every product', { tone: 'error' }); return false; }
    return true;
  };
  const saveOrder = (draft) => {
    if (busy || !check(draft)) return;
    setBusy(true);
    const status = draft || needsApproval ? 'Draft' : 'Sent';
    const po = addPOs([{ supplier: sup.trim(), place, status, approval: !draft && needsApproval ? 'waiting' : undefined, by: me(), sentAt: status === 'Sent' ? Date.now() : undefined,
      lines: lines.map((l) => ({ name: l.name, code: l.code, sku: l.sku, qty: l.qty, cost: Number(l.cost) })), terms, expected: '', invoice: '', note: '' }])[0];
    if (!findSupplier(sup.trim())) ensureSupplier(sup.trim());
    refresh();
    toast(`${po.no} ${draft ? 'saved as a draft' : needsApproval ? 'sent to an admin for approval' : 'sent to ' + po.supplier} · ${money(po.total)}`);
    router.push('/m-purchase-detail?id=' + encodeURIComponent(po.no));
  };
  const saveDirect = () => {
    if (busy || !check(false)) return;
    if (payWhen === 'part' && !(paid > 0 && paid < total)) { toast(`Enter an amount below ${money(total)}`, { tone: 'error' }); return; }
    if (paid > 0 && !account) { toast('Choose where the money is paid from', { tone: 'error' }); return; }
    if (left > 0 && !fromIso(due)) { toast('Choose when the rest is due', { tone: 'error' }); return; }
    setBusy(true);
    const s = supplier || ensureSupplier(sup.trim());
    const by = me();
    const at = Date.now();
    const returnable = safe(() => getStockSetup().supplierChanges !== false, true);
    const clean = lines.map((l) => ({ sku: l.sku, name: l.name, qty: l.qty, cost: Number(l.cost), expiry: l.exp ? fromIso(l.expiry) : null }));
    const bill = addBill({ supplier: s.id, ref: invoice.trim(), at, amount: total, lines: clean.map(({ expiry, ...l }) => l), extra: 0, discount: 0, due: left > 0 ? dayStart(fromIso(due)) : dayStart(at), direct: true, place, returnable });
    clean.forEach((l) => {
      addMove({ sku: l.sku, place, qty: l.qty, kind: 'receive', reason: `Bought from ${s.name}`, by, ref: bill.no, op: bill.no + ':' + l.sku });
      safe(() => setBuyingPrice(l.sku, l.name, l.cost), null);
    });
    safe(() => addBatches(clean.filter((l) => l.expiry), { place, ref: bill.no, supplier: s.name }), null);
    if (paid > 0) paySupplier({ supplier: s.id, bills: [bill.no], amount: paid, method, account, ref: invoice.trim(), by });
    refresh();
    toast(`Purchase saved · ${plural(pcs, 'piece')} in stock at ${place}`);
    router.push('/m-purchase-detail?id=' + encodeURIComponent(bill.no));
  };

  const title = mode === 'direct' ? 'New purchase' : 'New purchase order';
  return (
    <AppScreen name="MPurchaseNew" title={title}>
      <AppBar title={title} back="/m-purchase" />
      <Content top={103} bottom={98} style={{ padding: '2px 20px 0' }} gap={16}>
        {ways.orders && ways.direct ? <Segmented items={[{ key: 'order', label: 'Order' }, { key: 'direct', label: 'Bought now' }]} value={mode} onChange={setMode} style={{ margin: 0 }} /> : null}
        <div className="field">
          <span className="lab">Supplier</span>
          <button type="button" className="inp" onClick={() => setPickSup(true)} style={{ width: '100%', textAlign: 'left', cursor: 'pointer', font: 'inherit' }}>
            {sup ? <Avatar text={initials(sup)} size={30} tone={{ bg: '#fde7ef', fg: '#003087' }} /> : null}
            <span style={{ flex: '1', color: sup ? 'var(--ink)' : 'var(--muted)' }} className="ell">{sup || 'Choose a supplier'}</span>
            <Icon name="down" size={18} />
          </button>
          {sup ? <span className="help">{supplier ? termsLabel(supplier.terms) : 'New supplier'}{owe > 0 ? ` · you owe ${money(owe)}` : ''}</span> : null}
        </div>
        {places.length > 1 ? (
          <div className="field">
            <span className="lab">{mode === 'direct' ? 'Stock goes to' : 'Deliver to'}</span>
            <Segmented items={places.map((p) => ({ key: p, label: p.replace(/ branch$/, '') }))} value={place} onChange={setPlace} style={{ margin: '0' }} />
          </div>
        ) : null}
        {filled > 0 && mode === 'order' ? (
          <Note tone="info" icon="sparkles"><span style={{ fontSize: 'var(--text-sm)' }}>Filled with {plural(filled, 'item')} running low from this supplier. Quantities cover 20 days of sales.</span></Note>
        ) : null}
        <div className="field">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="lab">Items</span>
            <span style={{ display: 'flex', gap: '6px' }}>
              <IconButton icon="scan" label="Scan an item" soft onClick={() => setScan(true)} />
              <IconButton icon="plus" label="Add an item" soft onClick={() => setPickItem(true)} />
            </span>
          </div>
          {lines.length ? (
            <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
              {lines.map((l) => (
                <div key={l.sku} className="lrow">
                  <button type="button" onClick={() => setEdit(l.sku)} style={{ flex: '1', minWidth: '0', padding: 0, border: 0, background: 'none', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer' }}>
                    <span className="ell" style={{ display: 'block', fontSize: 'var(--text-sm-plus)', fontWeight: 'var(--weight-medium)' }}>{l.name}</span>
                    <span style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{l.have > 0 ? `${l.have} in stock` : 'Out of stock'}{l.rate ? ` · sells ${l.rate} a day` : ''}</span>
                    <span className="num" style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: 'var(--ink)', marginTop: '2px' }}>{money(Number(l.cost) || 0)} each{mode === 'direct' && l.exp ? (l.expiry ? ' · expires ' + l.expiry : ' · add expiry') : ''} <span style={{ color: 'var(--brand)' }}>· edit</span></span>
                  </button>
                  <Stepper value={l.qty} min={0} label={'Quantity of ' + l.name} onChange={(n) => setLine(l.sku, { qty: n })} />
                </div>
              ))}
            </div>
          ) : (
            <button type="button" className="card" onClick={() => setPickItem(true)} style={{ boxShadow: 'none', border: '1px dashed #cbd5e1', padding: '18px', textAlign: 'center', color: 'var(--brand)', font: 'inherit', fontWeight: 'var(--weight-medium)', cursor: 'pointer', background: 'var(--card)' }}>Add the first item</button>
          )}
        </div>
        <div className="card" style={{ padding: '14px 16px', boxShadow: 'none', background: '#eef3fa', display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm-plus)', fontWeight: 'var(--weight-semibold)' }}>
          <span>{plural(pcs, 'item')}</span>
          <span className="num">{money(total)}</span>
        </div>
        {needsApproval ? <Note tone="warn" icon="alert">Orders above {money(LIMIT)} need an admin to approve before they go to the supplier.</Note> : null}

        {mode === 'direct' ? (
          <>
            <Field label="Supplier’s invoice no."><TextInput value={invoice} onChange={setInvoice} placeholder="Optional" /></Field>
            <div className="field">
              <span className="lab">Paid now</span>
              <Segmented items={[{ key: 'full', label: 'In full' }, { key: 'part', label: 'Part' }, { key: 'later', label: 'Later' }]} value={payWhen} onChange={setPayWhen} style={{ margin: 0 }} />
            </div>
            {payWhen === 'part' ? <Field label="Amount paid"><TextInput value={paidNow} onChange={(v) => setPaidNow(v.replace(/[^\d]/g, ''))} prefix="৳" inputMode="numeric" /></Field> : null}
            {paid > 0 ? (
              <>
                <div className="field"><span className="lab">Paid by</span><Chips items={METHODS.map((m) => ({ key: m, label: m }))} value={method} onChange={setMethod} style={{ padding: 0 }} /></div>
                {accounts.length > 1 ? <Chips items={accounts.map((a) => ({ key: a.id, label: a.name }))} value={account} onChange={setAccount} style={{ padding: 0, marginTop: '-8px', overflowX: 'auto' }} /> : null}
                {accounts.find((a) => a.id === account) ? <span className="help" style={{ marginTop: '-8px' }}>{accounts.find((a) => a.id === account).name} has {money(accounts.find((a) => a.id === account).balance)}</span> : null}
              </>
            ) : null}
            {left > 0 ? <Field label={`${money(left)} due on`}><TextInput type="date" value={due} onChange={setDue} /></Field> : null}
          </>
        ) : null}
        <div style={{ height: '4px' }} />
      </Content>
      <ActionBar>
        {mode === 'direct' ? <Button onClick={saveDirect} disabled={busy}>Save purchase</Button> : (
          <>
            <Button kind="line" onClick={() => saveOrder(true)} disabled={busy}>Save draft</Button>
            <Button onClick={() => saveOrder(false)} disabled={busy} style={{ flex: 2 }}>{needsApproval ? 'Send for approval' : 'Send to supplier'}</Button>
          </>
        )}
      </ActionBar>

      <SupplierSheet open={pickSup} onClose={() => setPickSup(false)} onPick={choose} />
      <ProductSheet open={pickItem} onClose={() => setPickItem(false)} onPick={(r) => addRow(r, mode === 'order' ? suggest(r, place) : 1)} place={place} title="Add an item" filter={(r) => r.format !== 'digital' && r.format !== 'service' && !(r.bundle && r.bundle.type !== 'kit')} />
      <ScanSheet open={scan} onClose={() => setScan(false)} onCode={onScan} title="Scan items" hint="Each scan adds one (a carton adds the whole carton)." />
      <Sheet open={!!editing} onClose={() => setEdit(null)} title={editing ? editing.name : ''} footer={<><Button kind="danger" onClick={() => { setLine(edit, { qty: 0 }); setEdit(null); }}>Remove</Button><Button onClick={() => setEdit(null)} style={{ flex: 2 }}>Done</Button></>}>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span className="lab">Quantity</span><Stepper value={editing.qty} min={1} onChange={(n) => setLine(edit, { qty: n })} /></div>
            <Field label="Buying price, each"><TextInput value={editing.cost} onChange={(v) => setLine(edit, { cost: v.replace(/[^\d.]/g, '') })} prefix="৳" inputMode="decimal" /></Field>
            {mode === 'direct' && editing.exp ? <Field label="Expires on" help="Shows in Damaged & expired › Expiry"><TextInput type="date" value={editing.expiry} onChange={(v) => setLine(edit, { expiry: v })} /></Field> : null}
            <span className="help">Line total {money(editing.qty * (Number(editing.cost) || 0))}</span>
          </div>
        ) : null}
      </Sheet>
    </AppScreen>
  );
}
