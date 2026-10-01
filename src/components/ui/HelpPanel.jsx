'use client';
// HelpPanel — the one Help pattern for every page. The Help button in the top bar (gc-topbar) fires `gc:help`;
// this opens a side panel (bottom sheet on phones) with: What is this page · How to use it · Good to know ·
// Video tutorial (placeholder until videos exist) · Related pages. Content: src/lib/help.js (English and Bangla).

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { getLocale, setLocale, toast } from '@/runtime/ui';
import { helpFor, labelFor } from '@/lib/help';
import { routeInEdition } from '@/lib/edition';
import { Sheet } from './index';

const CSS = `
.hp-sec h3{margin:0 0 6px;font-size:var(--text-xs);font-weight:var(--weight-semibold);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted)}
.hp-sec p{margin:0;font-size:var(--text-sm);line-height:1.6;color:var(--text-body)}
.hp-sec ol,.hp-sec ul{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:6px;font-size:var(--text-sm);line-height:1.55;color:var(--text-body)}
.hp-video{display:flex;align-items:center;gap:var(--space-3);width:100%;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-subtle);font:inherit;text-align:left;cursor:pointer}
.hp-video:hover{border-color:var(--primary)}
.hp-video__thumb{position:relative;display:grid;place-items:center;width:96px;height:60px;flex:none;border-radius:var(--radius-lg);background:linear-gradient(135deg,var(--primary),var(--secondary));color:var(--text-on-dark)}
.hp-video b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.hp-video small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.hp-rel{display:flex;flex-wrap:wrap;gap:6px}
.hp-rel a{display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 12px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);text-decoration:none}
.hp-rel a:hover{border-color:var(--primary);color:var(--primary)}
.hp-lang{display:flex;align-items:center;gap:var(--space-2);margin-right:auto;font-size:var(--text-xs);color:var(--text-muted)}
`;

const T = {
  en: { help: 'Help', what: 'What is this page?', how: 'How to use it', know: 'Good to know', video: 'Video tutorial', soon: 'Tutorial videos are coming soon.', watch: 'Watch tutorial', related: 'Related pages', lang: 'Language', close: 'Close' },
  bn: { help: 'সাহায্য', what: 'এই page কী?', how: 'কীভাবে ব্যবহার করবেন', know: 'জেনে রাখুন', video: 'ভিডিও টিউটোরিয়াল', soon: 'টিউটোরিয়াল ভিডিও শিগগির আসছে।', watch: 'টিউটোরিয়াল দেখুন', related: 'সম্পর্কিত page', lang: 'ভাষা', close: 'বন্ধ' },
};

export function HelpPanel() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(null);
  const [locale, setLoc] = useState('en');
  useEffect(() => {
    const on = () => {
      const title = (document.querySelector('.gc-shell__content h1, main h1, h1') || {}).innerText || '';
      const description = (document.querySelector('.gc-pagehead__desc') || {}).innerText || '';
      setPage(helpFor(window.location.pathname.replace(/\/$/, '') || '/', { title: title.trim(), description: description.trim() }));
      setLoc(getLocale());
      setOpen(true);
    };
    const loc = () => setLoc(getLocale());
    const key = (e) => { if (e.key === '?' && e.shiftKey && !/input|textarea|select/i.test((e.target || {}).tagName || '') && !(e.target || {}).isContentEditable) on(); };
    window.addEventListener('gc:help', on);
    window.addEventListener('gc:locale', loc);
    document.addEventListener('keydown', key);
    return () => { window.removeEventListener('gc:help', on); window.removeEventListener('gc:locale', loc); document.removeEventListener('keydown', key); };
  }, []);
  if (!open || !page) return null;
  const t = T[locale] || T.en;
  const c = page[locale] || page.en;
  return (
    <Sheet open title={`${t.help} · ${page.name}`} onClose={() => setOpen(false)}
      footer={<>
        <span className="hp-lang" role="group" aria-label={t.lang}>{t.lang}
          <button type="button" className={'gc-btn gc-btn--sm ' + (locale === 'en' ? 'gc-btn--solid' : 'gc-btn--neutral')} aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>English</button>
          <button type="button" className={'gc-btn gc-btn--sm ' + (locale === 'bn' ? 'gc-btn--solid' : 'gc-btn--neutral')} aria-pressed={locale === 'bn'} onClick={() => setLocale('bn')} lang="bn">বাংলা</button>
        </span>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setOpen(false)}>{t.close}</button>
      </>}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <section className="hp-sec" lang={locale}><h3>{t.what}</h3><p>{c.what}</p></section>
      {c.steps && c.steps.length ? <section className="hp-sec" lang={locale}><h3>{t.how}</h3><ol>{c.steps.map((s) => <li key={s}>{s}</li>)}</ol></section> : null}
      {c.tips && c.tips.length ? <section className="hp-sec" lang={locale}><h3>{t.know}</h3><ul>{c.tips.map((s) => <li key={s}>{s}</li>)}</ul></section> : null}
      <section className="hp-sec">
        <h3>{t.video}</h3>
        <button type="button" className="hp-video" onClick={() => toast(t.soon, { tone: 'info' })}>
          <span className="hp-video__thumb" aria-hidden="true"><Icon name="play" width="24" height="24" /></span>
          <span><b lang={locale}>{(c.video || [])[0] || t.watch}</b><small>{t.watch} · {(c.video || [])[1] || '2:00'}</small></span>
        </button>
      </section>
      {page.related && page.related.filter((r) => routeInEdition(r.split('?')[0])).length ? (
        <section className="hp-sec"><h3>{t.related}</h3><div className="hp-rel">{page.related.filter((r) => routeInEdition(r.split('?')[0])).map((r) => <Link key={r} href={r} onClick={() => setOpen(false)}><Icon name="arrow-up-right" width="14" height="14" aria-hidden="true" />{labelFor(r)}</Link>)}</div></section>
      ) : null}
    </Sheet>
  );
}
