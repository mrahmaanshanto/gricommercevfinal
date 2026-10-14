'use client';
// AppSession — who may open the merchant app (/m-*). Mounted by src/app/(phone-app)/layout.jsx around every phone-app
// page, but it acts on the app's own pages only (/m-*): onboarding (/onb-*), the staff console (/c-*) and the screen
// gallery are left alone, and the web panel never sees it (it keeps team.js › currentUser()'s demo fallback).
//   hasSession()       a demo account is saved as signed in in this browser (team.js SESSION_KEY)
//   ?as=<user id>      signs in as that demo account first (demo links and screenshots)
//   no session         → /onb-sign-in?next=<this page> (the page is covered while it moves, so nobody else's data shows)
//   a page shown inside another (the /app-screens gallery thumbnails) is not moved: it previews as the demo owner
// Front end only: a real app keeps a session token from the server and checks it on every request.

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SESSION_KEY, SESSION_EVENT, userBy, signInAs } from '@/lib/team';

export const APP_SIGN_IN = '/onb-sign-in';
const GUARDED = /^\/m-[a-z0-9-]+\/?$/;

export function hasSession() {
  if (typeof window === 'undefined') return false;
  try { return !!userBy(window.localStorage.getItem(SESSION_KEY)); } catch { return false; }
}
const framed = () => { try { return window.self !== window.top; } catch { return true; } };

/** Where to go after signing in: `next` from the address when it is an app page, else Home. */
export function nextFrom(q) {
  const n = q ? q.get('next') || '' : '';
  return /^\/m-[a-z0-9-]+/.test(n) ? n : '/m-home';
}

export default function AppSessionGate({ children }) {
  const path = usePathname() || '';
  const router = useRouter();
  const [out, setOut] = useState(false);
  useEffect(() => {
    if (!GUARDED.test(path) || framed()) { setOut(false); return undefined; }
    const check = () => {
      const q = new URLSearchParams(window.location.search);
      const as = q.get('as');
      if (as && userBy(as)) {
        let cur = null;
        try { cur = window.localStorage.getItem(SESSION_KEY); } catch { /* ignore */ }
        if (cur !== as) signInAs(as);
        setOut(false);
        return;
      }
      if (hasSession()) { setOut(false); return; }
      setOut(true);
      router.replace(APP_SIGN_IN + '?next=' + encodeURIComponent(window.location.pathname + window.location.search));
    };
    check();
    // signed out in another tab (or by Sign out here): leave the app page
    const onSession = () => { if (!hasSession()) { setOut(true); router.replace(APP_SIGN_IN); } };
    window.addEventListener(SESSION_EVENT, onSession);
    window.addEventListener('storage', onSession);
    return () => { window.removeEventListener(SESSION_EVENT, onSession); window.removeEventListener('storage', onSession); };
  }, [path, router]);
  return (
    <>
      {children}
      {out ? <div role="status" aria-label="Opening sign in" style={{ position: 'fixed', inset: 0, zIndex: 2147483000, background: '#f5f7fa' }} /> : null}
    </>
  );
}
