'use client';
// Grid Shop › an order (/admin/grid-shop/order?id=; Batch D, vendors Batch E): each parcel with its next step —
//   our stock      Packing → Ship (courier, tracking, our courier cost) → Delivered
//   a vendor       the vendor accepts, packs and books a courier in their portal (/vendor-order); staff can still WhatsApp
//                  / email them and mark it shipped or delivered here. Once delivered it is owed to the vendor (what they
//                  get, less their fee per parcel) and paid in a payout (vendor record › Money; Finance books it)
// Items: each line's frozen price breakdown (store price, discount and who paid it, vendor gets, we keep). Side: profit
// (we keep on the goods + platform fee + delivery + vendors' fees − our courier), the store and address, payment, notes.
// Data: lib/platform/gridShop.js.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { EmptyState, StatusBadge } from '@/components/ui';
import { RecordHeader, KV } from '@/components/ui/IndexKit';
import { staff } from '@/lib/platform/store';
import { orderById, moveShipment, cancelOrder, addNote, vendorById, profitOf, pbOf, SHIP_STATUS, COURIERS, payLabel } from '@/lib/platform/gridShop';
import { Pic } from '@/components/ui/Pic';
import { bankText } from '@/lib/platform/services';
import { AdminShell } from '../AdminShell';
import { tk, dTime, qp, SVA_CSS } from '../services/svcAdmin';
import { useGs, GsOrderStatus, GSA_CSS, gsPic } from './gsAdmin';

const say = (r, ok) => { if (r && r.ok === false) { toast(r.error, { tone: 'error' }); return false; } if (ok) toast(ok); return true; };
const TONE = { preparing: 'info', sent: 'warning', accepted: 'info', packing: 'info', shipped: 'primary', delivered: 'success' };
const enc = encodeURIComponent;

