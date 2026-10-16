'use client';
// LandingView — one landing page drawn from its parts (lib/landingParts.js). The landing page builder shows it as the
// live preview (editing: a click selects a part, buttons don't act, the order form shows what it would do) and /lp
// shows it to customers. It sizes itself by its own width (container queries), so the builder's phone preview and a
// real phone look the same. The order form is real on the live page: it makes a cash-on-delivery order through
// orderLinks.addOrder (Orders, source "Landing page", the page's id kept on the order), with the quantity offer, the
// variant, the delivery charge for the area (Settings › Delivery) and free delivery over the page's amount.
// The page is drawn inside the store theme (.sf-theme, with the page's accent, font, corners and colours), so a part can
// also be any section of the store's library (isStorePart: drawn by sections.jsx › Section with its looks and Style tab).
// Every part takes the Style / Advanced settings (box: spacing, background, pattern, colours, fonts, show per device,
// animation) and an "Order now" button under it. In the builder the page runs in a preview frame (?preview=1&edit=1):
// a click selects a part (selectInEditor), the selected one is outlined (previewValue('select')).
// The visit's ad source (utm_*, fbclid, gclid) is kept for the session and saved on the order (`utm`; attribution.js).

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { formatBDT } from '@/lib/format';
import { partType, partLabel, isStorePart, factsOf, productReviews, PAGE_STYLE } from '@/lib/landingParts';
import { fontPair, onColour, themeValues, themeVars, themeClasses, fontHref, TOKENS_CSS } from '@/lib/storefront/theme';
import { boxProps, BOX_CSS } from '@/lib/storefront/styles';
import { isEditing, selectInEditor, previewValue, SF_EVENT } from '@/lib/storefront/store';
import { useFileSrc } from '@/lib/files';
import { allProducts, getSavedProducts } from '@/lib/products';
import { getCatalog } from '@/lib/stock';
import { Section, SECTIONS_CSS } from './sections';
import { SECTIONS2_CSS } from './sections2';
import { SECTIONS3_CSS } from './sections3';
import { LOOKS_CSS, FIT_CSS } from './sectionLooks';
import { SF_CSS } from './storeKit';
import { rateOf, feeFor } from '@/lib/deliveryRates';
import { addOrder, prettyPhone } from '@/lib/orderLinks';
import { announceNewOrder } from '@/lib/orderFlow';
import { saveCustomerOnce, ADDED_FROM } from '@/lib/customers';
import { addressText } from '@/lib/bdAreas';
import { AreaPicker } from '@/components/AreaPicker';
import { businessProfile } from '@/lib/businessProfile';
import { FileImg } from '@/components/files/FileParts';

