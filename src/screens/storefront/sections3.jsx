'use client';
// Sections from WoodMart's e-commerce elements (Oct 2026), drawn on the shop's own data and the merchant's words:
//   hotspot (shop the look: pins on a picture open the product) · compare (before / after slider) · testimonials ·
//   team · timeline · counters (figures count up once on screen) · pricelist (repair / service prices) · marquee
//   (moving words) · gallery (grid, Instagram feed, masonry, mosaic, swipe) · table (rows split with |) · iconlist ·
//   social (the shop's social links, shopInfo.jsx) · spotlight (one product, big) · contact (form, map, ways to reach).
// moreBody3(s, v) returns a kind's body (undefined for kinds drawn elsewhere); TITLED3 = kinds with the usual title above.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { FileImg } from '@/components/files/FileParts';
import { variantOf } from '@/lib/storefront/layouts';
import { storeProducts } from '@/lib/storefront/catalog';
import { Price, Stars, addAndShow, buyNow, bdt } from './storeKit';
import { useShopInfo, SocialLinks, ContactChannels, ContactForm, ShopCards, mapEmbed, OpenBadge } from './shopInfo';

const prodOf = (id) => { try { return storeProducts().find((p) => p.id === id) || null; } catch { return null; } };
const initials = (n) => String(n || '?').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

// ---- shop the look ---------------------------------------------------------------------------------------------------------
function Hotspot({ s, v }) {
  const look = variantOf(s);
  const pins = (s.pins || []).map((x) => ({ ...x, p: prodOf(x.product) })).filter((x) => x.p);
  const [cur, setCur] = useState(0);
  if (!s.image) return null;
  const active = pins[cur] || pins[0];
  const card = (x) => (
    <a className="sft-pcard" href={x.p.href}>
      <span className="sft-pcard__pic" style={{ background: x.p.tbg }}>{x.p.img ? <img src={x.p.img} alt="" loading="lazy" /> : null}</span>
      <span className="sft-pcard__t"><b>{x.p.name}</b><Price price={x.p.price} mrp={x.p.mrp} /></span>
    </a>
  );
  const pic = (
    <div className="sft-hs__pic">
      <FileImg src={s.image} size="full" alt={s.title || ''} loading="lazy" />
      {pins.map((x, i) => (
        <button key={x.id || i} type="button" className={'sft-pin' + (i === cur ? ' is-on' : '')} style={{ left: (Number(x.x) || 50) + '%', top: (Number(x.y) || 50) + '%' }} aria-label={`${x.p.name}, ${bdt(x.p.price)}`} aria-pressed={i === cur} onClick={() => setCur(i)}>
          <span aria-hidden="true">{i + 1}</span>
        </button>
      ))}
      {look === 'full' && active ? <div className="sft-hs__pop" style={{ left: Math.min(70, Number(active.x) || 50) + '%', top: Math.min(64, (Number(active.y) || 50) + 6) + '%' }}>{card(active)}<button type="button" className="sf-btn sf-btn--sm" onClick={() => addAndShow(active.p, v)}>Add to cart</button></div> : null}
    </div>
  );
  if (look === 'full') return <div className="sft-hs is-full">{pic}</div>;
  if (look === 'card') {
    return (
      <div className="sft-hs is-card">
        {pic}
        {active ? (
          <div className="sft-hs__one">
            <span className="sft-hs__pic2" style={{ background: active.p.tbg }}>{active.p.img ? <img src={active.p.img} alt="" loading="lazy" /> : null}</span>
            <small>{active.p.brand}</small>
            <a href={active.p.href}><b>{active.p.name}</b></a>
            <Stars rating={active.p.rating} small />
            <Price price={active.p.price} mrp={active.p.mrp} big />
            <button type="button" className="sf-btn" onClick={() => addAndShow(active.p, v)}><Icon name="shopping-cart" width="16" height="16" aria-hidden="true" />Add to cart</button>
            {pins.length > 1 ? <span className="sft-hs__dots">{pins.map((x, i) => <button key={i} type="button" aria-label={`Product ${i + 1}`} aria-pressed={i === cur} onClick={() => setCur(i)} />)}</span> : null}
          </div>
        ) : null}
      </div>
    );
  }
  return (
    <div className="sft-hs is-side">
      {pic}
      <ol className="sft-hs__list">{pins.map((x, i) => <li key={x.id || i} className={i === cur ? 'is-on' : ''} onMouseEnter={() => setCur(i)}><span className="sft-hs__n" aria-hidden="true">{i + 1}</span>{card(x)}</li>)}</ol>
    </div>
  );
}

// ---- before and after ------------------------------------------------------------------------------------------------------
function Compare({ s }) {
  const look = variantOf(s);
  const [at, setAt] = useState(50);
  if (!s.before || !s.after) return null;
  const slider = (
    <div className="sft-ba" style={{ '--at': at + '%' }}>
      <FileImg className="sft-ba__img" src={s.after} size="full" alt={s.afterLabel || 'After'} loading="lazy" />
      <span className="sft-ba__before"><FileImg className="sft-ba__img" src={s.before} size="full" alt={s.beforeLabel || 'Before'} loading="lazy" /></span>
      <span className="sft-ba__line" aria-hidden="true"><i><Icon name="chevrons-left-right" width="18" height="18" /></i></span>
      {s.beforeLabel ? <em className="sft-ba__tag is-l">{s.beforeLabel}</em> : null}
      {s.afterLabel ? <em className="sft-ba__tag is-r">{s.afterLabel}</em> : null}
      <input type="range" min="0" max="100" value={at} onChange={(e) => setAt(Number(e.target.value))} aria-label={`Show more of ${s.beforeLabel || 'before'} or ${s.afterLabel || 'after'}`} />
    </div>
  );
  if (look === 'side') {
    return (
      <div className="sft-baside">
        <figure><FileImg src={s.before} size="md" alt="" loading="lazy" /><figcaption>{s.beforeLabel || 'Before'}</figcaption></figure>
        <figure><FileImg src={s.after} size="md" alt="" loading="lazy" /><figcaption>{s.afterLabel || 'After'}</figcaption></figure>
      </div>
    );
  }
  if (look === 'text') return <div className="sft-batext"><div><h2>{s.title}</h2>{s.text ? <p>{s.text}</p> : null}</div>{slider}</div>;
  return slider;
}

