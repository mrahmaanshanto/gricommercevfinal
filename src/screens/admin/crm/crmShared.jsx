'use client';
// Sales & CRM (Leads, Pipeline, the lead page) — the parts the three pages share: the CSS, money and date text, the
// stage badge, the salesperson's avatar, a form field, the Add / Edit lead sheet and the Lost dialog.
// Data: lib/admin/crm.js (createStore 'crm'). Never the merchant panel's lib/leads.js.

import React, { useState } from 'react';
import { toast } from '@/runtime/ui';
import { Sheet, Dialog, StatusBadge } from '@/components/ui';
import { TZ, dhaka, daysBetween, dm, hm, ago, ahead, num } from '@/lib/platform/util';
import { formatBDT } from '@/lib/format';
import { LADDERS, PLAN_NAME } from '@/lib/platform/catalogue';
import { staff } from '@/lib/platform/store';
import { useAdminStore } from '@/lib/admin/store';
import {
  crm, STAGES, SOURCES, TYPES, CATEGORIES, SOFTWARE, DISTRICTS, SALES_TEAM, SALES_NAMES, INTEREST_MODULES, PLANS, LOST_REASONS,
  stageOf, followState, priceFor, addLead, updateLead,
} from '@/lib/admin/crm';

export const money = (n) => formatBDT(Math.round(Number(n) || 0));
export const perMonth = (n) => money(n) + '/mo';
export const plural = (n, one, many) => num(n) + ' ' + (n === 1 ? one : many || one + 's');

/** The CRM data and who is using the panel. `live` is false on the server render and the first paint. */
export function useCrm() {
  const { data, t, live } = useAdminStore(crm);
  return { leads: data.leads, t, live, me: live ? staff().name : '' };
}

// ---- dates (Dhaka wall clock, as everywhere in the admin) ---------------------------------------------------------
/** ms → "2026-10-14T11:00" for a datetime-local field. */
export const toInput = (ms) => new Date(ms + TZ).toISOString().slice(0, 16);
export const toDateInput = (ms) => toInput(ms).slice(0, 10);
/** "2026-10-14T11:00" or "2026-10-14" (17:00) → ms (NaN when empty). */
export function fromInput(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(s || '');
  return m ? dhaka(+m[1], +m[2] - 1, +m[3], m[4] ? +m[4] : 17, m[5] ? +m[5] : 0) : NaN;
}
export const whenText = (ms, t) => (ms ? ago(ms, t) : '—');
/** The next follow-up as text: "2 days late" · "Today 15:00" · "Tomorrow 11:00" · "Mon 11:00" · "24 Oct". */
export function nextText(l, t) {
  if (!l.next) return '—';
  const st = followState(l, t);
  if (st === 'overdue') { const n = daysBetween(l.next.at, t); return n === 1 ? 'Yesterday' : `${n} days late`; }
  return ahead(l.next.at, t);
}
export const FOLLOW_CLS = { overdue: 'ix-bad', today: 'ix-warn' };
export const dateTime = (ms) => (ms ? `${dm(ms)} ${hm(ms)}` : '—');

// ---- small parts ----------------------------------------------------------------------------------------------------
export function StageBadge({ stage }) {
  const s = stageOf(stage);
  return <StatusBadge tone={s.tone}>{s.label}</StatusBadge>;
}
const person = (name) => SALES_TEAM.find((p) => p.name === name) || { name, ini: String(name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2), color: '#64748b', title: '' };
export function Avatar({ name, size = 24 }) {
  const p = person(name);
  return <span className="crm-av" style={{ width: size, height: size, background: p.color }} title={name} aria-hidden="true">{p.ini}</span>;
}
export function Who({ name }) {
  return <span className="crm-who"><Avatar name={name} /><span>{name ? name.split(' ')[0] : '—'}</span></span>;
}

