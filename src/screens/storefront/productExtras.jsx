'use client';
// Product page extras (Customize › Product page; WoodMart's shop features, built on the shop's own data):
//   SaleTimer       a countdown when the product is in a live flash sale (Marketing › Flash sales), else nothing
//   SoldLine        how many have been sold (the sales book), shown from 3 up
//   BoughtTogether  products that were in the same orders as this one (orders.js); without enough orders, it shows
//                   best sellers from another category under "Goes well with" (never claimed as bought together)
// All read after mount.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { flashSales, storeProducts } from '@/lib/storefront/catalog';
import { clockNow } from '@/lib/settlements';
import { getOrders } from '@/lib/orders';
import { toast } from '@/runtime/ui';
import { addToCart, skuForProduct, openSideCart } from '@/lib/storefront/cart';
import { bdt } from './storeKit';
import { w } from '@/lib/storefront/words';

const pad = (n) => String(Math.max(0, n)).padStart(2, '0');

export function SaleTimer({ name }) {
  const [sale, setSale] = useState(null);
  const [now, setNow] = useState(0);
  useEffect(() => {
    let s = null;
    try { s = flashSales().find((o) => o.state === 'live' && o.end && (o.items || []).some((i) => i.name === name)) || null; } catch { s = null; }
    setSale(s); setNow(clockNow());
    if (!s) return undefined;
    const t = setInterval(() => setNow(clockNow()), 1000);
    return () => clearInterval(t);
  }, [name]);
  if (!sale || !now) return null;
  const left = Math.max(0, Math.floor((sale.end - now) / 1000));
  if (!left) return null;
  const parts = [[Math.floor(left / 86400), 'days'], [Math.floor((left % 86400) / 3600), 'hrs'], [Math.floor((left % 3600) / 60), 'min'], [left % 60, 'sec']];
  return (
    <div className="spx-timer" role="timer" aria-label={`${sale.title} ends in ${parts.map(([n, l]) => n + ' ' + l).join(' ')}`}>
      <span className="spx-timer__t"><Icon name="flame" width="16" height="16" aria-hidden="true" />{sale.title}: ends in</span>
      <span className="spx-timer__n" aria-hidden="true">{parts.map(([n, l]) => <span key={l}><b>{pad(n)}</b><small>{l}</small></span>)}</span>
    </div>
  );
}

export function SoldLine({ sold }) {
  if (!(sold >= 3)) return null;
  return <span className="spx-sold"><Icon name="trending-up" width="16" height="16" aria-hidden="true" /><span data-w="soldSoFar">{w('soldSoFar', { n: sold.toLocaleString('en-US') })}</span></span>;
}

export function BoughtTogether({ p, v }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let all = [];
    try { all = storeProducts(); } catch { all = []; }
    const me = all.find((x) => x.id === p.id);
    if (!me) { setData(null); return; }
    const count = {};
    try {
      getOrders().forEach((o) => {
        const names = (o.lines || []).map((l) => l.name);
        if (!names.includes(me.name)) return;
        names.forEach((n) => { if (n !== me.name) count[n] = (count[n] || 0) + 1; });
      });
    } catch { /* ignore */ }
    let pairs = Object.entries(count).sort((a, b) => b[1] - a[1]).map(([n]) => all.find((x) => x.name === n)).filter((x) => x && (x.stock > 0 || x.oversell)).slice(0, 2);
    let real = pairs.length > 0;
    if (!real) {
      const top = String(me.cat || '').split(' › ')[0];
      pairs = all.filter((x) => x.id !== me.id && String(x.cat || '').split(' › ')[0] !== top && (x.stock > 0 || x.oversell) && x.img).sort((a, b) => b.sold - a.sold).slice(0, 2);
    }
    setData(pairs.length ? { me, pairs, real } : null);
  }, [p.id]);
  const [on, setOn] = useState({});
  const list = useMemo(() => (data ? [data.me, ...data.pairs] : []), [data]);
  if (!data) return null;
  const chosen = list.filter((x, i) => i === 0 || on[x.id] !== false);
  const total = chosen.reduce((a, x) => a + x.price, 0);
  const addAll = () => {
    let ok = 0;
    chosen.forEach((x) => { const sku = skuForProduct(x.id, ''); if (sku) { addToCart(sku, 1); ok += 1; } });
    if (!ok) { toast('These can’t be added right now.', { tone: 'error' }); return; }
    if (v.cartType === 'page') toast(`${ok} product${ok === 1 ? '' : 's'} added to the cart.`); else openSideCart();
  };
  return (
    <section className="spx-fbt" aria-labelledby="spx-fbt-h">
      <h2 id="spx-fbt-h" data-w={data.real ? 'fbtTitle' : 'goesWell'}>{w(data.real ? 'fbtTitle' : 'goesWell')}</h2>
      <div className="spx-fbt__row">
        {list.map((x, i) => (
          <React.Fragment key={x.id}>
            {i ? <span className="spx-plus" aria-hidden="true"><Icon name="plus" width="18" height="18" /></span> : null}
            <label className={'spx-item' + (i && on[x.id] === false ? ' is-off' : '')}>
              <span className="spx-item__pic" style={{ background: x.tbg }}>{x.img ? <img src={x.img} alt="" loading="lazy" /> : <span aria-hidden="true">{x.name.slice(0, 1)}</span>}</span>
              <span className="spx-item__t">
                <span className="spx-item__c">{i ? <input type="checkbox" checked={on[x.id] !== false} onChange={(e) => setOn((m) => ({ ...m, [x.id]: e.target.checked }))} /> : <input type="checkbox" checked disabled aria-label="This product" />}<b>{i ? x.name : 'This product'}</b></span>
                <small>{bdt(x.price)}</small>
              </span>
            </label>
          </React.Fragment>
        ))}
        <div className="spx-fbt__buy">
          <small>Total for {chosen.length}</small>
          <b>{bdt(total)}</b>
          <button type="button" className="sf-btn" onClick={addAll}><Icon name="shopping-cart" width="16" height="16" aria-hidden="true" />Add {chosen.length} to cart</button>
        </div>
      </div>
    </section>
  );
}

