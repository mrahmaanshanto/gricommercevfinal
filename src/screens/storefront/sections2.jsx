'use client';
// sections2 — the website sections added for the eight ready themes (docs/theme-research-oct-2026.md): trust strips (5
// looks), brands (4), reviews (4), products by category tabs, best sellers with one big card, deal panels (3), banner
// grids (6), coupons (2), quick links (2), why-us steps (2), call to action (2), shoppable videos (2), a YouTube channel,
// visit our shops (branches, map, photos) and the about text for search with popular searches. sections.jsx › sectionBody
// sends these kinds here. Data is the shop's own: products, brands, reviews, website coupons, branches.

import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { clockNow } from '@/lib/settlements';
import { variantOf } from '@/lib/storefront/layouts';
import { isEditing } from '@/lib/storefront/store';
import { productsBy, topCategories, storeBrands, storeReviews, storeProducts, liveFlashSale } from '@/lib/storefront/catalog';
import { websiteOffers } from '@/lib/storeOffers';
import { getPlaces } from '@/lib/locations';
import { FileImg } from '@/components/files/FileParts';
import { useFileSrc } from '@/lib/files';
import { ProductCard, Stars, bdt } from './storeKit';

const pad = (n) => (n < 10 ? '0' : '') + n;
export const TRUST_DEFAULT = [
  { icon: 'truck', title: 'Delivery all over Bangladesh', text: '1–2 days in Dhaka' },
  { icon: 'banknote', title: 'Cash on delivery', text: 'Pay when it arrives' },
  { icon: 'shield-check', title: 'Official warranty', text: 'On every phone' },
  { icon: 'rotate-ccw', title: '7-day return', text: 'If something is wrong' },
];
const STATS_DEFAULT = [
  { icon: 'badge-check', title: '100%', text: 'Authentic products' },
  { icon: 'package', title: '1,200+', text: 'Products in stock' },
  { icon: 'star', title: '60+', text: 'Official brands' },
  { icon: 'headset', title: 'Free', text: 'Expert advice' },
];

function useNow(on = true) {
  const [now, setNow] = useState(0);
  useEffect(() => { if (!on) return undefined; setNow(clockNow()); const iv = setInterval(() => setNow(clockNow()), 1000); return () => clearInterval(iv); }, [on]);
  return now;
}
/** Days, hours, minutes and seconds left until `end` (or until midnight when there is no end). */
function left(now, end) {
  const to = end || (() => { const d = new Date(now); d.setHours(23, 59, 59, 999); return d.getTime(); })();
  const t = Math.max(0, Math.floor((to - now) / 1000));
  return [[Math.floor(t / 86400), 'd'], [Math.floor((t % 86400) / 3600), 'h'], [Math.floor((t % 3600) / 60), 'm'], [t % 60, 's']];
}
function Clock({ end, label = 'Ends in', dark }) {
  const now = useNow();
  if (!now) return null;
  const parts = left(now, end);
  return (
    <div className={'sfz-clock' + (dark ? ' is-dark' : '')} aria-label={label + ' ' + parts.map((p) => p[0] + p[1]).join(' ')}>
      <small>{label}</small>
      {parts.map(([n, l]) => <span key={l}><b>{pad(n)}</b><i>{l}</i></span>)}
    </div>
  );
}
function Carousel({ children, cls = '' }) {
  const ref = useRef(null);
  const go = (d) => { const el = ref.current; if (el) el.scrollBy({ left: d * el.clientWidth * 0.8, behavior: 'smooth' }); };
  return (
    <div className={'sfz-car ' + cls}>
      <button type="button" className="sfz-car__a is-prev" aria-label="Scroll back" onClick={() => go(-1)}><Icon name="chevron-left" width="18" height="18" aria-hidden="true" /></button>
      <div className="sfz-car__t" ref={ref}>{children}</div>
      <button type="button" className="sfz-car__a is-next" aria-label="Scroll on" onClick={() => go(1)}><Icon name="chevron-right" width="18" height="18" aria-hidden="true" /></button>
    </div>
  );
}

// ---- trust strip ----------------------------------------------------------------------------------------------------
function Trust({ s }) {
  const v = variantOf(s);
  const items = (s.items || []).filter((x) => x.title).length ? s.items.filter((x) => x.title) : v === 'stats' ? STATS_DEFAULT : TRUST_DEFAULT;
  return (
    <div className={'sfz-trust is-' + v}>
      {items.map((x, i) => (
        <div key={i} className="sfz-trust__i">
          <span className="sfz-trust__ic" aria-hidden="true"><Icon name={x.icon || 'check'} width="22" height="22" /></span>
          <span><b>{x.title}</b>{x.text ? <small>{x.text}</small> : null}</span>
        </div>
      ))}
    </div>
  );
}

// ---- brands ---------------------------------------------------------------------------------------------------------
function Brands({ s }) {
  const v = variantOf(s);
  const list = storeBrands().slice(0, Number(s.count) || 8);
  if (!list.length) return null;
  const href = (b) => '/search?q=' + encodeURIComponent(b.name);
  if (v === 'offers') {
    const all = storeProducts();
    return (
      <div className="sfz-boffers">
        {list.map((b) => {
          const mine = all.filter((p) => p.brand === b.name);
          const top = Math.max(0, ...mine.map((p) => p.off || 0));
          const pic = (mine.find((p) => p.img) || {}).img || '';
          return (
            <a key={b.id || b.name} className="sfz-boffer" href={href(b)}>
              <span className="sfz-boffer__img" style={{ background: (mine[0] && mine[0].tbg) || 'var(--sf-soft)' }}>{pic ? <img src={pic} alt="" loading="lazy" /> : <b>{b.name}</b>}</span>
              <span className="sfz-boffer__logo">{b.image ? <img src={b.image} alt={b.name} loading="lazy" /> : b.name}</span>
              <strong>{top ? `Up to ${top}% off` : `${b.count} product${b.count === 1 ? '' : 's'}`}</strong>
              <small>{top ? 'On selected items' : 'Official brand'}</small>
            </a>
          );
        })}
      </div>
    );
  }
  const logo = (b) => <a key={b.id || b.name} href={href(b)} className="sfz-logo">{b.image ? <img src={b.image} alt={b.name} loading="lazy" /> : <b>{b.name}</b>}</a>;
  if (v === 'carousel') return <Carousel cls="is-logos">{list.map(logo)}</Carousel>;
  if (v === 'circles') return <div className="sfz-logos is-circles">{list.map(logo)}</div>;
  if (v === 'marquee') return <div className="sfz-marquee"><div className="sfz-marquee__t">{list.map(logo)}<span className="sfz-marquee__dup" aria-hidden="true">{list.map(logo)}</span></div></div>;
  if (v === 'grid') return <div className="sfz-logos is-grid">{list.map(logo)}</div>;
  return <div className="sfz-logos">{list.map(logo)}</div>;
}

