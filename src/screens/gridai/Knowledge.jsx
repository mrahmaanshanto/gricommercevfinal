'use client';
// Grid AI › Knowledge — what the AI knows. Shopify-style list of sources (shop data read live, files, websites,
// connected channels) with status, items, last sync and an on/off switch; the 12 knowledge categories; entries written
// by hand. Add knowledge: upload (PDF, DOCX, TXT, CSV), website, write an entry, or connect a channel.
// Data: src/lib/gridai/knowledge.js. Who may change it: permission "Upload AI knowledge" (lib/permissions.js).

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { EmptyState, Sheet, StatusBadge, InfoTip } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, LearnMore } from '@/components/ui/IndexKit';
import { toast, confirmDialog } from '@/runtime/ui';
import { formatDateTime, formatDate } from '@/lib/format';
import { currentUser } from '@/lib/team';
import { can, why, PERMS_EVENT } from '@/lib/permissions';
import { statusOf as appStatus } from '@/lib/connections';
import {
  getSources, getEntries, entriesOf, addFile, addUrl, addEntry, removeEntry, setEnabled, resync, removeSource, setCategory, markReviewed,
  categoryCounts, CATEGORIES, CATEGORY_LABEL, CATEGORY_ICON, STATUS_WORD, STATUS_TONE, KIND_WORD, ACCEPT, KB_EVENT,
} from '@/lib/gridai/knowledge';
import { PROFILE_EVENT } from '@/lib/gridai/profile';
import { getCorrections, approveCorrection, rejectCorrection, QUALITY_EVENT } from '@/lib/gridai/quality';
import { GaFrame, Switch, Field, useLive } from './gaShared';
import { ModuleSetup } from '@/components/ModuleSetup';

const CSS = `
.kn-src{display:flex;align-items:center;gap:10px;min-width:0;max-width:360px}
.kn-src>span:last-child{display:flex;flex-direction:column;min-width:0}
.kn-src b{overflow:hidden;font-weight:var(--weight-medium);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.kn-src small{font-size:var(--text-xs);color:var(--text-muted)}
.kn-ico{display:grid;flex:none;place-items:center;width:32px;height:32px;border-radius:var(--radius-md);background:var(--surface-subtle);color:var(--text-body)}
.kn-off td{color:var(--text-muted)}
.kn-cats{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:var(--space-2);padding:var(--space-4)}
.kn-cat{display:flex;align-items:center;gap:10px;min-height:52px;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;font-size:var(--text-sm);color:var(--text-heading);text-align:left;cursor:pointer;transition:var(--transition-colors)}
.kn-cat:hover{border-color:var(--border-strong)}
.kn-cat[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft)}
.kn-cat>span:nth-child(2){flex:1;min-width:0}
.kn-cat small{font-size:var(--text-xs);color:var(--text-muted);font-variant-numeric:tabular-nums}
.kn-bar{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-subtle)}
.kn-bar h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.kn-entries{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.kn-entries li{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.kn-entries li:first-child{border-top:0}
.kn-entries li>div{flex:1;min-width:0}
.kn-entries b{display:block;font-weight:var(--weight-medium);color:var(--text-heading)}
.kn-entries p{margin:2px 0 0;color:var(--text-body);line-height:1.5}
.kn-entries small{font-size:var(--text-xs);color:var(--text-muted)}
.kn-drop{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:140px;padding:var(--space-4);border:1.5px dashed var(--border-strong);border-radius:var(--radius-xl);background:var(--surface-subtle);font-size:var(--text-sm);color:var(--text-body);text-align:center;cursor:pointer}
.kn-drop.is-over{border-color:var(--primary);background:var(--fill-primary-soft)}
.kn-drop small{font-size:var(--text-xs);color:var(--text-muted)}
.kn-files{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none;font-size:var(--text-sm)}
.kn-files li{display:flex;justify-content:space-between;gap:var(--space-2)}
.kn-apps{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.kn-apps li{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);min-height:48px;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.kn-apps li:first-child{border-top:0}
.kn-kv{display:grid;grid-template-columns:max-content 1fr;gap:6px var(--space-4);margin:0;font-size:var(--text-sm)}
.kn-kv dt{color:var(--text-muted)}
.kn-kv dd{margin:0;color:var(--text-heading)}
.kn-note{margin:0;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm);line-height:1.5;color:var(--text-body)}
.kn-note.is-error{background:var(--fill-error-soft);color:var(--text-danger)}
.kn-note.is-warn{background:var(--fill-warning-soft);color:var(--text-warning)}
.kn-foot{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);width:100%}
.kn-foot>.kn-left{margin-right:auto}
.kn-corr{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.kn-corr li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:var(--space-2) var(--space-4);padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.kn-corr li:first-child{border-top:0}
.kn-corr b{display:block;font-weight:var(--weight-medium);color:var(--text-heading)}
.kn-corr .kn-was{margin:4px 0 0;color:var(--text-muted);text-decoration:line-through;text-decoration-color:var(--text-danger)}
.kn-corr .kn-now{margin:4px 0 0;color:var(--text-heading);line-height:1.5}
.kn-corr small{display:block;margin-top:4px;font-size:var(--text-xs);color:var(--text-muted)}
.kn-corr__acts{display:flex;flex-wrap:wrap;align-items:flex-start;gap:var(--space-2)}
@media (max-width:640px){.kn-corr li{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){.kn-cats{grid-template-columns:repeat(2,minmax(0,1fr));padding:var(--space-3)}}
`;

