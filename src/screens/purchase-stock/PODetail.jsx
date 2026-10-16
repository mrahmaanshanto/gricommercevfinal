'use client';
// PODetail — one purchase order (/po-detail?no=<no>), laid out like Shopify's purchase order page: a record header
// (back to the list, number, status, supplier and date), the work on the left (products and what has arrived,
// deliveries, extra costs, history) and the facts on the right (supplier, payment and terms, files, note).
// What can be done follows the order's status (lib/poFlow.js, PR-F4 / PR-F5):
//   waiting approval  Approve / Reject (with a reason) by the owner or the warehouse manager, never by the person who
//                     made it; a rejected order is a draft again with the reason on top
//   draft             Send for approval (over the limit in Settings › Stock setup) or Place order
//   approved          Send to supplier: WhatsApp with the order written out, and the printed order (PDF) to attach
//   sent / partly     Receive goods; Close the rest when part of it will never come
//   any time          Edit (until everything arrived), Cancel with a reason (before anything arrived), Print, Add a cost
// - An order made in this browser comes from src/lib/purchaseOrders.js; its payment is read from the supplier bills
//   made when goods were received (src/lib/supplierBills.js). Demo orders keep their changes beside them (poFlow.js).
// - PO-2609-0020 (also shown when the number is unknown) carries its demo deliveries, payment, costs, files, note and history.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { StatusBadge, InfoTip, Dialog } from '@/components/ui';
import { RecordHeader, KV } from '@/components/ui/IndexKit';
import { toast } from '@/runtime/ui';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { getDb, findSupplier, billLeft, termsLabel, daysFrom } from '@/lib/supplierBills';
import { poOf, approvePO, rejectPO, submitPO, markSent, cancelPO, closeRemaining, editPO, addCost, canApprove, canCancel, canClose, canEdit, needsApproval, approvalLimit, whatsappLink, PO_EVENT } from '@/lib/poFlow';
import { currentUser, SESSION_EVENT } from '@/lib/team';
import { MERCHANT } from '@/lib/merchant';
import { PODocument, printPO, ReasonDialog, PO_DOC_CSS } from './poParts';
import { Pic } from '@/components/ui/Pic';
import { productPic } from '@/lib/pictures';

const DEFAULT_NO = 'PO-2609-0020';
const COST_LABEL = { ship: 'Transport / shipping', customs: 'Customs & LC charges', courier: 'Courier & labour' };
const at = (m, d, h, min) => new Date(2026, m - 1, d, h, min).getTime();
// what the demo order PO-2609-0020 has been through
const DEMO_EXTRA = {
  [DEFAULT_NO]: {
    invoice: 'NF-2231', terms: 30, dueAt: at(10, 12, 12, 0), paidText: 'Paid (15 Sep, bKash)',
    deliveries: [
      { grn: 'GRN-0112', at: at(9, 15, 11, 5), qty: 80, by: 'Karim (store)', note: 'Challan photo attached' },
      { grn: 'GRN-0118', at: at(9, 17, 16, 10), qty: 60, by: 'Karim (store)', note: '2 cases had scratches — kept, noted' },
    ],
    costs: [{ label: 'Transport · GRN-0112', amt: 1200 }, { label: 'Labour · GRN-0118', amt: 300 }],
    files: [{ name: 'supplier-invoice-NF-2231.pdf', size: '1.2 MB', icon: 'file-text' }, { name: 'challan-15-sep.jpg', size: '860 KB', icon: 'image' }],
    note: 'Supplier will send the lens protectors with the next batch, before 22 Sep.',
    history: [
      { at: at(9, 17, 16, 10), text: 'Second delivery received (60 pcs)', ok: true },
      { at: at(9, 15, 18, 32), text: 'Paid ৳50,000 by bKash', ok: true },
      { at: at(9, 15, 11, 5), text: 'First delivery received (80 pcs)', ok: true },
      { at: at(9, 13, 10, 20), text: 'Sent to supplier on WhatsApp' },
      { at: at(9, 12, 19, 48), text: 'Approved by Admin' },
    ],
  },
};
const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many || one + 's');

