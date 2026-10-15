'use client';
// Files — Settings › Files (/files): the shop's file library. Every picture, video and document the shop uses: uploads
// (banners, logos, documents) and the photos saved with products, brands and blog posts (shown here, changed on their
// own page). Folders, search, type and sort, grid or list, drag and drop to upload, select many to move or delete.
// A file opens in a side panel: preview, name, alt text (search engines and screen readers read it), folder, details,
// address (copy), where it is used, download, replace (same address, so every page shows the new file) and delete
// (refused while the file is used, unless you confirm). Storage counts against the plan (Settings › Hosting › Usage).
// Data: lib/files.js. Front end only: uploads stay in this browser.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { EmptyState, Sheet, StatusBadge } from '@/components/ui';
import { ShopHeader, IndexTabs, SearchField, KV } from '@/components/ui/IndexKit';
import { toast, confirmDialog } from '@/runtime/ui';
import { formatDate } from '@/lib/format';
import { useFiles, addFiles, usedIn, updateFile, moveFiles, removeFiles, replaceFile, addFolder, renameFolder, deleteFolder, fileUrl, bytes, storageBytes, isFileRef, KINDS } from '@/lib/files';
import { PLAN_LIMITS } from '@/lib/hosting';
import { currentPlanId } from '@/lib/plans';
import { FileTile, FileThumb, FileImg, UploadZone, FILES_CSS } from '@/components/files/FileParts';

const CSS = FILES_CSS + `
.fl-body{padding:var(--space-3)}
.fl-filters select{max-width:200px}
.fl-views{display:inline-flex;gap:2px;padding:2px;border-radius:var(--radius-lg);background:var(--surface-subtle)}
.fl-views button{display:grid;place-items:center;width:32px;height:28px;border:0;border-radius:var(--radius-md);background:none;color:var(--text-muted);cursor:pointer}
.fl-views button[aria-pressed="true"]{background:var(--surface-card);color:var(--text-heading);box-shadow:var(--shadow-card)}
.fl-foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-2);padding:10px 12px;border-top:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-muted)}
.fl-meter{display:flex;align-items:center;gap:var(--space-2)}
.fl-meter i{display:block;width:120px;height:6px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.fl-meter i b{display:block;height:100%;background:var(--primary)}
.fl-thumb{display:grid;place-items:center;width:40px;height:40px;border-radius:var(--radius-md);background:var(--surface-subtle);overflow:hidden}
.fl-thumb img{width:100%;height:100%;object-fit:cover}
.fl-thumb .fl-doc small{display:none}
.fl-name{display:flex;align-items:center;gap:var(--space-3);min-width:0}
.fl-name b{font-weight:var(--weight-medium);color:var(--text-heading);overflow:hidden;text-overflow:ellipsis;max-width:320px}
.fl-dragging .fl-overlay{display:flex}
.fl-overlay{display:none;position:fixed;inset:0;z-index:60;align-items:center;justify-content:center;background:color-mix(in srgb,var(--primary) 12%,transparent);border:3px dashed var(--primary);pointer-events:none;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--primary)}
.fl-prev{display:grid;place-items:center;min-height:200px;max-height:320px;margin-bottom:var(--space-4);border-radius:var(--radius-lg);background:var(--surface-subtle);overflow:hidden}
.fl-prev img,.fl-prev video{max-width:100%;max-height:320px;object-fit:contain}
.fl-form{display:flex;flex-direction:column;gap:var(--space-3)}
.fl-form label{display:flex;flex-direction:column;gap:6px;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.fl-form small{font-weight:var(--weight-regular);color:var(--text-muted);font-size:var(--text-xs)}
.fl-addr{display:flex;gap:var(--space-2)}
.fl-addr input{font-family:var(--font-data);font-size:var(--text-xs)}
.fl-uses{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px;font-size:var(--text-sm)}
.fl-uses a{color:var(--primary);text-decoration:none}
.fl-h{margin:var(--space-4) 0 var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.fl-owner{display:flex;gap:var(--space-2);padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm)}
.fl-acts{display:flex;flex-wrap:wrap;gap:var(--space-2);margin-top:var(--space-4)}
.fl-folders{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:var(--space-2)}
.fl-folders li{display:flex;align-items:center;gap:var(--space-2)}
.fl-folders input{flex:1}
@media (max-width:640px){.fl-filters select{max-width:none;flex:1 1 40%}.fl-name b{max-width:160px}}
`;

