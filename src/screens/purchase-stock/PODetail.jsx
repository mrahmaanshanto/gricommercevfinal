'use client';
// PODetail — one purchase order (/po-detail?no=<no>), laid out like Shopify's purchase order page: a record header
// (back to the list, number, status, supplier and date), the work on the left (products and what has arrived,
// deliveries, extra costs, history) and the facts on the right (supplier, payment and terms, files, note).
// - An order made in this browser comes from src/lib/purchaseOrders.js; its payment is read from the supplier bills
//   made when goods were received (src/lib/supplierBills.js).
// - A demo order comes from DEMO_POS; PO-2609-0020 (also shown when the number is unknown) carries its deliveries,
//   payment, extra costs, files, note and history below.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { StatusBadge, InfoTip } from '@/components/ui';
import { RecordHeader, KV } from '@/components/ui/IndexKit';
import { toast } from '@/runtime/ui';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { getPO, updatePO, poPieces, poReceived, PO_STATUS_TONE, DEMO_POS } from '@/lib/purchaseOrders';
import { getDb, findSupplier, billLeft, termsLabel, daysFrom } from '@/lib/supplierBills';

const DEFAULT_NO = 'PO-2609-0020';
const DEMO_LABEL = { draft: 'Draft', approval: 'Waiting approval', approved: 'Approved', ordered: 'Ordered', partial: 'Partly received', received: 'Received', closed: 'Closed', cancelled: 'Cancelled' };
const DEMO_TONE = { draft: 'slate', approval: 'warning', approved: 'info', ordered: 'primary', partial: 'warning', received: 'success', closed: 'slate', cancelled: 'error' };
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

