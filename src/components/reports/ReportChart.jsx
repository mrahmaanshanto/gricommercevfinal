'use client';
// ReportChart — the charts reports use, drawn with divs and SVG (no chart library):
//   bar · stacked · line · hbar · donut · heatmap   (spec: see src/lib/reports/catalogue.js)
// Each chart is hidden from screen readers and followed by a visually hidden table of the same numbers.

import React from 'react';
import { fmt } from '@/lib/reports/period';

export const TONES = {
  primary: 'var(--primary)', success: 'var(--fill-success)', warning: 'var(--fill-warning)', danger: 'var(--fill-danger)',
  info: 'var(--fill-info)', slate: 'var(--slate-300)', accent: 'var(--accent, var(--primary))',
};
const ORDER = ['primary', 'success', 'warning', 'info', 'danger', 'slate'];
const toneOf = (s, i) => TONES[s.tone] || TONES[ORDER[i % ORDER.length]];

export const CHART_CSS = `
.rc{display:flex;flex-direction:column;gap:var(--space-3);min-width:0;max-width:100%}
.rc-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0}
.rc-legend{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-4);font-size:var(--text-xs);color:var(--text-body)}
.rc-legend span{display:inline-flex;align-items:center;gap:6px}
.rc-legend i{width:10px;height:10px;border-radius:var(--radius-full);display:inline-block}
.rc-legend b{font-family:var(--font-data);font-weight:var(--weight-medium);color:var(--text-heading)}
.rc-bars{display:flex;align-items:flex-end;gap:3px;height:200px;padding-top:var(--space-2);border-bottom:1px solid var(--border-subtle)}
.rc-col{flex:1;min-width:0;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:stretch;gap:1px;position:relative}
.rc-col > i{display:block;border-radius:3px 3px 0 0;min-height:0}
.rc-col.is-group{flex-direction:row;align-items:flex-end;gap:1px}
.rc-col.is-group > i{flex:1;border-radius:3px 3px 0 0}
.rc-col:hover::after{content:attr(data-tip);position:absolute;bottom:100%;left:50%;transform:translateX(-50%);z-index:2;white-space:pre;background:var(--surface-card);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);box-shadow:0 4px 12px rgba(15,23,42,.12);padding:6px 8px;font-size:var(--text-xs);color:var(--text-heading);pointer-events:none}
.rc-axis{display:flex;gap:3px;font-size:var(--text-2xs, 11px);color:var(--text-muted)}
.rc-axis span{flex:1;min-width:0;text-align:center;white-space:nowrap;overflow:visible}
.rc-h{display:flex;flex-direction:column;gap:var(--space-2)}
.rc-hrow{display:grid;grid-template-columns:minmax(90px,30%) minmax(0,1fr) auto;align-items:center;gap:var(--space-3);font-size:var(--text-xs)}
.rc-hrow > span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-body)}
.rc-hbar{height:10px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden;display:flex}
.rc-hbar i{display:block;height:100%}
.rc-hrow b{font-family:var(--font-data);font-weight:var(--weight-medium);color:var(--text-heading);white-space:nowrap}
.rc-donut{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-5)}
.rc-donut svg{flex:none}
.rc-heat-wrap{max-width:100%;overflow-x:auto}
.rc-heat{display:grid;gap:3px;font-size:var(--text-2xs, 11px);color:var(--text-muted);min-width:420px}
.rc-heat i{display:block;height:24px;border-radius:4px}
.rc-heat span{white-space:nowrap;align-self:center}
.rc-empty{padding:var(--space-6) 0;text-align:center;font-size:var(--text-sm);color:var(--text-muted)}
@media (max-width:640px){.rc-bars{height:150px}}
`;

function SrTable({ head, rows }) {
  return (
    <div className="rc-sr"><table>
      <thead><tr>{head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}</tr>)}</tbody>
    </table></div>
  );
}

