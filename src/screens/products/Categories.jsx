'use client';
// Generated from design/templates/products/Categories.dc.html by scripts/convert-design.mjs.
// Categories — Products — Categories, laid out like Shopify's collections list (docs/shopify-style.md).
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, list as __list } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { Dialog as __Dialog, EmptyState as __EmptyState, Sheet as __Sheet, StatusBadge as __StatusBadge, InfoTip as __InfoTip } from '@/components/ui';
import { ShopHeader, SearchField, LearnMore } from '@/components/ui/IndexKit';
import { toast as __toast, confirmDialog } from '@/runtime/ui';
import { TEMPLATES, tplBy, categoryDefaults, setCategoryTemplate, templateOfCategory, businessTemplate } from '@/lib/productTemplates';
import { getCategories, productsIn, addCategory, saveCategory, deleteCategory, importCategories, CATEGORIES_EVENT, CATEGORY_SEED, categoryHandle } from '@/lib/productCategories';
import SeoPanel, { SEO_PANEL_CSS } from '@/components/seo/SeoPanel';
import { readSeo } from '@/lib/seo';
import { contextOf } from '@/lib/seoItems';
import { toHandle, cleanHandleInput } from '@/lib/handles';
import { allProducts, getSavedProducts } from '@/lib/products';

// ---- logic (from the design's <script type="text/x-dc">) ----
// The tree is the shop's saved categories (lib/productCategories.js; the demo tree on the first render, the saved one
// after mount). Product counts come from the product list. A new name or "Inside" moves the category's products with it;
// only an empty category can be deleted.

