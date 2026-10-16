'use client';
// sections — the layout sections a customer page is built from (Online Store › Layouts, lib/storefront/layouts.js):
// hero / slider, category tiles, products (grid or swipe row: new, best sellers, on sale, a category, hand-picked,
// related), offer banner, countdown (the live flash sale from Marketing), brands strip, reviews (Online Store ›
// Reviews), blog posts, video (loads YouTube only on tap), text and picture, FAQ, newsletter, HTML block, "why shop
// with us", recently viewed, a custom section (Nayeem's Batch A: the shop's own HTML + CSS, customs.js); plus "main", the page's own content (the product, the category's products …), which
// the page passes in. Light by default for 3G phones: pictures load lazily, no animations.

import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { clockNow } from '@/lib/settlements';
import { themeValues } from '@/lib/storefront/theme';
import { sectionType, layoutFor, variantOf } from '@/lib/storefront/layouts';
import { SF_EVENT, isEditing, previewValue, selectInEditor } from '@/lib/storefront/store';
import { fontPair } from '@/lib/storefront/theme';
import { boxProps, sectionFonts } from '@/lib/storefront/styles';
import { useFileSrc } from '@/lib/files';
import { FileImg } from '@/components/files/FileParts';
import { productsBy, topCategories, catByPath, catChildren, storeBrands, storeReviews, storePosts, liveFlashSale, storeProducts } from '@/lib/storefront/catalog';
import { recentlyViewed } from '@/lib/storefront/cart';
import { ProductCard, BlockContent, Stars } from './storeKit';
import { moreBody, OWN_HEAD } from './sections2';
import { moreBody3, TITLED3, OWN_HEAD3 } from './sections3';
import { w } from '@/lib/storefront/words';
import { getCustom } from '@/lib/storefront/customs';
import { renderCustom } from '@/lib/storefront/customCode';

const pad = (n) => (n < 10 ? '0' : '') + n;

export function ProductList({ list, v, layout, card }) {
  if (!list.length) return null;
  const style = card || '';
  const cls = layout === 'carousel' ? 'sf-row' : layout === 'peek' ? 'sf-row is-peek' : layout === 'two' ? 'sf-grid is-2' : layout === 'three' ? 'sf-grid is-3' : 'sf-grid';
  return <div className={cls + ((style || v.cardStyle) === 'horizontal' ? ' is-h' : '')}>{list.map((p) => <ProductCard key={p.id} p={p} values={v} style={style || undefined} />)}</div>;
}
/** Where a titled section's "View all" goes ('' = none). */
function moreOf(s) {
  if (s.more) return s.more;
  if (s.type === 'products') {
    if (s.source === 'category' && s.cat) { const c = catByPath(s.cat); return c ? c.href : ''; }
    if (s.source === 'picked' || s.source === 'related') return '';
    return '/search?q=' + (s.source === 'sale' ? '&sale=1' : '');
  }
  if (s.type === 'countdown') return '/offers';
  return '';
}

const reduced = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };
const ytId = (u) => { const m = String(u || '').match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : ''; };

