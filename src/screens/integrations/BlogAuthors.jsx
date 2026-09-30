'use client';
// Blog authors — who writes for the storefront blog and what each person may do.
//   Roles      Admin, Editor, Author, Contributor, each with a short explanation
//   List       avatar, name, email/phone, role, posts (live), total views, last post, active switch;
//              name → /author-profile?id=
//   Add/edit   the shared author dialog (name, email, phone, role, bio, expertise, socials, avatar colour)
//   Deactivate an author with posts asks who takes the posts over (or keeps them under their name)
// Front end only: data from src/lib/blog.js.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { PageHeader, EmptyState, Dialog } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { ROLES, ROLE_TONE, authorStats, setAuthorActive } from '@/lib/blog';
import { BlogFrame, useBlog, Avatar, AuthorDialog } from './blogShared';

const CSS = `
.ba-roles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--space-3)}
.ba-role{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card)}
.ba-role p{margin:0;font-size:var(--text-xs);color:var(--text-muted);line-height:1.5}
.ba-role b{font-family:var(--font-data);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body)}
.ba-card .gc-table th,.ba-card .gc-table td{padding-left:var(--space-3);padding-right:var(--space-3)}
.ba-card .gc-table th:first-child,.ba-card .gc-table td:first-child{padding-left:var(--space-5)}
.ba-who{display:flex;align-items:center;gap:var(--space-3);min-width:220px;text-decoration:none;color:inherit}
.ba-who:hover .bl-strong{color:var(--text-link);text-decoration:underline}
.ba-acts{display:flex;justify-content:flex-end;gap:var(--space-1)}
tr.is-off td{color:var(--text-muted)}
@media (max-width:1023px){.ba-roles{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:599px){.ba-roles{grid-template-columns:minmax(0,1fr)}}
`;
const n = (x) => Number(x || 0).toLocaleString('en-IN');

