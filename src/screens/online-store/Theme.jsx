'use client';
// Theme — Online Store › Theme (/theme): the store's look (Module A · A1 + A6; Batch A step 4: designs are files).
//   Header       Edit store (the visual editor, /store-editor) as the main action; Customize; View store; More: Header builder, Layouts, HTML blocks,
//                Store notices, Menus, Export design file, Import design file
//   Your store   a live preview of the home page, the design it came from (preset, library theme or a design file),
//                published / unpublished changes
//   Designs      Signal (electronics), Nokshi (fashion), Counter (grocery and retail) and the themes GridCommerce
//                publishes in its library (access.js › libraryKits) — preview each live with the shop's own products
//                (desktop / phone), import with "choose what to import" and "what will be replaced"; a restore point is
//                made first; products, customers and orders are never touched. Offered per the super admin's packages.
//   Design file  export the store's design as one file (.gcstore.json: choose the parts), or import one: it is checked
//                (plain-word problems stop it, warnings say what to look at), previewed, then imported like a preset.
//   Build with GridAI  a first design drafted from five answers (lib/storefront/kitDraft.js, simulated): what GridAI
//                chose and why, a live preview, Try another, save the file, import like any design file.
//   Restore points   the look before each import or publish; Go back undoes in one click (and can itself be undone)
// Front end only: lib/storefront/* (kit.js, kitStore.js).

import React, { useMemo, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, StatusBadge, EmptyState } from '@/components/ui';
import { ShopHeader } from '@/components/ui/IndexKit';
import { restoreTo, makeRestorePoint, isDirty } from '@/lib/storefront/store';
import { PRESETS, presetBy, presetKit } from '@/lib/storefront/presets';
import { KIT_PARTS, parseKit, kitSummary } from '@/lib/storefront/kit';
import { checkForShop, kitWillChange, applyKit, exportKit, downloadKit, kitPreviewParts, appliedKit } from '@/lib/storefront/kitStore';
import { draftKit, SELLS, MOODS } from '@/lib/storefront/kitDraft';
import { presetOffer, editing, SWITCHES, libraryKits } from '@/lib/storefront/access';
import { StoreFrame } from './storeShared';
import { useSf, PreviewFrame, DeviceSwitch, DocBadge, when, SFB_CSS } from './sfShared';

const CSS = SFB_CSS + `
.th-logo{display:grid;place-items:center;height:140px;padding:var(--space-4) var(--space-5);box-sizing:border-box}
.th-pre .th-logo img{width:100%;height:100%;object-fit:contain}

.th-look{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:var(--space-4);padding:var(--space-4)}
.th-look dl{display:grid;grid-template-columns:auto minmax(0,1fr);gap:var(--space-2) var(--space-4);margin:0;font-size:var(--text-sm)}
.th-look dt{color:var(--text-muted)}.th-look dd{margin:0;color:var(--text-heading)}
.th-look .th-buttons{display:flex;flex-wrap:wrap;gap:var(--space-2);margin-top:var(--space-4)}
.th-presets{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-4);padding:var(--space-4)}
.th-pre{display:flex;flex-direction:column;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);overflow:hidden;background:var(--surface-card)}
.th-pre.is-cur{border-color:var(--primary);box-shadow:0 0 0 1px var(--primary)}
.th-pre img{width:100%;height:140px;object-fit:cover;display:block}
.th-pre__ph{display:grid;place-items:center;height:140px;color:#fff;font-size:var(--text-2xl);font-weight:var(--weight-semibold)}
.th-pre__body{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3) var(--space-4) var(--space-4);flex:1}
.th-pre__body b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);display:flex;align-items:center;gap:var(--space-2);flex-wrap:wrap}
.th-pre__body p{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.th-pre__acts{display:flex;gap:var(--space-2);margin-top:auto;padding-top:var(--space-2)}
.th-dot{width:10px;height:10px;border-radius:var(--radius-full);flex:none}
.th-points{list-style:none;margin:0;padding:0}
.th-points li{display:flex;align-items:center;gap:var(--space-3);min-height:52px;padding:var(--space-2) var(--space-4);border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.th-points li>span{flex:1;min-width:0}
.th-points small{display:block;color:var(--text-muted);font-size:var(--text-xs)}
.th-parts{display:flex;flex-direction:column;gap:var(--space-2);border:0;margin:0;padding:0}
.th-parts label{display:flex;gap:var(--space-2);align-items:flex-start;font-size:var(--text-sm);color:var(--text-heading);cursor:pointer}
.th-parts small{display:block;color:var(--text-muted);font-size:var(--text-xs)}
.th-change{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:var(--space-2);font-size:var(--text-sm)}
.th-change b{font-weight:var(--weight-medium);color:var(--text-heading)}
.th-change small{display:block;color:var(--text-muted);font-size:var(--text-xs)}
.th-pvbar{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3)}
.th-file{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3);padding:var(--space-4)}
.th-file p{flex:1 1 280px;margin:0;font-size:var(--text-sm);color:var(--text-muted)}
.th-drop{display:flex;flex-direction:column;align-items:center;gap:var(--space-2);padding:var(--space-5) var(--space-4);border:1px dashed var(--border-strong);border-radius:var(--radius-lg);text-align:center;font-size:var(--text-sm);color:var(--text-muted)}
.th-issues{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;max-height:240px;overflow:auto;font-size:var(--text-xs)}
.th-issues li{display:flex;gap:6px;align-items:flex-start}
.th-issues li svg{flex:none;margin-top:1px}
.th-issues .is-err{color:var(--text-danger)}
.th-issues .is-warn{color:var(--text-warning)}
.th-why{margin:0;padding:0 0 0 18px;display:flex;flex-direction:column;gap:4px;font-size:var(--text-xs);color:var(--text-body)}
.th-ai-q{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
@media (max-width:640px){.th-ai-q{grid-template-columns:minmax(0,1fr)}}
.th-issues code{font-family:var(--font-code);color:var(--text-muted)}
@media (max-width:1023px){.th-look{grid-template-columns:minmax(0,1fr)}.th-presets{grid-template-columns:minmax(0,1fr)}}
`;