function Parcel({ o, s, by }) {
  const [f, setF] = useState(null);
  const sup = s.from === 'stock' ? null : vendorById(s.from);
  const items = s.lines.map((i) => `${o.lines[i].qty} × ${o.lines[i].name}`);
  const poText = sup ? `GridCommerce order ${o.id}/${s.id}\nPlease ship to: ${o.address.name}, ${o.address.phone}, ${o.address.line}, ${o.address.district}\n${items.join('\n')}\nSend the courier and tracking number back. Thank you.` : '';
  return (
    <div className="gsa-ship">
      <header><b>{sup ? <Link href={'/admin/grid-shop/vendor?id=' + sup.id}>{sup.name}</Link> : 'Our stock'}</b>{o.cancelled ? <StatusBadge tone="neutral">Cancelled</StatusBadge> : <StatusBadge tone={TONE[s.status]}>{s.status === 'sent' ? 'Vendor to accept' : SHIP_STATUS[s.status]}</StatusBadge>}</header>
      <ul>{items.map((x) => <li key={x}>{x}</li>)}</ul>
      {s.tracking ? <small>{s.courier} · {s.tracking}{s.booked ? ' (booked in the vendor portal)' : ''}{s.shippedAt ? ' · sent ' + dTime(s.shippedAt) : ''}{s.deliveredAt ? ' · delivered ' + dTime(s.deliveredAt) : ''}{s.cost ? ' · courier ' + tk(s.cost) : ''}</small> : null}
      {s.pay ? <small>The vendor gets {tk(s.pay.amount)}{s.fee ? ` (after their ${tk(s.fee)} parcel fee)` : ''} · {s.pay.status === 'unpaid' ? 'owed once delivered' : s.pay.status === 'owed' ? (s.pay.payoutId ? 'in payout ' + s.pay.payoutId : 'owed · paid in their next payout to ' + bankText(s.pay.to)) : 'paid' + (s.pay.payoutId ? ' in ' + s.pay.payoutId : '') + (s.pay.ref ? ' · ' + s.pay.ref : '')}</small> : null}
      {o.cancelled ? null : f ? (
        <div className="sva-form">
          <div className="sva-grid2">
            <div><label className="gc-label" htmlFor={'gp-c' + s.id}>Courier</label><select id={'gp-c' + s.id} className="gc-input gc-select" value={f.courier} onChange={(e) => setF({ ...f, courier: e.target.value })}><option value="">Choose…</option>{COURIERS.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><label className="gc-label" htmlFor={'gp-t' + s.id}>Tracking number</label><input id={'gp-t' + s.id} className="gc-input" value={f.tracking} onChange={(e) => setF({ ...f, tracking: e.target.value })} /></div>
            {s.from === 'stock' ? <div><label className="gc-label" htmlFor={'gp-k' + s.id}>Our courier cost (৳)</label><input id={'gp-k' + s.id} className="gc-input" inputMode="numeric" value={f.cost} onChange={(e) => setF({ ...f, cost: e.target.value })} /></div> : null}
          </div>
          <div className="sva-row"><button type="button" className="ix-btn ix-btn--primary" onClick={() => { if (say(moveShipment(o.id, s.id, { status: 'shipped', ...f }, by), 'Shipped')) setF(null); }}>{sup ? 'The vendor shipped it' : 'Mark shipped'}</button><button type="button" className="ix-btn" onClick={() => setF(null)}>Cancel</button></div>
        </div>
      ) : (
        <div className="sva-row">
          {s.status === 'preparing' ? <><button type="button" className="ix-btn" onClick={() => say(moveShipment(o.id, s.id, { status: 'packing' }, by), 'Packing')}>Packing</button><button type="button" className="ix-btn ix-btn--primary" onClick={() => setF({ courier: 'Steadfast', tracking: '', cost: '90' })}>Ship…</button></> : null}
          {['sent', 'accepted', 'packing'].includes(s.status) && sup ? <>
            <a className="ix-btn" href={`https://wa.me/${String(sup.phone).replace(/\D/g, '')}?text=${enc(poText)}`} target="_blank" rel="noopener noreferrer"><Icon name="message-circle" width="16" height="16" aria-hidden="true" />WhatsApp the order</a>
            <a className="ix-btn" href={`mailto:${sup.email}?subject=${enc('Order ' + o.id + '/' + s.id)}&body=${enc(poText)}`}><Icon name="mail" width="16" height="16" aria-hidden="true" />Email it</a>
            <button type="button" className="ix-btn ix-btn--primary" onClick={() => setF({ courier: '', tracking: '', cost: '' })}>They shipped it…</button>
          </> : null}
          {s.status === 'shipped' ? <button type="button" className="ix-btn ix-btn--primary" onClick={() => say(moveShipment(o.id, s.id, { status: 'delivered' }, by), sup ? 'Delivered · now owed to the vendor' : 'Delivered')}>Mark delivered</button> : null}
        </div>
      )}
    </div>
  );
}

export default function GsOrder() {
  const { ready, tick } = useGs();
  const [note, setNote] = useState('');
  const by = (() => { try { return staff().name; } catch { return 'Staff'; } })();
  const o = useMemo(() => (ready ? orderById(qp('id')) : null), [ready, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!ready) return <AdminShell active="gshop-order" title="Grid Shop order"><div style={{ minHeight: 400 }} aria-busy="true" /></AdminShell>;
  if (!o) return <AdminShell active="gshop-order" title="Grid Shop order"><div className="ix-page"><RecordHeader back="/admin/grid-shop" backLabel="Grid Shop orders" title="Order not found" /><section className="ix-card ix-empty"><EmptyState icon="package" title="This order is not here" /></section></div></AdminShell>;
  const p = profitOf(o);
  const shipped = o.shipments.some((s) => ['shipped', 'delivered'].includes(s.status));
  const cancel = async () => { if (await confirmDialog({ title: 'Cancel this order?', body: `Nothing has shipped. Our stock goes back on the shelf; refund ${tk(o.total)} in Finance › Refunds.`, confirmLabel: 'Cancel order', tone: 'danger' })) say(cancelOrder(o.id, by, 'Cancelled by GridCommerce'), 'Cancelled'); };
  return (
    <AdminShell active="gshop-order" title={o.id}>
      <style dangerouslySetInnerHTML={{ __html: SVA_CSS + GSA_CSS }} />
      <div className="ix-page">
        <RecordHeader back="/admin/grid-shop" backLabel="Grid Shop orders" title={`${o.shopName} · ${o.id}`} badges={<GsOrderStatus o={o} />}
          meta={<>Paid {dTime(o.paid.at)} · {payLabel(o.paid.method)} · {o.paid.txId}</>}
          more={[{ label: 'Open the store', href: '/admin/merchant?id=' + o.shopId }, !o.cancelled && !shipped ? { label: 'Cancel order', onClick: cancel, tone: 'danger' } : null].filter(Boolean)} />
        <div className="ix-record">
          <div className="ix-main">
            <section className="ix-card sva-pad" aria-labelledby="gso-p">
              <h2 id="gso-p">{o.shipments.length === 1 ? 'Parcel' : `${o.shipments.length} parcels`}</h2>
              {o.shipments.map((s) => <Parcel key={s.id} o={o} s={s} by={by} />)}
            </section>
            <section className="ix-card sva-pad" aria-labelledby="gso-i">
              <h2 id="gso-i">Items</h2>
              <div className="ix-table-wrap ix-table-wrap--show">
                <table className="ix-table ix-table--static gc-table--keep gc-table--scroll">
                  <caption className="sr-only">Items</caption>
                  <thead><tr><th scope="col">Item</th><th scope="col" className="ix-num">Qty</th><th scope="col" className="ix-num">Store price</th><th scope="col" className="ix-num">Discount</th><th scope="col" className="ix-num">Store paid</th><th scope="col" className="ix-num">Vendor gets</th><th scope="col" className="ix-num">We keep</th></tr></thead>
                  <tbody>{o.lines.map((l, i) => { const b = pbOf(l); const v = l.vendorId ? vendorById(l.vendorId) : null; return (
                    <tr key={i}>
                      <td><span className="gc-picrow"><Pic src={gsPic(l)} name={l.name} kind="item" size={32} /><span>{l.name}<span className="sva-sub">{v ? v.name : 'Our stock'}</span></span></span></td>
                      <td className="ix-num">{l.qty}</td>
                      <td className="ix-num">{tk(b.storeUnit)}{b.listPrice !== b.storeUnit ? <span className="sva-sub">vendor’s {tk(b.listPrice)}</span> : null}</td>
                      <td className="ix-num">{b.discount ? '−' + tk(b.discount * l.qty) : '—'}{b.discount ? <span className="sva-sub">paid by {b.fundedBy === 'vendor' ? 'vendor' : 'us'}</span> : null}</td>
                      <td className="ix-num">{tk(l.price * l.qty)}</td>
                      <td className="ix-num">{v ? tk(b.vendorGets * l.qty) : '—'}</td>
                      <td className="ix-num">{tk(b.gcKeeps * l.qty)}</td>
                    </tr>
                  ); })}</tbody>
                </table>
              </div>
            </section>
            <section className="ix-card sva-pad" aria-labelledby="gso-n">
              <h2 id="gso-n">Notes and history</h2>
              <div className="sva-row" style={{ flexWrap: 'nowrap' }}><input className="gc-input" aria-label="Note" placeholder="A note for the team" value={note} onChange={(e) => setNote(e.target.value)} /><button type="button" className="ix-btn" onClick={() => { if (say(addNote(o.id, note, by), 'Noted')) setNote(''); }}>Add</button></div>
              <ul className="sva-files">{o.history.slice().reverse().map((h, i) => <li key={i}><span>{h.text}<span className="sva-sub">{dTime(h.at)} · {h.by}</span></span></li>)}</ul>
            </section>
          </div>
          <aside className="ix-side" aria-label="Order details">
            <section className="ix-card sva-pad">
              <h2>Profit</h2>
              <KV rows={[['Sale (before VAT)', tk(p.revenue)], ['Goods (our cost + vendors)', '−' + tk(p.goods)], ['Our courier', '−' + tk(p.shipping)], p.vendorFees ? ['Vendors’ parcel fees', '+' + tk(p.vendorFees)] : null, p.gcFunded ? ['Discounts we paid', tk(p.gcFunded) + ' (in the sale)'] : null, p.platformFee ? ['Platform fee', tk(p.platformFee) + ' (in the sale)'] : null, ['Profit', `${tk(p.profit)}${p.margin != null ? ' · ' + p.margin + '%' : ''}`], ['Owed to vendors', tk(p.owed)], ['Paid to vendors', tk(p.paid)]]} />
              <p className="gc-help">Vendors are paid in payouts from their page (<Link href="/admin/grid-shop/vendors">Vendors</Link>); Finance › Expenses records each one.</p>
            </section>
            <section className="ix-card sva-pad">
              <h2>Deliver to</h2>
              <KV rows={[['Store', <Link key="s" href={'/admin/merchant?id=' + o.shopId}>{o.shopName}</Link>], ['Name', o.address.name], ['Mobile', o.address.phone], ['Address', o.address.line], ['District', o.address.district], o.note ? ['Note', o.note] : null].filter(Boolean)} />
            </section>
            <section className="ix-card sva-pad">
              <h2>Payment</h2>
              <KV rows={[['Items', tk(o.subtotal)], o.discount ? ['Discounts', '−' + tk(o.discount) + ' (in items)'] : null, o.platformFee ? ['Platform fee', tk(o.platformFee)] : null, ['Delivery', o.delivery ? tk(o.delivery) : 'Free'], ['VAT ' + o.vatPct + '%', tk(o.vat)], ['Paid', tk(o.total)]]} />
            </section>
          </aside>
        </div>
      </div>
    </AdminShell>
  );
}