const TABS = [['all', 'All files'], ['image', 'Pictures'], ['video', 'Videos'], ['doc', 'Documents'], ['unused', 'Not used']];
const SORTS = [['new', 'Newest first'], ['old', 'Oldest first'], ['name', 'Name A–Z'], ['big', 'Largest first']];
const PAGE = 60;

function useUses(files, n) {
  const [map, setMap] = useState({});
  useEffect(() => {
    const m = {};
    files.forEach((f) => { m[f.id] = f.owner ? [f.owner] : usedIn(f.src); });
    setMap(m);
  }, [n]); // eslint-disable-line react-hooks/exhaustive-deps
  return map;
}

function Detail({ file, uses, folders, onClose }) {
  const [name, setName] = useState(file.name);
  const [alt, setAlt] = useState(file.alt || '');
  const repl = useRef(null);
  const owned = !!file.owner;
  const addr = isFileRef(file.src) ? 'https://cdn.dazzleshop.com.bd/files/' + file.id + (file.kind === 'image' ? '.webp' : '') : file.src.indexOf('data:') === 0 ? '(saved inside the record)' : file.src.indexOf('/') === 0 ? 'https://dazzleshop.com.bd' + file.src : file.src;
  const save = () => {
    if (owned) return;
    const n = name.trim();
    if (!n) { toast('A file needs a name.', { tone: 'error' }); return; }
    updateFile(file.id, { name: n, alt: alt.trim() });
    toast('File saved');
  };
  const copy = async () => { try { await navigator.clipboard.writeText(addr); toast('Address copied'); } catch { toast('Copy it from the box.', { tone: 'error' }); } };
  const download = async () => {
    const u = await fileUrl(file.src, 'full');
    const a = document.createElement('a');
    a.href = u; a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
  };
  const del = async () => {
    const body = uses.length ? `It is used in ${uses.length} place${uses.length === 1 ? '' : 's'} (${uses.slice(0, 3).map((u) => u.label).join(', ')}${uses.length > 3 ? '…' : ''}). Those places will show no picture.` : 'It is not used anywhere.';
    if (!(await confirmDialog({ title: `Delete ${file.name}?`, body, confirmLabel: 'Delete', tone: 'danger' }))) return;
    removeFiles([file.id], true);
    toast(file.name + ' deleted');
    onClose();
  };
  const dirty = !owned && (name !== file.name || alt !== (file.alt || ''));
  return (
    <Sheet open title={file.name} onClose={onClose}
      footer={owned ? <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Close</button> : <><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Close</button><button type="button" className="gc-btn gc-btn--solid" disabled={!dirty} onClick={save}>Save</button></>}>
      <div className="fl-prev">{file.kind === 'image' ? <FileImg src={file.src} size="full" alt={file.alt || ''} /> : <FileThumb file={file} />}</div>
      {owned ? <p className="fl-owner"><Icon name="link-2" width="16" height="16" aria-hidden="true" /><span>Saved with <a href={file.owner.href}>{file.owner.label}</a>. Change or remove it there.</span></p> : null}
      <div className="fl-form">
        <label>Name<input className="gc-input" value={name} disabled={owned} onChange={(e) => setName(e.target.value)} /></label>
        {file.kind === 'image' ? <label>Alt text<input className="gc-input" value={alt} disabled={owned} placeholder="What the picture shows, e.g. Black Galaxy A35 from the back" onChange={(e) => setAlt(e.target.value)} /><small>Search engines, AI answers and screen readers read this.</small></label> : null}
        {!owned ? <label>Folder<select className="gc-input gc-select" value={file.folder || ''} onChange={(e) => { moveFiles([file.id], e.target.value); toast('Moved'); }}><option value="">Unfiled</option>{folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label> : null}
      </div>
      <p className="fl-h">Details</p>
      <KV rows={[['Type', (KINDS[file.kind] || 'File') + ' · ' + (String(file.mime).split('/')[1] || '').toUpperCase()], file.w ? ['Size', file.w + ' × ' + file.h + ' px'] : null, ['File size', file.size ? bytes(file.size) : '—'], ['Added', file.at ? formatDate(file.at) + (file.by ? ' · ' + file.by : '') : '—'], file.replacedAt ? ['Replaced', formatDate(file.replacedAt)] : null].filter(Boolean)} />
      <p className="fl-h">Address</p>
      <div className="fl-addr"><input className="gc-input" readOnly value={addr} aria-label="File address" onFocus={(e) => e.target.select()} /><button type="button" className="ix-btn" onClick={copy}>Copy</button></div>
      <p className="fl-h">Used in · {uses.length}</p>
      {uses.length ? <ul className="fl-uses">{uses.map((u) => <li key={u.label}><a href={u.href}>{u.label}</a></li>)}</ul> : <p className="sfb-muted" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: 0 }}>Not used anywhere yet.</p>}
      {!owned ? (
        <div className="fl-acts">
          {isFileRef(file.src) ? <button type="button" className="ix-btn" onClick={download}><Icon name="download" width="16" height="16" aria-hidden="true" />Download</button> : null}
          {isFileRef(file.src) ? <button type="button" className="ix-btn" onClick={() => repl.current && repl.current.click()}><Icon name="replace" width="16" height="16" aria-hidden="true" />Replace</button> : null}
          <button type="button" className="ix-btn ix-btn--danger" onClick={del}><Icon name="trash-2" width="16" height="16" aria-hidden="true" />Delete</button>
          <input ref={repl} type="file" hidden accept={file.kind === 'image' ? 'image/*' : file.kind === 'video' ? 'video/*' : undefined} onChange={async (e) => {
            const f = e.target.files && e.target.files[0]; e.target.value = '';
            if (!f) return;
            try { await replaceFile(file.id, f); toast('Replaced. Every page using it shows the new file.'); } catch (er) { toast(er.message, { tone: 'error' }); }
          }} />
        </div>
      ) : null}
    </Sheet>
  );
}

