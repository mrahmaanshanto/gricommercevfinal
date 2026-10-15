'use client';
// Shop facts for the About us and Contact us pages: the shop's contact (Settings › General), its branches with their
// hours (Settings › Locations), social links, reviews, and whether a shop is open right now (Bangladesh time, worked
// out after mount so the prerender never disagrees). Parts: OpenBadge, ShopCards, SocialLinks, Testimonials,
// ContactChannels, ContactForm (a message becomes a support ticket, Inbox › Support tickets).

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { BrandLogo } from '@/components/BrandLogo';
import { businessProfile } from '@/lib/businessProfile';
import { getPlaces } from '@/lib/locations';
import { getReviews } from '@/lib/productReviews';
import { addTicket, TOPICS } from '@/lib/supportTickets';
import { storeProducts } from '@/lib/storefront/catalog';
import { w } from '@/lib/storefront/words';
import { themeValues } from '@/lib/storefront/theme';

const W = ({ k }) => <span data-w={k}>{w(k)}</span>;

// ---- facts ----------------------------------------------------------------------------------------------------------------
const digits = (x) => String(x || '').replace(/[^\d+]/g, '');
const waNumber = (x) => { const d = String(x || '').replace(/\D/g, ''); return d.startsWith('880') ? d : d.startsWith('0') ? '88' + d : d; };
export const SHOP_SOCIALS = [
  { k: 'facebook', label: 'Facebook', handle: 'dazzleshopbd', href: 'https://facebook.com/dazzleshopbd' },
  { k: 'instagram', label: 'Instagram', handle: '@dazzleshopbd', href: 'https://instagram.com/dazzleshopbd' },
  { k: 'youtube', label: 'YouTube', handle: 'Dazzle Shop', href: 'https://youtube.com/@dazzleshopbd' },
  { k: 'tiktok', label: 'TikTok', handle: '@dazzleshopbd', href: 'https://tiktok.com/@dazzleshopbd' },
];

