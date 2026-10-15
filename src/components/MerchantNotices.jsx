'use client';
// MerchantNotices — GridCommerce's announcements inside the merchant panel (SA-F4). Notices are written and scheduled
// in the super admin (Communications › Merchant notices, lib/platform/notices.js); this shows the ones live for this
// store (#0090 in the demo, matched by edition and plan) on every page that has the merchant top bar:
//   banner      the most important live notice this person has not dismissed (warnings first), right under the top bar,
//               with its link, "What's new (n)" when there are more, and Dismiss (per person) when the notice allows it
//   What's new  a side panel with every live notice (dismissed ones too) and the ones that ended in the last 14 days;
//               opened from the banner or the top bar's account menu (event gc:whats-new)
// Mounted once in the root layout. The banner is drawn into a slot placed right after <gc-topbar>, so it sits in the page
// flow under the bar and never covers the content. On phones its text keeps to three lines (What's new has it all).

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { Sheet, StatusBadge } from '@/components/ui';
import { formatDate, formatTime } from '@/lib/format';
import { currentEditionId } from '@/lib/edition';
import { currentPlanId } from '@/lib/plans';
import { currentUser } from '@/lib/team';
import { forStore, recentForStore, dismissed, dismiss, undismiss, EVENT, SELF_SHOP, EDITION_TO_LADDER, now } from '@/lib/platform/notices';

export const WHATS_NEW_EVENT = 'gc:whats-new';

const CSS = `
.gc-notice-slot{flex:none}
.mn-bar{display:flex;align-items:flex-start;gap:var(--space-3);margin:var(--space-3) var(--space-4) 0;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);font-size:var(--text-sm);line-height:20px}
.mn-bar--info{background:var(--fill-primary-soft);color:var(--text-heading)}
.mn-bar--warning{background:var(--fill-warning-soft);color:var(--text-heading)}
.mn-bar__ic{flex:none;display:grid;place-items:center;width:20px;height:20px;margin-top:0;color:var(--primary)}
.mn-bar--warning .mn-bar__ic{color:var(--text-warning)}
.mn-bar__txt{flex:1;min-width:0}
.mn-bar__txt b{font-weight:var(--weight-semibold)}
.mn-bar__txt span{color:var(--text-body)}
.mn-bar__acts{flex:none;display:flex;align-items:center;gap:var(--space-2)}
.mn-link{display:inline-flex;align-items:center;min-height:28px;padding:0 var(--space-2);border:0;border-radius:var(--radius-md);background:none;font:inherit;font-weight:var(--weight-medium);color:var(--primary);text-decoration:none;cursor:pointer;white-space:nowrap}
.mn-link:hover{background:var(--surface-card)}
.mn-x{display:grid;place-items:center;width:28px;height:28px;border:0;border-radius:var(--radius-full);background:none;color:var(--text-muted);cursor:pointer}
.mn-x:hover{background:var(--surface-card);color:var(--text-heading)}
.mn-list{display:flex;flex-direction:column;gap:var(--space-3);margin:0;padding:0;list-style:none}
.mn-item{display:flex;flex-direction:column;gap:6px;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.mn-item__top{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-2)}
.mn-item__top b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.mn-item p{margin:0;font-size:var(--text-sm);color:var(--text-body)}
.mn-item small{font-size:var(--text-xs);color:var(--text-muted)}
.mn-item__foot{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.mn-sub{margin:var(--space-4) 0 var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.mn-empty{margin:0;font-size:var(--text-sm);color:var(--text-muted)}
@media (max-width:640px){
  .mn-bar{position:relative;flex-wrap:wrap;gap:4px var(--space-3);margin:var(--space-2) var(--space-3) 0;padding-right:44px}
  .mn-bar__txt{display:-webkit-box;overflow:hidden;-webkit-line-clamp:3;-webkit-box-orient:vertical}
  .mn-bar__acts{width:100%;padding-left:32px}
  .mn-bar__acts .mn-link{min-height:36px;padding:0}
  .mn-item .mn-link{min-height:36px}
  .mn-x{position:absolute;top:2px;right:2px;width:36px;height:36px}
}
`;

const when = (t) => `${formatDate(t)}, ${formatTime(t)}`;
/** This store as the notices see it: the platform id, its edition and plan (the panel's own, previews included). */
function storeNow() {
  let ed = 'full', plan = 'business';
  try { ed = currentEditionId(); } catch { /* ignore */ }
  try { plan = currentPlanId(); } catch { /* ignore */ }
  return { id: SELF_SHOP, ladder: EDITION_TO_LADDER[ed] || 'retail-online', plan };
}
const personId = () => { try { return (currentUser() || {}).id || 'me'; } catch { return 'me'; } };

function windowText(n) {
  if (!n.window) return '';
  return `Down ${when(n.window.from)} – ${formatTime(n.window.to)}`;
}

