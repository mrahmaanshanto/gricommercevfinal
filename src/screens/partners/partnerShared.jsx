'use client';
// partnerShared — what every Grid Partners page shares (Batch E): the merchant pages (/partners, /partner, /partner-requests),
// the creators' app (/grid-partners…, /gp…) and the public profile (/p?h=). usePartners() reads lib/platform/partners.js
// after mount (and again on gc:partners and from other tabs); the profile layout (PartnerProfile: cover, photo, name with
// the blue tick, platforms with followers, about, samples with the Lightbox, rate card, what stores said); the badges; the
// request conversation (Thread) and the contact card that appears once a partner accepts; the "Share my profile" card
// (public link, Copy, WhatsApp / Facebook / LinkedIn / X, QR code and a downloadable share card drawn on a canvas).

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { StatusBadge } from '@/components/ui';
import { BrandLogo } from '@/components/BrandLogo';
import { QrCode } from '@/components/QrCode';
import { qrMatrix } from '@/lib/qr';
import { toneOf, initialsOf } from '@/lib/pictures';
import { Lightbox, GIG_CSS } from '../services/ServiceDetail';
import {
  read, PT_EVENT, PT_KEY, PT_SESSION, typeLabel, netLabel, followersText, topPlatform, fromPrice, AVAIL, PSTATUS, RSTATUS,
  ratingOf, publicLink, publicPath, shareText, tk, contactOf, partnerById,
} from '@/lib/platform/partners';

