'use client';
// Shared pieces for the blog screens (/blog-posts, /blog-editor, /blog-categories, /blog-authors,
// /author-profile): the page frame (the shell plus one Shopify-style ix-page), the data hook, covers,
// avatars, chips, the storefront preview of a post and the author dialog. Data lives in src/lib/blog.js.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Dialog, StatusBadge, ChannelIcon } from '@/components/ui';
import { formatBDT, formatDate } from '@/lib/format';
import { getCatalog } from '@/lib/stock';
import {
  getBlog, toneOf, TONES, STATUSES, ROLES, seoScore, hasBangla, youtubeId, saveAuthor, initials, BLOG_BASE, postDate,
} from '@/lib/blog';

// ---- data -------------------------------------------------------------------------------------
const EMPTY = { posts: [], categories: [], authors: [] };
/** The blog after mount ({ posts, categories, authors, catalog, ready }); re-reads on every change. */
export function useBlog() {
  const [state, setState] = useState({ ...EMPTY, catalog: [], ready: false });
  useEffect(() => {
    const load = () => setState({ ...getBlog(), catalog: getCatalog(), ready: true });
    load();
    // re-read every 30 s so a scheduled post goes live while the page is open
    const tick = window.setInterval(() => { getBlog(); }, 30000);
    window.addEventListener('gc:blog', load);
    window.addEventListener('storage', load);
    return () => { window.clearInterval(tick); window.removeEventListener('gc:blog', load); window.removeEventListener('storage', load); };
  }, []);
  return state;
}
/** ?name= from the address bar (after mount only). */
export const queryParam = (name) => (typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get(name) || '');

