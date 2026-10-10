'use client';
// Billing & credits — what the Invoices, Invoice, Collections and Credits pages share: the CSS (classes bl-*), money
// and date text, a bill's state as a badge, a form field, and the action sheets that call lib/platform/billing.js:
//   <PaySheet db t shopId invoiceId close />       recordPayment (a transaction ID for every method but cash; each ID once)
//   <CallSheet db t shopId close onPaid />          logCall (outcome, promise-to-pay date, next call, method)
//   <GraceSheet db t shopId close />                extendGrace (lib/admin/merchants; reason required)
//   <AdjustSheet db t shopId invoiceId type close /> requestAdjustment, with the effect preview (views › adjustmentEffect)
//   payLink(shopId)                                 sendPayLinks + toast
// Each sheet shows the error the lib returns next to the field it is about, and on success closes with a toast.

import React, { useState } from 'react';
import { Icon } from '@/runtime/dc';
import { Sheet, StatusBadge } from '@/components/ui';
import { toast } from '@/runtime/ui';
import { DAY, TZ, dm, dmy, hm, dhaka, daysBetween, taka, monthLong, startOfDay } from '@/lib/platform/util';
import { METHODS, VIA, REASONS, REASON_LABEL, PLAN_NAME, ladderLabel } from '@/lib/platform/catalogue';
import { staff } from '@/lib/platform/store';
import {
  recordPayment, logCall, sendPayLinks, requestAdjustment, openInvoices, balance, invoiceState, invoiceById, shopOf, subOf,
  outcomeLabel, mrrOf,
} from '@/lib/platform/billing';
import { adjustmentEffect } from '@/lib/platform/views';
import { extendGrace } from '@/lib/admin/merchants';

export const money = (n) => taka(n);
export const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many || one + 's');
/** "October 2026" for a period "2026-10". */
export const periodText = (p) => (p ? `${monthLong(p)} ${p.slice(0, 4)}` : '—');
/** "Today 10:02" · "Yesterday" · "3 days ago" · "02 Sep" · "02 Sep 2025" */
export function when(ms, t) {
  if (!ms) return '—';
  const n = daysBetween(ms, t);
  if (n === 0) return 'Today ' + hm(ms);
  if (n === 1) return 'Yesterday ' + hm(ms);
  if (n > 1 && n < 7) return n + ' days ago';
  if (n === -1) return 'Tomorrow ' + hm(ms);
  return new Date(ms + TZ).getUTCFullYear() === new Date(t + TZ).getUTCFullYear() ? dm(ms) : dmy(ms);
}
/** yyyy-mm-dd in Dhaka time, for a date input. */
export const dateInput = (ms) => new Date(ms + TZ).toISOString().slice(0, 10);
/** A date input's value -> ms at hour h (Dhaka). */
export const fromDateInput = (v, h = 12, m = 0) => { const [y, mo, d] = String(v).split('-').map(Number); return y ? dhaka(y, mo - 1, d, h, m) : null; };

/** A bill's state: { tab, label, tone }. tab: due · overdue · credited · paid (one tab per bill). */
export function billState(db, inv, t) {
  const s = invoiceState(db, inv, t);
  const credited = db.credits.some((c) => c.invoiceId === inv.id);
  if (s.key === 'overdue') return { key: s.key, tab: 'overdue', label: `Overdue · ${plural(s.days, 'day')}`, tone: 'error', days: s.days };
  if (s.key === 'due') return { key: s.key, tab: 'due', label: s.days === 0 ? 'Due today' : `Due in ${plural(s.days, 'day')}`, tone: 'warning', days: s.days };
  if (s.key === 'void') return { key: s.key, tab: 'credited', label: 'Void', tone: 'neutral' };
  if (s.key === 'credited') return { key: s.key, tab: 'credited', label: 'Settled by credit', tone: 'primary' };
  if (s.key === 'nocharge') return { key: s.key, tab: 'paid', label: 'No charge · trial', tone: 'neutral' };
  if (credited) return { key: s.key, tab: 'credited', label: 'Paid · credit note', tone: 'success', paidAt: s.paidAt };
  return { key: s.key, tab: 'paid', label: 'Paid', tone: 'success', paidAt: s.paidAt };
}
export function BillBadge({ st }) { return <StatusBadge tone={st.tone}>{st.label}</StatusBadge>; }

