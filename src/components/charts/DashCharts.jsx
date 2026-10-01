'use client';
// DashCharts — the dashboard's charts, drawn in SVG and plain HTML (no chart library):
//   ColumnChart (columns, stacked by series, with an optional line on the same axis) · Sparkline ·
//   Donut · StackBar (one bar split by share) · HBars (ranked bars with their values) · Legend
// Rules (the data-viz method): one axis; series colours are the --viz-N tokens in a fixed order and
// follow the thing, never its rank; text never wears a series colour; bars ≤ 24px with a 4px rounded
// end and a 2px surface gap; 2px lines; a legend for two or more series. Every chart answers hover and
// keyboard focus (arrow keys) with a tooltip, and is followed by a visually hidden table of its numbers.
// Motion: bars rise and lines draw once when the chart first appears (clip-path, ease-out); none when
// the reader asks for reduced motion.

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** The width of a box, kept up to date as the layout changes. */
export function useWidth() {
  const ref = useRef(null);
  const [w, setW] = useState(0);
  useIso(() => {
    const el = ref.current;
    if (!el) return undefined;
    setW(el.clientWidth);
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

export const CHART_CSS = `
.dch{position:relative;min-width:0;width:100%}
.dch svg{display:block;overflow:visible}
.dch:focus-visible{outline:2px solid var(--focus-ring);outline-offset:4px;border-radius:var(--radius-lg)}
.dch-tick{font-family:var(--font-data);font-size:var(--text-2xs);fill:var(--text-muted);font-variant-numeric:tabular-nums}
.dch-x{font-size:var(--text-2xs);fill:var(--text-muted)}
.dch-x.is-on{fill:var(--text-heading);font-weight:var(--weight-semibold)}
.dch-bar{transition:opacity 150ms ease}
.dch.is-hover .dch-bar:not(.is-on){opacity:.4}
.dch-band{fill:var(--surface-subtle)}
.dch-tip{position:absolute;z-index:3;top:0;min-width:132px;max-width:240px;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);box-shadow:0 8px 24px rgba(15,23,42,.12);pointer-events:none;font-size:var(--text-xs);color:var(--text-body)}
.dch-tip b{display:block;margin-bottom:4px;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.dch-tip p{display:flex;align-items:center;gap:8px;margin:2px 0;white-space:nowrap}
.dch-tip p strong{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.dch-tip p span{color:var(--text-muted)}
.dch-key{display:inline-block;width:12px;height:2px;flex:none;border-radius:2px}
.dch-key.is-dash{background:none!important;border-top:2px dashed currentColor;height:0}
.dch-legend{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-4);margin:0;padding:0;list-style:none;font-size:var(--text-xs);color:var(--text-body)}
.dch-legend li{display:inline-flex;align-items:center;gap:6px;min-width:0}
.dch-legend i{display:inline-block;width:10px;height:10px;flex:none;border-radius:3px}
.dch-legend i.is-line{height:2px;width:14px;border-radius:2px}
.dch-legend i.is-dash{height:0;width:14px;border-top:2px dashed;background:none!important;border-radius:0}
.dch-legend b{font-family:var(--font-data);font-weight:var(--weight-medium);color:var(--text-heading)}
.dch-stack{display:flex;gap:2px;height:12px;border-radius:var(--radius-full);overflow:hidden;background:var(--surface-subtle)}
.dch-stack>span{display:block;height:100%;min-width:2px;transition:opacity 150ms ease}
.dch-stack.is-hover>span:not(.is-on){opacity:.4}
.dch-hb{display:flex;flex-direction:column;gap:var(--space-3)}
.dch-hb__row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px var(--space-3);align-items:center;color:inherit;text-decoration:none}
.dch-hb__row>span:first-child{display:flex;flex-direction:column;min-width:0}
.dch-hb__row b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dch-hb__row small{font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dch-hb__row>strong{font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap;text-align:right}
.dch-hb__track{grid-column:1 / -1;height:8px;border-radius:var(--radius-full);background:var(--surface-subtle)}
.dch-hb__track>span{display:block;height:100%;min-width:4px;border-radius:var(--radius-full)}
a.dch-hb__row:hover b{color:var(--primary)}
.dch-donut{position:relative;flex:none}
.dch-donut__mid{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;pointer-events:none}
.dch-donut__mid strong{font-family:var(--font-data);font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading);line-height:1.2}
.dch-donut__mid span{font-size:var(--text-xs);color:var(--text-muted)}
.dch-seg{transition:opacity 150ms ease}
.dch-donut.is-hover .dch-seg:not(.is-on){opacity:.35}
@media (prefers-reduced-motion:no-preference){
  .dch-rise{animation:dch-rise 560ms cubic-bezier(0.23,1,0.32,1) both;animation-delay:var(--d,0ms)}
  .dch-draw{animation:dch-draw 720ms cubic-bezier(0.23,1,0.32,1) both;animation-delay:var(--d,0ms)}
  .dch-grow{animation:dch-draw 560ms cubic-bezier(0.23,1,0.32,1) both;animation-delay:var(--d,0ms)}
  .dch-sweep{animation:dch-sweep 720ms cubic-bezier(0.23,1,0.32,1) both;animation-delay:var(--d,0ms)}
}
@media (prefers-reduced-motion:reduce){.dch-rise,.dch-draw,.dch-grow,.dch-sweep{animation:dch-fade 200ms ease both}}
@keyframes dch-rise{from{clip-path:inset(100% 0 0 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes dch-draw{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes dch-sweep{from{stroke-dasharray:0 var(--c)}}
@keyframes dch-fade{from{opacity:0}to{opacity:1}}
`;

// ---- helpers --------------------------------------------------------------------------------------------
/** A round top for the scale: 4 steps of 1 / 2 / 2.5 / 5 × 10ⁿ. */
export function niceScale(v, steps = 4) {
  if (!(v > 0)) return { max: steps, step: 1 };
  const raw = v / steps;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const n = raw / mag;
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
  return { max: step * Math.ceil(v / step - 1e-9), step };
}
/** A column with a 4px rounded top and a square foot. */
const roundTop = (x, y, w, h, r = 4) => {
  const k = Math.max(0, Math.min(r, h, w / 2));
  return `M${x},${y + h}V${y + k}Q${x},${y} ${x + k},${y}H${x + w - k}Q${x + w},${y} ${x + w},${y + k}V${y + h}Z`;
};

function Tip({ at, width, title, rows }) {
  if (!at) return null;
  const left = at.x > width / 2;
  return (
    <div className="dch-tip" role="presentation" style={{ left: at.x, top: at.y, transform: `translate(${left ? 'calc(-100% - 12px)' : '12px'}, 0)` }}>
      {title ? <b>{title}</b> : null}
      {rows.map((r) => (
        <p key={r.name}><i className={'dch-key' + (r.dash ? ' is-dash' : '')} style={r.dash ? { color: r.color } : { background: r.color }} /><strong>{r.value}</strong><span>{r.name}</span></p>
      ))}
    </div>
  );
}

/** Legend: rect for bars and areas, a short line for lines (dashed for a dashed line). */
export function Legend({ items }) {
  return (
    <ul className="dch-legend">
      {items.map((it) => (
        <li key={it.name}>
          <i className={it.kind === 'line' ? 'is-line' : it.kind === 'dash' ? 'is-dash' : ''} style={it.kind === 'dash' ? { borderColor: it.color } : { background: it.color }} aria-hidden="true" />
          {it.name}{it.value != null ? <b>{it.value}</b> : null}
        </li>
      ))}
    </ul>
  );
}

/** A visually hidden table with the chart's numbers. */
function SrTable({ caption, head, rows }) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead><tr>{head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}</tr>)}</tbody>
    </table>
  );
}

