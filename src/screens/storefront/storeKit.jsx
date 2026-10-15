'use client';
// storeKit — what every themed customer page shares (Module A · storefront builder): the storefront CSS (drawn only
// with the theme's variables, lib/storefront/theme.js › themeVars), useStorefront() (theme, header, menus, categories,
// cart count — read after mount, re-read on every change and on the editors' live preview), the product card, stars,
// price, quick add and an HTML block's content. Used by storeChrome.jsx, storeHeader.jsx, sections.jsx and the pages.

import React, { useEffect, useRef, useState } from 'react';
import { resolveIn } from '@/lib/files';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { formatBDT } from '@/lib/format';
import { businessProfile } from '@/lib/businessProfile';
import { readSettings, SETTINGS_EVENT } from '@/lib/settingsStore';
import { getMenus, STORE_MENUS_EVENT } from '@/lib/storeMenus';
import { STORE_PAGES_EVENT } from '@/lib/storePages';
import { CATEGORIES_EVENT } from '@/lib/productCategories';
import { SF_EVENT, listenPreview, previewPreset } from '@/lib/storefront/store';
import { presetMenus } from '@/lib/storefront/presets';
import { themeValues, optionBy } from '@/lib/storefront/theme';
import { headerFor } from '@/lib/storefront/headers';
import { getBlock } from '@/lib/storefront/blocks';
import { lockOf, editing } from '@/lib/storefront/access';
import { storeCategories, refreshCatalog } from '@/lib/storefront/catalog';
import { cartCount, addToCart, skuForProduct, openSideCart, CART_EVENT, goCheckout } from '@/lib/storefront/cart';
import { BlockView } from '@/screens/integrations/blogShared';
import { getCatalog } from '@/lib/stock';
import { cartLines, cartTotal } from '@/lib/storefront/cart';
import { useSaved, toggleWish, toggleCompare, COMPARE_MAX } from '@/lib/storefront/saved';
import { w, setStoreWords } from '@/lib/storefront/words';

/** A fixed word the merchant can change (Words and labels); data-w lets the tweak panel open it on a click. */
export const W = ({ k, vars }) => <span data-w={k}>{w(k, vars)}</span>;
export { w };

export const QUICK_VIEW_EVENT = 'gc:store-quick-view';
/** Open a product in the quick view (storeChrome › QuickView). */
export const quickView = (id) => { try { window.dispatchEvent(new CustomEvent(QUICK_VIEW_EVENT, { detail: { id } })); } catch { /* ignore */ } };
export function wishToggle(p) {
  const on = toggleWish(p.id);
  toast(on ? `${p.name} saved to your wishlist.` : `${p.name} taken off your wishlist.`);
}
export function compareToggle(p) {
  const r = toggleCompare(p.id);
  if (r.full) toast(`You can compare up to ${COMPARE_MAX} products. Take one off on the Compare page.`, { tone: 'info' });
  else toast(r.added ? `${p.name} added to compare.` : `${p.name} taken off compare.`);
}
/** The wishlist heart, quick view and compare buttons over a card's picture. */
function CardActs({ p, v }) {
  const saved = useSaved();
  const wished = saved.wish.includes(p.id);
  const comp = saved.compare.includes(p.id);
  if (v.cardWish === false && v.cardQuickView === false) return null;
  return (
    <span className="sf-card__acts">
      {v.cardWish !== false ? <button type="button" className={'is-wish' + (wished ? ' is-on' : '')} aria-pressed={wished} aria-label={wished ? `Remove ${p.name} from the wishlist` : `Save ${p.name} to the wishlist`} onClick={() => wishToggle(p)}><Icon name="heart" width="16" height="16" aria-hidden="true" /></button> : null}
      {v.cardQuickView !== false ? <button type="button" aria-label={`Quick view of ${p.name}`} onClick={() => quickView(p.id)}><Icon name="eye" width="16" height="16" aria-hidden="true" /></button> : null}
      <button type="button" className={comp ? 'is-on' : ''} aria-pressed={comp} aria-label={comp ? `Remove ${p.name} from compare` : `Compare ${p.name}`} onClick={() => compareToggle(p)}><Icon name="git-compare-arrows" width="16" height="16" aria-hidden="true" /></button>
    </span>
  );
}
/** "Only 3 left" with a bar (Customize › Product card / Product page). */
export function StockBar({ stock }) {
  if (!(stock > 0 && stock <= 10)) return null;
  return <span className="sf-sbar"><small data-w="hurryLeft">{w('hurryLeft', { n: stock })}</small><span className="sf-sbar__t" aria-hidden="true"><i style={{ width: Math.max(8, stock * 10) + '%' }} /></span></span>;
}

