'use client';
// CustomSections — Online Store › HTML blocks › Custom sections (?view=custom; Batch A step 6): the shop's own sections in
// HTML and CSS, with settings ({{key}} in the code) that anyone fills in from the layout editor. Writing code needs the
// Business plan (and the theme's "Custom section code" switch); GridCommerce's designers bring custom sections to any shop
// through design files. Scripts, frames, forms and event handlers are taken out and the CSS is scoped to the section
// (lib/storefront/customCode.js), so a section can't break the store or the checkout.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, EmptyState } from '@/components/ui';
import { getCustoms, newCustom, saveCustom, duplicateCustom, deleteCustom, customUsedIn, codeLock } from '@/lib/storefront/customs';
import { renderCustom, customProblem, CUSTOM_FIELD_TYPES, CUSTOM_LIMITS } from '@/lib/storefront/customCode';
import { themeVars, themeValues } from '@/lib/storefront/theme';
import { Menu } from '@/components/ui/IndexKit';
import { when, LockNote } from './sfShared';
import { CustomBody } from '../storefront/sections';

export const CUSTOM_CSS = `
@media (min-width:1024px){.gc-sheet:has(.csx-ed){width:min(1040px,96vw)}}
.csx-ed{display:grid;grid-template-columns:minmax(0,1fr);gap:var(--space-4)}
@media (min-width:1024px){.csx-ed{grid-template-columns:minmax(0,1.1fr) minmax(0,1fr)}}
.csx-code{font-family:var(--font-code);font-size:var(--text-xs);line-height:1.5;min-height:180px;white-space:pre;tab-size:2}
.csx-fields{display:flex;flex-direction:column;gap:var(--space-2)}
.csx-frow{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1fr) minmax(0,.9fr) minmax(0,1.2fr) auto;gap:6px;align-items:center}
.csx-frow .gc-input{min-width:0}
.csx-prev{position:sticky;top:0;display:flex;flex-direction:column;gap:var(--space-2)}
.csx-prev__box{padding:16px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-subtle);overflow:auto;max-height:520px}
.csx-gone{margin:0;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);border:1px solid var(--warning);color:var(--text-warning);font-size:var(--text-xs)}
.csx-hint{font-size:var(--text-xs);color:var(--text-muted);margin:0}
.csx-hint code{font-family:var(--font-code)}
@media (max-width:640px){.csx-frow{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.csx-frow>:last-child{justify-self:start}}
`;

const clone = (x) => JSON.parse(JSON.stringify(x));

