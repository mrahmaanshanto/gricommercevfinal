'use client';
// ReportTable — the table under every report: choose and order the columns (kept per report), sort by
// any column, search, totals row, 50 rows at a time on screen (every row when printed / saved as PDF),
// rows that open the record behind them (_href), and a card layout on phones.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { fmt } from '@/lib/reports/period';

export const TABLE_CSS = `
.rt-bar{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-5)}
.rt-bar .gc-input{max-width:280px}
.rt-count{font-size:var(--text-xs);color:var(--text-muted);margin-left:auto}
.rt-cols{position:relative}
.rt-panel{position:absolute;z-index:20;top:calc(100% + 6px);left:0;width:300px;max-width:calc(100vw - 32px);max-height:420px;overflow:auto;padding:var(--space-2);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:0 12px 32px rgba(15,23,42,.16)}
.rt-panel header{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);padding:var(--space-2) var(--space-2) var(--space-3);font-size:var(--text-xs);color:var(--text-muted)}
.rt-panel header b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.rt-col{display:flex;align-items:center;gap:var(--space-2);padding:4px var(--space-2);border-radius:var(--radius-lg)}
.rt-col:hover{background:var(--surface-subtle)}
.rt-col label{flex:1;display:flex;align-items:center;gap:var(--space-2);min-height:34px;font-size:var(--text-sm);color:var(--text-heading);cursor:pointer}
.rt-col input{width:16px;height:16px;accent-color:var(--primary)}
.rt-col button{width:30px;height:30px;display:grid;place-items:center;border:0;border-radius:var(--radius-full);background:none;color:var(--text-muted);cursor:pointer}
.rt-col button:hover:not(:disabled){background:var(--surface-card);color:var(--text-heading)}
.rt-col button:disabled{opacity:.3;cursor:default}
.rt-table th button{display:inline-flex;align-items:center;gap:4px;border:0;background:none;padding:0;font:inherit;color:inherit;text-transform:inherit;letter-spacing:inherit;cursor:pointer}
.rt-table th.is-right button{flex-direction:row-reverse}
.rt-table .is-right{text-align:right}
.rt-table td.is-right{font-family:var(--font-data);font-variant-numeric:tabular-nums;white-space:nowrap}
.rt-table tbody tr.is-link{cursor:pointer}
.rt-table tbody tr.is-link:hover td{background:var(--fill-primary-soft)}
.rt-table tbody tr.is-extra{display:none}
.rt-table td a{color:var(--text-link)}
.rt-table tfoot td{font-weight:var(--weight-semibold);color:var(--text-heading);border-top:2px solid var(--border-subtle);background:var(--surface-subtle)}
.rt-table td.is-neg{color:var(--text-danger)}
.rt-more{display:flex;justify-content:center;gap:var(--space-3);align-items:center;padding:var(--space-3);font-size:var(--text-xs);color:var(--text-muted)}
@media print{.rt-table tbody tr.is-extra{display:table-row}.rt-more,.rt-bar{display:none!important}}
@media (max-width:640px){
  .rt-table thead{display:none}
  .rt-table,.rt-table tbody,.rt-table tfoot,.rt-table tr,.rt-table td{display:block;width:100%}
  .rt-table tr{padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-subtle)}
  .rt-table td{display:flex;justify-content:space-between;gap:var(--space-3);padding:3px 0!important;border:0!important;white-space:normal!important;text-align:right}
  .rt-table td::before{content:attr(data-label);color:var(--text-muted);font-size:var(--text-xs);text-align:left;flex:none;max-width:45%}
  .rt-table td:first-child{font-weight:var(--weight-medium);color:var(--text-heading)}
  .rt-bar .gc-input{max-width:none;flex:1 1 100%}
  .rt-count{margin-left:0}
}
`;
const PAGE = 50;

export function totalsOf(table, rows, columns = table.columns) {
  const out = {};
  let any = false;
  columns.forEach((c, i) => {
    if (c.total === 'sum') { out[c.key] = rows.reduce((a, r) => a + (Number(r[c.key]) || 0), 0); any = true; }
    else if (c.total != null && c.total !== 'none') { out[c.key] = c.total; any = true; }
    else if (i === 0) out[c.key] = 'Total';
  });
  return any ? out : null;
}
/** The columns to show: the saved order/choice (keys) applied to the table's columns. */
export function visibleColumns(table, keys) {
  if (!keys || !keys.length) return table.columns;
  const byKey = Object.fromEntries(table.columns.map((c) => [c.key, c]));
  const picked = keys.map((k) => byKey[k]).filter(Boolean);
  return picked.length ? picked : table.columns;
}

