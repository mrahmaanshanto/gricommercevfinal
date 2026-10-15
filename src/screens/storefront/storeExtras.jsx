'use client';
// Store extras mounted on every themed page (storeChrome): the product quick view (opened from a card's eye button,
// storeKit › quickView) and the age check (Customize › Extras › Age check). Their CSS is EXTRAS_CSS.

import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { storeProducts } from '@/lib/storefront/catalog';
import { useSaved } from '@/lib/storefront/saved';
import { QUICK_VIEW_EVENT, Price, Stars, StockBar, addAndShow, buyNow, wishToggle, compareToggle } from './storeKit';

// ---- quick view ----------------------------------------------------------------------------------------------------------
export function QuickView({ v }) {
  const [p, setP] = useState(null);
  const [pic, setPic] = useState(0);
  const [qty, setQty] = useState(1);
  const closeRef = useRef(null);
  const back = useRef(null);
  const saved = useSaved();
  useEffect(() => {
    const open = (e) => {
      const id = e.detail && e.detail.id;
      let found = null;
      try { found = storeProducts().find((x) => x.id === id) || null; } catch { found = null; }
      if (!found) return;
      back.current = document.activeElement;
      setP(found); setPic(0); setQty(1);
    };
    window.addEventListener(QUICK_VIEW_EVENT, open);
    return () => window.removeEventListener(QUICK_VIEW_EVENT, open);
  }, []);
  const close = () => { setP(null); if (back.current && back.current.focus) back.current.focus(); };
  useEffect(() => {
    if (!p) return undefined;
    if (closeRef.current) closeRef.current.focus();
    const key = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', key);
    const was = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = was; };
  }, [p]);
  if (!p) return null;
  const pics = [p.img, p.img2].filter(Boolean);
  const out = p.stock <= 0 && !p.oversell;
  const hasOptions = (p.variants || []).length > 1;
  const wished = saved.wish.includes(p.id);
  return (
    <div className="sfq-wrap">
      <button type="button" className="sfq-scrim" aria-label="Close the quick view" tabIndex={-1} onClick={close} />
      <div className="sfqv" role="dialog" aria-modal="true" aria-labelledby="sfqv-t">
        <button ref={closeRef} type="button" className="sfqv-x" aria-label="Close" onClick={close}><Icon name="x" width="20" height="20" aria-hidden="true" /></button>
        <div className="sfqv-pics">
          <div className="sfqv-pic" style={{ background: p.tbg }}>{pics.length ? <img src={pics[pic] || pics[0]} alt={p.name} /> : <span aria-hidden="true">{p.name.slice(0, 1)}</span>}</div>
          {pics.length > 1 ? <div className="sfqv-thumbs">{pics.map((src, i) => <button key={src} type="button" aria-label={`Photo ${i + 1}`} aria-pressed={pic === i} onClick={() => setPic(i)}><img src={src} alt="" /></button>)}</div> : null}
        </div>
        <div className="sfqv-info">
          {p.brand ? <small className="sfqv-brand">{p.brand}</small> : null}
          <h2 id="sfqv-t">{p.name}</h2>
          <Stars rating={p.rating} small />
          <Price price={p.price} mrp={p.mrp} big />
          {(p.keys || []).length ? <ul className="sfqv-keys">{p.keys.map(([k, x]) => <li key={k}><span>{k}</span><b>{x}</b></li>)}</ul> : null}
          <small className={'sf-stock' + (out ? ' is-out' : p.stock > 0 && p.stock < 6 ? ' is-low' : '')}>{p.stock > 0 ? (p.stock < 6 ? `Only ${p.stock} left` : 'In stock') : p.oversell ? 'Pre-order' : 'Out of stock'}</small>
          {!out ? <StockBar stock={p.stock} /> : null}
          {hasOptions ? (
            <a className="sf-btn" href={p.href}>Choose options<Icon name="arrow-right" width="16" height="16" aria-hidden="true" /></a>
          ) : (
            <div className="sfqv-buy">
              <span className="sf-qty"><button type="button" aria-label="One less" disabled={qty <= 1} onClick={() => setQty((n) => Math.max(1, n - 1))}><Icon name="minus" width="16" height="16" /></button><span aria-live="polite">{qty}</span><button type="button" aria-label="One more" onClick={() => setQty((n) => Math.min(20, n + 1))}><Icon name="plus" width="16" height="16" /></button></span>
              <button type="button" className="sf-btn" disabled={out} onClick={() => { if (addAndShow(p, v, '', qty)) setP(null); }}><Icon name="shopping-cart" width="16" height="16" aria-hidden="true" />Add to cart</button>
              <button type="button" className="sf-btn sf-btn--line" disabled={out} onClick={() => buyNow(p, v, '', qty)}>Buy now</button>
            </div>
          )}
          <div className="sfqv-more">
            <button type="button" aria-pressed={wished} onClick={() => wishToggle(p)}><Icon name="heart" width="16" height="16" aria-hidden="true" className={wished ? 'is-on' : ''} />{wished ? 'Saved' : 'Save'}</button>
            <button type="button" onClick={() => compareToggle(p)}><Icon name="git-compare-arrows" width="16" height="16" aria-hidden="true" />Compare</button>
            <a href={p.href}>See all details<Icon name="arrow-up-right" width="14" height="14" aria-hidden="true" /></a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- age check ------------------------------------------------------------------------------------------------------------
const AGE_KEY = 'gc.store.ageOk';
export function AgeCheck({ v, editing }) {
  const [show, setShow] = useState(false);
  const [no, setNo] = useState(false);
  useEffect(() => {
    if (!v.ageCheck || editing) { setShow(false); return; }
    let ok = false;
    try { ok = window.localStorage.getItem(AGE_KEY) === '1'; } catch { ok = false; }
    setShow(!ok);
  }, [v.ageCheck, editing]);
  if (!show) return null;
  const yes = () => { try { window.localStorage.setItem(AGE_KEY, '1'); } catch { /* ignore */ } setShow(false); };
  return (
    <div className="sfq-wrap sfage" role="dialog" aria-modal="true" aria-labelledby="sfage-t">
      <div className="sfq-scrim" aria-hidden="true" />
      <div className="sfage-box">
        <Icon name="shield-check" width="32" height="32" aria-hidden="true" />
        <h2 id="sfage-t">{v.ageText || 'Are you 18 or older?'}</h2>
        {no ? <p>Sorry, this website is for adults only.</p> : <p>Some products here are for adults only.</p>}
        <div className="sfage-acts"><button type="button" className="sf-btn" onClick={yes}>Yes, I am</button><button type="button" className="sf-btn sf-btn--line" onClick={() => setNo(true)}>No</button></div>
      </div>
    </div>
  );
}

export const EXTRAS_CSS = `
.sfq-wrap{position:fixed;inset:0;z-index:95;display:grid;place-items:center;padding:16px}
.sfq-scrim{position:absolute;inset:0;border:0;background:rgba(15,23,42,.55);cursor:pointer}
.sfqv{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:28px;width:min(940px,100%);max-height:calc(100vh - 32px);overflow:auto;padding:28px;border-radius:var(--sf-radius-card);background:var(--sf-surface);color:var(--sf-text);box-shadow:0 30px 70px -20px rgba(0,0,0,.45);animation:sfqv-in .22s cubic-bezier(.2,.8,.2,1)}
@keyframes sfqv-in{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}
.sfqv-x{position:absolute;top:10px;right:10px;z-index:1;display:grid;place-items:center;width:44px;height:44px;border:0;border-radius:50%;background:var(--sf-soft);color:var(--sf-text);cursor:pointer}
.sfqv-pics{display:flex;flex-direction:column;gap:10px;min-width:0}
.sfqv-pic{display:grid;grid-template:minmax(0,1fr)/minmax(0,1fr);place-items:center;aspect-ratio:1/1;border-radius:var(--sf-radius-card);overflow:hidden;font-size:var(--sf-fs-h1)}
.sfqv-pic img{width:100%;height:100%;object-fit:contain}
.sfqv-thumbs{display:flex;gap:8px}
.sfqv-thumbs button{width:64px;height:64px;padding:4px;border:1.5px solid var(--sf-line);border-radius:var(--sf-radius);background:var(--sf-surface);cursor:pointer}
.sfqv-thumbs button[aria-pressed="true"]{border-color:var(--sf-primary)}
.sfqv-thumbs img{width:100%;height:100%;object-fit:contain}
.sfqv-info{display:flex;flex-direction:column;align-items:flex-start;gap:12px;min-width:0;padding-top:8px}
.sfqv-brand{color:var(--sf-muted);font-size:var(--sf-fs-sm);text-transform:uppercase;letter-spacing:.06em}
.sfqv-info h2{margin:0!important;padding-right:40px;font-size:var(--sf-fs-h3);line-height:1.25}
.sfqv-keys{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;width:100%;margin:0;padding:0;list-style:none}
.sfqv-keys li{display:flex;flex-direction:column;padding:8px 10px;border-radius:var(--sf-radius);background:var(--sf-soft);font-size:var(--sf-fs-sm)}
.sfqv-keys span{color:var(--sf-muted)}
.sfqv-buy{display:flex;flex-wrap:wrap;gap:8px;width:100%}
.sfqv-buy .sf-qty{min-height:44px}
.sfqv-buy .sf-btn{flex:1 1 140px}
.sfqv-more{display:flex;flex-wrap:wrap;align-items:center;gap:6px 18px;padding-top:8px;border-top:1px solid var(--sf-line);width:100%}
.sfqv-more :is(button,a){display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0;border:0;background:none;color:var(--sf-text);font:inherit;font-size:var(--sf-fs-sm);text-decoration:none;cursor:pointer}
.sfqv-more a{margin-left:auto;color:var(--sf-primary);font-weight:var(--weight-medium)}
.sfqv-more svg.is-on{color:var(--sf-sale);fill:currentColor}
.sfage-box{position:relative;display:flex;flex-direction:column;align-items:center;gap:12px;width:min(420px,100%);padding:32px 28px;border-radius:var(--sf-radius-card);background:var(--sf-surface);color:var(--sf-text);text-align:center}
.sfage-box svg{color:var(--sf-primary)}
.sfage-box h2{margin:0!important;font-size:var(--sf-fs-h3)}
.sfage-box p{margin:0;color:var(--sf-muted)}
.sfage-acts{display:flex;gap:10px;width:100%;margin-top:6px}
.sfage-acts .sf-btn{flex:1}
@media (max-width:720px){
  .sfq-wrap{align-items:end;padding:0}
  .sfqv{grid-template-columns:minmax(0,1fr);gap:16px;max-height:92vh;padding:20px 16px;border-radius:var(--sf-radius-card) var(--sf-radius-card) 0 0;animation-name:sfqv-up}
  .sfqv-pic{aspect-ratio:4/3}
}
@keyframes sfqv-up{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}
@media (prefers-reduced-motion:reduce){.sfqv{animation:none}}
`;
