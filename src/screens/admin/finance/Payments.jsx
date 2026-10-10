'use client';
// Payments (/admin/payments) — every taka stores paid GridCommerce, and the money going back to them; adapted from the
// merchant panel's Money list (screens/accounts/Money.jsx) and Payments (payment-ops). One card with the views as tabs:
//   Received      every payment (db.payments): method, transaction ID, how it came in (panel, call, auto-charge, bank),
//                 who took it, the bill and the store, the account it went into; filters; a row opens its details
//   To match      money that came in outside the panel without a bill (a bank deposit, a wallet transfer with no
//                 reference); Match picks the bill and records it (billing › recordPayment, transaction ID once)
//   Refunds       requested → approved (not by the person who asked; finance or an admin) → sent (with its
//                 transaction ID); or declined with a reason
//   Credit notes  the credit notes on bills, with a link to Credits & adjustments where they are made
// Title row: Record payment (choose the store and the bill → recordReceived), Note money received, Export.
// Data: lib/platform (payments, invoices, credits) + lib/admin/finance (refunds, received, accounts). ?tab= ?id= ?add=1.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { EmptyState } from '@/components/ui';
import { FilterBar } from '@/components/ui/FilterBar';
import { ShopHeader, IndexTabs, Pager, MetricStrip, KV } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { startOfMonth, addMonths, periodOf, daysBetween } from '@/lib/platform/util';
import { METHODS, VIA, REASON_LABEL } from '@/lib/platform/catalogue';
import { openInvoices, balance, paidVia, invoiceById } from '@/lib/platform/billing';
import {
  paymentAccount, storeName, packageOf, recordReceived, addReceived, createRefund, approveRefund, declineRefund, markRefundSent,
  ledger, balances, REFUND_STATUS, REFUND_REASONS, REFUND_METHODS, RECEIVED_METHODS, periodLabel,
} from '@/lib/admin/finance';
import { staff } from '@/lib/platform/store';
import { AdminShell } from '../AdminShell';
import {
  FIN_CSS, useFinance, money, plural, when, dmy, readParams, setParams, rowGo, rowKey, Field, ctl, errOf, FormSheet, AccountSelect,
  accName, Skeleton, ErrorCard, RefundBadge, DetailSheet, useErr, fromDateInput, dateInput,
} from './finShared';

const PAGE = 20;
const TABS = [['received', 'Received'], ['match', 'To match'], ['refunds', 'Refunds'], ['notes', 'Credit notes']];
const VIA_LABEL = { panel: 'From the panel', call: 'Taken on a call', auto: 'Auto-charge', bank: 'Bank deposit', person: 'In person' };
const METHOD_ACCOUNT = { bKash: 'bkash', Nagad: 'nagad', 'Cash at office': 'cash', Card: 'brac', 'Bank transfer': 'city', Rocket: 'city' };
const RF_VIEWS = [['', 'All refunds'], ['requested', 'Waiting approval'], ['approved', 'To send'], ['sent', 'Sent'], ['declined', 'Declined']];

