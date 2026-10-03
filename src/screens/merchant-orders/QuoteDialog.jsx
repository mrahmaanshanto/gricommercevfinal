'use client';
// QuoteDialog — a quote (proforma) for a wholesale buyer: buyer, items at the buyer's price list, discount, VAT,
// valid for N days, note. Save as draft or send; a sent quote prints as a proforma and converts into an order with an
// unpaid invoice and the goods held at a place (src/lib/quotes.js). Used in Order work › Quotes.

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog, StatusBadge } from '@/components/ui';
import { formatBDT, formatDate } from '@/lib/format';
import { orderableItems } from '@/lib/sellable';
import { getCustomers, tierOf, tierPrice } from '@/lib/customers';
import { usePlaceList } from '@/lib/usePlaces';
import { onlinePlace } from '@/lib/locations';
import { printNode } from '@/lib/printNode';
import { MERCHANT } from '@/lib/merchant';
import { orderHref, invoiceHref } from '@/lib/orders';
import { quoteBy, saveQuote, sendQuote, acceptQuote, declineQuote, convertQuote, quoteTotals, quoteState, QUOTE_STATE } from '@/lib/quotes';

const CSS = `
.qd{display:flex;flex-direction:column;gap:var(--space-4)}
.qd h3{margin:0 0 var(--space-2);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.qd-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.qd-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3)}
.qd-lines{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.qd-lines th{padding:0 var(--space-2) var(--space-2) 0;border-bottom:1px solid var(--border-subtle);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:left}
.qd-lines td{padding:6px var(--space-2) 6px 0;border-bottom:1px solid var(--border-subtle)}
.qd-lines .r{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.qd-lines input{width:84px;height:32px}
.qd-add{position:relative;margin-top:var(--space-2)}
.qd-hits{position:absolute;z-index:5;left:0;right:0;top:calc(100% + 4px);max-height:220px;overflow:auto;margin:0;padding:4px;list-style:none;background:var(--surface-card);border-radius:var(--radius-lg);box-shadow:var(--shadow-card)}
.qd-hits button{display:flex;justify-content:space-between;gap:var(--space-3);width:100%;min-height:36px;padding:0 var(--space-2);border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-sm);color:var(--text-heading);text-align:left;cursor:pointer}
.qd-hits button:hover,.qd-hits button:focus-visible{background:var(--surface-subtle)}
.qd-hits small{color:var(--text-muted);white-space:nowrap}
.qd-doc{display:none}
@media (max-width:640px){.qd-two,.qd-three{grid-template-columns:minmax(0,1fr)}.qd-lines input{width:64px}}
`;

const blank = () => ({ id: '', phone: '', lines: [], discount: 0, vatRate: 5, validDays: 7, note: '' });