export const PRODUCT_EXTRAS_CSS = `
.spx-timer{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 14px;padding:10px 14px;border-radius:var(--sf-radius);background:color-mix(in srgb,var(--sf-sale) 9%,var(--sf-surface));color:var(--sf-text)}
.spx-timer__t{display:inline-flex;align-items:center;gap:6px;font-weight:var(--weight-semibold);color:var(--sf-sale)}
.spx-timer__n{display:flex;gap:6px}
.spx-timer__n>span{display:flex;flex-direction:column;align-items:center;min-width:44px;padding:4px 6px;border-radius:var(--sf-radius);background:var(--sf-surface)}
.spx-timer__n b{font-variant-numeric:tabular-nums;font-size:var(--sf-fs-lg);line-height:1.1}
.spx-timer__n small{color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.spx-sold{display:inline-flex;align-items:center;gap:6px;color:var(--sf-muted);font-size:var(--sf-fs-sm)}
.spx-sold svg{color:var(--sf-sale)}
.spx-sold b{color:var(--sf-text)}
.spx-fbt{display:flex;flex-direction:column;gap:14px;margin-top:var(--sf-gap);padding:clamp(16px,2.4vw,24px);border:1px solid var(--sf-line);border-radius:var(--sf-radius-card);background:var(--sf-surface)}
.spx-fbt h2{margin:0!important;font-size:var(--sf-fs-h3)}
.spx-fbt__row{display:flex;flex-wrap:wrap;align-items:center;gap:12px}
.spx-plus{color:var(--sf-muted)}
.spx-item{display:flex;align-items:center;gap:10px;min-width:0;flex:1 1 200px;max-width:280px;padding:8px;border:1px solid var(--sf-line);border-radius:var(--sf-radius);cursor:pointer}
.spx-item.is-off{opacity:.55}
.spx-item__pic{display:grid;grid-template:minmax(0,1fr)/minmax(0,1fr);place-items:center;flex:none;width:64px;height:64px;border-radius:var(--sf-radius);overflow:hidden}
.spx-item__pic img{width:100%;height:100%;object-fit:contain}
.spx-item__t{display:flex;flex-direction:column;gap:4px;min-width:0}
.spx-item__c{display:flex;align-items:flex-start;gap:8px}
.spx-item__c input{flex:none;width:18px;height:18px;margin:2px 0 0}
.spx-item__c b{display:-webkit-box;overflow:hidden;font-weight:var(--weight-medium);font-size:var(--sf-fs-sm);line-height:1.35;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.spx-item__t small{padding-left:26px;font-weight:var(--weight-semibold)}
.spx-fbt__buy{display:flex;flex-direction:column;align-items:flex-start;gap:4px;margin-left:auto}
.spx-fbt__buy small{color:var(--sf-muted)}
.spx-fbt__buy b{font-size:var(--sf-fs-lg)}
@media (max-width:640px){
  .spx-fbt__row{flex-direction:column;align-items:stretch}
  .spx-plus{align-self:center}
  .spx-item{max-width:none}
  .spx-fbt__buy{margin-left:0;width:100%}
  .spx-fbt__buy .sf-btn{width:100%}
}
`;
