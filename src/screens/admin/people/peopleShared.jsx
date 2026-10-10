'use client';
// peopleShared — what the People pages share (/admin/staff · attendance · leave · payroll · reviews), copied from the
// merchant panel's staff-hr/hrShared.jsx and pointed at GridCommerce's own employees (lib/admin/people.js): the data
// hook, avatars, the person cell, status badges, a skeleton, money, and the CSS. Never reads the merchant lib/hr.js.

import React, { useEffect } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui';
import { formatBDT } from '@/lib/format';
import { useAdminStore } from '@/lib/admin/store';
import { staff as platformStaff } from '@/lib/platform/store';
import { people, catchUp, statusOf, ini } from '@/lib/admin/people';

/** The People data: { D, t, live }. Before load it is the demo at the design moment; once live, missed days are added. */
export function usePeople() {
  const { data, t, live } = useAdminStore(people);
  useEffect(() => { if (live) catchUp(); }, [live]);
  return { D: data, t, live };
}
/** The signed-in super admin staff member's name (the platform's demo staff switch). */
export const meName = () => (platformStaff() || {}).name || 'Admin';

export const money = (n) => formatBDT(Math.round(Math.abs(Number(n) || 0)));
export const minus = (n) => (n ? '−' + money(n) : '—');
export const plural = (n, one, many) => `${n} ${n === 1 ? one : many || one + 's'}`;
export const viewHref = (id, tab) => `/admin/staff/view?id=${encodeURIComponent(id)}${tab ? '&tab=' + tab : ''}`;

export const PEOPLE_CSS = `
.pp-num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.pp-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums;white-space:nowrap}
.pp-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.pp-id{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.pp-ok{color:var(--text-success)}
.pp-bad{color:var(--text-danger)}
.pp-warn{color:var(--text-warning)}
.pp-who{display:flex;align-items:center;gap:10px;min-width:0}
.pp-who>span:last-child{min-width:0}
.pp-who a{color:var(--text-heading);font-weight:var(--weight-medium);text-decoration:none}
.pp-who a:hover{color:var(--primary);text-decoration:underline}
.pp-av{display:inline-flex;flex:none;align-items:center;justify-content:center;width:32px;height:32px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.pp-av--lg{width:40px;height:40px;font-size:var(--text-sm)}
.ix-table .pp-av{width:28px;height:28px;font-size:var(--text-2xs)}
.pp-form{display:flex;flex-direction:column;gap:var(--space-4)}
.pp-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.pp-chip{display:inline-flex;align-items:center;gap:6px;height:20px;padding:0 8px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.pp-note{display:flex;gap:var(--space-2);align-items:flex-start;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);font-size:var(--text-xs);line-height:1.5}
.pp-note svg{flex:none;margin-top:1px}
.pp-note--warn{background:var(--fill-warning-soft);color:var(--text-warning)}
.pp-note--info{background:var(--fill-info-soft);color:var(--text-info)}
.pp-note--ok{background:var(--fill-success-soft);color:var(--text-success)}
.pp-bar{height:6px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.pp-bar>i{display:block;height:100%;border-radius:var(--radius-full);background:var(--primary)}
.pp-sub2{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);min-height:44px;padding:4px 8px 4px 12px;border-bottom:1px solid var(--border-subtle);font-size:var(--text-sm)}
.pp-step{display:inline-flex;align-items:center;gap:2px}
.pp-step b{padding:0 4px;font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap}
.pp-legend{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-3);margin-left:auto;font-size:var(--text-xs);color:var(--text-body)}
.pp-legend span{display:inline-flex;align-items:center;gap:6px}
.pp-legend i{width:10px;height:10px;border-radius:var(--radius-sm)}
.pp-empty{margin:0;padding:var(--space-4);font-size:var(--text-sm);color:var(--text-muted)}
.pp-skel{height:420px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-card),var(--surface-subtle),var(--surface-card));background-size:200% 100%;animation:pp-sk 1.4s ease infinite}
.pp-skel--strip{height:72px}
@keyframes pp-sk{from{background-position:100% 0}to{background-position:-100% 0}}
@media (prefers-reduced-motion:reduce){.pp-skel{animation:none}}
.pp-filters{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:8px;border-bottom:1px solid var(--border-subtle)}
.pp-filters .ix-search{flex:1 1 240px;max-width:360px}
.ix-table td .pp-sub{white-space:nowrap}
.pp-rows{display:flex;flex-direction:column}
.pp-row{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:40px;padding:6px 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.pp-row:first-child{border-top:0}
.pp-row>span:last-child{flex:none;text-align:right}
@media (max-width:640px){
  .pp-two{grid-template-columns:1fr}
  .pp-legend{margin-left:0}
}
`;

