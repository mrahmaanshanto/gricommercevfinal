'use client';
// Merchant 360° profile — every action sheet. MerchantProfile keeps `sheet = { kind, …params }` and draws
// <ActionSheets sheet ctx close />; a tab or the header calls ctx.open(kind, params).
//   edit · pay · plan · trial · grace · credits · module · manager · control · adjust · call · modtrial · item
// Each sheet calls one lib function, shows the error it returns next to the field it is about, and on success closes
// with a toast. Sensitive ones (suspend, cancel, pause, revoke, turning a module off, more grace, waiving a bill) take
// a reason and use the danger button.

import React, { useMemo, useState } from 'react';
import { Sheet } from '@/components/ui';
import { toast } from '@/runtime/ui';
import { DAY, dm, dhaka, daysBetween, taka } from '@/lib/platform/util';
import {
  PLAN_IDS, PLAN_NAME, LIMIT_KEYS, UNLIMITED, ADDONS, TRIALABLE, METHODS, VIA, REASONS, REASON_LABEL, CONTROL_REASONS,
  CATEGORIES, DISTRICTS, STAFF,
} from '@/lib/platform/catalogue';
import {
  recordPayment, changePlan, extendTrial, startModuleTrial, addItem, requestAdjustment, setControl, pauseStore,
  cancelStore, logCall, openInvoices, balance, planOf, priceOf, mrrOf, billItems, outcomeLabel,
} from '@/lib/platform/billing';
import { editMerchant, activateTrial, extendGrace, setModule, addCredits, assignManager, ownerOf, usageOf } from '@/lib/admin/merchants';
import { Field, ctl } from './profileShared';

const ok = (r) => r && r.ok;
/** Which field an error text is about (the libs return plain sentences). */
const fieldFor = (text, map) => { for (const [re, f] of map) if (re.test(text || '')) return f; return 'form'; };

function FormSheet({ id, title, close, onSubmit, submit, danger, error, children }) {
  return (
    <Sheet open title={title} onClose={close} footer={(
      <>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={close}>Cancel</button>
        <button type="submit" form={id} className={'gc-btn ' + (danger ? 'gc-btn--error' : 'gc-btn--solid')}>{submit}</button>
      </>
    )}>
      <form id={id} className="mp-form" noValidate onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        {children}
        {error && error.field === 'form' ? <p className="mp-formerr" role="alert">{error.text}</p> : null}
      </form>
    </Sheet>
  );
}
const errOf = (err, f) => (err && err.field === f ? err.text : null);

