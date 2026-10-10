'use client';
// ReportView (/admin/reports/view?id=<id>) — one report definition (lib/admin/reportDefs.js), laid out like the merchant
// panel's report page: back to Reports · title · group and period; a toolbar with the period (Last 7 days … Last 12
// months, Custom), the comparison (the period before, same dates last year, none) and the filters the report asks for;
// the key figures with the change against the compared period, one chart, the table (sort, search, choose and order the
// columns — kept per report on this device — totals) and notes. Download CSV, Print / PDF (A4 with GridCommerce's
// letterhead and sign-off) and Schedule (the Reports page's side panel).
// Everything chosen lives in the address (?id, ?p, ?cmp, ?from, ?to, ?f_<filter>); worked out after the data loads.

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { EmptyState } from '@/components/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import { ReportChart, CHART_CSS as RC_CSS } from '@/components/reports/ReportChart';
import { ReportTable, TABLE_CSS, totalsOf, visibleColumns } from '@/components/reports/ReportTable';
import { fmt, csvValue, downloadCsv } from '@/lib/reports/period';
import { DAY, dhaka, dmy, hm } from '@/lib/platform/util';
import { staff } from '@/lib/platform/store';
import { reportBy, GROUP_BY_ID, FILTERS, runReport } from '@/lib/admin/reportDefs';
import { PERIODS, COMPARE, periodRange, compareRange, rangeLabel } from '@/lib/admin/analytics';
import { AdminShell } from '../AdminShell';
import { AN_CSS, useAnalytics, change } from './anShared';
import { ScheduleSheet } from './Reports';

