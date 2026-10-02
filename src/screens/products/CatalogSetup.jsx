'use client';
// Generated from design/templates/products/CatalogSetup.dc.html by scripts/convert-design.mjs.
// CatalogSetup — Products — Catalog setup, a Shopify-style settings page (docs/shopify-style.md).
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, list as __list } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { Dialog as __Dialog, InfoTip as __InfoTip } from '@/components/ui';
import { ShopHeader, IndexTabs, LearnMore } from '@/components/ui/IndexKit';
import { toast as __toast } from '@/runtime/ui';

// ---- logic (from the design's <script type="text/x-dc">) ----

function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m) { __toast(m); }
var SECS = [['fields', 'Custom fields', 14], ['attrs', 'Attributes and values', 5], ['brands', 'Brands', 38], ['units', 'Units', 6], ['tax', 'Tax rates', 3], ['size', 'Size charts', 4], ['warranty', 'Warranty policies', 4]];
var CF = [['RAM', 'Dropdown', '4 GB, 6 GB, 8 GB, 12 GB', 'Phones, Laptops', 'Yes', 'Yes', 'No'], ['Network', 'Dropdown', '4G, 5G', 'Phones', 'Yes', 'Yes', 'No'], ['PTA approved', 'Yes / no', '—', 'Phones', 'Yes', 'Yes', 'No'], ['Display size', 'Number · inch', '—', 'Electronics', 'No', 'Yes', 'Yes'], ['Skin type', 'Checkboxes', 'Dry, Oily, Combination, Sensitive, All', 'Skin care', 'Yes', 'Yes', 'Yes'], ['Key ingredients', 'Text', '—', 'Skin care', 'No', 'Yes', 'Yes'], ['Expiry date', 'Date', '—', 'Skin care, Grocery', 'Yes', 'Yes', 'No'], ['Material', 'Text', '—', 'Clothing', 'Yes', 'Yes', 'Yes'], ['Country of origin', 'Dropdown', 'Bangladesh, China, South Korea, Vietnam…', 'All categories', 'No', 'Yes', 'Yes']];
var ATTR = [['Colour', [['Black', '#111827'], ['White', '#ffffff'], ['Navy', '#1e3a8a'], ['Red', '#dc2626'], ['Silver', '#cbd5e1']], 'used by 186 products'], ['Size', [['S'], ['M'], ['L'], ['XL'], ['XXL']], 'used by 118 products'], ['Storage', [['128 GB'], ['256 GB'], ['512 GB']], 'used by 24 products'], ['Volume', [['50 ml'], ['100 ml'], ['150 ml'], ['300 ml']], 'used by 42 products'], ['Shoe size', [['39'], ['40'], ['41'], ['42'], ['43']], 'used by 30 products']];
var CH = { shirt: ['Men’s shirts and polos', 'Clothing › Men', ['Size', 'Chest', 'Length', 'Shoulder', 'Sleeve'], [['S', 38, 27, 17, 8], ['M', 40, 28, 18, 8.5], ['L', 42, 29, 19, 9], ['XL', 44, 30, 20, 9.5]]], kurti: ['Women’s kurti', 'Clothing › Women', ['Size', 'Bust', 'Length', 'Waist', 'Hip'], [['S', 34, 42, 30, 38], ['M', 36, 43, 32, 40], ['L', 38, 44, 34, 42], ['XL', 40, 45, 36, 44]]], jeans: ['Jeans', 'Clothing › Men › Jeans', ['Size', 'Waist', 'Hip', 'Length', 'Thigh'], [['30', 30, 38, 40, 22], ['32', 32, 40, 41, 23], ['34', 34, 42, 41, 24], ['36', 36, 44, 42, 25]]], shoe: ['Shoes (BD / EU / UK)', 'Shoes', ['BD', 'EU', 'UK', 'Foot length', 'Width'], [['39', 39, 6, 24.5, 'Regular'], ['40', 40, 6.5, 25.1, 'Regular'], ['41', 41, 7.5, 25.8, 'Regular'], ['42', 42, 8, 26.4, 'Wide']]] };
class Component extends DCLogic {
  renderVals() {
    var self = this, s = this.state || {}, sec = s.sec || 'fields', ch = s.ch || 'shirt', unit = s.unit || 'in';
    var C = CH[ch];
    var conv = function (x) { return typeof x === 'number' && unit === 'cm' && ch !== 'shoe' ? (x * 2.54).toFixed(1) : x; };
    var v = {
      secs: SECS.map(function (x) { var on = x[0] === sec; return { l: x[1], c: x[2], on: on, pick: function () { self.setState({ sec: x[0] }); } }; }),
      cf: CF.map(function (r) { return { l: r[0], t: r[1], o: r[2], c: r[3], req: r[4], show: r[5], ai: r[6] }; }),
      cfOpen: !!s.cfOpen, openCf: function () { self.setState({ cfOpen: true }); }, closeCf: function () { self.setState({ cfOpen: false }); }, saveCf: function () { self.setState({ cfOpen: false }); toast(self, 'Field added. Every Electronics product now asks for it.'); },
      attrs: ATTR.map(function (a) { return { l: a[0], used: a[2], v: a[1].map(function (x) { return { t: x[0], c: x[1] || '', sw: !!x[1] }; }) }; }),
      brands: [['Samsung', 18, '#1428a0'], ['Beauty of Joseon', 22, '#a16207'], ['GridShop', 96, '#003087'], ['Xiaomi', 9, '#ea580c'], ['ASUS', 7, '#0f172a'], ['Nature Republic', 14, '#047857'], ['Chashi', 11, '#65a30d'], ['SoundMax', 6, '#6d28d9']].map(function (b) { return { l: b[0], n: b[1], bg: b[2], i: b[0].charAt(0) }; }),
      units: [['Piece', 'pc', 'No', 312], ['Kilogram', 'kg', 'Yes', 48], ['Gram', 'g', 'Yes', 16], ['Litre', 'L', 'Yes', 21], ['Pack', 'pack', 'No', 12], ['Dozen', 'dz', 'No', 3]].map(function (u) { return { l: u[0], s: u[1], d: u[2], n: u[3] }; }),
      taxes: [['Standard VAT', '15%', 'Yes', 'Skin care, Clothing, Electronics', 298], ['Reduced VAT', '7.5%', 'Yes', '—', 25], ['No VAT', '0%', '—', 'Grocery', 89]].map(function (t) { return { l: t[0], r: t[1], inc: t[2], c: t[3], n: t[4] }; }),
      charts: Object.keys(CH).map(function (k) { var on = k === ch; return { l: CH[k][0], u: CH[k][1], on: on, pick: function () { self.setState({ ch: k }); } }; }),
      units2: [['in', 'Inches'], ['cm', 'Centimetres']].map(function (m) { var on = m[0] === unit; return { l: m[1], on: on, pick: function () { self.setState({ unit: m[0] }); } }; }),
      chHead: C[2].map(function (t, i) { return { t: i && ch !== 'shoe' ? t + ' (' + unit + ')' : t }; }), chRows: C[3].map(function (r) { return { c: r.map(function (x) { return { t: conv(x) }; }) }; }), chUsed: C[1] + ' · 24 products',
      wps: [['1 year official brand warranty', '1 year', 'Brand', 'Brand service centre', 31], ['6 months shop service warranty', '6 months', 'Shop service', 'Your shop', 12], ['7-day replacement only', '7 days', 'Replacement', 'Your shop', 64], ['2 years parts, 1 year service', '2 years', 'Parts + service', 'Brand centre', 7]].map(function (w) { return { l: w[0], p: w[1], t: w[2], c: w[3], n: w[4] }; }),
      addItem: function () { toast(self, 'A new row is ready to fill in.'); }
    };
    SECS.forEach(function (x) { v['is_' + x[0]] = x[0] === sec; });
    return v;
  }
}
// ---- styles ----