export function ReportChart({ chart }) {
  if (!chart) return null;
  const f = (v) => fmt(v, chart.format || 'num');
  const series = chart.series || [];
  const labels = chart.labels || [];
  const empty = chart.type === 'heatmap' ? !(chart.values || []).some((r) => r.some(Boolean)) : !series.some((s) => s.values.some(Boolean));
  if (empty) return <div className="rc-empty">Nothing to chart in this period.</div>;

  const legend = series.length > 1 || chart.type === 'donut'
    ? <div className="rc-legend" aria-hidden="true">{(chart.type === 'donut' ? labels : series.map((s) => s.name)).map((name, i) => <span key={name}><i style={{ background: chart.type === 'donut' ? toneOf({}, i) : toneOf(series[i], i) }} />{name}{chart.type === 'donut' ? <b>{f(series[0].values[i])}</b> : <b>{f(series[i].values.reduce((a, v) => a + v, 0))}</b>}</span>)}</div>
    : null;

  const longLabels = (chart.type === 'bar' || chart.type === 'stacked') && labels.length <= 20 && labels.some((l) => String(l).length > 8);
  if (chart.type === 'hbar' || longLabels) {
    const s0 = series[0];
    const max = Math.max(...labels.map((_, i) => series.reduce((a, s) => a + (s.values[i] || 0), 0)), 1);
    return (
      <div className="rc">
        {legend}
        <div className="rc-h" aria-hidden="true">
          {labels.map((l, i) => {
            const total = series.reduce((a, s) => a + (s.values[i] || 0), 0);
            return <div key={l + i} className="rc-hrow"><span title={l}>{l}</span><span className="rc-hbar">{series.map((s, j) => <i key={j} style={{ width: ((s.values[i] || 0) / max) * 100 + '%', background: toneOf(s, j) }} />)}</span><b>{f(series.length > 1 ? total : s0.values[i])}</b></div>;
          })}
        </div>
        <SrTable head={['', ...series.map((s) => s.name)]} rows={labels.map((l, i) => [l, ...series.map((s) => f(s.values[i]))])} />
      </div>
    );
  }

  if (chart.type === 'donut') {
    const vals = series[0].values.map((v) => Math.max(0, v || 0));
    const total = vals.reduce((a, v) => a + v, 0) || 1;
    let acc = 0;
    const R = 52, C = 2 * Math.PI * R;
    return (
      <div className="rc">
        <div className="rc-donut">
          <svg width="140" height="140" viewBox="0 0 140 140" aria-hidden="true">
            <circle cx="70" cy="70" r={R} fill="none" stroke="var(--surface-subtle)" strokeWidth="22" />
            {vals.map((v, i) => { const len = (v / total) * C; const el = <circle key={i} cx="70" cy="70" r={R} fill="none" stroke={toneOf({}, i)} strokeWidth="22" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-acc} transform="rotate(-90 70 70)" />; acc += len; return el; })}
          </svg>
          {legend}
        </div>
        <SrTable head={['', series[0].name || 'Value']} rows={labels.map((l, i) => [l, f(vals[i])])} />
      </div>
    );
  }

  if (chart.type === 'heatmap') {
    const max = Math.max(...chart.values.flat(), 1);
    return (
      <div className="rc">
        <div className="rc-heat-wrap"><div className="rc-heat" style={{ gridTemplateColumns: `auto repeat(${chart.cols.length}, minmax(18px, 1fr))` }} aria-hidden="true">
          <span />{chart.cols.map((c) => <span key={c} style={{ textAlign: 'center' }}>{c}</span>)}
          {chart.rows.map((r, i) => (
            <React.Fragment key={r}>
              <span>{r}</span>
              {chart.cols.map((c, j) => { const v = chart.values[i][j] || 0; return <i key={c} title={`${r} ${c}: ${f(v)}`} style={{ background: v ? `color-mix(in srgb, var(--primary) ${Math.round(12 + (v / max) * 88)}%, var(--surface-card))` : 'var(--surface-subtle)' }} />; })}
            </React.Fragment>
          ))}
        </div></div>
        <SrTable head={['', ...chart.cols]} rows={chart.rows.map((r, i) => [r, ...chart.cols.map((_, j) => f(chart.values[i][j]))])} />
      </div>
    );
  }

  if (chart.type === 'line') {
    const W = 600, H = 200, P = 8;
    const max = Math.max(...series.flatMap((s) => s.values), 1);
    const x = (i) => P + (labels.length < 2 ? 0 : (i / (labels.length - 1)) * (W - 2 * P));
    const y = (v) => H - P - (v / max) * (H - 2 * P);
    const step = Math.max(1, Math.ceil(labels.length / 12));
    return (
      <div className="rc">
        {legend}
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="200" preserveAspectRatio="none" aria-hidden="true" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          {series.map((s, j) => <polyline key={s.name} fill="none" stroke={toneOf(s, j)} strokeWidth="2.5" vectorEffect="non-scaling-stroke" points={s.values.map((v, i) => `${x(i)},${y(v || 0)}`).join(' ')} />)}
        </svg>
        <div className="rc-axis" aria-hidden="true">{labels.map((l, i) => <span key={i}>{i % step === 0 ? l : ''}</span>)}</div>
        <SrTable head={['', ...series.map((s) => s.name)]} rows={labels.map((l, i) => [l, ...series.map((s) => f(s.values[i]))])} />
      </div>
    );
  }

  // bar (grouped when several series) and stacked
  const stacked = chart.type === 'stacked';
  const totals = labels.map((_, i) => series.reduce((a, s) => a + Math.max(0, s.values[i] || 0), 0));
  const max = Math.max(...(stacked ? totals : series.flatMap((s) => s.values)), 1);
  const step = Math.max(1, Math.ceil(labels.length / 12));
  return (
    <div className="rc">
      {legend}
      <div className="rc-bars" aria-hidden="true">
        {labels.map((l, i) => (
          <div key={i} className={'rc-col' + (!stacked && series.length > 1 ? ' is-group' : '')} data-tip={`${l}\n${series.map((s) => `${s.name}: ${f(s.values[i])}`).join('\n')}`}>
            {(stacked ? [...series].reverse() : series).map((s, j) => {
              const k = stacked ? series.length - 1 - j : j;
              return <i key={s.name} style={{ height: (Math.max(0, s.values[i] || 0) / max) * 100 + '%', background: toneOf(s, k) }} />;
            })}
          </div>
        ))}
      </div>
      <div className="rc-axis" aria-hidden="true">{labels.map((l, i) => <span key={i}>{i % step === 0 ? l : ''}</span>)}</div>
      <SrTable head={['', ...series.map((s) => s.name)]} rows={labels.map((l, i) => [l, ...series.map((s) => f(s.values[i]))])} />
    </div>
  );
}
