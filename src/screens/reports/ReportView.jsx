'use client';
// ReportView — the one screen that shows any report definition (/report?id=<id>).
//   period (Today … This year, Custom) + compare with the previous period or last year
//   filters the report asks for (channel, place, staff, category, courier …)
//   KPIs with the change against the compared period · chart · table with drill-down · notes
//   choose and order the table's columns (kept per report on this device)
//   Download PDF (an A4 report with the shop's letterhead, period, filters and sign-off) · Download CSV
// Everything chosen lives in the address. Sending reports by email/WhatsApp is set up in Automation › Scheduled reports.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { EmptyState } from '@/components/ui';
import { reportBy, GROUP_BY_ID, FILTERS } from '@/lib/reports/catalogue';
import { PRESETS, periodOf, compareOf, rangeText, fmt, change, csvValue, downloadCsv, clockNow, dayKey, addDays } from '@/lib/reports/period';
import { markViewed } from '@/lib/reports/prefs';
import { MERCHANT } from '@/lib/merchant';
import { ReportsShell, useDataTick } from '@/components/reports/ReportsShell';
import { ReportChart, CHART_CSS } from '@/components/reports/ReportChart';
import { ReportTable, TABLE_CSS, totalsOf, visibleColumns } from '@/components/reports/ReportTable';
import { AdSpendDialog } from '@/components/reports/AdSpendDialog';

const CSS = CHART_CSS + TABLE_CSS + `
.rv-controls{display:flex;flex-wrap:wrap;align-items:flex-end;gap:var(--space-3);padding:var(--space-4) var(--space-5)}
.rv-controls > div{display:flex;flex-direction:column;gap:4px;min-width:0}
.rv-controls .gc-input{min-width:150px}
.rv-range{flex-basis:100%;margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.rv-range b{font-weight:var(--weight-medium);color:var(--text-heading)}
.rv-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(170px,100%),1fr));gap:var(--space-3)}
.rv-kpi{display:flex;flex-direction:column;gap:2px;padding:var(--space-3) var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);min-width:0}
.rv-kpi span{font-size:var(--text-xs);color:var(--text-muted)}
.rv-kpi b{font-family:var(--font-data);font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--text-heading);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rv-kpi small{font-size:var(--text-xs);color:var(--text-muted)}
.rv-delta{display:inline-flex;align-items:center;gap:2px;font-size:var(--text-xs);font-weight:var(--weight-medium);font-family:var(--font-data)}
.rv-delta.is-good{color:var(--text-success)}.rv-delta.is-bad{color:var(--text-danger)}.rv-delta.is-flat{color:var(--text-muted)}
.rv-chart{padding:var(--space-4) var(--space-5) var(--space-5);min-width:0;overflow:hidden}
.rv-notes{margin:0;padding:0 var(--space-5) var(--space-4);list-style:none;display:flex;flex-direction:column;gap:4px;font-size:var(--text-xs);color:var(--text-muted)}
.rv-notes li::before{content:'· '}
.rv-error{padding:var(--space-5);font-size:var(--text-sm);color:var(--text-danger)}
@media (max-width:640px){.rv-controls .gc-input{min-width:0;width:100%}.rv-controls > div{flex:1 1 140px}}
/* phones: figures two to a row (an odd last one takes the full row); filters one per row on narrow phones */
@media (max-width:640px){.rv-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.rv-kpi:last-child:nth-child(odd){grid-column:1/-1}}
@media (max-width:400px){.rv-controls > div{flex-basis:100%}}
/* the PDF: letterhead, report details, figures, table and sign-off on A4 */
.rv-doc{display:none}
@media print{
  @page{size:A4 portrait;margin:14mm 12mm 16mm;@bottom-left{content:"${MERCHANT.name} · confidential";font-family:var(--font-sans);font-size:8pt;color:#64748b}@bottom-right{content:"Page " counter(page) " of " counter(pages);font-family:var(--font-sans);font-size:8pt;color:#64748b}}
  @page wide{size:A4 landscape;margin:12mm 12mm 14mm;@bottom-left{content:"${MERCHANT.name} · confidential";font-family:var(--font-sans);font-size:8pt;color:#64748b}@bottom-right{content:"Page " counter(page) " of " counter(pages);font-family:var(--font-sans);font-size:8pt;color:#64748b}}
  body.rv-print-wide{page:wide}
  html,body{background:#fff!important}
  *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .rv-doc{display:block}
  .gc-pagehead{display:none!important}
  .gc-shell__content{gap:10px!important}
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
  .rv-kpis{grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:6px!important}
  .rv-kpi{padding:7px 9px!important;border:1px solid var(--border-subtle)!important;border-radius:var(--radius-md)!important;break-inside:avoid}
  .rv-kpi b{font-size:12pt!important;white-space:normal!important}
  .rv-kpi span,.rv-kpi small{font-size:7.5pt!important}
  .gc-card{border:1px solid var(--border-subtle)!important;border-radius:var(--radius-md)!important;box-shadow:none!important}
  section[aria-label="Chart"]{break-inside:avoid}
  section[aria-label="Table"]{break-inside:auto!important;overflow:visible!important}
  .rv-chart{padding:10px 12px!important}
  .rc-bars{height:150px!important}
  .gc-table-wrap{overflow:visible!important}
  .rt-table{font-size:8pt!important;width:100%}
  .rt-table th{background:var(--surface-subtle)!important;font-size:7.5pt!important;padding:6px 8px!important}
  .rt-table td{padding:4px 8px!important}
  .rt-table thead{display:table-header-group}
  .rt-table tfoot{display:table-row-group}
  .rt-table tr{break-inside:avoid}
  .rt-table a{color:inherit;text-decoration:none}
  .rt-table th button svg{display:none}
  .rv-notes{font-size:7.5pt!important;padding:8px 10px!important}
  .rv-doc-sign{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin-top:34px;break-inside:avoid}
  .rv-doc-sign div{border-top:1px solid var(--text-body);padding-top:4px;font-size:8pt;color:var(--text-muted)}
  .rv-doc-end{margin-top:10px;font-size:7.5pt;color:var(--text-muted)}
}
`;

