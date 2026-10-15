'use client';
// CatalogSetup — Products › Catalog setup (/catalog-setup), a Shopify-style settings page (docs/shopify-style.md): the
// product templates card, then one card whose tabs are the lists every product uses — the shop's own product fields,
// brands, units, tax rates, size charts and warranty policies — with the list's Add button beside them. Each list is
// real and shared with the product form (Add product):
//   fields       lib/catalogSetup.js › getProductFields (Add product › Product data › Shop fields)
//   brands       lib/brands.js (edited on Products › Brands)
//   units        lib/units.js › getUnits / addUnit (Add product › Inventory, identifiers & units)
//   tax rates    lib/vat.js › getTaxRates (Add product › Pricing › VAT / tax); category rates stay on Accounts › VAT
//   size charts  lib/catalogSetup.js › getSizeCharts (Add product › Product data › Size guide)
//   warranty     lib/warranty.js (edited on Products › Warranty policies)
// A row opens in a side panel to change or delete it. Attributes such as colour and size are made on each product.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import TemplatesCard from './TemplatesCard';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Sheet, InfoTip, StatusBadge } from '@/components/ui';
import { ShopHeader, IndexTabs, LearnMore } from '@/components/ui/IndexKit';
import { toast, confirmDialog } from '@/runtime/ui';
import { getProductFields, saveProductField, removeProductField, FIELD_TYPES, getSizeCharts, saveSizeChart, removeSizeChart, CATALOG_EVENT } from '@/lib/catalogSetup';
import { getUnits, addUnit, removeUnit, UNITS_EVENT } from '@/lib/units';
import { getTaxRates, saveTaxRate, removeTaxRate, loadVat, vatRateFor, VAT_CATEGORIES, TAX_RATES_EVENT } from '@/lib/vat';
import { getPolicies, periodText, TYPES as WTYPES, productsUsing, POLICIES_EVENT } from '@/lib/warranty';
import { getBrands, productCounts, BRANDS_EVENT } from '@/lib/brands';
import { allProducts } from '@/lib/products';
import { getCategories, CATEGORIES_EVENT } from '@/lib/productCategories';

const SECS = [['fields', 'Product fields', 'Add field'], ['brands', 'Brands', 'Add brand'], ['units', 'Units', 'Add unit'], ['tax', 'Tax rates', 'Add tax rate'], ['size', 'Size charts', 'New size chart'], ['warranty', 'Warranty policies', 'New policy']];
const NOTE = {
  fields: 'Fields every product in a category asks for. Shown on the product page when you choose.',
  brands: 'Shown on product pages and used in filters. Edit them on Brands.',
  units: 'How a product is counted and sold. Built-in units can’t be removed.',
  tax: 'Rates a product can be given. Each category’s own rate is set on Accounts › VAT.',
  size: 'Show customers the right size. Measures are in mm.',
  warranty: 'Written once, picked on any product. Edit them on Warranty policies.',
};
const yes = (b) => (b ? 'Yes' : 'No');

const CSS = `
.cs-pill{display:inline-flex;align-items:center;height:20px;padding:0 8px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-body);white-space:nowrap}
.cs-mono{font-family:var(--font-data)}
.cs-brand{display:flex;align-items:center;gap:10px}
.cs-brand>span:first-child{display:grid;flex:none;place-items:center;width:28px;height:28px;border-radius:var(--radius-md);background:var(--brand-navy-deep);color:var(--text-on-dark);font-size:var(--text-xs);font-weight:var(--weight-semibold)}
.cs-form{display:flex;flex-direction:column;gap:var(--space-4)}
.cs-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.cs-field .gc-label{margin:0}
.cs-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.cs-checks{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-5);font-size:var(--text-sm)}
.cs-checks label{display:flex;align-items:center;gap:var(--space-2);min-height:36px;cursor:pointer}
.cs-err{margin:0;font-size:var(--text-xs);color:var(--text-danger)}
.cs-grid{border-collapse:collapse}
.cs-grid th{padding:0 4px 6px;font-weight:var(--weight-medium);text-align:left}
.cs-grid td{padding:2px 4px}
.cs-grid .gc-input{width:96px;min-width:0;font-variant-numeric:tabular-nums}
.cs-wrap{overflow-x:auto}
.cs-row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.cs-foot-note{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:640px){.cs-two{grid-template-columns:minmax(0,1fr)}}
`;

