'use client';
// Credits & adjustments (/admin/credits) — every change to what a store pays, and the prepaid GridCommerce credits.
// Tabs (counts on the tabs, amounts in the card's foot): Waiting for approval · Approved · Rejected · Credit notes ·
// Credits top-ups. A request opens in a side panel: what it changes, the bill before and after (views ›
// adjustmentEffect), questions (askAboutAdjustment) and, while it waits, Approve / Reject (decideAdjustment; a reject
// needs a reason). The person who asked can't decide, and only Finance or an Admin can: the panel says which applies.
// "New adjustment" (billingShared › AdjustSheet → requestAdjustment; ৳500 or less applies at once, waiving needs an
// Admin) and "Add credits" (lib/admin/merchants › addCredits) are in the title row.
// Data: lib/platform (db.adjustments, db.credits, billing, views) and lib/admin/merchants (walletOf, addCredits).
// ?tab= and ?id= (opens a request) are read after mount.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet, StatusBadge, EmptyState, InfoTip } from '@/components/ui';
import { ShopHeader, IndexTabs, Pager, KV, SearchField } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { dmy, taka } from '@/lib/platform/util';
import { REASON_LABEL, can } from '@/lib/platform/catalogue';
import { staff } from '@/lib/platform/store';
import { shopOf, subOf, decideAdjustment, askAboutAdjustment, subState } from '@/lib/platform/billing';
import { walletOf, addCredits } from '@/lib/admin/merchants';
import { AdminShell, usePlatform } from '../AdminShell';
import { BILL_CSS, Skeleton, money, plural, when, packageOf, Field, ctl, Effect, AdjustSheet, FormSheet, ADJ_TYPE_LABEL } from './billingShared';

const PAGE = 20;
const TABS = [['pending', 'Waiting for approval'], ['approved', 'Approved'], ['rejected', 'Rejected'], ['notes', 'Credit notes'], ['topups', 'Credits top-ups']];

const CSS = `
.cr-mine{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.cr-qs{display:flex;flex-direction:column;gap:var(--space-2)}
.cr-q{padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm);color:var(--text-body)}
.cr-q small{display:block;margin-top:2px;font-size:var(--text-xs);color:var(--text-muted)}
.cr-ask{display:flex;gap:var(--space-2);align-items:flex-end}
.cr-ask .gc-field{flex:1}
.cr-why{margin:0;font-size:var(--text-xs);color:var(--text-muted);text-align:right}
.cr-sec{display:flex;flex-direction:column;gap:var(--space-2)}
.cr-sec h3{margin:0;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-body)}
.cr-foot{display:flex;flex-direction:column;gap:var(--space-2);width:100%}
.cr-foot__btns{display:flex;justify-content:flex-end;gap:var(--space-2)}
`;

const typeLabel = (a) => ADJ_TYPE_LABEL[a.type] || a.type;
const billLink = (id) => (id && id !== 'next' ? <Link href={'/admin/invoices/view?id=' + id} className="bl-data" onClick={(e) => e.stopPropagation()}>{id}</Link> : 'Next bill');

/** Why the signed-in person can't decide this request, or null. */
function blockedWhy(me, a) {
  if (a.by === me.name) return 'You asked for this, so someone else approves it.';
  if (!can(me, 'billing', 'approve')) return 'Only Finance or an Admin can approve money changes.';
  return null;
}

/** Every top-up of GridCommerce credits, across stores, newest first. */
function topupRows(db, t) {
  const out = [];
  for (const shop of db.shops) {
    if (!subOf(db, shop.id) || shop.status === 'setup') continue;
    const k = subState(db, shop.id, t).key;
    if (k === 'archived' || k === 'failed' || k === 'setup') continue;
    const w = walletOf(db, shop.id, t);
    for (const x of w.topups) if (x.at <= t) out.push({ ...x, key: x.id, shopId: shop.id, store: shop.name, balance: w.balance });
  }
  return out.sort((a, b) => b.at - a.at);
}