export const bdt = (n) => formatBDT(Math.round(Number(n) || 0));

/** Theme, header, menus, categories and the cart count, after mount; re-read on every change. */
export function useStorefront(headerId = '') {
  const [st, setSt] = useState({ ready: false, values: null, header: null, menus: [], cats: [], count: 0, shop: null, general: {} });
  useEffect(() => {
    listenPreview();
    const load = () => {
      refreshCatalog();
      let shop = null;
      try { shop = businessProfile(); } catch { shop = null; }
      let general = {};
      try { general = readSettings('general').values || {}; } catch { general = {}; }
      const values = themeValues();
      setStoreWords(values.words);
      const h = headerFor(headerId);
      let catalog = [];
      try { catalog = getCatalog(); } catch { catalog = []; }
      setSt({ ready: true, values, header: h.header, headerId: h.id, menus: previewPreset() ? presetMenus(previewPreset()) : getMenus(), cats: storeCategories(), count: cartCount(), total: cartTotal(cartLines()), catalog, shop, general, cssAllowed: !lockOf(optionBy('css')), edit: editing() });
    };
    load();
    const evs = [SF_EVENT, STORE_MENUS_EVENT, STORE_PAGES_EVENT, CART_EVENT, CATEGORIES_EVENT, SETTINGS_EVENT, 'storage'];
    evs.forEach((e) => window.addEventListener(e, load));
    return () => evs.forEach((e) => window.removeEventListener(e, load));
  }, [headerId]);
  return st;
}

/** Rating as stars: ★★★★☆ 4.2 (12) */
export function Stars({ rating, small }) {
  if (!rating || !rating.count) return null;
  const full = Math.round(rating.avg);
  return (
    <span className={'sf-stars' + (small ? ' is-sm' : '')} aria-label={`Rated ${rating.avg.toFixed(1)} out of 5, ${rating.count} review${rating.count === 1 ? '' : 's'}`}>
      <span aria-hidden="true">{'★★★★★'.slice(0, full)}<i>{'★★★★★'.slice(full)}</i></span>
      <small>{rating.avg.toFixed(1)} ({rating.count})</small>
    </span>
  );
}

export function Price({ price, mrp, big }) {
  return (
    <span className={'sf-price' + (big ? ' is-big' : '')}>
      <b>{bdt(price)}</b>{mrp && mrp > price ? <s>{bdt(mrp)}</s> : null}
    </span>
  );
}

/** Add to the cart; the side cart opens (or a note, when the theme uses the cart page). */
export function addAndShow(p, values, variantName = '', qty = 1) {
  const sku = skuForProduct(p.id, variantName);
  if (!sku) { toast(`${p.name} can’t be added right now.`, { tone: 'error' }); return false; }
  addToCart(sku, qty);
  if (values && values.cartType === 'page') toast(`${p.name} added to the cart.`);
  else openSideCart();
  return true;
}

/** Add to the cart and go straight to checkout (cards and product pages with "Buy now"). */
export function buyNow(p, values, variantName = '', qty = 1) {
  const sku = skuForProduct(p.id, variantName);
  if (!sku) { toast(`${p.name} can’t be bought right now.`, { tone: 'error' }); return; }
  addToCart(sku, qty);
  goCheckout(values);
}

/**
 * A product in a list. The theme's card style (Customize › Product card) decides the look:
 *   classic · bordered (button below, badge top-right) · horizontal (picture beside the text) · spec (Save pill, key specs,
 *   Buy now + Add to compare) · solid (full-width filled button) · outline (full-width outline button) · centered (ribbon,
 *   free-delivery pill, add bar along the bottom) · minimal (tag, category, price) · pill (rounded −% and Sold out badges)
 *   · clean (NEW badge, centred name and price). `style` overrides the theme's (a section's own card look).
 */