const BLANK_FIELD = { label: '', type: 'select', unit: '', options: [], optText: '', cats: [], req: false, show: true, filter: true, ai: false };

export default function CatalogSetupScreen() {
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);
  const [sec, setSec] = useState('fields');
  const [edit, setEdit] = useState(null);   // { kind: 'field' | 'unit' | 'tax' | 'chart', ...draft }
  const [err, setErr] = useState('');
  useEffect(() => {
    setReady(true);
    const want = new URLSearchParams(window.location.search).get('tab');
    if (SECS.some((x) => x[0] === want)) setSec(want);
    const bump = () => setTick((n) => n + 1);
    const evs = [CATALOG_EVENT, UNITS_EVENT, TAX_RATES_EVENT, POLICIES_EVENT, BRANDS_EVENT, CATEGORIES_EVENT];
    evs.forEach((e) => window.addEventListener(e, bump));
    return () => evs.forEach((e) => window.removeEventListener(e, bump));
  }, []);

  // every list after mount (browser storage), the demo lists on the first render
  const data = useMemo(() => {
    void tick;
    const products = ready ? allProducts().filter((p) => p.st !== 'deleted') : [];
    const vat = ready ? loadVat() : null;
    const cats = ready ? [...new Set(getCategories().filter((c) => c.lv === 0).map((c) => c.name).concat(VAT_CATEGORIES))] : VAT_CATEGORIES;
    const brandN = ready ? productCounts() : {};
    // the lists live in browser storage: read them after mount only, so the first render matches the prerender
    const list = (fn) => (ready ? fn() : []);
    return {
      products, cats,
      fields: list(getProductFields),
      brands: list(getBrands).map((b) => ({ ...b, n: brandN[b.name.toLowerCase()] || 0 })),
      units: list(getUnits).map((u) => ({ ...u, n: products.filter((p) => (p.unit || 'pc') === u.k).length })),
      taxes: list(getTaxRates).map((t) => ({ ...t, cats: vat ? cats.filter((c) => vatRateFor(c, vat) === Number(t.rate)) : [], n: products.filter((p) => p.vatRate != null && p.vatRate !== '' && Number(p.vatRate) === Number(t.rate)).length })),
      charts: list(getSizeCharts).map((c) => ({ ...c, n: products.filter((p) => p.sizeGuide === c.id).length })),
      policies: list(getPolicies).map((p) => ({ ...p, n: productsUsing(p.key, products) })),
    };
  }, [ready, tick]);

  const counts = { fields: data.fields.length, brands: data.brands.length, units: data.units.length, tax: data.taxes.length, size: data.charts.length, warranty: data.policies.length };
  const tabs = SECS.map(([k, l]) => ({ key: k, id: 'cs-tab-' + k, label: l, count: ready ? counts[k] : null, on: k === sec, onClick: () => { setSec(k); window.history.replaceState(null, '', window.location.pathname + (k === 'fields' ? '' : '?tab=' + k)); } }));
  const addLabel = (SECS.find((x) => x[0] === sec) || [])[2];

  const open = (draft) => { setErr(''); setEdit(draft); };
  const close = () => { setEdit(null); setErr(''); };
  const add = () => {
    if (sec === 'fields') open({ kind: 'field', ...BLANK_FIELD });
    else if (sec === 'units') open({ kind: 'unit', label: '', short: '', frac: false });
    else if (sec === 'tax') open({ kind: 'tax', name: '', rate: '' });
    else if (sec === 'size') open({ kind: 'chart', name: '', cat: '', head: ['Size', 'Height', 'Width', 'Fits'], rows: [['S', '', '', ''], ['M', '', '', ''], ['L', '', '', '']] });
  };

  const save = () => {
    const e = edit;
    let r;
    if (e.kind === 'field') r = saveProductField({ ...e, options: String(e.optText != null && e.optText !== '' ? e.optText : (e.options || []).join('\n')).split('\n') });
    else if (e.kind === 'unit') r = addUnit(e);
    else if (e.kind === 'tax') r = saveTaxRate(e);
    else if (e.kind === 'chart') r = saveSizeChart(e);
    if (!r || !r.ok) { setErr((r && r.error) || 'Could not save.'); return; }
    toast(e.kind === 'field' ? `${r.field.label} saved. Products in ${r.field.cats.length ? r.field.cats.join(', ') : 'every category'} ask for it.` : e.kind === 'unit' ? `${r.unit.label} added` : e.kind === 'tax' ? `${r.rate.name} · ${r.rate.rate}% saved` : `${r.chart.name} saved`);
    close();
  };
  const remove = async () => {
    const e = edit;
    const used = e.kind === 'unit' ? (data.units.find((u) => u.k === e.k) || {}).n : e.kind === 'tax' ? (data.taxes.find((t) => t.id === e.id) || {}).n : e.kind === 'chart' ? (data.charts.find((c) => c.id === e.id) || {}).n : 0;
    if (used) { setErr(`${used} product${used === 1 ? ' uses' : 's use'} it. Change ${used === 1 ? 'that product' : 'those products'} first.`); return; }
    const name = e.label || e.name;
    if (!(await confirmDialog({ title: `Delete ${name}?`, body: e.kind === 'field' ? 'Products keep the values they have, but no longer ask for this field.' : 'It is no longer offered on products.', confirmLabel: 'Delete', tone: 'danger' }))) return;
    if (e.kind === 'field') removeProductField(e.key); else if (e.kind === 'unit') removeUnit(e.k); else if (e.kind === 'tax') removeTaxRate(e.id); else if (e.kind === 'chart') removeSizeChart(e.id);
    toast(`${name} deleted`);
    close();
  };
  const set = (patch) => { setEdit({ ...edit, ...patch }); setErr(''); };

  const editable = edit && (edit.kind !== 'unit' || !edit.k);   // a saved unit is only removed, not changed
  const title = !edit ? '' : edit.kind === 'field' ? (edit.key ? edit.label : 'New product field') : edit.kind === 'unit' ? (edit.k ? edit.label : 'New unit') : edit.kind === 'tax' ? (edit.id ? edit.name : 'New tax rate') : (edit.id ? edit.name : 'New size chart');

  return (
    <div className="dc-screen ds" data-screen="CatalogSetup">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="products-setup" />
        <main className="gc-shell__main">
          <Topbar crumb="Products" page="Catalog setup" placeholder="Search products, SKU or barcode" />
          <div className="gc-shell__content">
            <div className="ix-page ix-page--narrow">
              <ShopHeader icon="settings-2" title="Catalog setup"
                about="Product fields, brands, units, tax rates, size charts and warranty policies that every product uses. Attributes such as colour and size are added on each product."
                more={[{ label: 'Categories', href: '/categories' }, { label: 'Warranty policies', href: '/warranty-policies' }, { label: 'All products', href: '/all-products' }]} />

              <TemplatesCard />

              <section className="ix-card" aria-label="Catalog setup">
                <div className="ix-bar">
                  <IndexTabs tabs={tabs} label="Catalog setup" />
                  <span className="ix-tools">
                    <InfoTip text={NOTE[sec]} />
                    {sec === 'brands' ? <Link href="/brands" className="ix-btn ix-btn--sm"><Icon name="plus" width="16" height="16" aria-hidden="true" />{addLabel}</Link>
                      : sec === 'warranty' ? <Link href="/warranty-policies?new=1" className="ix-btn ix-btn--sm"><Icon name="plus" width="16" height="16" aria-hidden="true" />{addLabel}</Link>
                        : <button type="button" className="ix-btn ix-btn--sm" onClick={add} aria-haspopup="dialog"><Icon name="plus" width="16" height="16" aria-hidden="true" />{addLabel}</button>}
                  </span>
                </div>

                {sec === 'fields' ? (
                  <div className="ix-table-wrap ix-table-wrap--show" role="tabpanel" aria-labelledby="cs-tab-fields">
                    <table className="ix-table">
                      <thead><tr><th scope="col">Field</th><th scope="col">Type</th><th scope="col">Choices</th><th scope="col">Categories</th><th scope="col">Required</th><th scope="col">Shown to customers</th></tr></thead>
                      <tbody>
                        {data.fields.map((f) => (
                          <tr key={f.key} onClick={() => open({ kind: 'field', ...f, optText: (f.options || []).join('\n') })}>
                            <td><button type="button" className="ix-strong" onClick={(e) => { e.stopPropagation(); open({ kind: 'field', ...f, optText: (f.options || []).join('\n') }); }}>{f.label}</button></td>
                            <td><span className="cs-pill">{FIELD_TYPES[f.type]}{f.unit ? ' · ' + f.unit : ''}</span></td>
                            <td className="ix-muted">{(f.options || []).join(', ') || '—'}</td>
                            <td>{f.cats && f.cats.length ? f.cats.join(', ') : 'All categories'}</td>
                            <td>{yes(f.req)}</td>
                            <td>{yes(f.show)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}

                {sec === 'brands' ? (
                  <div className="ix-table-wrap ix-table-wrap--show" role="tabpanel" aria-labelledby="cs-tab-brands">
                    <table className="ix-table">
                      <thead><tr><th scope="col">Brand</th><th scope="col" className="ix-num">Products</th></tr></thead>
                      <tbody>
                        {data.brands.map((b) => (
                          <tr key={b.id || b.name}>
                            <td><span className="cs-brand"><span aria-hidden="true">{b.name.charAt(0)}</span><Link href="/brands" className="ix-strong">{b.name}</Link></span></td>
                            <td className="ix-num">{ready ? b.n : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}

                {sec === 'units' ? (
                  <div className="ix-table-wrap ix-table-wrap--show" role="tabpanel" aria-labelledby="cs-tab-units">
                    <table className="ix-table">
                      <thead><tr><th scope="col">Unit</th><th scope="col">Short</th><th scope="col">Half units allowed</th><th scope="col" className="ix-num">Products</th></tr></thead>
                      <tbody>
                        {data.units.map((u) => (
                          <tr key={u.k} onClick={u.custom ? () => open({ kind: 'unit', ...u }) : undefined}>
                            <td>{u.custom ? <button type="button" className="ix-strong" onClick={(e) => { e.stopPropagation(); open({ kind: 'unit', ...u }); }}>{u.label}</button> : <span className="ix-strong">{u.label}</span>}{u.custom ? null : <span className="ix-muted"> · built in</span>}</td>
                            <td className="cs-mono">{u.short}</td>
                            <td>{yes(u.frac)}</td>
                            <td className="ix-num">{ready ? u.n : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}

                {sec === 'tax' ? (
                  <div className="ix-table-wrap ix-table-wrap--show" role="tabpanel" aria-labelledby="cs-tab-tax">
                    <table className="ix-table">
                      <thead><tr><th scope="col">Name</th><th scope="col" className="ix-num">Rate</th><th scope="col">Category default for</th><th scope="col" className="ix-num">Products</th></tr></thead>
                      <tbody>
                        {data.taxes.map((t) => (
                          <tr key={t.id} onClick={() => open({ kind: 'tax', ...t, rate: String(t.rate) })}>
                            <td><button type="button" className="ix-strong" onClick={(e) => { e.stopPropagation(); open({ kind: 'tax', ...t, rate: String(t.rate) }); }}>{t.name}</button></td>
                            <td className="ix-num ix-strong">{t.rate}%</td>
                            <td className="ix-muted">{t.cats.length ? t.cats.join(', ') : '—'}</td>
                            <td className="ix-num">{ready ? t.n : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="ix-foot"><span>Category rates: <Link href="/vat">Accounts › VAT</Link></span></div>
                  </div>
                ) : null}

                {sec === 'size' ? (
                  <div className="ix-table-wrap ix-table-wrap--show" role="tabpanel" aria-labelledby="cs-tab-size">
                    <table className="ix-table">
                      <thead><tr><th scope="col">Chart</th><th scope="col">For</th><th scope="col">Sizes</th><th scope="col" className="ix-num">Products</th></tr></thead>
                      <tbody>
                        {data.charts.map((c) => (
                          <tr key={c.id} onClick={() => open({ kind: 'chart', ...c })}>
                            <td><button type="button" className="ix-strong" onClick={(e) => { e.stopPropagation(); open({ kind: 'chart', ...c }); }}>{c.name}</button></td>
                            <td className="ix-muted">{c.cat || '—'}</td>
                            <td>{c.rows.map((r) => r[0]).join(', ')}</td>
                            <td className="ix-num">{ready ? c.n : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}

                {sec === 'warranty' ? (
                  <div className="ix-table-wrap ix-table-wrap--show" role="tabpanel" aria-labelledby="cs-tab-warranty">
                    <table className="ix-table">
                      <thead><tr><th scope="col">Policy</th><th scope="col">Period</th><th scope="col">Type</th><th scope="col">Claim at</th><th scope="col">Status</th><th scope="col" className="ix-num">Products</th></tr></thead>
                      <tbody>
                        {data.policies.map((w) => (
                          <tr key={w.key}>
                            <td><Link href={'/warranty-policies?key=' + encodeURIComponent(w.key)} className="ix-strong">{w.label}</Link>{w.isDefault ? <span className="ix-muted"> · store default</span> : null}</td>
                            <td>{periodText(w)}</td>
                            <td>{WTYPES[w.type]}</td>
                            <td className="ix-muted">{w.claim}</td>
                            <td><StatusBadge tone={w.status === 'published' ? 'success' : 'info'}>{w.status === 'published' ? 'Published' : 'Draft'}</StatusBadge></td>
                            <td className="ix-num">{ready ? w.n : '—'}</td>
                          </tr>
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

      <Sheet open={!!edit} title={title} onClose={close} footer={edit ? <>
        {(edit.kind === 'field' && edit.key) || (edit.kind === 'unit' && edit.k) || ((edit.kind === 'tax' || edit.kind === 'chart') && edit.id)
          ? <button type="button" className="gc-btn gc-btn--sm gc-btn--flat gc-btn--error" style={{ marginRight: 'auto' }} onClick={remove}>Delete</button> : null}
        <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={close}>Cancel</button>
        {editable ? <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={save}>Save</button> : null}
      </> : null}>
        {edit && edit.kind === 'field' ? (
          <div className="cs-form">
            <label className="cs-field"><span className="gc-label">Field name</span><input className="gc-input" value={edit.label} onChange={(e) => set({ label: e.target.value })} data-autofocus="" /></label>
            <div className="cs-two">
              <label className="cs-field"><span className="gc-label">Type</span>
                <select className="gc-input gc-select" value={edit.type} onChange={(e) => set({ type: e.target.value })}>{Object.entries(FIELD_TYPES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
              </label>
              {edit.type === 'number' ? <label className="cs-field"><span className="gc-label">Unit (optional)</span><input className="gc-input" placeholder="mAh, W, inch" value={edit.unit || ''} onChange={(e) => set({ unit: e.target.value })} /></label> : null}
            </div>
            {edit.type === 'select' || edit.type === 'multi' ? (
              <label className="cs-field"><span className="gc-label">Choices, one per line</span><textarea className="gc-input" rows={4} value={edit.optText != null ? edit.optText : (edit.options || []).join('\n')} onChange={(e) => set({ optText: e.target.value })} /></label>
            ) : null}
            <fieldset className="cs-field" style={{ border: 0, margin: 0, padding: 0 }}>
              <legend className="gc-label">Categories (none ticked = every product)</legend>
              <div className="cs-checks">
                {data.cats.map((c) => <label key={c}><input type="checkbox" className="gc-check" checked={(edit.cats || []).includes(c)} onChange={(e) => set({ cats: e.target.checked ? [...(edit.cats || []), c] : (edit.cats || []).filter((x) => x !== c) })} />{c}</label>)}
              </div>
            </fieldset>
            <div className="cs-checks">
              <label><input type="checkbox" className="gc-check" checked={!!edit.req} onChange={(e) => set({ req: e.target.checked })} />Required</label>
              <label><input type="checkbox" className="gc-check" checked={edit.show !== false} onChange={(e) => set({ show: e.target.checked })} />Show on product page</label>
              <label><input type="checkbox" className="gc-check" checked={!!edit.filter} onChange={(e) => set({ filter: e.target.checked })} />Use in shop filters</label>
              <label><input type="checkbox" className="gc-check" checked={!!edit.ai} onChange={(e) => set({ ai: e.target.checked })} />AI can fill it</label>
            </div>
          </div>
        ) : null}

        {edit && edit.kind === 'unit' ? (
          <div className="cs-form">
            {edit.k ? <p className="cs-foot-note">{edit.short} · {edit.frac ? 'half units allowed' : 'whole units only'}. A unit can be removed when no product uses it.</p> : <>
              <div className="cs-two">
                <label className="cs-field"><span className="gc-label">Unit name</span><input className="gc-input" placeholder="Carton" value={edit.label} onChange={(e) => set({ label: e.target.value })} data-autofocus="" /></label>
                <label className="cs-field"><span className="gc-label">Short name</span><input className="gc-input" placeholder="ctn" value={edit.short} onChange={(e) => set({ short: e.target.value })} /></label>
              </div>
              <div className="cs-checks"><label><input type="checkbox" className="gc-check" checked={!!edit.frac} onChange={(e) => set({ frac: e.target.checked })} />Half units allowed (weight, length)</label></div>
            </>}
          </div>
        ) : null}

        {edit && edit.kind === 'tax' ? (
          <div className="cs-form">
            <div className="cs-two">
              <label className="cs-field"><span className="gc-label">Name</span><input className="gc-input" placeholder="Reduced VAT" value={edit.name} onChange={(e) => set({ name: e.target.value })} data-autofocus="" /></label>
              <label className="cs-field"><span className="gc-label">Rate (%)</span><input className="gc-input" inputMode="decimal" value={edit.rate} onChange={(e) => set({ rate: e.target.value.replace(/[^0-9.]/g, '') })} /></label>
            </div>
            <p className="cs-foot-note">A product given this rate is taxed at it instead of its category’s.</p>
          </div>
        ) : null}

        {edit && edit.kind === 'chart' ? (
          <div className="cs-form">
            <div className="cs-two">
              <label className="cs-field"><span className="gc-label">Chart name</span><input className="gc-input" value={edit.name} onChange={(e) => set({ name: e.target.value })} data-autofocus="" /></label>
              <label className="cs-field"><span className="gc-label">For (category)</span><input className="gc-input" placeholder="Wearables" value={edit.cat || ''} onChange={(e) => set({ cat: e.target.value })} /></label>
            </div>
            <div className="cs-row">
              <span className="gc-label" style={{ margin: 0 }}>Sizes · mm</span>
              <span style={{ flex: 1 }} />
              <button type="button" className="ix-btn ix-btn--sm" onClick={() => set({ rows: [...edit.rows, edit.head.map(() => '')] })}><Icon name="plus" width="16" height="16" aria-hidden="true" />Row</button>
              <button type="button" className="ix-btn ix-btn--sm" onClick={() => set({ head: [...edit.head, 'Column ' + (edit.head.length + 1)], rows: edit.rows.map((r) => [...r, '']) })}><Icon name="plus" width="16" height="16" aria-hidden="true" />Column</button>
            </div>
            <div className="cs-wrap">
              <table className="cs-grid gc-table--keep">
                <thead><tr>{edit.head.map((h, i) => <th key={i} scope="col"><input className="gc-input" aria-label={'Column ' + (i + 1) + ' name'} value={h} onChange={(e) => set({ head: edit.head.map((x, j) => (j === i ? e.target.value : x)) })} /></th>)}<th scope="col"><span className="sr-only">Remove</span></th></tr></thead>
                <tbody>
                  {edit.rows.map((r, ri) => (
                    <tr key={ri}>
                      {edit.head.map((_, ci) => <td key={ci}><input className="gc-input" aria-label={(edit.head[ci] || 'Value') + ', row ' + (ri + 1)} value={r[ci] == null ? '' : r[ci]} onChange={(e) => set({ rows: edit.rows.map((x, j) => (j === ri ? x.map((y, k) => (k === ci ? e.target.value : y)) : x)) })} /></td>)}
                      <td><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={'Remove row ' + (ri + 1)} onClick={() => set({ rows: edit.rows.filter((_, j) => j !== ri) })}><Icon name="x" width="14" height="14" aria-hidden="true" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
        {err ? <p className="cs-err" role="alert">{err}</p> : null}
      </Sheet>
    </div>
  );
}
