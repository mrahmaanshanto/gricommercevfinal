'use client';
// Edit layout — Online Store › Layouts › a layout (/layout-edit?id=): the page editor. Fills the window.
//   Left     Sections (layers): every section in order — click to select, drag or arrows to move, hide, duplicate,
//            remove; "Layout settings" (name, shows on, header) at the top; Add section opens the section library,
//            where each kind shows its looks (styles) as drawings.
//   Middle   the live page on a computer, a tablet or a phone. Click any section in the page to select it; edits show
//            at once (sent to the frame before anything is saved).
//   Right    the selected section: Content (its look and what it shows), Style (spacing per device, width, alignment,
//            background colour or picture, text colour, heading font and size, buttons) and Advanced (show on which
//            devices, entrance animation, anchor, CSS class). Style values set on the tablet or the phone apply there
//            only; the rest comes from the computer.
//   Header   Save draft · Publish (restore point first) · Undo / Redo (Ctrl+Z, Ctrl+Shift+Z) · More: Undo to last
//            published, Open preview, Duplicate, Delete. Sections lock as the theme's merchant-editing switches say.
// Phones: Sections / Preview / Edit switch. Front end only: lib/storefront/layouts.js + styles.js.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, StatusBadge, EmptyState } from '@/components/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import { Sidebar, Topbar } from '@/shell/Shell';
import { getLayout, kindBy, SECTION_TYPES, LIB_GROUPS, groupOf, sectionType, newSection, variantOf, slide, TONES, CONDS, ICONS, condProblem, saveLayoutDraft, publishLayout, discardLayout, duplicateLayout, deleteLayout } from '@/lib/storefront/layouts';
import { DEVICES, STEPS, SPACING, WIDTHS, ALIGNS, HSIZES, BTNS, ANIMS, FONTS, DIVIDERS, PATTERNS, stepAt, ownStep, setStep, boxSummary, cleanBox } from '@/lib/storefront/styles';
import { sfId } from '@/lib/storefront/store';
import { lockOf } from '@/lib/storefront/access';
import { flashSales, storeProducts, topCategories } from '@/lib/storefront/catalog';
import { getBlock } from '@/lib/storefront/blocks';
import { getPages } from '@/lib/storePages';
import { getCategories, categoryHandle } from '@/lib/productCategories';
import { allProducts, productHandle } from '@/lib/products';
import { ImageField } from '@/components/files/FilePicker';
import { STARTER, lookPatch } from '@/screens/storefront/sectionStarters';
import { getCustom } from '@/lib/storefront/customs';
import { queryParam } from './storeShared';
import { Field, FIELDS_CSS } from './SectionFields';
import { useSf, PreviewFrame, DeviceSwitch, LockNote, DocBadge, StyleSketch, BlockPick, CatPick, ProductPick, when, SFB_CSS } from './sfShared';

const clone = (x) => JSON.parse(JSON.stringify(x));
const DEV_OF = { desktop: 'd', tablet: 't', phone: 'm' };
const PREVIEW_OF = { d: 'desktop', t: 'tablet', m: 'phone' };

