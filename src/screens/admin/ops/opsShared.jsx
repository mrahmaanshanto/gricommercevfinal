'use client';
// Platform ops (super admin) — the parts Servers, APIs, Integrations, Resource limits and Incidents share: the CSS, a
// line chart for time series (DashCharts has columns and one line; ops needs two or more lines on one axis), usage
// bars, status badges, number and time text, a form field, the range switch and the open-incident banner.
// Data: lib/admin/ops.js. Every figure is simulated.

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { StatusBadge, InfoTip } from '@/components/ui';
import { useWidth, niceScale } from '@/components/charts/DashCharts';
import { num, hm, dm, dmy, daysBetween, yearOf } from '@/lib/platform/util';

// ---- text -------------------------------------------------------------------------------------------------------------
export { num };
export const plural = (n, one, many) => num(n) + ' ' + (n === 1 ? one : many || one + 's');
/** "380 ms" · "2.4 s" */
export const msText = (v) => (v == null ? '—' : v >= 1000 ? (v / 1000).toFixed(v >= 10000 ? 0 : 1) + ' s' : Math.round(v) + ' ms');
/** "0.42%" (two decimals under 1%, one above) */
export const pctText = (v) => (v == null ? '—' : (v < 1 ? v.toFixed(2) : v < 10 ? v.toFixed(1) : Math.round(v)) + '%');
/** A success rate: "99.42%", "100%" */
export const rateText = (v) => (v == null ? '—' : v >= 99.995 ? '100%' : v >= 99 ? v.toFixed(2) + '%' : v.toFixed(1) + '%');
/** "14 s" · "3 min" · "2 h 10 min" · "3 d 4 h" from milliseconds */
export function span(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return s + ' s';
  const m = Math.round(s / 60);
  if (m < 60) return m + ' min';
  const h = Math.floor(m / 60);
  if (h < 48) return h + ' h' + (m % 60 ? ' ' + (m % 60) + ' min' : '');
  const d = Math.floor(h / 24);
  return d + ' d' + (h % 24 ? ' ' + (h % 24) + ' h' : '');
}
/** "40 s ago" · "3 min ago" · "Today 09:40" · "Yesterday 18:40" · "02 Sep" */
export function ago(ms, t) {
  if (!ms) return '—';
  const d = t - ms;
  if (d < 60e3) return Math.max(1, Math.round(d / 1000)) + ' s ago';
  if (d < 3600e3) return Math.round(d / 60e3) + ' min ago';
  return when(ms, t);
}
export function when(ms, t) {
  if (!ms) return '—';
  const n = daysBetween(ms, t);
  if (n <= 0) return 'Today ' + hm(ms);
  if (n === 1) return 'Yesterday ' + hm(ms);
  return (yearOf(ms) === yearOf(t) ? dm(ms) : dmy(ms)) + ' ' + hm(ms);
}
/** 1.2M · 400k · 9,406 */
export const compact = (n) => (n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M' : n >= 1e5 ? Math.round(n / 1e3) + 'k' : num(n));

// ---- badges -------------------------------------------------------------------------------------------------------------
const STATE = {
  ok: ['success', 'Healthy'], warn: ['warning', 'Degraded'], degraded: ['warning', 'Degraded'], down: ['error', 'Down'], paused: ['neutral', 'Paused'],
};
export const StateTag = ({ s, label }) => { const [tone, text] = STATE[s] || STATE.ok; return <StatusBadge tone={tone} icon={s === 'paused' ? 'pause' : undefined}>{label || text}</StatusBadge>; };
export const SEV_TONE = { SEV1: 'error', SEV2: 'warning', SEV3: 'primary', SEV4: 'neutral' };
export const SevTag = ({ s }) => <StatusBadge tone={SEV_TONE[s] || 'neutral'} icon="siren">{s}</StatusBadge>;
export const INC_TONE = { Investigating: 'error', Identified: 'warning', Monitoring: 'primary', Resolved: 'success' };
export const IncTag = ({ s }) => <StatusBadge tone={INC_TONE[s] || 'neutral'}>{s}</StatusBadge>;
export const METHOD_CLS = { GET: 'is-get', POST: 'is-post', PATCH: 'is-patch', PUT: 'is-patch', DELETE: 'is-del' };
export const Method = ({ m }) => <span className={'ops-method ' + (METHOD_CLS[m] || '')}>{m}</span>;

// ---- small parts ---------------------------------------------------------------------------------------------------------
export function Card({ title, action, children, flush, label, tip, id }) {
  return (
    <section className="ix-card" aria-label={label || title} id={id}>
      {title || action ? <div className="ix-card__head"><h2>{title}{tip ? <> <InfoTip text={tip} label={'About ' + String(title).toLowerCase()} /></> : null}</h2>{action || null}</div> : null}
      <div className={flush ? 'ops-flush' : 'ix-card__body'}>{children}</div>
    </section>
  );
}
/** A usage bar: the share used, amber from `warn`%, red at 100%. */
export function Meter({ pct, warn = 80, label }) {
  const p = Math.max(0, Math.min(100, pct || 0));
  const cls = pct >= 100 ? ' is-over' : pct >= warn ? ' is-warn' : '';
  return <span className="ops-meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(p)} aria-label={label}><span className={'ops-meter__fill' + cls} style={{ width: p + '%' }} /></span>;
}
/** A segmented switch (range pickers). */
export function Seg({ value, onChange, options, label }) {
  return (
    <div className="ops-seg" role="group" aria-label={label}>
      {options.map(([k, l]) => <button key={k} type="button" aria-pressed={value === k} onClick={() => onChange(k)}>{l}</button>)}
    </div>
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
export const ctl = (error, select) => ({ className: 'gc-input' + (select ? ' gc-select' : '') + (error ? ' gc-input--error' : ''), 'aria-invalid': error ? true : undefined });

/** The open incidents as one line each, above a page's work (at most two). */
export function IncidentBanner({ list, t }) {
  if (!list || !list.length) return null;
  return (
    <div className="ops-banner" role="status">
      {list.slice(0, 2).map((x) => (
        <Link key={x.id} href={'/admin/incidents/view?id=' + x.id} className="ops-banner__row">
          <span className="ops-banner__ic" aria-hidden="true"><Icon name="siren" width="16" height="16" /></span>
          <span className="ops-banner__txt"><b>{x.id} · {x.title}</b><small>{x.status} · {x.severity} · {plural((x.stores || []).length, 'store')} · since {when(x.startedAt, t)}</small></span>
          <Icon name="chevron-right" width="16" height="16" aria-hidden="true" />
        </Link>
      ))}
    </div>
  );
}

export function Skeleton({ rows = 2 }) {
  return (
    <div className="ix-page" aria-busy="true" aria-label="Loading">
      <div className="ops-skel ops-skel--strip" />
      {Array.from({ length: rows }).map((_, i) => <div key={i} className="ops-skel" />)}
    </div>
  );
}
export function ErrorCard({ onRetry, what = 'The figures' }) {
  return (
    <section className="ix-card"><div className="ops-err" role="alert">
      <Icon name="triangle-alert" width="24" height="24" aria-hidden="true" />
      <p style={{ margin: 0 }}>{what} could not be worked out.</p>
      <button type="button" className="ix-btn" onClick={onRetry}>Try again</button>
    </div></section>
  );
}

// ---- line chart -------------------------------------------------------------------------------------------------------
/**
 * Lines over time on one axis. points: [{ label, title }] (label '' = no tick), series: [{ name, color, values, dash }].
 * max: a fixed top (100 for percentages); otherwise a round scale. Hover or arrow keys read a point.
 */
export function LineChart({ points, series, height = 200, fmt = String, tickFmt = fmt, max: fixedMax, label, warn }) {
  const [ref, w] = useWidth();
  const n = points.length;
  const [i, setI] = useState(null);
  const pad = { l: 44, r: 8, t: 10, b: 24 };
  const all = series.flatMap((s) => s.values.filter((v) => v != null));
  const { max, step } = fixedMax ? { max: fixedMax, step: fixedMax / 4 } : niceScale(Math.max(1, ...all));
  const pw = Math.max(0, w - pad.l - pad.r), ph = height - pad.t - pad.b;
  const x = (k) => pad.l + (n > 1 ? (k / (n - 1)) * pw : pw / 2);
  const y = (v) => pad.t + ph - (Math.min(v, max) / max) * ph;
  const ticks = []; for (let v = 0; v <= max + 1e-9; v += step) ticks.push(v);
  const marks = points.map((p, k) => (p.label ? k : -1)).filter((k) => k >= 0);
  const every = Math.max(1, Math.ceil(marks.length / Math.max(1, Math.floor(pw / 56))));
  const shown = marks.filter((_, j) => j % every === 0);
  const path = (vals) => vals.map((v, k) => (v == null ? '' : (k && vals[k - 1] != null ? 'L' : 'M') + x(k).toFixed(1) + ',' + y(v).toFixed(1))).join('');
  const move = (e) => { const r = e.currentTarget.getBoundingClientRect(); const k = Math.round(((e.clientX - r.left - pad.l) / Math.max(1, pw)) * (n - 1)); setI(Math.max(0, Math.min(n - 1, k))); };
  const onKeyDown = (e) => {
    if (!n) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); setI((v) => (v == null ? 0 : Math.min(n - 1, v + 1))); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); setI((v) => (v == null ? n - 1 : Math.max(0, v - 1))); }
    if (e.key === 'Home') { e.preventDefault(); setI(0); }
    if (e.key === 'End') { e.preventDefault(); setI(n - 1); }
    if (e.key === 'Escape') setI(null);
  };
  const cur = i != null ? points[i] : null;
  const left = i != null && x(i) > w / 2;
  return (
    <div ref={ref} className={'dch' + (i != null ? ' is-hover' : '')} tabIndex={0} role="group" aria-label={label + '. Use the arrow keys to read each point.'} onKeyDown={onKeyDown} onBlur={() => setI(null)}>
      {w > 0 && n ? (
        <svg width={w} height={height} aria-hidden="true" onPointerMove={move} onPointerLeave={() => setI(null)}>
          {ticks.map((v) => (
            <g key={v}>
              <line x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} stroke="var(--chart-grid)" strokeWidth="1" shapeRendering="crispEdges" />
              <text className="dch-tick" x={pad.l - 8} y={y(v)} dy="0.32em" textAnchor="end">{tickFmt(v)}</text>
            </g>
          ))}
          {warn != null && warn < max ? <line x1={pad.l} x2={w - pad.r} y1={y(warn)} y2={y(warn)} stroke="var(--warning)" strokeWidth="1" strokeDasharray="4 4" /> : null}
          <g className="dch-draw">
            {series.map((s) => <path key={s.name} d={path(s.values)} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={s.dash ? '5 4' : undefined} />)}
          </g>
          {i != null ? (
            <>
              <line x1={x(i)} x2={x(i)} y1={pad.t} y2={pad.t + ph} stroke="var(--border-strong)" strokeWidth="1" />
              {series.map((s) => (s.values[i] == null ? null : <circle key={s.name} cx={x(i)} cy={y(s.values[i])} r="4" fill={s.color} stroke="var(--surface-card)" strokeWidth="2" />))}
            </>
          ) : null}
          {shown.map((k) => <text key={k} className="dch-x" x={x(k)} y={height - 6} textAnchor={k === 0 ? 'start' : k === n - 1 ? 'end' : 'middle'}>{points[k].label}</text>)}
        </svg>
      ) : <div style={{ height }} />}
      {cur && w ? (
        <div className="dch-tip" role="presentation" style={{ left: x(i), top: 8, transform: `translate(${left ? 'calc(-100% - 12px)' : '12px'}, 0)` }}>
          <b>{cur.title || cur.label}</b>
          {series.map((s) => <p key={s.name}><i className={'dch-key' + (s.dash ? ' is-dash' : '')} style={s.dash ? { color: s.color } : { background: s.color }} /><strong>{s.values[i] == null ? '—' : fmt(s.values[i])}</strong><span>{s.name}</span></p>)}
        </div>
      ) : null}
      <table className="sr-only">
        <caption>{label}</caption>
        <thead><tr><th scope="col">Time</th>{series.map((s) => <th key={s.name} scope="col">{s.name}</th>)}</tr></thead>
        <tbody>{points.map((p, k) => <tr key={k}><th scope="row">{p.title || p.label}</th>{series.map((s) => <td key={s.name}>{s.values[k] == null ? '—' : fmt(s.values[k])}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export const OPS_CSS = `
.ops-skel{height:320px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-card),var(--surface-subtle),var(--surface-card));background-size:200% 100%;animation:ops-sk 1.4s ease infinite}
.ops-skel--strip{height:72px}
@keyframes ops-sk{from{background-position:100% 0}to{background-position:-100% 0}}
@media (prefers-reduced-motion:reduce){.ops-skel{animation:none}}
.ops-err{display:flex;flex-direction:column;align-items:center;gap:var(--space-3);padding:var(--space-8) var(--space-4);text-align:center;font-size:var(--text-sm);color:var(--text-body)}
.ops-flush{padding:0}
.ops-data{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.ops-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums;font-weight:var(--weight-semibold);color:var(--text-heading)}
.ops-muted{color:var(--text-muted)}
.ops-bad{color:var(--text-danger)}
.ops-warn{color:var(--text-warning)}
.ops-small{font-size:var(--text-xs);color:var(--text-muted)}
.ops-grid{display:grid;gap:var(--space-4);align-items:start}
.ops-grid--2{grid-template-columns:repeat(2,minmax(0,1fr))}
.ops-grid--21{grid-template-columns:minmax(0,2fr) minmax(0,1fr)}
@media (max-width:1023px){.ops-grid--2,.ops-grid--21{grid-template-columns:minmax(0,1fr)}}
.ops-meter{display:block;width:100%;min-width:56px;height:6px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.ops-meter__fill{display:block;height:100%;border-radius:var(--radius-full);background:var(--viz-1)}
.ops-meter__fill.is-warn{background:var(--warning)}
.ops-meter__fill.is-over{background:var(--error)}
.ops-seg{display:inline-flex;flex:none;padding:2px;border-radius:var(--radius-lg);background:var(--surface-subtle)}
.ops-seg button{height:28px;padding:0 var(--space-3);border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer;white-space:nowrap}
.ops-seg button[aria-pressed="true"]{background:var(--surface-card);color:var(--text-heading);box-shadow:var(--shadow-xs)}
.ops-seg button:focus-visible{outline:2px solid var(--primary);outline-offset:1px}
.ops-tools{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.ops-legend{margin-top:var(--space-3)}
.ops-method{display:inline-block;min-width:48px;padding:1px 6px;border-radius:var(--radius-md);background:var(--surface-subtle);font-family:var(--font-data);font-size:var(--text-xs);font-weight:var(--weight-semibold);text-align:center;color:var(--text-body)}
.ops-method.is-get{background:var(--fill-success-soft);color:var(--text-success)}
.ops-method.is-post{background:var(--fill-primary-soft);color:var(--primary)}
.ops-method.is-patch{background:var(--fill-warning-soft);color:var(--text-warning)}
.ops-method.is-del{background:var(--fill-error-soft);color:var(--text-danger)}
.ops-path{font-family:var(--font-data);font-size:var(--text-sm);color:var(--text-heading)}
.ops-banner{display:flex;flex-direction:column;border:1px solid color-mix(in srgb,var(--warning) 45%,transparent);border-radius:var(--radius-xl);background:var(--fill-warning-soft)}
.ops-banner__row{display:flex;align-items:center;gap:var(--space-3);min-height:52px;padding:6px var(--space-3);color:inherit;text-decoration:none}
.ops-banner__row+.ops-banner__row{border-top:1px solid color-mix(in srgb,var(--warning) 30%,transparent)}
.ops-banner__row:hover b{color:var(--primary)}
.ops-banner__ic{flex:none;display:grid;place-items:center;width:32px;height:32px;border-radius:var(--radius-full);background:var(--surface-card);color:var(--text-warning)}
.ops-banner__txt{flex:1;min-width:0;display:flex;flex-direction:column}
.ops-banner__txt b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ops-banner__txt small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-xs);color:var(--text-body)}
.ops-banner__row>svg{flex:none;color:var(--text-muted)}
.ops-form{display:flex;flex-direction:column;gap:var(--space-3)}
.ops-form p{margin:0;font-size:var(--text-sm);color:var(--text-body)}
.ops-form__two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.ops-form textarea.gc-input{height:auto;min-height:88px;padding:var(--space-2) var(--space-3);resize:vertical;line-height:1.5}
.ops-formerr{margin:0;font-size:var(--text-sm);color:var(--text-danger)}
.ops-check{display:flex;align-items:flex-start;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-body);cursor:pointer}
.ops-check input{width:16px;height:16px;margin:2px 0 0;flex:none;accent-color:var(--primary)}
.ops-checks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px var(--space-3)}
.ops-sec{margin:var(--space-2) 0 0;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ops-list{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.ops-list>li{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-3);padding:var(--space-2) 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-body)}
.ops-list>li:first-child{border-top:0;padding-top:0}
.ops-list__main{display:flex;flex-direction:column;gap:2px;min-width:0}
.ops-list__main b{font-weight:var(--weight-medium);color:var(--text-heading);overflow-wrap:anywhere}
.ops-list__main small{font-size:var(--text-xs);color:var(--text-muted)}
.ops-list__end{flex:none;display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.ops-chips{display:flex;flex-wrap:wrap;gap:6px}
.ops-chip{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 var(--space-2);border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font-size:var(--text-xs);color:var(--text-body);text-decoration:none;white-space:nowrap}
a.ops-chip:hover{border-color:var(--primary);color:var(--primary)}
.ops-chip .ops-data{color:var(--text-muted)}
.ops-sortbtn{display:inline-flex;align-items:center;gap:4px;padding:0;border:0;background:none;font:inherit;color:inherit;cursor:pointer}
.ops-sortbtn svg{color:var(--text-muted)}
.ops-sortbtn[aria-pressed="true"]{color:var(--text-heading)}
.ops-filters{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:8px;border-bottom:1px solid var(--border-subtle)}
.ops-filters .ix-search{flex:1 1 220px;max-width:340px}
.ix-table tbody tr:focus-visible td{background:var(--surface-subtle)}
.ix-table tbody tr:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
@media (max-width:640px){
  .ops-form__two,.ops-checks{grid-template-columns:minmax(0,1fr)}
  .ops-seg button{height:36px}
  .ops-filters{padding:6px}
  .ops-filters .ix-search{max-width:none}
}
`;
