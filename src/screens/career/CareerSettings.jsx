'use client';
// CareerSettings — an employer's public careers page (headline, about, benefits, logo, cover, on / off and its link) and
// the messages candidates get at each stage (English and Bangla). Used inside the merchant's /hiring (a "Careers page"
// card) and on the super admin's /admin/career/page. Data: lib/platform/career.js › saveEmployer / saveTemplates.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Pic } from '@/components/ui/Pic';
import { readPicture } from '@/lib/readPicture';
import { employerOf, saveEmployer, templatesOf, saveTemplates, careersLink, publicJobs, TEMPLATE_KEYS } from '@/lib/platform/career';

const CSS = `
.cs-pics{display:flex;flex-wrap:wrap;gap:var(--space-4);align-items:flex-start}
.cs-pic{display:flex;flex-direction:column;gap:var(--space-2)}
.cs-cover{width:240px;max-width:100%;aspect-ratio:3/1;border-radius:var(--radius-lg);border:1px solid var(--border-subtle);background:var(--surface-subtle) center/cover no-repeat;display:grid;place-items:center;color:var(--text-muted)}
.cs-file{position:relative;overflow:hidden}
.cs-file input{position:absolute;inset:0;opacity:0;cursor:pointer}
.cs-on{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.cs-on b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.cs-tpl{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3) 0;border-top:1px solid var(--border-subtle)}
.cs-tpl:first-child{border-top:0;padding-top:0}
.cs-tpl b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.cs-tpl textarea.gc-input{min-height:72px}
`;

/** The careers page form. owner · by · compact (inside another page: no outer card) */
export function CareersPageForm({ owner, by, onSaved }) {
  const [f, setF] = useState(null);
  const [dirty, setDirty] = useState(false);
  useEffect(() => { const e = employerOf(owner); setF({ ...e, benefits: (e.benefits || []).join('\n') }); }, [owner]);
  if (!f) return <div style={{ minHeight: 200 }} aria-busy="true" />;
  const set = (p) => { setF((x) => ({ ...x, ...p })); setDirty(true); };
  const pick = (k, max) => async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try { const r = await readPicture(file, { max }); set({ [k]: r.src }); } catch (err) { toast(err.message, { tone: 'error' }); }
  };
  const save = (patch = {}) => {
    const r = saveEmployer(owner, { ...f, ...patch }, by);
    if (r.ok === false) { toast(r.error, { tone: 'error' }); return; }
    setDirty(false);
    if (!('published' in patch)) toast('Careers page saved');
    if (onSaved) onSaved();
  };
  const link = careersLink(owner);
  const open = publicJobs(owner).length;
  return (
    <div className="cr-form">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="cs-on">
        <span><b>{f.published ? 'The careers page is on' : 'The careers page is off'}</b><span className="cr-sub">{f.published ? `${open} open job${open === 1 ? '' : 's'} on it` : 'Candidates see “Not hiring right now”'}</span></span>
        <button type="button" role="switch" className="gc-switch" aria-checked={!!f.published} aria-label="Careers page on" onClick={() => { const v = !f.published; set({ published: v }); save({ published: v }); toast(v ? 'Careers page is on' : 'Careers page is off'); }}><span className="gc-switch__knob" /></button>
      </div>
      <div className="cr-link">
        <input className="gc-input" readOnly value={link} aria-label="Careers page link" onFocus={(e) => e.target.select()} />
        <button type="button" className="ix-btn" onClick={async () => { try { await navigator.clipboard.writeText(link); toast('Link copied'); } catch { toast(link); } }}>Copy</button>
        <a className="ix-btn ix-btn--icon" href={link} target="_blank" rel="noopener noreferrer" aria-label="Open the careers page"><Icon name="external-link" width="16" height="16" aria-hidden="true" /></a>
      </div>
      <div className="cr-two">
        <div><label className="gc-label" htmlFor={'cs-name-' + owner}>Employer name</label><input id={'cs-name-' + owner} className="gc-input" value={f.name} onChange={(e) => set({ name: e.target.value })} /></div>
        <div><label className="gc-label" htmlFor={'cs-head-' + owner}>Headline</label><input id={'cs-head-' + owner} className="gc-input" value={f.headline} onChange={(e) => set({ headline: e.target.value })} placeholder="e.g. Join the Dazzle Shop team" /></div>
      </div>
      <div><label className="gc-label" htmlFor={'cs-about-' + owner}>About you</label><textarea id={'cs-about-' + owner} className="gc-input" rows={4} value={f.about} onChange={(e) => set({ about: e.target.value })} placeholder="Who you are and what working with you is like" /></div>
      <div><label className="gc-label" htmlFor={'cs-ben-' + owner}>Benefits</label><textarea id={'cs-ben-' + owner} className="gc-input" rows={4} value={f.benefits} onChange={(e) => set({ benefits: e.target.value })} placeholder="One per line, e.g. Two Eid bonuses" /></div>
      <div className="cs-pics">
        <div className="cs-pic"><span className="gc-label" style={{ margin: 0 }}>Logo</span><Pic src={f.logo} name={f.name} kind="logo" size={56} />
          <span className="cr-row"><span className="ix-btn ix-btn--sm cs-file">{f.logo ? 'Change' : 'Add logo'}<input type="file" accept="image/*" aria-label="Logo" onChange={pick('logo', 320)} /></span>{f.logo ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => set({ logo: '' })}>Remove</button> : null}</span></div>
        <div className="cs-pic"><span className="gc-label" style={{ margin: 0 }}>Cover picture</span><span className="cs-cover" style={f.cover ? { backgroundImage: `url(${f.cover})` } : undefined}>{f.cover ? null : <Icon name="image" width="20" height="20" aria-hidden="true" />}</span>
          <span className="cr-row"><span className="ix-btn ix-btn--sm cs-file">{f.cover ? 'Change' : 'Add cover'}<input type="file" accept="image/*" aria-label="Cover picture" onChange={pick('cover', 1600)} /></span>{f.cover ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => set({ cover: '' })}>Remove</button> : null}</span></div>
      </div>
      <div className="cr-row"><button type="button" className="ix-btn ix-btn--primary" disabled={!dirty} onClick={() => save()}>Save careers page</button>{dirty ? <span className="gc-help" style={{ margin: 0 }}>Unsaved changes</span> : null}</div>
    </div>
  );
}