export const packageOf = (db, shopId) => { const sub = subOf(db, shopId); return sub ? `${ladderLabel(sub.ladder)} · ${PLAN_NAME[sub.plan]}` : '—'; };

export function payLink(shopId) {
  const r = sendPayLinks(shopId) || {};
  toast(r.count ? `Pay link sent by SMS${r.count > 1 ? ` for ${plural(r.count, 'bill')}` : ''}` : 'No bill is due yet, so no link was sent');
  return r.count || 0;
}

export const BILL_CSS = `
.bl-skel{height:360px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-card),var(--surface-subtle),var(--surface-card));background-size:200% 100%;animation:bl-sk 1.4s ease infinite}
.bl-skel--strip{height:72px}.bl-skel--head{height:56px}
@keyframes bl-sk{from{background-position:100% 0}to{background-position:-100% 0}}
@media (prefers-reduced-motion:reduce){.bl-skel{animation:none}}
.bl-err{display:flex;flex-direction:column;align-items:center;gap:var(--space-3);padding:var(--space-8) var(--space-4);text-align:center;font-size:var(--text-sm);color:var(--text-body)}
.bl-filters{padding:8px;border-bottom:1px solid var(--border-subtle)}
.bl-filters .gc-filterbar__search{max-width:320px}
.bl-data{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.bl-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums;color:var(--text-heading);white-space:nowrap}
.bl-muted{color:var(--text-muted)}
.bl-bad{color:var(--text-danger)}
.bl-warn{color:var(--text-warning)}
.bl-name{display:flex;flex-direction:column;min-width:0;max-width:240px}
.bl-name a,.bl-name b,.bl-name button{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bl-name small{overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.bl-foot{display:inline-flex;flex-wrap:wrap;gap:4px var(--space-3)}
.bl-foot b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ix-table tbody tr:focus-visible td{background:var(--surface-subtle)}
.ix-table tbody tr:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.ix-table .bl-act{width:1%;text-align:right;white-space:nowrap}
.bl-act__in{display:inline-flex;align-items:center;gap:var(--space-1)}
.bl-form{display:flex;flex-direction:column;gap:var(--space-3)}
.bl-form__two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.bl-form p{margin:0}
.bl-formerr{margin:0;font-size:var(--text-sm);color:var(--text-danger)}
.bl-note{margin:0;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm);color:var(--text-body)}
.bl-note--warn{background:var(--fill-warning-soft);color:var(--text-heading)}
.bl-note--err{background:var(--fill-error-soft);color:var(--text-danger)}
.bl-effect{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.bl-effect>div{display:flex;flex-direction:column;gap:2px;min-width:0}
.bl-effect small{font-size:var(--text-xs);color:var(--text-muted)}
.bl-effect b{font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.bl-effect p{grid-column:1/-1;margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.bl-row{display:flex;align-items:center;gap:var(--space-3);min-height:44px;padding:6px 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-body)}
.bl-row:first-child{border-top:0}
.bl-row__ic{flex:none;display:grid;place-items:center;width:28px;height:28px;border-radius:var(--radius-full);background:var(--surface-subtle);color:var(--text-muted)}
.bl-row__main{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.bl-row__main b{font-weight:var(--weight-medium);color:var(--text-heading);overflow-wrap:anywhere}
.bl-row__main small{font-size:var(--text-xs);color:var(--text-muted);overflow-wrap:anywhere}
.bl-row__end{flex:none;display:flex;align-items:center;gap:var(--space-2)}
.bl-empty{margin:0;padding:var(--space-2) 0;font-size:var(--text-sm);color:var(--text-muted)}
.bl-pact{display:flex;flex-wrap:wrap;gap:var(--space-2);margin-top:4px}
.ix-pitem--box{cursor:default}
.ix-pitem--box a{color:inherit;text-decoration:none}
@media (max-width:640px){
  .bl-filters{padding:6px}
  .bl-form__two{grid-template-columns:minmax(0,1fr)}
  .bl-pact .ix-btn{height:36px}
}
`;

export function Skeleton({ strip, label = 'Loading' }) {
  return (
    <div className="ix-page" aria-busy="true" aria-label={label}>
      {strip ? <div className="bl-skel bl-skel--strip" /> : null}
      <div className="bl-skel" />
    </div>
  );
}

