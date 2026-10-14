'use client';
// QuoteDialog — a quote (proforma) for a business buyer: a wholesale buyer (while wholesale is on), a company or a
// business lead (WH-F4). Items are priced by the one price rule (wholesalePrice.js › priceFor: the buyer's price list,
// quantity slabs, wholesale price, group price, retail) and keep a price typed by hand; a wholesale buyer can be quoted
// "Wholesale only" products and sees each line's MOQ (WH-U4). Save as draft or send; a sent quote prints as a proforma.
// Converting runs the POS checks first (credit limit, overdue hold, restrictions, MOQ, free stock — WH-U3): blocks are
// listed and stop it, a manager's PIN covers the credit limit, then it makes an order, an unpaid invoice and holds the
// goods at a place (src/lib/quotes.js › convertQuote). A lead's quote is linked from the lead ("Quote sent").
// Used on Orders › Quotes (/quotes), the lead page and the buyer / company profile.
//   open: { id } a saved quote · { id: '', lead: 'LD-…' } a new one for a lead · { id: '', buyer: phone | customer ID }

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog, StatusBadge } from '@/components/ui';
import { ManagerPin } from '@/components/ManagerPin';
import { formatBDT, formatDate } from '@/lib/format';
import { orderableItems } from '@/lib/sellable';
import { phoneDigits } from '@/lib/customers';
import { usePlaceList } from '@/lib/usePlaces';
import { onlinePlace } from '@/lib/locations';
import { printDoc } from '@/lib/shareDoc';
import { OffScreen } from '@/components/docs/DocPaper';
import { ProformaPaper, buyerDetails } from '@/components/docs/ProformaPaper';
import { sendDocOnWhatsApp } from '@/components/docs/ShareActions';
import { orderHref, invoiceHref } from '@/lib/orders';
import { currentUser } from '@/lib/team';
import { saveLead, logActivity } from '@/lib/leads';
import { SOURCE_WORDS } from '@/lib/wholesalePrice';
import { businessBuyers, linePrice, isWholesaleBuyer } from '@/lib/salesOrder';
import { quoteBy, saveQuote, sendQuote, acceptQuote, declineQuote, convertQuote, checkQuote, quoteTotals, quoteState, QUOTE_STATE } from '@/lib/quotes';

const CSS = `
.qd{display:flex;flex-direction:column;gap:var(--space-4)}
.qd h3{margin:0 0 var(--space-2);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.qd-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.qd-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3)}
.qd-lines{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.qd-lines th{padding:0 var(--space-2) var(--space-2) 0;border-bottom:1px solid var(--border-subtle);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:left}
.qd-lines td{padding:6px var(--space-2) 6px 0;border-bottom:1px solid var(--border-subtle);vertical-align:top}
.qd-lines .r{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.qd-lines input{width:84px;height:32px}
.qd-lines small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.qd-lines small.is-warn{color:var(--text-warning)}
.qd-lines small.is-bad{color:var(--text-danger)}
.qd-add{position:relative;margin-top:var(--space-2)}
.qd-hits{position:absolute;z-index:5;left:0;right:0;top:calc(100% + 4px);max-height:220px;overflow:auto;margin:0;padding:4px;list-style:none;background:var(--surface-card);border-radius:var(--radius-lg);box-shadow:var(--shadow-card)}
.qd-hits button{display:flex;justify-content:space-between;gap:var(--space-3);width:100%;min-height:36px;padding:0 var(--space-2);border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-sm);color:var(--text-heading);text-align:left;cursor:pointer}
.qd-hits button:hover,.qd-hits button:focus-visible{background:var(--surface-subtle)}
.qd-hits small{color:var(--text-muted);white-space:nowrap}
.qd-checks{display:flex;flex-direction:column;gap:6px;margin:0;padding:var(--space-3);list-style:none;border-radius:var(--radius-lg);font-size:var(--text-sm)}
.qd-checks.is-bad{background:var(--fill-danger-soft);color:var(--text-danger)}
.qd-checks.is-warn{background:var(--fill-warning-soft);color:var(--text-warning)}
.qd-checks.is-ok{background:var(--fill-success-soft);color:var(--text-success)}
.qd-checks li{display:flex;gap:8px;align-items:flex-start}
.qd-checks svg{flex:none;margin-top:2px}
.qd-doc{display:none}
@media (max-width:640px){.qd-two,.qd-three{grid-template-columns:minmax(0,1fr)}.qd-lines input{width:64px}}
`;

