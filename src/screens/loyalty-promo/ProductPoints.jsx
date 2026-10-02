'use client';
// ProductPoints — points per product. Every product gives normal points by default; give double
// points to push a product, or turn points off for low-profit items. Each change is saved at once
// (src/lib/loyalty.js product points); "Set all" changes every product shown (tab, category and search).
// The products are the stock catalogue (demo products + products saved in Products).
// Front end only.

import React, { useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { EmptyState } from '@/components/ui';
import { IndexTabs, SearchField, Menu, LearnMore } from '@/components/ui/IndexKit';
import { getCatalog } from '@/lib/stock';
import { getProductPoints, setProductPoints, pointsForProduct, getLoyaltySettings, PRODUCT_MODES } from '@/lib/loyalty';
import { LoyPage, useLoyalty, money, pts, plural } from './loyShared';

const MODE_WORD = { normal: 'normal points', double: 'double points', off: 'no points' };
const TABS = [['all', 'All'], ['normal', 'Normal points'], ['double', 'Double points'], ['off', 'No points']];
// phones: the list is a two-line list (ix-plist) and each product keeps its Normal / Double / Off control
const CSS = `
.pp-pitem{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border-bottom:1px solid var(--border-subtle)}
.ix-plist>li:last-child>.pp-pitem{border-bottom:0}
.pp-mode{gap:2px}
.pp-mode .gc-seg__btn{height:28px;padding:0 10px}
.pp-name{display:block;max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
`;

export default function ProductPoints() {
  const tick = useLoyalty();
  const [tab, setTab] = useState('all');
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');
  const [find, setFind] = useState(false);

  const data = useMemo(() => {
    if (!tick) return null;
    const products = getCatalog();
    return { products, modes: getProductPoints(), s: getLoyaltySettings(), cats: [...new Set(products.map((p) => p.cat).filter(Boolean))] };
  }, [tick]);

  const modeOf = (p) => (data.modes[p.sku] || 'normal');
  const needle = q.trim().toLowerCase();
  const shown = data ? data.products.filter((p) => (cat === 'all' || p.cat === cat) && (tab === 'all' || modeOf(p) === tab) && (!needle || [p.name, p.variant, p.sku, p.barcode].join(' ').toLowerCase().includes(needle))) : [];
  const count = (k) => (data ? data.products.filter((p) => (cat === 'all' || p.cat === cat) && (k === 'all' || modeOf(p) === k)).length : 0);

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
  const searching = find || !!q || cat !== 'all';
  const closeFind = () => { setFind(false); setQ(''); setCat('all'); };
  const seg = (p) => {
    const m = modeOf(p);
    return (
      <div className="gc-seg pp-mode" role="group" aria-label={`Points for ${p.name}`}>
        {PRODUCT_MODES.map(([k, label]) => <button key={k} type="button" className={'gc-seg__btn' + (m === k ? ' gc-seg__btn--active' : '')} aria-pressed={m === k} onClick={() => setOne(p, k)}>{label}</button>)}
      </div>
    );
  };
  const gets = (p) => {
    const n = pointsForProduct(p.sku, p.price, null, data.s, data.modes);
    return modeOf(p) === 'off' ? 'No points' : `${pts(n)} ${Math.round(n) === 1 ? 'point' : 'points'}`;
  };

  return (
    <LoyPage screen="ProductPoints" active="loy-products" title="Product points" icon="star" css={CSS}
      about="Every product gives points by default. Give double points to push a product, or turn points off for low-profit items. “Customer gets” is for a Member; higher levels multiply it. The POS register and the sale’s discounts use the same settings."
      secondary={[{ label: 'Point rules', href: '/loyalty' }]}>
      <section className="ix-card" aria-label="Products">
        <div className="ix-bar">
          {searching ? (<>
            <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Scan or search a product" onDone={closeFind} autoFocus />
            <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
          </>) : (<>
            <IndexTabs tabs={TABS.map(([k, label]) => ({ key: k, id: 'pp-tab-' + k, label, count: data ? count(k) : null, on: tab === k, onClick: () => setTab(k) }))} label="Points" />
            <span className="ix-tools">
              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
              <Menu label="Set all" cls="ix-btn ix-btn--sm" items={PRODUCT_MODES.map(([k, label]) => ({ label, onClick: () => setAll(k), disabled: !shown.length }))} />
            </span>
          </>)}
        </div>
        {searching ? (
          <div className="ix-filters" role="group" aria-label="Filters">
            <select aria-label="Category" className={'ix-filter' + (cat !== 'all' ? ' is-set' : '')} value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="all">Category</option>
              {(data ? data.cats : []).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <Menu label="Set all" cls="ix-btn ix-btn--sm" align="start" items={PRODUCT_MODES.map(([k, label]) => ({ label, onClick: () => setAll(k), disabled: !shown.length }))} />
            {cat !== 'all' || q ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setQ(''); setCat('all'); }}>Clear all</button> : null}
          </div>
        ) : null}
        {!data ? <div className="ix-empty"><EmptyState icon="loader" title="Reading products" /></div> : shown.length === 0 ? <div className="ix-empty"><EmptyState icon="search-x" title="No products found" body="Try another name, SKU or barcode." /></div> : (<>
          <ul className="ix-plist" aria-label="Products">
            {shown.map((p) => (
              <li key={p.sku} className="pp-pitem">
                <span className="ix-pitem__top"><b>{p.name}</b><span>{money(p.price)}</span></span>
                <span className="ix-pitem__mid">{gets(p)}</span>
                {seg(p)}
              </li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table ix-table--static gc-table--keep">
              <caption className="sr-only">Products, {shown.length} shown</caption>
              <thead><tr><th scope="col">Product</th><th scope="col">Category</th><th scope="col" className="ix-num">Price</th><th scope="col">Points</th><th scope="col" className="ix-num">Customer gets</th></tr></thead>
              <tbody>
                {shown.map((p) => {
                  const n = pointsForProduct(p.sku, p.price, null, data.s, data.modes);
                  return (
                    <tr key={p.sku}>
                      <td><span className="pp-name" title={[p.name, p.variant].filter(Boolean).join(' · ')}><span className="ix-strong">{p.name}</span>{p.variant ? <span className="ix-muted"> · {p.variant}</span> : null}</span></td>
                      <td className="ix-muted">{p.cat || '—'}</td>
                      <td className="ix-num">{money(p.price)}</td>
                      <td>{seg(p)}</td>
                      <td className="ix-num">{modeOf(p) === 'off' ? <span className="ix-muted">No points</span> : <span title={`for 1 piece · ${money(n * data.s.pointValue)}`}>{gets(p)}</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>)}
        <div className="ix-foot"><span>{data ? plural(shown.length, 'product') : ''}</span></div>
      </section>
      <LearnMore topic="product points" />
    </LoyPage>
  );
}
