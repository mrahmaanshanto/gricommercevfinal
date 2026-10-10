'use client';
// Finance — what the five Finance pages share (/admin/finance · revenue · payments · expenses · accounts): the CSS
// (classes fn-*, the merchant Accounts pages' look: to-do pills, figures, ledger rows, summary blocks), money and date
// words, the data hook (platform + lib/admin/finance, caught up to today), form parts, the letterhead for printing
// (copied from components/reports/PrintLetterhead, with GridCommerce's own details instead of the merchant's), and the
// address helpers (?tab=, ?id=). Never reads a merchant lib.

import React, { useEffect, useState } from 'react';
import { Sheet, StatusBadge } from '@/components/ui';
import { formatBDT } from '@/lib/format';
import { TZ, dhaka, daysBetween, dm, dmy, hm } from '@/lib/platform/util';
import { useAdminStore } from '@/lib/admin/store';
import { finance, catchUp, COMPANY, EXP_STATUS, REFUND_STATUS, accountBy } from '@/lib/admin/finance';
import { usePlatform } from '../AdminShell';

// ---- data ---------------------------------------------------------------------------------------------------------
/** The platform's data and the finance books, both loaded; ready = both live (worked out after mount only). */
export function useFinance() {
  const { db, t, live } = usePlatform();
  const fin = useAdminStore(finance);
  useEffect(() => { if (fin.live) catchUp(); }, [fin.live]);
  return { db, F: fin.data, t, ready: live && fin.live };
}

/** One colour per revenue source, the same on every Finance chart. */
export const SOURCE_COLORS = { subs: 'var(--viz-1)', addons: 'var(--viz-3)', messaging: 'var(--viz-4)', oneoffs: 'var(--viz-7)' };

// ---- words --------------------------------------------------------------------------------------------------------
export const money = (n) => formatBDT(Math.round(Math.abs(Number(n) || 0)));
export const signed = (n) => (n < 0 ? '−' : '+') + money(n);
export const net = (n) => (n < 0 ? '−' : '') + money(n);
/** ৳1.25 L · ৳3.4 Cr for big figures. */
export const short = (n) => {
  const v = Math.abs(Number(n) || 0);
  const sign = n < 0 ? '−' : '';
  if (v >= 1e7) return sign + '৳' + (v / 1e7).toFixed(2).replace(/\.?0+$/, '') + ' Cr';
  if (v >= 1e5) return sign + '৳' + (v / 1e5).toFixed(2).replace(/\.?0+$/, '') + ' L';
  return sign + money(v);
};
export const tick = (n) => (n >= 1e5 ? (n / 1e5).toFixed(n >= 1e6 ? 0 : 1).replace(/\.0$/, '') + 'L' : n >= 1e3 ? Math.round(n / 1e3) + 'k' : String(Math.round(n)));
export const plural = (n, one, many) => `${n} ${n === 1 ? one : many || one + 's'}`;
export const pct = (a, b) => (b ? Math.round((a / b) * 100) + '%' : '—');
/** "Today 10:02" · "Yesterday" · "3 days ago" · "02 Sep" · "02 Sep 2025" */
export function when(ms, t) {
  if (!ms) return '—';
  const n = daysBetween(ms, t);
  if (n === 0) return 'Today ' + hm(ms);
  if (n === 1) return 'Yesterday ' + hm(ms);
  if (n > 1 && n < 7) return n + ' days ago';
  return new Date(ms + TZ).getUTCFullYear() === new Date(t + TZ).getUTCFullYear() ? dm(ms) : dmy(ms);
}
export { dm, dmy, hm };
/** yyyy-mm-dd in Dhaka time, for a date input. */
export const dateInput = (ms) => new Date(ms + TZ).toISOString().slice(0, 10);
/** A date input's value -> ms at hour h (Dhaka). */
export const fromDateInput = (v, h = 12, m = 0) => { const [y, mo, d] = String(v).split('-').map(Number); return y ? dhaka(y, mo - 1, d, h, m) : null; };

export const ExpBadge = ({ status }) => <StatusBadge tone={(EXP_STATUS[status] || {}).tone}>{(EXP_STATUS[status] || { label: status }).label}</StatusBadge>;
export const RefundBadge = ({ status }) => <StatusBadge tone={(REFUND_STATUS[status] || {}).tone}>{(REFUND_STATUS[status] || { label: status }).label}</StatusBadge>;