const CSS = `
.cs-wrap{overflow-x:auto}
.cs-tools{gap:var(--space-2)}
.cs-pill{display:inline-flex;align-items:center;height:20px;padding:0 8px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-body);white-space:nowrap}
.cs-mono{font-family:var(--font-data)}
.cs-rows{display:flex;flex-direction:column}
.cs-attr{display:flex;align-items:center;gap:var(--space-3);min-height:44px;padding:8px 12px;border-top:1px solid var(--border-subtle)}
.cs-attr:first-child{border-top:0}
.cs-attr>b{width:110px;flex:none;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.cs-attr>div{display:flex;flex:1;flex-wrap:wrap;align-items:center;gap:6px;min-width:0}
.cs-attr>small{flex:none;font-size:var(--text-xs);color:var(--text-muted)}
.cs-val{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 8px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs-plus)}
.cs-sw{width:12px;height:12px;border:1px solid var(--border-strong);border-radius:var(--radius-full)}
.cs-brand{display:flex;align-items:center;gap:10px}
.cs-brand>span:first-child{display:grid;flex:none;place-items:center;width:28px;height:28px;border-radius:var(--radius-md);color:#fff;font-size:var(--text-xs);font-weight:var(--weight-semibold)}
.cs-size{display:grid;grid-template-columns:220px minmax(0,1fr);gap:var(--space-4);padding:var(--space-4)}
.cs-charts{display:flex;flex-direction:column;gap:6px}
.cs-charts>button{display:flex;flex-direction:column;gap:2px;padding:8px 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;text-align:left;cursor:pointer}
.cs-charts>button[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft)}
.cs-charts b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.cs-charts small{font-size:var(--text-xs);color:var(--text-muted)}
.cs-grid{display:flex;flex-direction:column;gap:var(--space-3);min-width:0}
.cs-gridbar{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.cs-gridbar>.gc-label{margin:0}
.cs-sizegrid{border-collapse:collapse}
.cs-sizegrid th{padding:0 4px 6px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:left;white-space:nowrap}
.cs-sizegrid td{padding:2px 4px}
.cs-sizegrid .gc-input{width:72px;height:28px;padding:0 8px;font-variant-numeric:tabular-nums}
.cs-note{margin:0;font-size:var(--text-xs-plus);color:var(--text-muted)}
.cs-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.cs-field .gc-label{margin:0}
.cs-checks{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-5);font-size:var(--text-sm)}
.cs-checks label{display:flex;align-items:center;gap:var(--space-2);cursor:pointer}
@media (max-width:640px){
  .cs-size{grid-template-columns:minmax(0,1fr);padding:var(--space-3)}
  .cs-charts{flex-direction:row;overflow-x:auto;scrollbar-width:none}
  .cs-charts>button{flex:none}
  .cs-attr{flex-wrap:wrap}
  .cs-attr>div{order:3;flex:1 1 100%}
}
`;