const tk = (n) => formatBDT(Math.round(Number(n) || 0));
const digits = (t) => String(t || '').replace(/\D/g, '').replace(/^88(?=01)/, '');
const PHONE_RE = /^01[3-9]\d{8}$/;
const THEME = {
  light: { bg: '#ffffff', surface: '#f8fafc', text: '#0f172a', muted: '#5b6678', line: '#e2e8f0' },
  warm: { bg: '#fbf7f0', surface: '#ffffff', text: '#1f1a14', muted: '#6b6156', line: '#ebe3d6' },
  dark: { bg: '#0b1020', surface: '#141a2e', text: '#f1f5f9', muted: '#a3adc2', line: '#26304a' },
};
const RAD = { sharp: '2px', soft: '10px', round: '18px' };
const ytId = (u) => { const m = /(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/.exec(String(u || '')); return m ? m[1] : ''; };
const Pic = ({ src, alt }) => (src ? (/^gcfile:/.test(src) ? <FileImg src={src} size="full" alt={alt || ''} /> : <img src={src} alt={alt || ''} loading="lazy" />) : null);

/** The page's look as CSS variables. */
export function lpVars(style) {
  const s = { ...PAGE_STYLE, ...(style || {}) };
  const t = THEME[s.theme] || THEME.light;
  const fp = fontPair(s.font);
  return { '--lp-accent': s.accent, '--lp-on': onColour(s.accent), '--lp-bg': t.bg, '--lp-surface': t.surface, '--lp-text': t.text, '--lp-muted': t.muted, '--lp-line': t.line, '--lp-r': RAD[s.corners] || RAD.round,
    '--lp-head': `${fp.head},"Hind Siliguri",system-ui,sans-serif`, '--lp-body': `${fp.body},"Hind Siliguri",system-ui,sans-serif`, '--lp-hw': fp.hw || 700 };
}
/** The store theme values the page's sections are drawn with: the shop's theme, with the page's own look on top. */
export function lpTheme(style) {
  const s = { ...PAGE_STYLE, ...(style || {}) };
  const t = THEME[s.theme] || THEME.light;
  let base = {};
  try { base = themeValues(); } catch { base = {}; }
  return { ...base, primary: s.accent, accent: s.accent, fontPair: s.font, corners: s.corners, bg: t.bg, surface: t.surface, text: t.text };
}

// ---- the visit's ad source -------------------------------------------------------------------------------------------
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id', 'fbclid', 'gclid'];
const UTM_STORE = 'gc.lp.utm';
/** Keep the ad parameters of the first page of this visit (a later page without them doesn't wipe them). */
function captureUtm() {
  try {
    const q = new URLSearchParams(window.location.search);
    const got = Object.fromEntries(UTM_KEYS.map((k) => [k, (q.get(k) || '').slice(0, 200)]).filter(([, v]) => v));
    if (Object.keys(got).length) window.sessionStorage.setItem(UTM_STORE, JSON.stringify({ ...got, at: Date.now(), page: window.location.pathname + window.location.search.replace(/[?&](fbclid|gclid)=[^&]*/g, '') }));
  } catch { /* ignore */ }
}
const readUtm = () => { try { return JSON.parse(window.sessionStorage.getItem(UTM_STORE)) || null; } catch { return null; } };
/** Where the order came from, from the ad source (Orders › Source). */
function sourceOf(utm) {
  const src = String((utm && utm.utm_source) || '').toLowerCase();
  if (utm && utm.fbclid && !src) return 'Facebook';
  if (/^(ig|instagram)/.test(src)) return 'Instagram';
  if (/^(fb|facebook|meta|an|msg|messenger)/.test(src)) return 'Facebook';
  if (/tiktok/.test(src)) return 'TikTok';
  if (/whatsapp|wa$/.test(src)) return 'WhatsApp';
  return 'Website';
}

export const lpFontHref = (style) => { const fp = fontPair({ ...PAGE_STYLE, ...(style || {}) }.font); return fp.q ? 'https://fonts.googleapis.com/css2?' + fp.q + '&display=swap' : ''; };

function Countdown({ hours, pageId, compact }) {
  const [left, setLeft] = useState(null);
  useEffect(() => {
    const key = 'gc.lp.timer.' + pageId;
    let start = 0;
    try { start = Number(window.localStorage.getItem(key)) || 0; if (!start) { start = Date.now(); window.localStorage.setItem(key, String(start)); } } catch { start = Date.now(); }
    const end = start + (Number(hours) || 24) * 36e5;
    const tick = () => setLeft(Math.max(0, Math.floor((end - Date.now()) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [hours, pageId]);
  if (left == null) return null;
  const parts = [[Math.floor(left / 3600), 'hrs'], [Math.floor((left % 3600) / 60), 'min'], [left % 60, 'sec']];
  return <span className={'lp-clock' + (compact ? ' is-compact' : '')} role="timer" aria-label={`${parts[0][0]} hours ${parts[1][0]} minutes left`}>{parts.map(([n, l]) => <span key={l}><b>{String(n).padStart(2, '0')}</b><small>{l}</small></span>)}</span>;
}

/** The order form's offers: one product in different quantities (tiers) or several products / combos (choices). */
export function offersOf(part, product, products) {
  if (!part) return [];
  if (part.mode === 'choices') {
    return (part.choices || []).map((c, i) => {
      const p = (products || []).find((x) => x.id === c.product) || (!c.product ? product : null);
      const qty = Math.max(1, Number(c.qty) || 1);
      const price = Number(c.price) || (p ? Number(p.price) * qty : 0);
      if (!p || !(price > 0)) return null;
      const pf = factsOf(p);
      const mrp = Number(c.mrp) || (pf && pf.mrp ? pf.mrp * qty : 0);
      return { key: c.id || 'c' + i, label: c.label || p.name, product: p, qty, price, mrp: mrp > price ? mrp : 0, tag: c.tag || '', image: c.image || (pf && pf.photos[0]) || '', note: c.note || '' };
    }).filter(Boolean);
  }
  const f = factsOf(product);
  return (part.tiers || []).filter((t) => Number(t.qty) > 0 && Number(t.price) > 0).map((t, i) => {
    const list = f ? f.price * Number(t.qty) : 0;
    return { key: t.id || 't' + i, label: t.label, product, qty: Number(t.qty), price: Number(t.price), mrp: list > Number(t.price) ? list : 0, tag: t.tag || '', image: (f && f.photos[0]) || '', note: '' };
  });
}

function OrderForm({ part, page, product, f, editing, preview, offers, pick, setPick }) {
  const choices = part.mode === 'choices';
  const tiers = offers;
  const tier = Math.min(Math.max(0, pick == null ? (tiers.length > 1 && !choices ? 1 : 0) : pick), Math.max(0, tiers.length - 1));
  const setTier = setPick;
  const [qty, setQty] = useState(1);
  const [v, setV] = useState({ name: '', phone: '', district: '', area: '', zone: '', line: '', note: '', variant: (f && f.variants[0]) || '' });
  const [err, setErr] = useState({});
  const [done, setDone] = useState(null);
  const t = tiers.length ? tiers[tier] : null;
  const units = t ? Number(t.qty) : qty;
  const sub = t ? Number(t.price) : (f ? f.price : 0) * qty;
  const lineProduct = (t && t.product) || product;
  const lf = lineProduct === product ? f : factsOf(lineProduct);
  const list = (lf ? lf.price : 0) * units;
  const freeAt = Number(part.freeAt) || 0;
  const rate = v.zone ? rateOf(v.zone) : null;
  const fee = rate ? (freeAt && sub >= freeAt ? 0 : feeFor(rate.id, units)) : 0;
  const total = sub + fee;
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    if (editing) return;
    const bad = {};
    if (!v.name.trim()) bad.name = 'Write your name.';
    if (!PHONE_RE.test(digits(v.phone))) bad.phone = 'Write an 11-digit mobile number, like 01712345678.';
    if (!v.district || !v.area) bad.area = 'Choose your district and area.';
    if (v.line.trim().length < 4) bad.line = 'Write your house, road or village.';
    setErr(bad);
    if (Object.keys(bad).length) { const el = document.getElementById('lpf-' + Object.keys(bad)[0]); if (el) el.focus(); return; }
    if (!lineProduct) { setDone({ id: '', total }); return; }
    if (preview) { setDone({ id: '', total, preview: true }); return; }
    const variant = !choices ? (lineProduct.variants || []).find((x) => x.name === v.variant) || null : null;
    const address = addressText({ line: v.line.trim(), area: v.area, district: v.district });
    // the list price per unit; an offer cheaper than the list is a discount, a dearer one (a priced combo) is its own price
    const unit = list > sub || !units ? (lf ? lf.price : sub) : Math.round((sub / units) * 100) / 100;
    const utm = readUtm();
    const row = addOrder({
      lines: [{ name: (choices && t ? t.label : lineProduct.name) + (variant ? ' (' + variant.name + ')' : ''), qty: units, price: unit, listPrice: lf ? lf.price : unit, sku: (variant && variant.sku) || lineProduct.sku, cat: lineProduct.cat, variant: variant ? variant.name : '', productId: lineProduct.id }],
      customer: v.name.trim(), phone: prettyPhone(digits(v.phone)), zone: rate ? rate.label : '', address, shipping: fee, total, status: 'New', payment: 'COD', channel: 'Online store', source: sourceOf(utm), method: 'COD',
      discount: Math.max(0, Math.round(list - sub)), discountReason: t && list > sub ? 'Landing page offer: ' + t.label : '', note: [v.note.trim(), 'Landing page: ' + page.title].filter(Boolean).join(' · '),
      district: v.district, thana: v.area, tags: ['Landing page'], more: { landingPage: page.id, ...(utm ? { utm } : {}) },
    });
    if (!row.duplicate) {
      try { announceNewOrder(row.id); } catch { /* ignore */ }
      try { saveCustomerOnce({ name: v.name.trim(), phone: digits(v.phone), address, types: ['Online'], addedFrom: ADDED_FROM.order }); } catch { /* ignore */ }
    }
    setDone({ id: row.id, total: row.amount || total, dup: !!row.duplicate });
  };
  if (done) {
    return (
      <div className="lp-done" role="status">
        <span className="lp-done__ic" aria-hidden="true"><Icon name="check" width="28" height="28" /></span>
        <h3>{done.dup ? 'Order already placed' : done.preview ? 'Preview: no order was made' : 'Order placed'}{done.id ? ' · ' + done.id : ''}</h3>
        <p>{done.preview ? 'This is a draft preview. On the live page this makes a cash-on-delivery order.' : part.thanks}</p>
        <p className="lp-done__sum">{tk(done.total)} · cash on delivery</p>
        {done.id ? <a className="lp-btn is-line" href={'/track?id=' + encodeURIComponent(done.id)}>Track the order</a> : null}
      </div>
    );
  }
  const field = (k, label, input) => <label className={'lp-f' + (err[k] ? ' is-bad' : '')} htmlFor={'lpf-' + k}><span>{label}</span>{input}{err[k] ? <small id={'lpf-e-' + k}>{err[k]}</small> : null}</label>;
  const a = (k) => ({ id: 'lpf-' + k, value: v[k], onChange: set(k), 'aria-invalid': err[k] ? true : undefined, 'aria-describedby': err[k] ? 'lpf-e-' + k : undefined, tabIndex: editing ? -1 : undefined });
  return (
    <form className="lp-form" onSubmit={submit} noValidate>
      {tiers.length ? (
        <div className="lp-tiers" role="radiogroup" aria-label="How many">
          {tiers.map((x, i) => (
            <button key={x.key} type="button" role="radio" aria-checked={tier === i} className={'lp-tier' + (choices ? ' has-pic' : '')} onClick={() => setTier(i)} tabIndex={editing ? -1 : undefined}>
              {x.tag ? <em>{x.tag}</em> : null}
              <i aria-hidden="true" />
              {choices && x.image ? <span className="lp-tier__pic"><Pic src={x.image} alt="" /></span> : null}
              <span><b>{x.label}</b>{x.note ? <small>{x.note}</small> : x.mrp > x.price ? <small>Save {tk(x.mrp - x.price)}</small> : null}</span>
              <strong>{x.mrp > x.price && choices ? <s>{tk(x.mrp)}</s> : null}{tk(x.price)}</strong>
            </button>
          ))}
        </div>
      ) : (
        <div className="lp-qty"><span>Quantity</span><span className="lp-qty__b"><button type="button" aria-label="One less" onClick={() => setQty((n) => Math.max(1, n - 1))}><Icon name="minus" width="16" height="16" /></button><b aria-live="polite">{qty}</b><button type="button" aria-label="One more" onClick={() => setQty((n) => Math.min(10, n + 1))}><Icon name="plus" width="16" height="16" /></button></span></div>
      )}
      {!choices && part.variants && f && f.variants.length > 1 ? field('variant', 'Variant', <select {...a('variant')}>{f.variants.map((x) => <option key={x}>{x}</option>)}</select>) : null}
      <div className="lp-row2">
        {field('name', 'Your name', <input {...a('name')} autoComplete="name" />)}
        {field('phone', 'Mobile number', <input {...a('phone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" />)}
      </div>
      <div className={'lp-f lp-area' + (err.area ? ' is-bad' : '')} id="lpf-area" tabIndex={-1}>
        <AreaPicker idPrefix="lpf-ap" district={v.district} area={v.area} onChange={(x) => setV((y) => ({ ...y, district: x.district, area: x.area, zone: x.zone }))} selectClass="lp-in" labelClass="lp-lbl" required gap="12px" />
        {err.area ? <small>{err.area}</small> : null}
      </div>
      {field('line', 'House, road or village', <input {...a('line')} autoComplete="street-address" />)}
      {part.note ? field('note', 'Note (optional)', <input {...a('note')} placeholder="A colour, a time to call…" />) : null}
      <dl className="lp-sum">
        <div><dt>Products</dt><dd>{tk(sub)}{list > sub ? <s>{tk(list)}</s> : null}</dd></div>
        <div><dt>Delivery{rate ? ' · ' + rate.label : ''}</dt><dd>{!rate ? 'Choose your area' : fee ? tk(fee) : 'Free'}</dd></div>
        {freeAt && sub < freeAt ? <div className="is-hint"><dt>Free delivery from {tk(freeAt)}</dt><dd /></div> : null}
        <div className="is-total"><dt>Total, pay on delivery</dt><dd>{tk(total)}</dd></div>
      </dl>
      <button type="submit" className="lp-btn is-big" tabIndex={editing ? -1 : undefined}><Icon name="shopping-bag" width="18" height="18" aria-hidden="true" />{part.button} · {tk(total)}</button>
      <p className="lp-form__note"><Icon name="shield-check" width="14" height="14" aria-hidden="true" />Check the parcel before you pay. We call to confirm every order.</p>
    </form>
  );
}

/** Scroll to the order form (a click on any "Order now"); in the builder buttons don't act. */
const goOrder = (editing) => (e) => { if (editing) { e.preventDefault(); return; } const el = document.getElementById('lp-order'); if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } };

function ProofSlider({ photos }) {
  const ref = React.useRef(null);
  const by = (d) => { const el = ref.current; if (el) el.scrollBy({ left: d * el.clientWidth * 0.8, behavior: 'smooth' }); };
  return (
    <div className="lp-slider">
      <div className="lp-slider__track" ref={ref}>{photos.map((x, i) => <figure key={x.id || i}><Pic src={x.image} alt={x.caption || ''} />{x.caption ? <figcaption>{x.caption}</figcaption> : null}</figure>)}</div>
      {photos.length > 1 ? <><button type="button" className="lp-slider__a is-prev" aria-label="Previous photos" onClick={() => by(-1)}><Icon name="chevron-left" width="20" height="20" aria-hidden="true" /></button><button type="button" className="lp-slider__a is-next" aria-label="Next photos" onClick={() => by(1)}><Icon name="chevron-right" width="20" height="20" aria-hidden="true" /></button></> : null}
    </div>
  );
}

function PartBody({ part, page, product, f, editing, preview, reviews, shop, offers, pick, setPick, orderPart }) {
  const go = goOrder(editing);
  const photo = part.image || (f && f.photos[0]) || '';
  switch (part.type) {
    case 'announce':
      return <div className={'lp-ann is-' + (part.tone || 'accent')}><span>{part.text}</span>{part.timer ? <Countdown hours={part.hours} pageId={page.id} compact /> : null}</div>;
    case 'hero':
      return (
        <div className={'lp-hero is-' + (part.layout || 'split')}>
          <div className="lp-hero__t">
            {part.badge ? <span className="lp-badge">{part.badge}</span> : null}
            <h1>{part.title || (f && f.name)}</h1>
            {part.showRating && f && f.rating.count ? <span className="lp-rating"><span aria-hidden="true">{'★★★★★'.slice(0, Math.round(f.rating.avg))}</span>{f.rating.avg.toFixed(1)} · {f.rating.count} reviews</span> : null}
            {part.sub ? <p className="lp-hero__sub">{part.sub}</p> : null}
            {part.showPrice && f ? <div className="lp-price"><b>{tk(f.price)}</b>{f.mrp ? <s>{tk(f.mrp)}</s> : null}{f.pct ? <em>−{f.pct}%</em> : null}</div> : null}
            {part.offer ? <p className="lp-offer"><Icon name="gift" width="16" height="16" aria-hidden="true" />{part.offer}</p> : null}
            {part.button ? <a className="lp-btn is-big" href="#lp-order" onClick={go}>{part.button}<Icon name="arrow-down" width="18" height="18" aria-hidden="true" /></a> : null}
            {part.chips ? <ul className="lp-chips"><li><Icon name="banknote" width="15" height="15" aria-hidden="true" />Cash on delivery</li><li><Icon name="truck" width="15" height="15" aria-hidden="true" />Delivery all over Bangladesh</li><li><Icon name="shield-check" width="15" height="15" aria-hidden="true" />Official warranty</li></ul> : null}
          </div>
          {photo ? <div className="lp-hero__pic"><Pic src={photo} alt={f ? f.name : ''} /></div> : null}
        </div>
      );
    case 'countdown':
      return <div className="lp-cd"><b>{part.title}</b><Countdown hours={part.hours} pageId={page.id} />{part.note ? <small>{part.note}</small> : null}</div>;
    case 'benefits': {
      const items = (part.items || []).filter((x) => x.title);
      if (!items.length) return null;
      return <>{part.title ? <h2>{part.title}</h2> : null}<ul className={'lp-ben is-' + (part.layout || 'cards')}>{items.map((x, i) => <li key={x.id || i}><span className="lp-ben__ic" aria-hidden="true"><Icon name={part.layout === 'list' ? 'check' : x.icon || 'check'} width="20" height="20" /></span><span><b>{x.title}</b>{x.text ? <small>{x.text}</small> : null}</span></li>)}</ul></>;
    }
    case 'problem':
      return (
        <div className={'lp-prob is-' + (part.side || 'right')}>
          <div>{part.title ? <h2>{part.title}</h2> : null}{part.text ? <p>{part.text}</p> : null}{(part.points || []).filter((x) => x.title).length ? <ul>{part.points.filter((x) => x.title).map((x, i) => <li key={x.id || i}><Icon name="check" width="16" height="16" aria-hidden="true" />{x.title}</li>)}</ul> : null}</div>
          {photo ? <div className="lp-prob__pic"><Pic src={photo} alt="" /></div> : null}
        </div>
      );
    case 'gallery': {
      const pics = [...(f ? f.photos : []), ...(part.items || []).map((x) => x.image)].filter(Boolean).slice(0, 8);
      if (!pics.length) return null;
      return <>{part.title ? <h2>{part.title}</h2> : null}<div className="lp-gal">{pics.map((src, i) => <span key={src + i}><Pic src={src} alt={f ? f.name + ' photo ' + (i + 1) : ''} /></span>)}</div></>;
    }
    case 'video': {
      const id = ytId(part.url);
      if (!id) return editing ? <p className="lp-empty">Add a YouTube link to show the video.</p> : null;
      return <>{part.title ? <h2>{part.title}</h2> : null}<div className="lp-video"><iframe title={part.title || 'Video'} src={`https://www.youtube-nocookie.com/embed/${id}`} loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen /></div>{part.text ? <p className="lp-center">{part.text}</p> : null}</>;
    }
    case 'specs': {
      const rows = String(part.rows || '').trim() ? String(part.rows).split('\n').map((l) => l.split(':')).filter((x) => x[0].trim()).map(([k, ...r]) => [k.trim(), r.join(':').trim()]) : (f ? f.keys : []);
      if (!rows.length) return null;
      return <>{part.title ? <h2>{part.title}</h2> : null}<dl className="lp-specs">{rows.map(([k, x], i) => <div key={i}><dt>{k}</dt><dd>{x}</dd></div>)}</dl></>;
    }
    case 'compare': {
      const rows = String(part.rows || '').split('\n').map((x) => x.trim()).filter(Boolean);
      if (!rows.length) return null;
      return (
        <>{part.title ? <h2>{part.title}</h2> : null}
          <table className="lp-cmp gc-table--keep"><thead><tr><th scope="col"><span className="sr-only">What you get</span></th><th scope="col" className="is-us">{part.us}</th><th scope="col">{part.them}</th></tr></thead>
            <tbody>{rows.map((r, i) => { const both = r.startsWith('!'); return <tr key={i}><th scope="row">{r.replace(/^!\s*/, '')}</th><td className="is-us"><Icon name="check" width="18" height="18" aria-label="Yes" /></td><td>{both ? <Icon name="check" width="18" height="18" aria-label="Yes" /> : <Icon name="x" width="18" height="18" aria-label="No" />}</td></tr>; })}</tbody>
          </table></>
      );
    }
    case 'reviews': {
      const list = part.source === 'own' ? (part.items || []).filter((x) => x.text).map((x) => ({ ...x, stars: Number(x.stars) || 5 })) : reviews.slice(0, Number(part.count) || 3);
      if (!list.length) return editing ? <p className="lp-empty">No published reviews of this product yet. Switch to “My own list” or add reviews in Products › Reviews.</p> : null;
      return <>{part.title ? <h2>{part.title}</h2> : null}<div className="lp-revs">{list.map((r, i) => <figure key={r.id || i}><span className="lp-stars" role="img" aria-label={r.stars + ' out of 5 stars'}>{'★★★★★'.slice(0, r.stars)}<i>{'★★★★★'.slice(r.stars)}</i></span><blockquote>{r.text}</blockquote><figcaption>{r.name}{r.verified ? ' · Verified buyer' : ''}</figcaption></figure>)}</div></>;
    }
    case 'guarantee':
      return <div className="lp-guar"><span className="lp-guar__ic" aria-hidden="true"><Icon name="shield-check" width="30" height="30" /></span><div><h2>{part.title}</h2><p>{part.text}</p></div></div>;
    case 'order':
      return <div id="lp-order" className="lp-order"><h2>{part.title}</h2>{part.sub ? <p className="lp-center lp-muted">{part.sub}</p> : null}<OrderForm part={part} page={page} product={product} f={f} editing={editing} preview={preview} offers={offers} pick={pick} setPick={setPick} /></div>;
    case 'offers': {
      if (!offers.length) return editing ? <p className="lp-empty">Offer cards show the order form’s offers. Add quantity offers or offers to the Order form part.</p> : null;
      return (<>
        {part.title ? <h2>{part.title}</h2> : null}{part.sub ? <p className="lp-center lp-muted">{part.sub}</p> : null}
        <div className={'lp-offers is-' + (part.look || 'cards')}>
          {offers.map((x, i) => (
            <div key={x.key} className={'lp-offer-card' + (pick === i ? ' is-on' : '')}>
              {x.tag ? <em className="lp-offer-card__tag">{x.tag}</em> : null}
              {x.image ? <span className="lp-offer-card__pic"><Pic src={x.image} alt="" /></span> : null}
              <span className="lp-offer-card__t"><b>{x.label}</b>{x.note ? <small>{x.note}</small> : null}</span>
              <span className="lp-offer-card__p">{x.mrp > x.price ? <s>{tk(x.mrp)}</s> : null}<strong>{tk(x.price)}</strong>{part.save && x.mrp > x.price ? <small>Save {tk(x.mrp - x.price)}</small> : null}</span>
              <a className="lp-btn" href="#lp-order" onClick={(e) => { if (!editing && setPick) setPick(i); go(e); }}>{part.button || 'Order now'}</a>
            </div>
          ))}
        </div>
      </>);
    }
    case 'callout':
      if (!part.title && !part.text) return null;
      return <div className={'lp-callout is-' + (part.tone || 'brand') + ' look-' + (part.look || 'soft')}><span className="lp-callout__ic" aria-hidden="true"><Icon name={part.icon || 'badge-check'} width="22" height="22" /></span><div>{part.title ? <b>{part.title}</b> : null}{part.text ? <p>{part.text}</p> : null}</div></div>;
    case 'proof': {
      const faces = (part.avatars || []).filter((x) => x.image).slice(0, 6);
      const photos = (part.photos || []).filter((x) => x.image);
      return (
        <div className={'lp-proof is-' + (part.look || 'slider')}>
          <div className="lp-proof__h">
            {faces.length ? <span className="lp-proof__faces" aria-hidden="true">{faces.map((x, i) => <span key={x.id || i}><Pic src={x.image} alt="" /></span>)}</span> : null}
            <span><b>{part.number}</b> {part.label}</span>
          </div>
          {part.sub ? <p className="lp-center lp-muted">{part.sub}</p> : null}
          {part.look !== 'header' && photos.length ? (part.look === 'grid' ? <div className="lp-gal">{photos.map((x, i) => <span key={x.id || i}><Pic src={x.image} alt={x.caption || ''} /></span>)}</div> : <ProofSlider photos={photos} />) : null}
          {editing && part.look !== 'header' && !photos.length ? <p className="lp-empty">Add customer photos in the panel.</p> : null}
        </div>
      );
    }
    case 'image':
      if (!part.image) return editing ? <p className="lp-empty">Choose a picture in the panel. A banner designed with its own words works best.</p> : null;
      return (
        <div className={'lp-image is-' + (part.width || 'contained')}>
          <Pic src={part.image} alt={part.alt || ''} />
          {part.button ? <a className="lp-btn is-big" href={part.href || '#lp-order'} onClick={part.href ? (e) => editing && e.preventDefault() : go}>{part.button}</a> : null}
        </div>
      );
    case 'logos': {
      const items = (part.items || []).filter((x) => x.image);
      if (!items.length) return editing ? <p className="lp-empty">Add certificate or partner logos in the panel.</p> : null;
      return <>{part.title ? <h2>{part.title}</h2> : null}<div className={'lp-logos is-' + (part.look || 'cards')}>{items.map((x, i) => <figure key={x.id || i}><Pic src={x.image} alt={x.label || ''} />{x.label && part.look !== 'plain' ? <figcaption>{x.label}</figcaption> : null}</figure>)}</div></>;
    }
    case 'faq': {
      const items = (part.items || []).filter((x) => x.q);
      if (!items.length) return null;
      return <>{part.title ? <h2>{part.title}</h2> : null}<div className="lp-faq">{items.map((x, i) => <details key={i}><summary>{x.q}<Icon name="chevron-down" width="18" height="18" aria-hidden="true" /></summary><p>{x.a}</p></details>)}</div></>;
    }
    case 'cta':
      return <div className="lp-cta"><h2>{part.title}</h2>{part.text ? <p>{part.text}</p> : null}<a className="lp-btn is-big is-inv" href="#lp-order" onClick={go}>{part.button}</a></div>;
    case 'contact': {
      const phone = shop.phone || '';
      return (
        <div className="lp-contact"><div><h2>{part.title}</h2>{part.text ? <p>{part.text}</p> : null}</div>
          <span className="lp-contact__b">
            {part.call && phone ? <a className="lp-btn is-line" href={'tel:' + phone.replace(/[^\d+]/g, '')} onClick={(e) => editing && e.preventDefault()}><Icon name="phone" width="16" height="16" aria-hidden="true" />Call {phone}</a> : null}
            {part.facebook ? <a className="lp-btn is-line" href={part.facebook} target="_blank" rel="noopener noreferrer" onClick={(e) => editing && e.preventDefault()}><Icon name="facebook" width="16" height="16" aria-hidden="true" />Facebook</a> : null}
            {part.whatsapp && phone ? <a className="lp-btn is-wa" href={'https://wa.me/' + digits(phone).replace(/^0/, '880') + '?text=' + encodeURIComponent('I want to order ' + (f ? f.name : ''))} target="_blank" rel="noopener noreferrer" onClick={(e) => editing && e.preventDefault()}><Icon name="message-circle" width="16" height="16" aria-hidden="true" />WhatsApp</a> : null}
          </span>
        </div>
      );
    }
    default: return null;
  }
}

/** A landing part's wrapper: the Style / Advanced settings (box) as classes and variables, like a store section. */
function PartShell({ part, editing, selected, onPick, children }) {
  const box = part.box || {};
  const bgUrl = useFileSrc(box.bgImage || '', 'full');
  const bp = boxProps(box, { bgUrl, editing });
  const label = partLabel(part);
  return (
    <section id={bp.id} style={bp.style}
      className={'lp-part lp-part--' + part.type + ' ' + bp.className + (part.hidden ? ' is-hidden' : '') + (selected ? ' is-sel' : '')}
      data-part={part.id} data-sec-id={editing ? part.id : undefined} data-sec-label={editing ? label : undefined}
      {...(editing ? { onClickCapture: (e) => { if (e.target.closest('input,select,textarea,label,.lp-tier,.lp-qty__b button,summary,.lp-slider__a')) return; e.preventDefault(); onPick(part.id); }, 'data-label': label + (part.hidden ? ' · hidden' : '') } : {})}>
      {box.divTop ? <span className={'sfx-div is-t is-' + box.divTop} aria-hidden="true" /> : null}
      {box.divBottom ? <span className={'sfx-div is-b is-' + box.divBottom} aria-hidden="true" /> : null}
      {children}
    </section>
  );
}
const OrderUnder = ({ text, editing }) => (text ? <div className="lp-under"><a className="lp-btn is-big" href="#lp-order" onClick={goOrder(editing)}>{text}</a></div> : null);

/** The whole page. editing: the builder's preview (click selects). preview: a draft seen by staff (no real orders).
 *  In the builder's frame (?preview=1&edit=1) editing and the selection come from the frame (isEditing, previewValue). */
export default function LandingView({ page, product, editing: editingProp = false, preview = false, selected: selectedProp = '', onSelect }) {
  const f = useMemo(() => factsOf(product), [product]);
  const reviews = useMemo(() => productReviews(product, 6), [product]);
  const shop = useMemo(() => { let p = null; try { p = businessProfile(); } catch { p = null; } return { phone: (p && p.contact && p.contact.phone) || '+8801811843300', name: (p && p.brand && p.brand.name) || 'Dazzle Shop', logo: p && p.brand && p.brand.logo }; }, []);
  const [frame, setFrame] = useState({ editing: false, selected: '' });
  const [products, setProducts] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [pick, setPick] = useState(null);
  useEffect(() => {
    const read = () => setFrame({ editing: isEditing(), selected: previewValue('select') || '' });
    read();
    try { setProducts(allProducts(getSavedProducts())); } catch { setProducts([]); }
    try { setCatalog(getCatalog()); } catch { setCatalog([]); }
    if (!isEditing() && !preview) captureUtm();
    window.addEventListener(SF_EVENT, read);
    return () => window.removeEventListener(SF_EVENT, read);
  }, [preview]);
  const editing = editingProp || frame.editing;
  const selected = selectedProp || frame.selected;
  const pickPart = onSelect || selectInEditor;
  const style = { ...PAGE_STYLE, ...(page.style || {}) };
  const theme = useMemo(() => lpTheme(style), [JSON.stringify(style)]); // eslint-disable-line react-hooks/exhaustive-deps
  const parts = (page.parts || []).filter((x) => !x.hidden || editing);
  const orderPart = parts.find((x) => x.type === 'order' && !x.sf && !x.hidden) || null;
  const offers = useMemo(() => offersOf(orderPart, product, products), [orderPart, product, products]);
  const hasOrder = !!orderPart;
  const href = lpFontHref(style);
  const themeHref = fontHref(theme);
  return (
    <div className={'lpv sf-theme ' + themeClasses(theme) + (editing ? ' is-editing sf-editing' : '') + (style.pattern ? ' sfx-pat sfx-pat-' + style.pattern : '')} style={lpVars(style)}>
      {href ? <link rel="stylesheet" href={href} /> : null}
      {themeHref && themeHref !== href ? <link rel="stylesheet" href={themeHref} /> : null}
      <style dangerouslySetInnerHTML={{ __html: themeVars(theme) + SF_CSS + TOKENS_CSS + SECTIONS_CSS + SECTIONS2_CSS + SECTIONS3_CSS + LOOKS_CSS + FIT_CSS + BOX_CSS + LP_CSS }} />
      <header className="lp-top">{shop.logo ? <img src={shop.logo} alt={shop.name} /> : <b>{shop.name}</b>}<a href={'tel:' + shop.phone.replace(/[^\d+]/g, '')} onClick={(e) => editing && e.preventDefault()}><Icon name="phone" width="16" height="16" aria-hidden="true" />{shop.phone}</a></header>
      {parts.map((part) => {
        if (isStorePart(part)) {
          const { sf, orderBtn, hidden, ...sec } = part; // eslint-disable-line no-unused-vars
          return (
            <div key={part.id} className={'lp-sf' + (hidden ? ' is-hidden' : '')} data-part={part.id}>
              <Section s={sec} v={theme} catalog={catalog} ctx={{ product }} />
              <OrderUnder text={orderBtn} editing={editing} />
            </div>
          );
        }
        if (!partType(part.type)) return null;
        return (
          <PartShell key={part.id} part={part} editing={editing} selected={selected === part.id} onPick={pickPart}>
            <div className="lp-wrap">
              <PartBody part={part} page={page} product={product} f={f} editing={editing} preview={preview} reviews={reviews} shop={shop} offers={offers} pick={pick} setPick={setPick} orderPart={orderPart} />
              <OrderUnder text={part.type === 'order' ? '' : part.orderBtn} editing={editing} />
            </div>
          </PartShell>
        );
      })}
      {style.sticky && hasOrder && f ? (
        <div className="lp-sticky"><span><b>{tk(offers.length ? offers[Math.min(pick == null ? 0 : pick, offers.length - 1)].price : f.price)}</b>{!offers.length && f.mrp ? <s>{tk(f.mrp)}</s> : null}</span><a className="lp-btn" href="#lp-order" onClick={goOrder(editing)}>Order now</a></div>
      ) : null}
      <footer className="lp-foot">© {shop.name} · Cash on delivery all over Bangladesh</footer>
    </div>
  );
}

export const LP_CSS = `
.lpv{container-type:inline-size;position:relative;background:var(--lp-bg);color:var(--lp-text);font-family:var(--lp-body);font-size:var(--text-base);line-height:1.6;-webkit-font-smoothing:antialiased}
.lpv *{box-sizing:border-box}
.lpv h1,.lpv h2,.lpv h3{margin:0;font-family:var(--lp-head);font-weight:var(--lp-hw);line-height:1.12;letter-spacing:-.015em;color:var(--lp-text)}
.lpv h2{margin-bottom:20px;font-size:clamp(24px,3.4cqi,34px);text-align:center;text-wrap:balance}
.lpv p{margin:0}
.lpv img{display:block;max-width:100%}
.lp-wrap{width:100%;max-width:1080px;margin:0 auto;padding:0 20px}
/* spacing: the page's own rhythm, unless the part's Style tab sets steps (box → --sfx-*; computer, tablet, phone) */
.lp-part{--lp-pt:clamp(36px,6cqi,72px);--lp-pb:clamp(36px,6cqi,72px);position:relative;padding-top:var(--sfx-pt-d,var(--lp-pt));padding-bottom:var(--sfx-pb-d,var(--lp-pb));margin-top:var(--sfx-mt-d,0);margin-bottom:var(--sfx-mb-d,0)}
@media (max-width:1023px){.lp-part{padding-top:var(--sfx-pt-t,var(--sfx-pt-d,var(--lp-pt)));padding-bottom:var(--sfx-pb-t,var(--sfx-pb-d,var(--lp-pb)));margin-top:var(--sfx-mt-t,var(--sfx-mt-d,0));margin-bottom:var(--sfx-mb-t,var(--sfx-mb-d,0))}}
@media (max-width:640px){.lp-part{padding-top:var(--sfx-pt-m,var(--sfx-pt-t,var(--sfx-pt-d,var(--lp-pt))));padding-bottom:var(--sfx-pb-m,var(--sfx-pb-t,var(--sfx-pb-d,var(--lp-pb))));margin-top:var(--sfx-mt-m,var(--sfx-mt-t,var(--sfx-mt-d,0)));margin-bottom:var(--sfx-mb-m,var(--sfx-mb-t,var(--sfx-mb-d,0)))}}
.lp-part--announce{--lp-pt:0;--lp-pb:0}
.lp-part--hero{--lp-pt:clamp(20px,4cqi,48px)}
.lp-part--image{--lp-pt:0;--lp-pb:0}
.lp-part.sfx-w-wide .lp-wrap{max-width:1320px}
.lp-part.sfx-w-full .lp-wrap{max-width:none;padding:0}
.lp-part.sfx-al-center .lp-wrap{text-align:center}
.lp-part.sfx-al-right .lp-wrap{text-align:right}
.lp-part.sfx-has-fg :is(h1,h2,h3,p,b,small,li){color:var(--sfx-fg)}
.lp-part.sfx-has-font :is(h1,h2,h3){font-family:var(--sfx-font)}
.lp-part.sfx-has-hs h2{font-size:calc(clamp(24px,3.4cqi,34px) * var(--sfx-hs,1))}
.lp-sf.is-hidden{opacity:.45}
/* "Order now" under a part */
.lp-under{display:flex;justify-content:center;margin-top:clamp(20px,3cqi,32px)}
.lp-sf>.lp-under{margin:0;padding:0 20px clamp(24px,4cqi,40px)}
/* offer cards (read the order form's offers; the button picks that offer in the form) */
.lp-offers{display:grid;gap:14px}
.lp-offers.is-cards{grid-template-columns:repeat(2,minmax(0,1fr))}
.lp-offer-card{position:relative;display:flex;flex-direction:column;align-items:center;gap:10px;padding:16px 14px;border:2px solid var(--lp-line);border-radius:var(--lp-r);background:var(--lp-bg);text-align:center}
.lp-offer-card.is-on{border-color:var(--lp-accent)}
.lp-offer-card__tag{position:absolute;top:-11px;left:50%;transform:translateX(-50%);padding:2px 12px;border-radius:var(--radius-full);background:var(--lp-accent);color:var(--lp-on);font-style:normal;font-size:var(--text-xs);font-weight:var(--weight-semibold);white-space:nowrap}
.lp-offer-card__pic{display:grid;place-items:center;width:100%;aspect-ratio:1/1;border-radius:calc(var(--lp-r) - 4px);background:var(--lp-surface);overflow:hidden}
.lp-offer-card__pic img{width:100%;height:100%;object-fit:contain}
.lp-offer-card__t{display:flex;flex-direction:column;gap:2px}
.lp-offer-card__t b{font-family:var(--lp-head);font-size:var(--text-base);line-height:1.3}
.lp-offer-card__t small{color:var(--lp-muted)}
.lp-offer-card__p{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:center;gap:2px 8px}
.lp-offer-card__p s{color:var(--lp-muted)}
.lp-offer-card__p strong{font-size:var(--text-xl);color:var(--lp-accent)}
.lp-offer-card__p small{width:100%;color:#16a34a;font-weight:var(--weight-medium)}
.lp-offer-card .lp-btn{width:100%}
.lp-offers.is-wide .lp-offer-card,.lp-offers.is-compact .lp-offer-card{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;text-align:left}
.lp-offers.is-wide .lp-offer-card__pic{width:96px}
.lp-offers.is-wide .lp-offer-card .lp-btn,.lp-offers.is-compact .lp-offer-card .lp-btn{grid-column:1/-1}
.lp-offers.is-compact .lp-offer-card__pic{display:none}
.lp-offers.is-compact .lp-offer-card{grid-template-columns:minmax(0,1fr) auto}
.lp-offers:is(.is-wide,.is-compact) .lp-offer-card__p{justify-content:flex-end}
.lp-offers:is(.is-wide,.is-compact) .lp-offer-card__tag{left:16px;transform:none}
@container (max-width:420px){.lp-offers.is-cards{gap:10px}.lp-offer-card{padding:14px 10px}}
/* order offers with a picture */
.lp-tier.has-pic{grid-template-columns:auto 56px minmax(0,1fr) auto}
.lp-tier__pic{display:grid;place-items:center;width:56px;height:56px;border-radius:var(--radius-lg);background:var(--lp-surface);overflow:hidden}
.lp-tier__pic img{width:100%;height:100%;object-fit:contain}
.lp-tier small{color:var(--lp-muted)}
.lp-tier strong{display:flex;flex-direction:column;align-items:flex-end}
.lp-tier strong s{color:var(--lp-muted);font-size:var(--text-sm);font-weight:var(--weight-medium)}
/* callout box */
.lp-callout{--c:var(--lp-accent);display:flex;align-items:flex-start;gap:14px;max-width:720px;margin:0 auto;padding:18px 20px;border-radius:var(--lp-r);background:color-mix(in srgb,var(--c) 10%,var(--lp-bg));border:1px solid color-mix(in srgb,var(--c) 30%,transparent);text-align:left}
.lp-callout.is-success{--c:#16a34a}.lp-callout.is-warning{--c:#d97706}.lp-callout.is-danger{--c:#dc2626}.lp-callout.is-dark{--c:#0f172a}
.lp-callout.look-outline{background:transparent;border-width:2px;border-style:dashed}
.lp-callout.look-solid{background:var(--c);border-color:var(--c)}
.lp-callout.look-solid :is(b,p){color:#fff}
.lp-callout__ic{display:grid;place-items:center;flex:none;width:40px;height:40px;border-radius:50%;background:var(--c);color:#fff}
.lp-callout.look-solid .lp-callout__ic{background:rgba(255,255,255,.2)}
.lp-callout b{display:block;font-family:var(--lp-head);font-size:var(--text-lg);color:var(--c)}
.lp-callout p{margin-top:2px;color:var(--lp-text)}
/* customer proof */
.lp-proof{display:flex;flex-direction:column;gap:16px}
.lp-proof__h{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:12px;text-align:center}
.lp-proof__h>span:last-child{font-family:var(--lp-head);font-size:clamp(20px,3cqi,28px);font-weight:var(--lp-hw)}
.lp-proof__h b{color:var(--lp-accent)}
.lp-proof__faces{display:flex}
.lp-proof__faces span{width:42px;height:42px;margin-left:-10px;border:3px solid var(--lp-bg);border-radius:50%;overflow:hidden;background:var(--lp-surface)}
.lp-proof__faces span:first-child{margin-left:0}
.lp-proof__faces img{width:100%;height:100%;object-fit:cover}
.lp-slider{position:relative}
.lp-slider__track{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding-bottom:4px}
.lp-slider__track::-webkit-scrollbar{display:none}
.lp-slider__track figure{flex:0 0 min(78%,320px);margin:0;scroll-snap-align:start;border-radius:var(--lp-r);overflow:hidden;background:var(--lp-surface)}
.lp-slider__track img{width:100%;aspect-ratio:4/5;object-fit:cover}
.lp-slider__track figcaption{padding:8px 12px;font-size:var(--text-sm);color:var(--lp-muted)}
.lp-slider__a{position:absolute;top:calc(50% - 22px);display:grid;place-items:center;width:44px;height:44px;border:0;border-radius:50%;background:color-mix(in srgb,var(--lp-bg) 92%,transparent);color:var(--lp-text);box-shadow:0 4px 14px -6px rgba(15,23,42,.35);cursor:pointer}
.lp-slider__a.is-prev{left:6px}.lp-slider__a.is-next{right:6px}
/* picture banner */
.lp-image{display:flex;flex-direction:column;align-items:center;gap:16px}
.lp-image img{width:100%;height:auto;border-radius:var(--lp-r)}
.lp-image.is-contained{max-width:1080px;margin:0 auto;padding:clamp(16px,3cqi,32px) 20px}
.lp-image.is-full img{border-radius:0}
.lp-image.is-full .lp-btn{margin-bottom:clamp(16px,3cqi,28px)}
/* certificates and logos */
.lp-logos{display:flex;flex-wrap:wrap;justify-content:center;gap:12px}
.lp-logos figure{display:flex;flex-direction:column;align-items:center;gap:6px;margin:0;width:calc((100% - 24px) / 3);max-width:180px}
.lp-logos img{width:100%;aspect-ratio:1/1;object-fit:contain}
.lp-logos figcaption{font-size:var(--text-xs);font-weight:var(--weight-semibold);text-align:center;text-transform:uppercase;letter-spacing:.02em}
.lp-logos.is-cards figure{padding:12px;border:1px solid var(--lp-line);border-radius:var(--lp-r);background:var(--lp-bg)}
.lp-logos.is-strip{flex-wrap:nowrap;justify-content:flex-start;overflow-x:auto;scrollbar-width:none}
.lp-logos.is-strip figure{flex:0 0 120px}

.lp-part:nth-of-type(even):not(.lp-part--announce):not(.lp-part--hero):not(.lp-part--cta){background:var(--lp-surface)}
.lp-top{display:flex;align-items:center;justify-content:space-between;gap:12px;max-width:1080px;margin:0 auto;padding:12px 20px}
.lp-top img{height:28px;width:auto}
.lp-top a{display:inline-flex;align-items:center;gap:6px;min-height:44px;color:var(--lp-text);font-weight:var(--weight-semibold);text-decoration:none;font-variant-numeric:tabular-nums}
.lp-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:0 24px;border:2px solid var(--lp-accent);border-radius:var(--lp-r);background:var(--lp-accent);color:var(--lp-on);font:inherit;font-weight:var(--weight-semibold);text-decoration:none;cursor:pointer;transition:transform .15s ease,box-shadow .15s ease}
.lp-btn:hover{transform:translateY(-1px);box-shadow:0 10px 24px -12px var(--lp-accent)}
.lp-btn.is-big{min-height:56px;padding:0 30px;font-size:var(--text-lg)}
.lp-btn.is-line{background:transparent;color:var(--lp-text);border-color:var(--lp-line)}
.lp-btn.is-wa{background:#16a34a;border-color:#16a34a;color:#fff}
.lp-btn.is-inv{background:var(--lp-on);color:var(--lp-accent);border-color:var(--lp-on)}
.lp-center{text-align:center}
.lp-muted{color:var(--lp-muted)}
.lp-empty{padding:18px;border:1px dashed var(--lp-line);border-radius:var(--lp-r);color:var(--lp-muted);text-align:center}
/* announcement */
.lp-ann{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:6px 14px;padding:10px 16px;background:var(--lp-accent);color:var(--lp-on);font-weight:var(--weight-semibold);font-size:var(--text-sm);text-align:center}
.lp-ann.is-dark{background:#0f172a;color:#fff}
.lp-ann.is-sale{background:#dc2626;color:#fff}
/* countdown */
.lp-clock{display:inline-flex;gap:6px}
.lp-clock>span{display:flex;flex-direction:column;align-items:center;min-width:58px;padding:8px 6px;border-radius:var(--lp-r);background:var(--lp-text);color:var(--lp-bg)}
.lp-clock b{font-size:var(--text-2xl);line-height:1;font-variant-numeric:tabular-nums}
.lp-clock small{font-size:var(--text-xs);opacity:.75}
.lp-clock.is-compact>span{flex-direction:row;gap:2px;min-width:0;padding:2px 6px;background:rgba(0,0,0,.22);color:inherit}
.lp-clock.is-compact b{font-size:var(--text-sm)}
.lp-cd{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center}
.lp-cd b{font-family:var(--lp-head);font-size:var(--text-xl)}
.lp-cd small{color:var(--lp-muted)}
/* hero */
.lp-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(20px,5cqi,56px);align-items:center}
.lp-hero__t{display:flex;flex-direction:column;align-items:flex-start;gap:14px}
.lp-hero h1{font-size:clamp(30px,5.4cqi,54px);text-wrap:balance}
.lp-hero__sub{color:var(--lp-muted);font-size:var(--text-lg);white-space:pre-line}
.lp-hero__pic{display:grid;grid-template:minmax(0,1fr)/minmax(0,1fr);aspect-ratio:1/1;border-radius:calc(var(--lp-r) * 1.4);overflow:hidden;background:var(--lp-surface)}
.lp-hero__pic img{width:100%;height:100%;object-fit:contain}
.lp-hero.is-center,.lp-hero.is-photo{grid-template-columns:minmax(0,1fr);text-align:center}
.lp-hero.is-center .lp-hero__t,.lp-hero.is-photo .lp-hero__t{align-items:center}
.lp-hero.is-center .lp-hero__pic,.lp-hero.is-photo .lp-hero__pic{width:min(520px,100%);margin:0 auto}
.lp-hero.is-photo .lp-hero__pic{order:-1}
.lp-badge{padding:4px 12px;border-radius:var(--radius-full);background:color-mix(in srgb,var(--lp-accent) 14%,transparent);color:var(--lp-accent);font-size:var(--text-sm);font-weight:var(--weight-semibold)}
.lp-rating{display:inline-flex;align-items:center;gap:6px;color:var(--lp-muted);font-size:var(--text-sm)}
.lp-rating span{color:#f59e0b;letter-spacing:1px}
.lp-price{display:flex;flex-wrap:wrap;align-items:baseline;gap:10px;font-variant-numeric:tabular-nums}
.lp-price b{font-family:var(--lp-head);font-size:clamp(28px,4cqi,40px);color:var(--lp-accent)}
.lp-price s{color:var(--lp-muted);font-size:var(--text-lg)}
.lp-price em{padding:2px 10px;border-radius:var(--radius-full);background:#dc2626;color:#fff;font-style:normal;font-weight:var(--weight-semibold);font-size:var(--text-sm)}
.lp-offer{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:var(--lp-r);background:color-mix(in srgb,#f59e0b 16%,transparent);color:var(--lp-text);font-weight:var(--weight-medium)}
.lp-chips{display:flex;flex-wrap:wrap;gap:8px 16px;margin:4px 0 0;padding:0;list-style:none;color:var(--lp-muted);font-size:var(--text-sm)}
.lp-chips li{display:inline-flex;align-items:center;gap:6px}
.lp-chips svg{color:var(--lp-accent)}
/* benefits */
.lp-ben{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:14px;margin:0;padding:0;list-style:none}
.lp-ben li{display:flex;flex-direction:column;gap:10px;padding:20px;border:1px solid var(--lp-line);border-radius:var(--lp-r);background:var(--lp-bg)}
.lp-ben li>span:last-child{display:flex;flex-direction:column;gap:2px}
.lp-ben small{color:var(--lp-muted);font-size:var(--text-sm)}
.lp-ben__ic{display:grid;place-items:center;width:44px;height:44px;border-radius:var(--lp-r);background:color-mix(in srgb,var(--lp-accent) 12%,transparent);color:var(--lp-accent)}
.lp-ben.is-list{grid-template-columns:minmax(0,1fr);max-width:640px;margin:0 auto}
.lp-ben.is-list li{flex-direction:row;align-items:flex-start;padding:10px 0;border:0;border-bottom:1px solid var(--lp-line);border-radius:0;background:none}
.lp-ben.is-list .lp-ben__ic{width:28px;height:28px;border-radius:50%;background:var(--lp-accent);color:var(--lp-on)}
.lp-ben.is-badges{grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:10px}
.lp-ben.is-badges li{flex-direction:row;align-items:center;padding:12px 14px}
.lp-part--benefits:has(.lp-ben.is-badges){padding:20px 0}
.lp-part--benefits:has(.lp-ben.is-badges) h2{display:none}
/* problem */
.lp-prob{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:clamp(20px,5cqi,56px);align-items:center}
.lp-prob.is-left .lp-prob__pic{order:-1}
.lp-prob h2{text-align:left}
.lp-prob p{color:var(--lp-muted);font-size:var(--text-lg)}
.lp-prob ul{display:flex;flex-direction:column;gap:8px;margin:16px 0 0;padding:0;list-style:none}
.lp-prob li{display:flex;align-items:center;gap:8px;font-weight:var(--weight-medium)}
.lp-prob li svg{color:var(--lp-accent);flex:none}
.lp-prob__pic{display:grid;grid-template:minmax(0,1fr)/minmax(0,1fr);aspect-ratio:4/3;border-radius:var(--lp-r);overflow:hidden;background:var(--lp-surface)}
.lp-prob__pic img{width:100%;height:100%;object-fit:contain}
/* gallery, video */
.lp-gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(46%,200px),1fr));gap:10px}
.lp-gal span{display:grid;grid-template:minmax(0,1fr)/minmax(0,1fr);aspect-ratio:1/1;border-radius:var(--lp-r);overflow:hidden;background:var(--lp-bg);border:1px solid var(--lp-line)}
.lp-gal img{width:100%;height:100%;object-fit:contain}
.lp-video{position:relative;aspect-ratio:16/9;border-radius:var(--lp-r);overflow:hidden;background:#000}
.lp-video iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.lp-part--video .lp-center{margin-top:12px;color:var(--lp-muted)}
/* specs, compare */
.lp-specs{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:0 28px;max-width:860px;margin:0 auto}
.lp-specs div{display:flex;justify-content:space-between;gap:16px;padding:12px 0;border-bottom:1px solid var(--lp-line)}
.lp-specs dt{color:var(--lp-muted)}
.lp-specs dd{margin:0;font-weight:var(--weight-semibold);text-align:right}
.lp-cmp{width:100%;max-width:720px;margin:0 auto;border-collapse:collapse}
.lp-cmp th,.lp-cmp td{padding:12px 14px;border-bottom:1px solid var(--lp-line);text-align:center}
.lp-cmp tbody th{text-align:left;font-weight:var(--weight-medium)}
.lp-cmp thead th{font-size:var(--text-sm);color:var(--lp-muted)}
.lp-cmp .is-us{background:color-mix(in srgb,var(--lp-accent) 9%,transparent);color:var(--lp-accent);font-weight:var(--weight-semibold)}
.lp-cmp td:not(.is-us) svg{color:var(--lp-muted)}
/* reviews */
.lp-revs{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:14px}
.lp-revs figure{display:flex;flex-direction:column;gap:10px;margin:0;padding:20px;border:1px solid var(--lp-line);border-radius:var(--lp-r);background:var(--lp-bg)}
.lp-stars{color:#f59e0b;letter-spacing:2px}
.lp-stars i{font-style:normal;color:var(--lp-line)}
.lp-revs blockquote{flex:1;margin:0;line-height:1.6}
.lp-revs figcaption{color:var(--lp-muted);font-size:var(--text-sm);font-weight:var(--weight-medium)}
/* guarantee */
.lp-guar{display:flex;align-items:center;gap:20px;max-width:760px;margin:0 auto;padding:24px;border:2px dashed color-mix(in srgb,var(--lp-accent) 45%,var(--lp-line));border-radius:var(--lp-r)}
.lp-guar h2{margin-bottom:6px;text-align:left;font-size:var(--text-2xl)}
.lp-guar p{color:var(--lp-muted)}
.lp-guar__ic{display:grid;place-items:center;flex:none;width:64px;height:64px;border-radius:50%;background:var(--lp-accent);color:var(--lp-on)}
/* order */
.lp-order{max-width:620px;margin:0 auto;padding:clamp(20px,4cqi,32px);border-radius:calc(var(--lp-r) * 1.4);background:var(--lp-bg);border:2px solid var(--lp-accent);box-shadow:0 24px 48px -28px color-mix(in srgb,var(--lp-accent) 60%,transparent)}
.lp-order h2{margin-bottom:6px}
.lp-order>p{margin-bottom:18px}
.lp-form{display:flex;flex-direction:column;gap:14px}
.lp-tiers{display:flex;flex-direction:column;gap:8px}
.lp-tier{position:relative;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:12px;min-height:56px;padding:12px 16px;border:2px solid var(--lp-line);border-radius:var(--lp-r);background:var(--lp-surface);color:var(--lp-text);font:inherit;text-align:left;cursor:pointer}
.lp-tier[aria-checked="true"]{border-color:var(--lp-accent);background:color-mix(in srgb,var(--lp-accent) 7%,var(--lp-bg))}
.lp-tier i{width:20px;height:20px;border:2px solid var(--lp-line);border-radius:50%}
.lp-tier[aria-checked="true"] i{border:6px solid var(--lp-accent)}
.lp-tier span{display:flex;flex-direction:column}
.lp-tier small{color:#16a34a;font-weight:var(--weight-medium);font-size:var(--text-sm)}
.lp-tier strong{font-size:var(--text-lg);font-variant-numeric:tabular-nums}
.lp-tier em{position:absolute;top:-10px;right:14px;padding:1px 10px;border-radius:var(--radius-full);background:var(--lp-accent);color:var(--lp-on);font-style:normal;font-size:var(--text-xs);font-weight:var(--weight-semibold)}
.lp-qty{display:flex;align-items:center;justify-content:space-between;gap:12px;font-weight:var(--weight-medium)}
.lp-qty__b{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--lp-line);border-radius:var(--lp-r);padding:4px}
.lp-qty__b button{display:grid;place-items:center;width:40px;height:40px;border:0;border-radius:var(--lp-r);background:var(--lp-surface);color:var(--lp-text);cursor:pointer}
.lp-qty__b b{min-width:28px;text-align:center}
.lp-row2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.lp-f{display:flex;flex-direction:column;gap:6px;min-width:0}
.lp-f>span,.lpv .lp-lbl{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--lp-text)}
.lpv :is(.lp-f input,.lp-f select,.lp-in){width:100%;min-height:50px;padding:0 14px;border:1.5px solid var(--lp-line);border-radius:var(--lp-r);background:var(--lp-bg);color:var(--lp-text);font:inherit;font-size:var(--text-base)}
.lpv :is(.lp-f input,.lp-f select,.lp-in):focus{outline:none;border-color:var(--lp-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--lp-accent) 20%,transparent)}
.lp-f.is-bad :is(input,select),.lp-area.is-bad .lp-in{border-color:#dc2626}
.lp-f small{color:#b91c1c;font-size:var(--text-sm)}
.lp-sum{display:flex;flex-direction:column;gap:6px;margin:4px 0 0;padding:14px 16px;border-radius:var(--lp-r);background:var(--lp-surface)}
.lp-sum div{display:flex;justify-content:space-between;gap:12px;font-size:var(--text-sm)}
.lp-sum dt{color:var(--lp-muted)}
.lp-sum dd{margin:0;font-variant-numeric:tabular-nums}
.lp-sum s{margin-left:8px;color:var(--lp-muted)}
.lp-sum .is-hint dt{color:#16a34a}
.lp-sum .is-total{padding-top:8px;border-top:1px solid var(--lp-line);font-size:var(--text-base);font-weight:var(--weight-semibold)}
.lp-sum .is-total dt{color:var(--lp-text)}
.lp-form .lp-btn.is-big{width:100%}
.lp-form__note{display:flex;align-items:center;justify-content:center;gap:6px;color:var(--lp-muted);font-size:var(--text-sm);text-align:center}
.lp-done{display:flex;flex-direction:column;align-items:center;gap:10px;padding:12px 0;text-align:center}
.lp-done__ic{display:grid;place-items:center;width:56px;height:56px;border-radius:50%;background:color-mix(in srgb,#16a34a 15%,transparent);color:#15803d}
.lp-done p{color:var(--lp-muted)}
.lp-done__sum{color:var(--lp-text)!important;font-weight:var(--weight-semibold)}
/* faq, cta, contact */
.lp-faq{max-width:760px;margin:0 auto}
.lp-faq details{border-bottom:1px solid var(--lp-line)}
.lp-faq summary{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:56px;padding:12px 2px;font-weight:var(--weight-semibold);list-style:none;cursor:pointer}
.lp-faq summary::-webkit-details-marker{display:none}
.lp-faq summary svg{flex:none;color:var(--lp-muted);transition:transform .2s ease}
.lp-faq details[open] summary svg{transform:rotate(180deg)}
.lp-faq p{padding:0 2px 16px;color:var(--lp-muted)}
.lp-part--cta{background:var(--lp-accent)}
.lp-cta{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;color:var(--lp-on)}
.lp-cta h2{margin:0;color:var(--lp-on)}
.lp-cta p{opacity:.88}
.lp-contact{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;max-width:860px;margin:0 auto}
.lp-contact h2{margin-bottom:4px;text-align:left;font-size:var(--text-2xl)}
.lp-contact p{color:var(--lp-muted)}
.lp-contact__b{display:flex;flex-wrap:wrap;gap:10px}
.lp-sticky{position:sticky;bottom:0;z-index:5;display:none;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px;background:var(--lp-bg);border-top:1px solid var(--lp-line);box-shadow:0 -10px 24px -16px rgba(15,23,42,.35)}
.lp-sticky span{display:flex;align-items:baseline;gap:8px;font-variant-numeric:tabular-nums}
.lp-sticky b{font-size:var(--text-lg)}
.lp-sticky s{color:var(--lp-muted);font-size:var(--text-sm)}
.lp-foot{padding:24px 20px 32px;color:var(--lp-muted);font-size:var(--text-sm);text-align:center}
/* the builder's preview */
.lpv.is-editing .lp-part{position:relative;cursor:pointer}
.lpv.is-editing .lp-part:hover{outline:2px dashed color-mix(in srgb,#2563eb 55%,transparent);outline-offset:-2px}
.lpv.is-editing .lp-part.is-sel{outline:2px solid #2563eb;outline-offset:-2px}
.lpv.is-editing .lp-part:is(:hover,.is-sel)::before{content:attr(data-label);position:absolute;top:6px;left:6px;z-index:6;padding:2px 10px;border-radius:var(--radius-full);background:#2563eb;color:#fff;font:var(--weight-medium) var(--text-xs)/1.6 system-ui,sans-serif}
.lpv.is-editing .lp-part.is-hidden{opacity:.4}
@container (max-width:720px){
  .lp-hero,.lp-prob{grid-template-columns:minmax(0,1fr)}
  .lp-hero .lp-hero__pic{order:-1;width:100%}
  .lp-hero__t,.lp-hero.is-split .lp-hero__t{align-items:stretch;text-align:left}
  .lp-hero__t .lp-btn{width:100%}
  .lp-prob h2{text-align:center}
  .lp-row2{grid-template-columns:minmax(0,1fr)}
  .lp-guar{flex-direction:column;text-align:center}
  .lp-guar h2,.lp-contact h2{text-align:center}
  .lp-contact{flex-direction:column;text-align:center}
  .lp-contact__b{width:100%}
  .lp-contact__b .lp-btn{flex:1}
  .lp-sticky{display:flex}
  .lp-gal{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (prefers-reduced-motion:reduce){.lp-btn{transition:none}.lp-btn:hover{transform:none}}
`;
