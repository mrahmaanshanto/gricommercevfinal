'use client';
// Landing page builder (/landing-page-builder, ?id= opens a saved page, ?product= starts one for a product).
//   Start   pick an active product, then start from a template or let the AI builder write the whole page.
//   Build   left: Parts (the page's parts in order: drag or arrows to move, hide, copy, remove; Add part opens the
//           library: the sales-page parts, and every section of the store's library with its looks) · Page (product, title, link, accent colour, theme, font, corners, sticky order bar, checks) ·
//           AI (the AI builder: tone, goal, language, length, audience, offer → a full page; headline ideas).
//           Middle: the page as customers see it, in a preview frame at phone, tablet or computer width
//           (/lp?draft=1&preview=1&edit=1; the unsaved page is posted with sendPreview; click a part to edit it).
//           Right: the chosen part in three tabs, as in Online Store › Layouts: Content (its fields, or a store
//           section's look and fields; the AI writer on its words) · Style (spacing per device, width, background,
//           pattern, colours, fonts, buttons) · Advanced ("Order now" under it, show per device, animation, anchor).
//   Header  Back · title · status · phone / computer · Undo / Redo (Ctrl+Z / Ctrl+Shift+Z) · SEO · Preview · Save ·
//           Publish (or Unpublish). Leaving with unsaved changes asks first.
// Pages and their parts live in lib/landingPages.js + lib/landingParts.js; /lp draws the same parts with a working
// cash-on-delivery order form. The AI is GridAI's marketing agent, simulated over the product data and metered.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, PhoneMore } from '@/components/ui';
import { allProducts, getSavedProducts } from '@/lib/products';
import { formatBDT, formatTime } from '@/lib/format';
import { getLandingPage, getLandingPages, newLandingPage, saveLandingPage, publishLandingPage, unpublishLandingPage, handleProblem, slugify, LP_BASE, TEMPLATES, LANDING_EVENT } from '@/lib/landingPages';
import { PARTS, PART_GROUPS, partType, partKind, partLabel, partIcon, isStorePart, PATTERNS, newPart, partsFor, factsOf, ensureParts, PAGE_STYLE, THEMES, FONTS, CORNERS, ACCENTS, aiBuild, aiRewrite, headlineIdeas, AI_TONES, AI_GOALS, AI_LANGS, AI_LENGTHS } from '@/lib/landingParts';
import SeoPanel, { SEO_PANEL_CSS } from '@/components/seo/SeoPanel';
import { readSeo } from '@/lib/seo';
import { contextOf } from '@/lib/seoItems';
import { Field, FIELDS_CSS } from '@/screens/online-store/SectionFields';
import { SFB_CSS, PreviewFrame } from '@/screens/online-store/sfShared';
import { SectionFields, StyleTab, AdvancedTab, LibraryBody, LE_CSS } from '@/screens/online-store/LayoutEdit';
import { STARTER, lookPatch } from '@/screens/storefront/sectionStarters';
import { newSection } from '@/lib/storefront/layouts';

const tk = (n) => formatBDT(Math.round(Number(n) || 0));
const clone = (x) => JSON.parse(JSON.stringify(x));
const TEXT_KEYS = ['title', 'sub', 'text', 'offer', 'button'];
const summaryOf = (p) => (p.type === 'announce' ? p.text : p.title) || '';
const uid = () => 'pt-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const DEV_OF = { phone: 'm', tablet: 't', desktop: 'd' };
const DEVICE_OF = { m: 'phone', t: 'tablet', d: 'desktop' };

/** The product list for the start step (active, priced, physical, not gift-only). */
function useProducts() {
  const [list, setList] = useState([]);
  useEffect(() => { let l = []; try { l = allProducts(getSavedProducts()).filter((p) => p.st === 'active' && Number(p.price) > 0 && (!p.format || p.format === 'physical') && !p.giftOnly); } catch { l = []; } setList(l); }, []);
  return list;
}

// ---- start: product, then template or AI --------------------------------------------------------------------------------------
function Start({ products, pick, setPick, onTemplate, onAi }) {
  const [q, setQ] = useState('');
  const pages = useMemo(() => { const m = {}; getLandingPages().forEach((x) => { m[x.sku] = (m[x.sku] || 0) + 1; }); return m; }, []);
  const rows = products.filter((p) => !q.trim() || [p.name, p.sku, p.brand, p.cat].join(' ').toLowerCase().includes(q.trim().toLowerCase())).slice(0, 60);
  const cur = products.find((p) => p.id === pick);
  return (
    <div className="lpb-start">
      <section className="lpb-card">
        <header className="lpb-card__h"><h2>1 · Pick the product</h2><span className="lpb-muted">{products.length} active products</span></header>
        <input className="gc-input" type="search" placeholder="Search by name, SKU, brand" aria-label="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
        <ul className="lpb-plist" role="listbox" aria-label="Products">
          {rows.map((p) => {
            const img = ((p.media || []).find((m) => m.src) || {}).src;
            const stock = (p.variants || []).length ? p.variants.reduce((a, v) => a + (Number(v.stock) || 0), 0) : Number(p.inv) || 0;
            return (
              <li key={p.id}>
                <button type="button" role="option" aria-selected={pick === p.id} onClick={() => setPick(p.id)}>
                  <span className="lpb-pimg" style={{ background: p.tbg || 'var(--surface-subtle)' }}>{img ? <img src={img} alt="" /> : p.name.slice(0, 1)}</span>
                  <span className="lpb-pt"><b>{p.name}</b><small>{tk(p.price)}{Number(p.mrp) > Number(p.price) ? ' · was ' + tk(p.mrp) : ''} · {stock} in stock{pages[p.sku] ? ' · ' + pages[p.sku] + (pages[p.sku] === 1 ? ' page' : ' pages') : ''}</small></span>
                  {pick === p.id ? <Icon name="check-circle-2" width="18" height="18" aria-hidden="true" /> : null}
                </button>
              </li>
            );
          })}
          {!rows.length ? <li className="lpb-muted" style={{ padding: 12 }}>No product matches.</li> : null}
        </ul>
      </section>
      <section className="lpb-card">
        <header className="lpb-card__h"><h2>2 · Start the page</h2>{cur ? <span className="lpb-muted">for {cur.name}</span> : null}</header>
        <button type="button" className="lpb-ai-start" disabled={!cur} onClick={onAi}>
          <span className="lpb-ai-start__ic" aria-hidden="true"><Icon name="sparkles" width="22" height="22" /></span>
          <span><b>Build it with AI</b><small>Tell GridAI who it’s for and the offer. It writes every part from the product: headline, benefits, order form, questions.</small></span>
          <Icon name="arrow-right" width="18" height="18" aria-hidden="true" />
        </button>
        <p className="lpb-or">or start from a template</p>
        <div className="lpb-tpls">
          {TEMPLATES.map((t) => <button key={t.id} type="button" disabled={!cur} onClick={() => onTemplate(t.id)}><Icon name={t.icon} width="22" height="22" aria-hidden="true" /><b>{t.name}</b><small>{t.blurb}</small></button>)}
        </div>
      </section>
    </div>
  );
}