// ---- the address ----------------------------------------------------------------------------------------------------
export const readParams = () => new URLSearchParams(window.location.search);
/** Set (or clear, with '' / null) params in the address without a reload. */
export function setParams(obj) {
  const p = new URLSearchParams(window.location.search);
  for (const [k, v] of Object.entries(obj)) { if (v == null || v === '') p.delete(k); else p.set(k, v); }
  const s = p.toString();
  window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
}
/** A table row's click opens the record unless a link, button or box inside it was clicked. */
export const rowGo = (fn) => (ev) => { if (ev.target.closest('a,button,input,label,select,textarea')) return; fn(); };
export const rowKey = (fn) => (ev) => { if (ev.key === 'Enter' && ev.target === ev.currentTarget) fn(); };

// ---- form parts -------------------------------------------------------------------------------------------------------
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
/** The error for one field from a lib result ({ error, field }). */
export const errOf = (err, f) => (err && err.field === f ? err.error : null);

/** A side panel holding a form: Cancel and the submit button in its foot; a lib error without a field shows above the foot. */
export function FormSheet({ id, title, close, onSubmit, submit, danger, disabled, err, extra, children }) {
  return (
    <Sheet open title={title} onClose={close} footer={(
      <>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={close}>Cancel</button>
        {extra}
        <button type="submit" form={id} disabled={disabled} className={'gc-btn ' + (danger ? 'gc-btn--error gc-btn--solid' : 'gc-btn--solid')}>{submit}</button>
      </>
    )}>
      <form id={id} className="fn-form" noValidate onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        {children}
        {err && err.error && !err.field ? <p className="fn-formerr" role="alert">{err.error}</p> : null}
      </form>
    </Sheet>
  );
}

/** A select of the company's accounts, each with its balance. */
export function AccountSelect({ id, F, bal, value, onChange, error, exclude, label = 'Account' }) {
  return (
    <Field id={id} label={label} error={error}>
      <select id={id} {...ctl(error, true)} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Pick an account</option>
        {F.accounts.filter((a) => a.id !== exclude).map((a) => <option key={a.id} value={a.id}>{a.name}{bal ? ' · ' + money(bal[a.id]) : ''}</option>)}
      </select>
    </Field>
  );
}
export const accName = (F, id) => (accountBy(F, id) || { name: id || '—' }).name;

// ---- states -------------------------------------------------------------------------------------------------------------
export function Skeleton({ label = 'Loading', strip = true }) {
  return (
    <div className="ix-page" aria-busy="true" aria-label={label} style={{ padding: 0 }}>
      {strip ? <div className="fn-skel fn-skel--strip" /> : null}
      <div className="fn-skel" />
    </div>
  );
}
export function ErrorCard({ what = 'The figures' }) {
  return (
    <section className="ix-card"><div className="fn-err" role="alert">
      <p style={{ margin: 0 }}>{what} could not be worked out.</p>
      <button type="button" className="ix-btn" onClick={() => window.location.reload()}>Try again</button>
    </div></section>
  );
}
/** A card with a head (title + an optional link or control) and a padded body. */
export function Card({ title, action, children, label, flush }) {
  return (
    <section className="ix-card" aria-label={label || title}>
      <div className="ix-card__head"><h2>{title}</h2>{action || null}</div>
      {flush ? children : <div className="fn-body">{children}</div>}
    </section>
  );
}

// ---- printing (letterhead) --------------------------------------------------------------------------------------------
export function Letterhead({ kind, title, meta = [] }) {
  return (
    <div className="fn-doc" aria-hidden="true">
      <header className="fn-lh">
        <div className="fn-lh__brand">
          <svg width="44" height="44" viewBox="0 0 52 52"><rect width="52" height="52" rx="12" fill="var(--primary)" /><path d="M35 19a10 10 0 1 0 1 13v-6h-9" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <div><b>{COMPANY.name}</b><span>{COMPANY.address}</span><span>{COMPANY.phone} · {COMPANY.email}</span><span>{COMPANY.web} · BIN {COMPANY.bin}</span></div>
        </div>
        <div className="fn-lh__meta">
          <span className="fn-lh__kind">{kind}</span>
          <h2>{title}</h2>
          <dl>{meta.map(([k, v]) => <React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>)}</dl>
        </div>
      </header>
    </div>
  );
}
export function SignOff({ when: w }) {
  return (
    <div className="fn-doc" aria-hidden="true">
      <div className="fn-sign"><div>Prepared by</div><div>Checked by</div><div>Approved by</div></div>
      <p className="fn-end">Generated from the GridCommerce super admin on {w}. Figures as recorded in the company’s books at that time.</p>
    </div>
  );
}
/** Print rules for the frame printNode makes (A4, the letterhead shown). */
export const PRINT_CSS = `
@page{size:A4 portrait;margin:14mm 12mm 16mm}
.fn-doc{display:block!important}
.fn-noprint{display:none!important}
.ix-card{box-shadow:none!important;border:1px solid var(--border-subtle)!important;break-inside:avoid}
`;