// ---- testimonials ----------------------------------------------------------------------------------------------------------
function Testimonials3({ s }) {
  const look = variantOf(s);
  const items = (s.items || []).filter((x) => x.text);
  const [cur, setCur] = useState(0);
  if (!items.length) return null;
  const stars = (x) => (x.stars ? <span className="sft-stars" role="img" aria-label={`${x.stars} out of 5 stars`}>{[1, 2, 3, 4, 5].map((i) => <Icon key={i} name="star" width="14" height="14" aria-hidden="true" className={i <= Number(x.stars) ? 'is-on' : ''} />)}</span> : null);
  const who = (x) => <figcaption>{x.photo ? <FileImg className="sft-av" src={x.photo} size="thumb" alt="" /> : <span className="sft-av" aria-hidden="true">{initials(x.name)}</span>}<span><b>{x.name}</b>{x.role ? <small>{x.role}</small> : null}</span></figcaption>;
  if (look === 'quote' || look === 'photo') {
    const x = items[cur % items.length];
    return (
      <div className={'sft-tq is-' + look}>
        {look === 'photo' ? <span className="sft-tq__pic">{x.photo ? <FileImg src={x.photo} size="md" alt="" loading="lazy" /> : <span aria-hidden="true">{initials(x.name)}</span>}</span> : null}
        <figure>
          <Icon name="quote" width="34" height="34" aria-hidden="true" className="sft-tq__mark" />
          {stars(x)}
          <blockquote>{x.text}</blockquote>
          {who(x)}
          {items.length > 1 ? <span className="sft-tq__nav"><button type="button" aria-label="Previous" onClick={() => setCur((c) => (c - 1 + items.length) % items.length)}><Icon name="chevron-left" width="18" height="18" /></button><span aria-live="polite">{(cur % items.length) + 1} / {items.length}</span><button type="button" aria-label="Next" onClick={() => setCur((c) => (c + 1) % items.length)}><Icon name="chevron-right" width="18" height="18" /></button></span> : null}
        </figure>
      </div>
    );
  }
  return <div className={'sft-tst is-' + look}>{items.map((x, i) => <figure key={x.id || i}>{stars(x)}<blockquote>{x.text}</blockquote>{who(x)}</figure>)}</div>;
}

// ---- team ---------------------------------------------------------------------------------------------------------------------
function Team({ s }) {
  const items = (s.items || []).filter((x) => x.name);
  if (!items.length) return null;
  return (
    <div className={'sft-team is-' + variantOf(s)}>
      {items.map((x, i) => (
        <figure key={x.id || i}>
          <span className="sft-team__pic">{x.photo ? <FileImg src={x.photo} size="md" alt="" loading="lazy" /> : <span aria-hidden="true">{initials(x.name)}</span>}</span>
          <figcaption><b>{x.name}</b>{x.role ? <small>{x.role}</small> : null}{x.text ? <p>{x.text}</p> : null}</figcaption>
        </figure>
      ))}
    </div>
  );
}

// ---- timeline -----------------------------------------------------------------------------------------------------------------
function Timeline({ s }) {
  const items = (s.items || []).filter((x) => x.title || x.year);
  if (!items.length) return null;
  return <ol className={'sft-tl is-' + variantOf(s)}>{items.map((x, i) => <li key={x.id || i}><span className="sft-tl__dot" aria-hidden="true" /><span className="sft-tl__y">{x.year}</span><div><b>{x.title}</b>{x.text ? <p>{x.text}</p> : null}</div></li>)}</ol>;
}

// ---- counters ----------------------------------------------------------------------------------------------------------------
function Count({ value }) {
  const ref = useRef(null);
  const raw = String(value).replace(/[^\d.]/g, '');
  const target = Number(raw) || 0;
  const dp = raw.includes('.') ? Math.min(2, raw.split('.')[1].length) : 0;
  const fmt = (x) => x.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
  const [n, setN] = useState(target);
  useEffect(() => {
    const el = ref.current;
    if (!el || !target || typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(target); return undefined; }
    setN(0);
    let raf = 0;
    const io = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t) => { const k = Math.min(1, (t - t0) / 1400); const f = 10 ** dp; setN(Math.round(target * (1 - Math.pow(1 - k, 3)) * f) / f); if (k < 1) raf = requestAnimationFrame(step); };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [target, dp]);
  return <b ref={ref}>{target ? fmt(n) : value}</b>;
}
function Counters({ s }) {
  const items = (s.items || []).filter((x) => x.value);
  if (!items.length) return null;
  const look = variantOf(s);
  return (
    <div className={'sft-cnt is-' + look}>
      {items.map((x, i) => (
        <div key={x.id || i}>
          {look === 'icons' && x.icon ? <span className="sfz-cnt__ic" aria-hidden="true"><Icon name={x.icon} width="22" height="22" /></span> : null}
          <span className="sft-cnt__n"><Count value={x.value} />{x.suffix ? <i>{x.suffix}</i> : null}</span>
          {x.label ? <small>{x.label}</small> : null}
        </div>
      ))}
    </div>
  );
}

// ---- price list -----------------------------------------------------------------------------------------------------------------
function PriceList({ s }) {
  const items = (s.items || []).filter((x) => x.title);
  if (!items.length) return null;
  const look = variantOf(s);
  const btn = s.button ? <p className="sft-pl__more"><a className="sf-btn" href={s.href || '/page?handle=contact-us'}>{s.button}</a></p> : null;
  if (look === 'table') {
    return <><div className="sft-pl__wrap"><table className="sft-pl is-table gc-table--keep"><thead><tr><th scope="col">Service</th><th scope="col">Price</th></tr></thead><tbody>{items.map((x, i) => <tr key={x.id || i}><th scope="row"><b>{x.title}</b>{x.tag ? <em>{x.tag}</em> : null}{x.text ? <small>{x.text}</small> : null}</th><td>{x.price}</td></tr>)}</tbody></table></div>{btn}</>;
  }
  return (
    <>
      <ul className={'sft-pl is-' + look}>
        {items.map((x, i) => (
          <li key={x.id || i}>
            <span className="sft-pl__t"><b>{x.title}</b>{x.tag ? <em>{x.tag}</em> : null}{x.text ? <small>{x.text}</small> : null}</span>
            {look === 'menu' ? <i className="sft-pl__dots" aria-hidden="true" /> : null}
            <span className="sft-pl__p">{x.price}</span>
          </li>
        ))}
      </ul>
      {btn}
    </>
  );
}

