'use client';
// Tweak panel (/store?preview=1&tweak=1): staff restyle the home page part by part on the store itself. Click a part
// (header, any section, a product card, the footer) or pick it from the list: the panel shows its look, words, colours and
// spacing, and every change is saved to the draft at once, so the page redraws as you go. Publish puts the draft live;
// Discard goes back to what customers see. The full editors (Customize, Layouts) stay one click away for the rest.
// Drawn in GridCommerce's own look (a portal outside the themed page), so it never takes the theme's fonts or colours.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { read, SF_EVENT, isDirty } from '@/lib/storefront/store';
import { themeDraft, saveThemeDraft, publishTheme, discardTheme, optionBy, FONT_PAIRS, OPTIONS, GROUPS, visibleOptions, searchOptions, themeClasses } from '@/lib/storefront/theme';
import { WORDS, WORD_GROUPS, wordDefault } from '@/lib/storefront/words';
import { storeProducts } from '@/lib/storefront/catalog';
import { lockOf } from '@/lib/storefront/access';
import { getLayout, saveLayoutDraft, publishLayout, discardLayout, sectionType, variantOf, TONES, CARD_STYLES, SECTION_TYPES, newSection, PRODUCT_LOOKS } from '@/lib/storefront/layouts';
import { logoColours, suggestPalettes, suggestFonts } from '@/lib/storefront/brandKit';
import { ImageField } from '@/components/files/FilePicker';
import { PAGE_LOOKS, PAGE_PARTS } from '@/lib/storefront/pageLooks';
import { getPosts } from '@/lib/blog';
import { getHeaders } from '@/lib/storefront/headers';
import { STEPS, WIDTHS, ALIGNS, DIVIDERS } from '@/lib/storefront/styles';
import { StyleSketch, SFB_CSS } from '@/screens/online-store/sfShared';
import { Field, FIELDS_CSS } from '@/screens/online-store/SectionFields';
import { STARTER, lookPatch } from './sectionStarters';