function HeroVideo({ s, slide: x }) {
  const src = useFileSrc(s.video || '', 'full');
  const poster = useFileSrc(s.poster || (x && x.image) || '', 'full');
  const [still, setStill] = useState(true);
  useEffect(() => { setStill(reduced()); }, []);
  const yt = ytId(s.video);
  return (
    <div className={'sfs-hero hv-video is-' + (s.height || 'M')}>
      <div className="sfs-slide has-img">
        {poster ? <img src={poster} alt="" /> : null}
        {!still && yt ? <iframe className="sfs-bgvid" src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&mute=1&loop=1&playlist=${yt}&controls=0&modestbranding=1&playsinline=1&rel=0`} title="" aria-hidden="true" tabIndex={-1} allow="autoplay; encrypted-media" /> : null}
        {!still && !yt && src ? <video className="sfs-bgvid" src={src} poster={poster || undefined} autoPlay muted loop playsInline aria-hidden="true" /> : null}
        {x ? <div className="sfs-slide__text">
          <h2>{x.title}</h2>
          {x.text ? <p>{x.text}</p> : null}
          {x.button ? <a className="sf-btn sf-btn--fill" href={x.href || '#'}>{x.button}</a> : null}
        </div> : null}
      </div>
    </div>
  );
}

function Slide({ x, i, v }) {
  const img = x.image ? <FileImg src={x.image} size="full" alt="" loading={i ? 'lazy' : 'eager'} /> : null;
  // a banner that carries its own words (a picture with no title, text or button) shows whole, at its own shape
  if (x.image && !x.title && !x.text && !x.button) {
    return <a className="sfs-slide is-pic" href={x.href || '#'}><FileImg src={x.image} size="full" alt={x.alt || ''} loading={i ? 'lazy' : 'eager'} /></a>;
  }
  if (v === 'split') {
    return (
      <div className={'sfs-slide tone-' + (x.tone || 'primary')}>
        <div className="sfs-slide__text">
          <h2>{x.title}</h2>
          {x.text ? <p>{x.text}</p> : null}
          {x.button ? <a className="sf-btn sf-btn--fill" href={x.href || '#'}>{x.button}</a> : null}
        </div>
        <div className="sfs-slide__pic">{img || <span className="sfs-ti__ph" aria-hidden="true" />}</div>
      </div>
    );
  }
  return (
    <div className={'sfs-slide tone-' + (x.tone || 'primary') + (x.image ? ' has-img' : '')}>
      {img}
      <div className="sfs-slide__text">
        <h2>{x.title}</h2>
        {x.text ? <p>{x.text}</p> : null}
        {x.button ? <a className="sf-btn sf-btn--fill" href={x.href || '#'}>{x.button}</a> : null}
      </div>
    </div>
  );
}

function Hero({ s }) {
  const v = variantOf(s);
  const ref = useRef(null);
  const [at, setAt] = useState(0);
  const slides = (s.slides || []).filter((x) => x.title || x.image);
  const n = slides.length;
  const go = (dir, wrap) => {
    const el = ref.current;
    if (!el) return;
    const w = el.clientWidth || 1;
    const i = Math.round(el.scrollLeft / w);
    const next = wrap ? (i + dir + n) % n : Math.max(0, Math.min(n - 1, i + dir));
    el.scrollTo({ left: next * w, behavior: reduced() ? 'auto' : 'smooth' });
  };
  useEffect(() => {
    if (!s.autoplay || n < 2 || v === 'video' || reduced()) return undefined;
    const iv = setInterval(() => go(1, true), 5000);
    return () => clearInterval(iv);
  }, [s.autoplay, n, v]); // eslint-disable-line react-hooks/exhaustive-deps
  if (v === 'video') return <HeroVideo s={s} slide={slides[0]} />;
  if (!n) return null;
  const onScroll = () => { const el = ref.current; if (el) setAt(Math.round(el.scrollLeft / (el.clientWidth || 1))); };
  const slider = (
    <div className={'sfs-hero hv-' + v + ' is-' + (s.height || 'M') + (slides.some((x) => x.image && !x.title && !x.text && !x.button) ? ' has-pics' : '')}>
      <div className="sfs-slides" ref={ref} onScroll={onScroll}>
        {slides.map((x, i) => <Slide key={x.id || i} x={x} i={i} v={v} />)}
      </div>
      {n > 1 ? <>
        <button type="button" className="sfs-arrow is-prev" aria-label="Previous slide" onClick={() => go(-1)}><Icon name="chevron-left" width="20" height="20" aria-hidden="true" /></button>
        <button type="button" className="sfs-arrow is-next" aria-label="Next slide" onClick={() => go(1)}><Icon name="chevron-right" width="20" height="20" aria-hidden="true" /></button>
        <div className="sfs-dots" aria-hidden="true">{slides.map((x, i) => <i key={i} className={i === at ? 'is-on' : ''} />)}</div>
      </> : null}
    </div>
  );
  if (v !== 'banners' && v !== 'side1') return slider;
  const side = (s.side || []).filter((b) => b.title || b.image).slice(0, v === 'side1' ? 1 : 2);
  return (
    <div className={'sfs-hero-grid' + (v === 'side1' ? ' is-one' : '')}>
      {slider}
      <div className="sfs-hero-side">
        {side.map((b, i) => (
          <a key={b.id || i} className={'sfs-sideban' + (b.image ? ' has-img' : '')} href={b.href || '#'}>
            {b.image ? <FileImg src={b.image} alt="" loading="lazy" /> : null}
            <span><b>{b.title}</b>{b.text ? <small>{b.text}</small> : null}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function CatTiles({ s }) {
  const v = variantOf(s);
  const list = topCategories().slice(0, Math.max(2, Math.min(12, Number(s.count) || 6)));
  if (!list.length) return null;
  const pic = (c, size) => (c.img ? <FileImg src={c.img} size={size} alt="" loading="lazy" /> : <span className="sfs-pic-l">{c.name.slice(0, 1)}</span>);
  if (v === 'cards') {
    return <div className="sfs-ccards">{list.map((c) => <a key={c.id} href={c.href} className="sfs-ccard"><span className="sfs-ccard__img" aria-hidden="true">{pic(c, 'md')}</span><span className="sfs-ccard__txt"><b>{c.name}</b><small>{c.count} item{c.count === 1 ? '' : 's'}</small></span></a>)}</div>;
  }
  if (v === 'list') {
    return <div className="sfs-clist">{list.map((c) => <a key={c.id} href={c.href}><b>{c.name}</b><small>{c.count}</small><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></a>)}</div>;
  }
  if (v === 'icongrid' || v === 'topline') {
    const tones = ['#2563eb', '#16a34a', '#0b0b0f', '#9333ea', '#ea580c', '#0891b2', '#db2777', '#ca8a04'];
    return (
      <div className={'sfs-cgrid is-' + v}>
        {list.map((c, i) => <a key={c.id} href={c.href} style={v === 'topline' ? { '--tl': tones[i % tones.length] } : undefined}><span className="sfs-cgrid__img" aria-hidden="true">{pic(c, 'md')}</span><b>{c.name}</b>{v === 'topline' ? <small>{c.desc || `${c.count} item${c.count === 1 ? '' : 's'}`}</small> : null}</a>)}
      </div>
    );
  }
  if (v === 'poster') {
    return <div className="sfs-posters">{list.map((c) => <a key={c.id} href={c.href} className="sfs-poster"><span className="sfs-poster__img" aria-hidden="true">{pic(c, 'md')}</span><b>{c.name}</b></a>)}</div>;
  }
  if (v === 'ring' || v === 'spotlight') {
    return <div className={'sfs-rings is-' + v}>{list.slice(0, v === 'spotlight' ? 3 : 12).map((c) => <a key={c.id} href={c.href}><span className="sfs-ring" aria-hidden="true">{pic(c, 'md')}</span><b>{c.name}</b></a>)}</div>;
  }
  return (
    <div className={'sfs-cats is-' + v}>
      {list.map((c) => (
        <a key={c.id} href={c.href} className="sfs-cat">
          <span className="sfs-cat__ico" aria-hidden="true">{v === 'tiles' ? c.name.slice(0, 1) : pic(c, 'md')}</span>
          <span><b>{c.name}</b><small>{c.count} item{c.count === 1 ? '' : 's'}</small></span>
        </a>
      ))}
    </div>
  );
}

function Faq({ s }) {
  const v = variantOf(s);
  const items = (s.items || []).filter((x) => x.q);
  const topics = [...new Set(items.map((x) => x.topic || 'General'))];
  const [topic, setTopic] = useState('');
  if (!items.length) return null;
  const qa = (list) => list.map((x, i) => <details key={i}><summary>{x.q}<Icon name="chevron-down" width="16" height="16" aria-hidden="true" /></summary><p>{x.a}</p></details>);
  if (v === 'columns') return <div className="sfs-faq is-columns">{qa(items)}</div>;
  if (v === 'cards') return <div className="sfs-faq-cards">{items.map((x, i) => <div key={i}><Icon name="circle-help" width="20" height="20" aria-hidden="true" /><b>{x.q}</b><p>{x.a}</p></div>)}</div>;
  if (v === 'topics') {
    const cur = topics.includes(topic) ? topic : topics[0];
    return (
      <div className="sfs-faq-topics">
        {topics.length > 1 ? <div className="sfs-chips" role="tablist" aria-label="Topics">{topics.map((t) => <button key={t} type="button" role="tab" aria-selected={t === cur} className={t === cur ? 'is-on' : ''} onClick={() => setTopic(t)}>{t}</button>)}</div> : null}
        <div className="sfs-faq">{qa(items.filter((x) => (x.topic || 'General') === cur))}</div>
      </div>
    );
  }
  if (v === 'split') {
    return (
      <div className="sfs-faq-split">
        <div className="sfx-flexcol">
          {s.title ? <h2 className="sfs-title">{s.title}</h2> : null}
          {s.text ? <p>{s.text}</p> : null}
          {s.button ? <a className="sf-btn" href={s.href || '#'}>{s.button}</a> : null}
        </div>
        <div className="sfs-faq">{qa(items)}</div>
      </div>
    );
  }
  return <div className="sfs-faq sfx-narrow">{qa(items)}</div>;
}

function Countdown({ s, v }) {
  const [now, setNow] = useState(0);
  const [sale, setSale] = useState(null);
  useEffect(() => {
    setSale(liveFlashSale(s.offer));
    setNow(clockNow());
    const iv = setInterval(() => setNow(clockNow()), 1000);
    return () => clearInterval(iv);
  }, [s.offer]);
  if (!sale || !now) return null;
  const shop = storeProducts();
  const soon = now < sale.start;
  const left = Math.max(0, (soon ? sale.start : sale.end || now) - now);
  const t = Math.floor(left / 1000);
  const parts = [[Math.floor(t / 86400), 'days'], [Math.floor((t % 86400) / 3600), 'hours'], [Math.floor((t % 3600) / 60), 'min'], [t % 60, 'sec']];
  return (
    <div className={'sfs-flash is-' + variantOf(s)}>
      {variantOf(s) === 'panel' ? <span className="sfs-flash__glow" aria-hidden="true" /> : null}
      <div className="sfs-flash__head">
        <div><b>{sale.title}</b><span>{sale.big}</span></div>
        {sale.end || soon ? <div className="sfs-clock" aria-label={(soon ? 'Starts in ' : 'Ends in ') + parts.map((p) => p[0] + ' ' + p[1]).join(' ')}>
          <small>{soon ? 'Starts in' : 'Ends in'}</small>
          {parts.map(([n, l]) => <span key={l}><b>{pad(n)}</b><small>{l}</small></span>)}
        </div> : null}
        <a className="sf-btn sf-btn--fill" href={'/offer-detail?id=' + encodeURIComponent(sale.id)}>Shop the sale<Icon name="arrow-right" width="16" height="16" aria-hidden="true" /></a>
      </div>
      {(sale.items || []).length ? (
        <div className="sfs-flash__items">
          {sale.items.map((it, i) => {
            // the sale line's product on the website (its photo and page), matched by name
            const p = shop.find((x) => x.name === it.name) || shop.find((x) => it.name && x.name && (it.name.indexOf(x.name) === 0 || x.name.indexOf(it.name) === 0));
            const Tag = p ? 'a' : 'div';
            return (
              <Tag key={i} className="sfs-flash__item" {...(p ? { href: p.href } : {})}>
                <span className="sfs-flash__pic" style={p && p.img ? undefined : { background: it.bg }} aria-hidden="true">{p && p.img ? <img src={p.img} alt="" loading="lazy" /> : it.name.slice(0, 1)}</span>
                <div><b>{it.name}</b><span className="sfs-flash__price"><b>{it.price}</b> <s>{it.mrp}</s> {it.off ? <em>{it.off}</em> : null}</span></div>
              </Tag>
            );
          })}
        </div>
      ) : <ProductList list={productsBy({ source: 'sale', count: 4 })} v={v} />}
    </div>
  );
}

function Video({ s }) {
  const [on, setOn] = useState(false);
  const m = String(s.url || '').match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  if (!m) return null;
  const id = m[1];
  return (
    <div className={'sfs-video is-' + variantOf(s)}>
      {on ? <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`} title={s.title || 'Video'} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
        : <button type="button" onClick={() => setOn(true)} aria-label={'Play ' + (s.title || 'the video')}><img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" /><span><Icon name="play" width="28" height="28" aria-hidden="true" /></span></button>}
    </div>
  );
}

