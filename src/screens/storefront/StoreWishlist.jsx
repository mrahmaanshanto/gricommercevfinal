'use client';
// Wishlist — the products the shopper saved with the heart (/wishlist; Batch B step 2). Kept in this browser for a guest
// and with the account once signed in (a guest's list joins the account at sign-in; lib/storefront/account.js). Share
// copies a link (/wishlist?ids=…) anyone can open: it shows those products with "Save all to my wishlist".
// Add all to cart puts every product that can be sold now in the cart. A signed-in shopper's own list opens in My account
// (Batch C step 1); this page stays for shared links and guests.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { storeProducts, refreshCatalog } from '@/lib/storefront/catalog';
import { wishlistLink, toggleWishlist } from '@/lib/storefront/account';
import { skuForProduct, addToCart, openSideCart } from '@/lib/storefront/cart';
import { StoreChrome, Crumbs } from './storeChrome';
import { ProductCard } from './storeKit';
import { useAccount } from './accountParts';

const HEAD = { title: 'Wishlist', description: '', robots: 'noindex, follow', canonical: '', og: {}, jsonld: [] };
const CSS = `
.swl{padding-bottom:var(--sf-section);display:flex;flex-direction:column;gap:16px}
.swl-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px}
.swl-head h1{font-size:var(--sf-fs-h1)}
.swl-acts{display:flex;flex-wrap:wrap;gap:8px}
.swl-note{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:12px 16px;border-radius:var(--sf-radius);background:var(--sf-soft);font-size:var(--sf-fs-sm)}
.swl-empty{display:flex;flex-direction:column;align-items:flex-start;gap:12px;padding:28px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
`;

export default function StoreWishlist() {
  const acc = useAccount();
  const [shared, setShared] = useState(null);   // ids from a shared link, or null for the shopper's own list
  const [all, setAll] = useState(null);
  useEffect(() => {
    const ids = new URLSearchParams(window.location.search).get('ids');
    setShared(ids ? ids.split(',').map((x) => x.trim()).filter(Boolean) : null);
    refreshCatalog();
    setAll(storeProducts());
  }, []);
  // a signed-in shopper's own list is a tab of My account (Batch C step 1); this page stays for shared links and guests
  useEffect(() => {
    if (!acc.ready || !acc.account || shared === null && !all) return;
    if (!shared) window.location.replace('/account?tab=wishlist' + (new URLSearchParams(window.location.search).get('preview') === '1' ? '&preview=1' : ''));
  }, [acc.ready, acc.account, shared, all]);
  const ids = shared || acc.wish;
  const list = useMemo(() => (all ? ids.map((id) => all.find((p) => p.id === id)).filter(Boolean) : null), [all, ids]);

  const share = async () => {
    const url = window.location.origin + wishlistLink(acc.wish);
    try {
      if (navigator.share) { await navigator.share({ title: 'My wishlist', url }); return; }
      await navigator.clipboard.writeText(url);
      toast('Link copied. Anyone with it can see these products.');
    } catch { toast('Copy this link: ' + url); }
  };
  const addAll = () => {
    let n = 0;
    (list || []).forEach((p) => { if (p.stock > 0 || p.oversell) { const sku = skuForProduct(p.id); if (sku) { addToCart(sku, 1); n += 1; } } });
    if (n) openSideCart(); else toast('None of these can be bought right now.', { tone: 'error' });
  };
  const saveAll = () => { let n = 0; (list || []).forEach((p) => { if (!acc.wish.includes(p.id)) { toggleWishlist(p.id); n += 1; } }); toast(n ? `${n} saved to your wishlist` : 'They are all in your wishlist already'); };

  return (
    <StoreChrome screen="StoreWishlist" kind="page" head={HEAD} css={CSS}>
      {(shell) => {
        const q = shell.preview ? '?preview=1' : '';
        if (!acc.ready || !list || (!shared && acc.account)) return <div className="sf-wrap" style={{ minHeight: 420 }} aria-busy="true" />;
        return (
          <div className="sf-wrap swl">
            <Crumbs items={[{ name: shared ? 'Shared wishlist' : 'Wishlist' }]} />
            <div className="swl-head">
              <h1>{shared ? 'A shared wishlist' : 'Your wishlist'}</h1>
              {list.length ? (
                <div className="swl-acts">
                  {shared ? <button type="button" className="sf-btn sf-btn--line sf-btn--sm" onClick={saveAll}><Icon name="heart" width="16" height="16" aria-hidden="true" />Save all to my wishlist</button>
                    : <button type="button" className="sf-btn sf-btn--line sf-btn--sm" onClick={share}><Icon name="share-2" width="16" height="16" aria-hidden="true" />Share</button>}
                  <button type="button" className="sf-btn sf-btn--fill sf-btn--sm" onClick={addAll}><Icon name="shopping-bag" width="16" height="16" aria-hidden="true" />Add all to cart</button>
                </div>
              ) : null}
            </div>
            {!shared && !acc.account && list.length ? <p className="swl-note"><span>Saved on this device only.</span><a className="sf-link" href={'/account' + (q ? q + '&' : '?') + 'next=wishlist'}>Sign in to keep it everywhere</a></p> : null}
            {shared && !list.length ? <div className="swl-empty"><b>These products are not sold any more</b><a className="sf-btn sf-btn--fill" href={'/store' + q}>Go to the shop</a></div> : null}
            {!shared && !list.length ? (
              <div className="swl-empty">
                <b>Nothing saved yet</b>
                <span className="sf-muted">Tap <Icon name="heart" width="14" height="14" aria-hidden="true" /> on a product to save it here.</span>
                <a className="sf-btn sf-btn--fill" href={'/store' + q}>Keep shopping</a>
              </div>
            ) : null}
            {list.length ? <div className="sf-grid">{list.map((p) => <ProductCard key={p.id} p={p} values={shell.values} />)}</div> : null}
          </div>
        );
      }}
    </StoreChrome>
  );
}