const CSS = SFB_CSS + FIELDS_CSS + `
body:has(.le) .gc-ai{display:none}
.le .gc-shell__main.le-main{height:calc(100dvh - var(--shell-inset) * 2);min-height:620px}
.le .gc-shell__content.le-content{flex:1;min-height:0;display:flex;flex-direction:column;padding:var(--space-3) var(--space-4)!important}
.le-page{flex:1;min-height:0;max-width:none;gap:var(--space-3)}
.le-page>.ix-head{flex:none}
.le-body{flex:1;min-height:0;display:grid;grid-template-columns:272px minmax(0,1fr) 340px;gap:var(--space-3)}
.le-panel{display:flex;flex-direction:column;min-height:0;border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-card)}
.le-ph{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);min-height:48px;padding:0 var(--space-3);border-bottom:1px solid var(--border-subtle)}
.le-ph h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);display:flex;align-items:center;gap:var(--space-2);min-width:0}
.le-ph h2 span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.le-scroll{flex:1;min-height:0;overflow-y:auto;padding:var(--space-2)}
.le-pf{padding:var(--space-3);border-top:1px solid var(--border-subtle)}
.le-pf .gc-btn{width:100%}
.le-layers{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px}
.le-layer{position:relative;display:flex;align-items:center;gap:var(--space-2);min-height:44px;padding:4px 4px 4px 6px;border:1px solid transparent;border-radius:var(--radius-lg);cursor:pointer}
.le-layer:hover{background:var(--surface-subtle)}
.le-layer.is-on{background:var(--fill-primary-soft);border-color:color-mix(in srgb,var(--primary) 35%,transparent)}
.le-layer.is-hidden .le-lt{opacity:.5}
.le-layer.is-main .le-li{background:var(--surface-subtle);color:var(--text-muted)}
.le-layer.is-drop{box-shadow:0 -2px 0 var(--primary)}
.le-grip{display:grid;place-items:center;width:16px;flex:none;color:var(--text-muted);cursor:grab}
.le-li{display:grid;place-items:center;width:28px;height:28px;flex:none;border-radius:var(--radius-md);background:var(--fill-primary-soft);color:var(--primary)}
.le-lt{flex:1;min-width:0;display:flex;flex-direction:column;border:0;background:none;padding:0;font:inherit;text-align:left;cursor:pointer;color:inherit}
.le-lt b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.le-lt small{font-size:var(--text-xs);color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.le-la{position:absolute;right:4px;top:50%;transform:translateY(-50%);display:none;gap:0;padding-left:12px;border-radius:var(--radius-lg);background:linear-gradient(90deg,transparent,var(--le-row) 12px)}
.le-layer{--le-row:var(--surface-card)}
.le-layer:hover{--le-row:var(--surface-subtle)}
.le-layer.is-on{--le-row:var(--fill-primary-soft)}
.le-layer:hover .le-la,.le-layer:focus-within .le-la{display:flex}
.le-la .ix-btn{width:28px;height:28px;min-height:28px}
.le-settings{display:flex;align-items:center;gap:var(--space-2);width:100%;min-height:40px;margin-bottom:var(--space-2);padding:0 var(--space-2);border:1px dashed var(--border-strong);border-radius:var(--radius-lg);background:none;font:inherit;font-size:var(--text-sm);color:var(--text-heading);cursor:pointer}
.le-settings.is-on{border-style:solid;border-color:var(--primary);background:var(--fill-primary-soft)}
.le-view{display:flex;flex-direction:column;min-height:0;gap:var(--space-2)}
.le-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-2)}
.le-bar small{font-size:var(--text-xs);color:var(--text-muted)}
.le-frame{flex:1;min-height:0}
.le-tabs{display:flex;gap:2px;padding:var(--space-2) var(--space-3) 0;border-bottom:1px solid var(--border-subtle)}
.le-tabs button{min-height:36px;padding:0 var(--space-3);border:0;border-bottom:2px solid transparent;background:none;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-muted);cursor:pointer}
.le-tabs button[aria-selected="true"]{color:var(--primary);border-bottom-color:var(--primary)}
.le-insp{display:flex;flex-direction:column;gap:var(--space-4);padding:var(--space-3)}
.le-h3{margin:0 0 calc(var(--space-2) * -1);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.le-looks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2)}
.le-look{display:flex;flex-direction:column;gap:4px;padding:4px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-subtle);font:inherit;font-size:var(--text-xs);color:var(--text-heading);text-align:left;cursor:pointer}
.le-look .sfb-sketch{border-radius:var(--radius-md)}
.le-look:hover{border-color:var(--border-strong)}
.le-look[aria-checked="true"]{border-color:var(--primary);box-shadow:0 0 0 2px var(--fill-primary-soft);background:var(--surface-card)}
.le-look span{padding:0 2px 2px}
.le-dev{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);padding:var(--space-2);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-muted)}
.le-steps{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px;padding:2px;border-radius:var(--radius-lg);background:var(--surface-subtle)}
.le-steps button{min-width:0;min-height:30px;padding:0;border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-xs);color:var(--text-body);cursor:pointer}
.le-steps button[aria-pressed="true"]{background:var(--surface-card);color:var(--primary);font-weight:var(--weight-semibold);box-shadow:var(--shadow-card)}
.le-steprow{display:flex;flex-direction:column;gap:4px}
.le-steprow>div{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-heading)}
.le-own{display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs);color:var(--primary)}
.le-own button{border:0;background:none;padding:0;font:inherit;color:var(--text-muted);text-decoration:underline;cursor:pointer}
.le-seg{display:flex;gap:2px;padding:2px;border-radius:var(--radius-lg);background:var(--surface-subtle)}
.le-seg button{flex:1;min-height:30px;border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-xs);color:var(--text-body);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:4px}
.le-seg button[aria-pressed="true"]{background:var(--surface-card);color:var(--primary);font-weight:var(--weight-semibold);box-shadow:var(--shadow-card)}
.le-colour{display:flex;align-items:center;gap:var(--space-2)}
.le-colour input[type=color]{width:36px;height:32px;padding:0;border:1px solid var(--border-field);border-radius:var(--radius-lg);background:none;cursor:pointer}
.le-colour .gc-input{flex:1;font-family:var(--font-data)}
.le-range{display:flex;align-items:center;gap:var(--space-2)}
.le-range input{flex:1;accent-color:var(--primary)}
.le-range output{min-width:36px;text-align:right;font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.le-sub{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.le-subhead{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.le-picked{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px;font-size:var(--text-sm)}
.le-picked li{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2)}
.le-iconpick{display:flex;align-items:center;gap:8px}
.le-iconpick__now{display:grid;place-items:center;flex:none;width:32px;height:32px;border-radius:var(--radius-md);background:var(--surface-subtle);color:var(--primary)}
.le-sw{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:36px;font-size:var(--text-sm);color:var(--text-heading)}
.le-empty{padding:var(--space-5) var(--space-3);text-align:center;font-size:var(--text-sm);color:var(--text-muted)}
.le-lib h3{margin:var(--space-4) 0 var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.le-lib h3:first-child{margin-top:0}
.le-libk{margin-bottom:var(--space-3)}
.le-libk>b{display:flex;align-items:center;gap:6px;margin-bottom:6px;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.le-libk>b small{font-weight:var(--weight-regular);color:var(--text-muted);font-size:var(--text-xs)}
.le-libgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2)}
.le-libone{display:flex;align-items:center;gap:var(--space-2);width:100%;min-height:44px;padding:0 var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;font-size:var(--text-sm);color:var(--text-heading);cursor:pointer;text-align:left}
.le-libone:hover{border-color:var(--primary)}
.le-libone[disabled],.le-look[disabled]{opacity:.5;cursor:not-allowed}
.le-ptabs{display:none}
@media (max-width:1279px){.le-body{grid-template-columns:240px minmax(0,1fr) 320px}}
@media (max-width:1023px){
  .le .gc-shell__main.le-main{height:auto;min-height:0}
  .le-body{display:flex;flex-direction:column}
  .le-ptabs{display:flex}
  .le-body[data-pane="layers"] .le-view,.le-body[data-pane="layers"] .le-ins,
  .le-body[data-pane="preview"] .le-lay,.le-body[data-pane="preview"] .le-ins,
  .le-body[data-pane="edit"] .le-lay,.le-body[data-pane="edit"] .le-view{display:none}
  .le-scroll{max-height:none;overflow:visible}
  .le-frame{height:640px;flex:none}
  .le-la{position:static;transform:none;display:flex;background:none;padding:0}
}
@media (max-width:640px){.le-looks,.le-libgrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
`;
/** The editor's styles, shared with the store editor (StoreEditor.jsx). */
export const LE_CSS = CSS;
export { STARTER };