const KIND = { import: 'Import', publish: 'Publish', undo: 'Before going back', manual: 'Saved by you' };
const DEFAULT_PARTS = { theme: true, headers: true, layouts: true, blocks: true, notices: true, placements: true, customs: true, menus: false, pages: false };
const has = (kit, k) => (k === 'theme' ? !!kit.theme : (kit[k] || []).length > 0);

/** The designs the shop can choose: the three built-in presets (or the library's newer kit of them) and library themes. */
function useDesigns(ready) {
  return useMemo(() => {
    const lib = ready ? libraryKits() : [];
    const built = PRESETS.map((p) => { const l = lib.find((x) => x.id === p.id); return { ...p, kit: l ? l.kit : null, version: l ? l.version : '', builtIn: true }; });
    const extra = lib.filter((l) => !PRESETS.some((p) => p.id === l.id)).map((l) => ({ ...l, image: '', builtIn: false }));
    return [...built, ...extra];
  }, [ready]);
}
const kitOf = (x) => (x.kit || presetKit(x.id));

/** Import a kit: choose the parts, see what will be replaced, import (a restore point first). */
function ImportSheet({ design, onClose }) {
  const kit = design.kit;
  const parts0 = Object.fromEntries(KIT_PARTS.map((p) => [p.key, has(kit, p.key) && !!DEFAULT_PARTS[p.key]]));
  const [parts, setParts] = useState(parts0);
  const changes = kitWillChange(kit, parts);
  const go = async () => {
    if (!KIT_PARTS.some((x) => parts[x.key])) { toast('Choose at least one part to import.', { tone: 'error' }); return; }
    if (!(await confirmDialog({ title: `Import ${design.name}?`, body: 'The parts you chose are replaced. A restore point is made first, so you can go back in one click.', confirmLabel: 'Import' }))) return;
    const r = applyKit(kit, parts, { label: `Before importing ${design.name}`, trusted: design.id !== 'file' });
    if (!r.ok) { toast((r.errors[0] || {}).text || 'The design could not be imported.', { tone: 'error' }); return; }
    toast(`${design.name} imported: ${r.parts.join(', ').toLowerCase()}${r.left ? '. Custom sections were left out: they come with the Business plan or from GridCommerce' : ''}`, { undo: () => { if (r.point) { restoreTo(r.point.id); toast('Import undone'); } } });
    onClose();
  };
  return (
    <Sheet open title={`Import ${design.name}`} onClose={onClose}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={go}>Import</button></>}>
      <div className="sfb-fields">
        <fieldset className="th-parts">
          <legend className="gc-label">What to import</legend>
          {KIT_PARTS.filter((x) => has(kit, x.key)).map((x) => <label key={x.key}><input type="checkbox" className="gc-check" checked={!!parts[x.key]} onChange={(e) => setParts((s) => ({ ...s, [x.key]: e.target.checked }))} /><span>{x.label}<small>{x.hint}</small></span></label>)}
        </fieldset>
        <div>
          <p className="gc-label" style={{ marginBottom: 6 }}>What will be replaced</p>
          {changes.length ? (
            <ul className="th-change">
              {changes.map((c) => (
                <li key={c.part}><b>{c.label}</b>
                  {c.replaces.length ? <small>Replaces: {c.replaces.join(', ')}</small> : null}
                  {c.adds.length ? <small>Adds: {c.adds.join(', ')}</small> : null}
                  {c.note ? <small>{c.note}</small> : null}
                </li>
              ))}
            </ul>
          ) : <p className="sfb-muted">Nothing chosen.</p>}
        </div>
        <p className="sfb-lock"><Icon name="shield-check" width="14" height="14" aria-hidden="true" /><span>Products, customers and orders are never touched. A restore point is made first.</span></p>
      </div>
    </Sheet>
  );
}

