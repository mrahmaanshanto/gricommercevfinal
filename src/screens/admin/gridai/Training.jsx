'use client';
// GridAI › Training (/admin/gridai) — what GridCommerce's own assistant knows when it answers leads and merchants in
// the Inbox, the website chat and WhatsApp. Copied from the merchant panel's Grid AI › Knowledge
// (screens/gridai/Knowledge.jsx) and adapted to GridCommerce's own knowledge.
//   Knowledge health   one line: sources failing, in-use sources not updated for 30 days, sources in use
//   Tabs (?tab=)       Knowledge base (every source) · Documents (upload: Indexing → Indexed) · Website sources (add,
//                      re-crawl) · FAQs (EN + BN) · Policies & procedures · Product & pricing (read-only, from the plan
//                      catalogue, "Use in answers" switches) · Past conversations (include / exclude for training)
// Data: lib/admin/gridai.js (store `gridai`); plans from lib/platform (db().plans). Worked out after the data loads.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { ShopHeader, IndexTabs, SearchField, KV } from '@/components/ui/IndexKit';
import { Sheet, EmptyState, StatusBadge, InfoTip } from '@/components/ui';
import {
  allSources, health, statusOf, isStale, sizeText, catalogue, pricing, limitText, channelLabel,
  addDocs, reindexDoc, removeDoc, addSite, recrawl, recrawlAll, removeSite, removeFaq, savePolicy, setUse, setSetUse, setPricingUse,
  setInclude, includeRated, STATUS_WORD, STATUS_TONE, FAQ_TOPICS, ACCEPT, MAX_MB, STALE_DAYS,
} from '@/lib/admin/gridai';
import { ago, taka } from '@/lib/platform/util';
import { AdminShell, usePlatform } from '../AdminShell';
import { GA_CSS, useGridAi, useTab, Switch, Field, Skeleton, FaqSheet } from './gridaiShared';

const CSS = `
.tr-health{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);padding:var(--space-3) var(--space-4);font-size:var(--text-sm);color:var(--text-body)}
.tr-health__t{display:inline-flex;align-items:center;gap:8px;font-weight:var(--weight-semibold);color:var(--text-heading)}
.tr-chip{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.tr-chip:hover{border-color:var(--border-strong)}
.tr-chip.is-bad{border-color:transparent;background:var(--fill-error-soft);color:var(--text-danger)}
.tr-chip.is-warn{border-color:transparent;background:var(--fill-warning-soft);color:var(--text-warning)}
.tr-chip.is-ok{border-color:transparent;background:var(--fill-success-soft);color:var(--text-success);cursor:default}
.tr-chip[aria-pressed="true"]{box-shadow:inset 0 0 0 1.5px currentColor}
.tr-quiet{font-size:var(--text-xs);color:var(--text-muted)}
.tr-drop{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:120px;margin:var(--space-4);padding:var(--space-4);border:1.5px dashed var(--border-strong);border-radius:var(--radius-xl);background:var(--surface-subtle);font-size:var(--text-sm);color:var(--text-body);text-align:center;cursor:pointer}
.tr-drop.is-over{border-color:var(--primary);background:var(--fill-primary-soft)}
.tr-drop small{font-size:var(--text-xs);color:var(--text-muted)}
.tr-drop:focus-within{outline:2px solid var(--primary);outline-offset:2px}
.tr-add{display:flex;flex:1 1 auto;gap:var(--space-2);min-width:0}
.tr-add .gc-input{flex:1;min-width:0;height:32px}
.tr-err{margin:0;padding:0 var(--space-4) var(--space-2);font-size:var(--text-xs);color:var(--text-danger)}
.tr-cols{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-4);align-items:start}
.tr-list{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.tr-list>li{display:flex;align-items:center;gap:var(--space-3);min-height:56px;padding:var(--space-2) var(--space-4);border-top:1px solid var(--border-subtle)}
.tr-list>li:first-child{border-top:0}
.tr-list>li>div{flex:1;min-width:0}
.tr-list p{margin:2px 0 0;overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.tr-mods{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.tr-mod{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 8px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-body)}
.tr-mod i{font-family:var(--font-data);font-style:normal;color:var(--text-muted)}
.tr-price{margin:0 var(--space-4) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden}
.tr-lhead{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-3) var(--space-4)}
.tr-lhead b{font-weight:var(--weight-semibold);color:var(--text-heading)}
.tr-lhead small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.tr-sec{border-top:1px solid var(--border-subtle)}
.tr-sec:first-child{border-top:0}
.tr-h2{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);margin:0;padding:var(--space-3) var(--space-4) 0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.tr-thumb{display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs)}
.tr-thumb.is-up{color:var(--text-success)}
.tr-thumb.is-down{color:var(--text-danger)}
.ix-table .tr-act{width:1%;white-space:nowrap;text-align:right}
@media (max-width:1023px){.tr-cols{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){.tr-add{flex-wrap:wrap}.tr-add .gc-input{height:44px;flex-basis:100%}.tr-drop{margin:var(--space-3)}}
`;

