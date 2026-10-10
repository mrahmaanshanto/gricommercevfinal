'use client';
// Affiliates (list and profile) — the side panels both pages use: add / edit an affiliate, the commission rules with a
// calculation preview, one payout (Pending → Approved by someone other than the requester → Paid with a transaction ID
// used once, or Rejected) and a manual commission adjustment. Data: lib/admin/marketing2.js.

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, StatusBadge } from '@/components/ui';
import { KV } from '@/components/ui/IndexKit';
import { DAY, startOfDay } from '@/lib/platform/util';
import { DISTRICTS, LADDERS, PLAN_NAME } from '@/lib/platform/catalogue';
import { staff as currentStaff, db as platformDb } from '@/lib/platform/store';
import {
  AFF_KINDS, RULE_KINDS, PAY_METHODS, PAYOUT_STATUS, COM_STATUS, PLAN_KEYS, MIN_PAYOUT, HOLD_DAYS,
  addAffiliate, saveAffiliate, saveRule, setRuleActive, calcCommission, ruleText, approvePayout, rejectPayout, markPayoutPaid, adjustCommission,
} from '@/lib/admin/marketing2';
import { Field, ctl, FormError, money, num, plural, dayTime, toDateInput, fromInput } from './mk2Shared';

export const AFF_CSS = `
.af-calc{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-page)}
.af-calc table{width:100%;border-collapse:collapse;font-size:var(--text-xs)}
.af-calc th,.af-calc td{padding:4px 6px;border-bottom:1px solid var(--border-subtle);text-align:left}
.af-calc td:last-child,.af-calc th:last-child{text-align:right;font-family:var(--font-data)}
.af-calc tfoot td{border-bottom:0;font-weight:var(--weight-semibold);color:var(--text-heading)}
.af-rule{display:flex;align-items:center;gap:var(--space-3);min-height:52px;padding:var(--space-2) 0;border-top:1px solid var(--border-subtle)}
.af-rules>.af-rule:first-child{border-top:0}
.af-rule span{display:flex;flex:1;flex-direction:column;min-width:0}
.af-rule b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.af-rule small{font-size:var(--text-xs);color:var(--text-muted)}
.af-steps{display:flex;flex-wrap:wrap;gap:var(--space-2);margin:0;padding:0;list-style:none}
.af-steps li{display:inline-flex;align-items:center;gap:6px;font-size:var(--text-xs);color:var(--text-muted)}
.af-steps li.is-done{color:var(--text-success)}
.af-steps li.is-now{font-weight:var(--weight-medium);color:var(--text-heading)}
`;

const BLANK = { name: '', org: '', kind: 'Influencer', district: 'Dhaka', phone: '', email: '', code: '', rule: 'CR-1', channel: '', pay: { method: 'bKash', number: '', bank: '', account: '', holder: '' } };