/** A design live in a frame, over the shop's own products. */
function PreviewSheet({ design, onClose, onImport, allowed }) {
  const [device, setDevice] = useState('desktop');
  const [page, setPage] = useState('/store');
  const parts = useMemo(() => kitPreviewParts(design.kit), [design]);
  return (
    <Sheet open title={`${design.name} · preview`} onClose={onClose}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Close</button>{allowed ? <button type="button" className="gc-btn gc-btn--solid" onClick={() => { onClose(); onImport(); }}>Import {design.name}</button> : null}</>}>
      <div className="th-pvbar">
        <select className="gc-input gc-select" aria-label="Page to preview" value={page} onChange={(e) => setPage(e.target.value)} style={{ maxWidth: 220 }}>
          <option value="/store">Home</option>
          <option value="/category?handle=phones">Category page</option>
          <option value="/product?handle=smart-watch-s2-with-bluetooth-calling">Product page</option>
          <option value="/cart">Cart</option>
          <option value="/checkout">Checkout</option>
          <option value="/store-showcase">All sections</option>
        </select>
        <DeviceSwitch device={device} onChange={setDevice} />
      </div>
      <PreviewFrame src={page + (page.includes('?') ? '&' : '?') + 'preview=1' + (design.builtIn ? '&preset=' + encodeURIComponent(design.id) : '')} device={device} parts={parts} height={560} title={`${design.name} preview`} />
      <p className="sfb-muted" style={{ marginTop: 8 }}>Your own products, categories and pages, in {design.name}’s look. Nothing changes until you import it.</p>
    </Sheet>
  );
}

/** Export the store's design as a file. */
function ExportSheet({ onClose }) {
  const [name, setName] = useState('');
  const [parts, setParts] = useState({ ...DEFAULT_PARTS, menus: true });
  const go = () => {
    const kit = exportKit({ meta: name.trim() ? { name: name.trim() } : {}, parts });
    downloadKit(kit);
    toast('Design file saved: ' + kitSummary(kit));
    onClose();
  };
  return (
    <Sheet open title="Export design file" onClose={onClose}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={go}><Icon name="download" width="16" height="16" aria-hidden="true" />Save the file</button></>}>
      <div className="sfb-fields">
        <div className="sfb-field"><label className="gc-label" htmlFor="th-ex-name">Name</label><input id="th-ex-name" className="gc-input" value={name} placeholder="My store design" onChange={(e) => setName(e.target.value)} /></div>
        <fieldset className="th-parts">
          <legend className="gc-label">What goes in the file</legend>
          {KIT_PARTS.map((x) => <label key={x.key}><input type="checkbox" className="gc-check" checked={!!parts[x.key]} onChange={(e) => setParts((s) => ({ ...s, [x.key]: e.target.checked }))} /><span>{x.label}<small>{x.hint}</small></span></label>)}
        </fieldset>
        <p className="sfb-muted">The file holds the design customers see now. Products, customers and orders never go in it. Your shop’s phone, email and address are kept as they are; another shop’s details replace them only where the file says so.</p>
      </div>
    </Sheet>
  );
}