/** A label, the control, and its error (or a hint) under it. */
export function Field({ id, label, error, hint, optional, children, wide }) {
  return (
    <div className={'gc-field' + (wide ? ' crm-wide' : '')}>
      <label className="gc-label" htmlFor={id}>{label}{optional ? <span className="crm-opt"> (optional)</span> : null}</label>
      {children}
      {error ? <p className="gc-help gc-help--error" id={id + '-err'} role="alert">{error}</p> : hint ? <p className="gc-help">{hint}</p> : null}
    </div>
  );
}
export const ctl = (error, select) => ({ className: 'gc-input' + (select ? ' gc-select' : '') + (error ? ' gc-input--error' : ''), 'aria-invalid': error ? true : undefined });
export const focusField = (id) => setTimeout(() => { const el = document.getElementById(id); if (el) { el.focus(); el.scrollIntoView({ block: 'center' }); } }, 0);

/** Pick several modules (checkbox chips). */
export function ModulePicker({ value, onChange, idp, list = INTEREST_MODULES }) {
  const toggle = (m) => onChange(value.includes(m) ? value.filter((x) => x !== m) : [...value, m]);
  return (
    <div className="crm-mods" role="group" aria-labelledby={idp + '-lbl'}>
      {list.map((m) => (
        <label key={m} className="crm-mod"><input type="checkbox" checked={value.includes(m)} onChange={() => toggle(m)} /><span>{m}</span></label>
      ))}
    </div>
  );
}

// ---- add / edit a lead ----------------------------------------------------------------------------------------------
const EMPTY = (me, t) => ({
  name: '', business: '', mobile: '', email: '', source: SOURCES[0], type: 'Online', category: CATEGORIES[0], district: 'Dhaka',
  software: SOFTWARE[0], orders: '', modules: [], ladder: 'online', plan: 'growth', value: '', owner: SALES_NAMES.includes(me) ? me : SALES_NAMES[0],
  nextAt: toInput(t + 2 * 3600e3), nextWhat: 'First call', note: '',
});
const ladderFor = (type) => (type === 'Retail' ? 'retail' : type === 'Wholesale' ? 'wholesale' : 'online');