/** Add (a = null) or edit an affiliate. */
export function AffFormSheet({ open, a, data, onClose, onDone }) {
  if (!open) return null;
  return <AffForm key={a ? a.id : 'new'} a={a} data={data} onClose={onClose} onDone={onDone} />;
}
function AffForm({ a, data, onClose, onDone }) {
  const [f, setF] = useState(() => (a ? { ...BLANK, ...a, pay: { ...BLANK.pay, ...a.pay } } : { ...BLANK, pay: { ...BLANK.pay } }));
  const [err, setErr] = useState(null);
  const set = (patch) => { setF((x) => ({ ...x, ...patch })); setErr(null); };
  const setPay = (patch) => set({ pay: { ...f.pay, ...patch } });
  const e = (k) => (err && err.field === k ? err.error : '');
  const save = () => {
    const r = a ? saveAffiliate(a.id, { name: f.name, org: f.org, kind: f.kind, district: f.district, phone: f.phone, email: f.email, channel: f.channel, pay: f.pay }) : addAffiliate(f);
    if (!r.ok) { setErr(r); const el = document.getElementById('af-' + r.field); if (el) el.focus(); return; }
    toast(a ? 'Saved' : `${f.name} added · waiting for approval`);
    onClose();
    if (onDone) onDone(r.id || (a && a.id));
  };
  return (
    <Sheet open title={a ? 'Edit ' + a.name : 'Add affiliate'} onClose={onClose} footer={<>
      <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button>
      <button type="button" className="gc-btn gc-btn--solid" onClick={save}>{a ? 'Save' : 'Add'}</button>
    </>}>
      <div className="mk-form">
        <div className="mk-two">
          <Field id="af-name" label="Name" error={e('name')}><input id="af-name" data-autofocus {...ctl(e('name'))} value={f.name} onChange={(ev) => set({ name: ev.target.value })} /></Field>
          <Field id="af-org" label="Channel, agency or business" optional><input id="af-org" className="gc-input" value={f.org} onChange={(ev) => set({ org: ev.target.value })} /></Field>
          <Field id="af-kind" label="Type"><select id="af-kind" className="gc-input gc-select" value={f.kind} onChange={(ev) => set({ kind: ev.target.value })}>{AFF_KINDS.map((k) => <option key={k}>{k}</option>)}</select></Field>
          <Field id="af-district" label="District"><select id="af-district" className="gc-input gc-select" value={f.district} onChange={(ev) => set({ district: ev.target.value })}>{[...new Set([...DISTRICTS, f.district])].map((k) => <option key={k}>{k}</option>)}</select></Field>
          <Field id="af-phone" label="Mobile" error={e('phone')}><input id="af-phone" {...ctl(e('phone'))} inputMode="tel" placeholder="01711-245678" value={f.phone} onChange={(ev) => set({ phone: ev.target.value })} /></Field>
          <Field id="af-email" label="Email" optional error={e('email')}><input id="af-email" {...ctl(e('email'))} inputMode="email" value={f.email} onChange={(ev) => set({ email: ev.target.value })} /></Field>
        </div>
        <Field id="af-channel" label="Audience" optional hint="e.g. YouTube · 86k subscribers"><input id="af-channel" className="gc-input" value={f.channel} onChange={(ev) => set({ channel: ev.target.value })} /></Field>
        {!a ? (
          <div className="mk-two">
            <Field id="af-code" label="Referral code" error={e('code')} hint="3 to 12 capital letters or numbers"><input id="af-code" {...ctl(e('code'))} value={f.code} onChange={(ev) => set({ code: ev.target.value.toUpperCase().replace(/\s/g, '') })} /></Field>
            <Field id="af-rule" label="Commission rule" error={e('rule')}><select id="af-rule" {...ctl(e('rule'), true)} value={f.rule} onChange={(ev) => set({ rule: ev.target.value })}>{data.rules.filter((r) => r.active).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></Field>
          </div>
        ) : null}
        <p className="mk-sec">Payment details</p>
        <div className="gc-field" id="af-pay" tabIndex={-1}>
          <span className="gc-label">Paid by</span>
          <div className="gc-seg" role="radiogroup" aria-label="Paid by">{PAY_METHODS.map((m) => <button key={m} type="button" role="radio" aria-checked={f.pay.method === m} className={'gc-seg__btn' + (f.pay.method === m ? ' gc-seg__btn--active' : '')} onClick={() => setPay({ method: m })}>{m}</button>)}</div>
        </div>
        {f.pay.method === 'Bank transfer' ? (
          <div className="mk-two">
            <Field id="af-bank" label="Bank and branch"><input id="af-bank" className="gc-input" value={f.pay.bank} placeholder="BRAC Bank, Gulshan" onChange={(ev) => setPay({ bank: ev.target.value })} /></Field>
            <Field id="af-account" label="Account number"><input id="af-account" className="gc-input mk-data" inputMode="numeric" value={f.pay.account} onChange={(ev) => setPay({ account: ev.target.value })} /></Field>
            <Field id="af-holder" label="Account name" optional><input id="af-holder" className="gc-input" value={f.pay.holder} onChange={(ev) => setPay({ holder: ev.target.value })} /></Field>
          </div>
        ) : (
          <Field id="af-number" label={f.pay.method + ' number'}><input id="af-number" className="gc-input mk-data" inputMode="tel" placeholder="01711-245678" value={f.pay.number} onChange={(ev) => setPay({ number: ev.target.value })} /></Field>
        )}
        {err && (err.field === 'pay' || !err.field) ? <FormError error={err.error} /> : null}
      </div>
    </Sheet>
  );
}

/** The commission rules: list, edit or add one, turn off, and a calculation preview (plan + rule). */
export function RulesSheet({ open, data, onClose, pick }) {
  const [edit, setEdit] = useState(null);     // rule form or null
  const [err, setErr] = useState(null);
  const [calc, setCalc] = useState({ rule: 'CR-1', ladder: 'online', plan: 'business', billing: 'monthly' });
  if (!open) return null;
  const rules = data.rules;
  const users = (id) => data.affiliates.filter((a) => a.rule === id && a.status !== 'Rejected').length;
  const rule = edit ? { ...edit, value: Number(edit.value) || 0, months: Number(edit.months) || 1 } : rules.find((r) => r.id === calc.rule) || rules[0];
  const out = calcCommission(rule, calc.ladder, calc.plan, calc.billing);
  const e = (k) => (err && err.field === k ? err.error : '');
  const save = () => {
    const r = saveRule({ ...edit, value: Number(edit.value), months: Number(edit.months), from: fromInput(edit.fromS), to: edit.toS ? fromInput(edit.toS, 23) + 59 * 60e3 : null });
    if (!r.ok) { setErr(r); return; }
    toast(edit.id ? 'Rule saved' : 'Rule added'); setEdit(null); setErr(null); setCalc({ ...calc, rule: r.id });
  };
  const toggle = (r) => { const res = setRuleActive(r.id, !r.active); toast(res.ok ? (r.active ? 'Rule turned off' : 'Rule turned on') : res.error, res.ok ? undefined : { tone: 'error' }); };
  const now = startOfDay(Date.now());
  const blank = { name: '', kind: 'recurring', value: '20', months: '6', campaign: '', fromS: toDateInput(now), toS: toDateInput(now + 30 * DAY) };
  return (
    <Sheet open title={edit ? (edit.id ? 'Edit rule' : 'New rule') : 'Commission rules'} onClose={() => { setEdit(null); setErr(null); onClose(); }} footer={edit ? <>
      <button type="button" className="gc-btn gc-btn--neutral" onClick={() => { setEdit(null); setErr(null); }}>Back</button>
      <button type="button" className="gc-btn gc-btn--solid" onClick={save}>Save rule</button>
    </> : <>
      <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEdit({ ...blank })}>New rule</button>
      <button type="button" className="gc-btn gc-btn--solid" onClick={onClose}>Done</button>
    </>}>
      <div className="mk-form">
        {edit ? (<>
          <Field id="cr-name" label="Name" error={e('name')}><input id="cr-name" data-autofocus {...ctl(e('name'))} value={edit.name} placeholder="e.g. Winter agencies · 30% for 3 months" onChange={(ev) => setEdit({ ...edit, name: ev.target.value })} /></Field>
          <Field id="cr-kind" label="How it pays" error={e('kind')}><select id="cr-kind" {...ctl(e('kind'), true)} value={edit.kind} onChange={(ev) => setEdit({ ...edit, kind: ev.target.value })}>{RULE_KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
          <div className="mk-two">
            <Field id="cr-value" label={edit.kind === 'percent' || edit.kind === 'recurring' ? 'Percent' : 'Amount (৳)'} error={e('value')}><input id="cr-value" {...ctl(e('value'))} inputMode="numeric" value={edit.value} onChange={(ev) => setEdit({ ...edit, value: ev.target.value.replace(/[^\d.]/g, '') })} /></Field>
            {edit.kind === 'recurring' ? <Field id="cr-months" label="For how many months" error={e('months')}><input id="cr-months" {...ctl(e('months'))} inputMode="numeric" value={edit.months} onChange={(ev) => setEdit({ ...edit, months: ev.target.value.replace(/\D/g, '') })} /></Field> : <div />}
          </div>
          {edit.kind === 'campaign' ? (
            <div className="mk-three">
              <Field id="cr-campaign" label="Promotion code" error={e('campaign')}><select id="cr-campaign" {...ctl(e('campaign'), true)} value={edit.campaign} onChange={(ev) => setEdit({ ...edit, campaign: ev.target.value })}><option value="">Pick a code</option>{data.promos.filter((p) => p.status !== 'ended').map((p) => <option key={p.id} value={p.code}>{p.code}</option>)}</select></Field>
              <Field id="cr-from" label="From" error={e('from')}><input id="cr-from" type="date" {...ctl(e('from'))} value={edit.fromS} onChange={(ev) => setEdit({ ...edit, fromS: ev.target.value })} /></Field>
              <Field id="cr-to" label="To"><input id="cr-to" type="date" className="gc-input" value={edit.toS} onChange={(ev) => setEdit({ ...edit, toS: ev.target.value })} /></Field>
            </div>
          ) : null}
          {err && !err.field ? <FormError error={err.error} /> : null}
        </>) : (
          <div className="af-rules">
            {rules.map((r) => (
              <div key={r.id} className="af-rule">
                <span><b>{r.name}</b><small>{ruleText(r)} · {plural(users(r.id), 'affiliate')}{r.active ? '' : ' · off'}</small></span>
                {pick ? <button type="button" className="ix-btn ix-btn--sm" disabled={!r.active} onClick={() => pick(r.id)}>Use</button> : null}
                <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setEdit({ ...r, value: String(r.value), months: String(r.months || 1), fromS: r.from ? toDateInput(r.from) : '', toS: r.to ? toDateInput(r.to) : '' })}>Edit</button>
                <button type="button" role="switch" aria-checked={r.active} aria-label={`Turn ${r.name} on or off`} className="gc-switch" onClick={() => toggle(r)}><span className="gc-switch__knob" /></button>
              </div>
            ))}
          </div>
        )}

        <div className="af-calc" aria-label="Calculation preview">
          <span className="gc-label">Calculation preview</span>
          <div className="mk-two">
            {!edit ? <select className="gc-input gc-select" aria-label="Rule" value={calc.rule} onChange={(ev) => setCalc({ ...calc, rule: ev.target.value })}>{rules.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select> : null}
            <select className="gc-input gc-select" aria-label="Package" value={calc.ladder} onChange={(ev) => setCalc({ ...calc, ladder: ev.target.value })}>{LADDERS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}</select>
            <select className="gc-input gc-select" aria-label="Plan" value={calc.plan} onChange={(ev) => setCalc({ ...calc, plan: ev.target.value })}>{PLAN_KEYS.map((k) => <option key={k} value={k}>{PLAN_NAME[k]}</option>)}</select>
            <select className="gc-input gc-select" aria-label="Billing" value={calc.billing} onChange={(ev) => setCalc({ ...calc, billing: ev.target.value })}><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select>
          </div>
          <table>
            <thead><tr><th scope="col">Payment</th><th scope="col">Store pays</th><th scope="col">Commission</th></tr></thead>
            <tbody>{out.payments.map((p) => <tr key={p.n}><td>{calc.billing === 'yearly' ? 'Year 1' : 'Month ' + p.n}</td><td className="mk-data">{money(p.base)}</td><td>{money(p.amount)}</td></tr>)}</tbody>
            <tfoot><tr><td colSpan={2}>Total for one store</td><td>{money(out.total)}</td></tr></tfoot>
          </table>
          <p className="mk-note">{ruleText(rule)}. Commission waits {HOLD_DAYS} days after each payment (refund window), then it is due.</p>
        </div>
      </div>
    </Sheet>
  );
}

const STEPS = ['Pending', 'Approved', 'Paid'];
/** One payout and its next step. */
export function PayoutSheet({ id, data, t, onClose }) {
  const [paid, setPaid] = useState(null);   // { method, txn, error }
  const [rej, setRej] = useState(null);     // { reason, error } while rejecting
  const p = id ? data.payouts.find((x) => x.id === id) : null;
  if (!p) return null;
  const a = data.affiliates.find((x) => x.id === p.aff) || { name: p.aff };
  const items = data.commissions.filter((c) => p.items.includes(c.id));
  const me = currentStaff();
  const own = me.name === p.requestedBy;
  const canApprove = me.role === 'finance' || me.role === 'admin';
  const approve = async () => {
    if (!(await confirmDialog({ title: `Approve ${money(p.amount)} for ${a.name}?`, body: `Requested by ${p.requestedBy}. After approval Finance sends it by ${p.method}.`, confirmLabel: 'Approve' }))) return;
    const r = approvePayout(p.id);
    toast(r.ok ? 'Payout approved' : r.error, r.ok ? undefined : { tone: 'error' });
  };
  const doPaid = () => {
    const r = markPayoutPaid(p.id, { method: paid.method, txn: paid.txn });
    if (!r.ok) { setPaid({ ...paid, error: r.error }); return; }
    setPaid(null); toast(`${money(p.amount)} paid to ${a.name}`);
  };
  const doReject = () => {
    const r = rejectPayout(p.id, rej.reason);
    if (!r.ok) { setRej({ ...rej, error: r.error }); return; }
    setRej(null); toast('Payout rejected');
  };
  const stepAt = p.status === 'Rejected' ? -1 : STEPS.indexOf(p.status);
  return (
    <Sheet open title={`Payout ${p.id}`} onClose={() => { setPaid(null); setRej(null); onClose(); }} footer={
      rej ? <>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setRej(null)}>Back</button>
        <button type="button" className="gc-btn gc-btn--solid gc-btn--error" onClick={doReject}>Reject payout</button>
      </> : p.status === 'Pending' ? <>
        <button type="button" className="gc-btn gc-btn--flat" onClick={() => setRej({ reason: '', error: '' })}>Reject</button>
        <button type="button" className="gc-btn gc-btn--solid" onClick={approve} disabled={own || !canApprove} title={own ? 'You asked for it; someone else approves' : !canApprove ? 'Finance or an admin approves' : undefined}>Approve</button>
      </> : p.status === 'Approved' ? (paid ? <>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setPaid(null)}>Back</button>
        <button type="button" className="gc-btn gc-btn--solid" onClick={doPaid}>Mark paid</button>
      </> : <>
        <button type="button" className="gc-btn gc-btn--flat" onClick={() => setRej({ reason: '', error: '' })}>Reject</button>
        <button type="button" className="gc-btn gc-btn--solid" onClick={() => setPaid({ method: p.method, txn: '', error: '' })}>Record payment</button>
      </>) : <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Close</button>
    }>
      <div className="mk-form">
        <span className="mk-row"><StatusBadge tone={PAYOUT_STATUS[p.status]}>{p.status}</StatusBadge><b className="mk-fig">{money(p.amount)}</b><span className="mk-note">to <Link href={'/admin/affiliates/view?id=' + a.id}>{a.name}</Link></span></span>
        <ol className="af-steps" aria-label="Steps">
          {STEPS.map((s, i) => <li key={s} className={stepAt > i ? 'is-done' : stepAt === i ? 'is-now' : ''}><Icon name={stepAt > i ? 'circle-check' : 'circle'} width="14" height="14" aria-hidden="true" />{s}</li>)}
        </ol>
        {p.status === 'Pending' && own ? <div className="mk-banner mk-banner--warn"><Icon name="user-check" width="16" height="16" aria-hidden="true" /><p>You asked for this payout, so someone else must approve it.</p></div> : null}
        {p.status === 'Pending' && !own && !canApprove ? <div className="mk-banner mk-banner--warn"><Icon name="lock" width="16" height="16" aria-hidden="true" /><p>Finance or an admin approves payouts.</p></div> : null}
        {p.status === 'Rejected' ? <div className="mk-banner mk-banner--err"><Icon name="circle-x" width="16" height="16" aria-hidden="true" /><p>Rejected: {p.reason}. The commission is due again.</p></div> : null}
        <KV rows={[
          ['Requested', `${p.requestedBy} · ${dayTime(p.requestedAt)}`], p.approvedBy ? [p.status === 'Rejected' ? 'Decided' : 'Approved', `${p.approvedBy} · ${dayTime(p.approvedAt)}`] : null,
          ['Send by', `${p.method} · ${p.to || '—'}`], p.paidAt ? ['Paid', `${p.paidBy} · ${dayTime(p.paidAt)}`] : null,
          p.txn ? ['Transaction ID', <span key="x" className="mk-data">{p.txn}</span>] : null,
        ]} />
        {rej ? (
          <div className="mk-form">
            <p className="mk-sec">Reject this payout</p>
            <Field id="po-reason" label="Reason" error={rej.error} hint="The commission goes back to due; nothing is sent."><textarea id="po-reason" data-autofocus {...ctl(rej.error)} rows={3} value={rej.reason} onChange={(ev) => setRej({ reason: ev.target.value, error: '' })} /></Field>
          </div>
        ) : null}
        {paid ? (
          <div className="mk-form">
            <p className="mk-sec">Record the payment</p>
            <Field id="po-method" label="Paid by"><select id="po-method" className="gc-input gc-select" value={paid.method} onChange={(ev) => setPaid({ ...paid, method: ev.target.value })}>{PAY_METHODS.map((m) => <option key={m}>{m}</option>)}</select></Field>
            <Field id="po-txn" label="Transaction ID" error={paid.error} hint="From the bKash, Nagad or bank receipt. Each ID can be used once."><input id="po-txn" data-autofocus {...ctl(paid.error)} className={ctl(paid.error).className + ' mk-data'} value={paid.txn} onChange={(ev) => setPaid({ ...paid, txn: ev.target.value.toUpperCase(), error: '' })} /></Field>
          </div>
        ) : null}
        <p className="mk-sec">What it pays · {plural(items.length, 'line')}</p>
        <div className="mk-list">
          {items.map((c) => (
            <div key={c.id} className="mk-li" style={{ paddingLeft: 0, paddingRight: 0 }}>
              <span className="mk-li__main"><b>{c.kind === 'adjustment' ? c.note : storeLabel(c.store)}</b><small className="mk-sub">{c.kind === 'adjustment' ? 'Adjustment · ' + c.by : c.note + ' · ' + money(c.base) + ' paid'} · {dayTime(c.at).split(',')[0]}</small></span>
              <b className="mk-fig">{money(c.amount)}</b>
            </div>
          ))}
        </div>
      </div>
    </Sheet>
  );
}
/** "Smart Shop BD #0070" */
export const storeLabel = (id) => (id ? `${(platformDb().shops.find((s) => s.id === id) || { name: 'Store' }).name} #${id}` : '—');