/** Keyboard: arrow keys move the reading along the points; Escape or leaving hides it. */
function useReader(n) {
  const [i, setI] = useState(null);
  const onKeyDown = useCallback((e) => {
    if (!n) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setI((v) => (v == null ? 0 : Math.min(n - 1, v + 1))); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setI((v) => (v == null ? n - 1 : Math.max(0, v - 1))); }
    if (e.key === 'Home') { e.preventDefault(); setI(0); }
    if (e.key === 'End') { e.preventDefault(); setI(n - 1); }
    if (e.key === 'Escape') setI(null);
  }, [n]);
  return [i, setI, { onKeyDown, onBlur: () => setI(null) }];
}

// ---- columns ------------------------------------------------------------------------------------------------
/**
 * Columns per point, stacked by `series`, with an optional `line` on the same axis.
 *   data    [{ label, title?, values: [number|null per series], line?: number|null }]
 *   series  [{ name, color }]          line  { name, color, dash? }
 *   now     index of the point to mark (e.g. the hour we are in) — its label is bold
 *   fmt     tick and value text        delay  ms before the bars rise
 */
export function ColumnChart({ data, series, line, height = 220, fmt = String, tickFmt = fmt, label, now = -1, delay = 0 }) {
  const [ref, w] = useWidth();
  const n = data.length;
  const [i, setI, keys] = useReader(n);
  const pad = { l: 46, r: 6, t: 10, b: 24 };
  const totals = data.map((d) => d.values.reduce((a, v) => a + (v || 0), 0));
  const lineVals = line ? data.map((d) => d.line) : [];
  const { max, step } = niceScale(Math.max(0, ...totals, ...lineVals.filter((v) => v != null)));
  const pw = Math.max(0, w - pad.l - pad.r), ph = height - pad.t - pad.b;
  const band = n ? pw / n : 0;
  const bw = Math.max(2, Math.min(24, band * 0.62));
  const y = (v) => pad.t + ph - (v / max) * ph;
  const xc = (k) => pad.l + band * k + band / 2;
  // a label every few points, so they never touch (about 6.5px a character at 12px)
  const longest = Math.max(1, ...data.map((d) => String(d.label).length));
  const every = Math.max(1, Math.ceil((longest * 6.5 + 10) / Math.max(1, band)));
  const ticks = []; for (let v = 0; v <= max + 1e-9; v += step) ticks.push(v);
  const pts = line ? data.map((d, k) => (d.line == null ? null : [xc(k), y(d.line)])) : [];
  let path = '', pen = false;
  pts.forEach((p) => { if (!p) { pen = false; return; } path += (pen ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1); pen = true; });
  const lastPt = [...pts].reverse().find(Boolean);
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const k = Math.floor((e.clientX - r.left - pad.l) / band);
    setI(k >= 0 && k < n ? k : null);
  };
  const cur = i != null ? data[i] : null;
  const rows = cur ? [
    ...series.map((s, k) => ({ name: s.name, color: s.color, value: cur.values[k] == null ? '—' : fmt(cur.values[k]) })),
    ...(line ? [{ name: line.name, color: line.color, dash: line.dash, value: cur.line == null ? '—' : fmt(cur.line) }] : []),
  ] : [];
  return (
    <div ref={ref} className={'dch' + (i != null ? ' is-hover' : '')} tabIndex={0} role="group" aria-label={label + '. Use the arrow keys to read each point.'} {...keys}>
      {w > 0 ? (
        <svg width={w} height={height} aria-hidden="true" onPointerMove={move} onPointerLeave={() => setI(null)}>
          {ticks.map((v) => (
            <g key={v}>
              <line x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} stroke="var(--chart-grid)" strokeWidth="1" shapeRendering="crispEdges" />
              <text className="dch-tick" x={pad.l - 8} y={y(v)} dy="0.32em" textAnchor="end">{tickFmt(v)}</text>
            </g>
          ))}
          {i != null ? <rect className="dch-band" x={pad.l + band * i} y={pad.t} width={band} height={ph} rx="6" /> : null}
          <g className="dch-rise" style={{ '--d': delay + 'ms' }}>
            {data.map((d, k) => {
              let base = pad.t + ph;
              const x = xc(k) - bw / 2;
              const parts = d.values.map((v, s) => ({ v: v || 0, s })).filter((p) => p.v > 0);
              return (
                <g key={k} className={'dch-bar' + (i === k ? ' is-on' : '')}>
                  {parts.map((p, j) => {
                    const h = (p.v / max) * ph;
                    const top = j === parts.length - 1;
                    const gap = j > 0 ? 2 : 0;
                    const yy = base - h;
                    const hh = Math.max(0, h - gap);
                    base = yy;
                    return top
                      ? <path key={p.s} d={roundTop(x, yy, bw, hh)} fill={series[p.s].color} />
                      : <rect key={p.s} x={x} y={yy} width={bw} height={hh} fill={series[p.s].color} />;
                  })}
                </g>
              );
            })}
          </g>
          {line && path ? (
            <g className="dch-draw" style={{ '--d': delay + 160 + 'ms' }}>
              <path d={path} fill="none" stroke={line.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={line.dash ? '5 4' : undefined} />
              {lastPt ? <circle cx={lastPt[0]} cy={lastPt[1]} r="4" fill={line.color} stroke="var(--surface-card)" strokeWidth="2" /> : null}
              {i != null && pts[i] ? <circle cx={pts[i][0]} cy={pts[i][1]} r="4" fill={line.color} stroke="var(--surface-card)" strokeWidth="2" /> : null}
            </g>
          ) : null}
          {data.map((d, k) => ((k % every === 0 || k === now) && !(k !== now && Math.abs(k - now) < every && now >= 0)
            ? <text key={k} className={'dch-x' + (k === now ? ' is-on' : '')} x={xc(k)} y={height - 6} textAnchor="middle">{d.label}</text> : null))}
        </svg>
      ) : <div style={{ height }} />}
      <Tip at={cur && w ? { x: xc(i), y: 8 } : null} width={w} title={cur ? cur.title || cur.label : ''} rows={rows} />
      <SrTable caption={label} head={['', ...series.map((s) => s.name), ...(line ? [line.name] : [])]}
        rows={data.map((d) => [d.title || d.label, ...d.values.map((v) => (v == null ? '—' : fmt(v))), ...(line ? [d.line == null ? '—' : fmt(d.line)] : [])])} />
    </div>
  );
}