const TABS = [['base', 'Knowledge base'], ['documents', 'Documents'], ['websites', 'Website sources'], ['faqs', 'FAQs'], ['policies', 'Policies & procedures'], ['catalog', 'Product & pricing'], ['conversations', 'Past conversations']];
const KIND_ICON = { doc: 'file-text', site: 'globe', faq: 'message-circle-question', policy: 'scroll-text' };
const docIcon = (name) => (/\.csv$/i.test(name) ? 'file-spreadsheet' : 'file-text');
const Badge = ({ st }) => <StatusBadge tone={STATUS_TONE[st]}>{STATUS_WORD[st]}</StatusBadge>;
const Thumb = ({ r }) => (r === 'up' ? <span className="tr-thumb is-up"><Icon name="thumbs-up" width="14" height="14" aria-hidden="true" />Good</span>
  : r === 'down' ? <span className="tr-thumb is-down"><Icon name="thumbs-down" width="14" height="14" aria-hidden="true" />Bad</span> : <span className="ix-muted">—</span>);

export default function Training() {
  const { data: d, t, live } = useGridAi();
  const { db } = usePlatform();
  const [tab, setTab] = useTab('base', TABS.map((x) => x[0]));
  const [filter, setFilter] = useState('all');        // knowledge base: all · failing · stale · off
  const [q, setQ] = useState('');
  const [topic, setTopic] = useState('');
  const [conv, setConv] = useState('all');            // past conversations: all · in · out
  const [open, setOpen] = useState(null);             // { kind: 'doc' | 'site', id }
  const [faq, setFaq] = useState(null);
  const [policy, setPolicy] = useState(null);         // { id, title, body, err }
  const [url, setUrl] = useState('');
  const [urlErr, setUrlErr] = useState('');
  const [over, setOver] = useState(false);
  const fileRef = useRef(null);
  const urlRef = useRef(null);
  useEffect(() => { setQ(''); }, [tab]);

  const h = live ? health(d, t) : null;
  const rows = h ? h.rows : [];
  const staleKeys = useMemo(() => new Set(h ? h.stale.map((x) => x.key) : []), [h]);
  const needle = q.trim().toLowerCase();

  const pick = () => { if (fileRef.current) fileRef.current.click(); };
  const upload = (list) => {
    const res = addDocs(list);
    if (!res.ok) { toast(res.error, { tone: 'error' }); return; }
    setTab('documents');
    toast(res.added.length === 1 ? res.added[0].name + ' added. Indexing…' : res.added.length + ' files added. Indexing…');
  };
  const toggle = (kind, x, name) => { const res = setUse(kind, x.id, !x.use); if (res.ok) toast(name + (x.use ? ' turned off. GridAI no longer uses it.' : ' turned on.')); };
  const addUrl = (e) => {
    e.preventDefault();
    const res = addSite(url);
    if (!res.ok) { setUrlErr(res.error); return; }
    setUrl(''); setUrlErr(''); toast('Website added. Reading its pages…');
  };
  const crawlAll = () => { const res = recrawlAll(); setTab('websites'); toast('Re-crawling ' + res.n + ' website sources…'); };
  const openSource = (r) => {
    if (r.kind === 'faq') setFaq({ ...d.faqs.find((x) => x.id === r.id) });
    else if (r.kind === 'policy') { const p = d.policies.find((x) => x.id === r.id); setPolicy({ id: p.id, title: p.title, body: p.body, err: '' }); }
    else setOpen({ kind: r.kind, id: r.id });
  };
  const savePol = () => {
    const res = savePolicy(policy);
    if (!res.ok) { setPolicy({ ...policy, err: res.error }); return; }
    toast('Saved. GridAI uses it from the next message.'); setPolicy(null);
  };
  const delFaq = async (f) => {
    if (!(await confirmDialog({ title: 'Remove this FAQ?', body: f.q, confirmLabel: 'Remove', tone: 'danger' }))) return;
    removeFaq(f.id); toast('FAQ removed.');
  };

  // ---- the open document or website ----
  const src = open && live ? (open.kind === 'doc' ? d.docs.find((x) => x.id === open.id) : d.sites.find((x) => x.id === open.id)) : null;
  const srcSt = src ? statusOf(src, t) : null;
  const srcName = src ? (open.kind === 'doc' ? src.name : src.url.replace(/^https?:\/\//, '')) : '';
  const removeSrc = async () => {
    if (!(await confirmDialog({ title: 'Remove ' + srcName + '?', body: 'GridAI stops using it at once.', confirmLabel: 'Remove', tone: 'danger' }))) return;
    if (open.kind === 'doc') removeDoc(src.id); else removeSite(src.id);
    setOpen(null); toast(srcName + ' removed.');
  };
  const again = () => {
    if (open.kind === 'doc') { reindexDoc(src.id); toast('Indexing ' + srcName + ' again…'); } else { recrawl(src.id); toast('Re-crawling ' + srcName + '…'); }
  };

  // ---- tab bodies ----
  let body = null;
  if (live && tab === 'base') {
    const shown = rows.filter((r) => (filter === 'all' || (filter === 'failing' && r.status === 'failed') || (filter === 'stale' && staleKeys.has(r.key)) || (filter === 'off' && !r.use))
      && (!needle || r.name.toLowerCase().includes(needle) || r.type.toLowerCase().includes(needle)));
    const FILTERS = [['all', 'All', rows.length], ['failing', 'Failing', h.failing.length], ['stale', 'Stale', h.stale.length], ['off', 'Off', rows.filter((r) => !r.use).length]];
    body = (<>
      <div className="ix-bar">
        <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sources" />
        <span className="ix-tools">
          <select className="ix-pick" aria-label="Show" value={filter} onChange={(e) => setFilter(e.target.value)}>
            {FILTERS.map(([k, l, n]) => <option key={k} value={k}>{l + ' (' + n + ')'}</option>)}
          </select>
        </span>
      </div>
      {!shown.length ? <div className="ix-empty"><EmptyState icon="book-open" title="No sources here" actionLabel="Show all sources" onAction={() => { setFilter('all'); setQ(''); }} /></div> : (<>
        <ul className="ix-plist" aria-label="Sources">
          {shown.map((r) => (
            <li key={r.key}><button type="button" className="ix-pitem" onClick={() => openSource(r)}>
              <span className="ix-pitem__top"><b>{r.name}</b><Badge st={r.use ? r.status : 'off'} /></span>
              <span className="ix-pitem__mid">{r.type} · {ago(r.updated, t)}{staleKeys.has(r.key) ? ' · stale' : ''}</span>
            </button></li>
          ))}
        </ul>
        <div className="ix-table-wrap">
          <table className="ix-table">
            <caption className="sr-only">Knowledge sources</caption>
            <thead><tr><th scope="col">Source</th><th scope="col">Status</th><th scope="col">Updated</th><th scope="col">Use</th></tr></thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.key} className={r.use ? '' : 'ga-off'}>
                  <td><span className="ga-src"><span className="ga-ico" aria-hidden="true"><Icon name={KIND_ICON[r.kind]} width="16" height="16" /></span><span><button type="button" className="ga-name" onClick={() => openSource(r)}>{r.name}</button><small className="ga-sub">{r.type}</small></span></span></td>
                  <td><span className="ga-badges"><Badge st={r.status} />{staleKeys.has(r.key) ? <StatusBadge tone="warning">Stale</StatusBadge> : null}</span></td>
                  <td className="ix-muted">{ago(r.updated, t)}</td>
                  <td><Switch on={r.use} label={(r.use ? 'Stop using ' : 'Use ') + r.name} onToggle={() => toggle(r.kind, { id: r.id, use: r.use }, r.name)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>)}
      <div className="ix-foot"><span>{shown.length === 1 ? '1 source' : shown.length + ' sources'}</span></div>
    </>);
  }

  if (live && tab === 'documents') {
    const shown = d.docs.filter((x) => !needle || x.name.toLowerCase().includes(needle));
    body = (<>
      <label className={'tr-drop' + (over ? ' is-over' : '')} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={(e) => { e.preventDefault(); setOver(false); upload(e.dataTransfer.files); }}>
        <Icon name="upload" width="22" height="22" aria-hidden="true" />
        <span>Drop files here or choose them</span>
        <small>PDF, DOCX, TXT, CSV (question, answer) or MD · {MAX_MB} MB each</small>
        <input type="file" accept={ACCEPT} multiple className="sr-only" onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
      </label>
      <div className="ix-bar" style={{ borderTop: '1px solid var(--border-subtle)' }}><SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search documents" /></div>
      {!shown.length ? <div className="ix-empty"><EmptyState icon="file-text" title="No documents" actionLabel="Upload document" onAction={pick} /></div> : (<>
        <ul className="ix-plist" aria-label="Documents">
          {shown.map((x) => { const st = statusOf(x, t); return (
            <li key={x.id}><button type="button" className="ix-pitem" onClick={() => setOpen({ kind: 'doc', id: x.id })}>
              <span className="ix-pitem__top"><b>{x.name}</b><Badge st={x.use ? st : 'off'} /></span>
              <span className="ix-pitem__mid">{x.pages} {x.pages === 1 ? 'page' : 'pages'} · {sizeText(x.size)} · {ago(x.updated, t)}</span>
            </button></li>
          ); })}
        </ul>
        <div className="ix-table-wrap">
          <table className="ix-table">
            <caption className="sr-only">Documents</caption>
            <thead><tr><th scope="col">Document</th><th scope="col" className="ix-num">Pages</th><th scope="col" className="ix-num">Size</th><th scope="col">Status</th><th scope="col">Updated</th><th scope="col">Use</th></tr></thead>
            <tbody>
              {shown.map((x) => { const st = statusOf(x, t); return (
                <tr key={x.id} className={x.use ? '' : 'ga-off'}>
                  <td><span className="ga-src"><span className="ga-ico" aria-hidden="true"><Icon name={docIcon(x.name)} width="16" height="16" /></span><span><button type="button" className="ga-name" onClick={() => setOpen({ kind: 'doc', id: x.id })}>{x.name}</button><small className="ga-sub">{x.by}</small></span></span></td>
                  <td className="ix-num ga-fig">{x.pages}</td>
                  <td className="ix-num ga-fig">{sizeText(x.size)}</td>
                  <td><span className="ga-badges"><Badge st={st} />{st === 'indexed' && x.use && isStale(x, t) ? <StatusBadge tone="warning">Stale</StatusBadge> : null}</span></td>
                  <td className="ix-muted">{ago(x.updated, t)}</td>
                  <td><Switch on={x.use} label={(x.use ? 'Stop using ' : 'Use ') + x.name} onToggle={() => toggle('doc', x, x.name)} /></td>
                </tr>
              ); })}
            </tbody>
          </table>
        </div>
      </>)}
      <div className="ix-foot"><span>{d.docs.length} documents · {d.docs.reduce((a, x) => a + x.pages, 0).toLocaleString('en-IN')} pages</span></div>
    </>);
  }

  if (live && tab === 'websites') {
    body = (<>
      <form className="ix-bar" onSubmit={addUrl} aria-label="Add a website address">
        <span className="tr-add">
          <input ref={urlRef} className={'gc-input' + (urlErr ? ' gc-input--error' : '')} value={url} onChange={(e) => { setUrl(e.target.value); setUrlErr(''); }} placeholder="https://gridcommerce.net/help/…" inputMode="url" aria-label="Website address" aria-invalid={!!urlErr} />
          <button type="submit" className="ix-btn"><Icon name="plus" width="16" height="16" aria-hidden="true" /><span>Add</span></button>
          <button type="button" className="ix-btn" onClick={crawlAll}><Icon name="refresh-cw" width="16" height="16" aria-hidden="true" /><span>Re-crawl all</span></button>
        </span>
      </form>
      {urlErr ? <p className="tr-err" role="alert">{urlErr}</p> : null}
      <ul className="ix-plist" aria-label="Website sources">
        {d.sites.map((x) => { const st = statusOf(x, t); return (
          <li key={x.id}><button type="button" className="ix-pitem" onClick={() => setOpen({ kind: 'site', id: x.id })}>
            <span className="ix-pitem__top"><b>{x.url.replace(/^https?:\/\//, '')}</b><Badge st={x.use ? st : 'off'} /></span>
            <span className="ix-pitem__mid">{x.pages} pages · crawled {ago(x.updated, t)}</span>
          </button></li>
        ); })}
      </ul>
      <div className="ix-table-wrap">
        <table className="ix-table">
          <caption className="sr-only">Website sources</caption>
          <thead><tr><th scope="col">Address</th><th scope="col" className="ix-num">Pages found</th><th scope="col">Last crawled</th><th scope="col">Status</th><th scope="col">Use</th><th scope="col" className="tr-act"><span className="sr-only">Re-crawl</span></th></tr></thead>
          <tbody>
            {d.sites.map((x) => { const st = statusOf(x, t); const name = x.url.replace(/^https?:\/\//, ''); return (
              <tr key={x.id} className={x.use ? '' : 'ga-off'}>
                <td><span className="ga-src"><span className="ga-ico" aria-hidden="true"><Icon name="globe" width="16" height="16" /></span><span><button type="button" className="ga-name" onClick={() => setOpen({ kind: 'site', id: x.id })}>{name}</button><small className="ga-sub">{x.title}</small></span></span></td>
                <td className="ix-num ga-fig">{st === 'crawling' ? '…' : x.pages}</td>
                <td className="ix-muted">{st === 'crawling' ? 'Now' : ago(x.updated, t)}</td>
                <td><span className="ga-badges"><Badge st={st} />{st === 'indexed' && x.use && isStale(x, t) ? <StatusBadge tone="warning">Stale</StatusBadge> : null}</span></td>
                <td><Switch on={x.use} label={(x.use ? 'Stop using ' : 'Use ') + name} onToggle={() => toggle('site', x, name)} /></td>
                <td className="tr-act"><button type="button" className="ix-btn ix-btn--sm" disabled={st === 'crawling'} onClick={() => { recrawl(x.id); toast('Re-crawling ' + name + '…'); }}>Re-crawl</button></td>
              </tr>
            ); })}
          </tbody>
        </table>
      </div>
      <div className="ix-foot"><span>{d.sites.length} addresses · {d.sites.reduce((a, x) => a + x.pages, 0)} pages</span></div>
    </>);
  }

  if (live && tab === 'faqs') {
    const shown = d.faqs.filter((f) => (!topic || f.topic === topic) && (!needle || (f.q + ' ' + f.a + ' ' + f.qBn).toLowerCase().includes(needle)));
    body = (<>
      <div className="ix-bar">
        <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search FAQs" />
        <span className="ix-tools">
          <select className="ix-pick" aria-label="Topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="">All topics</option>{FAQ_TOPICS.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </span>
      </div>
      {!shown.length ? <div className="ix-empty"><EmptyState icon="message-circle-question" title="No FAQs here" actionLabel="Add FAQ" onAction={() => setFaq({ topic: topic || 'Other' })} /></div> : (<>
        <ul className="ix-plist" aria-label="FAQs">
          {shown.map((f) => (
            <li key={f.id}><button type="button" className="ix-pitem" onClick={() => setFaq({ ...f })}>
              <span className="ix-pitem__top"><b>{f.q}</b><span className="ga-fig">{f.uses}</span></span>
              <span className="ix-pitem__mid ga-bn">{f.qBn || 'No Bangla yet'}</span>
            </button></li>
          ))}
        </ul>
        <div className="ix-table-wrap">
          <table className="ix-table">
            <caption className="sr-only">FAQs</caption>
            <thead><tr><th scope="col">Question</th><th scope="col">Topic</th><th scope="col" className="ix-num">Used · 30 days</th><th scope="col">Updated</th><th scope="col">Use</th><th scope="col" className="tr-act"><span className="sr-only">Remove</span></th></tr></thead>
            <tbody>
              {shown.map((f) => (
                <tr key={f.id} className={f.use ? '' : 'ga-off'}>
                  <td><button type="button" className="ga-name" onClick={() => setFaq({ ...f })}>{f.q}</button><small className="ga-sub ga-bn" lang="bn">{f.qBn || 'No Bangla yet'}</small></td>
                  <td>{f.topic}</td>
                  <td className="ix-num ga-fig">{f.uses}</td>
                  <td className="ix-muted">{ago(f.updated, t)}</td>
                  <td><Switch on={f.use} label={(f.use ? 'Stop using ' : 'Use ') + f.q} onToggle={() => toggle('faq', f, 'FAQ')} /></td>
                  <td className="tr-act"><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={'Remove ' + f.q} onClick={() => delFaq(f)}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>)}
      <div className="ix-foot"><span>{shown.length} FAQs · {d.faqs.filter((f) => f.qBn).length} with Bangla</span></div>
    </>);
  }

  if (live && tab === 'policies') {
    const list = (kind) => d.policies.filter((p) => p.kind === kind).map((p) => (
      <li key={p.id} className={p.use ? '' : 'ga-off'}>
        <span className="ga-ico" aria-hidden="true"><Icon name={kind === 'policy' ? 'scroll-text' : 'list-checks'} width="16" height="16" /></span>
        <div>
          <button type="button" className="ga-name" onClick={() => setPolicy({ id: p.id, title: p.title, body: p.body, err: '' })}>{p.title}</button>
          {isStale(p, t) && p.use ? <> <StatusBadge tone="warning">Stale</StatusBadge></> : null}
          <p>{p.body}</p>
          <p>Updated {ago(p.updated, t)} · {p.by}</p>
        </div>
        <Switch on={p.use} label={(p.use ? 'Stop using ' : 'Use ') + p.title} onToggle={() => toggle('policy', p, p.title)} />
      </li>
    ));
    body = (
      <div className="tr-cols" style={{ padding: 'var(--space-4)' }}>
        <section className="ix-card" aria-labelledby="tr-pol-h"><h2 id="tr-pol-h" className="tr-h2">Business policies</h2><ul className="tr-list" style={{ marginTop: 'var(--space-2)' }}>{list('policy')}</ul></section>
        <section className="ix-card" aria-labelledby="tr-proc-h"><h2 id="tr-proc-h" className="tr-h2">Support procedures <InfoTip text="Step-by-step answers GridAI follows for common problems. A step that says “hand to …” makes GridAI pass the conversation to that team." /></h2><ul className="tr-list" style={{ marginTop: 'var(--space-2)' }}>{list('procedure')}</ul></section>
      </div>
    );
  }

  if (live && tab === 'catalog') {
    const sets = catalogue();
    const ladders = pricing(db.plans);
    body = (
      <div className="tr-cols" style={{ padding: 'var(--space-4)' }}>
        <section className="ix-card" aria-labelledby="tr-prod-h">
          <h2 id="tr-prod-h" className="tr-h2">Product information <Link href="/admin/modules" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)' }}>Modules</Link></h2>
          <div style={{ marginTop: 'var(--space-2)' }}>
            {sets.map((s) => (
              <div key={s.id} className="tr-sec">
                <div className="tr-lhead">
                  <span><b>{s.label}</b><small>{s.sub} · {s.modules.length} modules</small>
                    <span className="tr-mods">{s.modules.map((m) => <span key={m.code} className="tr-mod">{m.name}<i>{m.code}</i></span>)}</span>
                  </span>
                  <Switch on={!!d.useSets[s.id]} label={'Use ' + s.label + ' in answers'} onToggle={() => { setSetUse(s.id, !d.useSets[s.id]); toast(s.label + (d.useSets[s.id] ? ' is no longer used in answers.' : ' is used in answers.')); }} />
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="ix-card" aria-labelledby="tr-price-h">
          <h2 id="tr-price-h" className="tr-h2">Pricing <Link href="/admin/packages" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)' }}>Packages</Link></h2>
          <div style={{ marginTop: 'var(--space-2)' }}>
            {ladders.map((l) => (
              <div key={l.id} className="tr-sec">
                <div className="tr-lhead">
                  <span><b>{l.label} plans</b><small>{l.v ? 'Live version v' + l.v : 'No live version'}</small></span>
                  <Switch on={!!d.usePricing[l.id]} label={'Use ' + l.label + ' prices in answers'} onToggle={() => { setPricingUse(l.id, !d.usePricing[l.id]); toast(l.label + (d.usePricing[l.id] ? ' prices are no longer quoted.' : ' prices are quoted in answers.')); }} />
                </div>
                {l.plans.length ? (
                  <div className="tr-price ix-table-wrap" style={{ display: 'block' }}>
                    <table className="ix-table gc-table--keep gc-table--scroll">
                      <caption className="sr-only">{l.label} plans</caption>
                      <thead><tr><th scope="col">Plan</th><th scope="col" className="ix-num">Month</th><th scope="col" className="ix-num">Year</th><th scope="col" className="ix-num">Orders</th><th scope="col" className="ix-num">Seats</th></tr></thead>
                      <tbody>{l.plans.map((p) => (
                        <tr key={p.id}><td>{p.name}</td><td className="ix-num ga-fig">{taka(p.price)}</td><td className="ix-num ga-fig">{taka(p.yearly)}</td><td className="ix-num ga-fig">{limitText('orders', p.limits.orders)}</td><td className="ix-num ga-fig">{limitText('seats', p.limits.seats)}</td></tr>
                      ))}</tbody>
                    </table>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (live && tab === 'conversations') {
    const shown = d.training.filter((c) => (conv === 'all' || (conv === 'in' ? c.include : !c.include)) && (!needle || (c.title + ' ' + c.who).toLowerCase().includes(needle)));
    const n = d.training.filter((c) => c.include).length;
    body = (<>
      <div className="ix-bar">
        <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search conversations" />
        <span className="ix-tools">
          <select className="ix-pick" aria-label="Show" value={conv} onChange={(e) => setConv(e.target.value)}>
            <option value="all">All ({d.training.length})</option><option value="in">Used for training ({n})</option><option value="out">Left out ({d.training.length - n})</option>
          </select>
          <button type="button" className="ix-btn" onClick={() => { const r = includeRated(); toast(r.n ? 'Only conversations rated good are used now.' : 'Already only the good ones.'); }}>Use only rated good</button>
        </span>
      </div>
      {!shown.length ? <div className="ix-empty"><EmptyState icon="messages-square" title="No conversations here" actionLabel="Show all" onAction={() => { setConv('all'); setQ(''); }} /></div> : (<>
        <ul className="ix-plist" aria-label="Past conversations">
          {shown.map((c) => (
            <li key={c.id}><div className="ix-pitem" style={{ flexDirection: 'row', alignItems: 'center' }}>
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span className="ix-pitem__top"><b>{c.title}</b></span>
                <span className="ix-pitem__mid">{c.who} · {channelLabel(c.channel)} · {ago(c.at, t)}</span>
              </span>
              <Switch on={c.include} label={(c.include ? 'Leave out ' : 'Use ') + c.title} onToggle={() => setInclude(c.id, !c.include)} />
            </div></li>
          ))}
        </ul>
        <div className="ix-table-wrap">
          <table className="ix-table">
            <caption className="sr-only">Past conversations</caption>
            <thead><tr><th scope="col">Conversation</th><th scope="col">Channel</th><th scope="col">Rating</th><th scope="col" className="ix-num">Messages</th><th scope="col">Date</th><th scope="col">Use for training</th></tr></thead>
            <tbody>
              {shown.map((c) => (
                <tr key={c.id} className={c.include ? '' : 'ga-off'}>
                  <td><b className="ix-strong" style={{ fontWeight: 'var(--weight-medium)' }}>{c.title}</b><small className="ga-sub">{c.shopId ? <Link href={'/admin/merchant?id=' + c.shopId}>{c.who}</Link> : c.who + ' · lead'}</small></td>
                  <td>{channelLabel(c.channel)}</td>
                  <td><Thumb r={c.rating} /></td>
                  <td className="ix-num ga-fig">{c.messages}</td>
                  <td className="ix-muted">{ago(c.at, t)}</td>
                  <td><Switch on={c.include} label={(c.include ? 'Leave out ' : 'Use ') + c.title} onToggle={() => setInclude(c.id, !c.include)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>)}
      <div className="ix-foot"><span>{n} of {d.training.length} used for training</span></div>
    </>);
  }

  const counts = live ? { base: rows.length, documents: d.docs.length, websites: d.sites.length, faqs: d.faqs.length, policies: d.policies.length, conversations: d.training.filter((c) => c.include).length } : {};
  const tabs = TABS.map(([k, l]) => ({ key: k, id: 'tr-tab-' + k, label: l, count: live && counts[k] != null ? counts[k] : null, on: tab === k, onClick: () => setTab(k) }));
  const showOnly = (f) => { setTab('base'); setFilter(filter === f && tab === 'base' ? 'all' : f); };

  return (
    <AdminShell active="ai-training">
      <style dangerouslySetInnerHTML={{ __html: GA_CSS + CSS }} />
      <input ref={fileRef} type="file" accept={ACCEPT} multiple className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
      {!live ? <Skeleton label="Loading GridAI training" /> : (
        <div className="ix-page">
          <ShopHeader icon="book-open" title="Training"
            about="What GridAI knows when it answers leads and merchants in the Inbox, the website chat and WhatsApp: documents, gridcommerce.net pages, FAQs in English and Bangla, business policies, support procedures, the product and pricing catalogue, and past conversations. A source that is off or failed is not used."
            secondary={[{ label: 'Add FAQ', icon: 'plus', onClick: () => setFaq({ topic: 'Other' }) }]}
            more={[
              { label: 'Add website', onClick: () => { setTab('websites'); setTimeout(() => urlRef.current && urlRef.current.focus(), 0); } },
              { label: 'Re-crawl website', onClick: crawlAll },
              { label: 'Test chat', href: '/admin/gridai/test' },
              { label: 'Behaviour', href: '/admin/gridai/behaviour' },
            ]}
            primary={{ label: 'Upload document', icon: 'upload', onClick: pick }} />

          <section className="ix-card tr-health" aria-label="Knowledge health">
            <span className="tr-health__t"><Icon name="heart-pulse" width="16" height="16" aria-hidden="true" />Knowledge health <InfoTip text={`Failing: a file or page that could not be read. Stale: a document, page or policy in use that was not updated for ${STALE_DAYS} days.`} /></span>
            {h.failing.length ? <button type="button" className="tr-chip is-bad" aria-pressed={tab === 'base' && filter === 'failing'} onClick={() => showOnly('failing')}><Icon name="circle-alert" width="14" height="14" aria-hidden="true" />{h.failing.length} failing</button> : null}
            {h.stale.length ? <button type="button" className="tr-chip is-warn" aria-pressed={tab === 'base' && filter === 'stale'} onClick={() => showOnly('stale')}><Icon name="clock" width="14" height="14" aria-hidden="true" />{h.stale.length} stale over {STALE_DAYS} days</button> : null}
            {!h.failing.length && !h.stale.length ? <span className="tr-chip is-ok"><Icon name="circle-check" width="14" height="14" aria-hidden="true" />All sources current</span> : null}
            {h.pending ? <span className="tr-quiet">{h.pending} indexing now</span> : null}
            <span className="tr-quiet">{h.inUse} sources in use</span>
          </section>

          <section className="ix-card" aria-label="Knowledge">
            <div className="ix-bar"><IndexTabs tabs={tabs} label="Knowledge" /></div>
            {body}
          </section>
        </div>
      )}

      {/* ---- one document or website ---- */}
      <Sheet open={!!src} title={srcName} onClose={() => setOpen(null)}
        footer={src ? <div className="ga-foot">
          <span className="ga-left"><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={removeSrc}>Remove</button></span>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" disabled={srcSt === 'indexing' || srcSt === 'crawling'} onClick={again}>{open.kind === 'doc' ? (srcSt === 'failed' ? 'Try again' : 'Index again') : 'Re-crawl'}</button>
        </div> : null}>
        {src ? (
          <div className="ga-body" style={{ padding: 0 }}>
            {srcSt === 'failed' && src.note ? <p className="ga-note is-error">{src.note}</p> : srcSt === 'indexing' || srcSt === 'crawling' ? <p className="ga-note">{open.kind === 'doc' ? 'Reading the file. It is ready in a few seconds.' : 'Reading the pages. It is ready in a few seconds.'}</p> : isStale(src, t) && src.use ? <p className="ga-note is-warn">Not updated for {STALE_DAYS} days or more. {open.kind === 'doc' ? 'Upload a newer version if it changed.' : 'Re-crawl it to pick up changes.'}</p> : null}
            <KV rows={open.kind === 'doc' ? [
              ['Status', <Badge key="s" st={srcSt} />], ['Type', (src.name.split('.').pop() || '').toUpperCase() + ' file'], ['Pages', String(src.pages)], ['Size', sizeText(src.size)],
              ['Updated', ago(src.updated, t)], ['Added by', src.by],
            ] : [
              ['Status', <Badge key="s" st={srcSt} />], ['Address', <a key="a" href={src.url} target="_blank" rel="noreferrer">{src.url}</a>], ['Pages found', srcSt === 'crawling' ? '…' : String(src.pages)],
              ['Last crawled', srcSt === 'crawling' ? 'Now' : ago(src.updated, t)],
            ]} />
            <div className="ga-sw"><span>Use in answers<small>When off, GridAI ignores it.</small></span><Switch on={src.use} label={'Use ' + srcName} onToggle={() => toggle(open.kind, src, srcName)} /></div>
          </div>
        ) : null}
      </Sheet>

      {/* ---- a policy or procedure ---- */}
      <Sheet open={!!policy} title={policy ? policy.title || 'Policy' : ''} onClose={() => setPolicy(null)}
        footer={policy ? <div className="ga-foot"><span className="ga-left" /><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setPolicy(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={savePol}>Save</button></div> : null}>
        {policy ? (
          <div className="ga-body" style={{ padding: 0 }}>
            <Field label="Title" htmlFor="pol-title"><input id="pol-title" className="gc-input" value={policy.title} onChange={(e) => setPolicy({ ...policy, title: e.target.value, err: '' })} /></Field>
            <Field label="What GridAI should know" htmlFor="pol-body" error={policy.err} help="Short, plain sentences. For a procedure, number the steps.">
              <textarea id="pol-body" className={'gc-input ga-area' + (policy.err ? ' gc-input--error' : '')} rows={9} value={policy.body} onChange={(e) => setPolicy({ ...policy, body: e.target.value, err: '' })} />
            </Field>
          </div>
        ) : null}
      </Sheet>

      <FaqSheet faq={faq} onClose={() => setFaq(null)} onSaved={() => { if (tab !== 'faqs' && tab !== 'base') setTab('faqs'); }} />
    </AdminShell>
  );
}