/** Import a design file: read, check, then preview or import. */
function FileSheet({ onClose, onPreview, onImport }) {
  const input = useRef(null);
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const res = useMemo(() => (text.trim() ? (() => { const p = parseKit(text); return p.error ? { ok: false, errors: [{ path: '', text: p.error }], warnings: [], kit: null } : checkForShop(p.kit); })() : null), [text]);
  const read = (f) => {
    if (!f) return;
    if (f.size > 2000000) { toast('The file is over 2 MB.', { tone: 'error' }); return; }
    const r = new FileReader();
    r.onload = () => { setText(String(r.result || '')); setFileName(f.name); };
    r.readAsText(f);
  };
  const design = res && res.ok ? { id: 'file', name: res.kit.meta.name || fileName || 'Design file', kit: res.kit } : null;
  return (
    <Sheet open title="Import design file" onClose={onClose}
      footer={<>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button>
        <button type="button" className="gc-btn" disabled={!design} onClick={() => onPreview(design)}><Icon name="eye" width="16" height="16" aria-hidden="true" />Preview</button>
        <button type="button" className="gc-btn gc-btn--solid" disabled={!design} onClick={() => onImport(design)}>Continue</button>
      </>}>
      <div className="sfb-fields">
        <div className="th-drop" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); read(e.dataTransfer.files && e.dataTransfer.files[0]); }}>
          <Icon name="file-up" width="24" height="24" aria-hidden="true" />
          <span>{fileName || 'Drop a .gcstore.json file here'}</span>
          <button type="button" className="gc-btn" onClick={() => input.current && input.current.click()}>Choose a file</button>
          <input ref={input} type="file" accept=".json,application/json" hidden onChange={(e) => read(e.target.files && e.target.files[0])} />
        </div>
        <details className="gc-disclose">
          <summary>Or paste the file’s text</summary>
          <textarea className="gc-input" rows={6} aria-label="Design file text" value={text} onChange={(e) => { setText(e.target.value); setFileName(''); }} style={{ fontFamily: 'var(--font-code)', fontSize: 'var(--text-xs)' }} />
        </details>
        {res ? (
          <div>
            <p className="gc-label" style={{ marginBottom: 6 }}>{res.ok ? <>Ready: <b>{res.kit.meta.name}</b></> : 'This file can’t be imported yet'}</p>
            {res.ok ? <p className="sfb-muted" style={{ marginBottom: 8 }}>{kitSummary(res.kit)}{res.kit.meta.author ? ' · by ' + res.kit.meta.author : ''}</p> : null}
            {res.errors.length || res.warnings.length ? (
              <ul className="th-issues">
                {res.errors.map((e, i) => <li key={'e' + i} className="is-err"><Icon name="circle-x" width="14" height="14" aria-hidden="true" /><span>{e.text}{e.path ? <> <code>{e.path}</code></> : null}</span></li>)}
                {res.warnings.map((w, i) => <li key={'w' + i} className="is-warn"><Icon name="triangle-alert" width="14" height="14" aria-hidden="true" /><span>{w.text}</span></li>)}
              </ul>
            ) : <p className="sfb-muted">No problems found.</p>}
          </div>
        ) : null}
      </div>
    </Sheet>
  );
}