const choices = (key) => ((optionBy(key) || {}).choices || []).map((c) => [c.value, c.label]);
const PRODUCT_FIELDS = (sectionType('products').fields || []);
const fieldChoices = (type, key) => ((sectionType(type).fields || []).find((f) => f[0] === key) || [])[4] || [];
const short = (l) => String(l).split(/[,(:·]/)[0].trim();

/** Debounce typing so the page redraws once the words settle. */
function useDebounced(fn, ms = 260) {
  const t = useRef(null);
  useEffect(() => () => clearTimeout(t.current), []);
  return (...a) => { clearTimeout(t.current); t.current = setTimeout(() => fn(...a), ms); };
}

function Seg({ value, options, onChange, label }) {
  return (
    <div className="stw-seg" role="group" aria-label={label}>
      {options.map(([v, l]) => <button key={v || 'x'} type="button" aria-pressed={(value || '') === v} onClick={() => onChange(v)}>{short(l)}</button>)}
    </div>
  );
}
function Row({ label, children, htmlFor }) {
  return <div className="stw-row">{htmlFor ? <label htmlFor={htmlFor}>{label}</label> : <span className="stw-lab">{label}</span>}{children}</div>;
}
function Pick({ id, value, options, onChange }) {
  return <select id={id} className="stw-in" value={value || ''} onChange={(e) => onChange(e.target.value)}>{options.map(([v, l]) => <option key={v || 'x'} value={v}>{l}</option>)}</select>;
}
function Text({ id, value, onChange, area }) {
  const [v, setV] = useState(value || '');
  useEffect(() => { setV(value || ''); }, [value]);
  const push = useDebounced(onChange);
  const on = (e) => { setV(e.target.value); push(e.target.value); };
  return area ? <textarea id={id} className="stw-in" rows={3} value={v} onChange={on} /> : <input id={id} className="stw-in" value={v} onChange={on} />;
}
function Colour({ id, value, onChange }) {
  const push = useDebounced(onChange, 120);
  return <span className="stw-colour"><input id={id} type="color" value={/^#[0-9a-f]{6}$/i.test(value || '') ? value : '#000000'} onChange={(e) => push(e.target.value)} /><code>{value}</code></span>;
}

/** Brand kit: upload the logo, then one tap on a colour set or a font pair that matches it. */
function BrandKit({ v, setTheme }) {
  const logo = v.logoImage || '';
  const [cols, setCols] = useState(null);
  useEffect(() => {
    let on = true;
    setCols(null);
    (logo ? logoColours(logo) : Promise.resolve([])).then((c) => { if (on) setCols(c.length ? c : [v.primary, v.accent]); }, () => { if (on) setCols([v.primary, v.accent]); });
    return () => { on = false; };
    // the suggestions follow the logo; colours chosen from them must not re-read it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logo]);
  const pals = cols ? suggestPalettes(cols) : [];
  const fonts = cols ? suggestFonts(cols) : [];
  const q = fonts.map((f) => FONT_PAIRS.find((p) => p.id === f.id)).filter((p) => p && p.q).map((p) => p.q).join('&');
  const same = (p) => ['primary', 'accent', 'bg', 'text'].every((k) => String(v[k] || '').toLowerCase() === String(p.values[k]).toLowerCase());
  return (
    <>
      <Row label="Logo" htmlFor="stw-logo"><ImageField id="stw-logo" value={logo} onChange={(x) => setTheme({ logoImage: x })} folder="brand" label="logo" /></Row>
      {logo && cols ? <div className="stw-found"><span>{cols.map((c) => <i key={c} style={{ background: c }} title={c} />)}</span><small>Colours found in your logo</small></div>
        : !logo ? <p className="stw-muted">Add your logo and we suggest colours and fonts that match it. Until then, the ideas below start from your current colours.</p> : <p className="stw-muted">Reading your logo…</p>}
      <p className="stw-cap">Colour sets</p>
      <div className="stw-pals">
        {pals.map((p) => (
          <button key={p.id} type="button" className="stw-pal" aria-pressed={same(p)} onClick={() => { setTheme(p.values); toast(p.name + ' applied'); }}>
            <span className="stw-pal__sw" aria-hidden="true">{['primary', 'accent', 'bg', 'text'].map((k) => <i key={k} style={{ background: p.values[k] }} />)}</span>
            <span><b>{p.name}</b><small>{p.why}</small></span>
          </button>
        ))}
      </div>
      <p className="stw-cap">Fonts that suit it</p>
      {q ? <link rel="stylesheet" href={'https://fonts.googleapis.com/css2?' + q + '&display=swap'} /> : null}
      <div className="stw-fonts">
        {fonts.map((f) => {
          const fp = FONT_PAIRS.find((p) => p.id === f.id);
          return fp ? <button key={f.id} type="button" className="stw-font" aria-pressed={v.fontPair === f.id} onClick={() => { setTheme({ fontPair: f.id }); toast(fp.label.split(' · ')[0] + ' applied'); }}><span className="stw-font__aa" style={{ fontFamily: fp.head, fontWeight: fp.hw }} aria-hidden="true">Aa</span><span><b>{fp.label.split(' · ')[0]}</b><small>{f.why}</small></span></button> : null;
        })}
      </div>
    </>
  );
}

/** One theme option, drawn by its type (the same options as Customize). */
function OptionRow({ o, v, setTheme }) {
  const id = 'stw-o-' + o.key;
  const locked = o.lock ? !!lockOf(o.lock) : false;
  if (locked) return <Row label={o.label}><span className="stw-muted">{lockOf(o.lock)}</span></Row>;
  const set = (x) => setTheme({ [o.key]: x });
  if (o.type === 'choice') {
    const ch = (o.choices || []).map((c) => [c.value, c.label]);
    const short2 = ch.every(([, l]) => String(l).length <= 14);
    return ch.length <= 4 && short2 ? <Row label={o.label}><Seg label={o.label} value={String(v[o.key] ?? '')} options={ch} onChange={set} /></Row>
      : <Row label={o.label} htmlFor={id}><Pick id={id} value={String(v[o.key] ?? '')} options={ch} onChange={set} /></Row>;
  }
  if (o.type === 'bool') return <Row label={o.label}><Seg label={o.label} value={v[o.key] ? 'on' : ''} options={[['on', 'On'], ['', 'Off']]} onChange={(x) => set(x === 'on')} /></Row>;
  if (o.type === 'color') return <Row label={o.label} htmlFor={id}><Colour id={id} value={v[o.key]} onChange={set} /></Row>;
  if (o.type === 'number') return <Row label={o.label} htmlFor={id}><input id={id} className="stw-in" type="number" min={o.min} max={o.max} step={o.step || 1} value={v[o.key] ?? ''} onChange={(e) => set(Number(e.target.value))} /></Row>;
  if (o.type === 'image') return <Row label={o.label} htmlFor={id}><ImageField id={id} value={v[o.key] || ''} onChange={set} label={o.label.toLowerCase()} /></Row>;
  if (o.type === 'text') return <Row label={o.label} htmlFor={id}><Text id={id} value={v[o.key]} onChange={set} /></Row>;
  return null;   // blocks and custom CSS stay in Customize
}

/** A live sample of the global styles: the theme's own CSS draws it (sf-theme + the root classes). */
function StylePreview({ v }) {
  return (
    <div className={'sf-theme stw-prev ' + themeClasses(v)} aria-label="Preview of the global styles">
      <div className="stw-prev__row">
        <button type="button" className="sf-btn" tabIndex={-1}>Buy now</button>
        <button type="button" className="sf-btn sf-btn--line" tabIndex={-1}>Add to cart</button>
      </div>
      <div className="stw-prev__row">
        <input className="sf-input" tabIndex={-1} readOnly value="" placeholder="01XXXXXXXXX" aria-label="Sample field" />
        <span className="sf-qty"><button type="button" tabIndex={-1} aria-label="Less"><Icon name="minus" width="14" height="14" /></button><span>1</span><button type="button" tabIndex={-1} aria-label="More"><Icon name="plus" width="14" height="14" /></button></span>
      </div>
      <div className="stw-prev__row">
        <span className="sfz-qlink__ic" aria-hidden="true"><Icon name="truck" width="20" height="20" /></span>
        <span className="sf-stars" aria-hidden="true">★★★★<i>★</i></span>
        <span className="sf-card stw-prev__card"><span className="sf-price"><b>৳3,290</b><s>৳3,990</s></span></span>
        <em className="sf-badge stw-prev__badge">−18%</em>
        <label className="stw-prev__chk"><input type="checkbox" tabIndex={-1} defaultChecked readOnly />Tick</label>
      </div>
      <div className="spd-chips stw-prev__row"><button type="button" tabIndex={-1} aria-pressed="true">128 GB</button><button type="button" tabIndex={-1} aria-pressed="false">256 GB</button></div>
    </div>
  );
}

/** Every fixed word on the store, by group; the clicked one is opened first. */
function WordsPart({ v, setTheme, focus }) {
  const [q, setQ] = useState('');
  const words = v.words || {};
  const setWord = (k, x) => setTheme({ words: { ...words, [k]: x } });
  useEffect(() => { if (focus) { const el = document.getElementById('stw-w-' + focus); if (el) { el.focus(); el.scrollIntoView({ block: 'center' }); } } }, [focus]);
  const hit = (x) => !q || (x.def + ' ' + (words[x.key] || '')).toLowerCase().includes(q.toLowerCase());
  return (
    <>
      <p className="stw-muted">Change any of the store’s own words. Empty goes back to the default. Click words on the page to jump to them.</p>
      <input className="stw-in" type="search" placeholder="Find a word" aria-label="Find a word" value={q} onChange={(e) => setQ(e.target.value)} />
      {WORD_GROUPS.map((g) => {
        const list = WORDS.filter((x) => x.group === g.id && hit(x));
        if (!list.length) return null;
        return (
          <div key={g.id} className="stw-wgroup">
            <p className="stw-cap">{g.label}</p>
            {list.map((x) => (
              <div key={x.key} className={'stw-word' + (focus === x.key ? ' is-focus' : '')}>
                <label htmlFor={'stw-w-' + x.key}>{wordDefault(x.key)}</label>
                <span><Text id={'stw-w-' + x.key} value={words[x.key] || ''} onChange={(val) => setWord(x.key, val)} />{words[x.key] ? <button type="button" className="stw-ib" aria-label={'Reset ' + x.def} onClick={() => setWord(x.key, '')}><Icon name="rotate-ccw" width="14" height="14" aria-hidden="true" /></button> : null}</span>
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
}

/** Where a section's content lives in the admin (it shows the shop's data, edited there). */
const DATA_OF = {
  products: ['Products', '/all-products'], producttabs: ['Products', '/all-products'], bento: ['Products', '/all-products'], deal: ['Products and their sale prices', '/all-products'],
  recent: ['Products', '/all-products'], hotspot: ['Products', '/all-products'], spotlight: ['Products', '/all-products'],
  cattiles: ['Categories', '/categories'], brands: ['Brands', '/brands'], blog: ['Blog posts', '/blog-posts'], reviews: ['Product reviews', '/product-reviews'],
  countdown: ['Flash sales', '/flash-sales'], coupons: ['Coupons', '/coupons'], outlet: ['Branches', '/branches'], contact: ['Branches and contact (Settings › General)', '/branches'],
};

/** The home page, part by part. */
export default function StoreTweak({ layoutId, onClose, start = '' }) {
  const [, setTick] = useState(0);
  const [part, setPart] = useState(start || 'list');
  const [picking, setPicking] = useState(true);
  const [mini, setMini] = useState(false);
  const [word, setWord] = useState('');
  const [pid, setPid] = useState('');
  const [find, setFind] = useState('');
  const panel = useRef(null);
  useEffect(() => {
    const on = () => setTick((n) => n + 1);
    window.addEventListener(SF_EVENT, on);
    return () => window.removeEventListener(SF_EVENT, on);
  }, []);

  const v = themeDraft();
  const lay = layoutId ? getLayout(layoutId) : null;
  const L = lay ? lay.doc.draft : null;
  const secs = (L && L.sections) || [];
  const dirty = isDirty(read().theme) || (lay ? isDirty(lay.doc) : false);
  const setTheme = (patch) => saveThemeDraft({ ...themeDraft(), ...patch });
  const setLayout = (patch) => { if (lay) saveLayoutDraft(lay.id, { ...lay.doc.draft, ...patch }); };
  const setSec = (id, patch) => setLayout({ sections: secs.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  const move = (id, by) => { const i = secs.findIndex((s) => s.id === id); const j = i + by; if (i < 0 || j < 0 || j >= secs.length) return; const n = secs.slice(); [n[i], n[j]] = [n[j], n[i]]; setLayout({ sections: n }); };

  // click a part of the page to open it here (links don't navigate while picking)
  useEffect(() => {
    document.body.classList.toggle('stw-picking', picking && !mini);
    document.body.classList.toggle('stw-open', !mini);
    if (!picking || mini) return undefined;
    const onClick = (e) => {
      if (panel.current && panel.current.contains(e.target)) return;
      if (e.target.closest('.stw-launch')) return;
      const wd = e.target.closest('[data-w]');
      if (wd) { e.preventDefault(); e.stopPropagation(); setWord(wd.getAttribute('data-w')); setPart('words'); return; }
      const sec = e.target.closest('[data-sec]');
      const card = e.target.closest('.sf-card');
      if (card) setPid(card.getAttribute('data-pid') || '');
      const head = e.target.closest('.sfh-row');
      const foot = e.target.closest('footer.sff');
      const to = card ? 'cards' : sec ? 'sec:' + sec.getAttribute('data-sec') : head ? 'header' : foot ? 'footer' : '';
      if (!to) return;
      e.preventDefault();
      e.stopPropagation();
      setPart(to);
    };
    document.addEventListener('click', onClick, true);
    return () => { document.removeEventListener('click', onClick, true); document.body.classList.remove('stw-picking', 'stw-open'); };
  }, [picking, mini]);
  // the part being tweaked is outlined on the page
  useEffect(() => {
    document.querySelectorAll('.stw-sel').forEach((el) => el.classList.remove('stw-sel'));
    let el = null;
    if (part.startsWith('sec:')) el = document.querySelector(`[data-sec="${part.slice(4)}"]`);
    else if (part === 'footer') el = document.querySelector('footer.sff');
    else if (part === 'header') el = document.querySelector('.sfh-row');
    if (el) { el.classList.add('stw-sel'); el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  });

  const publish = () => { publishTheme(themeDraft()); if (lay) publishLayout(lay.id); toast('Published. Customers see the new look now.'); };
  const discard = () => { discardTheme(); if (lay) discardLayout(lay.id); toast('Changes discarded'); };
  const addKind = (type) => {
    const t = sectionType(type);
    let s = newSection(type, STARTER[type] ? STARTER[type]() : {});
    if (t && t.styles) s = { ...s, variant: t.styles[0].id };
    setLayout({ sections: [...secs, s] });
    setPart('sec:' + s.id);
  };

  let body = null;
  let title = 'Tweak your store';
  const found = find.trim() ? visibleOptions(v, searchOptions(find)).filter((o) => !['block', 'css'].includes(o.type)).slice(0, 24) : [];
  const groupPart = (ids) => ids.map((g) => {
    const list = visibleOptions(v, OPTIONS.filter((o) => o.group === g));
    const G = GROUPS.find((x) => x.id === g);
    return list.length ? <div key={g} className="stw-wgroup">{ids.length > 1 ? <p className="stw-cap">{G ? G.label : g}</p> : null}{list.map((o) => <OptionRow key={o.key} o={o} v={v} setTheme={setTheme} />)}</div> : null;
  });
  const PART_LIST = [
    ['styles', 'swatch-book', 'Global styles', 'Buttons, fields, icons, badges, prices'],
    ['words', 'type', 'Words and labels', 'Add to cart, Buy now, headings, notes'],
    ['shop', 'store', 'Shop details', 'Social links, Messenger'],
  ];
  if (part === 'list') {
    const missing = SECTION_TYPES.filter((t) => !secs.some((s) => s.type === t.type));
    body = find.trim() ? (
      <>
        <input className="stw-in stw-find" type="search" autoFocus placeholder="Find a setting: colour, button, font…" aria-label="Find a setting" value={find} onChange={(e) => setFind(e.target.value)} />
        {found.length ? <div className="stw-wgroup">{found.map((o) => <div key={o.key}><small className="stw-from">{(GROUPS.find((g) => g.id === o.group) || {}).label}</small><OptionRow o={o} v={v} setTheme={setTheme} /></div>)}</div> : <p className="stw-muted">Nothing matches “{find}”. Try another word, or open All settings below.</p>}
      </>
    ) : (
      <>
        <input className="stw-in stw-find" type="search" placeholder="Find a setting: colour, button, font…" aria-label="Find a setting" value={find} onChange={(e) => setFind(e.target.value)} />
        <ul className="stw-parts">
          <li><button type="button" onClick={() => setPart('brand')}><Icon name="sparkles" width="16" height="16" aria-hidden="true" /><span><b>Brand kit</b><small>Logo · colours and fonts that match it</small></span><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button></li>
          <li><button type="button" onClick={() => setPart('theme')}><Icon name="palette" width="16" height="16" aria-hidden="true" /><span><b>Look and fonts</b><small>{(FONT_PAIRS.find((f) => f.id === v.fontPair) || FONT_PAIRS[0]).label.split(' · ')[0]} · colours · corners</small></span><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button></li>
          <li><button type="button" onClick={() => setPart('header')}><Icon name="panel-top" width="16" height="16" aria-hidden="true" /><span><b>Header</b><small>{((getHeaders().find((h) => h.id === (L && L.header))) || { name: 'The store’s header' }).name}</small></span><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button></li>
          {PART_LIST.map(([id, ic, l, sub]) => <li key={id}><button type="button" onClick={() => setPart(id)}><Icon name={ic} width="16" height="16" aria-hidden="true" /><span><b>{l}</b><small>{sub}</small></span><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button></li>)}
        </ul>
        {lay ? <><p className="stw-cap">Sections · {secs.filter((s) => !s.hidden).length} shown</p>
        <ul className="stw-parts stw-parts--secs">
          {secs.filter((s) => s.type !== 'main').map((s, i) => {
            const t = sectionType(s.type);
            const st = t && t.styles ? t.styles.find((x) => x.id === variantOf(s)) : null;
            return (
              <li key={s.id} className={s.hidden ? 'is-off' : ''}>
                <button type="button" onClick={() => setPart('sec:' + s.id)}><Icon name={(t && t.icon) || 'square'} width="16" height="16" aria-hidden="true" /><span><b>{s.title || (t && t.label)}</b><small>{(t && t.label) + (st ? ' · ' + st.label : '')}{s.hidden ? ' · hidden' : ''}</small></span></button>
                <span className="stw-acts">
                  <button type="button" className="stw-ib" aria-label={`Move ${s.title || t.label} up`} disabled={i === 0} onClick={() => move(s.id, -1)}><Icon name="arrow-up" width="14" height="14" aria-hidden="true" /></button>
                  <button type="button" className="stw-ib" aria-label={`Move ${s.title || t.label} down`} onClick={() => move(s.id, 1)}><Icon name="arrow-down" width="14" height="14" aria-hidden="true" /></button>
                  <button type="button" className="stw-ib" aria-label={s.hidden ? 'Show' : 'Hide'} aria-pressed={!s.hidden} onClick={() => setSec(s.id, { hidden: !s.hidden })}><Icon name={s.hidden ? 'eye-off' : 'eye'} width="14" height="14" aria-hidden="true" /></button>
                </span>
              </li>
            );
          })}
        </ul>
        {missing.length ? <Row label="Add a section" htmlFor="stw-add"><select id="stw-add" className="stw-in" value="" onChange={(e) => e.target.value && addKind(e.target.value)}><option value="">Choose…</option>{missing.map((t) => <option key={t.type} value={t.type}>{t.label}</option>)}</select></Row> : null}</> : <p className="stw-muted">This page’s sections are set in Online Store › Layouts. Its look is under Pages below.</p>}
        <ul className="stw-parts">
          <li><button type="button" onClick={() => setPart('cards')}><Icon name="layout-grid" width="16" height="16" aria-hidden="true" /><span><b>Product cards</b><small>{short((CARD_STYLES.find((c) => c[0] === v.cardStyle) || ['', 'Classic'])[1])}</small></span><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button></li>
          <li><button type="button" onClick={() => setPart('footer')}><Icon name="panel-bottom" width="16" height="16" aria-hidden="true" /><span><b>Footer</b><small>{short((choices('footerLayout').find((c) => c[0] === v.footerLayout) || ['', 'Columns'])[1])}</small></span><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button></li>
          <li><button type="button" onClick={() => setPart('pages')}><Icon name="files" width="16" height="16" aria-hidden="true" /><span><b>Pages</b><small>Product page · checkout · about · contact · policies · blog</small></span><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button></li>
          <li><button type="button" onClick={() => setPart('all')}><Icon name="settings-2" width="16" height="16" aria-hidden="true" /><span><b>All settings</b><small>Every option, group by group</small></span><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button></li>
        </ul>
      </>
    );
  } else if (part === 'styles') {
    title = 'Global styles';
    body = <><StylePreview v={v} />{groupPart(['styles', 'forms', 'icons'])}</>;
  } else if (part === 'words') {
    title = 'Words and labels';
    body = <WordsPart v={v} setTheme={setTheme} focus={word} />;
  } else if (part === 'shop') {
    title = 'Shop details';
    body = <><p className="stw-muted">Phone, email, address and opening hours come from Settings › General; shops from Settings › Locations.</p>{groupPart(['shop'])}<div className="stw-actrow"><a className="stw-btn" href="/set-general"><Icon name="settings" width="16" height="16" aria-hidden="true" />Settings › General</a><a className="stw-btn" href="/branches"><Icon name="store" width="16" height="16" aria-hidden="true" />Branches</a></div></>;
  } else if (part === 'all') {
    title = 'All settings';
    body = <ul className="stw-parts">{GROUPS.map((g) => <li key={g.id}><button type="button" onClick={() => setPart('grp:' + g.id)}><Icon name={g.icon} width="16" height="16" aria-hidden="true" /><span><b>{g.label}</b><small>{OPTIONS.filter((o) => o.group === g.id).length} settings</small></span><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button></li>)}</ul>;
  } else if (part.startsWith('grp:')) {
    const G = GROUPS.find((g) => g.id === part.slice(4));
    title = G ? G.label : 'Settings';
    body = <>{['styles', 'forms', 'icons'].includes(part.slice(4)) ? <StylePreview v={v} /> : null}{groupPart([part.slice(4)])}</>;
  } else if (part === 'brand') {
    title = 'Brand kit';
    body = <BrandKit v={v} setTheme={setTheme} />;
  } else if (part === 'theme') {
    title = 'Look and fonts';
    body = (
      <>
        <Row label="Fonts" htmlFor="stw-font"><Pick id="stw-font" value={v.fontPair} options={FONT_PAIRS.map((f) => [f.id, f.label])} onChange={(x) => setTheme({ fontPair: x })} /></Row>
        <Row label="Text size"><Seg label="Text size" value={v.baseSize} options={choices('baseSize')} onChange={(x) => setTheme({ baseSize: x })} /></Row>
        <Row label="Headings"><Seg label="Headings" value={v.headCase} options={choices('headCase')} onChange={(x) => setTheme({ headCase: x })} /></Row>
        <div className="stw-grid2">
          {[['primary', 'Primary'], ['accent', 'Accent'], ['text', 'Text'], ['bg', 'Background'], ['surface', 'Cards'], ['sale', 'Sale']].map(([k, l]) => <Row key={k} label={l} htmlFor={'stw-c-' + k}><Colour id={'stw-c-' + k} value={v[k]} onChange={(x) => setTheme({ [k]: x })} /></Row>)}
        </div>
        <Row label="Corners"><Seg label="Corners" value={v.corners} options={choices('corners')} onChange={(x) => setTheme({ corners: x })} /></Row>
        <Row label="Buttons"><Seg label="Buttons" value={v.buttons} options={choices('buttons')} onChange={(x) => setTheme({ buttons: x })} /></Row>
        <Row label="Section titles" htmlFor="stw-titles"><Pick id="stw-titles" value={v.titleStyle} options={choices('titleStyle')} onChange={(x) => setTheme({ titleStyle: x })} /></Row>
        <Row label="Sections sit"><Seg label="Sections sit" value={v.sectionCard} options={choices('sectionCard')} onChange={(x) => setTheme({ sectionCard: x })} /></Row>
        <Row label="Space between sections"><Seg label="Space between sections" value={v.spacing} options={choices('spacing')} onChange={(x) => setTheme({ spacing: x })} /></Row>
        <Row label="Shadows"><Seg label="Shadows" value={v.shadow} options={choices('shadow')} onChange={(x) => setTheme({ shadow: x })} /></Row>
        <a className="stw-link" href="/theme-editor">Every option in Customize<Icon name="arrow-up-right" width="14" height="14" aria-hidden="true" /></a>
      </>
    );
  } else if (part === 'header') {
    title = 'Header';
    body = (
      <>
        {lay ? <Row label="Header for the home page" htmlFor="stw-hdr"><Pick id="stw-hdr" value={(L && L.header) || ''} options={[['', 'The store’s header'], ...getHeaders().map((h) => [h.id, h.name])]} onChange={(x) => setLayout({ header: x })} /></Row> : null}
        <Row label="Colours"><Seg label="Header colours" value={v.headerTone} options={choices('headerTone')} onChange={(x) => setTheme({ headerTone: x })} /></Row>
        {optionBy('announce') ? <Row label="Announcement bar"><Seg label="Announcement bar" value={v.announce ? 'on' : ''} options={[['on', 'On'], ['', 'Off']]} onChange={(x) => setTheme({ announce: x === 'on' })} /></Row> : null}
        {optionBy('announceText') ? <Row label="Announcement" htmlFor="stw-ann"><Text id="stw-ann" value={v.announceText} onChange={(x) => setTheme({ announceText: x })} /></Row> : null}
        <a className="stw-link" href="/header-builder">Build a header row by row<Icon name="arrow-up-right" width="14" height="14" aria-hidden="true" /></a>
      </>
    );
  } else if (part === 'cards') {
    title = 'Product cards';
    body = (
      <>
        <div className="stw-looks">{CARD_STYLES.filter((c) => c[0]).map(([id, l]) => <button key={id} type="button" aria-pressed={v.cardStyle === id} onClick={() => setTheme({ cardStyle: id })}>{short(l)}</button>)}</div>
        {optionBy('cardRatio') ? <Row label="Picture shape"><Seg label="Picture shape" value={v.cardRatio} options={choices('cardRatio')} onChange={(x) => setTheme({ cardRatio: x })} /></Row> : null}
        {optionBy('cardButton') ? <Row label="Button"><Seg label="Card button" value={v.cardButton} options={choices('cardButton')} onChange={(x) => setTheme({ cardButton: x })} /></Row> : null}
        {optionBy('colsDesktop') ? <Row label="Per row on a computer"><Seg label="Per row on a computer" value={String(v.colsDesktop)} options={choices('colsDesktop')} onChange={(x) => setTheme({ colsDesktop: x })} /></Row> : null}
        {groupPart(['card']).map((x) => x)}
        {pid ? (() => { let pr = null; try { pr = storeProducts().find((x) => x.id === pid) || null; } catch { pr = null; } return pr ? <div className="stw-data"><Icon name="package" width="16" height="16" aria-hidden="true" /><span>You clicked <b>{pr.name}</b>. Its photos, price, words and stock are edited on the product.</span><a className="stw-btn" href={'/add-product?id=' + encodeURIComponent(pid)}>Edit this product</a></div> : null; })() : null}
      </>
    );
  } else if (part === 'footer') {
    title = 'Footer';
    body = (
      <>
        <div className="stw-looks">{choices('footerLayout').map(([id, l]) => <button key={id} type="button" aria-pressed={(v.footerLayout || 'columns') === id} onClick={() => setTheme({ footerLayout: id })}>{short(l)}</button>)}</div>
        <Row label="Colours"><Seg label="Footer colours" value={v.footerTone} options={choices('footerTone')} onChange={(x) => setTheme({ footerTone: x })} /></Row>
        {optionBy('footerMarks') ? <Row label="Payment marks"><Seg label="Payment marks" value={v.footerMarks ? 'on' : ''} options={[['on', 'Show'], ['', 'Hide']]} onChange={(x) => setTheme({ footerMarks: x === 'on' })} /></Row> : null}
      </>
    );
  } else if (part === 'pages') {
    title = 'Pages';
    body = (
      <ul className="stw-parts">
        {PAGE_PARTS.map((pp) => {
          const now = pp.keys.map((k) => short(((choices(k).find((c) => c[0] === v[k])) || ['', ''])[1])).filter(Boolean).slice(0, 2).join(' · ');
          return <li key={pp.id}><button type="button" onClick={() => setPart('pg:' + pp.id)}><Icon name={pp.icon} width="16" height="16" aria-hidden="true" /><span><b>{pp.label}</b><small>{now}</small></span><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button></li>;
        })}
      </ul>
    );
  } else if (part.startsWith('pg:')) {
    const pp = PAGE_PARTS.find((x) => x.id === part.slice(3)) || PAGE_PARTS[0];
    title = pp.label;
    let open = pp.open;
    if (pp.id === 'post') { let first = null; try { first = getPosts().find((x) => x.status === 'published'); } catch { first = null; } open += first ? encodeURIComponent(first.slug) : ''; }
    const here = typeof window !== 'undefined' && (window.location.pathname + window.location.search).indexOf(open.split('?')[0]) === 0 && open !== '/blog-post?slug=';
    body = (
      <>
        {pp.keys.map((k) => {
          const o = optionBy(k);
          if (!o) return null;
          const looks = PAGE_LOOKS[k];
          if (looks) {
            return (
              <div key={k} className="stw-row">
                <span className="stw-lab">{o.label}</span>
                <div className="stw-sketches" role="radiogroup" aria-label={o.label}>{looks.map((st) => <button key={st.id} type="button" role="radio" aria-checked={(v[k] || o.default) === st.id} onClick={() => setTheme({ [k]: st.id })}><StyleSketch sketch={st.sketch} label={st.label} /><span>{st.label}</span></button>)}</div>
              </div>
            );
          }
          const ch = choices(k);
          return ch.length <= 4 ? <Row key={k} label={o.label}><Seg label={o.label} value={v[k]} options={ch} onChange={(x) => setTheme({ [k]: x })} /></Row>
            : <Row key={k} label={o.label} htmlFor={'stw-' + k}><Pick id={'stw-' + k} value={v[k]} options={ch} onChange={(x) => setTheme({ [k]: x })} /></Row>;
        })}
        {!here ? <a className="stw-btn" href={open + (open.includes('?') ? '&' : '?') + 'preview=1&tweak=1&part=pg:' + pp.id}><Icon name="arrow-up-right" width="16" height="16" aria-hidden="true" />Open the {pp.label.toLowerCase()} to see it</a> : null}
      </>
    );
  } else if (part.startsWith('sec:')) {
    const s = secs.find((x) => x.id === part.slice(4));
    const t = s && sectionType(s.type);
    if (!s || !t) body = <p className="stw-muted">This part is not on the home page any more.</p>;
    else {
      title = t.label;
      const has = (k) => (t.fields || []).some((f) => f[0] === k);
      const box = s.box || {};
      const setBox = (k, val) => setSec(s.id, { box: { ...box, [k]: val } });
      const step = (k) => (box[k] && box[k].d) || '';
      body = (
        <>
          {t.styles ? (
            <div className="stw-sketches" role="radiogroup" aria-label="Look">
              {t.styles.map((st) => <button key={st.id} type="button" role="radio" aria-checked={variantOf(s) === st.id} onClick={() => setSec(s.id, { variant: st.id, ...lookPatch(s, st.id) })}><StyleSketch sketch={st.sketch} label={st.label} /><span>{st.label}</span></button>)}
            </div>
          ) : null}
          {s.type === 'products' || s.type === 'producttabs' ? (
            <>
              {s.type === 'products' ? <Row label="Show" htmlFor="stw-src"><Pick id="stw-src" value={s.source} options={fieldChoices('products', 'source').filter((c) => c[0] !== 'picked' && c[0] !== 'related')} onChange={(x) => setSec(s.id, { source: x })} /></Row> : null}
              {s.type === 'products' ? (
                <div className="stw-sketches" role="radiogroup" aria-label="Layout">
                  {PRODUCT_LOOKS.map((st) => <button key={st.id} type="button" role="radio" aria-checked={(s.layout || 'grid') === st.id} onClick={() => setSec(s.id, { layout: st.id })}><StyleSketch sketch={st.sketch} label={st.label} /><span>{st.label}</span></button>)}
                </div>
              ) : <Row label="Layout" htmlFor="stw-lay"><Pick id="stw-lay" value={s.layout} options={fieldChoices(s.type, 'layout')} onChange={(x) => setSec(s.id, { layout: x })} /></Row>}
              <Row label="Card" htmlFor="stw-card"><Pick id="stw-card" value={s.card || ''} options={CARD_STYLES} onChange={(x) => setSec(s.id, { card: x })} /></Row>
            </>
          ) : null}
          <div className="stw-fields">
            {(t.fields || []).filter((fd) => (!fd[5] || fd[5]({ ...s, variant: variantOf(s) })) && !((s.type === 'products' || s.type === 'producttabs') && ['source', 'layout', 'card'].includes(fd[0]))).map((fd) => <Field key={fd[0]} fd={fd} f={s} set={(patch) => setSec(s.id, patch)} locked={false} variant={variantOf(s)} />)}
          </div>
          {DATA_OF[s.type] ? <div className="stw-data"><Icon name="database" width="16" height="16" aria-hidden="true" /><span>This section shows your <b>{DATA_OF[s.type][0].toLowerCase()}</b>. Add, remove or change them there and the store follows.</span><a className="stw-btn" href={DATA_OF[s.type][1]}>Open {DATA_OF[s.type][0].split(' (')[0]}</a></div> : null}
          {s.type === 'social' ? <div className="stw-data"><Icon name="share-2" width="16" height="16" aria-hidden="true" /><span>The links come from Shop details.</span><button type="button" className="stw-btn" onClick={() => setPart('shop')}>Shop details</button></div> : null}
          <p className="stw-cap">Style</p>
          <Row label="Background"><Seg label="Background" value={s.tone || 'none'} options={TONES} onChange={(x) => setSec(s.id, { tone: x })} /></Row>
          <Row label="Space above"><Seg label="Space above" value={step('pt')} options={STEPS} onChange={(x) => setBox('pt', { ...(box.pt || {}), d: x })} /></Row>
          <Row label="Space below"><Seg label="Space below" value={step('pb')} options={STEPS} onChange={(x) => setBox('pb', { ...(box.pb || {}), d: x })} /></Row>
          <Row label="Width"><Seg label="Width" value={box.width || ''} options={WIDTHS} onChange={(x) => setBox('width', x)} /></Row>
          <Row label="Text"><Seg label="Text alignment" value={box.align || ''} options={ALIGNS} onChange={(x) => setBox('align', x)} /></Row>
          <div className="stw-grid2">
            <Row label="Top edge" htmlFor="stw-dt"><Pick id="stw-dt" value={box.divTop || ''} options={DIVIDERS} onChange={(x) => setBox('divTop', x)} /></Row>
            <Row label="Bottom edge" htmlFor="stw-db"><Pick id="stw-db" value={box.divBottom || ''} options={DIVIDERS} onChange={(x) => setBox('divBottom', x)} /></Row>
          </div>
          <div className="stw-actrow">
            <button type="button" className="stw-btn" onClick={() => setSec(s.id, { hidden: !s.hidden })}><Icon name={s.hidden ? 'eye' : 'eye-off'} width="16" height="16" aria-hidden="true" />{s.hidden ? 'Show' : 'Hide'}</button>
            <a className="stw-btn" href={'/layout-edit?id=' + encodeURIComponent(layoutId)}><Icon name="sliders-horizontal" width="16" height="16" aria-hidden="true" />All settings</a>
          </div>
        </>
      );
    }
  }

  const ui = (
    <aside ref={panel} className={'stw' + (mini ? ' is-mini' : '')} aria-label="Tweak your store">
      <style dangerouslySetInnerHTML={{ __html: SFB_CSS + FIELDS_CSS + STW_CSS }} />
      <header className="stw-head">
        {part !== 'list' && !mini ? <button type="button" className="stw-ib" aria-label="Back to all parts" onClick={() => setPart('list')}><Icon name="arrow-left" width="16" height="16" aria-hidden="true" /></button> : <span className="stw-mark" aria-hidden="true"><Icon name="sliders-horizontal" width="16" height="16" /></span>}
        <h2>{mini ? 'Tweak' : title}</h2>
        {dirty ? <span className="stw-dot" title="Unpublished changes">Draft</span> : null}
        <button type="button" className="stw-ib" aria-label={mini ? 'Open the panel' : 'Fold the panel'} onClick={() => setMini((x) => !x)}><Icon name={mini ? 'chevron-up' : 'chevron-down'} width="16" height="16" aria-hidden="true" /></button>
        <button type="button" className="stw-ib" aria-label="Close tweaking" onClick={onClose}><Icon name="x" width="16" height="16" aria-hidden="true" /></button>
      </header>
      {mini ? null : (
        <>
          <label className="stw-pick"><input type="checkbox" checked={picking} onChange={(e) => setPicking(e.target.checked)} /><span>Click a part of the page to tweak it</span></label>
          <div className="stw-body">{body}</div>
          <footer className="stw-foot">
            <button type="button" className="stw-btn" disabled={!dirty} onClick={discard}>Discard</button>
            <button type="button" className="stw-btn stw-btn--solid" disabled={!dirty} onClick={publish}>Publish</button>
          </footer>
        </>
      )}
    </aside>
  );
  return typeof document === 'undefined' ? null : createPortal(ui, document.body);
}

const STW_CSS = `
.stw-find{margin-bottom:4px}
.stw-from{display:block;margin-top:6px;color:var(--text-muted);font-size:var(--text-xs)}
.stw-wgroup{display:flex;flex-direction:column;gap:10px}
.stw-word{display:flex;flex-direction:column;gap:4px;padding:6px 8px;margin:0 -8px;border-radius:var(--radius-lg)}
.stw-word.is-focus{background:var(--fill-primary-soft)}
.stw-word label{font-size:var(--text-xs);color:var(--text-muted)}
.stw-word>span{display:flex;gap:6px;align-items:center}
.stw-word>span>.stw-in{flex:1}
.stw-data{display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:12px;border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm);color:var(--text-body)}
.stw-data>svg{color:var(--primary)}
.stw-prev.sf-theme{min-height:0;display:flex;flex-direction:column;gap:10px;padding:14px;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--sf-bg);overflow:hidden}
.stw-prev__row{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.stw-prev__row .sf-btn{min-height:38px;padding-inline:14px;pointer-events:none}
.stw-prev__row .sf-input{flex:1;min-width:120px;pointer-events:none}
.stw-prev__card.sf-card{display:inline-flex;padding:4px 10px;flex-direction:row}
.stw-prev__badge.sf-badge{position:static}
.stw-prev__chk{display:inline-flex;align-items:center;gap:6px;color:var(--sf-text);font-size:var(--text-sm)}
.stw-prev .spd-chips button{pointer-events:none}

.stw-fields{display:flex;flex-direction:column;gap:12px}
.stw-fields .sfb-field{display:flex;flex-direction:column;gap:6px}

.stw{position:fixed;top:16px;right:16px;bottom:16px;z-index:200;display:flex;flex-direction:column;width:360px;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);color:var(--text-body);font-family:var(--font-sans);font-size:var(--text-sm);box-shadow:0 24px 48px -16px rgba(15,23,42,.35),0 2px 6px rgba(15,23,42,.08);overflow:hidden;animation:stw-in .26s cubic-bezier(.2,.8,.2,1)}
.stw.is-mini{bottom:auto;width:220px}
@keyframes stw-in{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.stw{animation:none}}
.stw-head{display:flex;align-items:center;gap:8px;padding:10px 10px 10px 14px;border-bottom:1px solid var(--border-subtle)}
.stw-head h2{flex:1;min-width:0;margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.stw-mark{display:grid;place-items:center;width:28px;height:28px;border-radius:var(--radius-lg);background:var(--primary);color:#fff}
.stw-dot{padding:2px 8px;border-radius:var(--radius-full);background:#fff4e0;color:#a14f06;font-size:var(--text-xs);font-weight:var(--weight-medium)}
.stw-ib{display:grid;place-items:center;width:32px;height:32px;border:0;border-radius:var(--radius-full);background:transparent;color:var(--text-body);cursor:pointer}
.stw-ib:hover{background:var(--surface-sunken,#f1f5f9)}
.stw-ib:disabled{opacity:.35;cursor:default}
.stw-pick{display:flex;align-items:center;gap:8px;padding:8px 14px;border-bottom:1px solid var(--border-subtle);background:var(--surface-sunken,#f8fafc);font-size:var(--text-xs);color:var(--text-muted);cursor:pointer}
.stw-pick input{accent-color:var(--primary)}
.stw-body{flex:1;overflow:auto;padding:12px 14px 16px;display:flex;flex-direction:column;gap:12px;overscroll-behavior:contain}
.stw-body>*{flex:none}
.stw-cap{margin:6px 0 -4px;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted)}
.stw-parts{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden}
.stw-parts>li{position:relative;display:flex;align-items:center;border-top:1px solid var(--border-subtle)}
.stw-parts>li:first-child{border-top:0}
.stw-parts>li>button{flex:1;min-width:0;display:flex;align-items:center;gap:10px;padding:10px 12px;border:0;background:none;text-align:left;font:inherit;color:inherit;cursor:pointer}
.stw-parts>li>button:hover{background:var(--surface-sunken,#f8fafc)}
.stw-parts>li>button>span{flex:1;min-width:0;display:flex;flex-direction:column}
.stw-parts b{font-weight:var(--weight-medium);color:var(--text-heading);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.stw-parts small{font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.stw-parts>li.is-off b{color:var(--text-muted)}
.stw-acts{display:flex;padding-right:6px;opacity:.55;transition:opacity .15s}
.stw-parts>li:hover .stw-acts,.stw-acts:focus-within{opacity:1}
.stw-acts .stw-ib{width:28px;height:28px}
.stw-row{display:flex;flex-direction:column;gap:6px}
.stw-row>label,.stw-lab{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-heading)}
.stw-in{width:100%;min-height:36px;padding:6px 10px;border:1px solid var(--border-default,#cbd5e1);border-radius:var(--radius-lg);background:#fff;font:inherit;color:var(--text-heading);box-sizing:border-box}
textarea.stw-in{resize:vertical;line-height:1.5}
.stw-in:focus{outline:2px solid var(--primary);outline-offset:0;border-color:transparent}
.stw-seg{display:flex;flex-wrap:wrap;gap:4px}
.stw-seg button,.stw-looks button{min-height:32px;padding:0 10px;border:1px solid var(--border-default,#cbd5e1);border-radius:var(--radius-full);background:#fff;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.stw-seg button[aria-pressed="true"],.stw-looks button[aria-pressed="true"]{border-color:var(--primary);background:var(--primary);color:#fff}
.stw-looks{display:flex;flex-wrap:wrap;gap:6px}
.stw-grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.stw-colour{display:flex;align-items:center;gap:8px}
.stw-colour input{width:36px;height:32px;padding:0;border:1px solid var(--border-default,#cbd5e1);border-radius:var(--radius-lg);background:none;cursor:pointer}
.stw-colour code{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.stw-sketches{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.stw-sketches button{display:flex;flex-direction:column;gap:6px;padding:6px;border:1.5px solid var(--border-subtle);border-radius:var(--radius-lg);background:#fff;font:inherit;font-size:var(--text-xs);color:var(--text-body);text-align:left;cursor:pointer}
.stw-sketches button[aria-checked="true"]{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 16%,transparent)}
.stw-actrow{display:flex;gap:8px;flex-wrap:wrap}
.stw-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:36px;padding:0 14px;border:1px solid var(--border-default,#cbd5e1);border-radius:var(--radius-lg);background:#fff;font:inherit;font-weight:var(--weight-medium);color:var(--text-heading);text-decoration:none;cursor:pointer}
.stw-btn:disabled{opacity:.45;cursor:default}
.stw-btn--solid{border-color:var(--primary);background:var(--primary);color:#fff}
.stw-link{display:inline-flex;align-items:center;gap:4px;color:var(--primary);font-weight:var(--weight-medium);text-decoration:none}
.stw-link:hover{text-decoration:underline}
.stw-muted{margin:0;color:var(--text-muted)}
.stw .fp-field__img img{object-fit:contain}
.stw-found{display:flex;align-items:center;gap:10px}
.stw-found span{display:flex}
.stw-found i{width:24px;height:24px;margin-right:-6px;border:2px solid #fff;border-radius:50%;box-shadow:0 0 0 1px var(--border-subtle)}
.stw-found small{margin-left:8px;color:var(--text-muted);font-size:var(--text-xs)}
.stw-pals,.stw-fonts{display:flex;flex-direction:column;gap:6px}
.stw-pal,.stw-font{display:flex;align-items:center;gap:12px;width:100%;padding:10px;border:1.5px solid var(--border-subtle);border-radius:var(--radius-lg);background:#fff;font:inherit;color:inherit;text-align:left;cursor:pointer;transition:border-color .15s ease}
.stw-pal:hover,.stw-font:hover{border-color:var(--primary)}
.stw-pal[aria-pressed="true"],.stw-font[aria-pressed="true"]{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 14%,transparent)}
.stw-pal>span:last-child,.stw-font>span:last-child{display:flex;flex-direction:column;min-width:0}
.stw-pal b,.stw-font b{font-weight:var(--weight-medium);color:var(--text-heading)}
.stw-pal small,.stw-font small{color:var(--text-muted);font-size:var(--text-xs);line-height:1.35}
.stw-pal__sw{display:grid;grid-template-columns:repeat(2,16px);gap:2px;flex:none;padding:3px;border-radius:var(--radius-md);background:var(--border-subtle)}
.stw-pal__sw i{width:16px;height:16px;border-radius:var(--radius-sm)}
.stw-font__aa{display:grid;place-items:center;flex:none;width:44px;height:44px;border-radius:var(--radius-lg);background:var(--surface-sunken,#f1f5f9);color:var(--text-heading);font-size:var(--text-xl)}
.stw-foot{display:flex;justify-content:flex-end;gap:8px;padding:10px 14px;border-top:1px solid var(--border-subtle);background:var(--surface-card)}
body.stw-picking [data-sec]:hover,body.stw-picking .sfh-row:hover,body.stw-picking footer.sff:hover,body.stw-picking .sf-card:hover{outline:2px dashed color-mix(in srgb,#2563eb 70%,transparent);outline-offset:-2px;cursor:pointer}
.stw-sel{outline:2px solid #2563eb!important;outline-offset:-2px}
/* on a wide screen the page moves over so the panel never covers it */
@media (min-width:1100px){body.stw-open .sf-theme{margin-right:392px}}
@media (max-width:640px){.stw{top:auto;left:8px;right:8px;bottom:8px;width:auto;max-height:72vh}.stw.is-mini{left:auto;width:200px}.stw-in{min-height:44px}.stw-seg button,.stw-looks button{min-height:36px}}
`;