const KIND_ICON = { builtin: 'database', file: 'file-text', url: 'globe', channel: 'plug' };
const fileIcon = (s) => (s.kind === 'file' ? (s.type === 'csv' ? 'file-spreadsheet' : 'file-text') : KIND_ICON[s.kind] || 'database');
// shop data is read live; added sources show when they were last read
const syncText = (s) => (s.builtin ? 'Live' : s.status === 'processing' ? 'Processing…' : s.lastSync ? formatDateTime(new Date(s.lastSync)) : '—');
const sizeText = (b) => (b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB');
const CONNECT = [['woocommerce', 'WooCommerce', 'Product pages and store policies'], ['shopify', 'Shopify', 'Product pages and store policies'], ['gbp', 'Google Business Profile', 'Hours, address, services, Q&A'], ['facebook', 'Facebook Page', 'About, hours, pinned posts'], ['instagram', 'Instagram', 'Bio and highlights'], ['whatsapp', 'WhatsApp Business', 'Catalogue and quick replies']];
const TABS = [['all', 'All'], ['ready', 'Ready'], ['processing', 'Processing'], ['review', 'Needs review'], ['failed', 'Failed'], ['disabled', 'Disabled']];

export default function Knowledge() {
  const data = useLive(() => ({ sources: getSources(), entries: getEntries(), counts: categoryCounts(), me: currentUser(), corr: getCorrections() }), [KB_EVENT, PROFILE_EVENT, PERMS_EVENT, QUALITY_EVENT, 'storage'], 1000);
  const [fix, setFix] = useState(null);       // a correction being approved with an edit, or rejected
  const [tab, setTab] = useState('all');
  const [cat, setCat] = useState('');
  const [open, setOpen] = useState(null);     // source id in the detail sheet
  const [add, setAdd] = useState(null);       // { mode, files, url, category, title, text, until, err, busy }
  const [over, setOver] = useState(false);
  const fileRef = useRef(null);

  const ready = !!data;
  const sources = ready ? data.sources : [];
  const mayEdit = ready && can(data.me, 'ai-knowledge');
  const shown = useMemo(() => sources.filter((s) => (tab === 'all' || s.status === tab) && (!cat || s.category === cat)), [sources, tab, cat]);
  const n = (st) => sources.filter((s) => s.status === st).length;
  const items = sources.filter((s) => s.status === 'ready' || s.status === 'review').reduce((a, s) => a + (s.items || 0), 0) + (ready ? data.entries.filter((e) => !e.source).length : 0);
  const written = ready ? data.entries.filter((e) => !e.source && (!cat || e.category === cat)) : [];
  const src = open ? sources.find((s) => s.id === open) : null;
  const tabs = TABS.map(([k, l]) => ({ key: k, id: 'kn-tab-' + k, label: l, count: ready ? (k === 'all' ? sources.length : n(k)) : null, on: tab === k, onClick: () => setTab(k) }));
  const locked = () => toast(why('ai-knowledge'), { tone: 'info' });

  const openAdd = (mode = 'upload') => { if (!mayEdit) { locked(); return; } setAdd({ mode, files: [], url: '', category: cat || 'faq', title: '', text: '', until: '', err: '', busy: false }); };
  const pickFiles = (list) => { const files = Array.from(list || []).filter((f) => /\.(pdf|docx|txt|csv)$/i.test(f.name)); const bad = Array.from(list || []).length - files.length; setAdd((a) => ({ ...a, files: [...a.files, ...files], err: bad ? 'Only PDF, DOCX, TXT and CSV files can be added.' : '' })); };
  const submitAdd = async () => {
    const a = add, by = data.me.name;
    try {
      setAdd({ ...a, busy: true, err: '' });
      if (a.mode === 'upload') {
        if (!a.files.length) throw new Error('Choose at least one file.');
        for (const f of a.files) await addFile(f, by);
        toast(a.files.length === 1 ? a.files[0].name + ' added. Processing…' : a.files.length + ' files added. Processing…');
      } else if (a.mode === 'url') {
        addUrl(a.url, by); toast('Website added. Reading its pages…');
      } else if (a.mode === 'write') {
        addEntry({ category: a.category, title: a.title, text: a.text, until: a.until ? new Date(a.until + 'T23:59:00').getTime() : null }, by);
        toast('Saved to ' + CATEGORY_LABEL[a.category] + '.');
      }
      setAdd(null);
    } catch (e) { setAdd({ ...a, busy: false, err: e.message }); }
  };
  const toggle = (s) => { if (!mayEdit) { locked(); return; } setEnabled(s.id, !s.enabled, data.me.name); toast(s.name + (s.enabled ? ' turned off. The AI no longer uses it.' : ' turned on.')); };
  const remove = async (s) => {
    if (!(await confirmDialog({ title: 'Remove ' + s.name + '?', body: 'The AI stops using it at once. ' + (s.items ? s.items + ' items are removed.' : ''), confirmLabel: 'Remove', tone: 'danger' }))) return;
    removeSource(s.id, data.me.name); setOpen(null); toast(s.name + ' removed.');
  };

  return (
    <GaFrame screen="Knowledge" active="ai-knowledge" page="Knowledge & training" css={CSS} after={(<>
      {/* ---- approve with an edit, or reject, a correction ---- */}
      <Sheet open={!!fix} title={fix ? (fix.mode === 'reject' ? 'Don’t use this correction' : 'Approve the correction') : ''} onClose={() => setFix(null)}
        footer={fix ? <div className="kn-foot"><span className="kn-left" /><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setFix(null)}>Cancel</button>{fix.mode === 'reject'
          ? <button type="button" className="gc-btn gc-btn--sm gc-btn--error" onClick={() => { rejectCorrection(fix.c.id, fix.text, data.me.name); setFix(null); toast('Not used. The AI keeps its current knowledge.'); }}>Don’t use</button>
          : <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => { approveCorrection(fix.c.id, data.me.name, fix.text); setFix(null); toast('Added to ' + CATEGORY_LABEL[fix.c.category] + '. The AI uses it from the next answer.'); }}>Approve and add</button>}</div> : null}>
        {fix ? (
          <div className="ga-body" style={{ padding: 0 }}>
            <p className="kn-note"><b>Customer asked:</b> {fix.c.question || '—'}</p>
            {fix.mode === 'reject'
              ? <Field label="Why not?" optional htmlFor="kn-rej"><textarea id="kn-rej" className="gc-input ga-area" rows={3} value={fix.text} onChange={(e) => setFix({ ...fix, text: e.target.value })} /></Field>
              : <Field label="The right answer" htmlFor="kn-right" help={'Goes into ' + CATEGORY_LABEL[fix.c.category] + '.'}><textarea id="kn-right" className="gc-input ga-area" rows={4} value={fix.text} onChange={(e) => setFix({ ...fix, text: e.target.value })} /></Field>}
          </div>
        ) : null}
      </Sheet>
      {/* ---- add knowledge ---- */}
      <Sheet open={!!add} title="Add knowledge" onClose={() => setAdd(null)}
        footer={add && add.mode !== 'connect' ? <div className="kn-foot"><span className="kn-left" /><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setAdd(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" disabled={add.busy} onClick={submitAdd}>{add.mode === 'write' ? 'Save' : 'Add'}</button></div> : null}>
        {add ? (
          <div className="ga-body" style={{ padding: 0 }}>
            <div className="gc-seg" role="group" aria-label="How to add">
              {[['upload', 'Upload'], ['url', 'Website'], ['write', 'Write'], ['connect', 'Connect']].map(([k, l]) => <button key={k} type="button" className={'gc-seg__btn' + (add.mode === k ? ' gc-seg__btn--active' : '')} aria-pressed={add.mode === k} onClick={() => setAdd({ ...add, mode: k, err: '' })}>{l}</button>)}
            </div>
            {add.mode === 'upload' ? (<>
              <label className={'kn-drop' + (over ? ' is-over' : '')} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={(e) => { e.preventDefault(); setOver(false); pickFiles(e.dataTransfer.files); }}>
                <Icon name="upload" width="22" height="22" aria-hidden="true" />
                <span>Drop files here or choose them</span>
                <small>PDF, DOCX, TXT or CSV (question, answer) · 20 MB each</small>
                <input ref={fileRef} type="file" accept={ACCEPT} multiple className="sr-only" onChange={(e) => { pickFiles(e.target.files); e.target.value = ''; }} />
              </label>
              {add.files.length ? <ul className="kn-files">{add.files.map((f, i) => <li key={i}><span>{f.name}</span><span className="ix-muted">{sizeText(f.size)}</span></li>)}</ul> : null}
            </>) : null}
            {add.mode === 'url' ? (
              <Field label="Website address" htmlFor="kn-url" help="The AI reads the public pages: about, contact, delivery, FAQ and policies.">
                <input id="kn-url" className="gc-input" value={add.url} onChange={(e) => setAdd({ ...add, url: e.target.value, err: '' })} placeholder="https://yourshop.com" inputMode="url" autoFocus />
              </Field>
            ) : null}
            {add.mode === 'write' ? (<>
              <Field label="Category" htmlFor="kn-cat">
                <select id="kn-cat" className="gc-input gc-select" value={add.category} onChange={(e) => setAdd({ ...add, category: e.target.value })}>{CATEGORIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
              </Field>
              <Field label={add.category === 'faq' ? 'Question' : 'Title'} optional={add.category !== 'faq'} htmlFor="kn-title">
                <input id="kn-title" className="gc-input" value={add.title} onChange={(e) => setAdd({ ...add, title: e.target.value })} placeholder={add.category === 'faq' ? 'For example: Do you have cash on delivery?' : ''} />
              </Field>
              <Field label={add.category === 'faq' ? 'Answer' : add.category === 'custom' ? 'Instruction' : 'What the AI should know'} htmlFor="kn-text">
                <textarea id="kn-text" className="gc-input ga-area" value={add.text} onChange={(e) => setAdd({ ...add, text: e.target.value, err: '' })} rows={4} />
              </Field>
              {add.category === 'campaign' ? <Field label="Use until" htmlFor="kn-until" help="After this date the AI stops mentioning it."><input id="kn-until" type="date" className="gc-input" value={add.until} onChange={(e) => setAdd({ ...add, until: e.target.value })} /></Field> : null}
            </>) : null}
            {add.mode === 'connect' ? (
              <ul className="kn-apps">{CONNECT.map(([id, name, sub]) => {
                const st = (() => { try { return appStatus(id).state; } catch { return 'off'; } })();
                return <li key={id}><span><b style={{ fontWeight: 'var(--weight-medium)' }}>{name}</b><br /><small className="ix-muted">{sub}</small></span>{st === 'connected' ? <StatusBadge tone="success">Connected</StatusBadge> : <Link className="gc-btn gc-btn--sm gc-btn--neutral" href={'/connect?app=' + id}>Connect</Link>}</li>;
              })}</ul>
            ) : null}
            {add.err ? <p className="gc-help gc-help--error" role="alert">{add.err}</p> : null}
          </div>
        ) : null}
      </Sheet>

      {/* ---- one source ---- */}
      <Sheet open={!!src} title={src ? src.name : ''} onClose={() => setOpen(null)}
        footer={src ? <div className="kn-foot">
          <span className="kn-left">{!src.builtin ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" disabled={!mayEdit} onClick={() => remove(src)}>Remove</button> : null}</span>
          {src.status === 'review' ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" disabled={!mayEdit} onClick={() => { markReviewed(src.id, data.me.name); toast('Marked as reviewed. The AI may use it now.'); }}>Mark reviewed</button> : null}
          <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" disabled={!mayEdit || src.status === 'processing'} onClick={() => { resync(src.id, data.me.name); toast(src.builtin ? src.name + ' is read live. Up to date.' : 'Syncing ' + src.name + '…'); }}>{src.status === 'failed' ? 'Try again' : 'Sync now'}</button>
        </div> : null}>
        {src ? (
          <div className="ga-body" style={{ padding: 0 }}>
            {src.note ? <p className={'kn-note' + (src.status === 'failed' ? ' is-error' : src.status === 'review' ? ' is-warn' : '')}>{src.note}</p> : null}
            <dl className="kn-kv">
              <dt>Status</dt><dd><StatusBadge tone={STATUS_TONE[src.status]}>{STATUS_WORD[src.status]}</StatusBadge></dd>
              <dt>Source</dt><dd>{KIND_WORD[src.kind]}{src.size ? ' · ' + sizeText(src.size) : ''}</dd>
              <dt>Items</dt><dd>{src.items || 0}</dd>
              <dt>Last synced</dt><dd>{syncText(src)}</dd>
              {src.until ? <><dt>Used until</dt><dd>{formatDate(new Date(src.until))}</dd></> : null}
            </dl>
            <div className="ga-sw"><span>Use this source<small>When off, the AI ignores it.</small></span><Switch on={src.enabled} onToggle={() => toggle(src)} label={'Use ' + src.name} disabled={!mayEdit} /></div>
            {!src.builtin ? (
              <Field label="Category" htmlFor="kn-src-cat">
                <select id="kn-src-cat" className="gc-input gc-select" value={src.category} disabled={!mayEdit} onChange={(e) => { setCategory(src.id, e.target.value); toast('Moved to ' + CATEGORY_LABEL[e.target.value] + '.'); }}>{CATEGORIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
              </Field>
            ) : <p className="gc-help" style={{ margin: 0 }}>Category: {CATEGORY_LABEL[src.category]}. Shop data is read live, so it is always current.</p>}
            {entriesOf(src.id).length ? (
              <div className="ga-field"><span className="gc-label">What the AI learned</span>
                <ul className="kn-entries" style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                  {entriesOf(src.id).slice(0, 8).map((e) => <li key={e.id}><div><b>{e.title}</b><p>{e.text}</p></div></li>)}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </Sheet>
    </>)}>
      <ShopHeader icon="book-open" title="Knowledge & training"
        about="What Grid AI knows about your shop. Shop data (products, policies, delivery, payments) is read live and always current. Add files, your website, FAQs and instructions; connect channels. A source that is off, failed or waiting for review is not used."
        secondary={[{ label: 'Write an entry', onClick: () => openAdd('write') }]}
        more={[{ label: 'Behaviour', href: '/ai-behaviour' }, { label: 'Connections', href: '/connections' }]}
        primary={{ label: 'Add knowledge', onClick: () => openAdd('upload') }} />

      <ModuleSetup area="area-gridai" />
      <MetricStrip label="Knowledge" items={[
        { label: 'Sources in use', value: ready ? String(n('ready')) : '—', icon: 'database' },
        { label: 'Items the AI knows', value: ready ? items.toLocaleString('en-IN') : '—', icon: 'book-open' },
        { label: 'Needs review', value: ready ? String(n('review')) : '—', onClick: () => setTab('review'), on: tab === 'review' },
        { label: 'Failed', value: ready ? String(n('failed')) : '—', onClick: () => setTab('failed'), on: tab === 'failed' },
      ]} />

      {ready && data.corr.length ? (
        <section className="ix-card" id="corrections" aria-labelledby="kn-corr-h">
          <div className="kn-bar"><h2 id="kn-corr-h">Corrections from the team <InfoTip text="When someone marks an AI answer as wrong and writes the right one, it waits here. Nothing is learned until a person with “Upload AI knowledge” approves it." /></h2>{data.corr.filter((c) => c.status === 'waiting').length ? <StatusBadge tone="warning">{data.corr.filter((c) => c.status === 'waiting').length} to review</StatusBadge> : null}</div>
          <ul className="kn-corr">
            {data.corr.slice(0, 6).map((c) => (
              <li key={c.id}>
                <div>
                  <b>{c.question || 'Correction'}</b>
                  {c.wrong ? <p className="kn-was">{c.wrong}</p> : null}
                  <p className="kn-now">{c.right}</p>
                  <small>{CATEGORY_LABEL[c.category]} · {c.by} · {formatDateTime(new Date(c.at))}{c.status !== 'waiting' ? ' · ' + (c.status === 'approved' ? 'added by ' : 'not used by ') + c.decidedBy : ''}</small>
                </div>
                <div className="kn-corr__acts">
                  {c.status === 'waiting' ? (<>
                    <button type="button" className="ix-btn ix-btn--sm" disabled={!mayEdit} onClick={() => setFix({ c, mode: 'reject', text: '' })}>Don’t use</button>
                    <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" disabled={!mayEdit} onClick={() => setFix({ c, mode: 'approve', text: c.right })}>Approve</button>
                  </>) : <StatusBadge tone={c.status === 'approved' ? 'success' : 'neutral'}>{c.status === 'approved' ? 'In knowledge' : 'Not used'}</StatusBadge>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="ix-card" aria-label="Sources">
        <div className="ix-bar">
          <IndexTabs tabs={tabs} label="Source status" />
          <span className="ix-tools">
            <select className="ix-pick" aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="">All categories</option>{CATEGORIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </span>
        </div>
        {!ready ? <div style={{ minHeight: 200 }} aria-busy="true" /> : !shown.length ? (
          <div className="ix-empty"><EmptyState icon="book-open" title="No sources here" actionLabel={tab !== 'all' || cat ? 'Show all sources' : 'Add knowledge'} onAction={() => (tab !== 'all' || cat ? (setTab('all'), setCat('')) : openAdd('upload'))} /></div>
        ) : (<>
          <ul className="ix-plist" aria-label="Sources">
            {shown.map((s) => (
              <li key={s.id}>
                <button type="button" className="ix-pitem" onClick={() => setOpen(s.id)}>
                  <span className="ix-pitem__top"><b>{s.name}</b><StatusBadge tone={STATUS_TONE[s.status]}>{STATUS_WORD[s.status]}</StatusBadge></span>
                  <span className="ix-pitem__mid">{CATEGORY_LABEL[s.category]} · {s.items || 0} items · {syncText(s)}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table">
              <caption className="sr-only">Knowledge sources</caption>
              <thead><tr><th scope="col">Source</th><th scope="col">Category</th><th scope="col" className="ix-num">Items</th><th scope="col">Last synced</th><th scope="col">Status</th><th scope="col">Use</th></tr></thead>
              <tbody>
                {shown.map((s) => (
                  <tr key={s.id} className={s.enabled ? '' : 'kn-off'} onClick={(e) => { if (!e.target.closest('a,button')) setOpen(s.id); }}>
                    <td><span className="kn-src"><span className="kn-ico" aria-hidden="true"><Icon name={fileIcon(s)} width="16" height="16" /></span><span><button type="button" className="ix-strong" style={{ textAlign: 'left' }} onClick={() => setOpen(s.id)}><b>{s.name}</b></button><small>{KIND_WORD[s.kind]}</small></span></span></td>
                    <td>{CATEGORY_LABEL[s.category]}</td>
                    <td className="ix-num">{s.items || 0}</td>
                    <td className="ix-muted">{syncText(s)}</td>
                    <td><StatusBadge tone={STATUS_TONE[s.status]}>{STATUS_WORD[s.status]}</StatusBadge></td>
                    <td><Switch on={s.enabled} onToggle={() => toggle(s)} label={(s.enabled ? 'Stop using ' : 'Use ') + s.name} disabled={!mayEdit} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>)}
        <div className="ix-foot"><span>{ready ? (shown.length === 1 ? '1 source' : shown.length + ' sources') : ''}</span>{!mayEdit && ready ? <span className="ga-locked"><Icon name="lock" width="13" height="13" aria-hidden="true" />{why('ai-knowledge')}</span> : null}</div>
      </section>

      <section className="ix-card" aria-labelledby="kn-cats-h">
        <div className="kn-bar"><h2 id="kn-cats-h">Categories <InfoTip text="Knowledge is kept by category so the AI weighs it right: a temporary campaign never overrides your return policy, and custom instructions come first." /></h2>{cat ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setCat('')}>Show all</button> : null}</div>
        <div className="kn-cats">
          {CATEGORIES.map(([k, l]) => (
            <button key={k} type="button" className="kn-cat" aria-pressed={cat === k} onClick={() => setCat(cat === k ? '' : k)}>
              <span className="kn-ico" aria-hidden="true"><Icon name={CATEGORY_ICON[k]} width="16" height="16" /></span>
              <span>{l}</span>
              <small>{ready ? data.counts[k] || 0 : ''}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="ix-card" aria-labelledby="kn-written-h">
        <div className="kn-bar"><h2 id="kn-written-h">Written here{cat ? ' · ' + CATEGORY_LABEL[cat] : ''}</h2><button type="button" className="ix-btn ix-btn--sm" onClick={() => openAdd('write')}><Icon name="plus" width="14" height="14" aria-hidden="true" />Write an entry</button></div>
        {!ready ? null : !written.length ? <div className="ix-empty"><EmptyState icon="pencil-line" title="Nothing written here yet" actionLabel="Write an entry" onAction={() => openAdd('write')} /></div> : (
          <ul className="kn-entries">
            {written.map((e) => (
              <li key={e.id}>
                <span className="kn-ico" aria-hidden="true"><Icon name={CATEGORY_ICON[e.category]} width="16" height="16" /></span>
                <div><b>{e.title}</b><p>{e.text}</p><small>{CATEGORY_LABEL[e.category]}{e.until ? ' · until ' + formatDate(new Date(e.until)) : ''}</small></div>
                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={'Remove ' + e.title} disabled={!mayEdit} onClick={async () => { if (await confirmDialog({ title: 'Remove this entry?', body: e.title, confirmLabel: 'Remove', tone: 'danger' })) { removeEntry(e.id, data.me.name); toast('Removed.'); } }}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <LearnMore topic="Grid AI knowledge" />
    </GaFrame>
  );
}
