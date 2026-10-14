'use client';
// ImportData — Settings › Import data (/import-data): bring data from another system. Customers (also from Customers ›
// Import, ?type=customers), opening stock per place, and past orders (read only). Each follows the product import's
// steps (ImportProducts.jsx): pick the file (CSV or Excel .xlsx; a sample to download) → match the columns → check every
// row (New / Duplicate / Invalid, nothing saved yet) → import in the background → the result, with the problem rows.
// WooCommerce and Shopify are listed as sources: they need the store connected in Connections, and pulling straight from
// them needs the server, so for now their own CSV export is uploaded here. Logic: lib/dataImport.js.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { StatusBadge, InfoTip } from '@/components/ui';
import { IndexTabs, SearchField } from '@/components/ui/IndexKit';
import SetFrame from '@/screens/settings-console/SetFrame';
import { currentUser } from '@/lib/team';
import { hasModule } from '@/lib/edition';
import { statusOf, CONNECTIONS_EVENT } from '@/lib/connections';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import {
  KINDS, FIELDS, MAX_ROWS, IMPORT_EVENT, readFile, autoMap, mappingProblem, check, startImport, tickJobs, getJobs, progressOf,
  importedOrders, templateCsv, sourceLabel,
} from '@/lib/dataImport';

const CSS = `
.idt-card .ix-card__body{display:flex;flex-direction:column;gap:var(--space-3)}
.idt-src{display:flex;flex-wrap:wrap;gap:6px}
.idt-src label{display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 12px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);font-size:var(--text-sm);cursor:pointer}
.idt-src label:has(input:checked){border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.idt-note{display:flex;gap:var(--space-2);align-items:flex-start;margin:0;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm);color:var(--text-body)}
.idt-note svg{flex:none;margin-top:2px;color:var(--text-muted)}
.idt-drop{display:flex;flex-direction:column;align-items:center;gap:var(--space-2);padding:var(--space-6) var(--space-4);border:1px dashed var(--border-strong);border-radius:var(--radius-lg);text-align:center;font-size:var(--text-sm);color:var(--text-body)}
.idt-drop b{font-weight:var(--weight-medium);color:var(--text-heading)}
.idt-drop.is-over{border-color:var(--primary);background:var(--fill-primary-soft)}
.idt-help{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.idt-err{margin:0;font-size:var(--text-xs);color:var(--text-danger)}
.idt-map{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:6px var(--space-3);align-items:center}
.idt-map>span{min-width:0;font-size:var(--text-sm);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.idt-map small{display:block;font-size:var(--text-xs);color:var(--text-muted);overflow:hidden;text-overflow:ellipsis}
.idt-opts{display:flex;flex-direction:column;gap:6px}
.idt-opts label{display:flex;align-items:center;gap:var(--space-2);min-height:32px;font-size:var(--text-sm)}
.idt-sum{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.idt-sum button{border:0;background:none;padding:0;cursor:pointer;border-radius:var(--radius-full)}
.idt-sum button[aria-pressed="true"]{outline:2px solid var(--primary);outline-offset:1px}
.idt-rows{margin:0;padding:0;list-style:none;max-height:340px;overflow:auto;border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.idt-rows li{display:grid;grid-template-columns:56px minmax(0,1fr) auto;gap:var(--space-2);align-items:start;padding:var(--space-2) var(--space-3);border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.idt-rows li:first-child{border-top:0}
.idt-rows small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.idt-rows .is-bad{color:var(--text-danger)}
.idt-foot{display:flex;flex-wrap:wrap;gap:var(--space-2);justify-content:flex-end}
.idt-bar{height:8px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.idt-bar i{display:block;height:100%;border-radius:var(--radius-full);background:var(--primary);transition:width .4s linear}
.idt-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums;white-space:nowrap}
.idt-res{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3)}
.idt-res div{padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.idt-res b{display:block;font-family:var(--font-data);font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
.idt-res span{font-size:var(--text-xs);color:var(--text-muted)}
.idt-empty{margin:0;padding:var(--space-3) var(--space-4) var(--space-4);font-size:var(--text-sm);color:var(--text-muted)}
@media (max-width:640px){.idt-map{grid-template-columns:1fr}.idt-map>span{white-space:normal}.idt-res{grid-template-columns:1fr 1fr 1fr;gap:var(--space-2)}}
`;

