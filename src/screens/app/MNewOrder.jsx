'use client';
// Merchant app · New order (/m-new-order). The design board's layout (design/templates/app/MNewOrder.dc.html:
// customer phone, products with quantity steppers, delivery segments, payment chips, the summary and "Create order ·
// ৳total" at the bottom) doing what the web's Create order does (src/screens/merchant-orders/NewOrder.jsx):
//   customer   first: search the customer list by phone or name (customers.searchCustomers), or type a new mobile
//              number with a name; the customer's restrictions are checked as the order changes
//              (restrictions.checkOrder: blocked, no COD, advance above an amount, order limit, method off)
//   products   what can be sold (sellable.orderableItems, with free stock at the place online orders ship from;
//              pre-order items may go below zero); a scanned code arriving as ?code= is added (identifiers.resolveScan)
//   delivery   Settings › Delivery's rates (deliveryRates.js), the charge can be changed; courier (optional)
//   source     where the order came from (Facebook, WhatsApp, Phone …), as on the web
//   payment    Cash on delivery, paid in full (bKash, Nagad, Card) or an advance; VAT 5% as on the web; discount
//   create     orderLinks.addOrder (the same order sent twice within 20 s returns the first one), money taken now
//              posted to its account (ledger.postEntry), the customer kept (customers.saveCustomerOnce), approved
//              orders hold or take their stock, announceNewOrder sends the messages; then the new order opens
// ?phone=<number> starts with that customer (from the customer page). The Retail edition sells at the POS instead.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppScreen, AppBar, Content, ActionBar, Sheet, Card, ListRow, Chips, Segmented, Pill, Avatar, Button, Field, TextInput,
  Switch, Stepper, SearchField, Note, EmptyState, Skeleton, Icon, useAppData, useQuery, money, initials, toast,
  confirmDialog,
} from './kit/AppKit';
import { canUse } from './kit/appNav';
import { hasModule, holdsStock } from '@/lib/edition';
import { getOrders, findOrder, patchOrder, takeOrderStock, logOrder } from '@/lib/orders';
import { orderableItems, canAdd } from '@/lib/sellable';
import { resolveScan } from '@/lib/identifiers';
import { announceNewOrder, COURIERS, courierCharge, updatePrep } from '@/lib/orderFlow';
import { notify } from '@/lib/notifications';
import { addOrder, DELIVERY_RATES as DEFAULT_RATES, PAYMENT_LABEL, BD_MOBILE, cleanPhone, prettyPhone, ORDER_SOURCES } from '@/lib/orderLinks';
import { deliveryRates, feeFor } from '@/lib/deliveryRates';
import { guessArea, zoneOf } from '@/lib/bdAreas';
import { addHolds } from '@/lib/stockHolds';
import { postEntry, accountForMethod } from '@/lib/ledger';
import { onlinePlace } from '@/lib/locations';
import { searchCustomers, getDirectory, saveCustomerOnce, ADDED_FROM, normalizePhone } from '@/lib/customers';
import { checkOrder } from '@/lib/restrictions';
import { digitsOf, plural, byName } from './orders/orderData';

const VAT_RATE = 0.05;
const SHORT_RATE = { dhaka: 'Dhaka', sub: 'Sub-Dhaka', outside: 'Outside', pickup: 'Pickup' };
const PAYS = [['cod', 'Cash on delivery'], ['bkash', 'bKash'], ['nagad', 'Nagad'], ['card', 'Card'], ['advance', 'Advance']];
const ADV_METHODS = [['bkash', 'bKash'], ['nagad', 'Nagad'], ['cash', 'Cash']];
const SUB_DHAKA = /savar|gazipur|narayanganj|keraniganj|tongi|ashulia/i;
const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const num = (t) => Math.max(0, Math.round(Number(String(t || '').replace(/[^0-9.]/g, '')) || 0));
/** The delivery rate an address suggests: its area's zone (bdAreas.js), else a guess from the words in it. */
const rateFor = (address) => { if (!address) return ''; const g = guessArea(address); if (g && g.area) return zoneOf(g.district, g.area); return SUB_DHAKA.test(address) ? 'sub' : /dhaka/i.test(address) ? 'dhaka' : 'outside'; };
/** A customer's usable mobile number (directory rows may carry several). */
function mobileOf(c) {
  const list = [...(c.phones || []).map((p) => p.value), c.phone].filter(Boolean);
  const ok = list.map((p) => normalizePhone(p) || cleanPhone(p)).find((d) => BD_MOBILE.test(d));
  return ok || cleanPhone(c.phone);
}

