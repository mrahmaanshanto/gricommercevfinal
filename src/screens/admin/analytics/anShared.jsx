'use client';
// anShared — what the Analytics pages (/admin/analytics…) and Reports share: the data hook (platform + this module's
// store, worked out after the saved data loads), the period and compare pickers kept in the address, number formats,
// a card, the loading outline, the error card, the change badge and the page CSS. Data: lib/admin/analytics.js.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { InfoTip } from '@/components/ui';
import { formatBDT } from '@/lib/format';
import { useAdminStore } from '@/lib/admin/store';
import { analytics, PERIODS, COMPARE, periodRange, compareRange, rangeLabel } from '@/lib/admin/analytics';
import { usePlatform } from '../AdminShell';

export const AN_CSS = `
.an-top{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.an-top .ix-head{flex:1 1 auto}
.an-tools{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.an-tools .ix-pick{max-width:220px}
.an-meta{margin:calc(var(--space-2) * -1) 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.an-grid{display:grid;gap:var(--space-4);align-items:start}
.an-grid--2{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
.an-grid--21{grid-template-columns:minmax(0,2fr) minmax(0,1fr)}
.an-grid--3{grid-template-columns:repeat(3,minmax(0,1fr))}
.an-body{padding:var(--space-3) var(--space-4) var(--space-4)}
.an-card-head{display:flex;align-items:center;gap:6px}
.an-big{display:flex;align-items:baseline;flex-wrap:wrap;gap:var(--space-2);margin:0 0 var(--space-3);font-family:var(--font-data);font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--text-heading)}
.an-big small{font-family:var(--font-sans);font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.an-foot{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-5);margin-top:var(--space-3);padding-top:var(--space-3);border-top:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-muted)}
.an-foot b{margin-left:4px;font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.an-rows{display:flex;flex-direction:column}
.an-row{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:40px;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-body);text-decoration:none}
.an-row:first-child{border-top:0}
.an-row>span:first-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.an-row b{flex:none;font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
.an-row small{margin-left:6px;font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
a.an-row:hover{color:var(--primary)}
.an-dot{display:inline-block;width:8px;height:8px;margin-right:8px;border-radius:var(--radius-full);vertical-align:middle}
.an-delta{display:inline-flex;align-items:center;gap:2px;font-family:var(--font-data);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.an-delta.is-good{color:var(--text-success)}.an-delta.is-bad{color:var(--text-danger)}.an-delta.is-flat{color:var(--text-muted)}
.an-funnel{display:flex;flex-direction:column;gap:var(--space-2)}
.an-step{display:grid;grid-template-columns:minmax(110px,160px) minmax(0,1fr) auto;align-items:center;gap:var(--space-3);min-height:36px;color:inherit;text-decoration:none}
.an-step__label{display:flex;flex-direction:column;min-width:0;font-size:var(--text-sm);color:var(--text-heading)}
.an-step__label small{font-size:var(--text-xs);color:var(--text-muted)}
.an-step__track{height:12px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.an-step__track span{display:block;height:100%;min-width:3px;border-radius:var(--radius-full);background:var(--viz-1)}
.an-step__val{text-align:right;font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.an-step__val small{display:block;font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
a.an-step:hover .an-step__label{color:var(--primary)}
.an-rate{margin:-2px 0 2px calc(min(160px, 30%) + var(--space-3));font-size:var(--text-xs);color:var(--text-muted)}
.an-donut{display:flex;align-items:center;gap:var(--space-4)}
.an-donut .dch-legend{flex-direction:column;align-items:flex-start}
.an-sub{margin:0 0 var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.an-links{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.an-chip{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font-size:var(--text-sm);color:var(--text-body);text-decoration:none}
.an-chip:hover{border-color:var(--border-strong);color:var(--text-heading)}
.an-seg{display:inline-flex;padding:2px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.an-seg button{height:28px;padding:0 var(--space-3);border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.an-seg button[aria-pressed="true"]{background:var(--surface-card);color:var(--text-heading);box-shadow:0 1px 2px rgba(15,23,42,.08)}
.an-table td.an-name{white-space:normal;min-width:160px}
.an-table td.an-name b{display:block;font-weight:var(--weight-medium);color:var(--text-heading)}
.an-table td.an-name small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.an-table td.ix-num,.an-table th.ix-num{font-family:var(--font-data)}
.an-table tfoot td{height:40px;padding:6px 12px;border-top:2px solid var(--border-subtle);background:var(--surface-subtle);font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap}
.an-table tfoot td.ix-num{text-align:right;font-family:var(--font-data)}
.an-table a{color:var(--text-link);text-decoration:none}
.an-table a:hover{text-decoration:underline}
.an-heat{display:inline-block;min-width:52px;padding:2px 8px;border-radius:var(--radius-md);text-align:right}
.an-skel{height:260px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-card),var(--surface-subtle),var(--surface-card));background-size:200% 100%;animation:an-sk 1.4s ease infinite}
.an-skel--strip{height:72px}
@keyframes an-sk{from{background-position:100% 0}to{background-position:-100% 0}}
.an-err{display:flex;flex-direction:column;align-items:center;gap:var(--space-3);padding:var(--space-8) var(--space-4);text-align:center;font-size:var(--text-sm);color:var(--text-body)}
.an-empty{padding:var(--space-6) var(--space-4);text-align:center;font-size:var(--text-sm);color:var(--text-muted)}
@media (max-width:1180px){.an-grid--3{grid-template-columns:repeat(2,minmax(0,1fr))}.an-grid--3>:last-child{grid-column:1/-1}}
@media (max-width:1023px){.an-grid--2,.an-grid--21{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){
  .an-grid--3{grid-template-columns:minmax(0,1fr)}
  .an-tools{width:100%}
  .an-tools>*{flex:1 1 140px;max-width:none!important}
  .an-donut{flex-direction:column;align-items:flex-start}
  .an-step{grid-template-columns:minmax(0,1fr) auto}
  .an-step__track{grid-column:1/-1;grid-row:2}
  .an-rate{margin-left:0}
  .an-seg{width:100%}.an-seg button{flex:1;height:36px}
}
@media (prefers-reduced-motion:reduce){.an-skel{animation:none}}
`;

