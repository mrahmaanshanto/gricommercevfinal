'use client';
// Blog posts — every post on the storefront blog (dazzleshop.com.bd/blog), laid out like Shopify's Blog posts list:
//   Header     New post; Categories, Authors and WordPress sync under More actions
//   Figures    views this month and the next scheduled post
//   The list   status views with counts, sort, table or cards, search with category and author filters; tick posts
//              for bulk actions: publish (only posts that pass the publish checks), move to a category, archive (with
//              undo), delete (asks first). A row opens the post in the editor, where its address, excerpt and the rest are.
// ?tab=published|draft|scheduled|archived opens that tab; ?cat=<categoryId> and ?author=<authorId> filter.
// Front end only: data from src/lib/blog.js.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { EmptyState } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, Menu, LearnMore } from '@/components/ui/IndexKit';
import { formatDate } from '@/lib/format';
import { STATUSES, categoryTree, updatePosts, deletePosts, publishProblems, seoScore, postDate, BLOG_BASE } from '@/lib/blog';
import { BlogFrame, useBlog, Cover, Avatar, CatChip, PostStatus, SeoDot, queryParam } from './blogShared';

const TABS = [['all', 'All'], ['published', 'Published'], ['draft', 'Drafts'], ['scheduled', 'Scheduled'], ['archived', 'Archived']];
const SORTS = [['new', 'Newest first'], ['views', 'Most viewed'], ['seo', 'Lowest SEO score'], ['title', 'Title A–Z']];
const n = (x) => Number(x || 0).toLocaleString('en-IN');

const CSS = `
.bp-sort{height:28px;font-size:var(--text-xs-plus)}
.bp-post{display:flex;align-items:center;gap:10px;min-width:0;max-width:260px}
.bp-post>span{min-width:0;overflow:hidden;text-overflow:ellipsis}
.bp-post .bl-cover--thumb{width:32px;border-radius:var(--radius-md)}
.bp-post .bl-cover--thumb svg{width:16px;height:16px}
.bp-flag{display:inline-flex;margin-left:6px;color:var(--text-warning);vertical-align:-1px}
.bp-author{display:inline-flex;align-items:center;gap:var(--space-2);color:var(--text-body);text-decoration:none;white-space:nowrap}
.bp-author:hover span{color:var(--text-link);text-decoration:underline}
.bp-more{margin-left:4px;font-size:var(--text-xs);color:var(--text-muted)}
.bp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:var(--space-3);padding:var(--space-4)}
.bp-tile{position:relative;display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.bp-tile.is-on{border-color:var(--primary);box-shadow:0 0 0 1px var(--primary)}
.bp-tile .bp-pick{position:absolute;top:var(--space-4);left:var(--space-4);z-index:1;background:var(--surface-card)}
.bp-title{font-weight:var(--weight-semibold);color:var(--text-heading);text-decoration:none;line-height:1.4}
.bp-title:hover{color:var(--text-link);text-decoration:underline}
.bp-foot{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-1) var(--space-3);margin-top:auto;font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:640px){.bp-layout{display:none!important}.bp-grid{display:none}}
`;

