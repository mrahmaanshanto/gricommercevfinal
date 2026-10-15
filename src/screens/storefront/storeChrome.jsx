'use client';
// storeChrome — the website around every customer page, drawn by the theme (Module A · Online Store › Theme):
//   the theme's CSS variables (colours, fonts with a Bangla pair, width, corners, buttons, spacing; Custom CSS when the
//   plan and the theme allow it), the announcement bar, the header from the Header builder (desktop and phone built
//   separately, sticky rows, the ☰ drawer and the bottom navigation bar), the footer (a footer layout or an HTML block,
//   payment and delivery marks, copyright from Settings), the chat button, the cookie notice, the side cart, the
//   preview and "moved here" bars; and useStoreItem(kind, param), which finds the page / post / product / category /
//   landing page at the address, follows a redirect when it moved (Online Store › SEO › Redirects) and logs an address
//   it can't find (Not found). Customers see the PUBLISHED look; ?preview=1 shows the draft (the editors' preview
//   frames send their unsaved copy too) and keeps ?preview=1 on links inside the store.
// Used by StoreHome (/store), StoreProduct, StoreCategory, StorePage, StoreBlogPost, StoreLanding, StoreCart, StoreSearch,
// TrackOrder, and around Offers, Offer detail and Checkout (ThemeChrome). Front end only: the live website's server
// draws the same at dazzleshop.com.bd.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, getLocale } from '@/runtime/ui';
import { STORE_PAGES_EVENT } from '@/lib/storePages';
import { resolveLink } from '@/lib/storeMenus';
import { findByHandle, ADAPTERS, contextOf } from '@/lib/seoItems';
import { headFor, livePath, parsePath, demoHref } from '@/lib/seo';
import { resolve, logMiss, SEO_EVENT } from '@/lib/redirects';
import { websiteOffers, promoLine } from '@/lib/storeOffers';
import { clockNow } from '@/lib/settlements';
import { isPreview, previewPreset, isEditing } from '@/lib/storefront/store';
import { themeVars, fontHref, customCss, themeClasses, TOKENS_CSS } from '@/lib/storefront/theme';
import { BOX_CSS } from '@/lib/storefront/styles';
import { presetBy } from '@/lib/storefront/presets';
import { useFileSrc } from '@/lib/files';
import { FileImg } from '@/components/files/FileParts';
import { layoutFor } from '@/lib/storefront/layouts';
import { storeProducts } from '@/lib/storefront/catalog';
import { cartLines, cartTotal, setQty, removeFromCart, OPEN_CART_EVENT, CART_EVENT, CHECKOUT_OPEN_EVENT, goCheckout } from '@/lib/storefront/cart';
// the pop-up checkout loads the checkout only when it opens (Checkout.jsx imports this file for its own page)
const CheckoutBody = React.lazy(() => import('./Checkout').then((m) => ({ default: m.CheckoutBody })));
// the tweak panel (StoreTweak.jsx) on the product, checkout, page and blog screens opens on that page's styles
const StoreTweak = React.lazy(() => import('./StoreTweak'));
const TWEAK_PART = { product: 'pg:product', checkout: 'pg:checkout', page: 'pages', blog: 'pg:blog', post: 'pg:post' };
import { BLOG_CSS } from '@/screens/integrations/blogShared';
import SeoHead from '@/components/seo/SeoHead';
import { useStorefront, BlockContent, bdt, SF_CSS } from './storeKit';
import { StoreHeader, MobileDrawer, BottomNav, MenuLink, Social, SearchForm, HEADER_CSS } from './storeHeader';
import { Sections, SECTIONS_CSS } from './sections';
import { SECTIONS2_CSS } from './sections2';
import { SECTIONS3_CSS } from './sections3';
import { LOOKS_CSS, FIT_CSS } from './sectionLooks';
import { QuickView, AgeCheck, EXTRAS_CSS } from './storeExtras';
import { shopSocials } from './shopInfo';
import { w } from '@/lib/storefront/words';
const W = ({ k }) => <span data-w={k}>{w(k)}</span>;

export { MenuLink };

export const query = (k) => (typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get(k) || '');
const live = (it) => { const r = resolveLink(it.link); return !r.broken && !r.note; };

