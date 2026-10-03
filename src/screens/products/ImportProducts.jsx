'use client';
// ImportProducts — the CSV import dialog on All products (Nayeem's Product brief #1 › "Import validation"):
//   1. Upload   pick a CSV (or download the template)
//   2. Match    which column is which field (guessed from the headers; change any)
//   3. Check    a dry run: every row is Ready, Warning or Error with the reason; nothing is saved yet
//   4. Import   the Ready and Warning rows are saved; a summary says how many were added, updated and skipped
// Logic: lib/productImport.js.

import React, { useRef, useState } from 'react';
import { Icon as __Icon } from '@/runtime/dc';
import { Dialog as __Dialog, StatusBadge as __StatusBadge } from '@/components/ui';
import { toast as __toast } from '@/runtime/ui';
import { parseCsv, autoMap, dryRun, importRows, templateCsv, IMPORT_FIELDS } from '@/lib/productImport';
import { currentUser } from '@/lib/team';

const TONE = { ready: ['Ready', 'success'], warning: ['Warning', 'warning'], error: ['Error', 'error'] };
const CSS = `
.im-body{display:grid;gap:var(--space-3);font-size:var(--text-sm)}
.im-drop{display:flex;flex-direction:column;align-items:center;gap:var(--space-2);padding:var(--space-6) var(--space-4);border:1px dashed var(--border-strong);border-radius:var(--radius-lg);text-align:center;color:var(--text-body)}
.im-drop b{font-weight:var(--weight-medium);color:var(--text-heading)}
.im-map{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:6px var(--space-3);align-items:center}
.im-map>span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.im-map small{display:block;font-size:var(--text-xs);color:var(--text-muted);overflow:hidden;text-overflow:ellipsis}
.im-map .gc-input{height:32px}
.im-sum{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.im-rows{margin:0;padding:0;list-style:none;max-height:320px;overflow:auto;border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.im-rows li{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-top:1px solid var(--border-subtle)}
.im-rows li:first-child{border-top:0}
.im-rows small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.im-rows .is-bad{color:var(--text-danger)}
.im-help{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
`;

