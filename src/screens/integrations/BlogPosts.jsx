'use client';
// Blog posts — every post on the storefront blog (gridshop.com.bd/blog), with its status, category,
// author, views and SEO score.
//   KPIs       published, drafts, scheduled (next one), views this month
//   Filters    status tabs with counts, category (a parent includes its sub-categories), author, search, sort
//   Views      table or cards; tick posts for bulk actions: publish (only posts that pass the publish
//              checks), move to a category, archive (with undo), delete (asks first)
//   Links      New post → /blog-editor, a title → /blog-editor?id=, an author → /author-profile?id=,
//              Categories → /blog-categories, Authors → /blog-authors, WordPress sync → /woo-sync
// ?tab=published|draft|scheduled|archived opens that tab; ?cat=<categoryId> and ?author=<authorId> filter. Front end only: data from src/lib/blog.js.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { PageHeader, EmptyState } from '@/components/ui';
import { formatDate, formatTime } from '@/lib/format';
import { STATUSES, categoryTree, updatePosts, deletePosts, publishProblems, seoScore, postDate, BLOG_BASE } from '@/lib/blog';
import { BlogFrame, useBlog, Cover, Avatar, CatChip, PostStatus, SeoDot, queryParam } from './blogShared';

const TABS = [['all', 'All'], ['published', 'Published'], ['draft', 'Drafts'], ['scheduled', 'Scheduled'], ['archived', 'Archived']];
const SORTS = [['new', 'Newest first'], ['views', 'Most viewed'], ['seo', 'Lowest SEO score'], ['title', 'Title A–Z']];
const n = (x) => Number(x || 0).toLocaleString('en-IN');

const CSS = `
.bp-bar{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:var(--space-3) var(--space-5);border-top:1px solid var(--border-subtle)}
.bp-bar .gc-input{height:40px}
.bp-search{position:relative;flex:1 1 220px;min-width:0}
.bp-search svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none}
.bp-search .gc-input{padding-left:38px}
.bp-filter{flex:0 1 190px;min-width:150px}
.bp-tab b{margin-left:6px;font-weight:var(--weight-medium);color:var(--text-muted);font-variant-numeric:tabular-nums}
.bp-bulk{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:var(--space-3) var(--space-5);background:var(--fill-primary-soft);border-top:1px solid var(--border-subtle)}
.bp-bulk b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--primary);margin-right:auto}
.bp-bulk .gc-input{height:36px;width:auto;min-width:170px}
.bp-title{display:block;font-weight:var(--weight-medium);color:var(--text-heading);text-decoration:none;line-height:1.4;min-width:180px;white-space:normal}
.bp-title:hover{color:var(--text-link);text-decoration:underline}
.bp-card .gc-table th,.bp-card .gc-table td{padding-left:var(--space-3);padding-right:var(--space-3)}
.bp-card .gc-table th:first-child,.bp-card .gc-table td:first-child{padding-left:var(--space-5)}
.bp-author{display:inline-flex;align-items:center;gap:var(--space-2);color:var(--text-body);text-decoration:none;white-space:nowrap}
.bp-author:hover span{color:var(--text-link);text-decoration:underline}
.bp-flag{display:inline-flex;align-items:center;gap:4px;margin-left:6px;color:var(--text-warning);font-size:var(--text-xs);vertical-align:middle}
.bp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:var(--space-4);padding:var(--space-4) var(--space-5) var(--space-5)}
.bp-tile{position:relative;display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card)}
.bp-tile.is-on{border-color:var(--primary);box-shadow:0 0 0 1px var(--primary)}
.bp-tile .bp-pick{position:absolute;top:var(--space-5);left:var(--space-5);z-index:1;background:var(--surface-card)}
.bp-tile .bp-title{min-width:0;font-size:var(--text-sm-plus)}
.bp-foot{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);margin-top:auto;font-size:var(--text-xs);color:var(--text-muted)}
.bp-note{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:var(--space-3) var(--space-5);border-top:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:599px){.bp-filter{flex:1 1 140px}.bp-bulk .gc-input{flex:1 1 100%}}
/* phones: the table already shows as cards, so the Table / Cards switch is hidden */
@media (max-width:640px){.bp-layout{display:none!important}}
`;

