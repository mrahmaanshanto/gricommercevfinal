'use client';
// Theme library (/admin/themes?tab=published&category=Fashion) — every storefront theme GridCommerce offers, as cards:
// a placeholder thumbnail in the theme's accent, name, category and family, the live version, status, how many stores
// use it and the packages it is offered on. Tabs by status (counts on the tabs), a category and a family filter.
// Upload theme opens a side panel (front end only: the .zip's name is kept; the theme appears as a Draft and goes
// through Releases). A card opens the theme (/admin/themes/view?id=). Merchant editing (Planned) sets what merchants
// will be able to change in new themes. Themes are a future module: no theme is rendered, previews are placeholders.
// Data: lib/admin/themes.js (statusOf, shownVersion, usageCount, librarySummary, uploadItem).

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from '@/runtime/ui';
import { EmptyState } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { dmy } from '@/lib/platform/util';
import {
  CATEGORIES, FAMILIES, PACKAGES, STATUSES, itemsOf, statusOf, shownVersion, usageCount, pendingReleaseOf, librarySummary,
  familyName, stageLabel, moduleName, packageLabel,
} from '@/lib/admin/themes';
import { AdminShell } from '../AdminShell';
import { TH_CSS, useThemes, Skeleton, Thumb, StatusTag, Chips, MerchantEditing, UploadSheet, plural } from './themeShared';

const CSS = `
.thl-fam{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:var(--space-3);padding:0 var(--space-5) var(--space-5)}
.thl-fam button{display:flex;flex-direction:column;gap:2px;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;text-align:left;cursor:pointer}
.thl-fam button:hover{border-color:var(--border-strong)}
.thl-fam b{display:flex;align-items:center;gap:6px;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.thl-fam i{width:10px;height:10px;border-radius:var(--radius-full)}
.thl-fam small{font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:640px){.thl-fam{padding:0 var(--space-3) var(--space-3)}}
`;

const TABS = [['all', 'All'], ...STATUSES.map((s) => [s.toLowerCase().replace(/\s+/g, '-'), s])];
const shortPkg = (ids) => PACKAGES.filter((p) => ids.includes(p.id)).map((p) => p.short);