export const STORE_CSS = `
.stw-launch{position:fixed;left:50%;bottom:calc(20px + var(--host-badge,0px));z-index:70;display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 18px;border-radius:var(--radius-full);background:#0f172a;color:#fff;font-family:var(--font-sans);font-size:var(--text-sm);font-weight:var(--weight-semibold);text-decoration:none;box-shadow:0 12px 28px -10px rgba(15,23,42,.55);transform:translateX(-50%)}
@media (max-width:899px){.sf-theme:has(.has-sticky-cart) .stw-launch{bottom:calc(84px + var(--host-badge,0px))}}
@media (max-width:640px){.stw-launch{left:16px;bottom:calc(76px + var(--host-badge,0px));width:48px;height:48px;padding:0;transform:none}.stw-launch:hover{transform:none}.stw-launch>span{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}}

.sfck-wrap{position:fixed;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;padding:24px}
.sfck-scrim{position:absolute;inset:0;border:0;background:rgba(15,23,42,.5);cursor:pointer}
.sfck{position:relative;display:flex;flex-direction:column;width:min(1040px,100%);max-height:calc(100vh - 48px);border-radius:var(--sf-radius-card);background:var(--sf-bg);box-shadow:0 24px 60px rgba(15,23,42,.3);overflow:hidden;animation:sfck-in .22s ease}
.sfck-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px 10px 20px;border-bottom:1px solid #e2e8f0;background:#fff}
.sfck-head b{font-size:var(--text-base);font-weight:var(--weight-semibold)}
.sfck-body{flex:1;overflow:auto;overscroll-behavior:contain}
.sfck-wait{min-height:360px}
@keyframes sfck-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.sfck{animation:none}}
@media (max-width:640px){.sfck-wrap{align-items:flex-end;padding:0}.sfck{width:100%;max-height:92vh;border-radius:var(--sf-radius-card) var(--sf-radius-card) 0 0}}

/* theme pack: footers, floating cart, greeting, back to top, image pop-up */
.sff-name{display:block;margin:0 0 10px;font-family:var(--sf-font-head);font-size:var(--sf-fs-h3)}
.sff-logo{display:block;height:40px;width:auto;max-width:220px;margin:0 0 12px;object-fit:contain}
.sff-contact{list-style:none;margin:10px 0;padding:0;display:flex;flex-direction:column;gap:8px}
.sff-contact li{display:flex;gap:8px;align-items:flex-start}
.sff-app{display:flex;flex-direction:column;gap:8px;margin-top:12px}
.sff-app>span{display:flex;flex-wrap:wrap;gap:8px}
.sff-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:var(--radius-lg);background:#0b0b0f;color:#fff!important;text-decoration:none;border:1px solid rgba(255,255,255,.2)}
.sff-badge span{display:flex;flex-direction:column;line-height:1.1;font-weight:var(--weight-semibold)}
.sff-badge small{font-size:var(--text-2xs);font-weight:var(--weight-regular);opacity:.8;letter-spacing:.04em}
.sff-cap{display:block;margin:0 0 14px;text-transform:uppercase;letter-spacing:var(--tracking-label);font-size:var(--sf-fs-sm)}
.sff-cols.is-support{position:relative;grid-template-columns:minmax(0,1.1fr) minmax(0,1.6fr) minmax(0,1.2fr)}
.sff-cols.is-support>.sff-row{grid-column:1/-1;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;padding-top:16px;border-top:1px solid rgba(255,255,255,.1)}
.sff-cols.is-support .sff-app{flex-direction:row;align-items:center;margin:0}
.sff-box{display:flex;align-items:center;gap:12px;max-width:260px;margin-bottom:12px;padding:8px 18px 8px 8px;border:1px solid rgba(255,255,255,.18);border-radius:var(--radius-full);color:inherit;text-decoration:none}
.sff-box>span:first-child{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.08)}
.sff-box small{display:block;font-size:var(--text-xs);opacity:.7}
.sff-box b{display:block;color:var(--sf-accent);font-size:var(--sf-fs-lg);font-weight:var(--weight-semibold)}
.sff-links ul.is-2{columns:2;column-gap:24px}
.sff-cols.is-wm{overflow:hidden}
.sff-wm{position:absolute;left:30%;top:10%;z-index:0;font-family:var(--sf-font-head);font-size:140px;font-weight:var(--weight-semibold);opacity:.05;pointer-events:none;white-space:nowrap}
.sff-wm .sff-logo{height:180px;max-width:none;filter:grayscale(1) brightness(3)}
.sff-cols.is-wm>*:not(.sff-wm){position:relative;z-index:1}
.sff-cols.is-caps a{text-transform:uppercase;font-size:var(--sf-fs-sm)}
.sff-cols.is-caps .sff-cap{color:color-mix(in srgb,var(--sf-sale) 70%,#fff)}
.sff-base.is-pay{flex-wrap:wrap;align-items:center}
.sff-pay{display:flex;align-items:center;gap:10px;margin-left:auto}
.sff-pay .sff-marks{margin:0;padding:0;border:0}
.sf-fcart{position:fixed;right:0;top:44%;z-index:60;display:flex;flex-direction:column;align-items:stretch;width:70px;padding:0;border:0;border-radius:var(--radius-lg) 0 0 var(--radius-lg);overflow:hidden;box-shadow:0 4px 14px rgba(15,23,42,.18);font:inherit;cursor:pointer}
.sf-fcart>span{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px;background:var(--sf-primary);color:var(--sf-on-primary)}
.sf-fcart small{font-size:var(--text-xs);font-weight:var(--weight-medium)}
.sf-fcart b{padding:5px 4px;background:var(--sf-surface);color:var(--sf-primary);font-size:var(--sf-fs-sm);text-align:center}
.sf-chat.is-pill{width:auto;height:auto;padding:10px 18px;gap:8px;border-radius:var(--radius-full);font-weight:var(--weight-semibold);font-size:var(--sf-fs-sm)}
.sf-greet{position:fixed;right:84px;bottom:calc(26px + var(--host-badge,0px));z-index:61;display:flex;align-items:center;gap:10px;max-width:260px;padding:10px 14px 10px 10px;border-radius:var(--radius-xl);background:var(--sf-surface);color:var(--sf-text);box-shadow:0 6px 24px rgba(15,23,42,.18);font-size:var(--sf-fs-sm)}
.sf-greet a{color:inherit;text-decoration:none}
.sf-greet>button{position:absolute;top:-8px;left:-8px;display:grid;place-items:center;width:22px;height:22px;border:0;border-radius:50%;background:var(--sf-surface);color:var(--sf-muted);box-shadow:0 1px 4px rgba(15,23,42,.2);cursor:pointer}
.sf-greet__av{display:grid;place-items:center;flex:none;width:34px;height:34px;border-radius:50%;background:var(--sf-primary);color:var(--sf-on-primary);font-weight:var(--weight-semibold)}
.sf-top{position:fixed;right:22px;bottom:calc(92px + var(--host-badge,0px));z-index:59;display:grid;place-items:center;width:40px;height:40px;border:0;border-radius:50%;background:var(--sf-primary);color:var(--sf-on-primary);box-shadow:0 4px 12px rgba(15,23,42,.2);cursor:pointer}
.sf-pop{position:fixed;inset:0;z-index:90;display:grid;place-items:center;padding:16px}
.sf-pop__scrim{position:absolute;inset:0;border:0;background:rgba(15,23,42,.55);cursor:pointer}
.sf-pop__box{position:relative;max-width:min(520px,92vw);border-radius:var(--sf-radius-card);overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.35)}
.sf-pop__box img{display:block;width:100%;height:auto}
.sf-pop__x{position:absolute;top:8px;right:8px;z-index:1;display:grid;place-items:center;width:34px;height:34px;border:0;border-radius:50%;background:rgba(255,255,255,.92);color:#0f172a;cursor:pointer}
@media (max-width:899px){.sf-fcart{display:none}.sf-greet{bottom:calc(84px + var(--host-badge,0px));right:76px}.sf-top{bottom:calc(140px + var(--host-badge,0px))}.sff-cols.is-support{grid-template-columns:minmax(0,1fr)}.sff-wm{font-size:80px}}

body:has(.sf-theme) .gc-ai{display:none}
/* Offers, Offer detail, Checkout: their bands line up with the theme's width (Layout › Site width) */
.sf-theme .sf-pad{width:100%;max-width:var(--sf-width);margin-left:auto;margin-right:auto;padding-left:24px!important;padding-right:24px!important;box-sizing:border-box}
@media (max-width:640px){.sf-theme .sf-pad{padding-left:16px!important;padding-right:16px!important}}
.spg-crumb{margin:20px 0 14px;font-size:var(--sf-fs-sm);color:var(--sf-muted)}
.spg-crumb a{color:var(--sf-muted)}
.spg-card{max-width:760px;margin:0 auto;padding:40px 48px;background:var(--sf-surface);border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);box-sizing:border-box}
.spg-card .bl-a-title{margin-bottom:var(--space-2)}
.sf-main>.spg-crumb{box-sizing:border-box;width:calc(100% - 48px);max-width:760px;margin:20px auto 14px}
.sf-main>.spg-card{width:calc(100% - 48px);margin-bottom:var(--sf-section)}
.spg-wide{max-width:none}
.spg-body{padding-bottom:var(--sf-section)}
.spg-pv{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px 16px;min-height:40px;padding:8px 16px;background:#fff4e0;color:#a14f06;font-size:var(--sf-fs-sm);font-weight:var(--weight-medium)}
.spg-moved{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;min-height:36px;padding:6px 16px;background:#e7f0ff;color:#003087;font-size:var(--sf-fs-sm)}
.sf-ann{display:flex;align-items:center;justify-content:center;gap:10px;min-height:36px;padding:6px 16px;background:var(--sf-ann-bg);color:var(--sf-ann-fg);font-size:var(--sf-fs-sm);font-weight:var(--weight-medium);text-align:center}
.sf-ann a{color:inherit}
/* footer */
.sff{margin-top:auto;background:var(--sf-foot-bg);color:var(--sf-foot-fg);padding:40px 0 24px;font-size:var(--sf-fs-sm)}
.sff a,.sff button{color:inherit;opacity:.85;text-decoration:none;background:none;border:0;padding:0;font:inherit;cursor:pointer;text-align:left}
.sff a:hover,.sff button:hover{opacity:1;text-decoration:underline}
.sff-cols{display:grid;grid-template-columns:minmax(220px,1.4fr) repeat(auto-fit,minmax(150px,1fr));gap:28px}
.sff b{display:block;margin-bottom:10px;font-weight:var(--weight-semibold);font-size:var(--sf-fs)}
.sff ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px}
.sff p{margin:0 0 6px;line-height:1.6;opacity:.85}
.sff-simple{display:flex;flex-wrap:wrap;align-items:center;gap:10px 24px}
.sff-simple ul{flex-direction:row;flex-wrap:wrap;gap:8px 18px}
.sff-center{display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center}
.sff-center ul{flex-direction:row;flex-wrap:wrap;justify-content:center;gap:8px 18px}
.sff-center p{max-width:560px}
.sff-marks{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:24px}
.sff-marks span{display:inline-flex;align-items:center;justify-content:center;height:30px;min-width:56px;padding:0 8px;border-radius:var(--sf-radius);background:#fff;color:#0f172a;font-size:var(--sf-fs-sm);font-weight:var(--weight-medium)}
.sff-marks img{height:18px;width:auto;max-width:72px;object-fit:contain}
.sff-base{display:flex;flex-wrap:wrap;align-items:center;gap:8px 24px;margin-top:24px;padding-top:18px;border-top:1px solid currentColor;border-top-color:color-mix(in srgb,currentColor 18%,transparent)}
.sff-base>:last-child{margin-left:auto;display:inline-flex;align-items:center;gap:8px}
.sff-base img{height:18px;object-fit:contain}
/* chat, cookie notice */
.sf-chat{position:fixed;right:20px;bottom:calc(20px + var(--host-badge,0px));z-index:80;display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:var(--radius-full);color:#fff;box-shadow:0 10px 24px -8px rgba(15,23,42,.45)}
.sf-chat.is-wa{background:#25d366}.sf-chat.is-ms{background:#0084ff}
.sf-cookie{position:fixed;left:16px;right:16px;bottom:calc(16px + var(--host-badge,0px));z-index:95;display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;max-width:720px;margin:0 auto;padding:14px 16px;border-radius:var(--sf-radius-card);background:#0f172a;color:#e2e8f0;font-size:var(--sf-fs-sm);box-shadow:0 18px 40px -16px rgba(15,23,42,.6)}
.sf-cookie p{flex:1 1 260px;margin:0}
.sf-cookie .sf-btn{min-height:36px}
/* side cart */
.sfx-wrap{position:fixed;inset:0;z-index:210}
.sfx-scrim{position:absolute;inset:0;border:0;background:rgba(15,23,42,.45)}
.sfx{position:absolute;right:0;top:0;bottom:0;display:flex;flex-direction:column;width:min(400px,92vw);background:var(--sf-surface);color:var(--sf-text);box-shadow:-8px 0 30px rgba(15,23,42,.25)}
.sfx-head{display:flex;align-items:center;justify-content:space-between;padding:10px 10px 10px 18px;border-bottom:1px solid var(--sf-line)}
.sfx-head b{font-family:var(--sf-font-head);font-size:var(--sf-fs-lg)}
.sfx-body{flex:1;overflow-y:auto;padding:12px 18px;display:flex;flex-direction:column;gap:12px}
.sfx-foot{padding:14px 18px calc(14px + var(--host-badge,0px));border-top:1px solid var(--sf-line);display:flex;flex-direction:column;gap:10px}
.sfx-foot .sf-btn{width:100%}
.sfx-tot{display:flex;justify-content:space-between;font-weight:var(--weight-semibold)}
.sf-line{display:grid;grid-template-columns:56px minmax(0,1fr) auto;gap:10px;align-items:center}
.sf-line__img{display:grid;place-items:center;width:56px;height:56px;border-radius:var(--sf-radius);background:var(--sf-soft);font-weight:var(--weight-semibold);overflow:hidden}
.sf-line__img img{width:100%;height:100%;object-fit:contain}
.sf-line__name{display:block;font-weight:var(--weight-medium);line-height:1.3}
.sf-line small{color:var(--sf-muted)}
.sf-qty{display:inline-flex;align-items:center;border:1px solid var(--sf-line);border-radius:var(--sf-radius-btn)}
.sf-qty button{display:grid;place-items:center;width:36px;height:36px;border:0;background:none;color:inherit;cursor:pointer}
.sf-qty span{min-width:24px;text-align:center;font-variant-numeric:tabular-nums}
.sf-free{display:flex;flex-direction:column;gap:6px;font-size:var(--sf-fs-sm)}
.sf-free i{display:block;height:6px;border-radius:var(--radius-full);background:var(--sf-line);overflow:hidden}
.sf-free i b{display:block;height:100%;background:var(--sf-primary)}
.sf-trust{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:var(--sf-fs-sm);color:var(--sf-muted)}
.sf-trust img{height:16px;width:auto}
.sf-trust span{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-btn);background:#fff}
@media (max-width:899px){
  .sf-chat{bottom:calc(76px + var(--host-badge,0px));width:46px;height:46px}
  .has-bnav .sf-cookie{bottom:calc(72px + var(--host-badge,0px))}
}
@media (max-width:640px){
  .spg-card{padding:22px 18px}
  .sf-main>.spg-crumb,.sf-main>.spg-card{width:calc(100% - 32px)}
  .sff{padding:28px 0 20px}
  .sff-cols{grid-template-columns:repeat(2,minmax(0,1fr))}
  .sff-cols>:first-child{grid-column:1/-1}
  .sff-base>:last-child{margin-left:0}
}
`;