// ---- the AI builder --------------------------------------------------------------------------------------------------------
function AiPanel({ facts, onBuilt, onHeadline, hasParts }) {
  const [b, setB] = useState({ tone: 'friendly', goal: 'cod', lang: 'en', length: 'short', audience: '', offer: '', notes: '' });
  const [busy, setBusy] = useState(false);
  const [steps, setSteps] = useState([]);
  const [last, setLast] = useState(null);
  const ideas = useMemo(() => headlineIdeas(facts, b.lang === 'bn' ? 'bn' : 'en', b.tone), [facts, b.lang, b.tone]);
  const set = (k) => (e) => setB((x) => ({ ...x, [k]: e.target.value }));
  const run = async () => {
    if (!facts) return;
    if (hasParts) {
      const ok = await confirmDialog({ title: 'Replace this page with a new one?', body: 'GridAI writes every part again from the product. Undo brings the old page back.', confirmLabel: 'Write the page' });
      if (!ok) return;
    }
    setBusy(true); setSteps([]);
    const out = aiBuild(b, facts);
    // show the steps as they happen
    for (let i = 0; i < out.steps.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 420));
      setSteps(out.steps.slice(0, i + 1));
    }
    setBusy(false); setLast(out);
    onBuilt({ ...out, lang: b.lang });
  };
  const sel = (k, label, opts) => <label className="sfb-field"><span className="gc-label">{label}</span><select className="gc-input gc-select" value={b[k]} onChange={set(k)}>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>;
  return (
    <div className="lpb-ai">
      <p className="lpb-ai__lead"><Icon name="sparkles" width="16" height="16" aria-hidden="true" /><span>GridAI writes the page from {facts ? <b>{facts.name}</b> : 'the product'}: its price, discount, key features, photos and reviews, and your delivery charges.</span></p>
      {sel('tone', 'Tone', AI_TONES)}
      {sel('goal', 'Goal', AI_GOALS)}
      {sel('lang', 'Language', AI_LANGS)}
      {sel('length', 'Length', AI_LENGTHS)}
      <label className="sfb-field"><span className="gc-label">Who it’s for (optional)</span><input className="gc-input" value={b.audience} onChange={set('audience')} placeholder="e.g. students, gamers, new mothers" /></label>
      <label className="sfb-field"><span className="gc-label">The offer (optional)</span><input className="gc-input" value={b.offer} onChange={set('offer')} placeholder="e.g. Free delivery this week" /></label>
      <label className="sfb-field"><span className="gc-label">Anything else to say (optional)</span><textarea className="gc-input" rows={2} value={b.notes} onChange={set('notes')} placeholder="e.g. Comes with a free case" /></label>
      <button type="button" className="gc-btn gc-btn--solid lpb-ai__go" disabled={busy || !facts} onClick={run}><Icon name={busy ? 'loader' : 'sparkles'} width="16" height="16" aria-hidden="true" className={busy ? 'lpb-spin' : ''} />{busy ? 'Writing your page…' : hasParts ? 'Write the page again' : 'Write my page'}</button>
      {steps.length ? (
        <ol className="lpb-steps" aria-live="polite">
          {steps.map((s, i) => <li key={i}><Icon name="check" width="14" height="14" aria-hidden="true" /><span><b>{s.label}</b><small>{s.detail}</small></span></li>)}
        </ol>
      ) : null}
      {last && last.run && !busy ? <p className="lpb-muted lpb-ai__cost">{last.run.model} · {(last.run.tokensIn + last.run.tokensOut).toLocaleString('en-US')} tokens · ৳{last.run.cost.toFixed(2)} · in GridAI › Usage</p> : null}
      {facts ? (
        <div className="lpb-ideas">
          <p className="gc-label">Headline ideas</p>
          {ideas.map((h) => <button key={h} type="button" onClick={() => onHeadline(h)}><span>{h}</span><Icon name="corner-down-left" width="14" height="14" aria-hidden="true" /></button>)}
        </div>
      ) : null}
    </div>
  );
}