// ---- reviews --------------------------------------------------------------------------------------------------------
function Shot({ src }) { const u = useFileSrc(src, 'md'); return u ? <img src={u} alt="A customer's message" loading="lazy" /> : null; }
function Reviews({ s }) {
  const v = variantOf(s);
  if (v === 'screens') {
    const shots = (s.shots || []).filter((x) => x.image);
    if (!shots.length) return null;
    return <Carousel cls="is-shots">{shots.map((x, i) => <figure key={i} className="sfz-shot"><Shot src={x.image} /></figure>)}</Carousel>;
  }
  const list = storeReviews(Number(s.count) || 3);
  if (!list.length) return null;
  if (v === 'big') return <BigQuote list={list} />;
  if (v === 'compact') {
    return (
      <div className="sfz-revlist">
        {list.map((r) => <figure key={r.id}><Stars rating={{ avg: r.stars, count: 1 }} small /><blockquote>{r.text}</blockquote><figcaption><b>{r.name}</b>{r.product ? <small>{r.product}</small> : null}</figcaption></figure>)}
      </div>
    );
  }
  if (v === 'avatar') {
    return (
      <div className="sfz-quotes">
        {list.map((r) => (
          <figure key={r.id} className="sfz-quote">
            <blockquote>{r.text}</blockquote>
            <Stars rating={{ avg: r.stars, count: 1 }} small />
            <figcaption><span className="sfz-av" aria-hidden="true">{String(r.name || '?').slice(0, 1)}</span><span><b>{r.name}</b><small>{r.verified ? 'Verified buyer' : 'Customer'}</small></span></figcaption>
          </figure>
        ))}
      </div>
    );
  }
  if (v === 'verified') {
    return (
      <div className="sfz-vrev">
        {list.map((r) => (
          <figure key={r.id} className="sfz-vrev__c">
            <b className="sfz-vrev__p">{r.product}</b>
            <Stars rating={{ avg: r.stars, count: 1 }} small />
            <blockquote>{r.text}</blockquote>
            <figcaption><b>{r.name}</b>{r.verified ? <small><Icon name="badge-check" width="14" height="14" aria-hidden="true" />Verified</small> : null}</figcaption>
          </figure>
        ))}
      </div>
    );
  }
  return null;   // 'cards' stays in sections.jsx
}

/** One review at a time, large, with arrows (Reviews › One big quote). */
function BigQuote({ list }) {
  const [i, setI] = useState(0);
  const r = list[((i % list.length) + list.length) % list.length];
  return (
    <figure className="sfz-bigq">
      <Icon name="quote" width="36" height="36" aria-hidden="true" />
      <blockquote>{r.text}</blockquote>
      <Stars rating={{ avg: r.stars, count: 1 }} small />
      <figcaption><b>{r.name}</b>{r.product ? <small>{r.product}</small> : null}</figcaption>
      {list.length > 1 ? <span className="sfz-bigq__nav"><button type="button" aria-label="Previous review" onClick={() => setI((x) => x - 1)}><Icon name="arrow-left" width="18" height="18" aria-hidden="true" /></button><small>{(((i % list.length) + list.length) % list.length) + 1} / {list.length}</small><button type="button" aria-label="Next review" onClick={() => setI((x) => x + 1)}><Icon name="arrow-right" width="18" height="18" aria-hidden="true" /></button></span> : null}
    </figure>
  );
}

// ---- products by category tabs ----------------------------------------------------------------------------------------
function ProductTabs({ s, v: tv }) {
  const look = variantOf(s);
  const cats = topCategories().slice(0, Math.max(2, Math.min(10, Number(s.tabs) || 6)));
  const [cur, setCur] = useState('');
  if (!cats.length) return null;
  const c = cats.find((x) => x.path === cur) || cats[0];
  const list = productsBy({ source: 'category', cat: c.path, count: Number(s.count) || 8 });
  return (
    <div className={'sfz-ptabs is-' + look}>
      <div className="sfz-ptabs__bar" role="tablist" aria-label="Categories">
        {cats.map((x) => <button key={x.id} type="button" role="tab" aria-selected={x.path === c.path} className={x.path === c.path ? 'is-on' : ''} onClick={() => setCur(x.path)}>{x.name}</button>)}
      </div>
      {list.length ? <div className={s.layout === 'grid' ? 'sf-grid' : 'sf-row'}>{list.map((p) => <ProductCard key={p.id} p={p} values={tv} style={s.card || undefined} />)}</div> : <p className="sfx-empty">Nothing in {c.name} yet.</p>}
      <p className="sfz-ptabs__more"><a className="sf-btn sf-btn--sm" href={c.href}>See all {c.name}<Icon name="arrow-right" width="14" height="14" aria-hidden="true" /></a></p>
    </div>
  );
}

// ---- best sellers, one big ------------------------------------------------------------------------------------------------
function Bento({ s, v }) {
  const list = productsBy({ source: s.source || 'best', cat: s.cat, count: 7 });
  if (list.length < 3) return null;
  const [big, ...rest] = list;
  const look = variantOf(s);
  if (look === 'grid') return <div className="sf-grid">{list.slice(0, 8).map((p) => <ProductCard key={p.id} p={p} values={v} style="solid" />)}</div>;
  return (
    <div className={'sfz-bento is-' + look}>
      <div className="sfz-bento__big"><ProductCard p={big} values={v} style={look === 'stack' ? 'horizontal' : 'solid'} /></div>
      <div className="sfz-bento__top">{rest.slice(0, 2).map((p) => <ProductCard key={p.id} p={p} values={v} style="horizontal" />)}</div>
      <div className="sfz-bento__low">{rest.slice(2, 6).map((p) => <ProductCard key={p.id} p={p} values={v} style="solid" />)}</div>
    </div>
  );
}

// ---- deal panel -----------------------------------------------------------------------------------------------------------
function Deal({ s, v }) {
  const look = variantOf(s);
  const sale = liveFlashSale(s.offer);
  const list = productsBy({ source: s.source || 'sale', cat: s.cat, picked: s.picked, count: Number(s.count) || 8 });
  const end = sale && sale.end;
  if (look === 'split' && list.length) {
    const [top, ...more] = list;
    return (
      <div className="sfz-deal is-split">
        <div className="sfz-deal__hero">
          <div className="sfz-deal__head"><div><h2>{s.title}</h2>{s.text ? <p>{s.text}</p> : null}</div><Clock end={end} label="Ends in" /></div>
          <ProductCard p={top} values={v} style="solid" />
        </div>
        <div className="sfz-deal__more">{more.slice(0, 6).map((p) => <ProductCard key={p.id} p={p} values={v} style="horizontal" />)}</div>
      </div>
    );
  }
  if (look === 'tinted' || look === 'minimal') {
    return (
      <div className={'sfz-deal is-' + look}>
        <div className="sfz-deal__head">
          <div><h2>{s.title}</h2>{s.text ? <p>{s.text}</p> : null}</div>
          <Clock end={end} label="Offer ends in" />
        </div>
        {s.image ? <FileImg className="sfz-deal__banner" src={s.image} size="full" alt="" loading="lazy" /> : null}
        {list.length ? <div className="sf-grid">{list.map((p) => <ProductCard key={p.id} p={p} values={v} style={s.card || undefined} />)}</div> : null}
      </div>
    );
  }
  return (
    <div className={'sfz-deal is-' + look}>
      <div className="sfz-deal__side">
        {look === 'dark' ? <span className="sfz-chip"><i aria-hidden="true" />Flash deal</span> : null}
        <h2>{s.title}</h2>
        {s.text ? <p>{s.text}</p> : null}
        {look === 'dark' ? <Clock end={end} label="Deal ends in" dark /> : null}
        {s.button ? <a className="sf-btn" href={s.href || '/offers'}>{s.button}<Icon name="chevrons-right" width="16" height="16" aria-hidden="true" /></a> : null}
      </div>
      <div className="sfz-deal__list">
        {list.length ? <Carousel>{list.map((p) => <ProductCard key={p.id} p={p} values={v} style={s.card || undefined} />)}</Carousel> : <p className="sfx-empty">No products on sale yet.</p>}
      </div>
    </div>
  );
}