/** Payment and delivery marks (from Settings › Media's trust images; the brand files the app already has). */
/** The shop's social links for the Social icons (Customize › Shop details). */
export const socialEl = (v) => Object.fromEntries(shopSocials(v || {}).map((x) => [x.k, x.href]));

export function TrustMarks({ cod = true }) {
  return (
    <span className="sf-trust" aria-label="Ways to pay">
      {cod ? <span>Cash on delivery</span> : null}
      <span><img src="/assets/brands/bkash.svg" alt="bKash" loading="lazy" /></span>
      <span><img src="/assets/brands/nagad.svg" alt="Nagad" loading="lazy" /></span>
      <span><img src="/assets/payments/sslcommerz-mark.png" alt="Card by SSLCOMMERZ" loading="lazy" /></span>
    </span>
  );
}

function Announcement({ v }) {
  const [text, setText] = useState('');
  useEffect(() => {
    if (!v.announce) return;
    if (v.announceText) { setText(v.announceText); return; }
    let line = null;
    try { line = promoLine(websiteOffers(clockNow())); } catch { line = null; }
    setText(line ? (getLocale() === 'bn' ? line.bn : line.en) : '');
  }, [v.announce, v.announceText]);
  if (!v.announce || !text) return null;
  return <div className="sf-ann" role="note"><Icon name="zap" width="14" height="14" aria-hidden="true" /><span>{text}</span></div>;
}