// ---- a request in the side panel -----------------------------------------------------------------------------------
function ReviewSheet({ db, t, id, close }) {
  const me = staff();
  const a = db.adjustments.find((x) => x.id === id);
  const [rejecting, setRejecting] = useState(false);
  const [why, setWhy] = useState('');
  const [ask, setAsk] = useState('');
  const [err, setErr] = useState(null);
  if (!a) return <Sheet open title="Request" onClose={close}><p className="bl-empty">This request no longer exists.</p></Sheet>;
  const shop = shopOf(db, a.shopId);
  const pending = a.status === 'pending';
  const blocked = pending ? blockedWhy(me, a) : null;
  const decide = (decision) => {
    if (decision === 'reject' && !rejecting) { setRejecting(true); setErr(null); return; }
    if (decision === 'reject' && !why.trim()) { setErr({ field: 'why', text: 'Say why it is rejected.' }); return; }
    const r = decideAdjustment(a.id, decision, why.trim());
    if (!r || !r.ok) { setErr({ field: 'form', text: (r && r.error) || 'The decision could not be saved.' }); return; }
    toast(decision === 'reject' ? `${a.id} rejected` : `${a.id} approved${r.adjustment.cnId ? ' · ' + r.adjustment.cnId + ' issued' : ''}`);
    close();
  };
  const sendQ = () => {
    if (!ask.trim()) return;
    askAboutAdjustment(a.id, ask.trim());
    setAsk('');
    toast('Question added');
  };
  const footer = pending ? (
    <div className="cr-foot">
      {err && err.field === 'form' ? <p className="bl-formerr" role="alert">{err.text}</p> : null}
      {blocked ? <p className="cr-why">{blocked}</p> : null}
      <div className="cr-foot__btns">
        {rejecting ? <button type="button" className="gc-btn gc-btn--neutral" onClick={() => { setRejecting(false); setErr(null); }}>Back</button> : null}
        <button type="button" className={'gc-btn ' + (rejecting ? 'gc-btn--error' : 'gc-btn--neutral')} disabled={!!blocked} onClick={() => decide('reject')}>{rejecting ? 'Reject request' : 'Reject'}</button>
        {rejecting ? null : <button type="button" className="gc-btn gc-btn--solid" disabled={!!blocked} onClick={() => decide('approve')}>Approve</button>}
      </div>
    </div>
  ) : <button type="button" className="gc-btn gc-btn--neutral" onClick={close}>Close</button>;

  return (
    <Sheet open title={`${a.id} · ${typeLabel(a)} ${taka(a.amount)}`} onClose={close} footer={footer}>
      <StatusBadge tone={pending ? 'warning' : a.status === 'approved' ? 'success' : 'neutral'}>
        {pending ? 'Waiting for a second approval' : a.status === 'approved' ? (a.decidedBy === 'auto' ? 'Applied · under the limit' : 'Approved') : 'Rejected'}
      </StatusBadge>
      <KV rows={[
        ['Store', shop ? <Link key="s" href={'/admin/merchant?id=' + a.shopId + '&tab=billing'}>{shop.name}</Link> : '#' + a.shopId],
        ['Package', packageOf(db, a.shopId)],
        ['Bill', billLink(a.invoiceId)],
        ['Change', `${typeLabel(a)} · ${taka(a.amount)}${a.pct ? ` (${a.pct}%)` : ''}`],
        ['Reason', REASON_LABEL[a.reason] || a.reason],
        ['Owner sees', a.note],
        ['Asked by', `${a.by} · ${when(a.at, t)}`],
        a.status !== 'pending' ? ['Decided', `${a.decidedBy === 'auto' ? 'Under-limit rule' : a.decidedBy} · ${when(a.decidedAt, t)}`] : null,
        a.decisionNote ? ['Why', a.decisionNote] : null,
        a.cnId ? ['Credit note', <span key="c" className="bl-data">{a.cnId}</span>] : null,
        a.appliedTo && a.appliedTo !== 'pending' ? ['On bill', billLink(a.appliedTo)] : null,
      ]} />
      <div className="cr-sec">
        <h3>Effect on the bill</h3>
        <Effect db={db} t={t} a={a} />
      </div>
      <div className="cr-sec">
        <h3>Questions</h3>
        {a.questions && a.questions.length ? (
          <div className="cr-qs">{a.questions.map((x, i) => <div key={i} className="cr-q">{x.text}<small>{x.by} · {when(x.at, t)}</small></div>)}</div>
        ) : <p className="bl-empty">No questions yet.</p>}
        {pending ? (
          <div className="cr-ask">
            <Field id="cr-ask" label="Ask the requester">
              <input id="cr-ask" {...ctl(null)} value={ask} onChange={(e) => setAsk(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendQ(); } }} />
            </Field>
            <button type="button" className="gc-btn gc-btn--neutral" onClick={sendQ} disabled={!ask.trim()}>Ask</button>
          </div>
        ) : null}
      </div>
      {rejecting ? (
        <Field id="cr-why" label="Why it is rejected" error={err && err.field === 'why' ? err.text : null}>
          <textarea id="cr-why" rows={3} autoFocus {...ctl(err && err.field === 'why')} value={why} onChange={(e) => { setErr(null); setWhy(e.target.value); }} />
        </Field>
      ) : null}
    </Sheet>
  );
}

