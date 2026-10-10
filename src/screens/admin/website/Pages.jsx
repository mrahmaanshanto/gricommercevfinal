'use client';
// Pages (/admin/website/pages) — every page of gridcommerce.net, as its code has them (the routes in the website's
// src/app, with the title and description each page.tsx passes to buildMetadata). One card: status tabs with counts,
// a type filter and search, then a compact table (cards on phones). A row opens the page (/admin/website/pages/view?path=).
// The tab, type and search live in the address (?tab=In%20review&type=Feature&q=courier), read after mount.
// Data: lib/admin/website.js (websitePages, pageOf).

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from '@/runtime/ui';
import { EmptyState } from '@/components/ui';
import { FilterBar } from '@/components/ui/FilterBar';
import { ShopHeader, IndexTabs, Pager } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { dmy } from '@/lib/platform/util';
import { websitePages, sortPages, pageOf, STATUSES, TYPES, LIVE_HOST, SOURCE_COMMIT } from '@/lib/admin/website';
import { AdminShell } from '../AdminShell';
import { WEB_CSS, useWeb, when, StatusTag, Who, plural } from './webShared';

const PAGE = 25;
const TABS = [['all', 'All'], ...STATUSES.map((s) => [s, s])];
const CSS = `
.wp-filters{padding:8px;border-bottom:1px solid var(--border-subtle)}
.wp-filters .gc-filterbar__search{max-width:320px}
.ix-table tbody tr{cursor:pointer}
.ix-table tbody tr:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.wp-type{white-space:nowrap}
.wp-foot{display:inline-flex;flex-wrap:wrap;gap:4px var(--space-3)}
.wp-foot .wb-src{white-space:nowrap}
`;

const href = (path) => '/admin/website/pages/view?path=' + encodeURIComponent(path);

