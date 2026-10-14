'use client';
// /app — the mobile app's entry (the account menu's "Mobile app" row, the home-screen icon's fallback): opens the app's
// Home when someone is signed in in this browser, else the app's sign-in (/onb-sign-in; screens/app/kit/AppSession.jsx).
// A client redirect after mount, so the page prerenders as a plain link.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hasSession, APP_SIGN_IN } from '@/screens/app/kit/AppSession';

export default function AppEntry() {
  const router = useRouter();
  useEffect(() => { router.replace(hasSession() ? '/m-home' : APP_SIGN_IN); }, [router]);
  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
      <a href="/m-home" style={{ color: '#003087' }}>Open the GridCommerce app</a>
    </main>
  );
}
