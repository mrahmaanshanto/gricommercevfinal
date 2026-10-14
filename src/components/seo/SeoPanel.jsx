'use client';
// SeoPanel — the one SEO panel, the same in all five editors (store pages, blog posts, products, categories, landing
// pages). Closed it shows the Google result and the score; "Edit" opens the nine controls, the rarer ones folded:
//   Search result   focus keyword (with its checks), meta title and description with length meters, Google preview
//   Social share    Open Graph title, description and image (default: the SEO fields and the first photo)
//   Links           every link in the text: nofollow / sponsored / user content, new tab (kept in the text itself)
//   Images          alt text of the featured and in-text images, missing ones marked
//   Search engines  index / noindex and follow / nofollow, each on its own; canonical address (empty = this page's)
//   Schedule        go live on a date and time, Bangladesh time; change or cancel (where the type has it)
//   Structured data the automatic schema it makes, and the shop's own JSON-LD (paste or a .json file), checked; the
//                   shop's own replaces the automatic one of the same type
//   What search engines see   the head tags this page gets
// Props: kind, seo (lib/seo.js › readSeo), onChange(patch), ctx (lib/seoItems.js › contextOf of the item as edited),
// onAlt(image, alt)?, onLink(link, patch)?, schedule? { at, onChange, label } | { note }, titleAction?, children (more
// search-result fields, e.g. a post's extra keywords), extraChecks? (more { id, label, ok, tip, level }), defaultOpen.

