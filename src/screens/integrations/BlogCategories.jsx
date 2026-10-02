'use client';
// Blog categories — the sections of the storefront blog (gridshop.com.bd/blog/category/<slug>), as a Shopify-style
// list: tree order (sub-categories under their parent), colour, post counts (a link to those posts) and whether its
// search title/description are filled in. A row opens the category:
//   Add/edit   name, address (made from the name until edited, checked for clashes), parent (one level),
//              colour, description, SEO title and meta description with length counters; Delete
//   Delete     asks where its posts go (another category, or just remove it from them); sub-categories
//              move up to its parent
// Front end only: data from src/lib/blog.js.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { EmptyState, Dialog } from '@/components/ui';
import { ShopHeader, LearnMore } from '@/components/ui/IndexKit';
import { categoryTree, saveCategory, deleteCategory, slugify, uniqueSlug, slugTaken, BLOG_BASE } from '@/lib/blog';
import { BlogFrame, useBlog, CatChip, Swatches } from './blogShared';

const CSS = `
.bc-name{display:flex;align-items:center;gap:var(--space-2);min-width:0}
.bc-tw{display:inline-block;width:14px;height:14px;flex:none;border-left:1px solid var(--border-strong);border-bottom:1px solid var(--border-strong);border-radius:0 0 0 var(--radius-sm);margin:-6px 2px 0 var(--space-2)}
.bc-posts{color:var(--text-heading);font-weight:var(--weight-medium);text-decoration:none}
.bc-posts:hover{color:var(--text-link);text-decoration:underline}
.bc-count{display:flex;justify-content:space-between;margin-top:var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.bc-count .is-good{color:var(--text-success)}.bc-count .is-warn{color:var(--text-warning)}
.bc-sec{margin:0;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
`;

function Count({ len, min, max }) {
  return <p className="bc-count"><span>Best between {min} and {max}</span><span className={!len ? '' : len >= min && len <= max ? 'is-good' : 'is-warn'}>{len} characters</span></p>;
}