// ---- styles -----------------------------------------------------------------------------------
export const BLOG_CSS = `
/* kit gap: a list right under a card head */
.ix-card__head+.ix-plist,.ix-card__head+.ix-table-wrap,.ix-card__head+.ix-plist+.ix-table-wrap{margin-top:var(--space-2)}
.bl-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.bl-strong{font-weight:var(--weight-medium);color:var(--text-heading)}
.bl-id{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.bl-link{color:var(--text-link);text-decoration:none;font-weight:var(--weight-medium)}
.bl-link:hover{text-decoration:underline}
.bl-row{display:flex;align-items:center;gap:var(--space-3);min-width:0}
.bl-wrap{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.bl-form{display:flex;flex-direction:column;gap:var(--space-4)}
.bl-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.bl-cover{position:relative;display:grid;place-items:center;overflow:hidden;width:100%;aspect-ratio:16/9;border-radius:var(--radius-lg);color:var(--text-on-dark);background:var(--surface-subtle)}
.bl-cover img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.bl-cover--thumb{width:72px;flex:none;aspect-ratio:4/3;border-radius:var(--radius-md)}
.bl-cover--thumb svg{width:20px;height:20px}
.bl-avatar{display:inline-grid;place-items:center;flex:none;border-radius:var(--radius-full);font-weight:var(--weight-semibold);font-family:var(--font-sans);line-height:1}
.bl-chip{display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 var(--space-2);border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.bl-dot{display:inline-block;width:10px;height:10px;flex:none;border-radius:var(--radius-full)}
.bl-seo{display:inline-flex;align-items:center;gap:6px;font-size:var(--text-xs);font-family:var(--font-data);color:var(--text-body)}
.bl-swatches{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.bl-swatch{width:32px;height:32px;border-radius:var(--radius-full);border:2px solid transparent;cursor:pointer;padding:0;display:grid;place-items:center}
.bl-swatch[aria-checked="true"]{border-color:var(--text-heading)}
.bl-swatch:focus-visible{outline:3px solid var(--fill-primary-soft-hover);outline-offset:2px}
.bl-chips{display:flex;flex-wrap:wrap;align-items:center;gap:6px;min-height:44px;padding:6px var(--space-2);border:1px solid var(--border-field);border-radius:var(--radius-lg);background:var(--surface-card)}
.bl-chips:focus-within{border-color:var(--border-field-focus)}
.bl-chips input{flex:1;min-width:120px;height:30px;border:0;outline:none;background:transparent;font:inherit;font-size:var(--text-sm);color:var(--text-heading)}
.bl-tag{display:inline-flex;align-items:center;gap:2px;height:28px;padding:0 4px 0 10px;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.bl-tag button{display:grid;place-items:center;width:22px;height:22px;border:0;border-radius:var(--radius-full);background:transparent;color:inherit;cursor:pointer;padding:0}
.bl-tag button:hover{background:var(--fill-primary-soft-hover)}
.bl-roles{display:flex;flex-direction:column;gap:var(--space-2)}
.bl-role{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);cursor:pointer}
.bl-role.is-on{border-color:var(--primary);background:var(--fill-primary-soft)}
.bl-role b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.bl-role small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.bl-bn{font-family:var(--font-bn)}
/* storefront preview of a post */
.bl-article{margin:0 auto;width:100%;max-width:760px;color:var(--text-body);font-size:var(--text-base);line-height:1.7}
.bl-article--mobile{max-width:390px;font-size:var(--text-sm-plus)}
.bl-article>*+*{margin-top:var(--space-5)}
.bl-article .bl-a-title{margin:0;font-size:var(--text-2xl);line-height:1.25;font-weight:var(--weight-semibold);color:var(--text-heading);letter-spacing:var(--tracking-tight)}
.bl-article--mobile .bl-a-title{font-size:var(--text-xl)}
.bl-article h3.bl-a-h2{margin:var(--space-8) 0 0;font-size:var(--text-xl);line-height:1.35;font-weight:var(--weight-semibold);color:var(--text-heading)}
.bl-article h4.bl-a-h3{margin:var(--space-6) 0 0;font-size:var(--text-lg);line-height:1.4;font-weight:var(--weight-semibold);color:var(--text-heading)}
.bl-article p{margin:0}
.bl-article .bl-a-lead{font-size:var(--text-lg);color:var(--text-muted)}
.bl-article ul,.bl-article ol{margin:0;padding-left:1.4em}
.bl-article li+li{margin-top:var(--space-1)}
.bl-article a{color:var(--text-link)}
.bl-article blockquote{margin:0;padding:var(--space-3) var(--space-5);border-left:3px solid var(--primary);background:var(--fill-primary-soft);border-radius:0 var(--radius-lg) var(--radius-lg) 0;color:var(--text-heading);font-size:var(--text-lg)}
.bl-article blockquote cite{display:block;margin-top:var(--space-2);font-size:var(--text-sm);font-style:normal;color:var(--text-muted)}
.bl-article figure{margin:0}
.bl-article figure img{display:block;width:100%;border-radius:var(--radius-xl);aspect-ratio:16/10;object-fit:cover}
.bl-article figcaption{margin-top:var(--space-2);font-size:var(--text-sm);color:var(--text-muted);text-align:center}
.bl-article hr{border:0;border-top:1px solid var(--border-subtle);margin:var(--space-8) 0}
.bl-a-meta{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-muted)}
.bl-a-product{display:flex;align-items:center;gap:var(--space-4);padding:var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card)}
.bl-a-product .bl-a-pimg{display:grid;place-items:center;width:72px;height:72px;flex:none;border-radius:var(--radius-lg)}
.bl-a-product b{display:block;font-size:var(--text-sm-plus);font-weight:var(--weight-medium);color:var(--text-heading);line-height:1.4}
.bl-a-product .bl-a-price{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading);font-size:var(--text-sm-plus)}
.bl-a-video{position:relative;display:grid;place-items:center;aspect-ratio:16/9;border-radius:var(--radius-xl);background:linear-gradient(135deg,var(--slate-700),var(--navy-900));color:var(--text-on-dark);text-align:center;font-size:var(--text-sm)}
.bl-a-video span.bl-play{display:grid;place-items:center;width:64px;height:44px;border-radius:var(--radius-lg);background:var(--error);margin:0 auto var(--space-2)}
.bl-a-table{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.bl-a-table th,.bl-a-table td{padding:var(--space-2) var(--space-3);border-bottom:1px solid var(--border-subtle);text-align:left;vertical-align:top}
.bl-a-table th{background:var(--surface-subtle);font-weight:var(--weight-semibold);color:var(--text-heading)}
.bl-a-faq details{border:1px solid var(--border-subtle);border-radius:var(--radius-lg);padding:var(--space-3) var(--space-4);background:var(--surface-card)}
.bl-a-faq details+details{margin-top:var(--space-2)}
.bl-a-faq summary{cursor:pointer;font-weight:var(--weight-medium);color:var(--text-heading)}
.bl-a-faq details p{margin-top:var(--space-2)}
.bl-a-author{display:flex;gap:var(--space-4);align-items:flex-start;padding:var(--space-4);border-radius:var(--radius-xl);background:var(--surface-subtle)}
.bl-a-author b{display:block;color:var(--text-heading);font-size:var(--text-sm-plus)}
.bl-a-author p{font-size:var(--text-sm);line-height:1.6}
.bl-a-empty{padding:var(--space-4);border:1px dashed var(--border-strong);border-radius:var(--radius-lg);font-size:var(--text-sm);color:var(--text-muted);text-align:center}
@media (max-width:599px){.bl-two{grid-template-columns:1fr}.bl-a-product{flex-wrap:wrap}}
`;

