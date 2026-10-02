'use client';
// StockSetupBanner — after the shop moves to another edition (online only ↔ with a store), a short note on Home and
// Stock that links to Settings › Stock setup (src/lib/stockSetup.js › needsSetup). Shows nothing otherwise.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { getStockSetup, STOCK_SETUP_EVENT } from '@/lib/stockSetup';
import { EDITION_EVENT, currentEdition } from '@/lib/edition';

export function StockSetupBanner() {
  const [show, setShow] = useState(null);
  useEffect(() => {
    const check = () => setShow(getStockSetup().needsSetup ? currentEdition().short : null);
    check();
    window.addEventListener(STOCK_SETUP_EVENT, check);
    window.addEventListener(EDITION_EVENT, check);
    return () => { window.removeEventListener(STOCK_SETUP_EVENT, check); window.removeEventListener(EDITION_EVENT, check); };
  }, []);
  if (!show) return null;
  return (
    // one line (UI/UX audit): the key numbers stay the first thing on the page
    <div role="status" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minHeight: 40, padding: '0 var(--space-2) 0 var(--space-3)', borderRadius: 'var(--radius-lg)', background: 'var(--fill-warning-soft)', color: 'var(--text-warning)', fontSize: 'var(--text-sm)' }}>
      <Icon name="refresh-cw" width="16" height="16" aria-hidden="true" style={{ flex: 'none' }} />
      <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Now {show} — check stock setup</span>
      <Link href="/stock-setup" className="gc-btn gc-btn--xs gc-btn--flat">Set up stock</Link>
    </div>
  );
}