// ---- record a payment on a bill --------------------------------------------------------------------------------------
function PaySheet({ db, F, t, bal, preset, close }) {
  const owing = [...new Set(db.invoices.filter((i) => balance(db, i) > 0).map((i) => i.shopId))]
    .map((id) => ({ id, name: storeName(db, id), owed: openInvoices(db, id).reduce((s, i) => s + balance(db, i), 0) }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const startShop = preset && preset.shopId && owing.some((s) => s.id === preset.shopId) ? preset.shopId : '';
  const firstInv = (shopId) => { const o = shopId ? openInvoices(db, shopId) : []; return o[0] || null; };
  const inv0 = firstInv(startShop);
  const [f, setF] = useState({
    shopId: startShop, invoiceId: inv0 ? inv0.id : '', amount: preset && preset.amount ? String(preset.amount) : inv0 ? String(balance(db, inv0)) : '',
    method: (preset && preset.method) || 'bKash', txId: (preset && preset.ref) || '', via: preset ? 'bank' : 'call',
    account: (preset && preset.account) || METHOD_ACCOUNT[(preset && preset.method) || 'bKash'],
  });
  const [err, setErr] = useErr();
  const set = (k) => (e) => {
    setErr(null);
    const v = e.target.value;
    if (k === 'shopId') { const i = firstInv(v); setF({ ...f, shopId: v, invoiceId: i ? i.id : '', amount: preset && preset.amount ? f.amount : i ? String(balance(db, i)) : '' }); return; }
    if (k === 'invoiceId') { const i = invoiceById(db, v); setF({ ...f, invoiceId: v, amount: preset && preset.amount ? f.amount : i ? String(balance(db, i)) : f.amount }); return; }
    if (k === 'method') { setF({ ...f, method: v, account: METHOD_ACCOUNT[v] || f.account }); return; }
    setF({ ...f, [k]: v });
  };
  const open = f.shopId ? openInvoices(db, f.shopId) : [];
  const cash = f.method === 'Cash at office';
  const submit = () => {
    if (!f.shopId) { setErr({ ok: false, error: 'Pick the store that paid.', field: 'shopId' }); return; }
    const r = recordReceived({ invoiceId: f.invoiceId, amount: f.amount, method: f.method, txId: cash ? '' : f.txId, via: f.via, account: f.account, receivedId: preset ? preset.id : null });
    if (!r || !r.ok) {
      const e = (r && r.error) || '';
      setErr({ ok: false, error: e || 'The payment could not be saved.', field: r && r.field ? r.field : /transaction/i.test(e) ? 'txId' : /amount|more than/i.test(e) ? 'amount' : /bill/i.test(e) ? 'invoiceId' : null });
      return;
    }
    toast(`${money(r.payment.amount)} recorded on ${r.payment.invoiceId}${r.restored ? ' · access restored' : r.left ? ` · ${money(r.left)} still owed` : ''}`);
    close();
  };
  return (
    <FormSheet id="fn-pay" title={preset ? `Match ${money(preset.amount)} to a bill` : 'Record payment'} close={close} onSubmit={submit} submit="Record payment" err={err}>
      {preset ? <p className="fn-note">{preset.payer} · {preset.method} <span className="fn-data">{preset.ref}</span> · {when(preset.at, t)} into {accName(F, preset.account)}</p> : null}
      <Field id="fp-s" label="Store" error={errOf(err, 'shopId')}>
        <select id="fp-s" {...ctl(errOf(err, 'shopId'), true)} value={f.shopId} onChange={set('shopId')}>
          <option value="">Pick a store that owes</option>
          {owing.map((s) => <option key={s.id} value={s.id}>{s.name} · #{s.id} · owes {money(s.owed)}</option>)}
        </select>
      </Field>
      {f.shopId ? (
        <Field id="fp-i" label="Bill" error={errOf(err, 'invoiceId')}>
          <select id="fp-i" {...ctl(errOf(err, 'invoiceId'), true)} value={f.invoiceId} onChange={set('invoiceId')}>
            {open.map((i) => <option key={i.id} value={i.id}>{i.id} · {money(balance(db, i))} · {daysBetween(i.dueAt, t) > 0 ? `${daysBetween(i.dueAt, t)} days overdue` : 'due ' + dmy(i.dueAt)}</option>)}
          </select>
        </Field>
      ) : null}
      <div className="fn-form__two">
        <Field id="fp-a" label="Amount (৳)" error={errOf(err, 'amount')}>
          <input id="fp-a" type="number" inputMode="numeric" min="1" {...ctl(errOf(err, 'amount'))} value={f.amount} onChange={set('amount')} />
        </Field>
        <Field id="fp-m" label="Method">
          <select id="fp-m" {...ctl(null, true)} value={f.method} onChange={set('method')}>{METHODS.map((m) => <option key={m}>{m}</option>)}</select>
        </Field>
      </div>
      {cash ? null : (
        <Field id="fp-t" label="Transaction ID" error={errOf(err, 'txId')} hint={`From the ${f.method} message or the deposit slip. Each ID can be used once.`}>
          <input id="fp-t" className={ctl(errOf(err, 'txId')).className + ' fn-data'} aria-invalid={errOf(err, 'txId') ? true : undefined} autoComplete="off" spellCheck={false} value={f.txId} onChange={set('txId')} />
        </Field>
      )}
      <div className="fn-form__two">
        <Field id="fp-v" label="How it came in">
          <select id="fp-v" {...ctl(null, true)} value={f.via} onChange={set('via')}>{VIA.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        </Field>
        <AccountSelect id="fp-acc" label="Went into" F={F} bal={bal} value={f.account} onChange={(v) => { setErr(null); setF({ ...f, account: v }); }} error={errOf(err, 'account')} />
      </div>
    </FormSheet>
  );
}

// ---- note money received without a bill ------------------------------------------------------------------------------
function ReceivedSheet({ db, F, t, bal, close }) {
  const [f, setF] = useState({ amount: '', method: 'Bank transfer', account: 'city', ref: '', payer: '', shopId: '', date: dateInput(t), note: '' });
  const [err, setErr] = useErr();
  const set = (k) => (e) => { setErr(null); const v = e.target.value; setF(k === 'method' ? { ...f, method: v, account: METHOD_ACCOUNT[v] || f.account } : { ...f, [k]: v }); };
  const stores = [...db.shops].sort((a, b) => a.name.localeCompare(b.name));
  const submit = () => {
    const r = addReceived({ ...f, at: fromDateInput(f.date, 12) });
    if (!r.ok) { setErr(r); return; }
    toast(`${money(r.received.amount)} noted · match it to a bill when you know which`);
    close();
  };
  return (
    <FormSheet id="fn-rec" title="Note money received" close={close} onSubmit={submit} submit="Save" err={err}>
      <p className="fn-note">For money that came in outside the panel and can’t be put on a bill yet. It shows under To match until it is.</p>
      <div className="fn-form__two">
        <Field id="fr-a" label="Amount (৳)" error={errOf(err, 'amount')}><input id="fr-a" type="number" inputMode="numeric" min="1" {...ctl(errOf(err, 'amount'))} value={f.amount} onChange={set('amount')} /></Field>
        <Field id="fr-d" label="Received on"><input id="fr-d" type="date" max={dateInput(t)} {...ctl(null)} value={f.date} onChange={set('date')} /></Field>
      </div>
      <div className="fn-form__two">
        <Field id="fr-m" label="Method"><select id="fr-m" {...ctl(null, true)} value={f.method} onChange={set('method')}>{RECEIVED_METHODS.map((m) => <option key={m}>{m}</option>)}</select></Field>
        <AccountSelect id="fr-acc" label="Came into" F={F} bal={bal} value={f.account} onChange={(v) => { setErr(null); setF({ ...f, account: v }); }} error={errOf(err, 'account')} />
      </div>
      <Field id="fr-r" label="Transaction or deposit reference" error={errOf(err, 'ref')}><input id="fr-r" className={ctl(errOf(err, 'ref')).className + ' fn-data'} autoComplete="off" spellCheck={false} value={f.ref} onChange={set('ref')} /></Field>
      <Field id="fr-p" label="From" error={errOf(err, 'payer')} hint="A name, a wallet number or the bank branch."><input id="fr-p" {...ctl(errOf(err, 'payer'))} value={f.payer} onChange={set('payer')} /></Field>
      <Field id="fr-s" label="Store, if you know it">
        <select id="fr-s" {...ctl(null, true)} value={f.shopId} onChange={set('shopId')}><option value="">Not known yet</option>{stores.map((s) => <option key={s.id} value={s.id}>{s.name} · #{s.id}</option>)}</select>
      </Field>
      <Field id="fr-n" label="Note (optional)"><textarea id="fr-n" rows={2} {...ctl(null)} value={f.note} onChange={set('note')} /></Field>
    </FormSheet>
  );
}

// ---- refunds ---------------------------------------------------------------------------------------------------------------
function NewRefundSheet({ db, F, bal, close }) {
  const stores = [...new Set(db.payments.filter((p) => p.status === 'ok').map((p) => p.shopId))].map((id) => ({ id, name: storeName(db, id) })).sort((a, b) => a.name.localeCompare(b.name));
  const [f, setF] = useState({ shopId: '', invoiceId: '', amount: '', reason: '', method: 'bKash', account: 'bkash', note: '' });
  const [err, setErr] = useErr();
  const set = (k) => (e) => { setErr(null); const v = e.target.value; setF(k === 'method' ? { ...f, method: v, account: METHOD_ACCOUNT[v === 'Card reversal' ? 'Card' : v] || 'city' } : k === 'shopId' ? { ...f, shopId: v, invoiceId: '' } : { ...f, [k]: v }); };
  const paidBills = f.shopId ? db.invoices.filter((i) => i.shopId === f.shopId && db.payments.some((p) => p.invoiceId === i.id && p.status === 'ok')).sort((a, b) => b.issuedAt - a.issuedAt).slice(0, 12) : [];
  const submit = () => {
    const r = createRefund(f);
    if (!r.ok) { setErr(r); return; }
    toast(`Refund ${r.refund.id} asked for · it waits for approval`);
    close();
  };
  return (
    <FormSheet id="fn-rf" title="Refund a store" close={close} onSubmit={submit} submit="Ask for approval" err={err}>
      <Field id="rf-s" label="Store" error={errOf(err, 'shopId')}>
        <select id="rf-s" {...ctl(errOf(err, 'shopId'), true)} value={f.shopId} onChange={set('shopId')}><option value="">Pick the store</option>{stores.map((s) => <option key={s.id} value={s.id}>{s.name} · #{s.id}</option>)}</select>
      </Field>
      {f.shopId ? (
        <Field id="rf-i" label="Bill (optional)">
          <select id="rf-i" {...ctl(null, true)} value={f.invoiceId} onChange={set('invoiceId')}><option value="">Not one bill</option>{paidBills.map((i) => <option key={i.id} value={i.id}>{i.id} · {money(i.total)} · {periodLabel(i.period)}</option>)}</select>
        </Field>
      ) : null}
      <div className="fn-form__two">
        <Field id="rf-a" label="Amount (৳)" error={errOf(err, 'amount')}><input id="rf-a" type="number" inputMode="numeric" min="1" {...ctl(errOf(err, 'amount'))} value={f.amount} onChange={set('amount')} /></Field>
        <Field id="rf-r" label="Reason" error={errOf(err, 'reason')}>
          <select id="rf-r" {...ctl(errOf(err, 'reason'), true)} value={f.reason} onChange={set('reason')}><option value="">Pick a reason</option>{REFUND_REASONS.map((r) => <option key={r}>{r}</option>)}</select>
        </Field>
      </div>
      <div className="fn-form__two">
        <Field id="rf-m" label="Send back by" error={errOf(err, 'method')}><select id="rf-m" {...ctl(null, true)} value={f.method} onChange={set('method')}>{REFUND_METHODS.map((m) => <option key={m}>{m}</option>)}</select></Field>
        <AccountSelect id="rf-acc" label="From account" F={F} bal={bal} value={f.account} onChange={(v) => setF({ ...f, account: v })} />
      </div>
      <Field id="rf-n" label={f.reason === 'Other' ? 'Say why' : 'Note (optional)'} error={errOf(err, 'note')}><textarea id="rf-n" rows={2} {...ctl(errOf(err, 'note'))} value={f.note} onChange={set('note')} /></Field>
      <p className="fn-note fn-note--warn">Money leaves our account. Someone in finance other than you approves it before it is sent.</p>
    </FormSheet>
  );
}

function RefundSheet({ db, F, t, r, close }) {
  const me = staff();
  const [mode, setMode] = useState('');   // '' · 'send' · 'decline'
  const [ref, setRef] = useState('');
  const [why, setWhy] = useState('');
  const [err, setErr] = useErr();
  const canAct = me && (me.role === 'admin' || me.role === 'finance');
  const mine = me && me.name === r.requestedBy;
  const run = (fn, done) => { const res = fn(); if (!res.ok) { setErr(res); return; } toast(done); close(); };
  const footer = (() => {
    if (r.status === 'requested') {
      if (mode === 'decline') return <><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setMode('')}>Back</button><button type="button" className="gc-btn gc-btn--error gc-btn--solid" onClick={() => run(() => declineRefund(r.id, why), `Refund ${r.id} declined`)}>Decline refund</button></>;
      return <><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setMode('decline')} disabled={!canAct}>Decline</button><button type="button" className="gc-btn gc-btn--solid" disabled={!canAct || mine} onClick={() => run(() => approveRefund(r.id), `Refund ${r.id} approved · send it next`)}>Approve</button></>;
    }
    if (r.status === 'approved') {
      if (mode === 'send') return <><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setMode('')}>Back</button><button type="button" className="gc-btn gc-btn--solid" onClick={() => run(() => markRefundSent(r.id, { ref }), `${money(r.amount)} sent back to ${storeName(db, r.shopId)}`)}>Mark sent</button></>;
      return <><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setMode('decline')} disabled={!canAct}>Decline</button><button type="button" className="gc-btn gc-btn--solid" disabled={!canAct} onClick={() => setMode('send')}>Mark sent</button></>;
    }
    return <button type="button" className="gc-btn gc-btn--neutral" onClick={close}>Close</button>;
  })();
  return (
    <DetailSheet title={`Refund ${r.id}`} close={close} footer={footer}>
      <div className="fn-sheet__big"><span><RefundBadge status={r.status} /></span><b>{money(r.amount)}</b></div>
      <KV rows={[
        ['Store', <Link key="s" href={'/admin/merchant?id=' + r.shopId}>{storeName(db, r.shopId)} · #{r.shopId}</Link>],
        ['Package', packageOf(db, r.shopId)],
        r.invoiceId ? ['Bill', <Link key="i" href={'/admin/invoices/view?id=' + encodeURIComponent(r.invoiceId)} className="fn-data">{r.invoiceId}</Link>] : null,
        ['Reason', r.reason],
        ['Send back by', r.method],
        ['From account', accName(F, r.account)],
        r.ref ? ['Transaction ID', <span key="r" className="fn-data">{r.ref}</span>] : null,
      ]} />
      {r.note ? <p className="fn-note">{r.note}</p> : null}
      <div>
        <h3>History</h3>
        <ul className="fn-trail">
          <li><time>{dmy(r.requestedAt)}</time><span>Asked for by {r.requestedBy}</span></li>
          {r.approvedAt ? <li><time>{dmy(r.approvedAt)}</time><span>Approved by {r.approvedBy}</span></li> : null}
          {r.sentAt ? <li><time>{dmy(r.sentAt)}</time><span>Sent by {r.sentBy}</span></li> : null}
          {r.declinedAt ? <li><time>{dmy(r.declinedAt)}</time><span>Declined by {r.declinedBy}: {r.declineReason}</span></li> : null}
        </ul>
      </div>
      {r.status === 'requested' && mine && mode !== 'decline' ? <p className="fn-note fn-note--warn">You asked for this refund, so someone else in finance approves it.</p> : null}
      {(r.status === 'requested' || r.status === 'approved') && !canAct ? <p className="fn-note">Only finance or an admin can approve and send refunds.</p> : null}
      {mode === 'send' ? (
        <Field id="rs-ref" label="Transaction ID" error={errOf(err, 'ref')} hint={r.method === 'Cash at office' ? 'Optional for cash.' : `From the ${r.method} confirmation. Each ID can be used once.`}>
          <input id="rs-ref" className={ctl(errOf(err, 'ref')).className + ' fn-data'} autoComplete="off" spellCheck={false} value={ref} onChange={(e) => { setErr(null); setRef(e.target.value); }} />
        </Field>
      ) : null}
      {mode === 'decline' ? (
        <Field id="rs-why" label="Why it is declined" error={errOf(err, 'reason')}>
          <textarea id="rs-why" rows={2} {...ctl(errOf(err, 'reason'))} value={why} onChange={(e) => { setErr(null); setWhy(e.target.value); }} />
        </Field>
      ) : null}
      {err && err.error && !err.field ? <p className="fn-formerr" role="alert">{err.error}</p> : null}
    </DetailSheet>
  );
}

// ---- one payment -------------------------------------------------------------------------------------------------------------
function PaymentSheet({ db, F, p, close }) {
  const inv = invoiceById(db, p.invoiceId);
  return (
    <DetailSheet title={`Payment ${p.id}`} close={close} footer={<Link className="gc-btn gc-btn--neutral" href={'/admin/invoices/view?id=' + encodeURIComponent(p.invoiceId)}>Open the bill</Link>}>
      <div className="fn-sheet__big"><span>{VIA_LABEL[p.via] || p.via}</span><b>{money(p.amount)}</b></div>
      <KV rows={[
        ['Store', <Link key="s" href={'/admin/merchant?id=' + p.shopId}>{storeName(db, p.shopId)} · #{p.shopId}</Link>],
        ['Package', packageOf(db, p.shopId)],
        ['Bill', <Link key="i" href={'/admin/invoices/view?id=' + encodeURIComponent(p.invoiceId)} className="fn-data">{p.invoiceId}</Link>],
        inv ? ['Bill for', periodLabel(inv.period)] : null,
        ['Received', dmy(p.at)],
        ['Method', p.method],
        ['Transaction ID', p.txId ? <span key="t" className="fn-data">{p.txId}</span> : '—'],
        ['Taken by', p.by],
        ['Went into', accName(F, paymentAccount(F, p))],
      ]} />
    </DetailSheet>
  );
}

// ---- the page ----------------------------------------------------------------------------------------------------------------
export default function Payments() {
  const { db, F, t, ready } = useFinance();
  const [tab, setTab] = useState('received');
  const [q, setQ] = useState('');
  const [f, setF] = useState({ method: '', via: '', month: '', account: '', rf: '' });
  const [page, setPage] = useState(0);
  const [sheet, setSheet] = useState(null);   // { kind: 'pay' | 'received' | 'refund' | 'newRefund' | 'payment', … }

  useEffect(() => {
    const p = readParams();
    if (TABS.some(([k]) => k === p.get('tab'))) setTab(p.get('tab'));
    if (p.get('add') === '1') setSheet({ kind: 'pay' });
    if (p.get('add') === 'refund') setSheet({ kind: 'newRefund' });
    const id = p.get('id');
    if (id && id.startsWith('RF-')) setSheet({ kind: 'refund', id });
    else if (id && id.startsWith('PAY-')) setSheet({ kind: 'payment', id });
  }, []);
  const go = (k) => { setTab(k); setPage(0); setQ(''); setParams({ tab: k === 'received' ? '' : k, id: '' }); };
  const setFilter = (k) => (v) => { setF((o) => ({ ...o, [k]: v })); setPage(0); };
  const openSheet = (s) => { setSheet(s); if (s.id) setParams({ id: s.id }); };
  const closeSheet = () => { setSheet(null); setParams({ id: '', add: '' }); };

  let error = null, d = null;
  if (ready) {
    try {
      const rows = ledger(db, F, t);
      const bal = balances(db, F, t, t, rows);
      const pays = db.payments.filter((p) => p.status === 'ok').sort((a, b) => b.at - a.at);
      const m0 = startOfMonth(t), m1 = addMonths(m0, -1, 1);
      const thisM = pays.filter((p) => p.at >= m0), lastM = pays.filter((p) => p.at >= m1 && p.at < m0);
      d = {
        bal, pays, thisM, lastM,
        received: thisM.reduce((s, p) => s + p.amount, 0), lastReceived: lastM.reduce((s, p) => s + p.amount, 0),
        panel: thisM.filter((p) => p.via === 'panel').length, auto: thisM.filter((p) => p.via === 'auto').length,
        refunded: F.refunds.filter((r) => r.status === 'sent' && r.sentAt >= m0).reduce((s, r) => s + r.amount, 0),
        open: F.received.filter((m) => m.status === 'open').sort((a, b) => b.at - a.at),
        matched: F.received.filter((m) => m.status === 'matched').sort((a, b) => b.matchedAt - a.matchedAt),
        refunds: [...F.refunds].sort((a, b) => (a.status === 'sent' || a.status === 'declined') - (b.status === 'sent' || b.status === 'declined') || b.requestedAt - a.requestedAt),
        notes: [...db.credits].sort((a, b) => b.at - a.at),
      };
    } catch (e) { error = e; }
  }

  const counts = d ? { received: d.pays.length, match: d.open.length, refunds: d.refunds.filter((r) => r.status === 'requested' || r.status === 'approved').length, notes: d.notes.length } : {};
  const months = d ? [...new Set(d.pays.map((p) => periodOf(p.at)))].sort().reverse().slice(0, 18) : [];
  const s = q.trim().toLowerCase();
  const payRows = d ? d.pays.filter((p) => {
    if (f.method && p.method !== f.method) return false;
    if (f.via && p.via !== f.via) return false;
    if (f.month && periodOf(p.at) !== f.month) return false;
    if (f.account && paymentAccount(F, p) !== f.account) return false;
    if (!s) return true;
    return [p.id, p.txId, p.invoiceId, p.shopId, '#' + p.shopId, storeName(db, p.shopId), p.by].join(' ').toLowerCase().includes(s);
  }) : [];
  const rfRows = d ? d.refunds.filter((r) => (!f.rf || r.status === f.rf) && (!s || [r.id, r.shopId, storeName(db, r.shopId), r.reason, r.requestedBy, r.ref].join(' ').toLowerCase().includes(s))) : [];
  const pages = Math.max(1, Math.ceil(payRows.length / PAGE));
  const pg = Math.min(page, pages - 1);
  const shown = payRows.slice(pg * PAGE, pg * PAGE + PAGE);

  const exportCsv = () => {
    if (!d) return;
    if (tab === 'refunds') {
      downloadCsv('gridcommerce-refunds.csv', [['Refund', 'Store ID', 'Store', 'Amount (BDT)', 'Reason', 'Method', 'Account', 'Status', 'Asked by', 'Asked on', 'Approved by', 'Sent on', 'Transaction ID'],
        ...rfRows.map((r) => [r.id, '#' + r.shopId, storeName(db, r.shopId), r.amount, r.reason, r.method, accName(F, r.account), REFUND_STATUS[r.status].label, r.requestedBy, dmy(r.requestedAt), r.approvedBy || '', r.sentAt ? dmy(r.sentAt) : '', r.ref])]);
    } else {
      downloadCsv('gridcommerce-payments.csv', [['Payment', 'Date', 'Store ID', 'Store', 'Invoice', 'Amount (BDT)', 'Method', 'Transaction ID', 'Came in', 'Taken by', 'Account'],
        ...payRows.map((p) => [p.id, dmy(p.at), '#' + p.shopId, storeName(db, p.shopId), p.invoiceId, p.amount, p.method, p.txId || '', VIA_LABEL[p.via] || p.via, p.by, accName(F, paymentAccount(F, p))])]);
    }
    toast('Exported');
  };

  const header = (
    <ShopHeader icon="wallet" title="Payments"
      about="Every payment stores made to GridCommerce: from their panel, taken on a call, by auto-charge or deposited at the bank. Money that came in outside the panel without a bill waits under To match. Refunds to stores are asked for, approved by someone else in finance, then sent with their transaction ID. Credit notes are made on Credits & adjustments."
      secondary={[{ label: 'Note money received', icon: 'banknote', onClick: () => setSheet({ kind: 'received' }) }]}
      more={[{ label: 'Refund a store', onClick: () => setSheet({ kind: 'newRefund' }) }, { label: 'Export', onClick: exportCsv }, { label: 'Collections', href: '/admin/collections' }, { label: 'Credits & adjustments', href: '/admin/credits' }]}
      primary={{ label: 'Record payment', icon: 'plus', onClick: () => setSheet({ kind: 'pay' }) }} />
  );

  let body;
  if (!ready) body = <Skeleton label="Loading payments" />;
  else if (error) body = <ErrorCard what="The payments" />;
  else {
    const tabs = TABS.map(([k, label]) => ({ key: k, id: 'pay-tab-' + k, label, count: counts[k], on: tab === k, onClick: () => go(k) }));
    let list;
    if (tab === 'received') {
      const filters = [
        { key: 'method', label: 'Method', all: 'All methods', value: f.method, options: METHODS.map((m) => [m, m]), onChange: setFilter('method') },
        { key: 'via', label: 'Came in', all: 'Any way', value: f.via, options: Object.entries(VIA_LABEL), onChange: setFilter('via') },
        { key: 'month', label: 'Month', all: 'All months', value: f.month, options: months.map((m) => [m, periodLabel(m)]), onChange: setFilter('month') },
        { key: 'account', label: 'Account', all: 'All accounts', value: f.account, options: F.accounts.map((a) => [a.id, a.name]), onChange: setFilter('account') },
      ];
      const sum = payRows.reduce((a, p) => a + p.amount, 0);
      list = (
        <>
          <div className="fn-filters"><FilterBar label="Filter payments" filters={filters} search={{ value: q, onChange: (v) => { setQ(v); setPage(0); }, placeholder: 'Search payment, transaction ID, bill or store' }} onClear={() => setQ('')} /></div>
          {!payRows.length ? (
            <div className="ix-empty"><EmptyState title="No payments match these filters." actionLabel="Clear filters" onAction={() => { setQ(''); setF({ method: '', via: '', month: '', account: '', rf: '' }); }} /></div>
          ) : (
            <>
              <ul className="ix-plist" aria-label="Payments">
                {shown.map((p) => (
                  <li key={p.id}><button type="button" className="ix-pitem" onClick={() => openSheet({ kind: 'payment', id: p.id })}>
                    <span className="ix-pitem__top"><b>{storeName(db, p.shopId)}</b><span className="fn-fig">{money(p.amount)}</span></span>
                    <span className="ix-pitem__mid">{when(p.at, t)} · {paidVia(p)} · <span className="fn-data">{p.invoiceId}</span></span>
                  </button></li>
                ))}
              </ul>
              <div className="ix-table-wrap">
                <table className="ix-table">
                  <caption className="sr-only">Payments received</caption>
                  <thead><tr><th scope="col">Date</th><th scope="col">Store</th><th scope="col">Bill</th><th scope="col">Method</th><th scope="col">Transaction ID</th><th scope="col">Came in</th><th scope="col">Into</th><th scope="col" className="ix-num">Amount</th></tr></thead>
                  <tbody>
                    {shown.map((p) => {
                      const open = () => openSheet({ kind: 'payment', id: p.id });
                      return (
                        <tr key={p.id} tabIndex={0} onClick={rowGo(open)} onKeyDown={rowKey(open)}>
                          <td className="ix-nowrap ix-muted">{when(p.at, t)}</td>
                          <td><span className="fn-name"><Link href={'/admin/merchant?id=' + p.shopId}>{storeName(db, p.shopId)}</Link><small>#{p.shopId} · {p.by}</small></span></td>
                          <td className="ix-nowrap"><Link href={'/admin/invoices/view?id=' + encodeURIComponent(p.invoiceId)} className="ix-id">{p.invoiceId}</Link></td>
                          <td className="ix-nowrap">{p.method}</td>
                          <td className="ix-nowrap"><span className="fn-data ix-muted">{p.txId || '—'}</span></td>
                          <td className="ix-nowrap">{VIA_LABEL[p.via] || p.via}</td>
                          <td className="ix-nowrap ix-muted">{accName(F, paymentAccount(F, p))}</td>
                          <td className="ix-num"><span className="fn-fig">{money(p.amount)}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <Pager label={<span className="fn-tfoot"><span>{payRows.length ? `${pg * PAGE + 1}–${pg * PAGE + shown.length} of ${payRows.length}` : '0 payments'}</span>{sum ? <span>Total <b>{money(sum)}</b></span> : null}</span>}
            atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />
        </>
      );
    } else if (tab === 'match') {
      const row = (m) => {
        const owes = m.shopId ? openInvoices(db, m.shopId).reduce((a, i) => a + balance(db, i), 0) : null;
        return { m, owes };
      };
      list = (
        <>
          {!d.open.length ? (
            <div className="ix-empty"><EmptyState icon="circle-check" title="Every payment received is on a bill." actionLabel="Note money received" onAction={() => setSheet({ kind: 'received' })} /></div>
          ) : (
            <>
              <ul className="ix-plist" aria-label="Payments to match">
                {d.open.map((m) => (
                  <li key={m.id}><div className="ix-pitem">
                    <span className="ix-pitem__top"><b>{m.payer}</b><span className="fn-fig">{money(m.amount)}</span></span>
                    <span className="ix-pitem__mid">{when(m.at, t)} · {m.method} <span className="fn-data">{m.ref}</span> · {accName(F, m.account)}</span>
                    <span className="ix-pitem__tags"><button type="button" className="ix-btn ix-btn--sm" onClick={() => setSheet({ kind: 'pay', preset: m })}>Match to a bill</button></span>
                  </div></li>
                ))}
              </ul>
              <div className="ix-table-wrap">
                <table className="ix-table ix-table--static">
                  <caption className="sr-only">Money received, not on a bill yet</caption>
                  <thead><tr><th scope="col">Received</th><th scope="col">From</th><th scope="col">Method · reference</th><th scope="col">Into</th><th scope="col">Store</th><th scope="col" className="ix-num">Amount</th><th scope="col"><span className="sr-only">Action</span></th></tr></thead>
                  <tbody>
                    {d.open.map(row).map(({ m, owes }) => (
                      <tr key={m.id}>
                        <td className="ix-nowrap ix-muted">{when(m.at, t)}</td>
                        <td><span className="fn-name"><b>{m.payer}</b>{m.note ? <small>{m.note}</small> : null}</span></td>
                        <td className="ix-nowrap">{m.method} · <span className="fn-data">{m.ref || '—'}</span></td>
                        <td className="ix-nowrap ix-muted">{accName(F, m.account)}</td>
                        <td>{m.shopId ? <span className="fn-name"><Link href={'/admin/merchant?id=' + m.shopId}>{storeName(db, m.shopId)}</Link><small>{owes ? `owes ${money(owes)}` : 'owes nothing now'}</small></span> : <span className="ix-muted">Not known</span>}</td>
                        <td className="ix-num"><span className="fn-fig">{money(m.amount)}</span></td>
                        <td className="ix-nowrap" style={{ textAlign: 'right' }}><button type="button" className="ix-btn ix-btn--sm" onClick={() => setSheet({ kind: 'pay', preset: m })}>Match to a bill</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <div className="ix-foot"><span className="fn-tfoot"><span>{plural(d.open.length, 'payment')} to match</span>{d.open.length ? <span>Total <b>{money(d.open.reduce((a, m) => a + m.amount, 0))}</b></span> : null}{d.matched.length ? <span>Matched so far <b>{d.matched.length}</b></span> : null}</span></div>
        </>
      );
    } else if (tab === 'refunds') {
      const filters = [{ key: 'rf', label: 'Status', all: 'All refunds', value: f.rf, options: RF_VIEWS.slice(1), onChange: setFilter('rf') }];
      const open = (r) => openSheet({ kind: 'refund', id: r.id });
      list = (
        <>
          <div className="fn-filters"><FilterBar label="Filter refunds" filters={filters} search={{ value: q, onChange: setQ, placeholder: 'Search refund, store or reason' }} onClear={() => setQ('')}
            right={<button type="button" className="ix-btn" onClick={() => setSheet({ kind: 'newRefund' })}><Icon name="undo-2" width="16" height="16" aria-hidden="true" /><span>Refund a store</span></button>} /></div>
          {!rfRows.length ? (
            <div className="ix-empty"><EmptyState icon="undo-2" title={f.rf || s ? 'No refunds match.' : 'No refunds yet.'} actionLabel="Refund a store" onAction={() => setSheet({ kind: 'newRefund' })} /></div>
          ) : (
            <>
              <ul className="ix-plist" aria-label="Refunds">
                {rfRows.map((r) => (
                  <li key={r.id}><button type="button" className="ix-pitem" onClick={() => open(r)}>
                    <span className="ix-pitem__top"><b>{storeName(db, r.shopId)}</b><span className="fn-fig">{money(r.amount)}</span></span>
                    <span className="ix-pitem__mid"><span className="fn-data">{r.id}</span> · {r.reason} · {r.method}</span>
                    <span className="ix-pitem__tags"><RefundBadge status={r.status} /></span>
                  </button></li>
                ))}
              </ul>
              <div className="ix-table-wrap">
                <table className="ix-table">
                  <caption className="sr-only">Refunds to stores</caption>
                  <thead><tr><th scope="col">Refund</th><th scope="col">Store</th><th scope="col">Reason</th><th scope="col">By</th><th scope="col">Asked</th><th scope="col">Status</th><th scope="col" className="ix-num">Amount</th></tr></thead>
                  <tbody>
                    {rfRows.map((r) => (
                      <tr key={r.id} tabIndex={0} onClick={rowGo(() => open(r))} onKeyDown={rowKey(() => open(r))}>
                        <td className="ix-nowrap"><span className="ix-id ix-strong">{r.id}</span></td>
                        <td><span className="fn-name"><Link href={'/admin/merchant?id=' + r.shopId}>{storeName(db, r.shopId)}</Link><small>#{r.shopId}</small></span></td>
                        <td><span className="fn-name"><span>{r.reason}</span><small>{r.method} · {accName(F, r.account)}</small></span></td>
                        <td className="ix-nowrap ix-muted">{r.requestedBy}</td>
                        <td className="ix-nowrap ix-muted">{when(r.requestedAt, t)}</td>
                        <td><RefundBadge status={r.status} /></td>
                        <td className="ix-num"><span className="fn-fig">{money(r.amount)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <div className="ix-foot"><span className="fn-tfoot"><span>{plural(rfRows.length, 'refund')}</span><span>Sent this month <b>{money(d.refunded)}</b></span><span>To send <b>{money(F.refunds.filter((r) => r.status === 'approved').reduce((a, r) => a + r.amount, 0))}</b></span></span></div>
        </>
      );
    } else {
      list = (
        <>
          <div className="ix-bar" style={{ justifyContent: 'space-between' }}>
            <span className="ix-muted" style={{ fontSize: 'var(--text-xs)' }}>Credit notes take money off a bill. They are asked for and approved on Credits & adjustments.</span>
            <Link href="/admin/credits?tab=notes" className="ix-btn ix-btn--sm">Credits & adjustments</Link>
          </div>
          {!d.notes.length ? <div className="ix-empty"><EmptyState icon="file-minus" title="No credit notes yet." actionLabel="Open Credits & adjustments" onAction={() => { window.location.href = '/admin/credits'; }} /></div> : (
            <>
              <ul className="ix-plist" aria-label="Credit notes">
                {d.notes.map((c) => (
                  <li key={c.id}><Link href={'/admin/invoices/view?id=' + encodeURIComponent(c.invoiceId)} className="ix-pitem">
                    <span className="ix-pitem__top"><b>{storeName(db, c.shopId)}</b><span className="fn-fig">−{money(c.amount)}</span></span>
                    <span className="ix-pitem__mid"><span className="fn-data">{c.id}</span> · {REASON_LABEL[c.reason] || c.reason} · {dmy(c.at)}</span>
                  </Link></li>
                ))}
              </ul>
              <div className="ix-table-wrap">
                <table className="ix-table ix-table--static">
                  <caption className="sr-only">Credit notes</caption>
                  <thead><tr><th scope="col">Credit note</th><th scope="col">Store</th><th scope="col">Bill</th><th scope="col">Reason</th><th scope="col">Date</th><th scope="col">By</th><th scope="col" className="ix-num">Amount</th></tr></thead>
                  <tbody>
                    {d.notes.map((c) => (
                      <tr key={c.id}>
                        <td className="ix-nowrap"><span className="ix-id ix-strong">{c.id}</span></td>
                        <td><Link href={'/admin/merchant?id=' + c.shopId}>{storeName(db, c.shopId)}</Link></td>
                        <td className="ix-nowrap"><Link href={'/admin/invoices/view?id=' + encodeURIComponent(c.invoiceId)} className="ix-id">{c.invoiceId}</Link></td>
                        <td>{REASON_LABEL[c.reason] || c.reason}</td>
                        <td className="ix-nowrap ix-muted">{dmy(c.at)}</td>
                        <td className="ix-nowrap ix-muted">{c.by}</td>
                        <td className="ix-num"><span className="fn-fig">−{money(c.amount)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <div className="ix-foot"><span className="fn-tfoot"><span>{plural(d.notes.length, 'credit note')}</span><span>Total <b>{money(d.notes.reduce((a, c) => a + c.amount, 0))}</b></span></span></div>
        </>
      );
    }
    body = (
      <>
        <MetricStrip label="This month" items={[
          { label: 'Received this month', value: money(d.received), sub: plural(d.thisM.length, 'payment') },
          { label: 'Last month', value: money(d.lastReceived), sub: plural(d.lastM.length, 'payment'), icon: 'calendar' },
          { label: 'Paid from the panel', value: d.thisM.length ? Math.round((d.panel / d.thisM.length) * 100) + '%' : '—', sub: d.auto ? `${d.auto} by auto-charge` : 'this month', icon: 'monitor-smartphone' },
          { label: 'Refunded this month', value: money(d.refunded), sub: null, icon: 'undo-2' },
        ]} />
        <section className="ix-card" aria-label="Payments">
          <div className="ix-bar"><IndexTabs tabs={tabs} label="Payment views" /></div>
          {list}
        </section>
      </>
    );
  }

  const sheetEl = (() => {
    if (!sheet || !d) return null;
    if (sheet.kind === 'pay') return <PaySheet db={db} F={F} t={t} bal={d.bal} preset={sheet.preset || null} close={closeSheet} />;
    if (sheet.kind === 'received') return <ReceivedSheet db={db} F={F} t={t} bal={d.bal} close={closeSheet} />;
    if (sheet.kind === 'newRefund') return <NewRefundSheet db={db} F={F} bal={d.bal} close={closeSheet} />;
    if (sheet.kind === 'refund') { const r = F.refunds.find((x) => x.id === sheet.id); return r ? <RefundSheet key={r.id + r.status} db={db} F={F} t={t} r={r} close={closeSheet} /> : null; }
    if (sheet.kind === 'payment') { const p = db.payments.find((x) => x.id === sheet.id); return p ? <PaymentSheet db={db} F={F} p={p} close={closeSheet} /> : null; }
    return null;
  })();

  return (
    <AdminShell active="payments" title="Payments">
      <style dangerouslySetInnerHTML={{ __html: FIN_CSS }} />
      <div className="ix-page">
        {header}
        {body}
      </div>
      {sheetEl}
    </AdminShell>
  );
}
