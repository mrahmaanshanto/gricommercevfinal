'use client';
// Website › Media (/admin/website/media) — the website's media library: every file in gridcommerce.net's public/
// folder (brand, product screenshots, photography, integration logos, theme previews, feature pages) plus the
// downloads and videos uploaded for landing pages. Adapted from the merchant panel's Settings › Media (/set-media):
// the type tabs with counts, search and filters (folder, usage, missing alt text), a grid or a list, and a side panel
// per file (preview from the live site, size, pixel size, alt text in English and Bangla, where it is used, move,
// replace, delete when unused). Upload adds the picked files (name, size, pixel size; front end only).
// Data: lib/admin/website2.js (addMedia, setAlt, replaceMedia, moveMedia, deleteMedia).
// Address: ?type=icon&folder=Brand&show=noalt&view=list&q=… ; ?id=M-1001 opens that file.

import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, EmptyState, InfoTip } from '@/components/ui';
import { FilterBar } from '@/components/ui/FilterBar';
import { ShopHeader, IndexTabs, Pager, KV } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { dmy } from '@/lib/platform/util';
import { useAdminStore } from '@/lib/admin/store';
import {
  webStore, MEDIA_TYPES, FOLDERS, mediaCounts, needsAlt, usedLabel, assetUrl, fmtBytes, SITE,
  addMedia, setAlt, replaceMedia, moveMedia, deleteMedia,
} from '@/lib/admin/website2';
import { AdminShell } from '../AdminShell';
import { W2_CSS, Thumb, Field, ctl, Toggle, Skeleton, me, plural, when } from './web2Shared';

const USAGE = [['used', 'Used on the site'], ['unused', 'Not used'], ['noalt', 'Missing alt text']];
const VIEWS = [['grid', 'Grid', 'layout-grid'], ['list', 'List', 'list']];

const CSS = `
.md-right{display:flex;align-items:center;gap:var(--space-2)}
.md-views{display:inline-flex;gap:2px;padding:2px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.md-views button{display:grid;place-items:center;width:32px;height:28px;border:0;border-radius:var(--radius-md);background:none;color:var(--text-muted);cursor:pointer}
.md-views button[aria-pressed="true"]{background:var(--fill-primary-soft);color:var(--primary)}
.md-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:var(--space-3);padding:var(--space-3) var(--space-4) var(--space-4)}
.md-tile{display:flex;flex-direction:column;gap:6px;min-width:0;padding:0;border:0;background:none;text-align:left;font:inherit;color:inherit;cursor:pointer}
.md-tile .w2-thumb{width:100%;height:auto;aspect-ratio:4/3;border-radius:var(--radius-lg)}
.md-tile .w2-thumb img{object-fit:cover}
.md-tile .w2-thumb--icon img{object-fit:contain;padding:14%}
.md-tile:hover .w2-thumb{border-color:var(--border-strong)}
.md-tile:focus-visible{outline:2px solid var(--primary);outline-offset:3px;border-radius:var(--radius-lg)}
.md-tile__name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.md-tile__meta{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;font-size:var(--text-xs);color:var(--text-muted)}
.md-tile__meta .w2-data{font-size:var(--text-xs)}
.md-flag{display:inline-flex;align-items:center;gap:3px;height:20px;padding:0 6px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.md-flag--alt{background:var(--fill-warning-soft);color:var(--text-warning)}
.md-flag--unused{background:var(--surface-subtle);color:var(--text-body)}
.md-file{display:flex;align-items:center;gap:var(--space-3);min-width:0;max-width:340px}
.md-alt{display:flex;flex-wrap:wrap;gap:4px}
.md-prev{display:flex;flex-direction:column;gap:var(--space-2)}
.md-prev__name{margin:0;overflow-wrap:anywhere;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.md-uses{display:flex;flex-direction:column;gap:4px;margin:0;padding:0;list-style:none}
.md-uses a{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-data);font-size:var(--text-sm)}
.md-foot{display:flex;flex-wrap:wrap;gap:var(--space-2);width:100%}
.md-foot .md-sp{flex:1}
.md-drop{display:flex;align-items:center;gap:var(--space-2);margin:var(--space-3) var(--space-4) 0;padding:var(--space-2) var(--space-3);border:1px dashed var(--border-strong);border-radius:var(--radius-lg);font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:640px){
  .md-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2);padding:var(--space-3)}
  .md-drop{display:none}
}
`;

