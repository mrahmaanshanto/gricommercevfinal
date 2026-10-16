'use client';
// storeNotices — the store notices on customer pages (Online Store › Store notices, lib/storefront/notices.js): a bar
// above or under the header, inside the header (its Store notice element) or floating on phones. Several notices in one
// place take turns every 6 seconds (paused while the pointer or focus is on it, and for people who ask for less motion);
// each can carry a button, a coupon code with Copy, a countdown to its end and a close button.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, getLocale } from '@/runtime/ui';
import { clockNow } from '@/lib/settlements';
import { websiteOffers, promoLine } from '@/lib/storeOffers';
import { closeNotice } from '@/lib/storefront/notices';
import { deviceClass } from '@/lib/storefront/show';

const pad = (n) => (n < 10 ? '0' : '') + n;
function left(ms) {
  if (ms <= 0) return 'Ended';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  return (d ? d + 'd ' : '') + pad(h) + ':' + pad(Math.floor((s % 3600) / 60)) + ':' + pad(s % 60);
}

function textOf(n) {
  const bn = getLocale() === 'bn';
  if (n.from === 'offers') {
    let line = null;
    try { line = promoLine(websiteOffers(clockNow())); } catch { line = null; }
    if (line) return bn ? line.bn : line.en;
  }
  return (bn && n.textBn) || n.text || '';
}

function One({ n, now, onClose }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    try { navigator.clipboard.writeText(n.code); } catch { /* ignore */ }
    setCopied(true);
    toast(`Code ${n.code} copied`);
    setTimeout(() => setCopied(false), 1600);
  };
  const end = n.end ? Date.parse(n.end) : 0;
  return (
    <div className="sfn-one">
      <span className="sfn-text">{textOf(n)}</span>
      {n.countdown && end ? <span className="sfn-count" aria-label="Time left"><Icon name="timer" width="14" height="14" aria-hidden="true" />{left(end - now)}</span> : null}
      {n.code ? <button type="button" className="sfn-code" onClick={copy} aria-label={`Copy code ${n.code}`}><b>{n.code}</b><Icon name={copied ? 'check' : 'copy'} width="14" height="14" aria-hidden="true" /></button> : null}
      {n.button && n.link ? <a className="sfn-btn" href={n.link}>{n.button}</a> : null}
      {n.dismiss ? <button type="button" className="sfn-x" aria-label="Close this notice" onClick={() => onClose(n.id)}><Icon name="x" width="16" height="16" aria-hidden="true" /></button> : null}
    </div>
  );
}

/** One place's notices for one set of devices; they take turns when there are several. */
function Bar({ list, place, cls = '' }) {
  const [i, setI] = useState(0);
  const [now, setNow] = useState(() => clockNow());
  const [hold, setHold] = useState(false);
  const [gone, setGone] = useState({});
  const shown = list.filter((n) => !gone[n.id]);
  const ticking = shown.some((n) => n.countdown && n.end);
  useEffect(() => {
    if (!ticking && shown.length < 2) return undefined;
    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let n = 0;
    const t = setInterval(() => {
      n += 1;
      if (ticking) setNow(clockNow());
      if (shown.length > 1 && !hold && !reduce && n % 6 === 0) setI((x) => (x + 1) % shown.length);
    }, 1000);
    return () => clearInterval(t);
  }, [ticking, shown.length, hold]);
  if (!shown.length) return null;
  const cur = shown[i % shown.length];
  const close = (id) => { closeNotice(id); setGone((g) => ({ ...g, [id]: true })); };
  return (
    <div className={'sfn sfn--' + place + ' tone-' + (cur.tone || 'accent') + (cls ? ' ' + cls : '')} role="region" aria-label="Store notice"
      onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)} onFocus={() => setHold(true)} onBlur={() => setHold(false)}>
      <div className="sfn-in" aria-live="polite">
        {shown.length > 1 ? <button type="button" className="sfn-nav" aria-label="Previous notice" onClick={() => setI((x) => (x - 1 + shown.length) % shown.length)}><Icon name="chevron-left" width="16" height="16" aria-hidden="true" /></button> : null}
        <One key={cur.id} n={cur} now={now} onClose={close} />
        {shown.length > 1 ? <button type="button" className="sfn-nav" aria-label="Next notice" onClick={() => setI((x) => (x + 1) % shown.length)}><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button> : null}
      </div>
    </div>
  );
}