/** Build with GridAI: five answers → a drafted design → preview, try another, save or import. */
function AiSheet({ onClose, onImport }) {
  const [brief, setBrief] = useState({ sells: 'phones', mood: 'calm', primary: '', lang: 'en', first: '', promise: '', emi: false, hotline: true });
  const [variant, setVariant] = useState(0);
  const [res, setRes] = useState(null);
  const [device, setDevice] = useState('desktop');
  const set = (k, v) => setBrief((b) => ({ ...b, [k]: v }));
  const make = (v) => { const r = draftKit(brief, v); if (!r.ok) { toast((r.errors[0] || {}).text || 'GridAI could not draft a design from that.', { tone: 'error' }); return; } setVariant(v); setRes(r); };
  const parts = useMemo(() => (res ? kitPreviewParts(res.kit) : []), [res]);
  const design = res ? { id: 'file', name: res.kit.meta.name, kit: res.kit } : null;
  if (!res) {
    return (
      <Sheet open title="Build with GridAI" onClose={onClose}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={() => make(0)}><Icon name="sparkles" width="16" height="16" aria-hidden="true" />Draft my design</button></>}>
        <div className="sfb-fields">
          <div className="th-ai-q">
            <div className="sfb-field"><label className="gc-label" htmlFor="th-ai-sells">What do you sell?</label>
              <select id="th-ai-sells" className="gc-input gc-select" value={brief.sells} onChange={(e) => set('sells', e.target.value)}>{SELLS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select></div>
            <div className="sfb-field"><label className="gc-label" htmlFor="th-ai-mood">How should it feel?</label>
              <select id="th-ai-mood" className="gc-input gc-select" value={brief.mood} onChange={(e) => set('mood', e.target.value)}>{MOODS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select></div>
            <div className="sfb-field"><label className="gc-label" htmlFor="th-ai-col">Main colour</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input id="th-ai-col" type="color" className="gc-input" value={brief.primary || '#003087'} onChange={(e) => set('primary', e.target.value)} style={{ width: 56, padding: 4 }} />
                {brief.primary ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => set('primary', '')}>Use my brand colour</button> : <span className="sfb-muted">Your brand colour</span>}
              </div></div>
            <div className="sfb-field"><label className="gc-label" htmlFor="th-ai-lang">Store language</label>
              <select id="th-ai-lang" className="gc-input gc-select" value={brief.lang} onChange={(e) => set('lang', e.target.value)}><option value="en">English first</option><option value="bn">Bangla first</option></select></div>
          </div>
          <div className="sfb-field"><label className="gc-label" htmlFor="th-ai-first">What should the first screen sell?</label>
            <input id="th-ai-first" className="gc-input" maxLength={60} value={brief.first} placeholder="New Galaxy phones with official warranty" onChange={(e) => set('first', e.target.value)} /></div>
          <div className="sfb-field"><label className="gc-label" htmlFor="th-ai-prom">One line customers see on every page</label>
            <input id="th-ai-prom" className="gc-input" maxLength={90} value={brief.promise} placeholder="Free delivery in Dhaka over ৳2,000" onChange={(e) => set('promise', e.target.value)} /></div>
          <fieldset className="th-parts">
            <legend className="gc-label">Also</legend>
            <label><input type="checkbox" className="gc-check" checked={brief.emi} onChange={(e) => set('emi', e.target.checked)} /><span>Show the EMI line on products</span></label>
            <label><input type="checkbox" className="gc-check" checked={brief.hotline} onChange={(e) => set('hotline', e.target.checked)} /><span>Hotline in the header</span></label>
          </fieldset>
          <p className="sfb-muted">GridAI drafts a full design (theme, headers, page layouts, menus and a notice) from these answers. You see it on your own products before anything changes.</p>
        </div>
      </Sheet>
    );
  }
  return (
    <Sheet open title={`${res.kit.meta.name} · preview`} onClose={onClose}
      footer={<>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setRes(null)}>Change answers</button>
        <button type="button" className="gc-btn" onClick={() => make(variant + 1)}><Icon name="refresh-cw" width="16" height="16" aria-hidden="true" />Try another</button>
        <button type="button" className="gc-btn" onClick={() => { downloadKit(res.kit); toast('Design file saved'); }}><Icon name="download" width="16" height="16" aria-hidden="true" />Save file</button>
        <button type="button" className="gc-btn gc-btn--solid" onClick={() => onImport(design)}>Import</button>
      </>}>
      <div className="th-pvbar"><DeviceSwitch device={device} onChange={setDevice} /></div>
      <PreviewFrame src="/store?preview=1" device={device} parts={parts} height={460} title="GridAI draft preview" />
      <details className="gc-disclose" style={{ marginTop: 'var(--space-3)' }} open>
        <summary>What GridAI chose</summary>
        <ul className="th-why">{res.why.map((w, i) => <li key={i}>{w}</li>)}</ul>
      </details>
    </Sheet>
  );
}

