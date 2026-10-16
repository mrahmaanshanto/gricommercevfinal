'use client';
// Cart — the shopper's cart page (/cart), drawn with the theme's Cart layout: the items with + / −, remove, the
// subtotal, the free delivery bar (Theme › Cart & checkout), an order note when the theme has it, the payment marks and
// Checkout. The cart is kept in this browser (lib/storefront/cart.js); Checkout takes these items.
// Front end only: the live store keeps the cart on its server.

import React, { useEffect, useState } from 'react';
import { cartLines, cartTotal, CART_EVENT } from '@/lib/storefront/cart';
import { StoreChrome, Crumbs, CartLines, FreeDelivery, TrustMarks } from './storeChrome';
import { Placed } from './storePlaced';
import { Sections, useLayout } from './sections';
import { bdt } from './storeKit';

const CSS = `
.sct{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:var(--sf-gap);align-items:start;padding-bottom:var(--sf-section)}
.sct-box{display:flex;flex-direction:column;gap:14px;padding:20px;border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.sct h1{font-size:var(--sf-fs-h1);margin:0 0 4px}
.sct-tot{display:flex;justify-content:space-between;font-weight:var(--weight-semibold);font-size:var(--sf-fs-lg)}
.sct textarea{min-height:72px;padding:10px 12px;resize:vertical}
@media (max-width:899px){.sct{grid-template-columns:minmax(0,1fr)}}
`;
const NOTE = 'gc.store.note';
const HEAD = { title: 'Your cart', description: '', robots: 'noindex, follow', canonical: '', og: {}, jsonld: [] };

export default function StoreCart() {
  const lay = useLayout('cart', {}, 'cart');
  const [lines, setLines] = useState(null);
  const [note, setNote] = useState('');
  useEffect(() => {
    const load = () => setLines(cartLines());
    load();
    try { setNote(window.localStorage.getItem(NOTE) || ''); } catch { /* ignore */ }
    window.addEventListener(CART_EVENT, load);
    return () => window.removeEventListener(CART_EVENT, load);
  }, []);
  const saveNote = (x) => { setNote(x); try { window.localStorage.setItem(NOTE, x); } catch { /* ignore */ } };
  return (
    <StoreChrome screen="StoreCart" kind="cart" head={HEAD} headerId={lay ? lay.header : ''} css={CSS}>
      {(shell) => {
        const v = shell.values;
        const total = cartTotal(lines || []);
        const q = shell.preview ? '?preview=1' : '';
        const main = (
          <div className="sf-wrap">
            <Crumbs items={[{ name: 'Cart' }]} />
            <Placed spot="cart" />
            <div className="sct">
              <div className="sct-box">
                <h1>Your cart</h1>
                {lines === null ? <div style={{ minHeight: 120 }} aria-busy="true" /> : lines.length ? <CartLines lines={lines} /> : <p className="sf-muted" style={{ margin: 0 }}>Your cart is empty. <a href={'/store' + q} className="sf-link">Keep shopping</a></p>}
              </div>
              <div className="sct-box">
                <FreeDelivery v={v} total={total} />
                <div className="sct-tot"><span>Subtotal</span><span>{bdt(total)}</span></div>
                <small className="sf-muted">Delivery is added at checkout.</small>
                {v.orderNote ? <div><label htmlFor="sct-note" style={{ display: 'block', marginBottom: 6, fontWeight: 'var(--weight-medium)' }}>Order note</label><textarea id="sct-note" className="sf-input" value={note} onChange={(e) => saveNote(e.target.value)} placeholder="Anything we should know?" /></div> : null}
                <a className="sf-btn sf-btn--fill" href={'/checkout' + q} aria-disabled={!(lines && lines.length) || undefined} onClick={(e) => { if (!(lines && lines.length)) e.preventDefault(); }}>Checkout</a>
                {v.trust ? <TrustMarks /> : null}
              </div>
            </div>
          </div>
        );
        return !lay ? <div style={{ minHeight: 400 }} aria-busy="true" /> : <Sections sections={lay.sections} main={main} values={v} catalog={shell.catalog} />;
      }}
    </StoreChrome>
  );
}