const CSS = RC_CSS + TABLE_CSS + `
.rv-tools{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.rv-tools .ix-pick{max-width:220px}
.rv-tools .ix-filter{height:32px}
.rv-kpis{overflow-x:auto}
.rv-kpi{flex-direction:column;align-items:stretch;justify-content:flex-start;gap:2px;min-width:150px}
.rv-kpi .ix-metric__value{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rv-sub{display:block;overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.rv-delta{display:inline-flex;align-items:center;gap:2px;font-family:var(--font-data);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.rv-delta.is-good{color:var(--text-success)}.rv-delta.is-bad{color:var(--text-danger)}.rv-delta.is-flat{color:var(--text-muted)}
.rv-vs{font-weight:var(--weight-regular);color:var(--text-muted)}
.rv-table .rt-bar{min-height:44px;padding:6px 8px 6px 12px;gap:var(--space-2);border-bottom:1px solid var(--border-subtle)}
.rv-table .rt-bar .gc-input{height:32px;max-width:260px}
.rv-table .rt-more{border-top:1px solid var(--border-subtle)}
.rv-notes{margin:0;padding:var(--space-3) var(--space-4);list-style:none;display:flex;flex-direction:column;gap:4px;border-top:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-muted)}
.rv-notes li::before{content:'· '}
.rv-error{margin:0;padding:var(--space-4);font-size:var(--text-sm);color:var(--text-danger)}
@media (max-width:640px){.rv-tools>*{flex:1 1 140px;max-width:none!important}.rv-table .rt-bar .gc-input{max-width:none}}
.rv-doc{display:none}
@media print{
  @page{size:A4 portrait;margin:14mm 12mm 16mm;@bottom-left{content:"GridCommerce · confidential";font-family:var(--font-sans);font-size:8pt;color:#64748b}@bottom-right{content:"Page " counter(page) " of " counter(pages);font-family:var(--font-sans);font-size:8pt;color:#64748b}}
  @page wide{size:A4 landscape;margin:12mm 12mm 14mm}
  body.rv-print-wide{page:wide}
  html,body{background:#fff!important}
  *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .adm-side,.adm-top,.adm-backdrop,.adm-cmd,.adm-cmd-back,.rv-noprint,.ix-head{display:none!important}
  .gc-shell,.gc-shell__main{display:block!important;border:0!important;background:#fff!important}
  .gc-shell__content{padding:0!important}
  .rv-doc{display:block}
  .ix-page{gap:10px!important}
  .rv-doc-head{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;padding-bottom:12px;border-bottom:2px solid var(--primary);margin-bottom:12px}
  .rv-doc-brand{display:flex;gap:12px;align-items:flex-start}
  .rv-doc-brand b{display:block;font-size:15pt;font-weight:var(--weight-semibold);color:var(--text-heading)}
  .rv-doc-brand span{display:block;font-size:8pt;line-height:1.5;color:var(--text-body)}
  .rv-doc-meta{text-align:right;max-width:55%}
  .rv-doc-kind{display:block;font-size:8pt;letter-spacing:.08em;text-transform:uppercase;color:var(--primary);font-weight:var(--weight-semibold)}
  .rv-doc-meta h2{margin:2px 0 6px;font-size:17pt;line-height:1.2;font-weight:var(--weight-semibold);color:var(--text-heading)}
  .rv-doc-meta dl{margin:0;display:grid;grid-template-columns:auto auto;justify-content:end;gap:1px 10px;font-size:8pt}
  .rv-doc-meta dt{color:var(--text-muted)}
  .rv-doc-meta dd{margin:0;color:var(--text-heading);font-weight:var(--weight-medium);text-align:right}
  .rv-doc-desc{margin:0 0 10px;font-size:9pt;color:var(--text-body)}
  .rv-kpis{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:6px!important;overflow:visible!important;border:0!important;box-shadow:none!important}
  .rv-kpi{min-width:0!important;padding:7px 9px!important;border:1px solid var(--border-subtle)!important;border-radius:var(--radius-md)!important;break-inside:avoid}
  .rv-kpi .ix-metric__value{font-size:12pt!important;white-space:normal!important}
  .ix-card{border:1px solid var(--border-subtle)!important;border-radius:var(--radius-md)!important;box-shadow:none!important}
  .rv-chart-card{break-inside:avoid}
  .rv-table{break-inside:auto!important;overflow:visible!important}
  .rc-bars{height:150px!important}
  .gc-table-wrap{overflow:visible!important}
  .rt-table{font-size:8pt!important;width:100%}
  .rt-table th{background:var(--surface-subtle)!important;font-size:7.5pt!important;padding:6px 8px!important}
  .rt-table td{padding:4px 8px!important}
  .rt-table thead{display:table-header-group}
  .rt-table tr{break-inside:avoid}
  .rt-table a{color:inherit;text-decoration:none}
  .rt-table th button svg{display:none}
  .rv-notes{font-size:7.5pt!important;padding:8px 10px!important}
  .rv-doc-sign{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin-top:34px;break-inside:avoid}
  .rv-doc-sign div{border-top:1px solid var(--text-body);padding-top:4px;font-size:8pt;color:var(--text-muted)}
  .rv-doc-end{margin-top:10px;font-size:7.5pt;color:var(--text-muted)}
}
`;

const COLS_KEY = 'gc.admin.reports.cols.';
/** "2026-10-11" → that Dhaka midnight (ms), or null. */
const dayFromKey = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? dhaka(+m[1], +m[2] - 1, +m[3]) : null; };
/** That Dhaka day as "2026-10-11". */
const keyOf = (ms) => { const d = new Date(ms + 6 * 3600e3); return d.toISOString().slice(0, 10); };

function readQuery() {
  const u = new URLSearchParams(window.location.search);
  const filters = {};
  u.forEach((v, k) => { if (k.startsWith('f_')) filters[k.slice(2)] = v; });
  return { id: u.get('id') || '', p: u.get('p') || '', cmp: u.get('cmp') || '', from: u.get('from') || '', to: u.get('to') || '', filters };
}