/** A section's look, fields and colours (this editor's Content tab and the store editor's panel). */
export function SectionFields({ f, set, locked }) {
  const t = sectionType(f.type);
  if (!t) return null;
  const variant = variantOf(f);
  const fields = (t.fields || []).filter((fd) => !fd[5] || fd[5]({ ...f, variant }));
  return (<>
    {t.styles ? (<>
      <p className="le-h3">Look</p>
      <div className="le-looks" role="radiogroup" aria-label="Look">
        {t.styles.map((st) => <button key={st.id} type="button" role="radio" aria-checked={variant === st.id} className="le-look" disabled={locked} onClick={() => set({ variant: st.id, ...lookPatch(f, st.id) })}><StyleSketch sketch={st.sketch} label={st.label} /><span>{st.label}</span></button>)}
      </div>
    </>) : null}
    {fields.map((fd) => <Field key={fd[0]} fd={fd} f={f} set={set} locked={locked} variant={variant} />)}
    <div className="sfb-field"><label className="gc-label" htmlFor="le-tone">Section colours</label><select id="le-tone" className="gc-input gc-select" value={f.tone || 'none'} disabled={locked} onChange={(e) => set({ tone: e.target.value })}>{TONES.map(([v, x]) => <option key={v} value={v}>{x}</option>)}</select></div>
  </>);
}

export function summary(s) {
  if (s.type === 'main') return 'The page itself · moves but stays';
  if (s.type === 'custom') { const c = getCustom(s.custom); return c ? c.name : 'Choose a custom section · not shown until then'; }
  const t = sectionType(s.type);
  const look = t && t.styles ? (t.styles.find((x) => x.id === variantOf(s)) || {}).label : '';
  let what = '';
  if (s.type === 'hero') what = `${(s.slides || []).length} slide${(s.slides || []).length === 1 ? '' : 's'}`;
  else if (s.type === 'products') what = { new: 'New arrivals', best: 'Best sellers', sale: 'On sale', category: s.cat || 'A category', picked: `${(s.picked || []).length} picked`, related: 'Related' }[s.source];
  else if (s.type === 'html') { const b = getBlock(s.block); what = b ? b.name : 'Choose a block'; }
  else if (s.type === 'faq') { const n = (s.items || []).filter((x) => x.q).length; what = n ? `${n} question${n === 1 ? '' : 's'}` : 'No questions yet'; }
  else if (s.type === 'video' && !/(?:youtu\.be\/|v=|embed\/|shorts\/)[\w-]{11}/.test(String(s.url || ''))) what = 'Add a YouTube link';
  else what = s.title || '';
  return [look, what, boxSummary(s.box)].filter(Boolean).join(' · ');
}