/** Add a manual commission adjustment (bonus or deduction). */
export function AdjustSheet({ open, a, onClose }) {
  const [f, setF] = useState({ sign: '+', amount: '', reason: '' });
  const [err, setErr] = useState('');
  if (!open || !a) return null;
  const close = () => { setF({ sign: '+', amount: '', reason: '' }); setErr(''); onClose(); };
  const save = () => {
    const n = (f.sign === '-' ? -1 : 1) * Number(f.amount);
    const r = adjustCommission(a.id, n, f.reason);
    if (!r.ok) { setErr(r.error); return; }
    toast(`${n > 0 ? 'Bonus' : 'Deduction'} of ${money(Math.abs(n))} added`); close();
  };
  return (
    <Sheet open title={'Adjust commission · ' + a.name} onClose={close} footer={<>
      <button type="button" className="gc-btn gc-btn--neutral" onClick={close}>Cancel</button>
      <button type="button" className="gc-btn gc-btn--solid" onClick={save}>Add adjustment</button>
    </>}>
      <div className="mk-form">
        <div className="gc-seg" role="radiogroup" aria-label="Kind">{[['+', 'Bonus'], ['-', 'Deduction']].map(([k, l]) => <button key={k} type="button" role="radio" aria-checked={f.sign === k} className={'gc-seg__btn' + (f.sign === k ? ' gc-seg__btn--active' : '')} onClick={() => setF({ ...f, sign: k })}>{l}</button>)}</div>
        <Field id="adj-amount" label="Amount (৳)"><input id="adj-amount" data-autofocus className="gc-input mk-data" inputMode="numeric" value={f.amount} onChange={(ev) => { setF({ ...f, amount: ev.target.value.replace(/\D/g, '') }); setErr(''); }} /></Field>
        <Field id="adj-reason" label="Reason" hint="Shown on the commission line and the payout."><textarea id="adj-reason" className="gc-input" rows={3} value={f.reason} onChange={(ev) => { setF({ ...f, reason: ev.target.value }); setErr(''); }} /></Field>
        <FormError error={err} />
        <p className="mk-note">It is due at once and goes into the next payout (minimum {money(MIN_PAYOUT)}).</p>
      </div>
    </Sheet>
  );
}

export { COM_STATUS, num };