/** A reason picked from a list, with a note (needed when the pick is "Other"). Returns [element, text, check()]. */
function useReason(list, idp, err, label = 'Reason') {
  const [pick, setPick] = useState('');
  const [note, setNote] = useState('');
  const text = pick === 'Other' ? note.trim() : [pick, note.trim()].filter(Boolean).join(' · ');
  const el = (
    <>
      <Field id={idp + '-r'} label={label} error={errOf(err, 'reason')}>
        <select id={idp + '-r'} {...ctl(errOf(err, 'reason'), true)} value={pick} onChange={(e) => setPick(e.target.value)}>
          <option value="">Pick a reason</option>
          {list.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </Field>
      <Field id={idp + '-n'} label={pick === 'Other' ? 'Say why' : 'Note (optional)'} error={errOf(err, 'note')}>
        <textarea id={idp + '-n'} rows={2} {...ctl(errOf(err, 'note'))} value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
    </>
  );
  const check = () => (!pick ? { field: 'reason', text: 'Pick a reason.' } : pick === 'Other' && !note.trim() ? { field: 'note', text: 'Say why.' } : null);
  return [el, text, check];
}

// ---- change package: the simulation ---------------------------------------------------------------------------------
/** What moving to `plan` / `cycle` does to the monthly bill and the limits. */
export function simulate(db, shop, sub, t, plan, cycle) {
  const ladder = db.plans[sub.ladder];
  const live = ladder.versions.find((v) => v.v === ladder.live) || ladder.versions[ladder.versions.length - 1];
  const cur = planOf(db, sub);
  const curPlan = priceOf(db, sub, { kind: 'plan', code: sub.plan });
  const onBill = billItems(sub, t).some((it) => it.kind === 'plan');
  const others = Math.max(0, mrrOf(db, sub, t) - (onBill ? curPlan : 0));
  const np = live.plans[plan];
  const newPlan = cycle === 'yearly' ? Math.round(np.yearly / 12) : np.price;
  const before = others + curPlan;
  const after = others + newPlan;
  const days = sub.status === 'active' && sub.nextDue ? Math.max(0, daysBetween(t, sub.nextDue)) : 0;
  const prorated = plan === sub.plan ? 0 : Math.round(((np.price - cur.price) * days) / 30);
  const used = usageOf(db, shop, t).resources;
  const limits = LIMIT_KEYS.slice(0, 4).map(([k, label]) => ({ k, label, from: cur.limits[k], to: np.limits[k], used: (used.find((x) => x.key === k) || {}).used || 0 }));
  return { before, after, diff: after - before, prorated, days, same: plan === sub.plan && cycle === sub.cycle, limits, name: PLAN_NAME[plan], up: np.price > cur.price };
}
const lim = (n) => (n >= UNLIMITED ? 'Unlimited' : Number(n).toLocaleString('en-IN'));

/** Pick a plan and a cycle, see the new price and the difference, then confirm. Used in a sheet and on the tab. */
export function PlanSimulator({ ctx, initial, onDone, idp = 'ps' }) {
  const { db, t, shop, sub } = ctx;
  const [plan, setPlan] = useState(initial || sub.plan);
  const [cycle, setCycle] = useState(sub.cycle || 'monthly');
  const [err, setErr] = useState(null);
  const s = useMemo(() => simulate(db, shop, sub, t, plan, cycle), [db, shop, sub, t, plan, cycle]);
  const over = s.limits.filter((l) => l.to < UNLIMITED && l.used > l.to);
  const confirm = () => {
    const r = changePlan(shop.id, plan, cycle === sub.cycle ? undefined : cycle);
    if (!ok(r)) { setErr(r.error); return; }
    toast(`${shop.name} moved to ${s.name}${r.prorated ? ` · ${taka(r.prorated)} prorated on the next bill` : ''}`);
    setErr(null);
    if (onDone) onDone();
  };
  return (
    <div className="mp-form">
      <div className="mp-form__two">
        <Field id={idp + '-p'} label="Plan">
          <select id={idp + '-p'} {...ctl(null, true)} value={plan} onChange={(e) => { setPlan(e.target.value); setErr(null); }}>
            {PLAN_IDS.map((p) => <option key={p} value={p}>{PLAN_NAME[p]}{p === sub.plan ? ' (now)' : ''}</option>)}
          </select>
        </Field>
        <Field id={idp + '-c'} label="Billing">
          <select id={idp + '-c'} {...ctl(null, true)} value={cycle} onChange={(e) => { setCycle(e.target.value); setErr(null); }}>
            <option value="monthly">Monthly</option><option value="yearly">Yearly (counted a month)</option>
          </select>
        </Field>
      </div>
      <dl className="mp-sum" aria-live="polite">
        <dt>Now</dt><dd>{taka(s.before)} a month</dd>
        <dt>On {s.name}</dt><dd>{taka(s.after)} a month</dd>
        <dt className="is-total">Difference</dt><dd className="is-total">{s.diff > 0 ? '+' : ''}{taka(s.diff)}</dd>
        {s.prorated ? <><dt>Next bill, for the {s.days} days left</dt><dd>{s.prorated > 0 ? '+' : ''}{taka(s.prorated)}</dd></> : null}
        {s.limits.map((l) => (l.from === l.to ? null : <React.Fragment key={l.k}><dt>{l.label}</dt><dd>{lim(l.from)} → {lim(l.to)}</dd></React.Fragment>))}
      </dl>
      {over.length ? <p className="mp-warn">The store uses more than {s.name} allows: {over.map((l) => `${l.label.toLowerCase()} ${lim(l.used)} of ${lim(l.to)}`).join(', ')}.</p> : null}
      {err ? <p className="mp-formerr" role="alert">{err}</p> : null}
      <div><button type="button" className="gc-btn gc-btn--solid" disabled={s.same} onClick={confirm}>{s.same ? 'Pick another plan' : `Move to ${s.name}${cycle !== sub.cycle ? ' · ' + cycle : ''}`}</button></div>
    </div>
  );
}

function PlanSheet({ ctx, close, plan }) {
  return (
    <Sheet open title="Change package" onClose={close}>
      <PlanSimulator ctx={ctx} initial={plan} onDone={close} idp="pls" />
    </Sheet>
  );
}

// ---- edit details -----------------------------------------------------------------------------------------------------
function EditSheet({ ctx, close }) {
  const { shop } = ctx;
  const o = ownerOf(shop);
  const [f, setF] = useState({ name: shop.name || '', legal: shop.legal || '', cat: shop.cat || '', dist: shop.dist || '', address: shop.address || '', owner: o.name, phone: o.phone, email: o.email, am: shop.am || '' });
  const [err, setErr] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = () => {
    if (!f.owner.trim()) { setErr({ field: 'owner', text: 'Enter the owner’s name.' }); return; }
    if (f.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) { setErr({ field: 'email', text: 'Check the email address.' }); return; }
    const r = editMerchant(shop.id, { ...f, name: f.name.trim(), owner: f.owner.trim(), email: f.email.trim(), am: f.am || null });
    if (!ok(r)) { setErr({ field: r.field || 'form', text: r.error }); return; }
    toast(r.changed && r.changed.length ? 'Details saved' : 'Nothing changed');
    close();
  };
  const text = (k, label, type = 'text', more = {}) => (
    <Field id={'ed-' + k} label={label} error={errOf(err, k)}>
      <input id={'ed-' + k} type={type} {...ctl(errOf(err, k))} value={f[k]} onChange={set(k)} {...more} />
    </Field>
  );
  return (
    <FormSheet id="mp-edit" title="Edit details" close={close} onSubmit={submit} submit="Save" error={err}>
      {text('name', 'Store name')}
      {text('legal', 'Legal name')}
      <div className="mp-form__two">
        <Field id="ed-cat" label="Category"><select id="ed-cat" {...ctl(null, true)} value={f.cat} onChange={set('cat')}>{[...new Set([f.cat, ...CATEGORIES])].filter(Boolean).map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field id="ed-dist" label="District"><select id="ed-dist" {...ctl(null, true)} value={f.dist} onChange={set('dist')}>{[...new Set([f.dist, ...DISTRICTS])].filter(Boolean).map((c) => <option key={c}>{c}</option>)}</select></Field>
      </div>
      {text('address', 'Address')}
      {text('owner', 'Owner')}
      <div className="mp-form__two">
        {text('phone', 'Owner’s phone', 'tel', { inputMode: 'tel' })}
        {text('email', 'Owner’s email', 'email')}
      </div>
      <Field id="ed-am" label="Account manager">
        <select id="ed-am" {...ctl(null, true)} value={f.am} onChange={set('am')}>
          <option value="">Nobody yet</option>
          {STAFF.filter((s) => !s.invite && !s.inactive).map((s) => <option key={s.id} value={s.name}>{s.name} · {s.title}</option>)}
        </select>
      </Field>
    </FormSheet>
  );
}

// ---- record a payment --------------------------------------------------------------------------------------------------
function PaySheet({ ctx, close, invoiceId }) {
  const { db, t, shop } = ctx;
  const open = openInvoices(db, shop.id);
  const first = open.find((i) => i.id === invoiceId) || open[0];
  const [f, setF] = useState({ invoiceId: first ? first.id : '', amount: first ? String(balance(db, first)) : '', method: 'bKash', txId: '', via: 'call' });
  const [err, setErr] = useState(null);
  const set = (k) => (e) => { setErr(null); const v = e.target.value; if (k === 'invoiceId') { const inv = open.find((i) => i.id === v); setF({ ...f, invoiceId: v, amount: inv ? String(balance(db, inv)) : f.amount }); } else setF({ ...f, [k]: v }); };
  if (!open.length) {
    return <Sheet open title="Record payment" onClose={close}><p className="mp-empty">Nothing is owed: every bill is paid.</p></Sheet>;
  }
  const cash = f.method === 'Cash at office';
  const submit = () => {
    const r = recordPayment({ invoiceId: f.invoiceId, amount: f.amount, method: f.method, txId: cash ? '' : f.txId, via: f.via });
    if (!ok(r)) { setErr({ field: fieldFor(r.error, [[/transaction/i, 'txId'], [/amount|more than/i, 'amount'], [/bill/i, 'invoiceId']]), text: r.error }); return; }
    toast(`${taka(r.payment.amount)} recorded on ${r.payment.invoiceId}${r.restored ? ' · access restored' : r.left ? ` · ${taka(r.left)} still owed` : ''}`);
    close();
  };
  return (
    <FormSheet id="mp-pay" title="Record payment" close={close} onSubmit={submit} submit="Record payment" error={err}>
      <Field id="py-inv" label="Bill" error={errOf(err, 'invoiceId')}>
        <select id="py-inv" {...ctl(errOf(err, 'invoiceId'), true)} value={f.invoiceId} onChange={set('invoiceId')}>
          {open.map((i) => <option key={i.id} value={i.id}>{i.id} · {taka(balance(db, i))} · {daysBetween(i.dueAt, t) > 0 ? 'overdue' : 'due ' + dm(i.dueAt)}</option>)}
        </select>
      </Field>
      <div className="mp-form__two">
        <Field id="py-amt" label="Amount (৳)" error={errOf(err, 'amount')}>
          <input id="py-amt" type="number" inputMode="numeric" min="1" {...ctl(errOf(err, 'amount'))} value={f.amount} onChange={set('amount')} />
        </Field>
        <Field id="py-m" label="Method"><select id="py-m" {...ctl(null, true)} value={f.method} onChange={set('method')}>{METHODS.map((m) => <option key={m}>{m}</option>)}</select></Field>
      </div>
      {cash ? null : (
        <Field id="py-tx" label="Transaction ID" error={errOf(err, 'txId')} hint={`From the ${f.method} message. Each ID is used once.`}>
          <input id="py-tx" className={ctl(errOf(err, 'txId')).className + ' mp-data'} aria-invalid={errOf(err, 'txId') ? true : undefined} autoComplete="off" value={f.txId} onChange={set('txId')} />
        </Field>
      )}
      <Field id="py-via" label="How it came in"><select id="py-via" {...ctl(null, true)} value={f.via} onChange={set('via')}>{VIA.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
    </FormSheet>
  );
}

// ---- trials, grace, credits, manager -------------------------------------------------------------------------------
function TrialSheet({ ctx, close }) {
  const { shop, st } = ctx;
  const extend = st.key === 'trial';
  const [days, setDays] = useState(extend ? '7' : '15');
  const [err, setErr] = useState(null);
  const submit = () => {
    const r = extend ? extendTrial(shop.id, Number(days)) : activateTrial(shop.id, Number(days));
    if (!ok(r)) { setErr({ field: 'form', text: r.error }); return; }
    toast(extend ? `Trial extended by ${days} days` : `${days}-day trial started`);
    close();
  };
  return (
    <FormSheet id="mp-trial" title={extend ? 'Extend trial' : 'Activate trial'} close={close} onSubmit={submit} submit={extend ? 'Extend trial' : 'Start trial'} error={err}>
      {extend ? <p className="mp-muted" style={{ margin: 0 }}>{st.left > 0 ? `${st.left} day${st.left === 1 ? '' : 's'} left now.` : 'The trial ends today.'} The first bill moves with it.</p> : null}
      <Field id="tr-d" label={extend ? 'Add' : 'Length'}>
        <select id="tr-d" {...ctl(null, true)} value={days} onChange={(e) => setDays(e.target.value)}>{['3', '7', '15', '30'].map((d) => <option key={d} value={d}>{d} days</option>)}</select>
      </Field>
    </FormSheet>
  );
}

const GRACE_REASONS = ['Promised to pay', 'Payment on the way', 'Outage on our side', 'Owner asked', 'Other'];
function GraceSheet({ ctx, close }) {
  const { db, t, shop } = ctx;
  const [days, setDays] = useState('7');
  const [err, setErr] = useState(null);
  const [reasonEl, reason, check] = useReason(GRACE_REASONS, 'gr', err);
  const late = openInvoices(db, shop.id).filter((i) => i.dueAt < t + DAY);
  const submit = () => {
    const c = check(); if (c) { setErr(c); return; }
    const r = extendGrace(shop.id, days, reason);
    if (!ok(r)) { setErr({ field: 'form', text: r.error }); return; }
    toast(`Grace extended by ${r.days} days`);
    close();
  };
  return (
    <FormSheet id="mp-grace" title="Extend grace" close={close} onSubmit={submit} submit="Extend grace" danger error={err}>
      <p className="mp-danger">{late.length ? `${late.map((i) => i.id).join(', ')} move${late.length === 1 ? 's' : ''} their due date on, so read-only and suspension come later. The money is still owed.` : 'Nothing is overdue.'}</p>
      <Field id="gr-d" label="Days"><select id="gr-d" {...ctl(null, true)} value={days} onChange={(e) => setDays(e.target.value)}>{['3', '7', '14'].map((d) => <option key={d} value={d}>{d} days</option>)}</select></Field>
      {reasonEl}
    </FormSheet>
  );
}

const CREDIT_REASONS = ['Paid by the owner', 'Goodwill', 'Promotion', 'Outage credit', 'Other'];
function CreditsSheet({ ctx, close }) {
  const { shop } = ctx;
  const [amount, setAmount] = useState('');
  const [err, setErr] = useState(null);
  const [reasonEl, reason, check] = useReason(CREDIT_REASONS, 'cr', err);
  const submit = () => {
    const n = Math.round(Number(amount) || 0);
    if (n <= 0) { setErr({ field: 'amount', text: 'Enter an amount.' }); return; }
    const c = check(); if (c) { setErr(c); return; }
    const r = addCredits(shop.id, n, reason);
    if (!ok(r)) { setErr({ field: fieldFor(r.error, [[/amount/i, 'amount']]), text: r.error }); return; }
    toast(`${taka(n)} credits added`);
    close();
  };
  return (
    <FormSheet id="mp-credits" title="Add credits" close={close} onSubmit={submit} submit="Add credits" error={err}>
      <Field id="cr-a" label="Amount (৳)" error={errOf(err, 'amount')} hint="SMS, WhatsApp, email and AI replies are paid from these credits.">
        <input id="cr-a" type="number" inputMode="numeric" min="1" {...ctl(errOf(err, 'amount'))} value={amount} onChange={(e) => { setAmount(e.target.value); setErr(null); }} />
      </Field>
      <div className="ix-chips" role="group" aria-label="Quick amounts">
        {[500, 1000, 2000, 5000].map((n) => <button key={n} type="button" className="ix-chip" aria-pressed={Number(amount) === n} onClick={() => setAmount(String(n))}>{taka(n)}</button>)}
      </div>
      {reasonEl}
    </FormSheet>
  );
}

function ManagerSheet({ ctx, close }) {
  const { shop } = ctx;
  const [name, setName] = useState(shop.am || '');
  const submit = () => {
    if ((shop.am || '') === name) { close(); return; }
    assignManager(shop.id, name || null);
    toast(name ? `${name} manages ${shop.name}` : 'Account manager removed');
    close();
  };
  return (
    <FormSheet id="mp-am" title="Assign account manager" close={close} onSubmit={submit} submit="Save">
      <Field id="am-n" label="Account manager">
        <select id="am-n" {...ctl(null, true)} value={name} onChange={(e) => setName(e.target.value)}>
          <option value="">Nobody</option>
          {STAFF.filter((s) => !s.invite && !s.inactive).map((s) => <option key={s.id} value={s.name}>{s.name} · {s.title}</option>)}
        </select>
      </Field>
    </FormSheet>
  );
}

// ---- modules ------------------------------------------------------------------------------------------------------------
const MODULE_REASONS = ['Owner asked', 'Sales offer', 'Support fix', 'Misuse', 'Other'];
function ModuleSheet({ ctx, close, code, name, on }) {
  const { shop } = ctx;
  const [err, setErr] = useState(null);
  const [reasonEl, reason, check] = useReason(MODULE_REASONS, 'md', err);
  const submit = () => {
    const c = check(); if (c) { setErr(c); return; }
    const r = setModule(shop.id, code, on, reason);
    if (!ok(r)) { setErr({ field: 'form', text: r.error }); return; }
    toast(`${name} turned ${on ? 'on' : 'off'} for ${shop.name}`);
    close();
  };
  return (
    <FormSheet id="mp-mod" title={`Turn ${name} ${on ? 'on' : 'off'}`} close={close} onSubmit={submit} submit={on ? 'Turn on' : 'Turn off'} danger={!on} error={err}>
      <p className={on ? 'mp-warn' : 'mp-danger'}>{on ? 'Only this store gets it, whatever its package says. It is not added to the bill.' : 'The store loses this module at once, whatever its package says. Its data is kept.'}</p>
      {reasonEl}
    </FormSheet>
  );
}

function ModTrialSheet({ ctx, close }) {
  const { shop } = ctx;
  const [f, setF] = useState({ code: TRIALABLE[0].code, days: '14', autoAdd: true, reason: '' });
  const [err, setErr] = useState(null);
  const opt = TRIALABLE.find((o) => o.code === f.code) || TRIALABLE[0];
  const submit = () => {
    const r = startModuleTrial(shop.id, { code: opt.code, label: opt.label, days: Number(f.days), reason: f.reason.trim(), autoAdd: f.autoAdd, price: opt.price });
    if (!ok(r)) { setErr({ field: 'form', text: r.error }); return; }
    toast(r.extended ? `${r.trial.name} trial extended` : `${r.trial.name} trial started for ${f.days} days`);
    close();
  };
  return (
    <FormSheet id="mp-mt" title="Start a module trial" close={close} onSubmit={submit} submit="Start trial" error={err}>
      <Field id="mt-c" label="Module"><select id="mt-c" {...ctl(null, true)} value={f.code} onChange={(e) => { setF({ ...f, code: e.target.value }); setErr(null); }}>{TRIALABLE.map((o) => <option key={o.code} value={o.code}>{o.label} · {taka(o.price)} a month</option>)}</select></Field>
      <Field id="mt-d" label="Length"><select id="mt-d" {...ctl(null, true)} value={f.days} onChange={(e) => setF({ ...f, days: e.target.value })}>{['7', '14', '30'].map((d) => <option key={d} value={d}>{d} days</option>)}</select></Field>
      <label className="mp-form__check"><input type="checkbox" className="gc-check" checked={f.autoAdd} onChange={(e) => setF({ ...f, autoAdd: e.target.checked })} />Add it to the bill at {taka(opt.price)} a month when the trial ends</label>
      <Field id="mt-r" label="Why (optional)"><input id="mt-r" {...ctl(null)} value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} /></Field>
    </FormSheet>
  );
}

function ItemSheet({ ctx, close }) {
  const { shop } = ctx;
  const [code, setCode] = useState(ADDONS[0].code);
  const a = ADDONS.find((x) => x.code === code) || ADDONS[0];
  const [price, setPrice] = useState(String(ADDONS[0].price));
  const [err, setErr] = useState(null);
  const submit = () => {
    const r = addItem(shop.id, { code: a.code, name: a.name, price, period: a.period });
    if (!ok(r)) { setErr({ field: fieldFor(r.error, [[/price|under/i, 'price']]), text: r.error }); return; }
    toast(`${a.name} added to the bill`);
    close();
  };
  return (
    <FormSheet id="mp-item" title="Add a module or item" close={close} onSubmit={submit} submit="Add to the bill" error={err}>
      <Field id="it-c" label="Item"><select id="it-c" {...ctl(null, true)} value={code} onChange={(e) => { const x = ADDONS.find((y) => y.code === e.target.value); setCode(e.target.value); setPrice(String(x.price)); setErr(null); }}>{ADDONS.map((x) => <option key={x.code} value={x.code}>{x.label} · {x.period === 'Once' ? 'once' : 'monthly'}</option>)}</select></Field>
      <Field id="it-p" label="Price (৳)" error={errOf(err, 'price')} hint={`List price ${taka(a.price)}. More than 20% off goes through a discount instead.`}>
        <input id="it-p" type="number" inputMode="numeric" min="1" {...ctl(errOf(err, 'price'))} value={price} onChange={(e) => { setPrice(e.target.value); setErr(null); }} />
      </Field>
    </FormSheet>
  );
}

// ---- store controls --------------------------------------------------------------------------------------------------------
const CONTROLS = {
  suspend: { title: 'Suspend store', submit: 'Suspend', danger: true, warn: 'The admin and the storefront go off at once. Nothing is deleted; reactivate any time.', reasons: CONTROL_REASONS, done: 'Store suspended', run: (id, r) => setControl(id, 'suspended', r) },
  unsuspend: { title: 'Reactivate store', submit: 'Reactivate', warn: 'The admin and the storefront come back at once.', reasons: ['Paid', 'Issue solved', 'Suspended by mistake', 'Other'], done: 'Store reactivated', run: (id, r) => setControl(id, null, r) },
  pause: { title: 'Pause store', submit: 'Pause', danger: true, warn: 'The storefront closes and no bills are issued until the store is resumed.', reasons: CONTROL_REASONS, done: 'Store paused', run: (id, r) => pauseStore(id, r) },
  cancel: { title: 'Cancel store', submit: 'Cancel store', danger: true, warn: 'Billing stops and the store closes. The data is kept and the owner can export it; you can restore it later.', reasons: CONTROL_REASONS, done: 'Store cancelled', run: (id, r) => cancelStore(id, r) },
  revoke: { title: 'Revoke licence', submit: 'Revoke licence', danger: true, warn: 'The licence stops working: the store is suspended (admin and storefront off) until it is reactivated.', reasons: CONTROL_REASONS, done: 'Licence revoked · store suspended', run: (id, r) => setControl(id, 'suspended', 'Licence revoked · ' + r) },
};
function ControlSheet({ ctx, close, action }) {
  const c = CONTROLS[action] || CONTROLS.suspend;
  const [err, setErr] = useState(null);
  const [reasonEl, reason, check] = useReason(c.reasons, 'ct', err);
  const submit = () => {
    const x = check(); if (x) { setErr(x); return; }
    const r = c.run(ctx.shop.id, reason);
    if (!ok(r)) { setErr({ field: 'reason', text: r.error }); return; }
    toast(c.done);
    close();
  };
  return (
    <FormSheet id="mp-ctl" title={c.title} close={close} onSubmit={submit} submit={c.submit} danger={c.danger} error={err}>
      <p className={c.danger ? 'mp-danger' : 'mp-warn'}>{c.warn}</p>
      {reasonEl}
    </FormSheet>
  );
}

// ---- adjustments and calls --------------------------------------------------------------------------------------------------
const ADJ_TYPES = [['credit', 'Credit note on a bill'], ['discount', 'Discount on the next bill'], ['charge', 'Extra charge on the next bill'], ['waive', 'Waive what is left on a bill']];
function AdjustSheet({ ctx, close, type: type0, invoiceId: inv0 }) {
  const { db, shop } = ctx;
  const bills = db.invoices.filter((i) => i.shopId === shop.id && !i.noCharge && !i.voided).sort((a, b) => b.issuedAt - a.issuedAt);
  const [f, setF] = useState({ type: type0 || 'credit', invoiceId: inv0 || (bills[0] ? bills[0].id : ''), amount: '', pct: '', reason: '', note: '' });
  const [err, setErr] = useState(null);
  const set = (k) => (e) => { setErr(null); setF({ ...f, [k]: e.target.value }); };
  const onBill = f.type === 'credit' || f.type === 'waive';
  const inv = bills.find((i) => i.id === f.invoiceId);
  const threshold = (db.settings || {}).adjThreshold || 500;
  const submit = () => {
    const r = requestAdjustment({ shopId: shop.id, invoiceId: onBill ? f.invoiceId : 'next', type: f.type, amount: f.type === 'waive' ? 0 : f.amount, pct: f.type === 'discount' ? f.pct : null, reason: f.reason, note: f.note });
    if (!ok(r)) { setErr({ field: fieldFor(r.error, [[/reason/i, 'reason'], [/amount|percent|more than/i, 'amount'], [/bill/i, 'invoiceId'], [/note/i, 'note']]), text: r.error }); return; }
    const a = r.adjustment;
    toast(a.status === 'approved' ? `${a.id} applied${a.cnId ? ' · ' + a.cnId + ' issued' : ''}` : `${a.id} sent for a second approval`);
    close();
  };
  return (
    <FormSheet id="mp-adj" title="Request adjustment" close={close} onSubmit={submit} submit={f.type === 'waive' ? 'Ask to waive' : 'Request'} danger={f.type === 'waive'} error={err}>
      <Field id="aj-t" label="Type"><select id="aj-t" {...ctl(null, true)} value={f.type} onChange={set('type')}>{ADJ_TYPES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
      {onBill ? (
        <Field id="aj-i" label="Bill" error={errOf(err, 'invoiceId')}>
          <select id="aj-i" {...ctl(errOf(err, 'invoiceId'), true)} value={f.invoiceId} onChange={set('invoiceId')}>
            {bills.length ? bills.map((i) => <option key={i.id} value={i.id}>{i.id} · {taka(i.total)}{balance(db, i) ? ` · ${taka(balance(db, i))} owed` : ' · paid'}</option>) : <option value="">No bills yet</option>}
          </select>
        </Field>
      ) : null}
      {f.type === 'waive' ? (
        <p className="mp-danger">{inv && balance(db, inv) ? `${taka(balance(db, inv))} left on ${inv.id} is written off with a credit note. Only an Admin can ask.` : 'Nothing is left to pay on this bill.'}</p>
      ) : (
        <div className="mp-form__two">
          <Field id="aj-a" label="Amount (৳)" error={errOf(err, 'amount')}><input id="aj-a" type="number" inputMode="numeric" min="1" {...ctl(errOf(err, 'amount'))} value={f.amount} onChange={set('amount')} /></Field>
          {f.type === 'discount' ? <Field id="aj-p" label="or percent"><input id="aj-p" type="number" inputMode="numeric" min="1" max="100" {...ctl(null)} value={f.pct} onChange={set('pct')} /></Field> : null}
        </div>
      )}
      <Field id="aj-r" label="Reason code" error={errOf(err, 'reason')}>
        <select id="aj-r" {...ctl(errOf(err, 'reason'), true)} value={f.reason} onChange={set('reason')}>
          <option value="">Pick a reason</option>
          {REASONS.map((r) => <option key={r} value={r}>{REASON_LABEL[r]}</option>)}
        </select>
      </Field>
      <Field id="aj-n" label="Note the owner sees" error={errOf(err, 'note')}><textarea id="aj-n" rows={2} {...ctl(errOf(err, 'note'))} value={f.note} onChange={set('note')} /></Field>
      <p className="mp-muted" style={{ margin: 0 }}>Up to {taka(threshold)} it applies at once. Above that a second person (Finance or an Admin) approves it, never the one who asked.</p>
    </FormSheet>
  );
}

const OUTCOMES = ['paid', 'promised', 'panel', 'noanswer', 'later', 'dispute'];
function CallSheet({ ctx, close }) {
  const { db, shop } = ctx;
  const open = openInvoices(db, shop.id);
  const [f, setF] = useState({ invoiceId: open[0] ? open[0].id : '', outcome: 'promised', note: '', promise: '' });
  const [err, setErr] = useState(null);
  const set = (k) => (e) => { setErr(null); setF({ ...f, [k]: e.target.value }); };
  const submit = () => {
    if (f.outcome === 'promised' && !f.promise) { setErr({ field: 'promise', text: 'Pick the day they promised.' }); return; }
    let promiseAt = null;
    if (f.promise) { const [y, m, d] = f.promise.split('-').map(Number); promiseAt = dhaka(y, m - 1, d, 12); }
    const r = logCall({ shopId: shop.id, invoiceId: f.invoiceId || null, outcome: f.outcome, note: f.note.trim() || outcomeLabel(f.outcome), promiseAt });
    if (!ok(r)) { setErr({ field: 'form', text: r.error || 'The call could not be saved.' }); return; }
    toast('Call logged');
    close();
  };
  return (
    <FormSheet id="mp-call" title="Log a call" close={close} onSubmit={submit} submit="Log call" error={err}>
      <Field id="cl-i" label="About"><select id="cl-i" {...ctl(null, true)} value={f.invoiceId} onChange={set('invoiceId')}><option value="">No bill</option>{open.map((i) => <option key={i.id} value={i.id}>{i.id} · {taka(balance(db, i))}</option>)}</select></Field>
      <Field id="cl-o" label="Outcome"><select id="cl-o" {...ctl(null, true)} value={f.outcome} onChange={set('outcome')}>{OUTCOMES.map((o) => <option key={o} value={o}>{outcomeLabel(o)}</option>)}</select></Field>
      {f.outcome === 'promised' ? <Field id="cl-p" label="Promised to pay on" error={errOf(err, 'promise')}><input id="cl-p" type="date" {...ctl(errOf(err, 'promise'))} value={f.promise} onChange={set('promise')} /></Field> : null}
      <Field id="cl-n" label="Note (optional)"><textarea id="cl-n" rows={2} {...ctl(null)} value={f.note} onChange={set('note')} /></Field>
    </FormSheet>
  );
}

const SHEETS = { edit: EditSheet, pay: PaySheet, plan: PlanSheet, trial: TrialSheet, grace: GraceSheet, credits: CreditsSheet, module: ModuleSheet, manager: ManagerSheet, control: ControlSheet, adjust: AdjustSheet, call: CallSheet, modtrial: ModTrialSheet, item: ItemSheet };

/** The open action sheet, if any. */
export function ActionSheets({ sheet, ctx, close }) {
  if (!sheet) return null;
  const S = SHEETS[sheet.kind];
  if (!S) return null;
  return <S key={sheet.n} ctx={ctx} close={close} {...sheet} />;
}
