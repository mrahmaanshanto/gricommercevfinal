'use client';
// ReportView — the one screen that shows any report definition (/report?id=<id>).
//   period (Today … This year, Custom) + compare with the previous period or last year
//   filters the report asks for (channel, place, staff, category, courier …)
//   KPIs with the change against the compared period · chart · table with drill-down · notes
//   Download CSV · Print / PDF · Favourite · Save view · Schedule · Copy link
// Everything chosen lives in the address, so a link or a saved view opens the same report.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { Dialog, EmptyState } from '@/components/ui';
import { reportBy, GROUP_BY_ID, FILTERS } from '@/lib/reports/catalogue';
import { PRESETS, PRESET_LABEL, periodOf, compareOf, rangeText, fmt, change, csvValue, downloadCsv, clockNow, dayKey, addDays } from '@/lib/reports/period';
import { getPrefs, toggleFav, markViewed, saveView, PREFS_EVENT } from '@/lib/reports/prefs';
import { ReportsShell, useDataTick } from '@/components/reports/ReportsShell';
import { ReportChart, CHART_CSS } from '@/components/reports/ReportChart';
import { ReportTable, TABLE_CSS, totalsOf } from '@/components/reports/ReportTable';
import { ScheduleDialog } from '@/components/reports/ScheduleDialog';
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
  const [fav, setFav] = useState(false);
  const [dialog, setDialog] = useState(null);  // 'save' | 'schedule'
  const [viewName, setViewName] = useState('');

  useEffect(() => {
    const read = () => setQ(readQuery());
    read();
    window.addEventListener('gc:route', read);
    window.addEventListener('popstate', read);
    return () => { window.removeEventListener('gc:route', read); window.removeEventListener('popstate', read); };
  }, []);
  const def = q ? reportBy(q.id) : null;
  useEffect(() => {
    if (!def) return undefined;
    markViewed(def.id);
    const on = () => setFav(getPrefs().favs.includes(def.id));
    on();
    window.addEventListener(PREFS_EVENT, on);
    return () => window.removeEventListener(PREFS_EVENT, on);
  }, [def && def.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
      rows.push([]);
      rows.push(res.table.columns.map((c) => c.label));
      res.table.rows.forEach((r) => rows.push(res.table.columns.map((c) => csvValue(r[c.key], c.format))));
      const t = res.table.totals || totalsOf(res.table, res.table.rows);
      if (t) rows.push(res.table.columns.map((c) => (t[c.key] == null ? '' : typeof t[c.key] === 'number' ? csvValue(t[c.key], c.format) : t[c.key])));
    }
    downloadCsv(`${def.id}-${dayKey(period.from)}.csv`, rows);
    toast('CSV downloaded');
  };
  const copyLink = async () => { try { await navigator.clipboard.writeText(window.location.href); toast('Link copied'); } catch { toast('Copy the address from the browser bar', { tone: 'info' }); } };

  const actions = (
    <span className="rp-noprint" style={{ display: 'contents' }}>
      <button type="button" className="gc-btn gc-btn--neutral" onClick={() => { const on = toggleFav(def.id); toast(on ? 'Added to favourites' : 'Removed from favourites'); }} aria-pressed={fav}><Icon name="star" width="18" height="18" aria-hidden="true" style={fav ? { fill: 'currentColor', color: 'var(--text-warning)' } : undefined} /> {fav ? 'Favourite' : 'Add to favourites'}</button>
      <button type="button" className="gc-btn gc-btn--neutral" onClick={() => window.print()}><Icon name="printer" width="18" height="18" aria-hidden="true" /> Print</button>
      {def.id === 'ad-spend-roas' ? <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setDialog('adspend')}><Icon name="plus" width="18" height="18" aria-hidden="true" /> Add ad spend</button> : null}
      <button type="button" className="gc-btn gc-btn--solid" onClick={csv} disabled={!res}><Icon name="download" width="18" height="18" aria-hidden="true" /> Download CSV</button>
    </span>
  );

  return (
    <ReportsShell screen="ReportView" active={'rep-' + def.group} page={def.title} title={def.title} description={def.description} actions={actions} css={CSS}>
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
          <div style={{ marginLeft: 'auto', flexDirection: 'row', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => { setViewName(def.title + ' · ' + (def.snapshot ? 'now' : PRESET_LABEL[preset])); setDialog('save'); }}><Icon name="bookmark-plus" width="16" height="16" aria-hidden="true" /> Save view</button>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setDialog('schedule')}><Icon name="calendar-clock" width="16" height="16" aria-hidden="true" /> Schedule</button>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={copyLink}><Icon name="link" width="16" height="16" aria-hidden="true" /> Copy link</button>
          </div>
          <p className="rv-range" aria-live="polite">
            <Link href={'/reports-centre?group=' + def.group}>{group.label}</Link> · <b>{def.snapshot ? 'As of ' + fmt(now, 'datetime') : rangeText(period.from, period.to)}</b>{cmp ? ` · compared with ${rangeText(cmp.from, cmp.to)}` : ''}
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
          <ReportTable key={def.id} table={res.table} onOpen={(href) => navigate(href)} />
          {res.notes && res.notes.length ? <ul className="rv-notes" style={{ paddingTop: 'var(--space-3)' }}>{res.notes.map((n) => <li key={n}>{n}</li>)}</ul> : null}
        </section>
      ) : null}

      {!result && tick ? <section className="gc-card"><EmptyState icon="loader" title="Working out the report…" body="" /></section> : null}

      <Dialog open={dialog === 'save'} title="Save this view" onClose={() => setDialog(null)} width={460}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setDialog(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={() => { if (!viewName.trim()) return; saveView({ name: viewName.trim(), reportId: def.id, query: window.location.search }); setDialog(null); toast('View saved · find it on the Reports page'); }}>Save view</button></>}>
        <div><label className="gc-label" htmlFor="rv-view">Name</label><input id="rv-view" className="gc-input" value={viewName} onChange={(e) => setViewName(e.target.value)} data-autofocus /></div>
        <p className="gc-help" style={{ margin: '8px 0 0' }}>Keeps the period, comparison and filters you chose.</p>
      </Dialog>
      {dialog === 'adspend' ? <AdSpendDialog onClose={() => setDialog(null)} /> : null}
      {dialog === 'schedule' ? <ScheduleDialog report={def} query={typeof window === 'undefined' ? '' : window.location.search} onClose={() => setDialog(null)} /> : null}
    </ReportsShell>
  );
}
