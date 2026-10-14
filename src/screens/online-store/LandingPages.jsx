'use client';
// Landing pages — Online Store › Landing pages (/landing-pages): one page per product with an order form, built in the
// landing page builder (/landing-page-builder?id=).
//   Header   New landing page (the builder's product step)
//   The list status views with counts (All · Published · Drafts), search by title, product or link; each row shows the
//            page, its product, its link, status, visits, orders and sales since it went live, and when it was edited.
//            Row "…": Edit, Duplicate, Publish / Unpublish, Delete (asks first). Tick pages for Publish, Unpublish or Delete.
// Front end only: data from src/lib/landingPages.js (this browser); figures from the shop's real orders (see the lib).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { EmptyState, StatusBadge } from '@/components/ui';
import { ShopHeader, IndexTabs, SearchField, Menu } from '@/components/ui/IndexKit';
import { formatDate, formatBDT } from '@/lib/format';
import { getOrders } from '@/lib/orders';
import { demoNow } from '@/lib/demoClock';
import {
  getLandingPages, STATUSES, LANDING_EVENT, publishLandingPage, unpublishLandingPage, duplicateLandingPage, deleteLandingPages,
  statsOf, templateOf,
} from '@/lib/landingPages';
import { StoreFrame } from './storeShared';

const TABS = [['all', 'All'], ['published', 'Published'], ['draft', 'Drafts']];

const CSS = `
.lp-title{display:flex;align-items:center;gap:var(--space-3);min-width:0;max-width:340px}
.lp-title>span:last-child{min-width:0}
.lp-title small{display:block;font-size:var(--text-xs);color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lp-ico{display:grid;place-items:center;width:32px;height:32px;flex:none;border-radius:var(--radius-md);background:var(--surface-subtle);color:var(--text-muted)}
.lp-url{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.lp-num{font-family:var(--font-data);text-align:right;white-space:nowrap}
`;

function useLandingPages() {
  const [state, setState] = useState({ pages: [], stats: {}, ready: false });
  useEffect(() => {
    const load = () => {
      const pages = getLandingPages();
      const orders = getOrders(); const now = demoNow();
      const stats = Object.fromEntries(pages.map((p) => [p.id, statsOf(p, orders, now)]));
      setState({ pages, stats, ready: true });
    };
    load();
    window.addEventListener(LANDING_EVENT, load);
    window.addEventListener('storage', load);
    return () => { window.removeEventListener(LANDING_EVENT, load); window.removeEventListener('storage', load); };
  }, []);
  return state;
}

const PageStatus = ({ status }) => { const s = STATUSES[status] || STATUSES.draft; return <StatusBadge tone={s.tone} icon={s.icon}>{s.label}</StatusBadge>; };

