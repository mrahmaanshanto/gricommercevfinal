'use client';
// Page editor — Online Store › Pages › Add page / a page (/store-page-edit).
//   /store-page-edit            choose a ready template (About us, Contact us, Shipping & delivery, Return & refund,
//                               Privacy policy, Terms of service) or a blank page
//   /store-page-edit?template=  a new page from that template · ?id=<pageId> edits a page
//   Main column   title; address (made from the title until edited, kept unique); content with the blog's block
//                 editor (paragraphs, headings, lists, tables, FAQ, images, buttons …) and an in-page preview
//   Side          Visibility (Published / Hidden / Draft, hide from search engines), Search engine listing (title,
//                 description, Google preview), Page details (template, dates, the menus and settings that link here)
//   Header        Save; Publish or Unpublish; More: preview on the store, duplicate, delete (asks first)
// Templates fill in the store's phone, email and address (Settings › General) and the privacy texts (Settings ›
// Privacy & consent). Front end only: data from src/lib/storePages.js; the live website would serve the page.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { EmptyState, InfoTip } from '@/components/ui';
import { RecordHeader, KV } from '@/components/ui/IndexKit';
import { formatDate, formatTime } from '@/lib/format';
import { getCatalog } from '@/lib/stock';
import { newBlock, cloneBlock, BLOCK_TYPES, slugify } from '@/lib/blog';
import { readSettings } from '@/lib/settingsStore';
import {
  getPage, fromTemplate, blankPage, savePage, deletePages, duplicatePage, uniqueHandle, handleTaken, publishProblems,
  TEMPLATES, templateBy, STATUSES, PAGE_BASE, SITE, storefrontHref, handleFromUrl,
} from '@/lib/storePages';
import { menusLinking, removeLinksTo } from '@/lib/storeMenus';
import { BLOG_CSS, BlockView } from '@/screens/integrations/blogShared';
import { BLOCK_EDITOR_CSS, BlockEditor, AddMenu } from '@/screens/integrations/BlogEditor';
import { StoreFrame, useStorePages, PageStatus, queryParam } from './storeShared';
import SeoPanel, { SEO_PANEL_CSS } from '@/components/seo/SeoPanel';
import { readSeo, seoPatch, setBlockLink, dhakaText } from '@/lib/seo';
import { contextOf } from '@/lib/seoItems';
import { cleanHandleInput } from '@/lib/handles';

const clone = (x) => JSON.parse(JSON.stringify(x));
const norm = (p) => { if (!p) return ''; const { updatedAt, ...rest } = p; return JSON.stringify(rest); };

const CSS = `
.pe-card{display:flex;flex-direction:column;gap:var(--space-3)}
.pe-tpls{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:var(--space-3)}
.pe-tpl{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);text-align:left;font:inherit;cursor:pointer;color:var(--text-body)}
.pe-tpl:hover,.pe-tpl:focus-visible{border-color:var(--primary);box-shadow:0 0 0 1px var(--primary)}
.pe-tpl b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pe-tpl small{font-size:var(--text-xs);color:var(--text-muted);line-height:1.5}
.pe-tpl .pe-ico{display:grid;place-items:center;width:32px;height:32px;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
.pe-tpl .pe-have{font-size:var(--text-xs);color:var(--text-warning)}
.pe-radios{display:flex;flex-direction:column;gap:var(--space-2);border:0;margin:0;padding:0}
.pe-radio{display:flex;align-items:flex-start;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-heading);cursor:pointer}
.pe-radio small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.pe-pv{padding:var(--space-6) var(--space-5)}
.pe-pv .bl-article a.gc-btn--solid{color:var(--text-on-dark)}
.pe-links{display:flex;flex-direction:column;gap:var(--space-1);margin:0;padding:0;list-style:none;font-size:var(--text-sm)}
`;

function Card({ title, children, extra }) {
  return (
    <section className="ix-card">
      <div className="ix-card__head"><h2>{title}</h2>{extra}</div>
      <div className="be-pbody" style={{ paddingTop: 'var(--space-3)' }}>{children}</div>
    </section>
  );
}

