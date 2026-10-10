'use client';
// The lead page's side panels (LeadView.jsx keeps sheet = { kind, …params } and draws <LeadSheets sheet l t close />):
//   followup · task · quote · meeting · meetingDone · owner · stage · convert
// Each one calls one lib/admin/crm.js function, shows its error next to the field it names, and closes with a toast.
// Convert to merchant is prefilled from the lead and runs lib/platform/shops.js › provisionStore through
// crm.convertToMerchant (store, owner, trial or paid subscription, setup run); the lead becomes Won with the store id.

import React, { useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet } from '@/components/ui';
import { formatBDT } from '@/lib/format';
import { DAY, startOfDay } from '@/lib/platform/util';
import { LADDERS, PLAN_NAME, ADDONS, CATEGORIES as P_CATS, DISTRICTS as P_DISTRICTS, SOURCES as P_SOURCES, ONBOARDERS, TRIAL_DAYS } from '@/lib/platform/catalogue';
import { subdomainFree } from '@/lib/platform/shops';
import {
  STAGES, SALES_NAMES, MEETING_KINDS, INTEREST_MODULES, PLANS, PLAN_PRICE, stageOf, stageIndex, priceFor, quoteTotal, addonCodes, platformSource, segsOf,
  setNext, addTask, addQuote, scheduleMeeting, completeMeeting, updateLead, moveStage, convertToMerchant,
} from '@/lib/admin/crm';
import { usePlatform } from '../AdminShell';
import { Field, ctl, focusField, toInput, toDateInput, fromInput, ModulePicker, money, dateTime } from './crmShared';

/** A sheet with a form: Cancel + the submit button in the footer; a form-wide error under the fields. */
function FormSheet({ id, title, close, onSubmit, submit, danger, error, children, wide }) {
  return (
    <Sheet open title={title} onClose={close} footer={<>
      <button type="button" className="gc-btn gc-btn--neutral" onClick={close}>Cancel</button>
      <button type="submit" form={id} className={'gc-btn ' + (danger ? 'gc-btn--error' : 'gc-btn--solid')}>{submit}</button>
    </>}>
      <form id={id} className={'crm-form' + (wide ? ' lv-sheet--wide' : '')} noValidate onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        {children}
        {error && (!error.field || error.field === 'form') ? <p className="crm-formerr" role="alert">{error.error}</p> : null}
      </form>
    </Sheet>
  );
}
const errOf = (err, f) => (err && err.field === f ? err.error : null);
const tomorrowAt = (t, h) => startOfDay(t) + DAY + h * 3600e3;

// ---- follow-up -----------------------------------------------------------------------------------------------------
function FollowSheet({ l, t, close }) {
  const [at, setAt] = useState(toInput(l.next ? l.next.at : tomorrowAt(t, 11)));
  const [what, setWhat] = useState(l.next ? l.next.what : stageOf(l.stage).next || 'Follow up');
  const [err, setErr] = useState(null);
  const save = () => {
    const ms = fromInput(at);
    if (!Number.isFinite(ms)) { setErr({ field: 'at', error: 'Pick a date and time.' }); return; }
    const r = setNext(l.id, { at: ms, what });
    if (!r.ok) { setErr(r); return; }
    toast('Follow-up set for ' + dateTime(ms));
    close();
  };
  const clear = () => { const r = setNext(l.id, null); if (r.ok) { toast('Follow-up cleared'); close(); } };
  return (
    <FormSheet id="lv-follow" title="Next follow-up" close={close} onSubmit={save} submit="Save" error={err}>
      <Field id="lv-follow-at" label="When" error={errOf(err, 'at')}><input id="lv-follow-at" type="datetime-local" {...ctl(errOf(err, 'at'))} value={at} onChange={(e) => setAt(e.target.value)} data-autofocus /></Field>
      <Field id="lv-follow-what" label="To do"><input id="lv-follow-what" className="gc-input" value={what} onChange={(e) => setWhat(e.target.value)} /></Field>
      {l.next ? <div><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={clear}>Clear the follow-up</button></div> : null}
    </FormSheet>
  );
}