export default function LandingPages() {
  const { pages, stats, ready } = useLandingPages();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [find, setFind] = useState(false);
  const [sel, setSel] = useState([]);

  const base = useMemo(() => {
    const s = q.trim().toLowerCase();
    return pages.filter((p) => !s || [p.title, p.productName, p.handle].some((x) => String(x || '').toLowerCase().includes(s)));
  }, [pages, q]);
  const counts = { all: base.length, published: base.filter((p) => p.status === 'published').length, draft: base.filter((p) => p.status !== 'published').length };
  const shown = base.filter((p) => tab === 'all' || (tab === 'draft' ? p.status !== 'published' : p.status === tab));

  const ids = shown.map((p) => p.id);
  const picked = sel.filter((id) => pages.some((p) => p.id === id));
  const allOn = ids.length > 0 && ids.every((id) => picked.includes(id));
  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleAll = () => setSel(allOn ? picked.filter((id) => !ids.includes(id)) : [...new Set([...picked, ...ids])]);
  const plural = (n) => `${n} page${n === 1 ? '' : 's'}`;

  const doPublish = (list) => {
    const errs = [];
    let n = 0;
    list.forEach((id) => { const r = publishLandingPage(id); if (r && r.error) errs.push(r.error); else if (r) n += 1; });
    if (n) toast(n === 1 ? 'Page published' : `${plural(n)} published`);
    if (errs.length) toast(errs[0] + ' Open the page to change its link.', { tone: 'error' });
    setSel([]);
  };
  const doUnpublish = (list) => {
    list.forEach((id) => unpublishLandingPage(id));
    toast(list.length === 1 ? 'Page taken off the website' : `${plural(list.length)} taken off the website`, { undo: () => { doPublish(list); } });
    setSel([]);
  };
  const remove = async (list) => {
    const chosen = pages.filter((p) => list.includes(p.id));
    if (!chosen.length) return;
    const live = chosen.some((p) => p.status === 'published');
    const ok = await confirmDialog({
      title: chosen.length === 1 ? `Delete “${chosen[0].title}”?` : `Delete ${plural(chosen.length)}?`,
      body: `${live ? 'Its link stops working and ads pointing to it will show “Page not found”. ' : ''}This can't be undone. Unpublish instead to keep a copy.`,
      confirmLabel: 'Delete', tone: 'danger',
    });
    if (!ok) return;
    deleteLandingPages(list);
    setSel([]);
    toast(`${plural(chosen.length)} deleted`);
  };
  const duplicate = (p) => {
    const copy = duplicateLandingPage(p.id);
    if (!copy) return;
    toast(`Copy saved as a draft: ${copy.title}`);
    navigate(`/landing-page-builder?id=${copy.id}`);
  };

  const edit = (p) => `/landing-page-builder?id=${p.id}`;
  const rowMenu = (p) => [
    { label: 'Edit', href: edit(p) },
    { label: 'Duplicate', onClick: () => duplicate(p) },
    p.status === 'published' ? { label: 'Unpublish', onClick: () => doUnpublish([p.id]) } : { label: 'Publish', onClick: () => doPublish([p.id]) },
    { label: 'Delete', onClick: () => remove([p.id]), tone: 'danger' },
  ];
  const tabs = TABS.map(([id, label]) => ({ key: id, id: 'lp-tab-' + id, label, count: ready ? counts[id] : null, on: tab === id, onClick: () => setTab(id) }));
  const closeFind = () => { setFind(false); setQ(''); };
  const st = (p) => stats[p.id] || { visits: 0, orders: 0, sales: 0, live: false };
  const fig = (p, k, fmt = (x) => x.toLocaleString('en-IN')) => (st(p).live ? fmt(st(p)[k]) : '—');

  return (
    <StoreFrame screen="LandingPages" active="storefront" page="Landing pages" css={CSS}>
      <ShopHeader icon="layout-template" title="Landing pages"
        about="One page per product with an order form near the top, for Facebook and Google ads. Orders from a page land in your orders list. Visits and orders count from the day a page goes live."
        primary={{ label: 'New landing page', href: '/landing-page-builder' }} />

      <section className="ix-card" aria-label="Landing pages">
        {picked.length ? (
          <div className="ix-bulk" role="toolbar" aria-label="Selected pages">
            <input type="checkbox" checked={allOn} onChange={toggleAll} aria-label="Select all shown pages" style={{ width: 16, height: 16, margin: '0 6px', accentColor: 'var(--primary)' }} />
            <span className="ix-bulk__n">{picked.length} selected</span>
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => doPublish(picked)}><Icon name="send" width="16" height="16" aria-hidden="true" />Publish</button>
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => doUnpublish(picked)}><Icon name="eye-off" width="16" height="16" aria-hidden="true" />Unpublish</button>
            <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" align="start" items={[{ label: 'Delete', onClick: () => remove(picked), tone: 'danger' }, { label: 'Clear selection', onClick: () => setSel([]) }]} />
          </div>
        ) : (
          <div className="ix-bar">
            {find ? (<>
              <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search page, product or link" onDone={closeFind} autoFocus />
              <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
            </>) : (<>
              <IndexTabs tabs={tabs} label="Page status" />
              <span className="ix-tools">
                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search landing pages" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
              </span>
            </>)}
          </div>
        )}

        {!ready ? <div style={{ minHeight: 240 }} aria-busy="true" /> : shown.length === 0 ? (
          <div className="ix-empty"><EmptyState icon="layout-template" title={pages.length ? 'No pages match' : 'No landing pages yet'} body={pages.length ? 'Try another view or search.' : 'Pick a product and a template; the page fills itself in.'} actionLabel={pages.length ? 'Show all pages' : 'New landing page'} onAction={() => { if (pages.length) { setQ(''); setFind(false); setTab('all'); } else navigate('/landing-page-builder'); }} /></div>
        ) : (<>
          <ul className="ix-plist" aria-label="Landing pages">
            {shown.map((p) => (
              <li key={p.id}>
                <Link href={edit(p)} className="ix-pitem">
                  <span className="ix-pitem__top"><b>{p.title}</b><PageStatus status={p.status} /></span>
                  <span className="ix-pitem__mid">{`/lp/${p.handle} · ${st(p).live ? `${st(p).orders} orders · ${st(p).visits.toLocaleString('en-IN')} visits` : 'Not live yet'}`}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table gc-table--keep">
              <caption className="sr-only">{`Landing pages, ${shown.length} shown`}</caption>
              <thead><tr>
                <th scope="col" className="ix-check"><input type="checkbox" aria-label="Select all shown pages" checked={allOn} onChange={toggleAll} /></th>
                <th scope="col">Page</th><th scope="col">Link</th><th scope="col">Status</th>
                <th scope="col" style={{ textAlign: 'right' }}>Visits</th><th scope="col" style={{ textAlign: 'right' }}>Orders</th><th scope="col" style={{ textAlign: 'right' }}>Sales</th>
                <th scope="col">Last edited</th><th scope="col"><span className="sr-only">Actions</span></th>
              </tr></thead>
              <tbody>
                {shown.map((p) => (
                  <tr key={p.id} className={picked.includes(p.id) ? 'is-sel' : ''} onClick={(e) => { if (!e.target.closest('a,button,input,label')) navigate(edit(p)); }}>
                    <td className="ix-check"><input type="checkbox" aria-label={`Select ${p.title}`} checked={picked.includes(p.id)} onChange={() => toggle(p.id)} /></td>
                    <td><span className="lp-title"><span className="lp-ico" aria-hidden="true"><Icon name={templateOf(p.template).icon} width="16" height="16" /></span><span><Link href={edit(p)} className="ix-strong">{p.title}</Link><small>{p.productName}</small></span></span></td>
                    <td><span className="lp-url">/lp/{p.handle}</span></td>
                    <td><PageStatus status={p.status} /></td>
                    <td className="lp-num">{fig(p, 'visits')}</td>
                    <td className="lp-num">{fig(p, 'orders')}</td>
                    <td className="lp-num">{fig(p, 'sales', (x) => formatBDT(x))}</td>
                    <td className="ix-muted">{formatDate(p.updatedAt)}</td>
                    <td style={{ textAlign: 'right' }}><Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" items={rowMenu(p)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>)}
        <div className="ix-foot"><span>{plural(shown.length)}</span></div>
      </section>
    </StoreFrame>
  );
}