const blank = () => ({ id: '', key: '', lines: [], discount: 0, vatRate: 5, validDays: 7, note: '' });
const keyOf = (c) => (!c ? '' : c.leadId ? 'l:' + c.leadId : c.kind === 'company' && c.id ? 'c:' + c.id : 'w:' + phoneDigits(c.phone));
const VALID = [3, 7, 14, 30];
const nearestDays = (n) => VALID.reduce((a, x) => (Math.abs(x - n) < Math.abs(a - n) ? x : a), 7);
const KIND_WORD = { wholesale: 'Wholesale buyers', company: 'Companies', lead: 'Leads' };
/** Was this saved line's price typed by hand? (saved lines say so; older ones are compared with the price rule) */
function wasTyped(c, l) {
  if (l.auto === true) return false;
  if (l.auto === false) return true;
  if (!l.sku) return false;
  return Number(linePrice(c, l.sku, Number(l.qty) || 1).price) !== Number(l.price);
}
const me = () => { try { return currentUser() || {}; } catch { return {}; } };

/** open: { id } for a saved quote, { id: '' } for a new one (optionally with lead or buyer). */
export default function QuoteDialog({ open, onClose, onDone }) {
  const places = usePlaceList('stock');
  const [d, setD] = useState(blank());
  const [q, setQ] = useState('');
  const [place, setPlace] = useState('');
  const [buyers, setBuyers] = useState([]);
  const [pin, setPin] = useState(false);
  const docRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const list = businessBuyers();
    const saved = open.id ? quoteBy(open.id) : null;
    // a saved quote's buyer may no longer be listed (a lead that was won): keep it as it was saved
    if (saved && !list.some((b) => b.key === keyOf(saved.customer))) list.unshift({ ...saved.customer, key: keyOf(saved.customer), label: saved.customer.name });
    setBuyers(list);
    let key = saved ? keyOf(saved.customer) : '';
    if (!saved && open.lead) key = 'l:' + open.lead;
    if (!saved && open.buyer) { const ref = String(open.buyer); const hit = list.find((b) => b.id === ref || (phoneDigits(ref) && phoneDigits(b.phone) === phoneDigits(ref))); key = hit ? hit.key : ''; }
    setD(saved ? { id: saved.id, key, lines: saved.lines.map((l) => ({ ...l, manual: wasTyped(saved.customer, l) })), discount: saved.discount, vatRate: saved.vatRate, validDays: nearestDays(((saved.validUntil || 0) - (saved.sentAt || saved.at)) / 864e5), note: saved.note || '' } : { ...blank(), key });
    setPlace(saved && saved.place ? saved.place : onlinePlace());
    setQ(''); setPin(false);
  }, [open]);

  const buyer = buyers.find((b) => b.key === d.key) || null;
  const wholesale = isWholesaleBuyer(buyer);
  // the item picker: a wholesale buyer can be quoted "Wholesale only" products; everyone else what is sold retail
  const items = useMemo(() => (open ? orderableItems({ channel: wholesale ? 'wholesale' : 'online', place }) : []), [open, wholesale, place]);
  if (!open) return null;

  const saved = d.id ? quoteBy(d.id) : null;
  const state = saved ? quoteState(saved) : 'draft';
  const locked = state === 'converted' || state === 'declined';
  const t = quoteTotals(d);
  const needle = q.trim().toLowerCase();
  const hits = needle ? items.filter((it) => (it.name + ' ' + it.sku).toLowerCase().includes(needle)).slice(0, 8) : [];
  // one price rule: re-priced when the buyer or the quantity changes, unless the price was typed by hand
  const priced = (b, l) => {
    if (l.manual || !l.sku) return l;
    const p = linePrice(b, l.sku, Number(l.qty) || 1);
    return { ...l, price: p.price, listPrice: p.listPrice, source: p.source, note: p.note || '', moq: p.moq || 0 };
  };
  const info = (l) => (l.sku ? linePrice(buyer, l.sku, Number(l.qty) || 1) : null);
  const converting = !!saved && ['sent', 'accepted'].includes(state);
  const check = converting ? checkQuote({ ...saved, ...d, customer: buyer || saved.customer }, { place }) : null;

  const setBuyer = (e) => { const b = buyers.find((x) => x.key === e.target.value) || null; setD({ ...d, key: e.target.value, lines: d.lines.map((l) => priced(b, l)) }); };
  const add = (it) => {
    const at = d.lines.findIndex((l) => l.sku === it.sku);
    const lines = d.lines.slice();
    if (at >= 0) lines[at] = priced(buyer, { ...lines[at], qty: Number(lines[at].qty) + 1 });
    else {
      const moq = wholesale ? Number((info({ sku: it.sku, qty: 1 }) || {}).moq) || 0 : 0;
      lines.push(priced(buyer, { name: it.name, sku: it.sku, qty: Math.max(1, moq) }));
    }
    setD({ ...d, lines }); setQ('');
  };
  const setQty = (i) => (e) => { const lines = d.lines.slice(); lines[i] = priced(buyer, { ...lines[i], qty: e.target.value === '' ? '' : Math.max(0, Number(e.target.value)) }); setD({ ...d, lines }); };
  const setPrice = (i) => (e) => { const lines = d.lines.slice(); lines[i] = { ...lines[i], price: e.target.value === '' ? '' : Number(e.target.value), manual: true }; setD({ ...d, lines }); };
  const valid = !!buyer && d.lines.some((l) => Number(l.qty) > 0);
  const persist = (send) => {
    if (!valid) { toast('Choose a buyer and add an item', { tone: 'error' }); return null; }
    const u = me();
    const x = saveQuote({ id: d.id, customer: buyer, lines: d.lines.map(({ manual, ...l }) => ({ ...l, auto: !manual })), validDays: d.validDays, vatRate: d.vatRate, discount: d.discount, note: d.note, send, by: u.name || 'Staff' });
    // the lead's "Quote sent" stage links to this quote
    if (buyer.leadId) {
      if (send) logActivity(buyer.leadId, { kind: 'quote', text: `Quote ${x.id} sent · ${formatBDT(quoteTotals(x).total)}`, by: u.id || 'ceo', quoteId: x.id });
      else saveLead({ id: buyer.leadId, quoteId: x.id });
    }
    return x;
  };
  const saveDraft = () => { const x = persist(false); if (x) { toast(`Quote ${x.id} saved`); onDone && onDone(); } };
  // sending = the shop's WhatsApp opens with the quote's message (number, total, valid until, link) and the send is
  // logged in the delivery log (lib/shareDoc.js, WH-F5)
  const shareQuote = (x) => sendDocOnWhatsApp({ kind: 'quote', id: x.id, to: { name: x.customer.name, phone: x.customer.phone }, total: quoteTotals(x).total, dueAt: x.validUntil });
  const saveSend = () => { const x = persist(true); if (x) { shareQuote(x); onDone && onDone(); } };
  const resend = () => { const x = sendQuote(saved) || quoteBy(saved.id) || saved; shareQuote(x); onDone && onDone(); };
  const accept = () => { acceptQuote(saved); toast('Quote accepted'); onDone && onDone(); };
  const decline = () => { declineQuote(saved); toast('Quote declined'); onDone && onDone(); };
  const convert = (approvedBy = '') => {
    if (!check) return;
    if (!check.ok) { toast(check.blocks[0], { tone: 'error' }); return; }
    if (check.needPin && !approvedBy) { setPin(true); return; }
    const x = persist(false);   // what is on screen is what gets converted
    const r = convertQuote(x || saved, { place, by: me().name || 'Staff', approvedBy });
    setPin(false);
    if (!r.ok) { toast(r.error, { tone: 'error' }); return; }
    toast(`Order ${r.orderId} made · invoice ${r.invoiceId}${r.route === 'online' ? '' : ' · deliver it from the invoice'}`);
    onDone && onDone();
  };
  const print = () => printDoc(docRef.current, (d.id || 'Quote') + ' proforma');

  const footer = locked ? null : <>
    {saved && state !== 'draft' ? <button type="button" className="gc-btn gc-btn--neutral" onClick={() => shareQuote(saved)}><Icon name="send" width="16" height="16" aria-hidden="true" /> WhatsApp</button> : null}
    {saved && state !== 'draft' ? <button type="button" className="gc-btn gc-btn--neutral" onClick={print}><Icon name="download" width="16" height="16" aria-hidden="true" /> PDF</button> : null}
    {saved && ['sent', 'expired'].includes(state) ? <button type="button" className="gc-btn gc-btn--neutral" onClick={decline}>Declined</button> : null}
    {saved && state === 'sent' ? <button type="button" className="gc-btn gc-btn--neutral" onClick={accept}>Accepted</button> : null}
    {saved && state === 'expired' ? <button type="button" className="gc-btn gc-btn--neutral" onClick={resend}>Send again</button> : null}
    {!saved || state === 'draft' ? <button type="button" className="gc-btn gc-btn--neutral" onClick={saveDraft}>Save draft</button> : null}
    {!saved || state === 'draft' ? <button type="button" className="gc-btn gc-btn--solid" onClick={saveSend}>Save and send</button>
      : converting ? <button type="button" className="gc-btn gc-btn--solid" disabled={!!check && !check.ok} onClick={() => convert()}>{check && check.needPin ? 'Convert · manager PIN' : 'Convert to order'}</button> : null}
  </>;

  const groups = ['wholesale', 'company', 'lead'].map((k) => [k, buyers.filter((b) => b.kind === k)]).filter(([, l]) => l.length);
  const other = buyers.filter((b) => !KIND_WORD[b.kind]);

  return (<>
    <Dialog open={!!open} title={saved ? `Quote ${saved.id}` : 'New quote'} onClose={onClose} width={760} footer={footer}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="qd">
        {saved ? <p className="gc-help" style={{ margin: 0, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}><StatusBadge tone={QUOTE_STATE[state][1]}>{QUOTE_STATE[state][0]}</StatusBadge>Made {formatDate(saved.at)}{saved.validUntil ? ' · valid until ' + formatDate(saved.validUntil) : ''}{saved.orderId ? <> · <Link href={orderHref(saved.orderId)}>Order {saved.orderId}</Link> · <Link href={invoiceHref(saved.invoiceId)}>Invoice {saved.invoiceId}</Link></> : null}{saved.customer.leadId ? <> · <Link href={'/sales-leads?lead=' + saved.customer.leadId}>Lead {saved.customer.leadId}</Link></> : null}</p> : null}
        <div className="qd-two">
          <div><label className="gc-label" htmlFor="qd-buyer">Buyer</label>
            <select id="qd-buyer" className="gc-input gc-select" data-autofocus value={d.key} onChange={setBuyer} disabled={locked || (saved && state !== 'draft')}>
              <option value="">Choose buyer</option>
              {other.map((b) => <option key={b.key} value={b.key}>{b.label || b.name}</option>)}
              {groups.map(([k, list]) => <optgroup key={k} label={KIND_WORD[k]}>{list.map((b) => <option key={b.key} value={b.key}>{b.label}</option>)}</optgroup>)}
            </select>
            {buyer && buyer.kind === 'lead' ? <p className="gc-help" style={{ margin: '4px 0 0' }}>A lead: retail prices. Converting makes them a customer.</p> : null}
          </div>
          <div><label className="gc-label" htmlFor="qd-valid">Valid for</label><select id="qd-valid" className="gc-input gc-select" value={String(d.validDays)} onChange={(e) => setD({ ...d, validDays: Number(e.target.value) })} disabled={locked}>{VALID.map((n) => <option key={n} value={String(n)}>{n} days</option>)}</select></div>
        </div>
        <section>
          <h3>Items</h3>
          {d.lines.length ? (
            <div className="gc-table-wrap">
              <table className="qd-lines">
                <thead><tr><th scope="col">Item</th><th scope="col">Qty</th><th scope="col">Price</th><th scope="col" className="r">Amount</th><th scope="col"><span className="sr-only">Remove</span></th></tr></thead>
                <tbody>{d.lines.map((l, i) => {
                  const p = info(l);
                  const moq = wholesale && p ? p.moq : 0;
                  const ln = check && check.lines[i];
                  return (
                    <tr key={(l.sku || l.name) + i}>
                      <td>{l.name}
                        {p && !l.manual && p.source !== 'retail' ? <small>{p.note || SOURCE_WORDS[p.source]}</small> : null}
                        {l.manual && l.listPrice != null && Number(l.price) !== Number(l.listPrice) ? <small>Price typed by hand · list {formatBDT(l.listPrice)}</small> : null}
                        {moq ? <small className={Number(l.qty) < moq ? 'is-warn' : ''}>{Number(l.qty) < moq ? `MOQ ${moq} · only ${Number(l.qty) || 0}` : `MOQ ${moq}`}</small> : null}
                        {ln && ln.short ? <small className="is-bad">{Math.max(0, ln.free)} free at {place}</small> : null}
                      </td>
                      <td><input className="gc-input" type="number" min="0" inputMode="numeric" aria-label={'Quantity: ' + l.name} value={l.qty} onChange={setQty(i)} disabled={locked} /></td>
                      <td><input className="gc-input" type="number" min="0" inputMode="numeric" aria-label={'Price: ' + l.name} value={l.price} onChange={setPrice(i)} disabled={locked} /></td>
                      <td className="r">{formatBDT((Number(l.price) || 0) * (Number(l.qty) || 0))}</td>
                      <td className="r">{!locked ? <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={'Remove ' + l.name} onClick={() => setD({ ...d, lines: d.lines.filter((_, j) => j !== i) })}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button> : null}</td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          ) : <p className="gc-help" style={{ margin: 0 }}>No items yet.</p>}
          {!locked ? (
            <div className="qd-add">
              <label className="ix-search"><Icon name="search" width="16" height="16" aria-hidden="true" /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Add a product: name or SKU" aria-label="Add a product: name or SKU" /></label>
              {hits.length ? <ul className="qd-hits">{hits.map((it) => { const p = linePrice(buyer, it.sku, 1); return <li key={it.sku}><button type="button" onClick={() => add(it)}><span>{it.name}</span><small>{formatBDT(p.price)}{wholesale && p.moq ? ' · MOQ ' + p.moq : ''} · {it.stock} free</small></button></li>; })}</ul> : null}
            </div>
          ) : null}
        </section>
        <div className="qd-three">
          <div><label className="gc-label" htmlFor="qd-disc">Discount (৳)</label><input id="qd-disc" className="gc-input" type="number" min="0" inputMode="numeric" value={d.discount} onChange={(e) => setD({ ...d, discount: e.target.value })} disabled={locked} /></div>
          <div><label className="gc-label" htmlFor="qd-vat">VAT (%)</label><input id="qd-vat" className="gc-input" type="number" min="0" inputMode="decimal" value={d.vatRate} onChange={(e) => setD({ ...d, vatRate: e.target.value })} disabled={locked} /></div>
          <div><span className="gc-label">Total</span><p style={{ margin: 0, minHeight: 32, display: 'flex', alignItems: 'center', fontWeight: 'var(--weight-semibold)', color: 'var(--text-heading)' }}>{formatBDT(t.total)}</p></div>
        </div>
        <div><label className="gc-label" htmlFor="qd-note">Note</label><input id="qd-note" className="gc-input" value={d.note} onChange={(e) => setD({ ...d, note: e.target.value })} placeholder="Optional" disabled={locked} /></div>
        {converting ? (<>
          <div><label className="gc-label" htmlFor="qd-place">Hold stock at</label><select id="qd-place" className="gc-input gc-select" value={place} onChange={(e) => setPlace(e.target.value)}>{places.map((x) => <option key={x}>{x}</option>)}</select><p className="gc-help" style={{ margin: '4px 0 0' }}>Converting makes an order and an unpaid invoice of {formatBDT(t.total)}.</p></div>
          {check ? (
            check.blocks.length ? <ul className="qd-checks is-bad" role="alert" aria-label="Can't convert yet">{check.blocks.map((x, i) => <li key={i}><Icon name="circle-x" width="16" height="16" aria-hidden="true" />{x}</li>)}</ul>
              : check.needPin || check.warnings.length ? <ul className="qd-checks is-warn" aria-label="Check before converting">{check.needPin ? <li><Icon name="lock" width="16" height="16" aria-hidden="true" />{check.pinReason} A manager approves with their PIN.</li> : null}{check.warnings.map((x, i) => <li key={i}><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" />{x}</li>)}</ul>
                : <ul className="qd-checks is-ok" aria-label="Checks"><li><Icon name="circle-check" width="16" height="16" aria-hidden="true" />Credit, restrictions and stock are fine.</li></ul>
          ) : null}
        </>) : null}
      </div>

      {/* the proforma, printed on its own: the shop's letterhead, buyer address and BIN, bank and bKash, payment terms */}
      <OffScreen innerRef={docRef}>
        <ProformaPaper quote={{ ...(saved || {}), id: d.id, lines: d.lines, vatRate: d.vatRate, note: d.note }} buyer={buyerDetails(buyer || (saved && saved.customer))} totals={t} />
      </OffScreen>
    </Dialog>
    <ManagerPin open={pin} reason={check ? check.pinReason : ''} action="Credit limit" amount={t.total} refId={saved ? saved.id : ''} onApprove={(who) => convert(who)} onClose={() => setPin(false)} />
  </>);
}
