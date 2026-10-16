'use client';
// accountParts (was storeAccount.jsx; renamed so it can sit beside StoreAccount.jsx on a Mac) — the shopper's account pieces shared by the store pages (Batch B step 2): the heart (wishlist) and
// compare buttons on product cards and the product page, the "Compare n products" bar at the bottom of the store, and
// useAccount() (the signed-in shopper, wishlist and compare lists, re-read on every change). The data is
// lib/storefront/account.js; the pages are /account (StoreAccount), /wishlist (StoreWishlist) and /compare (StoreCompare).

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { currentAccount, wishlist, compareList, toggleWishlist, toggleCompare, ACCOUNT_EVENT, COMPARE_MAX } from '@/lib/storefront/account';

/** The signed-in shopper (null for a guest), the wishlist and the compare list; after mount. */
export function useAccount() {
  const [st, setSt] = useState({ ready: false, account: null, wish: [], compare: [] });
  useEffect(() => {
    const load = () => setSt({ ready: true, account: currentAccount(), wish: wishlist(), compare: compareList() });
    load();
    window.addEventListener(ACCOUNT_EVENT, load);
    window.addEventListener('storage', load);
    return () => { window.removeEventListener(ACCOUNT_EVENT, load); window.removeEventListener('storage', load); };
  }, []);
  return st;
}

export function WishButton({ id, name, on, big }) {
  return (
    <button type="button" className={'sfa-ic' + (on ? ' is-on' : '') + (big ? ' is-big' : '')} aria-pressed={!!on} aria-label={on ? `Remove ${name} from the wishlist` : `Save ${name} to the wishlist`}
      onClick={(e) => { e.preventDefault(); const now = toggleWishlist(id); toast(now ? 'Saved to your wishlist' : 'Removed from your wishlist'); }}>
      <Icon name="heart" width={big ? 18 : 16} height={big ? 18 : 16} aria-hidden="true" />{big ? <span>{on ? 'Saved' : 'Wishlist'}</span> : null}
    </button>
  );
}
export function CompareButton({ id, name, on, big }) {
  return (
    <button type="button" className={'sfa-ic' + (on ? ' is-on' : '') + (big ? ' is-big' : '')} aria-pressed={!!on} aria-label={on ? `Remove ${name} from compare` : `Compare ${name}`}
      onClick={(e) => { e.preventDefault(); const r = toggleCompare(id); if (!r.ok) toast(r.error, { tone: 'error' }); else if (r.on && r.count >= 2) toast(`${r.count} products to compare`); }}>
      <Icon name="git-compare" width={big ? 18 : 16} height={big ? 18 : 16} aria-hidden="true" />{big ? <span>{on ? 'In compare' : 'Compare'}</span> : null}
    </button>
  );
}

/** "Compare 3 products · View" at the bottom of the store once two or more are picked. */
export function CompareBar({ preview }) {
  const { ready, compare } = useAccount();
  const [here, setHere] = useState(true);
  useEffect(() => { setHere(window.location.pathname === '/compare'); }, []);
  if (!ready || here || compare.length < 2) return null;
  return (
    <div className="sfa-bar" role="region" aria-label="Compare">
      <Icon name="git-compare" width="16" height="16" aria-hidden="true" />
      <span>{compare.length} of {COMPARE_MAX} to compare</span>
      <a className="sf-btn sf-btn--sm sf-btn--fill" href={'/compare' + (preview ? '?preview=1' : '')}>Compare</a>
    </div>
  );
}

export const ACCOUNT_CSS = `
.sfa-ic{display:inline-flex;align-items:center;justify-content:center;gap:6px;width:36px;height:36px;padding:0;border:1px solid var(--sf-line);border-radius:var(--radius-full);background:var(--sf-surface);color:var(--sf-muted);cursor:pointer;font:inherit}
.sfa-ic:hover{color:var(--sf-primary);border-color:var(--sf-primary)}
.sfa-ic.is-on{color:var(--sf-sale);border-color:currentColor}
.sfa-ic.is-on svg{fill:currentColor}
.sfa-ic.is-big{width:auto;height:40px;padding:0 14px;border-radius:var(--sf-radius-btn);color:var(--sf-text);font-size:var(--sf-fs-sm)}
.sfa-ic.is-big.is-on{color:var(--sf-sale)}
.sf-card__tools{position:absolute;top:8px;right:8px;z-index:2;display:flex;flex-direction:column;gap:6px}
.sf-card__tools .sfa-ic{box-shadow:0 2px 8px -4px rgba(15,23,42,.35)}
.sfa-bar{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(20px + var(--host-badge,0px));z-index:82;display:flex;align-items:center;gap:12px;padding:8px 8px 8px 16px;border:1px solid var(--sf-line);border-radius:var(--radius-full);background:var(--sf-surface);color:var(--sf-text);box-shadow:0 12px 28px -12px rgba(15,23,42,.45);font-size:var(--sf-fs-sm);white-space:nowrap}
.sfa-bar .sf-btn{border-radius:var(--radius-full)}
@media (max-width:899px){.has-bnav .sfa-bar{bottom:calc(68px + var(--host-badge,0px))}.sfa-bar{left:16px;transform:none}}
`;
