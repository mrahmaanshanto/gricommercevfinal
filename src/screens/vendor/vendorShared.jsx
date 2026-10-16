'use client';
// vendorShared — the Grid Shop vendor portal's frame and shared parts (Batch E). The portal is its own small app (no
// merchant menu, like the custom-offer payment page): a left menu (Home, Products, Orders, Money, Profile) with the vendor's
// logo and name in the top bar and Sign out; on phones the menu is a bottom tab bar. Pages: /vendor-sign-in (demo: tap a
// vendor), /vendor, /vendor-products, /vendor-product?id=, /vendor-orders, /vendor-order?id=&s=, /vendor-money,
// /vendor-profile. Data: lib/platform/gridShop.js (the same store the merchant panel and the super admin use; the session
// is gc.vendor.session). useVendor() reads it after mount and again on gc:gridshop and from other tabs.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { EmptyState, StatusBadge } from '@/components/ui';
import { Pic } from '@/components/ui/Pic';
import { read, GS_EVENT, GS_KEY, VENDOR_SESSION, currentVendor, vendorSignOut, vendorParcels, reviewOf, REVIEW, SHIP_STATUS, productById } from '@/lib/platform/gridShop';
import { productPic } from '@/lib/pictures';
import { navigate } from '@/runtime/routes';

