'use client';
// AppBackBar — the way back to the phone app. Some app screens hand a job to the web panel ("Open on the web", "Edit on
// the web" …). The installed app opens those pages in the same window and an installed iPhone app has no back button,
// so a web page reached from the app shows a slim "‹ Back to app" bar at the top, and only then.
//   marked   a tap on a link from an app page (/m-*) to a web page remembers the app page it came from (this tab's
//            session storage, gc.app.back); a web link that adds ?from=app marks itself (back to Home, or the app page
//            it was opened from)
//   shown    on every web page while the mark is there, so moving around the web panel keeps the way back
//   cleared  when an app page opens again (the bar, the browser's back or a link)
// Not on sign-in pages, the onboarding and console screens or pages shown inside another (the screen gallery).
// Mounted once in the root layout (src/app/layout.jsx), before the page.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const KEY = 'gc.app.back';
const APP_PAGE = /^\/m-[a-z0-9-]+\/?$/;
// pages that never get the bar: the app's own screens, onboarding, the staff console, the gallery and sign-in
const NO_BAR = /^\/(m-[a-z0-9-]+|app|app-screens|app-system|onb-[a-z0-9-]+|c-[a-z0-9-]+|merchant-sign-in|mobile-sign-in|mobile-sign-up|merchant-onboarding)\/?$/;

const read = () => { try { const v = JSON.parse(window.sessionStorage.getItem(KEY)); return v && v.href ? v : null; } catch { return null; } };
const write = (v) => { try { if (v) window.sessionStorage.setItem(KEY, JSON.stringify(v)); else window.sessionStorage.removeItem(KEY); } catch { /* blocked */ } };
const framed = () => { try { return window.self !== window.top; } catch { return true; } };

const CSS = `
.gc-appback{display:flex;align-items:center;gap:var(--space-2,8px);min-height:36px;padding:env(safe-area-inset-top,0px) var(--space-3,12px) 0;background:var(--primary);color:#fff;font-family:var(--font-sans);font-size:var(--text-sm);position:relative;z-index:120}
.gc-appback a{display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 10px 0 4px;border-radius:var(--radius-lg);color:#fff;font-weight:var(--weight-medium);text-decoration:none}
.gc-appback a:hover{background:rgba(255,255,255,.12)}
.gc-appback a:focus-visible{outline:2px solid #fff;outline-offset:2px}
.gc-appback svg{flex:none}
@media print{.gc-appback{display:none}}
`;

export function AppBackBar() {
  const path = usePathname() || '';
  const [back, setBack] = useState(null);

  // where we are now: an app page clears the mark; a web page shows the bar while it is marked
  useEffect(() => {
    if (framed()) { setBack(null); return; }
    if (APP_PAGE.test(path)) { write(null); setBack(null); return; }
    if (NO_BAR.test(path)) { setBack(null); return; }
    const q = new URLSearchParams(window.location.search);
    if (q.get('from') === 'app' && !read()) {
      let href = '/m-home';
      try { const r = new URL(document.referrer); if (r.origin === window.location.origin && APP_PAGE.test(r.pathname)) href = r.pathname + r.search; } catch { /* no referrer */ }
      write({ href, at: Date.now() });
    }
    setBack(read());
  }, [path]);

  // a link from an app page to a web page remembers the app page
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!APP_PAGE.test(window.location.pathname)) return;
      const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      let url;
      try { url = new URL(a.getAttribute('href'), window.location.href); } catch { return; }
      if (url.origin !== window.location.origin || NO_BAR.test(url.pathname)) return;
      write({ href: window.location.pathname + window.location.search, at: Date.now() });
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  if (!back) return null;
  return (
    <div className="gc-appback" role="navigation" aria-label="Phone app">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Link href={back.href} prefetch={false}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        Back to app
      </Link>
    </div>
  );
}