function Newsletter({ s }) {
  const [val, setVal] = useState('');
  const submit = (e) => {
    e.preventDefault();
    const x = val.trim();
    if (!/^(\+?88)?01\d{9}$/.test(x.replace(/[\s-]/g, '')) && !/^\S+@\S+\.\S+$/.test(x)) { toast('Enter a mobile number or an email address.', { tone: 'error' }); return; }
    // kept in this browser; the live store adds it to Customers with marketing consent (needs the server)
    try { const k = 'gc.store.signups'; const list = JSON.parse(window.localStorage.getItem(k) || '[]'); list.push({ to: x, at: Date.now() }); window.localStorage.setItem(k, JSON.stringify(list)); } catch { /* ignore */ }
    setVal('');
    toast('You’re on the list.');
  };
  return (
    <form className={'sfs-news is-' + variantOf(s)} onSubmit={submit}>
      <div><h2>{s.title}</h2>{s.text ? <p>{s.text}</p> : null}</div>
      <label htmlFor={'nl-' + s.id} className="sr-only">Mobile number or email</label>
      <input id={'nl-' + s.id} className="sf-input" value={val} onChange={(e) => setVal(e.target.value)} placeholder="01XXXXXXXXX or email" />
      <button type="submit" className="sf-btn sf-btn--fill">{s.button || 'Sign up'}</button>
    </form>
  );
}


/** A custom section: the shop's HTML (filled, allow-listed) and CSS (scoped to it). */
export function CustomBody({ def, values }) {
  if (!def) return null;
  const r = renderCustom(def, values || {});
  if (!r.html.trim()) return null;
  return <div className={'sfc ' + r.scope}>{r.css ? <style>{r.css}</style> : null}<div dangerouslySetInnerHTML={{ __html: r.html }} /></div>;
}


const TRUST = [['truck', 'Delivery all over Bangladesh', '1–2 days in Dhaka'], ['banknote', 'Cash on delivery', 'Pay when it arrives'], ['shield-check', 'Official warranty', 'On every phone'], ['rotate-ccw', '7-day return', 'If something is wrong']];

/** One section's content (exported for the layout editor's thumbnails and checks). */
export function sectionBody(s, v, catalog, ctx = {}) {
  const more = moreBody(s, v);
  if (more !== undefined) return more;
  const more3 = moreBody3(s, v);
  if (more3 !== undefined) return more3;
  switch (s.type) {
    case 'custom': return <CustomBody def={getCustom(s.custom)} values={s.values} />;
    case 'hero': return <Hero s={s} />;
    case 'cattiles': return <CatTiles s={s} />;
    case 'products': {
      const list = productsBy({ source: s.source, cat: s.cat, picked: s.picked, count: s.count, relatedTo: ctx.product || null });
      return <ProductList list={list} v={v} layout={s.layout} card={s.card} />;
    }
    case 'offer': return (
      <div className={'sfs-offer is-' + variantOf(s) + (s.image ? ' has-img' : '')}>
        <div><h2>{s.title}</h2>{s.text ? <p>{s.text}</p> : null}{s.button ? <a className="sf-btn sf-btn--fill" href={s.href || '#'}>{s.button}</a> : null}</div>
        {s.image ? <FileImg src={s.image} alt="" loading="lazy" /> : null}
      </div>
    );
    case 'countdown': return <Countdown s={s} v={v} />;
    case 'brands': { const list = storeBrands().slice(0, Number(s.count) || 8); return list.length ? <div className="sfs-brands">{list.map((b) => <a key={b.id || b.name} href={'/search?q=' + encodeURIComponent(b.name)}>{b.image ? <img src={b.image} alt={b.name} loading="lazy" /> : <b>{b.name}</b>}</a>)}</div> : null; }
    case 'reviews': { const list = storeReviews(Number(s.count) || 3); return list.length ? <div className="sfs-reviews">{list.map((r) => <figure key={r.id}><Stars rating={{ avg: r.stars, count: 1 }} small /><blockquote>{r.text}</blockquote><figcaption><b>{r.name}</b>{r.verified ? ' · Verified buyer' : ''}<small>{r.product}</small></figcaption></figure>)}</div> : null; }
    case 'blog': { const list = storePosts(Number(s.count) || 3); return list.length ? <div className={'sfs-posts is-' + variantOf(s)}>{list.map((p) => <a key={p.id} href={'/blog-post?slug=' + encodeURIComponent(p.slug)}><span className="sfs-post__img">{p.cover && p.cover.src ? <img src={p.cover.src} alt="" loading="lazy" /> : <Icon name={(p.cover && p.cover.icon) || 'newspaper'} width="28" height="28" aria-hidden="true" />}</span><b>{p.title}</b>{p.excerpt ? <small>{p.excerpt}</small> : null}</a>)}</div> : null; }
    case 'video': return <Video s={s} />;
    case 'textimage': return (
      <div className={'sfs-ti is-' + (s.side || 'right') + ' look-' + variantOf(s)}>
        <div><h2>{s.title}</h2>{s.text ? <p>{s.text}</p> : null}{s.button ? <a className="sf-btn" href={s.href || '#'}>{s.button}</a> : null}</div>
        {s.image ? <FileImg src={s.image} alt="" loading="lazy" /> : <span className="sfs-ti__ph" aria-hidden="true" />}
      </div>
    );
    case 'faq': return <Faq s={s} />;
    case 'newsletter': return <Newsletter s={s} />;
    case 'html': return <div className={'sfs-html is-' + variantOf(s)}><BlockContent id={s.block} catalog={catalog} /></div>;
    case 'trust': return <div className="sfs-trust">{TRUST.map(([i, a, b]) => <div key={a}><Icon name={i} width="22" height="22" aria-hidden="true" /><span><b>{a}</b><small>{b}</small></span></div>)}</div>;
    case 'recent': {
      const all = storeProducts();
      const ids = recentlyViewed().filter((id) => !ctx.product || id !== ctx.product.id);
      const list = ids.map((id) => all.find((p) => p.id === id)).filter(Boolean).slice(0, Number(s.count) || 6);
      const look = variantOf(s);
      return list.length ? <ProductList list={list} v={v} layout={look === 'grid' ? 'grid' : look === 'compact' ? 'two' : 'carousel'} card={look === 'compact' ? 'horizontal' : undefined} /> : null;
    }
    default: return null;
  }
}
const TITLED = new Set(['cattiles', 'products', 'countdown', 'brands', 'reviews', 'blog', 'video', 'faq', 'trust', 'recent', 'producttabs', 'bento', 'deal', 'bannergrid', 'coupons', 'quicklinks', 'steps', 'reels', 'outlet', 'seotext', ...TITLED3]);
// looks that place the section's title themselves
const OWN_TITLE = new Set(['faq:split', ...OWN_HEAD3]);

