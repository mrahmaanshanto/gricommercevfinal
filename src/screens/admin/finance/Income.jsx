'use client';
// Income (/admin/income) — money GridCommerce earns from services outside the subscription (onboarding, migration,
// training, design, development, hardware, consultancy …). Laid out like the other Finance lists: key figures that the
// tabs don't repeat, then one card with the views as tabs (All · Received · Due · Void · Services; counts on the tabs,
// amounts in the card's foot), filters (service, category, customer type, month), search and CSV.
//   Record income   side panel: service (fills price, unit, VAT) or Other, quantity, price, discount, VAT worked out,
//                   customer (a store, a lead or someone else), paid now (account, method, transaction ID — used once —
//                   amount, part payment allowed) or due later (due date), note, attachment name → recordIncome
//   A record        lines, payments, Record payment (addIncomePayment), Void (a reason; not by the person who recorded
//                   it → voidIncome), print a service invoice or a money receipt on the letterhead, history
//   Services        the catalogue: add / edit (a new price goes into the price history) / switch off
// Data: lib/admin/finance (services, income). ?tab= ?id= ?new=1&store=0031&service=SV-03 are read after mount.

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { EmptyState, StatusBadge } from '@/components/ui';
import { FilterBar } from '@/components/ui/FilterBar';
import { ShopHeader, IndexTabs, Pager, MetricStrip, KV } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { printNode } from '@/lib/printNode';
import { startOfMonth, addMonths, periodOf, dmhm } from '@/lib/platform/util';
import { staff } from '@/lib/platform/store';
import {
  SERVICE_CATEGORIES, UNITS, unitLabel, INCOME_CATS, incomeCatLabel, INCOME_METHODS, TX_METHODS, METHOD_TO_ACCOUNT, CUSTOMER_TYPES, COMPANY,
  serviceBy, incomeBy, incomeState, customerLabel, lineTotals, recordIncome, addIncomePayment, voidIncome, addService, updateService,
  setServiceActive, ledger, balances, storeName, periodLabel,
} from '@/lib/admin/finance';
import { AdminShell } from '../AdminShell';
import {
  FIN_CSS, PRINT_CSS, useFinance, money, plural, when, dmy, readParams, setParams, rowGo, rowKey, Field, ctl, errOf, FormSheet, AccountSelect,
  accName, Skeleton, ErrorCard, DetailSheet, useErr, dateInput, fromDateInput, Letterhead, SignOff,
} from './finShared';

const PAGE = 20;
const TABS = [['all', 'All'], ['received', 'Received'], ['due', 'Due'], ['void', 'Void'], ['services', 'Services']];
const NO_FILTERS = { svc: '', cat: '', ctype: '', month: '' };
const CSS = `
.in-seg{display:inline-flex;padding:3px;gap:2px;border-radius:var(--radius-full);background:var(--surface-subtle);border:1px solid var(--border-subtle);max-width:100%;overflow-x:auto}
.in-seg button{flex:none;height:30px;padding:0 var(--space-3);border:0;border-radius:var(--radius-full);background:none;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.in-seg button[aria-pressed="true"]{background:var(--surface-card);color:var(--text-heading);box-shadow:var(--shadow-xs)}
.in-lines{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.in-lines th{padding:6px 0;border-bottom:1px solid var(--border-subtle);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:left}
.in-lines td{padding:6px 0;border-bottom:1px solid var(--border-subtle);color:var(--text-body);vertical-align:top}
.in-lines .ix-num{text-align:right;font-family:var(--font-data);font-variant-numeric:tabular-nums;white-space:nowrap}
.in-lines tfoot td{border-bottom:0;padding-top:4px}
.in-lines tfoot tr:last-child td{font-weight:var(--weight-semibold);color:var(--text-heading)}
.in-off{opacity:.6}
.in-print{display:none}
.in-doc{display:flex;flex-direction:column;gap:var(--space-4);font-size:var(--text-sm);color:var(--text-body)}
.in-doc h3{margin:0 0 4px;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted)}
.in-doc__to{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)}
.in-doc__paid{padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
@media (max-width:640px){.in-seg button{height:36px}}
`;

const qtyText = (r) => (r.unit === 'hour' ? plural(r.qty, 'hour') : r.unit === 'session' ? plural(r.qty, 'session') : r.unit === 'month' ? plural(r.qty, 'month') : r.unit === 'item' ? `${r.qty} × lot` : String(r.qty));
const IncBadge = ({ st }) => <StatusBadge tone={st.tone}>{st.label}</StatusBadge>;
const intoText = (F, r) => [...new Set(r.payments.map((p) => accName(F, p.account)))].join(', ') || '—';