const TONE = { new: ['New', 'success'], duplicate: ['Duplicate', 'warning'], invalid: ['Invalid', 'error'] };
const STOCK_TONE = { new: ['New', 'success'], duplicate: ['Has stock', 'warning'], invalid: ['Invalid', 'error'] };
const ORDER = { invalid: 0, duplicate: 1, new: 2 };
const APP_OF = { woo: 'woocommerce', shopify: 'shopify' };
const EXPORT_HOW = {
  woo: { customers: 'WooCommerce › Customers › Download (CSV)', stock: 'WooCommerce › Products › Export (CSV)', orders: 'WooCommerce › Orders › Export (CSV)' },
  shopify: { customers: 'Shopify › Customers › Export', stock: 'Shopify › Products › Inventory › Export', orders: 'Shopify › Orders › Export' },
};
const DONE_LINK = { customers: ['/all-customers', 'View customers'], stock: ['/stock', 'View stock'], orders: ['/import-data?type=orders', 'View past orders'] };

function download(name, rows) {
  const cell = (c) => { const t = c == null ? '' : String(c); return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
  const blob = new Blob(['﻿' + rows.map((r) => r.map(cell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
const KIND_IDS = ['customers', 'stock', 'orders'];

function Wizard({ kind, onStarted }) {
  const [source, setSource] = useState('file');
  const [step, setStep] = useState('upload');
  const [file, setFile] = useState('');
  const [rows, setRows] = useState([]);
  const [map, setMap] = useState({});
  const [dupes, setDupes] = useState('update');
  const [mode, setMode] = useState('set');
  const [checked, setChecked] = useState([]);
  const [show, setShow] = useState('');
  const [err, setErr] = useState('');
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [conn, setConn] = useState({});
  const input = useRef(null);
  useEffect(() => {
    const read = () => setConn({ woo: statusOf('woocommerce').state !== 'off', shopify: statusOf('shopify').state !== 'off' });
    read(); window.addEventListener(CONNECTIONS_EVENT, read);
    return () => window.removeEventListener(CONNECTIONS_EVENT, read);
  }, []);
  const reset = () => { setStep('upload'); setFile(''); setRows([]); setMap({}); setChecked([]); setErr(''); setShow(''); };
  useEffect(reset, [kind]);

  const channels = hasModule('channels');
  const blocked = source !== 'file' && !conn[source];
  const k = KINDS[kind];
  const read = async (f) => {
    if (!f || blocked) return;
    setBusy(true); setErr('');
    try {
      const all = await readFile(f);
      if (all.length < 2) throw new Error('The file has no rows under the header.');
      if (all.length - 1 > MAX_ROWS[kind]) throw new Error(`Import up to ${MAX_ROWS[kind].toLocaleString('en-IN')} rows at a time. Split the file.`);
      setFile(f.name); setRows(all); setMap(autoMap(kind, all[0])); setStep('map');
    } catch (e) { setErr(e && e.message ? e.message : 'The file could not be read. Try again.'); }
    setBusy(false);
  };
  // the sample file, without downloading it first (the same rows as Download sample CSV)
  const useSample = () => { const all = templateCsv(kind).map((r) => r.map(String)); setErr(''); setFile(kind + '-sample.csv'); setRows(all); setMap(autoMap(kind, all[0])); setStep('map'); };
  const head = rows[0] || [];
  const mapped = Object.values(map).filter(Boolean);
  const runCheck = () => {
    const p = mappingProblem(kind, map);
    if (p) { setErr(p); return; }
    setErr(''); setBusy(true);
    setTimeout(() => { setChecked(check(kind, rows.slice(1), map, { source, mode })); setBusy(false); setStep('check'); setShow(''); }, 30);
  };
  const n = (st) => checked.filter((c) => c.status === st).length;
  const takes = kind === 'customers' ? n('new') + (dupes === 'update' ? n('duplicate') : 0) : kind === 'stock' ? n('new') + n('duplicate') : n('new');
  const run = () => {
    const job = startImport(kind, checked, { file, source, by: currentUser().name, dupes, mode });
    if (!job) { toast('The import couldn’t start: browser storage is full.', { tone: 'error' }); return; }
    reset(); onStarted(job);
  };
  const problems = () => download(kind + '-import-problems.csv', [['Row', 'What', 'Check', 'Reasons']].concat(checked.filter((c) => c.status !== 'new' || c.warnings.length).map((c) => [c.n, c.name, (kind === 'stock' ? STOCK_TONE : TONE)[c.status][0], c.errors.concat(c.warnings).concat(c.match ? ['Matches ' + c.match.name + ' (' + c.match.by + ')'] : []).join('; ')])));
  const tone = kind === 'stock' ? STOCK_TONE : TONE;
  const list = checked.filter((c) => !show || c.status === show).slice().sort((a, b) => ORDER[a.status] - ORDER[b.status] || a.n - b.n).slice(0, 300);

  return (
    <section className="ix-card idt-card" aria-labelledby="idt-w-h">
      <header className="ix-card__head"><h2 id="idt-w-h">{step === 'upload' ? 'Import ' + k.many : step === 'map' ? 'Match the columns' : 'Check before importing'}</h2>{file ? <span className="idt-help">{file}</span> : null}</header>
      <div className="ix-card__body">
        {step === 'upload' ? (<>
          {channels ? (
            <div className="idt-src" role="radiogroup" aria-label="Where from">
              {['file', 'woo', 'shopify'].map((s) => (
                <label key={s}><input type="radio" className="gc-check gc-check--radio" name={'idt-src-' + kind} checked={source === s} onChange={() => { setSource(s); setErr(''); }} />{sourceLabel(s)}</label>
              ))}
            </div>
          ) : null}
          {source !== 'file' ? (blocked ? (
            <p className="idt-note"><Icon name="plug" width="16" height="16" aria-hidden="true" /><span>Connect {sourceLabel(source)} in Connections first. <Link href={'/connect?app=' + APP_OF[source]}>Connect {sourceLabel(source)}</Link></span></p>
          ) : (
            <p className="idt-note"><Icon name="info" width="16" height="16" aria-hidden="true" /><span>{sourceLabel(source)} is connected. Bringing {k.many} straight from it isn’t ready yet, so export them ({EXPORT_HOW[source][kind]}) and upload that file here. Its columns are matched for you.</span></p>
          )) : null}
          {!blocked ? (
            <div className={'idt-drop' + (over ? ' is-over' : '')} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={(e) => { e.preventDefault(); setOver(false); read(e.dataTransfer.files && e.dataTransfer.files[0]); }}>
              <Icon name="file-up" width="18" height="18" aria-hidden="true" />
              <b>Drop a CSV or Excel file here</b>
              <span className="idt-help">{kind === 'customers' ? 'Up to 20,000 customers. Matched to your customers by mobile number.' : kind === 'stock' ? 'Up to 5,000 rows: SKU or barcode, place and quantity.' : 'One row per item. Rows with the same order number make one order.'}</span>
              <input ref={input} type="file" accept=".csv,.txt,.xlsx,text/csv" hidden onChange={(e) => { read(e.target.files && e.target.files[0]); e.target.value = ''; }} />
              <button type="button" className="ix-btn ix-btn--sm" disabled={busy} onClick={() => input.current && input.current.click()}>{busy ? 'Reading…' : 'Choose file'}</button>
            </div>
          ) : null}
          <span style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => download(kind + '-sample.csv', templateCsv(kind))}><Icon name="download" width="16" height="16" aria-hidden="true" />Download sample CSV</button>
            {!blocked ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={useSample}><Icon name="play" width="16" height="16" aria-hidden="true" />Try the sample file</button> : null}
          </span>
          {kind === 'orders' ? <p className="idt-help">Past orders are kept for reference: no messages go out, stock and money don’t change.</p> : null}
        </>) : null}

        {step === 'map' ? (<>
          <p className="idt-help">{(rows.length - 1).toLocaleString('en-IN')} rows. Columns set to “Don’t import” are left out.</p>
          <div className="idt-map">
            {head.map((h, i) => (
              <React.Fragment key={i}>
                <span>{h || 'Column ' + (i + 1)}<small>{(rows[1] || [])[i] || '—'}</small></span>
                <select className="gc-input gc-select" aria-label={'Field for ' + (h || 'column ' + (i + 1))} value={map[i] || ''} onChange={(e) => { setMap({ ...map, [i]: e.target.value }); setErr(''); }}>
                  <option value="">Don’t import</option>
                  {FIELDS[kind].map((f) => <option key={f.k} value={f.k} disabled={map[i] !== f.k && mapped.includes(f.k)}>{f.label}{f.need ? ' *' : ''}</option>)}
                </select>
              </React.Fragment>
            ))}
          </div>
          {kind === 'customers' ? (
            <div className="idt-opts" role="radiogroup" aria-label="Customers you already have">
              <span className="gc-label">Customers you already have <InfoTip text="Matched by mobile number (01…, 8801… and +880… are the same number), then email, then the ID in the old system." /></span>
              <label><input type="radio" className="gc-check gc-check--radio" name="idt-dupes" checked={dupes === 'update'} onChange={() => setDupes('update')} />Add what’s missing (email, tags, address, old ID)</label>
              <label><input type="radio" className="gc-check gc-check--radio" name="idt-dupes" checked={dupes === 'skip'} onChange={() => setDupes('skip')} />Skip them</label>
            </div>
          ) : null}
          {kind === 'stock' ? (
            <div className="idt-opts" role="radiogroup" aria-label="Quantity means">
              <span className="gc-label">The quantity is</span>
              <label><input type="radio" className="gc-check gc-check--radio" name="idt-mode" checked={mode === 'set'} onChange={() => setMode('set')} />What’s on hand now (we post the difference)</label>
              <label><input type="radio" className="gc-check gc-check--radio" name="idt-mode" checked={mode === 'add'} onChange={() => setMode('add')} />To add to what’s on hand</label>
            </div>
          ) : null}
          <div className="idt-foot">
            <button type="button" className="gc-btn gc-btn--neutral" onClick={reset}>Back</button>
            <button type="button" className="gc-btn gc-btn--solid" onClick={runCheck} disabled={busy}>{busy ? 'Checking…' : 'Check rows'}</button>
          </div>
        </>) : null}

        {step === 'check' ? (<>
          <div className="idt-sum" role="group" aria-label="Show">
            {['new', 'duplicate', 'invalid'].map((st) => (
              <button key={st} type="button" aria-pressed={show === st} onClick={() => setShow(show === st ? '' : st)}><StatusBadge tone={tone[st][1]}>{n(st).toLocaleString('en-IN') + ' ' + tone[st][0].toLowerCase()}</StatusBadge></button>
            ))}
            <span className="idt-help">{kind === 'orders' ? checked.length.toLocaleString('en-IN') + ' orders from ' + (rows.length - 1).toLocaleString('en-IN') + ' rows' : ''}</span>
          </div>
          <ul className="idt-rows">
            {list.map((c) => (
              <li key={c.n + c.name}>
                <span className="ix-muted">{'Row ' + c.n}</span>
                <span>{c.name}
                  {c.match ? <small>{kind === 'customers' ? 'Matches ' + c.match.name + ' (' + c.match.by + ')' + (dupes === 'skip' ? ' · skipped' : ' · missing details added') : kind === 'stock' && c.rec ? c.match.name + ' · ' + (mode === 'add' ? 'adds ' + c.rec.qty : 'becomes ' + c.rec.qty) : c.match.name + ' · skipped'}</small> : null}
                  {c.errors.length || c.warnings.length ? <small className={c.errors.length ? 'is-bad' : ''}>{c.errors.concat(c.warnings).join(' · ')}</small> : null}
                </span>
                <StatusBadge tone={tone[c.status][1]}>{tone[c.status][0]}</StatusBadge>
              </li>
            ))}
          </ul>
          <p className="idt-help">Invalid rows are skipped. Fix them in the file and import it again.{n('invalid') + n('duplicate') ? <> <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={problems}>Download problem rows</button></> : null}</p>
          <div className="idt-foot">
            <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setStep('map')}>Back</button>
            <button type="button" className="gc-btn gc-btn--solid" onClick={run} disabled={!takes}>{'Import ' + takes.toLocaleString('en-IN') + ' ' + (takes === 1 ? k.one : k.many)}</button>
          </div>
        </>) : null}
        {err ? <p className="idt-err" role="alert">{err}</p> : null}
      </div>
    </section>
  );
}

function JobCard({ job, now }) {
  const k = KINDS[job.kind];
  const p = progressOf(job, now);
  const r = job.result;
  const [link, label] = DONE_LINK[job.kind];
  return (
    <section className="ix-card idt-card" aria-live="polite" aria-labelledby={'idt-j-' + job.id}>
      <header className="ix-card__head"><h2 id={'idt-j-' + job.id}>{job.done ? k.label + ' import finished' : 'Importing ' + k.many + '…'}</h2><span className="idt-help">{job.file}</span></header>
      <div className="ix-card__body">
        {!job.done ? (<>
          <div className="idt-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(p * 100)} aria-label="Import progress"><i style={{ width: Math.round(p * 100) + '%' }} /></div>
          <p className="idt-help">Runs in the background. You can leave this page; the result waits here.</p>
        </>) : r ? (<>
          <div className="idt-res">
            <div><b>{r.added.toLocaleString('en-IN')}</b><span>Added</span></div>
            <div><b>{r.updated.toLocaleString('en-IN')}</b><span>{job.kind === 'stock' ? 'Changed' : 'Updated'}</span></div>
            <div><b>{r.skipped.toLocaleString('en-IN')}</b><span>Skipped</span></div>
          </div>
          {r.problems.length ? (
            <ul className="idt-rows">
              {r.problems.slice(0, 100).map((x, i) => <li key={i}><span className="ix-muted">{x.n ? 'Row ' + x.n : ''}</span><span>{x.name}<small>{x.why}</small></span><span /></li>)}
            </ul>
          ) : null}
          <div className="idt-foot">
            {r.problems.length ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => download(job.kind + '-skipped.csv', [['Row', 'What', 'Why']].concat(r.problems.map((x) => [x.n, x.name, x.why])))}>Download skipped rows</button> : null}
            <Link className="ix-btn ix-btn--sm ix-btn--primary" href={link}>{label}</Link>
          </div>
        </>) : null}
      </div>
    </section>
  );
}

function PastOrders({ tick }) {
  const [q, setQ] = useState('');
  const all = useMemo(() => importedOrders(), [tick]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!all.length) return null;
  const t = q.trim().toLowerCase();
  const list = all.filter((o) => !t || o.number.toLowerCase().includes(t) || String(o.name).toLowerCase().includes(t) || String(o.phone).includes(t.replace(/\D/g, '') || '§')).slice(0, 200);
  return (
    <section className="ix-card" aria-labelledby="idt-po-h">
      <header className="ix-card__head"><h2 id="idt-po-h">Imported past orders</h2><span className="idt-help">{all.length.toLocaleString('en-IN')} · read only</span></header>
      <div className="ix-card__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <SearchField value={q} onChange={setQ} placeholder="Search order number, name or mobile" />
        <div className="gc-table-wrap">
          <table className="ix-table">
            <thead><tr><th scope="col">Order</th><th scope="col">Date</th><th scope="col">Customer</th><th scope="col">Items</th><th scope="col">Status</th><th scope="col" style={{ textAlign: 'right' }}>Total</th></tr></thead>
            <tbody>{list.map((o) => (
              <tr key={o.source + o.number}>
                <td className="idt-fig">#{o.number}</td>
                <td className="idt-fig">{formatDate(o.at)}</td>
                <td>{o.customerId ? <Link href={'/customer-crm?id=' + encodeURIComponent(o.customerId)}>{o.name || o.customerId}</Link> : o.name || '—'}</td>
                <td>{o.lines.map((l) => (l.qty > 1 ? l.qty + ' × ' : '') + l.name).join(', ')}</td>
                <td>{o.status}</td>
                <td className="idt-fig" style={{ textAlign: 'right' }}>{formatBDT(o.total)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        {list.length === 0 ? <p className="idt-help">No order matches.</p> : null}
      </div>
    </section>
  );
}

export default function ImportData() {
  const [ready, setReady] = useState(false);
  const [kind, setKind] = useState('customers');
  const [tick, setTick] = useState(0);
  const [now, setNow] = useState(0);
  const [watch, setWatch] = useState('');
  useEffect(() => {
    setReady(true); setNow(Date.now());
    const q = new URLSearchParams(window.location.search).get('type');
    if (KIND_IDS.includes(q) || q === 'history') setKind(q);
    tickJobs();
    const re = () => setTick((x) => x + 1);
    window.addEventListener(IMPORT_EVENT, re);
    return () => window.removeEventListener(IMPORT_EVENT, re);
  }, []);
  const jobs = useMemo(() => (ready ? getJobs() : []), [ready, tick]);
  const running = jobs.some((j) => !j.done);
  useEffect(() => {
    if (!running) return undefined;
    const iv = setInterval(() => { setNow(Date.now()); const done = tickJobs(); done.forEach((j) => toast(KINDS[j.kind].label + ' import finished')); }, 400);
    return () => clearInterval(iv);
  }, [running]);
  const pick = (k) => { setKind(k); try { window.history.replaceState(window.history.state, '', '/import-data?type=' + k); } catch { /* ignore */ } };
  const shown = watch ? jobs.find((j) => j.id === watch) : null;
  const tabs = [
    ...KIND_IDS.filter((k) => k !== 'stock' || hasModule('catalog')).map((k) => ({ key: k, id: 'idt-t-' + k, label: KINDS[k].label, on: kind === k, onClick: () => { pick(k); setWatch(''); } })),
    { key: 'history', id: 'idt-t-h', label: 'History', count: jobs.length || undefined, on: kind === 'history', onClick: () => pick('history') },
  ];

  return (
    <SetFrame screen="ImportData" active="import" title="Import data" meta="Customers, opening stock and past orders from another system"
      about="Bring your data from another system or a spreadsheet: customers (matched to the ones you have by mobile number), opening stock per place, and past orders kept for reference. Every file is checked before anything is saved, and the import runs in the background. Products are imported from Products › All products › Import.">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {!ready ? null : (<>
        <IndexTabs label="What to import" tabs={tabs} />
        {kind !== 'history' ? (<>
          {shown && shown.kind === kind ? <JobCard job={shown} now={now} /> : null}
          <Wizard kind={kind} onStarted={(job) => { setWatch(job.id); setTick((x) => x + 1); toast('Import started'); }} />
          {kind === 'stock' ? <p className="idt-help">Products themselves are imported in <Link href="/all-products">Products › Import</Link>. Import them first, then their stock.</p> : null}
          {kind === 'orders' ? <PastOrders tick={tick} /> : null}
        </>) : (
          <section className="ix-card" aria-labelledby="idt-h-h">
            <header className="ix-card__head"><h2 id="idt-h-h">Imports</h2></header>
            {jobs.length ? (
              <div className="gc-table-wrap">
                <table className="ix-table">
                  <thead><tr><th scope="col">When</th><th scope="col">What</th><th scope="col">File</th><th scope="col">Result</th><th scope="col">By</th></tr></thead>
                  <tbody>{jobs.map((j) => (
                    <tr key={j.id}>
                      <td className="idt-fig">{formatDate(j.startedAt)} {formatTime(j.startedAt)}</td>
                      <td>{KINDS[j.kind].label}{j.source && j.source !== 'file' ? ' · ' + sourceLabel(j.source) : ''}</td>
                      <td>{j.file}</td>
                      <td>{j.done && j.result ? `${j.result.added} added · ${j.result.updated} ${j.kind === 'stock' ? 'changed' : 'updated'} · ${j.result.skipped} skipped` : <StatusBadge tone="info">{'Running · ' + Math.round(progressOf(j, now) * 100) + '%'}</StatusBadge>}</td>
                      <td>{j.by}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            ) : <p className="idt-empty">No imports yet.</p>}
          </section>
        )}
      </>)}
    </SetFrame>
  );
}
