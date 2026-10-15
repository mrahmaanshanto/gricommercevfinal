'use client';
// All sections (`/store-showcase`): every part of the website on one page, drawn in one theme, to check them together.
// Sections are collected from the layouts of all eleven themes (Signal, Nokshi, Counter and the eight ready themes), one
// example per look, with the themes that use it; a look no theme uses yet is added with sample content. Then every header
// of every theme, the product card styles, the product page and checkout styles (one at a time, with a switch) and every
// footer. The switch at the top redraws the page in another theme (`?preview=1&preset=<id>`); without it, the shop's own.
// Not listed in search (noindex) and not in the website's menus; Online Store › Theme links here.

import React, { useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { StoreChrome, Footer, CheckoutPop } from './storeChrome';
import { StoreHeader } from './storeHeader';
import { Sections, ProductList } from './sections';
import { ProductMain, PRODUCT_CSS } from './StoreProduct';
import { CheckoutBody } from './Checkout';
import { STARTER, lookPatch } from './sectionStarters';
import { PRESETS, presetBy, seedData, STORE_IMAGES } from '@/lib/storefront/presets';
import { getBlocks } from '@/lib/storefront/blocks';
import { SECTION_TYPES, LIB_GROUPS, groupOf, newSection, variantOf, sectionType, CARD_STYLES } from '@/lib/storefront/layouts';
import { optionBy } from '@/lib/storefront/theme';
import { previewPreset } from '@/lib/storefront/store';
import { storeProducts } from '@/lib/storefront/catalog';
import { CHECKOUT_OPEN_EVENT } from '@/lib/storefront/cart';
import { allProducts } from '@/lib/products';
import { contextOf } from '@/lib/seoItems';

const HEAD = { title: 'All sections', description: '', robots: 'noindex, nofollow', canonical: '', og: {}, jsonld: [] };
const choicesOf = (key) => ((optionBy(key) || {}).choices || []).map((c) => [c.value, c.label]);
const PRODUCT_LAYOUTS = ((sectionType('products').fields.find((f) => f[0] === 'layout') || [])[4]) || [['grid', 'Grid']];
const looksOf = (t) => (t.styles ? t.styles.map((x) => [x.id, x.label]) : t.type === 'products' ? PRODUCT_LAYOUTS : [['', '']]);
const keyOf = (s) => { const t = sectionType(s.type); return s.type + ':' + (t && t.styles ? variantOf(s) : s.type === 'products' ? s.layout || 'grid' : ''); };

/** Every section in every theme's layouts, one per look, plus the looks no theme uses (sample content). */
function collect() {
  const now = Date.now();
  const found = new Map();
  PRESETS.forEach((p) => {
    let data = null;
    try { data = seedData(now, p.id); } catch { data = null; }
    ((data && data.layouts) || []).forEach((l) => {
      const doc = (l.doc && (l.doc.live || l.doc.draft)) || {};
      (doc.sections || []).forEach((s) => {
        if (!s || s.type === 'main' || s.hidden || !sectionType(s.type)) return;
        const k = keyOf(s);
        const f = found.get(k);
        if (f) { if (!f.themes.includes(p.name)) f.themes.push(p.name); } else found.set(k, { s, themes: [p.name] });
      });
    });
  });
  SECTION_TYPES.forEach((t) => {
    looksOf(t).forEach(([look]) => {
      const k = t.type + ':' + look;
      if (found.has(k)) return;
      // borrow the content of the same kind of section from a theme, else the kind's sample content
      const sib = [...found.values()].find((f) => f.s.type === t.type);
      let s = sib ? { ...sib.s } : newSection(t.type, STARTER[t.type] ? STARTER[t.type]() : {});
      if (t.styles) s = { ...s, variant: look, ...lookPatch(s, look) };
      if (t.type === 'products') s = { ...s, layout: look };
      found.set(k, { s, themes: [] });
    });
  });
  // what would draw nothing here: a block from another theme (take this theme's), a channel with no video links (sample tiles)
  const html = found.get('html:');
  if (html) { const b = getBlocks()[0]; html.s = { ...html.s, block: b ? b.id : '' }; }
  const yt = found.get('ytfeed:grid');
  if (yt && !(yt.s.items || []).length) {
    yt.s = { ...yt.s, items: ['Unboxing the new earbuds', 'Best power banks for load-shedding', 'Smart watch: one week later', 'Five phone accessories under ৳1,000']
      .map((title, i) => ({ id: 'yt' + i, title, thumb: (STORE_IMAGES[i % STORE_IMAGES.length] || {}).src || '', url: '#', date: ['2 days ago', '1 week ago', '2 weeks ago', '1 month ago'][i] })) };
  }
  // the library's order: group, kind, look
  const out = [];
  LIB_GROUPS.forEach((g) => {
    SECTION_TYPES.filter((t) => groupOf(t) === g.id).forEach((t) => {
      looksOf(t).forEach(([look, label]) => {
        const f = found.get(t.type + ':' + look);
        if (f) out.push({ key: t.type + ':' + look, group: g.id, type: t, look: label, s: { ...f.s, id: 'sc-' + t.type + '-' + (look || 'one'), hidden: false }, themes: f.themes });
      });
    });
  });
  return out;
}

/** Every header of every theme, with the theme's logo. */
function allHeaders() {
  const now = Date.now();
  const out = [];
  PRESETS.forEach((p) => {
    let data = null;
    try { data = seedData(now, p.id); } catch { data = null; }
    ((data && data.headers) || []).forEach((h) => {
      const H = h.doc && (h.doc.live || h.doc.draft);
      if (H) out.push({ id: h.id, name: h.name, theme: p.name, H, logo: p.logo ? { src: p.logo, light: p.logoLight || p.logo, name: p.name } : null });
    });
  });
  return out;
}

function Label({ id, title, look, themes, note }) {
  return (
    <div className="scx-label" id={id}>
      <b>{title}</b>{look ? <span>{look}</span> : null}
      {themes ? <small>{themes.length ? 'In ' + themes.join(', ') : 'Not in a theme yet'}</small> : null}
      {note ? <small>{note}</small> : null}
    </div>
  );
}

function Seg({ value, options, onChange, label }) {
  return (
    <div className="scx-seg" role="group" aria-label={label}>
      {options.map(([v, l]) => <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>{l}</button>)}
    </div>
  );
}

function Body({ shell }) {
  const v = shell.values;
  const sections = useMemo(collect, []);
  const headers = useMemo(allHeaders, []);
  const sample = useMemo(() => {
    const list = allProducts();
    return list.find((p) => p.id === 'p-smart-watch') || list.find((p) => (p.media || []).length) || list[0];
  }, []);
  const pctx = useMemo(() => {
    if (!sample) return null;
    const c = contextOf('product', sample) || {};
    return { ...c, product: { ...(c.product || {}), isNew: ((storeProducts().find((x) => x.id === sample.id)) || {}).isNew } };
  }, [sample]);
  const cards = useMemo(() => storeProducts().filter((p) => p.img).slice(0, 4), []);
  const [ps, setPs] = useState(v.productStyle || 'standard');
  const [ds, setDs] = useState(v.detailsStyle || 'tabs');
  const [cs, setCs] = useState(v.checkoutStyle || 'classic');
  const pp = previewPreset();
  const ctx = (logo) => ({ values: v, menus: shell.menus, cats: shell.cats, count: shell.count, total: shell.total, shop: shell.shop, general: shell.general, catalog: shell.catalog, current: '', preview: shell.preview, kind: 'showcase', logo, openDrawer: () => {} });
  const sctx = { product: sample ? { id: sample.id, cat: sample.cat, brand: sample.brand } : null };
  const groups = LIB_GROUPS.filter((g) => sections.some((x) => x.group === g.id));
  const pick = (id) => { window.location.href = '/store-showcase' + (id ? '?preview=1&preset=' + id : ''); };
  const nav = [['sc-headers', 'Headers'], ...groups.map((g) => ['sc-g-' + g.id, g.label]), ['sc-cards', 'Product cards'], ['sc-product', 'Product page'], ['sc-checkout', 'Checkout'], ['sc-footers', 'Footers']];

  return (
    <div className="scx">
      <style dangerouslySetInnerHTML={{ __html: PRODUCT_CSS + SCX_CSS }} />
      <div className="scx-bar">
        <div className="sf-wrap scx-bar__in">
          <div className="scx-intro">
            <h1>All sections</h1>
            <p>{sections.length} sections, {headers.length} headers, {CARD_STYLES.length - 1} product cards, {choicesOf('productStyle').length} product pages, {choicesOf('checkoutStyle').length} checkouts and {choicesOf('footerLayout').length} footers from {PRESETS.length} themes, in one theme.</p>
          </div>
          <label className="scx-theme">
            <span>Theme</span>
            <select value={pp} onChange={(e) => pick(e.target.value)}>
              <option value="">Your published theme</option>
              {PRESETS.map((p) => <option key={p.id} value={p.id}>{p.name}{p.pack ? ' · ' + (p.label || 'ready theme') : ' · ' + p.label}</option>)}
            </select>
          </label>
        </div>
        <nav className="sf-wrap scx-nav" aria-label="Parts of the page">{nav.map(([id, l]) => <a key={id} href={'#' + id}>{l}</a>)}</nav>
      </div>

      <h2 className="scx-h sf-wrap" id="sc-headers">Headers <small>{headers.length}</small></h2>
      {headers.map((h) => (
        <div key={h.id} className="scx-block">
          <Label title={h.name} themes={[h.theme]} />
          <div className="scx-hdr"><StoreHeader H={h.H} ctx={ctx(h.logo)} /></div>
        </div>
      ))}

      {groups.map((g) => (
        <React.Fragment key={g.id}>
          <h2 className="scx-h sf-wrap" id={'sc-g-' + g.id}>{g.label} <small>{sections.filter((x) => x.group === g.id).length}</small></h2>
          {sections.filter((x) => x.group === g.id).map((x) => (
            <div key={x.key} className="scx-block">
              <Label id={'sc-' + x.key.replace(':', '-')} title={x.type.label} look={x.look} themes={x.themes} />
              <Sections sections={[x.s]} values={v} catalog={shell.catalog} ctx={sctx} />
            </div>
          ))}
        </React.Fragment>
      ))}

      <h2 className="scx-h sf-wrap" id="sc-cards">Product cards <small>{CARD_STYLES.length - 1}</small></h2>
      {CARD_STYLES.filter(([id]) => id).map(([id, label]) => (
        <div key={id} className="scx-block">
          <Label title="Product card" look={label} note={v.cardStyle === id ? 'This theme’s card' : ''} />
          <div className="sf-wrap scx-pad"><ProductList list={cards} v={v} layout="grid" card={id} /></div>
        </div>
      ))}

      <h2 className="scx-h sf-wrap" id="sc-product">Product page <small>{choicesOf('productStyle').length} buy boxes · {choicesOf('detailsStyle').length} details</small></h2>
      <div className="sf-wrap scx-pad">
        <div className="scx-switch">
          <Seg label="Buy box style" value={ps} options={choicesOf('productStyle').map(([id, l]) => [id, l.split(':')[0].split(',')[0]])} onChange={setPs} />
          <Seg label="Details" value={ds} options={choicesOf('detailsStyle')} onChange={setDs} />
        </div>
        {sample && pctx ? <ProductMain key={ps + ds} p={sample} ctx={pctx} v={{ ...v, productStyle: ps, detailsStyle: ds }} general={shell.general} /> : null}
      </div>

      <h2 className="scx-h sf-wrap" id="sc-checkout">Checkout <small>{choicesOf('checkoutStyle').length}</small></h2>
      <div className="sf-wrap scx-pad">
        <div className="scx-switch">
          <Seg label="Checkout style" value={cs} options={choicesOf('checkoutStyle').map(([id, l]) => [id, l.split(',')[0].split(' (')[0]])} onChange={setCs} />
          <button type="button" className="sf-btn sf-btn--line" onClick={() => window.dispatchEvent(new CustomEvent(CHECKOUT_OPEN_EVENT))}><Icon name="app-window" width="16" height="16" aria-hidden="true" />Open as a pop-up</button>
        </div>
        <div className="scx-frame"><CheckoutBody key={cs} popup cs={cs} bump /></div>
      </div>
      {v.checkoutMode === 'popup' ? null : <CheckoutPop />}

      <h2 className="scx-h sf-wrap" id="sc-footers">Footers <small>{choicesOf('footerLayout').length}</small></h2>
      {choicesOf('footerLayout').map(([id, label]) => (
        <div key={id} className="scx-block scx-foot">
          <Label title="Footer" look={label} note={(v.footerLayout || 'columns') === id ? 'This theme’s footer' : ''} />
          <Footer st={{ ...shell, values: { ...v, footerLayout: id }, logo: shellLogo(pp, v) }} />
        </div>
      ))}
    </div>
  );
}

/** The logo the page's own header shows (a ready theme's in a preview, else the shop's upload). */
function shellLogo(pp, v) {
  const pre = pp ? presetBy(pp) : null;
  if (pre && pre.logo) return { src: pre.logo, light: pre.logoLight || pre.logo, name: pre.name };
  return v.logoImage ? { src: v.logoImage, light: v.logoLight || v.logoImage } : null;
}

export default function StoreShowcase() {
  return (
    <StoreChrome screen="StoreShowcase" kind="showcase" head={HEAD}>
      {(shell) => <Body shell={shell} />}
    </StoreChrome>
  );
}

const SCX_CSS = `
.scx{padding-bottom:48px}
.scx-bar{background:#fff;border-bottom:1px solid #e2e8f0;box-shadow:0 2px 8px rgba(15,23,42,.05)}
.scx-bar__in{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;padding-top:14px;padding-bottom:10px}
.scx .scx-intro h1{margin:0;font-size:var(--text-xl);font-weight:var(--weight-semibold);color:#0f172a}
.scx-intro p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.scx-theme{display:flex;align-items:center;gap:8px;min-width:0;max-width:100%;font-size:var(--text-sm);color:#334155}
.scx-theme select{min-width:0;max-width:100%;height:36px;padding:0 10px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);background:#fff;font:inherit;color:#0f172a}
.scx-nav{display:flex;gap:6px;overflow-x:auto;padding-bottom:10px;scrollbar-width:none}
.scx-nav a{flex:none;padding:6px 12px;border-radius:var(--radius-full);background:#f1f5f9;color:#334155;font-size:var(--text-xs);font-weight:var(--weight-medium);text-decoration:none;white-space:nowrap}
.scx-nav a:hover{background:#e2e8f0}
.scx .scx-h{display:flex;align-items:baseline;gap:8px;margin:40px auto 4px;font-size:var(--text-xl);font-weight:var(--weight-semibold);color:#0f172a;scroll-margin-top:120px}
.scx-h small{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.scx-block{border-top:1px dashed #cbd5e1;margin-top:20px}
.scx-label{display:flex;flex-wrap:wrap;align-items:center;gap:8px;max-width:var(--sf-width,1200px);margin:0 auto;padding:10px 24px 4px;font-family:var(--font-sans);font-size:var(--text-xs);color:#475569;scroll-margin-top:120px}
.scx-label b{color:#0f172a;font-weight:var(--weight-semibold)}
.scx-label span{padding:2px 8px;border-radius:var(--radius-full);background:#eef2ff;color:#3730a3;font-weight:var(--weight-medium)}
.scx-label small{color:var(--text-muted);font-size:var(--text-xs)}
.scx-hdr{position:relative;margin-top:6px}
.scx-hdr .sfh-row.is-sticky{position:relative!important;top:auto!important}
.scx-pad{padding-top:12px;padding-bottom:12px}
.scx-switch{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:16px}
.scx-seg{display:flex;flex-wrap:wrap;gap:6px}
.scx-seg button{min-height:36px;padding:0 12px;border:1px solid #cbd5e1;border-radius:var(--radius-full);background:#fff;color:#334155;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);cursor:pointer}
.scx-seg button[aria-pressed="true"]{border-color:var(--sf-primary);background:var(--sf-primary);color:var(--sf-on-primary)}
.scx-frame{border:1px solid #e2e8f0;border-radius:var(--radius-xl);background:var(--sf-bg);overflow:hidden}
.scx-foot .sff{margin-top:6px}
.scx .spd-sticky{display:none!important}
@media (max-width:640px){.scx-theme{width:100%}.scx-theme select{flex:1;height:44px}.scx-label{padding-left:16px;padding-right:16px}}
`;