/** The editor: name, settings, HTML, CSS and a live preview. */
export function CustomSheet({ def, onClose, onSaved }) {
  const [f, setF] = useState(() => clone(def));
  const lock = codeLock();
  const set = (patch) => setF((x) => ({ ...x, ...patch }));
  const setField = (i, patch) => set({ fields: f.fields.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
  const r = useMemo(() => renderCustom(f, {}), [f]);
  const problem = customProblem(f);
  const vars = useMemo(() => { try { return themeVars(themeValues()); } catch { return ''; } }, []);
  const save = () => {
    const res = saveCustom(f);
    if (!res.ok) { toast(res.error, { tone: 'error' }); return; }
    toast(`${res.custom.name} saved`);
    onSaved && onSaved(res.custom);
  };
  const ro = !!lock;
  return (
    <Sheet open title={def.updatedAt ? f.name || 'Custom section' : 'New custom section'} onClose={onClose}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>{ro ? 'Close' : 'Cancel'}</button>{ro ? null : <button type="button" className="gc-btn gc-btn--solid" disabled={!!problem} title={problem || undefined} onClick={save}>Save section</button>}</>}>
      <div className="csx-ed">
        <div className="sfb-fields">
          {ro ? <LockNote text={`${lock} You can still fill in its settings in a layout. GridCommerce's design service can write one for you.`} /> : null}
          <div className="sfb-field"><label className="gc-label" htmlFor="csx-name">Name</label><input id="csx-name" className="gc-input" value={f.name} disabled={ro} placeholder="Eid banner with countdown" onChange={(e) => set({ name: e.target.value })} /></div>
          <div className="sfb-field">
            <span className="gc-label">Settings people can change</span>
            <p className="csx-hint">Write <code>{'{{key}}'}</code> in the HTML where a setting goes. In the CSS only colours, numbers and pictures can be settings.</p>
            <div className="csx-fields">
              {f.fields.map((x, i) => (
                <div key={i} className="csx-frow">
                  <input className="gc-input" aria-label={`Setting ${i + 1} key`} placeholder="key" value={x.key} disabled={ro} onChange={(e) => setField(i, { key: e.target.value.replace(/[^\w-]/g, '') })} />
                  <input className="gc-input" aria-label={`Setting ${i + 1} label`} placeholder="Label" value={x.label} disabled={ro} onChange={(e) => setField(i, { label: e.target.value })} />
                  <select className="gc-input gc-select" aria-label={`Setting ${i + 1} type`} value={x.type} disabled={ro} onChange={(e) => setField(i, { type: e.target.value })}>{CUSTOM_FIELD_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                  <input className="gc-input" aria-label={`Setting ${i + 1} default`} placeholder="Default" value={x.default} disabled={ro} onChange={(e) => setField(i, { default: e.target.value })} />
                  <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Remove setting ${i + 1}`} disabled={ro} onClick={() => set({ fields: f.fields.filter((_, j) => j !== i) })}><Icon name="x" width="16" height="16" /></button>
                </div>
              ))}
              {!ro && f.fields.length < CUSTOM_LIMITS.fields ? <button type="button" className="ix-btn ix-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => set({ fields: [...f.fields, { key: '', label: '', type: 'text', default: '' }] })}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add a setting</button> : null}
            </div>
          </div>
          <div className="sfb-field"><label className="gc-label" htmlFor="csx-html">HTML</label><textarea id="csx-html" className="gc-input csx-code" rows={10} spellCheck={false} value={f.html} readOnly={ro} onChange={(e) => set({ html: e.target.value })} /></div>
          <div className="sfb-field"><label className="gc-label" htmlFor="csx-css">CSS</label><textarea id="csx-css" className="gc-input csx-code" rows={8} spellCheck={false} value={f.css} readOnly={ro} onChange={(e) => set({ css: e.target.value })} />
            <p className="csx-hint">Applies only inside this section. The store's colours are <code>var(--sf-primary)</code>, <code>--sf-accent</code>, <code>--sf-text</code>, <code>--sf-surface</code>, <code>--sf-radius</code>.</p></div>
        </div>
        <div className="csx-prev">
          <span className="gc-label">Preview, with the default settings</span>
          <div className="csx-prev__box">
            {vars ? <style>{vars}</style> : null}
            <div className="sf-theme" style={{ background: 'transparent', minHeight: 0 }}><CustomBody def={f} values={{}} /></div>
            {!r.html.trim() ? <p className="csx-hint">Nothing to show yet.</p> : null}
          </div>
          {r.removed.length ? <p className="csx-gone" role="status">Taken out when it shows: {r.removed.join(', ')}.</p> : null}
          {problem ? <p className="csx-hint" role="status">{problem}</p> : null}
        </div>
      </div>
    </Sheet>
  );
}

/** The list of custom sections (the HTML blocks page's third view). */
export function CustomList({ ready, d, onEdit }) {
  const list = useMemo(() => (ready ? getCustoms() : []), [ready, d]);
  const lock = ready ? codeLock() : '';
  const remove = async (c) => {
    const u = customUsedIn(c.id);
    if (!(await confirmDialog({ title: `Delete “${c.name}”?`, body: u.length ? `It is used in ${u.map((x) => x.where).join(', ')}. Those places show nothing there after this.` : 'It is not used anywhere. It is removed for good.', confirmLabel: 'Delete', tone: 'danger' }))) return;
    deleteCustom(c.id);
    toast(`${c.name} deleted`);
  };
  const dup = (c) => { const r = duplicateCustom(c.id); if (!r.ok) toast(r.error, { tone: 'error' }); else toast(`${r.custom.name} made`); };
  return (
    <section className="ix-card" aria-label="Custom sections">
      {lock && ready ? <div style={{ padding: 'var(--space-3) var(--space-4) 0' }}><LockNote text={`${lock} Custom sections made for you by GridCommerce still work, and you can fill in their settings in a layout.`} /></div> : null}
      {!ready ? <div style={{ minHeight: 200 }} aria-busy="true" /> : !list.length ? (
        <div className="ix-empty"><EmptyState icon="code-xml" title="No custom sections yet" body={lock ? 'Our design service can make one for you.' : 'Write a section in HTML and CSS, then add it to any layout.'} actionLabel={lock ? 'See the design service' : 'New custom section'} onAction={() => { if (lock) window.location.href = '/service-detail?id=store-design'; else onEdit(newCustom()); }} /></div>
      ) : (<>
        <ul className="ix-plist" aria-label="Custom sections">
          {list.map((c) => <li key={c.id}><button type="button" className="ix-pitem" onClick={() => onEdit(c)}><span className="ix-pitem__top"><b>{c.name}</b></span><span className="ix-pitem__mid">{c.fields.length} settings · {customUsedIn(c.id).length ? 'used in ' + customUsedIn(c.id).length : 'not used'} · {when(c.updatedAt)}</span></button></li>)}
        </ul>
        <div className="ix-table-wrap">
          <table className="ix-table">
            <caption className="sr-only">{`Custom sections, ${list.length}`}</caption>
            <thead><tr><th scope="col">Section</th><th scope="col">Settings</th><th scope="col">Used in</th><th scope="col">Last edited</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {list.map((c) => {
                const u = customUsedIn(c.id);
                return (
                  <tr key={c.id} onClick={(e) => { if (!e.target.closest('a,button')) onEdit(c); }}>
                    <td><button type="button" className="ix-link ix-strong" onClick={() => onEdit(c)} style={{ background: 'none', border: 0, padding: 0, font: 'inherit', cursor: 'pointer', color: 'inherit' }}>{c.name}</button>{c.by ? <small className="ix-muted" style={{ display: 'block' }}>by {c.by}</small> : null}</td>
                    <td className="ix-muted">{c.fields.map((x) => x.label || x.key).join(', ') || 'None'}</td>
                    <td>{u.length ? u.map((x) => <Link key={x.href} href={x.href} style={{ marginRight: 8 }}>{x.where.replace('Layout · ', '')}</Link>) : <span className="ix-muted">Not used</span>}</td>
                    <td className="ix-muted">{when(c.updatedAt)}</td>
                    <td style={{ textAlign: 'right' }}><Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" items={[{ label: lock ? 'View' : 'Edit', onClick: () => onEdit(c) }, ...(lock ? [] : [{ label: 'Duplicate', onClick: () => dup(c) }]), { label: 'Delete', onClick: () => remove(c), tone: 'danger' }]} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </>)}
      <div className="ix-foot"><span>{list.length === 1 ? '1 custom section' : list.length + ' custom sections'}</span></div>
    </section>
  );
}
