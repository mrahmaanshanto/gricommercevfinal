'use client';
// StoreEditor — Online Store › Theme › Edit store (/store-editor; Batch A step 7): one visual editor for a page of the
// store. The live page is on the right; on the left:
//   Sections  the page's sections. Click one on the page or in the list to edit its settings here (the same fields as
//             Layouts), drag to reorder (or Move up / down), hide, remove, Add section from the library (every section
//             type with its looks). The page outlines what is picked (storefront/editBridge.jsx).
//   Style     one-switch styles and the main options (colours, fonts, corners, buttons, header colour, photo shape);
//             every other option is in Customize.
//   Header    which header this page shows; the headers themselves are built in the Header builder.
// Pages: every layout (Home, product, category, cart, search, page, not found and condition layouts). Undo / Redo cover
// everything changed here; Save draft keeps it for staff; Publish shows the layout and the style to customers (a restore
// point first). Customize, Layouts and Header builder stay for the full option lists.
// Full screen (Batch C step 5): no app menu or top bar; the editor's own slim bar holds Back, the page picker, Computer /
// Phone, Undo / Redo, More, Save draft and Publish, so the page being edited gets the whole window.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { StatusBadge } from '@/components/ui';
import { Menu } from '@/components/ui/IndexKit';
import { getLayouts, getLayout, kindBy, SECTION_TYPES, sectionType, newSection, saveLayoutDraft, publishLayout, addLayout, layoutFor, condText } from '@/lib/storefront/layouts';
import { OPTIONS, themeDraft, saveThemeDraft, publishTheme, contrastIssues } from '@/lib/storefront/theme';
import { STYLE_PRESETS } from '@/lib/storefront/schema';
import { lockOf } from '@/lib/storefront/access';
import { useSf, PreviewFrame, DeviceSwitch, LockNote, SFB_CSS } from './sfShared';
import { SectionFields, previewPath, STARTER, summary, LE_CSS } from './LayoutEdit';
import { OptControl, TE_CSS } from './ThemeEditor';
import { queryParam } from './storeShared';

const CSS = SFB_CSS + TE_CSS + LE_CSS + `
.se-tabs{display:flex;gap:4px;padding:var(--space-2) var(--space-3) 0;border-bottom:1px solid var(--border-subtle)}
.se-tabs button{min-height:40px;padding:0 var(--space-3);border:0;border-bottom:2px solid transparent;background:none;color:var(--text-muted);font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);cursor:pointer}
.se-tabs button[aria-selected="true"]{color:var(--primary);border-bottom-color:var(--primary)}
.se-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px}
.se-sec{display:flex;align-items:center;gap:var(--space-2);min-height:48px;padding:4px var(--space-2);border:1px solid transparent;border-radius:var(--radius-lg);background:var(--surface-card)}
.se-sec:hover{background:var(--surface-subtle)}
.se-sec.is-sel{border-color:var(--primary);background:var(--primary-50)}
.se-sec.is-hidden .se-sec__t{opacity:.55}
.se-sec.is-drop{box-shadow:0 -2px 0 var(--primary)}
.se-grip{display:grid;place-items:center;width:24px;height:36px;color:var(--text-muted);cursor:grab;flex:none}
.se-sec__b{display:flex;align-items:center;gap:var(--space-2);flex:1;min-width:0;min-height:40px;padding:0;border:0;background:none;color:var(--text-heading);font:inherit;text-align:left;cursor:pointer}
.se-sec__t{display:flex;flex-direction:column;min-width:0}
.se-sec__t b{font-size:var(--text-sm);font-weight:var(--weight-medium)}
.se-sec__t small{font-size:var(--text-xs);color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.se-ico{display:grid;place-items:center;width:28px;height:28px;flex:none;border-radius:var(--radius-md);background:var(--surface-subtle);color:var(--text-muted)}
.se-add{margin-top:var(--space-3)}
.se-lib{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2)}
.se-lib button{display:flex;flex-direction:column;align-items:flex-start;gap:4px;min-height:64px;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);color:var(--text-heading);font:inherit;font-size:var(--text-sm);text-align:left;cursor:pointer}
.se-lib button:hover{border-color:var(--primary)}
.se-lib button[disabled]{opacity:.5;cursor:not-allowed}
.se-lib small{color:var(--text-muted);font-size:var(--text-xs)}
.se-head{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);margin-bottom:var(--space-2)}
.se-acts{display:flex;flex-wrap:wrap;gap:6px;margin:var(--space-3) 0}
.se-tools{display:flex;align-items:center;gap:4px}
.se-frame{flex:1;min-height:0}
.se-hint{margin:var(--space-2) 0 0;font-size:var(--text-xs);color:var(--text-muted)}
/* full screen: the editor's own bar instead of the app menu and top bar */
.se-full{display:flex;flex-direction:column;height:100dvh;min-height:560px;background:var(--surface-page,#f1f5f9);overflow:hidden}
.se-bar{flex:none;display:flex;align-items:center;gap:var(--space-2);height:52px;padding:0 var(--space-3);border-bottom:1px solid var(--border-subtle);background:var(--surface-card)}
.se-bar__back{display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 var(--space-2);border-radius:var(--radius-lg);color:var(--text-body);font-size:var(--text-sm);text-decoration:none;white-space:nowrap}
.se-bar__back:hover{background:var(--surface-subtle)}
.se-bar__t{display:flex;align-items:center;gap:var(--space-2);min-width:0;padding-left:var(--space-2);border-left:1px solid var(--border-subtle)}
.se-bar__t b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap}
.se-bar select{max-width:240px;height:36px}
.se-bar__mid{display:flex;align-items:center;gap:var(--space-2);margin:0 auto}
.se-bar__end{display:flex;align-items:center;gap:var(--space-2)}
.se-full .te-body{flex:1;min-height:0;padding:var(--space-3)}
.se-full .te-tabs{margin:var(--space-2) var(--space-3) 0}
@media (max-width:1180px){.se-bar__t b{display:none}.se-bar__t{border-left:0;padding-left:0}}
@media (max-width:767px){
  .se-full{height:auto;min-height:100dvh;overflow:visible}
  .se-bar{position:sticky;top:0;z-index:5;height:auto;min-height:52px;flex-wrap:wrap;padding:6px var(--space-3)}
  .se-bar__mid{order:3;width:100%;margin:0;justify-content:space-between}
  .se-bar__mid select{flex:1;max-width:none}
  .se-bar__end{margin-left:auto}
  .se-bar__back span,.se-bar__draft{display:none}
}
`;

