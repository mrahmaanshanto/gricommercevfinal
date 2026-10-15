'use client';
// Product page — what a customer sees for one product (/product?handle=galaxy-a15-6-128gb), drawn by the theme:
// the Product page layout's sections (Online Store › Layouts; a layout for one category or one product wins), with the
// product itself as the main section, following Theme › Product page: photos (thumbnails below, at the side or a grid),
// rating, price with the old price and the sale badge, EMI line, stock, options (picking a variant changes the price),
// quantity, Add to cart / Buy now, the delivery charge and COD note, warranty, payment marks; then Description,
// Specifications (the product template's fields), the theme's extra tab (an HTML block), Reviews (in a tab, below, or
// hidden) and the product FAQ. Sticky Add to cart on phones. The head carries its SEO and the automatic Product schema
// (lib/seo.js › autoSchema). Active products only; ?preview=1 shows a draft to staff. A renamed product's old address
// follows its redirect. Front end only: products from lib/products.js; the live website serves the same at
// dazzleshop.com.bd/products/<handle>.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { contextOf } from '@/lib/seoItems';
import { demoHref, parsePath } from '@/lib/seo';
import { reviewsOf } from '@/lib/productReviews';
import { warrantyOf } from '@/lib/warranty';
import { templateFor, groupsOf, fieldValue } from '@/lib/productTemplates';
import { getBlock } from '@/lib/storefront/blocks';
import { viewed, goCheckout } from '@/lib/storefront/cart';
import { sanitizeHtml } from '@/screens/products/RichText';
import { StoreChrome, useStoreItem, NotFound, Crumbs, TrustMarks } from './storeChrome';
import { Stars, Price, addAndShow, BlockContent, bdt, StockBar, wishToggle, compareToggle } from './storeKit';
import { SaleTimer, SoldLine, BoughtTogether, PRODUCT_EXTRAS_CSS } from './productExtras';
import { useSaved } from '@/lib/storefront/saved';
import { w } from '@/lib/storefront/words';
import { toast } from '@/runtime/ui';
import { clockNow } from '@/lib/settlements';
import { storeProducts, liveFlashSale } from '@/lib/storefront/catalog';
import { Sections, useLayout } from './sections';

