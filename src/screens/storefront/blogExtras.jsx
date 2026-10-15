'use client';
// Blog extras for the store: post cards, "More from <author>" and "Related posts" under a post (PostMore), and the
// pieces of the author page (/author, StoreAuthor.jsx). Only live posts count (published, public, past their publish time).
// Related = posts sharing a topic, then a tag, newest first; the author's own posts are shown above, so they are left out
// (unless the blog is too small to fill the row without them).

import React from 'react';
import { Icon } from '@/runtime/dc';
import { formatDate } from '@/lib/format';
import { getBlog, postDate } from '@/lib/blog';
import { Avatar, Cover } from '@/screens/integrations/blogShared';

export const isLive = (p) => p && p.status === 'published' && !p.private && (!p.publishAt || new Date(p.publishAt).getTime() <= Date.now());
export const livePosts = () => { let l = []; try { l = getBlog().posts.filter(isLive); } catch { l = []; } return l.sort((a, b) => new Date(postDate(b)).getTime() - new Date(postDate(a)).getTime()); };
export const authorHref = (a) => '/author?slug=' + encodeURIComponent((a && a.slug) || '');
const postHref = (p) => '/blog-post?slug=' + encodeURIComponent(p.slug);

/** One post as a card: cover, topic, date and reading time, title, short text. */
export function PostCard({ p, cats = [] }) {
  const cat = cats.find((c) => (p.categoryIds || []).includes(c.id));
  return (
    <a className="sbx-card" href={postHref(p)}>
      <Cover cover={p.cover} />
      <span className="sbx-card__t">
        <small>{cat ? <em>{cat.name}</em> : null}{formatDate(postDate(p))}{p.readingTime ? ' · ' + p.readingTime + ' min read' : ''}</small>
        <b>{p.title}</b>
        {p.excerpt ? <span>{p.excerpt}</span> : null}
      </span>
    </a>
  );
}

/** Under a post: more from its author, then related posts (each only when there is something to show). */
export function PostMore({ post }) {
  const db = getBlog();
  const all = livePosts().filter((p) => p.id !== post.id);
  const author = (db.authors || []).find((a) => a.id === post.authorId);
  const mine = author ? all.filter((p) => p.authorId === author.id).slice(0, 3) : [];
  const taken = new Set(mine.map((p) => p.id));
  const score = (p) => (p.categoryIds || []).filter((c) => (post.categoryIds || []).includes(c)).length * 2 + (p.tags || []).filter((t) => (post.tags || []).includes(t)).length;
  // the author's posts are shown above; a small blog lets them count as related too, so the section isn't one lone card
  const pool = all.filter((p) => !taken.has(p.id)).length >= 2 ? all.filter((p) => !taken.has(p.id)) : all;
  let related = pool.map((p) => [p, score(p)]).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).map(([p]) => p);
  if (related.length < 3) related = [...related, ...pool.filter((p) => !related.includes(p))].slice(0, 3);
  else related = related.slice(0, 3);
  if (!mine.length && !related.length) return null;
  return (
    <div className="sf-wrap sbx-more">
      {mine.length && author ? (
        <section aria-labelledby="sbx-mine">
          <header className="sbx-head">
            <span className="sbx-who"><Avatar author={author} size={40} /><span><small>More from</small><b id="sbx-mine">{author.name}</b></span></span>
            <a className="sbx-all" href={authorHref(author)}>All posts by {author.name.split(' ')[0]}<Icon name="arrow-right" width="16" height="16" aria-hidden="true" /></a>
          </header>
          <div className="sbx-grid">{mine.map((p) => <PostCard key={p.id} p={p} cats={db.categories || []} />)}</div>
        </section>
      ) : null}
      {related.length ? (
        <section aria-labelledby="sbx-rel">
          <header className="sbx-head"><h2 id="sbx-rel">Related posts</h2><a className="sbx-all" href="/blog">All posts<Icon name="arrow-right" width="16" height="16" aria-hidden="true" /></a></header>
          <div className="sbx-grid">{related.map((p) => <PostCard key={p.id} p={p} cats={db.categories || []} />)}</div>
        </section>
      ) : null}
    </div>
  );
}

export const BLOG_EXTRAS_CSS = `
.sbx-more{display:flex;flex-direction:column;gap:clamp(32px,5vw,56px);padding-bottom:var(--sf-section)}
.sbx-head{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:10px 20px;margin-bottom:18px;padding-bottom:12px;border-bottom:1px solid var(--sf-line)}
.sbx-head h2{margin:0!important;font-size:calc(var(--sf-fs-h2) * .82)}
.sbx-who{display:flex;align-items:center;gap:12px}
.sbx-who>span:last-child{display:flex;flex-direction:column}
.sbx-who small{color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.sbx-who b{font-family:var(--sf-font-head);font-size:var(--sf-fs-h3);font-weight:var(--sf-head-w,600);letter-spacing:var(--sf-head-track,0)}
.sbx-all{display:inline-flex;align-items:center;gap:6px;min-height:44px;color:var(--sf-primary);font-weight:var(--weight-medium);text-decoration:none}
.sbx-all:hover{text-decoration:underline}
.sbx-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr));gap:var(--sf-gap)}
.sbx-card{display:flex;flex-direction:column;min-width:0;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface);color:var(--sf-text);text-decoration:none;overflow:hidden;transition:transform .25s ease,box-shadow .25s ease}
.sbx-card:hover{transform:translateY(-3px);box-shadow:0 16px 32px -20px rgba(15,23,42,.4)}
.sbx-card .bl-cover{border-radius:0;aspect-ratio:16/9}
.sbx-card__t{display:flex;flex-direction:column;gap:8px;padding:16px 18px 20px}
.sbx-card__t small{display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px;color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.sbx-card__t em{padding:1px 10px;border-radius:var(--radius-full);background:var(--sf-soft);color:var(--sf-primary);font-style:normal;font-weight:var(--weight-medium)}
.sbx-card__t b{font-family:var(--sf-font-head);font-size:var(--sf-fs-lg);font-weight:var(--sf-head-w,600);line-height:1.3;letter-spacing:var(--sf-head-track,0)}
.sbx-card:hover .sbx-card__t b{color:var(--sf-primary)}
.sbx-card__t>span{display:-webkit-box;overflow:hidden;color:var(--sf-muted);line-height:1.55;-webkit-line-clamp:2;-webkit-box-orient:vertical}
@media (max-width:640px){
  .sbx-grid{grid-auto-flow:column;grid-template-columns:none;grid-auto-columns:84%;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding-bottom:6px}
  .sbx-grid>*{scroll-snap-align:start}
}
@media (prefers-reduced-motion:reduce){.sbx-card{transition:none}.sbx-card:hover{transform:none}}
`;
