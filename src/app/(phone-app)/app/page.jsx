'use client';
// /app — the mobile app's entry (the account menu's "Mobile app" row, the home-screen icon's fallback):
// opens the app's Home. A client redirect after mount, so the page prerenders as a plain link.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AppEntry() {
  const router = useRouter();
  useEffect(() => { router.replace('/m-home'); }, [router]);
  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
      <a href="/m-home" style={{ color: '#003087' }}>Open the GridCommerce app</a>
    </main>
  );
}