const AV_TONES = [
  ['var(--fill-info-soft)', 'var(--text-info)'], ['var(--fill-primary-soft)', 'var(--primary)'], ['var(--fill-warning-soft)', 'var(--text-warning)'],
  ['var(--fill-success-soft)', 'var(--text-success)'], ['var(--fill-error-soft)', 'var(--text-danger)'], ['var(--fill-secondary-soft)', 'var(--secondary)'],
];
const toneOf = (id) => AV_TONES[(Number(String(id).replace(/\D/g, '')) || 0) % AV_TONES.length];
export function Avatar({ e, large }) {
  const [bg, fg] = toneOf(e.id);
  return <span className={'pp-av' + (large ? ' pp-av--lg' : '')} style={{ background: bg, color: fg }} aria-hidden="true">{ini(e.name)}</span>;
}
/** Avatar + name (to the employee's page) + an optional second line. */
export function Person({ e, sub, tab }) {
  return (
    <div className="pp-who">
      <Avatar e={e} />
      <span><Link href={viewHref(e.id, tab)}>{e.name}</Link>{sub ? <span className="pp-sub">{sub}</span> : null}</span>
    </div>
  );
}
export function EmpStatus({ e }) {
  const s = statusOf(e);
  return <StatusBadge tone={s.tone}>{s.label}</StatusBadge>;
}
/** The page outline while the saved data loads. */
export function Skeleton({ label }) {
  return (
    <div className="ix-page" aria-busy="true" aria-label={label || 'Loading'}>
      <div className="pp-skel pp-skel--strip" />
      <div className="pp-skel" />
    </div>
  );
}
/** A row click that opens the record, unless the click was on a control inside the row. */
export const rowGo = (fn) => (ev) => { if (ev.target.closest('a,button,input,label,select,textarea')) return; fn(); };
/** Read ?key= after mount and keep it in the address. */
export function setParam(key, value) {
  try {
    const p = new URLSearchParams(window.location.search);
    if (value) p.set(key, value); else p.delete(key);
    const s = p.toString();
    window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
  } catch { /* ignore */ }
}

/** A label, the control, and its error (or a hint) under it. */
export function Field({ id, label, error, hint, children }) {
  return (
    <div className="gc-field">
      <label className="gc-label" htmlFor={id}>{label}</label>
      {children}
      {error ? <p className="gc-help gc-help--error" role="alert">{error}</p> : hint ? <p className="gc-help">{hint}</p> : null}
    </div>
  );
}
/** Props for an input or select inside a Field. */
export const ctl = (error, select) => ({ className: 'gc-input' + (select ? ' gc-select' : '') + (error ? ' gc-input--error' : ''), 'aria-invalid': error ? true : undefined });
/** A card with a title row. */
export function Card({ title, action, children, label, flush }) {
  return (
    <section className="ix-card" aria-label={label || title}>
      {title || action ? <div className="ix-card__head">{title ? <h2>{title}</h2> : <span />}{action || null}</div> : null}
      <div className={flush ? '' : 'ix-card__body'}>{children}</div>
    </section>
  );
}