// ---- record income -------------------------------------------------------------------------------------------------
function IncomeForm({ db, F, t, bal, preset, close, onDone }) {
  const active = F.services.filter((s) => s.active);
  const sv0 = preset && preset.service ? serviceBy(F, preset.service) : null;
  const shop0 = preset && preset.store && db.shops.some((s) => s.id === preset.store) ? preset.store : '';
  const [f, setF] = useState({
    serviceId: sv0 ? sv0.id : '', serviceName: '', description: '', qty: '1', unitPrice: sv0 ? String(sv0.price) : '', discount: '', vatPct: sv0 ? String(sv0.vat) : '15',
    ctype: 'store', shopId: shop0, storeQ: '', leadName: '', leadId: '', otherName: '', otherPhone: '',
    date: dateInput(t), mode: 'now', payAmount: '', method: 'bKash', account: 'bkash', txId: '', dueDate: dateInput(t + 7 * 864e5), note: '', attachment: '',
  });
  const [err, setErr] = useErr();
  const set = (k) => (e) => { setErr(null); setF({ ...f, [k]: e.target.value }); };
  const pickService = (e) => {
    setErr(null);
    const id = e.target.value;
    const sv = serviceBy(F, id);
    setF({ ...f, serviceId: id, unitPrice: sv ? String(sv.price) : f.unitPrice, vatPct: sv ? String(sv.vat) : f.vatPct });
  };
  const sv = serviceBy(F, f.serviceId);
  const tot = lineTotals(f.qty, f.unitPrice, f.discount, f.vatPct === '' ? 0 : f.vatPct);
  const sq = f.storeQ.trim().toLowerCase();
  const stores = db.shops.filter((s) => s.status !== 'setup' || s.id === f.shopId).filter((s) => !sq || s.id === f.shopId || `${s.name} ${s.id} #${s.id}`.toLowerCase().includes(sq)).sort((a, b) => a.name.localeCompare(b.name));
  const payAmount = f.payAmount === '' ? tot.total : Number(f.payAmount);
  const submit = () => {
    const r = recordIncome({
      serviceId: f.serviceId, serviceName: f.serviceName, description: f.description, qty: f.qty, unitPrice: f.unitPrice, discount: f.discount, vatPct: f.vatPct,
      customer: f.ctype === 'store' ? { type: 'store', shopId: f.shopId } : f.ctype === 'lead' ? { type: 'lead', name: f.leadName, leadId: f.leadId } : { type: 'other', name: f.otherName, phone: f.otherPhone },
      at: f.date === dateInput(t) ? t : fromDateInput(f.date, 12),
      pay: f.mode === 'now' ? { amount: payAmount, account: f.account, method: f.method, txId: f.txId } : null,
      dueAt: fromDateInput(f.dueDate, 23, 0), note: f.note, attachment: f.attachment,
    });
    if (!r.ok) { setErr(r); return; }
    const st = incomeState(r.income, t);
    toast(`${r.income.invNo} recorded · ${st.key === 'received' ? money(r.income.total) + ' received' : money(st.balance) + ' still due'}`);
    close();
    if (onDone) onDone(r.income.id);
  };
  const partly = f.mode === 'now' && tot.total && payAmount < tot.total;
  return (
    <FormSheet id="fn-inc" title="Record income" close={close} onSubmit={submit} submit={f.mode === 'now' ? 'Record income' : 'Record, payment due'} err={err}>
      <Field id="in-s" label="Service" error={errOf(err, 'service')}>
        <select id="in-s" {...ctl(errOf(err, 'service'), true)} value={f.serviceId} onChange={pickService}>
          <option value="">Pick a service</option>
          {SERVICE_CATEGORIES.map((c) => {
            const list = active.filter((s) => s.category === c);
            return list.length ? <optgroup key={c} label={c}>{list.map((s) => <option key={s.id} value={s.id}>{s.name} · {money(s.price)} {unitLabel(s.unit).toLowerCase()}</option>)}</optgroup> : null;
          })}
          <option value="other">Other (type it)</option>
        </select>
      </Field>
      {f.serviceId === 'other' ? <Field id="in-sn" label="What was done" error={errOf(err, 'service')}><input id="in-sn" {...ctl(errOf(err, 'service'))} value={f.serviceName} onChange={set('serviceName')} /></Field> : null}
      <Field id="in-d" label="Description (optional)" hint={sv ? sv.description : null}><input id="in-d" {...ctl(null)} value={f.description} onChange={set('description')} /></Field>
      <div className="fn-form__two">
        <Field id="in-q" label={sv ? `Quantity (${unitLabel(sv.unit).toLowerCase()})` : 'Quantity'} error={errOf(err, 'qty')}><input id="in-q" type="number" inputMode="decimal" min="0" step="0.5" {...ctl(errOf(err, 'qty'))} value={f.qty} onChange={set('qty')} /></Field>
        <Field id="in-p" label="Price (৳)" error={errOf(err, 'unitPrice')}><input id="in-p" type="number" inputMode="numeric" min="1" {...ctl(errOf(err, 'unitPrice'))} value={f.unitPrice} onChange={set('unitPrice')} /></Field>
      </div>
      <div className="fn-form__two">
        <Field id="in-ds" label="Discount (৳)" error={errOf(err, 'discount')}><input id="in-ds" type="number" inputMode="numeric" min="0" {...ctl(errOf(err, 'discount'))} value={f.discount} onChange={set('discount')} /></Field>
        <Field id="in-v" label="VAT %" error={errOf(err, 'vatPct')} hint={tot.vat ? `VAT ${money(tot.vat)}` : null}><input id="in-v" type="number" inputMode="decimal" min="0" max="100" {...ctl(errOf(err, 'vatPct'))} value={f.vatPct} onChange={set('vatPct')} /></Field>
      </div>
      <p className="fn-note">Total <b className="fn-data">{money(tot.total)}</b>{tot.discount ? ` after ${money(tot.discount)} off` : ''}{tot.vat ? `, with ${money(tot.vat)} VAT` : ''}.</p>

      <Field id="in-ct" label="Customer" error={errOf(err, 'customer')}>
        <span className="in-seg" role="group" aria-label="Customer type">
          {CUSTOMER_TYPES.map(([k, l]) => <button key={k} type="button" aria-pressed={f.ctype === k} onClick={() => { setErr(null); setF({ ...f, ctype: k }); }}>{l}</button>)}
        </span>
      </Field>
      {f.ctype === 'store' ? (
        <div className="fn-form__two">
          <Field id="in-sq" label="Find a store"><input id="in-sq" type="search" {...ctl(null)} placeholder="Name or ID" value={f.storeQ} onChange={set('storeQ')} /></Field>
          <Field id="in-st" label="Store" error={errOf(err, 'customer')}>
            <select id="in-st" {...ctl(errOf(err, 'customer'), true)} value={f.shopId} onChange={set('shopId')}>
              <option value="">{stores.length ? 'Pick the store' : 'No store matches'}</option>
              {stores.map((s) => <option key={s.id} value={s.id}>{s.name} · #{s.id}</option>)}
            </select>
          </Field>
        </div>
      ) : f.ctype === 'lead' ? (
        <div className="fn-form__two">
          <Field id="in-ln" label="Lead’s name" error={errOf(err, 'customer')}><input id="in-ln" {...ctl(errOf(err, 'customer'))} value={f.leadName} onChange={set('leadName')} /></Field>
          <Field id="in-li" label="Lead ID (optional)" error={errOf(err, 'leadId')}><input id="in-li" className={ctl(errOf(err, 'leadId')).className + ' fn-data'} placeholder="L-1120" value={f.leadId} onChange={set('leadId')} /></Field>
        </div>
      ) : (
        <div className="fn-form__two">
          <Field id="in-on" label="Name" error={errOf(err, 'customer')}><input id="in-on" {...ctl(errOf(err, 'customer'))} value={f.otherName} onChange={set('otherName')} /></Field>
          <Field id="in-op" label="Phone"><input id="in-op" type="tel" {...ctl(null)} value={f.otherPhone} onChange={set('otherPhone')} /></Field>
        </div>
      )}
      <Field id="in-dt" label="Date of the work"><input id="in-dt" type="date" max={dateInput(t)} {...ctl(null)} value={f.date} onChange={set('date')} /></Field>

      <Field id="in-m" label="Payment">
        <span className="in-seg" role="group" aria-label="Payment">
          <button type="button" aria-pressed={f.mode === 'now'} onClick={() => setF({ ...f, mode: 'now' })}>Paid now</button>
          <button type="button" aria-pressed={f.mode === 'later'} onClick={() => setF({ ...f, mode: 'later' })}>Due later</button>
        </span>
      </Field>
      {f.mode === 'now' ? (
        <>
          <div className="fn-form__two">
            <Field id="in-pa" label="Amount received (৳)" error={errOf(err, 'payAmount')} hint={partly ? `${money(tot.total - payAmount)} stays due` : null}>
              <input id="in-pa" type="number" inputMode="numeric" min="1" {...ctl(errOf(err, 'payAmount'))} placeholder={String(tot.total || '')} value={f.payAmount} onChange={set('payAmount')} />
            </Field>
            <Field id="in-pm" label="Method" error={errOf(err, 'method')}>
              <select id="in-pm" {...ctl(null, true)} value={f.method} onChange={(e) => { setErr(null); setF({ ...f, method: e.target.value, account: METHOD_TO_ACCOUNT[e.target.value] || f.account }); }}>{INCOME_METHODS.map((m) => <option key={m}>{m}</option>)}</select>
            </Field>
          </div>
          <div className="fn-form__two">
            <AccountSelect id="in-acc" label="Went into" F={F} bal={bal} value={f.account} onChange={(v) => { setErr(null); setF({ ...f, account: v }); }} error={errOf(err, 'account')} />
            <Field id="in-tx" label={TX_METHODS.includes(f.method) ? 'Transaction ID' : 'Transaction ID (optional)'} error={errOf(err, 'txId')}>
              <input id="in-tx" className={ctl(errOf(err, 'txId')).className + ' fn-data'} autoComplete="off" spellCheck={false} value={f.txId} onChange={set('txId')} />
            </Field>
          </div>
          {partly ? <Field id="in-dd" label="Rest due by" error={errOf(err, 'dueAt')}><input id="in-dd" type="date" min={f.date} {...ctl(errOf(err, 'dueAt'))} value={f.dueDate} onChange={set('dueDate')} /></Field> : null}
        </>
      ) : (
        <Field id="in-dd2" label="Due by" error={errOf(err, 'dueAt')}><input id="in-dd2" type="date" min={f.date} {...ctl(errOf(err, 'dueAt'))} value={f.dueDate} onChange={set('dueDate')} /></Field>
      )}
      <Field id="in-at" label="Attachment" hint="The file name of the work order, quote or slip (the demo keeps the name only)."><input id="in-at" {...ctl(null)} placeholder="work-order.pdf" value={f.attachment} onChange={set('attachment')} /></Field>
      <Field id="in-n" label="Note (optional)"><textarea id="in-n" rows={2} {...ctl(null)} value={f.note} onChange={set('note')} /></Field>
    </FormSheet>
  );
}

// ---- the printed service invoice / money receipt -----------------------------------------------------------------------
function PrintDoc({ F, r, t, kind }) {
  const st = incomeState(r, t);
  const receipt = kind === 'receipt';
  const c = r.customer;
  return (
    <div className="in-doc">
      <Letterhead kind={receipt ? 'Money receipt' : 'Service invoice'} title={r.invNo} meta={[['Date', dmy(r.at)], ...(r.dueAt && !receipt ? [['Due by', dmy(r.dueAt)]] : []), ['Status', st.label], ['Reference', r.id]]} />
      <div className="in-doc__to">
        <div><h3>{receipt ? 'Received from' : 'Bill to'}</h3><b>{c.name}</b>{c.type === 'store' ? <div>Store #{c.shopId}</div> : null}{c.type === 'lead' && c.leadId ? <div>Lead {c.leadId}</div> : null}{c.phone ? <div>{c.phone}</div> : null}</div>
        <div><h3>From</h3><b>{COMPANY.name}</b><div>{COMPANY.address}</div><div>BIN {COMPANY.bin}</div></div>
      </div>
      <Lines r={r} />
      {r.payments.length ? (
        <div className="in-doc__paid">
          <h3>Payments received</h3>
          {r.payments.map((p) => <div key={p.id}>{dmy(p.at)} · {money(p.amount)} by {p.method}{p.txId ? ` · ${p.txId}` : ''} · into {accName(F, p.account)}</div>)}
          <div><b>{st.balance ? `${money(st.balance)} still to pay` : 'Paid in full. Thank you.'}</b></div>
        </div>
      ) : null}
      <SignOff when={dmhm(t)} />
    </div>
  );
}
function Lines({ r }) {
  const gross = Math.round(r.qty * r.unitPrice);
  return (
    <table className="in-lines">
      <thead><tr><th scope="col">Service</th><th scope="col" className="ix-num">Quantity</th><th scope="col" className="ix-num">Price</th><th scope="col" className="ix-num">Amount</th></tr></thead>
      <tbody><tr><td>{r.serviceName}{r.description ? <div className="fn-muted" style={{ fontSize: 'var(--text-xs)' }}>{r.description}</div> : null}</td><td className="ix-num">{qtyText(r)}</td><td className="ix-num">{money(r.unitPrice)}</td><td className="ix-num">{money(gross)}</td></tr></tbody>
      <tfoot>
        {r.discount ? <tr><td colSpan={3}>Discount</td><td className="ix-num">−{money(r.discount)}</td></tr> : null}
        <tr><td colSpan={3}>VAT {r.vatPct}%</td><td className="ix-num">{money(r.vat)}</td></tr>
        <tr><td colSpan={3}>Total</td><td className="ix-num">{money(r.total)}</td></tr>
      </tfoot>
    </table>
  );
}

// ---- one record --------------------------------------------------------------------------------------------------------
function IncomeSheet({ db, F, t, bal, r, close }) {
  const me = staff();
  const st = incomeState(r, t);
  const [mode, setMode] = useState('');   // '' · 'pay' · 'void'
  const [p, setP] = useState({ amount: String(st.balance), method: 'bKash', account: 'bkash', txId: '' });
  const [why, setWhy] = useState('');
  const [err, setErr] = useErr();
  const doc = useRef(null);
  const [kind, setKind] = useState('invoice');
  const canVoid = me && (me.role === 'admin' || me.role === 'finance') && me.name !== r.createdBy;
  const run = (fn, done) => { const x = fn(); if (!x.ok) { setErr(x); return; } toast(done); setMode(''); setErr(null); };
  const print = (k) => { setKind(k); setTimeout(() => printNode(doc.current, { title: `${COMPANY.name} - ${k === 'receipt' ? 'Money receipt' : 'Service invoice'} ${r.invNo}`, css: PRINT_CSS }), 0); };
  let footer;
  if (mode === 'pay') footer = <><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setMode('')}>Back</button><button type="button" className="gc-btn gc-btn--solid" onClick={() => run(() => addIncomePayment(r.id, { ...p, amount: p.amount }), `${money(Number(p.amount) || 0)} recorded on ${r.invNo}`)}>Record payment</button></>;
  else if (mode === 'void') footer = <><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setMode('')}>Back</button><button type="button" className="gc-btn gc-btn--error gc-btn--solid" onClick={() => run(() => voidIncome(r.id, why), `${r.invNo} voided`)}>Void income</button></>;
  else {
    footer = (
      <>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={() => print(st.paid ? 'receipt' : 'invoice')}><Icon name="printer" width="16" height="16" aria-hidden="true" />{st.paid ? 'Print receipt' : 'Print invoice'}</button>
        {st.paid && st.key !== 'void' ? <button type="button" className="gc-btn gc-btn--neutral" onClick={() => print('invoice')}>Print invoice</button> : null}
        {st.balance ? <button type="button" className="gc-btn gc-btn--solid" onClick={() => setMode('pay')}>Record payment</button> : null}
      </>
    );
  }
  const c = r.customer;
  return (
    <DetailSheet title={`${r.invNo} · ${r.serviceName}`} close={close} footer={footer}>
      <div className="fn-sheet__big"><span><IncBadge st={st} /></span><b>{money(r.total)}</b></div>
      <KV rows={[
        ['Customer', c.type === 'store' ? <Link key="c" href={'/admin/merchant?id=' + c.shopId}>{storeName(db, c.shopId)} · #{c.shopId}</Link> : customerLabel(r)],
        c.phone ? ['Phone', <a key="p" href={'tel:' + c.phone.replace(/[^0-9+]/g, '')}>{c.phone}</a>] : null,
        ['Date', dmy(r.at)],
        ['Category', `${r.category} · ${incomeCatLabel(r.incomeCat)}`],
        st.balance ? ['Due by', <span key="d" className={st.overdue ? 'fn-bad' : ''}>{r.dueAt ? dmy(r.dueAt) : '—'}</span>] : null,
        ['Received', money(st.paid)],
        st.balance ? ['Still to pay', <b key="b" className="fn-data">{money(st.balance)}</b>] : null,
        ['Recorded by', r.createdBy],
        r.attachments.length ? ['Attachment', <span key="a" className="fn-attach"><Icon name="paperclip" width="14" height="14" aria-hidden="true" />{r.attachments.join(', ')}</span>] : null,
      ]} />
      <Lines r={r} />
      {r.note ? <p className="fn-note">{r.note}</p> : null}
      <div>
        <h3>Payments</h3>
        {r.payments.length ? (
          <div className="fn-rows">{r.payments.map((x) => <div key={x.id} className="fn-row"><span>{dmy(x.at)} · {x.method}{x.txId ? <> · <span className="fn-data">{x.txId}</span></> : null} · {accName(F, x.account)}</span><b>{money(x.amount)}</b></div>)}</div>
        ) : <p className="fn-empty">Nothing received yet.</p>}
      </div>
      {r.voided ? <p className="fn-note">Voided by {r.voided.by} on {dmy(r.voided.at)}: {r.voided.reason}. Its payments no longer count in the accounts.</p> : null}
      <div>
        <h3>History</h3>
        <ul className="fn-trail">{r.history.map((h, i) => <li key={i}><time>{dmy(h.at)}</time><span>{h.text} · {h.by}</span></li>)}</ul>
      </div>
      {mode === 'pay' ? (
        <>
          <div className="fn-form__two">
            <Field id="ip-a" label="Amount (৳)" error={errOf(err, 'payAmount')}><input id="ip-a" type="number" inputMode="numeric" min="1" {...ctl(errOf(err, 'payAmount'))} value={p.amount} onChange={(e) => { setErr(null); setP({ ...p, amount: e.target.value }); }} /></Field>
            <Field id="ip-m" label="Method"><select id="ip-m" {...ctl(null, true)} value={p.method} onChange={(e) => { setErr(null); setP({ ...p, method: e.target.value, account: METHOD_TO_ACCOUNT[e.target.value] || p.account }); }}>{INCOME_METHODS.map((m) => <option key={m}>{m}</option>)}</select></Field>
          </div>
          <AccountSelect id="ip-acc" label="Went into" F={F} bal={bal} value={p.account} onChange={(v) => { setErr(null); setP({ ...p, account: v }); }} error={errOf(err, 'account')} />
          <Field id="ip-t" label={TX_METHODS.includes(p.method) ? 'Transaction ID' : 'Transaction ID (optional)'} error={errOf(err, 'txId')}>
            <input id="ip-t" className={ctl(errOf(err, 'txId')).className + ' fn-data'} autoComplete="off" spellCheck={false} value={p.txId} onChange={(e) => { setErr(null); setP({ ...p, txId: e.target.value }); }} />
          </Field>
        </>
      ) : null}
      {mode === 'void' ? (
        <Field id="iv-w" label="Why it is voided" error={errOf(err, 'reason')} hint="For an entry made in error. Money really given back is a refund.">
          <textarea id="iv-w" rows={2} {...ctl(errOf(err, 'reason'))} value={why} onChange={(e) => { setErr(null); setWhy(e.target.value); }} />
        </Field>
      ) : null}
      {!r.voided && !mode ? (
        canVoid
          ? <button type="button" className="gc-btn gc-btn--flat gc-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => setMode('void')}>Void this record</button>
          : <p className="fn-muted" style={{ margin: 0, fontSize: 'var(--text-xs)' }}>{me && me.name === r.createdBy ? 'You recorded this, so someone else in finance can void it.' : 'Only finance or an admin can void income.'}</p>
      ) : null}
      {err && err.error && !err.field ? <p className="fn-formerr" role="alert">{err.error}</p> : null}
      <div className="in-print" aria-hidden="true"><div ref={doc}><PrintDoc F={F} r={r} t={t} kind={kind} /></div></div>
    </DetailSheet>
  );
}

// ---- the catalogue ---------------------------------------------------------------------------------------------------------
function ServiceForm({ F, sv, close }) {
  const [f, setF] = useState(sv ? { name: sv.name, category: sv.category, price: String(sv.price), unit: sv.unit, vat: String(sv.vat), incomeCat: sv.incomeCat, description: sv.description, priceNote: '' }
    : { name: '', category: '', price: '', unit: 'oneoff', vat: '15', incomeCat: 'services', description: '', priceNote: '' });
  const [err, setErr] = useErr();
  const set = (k) => (e) => { setErr(null); setF({ ...f, [k]: e.target.value }); };
  const submit = () => {
    const r = sv ? updateService(sv.id, f) : addService(f);
    if (!r.ok) { setErr(r); return; }
    toast(sv ? `${r.service.name} saved` : `${r.service.name} added`);
    close();
  };
  const toggle = () => { const r = setServiceActive(sv.id, !sv.active); if (r.ok) { toast(r.service.active ? `${sv.name} is on` : `${sv.name} is off · not offered when recording income`); close(); } };
  const changed = sv && Number(f.price) !== sv.price;
  return (
    <FormSheet id="fn-svc" title={sv ? sv.name : 'Add service'} close={close} onSubmit={submit} submit={sv ? 'Save' : 'Add service'} err={err}
      extra={sv ? <button type="button" className="gc-btn gc-btn--neutral" onClick={toggle}>{sv.active ? 'Switch off' : 'Switch on'}</button> : null}>
      <Field id="sv-n" label="Name" error={errOf(err, 'name')}><input id="sv-n" {...ctl(errOf(err, 'name'))} value={f.name} onChange={set('name')} /></Field>
      <div className="fn-form__two">
        <Field id="sv-c" label="Category" error={errOf(err, 'category')}>
          <select id="sv-c" {...ctl(errOf(err, 'category'), true)} value={f.category} onChange={set('category')}><option value="">Pick a category</option>{SERVICE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        </Field>
        <Field id="sv-ic" label="In the books as"><select id="sv-ic" {...ctl(null, true)} value={f.incomeCat} onChange={set('incomeCat')}>{INCOME_CATS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
      </div>
      <div className="fn-form__two">
        <Field id="sv-p" label="Price (৳)" error={errOf(err, 'price')}><input id="sv-p" type="number" inputMode="numeric" min="1" {...ctl(errOf(err, 'price'))} value={f.price} onChange={set('price')} /></Field>
        <Field id="sv-u" label="Unit"><select id="sv-u" {...ctl(null, true)} value={f.unit} onChange={set('unit')}>{UNITS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
      </div>
      <Field id="sv-v" label="VAT %" error={errOf(err, 'vat')}><input id="sv-v" type="number" inputMode="decimal" min="0" max="100" {...ctl(errOf(err, 'vat'))} value={f.vat} onChange={set('vat')} /></Field>
      {changed ? <Field id="sv-pn" label="Why the price changes (optional)" hint="Records already made keep the price they were sold at."><input id="sv-pn" {...ctl(null)} value={f.priceNote} onChange={set('priceNote')} /></Field> : null}
      <Field id="sv-d" label="Description"><textarea id="sv-d" rows={2} {...ctl(null)} value={f.description} onChange={set('description')} /></Field>
      {sv ? (
        <div>
          <h3 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-muted)' }}>Price history</h3>
          <ul className="fn-trail">{[...sv.history].reverse().map((h, i) => <li key={i}><time>{dmy(h.at)}</time><span>{money(h.price)} · {h.note} · {h.by}</span></li>)}</ul>
        </div>
      ) : null}
    </FormSheet>
  );
}

// ---- the page ----------------------------------------------------------------------------------------------------------------
export default function Income() {
  const { db, F, t, ready } = useFinance();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [f, setF] = useState(NO_FILTERS);
  const [page, setPage] = useState(0);
  const [sheet, setSheet] = useState(null);   // { kind: 'new' | 'rec' | 'svc' | 'newSvc', id?, preset? }

  useEffect(() => {
    const p = readParams();
    if (TABS.some(([k]) => k === p.get('tab'))) setTab(p.get('tab'));
    if (p.get('new') === '1') setSheet({ kind: 'new', preset: { store: p.get('store') || '', service: p.get('service') || '' } });
    else if (p.get('id')) setSheet({ kind: 'rec', id: p.get('id') });
  }, []);
  const go = (k) => { setTab(k); setPage(0); setF(NO_FILTERS); setQ(''); setParams({ tab: k === 'all' ? '' : k, id: '' }); };
  const setFilter = (k) => (v) => { setF((o) => ({ ...o, [k]: v })); setPage(0); };
  const openRec = (id) => { setSheet({ kind: 'rec', id }); setParams({ id }); };
  const closeSheet = () => { setSheet(null); setParams({ id: '', new: '', store: '', service: '' }); };

  let d = null, error = null;
  if (ready) {
    try {
      const rows = ledger(db, F, t);
      const bal = balances(db, F, t, t, rows);
      const m0 = startOfMonth(t), m1 = addMonths(m0, -1, 1), y0 = addMonths(m0, -11, 1);
      const all = [...F.income].sort((a, b) => b.at - a.at || b.id.localeCompare(a.id)).map((r) => ({ r, st: incomeState(r, t) }));
      const recv = (from, to) => all.reduce((s, { r }) => s + (r.voided ? 0 : r.payments.filter((p) => p.at >= from && p.at < to).reduce((a, p) => a + p.amount, 0)), 0);
      const bySvc = {};
      for (const { r } of all) if (!r.voided && r.at >= m0) bySvc[r.serviceName] = (bySvc[r.serviceName] || 0) + r.total;
      const top = Object.entries(bySvc).sort((a, b) => b[1] - a[1])[0] || null;
      const svcYear = {};
      for (const { r } of all) if (!r.voided && r.at >= y0 && r.serviceId) { const x = svcYear[r.serviceId] || (svcYear[r.serviceId] = { n: 0, v: 0 }); x.n++; x.v += r.total; }
      d = {
        bal, all, svcYear,
        thisM: recv(m0, t + 1), lastM: recv(m1, m0), lastName: periodLabel(periodOf(m1 + 3600e3)),
        due: all.reduce((s, x) => s + x.st.balance, 0), overdue: all.filter((x) => x.st.overdue).reduce((s, x) => s + x.st.balance, 0), top,
      };
    } catch (e) { error = e; }
  }
  const TAB_KEYS = { received: ['received'], due: ['due', 'partly'], void: ['void'] };
  const counts = d ? { all: d.all.length, received: 0, due: 0, void: 0, services: F.services.length } : {};
  if (d) for (const { st } of d.all) for (const [k, keys] of Object.entries(TAB_KEYS)) if (keys.includes(st.key)) counts[k]++;
  const months = d ? [...new Set(d.all.map(({ r }) => periodOf(r.at)))].sort().reverse() : [];
  const s = q.trim().toLowerCase();
  const filtered = d && tab !== 'services' ? d.all.filter(({ r, st }) => {
    if (TAB_KEYS[tab] && !TAB_KEYS[tab].includes(st.key)) return false;
    if (f.svc && (r.serviceId || 'other') !== f.svc) return false;
    if (f.cat && r.category !== f.cat) return false;
    if (f.ctype && r.customer.type !== f.ctype) return false;
    if (f.month && periodOf(r.at) !== f.month) return false;
    if (!s) return true;
    return [r.id, r.invNo, r.serviceName, r.description, r.customer.name, r.customer.shopId, r.customer.leadId, r.customer.phone, r.createdBy, ...r.payments.map((p) => p.txId)].join(' ').toLowerCase().includes(s);
  }) : [];
  const svcShown = d && tab === 'services' ? F.services.filter((x) => (!f.cat || x.category === f.cat) && (!s || `${x.name} ${x.description} ${x.id}`.toLowerCase().includes(s))) : [];
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const pg = Math.min(page, pages - 1);
  const shown = filtered.slice(pg * PAGE, pg * PAGE + PAGE);
  const sumTotal = filtered.reduce((a, { r }) => a + (r.voided ? 0 : r.total), 0);
  const sumDue = filtered.reduce((a, { st }) => a + st.balance, 0);
  const filtersOn = !!s || Object.values(f).some(Boolean);

  const exportCsv = () => {
    if (!d) return;
    if (tab === 'services') {
      downloadCsv('gridcommerce-services.csv', [['Service', 'Category', 'Price (BDT)', 'Unit', 'VAT %', 'In the books as', 'On', 'Sold, 12 months', 'Income, 12 months (BDT)'],
        ...svcShown.map((x) => [x.name, x.category, x.price, unitLabel(x.unit), x.vat, incomeCatLabel(x.incomeCat), x.active ? 'Yes' : 'No', (d.svcYear[x.id] || {}).n || 0, (d.svcYear[x.id] || {}).v || 0])]);
    } else {
      downloadCsv(`gridcommerce-income-${tab}.csv`, [['Record', 'Invoice', 'Date', 'Customer type', 'Customer', 'Store ID', 'Lead ID', 'Service', 'Category', 'Quantity', 'Price (BDT)', 'Discount (BDT)', 'VAT (BDT)', 'Total (BDT)', 'Received (BDT)', 'Due (BDT)', 'Due by', 'Status', 'Received into', 'Transaction IDs', 'Recorded by'],
        ...filtered.map(({ r, st }) => [r.id, r.invNo, dmy(r.at), r.customer.type, r.customer.name, r.customer.shopId ? '#' + r.customer.shopId : '', r.customer.leadId || '', r.serviceName, r.category, r.qty, r.unitPrice, r.discount, r.vat, r.total, st.paid, st.balance, r.dueAt ? dmy(r.dueAt) : '', st.label, intoText(F, r), r.payments.map((p) => p.txId).filter(Boolean).join(' '), r.createdBy])]);
    }
    toast('Exported');
  };

  const header = (
    <ShopHeader icon="hand-coins" title="Income"
      about="Money GridCommerce earns from services outside the subscription: onboarding and setup, data migration, training, storefront design, development by the hour, POS hardware, consultancy and catalogue work. Record what was done and for whom (a store, a lead or someone else), take the payment now or leave it due, and print a service invoice or a money receipt. Services and their prices are kept under Services; a new price never changes records already made. A record entered in error is voided by a second person in finance."
      secondary={[{ label: 'Export', icon: 'download', onClick: exportCsv }]}
      more={[{ label: 'Add service', onClick: () => setSheet({ kind: 'newSvc' }) }, { label: 'Revenue', href: '/admin/revenue' }, { label: 'Accounts', href: '/admin/accounts' }]}
      primary={{ label: 'Record income', icon: 'plus', onClick: () => setSheet({ kind: 'new', preset: null }) }} />
  );

  let body;
  if (!ready) body = <Skeleton label="Loading income" />;
  else if (error) body = <ErrorCard what="The income" />;
  else {
    const tabs = TABS.map(([k, label]) => ({ key: k, id: 'inc-tab-' + k, label, count: counts[k], on: tab === k, onClick: () => go(k) }));
    const filters = tab === 'services'
      ? [{ key: 'cat', label: 'Category', all: 'All categories', value: f.cat, options: SERVICE_CATEGORIES.map((c) => [c, c]), onChange: setFilter('cat') }]
      : [
        { key: 'svc', label: 'Service', all: 'All services', value: f.svc, options: [...F.services.map((x) => [x.id, x.name]), ['other', 'Other']], onChange: setFilter('svc') },
        { key: 'cat', label: 'Category', all: 'All categories', value: f.cat, options: SERVICE_CATEGORIES.map((c) => [c, c]), onChange: setFilter('cat') },
        { key: 'ctype', label: 'Customer', all: 'Every customer', value: f.ctype, options: CUSTOMER_TYPES, onChange: setFilter('ctype') },
        { key: 'month', label: 'Month', all: 'All months', value: f.month, options: months.map((m) => [m, periodLabel(m)]), onChange: setFilter('month') },
      ];
    let list;
    if (tab === 'services') {
      const openS = (x) => setSheet({ kind: 'svc', id: x.id });
      list = !svcShown.length ? (
        <div className="ix-empty"><EmptyState title="No services match." actionLabel="Add service" onAction={() => setSheet({ kind: 'newSvc' })} /></div>
      ) : (
        <>
          <ul className="ix-plist" aria-label="Services">
            {svcShown.map((x) => (
              <li key={x.id}><button type="button" className={'ix-pitem' + (x.active ? '' : ' in-off')} onClick={() => openS(x)}>
                <span className="ix-pitem__top"><b>{x.name}</b><span className="fn-fig">{money(x.price)}</span></span>
                <span className="ix-pitem__mid">{x.category} · {unitLabel(x.unit)} · VAT {x.vat}%{x.active ? '' : ' · off'}</span>
              </button></li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table">
              <caption className="sr-only">Services</caption>
              <thead><tr><th scope="col">Service</th><th scope="col">Category</th><th scope="col">Unit</th><th scope="col" className="ix-num">VAT</th><th scope="col" className="ix-num">Sold, 12 months</th><th scope="col">State</th><th scope="col" className="ix-num">Price</th></tr></thead>
              <tbody>
                {svcShown.map((x) => (
                  <tr key={x.id} tabIndex={0} className={x.active ? '' : 'in-off'} onClick={rowGo(() => openS(x))} onKeyDown={rowKey(() => openS(x))}>
                    <td><span className="fn-name"><b>{x.name}</b><small>{x.description}</small></span></td>
                    <td className="ix-nowrap">{x.category}</td>
                    <td className="ix-nowrap ix-muted">{unitLabel(x.unit)}</td>
                    <td className="ix-num">{x.vat}%</td>
                    <td className="ix-num"><span className="fn-fig">{(d.svcYear[x.id] || {}).n || 0}</span>{(d.svcYear[x.id] || {}).v ? <small className="ix-muted" style={{ display: 'block', fontSize: 'var(--text-xs)' }}>{money(d.svcYear[x.id].v)}</small> : null}</td>
                    <td>{x.active ? <StatusBadge tone="success">On</StatusBadge> : <StatusBadge tone="neutral">Off</StatusBadge>}</td>
                    <td className="ix-num"><span className="fn-fig">{money(x.price)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
    } else if (!filtered.length) {
      const tabLabel = (TABS.find(([k]) => k === tab) || [])[1];
      list = (
        <div className="ix-empty">
          {filtersOn
            ? <EmptyState title="No income matches these filters." actionLabel="Clear filters" onAction={() => { setQ(''); setF(NO_FILTERS); }} />
            : <EmptyState icon="hand-coins" title={tab === 'all' ? 'No income recorded yet.' : `Nothing in ${tabLabel.toLowerCase()}.`} actionLabel="Record income" onAction={() => setSheet({ kind: 'new', preset: null })} />}
        </div>
      );
    } else {
      list = (
        <>
          <ul className="ix-plist" aria-label="Income">
            {shown.map(({ r, st }) => (
              <li key={r.id}><button type="button" className="ix-pitem" onClick={() => openRec(r.id)}>
                <span className="ix-pitem__top"><b>{r.customer.name}</b><span className="fn-fig">{money(r.total)}</span></span>
                <span className="ix-pitem__mid">{dmy(r.at)} · <span className="fn-data">{r.invNo}</span> · {r.serviceName}</span>
                <span className="ix-pitem__tags"><IncBadge st={st} /></span>
              </button></li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table">
              <caption className="sr-only">Service income</caption>
              <thead><tr><th scope="col">Date</th><th scope="col">Number</th><th scope="col">Customer</th><th scope="col">Service</th><th scope="col">Status</th><th scope="col">Received into</th><th scope="col" className="ix-num">Amount</th></tr></thead>
              <tbody>
                {shown.map(({ r, st }) => (
                  <tr key={r.id} tabIndex={0} onClick={rowGo(() => openRec(r.id))} onKeyDown={rowKey(() => openRec(r.id))}>
                    <td className="ix-nowrap ix-muted">{when(r.at, t)}</td>
                    <td className="ix-nowrap"><span className="ix-id ix-strong">{r.invNo}</span></td>
                    <td><span className="fn-name">{r.customer.type === 'store' ? <Link href={'/admin/merchant?id=' + r.customer.shopId}>{r.customer.name}</Link> : <b>{r.customer.name}</b>}<small>{r.customer.type === 'store' ? '#' + r.customer.shopId : r.customer.type === 'lead' ? 'Lead' + (r.customer.leadId ? ' ' + r.customer.leadId : '') : r.customer.phone || 'Other customer'}</small></span></td>
                    <td><span className="fn-name"><span>{r.serviceName}</span><small>{qtyText(r)}{r.discount ? ` · ${money(r.discount)} off` : ''}</small></span></td>
                    <td><IncBadge st={st} /></td>
                    <td className="ix-nowrap ix-muted">{intoText(F, r)}</td>
                    <td className="ix-num"><span className={'fn-fig' + (r.voided ? ' fn-muted' : '')}>{money(r.total)}</span>{st.balance && st.paid ? <small className="ix-muted" style={{ display: 'block', fontSize: 'var(--text-xs)' }}>{money(st.balance)} due</small> : null}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
    }
    body = (
      <>
        <MetricStrip label="Service income" items={[
          { label: 'Received this month', value: money(d.thisM), sub: 'so far' },
          { label: 'Last month', value: money(d.lastM), sub: d.lastName, icon: 'calendar' },
          { label: 'To collect', value: money(d.due), sub: d.overdue ? `${money(d.overdue)} overdue` : 'nothing overdue', icon: 'hourglass' },
          { label: 'Top service this month', value: d.top ? d.top[0] : '—', sub: d.top ? money(d.top[1]) + ' billed' : 'nothing sold yet', icon: 'star' },
        ]} />
        <section className="ix-card" aria-label="Income">
          <div className="ix-bar"><IndexTabs tabs={tabs} label="Income views" /></div>
          <div className="fn-filters"><FilterBar label={tab === 'services' ? 'Filter services' : 'Filter income'} filters={filters} onClear={() => setQ('')}
            search={{ value: q, onChange: (v) => { setQ(v); setPage(0); }, placeholder: tab === 'services' ? 'Search services' : 'Search number, customer, service or transaction ID' }}
            right={tab === 'services' ? <button type="button" className="ix-btn" onClick={() => setSheet({ kind: 'newSvc' })}><Icon name="plus" width="16" height="16" aria-hidden="true" /><span>Add service</span></button> : null} /></div>
          {list}
          {tab === 'services'
            ? <div className="ix-foot"><span>{plural(svcShown.length, 'service')} · {svcShown.filter((x) => x.active).length} on</span></div>
            : <Pager label={<span className="fn-tfoot"><span>{filtered.length ? `${pg * PAGE + 1}–${pg * PAGE + shown.length} of ${filtered.length}` : '0 records'}</span>{sumTotal ? <span>Total <b>{money(sumTotal)}</b></span> : null}{sumDue ? <span>Due <b>{money(sumDue)}</b></span> : null}</span>}
              atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />}
        </section>
      </>
    );
  }

  const sheetEl = (() => {
    if (!sheet || !d) return null;
    if (sheet.kind === 'new') return <IncomeForm db={db} F={F} t={t} bal={d.bal} preset={sheet.preset} close={closeSheet} onDone={(id) => setTimeout(() => openRec(id), 0)} />;
    if (sheet.kind === 'rec') { const r = incomeBy(F, sheet.id); return r ? <IncomeSheet key={r.id} db={db} F={F} t={t} bal={d.bal} r={r} close={closeSheet} /> : null; }
    if (sheet.kind === 'svc') { const x = serviceBy(F, sheet.id); return x ? <ServiceForm key={x.id} F={F} sv={x} close={closeSheet} /> : null; }
    if (sheet.kind === 'newSvc') return <ServiceForm F={F} sv={null} close={closeSheet} />;
    return null;
  })();

  return (
    <AdminShell active="income" title="Income">
      <style dangerouslySetInnerHTML={{ __html: FIN_CSS + CSS }} />
      <div className="ix-page">
        {header}
        {body}
      </div>
      {sheetEl}
    </AdminShell>
  );
}