// ---- page frame -------------------------------------------------------------------------------
/** The shell and one Shopify-style page (docs/shopify-style.md); narrow for the editor and records. `after` renders
 *  outside the shell (dialogs). */
export function BlogFrame({ screen, active, page, css = '', children, after, narrow }) {
  return (
    <div className="dc-screen ds" data-screen={screen}>
      <style dangerouslySetInnerHTML={{ __html: BLOG_CSS + css }} />
      <div className="gc-shell">
        <Sidebar sticky="" active={active} />
        <main className="gc-shell__main">
          <Topbar crumb="Blog" page={page} />
          <div className="gc-shell__content">
            <div className={'ix-page' + (narrow ? ' ix-page--narrow' : '')}>{children}</div>
          </div>
        </main>
      </div>
      {after}
    </div>
  );
}

// ---- small pieces -----------------------------------------------------------------------------
/** A cover: the photo when there is one, else a gradient in the post's colour with its icon. */
export function Cover({ cover, thumb, label }) {
  const c = cover || {};
  const tone = toneOf(c.tone);
  return (
    <span className={'bl-cover' + (thumb ? ' bl-cover--thumb' : '')} style={{ background: tone.grad }} role={label ? 'img' : undefined} aria-label={label || undefined} aria-hidden={label ? undefined : 'true'}>
      {c.src ? <img src={c.src} alt="" loading="lazy" /> : <Icon name={c.icon || 'newspaper'} width="40" height="40" aria-hidden="true" />}
    </span>
  );
}

const AV_FONT = (size) => (size >= 72 ? 'var(--text-2xl)' : size >= 48 ? 'var(--text-lg)' : size >= 36 ? 'var(--text-sm)' : 'var(--text-xs)');
export function Avatar({ author, size = 36 }) {
  const a = author || { name: '?', avatar: {} };
  const tone = toneOf((a.avatar || {}).color);
  return <span className="bl-avatar" aria-hidden="true" style={{ width: size, height: size, background: tone.bg, color: tone.fg, fontSize: AV_FONT(size) }}>{(a.avatar || {}).initials || initials(a.name)}</span>;
}

export function CatChip({ cat }) {
  if (!cat) return null;
  const tone = toneOf(cat.color);
  return <span className="bl-chip" style={{ background: tone.bg, color: tone.fg }}>{cat.name}</span>;
}

export function PostStatus({ status }) {
  const s = STATUSES[status] || STATUSES.draft;
  return <StatusBadge tone={s.tone} icon={s.icon}>{s.label}</StatusBadge>;
}