// ---- styles ---------------------------------------------------------------------------------------------------------------
export const FIN_CSS = `
.fn-top{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.fn-body{padding:var(--space-3) var(--space-4) var(--space-4)}
.fn-grid{display:grid;gap:var(--space-4);align-items:start}
.fn-grid--2{grid-template-columns:minmax(0,2fr) minmax(0,1fr)}
.fn-grid--half{grid-template-columns:repeat(2,minmax(0,1fr))}
.fn-big{display:flex;align-items:baseline;flex-wrap:wrap;gap:var(--space-2);margin:0 0 var(--space-3);font-family:var(--font-data);font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--text-heading)}
.fn-big small{font-family:var(--font-sans);font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.fn-foot{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-5);margin-top:var(--space-3);padding-top:var(--space-3);border-top:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-muted)}
.fn-foot b{margin-left:4px;font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.fn-legend{margin-top:var(--space-3)}
.fn-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums;color:var(--text-heading);white-space:nowrap}
.fn-in{color:var(--text-success)}
.fn-out{color:var(--text-danger)}
.fn-muted{color:var(--text-muted)}
.fn-bad{color:var(--text-danger)}
.fn-data{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.fn-name{display:flex;flex-direction:column;min-width:0;max-width:260px}
.fn-name>a,.fn-name>b,.fn-name>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fn-name>b{font-weight:var(--weight-medium);color:var(--text-heading)}
.fn-name small{overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.fn-filters{padding:8px;border-bottom:1px solid var(--border-subtle)}
.fn-filters .gc-filterbar__search{max-width:320px}
.fn-tfoot{display:inline-flex;flex-wrap:wrap;gap:4px var(--space-3)}
.fn-tfoot b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ix-table tbody tr:focus-visible td{background:var(--surface-subtle)}
.ix-table tbody tr:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.ix-table tr.fn-total td,.ix-table tr.fn-total th{font-weight:var(--weight-semibold);color:var(--text-heading);background:var(--surface-subtle)}
.ix-table tbody tr.fn-total{cursor:default}
.ix-table tbody tr.fn-total:hover td{background:var(--surface-subtle)}
.fn-todo{display:flex;flex-direction:column;padding:var(--space-1) var(--space-2) var(--space-2)}
.fn-todo a{display:flex;align-items:center;gap:var(--space-3);min-height:48px;padding:6px var(--space-2);border-radius:var(--radius-lg);color:inherit;text-decoration:none}
.fn-todo a:hover{background:var(--surface-subtle)}
.fn-todo__ic{flex:none;display:grid;place-items:center;width:32px;height:32px;border-radius:var(--radius-full);background:var(--fill-warning-soft);color:var(--text-warning)}
.fn-todo__ic--err{background:var(--fill-error-soft);color:var(--text-danger)}
.fn-todo__txt{flex:1;min-width:0;display:flex;flex-direction:column}
.fn-todo__txt b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.fn-todo__txt small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-xs);color:var(--text-muted)}
.fn-todo a>svg{flex:none;color:var(--text-muted)}
.fn-done{display:inline-flex;align-items:center;gap:var(--space-2);padding:var(--space-3) var(--space-4);font-size:var(--text-sm);color:var(--text-success)}
.fn-rows{display:flex;flex-direction:column}
.fn-row{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:40px;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-body);text-decoration:none}
.fn-row:first-child{border-top:0}
.fn-row b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums;white-space:nowrap}
a.fn-row:hover,button.fn-row:hover{color:var(--primary)}
.fn-row--btn{width:100%;padding:0;border:0;border-top:1px solid var(--border-subtle);background:none;font:inherit;text-align:left;cursor:pointer}
.fn-row--total{font-weight:var(--weight-semibold);color:var(--text-heading)}
.fn-donut{display:flex;align-items:center;gap:var(--space-4)}
.fn-donut .dch-legend{flex-direction:column;align-items:flex-start}
.fn-sum{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px var(--space-4);margin:0;font-size:var(--text-sm)}
.fn-sum dt{color:var(--text-body)}
.fn-sum dd{margin:0;text-align:right;font-family:var(--font-data);font-variant-numeric:tabular-nums;color:var(--text-heading)}
.fn-sum .is-head{grid-column:1/-1;margin-top:var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted)}
.fn-sum .is-head:first-child{margin-top:0}
.fn-sum .is-sub{padding-left:var(--space-3)}
.fn-sum .is-total{padding-top:6px;border-top:1px solid var(--border-subtle);font-weight:var(--weight-semibold);color:var(--text-heading)}
.fn-form{display:flex;flex-direction:column;gap:var(--space-3)}
.fn-form__two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.fn-formerr{margin:0;font-size:var(--text-sm);color:var(--text-danger)}
.fn-note{margin:0;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm);color:var(--text-body)}
.fn-note--warn{background:var(--fill-warning-soft);color:var(--text-heading)}
.fn-sheet{display:flex;flex-direction:column;gap:var(--space-4)}
.fn-sheet h3{margin:0 0 var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted)}
.fn-sheet__big{display:flex;align-items:baseline;justify-content:space-between;gap:var(--space-3);padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.fn-sheet__big b{font-family:var(--font-data);font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--text-heading)}
.fn-trail{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;font-size:var(--text-xs);color:var(--text-body)}
.fn-trail li{display:flex;gap:var(--space-2)}
.fn-trail time{flex:none;min-width:96px;font-family:var(--font-data);color:var(--text-muted)}
.fn-attach{display:inline-flex;align-items:center;gap:6px;font-size:var(--text-sm);color:var(--text-heading)}
.fn-skel{height:360px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-card),var(--surface-subtle),var(--surface-card));background-size:200% 100%;animation:fn-sk 1.4s ease infinite}
.fn-skel--strip{height:72px;margin-bottom:var(--space-4)}
@keyframes fn-sk{from{background-position:100% 0}to{background-position:-100% 0}}
.fn-err{display:flex;flex-direction:column;align-items:center;gap:var(--space-3);padding:var(--space-8) var(--space-4);text-align:center;font-size:var(--text-sm);color:var(--text-body)}
.fn-empty{margin:0;padding:var(--space-2) 0;font-size:var(--text-sm);color:var(--text-muted)}
.fn-pick{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.fn-est{display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.fn-doc{display:none}
.fn-lh{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;padding-bottom:12px;border-bottom:2px solid var(--primary);margin-bottom:12px}
.fn-lh__brand{display:flex;gap:12px;align-items:flex-start}
.fn-lh__brand b{display:block;font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
.fn-lh__brand span{display:block;font-size:var(--text-xs);line-height:1.5;color:var(--text-body)}
.fn-lh__meta{text-align:right;max-width:55%}
.fn-lh__kind{display:block;font-size:var(--text-xs);letter-spacing:.08em;text-transform:uppercase;color:var(--primary);font-weight:var(--weight-semibold)}
.fn-lh__meta h2{margin:2px 0 6px;font-size:var(--text-xl);line-height:1.2;font-weight:var(--weight-semibold);color:var(--text-heading)}
.fn-lh__meta dl{margin:0;display:grid;grid-template-columns:auto auto;justify-content:end;gap:1px 10px;font-size:var(--text-xs)}
.fn-lh__meta dt{color:var(--text-muted)}
.fn-lh__meta dd{margin:0;color:var(--text-heading);font-weight:var(--weight-medium);text-align:right}
.fn-sign{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin-top:34px;break-inside:avoid}
.fn-sign div{border-top:1px solid var(--text-body);padding-top:4px;font-size:var(--text-xs);color:var(--text-muted)}
.fn-end{margin-top:10px;font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:1023px){.fn-grid--2,.fn-grid--half{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){
  .fn-filters{padding:6px}
  .fn-form__two{grid-template-columns:minmax(0,1fr)}
  .fn-donut{flex-direction:column;align-items:flex-start}
  .fn-big{font-size:var(--text-lg)}
}
@media (prefers-reduced-motion:reduce){.fn-skel{animation:none}}
`;

/** A row of a phone list or a small panel: a sheet with a record's facts. */
export function DetailSheet({ title, close, footer, children }) {
  return <Sheet open title={title} onClose={close} footer={footer}><div className="fn-sheet">{children}</div></Sheet>;
}
/** A hook for a Sheet's error state from a lib result. */
export function useErr() {
  const [err, setErr] = useState(null);
  return [err, (r) => setErr(r && !r.ok ? { error: r.error || 'That did not work.', field: r.field || null } : null)];
}