/** The Add lead (lead = null) or Edit lead sheet. onDone(lead) after a save. */
export function LeadFormSheet({ open, lead, me, t, onClose, onDone }) {
  if (!open) return null;
  return <LeadForm key={lead ? lead.id : 'new'} lead={lead} me={me} t={t} onClose={onClose} onDone={onDone} />;
}
function LeadForm({ lead, me, t, onClose, onDone }) {
  const [f, setF] = useState(() => (lead ? { ...lead, orders: String(lead.orders || ''), value: String(lead.value || '') } : EMPTY(me, t)));
  const [valueTouched, setValueTouched] = useState(!!lead);
  const [err, setErr] = useState(null);
  const set = (k) => (e) => {
    const v = e && e.target ? e.target.value : e;
    setF((o) => {
      const n = { ...o, [k]: v };
      if (k === 'type') n.ladder = ladderFor(v);
      return n;
    });
    if (k === 'value') setValueTouched(true);
    if (err && err.field === k) setErr(null);
  };
  const auto = priceFor(f.plan, f.modules);
  const e = (k) => (err && err.field === k ? err.error : null);
  const save = (ev) => {
    ev.preventDefault();
    const body = { ...f, orders: f.orders === '' ? 0 : f.orders, value: valueTouched && f.value !== '' ? f.value : auto };
    if (!lead) {
      const at = fromInput(f.nextAt);
      body.nextAt = Number.isFinite(at) ? at : null;
    }
    const res = lead ? updateLead(lead.id, body) : addLead(body);
    if (!res.ok) { setErr({ field: res.field || 'form', error: res.error }); if (res.field) focusField('crm-f-' + res.field); return; }
    toast(lead ? (res.changed ? 'Lead saved' : 'Nothing changed') : `${res.lead.business} added as ${res.lead.id}`);
    if (onDone) onDone(lead || res.lead);
    onClose();
  };
  return (
    <Sheet open title={lead ? 'Edit lead' : 'Add lead'} onClose={onClose} footer={<>
      <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button>
      <button type="submit" form="crm-lead-form" className="gc-btn gc-btn--solid">{lead ? 'Save' : 'Add lead'}</button>
    </>}>
      <form id="crm-lead-form" className="crm-form" onSubmit={save} noValidate>
        <div className="crm-two">
          <Field id="crm-f-name" label="Name" error={e('name')}><input id="crm-f-name" {...ctl(e('name'))} value={f.name} onChange={set('name')} data-autofocus autoComplete="off" /></Field>
          <Field id="crm-f-business" label="Business" error={e('business')}><input id="crm-f-business" {...ctl(e('business'))} value={f.business} onChange={set('business')} autoComplete="off" /></Field>
          <Field id="crm-f-mobile" label="Mobile" error={e('mobile')}><input id="crm-f-mobile" {...ctl(e('mobile'))} inputMode="tel" placeholder="01XXX-XXXXXX" value={f.mobile} onChange={set('mobile')} /></Field>
          <Field id="crm-f-email" label="Email" optional error={e('email')}><input id="crm-f-email" type="email" {...ctl(e('email'))} value={f.email} onChange={set('email')} /></Field>
          <Field id="crm-f-source" label="Source"><select id="crm-f-source" {...ctl(null, true)} value={f.source} onChange={set('source')}>{SOURCES.map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field id="crm-f-owner" label="Salesperson"><select id="crm-f-owner" {...ctl(null, true)} value={f.owner} onChange={set('owner')}>{SALES_NAMES.map((x) => <option key={x}>{x}</option>)}</select></Field>
        </div>
        <p className="crm-sec">Business</p>
        <div className="crm-two">
          <Field id="crm-f-type" label="Business type"><select id="crm-f-type" {...ctl(null, true)} value={f.type} onChange={set('type')}>{TYPES.map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field id="crm-f-category" label="Category"><select id="crm-f-category" {...ctl(null, true)} value={f.category} onChange={set('category')}>{CATEGORIES.map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field id="crm-f-district" label="District"><select id="crm-f-district" {...ctl(null, true)} value={f.district} onChange={set('district')}>{(DISTRICTS.includes(f.district) ? DISTRICTS : [f.district, ...DISTRICTS]).map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field id="crm-f-orders" label="Orders a month" error={e('orders')}><input id="crm-f-orders" {...ctl(e('orders'))} className={ctl(e('orders')).className + ' crm-data'} inputMode="numeric" value={f.orders} onChange={(ev) => set('orders')(ev.target.value.replace(/\D/g, ''))} /></Field>
          <Field id="crm-f-software" label="Current software" wide><select id="crm-f-software" {...ctl(null, true)} value={f.software} onChange={set('software')}>{(SOFTWARE.includes(f.software) ? SOFTWARE : [f.software, ...SOFTWARE]).map((x) => <option key={x}>{x}</option>)}</select></Field>
        </div>
        <p className="crm-sec" id="crm-f-mods-lbl">Interested modules</p>
        <ModulePicker idp="crm-f-mods" value={f.modules} onChange={set('modules')} />
        <p className="crm-sec">Expected subscription</p>
        <div className="crm-three">
          <Field id="crm-f-ladder" label="Package"><select id="crm-f-ladder" {...ctl(null, true)} value={f.ladder} onChange={set('ladder')}>{LADDERS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select></Field>
          <Field id="crm-f-plan" label="Plan"><select id="crm-f-plan" {...ctl(null, true)} value={f.plan} onChange={set('plan')}>{PLANS.map((p) => <option key={p} value={p}>{PLAN_NAME[p]}</option>)}</select></Field>
          <Field id="crm-f-value" label="৳ a month" hint={valueTouched ? null : 'Plan + add-ons'}><input id="crm-f-value" className="gc-input crm-data" inputMode="numeric" placeholder={String(auto)} value={valueTouched ? f.value : ''} onChange={(ev) => set('value')(ev.target.value.replace(/\D/g, ''))} /></Field>
        </div>
        {!lead ? (<>
          <p className="crm-sec">First follow-up</p>
          <div className="crm-two">
            <Field id="crm-f-nextAt" label="When"><input id="crm-f-nextAt" type="datetime-local" className="gc-input" value={f.nextAt} onChange={set('nextAt')} /></Field>
            <Field id="crm-f-nextWhat" label="To do"><input id="crm-f-nextWhat" className="gc-input" value={f.nextWhat} onChange={set('nextWhat')} /></Field>
            <Field id="crm-f-note" label="Note" optional wide><textarea id="crm-f-note" rows={2} className="gc-input" value={f.note} onChange={set('note')} /></Field>
          </div>
        </>) : null}
        {err && err.field === 'form' ? <p className="crm-formerr" role="alert">{err.error}</p> : null}
      </form>
    </Sheet>
  );
}

/** Why was it lost? onConfirm(reason, note). */
export function LostDialog({ open, title, onClose, onConfirm, error }) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [miss, setMiss] = useState(false);
  if (!open) return null;
  const go = () => { if (!reason) { setMiss(true); return; } onConfirm(reason, note.trim()); setReason(''); setNote(''); setMiss(false); };
  const close = () => { setReason(''); setNote(''); setMiss(false); onClose(); };
  return (
    <Dialog open title={title || 'Mark as lost'} onClose={close} width={460} footer={<>
      <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={close}>Cancel</button>
      <button type="button" className="gc-btn gc-btn--sm gc-btn--solid gc-btn--error" onClick={go}>Mark lost</button>
    </>}>
      <div className="crm-form">
        <Field id="crm-lost-r" label="Why did they not buy?" error={miss ? 'Pick a reason.' : error || null}>
          <select id="crm-lost-r" {...ctl(miss, true)} value={reason} onChange={(e) => { setReason(e.target.value); setMiss(false); }} data-autofocus>
            <option value="">Pick a reason</option>
            {LOST_REASONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </Field>
        <Field id="crm-lost-n" label="Note" optional><textarea id="crm-lost-n" rows={2} className="gc-input" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      </div>
    </Dialog>
  );
}

/** The main next step for a lead's stage (the record's primary button). kind tells the page what to open. */
export function nextStep(l) {
  if (l.merchantId) return { kind: 'merchant', label: 'Open merchant', icon: 'store' };
  switch (l.stage) {
    case 'new': return { kind: 'log', label: 'Log first call', icon: 'phone' };
    case 'contacted': return { kind: 'stage', to: 'qualified', label: 'Mark qualified', icon: 'badge-check' };
    case 'qualified': return { kind: 'meeting', label: 'Schedule demo', icon: 'calendar-plus' };
    case 'demo': return { kind: 'meetingDone', label: 'Mark demo done', icon: 'check' };
    case 'demodone': return { kind: 'quote', label: 'Send quotation', icon: 'file-text' };
    case 'proposal': return { kind: 'stage', to: 'negotiation', label: 'Move to negotiation', icon: 'handshake' };
    case 'negotiation': case 'won': return { kind: 'convert', label: 'Convert to merchant', icon: 'store' };
    case 'lost': return { kind: 'stage', to: 'contacted', label: 'Reopen lead', icon: 'rotate-ccw' };
    default: return null;
  }
}

export const STAGE_OPTIONS = STAGES.map((s) => [s.key, s.label]);

export const CRM_CSS = `
.crm-av{display:inline-grid;flex:none;place-items:center;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:#fff;line-height:1}
.crm-who{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.crm-data{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.crm-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums;font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap}
.crm-sub{display:block;font-size:var(--text-xs);color:var(--text-muted);overflow:hidden;text-overflow:ellipsis}
.crm-form{display:flex;flex-direction:column;gap:var(--space-3)}
.crm-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.crm-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3)}
.crm-wide{grid-column:1/-1}
.crm-opt{font-weight:var(--weight-regular);color:var(--text-muted)}
.crm-sec{margin:var(--space-1) 0 0;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.crm-formerr{margin:0;font-size:var(--text-sm);color:var(--text-danger)}
.crm-mods{display:flex;flex-wrap:wrap;gap:6px}
.crm-mod{display:inline-flex;align-items:center;gap:6px;min-height:28px;padding:0 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);font-size:var(--text-xs);color:var(--text-body);cursor:pointer}
.crm-mod:has(input:checked){border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.crm-mod input{width:14px;height:14px;margin:0;accent-color:var(--primary)}
.crm-skel{height:420px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-card),var(--surface-subtle),var(--surface-card));background-size:200% 100%;animation:crm-sk 1.4s ease infinite}
@keyframes crm-sk{from{background-position:100% 0}to{background-position:-100% 0}}
@media (prefers-reduced-motion:reduce){.crm-skel{animation:none}}
@media (max-width:640px){
  .crm-two,.crm-three{grid-template-columns:minmax(0,1fr)}
  .crm-mod{min-height:36px}
}
`;