/** One shape for both kinds of order (poFlow.poOf plus what the page shows). */
function modelOf(no) {
  const po = poOf(no) || poOf(DEFAULT_NO);
  const x = po.demo ? DEMO_EXTRA[po.no] || {} : {};
  const extra = po.extra || {};
  const bills = getDb().bills.filter((b) => b.po === po.no);
  const billed = bills.reduce((a, b) => a + (b.amount || 0), 0);
  const left = bills.reduce((a, b) => a + billLeft(b), 0);
  const made = po.demo ? [] : [
    { at: po.at, text: 'Made as a draft' + (po.from && po.from.length ? ' from staff requests' : '') + (po.by ? ' by ' + po.by : '') },
    po.sentAt && !(po.log || []).some((l) => /^Sent to/.test(l.text)) ? { at: po.sentAt, text: `Sent to ${po.supplier}` } : null,
  ];
  return {
    ...po, invoice: po.invoice || x.invoice || '', note: po.note != null ? po.note : x.note || '', terms: po.terms != null ? po.terms : x.terms, from: po.from || [],
    deliveries: [...(po.deliveries || []).map((d) => ({ ...d, note: d.place })), ...(x.deliveries || [])],
    costs: [...(x.costs || []), ...Object.keys(COST_LABEL).filter((k) => Number(extra[k]) > 0).map((k) => ({ label: COST_LABEL[k], amt: Number(extra[k]) })), ...(po.costs || [])],
    files: x.files || [],
    history: [...(po.log || []).map((l) => ({ at: l.at, text: l.text, ok: l.ok })), ...(x.history || []), ...made].filter(Boolean).sort((a, b) => b.at - a.at),
    pay: !po.demo && bills.length ? { billed, paid: billed - left, left } : null,
    demoPay: po.demo ? { total: po.total, paid: po.paid || 0, left: Math.max(0, po.total - (po.paid || 0)), paidText: x.paidText, due: po.s === 'cancelled' ? '' : po.due, dueAt: x.dueAt, overdue: !!po.overdue } : null,
    receive: ['approved', 'ordered', 'partial'].includes(po.s) ? `/receive-goods?po=${encodeURIComponent(po.no)}` : '',
  };
}

const CSS = `
.pd-id{font-family:var(--font-data)}
.pd-tw{overflow-x:auto}
.pd-tw .ix-table tbody tr{cursor:default}
.pd-tw .ix-table tbody tr:hover td{background:none}
.pd-tw .ix-table td:first-child{white-space:normal;min-width:180px}
.pd-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.pd-total td{font-weight:var(--weight-semibold);color:var(--text-heading);border-top:1px solid var(--border-subtle)}
.pd-list{display:flex;flex-direction:column;gap:var(--space-3);margin:0;padding:0;list-style:none}
.pd-list li{display:flex;align-items:flex-start;gap:var(--space-3);font-size:var(--text-sm);color:var(--text-body)}
.pd-list li>span:nth-child(2){flex:1;min-width:0}
.pd-dot{flex:none;width:8px;height:8px;margin-top:6px;border-radius:var(--radius-full);background:var(--primary)}
.pd-dot--ok{background:var(--text-success)}
.pd-grn{flex:none;font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-body)}
.pd-file{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm)}
.pd-file svg{flex:none;color:var(--text-muted)}
.pd-file>span:nth-child(2){flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pd-note{margin:0;font-size:var(--text-sm);color:var(--text-body)}
.pd-empty{margin:0;font-size:var(--text-sm);color:var(--text-muted)}
.pd-costs .ix-kv{margin-bottom:var(--space-3)}
.pd-sup{display:flex;flex-direction:column;gap:var(--space-2)}
.pd-sup>a.ix-strong,.pd-sup>span{font-size:var(--text-sm)}
.pd-banner{display:flex;align-items:center;gap:var(--space-2)}
.pd-send,.pd-edit{display:flex;flex-direction:column;gap:var(--space-3)}
.pd-msg{margin:4px 0 0;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-family:var(--font-sans);font-size:var(--text-sm);white-space:pre-wrap;color:var(--text-body)}
.pd-send__acts{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.pd-num{width:96px}
.pd-drop td{opacity:.5;text-decoration:line-through}
.pd-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
@media (max-width:640px){.pd-tw .ix-table td:first-child{min-width:0}.pd-two{grid-template-columns:minmax(0,1fr)}}
`;

