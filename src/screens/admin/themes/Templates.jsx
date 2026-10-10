'use client';
// Templates (/admin/themes/templates?id=eid-offer) — the landing page template library: standalone one-page templates
// merchants start a landing page from (Eid offer, Flash sale, Single product COD, Pre-order, Lead form, Webinar, App
// download …). Same patterns as the Theme library: cards with a placeholder thumbnail, status tabs (counts on the tabs),
// a category filter and search; Upload template (front end only, appears as a Draft). A card opens a side panel:
// placeholder preview (Desktop · Tablet · Phone), facts, features, versions, packages, the stores and pages using it,
// and the actions (Release update, Edit info, Disable / Turn on, Deprecate). Data: lib/admin/themes.js (kind 'template').

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { confirmDialog, toast } from '@/runtime/ui';
import { Sheet, StatusBadge, EmptyState } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, KV } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { dmy } from '@/lib/platform/util';
import {
  TEMPLATE_CATEGORIES, STATUSES, PACKAGES, itemsOf, itemById, statusOf, shownVersion, liveVersion, pendingReleaseOf, releasesOf,
  templateUse, logOf, stageLabel, packageLabel, moduleName, setEnabled,
} from '@/lib/admin/themes';
import { AdminShell } from '../AdminShell';
import {
  TH_CSS, useThemes, Skeleton, Thumb, PreviewFrames, StatusTag, Chips, PkgChips, ModChips, Row, when, plural,
  UploadSheet, ReleaseSheet, EditSheet, DeprecateSheet, DisableSheet,
} from './themeShared';

const CSS = `
.tpl-acts{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.tpl-top{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-body)}
.tpl-body{display:flex;flex-direction:column;gap:var(--space-4)}
`;

const TABS = [['all', 'All'], ...STATUSES.map((s) => [s.toLowerCase().replace(/\s+/g, '-'), s])];
const key = (st) => st.toLowerCase().replace(/\s+/g, '-');