export function ProductCard({ p, values: v, style }) {
  const st = style || v.cardStyle || 'classic';
  const out = p.stock <= 0 && !p.oversell;
  const save = p.mrp > p.price ? p.mrp - p.price : 0;
  const pct = p.off > 0 ? '−' + p.off + '%' : '';
  const btn = v.cardButton || 'add';
  const add = () => addAndShow(p, v);
  const buy = () => buyNow(p, v);
  const pic = (
    <a href={p.href} className="sf-card__img" style={{ background: p.tbg }} aria-label={p.name}>
      {p.img ? <img src={p.img} alt="" loading="lazy" /> : <span aria-hidden="true">{p.name.slice(0, 1)}</span>}
      {p.img2 && v.cardHover === 'second' ? <img className="sf-card__alt" src={p.img2} alt="" loading="lazy" /> : null}
      {st === 'classic' && v.saleBadge !== 'none' && p.off > 0 ? <em className="sf-badge">{v.saleBadge === 'text' ? 'Sale' : pct}</em> : null}
      {(st === 'bordered' || st === 'outline') && (p.off > 0 || p.isNew) ? <em className={'sf-tag is-tr' + (p.off > 0 ? '' : ' is-new')}>{p.off > 0 ? (st === 'bordered' ? 'Save ' + p.off + '%' : pct) : 'New'}</em> : null}
      {st === 'horizontal' && p.isNew && !p.off ? <em className="sf-tag is-tr is-new">New</em> : null}
      {st === 'spec' && save ? <em className="sf-tag is-tl is-save">Save: {bdt(save)} ({pct})</em> : null}
      {(st === 'solid' || st === 'clean') && p.isNew ? <em className="sf-tag is-tl is-plain">New</em> : null}
      {st === 'solid' && p.off > 0 ? <em className="sf-tag is-tr">{pct}</em> : null}
      {st === 'centered' && p.off > 0 ? <em className="sf-ribbon">{p.off}% OFF</em> : null}
      {st === 'minimal' && (p.off > 0 || p.isNew) ? <em className="sf-tag is-tl is-dark">{p.off > 0 ? 'ON SALE' : 'NEW'}</em> : null}
      {st === 'pill' ? <span className="sf-tags">{p.off > 0 ? <em className="sf-tag is-good">{pct}</em> : null}{out ? <em className="sf-tag">Sold out</em> : null}</span> : null}
    </a>
  );
  const img = <div className="sf-card__media">{pic}<CardActs p={p} v={v} /></div>;
  const name = (
    <>
      {v.cardBrand && p.brand && st !== 'classic' ? <small className="sf-card__brand">{p.brand}</small> : null}
      <a href={p.href} className="sf-card__name">{p.name}</a>
      {v.cardStockBar && !out ? <StockBar stock={p.stock} /> : null}
    </>
  );
  const stars = v.cardRating && p.rating && p.rating.count ? <Stars rating={p.rating} small /> : null;
  const stock = v.cardStock ? <small className={'sf-stock' + (out ? ' is-out' : p.stock > 0 && p.stock < 6 ? ' is-low' : '')}>{p.stock > 0 ? (p.stock < 6 ? w('onlyLeft', { n: p.stock }) : w('inStock')) : p.oversell ? w('preOrder') : w('outOfStock')}</small> : null;
  const buttons = (cls = '') => (
    <span className={'sf-card__btns' + cls}>
      {btn !== 'buy' ? <button type="button" className={'sf-btn sf-btn--sm' + (st === 'bordered' || st === 'outline' ? ' sf-btn--line' : '')} disabled={out} onClick={add}><Icon name="shopping-cart" width="16" height="16" aria-hidden="true" />{out ? w('soldOut') : w('addToCart')}</button> : null}
      {btn !== 'add' ? <button type="button" className="sf-btn sf-btn--sm sf-btn--buy" disabled={out} onClick={buy}><Icon name="zap" width="16" height="16" aria-hidden="true" /><W k="buyNow" /></button> : null}
    </span>
  );

  if (st === 'horizontal') {
    return (
      <article className="sf-card sf-card--h" data-pid={p.id}>
        {img}
        <div className="sf-card__body">
          {name}
          {stars}
          <Price price={p.price} mrp={p.mrp} />
          {save ? <small className="sf-save">Save {bdt(save)}</small> : null}
          <span className="sf-card__btns">
            <button type="button" className="sf-btn sf-btn--sm sf-btn--line" disabled={out} onClick={add}><Icon name="shopping-cart" width="16" height="16" aria-hidden="true" /><W k="addToCart" /></button>
            <button type="button" className="sf-btn sf-btn--sm" disabled={out} onClick={buy}><Icon name="zap" width="16" height="16" aria-hidden="true" /><W k="buyNow" /></button>
          </span>
        </div>
      </article>
    );
  }
  if (st === 'spec') {
    return (
      <article className="sf-card sf-card--spec" data-pid={p.id}>
        {img}
        <div className="sf-card__body">
          {name}
          {(p.keys || []).length ? <ul className="sf-keys">{p.keys.map(([k, x]) => <li key={k}>{k}: {x}</li>)}</ul> : null}
          <span className="sf-card__foot"><Price price={p.price} mrp={p.mrp} /></span>
          <button type="button" className="sf-btn sf-btn--sm sf-btn--grey" disabled={out} onClick={btn === 'add' ? add : buy}><Icon name="shopping-cart" width="16" height="16" aria-hidden="true" />{out ? w('outOfStock') : btn === 'add' ? w('addToCart') : w('buyNow')}</button>
          <button type="button" className="sf-compare" onClick={() => compareToggle(p)}><Icon name="git-compare-arrows" width="14" height="14" aria-hidden="true" />Add to compare</button>
        </div>
      </article>
    );
  }
  if (st === 'centered') {
    const free = Number(v.freeShipAt) > 0 && p.price >= Number(v.freeShipAt);
    return (
      <article className="sf-card sf-card--c" data-pid={p.id}>
        {img}
        <div className="sf-card__body">
          {name}
          {free ? <small className="sf-pill">Free delivery</small> : null}
          <Price price={p.price} mrp={p.mrp} />
          {stars}
          {p.unit ? <small className="sf-unit">{p.unit}</small> : null}
        </div>
        <button type="button" className="sf-addbar" disabled={out} onClick={btn === 'buy' ? buy : add}>{out ? w('soldOut') : btn === 'buy' ? w('buyNow') : w('addToCart')}</button>
      </article>
    );
  }
  if (st === 'minimal') {
    const cat = String(p.cat || '').split(' › ').pop();
    return (
      <article className="sf-card sf-card--m" data-pid={p.id}>
        {img}
        <div className="sf-card__body">
          {cat ? <small className="sf-cat">{cat}</small> : null}
          {name}
          <Price price={p.price} mrp={p.mrp} />
        </div>
      </article>
    );
  }
  if (st === 'pill' || st === 'clean') {
    return (
      <article className={'sf-card sf-card--' + st} data-pid={p.id}>
        {img}
        <div className="sf-card__body">
          {name}
          {st === 'pill' ? stars : null}
          <Price price={p.price} mrp={p.mrp} />
          {st === 'pill' ? buttons(' is-center') : null}
        </div>
      </article>
    );
  }
  // classic · bordered · solid · outline
  return (
    <article className={'sf-card sf-card--' + st} data-pid={p.id}>
      {img}
      <div className="sf-card__body">
        {st === 'classic' && p.brand ? <small className="sf-card__brand">{p.brand}</small> : null}
        {name}
        {stars}
        <Price price={p.price} mrp={p.mrp} />
        {st === 'classic' ? stock : null}
        {st === 'classic' ? (v.cardQuick ? <button type="button" className="sf-btn sf-btn--sm" disabled={out} onClick={btn === 'buy' ? buy : add}><Icon name="plus" width="16" height="16" aria-hidden="true" />{out ? w('soldOut') : btn === 'buy' ? w('buyNow') : 'Add'}</button> : null) : buttons(' is-full')}
      </div>
    </article>
  );
}