export function Footer({ st }) {
  const v = st.values;
  const name = (st.shop && st.shop.brand && st.shop.brand.name) || 'Dazzle Shop';
  const contact = (st.shop && st.shop.contact) || {};
  const about = st.general.footer_about || 'Dazzle Shop sells official smartphones, accessories and repairs in Dhaka. Shop online or visit our Dhanmondi and Mirpur branches.';
  const copy = v.copyright || st.general.copyright_line || '© ' + name;
  const columns = [];
  (st.menus || []).filter((m) => m.place === 'footer').forEach((m) => {
    const loose = (m.items || []).filter((it) => !(it.children || []).length && live(it));
    if (loose.length) columns.push({ key: m.id, title: m.name, items: loose });
    (m.items || []).filter((it) => (it.children || []).length).forEach((it) => { const kids = it.children.filter(live); if (kids.length) columns.push({ key: it.id, title: it.label, items: kids }); });
  });
  const marks = v.footerMarks ? (
    <div className="sff-marks" aria-label="Payment and delivery">
      <span>Cash on delivery</span>
      <span><img src="/assets/brands/bkash.svg" alt="bKash" loading="lazy" /></span>
      <span><img src="/assets/brands/nagad.svg" alt="Nagad" loading="lazy" /></span>
      <span><img src="/assets/brands/rocket.webp" alt="Rocket" loading="lazy" /></span>
      <span><img src="/assets/payments/sslcommerz-mark.png" alt="SSLCOMMERZ" loading="lazy" /></span>
      <span><img src="/assets/brands/pathao.png" alt="Pathao" loading="lazy" /></span>
      <span><img src="/assets/brands/steadfast.png" alt="Steadfast" loading="lazy" /></span>
      <span><img src="/assets/brands/redx.png" alt="RedX" loading="lazy" /></span>
    </div>
  ) : null;
  const base = (
    <div className="sff-base">
      <span>{copy}</span>
      <span>Powered by <img src="/assets/820d4a69b45ed8fa40c9bc6015985c0e.png" alt="GridCommerce" /></span>
    </div>
  );
  const links = columns.flatMap((c) => c.items);
  const logo = st.logo;
  const app = v.footerApp ? (
    <div className="sff-app"><small>Get the app</small><span><a href="#" className="sff-badge" onClick={(e) => { e.preventDefault(); toast('The app opens on the live store.', { tone: 'info' }); }}><Icon name="play" width="16" height="16" aria-hidden="true" /><span><small>GET IT ON</small>Google Play</span></a><a href="#" className="sff-badge" onClick={(e) => { e.preventDefault(); toast('The app opens on the live store.', { tone: 'info' }); }}><Icon name="smartphone" width="16" height="16" aria-hidden="true" /><span><small>Download on the</small>App Store</span></a></span></div>
  ) : null;
  const socials = <Social el={socialEl(v)} />;
  const brandMark = logo && logo.src ? <FooterLogo logo={logo} dark={v.footerTone !== 'light'} name={name} /> : <b className="sff-name">{name}</b>;
  const contactRows = (
    <ul className="sff-contact">
      {contact.address ? <li><Icon name="map-pin" width="16" height="16" aria-hidden="true" />{contact.address}</li> : <li><Icon name="map-pin" width="16" height="16" aria-hidden="true" />House 42, Road 27, Dhanmondi, Dhaka</li>}
      <li><Icon name="phone" width="16" height="16" aria-hidden="true" />{contact.phone || st.general.support_phone || '+8801811843300'}</li>
      <li><Icon name="mail" width="16" height="16" aria-hidden="true" />{contact.email || 'hello@dazzleshop.com.bd'}</li>
    </ul>
  );
  let body;
  if (v.footerSource === 'block' && v.footerBlock) body = <BlockContent id={v.footerBlock} catalog={st.catalog} />;
  else if (v.footerLayout === 'simple') body = <div className="sff-simple"><b style={{ margin: 0 }}>{name}</b><ul>{links.slice(0, 8).map((it) => <li key={it.id}><MenuLink item={it} /></li>)}</ul></div>;
  else if (v.footerLayout === 'centered') body = (
    <div className="sff-center">
      <b style={{ margin: 0, fontFamily: 'var(--sf-font-head)', fontSize: 'var(--sf-fs-h3)' }}>{name}</b>
      {v.footerAbout ? <p>{about}</p> : null}
      <ul>{links.slice(0, 10).map((it) => <li key={it.id}><MenuLink item={it} /></li>)}</ul>
      <Social el={socialEl(v)} />
    </div>
  );
  else if (v.footerLayout === 'brand') body = (
    <div className="sff-cols is-brand">
      <div>{brandMark}{v.footerAbout ? <p>{about}</p> : null}{contactRows}{socials}{app}</div>
      {columns.map((c) => <div key={c.key}><b>{c.title}</b><ul>{c.items.map((it) => <li key={it.id}><MenuLink item={it} /></li>)}</ul></div>)}
    </div>
  );
  else if (v.footerLayout === 'support' || v.footerLayout === 'watermark') body = (
    <div className={'sff-cols is-support' + (v.footerLayout === 'watermark' ? ' is-wm' : '')}>
      {v.footerLayout === 'watermark' ? <span className="sff-wm" aria-hidden="true">{logo && logo.src ? <FooterLogo logo={logo} dark name="" /> : name}</span> : null}
      <div>
        <b className="sff-cap">Support</b>
        <a className="sff-box" href={'tel:' + String(contact.phone || st.general.support_phone || '+8801811843300').replace(/[^\d+]/g, '')}><span><Icon name="phone" width="18" height="18" aria-hidden="true" /></span><span><small>9 AM – 9 PM</small><b>{contact.phone || st.general.support_phone || '+8801811843300'}</b></span></a>
        <a className="sff-box" href="/page?handle=contact-us"><span><Icon name="map-pin" width="18" height="18" aria-hidden="true" /></span><span><small>Store locator</small><b>Find our shops</b></span></a>
      </div>
      <div className="sff-links"><b className="sff-cap">About us</b><ul className="is-2">{links.slice(0, 12).map((it) => <li key={it.id}><MenuLink item={it} /></li>)}</ul></div>
      <div><b className="sff-cap">Stay connected</b><p><b>{name}</b></p>{contact.address ? <p>{contact.address}</p> : <p>House 42, Road 27, Dhanmondi, Dhaka</p>}<p>Email: <a href={'mailto:' + (contact.email || 'hello@dazzleshop.com.bd')}>{contact.email || 'hello@dazzleshop.com.bd'}</a></p></div>
      <div className="sff-row">{app}{socials}</div>
    </div>
  );
  else if (v.footerLayout === 'caps') body = (
    <div className="sff-cols is-caps">
      <div>{brandMark}<ul>{['Our story', 'Our shops', 'Join our team', 'Authenticity'].map((x) => <li key={x}><a href="/page?handle=about-us">{x}</a></li>)}</ul><b className="sff-cap">Share your love</b>{socials}</div>
      {columns.map((c) => <div key={c.key}><b className="sff-cap">{c.title}</b><ul>{c.items.map((it) => <li key={it.id}><MenuLink item={it} /></li>)}</ul></div>)}
    </div>
  );
  else body = (
    <div className="sff-cols">
      <div>
        <b>{name}</b>
        {v.footerAbout ? <p>{about}</p> : null}
        {contact.address ? <p>{contact.address}</p> : null}
        {contact.phone ? <p>Call {contact.phone}</p> : null}
        {contact.email ? <p>{contact.email}</p> : null}
      </div>
      {columns.map((c) => <div key={c.key}><b>{c.title}</b><ul>{c.items.map((it) => <li key={it.id}><MenuLink item={it} /></li>)}</ul></div>)}
    </div>
  );
  const payGrid = v.footerLayout === 'brand' && v.footerMarks;
  return <footer className={'sff sff--' + (v.footerLayout || 'columns')}><div className="sf-wrap">{body}{payGrid ? null : marks}{payGrid ? <div className="sff-base is-pay"><span>{copy}</span><span className="sff-pay"><small>Pay with</small>{marks}</span></div> : base}</div></footer>;
}
function FooterLogo({ logo, dark, name }) {
  const src = useFileSrc((dark ? logo.light || logo.src : logo.src) || '', 'md');
  return src ? <img className="sff-logo" src={src} alt={name} /> : null;
}