// ---- moving words --------------------------------------------------------------------------------------------------------------
function Marquee({ s }) {
  const words = String(s.text || '').split('\n').map((x) => x.trim()).filter(Boolean);
  if (!words.length) return null;
  const row = (hidden) => <span className="sft-mq__row" aria-hidden={hidden || undefined}>{words.map((w, i) => <React.Fragment key={i}><span>{w}</span>{s.icon ? <Icon name={s.icon} width="18" height="18" aria-hidden="true" /> : <i aria-hidden="true">•</i>}</React.Fragment>)}</span>;
  return <div className={'sft-mq is-' + variantOf(s) + ' sp-' + (s.speed || 'M')} role="marquee" aria-label={words.join(', ')}><div className="sft-mq__track">{row(false)}{row(true)}</div></div>;
}

// ---- gallery ---------------------------------------------------------------------------------------------------------------------
function Gallery({ s }) {
  const items = (s.items || []).filter((x) => x.image);
  if (!items.length) return null;
  const look = variantOf(s);
  const tile = (x, i) => {
    const inner = <><FileImg src={x.image} size={look === 'mosaic' && !i ? 'full' : 'md'} alt={x.caption || ''} loading="lazy" />{look === 'instagram' ? <span className="sft-gal__ig" aria-hidden="true"><Icon name="instagram" width="22" height="22" /></span> : null}{x.caption && look !== 'instagram' ? <span className="sft-gal__cap">{x.caption}</span> : null}</>;
    return x.href ? <a key={x.id || i} className="sft-gal__it" href={x.href} target={/^https?:/.test(x.href) ? '_blank' : undefined} rel={/^https?:/.test(x.href) ? 'noopener noreferrer' : undefined}>{inner}</a> : <span key={x.id || i} className="sft-gal__it">{inner}</span>;
  };
  return (
    <div className={'sft-gal is-' + look}>
      <div className="sft-gal__grid">{items.slice(0, look === 'mosaic' ? 5 : 12).map(tile)}</div>
      {s.button && s.href ? <p className="sft-gal__more"><a className="sf-btn sf-btn--line" href={s.href} target={/^https?:/.test(s.href) ? '_blank' : undefined} rel="noopener noreferrer">{look === 'instagram' ? <Icon name="instagram" width="16" height="16" aria-hidden="true" /> : null}{s.button}</a></p> : null}
    </div>
  );
}

// ---- table -------------------------------------------------------------------------------------------------------------------
function Table3({ s }) {
  const rows = String(s.rows || '').split('\n').map((l) => l.split('|').map((c) => c.trim())).filter((r) => r.some(Boolean));
  if (rows.length < 2) return null;
  const [head, ...body] = rows;
  return (
    <>
      <div className="sft-tbl__wrap" tabIndex={0} role="region" aria-label={s.title || 'Table'}>
        <table className={'sft-tbl gc-table--keep is-' + variantOf(s)}>
          <thead><tr>{head.map((c, i) => <th key={i} scope="col">{c}</th>)}</tr></thead>
          <tbody>{body.map((r, i) => <tr key={i}>{head.map((_, j) => (j ? <td key={j}>{r[j] === 'yes' || r[j] === '✓' ? <Icon name="check" width="16" height="16" aria-label="Yes" /> : r[j] === 'no' ? <Icon name="minus" width="16" height="16" aria-label="No" /> : r[j] || ''}</td> : <th key={j} scope="row">{r[j] || ''}</th>))}</tr>)}</tbody>
        </table>
      </div>
      {s.button && s.href ? <p className="sft-pl__more"><a className="sf-btn" href={s.href}>{s.button}</a></p> : null}
    </>
  );
}

// ---- icon list -------------------------------------------------------------------------------------------------------------
function IconList({ s }) {
  const items = (s.items || []).filter((x) => x.title);
  if (!items.length) return null;
  const look = variantOf(s);
  return <ul className={'sft-il is-' + look}>{items.map((x, i) => <li key={x.id || i}><span className="sfz-ilist__ic" aria-hidden="true"><Icon name={look === 'check' ? 'check' : x.icon || 'check'} width="18" height="18" /></span><span><b>{x.title}</b>{x.text ? <small>{x.text}</small> : null}</span></li>)}</ul>;
}

// ---- social ----------------------------------------------------------------------------------------------------------------
function Social3({ s }) {
  const info = useShopInfo();
  if (!info) return null;
  const look = variantOf(s);
  if (look === 'cards') return <SocialLinks socials={info.socials} whatsapp={info.whatsapp} look="list" />;
  return (
    <div className={'sft-soc is-' + look}>
      {look === 'band' ? <div><b>{s.title}</b>{s.sub ? <small>{s.sub}</small> : null}</div> : null}
      <span className="sft-soc__row">{[...info.socials, { k: 'whatsapp', label: 'WhatsApp', href: info.whatsapp }].map((x) => <a key={x.k} href={x.href} target="_blank" rel="noopener noreferrer" aria-label={x.label}><Icon name={x.k === 'whatsapp' ? 'message-circle' : x.k === 'tiktok' ? 'music-2' : x.k} width="22" height="22" aria-hidden="true" /></a>)}</span>
    </div>
  );
}

// ---- one product, big ---------------------------------------------------------------------------------------------------------
function Spotlight({ s, v }) {
  const p = prodOf(s.product) || (() => { try { return storeProducts().find((x) => x.img) || null; } catch { return null; } })();
  if (!p) return null;
  const look = variantOf(s);
  const points = (s.points || []).map((x) => x.title).filter(Boolean);
  const facts = points.length ? points : (p.keys || []).map(([k, x]) => `${k}: ${x}`);
  const out = p.stock <= 0 && !p.oversell;
  return (
    <div className={'sft-spot is-' + look}>
      <a className="sft-spot__pic" href={p.href} style={{ background: look === 'dark' ? 'transparent' : p.tbg }}>{s.image ? <FileImg src={s.image} size="full" alt={p.name} loading="lazy" /> : p.img ? <img src={p.img} alt={p.name} loading="lazy" /> : <span aria-hidden="true">{p.name.slice(0, 1)}</span>}</a>
      <div className="sft-spot__t">
        {p.brand ? <small>{p.brand}</small> : null}
        <h2>{s.title || p.name}</h2>
        <Stars rating={p.rating} small />
        {s.text ? <p>{s.text}</p> : null}
        {facts.length ? <ul>{facts.slice(0, 5).map((f) => <li key={f}><Icon name="check" width="16" height="16" aria-hidden="true" />{f}</li>)}</ul> : null}
        <Price price={p.price} mrp={p.mrp} big />
        <span className="sft-spot__btns">
          <button type="button" className="sf-btn" disabled={out} onClick={() => buyNow(p, v)}>{out ? 'Out of stock' : s.button || 'Buy now'}</button>
          <button type="button" className="sf-btn sf-btn--line" disabled={out} onClick={() => addAndShow(p, v)}><Icon name="shopping-cart" width="16" height="16" aria-hidden="true" />Add to cart</button>
        </span>
      </div>
    </div>
  );
}

