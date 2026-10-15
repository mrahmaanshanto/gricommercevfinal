'use client';
// Hosting › Speed & cache, Files & verification, Backups.
//   Speed    page and image cache times, clear the cache (everything or some addresses), image formats, size and
//            quality, compression, HTTP/3, and a speed test of the store home on a 3G phone with its history.
//   Files    site-verification codes (the storefront head carries them) and files served from the domain's root.
//   Backups  website and settings backups kept in this browser (back up, download, upload, restore, delete; a backup of
//            the current state is made before a restore) and GridCommerce's nightly backups (restore = a request).

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, StatusBadge } from '@/components/ui';
import {
  speedOf, saveSpeed, purgeCache, runSpeedTest, testRunning, filesOf, saveMeta, saveFile, deleteFile, META_TAGS, FILE_TEMPLATES,
  getBackups, backUpNow, deleteBackup, restoreBackup, backupFile, addBackupFile, dailyBackups, restoreRequests, requestRestore, BACKUP_PARTS,
} from '@/lib/hosting';
import { currentUser } from '@/lib/team';
import { Card, SwitchRow, done, download, fmtWhen, fmtDate, fmtSize } from './hsShared';

const PAGE_TTL = [[0, 'Off'], [60, '1 minute'], [300, '5 minutes'], [3600, '1 hour']];
const ASSET_TTL = [[86400, '1 day'], [604800, '7 days'], [2592000, '30 days'], [31536000, '1 year']];
const grade = (k, v) => (k === 'lcp' ? (v <= 2.5 ? 'success' : v <= 4 ? 'warning' : 'error') : k === 'ttfb' ? (v <= 0.8 ? 'success' : 'warning') : k === 'cls' ? (v <= 0.1 ? 'success' : 'warning') : v >= 90 ? 'success' : v >= 50 ? 'warning' : 'error');
const who = () => (currentUser() || {}).name || 'You';