/**
 * The notices of one place. When some are for one device only, the computer and the phone each get their own bar so a
 * hidden notice never leaves an empty turn.
 */
export function NoticeBar({ list, place }) {
  const items = list || [];
  if (!items.length) return null;
  const mixed = items.some((n) => n.show && n.show.devices && n.show.devices !== 'all');
  if (place === 'phone-bar') return <Bar list={items.filter((n) => !n.show || n.show.devices !== 'desktop')} place={place} cls="sf-only-mobile" />;
  if (!mixed) return <Bar list={items} place={place} />;
  return (<>
    <Bar list={items.filter((n) => n.show.devices !== 'mobile')} place={place} cls={deviceClass('desktop')} />
    <Bar list={items.filter((n) => n.show.devices !== 'desktop')} place={place} cls={deviceClass('mobile')} />
  </>);
}

export const NOTICES_CSS = `
.sfn{position:relative;z-index:41;font-size:var(--sf-fs-sm);font-weight:var(--weight-medium)}
.sfn.tone-accent{background:var(--sf-accent);color:var(--sf-on-accent)}
.sfn.tone-primary{background:var(--sf-primary);color:var(--sf-on-primary)}
.sfn.tone-dark{background:#0f172a;color:#e2e8f0}
.sfn.tone-light{background:var(--sf-surface);color:var(--sf-text);border-bottom:1px solid var(--sf-line)}
.sfn.tone-sale{background:var(--sf-sale);color:var(--sf-on-sale)}
.sfn-in{display:flex;align-items:center;justify-content:center;gap:8px;max-width:var(--sf-width);min-height:36px;margin:0 auto;padding:4px 16px;box-sizing:border-box}
.sfn-one{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:6px 12px;min-width:0;text-align:center}
.sfn-text{min-width:0}
.sfn-count{display:inline-flex;align-items:center;gap:4px;font-family:var(--font-data);font-variant-numeric:tabular-nums}
.sfn-code{display:inline-flex;align-items:center;gap:6px;min-height:28px;padding:0 10px;border:1px dashed currentColor;border-radius:var(--sf-radius-btn);background:transparent;color:inherit;font:inherit;cursor:pointer}
.sfn-code b{font-family:var(--font-data);letter-spacing:.04em}
.sfn-btn{display:inline-flex;align-items:center;min-height:28px;padding:0 12px;border:1px solid currentColor;border-radius:var(--sf-radius-btn);background:rgba(255,255,255,.18);color:inherit;text-decoration:none}
.sfn.tone-light .sfn-btn{background:var(--sf-primary);color:var(--sf-on-primary);border-color:var(--sf-primary)}
.sfn-x,.sfn-nav{display:inline-grid;place-items:center;flex:none;width:36px;height:36px;border:0;background:none;color:inherit;cursor:pointer;opacity:.85}
.sfn-x{position:absolute;right:4px;top:50%;margin-top:-18px}
.sfn-x:hover,.sfn-nav:hover{opacity:1}
.sfn-one:has(.sfn-x){padding-right:32px}
.sfn--header{background:transparent!important;color:inherit!important;border:0!important}
.sfn--header .sfn-in{min-height:0;padding:0;max-width:none}
.sfn--phone-bar{position:fixed;left:8px;right:8px;bottom:calc(64px + var(--host-badge,0px));z-index:92;border-radius:var(--sf-radius-card);box-shadow:0 12px 28px -10px rgba(15,23,42,.45)}
.sf-theme:not(.has-bnav) .sfn--phone-bar{bottom:calc(8px + var(--host-badge,0px))}
.sf-only-mobile{display:none}
@media (max-width:899px){
  .sf-theme:has(.sfn--phone-bar) .sf-chat{bottom:calc(128px + var(--host-badge,0px))}
  .sf-theme:not(.has-bnav):has(.sfn--phone-bar) .sf-chat{bottom:calc(72px + var(--host-badge,0px))}
  .sf-only-desktop{display:none!important}
  .sf-only-mobile{display:block}
  .sfn-in{padding:4px 8px}
}
`;