// ---- sparkline ------------------------------------------------------------------------------------------------
/** A small trend line with a soft wash; the last point carries a dot. Hover or arrow keys read a point. */
export function Sparkline({ values, labels = [], color = 'var(--viz-1)', height = 44, fmt = String, label, delay = 0 }) {
  const [ref, w] = useWidth();
  const n = values.length;
  const [i, setI, keys] = useReader(n);
  const max = Math.max(1, ...values), min = 0;
  const pad = 5;
  const x = (k) => pad + (n > 1 ? (k / (n - 1)) * (w - pad * 2) : 0);
  const y = (v) => pad + (height - pad * 2) * (1 - (v - min) / (max - min || 1));
  const d = values.map((v, k) => (k ? 'L' : 'M') + x(k).toFixed(1) + ',' + y(v).toFixed(1)).join('');
  const area = n ? `${d}L${x(n - 1).toFixed(1)},${height}L${x(0).toFixed(1)},${height}Z` : '';
  const move = (e) => { const r = e.currentTarget.getBoundingClientRect(); const k = Math.round(((e.clientX - r.left - pad) / Math.max(1, w - pad * 2)) * (n - 1)); setI(Math.max(0, Math.min(n - 1, k))); };
  return (
    <div ref={ref} className="dch" tabIndex={0} role="group" aria-label={label} {...keys}>
      {w > 0 && n ? (
        <svg width={w} height={height} aria-hidden="true" onPointerMove={move} onPointerLeave={() => setI(null)}>
          <g className="dch-draw" style={{ '--d': delay + 'ms' }}>
            <path d={area} fill={color} fillOpacity="0.1" />
            <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={x(n - 1)} cy={y(values[n - 1])} r="4" fill={color} stroke="var(--surface-card)" strokeWidth="2" />
          </g>
          {i != null ? (<>
            <line x1={x(i)} x2={x(i)} y1={0} y2={height} stroke="var(--border-strong)" strokeWidth="1" />
            <circle cx={x(i)} cy={y(values[i])} r="4" fill={color} stroke="var(--surface-card)" strokeWidth="2" />
          </>) : null}
        </svg>
      ) : <div style={{ height }} />}
      <Tip at={i != null && w ? { x: x(i), y: height + 4 } : null} width={w} title={labels[i] || ''} rows={i != null ? [{ name: label, color, value: fmt(values[i]) }] : []} />
      <SrTable caption={label} head={['', label]} rows={values.map((v, k) => [labels[k] || String(k + 1), fmt(v)])} />
    </div>
  );
}