export default function PODetail() {
  const [po, setPo] = useState(null);
  const [sup, setSup] = useState(null);
  const [me, setMe] = useState(null);
  const [ask, setAsk] = useState('');          // 'reject' | 'cancel' | 'close'
  const [sending, setSending] = useState(false);
  const [edit, setEdit] = useState(null);      // { lines, note, expected }
  const [cost, setCost] = useState(null);      // { label, amt, err }
  const load = () => {
    const no = new URLSearchParams(window.location.search).get('no');
    const m = modelOf(no);
    setPo(m); setMe(currentUser());
    setSup(findSupplier(m.supplier, getDb().suppliers));
  };
  useEffect(() => {
    load();
    window.addEventListener(PO_EVENT, load); window.addEventListener(SESSION_EVENT, load);
    return () => { window.removeEventListener(PO_EVENT, load); window.removeEventListener(SESSION_EVENT, load); };
  }, []);

  const run = (r, okText) => { if (!r.ok) { toast(r.error, { tone: 'error' }); return false; } load(); if (okText) toast(okText); return true; };
  const approve = () => run(approvePO(po.no, me), `${po.no} approved. Send it to ${po.supplier} next.`);
  const submit = () => { const r = submitPO(po.no, me); if (run(r)) toast(r.waiting ? `${po.no} sent for approval` : `${po.no} placed. Send it to ${po.supplier} next.`); };
  const sent = (via) => { const r = markSent(po.no, me, via); if (run(r)) { setSending(false); toast(`${po.no} marked as sent to ${po.supplier}`); } };
  const doPrint = () => { if (!printPO(po)) toast('The printed order is still loading. Try again.', { tone: 'error' }); };
  const onReason = (reason) => {
    const r = ask === 'reject' ? rejectPO(po.no, me, reason) : ask === 'cancel' ? cancelPO(po.no, me, reason) : closeRemaining(po.no, me, reason);
    if (run(r, ask === 'reject' ? `${po.no} rejected and sent back as a draft` : ask === 'cancel' ? `${po.no} cancelled` : `${po.no} closed. The rest is not coming.`)) setAsk('');
  };
  const saveEdit = (e) => {
    e.preventDefault();
    const r = editPO(po.no, me, { lines: edit.lines.filter((l) => !l.drop), note: edit.note, expected: edit.expected });
    if (!r.ok) { toast(r.error, { tone: 'error' }); return; }
    setEdit(null); load();
    toast(r.same ? 'Nothing changed' : r.back ? `${po.no} saved. It needs approval again.` : `${po.no} saved`);
  };
  const saveCost = (e) => {
    e.preventDefault();
    const r = addCost(po.no, me, cost);
    if (!r.ok) { setCost({ ...cost, err: r.error }); return; }
    setCost(null); load(); toast('Cost added');
  };

  let body = null;
  if (po && me) {
    const pieces = po.pieces, got = po.got, coming = Math.max(0, pieces - got);
    const ctot = po.costs.reduce((a, c) => a + c.amt, 0);
    const ledger = sup ? '/supplier-detail?id=' + encodeURIComponent(sup.id) : '/suppliers';
    const mine = po.byId && po.byId === me.id;
    const approver = canApprove(me) && !mine;
    const over = needsApproval(po.total, me);
    const sendAct = { label: 'Send to supplier', icon: 'send', onClick: () => setSending(true) };
    let primary = null;
    if (po.s === 'approval' && approver) primary = { label: 'Approve', icon: 'check', onClick: approve };
    else if (po.s === 'draft') primary = { label: over ? 'Send for approval' : 'Place order', icon: 'send', onClick: submit };
    else if (po.s === 'approved') primary = sendAct;
    else if (po.receive) primary = { label: 'Receive goods', icon: 'scan-barcode', href: po.receive };
    const secondary = [];
    if (po.s === 'approval' && approver) secondary.push({ label: 'Reject', onClick: () => setAsk('reject') });
    if (po.s === 'approved' && po.receive) secondary.push({ label: 'Receive goods', href: po.receive });
    const more = [
      canEdit(po) ? { label: 'Edit order', onClick: () => setEdit({ lines: po.lines.map((l) => ({ ...l, qty: String(l.qty), cost: String(l.cost) })), note: po.note || '', expected: po.expected || '' }) } : null,
      ['ordered', 'partial'].includes(po.s) ? { label: 'Send to supplier again', onClick: () => setSending(true) } : null,
      { label: 'Print', onClick: doPrint },
      canClose(po) ? { label: 'Close the rest', onClick: () => setAsk('close') } : null,
      canCancel(po) ? { label: 'Cancel order', onClick: () => setAsk('cancel') } : null,
      { label: 'Return to supplier', href: '/supplier-return' },
      { label: 'Supplier ledger', href: ledger },
    ].filter(Boolean);
    const p = po.demoPay;
    const payRows = p ? [
      ['Order total', formatBDT(p.total)],
      [p.paidText || 'Paid', formatBDT(p.paid)],
      ['Still to pay', <b key="left" className={p.overdue ? 'ix-bad' : 'ix-strong'}>{formatBDT(p.left)}</b>],
      p.dueAt && p.left ? ['Due', `${formatDate(p.dueAt)} (${daysFrom(p.dueAt) >= 0 ? 'in ' + plural(daysFrom(p.dueAt), 'day') : plural(-daysFrom(p.dueAt), 'day') + ' late'})`] : p.due && p.left ? ['Due', p.due.replace(/^Due (\w)/, (m, c) => c.toUpperCase())] : null,
      po.terms != null ? ['Terms', termsLabel(po.terms)] : null,
    ] : [
      ['Order total', formatBDT(po.total)],
      po.pay ? ['Billed', formatBDT(po.pay.billed)] : null,
      po.pay ? ['Paid', formatBDT(po.pay.paid)] : null,
      po.pay ? ['Still to pay', <b key="left" className="ix-strong">{formatBDT(po.pay.left)}</b>] : null,
      po.terms != null ? ['Terms', termsLabel(po.terms)] : null,
    ];
    const wa = whatsappLink(po, sup && sup.phone, MERCHANT.name);
    body = (<>
      <RecordHeader back="/purchase-orders" backLabel="Back to purchase orders" title={<span className="pd-id">{po.no}</span>}
        badges={<StatusBadge tone={po.tone}>{po.rejected && po.s === 'draft' ? 'Rejected' : po.label}</StatusBadge>}
        meta={`${po.supplier} · ${formatDate(po.at)} · ${po.place}${po.by ? ' · by ' + po.by : ''}`}
        about="Approve, send to the supplier, then receive the goods when they arrive. The order closes after full payment."
        secondary={secondary} more={more} primary={primary} />

      {po.s === 'approval' ? (
        <div className="gc-alert gc-alert--soft gc-alert--warning pd-banner" role="status">
          <Icon name="clock" width="18" height="18" aria-hidden="true" />
          <span>{approver ? `Waiting for your approval. ${po.by || 'Staff'} made it; it is over ${formatBDT(approvalLimit())}.` : mine ? 'Waiting for approval. Someone else must approve an order you made.' : 'Waiting for approval by the owner or the warehouse manager.'}</span>
        </div>
      ) : null}
      {po.s === 'draft' && po.rejected ? (
        <div className="gc-alert gc-alert--soft gc-alert--error pd-banner" role="status">
          <Icon name="circle-x" width="18" height="18" aria-hidden="true" />
          <span><b>Rejected by {po.rejected.by}:</b> {po.rejected.reason}. Edit the order, then send it again.</span>
        </div>
      ) : null}
      {po.s === 'cancelled' && po.cancelled ? <div className="gc-alert gc-alert--soft gc-alert--error pd-banner" role="status"><Icon name="ban" width="18" height="18" aria-hidden="true" /><span><b>Cancelled by {po.cancelled.by}:</b> {po.cancelled.reason}</span></div> : null}
      {po.s === 'closed' && po.closed ? <div className="gc-alert gc-alert--soft gc-alert--info pd-banner" role="status"><Icon name="archive" width="18" height="18" aria-hidden="true" /><span><b>Closed by {po.closed.by}:</b> {plural(po.closed.qty, 'piece')} not coming{po.closed.reason ? ' · ' + po.closed.reason : ''}.</span></div> : null}

      <div className="ix-record">
        <div className="ix-main">
          <section className="ix-card" aria-labelledby="pd-products">
            <div className="ix-card__head"><h2 id="pd-products">Products</h2><span className="ix-muted">{got} of {pieces} received{coming && !['closed', 'cancelled'].includes(po.s) ? ` · ${coming} still coming` : ''}</span></div>
            <div className="ix-card__body" style={{ padding: 0 }}>
              <div className="pd-tw">
                <table className="ix-table">
                  <caption className="sr-only">Products on {po.no}</caption>
                  <thead><tr><th scope="col">Product</th><th scope="col" className="ix-num">Ordered</th><th scope="col" className="ix-num">Received</th><th scope="col" className="ix-num">Still coming</th><th scope="col" className="ix-num">Unit cost</th><th scope="col" className="ix-num">Amount</th></tr></thead>
                  <tbody>
                    {po.lines.map((l) => {
                      const left = ['closed', 'cancelled'].includes(po.s) ? 0 : Math.max(0, l.qty - (l.received || 0));
                      return (
                        <tr key={(l.code || '') + l.name}>
                          <td><span className="gc-picrow"><Pic src={productPic(l)} name={l.name} kind="item" /><span><span className="ix-strong">{l.name}</span>{l.code ? <span className="pd-sub pd-id">{l.code}</span> : null}</span></span></td>
                          <td className="ix-num">{l.qty}</td>
                          <td className="ix-num ix-strong">{l.received || 0}</td>
                          <td className={'ix-num' + (left ? ' ix-warn' : ' ix-muted')}>{left || '—'}</td>
                          <td className="ix-num">{formatBDT(l.cost)}</td>
                          <td className="ix-num">{formatBDT(l.qty * l.cost)}</td>
                        </tr>
                      );
                    })}
                    <tr className="pd-total"><td colSpan={5}>Order total</td><td className="ix-num">{formatBDT(po.total)}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="ix-card" aria-labelledby="pd-deliveries">
            <div className="ix-card__head"><h2 id="pd-deliveries">Deliveries received</h2>{po.receive && got ? <Link href={po.receive}>Receive next delivery</Link> : null}</div>
            <div className="ix-card__body">
              {po.deliveries.length ? (
                <ul className="pd-list">
                  {po.deliveries.map((d) => (
                    <li key={d.grn}>
                      <span className="pd-dot pd-dot--ok" />
                      <span><span className="ix-strong">Delivery on {formatDate(d.at)} · {d.qty} pieces</span><span className="pd-sub">Received by {d.by}{d.note ? ' · ' + d.note : ''}</span></span>
                      <span className="pd-grn">{d.grn}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="pd-empty">{got ? `${got} pieces received.` : 'Nothing received yet.'}</p>}
            </div>
          </section>

          <section className="ix-card pd-costs" aria-labelledby="pd-costs">
            <div className="ix-card__head">
              <h2 id="pd-costs">Extra costs <InfoTip text="Transport, labour or customs for this order. Added to the real cost of each piece. You can add costs any time, even after the goods arrive." /></h2>
              {got && ctot ? <span className="ix-muted">+৳{(ctot / got).toFixed(2)} per piece</span> : null}
            </div>
            <div className="ix-card__body">
              {po.costs.length ? <KV rows={[...po.costs.map((c, i) => [c.label + (i ? '' : ''), formatBDT(c.amt)]), ['Total', <b key="t" className="ix-strong">{formatBDT(ctot)}</b>]]} /> : <p className="pd-empty" style={{ marginBottom: 'var(--space-3)' }}>No extra costs yet.</p>}
              {po.s !== 'cancelled' ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => setCost({ label: '', amt: '', err: '' })}>Add a cost</button> : null}
            </div>
          </section>

          {po.history.length ? (
            <section className="ix-card" aria-labelledby="pd-history">
              <div className="ix-card__head"><h2 id="pd-history">History</h2></div>
              <div className="ix-card__body">
                <ul className="pd-list">
                  {po.history.map((h, i) => <li key={i}><span className={'pd-dot' + (h.ok ? ' pd-dot--ok' : '')} /><span>{h.text}<span className="pd-sub">{formatDate(h.at)} · {formatTime(h.at)}</span></span></li>)}
                </ul>
              </div>
            </section>
          ) : null}
        </div>

        <div className="ix-side">
          <section className="ix-card" aria-labelledby="pd-supplier">
            <div className="ix-card__head"><h2 id="pd-supplier">Supplier</h2></div>
            <div className="ix-card__body pd-sup">
              {sup ? <Link href={ledger} className="ix-strong">{po.supplier}</Link> : <span className="ix-strong">{po.supplier}</span>}
              <KV rows={[
                sup && sup.phone && sup.phone !== '—' ? ['Mobile', sup.phone] : null,
                ['Deliver to', po.place],
                po.invoice ? ['Supplier invoice', <span key="inv" className="pd-id">{po.invoice}</span>] : null,
                po.expected ? ['Expected delivery', po.expected] : null,
                po.sentAt ? ['Sent', formatDate(po.sentAt) + (po.sentVia ? ' · ' + po.sentVia : '')] : null,
                po.approvedBy ? ['Approved by', po.approvedBy.by] : null,
                po.from.length ? ['Staff requests', <Link key="rq" href="/requests" className="pd-id">{po.from.join(', ')}</Link>] : null,
              ]} />
            </div>
          </section>

          <section className="ix-card" aria-labelledby="pd-pay">
            <div className="ix-card__head"><h2 id="pd-pay">Payment</h2>{sup && ((p && p.left) || (po.pay && po.pay.left)) ? <Link href={ledger}>Record a payment</Link> : null}</div>
            <div className="ix-card__body">
              <KV rows={payRows} />
              {!p && !po.pay ? <p className="pd-empty" style={{ marginTop: 'var(--space-2)' }}>No bill yet. A bill is added when goods are received.</p> : null}
            </div>
          </section>

          {po.files.length ? (
            <section className="ix-card" aria-labelledby="pd-files">
              <div className="ix-card__head"><h2 id="pd-files">Files</h2><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => toast('Coming soon: adding files and photos to an order.', { tone: 'info' })}>Add file or photo</button></div>
              <div className="ix-card__body pd-list">
                {po.files.map((f) => <div key={f.name} className="pd-file"><Icon name={f.icon} width="16" height="16" aria-hidden="true" /><span>{f.name}</span><span className="ix-muted">{f.size}</span></div>)}
              </div>
            </section>
          ) : null}

          {po.note ? (
            <section className="ix-card" aria-labelledby="pd-note">
              <div className="ix-card__head"><h2 id="pd-note">Note</h2></div>
              <div className="ix-card__body"><p className="pd-note">{po.note}</p></div>
            </section>
          ) : null}
        </div>
      </div>

      <PODocument po={po} sup={sup} />

      <ReasonDialog open={!!ask} onClose={() => setAsk('')} onSubmit={onReason} danger={ask !== 'close'} optional={ask === 'close'}
        title={ask === 'reject' ? `Reject ${po.no}?` : ask === 'cancel' ? `Cancel ${po.no}?` : `Close the rest of ${po.no}?`}
        body={ask === 'reject' ? `It goes back to ${po.by || 'the person who made it'} as a draft, with your reason.` : ask === 'cancel' ? `Nothing has arrived. Tell ${po.supplier} the order is off.` : `${plural(coming, 'piece')} will not come. What arrived stays in stock and on the bill.`}
        label={ask === 'close' ? 'Reason (optional)' : 'Reason'} confirmLabel={ask === 'reject' ? 'Reject' : ask === 'cancel' ? 'Cancel order' : 'Close the rest'} />

      <Dialog open={sending} title={`Send ${po.no} to ${po.supplier}`} onClose={() => setSending(false)} width={560}>
        <div className="pd-send">
          <KV rows={[['Mobile', sup && sup.phone && sup.phone !== '—' ? sup.phone : 'No number saved'], ['Total', formatBDT(po.total)]]} />
          <div><span className="gc-label">Message</span><div className="pd-msg">{wa.text}</div></div>
          <p className="gc-help" style={{ margin: 0 }}>Print or save the order as PDF and attach it in WhatsApp.</p>
          <div className="pd-send__acts">
            <button type="button" className="ix-btn" onClick={doPrint}><Icon name="printer" width="16" height="16" aria-hidden="true" /><span>Print or save PDF</span></button>
            {wa.ok ? <a className="ix-btn ix-btn--primary" href={wa.href} target="_blank" rel="noopener noreferrer" onClick={() => { if (po.s === 'approved' || po.s === 'draft') sent('WhatsApp'); else setSending(false); }}><Icon name="message-circle" width="16" height="16" aria-hidden="true" /><span>Open WhatsApp</span></a> : null}
          </div>
          {po.s === 'approved' || po.s === 'draft' ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" style={{ alignSelf: 'flex-start' }} onClick={() => sent('')}>Mark as sent without WhatsApp</button> : null}
        </div>
      </Dialog>

      <Dialog open={!!edit} title={`Edit ${po.no}`} onClose={() => setEdit(null)} width={680}>
        {edit ? (
          <form className="pd-edit" onSubmit={saveEdit}>
            <div className="gc-table-wrap">
              <table className="gc-table gc-table--compact gc-table--keep">
                <thead><tr><th scope="col">Product</th><th scope="col">Quantity</th><th scope="col">Unit cost (৳)</th><th scope="col"><span className="sr-only">Remove</span></th></tr></thead>
                <tbody>
                  {edit.lines.map((l, i) => {
                    const set = (patch) => setEdit({ ...edit, lines: edit.lines.map((x, k) => (k === i ? { ...x, ...patch } : x)) });
                    return (
                      <tr key={l.name + i} className={l.drop ? 'pd-drop' : ''}>
                        <td>{l.name}{l.received ? <span className="pd-sub">{l.received} received · can’t go lower</span> : null}</td>
                        <td><input className="gc-input pd-num" inputMode="numeric" aria-label={'Quantity of ' + l.name} value={l.qty} disabled={l.drop} onChange={(e) => set({ qty: e.target.value.replace(/[^0-9]/g, '') })} /></td>
                        <td><input className="gc-input pd-num" inputMode="numeric" aria-label={'Unit cost of ' + l.name} value={l.cost} disabled={l.drop} onChange={(e) => set({ cost: e.target.value.replace(/[^0-9.]/g, '') })} /></td>
                        <td>{!l.received ? <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={(l.drop ? 'Keep ' : 'Remove ') + l.name} onClick={() => set({ drop: !l.drop })}><Icon name={l.drop ? 'undo-2' : 'x'} width="16" height="16" aria-hidden="true" /></button> : null}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="pd-two">
              <div><label className="gc-label" htmlFor="pd-exp">Expected delivery</label><input id="pd-exp" className="gc-input" value={edit.expected} onChange={(e) => setEdit({ ...edit, expected: e.target.value })} placeholder="e.g. 20 Oct 2026" /></div>
              <div><label className="gc-label" htmlFor="pd-en">Note</label><input id="pd-en" className="gc-input" value={edit.note} onChange={(e) => setEdit({ ...edit, note: e.target.value })} /></div>
            </div>
            {['approved', 'ordered'].includes(po.s) && !canApprove(me) ? <p className="gc-help" style={{ margin: 0 }}>A bigger total over {formatBDT(approvalLimit())} needs approval again.</p> : null}
            <div className="gc-modal__foot" style={{ marginTop: 0 }}>
              <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEdit(null)}>Cancel</button>
              <button type="submit" className="gc-btn gc-btn--solid">Save changes</button>
            </div>
          </form>
        ) : null}
      </Dialog>

      <Dialog open={!!cost} title="Add a cost" onClose={() => setCost(null)} width={440}>
        {cost ? (
          <form className="pd-edit" onSubmit={saveCost}>
            <div><label className="gc-label" htmlFor="pd-cl">What was it for?</label><input id="pd-cl" className="gc-input" autoFocus value={cost.label} onChange={(e) => setCost({ ...cost, label: e.target.value, err: '' })} placeholder="e.g. Van rent" /></div>
            <div><label className="gc-label" htmlFor="pd-ca">Amount (৳)</label><input id="pd-ca" className="gc-input" inputMode="numeric" value={cost.amt} onChange={(e) => setCost({ ...cost, amt: e.target.value.replace(/[^0-9]/g, ''), err: '' })} /></div>
            {cost.err ? <span className="gc-help" role="alert" style={{ color: 'var(--text-danger)' }}>{cost.err}</span> : null}
            <div className="gc-modal__foot" style={{ marginTop: 0 }}>
              <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setCost(null)}>Cancel</button>
              <button type="submit" className="gc-btn gc-btn--solid">Add cost</button>
            </div>
          </form>
        ) : null}
      </Dialog>
    </>);
  }

  return (
    <div className="dc-screen ds" data-screen="PODetail">
      <style dangerouslySetInnerHTML={{ __html: CSS + PO_DOC_CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="po-orders" />
        <main className="gc-shell__main">
          <Topbar crumb="Purchase › Purchase orders" page="Purchase order" placeholder="Search or scan any barcode" />
          <div className="gc-shell__content">
            <div className="ix-page">{body || <RecordHeader back="/purchase-orders" backLabel="Back to purchase orders" title="Purchase order" />}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