export function MerchantNotices() {
  const path = usePathname() || '';
  const [slot, setSlot] = useState(null);
  const [data, setData] = useState(null);   // { live, recent, gone }
  const [open, setOpen] = useState(false);

  // the slot under the merchant top bar (pages without the bar get no banner)
  useEffect(() => {
    let el = null;
    const place = () => {
      const bar = document.querySelector('gc-topbar');
      if (!bar || !bar.parentNode) { setSlot(null); return; }
      // a page whose bar sits in a sticky header (Settings) gets the banner under that header, so it scrolls away
      let at = bar;
      for (let p = bar.parentElement, i = 0; p && p !== document.body && i < 3; p = p.parentElement, i += 1) {
        if (getComputedStyle(p).position === 'sticky') { at = p; break; }
      }
      el = at.nextElementSibling && at.nextElementSibling.classList.contains('gc-notice-slot') ? at.nextElementSibling : null;
      if (!el) { el = document.createElement('div'); el.className = 'gc-notice-slot'; at.insertAdjacentElement('afterend', el); }
      setSlot(el);
    };
    place();
    const t = window.setTimeout(place, 400);
    return () => { window.clearTimeout(t); if (el && el.parentNode) el.parentNode.removeChild(el); setSlot(null); };
  }, [path]);

  useEffect(() => {
    const read = () => {
      try {
        const store = storeNow();
        const t = now();
        setData({ live: forStore(store, t), recent: recentForStore(store, t), gone: dismissed(personId()) });
      } catch { setData({ live: [], recent: [], gone: [] }); }
    };
    read();
    const show = () => { read(); setOpen(true); };
    const onStorage = (e) => { if (!e.key || /notices/.test(e.key)) read(); };
    window.addEventListener(EVENT, read);
    window.addEventListener('gc:session', read);
    window.addEventListener('gc:edition', read);
    window.addEventListener('gc:plan', read);
    window.addEventListener('storage', onStorage);
    window.addEventListener(WHATS_NEW_EVENT, show);
    const iv = window.setInterval(read, 60000);
    return () => {
      window.removeEventListener(EVENT, read);
      window.removeEventListener('gc:session', read);
      window.removeEventListener('gc:edition', read);
      window.removeEventListener('gc:plan', read);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(WHATS_NEW_EVENT, show);
      window.clearInterval(iv);
    };
  }, []);

  if (!data) return null;
  const top = data.live.find((n) => !(n.dismissible && data.gone.includes(n.id))) || null;
  const more = data.live.length - (top ? 1 : 0);
  const who = personId();

  const banner = top && slot && !path.startsWith('/admin') ? createPortal(
    <div className={'mn-bar mn-bar--' + (top.severity === 'warning' ? 'warning' : 'info')} role={top.severity === 'warning' ? 'alert' : 'status'}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <span className="mn-bar__ic" aria-hidden="true"><Icon name={top.kind === 'maintenance' ? 'wrench' : top.severity === 'warning' ? 'triangle-alert' : 'megaphone'} width="18" height="18" /></span>
      <span className="mn-bar__txt"><b>{top.title}</b>{' '}<span>{top.kind === 'maintenance' && top.window ? windowText(top) + '. ' : ''}{top.text}</span></span>
      <span className="mn-bar__acts">
        {top.link ? <a className="mn-link" href={top.link.href}>{top.link.label}</a> : null}
        {more > 0 ? <button type="button" className="mn-link" onClick={() => setOpen(true)}>{`What’s new (${more + 1})`}</button> : null}
        {top.dismissible ? <button type="button" className="mn-x" aria-label="Dismiss" title="Dismiss" onClick={() => dismiss(top.id, who)}><Icon name="x" width="16" height="16" /></button> : null}
      </span>
    </div>,
    slot,
  ) : null;

  const item = (n, ended) => (
    <li key={n.id} className="mn-item">
      <span className="mn-item__top">
        <b>{n.title}</b>
        {ended ? <StatusBadge tone="neutral">Ended</StatusBadge> : n.severity === 'warning' ? <StatusBadge tone="warning">{n.kind === 'maintenance' ? 'Maintenance' : 'Important'}</StatusBadge> : <StatusBadge tone="primary">New</StatusBadge>}
      </span>
      {n.window ? <small>{windowText(n)}</small> : null}
      <p>{n.text}</p>
      <span className="mn-item__foot">
        <small>{formatDate(n.startAt)}</small>
        {n.link ? <a className="mn-link" href={n.link.href}>{n.link.label}</a> : null}
        {!ended && n.dismissible && data.gone.includes(n.id) ? <button type="button" className="mn-link" onClick={() => undismiss(n.id, who)}>Show on top again</button> : null}
      </span>
    </li>
  );

  return (
    <>
      {banner}
      <Sheet open={open} title="What’s new" onClose={() => setOpen(false)}>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {data.live.length ? <ul className="mn-list">{data.live.map((n) => item(n, false))}</ul> : <p className="mn-empty">No news from GridCommerce right now.</p>}
        {data.recent.length ? (
          <>
            <p className="mn-sub">Earlier</p>
            <ul className="mn-list">{data.recent.map((n) => item(n, true))}</ul>
          </>
        ) : null}
      </Sheet>
    </>
  );
}