export const tk = (n) => '৳' + Math.round(n || 0).toLocaleString('en-IN');
export const qp = (k) => (typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get(k) || '');
export const dShort = (ms) => (ms ? new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—');
export const dTime = (ms) => (ms ? new Date(ms).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—');
/** The picture of a product or an order line (its product's cover). */
export const picOf = (x) => productPic(x && x.productId ? productById(x.productId) || x : x);
export const say = (toast, r, ok) => { if (r && r.ok === false) { toast(r.error, { tone: 'error' }); return false; } if (ok) toast(ok); return true; };

/** { ready, tick, vendor } — the signed-in vendor after mount. */
export function useVendor() {
  const [st, set] = useState({ ready: false, tick: 0, vendor: null });
  useEffect(() => {
    const load = () => { read(); set((x) => ({ ready: true, tick: x.tick + 1, vendor: currentVendor() })); };
    load();
    const onStorage = (e) => { if (!e.key || e.key === GS_KEY || e.key === VENDOR_SESSION) load(); };
    window.addEventListener(GS_EVENT, load); window.addEventListener('storage', onStorage);
    return () => { window.removeEventListener(GS_EVENT, load); window.removeEventListener('storage', onStorage); };
  }, []);
  return st;
}

export const NAV = [
  { id: 'home', href: '/vendor', label: 'Home', icon: 'layout-dashboard' },
  { id: 'products', href: '/vendor-products', label: 'Products', icon: 'package' },
  { id: 'orders', href: '/vendor-orders', label: 'Orders', icon: 'truck' },
  { id: 'money', href: '/vendor-money', label: 'Money', icon: 'wallet' },
  { id: 'profile', href: '/vendor-profile', label: 'Profile', icon: 'store' },
];

/** A product's state for the vendor: { label, tone, sub } */
export function productState(p) {
  const r = reviewOf(p);
  if (r === 'live') return p.status === 'live' ? { label: 'On sale', tone: 'success' } : { label: 'Paused', tone: 'neutral' };
  return { ...REVIEW[r], sub: r === 'rejected' ? (p.review && p.review.reason) || '' : '' };
}
export function ProductBadge({ p }) {
  const s = productState(p);
  return <>{<StatusBadge tone={s.tone}>{s.label}</StatusBadge>}{p.pendingChange ? <> <StatusBadge tone="warning">Change waiting</StatusBadge></> : null}</>;
}
/** One badge for the approval state (Home's list): Waiting for approval · Change waiting · Rejected · Draft. */
export function ApprovalBadge({ p }) {
  const r = reviewOf(p);
  if (r === 'live' && p.pendingChange) return <StatusBadge tone="warning">Change waiting</StatusBadge>;
  return <StatusBadge tone={(REVIEW[r] || REVIEW.draft).tone}>{(REVIEW[r] || REVIEW.draft).label}</StatusBadge>;
}
const SHIP_TONE = { sent: 'warning', accepted: 'info', packing: 'info', shipped: 'primary', delivered: 'success' };
export const parcelWord = (s) => (s.status === 'sent' ? 'New · to accept' : SHIP_STATUS[s.status] || s.status);
export function ParcelBadge({ s }) { return <StatusBadge tone={SHIP_TONE[s.status] || 'neutral'}>{parcelWord(s)}</StatusBadge>; }

/** The portal frame. active = a NAV id. */
export function VendorFrame({ active, screen, css = '', children, after }) {
  const { ready, vendor } = useVendor();
  const toShip = ready && vendor ? vendorParcels(vendor.id).filter((x) => x.state === 'ship').length : 0;
  const out = () => { vendorSignOut(); navigate('/vendor-sign-in'); };
  const count = (id) => (id === 'orders' && toShip ? toShip : null);
  return (
    <div className="dc-screen ds vd" data-screen={screen}>
      <style dangerouslySetInnerHTML={{ __html: VD_CSS + css }} />
      <div className="vd-shell">
        <aside className="vd-side" aria-label="Vendor menu">
          <Link href="/vendor" className="vd-brand"><span className="vd-brand__ico" aria-hidden="true"><Icon name="shopping-bag" width="18" height="18" /></span><span><b>Grid Shop</b><small>Vendor portal</small></span></Link>
          <nav className="vd-nav" aria-label="Vendor portal">
            {NAV.map((n) => <Link key={n.id} href={n.href} aria-current={active === n.id ? 'page' : undefined}><Icon name={n.icon} width="16" height="16" aria-hidden="true" /><span>{n.label}</span>{count(n.id) ? <span className="vd-n">{count(n.id)}</span> : null}</Link>)}
          </nav>
          <p className="vd-side__foot">Demo portal. Everything stays in this browser.</p>
        </aside>
        <div className="vd-main">
          <header className="vd-top">
            <Link href="/vendor" className="vd-top__brand" aria-label="Grid Shop vendor portal"><span className="vd-brand__ico" aria-hidden="true"><Icon name="shopping-bag" width="16" height="16" /></span></Link>
            {vendor ? (
              <div className="vd-who">
                <Pic src={vendor.logo} name={vendor.name} kind="logo" size={32} />
                <span className="vd-who__name"><b>{vendor.name}</b><small>{vendor.contact || 'Vendor'}</small></span>
                <button type="button" className="ix-btn ix-btn--sm" onClick={out}><Icon name="log-out" width="16" height="16" aria-hidden="true" /><span className="vd-hide-sm">Sign out</span></button>
              </div>
            ) : null}
          </header>
          <main className="vd-content">
            <div className="ix-page">
              {!ready ? <div style={{ minHeight: 360 }} aria-busy="true" /> : !vendor ? (
                <section className="ix-card" style={{ padding: 'var(--space-6) var(--space-4)' }}><EmptyState icon="log-in" title="Sign in to your vendor portal" body="See your orders, products and money on Grid Shop." actionLabel="Sign in" onAction={() => navigate('/vendor-sign-in')} /></section>
              ) : (<>
                {vendor.status === 'paused' ? <p className="vd-note vd-note--warn"><Icon name="pause-circle" width="16" height="16" aria-hidden="true" />GridCommerce has paused your shop: stores can’t see your products. Parcels already ordered still need shipping.</p> : null}
                {children(vendor)}
              </>)}
            </div>
          </main>
        </div>
      </div>
      <nav className="vd-tabs" aria-label="Vendor portal">
        {NAV.map((n) => <Link key={n.id} href={n.href} aria-current={active === n.id ? 'page' : undefined}><Icon name={n.icon} width="20" height="20" aria-hidden="true" /><span>{n.label}</span>{count(n.id) ? <span className="vd-tabs__n">{count(n.id)}</span> : null}</Link>)}
      </nav>
      {ready && vendor ? after : null}
    </div>
  );
}

export const VD_CSS = `
.vd{min-height:100vh;background:var(--surface-page)}
.vd-shell{display:grid;grid-template-columns:232px minmax(0,1fr);min-height:100vh}
.vd-side{position:sticky;top:0;height:100vh;display:flex;flex-direction:column;gap:var(--space-4);padding:var(--space-4) var(--space-3);border-right:1px solid var(--border-subtle);background:var(--surface-card)}
.vd-brand{display:flex;align-items:center;gap:10px;padding:0 6px;color:inherit;text-decoration:none}
.vd-brand b{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.vd-brand small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.vd-brand__ico{display:grid;place-items:center;flex:none;width:32px;height:32px;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
.vd-nav{display:flex;flex-direction:column;gap:2px}
.vd-nav a{display:flex;align-items:center;gap:10px;height:36px;padding:0 10px;border-radius:var(--radius-lg);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-body);text-decoration:none}
.vd-nav a:hover{background:var(--surface-subtle)}
.vd-nav a[aria-current=page]{background:var(--fill-primary-soft);color:var(--primary)}
.vd-n{margin-left:auto;min-width:20px;padding:0 6px;border-radius:var(--radius-full);background:var(--primary);color:var(--surface-card);font-size:var(--text-xs);line-height:20px;text-align:center}
.vd-side__foot{margin:auto 0 0;padding:0 6px;font-size:var(--text-xs);color:var(--text-muted)}
.vd-main{display:flex;flex-direction:column;min-width:0}
.vd-top{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:var(--space-3);min-height:56px;padding:8px var(--space-5);border-bottom:1px solid var(--border-subtle);background:var(--surface-card)}
.vd-top__brand{display:none;color:inherit;text-decoration:none}
.vd-who{display:flex;align-items:center;gap:10px;margin-left:auto;min-width:0}
.vd-who__name{display:flex;flex-direction:column;min-width:0}
.vd-who__name b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vd-who__name small{font-size:var(--text-xs);color:var(--text-muted)}
.vd-content{padding:20px var(--space-5) 40px;min-width:0}
.vd-tabs{display:none}
.vd-pad{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4)}
.vd-pad h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.vd-pad p{margin:0}
.vd-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.vd-row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.vd-grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:var(--space-3)}
.vd-note{display:flex;gap:8px;align-items:flex-start;margin:0;padding:10px 12px;border-radius:var(--radius-lg);background:var(--fill-info-soft);font-size:var(--text-sm);color:var(--text-body)}
.vd-note svg{flex:none;margin-top:2px;color:var(--text-info)}
.vd-note--warn{background:var(--fill-warning-soft)}
.vd-note--warn svg{color:var(--text-warning)}
.vd-note--bad{background:var(--fill-danger-soft,var(--fill-warning-soft))}
.vd-note--bad svg{color:var(--text-danger)}
.vd-list{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.vd-list li{display:flex;align-items:center;gap:var(--space-3);padding:10px 0;border-top:1px solid var(--border-subtle);min-width:0}
.vd-list li:first-child{border-top:0}
.vd-list__main{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.vd-list__main b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.vd-list__main small{font-size:var(--text-xs);color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.vd-list a{color:inherit;text-decoration:none}
.vd-num{font-family:var(--font-data);font-variant-numeric:tabular-nums;white-space:nowrap}
.vd-break{display:flex;flex-direction:column;gap:6px;margin:0;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.vd-break div{display:flex;justify-content:space-between;gap:var(--space-3);font-size:var(--text-sm);color:var(--text-body)}
.vd-break div span:last-child{font-family:var(--font-data);white-space:nowrap}
.vd-break .is-total{padding-top:6px;border-top:1px solid var(--border-subtle);font-weight:var(--weight-semibold);color:var(--text-heading)}
.vd-steps{display:flex;gap:6px;margin:0;padding:0;list-style:none}
.vd-steps li{flex:1;display:flex;flex-direction:column;gap:6px;font-size:var(--text-xs);color:var(--text-muted)}
.vd-steps li::before{content:"";height:4px;border-radius:var(--radius-full);background:var(--border-subtle)}
.vd-steps li.is-done{color:var(--text-heading)}
.vd-steps li.is-done::before{background:var(--primary)}
.vd-stock{width:84px;height:32px;text-align:right}
@media (max-width:768px){
  .vd-shell{grid-template-columns:minmax(0,1fr)}
  .vd-side{display:none}
  .vd-top{padding:8px 16px}
  .vd-top__brand{display:flex}
  .vd-content{padding:16px 16px calc(84px + env(safe-area-inset-bottom))}
  .vd-tabs{position:fixed;left:0;right:0;bottom:0;z-index:30;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));border-top:1px solid var(--border-subtle);background:var(--surface-card);padding-bottom:env(safe-area-inset-bottom)}
  .vd-tabs a{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:56px;font-size:var(--text-xs);color:var(--text-muted);text-decoration:none}
  .vd-tabs a[aria-current=page]{color:var(--primary);font-weight:var(--weight-medium)}
  .vd-tabs__n{position:absolute;top:6px;left:calc(50% + 6px);min-width:18px;padding:0 5px;border-radius:var(--radius-full);background:var(--primary);color:var(--surface-card);font-size:var(--text-xs);line-height:18px;text-align:center}
  .vd-hide-sm{display:none}
  .vd-who__name small{display:none}
}
body:has(#nl-badge-frame) .vd-tabs{bottom:var(--host-badge)}
`;