// ---- numbers ------------------------------------------------------------------------------------------------------
export const money = (n) => (n == null ? '—' : (n < 0 ? '−' : '') + formatBDT(Math.round(Math.abs(Number(n) || 0))));
export const short = (n) => {
  if (n == null) return '—';
  const v = Math.abs(Number(n) || 0);
  const sign = n < 0 ? '−' : '';
  if (v >= 1e7) return sign + '৳' + (v / 1e7).toFixed(2).replace(/\.?0+$/, '') + ' Cr';
  if (v >= 1e5) return sign + '৳' + (v / 1e5).toFixed(2).replace(/\.?0+$/, '') + ' L';
  return sign + money(v);
};
export const num = (n) => (n == null ? '—' : Math.round(Number(n) || 0).toLocaleString('en-IN'));
/** "1.2k", "3.4L" for chart ticks. */
export const tick = (n) => (n >= 1e5 ? (n / 1e5).toFixed(n >= 1e6 ? 0 : 1).replace(/\.0$/, '') + 'L' : n >= 1e3 ? (n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/, '') + 'k' : String(Math.round(n)));
export const moneyTick = (n) => '৳' + tick(n);
/** 0.123 → "12.3%" (small shares keep two decimals). */
export const pct = (x, digits) => {
  if (x == null || Number.isNaN(x)) return '—';
  const v = x * 100;
  if (v === 0) return '0%';
  const d = digits != null ? digits : Math.abs(v) < 1 ? 2 : Math.abs(v) < 10 ? 1 : 0;
  return v.toFixed(d) + '%';
};
/** 95 → "1 min 35 s" */
export const secs = (s) => { if (s == null) return '—'; const v = Math.round(s); return v < 60 ? v + ' s' : `${Math.floor(v / 60)} min ${String(v % 60).padStart(2, '0')} s`; };
export const times = (x) => (x == null ? '—' : x.toFixed(2) + '×');
export const change = (a, b) => (b ? (a - b) / Math.abs(b) : null);