function readQuery() {
  if (typeof window === 'undefined') return {};
  const q = new URLSearchParams(window.location.search);
  const filters = {};
  q.forEach((v, k) => { if (k.startsWith('f_')) filters[k.slice(2)] = v; });
  return { id: q.get('id') || '', preset: q.get('p') || '', from: q.get('from') || '', to: q.get('to') || '', cmp: q.get('cmp') || '', filters };
}

export default function ReportView() {
  const tick = useDataTick();
  const [q, setQ] = useState(null);            // the query, read after mount
  const [dialog, setDialog] = useState(null);  // 'adspend'
  const [cols, setCols] = useState(null);      // chosen columns (keys in order) for this report, null = as designed

  useEffect(() => {
    const read = () => setQ(readQuery());
    read();
    window.addEventListener('gc:route', read);
    window.addEventListener('popstate', read);
    return () => { window.removeEventListener('gc:route', read); window.removeEventListener('popstate', read); };
  }, []);
  const def = q ? reportBy(q.id) : null;
  const colsKey = def ? 'gc.reports.cols.' + def.id : '';
  useEffect(() => {
    if (!def) return;
    markViewed(def.id);
    try { setCols(JSON.parse(window.localStorage.getItem(colsKey)) || null); } catch { setCols(null); }
  }, [def && def.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const chooseCols = (keys) => {
    setCols(keys);
    try { if (keys) window.localStorage.setItem(colsKey, JSON.stringify(keys)); else window.localStorage.removeItem(colsKey); } catch { /* ignore */ }
  };

  const preset = (q && q.preset) || (def && def.defaultPeriod) || 'month';
  const now = q ? clockNow() : 0;
  const period = q ? periodOf(preset, now, { from: q.from, to: q.to }) : null;
  const cmpMode = q ? (q.cmp || (def && def.compare === false ? 'none' : 'previous')) : 'none';
  const cmp = period && def && !def.snapshot && def.compare !== false ? compareOf(period, cmpMode) : null;

  const setQuery = (patch) => {
    const next = { ...q, ...patch, filters: { ...q.filters, ...(patch.filters || {}) } };
    const u = new URLSearchParams();
    u.set('id', next.id);
    if (next.preset) u.set('p', next.preset);
    if (next.preset === 'custom') { if (next.from) u.set('from', next.from); if (next.to) u.set('to', next.to); }
    if (next.cmp) u.set('cmp', next.cmp);
    Object.entries(next.filters).forEach(([k, v]) => { if (v) u.set('f_' + k, v); });
    window.history.replaceState(window.history.state, '', '/report?' + u.toString());
    setQ(next);
  };

  const result = useMemo(() => {
    if (!def || def.kind !== 'def' || !period) return null;
    try {
      const ctx = { from: period.from, to: period.to, now, filters: q.filters };
      const cur = def.compute(ctx);
      let before = null;
      if (cmp) { try { before = def.compute({ ...ctx, from: cmp.from, to: cmp.to }); } catch { before = null; } }
      return { cur, before };
    } catch (e) {
      return { error: String(e && e.message ? e.message : e) };
    }
  }, [def, period && period.from, period && period.to, cmp && cmp.from, JSON.stringify(q && q.filters), tick]); // eslint-disable-line react-hooks/exhaustive-deps

  const options = useMemo(() => {
    if (!def || !tick) return {};
    return Object.fromEntries((def.filters || []).filter((k) => FILTERS[k]).map((k) => [k, FILTERS[k].options()]));
  }, [def, tick]);

  if (!q) return <ReportsShell screen="ReportView" active="rep-all" page="Report" title="Report" css={CSS} />;
  if (!def) {
    return (
      <ReportsShell screen="ReportView" active="rep-all" page="Report" title="Report not found" css={CSS}>
        <section className="gc-card"><EmptyState icon="file-question" title="This report doesn’t exist" body="It may have been renamed. Open it from the list of reports." actionLabel="All reports" onAction={() => navigate('/reports-centre')} /></section>
      </ReportsShell>
    );
  }
  if (def.kind === 'page') { if (typeof window !== 'undefined') navigate(def.href); return null; }

  const group = GROUP_BY_ID[def.group] || { label: 'Reports' };
  const res = result && result.cur;
  const kpiBefore = (k) => (result && result.before && result.before.kpis ? (result.before.kpis.find((x) => x.key === k.key) || {}).value : undefined);
  const csv = () => {
    if (!res) return;
    const rows = [[def.title], [def.snapshot ? 'As of ' + fmt(now, 'datetime') : rangeText(period.from, period.to)], []];
    (res.kpis || []).forEach((k) => rows.push([k.label, csvValue(k.value, k.format)]));
    if (res.table) {
      const shown = visibleColumns(res.table, cols);
      rows.push([]);
      rows.push(shown.map((c) => c.label));
      res.table.rows.forEach((r) => rows.push(shown.map((c) => csvValue(r[c.key], c.format))));
      const t = res.table.totals || totalsOf(res.table, res.table.rows, shown);
      if (t) rows.push(shown.map((c) => (t[c.key] == null ? '' : typeof t[c.key] === 'number' ? csvValue(t[c.key], c.format) : t[c.key])));
    }
    downloadCsv(`${def.id}-${dayKey(period.from)}.csv`, rows);
    toast('CSV downloaded');
  };
  const periodText = def.snapshot ? 'As of ' + fmt(now, 'datetime') : rangeText(period.from, period.to);
  // the browser's "Save as PDF" names the file after the page title
  const pdf = () => {
    const before = document.title;
    document.title = `${MERCHANT.name} - ${def.title} - ${periodText}`;
    // tables with many columns go on landscape pages
    document.body.classList.toggle('rv-print-wide', shownCols.length > 7);
    window.print();
    setTimeout(() => { document.title = before; document.body.classList.remove('rv-print-wide'); }, 500);
  };
  const filterText = (def.filters || []).filter((k) => FILTERS[k] && q.filters[k]).map((k) => {
    const opt = (options[k] || []).find(([v]) => v === q.filters[k]);
    return `${FILTERS[k].label}: ${opt ? opt[1] : q.filters[k]}`;
  }).join(' · ');
  const shownCols = res && res.table ? visibleColumns(res.table, cols) : [];

  const actions = (
    <span className="rp-noprint" style={{ display: 'contents' }}>
      {def.id === 'ad-spend-roas' ? <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setDialog('adspend')}><Icon name="plus" width="18" height="18" aria-hidden="true" /> Add ad spend</button> : null}
      <button type="button" className="gc-btn gc-btn--neutral" onClick={csv} disabled={!res}><Icon name="sheet" width="18" height="18" aria-hidden="true" /> Download CSV</button>
      <button type="button" className="gc-btn gc-btn--solid" onClick={pdf} disabled={!res}><Icon name="file-down" width="18" height="18" aria-hidden="true" /> Download PDF</button>
    </span>
  );

  return (
    <ReportsShell screen="ReportView" active={'rep-' + def.group} page={def.title} title={def.title} description={def.description} actions={actions} css={CSS}>
      <div className="rv-doc" aria-hidden="true">
        <header className="rv-doc-head">
          <div className="rv-doc-brand">
            <svg width="44" height="44" viewBox="0 0 52 52"><rect width="52" height="52" rx="12" fill="var(--primary)" /><path d="M35 19a10 10 0 1 0 1 13v-6h-9" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <div><b>{MERCHANT.name}</b><span>{MERCHANT.address}</span><span>{MERCHANT.phone} · {MERCHANT.email}</span><span>{MERCHANT.web} · BIN {MERCHANT.bin}</span></div>
          </div>
          <div className="rv-doc-meta">
            <span className="rv-doc-kind">{group.label} report</span>
            <h2>{def.title}</h2>
            <dl>
              <dt>{def.snapshot ? 'Figures' : 'Period'}</dt><dd>{periodText}</dd>
              {cmp ? <><dt>Compared with</dt><dd>{rangeText(cmp.from, cmp.to)}</dd></> : null}
              <dt>Filters</dt><dd>{filterText || 'None (everything)'}</dd>
              <dt>Prepared</dt><dd>{fmt(now, 'datetime')}</dd>
              <dt>Prepared by</dt><dd>Mehedi Rahman · Owner</dd>
            </dl>
          </div>
        </header>
        <p className="rv-doc-desc">{def.description}</p>
      </div>
      <section className="gc-card rp-noprint" aria-label="Period and filters">
        <div className="rv-controls">
          {!def.snapshot ? (
            <div>
              <label className="gc-label" htmlFor="rv-period">Period</label>
              <select id="rv-period" className="gc-input gc-select" value={preset} onChange={(e) => setQuery({ preset: e.target.value, ...(e.target.value === 'custom' && !q.from ? { from: dayKey(period.from), to: dayKey(addDays(period.to, -1)) } : {}) })}>
                {PRESETS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
            </div>
          ) : null}
          {!def.snapshot && preset === 'custom' ? (
            <>
              <div><label className="gc-label" htmlFor="rv-from">From</label><input id="rv-from" type="date" className="gc-input" value={q.from} max={q.to || undefined} onChange={(e) => setQuery({ from: e.target.value })} /></div>
              <div><label className="gc-label" htmlFor="rv-to">To</label><input id="rv-to" type="date" className="gc-input" value={q.to} min={q.from || undefined} onChange={(e) => setQuery({ to: e.target.value })} /></div>
            </>
          ) : null}
          {!def.snapshot && def.compare !== false ? (
            <div>
              <label className="gc-label" htmlFor="rv-cmp">Compare with</label>
              <select id="rv-cmp" className="gc-input gc-select" value={cmpMode} onChange={(e) => setQuery({ cmp: e.target.value })}>
                <option value="previous">The period before</option><option value="year">Same dates last year</option><option value="none">No comparison</option>
              </select>
            </div>
          ) : null}
          {(def.filters || []).filter((k) => FILTERS[k]).map((k) => (
            <div key={k}>
              <label className="gc-label" htmlFor={'rv-f-' + k}>{FILTERS[k].label}</label>
              <select id={'rv-f-' + k} className="gc-input gc-select" value={q.filters[k] || ''} onChange={(e) => setQuery({ filters: { [k]: e.target.value } })}>
                <option value="">{FILTERS[k].all}</option>
                {(options[k] || []).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
          <p className="rv-range" aria-live="polite">
            <Link href={'/reports-centre?group=' + def.group}>{group.label}</Link> · <b>{periodText}</b>{cmp ? ` · compared with ${rangeText(cmp.from, cmp.to)}` : ''}
          </p>
        </div>
      </section>

      {result && result.error ? <section className="gc-card"><p className="rv-error">This report could not be worked out: {result.error}</p></section> : null}

      {res && res.kpis && res.kpis.length ? (
        <div className="rv-kpis">
          {res.kpis.map((k) => {
            const b = kpiBefore(k);
            const d = typeof k.value === 'number' && typeof b === 'number' ? change(k.value, b) : null;
            const good = d == null || k.good === 'none' || Math.abs(d) < 0.005 ? 'is-flat' : (d > 0) === (k.good !== 'down') ? 'is-good' : 'is-bad';
            return (
              <div key={k.key} className="rv-kpi">
                <span>{k.label}</span>
                <b title={fmt(k.value, k.format)}>{fmt(k.value, k.format)}</b>
                {d != null ? <span className={'rv-delta ' + good}><Icon name={d > 0 ? 'arrow-up-right' : d < 0 ? 'arrow-down-right' : 'minus'} width="12" height="12" aria-hidden="true" />{fmt(Math.abs(d), 'pct')} <span style={{ color: 'var(--text-muted)', fontWeight: 'var(--weight-regular)' }}>vs {fmt(b, k.format)}</span></span> : k.sub ? <small>{k.sub}</small> : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {res && res.chart ? (
        <section className="gc-card" aria-label="Chart">
          <div className="rv-chart"><ReportChart chart={res.chart} /></div>
        </section>
      ) : null}

      {res && res.table ? (
        <section className="gc-card" aria-label="Table" style={{ overflow: 'hidden' }}>
          <ReportTable key={def.id} table={res.table} onOpen={(href) => navigate(href)} colKeys={cols} onColumns={chooseCols} />
          {res.notes && res.notes.length ? <ul className="rv-notes" style={{ paddingTop: 'var(--space-3)' }}>{res.notes.map((n) => <li key={n}>{n}</li>)}</ul> : null}
        </section>
      ) : null}

      {!result && tick ? <section className="gc-card"><EmptyState icon="loader" title="Working out the report…" body="" /></section> : null}

      <div className="rv-doc" aria-hidden="true">
        <div className="rv-doc-sign"><div>Prepared by</div><div>Checked by</div><div>Approved by</div></div>
        <p className="rv-doc-end">Generated by GridCommerce on {fmt(now, 'datetime')}. Figures as recorded in the shop’s books at that time.</p>
      </div>
      {dialog === 'adspend' ? <AdSpendDialog onClose={() => setDialog(null)} /> : null}
    </ReportsShell>
  );
}