const CSS = `
[data-screen="MNewOrder"] .chips{overflow-x:auto;scrollbar-width:none;padding:0;flex-wrap:wrap}
[data-screen="MNewOrder"] .sum{display:flex;justify-content:space-between;gap:12px}
[data-screen="MNewOrder"] .pick{display:flex;align-items:center;gap:12px;width:100%;padding:10px 0;border:0;border-top:1px solid var(--line);background:none;text-align:left;font:inherit;color:inherit;cursor:pointer}
[data-screen="MNewOrder"] .pick:first-child{border-top:0}
[data-screen="MNewOrder"] .linkbtn{border:0;background:none;padding:0;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--brand);cursor:pointer}
`;

export default function MNewOrderScreen() {
  const router = useRouter();
  const { ready, tick, ctx } = useAppData();
  const query = useQuery();
  const [q, setQ] = useState('');
  const [customer, setCustomer] = useState(null);     // { name, phone (digits), address, id, known, orders }
  const [newName, setNewName] = useState('');
  const [address, setAddress] = useState('');
  const [lines, setLines] = useState([]);             // [{ id, name, variant, sku, price, listPrice, productId, qty, stock, oversell }]
  const [rate, setRate] = useState('');
  const [fee, setFee] = useState('');
  const [discount, setDiscount] = useState('');
  const [vat, setVat] = useState(true);
  const [pay, setPay] = useState('cod');
  const [advance, setAdvance] = useState('');
  const [advMethod, setAdvMethod] = useState('bkash');
  const [courier, setCourier] = useState('');
  const [approveNow, setApproveNow] = useState(true);
  const [note, setNote] = useState('');
  const [picker, setPicker] = useState(false);
  const [pq, setPq] = useState('');
  const [place, setPlace] = useState('Central Warehouse');
  const [source, setSource] = useState('Phone');
  const [DELIVERY_RATES, setRates] = useState(DEFAULT_RATES);   // Settings › Delivery, read after mount
  const creating = useRef(false);

  const online = ctx ? hasModule('online', ctx.ed) : true;
  // the Retail edition sells at the counter: the POS register takes the sale
  useEffect(() => {
    if (!ctx || hasModule('online', ctx.ed)) return;
    router.replace(canUse('/m-pos', ctx) ? '/m-pos' : '/pos');
  }, [ctx, router]);
  useEffect(() => { if (ready) { setPlace(safe(() => onlinePlace(), 'Central Warehouse')); setRates(safe(() => deliveryRates(), DEFAULT_RATES)); } }, [ready]);

  const catalog = useMemo(() => (ready ? safe(() => orderableItems({ place }), []) : []), [ready, tick, place]);
  const directory = useMemo(() => (ready ? safe(() => getDirectory().filter((c) => c.kind !== 'company'), []) : []), [ready, tick]);
  const orders = useMemo(() => (ready ? safe(() => getOrders(), []) : []), [ready, tick]);
  const pastOrders = (d) => orders.filter((o) => digitsOf(o.phone) === d).length;

  const addItem = (p, qty = 1) => {
    const have = (lines.find((l) => l.id === p.id) || {}).qty || 0;
    const ok = canAdd(p, have + qty);
    if (!ok.ok) { toast(`${p.name}: only ${ok.free} in stock`, { tone: 'error' }); return false; }
    setLines((cur) => (cur.some((l) => l.id === p.id)
      ? cur.map((l) => (l.id === p.id ? { ...l, qty: l.qty + qty } : l))
      : [...cur, { id: p.id, name: p.name, variant: p.variant, sku: p.sku, price: p.price, listPrice: p.listPrice != null ? p.listPrice : p.price, productId: p.productId || '', qty, stock: p.stock, oversell: p.oversell, backorder: p.backorder }]));
    if (ok.preorder || ok.backorder) toast(`${p.name}: ${ok.preorder ? 'pre-order' : 'backorder'}, ${ok.free} in stock`, { tone: 'info' });
    return true;
  };
  const setQty = (id, n) => {
    if (n <= 0) { setLines((cur) => cur.filter((l) => l.id !== id)); return; }
    const l = lines.find((x) => x.id === id);
    if (l && !canAdd(l, n).ok) { toast(`${l.name}: only ${Math.max(0, l.stock)} in stock`, { tone: 'error' }); return; }
    setLines((cur) => cur.map((x) => (x.id === id ? { ...x, qty: n } : x)));
  };

  const pickCustomer = (c) => {
    const phone = mobileOf(c);
    setCustomer({ name: c.name, phone, address: c.address || '', id: c.id, known: true, orders: pastOrders(digitsOf(phone)) });
    setAddress(c.address || '');
    setQ('');
    if (!rate) { const r = rateFor(c.address); if (r) { setRate(r); setFee(String(feeFor(r, Math.max(1, items), DELIVERY_RATES))); } }
  };
  // ?phone= starts with that customer; ?code= adds a scanned product
  useEffect(() => {
    if (!query || !ready) return;
    const ph = query.get('phone');
    if (ph && !customer) {
      const d = cleanPhone(ph);
      const hit = directory.find((c) => (c.phones || []).some((p) => normalizePhone(p.value) === d) || cleanPhone(c.phone) === d);
      if (hit) pickCustomer(hit); else setQ(d);
    }
    const code = query.get('code');
    if (code) {
      const hit = safe(() => resolveScan(code), null);
      const item = hit && hit.row ? catalog.find((p) => p.sku === hit.row.sku) : catalog.find((p) => p.barcode === code || p.sku === code);
      if (item) { if (addItem(item, (hit && hit.qty) || 1)) toast(item.name + ' added'); } else toast(`No product for ${code}`, { tone: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, ready]);

  // ---- totals ---------------------------------------------------------------------------------------------
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const items = lines.reduce((s, l) => s + l.qty, 0);
  const disc = Math.min(subtotal, num(discount));
  const deliveryFee = rate ? num(fee) : 0;
  const tax = vat ? Math.round((subtotal - disc) * VAT_RATE) : 0;
  const total = subtotal - disc + deliveryFee + tax;
  const terms = pay === 'cod' ? 'cod' : pay === 'advance' ? 'partial' : 'full';
  const adv = num(advance);

  // ---- the customer -------------------------------------------------------------------------------------------
  const typed = cleanPhone(q);
  const matches = useMemo(() => (q.trim().length >= 2 ? safe(() => searchCustomers(q, directory), []).slice(0, 5) : []), [q, directory]);
  const isNewNumber = BD_MOBILE.test(typed) && !matches.some((c) => mobileOf(c) === typed);
  const check = useMemo(() => {
    if (!customer || !ready) return { ok: true, blocks: [], warnings: [] };
    return safe(() => checkOrder(customer.known ? customer.id : customer.phone, { amount: total, payment: terms === 'full' ? (PAYS.find((p) => p[0] === pay) || [])[1] : 'cod' }), { ok: true, blocks: [], warnings: [] });
  }, [customer, total, terms, pay, ready]);

  const useNewNumber = () => {
    if (!newName.trim()) { toast('Type the customer’s name', { tone: 'error' }); return; }
    setCustomer({ name: newName.trim(), phone: typed, address: '', id: '', known: false, orders: pastOrders(typed) });
    setQ(''); setNewName('');
  };

  const dirty = lines.length > 0 || !!customer || !!note;
  const leave = async () => {
    if (dirty && !(await confirmDialog({ title: 'Discard this order?', body: 'The products and customer you added will be lost.', confirmLabel: 'Discard', tone: 'danger' }))) return;
    router.push('/m-orders');
  };

  // ---- create (the web's Create order, step for step) --------------------------------------------------------
  const problem = !customer ? 'Choose or add the customer first' : !lines.length ? 'Add at least one product'
    : terms === 'partial' && !(adv > 0 && adv < total) ? `Enter an advance between ৳1 and ${money(Math.max(1, total - 1))}` : !check.ok ? check.blocks[0] : '';
  const create = () => {
    if (creating.current) return;
    if (problem) { toast(problem, { tone: 'error' }); return; }
    if (check.warnings.length) toast(check.warnings[0], { tone: 'info' });
    creating.current = true;
    const by = byName();
    const phone = prettyPhone(customer.phone);
    const zone = rate ? (DELIVERY_RATES.find((r) => r.id === rate) || {}).label || 'Not set' : 'Not set';
    const paidNow = terms === 'full' ? total : terms === 'partial' ? adv : 0;
    const row = addOrder({
      lines, customer: customer.name, phone, zone, total, status: approveNow ? 'Approved' : 'New', payment: PAYMENT_LABEL[terms],
      address: address.trim(), shipping: deliveryFee, paid: paidNow, discount: disc, discountReason: '', vat: tax, vatRate: vat ? VAT_RATE * 100 : 0, note: note.trim(), tags: [], source,
    });
    const open = (id) => router.push('/m-order-detail?id=' + encodeURIComponent(id));
    // the same order sent twice is one order: nothing is posted or held again
    if (row.duplicate) { toast(`Order ${row.id} was already created`, { tone: 'info' }); open(row.id); return; }
    if (disc > 0) logOrder(row.id, 'percent', 'Discount', `${money(disc)} · ${by}`);
    const method = terms === 'full' ? pay : advMethod;
    if (paidNow > 0) postEntry({ account: accountForMethod(method, false), amount: paidNow, kind: 'order payment', ref: row.id, party: customer.name, note: terms === 'full' ? 'Paid in full with the order' : 'Advance with the order' });
    saveCustomerOnce({ name: customer.name, phone: customer.phone, address: address.trim(), types: ['Online'], addedFrom: ADDED_FROM.order });
    if (approveNow && holdsStock()) addHolds({ type: 'online', ref: row.id, who: customer.name, place, note: 'Order approved', by: 'System' }, lines.map((l) => ({ name: l.name, qty: l.qty })));
    if (approveNow && !holdsStock()) { const made = findOrder(row.id); if (made) takeOrderStock(made, place, by); }
    announceNewOrder(row.id);
    if (approveNow) { const made = findOrder(row.id); if (made) { patchOrder(made, { verify: { state: 'confirmed', method: 'manual', at: Date.now(), by } }); notify(made, 'approved'); } }
    if (courier) { const made = findOrder(row.id); if (made) updatePrep(made, { courier }); }
    toast(`Order ${row.id} created`);
    open(row.id);
  };

  const pickList = useMemo(() => {
    const t = pq.trim().toLowerCase();
    return (t ? catalog.filter((p) => (p.name + ' ' + p.sku + ' ' + p.variant + ' ' + p.barcode).toLowerCase().includes(t)) : catalog).slice(0, 40);
  }, [pq, catalog]);
  const rateRow = DELIVERY_RATES.find((r) => r.id === rate);

  if (ctx && !online) {
    return (
      <AppScreen name="MNewOrder" title="New sale" css={CSS}>
        <AppBar title="New sale" back="/m-orders" />
        <Content top={103}><Card><EmptyState icon="cart" title="Sales are made at the POS register" action={{ label: 'Open POS', href: canUse('/m-pos', ctx) ? '/m-pos' : '/pos' }} /></Card></Content>
      </AppScreen>
    );
  }

  return (
    <AppScreen name="MNewOrder" title="New order" css={CSS}>
      <AppBar title="New order" onBack={leave} />
      <Content top={103} bottom={98} style={{ padding: '6px 20px 0', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {!ready ? <Skeleton rows={3} card={false} /> : (
          <>
            {/* customer first */}
            {customer ? (
              <div className="field">
                <span className="lab">Customer</span>
                <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Avatar text={initials(customer.name)} size={40} tone={{ bg: '#e0f3fb', fg: '#003087' }} />
                  <span style={{ flex: '1', minWidth: '0' }}>
                    <span className="ell" style={{ display: 'block', fontWeight: 'var(--weight-semibold)' }}>{customer.name}</span>
                    <span className="num" style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{prettyPhone(customer.phone)}</span>
                  </span>
                  <button type="button" className="linkbtn" onClick={() => { setCustomer(null); setAddress(''); }}>Change</button>
                </div>
                <span className="help" style={{ color: customer.known ? 'var(--ok)' : 'var(--muted)', fontWeight: 'var(--weight-medium)' }}>
                  {customer.known ? `Found: ${customer.name} · ${customer.orders ? plural(customer.orders, 'past order') : 'no orders yet'}` : 'New customer · saved with the order'}
                </span>
              </div>
            ) : (
              <div className="field">
                <span className="lab">Customer phone</span>
                <TextInput value={q} onChange={setQ} placeholder="Mobile number or name" autoFocus />
                {matches.length ? (
                  <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)', padding: '0 14px' }}>
                    {matches.map((c) => (
                      <button key={c.id} type="button" className="pick" onClick={() => pickCustomer(c)}>
                        <Avatar text={initials(c.name)} size={36} tone={{ bg: '#e0f3fb', fg: '#003087' }} />
                        <span style={{ flex: '1', minWidth: '0' }}>
                          <span className="ell" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>{c.name}</span>
                          <span className="ell num" style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{c.phone}{c.address ? ' · ' + c.address : ''}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
                {isNewNumber ? (
                  <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <span className="help">New customer · {prettyPhone(typed)}</span>
                    <TextInput value={newName} onChange={setNewName} placeholder="Customer name" />
                    <Button kind="soft" onClick={useNewNumber}>Use this customer</Button>
                  </div>
                ) : q.trim().length >= 2 && !matches.length ? <span className="help">No customer found. Type the full mobile number to add one.</span> : null}
              </div>
            )}
            {customer ? (
              <Field label="Delivery address">
                <TextInput value={address} onChange={setAddress} placeholder="House, road, area, city" multiline />
              </Field>
            ) : null}
            {!check.ok ? <Note tone="err" icon="alert">{check.blocks[0]}</Note> : check.warnings.length ? <Note tone="warn" icon="alert">{check.warnings[0]}</Note> : null}

            {/* products */}
            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="lab">Products</span>
                {items ? <span className="help num">{plural(items, 'item')}</span> : null}
              </div>
              <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
                {lines.map((l) => (
                  <div key={l.id} className="row">
                    <span className="av" style={{ background: '#e0f3fb', color: '#003087' }}>{(l.name || '?').charAt(0).toUpperCase()}</span>
                    <span className="m">
                      <span className="t" style={{ display: 'block', fontWeight: 'var(--weight-medium)' }}>{l.name}</span>
                      <span className="s num ell" style={{ display: 'block' }}>{l.variant && l.variant !== 'Single' ? l.variant + ' · ' : ''}{money(l.price)}{l.stock < l.qty ? ' · ' + (l.oversell ? 'pre-order' : 'backorder') : ''}</span>
                    </span>
                    <Stepper value={l.qty} onChange={(n) => setQty(l.id, n)} min={0} label={'Quantity of ' + l.name} />
                  </div>
                ))}
                <button type="button" className="row" onClick={() => { setPq(''); setPicker(true); }} style={{ color: 'var(--brand)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm-plus)', minHeight: '52px' }}>
                  <Icon name="plus" size={20} stroke={2.2} />Add product
                </button>
              </div>
            </div>

            {/* delivery */}
            <div className="field">
              <span className="lab">Delivery</span>
              <Segmented style={{ margin: '0' }} value={rate} onChange={(k) => { setRate(k); setFee(String(feeFor(k, Math.max(1, items), DELIVERY_RATES))); }} items={DELIVERY_RATES.map((r) => ({ key: r.id, label: SHORT_RATE[r.id] || r.label }))} />
              {rateRow ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="help" style={{ flex: '1' }}>{rateRow.note}</span>
                  <span style={{ width: '120px' }}><TextInput value={fee} onChange={(t) => setFee(t.replace(/[^0-9]/g, ''))} prefix="৳" inputMode="numeric" /></span>
                </div>
              ) : <span className="help">Choose where it goes</span>}
            </div>
            {rate && rate !== 'pickup' ? (
              <div className="field">
                <span className="lab">Courier</span>
                <Chips value={courier} onChange={setCourier} items={[{ key: '', label: 'Later' }, ...COURIERS.map((c) => ({ key: c, label: `${c} · ${money(safe(() => courierCharge(c, rateRow ? rateRow.label : ''), 0))}` }))]} />
              </div>
            ) : null}

            {/* payment */}
            <div className="field">
              <span className="lab">Payment</span>
              <Chips value={pay} onChange={setPay} items={PAYS.map(([k, l]) => ({ key: k, label: l }))} />
              {pay === 'advance' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                  <TextInput value={advance} onChange={(t) => setAdvance(t.replace(/[^0-9]/g, ''))} prefix="৳" inputMode="numeric" placeholder="Advance amount" />
                  <Chips value={advMethod} onChange={setAdvMethod} items={ADV_METHODS.map(([k, l]) => ({ key: k, label: l }))} />
                  {adv > 0 && adv < total ? <span className="help">Cash on delivery after the advance: {money(total - adv)}</span> : null}
                </div>
              ) : null}
            </div>
            <div className="field">
              <span className="lab">Source</span>
              <Chips value={source} onChange={setSource} items={ORDER_SOURCES.map((x) => ({ key: x, label: x }))} />
            </div>
            <Field label="Discount">
              <TextInput value={discount} onChange={(t) => setDiscount(t.replace(/[^0-9]/g, ''))} prefix="৳" inputMode="numeric" placeholder="0" />
            </Field>
            <Field label="Order note" help="Seen by the courier and on the invoice">
              <TextInput value={note} onChange={setNote} multiline placeholder="Optional" />
            </Field>
            <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)', padding: '4px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0' }}>
                <span style={{ flex: '1' }}>
                  <span style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>Confirmed with the customer</span>
                  <span className="help" style={{ display: 'block' }}>{approveNow ? (holdsStock() ? `Approved now · stock held at ${place}` : `Approved now · stock taken from ${place}`) : 'Starts as a new order to verify'}</span>
                </span>
                <Switch on={approveNow} onChange={setApproveNow} label="Confirmed with the customer" />
              </div>
            </div>
            <div className="card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 'var(--text-sm)', boxShadow: 'none', background: '#eef3fa' }}>
              <div className="sum"><span>Items ({items})</span><span className="num">{money(subtotal)}</span></div>
              {disc ? <div className="sum"><span>Discount</span><span className="num">−{money(disc)}</span></div> : null}
              {rate ? <div className="sum"><span>Delivery</span><span className="num">{money(deliveryFee)}</span></div> : null}
              <div className="sum" style={{ alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>VAT 5%<Switch on={vat} onChange={setVat} label="Add VAT 5%" /></span>
                <span className="num">{money(tax)}</span>
              </div>
              <div className="sum" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', marginTop: '2px' }}><span>Total</span><span className="num">{money(total)}</span></div>
              {terms === 'partial' && adv > 0 && adv < total ? <div className="sum"><span>Advance now</span><span className="num">{money(adv)}</span></div> : null}
            </div>
            {problem && (customer || lines.length) ? <span className="help" style={{ textAlign: 'center' }}>{problem}</span> : null}
            <div style={{ height: '4px' }} />
          </>
        )}
      </Content>
      <ActionBar>
        <Button kind="primary" disabled={!ready || !!problem} onClick={create}>Create order · {money(total)}</Button>
      </ActionBar>

      <Sheet open={picker} onClose={() => setPicker(false)} title="Add product"
        footer={<Button kind="primary" onClick={() => setPicker(false)}>{items ? `Done · ${plural(items, 'item')}` : 'Done'}</Button>}>
        <SearchField value={pq} onChange={setPq} placeholder="Name, SKU or barcode" autoFocus style={{ margin: '0 0 8px' }} />
        {pickList.length ? pickList.map((p) => {
          const inCart = (lines.find((l) => l.id === p.id) || {}).qty || 0;
          const free = Math.max(0, p.stock);
          return (
            <button key={p.id} type="button" className="pick" onClick={() => addItem(p)}>
              <span className="av" style={{ width: '40px', height: '40px', background: '#e0f3fb', color: '#003087' }}>{(p.name || '?').charAt(0).toUpperCase()}</span>
              <span style={{ flex: '1', minWidth: '0' }}>
                <span className="ell" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>{p.name}</span>
                <span className="ell num" style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: free ? 'var(--muted)' : p.oversell || p.backorder ? 'var(--warn)' : 'var(--err)' }}>
                  {p.variant && p.variant !== 'Single' ? p.variant + ' · ' : ''}{money(p.price)} · {free ? `${free} in stock` : p.oversell ? 'Pre-order' : p.backorder ? 'Backorder' : 'Out of stock'}
                </span>
              </span>
              {inCart ? <Pill tone="nav">{inCart} added</Pill> : <Icon name="plus" size={20} stroke={2} style={{ color: 'var(--brand)' }} />}
            </button>
          );
        }) : <EmptyState icon="search" title={pq ? `Nothing matches “${pq}”` : 'No products can be sold yet'} />}
      </Sheet>
    </AppScreen>
  );
}