const CSS = `
/* buy box styles (Customize › Product page › Buy box style) */
.spd-galw{position:relative}
.spd-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:4px 0 12px;padding:10px 14px;border-radius:var(--sf-radius-card);background:var(--sf-surface);font-size:var(--sf-fs-sm)}
.spd-bar__r{display:flex;align-items:center;gap:14px}
.spd-bar button,.spd-bar a{display:inline-flex;align-items:center;gap:6px;border:0;background:none;color:inherit;font:inherit;cursor:pointer;text-decoration:none}
.spd-share{display:inline-flex;align-items:center;flex-wrap:wrap;gap:8px;font-size:var(--sf-fs-sm);color:var(--sf-muted)}
.spd-share a,.spd-share>button{display:inline-grid;place-items:center;color:var(--sf-primary);border:0;background:none;cursor:pointer}
.spd-share small{margin-right:8px}
.spd-copy{display:inline-flex!important;align-items:center;gap:4px;padding:2px 10px!important;border-radius:var(--radius-full)!important;background:#dcfce7!important;color:#166534!important;font:inherit;font-size:var(--sf-fs-sm)}
.spd-st-specs .spd-info h1{color:var(--sf-primary);font-size:var(--sf-fs-h2)}
.spd-pills{display:flex;flex-wrap:wrap;gap:8px}
.spd-pills>span{padding:5px 12px;border-radius:var(--radius-full);background:var(--sf-soft);font-size:var(--sf-fs-sm);color:var(--sf-muted)}
.spd-pills b{color:var(--sf-text);font-weight:var(--weight-semibold)}
.spd-pills s{margin-left:4px;color:var(--sf-muted)}
.spd-keys{display:flex;flex-direction:column;gap:6px}
.spd-keys>b{font-size:var(--sf-fs-lg)}
.spd-keys ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:4px;font-size:var(--sf-fs-sm)}
.spd-keys .sf-link{align-self:flex-start;color:var(--sf-sale);border-bottom:1px solid currentColor}
.spd-points{display:inline-flex;align-items:center;gap:8px;align-self:flex-start;padding:8px 14px;border-radius:var(--sf-radius);background:color-mix(in srgb,var(--sf-sale) 8%,var(--sf-surface));font-size:var(--sf-fs-sm)}
.spd-points svg{color:var(--sf-sale)}
.spd-points b{font-size:var(--sf-fs-lg)}
.spd-payopt{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.spd-payopt button{display:flex;align-items:flex-start;gap:10px;padding:14px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface);color:var(--sf-text);font:inherit;text-align:left;cursor:pointer}
.spd-payopt button[aria-checked="true"]{border-color:var(--sf-primary);box-shadow:inset 0 0 0 1px var(--sf-primary)}
.spd-payopt i{flex:none;width:16px;height:16px;margin-top:4px;border:2px solid var(--sf-line);border-radius:50%}
.spd-payopt button[aria-checked="true"] i{border-color:var(--sf-primary);box-shadow:inset 0 0 0 3px var(--sf-surface);background:var(--sf-primary)}
.spd-payopt b{display:block;font-size:var(--sf-fs-lg)}
.spd-payopt s{margin-left:6px;font-size:var(--sf-fs-sm);color:var(--sf-muted);font-weight:var(--weight-regular)}
.spd-payopt small{display:block;color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.spd-narrow{flex:0 1 220px!important}
.spd-grid4{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.spd-alt{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.spd-wa{background:#22c55e!important;border-color:#22c55e!important;color:#fff!important}
.spd-call{background:#1e3a8a!important;border-color:#1e3a8a!important;color:#fff!important}
.spd-st-variants .spd-call{background:var(--sf-surface)!important;color:var(--sf-text)!important;border-color:var(--sf-text)!important}
.spd-dark{background:#0b0b0f!important;border-color:#0b0b0f!important;color:#fff!important}
.spd-red{background:var(--sf-sale)!important;border-color:var(--sf-sale)!important;color:var(--sf-on-sale)!important}
.spd-pink{background:var(--sf-accent)!important;border-color:var(--sf-accent)!important;color:var(--sf-on-accent)!important}
.spd-blue{background:#3b9ae1!important;border-color:#3b9ae1!important;color:#fff!important}
.spd-orange{background:var(--sf-primary)!important;border-color:var(--sf-primary)!important;color:var(--sf-on-primary)!important}
.spd-grad{background:linear-gradient(90deg,var(--sf-primary),var(--sf-sale))!important;border-color:transparent!important;color:#fff!important}
.spd-full{width:100%;flex:1 1 100%!important}
.sf-qty.is-filled{background:var(--sf-primary);border-color:var(--sf-primary);color:var(--sf-on-primary)}
.spd-wish{display:grid;place-items:center;width:44px;height:44px;border:0;border-radius:var(--sf-radius);background:#0b0b0f;color:#fff;cursor:pointer}
.spd-brandchip{align-self:flex-start;padding:6px 12px;border:1px solid var(--sf-line);border-radius:var(--sf-radius);font-size:var(--sf-fs-sm);color:var(--sf-muted)}
.spd-brandchip b{color:var(--sf-text)}
.spd-chips.is-cards button{display:flex;align-items:center;gap:8px;min-height:44px;padding:0 14px;box-shadow:0 1px 3px rgba(15,23,42,.08)}
.spd-chips.is-cards em{padding:1px 6px;border-radius:var(--radius-sm);background:#fee2e2;color:#b91c1c;font-style:normal;font-size:var(--text-xs);font-weight:var(--weight-medium)}
.spd-hint{margin:0;font-size:var(--sf-fs-sm);color:var(--sf-muted)}
.spd-short{margin:0;color:var(--sf-muted);line-height:1.6}
.spd-save{color:#16a34a;font-size:var(--sf-fs-sm);font-weight:var(--weight-semibold)}
.spd-ranks{list-style:none;margin:0;padding:10px 12px;display:flex;flex-direction:column;gap:6px;border:1px solid var(--sf-line);border-radius:var(--sf-radius);font-size:var(--sf-fs-sm)}
.spd-ranks em{display:inline-block;margin-right:4px;padding:2px 8px;border-radius:var(--radius-sm);background:#111827;color:#fff;font-style:normal;font-weight:var(--weight-medium);font-size:var(--text-xs)}
.spd-ranks b{color:var(--sf-primary);text-decoration:underline}
.spd-box{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border:1px solid var(--sf-line);border-radius:var(--sf-radius);font-size:var(--sf-fs-sm)}
.spd-box svg{flex:none;margin-top:2px;color:var(--sf-primary)}
.spd-box span{display:flex;flex-direction:column;gap:2px}
.spd-box small{color:var(--sf-muted)}
.spd-box.is-blue{background:#eff6ff;border-color:#bfdbfe}
.spd-box.is-row{align-items:center;justify-content:space-between}
.spd-urgent{display:inline-flex;align-items:center;gap:6px;font-size:var(--sf-fs-sm);color:#b91c1c}
.spd-urgent b{color:#b91c1c}
.spd-salebar{padding:8px 14px;border-radius:var(--sf-radius);background:color-mix(in srgb,var(--sf-sale) 8%,var(--sf-surface));text-align:center;font-size:var(--sf-fs-sm)}
.spd-salebar b{color:var(--sf-sale);font-variant-numeric:tabular-nums;margin-left:6px}
.spd-policy{align-self:flex-start;font-size:var(--sf-fs-sm);color:var(--sf-sale)}
.spd-stocktag{padding:2px 10px;border-radius:var(--radius-sm);background:#dc2626;color:#fff;font-size:var(--sf-fs-sm);font-weight:var(--weight-semibold)}
.spd-trustgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:14px;border-radius:var(--sf-radius);background:color-mix(in srgb,var(--sf-sale) 6%,var(--sf-surface));font-size:var(--sf-fs-sm)}
.spd-trustgrid span{display:flex;align-items:center;gap:8px}
.spd-imgacts{position:absolute;top:12px;right:12px;display:flex;flex-direction:column;gap:8px}
.spd-imgacts button{display:grid;place-items:center;width:38px;height:38px;border:1px solid var(--sf-line);border-radius:50%;background:var(--sf-surface);color:var(--sf-text);cursor:pointer}
.spd-imgtags{position:absolute;top:12px;left:12px;display:flex;gap:6px}
.spd-imgtags em{padding:2px 8px;border-radius:var(--radius-sm);background:#8b5cf6;color:#fff;font-style:normal;font-size:var(--text-xs);font-weight:var(--weight-medium)}
.spd-imgtags em.is-new{background:#22c55e}
.spd-wchip{padding:2px 10px;border-radius:var(--radius-full);background:#fee2e2;color:#b91c1c;font-style:normal;font-weight:var(--weight-medium)}
.spd-ptag{padding:2px 10px;border-radius:var(--radius-sm);background:var(--sf-primary);color:var(--sf-on-primary);font-style:normal;font-size:var(--sf-fs-sm);font-weight:var(--weight-semibold);align-self:center}
.spd-detail.is-pills .spd-tabs{gap:8px;border-bottom:0}
.spd-detail.is-pills .spd-tabs button{min-height:40px;padding:0 18px;border:1px solid var(--sf-line);border-radius:var(--sf-radius);background:var(--sf-surface)}
.spd-detail.is-pills .spd-tabs button[aria-selected="true"]{background:var(--sf-primary);border-color:var(--sf-primary);color:var(--sf-on-primary)}
.spd-specs__g th{background:var(--sf-soft);color:var(--sf-primary)!important;font-weight:var(--weight-semibold)!important}
.spd-acc{display:flex;flex-direction:column;gap:8px;padding-bottom:calc(var(--sf-section) / 2)}
.spd-acc details{border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.spd-acc summary{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 18px;font-weight:var(--weight-semibold);text-transform:uppercase;letter-spacing:var(--tracking-label);font-size:var(--sf-fs-sm);cursor:pointer;list-style:none}
.spd-acc summary::-webkit-details-marker{display:none}
.spd-acc details[open] summary svg{transform:rotate(180deg)}
.spd-acc__b{padding:0 18px 18px}
@media (max-width:640px){.spd-payopt,.spd-grid4,.spd-alt,.spd-trustgrid{grid-template-columns:minmax(0,1fr)}.spd-bar{flex-wrap:wrap}}

.spd{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:calc(var(--sf-gap) * 2);align-items:start;padding:8px 0 calc(var(--sf-section) / 2)}
.spd-gal{display:flex;flex-direction:column;gap:10px;min-width:0}
.spd-gal.is-side{flex-direction:row-reverse}
.spd-gal.is-side .spd-thumbs{flex-direction:column}
.spd-photo{display:grid;place-items:center;aspect-ratio:1/1;border-radius:var(--sf-radius-card);overflow:hidden;color:var(--sf-text);font-size:var(--sf-fs-h1);font-weight:var(--weight-semibold);flex:1;min-width:0}
.spd-photo img{width:100%;height:100%;object-fit:cover}
.spd-thumbs{display:flex;gap:8px;flex-wrap:wrap}
.spd-thumbs button{width:64px;height:64px;padding:0;border:2px solid transparent;border-radius:var(--sf-radius);overflow:hidden;background:var(--sf-soft);cursor:pointer}
.spd-thumbs button.on{border-color:var(--sf-primary)}
.spd-thumbs img{width:100%;height:100%;object-fit:cover}
.spd-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.spd-grid .spd-photo:first-child{grid-column:1/-1}
.spd-info{display:flex;flex-direction:column;gap:14px;min-width:0}
.spd-info h1{font-size:var(--sf-fs-h1);line-height:1.2}
.spd-brand{font-size:var(--sf-fs-sm);color:var(--sf-muted)}
.spd-off{padding:2px 8px;border-radius:var(--sf-radius-btn);background:var(--sf-sale);color:var(--sf-on-sale);font-size:var(--sf-fs-sm);font-weight:var(--weight-semibold)}
.spd-emi{font-size:var(--sf-fs-sm);color:var(--sf-muted)}
.spd-opt{display:flex;flex-direction:column;gap:6px}
.spd-opt>span{font-size:var(--sf-fs-sm);color:var(--sf-muted)}
.spd-chips{display:flex;flex-wrap:wrap;gap:6px}
.spd-chips button{min-height:36px;padding:0 14px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-btn);background:var(--sf-surface);color:var(--sf-text);font:inherit;cursor:pointer}
.spd-chips button[aria-pressed="true"]{border-color:var(--sf-primary);box-shadow:inset 0 0 0 1px var(--sf-primary);color:var(--sf-primary);font-weight:var(--weight-medium)}
.spd-buy{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.spd-buy .sf-btn{flex:1 1 160px}
.spd-note{display:flex;flex-direction:column;gap:8px;padding:12px 14px;border:1px solid var(--sf-line);border-radius:var(--sf-radius);background:var(--sf-surface);font-size:var(--sf-fs-sm)}
.spd-note div{display:flex;gap:8px;align-items:flex-start}
.spd-note svg{flex:none;color:var(--sf-primary);margin-top:2px}
.spd-tabs{display:flex;gap:4px;overflow-x:auto;border-bottom:1px solid var(--sf-line);margin-bottom:16px}
.spd-tabs button{min-height:44px;padding:0 16px;border:0;border-bottom:2px solid transparent;background:none;color:var(--sf-muted);font:inherit;font-weight:var(--weight-medium);cursor:pointer;white-space:nowrap}
.spd-tabs button[aria-selected="true"]{color:var(--sf-text);border-bottom-color:var(--sf-primary)}
.spd-panel{padding:20px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface);margin-bottom:var(--sf-gap)}
.spd-panel h2{font-size:var(--sf-fs-h3);margin-bottom:12px!important}
.spd-desc{line-height:1.7}
.spd-desc img{max-width:100%;height:auto}
.spd-desc table,.spd-specs{border-collapse:collapse;width:100%}
.spd-desc td,.spd-desc th{border:1px solid var(--sf-line);padding:6px 10px}
.spd-specs th{width:38%;text-align:left;font-weight:var(--weight-regular);color:var(--sf-muted);padding:8px 10px;border-bottom:1px solid var(--sf-line);vertical-align:top}
.spd-specs td{padding:8px 10px;border-bottom:1px solid var(--sf-line)}
.spd-specs caption{text-align:left;font-weight:var(--weight-semibold);padding:14px 0 6px}
.spd-rev{display:flex;flex-direction:column;gap:14px}
.spd-rev article{display:flex;flex-direction:column;gap:4px;padding-bottom:14px;border-bottom:1px solid var(--sf-line)}
.spd-rev article:last-child{border-bottom:0}
.spd-rev p{margin:0}
.spd-reply{margin-top:6px;padding:8px 12px;border-radius:var(--sf-radius);background:var(--sf-soft);font-size:var(--sf-fs-sm)}
/* page layouts (Customize › Product page › Page layout) */
.spd-lay-right .spd-galw{order:2}
.spd-lay-wide{grid-template-columns:minmax(0,1.5fr) minmax(0,1fr)}
.spd-lay-compact{grid-template-columns:minmax(0,.62fr) minmax(0,1fr)}
.spd-lay-centered{grid-template-columns:minmax(0,1fr);justify-items:center;max-width:760px;margin:0 auto;text-align:center}
.spd-lay-centered .spd-galw{width:min(100%,560px)}
.spd-lay-centered .spd-info{align-items:center}
.spd-lay-centered :is(.spd-buy,.spd-chips,.sf-price,.spd-alt,.spd-grid4){justify-content:center}
.spd-lay-centered .spd-thumbs{justify-content:center}
.spd-lay-sticky .spd-info{position:sticky;top:calc(var(--sfh-stick,96px) + 12px);padding:24px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.spd-lay-panel{position:relative;isolation:isolate}
.spd-lay-panel .spd-galw{padding:clamp(16px,4vw,48px);border-radius:var(--sf-radius-card);background:linear-gradient(160deg,var(--sf-soft),color-mix(in srgb,var(--sf-accent) 10%,var(--sf-surface)))}
.spd-lay-panel .spd-photo{background:transparent}
.spd-lay-panel .spd-photo img{object-fit:contain;mix-blend-mode:multiply}
.spd-stack{display:flex;flex-direction:column;gap:10px}
.spd-slider{position:relative}
.spd-slider__a{position:absolute;top:50%;z-index:1;display:grid;place-items:center;width:44px;height:44px;margin-top:-22px;border:0;border-radius:50%;background:color-mix(in srgb,var(--sf-surface) 92%,transparent);color:var(--sf-text);box-shadow:0 4px 14px -6px rgba(15,23,42,.35);cursor:pointer}
.spd-slider__a.is-prev{left:12px}.spd-slider__a.is-next{right:12px}
.spd-dots{display:flex;justify-content:center;gap:6px;margin-top:10px}
.spd-dots button{width:8px;height:8px;padding:0;border:0;border-radius:var(--radius-full);background:var(--sf-line);cursor:pointer;transition:transform .2s ease,background-color .2s ease}
.spd-dots button[aria-pressed="true"]{background:var(--sf-primary);transform:scale(1.35)}
.spd-detail.is-side{display:grid;grid-template-columns:220px minmax(0,1fr);gap:var(--sf-gap);align-items:start}
.spd-detail.is-side .spd-tabs{flex-direction:column;gap:4px;margin:0;border-bottom:0}
.spd-detail.is-side .spd-tabs button{justify-content:flex-start;min-height:44px;padding:0 14px;border:1px solid transparent;border-bottom:1px solid transparent;border-radius:var(--sf-radius);text-align:left}
.spd-detail.is-side .spd-tabs button[aria-selected="true"]{border-color:var(--sf-line);background:var(--sf-surface);color:var(--sf-primary)}
@media (max-width:899px){
  .spd-lay-right .spd-galw{order:0}
  .spd-lay-sticky .spd-info{position:static}
  .spd-detail.is-side{grid-template-columns:minmax(0,1fr)}
  .spd-detail.is-side .spd-tabs{flex-direction:row;overflow-x:auto}
}
.spd-sticky{display:none}
@media (max-width:899px){
  .spd{grid-template-columns:minmax(0,1fr);gap:20px}
  .spd-gal.is-side{flex-direction:column}
  .spd-gal.is-side .spd-thumbs{flex-direction:row}
  .spd-sticky{position:fixed;left:0;right:0;bottom:var(--host-badge,0px);z-index:85;display:flex;align-items:center;gap:12px;padding:10px 16px;background:var(--sf-surface);border-top:1px solid var(--sf-line);box-shadow:0 -6px 18px -12px rgba(15,23,42,.4)}
  .has-bnav .spd-sticky{bottom:calc(56px + var(--host-badge,0px))}
  .spd-sticky .sf-btn{flex:1}
  .has-sticky-cart{padding-bottom:72px}
  .sf-theme:has(.has-sticky-cart) .sf-chat{bottom:calc(140px + var(--host-badge,0px))}
}
`;