function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { __toast(m, bad ? { tone: 'error' } : undefined); }
function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
var FIELDS = { ph: [['RAM', 'dropdown', true], ['Storage', 'dropdown', true], ['Network', 'dropdown', true], ['Display size', 'number', false], ['Battery', 'number', false], ['Official / unofficial', 'dropdown', true]], acc: [['Compatible models', 'text', true], ['Material', 'text', false], ['Colour', 'dropdown', false]], aud: [['Connection', 'dropdown', true], ['Battery life', 'number', false], ['Noise cancelling', 'yes / no', false]], wr: [['Display', 'text', false], ['Strap size', 'dropdown', true]], pb: [['Capacity (mAh)', 'number', true], ['Output', 'text', true]] };
var SEED_TREE = getCategories(CATEGORY_SEED);
function focusId(id) { setTimeout(function () { var el = document.getElementById(id); if (el) el.focus(); }, 0); }
class Component extends DCLogic {
  // saved categories, templates and products are read after mount (localStorage), so the first render matches the server
  componentDidMount() {
    var self = this;
    this.reload = function () { self.setState({ cats: getCategories(), products: allProducts(getSavedProducts()), tplTick: Date.now() }); };
    window.addEventListener(CATEGORIES_EVENT, this.reload); window.addEventListener('storage', this.reload);
    this.reload();
    // ?id=<category> opens that category (Online Store › SEO links here)
    var want = new URLSearchParams(window.location.search).get('id');
    if (want && getCategories().some(function (c) { return c.id === want; })) this.setState({ sel: want, edit: true });
  }
  componentWillUnmount() { if (this.reload) { window.removeEventListener(CATEGORIES_EVENT, this.reload); window.removeEventListener('storage', this.reload); } }
  renderVals() {
    var self = this, s = this.state || {}, open = s.open || { ph: true, acc: true, aud: true, cse: false };
    var all = s.cats || SEED_TREE, by = {}, ready = !!s.products;
    all.forEach(function (t) { by[t.id] = t; });
    var kidsOf = function (id) { return all.filter(function (x) { return x.p === id; }); };
    var root = function (t) { while (t.p && by[t.p]) t = by[t.p]; return t; };
    var count = function (t) { return ready ? productsIn(t.path, s.products).length : null; };
    var sel = by[s.sel] || all[0] || { id: '', name: '', lv: 0, p: '', path: '' };
    var cq = (s.cq || '').trim().toLowerCase();
    var visible = cq ? all.filter(function (t) { return t.name.toLowerCase().indexOf(cq) >= 0; })
      : all.filter(function (t) { var p = t.p; while (p) { if (!open[p]) return false; p = by[p] ? by[p].p : ''; } return true; });
    var R = root(sel);
    var path = sel.p ? sel.path.split(' › ').slice(0, -1) : [];
    var name = s.name != null ? s.name : sel.name;
    var parentId = s.parent != null ? s.parent : sel.p;
    var add = s.add || null, imp = s.imp || null;
    var parents = all.filter(function (t) { return t.lv < 2; });
    // where the open category can go: not inside itself, at most three levels deep
    var depthBelow = function (id) { var k = kidsOf(id); return k.length ? 1 + Math.max.apply(null, k.map(function (x) { return depthBelow(x.id); })) : 0; };
    var under = function (t) { return t.id === sel.id || (t.path + ' › ').indexOf(sel.path + ' › ') === 0; };
    var homes = all.filter(function (t) { return !under(t) && t.lv + 1 + depthBelow(sel.id) <= 2; });
    var n = count(sel);
    return assign({
      rows: visible.map(function (t) { var on = t.id === sel.id, hk = kidsOf(t.id).length > 0, label = t.name, c = count(t);
        return { id: t.id, name: label, n: c == null ? '' : c, pad: (10 + (cq ? 0 : t.lv) * 26) + 'px', hasKids: hk && !cq, leaf: !hk || !!cq, isOpen: !!open[t.id], initial: label.charAt(0), hidden: !!t.hidden, on: on,
          fold: function () { var o = assign({}, open); o[t.id] = !open[t.id]; self.setState({ open: o }); }, pick: function () { self.setState({ sel: t.id, desc: null, name: null, parent: null, nameErr: '', inMenu: null, featured: null, handle: null, seoC: null }); } }; }),
      noRows: !visible.length, cq: s.cq || '', typeCq: function (e) { self.setState({ cq: e.target.value }); }, clearCq: function () { self.setState({ cq: '' }); },
      noRowsTitle: 'No category matches “' + (s.cq || '').trim() + '”',
      allLbl: Object.keys(open).some(function (k) { return open[k]; }) ? 'Close all' : 'Open all',
      toggleAll: function () { var any = Object.keys(open).some(function (k) { return open[k]; }); var o = {}; all.forEach(function (t) { if (kidsOf(t.id).length) o[t.id] = !any; }); self.setState({ open: o }); },
      // the category's product template (productTemplates.js): products in it get it unless they pick their own
      tplOwn: s.tplTick ? (categoryDefaults()[sel.path] || {}).template || '' : '',
      tplFrom: path.length ? tplBy(templateOfCategory(path[0])).name : tplBy(businessTemplate()).name,
      setTpl: function (e) { setCategoryTemplate(sel.path, e.target.value); self.setState({ tplTick: Date.now() }); toast(self, e.target.value ? 'New products in ' + sel.name + ' use ' + tplBy(e.target.value).name + '.' : sel.name + ' uses the template above it.'); },
      templates: TEMPLATES,
      sel: { id: sel.id, name: sel.name, initial: sel.name.charAt(0), n: n == null ? '' : n, path: path.length ? path.join(' › ') + ' ›' : 'Top level', tax: R.tax || 'Standard VAT 15%', wp: R.wp || 'No warranty', sg: R.sg || 'No size guide', track: R.track || 'No tracking', unit: R.unit || 'Piece', comm: R.comm || '10%', slug: '/collections/' + sel.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        productsHref: '/all-products' },
      name: name, nameErr: s.nameErr || '', typeName: function (e) { self.setState({ name: e.target.value, nameErr: '' }); },
      parentId: parentId || '', homes: homes.map(function (t) { return { id: t.id, label: (t.lv ? '— '.repeat(t.lv) : '') + t.name }; }),
      setParent: function (e) { self.setState({ parent: e.target.value, nameErr: '' }); },
      desc: s.desc != null ? s.desc : sel.desc || '', typeDesc: function (e) { self.setState({ desc: e.target.value }); },
      aiDesc: function () { self.setState({ desc: 'Shop the latest ' + sel.name.toLowerCase() + ' in Bangladesh — official products, honest prices and fast delivery all over the country.' }); },
      fields: (FIELDS[R.id] || []).map(function (f) { return { l: f[0], t: f[1], req: f[2] }; }),
      inMenu: mkSw(this, 'inMenu', !sel.hidden), featured: mkSw(this, 'featured', !!sel.featured),
      // address and search engine listing (the shared SEO panel); the address follows the name until it is edited
      handle: s.handle != null ? s.handle : (sel.handle || toHandle(name)), handleOwn: s.handle != null || !!sel.handle,
      typeHandle: function (e) { self.setState({ handle: cleanHandleInput(e.target.value) }); },
      autoHandle: function () { self.setState({ handle: '' }); },
      seo: s.seoC || readSeo('category', sel), setSeo: function (patch) { self.setState({ seoC: assign(assign({}, s.seoC || readSeo('category', sel)), patch) }); },
      seoCtx: contextOf('category', assign(assign({}, sel), { name: name, desc: s.desc != null ? s.desc : sel.desc || '', handle: s.handle != null ? s.handle : sel.handle, hidden: s.inMenu == null ? sel.hidden : !s.inMenu })),
      // ---- edit form ----
      save: function (e) {
        if (e && e.preventDefault) e.preventDefault();
        var r = saveCategory(sel.id, { name: name, parent: parentId || '', desc: s.desc != null ? s.desc : undefined, hidden: s.inMenu == null ? undefined : !s.inMenu, featured: s.featured == null ? undefined : !!s.featured, handle: s.handle != null ? toHandle(s.handle) : undefined, seo: s.seoC || undefined });
        if (!r.ok) { self.setState({ nameErr: r.error }); focusId('cat-name'); return; }
        self.setState({ name: null, parent: null, desc: null, inMenu: null, featured: null, nameErr: '', handle: null, seoC: null }); self.reload();
        toast(self, r.cat.name + ' saved.' + (r.moved ? ' ' + (r.moved === 1 ? '1 product moved with it.' : r.moved + ' products moved with it.') : ''));
      },
      del: async function () {
        var kids = kidsOf(sel.id).length, c = count(sel) || 0;
        if (kids || c) { var why = deleteCategory(sel.id); __toast('Can’t delete ' + sel.name + '. ' + why.error, { tone: 'info' }); return; }
        var ok = await confirmDialog({ title: 'Delete ' + sel.name + '?', body: 'It has no products. It leaves the product form and the shop menu.', confirmLabel: 'Delete', tone: 'danger' });
        if (!ok) return;
        var r = deleteCategory(sel.id);
        if (!r.ok) { __toast(r.error, { tone: 'info' }); return; }
        self.setState({ sel: sel.p || null, edit: false }); self.reload();
        toast(self, sel.name + ' deleted.');
      },
      // ---- add category dialog ----
      addOpen: !!add, addName: add ? add.name : '', addParent: add ? add.parent : '', addErr: add ? add.err || '' : '',
      parents: parents.map(function (t) { return { id: t.id, label: (t.lv ? '— ' : '') + t.name }; }),
      addCat: function () { self.setState({ add: { name: '', parent: sel.lv < 2 ? sel.id : (sel.p || ''), err: '' } }); },
      closeAdd: function () { self.setState({ add: null }); },
      typeAddName: function (e) { self.setState({ add: assign(assign({}, add), { name: e.target.value, err: '' }) }); },
      setAddParent: function (e) { self.setState({ add: assign(assign({}, add), { parent: e.target.value, err: '' }) }); },
      submitAdd: function (e) {
        if (e && e.preventDefault) e.preventDefault();
        var r = addCategory({ name: add.name, parent: add.parent || '' });
        if (!r.ok) { self.setState({ add: assign(assign({}, add), { err: r.error }) }); focusId('cat-add-name'); return; }
        var par = r.cat.p ? by[r.cat.p] : null;
        var o = assign({}, open); if (par) { o[par.id] = true; var pp = par.p; while (pp && by[pp]) { o[pp] = true; pp = by[pp].p; } }
        self.setState({ open: o, sel: r.cat.id, add: null, cq: '', desc: null, name: null, parent: null, nameErr: '', inMenu: null, featured: null }); self.reload();
        toast(self, r.cat.name + ' added' + (par ? ' inside ' + par.name : ' at the top level') + '.');
      },
      // ---- import dialog ----
      impOpen: !!imp, impFile: imp ? imp.file || '' : '', impErr: imp ? imp.err || '' : '',
      openImport: function () { self.setState({ imp: { file: '', err: '' } }); }, closeImport: function () { self.setState({ imp: null }); },
      pickFile: function (e) {
        var fl = e.target.files && e.target.files[0];
        self.setState({ imp: { file: fl ? fl.name : '', text: '', err: fl && !/\.csv$/i.test(fl.name) ? 'Choose a .csv file.' : '' } });
        if (fl && /\.csv$/i.test(fl.name)) { var rd = new FileReader(); rd.onload = function () { self.setState({ imp: { file: fl.name, text: String(rd.result || ''), err: '' } }); }; rd.readAsText(fl); }
      },
      // the file is read in the browser and each row added (lib/productCategories.js › importCategories)
      submitImport: function (e) {
        if (e && e.preventDefault) e.preventDefault();
        if (!imp.file) { self.setState({ imp: { file: '', err: 'Choose a CSV file first.' } }); focusId('cat-import-file'); return; }
        if (!/\.csv$/i.test(imp.file)) { self.setState({ imp: { file: imp.file, err: 'Choose a .csv file.' } }); focusId('cat-import-file'); return; }
        var r = importCategories(imp.text || '');
        if (!r.added && !r.skipped) { self.setState({ imp: assign(assign({}, imp), { err: r.errors[0] || 'No categories found in this file.' }) }); focusId('cat-import-file'); return; }
        self.setState({ imp: null }); self.reload();
        __toast('Added ' + r.added + (r.added === 1 ? ' category' : ' categories') + (r.skipped ? ', skipped ' + r.skipped : ''), r.errors.length ? { tone: 'info' } : undefined);
      },
      downloadTemplate: function () {
        var csv = 'name,parent,description,show_in_menu\nPhones,,Smartphones and feature phones,yes\nSmartphones,Phones,Android and iPhone,yes\n';
        var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'categories-template.csv';
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      }
    });
  }
}
// ---- styles ----

