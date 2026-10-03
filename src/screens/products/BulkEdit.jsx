'use client';
// BulkEdit — the spreadsheet bulk editor (Nayeem's Product brief #1 › "Bulk Editor requirements"). Opened from All
// products (the selected products: /bulk-edit?ids=…, or every product in the list).
//   1. Pick the products (search, status and category narrow the rows; untick a row to leave it out) and the columns.
//   2. Type in the cells. A cell takes a value or a formula: +10%, -5%, +100, -৳100, x1.1, =cost*1.3, =price-50;
//      tags take +tag / -tag. "Fill column" puts one formula in every row; pasting from Excel or Sheets fills the cells
//      from the one you paste into. Enter and the arrow keys move between rows.
//   3. Preview: every change with its before and after, and the rows that can't be used. Save runs it as a job.
//   4. Jobs: each saved run, who and when, every change (the audit trail), and Roll back (a field changed since the job
//      is left as it is).
// Stock quantities are not edited here: stock changes go through Stock adjustments, so the ledger keeps who and why.
// Logic: lib/bulkEdit.js (formulas, preview, jobs, rollback); products are saved through lib/products.js.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { Dialog as __Dialog, StatusBadge as __StatusBadge, EmptyState as __EmptyState, InfoTip as __InfoTip } from '@/components/ui';
import { RecordHeader, SearchField, LearnMore } from '@/components/ui/IndexKit';
import { toast as __toast, confirmDialog as __confirm } from '@/runtime/ui';
import { allProducts } from '@/lib/products';
import { COLUMNS, DEFAULT_COLS, colBy, cellText, previewChanges, runJob, getJobs, rollbackJob, applyFormula, STATUSES, BULK_EVENT } from '@/lib/bulkEdit';
import { getStockSetup } from '@/lib/stockSetup';
import { formatBDT, formatDateTime } from '@/lib/format';
import { currentUser } from '@/lib/team';

const COLS_KEY = 'gc.products.bulkCols';
const show = (field, v) => {
  const c = colBy(field);
  if (v == null || v === '') return '—';
  if (c && c.type === 'money') return formatBDT(v);
  if (c && c.type === 'status') return STATUSES[v] || v;
  if (Array.isArray(v)) return v.join(', ') || '—';
  return String(v);
};

const CSS = `
.be-cols{display:flex;flex-wrap:wrap;gap:6px}
.be-fill{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:8px;border-bottom:1px solid var(--border-subtle)}
.be-fill .gc-input{height:32px;width:auto;min-width:0}
.be-grid td{padding-top:4px;padding-bottom:4px}
.be-cell{width:100%;min-width:110px;height:30px;padding:0 8px;border:1px solid transparent;border-radius:var(--radius-md);background:transparent;font:inherit;font-size:var(--text-sm);color:var(--text-heading)}
.be-cell:hover{border-color:var(--border-subtle)}
.be-cell:focus{border-color:var(--primary);outline:none;background:var(--surface-card)}
.be-cell.is-edit{border-color:var(--primary);background:var(--fill-primary-soft)}
.be-cell.is-bad{border-color:var(--text-danger);background:var(--fill-error-soft)}
.be-cell--num{text-align:right;font-variant-numeric:tabular-nums}
.be-name{display:block;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:var(--weight-medium)}
.be-after{font-size:var(--text-xs);color:var(--primary)}
.be-err{font-size:var(--text-xs);color:var(--text-danger)}
.be-off td{opacity:.45}
.be-diff{display:flex;flex-direction:column;margin:0;padding:0;list-style:none;max-height:420px;overflow:auto}
.be-diff li{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr) auto;gap:var(--space-3);padding:var(--space-2) 0;border-bottom:1px solid var(--border-subtle);font-size:var(--text-sm)}
.be-diff small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.be-diff s{color:var(--text-muted)}
.be-jobs li{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.be-jobs li:first-child{border-top:0}
.be-jobs li>span{flex:1 1 220px;min-width:0}
.be-jobs small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.be-help{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:640px){.be-diff li{grid-template-columns:minmax(0,1fr)}}
`;

