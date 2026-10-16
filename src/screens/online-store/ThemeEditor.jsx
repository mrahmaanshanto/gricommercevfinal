'use client';
// Customize theme — Online Store › Theme › Customize (/theme-editor), the theme editor (Module A · A1). Fills the window.
//   Left    a search box over all ~60 options; the 9 groups (Brand & colours, Typography, Layout, Product card, Product
//           page, Category page, Cart & checkout, Footer, Extras); a group's options. Options the store's theme or plan
//           doesn't allow are shown locked with the reason (lib/storefront/access.js). Brand & colours shows the contrast
//           check. Custom CSS is off by default and needs the Business plan and the theme's permission.
//   Right   a live preview of a store page (Home, a product, a category, the cart, search) on a computer or a phone;
//           every change shows at once (sent to the frame), before anything is saved.
//   Header  Save draft; Publish (customers see it; a restore point is kept); More: Undo to last published, Reset to
//           preset, View store.
// Phones: Options / Preview switch. ?group=<id> opens a group. Front end only: lib/storefront/theme.js.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { StatusBadge } from '@/components/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import { Sidebar, Topbar } from '@/shell/Shell';
import { restorePoints, restoreTo, isDirty } from '@/lib/storefront/store';
import { GROUPS, OPTIONS, searchOptions, visibleOptions, themeDraft, themeLive, saveThemeDraft, publishTheme, discardTheme, contrastIssues, themeDoc, DEFAULTS, customCssProblems } from '@/lib/storefront/theme';
import { checkCss } from '@/lib/storefront/customCode';
import { resetThemeToPreset, designName } from '@/lib/storefront/presets';
import { lockOf } from '@/lib/storefront/access';
import { STYLE_PRESETS } from '@/lib/storefront/schema';
import { storeProducts, topCategories } from '@/lib/storefront/catalog';
import { useSf, PreviewFrame, DeviceSwitch, LockNote, BlockPick, when, SFB_CSS } from './sfShared';
import { queryParam } from './storeShared';
import { ImageField } from '@/components/files/FilePicker';