const handleOf = (url, at) => { const m = String(url || '').replace(/\/+$/, '').split('/').pop() || ''; return m ? (at && !m.startsWith('@') ? '@' + m : m) : ''; };
/** The shop's social links (Customize › Shop details), only the filled-in ones. */
export function shopSocials(v = {}) {
  return [
    ['facebook', 'Facebook', v.socialFacebook, false], ['instagram', 'Instagram', v.socialInstagram, true],
    ['youtube', 'YouTube', v.socialYoutube, false], ['tiktok', 'TikTok', v.socialTiktok, true],
  ].filter(([, , href]) => /^https?:\/\//.test(String(href || ''))).map(([k, label, href, at]) => ({ k, label, href, handle: handleOf(href, at) }));
}
/** The shop's contact, branches and socials (read after mount). */
export function useShopInfo() {
  const [info, setInfo] = useState(null);
  useEffect(() => {
    let p = null;
    try { p = businessProfile(); } catch { p = null; }
    const c = (p && p.contact) || {};
    const name = (p && p.brand && p.brand.name) || 'Dazzle Shop';
    const phone = c.phone || '+8801811843300';
    const email = c.email || 'hello@dazzleshop.com.bd';
    const hours = c.hours || 'Sat–Thu, 10:00 AM – 8:00 PM';
    let shops = [];
    try { shops = getPlaces({ active: true }).filter((x) => x.type === 'Branch' && !x.opening); } catch { shops = []; }
    if (!shops.length) shops = [{ id: 'shop', name, address: c.address || '', phone, hours }];
    let products = 0;
    try { products = storeProducts().length; } catch { products = 0; }
    let v = {};
    try { v = themeValues(); } catch { v = {}; }
    setInfo({ name, phone, email, hours, address: c.address || shops[0].address, whatsapp: 'https://wa.me/' + waNumber(phone), messenger: 'https://m.me/' + String(v.messengerPage || 'dazzleshopbd').replace(/^@/, ''), shops: shops.map((s) => ({ ...s, hours: s.hours || hours })), socials: shopSocials(v), products });
  }, []);
  return info;
}

// ---- open now -----------------------------------------------------------------------------------------------------------
const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
/** "Sat–Thu 10:00 AM – 10:00 PM" → { days: Set(0..6), from, to } in minutes, or null when it can't be read. */
export function readHours(text) {
  const t = String(text || '').toLowerCase();
  const times = [...t.matchAll(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/g)].map((m) => ((Number(m[1]) % 12) + (m[3] === 'pm' ? 12 : 0)) * 60 + Number(m[2] || 0));
  if (times.length < 2) return null;
  let days = new Set(DAYS.map((_, i) => i));
  const range = t.match(/(sun|mon|tue|wed|thu|fri|sat)[a-z]*\s*[–—-]\s*(sun|mon|tue|wed|thu|fri|sat)/);
  if (range) {
    days = new Set();
    for (let i = DAYS.indexOf(range[1]); ; i = (i + 1) % 7) { days.add(i); if (i === DAYS.indexOf(range[2])) break; }
  }
  const off = t.match(/closed\s+(?:on\s+)?(sun|mon|tue|wed|thu|fri|sat)/);
  if (off) days.delete(DAYS.indexOf(off[1]));
  return { days, from: times[0], to: times[1] <= times[0] ? times[1] + 1440 : times[1] };
}
function dhakaNow() {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Dhaka', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
  const get = (k) => (parts.find((x) => x.type === k) || {}).value || '';
  return { day: DAYS.indexOf(get('weekday').toLowerCase().slice(0, 3)), min: (Number(get('hour')) % 24) * 60 + Number(get('minute')) };
}
const clock = (min) => { const m = min % 1440; const h = Math.floor(m / 60); const mm = m % 60; return (h % 12 || 12) + (mm ? ':' + String(mm).padStart(2, '0') : '') + (h < 12 ? ' AM' : ' PM'); };
/** { tone: open | soon | closed, label, sub } for a shop's hours text right now, or null. */
export function openState(text, now = dhakaNow()) {
  const h = readHours(text);
  if (!h || now.day < 0) return null;
  const yesterday = (now.day + 6) % 7;
  const openToday = h.days.has(now.day) && now.min >= h.from && now.min < h.to;
  const lateFromYesterday = h.to > 1440 && h.days.has(yesterday) && now.min < h.to - 1440;
  if (openToday || lateFromYesterday) {
    const left = (openToday ? h.to : h.to - 1440) - now.min;
    return left <= 60 ? { tone: 'soon', label: 'Closing soon', sub: 'Closes at ' + clock(h.to) } : { tone: 'open', label: 'Open now', sub: 'Closes at ' + clock(h.to) };
  }
  if (h.days.has(now.day) && now.min < h.from) return { tone: 'closed', label: 'Closed', sub: 'Opens today at ' + clock(h.from) };
  for (let i = 1; i <= 7; i += 1) {
    const d = (now.day + i) % 7;
    if (h.days.has(d)) return { tone: 'closed', label: 'Closed', sub: 'Opens ' + (i === 1 ? 'tomorrow' : DAY_NAMES[d]) + ' at ' + clock(h.from) };
  }
  return null;
}
/** Re-worked out every minute. */
function useOpen(text) {
  const [st, setSt] = useState(null);
  useEffect(() => {
    const run = () => setSt(openState(text));
    run();
    const t = setInterval(run, 60000);
    return () => clearInterval(t);
  }, [text]);
  return st;
}
export function OpenBadge({ hours, sub = true }) {
  const st = useOpen(hours);
  if (!st) return null;
  return <span className={'shi-open is-' + st.tone}><i aria-hidden="true" /><b>{st.label}</b>{sub ? <small>{st.sub}</small> : null}</span>;
}

// ---- shops --------------------------------------------------------------------------------------------------------------
const mapsAt = (x) => 'https://maps.google.com/?q=' + encodeURIComponent(x.address || x.name);
export const mapEmbed = (x) => 'https://maps.google.com/maps?q=' + encodeURIComponent(x.address || x.name) + '&z=15&output=embed';
export function ShopCards({ shops, title = w('visitShops'), lead = w('visitShopsLead') }) {
  if (!shops || !shops.length) return null;
  return (
    <section className="shi-shops sf-wrap" aria-label={title}>
      <header className="shi-head"><h2>{title}</h2>{lead ? <p>{lead}</p> : null}</header>
      <div className="shi-shops__grid">
        {shops.map((x) => (
          <article key={x.id} className="shi-shop">
            <div className="shi-shop__top"><h3>{x.name}</h3><OpenBadge hours={x.hours} sub={false} /></div>
            <ul>
              <li><Icon name="map-pin" width="16" height="16" aria-hidden="true" /><span>{x.address}</span></li>
              {x.hours ? <li><Icon name="clock" width="16" height="16" aria-hidden="true" /><span>{x.hours}<OpenLine hours={x.hours} /></span></li> : null}
              {x.phone ? <li><Icon name="phone" width="16" height="16" aria-hidden="true" /><a href={'tel:' + digits(x.phone)}>{x.phone}</a></li> : null}
            </ul>
            <div className="shi-shop__act">
              <a className="sf-btn sf-btn--line" href={mapsAt(x)} target="_blank" rel="noopener noreferrer"><Icon name="navigation" width="16" height="16" aria-hidden="true" />Directions</a>
              {x.phone ? <a className="sf-btn sf-btn--line" href={'tel:' + digits(x.phone)}><Icon name="phone" width="16" height="16" aria-hidden="true" />Call</a> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
function OpenLine({ hours }) {
  const st = useOpen(hours);
  return st ? <small className="shi-when">{st.sub}</small> : null;
}

// ---- socials --------------------------------------------------------------------------------------------------------------
export function SocialLinks({ socials, whatsapp, look = 'band', title = w('followUs') }) {
  const list = [...(socials || []), ...(whatsapp ? [{ k: 'whatsapp', label: 'WhatsApp', handle: 'Message us', href: whatsapp }] : [])];
  if (!list.length) return null;
  const links = list.map((x) => (
    <a key={x.k} className="shi-soc" href={x.href} target="_blank" rel="noopener noreferrer">
      <BrandLogo brand={x.k} size={look === 'band' ? 40 : 32} decorative />
      <span><b>{x.label}</b><small>{x.handle}</small></span>
    </a>
  ));
  if (look === 'list') return <div className="shi-socs is-list">{links}</div>;
  return (
    <section className="shi-socband sf-wrap" aria-label={title}>
      <header className="shi-head"><h2>{title}</h2><p data-w="followLead">{w('followLead')}</p></header>
      <div className="shi-socs">{links}</div>
    </section>
  );
}

// ---- testimonials -------------------------------------------------------------------------------------------------------
const initials = (n) => String(n || '?').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
export function Testimonials({ title = w('customersSay'), count = 6 }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let all = [];
    try { all = getReviews().filter((r) => r.status === 'published'); } catch { all = []; }
    const good = all.filter((r) => r.stars >= 4 && String(r.text || '').length > 24);
    const avg = all.length ? all.reduce((a, r) => a + (Number(r.stars) || 0), 0) / all.length : 0;
    setData({ list: good.slice(0, count), avg, total: all.length });
  }, [count]);
  if (!data || !data.list.length) return null;
  return (
    <section className="shi-tst sf-wrap" aria-label={title}>
      <header className="shi-head shi-tst__head">
        <h2>{title}</h2>
        <p className="shi-score"><b>{data.avg.toFixed(1)}</b><span className="shi-stars" aria-hidden="true">{[1, 2, 3, 4, 5].map((i) => <Icon key={i} name="star" width="16" height="16" className={i <= Math.round(data.avg) ? 'is-on' : ''} />)}</span><small>from {data.total.toLocaleString('en-US')} reviews</small></p>
      </header>
      <div className="shi-tst__grid">
        {data.list.map((r) => (
          <figure key={r.id} className="shi-quote">
            <span className="shi-stars" role="img" aria-label={r.stars + ' out of 5 stars'}>{[1, 2, 3, 4, 5].map((i) => <Icon key={i} name="star" width="14" height="14" aria-hidden="true" className={i <= r.stars ? 'is-on' : ''} />)}</span>
            <blockquote>{r.text}</blockquote>
            <figcaption><span className="shi-av" aria-hidden="true">{initials(r.name)}</span><span><b>{r.name}</b><small>{r.verified ? 'Verified buyer · ' : ''}{r.product}</small></span></figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

// ---- figures ---------------------------------------------------------------------------------------------------------------
export function useFigures(info) {
  return useMemo(() => {
    if (!info) return [];
    let avg = 0, total = 0;
    try { const all = getReviews().filter((r) => r.status === 'published'); total = all.length; avg = total ? all.reduce((a, r) => a + (Number(r.stars) || 0), 0) / total : 0; } catch { /* ignore */ }
    return [
      info.products ? [String(info.products), 'original products in stock'] : null,
      [String(info.shops.length), info.shops.length === 1 ? 'shop in Dhaka' : 'shops in Dhaka'],
      total ? [avg.toFixed(1) + '/5', 'from ' + total.toLocaleString('en-US') + ' reviews'] : null,
      ['64', 'districts we deliver to'],
    ].filter(Boolean);
  }, [info]);
}

// ---- contact ---------------------------------------------------------------------------------------------------------------
export function ContactChannels({ info }) {
  if (!info) return null;
  const rows = [
    { k: 'phone', icon: 'phone', label: 'Call us', value: info.phone, href: 'tel:' + digits(info.phone), note: info.hours },
    { k: 'whatsapp', brand: 'whatsapp', label: 'WhatsApp', value: 'Chat with us', href: info.whatsapp, note: 'Usually replies in minutes', out: true },
    { k: 'messenger', brand: 'facebook', label: 'Messenger', value: 'facebook.com/dazzleshopbd', href: info.messenger, note: 'Order and product questions', out: true },
    { k: 'email', icon: 'mail', label: 'Email', value: info.email, href: 'mailto:' + info.email, note: 'We answer within a day' },
  ];
  return (
    <div className="shi-ch">
      {rows.map((r) => (
        <a key={r.k} className="shi-ch__item" href={r.href} {...(r.out ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {r.brand ? <BrandLogo brand={r.brand} size={40} decorative /> : <span className="shi-ch__ic" aria-hidden="true"><Icon name={r.icon} width="20" height="20" /></span>}
          <span className="shi-ch__t"><small>{r.label}</small><b>{r.value}</b><em>{r.note}</em></span>
          <Icon name="arrow-up-right" width="16" height="16" aria-hidden="true" className="shi-ch__go" />
        </a>
      ))}
    </div>
  );
}

const PHONE_RE = /^(?:\+?88)?01[3-9]\d{8}$/;
export function ContactForm({ info }) {
  const [f, setF] = useState({ name: '', phone: '', order: '', topic: 'Product question', message: '' });
  const [err, setErr] = useState({});
  const [sent, setSent] = useState(null);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    const bad = {};
    if (!f.name.trim()) bad.name = 'Write your name.';
    if (!PHONE_RE.test(f.phone.replace(/[\s-]/g, ''))) bad.phone = 'Write an 11-digit mobile number, like 01712345678.';
    if (f.message.trim().length < 5) bad.message = 'Tell us how we can help.';
    setErr(bad);
    if (Object.keys(bad).length) { const first = document.getElementById('shi-f-' + Object.keys(bad)[0]); if (first) first.focus(); return; }
    let r = { ok: false };
    try { r = addTicket({ customer: f.name.trim(), phone: f.phone.trim(), order: f.order.trim(), topic: f.topic, details: f.message.trim(), ch: 'phone' }); } catch { r = { ok: false }; }
    setSent({ name: f.name.trim().split(' ')[0], ref: r.ok ? 'TKT-' + r.id : '' });
  };
  if (sent) {
    return (
      <div className="shi-form is-sent" role="status">
        <span className="shi-form__ok" aria-hidden="true"><Icon name="check" width="24" height="24" /></span>
        <h2>Thanks, {sent.name}. We got your message.</h2>
        <p>{sent.ref ? <>Your reference is <b>{sent.ref}</b>. </> : null}We call or message you back {info ? 'during ' + info.hours : 'soon'}.</p>
        <button type="button" className="sf-btn sf-btn--line" onClick={() => { setSent(null); setF({ name: '', phone: '', order: '', topic: 'Product question', message: '' }); }}>Send another message</button>
      </div>
    );
  }
  const field = (k, label, input, hint) => (
    <label className={'shi-field' + (err[k] ? ' is-bad' : '')} htmlFor={'shi-f-' + k}>
      <span>{label}</span>
      {input}
      {err[k] ? <small className="shi-err" id={'shi-e-' + k}>{err[k]}</small> : hint ? <small>{hint}</small> : null}
    </label>
  );
  const a = (k) => ({ id: 'shi-f-' + k, value: f[k], onChange: set(k), 'aria-invalid': err[k] ? true : undefined, 'aria-describedby': err[k] ? 'shi-e-' + k : undefined });
  return (
    <form className="shi-form" onSubmit={submit} noValidate>
      <h2 data-w="sendMessage">{w('sendMessage')}</h2>
      <div className="shi-form__row">
        {field('name', 'Your name', <input {...a('name')} autoComplete="name" />)}
        {field('phone', 'Mobile number', <input {...a('phone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" />)}
      </div>
      <div className="shi-form__row">
        {field('topic', 'About', <select {...a('topic')}>{TOPICS.map((t) => <option key={t}>{t}</option>)}</select>)}
        {field('order', 'Order number', <input {...a('order')} inputMode="numeric" placeholder="Optional" />)}
      </div>
      {field('message', 'Message', <textarea {...a('message')} rows={5} />)}
      <button type="submit" className="sf-btn"><Icon name="send" width="16" height="16" aria-hidden="true" /><W k="sendBtn" /></button>
    </form>
  );
}

export const QUICK_ANSWERS = () => [
  { icon: 'package-search', k: 'qa1', href: '/track' },
  { icon: 'rotate-ccw', k: 'qa2', href: '/page?handle=return-refund' },
  { icon: 'truck', k: 'qa3', href: '/page?handle=shipping-delivery' },
  { icon: 'shield-check', k: 'qa4', href: '/page?handle=about-us' },
]
export function QuickAnswers() {
  return (
    <nav className="shi-qa" aria-label="Quick answers">
      {QUICK_ANSWERS().map((q) => (
        <a key={q.k} href={q.href}>
          <span className="shi-qa__ic" aria-hidden="true"><Icon name={q.icon} width="20" height="20" /></span>
          <span><b data-w={q.k + 'Title'}>{w(q.k + 'Title')}</b><small data-w={q.k + 'Text'}>{w(q.k + 'Text')}</small></span>
          <Icon name="chevron-right" width="16" height="16" aria-hidden="true" />
        </a>
      ))}
    </nav>
  );
}

export const SHOP_INFO_CSS = `
.shi-head{display:flex;flex-direction:column;gap:8px;margin-bottom:clamp(18px,3vw,28px)}
.shi-head h2{margin:0!important;font-size:var(--sf-fs-h2);line-height:1.1}
.shi-head p{margin:0;max-width:60ch;color:var(--sf-muted);font-size:var(--sf-fs-lg)}
.shi-open{display:inline-flex;align-items:center;gap:6px;min-height:28px;padding:0 12px 0 10px;border-radius:var(--radius-full);background:var(--sf-soft);font-size:var(--sf-fs-sm);white-space:nowrap}
.shi-open i{width:8px;height:8px;border-radius:50%;background:currentColor;flex:none}
.shi-open b{font-weight:var(--weight-semibold)}
.shi-open small{color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.shi-open.is-open{background:color-mix(in srgb,#16a34a 12%,transparent);color:#15803d}
.shi-open.is-open i{box-shadow:0 0 0 3px color-mix(in srgb,#16a34a 22%,transparent)}
.shi-open.is-soon{background:color-mix(in srgb,#d97706 14%,transparent);color:#b45309}
.shi-open.is-closed{background:color-mix(in srgb,#dc2626 10%,transparent);color:#b91c1c}
.shi-open small{color:inherit;opacity:.8}

.shi-shops{margin-bottom:var(--sf-section)}
.shi-shops__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:var(--sf-gap)}
.shi-shop{display:flex;flex-direction:column;gap:16px;min-width:0;padding:clamp(18px,2.4vw,26px);border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.shi-shop__top{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 12px}
.shi-shop h3{margin:0!important;font-family:var(--sf-font-head);font-size:var(--sf-fs-h3);font-weight:var(--sf-head-w,600)}
.shi-shop ul{display:flex;flex-direction:column;gap:10px;margin:0;padding:0;list-style:none}
.shi-shop li{display:grid;grid-template-columns:16px minmax(0,1fr);gap:10px;align-items:start;line-height:1.5}
.shi-shop li>svg{margin-top:3px;color:var(--sf-primary)}
.shi-shop li a{color:var(--sf-text);text-decoration:none;font-family:var(--sf-font-data,inherit)}
.shi-when{display:block;color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.shi-shop__act{display:flex;flex-wrap:wrap;gap:8px;margin-top:auto}
.shi-shop__act .sf-btn{flex:1 1 140px;justify-content:center;min-height:44px}

.shi-socband{margin-bottom:var(--sf-section)}
.shi-socs{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:12px}
.shi-soc{display:flex;align-items:center;gap:12px;min-width:0;min-height:64px;padding:12px 16px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface);color:var(--sf-text);text-decoration:none;transition:border-color .2s ease,transform .2s ease}
.shi-soc:hover{border-color:var(--sf-primary);transform:translateY(-2px)}
.shi-soc span{display:flex;flex-direction:column;min-width:0}
.shi-soc b{font-weight:var(--weight-semibold)}
.shi-soc small{overflow:hidden;color:var(--sf-muted);font-size:var(--sf-fs-sm);text-overflow:ellipsis;white-space:nowrap}
.shi-socs.is-list{grid-template-columns:repeat(auto-fit,minmax(min(100%,170px),1fr));gap:8px}
.shi-socs.is-list .shi-soc{min-height:52px;padding:8px 12px}

.shi-tst{margin-bottom:var(--sf-section)}
.shi-tst__head{flex-direction:row;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:12px 24px}
.shi-score{display:flex;align-items:center;gap:10px;margin:0}
.shi-score b{font-family:var(--sf-font-head);font-size:var(--sf-fs-h2);line-height:1;color:var(--sf-text)}
.shi-score small{color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.shi-stars{display:inline-flex;gap:2px;color:var(--sf-line)}
.shi-stars svg{fill:currentColor}
.shi-stars .is-on{color:#f59e0b}
.shi-tst__grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:var(--sf-gap)}
.shi-quote{display:flex;flex-direction:column;gap:14px;min-width:0;margin:0;padding:clamp(18px,2.4vw,26px);border-radius:var(--sf-radius-card);background:var(--sf-surface);border:1px solid var(--sf-line)}
.shi-quote blockquote{flex:1;margin:0;font-size:var(--sf-fs-lg);line-height:1.6;overflow-wrap:anywhere}
.shi-quote figcaption{display:flex;align-items:center;gap:12px;min-width:0}
.shi-quote figcaption>span:last-child{display:flex;flex-direction:column;min-width:0}
.shi-quote figcaption small{overflow:hidden;color:var(--sf-muted);font-size:var(--sf-fs-sm);text-overflow:ellipsis;white-space:nowrap}
.shi-av{display:grid;place-items:center;flex:none;width:40px;height:40px;border-radius:50%;background:var(--sf-soft);color:var(--sf-primary);font-weight:var(--weight-semibold);font-size:var(--sf-fs-sm)}

.shi-ch{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:12px}
.shi-ch__item{position:relative;display:flex;align-items:center;gap:14px;min-width:0;padding:16px 40px 16px 16px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface);color:var(--sf-text);text-decoration:none;transition:border-color .2s ease,box-shadow .2s ease}
.shi-ch__item:hover{border-color:var(--sf-primary);box-shadow:0 10px 24px -16px rgba(15,23,42,.35)}
.shi-ch__ic{display:grid;place-items:center;flex:none;width:40px;height:40px;border-radius:var(--sf-radius);background:var(--sf-soft);color:var(--sf-primary)}
.shi-ch__t{display:flex;flex-direction:column;min-width:0}
.shi-ch__t small{color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.shi-ch__t b{overflow:hidden;font-weight:var(--weight-semibold);text-overflow:ellipsis;white-space:nowrap}
.shi-ch__t em{color:var(--sf-muted);font-style:normal;font-size:var(--sf-fs-sm)}
.shi-ch__go{position:absolute;top:14px;right:14px;color:var(--sf-muted)}

.shi-form{display:flex;flex-direction:column;gap:14px;min-width:0;padding:clamp(18px,3vw,32px);border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.shi-form h2{margin:0 0 4px!important;font-size:var(--sf-fs-h3)}
.shi-form__row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.shi-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.shi-field>span{font-size:var(--sf-fs-sm);font-weight:var(--weight-medium)}
.shi-field :is(input,select,textarea){width:100%;padding:10px 14px;min-height:var(--sf-field-h);border-style:solid;border-color:var(--sf-field-line);border-width:var(--sf-fbt) var(--sf-fbx) var(--sf-fbb);border-radius:var(--sf-field-r);background:var(--sf-field-bg);box-shadow:var(--sf-field-shadow);color:var(--sf-text);font:inherit;font-size:max(var(--text-base),var(--sf-fs))}
.shi-field textarea{resize:vertical;min-height:120px;border-radius:min(var(--sf-field-r),18px)}
.shi-field :is(input,select,textarea):focus{outline:none;border-color:var(--sf-primary);box-shadow:var(--sf-focus-ring)}
.shi-field small{color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.shi-field.is-bad :is(input,select,textarea){border-color:#dc2626}
.shi-field .shi-err{color:#b91c1c}
.shi-form>.sf-btn{align-self:flex-start;min-height:48px;padding-inline:28px}
.shi-form.is-sent{align-items:flex-start;gap:12px}
.shi-form.is-sent p{margin:0;color:var(--sf-muted)}
.shi-form__ok{display:grid;place-items:center;width:48px;height:48px;border-radius:50%;background:color-mix(in srgb,#16a34a 14%,transparent);color:#15803d}

.shi-qa{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:12px}
.shi-qa a{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:14px;min-height:64px;padding:14px 16px;border-radius:var(--sf-radius-card);background:var(--sf-soft);color:var(--sf-text);text-decoration:none;transition:background .2s ease}
.shi-qa a:hover{background:color-mix(in srgb,var(--sf-primary) 10%,var(--sf-soft))}
.shi-qa__ic{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;background:var(--sf-surface);color:var(--sf-primary)}
.shi-qa b{display:block;font-weight:var(--weight-semibold)}
.shi-qa small{display:block;color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.shi-qa a>svg{color:var(--sf-muted)}
@media (max-width:640px){
  .shi-socs:not(.is-list){grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
  .shi-socs:not(.is-list) .shi-soc{min-height:56px;padding:10px 12px;gap:10px}
  .shi-form__row{grid-template-columns:minmax(0,1fr)}
  .shi-form>.sf-btn{align-self:stretch;justify-content:center}
  .shi-tst__grid{grid-auto-flow:column;grid-template-columns:none;grid-auto-columns:86%;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:6px;scrollbar-width:none}
  .shi-quote{scroll-snap-align:start}
}
@media (prefers-reduced-motion:reduce){.shi-soc,.shi-ch__item,.shi-qa a{transition:none}.shi-soc:hover{transform:none}}
`;
