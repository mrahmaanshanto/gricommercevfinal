'use client';
// One invoice (/admin/invoices/view?id=INV-2026-0763) — a record page: the header (state, store, Record payment as the
// main action; Send pay link and Print; Request adjustment and the store under More), then the bill's lines with its
// credit notes and the amounts, the payments (method, transaction ID, how it came in, who took it), credit notes and
// adjustments, and the timeline (issued, reminders, auto-charge tries, calls, payments, credits, decisions). The side
// column has the bill's facts and the store. Print draws a clean A4 copy on the Grid Technologies letterhead.
// Data: lib/platform (billing, views › adjustmentEffect). ?id= is read after mount; the menu marks Invoices.

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { StatusBadge, EmptyState, InfoTip } from '@/components/ui';
import { RecordHeader, KV } from '@/components/ui/IndexKit';
import { dm, dmy, hm, taka } from '@/lib/platform/util';
import { REASON_LABEL, viaLabel } from '@/lib/platform/catalogue';
import { invoiceById, shopOf, subOf, balance, paidOn, creditOn, paidVia, outcomeLabel } from '@/lib/platform/billing';
import { AdminShell, usePlatform } from '../AdminShell';
import {
  BILL_CSS, Skeleton, BillBadge, billState, money, plural, periodText, packageOf, when, payLink, Row,
  PaySheet, AdjustSheet, ADJ_TYPE_LABEL,
} from './billingShared';

const CSS = `
.biv-lines{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.biv-lines td{padding:8px 0;border-top:1px solid var(--border-subtle);color:var(--text-body);vertical-align:top}
.biv-lines tr:first-child td{border-top:0}
.biv-lines td:last-child{padding-left:var(--space-4);text-align:right;white-space:nowrap;font-family:var(--font-data);font-variant-numeric:tabular-nums;color:var(--text-heading)}
.biv-lines .is-credit td{color:var(--text-success)}
.biv-lines .is-credit td:last-child{color:var(--text-success)}
.biv-sum{margin-top:var(--space-3);padding-top:var(--space-3);border-top:1px solid var(--border-subtle)}
.biv-sum .ix-sum dd{font-family:var(--font-data)}
.biv-tl{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.biv-tl li{position:relative;display:flex;gap:var(--space-3);padding:0 0 var(--space-3)}
.biv-tl li:last-child{padding-bottom:0}
.biv-tl li::before{content:"";position:absolute;left:13px;top:28px;bottom:0;width:1px;background:var(--border-subtle)}
.biv-tl li:last-child::before{display:none}
.biv-tl__ic{flex:none;display:grid;place-items:center;width:28px;height:28px;border-radius:var(--radius-full);background:var(--surface-subtle);color:var(--text-muted)}
.biv-tl__ic.is-ok{background:var(--fill-success-soft);color:var(--text-success)}
.biv-tl__ic.is-bad{background:var(--fill-error-soft);color:var(--text-danger)}
.biv-tl__ic.is-warn{background:var(--fill-warning-soft);color:var(--text-warning)}
.biv-tl__txt{flex:1;min-width:0;padding-top:4px;font-size:var(--text-sm);color:var(--text-body)}
.biv-tl__txt b{font-weight:var(--weight-medium);color:var(--text-heading)}
.biv-tl__txt small{display:block;margin-top:2px;font-size:var(--text-xs);color:var(--text-muted)}
.bl-print{display:none}
@media print{
  body>*:not(.bl-print){display:none!important}
  body{background:#fff!important}
  .bl-print{display:block;padding:0;color:#000;font-family:var(--font-sans);font-size:var(--text-sm)}
  @page{size:A4;margin:16mm}
}
.bl-print__head{display:flex;justify-content:space-between;align-items:flex-start;gap:var(--space-6);padding-bottom:var(--space-4);border-bottom:2px solid var(--primary)}
.bl-print__co b{display:block;font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--primary)}
.bl-print__co span{display:block;font-size:var(--text-xs);color:var(--text-body)}
.bl-print__title{text-align:right}
.bl-print__title b{display:block;font-size:var(--text-lg);font-weight:var(--weight-semibold)}
.bl-print__title span{display:block;font-family:var(--font-data);font-size:var(--text-sm)}
.bl-print__meta{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-6);margin:var(--space-5) 0}
.bl-print__meta h3{margin:0 0 4px;font-size:var(--text-xs);font-weight:var(--weight-semibold);text-transform:uppercase;letter-spacing:.04em;color:var(--text-muted)}
.bl-print__meta p{margin:0;line-height:1.5}
.bl-print table{width:100%;border-collapse:collapse}
.bl-print th{padding:6px 0;border-bottom:1px solid #000;font-size:var(--text-xs);font-weight:var(--weight-semibold);text-align:left}
.bl-print td{padding:6px 0;border-bottom:1px solid #ddd}
.bl-print .r{text-align:right;font-family:var(--font-data)}
.bl-print__tot{width:280px;margin:var(--space-4) 0 0 auto}
.bl-print__tot td{border:0;padding:3px 0}
.bl-print__tot .is-total td{padding-top:6px;border-top:1px solid #000;font-weight:var(--weight-semibold)}
.bl-print__foot{margin-top:var(--space-8);padding-top:var(--space-3);border-top:1px solid #ddd;font-size:var(--text-xs);color:#444}
@media (max-width:640px){.biv-lines td:last-child{padding-left:var(--space-2)}}
`;