/** One shape for both kinds of order. */
function storedModel(p) {
  const bills = getDb().bills.filter((b) => b.po === p.no);
  const billed = bills.reduce((a, b) => a + (b.amount || 0), 0);
  const left = bills.reduce((a, b) => a + billLeft(b), 0);
  const extra = p.extra || {};
  return {
    no: p.no, stored: true, supplier: p.supplier, place: p.place, at: p.at,
    label: p.approval === 'waiting' && p.status === 'Draft' ? 'Waiting for approval' : p.status, tone: PO_STATUS_TONE[p.status] || 'slate',
    lines: p.lines, total: p.total, invoice: p.invoice, note: p.note, expected: p.expected, terms: p.terms, from: p.from || [],
    deliveries: (p.deliveries || []).map((d) => ({ ...d, note: d.place })),
    costs: Object.keys(COST_LABEL).filter((k) => Number(extra[k]) > 0).map((k) => ({ label: COST_LABEL[k], amt: Number(extra[k]) })),
    files: [],
    pay: bills.length ? { billed, paid: billed - left, left } : null,
    history: [
      { at: p.at, text: 'Made as a draft' + (p.from && p.from.length ? ' from staff requests' : '') },
      p.sentAt ? { at: p.sentAt, text: `Sent to ${p.supplier}` } : null,
      ...(p.deliveries || []).map((d) => ({ at: d.at, text: `${d.qty} pieces received at ${d.place} · ${d.grn}`, ok: true })),
    ].filter(Boolean).sort((a, b) => b.at - a.at),
    receive: p.status !== 'Received' ? `/receive-goods?po=${encodeURIComponent(p.no)}` : '',
    draft: p.status === 'Draft',
  };
}
function demoModel(no) {
  const r = DEMO_POS.find((x) => x.no === no) || DEMO_POS.find((x) => x.no === DEFAULT_NO);
  const x = DEMO_EXTRA[r.no] || {};
  const left = Math.max(0, r.total - r.paid);
  return {
    no: r.no, stored: false, supplier: r.supplier, place: r.place, at: r.at, label: DEMO_LABEL[r.s], tone: DEMO_TONE[r.s],
    lines: r.lines, total: r.total, invoice: x.invoice || '', note: x.note || '', terms: x.terms, from: [],
    deliveries: x.deliveries || [], costs: x.costs || [], files: x.files || [], history: x.history || [],
    demoPay: { total: r.total, paid: r.paid, left, paidText: x.paidText, due: r.s === 'cancelled' ? '' : r.due, dueAt: x.dueAt, overdue: !!r.overdue },
    receive: r.no === DEFAULT_NO ? '/receive-goods' : ['approved', 'ordered', 'partial'].includes(r.s) ? 'demo' : '',
    draft: false,
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
@media (max-width:640px){.pd-tw .ix-table td:first-child{min-width:0}}
`;

export default function PODetail() {
  const [po, setPo] = useState(null);
  const [sup, setSup] = useState(null);
  const load = () => {
    const no = new URLSearchParams(window.location.search).get('no');
    const stored = no ? getPO(no) : null;
    const m = stored ? storedModel(stored) : demoModel(no);
    setPo(m);
    setSup(findSupplier(m.supplier, getDb().suppliers));
  };
  useEffect(() => { load(); }, []);

  const markSent = () => {
    updatePO(po.no, { status: 'Sent', sentAt: Date.now() });
    load();
    toast(`${po.no} marked as sent to ${po.supplier}`);
  };

  let body = null;
  if (po) {
    const pieces = poPieces(po.lines), got = poReceived(po.lines), coming = Math.max(0, pieces - got);
    const ctot = po.costs.reduce((a, c) => a + c.amt, 0);
    const ledger = sup ? '/supplier-detail?id=' + encodeURIComponent(sup.id) : '/suppliers';
    const receiveAct = po.receive === 'demo'
      ? { label: 'Receive goods', icon: 'scan-barcode', onClick: () => toast('This demo order can’t be received. Open PO-2609-0020 or an order you made.', { tone: 'info' }) }
      : po.receive ? { label: 'Receive goods', icon: 'scan-barcode', href: po.receive } : null;
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
    body = (<>
      <RecordHeader back="/purchase-orders" backLabel="Back to purchase orders" title={<span className="pd-id">{po.no}</span>}
        badges={<StatusBadge tone={po.tone}>{po.label}</StatusBadge>}
        meta={`${po.supplier} · ${formatDate(po.at)} · ${po.place}`}
        about="Receive the goods when the delivery arrives. The order closes after full payment."
        secondary={po.draft ? [{ label: 'Mark as sent', icon: 'send', onClick: markSent }] : []}
        more={[
          { label: 'Print', onClick: () => toast(`${po.no} sent to the printer`) },
          { label: 'Return to supplier', href: '/supplier-return' },
          { label: 'Supplier ledger', href: ledger },
        ]}
        primary={receiveAct} />

      <div className="ix-record">
        <div className="ix-main">
          <section className="ix-card" aria-labelledby="pd-products">
            <div className="ix-card__head"><h2 id="pd-products">Products</h2><span className="ix-muted">{got} of {pieces} received{coming ? ` · ${coming} still coming` : ''}</span></div>
            <div className="ix-card__body" style={{ padding: 0 }}>
              <div className="pd-tw">
                <table className="ix-table">
                  <caption className="sr-only">Products on {po.no}</caption>
                  <thead><tr><th scope="col">Product</th><th scope="col" className="ix-num">Ordered</th><th scope="col" className="ix-num">Received</th><th scope="col" className="ix-num">Still coming</th><th scope="col" className="ix-num">Unit cost</th><th scope="col" className="ix-num">Amount</th></tr></thead>
                  <tbody>
                    {po.lines.map((l) => {
                      const left = Math.max(0, l.qty - (l.received || 0));
                      return (
                        <tr key={(l.code || '') + l.name}>
                          <td><span className="ix-strong">{l.name}</span>{l.code ? <span className="pd-sub pd-id">{l.code}</span> : null}</td>
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
            <div className="ix-card__head"><h2 id="pd-deliveries">Deliveries received</h2>{po.receive && po.receive !== 'demo' && got ? <Link href={po.receive}>Receive next delivery</Link> : null}</div>
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

          {po.costs.length ? (
            <section className="ix-card pd-costs" aria-labelledby="pd-costs">
              <div className="ix-card__head">
                <h2 id="pd-costs">Extra costs <InfoTip text={`Added to the real cost of the ${got} pieces received so far. You can add costs any time, even after the goods arrive.`} /></h2>
                {got ? <span className="ix-muted">+৳{(ctot / got).toFixed(2)} per piece</span> : null}
              </div>
              <div className="ix-card__body">
                <KV rows={[...po.costs.map((c) => [c.label, formatBDT(c.amt)]), ['Total', <b key="t" className="ix-strong">{formatBDT(ctot)}</b>]]} />
                <button type="button" className="ix-btn ix-btn--sm" onClick={() => toast('Adding a cost is not available in this demo yet.', { tone: 'info' })}>Add a cost</button>
              </div>
            </section>
          ) : null}

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
              <div className="ix-card__head"><h2 id="pd-files">Files</h2><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => toast('Adding files is not available in this demo yet.', { tone: 'info' })}>Add file or photo</button></div>
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
    </>);
  }

  return (
    <div className="dc-screen ds" data-screen="PODetail">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
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
