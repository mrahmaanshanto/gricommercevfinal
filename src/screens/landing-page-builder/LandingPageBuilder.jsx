'use client';
// Generated from design/templates/landing-page-builder/LandingPageBuilder.dc.html by scripts/convert-design.mjs.
// LandingPageBuilder — Single-product landing page builder — product picker, section library, drag-and-drop canvas with live mobile preview, per-field AI copy generation, COD order form settings and the publish checklist.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { toast as __toast, confirmDialog as __confirm } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { allProducts } from '@/lib/products';
import { summaryOf } from '@/lib/productReviews';
import { formatBDT, formatTime, toBnDigits } from '@/lib/format';
import { getLandingPage, getLandingPages, newLandingPage, saveLandingPage, publishLandingPage, handleProblem, uniqueHandle, slugify, LP_BASE } from '@/lib/landingPages';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import { Sheet as __Sheet } from '@/components/ui';
import SeoPanel, { SEO_PANEL_CSS } from '@/components/seo/SeoPanel';
import { readSeo, dhakaText } from '@/lib/seo';
import { contextOf } from '@/lib/seoItems';

// ---- logic ----
// The builder works on one landing page of the list (lib/landingPages.js): /landing-page-builder starts a new one
// (step 1 picks any active product of the catalogue, step 2 a template); /landing-page-builder?id= opens a saved page.
// The page fills itself from the product (name, price and old price, variants, stock, reviews). Save keeps it as a
// draft (or saves a published page's changes); Publish checks the link and puts it on the website.
// Still a design mock-up (Oct 2026): the part library, drag and drop, the part settings and the AI writer are not
// working yet; their buttons say so.