const COMPANY = 'Grid Technologies Limited · GridCommerce';
const COMPANY_ADDR = 'Dhaka, Bangladesh · gridcommerce.net';

/** Everything that happened to the bill, newest first. */
function timeline(db, inv, t) {
  const ev = [];
  ev.push({ at: inv.issuedAt, icon: 'file-text', title: `Bill issued · ${taka(inv.total)}`, sub: `Due ${dmy(inv.dueAt)}` });
  if (inv.graceFrom) ev.push({ at: inv.graceFrom, icon: 'calendar-clock', tone: 'warn', title: `Grace extended · now due ${dmy(inv.dueAt)}`, sub: `Was due ${dmy(inv.graceFrom)}` });
  else if (inv.dueAt <= t && !inv.noCharge) ev.push({ at: inv.dueAt, icon: 'calendar', title: 'Fell due', sub: dmy(inv.dueAt) });
  const calls = db.calls.filter((c) => c.invoiceId === inv.id);
  for (const r of inv.reminders || []) if (!calls.some((c) => c.outcome === 'reminder' && c.at === r.at)) ev.push({ at: r.at, icon: 'send', title: 'Pay link sent', sub: `${r.via} · ${r.by}` });
  for (const c of calls) {
    const tone = c.outcome === 'paid' || c.outcome === 'promised' || c.outcome === 'panel' ? 'ok' : c.outcome === 'noanswer' || c.outcome === 'dispute' ? 'bad' : '';
    ev.push({ at: c.at, icon: c.outcome === 'reminder' ? 'send' : 'phone', tone, title: c.outcome === 'reminder' ? c.note : outcomeLabel(c.outcome), sub: [c.outcome !== 'reminder' && c.note !== outcomeLabel(c.outcome) ? c.note : null, c.promiseAt ? `promised ${dm(c.promiseAt)}` : null, c.by].filter(Boolean).join(' · ') });
  }
  for (const ch of inv.charges || []) ev.push({ at: ch.at, icon: 'credit-card', tone: ch.ok ? 'ok' : 'bad', title: ch.ok ? `Auto-charge went through · ${ch.method}` : `Auto-charge failed · ${ch.method}`, sub: ch.reason || null });
  for (const p of db.payments.filter((x) => x.invoiceId === inv.id && x.status === 'ok')) ev.push({ at: p.at, icon: 'banknote', tone: 'ok', title: `${taka(p.amount)} received`, sub: `${paidVia(p)}${p.txId ? ' · ' + p.txId : ''} · ${p.by}` });
  for (const a of db.adjustments.filter((x) => x.invoiceId === inv.id)) {
    ev.push({ at: a.at, icon: 'file-pen', title: `${ADJ_TYPE_LABEL[a.type] || a.type} of ${taka(a.amount)} asked · ${a.id}`, sub: `${REASON_LABEL[a.reason] || a.reason} · ${a.by}` });
    for (const qn of a.questions || []) ev.push({ at: qn.at, icon: 'message-circle-question', title: `Question on ${a.id}`, sub: `${qn.text} · ${qn.by}` });
    if (a.status === 'rejected') ev.push({ at: a.decidedAt, icon: 'x', tone: 'bad', title: `${a.id} rejected`, sub: `${a.decisionNote || ''} · ${a.decidedBy}` });
  }
  for (const c of db.credits.filter((x) => x.invoiceId === inv.id)) {
    const a = db.adjustments.find((x) => x.id === c.adjId);
    ev.push({ at: c.at, icon: 'receipt-text', tone: 'ok', title: `Credit note ${c.id} · ${taka(c.amount)}`, sub: `${REASON_LABEL[c.reason] || c.reason}${a ? ' · approved by ' + (a.decidedBy === 'auto' ? 'the under-limit rule' : a.decidedBy) : ''}` });
  }
  return ev.filter((e) => e.at && e.at <= t + 60000).sort((a, b) => b.at - a.at);
}