/** An HTML block's content (Online Store › HTML blocks). */
export function BlockContent({ id, catalog, compact }) {
  const ref = useRef(null);
  const b = id ? getBlock(id) : null;
  // pictures from Settings › Files ('gcfile:' addresses) are read from this browser's file store
  useEffect(() => { resolveIn(ref.current); });
  if (!b) return null;
  return <div ref={ref} className={'bl-article sf-block' + (compact ? ' is-compact' : '')}>{(b.blocks || []).map((x) => <BlockView key={x.id} block={x} catalog={catalog} live />)}</div>;
}

/** Customer-account things that need the live store's server (accounts come later). */
export const later = (what) => toast(`${what} opens on the live store once customer accounts are switched on.`, { tone: 'info' });

export const SF_CSS = `
.spd-chips{display:flex;flex-wrap:wrap;gap:6px}
.spd-chips button{min-height:36px;padding:0 14px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-btn);background:var(--sf-surface);color:var(--sf-text);font:inherit;cursor:pointer}
.spd-chips button[aria-pressed="true"]{border-color:var(--sf-primary);box-shadow:inset 0 0 0 1px var(--sf-primary);color:var(--sf-primary);font-weight:var(--weight-medium)}
.sf-card__media{position:relative;display:flex;flex-direction:column}
.sf-card__media>.sf-card__img{flex:1}
.sf-card__acts{position:absolute;top:10px;right:10px;z-index:2;display:flex;flex-direction:column;gap:6px;opacity:0;transform:translateX(6px);transition:opacity .2s ease,transform .2s ease}
.sf-card:hover .sf-card__acts,.sf-card:focus-within .sf-card__acts{opacity:1;transform:none}
.sf-card__acts button{display:grid;place-items:center;width:36px;height:36px;border:0;border-radius:50%;background:var(--sf-surface);color:var(--sf-text);box-shadow:0 2px 8px rgba(15,23,42,.16);cursor:pointer;transition:background .15s ease,color .15s ease}
.sf-card__acts button:hover{background:var(--sf-primary);color:var(--sf-on-primary)}
.sf-card__acts button.is-on{color:var(--sf-sale)}
.sf-card__acts button.is-wish.is-on svg{fill:currentColor}
.sf-card:has(.sf-card__acts) .sf-tag.is-tr,.sf-badge-right .sf-card:has(.sf-card__acts) .sf-badge{right:54px}
@media (hover:none){.sf-card__acts{opacity:1;transform:none}.sf-card__acts>:not(.is-wish){display:none}.sf-card__acts button{width:36px;height:36px}}
.sf-sbar{display:flex;flex-direction:column;gap:4px;width:100%}
.sf-sbar small{color:var(--sf-sale);font-size:var(--sf-fs-sm);font-weight:var(--weight-medium)}
.sf-sbar__t{display:block;height:5px;border-radius:var(--radius-full);background:color-mix(in srgb,var(--sf-sale) 14%,var(--sf-surface));overflow:hidden}
.sf-sbar__t i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--sf-sale),color-mix(in srgb,var(--sf-sale) 60%,var(--sf-accent)))}

.sf-theme{min-height:100vh;display:flex;flex-direction:column;background:var(--sf-bg);color:var(--sf-text);font-family:var(--sf-font-body);font-size:var(--sf-fs);line-height:1.55;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility;caret-color:var(--sf-primary);accent-color:var(--sf-primary);scrollbar-color:color-mix(in srgb,var(--sf-text) 28%,transparent) transparent}
/* nothing on a store page scrolls the page sideways (clip keeps the sticky header working); pictures, videos and maps
   never grow past their box; long words and links wrap. Every picture slot sets its own shape (aspect-ratio + cover). */
.sf-theme{overflow-x:clip}
.sf-main{min-width:0}
:where(.sf-theme) :is(img,video,iframe,canvas,svg){max-width:100%}
:where(.sf-theme) img{height:auto}
:where(.sf-theme) :is(p,li,dd,blockquote,figcaption,h1,h2,h3,h4,td){overflow-wrap:break-word}
:where(.sf-theme) table{max-width:100%}
/* call-to-action blocks written in the blog / page editor draw as the theme's buttons */
.sf-theme a.gc-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 22px;border:1.5px solid var(--sf-primary);border-radius:var(--sf-radius-btn);background:transparent;color:var(--sf-primary);font-family:var(--sf-font-body);font-weight:var(--weight-semibold);text-decoration:none}
.sf-theme a.gc-btn.gc-btn--solid{background:var(--sf-primary);color:var(--sf-on-primary)}
.sf-theme ::selection{background:color-mix(in srgb,var(--sf-primary) 24%,transparent);color:inherit}
.sf-theme :is(h1,h2,h3){font-family:var(--sf-font-head);text-transform:var(--sf-case);color:inherit;margin:0;font-weight:var(--sf-head-w,600);letter-spacing:var(--sf-head-track,0);line-height:1.15;text-wrap:balance}
.sf-theme :where(a){color:inherit;text-underline-offset:.2em;text-decoration-thickness:from-font}
.sf-theme :focus-visible{outline:2px solid var(--sf-primary);outline-offset:2px}
.sf-wrap{width:100%;max-width:var(--sf-width);margin:0 auto;padding:0 24px;box-sizing:border-box}
.sf-main{flex:1;display:flex;flex-direction:column}
.sf-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 20px;border:1.5px solid var(--sf-primary);border-radius:var(--sf-radius-btn);background:var(--sf-primary);color:var(--sf-on-primary);font:inherit;font-weight:var(--weight-semibold);letter-spacing:.005em;text-decoration:none;cursor:pointer;white-space:nowrap;transition:filter .18s ease,transform .18s cubic-bezier(.2,.8,.2,1),box-shadow .18s ease,background-color .18s ease}
.sf-btn:hover{filter:brightness(1.08);box-shadow:0 6px 16px -8px color-mix(in srgb,var(--sf-primary) 70%,transparent)}
.sf-btn:active{transform:translateY(1px)}
.sf-btn[disabled]{opacity:.45;cursor:not-allowed}
.sf-btn--sm{min-height:36px;padding:0 14px;font-size:var(--sf-fs-sm)}
.sf-btn--ghost,.sf-outline .sf-btn{background:transparent;color:var(--sf-primary)}
.sf-outline .sf-btn--fill{background:var(--sf-primary);color:var(--sf-on-primary)}
.sf-btn--line{background:transparent;color:inherit;border-color:currentColor}
.sf-link{color:var(--sf-primary);text-decoration:underline;background:none;border:0;padding:0;font:inherit;cursor:pointer}
.sf-muted{color:var(--sf-muted)}
.sf-input{width:100%;padding:0 12px;min-height:var(--sf-field-h);border-style:solid;border-color:var(--sf-field-line);border-width:var(--sf-fbt) var(--sf-fbx) var(--sf-fbb);border-radius:var(--sf-field-r);background:var(--sf-field-bg);box-shadow:var(--sf-field-shadow);color:var(--sf-text);font:inherit;box-sizing:border-box}
.sf-input:focus{outline:none;border-color:var(--sf-primary);box-shadow:var(--sf-focus-ring)}
.sf-stars{display:inline-flex;align-items:center;gap:6px;color:var(--text-warning);font-size:var(--sf-fs)}
.sf-stars i{font-style:normal;color:var(--sf-line)}
.sf-stars small{color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.sf-stars.is-sm{font-size:var(--sf-fs-sm)}
.sf-price{display:inline-flex;align-items:baseline;flex-wrap:wrap;gap:4px 8px}
.sf-price b{font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums lining-nums;letter-spacing:-.01em}
.sf-price s{color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.sf-price.is-big b{font-size:var(--sf-fs-h2)}
.sf-badge{position:absolute;top:10px;left:10px;padding:2px 8px;border-radius:var(--sf-radius-btn);background:var(--sf-sale);color:var(--sf-on-sale);font-style:normal;font-size:var(--sf-fs-sm);font-weight:var(--weight-semibold)}
.sf-stock{font-size:var(--sf-fs-sm);color:#047857}
.sf-stock.is-low{color:#b45309}.sf-stock.is-out{color:#b91c1c}
/* product card */
.sf-grid{display:grid;grid-template-columns:repeat(var(--sf-cols),minmax(0,1fr));gap:var(--sf-gap)}
.sf-row{display:grid;grid-auto-flow:column;grid-auto-columns:calc((100% - (var(--sf-cols) - 1) * var(--sf-gap)) / var(--sf-cols));gap:var(--sf-gap);overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:6px;scrollbar-width:thin}
.sf-row>*{scroll-snap-align:start}
.sf-card{display:flex;flex-direction:column;min-width:0;background:var(--sf-surface);border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);overflow:hidden;transition:transform .28s cubic-bezier(.2,.8,.2,1),box-shadow .28s ease,border-color .28s ease}
.sf-card:hover{transform:translateY(-3px);border-color:color-mix(in srgb,var(--sf-primary) 22%,var(--sf-line));box-shadow:0 14px 28px -18px rgba(15,23,42,.35)}
@media (prefers-reduced-motion:reduce){.sf-card,.sf-card:hover{transition:none;transform:none}}
.sf-card__img{position:relative;display:grid;place-items:center;aspect-ratio:var(--sf-ratio);overflow:hidden;color:var(--sf-text);text-decoration:none;font-size:var(--sf-fs-h1);font-weight:var(--weight-semibold);opacity:.9}
.sf-card__img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .5s cubic-bezier(.2,.8,.2,1)}
.sf-card:hover .sf-card__img img:not(.sf-card__alt){transform:scale(1.04)}
.sf-card__alt{opacity:0;transition:opacity .2s}
.sf-card:hover .sf-card__alt{opacity:1}
.sf-card__body{display:flex;flex-direction:column;gap:6px;padding:14px;flex:1}
.sf-card__body .sf-btn{margin-top:auto;align-self:flex-start}
.sf-card__brand{color:var(--sf-muted);font-size:var(--sf-fs-sm);letter-spacing:.01em}
.sf-card__name{text-decoration:none;font-weight:var(--weight-medium);font-size:calc(var(--sf-fs) + 0.5px);line-height:1.38;letter-spacing:-.005em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sf-card__name:hover{color:var(--sf-primary)}
.sf-block.is-compact{font-size:var(--sf-fs-sm)}
.sf-block.is-compact :is(p,h3,h4){margin:0 0 6px}
.sf-block img{max-width:100%;height:auto;border-radius:var(--sf-radius)}
.sf-theme .bl-article{color:inherit;font-family:inherit}
.sf-block p:has(>a.gc-btn){text-align:left!important}
.sfs--html .sf-block{max-width:none;padding:24px 28px;border-radius:var(--sf-radius-card);background:var(--sf-soft)}
.sfs--html .sf-block>:last-child{margin-bottom:0}
.sf-theme .bl-article a.gc-btn--solid{background:var(--sf-primary);color:var(--sf-on-primary);border-color:var(--sf-primary)}
/* card styles (Customize › Product card › Card style) */
.sf-tag{position:absolute;z-index:1;padding:2px 8px;border-radius:var(--sf-radius-btn);background:var(--sf-sale);color:var(--sf-on-sale);font-style:normal;font-size:var(--sf-fs-sm);font-weight:var(--weight-semibold);line-height:1.5}
.sf-tag.is-tr{top:8px;right:8px}.sf-tag.is-tl{top:8px;left:8px}
.sf-tag.is-new{background:var(--sf-accent);color:var(--sf-on-accent)}
.sf-tag.is-good{background:#16a34a;color:#fff}
.sf-tag.is-dark{background:#7f1d1d;color:#fff;border-radius:2px;letter-spacing:.04em}
.sf-tag.is-plain{background:var(--sf-surface);color:var(--sf-text);border:1px solid var(--sf-line);border-radius:var(--radius-full)}
.sf-tag.is-save{background:#6d28d9;color:#fff;border-radius:var(--radius-full)}
.sf-tags{position:absolute;top:8px;left:8px;z-index:1;display:flex;flex-direction:column;align-items:flex-start;gap:4px}
.sf-tags .sf-tag{position:static;border-radius:var(--radius-full)}
.sf-ribbon{position:absolute;top:0;left:0;z-index:1;padding:4px 10px;background:var(--sf-sale);color:var(--sf-on-sale);font-style:normal;font-size:var(--sf-fs-sm);font-weight:var(--weight-semibold);border-radius:0 0 var(--sf-radius) 0}
.sf-card__btns{display:flex;flex-wrap:wrap;gap:6px;margin-top:auto}
.sf-card__btns.is-full .sf-btn{flex:1 1 100%;width:100%}
.sf-card__btns.is-center{justify-content:center}
.sf-card .sf-card__btns .sf-btn{align-self:stretch;margin-top:0}
.sf-btn--buy{background:var(--sf-accent);border-color:var(--sf-accent);color:var(--sf-on-accent)}
.sf-btn--grey{background:var(--sf-soft);border-color:var(--sf-soft);color:var(--sf-text);width:100%}
.sf-card--bordered .sf-card__body,.sf-card--outline .sf-card__body,.sf-card--solid .sf-card__body{gap:6px}
.sf-card--bordered .sf-price b,.sf-card--outline .sf-price b{color:var(--sf-primary)}
.sf-card--solid .sf-card__btns .sf-btn{background:var(--sf-accent);border-color:var(--sf-accent);color:var(--sf-on-accent)}
.sf-card--outline .sf-tag{background:var(--sf-surface);color:var(--sf-primary);box-shadow:inset 0 0 0 1.5px var(--sf-primary)}
.sf-card--h{flex-direction:row;align-items:stretch}
.sf-card--h .sf-card__media{flex:0 0 42%}
.sf-card--h .sf-card__img{aspect-ratio:auto;min-height:170px;height:100%}
.sf-card--h .sf-card__body{justify-content:center;gap:6px;padding:16px}
.sf-card--h .sf-price b{font-size:var(--sf-fs-lg);color:var(--sf-primary)}
.sf-card--h .sf-card__btns{margin-top:6px}
.sf-save{align-self:flex-start;padding:1px 8px;border-radius:var(--radius-full);background:#dcfce7;color:#166534;font-size:var(--sf-fs-sm);font-weight:var(--weight-medium)}
.sf-card--spec .sf-card__name{color:var(--sf-text)}
.sf-keys{margin:2px 0 4px;padding:0 0 0 16px;color:var(--sf-muted);font-size:var(--sf-fs-sm);line-height:1.5}
.sf-keys li{display:list-item;list-style:disc}
.sf-card__foot{margin-top:auto;padding-top:8px;border-top:1px solid var(--sf-line)}
.sf-card--spec .sf-price b{font-size:var(--sf-fs-lg);color:var(--sf-sale)}
.sf-compare{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:32px;border:0;background:none;color:var(--sf-muted);font:inherit;font-size:var(--sf-fs-sm);cursor:pointer}
.sf-compare:hover{color:var(--sf-primary)}
.sf-card--c .sf-card__body{align-items:center;text-align:center;gap:6px}
.sf-card--c .sf-price{justify-content:center;flex-direction:row-reverse}
.sf-card--c .sf-price b{color:var(--sf-sale)}
.sf-pill{padding:1px 10px;border-radius:var(--radius-full);background:var(--sf-sale);color:var(--sf-on-sale);font-size:var(--sf-fs-sm);font-weight:var(--weight-semibold);letter-spacing:.02em;text-transform:uppercase}
.sf-unit{color:var(--sf-text);font-weight:var(--weight-medium)}
.sf-addbar{display:block;width:100%;min-height:44px;margin-top:auto;border:0;background:var(--sf-primary);color:var(--sf-on-primary);font:inherit;font-weight:var(--weight-semibold);letter-spacing:.04em;text-transform:uppercase;cursor:pointer}
.sf-addbar[disabled]{opacity:.5;cursor:not-allowed}
.sf-card--m{border:0;background:transparent}
.sf-card--m .sf-card__img{border-radius:var(--sf-radius-card)}
.sf-card--m .sf-card__body{padding:10px 2px;gap:2px}
.sf-cat{color:#b45309;font-size:var(--sf-fs-sm);font-weight:var(--weight-medium);text-transform:uppercase;letter-spacing:.04em}
.sf-card--m .sf-price{flex-direction:row-reverse;justify-content:flex-end}
.sf-card--m .sf-price b{color:var(--sf-sale)}
.sf-card--pill .sf-card__body,.sf-card--clean .sf-card__body{align-items:center;text-align:center}
.sf-card--pill .sf-price,.sf-card--clean .sf-price{justify-content:center;flex-direction:row-reverse}
.sf-card--pill .sf-price b{color:var(--sf-sale)}
.sf-card--clean{border-color:transparent;box-shadow:0 1px 3px rgba(15,23,42,.08)}
.sf-card--clean .sf-card__img{margin:8px 8px 0;border-radius:var(--sf-radius)}
.sf-card--clean .sf-price b{color:var(--sf-accent)}
@media (max-width:899px){
  .sf-grid{grid-template-columns:repeat(var(--sf-cols-phone),minmax(0,1fr));gap:12px}
  .sf-row{grid-auto-columns:calc((100% - 12px) / 2.2);gap:12px}
}
@media (max-width:640px){
  .sf-wrap{padding:0 16px}
  .sf-card__body{padding:10px}
  .sf-card--h .sf-card__media{flex-basis:38%}
  .sf-card--h .sf-card__img{min-height:140px}
  .sf-card--h .sf-card__body{padding:10px}
}
@media (prefers-reduced-motion:reduce){.sf-card__alt{transition:none}}
`;