export default function Pages() {
  const router = useRouter();
  const { t, live } = useWeb();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('all');
  const [type, setType] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (TABS.some(([k]) => k === p.get('tab'))) setTab(p.get('tab'));
    if (TYPES.includes(p.get('type'))) setType(p.get('type'));
    setQ(p.get('q') || '');
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const p = new URLSearchParams();
    if (tab !== 'all') p.set('tab', tab);
    if (type) p.set('type', type);
    if (q.trim()) p.set('q', q.trim());
    const s = p.toString();
    window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
    if (first.current) { first.current = false; return; }
    setPage(0);
  }, [ready, tab, type, q]);

  const all = live ? sortPages(websitePages()) : [];
  const s = q.trim().toLowerCase();
  const base = all.filter((x) => (!type || x.type === type) && (!s || [x.path, x.title, x.description, x.editor].join(' ').toLowerCase().includes(s)));
  const counts = { all: base.length };
  base.forEach((x) => { counts[x.status] = (counts[x.status] || 0) + 1; });
  const rows0 = base.filter((x) => tab === 'all' || x.status === tab);
  const pages = Math.max(1, Math.ceil(rows0.length / PAGE));
  const pg = Math.min(page, pages - 1);
  const rows = rows0.slice(pg * PAGE, pg * PAGE + PAGE);
  const open = (path) => router.push(href(path));
  const filtersOn = !!s || !!type;

  const exportCsv = () => {
    if (!rows0.length) { toast('Nothing to export'); return; }
    downloadCsv('gridcommerce-website-pages.csv', [
      ['Path', 'URL', 'Title', 'Description', 'Type', 'Status', 'Last edited', 'Editor', 'Code'],
      ...rows0.map((x) => [x.path, LIVE_HOST + (x.path === '/' ? '' : x.path), x.title, x.description, x.type, x.status, x.updatedAt ? dmy(x.updatedAt) : '', x.editor, (pageOf(x.path) || {}).file || '']),
    ]);
    toast(plural(rows0.length, 'page') + ' exported');
  };

  const tabs = TABS.map(([k, label]) => ({ key: k, id: 'wp-tab-' + k.replace(/\s/g, ''), label, count: live ? counts[k] || 0 : null, on: tab === k, onClick: () => setTab(k) }));
  const filters = [{ key: 'type', label: 'Type', all: 'All types', value: type, options: TYPES.map((x) => [x, x]), onChange: setType }];

  let body;
  if (!live) body = <div className="wb-skel" aria-busy="true" aria-label="Loading pages" />;
  else {
    body = (
      <section className="ix-card" aria-label="Website pages">
        <div className="ix-bar"><IndexTabs tabs={tabs} label="Page status" /></div>
        <div className="wp-filters">
          <FilterBar label="Filter pages" filters={filters} onClear={() => setQ('')} search={{ value: q, onChange: setQ, placeholder: 'Search title, path or editor' }} />
        </div>
        {!rows0.length ? (
          <div className="ix-empty">
            {filtersOn ? <EmptyState title="No pages match." actionLabel="Clear filters" onAction={() => { setQ(''); setType(''); }} />
              : <EmptyState icon="files" title={`No pages are ${tab}.`} actionLabel="Show all pages" onAction={() => setTab('all')} />}
          </div>
        ) : (
          <>
            <ul className="ix-plist" aria-label="Pages">
              {rows.map((x) => (
                <li key={x.path}>
                  <Link href={href(x.path)} className="ix-pitem">
                    <span className="ix-pitem__top"><b>{x.title}</b><StatusTag s={x.status} /></span>
                    <span className="ix-pitem__mid"><span className="wb-path">{x.path}</span> · {x.type}</span>
                    <span className="ix-pitem__mid">{when(x.updatedAt, t)} · {x.editor}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table gc-table--keep">
                <caption className="sr-only">Website pages</caption>
                <thead>
                  <tr><th scope="col">Page</th><th scope="col">Type</th><th scope="col">Status</th><th scope="col">Last edited</th><th scope="col">Editor</th></tr>
                </thead>
                <tbody>
                  {rows.map((x) => (
                    <tr key={x.path} tabIndex={0} onClick={() => open(x.path)} onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) open(x.path); }}>
                      <td>
                        <span className="wb-title">
                          <Link href={href(x.path)} className="ix-strong" onClick={(e) => e.stopPropagation()} title={x.title}>{x.title}</Link>
                          <span className="wb-path">{x.path}</span>
                        </span>
                      </td>
                      <td className="ix-muted wp-type">{x.type}</td>
                      <td><StatusTag s={x.status} /></td>
                      <td className="ix-muted ix-nowrap">{when(x.updatedAt, t)}</td>
                      <td><span className="wb-person"><Who name={x.editor} />{x.editor}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <Pager label={<span className="wp-foot"><span>{rows0.length ? `${pg * PAGE + 1}–${pg * PAGE + rows.length} of ${rows0.length}` : '0 pages'}</span><span className="wb-src">From the site’s code · {SOURCE_COMMIT}</span></span>}
          atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />
      </section>
    );
  }

  return (
    <AdminShell active="web-pages" title="Pages">
      <style dangerouslySetInnerHTML={{ __html: WEB_CSS + CSS }} />
      <div className="ix-page">
        <ShopHeader icon="files" title="Pages"
          about="Every page of gridcommerce.net, read from the website's code: the routes in its src/app and the title and description each page passes to buildMetadata. Open a page to see its sections, edit its title and description, move it through Draft → In review → Approved → Published (someone other than the editor approves), restore an older version and preview it on desktop, tablet and phone. Publishing here does not change the live site in this demo."
          secondary={[{ label: 'Export', icon: 'download', onClick: exportCsv }]}
          more={[{ label: 'Edit content', href: '/admin/website/content' }, { label: 'SEO', href: '/admin/website/seo' }]}
          primary={{ label: 'View site', icon: 'external-link', onClick: () => window.open(LIVE_HOST, '_blank', 'noopener') }} />
        {body}
      </div>
    </AdminShell>
  );
}