// ---- banner grid ----------------------------------------------------------------------------------------------------------
function BannerGrid({ s }) {
  const look = variantOf(s);
  const list = (s.banners || []).filter((b) => b.image || b.title);
  if (!list.length) return null;
  const max = { two: 2, three2: 6, four: 4, portrait3: 3, mosaic: 3, strip: 1 }[look] || 4;
  return (
    <div className={'sfz-banners is-' + look}>
      {list.slice(0, max).map((b, i) => (
        <a key={b.id || i} className={'sfz-banner' + (b.image ? ' has-img' : '')} href={b.href || '#'}>
          {b.image ? <FileImg src={b.image} size={look === 'strip' || (look === 'mosaic' && !i) ? 'full' : 'md'} alt={b.title || ''} loading="lazy" /> : null}
          {b.title || b.text ? <span className="sfz-banner__t"><b>{b.title}</b>{b.text ? <small>{b.text}</small> : null}</span> : null}
        </a>
      ))}
    </div>
  );
}

// ---- coupons --------------------------------------------------------------------------------------------------------------
function Coupons({ s }) {
  const look = variantOf(s);
  const [list, setList] = useState(null);
  useEffect(() => { let l = []; try { l = websiteOffers(clockNow()).filter((o) => o.kind === 'code' && o.code && o.state !== 'ended'); } catch { l = []; } setList(l.slice(0, Number(s.count) || 4)); }, [s.count]);
  if (!list || !list.length) return null;
  const copy = async (code) => { try { await navigator.clipboard.writeText(code); toast(`${code} copied. Paste it at checkout.`); } catch { toast(`Your code: ${code}`); } };
  const tickets = list.map((o) => (
    <div key={o.id} className="sfz-ticket">
      <div className="sfz-ticket__a"><small>{o.title}</small><b>{o.big}</b></div>
      <div className="sfz-ticket__b"><span>{o.blurb}</span><span className="sfz-ticket__code"><code>{o.code}</code><button type="button" onClick={() => copy(o.code)}>Copy</button></span></div>
    </div>
  ));
  if (look === 'panel') {
    return (
      <div className="sfz-coupons is-panel">
        <div className="sfz-coupons__head"><Icon name="gift" width="34" height="34" aria-hidden="true" /><span><h2>{s.title}</h2>{s.text ? <p>{s.text}</p> : null}</span></div>
        <div className="sfz-coupons__list">{tickets}</div>
      </div>
    );
  }
  return <div className={'sfz-coupons__list is-' + look}>{tickets}</div>;
}

// ---- quick links, steps, call to action ---------------------------------------------------------------------------------------
function QuickLinks({ s }) {
  const items = (s.items || []).filter((x) => x.title);
  if (!items.length) return null;
  return (
    <div className={'sfz-qlinks is-' + variantOf(s)}>
      {items.map((x, i) => <a key={i} href={x.href || '#'} className="sfz-qlink"><span className="sfz-qlink__ic" aria-hidden="true"><Icon name={x.icon || 'arrow-right'} width="20" height="20" /></span><span className="sfz-qlink__t"><b>{x.title}</b>{x.text ? <small>{x.text}</small> : null}</span><span className="sfz-qlink__go" aria-hidden="true"><Icon name="arrow-right" width="16" height="16" /></span></a>)}
    </div>
  );
}
function Steps({ s }) {
  const items = (s.items || []).filter((x) => x.title);
  if (!items.length) return null;
  const look = variantOf(s);
  return (
    <div className={'sfz-steps is-' + look}>
      {items.map((x, i) => (
        <div key={i} className="sfz-step">
          {look === 'numbered' || look === 'timeline' ? <span className="sfz-step__n">{look === 'timeline' ? i + 1 : pad(i + 1)}</span> : <span className="sfz-step__ic" aria-hidden="true"><Icon name={x.icon || 'check'} width="24" height="24" /></span>}
          <b>{x.title}</b>
          {x.text ? <p>{x.text}</p> : null}
        </div>
      ))}
    </div>
  );
}
function Cta({ s }) {
  const look = variantOf(s);
  const pic = useFileSrc(s.image || '', 'md');
  if (look === 'strip') {
    return (
      <div className="sfz-cta is-strip">
        <span className="sfz-cta__ic" aria-hidden="true"><Icon name={s.icon || 'map-pin'} width="26" height="26" /></span>
        <span className="sfz-cta__t"><b>{s.title}</b>{s.text ? <small>{s.text}</small> : null}</span>
        {s.button ? <a className="sf-btn" href={s.href || '#'}>{s.button}<Icon name="arrow-right" width="16" height="16" aria-hidden="true" /></a> : null}
      </div>
    );
  }
  if (look === 'split') {
    return (
      <div className="sfz-cta is-split">
        <div><h2>{s.title}</h2>{s.text ? <p>{s.text}</p> : null}{s.button ? <a className="sf-btn" href={s.href || '#'}><Icon name={s.icon || 'message-circle'} width="16" height="16" aria-hidden="true" />{s.button}</a> : null}</div>
        {pic ? <img src={pic} alt="" loading="lazy" /> : <span className="sfz-cta__art" aria-hidden="true"><Icon name={s.icon || 'message-circle'} width="56" height="56" /></span>}
      </div>
    );
  }
  if (look === 'center' || look === 'outline') {
    return (
      <div className={'sfz-cta is-' + look}>
        {look === 'outline' ? <span className="sfz-cta__ic" aria-hidden="true"><Icon name={s.icon || 'message-circle'} width="26" height="26" /></span> : null}
        <h2>{s.title}</h2>
        {s.text ? <p>{s.text}</p> : null}
        {s.button ? <a className="sf-btn" href={s.href || '#'}>{s.button}<Icon name="arrow-right" width="16" height="16" aria-hidden="true" /></a> : null}
      </div>
    );
  }
  return (
    <div className={'sfz-cta is-card' + (pic ? ' has-img' : '')} style={pic ? { backgroundImage: `linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)),url("${pic}")` } : undefined}>
      {s.label ? <span className="sfz-chip">{s.label}</span> : null}
      <h2>{s.title}</h2>
      {s.text ? <p>{s.text}</p> : null}
      {s.button ? <a className="sf-btn" href={s.href || '#'}><Icon name={s.icon || 'message-circle'} width="16" height="16" aria-hidden="true" />{s.button}</a> : null}
    </div>
  );
}