export default function BulkEdit() {
  const [ready, setReady] = useState(false);
  const [products, setProducts] = useState([]);
  const [ids, setIds] = useState(null);            // from ?ids=, or null for every product
  const [cols, setCols] = useState(DEFAULT_COLS);
  const [edits, setEdits] = useState({});          // { id: { field: text } }
  const [off, setOff] = useState({});              // rows left out
  const [q, setQ] = useState('');
  const [fSt, setFSt] = useState('');
  const [fCat, setFCat] = useState('');
  const [fill, setFill] = useState({ col: 'price', text: '' });
  const [preview, setPreview] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [view, setView] = useState(null);          // a job's changes
  const [wsOn, setWsOn] = useState(true);
  const grid = useRef(null);

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const list = (qs.get('ids') || '').split(',').map((x) => x.trim()).filter(Boolean);
    setIds(list.length ? list : null);
    setProducts(allProducts());
    setJobs(getJobs());
    setWsOn(getStockSetup().wholesale);
    try { const c = JSON.parse(window.localStorage.getItem(COLS_KEY)); if (Array.isArray(c) && c.length) setCols(c.filter((k) => colBy(k))); } catch { /* ignore */ }
    setReady(true);
    const re = () => { setJobs(getJobs()); setProducts(allProducts()); };
    window.addEventListener(BULK_EVENT, re);
    return () => window.removeEventListener(BULK_EVENT, re);
  }, []);

  const colList = COLUMNS.filter((c) => !c.always && (wsOn || !c.ws));
  const shownCols = cols.filter((k) => colList.some((c) => c.k === k));
  const toggleCol = (k) => { const next = shownCols.includes(k) ? shownCols.filter((x) => x !== k) : COLUMNS.map((c) => c.k).filter((x) => x === k || shownCols.includes(x)); setCols(next); try { window.localStorage.setItem(COLS_KEY, JSON.stringify(next)); } catch { /* ignore */ } };
  const cats = useMemo(() => Array.from(new Set(products.map((p) => String(p.cat || '').split(' › ')[0]).filter(Boolean))).sort(), [products]);
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return products.filter((p) => p.st !== 'deleted' && (!ids || ids.includes(p.id)))
      .filter((p) => !t || (p.name + ' ' + p.sku + ' ' + p.barcode).toLowerCase().includes(t))
      .filter((p) => (!fSt || p.st === fSt) && (!fCat || String(p.cat).split(' › ')[0] === fCat));
  }, [products, ids, q, fSt, fCat]);
  const used = rows.filter((p) => !off[p.id]);
  const nEdits = used.reduce((a, p) => a + Object.keys(edits[p.id] || {}).length, 0);

  const setCell = (id, k, text) => setEdits((e) => { const row = { ...(e[id] || {}) }; if (text === null) delete row[k]; else row[k] = text; return { ...e, [id]: row }; });
  const cellVal = (p, k) => ((edits[p.id] || {})[k] != null ? edits[p.id][k] : cellText(p, k));
  const isEdited = (p, k) => (edits[p.id] || {})[k] != null && edits[p.id][k] !== cellText(p, k);
  const cellCheck = (p, k) => (isEdited(p, k) ? applyFormula(edits[p.id][k], p[k], p, k) : null);

  // keyboard: Enter / arrows move down and up the column; paste fills the grid from this cell
  const move = (ri, ci, dr) => { const el = grid.current && grid.current.querySelector(`[data-cell="${ri + dr}:${ci}"]`); if (el) { el.focus(); el.select(); } };
  const onKey = (e, ri, ci) => { if (e.key === 'Enter' || e.key === 'ArrowDown') { e.preventDefault(); move(ri, ci, 1); } else if (e.key === 'ArrowUp') { e.preventDefault(); move(ri, ci, -1); } else if (e.key === 'Escape') { setCell(used[ri].id, shownCols[ci], null); } };
  const onPaste = (e, ri, ci) => {
    const text = e.clipboardData && e.clipboardData.getData('text');
    if (!text || !/[\t\n]/.test(text)) return;
    e.preventDefault();
    const lines = text.replace(/\r/g, '').split('\n').filter((l, i, a) => l !== '' || i < a.length - 1);
    setEdits((ed) => {
      const out = { ...ed };
      lines.forEach((line, dr) => { const p = used[ri + dr]; if (!p) return; line.split('\t').forEach((v, dc) => { const k = shownCols[ci + dc]; if (k) out[p.id] = { ...(out[p.id] || {}), [k]: v.trim() }; }); });
      return out;
    });
    __toast('Pasted ' + lines.length + (lines.length === 1 ? ' row' : ' rows'));
  };
  const fillColumn = () => {
    if (!fill.text.trim()) { __toast('Type a value or a formula to fill with, for example +10%', { tone: 'info' }); return; }
    setEdits((ed) => { const out = { ...ed }; used.forEach((p) => { out[p.id] = { ...(out[p.id] || {}), [fill.col]: fill.text.trim() }; }); return out; });
    __toast(colBy(fill.col).label + ' filled in ' + used.length + ' rows');
  };

  const openPreview = () => {
    const changes = previewChanges(used, edits);
    if (!changes.length) { __toast('Nothing changes yet. Type in a cell, or fill a column.', { tone: 'info' }); return; }
    setPreview(changes);
  };
  const save = () => {
    const job = runJob(preview, { by: currentUser().name });
    if (!job) { __toast('Fix the rows in red first. Nothing was saved.', { tone: 'error' }); return; }
    setPreview(null); setEdits({}); setProducts(allProducts()); setJobs(getJobs());
    __toast(job.id + ' saved · ' + job.changes.length + ' changes to ' + job.products + ' products' + (job.skipped ? ' · ' + job.skipped + ' skipped' : ''));
  };
  const undo = (j) => {
    __confirm({ title: 'Roll back ' + j.id + '?', body: 'The ' + j.changes.length + ' changes go back to the values before the job. A field someone changed since is left as it is.', confirmLabel: 'Roll back', tone: 'danger' }).then((ok) => {
      if (!ok) return;
      const r = rollbackJob(j.id, currentUser().name);
      setProducts(allProducts()); setJobs(getJobs());
      __toast(j.id + ' rolled back · ' + r.back + ' values put back' + (r.kept ? ' · ' + r.kept + ' kept (changed since)' : ''));
    });
  };
  const discard = () => { if (!nEdits) return; __confirm({ title: 'Clear every change?', body: 'The cells go back to the saved values.', confirmLabel: 'Clear changes', tone: 'danger' }).then((ok) => { if (ok) setEdits({}); }); };

  const errs = preview ? preview.filter((c) => c.error) : [];
  const oks = preview ? preview.filter((c) => !c.error) : [];
  return (
    <div className="dc-screen ds" data-screen="BulkEdit">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <__Sidebar sticky="" active="products-all" />
        <main className="gc-shell__main">
          <__Topbar crumb="Products / All products" page="Bulk edit" placeholder="Search products, SKU or barcode" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <RecordHeader back="/all-products" title="Bulk edit"
                meta={used.length + (used.length === 1 ? ' product · ' : ' products · ') + (shownCols.length + 1) + ' columns' + (nEdits ? ' · ' + nEdits + ' cells changed' : '')}
                about="Change many products at once, like a spreadsheet. Type a value or a formula such as +10% or =cost*1.3, preview every change, then save it as a job you can roll back. Stock is changed in Stock adjustments, not here."
                secondary={[{ label: 'Clear changes', onClick: discard, disabled: !nEdits }]}
                primary={{ label: 'Preview changes', onClick: openPreview }} />

              <section className="ix-card" aria-labelledby="be-cols-h">
                <div className="ix-card__head"><h2 id="be-cols-h">Columns</h2><__InfoTip text="Title is always shown. Pick the fields you want to change." /></div>
                <div className="ix-card__body">
                  <div className="be-cols" role="group" aria-labelledby="be-cols-h">
                    {colList.map((c) => <button key={c.k} type="button" className="ix-chip" aria-pressed={shownCols.includes(c.k)} onClick={() => toggleCol(c.k)}>{shownCols.includes(c.k) ? <__Icon name="check" width="14" height="14" aria-hidden="true" /> : null}{c.label}</button>)}
                  </div>
                </div>
              </section>

              <section className="ix-card ix-card--open" aria-label="Products to edit">
                <div className="ix-bar">
                  <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a product in the list" />
                </div>
                <div className="ix-filters" role="group" aria-label="Filters">
                  <select aria-label="Status" className={'ix-filter' + (fSt ? ' is-set' : '')} value={fSt} onChange={(e) => setFSt(e.target.value)}>
                    <option value="">Status</option>{Object.keys(STATUSES).map((k) => <option key={k} value={k}>{STATUSES[k]}</option>)}
                  </select>
                  <select aria-label="Category" className={'ix-filter' + (fCat ? ' is-set' : '')} value={fCat} onChange={(e) => setFCat(e.target.value)}>
                    <option value="">Category</option>{cats.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {ids ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setIds(null); window.history.replaceState(window.history.state, '', '/bulk-edit'); }}>Show every product</button> : null}
                </div>
                <div className="be-fill" role="group" aria-label="Fill a column">
                  <span className="be-help">Fill</span>
                  <select className="gc-input gc-select" aria-label="Column to fill" value={shownCols.includes(fill.col) ? fill.col : shownCols[0] || ''} onChange={(e) => setFill({ ...fill, col: e.target.value })}>
                    {shownCols.map((k) => <option key={k} value={k}>{colBy(k).label}</option>)}
                  </select>
                  <input className="gc-input" aria-label="Value or formula" placeholder="+10%, -৳100, =cost*1.3" value={fill.text} onChange={(e) => setFill({ ...fill, text: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); fillColumn(); } }} style={{ width: 200 }} />
                  <button type="button" className="ix-btn ix-btn--sm" onClick={() => { if (!shownCols.includes(fill.col)) setFill({ ...fill, col: shownCols[0] }); fillColumn(); }} disabled={!shownCols.length}>{'Fill ' + used.length + ' rows'}</button>
                  <__InfoTip text="Numbers: 1250, +10%, -5%, +100, -৳100, x1.1, =cost*1.3, =price-50. Tags: +new or -old. Paste rows from Excel or Sheets into any cell." />
                </div>
                {!ready ? null : !rows.length ? (
                  <div className="ix-empty"><__EmptyState icon="package-search" title="No products match" actionLabel="Clear filters" onAction={() => { setQ(''); setFSt(''); setFCat(''); }} /></div>
                ) : (
                  <div className="ix-table-wrap ix-table-wrap--show" ref={grid}>
                    <table className="ix-table ix-table--static gc-table--keep be-grid">
                      <caption className="sr-only">Products to edit, {rows.length} rows</caption>
                      <thead>
                        <tr>
                          <th scope="col" className="ix-check"><input type="checkbox" aria-label="Edit every row" checked={!rows.some((p) => off[p.id])} onChange={() => { const anyOff = rows.some((p) => off[p.id]); const o = {}; if (!anyOff) rows.forEach((p) => { o[p.id] = true; }); setOff(o); }} /></th>
                          <th scope="col">Product</th>
                          {shownCols.map((k) => <th key={k} scope="col" className={colBy(k).type === 'money' || colBy(k).type === 'int' ? 'ix-num' : ''}>{colBy(k).label}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((p) => {
                          const ri = used.indexOf(p);
                          return (
                            <tr key={p.id} className={off[p.id] ? 'be-off' : ''}>
                              <td className="ix-check"><input type="checkbox" checked={!off[p.id]} onChange={() => setOff((o) => ({ ...o, [p.id]: !o[p.id] }))} aria-label={'Edit ' + p.name} /></td>
                              <td><span className="be-name" title={p.name}>{isEdited(p, 'name') ? edits[p.id].name : p.name}</span><span className="ix-muted" style={{ fontSize: 'var(--text-xs)' }}>{p.sku || 'No SKU'}</span></td>
                              {shownCols.map((k, ci) => {
                                const chk = cellCheck(p, k), c = colBy(k), numCol = c.type === 'money' || c.type === 'int';
                                return (
                                  <td key={k}>
                                    {c.type === 'status' ? (
                                      <select className={'be-cell' + (chk ? ' is-edit' : '')} aria-label={c.label + ' for ' + p.name} disabled={!!off[p.id]} value={(edits[p.id] || {})[k] != null ? (Object.keys(STATUSES).find((x) => STATUSES[x] === edits[p.id][k] || x === edits[p.id][k]) || p.st) : p.st} onChange={(e) => setCell(p.id, k, e.target.value === p.st ? null : STATUSES[e.target.value])}>
                                        {Object.keys(STATUSES).map((x) => <option key={x} value={x}>{STATUSES[x]}</option>)}
                                      </select>
                                    ) : (
                                      <input className={'be-cell' + (numCol ? ' be-cell--num' : '') + (chk ? (chk.error ? ' is-bad' : ' is-edit') : '')} data-cell={ri >= 0 ? ri + ':' + ci : undefined} disabled={!!off[p.id]}
                                        aria-label={c.label + ' for ' + p.name} aria-invalid={chk && chk.error ? 'true' : undefined} title={chk ? (chk.error || show(k, p[k]) + ' → ' + show(k, chk.value)) : ''}
                                        value={cellVal(p, k)} onChange={(e) => setCell(p.id, k, e.target.value)} onKeyDown={(e) => ri >= 0 && onKey(e, ri, ci)} onPaste={(e) => ri >= 0 && onPaste(e, ri, ci)} onFocus={(e) => e.target.select()} />
                                    )}
                                    {chk && !chk.error && numCol && /[%=x×+-]/i.test(edits[p.id][k]) ? <span className="be-after">{'→ ' + show(k, chk.value)}</span> : null}
                                    {chk && chk.error ? <span className="be-err">{chk.error}</span> : null}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="ix-foot"><span>{used.length === rows.length ? rows.length + ' products' : used.length + ' of ' + rows.length + ' products'}</span></div>
              </section>

              <section className="ix-card" aria-labelledby="be-jobs-h">
                <div className="ix-card__head"><h2 id="be-jobs-h">Jobs</h2></div>
                {jobs.length ? (
                  <ul className="be-jobs" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {jobs.slice(0, 10).map((j) => (
                      <li key={j.id}>
                        <span><b>{j.id}</b> · {j.changes.length} changes to {j.products} products<small>{formatDateTime(j.at)} · {j.by}{j.rolledBackAt ? ' · rolled back ' + formatDateTime(j.rolledBackAt) + ' by ' + j.rolledBackBy : ''}</small></span>
                        <__StatusBadge tone={j.status === 'done' ? 'success' : 'neutral'}>{j.status === 'done' ? 'Saved' : 'Rolled back'}</__StatusBadge>
                        <button type="button" className="ix-btn ix-btn--sm" onClick={() => setView(j)}>View</button>
                        {j.status === 'done' ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => undo(j)}>Roll back</button> : null}
                      </li>
                    ))}
                  </ul>
                ) : <div className="ix-card__body"><p className="be-help">Saved changes show here, with who made them. You can roll a job back.</p></div>}
              </section>
              <LearnMore topic="bulk editing" />
            </div>
          </div>
        </main>
      </div>

      <__Dialog open={!!preview} title={'Preview: ' + oks.length + (oks.length === 1 ? ' change' : ' changes')} onClose={() => setPreview(null)} width={640} footer={<>
        <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setPreview(null)}>Keep editing</button>
        <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={save} disabled={!oks.length}>{'Save ' + oks.length + (oks.length === 1 ? ' change' : ' changes')}</button>
      </>}>
        {preview ? (<>
          {errs.length ? <p className="be-err" role="alert" style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-sm)' }}>{errs.length === 1 ? '1 cell can’t be used and will be skipped.' : errs.length + ' cells can’t be used and will be skipped.'}</p> : null}
          <ul className="be-diff">
            {errs.concat(oks).map((c, i) => (
              <li key={i}>
                <span>{c.name}<small>{c.label}</small></span>
                <span>{c.error ? <span className="be-err">{c.error}</span> : <><s>{show(c.field, c.before)}</s> → <b>{show(c.field, c.after)}</b></>}</span>
                <span>{c.error ? <__StatusBadge tone="error">Error</__StatusBadge> : <__StatusBadge tone="success">Ready</__StatusBadge>}</span>
              </li>
            ))}
          </ul>
        </>) : null}
      </__Dialog>

      <__Dialog open={!!view} title={view ? view.id : ''} onClose={() => setView(null)} width={640} footer={<button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => setView(null)}>Done</button>}>
        {view ? (<>
          <p className="be-help" style={{ marginBottom: 'var(--space-2)' }}>{formatDateTime(view.at)} · {view.by}{view.kept ? ' · ' + view.kept + ' values were kept at rollback (changed since)' : ''}</p>
          <ul className="be-diff">
            {view.changes.map((c, i) => <li key={i}><span>{c.name}<small>{c.label}</small></span><span><s>{show(c.field, c.before)}</s> → <b>{show(c.field, c.after)}</b></span><span /></li>)}
          </ul>
        </>) : null}
      </__Dialog>
    </div>
  );
}