const clone = (x) => JSON.parse(JSON.stringify(x));
const KEY_OPTIONS = ['primary', 'accent', 'fontPair', 'corners', 'buttons', 'headerTone', 'cardRatio'];
const looksOf = (t) => { const f = (t.fields || []).find((x) => x[2] === 'look'); return f ? f[4].length : 0; };

export default function StoreEditor() {
  const { ready, d } = useSf();
  const [id, setId] = useState('');
  const [work, setWork] = useState(null);
  const [vals, setVals] = useState(null);
  const [base, setBase] = useState('');
  const [hist, setHist] = useState({ past: [], future: [] });
  const [sel, setSel] = useState(null);       // a section id, 'header' or null
  const [tab, setTab] = useState('sections');
  const [adding, setAdding] = useState(false);
  const [device, setDevice] = useState('desktop');
  const [pane, setPane] = useState('edit');
  const [drag, setDrag] = useState(null);
  const [over, setOver] = useState(null);
  const box = useRef(null);
  // the latest state, for Undo buttons in toasts (their callbacks outlive this render)
  const now = useRef({});
  now.current = { work, vals, hist };

  // open a layout: ?layout=<id>, else the layout customers see on Home (one is made from the default when there is none)
  const open = useCallback((lid) => {
    const l = getLayout(lid);
    if (!l) return;
    const W = clone(l.doc.draft);
    const V = themeDraft();
    setId(lid); setWork(W); setVals(V); setBase(JSON.stringify([W, V])); setHist({ past: [], future: [] }); setSel(null); setAdding(false);
    try { window.history.replaceState(window.history.state, '', '/store-editor?layout=' + encodeURIComponent(lid)); } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    if (!ready || id) return;
    let lid = queryParam('layout');
    if (!getLayout(lid)) lid = (layoutFor('home') || {}).id || '';
    if (!getLayout(lid)) { const h = getLayouts().find((x) => x.kind === 'home'); lid = h ? h.id : addLayout('home', 'Home').id; }
    open(lid);
  }, [ready, id, open]);

  const l = id ? getLayout(id) : null;
  const dirty = !!work && JSON.stringify([work, vals]) !== base;
  useEffect(() => {
    const on = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', on);
    return () => window.removeEventListener('beforeunload', on);
  }, [dirty]);

  // every change goes through here, so Undo / Redo cover it
  const last = useRef({ tag: '', at: 0 });
  const change = (nextWork, nextVals, tag = '') => {
    const { work: w, vals: v } = now.current;
    // typing in one field is one step, not one per letter
    const same = tag && last.current.tag === tag && Date.now() - last.current.at < 1500;
    last.current = { tag, at: Date.now() };
    if (!same) setHist((h) => ({ past: [...h.past.slice(-49), [w, v]], future: [] }));
    if (nextWork) setWork(nextWork);
    if (nextVals) setVals(nextVals);
  };
  const undo = () => { const { work: w, vals: v, hist: h } = now.current; if (!h.past.length) return; const [W, V] = h.past[h.past.length - 1]; setHist({ past: h.past.slice(0, -1), future: [[w, v], ...h.future] }); setWork(W); setVals(V); };
  const redo = () => { const { work: w, vals: v, hist: h } = now.current; if (!h.future.length) return; const [W, V] = h.future[0]; setHist({ past: [...h.past, [w, v]], future: h.future.slice(1) }); setWork(W); setVals(V); };
  useEffect(() => {
    const key = (e) => {
      if (!(e.ctrlKey || e.metaKey) || /input|textarea|select/i.test((e.target && e.target.tagName) || '')) return;
      if (e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      else if ((e.key.toLowerCase() === 'z' && e.shiftKey) || e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });

  const sections = work ? work.sections : [];
  const setSecs = (list) => change({ ...work, sections: list });
  const secLock = ready ? lockOf('sections') : '';
  const heroLock = ready ? lockOf('hero') : '';
  const current = sel && sel !== 'header' ? sections.find((s) => s.id === sel) || null : null;

  // the page: a click picks a section; the panel points the page at what is picked
  const frameWin = () => { const f = box.current && box.current.querySelector('iframe'); return f && f.contentWindow; };
  const focus = (sid) => { try { const w = frameWin(); if (w) w.postMessage({ gcSfFocus: sid || '' }, window.location.origin); } catch { /* ignore */ } };
  useEffect(() => {
    const on = (e) => {
      if (e.origin !== window.location.origin || !e.data || !e.data.gcSfPick) return;
      const pick = e.data.gcSfPick;
      setAdding(false);
      if (pick === 'header') { setSel('header'); setTab('header'); } else { setSel(pick); setTab('sections'); }
      setPane('edit');
    };
    window.addEventListener('message', on);
    return () => window.removeEventListener('message', on);
  }, []);
  const pick = (sid) => { setSel(sid); setAdding(false); focus(sid); };

  const patch = (p) => change({ ...work, sections: sections.map((x) => (x.id === sel ? { ...x, ...p } : x)) }, null, 'sec:' + sel + ':' + Object.keys(p).join(','));
  const move = (i, dir) => { const j = i + dir; if (secLock || j < 0 || j >= sections.length) return; const list = sections.slice(); [list[i], list[j]] = [list[j], list[i]]; setSecs(list); };
  const toggle = (s) => { if (secLock) return; setSecs(sections.map((x) => (x.id === s.id ? { ...x, hidden: !x.hidden } : x))); };
  const remove = (s) => { if (secLock || s.type === 'main') return; setSecs(sections.filter((x) => x.id !== s.id)); setSel(null); toast(`${sectionType(s.type).label} removed`, { undo }); };
  const add = (type) => {
    const s = newSection(type, typeof STARTER[type] === 'function' ? STARTER[type]() : clone(STARTER[type] || {}));
    const at = current ? sections.findIndex((x) => x.id === current.id) + 1 : sections.length;
    const list = sections.slice(); list.splice(at, 0, s);
    setSecs(list); setAdding(false); setSel(s.id);
    setTimeout(() => focus(s.id), 900);
  };
  const dropOn = (i) => {
    if (drag == null || secLock) return;
    const list = sections.slice(); const [x] = list.splice(drag, 1); list.splice(drag < i ? i - 1 : i, 0, x);
    setSecs(list); setDrag(null); setOver(null);
  };

  const setOpt = (k, v) => change(null, { ...vals, [k]: v }, 'opt:' + k);
  const styleOn = vals ? STYLE_PRESETS.find((x) => Object.entries(x.values).every(([k, v]) => vals[k] === v)) : null;
  const applyStyle = (x) => { const next = { ...vals }; Object.entries(x.values).forEach(([k, v]) => { const o = OPTIONS.find((y) => y.key === k); if (!(o && lockOf(o))) next[k] = v; }); change(null, next); toast(`${x.label} style`, { undo }); };
  const issues = useMemo(() => (vals ? contrastIssues(vals) : []), [vals]);

  const themeChanged = () => !!vals && JSON.stringify(vals) !== JSON.stringify(themeDraft());
  const saveDraft = () => { saveLayoutDraft(id, work, l.name); if (themeChanged()) saveThemeDraft(vals); setBase(JSON.stringify([work, vals])); toast('Draft saved. Customers still see the published store.'); };
  const publish = async () => {
    if (issues.length && !(await confirmDialog({ title: 'Some colours are hard to read', body: issues.map((x) => x.text).join(' ') + ' Publish anyway?', confirmLabel: 'Publish anyway' }))) return;
    publishLayout(id, work, l.name);
    if (themeChanged() || JSON.stringify(vals) !== JSON.stringify((d && d.theme && d.theme.live) || {})) publishTheme(vals);
    setBase(JSON.stringify([work, vals]));
    toast(`${l.name} published. Customers see it now.`);
  };
  // Back to Theme: ask first when there are unsaved changes
  const leave = async (e) => {
    if (!dirty) return;
    e.preventDefault();
    if (await confirmDialog({ title: 'Leave without saving?', body: 'Your changes are thrown away. Save draft keeps them.', confirmLabel: 'Leave', tone: 'danger' })) window.location.href = '/theme';
  };
  const switchTo = async (lid) => {
    if (lid === id) return;
    if (dirty && !(await confirmDialog({ title: 'Leave without saving?', body: 'Your changes on this page are thrown away. Save draft keeps them.', confirmLabel: 'Leave', tone: 'danger' }))) return;
    open(lid);
  };

  const layouts = ready ? getLayouts() : [];
  const src = l && work ? (() => { const p = previewPath(l.kind, work.cond); return p + (p.includes('?') ? '&' : '?') + 'preview=1&edit=1&layout=' + encodeURIComponent(id); })() : '';
  const parts = useMemo(() => (work && vals ? [['layout:' + id, work], ['theme', vals]] : []), [work, vals, id]);

  const T = current ? sectionType(current.type) : null;
  return (
    <div className="dc-screen ds te se se-full" data-screen="StoreEditor">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <h1 className="sr-only">Edit store</h1>
      <span className="gc-pagehead__about" hidden>Click any part of the page to change it. Drag sections to reorder them, add new ones from the library, change the style and the header. Save draft keeps your work; Publish shows it to customers.</span>
      <header className="se-bar" aria-label="Store editor">
        <a className="se-bar__back" href="/theme" onClick={leave}><Icon name="arrow-left" width="16" height="16" aria-hidden="true" /><span>Theme</span></a>
        <span className="se-bar__t"><b>Edit store</b>{!work ? null : dirty ? <StatusBadge tone="warning">Not saved</StatusBadge> : null}</span>
        <span className="se-bar__mid">
          <select className="gc-input gc-select" aria-label="Page to edit" value={id} onChange={(e) => switchTo(e.target.value)} title={l ? `${kindBy(l.kind).label} · ${condText(work ? work.cond : null)}` : undefined}>
            {layouts.map((x) => <option key={x.id} value={x.id}>{x.name}{x.name !== kindBy(x.kind).label ? ' · ' + kindBy(x.kind).label : ''}</option>)}
          </select>
          <DeviceSwitch device={device} onChange={setDevice} />
          <span className="se-tools">
            <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Undo" title="Undo (Ctrl+Z)" disabled={!hist.past.length} onClick={undo}><Icon name="undo-2" width="16" height="16" /></button>
            <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Redo" title="Redo (Ctrl+Shift+Z)" disabled={!hist.future.length} onClick={redo}><Icon name="redo-2" width="16" height="16" /></button>
          </span>
        </span>
        <span className="se-bar__end">
          <Menu label="More" icon="ellipsis" items={[{ label: 'All theme options (Customize)', href: '/theme-editor' }, { label: 'Layouts', href: '/layouts' }, { label: 'Header builder', href: '/header-builder' }, { label: 'Open preview', onClick: () => src && window.open(src.replace('&edit=1', ''), '_blank', 'noopener') }, { label: 'Save draft', onClick: saveDraft, disabled: !work || !dirty, only: 'phone' }]} />
          <button type="button" className="ix-btn se-bar__draft" disabled={!work || !dirty} onClick={saveDraft}>Save draft</button>
          <button type="button" className="ix-btn ix-btn--primary" disabled={!work} onClick={publish}><Icon name="upload" width="16" height="16" aria-hidden="true" />Publish</button>
        </span>
      </header>

              <div className="gc-seg te-tabs" role="group" aria-label="Show">
                <button type="button" className={'gc-seg__btn' + (pane === 'edit' ? ' gc-seg__btn--active' : '')} aria-pressed={pane === 'edit'} onClick={() => setPane('edit')}>Edit</button>
                <button type="button" className={'gc-seg__btn' + (pane === 'preview' ? ' gc-seg__btn--active' : '')} aria-pressed={pane === 'preview'} onClick={() => setPane('preview')}>Preview</button>
              </div>

              <div className="te-body" data-pane={pane === 'edit' ? 'options' : 'preview'}>
                <aside className="te-panel" aria-label="Edit the page">
                  <div className="se-tabs" role="tablist" aria-label="What to edit">
                    {[['sections', 'Sections'], ['style', 'Style'], ['header', 'Header']].map(([k, lb]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => { setTab(k); if (k !== 'header' && sel === 'header') setSel(null); }}>{lb}</button>)}
                  </div>
                  <div className="te-scroll">
                    {!work ? <div style={{ minHeight: 200 }} aria-busy="true" /> : tab === 'style' ? (<>
                      <p className="te-sub">Style</p>
                      <div className="te-styles__list">{STYLE_PRESETS.map((x) => <button key={x.id} type="button" className={'te-style' + (styleOn && styleOn.id === x.id ? ' is-on' : '')} aria-pressed={!!styleOn && styleOn.id === x.id} onClick={() => applyStyle(x)}><b>{x.label}</b><small>{x.hint}</small></button>)}</div>
                      <p className="te-sub">Main options</p>
                      {issues.length ? issues.map((x, i) => <p key={i} className="sfb-warn"><Icon name="triangle-alert" width="14" height="14" aria-hidden="true" /><span>{x.text}</span></p>) : null}
                      {KEY_OPTIONS.map((k) => OPTIONS.find((o) => o.key === k)).filter(Boolean).map((o) => { const why = lockOf(o); return <div key={o.key} className={'te-opt' + (why ? ' is-locked' : '')}><OptControl o={o} value={vals[o.key]} onChange={(x) => setOpt(o.key, x)} locked={why} /><LockNote text={why} /></div>; })}
                      <p className="se-hint">Every other option (product card, product and category pages, cart, footer, extras) is in <a href="/theme-editor">Customize</a>.</p>
                    </>) : tab === 'header' ? (<>
                      <p className="te-sub">This page shows</p>
                      <select className="gc-input gc-select" aria-label="Header on this page" value={work.header || ''} disabled={!!lockOf('header')} onChange={(e) => change({ ...work, header: e.target.value })}>
                        <option value="">The default header{(d.headers || []).find((h) => h.id === d.defaultHeader) ? ' (' + (d.headers.find((h) => h.id === d.defaultHeader).name) + ')' : ''}</option>
                        {(d.headers || []).map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                      </select>
                      <LockNote text={lockOf('header')} />
                      <div className="se-acts"><a className="ix-btn ix-btn--sm" href="/header-builder">Edit headers</a><a className="ix-btn ix-btn--sm" href="/store-notices">Store notices</a><a className="ix-btn ix-btn--sm" href="/store-menus">Menus</a></div>
                      <p className="se-hint">Rows, logo, search, menu and the phone header are built in the Header builder; this page uses the one picked here.</p>
                    </>) : adding ? (<>
                      <div className="se-head"><button type="button" className="te-back" onClick={() => setAdding(false)}><Icon name="arrow-left" width="16" height="16" aria-hidden="true" />Sections</button></div>
                      <p className="te-sub" style={{ marginTop: 0 }}>Add a section{current ? ' after ' + sectionType(current.type).label : ''}</p>
                      <div className="se-lib">{SECTION_TYPES.map((t) => { const why = t.lock ? lockOf(t.lock) : ''; const n = looksOf(t); return <button key={t.type} type="button" disabled={!!why} title={why || undefined} onClick={() => add(t.type)}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name={t.icon} width="16" height="16" aria-hidden="true" />{t.label}</span>{n ? <small>{n} looks</small> : null}</button>; })}</div>
                    </>) : current ? (<>
                      <div className="se-head">
                        <button type="button" className="te-back" onClick={() => { setSel(null); focus(''); }}><Icon name="arrow-left" width="16" height="16" aria-hidden="true" />All sections</button>
                        <span className="se-tools">
                          <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Move up" disabled={!!secLock || sections.indexOf(current) === 0} onClick={() => move(sections.indexOf(current), -1)}><Icon name="arrow-up" width="16" height="16" /></button>
                          <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Move down" disabled={!!secLock || sections.indexOf(current) === sections.length - 1} onClick={() => move(sections.indexOf(current), 1)}><Icon name="arrow-down" width="16" height="16" /></button>
                          {current.type !== 'main' ? <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={current.hidden ? 'Show' : 'Hide'} disabled={!!secLock} onClick={() => toggle(current)}><Icon name={current.hidden ? 'eye' : 'eye-off'} width="16" height="16" /></button> : null}
                          {current.type !== 'main' ? <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Remove" disabled={!!secLock || (current.type === 'hero' && !!heroLock)} onClick={() => remove(current)}><Icon name="trash-2" width="16" height="16" /></button> : null}
                        </span>
                      </div>
                      <h2 className="te-gh"><Icon name={T.icon} width="16" height="16" aria-hidden="true" /> {T.label}</h2>
                      {current.type === 'main' ? <p className="se-hint">The page itself (the product, the category's products, the cart …). It can move, but it stays.</p> : (
                        <div className="sfb-fields"><SectionFields key={current.id} f={current} set={patch} locked={current.type === 'hero' && !!heroLock} /></div>
                      )}
                    </>) : (<>
                      <LockNote text={secLock ? secLock + ' You can still change what each section shows.' : ''} />
                      <ul className="se-list" aria-label="Sections on this page">
                        {sections.map((s, i) => {
                          const t = sectionType(s.type);
                          return (
                            <li key={s.id} className={'se-sec' + (s.hidden ? ' is-hidden' : '') + (over === i ? ' is-drop' : '')}
                              draggable={!secLock} onDragStart={() => setDrag(i)} onDragEnd={() => { setDrag(null); setOver(null); }}
                              onDragOver={(e) => { if (drag != null) { e.preventDefault(); setOver(i); } }} onDrop={(e) => { e.preventDefault(); dropOn(i); }}
                              onMouseEnter={() => focus(s.id)}>
                              <span className="se-grip" aria-hidden="true" title="Drag to move"><Icon name="grip-vertical" width="16" height="16" /></span>
                              <button type="button" className="se-sec__b" onClick={() => pick(s.id)}>
                                <span className="se-ico" aria-hidden="true"><Icon name={t.icon} width="16" height="16" /></span>
                                <span className="se-sec__t"><b>{t.label}</b><small>{summary(s, l.kind)}</small></span>
                              </button>
                              {s.type !== 'main' ? <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={(s.hidden ? 'Show ' : 'Hide ') + t.label} disabled={!!secLock} onClick={() => toggle(s)}><Icon name={s.hidden ? 'eye' : 'eye-off'} width="16" height="16" /></button> : null}
                            </li>
                          );
                        })}
                        <li className={'se-sec' + (over === sections.length ? ' is-drop' : '')} style={{ minHeight: 8, padding: 0 }} onDragOver={(e) => { if (drag != null) { e.preventDefault(); setOver(sections.length); } }} onDrop={(e) => { e.preventDefault(); dropOn(sections.length); }} aria-hidden="true" />
                      </ul>
                      <div className="se-add"><button type="button" className="ix-btn" disabled={!!secLock} onClick={() => setAdding(true)}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add section</button></div>
                      <p className="se-hint">Click any part of the page to edit it. Drag sections to reorder them.</p>
                    </>)}
                  </div>
                </aside>
                <section className="te-view" aria-label="Preview">
                  <div className="te-frame se-frame" ref={box}>{src ? <PreviewFrame key={id + device} src={src} device={device} parts={parts} height="fill" title="Your store, editable" /> : null}</div>
                </section>
              </div>
    </div>
  );
}