export default function Theme() {
  const { ready, d } = useSf();
  const [sheet, setSheet] = useState(null);   // { kind: 'import' | 'preview' | 'export' | 'file', design }
  const [device, setDevice] = useState('desktop');
  const designs = useDesigns(ready);
  const applied = ready ? appliedKit() : null;
  const cur = d ? designs.find((x) => x.id === d.preset) || presetBy(d.preset) : null;
  const locked = ready ? SWITCHES.filter(([k]) => k !== 'code' && editing()[k] === false).map(([, l]) => l) : [];
  const points = (d && d.restore) || [];
  const dirty = d ? isDirty(d.theme) || (d.headers || []).some((h) => isDirty(h.doc)) || (d.layouts || []).some((l) => l.doc.live && isDirty(l.doc)) : false;
  const withKit = (x) => ({ ...x, kit: kitOf(x) });

  const goBack = async (pt) => {
    if (!(await confirmDialog({ title: `Go back to “${pt.label}”?`, body: pt.snap && pt.snap.content ? 'The look, menus and store pages go back to how they were then. A restore point of now is made first.' : 'The look goes back to how it was then. A restore point of now is made first.', confirmLabel: 'Go back' }))) return;
    restoreTo(pt.id);
    toast('Your store’s look is back to ' + when(pt.at));
  };
  const save = () => { makeRestorePoint('Saved by you'); toast('Restore point made'); };
  const lookName = applied && applied.name && !(designs.some((x) => x.id === applied.id)) ? applied.name + (applied.version ? ' · ' + applied.version : '') : cur ? `${cur.name}${cur.label ? ' · ' + cur.label : ''}` : '';

  return (
    <StoreFrame screen="Theme" active="store-theme" page="Theme" css={CSS}
      after={<>
        {sheet && sheet.kind === 'import' ? <ImportSheet design={sheet.design} onClose={() => setSheet(null)} /> : null}
        {sheet && sheet.kind === 'preview' ? <PreviewSheet design={sheet.design} allowed={sheet.design.id === 'file' || presetOffer(sheet.design.id).ok} onClose={() => setSheet(null)} onImport={() => setSheet({ kind: 'import', design: sheet.design })} /> : null}
        {sheet && sheet.kind === 'ai' ? <AiSheet onClose={() => setSheet(null)} onImport={(x) => setSheet({ kind: 'import', design: x })} /> : null}
        {sheet && sheet.kind === 'export' ? <ExportSheet onClose={() => setSheet(null)} /> : null}
        {sheet && sheet.kind === 'file' ? <FileSheet onClose={() => setSheet(null)} onPreview={(x) => setSheet({ kind: 'preview', design: x })} onImport={(x) => setSheet({ kind: 'import', design: x })} /> : null}
      </>}>
      <ShopHeader icon="paintbrush" title="Theme"
        about="How your online store looks. Customize changes colours, fonts and page options; a design gives you a finished look in one click. A whole design is also one file: export yours, or import one made for you. Customers see a change only after you publish it."
        secondary={[{ label: 'Customize', icon: 'sliders-horizontal', href: '/theme-editor' }, { label: 'View store', icon: 'external-link', onClick: () => window.open('/store', '_blank', 'noopener') }, { label: 'All sections', icon: 'layout-list', onClick: () => window.open('/store-showcase', '_blank', 'noopener') }]}
        more={[{ label: 'Build with GridAI', onClick: () => setSheet({ kind: 'ai' }) }, { label: 'Import design file', onClick: () => setSheet({ kind: 'file' }) }, { label: 'Export design file', onClick: () => setSheet({ kind: 'export' }) }, { label: 'Header builder', href: '/header-builder' }, { label: 'Store notices', href: '/store-notices' }, { label: 'Layouts', href: '/layouts' }, { label: 'HTML blocks', href: '/html-blocks' }, { label: 'Menus', href: '/store-menus' }]}
        primary={{ label: 'Edit store', icon: 'mouse-pointer-click', href: '/store-editor' }} />

      <section className="ix-card" aria-labelledby="th-cur">
        <div className="ix-card__head"><h2 id="th-cur">Your store</h2><DeviceSwitch device={device} onChange={setDevice} /></div>
        {!ready ? <div style={{ minHeight: 320 }} aria-busy="true" /> : (
          <div className="th-look">
            <PreviewFrame src="/store" device={device} height={380} title="Your store’s home page" />
            <div>
              <dl>
                <dt>Design</dt><dd>{lookName}</dd>
                {applied && applied.appliedAt ? <><dt>Imported</dt><dd>{when(applied.appliedAt)}</dd></> : null}
                <dt>Status</dt><dd>{dirty ? <StatusBadge tone="warning">Unpublished changes</StatusBadge> : <DocBadge doc={d.theme} />}</dd>
                <dt>Published</dt><dd>{when(d.theme.liveAt)}</dd>
                <dt>Headers</dt><dd>{(d.headers || []).length}</dd>
                <dt>Layouts</dt><dd>{(d.layouts || []).length}</dd>
              </dl>
              {locked.length ? <p className="sfb-lock" style={{ marginTop: 'var(--space-3)' }}><Icon name="lock" width="14" height="14" aria-hidden="true" /><span>Fixed by GridCommerce for your theme: {locked.join(', ')}.</span></p> : null}
              <div className="th-buttons">
                <a className="ix-btn ix-btn--primary" href="/store-editor">Edit store</a>
                <a className="ix-btn" href="/theme-editor">Customize</a>
                <a className="ix-btn" href="/header-builder">Header</a>
                <a className="ix-btn" href="/layouts">Layouts</a>
                <a className="ix-btn" href="/store-showcase" target="_blank" rel="noopener noreferrer">All sections</a>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="ix-card" aria-labelledby="th-pre">
        <div className="ix-card__head"><h2 id="th-pre">Designs</h2><button type="button" className="ix-btn ix-btn--sm" onClick={() => setSheet({ kind: 'ai' })}><Icon name="sparkles" width="16" height="16" aria-hidden="true" />Build with GridAI</button></div>
        <div className="th-presets">
          {designs.map((p) => {
            const off = ready ? presetOffer(p.id) : { ok: true, why: '' };
            const isCur = d && d.preset === p.id;
            return (
              <article key={p.id} className={'th-pre' + (isCur ? ' is-cur' : '')}>
                {p.pack ? <span className="th-logo" style={{ background: `color-mix(in srgb, ${p.accent} 8%, var(--surface-card))` }}><img src={p.logo} alt={p.name + ' logo'} loading="lazy" /></span> : p.image ? <img src={p.image} alt="" loading="lazy" /> : <span className="th-pre__ph" style={{ background: p.accent }} aria-hidden="true">{p.name.slice(0, 1)}</span>}
                <div className="th-pre__body">
                  <b><span className="th-dot" style={{ background: p.accent }} aria-hidden="true" />{p.name}{p.version ? <small className="sfb-muted">v{p.version}</small> : null}{isCur ? <StatusBadge tone="success">In use</StatusBadge> : null}{!p.builtIn ? <StatusBadge tone="info">New</StatusBadge> : null}</b>
                  <p>{p.label}{p.tagline ? ' · ' + p.tagline : ''}</p>
                  {off.why ? <p style={{ color: off.ok ? 'var(--text-muted)' : 'var(--text-warning)' }}>{off.why}</p> : null}
                  <div className="th-pre__acts">
                    <button type="button" className="ix-btn ix-btn--sm" onClick={() => setSheet({ kind: 'preview', design: withKit(p) })}><Icon name="eye" width="16" height="16" aria-hidden="true" />Preview</button>
                    <button type="button" className="ix-btn ix-btn--sm" disabled={!off.ok} onClick={() => setSheet({ kind: 'import', design: withKit(p) })}>Import</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="ix-card" aria-labelledby="th-file">
        <div className="ix-card__head"><h2 id="th-file">Design file</h2></div>
        <div className="th-file">
          <p>Your whole design (theme, headers, layouts, blocks, menus, notices and placements) as one file: keep a copy, move it to another shop, or import one made for you by GridCommerce’s design service.</p>
          <button type="button" className="ix-btn" onClick={() => setSheet({ kind: 'export' })}><Icon name="download" width="16" height="16" aria-hidden="true" />Export</button>
          <button type="button" className="ix-btn" onClick={() => setSheet({ kind: 'file' })}><Icon name="upload" width="16" height="16" aria-hidden="true" />Import</button>
        </div>
      </section>

      <section className="ix-card" aria-labelledby="th-rp">
        <div className="ix-card__head"><h2 id="th-rp">Restore points</h2><button type="button" className="ix-btn ix-btn--sm" onClick={save} disabled={!ready}>Make one now</button></div>
        {!ready ? null : points.length ? (
          <ul className="th-points" style={{ marginTop: 'var(--space-3)' }}>
            {points.map((pt) => (
              <li key={pt.id}>
                <Icon name="history" width="16" height="16" aria-hidden="true" />
                <span>{pt.label}<small>{when(pt.at)} · {KIND[pt.kind] || 'Saved'}{pt.snap && pt.snap.content ? ' · with menus and pages' : ''}</small></span>
                <button type="button" className="ix-btn ix-btn--sm" onClick={() => goBack(pt)}>Go back</button>
              </li>
            ))}
          </ul>
        ) : <div className="ix-empty"><EmptyState icon="history" title="No restore points yet" body="One is made before every import and publish." /></div>}
      </section>
    </StoreFrame>
  );
}