export function HostingSpeed({ now }) {
  const s = speedOf();
  const [purge, setPurge] = useState('');
  const [purgeErr, setPurgeErr] = useState('');
  const [num, setNum] = useState({});
  const put = (patch, msg = 'Saved') => done(saveSpeed(patch), msg);
  const last = s.tests[0];
  const running = testRunning(last, now);
  const blurNum = (k) => { if (num[k] == null) return; const v = Number(num[k]); if (v !== s[k] && !put({ [k]: v })) return; setNum({ ...num, [k]: undefined }); };
  return (
    <>
      <Card title="Speed test" id="hs-test" sub="The store home on a 3G phone in Dhaka, like most of your customers."
        actions={<button type="button" className="ix-btn ix-btn--sm ix-btn--primary" disabled={running} onClick={() => done(runSpeedTest(), 'Testing… this takes a few seconds')}>{running ? 'Testing…' : 'Run test'}</button>}>
        {last && !running ? (
          <div className="hs-figs">
            {[['score', 'Score', last.score, ''], ['lcp', 'Main content shows', last.lcp, ' s'], ['ttfb', 'First reply', last.ttfb, ' s'], ['cls', 'Layout shift', last.cls, '']].map(([k, l, v, u]) => (
              <div key={k} className="hs-fig"><small>{l}</small><span className="hs-big">{v}{u}</span><StatusBadge tone={grade(k, v)}>{grade(k, v) === 'success' ? 'Good' : grade(k, v) === 'warning' ? 'Needs work' : 'Slow'}</StatusBadge></div>
            ))}
          </div>
        ) : running ? <p className="hs-sub">Loading the store on a slow phone…</p> : <p className="hs-sub">No test yet.</p>}
        {s.tests.length > 1 ? <p className="hs-sub">Earlier: {s.tests.slice(1, 5).map((x) => `${x.score} (${fmtWhen(x.at)})`).join(' · ')}</p> : null}
      </Card>

      <Card title="Cache" id="hs-cache" sub="Pages and images are kept on GridCommerce’s servers in Dhaka, Singapore and Mumbai, close to your customers.">
        <div className="hs-row"><span className="hs-row__text">Keep pages for<small>Prices and stock still update at once.</small></span>
          <select className="gc-input gc-select" aria-label="Keep pages for" value={s.pageTtl} onChange={(e) => put({ pageTtl: Number(e.target.value) })}>{PAGE_TTL.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
        <div className="hs-row"><span className="hs-row__text">Browsers keep images for</span>
          <select className="gc-input gc-select" aria-label="Browsers keep images for" value={s.assetTtl} onChange={(e) => put({ assetTtl: Number(e.target.value) })}>{ASSET_TTL.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
        <div className="hs-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <span className="hs-row__text">Clear the cache<small>After a big change, so everyone sees it now.</small></span>
          <textarea className="gc-input" rows={2} aria-label="Addresses to clear" placeholder={'/store\n/product?handle=galaxy-a15-6-128gb'} value={purge} onChange={(e) => { setPurge(e.target.value); setPurgeErr(''); }} />
          {purgeErr ? <p className="hs-err" role="alert">{purgeErr}</p> : null}
          <div className="hs-acts">
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => { const r = purgeCache(purge); if (r.ok === false) { setPurgeErr(r.error); return; } setPurge(''); toast('Cleared. The next visit loads fresh.'); }}>Clear these addresses</button>
            <button type="button" className="ix-btn ix-btn--sm" onClick={async () => { if (await confirmDialog({ title: 'Clear the whole cache?', body: 'The store is a little slower for a few minutes while the cache fills again.', confirmLabel: 'Clear everything' })) done(purgeCache('all'), 'The whole cache is cleared'); }}>Clear everything</button>
          </div>
          {s.purges.length ? <p className="hs-sub">Last cleared {fmtWhen(s.purges[0].at)}: {s.purges[0].what.join(', ')}</p> : null}
        </div>
      </Card>

      <Card title="Images" id="hs-img">
        <SwitchRow label="WebP" help="Smaller images for every modern browser." on={s.webp} onChange={(v) => put({ webp: v })} />
        <SwitchRow label="AVIF" help="Even smaller, for browsers that support it. Takes longer the first time an image is shown." on={s.avif} onChange={(v) => put({ avif: v })} />
        <div className="hs-row"><span className="hs-row__text">Largest width (px)<small>Bigger photos are made smaller.</small></span>
          <input className="gc-input" inputMode="numeric" aria-label="Largest image width" value={num.maxWidth ?? s.maxWidth} onChange={(e) => setNum({ ...num, maxWidth: e.target.value.replace(/\D/g, '') })} onBlur={() => blurNum('maxWidth')} /></div>
        <div className="hs-row"><span className="hs-row__text">Quality (40–100)<small>80 looks the same as the original on a phone.</small></span>
          <input className="gc-input" inputMode="numeric" aria-label="Image quality" value={num.quality ?? s.quality} onChange={(e) => setNum({ ...num, quality: e.target.value.replace(/\D/g, '') })} onBlur={() => blurNum('quality')} /></div>
      </Card>

      <Card title="Delivery" id="hs-deliv">
        <SwitchRow label="Brotli compression" help="Pages and scripts travel about 20% smaller than with gzip." on={s.brotli} onChange={(v) => put({ brotli: v })} />
        <SwitchRow label="HTTP/3" help="Faster on mobile networks that drop packets." on={s.http3} onChange={(v) => put({ http3: v })} />
      </Card>
    </>
  );
}

export function HostingFiles() {
  const f = filesOf();
  const [meta, setMeta] = useState(null);
  const [edit, setEdit] = useState(null);     // { path, body, old, err, field }
  const m = meta || f.meta;
  const saveTags = () => { const r = saveMeta(m); if (r.ok === false) { toast(r.error, { tone: 'error' }); return; } toast('Verification codes saved. They are in your store’s head now.'); setMeta(null); };
  const saveF = () => { const r = saveFile(edit, edit.old); if (r.ok === false) { setEdit({ ...edit, err: r.error, field: r.field }); return; } toast('File saved'); setEdit(null); };
  return (
    <>
      <Card title="Site verification" id="hs-verify" sub="Paste the code from each service. The store’s pages carry it as a meta tag. You can also verify with a DNS record (DNS tab).">
        {META_TAGS.map(([k, label, name]) => (
          <div key={k}><label className="gc-label" htmlFor={'hs-m-' + k}>{label} <span className="hs-sub">({name})</span></label>
            <input id={'hs-m-' + k} className="gc-input" value={m[k] || ''} onChange={(e) => setMeta({ ...m, [k]: e.target.value })} /></div>
        ))}
        {meta ? <div className="hs-acts"><button type="button" className="ix-btn ix-btn--primary" onClick={saveTags}>Save codes</button><button type="button" className="ix-btn" onClick={() => setMeta(null)}>Discard</button></div> : null}
      </Card>

      <Card title="Files at your domain’s root" id="hs-files" sub="Served at your address, like dazzleshop.com.bd/ads.txt."
        actions={<button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => setEdit({ path: '', body: '', old: '', err: '' })}><Icon name="plus" width="14" height="14" aria-hidden="true" />Add file</button>}>
        <div className="hs-list">
          {f.list.map((x) => (
            <div key={x.path} className="hs-row">
              <span className="hs-row__text" style={{ fontFamily: 'var(--font-data)' }}>{x.path}<small style={{ fontFamily: 'var(--font-sans)' }}>{fmtSize(x.body.length)} · changed {fmtDate(x.at)}</small></span>
              <span className="hs-acts">
                <button type="button" className="ix-btn ix-btn--sm" onClick={() => setEdit({ path: x.path, body: x.body, old: x.path, err: '' })}>Edit</button>
                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label={'Delete ' + x.path} title="Delete" onClick={async () => { if (await confirmDialog({ title: 'Delete ' + x.path + '?', body: 'Anything that reads it gets “not found”.', confirmLabel: 'Delete file', tone: 'danger' })) done(deleteFile(x.path), 'File deleted'); }}><Icon name="trash-2" width="14" height="14" aria-hidden="true" /></button>
              </span>
            </div>
          ))}
          {!f.list.length ? <p className="hs-sub">No files yet.</p> : null}
        </div>
        <p className="hs-sub">robots.txt and the sitemap are made in <Link href="/seo?tab=robots" className="bl-link">Online Store › SEO</Link>.</p>
      </Card>

      <Sheet open={!!edit} title={edit && edit.old ? 'Edit file' : 'Add file'} onClose={() => setEdit(null)}
        footer={edit ? <><button type="button" className="gc-btn gc-btn--neutral" style={{ marginRight: 'auto' }} onClick={() => setEdit(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={saveF}>Save file</button></> : null}>
        {edit ? (
          <div className="hs-form">
            {!edit.old ? (
              <div><span className="gc-label">Start from</span>
                <div className="hs-chips">{FILE_TEMPLATES.map((t) => <button key={t.path} type="button" className="hs-chip" aria-pressed={edit.path === t.path} title={t.help} onClick={() => setEdit({ ...edit, path: t.path, body: t.body, err: '' })}>{t.path.replace('/.well-known/', '…/')}</button>)}</div></div>
            ) : null}
            <div><label className="gc-label" htmlFor="hs-f-path">Address</label><input id="hs-f-path" className="gc-input" style={{ fontFamily: 'var(--font-data)' }} placeholder="/ads.txt" aria-invalid={edit.field === 'path' || undefined} value={edit.path} onChange={(e) => setEdit({ ...edit, path: e.target.value, err: '' })} /></div>
            <div><label className="gc-label" htmlFor="hs-f-body">Content</label><textarea id="hs-f-body" className="gc-input" rows={8} style={{ fontFamily: 'var(--font-data)' }} aria-invalid={edit.field === 'body' || undefined} value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value, err: '' })} /></div>
            {edit.err ? <p className="hs-err" role="alert">{edit.err}</p> : null}
          </div>
        ) : null}
      </Sheet>
    </>
  );
}