const CSS = `
.ct-tree.ix-table td{white-space:normal}
.ct-tree .ct-cell{display:flex;align-items:center;gap:var(--space-2);min-width:0}
.ct-fold{display:grid;flex:none;place-items:center;width:24px;height:24px;border:0;border-radius:var(--radius-md);background:none;color:var(--text-muted);cursor:pointer;transition:transform 150ms ease-out}
.ct-fold:hover{background:var(--surface-quiet);color:var(--text-heading)}
.ct-fold[aria-expanded="true"]{transform:rotate(90deg)}
.ct-gap{width:24px;flex:none}
.ct-tree .ix-thumb{width:28px;height:28px;background:var(--surface-subtle)}
.ct-name{min-width:0;overflow:hidden;text-overflow:ellipsis}
.ct-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.ct-field .gc-label{margin:0}
.ct-lbl{display:flex;align-items:center;gap:6px}
.ct-lbl>.gc-label{flex:1;min-width:0}
.ct-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.ct-sec{display:flex;align-items:center;gap:6px;margin:0;padding-top:var(--space-3);border-top:1px solid var(--border-subtle);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ct-sec:first-child{padding-top:0;border-top:0}
.ct-head{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);font-size:var(--text-xs-plus);color:var(--text-muted)}
.ct-head>a{margin-left:auto;font-weight:var(--weight-medium)}
.ct-chips{display:flex;flex-wrap:wrap;gap:6px}
.ct-chip{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 8px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);font-size:var(--text-xs)}
.ct-chip>b{font-weight:var(--weight-medium);color:var(--text-heading)}
.ct-chip>span{color:var(--text-muted)}
.ct-chip>em{font-style:normal;color:var(--text-danger)}
.ct-prefix{display:flex;align-items:center;gap:6px;font-size:var(--text-sm);color:var(--text-muted)}.ct-prefix .gc-input{flex:1;min-width:0}
.ct-banner{display:flex;align-items:center;gap:var(--space-3);font-size:var(--text-xs);color:var(--text-muted)}
.ct-banner>span:first-child{display:grid;flex:none;place-items:center;width:96px;height:56px;border:1px dashed var(--border-strong);border-radius:var(--radius-lg)}
.ct-switch{display:flex;align-items:center;gap:var(--space-3);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ct-switch>span{flex:1}
.ct-err{margin:0;font-size:var(--text-xs);color:var(--text-danger)}
.ct-cols{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.ct-cols th{padding:0 0 6px;border-bottom:1px solid var(--border-subtle);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:left}
.ct-cols td{padding:6px 0;border-bottom:1px solid var(--border-subtle);vertical-align:top}
.ct-cols td:first-child{width:120px;font-family:var(--font-data);color:var(--text-heading)}
@media (max-width:640px){.ct-grid{grid-template-columns:minmax(0,1fr)}}
`;