function Folders({ open, onClose, folders }) {
  const own = folders.filter((f) => !f.builtIn);
  const [names, setNames] = useState({});
  const [fresh, setFresh] = useState('');
  if (!open) return null;
  return (
    <Sheet open title="Folders" onClose={onClose} footer={<button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Done</button>}>
      <p className="fl-h" style={{ marginTop: 0 }}>Your folders</p>
      {own.length ? <ul className="fl-folders">{own.map((f) => (
        <li key={f.id}>
          <input className="gc-input" aria-label={'Name of ' + f.name} value={names[f.id] != null ? names[f.id] : f.name} onChange={(e) => setNames((x) => ({ ...x, [f.id]: e.target.value }))} onBlur={() => { if (names[f.id] != null && names[f.id].trim() && names[f.id] !== f.name) { renameFolder(f.id, names[f.id]); toast('Folder renamed'); } }} />
          <button type="button" className="ix-btn ix-btn--icon ix-btn--plain" aria-label={'Delete ' + f.name} onClick={async () => { if (await confirmDialog({ title: `Delete ${f.name}?`, body: 'Its files stay in the library, unfiled.', confirmLabel: 'Delete folder', tone: 'danger' })) { deleteFolder(f.id); toast('Folder deleted'); } }}><Icon name="trash-2" width="16" height="16" /></button>
        </li>
      ))}</ul> : <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>None yet. The five built-in folders are always there.</p>}
      <p className="fl-h">New folder</p>
      <div className="fl-addr"><input className="gc-input" aria-label="New folder name" placeholder="e.g. Eid campaign" value={fresh} onChange={(e) => setFresh(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && fresh.trim()) { addFolder(fresh); setFresh(''); toast('Folder added'); } }} /><button type="button" className="ix-btn" disabled={!fresh.trim()} onClick={() => { addFolder(fresh); setFresh(''); toast('Folder added'); }}>Add</button></div>
    </Sheet>
  );
}