/** The messages candidates get, per stage, in English and Bangla. */
export function TemplatesForm({ owner }) {
  const [t, setT] = useState(null);
  const [dirty, setDirty] = useState(false);
  useEffect(() => { setT(templatesOf(owner)); }, [owner]);
  if (!t) return null;
  const set = (k, lang, v) => { setT((x) => ({ ...x, [k]: { ...x[k], [lang]: v } })); setDirty(true); };
  return (
    <div className="cr-form">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <span className="gc-help" style={{ margin: 0 }}>{'{{name}} {{job}} {{employer}} {{time}} {{mode}} {{link}}'} fill in by themselves. Messages go by SMS (and email when the candidate gave one).</span>
      {TEMPLATE_KEYS.map(([k, l]) => (
        <div key={k} className="cs-tpl">
          <b>{l}</b>
          <div className="cr-two">
            <div><label className="gc-label" htmlFor={`cs-${owner}-${k}-en`}>English</label><textarea id={`cs-${owner}-${k}-en`} className="gc-input" value={t[k].en} onChange={(e) => set(k, 'en', e.target.value)} /></div>
            <div><label className="gc-label" htmlFor={`cs-${owner}-${k}-bn`}>বাংলা</label><textarea id={`cs-${owner}-${k}-bn`} className="gc-input bn" lang="bn" value={t[k].bn} onChange={(e) => set(k, 'bn', e.target.value)} /></div>
          </div>
        </div>
      ))}
      <div className="cr-row"><button type="button" className="ix-btn ix-btn--primary" disabled={!dirty} onClick={() => { saveTemplates(owner, t); setDirty(false); toast('Messages saved'); }}>Save messages</button></div>
    </div>
  );
}
