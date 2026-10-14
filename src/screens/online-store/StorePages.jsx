'use client';
// Pages — Online Store › Pages (/store-pages): the store's own pages (About us, Contact us, delivery, returns, privacy,
// terms …), laid out like Shopify's Pages list.
//   Header   Add page (opens the editor with ready templates); Menus under More actions
//   The list status views with counts (All · Published · Drafts · Hidden), search by title or address; tick pages for
//            Publish, Hide or Delete (asks first). A row opens the editor; its "…" has View, Duplicate and Delete.
//   Below    the ready templates the shop hasn't used yet, one tap to start each.
// ?tab=published|draft|hidden opens that view. Front end only: data from src/lib/storePages.js.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { EmptyState } from '@/components/ui';
import { ShopHeader, IndexTabs, SearchField, Menu, LearnMore } from '@/components/ui/IndexKit';
import { formatDate, formatTime } from '@/lib/format';
import { TEMPLATES, setStatus, deletePages, duplicatePage, pageUrl, storefrontHref, publishProblems } from '@/lib/storePages';
import { menusLinking, removeLinksTo } from '@/lib/storeMenus';
import { StoreFrame, useStorePages, PageStatus, queryParam } from './storeShared';

const TABS = [['all', 'All'], ['published', 'Published'], ['draft', 'Drafts'], ['hidden', 'Hidden']];

const CSS = `
.sp-title{display:flex;align-items:center;gap:var(--space-3);min-width:0;max-width:320px}
.sp-title>span:last-child{min-width:0;overflow:hidden;text-overflow:ellipsis}
.sp-ico{display:grid;place-items:center;width:32px;height:32px;flex:none;border-radius:var(--radius-md);background:var(--surface-subtle);color:var(--text-muted)}
.sp-url{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.sp-tpls{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:var(--space-3) var(--space-4)}
.sp-tpls>span{font-size:var(--text-xs);color:var(--text-muted);margin-right:var(--space-1)}
.sp-tpl{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 var(--space-3);border:1px dashed var(--border-strong);border-radius:var(--radius-full);font-size:var(--text-sm);color:var(--text-heading);text-decoration:none;background:var(--surface-card)}
.sp-tpl:hover{border-color:var(--primary);color:var(--primary);background:var(--fill-primary-soft)}
@media (max-width:640px){.sp-tpl{height:36px}}
`;

const iconOf = (p) => (TEMPLATES.find((t) => t.id === p.template) || { icon: 'file-text' }).icon || 'file-text';