// ---- markup ----

// Shopify's collections list (components/ui/IndexKit.jsx): one card with the category tree and its product counts.
// A category opens in a side panel with its name, fields, defaults and shop settings; Add and Import open dialogs.
export default class CategoriesScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    const s = this.state || {};
    const open = (r) => { r.pick(); this.setState({ edit: true }); };
    const close = () => this.setState({ edit: false });
    // a new category opens in the panel as soon as it is added, as the old editor showed it
    const submitAdd = (e) => { v.submitAdd(e); setTimeout(() => { if (!(this.state || {}).add) this.setState({ edit: true }); }, 0); };
    return (
      <div className="dc-screen ds" data-screen="Categories">
        <style dangerouslySetInnerHTML={{ __html: CSS + SEO_PANEL_CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="products-cats" />
          <main className="gc-shell__main">
            <__Topbar crumb="Products" page="Categories" placeholder="Search products, SKU or barcode" />
            <div className="gc-shell__content">
              <div className="ix-page">
                <ShopHeader icon="folder" title="Categories" about="Sets the tax, the extra fields and where it shows in your shop menu."
                  secondary={[{ label: 'Import', onClick: v.openImport }]}
                  more={[{ label: 'Catalog setup', href: '/catalog-setup' }, { label: 'All products', href: '/all-products' }]}
                  primary={{ label: 'Add category', onClick: v.addCat }} />

                <section className="ix-card" aria-label="Categories">
                  <div className="ix-bar">
                    <SearchField value={v.cq} onChange={v.typeCq} placeholder="Find a category" onDone={v.clearCq} />
                    <span className="ix-tools">
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={v.toggleAll}>{v.allLbl}</button>
                    </span>
                  </div>
                  {v.noRows ? (
                    <div className="ix-empty"><__EmptyState title={v.noRowsTitle} body="Check the spelling or clear the search." actionLabel="Clear search" onAction={v.clearCq} /></div>
                  ) : (
                    <div className="ix-table-wrap ix-table-wrap--show">
                      <table className="ix-table ct-tree gc-table--keep">
                        <caption className="sr-only">Categories</caption>
                        <thead><tr><th scope="col">Category</th><th scope="col" className="ix-num">Products</th></tr></thead>
                        <tbody>
                          {__list(v.rows).map((r, i) => (
                            <tr key={i} className={r.on && s.edit ? 'is-sel' : ''} onClick={() => open(r)}>
                              <td>
                                <span className="ct-cell" style={{ paddingLeft: `calc(${r.pad} - 10px)` }}>
                                  {r.hasKids ? (
                                    <button type="button" className="ct-fold" onClick={(e) => { e.stopPropagation(); r.fold(); }} aria-expanded={r.isOpen} aria-label={`Sub-categories of ${r.name ?? ""}`}><__Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button>
                                  ) : <span className="ct-gap" />}
                                  <span className="ix-thumb" aria-hidden="true">{r.initial}</span>
                                  <button type="button" className="ix-strong ct-name" onClick={(e) => { e.stopPropagation(); open(r); }} aria-current={r.on ? 'true' : undefined}>{r.name}</button>
                                  {r.hidden ? <__StatusBadge tone="neutral" icon="eye-off">Hidden</__StatusBadge> : null}
                                </span>
                              </td>
                              <td className="ix-num ix-muted">{r.n}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="ix-foot"><span>{v.rows.length === 1 ? '1 category' : v.rows.length + ' categories'}</span></div>
                </section>
                <LearnMore topic="categories" />
              </div>
            </div>
          </main>
        </div>

        {/* the category, in a side panel (a bottom sheet on phones) */}
        <__Sheet open={!!s.edit} title={v.sel?.name} label={`Edit ${v.sel?.name ?? ""}`} onClose={close} footer={<>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={v.del} style={{ color: "var(--text-danger)" }}><__Icon name="trash-2" width="16" height="16" aria-hidden="true" />Delete</button>
          <button type="submit" form="cat-edit-form" className="gc-btn gc-btn--sm gc-btn--solid">Save category</button>
        </>}>
          <form id="cat-edit-form" key={v.sel?.id} onSubmit={v.save} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div className="ct-head">
              <span>{v.sel?.path}</span>
              <span>·</span>
              {v.sel?.n === '' ? null : <span>{v.sel?.n === 1 ? '1 product' : `${v.sel?.n} products`}</span>}
              <__Link href="/all-products">See products</__Link>
            </div>
            <h3 className="ct-sec">Basics</h3>
            <div className="ct-grid">
              <div className="ct-field">
                <label className="gc-label" htmlFor="cat-name">Name <span aria-hidden="true" style={{ color: "var(--text-danger)" }}>*</span></label>
                <input id="cat-name" className={'gc-input' + (v.nameErr ? ' gc-input--error' : '')} value={v.name} onChange={v.typeName} aria-required="true" aria-invalid={v.nameErr ? "true" : undefined} aria-describedby={v.nameErr ? "cat-name-err" : undefined} />
                {v.nameErr ? (<p id="cat-name-err" className="ct-err" role="alert">{v.nameErr}</p>) : null}
              </div>
              <label className="ct-field">
                <span className="gc-label">Inside</span>
                <select className="gc-input gc-select" aria-label="Parent category" value={v.parentId} onChange={v.setParent}>
                  <option value="">Top level</option>
                  {__list(v.homes).map((h) => (<option key={h.id} value={h.id}>{h.label}</option>))}
                </select>
              </label>
            </div>
            <div className="ct-field">
              <div className="ct-lbl">
                <label className="gc-label" htmlFor="cat-desc">Description (shown on the category page)</label>
                <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={v.aiDesc}><__Icon name="sparkles" width="16" height="16" aria-hidden="true" />Write with AI</button>
              </div>
              <textarea id="cat-desc" className="gc-input" rows="3" value={v.desc} onInput={v.typeDesc} onChange={v.typeDesc} aria-label="Category description" />
            </div>
            <div className="ct-field">
              <label className="gc-label" htmlFor="cat-handle">Address</label>
              <span className="ct-prefix"><span aria-hidden="true">/collections/</span><input id="cat-handle" className="gc-input" value={v.handle} onChange={v.typeHandle} placeholder="made-from-the-name" style={{ fontFamily: "var(--font-data)" }} /></span>
              <p className="gc-help" style={{ margin: 0 }}>{v.handleOwn ? 'Changing it later keeps the old address working (a redirect is made).' : 'Made from the name.'}</p>
            </div>
            <SeoPanel kind="category" idPrefix="cat-seo" seo={v.seo} onChange={v.setSeo} ctx={v.seoCtx} />
            <div className="ct-banner">
              <span><__Icon name="image" width="20" height="20" aria-hidden="true" /></span>
              <span>Banner or icon for the menu. 1200 × 400.</span>
            </div>

            <h3 className="ct-sec">Extra product fields <__InfoTip text="Every product in this category asks for these. Sub-categories get them too." /></h3>
            <div className="ct-chips">
              {__list(v.fields).map((f, i) => (
                <span key={i} className="ct-chip"><b>{f.l}</b><span>{f.t}</span>{f.req ? <em>required</em> : null}</span>
              ))}
              <__Link href="/catalog-setup" className="ix-btn ix-btn--sm"><__Icon name="plus" width="16" height="16" aria-hidden="true" />Add field</__Link>
            </div>

            <h3 className="ct-sec">Defaults for new products</h3>
            <div className="ct-grid">
              <div className="ct-field">
                <div className="ct-lbl"><label className="gc-label" htmlFor="cat-tpl">Product template</label><__InfoTip text="Decides which details its products show. A product can pick its own." /></div>
                <select id="cat-tpl" className="gc-input gc-select" value={v.tplOwn} onChange={v.setTpl} data-nodirty="">
                  <option value="">{'Same as above · ' + v.tplFrom}</option>
                  {__list(v.templates).map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                </select>
              </div>
              <label className="ct-field">
                <span className="gc-label">VAT / tax</span>
                <select className="gc-input gc-select" aria-label="Tax">
                  <option>{v.sel?.tax}</option>
                  <option>Standard VAT 15%</option>
                  <option>Reduced 7.5%</option>
                  <option>No VAT</option>
                </select>
              </label>
              <label className="ct-field">
                <span className="gc-label">Warranty policy</span>
                <select className="gc-input gc-select" aria-label="Warranty">
                  <option>{v.sel?.wp}</option>
                  <option>No warranty</option>
                  <option>7-day replacement only</option>
                </select>
              </label>
              <label className="ct-field">
                <span className="gc-label">Size guide</span>
                <select className="gc-input gc-select" aria-label="Size guide">
                  <option>{v.sel?.sg}</option>
                  <option>Case sizes by model</option>
                  <option>Strap sizes</option>
                </select>
              </label>
              <label className="ct-field">
                <span className="gc-label">Track by</span>
                <select className="gc-input gc-select" aria-label="Tracking">
                  <option>{v.sel?.track}</option>
                  <option>No tracking</option>
                  <option>Serial number</option>
                </select>
              </label>
              <label className="ct-field">
                <span className="gc-label">Unit</span>
                <select className="gc-input gc-select" aria-label="Unit">
                  <option>{v.sel?.unit}</option>
                  <option>kg</option>
                  <option>Litre</option>
                </select>
              </label>
              <div className="ct-field">
                <div className="ct-lbl"><label className="gc-label" htmlFor="cat-comm">Seller commission</label><__InfoTip text="For marketplace sellers" /></div>
                <input id="cat-comm" className="gc-input" defaultValue={v.sel?.comm} aria-label="Seller commission" style={{ fontVariantNumeric: "tabular-nums" }} />
              </div>
            </div>

            <h3 className="ct-sec">Showing in the shop</h3>
            <div className="ct-switch">
              <span>Show in the shop menu</span>
              <button type="button" role="switch" aria-checked={!!v.inMenu?.on} aria-label="Show in the shop menu" className="gc-switch" onClick={v.inMenu?.toggle}><span className="gc-switch__knob" /></button>
            </div>
            <div className="ct-switch">
              <span>Feature on the home page</span>
              <button type="button" role="switch" aria-checked={!!v.featured?.on} aria-label="Feature on the home page" className="gc-switch" onClick={v.featured?.toggle}><span className="gc-switch__knob" /></button>
            </div>
            <div className="ct-grid">
              <label className="ct-field">
                <span className="gc-label">Web address</span>
                <input className="gc-input" defaultValue={v.sel?.slug} aria-label="Web address" style={{ fontFamily: "var(--font-data)" }} />
              </label>
              <label className="ct-field">
                <span className="gc-label">Sort products by</span>
                <select className="gc-input gc-select" aria-label="Sort">
                  <option>Best selling</option>
                  <option>Newest</option>
                  <option>Price, low to high</option>
                </select>
              </label>
            </div>
          </form>
        </__Sheet>

        <__Dialog open={v.addOpen} title="Add category" onClose={v.closeAdd} footer={<>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={v.closeAdd}>Cancel</button>
          <button type="submit" form="cat-add-form" className="gc-btn gc-btn--sm gc-btn--solid">Add category</button>
        </>}>
          <form id="cat-add-form" onSubmit={submitAdd} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div className="ct-field">
              <label className="gc-label" htmlFor="cat-add-name">Name <span aria-hidden="true" style={{ color: "var(--text-danger)" }}>*</span></label>
              <input id="cat-add-name" className={'gc-input' + (v.addErr ? ' gc-input--error' : '')} value={v.addName} onChange={v.typeAddName} placeholder="For example: Car chargers" aria-required="true" aria-invalid={v.addErr ? "true" : undefined} aria-describedby={v.addErr ? "cat-add-name-err" : undefined} />
              {v.addErr ? (<p id="cat-add-name-err" className="ct-err" role="alert">{v.addErr}</p>) : null}
            </div>
            <div className="ct-field">
              <div className="ct-lbl"><label className="gc-label" htmlFor="cat-add-parent">Inside</label><__InfoTip text="It takes the tax, extra fields and commission from the category it sits in." /></div>
              <select id="cat-add-parent" className="gc-input gc-select" value={v.addParent} onChange={v.setAddParent}>
                <option value="">Top level</option>
                {__list(v.parents).map((pc) => (<option key={pc.id} value={pc.id}>{pc.label}</option>))}
              </select>
            </div>
          </form>
        </__Dialog>

        <__Dialog open={v.impOpen} title="Import categories" onClose={v.closeImport} width={520} footer={<>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={v.closeImport}>Cancel</button>
          <button type="submit" form="cat-import-form" className="gc-btn gc-btn--sm gc-btn--solid">Import</button>
        </>}>
          <form id="cat-import-form" onSubmit={v.submitImport} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", fontSize: "var(--text-sm)", color: "var(--text-body)" }}>
            <p style={{ margin: 0 }}>Upload a CSV file with one category per row. The first row is the header. List a parent before the categories inside it.</p>
            <table className="ct-cols gc-table--keep">
              <thead><tr><th scope="col">Column</th><th scope="col">What goes in it</th></tr></thead>
              <tbody>
                <tr><td>name</td><td>Category name. Required.</td></tr>
                <tr><td>parent</td><td>Name of the category it sits inside. Leave empty for the top level.</td></tr>
                <tr><td>description</td><td>Text for the category page. Optional.</td></tr>
                <tr><td>show_in_menu</td><td>yes or no. Empty means yes.</td></tr>
              </tbody>
            </table>
            <div><button type="button" className="ix-btn ix-btn--sm" onClick={v.downloadTemplate}><__Icon name="download" width="16" height="16" aria-hidden="true" />Download a template</button></div>
            <div className="ct-field">
              <label className="gc-label" htmlFor="cat-import-file">CSV file <span aria-hidden="true" style={{ color: "var(--text-danger)" }}>*</span></label>
              <input id="cat-import-file" type="file" accept=".csv,text/csv" onChange={v.pickFile} aria-required="true" aria-invalid={v.impErr ? "true" : undefined} aria-describedby={v.impErr ? "cat-import-err" : "cat-import-help"} style={{ fontSize: "var(--text-sm)" }} />
              {v.impErr ? (<p id="cat-import-err" className="ct-err" role="alert">{v.impErr}</p>) : (<p id="cat-import-help" className="gc-help" style={{ margin: 0 }}>Categories that already exist are skipped, not duplicated.</p>)}
            </div>
          </form>
        </__Dialog>
      </div>
    );
  }
}