export const TE_CSS = `
.te-moved{display:flex;align-items:center;gap:var(--space-3);margin:var(--space-3) 0;padding:var(--space-3);border:1px dashed var(--border-strong);border-radius:var(--radius-lg);color:var(--text-heading);text-decoration:none}
.te-moved:hover{background:var(--surface-subtle)}
.te-moved span{display:flex;flex-direction:column;gap:2px;flex:1;min-width:0}
.te-moved small{color:var(--text-muted);font-size:var(--text-xs)}
body:has(.te) .gc-ai{display:none}
.te .gc-shell__main.te-main{height:calc(100dvh - var(--shell-inset) * 2);min-height:600px}
.te .gc-shell__content.te-content{flex:1;min-height:0;display:flex;flex-direction:column;padding:var(--space-3) var(--space-4)!important}
.te-page{flex:1;min-height:0;max-width:none;gap:var(--space-3)}
.te-page>.ix-head{flex:none}
.te-body{flex:1;min-height:0;display:grid;grid-template-columns:340px minmax(0,1fr);gap:var(--space-3)}
.te-panel{display:flex;flex-direction:column;min-height:0;border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-card)}
.te-search{padding:var(--space-3);border-bottom:1px solid var(--border-subtle)}
.te-scroll{flex:1;min-height:0;overflow-y:auto;padding:var(--space-2) var(--space-3) var(--space-4)}
.te-styles{margin:0 0 var(--space-4)}
.te-styles__list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2);margin-top:var(--space-2)}
.te-style{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-height:44px;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);color:var(--text-heading);font:inherit;font-size:var(--text-sm);text-align:left;cursor:pointer}
.te-style small{color:var(--text-muted);font-size:var(--text-xs)}
.te-style.is-on{border-color:var(--primary);box-shadow:0 0 0 1px var(--primary)}
.te-groups{list-style:none;margin:0;padding:0}
.te-groups button{display:flex;align-items:center;gap:var(--space-3);width:100%;min-height:44px;padding:0 var(--space-2);border:0;border-radius:var(--radius-lg);background:none;color:var(--text-heading);font:inherit;font-size:var(--text-sm);text-align:left;cursor:pointer}
.te-groups button:hover{background:var(--surface-subtle)}
.te-groups button>span{flex:1}
.te-groups small{color:var(--text-muted);font-size:var(--text-xs)}
.te-back{display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 var(--space-2);border:0;background:none;color:var(--text-muted);font:inherit;font-size:var(--text-sm);cursor:pointer}
.te-gh{margin:var(--space-2) 0 var(--space-3);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.te-sub{margin:var(--space-4) 0 var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.te-opt{display:flex;flex-direction:column;gap:6px;padding:var(--space-2) 0}
.te-opt.is-locked{opacity:.7}
.te-opt>label,.te-opt .te-lbl{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.te-opt .te-inline{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3)}
.te-opt textarea{min-height:140px;font-family:var(--font-code);font-size:var(--text-xs)}
.te-opt .gc-seg{flex-wrap:wrap}
.te-view{display:flex;flex-direction:column;min-height:0;gap:var(--space-2)}
.te-bar{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.te-bar select{max-width:200px}
.te-frame{flex:1;min-height:0}
.te-tabs{display:none}
.te-css-err{margin:6px 0 0;padding:8px 10px 8px 26px;border-radius:var(--radius-lg);background:var(--fill-error-soft);color:var(--text-danger);font-size:var(--text-xs);display:flex;flex-direction:column;gap:2px}
@media (max-width:1023px){
  .te-body{grid-template-columns:300px minmax(0,1fr)}
}
@media (max-width:767px){
  .te .gc-shell__main.te-main{height:auto;min-height:0}
  .te-body{display:flex;flex-direction:column}
  .te-tabs{display:flex}
  .te-body[data-pane="options"] .te-view,.te-body[data-pane="preview"] .te-panel{display:none}
  .te-scroll{max-height:none;overflow:visible}
  .te-frame{height:640px;flex:none}
}
`;
const CSS = SFB_CSS + TE_CSS;

