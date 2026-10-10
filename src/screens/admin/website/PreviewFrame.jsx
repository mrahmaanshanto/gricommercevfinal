'use client';
// PreviewFrame — a page of gridcommerce.net in a Desktop (1280), Tablet (768) or Phone (390) frame, scaled to fit.
//   Published   the live page in an iframe (https://gridcommerce.net<path>). If the frame has not loaded after 8 s
//               (the site refused to be framed, or no network) it falls back to the mock below.
//   Draft       the mock: the site's header, the draft title and description, then each section with its draft text
//               (English or Bangla), because a draft is not on the live site.
// Props: path, title, description, sections: [{ id, label, fields: [{ key, label, value: { en, bn }, one }] }],
//        draftable (there is a draft to show), status.

import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { PENDING } from '@/lib/admin/website';
import { pageUrl } from './webShared';

const DEVICES = [
  { id: 'desktop', label: 'Desktop', icon: 'monitor', w: 1280, h: 800 },
  { id: 'tablet', label: 'Tablet', icon: 'tablet', w: 768, h: 1024 },
  { id: 'phone', label: 'Phone', icon: 'smartphone', w: 390, h: 780 },
];

const CSS = `
.pf-bar{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-bottom:1px solid var(--border-subtle)}
.pf-bar .pf-url{flex:1 1 200px;min-width:0;display:flex;align-items:center;gap:6px;height:32px;padding:0 var(--space-3);border-radius:var(--radius-full);background:var(--surface-subtle);font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted);overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.pf-stage{display:flex;justify-content:center;padding:var(--space-4);background:var(--surface-page);border-radius:0 0 var(--radius-xl) var(--radius-xl);overflow:hidden}
.pf-device{position:relative;flex:none;overflow:hidden;background:var(--surface-card);box-shadow:var(--shadow-lg);border-radius:var(--radius-lg)}
.pf-device.is-phone{border-radius:var(--radius-2xl);outline:8px solid var(--text-heading)}
.pf-device.is-tablet{border-radius:var(--radius-xl);outline:10px solid var(--text-heading)}
.pf-scale{transform-origin:0 0;position:absolute;left:0;top:0}
.pf-scale iframe{display:block;border:0;background:var(--surface-card)}
.pf-loading{position:absolute;inset:0;display:grid;place-items:center;font-size:var(--text-sm);color:var(--text-muted);background:var(--surface-card);pointer-events:none}
.pf-note{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3);font-size:var(--text-xs);color:var(--text-muted);border-bottom:1px solid var(--border-subtle)}
.pf-note b{font-weight:var(--weight-medium);color:var(--text-body)}
/* the mock page (drawn at the device's own width, then scaled like the iframe) */
.pf-mock{font-family:var(--font-sans);color:var(--text-body);background:var(--surface-card);min-height:100%}
.pf-mock__nav{display:flex;align-items:center;gap:24px;padding:18px 40px;border-bottom:1px solid var(--border-subtle);font-size:var(--text-sm)}
.pf-mock__nav b{display:inline-flex;align-items:center;gap:8px;font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pf-mock__nav span{color:var(--text-muted)}
.pf-mock__nav .pf-mock__cta{margin-left:auto;padding:8px 16px;border-radius:var(--radius-lg);background:var(--primary);color:var(--text-inverse);font-weight:var(--weight-medium)}
.pf-mock__hero{padding:72px 40px 56px;background:linear-gradient(180deg,var(--fill-primary-soft),var(--surface-card))}
.pf-mock__hero .pf-mock__title{margin:0;max-width:760px;font-size:var(--text-4xl);line-height:var(--text-4xl-lh);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pf-mock__hero p{margin:16px 0 0;max-width:640px;font-size:var(--text-lg);line-height:1.5;color:var(--text-body)}
.pf-mock__sec{padding:40px;border-top:1px solid var(--border-subtle)}
.pf-mock__sec h2{margin:0 0 6px;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--primary);text-transform:uppercase;letter-spacing:.06em}
.pf-mock__sec h3{margin:0;font-size:var(--text-2xl);line-height:var(--text-2xl-lh);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pf-mock__sec p{margin:10px 0 0;max-width:680px;font-size:var(--text-base);line-height:1.6}
.pf-mock__sec ul{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin:16px 0 0;padding:0;list-style:none}
.pf-mock__sec li{padding:14px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-size:var(--text-sm)}
.pf-mock__sec mark{background:var(--fill-warning-soft);color:inherit;border-radius:var(--radius-sm);padding:0 2px}
.pf-mock__foot{padding:28px 40px;background:var(--surface-subtle);font-size:var(--text-sm);color:var(--text-muted)}
.pf-mock--narrow .pf-mock__nav{padding:14px 18px;gap:12px}
.pf-mock--narrow .pf-mock__nav span{display:none}
.pf-mock--narrow .pf-mock__hero{padding:40px 18px 32px}
.pf-mock--narrow .pf-mock__hero .pf-mock__title{font-size:var(--text-2xl);line-height:var(--text-2xl-lh)}
.pf-mock--narrow .pf-mock__hero p{font-size:var(--text-base)}
.pf-mock--narrow .pf-mock__sec{padding:28px 18px}
.pf-mock--narrow .pf-mock__sec h3{font-size:var(--text-xl);line-height:var(--text-xl-lh)}
.pf-mock--narrow .pf-mock__foot{padding:20px 18px}
.pf-mock [lang="bn"]{font-family:var(--font-bn)}
@media (max-width:640px){.pf-stage{padding:var(--space-2)}.pf-bar .pf-url{flex-basis:100%;order:3}}
`;