function TemplateSheet({ id, close }) {
  const { db, t, data } = useThemes();
  const [mode, setMode] = useState('view');
  const item = itemById(data, id);
  if (!item) return null;
  const back = () => setMode('view');
  if (mode === 'release') return <ReleaseSheet item={item} close={back} />;
  if (mode === 'edit') return <EditSheet item={item} close={back} />;
  if (mode === 'deprecate') return <DeprecateSheet item={item} close={back} />;
  if (mode === 'disable') return <DisableSheet item={item} close={back} />;

  const status = statusOf(data, item);
  const live = liveVersion(data, item.id);
  const pending = pendingReleaseOf(data, item.id);
  const rels = releasesOf(data, item.id);
  const use = templateUse(data, db, item.id);
  const pages = use.reduce((n, u) => n + u.pages.length, 0);
  const log = logOf(data, item.id).slice(0, 5);
  const rep = item.replacement ? itemById(data, item.replacement) : null;
  const off = item.state === 'disabled';
  const enable = async () => {
    if (!(await confirmDialog({ title: `Turn ${item.name} on again?`, body: 'Merchants on its packages can start pages from it again.', confirmLabel: 'Turn on' }))) return;
    const r = setEnabled(item.id, true);
    toast(r.ok ? `${item.name} is on` : r.error);
  };

  return (
    <Sheet open title={item.name} onClose={close} footer={(
      <>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={close}>Close</button>
        {off ? <button type="button" className="gc-btn gc-btn--solid" onClick={enable}>Turn on</button>
          : pending ? <Link className="gc-btn gc-btn--solid" href={'/admin/themes/releases?id=' + pending.id}>Review {pending.version}</Link>
            : <button type="button" className="gc-btn gc-btn--solid" onClick={() => setMode('release')}>Release update</button>}
      </>
    )}>
      <div className="tpl-body">
        <div className="tpl-top">
          <StatusTag status={status} />
          {live ? <span className="thm-chip"><span className="thm-data">{live}</span></span> : null}
          <span>{item.category} · {plural(use.length, 'store')} · {plural(pages, 'page')}</span>
        </div>
        {item.state !== 'active' ? <p className="thm-note thm-note--warn">{off ? 'Disabled' : 'Deprecated'}: {item.stateReason}{rep ? ` · replaced by ${rep.name}` : ''}</p> : null}
        <div className="tpl-acts">
          <button type="button" className="ix-btn ix-btn--sm" onClick={() => setMode('edit')}>Edit info</button>
          {item.state === 'deprecated' ? <button type="button" className="ix-btn ix-btn--sm" onClick={enable}>Bring back</button> : null}
          {item.state === 'active' && live ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => setMode('deprecate')}>Deprecate</button> : null}
          {!off ? <button type="button" className="ix-btn ix-btn--sm ix-btn--danger" onClick={() => setMode('disable')}>Disable</button> : null}
          {pending && !off ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => setMode('release')}>Release update</button> : null}
        </div>

        <PreviewFrames item={item} />

        <div>
          <p className="thm-sec" style={{ marginTop: 0, marginBottom: 6 }}>Features</p>
          {item.tagline ? <p className="thm-small" style={{ marginBottom: 6, fontSize: 'var(--text-sm)' }}>{item.tagline}</p> : null}
          <Chips items={item.features} soft />
        </div>

        <KV rows={[
          ['Live version', live ? <span key="v" className="thm-data">{live}</span> : 'Not published'],
          ['Author', item.author],
          ['File', item.file ? <span key="f" className="thm-data">{item.file}</span> : null],
          ['Created', dmy(item.createdAt)],
          ['Updated', when(item.updatedAt, t)],
          ['Can edit', item.access.edit.join(', ')],
          ['Can publish', item.access.publish.join(', ')],
        ]} />

        <div><p className="thm-sec" style={{ marginTop: 0, marginBottom: 6 }}>Offered on</p><PkgChips ids={item.packages} /></div>
        <div><p className="thm-sec" style={{ marginTop: 0, marginBottom: 6 }}>Works with</p><ModChips codes={item.modules} /></div>

        <div>
          <p className="thm-sec" style={{ marginTop: 0 }}>Versions</p>
          {rels.length ? rels.slice(0, 5).map((r) => (
            <Row key={r.id} title={<><span className="thm-data">{r.version}</span> · {r.notes}</>}
              sub={r.publishedAt ? `Published ${when(r.publishedAt, t)} · ${r.publishedBy}${r.stage === 'rolledback' ? ` · rolled back: ${r.rollbackReason}` : ''}` : `Uploaded ${when(r.uploadedAt, t)} · ${r.uploadedBy}`}
              end={r.version === live ? <StatusBadge tone="success">Live</StatusBadge> : r.stage === 'published' ? null : <StatusBadge tone={r.stage === 'rolledback' ? 'error' : 'neutral'}>{stageLabel(r.stage)}</StatusBadge>} />
          )) : <p className="thm-empty">No versions yet.</p>}
        </div>

        <div>
          <p className="thm-sec" style={{ marginTop: 0 }}>Stores using it · {use.length}</p>
          {use.length ? use.map((u) => (
            <Row key={u.shop.id} title={<Link href={'/admin/merchant?id=' + u.shop.id}>{u.shop.name}</Link>}
              sub={u.pages.map((p) => p.title).join(' · ')}
              end={<span className="thm-muted thm-small">{plural(u.pages.length, 'page')} · <span className="thm-data">{[...new Set(u.pages.map((p) => p.version))].join(', ')}</span></span>} />
          )) : <p className="thm-empty">No store has a page from it yet.</p>}
        </div>

        {log.length ? (
          <div>
            <p className="thm-sec" style={{ marginTop: 0 }}>Latest changes</p>
            {log.map((l) => <Row key={l.id} title={l.text} sub={`${l.by} · ${when(l.at, t)}`} />)}
          </div>
        ) : null}
      </div>
    </Sheet>
  );
}