/** "▲ 12%" coloured by whether up is good. */
export function Delta({ now, before, good = 'up', suffix }) {
  const d = change(now, before);
  if (d == null || before == null) return null;
  const flat = Math.abs(d) < 0.005;
  const cls = flat || good === 'none' ? 'is-flat' : (d > 0) === (good !== 'down') ? 'is-good' : 'is-bad';
  return (
    <span className={'an-delta ' + cls}>
      <Icon name={flat ? 'minus' : d > 0 ? 'arrow-up-right' : 'arrow-down-right'} width="12" height="12" aria-hidden="true" />
      {pct(Math.abs(d), Math.abs(d) < 0.1 ? 1 : 0)}{suffix ? ' ' + suffix : ''}
    </span>
  );
}
/** The sub line of a key figure: the change against the compared period, as text. */
export const deltaText = (nowV, before) => {
  const d = change(nowV, before);
  if (d == null) return null;
  return (d >= 0 ? '▲ ' : '▼ ') + pct(Math.abs(d), Math.abs(d) < 0.1 ? 1 : 0);
};

// ---- the data -----------------------------------------------------------------------------------------------------
/** Platform data and this module's store: { db, t, live, data }. live is true once both have loaded in the browser. */
export function useAnalytics() {
  const { db, t, live } = usePlatform();
  const { data, live: storeLive } = useAdminStore(analytics);
  return { db, t, data, live: live && storeLive };
}