export default function Files() {
  const { ready, files, folders, n } = useFiles();
  const uses = useUses(files, n);
  const [tab, setTab] = useState('all');
  const [folder, setFolder] = useState('');
  const [sort, setSort] = useState('new');
  const [q, setQ] = useState('');
  const [view, setView] = useState('grid');
  const [sel, setSel] = useState([]);
  const [open, setOpen] = useState('');
  const [upload, setUpload] = useState(false);
  const [manage, setManage] = useState(false);
  const [drag, setDrag] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const [used, setUsed] = useState(0);
  const [cap, setCap] = useState(0);
  useEffect(() => {
    try { const v = window.localStorage.getItem('gc.files.view'); if (v === 'list' || v === 'grid') setView(v); } catch { /* ignore */ }
    try { const f = new URLSearchParams(window.location.search).get('folder'); if (f) setFolder(f); } catch { /* ignore */ }
  }, []);
  useEffect(() => { setUsed(storageBytes()); setCap(((PLAN_LIMITS[currentPlanId()] || PLAN_LIMITS.business).storage) * 1e9); }, [n]);
  useEffect(() => { setLimit(PAGE); }, [tab, folder, q, sort]);
  const pickView = (v) => { setView(v); try { window.localStorage.setItem('gc.files.view', v); } catch { /* ignore */ } };

  const counts = useMemo(() => ({
    all: files.length, image: files.filter((f) => f.kind === 'image').length, video: files.filter((f) => f.kind === 'video').length,
    doc: files.filter((f) => f.kind === 'doc').length, unused: files.filter((f) => !f.owner && uses[f.id] && !uses[f.id].length).length,
  }), [files, uses]);
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    const l = files.filter((f) => (tab === 'all' || (tab === 'unused' ? !f.owner && uses[f.id] && !uses[f.id].length : f.kind === tab)) && (!folder || (folder === '-' ? !f.folder : f.folder === folder)) && (!s || (f.name + ' ' + (f.alt || '')).toLowerCase().includes(s)));
    const by = { new: (a, b) => (b.at || 0) - (a.at || 0), old: (a, b) => (a.at || 0) - (b.at || 0), name: (a, b) => a.name.localeCompare(b.name), big: (a, b) => (b.size || 0) - (a.size || 0) }[sort];
    return l.sort(by);
  }, [files, uses, tab, folder, q, sort]);
  const page = shown.slice(0, limit);
  const own = (id) => { const f = files.find((x) => x.id === id); return f && !f.owner; };
  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const selOwn = sel.filter(own);
  const upFolder = folder && folder !== '-' ? folder : 'sections';
  const fileOpen = open ? files.find((f) => f.id === open) : null;

  const bulkDelete = async () => {
    const usedOnes = selOwn.filter((id) => (uses[id] || []).length);
    if (!(await confirmDialog({ title: `Delete ${selOwn.length} file${selOwn.length === 1 ? '' : 's'}?`, body: usedOnes.length ? `${usedOnes.length} of them ${usedOnes.length === 1 ? 'is' : 'are'} still used and will be kept. The rest are deleted.` : 'None of them is used anywhere.', confirmLabel: 'Delete', tone: 'danger' }))) return;
    const r = removeFiles(selOwn, false);
    setSel([]);
    toast(`${r.removed.length} deleted` + (r.kept.length ? ` · ${r.kept.length} kept because ${r.kept.length === 1 ? 'it is' : 'they are'} used` : ''));
  };
  const onDrop = async (e) => {
    e.preventDefault(); setDrag(false);
    const list = e.dataTransfer && e.dataTransfer.files;
    if (!list || !list.length) return;
    const rows = await addFiles(list, upFolder);
    (rows.failed || []).forEach((f) => toast(f.error, { tone: 'error' }));
    if (rows.length) toast(rows.length === 1 ? rows[0].name + ' uploaded' : rows.length + ' files uploaded');
  };
  const folderName = (id) => (folders.find((f) => f.id === id) || { name: 'Unfiled' }).name;
  const pct = cap ? Math.min(100, (used / cap) * 100) : 0;

  return (
    <div className={'dc-screen ds' + (drag ? ' fl-dragging' : '')} data-screen="Files"
      onDragOver={(e) => { if (e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files')) { e.preventDefault(); setDrag(true); } }}
      onDragLeave={(e) => { if (!e.relatedTarget) setDrag(false); }} onDrop={onDrop}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="fl-overlay">Drop to upload into {folderName(upFolder)}</div>
      <div className="gc-shell">
        <Sidebar sticky="" active="products-media" />
        <main className="gc-shell__main">
          <Topbar crumb="Settings" page="Files" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader title="Files"
                about="Every picture, video and document your shop uses. Upload banners, logos and documents here; product photos, brand logos and blog covers saved on their own pages are listed too. Pictures are resized for phones as they upload. A file that is used somewhere can't be deleted by mistake."
                secondary={[{ label: 'Folders', onClick: () => setManage(true) }]}
                primary={{ label: 'Upload files', icon: 'upload', onClick: () => setUpload(true) }} />

              <section className="ix-card" aria-label="Files">
                <div className="ix-bar">
                  <IndexTabs label="Show" tabs={TABS.map(([k, l]) => ({ key: k, label: l, count: ready ? counts[k] : null, on: tab === k, onClick: () => setTab(k), id: 'fl-t-' + k }))} />
                </div>
                <div className="ix-filters fl-filters">
                  <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or alt text" onDone={() => setQ('')} />
                  <select className={'ix-filter' + (folder ? ' is-set' : '')} aria-label="Folder" value={folder} onChange={(e) => setFolder(e.target.value)}>
                    <option value="">All folders</option>
                    {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                    <option value="-">Unfiled</option>
                  </select>
                  <select className="ix-filter" aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}>{SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                  <span className="fl-views" role="group" aria-label="View">
                    <button type="button" aria-pressed={view === 'grid'} aria-label="Grid" title="Grid" onClick={() => pickView('grid')}><Icon name="layout-grid" width="16" height="16" aria-hidden="true" /></button>
                    <button type="button" aria-pressed={view === 'list'} aria-label="List" title="List" onClick={() => pickView('list')}><Icon name="list" width="16" height="16" aria-hidden="true" /></button>
                  </span>
                </div>
                {sel.length ? (
                  <div className="ix-bulk">
                    <span className="ix-bulk__n">{sel.length} selected</span>
                    <select className="ix-filter" aria-label="Move selected to" value="" disabled={!selOwn.length} onChange={(e) => { if (!e.target.value) return; moveFiles(selOwn, e.target.value === '-' ? '' : e.target.value); toast(`${selOwn.length} moved to ${folderName(e.target.value)}`); setSel([]); }}>
                      <option value="">Move to…</option>
                      {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                      <option value="-">Unfiled</option>
                    </select>
                    <button type="button" className="ix-btn ix-btn--sm" disabled={!selOwn.length} onClick={bulkDelete}>Delete</button>
                    <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setSel([])}>Clear</button>
                    {selOwn.length < sel.length ? <small style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{sel.length - selOwn.length} saved with a record stay as they are</small> : null}
                  </div>
                ) : null}
                {!ready ? <div style={{ minHeight: 240 }} aria-busy="true" /> : !shown.length ? (
                  <div className="fl-body">
                    {files.length && (q || folder || tab !== 'all')
                      ? <EmptyState icon="search" title="No file matches" actionLabel="Show all files" onAction={() => { setQ(''); setFolder(''); setTab('all'); }} />
                      : <UploadZone folder={upFolder} />}
                  </div>
                ) : view === 'grid' ? (
                  <div className="fl-body">
                    <div className="fl-grid">{page.map((f) => <FileTile key={f.id} file={f} onClick={() => setOpen(f.id)} checkbox checked={sel.includes(f.id)} onCheck={() => toggle(f.id)} />)}</div>
                  </div>
                ) : (
                  <div className="ix-table-wrap gc-table-wrap">
                    <table className="ix-table">
                      <thead><tr><th className="ix-check"><input type="checkbox" aria-label="Select all shown" checked={page.length > 0 && page.every((f) => sel.includes(f.id))} onChange={(e) => setSel(e.target.checked ? page.map((f) => f.id) : [])} /></th><th>File</th><th>Folder</th><th>Type</th><th className="ix-num">Size</th><th>Added</th><th>Used in</th></tr></thead>
                      <tbody>
                        {page.map((f) => (
                          <tr key={f.id} className={sel.includes(f.id) ? 'is-sel' : ''} onClick={() => setOpen(f.id)}>
                            <td className="ix-check" onClick={(e) => e.stopPropagation()}><input type="checkbox" aria-label={'Select ' + f.name} checked={sel.includes(f.id)} onChange={() => toggle(f.id)} /></td>
                            <td><span className="fl-name"><span className="fl-thumb"><FileThumb file={f} /></span><b>{f.name}</b></span></td>
                            <td>{folderName(f.folder)}</td>
                            <td>{KINDS[f.kind] || 'File'}</td>
                            <td className="ix-num">{f.size ? bytes(f.size) : '—'}</td>
                            <td>{f.at ? formatDate(f.at) : '—'}</td>
                            <td>{f.owner ? <StatusBadge tone="neutral">{f.owner.label.split(' · ')[0]}</StatusBadge> : (uses[f.id] || []).length ? (uses[f.id] || []).length + ' place' + ((uses[f.id] || []).length === 1 ? '' : 's') : <span style={{ color: 'var(--text-muted)' }}>Not used</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {ready && shown.length > limit ? <div style={{ padding: '0 var(--space-3) var(--space-3)' }}><button type="button" className="ix-btn" onClick={() => setLimit((x) => x + PAGE)}>Show {Math.min(PAGE, shown.length - limit)} more</button></div> : null}
                {ready ? (
                  <div className="fl-foot">
                    <span>{shown.length} of {files.length} file{files.length === 1 ? '' : 's'}</span>
                    <span className="fl-meter" title="Storage used against your plan (Settings › Hosting › Usage)"><i aria-hidden="true"><b style={{ width: Math.max(1, pct) + '%' }} /></i>{bytes(used)} of {cap ? Math.round(cap / 1e9) + ' GB' : '—'}</span>
                  </div>
                ) : null}
              </section>
            </div>
          </div>
        </main>
      </div>
      {fileOpen ? <Detail key={fileOpen.id + ':' + n} file={fileOpen} uses={uses[fileOpen.id] || []} folders={folders} onClose={() => setOpen('')} /> : null}
      <Sheet open={upload} title="Upload files" onClose={() => setUpload(false)} footer={<button type="button" className="gc-btn gc-btn--neutral" onClick={() => setUpload(false)}>Done</button>}>
        <UploadZone folder={upFolder} onDone={(rows) => { if (rows.length) setUpload(false); }} />
        <p style={{ margin: 'var(--space-3) 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Into {folderName(upFolder)}. Choose a folder in the list first to upload somewhere else.</p>
      </Sheet>
      <Folders open={manage} onClose={() => setManage(false)} folders={folders} />
    </div>
  );
}