function ChatButton({ v, name }) {
  const [hide, setHide] = useState(false);
  if (!v.chat || v.chat === 'none' || !v.chatTo) return null;
  const wa = v.chat === 'whatsapp';
  const href = wa ? 'https://wa.me/' + String(v.chatTo).replace(/[^\d]/g, '') : 'https://m.me/' + String(v.chatTo).replace(/^@/, '');
  const look = v.chatStyle || 'round';
  if (look === 'pill') return <a className={'sf-chat is-pill ' + (wa ? 'is-wa' : 'is-ms')} href={href} target="_blank" rel="noopener noreferrer"><Icon name="message-circle" width="20" height="20" aria-hidden="true" /><span>{v.chatGreeting && v.chatGreeting.length < 24 ? v.chatGreeting : 'Chat with us'}</span></a>;
  return (
    <>
      {look === 'greeting' && !hide ? (
        <div className="sf-greet" role="status">
          <button type="button" aria-label="Close" onClick={() => setHide(true)}><Icon name="x" width="12" height="12" aria-hidden="true" /></button>
          <span className="sf-greet__av" aria-hidden="true">{String(name || 'S').slice(0, 1)}</span>
          <a href={href} target="_blank" rel="noopener noreferrer">{v.chatGreeting || 'Hi! How can we help?'}</a>
        </div>
      ) : null}
      <a className={'sf-chat ' + (wa ? 'is-wa' : 'is-ms')} href={href} target="_blank" rel="noopener noreferrer" aria-label={wa ? 'Chat on WhatsApp' : 'Chat on Messenger'}><Icon name="message-circle" width="24" height="24" aria-hidden="true" /></a>
    </>
  );
}
function FloatCart({ v, st, onOpen }) {
  if (!v.floatCart) return null;
  return (
    <button type="button" className="sf-fcart" onClick={onOpen} aria-label={`Cart, ${st.count} item${st.count === 1 ? '' : 's'}, ${bdt(st.total || 0)}`}>
      <span><Icon name="shopping-bag" width="20" height="20" aria-hidden="true" /><small>{st.count} item{st.count === 1 ? '' : 's'}</small></span>
      <b>{bdt(st.total || 0)}</b>
    </button>
  );
}
function BackTop({ v }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!v.backTop) return undefined;
    const f = () => setOn(window.scrollY > 600);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, [v.backTop]);
  if (!v.backTop || !on) return null;
  return <button type="button" className="sf-top" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><Icon name="arrow-up" width="18" height="18" aria-hidden="true" /></button>;
}
function ImagePopup({ v, kind, editing }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!v.popupImage || editing || kind === 'checkout') return undefined;
    const key = 'gc.store.popup.' + String(v.popupImage).slice(-24);
    try { if (window.sessionStorage.getItem(key)) return undefined; } catch { /* ignore */ }
    const t = setTimeout(() => { setOpen(true); try { window.sessionStorage.setItem(key, '1'); } catch { /* ignore */ } }, Math.max(0, Number(v.popupDelay) || 0) * 1000);
    return () => clearTimeout(t);
  }, [v.popupImage, v.popupDelay, kind, editing]);
  if (!open) return null;
  return (
    <div className="sf-pop" role="dialog" aria-modal="true" aria-label="Offer" onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}>
      <button type="button" className="sf-pop__scrim" aria-label="Close" tabIndex={-1} onClick={() => setOpen(false)} />
      <div className="sf-pop__box">
        <button type="button" className="sf-pop__x" aria-label="Close" autoFocus onClick={() => setOpen(false)}><Icon name="x" width="18" height="18" aria-hidden="true" /></button>
        <a href={v.popupHref || '#'}><FileImg src={v.popupImage} size="full" alt="Offer" /></a>
      </div>
    </div>
  );
}