export default function BlogPosts() {
  const db = useBlog();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [author, setAuthor] = useState('');
  const [sort, setSort] = useState('new');
  const [view, setView] = useState('table');
  const [sel, setSel] = useState([]);
  const [moveTo, setMoveTo] = useState('');

  useEffect(() => {
    const t = queryParam('tab');
    if (TABS.some((x) => x[0] === t)) setTab(t);
    const a = queryParam('author');
    if (a) setAuthor(a);
    const c = queryParam('cat');
    if (c) setCat(c);
    try { const v = window.localStorage.getItem('gc.blog.view'); if (v === 'cards') setView('cards'); } catch { /* ignore */ }
  }, []);
  const pickView = (v) => { setView(v); try { window.localStorage.setItem('gc.blog.view', v); } catch { /* ignore */ } };

  const catById = useMemo(() => Object.fromEntries(db.categories.map((c) => [c.id, c])), [db.categories]);
  const authorById = useMemo(() => Object.fromEntries(db.authors.map((a) => [a.id, a])), [db.authors]);
  const tree = useMemo(() => categoryTree(db.categories), [db.categories]);

  // filters other than the tab, so tab counts follow them
  const base = useMemo(() => {
    const within = cat ? new Set([cat, ...db.categories.filter((c) => c.parentId === cat).map((c) => c.id)]) : null;
    const s = q.trim().toLowerCase();
    return db.posts.filter((p) => (!within || (p.categoryIds || []).some((id) => within.has(id)))
      && (!author || p.authorId === author)
      && (!s || [p.title, p.slug, p.excerpt, ...(p.tags || []), (p.seo || {}).focusKeyword].some((x) => String(x || '').toLowerCase().includes(s))));
  }, [db.posts, db.categories, cat, author, q]);
  const counts = useMemo(() => {
    const c = { all: base.length };
    Object.keys(STATUSES).forEach((k) => { c[k] = base.filter((p) => p.status === k).length; });
    return c;
  }, [base]);
  const shown = useMemo(() => {
    const list = base.filter((p) => tab === 'all' || p.status === tab);
    const by = {
      new: (a, b) => new Date(postDate(b)) - new Date(postDate(a)),
      views: (a, b) => (b.views || 0) - (a.views || 0),
      seo: (a, b) => seoScore(a).score - seoScore(b).score,
      title: (a, b) => a.title.localeCompare(b.title),
    }[sort];
    return list.slice().sort(by);
  }, [base, tab, sort]);

  // KPIs over every post
  const all = db.posts;
  const published = all.filter((p) => p.status === 'published').length;
  const drafts = all.filter((p) => p.status === 'draft').length;
  const scheduled = all.filter((p) => p.status === 'scheduled').sort((a, b) => new Date(a.publishAt) - new Date(b.publishAt));
  const monthViews = all.reduce((s, p) => s + (p.viewsMonth || 0), 0);

  const shownIds = shown.map((p) => p.id);
  const picked = sel.filter((id) => all.some((p) => p.id === id));
  const allOn = shownIds.length > 0 && shownIds.every((id) => picked.includes(id));
  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleAll = () => setSel(allOn ? picked.filter((id) => !shownIds.includes(id)) : [...new Set([...picked, ...shownIds])]);

  const bulkPublish = () => {
    const list = all.filter((p) => picked.includes(p.id) && p.status !== 'published');
    const ok = list.filter((p) => !publishProblems(p).length);
    const blocked = list.length - ok.length;
    if (ok.length) {
      const now = new Date().toISOString();
      updatePosts(ok.map((p) => p.id), (p) => ({ status: 'published', autoPublishedAt: null, publishAt: p.status === 'scheduled' || !p.publishAt ? now : p.publishAt }));
    }
    if (!list.length) toast('The chosen posts are already published.', { tone: 'info' });
    else if (!ok.length) toast(`${blocked} post${blocked === 1 ? '' : 's'} can’t go live yet: open each one to add the missing title, category, meta description or cover alt text.`, { tone: 'error' });
    else toast(`${ok.length} post${ok.length === 1 ? '' : 's'} published${blocked ? ` · ${blocked} still need details before they can go live` : ''}`);
    setSel([]);
  };
  const bulkMove = () => {
    const c = catById[moveTo];
    if (!c) { toast('Choose a category to move the posts to.', { tone: 'error' }); return; }
    updatePosts(picked, { categoryIds: [c.id] });
    toast(`${picked.length} post${picked.length === 1 ? '' : 's'} moved to ${c.name}`);
    setSel([]); setMoveTo('');
  };
  const bulkArchive = () => {
    const before = all.filter((p) => picked.includes(p.id)).map((p) => [p.id, p.status]);
    updatePosts(picked, { status: 'archived' });
    toast(`${before.length} post${before.length === 1 ? '' : 's'} archived · hidden from the website`, {
      undo: () => { before.forEach(([id, status]) => updatePosts([id], { status })); toast('Archive undone'); },
    });
    setSel([]);
  };
  const bulkDelete = async () => {
    const count = picked.length;
    const ok = await confirmDialog({ title: `Delete ${count} post${count === 1 ? '' : 's'}?`, body: 'They are removed from the blog and the website for good, with their SEO settings. Archive them instead to keep a copy.', confirmLabel: 'Delete', tone: 'danger' });
    if (!ok) return;
    deletePosts(picked);
    setSel([]);
    toast(`${count} post${count === 1 ? '' : 's'} deleted`);
  };

  const dateCell = (p) => {
    const d = postDate(p);
    const lead = p.status === 'scheduled' ? 'Publishes' : p.status === 'published' ? (p.autoPublishedAt ? 'Published automatically' : 'Published') : p.status === 'archived' ? 'Was published' : 'Saved';
    return <>{formatDate(d)}<span className="bl-sub">{lead} · {formatTime(d)}</span></>;
  };
  const cats = (p) => (p.categoryIds || []).map((id) => catById[id]).filter(Boolean);
  const authorLink = (p) => {
    const a = authorById[p.authorId];
    if (!a) return <span className="bl-sub">No author</span>;
    return <Link href={`/author-profile?id=${a.id}`} className="bp-author"><Avatar author={a} size={28} /><span>{a.name}</span></Link>;
  };
  const clearFilters = () => { setQ(''); setCat(''); setAuthor(''); setTab('all'); };

  return (
    <BlogFrame screen="BlogPosts" active="blog-posts" page="Posts" css={CSS}>
      <PageHeader
        title="Blog posts"
        about="Write guides, recipes and offers for the storefront blog. Published posts appear on gridshop.com.bd/blog."
        actions={<>
          <Link href="/blog-categories" className="gc-btn gc-btn--neutral"><Icon name="folder-tree" width="18" height="18" aria-hidden="true" /> Categories</Link>
          <Link href="/blog-authors" className="gc-btn gc-btn--neutral"><Icon name="users" width="18" height="18" aria-hidden="true" /> Authors</Link>
          <Link href="/blog-editor" className="gc-btn gc-btn--solid"><Icon name="plus" width="18" height="18" aria-hidden="true" /> New post</Link>
        </>}
      />

      <div className="gc-kpis">
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-primary-soft)', color: 'var(--primary)' }}><Icon name="eye" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Views this month</p><p className="gc-kpi__value">{n(monthViews)}<small>all posts</small></p></div></div>
      </div>

      <section className="gc-card bl-card bp-card" aria-label="Posts">
        <div className="bl-head" style={{ paddingBottom: 0 }}>
          <div className="gc-tabs" role="tablist" aria-label="Post status" style={{ borderBottom: 0, flexWrap: 'wrap', overflow: 'visible' }}>
            {TABS.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={'gc-tab bp-tab' + (tab === id ? ' gc-tab--active' : '')} onClick={() => setTab(id)}>{label}<b>{db.ready ? counts[id] : ''}</b></button>)}
          </div>
          <div className="gc-seg bp-layout" role="group" aria-label="Layout">
            <button type="button" className={'gc-seg__btn' + (view === 'table' ? ' gc-seg__btn--active' : '')} aria-pressed={view === 'table'} onClick={() => pickView('table')}><Icon name="list" width="16" height="16" aria-hidden="true" style={{ verticalAlign: 'middle' }} /> Table</button>
            <button type="button" className={'gc-seg__btn' + (view === 'cards' ? ' gc-seg__btn--active' : '')} aria-pressed={view === 'cards'} onClick={() => pickView('cards')}><Icon name="layout-grid" width="16" height="16" aria-hidden="true" style={{ verticalAlign: 'middle' }} /> Cards</button>
          </div>
        </div>
        <div className="bp-bar">
          <div className="bp-search"><Icon name="search" width="16" height="16" aria-hidden="true" /><input className="gc-input" type="search" placeholder="Search title, tag or keyword" aria-label="Search posts" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <select className="gc-input gc-select bp-filter" aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">All categories</option>
            {tree.map((c) => <option key={c.id} value={c.id}>{c.depth ? '— ' : ''}{c.name}</option>)}
          </select>
          <select className="gc-input gc-select bp-filter" aria-label="Author" value={author} onChange={(e) => setAuthor(e.target.value)}>
            <option value="">All authors</option>
            {db.authors.map((a) => <option key={a.id} value={a.id}>{a.name}{a.active ? '' : ' (inactive)'}</option>)}
          </select>
          <select className="gc-input gc-select bp-filter" aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>

        {picked.length ? (
          <div className="bp-bulk" role="region" aria-label="Bulk actions">
            <b>{picked.length} selected</b>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={bulkPublish}><Icon name="send" width="16" height="16" aria-hidden="true" /> Publish</button>
            <select className="gc-input gc-select" aria-label="Move to category" value={moveTo} onChange={(e) => setMoveTo(e.target.value)}>
              <option value="">Move to category…</option>
              {tree.map((c) => <option key={c.id} value={c.id}>{c.depth ? '— ' : ''}{c.name}</option>)}
            </select>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={bulkMove} disabled={!moveTo}>Move</button>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={bulkArchive}><Icon name="archive" width="16" height="16" aria-hidden="true" /> Archive</button>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--error gc-btn--outlined" onClick={bulkDelete}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /> Delete</button>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={() => setSel([])}>Clear</button>
          </div>
        ) : null}

        {!db.ready ? <div style={{ minHeight: 240 }} aria-busy="true" /> : shown.length === 0 ? (
          <EmptyState icon="newspaper" title={db.posts.length ? 'No posts match' : 'No posts yet'} body={db.posts.length ? 'Try another status, category, author or search.' : 'Write the first post for the storefront blog.'} actionLabel={db.posts.length ? 'Clear filters' : undefined} onAction={clearFilters} />
        ) : view === 'table' ? (
          <div className="gc-table-wrap">
            <table className="gc-table gc-table--compact gc-table--hoverable">
              <thead><tr>
                <th scope="col" style={{ width: 44 }}><input type="checkbox" className="gc-check" aria-label="Select all shown posts" checked={allOn} onChange={toggleAll} /></th>
                <th scope="col">Post</th><th scope="col">Category</th><th scope="col">Author</th><th scope="col">Status</th><th scope="col">Date</th><th scope="col" className="bl-num">Views</th><th scope="col">SEO</th><th scope="col"><span className="sr-only">Actions</span></th>
              </tr></thead>
              <tbody>
                {shown.map((p) => (
                  <tr key={p.id} aria-selected={picked.includes(p.id)}>
                    <td><input type="checkbox" className="gc-check" aria-label={`Select ${p.title || 'untitled post'}`} checked={picked.includes(p.id)} onChange={() => toggle(p.id)} /></td>
                    <td>
                      <div className="bl-row">
                        <Cover cover={p.cover} thumb />
                        <div style={{ minWidth: 0 }}>
                          <Link href={`/blog-editor?id=${p.id}`} className="bp-title">{p.title || 'Untitled post'}{p.featured ? <span className="bp-flag" title="Featured"><Icon name="star" width="12" height="12" aria-hidden="true" /><span className="sr-only">Featured</span></span> : null}</Link>
                          <span className="bl-id">/{p.slug || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td><div className="bl-wrap">{cats(p).length ? cats(p).map((c) => <CatChip key={c.id} cat={c} />) : <span className="bl-sub">None</span>}</div></td>
                    <td>{authorLink(p)}</td>
                    <td><PostStatus status={p.status} /></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{dateCell(p)}</td>
                    <td className="bl-num">{p.status === 'draft' || p.status === 'scheduled' ? '—' : n(p.views)}</td>
                    <td><SeoDot post={p} /></td>
                    <td><Link href={`/blog-editor?id=${p.id}`} className="gc-btn gc-btn--xs gc-btn--neutral" aria-label={`Edit ${p.title || 'untitled post'}`}>Edit</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bp-grid">
            {shown.map((p) => (
              <article key={p.id} className={'bp-tile' + (picked.includes(p.id) ? ' is-on' : '')}>
                <input type="checkbox" className="gc-check bp-pick" aria-label={`Select ${p.title || 'untitled post'}`} checked={picked.includes(p.id)} onChange={() => toggle(p.id)} />
                <Cover cover={p.cover} />
                <div className="bl-wrap"><PostStatus status={p.status} />{cats(p).map((c) => <CatChip key={c.id} cat={c} />)}</div>
                <Link href={`/blog-editor?id=${p.id}`} className="bp-title">{p.title || 'Untitled post'}</Link>
                {p.excerpt ? <p className="bl-sub" style={{ margin: 0 }}>{p.excerpt}</p> : null}
                <div className="bp-foot">
                  {authorLink(p)}
                  <span>{formatDate(postDate(p))}</span>
                  {p.status === 'published' || p.status === 'archived' ? <span><Icon name="eye" width="12" height="12" aria-hidden="true" style={{ verticalAlign: 'middle' }} /> {n(p.views)}</span> : null}
                  <SeoDot post={p} />
                </div>
              </article>
            ))}
          </div>
        )}
        <div className="bp-note">
          <Icon name="info" width="14" height="14" aria-hidden="true" />
          <span>Posts live at <span className="bl-id">{BLOG_BASE}…</span> and sync to WordPress when a connection is set up.</span>
          <Link href="/woo-sync" className="bl-link">WordPress sync</Link>
        </div>
      </section>
    </BlogFrame>
  );
}