/** The A4 copy, drawn on the page body so print shows only it. */
function PrintCopy({ db, inv, t }) {
  const [host, setHost] = useState(null);
  useEffect(() => { setHost(document.body); }, []);
  if (!host) return null;
  const shop = shopOf(db, inv.shopId);
  const owner = shop && shop.owner && typeof shop.owner === 'object' ? shop.owner : { name: shop ? shop.owner : '' };
  const cns = db.credits.filter((c) => c.invoiceId === inv.id);
  const pays = db.payments.filter((p) => p.invoiceId === inv.id && p.status === 'ok').sort((a, b) => a.at - b.at);
  const bal = balance(db, inv);
  return createPortal(
    <div className="bl-print" aria-hidden="true">
      <div className="bl-print__head">
        <div className="bl-print__co"><b>{COMPANY}</b><span>{COMPANY_ADDR}</span></div>
        <div className="bl-print__title"><b>{inv.noCharge ? 'Statement' : 'Invoice'}</b><span>{inv.id}</span></div>
      </div>
      <div className="bl-print__meta">
        <div>
          <h3>Billed to</h3>
          <p><b>{shop ? shop.name : '#' + inv.shopId}</b><br />{owner.name}{owner.phone ? <><br />{owner.phone}</> : null}{shop && shop.dist ? <><br />{shop.dist}</> : null}<br />Store ID #{inv.shopId}</p>
        </div>
        <div>
          <h3>Bill</h3>
          <p>Period: {periodText(inv.period)}<br />Issued: {dmy(inv.issuedAt)}<br />Due: {dmy(inv.dueAt)}<br />Package: {packageOf(db, inv.shopId)}</p>
        </div>
      </div>
      <table>
        <thead><tr><th>Item</th><th className="r">Amount (BDT)</th></tr></thead>
        <tbody>
          {inv.lines.map((l, i) => <tr key={i}><td>{l.label}</td><td className="r">{taka(l.amount)}</td></tr>)}
        </tbody>
      </table>
      <table className="bl-print__tot">
        <tbody>
          <tr><td>Total</td><td className="r">{taka(inv.total)}</td></tr>
          {cns.map((c) => <tr key={c.id}><td>Credit note {c.id}</td><td className="r">{taka(-c.amount)}</td></tr>)}
          {pays.map((p) => <tr key={p.id}><td>Paid {dm(p.at)} · {p.method}{p.txId ? ' · ' + p.txId : ''}</td><td className="r">{taka(-p.amount)}</td></tr>)}
          <tr className="is-total"><td>Balance due</td><td className="r">{taka(bal)}</td></tr>
        </tbody>
      </table>
      <div className="bl-print__foot">
        Pay from your GridCommerce panel, or by bKash, Nagad, Rocket or bank transfer to Grid Technologies Limited, quoting {inv.id}.
        Printed {dmy(t)} {hm(t)}. This bill is computer generated and needs no signature.
      </div>
    </div>, host,
  );
}