const COOKIE = 'gc.store.cookies';
function CookieNotice({ v }) {
  const [show, setShow] = useState(false);
  useEffect(() => { try { setShow(!!v.cookie && !window.localStorage.getItem(COOKIE)); } catch { setShow(false); } }, [v.cookie]);
  if (!show) return null;
  const answer = (x) => { try { window.localStorage.setItem(COOKIE, x); } catch { /* ignore */ } setShow(false); };
  return (
    <div className="sf-cookie" role="dialog" aria-label="Cookies">
      <p>{v.cookieText}</p>
      <button type="button" className="sf-btn sf-btn--line" onClick={() => answer('no')}>Only needed</button>
      <button type="button" className="sf-btn sf-btn--fill" onClick={() => answer('yes')}>Accept</button>
    </div>
  );
}

/** The product's first photo, for cart lines. */
const photoOf = (id) => { if (!id) return ''; try { const p = storeProducts().find((x) => x.id === id); return (p && p.img) || ''; } catch { return ''; } };

/** The cart lines with qty steppers (side cart and cart page). */
export function CartLines({ lines }) {
  return lines.map((l) => (
    <div key={l.sku} className="sf-line">
      <span className="sf-line__img" aria-hidden="true">{photoOf(l.productId) ? <img src={photoOf(l.productId)} alt="" loading="lazy" /> : l.name.slice(0, 1)}</span>
      <span><span className="sf-line__name">{l.name}</span><small>{bdt(l.price)}{l.stock < l.qty && !l.oversell ? ` · only ${l.stock} left` : ''}</small></span>
      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <span className="sf-qty">
          <button type="button" aria-label={`One less ${l.name}`} onClick={() => setQty(l.sku, l.qty - 1)}><Icon name="minus" width="14" height="14" aria-hidden="true" /></button>
          <span>{l.qty}</span>
          <button type="button" aria-label={`One more ${l.name}`} onClick={() => setQty(l.sku, l.qty + 1)}><Icon name="plus" width="14" height="14" aria-hidden="true" /></button>
        </span>
        <button type="button" className="sf-link" style={{ fontSize: 'var(--sf-fs-sm)' }} onClick={() => removeFromCart(l.sku)}>Remove</button>
      </span>
    </div>
  ));
}
export function FreeDelivery({ v, total }) {
  if (!v.freeShip || !(Number(v.freeShipAt) > 0)) return null;
  const at = Number(v.freeShipAt);
  const pct = Math.min(100, Math.round((total / at) * 100));
  return (
    <div className="sf-free" role="status">
      <span>{total >= at ? 'Your order gets free delivery.' : `Add ${bdt(at - total)} more for free delivery.`}</span>
      <i aria-hidden="true"><b style={{ width: pct + '%' }} /></i>
    </div>
  );
}

function SideCart({ v, open, onClose, preview }) {
  const [lines, setLines] = useState([]);
  useEffect(() => {
    if (!open) return undefined;
    const load = () => setLines(cartLines());
    load();
    window.addEventListener(CART_EVENT, load);
    return () => window.removeEventListener(CART_EVENT, load);
  }, [open]);
  if (!open) return null;
  const total = cartTotal(lines);
  const q = preview ? '?preview=1' : '';
  return (
    <div className="sfx-wrap" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <button type="button" className="sfx-scrim" aria-label="Close the cart" tabIndex={-1} onClick={onClose} />
      <aside className="sfx" role="dialog" aria-modal="true" aria-label="Cart">
        <div className="sfx-head"><b><span data-w="cartTitle">{w('cartTitle')}</span> · {lines.reduce((n, l) => n + l.qty, 0)}</b><button type="button" className="sfi" aria-label="Close" autoFocus onClick={onClose}><Icon name="x" width="22" height="22" aria-hidden="true" /></button></div>
        <div className="sfx-body">
          {lines.length ? <><FreeDelivery v={v} total={total} /><CartLines lines={lines} /></> : <p className="sf-muted" data-w="cartEmpty">{w('cartEmpty')}</p>}
        </div>
        <div className="sfx-foot">
          <div className="sfx-tot"><span>Subtotal</span><span>{bdt(total)}</span></div>
          {v.trust ? <TrustMarks /> : null}
          <a className="sf-btn sf-btn--fill" href={'/checkout' + q} aria-disabled={!lines.length || undefined} onClick={(e) => { if (!lines.length) { e.preventDefault(); return; } if (v.checkoutMode === 'popup') { e.preventDefault(); onClose(); goCheckout(v); } }}><W k="checkout" /></a>
          <a className="sf-btn sf-btn--line" href={'/cart' + q}>View cart</a>
        </div>
      </aside>
    </div>
  );
}