/** The description's links to the shop's own pages open their customer view here. */
const demoLinks = (html) => String(html || '').replace(/href="([^"]+)"/g, (all, u) => { const p = /^\/|dazzleshop\.com\.bd/i.test(u) ? parsePath(u) : null; return p ? `href="${demoHref(p.kind, p.handle)}"` : all; });

function specRows(p) {
  try {
    const t = templateFor(p);
    return groupsOf(t.id).map((g) => ({ name: g.name, rows: g.fields.map((f) => { const v = fieldValue(p, f); const val = v && v.value; return val === '' || val == null ? null : [f.l, f.t === 'yes' ? (val === true || val === 'Yes' ? 'Yes' : 'No') : String(val) + (f.u ? ' ' + f.u : '')]; }).filter(Boolean) })).filter((g) => g.rows.length);
  } catch { return []; }
}

const PIECES = {
  standard: [],
  grocery: ['alt', 'brandChip'],
  specs: ['pills', 'keys', 'points', 'pay', 'bar'],
  variants: ['cards', 'alt', 'consult'],
  accordion: ['short'],
  beauty: ['rank', 'freeship', 'urgency'],
  sale: ['salebar', 'policy', 'trustgrid', 'imgacts'],
  gadget: ['prevnext', 'brandChip', 'warrantyChip', 'share'],
  nudge: ['pricetag', 'nudge', 'bulk', 'share'],
};
const tel = (n) => 'tel:' + String(n || '').replace(/[^\d+]/g, '');
const wa = (n, text) => 'https://wa.me/' + String(n || '').replace(/[^\d]/g, '') + (text ? '?text=' + encodeURIComponent(text) : '');

