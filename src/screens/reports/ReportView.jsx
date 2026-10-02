'use client';
// ReportView — the one screen that shows any report definition (/report?id=<id>), laid out like a Shopify report:
//   back to the list · title · the period on one line; a toolbar with the period (Today … This year, Custom),
//   compare with the previous period or last year and the filters the report asks for (channel, place, staff …)
//   as small pickers; the key figures with the change against the compared period · one chart · the table
//   (drill-down, sort, search) · notes
//   choose and order the table's columns (kept per report on this device)
//   Download PDF (an A4 report with the shop's letterhead, period, filters and sign-off) · Download CSV
// Everything chosen lives in the address. Sending reports by email/WhatsApp is set up in Automation › Scheduled reports.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { EmptyState } from '@/components/ui';
import { reportBy, GROUP_BY_ID, FILTERS, filterShown, reportInEdition } from '@/lib/reports/catalogue';
import { PRESETS, periodOf, compareOf, rangeText, fmt, change, csvValue, downloadCsv, clockNow, dayKey, addDays } from '@/lib/reports/period';
import { markViewed } from '@/lib/reports/prefs';
import { MERCHANT } from '@/lib/merchant';
import { ReportsShell, useDataTick } from '@/components/reports/ReportsShell';
import { ReportChart, CHART_CSS } from '@/components/reports/ReportChart';
import { ReportTable, TABLE_CSS, totalsOf, visibleColumns } from '@/components/reports/ReportTable';
import { AdSpendDialog } from '@/components/reports/AdSpendDialog';