function fromUrl() {
  const p = new URLSearchParams(window.location.search);
  return {
    type: MEDIA_TYPES.some(([k]) => k === p.get('type')) ? p.get('type') : '',
    folder: FOLDERS.includes(p.get('folder')) ? p.get('folder') : '',
    show: USAGE.some(([k]) => k === p.get('show')) ? p.get('show') : '',
    view: p.get('view') === 'list' ? 'list' : 'grid',
    q: p.get('q') || '',
    id: p.get('id') || '',
  };
}
function toUrl(s) {
  const p = new URLSearchParams();
  if (s.type) p.set('type', s.type);
  if (s.folder) p.set('folder', s.folder);
  if (s.show) p.set('show', s.show);
  if (s.view !== 'grid') p.set('view', s.view);
  if (s.q.trim()) p.set('q', s.q.trim());
  if (s.id) p.set('id', s.id);
  const q = p.toString();
  window.history.replaceState(window.history.state, '', window.location.pathname + (q ? '?' + q : ''));
}

/** Pixel size of a picked image file (null for anything else). */
function pixelsOf(file) {
  return new Promise((resolve) => {
    if (!/^image\//.test(file.type)) { resolve(null); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { resolve({ w: img.naturalWidth, h: img.naturalHeight }); URL.revokeObjectURL(url); };
    img.onerror = () => { resolve(null); URL.revokeObjectURL(url); };
    img.src = url;
  });
}
const dims = (m) => (m.w && m.h ? `${m.w}×${m.h}` : '—');
const typeLabel = (k) => (MEDIA_TYPES.find(([x]) => x === k) || [k, k])[1];

export default function Media() {
  const { data, t, live } = useAdminStore(webStore);
  const [ready, setReady] = useState(false);
  const [type, setType] = useState('');
  const [folder, setFolder] = useState('');
  const [show, setShow] = useState('');
  const [view, setView] = useState('grid');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState('');
  const [altDraft, setAltState] = useState(null);   // { id, en, bn, decorative, dirty } while editing
  const upRef = useRef(null);
  const repRef = useRef(null);
  const first = useRef(true);

  useEffect(() => {
    const s = fromUrl();
    setType(s.type); setFolder(s.folder); setShow(s.show); setView(s.view); setQ(s.q); setOpenId(s.id); setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    toUrl({ type, folder, show, view, q, id: openId });
    if (first.current) { first.current = false; return; }
  }, [ready, type, folder, show, view, q, openId]);
  useEffect(() => { setPage(0); }, [type, folder, show, q, view]);

  const media = live ? data.media : [];
  const open = media.find((m) => m.id === openId) || null;
  // the alt text being edited for the open file (starts from what is saved)
  const alt = open ? (altDraft && altDraft.id === open.id ? altDraft : { id: open.id, en: open.alt.en, bn: open.alt.bn, decorative: !!open.decorative, dirty: false }) : null;
  const setAltDraft = (v) => setAltState(v);

  const counts = mediaCounts(media);
  const s = q.trim().toLowerCase();
  const scoped = media.filter((m) => {
    if (folder && m.folder !== folder) return false;
    if (show === 'used' && !m.usedOn.length) return false;
    if (show === 'unused' && m.usedOn.length) return false;
    if (show === 'noalt' && !needsAlt(m)) return false;
    if (s && ![m.name, m.path, m.alt.en, m.alt.bn, m.folder].join(' ').toLowerCase().includes(s)) return false;
    return true;
  });
  const filtered = scoped.filter((m) => !type || m.type === type);
  const per = view === 'grid' ? 48 : 25;
  const pages = Math.max(1, Math.ceil(filtered.length / per));
  const pg = Math.min(page, pages - 1);
  const rows = filtered.slice(pg * per, pg * per + per);
  const filtersOn = !!(s || folder || show);
  const clearFilters = () => { setQ(''); setFolder(''); setShow(''); };

  const tabCount = (k) => scoped.filter((m) => !k || m.type === k).length;
  const tabs = [['', 'All'], ...MEDIA_TYPES].map(([k, label]) => ({ key: k || 'all', id: 'md-tab-' + (k || 'all'), label, count: live ? tabCount(k) : null, on: type === k, onClick: () => setType(k) }));
  const folderCounts = FOLDERS.map((f) => [f, media.filter((m) => m.folder === f).length]).filter(([f, n]) => n || f === 'Uploads');
  const filters = [
    { key: 'folder', label: 'Folder', all: 'All folders', value: folder, options: folderCounts.map(([f, n]) => [f, `${f} (${n})`]), onChange: setFolder },
    { key: 'show', label: 'Usage', all: 'Any usage', value: show, options: USAGE, onChange: setShow },
  ];

  // ---- actions ----
  const upload = async (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    const into = folder || 'Uploads';
    let ok = 0; let lastId = '';
    for (const file of list) {
      const px = await pixelsOf(file);
      const res = addMedia({ name: file.name, size: file.size, w: px && px.w, h: px && px.h, folder: into }, me());
      if (!res.ok) toast(res.error, { tone: 'error' });
      else { ok++; lastId = res.id; }
    }
    if (ok) {
      toast(`${plural(ok, 'file')} added to ${into}. Only the library changes in this demo.`);
      if (ok === 1) setOpenId(lastId);
    }
  };
  const doReplace = async (file) => {
    if (!file || !open) return;
    const px = await pixelsOf(file);
    const res = replaceMedia(open.id, { name: file.name, size: file.size, w: px && px.w, h: px && px.h }, me());
    if (!res.ok) { toast(res.error, { tone: 'error' }); return; }
    toast(`${open.name} replaced. Pages that use it show the new file.`);
  };
  const doDelete = async () => {
    if (!open) return;
    if (open.usedOn.length) {
      toast(`${open.name} is used on ${open.usedOn.length === 1 ? usedLabel(open.usedOn[0]) : open.usedOn.length + ' pages'}. Take it off ${open.usedOn.length === 1 ? 'that page' : 'those pages'} first.`, { tone: 'error' });
      return;
    }
    const yes = await confirmDialog({ title: `Delete ${open.name}?`, body: 'No page uses it. The file is removed from the library and cannot be brought back.', confirmLabel: 'Delete file', tone: 'danger' });
    if (!yes) return;
    const res = deleteMedia(open.id, me());
    if (!res.ok) { toast(res.error, { tone: 'error' }); return; }
    setOpenId('');
    toast(res.name + ' deleted');
  };
  const saveAlt = () => {
    if (!open || !alt) return;
    const res = setAlt(open.id, alt, me());
    if (!res.ok) { toast(res.error, { tone: 'error' }); return; }
    setAltDraft({ ...alt, dirty: false });
    toast('Alt text saved');
  };
  const copy = (text) => {
    try { navigator.clipboard.writeText(text); toast('Address copied'); } catch { toast('Copy failed: select the address and copy it'); }
  };
  const exportCsv = () => {
    if (!filtered.length) { toast('Nothing to export'); return; }
    downloadCsv('gridcommerce-website-media.csv', [
      ['File', 'Address', 'Folder', 'Type', 'Format', 'Bytes', 'Width', 'Height', 'Alt text (English)', 'Alt text (Bangla)', 'Used on', 'Uploaded', 'By'],
      ...filtered.map((m) => [m.name, assetUrl(m.path), m.folder, typeLabel(m.type), m.format, m.size, m.w || '', m.h || '', m.alt.en, m.alt.bn, m.usedOn.map(usedLabel).join(' | '), dmy(m.uploadedAt), m.uploadedBy]),
    ]);
    toast(plural(filtered.length, 'file') + ' exported');
  };

  const flags = (m) => (
    <>
      {needsAlt(m) ? <span className="md-flag md-flag--alt"><Icon name="image-off" width="12" height="12" aria-hidden="true" />No alt text</span> : null}
      {!m.usedOn.length ? <span className="md-flag md-flag--unused">Not used</span> : null}
    </>
  );

  const header = (
    <ShopHeader icon="images" title="Media"
      about="Every image, logo, video and download on gridcommerce.net. Previews load from the live site. Alt text is what screen readers and Google read for an image: write it in English and Bangla. A file that a page uses cannot be deleted; replace it instead and the page shows the new one. Uploads here only change this demo's library."
      secondary={[{ label: 'Export', icon: 'download', onClick: exportCsv }]}
      more={[{ label: 'Show images without alt text', onClick: () => { setShow('noalt'); setType(''); } }, { label: 'Show unused files', onClick: () => setShow('unused') }]}
      primary={{ label: 'Upload', icon: 'upload', onClick: () => upRef.current && upRef.current.click() }} />
  );

  let body;
  if (!live) {
    body = <Skeleton label="Loading the media library" tall />;
  } else {
    const right = (
      <span className="md-right">
        <span className="md-views" role="group" aria-label="Show as">
          {VIEWS.map(([k, label, icon]) => <button key={k} type="button" aria-pressed={view === k} aria-label={label} title={label} onClick={() => setView(k)}><Icon name={icon} width="16" height="16" aria-hidden="true" /></button>)}
        </span>
      </span>
    );
    body = (
      <section className="ix-card" aria-label="Media library">
        <div className="ix-bar"><IndexTabs tabs={tabs} label="File types" /></div>
        <div className="w2-filters">
          <FilterBar label="Filter files" filters={filters} right={right} onClear={() => setQ('')}
            search={{ value: q, onChange: setQ, placeholder: 'Search file name, folder or alt text' }} />
        </div>
        <p className="md-drop"><Icon name="info" width="14" height="14" aria-hidden="true" />{plural(counts.all, 'file')} · {fmtBytes(counts.bytes)} · uploads go to {folder || 'Uploads'}</p>
        {!filtered.length ? (
          <div className="ix-empty">
            {filtersOn || type
              ? <EmptyState title="No files match these filters." actionLabel="Clear filters" onAction={() => { clearFilters(); setType(''); }} />
              : <EmptyState icon="images" title="The library is empty." actionLabel="Upload a file" onAction={() => upRef.current && upRef.current.click()} />}
          </div>
        ) : view === 'grid' ? (
          <ul className="md-grid" aria-label="Files" style={{ listStyle: 'none', margin: 0 }}>
            {rows.map((m) => (
              <li key={m.id} style={{ minWidth: 0 }}>
                <button type="button" className="md-tile" onClick={() => setOpenId(m.id)} aria-label={'Open ' + m.name}>
                  <Thumb m={m} />
                  <span className="md-tile__name" title={m.name}>{m.name}</span>
                  <span className="md-tile__meta"><span>{m.format}</span><span className="w2-data">{fmtBytes(m.size)}</span>{m.w ? <span className="w2-data">{dims(m)}</span> : null}{flags(m)}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <ul className="ix-plist" aria-label="Files">
              {rows.map((m) => (
                <li key={m.id}>
                  <button type="button" className="ix-pitem ix-pitem--thumb" style={{ width: '100%', border: 0, background: 'none', textAlign: 'left', font: 'inherit' }} onClick={() => setOpenId(m.id)}>
                    <Thumb m={m} size={32} />
                    <span className="ix-pitem__top"><b>{m.name}</b><span className="w2-data w2-muted">{fmtBytes(m.size)}</span></span>
                    <span className="ix-pitem__mid">{m.folder} · {m.usedOn.length ? 'Used on ' + plural(m.usedOn.length, 'page') : 'Not used'}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table gc-table--keep">
                <caption className="sr-only">Files</caption>
                <thead>
                  <tr><th scope="col">File</th><th scope="col">Folder</th><th scope="col">Type</th><th scope="col" className="ix-num">Size</th><th scope="col">Pixels</th><th scope="col">Used on</th><th scope="col">Alt text</th><th scope="col">Uploaded</th></tr>
                </thead>
                <tbody>
                  {rows.map((m) => (
                    <tr key={m.id} tabIndex={0} onClick={() => setOpenId(m.id)} onKeyDown={(e) => { if (e.key === 'Enter') setOpenId(m.id); }}>
                      <td><span className="md-file"><Thumb m={m} size={36} /><span className="w2-two"><span className="ix-strong">{m.name}</span><small className="w2-data">/{m.path}</small></span></span></td>
                      <td className="ix-muted ix-nowrap">{m.folder}</td>
                      <td className="ix-muted">{m.format}</td>
                      <td className="ix-num w2-data">{fmtBytes(m.size)}</td>
                      <td className="w2-data ix-muted">{dims(m)}</td>
                      <td className="ix-nowrap">{m.usedOn.length ? (m.usedOn[0] === '*' ? 'Every page' : plural(m.usedOn.length, 'page')) : <span className="ix-muted">Not used</span>}</td>
                      <td>
                        <span className="md-alt">
                          {m.decorative ? <span className="w2-chip">Decorative</span> : needsAlt(m) ? <span className="md-flag md-flag--alt">Missing</span> : (
                            <>{m.alt.en ? <span className="w2-chip">EN</span> : null}{m.alt.bn ? <span className="w2-chip">বাংলা</span> : null}{!m.alt.en && !m.alt.bn ? <span className="ix-muted">—</span> : null}</>
                          )}
                        </span>
                      </td>
                      <td className="ix-muted ix-nowrap">{when(m.uploadedAt, t)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <Pager label={filtered.length ? `${pg * per + 1}–${pg * per + rows.length} of ${filtered.length}` : '0 files'} atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />
      </section>
    );
  }

  return (
    <AdminShell active="web-media" title="Media">
      <style dangerouslySetInnerHTML={{ __html: W2_CSS + CSS }} />
      <div className="ix-page">
        {header}
        {body}
      </div>
      <input ref={upRef} type="file" multiple hidden onChange={(e) => { const f = e.target.files; upload(f).finally(() => { e.target.value = ''; }); }} />
      <input ref={repRef} type="file" hidden onChange={(e) => { const f = e.target.files && e.target.files[0]; doReplace(f).finally(() => { e.target.value = ''; }); }} />

      <Sheet open={!!open} title={open ? open.name : ''} onClose={() => setOpenId('')}
        footer={open ? (
          <span className="md-foot">
            <button type="button" className="gc-btn gc-btn--neutral" onClick={doDelete} aria-disabled={open.usedOn.length ? 'true' : undefined}><Icon name="trash-2" width="16" height="16" aria-hidden="true" />Delete</button>
            <span className="md-sp" />
            <button type="button" className="gc-btn gc-btn--neutral" onClick={() => repRef.current && repRef.current.click()}><Icon name="replace" width="16" height="16" aria-hidden="true" />Replace</button>
            <button type="button" className="gc-btn gc-btn--solid" onClick={saveAlt} disabled={!alt || !alt.dirty}>Save alt text</button>
          </span>
        ) : null}>
        {open && alt ? (
          <div className="w2-form">
            <div className="md-prev">
              <Thumb m={open} big />
              {open.local ? <p className="w2-muted">Uploaded in this browser: the preview shows once a server stores the file.</p> : null}
            </div>
            <KV rows={[
              ['Address', <span key="a" className="w2-copy"><code>{assetUrl(open.path)}</code><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Copy address" onClick={() => copy(assetUrl(open.path))}><Icon name="copy" width="14" height="14" aria-hidden="true" /></button></span>],
              ['Type', typeLabel(open.type) + ' · ' + open.format],
              ['Size', <span key="s" className="w2-data">{fmtBytes(open.size)}</span>],
              ['Pixels', <span key="p" className="w2-data">{dims(open)}</span>],
              ['Uploaded', `${dmy(open.uploadedAt)} · ${open.uploadedBy}${open.replaced ? ' (replaced)' : ''}`],
              ['Source', open.source === 'site' ? "The website's public folder" : 'Uploaded to the library'],
            ]} />
            <Field id="md-folder" label="Folder">
              <select id="md-folder" {...ctl(false, true)} value={open.folder} onChange={(e) => { const r = moveMedia(open.id, e.target.value, me()); if (r.ok) toast(`Moved to ${e.target.value}`); }}>
                {FOLDERS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>

            <h3 className="w2-sec">Alt text <InfoTip text="One short sentence saying what the picture shows, for screen readers and Google Images. Logos: the brand's name. Leave it empty only for a decorative picture." /></h3>
            {open.type === 'document' ? <p className="w2-muted">Documents need no alt text: their link text describes them.</p> : (
              <>
                <Toggle on={alt.decorative} onChange={(v) => setAltDraft({ ...alt, decorative: v, dirty: true })} label="Decorative picture" hint="Screen readers skip it; no alt text needed" />
                {!alt.decorative ? (
                  <>
                    <Field id="md-alt-en" label="English" error={needsAlt({ ...open, alt: { en: alt.en }, decorative: alt.decorative }) && !alt.en.trim() ? 'Used on a live page: add alt text.' : ''}>
                      <textarea id="md-alt-en" {...ctl(false)} rows={2} maxLength={250} value={alt.en} onChange={(e) => setAltDraft({ ...alt, en: e.target.value, dirty: true })} placeholder="What the picture shows" />
                    </Field>
                    <Field id="md-alt-bn" label="Bangla">
                      <textarea id="md-alt-bn" {...ctl(false)} className="gc-input w2-bn" rows={2} maxLength={250} value={alt.bn} onChange={(e) => setAltDraft({ ...alt, bn: e.target.value, dirty: true })} placeholder="ছবিতে কী আছে" />
                    </Field>
                  </>
                ) : null}
              </>
            )}

            <h3 className="w2-sec">Where it is used</h3>
            {open.usedOn.length ? (
              <ul className="md-uses">
                {open.usedOn.map((p) => (
                  <li key={p}>{p === '*'
                    ? <span>Every page (header, footer or the final call to action)</span>
                    : <a href={SITE + (p === '/' ? '' : p)} target="_blank" rel="noreferrer">{p}<Icon name="external-link" width="12" height="12" aria-hidden="true" /></a>}</li>
                ))}
              </ul>
            ) : <p className="w2-muted">No page uses this file, so it can be deleted.</p>}
          </div>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
