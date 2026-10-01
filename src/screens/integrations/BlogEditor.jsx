'use client';
// Blog editor — write or edit one post. /blog-editor = new post, /blog-editor?id=<postId> edits,
// /blog-editor?author=<authorId> starts a new post for that author.
//   Main column   title, address (slug: follows the title until edited, checked for clashes), excerpt,
//                 and the block editor: add blocks with "+" (paragraph, H2/H3, list, quote, image, product
//                 card from the stock catalogue, button, divider, YouTube, table, FAQ); move them up/down
//                 (buttons or Alt+↑/↓), duplicate, delete (with undo). Paragraphs take **bold**, *italic*
//                 and [links](url) from the small toolbar or Ctrl/⌘+B, I, K.
//   Preview       the post as the storefront shows it, desktop or mobile width.
//   Side panels   Publish, Category (tree + add new), Tags, Author, Cover image, SEO (keyword, keywords,
//                 meta title/description with counters, address, canonical, noindex, Google preview and a
//                 scored checklist), Social share (OG + preview), Related products.
//   Saving        every 4 s: a draft saves itself; a live or scheduled post keeps its changes on this
//                 device until Update. Leaving with unsaved changes asks first. Publishing checks the
//                 title, a category, the meta description and the cover alt text.
// Front end only: data from src/lib/blog.js, products from src/lib/stock.js.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { PageHeader, EmptyState } from '@/components/ui';
import { formatBDT, formatDate, formatTime, formatDateTime } from '@/lib/format';
import {
  getPost, blankPost, savePost, deletePosts, publishProblems, getAutosave, setAutosave, clearAutosave,
  BLOCK_TYPES, newBlock, cloneBlock, wordCount, readingTime, uniqueSlug, slugTaken, slugify,
  categoryTree, saveCategory, seoScore, GALLERY, COVER_ICONS, VISIBILITY, ROLES, BLOG_BASE, SITE, youtubeId, toneOf,
} from '@/lib/blog';
import { BlogFrame, useBlog, queryParam, Cover, Avatar, PostStatus, PostPreview, ChipsInput, Swatches } from './blogShared';

const AUTOSAVE_MS = 4000;
const clone = (x) => JSON.parse(JSON.stringify(x));
const norm = (p) => { if (!p) return ''; const { updatedAt, readingTime: rt, ...rest } = p; return JSON.stringify(rest); };
const hasContent = (p) => !!(String(p.title || '').trim() || String(p.excerpt || '').trim() || wordCount(p.blocks) > 0);
const pad = (x) => String(x).padStart(2, '0');
const toLocalInput = (iso) => { if (!iso) return ''; const d = new Date(iso); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const fromLocalInput = (s) => (s ? new Date(s).toISOString() : null);
const cut = (s, max) => (s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s);
const rowsFor = (s, min = 3) => Math.min(16, Math.max(min, String(s || '').split('\n').reduce((a, line) => a + Math.max(1, Math.ceil(line.length / 80)), 0)));

const CSS = `
.be-bar{position:sticky;top:var(--header-height);z-index:20;display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);padding:var(--space-3) var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-soft)}
.be-save{flex:1 1 180px;min-width:0;font-size:var(--text-xs);color:var(--text-muted)}
.be-save b{font-weight:var(--weight-medium);color:var(--text-body)}
.be-bar .be-acts{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.be-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,360px);gap:var(--space-5);align-items:start}
.be-main,.be-side{display:flex;flex-direction:column;gap:var(--space-4);min-width:0}
.be-card{padding:var(--space-5);display:flex;flex-direction:column;gap:var(--space-4)}
.be-title{height:56px;font-size:var(--text-xl);font-weight:var(--weight-semibold)}
.be-slug{display:flex;align-items:stretch;min-width:0}
.be-slug span{display:flex;align-items:center;padding:0 var(--space-3);border:1px solid var(--border-field);border-right:0;border-radius:var(--radius-lg) 0 0 var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap;font-family:var(--font-data)}
.be-slug input{border-radius:0 var(--radius-lg) var(--radius-lg) 0;font-family:var(--font-data);min-width:0}
.be-count{display:flex;justify-content:space-between;gap:var(--space-2);margin-top:var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.be-count .is-good{color:var(--text-success)}.be-count .is-warn{color:var(--text-warning)}
.be-blocks{display:flex;flex-direction:column}
.be-block{border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card)}
.be-block:focus-within{border-color:var(--border-field-focus)}
.be-bhead{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);padding:var(--space-1) var(--space-2) var(--space-1) var(--space-4);border-bottom:1px solid var(--border-subtle);background:var(--surface-subtle);border-radius:var(--radius-xl) var(--radius-xl) 0 0}
.be-btype{display:inline-flex;align-items:center;gap:var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.be-bacts{display:flex;flex-wrap:wrap;gap:2px}
.be-bacts .gc-iconbtn[disabled]{opacity:.35;cursor:default}
.be-bbody{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4)}
.be-tools{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-1)}
.be-tool{display:inline-grid;place-items:center;width:36px;height:36px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);color:var(--text-body);cursor:pointer;padding:0}
.be-tool:hover{background:var(--surface-subtle);color:var(--text-heading)}
.be-tools .bl-sub{margin-left:var(--space-2)}
.be-text{line-height:1.6}
.be-ins{position:relative;display:flex;justify-content:center;height:28px;align-items:center}
.be-ins::before{content:"";position:absolute;left:var(--space-4);right:var(--space-4);top:50%;border-top:1px dashed var(--border-subtle)}
.be-plus{position:relative;display:inline-grid;place-items:center;width:28px;height:28px;border:1px solid var(--border-strong);border-radius:var(--radius-full);background:var(--surface-card);color:var(--text-muted);cursor:pointer;padding:0}
.be-plus:hover,.be-plus:focus-visible{border-color:var(--primary);color:var(--primary)}
.be-menu{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:var(--space-2);padding:var(--space-3);margin:var(--space-2) 0;border:1px solid var(--border-strong);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-lg)}
.be-menu p{grid-column:1/-1;margin:0;display:flex;justify-content:space-between;align-items:center;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.be-mitem{display:flex;align-items:center;gap:var(--space-2);height:44px;padding:0 var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;font-size:var(--text-sm);color:var(--text-heading);cursor:pointer;text-align:left}
.be-mitem:hover,.be-mitem:focus-visible{border-color:var(--primary);background:var(--fill-primary-soft)}
.be-gallery{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.be-gpick{position:relative;width:56px;height:56px;padding:0;border:2px solid transparent;border-radius:var(--radius-lg);overflow:hidden;cursor:pointer;background:var(--surface-subtle);display:grid;place-items:center;color:var(--text-muted)}
.be-gpick img{width:100%;height:100%;object-fit:cover;display:block}
.be-gpick[aria-pressed="true"]{border-color:var(--primary)}
.be-gpick:focus-visible{outline:3px solid var(--fill-primary-soft-hover);outline-offset:2px}
.be-tablegrid{display:grid;gap:var(--space-1)}
.be-tablegrid input{height:44px}
.be-tablegrid .is-head{font-weight:var(--weight-semibold);background:var(--surface-subtle)}
.be-faq{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.be-panel{overflow:hidden}
.be-panel>summary{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-4) var(--space-5);cursor:pointer;list-style:none;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.be-panel>summary::-webkit-details-marker{display:none}
.be-panel>summary .be-chev{margin-left:auto;color:var(--text-muted);transition:transform var(--duration-base) var(--ease-out)}
.be-panel[open]>summary .be-chev{transform:rotate(180deg)}
.be-panel>summary:focus-visible{outline:3px solid var(--fill-primary-soft-hover);outline-offset:-3px}
.be-pbody{display:flex;flex-direction:column;gap:var(--space-4);padding:0 var(--space-5) var(--space-5)}
.be-line{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);font-size:var(--text-sm);color:var(--text-body)}
.be-btns{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2)}
.be-btns .gc-btn{padding:0 var(--space-3)}
.be-btns .be-wide{grid-column:1/-1}
.be-problems{margin:0;padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);background:var(--fill-error-soft);color:var(--text-danger);font-size:var(--text-xs)}
.be-problems ul{margin:var(--space-1) 0 0;padding-left:1.2em}
.be-problems button{border:0;background:none;padding:0;font:inherit;color:inherit;text-decoration:underline;cursor:pointer;text-align:left}
.be-tree{display:flex;flex-direction:column;gap:var(--space-1);max-height:260px;overflow:auto;border:0;padding:0;margin:0}
.be-tree label{display:flex;align-items:center;gap:var(--space-2);min-height:36px;font-size:var(--text-sm);color:var(--text-body);cursor:pointer}
.be-tree.is-error{outline:1px solid var(--text-danger);outline-offset:4px;border-radius:var(--radius-md)}
.be-serp{padding:var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font-family:var(--font-sans)}
.be-serp-site{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-xs);color:var(--text-body);min-width:0}
.be-serp-site span.be-fav{display:grid;place-items:center;width:26px;height:26px;flex:none;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary);font-weight:var(--weight-semibold)}
.be-serp-site small{display:block;color:var(--text-muted);font-size:var(--text-xs);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.be-serp-title{margin-top:var(--space-2);font-size:var(--text-lg);line-height:1.3;color:var(--primary-600)}
.be-serp-desc{margin-top:var(--space-1);font-size:var(--text-sm);line-height:1.5;color:var(--text-body)}
.be-score{display:flex;align-items:center;gap:var(--space-3)}
.be-score .gc-progress{flex:1}
.be-checks{display:flex;flex-direction:column;gap:var(--space-2);margin:0;padding:0;list-style:none}
.be-checks li{display:flex;align-items:flex-start;gap:var(--space-2);font-size:var(--text-xs);color:var(--text-body)}
.be-checks li svg{flex:none;margin-top:1px}
.be-checks small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.be-og{border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden;background:var(--surface-card)}
.be-og .bl-cover{border-radius:0}
.be-og div.be-ogtext{padding:var(--space-3);background:var(--surface-subtle)}
.be-og small{display:block;font-size:var(--text-xs);color:var(--text-muted);text-transform:uppercase;letter-spacing:var(--tracking-wide)}
.be-og b{display:block;margin-top:2px;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.be-og p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.be-rel{display:flex;flex-direction:column;gap:var(--space-2);margin:0;padding:0;list-style:none}
.be-rel li{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2) var(--space-2) var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-size:var(--text-sm)}
.be-rel li div{flex:1;min-width:0}
.be-pv{padding:var(--space-6) var(--space-5);background:var(--surface-card);border-radius:var(--radius-xl);box-shadow:var(--shadow-soft)}
.be-pv--mobile{max-width:430px;margin:0 auto;width:100%;padding:var(--space-5) var(--space-4);border:8px solid var(--slate-800);border-radius:var(--radius-2xl)}
@media (max-width:1023px){.be-layout{grid-template-columns:minmax(0,1fr)}}
@media (max-width:599px){.be-bar{position:static}.be-card{padding:var(--space-4)}.be-slug{flex-direction:column}.be-slug span{border-right:1px solid var(--border-field);border-bottom:0;border-radius:var(--radius-lg) var(--radius-lg) 0 0;height:32px}.be-slug input{border-radius:0 0 var(--radius-lg) var(--radius-lg)}.be-bbody{padding:var(--space-3)}}
/* phones: the character count stays on one line; checklist tips use the helper-text size */
@media (max-width:640px){.be-count>span:last-child{flex:none;white-space:nowrap}}
/* phones: Save draft / Publish already sit in the bar at the top, so the Publish panel does not repeat them */
@media (max-width:640px){.be-btns{display:none}}
`;

// ---- collapsible side panel -------------------------------------------------------------------
function Panel({ title, icon, open = true, extra, children, id }) {
  return (
    <details className="gc-card be-panel" open={open} id={id}>
      <summary><Icon name={icon} width="18" height="18" aria-hidden="true" /><span>{title}</span>{extra}<Icon name="chevron-down" width="18" height="18" className="be-chev" aria-hidden="true" /></summary>
      <div className="be-pbody">{children}</div>
    </details>
  );
}
function Switch({ on, onChange, label, help }) {
  return (
    <div className="be-line">
      <span>{label}{help ? <span className="bl-sub">{help}</span> : null}</span>
      <button type="button" className="gc-switch" role="switch" aria-checked={!!on} aria-label={label} onClick={() => onChange(!on)}><span className="gc-switch__knob" /></button>
    </div>
  );
}
function Counter({ len, min, max, empty }) {
  const cls = !len ? '' : len >= min && len <= max ? 'is-good' : 'is-warn';
  return <p className="be-count"><span>{!len && empty ? empty : `Best between ${min} and ${max}`}</span><span className={cls}>{len} characters</span></p>;
}

// ---- the "+" menu -----------------------------------------------------------------------------
function AddMenu({ onPick, onClose }) {
  const ref = useRef(null);
  useEffect(() => { const b = ref.current && ref.current.querySelector('button.be-mitem'); if (b) b.focus(); }, []);
  return (
    <div ref={ref} className="be-menu" role="group" aria-label="Add a block" onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } }}>
      <p><span>Add a block</span><button type="button" className="gc-iconbtn" aria-label="Close the block menu" onClick={onClose}><Icon name="x" width="16" height="16" /></button></p>
      {BLOCK_TYPES.map((t) => <button key={t.type} type="button" className="be-mitem" onClick={() => onPick(t.type)}><Icon name={t.icon} width="18" height="18" aria-hidden="true" />{t.label}</button>)}
    </div>
  );
}