const SEO_FILL = { success: 'var(--success)', warning: 'var(--warning)', error: 'var(--error)' };
export function SeoDot({ post, withLabel }) {
  const s = seoScore(post);
  return (
    <span className="bl-seo" title={`SEO ${s.score} of 100 · ${s.label}`}>
      <span className="bl-dot" style={{ background: SEO_FILL[s.tone] }} aria-hidden="true" />
      <span>{s.score}</span>
      {withLabel ? <span style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-muted)' }}>{s.label}</span> : <span className="sr-only">SEO score, {s.label}</span>}
    </span>
  );
}

/** Colour picker over the token tones. */
export function Swatches({ value, onChange, label }) {
  return (
    <div className="bl-swatches" role="radiogroup" aria-label={label}>
      {Object.entries(TONES).map(([k, t]) => (
        <button key={k} type="button" role="radio" aria-checked={value === k} aria-label={t.label} title={t.label} className="bl-swatch" style={{ background: t.grad }} onClick={() => onChange(k)}>
          {value === k ? <Icon name="check" width="14" height="14" aria-hidden="true" style={{ color: 'var(--text-on-dark)' }} /> : null}
        </button>
      ))}
    </div>
  );
}

/** Chips with a text box: Enter or comma adds, Backspace on an empty box removes the last one. */
export function ChipsInput({ id, value, onChange, placeholder, suggestions = [], label }) {
  const [text, setText] = useState('');
  const list = value || [];
  const add = (raw) => {
    const parts = String(raw).split(',').map((s) => s.trim()).filter(Boolean);
    const next = list.slice();
    parts.forEach((p) => { if (!next.some((x) => x.toLowerCase() === p.toLowerCase())) next.push(p); });
    if (next.length !== list.length) onChange(next);
    setText('');
  };
  const listId = id ? id + '-list' : undefined;
  return (
    <div className="bl-chips" onClick={(e) => { const i = e.currentTarget.querySelector('input'); if (i && e.target === e.currentTarget) i.focus(); }}>
      {list.map((t) => (
        <span key={t} className="bl-tag">{t}<button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(list.filter((x) => x !== t))}><Icon name="x" width="12" height="12" aria-hidden="true" /></button></span>
      ))}
      <input
        id={id} value={text} placeholder={list.length ? '' : placeholder} aria-label={label} list={suggestions.length ? listId : undefined}
        onChange={(e) => { if (e.target.value.includes(',')) add(e.target.value); else setText(e.target.value); }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); if (text.trim()) add(text); }
          else if (e.key === 'Backspace' && !text && list.length) onChange(list.slice(0, -1));
        }}
        onBlur={() => { if (text.trim()) add(text); }}
      />
      {suggestions.length ? <datalist id={listId}>{suggestions.filter((s) => !list.includes(s)).map((s) => <option key={s} value={s} />)}</datalist> : null}
    </div>
  );
}

// ---- markdown-lite ----------------------------------------------------------------------------
const safeUrl = (u) => (/^(https?:\/\/|\/|#|mailto:)/i.test(String(u || '').trim()) ? String(u).trim() : '#');
const previewClick = (e) => { e.preventDefault(); toast('Links open on the live website. This is a preview.', { tone: 'info' }); };
/** **bold**, *italic* and [text](url) as React nodes. Anything else stays plain text. */
export function Inline({ text }) {
  const s = String(text || '');
  const out = [];
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\))/g;
  let last = 0, m, k = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    if (m[2] != null) out.push(<strong key={k++}>{m[2]}</strong>);
    else if (m[3] != null) out.push(<em key={k++}>{m[3]}</em>);
    else out.push(<a key={k++} href={safeUrl(m[5])} onClick={previewClick}>{m[4]}</a>);
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push(s.slice(last));
  return <>{out}</>;
}
const bn = (s) => (hasBangla(s) ? 'bl-bn' : undefined);