export default function ThemeLibrary() {
  const { db, data, ready } = useThemes();
  const router = useRouter();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [fam, setFam] = useState('');
  const [upload, setUpload] = useState(0);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const tb = p.get('tab');
    if (tb && TABS.some((x) => x[0] === tb)) setTab(tb);
    const c = p.get('category');
    if (c && CATEGORIES.includes(c)) setCat(c);
    const f = p.get('family');
    if (f && FAMILIES.some((x) => x.id === f)) setFam(f);
  }, []);
  const go = (k) => {
    setTab(k);
    try {
      const p = new URLSearchParams(window.location.search);
      if (k === 'all') p.delete('tab'); else p.set('tab', k);
      const s = p.toString();
      window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
    } catch { /* ignore */ }
  };

  const header = (
    <ShopHeader icon="palette" title="Theme library"
      about="The storefront themes merchants can pick. Themes are a future module: the files, the renderer and the builder are not built yet, so previews are placeholders. Upload a theme as a draft, send it for review on Releases (a second person approves it), choose the packages it is offered on, and see which stores use it."
      secondary={ready ? [{ label: 'Export', icon: 'download', onClick: () => exportCsv() }] : []}
      more={[{ label: 'Releases', href: '/admin/themes/releases' }, { label: 'Assignments', href: '/admin/themes/assignments' }, { label: 'Templates', href: '/admin/themes/templates' }]}
      primary={ready ? { label: 'Upload theme', icon: 'upload', onClick: () => setUpload(Date.now()) } : null} />
  );

  if (!ready) {
    return (
      <AdminShell active="themes" title="Theme library">
        <style dangerouslySetInnerHTML={{ __html: TH_CSS + CSS }} />
        <Skeleton label="Loading themes" header={header} />
      </AdminShell>
    );
  }

  const rows = itemsOf(data, 'theme').map((item) => ({
    item, status: statusOf(data, item), version: shownVersion(data, item), using: usageCount(data, db, item), pending: pendingReleaseOf(data, item.id),
  })).sort((a, b) => b.using - a.using || a.item.name.localeCompare(b.item.name));
  const key = (st) => st.toLowerCase().replace(/\s+/g, '-');
  const counts = Object.fromEntries(TABS.map(([k]) => [k, k === 'all' ? rows.length : rows.filter((r) => key(r.status) === k).length]));
  const s = q.trim().toLowerCase();
  const shown = rows.filter((r) => (tab === 'all' || key(r.status) === tab) && (!cat || r.item.category === cat) && (!fam || r.item.family === fam)
    && (!s || `${r.item.name} ${r.item.category} ${familyName(r.item.family)} ${r.item.features.join(' ')}`.toLowerCase().includes(s)));
  const sum = librarySummary(data, db);
  const filtersOn = !!(s || cat || fam);

  function exportCsv() {
    downloadCsv('gridcommerce-themes.csv', [
      ['Theme', 'Category', 'Family', 'Status', 'Version', 'Stores', 'Packages', 'Modules', 'Author', 'Updated'],
      ...rows.map((r) => [r.item.name, r.item.category, familyName(r.item.family), r.status, r.version, r.using, r.item.packages.map(packageLabel).join('; '), r.item.modules.map(moduleName).join('; '), r.item.author, dmy(r.item.updatedAt)]),
    ]);
    toast('Themes exported');
  }

  return (
    <AdminShell active="themes" title="Theme library">
      <style dangerouslySetInnerHTML={{ __html: TH_CSS + CSS }} />
      <div className="ix-page">
        {header}
        <MetricStrip items={[
          { label: 'Online stores on a theme', value: `${sum.withTheme} of ${sum.stores}`, icon: 'store' },
          { label: 'Waiting for approval', value: sum.inReview, icon: 'hourglass', href: '/admin/themes/releases' },
          { label: 'Stores on an older version', value: sum.behind, icon: 'history', href: '/admin/themes/assignments?view=behind' },
          { label: 'Stores on a retired theme', value: sum.onDeprecated, icon: 'archive', href: '/admin/themes/assignments?view=retired' },
        ]} />

        <section className="ix-card" aria-label="Themes">
          <div className="ix-bar"><IndexTabs label="Theme status" tabs={TABS.map(([k, l]) => ({ key: k, id: 'thl-tab-' + k, label: l, count: counts[k], on: tab === k, onClick: () => go(k) }))} /></div>
          <div className="thm-tools">
            <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search themes or features" onDone={() => setQ('')} />
            <select className="gc-input gc-select" aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select className="gc-input gc-select" aria-label="Family" value={fam} onChange={(e) => setFam(e.target.value)}>
              <option value="">All families</option>
              {FAMILIES.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          {!shown.length ? (
            <div className="ix-empty">
              {filtersOn
                ? <EmptyState title="No themes match." actionLabel="Clear filters" onAction={() => { setQ(''); setCat(''); setFam(''); }} />
                : <EmptyState icon="palette" title="No themes in this view." actionLabel="Show all themes" onAction={() => go('all')} />}
            </div>
          ) : (
            <ul className="thm-grid" style={{ margin: 0, listStyle: 'none' }}>
              {shown.map(({ item, status, version, using, pending }) => (
                <li key={item.id} style={{ display: 'flex' }}>
                  <Link href={'/admin/themes/view?id=' + item.id} className="thm-card">
                    <Thumb item={item} />
                    <span className="thm-card__body">
                      <span className="thm-card__top"><span className="thm-card__name">{item.name}</span><StatusTag status={status} /></span>
                      <span className="thm-card__meta">{item.category} · {familyName(item.family)} · <span className="thm-data">{version}</span></span>
                      <span className="thm-card__foot">
                        <span>{using ? plural(using, 'store') : 'No stores yet'}</span>
                        {pending ? <span className="thm-chip thm-chip--soft"><span className="thm-data">{pending.version}</span> {stageLabel(pending.stage).toLowerCase()}</span> : null}
                      </span>
                      <Chips items={shortPkg(item.packages)} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="ix-foot"><span>{plural(shown.length, 'theme')}{shown.length !== rows.length ? ` of ${rows.length}` : ''}</span></div>
        </section>

        <details className="gc-disclose ix-card">
          <summary>Theme families on gridcommerce.net</summary>
          <div className="thl-fam">
            {FAMILIES.map((f) => {
              const n = rows.filter((r) => r.item.family === f.id).length;
              return (
                <button key={f.id} type="button" onClick={() => { setFam(f.id); go('all'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  <b><i style={{ background: f.accent }} aria-hidden="true" />{f.name}<span className="thm-muted" style={{ fontWeight: 'var(--weight-regular)' }}>· {plural(n, 'theme')}</span></b>
                  <small>{f.label} · {f.tagline}</small>
                </button>
              );
            })}
          </div>
        </details>

        <MerchantEditing data={data} />
      </div>
      {upload ? <UploadSheet key={upload} kind="theme" close={() => setUpload(0)} onDone={(id) => router.push('/admin/themes/view?id=' + id)} /> : null}
    </AdminShell>
  );
}