// ---- task ------------------------------------------------------------------------------------------------------------
function TaskSheet({ l, t, close }) {
  const [f, setF] = useState({ title: '', due: toDateInput(tomorrowAt(t, 17)), owner: l.owner });
  const [err, setErr] = useState(null);
  const save = () => {
    const r = addTask(l.id, { title: f.title, due: fromInput(f.due), owner: f.owner });
    if (!r.ok) { setErr(r); if (r.field) focusField('lv-task-' + r.field); return; }
    toast(`Task added for ${r.task.owner}`);
    close();
  };
  return (
    <FormSheet id="lv-task" title="Add task" close={close} onSubmit={save} submit="Add task" error={err}>
      <Field id="lv-task-title" label="What needs doing" error={errOf(err, 'title')}><input id="lv-task-title" {...ctl(errOf(err, 'title'))} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Send the pricing PDF" data-autofocus /></Field>
      <div className="crm-two">
        <Field id="lv-task-due" label="Due" error={errOf(err, 'due')}><input id="lv-task-due" type="date" {...ctl(errOf(err, 'due'))} value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} /></Field>
        <Field id="lv-task-owner" label="Who"><select id="lv-task-owner" className="gc-input gc-select" value={f.owner} onChange={(e) => setF({ ...f, owner: e.target.value })}>{SALES_NAMES.map((n) => <option key={n}>{n}</option>)}</select></Field>
      </div>
    </FormSheet>
  );
}