export default function InvoiceView() {
  const { db, t, live } = usePlatform();
  const [id, setId] = useState(null);
  const [sheet, setSheet] = useState(null);   // { kind: 'pay' | 'adjust', n }

  useEffect(() => { setId((new URLSearchParams(window.location.search).get('id') || '').trim().toUpperCase()); }, []);

  if (!live || id === null) {
    return <AdminShell active="invoices" title="Invoice"><style dangerouslySetInnerHTML={{ __html: BILL_CSS + CSS }} /><Skeleton label="Loading the invoice" /></AdminShell>;
  }
  const inv = id ? invoiceById(db, id) : null;
  if (!inv) {
    return (
      <AdminShell active="invoices" title="Invoice">
        <style dangerouslySetInnerHTML={{ __html: BILL_CSS + CSS }} />
        <div className="ix-page">
          <RecordHeader back="/admin/invoices" backLabel="Back to invoices" title="Invoice" />
          <section className="ix-card">
            <EmptyState icon="receipt" title={id ? `No invoice ${id}` : 'No invoice picked'} body="Check the number, or open the bill from the list." actionLabel="Back to invoices" onAction={() => { window.location.href = '/admin/invoices'; }} />
          </section>
        </div>
      </AdminShell>
    );
  }

  const shop = shopOf(db, inv.shopId);
  const sub = subOf(db, inv.shopId);
  const st = billState(db, inv, t);
  const bal = balance(db, inv);
  const paid = paidOn(db, inv.id);
  const credited = creditOn(db, inv.id);
  const pays = db.payments.filter((p) => p.invoiceId === inv.id && p.status === 'ok').sort((a, b) => b.at - a.at);
  const cns = db.credits.filter((c) => c.invoiceId === inv.id);
  const adjs = db.adjustments.filter((a) => a.invoiceId === inv.id || (a.appliedTo === inv.id)).sort((a, b) => b.at - a.at);
  const events = timeline(db, inv, t);
  const owner = shop && shop.owner && typeof shop.owner === 'object' ? shop.owner : { name: shop ? shop.owner : '' };
  const open = (kind) => setSheet({ kind, n: Date.now() });
  const close = () => setSheet(null);
  const print = () => window.print();
  const canPay = bal > 0;

  const primary = canPay ? { label: 'Record payment', icon: 'banknote', onClick: () => open('pay') } : { label: 'Print', icon: 'printer', onClick: print };
  const secondary = canPay ? [{ label: 'Send pay link', icon: 'send', onClick: () => payLink(inv.shopId) }, { label: 'Print', icon: 'printer', onClick: print }] : [];
  const more = [
    inv.noCharge ? null : { label: 'Request adjustment', onClick: () => open('adjust') },
    { label: 'Open the store', href: '/admin/merchant?id=' + inv.shopId + '&tab=billing' },
    canPay ? { label: 'Collections call list', href: '/admin/collections' } : null,
  ].filter(Boolean);

  return (
    <AdminShell active="invoices" title={inv.id}>
      <style dangerouslySetInnerHTML={{ __html: BILL_CSS + CSS }} />
      <div className="ix-page">
        <RecordHeader back="/admin/invoices" backLabel="Back to invoices" title={inv.id}
          about="One bill: its lines and credit notes, the payments against it, adjustments and everything that happened to it. Bills are never edited; a correction is a credit note through Request adjustment."
          badges={<BillBadge st={st} />}
          meta={<>{shop ? <Link href={'/admin/merchant?id=' + inv.shopId}>{shop.name}</Link> : '#' + inv.shopId} · {periodText(inv.period)} · due {dmy(inv.dueAt)}</>}
          secondary={secondary} more={more} primary={primary} />

        <div className="ix-record">
          <div className="ix-main">
            <section className="ix-card" aria-label="Bill">
              <div className="ix-card__head"><h2>Bill</h2><span className="bl-fig">{money(inv.total)}</span></div>
              <div className="ix-card__body">
                <table className="biv-lines">
                  <caption className="sr-only">Lines on {inv.id}</caption>
                  <tbody>
                    {inv.lines.map((l, i) => <tr key={i}><td>{l.label}</td><td>{taka(l.amount)}</td></tr>)}
                    {cns.map((c) => <tr key={c.id} className="is-credit"><td>Credit note <span className="bl-data">{c.id}</span> · {REASON_LABEL[c.reason] || c.reason}</td><td>{taka(-c.amount)}</td></tr>)}
                  </tbody>
                </table>
                <div className="biv-sum">
                  <dl className="ix-sum">
                    <dt>Total</dt><dd>{taka(inv.total)}</dd>
                    {credited ? <><dt>Credit notes</dt><dd>{taka(-credited)}</dd></> : null}
                    {paid ? <><dt>Paid</dt><dd>{taka(-paid)}</dd></> : null}
                    <dt className="is-total">{inv.noCharge ? 'No charge (trial)' : 'Balance'}</dt><dd className={'is-total' + (bal ? ' bl-bad' : '')}>{taka(bal)}</dd>
                  </dl>
                </div>
              </div>
            </section>

            <section className="ix-card" aria-label="Payments">
              <div className="ix-card__head"><h2>Payments</h2>{canPay ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => open('pay')}>Record payment</button> : null}</div>
              <div className="ix-card__body">
                {pays.length ? pays.map((p) => (
                  <Row key={p.id} icon="banknote" title={<>{taka(p.amount)} · {p.method}</>}
                    sub={<>{p.via === 'auto' ? 'Auto-charge' : viaLabel(p.via)}{p.txId ? <> · <span className="bl-data">{p.txId}</span></> : null} · {p.by} · {when(p.at, t)}</>}
                    end={<span className="bl-data bl-muted">{p.id}</span>} />
                )) : <p className="bl-empty">{inv.noCharge ? 'Nothing to pay: a trial bill.' : 'No payment yet.'}</p>}
              </div>
            </section>

            <section className="ix-card" aria-label="Credit notes and adjustments">
              <div className="ix-card__head">
                <h2>Credit notes and adjustments</h2>
                <span className="bl-act__in">
                  <InfoTip label="About adjustments" text={`Bills are never edited: a correction is a credit note. Up to ${taka((db.settings || {}).adjThreshold || 500)} it applies at once; above that Finance or an Admin approves it, never the person who asked.`} />
                  {inv.noCharge ? null : <button type="button" className="ix-btn ix-btn--sm" onClick={() => open('adjust')}>Request adjustment</button>}
                </span>
              </div>
              <div className="ix-card__body">
                {adjs.length || cns.length ? (
                  <>
                    {adjs.map((a) => (
                      <Row key={a.id} icon="file-pen" title={<><span className="bl-data">{a.id}</span> · {ADJ_TYPE_LABEL[a.type] || a.type} {taka(a.amount)}</>}
                        sub={`${REASON_LABEL[a.reason] || a.reason} · asked by ${a.by}, ${when(a.at, t)}${a.cnId ? ' · ' + a.cnId : ''}${a.status === 'rejected' && a.decisionNote ? ' · ' + a.decisionNote : ''}`}
                        end={<Link href={'/admin/credits?tab=' + (a.status === 'pending' ? 'pending' : a.status) + '&id=' + a.id} aria-label={'Open ' + a.id}>
                          <StatusBadge tone={a.status === 'pending' ? 'warning' : a.status === 'approved' ? 'success' : 'neutral'}>{a.status === 'pending' ? 'Waiting approval' : a.status === 'approved' ? 'Applied' : 'Rejected'}</StatusBadge>
                        </Link>} />
                    ))}
                    {cns.filter((c) => !adjs.some((a) => a.cnId === c.id)).map((c) => (
                      <Row key={c.id} icon="receipt-text" title={<><span className="bl-data">{c.id}</span> · credit note {taka(c.amount)}</>} sub={`${REASON_LABEL[c.reason] || c.reason} · ${c.by}, ${when(c.at, t)}`} end={<StatusBadge tone="success">Issued</StatusBadge>} />
                    ))}
                  </>
                ) : <p className="bl-empty">No credit notes or adjustments.</p>}
              </div>
            </section>

            <section className="ix-card" aria-label="Timeline">
              <div className="ix-card__head"><h2>Timeline</h2></div>
              <div className="ix-card__body">
                <ol className="biv-tl">
                  {events.map((e, i) => (
                    <li key={i}>
                      <span className={'biv-tl__ic' + (e.tone ? ' is-' + e.tone : '')} aria-hidden="true"><Icon name={e.icon} width="14" height="14" /></span>
                      <span className="biv-tl__txt"><b>{e.title}</b><small>{[e.sub, when(e.at, t)].filter(Boolean).join(' · ')}</small></span>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          </div>

          <div className="ix-side">
            <section className="ix-card" aria-label="Facts">
              <div className="ix-card__head"><h2>Facts</h2></div>
              <div className="ix-card__body">
                <KV rows={[
                  ['State', <BillBadge key="s" st={st} />],
                  ['Period', periodText(inv.period)],
                  ['Issued', dmy(inv.issuedAt)],
                  ['Due', <span key="d" className={st.tab === 'overdue' ? 'bl-bad' : undefined}>{dmy(inv.dueAt)}</span>],
                  inv.graceFrom ? ['Grace', `extended from ${dm(inv.graceFrom)}`] : null,
                  ['Balance', <span key="b" className={'bl-fig' + (bal ? ' bl-bad' : '')}>{taka(bal)}</span>],
                  ['Collected by', sub && sub.autoCharge ? `Auto-charge · ${sub.payMethod}` : 'Hand · pay link or call'],
                  inv.reminders && inv.reminders.length ? ['Pay links sent', plural(inv.reminders.length, 'time')] : null,
                ]} />
              </div>
            </section>
            <section className="ix-card" aria-label="Store">
              <div className="ix-card__head"><h2>Store</h2><Link href={'/admin/merchant?id=' + inv.shopId} className="ix-btn ix-btn--sm ix-btn--plain">Open</Link></div>
              <div className="ix-card__body">
                <KV rows={[
                  ['Store', shop ? shop.name : '—'],
                  ['ID', <span key="i" className="bl-data">#{inv.shopId}</span>],
                  ['Owner', owner.name],
                  owner.phone ? ['Phone', <a key="p" href={'tel:' + owner.phone} className="bl-data">{owner.phone}</a>] : null,
                  ['Package', packageOf(db, inv.shopId)],
                  shop && shop.dist ? ['District', shop.dist] : null,
                ]} />
              </div>
            </section>
          </div>
        </div>
      </div>

      <PrintCopy db={db} inv={inv} t={t} />
      {sheet && sheet.kind === 'pay' ? <PaySheet key={sheet.n} db={db} t={t} shopId={inv.shopId} invoiceId={inv.id} close={close} /> : null}
      {sheet && sheet.kind === 'adjust' ? <AdjustSheet key={sheet.n} db={db} t={t} shopId={inv.shopId} invoiceId={inv.id} type="credit" close={close} /> : null}
    </AdminShell>
  );
}
