'use client';
// Author profile — /author-profile?id=<authorId>, a Shopify-style record: back to the authors, the name with the role
// and whether they are active, Edit, New post (/blog-editor?author=<id>), and under More actions the post list
// filtered to them and Deactivate / Activate (an author with posts is asked who takes them over). The work column
// lists every post they wrote; the side has the bio, expertise, contact and social links, and their figures (posts,
// total views, average reading time, last published). Front end only: data from src/lib/blog.js.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { EmptyState, ChannelIcon, Dialog } from '@/components/ui';
import { RecordHeader, KV } from '@/components/ui/IndexKit';
import { formatDate } from '@/lib/format';
import { ROLES, ROLE_TONE, authorStats, setAuthorActive, postDate, BLOG_BASE } from '@/lib/blog';
import { BlogFrame, useBlog, queryParam, Avatar, Cover, PostStatus, SeoDot, AuthorDialog, SOCIAL_KEYS } from './blogShared';

const CSS = `
.ap-about{display:flex;flex-direction:column;gap:var(--space-3)}
.ap-who{display:flex;align-items:center;gap:var(--space-3)}
.ap-who small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.ap-bio{margin:0;font-size:var(--text-sm);line-height:1.6;color:var(--text-body)}
.ap-links{display:flex;flex-direction:column;gap:2px;margin-top:var(--space-2)}
.ap-link{display:flex;align-items:center;gap:var(--space-2);min-height:32px;font-size:var(--text-sm);color:var(--text-body);text-decoration:none;overflow-wrap:anywhere}
.ap-link:hover{color:var(--text-link)}
.ap-post{display:flex;align-items:center;gap:10px;min-width:0;max-width:240px}
.ap-post>a{min-width:0;overflow:hidden;text-overflow:ellipsis}
.ap-post .bl-cover--thumb{width:32px;border-radius:var(--radius-md)}
.ap-post .bl-cover--thumb svg{width:16px;height:16px}
`;
const n = (x) => Number(x || 0).toLocaleString('en-IN');
const href = (v) => (/^https?:\/\//i.test(v) ? v : 'https://' + v);

export default function AuthorProfile() {
  const db = useBlog();
  const [id, setId] = useState(null);   // null until the address is read
  const [edit, setEdit] = useState(null);
  const [off, setOff] = useState(null); // { author, to }: who takes the posts over when deactivating
  useEffect(() => {
    const read = () => setId(queryParam('id'));
    read();
    window.addEventListener('gc:route', read);
    return () => window.removeEventListener('gc:route', read);
  }, []);

  const author = db.authors.find((a) => a.id === id) || null;
  const posts = useMemo(() => db.posts.filter((p) => p.authorId === id).sort((a, b) => new Date(postDate(b)) - new Date(postDate(a))), [db.posts, id]);
  const stats = author ? authorStats(author.id, db.posts) : null;

  if (db.ready && id !== null && !author) {
    return (
      <BlogFrame screen="AuthorProfile" active="blog-authors" page="Author" narrow>
        <RecordHeader back="/blog-authors" backLabel="All authors" title="Author not found" about="This author may have been removed." />
        <section className="ix-card ix-empty"><EmptyState icon="user-x" title="No author with this link" body="Open an author from the authors list." /></section>
      </BlogFrame>
    );
  }

  const socials = author ? SOCIAL_KEYS.filter(([k]) => (author.socials || {})[k]) : [];
  const toggleActive = () => {
    if (author.active) {
      if (stats.posts) { setOff({ author, to: (db.authors.find((x) => x.active && x.id !== author.id) || {}).id || '' }); return; }
      setAuthorActive(author.id, false);
      toast(`${author.name} is now inactive`);
    } else {
      setAuthorActive(author.id, true);
      toast(`${author.name} is active again`);
    }
  };
  const confirmOff = (e) => {
    e.preventDefault();
    const { author: a, to } = off;
    const count = authorStats(a.id, db.posts).posts;
    setAuthorActive(a.id, false, to);
    const who = db.authors.find((x) => x.id === to);
    toast(`${a.name} is inactive${who ? ` · ${count} post${count === 1 ? '' : 's'} moved to ${who.name}` : ' · posts stay under their name'}`);
    setOff(null);
  };
  const editor = (p) => `/blog-editor?id=${p.id}`;

  const dialogs = (<>
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
  </>);

  return (
    <BlogFrame screen="AuthorProfile" active="blog-authors" page={author ? author.name : 'Author'} css={CSS} after={dialogs} narrow>
      <RecordHeader back="/blog-authors" backLabel="All authors"
        title={author ? author.name : 'Author'}
        badges={author ? <>
          <span className={'gc-badge gc-badge--' + (ROLE_TONE[author.role] || 'slate')}>{author.role}</span>
          {author.active ? <span className="gc-badge gc-badge--success">Active</span> : <span className="gc-badge gc-badge--slate">Inactive</span>}
        </> : null}
        meta={author ? `${BLOG_BASE}author/${author.slug}` : 'Loading…'}
        secondary={author ? [{ label: 'Edit', onClick: () => setEdit(author) }] : []}
        more={author ? [{ label: 'Open in the post list', href: `/blog-posts?author=${author.id}` }, author.active ? { label: 'Deactivate', onClick: toggleActive, tone: 'danger' } : { label: 'Activate', onClick: toggleActive }] : []}
        primary={author && author.active ? { label: 'New post', href: `/blog-editor?author=${author.id}` } : null} />

      {!author ? <div style={{ minHeight: 320 }} aria-busy="true" /> : (
        <div className="ix-record">
          <div className="ix-main">
            <section className="ix-card" aria-labelledby="ap-posts">
              <header className="ix-card__head"><h2 id="ap-posts">Posts</h2><Link href={`/blog-posts?author=${author.id}`}>Open in the post list</Link></header>
              {!posts.length ? (
                <div className="ix-empty"><EmptyState icon="pencil-line" title="No posts yet" body={author.active ? `Start ${author.name.split(' ')[0]}’s first post.` : 'This author is inactive.'} /></div>
              ) : (<>
                <ul className="ix-plist" aria-label={`Posts by ${author.name}`}>
                  {posts.map((p) => (
                    <li key={p.id}>
                      <Link href={editor(p)} className="ix-pitem">
                        <span className="ix-pitem__top"><b>{p.title || 'Untitled post'}</b><PostStatus status={p.status} /></span>
                        <span className="ix-pitem__mid">{formatDate(postDate(p))}{p.status === 'published' || p.status === 'archived' ? ' · ' + n(p.views) + ' views' : ''}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="ix-table-wrap">
                  <table className="ix-table gc-table--keep">
                    <caption className="sr-only">{`Posts by ${author.name}`}</caption>
                    <thead><tr><th scope="col">Post</th><th scope="col">Status</th><th scope="col">Date</th><th scope="col" className="ix-num">Views</th><th scope="col">SEO</th></tr></thead>
                    <tbody>
                      {posts.map((p) => (
                        <tr key={p.id} onClick={(e) => { if (!e.target.closest('a')) navigate(editor(p)); }}>
                          <td><span className="ap-post"><Cover cover={p.cover} thumb /><Link href={editor(p)} className="ix-strong">{p.title || 'Untitled post'}</Link></span></td>
                          <td><PostStatus status={p.status} /></td>
                          <td className="ix-muted">{formatDate(postDate(p))}</td>
                          <td className="ix-num">{p.status === 'draft' || p.status === 'scheduled' ? '—' : n(p.views)}</td>
                          <td><SeoDot post={p} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>)}
            </section>
          </div>

          <div className="ix-side">
            <section className="ix-card" aria-labelledby="ap-about">
              <header className="ix-card__head"><h2 id="ap-about">About</h2></header>
              <div className="ix-card__body ap-about">
                <div className="ap-who"><Avatar author={author} size={48} /><span><b className="ix-strong">{author.name}</b><small>{ROLES[author.role]}</small></span></div>
                <p className="ap-bio">{author.bio || 'No bio yet.'}</p>
                {(author.expertise || []).length ? <div className="bl-wrap">{author.expertise.map((x) => <span key={x} className="bl-tag" style={{ paddingRight: 10 }}>{x}</span>)}</div> : null}
              </div>
            </section>

            <section className="ix-card" aria-labelledby="ap-figs">
              <header className="ix-card__head"><h2 id="ap-figs">Summary</h2></header>
              <div className="ix-card__body">
                <KV rows={[
                  ['Posts', `${stats.posts} · ${stats.published} live`],
                  ['Total views', n(stats.views)],
                  ['Average reading time', `${stats.avgRead || 0} minutes`],
                  ['Last published', stats.lastPost ? formatDate(stats.lastPost.publishAt) : '—'],
                ]} />
              </div>
            </section>

            <section className="ix-card" aria-labelledby="ap-contact">
              <header className="ix-card__head"><h2 id="ap-contact">Contact</h2></header>
              <div className="ix-card__body">
                <KV rows={[['Email', author.email || '—'], ['Phone', author.phone ? <span style={{ fontFamily: 'var(--font-data)' }}>{author.phone}</span> : '—']]} />
                {socials.length || author.email || author.phone ? (
                  <div className="ap-links">
                    {socials.map(([k, label]) => (
                      <a key={k} className="ap-link" href={href(author.socials[k])} target="_blank" rel="noopener noreferrer"><ChannelIcon channel={k === 'website' ? 'web' : k} size={20} decorative />{label}<span className="sr-only"> (opens in a new tab)</span></a>
                    ))}
                    {author.email ? <a className="ap-link" href={`mailto:${author.email}`}><ChannelIcon channel="email" size={20} decorative />Email</a> : null}
                    {author.phone ? <a className="ap-link" href={`tel:${author.phone.replace(/[^0-9+]/g, '')}`}><ChannelIcon channel="phone" size={20} decorative />Call</a> : null}
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      )}
    </BlogFrame>
  );
}