/** Which settings point at this page (Settings › Privacy & consent's terms and privacy addresses). */
function settingsLinking(handle) {
  if (!handle) return [];
  let v = {};
  try { v = readSettings('privacy').values || {}; } catch { v = {}; }
  const out = [];
  if (handleFromUrl(v.privacy_url || '/page?handle=privacy-policy') === handle) out.push('Privacy policy link at checkout');
  if (handleFromUrl(v.terms_url || '/page?handle=terms-of-service') === handle) out.push('Terms link at checkout');
  return out;
}

export default function StorePageEdit() {
  const { pages, ready } = useStorePages();
  const router = useRouter();
  const [page, setPage] = useState(null);
  const [storedJson, setStoredJson] = useState('');
  const [isNew, setIsNew] = useState(true);
  const [choose, setChoose] = useState(false);
  const [missing, setMissing] = useState(false);
  const [handleTouched, setHandleTouched] = useState(false);
  const [mode, setMode] = useState('edit');
  const [menuAt, setMenuAt] = useState(null);
  const [focusReq, setFocusReq] = useState(null);
  const [checked, setChecked] = useState(false);
  const [catalog, setCatalog] = useState([]);

  // load once the pages are read
  useEffect(() => {
    if (!ready || page || missing || choose) return;
    setCatalog(getCatalog());
    const id = queryParam('id');
    const tpl = queryParam('template');
    if (id) {
      const found = getPage(id);
      if (!found) { setMissing(true); return; }
      setPage(clone(found)); setIsNew(false); setStoredJson(norm(found)); setHandleTouched(true);
      return;
    }
    if (tpl && templateBy(tpl)) { setPage(fromTemplate(tpl)); setIsNew(true); setHandleTouched(tpl !== 'blank'); return; }
    setChoose(true);
  }, [ready, page, missing, choose]);

  const pending = !!page && (isNew ? true : norm(page) !== storedJson);
  const stored = useMemo(() => (page && !isNew ? pages.find((p) => p.id === page.id) : null), [pages, page, isNew]);
  const ref = useRef({});
  ref.current = { pending: pending && !!page && (!isNew || !!String(page.title || '').trim() || page.template !== 'blank') };

  // leaving with unsaved changes asks first (reload / close here; links in the app below)
  useEffect(() => {
    const onUnload = (e) => { if (ref.current.pending) { e.preventDefault(); e.returnValue = ''; } };
    const onClick = async (e) => {
      if (!ref.current.pending || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const path = e.composedPath ? e.composedPath() : [];
      const a = path.find((n) => n && n.tagName === 'A' && n.getAttribute && n.getAttribute('href'));
      if (!a || a.target === '_blank') return;
      let url;
      try { url = new URL(a.getAttribute('href'), window.location.href); } catch { return; }
      if (url.origin !== window.location.origin || (url.pathname === window.location.pathname && url.search === window.location.search)) return;
      e.preventDefault(); e.stopPropagation();
      const ok = await confirmDialog({ title: 'Leave this page?', body: 'Your changes are not saved yet.', confirmLabel: 'Leave', cancelLabel: 'Stay' });
      if (ok) { ref.current.pending = false; router.push(url.pathname + url.search); }
    };
    window.addEventListener('beforeunload', onUnload);
    document.addEventListener('click', onClick, true);
    return () => { window.removeEventListener('beforeunload', onUnload); document.removeEventListener('click', onClick, true); };
  }, [router]);

  useEffect(() => {
    if (!focusReq) return;
    const box = document.querySelector(`[data-block="${focusReq.id}"]`);
    if (box) {
      const el = focusReq.act ? box.querySelector(`[data-act="${focusReq.act}"]:not([disabled])`) || box.querySelector('[data-act]:not([disabled])') : box.querySelector('input,textarea,select');
      if (el) el.focus();
    }
    setFocusReq(null);
  }, [focusReq]);

  const css = BLOG_CSS + BLOCK_EDITOR_CSS + CSS + SEO_PANEL_CSS;
  const replaceUrl = (q) => { try { window.history.replaceState(window.history.state, '', '/store-page-edit' + (q ? '?' + q : '')); } catch { /* ignore */ } };

  // ---- template chooser / missing / loading -----------------------------------------------------------
  if (missing) {
    return (
      <StoreFrame screen="StorePageEdit" active="store-pages" page="Edit page" css={css} narrow>
        <RecordHeader back="/store-pages" backLabel="All pages" title="Page not found" />
        <section className="ix-card ix-empty"><EmptyState icon="file-question" title="This page is not here" body="It may have been deleted. Go back to Pages or add a new one." actionLabel="Add page" onAction={() => { setMissing(false); replaceUrl(''); }} /></section>
      </StoreFrame>
    );
  }
  if (choose) {
    const pick = (t) => { setPage(fromTemplate(t.id)); setIsNew(true); setHandleTouched(t.id !== 'blank'); setChoose(false); replaceUrl('template=' + t.id); };
    return (
      <StoreFrame screen="StorePageEdit" active="store-pages" page="Add page" css={css} narrow>
        <RecordHeader back="/store-pages" backLabel="All pages" title="Add page" about="Pick a ready page to start from. The templates fill in your phone, email and address from Settings › General, and the privacy texts from Settings › Privacy & consent. Change anything before you publish." />
        <section className="ix-card ix-card--pad" aria-label="Start from">
          <div className="pe-tpls">
            {TEMPLATES.map((t) => {
              const have = t.id !== 'blank' && pages.find((p) => p.template === t.id || p.handle === t.handle);
              return (
                <button key={t.id} type="button" className="pe-tpl" onClick={() => pick(t)}>
                  <span className="pe-ico" aria-hidden="true"><Icon name={t.icon} width="16" height="16" /></span>
                  <b>{t.name}</b>
                  <small>{t.blurb}</small>
                  {have ? <span className="pe-have">You already have this page</span> : null}
                </button>
              );
            })}
          </div>
        </section>
      </StoreFrame>
    );
  }
  if (!page) {
    return (
      <StoreFrame screen="StorePageEdit" active="store-pages" page="Page" css={css} narrow>
        <RecordHeader back="/store-pages" backLabel="All pages" title="Page" meta="Loading…" />
        <div style={{ minHeight: 320 }} aria-busy="true" />
      </StoreFrame>
    );
  }

  // ---- edits ----------------------------------------------------------------------------------------
  const set = (patch) => setPage((p) => ({ ...p, ...patch }));
  const setSeo = (patch) => setPage((p) => ({ ...p, seo: { ...p.seo, ...patch } }));
  const onTitle = (title) => setPage((p) => ({ ...p, title, handle: handleTouched ? p.handle : (title.trim() ? uniqueHandle(title, pages, p.id) : '') }));
  const onHandle = (v) => { setHandleTouched(true); set({ handle: cleanHandleInput(v) }); };
  // the SEO panel edits the page's seo (lib/seo.js shape; older seo.title / description and noindex kept in step)
  const seo = readSeo('page', page);
  const setSeoAll = (patch) => setPage((p) => ({ ...p, ...seoPatch('page', p, patch) }));
  const setBlock = (id, patch) => setPage((p) => ({ ...p, blocks: p.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
  const insertBlock = (at, type) => {
    const b = newBlock(type);
    setPage((p) => { const blocks = p.blocks.slice(); blocks.splice(at, 0, b); return { ...p, blocks }; });
    setMenuAt(null); setFocusReq({ id: b.id });
  };
  const moveBlock = (id, dir, fromKeys) => {
    setPage((p) => {
      const i = p.blocks.findIndex((b) => b.id === id), j = i + dir;
      if (i < 0 || j < 0 || j >= p.blocks.length) return p;
      const blocks = p.blocks.slice();
      [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
      return { ...p, blocks };
    });
    if (!fromKeys) setFocusReq({ id, act: dir < 0 ? 'up' : 'down' });
  };
  const dupBlock = (id) => {
    const i = page.blocks.findIndex((b) => b.id === id);
    const copy = cloneBlock(page.blocks[i]);
    setPage((p) => { const blocks = p.blocks.slice(); blocks.splice(i + 1, 0, copy); return { ...p, blocks }; });
    setFocusReq({ id: copy.id });
    toast('Block duplicated');
  };
  const delBlock = (id) => {
    const i = page.blocks.findIndex((b) => b.id === id);
    const gone = page.blocks[i];
    setPage((p) => ({ ...p, blocks: p.blocks.filter((b) => b.id !== id) }));
    toast(`${(BLOCK_TYPES.find((t) => t.type === gone.type) || { label: 'Block' }).label} deleted`, { undo: () => setPage((p) => { const blocks = p.blocks.slice(); blocks.splice(Math.min(i, blocks.length), 0, gone); return { ...p, blocks }; }) });
  };

  // ---- save / publish -------------------------------------------------------------------------------
  const problems = checked && page.status === 'published' ? publishProblems(page) : [];
  const bad = (f) => problems.some((x) => x.field === f);
  const focusField = (field) => { const el = document.getElementById(field); if (el) { const t = el.matches('input,textarea,select') ? el : el.querySelector('input,textarea,select,button'); if (t) { t.focus(); t.scrollIntoView({ block: 'center', behavior: 'smooth' }); } } };
  const commit = (status, message) => {
    const next = { ...page, status };
    if (status === 'published') {
      const probs = publishProblems(next);
      if (probs.length) {
        setPage(next); setChecked(true);
        toast(`Fix ${probs.length} thing${probs.length === 1 ? '' : 's'} before this page goes live.`, { tone: 'error' });
        window.setTimeout(() => focusField(probs[0].field), 50);
        return null;
      }
    }
    const h = slugify(next.handle) || uniqueHandle(next.title || 'page', pages, next.id);
    next.handle = handleTaken(h, pages, next.id) ? uniqueHandle(h, pages, next.id) : h;
    if (next.handle !== page.handle && page.handle) toast(`Another page uses that address, so this one is /pages/${next.handle}`, { tone: 'info' });
    const saved = savePage(next);
    setPage(clone(saved)); setStoredJson(norm(saved)); setChecked(false);
    if (isNew) { setIsNew(false); replaceUrl('id=' + saved.id); }
    if (message) toast(typeof message === 'function' ? message(saved) : message);
    return saved;
  };
  const wasLive = !!stored && stored.status === 'published';
  const save = () => commit(page.status, (s) => (s.status === 'published' ? `Saved · live at ${PAGE_BASE}${s.handle}` : s.goLiveAt ? `Saved · goes live ${dhakaText(s.goLiveAt)} (Bangladesh time)` : s.status === 'hidden' ? 'Saved · hidden from the website' : 'Saved as a draft · not on the website'));
  const publish = () => commit('published', (s) => `Published at ${PAGE_BASE}${s.handle}`);
  const unpublish = () => {
    const saved = commit('hidden');
    if (saved) toast('Hidden from the website', { undo: () => { const back = savePage({ ...saved, status: 'published' }); setPage(clone(back)); setStoredJson(norm(back)); toast('Published again'); } });
  };
  const remove = async () => {
    if (isNew) {
      if (pending && !(await confirmDialog({ title: 'Discard this new page?', body: 'What you wrote so far is not kept.', confirmLabel: 'Discard', tone: 'danger' }))) return;
      ref.current.pending = false; router.push('/store-pages'); return;
    }
    const linked = menusLinking('page', page.id);
    const settings = settingsLinking(stored ? stored.handle : page.handle);
    const ok = await confirmDialog({
      title: `Delete “${page.title || 'Untitled page'}”?`,
      body: ['It is removed from the website for good.', linked.length ? `Its links in ${linked.join(', ')} are removed too.` : '', settings.length ? `Checkout links here (${settings.join(', ').toLowerCase()}); add another page at that address.` : '', 'Hide it instead to keep a copy.'].filter(Boolean).join(' '),
      confirmLabel: 'Delete', tone: 'danger',
    });
    if (!ok) return;
    removeLinksTo('page', page.id);
    deletePages([page.id]);
    ref.current.pending = false;
    toast('Page deleted');
    router.push('/store-pages');
  };
  const duplicate = async () => {
    if (pending && !(await confirmDialog({ title: 'Duplicate without your changes?', body: 'The copy is made from the saved page. Save first to include your changes.', confirmLabel: 'Duplicate' }))) return;
    const copy = duplicatePage(page.id);
    if (!copy) return;
    setPage(clone(copy)); setIsNew(false); setStoredJson(norm(copy)); setHandleTouched(true); setChecked(false);
    replaceUrl('id=' + copy.id);
    toast(`Copy saved as a draft: ${copy.title}`);
  };
  const back = async () => {
    if (ref.current.pending && !(await confirmDialog({ title: 'Leave this page?', body: 'Your changes are not saved yet.', confirmLabel: 'Leave', cancelLabel: 'Stay' }))) return;
    ref.current.pending = false;
    router.push('/store-pages');
  };

  // ---- derived ------------------------------------------------------------------------------------
  const clash = !!page.handle && handleTaken(page.handle, pages, page.id);
  const linked = isNew ? [] : menusLinking('page', page.id);
  const settings = settingsLinking(stored ? stored.handle : '');
  const tpl = templateBy(page.template);
  const savedStatus = isNew ? 'draft' : (stored || page).status;
  const meta = <><span style={{ fontFamily: 'var(--font-data)' }}>{PAGE_BASE}{page.handle || '…'}</span>{pending && !isNew ? <> · <b style={{ fontWeight: 'var(--weight-medium)' }}>Unsaved changes</b></> : isNew ? ' · not saved yet' : ''}</>;
  const insertRow = (at) => (
    menuAt === at ? <AddMenu key={'m' + at} onPick={(t) => insertBlock(at, t)} onClose={() => setMenuAt(null)} />
      : <div key={'i' + at} className="be-ins"><button type="button" className="be-plus" aria-label={at === 0 ? 'Add a block at the start' : `Add a block after block ${at}`} title="Add a block" onClick={() => setMenuAt(at)}><Icon name="plus" width="16" height="16" /></button></div>
  );

  return (
    <StoreFrame screen="StorePageEdit" active="store-pages" page={isNew ? 'Add page' : 'Edit page'} css={css} narrow>
      <form onSubmit={(e) => { e.preventDefault(); save(); }} style={{ display: 'contents' }}>
        <RecordHeader onBack={back} backLabel="All pages"
          title={isNew ? (page.title || 'Add page') : page.title || 'Untitled page'}
          badges={<PageStatus status={savedStatus} />}
          meta={meta}
          about="Write a page for the online store. Published pages show on the website; add them to the header or footer in Menus."
          secondary={[wasLive ? { label: 'Unpublish', icon: 'eye-off', onClick: unpublish } : { label: 'Publish', icon: 'send', onClick: publish }]}
          more={[
            !isNew ? { label: wasLive ? 'View on the website' : 'Preview on the store', onClick: () => window.open(storefrontHref((stored || page).handle, !wasLive), '_blank', 'noopener') } : null,
            !isNew ? { label: 'Duplicate', onClick: duplicate } : null,
            { label: isNew ? 'Discard' : 'Delete', onClick: remove, tone: 'danger' },
          ].filter(Boolean)}
          primary={{ label: 'Save', icon: 'check', onClick: save }} />

        <div className="ix-record">
          <div className="ix-main">
            <section className="ix-card ix-card--pad pe-card" aria-label="Title and address">
              <div>
                <label className="gc-label" htmlFor="sp-title">Title *</label>
                <input id="sp-title" className={'gc-input be-title' + (bad('sp-title') ? ' gc-input--error' : '')} value={page.title} placeholder="e.g. About us" onChange={(e) => onTitle(e.target.value)} data-autofocus />
              </div>
              <div>
                <label className="gc-label" htmlFor="sp-handle">Address</label>
                <div className="be-slug"><span>{PAGE_BASE}</span><input id="sp-handle" className={'gc-input' + (clash || bad('sp-handle') ? ' gc-input--error' : '')} value={page.handle} placeholder="page-address" onChange={(e) => onHandle(e.target.value)} onBlur={() => set({ handle: slugify(page.handle) })} /></div>
                {clash ? (
                  <p className="gc-help gc-help--error">Another page uses this address. <button type="button" className="bl-link" style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }} onClick={() => set({ handle: uniqueHandle(page.handle, pages, page.id) })}>Use /pages/{uniqueHandle(page.handle, pages, page.id)}</button></p>
                ) : (
                  <p className="gc-help">{handleTouched ? <>Edited by hand. <button type="button" className="bl-link" style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }} onClick={() => { setHandleTouched(false); set({ handle: page.title.trim() ? uniqueHandle(page.title, pages, page.id) : '' }); }}>Make it from the title</button>{wasLive ? ' · changing the address of a live page breaks old links.' : ''}</> : 'Made from the title.'}</p>
                )}
              </div>
            </section>

            <section className="ix-card ix-card--pad pe-card" aria-label="Content" id="sp-content">
              <div className="be-chead">
                <h2>Content <InfoTip text="Paragraphs take **bold**, *italic* and [links](url). Alt+↑/↓ moves the block you are in." /></h2>
                <div className="gc-seg" role="group" aria-label="Edit or preview" style={{ marginLeft: 'auto' }}>
                  <button type="button" className={'gc-seg__btn' + (mode === 'edit' ? ' gc-seg__btn--active' : '')} aria-pressed={mode === 'edit'} onClick={() => setMode('edit')}>Edit</button>
                  <button type="button" className={'gc-seg__btn' + (mode === 'preview' ? ' gc-seg__btn--active' : '')} aria-pressed={mode === 'preview'} onClick={() => setMode('preview')}>Preview</button>
                </div>
              </div>
              {bad('sp-content') ? <p className="gc-help gc-help--error" style={{ margin: 0 }}>Write some content before you publish.</p> : null}
              {mode === 'preview' ? (
                <div className="pe-pv">
                  <article className="bl-article" data-preview="">
                    <h2 className="bl-a-title">{page.title || 'Untitled page'}</h2>
                    {(page.blocks || []).map((b) => <BlockView key={b.id} block={b} catalog={catalog} />)}
                  </article>
                </div>
              ) : (<>
                <div className="be-blocks">
                  {insertRow(0)}
                  {page.blocks.map((b, i) => (
                    <React.Fragment key={b.id}>
                      <BlockEditor b={b} i={i} count={page.blocks.length} catalog={catalog}
                        onChange={(patch) => setBlock(b.id, patch)} onMove={(dir, keys) => moveBlock(b.id, dir, keys)} onDup={() => dupBlock(b.id)} onDel={() => delBlock(b.id)} />
                      {insertRow(i + 1)}
                    </React.Fragment>
                  ))}
                </div>
                {!page.blocks.length ? <EmptyState icon="pilcrow" title="No content yet" body="Add a paragraph, a heading or a table." actionLabel="Add a paragraph" onAction={() => insertBlock(0, 'p')} /> : null}
              </>)}
            </section>
          </div>

          <aside className="ix-side" aria-label="Page settings">
            <Card title="Visibility">
              {problems.length ? (
                <div className="be-problems" role="alert"><b>Before it goes live:</b><ul>{problems.map((x) => <li key={x.field}><button type="button" onClick={() => focusField(x.field)}>{x.message}</button></li>)}</ul></div>
              ) : null}
              <fieldset className="pe-radios">
                <legend className="sr-only">Visibility</legend>
                {['published', 'hidden', 'draft'].map((k) => (
                  <label key={k} className="pe-radio">
                    <input type="radio" name="sp-status" className="gc-check gc-check--radio" checked={page.status === k} onChange={() => set({ status: k })} />
                    <span>{STATUSES[k].label}<small>{STATUSES[k].help}</small></span>
                  </label>
                ))}
              </fieldset>
              <p className="gc-help" style={{ margin: 0 }}>Press Save to apply.</p>
            </Card>

            <SeoPanel kind="page" idPrefix="sp-seo" seo={seo} onChange={setSeoAll} ctx={contextOf('page', page)}
              onAlt={(img, alt) => setBlock(img.block, { alt })}
              onLink={(link, patch) => setPage((p) => ({ ...p, blocks: setBlockLink(p.blocks, link, patch) }))}
              schedule={page.status === 'published' && wasLive ? null : { at: page.goLiveAt || '', label: 'Publish on', onChange: (at) => set({ goLiveAt: at || null, status: at ? (page.status === 'published' ? 'draft' : page.status) : page.status }) }} />

            <Card title="Page details">
              <KV rows={[
                ['Started from', tpl ? tpl.name : 'Blank page'],
                ['Created', isNew ? 'Not saved yet' : formatDate(page.createdAt)],
                ['Last edited', isNew ? '—' : `${formatDate(page.updatedAt)}, ${formatTime(page.updatedAt)}`],
              ]} />
              <div>
                <span className="gc-label">Linked from</span>
                {linked.length || settings.length ? (
                  <ul className="pe-links">
                    {linked.map((m) => <li key={m}><Link href="/store-menus" className="bl-link">{m}</Link></li>)}
                    {settings.map((s) => <li key={s}><Link href="/set-privacy#legal" className="bl-link">{s}</Link></li>)}
                  </ul>
                ) : <p className="gc-help" style={{ margin: 0 }}>No menu links here yet. <Link href="/store-menus" className="bl-link">Add it to a menu</Link></p>}
              </div>
            </Card>
          </aside>
        </div>
      </form>
    </StoreFrame>
  );
}
