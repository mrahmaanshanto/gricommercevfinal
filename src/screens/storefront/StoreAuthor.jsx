'use client';
// Blog author (/author?slug=shila-rahman): who writes for the shop. A hero with the author's avatar, role, topics, bio
// and links; their figures (posts, minutes of reading, writing since); every live post they wrote (with a topic filter
// when they write in more than one); and the shop's other writers. The head carries a Person schema (name, role, bio,
// links) so search engines can tie the posts to a real person. Authors come from the blog (Online Store › Blog ›
// Authors, lib/blog.js); their email and phone stay private. Front end only: the live website serves /blog/author/<slug>.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { getBlog } from '@/lib/blog';
import { toneOf } from '@/lib/blog';
import { formatDate } from '@/lib/format';
import { Avatar } from '@/screens/integrations/blogShared';
import { StoreChrome, Crumbs, NotFound } from './storeChrome';
import { PostCard, livePosts, authorHref, BLOG_EXTRAS_CSS } from './blogExtras';
import { PAGE_STYLES_CSS } from './pageStyles';

const SOCIAL = [['website', 'Website', 'globe'], ['facebook', 'Facebook', 'facebook'], ['instagram', 'Instagram', 'instagram'], ['linkedin', 'LinkedIn', 'linkedin'], ['x', 'X', 'at-sign']];
const url = (x) => (/^https?:\/\//.test(x) ? x : 'https://' + String(x).replace(/^\/+/, ''));

export default function StoreAuthor() {
  const [st, setSt] = useState({ ready: false, author: null, posts: [], others: [], cats: [] });
  const [cat, setCat] = useState('');
  useEffect(() => {
    let slug = '';
    try { slug = new URLSearchParams(window.location.search).get('slug') || ''; } catch { slug = ''; }
    const db = getBlog();
    const live = livePosts();
    const author = (db.authors || []).find((a) => a.slug === slug && a.active !== false) || null;
    const posts = author ? live.filter((p) => p.authorId === author.id) : [];
    const others = (db.authors || []).filter((a) => a.active !== false && (!author || a.id !== author.id)).map((a) => ({ ...a, count: live.filter((p) => p.authorId === a.id).length })).filter((a) => a.count > 0);
    setSt({ ready: true, author, posts, others, cats: db.categories || [] });
  }, []);
  const a = st.author;
  const topics = useMemo(() => st.cats.filter((c) => st.posts.some((p) => (p.categoryIds || []).includes(c.id))), [st]);
  const shown = cat ? st.posts.filter((p) => (p.categoryIds || []).includes(cat)) : st.posts;
  const minutes = st.posts.reduce((n, p) => n + (Number(p.readingTime) || 1), 0);
  const links = a ? SOCIAL.filter(([k]) => a.socials && a.socials[k]).map(([k, l, ic]) => ({ k, l, ic, href: url(a.socials[k]) })) : [];
  const head = a ? {
    title: `${a.name} · Dazzle Shop blog`, description: a.bio || '', robots: 'index, follow', canonical: '', og: {},
    jsonld: [{ '@context': 'https://schema.org', '@type': 'Person', name: a.name, jobTitle: a.role, description: a.bio || '', knowsAbout: a.expertise || [], sameAs: links.map((x) => x.href) }],
  } : null;
  const tone = a ? toneOf((a.avatar || {}).color) : null;
  return (
    <StoreChrome screen="StoreAuthor" kind="author" head={head} css={PAGE_STYLES_CSS + BLOG_EXTRAS_CSS + AUTHOR_CSS}>
      {(shell) => (!st.ready ? <div style={{ minHeight: 400 }} aria-busy="true" /> : !a ? <NotFound shell={shell} /> : (
        <div className="sau">
          <div className="sf-wrap"><Crumbs items={[{ name: 'Blog', href: '/blog' }, { name: a.name }]} /></div>
          <header className="sf-wrap sau-hero" style={{ '--sau-tone': tone.bg, '--sau-ink': tone.fg }}>
            <span className="sau-av"><Avatar author={a} size={112} /></span>
            <div className="sau-who">
              <p className="sau-role">{a.role === 'Admin' ? 'Founder' : a.role === 'Contributor' ? 'Guest writer' : a.role}</p>
              <h1>{a.name}</h1>
              {a.bio ? <p className="sau-bio">{a.bio}</p> : null}
              {(a.expertise || []).length ? <ul className="sau-topics" aria-label="Writes about">{a.expertise.map((t) => <li key={t}>{t}</li>)}</ul> : null}
              {links.length ? <div className="sau-links">{links.map((x) => <a key={x.k} href={x.href} target="_blank" rel="noopener noreferrer me" aria-label={`${a.name} on ${x.l}`}><Icon name={x.ic} width="18" height="18" aria-hidden="true" /></a>)}</div> : null}
            </div>
            {st.posts.length ? <dl className="sau-figs">
              <div><dt>{st.posts.length}</dt><dd>{st.posts.length === 1 ? 'post' : 'posts'}</dd></div>
              <div><dt>{minutes}</dt><dd>minutes of reading</dd></div>
              {a.joinedAt ? <div><dt>{new Date(a.joinedAt).getFullYear()}</dt><dd>writing since</dd></div> : null}
            </dl> : null}
          </header>
          <section className="sf-wrap sau-posts" aria-labelledby="sau-h">
            <header className="sbx-head">
              <h2 id="sau-h">Posts by {a.name.split(' ')[0]}</h2>
              {topics.length > 1 ? (
                <div className="sbl-cats" role="tablist" aria-label="Topics">
                  <button type="button" role="tab" aria-selected={!cat} onClick={() => setCat('')}>All</button>
                  {topics.map((c) => <button key={c.id} type="button" role="tab" aria-selected={cat === c.id} onClick={() => setCat(c.id)}>{c.name}</button>)}
                </div>
              ) : null}
            </header>
            {shown.length ? <div className="sbx-grid">{shown.map((p) => <PostCard key={p.id} p={p} cats={st.cats} />)}</div>
              : <div className="ssv-empty sau-empty"><Icon name="pen-line" width="28" height="28" aria-hidden="true" /><p>{a.name.split(' ')[0]}’s first post is on its way.</p><a className="sf-btn sf-btn--line" href="/blog">Read the blog</a></div>}
            {shown[0] ? <p className="sau-last">Last post {formatDate(shown[0].publishedAt || shown[0].updatedAt || Date.now())}</p> : null}
          </section>
          {st.others.length ? (
            <section className="sf-wrap sau-others" aria-labelledby="sau-o">
              <header className="sbx-head"><h2 id="sau-o">More writers</h2></header>
              <div className="sau-others__grid">
                {st.others.map((o) => (
                  <a key={o.id} href={authorHref(o)} className="sau-mini">
                    <Avatar author={o} size={52} />
                    <span><b>{o.name}</b><small>{(o.expertise || []).slice(0, 2).join(' · ') || o.role}</small><em>{o.count} {o.count === 1 ? 'post' : 'posts'}</em></span>
                    <Icon name="arrow-right" width="16" height="16" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ))}
    </StoreChrome>
  );
}

const AUTHOR_CSS = `
.sau{display:flex;flex-direction:column;gap:clamp(28px,5vw,56px);padding-bottom:var(--sf-section)}
.sau-hero{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:clamp(20px,4vw,48px);padding-top:clamp(24px,4vw,44px)!important;padding-bottom:clamp(24px,4vw,44px)!important;border-radius:var(--sf-radius-card);background:linear-gradient(120deg,color-mix(in srgb,var(--sau-tone) 70%,var(--sf-surface)),var(--sf-surface) 70%);border:1px solid var(--sf-line)}
.sau-av .bl-avatar{box-shadow:0 0 0 6px var(--sf-surface),0 18px 36px -18px rgba(15,23,42,.45)}
.sau-who{display:flex;flex-direction:column;align-items:flex-start;gap:10px;min-width:0}
.sau-role{margin:0;color:var(--sau-ink);font-size:var(--sf-fs-sm);font-weight:var(--weight-semibold)}
.sau-who h1{margin:0!important;font-size:var(--sf-fs-h1);line-height:1.05}
.sau-bio{margin:0;max-width:60ch;color:var(--sf-text);font-size:var(--sf-fs-lg);line-height:1.6}
.sau-topics{display:flex;flex-wrap:wrap;gap:6px;margin:0;padding:0;list-style:none}
.sau-topics li{padding:4px 12px;border-radius:var(--radius-full);background:var(--sf-surface);border:1px solid var(--sf-line);font-size:var(--sf-fs-sm)}
.sau-links{display:flex;gap:8px}
.sau-links a{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:var(--sf-surface);border:1px solid var(--sf-line);color:var(--sf-text);transition:background .2s ease,color .2s ease}
.sau-links a:hover{background:var(--sf-primary);border-color:var(--sf-primary);color:var(--sf-on-primary)}
.sau-figs{display:flex;flex-direction:column;gap:14px;margin:0;padding-left:clamp(16px,3vw,32px);border-left:1px solid var(--sf-line)}
.sau-figs dt{font-family:var(--sf-font-head);font-size:var(--sf-fs-h2);font-weight:var(--sf-head-w,600);line-height:1;color:var(--sf-primary);font-variant-numeric:tabular-nums}
.sau-figs dd{margin:2px 0 0;color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.sau-posts .sbx-head{align-items:center}
.sau-empty{display:flex;flex-direction:column;align-items:center;gap:12px;padding:40px 16px;border:1px dashed var(--sf-line);border-radius:var(--sf-radius-card);text-align:center;color:var(--sf-muted)}
.sau-empty svg{color:var(--sf-primary)}
.sau-empty p{margin:0}
.sau-last{margin:14px 0 0;color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.sau-others__grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr));gap:12px}
.sau-mini{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:14px;padding:14px 16px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface);color:var(--sf-text);text-decoration:none;transition:border-color .2s ease}
.sau-mini:hover{border-color:var(--sf-primary)}
.sau-mini>span{display:flex;flex-direction:column;min-width:0}
.sau-mini b{font-weight:var(--weight-semibold)}
.sau-mini small{overflow:hidden;color:var(--sf-muted);font-size:var(--sf-fs-sm);text-overflow:ellipsis;white-space:nowrap}
.sau-mini em{color:var(--sf-primary);font-style:normal;font-size:var(--sf-fs-sm)}
.sau-mini>svg{color:var(--sf-muted)}
@media (max-width:900px){
  .sau-hero{grid-template-columns:auto minmax(0,1fr)}
  .sau-figs{grid-column:1 / -1;flex-direction:row;flex-wrap:wrap;gap:12px 32px;padding:16px 0 0;border-left:0;border-top:1px solid var(--sf-line)}
}
@media (max-width:640px){
  .sau-hero{grid-template-columns:minmax(0,1fr);text-align:left}
  .sau-av .bl-avatar{width:84px!important;height:84px!important}
  .sau-posts .sbx-head{flex-direction:column;align-items:flex-start}
}
@media (prefers-reduced-motion:reduce){.sau-links a,.sau-mini{transition:none}}
`;