/** One line of a list: an icon, a title, a small line under it, and whatever sits at the end. */
export function Row({ title, sub, end, icon }) {
  return (
    <div className="bl-row">
      {icon ? <span className="bl-row__ic" aria-hidden="true"><Icon name={icon} width="16" height="16" /></span> : null}
      <span className="bl-row__main"><b>{title}</b>{sub ? <small>{sub}</small> : null}</span>
      {end ? <span className="bl-row__end">{end}</span> : null}
    </div>
  );
}

// ---- form parts -----------------------------------------------------------------------------------------------------
export function Field({ id, label, error, hint, children }) {
  return (
    <div className="gc-field">
      <label className="gc-label" htmlFor={id}>{label}</label>
      {children}
      {error ? <p className="gc-help gc-help--error" id={id + '-err'} role="alert">{error}</p> : hint ? <p className="gc-help">{hint}</p> : null}
    </div>
  );
}
/** Props for an input or select inside a Field. */
export const ctl = (error, select) => ({ className: 'gc-input' + (select ? ' gc-select' : '') + (error ? ' gc-input--error' : ''), 'aria-invalid': error ? true : undefined });
const errOf = (err, f) => (err && err.field === f ? err.text : null);
/** Which field a lib error sentence is about. */
const fieldFor = (text, map) => { for (const [re, f] of map) if (re.test(text || '')) return f; return 'form'; };

export function FormSheet({ id, title, close, onSubmit, submit, danger, disabled, error, children }) {
  return (
    <Sheet open title={title} onClose={close} footer={(
      <>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={close}>Cancel</button>
        <button type="submit" form={id} disabled={disabled} className={'gc-btn ' + (danger ? 'gc-btn--error' : 'gc-btn--solid')}>{submit}</button>
      </>
    )}>
      <form id={id} className="bl-form" noValidate onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        {children}
        {error && error.field === 'form' ? <p className="bl-formerr" role="alert">{error.text}</p> : null}
      </form>
    </Sheet>
  );
}