// ---- contact ---------------------------------------------------------------------------------------------------------------------
function Contact3({ s }) {
  const info = useShopInfo();
  if (!info) return null;
  const look = variantOf(s);
  if (look === 'reach') return <ContactChannels info={info} />;
  if (look === 'map') {
    const shop = info.shops[0];
    return (
      <div className="sft-ct is-map">
        <iframe title={'Map: ' + shop.name} src={mapEmbed(shop)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        <div className="sft-ct__side"><OpenBadge hours={info.hours} /><ShopCards shops={info.shops} title="" lead="" /></div>
      </div>
    );
  }
  return <div className="sft-ct is-form"><ContactForm info={info} /><ContactChannels info={info} /></div>;
}

export function moreBody3(s, v) {
  switch (s.type) {
    case 'hotspot': return <Hotspot s={s} v={v} />;
    case 'compare': return <Compare s={s} />;
    case 'testimonials': return <Testimonials3 s={s} />;
    case 'team': return <Team s={s} />;
    case 'timeline': return <Timeline s={s} />;
    case 'counters': return <Counters s={s} />;
    case 'pricelist': return <PriceList s={s} />;
    case 'marquee': return <Marquee s={s} />;
    case 'gallery': return <Gallery s={s} />;
    case 'table': return <Table3 s={s} />;
    case 'iconlist': return <IconList s={s} />;
    case 'social': return <Social3 s={s} />;
    case 'spotlight': return <Spotlight s={s} v={v} />;
    case 'contact': return <Contact3 s={s} />;
    default: return undefined;
  }
}
/** Kinds with the usual title above their body; a look that places its own title is in OWN_HEAD3. */
export const TITLED3 = ['hotspot', 'compare', 'testimonials', 'team', 'timeline', 'counters', 'pricelist', 'gallery', 'table', 'iconlist', 'social', 'contact'];
export const OWN_HEAD3 = ['compare:text', 'social:band'];

export const SECTIONS3_CSS = `
/* shop the look */
.sft-hs{display:grid;gap:var(--sf-gap)}
.sft-hs.is-side{grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);align-items:start}
.sft-hs.is-card{grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);align-items:stretch}
/* the picture keeps its own shape inside its column (stretching its height would widen it over the card) */
.sft-hs .sft-hs__pic{width:100%;min-width:0;align-self:start}
.sft-hs.is-card .sft-hs__one{min-width:0}
.sft-hs.is-card .sft-hs__pic2{aspect-ratio:4/3;max-height:280px}
.sft-hs__pic{position:relative;display:grid;grid-template:minmax(0,1fr)/minmax(0,1fr);aspect-ratio:4/3;border-radius:var(--sf-radius-card);overflow:hidden;background:var(--sf-soft)}
.sft-hs.is-full .sft-hs__pic{aspect-ratio:16/8}
.sft-hs__pic>img{width:100%;height:100%;object-fit:cover}
.sft-pin{position:absolute;z-index:1;display:grid;place-items:center;width:34px;height:34px;margin:-17px 0 0 -17px;padding:0;border:0;border-radius:50%;background:var(--sf-surface);color:var(--sf-text);font:inherit;font-size:var(--sf-fs-sm);font-weight:var(--weight-semibold);box-shadow:0 0 0 6px color-mix(in srgb,var(--sf-surface) 45%,transparent),0 6px 16px rgba(0,0,0,.25);cursor:pointer;transition:transform .2s ease}
.sft-pin::after{content:"";position:absolute;inset:-6px;border-radius:50%;border:2px solid var(--sf-surface);opacity:.7;animation:sft-ping 2s ease-out infinite}
.sft-pin.is-on{background:var(--sf-primary);color:var(--sf-on-primary);transform:scale(1.1)}
@keyframes sft-ping{from{transform:scale(.8);opacity:.8}to{transform:scale(1.7);opacity:0}}
.sft-hs__pop{position:absolute;z-index:2;display:flex;flex-direction:column;gap:8px;width:min(260px,70%);padding:10px;border-radius:var(--sf-radius-card);background:var(--sf-surface);box-shadow:0 18px 40px -12px rgba(0,0,0,.4)}
.sft-hs__list{display:flex;flex-direction:column;gap:8px;margin:0;padding:0;list-style:none}
.sft-hs__list li{display:flex;align-items:center;gap:10px;padding:8px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface);transition:border-color .2s ease}
.sft-hs__list li.is-on{border-color:var(--sf-primary)}
.sft-hs__n{display:grid;place-items:center;flex:none;width:28px;height:28px;border-radius:50%;background:var(--sf-soft);color:var(--sf-primary);font-weight:var(--weight-semibold);font-size:var(--sf-fs-sm)}
.sft-pcard{display:flex;align-items:center;gap:10px;min-width:0;color:var(--sf-text);text-decoration:none}
.sft-pcard__pic{display:grid;grid-template:minmax(0,1fr)/minmax(0,1fr);flex:none;width:64px;height:64px;border-radius:var(--sf-radius);overflow:hidden}
.sft-pcard__pic img{width:100%;height:100%;object-fit:contain}
.sft-pcard__t{display:flex;flex-direction:column;gap:2px;min-width:0}
.sft-pcard__t b{display:-webkit-box;overflow:hidden;font-weight:var(--weight-medium);font-size:var(--sf-fs-sm);line-height:1.3;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.sft-hs__one{display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:18px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.sft-hs__one a{color:var(--sf-text);text-decoration:none}
.sft-hs__one small{color:var(--sf-muted)}
.sft-hs__pic2{display:grid;grid-template:minmax(0,1fr)/minmax(0,1fr);width:100%;aspect-ratio:1/1;border-radius:var(--sf-radius);overflow:hidden}
.sft-hs__pic2 img{width:100%;height:100%;object-fit:contain}
.sft-hs__dots{display:flex;gap:6px;margin-top:auto}
.sft-hs__dots button{width:24px;height:24px;padding:0;border:0;background:none;cursor:pointer;position:relative}
.sft-hs__dots button::after{content:"";position:absolute;inset:8px;border-radius:50%;background:var(--sf-line)}
.sft-hs__dots button[aria-pressed="true"]::after{background:var(--sf-primary)}
/* before and after */
.sft-ba{position:relative;display:grid;grid-template:minmax(0,1fr)/minmax(0,1fr);aspect-ratio:16/9;border-radius:var(--sf-radius-card);overflow:hidden;background:var(--sf-soft);user-select:none}
.sft-ba__img{grid-area:1/1;width:100%;height:100%;object-fit:cover}
.sft-ba__before{grid-area:1/1;display:grid;grid-template:minmax(0,1fr)/minmax(0,1fr);clip-path:inset(0 calc(100% - var(--at)) 0 0)}
.sft-ba__line{position:absolute;top:0;bottom:0;left:var(--at);width:2px;margin-left:-1px;background:var(--sf-surface);pointer-events:none}
.sft-ba__line i{position:absolute;top:50%;left:50%;display:grid;place-items:center;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:var(--sf-surface);color:var(--sf-text);box-shadow:0 4px 14px rgba(0,0,0,.25)}
.sft-ba__tag{position:absolute;top:12px;padding:3px 10px;border-radius:var(--radius-full);background:rgba(15,23,42,.65);color:#fff;font-style:normal;font-size:var(--sf-fs-sm);pointer-events:none}
.sft-ba__tag.is-l{left:12px}.sft-ba__tag.is-r{right:12px}
.sft-ba input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:ew-resize}
.sft-ba:has(input:focus-visible) .sft-ba__line i{outline:2px solid var(--sf-primary);outline-offset:2px}
.sft-baside{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--sf-gap)}
.sft-baside figure{position:relative;display:grid;grid-template:minmax(0,1fr)/minmax(0,1fr);aspect-ratio:4/3;margin:0;border-radius:var(--sf-radius-card);overflow:hidden}
.sft-baside img{width:100%;height:100%;object-fit:cover}
.sft-baside figcaption{position:absolute;left:12px;top:12px;padding:3px 10px;border-radius:var(--radius-full);background:rgba(15,23,42,.65);color:#fff;font-size:var(--sf-fs-sm)}
.sft-batext{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr);gap:clamp(20px,4vw,48px);align-items:center}
.sft-batext h2{margin:0 0 12px!important;font-size:var(--sf-fs-h2)}
.sft-batext p{margin:0;color:var(--sf-muted);font-size:var(--sf-fs-lg);line-height:1.6}
/* testimonials */
.sft-tst{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr));gap:var(--sf-gap)}
.sft-tst figure,.sft-tq figure{display:flex;flex-direction:column;gap:12px;margin:0;padding:clamp(18px,2.4vw,26px);border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.sft-tst blockquote{flex:1;margin:0;line-height:1.6;overflow-wrap:anywhere}
.sft-tst figcaption,.sft-tq figcaption{display:flex;align-items:center;gap:10px}
.sft-tst figcaption>span:last-child,.sft-tq figcaption>span:last-child{display:flex;flex-direction:column;min-width:0}
.sft-tst small,.sft-tq figcaption small{color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.sft-av{display:grid;place-items:center;flex:none;width:44px;height:44px;border-radius:50%;object-fit:cover;background:var(--sf-soft);color:var(--sf-primary);font-weight:var(--weight-semibold);font-size:var(--sf-fs-sm)}
.sft-stars{display:inline-flex;gap:2px;color:var(--sf-line)}
.sft-stars svg{fill:currentColor}
.sft-stars .is-on{color:var(--sf-star,#f59e0b)}
.sft-tst.is-carousel{grid-auto-flow:column;grid-template-columns:none;grid-auto-columns:minmax(min(84%,320px),1fr);overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding-bottom:4px}
.sft-tst.is-carousel figure{scroll-snap-align:start}
.sft-tst.is-wall{display:block;columns:3 260px;column-gap:var(--sf-gap)}
.sft-tst.is-wall figure{break-inside:avoid;margin-bottom:var(--sf-gap)}
.sft-tst.is-wall figure:nth-child(3n+2){background:var(--sf-soft);border-color:transparent}
.sft-tq{display:grid;justify-items:center}
.sft-tq figure{position:relative;align-items:center;max-width:760px;border:0;background:none;text-align:center}
.sft-tq blockquote{margin:0;font-family:var(--sf-font-head);font-size:clamp(20px,2.4vw,28px);line-height:1.4;letter-spacing:var(--sf-head-track,0)}
.sft-tq__mark{color:var(--sf-primary);opacity:.35}
.sft-tq__nav{display:flex;align-items:center;gap:12px}
.sft-tq__nav button{display:grid;place-items:center;width:44px;height:44px;border:1px solid var(--sf-line);border-radius:50%;background:var(--sf-surface);color:var(--sf-text);cursor:pointer}
.sft-tq.is-photo{grid-template-columns:minmax(0,1fr) minmax(0,1.4fr);align-items:center;gap:clamp(20px,4vw,56px)}
.sft-tq.is-photo figure{align-items:flex-start;text-align:left;padding:0}
.sft-tq__pic{display:grid;grid-template:minmax(0,1fr)/minmax(0,1fr);place-items:center;width:100%;aspect-ratio:4/5;border-radius:var(--sf-radius-card);overflow:hidden;background:var(--sf-soft);font-size:var(--sf-fs-h1);color:var(--sf-primary)}
.sft-tq__pic img{width:100%;height:100%;object-fit:cover}
/* team */
.sft-team{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,220px),1fr));gap:var(--sf-gap)}
.sft-team figure{display:flex;flex-direction:column;gap:12px;margin:0}
.sft-team__pic{display:grid;grid-template:minmax(0,1fr)/minmax(0,1fr);place-items:center;aspect-ratio:4/5;border-radius:var(--sf-radius-card);overflow:hidden;background:var(--sf-soft);color:var(--sf-primary);font-size:var(--sf-fs-h1);font-weight:var(--weight-semibold)}
.sft-team__pic img{width:100%;height:100%;object-fit:cover}
.sft-team figcaption{display:flex;flex-direction:column;gap:2px}
.sft-team figcaption b{font-family:var(--sf-font-head);font-size:var(--sf-fs-lg);font-weight:var(--sf-head-w,600)}
.sft-team figcaption small{color:var(--sf-primary);font-size:var(--sf-fs-sm)}
.sft-team figcaption p{margin:6px 0 0;color:var(--sf-muted);font-size:var(--sf-fs-sm);line-height:1.55}
.sft-team.is-circles{text-align:center}
.sft-team.is-circles .sft-team__pic{width:min(180px,80%);margin:0 auto;aspect-ratio:1/1;border-radius:50%}
.sft-team.is-overlay figure{position:relative}
.sft-team.is-overlay figcaption{position:absolute;left:10px;right:10px;bottom:10px;padding:12px;border-radius:var(--sf-radius);background:color-mix(in srgb,var(--sf-surface) 92%,transparent);backdrop-filter:blur(6px)}
.sft-team.is-overlay figcaption p{display:none}
.sft-team.is-list{grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr))}
.sft-team.is-list figure{flex-direction:row;align-items:center}
.sft-team.is-list .sft-team__pic{flex:none;width:72px;aspect-ratio:1/1;border-radius:50%;font-size:var(--sf-fs-lg)}
/* timeline */
.sft-tl{position:relative;display:flex;flex-direction:column;gap:22px;margin:0;padding:0;list-style:none}
.sft-tl li{position:relative;display:grid;gap:4px 16px}
.sft-tl__y{font-family:var(--sf-font-head);font-weight:var(--sf-head-w,600);font-size:var(--sf-fs-h3);color:var(--sf-primary)}
.sft-tl li b{font-size:var(--sf-fs-lg)}
.sft-tl li p{margin:4px 0 0;color:var(--sf-muted);line-height:1.6}
.sft-tl__dot{width:14px;height:14px;border-radius:50%;background:var(--sf-primary);box-shadow:0 0 0 5px color-mix(in srgb,var(--sf-primary) 18%,transparent)}
.sft-tl.is-left{padding-left:28px}
.sft-tl.is-left::before{content:"";position:absolute;left:6px;top:6px;bottom:6px;width:2px;background:var(--sf-line)}
.sft-tl.is-left .sft-tl__dot{position:absolute;left:-28px;top:6px}
.sft-tl.is-vertical::before{content:"";position:absolute;left:50%;top:0;bottom:0;width:2px;margin-left:-1px;background:var(--sf-line)}
.sft-tl.is-vertical li{grid-template-columns:minmax(0,1fr) 14px minmax(0,1fr);align-items:start;gap:4px 28px}
.sft-tl.is-vertical .sft-tl__dot{grid-column:2;grid-row:1;margin-top:8px}
.sft-tl.is-vertical .sft-tl__y{grid-column:1;grid-row:1;text-align:right}
.sft-tl.is-vertical li>div{grid-column:3;grid-row:1}
.sft-tl.is-vertical li:nth-child(even) .sft-tl__y{grid-column:3;text-align:left}
.sft-tl.is-vertical li:nth-child(even)>div{grid-column:1;text-align:right}
.sft-tl.is-row{flex-direction:row;gap:var(--sf-gap);overflow-x:auto;padding-top:8px;scrollbar-width:thin}
.sft-tl.is-row::before{content:"";position:absolute;left:0;right:0;top:15px;height:2px;background:var(--sf-line)}
.sft-tl.is-row li{flex:1 0 200px;grid-template-rows:auto auto auto}
.sft-tl.is-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,230px),1fr))}
.sft-tl.is-cards li{padding:18px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.sft-tl.is-cards .sft-tl__dot{display:none}
/* counters */
.sft-cnt{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,170px),1fr));gap:var(--sf-gap);text-align:center}
.sft-cnt>div{display:flex;flex-direction:column;align-items:center;gap:6px}
.sft-cnt__n{display:inline-flex;align-items:baseline;gap:2px;font-family:var(--sf-font-head);font-size:clamp(30px,4vw,48px);font-weight:var(--sf-head-w,600);line-height:1;color:var(--sf-primary);font-variant-numeric:tabular-nums}
.sft-cnt__n i{font-style:normal;font-size:.6em}
.sft-cnt small{color:var(--sf-muted)}
.sft-cnt.is-cards>div{padding:24px 16px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.sft-cnt.is-band{padding:clamp(24px,4vw,44px);border-radius:var(--sf-radius-card);background:var(--sf-primary);color:var(--sf-on-primary)}
.sft-cnt.is-band .sft-cnt__n,.sft-cnt.is-band small{color:inherit}
.sft-cnt.is-band small{opacity:.85}
.sfz-cnt__ic{display:grid;place-items:center;width:var(--sf-icon-tile,44px);height:var(--sf-icon-tile,44px);border-radius:50%;background:var(--sf-soft);color:var(--sf-primary)}
/* price list */
.sft-pl{display:grid;gap:4px 28px;margin:0;padding:0;list-style:none}
.sft-pl li{display:flex;align-items:baseline;gap:10px;padding:12px 0}
.sft-pl__t{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 8px;min-width:0}
.sft-pl__t b{font-weight:var(--weight-semibold)}
.sft-pl__t small{flex-basis:100%;color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.sft-pl em,.sft-pl.is-table em{padding:1px 8px;border-radius:var(--radius-full);background:color-mix(in srgb,var(--sf-sale) 12%,var(--sf-surface));color:var(--sf-sale);font-style:normal;font-size:var(--sf-fs-sm)}
.sft-pl__dots{flex:1;min-width:24px;border-bottom:2px dotted var(--sf-line);transform:translateY(-4px)}
.sft-pl__p{flex:none;font-weight:var(--weight-semibold);color:var(--sf-primary);font-variant-numeric:tabular-nums}
.sft-pl.is-menu{max-width:860px}
.sft-pl.is-two{grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))}
.sft-pl.is-two li{justify-content:space-between;border-bottom:1px solid var(--sf-line)}
.sft-pl.is-cards{grid-template-columns:repeat(auto-fill,minmax(min(100%,220px),1fr));gap:var(--sf-gap)}
.sft-pl.is-cards li{flex-direction:column;align-items:flex-start;gap:12px;padding:20px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.sft-pl.is-cards .sft-pl__p{font-size:var(--sf-fs-h3)}
.sft-pl__wrap,.sft-tbl__wrap{overflow-x:auto;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.sft-pl.is-table,.sft-tbl{width:100%;border-collapse:collapse}
.sft-pl.is-table :is(th,td),.sft-tbl :is(th,td){padding:12px 16px;border-bottom:1px solid var(--sf-line);text-align:left;vertical-align:top}
.sft-pl.is-table thead th,.sft-tbl thead th{background:var(--sf-soft);font-size:var(--sf-fs-sm);color:var(--sf-muted);font-weight:var(--weight-medium)}
.sft-pl.is-table tbody th{display:flex;flex-wrap:wrap;gap:4px 8px;font-weight:var(--weight-regular)}
.sft-pl.is-table tbody th small{flex-basis:100%;color:var(--sf-muted)}
.sft-pl.is-table td{text-align:right;font-weight:var(--weight-semibold);color:var(--sf-primary);white-space:nowrap}
.sft-pl__more,.sft-gal__more{margin:16px 0 0;text-align:center}
/* moving words */
.sft-mq{overflow:hidden;padding:14px 0;mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)}
.sft-mq__track{display:flex;width:max-content;animation:sft-mq 32s linear infinite}
.sft-mq.sp-S .sft-mq__track{animation-duration:52s}.sft-mq.sp-F .sft-mq__track{animation-duration:18s}
.sft-mq:hover .sft-mq__track{animation-play-state:paused}
.sft-mq__row{display:flex;align-items:center;gap:28px;padding-right:28px;white-space:nowrap;font-family:var(--sf-font-head);font-size:clamp(18px,2vw,24px);font-weight:var(--sf-head-w,600)}
.sft-mq__row i{font-style:normal;opacity:.5}
.sft-mq__row svg{flex:none;color:var(--sf-accent)}
@keyframes sft-mq{to{transform:translateX(-50%)}}
.sft-mq.is-band,.sft-mq.is-tilted{border-radius:var(--sf-radius-card);background:var(--sf-primary);color:var(--sf-on-primary);mask-image:none}
.sft-mq.is-band .sft-mq__row svg,.sft-mq.is-tilted .sft-mq__row svg{color:inherit;opacity:.8}
.sft-mq.is-tilted{margin:12px -8px;border-radius:0;transform:rotate(-1.6deg)}
.sft-mq.is-outline .sft-mq__row{font-size:clamp(36px,6vw,72px);color:transparent;-webkit-text-stroke:1.5px var(--sf-text);text-transform:uppercase}
.sft-mq.is-outline .sft-mq__row svg{width:32px;height:32px}
@media (prefers-reduced-motion:reduce){.sft-mq__track{animation:none;flex-wrap:wrap;width:auto}.sft-mq__row[aria-hidden]{display:none}.sft-mq__row{white-space:normal;flex-wrap:wrap}}
/* gallery */
.sft-gal__grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(46%,200px),1fr));gap:calc(var(--sf-gap) * .6)}
.sft-gal__it{position:relative;display:grid;grid-template:minmax(0,1fr)/minmax(0,1fr);aspect-ratio:1/1;border-radius:var(--sf-radius);overflow:hidden;background:var(--sf-soft);color:#fff;text-decoration:none}
.sft-gal__it img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}
.sft-gal__it:hover img{transform:scale(1.05)}
.sft-gal__cap{position:absolute;left:0;right:0;bottom:0;padding:24px 12px 10px;background:linear-gradient(transparent,rgba(0,0,0,.65));font-size:var(--sf-fs-sm)}
.sft-gal__ig{position:absolute;inset:0;display:grid;place-items:center;background:rgba(15,23,42,.35);opacity:0;transition:opacity .2s ease}
.sft-gal__it:hover .sft-gal__ig,.sft-gal__it:focus-visible .sft-gal__ig{opacity:1}
.sft-gal.is-instagram .sft-gal__grid{grid-template-columns:repeat(6,minmax(0,1fr));gap:6px}
.sft-gal.is-instagram .sft-gal__it{border-radius:0}
.sft-gal.is-masonry .sft-gal__grid{display:block;columns:4 200px;column-gap:calc(var(--sf-gap) * .6)}
.sft-gal.is-masonry .sft-gal__it{margin-bottom:calc(var(--sf-gap) * .6);break-inside:avoid}
.sft-gal.is-masonry .sft-gal__it:nth-child(3n+1){aspect-ratio:3/4}
.sft-gal.is-masonry .sft-gal__it:nth-child(3n+2){aspect-ratio:4/3}
.sft-gal.is-mosaic .sft-gal__grid{grid-template-columns:repeat(4,minmax(0,1fr))}
.sft-gal.is-mosaic .sft-gal__it:first-child{grid-column:span 2;grid-row:span 2}
.sft-gal.is-carousel .sft-gal__grid{grid-auto-flow:column;grid-template-columns:none;grid-auto-columns:minmax(min(70%,260px),1fr);overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
.sft-gal.is-carousel .sft-gal__it{aspect-ratio:4/5;scroll-snap-align:start}
/* table */
.sft-tbl tbody tr:nth-child(even) :is(th,td){background:color-mix(in srgb,var(--sf-soft) 60%,transparent)}
.sft-tbl tbody th{font-weight:var(--weight-medium)}
.sft-tbl td svg{color:var(--sf-primary)}
.sft-tbl.is-lined tbody tr :is(th,td){background:none!important}
.sft-tbl.is-cards :is(th,td):nth-child(2){background:color-mix(in srgb,var(--sf-primary) 7%,var(--sf-surface))!important;font-weight:var(--weight-semibold)}
.sft-tbl.is-cards thead th:nth-child(2){background:var(--sf-primary);color:var(--sf-on-primary)}
/* icon list */
.sft-il{display:grid;gap:14px 28px;margin:0;padding:0;list-style:none}
.sft-il li{display:flex;align-items:flex-start;gap:12px}
.sft-il li>span:last-child{display:flex;flex-direction:column;gap:2px;padding-top:4px}
.sft-il small{color:var(--sf-muted)}
.sfz-ilist__ic{display:grid;place-items:center;flex:none;width:36px;height:36px;border-radius:50%;background:var(--sf-soft);color:var(--sf-primary)}
.sft-il.is-two{grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))}
.sft-il.is-check{max-width:720px}
.sft-il.is-check .sfz-ilist__ic{width:26px;height:26px;border-radius:var(--sf-radius);background:var(--sf-primary);color:var(--sf-on-primary)}
.sft-il.is-check li>span:last-child{padding-top:1px}
.sft-il.is-boxed{grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:var(--sf-gap)}
.sft-il.is-boxed li{padding:16px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.sft-il.is-inline{display:flex;flex-wrap:wrap;justify-content:center;gap:12px 28px}
.sft-il.is-inline li{align-items:center}
.sft-il.is-inline small{display:none}
.sft-il.is-inline li>span:last-child{padding-top:0}
/* social */
.sft-soc{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:16px 28px}
.sft-soc__row{display:flex;flex-wrap:wrap;gap:12px}
.sft-soc__row a{display:grid;place-items:center;width:56px;height:56px;border-radius:50%;background:var(--sf-soft);color:var(--sf-primary);transition:transform .2s ease,background .2s ease}
.sft-soc__row a:hover{transform:translateY(-3px);background:var(--sf-primary);color:var(--sf-on-primary)}
.sft-soc.is-band{justify-content:space-between;padding:clamp(20px,3vw,32px);border-radius:var(--sf-radius-card);background:var(--sf-primary);color:var(--sf-on-primary)}
.sft-soc.is-band>div{display:flex;flex-direction:column;gap:4px}
.sft-soc.is-band b{font-family:var(--sf-font-head);font-size:var(--sf-fs-h3);font-weight:var(--sf-head-w,600)}
.sft-soc.is-band small{opacity:.85}
.sft-soc.is-band .sft-soc__row a{background:rgba(255,255,255,.14);color:inherit}
/* spotlight */
.sft-spot{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(20px,5vw,64px);align-items:center}
.sft-spot__pic{display:grid;grid-template:minmax(0,1fr)/minmax(0,1fr);place-items:center;aspect-ratio:1/1;border-radius:var(--sf-radius-card);overflow:hidden;color:var(--sf-text);font-size:var(--sf-fs-h1);text-decoration:none}
.sft-spot__pic img{width:100%;height:100%;object-fit:contain}
.sft-spot__t{display:flex;flex-direction:column;align-items:flex-start;gap:12px}
.sft-spot__t>small{color:var(--sf-muted);text-transform:uppercase;letter-spacing:.08em;font-size:var(--sf-fs-sm)}
.sft-spot__t h2{margin:0!important;font-size:var(--sf-fs-h2);line-height:1.1}
.sft-spot__t p{margin:0;color:var(--sf-muted);font-size:var(--sf-fs-lg);line-height:1.6}
.sft-spot__t ul{display:flex;flex-direction:column;gap:8px;margin:0;padding:0;list-style:none}
.sft-spot__t li{display:flex;align-items:center;gap:8px}
.sft-spot__t li svg{flex:none;color:var(--sf-primary)}
.sft-spot__btns{display:flex;flex-wrap:wrap;gap:10px}
.sft-spot.is-reverse .sft-spot__pic{order:2}
.sft-spot.is-center{grid-template-columns:minmax(0,1fr);justify-items:center;text-align:center}
.sft-spot.is-center .sft-spot__pic{width:min(420px,100%)}
.sft-spot.is-center .sft-spot__t{align-items:center}
.sft-spot.is-dark{padding:clamp(20px,4vw,48px);border-radius:var(--sf-radius-card);background:#0b1020;color:#f8fafc}
.sft-spot.is-dark .sft-spot__t p,.sft-spot.is-dark .sft-spot__t>small,.sft-spot.is-dark .sf-price s{color:rgba(248,250,252,.7)}
.sft-spot.is-dark .sft-spot__pic{order:2;background:radial-gradient(circle at 50% 45%,color-mix(in srgb,var(--sf-primary) 45%,transparent),transparent 65%)}
.sft-spot.is-dark .sf-btn--line{color:#f8fafc}
/* contact */
.sft-ct.is-form{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:var(--sf-gap);align-items:start}
.sft-ct.is-form .shi-ch{grid-template-columns:minmax(0,1fr)}
.sft-ct.is-map{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:var(--sf-gap);align-items:start}
.sft-ct.is-map iframe{width:100%;height:100%;min-height:360px;border:0;border-radius:var(--sf-radius-card);background:var(--sf-soft)}
.sft-ct__side{display:flex;flex-direction:column;gap:12px}
.sft-ct__side .shi-shops{margin:0;padding:0}
.sft-ct__side .shi-head{display:none}
.sft-ct__side .shi-shops__grid{grid-template-columns:minmax(0,1fr)}
@media (max-width:900px){
  .sft-hs.is-side,.sft-hs.is-card,.sft-batext,.sft-tq.is-photo,.sft-spot,.sft-ct.is-form,.sft-ct.is-map{grid-template-columns:minmax(0,1fr)}
  .sft-spot.is-reverse .sft-spot__pic,.sft-spot.is-dark .sft-spot__pic{order:0}
  .sft-tl.is-vertical::before{left:7px}
  .sft-tl.is-vertical li{grid-template-columns:14px minmax(0,1fr);gap:4px 16px}
  .sft-tl.is-vertical .sft-tl__dot{grid-column:1;grid-row:1 / span 2}
  .sft-tl.is-vertical .sft-tl__y,.sft-tl.is-vertical li:nth-child(even) .sft-tl__y{grid-column:2;grid-row:1;text-align:left}
  .sft-tl.is-vertical li>div,.sft-tl.is-vertical li:nth-child(even)>div{grid-column:2;grid-row:2;text-align:left}
  .sft-gal.is-instagram .sft-gal__grid{grid-template-columns:repeat(3,minmax(0,1fr))}
}
@media (max-width:640px){
  .sft-hs.is-full .sft-hs__pic{aspect-ratio:4/3}
  .sft-ba{aspect-ratio:4/3}
  .sft-baside{grid-template-columns:minmax(0,1fr)}
  .sft-tst:not(.is-wall){grid-auto-flow:column;grid-template-columns:none;grid-auto-columns:86%;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
  .sft-tst:not(.is-wall) figure{scroll-snap-align:start}
  .sft-team{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
  .sft-team.is-list{grid-template-columns:minmax(0,1fr)}
  .sft-cnt{grid-template-columns:repeat(2,minmax(0,1fr))}
  .sft-gal.is-mosaic .sft-gal__grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .sft-pl.is-cards{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .sft-pl.is-cards li{padding:14px}
  .sft-spot__btns{width:100%}
  .sft-spot__btns .sf-btn{flex:1 1 140px}
  .sft-soc.is-band{flex-direction:column;align-items:flex-start}
}
@media (prefers-reduced-motion:reduce){.sft-pin::after{animation:none}}
`;