function ProductCard({ sku, catalog }) {
  const p = (catalog || []).find((x) => x.sku === sku);
  if (!p) return <div className="bl-a-empty">Choose a product for this card.</div>;
  return (
    <div className="bl-a-product">
      <span className="bl-a-pimg" style={{ background: 'var(--fill-primary-soft)', color: 'var(--primary)' }}><Icon name="shopping-bag" width="28" height="28" aria-hidden="true" /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <b>{p.name}</b>
        <span className="bl-sub">{[p.variant, p.cat].filter(Boolean).join(' · ')}</span>
        <span className="bl-a-price">{formatBDT(p.price)}</span>
      </div>
      <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => toast(`${p.name} would go to the cart on the live website.`, { tone: 'info' })}><Icon name="shopping-bag" width="16" height="16" aria-hidden="true" /> Add to cart</button>
    </div>
  );
}

/** One block as the storefront shows it. Headings step down one level inside the admin page. */
export function BlockView({ block: b, catalog }) {
  switch (b.type) {
    case 'h2': return b.text ? <h3 className={'bl-a-h2 ' + (bn(b.text) || '')}>{b.text}</h3> : null;
    case 'h3': return b.text ? <h4 className={'bl-a-h3 ' + (bn(b.text) || '')}>{b.text}</h4> : null;
    case 'list': {
      const items = (b.items || []).filter((x) => String(x).trim());
      if (!items.length) return null;
      const Tag = b.ordered ? 'ol' : 'ul';
      return <Tag>{items.map((x, i) => <li key={i} className={bn(x)}><Inline text={x} /></li>)}</Tag>;
    }
    case 'quote': return b.text ? <blockquote className={bn(b.text)}><Inline text={b.text} />{b.cite ? <cite>— {b.cite}</cite> : null}</blockquote> : null;
    case 'image': return b.src ? <figure><img src={b.src} alt={b.alt || ''} loading="lazy" />{b.caption ? <figcaption>{b.caption}</figcaption> : null}</figure> : null;
    case 'product': return <ProductCard sku={b.sku} catalog={catalog} />;
    case 'cta': return b.label ? <p style={{ textAlign: 'center' }}><a className={'gc-btn ' + (b.style === 'outline' ? 'gc-btn--outlined' : 'gc-btn--solid')} href={safeUrl(b.url)} onClick={previewClick} style={{ textDecoration: 'none' }}>{b.label}</a></p> : null;
    case 'divider': return <hr />;
    case 'embed': {
      const id = youtubeId(b.url);
      return <div className="bl-a-video">{id ? <div><span className="bl-play"><Icon name="play" width="22" height="22" aria-hidden="true" /></span>YouTube video · <span style={{ fontFamily: 'var(--font-data)' }}>{id}</span></div> : <div>Paste a YouTube link to show the video here.</div>}</div>;
    }
    case 'table': {
      const rows = b.rows || [];
      if (!rows.length) return null;
      const head = b.header ? rows[0] : null;
      const body = b.header ? rows.slice(1) : rows;
      return (
        <div className="gc-table-wrap"><table className="bl-a-table">
          {head ? <thead><tr>{head.map((c, i) => <th key={i} scope="col">{c}</th>)}</tr></thead> : null}
          <tbody>{body.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={bn(c)}>{c}</td>)}</tr>)}</tbody>
        </table></div>
      );
    }
    case 'faq': {
      const items = (b.items || []).filter((x) => x.q);
      if (!items.length) return null;
      return <div className="bl-a-faq">{items.map((x, i) => <details key={i}><summary className={bn(x.q)}>{x.q}</summary><p className={bn(x.a)}>{x.a}</p></details>)}</div>;
    }
    default: return b.text ? <p className={bn(b.text)}><Inline text={b.text} /></p> : null;
  }
}

