'use client';
// FileParts — shared pieces of the file library (Settings › Files and the picker every editor opens):
//   <FileImg src size alt />   draws a library address ('gcfile:' uploads are read from this browser's file store)
//   <FileTile file selected onClick />   a square tile (picture, video or document) with name and size
//   <UploadZone folder onDone accept />  drop files or browse; uploads into a folder, then calls onDone(rows)
//   FILES_CSS (classes fl-*)
// Data: lib/files.js.

import React, { useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { useFileSrc, addFiles, bytes, folders } from '@/lib/files';

export function FileImg({ src, size = 'md', alt = '', ...rest }) {
  const u = useFileSrc(src, size);
  return <img {...rest} alt={alt} src={u || undefined} />;
}

const DOC_ICON = { video: 'film', doc: 'file-text', image: 'image' };
export function FileThumb({ file }) {
  if (file.kind === 'image') return file.thumb && !String(file.thumb).startsWith('gcfile:') ? <img src={file.thumb} alt="" loading="lazy" /> : <FileImg src={file.src} size="md" alt="" loading="lazy" />;
  return <span className="fl-doc"><Icon name={DOC_ICON[file.kind] || 'file'} width="24" height="24" aria-hidden="true" /><small>{(String(file.mime).split('/')[1] || 'file').slice(0, 8).toUpperCase()}</small></span>;
}

export function FileTile({ file, selected, onClick, checkbox, checked, onCheck }) {
  return (
    <div className={'fl-tile' + (selected ? ' is-on' : '') + (checked ? ' is-checked' : '')}>
      <button type="button" className="fl-tile__btn" onClick={onClick} aria-pressed={selected != null ? !!selected : undefined} aria-label={file.name}>
        <span className="fl-tile__img"><FileThumb file={file} /></span>
        <span className="fl-tile__name">{file.name}</span>
        <small className="fl-tile__meta">{[file.w && file.h ? file.w + '×' + file.h : '', file.size ? bytes(file.size) : ''].filter(Boolean).join(' · ') || (file.owner ? 'Saved with a record' : '')}</small>
      </button>
      {checkbox ? <input type="checkbox" className="fl-tile__check" aria-label={'Select ' + file.name} checked={!!checked} onChange={onCheck} /> : null}
      {file.owner ? <span className="fl-tile__lock" title={file.owner.label}><Icon name="link-2" width="12" height="12" aria-hidden="true" /></span> : null}
    </div>
  );
}

const ACCEPT = { image: 'image/*', video: 'video/*', any: 'image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip' };
export function UploadZone({ folder, onDone, accept = 'any', compact, by = '' }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(0);
  const [over, setOver] = useState(false);
  const run = async (list) => {
    const files = Array.prototype.slice.call(list || []);
    if (!files.length) return;
    setBusy(files.length);
    const rows = await addFiles(files, folder || 'sections', by);
    setBusy(0);
    (rows.failed || []).forEach((f) => toast(f.error, { tone: 'error' }));
    if (rows.length) toast(rows.length === 1 ? rows[0].name + ' uploaded' : rows.length + ' files uploaded');
    if (onDone) onDone(rows);
  };
  const fname = (folders().find((f) => f.id === folder) || { name: 'Banners & sections' }).name;
  return (
    <div className={'fl-drop' + (over ? ' is-over' : '') + (compact ? ' is-compact' : '')}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); run(e.dataTransfer && e.dataTransfer.files); }}>
      <input ref={input} type="file" multiple accept={ACCEPT[accept] || ACCEPT.any} hidden onChange={(e) => { run(e.target.files); e.target.value = ''; }} />
      <Icon name={busy ? 'loader' : 'upload'} width="20" height="20" aria-hidden="true" className={busy ? 'fl-spin' : ''} />
      <b>{busy ? `Uploading ${busy} file${busy === 1 ? '' : 's'}…` : 'Drop files here'}</b>
      <span>{busy ? 'Pictures are resized for phones as they upload.' : `or browse · into ${fname} · up to 20 MB each`}</span>
      <button type="button" className="ix-btn" disabled={!!busy} onClick={() => input.current && input.current.click()}>Browse files</button>
    </div>
  );
}

export const FILES_CSS = `
.fl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:var(--space-3)}
.fl-grid--sm{grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:var(--space-2)}
.fl-tile{position:relative;min-width:0}
.fl-tile__btn{display:flex;flex-direction:column;gap:4px;width:100%;padding:6px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;text-align:left;cursor:pointer;color:var(--text-heading)}
.fl-tile__btn:hover{border-color:var(--border-strong)}
.fl-tile.is-on .fl-tile__btn,.fl-tile.is-checked .fl-tile__btn{border-color:var(--primary);box-shadow:0 0 0 2px var(--fill-primary-soft)}
.fl-tile__img{display:grid;place-items:center;aspect-ratio:1/1;border-radius:var(--radius-md);background:var(--surface-subtle);overflow:hidden}
.fl-tile__img img{width:100%;height:100%;object-fit:cover}
.fl-tile__name{font-size:var(--text-xs);font-weight:var(--weight-medium);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fl-tile__meta{font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fl-tile__check{position:absolute;top:12px;left:12px;width:18px;height:18px;margin:0;accent-color:var(--primary)}
.fl-tile__lock{position:absolute;top:12px;right:12px;display:grid;place-items:center;width:22px;height:22px;border-radius:var(--radius-full);background:var(--surface-card);color:var(--text-muted);box-shadow:var(--shadow-card)}
.fl-doc{display:flex;flex-direction:column;align-items:center;gap:4px;color:var(--text-muted)}
.fl-doc small{font-size:var(--text-xs);font-family:var(--font-data)}
.fl-drop{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:180px;padding:var(--space-5);border:1.5px dashed var(--border-strong);border-radius:var(--radius-xl);background:var(--surface-subtle);color:var(--text-muted);text-align:center}
.fl-drop b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.fl-drop span{font-size:var(--text-xs)}
.fl-drop .ix-btn{margin-top:var(--space-2)}
.fl-drop.is-over{border-color:var(--primary);background:var(--fill-primary-soft)}
.fl-drop.is-compact{min-height:0;flex-direction:row;flex-wrap:wrap;justify-content:flex-start;text-align:left;padding:var(--space-3)}
.fl-drop.is-compact .ix-btn{margin:0 0 0 auto}
.fl-spin{animation:fl-spin 1s linear infinite}
@keyframes fl-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.fl-spin{animation:none}}
@media (max-width:640px){.fl-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.fl-grid--sm{grid-template-columns:repeat(3,minmax(0,1fr))}.fl-drop.is-compact .ix-btn{margin:0}}
`;
