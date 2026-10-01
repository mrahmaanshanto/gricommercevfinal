'use client';
// ReportTable — the table under every report: sort by any column, search, totals row, pages of 50,
// rows that open the record behind them (_href), and a card layout on phones.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { fmt } from '@/lib/reports/period';

export const TABLE_CSS = `
.rt-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-3) var(--space-5)}
.rt-bar .gc-input{max-width:280px}
.rt-count{font-size:var(--text-xs);color:var(--text-muted)}
.rt-table th button{display:inline-flex;align-items:center;gap:4px;border:0;background:none;padding:0;font:inherit;color:inherit;text-transform:inherit;letter-spacing:inherit;cursor:pointer}
.rt-table th.is-right button{flex-direction:row-reverse}
.rt-table .is-right{text-align:right}
.rt-table td.is-right{font-family:var(--font-data);font-variant-numeric:tabular-nums;white-space:nowrap}
.rt-table tbody tr.is-link{cursor:pointer}
.rt-table tbody tr.is-link:hover td{background:var(--fill-primary-soft)}
.rt-table td a{color:var(--text-link)}
.rt-table tfoot td{font-weight:var(--weight-semibold);color:var(--text-heading);border-top:2px solid var(--border-subtle);background:var(--surface-subtle)}
.rt-table td.is-neg{color:var(--text-danger)}
.rt-more{display:flex;justify-content:center;gap:var(--space-3);align-items:center;padding:var(--space-3);font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:640px){
  .rt-table thead{display:none}
  .rt-table,.rt-table tbody,.rt-table tfoot,.rt-table tr,.rt-table td{display:block;width:100%}
  .rt-table tr{padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-subtle)}
  .rt-table td{display:flex;justify-content:space-between;gap:var(--space-3);padding:3px 0!important;border:0!important;white-space:normal!important;text-align:right}
  .rt-table td::before{content:attr(data-label);color:var(--text-muted);font-size:var(--text-xs);text-align:left;flex:none;max-width:45%}
  .rt-table td:first-child{font-weight:var(--weight-medium);color:var(--text-heading)}
  .rt-bar .gc-input{max-width:none}
}
`;
const PAGE = 50;

export function totalsOf(table, rows) {
  const out = {};
  let any = false;
  table.columns.forEach((c, i) => {
    if (c.total === 'sum') { out[c.key] = rows.reduce((a, r) => a + (Number(r[c.key]) || 0), 0); any = true; }
    else if (c.total != null && c.total !== 'none') { out[c.key] = c.total; any = true; }
    else if (i === 0) out[c.key] = 'Total';
  });
  return any ? out : null;
}

export function ReportTable({ table, onOpen }) {
  const [sort, setSort] = useState(table.sort || null);
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const rows = useMemo(() => {
    const words = q.trim().toLowerCase();
    let list = words ? table.rows.filter((r) => table.columns.some((c) => String(r[c.key] ?? '').toLowerCase().includes(words))) : table.rows.slice();
    if (sort) {
      const dir = sort.dir === 'asc' ? 1 : -1;
      list.sort((a, b) => { const x = a[sort.key], y = b[sort.key]; return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x ?? '').localeCompare(String(y ?? ''))) * dir; });
    }
    return list;
  }, [table, sort, q]);
  const totals = table.totals || totalsOf(table, rows);
  const toggle = (key) => setSort((s) => (s && s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }));
  const right = (c) => c.align === 'right' || ['money', 'money0', 'int', 'num', 'pct', 'days'].includes(c.format);
  const cellOf = (c, r) => {
    const v = r[c.key];
    const text = fmt(v, c.format);
    if (c.link && r[c.link]) return <Link href={r[c.link]} onClick={(e) => e.stopPropagation()}>{text}</Link>;
    return text;
  };

  return (
    <div>
      {table.rows.length > 8 ? (
        <div className="rt-bar">
          <input type="search" className="gc-input" placeholder="Search this table" aria-label="Search this table" value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} />
          <span className="rt-count">{rows.length} of {table.rows.length} rows</span>
        </div>
      ) : null}
      <div className="gc-table-wrap">
        <table className="gc-table gc-table--compact rt-table">
          <thead>
            <tr>{table.columns.map((c) => (
              <th key={c.key} scope="col" className={right(c) ? 'is-right' : ''} aria-sort={sort && sort.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <button type="button" onClick={() => toggle(c.key)}>{c.label}{sort && sort.key === c.key ? <Icon name={sort.dir === 'asc' ? 'arrow-up' : 'arrow-down'} width="12" height="12" aria-hidden="true" /> : null}</button>
              </th>
            ))}</tr>
          </thead>
          <tbody>
            {rows.slice(0, limit).map((r, i) => (
              <tr key={r._key || i} className={r._href ? 'is-link' : ''} onClick={r._href ? () => onOpen(r._href) : undefined}>
                {table.columns.map((c) => <td key={c.key} data-label={c.label} className={(right(c) ? 'is-right' : '') + (typeof r[c.key] === 'number' && r[c.key] < 0 && ['money', 'money0'].includes(c.format) ? ' is-neg' : '')}>{cellOf(c, r)}</td>)}
              </tr>
            ))}
            {!rows.length ? <tr><td colSpan={table.columns.length} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-6)' }}>{q ? 'Nothing matches the search.' : 'No records in this period.'}</td></tr> : null}
          </tbody>
          {totals && rows.length ? (
            <tfoot><tr>{table.columns.map((c) => <td key={c.key} data-label={c.label} className={right(c) ? 'is-right' : ''}>{totals[c.key] == null ? '' : typeof totals[c.key] === 'number' ? fmt(totals[c.key], c.format) : totals[c.key]}</td>)}</tr></tfoot>
          ) : null}
        </table>
      </div>
      {rows.length > limit ? <div className="rt-more"><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setLimit(limit + PAGE)}>Show {Math.min(PAGE, rows.length - limit)} more</button><span>{limit} of {rows.length} shown</span></div> : null}
    </div>
  );
}