/** One store section with its Style tab (box), as customer pages and preview frames draw it. */
export function Section({ s, v, catalog, ctx }) {
  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  const box = s.box || {};
  const bgUrl = useFileSrc(box.bgImage || '', 'full');
  useEffect(() => { setReady(true); }, []);
  const editing = ready && isEditing();
  const selected = editing && previewValue('select') === s.id;
  useEffect(() => {
    if (!ready || !box.anim || editing) return undefined;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return undefined; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setInView(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, [ready, box.anim, editing]);
  useEffect(() => { if (selected && ref.current) ref.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [selected, ready]);
  if (!ready) return null;
  const t = sectionType(s.type);
  const label = (t && t.label) || 'Section';
  const b = sectionBody(s, v, catalog, ctx);
  if (!b && !editing) return null;
  const bp = boxProps(box, { bgUrl, editing });
  const own = OWN_TITLE.has(s.type + ':' + variantOf(s)) || OWN_HEAD.has(s.type + ':' + variantOf(s));
  const edit = editing ? { 'data-sfx-label': label, onClickCapture: (e) => { e.preventDefault(); e.stopPropagation(); selectInEditor(s.id); } } : {};
  return (
    <section ref={ref} id={bp.id} className={'sfs sfs--' + s.type + ' tone-' + (s.tone || 'none') + ' ' + bp.className + (inView ? ' is-in' : '') + (selected ? ' is-selected' : '')} style={bp.style} aria-label={s.title || label} data-sec={s.id} data-sec-id={editing ? s.id : undefined} data-sec-label={editing ? label : undefined} {...edit}>
      {box.divTop ? <span className={'sfx-div is-t is-' + box.divTop} aria-hidden="true" /> : null}
      {box.divBottom ? <span className={'sfx-div is-b is-' + box.divBottom} aria-hidden="true" /> : null}
      <div className="sf-wrap">
        <div className={TITLED.has(s.type) && !OWN_HEAD.has(s.type + ':' + variantOf(s)) ? 'sfs-panel' : undefined}>
          {s.title && TITLED.has(s.type) && !own ? (
            <div className="sfs-head">
              <span className="sfs-head__t"><h2 className="sfs-title">{s.title}</h2>{s.sub ? <p className="sfs-sub">{s.sub}</p> : null}</span>
              {moreOf(s) ? <a className="sfs-more" href={moreOf(s)}>{s.moreLabel || w('viewAll')}<Icon name="arrow-right" width="14" height="14" aria-hidden="true" /></a> : null}
            </div>
          ) : null}
          {b || <p className="sfx-empty">{label}: nothing to show yet. Add content in the panel.</p>}
        </div>
      </div>
    </section>
  );
}

/** The layout a page draws (after mount; again when the look changes or an editor sends its copy). key: what ctx is. */
export function useLayout(kind, ctx, key = '') {
  const [lay, setLay] = useState(null);
  const ref = useRef(ctx);
  ref.current = ctx;
  useEffect(() => {
    const load = () => setLay(layoutFor(kind, ref.current || {}));
    load();
    window.addEventListener(SF_EVENT, load);
    return () => window.removeEventListener(SF_EVENT, load);
  }, [kind, key]);
  return lay;
}

/** A layout's sections in order; `main` is the page's own content. */
export function Sections({ sections, main, values, catalog, ctx = {} }) {
  const v = values || themeValues();
  const list = (sections || []).filter((s) => !s.hidden);
  const editing = isEditing();
  const fonts = sectionFonts(list).map((id) => fontPair(id)).filter((f) => f.q && f.id !== v.fontPair);
  return (<>
    {fonts.map((f) => <link key={f.id} rel="stylesheet" href={'https://fonts.googleapis.com/css2?' + f.q + '&display=swap'} />)}
    {list.map((s) => {
      if (s.type !== 'main') return <Section key={s.id} s={s} v={v} catalog={catalog} ctx={ctx} />;
      if (!editing) return <React.Fragment key={s.id}>{main}</React.Fragment>;
      const sel = previewValue('select') === s.id;
      return <div key={s.id} className={'sfx-main-edit' + (sel ? ' is-selected' : '')} data-sfx-label="Main content" onClickCapture={(e) => { e.preventDefault(); e.stopPropagation(); selectInEditor(s.id); }}>{main}</div>;
    })}
  </>);
}
export { catByPath, catChildren };

export const SECTIONS_CSS = `
.sfs{padding:calc(var(--sf-section) / 2) 0}
.sfs:first-child{padding-top:var(--sf-gap)}
.sfs-title{margin:0 0 16px!important;font-size:var(--sf-fs-h2)}
.sfs.tone-soft{background:var(--sf-soft)}
.sfs.tone-primary{background:var(--sf-primary);color:var(--sf-on-primary)}
.sfs.tone-dark{background:#0f172a;color:#e2e8f0}
.sfs.tone-primary .sf-card,.sfs.tone-dark .sf-card{color:var(--sf-text)}
/* hero */
.sfs-hero{position:relative}
.sfs-slides{display:grid;grid-auto-flow:column;grid-auto-columns:100%;overflow-x:auto;scroll-snap-type:x mandatory;border-radius:var(--sf-radius-card);scrollbar-width:none}
.sfs-slides::-webkit-scrollbar{display:none}
.sfs-slide{position:relative;display:flex;align-items:center;min-height:380px;scroll-snap-align:start;overflow:hidden;background:var(--sf-primary);color:var(--sf-on-primary)}
.is-S .sfs-slide{min-height:260px}.is-L .sfs-slide{min-height:500px}
.sfs-slide.tone-dark{background:#0f172a;color:#fff}
.sfs-slide.tone-soft{background:var(--sf-soft);color:var(--sf-text)}
.sfs-slide>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.sfs-slide.is-pic{display:block;min-height:0!important;aspect-ratio:var(--sf-banner-ratio,15/8);background:var(--sf-soft)}
/* a slider with picture banners: every slide takes the banner's shape, so the slider never shows a gap under one */
.sfs-hero.has-pics .sfs-slide{min-height:0!important;aspect-ratio:var(--sf-banner-ratio,15/8)}
@media (max-width:640px){.sfs-hero.has-pics .sfs-slide__text{gap:8px;padding:16px 20px}.sfs-hero.has-pics .sfs-slide__text h2{font-size:var(--sf-fs-h3)}.sfs-hero.has-pics .sfs-slide__text p{display:none}.sfs-hero.has-pics .sfs-slide__text .sf-btn{min-height:36px;padding:0 14px}}
.sfs-slide.is-pic>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.sfs-slide.has-img::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.62),rgba(0,0,0,.08) 70%)}
.sfs-slide.has-img{color:#fff}
.sfs-slide__text{position:relative;z-index:1;display:flex;flex-direction:column;align-items:flex-start;gap:14px;max-width:620px;padding:40px 72px}
.sfs-slide>img{object-position:center 22%}
.sfs-slide__text h2{max-width:15ch;font-size:var(--sf-fs-h1);line-height:1.04}
.sfs-slide__text p{max-width:42ch;margin:0;font-size:var(--sf-fs-lg);line-height:1.5;opacity:.92}
.sfs-slide .sf-btn--fill{background:var(--sf-surface);color:var(--sf-text);border-color:var(--sf-surface)}
.sfs-arrow{position:absolute;top:50%;z-index:2;display:grid;place-items:center;width:40px;height:40px;margin-top:-20px;border:0;border-radius:var(--radius-full);background:rgba(255,255,255,.9);color:#0f172a;cursor:pointer}
.sfs-arrow.is-prev{left:12px}.sfs-arrow.is-next{right:12px}
/* category tiles */
.sfs-cats{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:var(--sf-gap)}
.sfs-cat{display:flex;align-items:center;gap:12px;padding:14px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface);color:var(--sf-text);text-decoration:none}
.sfs-cat:hover{border-color:var(--sf-primary)}
.sfs-cat__ico{display:grid;place-items:center;flex:none;width:44px;height:44px;border-radius:var(--sf-radius);background:var(--sf-soft);color:var(--sf-primary);font-weight:var(--weight-semibold);font-size:var(--sf-fs-lg)}
.sfs-cat b{display:block;font-weight:var(--weight-medium)}
.sfs-cat small{color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.sfs-cats.is-circles{grid-template-columns:repeat(auto-fill,minmax(110px,1fr))}
.is-circles .sfs-cat{flex-direction:column;text-align:center;border:0;background:none}
.is-circles .sfs-cat__ico{width:88px;height:88px;border-radius:50%;font-size:var(--sf-fs-h2)}
/* offer, text + picture */
.sfs-offer,.sfs-ti{display:grid;grid-template-columns:minmax(0,1fr);align-items:center;gap:24px;padding:32px;border-radius:var(--sf-radius-card);background:var(--sf-soft);color:var(--sf-text);overflow:hidden}
.sfs-offer.has-img{grid-template-columns:minmax(0,1.2fr) minmax(0,1fr)}
.sfs-offer h2,.sfs-ti h2{font-size:var(--sf-fs-h2);margin-bottom:8px!important}
.sfs-offer p,.sfs-ti p{margin:0 0 16px;color:var(--sf-muted)}
.sfs-offer img,.sfs-ti img{width:100%;height:100%;max-height:300px;object-fit:cover;border-radius:var(--sf-radius)}
.sfs-ti{grid-template-columns:minmax(0,1fr) minmax(0,1fr);background:var(--sf-surface);border:1px solid var(--sf-line)}
.sfs-ti.is-left>img,.sfs-ti.is-left>.sfs-ti__ph{order:-1}
.sfs-ti__ph{display:block;min-height:220px;border-radius:var(--sf-radius);background:var(--sf-soft)}
/* countdown */
.sfs-flash{display:flex;flex-direction:column;gap:16px;padding:20px;border-radius:var(--sf-radius-card);background:var(--sf-surface);border:2px solid var(--sf-sale)}
/* flash sale · panel (the default look): a deep panel with a glow in the sale colour */
.sfs-flash.is-panel{position:relative;isolation:isolate;gap:22px;padding:clamp(20px,3vw,32px);border:0;border-radius:var(--sf-radius-card);background:#0b0f1a;color:#f8fafc;overflow:hidden;box-shadow:0 28px 56px -34px rgba(11,15,26,.75)}
.sfs-flash__glow{position:absolute;z-index:-1;top:-40%;left:-10%;width:70%;height:180%;background:radial-gradient(closest-side,color-mix(in srgb,var(--sf-sale) 55%,transparent),transparent);opacity:.55;pointer-events:none}
.sfs-flash.is-panel .sfs-flash__head{gap:16px 28px}
.sfs-flash.is-panel .sfs-flash__head>div:first-child b{display:block;font-family:var(--sf-font-head);font-size:var(--sf-fs-h2);font-weight:var(--sf-head-w,600);letter-spacing:var(--sf-head-track,0);line-height:1.1;color:#fff}
.sfs-flash.is-panel .sfs-flash__head>div:first-child>span{display:inline-block;margin-top:8px;color:color-mix(in srgb,var(--sf-sale) 55%,#fff);font-size:var(--sf-fs-lg);font-weight:var(--weight-semibold)}
.sfs-flash.is-panel .sfs-clock{gap:8px}
.sfs-flash.is-panel .sfs-clock>small{color:rgba(255,255,255,.62)}
.sfs-flash.is-panel .sfs-clock span{min-width:62px;padding:10px 8px 8px;border:1px solid rgba(255,255,255,.12);border-radius:var(--sf-radius);background:rgba(255,255,255,.05);color:#fff}
.sfs-flash.is-panel .sfs-clock span b{font-family:var(--sf-font-head);font-size:var(--sf-fs-h3);line-height:1}
.sfs-flash.is-panel .sfs-clock span small{margin-top:4px;color:rgba(255,255,255,.6);font-size:var(--sf-fs-sm);opacity:1}
.sfs-flash.is-panel .sf-btn--fill{gap:8px;border-color:#fff;border-radius:var(--radius-full);background:#fff;color:#0b0f1a}
.sfs-flash.is-panel .sf-btn--fill svg{transition:transform .2s cubic-bezier(.2,.8,.2,1)}
.sfs-flash.is-panel .sf-btn--fill:hover svg{transform:translateX(3px)}
.sfs-flash.is-panel .sfs-flash__items{grid-template-columns:repeat(auto-fill,minmax(min(100%,250px),1fr));gap:12px}
.sfs-flash.is-panel .sfs-flash__item{gap:14px;padding:12px;border:1px solid rgba(255,255,255,.08);border-radius:var(--sf-radius-card);background:rgba(255,255,255,.04);color:inherit;text-decoration:none;transition:background-color .2s ease,border-color .2s ease,transform .25s cubic-bezier(.2,.8,.2,1)}
.sfs-flash.is-panel a.sfs-flash__item:hover{border-color:rgba(255,255,255,.18);background:rgba(255,255,255,.07);transform:translateY(-2px)}
.sfs-flash__pic{display:grid;place-items:center;flex:none;width:64px;height:64px;border-radius:var(--sf-radius);overflow:hidden;font-weight:var(--weight-semibold)}
.sfs-flash.is-panel .sfs-flash__pic{width:72px;height:72px;background:#fff;color:#0b0f1a}
.sfs-flash__pic img{width:100%;height:100%;object-fit:contain}
.sfs-flash.is-panel .sfs-flash__pic:not(:has(img)){background:linear-gradient(145deg,color-mix(in srgb,var(--sf-sale) 70%,#fff),color-mix(in srgb,var(--sf-sale) 85%,#000))!important;color:#fff;font-family:var(--sf-font-head);font-size:var(--sf-fs-h3)}
.sfs-flash.is-panel .sfs-flash__item b{color:#fff}
.sfs-flash.is-panel .sfs-flash__item>div>b{display:-webkit-box;overflow:hidden;font-weight:var(--weight-medium);color:rgba(255,255,255,.92);-webkit-line-clamp:2;-webkit-box-orient:vertical}
.sfs-flash__price{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;margin-top:4px}
.sfs-flash.is-panel .sfs-flash__price>b{font-size:var(--sf-fs-lg);font-variant-numeric:tabular-nums}
.sfs-flash.is-panel .sfs-flash__item s{color:rgba(255,255,255,.5)}
.sfs-flash.is-panel .sfs-flash__item em{padding:1px 8px;border-radius:var(--radius-full);background:var(--sf-sale);color:var(--sf-on-sale);font-size:var(--sf-fs-sm);font-weight:var(--weight-semibold)}
@media (prefers-reduced-motion:reduce){.sfs-flash.is-panel .sfs-flash__item,.sfs-flash.is-panel .sf-btn--fill svg{transition:none}}
@media (max-width:640px){.sfs-flash.is-panel .sfs-clock span{min-width:54px}.sfs-flash.is-panel .sf-btn--fill{width:100%}}

.sfs-flash__head{display:flex;flex-wrap:wrap;align-items:center;gap:12px 24px}
.sfs-flash__head>div:first-child{flex:1 1 220px}
.sfs-flash__head>div:first-child b{display:block;font-family:var(--sf-font-head);font-size:var(--sf-fs-h3);color:var(--sf-sale)}
.sfs-clock{display:flex;align-items:center;gap:6px}
.sfs-clock>small{color:var(--sf-muted);margin-right:4px}
.sfs-clock span{display:flex;flex-direction:column;align-items:center;min-width:46px;padding:4px 6px;border-radius:var(--sf-radius);background:var(--sf-sale);color:var(--sf-on-sale)}
.sfs-clock span b{font-size:var(--sf-fs-lg);font-variant-numeric:tabular-nums}
.sfs-clock span small{font-size:var(--sf-fs-sm);opacity:.85}
.sfs-flash__items{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
.sfs-flash__item{display:flex;gap:10px;align-items:center}
.sfs-flash__item>span.sfs-flash__pic{width:56px;height:56px}
.sfs-flash__item b{display:block;font-weight:var(--weight-medium)}
.sfs-flash__item s{color:var(--sf-muted)}.sfs-flash__item em{font-style:normal;color:var(--sf-sale)}
/* brands, reviews, posts */
.sfs-brands{display:flex;flex-wrap:wrap;gap:10px}
.sfs-brands a{display:inline-flex;align-items:center;justify-content:center;min-width:120px;height:56px;padding:0 16px;border:1px solid var(--sf-line);border-radius:var(--sf-radius);background:var(--sf-surface);color:var(--sf-text);text-decoration:none}
.sfs-brands img{max-height:48px;max-width:130px;object-fit:contain}
.sfs-reviews{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:var(--sf-gap)}
.sfs-reviews figure{margin:0;display:flex;flex-direction:column;gap:8px;padding:18px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface);color:var(--sf-text)}
.sfs-reviews blockquote{margin:0;line-height:1.6}
.sfs-reviews figcaption{font-size:var(--sf-fs-sm);color:var(--sf-muted)}
.sfs-reviews figcaption b{color:var(--sf-text);font-weight:var(--weight-medium)}
.sfs-reviews figcaption small{display:block}
.sfs-posts{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:var(--sf-gap)}
.sfs-posts a{display:flex;flex-direction:column;gap:8px;color:var(--sf-text);text-decoration:none}
.sfs-post__img{display:grid;place-items:center;aspect-ratio:16/9;border-radius:var(--sf-radius-card);background:var(--sf-soft);color:var(--sf-primary);overflow:hidden}
.sfs-post__img img{width:100%;height:100%;object-fit:cover}
.sfs-posts small{color:var(--sf-muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
/* video, faq, newsletter, trust */
.sfs-video{position:relative;aspect-ratio:16/9;max-width:900px;border-radius:var(--sf-radius-card);overflow:hidden;background:#000}
.sfs-video iframe,.sfs-video button{position:absolute;inset:0;width:100%;height:100%;border:0;padding:0;background:none;cursor:pointer}
.sfs-video img{width:100%;height:100%;object-fit:cover}
.sfs-video button span{position:absolute;left:50%;top:50%;display:grid;place-items:center;width:68px;height:68px;margin:-34px 0 0 -34px;border-radius:50%;background:rgba(220,38,38,.92);color:#fff}
.sfs-faq{display:flex;flex-direction:column;gap:8px;max-width:820px}
.sfs-faq details{padding:12px 16px;border:1px solid var(--sf-line);border-radius:var(--sf-radius);background:var(--sf-surface);color:var(--sf-text)}
.sfs-faq summary{cursor:pointer;font-weight:var(--weight-medium)}
.sfs-faq p{margin:8px 0 0;color:var(--sf-muted)}
.sfs-news{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr) auto;gap:12px;align-items:center;padding:28px;border-radius:var(--sf-radius-card);background:var(--sf-primary);color:var(--sf-on-primary)}
.sfs-news h2{font-size:var(--sf-fs-h3)}
.sfs-news p{margin:4px 0 0;opacity:.9}
.sfs-news .sf-btn--fill{background:var(--sf-surface);color:var(--sf-text);border-color:var(--sf-surface)}
.sfs-trust{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--sf-gap)}
.sfs-trust>div{display:flex;gap:12px;align-items:center;padding:14px;border-radius:var(--sf-radius-card);background:var(--sf-surface);border:1px solid var(--sf-line);color:var(--sf-text)}
.sfs-trust svg{flex:none;color:var(--sf-primary)}
.sfs-trust b{display:block;font-weight:var(--weight-medium)}
.sfs-trust small{color:var(--sf-muted);font-size:var(--sf-fs-sm)}
/* hero looks */
.sfs-dots{position:absolute;left:0;right:0;bottom:12px;z-index:2;display:flex;justify-content:center;gap:6px;pointer-events:none}
.sfs-dots i{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.55);box-shadow:0 0 0 1px rgba(0,0,0,.15)}
.sfs-dots i.is-on{width:22px;border-radius:var(--radius-full);background:#fff}
.hv-boxed{max-width:min(100%,1040px);margin:0 auto}
.hv-boxed .sfs-slide{justify-content:center;text-align:center}
.hv-boxed .sfs-slide__text{align-items:center;margin:0 auto}
.hv-boxed .sfs-slide.has-img::after{background:rgba(0,0,0,.42)}
.hv-split .sfs-slide{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:center}
.hv-split .sfs-slide__pic{position:relative;align-self:stretch;min-height:inherit}
.hv-split .sfs-slide__pic img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hv-split .sfs-slide__pic .sfs-ti__ph{height:100%;border-radius:0}
.sfs-hero-grid{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:var(--sf-gap)}
.sfs-hero-grid .sfs-slide{min-height:420px}
.sfs-hero-side{display:grid;grid-template-rows:1fr 1fr;gap:var(--sf-gap)}
.sfs-sideban{position:relative;display:flex;align-items:flex-end;min-height:180px;padding:18px;border-radius:var(--sf-radius-card);background:var(--sf-soft);color:var(--sf-text);text-decoration:none;overflow:hidden}
.sfs-sideban>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.sfs-sideban.has-img{color:#fff}
.sfs-sideban.has-img::after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(0,0,0,.6),rgba(0,0,0,0) 65%)}
.sfs-sideban span{position:relative;z-index:1;display:flex;flex-direction:column;gap:2px}
.sfs-sideban b{font-family:var(--sf-font-head);font-size:var(--sf-fs-h3);font-weight:var(--weight-semibold)}
.sfs-sideban small{opacity:.9}
.hv-video .sfs-slide{min-height:460px}
.hv-video.is-S .sfs-slide{min-height:320px}.hv-video.is-L .sfs-slide{min-height:600px}
.hv-video .sfs-slide{border-radius:var(--sf-radius-card);justify-content:center;text-align:center}
.hv-video .sfs-slide__text{align-items:center;margin:0 auto}
.hv-video .sfs-slide::after{background:rgba(0,0,0,.45)!important}
.sfs-bgvid{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border:0;pointer-events:none}
iframe.sfs-bgvid{width:177.78vh;min-width:100%;height:56.25vw;min-height:100%;left:50%;top:50%;transform:translate(-50%,-50%);inset:auto}
/* category looks */
.sfs-cats.is-circles .sfs-cat__ico,.sfs-cats.is-carousel .sfs-cat__ico{overflow:hidden}
.sfs-cat__ico img{width:100%;height:100%;object-fit:cover}
.sfs-cats.is-carousel{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(120px,1fr);grid-template-columns:none;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding-bottom:4px}
.sfs-cats.is-carousel::-webkit-scrollbar{display:none}
.is-carousel .sfs-cat{flex-direction:column;text-align:center;scroll-snap-align:start;border:0;background:none}
.is-carousel .sfs-cat__ico{width:100%;height:auto;aspect-ratio:1/1;border-radius:var(--sf-radius-card);font-size:var(--sf-fs-h2)}
.sfs-ccards{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:var(--sf-gap)}
.sfs-ccard{position:relative;display:flex;align-items:flex-end;aspect-ratio:4/5;border-radius:var(--sf-radius-card);background:var(--sf-soft);color:#fff;text-decoration:none;overflow:hidden}
.sfs-ccard__img{position:absolute;inset:0;display:grid;place-items:center;color:var(--sf-primary);font-family:var(--sf-font-head);font-size:64px;font-weight:var(--weight-semibold)}
.sfs-ccard__img img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
.sfs-ccard:hover .sfs-ccard__img img{transform:scale(1.05)}
.sfs-ccard::after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(0,0,0,.62),rgba(0,0,0,0) 55%)}
.sfs-ccard__txt{position:relative;z-index:1;display:flex;flex-direction:column;padding:16px}
.sfs-ccard__txt b{font-family:var(--sf-font-head);font-size:var(--sf-fs-h3);font-weight:var(--weight-semibold)}
.sfs-ccard__txt small{opacity:.88}
.sfs-clist{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 var(--sf-gap)}
.sfs-clist a{display:flex;align-items:center;gap:10px;min-height:52px;padding:0 4px;border-bottom:1px solid var(--sf-line);color:var(--sf-text);text-decoration:none}
.sfs-clist b{flex:1;font-weight:var(--weight-medium)}
.sfs-clist small{color:var(--sf-muted);font-variant-numeric:tabular-nums}
.sfs-clist a:hover b{color:var(--sf-primary)}
/* faq looks */
.sfs-faq summary{display:flex;align-items:center;justify-content:space-between;gap:12px;list-style:none}
.sfs-faq summary::-webkit-details-marker{display:none}
.sfs-faq summary svg{flex:none;color:var(--sf-muted);transition:transform .2s ease}
.sfs-faq details[open] summary svg{transform:rotate(180deg)}
.sfs-faq.is-columns{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px var(--sf-gap);max-width:none;align-items:start}
.sfs-faq-topics .sfs-faq{max-width:820px}
.sfs-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
.sfs-chips button{min-height:36px;padding:0 16px;border:1.5px solid var(--sf-line);border-radius:var(--radius-full);background:var(--sf-surface);color:var(--sf-text);font:inherit;cursor:pointer}
.sfs-chips button.is-on{border-color:var(--sf-primary);background:var(--sf-primary);color:var(--sf-on-primary)}
.sfx-al-center .sfs-chips{justify-content:center}
.sfs-faq-split{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.6fr);gap:calc(var(--sf-gap) * 2);align-items:start}
.sfs-faq-split>div:first-child{display:flex;flex-direction:column;align-items:flex-start;gap:12px}
.sfs-faq-split p{margin:0;color:var(--sf-muted)}
.sfs-faq-split .sfs-faq{max-width:none}
/* hero with one side banner, category looks (theme pack) */
.sfs-hero-grid.is-one .sfs-hero-side{grid-template-rows:1fr}
.sfs-cgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px}
.sfs-cgrid a{display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px 10px;border-radius:var(--sf-radius-card);background:var(--sf-surface);color:var(--sf-text);text-align:center;text-decoration:none;box-shadow:0 1px 3px rgba(15,23,42,.06)}
.sfs-cgrid a:hover{box-shadow:0 4px 14px rgba(15,23,42,.1)}
.sfs-cgrid__img{display:grid;place-items:center;width:56px;height:56px;border-radius:var(--sf-radius);background:var(--sf-soft);color:var(--sf-primary);font-weight:var(--weight-semibold);font-size:var(--sf-fs-h3);overflow:hidden}
.sfs-cgrid__img img{width:100%;height:100%;object-fit:cover}
.sfs-cgrid b{font-weight:var(--weight-medium);font-size:var(--sf-fs-sm)}
.sfs-cgrid.is-topline{grid-template-columns:repeat(auto-fill,minmax(160px,1fr))}
.sfs-cgrid.is-topline a{border-top:3px solid var(--tl);box-shadow:0 1px 3px rgba(15,23,42,.08)}
.sfs-cgrid.is-topline small{color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.sfs-posters{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:var(--sf-gap)}
.sfs-poster{position:relative;display:flex;justify-content:center;aspect-ratio:1/1;border-radius:var(--sf-radius-card);overflow:hidden;background:linear-gradient(165deg,var(--sf-primary),var(--sf-accent));color:#fff;text-decoration:none}
.sfs-poster__img{position:absolute;inset:0;display:grid;place-items:center;font-size:72px;font-weight:var(--weight-semibold);opacity:.95}
.sfs-poster__img img{width:100%;height:100%;object-fit:cover}
.sfs-poster b{position:relative;z-index:1;margin-top:14px;font-family:var(--sf-font-head);font-size:var(--sf-fs-h3);font-weight:var(--weight-semibold);text-transform:uppercase;text-shadow:0 1px 6px rgba(0,0,0,.35)}
.sfs-rings{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:var(--sf-gap)}
.sfs-rings a{display:flex;flex-direction:column;align-items:center;gap:10px;color:var(--sf-text);text-decoration:none}
.sfs-rings b{font-weight:var(--weight-semibold)}
.sfs-ring{display:grid;place-items:center;width:100%;max-width:170px;aspect-ratio:1/1;padding:5px;border-radius:50%;background:conic-gradient(from 210deg,var(--sf-accent),var(--sf-primary),var(--sf-accent));box-sizing:border-box;color:var(--sf-primary);font-size:var(--sf-fs-h2);font-weight:var(--weight-semibold)}
.sfs-ring>*{width:100%;height:100%;border-radius:50%;object-fit:cover;background:var(--sf-surface);border:3px solid var(--sf-surface);box-sizing:border-box}
.sfs-ring>span{display:grid;place-items:center}
.sfs-rings.is-spotlight{grid-template-columns:repeat(3,minmax(0,1fr));justify-items:center;padding:28px;border-radius:var(--sf-radius-card);background:color-mix(in srgb,var(--sf-accent) 22%,var(--sf-bg))}
.sfs-rings.is-spotlight .sfs-ring{max-width:200px}
/* section titles (Customize › Global styles › Section titles) */
.sfs-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin:0 0 22px}
.sfs-head__t{display:flex;flex-direction:column;gap:4px;min-width:0}
.sfs-head .sfs-title{margin:0!important}
.sfs-sub{max-width:60ch;margin:0;color:var(--sf-muted);font-size:var(--sf-fs-lg);line-height:1.5}
.sfs-more{display:inline-flex;align-items:center;gap:6px;flex:none;color:var(--sf-primary);font-size:var(--sf-fs-sm);font-weight:var(--weight-medium);text-decoration:none;white-space:nowrap}
.sfs-more:hover{text-decoration:underline}
.sf-titles-plain .sfs-more{display:none}
.sf-titles-underline .sfs-head{position:relative;padding-bottom:12px;border-bottom:1px solid var(--sf-line)}
.sf-titles-underline .sfs-head .sfs-title{font-size:calc(var(--sf-fs-h2) * .82)}
/* the short bar sits on the header's rule, under the title and its line, never over them */
.sf-titles-underline .sfs-head::after{content:"";position:absolute;left:0;bottom:-2px;width:44px;height:3px;border-radius:2px;background:var(--sf-primary)}
.sf-titles-underline .sfs-more{text-transform:uppercase;letter-spacing:.04em;font-size:var(--sf-fs-sm)}
.sf-titles-center .sfs-head,.sf-titles-caps .sfs-head,.sf-titles-subtitle .sfs-head{position:relative;justify-content:center;text-align:center}
.sf-titles-center .sfs-head__t,.sf-titles-caps .sfs-head__t,.sf-titles-subtitle .sfs-head__t{align-items:center}
.sf-titles-center .sfs-head .sfs-title::after{content:"";display:block;width:56px;height:3px;margin:10px auto 0;border-radius:2px;background:var(--sf-primary)}
.sf-titles-center .sfs-more,.sf-titles-caps .sfs-more,.sf-titles-subtitle .sfs-more{position:absolute;right:0;bottom:4px}
.sf-titles-caps .sfs-head .sfs-title{font-size:calc(var(--sf-fs-h2) * .72);letter-spacing:.08em;text-transform:uppercase}
.sf-titles-bold .sfs-head .sfs-title{text-transform:uppercase;font-size:var(--sf-fs-h2);letter-spacing:.02em}
.sf-titles-bold .sfs-more{padding:6px 14px;border:1px solid var(--sf-line);border-radius:var(--radius-full);color:var(--sf-text);background:var(--sf-surface)}
.sf-titles-pill .sfs-head .sfs-title{display:inline-block;padding:6px 18px;border-radius:var(--radius-full);background:var(--sf-primary);color:var(--sf-on-primary);font-size:var(--sf-fs-lg)}
.sf-titles-subtitle .sfs-head .sfs-title{font-size:var(--sf-fs-h2)}
.sf-on-card .sfs-panel{padding:20px;border-radius:var(--sf-radius-card);background:var(--sf-surface);box-shadow:0 1px 3px rgba(15,23,42,.06)}
.sf-on-card.sf-titles-pill .sfs-panel{position:relative;padding-top:34px;margin-top:18px}
.sf-on-card.sf-titles-pill .sfs-panel>.sfs-head{position:absolute;top:-18px;left:16px;margin:0}
.sf-on-card.sf-titles-pill .sfs-panel>.sfs-head .sfs-more{position:static}
.sf-grid.is-2{grid-template-columns:repeat(2,minmax(0,1fr))}
.sf-grid.is-3{grid-template-columns:repeat(3,minmax(0,1fr))}
.sf-grid.is-h:not(.is-2):not(.is-3){grid-template-columns:repeat(2,minmax(0,1fr))}
.sf-row.is-h{grid-auto-columns:calc((100% - var(--sf-gap)) / 2)}
.sf-row.is-peek{margin:0 calc(50% - 50vw);padding:0 max(24px,calc(50vw - var(--sf-width) / 2 + 24px)) 6px;scroll-padding:0 24px}
/* the layout editor's frame */
.sf-editing .sfs,.sf-editing .sfx-main-edit{position:relative;cursor:pointer}
.sf-editing .sfs:hover,.sf-editing .sfx-main-edit:hover{outline:2px dashed color-mix(in srgb,var(--sf-primary) 55%,transparent);outline-offset:-2px}
.sf-editing .is-selected{outline:2px solid var(--sf-primary)!important;outline-offset:-2px}
.sf-editing [data-sfx-label]:hover::before,.sf-editing [data-sfx-label].is-selected::before{content:attr(data-sfx-label);position:absolute;top:0;left:0;z-index:6;padding:3px 10px;border-radius:0 0 var(--radius-lg) 0;background:var(--sf-primary);color:var(--sf-on-primary);font:500 12px/1.4 var(--sf-font-body);pointer-events:none}
@media (min-width:1024px){.sf-editing .sfx-hide-d{display:block!important;opacity:.35}}
@media (min-width:641px) and (max-width:1023px){.sf-editing .sfx-hide-t{display:block!important;opacity:.35}}
@media (max-width:640px){.sf-editing .sfx-hide-m{display:block!important;opacity:.35}}
.sfx-empty{margin:0;padding:28px;border:1.5px dashed var(--sf-line);border-radius:var(--sf-radius);color:var(--sf-muted);text-align:center}
@media (max-width:899px){
  .sfs-slide{min-height:300px}.is-L .sfs-slide{min-height:380px}.is-S .sfs-slide{min-height:220px}
  .sfs-slide__text{padding:24px}
  .sfs-slide__text h2{font-size:var(--sf-fs-h2)}
  .sfs-offer.has-img,.sfs-ti{grid-template-columns:minmax(0,1fr)}
  .sfs-ti.is-left>img{order:0}
  .sfs-news{grid-template-columns:minmax(0,1fr)}
  .sfs-trust{grid-template-columns:repeat(2,minmax(0,1fr))}
  .sfs-arrow{display:none}
  .hv-split .sfs-slide{grid-template-columns:minmax(0,1fr)}
  .hv-split .sfs-slide__pic{min-height:220px;order:-1}
  .sfs-hero-grid{grid-template-columns:minmax(0,1fr)}
  .sfs-hero-grid .sfs-slide{min-height:300px}
  .sfs-hero-side{grid-template-rows:none;grid-template-columns:1fr 1fr}
  .sfs-sideban{min-height:140px}
  .sfs-faq-split{grid-template-columns:minmax(0,1fr);gap:var(--sf-gap)}
  .sf-grid.is-3{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (max-width:640px){
  .sfs-offer,.sfs-ti,.sfs-news{padding:20px}
  .sfs-cats{grid-template-columns:repeat(2,minmax(0,1fr))}
  .sfs-cats.is-circles{grid-template-columns:repeat(3,minmax(0,1fr))}
  .is-circles .sfs-cat__ico{width:64px;height:64px}
  .sfs-trust{grid-template-columns:minmax(0,1fr)}
  .sfs-clock span{min-width:40px}
  .sfs-ccards{grid-template-columns:repeat(2,minmax(0,1fr))}
  .sfs-clist,.sfs-faq.is-columns{grid-template-columns:minmax(0,1fr)}
  .sfs-hero-side{grid-template-columns:minmax(0,1fr)}
  .hv-video .sfs-slide{min-height:360px}
  .sf-grid.is-2.is-h,.sf-grid.is-3.is-h,.sf-grid.is-h{grid-template-columns:minmax(0,1fr)}
  .sf-row.is-h{grid-auto-columns:88%}
  .sf-on-card .sfs-panel{padding:14px}
  .sfs-head{flex-wrap:wrap}
  .sf-titles-center .sfs-more,.sf-titles-caps .sfs-more,.sf-titles-subtitle .sfs-more{position:static}
}

`;