/** The post as the storefront shows it: cover, categories, title, byline, blocks, tags, author box, related products. */
export function PostPreview({ post, db, device = 'desktop' }) {
  const author = db.authors.find((a) => a.id === post.authorId);
  const cats = (post.categoryIds || []).map((id) => db.categories.find((c) => c.id === id)).filter(Boolean);
  const related = (post.relatedProductSkus || []).filter(Boolean);
  return (
    <article className={'bl-article' + (device === 'mobile' ? ' bl-article--mobile' : '')} data-preview="">
      <Cover cover={post.cover} label={(post.cover || {}).alt || 'Cover image'} />
      {cats.length ? <div className="bl-wrap">{cats.map((c) => <CatChip key={c.id} cat={c} />)}</div> : null}
      <h2 className={'bl-a-title ' + (bn(post.title) || '')}>{post.title || 'Untitled post'}</h2>
      <div className="bl-a-meta">
        {author ? <><Avatar author={author} size={28} /><span style={{ color: 'var(--text-heading)', fontWeight: 'var(--weight-medium)' }}>{author.name}</span><span aria-hidden="true">·</span></> : null}
        <span>{formatDate(postDate(post))}</span><span aria-hidden="true">·</span><span>{post.readingTime || 1} min read</span>
      </div>
      {post.excerpt ? <p className={'bl-a-lead ' + (bn(post.excerpt) || '')}>{post.excerpt}</p> : null}
      {(post.blocks || []).map((b) => <BlockView key={b.id} block={b} catalog={db.catalog} />)}
      {(post.tags || []).length ? <div className="bl-wrap">{post.tags.map((t) => <span key={t} className="bl-chip" style={{ background: 'var(--surface-subtle)', color: 'var(--text-body)' }}>#{t}</span>)}</div> : null}
      {author ? (
        <div className="bl-a-author">
          <Avatar author={author} size={48} />
          <div style={{ minWidth: 0 }}><b>{author.name}</b><span className="bl-sub">{author.role}{(author.expertise || []).length ? ' · ' + author.expertise.join(', ') : ''}</span><p style={{ marginTop: 'var(--space-2)' }}>{author.bio}</p></div>
        </div>
      ) : null}
      {related.length ? (
        <div>
          <p style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-heading)', marginBottom: 'var(--space-3)' }}>Shop this post</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>{related.map((s) => <ProductCard key={s} sku={s} catalog={db.catalog} />)}</div>
        </div>
      ) : null}
      {post.allowComments ? <p className="bl-sub">Comments are open · {post.comments || 0} so far</p> : null}
      <p className="bl-sub" style={{ fontFamily: 'var(--font-data)' }}>{BLOG_BASE}{post.slug || 'untitled'}</p>
    </article>
  );
}

// ---- author dialog ----------------------------------------------------------------------------
const SOCIALS = [['facebook', 'Facebook', 'facebook.com/…'], ['instagram', 'Instagram', 'instagram.com/…'], ['linkedin', 'LinkedIn', 'linkedin.com/in/…'], ['x', 'X', 'x.com/…'], ['website', 'Website', 'example.com']];
export const SOCIAL_KEYS = SOCIALS;
const blankAuthor = () => ({ name: '', email: '', phone: '', role: 'Author', bio: '', expertise: [], socials: { facebook: '', instagram: '', linkedin: '', x: '', website: '' }, avatar: { color: 'navy' }, active: true });

/** Add or edit an author. `author` null = closed, {} = new. Calls onSaved(author) after saving. */
export function AuthorDialog({ author, onClose, onSaved }) {
  const [f, setF] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    if (author) { const b = blankAuthor(); setF({ ...b, ...JSON.parse(JSON.stringify(author)), socials: { ...b.socials, ...(author.socials || {}) }, avatar: { ...b.avatar, ...(author.avatar || {}) } }); setErr(''); }
    else setF(null);
  }, [author]);
  const set = (patch) => setF((x) => ({ ...x, ...patch }));
  const submit = (e) => {
    e.preventDefault();
    if (!f.name.trim()) { setErr('Enter the author’s name.'); return; }
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) { setErr('Check the email address.'); return; }
    const saved = saveAuthor({ ...f, name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim() });
    toast(author && author.id ? `${saved.name} updated` : `${saved.name} added as ${saved.role}`);
    if (onSaved) onSaved(saved);
    onClose();
  };
  const open = !!author && !!f;
  return (
    <Dialog open={open} title={author && author.id ? `Edit author · ${author.name}` : 'Add an author'} onClose={onClose} width={640}>
      {open ? (
        <form className="bl-form" onSubmit={submit} noValidate>
          <div className="bl-row">
            <Avatar author={{ name: f.name || '?', avatar: { color: f.avatar.color, initials: initials(f.name || '?') } }} size={56} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <span className="gc-label" id="ad-colour">Avatar colour</span>
              <Swatches value={f.avatar.color} onChange={(color) => set({ avatar: { ...f.avatar, color } })} label="Avatar colour" />
            </div>
          </div>
          <div className="bl-two">
            <div><label className="gc-label" htmlFor="ad-name">Name *</label><input id="ad-name" className={'gc-input' + (err && !f.name.trim() ? ' gc-input--error' : '')} data-autofocus value={f.name} onChange={(e) => set({ name: e.target.value })} aria-required="true" /></div>
            <div><label className="gc-label" htmlFor="ad-email">Email</label><input id="ad-email" type="email" className="gc-input" value={f.email} onChange={(e) => set({ email: e.target.value })} placeholder="name@gridshop.com.bd" /></div>
          </div>
          <div className="bl-two">
            <div><label className="gc-label" htmlFor="ad-phone">Phone</label><input id="ad-phone" type="tel" inputMode="tel" className="gc-input" value={f.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="01XXX-XXXXXX" style={{ fontFamily: 'var(--font-data)' }} /></div>
            <div><span className="gc-label">Status</span><label className="bl-row" style={{ height: 44 }}><button type="button" className="gc-switch" role="switch" aria-checked={f.active} aria-label="Active" onClick={() => set({ active: !f.active })}><span className="gc-switch__knob" /></button><span>{f.active ? 'Active · can write' : 'Inactive · cannot sign in'}</span></label></div>
          </div>
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="gc-label">Role *</legend>
            <div className="bl-roles" role="radiogroup" aria-label="Role">
              {Object.entries(ROLES).map(([r, help]) => (
                <label key={r} className={'bl-role' + (f.role === r ? ' is-on' : '')}>
                  <input type="radio" name="ad-role" className="gc-check gc-check--radio" checked={f.role === r} onChange={() => set({ role: r })} />
                  <span><b>{r}</b><small>{help}</small></span>
                </label>
              ))}
            </div>
          </fieldset>
          <div><label className="gc-label" htmlFor="ad-bio">Short bio</label><textarea id="ad-bio" className="gc-input" rows={3} maxLength={300} value={f.bio} onChange={(e) => set({ bio: e.target.value })} placeholder="Shown under their posts and on their profile." /><p className="gc-help">{f.bio.length} of 300 characters</p></div>
          <div><label className="gc-label" htmlFor="ad-exp">Expertise</label><ChipsInput id="ad-exp" label="Expertise" value={f.expertise} onChange={(expertise) => set({ expertise })} placeholder="Type a topic and press Enter" suggestions={['Fashion', 'Skin care', 'Recipes', 'Gadgets', 'Phones', 'Offers', 'Store news']} /></div>
          <div>
            <span className="gc-label">Social profiles</span>
            <div className="bl-two">
              {SOCIALS.map(([k, label, ph]) => (
                <div key={k} className="bl-row"><ChannelIcon channel={k === 'website' ? 'web' : k} size={28} decorative /><input id={'ad-' + k} className="gc-input" aria-label={label} placeholder={ph} value={f.socials[k] || ''} onChange={(e) => set({ socials: { ...f.socials, [k]: e.target.value } })} /></div>
              ))}
            </div>
          </div>
          {err ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{err}</p> : null}
          <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid">{author && author.id ? 'Save changes' : 'Add author'}</button></div>
        </form>
      ) : null}
    </Dialog>
  );
}