// ---- quotation --------------------------------------------------------------------------------------------------------
function QuoteSheet({ l, t, close }) {
  const [f, setF] = useState({ ladder: l.ladder, plan: l.plan, modules: l.modules.slice(), price: '', discount: '0', valid: toDateInput(startOfDay(t) + 14 * DAY + 17 * 3600e3), note: '' });
  const [err, setErr] = useState(null);
  const auto = priceFor(f.plan, f.modules);
  const price = f.price === '' ? auto : Number(f.price);
  const q = { price, discount: Number(f.discount) || 0 };
  const set = (k) => (v) => { setF((o) => ({ ...o, [k]: v && v.target ? v.target.value : v })); if (err && err.field === k) setErr(null); };
  const save = (status) => {
    const r = addQuote(l.id, { ladder: f.ladder, plan: f.plan, modules: f.modules, price, discount: f.discount, validUntil: fromInput(f.valid), note: f.note, status });
    if (!r.ok) { setErr(r); if (r.field) focusField('lv-q-' + r.field); return; }
    toast(`${r.quote.id} ${status === 'sent' ? 'sent' : 'saved as a draft'}${status === 'sent' && stageIndex(l.stage) < stageIndex('proposal') ? ' · moved to Proposal sent' : ''}`);
    close();
  };
  return (
    <Sheet open title="Create quotation" onClose={close} footer={<>
      <button type="button" className="gc-btn gc-btn--neutral" onClick={() => save('draft')}>Save draft</button>
      <button type="submit" form="lv-quote" className="gc-btn gc-btn--solid">Send quotation</button>
    </>}>
      <form id="lv-quote" className="crm-form" noValidate onSubmit={(e) => { e.preventDefault(); save('sent'); }}>
        <div className="crm-two">
          <Field id="lv-q-ladder" label="Package" error={errOf(err, 'ladder')}><select id="lv-q-ladder" {...ctl(errOf(err, 'ladder'), true)} value={f.ladder} onChange={set('ladder')} data-autofocus>{LADDERS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select></Field>
          <Field id="lv-q-plan" label="Plan" error={errOf(err, 'plan')}><select id="lv-q-plan" {...ctl(errOf(err, 'plan'), true)} value={f.plan} onChange={set('plan')}>{PLANS.map((p) => <option key={p} value={p}>{PLAN_NAME[p]} · {formatBDT(PLAN_PRICE[p])}</option>)}</select></Field>
        </div>
        <p className="crm-sec" id="lv-q-mods-lbl">Modules</p>
        <ModulePicker idp="lv-q-mods" value={f.modules} onChange={set('modules')} list={INTEREST_MODULES} />
        <div className="crm-three">
          <Field id="lv-q-price" label="Price a month (৳)" error={errOf(err, 'price')} hint={f.price === '' ? 'Plan + add-ons' : null}><input id="lv-q-price" {...ctl(errOf(err, 'price'))} className={ctl(errOf(err, 'price')).className + ' crm-data'} inputMode="numeric" placeholder={String(auto)} value={f.price} onChange={(e) => set('price')(e.target.value.replace(/\D/g, ''))} /></Field>
          <Field id="lv-q-discount" label="Discount %" error={errOf(err, 'discount')}><input id="lv-q-discount" {...ctl(errOf(err, 'discount'))} className={ctl(errOf(err, 'discount')).className + ' crm-data'} inputMode="numeric" value={f.discount} onChange={(e) => set('discount')(e.target.value.replace(/[^\d.]/g, ''))} /></Field>
          <Field id="lv-q-validUntil" label="Valid until" error={errOf(err, 'validUntil')}><input id="lv-q-validUntil" type="date" {...ctl(errOf(err, 'validUntil'))} value={f.valid} onChange={(e) => { setF({ ...f, valid: e.target.value }); if (err && err.field === 'validUntil') setErr(null); }} /></Field>
        </div>
        <Field id="lv-q-note" label="Note on the quotation" optional><textarea id="lv-q-note" rows={2} className="gc-input" value={f.note} onChange={set('note')} /></Field>
        <dl className="ix-sum">
          <dt>Price a month</dt><dd className="crm-data">{money(price)}</dd>
          {q.discount ? <><dt>Discount {q.discount}%</dt><dd className="crm-data">−{money(price - quoteTotal(q))}</dd></> : null}
          <dt className="is-total">They pay a month</dt><dd className="is-total crm-data">{money(quoteTotal(q))}</dd>
        </dl>
        {err && (!err.field || err.field === 'form') ? <p className="crm-formerr" role="alert">{err.error}</p> : null}
      </form>
    </Sheet>
  );
}

// ---- meetings -------------------------------------------------------------------------------------------------------
function MeetingSheet({ l, t, close }) {
  const [f, setF] = useState({ at: toInput(tomorrowAt(t, 11)), kind: MEETING_KINDS[0], title: 'Product demo' });
  const [err, setErr] = useState(null);
  const save = () => {
    const r = scheduleMeeting(l.id, { at: fromInput(f.at), kind: f.kind, title: f.title });
    if (!r.ok) { setErr(r); return; }
    toast(`${r.meeting.title} booked for ${dateTime(r.meeting.at)}`);
    close();
  };
  return (
    <FormSheet id="lv-meet" title="Schedule meeting" close={close} onSubmit={save} submit="Book meeting" error={err}>
      <Field id="lv-meet-title" label="What"><input id="lv-meet-title" className="gc-input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} data-autofocus /></Field>
      <div className="crm-two">
        <Field id="lv-meet-at" label="When" error={errOf(err, 'at')}><input id="lv-meet-at" type="datetime-local" {...ctl(errOf(err, 'at'))} value={f.at} onChange={(e) => { setF({ ...f, at: e.target.value }); setErr(null); }} /></Field>
        <Field id="lv-meet-kind" label="Where"><select id="lv-meet-kind" className="gc-input gc-select" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>{MEETING_KINDS.map((k) => <option key={k}>{k}</option>)}</select></Field>
      </div>
      <p className="gc-help" style={{ margin: 0 }}>With {l.name} ({l.mobile}). It becomes the lead’s next follow-up.</p>
    </FormSheet>
  );
}
function MeetingDoneSheet({ l, mid, close }) {
  const m = l.meetings.find((x) => x.id === mid) || l.meetings.filter((x) => !x.done).sort((a, b) => a.at - b.at)[0];
  const [note, setNote] = useState('');
  const [err, setErr] = useState(null);
  if (!m) return <FormSheet id="lv-mdone" title="Mark meeting done" close={close} onSubmit={close} submit="Close"><p style={{ margin: 0 }}>No open meeting on this lead.</p></FormSheet>;
  const save = () => {
    const r = completeMeeting(l.id, m.id, note);
    if (!r.ok) { setErr(r); return; }
    toast(`${m.title} marked done${l.stage === 'demo' ? ' · moved to Demo done' : ''}`);
    close();
  };
  return (
    <FormSheet id="lv-mdone" title="Mark meeting done" close={close} onSubmit={save} submit="Mark done" error={err}>
      <p style={{ margin: 0 }}><b>{m.title}</b> · {m.kind} · {dateTime(m.at)}</p>
      <Field id="lv-mdone-note" label="How did it go?" optional><textarea id="lv-mdone-note" rows={3} className="gc-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Liked POS and branch stock; wants the price for 2 counters" data-autofocus /></Field>
    </FormSheet>
  );
}

// ---- salesperson and stage ------------------------------------------------------------------------------------------
function OwnerSheet({ l, close }) {
  const [owner, setOwner] = useState(l.owner);
  const save = () => {
    if (owner === l.owner) { close(); return; }
    const r = updateLead(l.id, { owner });
    if (r.ok) { toast(`${owner} now has this lead`); close(); } else toast(r.error);
  };
  return (
    <FormSheet id="lv-owner" title="Change salesperson" close={close} onSubmit={save} submit="Save">
      <Field id="lv-owner-sel" label="Salesperson"><select id="lv-owner-sel" className="gc-input gc-select" value={owner} onChange={(e) => setOwner(e.target.value)} data-autofocus>{SALES_NAMES.map((n) => <option key={n}>{n}</option>)}</select></Field>
    </FormSheet>
  );
}
function StageSheet({ l, close, askLost }) {
  const [stage, setStage] = useState('');
  const [err, setErr] = useState(null);
  const save = () => {
    if (!stage) { setErr({ field: 'stage', error: 'Pick a stage.' }); return; }
    if (stage === 'lost') { close(); askLost(); return; }
    const r = moveStage(l.id, stage);
    if (!r.ok) { setErr({ field: 'stage', error: r.error }); return; }
    toast(`Moved to ${stageOf(stage).label}${stage === 'won' ? '. Convert it to a merchant next.' : ''}`);
    close();
  };
  return (
    <FormSheet id="lv-stage" title="Move to stage" close={close} onSubmit={save} submit="Move">
      <Field id="lv-stage-sel" label="Stage" error={errOf(err, 'stage')}>
        <select id="lv-stage-sel" {...ctl(errOf(err, 'stage'), true)} value={stage} onChange={(e) => { setStage(e.target.value); setErr(null); }} data-autofocus>
          <option value="">Choose a stage</option>
          {STAGES.filter((s) => s.key !== l.stage).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </Field>
    </FormSheet>
  );
}

// ---- convert to merchant ----------------------------------------------------------------------------------------------
const SEGS = LADDERS.map((x) => x.label);
const slug = (s) => String(s || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '').slice(0, 30);
/** "01711-223344" → "1711-223344" (provisionStore adds "+880 "). */
const localPhone = (s) => {
  let d = String(s || '').replace(/\D/g, '');
  if (d.startsWith('880')) d = d.slice(3);
  if (d.startsWith('0')) d = d.slice(1);
  return d.length > 4 ? d.slice(0, 4) + '-' + d.slice(4) : d;
};
const CAT_MAP = { Electronics: 'Electronics', 'Mobile & gadgets': 'Electronics', Grocery: 'Grocery', 'Food & sweets': 'Grocery', Beauty: 'Beauty', Pharmacy: 'Beauty', 'Jewellery and accessories': 'Jewellery and accessories' };
const FIELD_ID = { name: 'lv-cv-name', owner: 'lv-cv-owner', phone: 'lv-cv-phone', sub: 'lv-cv-sub', segs: 'lv-cv-seg-0', email: 'lv-cv-email' };

function ConvertSheet({ l, close }) {
  const { db, live } = usePlatform();
  const accepted = l.quotes.find((q) => q.status === 'accepted');
  const [f, setF] = useState(() => ({
    name: l.business, owner: l.name, phone: l.mobile, email: l.email || '', sub: slug(l.business),
    segs: segsOf(l.type), plan: (accepted || l).plan, trial: true, sendLogin: true,
    modules: addonCodes((accepted || l).modules).filter((c) => ADDONS.some((a) => a.code === c)),
    cat: CAT_MAP[l.category] || (P_CATS.includes(l.category) ? l.category : 'Fashion'),
    dist: P_DISTRICTS.includes(l.district) ? l.district : 'Dhaka', src: platformSource(l.source),
    by: ONBOARDERS.includes(l.owner) ? l.owner : 'Tania Sultana',
  }));
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => { const v = e && e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e; setF((o) => ({ ...o, [k]: v })); if (err && err.field === k) setErr(null); };
  const toggleIn = (k, v) => { setF((o) => ({ ...o, [k]: o[k].includes(v) ? o[k].filter((x) => x !== v) : [...o[k], v] })); if (err && err.field === k) setErr(null); };
  const sub = f.sub.trim().toLowerCase();
  const avail = live && sub ? subdomainFree(db, sub) : null;
  const addons = ADDONS.filter((a) => a.kind === 'module' || a.code === 'S6');
  const monthly = (PLAN_PRICE[f.plan] || 0) + addons.filter((a) => f.modules.includes(a.code) && a.period === 'Monthly').reduce((s, a) => s + a.price, 0);
  const e = (k) => errOf(err, k);

  const save = () => {
    if (busy) return;
    if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) { setErr({ field: 'email', error: 'Enter a valid email, or leave it empty.' }); focusField(FIELD_ID.email); return; }
    setBusy(true);
    const r = convertToMerchant(l.id, {
      name: f.name.trim(), legal: f.name.trim(), owner: f.owner.trim(), phone: localPhone(f.phone), email: f.email.trim(), lang: 'বাংলা',
      sub, domain: '', segs: f.segs, plan: f.plan, trial: f.trial, modules: f.modules, cat: f.cat, dist: f.dist, address: '',
      src: f.src, by: f.by, helper: 'Unassigned', campaign: '', refCode: '', sendLogin: f.sendLogin, migrate: f.modules.includes('S6') ? 'assisted' : 'empty',
    });
    setBusy(false);
    if (!r.ok) {
      setErr({ field: r.field && FIELD_ID[r.field] ? r.field : 'form', error: r.error });
      if (r.field && FIELD_ID[r.field]) focusField(FIELD_ID[r.field]);
      return;
    }
    toast(`Store #${r.id} created · ${l.business} is now a merchant`);
    close({ converted: r.id });
  };

  return (
    <Sheet open title="Convert to merchant" onClose={() => close()} footer={<>
      <button type="button" className="gc-btn gc-btn--neutral" onClick={() => close()}>Cancel</button>
      <button type="submit" form="lv-convert" className="gc-btn gc-btn--solid" disabled={busy || !live}>Create store</button>
    </>}>
      <form id="lv-convert" className="crm-form" noValidate onSubmit={(ev) => { ev.preventDefault(); save(); }}>
        <p style={{ margin: 0 }}>Creates the store, its owner and a {f.trial ? `${TRIAL_DAYS}-day trial` : 'paid'} subscription, then marks this lead Won.</p>
        <div className="crm-two">
          <Field id="lv-cv-name" label="Store name" error={e('name')}><input id="lv-cv-name" {...ctl(e('name'))} value={f.name} onChange={set('name')} data-autofocus /></Field>
          <Field id="lv-cv-owner" label="Owner" error={e('owner')}><input id="lv-cv-owner" {...ctl(e('owner'))} value={f.owner} onChange={set('owner')} /></Field>
          <Field id="lv-cv-phone" label="Owner’s mobile" error={e('phone')}><input id="lv-cv-phone" {...ctl(e('phone'))} inputMode="tel" value={f.phone} onChange={set('phone')} /></Field>
          <Field id="lv-cv-email" label="Email" optional error={e('email')}><input id="lv-cv-email" type="email" {...ctl(e('email'))} value={f.email} onChange={set('email')} /></Field>
        </div>
        <Field id="lv-cv-sub" label="Store address" error={e('sub')}>
          <span className="lv-post"><input id="lv-cv-sub" {...ctl(e('sub'))} className={ctl(e('sub')).className + ' crm-data'} value={f.sub} onChange={set('sub')} /><span>.gridcommerce.com.bd</span></span>
          {!e('sub') && avail ? <span className={'lv-avail ' + (avail.ok ? 'is-ok' : 'is-bad')}><Icon name={avail.ok ? 'circle-check' : 'circle-alert'} width="14" height="14" aria-hidden="true" />{avail.ok ? 'Free' : avail.why}</span> : null}
        </Field>
        <fieldset className="lv-fieldset">
          <legend className="gc-label">Sells</legend>
          <div className="ix-chips">
            {SEGS.map((s, i) => <label key={s} className="crm-mod"><input id={'lv-cv-seg-' + i} type="checkbox" checked={f.segs.includes(s)} onChange={() => toggleIn('segs', s)} /><span>{s}</span></label>)}
          </div>
          {e('segs') ? <p className="gc-help gc-help--error" role="alert">{e('segs')}</p> : null}
        </fieldset>
        <div className="crm-two">
          <Field id="lv-cv-plan" label="Plan"><select id="lv-cv-plan" className="gc-input gc-select" value={f.plan} onChange={set('plan')}>{PLANS.map((p) => <option key={p} value={p}>{PLAN_NAME[p]} · {formatBDT(PLAN_PRICE[p])}/mo</option>)}</select></Field>
          <Field id="lv-cv-by" label="Sold by"><select id="lv-cv-by" className="gc-input gc-select" value={f.by} onChange={set('by')}>{ONBOARDERS.map((n) => <option key={n}>{n}</option>)}</select></Field>
          <Field id="lv-cv-cat" label="Category"><select id="lv-cv-cat" className="gc-input gc-select" value={f.cat} onChange={set('cat')}>{P_CATS.map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field id="lv-cv-dist" label="District"><select id="lv-cv-dist" className="gc-input gc-select" value={f.dist} onChange={set('dist')}>{P_DISTRICTS.map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field id="lv-cv-src" label="Came from" wide><select id="lv-cv-src" className="gc-input gc-select" value={f.src} onChange={set('src')}>{P_SOURCES.map((x) => <option key={x}>{x}</option>)}</select></Field>
        </div>
        <p className="crm-sec">Add-ons</p>
        <div className="ix-chips">
          {addons.map((a) => <label key={a.code} className="crm-mod"><input type="checkbox" checked={f.modules.includes(a.code)} onChange={() => toggleIn('modules', a.code)} /><span>{a.label} · {formatBDT(a.price)}{a.period === 'Once' ? ' once' : '/mo'}</span></label>)}
        </div>
        <label className="lv-check"><input type="checkbox" checked={f.trial} onChange={set('trial')} />Start with a {TRIAL_DAYS}-day trial</label>
        <label className="lv-check"><input type="checkbox" checked={f.sendLogin} onChange={set('sendLogin')} />Send the owner a sign-in link by SMS</label>
        <dl className="ix-sum">
          <dt>{PLAN_NAME[f.plan]} + add-ons</dt><dd className="crm-data">{money(monthly)}/mo</dd>
          <dt className="is-total">First bill</dt><dd className="is-total">{f.trial ? `After the trial` : 'Today'}</dd>
        </dl>
        {err && err.field === 'form' ? <p className="crm-formerr" role="alert">{err.error}</p> : null}
      </form>
    </Sheet>
  );
}

export const SHEET_CSS = `
.lv-post{display:flex;align-items:stretch}
.lv-post>.gc-input{border-radius:var(--radius-lg) 0 0 var(--radius-lg)}
.lv-post>span{display:inline-flex;flex:none;align-items:center;padding:0 10px;border:1px solid var(--border-field);border-left:0;border-radius:0 var(--radius-lg) var(--radius-lg) 0;background:var(--surface-subtle);font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-body)}
.lv-avail{display:flex;align-items:center;gap:6px;margin-top:var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.lv-avail.is-ok{color:var(--text-success)}.lv-avail.is-bad{color:var(--text-danger)}
.lv-fieldset{margin:0;padding:0;border:0;min-width:0}
.lv-fieldset legend{padding:0;margin-bottom:var(--space-2)}
`;

/** The open sheet. close(result?) — Convert passes { converted: storeId }. */
export function LeadSheets({ sheet, l, t, close, askLost }) {
  if (!sheet || !l) return null;
  const k = sheet.kind;
  const key = k + sheet.n;
  if (k === 'followup') return <FollowSheet key={key} l={l} t={t} close={close} />;
  if (k === 'task') return <TaskSheet key={key} l={l} t={t} close={close} />;
  if (k === 'quote') return <QuoteSheet key={key} l={l} t={t} close={close} />;
  if (k === 'meeting') return <MeetingSheet key={key} l={l} t={t} close={close} />;
  if (k === 'meetingDone') return <MeetingDoneSheet key={key} l={l} mid={sheet.mid} close={close} />;
  if (k === 'owner') return <OwnerSheet key={key} l={l} close={close} />;
  if (k === 'stage') return <StageSheet key={key} l={l} close={close} askLost={askLost} />;
  if (k === 'convert') return <ConvertSheet key={key} l={l} close={close} />;
  return null;
}