// ---- donut ------------------------------------------------------------------------------------------------
/** Shares of a whole as a ring (2px surface gaps), the total in the middle. */
export function Donut({ parts, size = 148, thickness = 18, fmt = String, total, totalLabel, label, delay = 0 }) {
  const [on, setOn] = useState(null);
  const sum = parts.reduce((a, p) => a + p.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let start = 0;
  const segs = parts.map((p, k) => {
    const len = sum ? (p.value / sum) * c : 0;
    const s = { ...p, k, len, start };
    start += len;
    return s;
  }).filter((s) => s.len > 0);
  const cur = on != null ? parts[on] : null;
  return (
    <div className={'dch-donut' + (on != null ? ' is-hover' : '')} style={{ width: size, height: size }} role="img" aria-label={`${label}: ${parts.map((p) => `${p.name} ${fmt(p.value)}`).join(', ')}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-subtle)" strokeWidth={thickness} />
        {segs.map((s) => {
          const gap = segs.length > 1 ? 2 : 0;
          return (
            <circle key={s.name} className={'dch-seg dch-sweep' + (on === s.k ? ' is-on' : '')} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={thickness}
              strokeDasharray={`${Math.max(0, s.len - gap)} ${c}`} strokeDashoffset={-s.start} style={{ '--c': c, '--d': delay + 'ms' }}
              onPointerEnter={() => setOn(s.k)} onPointerLeave={() => setOn(null)} />
          );
        })}
      </svg>
      <div className="dch-donut__mid">
        <strong>{cur ? fmt(cur.value) : total}</strong>
        <span>{cur ? cur.name : totalLabel}</span>
      </div>
    </div>
  );
}

// ---- one bar split by share ---------------------------------------------------------------------------------
export function StackBar({ parts, fmt = String, label, delay = 0 }) {
  const [on, setOn] = useState(null);
  const sum = parts.reduce((a, p) => a + p.value, 0);
  return (
    <div className={'dch-stack dch-grow' + (on != null ? ' is-hover' : '')} style={{ '--d': delay + 'ms' }} role="img"
      aria-label={`${label}: ${parts.map((p) => `${p.name} ${fmt(p.value)}`).join(', ')}`}>
      {sum ? parts.filter((p) => p.value > 0).map((p) => (
        <span key={p.name} className={on === p.name ? 'is-on' : ''} style={{ width: `${(p.value / sum) * 100}%`, background: p.color }} title={`${p.name}: ${fmt(p.value)} (${Math.round((p.value / sum) * 100)}%)`}
          onPointerEnter={() => setOn(p.name)} onPointerLeave={() => setOn(null)} />
      )) : null}
    </div>
  );
}

// ---- ranked bars ------------------------------------------------------------------------------------------------
/** rows [{ key, label, sub, value, text, color, href }]: a bar per row, longest first, its value at the end. */
export function HBars({ rows, Link, delay = 0 }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="dch-hb">
      {rows.map((r, k) => {
        const inner = (<>
          <span><b>{r.label}</b>{r.sub ? <small>{r.sub}</small> : null}</span>
          <strong>{r.text}</strong>
          <span className="dch-hb__track" aria-hidden="true"><span className="dch-grow" style={{ width: `${(r.value / max) * 100}%`, background: r.color, '--d': delay + k * 50 + 'ms' }} /></span>
        </>);
        return r.href && Link ? <Link key={r.key || r.label} href={r.href} className="dch-hb__row">{inner}</Link> : <div key={r.key || r.label} className="dch-hb__row">{inner}</div>;
      })}
    </div>
  );
}
