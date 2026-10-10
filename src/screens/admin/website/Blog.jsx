'use client';
// Blog (/admin/website/blog) — the posts on gridcommerce.net/blog. Adapted from the merchant panel's blog screens
// (screens/integrations/BlogPosts.jsx, BlogCategories.jsx, BlogAuthors.jsx) without their data (lib/blog.js is the
// merchant's): Posts · Categories · Authors in the title row.
//   Posts       status views with counts (All, Published, Scheduled, In review, Drafts), category and author filters,
//               search; a row opens the editor (/admin/website/blog/edit?slug=). New post opens an empty editor.
//   Categories  the site's BLOG_CATEGORIES (English + Bangla); add, rename, remove (only when no post uses it).
//   Authors     who writes; add, edit, remove (only without posts).
// ?tab=categories|authors and ?view=published… open those. Data: lib/admin/website.js (posts, postStatus, categories,
// authors, saveCategory, removeCategory, saveAuthor, removeAuthor). The posts start from the site's articles.ts.

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, EmptyState } from '@/components/ui';
import { FilterBar } from '@/components/ui/FilterBar';
import { ShopHeader, IndexTabs, Pager } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { dmy } from '@/lib/platform/util';
import { posts as allPosts, postStatus, categories, authors, catLabel, saveCategory, removeCategory, saveAuthor, removeAuthor, LIVE_HOST } from '@/lib/admin/website';
import { AdminShell } from '../AdminShell';
import { WEB_CSS, useWeb, when, StatusTag, Who, Field, ctl, plural } from './webShared';

const PAGE = 20;
const VIEWS = [['all', 'All'], ['Published', 'Published'], ['Scheduled', 'Scheduled'], ['review', 'In review'], ['Draft', 'Drafts']];
const inView = (s, v) => v === 'all' || (v === 'review' ? s === 'In review' || s === 'Approved' : s === v);
const AREAS = [['posts', 'Posts'], ['categories', 'Categories'], ['authors', 'Authors']];
const CSS = `
.bg-filters{padding:8px;border-bottom:1px solid var(--border-subtle)}
.bg-filters .gc-filterbar__search{max-width:300px}
.bg-post{display:flex;align-items:center;gap:var(--space-3);min-width:0;max-width:420px}
.bg-thumb{display:grid;place-items:center;flex:none;width:40px;height:28px;border-radius:var(--radius-md);background:var(--fill-primary-soft);color:var(--primary)}
.bg-post .wb-title{max-width:360px}
.bg-lang{display:inline-flex;gap:4px}
.bg-lang span{padding:0 6px;border-radius:var(--radius-full);border:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-muted)}
.bg-lang span.is-on{border-color:var(--primary);color:var(--primary)}
.ix-table tbody tr.is-link{cursor:pointer}
.ix-table tbody tr:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.bg-rowacts{display:flex;justify-content:flex-end;gap:var(--space-2)}
.ix-pitem .bg-rowacts{justify-content:flex-start;margin-top:4px}
.bg-bio{max-width:420px;color:var(--text-muted);font-size:var(--text-xs)}
`;

const editHref = (slug) => '/admin/website/blog/edit?slug=' + encodeURIComponent(slug);