const txt = (v, lang) => { const s = lang === 'bn' && v.bn ? v.bn : v.en; return s === PENDING ? 'To be confirmed' : s; };

/** The page drawn from its text, for drafts and when the live site can't be framed. */
function MockPage({ title, description, sections, lang, narrow, changed }) {
  return (
    <div className={'pf-mock' + (narrow ? ' pf-mock--narrow' : '')} lang={lang}>
      <div className="pf-mock__nav">
        <b><Icon name="layout-grid" width="20" height="20" aria-hidden="true" />GridCommerce</b>
        <span>{lang === 'bn' ? 'মডিউল' : 'Modules'}</span><span>{lang === 'bn' ? 'সলিউশন' : 'Solutions'}</span><span>{lang === 'bn' ? 'প্রাইসিং ও প্ল্যান' : 'Pricing'}</span>
        <span className="pf-mock__cta">{lang === 'bn' ? 'ফ্রি শুরু করুন' : 'Start free'}</span>
      </div>
      <div className="pf-mock__hero">
        <p className="pf-mock__title">{title}</p>
        {description ? <p>{description}</p> : null}
      </div>
      {sections.slice(0, 12).map((s) => {
        const f = s.fields.filter((x) => x.kind !== 'link');
        const head = f[0];
        const body = f.find((x, i) => i > 0 && x.kind === 'long') || f[1];
        const rest = f.filter((x) => x !== head && x !== body).slice(0, 6);
        const show = (x) => (changed && x.edit ? <mark>{txt(x.value, lang)}</mark> : txt(x.value, lang));
        return (
          <section key={s.id} className="pf-mock__sec">
            <h2>{s.label}</h2>
            {head ? <h3>{show(head)}</h3> : null}
            {body ? <p>{show(body)}</p> : null}
            {rest.length ? <ul>{rest.map((x) => <li key={x.key}>{show(x)}</li>)}</ul> : null}
          </section>
        );
      })}
      <div className="pf-mock__foot">© 2026 Grid Technologies Limited · {lang === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}</div>
    </div>
  );
}