export default function BlogPosts() {
  const db = useBlog();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [find, setFind] = useState(false);
  const [cat, setCat] = useState('');
  const [author, setAuthor] = useState('');
  const [sort, setSort] = useState('new');
  const [view, setView] = useState('table');
  const [sel, setSel] = useState([]);

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

  // figures over every post
  const all = db.posts;
  const next = all.filter((p) => p.status === 'scheduled').sort((a, b) => new Date(a.publishAt) - new Date(b.publishAt))[0];
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
  const bulkMove = (id) => {
    const c = catById[id];
    if (!c) { toast('Choose a category to move the posts to.', { tone: 'error' }); return; }
    updatePosts(picked, { categoryIds: [c.id] });
    toast(`${picked.length} post${picked.length === 1 ? '' : 's'} moved to ${c.name}`);
    setSel([]);
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

  const cats = (p) => (p.categoryIds || []).map((id) => catById[id]).filter(Boolean);
  const authorLink = (p) => {
    const a = authorById[p.authorId];
    if (!a) return <span className="ix-muted">No author</span>;
    return <Link href={`/author-profile?id=${a.id}`} className="bp-author"><Avatar author={a} size={20} /><span>{a.name}</span></Link>;
  };
  const views = (p) => (p.status === 'draft' || p.status === 'scheduled' ? '—' : n(p.views));
  const edit = (p) => `/blog-editor?id=${p.id}`;
  const filtered = !!(q || cat || author);
  const clearFilters = () => { setQ(''); setCat(''); setAuthor(''); setTab('all'); };
  const closeFind = () => { setFind(false); setQ(''); setCat(''); setAuthor(''); };
  const tabs = TABS.map(([id, label]) => ({ key: id, id: 'bp-tab-' + id, label, count: db.ready ? counts[id] : null, on: tab === id, onClick: () => setTab(id) }));

  return (
    <BlogFrame screen="BlogPosts" active="blog-posts" page="Posts" css={CSS}>
      <ShopHeader icon="newspaper" title="Blog posts"
        about={`Write guides, recipes and offers for the storefront blog. Published posts appear on ${BLOG_BASE.replace(/\/$/, '')} and sync to WordPress when a connection is set up.`}
        more={[{ label: 'Categories', href: '/blog-categories' }, { label: 'Authors', href: '/blog-authors' }, { label: 'WordPress sync', href: '/woo-sync' }]}
        primary={{ label: 'New post', href: '/blog-editor' }} />

      <MetricStrip label="Blog at a glance" items={[
        { label: 'Views this month', value: db.ready ? n(monthViews) : '—' },
        { label: 'Next scheduled', value: next ? formatDate(next.publishAt) : '—', href: next ? edit(next) : undefined },
      ]} />

      <section className="ix-card" aria-label="Posts">
        {picked.length ? (
          <div className="ix-bulk" role="toolbar" aria-label="Selected posts">
            <input type="checkbox" checked={allOn} onChange={toggleAll} aria-label="Select all shown posts" style={{ width: 16, height: 16, margin: '0 6px', accentColor: 'var(--primary)' }} />
            <span className="ix-bulk__n">{picked.length} selected</span>
            <button type="button" className="ix-btn ix-btn--sm" onClick={bulkPublish}><Icon name="send" width="16" height="16" aria-hidden="true" />Publish</button>
            <Menu label="Move to category" cls="ix-btn ix-btn--sm" align="start" items={tree.map((c) => ({ label: (c.depth ? '— ' : '') + c.name, onClick: () => bulkMove(c.id) }))} />
            <button type="button" className="ix-btn ix-btn--sm" onClick={bulkArchive}><Icon name="archive" width="16" height="16" aria-hidden="true" />Archive</button>
            <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" align="start" items={[{ label: 'Delete', onClick: bulkDelete, tone: 'danger' }, { label: 'Clear selection', onClick: () => setSel([]) }]} />
          </div>
        ) : (
          <div className="ix-bar">
            {find ? (<>
              <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, tag or keyword" onDone={closeFind} autoFocus />
              <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
            </>) : (<>
              <IndexTabs tabs={tabs} label="Post status" />
              <span className="ix-tools">
                <select className="ix-pick bp-sort" aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                  {SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon bp-layout" aria-label={view === 'table' ? 'Show as cards' : 'Show as a table'} title={view === 'table' ? 'Show as cards' : 'Show as a table'} onClick={() => pickView(view === 'table' ? 'cards' : 'table')}><Icon name={view === 'table' ? 'layout-grid' : 'list'} width="16" height="16" aria-hidden="true" /></button>
                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
              </span>
            </>)}
          </div>
        )}
        {(find || cat || author) && !picked.length ? (
          <div className="ix-filters" role="group" aria-label="Filters">
            <select aria-label="Category" className={'ix-filter' + (cat ? ' is-set' : '')} value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="">Category</option>
              {tree.map((c) => <option key={c.id} value={c.id}>{c.depth ? '— ' : ''}{c.name}</option>)}
            </select>
            <select aria-label="Author" className={'ix-filter' + (author ? ' is-set' : '')} value={author} onChange={(e) => setAuthor(e.target.value)}>
              <option value="">Author</option>
              {db.authors.map((a) => <option key={a.id} value={a.id}>{a.name}{a.active ? '' : ' (inactive)'}</option>)}
            </select>
            {filtered ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setQ(''); setCat(''); setAuthor(''); }}>Clear all</button> : null}
          </div>
        ) : null}

        {!db.ready ? <div style={{ minHeight: 240 }} aria-busy="true" /> : shown.length === 0 ? (
          <div className="ix-empty"><EmptyState icon="newspaper" title={db.posts.length ? 'No posts match' : 'No posts yet'} body={db.posts.length ? 'Try another status, category, author or search.' : 'Write the first post for the storefront blog.'} actionLabel={db.posts.length ? 'Clear filters' : undefined} onAction={clearFilters} /></div>
        ) : (<>
          <ul className="ix-plist" aria-label="Posts">
            {shown.map((p) => (
              <li key={p.id}>
                <Link href={edit(p)} className="ix-pitem">
                  <span className="ix-pitem__top"><b>{p.title || 'Untitled post'}</b><PostStatus status={p.status} /></span>
                  <span className="ix-pitem__mid">{[formatDate(postDate(p)), (authorById[p.authorId] || {}).name, p.status === 'published' || p.status === 'archived' ? n(p.views) + ' views' : ''].filter(Boolean).join(' · ')}</span>
                </Link>
              </li>
            ))}
          </ul>
          {view === 'table' ? (
            <div className="ix-table-wrap">
              <table className="ix-table gc-table--keep">
                <caption className="sr-only">{`Blog posts, ${shown.length} shown`}</caption>
                <thead><tr>
                  <th scope="col" className="ix-check"><input type="checkbox" aria-label="Select all shown posts" checked={allOn} onChange={toggleAll} /></th>
                  <th scope="col">Post</th><th scope="col">Status</th><th scope="col">Category</th><th scope="col">Author</th><th scope="col">Date</th><th scope="col" className="ix-num">Views</th><th scope="col">SEO</th>
                </tr></thead>
                <tbody>
                  {shown.map((p) => {
                    const cs = cats(p);
                    return (
                      <tr key={p.id} className={picked.includes(p.id) ? 'is-sel' : ''} onClick={(e) => { if (!e.target.closest('a,button,input,label')) navigate(edit(p)); }}>
                        <td className="ix-check"><input type="checkbox" aria-label={`Select ${p.title || 'untitled post'}`} checked={picked.includes(p.id)} onChange={() => toggle(p.id)} /></td>
                        <td>
                          <span className="bp-post">
                            <Cover cover={p.cover} thumb />
                            <span><Link href={edit(p)} className="ix-strong">{p.title || 'Untitled post'}</Link>{p.featured ? <span className="bp-flag" title="Featured"><Icon name="star" width="12" height="12" aria-hidden="true" /><span className="sr-only">Featured</span></span> : null}</span>
                          </span>
                        </td>
                        <td><PostStatus status={p.status} /></td>
                        <td>{cs.length ? <><CatChip cat={cs[0]} />{cs.length > 1 ? <span className="bp-more">+{cs.length - 1}</span> : null}</> : <span className="ix-muted">None</span>}</td>
                        <td>{authorLink(p)}</td>
                        <td className="ix-muted">{formatDate(postDate(p))}</td>
                        <td className="ix-num">{views(p)}</td>
                        <td><SeoDot post={p} /></td>
                      </tr>
                    );
                  })}
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
                  <Link href={edit(p)} className="bp-title">{p.title || 'Untitled post'}</Link>
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
        </>)}
        <div className="ix-foot"><span>{shown.length === 1 ? '1 post' : shown.length + ' posts'}</span></div>
      </section>
      <LearnMore topic="blog posts" />
    </BlogFrame>
  );
}