function download(name, rows) {
  const cell = (c) => { const t = c == null ? '' : String(c); return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
  const blob = new Blob(['﻿' + rows.map((r) => r.map(cell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export default function ImportProducts({ open, onClose, onDone }) {
  const [step, setStep] = useState('upload');
  const [file, setFile] = useState('');
  const [rows, setRows] = useState([]);
  const [map, setMap] = useState({});
  const [update, setUpdate] = useState(true);
  const [checked, setChecked] = useState([]);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const input = useRef(null);
  const reset = () => { setStep('upload'); setFile(''); setRows([]); setMap({}); setChecked([]); setResult(null); setErr(''); };
  const close = () => { reset(); onClose(); };

  const read = (f) => {
    if (!f) return;
    if (!/\.(csv|txt)$/i.test(f.name)) { setErr('Choose a .csv file. In Excel: File › Save as › CSV.'); return; }
    const r = new FileReader();
    r.onload = () => {
      const all = parseCsv(String(r.result || ''));
      if (all.length < 2) { setErr('The file has no product rows under the header.'); return; }
      if (all.length > 5001) { setErr('Import up to 5,000 products at a time.'); return; }
      setFile(f.name); setRows(all); setMap(autoMap(all[0])); setErr(''); setStep('map');
    };
    r.onerror = () => setErr('The file could not be read. Try again.');
    r.readAsText(f);
  };
  const head = rows[0] || [];
  const mapped = Object.values(map).filter(Boolean);
  const check = () => {
    if (!mapped.includes('name')) { setErr('Match a column to Title. Every product needs one.'); return; }
    setErr(''); setChecked(dryRun(rows.slice(1), map, { updateExisting: update })); setStep('check');
  };
  const n = (st) => checked.filter((c) => c.status === st).length;
  const run = () => {
    const r = importRows(checked, { by: currentUser().name, file });
    setResult(r); setStep('done'); if (onDone) onDone(r);
    __toast('Imported ' + (r.added + r.updated) + ' products' + (r.skipped ? ' · ' + r.skipped + ' skipped' : ''));
  };
  const errorsCsv = () => download('import-errors.csv', [['Row', 'Title', 'Status', 'Reasons']].concat(checked.filter((c) => c.status !== 'ready').map((c) => [c.n, c.name, TONE[c.status][0], c.errors.concat(c.warnings).join('; ')])));

  const title = { upload: 'Import products', map: 'Match the columns', check: 'Check before importing', done: 'Import finished' }[step];
  const footer = step === 'upload' ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={close}>Cancel</button>
    : step === 'map' ? <><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={reset}>Back</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={check}>Check rows</button></>
    : step === 'check' ? <><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setStep('map')}>Back</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={run} disabled={!(n('ready') + n('warning'))}>{'Import ' + (n('ready') + n('warning')) + ' products'}</button></>
    : <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={close}>Done</button>;

  return (
    <__Dialog open={open} title={title} onClose={close} width={620} footer={footer}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="im-body">
        {step === 'upload' ? (<>
          <div className="im-drop" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); read(e.dataTransfer.files && e.dataTransfer.files[0]); }}>
            <__Icon name="file-up" width="18" height="18" aria-hidden="true" />
            <b>Drop a CSV file here</b>
            <span className="im-help">Up to 5,000 products. Rows with a SKU you already use update that product.</span>
            <input ref={input} type="file" accept=".csv,text/csv" hidden onChange={(e) => read(e.target.files && e.target.files[0])} />
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => input.current && input.current.click()}>Choose file</button>
          </div>
          <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => download('products-template.csv', templateCsv())} style={{ justifySelf: 'start' }}><__Icon name="download" width="16" height="16" aria-hidden="true" />Download template</button>
        </>) : null}

        {step === 'map' ? (<>
          <p className="im-help">{file} · {rows.length - 1} rows. Columns set to “Don’t import” are left out.</p>
          <div className="im-map">
            {head.map((h, i) => (
              <React.Fragment key={i}>
                <span>{h || 'Column ' + (i + 1)}<small>{(rows[1] || [])[i] || '—'}</small></span>
                <select className="gc-input gc-select" aria-label={'Field for ' + (h || 'column ' + (i + 1))} value={map[i] || ''} onChange={(e) => setMap({ ...map, [i]: e.target.value })}>
                  <option value="">Don’t import</option>
                  {IMPORT_FIELDS.map((f) => <option key={f.k} value={f.k} disabled={map[i] !== f.k && mapped.includes(f.k)}>{f.label}{f.need ? ' *' : ''}</option>)}
                </select>
              </React.Fragment>
            ))}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><input type="checkbox" className="gc-check" checked={update} onChange={(e) => setUpdate(e.target.checked)} />Update products that have the same SKU</label>
        </>) : null}

        {step === 'check' ? (<>
          <div className="im-sum">
            <__StatusBadge tone="success">{n('ready') + ' ready'}</__StatusBadge>
            <__StatusBadge tone="warning">{n('warning') + ' with warnings'}</__StatusBadge>
            <__StatusBadge tone="error">{n('error') + ' with errors'}</__StatusBadge>
            <span className="im-help">{checked.filter((c) => c.action === 'update' && c.status !== 'error').length} update existing products</span>
          </div>
          <ul className="im-rows">
            {checked.slice().sort((a, b) => ({ error: 0, warning: 1, ready: 2 }[a.status] - { error: 0, warning: 1, ready: 2 }[b.status])).slice(0, 200).map((c) => (
              <li key={c.n}>
                <span className="ix-muted">{'Row ' + c.n}</span>
                <span>{c.name}{c.action === 'update' ? <span className="ix-muted"> · update</span> : null}{c.errors.length || c.warnings.length ? <small className={c.errors.length ? 'is-bad' : ''}>{c.errors.concat(c.warnings).join(' · ')}</small> : null}</span>
                <__StatusBadge tone={TONE[c.status][1]}>{TONE[c.status][0]}</__StatusBadge>
              </li>
            ))}
          </ul>
          <p className="im-help">Rows with errors are skipped. Fix them in the file and import it again.{n('error') + n('warning') ? <> <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={errorsCsv}>Download problem rows</button></> : null}</p>
        </>) : null}

        {step === 'done' && result ? (
          <dl className="ix-sum">
            <dt>Added</dt><dd>{result.added}</dd>
            <dt>Updated</dt><dd>{result.updated}</dd>
            <dt>Skipped (errors)</dt><dd>{result.skipped}</dd>
            <dt className="is-total">From</dt><dd className="is-total">{file}</dd>
          </dl>
        ) : null}
        {err ? <p role="alert" style={{ margin: 0, color: 'var(--text-danger)', fontSize: 'var(--text-xs)' }}>{err}</p> : null}
      </div>
    </__Dialog>
  );
}