export default function Blog() {
  const router = useRouter();
  const { t, live, me } = useWeb();
  const [area, setArea] = useState('posts');
  const [view, setView] = useState('all');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [author, setAuthor] = useState('');
  const [page, setPage] = useState(0);
  const [form, setForm] = useState(null);   // { kind: 'cat'|'author', id, …fields, error }
  const [ready, setReady] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (AREAS.some(([k]) => k === p.get('tab'))) setArea(p.get('tab'));
    if (VIEWS.some(([k]) => k === p.get('view'))) setView(p.get('view'));
    setCat(p.get('cat') || ''); setAuthor(p.get('author') || '');
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const p = new URLSearchParams();
    if (area !== 'posts') p.set('tab', area);
    if (view !== 'all') p.set('view', view);
    if (cat) p.set('cat', cat);
    if (author) p.set('author', author);
    const s = p.toString();
    window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
    if (first.current) { first.current = false; return; }
    setPage(0);
  }, [ready, area, view, cat, author, q]);

  const list = live ? allPosts().map((p) => ({ ...p, st: postStatus(p, t) })) : [];
  const s = q.trim().toLowerCase();
  const base = list.filter((p) => (!cat || p.cat === cat) && (!author || p.author === author) && (!s || [p.title.en, p.title.bn, p.slug, p.excerpt.en, p.author].join(' ').toLowerCase().includes(s)));
  const counts = Object.fromEntries(VIEWS.map(([k]) => [k, base.filter((p) => inView(p.st, k)).length]));
  const shown = base.filter((p) => inView(p.st, view)).sort((a, b) => {
    if (view === 'Scheduled') return (a.publishAt || 0) - (b.publishAt || 0);
    return (b.st === 'Published' ? b.publishAt : b.updatedAt) - (a.st === 'Published' ? a.publishAt : a.updatedAt);
  });
  const pages = Math.max(1, Math.ceil(shown.length / PAGE));
  const pg = Math.min(page, pages - 1);
  const rows = shown.slice(pg * PAGE, pg * PAGE + PAGE);
  const cats = live ? categories() : [];
  const people = live ? authors() : [];
  const dateOf = (p) => (p.st === 'Published' ? 'Published ' + when(p.publishAt, t) : p.st === 'Scheduled' ? 'Goes live ' + when(p.publishAt, t) : 'Edited ' + when(p.updatedAt, t));

  const exportCsv = () => {
    if (!shown.length) { toast('Nothing to export'); return; }
    downloadCsv('gridcommerce-blog-posts.csv', [['Title', 'Title (Bangla)', 'Address', 'Category', 'Author', 'Status', 'Publish date', 'Last edited'],
      ...shown.map((p) => [p.title.en, p.title.bn, LIVE_HOST + '/blog/' + p.slug, catLabel(p.cat), p.author, p.st, p.publishAt ? dmy(p.publishAt) : '', dmy(p.updatedAt)])]);
    toast(plural(shown.length, 'post') + ' exported');
  };
  const saveForm = () => {
    const r = form.kind === 'cat' ? saveCategory(form.id, { en: form.en, bn: form.bn }, me) : saveAuthor(form.id, { name: form.name, role: form.role, bio: form.bio }, me);
    if (!r.ok) { setForm({ ...form, error: r.error }); return; }
    toast(form.id ? 'Saved' : form.kind === 'cat' ? 'Category added' : 'Author added');
    setForm(null);
  };
  const dropCat = async (c) => {
    if (!(await confirmDialog({ title: `Remove “${c.en}”?`, body: 'The category disappears from the blog’s filter.', confirmLabel: 'Remove', tone: 'danger' }))) return;
    const r = removeCategory(c.slug, me); toast(r.ok ? 'Category removed' : r.error);
  };
  const dropAuthor = async (a) => {
    if (!(await confirmDialog({ title: `Remove ${a.name}?`, body: 'They can no longer be picked as a post’s author.', confirmLabel: 'Remove', tone: 'danger' }))) return;
    const r = removeAuthor(a.id, me); toast(r.ok ? 'Author removed' : r.error);
  };

  const primary = area === 'categories' ? { label: 'Add category', icon: 'plus', onClick: () => setForm({ kind: 'cat', id: null, en: '', bn: '', error: '' }) }
    : area === 'authors' ? { label: 'Add author', icon: 'plus', onClick: () => setForm({ kind: 'author', id: null, name: '', role: '', bio: '', error: '' }) }
      : { label: 'New post', icon: 'plus', href: '/admin/website/blog/edit' };
  const areaSwitch = (
    <span className="wb-seg" role="group" aria-label="Blog area">
      {AREAS.map(([k, label]) => <button key={k} type="button" aria-pressed={area === k} onClick={() => setArea(k)}>{label}</button>)}
    </span>
  );

  let body;
  if (!live) body = <div className="wb-skel" aria-busy="true" aria-label="Loading the blog" />;
  else if (area === 'categories') {
    body = (
      <section className="ix-card" aria-label="Categories">
        {cats.length ? (<>
          <ul className="ix-plist" aria-label="Categories">
            {cats.map((c) => (
              <li key={c.slug}>
                <div className="ix-pitem">
                  <span className="ix-pitem__top"><b>{c.en}</b><span className="wb-data">{plural(list.filter((p) => p.cat === c.slug).length, 'post')}</span></span>
                  <span className="ix-pitem__mid wb-bn">{c.bn || '—'}</span>
                  <span className="bg-rowacts"><button type="button" className="ix-btn ix-btn--sm" onClick={() => setForm({ kind: 'cat', id: c.slug, en: c.en, bn: c.bn, error: '' })}>Edit</button><button type="button" className="ix-btn ix-btn--sm" onClick={() => dropCat(c)}>Remove</button></span>
                </div>
              </li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table gc-table--keep">
              <caption className="sr-only">Blog categories</caption>
              <thead><tr><th scope="col">Category</th><th scope="col">Bangla</th><th scope="col">Address</th><th scope="col" className="ix-num">Posts</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {cats.map((c) => {
                  const n = list.filter((p) => p.cat === c.slug).length;
                  return (
                    <tr key={c.slug}>
                      <td className="ix-strong">{c.en}</td>
                      <td className="wb-bn">{c.bn || <span className="ix-muted">—</span>}</td>
                      <td className="wb-path">/blog?category={c.slug}</td>
                      <td className="ix-num"><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setCat(c.slug); setArea('posts'); setView('all'); }}>{n}</button></td>
                      <td><span className="bg-rowacts">
                        <button type="button" className="ix-btn ix-btn--sm" onClick={() => setForm({ kind: 'cat', id: c.slug, en: c.en, bn: c.bn, error: '' })}>Edit</button>
                        <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" aria-label={'Remove ' + c.en} onClick={() => dropCat(c)}><Icon name="trash-2" width="14" height="14" aria-hidden="true" /></button>
                      </span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>) : <div className="ix-empty"><EmptyState icon="folder" title="No categories yet." actionLabel="Add category" onAction={primary.onClick} /></div>}
      </section>
    );
  } else if (area === 'authors') {
    body = (
      <section className="ix-card" aria-label="Authors">
        {people.length ? (<>
          <ul className="ix-plist" aria-label="Authors">
            {people.map((a) => (
              <li key={a.id}>
                <div className="ix-pitem">
                  <span className="ix-pitem__top"><b>{a.name}</b><span className="wb-data">{plural(list.filter((p) => p.author === a.name).length, 'post')}</span></span>
                  <span className="ix-pitem__mid">{[a.role, a.bio].filter(Boolean).join(' · ') || '—'}</span>
                  <span className="bg-rowacts"><button type="button" className="ix-btn ix-btn--sm" onClick={() => setForm({ kind: 'author', id: a.id, name: a.name, role: a.role, bio: a.bio, error: '' })}>Edit</button><button type="button" className="ix-btn ix-btn--sm" onClick={() => dropAuthor(a)}>Remove</button></span>
                </div>
              </li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table gc-table--keep">
              <caption className="sr-only">Blog authors</caption>
              <thead><tr><th scope="col">Author</th><th scope="col">Role</th><th scope="col">About</th><th scope="col" className="ix-num">Posts</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {people.map((a) => {
                  const n = list.filter((p) => p.author === a.name).length;
                  return (
                    <tr key={a.id}>
                      <td><span className="wb-person"><Who name={a.name} size={28} /><b className="ix-strong">{a.name}</b></span></td>
                      <td className="ix-muted">{a.role || '—'}</td>
                      <td><span className="bg-bio">{a.bio || '—'}</span></td>
                      <td className="ix-num"><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setAuthor(a.name); setArea('posts'); setView('all'); }}>{n}</button></td>
                      <td><span className="bg-rowacts">
                        <button type="button" className="ix-btn ix-btn--sm" onClick={() => setForm({ kind: 'author', id: a.id, name: a.name, role: a.role, bio: a.bio, error: '' })}>Edit</button>
                        <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" aria-label={'Remove ' + a.name} onClick={() => dropAuthor(a)}><Icon name="trash-2" width="14" height="14" aria-hidden="true" /></button>
                      </span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>) : <div className="ix-empty"><EmptyState icon="users" title="No authors yet." actionLabel="Add author" onAction={primary.onClick} /></div>}
      </section>
    );
  } else {
    const tabs = VIEWS.map(([k, label]) => ({ key: k, id: 'bg-tab-' + k, label, count: counts[k], on: view === k, onClick: () => setView(k) }));
    const filters = [
      { key: 'cat', label: 'Category', all: 'All categories', value: cat, options: cats.map((c) => [c.slug, c.en]), onChange: setCat },
      { key: 'author', label: 'Author', all: 'All authors', value: author, options: people.map((a) => [a.name, a.name]), onChange: setAuthor },
    ];
    const filtersOn = !!(s || cat || author);
    body = (
      <section className="ix-card" aria-label="Posts">
        <div className="ix-bar"><IndexTabs tabs={tabs} label="Post status" /></div>
        <div className="bg-filters"><FilterBar label="Filter posts" filters={filters} onClear={() => setQ('')} search={{ value: q, onChange: setQ, placeholder: 'Search title, address or author' }} /></div>
        {!shown.length ? (
          <div className="ix-empty">
            {filtersOn ? <EmptyState title="No posts match." actionLabel="Clear filters" onAction={() => { setQ(''); setCat(''); setAuthor(''); }} />
              : <EmptyState icon="newspaper" title={view === 'Scheduled' ? 'Nothing is scheduled.' : 'No posts here.'} actionLabel="New post" onAction={() => router.push('/admin/website/blog/edit')} />}
          </div>
        ) : (
          <>
            <ul className="ix-plist" aria-label="Posts">
              {rows.map((p) => (
                <li key={p.slug}>
                  <Link href={editHref(p.slug)} className="ix-pitem">
                    <span className="ix-pitem__top"><b>{p.title.en}</b><StatusTag s={p.st} /></span>
                    <span className="ix-pitem__mid">{catLabel(p.cat)} · {p.author}</span>
                    <span className="ix-pitem__mid">{dateOf(p)}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table gc-table--keep">
                <caption className="sr-only">Blog posts</caption>
                <thead><tr><th scope="col">Post</th><th scope="col">Category</th><th scope="col">Author</th><th scope="col">Languages</th><th scope="col">Status</th><th scope="col">Date</th></tr></thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p.slug} className="is-link" tabIndex={0} onClick={() => router.push(editHref(p.slug))} onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) router.push(editHref(p.slug)); }}>
                      <td>
                        <span className="bg-post">
                          <span className="bg-thumb" aria-hidden="true"><Icon name="image" width="16" height="16" /></span>
                          <span className="wb-title"><Link href={editHref(p.slug)} className="ix-strong" onClick={(e) => e.stopPropagation()} title={p.title.en}>{p.title.en}</Link><span className="wb-path">/blog/{p.slug}</span></span>
                        </span>
                      </td>
                      <td className="ix-muted">{catLabel(p.cat)}</td>
                      <td><span className="wb-person"><Who name={p.author} />{p.author}</span></td>
                      <td><span className="bg-lang"><span className={p.body.en ? 'is-on' : ''}>EN</span><span className={p.title.bn && p.body.bn ? 'is-on' : ''}>বাং</span></span></td>
                      <td><StatusTag s={p.st} /></td>
                      <td className="ix-muted ix-nowrap">{dateOf(p)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <Pager label={shown.length ? `${pg * PAGE + 1}–${pg * PAGE + rows.length} of ${shown.length}` : '0 posts'} atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />
      </section>
    );
  }

  return (
    <AdminShell active="web-blog" title="Blog">
      <style dangerouslySetInnerHTML={{ __html: WEB_CSS + CSS }} />
      <div className="ix-page">
        <ShopHeader icon="newspaper" title="Blog" middle={areaSwitch}
          about="The posts on gridcommerce.net/blog, starting from the site's articles.ts. Every post has English and Bangla text. A post moves Draft → In review → Approved (by someone other than the editor) → Published, or Scheduled when its publish date is ahead. Categories and authors are the blog's filters and bylines."
          secondary={area === 'posts' ? [{ label: 'Export', icon: 'download', onClick: exportCsv }] : []}
          more={[{ label: 'Open the blog', onClick: () => window.open(LIVE_HOST + '/blog', '_blank', 'noopener') }]}
          primary={primary} />
        {body}
      </div>

      <Sheet open={!!form} title={form ? (form.kind === 'cat' ? (form.id ? 'Edit category' : 'Add category') : (form.id ? 'Edit author' : 'Add author')) : ''} onClose={() => setForm(null)}
        footer={<>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setForm(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={saveForm}>Save</button>
        </>}>
        {form ? (
          <div className="wb-flow">
            {form.kind === 'cat' ? (
              <>
                <Field id="bg-en" label="Name" error={form.error}><input id="bg-en" {...ctl(form.error)} data-autofocus value={form.en} onChange={(e) => setForm({ ...form, en: e.target.value, error: '' })} placeholder="e.g. Payments" /></Field>
                <Field id="bg-bn" label="Name in Bangla"><input id="bg-bn" lang="bn" className="gc-input wb-bn" value={form.bn} onChange={(e) => setForm({ ...form, bn: e.target.value })} placeholder="যেমন পেমেন্ট" /></Field>
                {form.id ? <p className="wb-small">The address stays /blog?category={form.id}.</p> : null}
              </>
            ) : (
              <>
                <Field id="bg-name" label="Name" error={form.error}><input id="bg-name" {...ctl(form.error)} data-autofocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, error: '' })} /></Field>
                <Field id="bg-role" label="Role"><input id="bg-role" {...ctl(false)} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Operations" /></Field>
                <Field id="bg-bio" label="About" hint="One line under the byline."><textarea id="bg-bio" {...ctl(false)} rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={200} /></Field>
              </>
            )}
          </div>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
