'use client';
// DemoClockReady — mounted once in the root layout: after the page has hydrated, the demo's seed dates start to
// follow the real clock (lib/demoClock.js). Renders nothing.
import { useEffect } from 'react';
import { demoClockReady } from '@/lib/demoClock';

export function DemoClockReady() {
  useEffect(() => { demoClockReady(); }, []);
  return null;
}