export default function StorePages() {
  const { pages, ready } = useStorePages();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [find, setFind] = useState(false);
  const [sel, setSel] = useState([]);

  useEffect(() => { const t = queryParam('tab'); if (TABS.some((x) => x[0] === t)) setTab(t); }, []);

  const base = useMemo(() => {
    const s = q.trim().toLowerCase();
    return pages.filter((p) => !s || [p.title, p.handle].some((x) => String(x || '').toLowerCase().includes(s)));
  }, [pages, q]);
  const counts = useMemo(() => {
    const c = { all: base.length };
    ['published', 'draft', 'hidden'].forEach((k) => { c[k] = base.filter((p) => p.status === k).length; });
    return c;
  }, [base]);
  const shown = base.filter((p) => tab === 'all' || p.status === tab);
  const unused = TEMPLATES.filter((t) => t.id !== 'blank' && !pages.some((p) => p.template === t.id || p.handle === t.handle));

  const shownIds = shown.map((p) => p.id);
  const picked = sel.filter((id) => pages.some((p) => p.id === id));
  const allOn = shownIds.length > 0 && shownIds.every((id) => picked.includes(id));
  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleAll = () => setSel(allOn ? picked.filter((id) => !shownIds.includes(id)) : [...new Set([...picked, ...shownIds])]);
  const plural = (n) => `${n} page${n === 1 ? '' : 's'}`;

  const bulkPublish = () => {
    const list = pages.filter((p) => picked.includes(p.id) && p.status !== 'published');
    const ok = list.filter((p) => !publishProblems(p).length);
    if (!list.length) { toast('The chosen pages are already published.', { tone: 'info' }); return; }
    if (!ok.length) { toast('These pages need a title, an address and some content first. Open each one to finish it.', { tone: 'error' }); return; }
    setStatus(ok.map((p) => p.id), 'published');
    const left = list.length - ok.length;
    toast(`${plural(ok.length)} published${left ? ` · ${left} still need content` : ''}`);
    setSel([]);
  };
  const bulkHide = () => {
    const before = pages.filter((p) => picked.includes(p.id)).map((p) => [p.id, p.status]);
    setStatus(picked, 'hidden');
    toast(`${plural(before.length)} hidden from the website`, { undo: () => { before.forEach(([id, st]) => setStatus([id], st)); toast('Hide undone'); } });
    setSel([]);
  };
  const remove = async (ids) => {
    const list = pages.filter((p) => ids.includes(p.id));
    if (!list.length) return;
    const linked = [...new Set(list.flatMap((p) => menusLinking('page', p.id)))];
    const ok = await confirmDialog({
      title: list.length === 1 ? `Delete “${list[0].title || 'Untitled page'}”?` : `Delete ${plural(list.length)}?`,
      body: list.length === 1
        ? `It is removed from the website for good.${linked.length ? ` Its links in ${linked.join(', ')} are removed too.` : ''} Hide it instead to keep a copy.`
        : `They are removed from the website for good.${linked.length ? ` Their links in ${linked.join(', ')} are removed too.` : ''} Hide them instead to keep a copy.`,
      confirmLabel: 'Delete', tone: 'danger',
    });
    if (!ok) return;
    list.forEach((p) => removeLinksTo('page', p.id));
    deletePages(ids);
    setSel([]);
    toast(`${plural(list.length)} deleted`);
  };
  const duplicate = (p) => {
    const copy = duplicatePage(p.id);
    if (!copy) return;
    toast(`Copy saved as a draft: ${copy.title}`);
    navigate(`/store-page-edit?id=${copy.id}`);
  };

  const edit = (p) => `/store-page-edit?id=${p.id}`;
  const view = (p) => storefrontHref(p.handle, p.status !== 'published');
  const rowMenu = (p) => [
    { label: 'Edit', href: edit(p) },
    { label: p.status === 'published' ? 'View on the website' : 'Preview', onClick: () => window.open(view(p), '_blank', 'noopener') },
    { label: 'Duplicate', onClick: () => duplicate(p) },
    { label: 'Delete', onClick: () => remove([p.id]), tone: 'danger' },
  ];
  const edited = (p) => `${formatDate(p.updatedAt)}, ${formatTime(p.updatedAt)}`;
  const tabs = TABS.map(([id, label]) => ({ key: id, id: 'sp-tab-' + id, label, count: ready ? counts[id] : null, on: tab === id, onClick: () => setTab(id) }));
  const closeFind = () => { setFind(false); setQ(''); };

  return (
    <StoreFrame screen="StorePages" active="store-pages" page="Pages" css={CSS}>
      <ShopHeader icon="file-text" title="Pages"
        about="The store's own pages: About us, Contact us, delivery and return rules, privacy and terms. Published pages show on the website; add them to the header or footer in Menus."
        more={[{ label: 'Menus', href: '/store-menus' }, { label: 'Privacy & consent settings', href: '/set-privacy' }]}
        primary={{ label: 'Add page', href: '/store-page-edit' }} />

      <section className="ix-card" aria-label="Pages">
        {picked.length ? (
          <div className="ix-bulk" role="toolbar" aria-label="Selected pages">
            <input type="checkbox" checked={allOn} onChange={toggleAll} aria-label="Select all shown pages" style={{ width: 16, height: 16, margin: '0 6px', accentColor: 'var(--primary)' }} />
            <span className="ix-bulk__n">{picked.length} selected</span>
            <button type="button" className="ix-btn ix-btn--sm" onClick={bulkPublish}><Icon name="send" width="16" height="16" aria-hidden="true" />Publish</button>
            <button type="button" className="ix-btn ix-btn--sm" onClick={bulkHide}><Icon name="eye-off" width="16" height="16" aria-hidden="true" />Hide</button>
            <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" align="start" items={[{ label: 'Delete', onClick: () => remove(picked), tone: 'danger' }, { label: 'Clear selection', onClick: () => setSel([]) }]} />
          </div>
        ) : (
          <div className="ix-bar">
            {find ? (<>
              <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or address" onDone={closeFind} autoFocus />
              <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
            </>) : (<>
              <IndexTabs tabs={tabs} label="Page status" />
              <span className="ix-tools">
                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search pages" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
              </span>
            </>)}
          </div>
        )}

        {!ready ? <div style={{ minHeight: 240 }} aria-busy="true" /> : shown.length === 0 ? (
          <div className="ix-empty"><EmptyState icon="file-text" title={pages.length ? 'No pages match' : 'No pages yet'} body={pages.length ? 'Try another view or search.' : 'Start with About us or your return policy.'} actionLabel={pages.length ? 'Show all pages' : 'Add page'} onAction={() => { if (pages.length) { setQ(''); setFind(false); setTab('all'); } else navigate('/store-page-edit'); }} /></div>
        ) : (<>
          <ul className="ix-plist" aria-label="Pages">
            {shown.map((p) => (
              <li key={p.id}>
                <Link href={edit(p)} className="ix-pitem">
                  <span className="ix-pitem__top"><b>{p.title || 'Untitled page'}</b><PageStatus status={p.status} /></span>
                  <span className="ix-pitem__mid">{`/pages/${p.handle} · ${formatDate(p.updatedAt)}`}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table gc-table--keep">
              <caption className="sr-only">{`Pages, ${shown.length} shown`}</caption>
              <thead><tr>
                <th scope="col" className="ix-check"><input type="checkbox" aria-label="Select all shown pages" checked={allOn} onChange={toggleAll} /></th>
                <th scope="col">Page</th><th scope="col">Address</th><th scope="col">Status</th><th scope="col">Last edited</th><th scope="col"><span className="sr-only">Actions</span></th>
              </tr></thead>
              <tbody>
                {shown.map((p) => (
                  <tr key={p.id} className={picked.includes(p.id) ? 'is-sel' : ''} onClick={(e) => { if (!e.target.closest('a,button,input,label')) navigate(edit(p)); }}>
                    <td className="ix-check"><input type="checkbox" aria-label={`Select ${p.title || 'untitled page'}`} checked={picked.includes(p.id)} onChange={() => toggle(p.id)} /></td>
                    <td><span className="sp-title"><span className="sp-ico" aria-hidden="true"><Icon name={iconOf(p)} width="16" height="16" /></span><span><Link href={edit(p)} className="ix-strong">{p.title || 'Untitled page'}</Link></span></span></td>
                    <td><span className="sp-url" title={pageUrl(p)}>/pages/{p.handle}</span></td>
                    <td><PageStatus status={p.status} /></td>
                    <td className="ix-muted">{edited(p)}</td>
                    <td style={{ textAlign: 'right' }}><Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" items={rowMenu(p)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>)}
        <div className="ix-foot"><span>{shown.length === 1 ? '1 page' : shown.length + ' pages'}</span></div>
      </section>

      {ready && unused.length ? (
        <section className="ix-card sp-tpls" aria-label="Ready templates">
          <span>Ready templates</span>
          {unused.map((t) => <Link key={t.id} href={`/store-page-edit?template=${t.id}`} className="sp-tpl"><Icon name="plus" width="14" height="14" aria-hidden="true" />{t.name}</Link>)}
        </section>
      ) : null}
      <LearnMore topic="pages" />
    </StoreFrame>
  );
}
