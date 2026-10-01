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
    <div className="gc-alert gc-alert--soft gc-alert--warning" role="status" style={{ alignItems: 'center' }}>
      <Icon name="refresh-cw" width="18" height="18" aria-hidden="true" />
      <span style={{ flex: 1 }}>Your shop is now {show}. Check your stock setup.</span>
      <Link href="/stock-setup" className="gc-btn gc-btn--sm gc-btn--solid">Set up stock</Link>
    </div>
  );
}
