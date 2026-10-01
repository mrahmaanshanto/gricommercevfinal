'use client';
// ProductPoints — points per product. Every product gives normal points by default; give double
// points to push a product, or turn points off for low-profit items. Each change is saved at once
// (src/lib/loyalty.js product points); "Set all" changes every product in the category shown.
// The products are the stock catalogue (demo products + products saved in Products).
// Front end only.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { EmptyState } from '@/components/ui';
import { getCatalog } from '@/lib/stock';
import { getProductPoints, setProductPoints, pointsForProduct, getLoyaltySettings, PRODUCT_MODES } from '@/lib/loyalty';
import { LoyPage, Kpi, useLoyalty, money, pts, plural } from './loyShared';

const MODE_WORD = { normal: 'normal points', double: 'double points', off: 'no points' };
// phones: the Points cell's label sits level with its Normal / Double / Off control
const CSS = `
@media (max-width:640px){
.gc-cards-on>*>tr>td.pp-mode{display:flex!important;align-items:center;justify-content:space-between;gap:var(--space-3)}
.gc-cards-on>*>tr>td.pp-mode::before{float:none;margin-right:0}
}
`;

export default function ProductPoints() {
  const tick = useLoyalty();
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');

  const data = useMemo(() => {
    if (!tick) return null;
    const products = getCatalog();
    return { products, modes: getProductPoints(), s: getLoyaltySettings(), cats: [...new Set(products.map((p) => p.cat).filter(Boolean))] };
  }, [tick]);

  const modeOf = (p) => (data.modes[p.sku] || 'normal');
  const needle = q.trim().toLowerCase();
  const shown = data ? data.products.filter((p) => (cat === 'all' || p.cat === cat) && (!needle || [p.name, p.variant, p.sku, p.barcode].join(' ').toLowerCase().includes(needle))) : [];
  const count = (k) => (data ? data.products.filter((p) => modeOf(p) === k).length : 0);

  const setOne = (p, mode) => {
    if (modeOf(p) === mode) return;
    setProductPoints({ [p.sku]: mode });
    toast(`${p.name} now gives ${MODE_WORD[mode]}`);
  };
  const setAll = (mode) => {
    if (!shown.length) return;
    setProductPoints(Object.fromEntries(shown.map((p) => [p.sku, mode])));
    toast(`${plural(shown.length, 'product')}${cat === 'all' ? '' : ' in ' + cat} now give ${MODE_WORD[mode]}`);
  };

  return (
    <LoyPage screen="ProductPoints" active="loy-products" title="Product points" css={CSS}
      description="Every product gives points by default. Give double points to push a product, or turn points off for low-profit items."
      actions={<Link href="/loyalty" className="gc-btn gc-btn--neutral"><Icon name="sliders-horizontal" width="18" height="18" aria-hidden="true" /> Point rules</Link>}>
      <div className="gc-kpis gc-kpis--tight">
        <Kpi icon="star" label="Give normal points" value={data ? pts(count('normal')) : '—'} sub="products" />
        <Kpi icon="sparkles" tone="info" label="Give double points" value={data ? pts(count('double')) : '—'} sub="products" />
        <Kpi icon="circle-off" tone="warning" label="No points" value={data ? pts(count('off')) : '—'} sub="products" />
      </div>

      <section className="gc-card ly-card" aria-label="Products">
        <div className="ly-tools">
          <input className="gc-input" type="search" placeholder="Scan or search a product" aria-label="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="ly-chips" role="group" aria-label="Category">
            {['all', ...(data ? data.cats : [])].map((c) => <button key={c} type="button" className="ly-chip" aria-pressed={cat === c} onClick={() => setCat(c)}>{c === 'all' ? 'All' : c}</button>)}
          </div>
        </div>
        <div className="ly-tools">
          <span className="ac-sub" style={{ display: 'inline' }}>Set all {data ? plural(shown.length, 'product') : ''}{cat === 'all' ? '' : ' in ' + cat} shown to:</span>
          <div className="ac-row-actions">
            {PRODUCT_MODES.map(([k, label]) => <button key={k} type="button" className="gc-btn gc-btn--sm gc-btn--neutral" disabled={!shown.length} onClick={() => setAll(k)}>{label}</button>)}
          </div>
        </div>
        {!data ? <EmptyState icon="loader" title="Reading products" /> : shown.length === 0 ? <EmptyState icon="search-x" title="No products found" body="Try another name, SKU or barcode." /> : (
          <div className="gc-table-wrap">
            <table className="gc-table gc-table--compact gc-table--hoverable">
              <thead><tr><th scope="col">Product</th><th scope="col">Category</th><th scope="col" className="ac-num">Price</th><th scope="col">Points</th><th scope="col" className="ac-num">Customer gets</th></tr></thead>
              <tbody>
                {shown.map((p) => {
                  const m = modeOf(p);
                  const n = pointsForProduct(p.sku, p.price, null, data.s, data.modes);
                  return (
                    <tr key={p.sku}>
                      <td><span className="ac-strong">{p.name}</span><span className="ac-sub ac-fig">{[p.sku, p.variant].filter(Boolean).join(' · ')}</span></td>
                      <td>{p.cat || '—'}</td>
                      <td className="ac-num ac-fig">{money(p.price)}</td>
                      <td className="pp-mode">
                        <div className="gc-seg" role="group" aria-label={`Points for ${p.name}`}>
                          {PRODUCT_MODES.map(([k, label]) => <button key={k} type="button" className={'gc-seg__btn' + (m === k ? ' gc-seg__btn--active' : '')} aria-pressed={m === k} onClick={() => setOne(p, k)}>{label}</button>)}
                        </div>
                      </td>
                      <td className="ac-num">{m === 'off' ? <span className="ac-sub" style={{ display: 'inline' }}>No points</span> : <><span className="ac-fig ac-strong">{pts(n)} {Math.round(n) === 1 ? 'point' : 'points'}</span><span className="ac-sub">for 1 piece · {money(n * data.s.pointValue)}</span></>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="gc-help" style={{ margin: 0 }}>“Customer gets” is for a Member; higher levels multiply it. The POS register and the sale’s discounts use the same settings.</p>
    </LoyPage>
  );
}
