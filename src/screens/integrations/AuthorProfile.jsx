'use client';
// Author profile — /author-profile?id=<authorId>. The author as readers see them on the blog, inside
// the admin: avatar, name, role, bio, social links, expertise, stats (posts, total views, average
// reading time) and every post they wrote with its status. Edit opens the shared author dialog;
// "New post" starts /blog-editor?author=<id>.
// Front end only: data from src/lib/blog.js.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { PageHeader, EmptyState, ChannelIcon } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { ROLES, ROLE_TONE, authorStats, postDate, BLOG_BASE } from '@/lib/blog';
import { BlogFrame, useBlog, queryParam, Avatar, Cover, CatChip, PostStatus, SeoDot, AuthorDialog, SOCIAL_KEYS } from './blogShared';

const CSS = `
.ap-hero{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:var(--space-5);align-items:start;padding:var(--space-6)}
.ap-hero h2{margin:0;font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ap-bio{margin:var(--space-3) 0 0;max-width:var(--measure);font-size:var(--text-sm);line-height:1.6;color:var(--text-body)}
.ap-socials{display:flex;flex-wrap:wrap;gap:var(--space-2);margin-top:var(--space-4)}
.ap-social{display:inline-flex;align-items:center;gap:var(--space-2);height:36px;padding:0 var(--space-3) 0 var(--space-1);border:1px solid var(--border-subtle);border-radius:var(--radius-full);font-size:var(--text-xs);color:var(--text-body);text-decoration:none}
.ap-social:hover{border-color:var(--primary);color:var(--primary)}
.ap-acts{display:flex;flex-wrap:wrap;gap:var(--space-2);justify-content:flex-end}
.ap-card .gc-table th,.ap-card .gc-table td{padding-left:var(--space-3);padding-right:var(--space-3)}
.ap-card .gc-table th:first-child,.ap-card .gc-table td:first-child{padding-left:var(--space-5)}
.ap-title{display:block;font-weight:var(--weight-medium);color:var(--text-heading);text-decoration:none;min-width:180px;white-space:normal}
.ap-title:hover{color:var(--text-link);text-decoration:underline}
@media (max-width:767px){.ap-hero{grid-template-columns:auto minmax(0,1fr);padding:var(--space-5)}.ap-acts{grid-column:1/-1;justify-content:flex-start}}
@media (max-width:479px){.ap-hero{grid-template-columns:minmax(0,1fr)}}
`;
const n = (x) => Number(x || 0).toLocaleString('en-IN');
const href = (v) => (/^https?:\/\//i.test(v) ? v : 'https://' + v);

export default function AuthorProfile() {
  const db = useBlog();
  const [id, setId] = useState(null);   // null until the address is read
  const [edit, setEdit] = useState(null);
  useEffect(() => {
    const read = () => setId(queryParam('id'));
    read();
    window.addEventListener('gc:route', read);
    return () => window.removeEventListener('gc:route', read);
  }, []);

  const author = db.authors.find((a) => a.id === id) || null;
  const posts = useMemo(() => db.posts.filter((p) => p.authorId === id).sort((a, b) => new Date(postDate(b)) - new Date(postDate(a))), [db.posts, id]);
  const stats = author ? authorStats(author.id, db.posts) : null;
  const catById = (cid) => db.categories.find((c) => c.id === cid);

  if (db.ready && id !== null && !author) {
    return (
      <BlogFrame screen="AuthorProfile" active="blog-authors" page="Author">
        <PageHeader title="Author not found" description="This author may have been removed." actions={<Link href="/blog-authors" className="gc-btn gc-btn--neutral"><Icon name="arrow-left" width="18" height="18" aria-hidden="true" /> All authors</Link>} />
        <section className="gc-card"><EmptyState icon="user-x" title="No author with this link" body="Open an author from the authors list." /></section>
      </BlogFrame>
    );
  }

  const socials = author ? SOCIAL_KEYS.filter(([k]) => (author.socials || {})[k]) : [];

  return (
    <BlogFrame screen="AuthorProfile" active="blog-authors" page={author ? author.name : 'Author'} css={CSS} after={<AuthorDialog author={edit} onClose={() => setEdit(null)} />}>
      <PageHeader
        compact
        title={author ? author.name : 'Author'}
        description={author ? `Author profile · ${BLOG_BASE}author/${author.slug}` : 'Loading…'}
        actions={<Link href="/blog-authors" className="gc-btn gc-btn--neutral"><Icon name="arrow-left" width="18" height="18" aria-hidden="true" /> All authors</Link>}
      />
      {!author ? <div style={{ minHeight: 320 }} aria-busy="true" /> : (<>
        <section className="gc-card ap-hero" aria-label="Profile">
          <Avatar author={author} size={88} />
          <div style={{ minWidth: 0 }}>
            <div className="bl-wrap">
              <h2>{author.name}</h2>
              <span className={'gc-badge gc-badge--' + (ROLE_TONE[author.role] || 'slate')}>{author.role}</span>
              {author.active ? <span className="gc-badge gc-badge--success">Active</span> : <span className="gc-badge gc-badge--slate">Inactive</span>}
            </div>
            <span className="bl-sub" style={{ marginTop: 'var(--space-1)' }}>{ROLES[author.role]}</span>
            <p className="ap-bio">{author.bio || 'No bio yet.'}</p>
            {(author.expertise || []).length ? <div className="bl-wrap" style={{ marginTop: 'var(--space-3)' }}>{author.expertise.map((x) => <span key={x} className="bl-tag" style={{ paddingRight: 10 }}>{x}</span>)}</div> : null}
            <div className="ap-socials">
              {socials.map(([k, label]) => (
                <a key={k} className="ap-social" href={href(author.socials[k])} target="_blank" rel="noopener noreferrer"><ChannelIcon channel={k === 'website' ? 'web' : k} size={28} decorative />{label}<span className="sr-only"> (opens in a new tab)</span></a>
              ))}
              {author.email ? <a className="ap-social" href={`mailto:${author.email}`}><ChannelIcon channel="email" size={28} decorative />{author.email}</a> : null}
              {author.phone ? <a className="ap-social" href={`tel:${author.phone.replace(/[^0-9+]/g, '')}`}><ChannelIcon channel="phone" size={28} decorative /><span style={{ fontFamily: 'var(--font-data)' }}>{author.phone}</span></a> : null}
            </div>
          </div>
          <div className="ap-acts">
            <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEdit(author)}><Icon name="pencil" width="18" height="18" aria-hidden="true" /> Edit</button>
            {author.active ? <Link href={`/blog-editor?author=${author.id}`} className="gc-btn gc-btn--solid"><Icon name="plus" width="18" height="18" aria-hidden="true" /> New post</Link> : null}
          </div>
        </section>

        <div className="gc-kpis">
          <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-primary-soft)', color: 'var(--primary)' }}><Icon name="newspaper" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Posts</p><p className="gc-kpi__value">{stats.posts}<small>{stats.published} live</small></p></div></div>
          <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-success-soft)', color: 'var(--text-success)' }}><Icon name="eye" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Total views</p><p className="gc-kpi__value">{n(stats.views)}<small>all posts</small></p></div></div>
          <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-info-soft)', color: 'var(--text-info)' }}><Icon name="book-open" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Average reading time</p><p className="gc-kpi__value">{stats.avgRead || 0}<small>minutes</small></p></div></div>
          <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-warning-soft)', color: 'var(--text-warning)' }}><Icon name="calendar-clock" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Last published</p><p className="gc-kpi__value" style={{ fontSize: 'var(--text-sm-plus)' }}>{stats.lastPost ? formatDate(stats.lastPost.publishAt) : '—'}</p></div></div>
        </div>

        <section className="gc-card bl-card ap-card" aria-label={`Posts by ${author.name}`}>
          <div className="bl-head">
            <div><h2>Posts by {author.name}</h2><p>Every status, newest first.</p></div>
            <Link href={`/blog-posts?author=${author.id}`} className="bl-link" style={{ fontSize: 'var(--text-xs)' }}>Open in the post list</Link>
          </div>
          {!posts.length ? (
            <EmptyState icon="pencil-line" title="No posts yet" body={author.active ? `Start ${author.name.split(' ')[0]}’s first post.` : 'This author is inactive.'} />
          ) : (
            <div className="gc-table-wrap">
              <table className="gc-table gc-table--compact gc-table--hoverable">
                <thead><tr><th scope="col">Post</th><th scope="col">Category</th><th scope="col">Status</th><th scope="col">Date</th><th scope="col" className="bl-num">Views</th><th scope="col" className="bl-num">Read</th><th scope="col">SEO</th></tr></thead>
                <tbody>
                  {posts.map((p) => (
                    <tr key={p.id}>
                      <td><div className="bl-row"><Cover cover={p.cover} thumb /><Link href={`/blog-editor?id=${p.id}`} className="ap-title">{p.title || 'Untitled post'}</Link></div></td>
                      <td><div className="bl-wrap">{(p.categoryIds || []).map(catById).filter(Boolean).map((c) => <CatChip key={c.id} cat={c} />)}</div></td>
                      <td><PostStatus status={p.status} /></td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(postDate(p))}{p.status === 'published' && p.autoPublishedAt ? <span className="bl-sub">Published automatically</span> : null}</td>
                      <td className="bl-num">{p.status === 'draft' || p.status === 'scheduled' ? '—' : n(p.views)}</td>
                      <td className="bl-num">{p.readingTime || 1} min</td>
                      <td><SeoDot post={p} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </>)}
    </BlogFrame>
  );
}