// ---- add GridCommerce credits ---------------------------------------------------------------------------------------
const CREDIT_REASONS = ['Paid by the owner', 'Goodwill', 'Promotion', 'Outage credit'];
function CreditsSheet({ db, t, close }) {
  const stores = db.shops.filter((s) => subOf(db, s.id) && s.status !== 'setup').sort((a, b) => a.name.localeCompare(b.name));
  const [f, setF] = useState({ shopId: '', amount: '', why: '', note: '' });
  const [err, setErr] = useState(null);
  const set = (k) => (e) => { setErr(null); setF({ ...f, [k]: e.target.value }); };
  const bal = f.shopId ? walletOf(db, f.shopId, t).balance : null;
  const submit = () => {
    if (!f.shopId) { setErr({ field: 'shopId', text: 'Pick the store.' }); return; }
    if (!f.why) { setErr({ field: 'why', text: 'Pick why.' }); return; }
    const r = addCredits(f.shopId, f.amount, [f.why, f.note.trim()].filter(Boolean).join(' · '));
    if (!r || !r.ok) { setErr({ field: /amount/i.test((r && r.error) || '') ? 'amount' : 'form', text: (r && r.error) || 'The credits could not be added.' }); return; }
    toast(`${taka(Number(f.amount))} credits added to ${shopOf(db, f.shopId).name}`);
    close();
  };
  const e = (k) => (err && err.field === k ? err.text : null);
  return (
    <FormSheet id="cr-add" title="Add GridCommerce credits" close={close} onSubmit={submit} submit="Add credits" error={err}>
      <Field id="ca-s" label="Store" error={e('shopId')} hint={bal != null ? `Balance now ${taka(bal)}` : null}>
        <select id="ca-s" {...ctl(e('shopId'), true)} value={f.shopId} onChange={set('shopId')}>
          <option value="">Pick a store</option>
          {stores.map((s) => <option key={s.id} value={s.id}>{s.name} · #{s.id}</option>)}
        </select>
      </Field>
      <Field id="ca-a" label="Amount (৳)" error={e('amount')} hint="Spent on SMS, WhatsApp, email, AI replies and call minutes.">
        <input id="ca-a" type="number" inputMode="numeric" min="1" {...ctl(e('amount'))} value={f.amount} onChange={set('amount')} />
      </Field>
      <Field id="ca-w" label="Why" error={e('why')}>
        <select id="ca-w" {...ctl(e('why'), true)} value={f.why} onChange={set('why')}>
          <option value="">Pick one</option>
          {CREDIT_REASONS.map((x) => <option key={x}>{x}</option>)}
        </select>
      </Field>
      <Field id="ca-n" label={f.why === 'Paid by the owner' ? 'Transaction ID or note' : 'Note (optional)'}>
        <input id="ca-n" {...ctl(null)} value={f.note} onChange={set('note')} />
      </Field>
    </FormSheet>
  );
}

// ---- the page --------------------------------------------------------------------------------------------------------
export default function Credits() {
  const { db, t, live } = usePlatform();
  const [tab, setTab] = useState('pending');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [sheet, setSheet] = useState(null);   // { kind: review | adjust | credits, id, n }
  const me = live ? staff() : null;

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (TABS.some(([k]) => k === p.get('tab'))) setTab(p.get('tab'));
    if (p.get('id')) setSheet({ kind: 'review', id: p.get('id'), n: Date.now() });
    if (p.get('new') === '1') setSheet({ kind: 'adjust', shopId: p.get('shop') || '', invoiceId: p.get('bill') || '', n: Date.now() });
  }, []);
  const go = (k) => {
    setTab(k); setPage(0); setQ('');
    const p = new URLSearchParams(); if (k !== 'pending') p.set('tab', k);
    const s = p.toString();
    window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
  };
  const close = () => setSheet(null);
  const review = (id) => setSheet({ kind: 'review', id, n: Date.now() });

  let data = null;
  let error = null;
  if (live) {
    try {
      const adjs = db.adjustments.slice().sort((a, b) => b.at - a.at).map((a) => ({ ...a, key: a.id, store: (shopOf(db, a.shopId) || {}).name || '#' + a.shopId }));
      const notes = db.credits.slice().sort((a, b) => b.at - a.at).map((c) => ({ ...c, key: c.id, store: (shopOf(db, c.shopId) || {}).name || '#' + c.shopId }));
      data = { pending: adjs.filter((a) => a.status === 'pending'), approved: adjs.filter((a) => a.status === 'approved'), rejected: adjs.filter((a) => a.status === 'rejected'), notes, topups: topupRows(db, t) };
    } catch (e) { error = e; }
  }
  const list = data ? data[tab] : [];
  const s = q.trim().toLowerCase();
  const filtered = list.filter((r) => !s || [r.id, r.store, r.shopId, '#' + r.shopId, r.invoiceId, r.by, r.note, r.cnId].filter(Boolean).join(' ').toLowerCase().includes(s));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const pg = Math.min(page, pages - 1);
  const rows = filtered.slice(pg * PAGE, pg * PAGE + PAGE);
  const total = filtered.reduce((a, r) => a + (r.amount || 0), 0);
  const threshold = (db.settings || {}).adjThreshold || 500;
  const tabLabel = (TABS.find(([k]) => k === tab) || [])[1];

  const exportCsv = () => {
    if (!filtered.length) { toast('Nothing to export'); return; }
    let out;
    if (tab === 'notes') out = [['Credit note', 'Store ID', 'Store', 'Bill', 'Amount (BDT)', 'Reason', 'Adjustment', 'By', 'Date'], ...filtered.map((c) => [c.id, '#' + c.shopId, c.store, c.invoiceId, c.amount, REASON_LABEL[c.reason] || c.reason, c.adjId || '', c.by, dmy(c.at)])];
    else if (tab === 'topups') out = [['Date', 'Store ID', 'Store', 'Amount (BDT)', 'Note', 'By', 'Balance now (BDT)'], ...filtered.map((x) => [dmy(x.at), '#' + x.shopId, x.store, x.amount, x.note, x.by, x.balance])];
    else out = [['Request', 'Store ID', 'Store', 'Type', 'Amount (BDT)', 'Bill', 'Reason', 'Note', 'Asked by', 'Asked', 'Status', 'Decided by', 'Credit note'], ...filtered.map((a) => [a.id, '#' + a.shopId, a.store, typeLabel(a), a.amount, a.invoiceId === 'next' ? 'Next bill' : a.invoiceId, REASON_LABEL[a.reason] || a.reason, a.note, a.by, dmy(a.at), a.status, a.decidedBy || '', a.cnId || ''])];
    downloadCsv(`gridcommerce-${tab}.csv`, out);
    toast(plural(filtered.length, 'row') + ' exported');
  };

  const tabs = TABS.map(([k, label]) => ({ key: k, id: 'cr-tab-' + k, label, count: data ? data[k].length : null, on: tab === k, onClick: () => go(k) }));

  const adjTable = (
    <>
      <ul className="ix-plist" aria-label={tabLabel}>
        {rows.map((a) => (
          <li key={a.id}>
            <button type="button" className="ix-pitem" onClick={() => review(a.id)}>
              <span className="ix-pitem__top"><b>{a.store}</b><span className="bl-fig">{taka(a.amount)}</span></span>
              <span className="ix-pitem__mid"><span className="ix-id">{a.id}</span> · {typeLabel(a)} · {REASON_LABEL[a.reason] || a.reason}</span>
              <span className="ix-pitem__mid">{a.by} · {when(a.at, t)}{tab === 'pending' && me && a.by === me.name ? ' · your request' : ''}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="ix-table-wrap">
        <table className="ix-table gc-table--keep">
          <caption className="sr-only">{tabLabel}</caption>
          <thead>
            <tr>
              <th scope="col">Request</th><th scope="col">Store</th><th scope="col">Change</th><th scope="col" className="ix-num">Amount</th>
              <th scope="col">Bill</th><th scope="col">Reason</th><th scope="col">Asked by</th>
              <th scope="col">{tab === 'pending' ? <span className="sr-only">Review</span> : 'Decided'}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => {
              const why = tab === 'pending' && me ? blockedWhy(me, a) : null;
              return (
                <tr key={a.id} tabIndex={0} onClick={() => review(a.id)} onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) review(a.id); }}>
                  <td className="ix-nowrap"><span className="ix-id ix-strong">{a.id}</span></td>
                  <td><span className="bl-name"><Link href={'/admin/merchant?id=' + a.shopId + '&tab=billing'} onClick={(e) => e.stopPropagation()}>{a.store}</Link><small>#{a.shopId}</small></span></td>
                  <td><span className="bl-name"><span>{typeLabel(a)}{a.pct ? ` · ${a.pct}%` : ''}</span><small title={a.note}>{a.note}</small></span></td>
                  <td className="ix-num"><span className="bl-fig">{taka(a.amount)}</span></td>
                  <td className="ix-nowrap">{billLink(a.invoiceId)}</td>
                  <td>{REASON_LABEL[a.reason] || a.reason}</td>
                  <td><span className="bl-name"><span>{a.by}</span><small>{when(a.at, t)}</small></span></td>
                  {tab === 'pending' ? (
                    <td className="bl-act">
                      <button type="button" className="ix-btn ix-btn--sm" onClick={(e) => { e.stopPropagation(); review(a.id); }}>Review</button>
                      {why ? <span className="cr-mine">{a.by === me.name ? 'Your request' : 'View only'}</span> : null}
                    </td>
                  ) : (
                    <td><span className="bl-name"><span>{a.decidedBy === 'auto' ? 'Under the limit' : a.decidedBy}</span><small>{a.cnId || (a.decisionNote ? a.decisionNote : when(a.decidedAt, t))}</small></span></td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );

  const notesTable = (
    <>
      <ul className="ix-plist" aria-label="Credit notes">
        {rows.map((c) => (
          <li key={c.id}>
            <Link href={'/admin/invoices/view?id=' + c.invoiceId} className="ix-pitem">
              <span className="ix-pitem__top"><b>{c.store}</b><span className="bl-fig">{taka(-c.amount)}</span></span>
              <span className="ix-pitem__mid"><span className="ix-id">{c.id}</span> · {c.invoiceId} · {REASON_LABEL[c.reason] || c.reason}</span>
              <span className="ix-pitem__mid">{c.by} · {dmy(c.at)}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="ix-table-wrap">
        <table className="ix-table ix-table--static gc-table--keep">
          <caption className="sr-only">Credit notes</caption>
          <thead><tr><th scope="col">Credit note</th><th scope="col">Store</th><th scope="col">Bill</th><th scope="col" className="ix-num">Amount</th><th scope="col">Reason</th><th scope="col">From</th><th scope="col">By</th><th scope="col">Date</th></tr></thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td className="ix-nowrap"><span className="ix-id ix-strong">{c.id}</span></td>
                <td><Link href={'/admin/merchant?id=' + c.shopId + '&tab=billing'}>{c.store}</Link></td>
                <td className="ix-nowrap">{billLink(c.invoiceId)}</td>
                <td className="ix-num"><span className="bl-fig">{taka(-c.amount)}</span></td>
                <td>{REASON_LABEL[c.reason] || c.reason}</td>
                <td className="ix-nowrap">{c.adjId ? <button type="button" className="ix-strong bl-data" onClick={() => review(c.adjId)}>{c.adjId}</button> : '—'}</td>
                <td>{c.by}</td>
                <td className="ix-nowrap ix-muted">{dmy(c.at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const topupTable = (
    <>
      <ul className="ix-plist" aria-label="Credits top-ups">
        {rows.map((x) => (
          <li key={x.key}>
            <Link href={'/admin/merchant?id=' + x.shopId + '&tab=credits'} className="ix-pitem">
              <span className="ix-pitem__top"><b>{x.store}</b><span className="bl-fig">{taka(x.amount)}</span></span>
              <span className="ix-pitem__mid">{x.note} · {x.by} · {dmy(x.at)}</span>
              <span className="ix-pitem__mid">Balance now {taka(x.balance)}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="ix-table-wrap">
        <table className="ix-table ix-table--static gc-table--keep">
          <caption className="sr-only">Credits top-ups</caption>
          <thead><tr><th scope="col">Date</th><th scope="col">Store</th><th scope="col" className="ix-num">Amount</th><th scope="col">Note</th><th scope="col">By</th><th scope="col" className="ix-num">Balance now</th></tr></thead>
          <tbody>
            {rows.map((x) => (
              <tr key={x.key}>
                <td className="ix-nowrap ix-muted">{x.seeded ? dmy(x.at) : when(x.at, t)}</td>
                <td><span className="bl-name"><Link href={'/admin/merchant?id=' + x.shopId + '&tab=credits'}>{x.store}</Link><small>#{x.shopId}</small></span></td>
                <td className="ix-num"><span className="bl-fig">{taka(x.amount)}</span></td>
                <td>{x.note}</td>
                <td>{x.by}</td>
                <td className="ix-num"><span className={'bl-fig' + (x.balance < 300 ? ' bl-warn' : '')}>{taka(x.balance)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const EMPTY = {
    pending: ['Nothing is waiting for approval.', 'New adjustment', () => setSheet({ kind: 'adjust', n: Date.now() })],
    approved: ['No approved adjustments yet.', 'New adjustment', () => setSheet({ kind: 'adjust', n: Date.now() })],
    rejected: ['No rejected requests.', 'See waiting requests', () => go('pending')],
    notes: ['No credit notes yet.', 'New adjustment', () => setSheet({ kind: 'adjust', n: Date.now() })],
    topups: ['No top-ups yet.', 'Add credits', () => setSheet({ kind: 'credits', n: Date.now() })],
  };

  let body;
  if (!live) body = <Skeleton label="Loading credits and adjustments" />;
  else if (error) {
    body = (
      <section className="ix-card"><div className="bl-err" role="alert">
        <Icon name="triangle-alert" width="24" height="24" aria-hidden="true" />
        <p style={{ margin: 0 }}>Credits and adjustments could not be worked out.</p>
        <button type="button" className="ix-btn" onClick={() => window.location.reload()}>Try again</button>
      </div></section>
    );
  } else {
    const foot = (
      <span className="bl-foot">
        <span>{filtered.length ? `${pg * PAGE + 1}–${pg * PAGE + rows.length} of ${filtered.length}` : '0 rows'}</span>
        {total ? <span>{tab === 'topups' ? 'Added' : tab === 'notes' ? 'Credited' : 'Total'} <b>{money(total)}</b></span> : null}
      </span>
    );
    const [emptyText, emptyAction, emptyGo] = EMPTY[tab];
    body = (
      <section className="ix-card" aria-label={tabLabel}>
        <div className="ix-bar">
          <IndexTabs tabs={tabs} label="Credits and adjustments" />
          <InfoTip label="About approvals" text={`Bills are never edited: a correction is a credit note. A request of ${taka(threshold)} or less applies at once; above that Finance or an Admin approves it, never the person who asked. Waiving a bill needs an Admin.`} />
        </div>
        <div className="bl-filters">
          <SearchField value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} onDone={() => setQ('')} placeholder="Search store, ID, bill or person" />
        </div>
        {!filtered.length ? (
          <div className="ix-empty">
            {s ? <EmptyState title="Nothing matches." actionLabel="Clear search" onAction={() => setQ('')} /> : <EmptyState icon="receipt-text" title={emptyText} actionLabel={emptyAction} onAction={emptyGo} />}
          </div>
        ) : tab === 'notes' ? notesTable : tab === 'topups' ? topupTable : adjTable}
        <Pager label={foot} atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />
      </section>
    );
  }

  return (
    <AdminShell active="credits" title="Credits & adjustments">
      <style dangerouslySetInnerHTML={{ __html: BILL_CSS + CSS }} />
      <div className="ix-page">
        <ShopHeader icon="receipt-text" title="Credits & adjustments"
          about="Every change to what a store pays: credit notes on a bill, discounts and extra charges on the next bill, and waivers. Each has a reason code; above the limit a second person approves it, never the one who asked. The Credits top-ups tab lists the prepaid GridCommerce credits stores spend on SMS, WhatsApp, email, AI replies and calls."
          secondary={[{ label: 'Add credits', icon: 'wallet', onClick: () => setSheet({ kind: 'credits', n: Date.now() }) }, { label: 'Export', icon: 'download', onClick: exportCsv }]}
          primary={{ label: 'New adjustment', icon: 'plus', onClick: () => setSheet({ kind: 'adjust', n: Date.now() }) }} />
        {body}
      </div>
      {live && sheet && sheet.kind === 'review' ? <ReviewSheet key={sheet.n} db={db} t={t} id={sheet.id} close={close} /> : null}
      {live && sheet && sheet.kind === 'adjust' ? (
        <AdjustSheet key={sheet.n} db={db} t={t} shopId={sheet.shopId || ''} invoiceId={sheet.invoiceId || ''} close={(a) => { close(); if (a) go(a.status === 'pending' ? 'pending' : 'approved'); }} />
      ) : null}
      {live && sheet && sheet.kind === 'credits' ? <CreditsSheet key={sheet.n} db={db} t={t} close={close} /> : null}
    </AdminShell>
  );
}