const CSS = CHART_CSS + TABLE_CSS + `
/* the toolbar: period, compare and the report's filters as quiet pickers and dashed pills (Shopify's report bar) */
.rv-tools{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.rv-tools .ix-pick{max-width:220px}
.rv-tools .ix-filter{height:32px}
/* key figures: the kit's strip with a third line (the change, or what the figure is made of) */
.rv-kpi{flex-direction:column;align-items:stretch;justify-content:flex-start;gap:2px}
.rv-kpi .ix-metric__value{overflow:hidden;text-overflow:ellipsis}
.rv-sub{display:block;overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.rv-delta{display:inline-flex;align-items:center;gap:2px;font-family:var(--font-data);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.rv-delta.is-good{color:var(--text-success)}.rv-delta.is-bad{color:var(--text-danger)}.rv-delta.is-flat{color:var(--text-muted)}
.rv-vs{font-weight:var(--weight-regular);color:var(--text-muted)}
/* the table card: the report table's own bar sits like the index card's bar */
.rv-table .rt-bar{min-height:44px;padding:6px 8px 6px 12px;gap:var(--space-2);border-bottom:1px solid var(--border-subtle)}
.rv-table .rt-bar .gc-input{height:32px;max-width:260px}
.rv-table .rt-bar .gc-btn--sm{height:28px}
.rv-table .rt-more{border-top:1px solid var(--border-subtle)}
.rv-notes{margin:0;padding:var(--space-3) var(--space-4);list-style:none;display:flex;flex-direction:column;gap:4px;border-top:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-muted)}
.rv-notes li::before{content:'· '}
.rv-error{margin:0;padding:var(--space-4);font-size:var(--text-sm);color:var(--text-danger)}
@media (max-width:640px){
  .rv-tools>*{flex:1 1 140px;max-width:none!important}
  .rv-table .rt-bar .gc-input{max-width:none}
}
/* the PDF: letterhead, report details, figures, table and sign-off on A4 */
.rv-doc{display:none}
@media print{
  @page{size:A4 portrait;margin:14mm 12mm 16mm;@bottom-left{content:"${MERCHANT.name} · confidential";font-family:var(--font-sans);font-size:8pt;color:#64748b}@bottom-right{content:"Page " counter(page) " of " counter(pages);font-family:var(--font-sans);font-size:8pt;color:#64748b}}
  @page wide{size:A4 landscape;margin:12mm 12mm 14mm;@bottom-left{content:"${MERCHANT.name} · confidential";font-family:var(--font-sans);font-size:8pt;color:#64748b}@bottom-right{content:"Page " counter(page) " of " counter(pages);font-family:var(--font-sans);font-size:8pt;color:#64748b}}
  body.rv-print-wide{page:wide}
  html,body{background:#fff!important}
  *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .rv-doc{display:block}
  .ix-head,.gc-pagehead{display:none!important}
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
  .rv-kpi .ix-metric__label,.rv-sub{font-size:7.5pt!important;white-space:normal!important;text-decoration:none!important}
  .ix-card{border:1px solid var(--border-subtle)!important;border-radius:var(--radius-md)!important;box-shadow:none!important}
  .rv-chart-card{break-inside:avoid}
  .rv-table{break-inside:auto!important;overflow:visible!important}
  .rv-chart-card .ix-card__body{padding:10px 12px!important}
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
  const found = q ? reportBy(q.id) : null;
  const def = found && reportInEdition(found) ? found : null;   // a report outside this site's edition is not shown
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
    return Object.fromEntries((def.filters || []).filter((k) => filterShown(k)).map((k) => [k, FILTERS[k].options()]));
  }, [def, tick]);

  if (!q) return <ReportsShell screen="ReportView" active="rep-all" page="Report" back="/reports-centre" title="Report" css={CSS} />;
  if (!def) {
    return (
      <ReportsShell screen="ReportView" active="rep-all" page="Report" back="/reports-centre" title="Report not found" css={CSS}>
        <section className="ix-card"><div className="ix-empty"><EmptyState icon="file-question" title={found ? "This report isn’t in your edition" : "This report doesn’t exist"} body={found ? "It belongs to a module your shop doesn’t use. Open the reports you have from the list." : "It may have been renamed. Open it from the list of reports."} actionLabel="All reports" onAction={() => navigate('/reports-centre')} /></div></section>
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

  const filtersShown = (def.filters || []).filter((k) => filterShown(k));
  return (
    <ReportsShell screen="ReportView" active={'rep-' + def.group} page={def.title} css={CSS}
      back={'/reports-centre?group=' + def.group} title={def.title} about={def.description}
      meta={<span aria-live="polite">{group.label} · {periodText}{cmp ? ` · compared with ${rangeText(cmp.from, cmp.to)}` : ''}</span>}
      secondary={[
        def.id === 'ad-spend-roas' ? { label: 'Add ad spend', icon: 'plus', onClick: () => setDialog('adspend') } : null,
        { label: 'Download CSV', onClick: csv, disabled: !res },
      ].filter(Boolean)}
      primary={{ label: 'Download PDF', onClick: pdf, disabled: !res }}>
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

      {!def.snapshot || filtersShown.length ? (
        <div className="rv-tools rp-noprint" role="group" aria-label="Period and filters">
          {!def.snapshot ? (
            <select id="rv-period" className="ix-pick" aria-label="Period" value={preset} onChange={(e) => setQuery({ preset: e.target.value, ...(e.target.value === 'custom' && !q.from ? { from: dayKey(period.from), to: dayKey(addDays(period.to, -1)) } : {}) })}>
              {PRESETS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          ) : null}
          {!def.snapshot && preset === 'custom' ? (<>
            <input id="rv-from" type="date" className="ix-date" aria-label="From" value={q.from} max={q.to || undefined} onChange={(e) => setQuery({ from: e.target.value })} />
            <input id="rv-to" type="date" className="ix-date" aria-label="To" value={q.to} min={q.from || undefined} onChange={(e) => setQuery({ to: e.target.value })} />
          </>) : null}
          {!def.snapshot && def.compare !== false ? (
            <select id="rv-cmp" className="ix-pick" aria-label="Compare with" value={cmpMode} onChange={(e) => setQuery({ cmp: e.target.value })}>
              <option value="previous">The period before</option><option value="year">Same dates last year</option><option value="none">No comparison</option>
            </select>
          ) : null}
          {filtersShown.map((k) => (
            <select key={k} id={'rv-f-' + k} aria-label={FILTERS[k].label} className={'ix-filter' + (q.filters[k] ? ' is-set' : '')} value={q.filters[k] || ''} onChange={(e) => setQuery({ filters: { [k]: e.target.value } })}>
              <option value="">{FILTERS[k].all}</option>
              {(options[k] || []).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
        </div>
      ) : null}

      {result && result.error ? <section className="ix-card"><p className="rv-error">This report could not be worked out: {result.error}</p></section> : null}

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
          <ReportTable key={def.id} table={res.table} onOpen={(href) => navigate(href)} colKeys={cols} onColumns={chooseCols} />
          {res.notes && res.notes.length ? <ul className="rv-notes">{res.notes.map((n) => <li key={n}>{n}</li>)}</ul> : null}
        </section>
      ) : null}

      {!result && tick ? <section className="ix-card"><div className="ix-empty"><EmptyState icon="loader" title="Working out the report…" body="" /></div></section> : null}

      <div className="rv-doc" aria-hidden="true">
        <div className="rv-doc-sign"><div>Prepared by</div><div>Checked by</div><div>Approved by</div></div>
        <p className="rv-doc-end">Generated by GridCommerce on {fmt(now, 'datetime')}. Figures as recorded in the shop’s books at that time.</p>
      </div>
      {dialog === 'adspend' ? <AdSpendDialog onClose={() => setDialog(null)} /> : null}
    </ReportsShell>
  );
}
