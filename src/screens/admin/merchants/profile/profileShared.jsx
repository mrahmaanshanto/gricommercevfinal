'use client';
// Merchant 360° profile — the parts every tab shares: the page's CSS, money and date text, a card, a form field,
// a list row, a usage meter, a one-line empty state, and the store's sales by month.
// Tabs get one `ctx` object from MerchantProfile.jsx:
//   { db, t, me, shop, sub, st, row, view, owed, open(kind, params), go(tab) }
// `open` shows an action sheet (ProfileActions.jsx); `go` switches the tab.

import React from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { taka, dmy, dm, hm, daysBetween, monthOf, yearOf } from '@/lib/platform/util';
import { profile } from '@/lib/platform/views';
import { salesSeries } from '@/lib/platform/merchant';

export const money = (n) => taka(n);
/** "Today 10:02" · "Yesterday" · "3 days ago" · "02 Sep" · "02 Sep 2025" */
export function when(ms, t) {
  if (!ms) return '—';
  const n = daysBetween(ms, t);
  if (n === 0) return 'Today ' + hm(ms);
  if (n === 1) return 'Yesterday';
  if (n > 1 && n < 7) return n + ' days ago';
  return yearOf(ms) === yearOf(t) ? dm(ms) : dmy(ms);
}
/** "in 6 days" · "today" · "3 days ago" for a date ahead or behind. */
export function dueText(ms, t) {
  const n = daysBetween(t, ms);
  if (n === 0) return 'today';
  if (n === 1) return 'tomorrow';
  if (n > 0) return `in ${n} days`;
  return `${-n} day${n === -1 ? '' : 's'} ago`;
}
export const HEALTH_TONE = { ok: 'success', warn: 'warning', err: 'error' };

/** The store's sales by month, from when it opened (lib/platform/merchant.js › salesSeries), with chart labels. */
export function salesByMonth(db, shop, t) {
  return salesSeries(db, shop, t, profile(shop)).map((m) => ({ ...m, label: monthOf(m.t), title: `${monthOf(m.t)} ${yearOf(m.t)}` }));
}

export function Card({ title, action, children, label, flush, bare }) {
  return (
    <section className="ix-card" aria-label={label || title}>
      {title || action ? <div className="ix-card__head">{title ? <h2>{title}</h2> : <span />}{action || null}</div> : null}
      <div className={bare ? 'mp-bare' : flush ? 'mp-flush' : 'ix-card__body'}>{children}</div>
    </section>
  );
}

/** A label, the control, and its error (or a hint) under it. */
export function Field({ id, label, error, hint, children }) {
  return (
    <div className="gc-field">
      <label className="gc-label" htmlFor={id}>{label}</label>
      {children}
      {error ? <p className="gc-help gc-help--error" id={id + '-err'} role="alert">{error}</p> : hint ? <p className="gc-help">{hint}</p> : null}
    </div>
  );
}
/** Props for an input or select inside a Field: the class, and aria-invalid when it has an error. */
export const ctl = (error, select) => ({ className: 'gc-input' + (select ? ' gc-select' : '') + (error ? ' gc-input--error' : ''), 'aria-invalid': error ? true : undefined });

/** One line of a list: a title, a small line under it, and whatever sits at the end. */
export function Row({ title, sub, end, icon }) {
  return (
    <div className="mp-row">
      {icon ? <span className="mp-row__ic" aria-hidden="true"><Icon name={icon} width="16" height="16" /></span> : null}
      <span className="mp-row__main"><b>{title}</b>{sub ? <small>{sub}</small> : null}</span>
      {end ? <span className="mp-row__end">{end}</span> : null}
    </div>
  );
}

/** One line plus one action. */
export function Empty({ text, action }) {
  return (
    <p className="mp-empty">
      <span>{text}</span>
      {action && action.href ? <Link className="ix-btn ix-btn--sm" href={action.href}>{action.label}</Link> : action ? <button type="button" className="ix-btn ix-btn--sm" onClick={action.onClick}>{action.label}</button> : null}
    </p>
  );
}

/** Used against a limit: a bar that turns amber at 80% and red over 100%. */
export function Meter({ used, limit, unlimited, label }) {
  const pct = unlimited || !limit ? 0 : Math.round((used / limit) * 100);
  const tone = unlimited ? '' : pct > 100 ? ' is-err' : pct >= 80 ? ' is-warn' : '';
  return (
    <span className="mp-meter" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={unlimited ? undefined : limit} aria-valuenow={used}>
      <span className={'mp-meter__fill' + tone} style={{ width: (unlimited ? 4 : Math.min(100, pct)) + '%' }} />
    </span>
  );
}