export { tk };
export const qp = (k) => (typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get(k) || '');
export const dShort = (ms) => (ms ? new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—');
export const dTime = (ms) => (ms ? new Date(ms).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—');
export const dayText = (iso) => (iso ? new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
export const say = (r, ok) => { if (r && r.ok === false) { toast(r.error, { tone: 'error' }); return false; } if (ok) toast(ok); return true; };

/** { ready, tick } — re-renders when Grid Partners data changes (here or in another tab). */
export function usePartners() {
  const [st, set] = useState({ ready: false, tick: 0 });
  useEffect(() => {
    const load = () => { read(); set((x) => ({ ready: true, tick: x.tick + 1 })); };
    load();
    const onStorage = (e) => { if (!e.key || e.key === PT_KEY || e.key === PT_SESSION) load(); };
    window.addEventListener(PT_EVENT, load); window.addEventListener('storage', onStorage);
    return () => { window.removeEventListener(PT_EVENT, load); window.removeEventListener('storage', onStorage); };
  }, []);
  return st;
}

export function Tick({ size = 16 }) {
  return <span className="pt-tick" role="img" aria-label="Verified by GridCommerce" title="Verified by GridCommerce"><Icon name="badge-check" width={size} height={size} aria-hidden="true" /></span>;
}
/** A big round photo, or initials on the person's colour. */
export function Avatar({ p, size = 96, className = '' }) {
  const [bad, setBad] = useState(false);
  if (p.photo && !bad) return <span className={'pt-av ' + className} style={{ width: size, height: size }} aria-hidden="true"><img src={p.photo} alt="" onError={() => setBad(true)} /></span>;
  const [bg, fg] = toneOf(p.name);
  return <span className={'pt-av pt-av--ini ' + className} style={{ width: size, height: size, background: bg, color: fg, fontSize: size >= 72 ? 'var(--text-2xl)' : 'var(--text-sm)' }} aria-hidden="true">{initialsOf(p.name)}</span>;
}
export const AvailBadge = ({ a }) => { const x = AVAIL[a] || AVAIL.open; return <StatusBadge tone={x.tone}>{x.label}</StatusBadge>; };
export const PartnerBadge = ({ p }) => { const x = PSTATUS[p.status] || PSTATUS.applied; return <StatusBadge tone={x.tone}>{x.label}</StatusBadge>; };
/** side 'partner' says "New" for a waiting request. */
export function ReqBadge({ r, side }) {
  const x = RSTATUS[r.status] || RSTATUS.sent;
  return <StatusBadge tone={x.tone}>{side === 'partner' && x.partner ? x.partner : x.label}</StatusBadge>;
}
/** "184K on TikTok" with the logo. */
export function TopReach({ p }) {
  const top = topPlatform(p);
  if (!top) return <span className="pt-muted">No platforms yet</span>;
  return <span className="pt-reach"><BrandLogo brand={top.net} size={18} decorative /><b>{followersText(top.followers)}</b><span>on {netLabel(top.net)}</span></span>;
}

const videoNet = (link) => (/youtu/.test(link) ? 'youtube' : /tiktok/.test(link) ? 'tiktok' : /instagram/.test(link) ? 'instagram' : /facebook|fb\./.test(link) ? 'facebook' : '');

/** The samples grid: photos open large (arrow keys move), videos open their link. */
export function Samples({ p }) {
  const [big, setBig] = useState(null);
  const list = p.samples || [];
  const pics = list.filter((s) => s.kind !== 'video' && s.src).map((s) => ({ src: s.src, caption: s.caption }));
  if (!list.length) return <p className="pt-muted" style={{ margin: 0 }}>No samples yet.</p>;
  return (<>
    <ul className="pt-samples">
      {list.map((s, i) => {
        if (s.kind === 'video') {
          const net = videoNet(s.link);
          return (
            <li key={i}>
              <a className="pt-sample pt-sample--video" href={s.link || '#'} target="_blank" rel="noopener noreferrer" style={s.src ? { backgroundImage: `url(${s.src})` } : undefined} aria-label={'Watch: ' + (s.caption || 'video')}>
                <span className="pt-play" aria-hidden="true"><Icon name="play" width="20" height="20" /></span>
                {net ? <span className="pt-sample__net"><BrandLogo brand={net} size={20} decorative /></span> : null}
              </a>
              <span className="pt-sample__cap"><Icon name="video" width="12" height="12" aria-hidden="true" />{s.caption || 'Video'}</span>
            </li>
          );
        }
        const at = pics.findIndex((x) => x.src === s.src && x.caption === s.caption);
        return (
          <li key={i}>
            <button type="button" className="pt-sample" style={{ backgroundImage: `url(${s.src})` }} onClick={() => setBig(at)} aria-label={'See larger' + (s.caption ? ': ' + s.caption : '')} />
            <span className="pt-sample__cap"><Icon name="image" width="12" height="12" aria-hidden="true" />{s.caption || 'Photo'}</span>
          </li>
        );
      })}
    </ul>
    <Lightbox pics={pics} at={big} onAt={setBig} onClose={() => setBig(null)} />
  </>);
}

/** The rate card. onPick(pkg) shows a "Choose" button on each. */
export function Packages({ p, onPick, compact }) {
  const list = p.packages || [];
  if (!list.length) return <p className="pt-muted" style={{ margin: 0 }}>No prices yet.</p>;
  return (
    <ul className={'pt-pkgs' + (compact ? ' is-compact' : '')}>
      {list.map((k) => (
        <li key={k.id}>
          <div className="pt-pkg__top"><b>{k.name}</b><span className="pt-price">{tk(k.price)}</span></div>
          {k.includes && k.includes.length ? <ul className="pt-incl">{k.includes.map((x) => <li key={x}><Icon name="check" width="14" height="14" aria-hidden="true" />{x}</li>)}</ul> : null}
          {onPick ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => onPick(k)}>Ask for this</button> : null}
        </li>
      ))}
    </ul>
  );
}

function Stars({ value, size = 14 }) {
  const v = Math.round(value);
  return <span className="pt-stars" aria-label={value ? value.toFixed(1) + ' of 5 stars' : 'No rating yet'}>{[1, 2, 3, 4, 5].map((i) => <Icon key={i} name="star" width={size} height={size} aria-hidden="true" style={{ fill: i <= v ? 'currentColor' : 'none' }} />)}</span>;
}
export { Stars as PtStars };

/** The whole profile (public page, store view, partner preview). h1: the name is the page's heading. action: buttons
 *  next to the name. side: extra cards at the top of the side column. */
export function PartnerProfile({ p, h1, action, side, below, onPick }) {
  const r = useMemo(() => ratingOf(p.id), [p.id]);
  const Tag = h1 ? 'h1' : 'h2';
  const cover = p.cover || p.photo;
  return (
    <div className="pp">
      <section className="ix-card pp-hero" aria-label="Profile">
        <div className={'pp-cover' + (cover ? '' : ' is-empty')}>{cover ? <img src={cover} alt="" /> : null}</div>
        <div className="pp-head">
          <Avatar p={p} size={104} className="pp-av" />
          <div className="pp-who">
            <Tag className="pp-name">{p.name}{p.verified ? <Tick size={20} /> : null}</Tag>
            <p className="pp-line">{typeLabel(p.type)}{p.city ? ' · ' + p.city : ''}{(p.languages || []).length ? ' · ' + p.languages.join(', ') : ''}</p>
            <div className="pp-badges">
              <AvailBadge a={p.availability} />
              {p.featured ? <StatusBadge tone="primary" icon="sparkles">Featured</StatusBadge> : null}
              {r.count ? <span className="pp-rate"><Stars value={r.avg} size={12} />{r.avg.toFixed(1)} · {r.count} rating{r.count === 1 ? '' : 's'}</span> : null}
            </div>
          </div>
          {action ? <div className="pp-act">{action}</div> : null}
        </div>
        {(p.platforms || []).length ? (
          <ul className="pp-plat" aria-label="Platforms">
            {p.platforms.map((x) => (
              <li key={x.net + x.handle}>
                <a href={x.url || '#'} target="_blank" rel="noopener noreferrer">
                  <BrandLogo brand={x.net} size={28} decorative />
                  <span><b>{followersText(x.followers)}</b><small>{netLabel(x.net)}{x.handle ? ' · @' + x.handle : ''}</small></span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
      <div className="ix-record">
        <div className="ix-main">
          <section className="ix-card pt-pad" aria-labelledby="pp-about">
            <h2 id="pp-about">About</h2>
            {p.bio ? <p className="pp-bio">{p.bio}</p> : <p className="pt-muted">No bio yet.</p>}
            {(p.niches || []).length ? <div className="pt-chips" aria-label="Niches">{p.niches.map((n) => <span key={n} className="pt-chip">{n}</span>)}</div> : null}
          </section>
          <section className="ix-card pt-pad" aria-labelledby="pp-samples">
            <h2 id="pp-samples">Sample work</h2>
            <Samples p={p} />
          </section>
          {r.count ? (
            <section className="ix-card pt-pad" aria-labelledby="pp-revs">
              <h2 id="pp-revs">What stores said</h2>
              <ul className="pt-revs">
                {r.list.slice(0, 6).map((v, i) => (
                  <li key={i}><header><b>{v.shop}</b><Stars value={v.stars} size={12} /><span>{dShort(v.at)}</span></header>{v.text ? <p>{v.text}</p> : null}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {below}
        </div>
        <aside className="ix-side" aria-label="Rates">
          {side}
          <section className="ix-card pt-pad" aria-labelledby="pp-rates">
            <h2 id="pp-rates">Rate card</h2>
            <Packages p={p} compact onPick={onPick} />
            {p.budgetFrom ? <p className="pt-muted" style={{ margin: 0 }}>Usual budget: {tk(p.budgetFrom)}{p.budgetTo ? '–' + tk(p.budgetTo) : '+'}</p> : null}
            <p className="pt-muted" style={{ margin: 0 }}>Prices are the partner’s own. You pay the partner directly.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

/** The conversation of a request. me: 'shop' | 'partner'. */
export function Thread({ r, me }) {
  return (
    <div className="pt-thread" aria-label="Conversation">
      {(r.messages || []).map((m, i) => (
        <div key={i} className={'pt-msg' + (m.from === 'system' ? ' is-sys' : m.from === me ? ' is-me' : '')}>
          <span className="pt-bubble">{m.text}</span>
          <small>{m.from === 'system' ? '' : m.from === 'shop' ? r.shopName + ' · ' : ((partnerById(r.partnerId) || {}).name || 'Partner') + ' · '}{dTime(m.at)}</small>
        </div>
      ))}
    </div>
  );
}

/** The other side's phone and email — only once accepted. side: the viewer ('shop' | 'partner'). */
export function ContactCard({ r, side }) {
  const c = contactOf(r);
  if (!c) {
    return <p className="pt-note"><Icon name="lock" width="16" height="16" aria-hidden="true" /><span>{side === 'shop' ? 'The partner’s phone and email show here once they accept.' : 'The store’s phone and email show here once you accept.'}</span></p>;
  }
  const x = side === 'shop' ? c.partner : c.shop;
  if (!x) return null;
  const digits = String(x.phone || '').replace(/\D/g, '');
  return (
    <div className="pt-contact" aria-label="Contact details">
      <b>{side === 'shop' ? 'Partner’s contact' : 'Store’s contact'}</b>
      <span><Icon name="user" width="14" height="14" aria-hidden="true" />{x.name}</span>
      {x.phone ? <a href={'tel:' + digits}><Icon name="phone" width="14" height="14" aria-hidden="true" />{x.phone}</a> : null}
      {x.email ? <a href={'mailto:' + x.email}><Icon name="mail" width="14" height="14" aria-hidden="true" />{x.email}</a> : null}
      {digits ? <a href={'https://wa.me/' + digits} target="_blank" rel="noopener noreferrer"><Icon name="message-circle" width="14" height="14" aria-hidden="true" />WhatsApp</a> : null}
    </div>
  );
}

// ---- share ------------------------------------------------------------------------------------------------------------
const enc = encodeURIComponent;
function cssVar(name, fallback) {
  try { const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim(); return v && !/^var\(/.test(v) ? v : fallback; } catch { return fallback; }
}
function loadImg(src) {
  return new Promise((resolve) => { if (!src) { resolve(null); return; } const i = new Image(); i.onload = () => resolve(i); i.onerror = () => resolve(null); i.src = src; });
}
function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
/** Draws the share card (1080 × 1350, Instagram portrait) and downloads it as a PNG. */
export async function downloadCard(p) {
  const W = 1080, Hh = 1350, PH = 820;
  const c = document.createElement('canvas'); c.width = W; c.height = Hh;
  const g = c.getContext('2d');
  const navy = cssVar('--primary', '#003087');
  const sans = 'Poppins, Arial, sans-serif';
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, Hh);
  const img = await loadImg(p.photo || p.cover);
  if (img) {
    const k = Math.max(W / img.width, PH / img.height);
    const w = img.width * k, h = img.height * k;
    g.drawImage(img, (W - w) / 2, Math.min(0, (PH - h) * 0.25), w, h);
  } else {
    const gr = g.createLinearGradient(0, 0, W, PH); gr.addColorStop(0, navy); gr.addColorStop(1, '#1e40af');
    g.fillStyle = gr; g.fillRect(0, 0, W, PH);
    g.fillStyle = 'rgba(255,255,255,.92)'; g.font = `600 220px ${sans}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(initialsOf(p.name), W / 2, PH / 2);
  }
  const fade = g.createLinearGradient(0, PH - 360, 0, PH); fade.addColorStop(0, 'rgba(15,23,42,0)'); fade.addColorStop(1, 'rgba(15,23,42,.82)');
  g.fillStyle = fade; g.fillRect(0, PH - 360, W, 360);
  // brand pill
  g.textAlign = 'left'; g.textBaseline = 'middle';
  g.font = `600 34px ${sans}`;
  const brand = 'Grid Partners';
  const bw = g.measureText(brand).width + 64;
  roundRect(g, 48, 48, bw, 72, 36); g.fillStyle = 'rgba(255,255,255,.94)'; g.fill();
  g.fillStyle = navy; g.fillText(brand, 80, 85);
  // name and line over the photo
  g.fillStyle = '#ffffff'; g.font = `600 76px ${sans}`;
  let name = p.name;
  while (g.measureText(name).width > W - 200 && name.length > 4) name = name.slice(0, -2) + '…';
  g.fillText(name, 56, PH - 140);
  if (p.verified) {
    const x = 56 + g.measureText(name).width + 44, y = PH - 142;
    g.beginPath(); g.arc(x, y, 26, 0, Math.PI * 2); g.fillStyle = '#1d9bf0'; g.fill();
    g.strokeStyle = '#ffffff'; g.lineWidth = 7; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(x - 11, y + 1); g.lineTo(x - 3, y + 9); g.lineTo(x + 12, y - 8); g.stroke();
  }
  g.font = `400 38px ${sans}`; g.fillStyle = 'rgba(255,255,255,.9)';
  g.fillText(`${typeLabel(p.type)}${p.city ? ' · ' + p.city : ''}`, 58, PH - 68);
  // reach and price
  const top = topPlatform(p);
  g.fillStyle = '#0f172a'; g.font = `600 64px ${sans}`;
  g.fillText(top ? followersText(top.followers) : '—', 56, PH + 110);
  g.font = `400 32px ${sans}`; g.fillStyle = '#475569';
  g.fillText(top ? `followers on ${netLabel(top.net)}` : 'followers', 56, PH + 165);
  const fp = fromPrice(p);
  if (fp) { const x2 = Math.max(560, 56 + g.measureText(top ? `followers on ${netLabel(top.net)}` : 'followers').width + 64); g.fillStyle = '#0f172a'; g.font = `600 64px ${sans}`; g.fillText(tk(fp), x2, PH + 110); g.font = `400 32px ${sans}`; g.fillStyle = '#475569'; g.fillText('rate card from', x2, PH + 165); }
  // the link
  const link = publicLink(p.handle).replace(/^https?:\/\//, '');
  g.fillStyle = navy; g.font = `600 34px ${sans}`;
  let l = link; while (g.measureText(l).width > 640 && l.length > 10) l = l.slice(0, -2);
  g.fillText(l === link ? l : l + '…', 56, Hh - 150);
  g.fillStyle = '#475569'; g.font = `400 30px ${sans}`;
  g.fillText('Hire me on Grid Partners', 56, Hh - 96);
  // QR code
  try {
    const m = qrMatrix(publicLink(p.handle));
    const size = 260, q = 2, cell = size / (m.length + q * 2), x0 = W - size - 56, y0 = Hh - size - 56;
    g.fillStyle = '#ffffff'; g.fillRect(x0, y0, size, size);
    g.fillStyle = '#0f172a';
    m.forEach((row, y) => row.forEach((on, x) => { if (on) g.fillRect(x0 + (x + q) * cell, y0 + (y + q) * cell, Math.ceil(cell), Math.ceil(cell)); }));
  } catch { /* no QR */ }
  return new Promise((resolve) => {
    c.toBlob((blob) => {
      if (!blob) { resolve(false); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `grid-partners-${p.handle}.png`;
      document.body.appendChild(a); a.click(); a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 4000);
      resolve(true);
    }, 'image/png');
  });
}

/** "Share my profile": the public link, Copy, social share links, QR code and the downloadable card. */
export function ShareCard({ p }) {
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState('');
  useEffect(() => { setLink(publicLink(p.handle)); }, [p.handle]);
  const live = p.status === 'approved';
  const text = shareText(p);
  const copy = async () => {
    try { await navigator.clipboard.writeText(link); toast('Link copied'); } catch { toast('Copy the link from the box', { tone: 'error' }); }
  };
  const down = async () => { setBusy(true); const ok = await downloadCard(p); setBusy(false); toast(ok ? 'Share card downloaded' : 'The card could not be made', ok ? undefined : { tone: 'error' }); };
  const nets = [
    ['whatsapp', 'WhatsApp', 'message-circle', `https://wa.me/?text=${enc(text + ' ' + link)}`],
    ['facebook', 'Facebook', 'facebook', `https://www.facebook.com/sharer/sharer.php?u=${enc(link)}`],
    ['linkedin', 'LinkedIn', 'linkedin', `https://www.linkedin.com/sharing/share-offsite/?url=${enc(link)}`],
    ['x', 'X', 'twitter', `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(link)}`],
  ];
  return (
    <section className="ix-card pt-pad" aria-labelledby="pt-share-h">
      <h2 id="pt-share-h">Share my profile</h2>
      {!live ? <p className="pt-note pt-note--warn"><Icon name="clock" width="16" height="16" aria-hidden="true" /><span>Your public page opens once GridCommerce approves your profile.</span></p> : null}
      <div className="pt-share">
        <div className="pt-share__qr">{link ? <QrCode text={link} size={112} label="QR code for your public profile" /> : null}</div>
        <div className="pt-share__nets">
          {nets.map(([k, l, ic, href]) => <a key={k} className="ix-btn ix-btn--sm" href={href} target="_blank" rel="noopener noreferrer" aria-label={'Share on ' + l}><Icon name={ic} width="16" height="16" aria-hidden="true" />{l}</a>)}
        </div>
      </div>
      <div className="pt-share__main">
        <label className="gc-label" htmlFor="pt-share-link">Your public link</label>
        <div className="pt-share__link">
          <input id="pt-share-link" className="gc-input" readOnly value={link} onFocus={(e) => e.target.select()} />
          <button type="button" className="ix-btn" onClick={copy}><Icon name="copy" width="16" height="16" aria-hidden="true" />Copy</button>
        </div>
      </div>
      <div className="pt-row">
        <button type="button" className="ix-btn ix-btn--primary" disabled={busy} onClick={down}><Icon name="download" width="16" height="16" aria-hidden="true" />{busy ? 'Making the card…' : 'Download share card'}</button>
        <a className="ix-btn" href={publicPath(p.handle)} target="_blank" rel="noopener noreferrer"><Icon name="external-link" width="16" height="16" aria-hidden="true" />Open public page</a>
      </div>
    </section>
  );
}

export const PT_CSS = GIG_CSS + `
.pt-pad{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4)}
.pt-pad h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pt-pad p{margin:0}
.pt-muted{font-size:var(--text-sm);color:var(--text-muted)}
.pt-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.pt-row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.pt-tick{display:inline-grid;place-items:center;flex:none;color:var(--fill-info,var(--primary));vertical-align:middle}
.pt-av{display:grid;place-items:center;flex:none;overflow:hidden;border-radius:var(--radius-full);background:var(--surface-subtle);font-weight:var(--weight-semibold);line-height:1}
.pt-av img{display:block;width:100%;height:100%;object-fit:cover;object-position:top center}
.pt-reach{display:inline-flex;align-items:center;gap:6px;font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.pt-reach b{font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pt-chips{display:flex;flex-wrap:wrap;gap:6px}
.pt-chip{display:inline-flex;align-items:center;min-height:24px;padding:0 10px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body)}
.pt-note{display:flex;gap:8px;align-items:flex-start;margin:0;padding:10px 12px;border-radius:var(--radius-lg);background:var(--fill-info-soft);font-size:var(--text-sm);color:var(--text-body)}
.pt-note svg{flex:none;margin-top:2px;color:var(--text-info)}
.pt-note--warn{background:var(--fill-warning-soft)}
.pt-note--warn svg{color:var(--text-warning)}
.pt-note--bad{background:var(--fill-error-soft)}
.pt-note--bad svg{color:var(--text-danger)}
.pt-note--ok{background:var(--fill-success-soft)}
.pt-note--ok svg{color:var(--text-success)}
.pt-stars{display:inline-flex;gap:1px;color:var(--warning);vertical-align:middle}
.pp{display:flex;flex-direction:column;gap:var(--space-4)}
.pp-hero{overflow:hidden}
.pp-cover{height:220px;background:linear-gradient(120deg,var(--primary),var(--fill-primary-soft))}
.pp-cover img{display:block;width:100%;height:100%;object-fit:cover;object-position:center 22%}
.pp-head{display:flex;align-items:flex-end;gap:var(--space-4);padding:0 var(--space-5);margin-top:-52px}
.pp-av{border:4px solid var(--surface-card);box-shadow:0 2px 8px rgba(15,23,42,.12)}
.pp-who{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;padding-top:56px}
.pp-name{display:flex;align-items:center;gap:6px;margin:0;font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--text-heading);line-height:1.25;overflow-wrap:anywhere}
.pp-line{margin:0;font-size:var(--text-sm);color:var(--text-muted)}
.pp-badges{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;margin-top:2px}
.pp-rate{display:inline-flex;align-items:center;gap:6px;font-size:var(--text-xs);color:var(--text-muted)}
.pp-act{display:flex;flex-wrap:wrap;gap:var(--space-2);padding-bottom:4px}
.pp-plat{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:var(--space-2);margin:0;padding:var(--space-4) var(--space-5) var(--space-5);list-style:none}
.pp-plat a{display:flex;align-items:center;gap:10px;min-height:52px;padding:8px 12px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);color:inherit;text-decoration:none}
.pp-plat a:hover{border-color:var(--primary)}
.pp-plat b{display:block;font-family:var(--font-data);font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pp-plat small{display:block;font-size:var(--text-xs);color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pp-plat span{min-width:0}
.pp-bio{font-size:var(--text-sm);line-height:1.6;color:var(--text-body);white-space:pre-line}
.pt-samples{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:var(--space-3);margin:0;padding:0;list-style:none}
.pt-samples li{display:flex;flex-direction:column;gap:6px;min-width:0}
.pt-sample{all:unset;position:relative;display:block;box-sizing:border-box;aspect-ratio:4/5;border-radius:var(--radius-lg);background:linear-gradient(135deg,var(--fill-primary-soft),var(--surface-subtle)) center/cover no-repeat;cursor:zoom-in;overflow:hidden}
.pt-sample:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
.pt-sample--video{cursor:pointer;background-color:var(--text-heading);background-image:linear-gradient(160deg,var(--text-heading),var(--primary))}
.pt-sample--video .pt-play{background:rgba(255,255,255,.18)}
.pt-play{position:absolute;left:50%;top:50%;display:grid;place-items:center;width:48px;height:48px;margin:-24px 0 0 -24px;border-radius:var(--radius-full);background:rgba(15,23,42,.66);color:var(--text-on-dark)}
.pt-sample__net{position:absolute;left:8px;top:8px}
.pt-sample__cap{display:flex;gap:6px;align-items:flex-start;font-size:var(--text-xs);color:var(--text-body);line-height:1.4}
.pt-sample__cap svg{flex:none;margin-top:2px;color:var(--text-muted)}
.pt-pkgs{display:flex;flex-direction:column;gap:var(--space-2);margin:0;padding:0;list-style:none}
.pt-pkgs>li{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.pt-pkgs>li>.ix-btn{align-self:flex-start}
.pt-pkg__top{display:flex;justify-content:space-between;align-items:baseline;gap:var(--space-2)}
.pt-pkg__top b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pt-price{font-family:var(--font-data);font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap}
.pt-incl{display:flex;flex-direction:column;gap:4px;margin:0;padding:0;list-style:none;font-size:var(--text-xs);color:var(--text-body)}
.pt-incl li{display:flex;gap:6px;align-items:flex-start}
.pt-incl svg{flex:none;margin-top:1px;color:var(--text-success)}
.pt-revs{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.pt-revs li{display:flex;flex-direction:column;gap:4px;padding:var(--space-3) 0;border-top:1px solid var(--border-subtle)}
.pt-revs li:first-child{border-top:0;padding-top:0}
.pt-revs header{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;font-size:var(--text-xs);color:var(--text-muted)}
.pt-revs header b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.pt-revs p{font-size:var(--text-sm);color:var(--text-body)}
.pt-thread{display:flex;flex-direction:column;gap:var(--space-3)}
.pt-msg{display:flex;flex-direction:column;gap:3px;max-width:84%;align-self:flex-start}
.pt-msg.is-me{align-self:flex-end;align-items:flex-end}
.pt-msg.is-sys{align-self:center;align-items:center;text-align:center;max-width:96%}
.pt-bubble{padding:8px 12px;border-radius:var(--radius-xl);background:var(--surface-subtle);font-size:var(--text-sm);line-height:1.5;color:var(--text-heading);white-space:pre-wrap;overflow-wrap:anywhere}
.pt-msg.is-me .pt-bubble{background:var(--primary);color:var(--text-on-dark)}
.pt-msg.is-sys .pt-bubble{background:none;padding:0;font-size:var(--text-xs);color:var(--text-muted)}
.pt-msg small{font-size:var(--text-xs);color:var(--text-muted)}
.pt-contact{display:flex;flex-direction:column;gap:6px;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--fill-success-soft);font-size:var(--text-sm)}
.pt-contact b{font-weight:var(--weight-semibold);color:var(--text-heading)}
.pt-contact span,.pt-contact a{display:flex;align-items:center;gap:8px;color:var(--text-body);overflow-wrap:anywhere}
.pt-contact a{color:var(--text-link)}
.pt-contact svg{flex:none;color:var(--text-muted)}
.pt-facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:var(--space-2)}
.pt-facts div{padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.pt-facts span{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.pt-facts b{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);overflow-wrap:anywhere}
.pt-share{display:flex;gap:var(--space-3);align-items:center}
.pt-share__qr{flex:none;padding:6px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);line-height:0}
.pt-share__main{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--space-2)}
.pt-share__main .gc-label{margin:0}
.pt-share__link{display:flex;gap:var(--space-2)}
.pt-share__link input{flex:1;min-width:0}
.pt-share__nets{flex:1;min-width:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
.pt-share__nets .ix-btn{justify-content:flex-start}
.pt-check{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.pt-check li{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.pt-check li:first-child{border-top:0}
.pt-check li>svg{flex:none;margin-top:2px}
.pt-check li.is-ok>svg{color:var(--text-success)}
.pt-check li.is-bad>svg{color:var(--text-danger)}
.pt-check b{display:block;font-weight:var(--weight-medium);color:var(--text-heading)}
.pt-check small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.pt-form{display:flex;flex-direction:column;gap:var(--space-3)}
.pt-form .gc-label{margin-bottom:4px}
.pt-grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:var(--space-3)}
.pt-toggles{display:flex;flex-wrap:wrap;gap:6px}
.pt-toggle{display:inline-flex;align-items:center;gap:6px;min-height:32px;padding:0 12px;border:1px solid var(--border-field);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.pt-toggle[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.pt-toggle:focus-visible{outline:2px solid var(--primary);outline-offset:1px}
.pt-rows{display:flex;flex-direction:column;gap:var(--space-2);margin:0;padding:0;list-style:none}
.pt-rows>li{display:grid;gap:var(--space-2);align-items:start;padding:var(--space-2);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.pt-rows--plat>li{grid-template-columns:150px minmax(0,1fr) 130px auto}
.pt-rows--pkg>li{grid-template-columns:minmax(0,1fr) 130px auto}
.pt-rows--pkg>li textarea{grid-column:1/-1}
.pt-rows--smp>li{grid-template-columns:72px minmax(0,1fr) auto}
.pt-smp-thumb{display:grid;place-items:center;width:72px;height:72px;border-radius:var(--radius-md);background:var(--surface-subtle) center/cover no-repeat;color:var(--text-muted)}
.pt-smp-fields{display:flex;flex-direction:column;gap:6px;min-width:0}
@media (max-width:640px){
  .pp-cover{height:150px}
  .pp-head{flex-direction:column;align-items:flex-start;gap:var(--space-2);padding:0 var(--space-4);margin-top:-44px}
  .pp-head .pp-av{width:88px!important;height:88px!important}
  .pp-who{padding-top:0}
  .pp-act{width:100%}
  .pp-act>*{flex:1}
  .pp-plat{grid-template-columns:repeat(2,minmax(0,1fr));padding:var(--space-3) var(--space-4) var(--space-4)}
  .pt-samples{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pt-share{flex-wrap:wrap}
  .pt-share__nets{flex-basis:100%}
  .pt-rows--plat>li{grid-template-columns:1fr 1fr}
  .pt-rows--pkg>li{grid-template-columns:1fr 1fr}
  .pt-rows--pkg>li>input:first-child{grid-column:1/-1}
  .pt-msg{max-width:94%}
}
`;