function SaleBar() {
  const [now, setNow] = useState(0);
  const [end, setEnd] = useState(0);
  useEffect(() => {
    const sale = liveFlashSale();
    const d = new Date(clockNow()); d.setHours(23, 59, 59, 999);
    setEnd((sale && sale.end) || d.getTime());
    setNow(clockNow());
    const iv = setInterval(() => setNow(clockNow()), 1000);
    return () => clearInterval(iv);
  }, []);
  if (!now) return null;
  const t = Math.max(0, Math.floor((end - now) / 1000));
  const pad = (n) => (n < 10 ? '0' : '') + n;
  return <div className="spd-salebar" role="status">Sale ends in <b>{pad(Math.floor(t / 86400))}d : {pad(Math.floor((t % 86400) / 3600))}h : {pad(Math.floor((t % 3600) / 60))}m : {pad(t % 60)}s</b></div>;
}

export function ProductMain({ p, ctx, v, general }) {
  const images = ctx.images || [];
  const [img, setImg] = useState(0);
  const opts = (p.opts || []).filter((o) => o.variation !== false && (o.values || []).length);
  const [pick, setPick] = useState(() => Object.fromEntries(opts.map((o) => [o.name, o.values[0]])));
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('desc');
  const [pay, setPay] = useState('cash');
  const ps = v.productStyle || 'standard';
  const has = (k) => (PIECES[ps] || []).includes(k);
  const variantName = opts.length ? opts.map((o) => pick[o.name]).join(' / ') : '';
  const variant = (p.variants || []).find((x) => x.name === variantName) || null;
  const price = variant ? Number(variant.price) : Number(p.price);
  const mrp = Number(p.mrp) || 0;
  const off = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const stock = variant ? Number(variant.stock) || 0 : (ctx.product || {}).stock || 0;
  const pre = !!p.oversell || !!p.backorder;
  const out = stock <= 0 && !pre;
  const facts = ctx.product || {};
  const desc = useMemo(() => (p.long ? demoLinks(/</.test(p.long) ? sanitizeHtml(p.long) : '<p>' + String(p.long).replace(/</g, '&lt;') + '</p>') : ''), [p]);
  const specs = useMemo(() => (v.specsTable || ps === 'specs' ? specRows(p) : []), [p, v.specsTable, ps]);
  const reviews = useMemo(() => { try { return reviewsOf(p).filter((r) => r.status === 'published').slice(0, 8); } catch { return []; } }, [p]);
  const tabBlock = v.tabBlock ? getBlock(v.tabBlock) : null;
  const warranty = v.showWarranty || has('warrantyChip') ? warrantyOf(p) : null;
  const faq = ctx.faq || [];
  const badge = v.saleBadge !== 'none' && off ? (v.saleBadge === 'text' ? 'Sale' : off + '% off') : '';
  const phone = (general && general.support_phone) || '+8801811843300';
  const waNo = v.chat === 'whatsapp' && v.chatTo ? v.chatTo : phone;
  const all = useMemo(() => { try { return storeProducts(); } catch { return []; } }, []);
  const add = (go) => { if (addAndShow({ id: p.id, name: p.name }, go ? { ...v, cartType: 'page' } : v, variantName, qty) && go) goCheckout(v); };
  const saved = useSaved();
  const card = { id: p.id, name: p.name };
  const wished = saved.wish.includes(p.id);
  const copyLink = async () => { try { await navigator.clipboard.writeText(window.location.href.split('&preview')[0]); toast('Link copied'); } catch { toast('Copy the address from the address bar.'); } };

  const tabs = [
    desc ? ['desc', w('tabDescription')] : null,
    specs.length ? ['specs', w('tabSpecs')] : null,
    tabBlock ? ['extra', tabBlock.name] : null,
    v.reviewsPos === 'tab' || v.detailsStyle === 'accordion' || v.detailsStyle === 'open' ? ['reviews', `${w('tabReviews')} (${reviews.length})`] : null,
    faq.length ? ['faq', `Questions (${faq.length})`] : null,
    v.detailsStyle === 'accordion' ? ['delivery', 'Delivery and returns'] : null,
  ].filter(Boolean);
  const cur = tabs.some((t) => t[0] === tab) ? tab : (tabs[0] || [''])[0];
  const reviewList = reviews.length ? (
    <div className="spd-rev">
      {reviews.map((r) => <article key={r.id}><Stars rating={{ avg: r.stars, count: 1 }} small /><p>{r.text}</p><small className="sf-muted">{r.name}{r.verified ? ' · Verified buyer' : ''}</small>{r.reply ? <div className="spd-reply"><b>Reply from the shop:</b> {r.reply.text || r.reply}</div> : null}</article>)}
    </div>
  ) : <p className="sf-muted" style={{ margin: 0 }}>No reviews yet.</p>;
  const panel = (k) => {
    if (k === 'desc') return desc ? <div className="spd-desc" dangerouslySetInnerHTML={{ __html: desc }} /> : <p className="sf-muted" style={{ margin: 0 }}>No description yet.</p>;
    if (k === 'specs') return <table className="spd-specs">{specs.map((g) => <tbody key={g.name}><tr className="spd-specs__g"><th colSpan={2}>{g.name}</th></tr>{g.rows.map(([a, b]) => <tr key={a}><th scope="row">{a}</th><td>{b}</td></tr>)}</tbody>)}</table>;
    if (k === 'extra') return <BlockContent id={v.tabBlock} />;
    if (k === 'reviews') return reviewList;
    if (k === 'faq') return <div className="sfs-faq">{faq.map((x, i) => <details key={i}><summary>{x.q}</summary><p>{x.a}</p></details>)}</div>;
    if (k === 'delivery') return <div className="spd-desc"><p>{v.deliveryNote || 'Delivery all over Bangladesh with cash on delivery.'}</p><p>Something wrong with your order? Ask for a return from the tracking page within 7 days.</p></div>;
    return null;
  };

  // pieces of the buy box ---------------------------------------------------------------------------------------------
  const catName = String(p.cat || '').split(' › ')[0];
  const rank = (list) => { const sorted = list.slice().sort((a, b) => b.sold - a.sold); const i = sorted.findIndex((x) => x.id === p.id); return i >= 0 && i < 5 ? i + 1 : 0; };
  const ranks = has('rank') ? [[rank(all.filter((x) => x.cat && x.cat.split(' › ')[0] === catName)), catName], [rank(all.filter((x) => x.brand && x.brand === p.brand)), p.brand], [rank(all), 'the shop']].filter(([n, w]) => n && w) : [];
  const idx = all.findIndex((x) => x.id === p.id);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
  const freeAt = Number(v.freeShipAt) || 0;
  const keyRows = specs.flatMap((g) => g.rows).slice(0, 6);
  const emiM = Number(v.emiMonths) || 6;
  // Customize › Product page › Page layout (WoodMart-style): where the photos sit; "stacked" shows every photo down the
  // page while the details stay in view
  const lay = v.productLayout || 'classic';
  const gal = lay === 'sticky' ? 'stack' : v.gallery;
  const n = images.length;
  const gallery = images.length ? (
    gal === 'stack' ? (
      <div className="spd-stack">{images.slice(0, 8).map((x, i) => <div key={i} className="spd-photo"><img src={x.src} alt={x.alt || p.name} loading={i ? 'lazy' : 'eager'} /></div>)}</div>
    ) : gal === 'slider' ? (
      <div className="spd-slider">
        <div className="spd-photo"><img src={images[img].src} alt={images[img].alt || p.name} /></div>
        {n > 1 ? <>
          <button type="button" className="spd-slider__a is-prev" aria-label="Previous photo" onClick={() => setImg((i) => (i - 1 + n) % n)}><Icon name="chevron-left" width="20" height="20" aria-hidden="true" /></button>
          <button type="button" className="spd-slider__a is-next" aria-label="Next photo" onClick={() => setImg((i) => (i + 1) % n)}><Icon name="chevron-right" width="20" height="20" aria-hidden="true" /></button>
          <span className="spd-dots">{images.slice(0, 8).map((x, i) => <button key={i} type="button" aria-label={`Photo ${i + 1}`} aria-pressed={i === img} onClick={() => setImg(i)} />)}</span>
        </> : null}
      </div>
    ) : gal === 'grid' && images.length > 1 ? (
      <div className="spd-grid">{images.slice(0, 5).map((x, i) => <div key={i} className="spd-photo"><img src={x.src} alt={x.alt || p.name} loading={i ? 'lazy' : 'eager'} /></div>)}</div>
    ) : (
      <div className={'spd-gal is-' + (gal === 'side' ? 'side' : 'below')}>
        <div className="spd-photo"><img src={images[img].src} alt={images[img].alt || p.name} /></div>
        {images.length > 1 ? <div className="spd-thumbs">{images.slice(0, 6).map((x, i) => <button key={i} type="button" className={i === img ? 'on' : undefined} aria-label={`Photo ${i + 1}`} onClick={() => setImg(i)}><img src={x.src} alt="" loading="lazy" /></button>)}</div> : null}
      </div>
    )
  ) : <div className="spd-photo" style={{ background: p.tbg || 'var(--sf-soft)' }}><span aria-hidden="true">{p.name.slice(0, 1)}</span></div>;
  const qtyBox = (
    <span className={'sf-qty' + (ps === 'accordion' ? ' is-filled' : '')}>
      <button type="button" aria-label="One less" onClick={() => setQty((n) => Math.max(1, n - 1))}><Icon name="minus" width="14" height="14" aria-hidden="true" /></button>
      <span aria-live="polite">{qty}</span>
      <button type="button" aria-label="One more" onClick={() => setQty((n) => n + 1)}><Icon name="plus" width="14" height="14" aria-hidden="true" /></button>
    </span>
  );
  const addBtn = (cls = 'sf-btn sf-btn--line', label = w('addToCart'), icon = 'shopping-bag') => <button type="button" className={cls} disabled={out} onClick={() => add(false)}><Icon name={icon} width="16" height="16" aria-hidden="true" />{out ? w('outOfStock') : label}</button>;
  const buyBtn = (cls = 'sf-btn sf-btn--fill', label = w('buyNow')) => <button type="button" className={cls} disabled={out} onClick={() => add(true)}>{label}</button>;
  const altOrder = (
    <div className="spd-alt">
      <a className="sf-btn spd-wa" href={wa(waNo, `I want to order ${p.name}${variantName ? ' (' + variantName + ')' : ''} × ${qty}`)} target="_blank" rel="noopener noreferrer"><Icon name="message-circle" width="16" height="16" aria-hidden="true" />{w('orderWhatsApp')}</a>
      <a className="sf-btn spd-call" href={tel(phone)}><Icon name="phone" width="16" height="16" aria-hidden="true" />{ps === 'variants' ? 'Call to order: ' + phone : w('callOrder')}</a>
    </div>
  );
  let buy;
  if (ps === 'grocery') buy = <><div className="spd-buy">{qtyBox}</div><div className="spd-grid4">{addBtn('sf-btn sf-btn--fill', w('addToCart'))}{buyBtn('sf-btn spd-dark', w('buyNow'))}<a className="sf-btn spd-wa" href={wa(waNo, `I want to order ${p.name} × ${qty}`)} target="_blank" rel="noopener noreferrer"><Icon name="message-circle" width="16" height="16" aria-hidden="true" />{w('orderWhatsApp')}</a><a className="sf-btn spd-call" href={tel(phone)}><Icon name="phone" width="16" height="16" aria-hidden="true" />Call for order</a></div></>;
  else if (ps === 'specs') buy = <div className="spd-buy">{qtyBox}{buyBtn('sf-btn sf-btn--fill spd-narrow', w('buyNow'))}</div>;
  else if (ps === 'variants') buy = <><div className="spd-buy">{qtyBox}</div><div className="spd-grid4">{addBtn('sf-btn sf-btn--line', w('addToCart'))}{buyBtn('sf-btn spd-red', 'Order now')}</div>{altOrder}</>;
  else if (ps === 'accordion') buy = <><div className="spd-buy">{qtyBox}{addBtn('sf-btn sf-btn--fill', w('addToCart'), 'shopping-cart')}</div>{buyBtn('sf-btn spd-dark spd-full', 'ORDER NOW')}</>;
  else if (ps === 'beauty') buy = <div className="spd-buy"><button type="button" className="spd-wish" aria-label="Add to wishlist" onClick={() => wishToggle(card)}><Icon name="heart" width="18" height="18" aria-hidden="true" /></button>{qtyBox}{addBtn('sf-btn spd-pink', w('addToCart'), 'shopping-bag')}</div>;
  else if (ps === 'sale') buy = <div className="spd-buy">{addBtn('sf-btn spd-grad spd-full', 'Add to bag', 'shopping-bag')}</div>;
  else if (ps === 'gadget') buy = <div className="spd-buy">{qtyBox}{addBtn('sf-btn spd-dark', 'ADD TO CART', 'shopping-cart')}{buyBtn('sf-btn spd-red', 'BUY NOW')}</div>;
  else if (ps === 'nudge') buy = <div className="spd-buy">{qtyBox}{addBtn('sf-btn spd-blue', 'ADD TO CART', 'shopping-cart')}{buyBtn('sf-btn spd-orange', 'BUY NOW')}</div>;
  else buy = <div className="spd-buy">{qtyBox}{addBtn()}{buyBtn()}</div>;

  const details = tabs.length ? (
    v.detailsStyle === 'accordion' || v.detailsStyle === 'open' ? (
      <section aria-label="Product details" className="spd-acc">
        {tabs.map(([k, l], i) => <details key={k} open={v.detailsStyle === 'open' || i === 0}><summary>{l}<Icon name="chevron-down" width="16" height="16" aria-hidden="true" /></summary><div className="spd-acc__b">{panel(k)}</div></details>)}
      </section>
    ) : (
      <section aria-label="Product details" className={'spd-detail' + (v.detailsStyle === 'pills' ? ' is-pills' : v.detailsStyle === 'side' ? ' is-side' : '')}>
        <div className="spd-tabs" role="tablist">{tabs.map(([k, l]) => <button key={k} type="button" role="tab" id={'spt-' + k} aria-selected={cur === k} aria-controls={'spp-' + k} onClick={() => setTab(k)}>{l}</button>)}</div>
        <div className="spd-panel" role="tabpanel" id={'spp-' + cur} aria-labelledby={'spt-' + cur}>{panel(cur)}</div>
      </section>
    )
  ) : null;

  return (
    <div className={(v.stickyCart ? 'has-sticky-cart ' : '') + 'spd-st-' + ps}>
      {has('bar') || has('prevnext') ? (
        <div className="spd-bar">
          {has('bar') ? <span className="spd-share">Share: <a href={'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook"><Icon name="facebook" width="16" height="16" /></a><a href={wa('', p.name)} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp"><Icon name="message-circle" width="16" height="16" /></a><button type="button" onClick={copyLink} aria-label="Copy link"><Icon name="link" width="16" height="16" /></button></span> : <span />}
          <span className="spd-bar__r">
            {has('bar') ? <><button type="button" aria-pressed={wished} onClick={() => wishToggle(card)}><Icon name="bookmark" width="16" height="16" aria-hidden="true" />{wished ? 'Saved' : 'Save'}</button><button type="button" onClick={() => compareToggle(card)}><Icon name="git-compare-arrows" width="16" height="16" aria-hidden="true" />Add to compare</button></> : null}
            {has('prevnext') ? <>{prev ? <a href={prev.href} aria-label={'Previous: ' + prev.name}><Icon name="chevron-left" width="18" height="18" aria-hidden="true" /></a> : null}{next ? <a href={next.href} aria-label={'Next: ' + next.name}><Icon name="chevron-right" width="18" height="18" aria-hidden="true" /></a> : null}</> : null}
          </span>
        </div>
      ) : null}
      <div className={'spd spd-lay-' + lay}>
        <div className="spd-galw">
          {gallery}
          {has('imgacts') ? <span className="spd-imgacts"><button type="button" aria-label="Add to wishlist" onClick={() => wishToggle(card)}><Icon name="heart" width="18" height="18" /></button><button type="button" aria-label="Copy link" onClick={copyLink}><Icon name="share-2" width="18" height="18" /></button></span> : null}
          {has('imgacts') && (off || facts.isNew) ? <span className="spd-imgtags">{facts.isNew ? <em className="is-new">NEW!</em> : null}{off ? <em>OFFER</em> : null}</span> : null}
        </div>
        <div className="spd-info">
          {has('salebar') ? <SaleBar /> : null}
          {has('brandChip') && p.brand ? <span className="spd-brandchip">Brand: <b>{p.brand}</b></span> : p.brand && !has('pills') ? <span className="spd-brand">{p.brand}</span> : null}
          <h1>{p.name}</h1>
          {has('pills') ? (
            <div className="spd-pills">
              <span>Price: <b>{bdt(price)}</b>{mrp > price ? <s>{bdt(mrp)}</s> : null}</span>
              {mrp > price ? <span>Regular price: <b>{bdt(mrp)}</b></span> : null}
              <span>Status: <b>{out ? w('outOfStock') : pre && stock <= 0 ? 'Pre-order' : 'In stock'}</b></span>
              {p.sku ? <span>Product code: <b>{p.sku}</b></span> : null}
              {p.brand ? <span>Brand: <b>{p.brand}</b></span> : null}
            </div>
          ) : null}
          {facts.rating && facts.rating.count ? <Stars rating={facts.rating} /> : null}
          {has('policy') ? <a className="spd-policy" href="/page?handle=return-refund">Return policy</a> : null}
          {!has('pills') ? (
            <div className="sf-price is-big" style={{ alignItems: 'center' }}>
              {has('pricetag') ? <em className="spd-ptag">Price</em> : null}
              <Price price={price} mrp={mrp} big />
              {has('rank') && mrp > price ? <span className="spd-save">Save {bdt(mrp - price)}</span> : null}
              {badge ? <span className="spd-off">{badge}</span> : null}
              {has('salebar') ? <span className={'spd-stocktag' + (out ? ' is-out' : '')}>Stock: {stock}</span> : null}
            </div>
          ) : null}
          {has('keys') && keyRows.length ? (
            <div className="spd-keys"><b>Key features</b><ul>{keyRows.map(([a, b]) => <li key={a}>{a}: {b}</li>)}</ul><button type="button" className="sf-link" onClick={() => { setTab('specs'); try { document.getElementById('spt-specs').scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch { /* ignore */ } }}>View more info</button></div>
          ) : null}
          {has('points') ? <span className="spd-points"><Icon name="star" width="16" height="16" aria-hidden="true" /><b>{Math.max(1, Math.floor(price / 100))}</b> points with this order</span> : null}
          {v.showEmi && price >= 5000 && !has('pay') ? <span className="spd-emi">EMI from {bdt(Math.ceil(price / emiM))}/month for {v.emiMonths} months on bank cards</span> : null}
          {!has('pills') && !has('salebar') ? <span className={'sf-stock' + (out ? ' is-out' : stock > 0 && stock < 6 ? ' is-low' : '')}>{stock > 0 ? (stock < 10 && !has('urgency') ? `Only ${stock} left` : 'In stock') : pre ? 'Pre-order: ships when it arrives' : w('outOfStock')}</span> : null}
          {v.stockBar !== false && !out && !has('urgency') ? <StockBar stock={stock} /> : null}
          {v.soldCount !== false ? <SoldLine sold={facts.sold || 0} /> : null}
          {v.saleTimer !== false && !has('salebar') ? <SaleTimer name={p.name} /> : null}
          {ranks.length ? <ul className="spd-ranks">{ranks.map(([n, w]) => <li key={w}><em>No #{n} best seller</em> in <b>{w}</b></li>)}</ul> : null}
          {has('freeship') && freeAt ? <div className="spd-box"><Icon name="truck" width="16" height="16" aria-hidden="true" /><span><b>Free delivery offer</b><small>Free delivery on orders over {bdt(freeAt)}{price >= freeAt ? ' — this one qualifies' : ''}</small></span></div> : null}
          {has('nudge') && freeAt ? <div className="spd-box is-blue"><Icon name="tag" width="16" height="16" aria-hidden="true" /><span><b>{price * qty >= freeAt ? 'This order gets free delivery' : `Spend ${bdt(freeAt - price * qty)} more to get free delivery`}</b><small>Applied by itself at checkout.</small></span></div> : null}
          {(p.short && (ps === 'standard' || has('short'))) ? <p className="spd-short">{String(p.short).replace(/<[^>]+>/g, ' ')}</p> : null}
          {opts.map((o) => (
            <div key={o.name} className="spd-opt">
              <span>{o.name}: <b style={{ color: 'var(--sf-text)', fontWeight: 'var(--weight-medium)' }}>{pick[o.name]}</b></span>
              <div className={'spd-chips' + (has('cards') ? ' is-cards' : '')} role="group" aria-label={o.name}>{o.values.map((x) => { const vv = (p.variants || []).find((y) => y.name.split(' / ').includes(x)); const vo = vv && mrp > Number(vv.price) ? Math.round(((mrp - Number(vv.price)) / mrp) * 100) : 0; return <button key={x} type="button" aria-pressed={pick[o.name] === x} onClick={() => setPick((st2) => ({ ...st2, [o.name]: x }))}>{x}{has('cards') && vo ? <em>{vo}% OFF</em> : null}</button>; })}</div>
            </div>
          ))}
          {has('warrantyChip') && warranty ? <span className="spd-opt"><span>Warranty: <em className="spd-wchip">{warranty.label}</em></span></span> : null}
          {has('pay') ? (
            <div className="spd-payopt" role="radiogroup" aria-label="Payment options">
              <button type="button" role="radio" aria-checked={pay === 'cash'} onClick={() => setPay('cash')}><i aria-hidden="true" /><span><b>{bdt(price)}{mrp > price ? <s>{bdt(mrp)}</s> : null}</b><small>Cash or online payment</small></span></button>
              {price >= 5000 ? <button type="button" role="radio" aria-checked={pay === 'emi'} onClick={() => setPay('emi')}><i aria-hidden="true" /><span><b>{bdt(Math.ceil((mrp || price) / emiM))}/month</b><small>0% EMI up to {emiM} months on bank cards</small></span></button> : null}
            </div>
          ) : null}
          {has('urgency') && stock > 0 && stock < 10 ? <span className="spd-urgent"><Icon name="flame" width="16" height="16" aria-hidden="true" />Only <b>{stock}</b> items left in stock</span> : null}
          {v.catalogMode ? <div className="spd-ask"><b>{v.catalogText || 'Call or WhatsApp for the price'}</b><span><a className="sf-btn" href={tel(phone)}><Icon name="phone" width="16" height="16" aria-hidden="true" />Call</a><a className="sf-btn sf-btn--line" href={wa(waNo, 'Price of ' + p.name + '?')} target="_blank" rel="noopener noreferrer"><Icon name="message-circle" width="16" height="16" aria-hidden="true" />WhatsApp</a></span></div> : buy}
          {has('consult') ? <><p className="spd-hint">Get private advice before you buy</p><a className="sf-btn spd-dark spd-full" href={wa(waNo, 'I need advice about ' + p.name)} target="_blank" rel="noopener noreferrer"><Icon name="message-circle" width="16" height="16" aria-hidden="true" />Ask an expert</a></> : null}
          {has('bulk') ? <div className="spd-box is-row"><span><b>Corporate deal or bulk order?</b><small>Chat with our sales team on WhatsApp for special prices and a quick quote.</small></span><a className="sf-btn sf-btn--sm sf-btn--line" href={wa(waNo, 'Bulk order: ' + p.name)} target="_blank" rel="noopener noreferrer">WhatsApp now</a></div> : null}
          {(v.showDelivery || warranty) && !has('warrantyChip') ? (
            <div className="spd-note">
              {v.showDelivery && v.deliveryNote ? <div><Icon name="truck" width="16" height="16" aria-hidden="true" /><span>{v.deliveryNote}</span></div> : null}
              {warranty ? <div><Icon name="shield-check" width="16" height="16" aria-hidden="true" /><span>{warranty.label}{warranty.claim ? ` · claim at ${warranty.claim.toLowerCase() === 'our shop' ? 'our shop' : warranty.claim}` : ''}</span></div> : null}
            </div>
          ) : null}
          {has('trustgrid') ? <div className="spd-trustgrid">{[['badge-check', '100% authentic products'], ['rotate-ccw', 'Easy returns'], ['truck', freeAt ? 'Free delivery over ' + bdt(freeAt) : 'Fast delivery'], ['heart', 'Loved by customers']].map(([i, t]) => <span key={t}><Icon name={i} width="16" height="16" aria-hidden="true" />{t}</span>)}</div> : null}
          {has('share') ? <span className="spd-share">{p.sku ? <small>SKU: {p.sku}</small> : null}Share: <a href={'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook"><Icon name="facebook" width="16" height="16" /></a><a href={wa('', p.name)} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp"><Icon name="message-circle" width="16" height="16" /></a><button type="button" className="spd-copy" onClick={copyLink}><Icon name="copy" width="14" height="14" aria-hidden="true" />Copy link</button></span> : null}
          {v.trust ? <TrustMarks /> : null}
        </div>
      </div>
      {v.boughtTogether !== false ? <BoughtTogether p={p} v={v} /> : null}
      {details}
      {v.reviewsPos === 'below' && v.detailsStyle !== 'accordion' && v.detailsStyle !== 'open' ? <section className="spd-panel" aria-labelledby="spd-rh"><h2 id="spd-rh">Reviews</h2>{reviewList}</section> : null}
      {v.stickyCart ? (
        <div className="spd-sticky">
          <Price price={price} mrp={0} />
          <button type="button" className="sf-btn sf-btn--fill" disabled={out} onClick={() => add(false)}>{out ? w('outOfStock') : w('addToCart')}</button>
        </div>
      ) : null}
    </div>
  );
}

export default function StoreProduct() {
  const st = useStoreItem('product');
  const p = st.item;
  const ctx = useMemo(() => (p ? contextOf('product', p) : null), [p]);
  const lay = useLayout('product', { product: p }, p ? p.id + (st.shows ? '1' : '0') : '');
  useEffect(() => { if (p && st.shows) viewed(p.id); }, [p, st.shows]);
  return (
    <StoreChrome screen="StoreProduct" kind="product" css={PRODUCT_CSS} head={st.ready ? st.head : null} movedFrom={st.movedFrom} headerId={lay ? lay.header : ''}
      preview={st.ready && st.shows && p && p.st !== 'active' ? <>Preview · this product is not on sale yet <Link href={`/add-product?id=${p.id}`} style={{ color: 'inherit' }}>Edit product</Link></> : null}>
      {(shell) => (!st.ready || !lay ? <div style={{ minHeight: 400 }} aria-busy="true" /> : st.shows ? (
        <Sections sections={lay.sections} values={shell.values} catalog={shell.catalog} ctx={{ product: { id: p.id, cat: p.cat, brand: p.brand } }}
          main={(
            <div className="sf-wrap">
              <Crumbs items={[...(ctx.breadcrumbs || []).slice(0, -1).map((b) => { const x = parsePath(b.path); return { name: b.name, href: x ? demoHref(x.kind, x.handle) : undefined }; }), { name: p.name }]} />
              <ProductMain p={p} ctx={{ ...ctx, product: { ...(ctx.product || {}), isNew: ((storeProducts().find((x) => x.id === p.id)) || {}).isNew } }} v={shell.values} general={shell.general} />
            </div>
          )} />
      ) : <NotFound shell={shell} />)}
    </StoreChrome>
  );
}

export const PRODUCT_CSS = CSS + PRODUCT_EXTRAS_CSS + `
.spd-ask{display:flex;flex-direction:column;gap:10px;padding:14px;border-radius:var(--sf-radius-card);background:var(--sf-soft)}
.spd-ask span{display:flex;flex-wrap:wrap;gap:8px}
.spd-ask .sf-btn{flex:1 1 140px}
.sf-catalog :is(.spd-grid4,.spd-alt,.spd-pills,.spd-payopt,.spd-emi,.spd-save,.spd-off,.spx-fbt,.spx-timer){display:none!important}
`;
