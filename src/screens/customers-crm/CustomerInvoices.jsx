'use client';
// CustomerInvoices — the customer page's Invoices area: what this customer owes, invoice by invoice.
// Figures (owed, overdue, advance credit), tabs To accept · To pay · Paid · All, and a list. A row opens a side panel
// with the items, the totals, the revisions (what changed and why) and the next step: a member of staff accepts the
// invoice, then records the payment. Edit opens the invoice page, where a change makes a new revision that has to be
// accepted again (invoices.js › reviseInvoice, acceptInvoice).
// Front end only: the invoices come from src/lib/invoices.js (POS sales on due plus the demo invoices).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { Sheet, StatusBadge, EmptyState } from '@/components/ui';
import { MetricStrip, IndexTabs, KV } from '@/components/ui/IndexKit';
import { toast } from '@/runtime/ui';
import { formatBDT, formatDate } from '@/lib/format';
import { getInvoices, stageOf, STAGES, acceptInvoice, recordPayment, revisionsOf, isOverdue, dueDateOf, creditOf, paidSoFar, discountsOf } from '@/lib/invoices';
import { EMPLOYEES } from '@/lib/posStore';
import { hasModule } from '@/lib/edition';
import { createLink, linkUrl } from '@/lib/paymentLinks';

const money = (n) => formatBDT(n, { decimals: Number.isInteger(n) ? 0 : 2 });
const digits = (p) => String(p || '').replace(/[^0-9]/g, '').replace(/^88/, '');
const METHODS = ['Cash', 'bKash', 'Nagad', 'Card', 'Bank'];
const TABS = [['review', 'To accept'], ['accepted', 'To pay'], ['paid', 'Paid'], ['all', 'All']];
const r2 = (n) => Math.round(n * 100) / 100;

const CSS = `
.ci-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:var(--space-1) var(--space-3);width:100%;padding:var(--space-3) var(--space-4);border:0;border-top:1px solid var(--border-subtle);background:none;text-align:left;font:inherit;color:inherit;cursor:pointer;min-height:56px}
.ci-row:first-child{border-top:0}
.ci-row:hover{background:var(--surface-subtle)}
.ci-row:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.ci-id{font-family:var(--font-data);font-weight:var(--weight-medium);color:var(--text-heading)}
.ci-sub{font-size:var(--text-xs);color:var(--text-muted)}
.ci-amt{font-family:var(--font-data);font-weight:var(--weight-semibold);text-align:right;color:var(--text-heading)}
.ci-due{color:var(--text-danger)}
.ci-tags{display:flex;flex-wrap:wrap;gap:var(--space-1);grid-column:1/-1}
.ci-lines{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.ci-lines th{height:32px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:left;border-bottom:1px solid var(--border-subtle)}
.ci-lines td{height:40px;border-bottom:1px solid var(--border-subtle)}
.ci-lines .n{text-align:right;font-family:var(--font-data)}
.ci-sec{display:flex;flex-direction:column;gap:var(--space-2);margin-top:var(--space-4)}
.ci-sec h3{margin:0;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted);text-transform:uppercase;letter-spacing:var(--tracking-wide)}
.ci-rev{padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-size:var(--text-sm)}
.ci-rev ul{margin:var(--space-1) 0 0;padding-left:18px}
.ci-why{display:block;margin-top:var(--space-1);font-size:var(--text-xs);color:var(--text-body)}
.ci-pay{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.ci-note{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:640px){.ci-pay{grid-template-columns:1fr}}
`;