export default function BlogAuthors() {
  const db = useBlog();
  const [edit, setEdit] = useState(null);     // null closed · {} new · author
  const [off, setOff] = useState(null);       // { author, to }

  const rows = useMemo(() => db.authors.map((a) => ({ a, s: authorStats(a.id, db.posts) }))
    .sort((x, y) => Number(y.a.active) - Number(x.a.active) || x.a.name.localeCompare(y.a.name)), [db.authors, db.posts]);
  const roleCount = (r) => db.authors.filter((a) => a.role === r && a.active).length;

  const toggle = (a) => {
    if (a.active) {
      const s = authorStats(a.id, db.posts);
      if (s.posts) { setOff({ author: a, to: (db.authors.find((x) => x.active && x.id !== a.id) || {}).id || '' }); return; }
      setAuthorActive(a.id, false);
      toast(`${a.name} is now inactive`);
    } else {
      setAuthorActive(a.id, true);
      toast(`${a.name} is active again`);
    }
  };
  const confirmOff = (e) => {
    e.preventDefault();
    const { author, to } = off;
    const count = authorStats(author.id, db.posts).posts;
    setAuthorActive(author.id, false, to);
    const who = db.authors.find((x) => x.id === to);
    toast(`${author.name} is inactive${who ? ` · ${count} post${count === 1 ? '' : 's'} moved to ${who.name}` : ' · posts stay under their name'}`);
    setOff(null);
  };

  return (
    <BlogFrame
      screen="BlogAuthors" active="blog-authors" page="Authors" css={CSS}
      after={<>
        <AuthorDialog author={edit} onClose={() => setEdit(null)} />
        <Dialog open={!!off} title={off ? `Deactivate ${off.author.name}?` : 'Deactivate author'} onClose={() => setOff(null)} width={480}>
          {off ? (
            <form className="bl-form" onSubmit={confirmOff}>
              <p className="gc-help" style={{ margin: 0 }}>{off.author.name} has {authorStats(off.author.id, db.posts).posts} posts. Choose who looks after them from now on.</p>
              <div>
                <label className="gc-label" htmlFor="ba-to">Move the posts to</label>
                <select id="ba-to" className="gc-input gc-select" data-autofocus value={off.to} onChange={(e) => setOff({ ...off, to: e.target.value })}>
                  {db.authors.filter((x) => x.active && x.id !== off.author.id).map((x) => <option key={x.id} value={x.id}>{x.name} · {x.role}</option>)}
                  <option value="">Keep them under {off.author.name}</option>
                </select>
                <p className="gc-help">{off.to ? 'The byline changes on the website too.' : 'The posts stay live with their name; they can no longer edit them.'}</p>
              </div>
              <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setOff(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid gc-btn--error">Deactivate</button></div>
            </form>
          ) : null}
        </Dialog>
      </>}
    >
      <PageHeader
        title="Blog authors"
        description="People who write for the blog. Their name, photo colour and bio show under every post they write."
        actions={<>
          <Link href="/blog-posts" className="gc-btn gc-btn--neutral"><Icon name="newspaper" width="18" height="18" aria-hidden="true" /> All posts</Link>
          <button type="button" className="gc-btn gc-btn--solid" onClick={() => setEdit({})}><Icon name="user-plus" width="18" height="18" aria-hidden="true" /> Add author</button>
        </>}
      />

      <section className="ba-roles" aria-label="What each role can do">
        {Object.entries(ROLES).map(([r, help]) => (
          <div key={r} className="ba-role">
            <div className="bl-row" style={{ justifyContent: 'space-between' }}><span className={'gc-badge gc-badge--' + ROLE_TONE[r]}>{r}</span><b>{db.ready ? `${roleCount(r)} active` : ''}</b></div>
            <p>{help}</p>
          </div>
        ))}
      </section>

      <section className="gc-card bl-card ba-card" aria-label="Authors">
        <div className="bl-head"><div><h2>{db.ready ? `${db.authors.length} authors` : 'Authors'}</h2><p>Inactive authors cannot write; their posts stay unless you move them.</p></div></div>
        {!db.ready ? <div style={{ minHeight: 200 }} aria-busy="true" /> : !rows.length ? (
          <EmptyState icon="users" title="No authors yet" body="Add the people who write for the blog." actionLabel="Add author" onAction={() => setEdit({})} />
        ) : (
          <div className="gc-table-wrap">
            <table className="gc-table gc-table--compact gc-table--hoverable">
              <thead><tr><th scope="col">Author</th><th scope="col">Role</th><th scope="col" className="bl-num">Posts</th><th scope="col" className="bl-num">Views</th><th scope="col">Last post</th><th scope="col">Active</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {rows.map(({ a, s }) => (
                  <tr key={a.id} className={a.active ? '' : 'is-off'}>
                    <td>
                      <Link href={`/author-profile?id=${a.id}`} className="ba-who">
                        <Avatar author={a} size={40} />
                        <span style={{ minWidth: 0 }}><span className="bl-strong">{a.name}</span><span className="bl-sub">{a.email || 'No email'}{a.phone ? ` · ${a.phone}` : ''}</span></span>
                      </Link>
                    </td>
                    <td><span className={'gc-badge gc-badge--' + (ROLE_TONE[a.role] || 'slate')}>{a.role}</span></td>
                    <td className="bl-num"><span className="bl-strong">{s.posts}</span><span className="bl-sub">{s.published} live</span></td>
                    <td className="bl-num">{n(s.views)}</td>
                    <td>{s.lastPost ? <><Link href={`/blog-editor?id=${s.lastPost.id}`} className="bl-link" style={{ display: 'block', minWidth: 160, whiteSpace: 'normal' }}>{s.lastPost.title}</Link><span className="bl-sub">{formatDate(s.lastPost.publishAt)}</span></> : <span className="bl-sub">Nothing published</span>}</td>
                    <td><button type="button" className="gc-switch" role="switch" aria-checked={a.active} aria-label={`${a.name} active`} onClick={() => toggle(a)}><span className="gc-switch__knob" /></button></td>
                    <td>
                      <div className="ba-acts">
                        <Link href={`/author-profile?id=${a.id}`} className="gc-btn gc-btn--xs gc-btn--flat">Profile</Link>
                        <button type="button" className="gc-btn gc-btn--xs gc-btn--neutral" onClick={() => setEdit(a)} aria-label={`Edit ${a.name}`}>Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </BlogFrame>
  );
}