/** State kept in the address (?p=, ?cmp=, …), read after mount. defaults: { key: value }. */
export function useQuery(defaults) {
  const [q, setQ] = useState(defaults);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    const next = { ...defaults };
    for (const k of Object.keys(defaults)) if (u.get(k) != null) next[k] = u.get(k);
    setQ(next);
    setReady(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (patch) => {
    setQ((cur) => {
      const next = { ...cur, ...patch };
      const u = new URLSearchParams(window.location.search);
      for (const [k, v] of Object.entries(next)) { if (v == null || v === '' || v === defaults[k]) u.delete(k); else u.set(k, v); }
      const qs = u.toString();
      window.history.replaceState(window.history.state, '', window.location.pathname + (qs ? '?' + qs : ''));
      return next;
    });
  };
  return [q, set, ready];
}

/** The period and its comparison from the query. */
export function usePeriod(q, t) {
  const range = periodRange(q.p, t);
  const cmp = compareRange(range, q.cmp);
  const label = (PERIODS.find(([k]) => k === q.p) || [])[1] || '';
  return { range, cmp, label, text: rangeLabel(range.from, Math.min(range.to, t + 1)), cmpText: cmp ? rangeLabel(cmp.from, cmp.to) : '' };
}

export function PeriodPicker({ q, setQ, compare = true }) {
  return (
    <div className="an-tools" role="group" aria-label="Period">
      <select className="ix-pick" aria-label="Period" value={q.p} onChange={(e) => setQ({ p: e.target.value })}>
        {PERIODS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
      {compare ? (
        <select className="ix-pick" aria-label="Compare with" value={q.cmp} onChange={(e) => setQ({ cmp: e.target.value })}>
          {COMPARE.map(([k, l]) => <option key={k} value={k}>{k === 'none' ? l : 'Compare: ' + l.toLowerCase()}</option>)}
        </select>
      ) : null}
    </div>
  );
}

/** Title row with the period pickers on the right. */
export function AnHeader({ icon, title, about, q, setQ, compare = true, children }) {
  return (
    <div className="an-top">
      <header className="ix-head">
        <h1 className="ix-head__title">{icon ? <Icon name={icon} width="18" height="18" aria-hidden="true" /> : null}<span>{title}</span></h1>
        {about ? <span className="gc-pagehead__about" hidden>{about}</span> : null}
      </header>
      <div className="ix-head__actions an-tools">
        {children}
        {q ? <PeriodPicker q={q} setQ={setQ} compare={compare} /> : null}
      </div>
    </div>
  );
}

export function Card({ title, tip, link, children, label, flush }) {
  return (
    <section className="ix-card" aria-label={label || title}>
      <div className="ix-card__head">
        <h2 className="an-card-head">{title}{tip ? <InfoTip text={tip} label={'About ' + title.toLowerCase()} /> : null}</h2>
        {link ? <Link href={link.href}>{link.label}</Link> : null}
      </div>
      {flush ? children : <div className="an-body">{children}</div>}
    </section>
  );
}

/** Steps of a funnel: bars against the first step, the rate from the step before under each. */
export function Funnel({ steps, label }) {
  const max = Math.max(1, ...steps.map((s) => s.value || 0));
  return (
    <div className="an-funnel" role="list" aria-label={label}>
      {steps.map((s, i) => {
        const prev = i ? steps[i - 1].value : null;
        const inner = (<>
          <span className="an-step__label">{s.label}{s.sub ? <small>{s.sub}</small> : null}</span>
          <span className="an-step__track" aria-hidden="true"><span style={{ width: `${((s.value || 0) / max) * 100}%`, background: s.color || 'var(--viz-1)' }} /></span>
          <span className="an-step__val">{num(s.value)}{s.delta ? <small>{s.delta}</small> : null}</span>
        </>);
        return (
          <React.Fragment key={s.label}>
            {i ? <p className="an-rate" aria-hidden="true">{prev ? pct(s.value / prev) + ' of ' + steps[i - 1].label.toLowerCase() : '—'}</p> : null}
            {s.href ? <Link role="listitem" href={s.href} className="an-step" aria-label={`${s.label}: ${num(s.value)}${prev ? ', ' + pct(s.value / prev) + ' of the step before' : ''}`}>{inner}</Link>
              : <div role="listitem" className="an-step" aria-label={`${s.label}: ${num(s.value)}${prev ? ', ' + pct(s.value / prev) + ' of the step before' : ''}`}>{inner}</div>}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function Loading({ cards = 2, label = 'Loading' }) {
  return (
    <div className="ix-page" aria-busy="true" aria-label={label} style={{ padding: 0 }}>
      <div className="an-skel an-skel--strip" />
      <div className={'an-grid an-grid--' + (cards === 3 ? '3' : '2')}>{Array.from({ length: cards }, (_, i) => <div key={i} className="an-skel" />)}</div>
    </div>
  );
}

export function ErrorCard({ onRetry, text = 'The figures could not be worked out.' }) {
  return (
    <section className="ix-card"><div className="an-err" role="alert">
      <Icon name="triangle-alert" width="24" height="24" aria-hidden="true" />
      <p style={{ margin: 0 }}>{text}</p>
      {onRetry ? <button type="button" className="ix-btn" onClick={onRetry}>Try again</button> : null}
    </div></section>
  );
}

/** Work something out safely: { value } or { error }. */
export function attempt(fn) {
  try { return { value: fn() }; } catch (e) { if (typeof console !== 'undefined') console.error(e); return { error: e }; }
}

/** A two-way switch (e.g. Last touch / First touch). options: [[value, label]] */
export function Segmented({ value, onChange, options, label }) {
  return (
    <div className="an-seg" role="group" aria-label={label}>
      {options.map(([v, l]) => <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>{l}</button>)}
    </div>
  );
}