export function OptControl({ o, value, onChange, locked }) {
  const id = 'te-' + o.key;
  const dis = !!locked;
  if (o.type === 'bool') {
    return (
      <div className="te-inline">
        <span className="te-lbl" id={id + '-l'}>{o.label}</span>
        <button type="button" role="switch" className="gc-switch" aria-checked={!!value} aria-labelledby={id + '-l'} disabled={dis} onClick={() => onChange(!value)}><span className="gc-switch__knob" /></button>
      </div>
    );
  }
  const label = <label htmlFor={id}>{o.label}</label>;
  if (o.type === 'color') {
    return (<>{label}<span className="sfb-swatch"><input type="color" aria-label={o.label + ' picker'} value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'} disabled={dis} onChange={(e) => onChange(e.target.value)} /><input id={id} className="gc-input" value={value || ''} disabled={dis} onChange={(e) => onChange(e.target.value.trim())} /></span></>);
  }
  if (o.type === 'choice') {
    const short = o.choices.length <= 3 && o.choices.every((c) => c.label.length <= 14);
    if (short) {
      return (<><span className="te-lbl" id={id + '-l'}>{o.label}</span><div className="gc-seg" role="group" aria-labelledby={id + '-l'}>{o.choices.map((c) => <button key={c.value} type="button" className={'gc-seg__btn' + (value === c.value ? ' gc-seg__btn--active' : '')} aria-pressed={value === c.value} disabled={dis} onClick={() => onChange(c.value)}>{c.label}</button>)}</div></>);
    }
    return (<>{label}<select id={id} className="gc-input gc-select" value={value} disabled={dis} onChange={(e) => onChange(e.target.value)}>{o.choices.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></>);
  }
  if (o.type === 'number') return (<>{label}<input id={id} type="number" className="gc-input" min={o.min} max={o.max} step={o.step || 1} value={value} disabled={dis} onChange={(e) => onChange(Number(e.target.value))} /></>);
  if (o.type === 'css') {
    // the same strict check as Online Store › Snippets (Batch C): CSS that fails is not saved or used
    const probs = String(value || '').trim() ? checkCss(value).problems : [];
    return (<>{label}<textarea id={id} className="gc-input" value={value || ''} disabled={dis} spellCheck={false} placeholder=".sf-card { box-shadow: none; }" aria-invalid={probs.length ? true : undefined} aria-describedby={probs.length ? id + '-err' : undefined} onChange={(e) => onChange(e.target.value)} />{probs.length ? <ul id={id + '-err'} className="te-css-err" role="alert">{probs.map((p) => <li key={p}>{p}</li>)}</ul> : <span className="gc-help">Checked for safety; used on the store pages, never on checkout, account or payment pages.</span>}</>);
  }
  if (o.type === 'block') return (<>{label}<BlockPick id={id} value={value} type={o.blockType} onChange={onChange} /></>);
  if (o.type === 'image') return (<><span className="te-lbl">{o.label}</span><ImageField id={id} value={value || ''} folder="brand" label={o.label.toLowerCase()} onChange={onChange} /></>);
  return (<>{label}<input id={id} className="gc-input" value={value || ''} placeholder={o.placeholder || ''} disabled={dis} onChange={(e) => onChange(e.target.value)} /></>);
}

export default function ThemeEditor() {
  const { ready, d } = useSf();
  const [vals, setVals] = useState(null);
  const [saved, setSaved] = useState('');
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('');
  const [device, setDevice] = useState('desktop');
  const [page, setPage] = useState('/store');
  const [pages, setPages] = useState([['/store', 'Home']]);
  const [pane, setPane] = useState('options');

  useEffect(() => {
    if (!ready || vals) return;
    const v = themeDraft();
    setVals(v); setSaved(JSON.stringify(v));
    const g = queryParam('group');
    if (GROUPS.some((x) => x.id === g)) setGroup(g);
    const p = storeProducts()[0];
    const c = topCategories()[0];
    setPages([['/store', 'Home'], p ? ['/product?handle=' + encodeURIComponent(p.handle), 'A product'] : null, c ? ['/category?handle=' + encodeURIComponent(c.handle), 'A category'] : null, ['/cart', 'Cart'], ['/search?q=phone', 'Search'], ['/offers', 'Offers'], ['/checkout', 'Checkout']].filter(Boolean));
  }, [ready, vals]);

  const dirty = !!vals && JSON.stringify(vals) !== saved;
  useEffect(() => {
    const on = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', on);
    return () => window.removeEventListener('beforeunload', on);
  }, [dirty]);

  const issues = useMemo(() => (vals ? contrastIssues(vals) : []), [vals]);
  const set = (k, x) => setVals((v) => ({ ...v, [k]: x }));
  // Style: one switch sets shape, type and spacing together (schema.js STYLE_PRESETS); options locked for the theme stay
  const styleOn = vals ? STYLE_PRESETS.find((x) => Object.entries(x.values).every(([k, v]) => vals[k] === v)) : null;
  const applyStyle = (x) => {
    const before = vals;
    const skipped = [];
    const next = { ...vals };
    Object.entries(x.values).forEach(([k, v]) => { const o = OPTIONS.find((y) => y.key === k); if (o && lockOf(o)) skipped.push(o.label); else next[k] = v; });
    setVals(next);
    toast(`${x.label} style in your draft${skipped.length ? ' (kept: ' + skipped.join(', ').toLowerCase() + ')' : ''}`, { undo: () => setVals(before) });
  };
  const doc = ready ? themeDoc() : null;
  const unpublished = !!doc && (isDirty({ ...doc, draft: vals || doc.draft }));

  const cssBad = () => { const p = customCssProblems(vals); if (p.length) { toast('Fix the Custom CSS first: ' + p[0], { tone: 'error' }); return true; } return false; };
  const saveDraft = () => { if (cssBad()) return; saveThemeDraft(vals); setSaved(JSON.stringify(vals)); toast('Draft saved. Customers still see the published look.'); };
  const publish = async () => {
    if (cssBad()) return;
    if (issues.length && !(await confirmDialog({ title: 'Some colours are hard to read', body: issues.map((x) => x.text).join(' ') + ' Publish anyway?', confirmLabel: 'Publish anyway' }))) return;
    publishTheme(vals);
    setSaved(JSON.stringify(vals));
    const pt = restorePoints()[0];
    toast('Published. Customers see the new look now.', { undo: () => { if (pt) { restoreTo(pt.id); const v = themeDraft(); setVals(v); setSaved(JSON.stringify(v)); toast('Back to the look before'); } } });
  };
  const undoToLive = async () => {
    if (!(await confirmDialog({ title: 'Undo to the published look?', body: 'Your changes since the last publish are thrown away.', confirmLabel: 'Undo changes', tone: 'danger' }))) return;
    discardTheme();
    const v = themeLive();
    setVals(v); setSaved(JSON.stringify(v));
    toast('Back to the published look');
  };
  const reset = async () => {
    const name = designName(d && d.preset);
    if (!(await confirmDialog({ title: `Reset to ${name}?`, body: `Every option goes back to the ${name} preset in your draft. Customers see it only after you publish.`, confirmLabel: 'Reset' }))) return;
    const v = { ...DEFAULTS, ...resetThemeToPreset() };
    setVals(v); setSaved(JSON.stringify(v));
    toast(`Draft reset to ${name}`);
  };

  const list = q.trim() ? visibleOptions(vals || {}, searchOptions(q)) : group ? visibleOptions(vals || {}, OPTIONS.filter((o) => o.group === group)) : [];
  const g = GROUPS.find((x) => x.id === group);
  // when every option shown is locked for the same reason, say it once above them
  const firstWhy = list.length ? lockOf(list[0]) : '';
  const sameLock = !!firstWhy && list.every((o) => lockOf(o) === firstWhy) ? firstWhy : '';
  const opt = (o) => {
    const why = lockOf(o);
    return (
      <div key={o.key} className={'te-opt' + (why ? ' is-locked' : '')}>
        <OptControl o={o} value={vals[o.key]} onChange={(x) => set(o.key, x)} locked={why} />
        {o.help && !why ? <p className="sfb-muted">{o.help}</p> : null}
        {sameLock ? null : <LockNote text={why} />}
      </div>
    );
  };
  const groupsShown = q.trim() ? GROUPS.filter((x) => list.some((o) => o.group === x.id)) : [];
  // options that moved to their own page (the announcement → Store notices) show as a link where they used to be
  const movedHere = q.trim() ? searchOptions(q).filter((o) => o.moved) : group ? OPTIONS.filter((o) => o.group === group && o.moved) : [];
  const movedLink = movedHere.length ? <a className="te-moved" href={movedHere[0].moved}><Icon name="megaphone" width="16" height="16" aria-hidden="true" /><span><b>Announcement bar</b><small>Now in Store notices: several notices, schedules, countdowns and coupon codes.</small></span><Icon name="arrow-right" width="16" height="16" aria-hidden="true" /></a> : null;

  return (
    <div className="dc-screen ds te" data-screen="ThemeEditor">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="store-theme" />
        <main className="gc-shell__main te-main">
          <Topbar crumb="Online Store" page="Customize theme" />
          <div className="gc-shell__content te-content">
            <div className="ix-page te-page">
              <RecordHeader back="/theme" backLabel="Theme" title="Customize"
                badges={!ready ? null : dirty ? <StatusBadge tone="warning">Not saved</StatusBadge> : unpublished ? <StatusBadge tone="warning">Draft not published</StatusBadge> : <StatusBadge tone="success">Published</StatusBadge>}
                meta={doc ? `${designName(d.preset)} preset · published ${when(doc.liveAt)}` : null}
                about="Change colours, fonts, the product card, the product and category pages, the cart, the footer and extras. The preview shows each change at once. Save draft keeps your work; Publish shows it to customers."
                secondary={[{ label: 'Save draft', onClick: saveDraft, disabled: !vals }]}
                more={[{ label: 'Undo to last published', onClick: undoToLive }, { label: 'Reset to preset', onClick: reset }, { label: 'View store', onClick: () => window.open('/store', '_blank', 'noopener') }]}
                primary={{ label: 'Publish', icon: 'upload', onClick: publish, disabled: !vals }} />

              <div className="gc-seg te-tabs" role="group" aria-label="Show">
                <button type="button" className={'gc-seg__btn' + (pane === 'options' ? ' gc-seg__btn--active' : '')} aria-pressed={pane === 'options'} onClick={() => setPane('options')}>Options</button>
                <button type="button" className={'gc-seg__btn' + (pane === 'preview' ? ' gc-seg__btn--active' : '')} aria-pressed={pane === 'preview'} onClick={() => setPane('preview')}>Preview</button>
              </div>

              <div className="te-body" data-pane={pane}>
                <aside className="te-panel" aria-label="Theme options">
                  <div className="te-search">
                    <label htmlFor="te-q" className="sr-only">Search options</label>
                    <input id="te-q" type="search" className="gc-input" placeholder="Search options (e.g. WhatsApp, font, sale)" value={q} onChange={(e) => setQ(e.target.value)} />
                  </div>
                  <div className="te-scroll">
                    {!vals ? <div style={{ minHeight: 200 }} aria-busy="true" /> : q.trim() ? (
                      list.length || movedLink ? [<LockNote key="lock" text={sameLock} />, <React.Fragment key="moved">{movedLink}</React.Fragment>, ...groupsShown.map((x) => <div key={x.id}><p className="te-sub">{x.label}</p>{list.filter((o) => o.group === x.id).map(opt)}</div>)] : <p className="sfb-muted" style={{ padding: 'var(--space-3) 0' }}>No option matches “{q}”.</p>
                    ) : group ? (<>
                      <button type="button" className="te-back" onClick={() => setGroup('')}><Icon name="arrow-left" width="16" height="16" aria-hidden="true" />All settings</button>
                      <h2 className="te-gh">{g.label}</h2>
                      {group === 'brand' && issues.length ? issues.map((x, i) => <p key={i} className="sfb-warn"><Icon name="triangle-alert" width="14" height="14" aria-hidden="true" /><span>{x.text}</span></p>) : null}
                      <LockNote text={sameLock} />
                      {list.map(opt)}
                      {movedLink}
                    </>) : (<>
                      <div className="te-styles" role="group" aria-labelledby="te-style-h">
                        <p className="te-sub" id="te-style-h">Style</p>
                        <div className="te-styles__list">{STYLE_PRESETS.map((x) => <button key={x.id} type="button" className={'te-style' + (styleOn && styleOn.id === x.id ? ' is-on' : '')} aria-pressed={!!styleOn && styleOn.id === x.id} onClick={() => applyStyle(x)}><b>{x.label}</b><small>{x.hint}</small></button>)}</div>
                      </div>
                      <ul className="te-groups">
                        {GROUPS.map((x) => {
                          const n = OPTIONS.filter((o) => o.group === x.id && !o.moved).length;
                          return <li key={x.id}><button type="button" onClick={() => setGroup(x.id)}><Icon name={x.icon} width="16" height="16" aria-hidden="true" /><span>{x.label}</span>{x.id === 'brand' && issues.length ? <StatusBadge tone="warning">{issues.length}</StatusBadge> : <small>{n}</small>}<Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button></li>;
                        })}
                      </ul>
                    </>)}
                  </div>
                </aside>
                <section className="te-view" aria-label="Preview">
                  <div className="te-bar">
                    <select className="gc-input gc-select" aria-label="Page to preview" value={page} onChange={(e) => setPage(e.target.value)}>{pages.map(([u, l]) => <option key={u} value={u}>{l}</option>)}</select>
                    <DeviceSwitch device={device} onChange={setDevice} />
                  </div>
                  <div className="te-frame">{vals ? <PreviewFrame src={page + (page.includes('?') ? '&' : '?') + 'preview=1'} device={device} parts={[['theme', vals]]} height="fill" /> : null}</div>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