export function HostingBackups({ now }) {
  const list = getBackups();
  const daily = dailyBackups(now);
  const reqs = restoreRequests();
  const file = useRef(null);
  const restore = async (b) => {
    if (!(await confirmDialog({ title: 'Restore this backup?', body: `The website and settings go back to ${fmtWhen(b.at)}. A backup of how things are now is made first, so you can undo this.`, confirmLabel: 'Restore' }))) return;
    if (done(restoreBackup(b.id, who()), 'Restored. Reload other open tabs to see it.')) window.dispatchEvent(new CustomEvent('gc:storefront'));
  };
  const upload = (ev) => {
    const f = ev.target.files && ev.target.files[0];
    ev.target.value = '';
    if (!f) return;
    if (f.size > 4e6) { toast('That file is too big for a backup.', { tone: 'error' }); return; }
    f.text().then((t) => done(addBackupFile(t, who()), 'Backup added. Restore it from the list.'));
  };
  return (
    <>
      <Card title="Website backups" id="hs-bk" sub={'Holds: ' + BACKUP_PARTS.map((p, i) => (i ? p[1][0].toLowerCase() + p[1].slice(1) : p[1])).join(', ') + '. The newest 4 are kept.'}
        actions={<span className="hs-acts">
          <button type="button" className="ix-btn ix-btn--sm" onClick={() => file.current && file.current.click()}>Upload</button>
          <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => done(backUpNow(who()), 'Backup made')}>Back up now</button>
        </span>}>
        <input ref={file} type="file" accept="application/json,.json" hidden onChange={upload} />
        <div className="hs-list">
          {list.map((b) => (
            <div key={b.id} className="hs-row">
              <span className="hs-row__text">{b.label}<small>{fmtWhen(b.at)} · {fmtSize(b.size)} · {b.by}</small></span>
              <span className="hs-acts">
                <button type="button" className="ix-btn ix-btn--sm" onClick={() => restore(b)}>Restore</button>
                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Download" title="Download" onClick={() => download('gridcommerce-backup-' + new Date(b.at).toISOString().slice(0, 10) + '.json', backupFile(b), 'application/json')}><Icon name="download" width="14" height="14" aria-hidden="true" /></button>
                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Delete" title="Delete" onClick={async () => { if (await confirmDialog({ title: 'Delete this backup?', confirmLabel: 'Delete backup', tone: 'danger' })) done(deleteBackup(b.id), 'Backup deleted'); }}><Icon name="trash-2" width="14" height="14" aria-hidden="true" /></button>
              </span>
            </div>
          ))}
          {!list.length ? <p className="hs-sub">No backup yet. Make one before a big change, like a new theme.</p> : null}
        </div>
      </Card>

      <Card title="Nightly backups by GridCommerce" id="hs-daily" sub="Everything (products, orders, customers, money and the website) at 3 AM every night, kept for 30 days.">
        <div className="hs-list">
          {daily.map((d) => {
            const asked = reqs.find((r) => r.backupAt === d.at);
            return (
              <div key={d.id} className="hs-row">
                <span className="hs-row__text">{fmtWhen(d.at)}<small>{d.sizeMB} MB</small></span>
                {asked ? <StatusBadge tone="info">Restore asked {fmtWhen(asked.at)}</StatusBadge> : (
                  <button type="button" className="ix-btn ix-btn--sm" onClick={async () => { if (await confirmDialog({ title: 'Ask GridCommerce to restore this backup?', body: 'The whole shop goes back to ' + fmtWhen(d.at) + '. Orders and sales after that are lost. Support calls you to confirm before anything changes.', confirmLabel: 'Ask to restore', tone: 'danger' })) done(requestRestore(d.at, who()), 'Asked. GridCommerce support calls you to confirm.'); }}>Ask to restore</button>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}