/** In preview, links inside the store keep ?preview=1 (and the preset being previewed). */
function keepPreview(e) {
  if (!isPreview()) return;
  const a = e.target.closest && e.target.closest('a[href]');
  // the layout editor's frame stays on the page being edited
  if (a && isEditing()) { e.preventDefault(); return; }
  if (!a || a.target === '_blank') return;
  let u;
  try { u = new URL(a.getAttribute('href'), window.location.href); } catch { return; }
  if (u.origin !== window.location.origin || u.searchParams.get('preview') === '1') return;
  u.searchParams.set('preview', '1');
  const pp = previewPreset();
  if (pp) u.searchParams.set('preset', pp);
  a.setAttribute('href', u.pathname + u.search + u.hash);
}

/** "Tweak this page" and the tweak panel for the pages that have their own styles (the home page mounts its own). Demo:
 *  everyone sees the button; a live store shows it only to staff signed in to the shop. */
function TweakDock({ kind }) {
  const [st, setSt] = useState(null);
  useEffect(() => {
    let q = null;
    try { q = new URLSearchParams(window.location.search); } catch { q = null; }
    setSt({ on: !!q && q.get('tweak') === '1' && q.get('preview') === '1', part: (q && q.get('part')) || TWEAK_PART[kind] || 'pages' });
  }, [kind]);
  if (!st) return null;
  const go = (on) => { const q = new URLSearchParams(window.location.search); if (on) { q.set('preview', '1'); q.set('tweak', '1'); } else { q.delete('tweak'); q.delete('part'); q.delete('preview'); } const x = q.toString(); window.location.href = window.location.pathname + (x ? '?' + x : ''); };
  if (st.on) return <React.Suspense fallback={null}><StoreTweak layoutId="" start={st.part} onClose={() => go(false)} /></React.Suspense>;
  return <a className="stw-launch" href="#tweak" onClick={(e) => { e.preventDefault(); go(true); }}><Icon name="sliders-horizontal" width="16" height="16" aria-hidden="true" /><span>Tweak this page</span></a>;
}

/** The pop-up checkout (Customize › Cart & checkout › Checkout opens as: Pop-up): a window on a computer, a sheet from the
 *  bottom on a phone. Opened by the side cart's Checkout and Buy now (cart.js › goCheckout). */
export function CheckoutPop() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setOpen(true);
    window.addEventListener(CHECKOUT_OPEN_EVENT, on);
    return () => window.removeEventListener(CHECKOUT_OPEN_EVENT, on);
  }, []);
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);
  if (!open) return null;
  return (
    <div className="sfck-wrap" onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}>
      <button type="button" className="sfck-scrim" aria-label="Close checkout" tabIndex={-1} onClick={() => setOpen(false)} />
      <div className="sfck" role="dialog" aria-modal="true" aria-label="Checkout">
        <div className="sfck-head"><b>Checkout</b><button type="button" className="sfi" aria-label="Close" autoFocus onClick={() => setOpen(false)}><Icon name="x" width="22" height="22" aria-hidden="true" /></button></div>
        <div className="sfck-body">
          <React.Suspense fallback={<div className="sfck-wait" aria-busy="true" />}><CheckoutBody popup /></React.Suspense>
        </div>
      </div>
    </div>
  );
}

/**
 * The website around a customer page. children(shell) draws the page; shell = { ready, values, catalog, shop, menus,
 * cats, footers, … } (useStorefront). headerId: the layout's own header ('' = the default). kind: 'home' | 'product' …
 */