/** Choose and order columns. keys = the shown keys in order (null = all, as the report sets them). */
function ColumnPicker({ table, keys, onChange }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', close); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', esc); };
  }, [open]);
  const all = table.columns.map((c) => c.key);
  const order = keys && keys.length ? [...keys.filter((k) => all.includes(k)), ...all.filter((k) => !keys.includes(k))] : all;
  const shown = new Set(keys && keys.length ? keys.filter((k) => all.includes(k)) : all);
  const labelOf = Object.fromEntries(table.columns.map((c) => [c.key, c.label]));
  const commit = (nextOrder, nextShown) => {
    const visible = nextOrder.filter((k) => nextShown.has(k));
    if (!visible.length) return;
    const same = visible.length === all.length && visible.every((k, i) => k === all[i]);
    onChange(same ? null : visible);
  };
  const toggle = (k) => { const s = new Set(shown); if (s.has(k)) s.delete(k); else s.add(k); commit(order, s); };
  const move = (k, d) => { const o = order.slice(); const i = o.indexOf(k); const j = i + d; if (j < 0 || j >= o.length) return; [o[i], o[j]] = [o[j], o[i]]; commit(o, shown); };
  const hidden = all.length - shown.size;
  return (
    <div className="rt-cols" ref={box}>
      <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen(!open)}>
        <Icon name="columns-3" width="16" height="16" aria-hidden="true" /> Columns{hidden ? ` · ${shown.size} of ${all.length}` : ''}
      </button>
      {open ? (
        <div className="rt-panel" role="dialog" aria-label="Choose columns">
          <header><b>Columns</b><button type="button" className="gc-btn gc-btn--xs gc-btn--flat" onClick={() => onChange(null)} disabled={!keys}>Reset</button></header>
          {order.map((k, i) => (
            <div key={k} className="rt-col">
              <label><input type="checkbox" checked={shown.has(k)} disabled={shown.has(k) && shown.size === 1} onChange={() => toggle(k)} />{labelOf[k]}</label>
              <button type="button" onClick={() => move(k, -1)} disabled={i === 0} aria-label={`Move ${labelOf[k]} up`}><Icon name="chevron-up" width="16" height="16" aria-hidden="true" /></button>
              <button type="button" onClick={() => move(k, 1)} disabled={i === order.length - 1} aria-label={`Move ${labelOf[k]} down`}><Icon name="chevron-down" width="16" height="16" aria-hidden="true" /></button>
            </div>
          ))}
          <p className="gc-help" style={{ margin: 'var(--space-2) var(--space-2) var(--space-1)' }}>Your choice is kept for this report on this device and used in the PDF and CSV.</p>
        </div>
      ) : null}
    </div>
  );
}

export function ReportTable({ table, onOpen, colKeys = null, onColumns }) {
  const [sort, setSort] = useState(table.sort || null);
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const columns = visibleColumns(table, colKeys);
  const rows = useMemo(() => {
    const words = q.trim().toLowerCase();
    let list = words ? table.rows.filter((r) => table.columns.some((c) => String(r[c.key] ?? '').toLowerCase().includes(words))) : table.rows.slice();
    if (sort) {
      const dir = sort.dir === 'asc' ? 1 : -1;
      list.sort((a, b) => { const x = a[sort.key], y = b[sort.key]; return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x ?? '').localeCompare(String(y ?? ''))) * dir; });
    }
    return list;
  }, [table, sort, q]);
  const totals = table.totals || totalsOf(table, rows, columns);
  const toggle = (key) => setSort((s) => (s && s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }));
  const right = (c) => c.align === 'right' || ['money', 'money0', 'int', 'num', 'pct', 'days'].includes(c.format);
  const cellOf = (c, r) => {
    const text = fmt(r[c.key], c.format);
    if (c.link && r[c.link]) return <Link href={r[c.link]} onClick={(e) => e.stopPropagation()}>{text}</Link>;
    return text;
  };

  return (
    <div>
      <div className="rt-bar">
        {onColumns ? <ColumnPicker table={table} keys={colKeys} onChange={onColumns} /> : null}
        {table.rows.length > 8 ? <input type="search" className="gc-input" placeholder="Search this table" aria-label="Search this table" value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} /> : null}
        <span className="rt-count">{rows.length === table.rows.length ? `${rows.length} rows` : `${rows.length} of ${table.rows.length} rows`}</span>
      </div>
      <div className="gc-table-wrap">
        <table className="gc-table gc-table--compact rt-table">
          <thead>
            <tr>{columns.map((c) => (
              <th key={c.key} scope="col" className={right(c) ? 'is-right' : ''} aria-sort={sort && sort.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <button type="button" onClick={() => toggle(c.key)}>{c.label}{sort && sort.key === c.key ? <Icon name={sort.dir === 'asc' ? 'arrow-up' : 'arrow-down'} width="12" height="12" aria-hidden="true" /> : null}</button>
              </th>
            ))}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r._key || i} className={(r._href ? 'is-link' : '') + (i >= limit ? ' is-extra' : '')} onClick={r._href ? () => onOpen(r._href) : undefined}>
                {columns.map((c) => <td key={c.key} data-label={c.label} className={(right(c) ? 'is-right' : '') + (typeof r[c.key] === 'number' && r[c.key] < 0 && ['money', 'money0'].includes(c.format) ? ' is-neg' : '')}>{cellOf(c, r)}</td>)}
              </tr>
            ))}
            {!rows.length ? <tr><td colSpan={columns.length} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-6)' }}>{q ? 'Nothing matches the search.' : 'No records in this period.'}</td></tr> : null}
          </tbody>
          {totals && rows.length ? (
            <tfoot><tr>{columns.map((c, i) => <td key={c.key} data-label={c.label} className={right(c) ? 'is-right' : ''}>{totals[c.key] == null ? (i === 0 ? 'Total' : '') : typeof totals[c.key] === 'number' ? fmt(totals[c.key], c.format) : totals[c.key]}</td>)}</tr></tfoot>
          ) : null}
        </table>
      </div>
      {rows.length > limit ? <div className="rt-more"><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setLimit(limit + PAGE)}>Show {Math.min(PAGE, rows.length - limit)} more</button><span>{limit} of {rows.length} shown</span></div> : null}
    </div>
  );
}