// ---- markup ----

// Shopify-style settings page (components/ui/IndexKit.jsx): one card whose tabs are the catalog's lists — custom
// fields, attributes, brands, units, tax rates, size charts, warranty policies — with the list's Add button beside
// them. A new custom field is made in a dialog.
const SEC = [['fields', 'Add field'], ['attrs', 'Add attribute'], ['brands', 'Add brand'], ['units', 'Add unit'], ['tax', 'Add tax rate'], ['size', 'New size chart']];
const NOTE = { attrs: 'Used to make variants — pick them when you add colours or sizes to a product.', brands: 'Shown on product pages and used in filters.', units: 'How a product is counted and sold.', tax: 'VAT added to prices. Each category has a default; a product can change it.', size: 'Show customers the right size. Fewer returns.', warranty: 'Made in Settings. Pick one on any product.' };

export default class CatalogSetupScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    const keys = ['fields', 'attrs', 'brands', 'units', 'tax', 'size', 'warranty'];
    const cur = keys.find((k) => v['is_' + k]) || 'fields';
    const add = SEC.find((x) => x[0] === cur);
    const tabs = __list(v.secs).map((n, i) => ({ key: keys[i], id: 'cs-tab-' + keys[i], label: n.l, count: n.c, on: n.on, onClick: n.pick }));
    return (
      <div className="dc-screen ds" data-screen="CatalogSetup">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="products-setup" />
          <main className="gc-shell__main">
            <__Topbar crumb="Products" page="Catalog setup" placeholder="Search products, SKU or barcode" />
            <div className="gc-shell__content">
              <div className="ix-page ix-page--narrow">
                <ShopHeader icon="settings-2" title="Catalog setup"
                  about="Custom fields, attributes, brands, units, tax rates, size charts and warranty policies that every product uses."
                  more={[{ label: 'Categories', href: '/categories' }, { label: 'Warranty policies', href: '/warranty-policies' }, { label: 'All products', href: '/all-products' }]} />

                <section className="ix-card cs-card" aria-label="Catalog setup">
                  <div className="ix-bar">
                    <IndexTabs tabs={tabs} label="Catalog setup" />
                    <span className="ix-tools cs-tools">
                      {NOTE[cur] ? <__InfoTip text={NOTE[cur]} /> : null}
                      {add ? (
                        <button type="button" className="ix-btn ix-btn--sm" onClick={cur === 'fields' ? v.openCf : v.addItem} aria-haspopup={cur === 'fields' ? 'dialog' : undefined}><__Icon name="plus" width="16" height="16" aria-hidden="true" />{add[1]}</button>
                      ) : (
                        <__Link href="/warranty-policies" className="ix-btn ix-btn--sm">Manage policies</__Link>
                      )}
                    </span>
                  </div>

                  {v.is_fields ? (
                    <div className="ix-table-wrap ix-table-wrap--show" role="tabpanel" aria-labelledby="cs-tab-fields">
                      <table className="ix-table ix-table--static">
                        <thead>
                          <tr><th scope="col">Field</th><th scope="col">Type</th><th scope="col">Choices</th><th scope="col">Categories</th><th scope="col">Required</th><th scope="col">Shown to customers</th><th scope="col">AI can fill</th></tr>
                        </thead>
                        <tbody>
                          {__list(v.cf).map((r, i) => (
                            <tr key={i}>
                              <td className="ix-strong">{r.l}</td>
                              <td><span className="cs-pill">{r.t}</span></td>
                              <td className="ix-muted" style={{ maxWidth: "220px" }}>{r.o}</td>
                              <td>{r.c}</td>
                              <td>{r.req}</td>
                              <td>{r.show}</td>
                              <td>{r.ai}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}

                  {v.is_attrs ? (
                    <div className="cs-rows" role="tabpanel" aria-labelledby="cs-tab-attrs">
                      {__list(v.attrs).map((a, i) => (
                        <div key={i} className="cs-attr">
                          <b>{a.l}</b>
                          <div>
                            {__list(a.v).map((x, j) => (
                              <span key={j} className="cs-val">{x.sw ? <span className="cs-sw" style={{ background: x.c }} /> : null}{x.t}</span>
                            ))}
                            <button type="button" className="ix-btn ix-btn--sm ix-btn--plain">+ value</button>
                          </div>
                          <small>{a.used}</small>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {v.is_brands ? (
                    <div className="ix-table-wrap ix-table-wrap--show" role="tabpanel" aria-labelledby="cs-tab-brands">
                      <table className="ix-table ix-table--static">
                        <thead><tr><th scope="col">Brand</th><th scope="col" className="ix-num">Products</th></tr></thead>
                        <tbody>
                          {__list(v.brands).map((b, i) => (
                            <tr key={i}>
                              <td><span className="cs-brand"><span style={{ background: b.bg }} aria-hidden="true">{b.i}</span><span className="ix-strong">{b.l}</span></span></td>
                              <td className="ix-num">{b.n}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}

                  {v.is_units ? (
                    <div className="ix-table-wrap ix-table-wrap--show" role="tabpanel" aria-labelledby="cs-tab-units">
                      <table className="ix-table ix-table--static">
                        <thead><tr><th scope="col">Unit</th><th scope="col">Short</th><th scope="col">Half units allowed</th><th scope="col" className="ix-num">Products</th></tr></thead>
                        <tbody>
                          {__list(v.units).map((u, i) => (
                            <tr key={i}><td className="ix-strong">{u.l}</td><td className="cs-mono">{u.s}</td><td>{u.d}</td><td className="ix-num">{u.n}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}

                  {v.is_tax ? (
                    <div className="ix-table-wrap ix-table-wrap--show" role="tabpanel" aria-labelledby="cs-tab-tax">
                      <table className="ix-table ix-table--static">
                        <thead><tr><th scope="col">Name</th><th scope="col" className="ix-num">Rate</th><th scope="col">Price includes VAT?</th><th scope="col">Default for</th><th scope="col" className="ix-num">Products</th></tr></thead>
                        <tbody>
                          {__list(v.taxes).map((t, i) => (
                            <tr key={i}><td className="ix-strong">{t.l}</td><td className="ix-num ix-strong">{t.r}</td><td>{t.inc}</td><td className="ix-muted">{t.c}</td><td className="ix-num">{t.n}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}

                  {v.is_size ? (
                    <div className="cs-size" role="tabpanel" aria-labelledby="cs-tab-size">
                      <div className="cs-charts">
                        {__list(v.charts).map((c, i) => (
                          <button key={i} type="button" onClick={c.pick} aria-pressed={!!c.on}><b>{c.l}</b><small>{c.u}</small></button>
                        ))}
                      </div>
                      <div className="cs-grid">
                        <div className="cs-gridbar">
                          <span className="gc-label">Measure in</span>
                          <div className="gc-seg" role="group" aria-label="Measure in">
                            {__list(v.units2).map((m, i) => (
                              <button key={i} type="button" className={'gc-seg__btn' + (m.on ? ' gc-seg__btn--active' : '')} aria-pressed={!!m.on} onClick={m.pick}>{m.l}</button>
                            ))}
                          </div>
                          <span style={{ flex: 1 }} />
                          <button type="button" className="ix-btn ix-btn--sm">+ Row</button>
                          <button type="button" className="ix-btn ix-btn--sm">+ Column</button>
                        </div>
                        <div className="cs-wrap">
                          <table className="cs-sizegrid gc-table--keep">
                            <thead><tr>{__list(v.chHead).map((h, i) => <th key={i} scope="col">{h.t}</th>)}</tr></thead>
                            <tbody>
                              {__list(v.chRows).map((cr, i) => (
                                <tr key={i}>{__list(cr.c).map((cx, j) => <td key={j}><input className="gc-input" defaultValue={cx.t} aria-label="Size value" /></td>)}</tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="cs-note">Used by <b>{v.chUsed}</b></p>
                      </div>
                    </div>
                  ) : null}

                  {v.is_warranty ? (
                    <div className="ix-table-wrap ix-table-wrap--show" role="tabpanel" aria-labelledby="cs-tab-warranty">
                      <table className="ix-table ix-table--static">
                        <thead><tr><th scope="col">Policy</th><th scope="col">Period</th><th scope="col">Type</th><th scope="col">Claim at</th><th scope="col" className="ix-num">Products</th></tr></thead>
                        <tbody>
                          {__list(v.wps).map((w, i) => (
                            <tr key={i}><td className="ix-strong">{w.l}</td><td>{w.p}</td><td>{w.t}</td><td className="ix-muted">{w.c}</td><td className="ix-num">{w.n}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </section>
                <LearnMore topic="catalog setup" />
              </div>
            </div>
          </main>
        </div>

        <__Dialog open={!!v.cfOpen} title="New custom field" onClose={v.closeCf} width={560} footer={<>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={v.closeCf}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={v.saveCf}>Add field</button>
        </>}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <label className="cs-field">
              <span className="gc-label">Field name</span>
              <input className="gc-input" defaultValue="Warranty card included" aria-label="Field name" data-autofocus="" />
            </label>
            <label className="cs-field">
              <span className="gc-label">Type</span>
              <select className="gc-input gc-select" aria-label="Field type">
                <option>Yes / no</option>
                <option>Text</option>
                <option>Number with unit</option>
                <option>Date</option>
                <option>Dropdown (one choice)</option>
                <option>Checkboxes (many)</option>
                <option>Colour</option>
                <option>File or PDF</option>
              </select>
            </label>
            <label className="cs-field">
              <span className="gc-label">Categories</span>
              <select className="gc-input gc-select" aria-label="Categories">
                <option>Electronics (and all inside)</option>
                <option>All categories</option>
              </select>
            </label>
            <div className="cs-checks">
              <label><input type="checkbox" className="gc-check" />Required</label>
              <label><input type="checkbox" className="gc-check" defaultChecked={true} />Show on product page</label>
              <label><input type="checkbox" className="gc-check" defaultChecked={true} />Use in shop filters</label>
              <label><input type="checkbox" className="gc-check" />AI can fill it</label>
            </div>
          </div>
        </__Dialog>
      </div>
    );
  }
}