// ---- one block in edit mode -------------------------------------------------------------------
function BlockEditor({ b, i, count, catalog, onChange, onMove, onDup, onDel }) {
  const meta = BLOCK_TYPES.find((t) => t.type === b.type) || BLOCK_TYPES[0];
  const fid = `blk-${b.id}`;
  const wrap = (before, after, fill) => {
    const el = document.getElementById(fid);
    const text = b.text || '';
    const s = el ? el.selectionStart : text.length, e = el ? el.selectionEnd : text.length;
    const sel = text.slice(s, e) || fill;
    onChange({ text: text.slice(0, s) + before + sel + after + text.slice(e) });
    window.requestAnimationFrame(() => {
      const t = document.getElementById(fid);
      if (!t) return;
      t.focus();
      if (before === '[') { const at = s + 1 + sel.length + 2; t.setSelectionRange(at, at + 8); }
      else t.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  };
  const fmtKeys = (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const k = e.key.toLowerCase();
    if (k === 'b') { e.preventDefault(); wrap('**', '**', 'bold text'); }
    else if (k === 'i') { e.preventDefault(); wrap('*', '*', 'italic text'); }
    else if (k === 'k') { e.preventDefault(); wrap('[', '](https://)', 'link text'); }
  };
  const onKey = (e) => { if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); onMove(e.key === 'ArrowUp' ? -1 : 1, true); } };

  let body;
  switch (b.type) {
    case 'h2': case 'h3':
      body = (<>
        <div className="gc-seg" role="group" aria-label="Heading level">
          {['h2', 'h3'].map((h) => <button key={h} type="button" className={'gc-seg__btn' + (b.type === h ? ' gc-seg__btn--active' : '')} aria-pressed={b.type === h} onClick={() => onChange({ type: h })}>{h.toUpperCase()}</button>)}
        </div>
        <input id={fid} className="gc-input" style={{ fontWeight: 'var(--weight-semibold)', fontSize: b.type === 'h2' ? 'var(--text-lg)' : 'var(--text-sm-plus)' }} value={b.text} placeholder="Heading" aria-label={`${b.type.toUpperCase()} heading text`} onChange={(e) => onChange({ text: e.target.value })} />
      </>);
      break;
    case 'list':
      body = (<>
        <div className="gc-seg" role="group" aria-label="List style">
          <button type="button" className={'gc-seg__btn' + (!b.ordered ? ' gc-seg__btn--active' : '')} aria-pressed={!b.ordered} onClick={() => onChange({ ordered: false })}>• Bulleted</button>
          <button type="button" className={'gc-seg__btn' + (b.ordered ? ' gc-seg__btn--active' : '')} aria-pressed={!!b.ordered} onClick={() => onChange({ ordered: true })}>1. Numbered</button>
        </div>
        <textarea id={fid} className="gc-input be-text" rows={Math.max(3, (b.items || []).length + 1)} value={(b.items || []).join('\n')} placeholder="One item per line" aria-label="List items, one per line" onChange={(e) => onChange({ items: e.target.value.split('\n') })} />
        <p className="gc-help" style={{ margin: 0 }}>One item per line. **bold**, *italic* and [links](url) work here too.</p>
      </>);
      break;
    case 'quote':
      body = (<>
        <textarea id={fid} className="gc-input be-text" rows={rowsFor(b.text, 2)} value={b.text} placeholder="Quote" aria-label="Quote text" onChange={(e) => onChange({ text: e.target.value })} />
        <input className="gc-input" value={b.cite || ''} placeholder="Who said it (optional)" aria-label="Quote source" onChange={(e) => onChange({ cite: e.target.value })} />
      </>);
      break;
    case 'image':
      body = (<>
        <div className="be-gallery" role="group" aria-label="Choose an image">
          {GALLERY.map((g) => <button key={g.id} type="button" className="be-gpick" aria-pressed={b.src === g.src} aria-label={g.label} title={g.label} onClick={() => onChange({ src: g.src, alt: b.alt || g.label })}><img src={g.src} alt="" /></button>)}
        </div>
        <input id={fid} className="gc-input" value={b.src || ''} placeholder="Or paste an image address (https://…)" aria-label="Image address" onChange={(e) => onChange({ src: e.target.value.trim() })} />
        <div className="bl-two">
          <div><label className="gc-label" htmlFor={fid + '-alt'}>Alt text *</label><input id={fid + '-alt'} className={'gc-input' + (b.src && !String(b.alt || '').trim() ? ' gc-input--error' : '')} value={b.alt || ''} placeholder="What the image shows" onChange={(e) => onChange({ alt: e.target.value })} /></div>
          <div><label className="gc-label" htmlFor={fid + '-cap'}>Caption</label><input id={fid + '-cap'} className="gc-input" value={b.caption || ''} placeholder="Optional" onChange={(e) => onChange({ caption: e.target.value })} /></div>
        </div>
      </>);
      break;
    case 'product': {
      const p = catalog.find((x) => x.sku === b.sku);
      body = (<>
        <select id={fid} className="gc-input gc-select" value={b.sku || ''} aria-label="Product" onChange={(e) => onChange({ sku: e.target.value })}>
          <option value="">Choose a product…</option>
          {catalog.map((x) => <option key={x.sku} value={x.sku}>{x.name}{x.variant ? ` · ${x.variant}` : ''} · {formatBDT(x.price)}</option>)}
        </select>
        {p ? <p className="gc-help" style={{ margin: 0 }}><span className="bl-id">{p.sku}</span> · {p.cat} · {formatBDT(p.price)} · the card links to the product page with an Add to cart button.</p> : null}
      </>);
      break;
    }
    case 'cta':
      body = (
        <div className="bl-two">
          <div><label className="gc-label" htmlFor={fid}>Button text</label><input id={fid} className="gc-input" value={b.label || ''} onChange={(e) => onChange({ label: e.target.value })} /></div>
          <div><label className="gc-label" htmlFor={fid + '-url'}>Link</label><input id={fid + '-url'} className="gc-input" value={b.url || ''} placeholder="/collections/eid or https://…" onChange={(e) => onChange({ url: e.target.value.trim() })} style={{ fontFamily: 'var(--font-data)' }} /></div>
          <div><label className="gc-label" htmlFor={fid + '-style'}>Style</label><select id={fid + '-style'} className="gc-input gc-select" value={b.style || 'solid'} onChange={(e) => onChange({ style: e.target.value })}><option value="solid">Filled</option><option value="outline">Outline</option></select></div>
        </div>
      );
      break;
    case 'divider':
      body = <p className="gc-help" style={{ margin: 0 }}>A line between two sections of the post.</p>;
      break;
    case 'embed': {
      const id = youtubeId(b.url);
      body = (<>
        <input id={fid} className="gc-input" value={b.url || ''} placeholder="https://www.youtube.com/watch?v=…" aria-label="YouTube link" onChange={(e) => onChange({ url: e.target.value.trim() })} style={{ fontFamily: 'var(--font-data)' }} />
        <p className={'gc-help' + (b.url && !id ? ' gc-help--error' : '')} style={{ margin: 0 }}>{!b.url ? 'Paste a YouTube watch, share or Shorts link.' : id ? `Video found · ${id}` : 'That is not a YouTube link we can show.'}</p>
      </>);
      break;
    }
    case 'table': {
      const rows = b.rows && b.rows.length ? b.rows : [['']];
      const cols = rows[0].length;
      const setCell = (r, c, v) => onChange({ rows: rows.map((row, ri) => (ri === r ? row.map((x, ci) => (ci === c ? v : x)) : row)) });
      body = (<>
        <div className="gc-table-wrap">
          <div className="be-tablegrid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(110px, 1fr))` }}>
            {rows.map((row, r) => row.map((cell, c) => (
              <input key={`${r}-${c}`} id={r === 0 && c === 0 ? fid : undefined} className={'gc-input' + (b.header && r === 0 ? ' is-head' : '')} value={cell} aria-label={`Row ${r + 1}, column ${c + 1}`} onChange={(e) => setCell(r, c, e.target.value)} />
            )))}
          </div>
        </div>
        <div className="bl-wrap">
          <button type="button" className="gc-btn gc-btn--xs gc-btn--neutral" onClick={() => onChange({ rows: [...rows, Array(cols).fill('')] })}><Icon name="plus" width="14" height="14" aria-hidden="true" /> Row</button>
          <button type="button" className="gc-btn gc-btn--xs gc-btn--neutral" disabled={rows.length < 2} onClick={() => onChange({ rows: rows.slice(0, -1) })}><Icon name="minus" width="14" height="14" aria-hidden="true" /> Row</button>
          <button type="button" className="gc-btn gc-btn--xs gc-btn--neutral" disabled={cols >= 6} onClick={() => onChange({ rows: rows.map((r) => [...r, '']) })}><Icon name="plus" width="14" height="14" aria-hidden="true" /> Column</button>
          <button type="button" className="gc-btn gc-btn--xs gc-btn--neutral" disabled={cols < 2} onClick={() => onChange({ rows: rows.map((r) => r.slice(0, -1)) })}><Icon name="minus" width="14" height="14" aria-hidden="true" /> Column</button>
          <label className="bl-row" style={{ gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}><input type="checkbox" className="gc-check" checked={!!b.header} onChange={(e) => onChange({ header: e.target.checked })} /> First row is the header</label>
        </div>
      </>);
      break;
    }
    case 'faq': {
      const items = b.items && b.items.length ? b.items : [{ q: '', a: '' }];
      const setItem = (k, patch) => onChange({ items: items.map((x, j) => (j === k ? { ...x, ...patch } : x)) });
      body = (<>
        {items.map((x, k) => (
          <div key={k} className="be-faq">
            <div className="bl-row">
              <input id={k === 0 ? fid : undefined} className="gc-input" value={x.q} placeholder="Question" aria-label={`Question ${k + 1}`} onChange={(e) => setItem(k, { q: e.target.value })} />
              <button type="button" className="gc-iconbtn" aria-label={`Remove question ${k + 1}`} disabled={items.length < 2} onClick={() => onChange({ items: items.filter((_, j) => j !== k) })}><Icon name="trash-2" width="16" height="16" /></button>
            </div>
            <textarea className="gc-input" rows={2} value={x.a} placeholder="Answer" aria-label={`Answer ${k + 1}`} onChange={(e) => setItem(k, { a: e.target.value })} />
          </div>
        ))}
        <button type="button" className="gc-btn gc-btn--xs gc-btn--neutral" style={{ alignSelf: 'flex-start' }} onClick={() => onChange({ items: [...items, { q: '', a: '' }] })}><Icon name="plus" width="14" height="14" aria-hidden="true" /> Add a question</button>
      </>);
      break;
    }
    default:
      body = (<>
        <div className="be-tools" role="group" aria-label="Formatting">
          <button type="button" className="be-tool" aria-label="Bold (Ctrl+B)" title="Bold · Ctrl+B" onClick={() => wrap('**', '**', 'bold text')}><Icon name="bold" width="16" height="16" /></button>
          <button type="button" className="be-tool" aria-label="Italic (Ctrl+I)" title="Italic · Ctrl+I" onClick={() => wrap('*', '*', 'italic text')}><Icon name="italic" width="16" height="16" /></button>
          <button type="button" className="be-tool" aria-label="Link (Ctrl+K)" title="Link · Ctrl+K" onClick={() => wrap('[', '](https://)', 'link text')}><Icon name="link" width="16" height="16" /></button>
          <span className="bl-sub">**bold** · *italic* · [text](url)</span>
        </div>
        <textarea id={fid} className="gc-input be-text" rows={rowsFor(b.text)} value={b.text || ''} placeholder="Write a paragraph…" aria-label="Paragraph text" onChange={(e) => onChange({ text: e.target.value })} onKeyDown={fmtKeys} />
      </>);
  }

  return (
    <div className="be-block" data-block={b.id} role="group" aria-label={`${meta.label}, block ${i + 1} of ${count}`} onKeyDown={onKey}>
      <div className="be-bhead">
        <span className="be-btype"><Icon name={meta.icon} width="16" height="16" aria-hidden="true" />{meta.label}</span>
        <div className="be-bacts">
          <button type="button" className="gc-iconbtn" data-act="up" aria-label="Move block up (Alt+Up)" title="Move up · Alt+↑" disabled={i === 0} onClick={() => onMove(-1)}><Icon name="arrow-up" width="16" height="16" /></button>
          <button type="button" className="gc-iconbtn" data-act="down" aria-label="Move block down (Alt+Down)" title="Move down · Alt+↓" disabled={i === count - 1} onClick={() => onMove(1)}><Icon name="arrow-down" width="16" height="16" /></button>
          <button type="button" className="gc-iconbtn" aria-label="Duplicate block" title="Duplicate" onClick={onDup}><Icon name="copy" width="16" height="16" /></button>
          <button type="button" className="gc-iconbtn" aria-label="Delete block" title="Delete" onClick={onDel}><Icon name="trash-2" width="16" height="16" /></button>
        </div>
      </div>
      <div className="be-bbody">{body}</div>
    </div>
  );
}

// ---- the screen -------------------------------------------------------------------------------
export default function BlogEditor() {
  const db = useBlog();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [storedJson, setStoredJson] = useState('');   // the saved version, to tell unsaved changes
  const [isNew, setIsNew] = useState(true);
  const [missing, setMissing] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [kept, setKept] = useState(false);             // live post: changes kept on this device
  const [restore, setRestore] = useState(null);
  const [mode, setMode] = useState('edit');
  const [device, setDevice] = useState('desktop');
  const [menuAt, setMenuAt] = useState(null);
  const [focusReq, setFocusReq] = useState(null);
  const [checked, setChecked] = useState(false);       // a publish was tried: show problems live
  const [newCat, setNewCat] = useState(null);
  const [relPick, setRelPick] = useState('');

  // load once the blog is read
  useEffect(() => {
    if (!db.ready || post || missing) return;
    const id = queryParam('id');
    const found = id ? getPost(id) : null;
    if (id && !found) { setMissing(true); return; }
    const p = found ? clone(found) : blankPost(queryParam('author'));
    setPost(p);
    setIsNew(!found);
    setStoredJson(found ? norm(found) : '');
    setSlugTouched(!!found);
    if (found) {
      const auto = getAutosave(found.id);
      if (auto && new Date(auto.at) > new Date(found.updatedAt) && norm(auto.post) !== norm(found)) setRestore(auto);
    }
  }, [db.ready, post, missing]);

  const pending = !!post && (isNew ? hasContent(post) : norm(post) !== storedJson);
  const live = !!post && !isNew && (post.status === 'published' || post.status === 'scheduled');
  const stored = useMemo(() => (post && !isNew ? db.posts.find((p) => p.id === post.id) : null), [db.posts, post, isNew]);

  // latest values for timers and listeners
  const ref = useRef({});
  ref.current = { post, pending, isNew, live, storedJson };
  const lastAuto = useRef('');

  // autosave: drafts save themselves; live posts keep a working copy on this device
  useEffect(() => {
    const t = window.setInterval(() => {
      const { post: p, pending: dirty, isNew: fresh } = ref.current;
      if (!p || !dirty) return;
      const status = fresh ? 'draft' : (getPost(p.id) || p).status;
      if (status === 'draft' || status === 'archived') {
        if (fresh && !hasContent(p)) return;
        const saved = savePost({ ...p, status, slug: p.slug || uniqueSlug(p.title || 'untitled', ref.current.all, p.id) });
        setStoredJson(norm(saved));
        setPost((cur) => (cur && cur.id === saved.id ? { ...cur, slug: saved.slug } : cur));
        if (fresh) { setIsNew(false); try { window.history.replaceState(window.history.state, '', `/blog-editor?id=${saved.id}`); } catch { /* ignore */ } }
        setSavedAt(new Date());
        setKept(false);
      } else {
        const j = norm(p);
        if (j === lastAuto.current) return;
        lastAuto.current = j;
        setAutosave(p);
        setSavedAt(new Date());
        setKept(true);
      }
    }, AUTOSAVE_MS);
    return () => window.clearInterval(t);
  }, []);
  ref.current.all = db.posts;

  // leaving with unsaved changes: the browser asks on reload/close; links in the app ask here
  useEffect(() => {
    const onUnload = (e) => { if (ref.current.pending) { e.preventDefault(); e.returnValue = ''; } };
    const onClick = async (e) => {
      if (!ref.current.pending || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const path = e.composedPath ? e.composedPath() : [];
      const a = path.find((n) => n && n.tagName === 'A' && n.getAttribute && n.getAttribute('href'));
      if (!a || path.some((n) => n && n.hasAttribute && n.hasAttribute('data-preview'))) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || a.target === '_blank') return;
      let url;
      try { url = new URL(href, window.location.href); } catch { return; }
      if (url.origin !== window.location.origin || (url.pathname === window.location.pathname && url.search === window.location.search)) return;
      e.preventDefault();
      e.stopPropagation();
      const { live: isLive } = ref.current;
      const ok = await confirmDialog({
        title: 'Leave this post?',
        body: isLive ? 'Your changes are not live yet. They stay on this device and you can restore them next time you open the post.' : 'Some changes are not saved yet.',
        confirmLabel: 'Leave', cancelLabel: 'Stay',
      });
      if (ok) { ref.current.pending = false; router.push(url.pathname + url.search); }
    };
    window.addEventListener('beforeunload', onUnload);
    document.addEventListener('click', onClick, true);
    return () => { window.removeEventListener('beforeunload', onUnload); document.removeEventListener('click', onClick, true); };
  }, [router]);

  // focus after adding or moving a block
  useEffect(() => {
    if (!focusReq) return;
    const box = document.querySelector(`[data-block="${focusReq.id}"]`);
    if (box) {
      let el = focusReq.act ? box.querySelector(`[data-act="${focusReq.act}"]:not([disabled])`) || box.querySelector('[data-act]:not([disabled])') : box.querySelector('input,textarea,select');
      if (el) el.focus();
    }
    setFocusReq(null);
  }, [focusReq]);

  const tree = useMemo(() => categoryTree(db.categories), [db.categories]);
  const allTags = useMemo(() => [...new Set(db.posts.flatMap((p) => p.tags || []))].sort(), [db.posts]);
  const allKeywords = useMemo(() => [...new Set(db.posts.flatMap((p) => ((p.seo || {}).keywords || [])))].sort(), [db.posts]);

  // ---- missing / loading --------------------------------------------------------------------
  if (missing) {
    return (
      <BlogFrame screen="BlogEditor" active="blog-posts" page="Edit post" css={CSS}>
        <PageHeader title="Post not found" description="It may have been deleted on this device." actions={<Link href="/blog-posts" className="gc-btn gc-btn--neutral"><Icon name="arrow-left" width="18" height="18" aria-hidden="true" /> All posts</Link>} />
        <section className="gc-card"><EmptyState icon="file-question" title="This post is not here" body="Go back to the list, or start a new post." actionLabel="New post" onAction={() => { setMissing(false); try { window.history.replaceState(window.history.state, '', '/blog-editor'); } catch { /* ignore */ } }} /></section>
      </BlogFrame>
    );
  }
  if (!post) {
    return (
      <BlogFrame screen="BlogEditor" active="blog-new" page="New post" css={CSS}>
        <PageHeader title="Blog post" description="Loading the editor…" />
        <div style={{ minHeight: 320 }} aria-busy="true" />
      </BlogFrame>
    );
  }

  // ---- edits --------------------------------------------------------------------------------
  const set = (patch) => setPost((p) => ({ ...p, ...patch }));
  const setSeo = (patch) => setPost((p) => ({ ...p, seo: { ...p.seo, ...patch } }));
  const setCover = (patch) => setPost((p) => ({ ...p, cover: { ...p.cover, ...patch } }));
  const onTitle = (title) => setPost((p) => ({ ...p, title, slug: slugTouched ? p.slug : (title.trim() ? uniqueSlug(title, db.posts, p.id) : '') }));
  const onSlug = (v) => { setSlugTouched(true); set({ slug: v.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+/, '').slice(0, 80) }); };
  const setBlock = (id, patch) => setPost((p) => ({ ...p, blocks: p.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
  const insertBlock = (at, type) => {
    const b = newBlock(type);
    setPost((p) => { const blocks = p.blocks.slice(); blocks.splice(at, 0, b); return { ...p, blocks }; });
    setMenuAt(null);
    setFocusReq({ id: b.id });
  };
  const moveBlock = (id, dir, fromKeys) => {
    setPost((p) => {
      const i = p.blocks.findIndex((b) => b.id === id), j = i + dir;
      if (i < 0 || j < 0 || j >= p.blocks.length) return p;
      const blocks = p.blocks.slice();
      [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
      return { ...p, blocks };
    });
    if (!fromKeys) setFocusReq({ id, act: dir < 0 ? 'up' : 'down' });
  };
  const dupBlock = (id) => {
    const i = post.blocks.findIndex((b) => b.id === id);
    const copy = cloneBlock(post.blocks[i]);
    setPost((p) => { const blocks = p.blocks.slice(); blocks.splice(i + 1, 0, copy); return { ...p, blocks }; });
    setFocusReq({ id: copy.id });
    toast('Block duplicated');
  };
  const delBlock = (id) => {
    const i = post.blocks.findIndex((b) => b.id === id);
    const gone = post.blocks[i];
    setPost((p) => ({ ...p, blocks: p.blocks.filter((b) => b.id !== id) }));
    toast(`${BLOCK_TYPES.find((t) => t.type === gone.type).label} deleted`, { undo: () => setPost((p) => { const blocks = p.blocks.slice(); blocks.splice(Math.min(i, blocks.length), 0, gone); return { ...p, blocks }; }) });
  };
  const toggleCat = (id) => setPost((p) => ({ ...p, categoryIds: p.categoryIds.includes(id) ? p.categoryIds.filter((x) => x !== id) : [...p.categoryIds, id] }));
  const addCategory = () => {
    const name = String(newCat.name || '').trim();
    if (!name) { toast('Type a name for the new category.', { tone: 'error' }); return; }
    if (db.categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) { toast(`${name} already exists. Tick it in the list.`, { tone: 'error' }); return; }
    const parent = db.categories.find((c) => c.id === newCat.parentId);
    const c = saveCategory({ name, parentId: newCat.parentId || '', color: parent ? parent.color : 'navy' });
    setPost((p) => ({ ...p, categoryIds: [...p.categoryIds, c.id] }));
    setNewCat(null);
    toast(`Category ${c.name} added`);
  };

  // ---- save / publish ----------------------------------------------------------------------
  const finalSlug = (p) => {
    const s = slugify(p.slug) || uniqueSlug(p.title || 'untitled', db.posts, p.id);
    return slugTaken(s, db.posts, p.id) ? uniqueSlug(s, db.posts, p.id) : s;
  };
  const commit = (patch, message) => {
    const next = { ...post, ...patch };
    next.slug = finalSlug(next);
    if (next.slug !== post.slug && post.slug) toast(`Another post uses that address, so this one is /${next.slug}`, { tone: 'info' });
    const saved = savePost(next);
    clearAutosave(saved.id);
    lastAuto.current = '';
    setPost(clone(saved));
    setStoredJson(norm(saved));
    setSavedAt(new Date());
    setKept(false);
    setRestore(null);
    if (isNew) { setIsNew(false); try { window.history.replaceState(window.history.state, '', `/blog-editor?id=${saved.id}`); } catch { /* ignore */ } }
    if (message) toast(message);
    return saved;
  };
  const focusField = (field) => {
    const el = document.getElementById(field);
    if (!el) return;
    const d = el.closest('details');
    if (d) d.open = true;
    const target = el.matches('input,textarea,select') ? el : el.querySelector('input,textarea,select,button');
    if (target) { target.focus(); target.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  };
  const future = !!post.publishAt && new Date(post.publishAt).getTime() > Date.now();
  const isLiveNow = !isNew && stored && stored.status === 'published';
  const primaryLabel = isLiveNow ? 'Update' : future ? 'Schedule' : 'Publish';
  const publish = () => {
    if (mode === 'preview') setMode('edit');
    const problems = publishProblems(post, { scheduling: !isLiveNow && future });
    setChecked(true);
    if (problems.length) {
      toast(`Fix ${problems.length} thing${problems.length === 1 ? '' : 's'} before this post goes live.`, { tone: 'error' });
      window.setTimeout(() => focusField(problems[0].field), 50);
      return;
    }
    setChecked(false);
    if (isLiveNow) { commit({ status: 'published' }, `Updated on ${BLOG_BASE}${finalSlug(post)}`); return; }
    if (future) { commit({ status: 'scheduled', autoPublishedAt: null }, `Scheduled for ${formatDateTime(post.publishAt)}. It goes live by itself at that time.`); return; }
    commit({ status: 'published', autoPublishedAt: null, publishAt: new Date().toISOString() }, `Published on ${BLOG_BASE}${finalSlug(post)}`);
  };
  const saveDraft = async () => {
    if (stored && (stored.status === 'published' || stored.status === 'scheduled')) {
      const ok = await confirmDialog({ title: 'Switch this post to a draft?', body: stored.status === 'published' ? 'It comes off the website until you publish it again.' : 'The schedule is cancelled. It will not publish on its own.', confirmLabel: 'Switch to draft' });
      if (!ok) return;
    }
    if (isNew && !hasContent(post)) { toast('Write a title or some text first.', { tone: 'error' }); return; }
    commit({ status: 'draft', autoPublishedAt: null }, 'Saved as a draft. It is not visible on the website.');
  };
  const archive = async () => {
    const ok = await confirmDialog({ title: 'Move this post to the archive?', body: 'It comes off the website and out of the blog lists. You can restore it as a draft later.', confirmLabel: 'Archive', tone: 'danger' });
    if (!ok) return;
    commit({ status: 'archived' }, 'Post archived');
  };
  const remove = async () => {
    if (isNew) {
      if (hasContent(post) && !(await confirmDialog({ title: 'Discard this new post?', body: 'What you wrote so far is not kept.', confirmLabel: 'Discard', tone: 'danger' }))) return;
      ref.current.pending = false;
      router.push('/blog-posts');
      return;
    }
    const ok = await confirmDialog({ title: 'Delete this post?', body: 'It is removed for good, with its SEO settings. Archive it instead to keep a copy.', confirmLabel: 'Delete', tone: 'danger' });
    if (!ok) return;
    deletePosts([post.id]);
    ref.current.pending = false;
    toast('Post deleted');
    router.push('/blog-posts');
  };
  const doRestore = () => { setPost(clone(restore.post)); setRestore(null); toast('Your unsaved changes are back. Press Update to put them live.'); };
  const dropRestore = () => { clearAutosave(post.id); setRestore(null); toast('Unsaved changes discarded'); };

  // ---- derived -----------------------------------------------------------------------------
  const problems = checked ? publishProblems(post, { scheduling: !isLiveNow && future }) : [];
  const bad = (field) => problems.some((x) => x.field === field);
  const seo = seoScore(post);
  const words = wordCount(post.blocks);
  const author = db.authors.find((a) => a.id === post.authorId);
  const authorChoices = db.authors.filter((a) => a.active || a.id === post.authorId);
  const slugClash = !!post.slug && slugTaken(post.slug, db.posts, post.id);
  const metaTitle = post.seo.metaTitle || '';
  const metaDesc = post.seo.metaDescription || '';
  const serpTitle = cut(metaTitle || post.title || 'Untitled post', 60);
  const serpDesc = cut(metaDesc || post.excerpt || 'Write a meta description: Google shows it under the title.', 160);
  const ogImage = post.seo.ogImage || post.cover.src;
  const statusLine = (() => {
    if (isNew && !hasContent(post)) return <>New post · <b>not saved yet</b></>;
    if (kept && pending) return <>Changes kept on this device · {formatTime(savedAt)} · <b>press {primaryLabel} to put them live</b></>;
    if (pending) return <><b>Unsaved changes</b> · saving in a moment</>;
    if (savedAt) return <>Saved · {formatTime(savedAt)}</>;
    if (stored && stored.status === 'published' && stored.autoPublishedAt) return <>Published automatically on {formatDateTime(stored.autoPublishedAt)}</>;
    if (post.status === 'published') return <>Live · updated {formatDate(post.updatedAt)}</>;
    if (post.status === 'scheduled') return <>Publishes {formatDateTime(post.publishAt)}</>;
    return <>Saved · {formatDate(post.updatedAt)}, {formatTime(post.updatedAt)}</>;
  })();
  const catalog = db.catalog;
  const relatedList = (post.relatedProductSkus || []).map((s) => catalog.find((p) => p.sku === s)).filter(Boolean);

  const insertRow = (at) => (
    menuAt === at ? <AddMenu key={'m' + at} onPick={(t) => insertBlock(at, t)} onClose={() => setMenuAt(null)} />
      : <div key={'i' + at} className="be-ins"><button type="button" className="be-plus" aria-label={at === 0 ? 'Add a block at the start' : `Add a block after block ${at}`} title="Add a block" onClick={() => setMenuAt(at)}><Icon name="plus" width="16" height="16" /></button></div>
  );

  return (
    <BlogFrame screen="BlogEditor" active={isNew ? 'blog-new' : 'blog-posts'} page={isNew ? 'New post' : 'Edit post'} css={CSS}>
      <form onSubmit={(e) => e.preventDefault()} style={{ display: 'contents' }}>
        <PageHeader compact title={isNew ? 'New post' : 'Edit post'} description={isNew ? 'Write, format and optimise a post for the storefront blog. Drafts save on this device every few seconds.' : post.title || 'Untitled post'} />

        <div className="be-bar">
          <Link href="/blog-posts" className="gc-btn gc-btn--sm gc-btn--flat"><Icon name="arrow-left" width="16" height="16" aria-hidden="true" /> All posts</Link>
          <PostStatus status={isNew ? 'draft' : (stored || post).status} />
          <span className="be-save" aria-live="polite">{statusLine}</span>
          <div className="gc-seg" role="group" aria-label="Edit or preview">
            <button type="button" className={'gc-seg__btn' + (mode === 'edit' ? ' gc-seg__btn--active' : '')} aria-pressed={mode === 'edit'} onClick={() => setMode('edit')}>Edit</button>
            <button type="button" className={'gc-seg__btn' + (mode === 'preview' ? ' gc-seg__btn--active' : '')} aria-pressed={mode === 'preview'} onClick={() => setMode('preview')}>Preview</button>
          </div>
          {mode === 'preview' ? (
            <div className="gc-seg" role="group" aria-label="Preview width">
              <button type="button" className={'gc-seg__btn' + (device === 'desktop' ? ' gc-seg__btn--active' : '')} aria-pressed={device === 'desktop'} onClick={() => setDevice('desktop')}><Icon name="monitor" width="16" height="16" aria-hidden="true" style={{ verticalAlign: 'middle' }} /> Desktop</button>
              <button type="button" className={'gc-seg__btn' + (device === 'mobile' ? ' gc-seg__btn--active' : '')} aria-pressed={device === 'mobile'} onClick={() => setDevice('mobile')}><Icon name="smartphone" width="16" height="16" aria-hidden="true" style={{ verticalAlign: 'middle' }} /> Mobile</button>
            </div>
          ) : null}
          <div className="be-acts">
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={saveDraft}>{isLiveNow || (stored && stored.status === 'scheduled') ? 'Switch to draft' : 'Save draft'}</button>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={publish}><Icon name={primaryLabel === 'Schedule' ? 'calendar-clock' : 'send'} width="16" height="16" aria-hidden="true" /> {primaryLabel}</button>
          </div>
        </div>

        {restore ? (
          <div className="gc-alert gc-alert--soft gc-alert--warning" role="status" style={{ flexWrap: 'wrap' }}>
            <Icon name="history" width="20" height="20" aria-hidden="true" />
            <span style={{ flex: '1 1 240px' }}>You have changes from {formatDateTime(restore.at)} that are not live yet.</span>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={doRestore}>Restore them</button>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={dropRestore}>Discard</button>
          </div>
        ) : null}

        <div className="be-layout gc-split">
          {/* ---- main column ---- */}
          <div className="be-main">
            {mode === 'preview' ? (
              <div className={'be-pv' + (device === 'mobile' ? ' be-pv--mobile' : '')}>
                <PostPreview post={{ ...post, readingTime: readingTime(post.blocks) }} db={db} device={device} />
              </div>
            ) : (<>
              <section className="gc-card be-card" aria-label="Title and summary">
                <div>
                  <label className="gc-label" htmlFor="bl-title">Title *</label>
                  <input id="bl-title" className={'gc-input be-title' + (bad('bl-title') ? ' gc-input--error' : '')} value={post.title} placeholder="What is this post about?" onChange={(e) => onTitle(e.target.value)} data-autofocus />
                </div>
                <div>
                  <label className="gc-label" htmlFor="bl-slug">Address</label>
                  <div className="be-slug"><span>{BLOG_BASE}</span><input id="bl-slug" className={'gc-input' + (slugClash ? ' gc-input--error' : '')} value={post.slug} placeholder="post-address" onChange={(e) => onSlug(e.target.value)} onBlur={() => set({ slug: slugify(post.slug) })} /></div>
                  {slugClash ? (
                    <p className="gc-help gc-help--error">Another post uses this address. <button type="button" className="bl-link" style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }} onClick={() => set({ slug: uniqueSlug(post.slug, db.posts, post.id) })}>Use /{uniqueSlug(post.slug, db.posts, post.id)}</button></p>
                  ) : (
                    <p className="gc-help">{slugTouched ? <>Edited by hand. <button type="button" className="bl-link" style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }} onClick={() => { setSlugTouched(false); set({ slug: post.title.trim() ? uniqueSlug(post.title, db.posts, post.id) : '' }); }}>Make it from the title</button>{isLiveNow ? ' · changing the address of a live post breaks old links.' : ''}</> : 'Made from the title. Edit it to change the link.'}</p>
                  )}
                </div>
                <div>
                  <label className="gc-label" htmlFor="bl-excerpt">Excerpt</label>
                  <textarea id="bl-excerpt" className="gc-input" rows={2} value={post.excerpt} placeholder="One or two sentences shown on the blog page and in shares." onChange={(e) => set({ excerpt: e.target.value })} />
                  <Counter len={post.excerpt.length} min={80} max={200} empty="Optional, but it helps people choose your post" />
                </div>
              </section>

              <section className="gc-card be-card" aria-label="Content">
                <div className="bl-head" style={{ padding: 0 }}>
                  <div><h2>Content</h2><p>{words} words · {readingTime(post.blocks)} min read · Alt+↑/↓ moves the block you are in</p></div>
                </div>
                <div className="be-blocks">
                  {insertRow(0)}
                  {post.blocks.map((b, i) => (
                    <React.Fragment key={b.id}>
                      <BlockEditor b={b} i={i} count={post.blocks.length} catalog={catalog}
                        onChange={(patch) => setBlock(b.id, patch)} onMove={(dir, keys) => moveBlock(b.id, dir, keys)} onDup={() => dupBlock(b.id)} onDel={() => delBlock(b.id)} />
                      {insertRow(i + 1)}
                    </React.Fragment>
                  ))}
                </div>
                {!post.blocks.length ? <EmptyState icon="pilcrow" title="No content yet" body="Add a paragraph, a heading or a product card." actionLabel="Add a paragraph" onAction={() => insertBlock(0, 'p')} /> : null}
              </section>
            </>)}
          </div>

          {/* ---- side panels ---- */}
          <aside className="be-side" aria-label="Post settings">
            <Panel title="Publish" icon="send">
              {problems.length ? (
                <div className="be-problems" role="alert">
                  <b>Before it goes live:</b>
                  <ul>{problems.map((x) => <li key={x.field}><button type="button" onClick={() => focusField(x.field)}>{x.message}</button></li>)}</ul>
                </div>
              ) : null}
              <div className="be-line"><span>Status</span><PostStatus status={isNew ? 'draft' : (stored || post).status} /></div>
              {!isNew && stored && stored.autoPublishedAt && stored.status === 'published' ? <p className="gc-help" style={{ margin: 0 }}><Icon name="calendar-check" width="14" height="14" aria-hidden="true" style={{ verticalAlign: 'middle' }} /> Published automatically on {formatDateTime(stored.autoPublishedAt)}, as scheduled.</p> : null}
              <div><label className="gc-label" htmlFor="bl-vis">Visibility</label><select id="bl-vis" className="gc-input gc-select" value={post.visibility} onChange={(e) => set({ visibility: e.target.value })}>{Object.entries(VISIBILITY).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
              <div>
                <label className="gc-label" htmlFor="bl-publish-at">{isLiveNow ? 'Published on' : 'Publish on'}</label>
                <input id="bl-publish-at" type="datetime-local" className={'gc-input' + (bad('bl-publish-at') ? ' gc-input--error' : '')} value={toLocalInput(post.publishAt)} onChange={(e) => set({ publishAt: fromLocalInput(e.target.value) })} />
                <p className="gc-help">{isLiveNow ? 'Shown as the post date.' : !post.publishAt ? 'Empty = publish straight away.' : future ? `Goes live ${formatDateTime(post.publishAt)}.` : 'A past date publishes straight away with that date.'}{post.publishAt && !isLiveNow ? <> <button type="button" className="bl-link" style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }} onClick={() => set({ publishAt: null })}>Clear</button></> : null}</p>
              </div>
              <Switch label="Featured" help="Pinned at the top of the blog" on={post.featured} onChange={(v) => set({ featured: v })} />
              <Switch label="Allow comments" on={post.allowComments} onChange={(v) => set({ allowComments: v })} />
              <div className="be-btns">
                <button type="button" className="gc-btn gc-btn--neutral" onClick={saveDraft}>{isLiveNow || (stored && stored.status === 'scheduled') ? 'To draft' : 'Save draft'}</button>
                <button type="button" className="gc-btn gc-btn--neutral" onClick={() => { setMode(mode === 'preview' ? 'edit' : 'preview'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><Icon name="eye" width="16" height="16" aria-hidden="true" /> {mode === 'preview' ? 'Edit' : 'Preview'}</button>
                <button type="button" className="gc-btn gc-btn--solid be-wide" onClick={publish}>{primaryLabel}</button>
              </div>
              <div className="be-line">
                {!isNew && post.status !== 'archived' ? <button type="button" className="gc-btn gc-btn--xs gc-btn--flat" onClick={archive}><Icon name="archive" width="14" height="14" aria-hidden="true" /> Move to archive</button> : <span />}
                <button type="button" className="gc-btn gc-btn--xs gc-btn--flat" style={{ color: 'var(--text-danger)' }} onClick={remove}><Icon name="trash-2" width="14" height="14" aria-hidden="true" /> {isNew ? 'Discard' : 'Delete'}</button>
              </div>
            </Panel>

            <Panel title="Category" icon="folder-tree" extra={post.categoryIds.length ? <span className="gc-badge gc-badge--slate">{post.categoryIds.length}</span> : null}>
              <fieldset id="bl-cats" className={'be-tree' + (bad('bl-cats') ? ' is-error' : '')}>
                <legend className="sr-only">Categories</legend>
                {tree.map((c) => (
                  <label key={c.id} style={{ paddingLeft: c.depth * 24 }}>
                    <input type="checkbox" className="gc-check" checked={post.categoryIds.includes(c.id)} onChange={() => toggleCat(c.id)} />
                    <span className="bl-dot" style={{ background: toneOf(c.color).fg }} aria-hidden="true" />{c.name}
                  </label>
                ))}
              </fieldset>
              {newCat ? (
                <div className="bl-form" style={{ gap: 'var(--space-2)' }}>
                  <input className="gc-input" aria-label="New category name" placeholder="Category name" value={newCat.name} autoFocus onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCategory(); } }} />
                  <select className="gc-input gc-select" aria-label="Parent category" value={newCat.parentId} onChange={(e) => setNewCat({ ...newCat, parentId: e.target.value })}>
                    <option value="">No parent (top level)</option>
                    {tree.filter((c) => !c.depth).map((c) => <option key={c.id} value={c.id}>Inside {c.name}</option>)}
                  </select>
                  <div className="bl-wrap"><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={addCategory}>Add category</button><button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={() => setNewCat(null)}>Cancel</button></div>
                </div>
              ) : (
                <div className="bl-wrap" style={{ justifyContent: 'space-between' }}>
                  <button type="button" className="gc-btn gc-btn--xs gc-btn--neutral" onClick={() => setNewCat({ name: '', parentId: '' })}><Icon name="plus" width="14" height="14" aria-hidden="true" /> New category</button>
                  <Link href="/blog-categories" className="bl-link" style={{ fontSize: 'var(--text-xs)' }}>Manage categories</Link>
                </div>
              )}
            </Panel>

            <Panel title="Tags" icon="tag">
              <ChipsInput id="bl-tags" label="Tags" value={post.tags} onChange={(tags) => set({ tags })} placeholder="Type a tag and press Enter" suggestions={allTags} />
              <p className="gc-help" style={{ margin: 0 }}>Tags group posts across categories, like “eid” or “budget”.</p>
            </Panel>

            <Panel title="Author" icon="user-pen">
              <select id="bl-author" className="gc-input gc-select" aria-label="Author" value={post.authorId} onChange={(e) => set({ authorId: e.target.value })}>
                {authorChoices.map((a) => <option key={a.id} value={a.id}>{a.name} · {a.role}{a.active ? '' : ' (inactive)'}</option>)}
              </select>
              {author ? (
                <div className="bl-row">
                  <Avatar author={author} size={40} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span className="bl-strong">{author.name}</span>
                    <span className="bl-sub">{ROLES[author.role]}</span>
                  </div>
                  <Link href={`/author-profile?id=${author.id}`} className="bl-link" style={{ fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}>Profile</Link>
                </div>
              ) : null}
              {author && author.role === 'Contributor' ? <p className="gc-help" style={{ margin: 0 }}>Contributors write drafts. An editor or admin should publish this post.</p> : null}
            </Panel>

            <Panel title="Cover image" icon="image">
              <Cover cover={post.cover} label={post.cover.alt || 'Cover image'} />
              <div className="be-gallery" role="group" aria-label="Choose a cover">
                <button type="button" className="be-gpick" aria-pressed={!post.cover.src} aria-label="No photo, use a colour" title="Colour only" onClick={() => setCover({ src: '' })} style={{ background: toneOf(post.cover.tone).grad, color: 'var(--text-on-dark)' }}><Icon name={post.cover.icon || 'newspaper'} width="20" height="20" aria-hidden="true" /></button>
                {GALLERY.map((g) => <button key={g.id} type="button" className="be-gpick" aria-pressed={post.cover.src === g.src} aria-label={g.label} title={g.label} onClick={() => setCover({ src: g.src, alt: post.cover.alt || g.label })}><img src={g.src} alt="" /></button>)}
              </div>
              {!post.cover.src ? (<>
                <div><span className="gc-label">Colour</span><Swatches value={post.cover.tone} onChange={(tone) => setCover({ tone })} label="Cover colour" /></div>
                <div><label className="gc-label" htmlFor="bl-cover-icon">Icon</label><select id="bl-cover-icon" className="gc-input gc-select" value={post.cover.icon} onChange={(e) => setCover({ icon: e.target.value })}>{COVER_ICONS.map((x) => <option key={x} value={x}>{x.replace('-', ' ')}</option>)}</select></div>
              </>) : null}
              <div>
                <label className="gc-label" htmlFor="bl-cover-alt">Alt text *</label>
                <input id="bl-cover-alt" className={'gc-input' + (bad('bl-cover-alt') ? ' gc-input--error' : '')} value={post.cover.alt} placeholder="What the image shows" onChange={(e) => setCover({ alt: e.target.value })} />
                <p className="gc-help">Read out by screen readers and used by Google Images.</p>
              </div>
            </Panel>

            <Panel title="SEO" icon="search" extra={<span className={'gc-badge gc-badge--' + seo.tone}>{seo.score}</span>}>
              <div className="be-score">
                <div className="gc-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={seo.score} aria-label="SEO score"><div className="gc-progress__fill" style={{ width: seo.score + '%', background: `var(--${seo.tone === 'success' ? 'success' : seo.tone === 'warning' ? 'warning' : 'error'})` }} /></div>
                <span className="bl-strong" style={{ fontFamily: 'var(--font-data)' }}>{seo.score}/100 · {seo.label}</span>
              </div>
              <div><label className="gc-label" htmlFor="bl-kw">Focus keyword</label><input id="bl-kw" className="gc-input" value={post.seo.focusKeyword} placeholder="e.g. sunscreen for oily skin" onChange={(e) => setSeo({ focusKeyword: e.target.value })} /></div>
              <div><label className="gc-label" htmlFor="bl-kws">More keywords</label><ChipsInput id="bl-kws" label="More keywords" value={post.seo.keywords || []} onChange={(keywords) => setSeo({ keywords })} placeholder="Related phrases, Bangla too" suggestions={allKeywords} /></div>
              <div>
                <label className="gc-label" htmlFor="bl-meta-title">SEO title</label>
                <input id="bl-meta-title" className="gc-input" value={metaTitle} placeholder={post.title || 'Uses the post title'} onChange={(e) => setSeo({ metaTitle: e.target.value })} />
                <Counter len={(metaTitle || post.title).length} min={50} max={60} />
              </div>
              <div>
                <label className="gc-label" htmlFor="bl-meta-desc">Meta description *</label>
                <textarea id="bl-meta-desc" className={'gc-input' + (bad('bl-meta-desc') ? ' gc-input--error' : '')} rows={3} value={metaDesc} placeholder="What the reader gets from this post, with the keyword once." onChange={(e) => setSeo({ metaDescription: e.target.value })} />
                <Counter len={metaDesc.length} min={120} max={160} />
              </div>
              <div>
                <label className="gc-label" htmlFor="bl-seo-slug">Address (slug)</label>
                <input id="bl-seo-slug" className={'gc-input' + (slugClash ? ' gc-input--error' : '')} value={post.slug} style={{ fontFamily: 'var(--font-data)' }} onChange={(e) => onSlug(e.target.value)} onBlur={() => set({ slug: slugify(post.slug) })} />
              </div>
              <div>
                <label className="gc-label" htmlFor="bl-canonical">Canonical URL</label>
                <input id="bl-canonical" className="gc-input" value={post.seo.canonical} placeholder={`https://${BLOG_BASE}${post.slug || '…'}`} style={{ fontFamily: 'var(--font-data)' }} onChange={(e) => setSeo({ canonical: e.target.value.trim() })} />
                <p className="gc-help">Only when this post is copied from another page.</p>
              </div>
              <Switch label="Hide from search engines" help="Adds noindex" on={post.seo.noindex} onChange={(v) => setSeo({ noindex: v })} />
              <div>
                <span className="gc-label">Google preview</span>
                <div className="be-serp" aria-label="Google result preview">
                  <div className="be-serp-site"><span className="be-fav" aria-hidden="true">G</span><div style={{ minWidth: 0 }}><span>GridShop</span><small>https://{SITE} › blog › {post.slug || '…'}</small></div></div>
                  <div className="be-serp-title">{serpTitle}</div>
                  <div className="be-serp-desc">{serpDesc}</div>
                </div>
                {post.seo.noindex ? <p className="gc-help gc-help--error">Hidden: this post will not show in Google.</p> : null}
              </div>
              <ul className="be-checks" aria-label="SEO checklist">
                {seo.checks.map((c) => (
                  <li key={c.id}>
                    <Icon name={c.ok ? 'circle-check' : 'circle-x'} width="16" height="16" aria-hidden="true" style={{ color: c.ok ? 'var(--text-success)' : 'var(--text-danger)' }} />
                    <span>{c.label}<span className="sr-only">{c.ok ? ': done' : ': to do'}</span>{c.ok ? null : <small>{c.tip}</small>}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Social share" icon="share-2" open={false}>
              <div><label className="gc-label" htmlFor="bl-og-title">Share title</label><input id="bl-og-title" className="gc-input" value={post.seo.ogTitle} placeholder={metaTitle || post.title || 'Uses the SEO title'} onChange={(e) => setSeo({ ogTitle: e.target.value })} /></div>
              <div><label className="gc-label" htmlFor="bl-og-desc">Share description</label><textarea id="bl-og-desc" className="gc-input" rows={2} value={post.seo.ogDescription} placeholder={metaDesc || post.excerpt || 'Uses the meta description'} onChange={(e) => setSeo({ ogDescription: e.target.value })} /></div>
              <div>
                <label className="gc-label" htmlFor="bl-og-img">Share image</label>
                <select id="bl-og-img" className="gc-input gc-select" value={post.seo.ogImage} onChange={(e) => setSeo({ ogImage: e.target.value })}>
                  <option value="">Same as the cover</option>
                  {GALLERY.map((g) => <option key={g.id} value={g.src}>{g.label}</option>)}
                </select>
              </div>
              <div className="be-og" aria-label="Facebook share preview">
                <Cover cover={{ ...post.cover, src: ogImage }} />
                <div className="be-ogtext"><small>{SITE}</small><b>{cut(post.seo.ogTitle || metaTitle || post.title || 'Untitled post', 70)}</b><p>{cut(post.seo.ogDescription || metaDesc || post.excerpt || '', 110)}</p></div>
              </div>
            </Panel>

            <Panel title="Related products" icon="shopping-bag" open={relatedList.length > 0} extra={relatedList.length ? <span className="gc-badge gc-badge--slate">{relatedList.length}</span> : null}>
              <div className="bl-row">
                <select className="gc-input gc-select" aria-label="Product to add" value={relPick} onChange={(e) => setRelPick(e.target.value)}>
                  <option value="">Choose a product…</option>
                  {catalog.filter((p) => !(post.relatedProductSkus || []).includes(p.sku)).map((p) => <option key={p.sku} value={p.sku}>{p.name} · {formatBDT(p.price)}</option>)}
                </select>
                <button type="button" className="gc-btn gc-btn--neutral" disabled={!relPick} onClick={() => { set({ relatedProductSkus: [...(post.relatedProductSkus || []), relPick] }); setRelPick(''); }}>Add</button>
              </div>
              {relatedList.length ? (
                <ul className="be-rel">
                  {relatedList.map((p) => (
                    <li key={p.sku}>
                      <div><span className="bl-strong">{p.name}</span><span className="bl-sub"><span className="bl-id">{p.sku}</span> · {formatBDT(p.price)}</span></div>
                      <button type="button" className="gc-iconbtn" aria-label={`Remove ${p.name}`} onClick={() => set({ relatedProductSkus: post.relatedProductSkus.filter((s) => s !== p.sku) })}><Icon name="x" width="16" height="16" /></button>
                    </li>
                  ))}
                </ul>
              ) : <p className="gc-help" style={{ margin: 0 }}>Shown under the post as “Shop this post”.</p>}
            </Panel>
          </aside>
        </div>
      </form>
    </BlogFrame>
  );
}