export function StoreChrome({ screen, head, preview, movedFrom, current, css = '', children, headerId = '', kind = '', pageTitle = '' }) {
  const st = useStorefront(headerId);
  // pages without their own SEO entry (Offers, Checkout, an order link) are titled "<page> · <shop>", not the app's name
  const shopName = (st.shop && st.shop.brand && st.shop.brand.name) || 'Dazzle Shop';
  const autoHead = useMemo(() => (!head && pageTitle ? { title: pageTitle + ' · ' + shopName, description: '', robots: kind === 'checkout' ? 'noindex, follow' : 'index, follow', canonical: '', og: {}, jsonld: [] } : null), [head, pageTitle, shopName, kind]);
  const [drawer, setDrawer] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  useEffect(() => {
    const open = () => setCartOpen(true);
    window.addEventListener(OPEN_CART_EVENT, open);
    return () => window.removeEventListener(OPEN_CART_EVENT, open);
  }, []);
  const pv = st.ready && isPreview();
  const shell = { ...st, footers: (st.menus || []).filter((m) => m.place === 'footer'), header: (st.menus || []).find((m) => m.place === 'header') || null, preview: pv };
  if (!st.ready) {
    return (
      <div className="dc-screen ds" data-screen={screen}>
        <SeoHead head={head || autoHead} />
        <div style={{ minHeight: '100vh' }} aria-busy="true" />
      </div>
    );
  }
  const v = st.values;
  const H = st.header;
  const pp = pv ? previewPreset() : '';
  const pre = pp ? presetBy(pp) : null;
  const brand = (st.shop && st.shop.brand) || {};
  const logo = pre && pre.logo ? { src: pre.logo, light: pre.logoLight || pre.logo, name: pre.name } : v.logoImage ? { src: v.logoImage, light: v.logoLight || v.logoImage } : brand.logo ? { src: brand.logo, light: brand.logoOnDark || brand.logo, name: brand.name } : null;
  const ctx = { values: v, menus: st.menus, cats: st.cats, count: st.count, total: st.total, shop: st.shop, general: st.general, catalog: st.catalog, current, preview: pv, kind, logo, openDrawer: (focus) => setDrawer(focus || 'menu') };
  const bnav = H && H.mobile && H.mobile.bottomNav;
  const font = fontHref(v);
  return (
    <div className={'dc-screen ds sf-theme ' + themeClasses(v) + (bnav ? ' has-bnav' : '') + (pv && isEditing() ? ' sf-editing' : '')} data-screen={screen} onClickCapture={keepPreview}>
      {font ? <link rel="stylesheet" href={font} /> : null}
      <style dangerouslySetInnerHTML={{ __html: themeVars(v) + BLOG_CSS + SF_CSS + TOKENS_CSS + HEADER_CSS + STORE_CSS + SECTIONS_CSS + SECTIONS2_CSS + SECTIONS3_CSS + LOOKS_CSS + FIT_CSS + EXTRAS_CSS + BOX_CSS + css + customCss(v, st.cssAllowed) }} />
      <SeoHead head={head || autoHead} />
      {preview ? <div className="spg-pv" role="status"><Icon name="eye" width="16" height="16" aria-hidden="true" /><span>{preview}</span></div> : null}
      {movedFrom ? <div className="spg-moved" role="status"><Icon name="corner-down-right" width="14" height="14" aria-hidden="true" /><span>Moved here from {movedFrom} (a redirect)</span></div> : null}
      <Announcement v={v} />
      <StoreHeader H={H} ctx={ctx} />
      <main className="sf-main">{children(shell)}</main>
      <Footer st={{ ...st, logo }} />
      <ChatButton v={v} name={(logo && logo.name) || shopName} />
      <FloatCart v={v} st={st} onOpen={() => setCartOpen(true)} />
      <BackTop v={v} />
      <ImagePopup v={v} kind={kind} editing={pv && isEditing()} />
      <CookieNotice v={v} />
      <QuickView v={v} />
      <AgeCheck v={v} editing={pv && isEditing()} />
      <BottomNav H={H} ctx={ctx} />
      <MobileDrawer open={!!drawer} focus={drawer} H={H} ctx={ctx} onClose={() => setDrawer(null)} />
      <SideCart v={v} open={cartOpen} onClose={() => setCartOpen(false)} preview={pv} />
      {v.checkoutMode === 'popup' && kind !== 'checkout' ? <CheckoutPop /> : null}
      {TWEAK_PART[kind] ? <TweakDock kind={kind} /> : null}
    </div>
  );
}

/** Offers, Offer detail and Checkout: the theme's header and footer around a page that draws its own body. */
export function ThemeChrome({ screen, children, kind = '', title = '' }) {
  return (
    <StoreChrome screen={screen} kind={kind} head={null} pageTitle={title}>
      {() => children}
    </StoreChrome>
  );
}

/**
 * The item at this address: { ready, item, shows, preview, movedFrom, head }. When nothing has the handle, a redirect
 * for its live address is followed (the address bar changes to the new one); when there is none either, the address
 * is added to Online Store › SEO › Not found. Unpublished items show only with ?preview=1 (staff).
 */
export function useStoreItem(kind, param = 'handle') {
  const [st, setSt] = useState({ ready: false, item: null, shows: false, preview: false, movedFrom: '', head: null });
  useEffect(() => {
    // a miss is logged once per visit: logMiss itself sends the SEO event this hook listens to, so logging again on
    // every reload would loop (Maximum call stack) and count one visit many times
    let logged = false;
    const load = () => {
      const handle = query(param);
      const preview = query('preview') === '1';
      const movedFrom = query('from');
      let item = findByHandle(kind, handle);
      if (!item && handle) {
        const r = resolve(livePath(kind, handle), { count: true });
        const to = r && parsePath(r.to);
        if (to) { window.location.replace(demoHref(to.kind, to.handle) + '&from=' + encodeURIComponent(livePath(kind, handle))); return; }
        if (r && /^https?:/i.test(r.to)) { window.location.replace(r.to); return; }
        if (!preview && !logged) { logged = true; logMiss(livePath(kind, handle), document.referrer ? new URL(document.referrer).hostname : 'Direct'); }   // staff previews are not misses
      }
      const shows = !!item && (ADAPTERS[kind].live(item) || preview);
      setSt({ ready: true, item, shows, preview, movedFrom, head: shows ? headFor(kind, item, contextOf(kind, item)) : NOT_FOUND_HEAD });
    };
    load();
    const evs = ['gc:store-pages', 'gc:blog', 'gc:categories', 'gc:landing-pages', 'storage', SEO_EVENT, STORE_PAGES_EVENT];
    evs.forEach((e) => window.addEventListener(e, load));
    return () => evs.forEach((e) => window.removeEventListener(e, load));
  }, [kind, param]);
  return st;
}
export const NOT_FOUND_HEAD = { title: 'Page not found', description: '', robots: 'noindex, follow', canonical: '', og: {}, jsonld: [] };

/** "Page not found", drawn with the theme's Page not found layout (a search box and a way on). */
export function NotFound({ shell }) {
  const lay = layoutFor('404');
  const main = (
    <div className="spg-card" style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: 'var(--sf-fs-h1)', marginBottom: 8 }}>Page not found</h1>
      <p className="sf-muted" style={{ margin: '0 0 16px' }}>The page you are looking for is not here. It may have moved.</p>
      {shell ? <div style={{ maxWidth: 420, margin: '0 auto 16px' }}><SearchForm el={{ size: 'L' }} ctx={shell} idp="nf" /></div> : null}
      <p style={{ margin: 0 }}><a href="/store" className="sf-btn sf-btn--fill">Go to the home page</a></p>
    </div>
  );
  return <Sections sections={lay.sections} main={<div className="sf-wrap" style={{ paddingTop: 'var(--sf-section)' }}>{main}</div>} values={shell && shell.values} catalog={shell && shell.catalog} />;
}

/** Home / … / this page. */
export function Crumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="spg-crumb">
      <a href="/store">Home</a>
      {(items || []).map((c, i) => <React.Fragment key={i}>{' / '}{c.href ? <a href={c.href}>{c.name}</a> : <span>{c.name}</span>}</React.Fragment>)}
    </nav>
  );
}

export const showLater = (what) => toast(`${what} opens on the live website.`, { tone: 'info' });