// ---- the builder ---------------------------------------------------------------------------------------------------------------
export default function LandingPageBuilder() {
  const products = useProducts();
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);
  const [pick, setPick] = useState('');
  const [page, setPageRaw] = useState(null);
  const [savedAt, setSavedAt] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [sel, setSel] = useState('');
  const [tab, setTab] = useState('parts');
  const [device, setDevice] = useState('phone');
  const [ins, setIns] = useState('content');
  const [libTab, setLibTab] = useState('sales');
  const [libQ, setLibQ] = useState('');
  const [lib, setLib] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [mob, setMob] = useState('preview');
  const [aiFirst, setAiFirst] = useState(false);
  const hist = useRef({ past: [], future: [], last: 0 });
  const dragFrom = useRef(-1);

  const product = useMemo(() => products.find((p) => p.id === (page ? page.productId : pick) || (page && p.sku === page.sku)) || null, [products, page, pick]);
  const facts = useMemo(() => factsOf(product), [product]);

  // open ?id= or start new (?product=)
  useEffect(() => {
    if (!products.length) return;
    const qs = new URLSearchParams(window.location.search);
    const id = qs.get('id');
    if (id) {
      const saved = getLandingPage(id);
      if (!saved) { setMissing(true); setReady(true); return; }
      const prod = products.find((p) => p.id === saved.productId || p.sku === saved.sku) || null;
      const full = ensureParts(saved, prod);
      setPageRaw(full); setSavedAt(saved.updatedAt); setSel((full.parts[1] || full.parts[0] || {}).id || '');
    } else setPick(qs.get('product') && products.some((p) => p.id === qs.get('product')) ? qs.get('product') : products[0].id);
    setReady(true);
  }, [products]);

  // every change: kept for Undo (typing within a moment is one step)
  const setPage = useCallback((next, { coalesce = false } = {}) => {
    setPageRaw((prev) => {
      const val = typeof next === 'function' ? next(prev) : next;
      const h = hist.current;
      const now = Date.now();
      if (prev && !(coalesce && now - h.last < 700)) { h.past.push(clone(prev)); if (h.past.length > 60) h.past.shift(); h.future = []; }
      h.last = now;
      return val;
    });
    setDirty(true);
  }, []);
  const undo = useCallback(() => { const h = hist.current; if (!h.past.length) return; setPageRaw((cur) => { h.future.push(clone(cur)); return h.past.pop(); }); setDirty(true); }, []);
  const redo = useCallback(() => { const h = hist.current; if (!h.future.length) return; setPageRaw((cur) => { h.past.push(clone(cur)); return h.future.pop(); }); setDirty(true); }, []);
  useEffect(() => {
    const key = (e) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'z') return;
      if (e.target.closest && e.target.closest('input,textarea,select')) return;
      e.preventDefault(); if (e.shiftKey) redo(); else undo();
    };
    const leave = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('keydown', key); window.addEventListener('beforeunload', leave);
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('beforeunload', leave); };
  }, [undo, redo, dirty]);
  useEffect(() => {
    const on = () => { if (page && !dirty) { const fresh = getLandingPage(page.id); if (fresh) setSavedAt(fresh.updatedAt); } };
    window.addEventListener(LANDING_EVENT, on);
    return () => window.removeEventListener(LANDING_EVENT, on);
  }, [page, dirty]);

  // start a page
  const begin = (template) => {
    const p = products.find((x) => x.id === pick);
    if (!p) return;
    const base = newLandingPage({ product: p, template });
    const parts = partsFor(template, factsOf(p), 'en');
    const full = { ...base, parts, style: { ...PAGE_STYLE } };
    hist.current = { past: [], future: [], last: 0 };
    setPageRaw(full); setSel((parts[1] || parts[0] || {}).id || ''); setDirty(true); setTab('parts');
  };
  const beginAi = () => { begin('blank'); setTab('ai'); setAiFirst(true); };

  // parts
  const parts = page ? page.parts || [] : [];
  const cur = parts.find((x) => x.id === sel) || null;
  const curType = cur ? partKind(cur) : null;
  const setPart = (id, patch, coalesce = true) => setPage((pg) => ({ ...pg, parts: pg.parts.map((x) => (x.id === id ? { ...x, ...patch } : x)) }), { coalesce });
  const move = (i, d) => setPage((pg) => { const n = pg.parts.slice(); const j = i + d; if (j < 0 || j >= n.length) return pg; [n[i], n[j]] = [n[j], n[i]]; return { ...pg, parts: n }; });
  const moveTo = (from, to) => setPage((pg) => { if (from === to || from < 0) return pg; const n = pg.parts.slice(); const [x] = n.splice(from, 1); n.splice(to, 0, x); return { ...pg, parts: n }; });
  const copy = (i) => setPage((pg) => { const n = pg.parts.slice(); const c = { ...clone(n[i]), id: uid() }; n.splice(i + 1, 0, c); setSel(c.id); return { ...pg, parts: n }; });
  const remove = async (i) => {
    const x = parts[i];
    if (x.type === 'order' && !x.sf && !(await confirmDialog({ title: 'Remove the order form?', body: 'Without it the page can’t take orders. Every Order button points to it.', confirmLabel: 'Remove', tone: 'danger' }))) return;
    setPage((pg) => ({ ...pg, parts: pg.parts.filter((p) => p.id !== x.id) }));
    if (sel === x.id) setSel('');
    toast(partLabel(x) + ' removed. Undo brings it back.');
  };
  const add = (type, look, store = false) => {
    let part;
    if (store) {
      // a section of the store's library: its starter content and the chosen look, kept as the section itself
      let sec = newSection(type, STARTER[type] ? (typeof STARTER[type] === 'function' ? STARTER[type]() : clone(STARTER[type])) : {});
      if (look) sec = { ...sec, variant: look, ...lookPatch(sec, look) };
      part = { ...sec, sf: true };
    } else {
      const fresh = partsFor('long', facts, page && page.lang === 'bn' ? 'bn' : 'en').find((x) => x.type === type);
      part = fresh || newPart(type);
    }
    setPage((pg) => {
      const n = pg.parts.slice();
      const at = sel ? n.findIndex((x) => x.id === sel) + 1 : n.length;
      n.splice(at > 0 ? at : n.length, 0, part);
      return { ...pg, parts: n };
    });
    setSel(part.id); setLib(false); setMob('edit'); setIns('content');
  };

  // save / publish
  const problem = page ? handleProblem(page.handle, page.id) : '';
  const save = (quiet) => {
    if (!page) return null;
    const rec = saveLandingPage(page);
    setPageRaw(rec); setSavedAt(rec.updatedAt); setDirty(false);
    try { window.history.replaceState(null, '', '/landing-page-builder?id=' + rec.id); } catch { /* ignore */ }
    if (!quiet) toast(rec.status === 'published' ? 'Changes saved. The live page shows them now.' : 'Saved as a draft. It is in Landing pages.');
    return rec;
  };
  const publish = () => {
    if (problem) { toast(problem, { tone: 'error' }); setTab('page'); return; }
    if (!parts.some((x) => x.type === 'order' && !x.sf && !x.hidden)) { toast('Add the order form first: a landing page takes orders with it.', { tone: 'error' }); return; }
    const rec = save(true);
    const out = publishLandingPage(rec.id);
    if (!out || out.error) { toast((out && out.error) || 'Could not publish.', { tone: 'error' }); return; }
    setPageRaw(out); setSavedAt(out.updatedAt); setDirty(false);
    toast('Published. The page is live at ' + LP_BASE + out.handle);
  };
  const unpublish = async () => {
    if (!(await confirmDialog({ title: 'Take the page off the website?', body: 'Customers can’t open it or order from it until you publish it again.', confirmLabel: 'Unpublish', tone: 'danger' }))) return;
    const rec = save(true);
    const out = unpublishLandingPage(rec.id);
    if (out) { setPageRaw(out); setDirty(false); }
    toast('The page is a draft again.');
  };
  const back = async () => {
    if (dirty && !(await confirmDialog({ title: 'Leave without saving?', body: 'Your changes to this page are not saved.', confirmLabel: 'Leave', tone: 'danger' }))) return;
    setDirty(false);
    window.location.href = '/landing-pages';
  };

  const onBuilt = (out) => {
    setPage((pg) => ({ ...pg, parts: out.parts, style: { ...(pg.style || {}), ...out.style }, title: out.title, offerLine: out.offerLine, lang: out.lang || pg.lang }));
    setSel((out.parts.find((x) => x.type === 'hero') || {}).id || '');
    setAiFirst(false);
    toast('Your page is written. Click any part to change it.');
  };
  const onHeadline = (h) => {
    const hero = parts.find((x) => x.type === 'hero');
    if (!hero) { toast('Add a Hero part first.', { tone: 'info' }); return; }
    setPart(hero.id, { title: h }, false); setSel(hero.id);
  };

  const checks = [];
  if (facts && facts.stock <= 0) checks.push(['package-x', `${facts.name} is out of stock. Customers can still order; you need stock to send them.`]);
  else if (facts && facts.stock < 10) checks.push(['package', `Only ${facts.stock} in stock.`]);
  if (facts && !facts.rating.count && parts.some((x) => x.type === 'reviews' && x.source !== 'own' && !x.hidden)) checks.push(['star', 'No published reviews yet: the Reviews part stays hidden on the live page.']);
  if (facts && !facts.photos.length) checks.push(['image-off', 'The product has no photo. Add one to the product, or set a picture on the Hero.']);
  if (!parts.some((x) => x.type === 'order' && !x.sf && !x.hidden)) checks.push(['shopping-bag', 'There is no order form, so the page can’t take orders.']);

  if (!ready) return <div className="dc-screen ds" style={{ minHeight: '100vh' }} aria-busy="true" />;
  const status = page ? page.status : 'draft';
  const style = page ? { ...PAGE_STYLE, ...(page.style || {}) } : PAGE_STYLE;
  const setStyle = (patch) => setPage((pg) => ({ ...pg, style: { ...PAGE_STYLE, ...(pg.style || {}), ...patch } }));

  return (
    <div className="dc-screen ds lpb" data-screen="LandingPageBuilder">
      <style dangerouslySetInnerHTML={{ __html: SFB_CSS + FIELDS_CSS + LE_CSS + SEO_PANEL_CSS + LPB_CSS }} />
      <header className="lpb-head">
        <button type="button" className="ix-btn ix-btn--plain ix-btn--icon" aria-label="Back to Landing pages" onClick={back}><Icon name="arrow-left" width="18" height="18" aria-hidden="true" /></button>
        <div className="lpb-head__t">
          {page ? <h1 className="lpb-vh">{page.title || 'Landing page'}</h1> : null}
          {page ? <input className="lpb-title" aria-label="Page name" value={page.title || ''} onChange={(e) => setPage((pg) => ({ ...pg, title: e.target.value }), { coalesce: true })} /> : <h1 className="lpb-h1">New landing page</h1>}
          <small>{page ? <><span className={'lpb-st is-' + status}>{status === 'published' ? 'Published' : 'Draft'}</span>{dirty ? 'Unsaved changes' : savedAt ? 'Saved ' + formatTime(savedAt) : 'Not saved yet'}</> : 'Pick a product to start'}</small>
        </div>
        {page ? (
          <div className="lpb-head__a">
            <span className="lpb-seg lpb-hide-s" role="group" aria-label="Preview size">
              <button type="button" aria-pressed={device === 'phone'} onClick={() => setDevice('phone')} aria-label="Phone"><Icon name="smartphone" width="16" height="16" aria-hidden="true" /></button>
              <button type="button" aria-pressed={device === 'tablet'} onClick={() => setDevice('tablet')} aria-label="Tablet"><Icon name="tablet" width="16" height="16" aria-hidden="true" /></button>
              <button type="button" aria-pressed={device === 'desktop'} onClick={() => setDevice('desktop')} aria-label="Computer"><Icon name="monitor" width="16" height="16" aria-hidden="true" /></button>
            </span>
            <button type="button" className="ix-btn ix-btn--plain ix-btn--icon" aria-label="Undo" title="Undo (Ctrl+Z)" disabled={!hist.current.past.length} onClick={undo}><Icon name="undo-2" width="18" height="18" aria-hidden="true" /></button>
            <button type="button" className="ix-btn ix-btn--plain ix-btn--icon" aria-label="Redo" title="Redo (Ctrl+Shift+Z)" disabled={!hist.current.future.length} onClick={redo}><Icon name="redo-2" width="18" height="18" aria-hidden="true" /></button>
            <PhoneMore>
              <button type="button" className="ix-btn" onClick={() => setSeoOpen(true)}><Icon name="search" width="16" height="16" aria-hidden="true" />SEO</button>
            <a className="ix-btn" href={'/lp?handle=' + encodeURIComponent(page.handle) + '&preview=1'} target="_blank" rel="noopener noreferrer" onClick={() => { if (dirty) save(true); }}><Icon name="external-link" width="16" height="16" aria-hidden="true" />Preview</a>
            {status === 'published' ? <button type="button" className="ix-btn" onClick={unpublish}>Unpublish</button> : null}
            </PhoneMore>
            <button type="button" className="ix-btn" onClick={() => save(false)}>Save</button>
            <button type="button" className="gc-btn gc-btn--solid" onClick={publish}>{status === 'published' ? 'Update live page' : 'Publish'}</button>
          </div>
        ) : null}
      </header>

      {missing ? <div className="lpb-missing"><p>This landing page isn’t here any more.</p><Link className="gc-btn gc-btn--solid" href="/landing-page-builder">Start a new page</Link></div>
        : !page ? <Start products={products} pick={pick} setPick={setPick} onTemplate={begin} onAi={beginAi} />
          : (
            <div className={'lpb-body is-m-' + mob}>
              <nav className="lpb-mtabs" aria-label="Builder">
                {[['parts', 'Parts'], ['preview', 'Preview'], ['edit', 'Edit']].map(([k, l]) => <button key={k} type="button" aria-pressed={mob === k} onClick={() => setMob(k)}>{l}</button>)}
              </nav>
              {/* left */}
              <aside className="lpb-left" aria-label="Parts and page">
                <div className="lpb-tabs" role="tablist">
                  {[['parts', 'Parts', 'layers'], ['page', 'Page', 'settings-2'], ['ai', 'AI builder', 'sparkles']].map(([k, l, ic]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}><Icon name={ic} width="15" height="15" aria-hidden="true" />{l}</button>)}
                </div>
                {tab === 'parts' ? (
                  <div className="lpb-pane">
                    <ol className="lpb-parts">
                      {parts.map((x, i) => {
                        const t = { label: partLabel(x), icon: partIcon(x) };
                        return (
                          <li key={x.id} draggable onDragStart={() => { dragFrom.current = i; }} onDragOver={(e) => e.preventDefault()} onDrop={() => { moveTo(dragFrom.current, i); dragFrom.current = -1; }}
                            className={(sel === x.id ? 'is-sel' : '') + (x.hidden ? ' is-off' : '')}>
                            <span className="lpb-grip" aria-hidden="true"><Icon name="grip-vertical" width="14" height="14" /></span>
                            <button type="button" className="lpb-part" onClick={() => { setSel(x.id); setMob('edit'); }} title={x.sf ? 'A section from the store library' : undefined}><Icon name={t.icon} width="16" height="16" aria-hidden="true" /><span><b>{t.label}</b>{summaryOf(x) ? <small>{summaryOf(x)}</small> : null}</span></button>
                            <span className="lpb-acts">
                              <button type="button" aria-label={`Move ${t.label} up`} disabled={i === 0} onClick={() => move(i, -1)}><Icon name="arrow-up" width="14" height="14" /></button>
                              <button type="button" aria-label={`Move ${t.label} down`} disabled={i === parts.length - 1} onClick={() => move(i, 1)}><Icon name="arrow-down" width="14" height="14" /></button>
                              <button type="button" aria-label={x.hidden ? `Show ${t.label}` : `Hide ${t.label}`} aria-pressed={!x.hidden} onClick={() => setPart(x.id, { hidden: !x.hidden }, false)}><Icon name={x.hidden ? 'eye-off' : 'eye'} width="14" height="14" /></button>
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                    <button type="button" className="ix-btn lpb-add" onClick={() => setLib(true)}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add part</button>
                  </div>
                ) : null}
                {tab === 'page' ? (
                  <div className="lpb-pane lpb-form">
                    <label className="sfb-field"><span className="gc-label">Product</span>
                      <select className="gc-input gc-select" value={page.productId} onChange={(e) => { const p = products.find((x) => x.id === e.target.value); if (p) setPage((pg) => ({ ...pg, productId: p.id, sku: p.sku, productName: p.name })); }}>
                        {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </label>
                    <label className="sfb-field"><span className="gc-label">Page link</span>
                      <span className="lpb-link"><span>{LP_BASE}</span><input className="gc-input" value={page.handle} onChange={(e) => setPage((pg) => ({ ...pg, handle: slugify(e.target.value) || e.target.value.toLowerCase() }), { coalesce: true })} aria-invalid={problem ? true : undefined} /></span>
                      {problem ? <small className="lpb-err">{problem}</small> : null}
                    </label>
                    <p className="gc-label">Accent colour</p>
                    <div className="lpb-sw" role="radiogroup" aria-label="Accent colour">
                      {ACCENTS.map((c) => <button key={c} type="button" role="radio" aria-checked={style.accent === c} aria-label={c} style={{ background: c }} onClick={() => setStyle({ accent: c })} />)}
                      <label className="lpb-sw__own" aria-label="Your colour"><input type="color" value={style.accent} onChange={(e) => setStyle({ accent: e.target.value })} /></label>
                    </div>
                    {[['theme', 'Background', THEMES], ['font', 'Fonts', FONTS], ['corners', 'Corners', CORNERS]].map(([k, l, opts]) => (
                      <label key={k} className="sfb-field"><span className="gc-label">{l}</span><select className="gc-input gc-select" value={style[k]} onChange={(e) => setStyle({ [k]: e.target.value })}>{opts.map(([v, x]) => <option key={v} value={v}>{x}</option>)}</select></label>
                    ))}
                    <label className="sfb-field"><span className="gc-label">Background pattern</span><select className="gc-input gc-select" value={style.pattern || ''} onChange={(e) => setStyle({ pattern: e.target.value })}>{PATTERNS.map(([v, x]) => <option key={v || 'x'} value={v}>{x}</option>)}</select></label>
                    <label className="lpb-check"><input type="checkbox" checked={!!style.sticky} onChange={(e) => setStyle({ sticky: e.target.checked })} />Order bar stays at the bottom on phones</label>
                    {checks.length ? <div className="lpb-checks"><p className="gc-label">Before you publish</p>{checks.map(([ic, t]) => <p key={t}><Icon name={ic} width="15" height="15" aria-hidden="true" />{t}</p>)}{product ? <Link href={'/add-product?id=' + encodeURIComponent(product.id)}>Edit the product</Link> : null}</div> : <p className="lpb-ok"><Icon name="check-circle-2" width="15" height="15" aria-hidden="true" />Ready to publish.</p>}
                  </div>
                ) : null}
                {tab === 'ai' ? <div className="lpb-pane"><AiPanel facts={facts} onBuilt={onBuilt} onHeadline={onHeadline} hasParts={!aiFirst && parts.length > 0} /></div> : null}
              </aside>

              {/* middle */}
              <main className="lpb-canvas" aria-label="Preview">
                <PreviewFrame src="/lp?draft=1&preview=1&edit=1" device={device} height="fill" title="Landing page preview" parts={[['landing', page], ['select', sel]]}
                  onMessage={(d) => { const id = d && (d.gcSfSelect || d.gcSfPick); if (id && parts.some((x) => x.id === id)) { setSel(id); setMob('edit'); } }} />
              </main>

              {/* right */}
              <aside className="lpb-right" aria-label="Part settings">
                {cur && curType ? (
                  <div className="lpb-pane">
                    <header className="lpb-right__h"><Icon name={curType.icon} width="18" height="18" aria-hidden="true" /><b>{curType.label}</b>
                      <span className="lpb-acts">
                        <button type="button" aria-label="Copy this part" title="Copy" onClick={() => copy(parts.indexOf(cur))}><Icon name="copy" width="15" height="15" /></button>
                        <button type="button" aria-label="Remove this part" title="Remove" onClick={() => remove(parts.indexOf(cur))}><Icon name="trash-2" width="15" height="15" /></button>
                      </span>
                    </header>
                    <div className="lpb-itabs" role="tablist" aria-label="Part settings">
                      {[['content', 'Content'], ['style', 'Style'], ['advanced', 'Advanced']].map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={ins === k} onClick={() => setIns(k)}>{l}</button>)}
                    </div>
                    {ins === 'style' ? <StyleTab s={cur} dev={DEV_OF[device]} setDev={(d) => setDevice(DEVICE_OF[d])} setBox={(b) => setPart(cur.id, { box: b }, false)} /> : null}
                    {ins === 'advanced' ? (<>
                      {cur.type !== 'order' || cur.sf ? (
                        <div className="sfb-field lpb-under"><label className="gc-label" htmlFor="lpb-under">“Order now” button under this part</label><input id="lpb-under" className="gc-input" placeholder="e.g. Order now (empty = no button)" value={cur.orderBtn || ''} onChange={(e) => setPart(cur.id, { orderBtn: e.target.value })} /></div>
                      ) : null}
                      <AdvancedTab s={cur} base={'/lp/' + page.handle} setBox={(b) => setPart(cur.id, { box: b }, false)} />
                    </>) : null}
                    {ins === 'content' && TEXT_KEYS.some((k) => typeof cur[k] === 'string' && cur[k].trim()) ? (
                      <div className="lpb-rw">
                        <span><Icon name="sparkles" width="14" height="14" aria-hidden="true" />Rewrite with AI</span>
                        {[['shorter', 'Shorter'], ['stronger', 'Stronger'], ['urgent', 'Urgent'], ['friendly', 'Friendly']].map(([how, l]) => (
                          <button key={how} type="button" onClick={() => { const patch = {}; ['title', 'sub', 'text'].forEach((k) => { if (typeof cur[k] === 'string' && cur[k].trim()) patch[k] = aiRewrite(cur[k], how); }); setPart(cur.id, patch, false); }}>{l}</button>
                        ))}
                      </div>
                    ) : null}
                    {ins === 'content' ? (
                      <div className="lpb-fields le-insp">
                        {isStorePart(cur)
                          ? <SectionFields f={cur} set={(patch) => setPart(cur.id, patch)} locked={false} />
                          : curType.fields.filter((fd) => !fd[5] || fd[5](cur)).map((fd) => <Field key={cur.id + fd[0]} fd={fd} f={cur} set={(patch) => setPart(cur.id, patch)} locked={false} />)}
                      </div>
                    ) : null}
                    {ins === 'content' && !cur.sf && (cur.type === 'reviews' || cur.type === 'gallery' || cur.type === 'specs' || cur.type === 'hero') ? <p className="lpb-muted lpb-note">{cur.type === 'reviews' ? 'Reviews come from Products › Reviews (published, 4–5 stars).' : 'Photos, price and specs come from the product.'} {product ? <Link href={'/add-product?id=' + encodeURIComponent(product.id)}>Edit the product</Link> : null}</p> : null}
                    {ins === 'content' && cur.sf ? <p className="lpb-muted lpb-note">A section from the store’s library: the same looks and settings as in Online Store › Layouts, drawn in this page’s colours and fonts.</p> : null}
                  </div>
                ) : <div className="lpb-pane lpb-empty"><Icon name="mouse-pointer-click" width="22" height="22" aria-hidden="true" /><p>Click a part on the page, or pick one from Parts, to change it.</p></div>}
              </aside>
            </div>
          )}

      {lib ? (
        <Sheet open title="Add a part" onClose={() => setLib(false)}>
          <div className="lpb-libtabs" role="tablist" aria-label="Library">
            {[['sales', 'Sales page parts', PARTS.length], ['store', 'Store sections', null]].map(([k, l, n]) => <button key={k} type="button" role="tab" aria-selected={libTab === k} onClick={() => setLibTab(k)}>{l}{n ? <small>{n}</small> : null}</button>)}
          </div>
          {libTab === 'store' ? (
            <div className="lpb-storelib">
              <input className="gc-input" type="search" placeholder="Search sections and looks" aria-label="Search sections" value={libQ} onChange={(e) => setLibQ(e.target.value)} />
              <LibraryBody filter={libQ} onAdd={(type, look) => add(type, look, true)} />
            </div>
          ) : (
          <div className="lpb-lib">
            {PART_GROUPS.map(([g, gl]) => (
              <div key={g}>
                <p className="gc-label">{gl}</p>
                <div className="lpb-lib__grid">{PARTS.filter((p) => p.group === g).map((p) => <button key={p.type} type="button" onClick={() => add(p.type)}><Icon name={p.icon} width="20" height="20" aria-hidden="true" /><b>{p.label}</b>{parts.some((x) => x.type === p.type && !x.sf) ? <small>On the page</small> : null}</button>)}</div>
              </div>
            ))}
          </div>
          )}
        </Sheet>
      ) : null}
      {seoOpen && page ? (
        <Sheet open title="Search engine listing" onClose={() => setSeoOpen(false)} footer={<><button type="button" className="ix-btn" onClick={() => setSeoOpen(false)}>Close</button><button type="button" className="gc-btn gc-btn--solid" onClick={() => { save(true); setSeoOpen(false); toast('Search engine listing saved.'); }}>Save</button></>}>
          <SeoPanel kind="landing" idPrefix="lpb-seo" defaultOpen seo={readSeo('landing', page)} onChange={(patch) => setPage((pg) => ({ ...pg, seo: { ...readSeo('landing', pg), ...patch } }), { coalesce: true })} ctx={contextOf('landing', page)}
            schedule={status === 'published' ? null : { at: page.goLiveAt || '', label: 'Publish on', onChange: (at) => setPage((pg) => ({ ...pg, goLiveAt: at || null })) }} />
        </Sheet>
      ) : null}
    </div>
  );
}

const LPB_CSS = `
.lpb{display:flex;flex-direction:column;height:100vh;background:var(--surface-page,#f1f3f7);color:var(--text-body)}
.lpb-head{display:flex;align-items:center;gap:12px;min-height:60px;padding:8px 16px;border-bottom:1px solid var(--border-subtle);background:var(--surface-card)}
.lpb-head__t{display:flex;flex-direction:column;flex:1;min-width:0}
.lpb-h1{margin:0;font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading)}
.lpb-vh{position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.lpb-title{width:min(420px,100%);padding:2px 6px;margin-left:-6px;border:1px solid transparent;border-radius:var(--radius-lg);background:none;color:var(--text-heading);font:inherit;font-size:var(--text-base);font-weight:var(--weight-semibold)}
.lpb-title:hover,.lpb-title:focus{border-color:var(--border-default);outline:none}
.lpb-head__t small{display:flex;align-items:center;gap:8px;color:var(--text-muted);font-size:var(--text-xs)}
.lpb-st{padding:0 8px;border-radius:var(--radius-full);background:var(--surface-subtle);color:var(--text-body);font-weight:var(--weight-medium)}
.lpb-st.is-published{background:var(--fill-success-soft);color:var(--text-success)}
.lpb-head__a{display:flex;align-items:center;gap:6px}
.lpb-head .gc-pagehead__menu{left:0;right:auto}
.lpb-seg{display:inline-flex;padding:2px;border:1px solid var(--border-default);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.lpb-seg button{display:grid;place-items:center;width:34px;height:28px;border:0;border-radius:var(--radius-md);background:none;color:var(--text-muted);cursor:pointer}
.lpb-seg button[aria-pressed="true"]{background:var(--surface-card);color:var(--text-heading);box-shadow:0 1px 2px rgba(15,23,42,.12)}
.lpb-body{display:grid;grid-template-columns:300px minmax(0,1fr) 340px;flex:1;min-height:0}
.lpb-left,.lpb-right{display:flex;flex-direction:column;min-height:0;background:var(--surface-card);border-right:1px solid var(--border-subtle)}
.lpb-right{border-right:0;border-left:1px solid var(--border-subtle)}
.lpb-pane{display:flex;flex-direction:column;gap:12px;flex:1;min-height:0;overflow:auto;padding:14px}
.lpb-tabs{display:flex;gap:2px;padding:8px 8px 0;border-bottom:1px solid var(--border-subtle)}
.lpb-tabs button{display:inline-flex;align-items:center;gap:5px;padding:0 4px;white-space:nowrap;flex:1;justify-content:center;min-height:36px;border:0;border-bottom:2px solid transparent;background:none;color:var(--text-muted);font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);cursor:pointer}
.lpb-tabs button[aria-selected="true"]{color:var(--text-heading);border-bottom-color:var(--primary)}
.lpb-parts{display:flex;flex-direction:column;gap:4px;margin:0;padding:0;list-style:none}
.lpb-parts li{display:flex;align-items:center;gap:2px;border:1px solid transparent;border-radius:var(--radius-lg);background:var(--surface-subtle)}
.lpb-parts li.is-sel{border-color:var(--primary);background:var(--fill-primary-soft)}
.lpb-parts li.is-off{opacity:.55}
.lpb-grip{display:grid;place-items:center;width:20px;color:var(--text-muted);cursor:grab}
.lpb-part{display:flex;align-items:center;gap:10px;flex:1;min-width:0;min-height:44px;padding:4px 2px;border:0;background:none;color:var(--text-heading);font:inherit;text-align:left;cursor:pointer}
.lpb-part>span{display:flex;flex-direction:column;min-width:0}
.lpb-part b{font-size:var(--text-sm);font-weight:var(--weight-medium)}
.lpb-part small{overflow:hidden;color:var(--text-muted);font-size:var(--text-xs);text-overflow:ellipsis;white-space:nowrap}
.lpb-acts{display:flex;gap:2px;padding-right:4px}
.lpb-acts button{display:grid;place-items:center;width:28px;height:28px;border:0;border-radius:var(--radius-md);background:none;color:var(--text-muted);cursor:pointer}
.lpb-acts button:hover:not(:disabled){background:var(--surface-card);color:var(--text-heading)}
.lpb-acts button:disabled{opacity:.35}
.lpb-add{align-self:flex-start}
.lpb-canvas{min-width:0;min-height:0;overflow:auto;padding:20px}
.lpb-canvas>.sfb-frame{height:100%}
.lpb-itabs{display:flex;gap:2px;border-bottom:1px solid var(--border-subtle)}
.lpb-itabs button{flex:1;min-height:36px;border:0;border-bottom:2px solid transparent;background:none;color:var(--text-muted);font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);cursor:pointer}
.lpb-itabs button[aria-selected="true"]{color:var(--text-heading);border-bottom-color:var(--primary)}
.lpb-right .le-insp{padding:0}
.lpb-under{padding-bottom:12px;border-bottom:1px solid var(--border-subtle)}
.lpb-libtabs{display:flex;gap:6px;margin-bottom:14px}
.lpb-libtabs button{display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 14px;border:1px solid var(--border-default);border-radius:var(--radius-full);background:var(--surface-card);color:var(--text-body);font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);cursor:pointer}
.lpb-libtabs button[aria-selected="true"]{border-color:var(--primary);background:var(--primary);color:#fff}
.lpb-libtabs small{font-size:var(--text-xs);opacity:.8}
.lpb-storelib{display:flex;flex-direction:column;gap:12px}
.lpb-right__h{display:flex;align-items:center;gap:8px;color:var(--text-heading)}
.lpb-right__h .lpb-acts{margin-left:auto}
.lpb-fields{display:flex;flex-direction:column;gap:12px}
.lpb-fields .sfb-field,.lpb-form .sfb-field,.lpb-ai .sfb-field{display:flex;flex-direction:column;gap:6px}
.lpb-rw{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:10px;border-radius:var(--radius-lg);background:var(--fill-primary-soft)}
.lpb-rw>span{display:inline-flex;align-items:center;gap:6px;width:100%;color:var(--text-heading);font-size:var(--text-xs);font-weight:var(--weight-semibold)}
.lpb-rw button{min-height:32px;padding:0 12px;border:1px solid var(--border-default);border-radius:var(--radius-full);background:var(--surface-card);color:var(--text-heading);font:inherit;font-size:var(--text-xs);cursor:pointer}
.lpb-rw button:hover{border-color:var(--primary);color:var(--primary)}
.lpb-note{font-size:var(--text-xs)}
.lpb-empty{align-items:center;justify-content:center;color:var(--text-muted);text-align:center}
.lpb-muted{color:var(--text-muted);font-size:var(--text-sm)}
.lpb-link{display:flex;flex-direction:column;align-items:stretch;gap:4px;font-size:var(--text-xs);color:var(--text-muted)}
.lpb-link span{white-space:nowrap}
.lpb-err{color:var(--text-danger);font-size:var(--text-xs)}
.lpb-sw{display:flex;flex-wrap:wrap;gap:8px}
.lpb-sw button{width:30px;height:30px;border:2px solid var(--surface-card);border-radius:50%;box-shadow:0 0 0 1px var(--border-default);cursor:pointer}
.lpb-sw button[aria-checked="true"]{box-shadow:0 0 0 2px var(--text-heading)}
.lpb-sw__own{position:relative;display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red);cursor:pointer}
.lpb-sw__own input{position:absolute;inset:0;opacity:0;cursor:pointer}
.lpb-check{display:flex;align-items:center;gap:8px;min-height:36px;font-size:var(--text-sm);color:var(--text-heading)}
.lpb-checks{display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:var(--radius-lg);background:var(--fill-warning-soft);font-size:var(--text-sm)}
.lpb-checks p{display:flex;gap:8px;margin:0}
.lpb-checks svg{flex:none;margin-top:3px;color:var(--text-warning)}
.lpb-ok{display:flex;align-items:center;gap:8px;margin:0;color:var(--text-success);font-size:var(--text-sm)}
.lpb-ai{display:flex;flex-direction:column;gap:12px}
.lpb-ai__lead{display:flex;gap:8px;margin:0;padding:12px;border-radius:var(--radius-lg);background:linear-gradient(135deg,var(--fill-primary-soft),var(--fill-secondary-soft,var(--fill-info-soft)));font-size:var(--text-sm);color:var(--text-heading)}
.lpb-ai__lead svg{flex:none;margin-top:3px;color:var(--primary)}
.lpb-ai__go{justify-content:center}
.lpb-spin{animation:lpb-spin 1s linear infinite}
@keyframes lpb-spin{to{transform:rotate(360deg)}}
.lpb-steps{display:flex;flex-direction:column;gap:8px;margin:0;padding:0;list-style:none}
.lpb-steps li{display:flex;gap:8px;animation:lpb-in .25s ease}
.lpb-steps li>svg{flex:none;margin-top:3px;color:var(--text-success)}
.lpb-steps li span{display:flex;flex-direction:column}
.lpb-steps b{font-size:var(--text-sm);color:var(--text-heading)}
.lpb-steps small{color:var(--text-muted);font-size:var(--text-xs)}
@keyframes lpb-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.lpb-ai__cost{font-size:var(--text-xs)}
.lpb-ideas{display:flex;flex-direction:column;gap:6px}
.lpb-ideas button{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:40px;padding:8px 12px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);color:var(--text-heading);font:inherit;font-size:var(--text-sm);text-align:left;cursor:pointer}
.lpb-ideas button:hover{border-color:var(--primary)}
.lpb-ideas svg{flex:none;color:var(--text-muted)}
.lpb-lib{display:flex;flex-direction:column;gap:16px}
.lpb-lib__grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
.lpb-lib__grid button{display:flex;flex-direction:column;align-items:flex-start;gap:6px;min-height:84px;padding:12px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);color:var(--text-heading);font:inherit;font-size:var(--text-sm);text-align:left;cursor:pointer}
.lpb-lib__grid button:hover{border-color:var(--primary);background:var(--fill-primary-soft)}
.lpb-lib__grid svg{color:var(--primary)}
.lpb-lib__grid small{color:var(--text-muted);font-size:var(--text-xs)}
.lpb-start{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:16px;flex:1;min-height:0;overflow:auto;padding:20px;max-width:1200px;width:100%;margin:0 auto}
.lpb-card{display:flex;flex-direction:column;gap:12px;min-height:0;padding:16px;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card)}
.lpb-card__h{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:8px}
.lpb-card__h h2{margin:0;font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading)}
.lpb-plist{display:flex;flex-direction:column;gap:4px;max-height:60vh;margin:0;padding:0;overflow:auto;list-style:none}
.lpb-plist button{display:flex;align-items:center;gap:12px;width:100%;min-height:56px;padding:6px 10px;border:1px solid transparent;border-radius:var(--radius-lg);background:none;color:var(--text-heading);font:inherit;text-align:left;cursor:pointer}
.lpb-plist button:hover{background:var(--surface-subtle)}
.lpb-plist button[aria-selected="true"]{border-color:var(--primary);background:var(--fill-primary-soft)}
.lpb-plist button>svg{color:var(--primary)}
.lpb-pimg{display:grid;place-items:center;flex:none;width:44px;height:44px;border-radius:var(--radius-lg);overflow:hidden;font-weight:var(--weight-semibold)}
.lpb-pimg img{width:100%;height:100%;object-fit:contain}
.lpb-pt{display:flex;flex-direction:column;flex:1;min-width:0}
.lpb-pt b{overflow:hidden;font-size:var(--text-sm);font-weight:var(--weight-medium);text-overflow:ellipsis;white-space:nowrap}
.lpb-pt small{color:var(--text-muted);font-size:var(--text-xs)}
.lpb-ai-start{display:flex;align-items:center;gap:14px;padding:16px;border:0;border-radius:var(--radius-xl);background:linear-gradient(135deg,#1e3a8a,#7c3aed);color:#fff;font:inherit;text-align:left;cursor:pointer;box-shadow:0 16px 32px -18px rgba(124,58,237,.7)}
.lpb-ai-start:disabled{opacity:.5;cursor:not-allowed}
.lpb-ai-start>span:nth-child(2){display:flex;flex-direction:column;gap:4px;flex:1}
.lpb-ai-start b{font-size:var(--text-base);font-weight:var(--weight-semibold)}
.lpb-ai-start small{opacity:.85;font-size:var(--text-sm);line-height:1.5}
.lpb-ai-start__ic{display:grid;place-items:center;flex:none;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.18)}
.lpb-or{margin:0;color:var(--text-muted);font-size:var(--text-xs);text-align:center}
.lpb-tpls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.lpb-tpls button{display:flex;flex-direction:column;align-items:flex-start;gap:6px;min-height:100px;padding:14px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);color:var(--text-heading);font:inherit;text-align:left;cursor:pointer}
.lpb-tpls button:hover:not(:disabled){border-color:var(--primary);background:var(--fill-primary-soft)}
.lpb-tpls button:disabled{opacity:.5}
.lpb-tpls svg{color:var(--primary)}
.lpb-tpls b{font-size:var(--text-sm);font-weight:var(--weight-semibold)}
.lpb-tpls small{color:var(--text-muted);font-size:var(--text-xs)}
.lpb-missing{display:flex;flex-direction:column;align-items:center;gap:12px;margin:auto;color:var(--text-body)}
.lpb-mtabs{display:none}
@media (max-width:1180px){.lpb-body{grid-template-columns:270px minmax(0,1fr) 300px}}
@media (max-width:960px){
  .lpb-body{display:flex;flex-direction:column}
  .lpb-mtabs{display:flex;gap:4px;padding:8px;border-bottom:1px solid var(--border-subtle);background:var(--surface-card)}
  .lpb-mtabs button{flex:1;min-height:40px;border:1px solid var(--border-default);border-radius:var(--radius-full);background:var(--surface-card);color:var(--text-body);font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium)}
  .lpb-mtabs button[aria-pressed="true"]{border-color:var(--primary);background:var(--primary);color:#fff}
  .lpb-left,.lpb-right,.lpb-canvas{display:none;flex:1;border:0}
  .lpb-body.is-m-parts .lpb-left,.lpb-body.is-m-edit .lpb-right{display:flex}
  .lpb-body.is-m-preview .lpb-canvas{display:block;padding:12px}
  .lpb-start{grid-template-columns:minmax(0,1fr);padding:12px}
  .lpb-hide-s{display:none}
  .lpb-head{flex-wrap:wrap}
  .lpb-head__a{width:100%;justify-content:flex-end;flex-wrap:wrap}
}
`;