/** open: { id } for a saved quote, or { id: '' } for a new one. */
export default function QuoteDialog({ open, onClose, onDone }) {
  const places = usePlaceList('stock');
  const [d, setD] = useState(blank());
  const [q, setQ] = useState('');
  const [place, setPlace] = useState('');
  const [items, setItems] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const docRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const saved = open.id ? quoteBy(open.id) : null;
    setD(saved ? { id: saved.id, phone: saved.customer.phone, lines: saved.lines.map((l) => ({ ...l })), discount: saved.discount, vatRate: saved.vatRate, validDays: Math.max(1, Math.round(((saved.validUntil || 0) - (saved.sentAt || saved.at)) / 864e5)) || 7, note: saved.note || '' } : blank());
    setItems(orderableItems({ channel: 'online' }));
    setBuyers(getCustomers().filter((c) => tierOf(c)));
    setPlace(onlinePlace());
    setQ('');
  }, [open]);
  if (!open) return null;

  const saved = d.id ? quoteBy(d.id) : null;
  const state = saved ? quoteState(saved) : 'draft';
  const locked = state === 'converted' || state === 'declined';
  const buyer = buyers.find((c) => c.phone === d.phone) || (saved ? { ...saved.customer } : null);
  const tier = buyer ? tierOf(buyer) || { off: 0 } : null;
  const t = quoteTotals(d);
  const needle = q.trim().toLowerCase();
  const hits = needle ? items.filter((it) => (it.name + ' ' + it.sku).toLowerCase().includes(needle)).slice(0, 8) : [];

  const setBuyer = (e) => {
    const c = buyers.find((x) => x.phone === e.target.value);
    const tr = tierOf(c);
    // prices follow the new buyer's price list
    setD({ ...d, phone: e.target.value, lines: d.lines.map((l) => ({ ...l, price: l.listPrice != null ? tierPrice(l.listPrice, tr) : l.price })) });
  };
  const add = (it) => {
    const at = d.lines.findIndex((l) => l.name === it.name);
    const lines = d.lines.slice();
    if (at >= 0) lines[at] = { ...lines[at], qty: Number(lines[at].qty) + 1 };
    else lines.push({ name: it.name, sku: it.sku, qty: 1, listPrice: it.listPrice, price: tierPrice(it.listPrice, tier) });
    setD({ ...d, lines }); setQ('');
  };
  const setLine = (i, k) => (e) => { const lines = d.lines.slice(); lines[i] = { ...lines[i], [k]: e.target.value === '' ? '' : Number(e.target.value) }; setD({ ...d, lines }); };
  const valid = !!buyer && d.lines.some((l) => Number(l.qty) > 0);
  const persist = (send) => {
    if (!valid) { toast('Choose a buyer and add an item', { tone: 'error' }); return null; }
    const tierId = buyer.tier || (tierOf(buyer) || {}).id || '';
    return saveQuote({ id: d.id, customer: { name: buyer.name, phone: buyer.phone, tier: tierId }, lines: d.lines, validDays: d.validDays, vatRate: d.vatRate, discount: d.discount, note: d.note, send });
  };
  const saveDraft = () => { const x = persist(false); if (x) { toast(`Quote ${x.id} saved`); onDone && onDone(); } };
  const saveSend = () => { const x = persist(true); if (x) { toast(`Quote ${x.id} sent to ${x.customer.name}`); onDone && onDone(); } };
  const resend = () => { sendQuote(saved); toast('Quote sent'); onDone && onDone(); };
  const accept = () => { acceptQuote(saved); toast('Quote accepted'); onDone && onDone(); };
  const decline = () => { declineQuote(saved); toast('Quote declined'); onDone && onDone(); };
  const convert = () => {
    const x = persist(false) || saved;
    if (!x) return;
    const r = convertQuote(x, { place });
    if (!r.ok) { toast(r.error, { tone: 'error' }); return; }
    toast(`Order ${r.orderId} made · invoice ${r.invoiceId}`);
    onDone && onDone();
  };
  const print = () => printNode(docRef.current, { title: (d.id || 'Quote') + ' proforma', css: '.qd-doc{display:block!important}' });

  const footer = locked ? null : <>
    {saved && state !== 'draft' ? <button type="button" className="gc-btn gc-btn--neutral" onClick={print}><Icon name="printer" width="16" height="16" aria-hidden="true" /> Print</button> : null}
    {saved && ['sent', 'expired'].includes(state) ? <button type="button" className="gc-btn gc-btn--neutral" onClick={decline}>Declined</button> : null}
    {saved && state === 'sent' ? <button type="button" className="gc-btn gc-btn--neutral" onClick={accept}>Accepted</button> : null}
    {saved && state === 'expired' ? <button type="button" className="gc-btn gc-btn--neutral" onClick={resend}>Send again</button> : null}
    {!saved || state === 'draft' ? <button type="button" className="gc-btn gc-btn--neutral" onClick={saveDraft}>Save draft</button> : null}
    {!saved || state === 'draft' ? <button type="button" className="gc-btn gc-btn--solid" onClick={saveSend}>Save and send</button>
      : ['sent', 'accepted'].includes(state) ? <button type="button" className="gc-btn gc-btn--solid" onClick={convert}>Convert to order</button> : null}
  </>;

  return (
    <Dialog open={!!open} title={saved ? `Quote ${saved.id}` : 'New quote'} onClose={onClose} width={720} footer={footer}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="qd">
        {saved ? <p className="gc-help" style={{ margin: 0, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}><StatusBadge tone={QUOTE_STATE[state][1]}>{QUOTE_STATE[state][0]}</StatusBadge>Made {formatDate(saved.at)}{saved.validUntil ? ' · valid until ' + formatDate(saved.validUntil) : ''}{saved.orderId ? <> · <Link href={orderHref(saved.orderId)}>Order {saved.orderId}</Link> · <Link href={invoiceHref(saved.invoiceId)}>Invoice {saved.invoiceId}</Link></> : null}</p> : null}
        <div className="qd-two">
          <div><label className="gc-label" htmlFor="qd-buyer">Wholesale buyer</label>
            <select id="qd-buyer" className="gc-input gc-select" data-autofocus value={d.phone} onChange={setBuyer} disabled={locked}>
              <option value="">Choose buyer</option>
              {buyers.map((c) => <option key={c.phone} value={c.phone}>{c.name} · {tierOf(c).label}</option>)}
            </select>
          </div>
          <div><label className="gc-label" htmlFor="qd-valid">Valid for</label><select id="qd-valid" className="gc-input gc-select" value={String(d.validDays)} onChange={(e) => setD({ ...d, validDays: Number(e.target.value) })} disabled={locked}>{[3, 7, 14, 30].map((n) => <option key={n} value={String(n)}>{n} days</option>)}</select></div>
        </div>
        <section>
          <h3>Items</h3>
          {d.lines.length ? (
            <table className="qd-lines">
              <thead><tr><th scope="col">Item</th><th scope="col">Qty</th><th scope="col">Price</th><th scope="col" className="r">Amount</th><th scope="col"><span className="sr-only">Remove</span></th></tr></thead>
              <tbody>{d.lines.map((l, i) => (
                <tr key={l.name + i}>
                  <td>{l.name}</td>
                  <td><input className="gc-input" type="number" min="0" inputMode="numeric" aria-label={'Quantity: ' + l.name} value={l.qty} onChange={setLine(i, 'qty')} disabled={locked} /></td>
                  <td><input className="gc-input" type="number" min="0" inputMode="numeric" aria-label={'Price: ' + l.name} value={l.price} onChange={setLine(i, 'price')} disabled={locked} /></td>
                  <td className="r">{formatBDT((Number(l.price) || 0) * (Number(l.qty) || 0))}</td>
                  <td className="r">{!locked ? <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={'Remove ' + l.name} onClick={() => setD({ ...d, lines: d.lines.filter((_, j) => j !== i) })}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button> : null}</td>
                </tr>
              ))}</tbody>
            </table>
          ) : <p className="gc-help" style={{ margin: 0 }}>No items yet.</p>}
          {!locked ? (
            <div className="qd-add">
              <label className="ix-search"><Icon name="search" width="16" height="16" aria-hidden="true" /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Add a product: name or SKU" aria-label="Add a product: name or SKU" /></label>
              {hits.length ? <ul className="qd-hits">{hits.map((it) => <li key={it.sku}><button type="button" onClick={() => add(it)}><span>{it.name}</span><small>{formatBDT(tierPrice(it.listPrice, tier))} · {it.stock} free</small></button></li>)}</ul> : null}
            </div>
          ) : null}
        </section>
        <div className="qd-three">
          <div><label className="gc-label" htmlFor="qd-disc">Discount (৳)</label><input id="qd-disc" className="gc-input" type="number" min="0" inputMode="numeric" value={d.discount} onChange={(e) => setD({ ...d, discount: e.target.value })} disabled={locked} /></div>
          <div><label className="gc-label" htmlFor="qd-vat">VAT (%)</label><input id="qd-vat" className="gc-input" type="number" min="0" inputMode="decimal" value={d.vatRate} onChange={(e) => setD({ ...d, vatRate: e.target.value })} disabled={locked} /></div>
          <div><span className="gc-label">Total</span><p style={{ margin: 0, minHeight: 32, display: 'flex', alignItems: 'center', fontWeight: 'var(--weight-semibold)', color: 'var(--text-heading)' }}>{formatBDT(t.total)}</p></div>
        </div>
        <div><label className="gc-label" htmlFor="qd-note">Note</label><input id="qd-note" className="gc-input" value={d.note} onChange={(e) => setD({ ...d, note: e.target.value })} placeholder="Optional" disabled={locked} /></div>
        {saved && ['sent', 'accepted'].includes(state) ? (
          <div><label className="gc-label" htmlFor="qd-place">Hold stock at</label><select id="qd-place" className="gc-input gc-select" value={place} onChange={(e) => setPlace(e.target.value)}>{places.map((x) => <option key={x}>{x}</option>)}</select><p className="gc-help" style={{ margin: '4px 0 0' }}>Converting makes an order and an unpaid invoice.</p></div>
        ) : null}
      </div>

      {/* the proforma, printed on its own */}
      <div className="qd-doc" aria-hidden="true">
        <div ref={docRef} style={{ fontFamily: 'var(--font-sans)', color: '#0f172a', padding: '10mm', display: 'flex', flexDirection: 'column', gap: '5mm' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><div><b style={{ fontSize: 'var(--text-xl)' }}>{MERCHANT.name}</b><div>{MERCHANT.phone}</div></div><div style={{ textAlign: 'right' }}><b style={{ fontSize: 'var(--text-lg)' }}>Proforma invoice</b><div>{d.id}</div><div>{saved ? formatDate(saved.sentAt || saved.at) : ''}</div></div></div>
          <div><div style={{ fontSize: 'var(--text-xs)' }}>To</div><b>{buyer ? buyer.name : ''}</b><div>{buyer ? buyer.phone : ''}</div></div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Item', 'Qty', 'Price', 'Amount'].map((h, i) => <th key={h} style={{ textAlign: i ? 'right' : 'left', borderBottom: '1px solid #0f172a', padding: '2mm 0' }}>{h}</th>)}</tr></thead>
            <tbody>{d.lines.map((l, i) => <tr key={i}><td style={{ padding: '2mm 0' }}>{l.name}</td><td style={{ textAlign: 'right' }}>{l.qty}</td><td style={{ textAlign: 'right' }}>{formatBDT(l.price)}</td><td style={{ textAlign: 'right' }}>{formatBDT(l.price * l.qty)}</td></tr>)}</tbody>
          </table>
          <div style={{ alignSelf: 'flex-end', minWidth: '60mm' }}>
            {[['Subtotal', t.gross], t.discount ? ['Discount', -t.discount] : null, t.tax ? [`VAT ${d.vatRate}%`, t.tax] : null, ['Total', t.total]].filter(Boolean).map(([k, val]) => <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}><span>{k}</span><b>{val < 0 ? '−' + formatBDT(-val) : formatBDT(val)}</b></div>)}
          </div>
          <div style={{ fontSize: 'var(--text-xs)' }}>{saved && saved.validUntil ? 'Valid until ' + formatDate(saved.validUntil) + '. ' : ''}{d.note}</div>
        </div>
      </div>
    </Dialog>
  );
}