export default function ReportView() {
  const router = useRouter();
  const { db, t, data, live } = useAnalytics();
  const [q, setQ] = useState(null);
  const [cols, setCols] = useState(null);
  const [scheduling, setScheduling] = useState(false);
  useEffect(() => { setQ(readQuery()); }, []);
  const def = q ? reportBy(q.id) : null;
  useEffect(() => {
    if (!def) return;
    try { setCols(JSON.parse(window.localStorage.getItem(COLS_KEY + def.id)) || null); } catch { setCols(null); }
  }, [def && def.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const chooseCols = (keys) => {
    setCols(keys);
    try { if (keys) window.localStorage.setItem(COLS_KEY + def.id, JSON.stringify(keys)); else window.localStorage.removeItem(COLS_KEY + def.id); } catch { /* ignore */ }
  };

  const preset = (q && q.p) || (def && def.defaultPeriod) || '30';
  let period = null;
  if (q && def) {
    if (preset === 'custom') {
      const a = dayFromKey(q.from), b = dayFromKey(q.to);
      period = a != null && b != null ? { from: Math.min(a, b), to: Math.max(a, b) + DAY } : periodRange('30', t);
    } else period = periodRange(preset, t);
  }
  const cmpMode = q ? (q.cmp || (def && def.compare === false ? 'none' : 'previous')) : 'none';
  const cmp = period && def && !def.snapshot && def.compare !== false ? compareRange(period, cmpMode) : null;

  const setQuery = (patch) => {
    const next = { ...q, ...patch, filters: { ...q.filters, ...(patch.filters || {}) } };
    const u = new URLSearchParams();
    u.set('id', next.id);
    if (next.p) u.set('p', next.p);
    if (next.p === 'custom') { if (next.from) u.set('from', next.from); if (next.to) u.set('to', next.to); }
    if (next.cmp) u.set('cmp', next.cmp);
    Object.entries(next.filters).forEach(([k, v]) => { if (v) u.set('f_' + k, v); });
    window.history.replaceState(window.history.state, '', '/admin/reports/view?' + u.toString());
    setQ(next);
  };

  const minute = Math.floor(t / 60000);
  const result = useMemo(() => {
    if (!live || !def || !period) return null;
    const shared = {};
    try {
      const cur = runReport(def, { db, t, data, from: period.from, to: period.to, filters: q.filters }, shared);
      let before = null;
      if (cmp) { try { before = runReport(def, { db, t, data, from: cmp.from, to: cmp.to, filters: q.filters }, shared); } catch { before = null; } }
      return { cur, before };
    } catch (e) {
      if (typeof console !== 'undefined') console.error(e);
      return { error: String(e && e.message ? e.message : e) };
    }
  }, [live, def, period && period.from, period && period.to, cmp && cmp.from, JSON.stringify(q && q.filters), minute]); // eslint-disable-line react-hooks/exhaustive-deps

  const options = useMemo(() => (def && live ? Object.fromEntries((def.filters || []).map((k) => [k, FILTERS[k].options(db, data)])) : {}), [def, live]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!q) return <AdminShell active="reports" title="Report"><div className="ix-page" /></AdminShell>;
  if (!def) {
    return (
      <AdminShell active="reports" title="Report not found">
        <div className="ix-page">
          <RecordHeader back="/admin/reports" backLabel="Back to reports" title="Report not found" />
          <section className="ix-card"><div className="ix-empty"><EmptyState icon="file-question" title="This report doesn’t exist." actionLabel="All reports" onAction={() => router.push('/admin/reports')} /></div></section>
        </div>
      </AdminShell>
    );
  }

  const group = GROUP_BY_ID[def.group] || { label: 'Reports' };
  const res = result && result.cur;
  const periodText = def.snapshot ? `As of ${dmy(t)}, ${hm(t)}` : period ? rangeLabel(period.from, Math.min(period.to, t + 1)) : '';
  const cmpText = cmp ? rangeLabel(cmp.from, cmp.to) : '';
  const shownCols = res && res.table ? visibleColumns(res.table, cols) : [];
  const filterText = (def.filters || []).filter((k) => q.filters[k]).map((k) => {
    const opt = (options[k] || []).find(([v]) => v === q.filters[k]);
    return `${FILTERS[k].label}: ${opt ? opt[1] : q.filters[k]}`;
  }).join(' · ');
  const kpiBefore = (k) => (result && result.before && result.before.kpis ? (result.before.kpis.find((x) => x.key === k.key) || {}).value : undefined);

  const csv = () => {
    if (!res) return;
    const rows = [[def.title], [periodText + (cmp ? ' · compared with ' + cmpText : '')], filterText ? [filterText] : [], []];
    (res.kpis || []).forEach((k) => rows.push([k.label, csvValue(k.value, k.format)]));
    if (res.table) {
      rows.push([]);
      rows.push(shownCols.map((c) => c.label));
      res.table.rows.forEach((r) => rows.push(shownCols.map((c) => csvValue(r[c.key], c.format))));
      const tot = res.table.totals || totalsOf(res.table, res.table.rows, shownCols);
      if (tot) rows.push(shownCols.map((c) => (tot[c.key] == null ? '' : typeof tot[c.key] === 'number' ? csvValue(tot[c.key], c.format) : tot[c.key])));
    }
    downloadCsv(`gridcommerce-${def.id}-${period ? keyOf(period.from) : 'now'}.csv`, rows);
    toast('CSV downloaded');
  };
  const print = () => {
    const before = document.title;
    document.title = `GridCommerce - ${def.title} - ${periodText}`;
    document.body.classList.toggle('rv-print-wide', shownCols.length > 7);
    window.print();
    setTimeout(() => { document.title = before; document.body.classList.remove('rv-print-wide'); }, 500);
  };

  return (
    <AdminShell active="reports" title={def.title}>
      <style dangerouslySetInnerHTML={{ __html: AN_CSS + CSS }} />
      <div className="ix-page">
        <RecordHeader back={'/admin/reports'} backLabel="Back to reports" title={def.title} about={def.description}
          meta={<span aria-live="polite">{group.label} · {live ? periodText : '…'}{cmp && live ? ` · compared with ${cmpText}` : ''}</span>}
          secondary={[
            { label: 'Schedule', icon: 'clock', onClick: () => setScheduling(true) },
            { label: 'Download CSV', icon: 'download', onClick: csv, disabled: !res },
          ]}
          primary={{ label: 'Print or PDF', icon: 'printer', onClick: print, disabled: !res }} />

        <div className="rv-doc" aria-hidden="true">
          <header className="rv-doc-head">
            <div className="rv-doc-brand">
              <svg width="44" height="44" viewBox="0 0 52 52"><rect width="52" height="52" rx="12" fill="var(--primary)" /><path d="M35 19a10 10 0 1 0 1 13v-6h-9" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <div><b>GridCommerce</b><span>Commerce software for Bangladesh</span><span>gridcommerce.net</span></div>
            </div>
            <div className="rv-doc-meta">
              <span className="rv-doc-kind">{group.label} report</span>
              <h2>{def.title}</h2>
              <dl>
                <dt>{def.snapshot ? 'Figures' : 'Period'}</dt><dd>{periodText}</dd>
                {cmp ? <><dt>Compared with</dt><dd>{cmpText}</dd></> : null}
                <dt>Filters</dt><dd>{filterText || 'None (everything)'}</dd>
                <dt>Prepared</dt><dd>{dmy(t)}, {hm(t)}</dd>
                <dt>Prepared by</dt><dd>{staff().name}</dd>
              </dl>
            </div>
          </header>
          <p className="rv-doc-desc">{def.description}</p>
        </div>

        <div className="rv-tools rv-noprint" role="group" aria-label="Period and filters">
          {!def.snapshot ? (
            <select className="ix-pick" aria-label="Period" value={preset}
              onChange={(e) => setQuery({ p: e.target.value, ...(e.target.value === 'custom' && !q.from && period ? { from: keyOf(period.from), to: keyOf(Math.min(period.to, t) - 1) } : {}) })}>
              {PERIODS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              <option value="custom">Custom</option>
            </select>
          ) : null}
          {!def.snapshot && preset === 'custom' ? (<>
            <input type="date" className="ix-date" aria-label="From" value={q.from} max={q.to || undefined} onChange={(e) => setQuery({ from: e.target.value })} />
            <input type="date" className="ix-date" aria-label="To" value={q.to} min={q.from || undefined} onChange={(e) => setQuery({ to: e.target.value })} />
          </>) : null}
          {!def.snapshot && def.compare !== false ? (
            <select className="ix-pick" aria-label="Compare with" value={cmpMode} onChange={(e) => setQuery({ cmp: e.target.value })}>
              {COMPARE.map(([k, l]) => <option key={k} value={k}>{k === 'none' ? l : 'Compare: ' + l.toLowerCase()}</option>)}
            </select>
          ) : null}
          {(def.filters || []).map((k) => (
            <select key={k} aria-label={FILTERS[k].label} className={'ix-filter' + (q.filters[k] ? ' is-set' : '')} value={q.filters[k] || ''} onChange={(e) => setQuery({ filters: { [k]: e.target.value } })}>
              <option value="">{FILTERS[k].all}</option>
              {(options[k] || []).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
          {def.snapshot ? <span className="ix-muted" style={{ fontSize: 'var(--text-xs)' }}>Figures as of now</span> : null}
        </div>

        {!live ? <div className="an-skel an-skel--strip" aria-busy="true" aria-label="Working out the report" /> : null}
        {result && result.error ? <section className="ix-card"><p className="rv-error" role="alert">This report could not be worked out: {result.error}</p></section> : null}

        {res && res.kpis && res.kpis.length ? (
          <section className="ix-card ix-metrics rv-kpis" aria-label="Key figures">
            {res.kpis.map((k) => {
              const b = kpiBefore(k);
              const d = typeof k.value === 'number' && typeof b === 'number' ? change(k.value, b) : null;
              const good = d == null || k.good === 'none' || Math.abs(d) < 0.005 ? 'is-flat' : (d > 0) === (k.good !== 'down') ? 'is-good' : 'is-bad';
              return (
                <div key={k.key} className="ix-metric rv-kpi" title={k.sub || undefined}>
                  <span className="ix-metric__label">{k.label}</span>
                  <span className="ix-metric__value">{fmt(k.value, k.format)}</span>
                  {d != null ? <span className={'rv-sub rv-delta ' + good}><Icon name={d > 0 ? 'arrow-up-right' : d < 0 ? 'arrow-down-right' : 'minus'} width="12" height="12" aria-hidden="true" />{fmt(Math.abs(d), 'pct')} <span className="rv-vs">vs {fmt(b, k.format)}</span></span> : k.sub ? <span className="rv-sub">{k.sub}</span> : null}
                </div>
              );
            })}
          </section>
        ) : null}

        {res && res.chart ? (
          <section className="ix-card rv-chart-card" aria-label="Chart">
            <div className="ix-card__body"><ReportChart chart={res.chart} /></div>
          </section>
        ) : null}

        {res && res.table ? (
          <section className="ix-card rv-table" aria-label="Table">
            <ReportTable key={def.id} table={res.table} onOpen={(href) => router.push(href)} colKeys={cols} onColumns={chooseCols} />
            {res.notes && res.notes.length ? <ul className="rv-notes">{res.notes.map((n) => <li key={n}>{n}</li>)}</ul> : null}
          </section>
        ) : null}

        <div className="rv-doc" aria-hidden="true">
          <div className="rv-doc-sign"><div>Prepared by</div><div>Checked by</div><div>Approved by</div></div>
          <p className="rv-doc-end">Generated by the GridCommerce super admin on {dmy(t)} at {hm(t)}. Figures as recorded at that time.</p>
        </div>
      </div>
      {scheduling ? <ScheduleSheet reportId={def.id} onClose={() => setScheduling(false)} /> : null}
    </AdminShell>
  );
}
