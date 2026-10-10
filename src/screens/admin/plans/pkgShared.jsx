'use client';
// Packages and Modules (/admin/packages, /admin/packages/edit, /admin/modules) — the parts the three pages share:
// the page CSS (prefix pk-), money / limit / date text, a form field, a list row, the add-on price form (with its
// history) and the module trial form. Data: lib/admin/packages.js (createStore `packages`) and lib/platform.

import React, { useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { StatusBadge } from '@/components/ui';
import { formatBDT } from '@/lib/format';
import { dmy, dhaka, num } from '@/lib/platform/util';
import { UNLIMITED } from '@/lib/platform/catalogue';
import { useAdminStore } from '@/lib/admin/store';
import { pk, addonPrice, setPrice, trialRule, setTrialRule, RULE_TONE } from '@/lib/admin/packages';

export const usePackages = () => useAdminStore(pk);
export const money = (n) => formatBDT(Math.round(Number(n) || 0));
export const limitText = (k, x) => (x == null ? '—' : x >= UNLIMITED ? 'Unlimited' : k === 'storage' ? x + ' GB' : num(x));
export const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many || one + 's');
/** ms → "2026-10-11" (Dhaka day) for a date input; "" → null back. */
export const toDateInput = (ms) => (ms ? new Date(ms + 6 * 3600e3).toISOString().slice(0, 10) : '');
export function fromDateInput(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
  return m ? dhaka(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}
export const toNum = (v) => { const n = Number(String(v ?? '').replace(/[^0-9.]/g, '')); return Number.isFinite(n) ? n : 0; };

/** A set rule or module state as a small badge. */
export function Rule({ rule }) {
  return <StatusBadge tone={RULE_TONE[rule] || 'neutral'}>{rule}</StatusBadge>;
}

/** A label, the control, and its error (or a hint) under it. */
export function Field({ id, label, error, hint, children, wide, optional }) {
  return (
    <div className={'pk-field' + (wide ? ' pk-wide' : '')}>
      <label className="gc-label" htmlFor={id}>{label}{optional ? <span className="pk-muted"> (optional)</span> : null}</label>
      {children}
      {error ? <p className="pk-err" id={id + '-err'} role="alert">{error}</p> : hint ? <p className="gc-help">{hint}</p> : null}
    </div>
  );
}
/** Props for an input or select inside a Field. */
export const ctl = (id, error, select) => ({ id, className: 'gc-input' + (select ? ' gc-select' : '') + (error ? ' gc-input--error' : ''), 'aria-invalid': error ? true : undefined, 'aria-describedby': error ? id + '-err' : undefined });

/** One line of a list: a title, a small line under it, and whatever sits at the end. */
export function Row({ title, sub, end, onClick, href }) {
  const body = (<>
    <span className="pk-row__main"><b>{title}</b>{sub ? <small>{sub}</small> : null}</span>
    {end ? <span className="pk-row__end">{end}</span> : null}
  </>);
  if (href) return <a className="pk-row" href={href}>{body}</a>;
  if (onClick) return <button type="button" className="pk-row" onClick={onClick}>{body}</button>;
  return <div className="pk-row">{body}</div>;
}

/** The add-on's price: today, a change waiting to start, a form for a new price, and the history. */
export function PriceForm({ code, data, t, onDone }) {
  const cur = addonPrice(data, code, t);
  const [f, setF] = useState({ price: '', from: '', note: '' });
  const [err, setErr] = useState({});
  if (!cur) return <p className="pk-muted pk-small">Not sold on its own: it comes with the plans that include it.</p>;
  const save = () => {
    const r = setPrice(code, toNum(f.price), fromDateInput(f.from), f.note);
    if (!r.ok) { setErr(r.field ? { [r.field]: r.error } : { form: r.error }); return; }
    setErr({}); setF({ price: '', from: '', note: '' });
    toast(r.cancelled ? 'The waiting price change is cancelled' : r.entry.effective > t ? `New price from ${dmy(r.entry.effective)}` : 'Price changed');
    if (onDone) onDone();
  };
  const per = cur.period === 'Once' ? ' once' : ' a month';
  return (
    <div className="pk-form">
      <p className="pk-price"><b>{money(cur.price)}</b><span className="pk-muted">{per}</span>
        {cur.next ? <span className="pk-next"><Icon name="calendar-clock" width="14" height="14" aria-hidden="true" />{money(cur.next.to)} from {dmy(cur.next.effective)}</span> : null}
      </p>
      <div className="pk-two">
        <Field id={'pk-price-' + code} label="New price (৳)" error={err.price}>
          <input {...ctl('pk-price-' + code, err.price)} inputMode="numeric" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} placeholder={String(cur.price)} />
        </Field>
        <Field id={'pk-from-' + code} label="Starts" hint="Empty: today" optional>
          <input {...ctl('pk-from-' + code)} type="date" min={toDateInput(t)} value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} />
        </Field>
        <Field id={'pk-note-' + code} label="Why" error={err.note} wide>
          <input {...ctl('pk-note-' + code, err.note)} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="e.g. Operator rate went up" />
        </Field>
      </div>
      {err.form ? <p className="pk-err" role="alert">{err.form}</p> : null}
      <div className="pk-actions"><button type="button" className="ix-btn" onClick={save}>Save price</button></div>
      <p className="pk-muted pk-small">Stores already billed keep their price until their bill item is edited.</p>
      {cur.history.length ? (
        <div className="pk-list" aria-label="Price history">
          {cur.history.slice(0, 6).map((h) => (
            <Row key={h.id} title={<>{money(h.from)} → {money(h.to)}</>} sub={`${h.effective > t ? 'From' : 'Since'} ${dmy(h.effective)} · ${h.by} · ${h.note}`} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Is a trial offered for this module (or the Online set), how long, and what happens after it. */
export function TrialRuleForm({ code, data, label }) {
  const rule = trialRule(data, code);
  const [f, setF] = useState({ offered: rule.offered, days: String(rule.days), autoAdd: rule.autoAdd, price: String(rule.price || '') });
  const [err, setErr] = useState({});
  const save = () => {
    const r = setTrialRule(code, { offered: f.offered, days: toNum(f.days), autoAdd: f.autoAdd, price: toNum(f.price) });
    if (!r.ok) { setErr(r.field ? { [r.field]: r.error } : { form: r.error }); return; }
    setErr({});
    toast(f.offered ? 'Trial settings saved' : 'Trial no longer offered');
  };
  return (
    <div className="pk-form">
      <label className="pk-switch">
        <button type="button" role="switch" className="gc-switch" aria-checked={!!f.offered} aria-label={`Offer a ${label} trial`} onClick={() => setF({ ...f, offered: !f.offered })}><span className="gc-switch__knob" /></button>
        <span>Staff can offer a trial</span>
      </label>
      {f.offered ? (
        <div className="pk-two">
          <Field id={'pk-tdays-' + code} label="Length (days)" error={err.days}>
            <input {...ctl('pk-tdays-' + code, err.days)} inputMode="numeric" value={f.days} onChange={(e) => setF({ ...f, days: e.target.value })} />
          </Field>
          <Field id={'pk-tprice-' + code} label="Price after the trial (৳ a month)" error={err.price}>
            <input {...ctl('pk-tprice-' + code, err.price)} inputMode="numeric" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
          </Field>
          <label className="pk-check pk-wide">
            <input type="checkbox" className="gc-check" checked={!!f.autoAdd} onChange={(e) => setF({ ...f, autoAdd: e.target.checked })} />
            <span>Add it to the bill when the trial ends<small>Off: the module turns off unless the store buys it.</small></span>
          </label>
        </div>
      ) : null}
      {err.form ? <p className="pk-err" role="alert">{err.form}</p> : null}
      <div className="pk-actions"><button type="button" className="ix-btn" onClick={save}>Save trial settings</button></div>
    </div>
  );
}

export const PK_CSS = `
.pk-muted{color:var(--text-muted)}
.pk-small{margin:0;font-size:var(--text-xs)}
.pk-data,.pk-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.pk-fig{font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap}
.pk-err{margin:var(--space-2) 0 0;font-size:var(--text-xs);color:var(--text-danger)}
.pk-form{display:flex;flex-direction:column;gap:var(--space-3)}
.pk-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.pk-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3)}
.pk-wide{grid-column:1/-1}
.pk-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:var(--space-2)}
.pk-check{display:flex;align-items:flex-start;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-heading);cursor:pointer}
.pk-check input{flex:none;margin-top:1px}
.pk-check>span{display:flex;flex-direction:column;gap:2px;min-width:0}
.pk-check small{font-size:var(--text-xs);color:var(--text-muted)}
.pk-switch{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-heading)}
.pk-price{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px var(--space-2);margin:0;font-size:var(--text-sm)}
.pk-price b{font-family:var(--font-data);font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pk-next{display:inline-flex;align-items:center;gap:4px;padding:0 8px;border-radius:var(--radius-full);background:var(--fill-primary-soft);font-size:var(--text-xs);color:var(--primary)}
.pk-list{display:flex;flex-direction:column}
.pk-row{display:flex;align-items:center;gap:var(--space-3);width:100%;min-height:44px;padding:6px 0;border:0;border-top:1px solid var(--border-subtle);background:none;font:inherit;font-size:var(--text-sm);color:var(--text-body);text-align:left;text-decoration:none}
.pk-list>.pk-row:first-child{border-top:0}
button.pk-row,a.pk-row{cursor:pointer}
button.pk-row:hover b,a.pk-row:hover b{color:var(--primary)}
button.pk-row:focus-visible,a.pk-row:focus-visible{outline:2px solid var(--primary);outline-offset:2px;border-radius:var(--radius-sm)}
.pk-row__main{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.pk-row__main b{font-weight:var(--weight-medium);color:var(--text-heading);overflow-wrap:anywhere}
.pk-row__main small{font-size:var(--text-xs);color:var(--text-muted);overflow-wrap:anywhere}
.pk-row__end{flex:none;display:flex;align-items:center;gap:var(--space-2)}
.pk-sec{margin:var(--space-2) 0 0;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted)}
.pk-diff{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none;font-size:var(--text-sm);color:var(--text-body)}
.pk-diff li{display:flex;gap:var(--space-2);align-items:baseline}
.pk-diff__s{flex:none;width:14px;font-family:var(--font-data);font-weight:var(--weight-semibold);text-align:center}
.pk-diff__s.is-add{color:var(--text-success)}.pk-diff__s.is-del{color:var(--text-danger)}.pk-diff__s.is-chg{color:var(--primary)}
.pk-cmp th[scope=row]{font-weight:var(--weight-regular);color:var(--text-body);white-space:nowrap}
.pk-cmp td{vertical-align:middle}
.pk-cmp thead th{vertical-align:top}
.pk-cmp tr.pk-cmp__sec th{padding-top:14px;background:var(--surface-subtle);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted)}
.pk-plan{display:flex;flex-direction:column;align-items:flex-start;gap:4px;min-width:150px;white-space:normal}
.pk-plan b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pk-plan small{font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.pk-yes{display:inline-flex;align-items:center;gap:4px;color:var(--text-success)}
.pk-no{color:var(--text-muted)}
.pk-banner{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);padding:var(--space-3) var(--space-4);border-radius:var(--radius-xl);background:var(--fill-primary-soft);font-size:var(--text-sm);color:var(--text-heading)}
.pk-banner p{flex:1;min-width:200px;margin:0}
.pk-banner--warn{background:var(--fill-warning-soft)}
.pk-banner--err{background:var(--fill-error-soft)}
.pk-rule{margin:0;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-body)}
.pk-tools{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:8px;border-bottom:1px solid var(--border-subtle)}
.pk-tools .ix-search{flex:1 1 220px;max-width:340px}
.pk-tools .gc-input{width:auto;min-width:160px}
.pk-skel{height:360px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-card),var(--surface-subtle),var(--surface-card));background-size:200% 100%;animation:pk-sk 1.4s ease infinite}
.pk-skel--sm{height:72px}
@keyframes pk-sk{from{background-position:100% 0}to{background-position:-100% 0}}
@media (prefers-reduced-motion:reduce){.pk-skel{animation:none}}
@media (max-width:640px){
  .pk-two,.pk-three{grid-template-columns:minmax(0,1fr)}
  .pk-tools .ix-search,.pk-tools .gc-input{flex:1 1 100%;max-width:none}
  .pk-actions>.ix-btn{flex:1}
}
`;