export default function CustomerInvoices({ phones = [], name = 'This customer', onChange }) {
  const [rows, setRows] = useState([]);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('');
  const [openId, setOpenId] = useState('');
  const [pay, setPay] = useState({ method: 'Cash', amount: '', by: EMPLOYEES[0].name, ref: '' });
  const want = useMemo(() => new Set(phones.map(digits).filter(Boolean)), [phones]);

  const reload = () => setRows(getInvoices().filter((r) => want.has(digits(r.customer && r.customer.phone))));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { reload(); setReady(true); }, [want]);

  const by = (k) => (k === 'all' ? rows : rows.filter((r) => stageOf(r) === k));
  const counts = { review: by('review').length, accepted: by('accepted').length, paid: by('paid').length, all: rows.length };
  // open on the first tab with work in it
  const cur = tab || (counts.review ? 'review' : counts.accepted ? 'accepted' : 'all');
  const shown = by(cur);
  const owed = r2(rows.reduce((a, r) => a + Math.max(0, r.due), 0));
  const late = rows.filter((r) => isOverdue(r));
  const credit = ready ? creditOf([...want][0] || '') : 0;
  const inv = rows.find((r) => r.id === openId) || null;

  const openInv = (r) => { setOpenId(r.id); setPay({ method: 'Cash', amount: '', by: EMPLOYEES[0].name, ref: '' }); };
  const accept = () => {
    const next = acceptInvoice(inv, pay.by);
    reload(); if (onChange) onChange();
    toast(`${next.id} accepted by ${pay.by}. Record the payment when the money comes in.`);
  };
  const receive = (e) => {
    e.preventDefault();
    const amt = pay.amount === '' ? inv.due : Number(pay.amount) || 0;
    if (amt <= 0) { toast('Enter the amount received', { tone: 'error' }); return; }
    const applied = r2(Math.min(amt, inv.due));
    const next = recordPayment(inv, pay.method, applied, pay.by, { ref: pay.ref.trim() });
    reload(); if (onChange) onChange();
    toast(next.due <= 0 ? `${inv.id} is paid · ${money(applied)} by ${pay.method}` : `${money(applied)} received · ${money(next.due)} left on ${inv.id}`);
    if (next.due <= 0) setOpenId('');
    else setPay({ ...pay, amount: '', ref: '' });
  };
  const sendLink = () => {
    const link = createLink({ ref: inv.id, refKind: 'invoice', customer: inv.customer.name, phone: inv.customer.phone, amount: inv.due, days: 3 });
    try { navigator.clipboard.writeText(linkUrl(link)); } catch { /* no clipboard */ }
    toast(`Pay link for ${money(inv.due)} sent to ${inv.customer.phone} by SMS · link copied`);
  };

  const tabs = TABS.map(([k, l]) => ({ key: k, id: 'ci-tab-' + k, label: l, count: counts[k], on: cur === k, onClick: () => setTab(k) }));
  const stage = inv ? stageOf(inv) : '';
  const revs = inv ? revisionsOf(inv) : [];
  const disc = inv ? r2(discountsOf(inv)) : 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <MetricStrip label="Invoices" items={[
        { label: 'Owed', value: money(owed), sub: rows.filter((r) => r.due > 0).length + ' unpaid' },
        { label: 'Overdue', value: money(r2(late.reduce((a, r) => a + r.due, 0))), sub: late.length ? late.length + ' past the due date' : 'Nothing late' },
        { label: 'Advance credit', value: money(credit) },
      ]} />
      <section className="ix-card" aria-label="Invoices">
        <div className="ix-bar"><IndexTabs tabs={tabs} label="Invoices by step" /></div>
        {!ready ? null : shown.length === 0 ? (
          <div className="ix-empty"><EmptyState icon="file-text" title={rows.length ? 'Nothing here' : `${name} has no invoices`} /></div>
        ) : (
          <div role="list">
            {shown.map((r) => {
              const st = stageOf(r);
              return (
                <button key={r.src + r.id} type="button" role="listitem" className="ci-row" onClick={() => openInv(r)} aria-label={`Open ${r.id}`}>
                  <span><span className="ci-id">{r.id}</span><span className="ci-sub"> · {formatDate(r.at)}{(r.rev || 1) > 1 ? ' · revision ' + r.rev : ''}</span></span>
                  <span className={'ci-amt' + (r.due > 0 ? ' ci-due' : '')}>{r.due > 0 ? money(r.due) + ' due' : money(r.totals.total)}</span>
                  <span className="ci-tags">
                    <StatusBadge tone={STAGES[st].tone} icon={STAGES[st].icon}>{STAGES[st].label}</StatusBadge>
                    {isOverdue(r) ? <StatusBadge tone="error">Overdue</StatusBadge> : null}
                    <span className="ci-sub">{r.lines.length === 1 ? r.lines[0].name : r.lines[0].name + ' +' + (r.lines.length - 1)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
        <div className="ix-foot"><span>{shown.length === 1 ? '1 invoice' : shown.length + ' invoices'}</span><Link href="/sales-invoices" className="ix-link">All invoices</Link></div>
      </section>

      <Sheet open={!!inv} title={inv ? inv.id : ''} onClose={() => setOpenId('')}
        footer={inv ? (
          <>
            <Link href={'/sales-invoice?id=' + encodeURIComponent(inv.id)} className="gc-btn gc-btn--neutral" style={{ marginRight: 'auto' }}>{stage === 'paid' ? 'Open invoice' : 'Edit on invoice page'}</Link>
            {stage === 'review' ? <button type="button" className="gc-btn gc-btn--solid" onClick={accept}><Icon name="clipboard-check" width="16" height="16" aria-hidden="true" />Accept invoice</button> : null}
            {stage === 'accepted' ? <button type="submit" form="ci-pay" className="gc-btn gc-btn--solid">Record payment</button> : null}
          </>
        ) : null}>
        {inv ? (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
              <StatusBadge tone={STAGES[stage].tone} icon={STAGES[stage].icon}>{STAGES[stage].label}</StatusBadge>
              {isOverdue(inv) ? <StatusBadge tone="error">Overdue</StatusBadge> : null}
            </div>
            <KV rows={[
              ['Date', formatDate(inv.at)],
              ['Due by', formatDate(dueDateOf(inv))],
              ['Revision', String(inv.rev || 1)],
              inv.acceptedAt ? ['Accepted', (stage === 'review' ? 'Revision ' + inv.acceptedRev + ' · ' : '') + inv.acceptedBy + ' · ' + formatDate(inv.acceptedAt)] : null,
            ]} />
            <div className="ci-sec">
              <h3>Items</h3>
              <table className="ci-lines gc-table--keep">
                <thead><tr><th scope="col">Item</th><th scope="col" className="n">Qty</th><th scope="col" className="n">Amount</th></tr></thead>
                <tbody>{inv.lines.map((l) => <tr key={l.id}><td>{l.name}</td><td className="n">{l.qty}</td><td className="n">{money(r2(l.price * l.qty - (l.disc || 0)))}</td></tr>)}</tbody>
              </table>
              <KV rows={[
                disc ? ['Discount', '−' + money(disc)] : null,
                ['VAT', money(inv.totals.tax)],
                ['Total', money(inv.totals.total)],
                ['Paid', money(paidSoFar(inv))],
                ['Due', <b key="d" className={inv.due > 0 ? 'ci-due' : ''}>{money(Math.max(0, inv.due))}</b>],
              ]} />
            </div>

            {revs.length ? (
              <div className="ci-sec">
                <h3>Revisions</h3>
                {revs.map((v) => (
                  <div key={v.rev} className="ci-rev">
                    <b>Revision {v.rev} → {v.rev + 1}</b> <span className="ci-sub">· {formatDate(v.at)} · {v.by} · {money(v.from)} → {money(v.to)}</span>
                    <ul>{v.changes.map((x) => <li key={x}>{x}</li>)}</ul>
                    {v.reason ? <span className="ci-why">Why: {v.reason}</span> : null}
                  </div>
                ))}
              </div>
            ) : null}

            {stage === 'review' ? (
              <div className="ci-sec">
                <h3>Accept</h3>
                <p className="ci-note">{(inv.rev || 1) > 1 ? `Revision ${inv.rev} changed this invoice. Check it again, then accept.` : 'Check the items, prices and customer, then accept. The payment is recorded after that.'}</p>
                <div><label className="gc-label" htmlFor="ci-acc">Accepted by</label><select id="ci-acc" className="gc-input gc-select" value={pay.by} onChange={(e) => setPay({ ...pay, by: e.target.value })}>{EMPLOYEES.map((m) => <option key={m.name}>{m.name}</option>)}</select></div>
              </div>
            ) : null}

            {stage === 'accepted' ? (
              <form id="ci-pay" className="ci-sec" onSubmit={receive}>
                <h3>Record payment</h3>
                <div className="ci-pay">
                  <div><label className="gc-label" htmlFor="ci-m">Method</label><select id="ci-m" className="gc-input gc-select" value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}>{METHODS.map((m) => <option key={m}>{m}</option>)}</select></div>
                  <div><label className="gc-label" htmlFor="ci-a">Amount (৳)</label><input id="ci-a" className="gc-input" type="number" min="0" step="0.01" inputMode="decimal" placeholder={String(inv.due)} value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} /></div>
                  <div><label className="gc-label" htmlFor="ci-b">Received by</label><select id="ci-b" className="gc-input gc-select" value={pay.by} onChange={(e) => setPay({ ...pay, by: e.target.value })}>{EMPLOYEES.map((m) => <option key={m.name}>{m.name}</option>)}</select></div>
                  {pay.method !== 'Cash' ? <div><label className="gc-label" htmlFor="ci-r">{pay.method === 'Bank' ? 'Slip or cheque no.' : 'Transaction ID'}</label><input id="ci-r" className="gc-input" value={pay.ref} onChange={(e) => setPay({ ...pay, ref: e.target.value })} /></div> : null}
                </div>
                {hasModule('online') && inv.customer.phone ? <span><button type="button" className="ix-btn ix-btn--sm" onClick={sendLink}><Icon name="link" width="16" height="16" aria-hidden="true" />Send a pay link instead</button></span> : null}
              </form>
            ) : null}
          </>
        ) : null}
      </Sheet>
    </>
  );
}