export default function Templates() {
  const { db, data, ready } = useThemes();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [open, setOpen] = useState(null);
  const [upload, setUpload] = useState(0);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const id = p.get('id');
    if (id) setOpen(id);
    const tb = p.get('tab');
    if (tb && TABS.some((x) => x[0] === tb)) setTab(tb);
  }, []);
  const openId = (id) => {
    setOpen(id);
    try {
      const p = new URLSearchParams(window.location.search);
      if (id) p.set('id', id); else p.delete('id');
      const s = p.toString();
      window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
    } catch { /* ignore */ }
  };

  const header = (
    <ShopHeader icon="layout-template" title="Templates"
      about="Landing page templates merchants start a one-page offer from (Eid offer, flash sale, single product with COD, pre-order, lead form …). Like themes, they are a future module: previews are placeholders. A new template or version goes through Releases, where someone other than the uploader approves it."
      secondary={ready ? [{ label: 'Export', icon: 'download', onClick: () => exportCsv() }] : []}
      more={[{ label: 'New release', href: '/admin/themes/releases' }, { label: 'Theme library', href: '/admin/themes' }]}
      primary={ready ? { label: 'Upload template', icon: 'upload', onClick: () => setUpload(Date.now()) } : null} />
  );

  if (!ready) {
    return (
      <AdminShell active="theme-templates" title="Templates">
        <style dangerouslySetInnerHTML={{ __html: TH_CSS + CSS }} />
        <Skeleton label="Loading templates" header={header} />
      </AdminShell>
    );
  }

  const rows = itemsOf(data, 'template').map((item) => {
    const use = templateUse(data, db, item.id);
    return { item, status: statusOf(data, item), version: shownVersion(data, item), stores: use.length, pages: use.reduce((n, u) => n + u.pages.length, 0), pending: pendingReleaseOf(data, item.id) };
  }).sort((a, b) => b.pages - a.pages || a.item.name.localeCompare(b.item.name));
  const counts = Object.fromEntries(TABS.map(([k]) => [k, k === 'all' ? rows.length : rows.filter((r) => key(r.status) === k).length]));
  const s = q.trim().toLowerCase();
  const shown = rows.filter((r) => (tab === 'all' || key(r.status) === tab) && (!cat || r.item.category === cat)
    && (!s || `${r.item.name} ${r.item.category} ${r.item.features.join(' ')}`.toLowerCase().includes(s)));
  const filtersOn = !!(s || cat);
  const pagesTotal = rows.reduce((n, r) => n + r.pages, 0);
  const storesTotal = new Set(data.pages.map((p) => p.shopId)).size;
  const waiting = data.releases.filter((r) => r.stage === 'review' && (itemById(data, r.itemId) || {}).kind === 'template').length;

  function exportCsv() {
    downloadCsv('gridcommerce-templates.csv', [
      ['Template', 'Category', 'Status', 'Version', 'Stores', 'Pages', 'Packages', 'Modules', 'Updated'],
      ...rows.map((r) => [r.item.name, r.item.category, r.status, r.version, r.stores, r.pages, r.item.packages.map(packageLabel).join('; '), r.item.modules.map(moduleName).join('; '), dmy(r.item.updatedAt)]),
    ]);
    toast('Templates exported');
  }

  return (
    <AdminShell active="theme-templates" title="Templates">
      <style dangerouslySetInnerHTML={{ __html: TH_CSS + CSS }} />
      <div className="ix-page">
        {header}
        <MetricStrip items={[
          { label: 'Landing pages from templates', value: pagesTotal, icon: 'layout-template' },
          { label: 'Stores using templates', value: storesTotal, icon: 'store' },
          { label: 'Waiting for approval', value: waiting, icon: 'hourglass', href: '/admin/themes/releases' },
        ]} />

        <section className="ix-card" aria-label="Templates">
          <div className="ix-bar"><IndexTabs label="Template status" tabs={TABS.map(([k, l]) => ({ key: k, id: 'tpl-tab-' + k, label: l, count: counts[k], on: tab === k, onClick: () => setTab(k) }))} /></div>
          <div className="thm-tools">
            <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search templates" onDone={() => setQ('')} />
            <select className="gc-input gc-select" aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="">All categories</option>
              {TEMPLATE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          {!shown.length ? (
            <div className="ix-empty">
              {filtersOn
                ? <EmptyState title="No templates match." actionLabel="Clear filters" onAction={() => { setQ(''); setCat(''); }} />
                : <EmptyState icon="layout-template" title="No templates in this view." actionLabel="Show all templates" onAction={() => setTab('all')} />}
            </div>
          ) : (
            <ul className="thm-grid" style={{ margin: 0, listStyle: 'none' }}>
              {shown.map(({ item, status, version, stores, pages, pending }) => (
                <li key={item.id} style={{ display: 'flex' }}>
                  <button type="button" className="thm-card" onClick={() => openId(item.id)} aria-label={`${item.name}, ${status}`}>
                    <Thumb item={item} />
                    <span className="thm-card__body">
                      <span className="thm-card__top"><span className="thm-card__name">{item.name}</span><StatusTag status={status} /></span>
                      <span className="thm-card__meta">{item.category} · <span className="thm-data">{version}</span></span>
                      <span className="thm-card__foot">
                        <span>{stores ? `${plural(stores, 'store')} · ${plural(pages, 'page')}` : 'Not used yet'}</span>
                        {pending ? <span className="thm-chip thm-chip--soft"><span className="thm-data">{pending.version}</span> {stageLabel(pending.stage).toLowerCase()}</span> : null}
                      </span>
                      <Chips inline items={PACKAGES.filter((p) => item.packages.includes(p.id)).map((p) => p.short)} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="ix-foot"><span>{plural(shown.length, 'template')}{shown.length !== rows.length ? ` of ${rows.length}` : ''}</span></div>
        </section>
      </div>
      {open ? <TemplateSheet key={open} id={open} close={() => openId(null)} /> : null}
      {upload ? <UploadSheet key={upload} kind="template" close={() => setUpload(0)} onDone={(id) => openId(id)} /> : null}
    </AdminShell>
  );
}