// ---- Style tab ------------------------------------------------------------------------------------------------------
function Seg({ value, options, onChange, label, icons }) {
  return <div className="le-seg" role="group" aria-label={label}>{options.map(([v, l]) => <button key={v || 'x'} type="button" aria-pressed={(value || '') === v} aria-label={icons ? l : undefined} title={icons ? l : undefined} onClick={() => onChange(v)}>{icons ? <Icon name={icons[v || ''] || 'circle'} width="16" height="16" aria-hidden="true" /> : l}</button>)}</div>;
}
function Colour({ id, label, value, onChange }) {
  return (
    <div className="sfb-field">
      <label className="gc-label" htmlFor={id}>{label}</label>
      <div className="le-colour">
        <input type="color" aria-label={label + ' picker'} value={/^#[0-9a-f]{6}$/i.test(value || '') ? value : '#ffffff'} onChange={(e) => onChange(e.target.value)} />
        <input id={id} className="gc-input" placeholder="Theme" value={value || ''} onChange={(e) => onChange(e.target.value.trim())} />
        {value ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => onChange('')}>Clear</button> : null}
      </div>
    </div>
  );
}
/** Style tab: spacing per device, width, alignment, edges, colours, picture, pattern, heading font and size, buttons. */
export function StyleTab({ s, dev, setDev, setBox }) {
  const box = s.box || {};
  const devLabel = DEVICES.find((x) => x.id === dev).label;
  return (
    <div className="le-insp">
      <div className="le-dev"><span>Spacing for</span><DeviceSwitch device={PREVIEW_OF[dev]} onChange={(d) => setDev(DEV_OF[d])} tablet compact /></div>
      {SPACING.map(([k, l]) => {
        const cur = stepAt(box, k, dev);
        const own = dev !== 'd' && ownStep(box, k, dev);
        return (
          <div key={k} className="le-steprow">
            <div><span>{l}</span>{own ? <span className="le-own">{devLabel} only · <button type="button" onClick={() => setBox(setStep(box, k, dev, ''))}>Reset</button></span> : null}</div>
            <div className="le-steps" role="group" aria-label={l + ' on a ' + devLabel.toLowerCase()}>
              {STEPS.map(([v, x]) => <button key={v || 'theme'} type="button" aria-pressed={cur === v} title={v ? undefined : 'From the theme'} onClick={() => setBox(setStep(box, k, dev, v))}>{x === 'Theme' ? 'Auto' : x === 'None' ? '0' : x}</button>)}
            </div>
          </div>
        );
      })}
      <div className="sfb-field"><span className="gc-label">Width</span><Seg label="Width" value={box.width} options={WIDTHS} onChange={(v) => setBox({ ...box, width: v })} /></div>
      <div className="sfb-field"><span className="gc-label">Alignment</span><Seg label="Alignment" value={box.align} options={ALIGNS} icons={{ '': 'align-left', center: 'align-center', right: 'align-right' }} onChange={(v) => setBox({ ...box, align: v })} /></div>
      <div className="sfb-two">
        <div className="sfb-field"><label className="gc-label" htmlFor="le-dt">Top edge</label><select id="le-dt" className="gc-input gc-select" value={box.divTop || ''} onChange={(e) => setBox({ ...box, divTop: e.target.value })}>{DIVIDERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
        <div className="sfb-field"><label className="gc-label" htmlFor="le-db">Bottom edge</label><select id="le-db" className="gc-input gc-select" value={box.divBottom || ''} onChange={(e) => setBox({ ...box, divBottom: e.target.value })}>{DIVIDERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
      </div>
      <p className="le-h3">Colours</p>
      <Colour id="le-bg" label="Background colour" value={box.bg} onChange={(v) => setBox({ ...box, bg: v })} />
      <div className="sfb-field"><span className="gc-label">Background picture</span><ImageField id="le-bgimg" value={box.bgImage || ''} label="background picture" onChange={(v) => setBox({ ...box, bgImage: v, overlay: v ? (box.overlay == null ? 40 : box.overlay) : 0 })} /></div>
      {box.bgImage ? <div className="sfb-field"><label className="gc-label" htmlFor="le-ov">Shade over the picture</label><div className="le-range"><input id="le-ov" type="range" min={0} max={85} step={5} value={Number(box.overlay) || 0} onChange={(e) => setBox({ ...box, overlay: Number(e.target.value) })} /><output htmlFor="le-ov">{Number(box.overlay) || 0}%</output></div></div> : null}
      <div className="sfb-field"><label className="gc-label" htmlFor="le-pat">Pattern</label><select id="le-pat" className="gc-input gc-select" value={box.pattern || ''} onChange={(e) => setBox({ ...box, pattern: e.target.value })}>{PATTERNS.map(([v, l]) => <option key={v || 'x'} value={v}>{l}</option>)}</select></div>
      <Colour id="le-fg" label="Text colour" value={box.color} onChange={(v) => setBox({ ...box, color: v })} />
      <p className="le-h3">Text and buttons</p>
      <div className="sfb-field"><label className="gc-label" htmlFor="le-font">Heading font</label><select id="le-font" className="gc-input gc-select" value={box.font || ''} onChange={(e) => setBox({ ...box, font: e.target.value })}>{FONTS.map(([v, l]) => <option key={v || 'x'} value={v}>{l}</option>)}</select><p className="sfb-muted">Bangla always uses Hind Siliguri.</p></div>
      <div className="sfb-field"><span className="gc-label">Heading size</span><Seg label="Heading size" value={box.hsize} options={HSIZES.map(([v, l]) => [v, l === 'Extra large' ? 'XL' : l === 'Theme' ? 'Auto' : l.slice(0, 1)])} onChange={(v) => setBox({ ...box, hsize: v })} /></div>
      <div className="sfb-field"><span className="gc-label">Buttons</span><Seg label="Buttons" value={box.btn} options={BTNS.map(([v, l]) => [v, l === 'Theme' ? 'Auto' : l])} onChange={(v) => setBox({ ...box, btn: v })} /></div>
      <button type="button" className="ix-btn ix-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => setBox({ hide: box.hide, anim: box.anim, anchor: box.anchor, cls: box.cls })}>Reset style to the theme</button>
    </div>
  );
}
/** Advanced tab: show per device, entrance animation, anchor, CSS class. base: the page address the anchor hint shows. */
export function AdvancedTab({ s, setBox, base = '/store' }) {
  const box = s.box || {};
  const hide = box.hide || {};
  return (
    <div className="le-insp">
      <p className="le-h3">Show on</p>
      {DEVICES.map((d) => (
        <div key={d.id} className="le-sw"><span id={'le-show-' + d.id}><Icon name={d.icon} width="16" height="16" aria-hidden="true" style={{ verticalAlign: '-3px', marginRight: 6 }} />{d.label}s</span><button type="button" role="switch" className="gc-switch" aria-checked={!hide[d.id]} aria-labelledby={'le-show-' + d.id} onClick={() => setBox({ ...box, hide: { ...hide, [d.id]: !hide[d.id] } })}><span className="gc-switch__knob" /></button></div>
      ))}
      {hide.d && hide.t && hide.m ? <p className="sfb-warn"><Icon name="triangle-alert" width="14" height="14" aria-hidden="true" /><span>Hidden on every device. Customers won’t see it.</span></p> : null}
      <div className="sfb-field"><label className="gc-label" htmlFor="le-anim">Entrance animation</label><select id="le-anim" className="gc-input gc-select" value={box.anim || ''} onChange={(e) => setBox({ ...box, anim: e.target.value })}>{ANIMS.map(([v, l]) => <option key={v || 'x'} value={v}>{l}</option>)}</select><p className="sfb-muted">Plays once as the section scrolls into view. Off for people who turn motion off.</p></div>
      <div className="sfb-field"><label className="gc-label" htmlFor="le-anchor">Anchor</label><input id="le-anchor" className="gc-input" placeholder="e.g. offers" value={box.anchor || ''} onChange={(e) => setBox({ ...box, anchor: e.target.value.replace(/[^\w-]/g, '').slice(0, 40) })} /><p className="sfb-muted">{box.anchor ? <>Link straight to it with <code>{base}#{box.anchor}</code></> : 'A name to link straight to this section.'}</p></div>
      <div className="sfb-field"><label className="gc-label" htmlFor="le-cls">CSS class</label><input id="le-cls" className="gc-input" placeholder="For your own CSS" value={box.cls || ''} onChange={(e) => setBox({ ...box, cls: e.target.value.slice(0, 80) })} /></div>
    </div>
  );
}

// ---- the section library (Add section) -----------------------------------------------------------------------------
/** The store's section library, every kind with its looks (Add section here and in the landing page builder). */
export function LibraryBody({ onAdd, filter = '' }) {
  const q = String(filter || '').trim().toLowerCase();
  return (
      <div className="le-lib">
        {LIB_GROUPS.map((g) => {
          const types = SECTION_TYPES.filter((t) => groupOf(t) === g.id && (!q || (t.label + ' ' + (t.styles || []).map((x) => x.label).join(' ')).toLowerCase().includes(q)));
          if (!types.length) return null;
          return (
            <section key={g.id} aria-label={g.label}>
              <h3>{g.label}</h3>
              {types.map((t) => {
                const why = t.lock ? lockOf(t.lock) : '';
                if (!t.styles) return <div key={t.type} className="le-libk"><button type="button" className="le-libone" disabled={!!why} title={why || undefined} onClick={() => onAdd(t.type)}><Icon name={t.icon} width="16" height="16" aria-hidden="true" />{t.label}</button></div>;
                return (
                  <div key={t.type} className="le-libk">
                    <b><Icon name={t.icon} width="16" height="16" aria-hidden="true" />{t.label} <small>{t.styles.length} looks</small></b>
                    <div className="le-libgrid">
                      {t.styles.map((st) => <button key={st.id} type="button" className="le-look" disabled={!!why} title={why || undefined} onClick={() => onAdd(t.type, st.id)}><StyleSketch sketch={st.sketch} label={st.label} /><span>{st.label}</span></button>)}
                    </div>
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>
  );
}
function Library({ open, onClose, onAdd }) {
  if (!open) return null;
  return createPortal(<Sheet open title="Add a section" onClose={onClose}><LibraryBody onAdd={onAdd} /></Sheet>, document.body);
}

export function previewPath(kind, cond) {
  const c = cond || { type: 'all' };
  if (kind === 'home') return '/store';
  if (kind === 'cart') return '/cart';
  if (kind === 'search') return '/search?q=phone';
  if (kind === '404') return '/page?handle=no-such-page';
  if (kind === 'product') {
    let p = null;
    try { p = c.type === 'product' ? allProducts().find((x) => x.id === c.ref) : null; } catch { p = null; }
    if (!p && c.type === 'category') { const sp = storeProducts().find((x) => x.cat === c.ref || String(x.cat).indexOf(c.ref + ' › ') === 0); if (sp) return '/product?handle=' + encodeURIComponent(sp.handle); }
    if (p) return '/product?handle=' + encodeURIComponent(productHandle(p));
    const sp = storeProducts()[0];
    return sp ? '/product?handle=' + encodeURIComponent(sp.handle) : '/store';
  }
  if (kind === 'category') {
    let cat = null;
    try { cat = c.type === 'category' ? getCategories().find((x) => x.path === c.ref) : null; } catch { cat = null; }
    if (cat) return '/category?handle=' + encodeURIComponent(categoryHandle(cat));
    const t = topCategories()[0];
    return t ? '/category?handle=' + encodeURIComponent(t.handle) : '/store';
  }
  if (kind === 'page') {
    let pages = [];
    try { pages = getPages(); } catch { pages = []; }
    const pg = (c.type === 'page' && pages.find((x) => x.id === c.ref)) || pages.find((x) => x.status === 'published') || pages[0];
    return pg ? '/page?handle=' + encodeURIComponent(pg.handle) : '/store';
  }
  return '/store';
}

export default function LayoutEdit() {
  const { ready, d } = useSf();
  const router = useRouter();
  const [id, setId] = useState('');
  const [work, setWorkRaw] = useState(null);
  const [name, setName] = useState('');
  const [base, setBase] = useState('');
  const [missing, setMissing] = useState(false);
  const [sel, setSel] = useState('');          // section id, '' = layout settings
  const [tab, setTab] = useState('content');
  const [adding, setAdding] = useState(false);
  const [device, setDevice] = useState('desktop');
  const [pane, setPane] = useState('preview');
  const [drag, setDrag] = useState(null);
  const [over, setOver] = useState(null);
  const hist = useRef({ past: [], future: [], last: 0 });

  useEffect(() => {
    if (!ready || id || missing) return;
    const l = getLayout(queryParam('id'));
    if (!l) { setMissing(true); return; }
    const W = clone(l.doc.draft);
    setId(l.id); setWorkRaw(W); setName(l.name); setBase(JSON.stringify([W, l.name]));
  }, [ready, id, missing]);
  // every change goes through setWork: kept for Undo (typing within a second counts as one step)
  const setWork = useCallback((fn) => {
    setWorkRaw((W) => {
      const next = typeof fn === 'function' ? fn(W) : fn;
      if (next === W) return W;
      const h = hist.current;
      const now = Date.now();
      if (now - h.last > 900 || !h.past.length) h.past = [...h.past.slice(-49), W];
      h.last = now;
      h.future = [];
      return next;
    });
  }, []);
  const undo = () => { const h = hist.current; if (!h.past.length) return; setWorkRaw((W) => { const prev = h.past[h.past.length - 1]; h.past = h.past.slice(0, -1); h.future = [W, ...h.future]; h.last = 0; return prev; }); };
  const redo = () => { const h = hist.current; if (!h.future.length) return; setWorkRaw((W) => { const next = h.future[0]; h.future = h.future.slice(1); h.past = [...h.past, W]; h.last = 0; return next; }); };
  useEffect(() => {
    const on = (e) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'z') return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      e.preventDefault();
      if (e.shiftKey) redo(); else undo();
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });

  const dirty = !!work && JSON.stringify([work, name]) !== base;
  useEffect(() => {
    const on = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', on);
    return () => window.removeEventListener('beforeunload', on);
  }, [dirty]);
  const pages = useMemo(() => { try { return getPages(); } catch { return []; } }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const cats = useMemo(() => { try { return getCategories(); } catch { return []; } }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const onFrame = useCallback((m) => { if (m && m.gcSfSelect) { setSel(m.gcSfSelect); setTab('content'); setPane('edit'); } }, []);

  if (missing) {
    return (
      <div className="dc-screen ds" data-screen="LayoutEdit"><style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell"><Sidebar sticky="" active="store-layouts" /><main className="gc-shell__main"><Topbar crumb="Online Store" page="Edit layout" />
          <div className="gc-shell__content"><div className="ix-page"><RecordHeader back="/layouts" backLabel="Layouts" title="Layout" /><section className="ix-card"><EmptyState icon="layout-dashboard" title="This layout no longer exists" actionLabel="All layouts" onAction={() => router.push('/layouts')} /></section></div></div>
        </main></div>
      </div>
    );
  }
  const l = ready && id ? getLayout(id) : null;
  const K = l ? kindBy(l.kind) : null;
  const secLock = ready ? lockOf('sections') : '';
  const heroLock = ready ? lockOf('hero') : '';
  const sections = work ? work.sections : [];
  const setSecs = (fn) => setWork((W) => ({ ...W, sections: typeof fn === 'function' ? fn(W.sections) : fn }));
  const patchSec = (sid, patch) => setSecs((list) => list.map((x) => (x.id === sid ? { ...x, ...patch } : x)));
  const move = (i, dir) => { const j = i + dir; if (j < 0 || j >= sections.length) return; setSecs((list) => { const n = list.slice(); [n[i], n[j]] = [n[j], n[i]]; return n; }); };
  const moveTo = (from, to) => { if (from === to || from == null || to == null) return; setSecs((list) => { const n = list.slice(); const [x] = n.splice(from, 1); n.splice(to > from ? to - 1 : to, 0, x); return n; }); };
  const toggle = (s) => patchSec(s.id, { hidden: !s.hidden });
  const dup = (s) => { const c = { ...clone(s), id: sfId('sec') }; setSecs((list) => { const i = list.findIndex((x) => x.id === s.id); const n = list.slice(); n.splice(i + 1, 0, c); return n; }); setSel(c.id); toast(sectionType(s.type).label + ' copied'); };
  const remove = (s) => { setSecs((list) => list.filter((x) => x.id !== s.id)); if (sel === s.id) setSel(''); toast(`${sectionType(s.type).label} removed`, { undo }); };
  const add = (type, look) => {
    let s = newSection(type, STARTER[type] ? STARTER[type]() : {});
    if (look) s = { ...s, variant: look, ...lookPatch(s, look) };
    const i = sections.findIndex((x) => x.id === sel);
    setSecs((list) => { const n = list.slice(); n.splice(i >= 0 ? i + 1 : n.length, 0, s); return n; });
    setAdding(false); setSel(s.id); setTab('content'); setPane('edit');
  };
  const check = () => { const p = condProblem(l.kind, work.cond); if (p) { toast(p, { tone: 'error' }); return false; } return true; };
  const saveDraft = () => { if (!check()) return; const W = { ...work, sections: work.sections.map((s) => (s.box ? { ...s, box: cleanBox(s.box) } : s)) }; saveLayoutDraft(id, W, name); setBase(JSON.stringify([work, name])); toast('Draft saved. Customers still see the published layout.'); };
  const publish = () => { if (!check()) return; const W = { ...work, sections: work.sections.map((s) => (s.box ? { ...s, box: cleanBox(s.box) } : s)) }; publishLayout(id, W, name); setBase(JSON.stringify([work, name])); toast(`${name} published`); };
  const undoLive = async () => {
    if (!(await confirmDialog({ title: 'Undo to the published layout?', body: 'Your changes since the last publish are thrown away.', confirmLabel: 'Undo changes', tone: 'danger' }))) return;
    discardLayout(id); const x = getLayout(id); const W = clone(x.doc.draft); setWork(W); setName(x.name); setBase(JSON.stringify([W, x.name])); toast('Back to the published layout');
  };
  const dupLayout = () => { const c = duplicateLayout(id); if (c) { const W = clone(c.doc.draft); setId(c.id); setWorkRaw(W); setName(c.name); setBase(JSON.stringify([W, c.name])); hist.current = { past: [], future: [], last: 0 }; try { window.history.replaceState(window.history.state, '', '/layout-edit?id=' + c.id); } catch { /* ignore */ } toast(`${c.name} made (a draft)`); } };
  const del = async () => {
    if (!(await confirmDialog({ title: `Delete ${name}?`, body: 'Pages it drew use the next layout that fits, or the built-in one.', confirmLabel: 'Delete', tone: 'danger' }))) return;
    deleteLayout(id); setBase(JSON.stringify([work, name])); toast('Layout deleted'); router.push('/layouts');
  };
  const src = l ? (() => { const p = previewPath(l.kind, work.cond); return p + (p.includes('?') ? '&' : '?') + 'preview=1&edit=1&layout=' + encodeURIComponent(id); })() : '';
  const cur = sel ? sections.find((x) => x.id === sel) : null;
  const t = cur ? sectionType(cur.type) : null;
  const dev = DEV_OF[device];
  const condTypes = K ? K.conds : ['all'];
  const h = hist.current;

  // ---- inspector -------------------------------------------------------------------------------------------------
  let inspector = null;
  if (work && l && !cur) {
    inspector = (
      <div className="le-insp">
        <div className="sfb-field"><label className="gc-label" htmlFor="le-name">Name</label><input id="le-name" className="gc-input" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="sfb-field">
          <label className="gc-label" htmlFor="le-cond">Shows on</label>
          <select id="le-cond" className="gc-input gc-select" value={work.cond.type} onChange={(e) => setWork((W) => ({ ...W, cond: { type: e.target.value, ref: '' } }))}>{condTypes.map((c) => <option key={c} value={c}>{CONDS[c]}</option>)}</select>
          {work.cond.type === 'category' ? <CatPick id="le-cref" value={work.cond.ref} onChange={(x) => setWork((W) => ({ ...W, cond: { ...W.cond, ref: x } }))} /> : null}
          {work.cond.type === 'product' ? <ProductPick id="le-cref" value={work.cond.ref} onChange={(x) => setWork((W) => ({ ...W, cond: { ...W.cond, ref: x } }))} /> : null}
          {work.cond.type === 'page' ? <select className="gc-input gc-select" aria-label="Page" value={work.cond.ref} onChange={(e) => setWork((W) => ({ ...W, cond: { ...W.cond, ref: e.target.value } }))}><option value="">Choose a page…</option>{pages.map((p) => <option key={p.id} value={p.id}>{p.title || 'Untitled page'}</option>)}</select> : null}
          {work.cond.type === 'category' && cats.length === 0 ? <p className="sfb-muted">No categories yet.</p> : null}
          <p className="sfb-muted">The most specific published layout wins: one product, then its category, then all pages of the kind.</p>
        </div>
        <div className="sfb-field"><label className="gc-label" htmlFor="le-hdr">Header</label><select id="le-hdr" className="gc-input gc-select" value={work.header || ''} onChange={(e) => setWork((W) => ({ ...W, header: e.target.value }))}><option value="">The default header</option>{(d.headers || []).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
        <p className="sfb-muted">Pick a section on the left or in the page to change it.</p>
      </div>
    );
  } else if (cur && cur.type === 'main') {
    inspector = <div className="le-insp"><p className="sfb-muted" style={{ fontSize: 'var(--text-sm)' }}>{K.main || 'Main content'} is the page itself (for example the product and its details). Move it up or down among the sections; what it shows is set in the Theme (Customize › {l.kind === 'product' ? 'Product page' : l.kind === 'category' ? 'Category page' : 'Layout'}).</p></div>;
  } else if (cur) {
    const locked = cur.type === 'hero' && !!heroLock;
    const set = (patch) => patchSec(cur.id, patch);
    inspector = (<>
      <div className="le-tabs" role="tablist" aria-label="Section settings">
        {[['content', 'Content'], ['style', 'Style'], ['advanced', 'Advanced']].map(([k, x]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{x}</button>)}
      </div>
      {tab === 'content' ? (
        <div className="le-insp">
          <LockNote text={locked ? lockOf('hero') : ''} />
          <SectionFields f={cur} set={set} locked={locked} />
        </div>
      ) : tab === 'style' ? <StyleTab s={cur} dev={dev} setDev={(x) => setDevice(PREVIEW_OF[x])} setBox={(b) => set({ box: b })} />
        : <AdvancedTab s={cur} setBox={(b) => set({ box: b })} />}
    </>);
  }

  return (
    <div className="dc-screen ds le" data-screen="LayoutEdit">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="store-layouts" collapsed="" />
        <main className="gc-shell__main le-main">
          <Topbar crumb="Online Store" page="Edit layout" />
          <div className="gc-shell__content le-content">
            <div className="ix-page le-page">
              {!work || !l ? <div style={{ minHeight: 320 }} aria-busy="true" /> : (<>
                <RecordHeader back="/layouts" backLabel="Layouts" title={name || 'Layout'}
                  badges={dirty ? <StatusBadge tone="warning">Not saved</StatusBadge> : <DocBadge doc={l.doc} />}
                  meta={<>{K.label} · {l.doc.liveAt ? 'published ' + when(l.doc.liveAt) : 'never published'}</>}
                  about="Build the page from sections. Click a section in the page or in the list to change its look, content and style; Style values can differ on a tablet and a phone. Save draft keeps your work; Publish shows it to customers. The most specific published layout wins on each page."
                  secondary={[{ label: 'Undo', icon: 'undo-2', onClick: undo, disabled: !h.past.length }, { label: 'Redo', icon: 'redo-2', onClick: redo, disabled: !h.future.length }, { label: 'Save draft', onClick: saveDraft }]}
                  more={[l.doc.live ? { label: 'Undo to last published', onClick: undoLive } : null, { label: 'Open preview', onClick: () => window.open(src.replace('&edit=1', ''), '_blank', 'noopener') }, { label: 'Duplicate', onClick: dupLayout }, { label: 'Delete', onClick: del, tone: 'danger' }].filter(Boolean)}
                  primary={{ label: 'Publish', icon: 'upload', onClick: publish }} />
                <LockNote text={secLock ? secLock + ' You can still change what each section shows.' : ''} />
                <div className="gc-seg le-ptabs" role="group" aria-label="Show">
                  {[['layers', 'Sections'], ['preview', 'Preview'], ['edit', 'Edit']].map(([k, x]) => <button key={k} type="button" className={'gc-seg__btn' + (pane === k ? ' gc-seg__btn--active' : '')} aria-pressed={pane === k} onClick={() => setPane(k)}>{x}</button>)}
                </div>
                <div className="le-body" data-pane={pane}>
                  <aside className="le-panel le-lay" aria-label="Sections">
                    <div className="le-ph"><h2>Sections · {sections.length}</h2></div>
                    <div className="le-scroll">
                      <button type="button" className={'le-settings' + (!sel ? ' is-on' : '')} onClick={() => { setSel(''); setPane('edit'); }}><Icon name="settings-2" width="16" height="16" aria-hidden="true" />Layout settings</button>
                      <ul className="le-layers">
                        {sections.map((s, i) => {
                          const st = sectionType(s.type);
                          const isMain = s.type === 'main';
                          const label = isMain ? K.main || 'Main content' : st.label;
                          return (
                            <li key={s.id} className={'le-layer' + (sel === s.id ? ' is-on' : '') + (isMain ? ' is-main' : '') + (s.hidden ? ' is-hidden' : '') + (over === i && drag != null && drag !== i ? ' is-drop' : '')}
                              draggable={!secLock} onDragStart={(e) => { setDrag(i); try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', s.id); } catch { /* ignore */ } }}
                              onDragOver={(e) => { if (drag != null) { e.preventDefault(); setOver(i); } }} onDragEnd={() => { setDrag(null); setOver(null); }}
                              onDrop={(e) => { e.preventDefault(); moveTo(drag, i); setDrag(null); setOver(null); }}
                              onClick={() => { setSel(s.id); setPane('edit'); }}>
                              <span className="le-grip" aria-hidden="true"><Icon name="grip-vertical" width="14" height="14" /></span>
                              <span className="le-li" aria-hidden="true"><Icon name={st ? st.icon : 'square'} width="16" height="16" /></span>
                              <button type="button" className="le-lt" aria-pressed={sel === s.id} onClick={(e) => { e.stopPropagation(); setSel(s.id); setPane('edit'); }}><b>{label}{s.hidden ? ' · hidden' : ''}</b><small>{summary(s)}</small></button>
                              <span className="le-la" onClick={(e) => e.stopPropagation()}>
                                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Move ${label} up`} title="Move up" disabled={!!secLock || i === 0} onClick={() => move(i, -1)}><Icon name="arrow-up" width="16" height="16" /></button>
                                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Move ${label} down`} title="Move down" disabled={!!secLock || i === sections.length - 1} onClick={() => move(i, 1)}><Icon name="arrow-down" width="16" height="16" /></button>
                                {!isMain ? <>
                                  <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={s.hidden ? `Show ${label}` : `Hide ${label}`} title={s.hidden ? 'Show' : 'Hide'} disabled={!!secLock} onClick={() => toggle(s)}><Icon name={s.hidden ? 'eye' : 'eye-off'} width="16" height="16" /></button>
                                  <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Copy ${label}`} title="Copy" disabled={!!secLock} onClick={() => dup(s)}><Icon name="copy" width="16" height="16" /></button>
                                  <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Remove ${label}`} title="Remove" disabled={!!secLock || (s.type === 'hero' && !!heroLock)} onClick={() => remove(s)}><Icon name="trash-2" width="16" height="16" /></button>
                                </> : null}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    <div className="le-pf"><button type="button" className="gc-btn gc-btn--neutral" disabled={!!secLock} onClick={() => setAdding(true)}><Icon name="plus" width="16" height="16" aria-hidden="true" /> Add section</button></div>
                  </aside>
                  <section className="le-view" aria-label="Preview">
                    <div className="le-bar">
                      <DeviceSwitch device={device} onChange={setDevice} tablet />
                      <small>Click a section in the page to change it</small>
                    </div>
                    <div className="le-frame"><PreviewFrame src={src} device={device} parts={[['layout:' + id, work], ['select', sel]]} height="fill" title="Layout preview" onMessage={onFrame} /></div>
                  </section>
                  <aside className="le-panel le-ins" aria-label={cur ? 'Section settings' : 'Layout settings'}>
                    <div className="le-ph">
                      <h2>{cur ? <><Icon name={t ? t.icon : 'square'} width="16" height="16" aria-hidden="true" /><span>{cur.type === 'main' ? K.main || 'Main content' : t.label}</span></> : <span>Layout settings</span>}</h2>
                      {cur ? <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Back to layout settings" title="Close" onClick={() => setSel('')}><Icon name="x" width="16" height="16" /></button> : null}
                    </div>
                    <div className="le-scroll" style={{ padding: 0 }}>{inspector}</div>
                  </aside>
                </div>
              </>)}
            </div>
          </div>
        </main>
      </div>
      <Library open={adding} onClose={() => setAdding(false)} onAdd={add} />
    </div>
  );
}
