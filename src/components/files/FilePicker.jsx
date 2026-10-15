'use client';
// FilePicker — "Choose a picture" for every editor (sections, menus, blocks, products, logos): a side panel with
//   Library      the shop's files (Settings › Files) by folder, with search; pick one and press Use
//   Upload       drop or browse; the new file goes into the folder chosen and is picked at once
//   Web address  a picture from another site (https://…) or a path on this site (/assets/…)
// <FilePicker open onClose onPick(src, file) accept="image|video|any" folder="sections" title />
// <ImageField id value onChange allowNone folder />  — the small field (preview + Choose / Change / Remove) editors use.
// Data: lib/files.js.

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet } from '@/components/ui';
import { useFiles, isFileRef } from '@/lib/files';
import { FileTile, UploadZone, FileImg, FILES_CSS } from './FileParts';

const CSS = FILES_CSS + `
.fp-tabs{display:flex;gap:2px;padding:2px;margin-bottom:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.fp-tabs button{flex:1;min-height:36px;border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-muted);cursor:pointer}
.fp-tabs button[aria-selected="true"]{background:var(--surface-card);color:var(--text-heading);box-shadow:var(--shadow-card)}
.fp-bar{display:flex;gap:var(--space-2);margin-bottom:var(--space-3)}
.fp-bar select{flex:0 0 46%}
.fp-up{display:flex;flex-direction:column;gap:6px;margin-bottom:var(--space-3)}
.fp-empty{padding:var(--space-5) 0;text-align:center;font-size:var(--text-sm);color:var(--text-muted)}
.fp-url img{display:block;max-width:100%;max-height:220px;margin-top:var(--space-3);border-radius:var(--radius-lg);object-fit:contain;background:var(--surface-subtle)}
.fp-field{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.fp-field__img{display:grid;place-items:center;flex:none;width:56px;height:56px;border-radius:var(--radius-md);background:var(--surface-subtle);overflow:hidden;color:var(--text-muted)}
.fp-field__img img{width:100%;height:100%;object-fit:cover}
.fp-field__txt{flex:1;min-width:0;font-size:var(--text-xs);color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fp-field__acts{display:flex;gap:4px;flex:none}
`;

const okUrl = (u) => /^https:\/\/\S+\.\S+/.test(u) || /^\/[\w\-./]+$/.test(u);

export function FilePicker({ open, onClose, onPick, accept = 'image', folder: startFolder = 'sections', title }) {
  const { ready, files, folders } = useFiles();
  const [tab, setTab] = useState('library');
  const [folder, setFolder] = useState('');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);
  const [url, setUrl] = useState('');
  const [upFolder, setUpFolder] = useState(startFolder);
  useEffect(() => { if (open) { setTab('library'); setSel(null); setUrl(''); setQ(''); setFolder(''); setUpFolder(startFolder); } }, [open, startFolder]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return files.filter((f) => (accept === 'any' || f.kind === accept) && (!folder || f.folder === folder) && (!s || (f.name + ' ' + (f.alt || '')).toLowerCase().includes(s)));
  }, [files, accept, folder, q]);
  if (!open) return null;
  const use = (f) => { if (!f) return; onPick(f.src, f); onClose(); };
  const useUrl = () => {
    const u = url.trim();
    if (!okUrl(u)) { toast('Enter an address starting with https:// or a path starting with /.', { tone: 'error' }); return; }
    onPick(u, null);
    onClose();
  };
  const noun = accept === 'video' ? 'video' : accept === 'any' ? 'file' : 'picture';
  return createPortal(
    <Sheet open title={title || 'Choose a ' + noun} onClose={onClose}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button>
        {tab === 'library' ? <button type="button" className="gc-btn gc-btn--solid" disabled={!sel} onClick={() => use(sel)}>Use this {noun}</button> : null}
        {tab === 'url' ? <button type="button" className="gc-btn gc-btn--solid" disabled={!url.trim()} onClick={useUrl}>Use this address</button> : null}</>}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="fp-tabs" role="tablist" aria-label="Where from">
        {[['library', 'Library'], ['upload', 'Upload'], ['url', 'Web address']].map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>)}
      </div>
      {tab === 'library' ? (<>
        <div className="fp-bar">
          <select className="gc-input gc-select" aria-label="Folder" value={folder} onChange={(e) => setFolder(e.target.value)}>
            <option value="">All folders</option>
            {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <input type="search" className="gc-input" placeholder="Search files" aria-label="Search files" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {!ready ? <div style={{ minHeight: 200 }} aria-busy="true" /> : list.length ? (
          <div className="fl-grid fl-grid--sm">{list.map((f) => <FileTile key={f.id} file={f} selected={sel && sel.id === f.id} onClick={() => setSel(f)} />)}</div>
        ) : <p className="fp-empty">{files.length ? 'Nothing matches.' : 'No files yet.'} <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setTab('upload')}>Upload one</button></p>}
      </>) : null}
      {tab === 'upload' ? (<>
        <div className="fp-up">
          <label className="gc-label" htmlFor="fp-folder">Save into</label>
          <select id="fp-folder" className="gc-input gc-select" value={upFolder} onChange={(e) => setUpFolder(e.target.value)}>{folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select>
        </div>
        <UploadZone folder={upFolder} accept={accept} onDone={(rows) => { const f = rows.find((r) => accept === 'any' || r.kind === accept); if (f) use(f); }} />
      </>) : null}
      {tab === 'url' ? (
        <div className="fp-url">
          <label className="gc-label" htmlFor="fp-url">Address</label>
          <input id="fp-url" className="gc-input" placeholder="https://… or /assets/…" value={url} onChange={(e) => setUrl(e.target.value)} />
          {okUrl(url.trim()) && accept === 'image' ? <img src={url.trim()} alt="" /> : null}
        </div>
      ) : null}
    </Sheet>, document.body);
}

/** The small picture field editors use: preview, file name, Choose / Change, Remove. */
export function ImageField({ id, value, onChange, allowNone = true, folder = 'sections', accept = 'image', label }) {
  const [open, setOpen] = useState(false);
  const { files } = useFiles();
  const f = value ? files.find((x) => x.src === value) : null;
  const name = !value ? 'No ' + (accept === 'video' ? 'video' : 'picture') : f ? f.name : isFileRef(value) ? 'Uploaded file' : value.replace(/^https?:\/\//, '');
  return (
    <div className="fp-field">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <span className="fp-field__img">{value && accept === 'image' ? <FileImg src={value} alt="" /> : <Icon name={accept === 'video' ? 'film' : 'image'} width="20" height="20" aria-hidden="true" />}</span>
      <span className="fp-field__txt" title={name}>{name}</span>
      <span className="fp-field__acts">
        <button id={id} type="button" className="ix-btn ix-btn--sm" aria-label={(value ? 'Change ' : 'Choose ') + (label || 'picture')} onClick={() => setOpen(true)}>{value ? 'Change' : 'Choose'}</button>
        {value && allowNone ? <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={'Remove ' + (label || 'picture')} onClick={() => onChange('')}><Icon name="x" width="16" height="16" aria-hidden="true" /></button> : null}
      </span>
      <FilePicker open={open} onClose={() => setOpen(false)} accept={accept} folder={folder} onPick={(src) => onChange(src)} />
    </div>
  );
}