import React, { useMemo, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { InfoTip } from '@/components/ui';
import {
  LIMITS, RELS, headFor, headHtml, autoSchema, parseSchema, replacedTypes, seoChecks, seoScore, liveUrl, livePath,
  lengthTone, toDhakaInput, fromDhakaInput, dhakaText, SITE,
} from '@/lib/seo';

export const SEO_PANEL_CSS = `
.seo-p .ix-card__head{gap:var(--space-2)}
.seo-p__body{display:flex;flex-direction:column;gap:var(--space-4);padding:var(--space-3) var(--space-4) var(--space-4)}
.seo-serp{display:flex;flex-direction:column;gap:2px;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.seo-serp small{font-size:var(--text-xs);color:var(--text-muted);font-family:var(--font-data);overflow-wrap:anywhere}
.seo-serp b{font-size:var(--text-base);font-weight:var(--weight-regular);color:var(--text-link);line-height:1.35}
.seo-serp span{font-size:var(--text-sm);color:var(--text-body);line-height:1.5}
.seo-sum{display:flex;flex-wrap:wrap;gap:6px}
.seo-f{display:flex;flex-direction:column;gap:6px}
.seo-f__lbl{display:flex;align-items:center;gap:var(--space-2)}
.seo-f__lbl .gc-label{margin:0}
.seo-f__lbl>:last-child{margin-left:auto}
.seo-meter{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.seo-meter i{flex:1;height:4px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.seo-meter i b{display:block;height:100%;border-radius:inherit}
.seo-meter .is-success b{background:var(--success)}.seo-meter .is-warning b{background:var(--warning)}.seo-meter .is-error b{background:var(--error)}
.seo-meter span.is-error{color:var(--text-danger)}
.seo-g{border-top:1px solid var(--border-subtle);padding-top:var(--space-3)}
.seo-g>summary{display:flex;align-items:center;gap:var(--space-2);min-height:32px;cursor:pointer;list-style:none;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.seo-g>summary::-webkit-details-marker{display:none}
.seo-g>summary .seo-chev{margin-left:auto;transition:transform .15s;color:var(--text-muted)}
.seo-g[open]>summary .seo-chev{transform:rotate(90deg)}
.seo-g>summary small{font-weight:var(--weight-regular);font-size:var(--text-xs);color:var(--text-muted)}
.seo-g>summary small.is-warn{color:var(--text-warning)}
.seo-g__in{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-2) 0 var(--space-1)}
.seo-seg{display:inline-flex;flex-wrap:wrap;gap:6px}
.seo-chip{display:inline-flex;align-items:center;gap:4px;min-height:28px;padding:0 10px;border:1px solid var(--border-field);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.seo-chip[aria-pressed="true"]{background:var(--fill-primary-soft);border-color:var(--primary);color:var(--primary)}
.seo-chip:disabled{cursor:default;opacity:.6}
.seo-list{display:flex;flex-direction:column;gap:var(--space-2);margin:0;padding:0;list-style:none}
.seo-list>li{display:flex;flex-direction:column;gap:6px;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.seo-list b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);overflow-wrap:anywhere}
.seo-list small{font-size:var(--text-xs);color:var(--text-muted);font-family:var(--font-data);overflow-wrap:anywhere}
.seo-img{display:grid;grid-template-columns:48px minmax(0,1fr);gap:var(--space-2);align-items:center}
.seo-img img{width:48px;height:48px;object-fit:cover;border-radius:var(--radius-md);background:var(--surface-subtle)}
.seo-miss{color:var(--text-danger);font-size:var(--text-xs)}
.seo-og{display:flex;flex-direction:column;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden}
.seo-og img,.seo-og .seo-og__ph{width:100%;aspect-ratio:1.91/1;object-fit:cover;background:var(--surface-subtle);display:grid;place-items:center;color:var(--text-muted)}
.seo-og .seo-og__ph{aspect-ratio:auto;height:64px}
.seo-og div{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) var(--space-3);background:var(--surface-subtle)}
.seo-og small{font-size:var(--text-xs);color:var(--text-muted);text-transform:uppercase}
.seo-og b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.seo-og span{font-size:var(--text-xs);color:var(--text-body)}
.seo-code{margin:0;max-height:280px;overflow:auto;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);color:var(--text-heading);border:1px solid var(--border-subtle);font-family:var(--font-code);font-size:var(--text-xs);line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere}
.seo-types{display:flex;flex-wrap:wrap;gap:6px}
.seo-type{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-body)}
.seo-type.is-off{text-decoration:line-through;color:var(--text-muted)}
.seo-checks{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}
.seo-checks li{display:flex;gap:var(--space-2);align-items:flex-start;font-size:var(--text-sm);color:var(--text-body)}
.seo-checks small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.seo-row{display:flex;flex-wrap:wrap;gap:var(--space-2);align-items:center}
.seo-p textarea.seo-json{font-family:var(--font-code);font-size:var(--text-xs);min-height:120px}
@media (max-width:640px){.seo-chip{min-height:36px}}
`;

function Meter({ len, max }) {
  const tone = lengthTone(len, max);
  return (
    <div className="seo-meter">
      <i className={'is-' + tone}><b style={{ width: Math.min(100, Math.round((len / max) * 100)) + '%' }} /></i>
      <span className={tone === 'error' ? 'is-error' : undefined}>{len} / {max}</span>
    </div>
  );
}
function Group({ title, note, warn, open, children }) {
  return (
    <details className="seo-g" open={open || undefined}>
      <summary>{title}{note ? <small className={warn ? 'is-warn' : undefined}>· {note}</small> : null}<Icon name="chevron-right" width="16" height="16" className="seo-chev" aria-hidden="true" /></summary>
      <div className="seo-g__in">{children}</div>
    </details>
  );
}
function Seg({ value, options, onChange, label }) {
  return (
    <span className="seo-seg" role="group" aria-label={label}>
      {options.map(([k, l]) => <button key={String(k)} type="button" className="seo-chip" aria-pressed={value === k} onClick={() => onChange(k)}>{l}</button>)}
    </span>
  );
}
const short = (s, n) => (String(s).length > n ? String(s).slice(0, n - 1) + '…' : String(s));

export default function SeoPanel({ kind, seo, onChange, ctx = {}, onAlt, onLink, schedule, titleAction, children, extraChecks, defaultOpen = false, idPrefix = 'seo' }) {
  const [open, setOpen] = useState(defaultOpen);
  const [showCode, setShowCode] = useState(false);
  const fileRef = useRef(null);
  const item = useMemo(() => ({ seo }), [seo]);
  const head = useMemo(() => headFor(kind, { seo, ...(kind === 'product' ? { seoT: seo.metaTitle, seoD: seo.metaDescription, noindex: seo.noindex } : {}), ...(kind === 'page' ? { noindex: seo.noindex } : {}) }, ctx), [kind, seo, ctx]);
  const checks = useMemo(() => [...seoChecks(kind, kind === 'product' ? { seo, seoT: seo.metaTitle, seoD: seo.metaDescription, noindex: seo.noindex } : kind === 'page' ? { seo, noindex: seo.noindex } : item, ctx), ...(extraChecks || [])], [kind, seo, ctx, item, extraChecks]);
  const score = seoScore(checks);
  const auto = useMemo(() => autoSchema(kind, ctx), [kind, ctx]);
  const own = parseSchema(seo.schema);
  const replaced = own.ok ? replacedTypes(auto, own.items) : [];
  const images = ctx.images || [];
  const links = ctx.links || [];
  const missingAlt = images.filter((x) => !String(x.alt || '').trim()).length;
  const defUrl = ctx.url || liveUrl(kind, ctx.handle);
  const set = (patch) => onChange(patch);
  const id = (k) => idPrefix + '-' + k;
  const ogImg = seo.ogImage || (images[0] && images[0].src) || '';

  const loadFile = (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    if (f.size > 100 * 1024) { toast('That file is over 100 KB. Schema files are small; check it is the right one.', { tone: 'error' }); return; }
    const r = new FileReader();
    r.onload = () => { const txt = String(r.result || ''); const p = parseSchema(txt); set({ schema: txt }); toast(p.ok ? 'Schema loaded: ' + p.types.join(', ') : p.error, p.ok ? undefined : { tone: 'error' }); };
    r.readAsText(f);
  };

  return (
    <section className="ix-card seo-p" aria-labelledby={id('h')}>
      <div className="ix-card__head">
        <h2 id={id('h')}>Search engine listing</h2>
        <span className={'gc-badge gc-badge--' + score.tone} title={'SEO score ' + score.score + ' of 100'}>{score.score}</span>
        <button type="button" className="ix-btn ix-btn--sm" style={{ marginLeft: 'auto' }} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Done' : 'Edit'}</button>
      </div>
      <div className="seo-p__body">
        <div className="seo-serp" aria-label="Google result preview">
          <small>{SITE}{livePath(kind, ctx.handle || '…').replace(/\//g, ' › ').replace(/^ › /, ' › ')}</small>
          <b>{short(head.title || 'Add a title', 70)}</b>
          <span>{head.description ? short(head.description, 160) : 'Add a description so people know what they will find.'}</span>
        </div>
        {!open ? (
          <div className="seo-sum">
            {seo.noindex ? <span className="gc-badge gc-badge--error">Hidden from Google</span> : null}
            {!String(seo.metaDescription || '').trim() ? <span className="gc-badge gc-badge--warning">No description</span> : null}
            {missingAlt ? <span className="gc-badge gc-badge--warning">{missingAlt} image{missingAlt === 1 ? '' : 's'} without alt text</span> : null}
            {seo.schema ? <span className={'gc-badge gc-badge--' + (own.ok ? 'slate' : 'error')}>{own.ok ? 'Own schema' : 'Schema error'}</span> : null}
            {schedule && schedule.at ? <span className="gc-badge gc-badge--info">Goes live {dhakaText(schedule.at)}</span> : null}
          </div>
        ) : (<>
          <div className="seo-f">
            <div className="seo-f__lbl"><label className="gc-label" htmlFor={id('kw')}>Focus keyword</label><InfoTip text="The words people type into Google to find this. The checks below look for it in the title, description and text." /></div>
            <input id={id('kw')} className="gc-input" value={seo.focusKeyword || ''} placeholder="e.g. phone case price in bd" onChange={(e) => set({ focusKeyword: e.target.value })} />
          </div>
          <div className="seo-f">
            <div className="seo-f__lbl"><label className="gc-label" htmlFor={id('title')}>Meta title</label>{titleAction || <span />}</div>
            <input id={id('title')} className="gc-input" value={seo.metaTitle || ''} placeholder={ctx.defaultTitle || ctx.title || 'Uses the title'} onChange={(e) => set({ metaTitle: e.target.value })} />
            <Meter len={(seo.metaTitle || ctx.defaultTitle || ctx.title || '').length} max={LIMITS.title} />
          </div>
          <div className="seo-f">
            <label className="gc-label" htmlFor={id('desc')}>Meta description</label>
            <textarea id={id('desc')} className="gc-input" rows={3} value={seo.metaDescription || ''} placeholder="One or two sentences for the search result." onChange={(e) => set({ metaDescription: e.target.value })} />
            <Meter len={String(seo.metaDescription || '').length} max={LIMITS.desc} />
          </div>
          {children}

          <Group title="Social share" note={seo.ogTitle || seo.ogDescription || seo.ogImage ? 'Own text' : 'Same as above'}>
            <div className="seo-f"><label className="gc-label" htmlFor={id('ogt')}>Share title</label><input id={id('ogt')} className="gc-input" value={seo.ogTitle || ''} placeholder={head.title || 'Uses the meta title'} onChange={(e) => set({ ogTitle: e.target.value })} /></div>
            <div className="seo-f"><label className="gc-label" htmlFor={id('ogd')}>Share description</label><textarea id={id('ogd')} className="gc-input" rows={2} value={seo.ogDescription || ''} placeholder={head.description || 'Uses the meta description'} onChange={(e) => set({ ogDescription: e.target.value })} /></div>
            <div className="seo-f">
              <label className="gc-label" htmlFor={id('ogi')}>Share image</label>
              <select id={id('ogi')} className="gc-input gc-select" value={images.some((x) => x.src === seo.ogImage) || !seo.ogImage ? seo.ogImage || '' : '__url'} onChange={(e) => set({ ogImage: e.target.value === '__url' ? 'https://' : e.target.value })}>
                <option value="">{images.length ? 'Same as the ' + (images[0].where || 'first image').toLowerCase() : 'No image yet'}</option>
                {images.map((x, i) => <option key={i} value={x.src}>{x.where || 'Image ' + (i + 1)}{x.alt ? ' · ' + short(x.alt, 30) : ''}</option>)}
                <option value="__url">An image address…</option>
              </select>
              {seo.ogImage && !images.some((x) => x.src === seo.ogImage) ? <input className="gc-input" aria-label="Share image address" value={seo.ogImage} onChange={(e) => set({ ogImage: e.target.value.trim() })} style={{ fontFamily: 'var(--font-data)' }} /> : null}
            </div>
            <div className="seo-og" aria-label="Facebook share preview">
              {ogImg ? <img src={ogImg} alt="" /> : <span className="seo-og__ph"><Icon name="image" width="28" height="28" aria-hidden="true" /></span>}
              <div><small>{SITE}</small><b>{short(seo.ogTitle || head.title || '', 70)}</b><span>{short(seo.ogDescription || head.description || '', 110)}</span></div>
            </div>
          </Group>

          <Group title="Links" note={links.length ? links.length + ' in the text' + (links.some((l) => l.rel.length) ? ' · ' + links.filter((l) => l.rel.length).length + ' marked' : '') : 'None in the text'}>
            {links.length ? (
              <ul className="seo-list">
                {links.map((l) => (
                  <li key={l.key || l.n}>
                    <span><b>{l.text}</b><small>{l.url}</small></span>
                    <span className="seo-seg" role="group" aria-label={'Options for the link ' + l.text}>
                      {RELS.map(([k, label, tip]) => <button key={k} type="button" className="seo-chip" title={tip} aria-pressed={l.rel.includes(k)} disabled={!onLink} onClick={() => onLink(l, { rel: l.rel.includes(k) ? l.rel.filter((x) => x !== k) : [...l.rel, k] })}>{label}</button>)}
                      <button type="button" className="seo-chip" aria-pressed={!!l.newTab} disabled={!onLink} onClick={() => onLink(l, { newTab: !l.newTab })}><Icon name="external-link" width="12" height="12" aria-hidden="true" />New tab</button>
                    </span>
                  </li>
                ))}
              </ul>
            ) : <p className="gc-help" style={{ margin: 0 }}>Add a link in the text with the link button (or [text](address)). Its options show here.</p>}
            <p className="gc-help" style={{ margin: 0 }}>These are for single links. To keep Google from following every link on the page, use Search engines below.</p>
          </Group>

          <Group title="Images" note={images.length ? (missingAlt ? missingAlt + ' without alt text' : 'All have alt text') : 'No images'} warn={missingAlt > 0} open={missingAlt > 0 && !!onAlt}>
            {images.length ? (
              <ul className="seo-list">
                {images.map((x, i) => (
                  <li key={i}>
                    <span className="seo-img">
                      <img src={x.src} alt="" />
                      <span className="seo-f">
                        <span className="gc-label" style={{ margin: 0 }}>{x.where || 'Image ' + (i + 1)}</span>
                        {onAlt ? <input className="gc-input" aria-label={'Alt text for ' + (x.where || 'image ' + (i + 1))} value={x.alt || ''} placeholder="What the image shows" onChange={(e) => onAlt(x, e.target.value, i)} />
                          : x.alt ? <small>{x.alt}</small> : <span className="seo-miss">No alt text. Add it where the image is.</span>}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : <p className="gc-help" style={{ margin: 0 }}>No images yet. Google Images reads each image’s alt text.</p>}
          </Group>

          <Group title="Search engines" note={(seo.noindex ? 'Hidden' : 'Listed') + (seo.nofollow ? ' · links not followed' : '') + (seo.canonical ? ' · own canonical' : '')} warn={!!seo.noindex}>
            <div className="seo-f">
              <span className="gc-label" style={{ margin: 0 }}>Show in search results</span>
              <Seg label="Show in search results" value={!!seo.noindex} options={[[false, 'Yes (index)'], [true, 'No (noindex)']]} onChange={(v) => set({ noindex: v })} />
              {seo.noindex ? <p className="gc-help gc-help--error" style={{ margin: 0 }}>Google won’t list this page{ctx.live ? ', even though it is on the website' : ''}.</p> : null}
            </div>
            <div className="seo-f">
              <span className="gc-label" style={{ margin: 0 }}>Follow the links on this page</span>
              <Seg label="Follow the links on this page" value={!!seo.nofollow} options={[[false, 'Yes (follow)'], [true, 'No (nofollow)']]} onChange={(v) => set({ nofollow: v })} />
            </div>
            <div className="seo-f">
              <div className="seo-f__lbl"><label className="gc-label" htmlFor={id('can')}>Canonical address</label><InfoTip text="Only when the same content lives at another address and that one should rank. Leave it empty to use this page's own address." /></div>
              <input id={id('can')} className="gc-input" value={seo.canonical || ''} placeholder={defUrl} style={{ fontFamily: 'var(--font-data)' }} onChange={(e) => set({ canonical: e.target.value.trim() })} />
              {seo.canonical ? <p className="gc-help" style={{ margin: 0 }}>Search engines are told the main copy is elsewhere. <button type="button" className="bl-link" style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', font: 'inherit', color: 'var(--primary)' }} onClick={() => set({ canonical: '' })}>Use this page’s address</button></p> : null}
            </div>
          </Group>

          {schedule ? (
            <Group title="Schedule" note={schedule.note ? 'In Publish' : schedule.at ? 'Goes live ' + dhakaText(schedule.at) : 'Not scheduled'}>
              {schedule.note ? <p className="gc-help" style={{ margin: 0 }}>{schedule.note}</p> : (<>
                <div className="seo-f">
                  <label className="gc-label" htmlFor={id('at')}>{schedule.label || 'Go live on'}</label>
                  <input id={id('at')} type="datetime-local" className="gc-input" value={toDhakaInput(schedule.at)} onChange={(e) => schedule.onChange(fromDhakaInput(e.target.value))} />
                  <p className="gc-help" style={{ margin: 0 }}>Bangladesh time (Asia/Dhaka). It stays off the website until then.{schedule.at ? <> <button type="button" className="bl-link" style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', font: 'inherit', color: 'var(--primary)' }} onClick={() => schedule.onChange('')}>Cancel the schedule</button></> : null}</p>
                </div>
              </>)}
            </Group>
          ) : null}

          <Group title="Structured data" note={seo.schema ? (own.ok ? 'Own schema · ' + own.types.join(', ') : 'Error') : auto.length ? 'Automatic' : 'None'} warn={!!seo.schema && !own.ok}>
            <div className="seo-f">
              <span className="gc-label" style={{ margin: 0 }}>Made automatically</span>
              {auto.length ? <span className="seo-types">{auto.map((a, i) => { const t = [].concat(a['@type'])[0]; const off = replaced.includes(t); return <span key={i} className={'seo-type' + (off ? ' is-off' : '')} title={off ? 'Replaced by your own' : undefined}>{t}</span>; })}</span> : <p className="gc-help" style={{ margin: 0 }}>Nothing for this page yet.</p>}
            </div>
            <div className="seo-f">
              <div className="seo-f__lbl"><label className="gc-label" htmlFor={id('json')}>Your own schema (JSON-LD)</label><InfoTip text="For an expert. Paste JSON-LD or upload a .json file. If it has a type the page already makes (Product, FAQPage …), yours is used instead, so the page never says it twice." /></div>
              <textarea id={id('json')} className={'gc-input seo-json' + (seo.schema && !own.ok ? ' gc-input--error' : '')} value={seo.schema || ''} placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  …\n}'} onChange={(e) => set({ schema: e.target.value })} spellCheck={false} />
              {seo.schema ? <p className={'gc-help' + (own.ok ? '' : ' gc-help--error')} style={{ margin: 0 }}>{own.ok ? 'Valid · ' + own.types.join(', ') + (replaced.length ? ' · replaces the automatic ' + replaced.join(', ') : '') : own.error}</p> : null}
              <span className="seo-row">
                <input ref={fileRef} type="file" accept=".json,application/json,application/ld+json" hidden onChange={loadFile} />
                <button type="button" className="ix-btn ix-btn--sm" onClick={() => fileRef.current && fileRef.current.click()}><Icon name="upload" width="16" height="16" aria-hidden="true" />Upload .json</button>
                {seo.schema ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => { try { set({ schema: JSON.stringify(JSON.parse(seo.schema), null, 2) }); } catch { toast(own.error, { tone: 'error' }); } }}>Tidy</button> : null}
                {seo.schema ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => set({ schema: '' })}>Remove</button> : null}
              </span>
            </div>
          </Group>

          <ul className="seo-checks" aria-label="SEO checks">
            {checks.map((c) => (
              <li key={c.id}>
                <Icon name={c.ok ? 'circle-check' : c.level === 'error' ? 'circle-x' : 'circle-alert'} width="16" height="16" aria-hidden="true" style={{ flex: 'none', marginTop: 2, color: c.ok ? 'var(--text-success)' : c.level === 'error' ? 'var(--text-danger)' : 'var(--text-warning)' }} />
                <span>{c.label}<span className="sr-only">{c.ok ? ': done' : ': to do'}</span>{c.ok ? null : <small>{c.tip}</small>}</span>
              </li>
            ))}
          </ul>
          <div className="seo-f">
            <button type="button" className="ix-btn ix-btn--sm" style={{ alignSelf: 'flex-start' }} aria-expanded={showCode} onClick={() => setShowCode(!showCode)}><Icon name="code" width="16" height="16" aria-hidden="true" />{showCode ? 'Hide' : 'What search engines see'}</button>
            {showCode ? <pre className="seo-code" aria-label="Head tags">{headHtml(head)}</pre> : null}
          </div>
        </>)}
      </div>
    </section>
  );
}
