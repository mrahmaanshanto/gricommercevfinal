'use client';
// Blog authors — who writes for the storefront blog, as a Shopify-style list.
//   Views      All, then one view per role (Admin, Editor, Author, Contributor) with counts
//   List       avatar, name, role, active or not, posts, total views, last post; a row opens /author-profile?id=
//              (where Edit, New post and Deactivate are)
//   Roles      what each role can do, folded under the list
//   Add        the shared author dialog (name, email, phone, role, bio, expertise, socials, avatar colour)
// Front end only: data from src/lib/blog.js.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { navigate } from '@/runtime/routes';
import { EmptyState } from '@/components/ui';
import { ShopHeader, IndexTabs, LearnMore } from '@/components/ui/IndexKit';
import { formatDate } from '@/lib/format';
import { ROLES, ROLE_TONE, authorStats } from '@/lib/blog';
import { BlogFrame, useBlog, Avatar, AuthorDialog } from './blogShared';

const CSS = `
.ba-who{display:inline-flex;align-items:center;gap:10px;min-width:0;max-width:280px}
.ba-who>span{min-width:0;overflow:hidden;text-overflow:ellipsis}
tr.is-off td{color:var(--text-muted)}
.ba-roles{display:flex;flex-direction:column;margin:0!important;padding:0 var(--space-4) var(--space-2)}
.ba-role{display:grid;grid-template-columns:110px minmax(0,1fr) auto;align-items:center;gap:var(--space-3);min-height:40px;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.ba-roles>.ba-role:first-child{border-top:0}
.ba-role p{margin:0;color:var(--text-body)}
.ba-role small{font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
@media (max-width:640px){.ba-role{grid-template-columns:minmax(0,1fr) auto;padding:var(--space-2) 0}.ba-role p{grid-column:1 / -1;grid-row:2}}
`;
const n = (x) => Number(x || 0).toLocaleString('en-IN');

export default function BlogAuthors() {
  const db = useBlog();
  const [edit, setEdit] = useState(null);     // null closed · {} new · author
  const [role, setRole] = useState('all');

  const rows = useMemo(() => db.authors.map((a) => ({ a, s: authorStats(a.id, db.posts) }))
    .sort((x, y) => Number(y.a.active) - Number(x.a.active) || x.a.name.localeCompare(y.a.name)), [db.authors, db.posts]);
  const shown = rows.filter(({ a }) => role === 'all' || a.role === role);
  const roleCount = (r) => db.authors.filter((a) => a.role === r && a.active).length;
  const profile = (a) => `/author-profile?id=${a.id}`;
  const tabs = [['all', 'All'], ...Object.keys(ROLES).map((r) => [r, r])].map(([id, label]) => ({ key: id, id: 'ba-tab-' + id, label, count: db.ready ? (id === 'all' ? db.authors.length : db.authors.filter((a) => a.role === id).length) : null, on: role === id, onClick: () => setRole(id) }));

  return (
    <BlogFrame screen="BlogAuthors" active="blog-authors" page="Authors" css={CSS} after={<AuthorDialog author={edit} onClose={() => setEdit(null)} />}>
      <ShopHeader icon="users" title="Blog authors"
        about="People who write for the blog. Their name, photo colour and bio show under every post they write. Inactive authors cannot write; their posts stay unless you move them."
        more={[{ label: 'All posts', href: '/blog-posts' }, { label: 'Categories', href: '/blog-categories' }]}
        primary={{ label: 'Add author', onClick: () => setEdit({}) }} />

      <section className="ix-card" aria-label="Authors">
        <div className="ix-bar"><IndexTabs tabs={tabs} label="Role" /></div>
        {!db.ready ? <div style={{ minHeight: 200 }} aria-busy="true" /> : !shown.length ? (
          <div className="ix-empty"><EmptyState icon="users" title={rows.length ? 'No authors with this role' : 'No authors yet'} body={rows.length ? undefined : 'Add the people who write for the blog.'} actionLabel={rows.length ? 'Show all authors' : 'Add author'} onAction={() => (rows.length ? setRole('all') : setEdit({}))} /></div>
        ) : (<>
          <ul className="ix-plist" aria-label="Authors">
            {shown.map(({ a, s }) => (
              <li key={a.id}>
                <Link href={profile(a)} className="ix-pitem">
                  <span className="ix-pitem__top"><b>{a.name}</b><span className={'gc-badge gc-badge--' + (ROLE_TONE[a.role] || 'slate')}>{a.role}</span></span>
                  <span className="ix-pitem__mid">{s.posts} posts · {n(s.views)} views{a.active ? '' : ' · Inactive'}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table gc-table--keep">
              <caption className="sr-only">Blog authors</caption>
              <thead><tr><th scope="col">Author</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col" className="ix-num">Posts</th><th scope="col" className="ix-num">Views</th><th scope="col">Last post</th></tr></thead>
              <tbody>
                {shown.map(({ a, s }) => (
                  <tr key={a.id} className={a.active ? '' : 'is-off'} onClick={(e) => { if (!e.target.closest('a,button')) navigate(profile(a)); }}>
                    <td><span className="ba-who"><Avatar author={a} size={28} /><Link href={profile(a)} className="ix-strong">{a.name}</Link></span></td>
                    <td><span className={'gc-badge gc-badge--' + (ROLE_TONE[a.role] || 'slate')}>{a.role}</span></td>
                    <td>{a.active ? <span className="gc-badge gc-badge--success">Active</span> : <span className="gc-badge gc-badge--slate">Inactive</span>}</td>
                    <td className="ix-num">{s.posts}<span className="ix-muted"> · {s.published} live</span></td>
                    <td className="ix-num">{n(s.views)}</td>
                    <td className="ix-muted">{s.lastPost ? formatDate(s.lastPost.publishAt) : 'Nothing published'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>)}
        <div className="ix-foot"><span>{db.ready ? (shown.length === 1 ? '1 author' : shown.length + ' authors') : ''}</span></div>
      </section>

      <details className="ix-card gc-disclose">
        <summary>What each role can do</summary>
        <div className="ba-roles">
          {Object.entries(ROLES).map(([r, help]) => (
            <div key={r} className="ba-role">
              <span><span className={'gc-badge gc-badge--' + ROLE_TONE[r]}>{r}</span></span>
              <p>{help}</p>
              <small>{db.ready ? `${roleCount(r)} active` : ''}</small>
            </div>
          ))}
        </div>
      </details>
      <LearnMore topic="blog authors" />
    </BlogFrame>
  );
}