export default function PreviewFrame({ path, title, description, sections = [], draftable, status }) {
  const [device, setDevice] = useState('desktop');
  const [mode, setMode] = useState(status === 'Published' || !draftable ? 'published' : 'draft');
  const [lang, setLang] = useState('en');
  const [loaded, setLoaded] = useState(false);
  const [refused, setRefused] = useState(false);
  const [mock, setMock] = useState(false);
  const [box, setBox] = useState(0);
  const stage = useRef(null);
  const d = DEVICES.find((x) => x.id === device);

  useEffect(() => {
    const el = stage.current;
    if (!el) return undefined;
    const set = () => setBox(el.clientWidth);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => { setLoaded(false); setRefused(false); }, [path, device, mode]);
  useEffect(() => {
    if (mode !== 'published' || mock || loaded) return undefined;
    const id = window.setTimeout(() => setRefused(true), 8000);
    return () => window.clearTimeout(id);
  }, [mode, mock, loaded, path, device]);
  useEffect(() => { if (!draftable && mode === 'draft') setMode('published'); }, [draftable, mode]);

  const pad = 32;
  const scale = box ? Math.min(1, (box - pad) / d.w) : 0.5;
  const h = Math.round(Math.min(d.h, 900) * scale);
  const useMock = mode === 'draft' || mock || refused;
  const url = pageUrl(path);

  return (
    <section className="ix-card" aria-label="Preview">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ix-card__head"><h2>Preview</h2></div>
      <div className="pf-bar">
        <span className="wb-seg" role="group" aria-label="Screen size">
          {DEVICES.map((x) => <button key={x.id} type="button" aria-pressed={device === x.id} onClick={() => setDevice(x.id)}><Icon name={x.icon} width="16" height="16" aria-hidden="true" /><span>{x.label}</span></button>)}
        </span>
        <span className="wb-seg" role="group" aria-label="Version">
          <button type="button" aria-pressed={mode === 'published'} onClick={() => setMode('published')}>Published</button>
          <button type="button" aria-pressed={mode === 'draft'} disabled={!draftable} title={draftable ? undefined : 'No draft: the page is as published'} onClick={() => setMode('draft')}>Draft</button>
        </span>
        {useMock ? (
          <span className="wb-seg" role="group" aria-label="Language">
            <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
            <button type="button" aria-pressed={lang === 'bn'} onClick={() => setLang('bn')}>বাংলা</button>
          </span>
        ) : null}
        <span className="pf-url" title={url}><Icon name="lock" width="12" height="12" aria-hidden="true" />{url.replace('https://', '')}</span>
      </div>
      {mode === 'published' && (refused || mock) ? (
        <p className="pf-note" role="status">
          <Icon name="info" width="14" height="14" aria-hidden="true" />
          {refused ? <span>The live page didn’t load in the frame, so this is a drawing of its text.</span> : <span>A drawing of the page’s text.</span>}
          <button type="button" className="ix-btn ix-btn--sm" onClick={() => { setMock(false); setRefused(false); setLoaded(false); }}>Try the live page</button>
          <a className="ix-btn ix-btn--sm" href={url} target="_blank" rel="noopener noreferrer"><Icon name="external-link" width="14" height="14" aria-hidden="true" />Open</a>
        </p>
      ) : mode === 'draft' ? (
        <p className="pf-note" role="status"><Icon name="file-pen" width="14" height="14" aria-hidden="true" /><span><b>Draft</b> — not on the live site. Changed text is highlighted.</span></p>
      ) : (
        <p className="pf-note"><Icon name="globe" width="14" height="14" aria-hidden="true" /><span>The live page.</span><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setMock(true)}>Show text only</button></p>
      )}
      <div className="pf-stage" ref={stage}>
        <div className={'pf-device is-' + device} style={{ width: Math.round(d.w * scale), height: h }}>
          <div className="pf-scale" style={{ width: d.w, height: Math.round(h / scale), transform: `scale(${scale})` }}>
            {useMock ? (
              <MockPage title={title} description={description} sections={sections} lang={lang} narrow={d.w < 700} changed={mode === 'draft'} />
            ) : (
              <>
                <iframe key={path + device} title={'Live page ' + path} src={url} width={d.w} height={Math.round(h / scale)} loading="lazy"
                  sandbox="allow-scripts allow-same-origin allow-popups" onLoad={() => setLoaded(true)} />
                {!loaded ? <div className="pf-loading">Loading {url.replace('https://', '')}…</div> : null}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