// ---- record a payment --------------------------------------------------------------------------------------------------
/** Record a payment on one of the store's unpaid bills. */
export function PaySheet({ db, t, shopId, invoiceId, close }) {
  const open = openInvoices(db, shopId);
  const first = open.find((i) => i.id === invoiceId) || open[0];
  const [f, setF] = useState({ invoiceId: first ? first.id : '', amount: first ? String(balance(db, first)) : '', method: 'bKash', txId: '', via: 'call' });
  const [err, setErr] = useState(null);
  const shop = shopOf(db, shopId);
  const set = (k) => (e) => {
    setErr(null);
    const v = e.target.value;
    if (k === 'invoiceId') { const inv = open.find((i) => i.id === v); setF({ ...f, invoiceId: v, amount: inv ? String(balance(db, inv)) : f.amount }); } else setF({ ...f, [k]: v });
  };
  if (!open.length) {
    return <Sheet open title="Record payment" onClose={close}><p className="bl-empty">Nothing is owed{shop ? ` by ${shop.name}` : ''}: every bill is paid.</p></Sheet>;
  }
  const cash = f.method === 'Cash at office';
  const submit = () => {
    const r = recordPayment({ invoiceId: f.invoiceId, amount: f.amount, method: f.method, txId: cash ? '' : f.txId, via: f.via });
    if (!r || !r.ok) { setErr({ field: fieldFor(r && r.error, [[/transaction/i, 'txId'], [/amount|more than/i, 'amount'], [/bill/i, 'invoiceId']]), text: (r && r.error) || 'The payment could not be saved.' }); return; }
    toast(`${taka(r.payment.amount)} recorded on ${r.payment.invoiceId}${r.restored ? ' · access restored' : r.left ? ` · ${taka(r.left)} still owed` : ''}`);
    close();
  };
  return (
    <FormSheet id="bl-pay" title={shop ? `Record payment · ${shop.name}` : 'Record payment'} close={close} onSubmit={submit} submit="Record payment" error={err}>
      <Field id="bp-inv" label="Bill" error={errOf(err, 'invoiceId')}>
        <select id="bp-inv" {...ctl(errOf(err, 'invoiceId'), true)} value={f.invoiceId} onChange={set('invoiceId')}>
          {open.map((i) => <option key={i.id} value={i.id}>{i.id} · {taka(balance(db, i))} · {daysBetween(i.dueAt, t) > 0 ? `${daysBetween(i.dueAt, t)} days overdue` : 'due ' + dm(i.dueAt)}</option>)}
        </select>
      </Field>
      <div className="bl-form__two">
        <Field id="bp-amt" label="Amount (৳)" error={errOf(err, 'amount')}>
          <input id="bp-amt" type="number" inputMode="numeric" min="1" {...ctl(errOf(err, 'amount'))} value={f.amount} onChange={set('amount')} />
        </Field>
        <Field id="bp-m" label="Method">
          <select id="bp-m" {...ctl(null, true)} value={f.method} onChange={set('method')}>{METHODS.map((m) => <option key={m}>{m}</option>)}</select>
        </Field>
      </div>
      {cash ? null : (
        <Field id="bp-tx" label="Transaction ID" error={errOf(err, 'txId')} hint={`From the ${f.method} message. Each ID can be used once.`}>
          <input id="bp-tx" className={ctl(errOf(err, 'txId')).className + ' bl-data'} aria-invalid={errOf(err, 'txId') ? true : undefined} autoComplete="off" spellCheck={false} value={f.txId} onChange={set('txId')} />
        </Field>
      )}
      <Field id="bp-via" label="How it came in">
        <select id="bp-via" {...ctl(null, true)} value={f.via} onChange={set('via')}>{VIA.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
      </Field>
    </FormSheet>
  );
}

// ---- log a collection call -----------------------------------------------------------------------------------------------
export const OUTCOMES = ['paid', 'promised', 'panel', 'noanswer', 'later', 'dispute'];
/** Log a call to a store that owes. `onPaid` opens Record payment after a "Paid on the call". */
export function CallSheet({ db, t, shopId, close, onPaid }) {
  const open = openInvoices(db, shopId);
  const shop = shopOf(db, shopId);
  const tomorrow = dateInput(t + DAY);
  const [f, setF] = useState({ invoiceId: open[0] ? open[0].id : '', outcome: 'promised', note: '', promise: '', method: 'bKash', next: tomorrow, nextTime: '11:00' });
  const [err, setErr] = useState(null);
  const set = (k) => (e) => { setErr(null); setF({ ...f, [k]: e.target.value }); };
  const today = dateInput(t);
  const submit = () => {
    if (f.outcome === 'promised' && !f.promise) { setErr({ field: 'promise', text: 'Pick the day they promised to pay.' }); return; }
    if (f.outcome === 'promised' && f.promise < today) { setErr({ field: 'promise', text: 'The promised day can’t be in the past.' }); return; }
    if ((f.outcome === 'later' || f.outcome === 'noanswer') && f.next && f.next < today) { setErr({ field: 'next', text: 'The next call can’t be in the past.' }); return; }
    const [hh, mm] = f.nextTime.split(':').map(Number);
    const promiseAt = f.outcome === 'promised' ? fromDateInput(f.promise, 12) : null;
    const nextAt = f.outcome === 'paid' ? null : f.next ? fromDateInput(f.next, hh || 11, mm || 0) : null;
    const r = logCall({ shopId, invoiceId: f.invoiceId || null, outcome: f.outcome, note: f.note.trim() || outcomeLabel(f.outcome), promiseAt, nextAt, method: f.outcome === 'promised' ? f.method : null });
    if (!r || !r.ok) { setErr({ field: 'form', text: (r && r.error) || 'The call could not be saved.' }); return; }
    toast('Call logged');
    close();
    if (f.outcome === 'paid' && onPaid) onPaid();
  };
  return (
    <FormSheet id="bl-call" title={shop ? `Log a call · ${shop.name}` : 'Log a call'} close={close} onSubmit={submit} submit={f.outcome === 'paid' ? 'Log call, then record payment' : 'Log call'} error={err}>
      {shop && shop.owner && shop.owner.phone ? <p className="bl-note"><Icon name="phone" width="14" height="14" aria-hidden="true" /> {shop.owner.name} · <span className="bl-data">{shop.owner.phone}</span></p> : null}
      <Field id="bc-i" label="About">
        <select id="bc-i" {...ctl(null, true)} value={f.invoiceId} onChange={set('invoiceId')}>
          <option value="">No bill</option>
          {open.map((i) => <option key={i.id} value={i.id}>{i.id} · {taka(balance(db, i))}</option>)}
        </select>
      </Field>
      <Field id="bc-o" label="Outcome">
        <select id="bc-o" {...ctl(null, true)} value={f.outcome} onChange={set('outcome')}>{OUTCOMES.map((o) => <option key={o} value={o}>{outcomeLabel(o)}</option>)}</select>
      </Field>
      {f.outcome === 'promised' ? (
        <div className="bl-form__two">
          <Field id="bc-p" label="Promised to pay on" error={errOf(err, 'promise')}>
            <input id="bc-p" type="date" min={today} {...ctl(errOf(err, 'promise'))} value={f.promise} onChange={set('promise')} />
          </Field>
          <Field id="bc-m" label="Paying with">
            <select id="bc-m" {...ctl(null, true)} value={f.method} onChange={set('method')}>{METHODS.map((m) => <option key={m}>{m}</option>)}</select>
          </Field>
        </div>
      ) : null}
      {f.outcome !== 'paid' ? (
        <div className="bl-form__two">
          <Field id="bc-n" label="Next call" error={errOf(err, 'next')}>
            <input id="bc-n" type="date" min={today} {...ctl(errOf(err, 'next'))} value={f.next} onChange={set('next')} />
          </Field>
          <Field id="bc-nt" label="At">
            <select id="bc-nt" {...ctl(null, true)} value={f.nextTime} onChange={set('nextTime')}>{['10:00', '11:00', '12:00', '14:00', '16:00', '18:00'].map((x) => <option key={x}>{x}</option>)}</select>
          </Field>
        </div>
      ) : <p className="bl-note">After the call is logged, record the payment with its transaction ID.</p>}
      <Field id="bc-note" label="Note (optional)">
        <textarea id="bc-note" rows={2} {...ctl(null)} value={f.note} onChange={set('note')} />
      </Field>
    </FormSheet>
  );
}

// ---- extend grace -------------------------------------------------------------------------------------------------------
const GRACE_REASONS = ['Promised to pay', 'Payment on the way', 'Outage on our side', 'Owner asked', 'Other'];
export function GraceSheet({ db, t, shopId, close }) {
  const shop = shopOf(db, shopId);
  const [days, setDays] = useState('7');
  const [pick, setPick] = useState('');
  const [note, setNote] = useState('');
  const [err, setErr] = useState(null);
  const late = openInvoices(db, shopId).filter((i) => i.dueAt < startOfDay(t) + DAY);
  const submit = () => {
    if (!pick) { setErr({ field: 'reason', text: 'Pick a reason.' }); return; }
    if (pick === 'Other' && !note.trim()) { setErr({ field: 'note', text: 'Say why the grace is extended.' }); return; }
    const reason = pick === 'Other' ? note.trim() : [pick, note.trim()].filter(Boolean).join(' · ');
    const r = extendGrace(shopId, days, reason);
    if (!r || !r.ok) { setErr({ field: fieldFor(r && r.error, [[/why/i, 'reason']]), text: (r && r.error) || 'The grace could not be extended.' }); return; }
    toast(`Grace extended by ${plural(r.days, 'day')} for ${shop ? shop.name : 'the store'}`);
    close();
  };
  return (
    <FormSheet id="bl-grace" title={shop ? `Extend grace · ${shop.name}` : 'Extend grace'} close={close} onSubmit={submit} submit="Extend grace" danger disabled={!late.length} error={err}>
      <p className="bl-note bl-note--err">{late.length ? `${late.map((i) => i.id).join(', ')} move${late.length === 1 ? 's' : ''} its due date on, so read-only and suspension come later. The money is still owed.` : 'Nothing is overdue, so there is no grace to extend.'}</p>
      <Field id="bg-d" label="Days">
        <select id="bg-d" {...ctl(null, true)} value={days} onChange={(e) => setDays(e.target.value)}>{['3', '7', '14'].map((d) => <option key={d} value={d}>{d} days</option>)}</select>
      </Field>
      <Field id="bg-r" label="Reason" error={errOf(err, 'reason')}>
        <select id="bg-r" {...ctl(errOf(err, 'reason'), true)} value={pick} onChange={(e) => { setErr(null); setPick(e.target.value); }}>
          <option value="">Pick a reason</option>
          {GRACE_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </Field>
      <Field id="bg-n" label={pick === 'Other' ? 'Say why' : 'Note (optional)'} error={errOf(err, 'note')}>
        <textarea id="bg-n" rows={2} {...ctl(errOf(err, 'note'))} value={note} onChange={(e) => { setErr(null); setNote(e.target.value); }} />
      </Field>
    </FormSheet>
  );
}

// ---- request an adjustment -----------------------------------------------------------------------------------------------
export const ADJ_TYPES = [['credit', 'Credit note on a bill'], ['discount', 'Discount on the next bill'], ['charge', 'Extra charge on the next bill'], ['waive', 'Waive a bill (Admin)']];
export const ADJ_TYPE_LABEL = { credit: 'Credit note', discount: 'Discount', charge: 'Extra charge', waive: 'Waiver' };

/** What the request will do to the bill, before it is sent (views › adjustmentEffect). */
export function Effect({ db, t, a }) {
  let e = null;
  try { e = adjustmentEffect(db, a, t); } catch { e = null; }
  if (!e) return null;
  return (
    <div className="bl-effect" aria-label="Effect on the bill">
      <div><small>{e.beforeLabel}</small><b>{taka(e.before)}</b></div>
      <div><small>{e.afterLabel}</small><b>{taka(e.after)}</b></div>
      <p>{e.planLine} · {e.explain}</p>
    </div>
  );
}

/** New adjustment. shopId may be empty (a store picker is shown); invoiceId preselects a bill. */
export function AdjustSheet({ db, t, shopId: shop0, invoiceId: inv0, type: type0, close }) {
  const me = staff();
  const stores = db.shops.filter((s) => subOf(db, s.id) && s.status !== 'setup').sort((a, b) => a.name.localeCompare(b.name));
  const inv0Rec = inv0 ? invoiceById(db, inv0) : null;
  const [f, setF] = useState({ shopId: shop0 || (inv0Rec ? inv0Rec.shopId : ''), type: type0 || 'credit', invoiceId: inv0 || '', amount: '', pct: '', reason: '', note: '' });
  const [err, setErr] = useState(null);
  const bills = f.shopId ? db.invoices.filter((i) => i.shopId === f.shopId && !i.noCharge && !i.voided).sort((a, b) => b.issuedAt - a.issuedAt) : [];
  const onBill = f.type === 'credit' || f.type === 'waive';
  const billId = onBill ? (bills.some((b) => b.id === f.invoiceId) ? f.invoiceId : (bills[0] || {}).id || '') : 'next';
  const inv = onBill ? bills.find((b) => b.id === billId) : null;
  const threshold = (db.settings || {}).adjThreshold || 500;
  const set = (k) => (e) => { setErr(null); setF({ ...f, [k]: e.target.value, ...(k === 'shopId' ? { invoiceId: '' } : {}) }); };

  // the amount the lib will use (worked out the same way), for the preview and the approval note
  let amt = Math.round(Number(f.amount) || 0);
  if (!amt && f.pct && (f.type === 'discount' || f.type === 'credit')) {
    const base = inv ? inv.total : f.shopId && subOf(db, f.shopId) ? mrrOf(db, subOf(db, f.shopId), t) : 0;
    amt = Math.round((base * Number(f.pct)) / 100);
  }
  if (f.type === 'waive' && inv) amt = balance(db, inv);
  const draft = f.shopId && amt > 0 && (!onBill || inv) ? { shopId: f.shopId, invoiceId: billId, type: f.type, amount: amt } : null;
  const waiveBlocked = f.type === 'waive' && me.role !== 'admin';

  const submit = () => {
    if (!f.shopId) { setErr({ field: 'shopId', text: 'Pick the store.' }); return; }
    const r = requestAdjustment({
      shopId: f.shopId, invoiceId: billId, type: f.type, amount: f.type === 'waive' ? 0 : f.amount,
      pct: (f.type === 'discount' || f.type === 'credit') && !Number(f.amount) ? f.pct : null, reason: f.reason, note: f.note,
    });
    if (!r || !r.ok) { setErr({ field: fieldFor(r && r.error, [[/reason/i, 'reason'], [/amount|percent|more than/i, 'amount'], [/bill/i, 'invoiceId'], [/note/i, 'note']]), text: (r && r.error) || 'The request could not be saved.' }); return; }
    const a = r.adjustment;
    toast(a.status === 'approved' ? `${a.id} applied${a.cnId ? ' · ' + a.cnId + ' issued' : ''}` : `${a.id} sent for a second approval`);
    close(a);
  };

  return (
    <FormSheet id="bl-adj" title="New adjustment" close={() => close(null)} onSubmit={submit} submit={f.type === 'waive' ? 'Ask to waive' : amt > threshold ? 'Send for approval' : 'Apply'} danger={f.type === 'waive'} disabled={waiveBlocked} error={err}>
      <Field id="ba-s" label="Store" error={errOf(err, 'shopId')}>
        <select id="ba-s" {...ctl(errOf(err, 'shopId'), true)} value={f.shopId} onChange={set('shopId')} disabled={!!shop0}>
          <option value="">Pick a store</option>
          {stores.map((s) => <option key={s.id} value={s.id}>{s.name} · #{s.id}</option>)}
        </select>
      </Field>
      <Field id="ba-t" label="Type">
        <select id="ba-t" {...ctl(null, true)} value={f.type} onChange={set('type')}>{ADJ_TYPES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
      </Field>
      {onBill ? (
        <Field id="ba-i" label="Bill" error={errOf(err, 'invoiceId')}>
          <select id="ba-i" {...ctl(errOf(err, 'invoiceId'), true)} value={billId} onChange={set('invoiceId')} disabled={!bills.length}>
            {bills.length ? bills.map((i) => <option key={i.id} value={i.id}>{i.id} · {periodText(i.period)} · {taka(i.total)}{balance(db, i) ? ` · ${taka(balance(db, i))} owed` : ' · paid'}</option>) : <option value="">{f.shopId ? 'No bills yet' : 'Pick a store first'}</option>}
          </select>
        </Field>
      ) : <p className="bl-note">It comes on the store’s next bill.</p>}
      {f.type === 'waive' ? (
        <p className="bl-note bl-note--err">
          {waiveBlocked ? 'Waiving a bill needs an Admin. Ask an Admin, or send a credit note instead.'
            : inv && balance(db, inv) ? `${taka(balance(db, inv))} left on ${inv.id} is written off with a credit note.` : 'Nothing is left to pay on this bill.'}
        </p>
      ) : (
        <div className="bl-form__two">
          <Field id="ba-a" label="Amount (৳)" error={errOf(err, 'amount')}>
            <input id="ba-a" type="number" inputMode="numeric" min="1" {...ctl(errOf(err, 'amount'))} value={f.amount} onChange={set('amount')} />
          </Field>
          {f.type === 'discount' || f.type === 'credit' ? (
            <Field id="ba-p" label="or percent of the bill">
              <input id="ba-p" type="number" inputMode="numeric" min="1" max="100" {...ctl(null)} value={f.pct} onChange={set('pct')} disabled={!!Number(f.amount)} />
            </Field>
          ) : null}
        </div>
      )}
      <Field id="ba-r" label="Reason code" error={errOf(err, 'reason')}>
        <select id="ba-r" {...ctl(errOf(err, 'reason'), true)} value={f.reason} onChange={set('reason')}>
          <option value="">Pick a reason</option>
          {REASONS.map((r) => <option key={r} value={r}>{REASON_LABEL[r]}</option>)}
        </select>
      </Field>
      <Field id="ba-n" label="Note the owner sees" error={errOf(err, 'note')}>
        <textarea id="ba-n" rows={2} {...ctl(errOf(err, 'note'))} value={f.note} onChange={set('note')} />
      </Field>
      {draft ? <Effect db={db} t={t} a={draft} /> : null}
      {amt > 0 ? (
        <p className={'bl-note' + (amt > threshold ? ' bl-note--warn' : '')}>
          {amt > threshold ? `${taka(amt)} is above ${taka(threshold)}: Finance or an Admin approves it, never the person who asks.` : `Up to ${taka(threshold)} applies at once.`}
        </p>
      ) : null}
    </FormSheet>
  );
}
