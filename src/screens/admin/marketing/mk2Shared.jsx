'use client';
// Marketing, part 2 (Social media, Google Business, Promotions, Affiliates) — the parts the pages share: the data hook,
// CSS, money and number text, a form field, the source badge (Google API / GridCommerce / Placeholder), stars, the
// skeleton and copy-to-clipboard. Data: lib/admin/marketing2.js (createStore 'marketing2').

import React, { useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { StatusBadge, Dialog } from '@/components/ui';
import { formatBDT } from '@/lib/format';
import { num, dm, hm, TZ, dhaka } from '@/lib/platform/util';
import { useAdminStore } from '@/lib/admin/store';
import { mk2, SUPPORT_LABEL } from '@/lib/admin/marketing2';
import { usePlatform } from '../AdminShell';

export const money = (n) => formatBDT(Math.round(Number(n) || 0));
export const plural = (n, one, many) => num(n) + ' ' + (n === 1 ? one : many || one + 's');
export const pct = (x, d = 1) => (x == null || !isFinite(x) ? '—' : x.toFixed(d) + '%');
export const short = (n) => (n >= 100000 ? (n / 100000).toFixed(1).replace(/\.0$/, '') + 'L' : n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(Math.round(n || 0)));
export const dayTime = (ms) => (ms ? `${dm(ms)}, ${hm(ms)}` : '—');
export { num };

/** The platform (stores) and this module's data; `live` once both are loaded after mount. */
export function useMk2() {
  const p = usePlatform();
  const { data, t, live } = useAdminStore(mk2);
  return { data, t, live: live && p.live, db: p.db };
}

// ---- dates for inputs (Dhaka wall clock) ------------------------------------------------------------------------
export const toInput = (ms) => (ms ? new Date(ms + TZ).toISOString().slice(0, 16) : '');
export const toDateInput = (ms) => toInput(ms).slice(0, 10);
export function fromInput(s, hour = 0) {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(s || '');
  return m ? dhaka(+m[1], +m[2] - 1, +m[3], m[4] ? +m[4] : hour, m[5] ? +m[5] : 0) : null;
}

/** A label, the control, and its error (or a hint) under it. */
export function Field({ id, label, error, hint, optional, children, tip }) {
  return (
    <div className="gc-field">
      <label className="gc-label" htmlFor={id}>{label}{optional ? <span className="mk-opt"> (optional)</span> : null}{tip || null}</label>
      {children}
      {error ? <p className="gc-help gc-help--error" id={id + '-err'} role="alert">{error}</p> : hint ? <p className="gc-help">{hint}</p> : null}
    </div>
  );
}
export const ctl = (error, select) => ({ className: 'gc-input' + (select ? ' gc-select' : '') + (error ? ' gc-input--error' : ''), 'aria-invalid': error ? true : undefined });

/** Where a part's data comes from: the Google Business Profile APIs, GridCommerce itself, or a placeholder. */
export function SourceBadge({ kind }) {
  const [label, tone] = SUPPORT_LABEL[kind] || SUPPORT_LABEL.ours;
  return <StatusBadge tone={tone} icon={kind === 'google' ? 'plug' : kind === 'placeholder' ? 'construction' : 'sparkles'}>{label}</StatusBadge>;
}

export const Stars = ({ n, size = 14 }) => (
  <span className="mk-stars" role="img" aria-label={`${n} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((i) => <Icon key={i} name="star" width={size} height={size} className={i <= n ? '' : 'off'} fill="currentColor" aria-hidden="true" />)}
  </span>
);

export function copyText(text, msg = 'Copied') {
  try { if (navigator.clipboard) navigator.clipboard.writeText(text); } catch { /* clipboard blocked: the toast still shows it */ }
  toast(msg);
}

export function Skeleton({ label = 'Loading' }) {
  return (
    <div className="ix-page" aria-busy="true" aria-label={label}>
      <div className="mk-skel mk-skel--strip" />
      <div className="mk-skel" />
    </div>
  );
}

/** An error line under a form. */
export const FormError = ({ error }) => (error ? <p className="mk-formerr" role="alert"><Icon name="circle-alert" width="14" height="14" aria-hidden="true" /> {error}</p> : null);

/** Ask for a reason (pause, end, reject …). onConfirm(reason) returns { ok, error } or nothing. */
export function ReasonDialog({ open, title, body, label = 'Reason', confirmLabel = 'Confirm', danger, onClose, onConfirm }) {
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  if (!open) return null;
  const close = () => { setText(''); setErr(''); onClose(); };
  const go = () => {
    if (!text.trim()) { setErr('Say why, for the record.'); return; }
    const r = onConfirm(text.trim());
    if (r && r.ok === false) { setErr(r.error); return; }
    setText(''); setErr('');
  };
  return (
    <Dialog open title={title} onClose={close} footer={<>
      <button type="button" className="gc-btn gc-btn--neutral" onClick={close}>Cancel</button>
      <button type="button" className={'gc-btn ' + (danger ? 'gc-btn--solid gc-btn--error' : 'gc-btn--solid')} onClick={go}>{confirmLabel}</button>
    </>}>
      <div className="mk-form">
        {body ? <p style={{ margin: 0 }}>{body}</p> : null}
        <Field id="mk-reason" label={label} error={err}>
          <textarea id="mk-reason" data-autofocus {...ctl(err)} rows={3} value={text} onChange={(e) => { setText(e.target.value); setErr(''); }} />
        </Field>
      </div>
    </Dialog>
  );
}

export const MK_CSS = `
.mk-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums;font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap}
.mk-data{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.mk-sub{display:block;font-size:var(--text-xs);color:var(--text-muted);overflow:hidden;text-overflow:ellipsis}
.mk-cell{display:flex;flex-direction:column;min-width:0;max-width:280px}
.mk-cell>b,.mk-cell>a{overflow:hidden;font-weight:var(--weight-medium);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.mk-form{display:flex;flex-direction:column;gap:var(--space-3)}
.mk-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.mk-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3)}
.mk-opt{font-weight:var(--weight-regular);color:var(--text-muted)}
.mk-sec{margin:var(--space-1) 0 0;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.mk-formerr{display:flex;align-items:center;gap:6px;margin:0;font-size:var(--text-sm);color:var(--text-danger)}
.mk-note{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.mk-body{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-3) var(--space-4) var(--space-4)}
.mk-row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.mk-icons{display:inline-flex;align-items:center;gap:3px}
.mk-stars{display:inline-flex;gap:1px;color:var(--warning)}
.mk-stars .off{color:var(--slate-300)}
.mk-checks{display:flex;flex-wrap:wrap;gap:6px}
.mk-check{display:inline-flex;align-items:center;gap:6px;min-height:28px;padding:0 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);font-size:var(--text-xs);color:var(--text-body);cursor:pointer}
.mk-check:has(input:checked){border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.mk-check input{width:14px;height:14px;margin:0;accent-color:var(--primary)}
.mk-sum{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-2)}
.mk-sum div{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-page)}
.mk-sum span{font-size:var(--text-xs);color:var(--text-muted)}
.mk-sum b{font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.mk-list{display:flex;flex-direction:column}
.mk-li{display:flex;align-items:center;gap:var(--space-3);min-height:44px;padding:var(--space-2) var(--space-4);border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.mk-list>.mk-li:first-child{border-top:0}
.mk-li__main{display:flex;flex:1;flex-direction:column;min-width:0}
.mk-li__main>b{overflow:hidden;font-weight:var(--weight-medium);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.mk-tabs{padding:var(--space-2)}
.mk-banner{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);padding:var(--space-3) var(--space-4);border-radius:var(--radius-xl);font-size:var(--text-sm);color:var(--text-heading)}
.mk-banner--warn{background:var(--fill-warning-soft)}
.mk-banner--err{background:var(--fill-error-soft)}
.mk-banner--ok{background:var(--fill-success-soft)}
.mk-banner p{flex:1;min-width:200px;margin:0}
.mk-banner>svg{flex:none}
.ix-table tbody tr:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.mk-skel{height:420px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-card),var(--surface-subtle),var(--surface-card));background-size:200% 100%;animation:mk-sk 1.4s ease infinite}
.mk-skel--strip{height:76px}
@keyframes mk-sk{from{background-position:100% 0}to{background-position:-100% 0}}
@media (prefers-reduced-motion:reduce){.mk-skel{animation:none}}
@media (max-width:640px){
  .mk-two,.mk-three{grid-template-columns:minmax(0,1fr)}
  .mk-sum{grid-template-columns:repeat(2,minmax(0,1fr))}
  .mk-check{min-height:36px}
}
`;