export const PROFILE_CSS = `
.mp-tabs{padding:var(--space-2) var(--space-2)}
.mp-flush{padding:var(--space-1) var(--space-4) var(--space-3)}
.mp-bare{padding-top:var(--space-3)}
.mp-row{display:flex;align-items:center;gap:var(--space-3);min-height:44px;padding:6px 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-body)}
.mp-row:first-child{border-top:0}
.mp-row__ic{flex:none;display:grid;place-items:center;width:28px;height:28px;border-radius:var(--radius-full);background:var(--surface-subtle);color:var(--text-muted)}
.mp-row__main{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.mp-row__main b{font-weight:var(--weight-medium);color:var(--text-heading);overflow-wrap:anywhere}
.mp-row__main small{font-size:var(--text-xs);color:var(--text-muted);overflow-wrap:anywhere}
.mp-row__end{flex:none;display:flex;align-items:center;gap:var(--space-2)}
a.mp-row{text-decoration:none}
a.mp-row:hover b,button.mp-row:hover b{color:var(--primary)}
button.mp-row{width:100%;border-left:0;border-right:0;border-bottom:0;background:none;font:inherit;text-align:left;cursor:pointer}
.mp-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums;font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap}
.mp-data{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.mp-muted{color:var(--text-muted)}
.mp-bad{color:var(--text-danger)}
.mp-empty{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3);margin:0;padding:var(--space-2) 0;font-size:var(--text-sm);color:var(--text-muted)}
.mp-grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-4);align-items:start}
.mp-banner{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);padding:var(--space-3) var(--space-4);border-radius:var(--radius-xl);background:var(--fill-warning-soft);font-size:var(--text-sm);color:var(--text-heading)}
.mp-banner--err{background:var(--fill-error-soft)}
.mp-banner--ok{background:var(--fill-success-soft)}
.mp-banner>svg{flex:none}
.mp-banner p{flex:1;min-width:200px;margin:0}
.mp-banner b{font-family:var(--font-data);font-weight:var(--weight-semibold)}
.mp-note{display:flex;gap:var(--space-2);align-items:flex-start;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm);color:var(--text-body)}
.mp-note--pin{background:var(--fill-warning-soft)}
.mp-note>div{flex:1;min-width:0}
.mp-note small{display:block;margin-top:2px;font-size:var(--text-xs);color:var(--text-muted)}
.mp-note.is-done p{text-decoration:line-through;color:var(--text-muted)}
.mp-note p{margin:0;overflow-wrap:anywhere}
.mp-notes{display:flex;flex-direction:column;gap:var(--space-2)}
.mp-add{display:flex;flex-direction:column;gap:var(--space-2);margin-top:var(--space-3)}
.mp-add__bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-2);font-size:var(--text-sm)}
.mp-add__bar label{display:inline-flex;align-items:center;gap:var(--space-2)}
.mp-contact{display:flex;flex-wrap:wrap;gap:var(--space-2);margin-top:var(--space-3)}
.mp-meter{display:block;height:8px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.mp-meter__fill{display:block;height:100%;border-radius:var(--radius-full);background:var(--viz-1)}
.mp-meter__fill.is-warn{background:var(--warning)}
.mp-meter__fill.is-err{background:var(--error)}
.mp-res{display:grid;grid-template-columns:minmax(120px,1fr) minmax(80px,2fr) minmax(120px,auto);align-items:center;gap:var(--space-3);min-height:44px;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.mp-res:first-child{border-top:0}
.mp-res>span:last-child{text-align:right;white-space:nowrap}
.mp-mods{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:var(--space-6)}
.mp-mods .mp-row:nth-child(2){border-top:0}
.mp-sum{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px var(--space-4);margin:0;font-size:var(--text-sm)}
.mp-sum dt{color:var(--text-body)}
.mp-sum dd{margin:0;text-align:right;font-family:var(--font-data);font-variant-numeric:tabular-nums;color:var(--text-heading)}
.mp-sum .is-total{padding-top:6px;border-top:1px solid var(--border-subtle);font-weight:var(--weight-semibold)}
.mp-form{display:flex;flex-direction:column;gap:var(--space-3)}
.mp-form__two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.mp-form__check{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-body)}
.mp-warn{margin:0;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--fill-warning-soft);font-size:var(--text-sm);color:var(--text-heading)}
.mp-danger{margin:0;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--fill-error-soft);font-size:var(--text-sm);color:var(--text-danger)}
.mp-formerr{margin:0;font-size:var(--text-sm);color:var(--text-danger)}
.mp-tools{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.mp-key{display:flex;align-items:center;gap:var(--space-2)}
.mp-key code{font-family:var(--font-data);font-size:var(--text-sm);color:var(--text-heading);overflow-wrap:anywhere}
.mp-dot{display:inline-block;width:8px;height:8px;border-radius:var(--radius-full);background:var(--success)}
.mp-dot.is-warn{background:var(--warning)}.mp-dot.is-err{background:var(--error)}
.mp-skel{height:220px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-card),var(--surface-subtle),var(--surface-card));background-size:200% 100%;animation:mp-sk 1.4s ease infinite}
.mp-skel--head{height:56px}.mp-skel--tabs{height:44px}
@keyframes mp-sk{from{background-position:100% 0}to{background-position:-100% 0}}
.mp-err{display:flex;flex-direction:column;align-items:center;gap:var(--space-3);padding:var(--space-8) var(--space-4);text-align:center;font-size:var(--text-sm)}
.mp-table td .gc-badge{white-space:nowrap}
@media (max-width:1023px){.mp-grid2{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){
  .mp-mods,.mp-form__two{grid-template-columns:minmax(0,1fr)}
  .mp-mods .mp-row:nth-child(2){border-top:1px solid var(--border-subtle)}
  .mp-res{grid-template-columns:minmax(0,1fr) auto;row-gap:4px;padding:6px 0}
  .mp-res>.mp-meter{grid-column:1/-1;grid-row:2}
  .mp-row__end .ix-btn--sm{height:36px}
  .mp-contact .ix-btn{height:40px;flex:1}
  .mp-wide{display:none}  /* owner and domain are on the Overview's Owner and Store cards */
}
@media (prefers-reduced-motion:reduce){.mp-skel{animation:none}}
`;