export default function BlogCategories() {
  const db = useBlog();
  const [form, setForm] = useState(null);       // add / edit
  const [slugEdited, setSlugEdited] = useState(false);
  const [err, setErr] = useState('');
  const [del, setDel] = useState(null);         // { cat, moveTo }

  const tree = useMemo(() => categoryTree(db.categories), [db.categories]);
  const count = (id) => db.posts.filter((p) => (p.categoryIds || []).includes(id));
  const byId = (id) => db.categories.find((c) => c.id === id);
  const uncategorised = db.posts.filter((p) => !(p.categoryIds || []).some((id) => byId(id))).length;
  const hasKids = (id) => db.categories.some((c) => c.parentId === id);

  const openAdd = () => { setForm({ name: '', slug: '', parentId: '', color: 'navy', description: '', seo: { metaTitle: '', metaDescription: '' } }); setSlugEdited(false); setErr(''); };
  const openEdit = (c) => { setForm(JSON.parse(JSON.stringify({ ...c, seo: c.seo || { metaTitle: '', metaDescription: '' } }))); setSlugEdited(true); setErr(''); };
  const setF = (patch) => setForm((f) => ({ ...f, ...patch }));
  const onName = (name) => setForm((f) => ({ ...f, name, slug: slugEdited ? f.slug : slugify(name) }));
  const clash = form && form.slug && slugTaken(form.slug, db.categories, form.id);

  const submit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) { setErr('Enter a name.'); return; }
    if (db.categories.some((c) => c.id !== form.id && c.name.toLowerCase() === name.toLowerCase())) { setErr(`There is already a category called ${name}.`); return; }
    const saved = saveCategory({ ...form, name, slug: slugify(form.slug || name) });
    toast(form.id ? `${saved.name} updated` : `Category ${saved.name} added`);
    setForm(null);
  };
  const askDelete = async (c) => {
    const posts = count(c.id);
    if (!posts.length && !hasKids(c.id)) {
      const ok = await confirmDialog({ title: `Delete ${c.name}?`, body: 'No posts use it. It is removed from the blog menu.', confirmLabel: 'Delete', tone: 'danger' });
      if (!ok) return;
      deleteCategory(c.id);
      toast(`${c.name} deleted`);
      return;
    }
    setDel({ cat: c, moveTo: c.parentId || (tree.find((x) => x.id !== c.id && x.parentId !== c.id) || {}).id || '' });
  };
  const confirmDelete = (e) => {
    e.preventDefault();
    const { cat, moveTo } = del;
    const n = count(cat.id).length;
    deleteCategory(cat.id, moveTo);
    const to = byId(moveTo);
    toast(`${cat.name} deleted${n ? ` · ${n} post${n === 1 ? '' : 's'} ${to ? `moved to ${to.name}` : 'left without it'}` : ''}`);
    setDel(null);
  };

  return (
    <BlogFrame
      screen="BlogCategories" active="blog-cats" page="Categories" css={CSS}
      after={<>
        <Dialog open={!!form} title={form && form.id ? `Edit category · ${form.name}` : 'Add a category'} onClose={() => setForm(null)} width={600}>
          {form ? (
            <form className="bl-form" onSubmit={submit} noValidate>
              <div className="bl-two">
                <div><label className="gc-label" htmlFor="bc-name">Name *</label><input id="bc-name" className={'gc-input' + (err && !form.name.trim() ? ' gc-input--error' : '')} data-autofocus value={form.name} onChange={(e) => onName(e.target.value)} aria-required="true" /></div>
                <div>
                  <label className="gc-label" htmlFor="bc-parent">Parent</label>
                  <select id="bc-parent" className="gc-input gc-select" value={form.parentId || ''} disabled={!!form.id && hasKids(form.id)} onChange={(e) => setF({ parentId: e.target.value })}>
                    <option value="">None · top level</option>
                    {tree.filter((c) => !c.depth && c.id !== form.id).map((c) => <option key={c.id} value={c.id}>Inside {c.name}</option>)}
                  </select>
                  {form.id && hasKids(form.id) ? <p className="gc-help">It has sub-categories, so it stays at the top level.</p> : null}
                </div>
              </div>
              <div>
                <label className="gc-label" htmlFor="bc-slug">Address</label>
                <input id="bc-slug" className={'gc-input' + (clash ? ' gc-input--error' : '')} value={form.slug} style={{ fontFamily: 'var(--font-data)' }} onChange={(e) => { setSlugEdited(true); setF({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-') }); }} />
                <p className={'gc-help' + (clash ? ' gc-help--error' : '')}>{clash ? `Another category uses this address. It will save as /${uniqueSlug(form.slug, db.categories, form.id)}.` : <span style={{ fontFamily: 'var(--font-data)' }}>{BLOG_BASE}category/{form.slug || '…'}</span>}</p>
              </div>
              <div><span className="gc-label">Colour</span><div className="bl-row" style={{ flexWrap: 'wrap' }}><Swatches value={form.color} onChange={(color) => setF({ color })} label="Category colour" /><CatChip cat={{ name: form.name || 'Preview', color: form.color }} /></div></div>
              <div><label className="gc-label" htmlFor="bc-desc">Description</label><textarea id="bc-desc" className="gc-input" rows={2} value={form.description} placeholder="Shown at the top of the category page." onChange={(e) => setF({ description: e.target.value })} /></div>
              <p className="bc-sec">Search engines</p>
              <div><label className="gc-label" htmlFor="bc-mt">SEO title</label><input id="bc-mt" className="gc-input" value={form.seo.metaTitle} placeholder={`${form.name || 'Category'} | GridShop blog`} onChange={(e) => setF({ seo: { ...form.seo, metaTitle: e.target.value } })} /><Count len={(form.seo.metaTitle || '').length} min={50} max={60} /></div>
              <div><label className="gc-label" htmlFor="bc-md">Meta description</label><textarea id="bc-md" className="gc-input" rows={3} value={form.seo.metaDescription} onChange={(e) => setF({ seo: { ...form.seo, metaDescription: e.target.value } })} /><Count len={(form.seo.metaDescription || '').length} min={120} max={160} /></div>
              {err ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{err}</p> : null}
              <div className="gc-modal__foot" style={{ marginTop: 0 }}>
                {form.id ? <button type="button" className="gc-btn gc-btn--flat" style={{ marginRight: 'auto', color: 'var(--text-danger)' }} onClick={() => { const c = byId(form.id); setForm(null); if (c) askDelete(c); }}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /> Delete</button> : null}
                <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setForm(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid">{form.id ? 'Save changes' : 'Add category'}</button>
              </div>
            </form>
          ) : null}
        </Dialog>

        <Dialog open={!!del} title={del ? `Delete ${del.cat.name}?` : 'Delete category'} onClose={() => setDel(null)} width={480}>
          {del ? (
            <form className="bl-form" onSubmit={confirmDelete}>
              {count(del.cat.id).length ? (
                <div>
                  <label className="gc-label" htmlFor="bc-move">Its {count(del.cat.id).length} post{count(del.cat.id).length === 1 ? '' : 's'} move to</label>
                  <select id="bc-move" className="gc-input gc-select" data-autofocus value={del.moveTo} onChange={(e) => setDel({ ...del, moveTo: e.target.value })}>
                    {tree.filter((c) => c.id !== del.cat.id).map((c) => <option key={c.id} value={c.id}>{c.depth ? '— ' : ''}{c.name}</option>)}
                    <option value="">No category · just remove it from them</option>
                  </select>
                  <p className="gc-help">Posts that already have another category keep it.</p>
                </div>
              ) : null}
              {hasKids(del.cat.id) ? <p className="gc-help" style={{ margin: 0 }}>Its sub-categories ({db.categories.filter((c) => c.parentId === del.cat.id).map((c) => c.name).join(', ')}) move up to {byId(del.cat.parentId) ? byId(del.cat.parentId).name : 'the top level'}.</p> : null}
              <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setDel(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid gc-btn--error">Delete category</button></div>
            </form>
          ) : null}
        </Dialog>
      </>}
    >
      <ShopHeader icon="folder-tree" title="Blog categories"
        about="Sections of the blog. A post can sit in more than one; sub-categories show under their parent in the blog menu."
        more={[{ label: 'All posts', href: '/blog-posts' }, { label: 'Authors', href: '/blog-authors' }]}
        primary={{ label: 'Add category', onClick: openAdd }} />

      <section className="ix-card" aria-label="Categories">
        {!db.ready ? <div style={{ minHeight: 200 }} aria-busy="true" /> : !tree.length ? (
          <div className="ix-empty"><EmptyState icon="folder-tree" title="No categories yet" body="Add a category so readers can browse posts by topic." actionLabel="Add category" onAction={openAdd} /></div>
        ) : (<>
          <ul className="ix-plist" aria-label="Categories">
            {tree.map((c) => {
              const posts = count(c.id);
              return (
                <li key={c.id}>
                  <button type="button" className="ix-pitem" onClick={() => openEdit(c)}>
                    <span className="ix-pitem__top"><b>{c.depth ? '— ' : ''}{c.name}</b><span>{posts.length} posts</span></span>
                    <span className="ix-pitem__mid">/{c.slug}{byId(c.parentId) ? ' · in ' + byId(c.parentId).name : ''}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table gc-table--keep">
              <caption className="sr-only">Blog categories</caption>
              <thead><tr><th scope="col">Category</th><th scope="col">Address</th><th scope="col" className="ix-num">Posts</th><th scope="col" className="ix-num">Live</th><th scope="col">SEO</th></tr></thead>
              <tbody>
                {tree.map((c) => {
                  const posts = count(c.id);
                  const live = posts.filter((p) => p.status === 'published').length;
                  const seoOk = c.seo && c.seo.metaTitle && c.seo.metaDescription;
                  return (
                    <tr key={c.id} onClick={(e) => { if (!e.target.closest('a,button')) openEdit(c); }}>
                      <td>
                        <div className="bc-name" style={{ paddingLeft: c.depth * 20 }}>
                          {c.depth ? <span className="bc-tw" aria-hidden="true" /> : null}
                          <CatChip cat={c} />
                        </div>
                      </td>
                      <td className="ix-muted"><span className="bl-id">/{c.slug}</span></td>
                      <td className="ix-num"><Link href={`/blog-posts?cat=${c.id}`} className="bc-posts" aria-label={`Posts in ${c.name}`}>{posts.length}</Link></td>
                      <td className="ix-num ix-muted">{live}</td>
                      <td>{seoOk ? <span className="gc-badge gc-badge--success">Set</span> : <span className="gc-badge gc-badge--warning">{c.seo && (c.seo.metaTitle || c.seo.metaDescription) ? 'Half done' : 'Missing'}</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>)}
        <div className="ix-foot">
          <span>{db.ready ? `${db.categories.length} categories` : ''}</span>
          {db.ready && uncategorised ? <Link href="/blog-posts" className="ix-warn">{`${uncategorised} post${uncategorised === 1 ? ' has' : 's have'} no category.`}</Link> : null}
        </div>
      </section>
      <LearnMore topic="blog categories" />
    </BlogFrame>
  );
}