// ---- shoppable videos, YouTube channel --------------------------------------------------------------------------------------
const ytId = (u) => { const m = String(u || '').match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : ''; };
function Reel({ item, v, big }) {
  const [on, setOn] = useState(false);
  const file = useFileSrc(/^gcfile:|\.(mp4|webm)/i.test(item.video || '') ? item.video : '', 'full');
  const yt = ytId(item.video);
  const p = item.product ? storeProducts().find((x) => x.id === item.product) : null;
  return (
    <figure className={'sfz-reel' + (big ? ' is-big' : '')}>
      <div className="sfz-reel__v">
        {on && yt ? <iframe src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&playsinline=1`} title="Video" allow="autoplay; encrypted-media" allowFullScreen /> : null}
        {on && !yt && file ? <video src={file} autoPlay controls playsInline /> : null}
        {!yt && !file && item.image ? <FileImg src={item.image} alt={p ? p.name : ''} loading="lazy" /> : null}
        {!on && (yt || file) ? <button type="button" onClick={() => setOn(true)} aria-label="Play the video">{yt ? <img src={`https://i.ytimg.com/vi/${yt}/hqdefault.jpg`} alt="" loading="lazy" /> : file ? <video src={file} muted playsInline preload="metadata" /> : null}<span><Icon name="play" width="24" height="24" aria-hidden="true" /></span></button> : null}
      </div>
      {p ? <a className="sfz-reel__p" href={p.href}><span style={{ background: p.tbg }}>{p.img ? <img src={p.img} alt="" loading="lazy" /> : p.name.slice(0, 1)}</span><span><small>{p.name}</small><b>{bdt(p.price)}</b></span><Icon name="arrow-right" width="16" height="16" aria-hidden="true" /></a> : null}
    </figure>
  );
}
function Reels({ s, v }) {
  // a reel is a video (YouTube Shorts link or a file), or a picture with the product it shows
  const items = (s.items || []).filter((x) => x.video || x.image);
  if (!items.length) return null;
  const look = variantOf(s);
  const mid = Math.floor(items.length / 2);
  return <div className={'sfz-reels is-' + look}>{items.map((x, i) => <Reel key={i} item={x} v={v} big={look === 'coverflow' && i === mid} />)}</div>;
}
function YtFeed({ s }) {
  // a video is a YouTube link; the All sections page passes sample tiles with their own picture (`thumb`)
  const items = (s.items || []).filter((x) => ytId(x.url) || x.thumb);
  const [n, setN] = useState(4);
  if (!items.length && !isEditing()) return null;
  return (
    <div className={'sfz-yt is-' + variantOf(s)}>
      <div className="sfz-yt__head">
        <span className="sfz-yt__logo" aria-hidden="true"><Icon name="youtube" width="22" height="22" /></span>
        <span><b>{s.title}</b><small>{s.subs}</small></span>
        <a className="sfz-yt__sub" href={s.href || '#'} target="_blank" rel="noopener noreferrer"><Icon name="play" width="12" height="12" aria-hidden="true" />Subscribe</a>
      </div>
      {items.length ? <div className="sfz-yt__grid">{items.slice(0, n).map((x, i) => <a key={i} className="sfz-yt__v" href={x.url || s.href || '#'} target="_blank" rel="noopener noreferrer"><span><FileImg src={x.thumb || `https://i.ytimg.com/vi/${ytId(x.url)}/hqdefault.jpg`} alt="" loading="lazy" /><i><Icon name="play" width="18" height="18" aria-hidden="true" /></i></span><b>{x.title}</b>{x.date ? <small><Icon name="calendar" width="12" height="12" aria-hidden="true" />{x.date}</small> : null}</a>)}</div> : <p className="sfx-empty">Add YouTube links to show the videos.</p>}
      {items.length > n ? <p className="sfz-ptabs__more"><button type="button" className="sf-btn sf-btn--sm" onClick={() => setN((x) => x + 4)}>Load more</button></p> : null}
    </div>
  );
}

// ---- visit our shops ----------------------------------------------------------------------------------------------------------
function Outlet({ s }) {
  const [places, setPlaces] = useState([]);
  const [cur, setCur] = useState('');
  const [to, setTo] = useState('');
  useEffect(() => { let l = []; try { l = getPlaces({ active: true }).filter((p) => p.type === 'Branch'); } catch { l = []; } setPlaces(l); }, []);
  if (!places.length) return null;
  const look = variantOf(s);
  const mapsAt = (x) => 'https://maps.google.com/?q=' + encodeURIComponent(x.address || x.name);
  const tel = (x) => 'tel:' + String(x.phone || '').replace(/[^\d+]/g, '');
  if (look === 'cards' || look === 'list') {
    return (
      <div className={'sfz-branches is-' + look}>
        {places.map((x) => (
          <div key={x.id} className="sfz-branch">
            <span className="sfz-branch__ic" aria-hidden="true"><Icon name="store" width="20" height="20" /></span>
            <span className="sfz-branch__t"><b>{x.name}</b><small>{x.address}</small>{x.hours ? <small>{x.hours}</small> : null}</span>
            <span className="sfz-branch__a">
              {x.phone ? <a className="sf-btn sf-btn--sm sf-btn--line" href={tel(x)}><Icon name="phone" width="14" height="14" aria-hidden="true" />Call</a> : null}
              <a className="sf-btn sf-btn--sm" href={mapsAt(x)} target="_blank" rel="noopener noreferrer"><Icon name="navigation" width="14" height="14" aria-hidden="true" />Directions</a>
            </span>
          </div>
        ))}
      </div>
    );
  }
  const p = places.find((x) => x.id === cur) || places[0];
  if (look === 'split') {
    return (
      <div className="sfz-outsplit">
        <div className="sfz-outsplit__list" role="tablist" aria-label="Shops">
          {places.map((x) => <button key={x.id} type="button" role="tab" aria-selected={x.id === p.id} className={x.id === p.id ? 'is-on' : ''} onClick={() => setCur(x.id)}><b>{x.name}</b><small>{x.address}</small>{x.hours ? <small>{x.hours}</small> : null}</button>)}
        </div>
        <div className="sfz-outlet__map"><iframe title={'Map of ' + p.name} loading="lazy" src={`https://maps.google.com/maps?q=${encodeURIComponent(p.address || p.name)}&z=15&output=embed`} /></div>
      </div>
    );
  }
  const photos = (s.photos || []).filter((x) => x.image);
  const q = encodeURIComponent(p.address || p.name);
  const send = (e) => {
    e.preventDefault();
    const x = to.replace(/[\s-]/g, '');
    if (!/^(\+?88)?01\d{9}$/.test(x) && !/^\S+@\S+\.\S+$/.test(to.trim())) { toast('Enter a mobile number or an email address.', { tone: 'error' }); return; }
    setTo('');
    toast(`We’ll send the ${p.name} location to ${to.trim()}.`);
  };
  return (
    <div className={'sfz-outlet' + (photos.length ? '' : ' no-photos')}>
      <div className="sfz-outlet__main">
        <div className="sfz-outlet__tabs" role="tablist" aria-label="Shops">
          {places.map((x) => <button key={x.id} type="button" role="tab" aria-selected={x.id === p.id} className={x.id === p.id ? 'is-on' : ''} onClick={() => setCur(x.id)}><Icon name="map-pin" width="14" height="14" aria-hidden="true" />{x.name}</button>)}
        </div>
        <div className="sfz-outlet__map">
          <iframe title={'Map of ' + p.name} loading="lazy" src={`https://maps.google.com/maps?q=${q}&z=15&output=embed`} />
          <div className="sfz-outlet__card"><b>{p.name}</b><small>{p.address}</small>{p.hours ? <small>{p.hours}</small> : null}{p.phone ? <a href={'tel:' + p.phone.replace(/[^\d+]/g, '')}>{p.phone}</a> : null}<a className="sf-btn sf-btn--sm" href={`https://maps.google.com/?q=${q}`} target="_blank" rel="noopener noreferrer"><Icon name="navigation" width="14" height="14" aria-hidden="true" />Directions</a></div>
        </div>
        <form className="sfz-outlet__send" onSubmit={send}>
          <label htmlFor={'ol-' + s.id}>Get the shop’s location on your phone</label>
          <span><input id={'ol-' + s.id} className="sf-input" value={to} onChange={(e) => setTo(e.target.value)} placeholder="01XXXXXXXXX or email" /><button type="submit" className="sf-btn sf-btn--sm">Send</button></span>
        </form>
      </div>
      {photos.length ? <div className="sfz-outlet__photos">{photos.slice(0, 6).map((x, i) => <FileImg key={i} src={x.image} alt="" loading="lazy" />)}</div> : null}
    </div>
  );
}

// ---- about text for search, popular searches ------------------------------------------------------------------------------------
function SeoText({ s }) {
  const look = variantOf(s);
  const [open, setOpen] = useState(look === 'open' || look === 'columns');
  const blocks = String(s.text || '').split(/\n{2,}/).map((x) => x.trim()).filter(Boolean);
  const tags = String(s.tags || '').split(',').map((x) => x.trim()).filter(Boolean);
  if (!blocks.length && !tags.length) return null;
  return (
    <div className={'sfz-seo is-' + variantOf(s)}>
      {blocks.length ? <div className={'sfz-seo__t' + (open ? ' is-open' : '')}>{blocks.map((b, i) => {
        // "## Heading" on its own line; the lines under it are its paragraph
        if (!/^##\s/.test(b)) return <p key={i}>{b}</p>;
        const [head, ...rest] = b.split('\n');
        return <React.Fragment key={i}><h3>{head.replace(/^##\s*/, '')}</h3>{rest.join(' ').trim() ? <p>{rest.join(' ').trim()}</p> : null}</React.Fragment>;
      })}</div> : null}
      {blocks.length && (look === 'fold' || look === 'card') ? <button type="button" className="sfz-seo__more" onClick={() => setOpen((x) => !x)} aria-expanded={open}>{open ? 'Show less' : 'Read more'}</button> : null}
      {tags.length ? <p className="sfz-tags"><b>Popular searches</b>{tags.map((t) => <a key={t} href={'/search?q=' + encodeURIComponent(t)}>{t}</a>)}</p> : null}
    </div>
  );
}

/** The body of the kinds this file draws, or undefined when the kind / look is drawn by sections.jsx. */
export function moreBody(s, v) {
  switch (s.type) {
    case 'trust': return <Trust s={s} />;
    case 'brands': return <Brands s={s} />;
    case 'reviews': return variantOf(s) === 'cards' ? undefined : <Reviews s={s} />;
    case 'producttabs': return <ProductTabs s={s} v={v} />;
    case 'bento': return <Bento s={s} v={v} />;
    case 'deal': return <Deal s={s} v={v} />;
    case 'bannergrid': return <BannerGrid s={s} />;
    case 'coupons': return <Coupons s={s} />;
    case 'quicklinks': return <QuickLinks s={s} />;
    case 'steps': return <Steps s={s} />;
    case 'cta': return <Cta s={s} />;
    case 'reels': return <Reels s={s} v={v} />;
    case 'ytfeed': return <YtFeed s={s} />;
    case 'outlet': return <Outlet s={s} />;
    case 'seotext': return <SeoText s={s} />;
    default: return undefined;
  }
}
/** Kinds that place their own heading (no section title above them). */
export const OWN_HEAD = new Set(['deal:tinted', 'deal:minimal', 'deal:split', 'deal:dark', 'deal:gradient', 'coupons:panel', 'cta:card', 'cta:strip', 'cta:split', 'cta:center', 'cta:outline', 'ytfeed:grid', 'ytfeed:row', 'ytfeed:featured', 'ytfeed:list']);

export const SECTIONS2_CSS = `
/* carousel */
.sfz-car{position:relative}
.sfz-car__t{display:grid;grid-auto-flow:column;grid-auto-columns:calc((100% - (var(--sf-cols) - 1) * var(--sf-gap)) / var(--sf-cols));gap:var(--sf-gap);overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding:2px}
.sfz-car__t::-webkit-scrollbar{display:none}
.sfz-car__t>*{scroll-snap-align:start}
.sfz-car__a{position:absolute;top:50%;z-index:2;display:grid;place-items:center;width:36px;height:36px;margin-top:-18px;border:1px solid var(--sf-line);border-radius:50%;background:var(--sf-surface);color:var(--sf-text);cursor:pointer;box-shadow:0 2px 8px rgba(15,23,42,.12)}
.sfz-car__a.is-prev{left:-14px}.sfz-car__a.is-next{right:-14px}
.sfz-car.is-logos .sfz-car__t{grid-auto-columns:calc((100% - 3 * var(--sf-gap)) / 4)}
.sfz-car.is-shots .sfz-car__t{grid-auto-columns:calc((100% - 3 * var(--sf-gap)) / 4)}
/* countdown */
.sfz-clock{display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap}
.sfz-clock small{color:var(--sf-muted);margin-right:2px}
.sfz-clock span{display:inline-flex;align-items:baseline;gap:1px;padding:4px 8px;border-radius:var(--sf-radius);background:var(--sf-surface);border:1px solid var(--sf-line);font-variant-numeric:tabular-nums}
.sfz-clock b{font-weight:var(--weight-semibold);color:var(--sf-sale)}
.sfz-clock i{font-style:normal;font-size:var(--sf-fs-sm);color:var(--sf-muted)}
.sfz-clock.is-dark small{color:rgba(255,255,255,.7)}
.sfz-clock.is-dark span{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}
.sfz-clock.is-dark b{color:#fff}.sfz-clock.is-dark i{color:rgba(255,255,255,.6)}
.sfz-chip{display:inline-flex;align-items:center;gap:6px;align-self:flex-start;padding:4px 12px;border-radius:var(--radius-full);background:rgba(255,255,255,.14);color:inherit;font-size:var(--sf-fs-sm);font-weight:var(--weight-medium);letter-spacing:.04em;text-transform:uppercase}
.sfz-chip i{width:8px;height:8px;border-radius:50%;background:#38bdf8}
/* trust */
.sfz-trust{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:var(--sf-gap)}
.sfz-trust__i{display:flex;align-items:center;gap:12px;min-width:0}
.sfz-trust__i b{display:block;font-weight:var(--weight-semibold)}
.sfz-trust__i small{display:block;color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.sfz-trust__ic{display:grid;place-items:center;flex:none;color:var(--sf-primary)}
.sfz-trust.is-cards .sfz-trust__i{padding:14px;border-radius:var(--sf-radius-card);background:var(--sf-surface);border:1px solid var(--sf-line)}
.sfz-trust.is-columns{gap:0;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.sfz-trust.is-columns .sfz-trust__i{flex-direction:column;justify-content:center;text-align:center;gap:6px;padding:18px 12px}
.sfz-trust.is-columns .sfz-trust__i+.sfz-trust__i{border-left:1px solid var(--sf-line)}
.sfz-trust.is-dark{padding:18px 24px;border-radius:var(--radius-full);background:#0b0b0f;color:#fff}
.sfz-trust.is-dark .sfz-trust__ic{width:44px;height:44px;color:#ef4444}
.sfz-trust.is-dark .sfz-trust__i b{text-transform:uppercase;font-size:var(--sf-fs-sm);letter-spacing:.03em}
.sfz-trust.is-dark .sfz-trust__i small{color:rgba(255,255,255,.7)}
.sfz-trust.is-stats{padding:22px 28px;border-radius:var(--sf-radius-card);background:var(--sf-primary);color:var(--sf-on-primary)}
.sfz-trust.is-stats .sfz-trust__ic{width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.16);color:inherit}
.sfz-trust.is-stats .sfz-trust__i b{font-size:var(--sf-fs-h2);line-height:1.1}
.sfz-trust.is-stats .sfz-trust__i small{color:inherit;opacity:.85;text-transform:uppercase;font-size:var(--sf-fs-sm);letter-spacing:.04em}
.sfz-trust.is-chips{padding:12px;border-radius:var(--sf-radius-card);background:var(--sf-surface);box-shadow:0 1px 3px rgba(15,23,42,.08)}
.sfz-trust.is-chips .sfz-trust__i{padding:6px}
.sfz-trust.is-chips .sfz-trust__ic{width:40px;height:40px;border-radius:var(--sf-radius);background:var(--sf-soft)}
/* brands */
.sfz-logos{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,150px),1fr));gap:10px}
.sfz-logos.is-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr))}
.sfz-logo{display:flex;align-items:center;justify-content:center;min-width:120px;height:72px;padding:0 16px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface);color:var(--sf-text);text-decoration:none}
.sfz-logo img{max-height:56px;max-width:150px;object-fit:contain}
.sfz-boffers{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:var(--sf-gap)}
.sfz-boffer{display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;color:var(--sf-text);text-decoration:none}
.sfz-boffer__img{display:grid;place-items:center;width:100%;aspect-ratio:4/5;border-radius:var(--sf-radius-card);overflow:hidden;font-size:var(--sf-fs-h2)}
.sfz-boffer__img img{width:100%;height:100%;object-fit:cover}
.sfz-boffer__logo{display:grid;place-items:center;height:30px;margin-top:6px;font-weight:var(--weight-semibold)}
.sfz-boffer__logo img{max-height:26px;max-width:110px;object-fit:contain}
.sfz-boffer strong{color:var(--sf-sale);font-size:var(--sf-fs-lg)}
.sfz-boffer small{color:var(--sf-muted);font-size:var(--sf-fs-sm)}
/* reviews */
.sfz-quotes,.sfz-vrev{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:var(--sf-gap)}
.sfz-quote,.sfz-vrev__c{margin:0;display:flex;flex-direction:column;gap:10px;padding:20px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface);color:var(--sf-text)}
.sfz-quote blockquote,.sfz-vrev__c blockquote{margin:0;line-height:1.6}
.sfz-quote figcaption{display:flex;align-items:center;gap:10px;margin-top:auto}
.sfz-av{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;background:var(--sf-soft);color:var(--sf-primary);font-weight:var(--weight-semibold)}
.sfz-quote figcaption b,.sfz-vrev__c figcaption b{display:block;font-weight:var(--weight-medium)}
.sfz-quote figcaption small{color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.sfs--reviews:has(.sfz-vrev){background:color-mix(in srgb,var(--sf-sale) 7%,var(--sf-bg))}
.sfz-vrev__c{border:0}
.sfz-vrev__p{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:var(--weight-semibold)}
.sfz-vrev__c figcaption{display:flex;flex-direction:column;gap:2px;margin-top:auto}
.sfz-vrev__c figcaption small{display:inline-flex;align-items:center;gap:4px;color:#16a34a;font-size:var(--sf-fs-sm)}
.sfz-shot{margin:0;border-radius:var(--sf-radius-card);overflow:hidden;border:1px solid var(--sf-line);background:var(--sf-surface)}
.sfz-shot img{display:block;width:100%;height:auto}
/* product tabs, bento */
.sfz-ptabs__bar{display:flex;gap:8px;margin-bottom:16px;overflow-x:auto;scrollbar-width:none}
.sfz-ptabs__bar::-webkit-scrollbar{display:none}
.sfz-ptabs__bar button{flex:none;min-height:36px;padding:0 16px;border:1px solid var(--sf-line);border-radius:var(--radius-full);background:var(--sf-surface);color:var(--sf-text);font:inherit;font-size:var(--sf-fs-sm);text-transform:uppercase;letter-spacing:.03em;cursor:pointer}
.sfz-ptabs__bar button.is-on{border-color:var(--sf-primary);background:color-mix(in srgb,var(--sf-primary) 10%,var(--sf-surface));color:var(--sf-primary)}
.sfz-ptabs.is-underline .sfz-ptabs__bar{gap:20px;border-bottom:1px solid var(--sf-line)}
.sfz-ptabs.is-underline .sfz-ptabs__bar button{padding:0 2px;border:0;border-bottom:2px solid transparent;border-radius:0;background:none;text-transform:none;letter-spacing:0}
.sfz-ptabs.is-underline .sfz-ptabs__bar button.is-on{border-bottom-color:var(--sf-primary);background:none}
.sfz-ptabs__more{margin:16px 0 0;text-align:right}
.sfz-bento{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);grid-template-rows:auto auto;gap:var(--sf-gap)}
.sfz-bento__big{grid-row:span 2}
.sfz-bento__big .sf-card{height:100%}
.sfz-bento__big .sf-card__media{flex:1}
.sfz-bento__big .sf-card__img{aspect-ratio:auto;flex:1;min-height:320px}
.sfz-bento__top{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--sf-gap)}
.sfz-bento__low{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--sf-gap)}
/* deal panels */
.sfz-deal.is-tinted{display:flex;flex-direction:column;gap:16px;padding:20px;border:1px solid color-mix(in srgb,var(--sf-accent) 40%,transparent);border-radius:var(--sf-radius-card);background:color-mix(in srgb,var(--sf-accent) 7%,var(--sf-bg))}
.sfz-deal__head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px}
.sfz-deal__head h2{font-size:var(--sf-fs-h3)}
.sfz-deal__head p{margin:2px 0 0;color:var(--sf-muted)}
.sfz-deal__banner{display:block;width:100%;max-height:220px;object-fit:cover;border-radius:var(--sf-radius-card)}
.sfz-deal.is-dark,.sfz-deal.is-gradient{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2.4fr);border-radius:var(--sf-radius-card);overflow:hidden}
.sfz-deal.is-dark{background:var(--sf-surface);box-shadow:0 1px 3px rgba(15,23,42,.08)}
.sfz-deal__side{display:flex;flex-direction:column;justify-content:center;gap:14px;padding:28px}
.sfz-deal.is-dark .sfz-deal__side{background:radial-gradient(circle at 20% 0%,#1e3a8a,#0b1530 70%);color:#fff}
.sfz-deal.is-gradient{background:linear-gradient(110deg,var(--sf-sale),color-mix(in srgb,var(--sf-sale) 55%,#000));color:#fff}
.sfz-deal__side h2{font-size:var(--sf-fs-h2);text-transform:uppercase;line-height:1.15}
.sfz-deal.is-gradient .sfz-deal__side h2{font-size:var(--sf-fs-h1)}
.sfz-deal__side p{margin:0;opacity:.85}
.sfz-deal__side .sf-btn{align-self:flex-start;background:#0b0b0f;border-color:#0b0b0f;color:#fff}
.sfz-deal.is-dark .sfz-deal__side .sf-btn{background:#38bdf8;border-color:#38bdf8;color:#0b1530;border-radius:var(--radius-full)}
.sfz-deal__list{min-width:0;padding:16px 28px 16px 8px}
.sfz-deal__list .sfz-car__t{grid-auto-columns:calc((100% - 3 * var(--sf-gap)) / 4)}
.sfz-deal__list .sf-card{color:var(--sf-text)}
/* banner grid */
.sfz-banners{display:grid;gap:var(--sf-gap)}
.sfz-banners.is-two{grid-template-columns:repeat(2,minmax(0,1fr))}
.sfz-banners.is-three2{grid-template-columns:repeat(3,minmax(0,1fr))}
.sfz-banners.is-four{grid-template-columns:repeat(4,minmax(0,1fr))}
.sfz-banners.is-portrait3{grid-template-columns:repeat(3,minmax(0,1fr))}
.sfz-banners.is-mosaic{grid-template-columns:minmax(0,2fr) minmax(0,1fr);grid-template-rows:1fr 1fr}
.sfz-banners.is-mosaic .sfz-banner:first-child{grid-row:span 2}
.sfz-banner{position:relative;display:flex;align-items:flex-end;width:100%;min-width:0;min-height:160px;aspect-ratio:16/7;border-radius:var(--sf-radius-card);overflow:hidden;background:var(--sf-soft);color:var(--sf-text);text-decoration:none}
.sfz-banners.is-three2 .sfz-banner{aspect-ratio:16/9}
.sfz-banners.is-four .sfz-banner{aspect-ratio:1/1}
.sfz-banners.is-portrait3 .sfz-banner{aspect-ratio:3/4}
.sfz-banners.is-mosaic .sfz-banner{aspect-ratio:auto}
.sfz-banners.is-strip .sfz-banner{aspect-ratio:auto;min-height:120px;max-height:200px;height:16vw}
.sfz-banner>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
.sfz-banner:hover>img{transform:scale(1.03)}
.sfz-banner.has-img{color:#fff}
.sfz-banner.has-img .sfz-banner__t{background:linear-gradient(0deg,rgba(0,0,0,.55),rgba(0,0,0,0))}
.sfz-banner__t{position:relative;z-index:1;display:flex;flex-direction:column;gap:2px;width:100%;padding:16px 18px}
.sfz-banner__t b{font-family:var(--sf-font-head);font-size:var(--sf-fs-h3);font-weight:var(--weight-semibold)}
/* coupons */
.sfz-coupons__list{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,330px),1fr));gap:var(--sf-gap)}
.sfz-ticket{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.5fr);border:1px solid color-mix(in srgb,var(--sf-accent) 45%,var(--sf-line));border-radius:var(--sf-radius-card);background:var(--sf-surface);color:var(--sf-text);overflow:hidden}
.sfz-ticket::before,.sfz-ticket::after{content:"";position:absolute;left:calc(40% - 9px);width:18px;height:18px;border-radius:50%;background:var(--sf-bg);border:1px solid color-mix(in srgb,var(--sf-accent) 45%,var(--sf-line))}
.sfz-ticket::before{top:-10px}.sfz-ticket::after{bottom:-10px}
.sfz-ticket__a{display:flex;flex-direction:column;justify-content:center;gap:2px;padding:14px;border-right:2px dashed color-mix(in srgb,var(--sf-accent) 40%,var(--sf-line));text-align:center}
.sfz-ticket__a small{color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.sfz-ticket__a b{color:var(--sf-sale);font-size:var(--sf-fs-h3);line-height:1.15}
.sfz-ticket__b{display:flex;flex-direction:column;justify-content:space-between;gap:8px;padding:14px;font-size:var(--sf-fs-sm)}
.sfz-ticket__code{display:flex;align-items:center;justify-content:space-between;gap:8px}
.sfz-ticket__code code{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--sf-sale)}
.sfz-ticket__code button{min-height:32px;padding:0 14px;border:0;border-radius:var(--radius-full);background:#facc15;color:#0f172a;font:inherit;font-weight:var(--weight-semibold);cursor:pointer}
.sfz-coupons.is-panel{display:flex;flex-direction:column;gap:16px;padding:24px;border-radius:var(--sf-radius-card);background:linear-gradient(115deg,#1d4ed8,#0f766e);color:#fff}
.sfz-coupons__head{display:flex;align-items:center;gap:14px}
.sfz-coupons__head h2{font-size:var(--sf-fs-h3)}
.sfz-coupons__head p{margin:2px 0 0;opacity:.85}
.sfz-coupons.is-panel .sfz-ticket{border-color:transparent}
.sfz-coupons.is-panel .sfz-ticket::before,.sfz-coupons.is-panel .sfz-ticket::after{background:#1e5fa0;border-color:transparent}
/* quick links, steps, cta */
.sfz-qlinks{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:var(--sf-gap)}
.sfz-qlink{display:flex;align-items:center;gap:12px;padding:16px;border-radius:var(--sf-radius-card);background:var(--sf-surface);color:var(--sf-text);text-decoration:none;box-shadow:0 1px 3px rgba(15,23,42,.06)}
.sfz-qlink:hover{box-shadow:0 4px 14px rgba(15,23,42,.1)}
.sfz-qlink__ic{display:grid;place-items:center;flex:none;width:44px;height:44px;border-radius:50%;background:color-mix(in srgb,var(--sf-sale) 12%,var(--sf-surface));color:var(--sf-sale)}
.sfz-qlink b{display:block;font-weight:var(--weight-semibold)}
.sfz-qlink small{display:block;color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.sfz-qlinks.is-plain .sfz-qlink{flex-direction:column;text-align:center;background:none;box-shadow:none}
.sfz-steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:var(--sf-gap)}
.sfz-step{display:flex;flex-direction:column;gap:8px;padding:22px;border-radius:var(--sf-radius-card);background:var(--sf-surface);border:1px solid var(--sf-line)}
.sfz-step b{font-size:var(--sf-fs-lg);font-weight:var(--weight-semibold)}
.sfz-step p{margin:0;color:var(--sf-muted);line-height:1.6}
.sfz-step__n{font-family:var(--sf-font-head);font-size:var(--sf-fs-h1);font-weight:var(--weight-semibold);color:color-mix(in srgb,var(--sf-primary) 45%,transparent);line-height:1}
.sfz-steps.is-icons .sfz-step{align-items:center;text-align:center;border:0;background:none}
.sfz-step__ic{display:grid;place-items:center;width:64px;height:64px;border-radius:50%;background:var(--sf-soft);color:var(--sf-primary)}
.sfz-cta.is-card{display:flex;flex-direction:column;align-items:center;gap:12px;max-width:880px;margin:0 auto;padding:40px 24px;border-radius:var(--radius-2xl);background:linear-gradient(135deg,var(--sf-primary),color-mix(in srgb,var(--sf-primary) 55%,#000));background-size:cover;background-position:center;color:var(--sf-on-primary);text-align:center}
.sfz-cta.is-card.has-img{color:#fff}
.sfz-cta.is-card h2{font-size:var(--sf-fs-h2)}
.sfz-cta.is-card p{margin:0;opacity:.9;max-width:560px}
.sfz-cta.is-card .sf-btn{background:var(--sf-surface);color:var(--sf-text);border-color:var(--sf-surface)}
.sfz-cta.is-strip{display:flex;align-items:center;gap:16px;padding:20px 24px;border-radius:var(--sf-radius-card);background:linear-gradient(100deg,var(--sf-accent),var(--sf-primary));color:#fff}
.sfz-cta__ic{display:grid;place-items:center;flex:none}
.sfz-cta__t{flex:1;min-width:0}
.sfz-cta__t b{display:block;font-family:var(--sf-font-head);font-size:var(--sf-fs-h3)}
.sfz-cta__t small{opacity:.9}
.sfz-cta.is-strip .sf-btn{background:#f59e0b;border-color:#f59e0b;color:#1f2937;border-radius:var(--radius-full)}
/* reels, YouTube */
.sfz-reels{display:flex;align-items:center;gap:var(--sf-gap);overflow-x:auto;scrollbar-width:none;padding:6px 2px}
.sfz-reels::-webkit-scrollbar{display:none}
.sfz-reels.is-coverflow{justify-content:center}
.sfz-reel{flex:0 0 190px;margin:0;display:flex;flex-direction:column;gap:8px;border-radius:var(--sf-radius-card);background:var(--sf-surface);box-shadow:0 2px 10px rgba(15,23,42,.1);overflow:hidden;transition:transform .3s ease}
.sfz-reel.is-big{flex-basis:230px}
.sfz-reels.is-coverflow .sfz-reel:not(.is-big){transform:scale(.9)}
.sfz-reel__v{position:relative;aspect-ratio:9/16;background:#000}
.sfz-reel__v>*{position:absolute;inset:0;width:100%;height:100%;border:0}
.sfz-reel__v button{padding:0;background:none;cursor:pointer}
.sfz-reel__v img,.sfz-reel__v video{width:100%;height:100%;object-fit:cover}
.sfz-reel__v button span{position:absolute;left:50%;top:50%;display:grid;place-items:center;width:52px;height:52px;margin:-26px 0 0 -26px;border-radius:50%;background:rgba(255,255,255,.92);color:#0f172a}
.sfz-reel__p{display:flex;align-items:center;gap:8px;padding:0 10px 10px;color:var(--sf-text);text-decoration:none}
.sfz-reel__p>span:first-child{display:grid;place-items:center;flex:none;width:36px;height:36px;border-radius:var(--radius-md);overflow:hidden}
.sfz-reel__p img{width:100%;height:100%;object-fit:cover}
.sfz-reel__p>span:nth-child(2){flex:1;min-width:0}
.sfz-reel__p small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--sf-fs-sm)}
.sfz-reel__p b{font-size:var(--sf-fs-sm);color:var(--sf-sale)}
.sfz-yt{display:flex;flex-direction:column;gap:16px;padding:20px;border-radius:var(--sf-radius-card);background:var(--sf-surface);box-shadow:0 1px 3px rgba(15,23,42,.06)}
.sfz-yt__head{display:flex;align-items:center;gap:12px}
.sfz-yt__logo{display:grid;place-items:center;width:52px;height:52px;border-radius:50%;background:#0b0b0f;color:#fff}
.sfz-yt__head b{display:block;font-family:var(--sf-font-head);font-size:var(--sf-fs-lg)}
.sfz-yt__head small{color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.sfz-yt__sub{display:inline-flex;align-items:center;gap:6px;margin-left:auto;padding:6px 14px;border-radius:var(--radius-full);background:#dc2626;color:#fff;font-size:var(--sf-fs-sm);font-weight:var(--weight-semibold);text-decoration:none}
.sfz-yt__grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--sf-gap)}
.sfz-yt__v{display:flex;flex-direction:column;gap:6px;padding-bottom:10px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);overflow:hidden;color:var(--sf-text);text-decoration:none}
.sfz-yt__v>span{position:relative;aspect-ratio:16/9;background:#000}
.sfz-yt__v img{width:100%;height:100%;object-fit:cover}
.sfz-yt__v i{position:absolute;left:50%;top:50%;display:grid;place-items:center;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:rgba(255,255,255,.9);color:#0f172a}
.sfz-yt__v b{padding:0 10px;font-weight:var(--weight-semibold);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sfz-yt__v small{display:inline-flex;align-items:center;gap:4px;padding:0 10px;color:var(--sf-muted);font-size:var(--sf-fs-sm)}
/* outlet */
.sfz-outlet{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:var(--sf-gap);align-items:start}
.sfz-outlet.no-photos{grid-template-columns:minmax(0,1fr)}
.sfz-outlet__main{display:flex;flex-direction:column;gap:12px}
.sfz-outlet__tabs{display:flex;flex-wrap:wrap;gap:8px}
.sfz-outlet__tabs button{display:inline-flex;align-items:center;gap:6px;min-height:38px;padding:0 16px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-btn);background:var(--sf-surface);color:var(--sf-text);font:inherit;cursor:pointer}
.sfz-outlet__tabs button.is-on{background:#0b0b0f;border-color:#0b0b0f;color:#fff}
.sfz-outlet__map{position:relative;height:320px;border-radius:var(--sf-radius-card);overflow:hidden;background:var(--sf-soft)}
.sfz-outlet__map iframe{width:100%;height:100%;border:0}
.sfz-outlet__card{position:absolute;top:12px;left:12px;display:flex;flex-direction:column;gap:4px;max-width:250px;padding:12px;border-radius:var(--sf-radius);background:var(--sf-surface);color:var(--sf-text);box-shadow:0 4px 14px rgba(15,23,42,.18);font-size:var(--sf-fs-sm)}
.sfz-outlet__card small{color:var(--sf-muted)}
.sfz-outlet__card a{color:var(--sf-primary)}
.sfz-outlet__card .sf-btn{align-self:flex-start;margin-top:4px;color:var(--sf-on-primary)}
.sfz-outlet__send{display:flex;flex-direction:column;gap:6px;max-width:440px}
.sfz-outlet__send label{font-family:var(--sf-font-head);font-weight:var(--weight-semibold)}
.sfz-outlet__send span{display:flex;gap:8px}
.sfz-outlet__send .sf-input{flex:1}
.sfz-outlet__photos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.sfz-outlet__photos img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:var(--sf-radius)}
/* about text for search */
.sfz-seo{display:flex;flex-direction:column;gap:12px;color:var(--sf-muted)}
.sfz-seo__t{position:relative;max-height:120px;overflow:hidden}
.sfz-seo__t.is-open{max-height:none}
.sfz-seo__t:not(.is-open)::after{content:"";position:absolute;left:0;right:0;bottom:0;height:56px;background:linear-gradient(rgba(255,255,255,0),var(--sf-bg))}
.sfz-seo__t h3{margin:14px 0 6px!important;color:var(--sf-text);font-size:var(--sf-fs-lg)}
.sfz-seo__t p{margin:0 0 10px;line-height:1.7}
.sfz-seo__more{align-self:flex-start;padding:6px 14px;border:1px solid var(--sf-line);border-radius:var(--radius-full);background:var(--sf-surface);color:var(--sf-text);font:inherit;font-size:var(--sf-fs-sm);cursor:pointer}
.sfz-tags{display:flex;flex-wrap:wrap;align-items:center;gap:6px 4px;margin:0;font-size:var(--sf-fs-sm)}
.sfz-tags b{margin-right:6px;color:var(--sf-text)}
.sfz-tags a{color:var(--sf-muted);text-decoration:none}
.sfz-tags a:not(:last-child)::after{content:" |";color:var(--sf-line)}
.sfz-tags a:hover{color:var(--sf-primary)}
@media (max-width:899px){
  .sfz-deal.is-dark,.sfz-deal.is-gradient{grid-template-columns:minmax(0,1fr)}
  .sfz-deal__list{padding:12px}
  .sfz-deal__list .sfz-car__t,.sfz-car__t{grid-auto-columns:calc((100% - 12px) / 2.2)}
  .sfz-car.is-logos .sfz-car__t,.sfz-car.is-shots .sfz-car__t{grid-auto-columns:calc((100% - 12px) / 2.3)}
  .sfz-car__a{display:none}
  .sfz-bento{grid-template-columns:minmax(0,1fr)}
  .sfz-bento__big{grid-row:auto}
  .sfz-bento__low{grid-template-columns:repeat(2,minmax(0,1fr))}
  .sfz-banners.is-three2,.sfz-banners.is-four,.sfz-banners.is-portrait3{grid-template-columns:repeat(2,minmax(0,1fr))}
  .sfz-yt__grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .sfz-outlet{grid-template-columns:minmax(0,1fr)}
  .sfz-trust.is-dark{border-radius:var(--sf-radius-card)}
  .sfz-reels.is-coverflow{justify-content:flex-start}
}
@media (max-width:640px){
  .sfz-banners.is-two,.sfz-banners.is-mosaic{grid-template-columns:minmax(0,1fr)}
  .sfz-banners.is-mosaic{grid-template-rows:none}
  .sfz-banners.is-mosaic .sfz-banner:first-child{grid-row:auto}
  .sfz-bento__top{grid-template-columns:minmax(0,1fr)}
  .sfz-trust.is-columns{grid-template-columns:repeat(2,minmax(0,1fr))}
  .sfz-trust.is-columns .sfz-trust__i+.sfz-trust__i{border-left:0}
  .sfz-cta.is-strip{flex-wrap:wrap}
  .sfz-reel{flex-basis:160px}.sfz-reel.is-big{flex-basis:180px}
  .sfz-yt__head{flex-wrap:wrap}
}
`;