const tk = (n) => formatBDT(Math.round(n || 0));
const initials = (s) => String(s || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const DELIVERY = { in: 70, out: 150 };
function productFacts(p, reviews) {
  if (!p) return null;
  const was = p.mrp && p.mrp > p.price ? p.mrp : null;
  const pct = was ? Math.round(((was - p.price) / was) * 100) : 0;
  const variants = (p.variants || []).map((x) => x.name).filter(Boolean);
  const stock = (p.variants || []).length ? p.variants.reduce((a, x) => a + (Number(x.stock) || 0), 0) : Number(p.inv) || 0;
  const r = reviews || { count: 0, avg: 0 };
  return {
    id: p.id, sku: p.sku, name: p.name, price: p.price, was, pct, save: was ? was - p.price : 0, variants, stock,
    photos: (p.media || p.images || []).length, reviews: r,
    reviewText: r.count ? `${r.count} review${r.count === 1 ? '' : 's'} · ${r.avg.toFixed(1)} ★` : 'no reviews yet',
  };
}
class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { screen: 'pick', device: props.device === 'desktop' ? 'desktop' : 'mobile', ai: props.aiPanel === true, products: [], ready: false, q: '', filter: 'all', selId: '', template: 'cod', page: null, handle: '', savedAt: null, dirty: false };
  }
  componentDidMount() {
    this.paint();
    const products = allProducts().filter((p) => p.st === 'active' && p.price > 0 && (!p.format || p.format === 'physical') && !p.giftOnly);
    const qs = new URLSearchParams(window.location.search);
    const page = qs.get('id') ? getLandingPage(qs.get('id')) : null;
    const want = page ? page.productId || '' : qs.get('product') || '';
    const pick = products.find((p) => p.id === want || (page && p.sku === page.sku)) || products[0] || null;
    const reviews = {};
    products.forEach((p) => { reviews[p.id] = summaryOf(p); });
    const pages = {};
    getLandingPages().forEach((x) => { pages[x.sku] = (pages[x.sku] || 0) + 1; });
    this.setState({ products, reviews, pages, ready: true, selId: pick ? pick.id : '', page, template: page ? page.template : 'cod', handle: page ? page.handle : '', savedAt: page ? page.updatedAt : null, screen: page ? 'build' : 'pick', missing: !!qs.get('id') && !page });
  }
  componentDidUpdate() { this.paint(); }
  paint() {
    const go = () => { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ attrs: { width: 20, height: 20, 'stroke-width': 1.75 } }); };
    go(); setTimeout(go, 400); setTimeout(go, 1200);
  }
  current() {
    const s = this.state;
    return s.products.find((p) => p.id === s.selId) || null;
  }
  /** The page as it would be saved now (a new one is made from the product and the template). */
  draft() {
    const s = this.state;
    const p = this.current();
    const base = s.page || newLandingPage({ product: p || { name: 'Landing page' }, template: s.template });
    return { ...base, productId: p ? p.id : base.productId, sku: p ? p.sku : base.sku, productName: p ? p.name : base.productName, title: s.page ? base.title : (p ? p.name : base.title), template: s.template, handle: s.handle || base.handle,
      // SEO (the shared panel, opened from the header's SEO button): kept with the page
      seo: s.seo || base.seo || undefined, goLiveAt: s.goLiveAt !== undefined ? s.goLiveAt || null : base.goLiveAt || null };
  }
  save(quiet) {
    const rec = saveLandingPage(this.draft());
    this.setState({ page: rec, handle: rec.handle, savedAt: rec.updatedAt, dirty: false });
    try { window.history.replaceState(null, '', '/landing-page-builder?id=' + rec.id); } catch (e) { /* ignore */ }
    if (!quiet) __toast(rec.status === 'published' ? 'Changes saved. The live page shows them now.' : 'Saved as a draft. It is in Landing pages.');
    return rec;
  }
  renderVals() {
    const s = this.state;
    const self = this;
    const p = this.current();
    const f = productFacts(p, p ? (s.reviews || {})[p.id] : null) || { name: '—', price: 0, was: null, pct: 0, save: 0, variants: [], stock: 0, photos: 0, reviews: { count: 0 }, reviewText: '' };
    const q = s.q.trim().toLowerCase();
    const rows = s.products.filter((x) => (!q || [x.name, x.sku, x.brand, x.cat].some((t) => String(t || '').toLowerCase().includes(q)))
      && (s.filter !== 'stock' || (x.inv || 0) > 0) && (s.filter !== 'nopage' || !(s.pages || {})[x.sku]));
    const draft = s.ready ? this.draft() : null;
    const status = s.page ? s.page.status : 'draft';
    const handle = s.handle || (draft ? draft.handle : '');
    const problem = s.ready ? handleProblem(handle, draft ? draft.id : '') : '';
    const checks = [];
    if (p && f.stock <= 0) checks.push({ text: `${f.name} is out of stock. Buyers can still order; you'll need stock to send them.`, act: { label: 'Edit product', href: '/add-product?id=' + encodeURIComponent(p.id) } });
    else if (p && f.stock < 10) checks.push({ text: `Only ${f.stock} in stock. The page shows it as running out.`, act: null });
    if (p && !f.reviews.count) checks.push({ text: 'No published reviews yet: the reviews part stays hidden.', act: { label: 'Reviews', href: '/product-reviews' } });
    if (p && !f.was) checks.push({ text: 'No old price: the page shows no saving.', act: { label: 'Edit product', href: '/add-product?id=' + encodeURIComponent(p.id) } });
    const savedLine = s.savedAt ? 'Saved ' + formatTime(s.savedAt) : 'Not saved yet';
    const offerEn = f.was ? `${f.pct}% off — save ${tk(f.save)} today` : 'Cash on delivery all over Bangladesh';
    const offerBn = f.was ? toBnDigits(`${f.pct}% ছাড় — আজকের অর্ডারে ৳${f.save.toLocaleString('en-IN')} সেভ`) : 'সারা বাংলাদেশে ক্যাশ অন ডেলিভারি';
    const comingSoon = (what) => () => __toast(what + ' is not working yet in this demo.', { tone: 'info' });
    return {
      ready: s.ready, missing: !!s.missing,
      isPick: s.screen === 'pick',
      isBuild: s.screen === 'build' || s.screen === 'publish',
      isPublish: s.screen === 'publish',
      isMobile: s.device !== 'desktop',
      isDesktop: s.device === 'desktop',
      aiOpen: s.ai === true,
      aiClosed: s.ai !== true,
      // step 1: the catalogue
      q: s.q, setQ: (e) => this.setState({ q: e.target.value }),
      filter: s.filter, setFilter: (k) => () => this.setState({ filter: k }),
      catalogCount: s.products.length + (s.products.length === 1 ? ' active product' : ' active products'),
      productRows: rows.slice(0, 40).map((x) => {
        const xf = productFacts(x, (s.reviews || {})[x.id]);
        const n = (s.pages || {})[x.sku] || 0;
        return {
          id: x.id, on: x.id === s.selId, name: x.name, initials: initials(x.name), bg: x.tbg || '#eef2f6',
          meta: [tk(x.price) + (xf.was ? ' · was ' + tk(xf.was) : ''), x.vars, xf.stock + ' in stock', xf.reviewText].filter(Boolean).join(' · '),
          badge: xf.stock <= 0 ? 'Out of stock' : xf.stock < 10 ? 'Low stock' : n ? n + (n === 1 ? ' page' : ' pages') : '',
          tone: xf.stock <= 0 ? 'bad' : xf.stock < 10 ? 'warn' : 'plain',
          pick: () => this.setState({ selId: x.id, dirty: !!s.page }),
        };
      }),
      moreRows: rows.length > 40 ? `${rows.length - 40} more — search to narrow the list` : '',
      noRows: s.ready && !rows.length,
      // the chosen product, as the page uses it
      f, pName: f.name, pPrice: tk(f.price), pWas: f.was ? tk(f.was) : '', hasWas: !!f.was, pPct: f.pct + '% off',
      pPriceLine: tk(f.price) + (f.was ? ', was ' + tk(f.was) : ''), pOfferLine: f.was ? f.pct + '% off' : 'No discount',
      pVariantsLine: f.variants.length ? f.variants.length + (f.variants.length === 1 ? ' option' : ' options') : 'One option',
      pStockLine: f.stock + ' in stock', pPhotosLine: f.photos ? f.photos + (f.photos === 1 ? ' photo' : ' photos') : 'Photos',
      pChips: (f.variants.length ? f.variants : ['Standard']).slice(0, 3),
      pStockBn: toBnDigits(`স্টক শেষ হয়ে যাচ্ছে — ${f.stock}টি বাকি`), showStockBn: f.stock > 0 && f.stock < 50,
      pTotal: tk(f.price + DELIVERY.in), pDeliveryIn: tk(DELIVERY.in), pDeliveryOut: tk(DELIVERY.out),
      pOfferBn: offerBn, pOfferEn: offerEn, pTaglineBn: 'অরিজিনাল পণ্য, অফিসিয়াল ওয়ারেন্টি সহ',
      pUsing: `Using your product: ${f.name} · ${tk(f.price)}${f.was ? ' · ' + f.pct + '% off' : ''} · ${f.variants.length || 1} option${f.variants.length > 1 ? 's' : ''} · ${f.stock} in stock · ${f.reviewText}`,
      pSuggest: [offerBn, toBnDigits(`${f.name} — মাত্র ${tk(f.price)}`), offerEn],
      editProductHref: p ? '/add-product?id=' + encodeURIComponent(p.id) : '/all-products',
      // header
      pageTitle: (s.page ? s.page.title : f.name) + ' — landing page', pageLink: LP_BASE + handle, host: LP_BASE.replace(/\/lp\/$/, ''),
      statusLabel: status === 'published' ? 'Published' : draft && draft.goLiveAt ? 'Goes live ' + dhakaText(draft.goLiveAt) : 'Draft', isLive: status === 'published', savedLine, dirty: s.dirty,
      seoOpen: !!s.seoOpen, openSeo: () => this.setState({ seoOpen: true }), closeSeo: () => this.setState({ seoOpen: false }),
      seo: draft ? readSeo('landing', draft) : null, seoCtx: draft ? contextOf('landing', draft) : {},
      setSeo: (patch) => this.setState({ seo: { ...readSeo('landing', this.draft()), ...patch }, dirty: true }),
      seoSchedule: status === 'published' ? null : { at: draft ? draft.goLiveAt || '' : '', label: 'Publish on', onChange: (at) => this.setState({ goLiveAt: at || null, dirty: true }) },
      saveSeo: () => { this.save(true); this.setState({ seoOpen: false }); __toast('Search engine listing saved.'); },
      startBuild: () => { if (!p) { __toast('Pick a product first.', { tone: 'error' }); return; } this.setState({ screen: 'build', handle: s.handle || uniqueHandle(p.name, s.page ? s.page.id : '') }); },
      pickTemplate: (id) => () => { if (!p) { __toast('Pick a product first.', { tone: 'error' }); return; } this.setState({ template: id, screen: 'build', dirty: true, handle: s.handle || uniqueHandle(p.name, s.page ? s.page.id : '') }); },
      template: s.template,
      backToPick: () => this.setState({ screen: 'pick' }),
      backToList: async () => {
        if (s.dirty || (!s.page && s.screen !== 'pick')) {
          const ok = await __confirm({ title: 'Leave without saving?', body: 'Your changes to this page are not saved.', confirmLabel: 'Leave', tone: 'danger' });
          if (!ok) return;
        }
        navigate('/landing-pages');
      },
      save: () => this.save(false),
      openPublish: () => this.setState({ screen: 'publish' }),
      closePublish: () => this.setState({ screen: 'build' }),
      handle, setHandle: (e) => this.setState({ handle: slugify(e.target.value) || e.target.value.toLowerCase(), dirty: true }),
      linkProblem: problem, canPublish: !!p && !problem, checks, hasChecks: checks.length > 0,
      publishTitle: status === 'published' ? 'Update the live page' : 'Publish this page',
      publishSub: problem ? 'One thing must be fixed first' : status === 'published' ? 'It is live at ' + LP_BASE + handle : 'Ready to go live',
      publish: () => {
        if (problem) { __toast(problem, { tone: 'error' }); return; }
        const rec = self.save(true);
        const res = publishLandingPage(rec.id);
        if (res && res.error) { __toast(res.error, { tone: 'error' }); return; }
        this.setState({ page: res, screen: 'build', dirty: false, savedAt: res.updatedAt });
        __toast(rec.status === 'published' ? 'Live page updated' : 'Page published at ' + LP_BASE + res.handle);
      },
      checkPhone: () => { this.setState({ screen: 'build', device: 'mobile' }); __toast('This is the phone view of the page. Opening it on your own phone needs the live website.', { tone: 'info' }); },
      openOnPhone: () => { this.setState({ device: 'mobile' }); __toast('Opening on your phone needs the live website. The phone view is shown here.', { tone: 'info' }); },
      soon: comingSoon,
      openAiField: () => this.setState({ ai: true }),
      openAiPage: () => this.setState({ screen: 'build', ai: true }),
      closeAi: () => this.setState({ ai: false }),
      setMobile: () => this.setState({ device: 'mobile' }),
      setDesktop: () => this.setState({ device: 'desktop' }),
      selHeroFn: () => this.setState({ ai: false }),
      selPriceFn: () => this.setState({ ai: false }),
      selDeliveryFn: () => this.setState({ ai: false }),
      selFormFn: () => this.setState({ ai: false })
    };
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `body{margin:0;background:#eef2f7;font-family:var(--font-sans);color:#475569}a{color:#003087;text-decoration:none}a:hover{color:#002a77}input,select,textarea,button{font-family:inherit}::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:var(--radius-full)}.bn{font-family:var(--font-bn)}
.dc-h15:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h16:hover{background:#dde5ef !important}
.dc-h17:hover{background:#dde5ef !important}
.dc-h18:hover{background:#dde5ef !important}
.dc-h19:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h20:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h21:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h22:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h23:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h24:hover{border-color:#94a3b8 !important;background:#f8fafc !important}
.dc-h25:hover{background:#002a77 !important}
.dc-h26:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h27:hover{background:rgba(203,213,225,.2) !important}
.dc-h28:hover{background:rgba(0,156,222,.22) !important}
.dc-h29:hover{background:rgba(0,48,135,.2) !important}
.dc-h30:hover{background:#002a77 !important}
.dc-h31:hover{background:#dde5ef !important}
.dc-h32:hover{background:#dde5ef !important}
.dc-h33:hover{background:#dde5ef !important}
.dc-h34:hover{background:#dde5ef !important}
.dc-h35:hover{background:#dde5ef !important}
.dc-h36:hover{background:#dde5ef !important}
.dc-h37:hover{border-color:#e2e8f0 !important;background:#f8fafc !important}
.dc-h38:hover{border-color:#e2e8f0 !important;background:#f8fafc !important}
.dc-h39:hover{border-color:#e2e8f0 !important;background:#f8fafc !important}
.dc-h40:hover{border-color:#e2e8f0 !important;background:#f8fafc !important}
.dc-h41:hover{border-color:#e2e8f0 !important;background:#f8fafc !important}
.dc-h42:hover{border-color:#e2e8f0 !important;background:#f8fafc !important}
.dc-h43:hover{border-color:#e2e8f0 !important;background:#f8fafc !important}
.dc-h44:hover{border-color:#e2e8f0 !important;background:#f8fafc !important}
.dc-h45:hover{border-color:#e2e8f0 !important;background:#f8fafc !important}
.dc-h46:hover{border-color:#e2e8f0 !important;background:#f8fafc !important}
.dc-h47:hover{border-color:#e2e8f0 !important;background:#f8fafc !important}
.dc-h48:hover{border-color:#cbd5e1 !important}
.dc-h49:hover{border-color:#cbd5e1 !important}
.dc-h50:hover{border-color:#cbd5e1 !important}
.dc-h51:hover{border-color:#cbd5e1 !important}
.dc-h52:hover{border-color:#cbd5e1 !important}
.dc-h53:hover{border-color:#cbd5e1 !important}
.dc-h54:hover{border-color:#cbd5e1 !important}
.dc-h55:hover{border-color:#94a3b8 !important}
.dc-h56:hover{border-color:#cbd5e1 !important}
.dc-h57:hover{border-color:#cbd5e1 !important}
.dc-h58:hover{border-color:#003087 !important;color:#003087 !important}
.dc-h59:hover{border-color:#009cde !important}
.dc-h60:hover{border-color:#009cde !important}
.dc-h61:hover{border-color:#009cde !important}
.dc-h62:hover{border-color:#009cde !important}
.dc-h63:hover{background:rgba(0,156,222,.22) !important}
.dc-h64:hover{background:#dde5ef !important}
.dc-h65:hover{background:var(--accent-fill) !important;color:#fff !important}
.dc-h66:hover{background:var(--accent-fill) !important;color:#fff !important}
.dc-h67:hover{background:#dde5ef !important}
.dc-h68:hover{background:#dde5ef !important}
.dc-h69:hover{background:#dde5ef !important}
.dc-h70:hover{background:rgba(255,87,36,.2) !important}
.dc-h71:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h72:hover{background:#dde5ef !important}
.dc-h73:hover{background:#dde5ef !important}
.dc-h74:hover{background:#dde5ef !important}
.dc-h75:hover{background:#dde5ef !important}
.dc-h76:hover{background:#dde5ef !important}
.dc-h77:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h78:hover{border-color:#cbd5e1 !important;background:#f8fafc !important}
.dc-h79:hover{background:#002a77 !important}
.dc-h80:hover{background:#dde5ef !important}
.dc-h81:hover{background:#f1f5f9 !important}
.dc-h82:hover{background:rgba(203,213,225,.2) !important;color:#475569 !important}
.dc-h83:hover{background:rgba(255,255,255,.6) !important}
.dc-h84:hover{background:rgba(255,255,255,.6) !important}
.dc-h85:hover{background:rgba(0,156,222,.22) !important}
.dc-h86:hover{background:#dde5ef !important}
.dc-h87:hover{background:#002a77 !important}
.dc-h88:hover{background:rgba(0,48,135,.2) !important}
.mg-row{appearance:none;width:100%;margin:0;border:0;background:none;font:inherit;color:inherit;text-align:left;cursor:pointer}
.mg-list{list-style:none;margin:0;padding:0}
.mg-head>*{max-width:100%}
@media (max-width:1279px){.mg-head{height:auto!important;flex-wrap:wrap;row-gap:10px!important;padding-top:12px!important;padding-bottom:12px!important}}
@media (max-width:1023px){.mg-head{padding-left:16px!important;padding-right:16px!important}}
.mg-row[aria-pressed="true"]{cursor:default}
.lpb-phone{max-width:100%}
/* the editor toolbar wraps whenever its buttons don't fit (at 1440 with the side menu, Publish was cut off) */
.lpb-head{height:auto!important;min-height:72px;flex-wrap:wrap;row-gap:8px;padding-top:12px!important;padding-bottom:12px!important}
@media (max-width:1379px){.lpb-work{min-width:0!important;flex-wrap:wrap}.lpb-settings{flex:1 1 100%!important;width:auto!important;border-left:0!important;border-top:1px solid #e2e8f0}.lpb-head{height:auto!important;min-height:72px;flex-wrap:wrap;row-gap:8px;padding:12px 16px!important}.lpb-head>*{max-width:100%}.lpb-head h1{white-space:normal!important}}
@media (max-width:1023px){.lpb-work{flex-direction:column;flex-wrap:nowrap}.lpb-work>*{flex:none!important;width:100%!important;min-width:0!important;border-right:0!important;border-bottom:1px solid #e2e8f0}.lpb-pick{padding:20px 16px 32px!important}}
/* phones: the editor toolbar wraps inside the screen (view switch full width, then Open on my phone + Publish);
   icon buttons and the page-part rows get touch-sized targets */
@media (max-width:640px){
  .lpb-ib{width:44px!important;height:44px!important}
  .lpb-ib svg{width:20px;height:20px}
  .lpb-tools{flex:1 1 100%!important;flex-wrap:wrap;margin-left:0!important}
  .lpb-tools>span:first-child{flex:1 1 100%!important}
  .lpb-tools>span:first-child>button{flex:1 1 0!important;justify-content:center;height:36px!important}
  .lpb-tools>button{flex:1 1 0!important;justify-content:center;height:44px!important}
  .lpb-cbar{flex-wrap:wrap;row-gap:6px!important}
  .lpb-cbar>span:last-child{flex:1 1 100%!important;margin-left:0!important;white-space:normal!important}
  .lpb-parts button{min-height:44px}
  .lpb-parts button>span:last-child:not([style*="flex: 1"]){display:grid;place-items:center;width:40px;height:40px;margin:-8px -6px -8px 0;flex:none}
  .lpb-parts button>span svg{width:16px;height:16px}
}`;

// ---- markup ----

export default class LandingPageBuilderScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="LandingPageBuilder">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ display: "flex", gap: "12px", padding: "12px", background: "#eef2f7" }}>
          <__Sidebar collapsed="" sticky="" active="storefront" />
          <div className="gc-shell__main" style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", position: "relative", overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "var(--radius-xl)", background: "#f8fafc" }}>
            {v.isPick ? (<>
              <__Topbar crumb="Online Store" page="Landing pages" />
              <header className="mg-head" style={{ display: "flex", height: "72px", flex: "none", alignItems: "center", gap: "12px", padding: "0 32px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
                <button className="dc-h15" onClick={v.backToList} style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Back to landing pages">
                  <__Icon name="arrow-left" width="20" height="20" strokeWidth="1.75" />
                </button>
                <div>
                  <h1 style={{ margin: "0", fontSize: "var(--text-xl)", lineHeight: "var(--text-xl-lh)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>New landing page</h1>
                  <p style={{ margin: "1px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Step 1 of 2 — pick the product this page sells</p>
                </div>
              </header>
              <div className="lpb-pick" style={{ flex: "1", minHeight: "0", padding: "32px 32px 40px" }}>
                <div className="gc-split" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 372px", gap: "26px", maxWidth: "1240px" }}>
                  <section style={{ background: "#fff", borderRadius: "var(--radius-lg)", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "26px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                      <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Your products</h2>
                      <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{v.catalogCount}</span>
                      <span style={{ position: "relative", display: "inline-block", width: "250px", marginLeft: "auto" }}>
                        <input aria-label="Search products or SKU" type="search" placeholder="Search products or SKU…" value={v.q} onChange={v.setQ} style={{ width: "100%", boxSizing: "border-box", height: "32px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 16px 0 36px", fontSize: "var(--text-xs-plus)", color: "#1e293b" }} />
                        <span style={{ position: "absolute", left: "0", top: "0", display: "flex", width: "36px", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", pointerEvents: "none" }}>
                          <__Icon name="search" strokeWidth="1.75" width="16" height="16" />
                        </span>
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "6px", marginTop: "14px", flexWrap: "wrap" }}>
                      {[['all', 'All'], ['stock', 'In stock'], ['nopage', 'No page yet']].map(([k, label]) => (
                        <button key={k} type="button" aria-pressed={v.filter === k} onClick={v.setFilter(k)} className={v.filter === k ? undefined : 'dc-h16'} style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: v.filter === k ? "rgba(0,48,135,.1)" : "#e9eef5", color: v.filter === k ? "#003087" : "#475569", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}>{label}</button>
                      ))}
                    </div>
                    <div style={{ marginTop: "16px", display: "grid", gap: "8px" }}>
                      {!v.ready ? <div style={{ minHeight: "200px" }} aria-busy="true" /> : null}
                      {v.noRows ? <p style={{ margin: "8px 0", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>No active product matches. Try another search.</p> : null}
                      {__list(v.productRows).map((r) => (
                        <button key={r.id} type="button" className={r.on ? 'mg-row' : 'mg-row dc-h19'} aria-pressed={r.on} onClick={r.pick} style={{ display: "flex", gap: "12px", alignItems: "center", border: r.on ? "2px solid #003087" : "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", padding: r.on ? "10px 12px" : "11px 13px", background: r.on ? "rgba(0,48,135,.04)" : "#fff", cursor: "pointer" }}>
                          <span style={{ flex: "none", width: "44px", height: "44px", borderRadius: "var(--radius-xl)", background: r.bg, color: "#003087", display: "grid", placeItems: "center", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>{r.initials}</span>
                          <span style={{ flex: "1", minWidth: "0" }}>
                            <span style={{ display: "block", margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{r.name}</span>
                            <span style={{ display: "block", margin: "2px 0 0", fontSize: "var(--text-xs-plus)", color: "#475569" }}>{r.meta}</span>
                          </span>
                          {r.on ? (
                            <span style={{ flex: "none", display: "grid", placeItems: "center", width: "22px", height: "22px", borderRadius: "var(--radius-full)", background: "#003087", color: "#fff" }}>
                              <__Icon name="check" strokeWidth="1.75" width="14" height="14" />
                            </span>
                          ) : r.badge ? (
                            <span style={{ flex: "none", display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-sm)", background: r.tone === 'bad' ? "rgba(255,87,36,.12)" : r.tone === 'warn' ? "rgba(255,152,0,.12)" : "#e9eef5", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: r.tone === 'bad' ? "#c23a12" : r.tone === 'warn' ? "#a15f00" : "#475569" }}>{r.badge}</span>
                          ) : null}
                        </button>
                      ))}
                      {v.moreRows ? <p style={{ margin: "4px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{v.moreRows}</p> : null}
                    </div>
                    <p style={{ margin: "16px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}><a href="/add-product">Add a new product</a></p>
                  </section>
                  <aside style={{ display: "grid", gap: "16px", alignContent: "start" }}>
                    <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "26px" }}>
                      <h2 style={{ margin: "0 0 2px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Fills the page automatically</h2>
                      <p style={{ margin: "0 0 14px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{v.pName}</p>
                      <div style={{ display: "grid", gap: "9px" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <span style={{ flex: "none", color: "var(--accent-text)", marginTop: "1px" }}>
                            <__Icon name="type" strokeWidth="1.75" width="16" height="16" />
                          </span>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}><b style={{ color: "#1e293b", fontWeight: "var(--weight-medium)" }}>Name</b> — heading, page title, order confirmation</span>
                        </div>
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <span style={{ flex: "none", color: "var(--accent-text)", marginTop: "1px" }}>
                            <__Icon name="image" strokeWidth="1.75" width="16" height="16" />
                          </span>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}><b style={{ color: "#1e293b", fontWeight: "var(--weight-medium)" }}>{v.pPhotosLine}</b> — hero, gallery and variant images</span>
                        </div>
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <span style={{ flex: "none", color: "var(--accent-text)", marginTop: "1px" }}>
                            <__Icon name="tag" strokeWidth="1.75" width="16" height="16" />
                          </span>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}><b style={{ color: "#1e293b", fontWeight: "var(--weight-medium)" }}>{v.pPriceLine}</b> — price part and order total</span>
                        </div>
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <span style={{ flex: "none", color: "var(--accent-text)", marginTop: "1px" }}>
                            <__Icon name="percent" strokeWidth="1.75" width="16" height="16" />
                          </span>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}><b style={{ color: "#1e293b", fontWeight: "var(--weight-medium)" }}>{v.pOfferLine}</b> — offer part and savings line</span>
                        </div>
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <span style={{ flex: "none", color: "var(--accent-text)", marginTop: "1px" }}>
                            <__Icon name="layers" strokeWidth="1.75" width="16" height="16" />
                          </span>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}><b style={{ color: "#1e293b", fontWeight: "var(--weight-medium)" }}>{v.pVariantsLine}</b> — variant chips and order form</span>
                        </div>
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <span style={{ flex: "none", color: "var(--accent-text)", marginTop: "1px" }}>
                            <__Icon name="boxes" strokeWidth="1.75" width="16" height="16" />
                          </span>
                          <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}><b style={{ color: "#1e293b", fontWeight: "var(--weight-medium)" }}>{v.pStockLine}</b> — urgency part and maximum quantity</span>
                        </div>
                      </div>
                      <p style={{ margin: "14px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Change these in the product, not on the page. <__Link href={v.editProductHref}>Edit product</__Link></p>
                    </div>
                    <div style={{ background: "#fff", borderRadius: "var(--radius-lg)", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", padding: "26px" }}>
                      <h2 style={{ margin: "0 0 2px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Starting point</h2>
                      <p style={{ margin: "0 0 14px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Step 2 of 2 — every template arrives already filled in</p>
                      <div style={{ display: "grid", gap: "8px" }}>
                        <button onClick={v.pickTemplate('cod')} style={{ display: "flex", gap: "10px", alignItems: "center", textAlign: "left", border: "2px solid #003087", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.04)", padding: "10px 12px", cursor: "pointer" }}>
                          <span style={{ flex: "none", width: "36px", height: "36px", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087", display: "grid", placeItems: "center" }}>
                            <__Icon name="banknote" strokeWidth="1.75" width="18" height="18" />
                          </span>
                          <span>
                            <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>COD single product</span>
                            <span style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "#475569" }}>11 parts · order form near the top</span>
                          </span>
                        </button>
                        <button className="dc-h22" onClick={v.pickTemplate('long')} style={{ display: "flex", gap: "10px", alignItems: "center", textAlign: "left", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "10px 12px", cursor: "pointer" }}>
                          <span style={{ flex: "none", width: "36px", height: "36px", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#475569", display: "grid", placeItems: "center" }}>
                            <__Icon name="scroll-text" strokeWidth="1.75" width="18" height="18" />
                          </span>
                          <span>
                            <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Long-form offer</span>
                            <span style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "#475569" }}>17 parts · benefits, reviews, FAQ, countdown</span>
                          </span>
                        </button>
                        <button className="dc-h23" onClick={v.pickTemplate('video')} style={{ display: "flex", gap: "10px", alignItems: "center", textAlign: "left", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "10px 12px", cursor: "pointer" }}>
                          <span style={{ flex: "none", width: "36px", height: "36px", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#475569", display: "grid", placeItems: "center" }}>
                            <__Icon name="play-circle" strokeWidth="1.75" width="18" height="18" />
                          </span>
                          <span>
                            <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Video first</span>
                            <span style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "#475569" }}>9 parts · video, then order form</span>
                          </span>
                        </button>
                        <button className="dc-h24" onClick={v.pickTemplate('blank')} style={{ display: "flex", gap: "10px", alignItems: "center", textAlign: "left", border: "1px dashed #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "10px 12px", cursor: "pointer" }}>
                          <span style={{ flex: "none", width: "36px", height: "36px", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#475569", display: "grid", placeItems: "center" }}>
                            <__Icon name="plus" strokeWidth="1.75" width="18" height="18" />
                          </span>
                          <span>
                            <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Blank page</span>
                            <span style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "#475569" }}>Start with 3 suggested parts</span>
                          </span>
                        </button>
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "16px" }}>
                        <button className="dc-h25" onClick={v.startBuild} style={{ height: "36px", flex: "1", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}>Start building</button>
                        <select aria-label="Page language" style={{ height: "36px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "0 8px", fontSize: "var(--text-xs-plus)", color: "#475569" }}>
                          <option>বাংলা + English</option>
                          <option>বাংলা</option>
                          <option>English</option>
                        </select>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </>) : null}
            {v.isBuild ? (<>
              <header className="lpb-head" style={{ display: "flex", height: "72px", flex: "none", alignItems: "center", gap: "10px", padding: "0 16px", background: "#fff", borderBottom: "1px solid #e2e8f0", minWidth: "0" }}>
                <button className="dc-h26 lpb-ib" onClick={v.backToList} style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Back to landing pages">
                  <__Icon name="arrow-left" width="20" height="20" strokeWidth="1.75" />
                </button>
                <div style={{ flex: "none" }}>
                  <h1 style={{ margin: "0", fontSize: "var(--text-xl)", lineHeight: "var(--text-xl-lh)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b", whiteSpace: "nowrap" }}>{v.pageTitle}</h1>
                  <p style={{ margin: "1px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{v.pageLink}</p>
                </div>
                <span style={{ flex: "none", whiteSpace: "nowrap", display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-sm)", background: "#e9eef5", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#475569", letterSpacing: "var(--tracking-wide)" }}>{v.statusLabel}</span>
                <span style={{ flex: "none", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", borderRadius: "var(--radius-full)", background: "rgba(16,185,129,.1)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#0f7a5a" }}><__Icon name={v.dirty || !v.savedLine.startsWith('Saved') ? "circle-dot" : "check"} strokeWidth="1.75" width="13" height="13" />{v.dirty ? 'Unsaved changes' : v.savedLine}</span>
                <div style={{ display: "flex", gap: "2px", marginLeft: "6px" }}>
                  <button className="dc-h27 lpb-ib" onClick={v.soon('Undo')} style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "#475569", cursor: "pointer" }} aria-label="Undo">
                    <__Icon name="undo-2" strokeWidth="1.75" width="18" height="18" />
                  </button>
                  <button className="lpb-ib" style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "#cbd5e1", cursor: "not-allowed" }} aria-label="Redo" disabled>
                    <__Icon name="redo-2" strokeWidth="1.75" width="18" height="18" />
                  </button>
                </div>
                <button className="dc-h28" onClick={v.openAiPage} style={{ flex: "none", whiteSpace: "nowrap", height: "32px", display: "inline-flex", alignItems: "center", gap: "7px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,156,222,.12)", color: "var(--accent-text)", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}><__Icon name="sparkles" strokeWidth="1.75" width="15" height="15" />Write page with AI</button>
                <div className="lpb-tools" style={{ marginLeft: "auto", flex: "none", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ flex: "none", display: "inline-flex", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "3px" }}>
                    {v.isMobile ? (<>
                      <button onClick={v.setMobile} style={{ flex: "none", whiteSpace: "nowrap", height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-full)", padding: "0 12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer", background: "#fff", color: "#003087", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)" }}><__Icon name="smartphone" strokeWidth="1.75" width="14" height="14" />Mobile</button>
                      {" "}
                      <button onClick={v.setDesktop} style={{ flex: "none", whiteSpace: "nowrap", height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-full)", padding: "0 12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer", background: "transparent", color: "#475569" }}><__Icon name="monitor" strokeWidth="1.75" width="14" height="14" />Desktop</button>
                    </>) : null}
                    {v.isDesktop ? (<>
                      <button onClick={v.setMobile} style={{ flex: "none", whiteSpace: "nowrap", height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-full)", padding: "0 12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer", background: "transparent", color: "#475569" }}><__Icon name="smartphone" strokeWidth="1.75" width="14" height="14" />Mobile</button>
                      {" "}
                      <button onClick={v.setDesktop} style={{ flex: "none", whiteSpace: "nowrap", height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-full)", padding: "0 12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer", background: "#fff", color: "#003087", boxShadow: "0 1px 2px 0 rgba(48,46,56,.08)" }}><__Icon name="monitor" strokeWidth="1.75" width="14" height="14" />Desktop</button>
                    </>) : null}
                  </span>
                  <button className="dc-h29" onClick={v.openSeo} style={{ flex: "none", whiteSpace: "nowrap", height: "32px", display: "inline-flex", alignItems: "center", gap: "7px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}><__Icon name="search" strokeWidth="1.75" width="15" height="15" />SEO</button>
                  <button className="dc-h29" onClick={v.save} style={{ flex: "none", whiteSpace: "nowrap", height: "32px", display: "inline-flex", alignItems: "center", gap: "7px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}><__Icon name="save" strokeWidth="1.75" width="15" height="15" />Save</button>
                  <button className="dc-h29" onClick={v.openOnPhone} style={{ flex: "none", whiteSpace: "nowrap", height: "32px", display: "inline-flex", alignItems: "center", gap: "7px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}><__Icon name="qr-code" strokeWidth="1.75" width="15" height="15" />Open on my phone</button>
                  <button className="dc-h30" onClick={v.openPublish} style={{ flex: "none", whiteSpace: "nowrap", height: "36px", display: "inline-flex", alignItems: "center", gap: "7px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", padding: "0 16px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}><__Icon name="rocket" strokeWidth="1.75" width="16" height="16" />{v.isLive ? 'Update' : 'Publish'}</button>
                </div>
              </header>
              <div className="lpb-work" style={{ flex: "1", minHeight: "0", display: "flex", minWidth: "1240px" }}>
                <section className="lpb-lib" aria-label="Add a part" style={{ width: "236px", flex: "none", flexShrink: "0", display: "flex", flexDirection: "column", background: "#fff", borderRight: "1px solid #e2e8f0" }}>
                  <div style={{ flex: "none", padding: "14px 14px 10px" }}>
                    <h2 style={{ margin: "0 0 10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Add a part</h2>
                    <span style={{ position: "relative", display: "block" }}>
                      <input aria-label="Search parts" type="search" placeholder="Search parts…" style={{ width: "100%", boxSizing: "border-box", height: "32px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", padding: "0 12px 0 34px", fontSize: "var(--text-xs-plus)", color: "#1e293b" }} />
                      <span style={{ position: "absolute", left: "0", top: "0", display: "flex", width: "34px", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", pointerEvents: "none" }}>
                        <__Icon name="search" strokeWidth="1.75" width="15" height="15" />
                      </span>
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "10px" }}>
                      <button style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Product</button>
                      <button className="dc-h31" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Conversion</button>
                      <button className="dc-h32" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Social proof</button>
                      <button className="dc-h33" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Offers</button>
                      <button className="dc-h34" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Checkout</button>
                      <button className="dc-h35" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Information</button>
                      <button className="dc-h36" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>My parts</button>
                    </div>
                  </div>
                  <div style={{ flex: "1", minHeight: "0", overflowY: "auto", borderTop: "1px solid #e2e8f0", padding: "10px 10px 16px" }}>
                    <p style={{ margin: "2px 0 8px 4px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Product · 6</p>
                    <div style={{ display: "grid", gap: "4px" }}>
                      <button className="dc-h37" style={{ display: "flex", gap: "9px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid transparent", borderRadius: "var(--radius-lg)", background: "none", padding: "7px 8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "grab" }}><span style={{ color: "var(--text-muted)" }}>
  <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
</span>Hero / product intro</button>
                      <button className="dc-h38" style={{ display: "flex", gap: "9px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid transparent", borderRadius: "var(--radius-lg)", background: "none", padding: "7px 8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "grab" }}><span style={{ color: "var(--text-muted)" }}>
  <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
</span>Image gallery</button>
                      <button className="dc-h39" style={{ display: "flex", gap: "9px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid transparent", borderRadius: "var(--radius-lg)", background: "none", padding: "7px 8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "grab" }}><span style={{ color: "var(--text-muted)" }}>
  <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
</span>Product benefits</button>
                      <button className="dc-h40" style={{ display: "flex", gap: "9px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid transparent", borderRadius: "var(--radius-lg)", background: "none", padding: "7px 8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "grab" }}><span style={{ color: "var(--text-muted)" }}>
  <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
</span>Features / specifications</button>
                      <button className="dc-h41" style={{ display: "flex", gap: "9px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid transparent", borderRadius: "var(--radius-lg)", background: "none", padding: "7px 8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "grab" }}><span style={{ color: "var(--text-muted)" }}>
  <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
</span>Video</button>
                      <div style={{ display: "flex", gap: "9px", alignItems: "center", borderRadius: "var(--radius-lg)", padding: "7px 8px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}><span>
  <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
</span>Variant selection<span style={{ marginLeft: "auto", fontSize: "var(--text-xs)" }}>on page</span></div>
                    </div>
                    <p style={{ margin: "14px 0 8px 4px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Conversion · 5</p>
                    <div style={{ display: "grid", gap: "4px" }}>
                      <button className="dc-h42" style={{ display: "flex", gap: "9px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid transparent", borderRadius: "var(--radius-lg)", background: "none", padding: "7px 8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "grab" }}><span style={{ color: "var(--text-muted)" }}>
  <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
</span>Why buy this product</button>
                      <button className="dc-h43" style={{ display: "flex", gap: "9px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid transparent", borderRadius: "var(--radius-lg)", background: "none", padding: "7px 8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "grab" }}><span style={{ color: "var(--text-muted)" }}>
  <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
</span>Before / after</button>
                      <button className="dc-h44" style={{ display: "flex", gap: "9px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid transparent", borderRadius: "var(--radius-lg)", background: "none", padding: "7px 8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "grab" }}><span style={{ color: "var(--text-muted)" }}>
  <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
</span>Stock urgency</button>
                    </div>
                    <p style={{ margin: "14px 0 8px 4px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Social proof · 1</p>
                    <button className="dc-h45" style={{ display: "flex", gap: "9px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid transparent", borderRadius: "var(--radius-lg)", background: "none", padding: "7px 8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "grab" }}><span style={{ color: "var(--text-muted)" }}>
  <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
</span>Customer reviews</button>
                    <p style={{ margin: "14px 0 8px 4px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Offers · 4</p>
                    <div style={{ display: "grid", gap: "4px" }}>
                      <button className="dc-h46" style={{ display: "flex", gap: "9px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid transparent", borderRadius: "var(--radius-lg)", background: "none", padding: "7px 8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "grab" }}><span style={{ color: "var(--text-muted)" }}>
  <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
</span>Bundle / quantity discount</button>
                      <button className="dc-h47" style={{ display: "flex", gap: "9px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid transparent", borderRadius: "var(--radius-lg)", background: "none", padding: "7px 8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "grab" }}><span style={{ color: "var(--text-muted)" }}>
  <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
</span>Related / upsell product</button>
                    </div>
                    <div style={{ marginTop: "16px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "10px" }}>
                      <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "#475569" }}>Drag a part onto the page, or tap it to add below the selected part.</p>
                    </div>
                  </div>
                </section>
                <section className="lpb-parts" aria-label="Page parts" style={{ width: "222px", flex: "none", display: "flex", flexDirection: "column", background: "#fff", borderRight: "1px solid #e2e8f0" }}>
                  <div style={{ flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 14px 10px" }}>
                    <h2 style={{ margin: "0", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>Page parts</h2>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>11</span>
                  </div>
                  <div style={{ flex: "1", minHeight: "0", overflowY: "auto", padding: "0 10px 16px" }}>
                    <div style={{ display: "grid", gap: "4px" }}>
                      <button className="dc-h48" onClick={v.selHeroFn} style={{ display: "flex", gap: "7px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "pointer" }}>
                        <span style={{ color: "#cbd5e1", cursor: "grab" }}>
                          <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
                        </span>
                        <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Hero / product intro</span>
                        <span style={{ color: "var(--text-muted)" }}>
                          <__Icon name="eye" strokeWidth="1.75" width="14" height="14" />
                        </span>
                      </button>
                      <button className="dc-h49" style={{ display: "flex", gap: "7px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "pointer" }}>
                        <span style={{ color: "#cbd5e1", cursor: "grab" }}>
                          <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
                        </span>
                        <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Image gallery</span>
                        <span style={{ color: "var(--text-muted)" }}>
                          <__Icon name="eye" strokeWidth="1.75" width="14" height="14" />
                        </span>
                      </button>
                      <button onClick={v.selPriceFn} style={{ display: "flex", gap: "7px", alignItems: "center", width: "100%", textAlign: "left", border: "2px solid #003087", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.06)", padding: "7px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087", cursor: "pointer" }}>
                        <span style={{ color: "#003087", cursor: "grab" }}>
                          <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
                        </span>
                        <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{"Price & offer"}</span>
                        <span>
                          <__Icon name="eye" strokeWidth="1.75" width="14" height="14" />
                        </span>
                      </button>
                      <button className="dc-h50" style={{ display: "flex", gap: "7px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "pointer" }}>
                        <span style={{ color: "#cbd5e1", cursor: "grab" }}>
                          <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
                        </span>
                        <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Variant selection</span>
                        <span style={{ color: "var(--text-muted)" }}>
                          <__Icon name="eye" strokeWidth="1.75" width="14" height="14" />
                        </span>
                      </button>
                      <button className="dc-h51" style={{ display: "flex", gap: "7px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "pointer" }}>
                        <span style={{ color: "#cbd5e1", cursor: "grab" }}>
                          <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
                        </span>
                        <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Product benefits</span>
                        <span style={{ color: "#a15f00" }}>
                          <__Icon name="alert-circle" strokeWidth="1.75" width="14" height="14" />
                        </span>
                      </button>
                      <div style={{ display: "flex", alignItems: "center", gap: "7px", borderTop: "2px dashed #009cde", padding: "5px 2px 2px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--accent-text)" }}>Drop here — Customer reviews</div>
                      <button className="dc-h52" onClick={v.selDeliveryFn} style={{ display: "flex", gap: "7px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "pointer" }}>
                        <span style={{ color: "#cbd5e1", cursor: "grab" }}>
                          <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
                        </span>
                        <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Delivery charge</span>
                        <span style={{ color: "var(--text-muted)" }}>
                          <__Icon name="eye" strokeWidth="1.75" width="14" height="14" />
                        </span>
                      </button>
                      <button className="dc-h53" style={{ display: "flex", gap: "7px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "pointer" }}>
                        <span style={{ color: "#cbd5e1", cursor: "grab" }}>
                          <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
                        </span>
                        <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Cash on delivery</span>
                        <span style={{ color: "var(--text-muted)" }}>
                          <__Icon name="eye" strokeWidth="1.75" width="14" height="14" />
                        </span>
                      </button>
                      <button className="dc-h54" onClick={v.selFormFn} style={{ display: "flex", gap: "7px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "pointer" }}>
                        <span style={{ color: "#cbd5e1", cursor: "grab" }}>
                          <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
                        </span>
                        <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Order form</span>
                        <span style={{ color: "var(--text-muted)" }} title="Required — can be hidden, not deleted">
                          <__Icon name="lock" strokeWidth="1.75" width="13" height="13" />
                        </span>
                      </button>
                      <button className="dc-h55" style={{ display: "flex", gap: "7px", alignItems: "center", width: "100%", textAlign: "left", border: "1px dashed #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", padding: "8px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", cursor: "pointer" }}>
                        <span style={{ cursor: "grab" }}>
                          <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
                        </span>
                        <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Countdown · hidden</span>
                        <span>
                          <__Icon name="eye-off" strokeWidth="1.75" width="14" height="14" />
                        </span>
                      </button>
                      <button className="dc-h56" style={{ display: "flex", gap: "7px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "pointer" }}>
                        <span style={{ color: "#cbd5e1", cursor: "grab" }}>
                          <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
                        </span>
                        <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>FAQ</span>
                        <span style={{ color: "var(--text-muted)" }}>
                          <__Icon name="eye" strokeWidth="1.75" width="14" height="14" />
                        </span>
                      </button>
                      <button className="dc-h57" style={{ display: "flex", gap: "7px", alignItems: "center", width: "100%", textAlign: "left", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "8px", fontSize: "var(--text-xs-plus)", color: "#334155", cursor: "pointer" }}>
                        <span style={{ color: "#cbd5e1", cursor: "grab" }}>
                          <__Icon name="grip-vertical" strokeWidth="1.75" width="14" height="14" />
                        </span>
                        <span style={{ flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Footer / contact</span>
                        <span style={{ color: "var(--text-muted)" }}>
                          <__Icon name="eye" strokeWidth="1.75" width="14" height="14" />
                        </span>
                      </button>
                    </div>
                    <div style={{ marginTop: "10px", display: "flex", gap: "6px" }}>
                      <button className="dc-h58" style={{ flex: "1", height: "32px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", border: "1px dashed #cbd5e1", borderRadius: "var(--radius-lg)", background: "#fff", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#475569", cursor: "pointer" }}><__Icon name="plus" strokeWidth="1.75" width="14" height="14" />Add part</button>
                    </div>
                    <p style={{ margin: "12px 4px 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Drag to reorder, or use <__Icon name="chevron-up" strokeWidth="1.75" width="12" height="12" />{" "}<__Icon name="chevron-down" strokeWidth="1.75" width="12" height="12" /> on a part. Hidden parts keep their settings.</p>
                  </div>
                </section>
                <section className="lpb-canvas" aria-label="Page preview" style={{ flex: "1", minWidth: "430px", display: "flex", flexDirection: "column", background: "#f1f5f9" }}>
                  <div className="lpb-cbar" style={{ flex: "none", display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", borderBottom: "1px solid #e2e8f0", background: "#fff" }}>
                    <span style={{ flex: "none", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "6px", height: "24px", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#003087" }}><__Icon name="pencil" strokeWidth="1.75" width="13" height="13" />Edit mode</span>
                    <span style={{ flex: "1 1 auto", minWidth: "0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Tap any part on the page to change it</span>
                    <span style={{ marginLeft: "auto", flex: "none", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", color: "#475569" }}><__Icon name="smartphone" strokeWidth="1.75" width="14" height="14" />390 px · what 94% of your buyers see</span>
                  </div>
                  <div style={{ flex: "1", minHeight: "0", overflowY: "auto", display: "flex", justifyContent: "center", padding: "20px 16px 40px" }}>
                    <div className="lpb-phone" style={{ width: "390px", flex: "none", borderRadius: "var(--radius-xl)", background: "#fff", boxShadow: "0 3px 10px 0 rgba(48,46,56,.06)", overflow: "hidden" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "26px", padding: "0 12px", background: "#f8fafc", fontSize: "var(--text-2xs)", color: "var(--text-muted)" }}>
                        <span>9:41</span>
                        <span>{v.host}</span>
                      </div>
                      <button type="button" className="mg-row dc-h59" aria-label="Edit part: Photos and headline" onClick={v.selHeroFn} style={{ display: "block", width: "calc(100% - 16px)", border: "1px dashed #e2e8f0", margin: "8px", borderRadius: "var(--radius-xl)", padding: "10px 12px", cursor: "pointer" }}>
                        <span style={{ display: "block", height: "150px", borderRadius: "var(--radius-lg)", background: "repeating-linear-gradient(115deg,#f8fafc,#f8fafc 10px,#eef2f7 10px,#eef2f7 20px)", display: "grid", placeItems: "center", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>product photo 1 of 4</span>
                        <span className="bn" style={{ display: "block", margin: "12px 0 0", fontSize: "var(--text-xl)", lineHeight: "1.3", fontWeight: "var(--weight-semibold)", color: "#1e293b", letterSpacing: "0" }}>{v.pTaglineBn}</span>
                        <span style={{ display: "block", margin: "5px 0 0", fontSize: "var(--text-sm)", color: "#475569" }}>{v.pName}</span>
                      </button>
                      <div style={{ position: "relative", border: "2px solid #003087", margin: "8px", borderRadius: "var(--radius-xl)", padding: "12px", background: "rgba(0,48,135,.03)" }}>
                        <span style={{ position: "absolute", top: "-11px", left: "10px", display: "inline-flex", alignItems: "center", gap: "6px", height: "22px", borderRadius: "var(--radius-full)", background: "#003087", color: "#fff", padding: "0 4px 0 9px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)" }}>{"Price & offer\n"}<span style={{ display: "inline-flex", gap: "1px", marginLeft: "3px" }}>
  <span style={{ width: "18px", height: "18px", display: "grid", placeItems: "center", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.16)" }}>
    <__Icon name="grip-vertical" strokeWidth="1.75" width="11" height="11" />
  </span>
  <span style={{ width: "18px", height: "18px", display: "grid", placeItems: "center", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.16)" }}>
    <__Icon name="eye" strokeWidth="1.75" width="11" height="11" />
  </span>
  <span style={{ width: "18px", height: "18px", display: "grid", placeItems: "center", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.16)" }}>
    <__Icon name="copy" strokeWidth="1.75" width="11" height="11" />
  </span>
  <span style={{ width: "18px", height: "18px", display: "grid", placeItems: "center", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.16)" }}>
    <__Icon name="more-vertical" strokeWidth="1.75" width="11" height="11" />
  </span>
</span></span>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                          <span style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", color: "#1e293b", letterSpacing: "var(--tracking-tight)" }}>{v.pPrice}</span>
                          {v.hasWas ? <span style={{ fontSize: "var(--text-sm-plus)", color: "var(--text-muted)", textDecoration: "line-through" }}>{v.pWas}</span> : null}
                          {v.hasWas ? <span style={{ display: "inline-flex", height: "22px", alignItems: "center", borderRadius: "var(--radius-sm)", background: "rgba(240,0,185,.1)", padding: "0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#c1008f" }}>{v.pPct}</span> : null}
                        </div>
                        <p className="bn" style={{ margin: "6px 0 0", fontSize: "var(--text-sm-plus)", color: "#475569" }}>{v.pOfferBn}</p>
                      </div>
                      <button type="button" className="mg-row dc-h60" aria-label="Edit part: Size and quantity" onClick={v.selPriceFn} style={{ display: "block", width: "calc(100% - 16px)", border: "1px dashed #e2e8f0", margin: "8px", borderRadius: "var(--radius-xl)", padding: "10px 12px", cursor: "pointer" }}>
                        <span className="bn" style={{ display: "block", margin: "0 0 8px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>বাছুন</span>
                        <span style={{ display: "block", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {__list(v.pChips).map((c, i) => (
                            <span key={c} style={{ display: "inline-flex", height: "32px", alignItems: "center", border: i === 0 ? "1px solid #003087" : "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", background: i === 0 ? "rgba(0,48,135,.06)" : "transparent", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: i === 0 ? "var(--weight-medium)" : "var(--weight-regular)", color: i === 0 ? "#003087" : "#475569" }}>{c}</span>
                          ))}
                        </span>
                        <span style={{ display: "block", display: "flex", alignItems: "center", gap: "10px", marginTop: "12px" }}>
                          <span className="bn" style={{ display: "block", margin: "0", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>পরিমাণ</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "12px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "4px 10px", fontSize: "var(--text-sm)", color: "#1e293b" }}><span style={{ display: "inline-flex", color: "var(--text-muted)" }}><__Icon name="minus" strokeWidth="2" width="14" height="14" aria-hidden="true" /></span>1<span style={{ display: "inline-flex", color: "#003087" }}><__Icon name="plus" strokeWidth="2" width="14" height="14" aria-hidden="true" /></span></span>
                          {v.showStockBn ? <span className="bn" style={{ fontSize: "var(--text-xs-plus)", color: "#a15f00" }}>{v.pStockBn}</span> : null}
                        </span>
                      </button>
                      <button type="button" className="mg-row dc-h61" aria-label="Edit part: Delivery and payment" onClick={v.selDeliveryFn} style={{ display: "block", width: "calc(100% - 16px)", border: "1px dashed #e2e8f0", margin: "8px", borderRadius: "var(--radius-xl)", padding: "10px 12px", cursor: "pointer" }}>
                        <span style={{ display: "block", display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)", color: "#475569" }}>
                          <span className="bn">ডেলিভারি চার্জ — ঢাকার ভিতরে</span>
                          <span style={{ fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{v.pDeliveryIn}</span>
                        </span>
                        <span style={{ display: "block", display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: "4px" }}>
                          <span className="bn">ঢাকার বাইরে</span>
                          <span>{v.pDeliveryOut}</span>
                        </span>
                        <span style={{ display: "block", display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", borderRadius: "var(--radius-lg)", background: "rgba(16,185,129,.1)", padding: "8px 10px" }}>
                          <span style={{ color: "#0f7a5a" }}>
                            <__Icon name="hand-coins" strokeWidth="1.75" width="16" height="16" />
                          </span>
                          <span className="bn" style={{ display: "block", margin: "0", fontSize: "var(--text-sm)", color: "#0f7a5a" }}>ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে টাকা দিন</span>
                        </span>
                      </button>
                      <button type="button" className="mg-row dc-h62" aria-label="Edit part: Order form" onClick={v.selFormFn} style={{ display: "block", width: "calc(100% - 16px)", border: "1px dashed #e2e8f0", margin: "8px", borderRadius: "var(--radius-xl)", padding: "10px 12px", cursor: "pointer" }}>
                        <span className="bn" style={{ display: "block", margin: "0 0 10px", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#1e293b" }}>অর্ডার করতে নিচের তথ্য দিন</span>
                        <span style={{ display: "block", display: "grid", gap: "7px" }}>
                          <span style={{ display: "block", height: "38px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", padding: "0 10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }} className="bn">আপনার নাম *</span>
                          <span style={{ display: "block", height: "38px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", padding: "0 10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }} className="bn">মোবাইল নম্বর * — 01XXXXXXXXX</span>
                          <span style={{ display: "block", height: "52px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "flex-start", padding: "8px 10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }} className="bn">সম্পূর্ণ ঠিকানা *</span>
                          <span style={{ display: "block", display: "flex", gap: "7px" }}>
                            <span style={{ display: "block", flex: "1", height: "38px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px", fontSize: "var(--text-xs-plus)", color: "#475569" }} className="bn">ঢাকা<span style={{ color: "var(--text-muted)" }}>
  <__Icon name="chevron-down" strokeWidth="1.75" width="14" height="14" />
</span></span>
                            <span style={{ display: "block", flex: "1", height: "38px", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", padding: "0 10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }} className="bn">এলাকা</span>
                          </span>
                        </span>
                        <span style={{ display: "block", display: "flex", justifyContent: "space-between", marginTop: "12px", paddingTop: "10px", borderTop: "1px solid #e2e8f0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "#1e293b" }}>
                          <span className="bn">সর্বমোট</span>
                          <span>{v.pTotal}</span>
                        </span>
                        <span style={{ display: "block", marginTop: "10px", height: "46px", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", display: "grid", placeItems: "center", fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)" }} className="bn">অর্ডার কনফার্ম করুন</span>
                        <span style={{ display: "block", margin: "8px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)", textAlign: "center" }}>4 fields · no account · no OTP</span>
                      </button>
                      <div style={{ border: "1px dashed #cbd5e1", margin: "8px", borderRadius: "var(--radius-xl)", padding: "14px", textAlign: "center", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>FAQ · Footer / contact · WhatsApp button</div>
                      <div style={{ position: "sticky", bottom: "0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", padding: "10px 12px", background: "#fff", borderTop: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>{v.pTotal}</span>
                        <span className="bn" style={{ flex: "1", height: "40px", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", display: "grid", placeItems: "center", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>অর্ডার করুন</span>
                      </div>
                    </div>
                  </div>
                </section>
                <section className="lpb-settings" aria-label="Part settings" style={{ width: "340px", flex: "none", display: "flex", flexDirection: "column", background: "#fff", borderLeft: "1px solid #e2e8f0" }}>
                  {v.aiClosed ? (<>
                    <div style={{ flex: "none", padding: "14px 16px 12px", borderBottom: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>{"Price & offer"}</h2>
                        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "5px", height: "22px", borderRadius: "var(--radius-sm)", background: "rgba(0,156,222,.12)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--accent-text)" }}><__Icon name="link" strokeWidth="1.75" width="12" height="12" />auto from product</span>
                      </div>
                      <p style={{ margin: "4px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{v.pPriceLine + ' · ' + v.pOfferLine} — change these in the product</p>
                      <div style={{ display: "flex", gap: "6px", marginTop: "12px" }}>
                        <button className="dc-h63" onClick={v.openAiField} style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,156,222,.12)", color: "var(--accent-text)", padding: "0 10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="sparkles" strokeWidth="1.75" width="14" height="14" />Fill this part with AI</button>
                        <button className="dc-h64" style={{ height: "28px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#475569", padding: "0 10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="rotate-ccw" strokeWidth="1.75" width="14" height="14" />Reset</button>
                      </div>
                    </div>
                    <div style={{ flex: "1", minHeight: "0", overflowY: "auto", padding: "14px 16px 24px" }}>
                      <label style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155" }} htmlFor="lpb-offer-line">Offer line</label>
                      <div style={{ position: "relative", marginTop: "6px" }}>
                        <textarea id="lpb-offer-line" aria-describedby="lpb-offer-help" rows="2" style={{ width: "100%", boxSizing: "border-box", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "8px 42px 8px 10px", fontSize: "var(--text-sm)", lineHeight: "1.45", color: "#1e293b", resize: "vertical" }} className="bn" key={v.pOfferBn} defaultValue={v.pOfferBn} />
                        <button className="dc-h65" onClick={v.openAiField} style={{ position: "absolute", top: "6px", right: "6px", height: "28px", display: "inline-flex", alignItems: "center", gap: "4px", border: "1px solid #009cde", borderRadius: "var(--radius-sm)", background: "#fff", color: "var(--accent-text)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="sparkles" strokeWidth="1.75" width="11" height="11" />AI</button>
                      </div>
                      <p style={{ margin: "5px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }} id="lpb-offer-help">Shown under the price. Keep it under 8 words on mobile.</p>
                      <div style={{ height: "1px", background: "#e2e8f0", margin: "16px 0" }} />
                      <label style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155" }} htmlFor="lpb-price-note">Note under price</label>
                      <div style={{ position: "relative", marginTop: "6px" }}>
                        <input id="lpb-price-note" defaultValue="ডেলিভারি চার্জ আলাদা" style={{ width: "100%", boxSizing: "border-box", height: "38px", border: "1px solid #cbd5e1", borderRadius: "var(--radius-lg)", padding: "0 42px 0 10px", fontSize: "var(--text-sm)", color: "#1e293b" }} className="bn" />
                        <button className="dc-h66" onClick={v.openAiField} style={{ position: "absolute", top: "7px", right: "6px", height: "28px", display: "inline-flex", alignItems: "center", gap: "4px", border: "1px solid #009cde", borderRadius: "var(--radius-sm)", background: "#fff", color: "var(--accent-text)", padding: "0 7px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="sparkles" strokeWidth="1.75" width="11" height="11" />AI</button>
                      </div>
                      <div style={{ height: "1px", background: "#e2e8f0", margin: "16px 0" }} />
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                        <span>
                          <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155" }}>Show the old price</span>
                          <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.hasWas ? v.pWas + ' struck through' : 'No old price on this product'}</span>
                        </span>
                        <span style={{ flex: "none", width: "40px", height: "22px", borderRadius: "var(--radius-full)", background: "#003087", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 3px" }}>
                          <span style={{ width: "16px", height: "16px", borderRadius: "var(--radius-full)", background: "#fff" }} />
                        </span>
                      </div>
                      <div style={{ height: "1px", background: "#e2e8f0", margin: "16px 0" }} />
                      <span style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155", marginBottom: "7px" }}>Savings shown as</span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>{v.hasWas ? v.f.save.toLocaleString("en-IN") + " taka saved" : "Taka saved"}</button>
                        <button className="dc-h67" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>{v.hasWas ? v.pPct : "% off"}</button>
                        <button className="dc-h68" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Both</button>
                      </div>
                      <div style={{ height: "1px", background: "#e2e8f0", margin: "16px 0" }} />
                      <div style={{ borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "12px" }}>
                        <p style={{ margin: "0 0 4px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#1e293b" }}>Price, stock and variants have no AI</p>
                        <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "#475569" }}>They come straight from your product so a buyer can never see a wrong price.</p>
                      </div>
                      <div style={{ display: "flex", gap: "6px", marginTop: "16px" }}>
                        <button className="dc-h69" style={{ height: "32px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#475569", padding: "0 10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="bookmark" strokeWidth="1.75" width="14" height="14" />Save to my parts</button>
                        <button className="dc-h70" style={{ height: "32px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(255,87,36,.1)", color: "#c23a12", padding: "0 10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="eye-off" strokeWidth="1.75" width="14" height="14" />Hide part</button>
                      </div>
                    </div>
                  </>) : null}
                  {v.aiOpen ? (<>
                    <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "8px", padding: "14px 16px 12px", borderBottom: "1px solid #e2e8f0" }}>
                      <span style={{ width: "28px", height: "28px", display: "grid", placeItems: "center", borderRadius: "var(--radius-lg)", background: "rgba(0,156,222,.12)", color: "var(--accent-text)" }}>
                        <__Icon name="sparkles" strokeWidth="1.75" width="16" height="16" />
                      </span>
                      <div style={{ minWidth: "0" }}>
                        <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }}>AI · Offer line</h2>
                        <p style={{ margin: "1px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{"Price & offer part"}</p>
                      </div>
                      <button className="dc-h71" onClick={v.closeAi} style={{ marginLeft: "auto", width: "28px", height: "28px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Close AI">
                        <__Icon name="x" strokeWidth="1.75" width="16" height="16" />
                      </button>
                    </div>
                    <div style={{ flex: "1", minHeight: "0", overflowY: "auto", padding: "14px 16px 24px" }}>
                      <div style={{ border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", padding: "10px" }}>
                        <p style={{ margin: "0 0 4px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Your text now</p>
                        <p className="bn" style={{ margin: "0", fontSize: "var(--text-sm)", color: "#475569" }}>{v.pOfferBn}</p>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "12px" }}>
                        <button style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#003087", color: "#fff", padding: "0 11px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Rewrite</button>
                        <button className="dc-h72" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 11px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Generate</button>
                        <button className="dc-h73" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 11px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Shorten</button>
                        <button className={`bn dc-h74`} style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 11px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>বাংলা</button>
                        <button className="dc-h75" style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 11px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>English</button>
                        <button className={`bn dc-h76`} style={{ height: "28px", border: "none", borderRadius: "var(--radius-full)", background: "#e9eef5", color: "#475569", padding: "0 11px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>বাংলা + English</button>
                      </div>
                      <p style={{ margin: "12px 0 0", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.pUsing}</p>
                      <div style={{ display: "grid", gap: "8px", marginTop: "12px" }}>
                        <button style={{ textAlign: "left", border: "2px solid #003087", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.04)", padding: "10px", cursor: "pointer" }}>
                          <span className="bn" style={{ display: "block", fontSize: "var(--text-sm)", color: "#1e293b" }}>{v.pSuggest[0]}</span>
                          <span style={{ display: "block", marginTop: "5px", fontSize: "var(--text-xs)", color: "#003087", fontWeight: "var(--weight-medium)" }}>Shown on the page now · 6 words</span>
                        </button>
                        <button className="dc-h77" style={{ textAlign: "left", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "10px", cursor: "pointer" }}>
                          <span className="bn" style={{ display: "block", fontSize: "var(--text-sm)", color: "#1e293b" }}>{v.pSuggest[1]}</span>
                          <span style={{ display: "block", marginTop: "5px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>8 words</span>
                        </button>
                        <button className="dc-h78" style={{ textAlign: "left", border: "1px solid #e2e8f0", borderRadius: "var(--radius-lg)", background: "#fff", padding: "10px", cursor: "pointer" }}>
                          <span style={{ display: "block", fontSize: "var(--text-sm)", color: "#1e293b" }}>{v.pSuggest[2]}</span>
                          <span style={{ display: "block", marginTop: "5px", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>English · 8 words</span>
                        </button>
                      </div>
                      <div style={{ display: "flex", gap: "6px", marginTop: "14px" }}>
                        <button className="dc-h79" onClick={v.closeAi} style={{ height: "36px", flex: "1", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: "pointer" }}>Use this text</button>
                        <button className="dc-h80" style={{ height: "36px", display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#475569", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="refresh-cw" strokeWidth="1.75" width="14" height="14" />Again</button>
                        <button className="dc-h81" onClick={v.closeAi} style={{ height: "36px", border: "none", borderRadius: "var(--radius-lg)", background: "none", color: "#475569", padding: "0 10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}>Keep mine</button>
                      </div>
                      <div style={{ marginTop: "16px", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "12px" }}>
                        <p style={{ margin: "0", fontSize: "var(--text-xs-plus)", color: "#475569" }}>Nothing changes on your page until you tap <b style={{ color: "#1e293b", fontWeight: "var(--weight-medium)" }}>Use this text</b> — and undo brings your words back.</p>
                      </div>
                      <p style={{ margin: "14px 0 6px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>Earlier in this session</p>
                      <div style={{ display: "grid", gap: "6px" }}>
                        <span className="bn" style={{ fontSize: "var(--text-xs-plus)", color: "#475569", borderLeft: "2px solid #e2e8f0", paddingLeft: "8px" }}>{v.pOfferBn}</span>
                        <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569", borderLeft: "2px solid #e2e8f0", paddingLeft: "8px" }}>{v.pOfferEn}</span>
                      </div>
                    </div>
                  </>) : null}
                </section>
              </div>
            </>) : null}
            {v.isPublish ? (<>
              <div onKeyDown={(e) => { if (e.key === "Escape") v.closePublish(); }} onMouseDown={(e) => { if (e.target === e.currentTarget) v.closePublish(); }} style={{ position: "fixed", inset: "0", zIndex: "200", background: "rgba(15,23,42,.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
                <div role="dialog" aria-modal="true" aria-labelledby="lpb-publish-title" style={{ width: "560px", maxWidth: "100%", maxHeight: "calc(100dvh - 32px)", overflowY: "auto", borderRadius: "var(--radius-lg)", background: "#fff", boxShadow: "0 20px 40px -12px rgba(15,23,42,.35)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "18px 20px", borderBottom: "1px solid #e2e8f0" }}>
                    <span style={{ width: "32px", height: "32px", display: "grid", placeItems: "center", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087" }}>
                      <__Icon name="rocket" strokeWidth="1.75" width="18" height="18" />
                    </span>
                    <div>
                      <h2 style={{ margin: "0", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "#1e293b" }} id="lpb-publish-title">{v.publishTitle}</h2>
                      <p style={{ margin: "1px 0 0", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{v.publishSub}</p>
                    </div>
                    <button className="dc-h82" autoFocus onClick={v.closePublish} style={{ marginLeft: "auto", width: "32px", height: "32px", display: "grid", placeItems: "center", border: "none", borderRadius: "var(--radius-full)", background: "none", color: "var(--text-muted)", cursor: "pointer" }} aria-label="Close">
                      <__Icon name="x" strokeWidth="1.75" width="18" height="18" />
                    </button>
                  </div>
                  <div style={{ padding: "18px 20px 20px" }}>
                    {v.linkProblem ? (<>
                    <p style={{ margin: "0 0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#c23a12" }}>Must fix</p>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", borderRadius: "var(--radius-lg)", background: "rgba(255,87,36,.08)", padding: "10px 12px", marginBottom: "18px" }}>
                      <span style={{ flex: "none", color: "#c23a12" }}><__Icon name="link-2" strokeWidth="1.75" width="18" height="18" /></span>
                      <span style={{ flex: "1", fontSize: "var(--text-sm)", color: "#334155" }}>{v.linkProblem} Change the page link below.</span>
                    </div>
                  </>) : null}
                    {v.hasChecks ? (<>
                    <p style={{ margin: "0 0 8px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "#a15f00" }}>Worth checking — will not stop you</p>
                    <div style={{ display: "grid", gap: "8px" }}>
                      {__list(v.checks).map((c, i) => (
                        <div key={i} style={{ display: "flex", gap: "10px", alignItems: "center", borderRadius: "var(--radius-lg)", background: "#f8fafc", padding: "10px 12px" }}>
                          <span style={{ flex: "none", color: "#a15f00" }}><__Icon name="info" strokeWidth="1.75" width="18" height="18" /></span>
                          <span style={{ flex: "1", fontSize: "var(--text-sm)", color: "#334155" }}>{c.text}</span>
                          {c.act ? <__Link href={c.act.href} style={{ flex: "none", height: "28px", display: "inline-flex", alignItems: "center", borderRadius: "var(--radius-lg)", background: "#e9eef5", color: "#475569", padding: "0 12px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>{c.act.label}</__Link> : null}
                        </div>
                      ))}
                    </div>
                    </>) : null}
                    <div style={{ height: "1px", background: "#e2e8f0", margin: "18px 0" }} />
                    <label style={{ display: "block", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#334155" }} htmlFor="lpb-page-link">Page link</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "0", marginTop: "6px" }}>
                      <span style={{ height: "38px", display: "inline-flex", alignItems: "center", border: "1px solid #cbd5e1", borderRight: "none", borderRadius: "var(--radius-lg) 0 0 var(--radius-lg)", background: "#f8fafc", padding: "0 10px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }} id="lpb-page-link-prefix">{v.host + "/lp/"}</span>
                      <input id="lpb-page-link" aria-describedby="lpb-page-link-prefix" value={v.handle} onChange={v.setHandle} aria-invalid={!!v.linkProblem} style={{ flex: "1", minWidth: "0", boxSizing: "border-box", height: "38px", border: "1px solid #cbd5e1", borderRadius: "0 var(--radius-lg) var(--radius-lg) 0", padding: "0 10px", fontSize: "var(--text-sm)", color: "#1e293b" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "18px" }}>
                      <button className="dc-h87" onClick={v.publish} disabled={!v.canPublish} style={{ height: "36px", display: "inline-flex", alignItems: "center", gap: "7px", border: "none", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", padding: "0 16px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", cursor: v.canPublish ? "pointer" : "not-allowed", opacity: v.canPublish ? 1 : .5 }}><__Icon name="rocket" strokeWidth="1.75" width="16" height="16" />{v.isLive ? 'Update live page' : 'Publish page'}</button>
                      <button className="dc-h88" onClick={v.checkPhone} style={{ height: "36px", display: "inline-flex", alignItems: "center", gap: "7px", border: "none", borderRadius: "var(--radius-lg)", background: "rgba(0,48,135,.1)", color: "#003087", padding: "0 14px", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", cursor: "pointer" }}><__Icon name="smartphone" strokeWidth="1.75" width="16" height="16" />Check on my phone first</button>
                      <span style={{ marginLeft: "auto", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Orders go to your orders list</span>
                    </div>
                  </div>
                </div>
              </div>
            </>) : null}
          </div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: SEO_PANEL_CSS }} />
        <__Sheet open={v.seoOpen && !!v.seo} title="Search engine listing" onClose={v.closeSeo} footer={<>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={v.closeSeo}>Close</button>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={v.saveSeo}>Save</button>
        </>}>
          {v.seo ? <SeoPanel kind="landing" idPrefix="lpb-seo" defaultOpen seo={v.seo} onChange={v.setSeo} ctx={v.seoCtx} schedule={v.seoSchedule} /> : null}
        </__Sheet>
      </div>
    );
  }
}
