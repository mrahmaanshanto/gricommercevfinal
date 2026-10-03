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
import { toast as __toast } from '@/runtime/ui';
import { TEMPLATES, tplBy, categoryDefaults, setCategoryTemplate, templateOfCategory, businessTemplate } from '@/lib/productTemplates';

// ---- logic (from the design's <script type="text/x-dc">) ----

function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { __toast(m, bad ? { tone: 'error' } : undefined); }
function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
var T = [
  { id: 'skin', name: 'Skin care', lv: 0, n: 64, kids: ['sun', 'ton', 'cle', 'ser'], tax: 'Standard VAT 15%', wp: 'No warranty', sg: 'No size guide', track: 'Expiry date', unit: 'Piece', comm: '12%' },
  { id: 'sun', name: 'Sunscreen', lv: 1, n: 12, p: 'skin' }, { id: 'ton', name: 'Toner', lv: 1, n: 9, p: 'skin' }, { id: 'cle', name: 'Cleanser', lv: 1, n: 14, p: 'skin' }, { id: 'ser', name: 'Serum', lv: 1, n: 11, p: 'skin', hidden: true },
  { id: 'clo', name: 'Clothing', lv: 0, n: 118, kids: ['men', 'wom'], tax: 'Standard VAT 15%', wp: 'No warranty', sg: 'Men’s shirts and polos', track: 'No tracking', unit: 'Piece', comm: '15%' },
  { id: 'men', name: 'Men', lv: 1, n: 52, p: 'clo', kids: ['polo', 'jean'] }, { id: 'polo', name: 'Polo shirts', lv: 2, n: 18, p: 'men' }, { id: 'jean', name: 'Jeans', lv: 2, n: 21, p: 'men' }, { id: 'wom', name: 'Women', lv: 1, n: 66, p: 'clo' },
  { id: 'ele', name: 'Electronics', lv: 0, n: 41, kids: ['ph', 'lap', 'aud'], tax: 'Standard VAT 15%', wp: '1 year official brand warranty', sg: 'No size guide', track: 'IMEI (phones)', unit: 'Piece', comm: '6%' },
  { id: 'ph', name: 'Phones', lv: 1, n: 18, p: 'ele' }, { id: 'lap', name: 'Laptops', lv: 1, n: 7, p: 'ele' }, { id: 'aud', name: 'Audio', lv: 1, n: 16, p: 'ele' },
  { id: 'gro', name: 'Grocery', lv: 0, n: 89, kids: [], tax: 'No VAT', wp: 'No warranty', sg: 'No size guide', track: 'Expiry date', unit: 'kg', comm: '8%' }
];
var BY = {}; T.forEach(function (t) { BY[t.id] = t; });
var FIELDS = { ele: [['RAM', 'dropdown', true], ['Network', 'dropdown', true], ['Display size', 'number', false], ['Battery', 'number', false], ['PTA approved', 'yes / no', true], ['Country of origin', 'text', false]], skin: [['Skin type', 'dropdown', true], ['Expiry date', 'date', true], ['Key ingredients', 'text', false], ['Volume', 'number', false], ['Country of origin', 'text', true]], clo: [['Material', 'text', true], ['Fit', 'dropdown', false], ['Care instructions', 'text', false]], gro: [['Weight', 'number', true], ['Expiry date', 'date', true]] };
// A category name: required, 2 to 60 letters, and not already used next to it.
function nameError(name, siblings) {
  var n = String(name || '').trim();
  if (!n) return 'Enter a category name.';
  if (n.length < 2) return 'Use at least 2 letters.';
  if (n.length > 60) return 'Keep the name under 60 letters.';
  if (siblings.some(function (x) { return x.toLowerCase() === n.toLowerCase(); })) return 'There is already a category called “' + n + '” here.';
  return '';
}
function focusId(id) { setTimeout(function () { var el = document.getElementById(id); if (el) el.focus(); }, 0); }
class Component extends DCLogic {
  // saved category templates are read after mount (localStorage), so the first render matches the server
  componentDidMount() { this.setState({ tplTick: 1 }); }
  renderVals() {
    var self = this, s = this.state || {}, open = s.open || { skin: true, clo: true, ele: true, men: false };
    var names = s.names || {}, all = T.concat(s.extra || []), by = {};
    all.forEach(function (t) { by[t.id] = t; });
    var nm = function (t) { return names[t.id] || t.name; };
    var kidsOf = function (id) { return all.filter(function (x) { return x.p === id; }); };
    var root = function (t) { while (t.p) t = by[t.p]; return t; };
    var sel = by[s.sel || 'ph'] || by.ph;
    // Keep the tree in parent-then-children order so added categories sit under their parent.
    var ordered = []; var walk = function (pid) { all.filter(function (x) { return (x.p || null) === pid; }).forEach(function (x) { ordered.push(x); walk(x.id); }); }; walk(null);
    var cq = (s.cq || '').trim().toLowerCase();
    var visible = cq ? ordered.filter(function (t) { return nm(t).toLowerCase().indexOf(cq) >= 0; })
      : ordered.filter(function (t) { var p = t.p; while (p) { if (!open[p]) return false; p = by[p].p; } return true; });
    var R = root(sel);
    var path = []; var q = sel.p; while (q) { path.unshift(nm(by[q])); q = by[q].p; }
    var name = s.name != null ? s.name : nm(sel);
    var sibNames = function (parentId, exceptId) { return all.filter(function (x) { return (x.p || null) === (parentId || null) && x.id !== exceptId; }).map(nm); };
    var add = s.add || null, imp = s.imp || null;
    var parents = ordered.filter(function (t) { return t.lv < 2; });
    return assign({
      rows: visible.map(function (t) { var on = t.id === sel.id, hk = kidsOf(t.id).length > 0, label = nm(t);
        return { name: label, n: t.n, pad: (10 + (cq ? 0 : t.lv) * 26) + 'px', hasKids: hk && !cq, leaf: !hk || !!cq, isOpen: !!open[t.id], rot: open[t.id] ? '90deg' : '0deg', initial: label.charAt(0), fw: t.lv ? 500 : 600, fg: on ? '#003087' : '#0f172a', bg: on ? 'rgba(0,48,135,.07)' : 'transparent', ibg: on ? '#003087' : (t.lv ? '#eef2f6' : '#e0f3fb'), ifg: on ? '#fff' : '#003087', hidden: !!t.hidden, on: on,
          fold: function () { var o = assign({}, open); o[t.id] = !open[t.id]; self.setState({ open: o }); }, pick: function () { self.setState({ sel: t.id, desc: null, name: null, nameErr: '', inMenu: null, featured: null }); } }; }),
      noRows: !visible.length, cq: s.cq || '', typeCq: function (e) { self.setState({ cq: e.target.value }); }, clearCq: function () { self.setState({ cq: '' }); },
      noRowsTitle: 'No category matches “' + (s.cq || '').trim() + '”',
      allLbl: Object.keys(open).some(function (k) { return open[k]; }) ? 'Close all' : 'Open all',
      toggleAll: function () { var any = Object.keys(open).some(function (k) { return open[k]; }); var o = {}; all.forEach(function (t) { if (kidsOf(t.id).length) o[t.id] = !any; }); self.setState({ open: o }); },
      // the category's product template (productTemplates.js): products in it get it unless they pick their own
      tplOwn: s.tplTick ? (categoryDefaults()[path.concat(nm(sel)).join(' › ')] || {}).template || '' : '',
      tplFrom: path.length ? tplBy(templateOfCategory(path[0])).name : tplBy(businessTemplate()).name,
      setTpl: function (e) { var pth = path.concat(nm(sel)).join(' › '); setCategoryTemplate(pth, e.target.value); self.setState({ tplTick: Date.now() }); toast(self, e.target.value ? 'New products in ' + nm(sel) + ' use ' + tplBy(e.target.value).name + '.' : nm(sel) + ' uses the template above it.'); },
      templates: TEMPLATES,
      sel: { id: sel.id, name: nm(sel), initial: nm(sel).charAt(0), n: sel.n, path: path.length ? path.join(' › ') + ' ›' : 'Top level', parent: path.length ? path[path.length - 1] : 'Top level', tax: R.tax || 'Standard VAT 15%', wp: R.wp || 'No warranty', sg: R.sg || 'No size guide', track: R.track || 'No tracking', unit: R.unit || 'Piece', comm: R.comm || '10%', slug: '/collections/' + nm(sel).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') },
      name: name, nameErr: s.nameErr || '', typeName: function (e) { self.setState({ name: e.target.value, nameErr: '' }); },
      desc: s.desc != null ? s.desc : '', typeDesc: function (e) { self.setState({ desc: e.target.value }); },
      aiDesc: function () { self.setState({ desc: 'Shop the latest ' + nm(sel).toLowerCase() + ' in Bangladesh — official products, honest prices and fast delivery all over the country.' }); },
      fields: (FIELDS[R.id] || []).map(function (f) { return { l: f[0], t: f[1], req: f[2] }; }),
      inMenu: mkSw(this, 'inMenu', !sel.hidden), featured: mkSw(this, 'featured', false),
      // ---- edit form ----
      save: function (e) {
        if (e && e.preventDefault) e.preventDefault();
        var err = nameError(name, sibNames(sel.p, sel.id));
        if (err) { self.setState({ nameErr: err }); focusId('cat-name'); return; }
        var n2 = assign({}, names); n2[sel.id] = name.trim();
        self.setState({ names: n2, name: null, nameErr: '' }); toast(self, name.trim() + ' saved.');
      },
      del: function () { toast(self, 'Move the ' + sel.n + ' products to another category first.', true); },
      // ---- add category dialog ----
      addOpen: !!add, addName: add ? add.name : '', addParent: add ? add.parent : '', addErr: add ? add.err || '' : '',
      parents: parents.map(function (t) { return { id: t.id, label: (t.lv ? '— ' : '') + nm(t) }; }),
      addCat: function () { self.setState({ add: { name: '', parent: sel.lv < 2 ? sel.id : (sel.p || ''), err: '' } }); },
      closeAdd: function () { self.setState({ add: null }); },
      typeAddName: function (e) { self.setState({ add: assign(assign({}, add), { name: e.target.value, err: '' }) }); },
      setAddParent: function (e) { self.setState({ add: assign(assign({}, add), { parent: e.target.value, err: '' }) }); },
      submitAdd: function (e) {
        if (e && e.preventDefault) e.preventDefault();
        var err = nameError(add.name, sibNames(add.parent || null, null));
        if (err) { self.setState({ add: assign(assign({}, add), { err: err }) }); focusId('cat-add-name'); return; }
        var par = add.parent ? by[add.parent] : null, id = 'new' + ((s.extra || []).length + 1);
        var item = { id: id, name: add.name.trim(), lv: par ? par.lv + 1 : 0, n: 0 }; if (par) item.p = par.id;
        var o = assign({}, open); if (par) { o[par.id] = true; var pp = par.p; while (pp) { o[pp] = true; pp = by[pp].p; } }
        self.setState({ extra: (s.extra || []).concat([item]), open: o, sel: id, add: null, cq: '', desc: null, name: null, nameErr: '', inMenu: null, featured: null });
        toast(self, item.name + ' added' + (par ? ' inside ' + nm(par) : ' at the top level') + '.');
      },
      // ---- import dialog ----
      impOpen: !!imp, impFile: imp ? imp.file || '' : '', impErr: imp ? imp.err || '' : '',
      openImport: function () { self.setState({ imp: { file: '', err: '' } }); }, closeImport: function () { self.setState({ imp: null }); },
      pickFile: function (e) { var fl = e.target.files && e.target.files[0]; self.setState({ imp: { file: fl ? fl.name : '', err: fl && !/\.csv$/i.test(fl.name) ? 'Choose a .csv file.' : '' } }); },
      submitImport: function (e) {
        if (e && e.preventDefault) e.preventDefault();
        if (!imp.file) { self.setState({ imp: { file: '', err: 'Choose a CSV file first.' } }); focusId('cat-import-file'); return; }
        if (!/\.csv$/i.test(imp.file)) { self.setState({ imp: { file: imp.file, err: 'Choose a .csv file.' } }); focusId('cat-import-file'); return; }
        self.setState({ imp: null }); toast(self, 'Importing categories from ' + imp.file + '. New ones appear in the tree when it finishes.');
      },
      downloadTemplate: function () {
        var csv = 'name,parent,description,show_in_menu\nSkin care,,Everyday skin care,yes\nSunscreen,Skin care,SPF 30 and above,yes\n';
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
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
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
              <span>{v.sel?.n} products</span>
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
                <select className="gc-input gc-select" aria-label="Parent category">
                  <option>{v.sel?.parent}</option>
                  <option>Top level</option>
                  <option>Skin care</option>
                  <option>Clothing</option>
                  <option>Electronics</option>
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
                  <option>Men’s shirts and polos</option>
                  <option>Women’s kurti</option>
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
              <input id="cat-add-name" className={'gc-input' + (v.addErr ? ' gc-input--error' : '')} value={v.addName} onChange={v.typeAddName} placeholder="For example: Face wash" aria-required="true" aria-invalid={v.addErr ? "true" : undefined} aria-describedby={v.addErr ? "cat-add-name-err" : undefined} />
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
