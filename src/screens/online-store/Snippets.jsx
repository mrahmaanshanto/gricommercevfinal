'use client';
// Snippets — Online Store › Snippets (/snippets; Batch C step 8). Safe code for the online store, on every plan, and
// never the shop's own JavaScript (lib/storefront/snippets.js):
//   Tracking & verification  an ID only; GridCommerce writes the code from a fixed template (shown, not editable)
//   CSS                      checked strictly and scoped to the store; never on checkout, account or payment pages
//   Text or HTML             through the allow-list; below the header or above the footer
// Each snippet has its own on / off; a snippet that fails its check is not saved (the panel lists why). When
// GridCommerce has turned snippets off for the shop, a banner says so and nothing is added to the store.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, EmptyState, StatusBadge } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { currentUser } from '@/lib/team';
import {
  getSnippets, saveSnippet, setSnippetOn, removeSnippet, checkSnippet, killOf, trackerBy,
  TRACKERS, SNIPPET_KINDS, SNIPPET_SPOTS, SNIPPETS_EVENT, NO_CODE_PAGES, SNIPPET_LIMITS,
} from '@/lib/storefront/snippets';
import { TeamPage } from '@/screens/team/teamShared';

const CSS = `
.snp-kill{display:flex;gap:var(--space-3);align-items:flex-start;padding:var(--space-3) var(--space-4);margin-bottom:var(--space-3);border-radius:var(--radius-xl);background:var(--fill-error-soft);color:var(--text-danger);font-size:var(--text-sm)}
.snp-kill b{display:block;font-weight:var(--weight-semibold)}
.snp-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.snp-ed{display:flex;flex-direction:column;gap:var(--space-4)}
.snp-kinds{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-2)}
.snp-kinds button{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-height:64px;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;font-size:var(--text-sm);color:var(--text-heading);text-align:left;cursor:pointer}
.snp-kinds button[aria-pressed="true"]{border-color:var(--primary);background:var(--primary-50)}
.snp-kinds small{font-size:var(--text-xs);color:var(--text-muted)}
.snp-fld{display:flex;flex-direction:column;gap:6px;min-width:0}
.snp-fld textarea{min-height:180px;padding:var(--space-2) var(--space-3);font-family:var(--font-code);font-size:var(--text-xs);line-height:1.5;height:auto}
.snp-code{margin:0;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-family:var(--font-code);font-size:var(--text-xs);line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere;max-height:220px;overflow:auto;color:var(--text-body)}
.snp-check{display:flex;flex-direction:column;gap:4px;padding:var(--space-3);border-radius:var(--radius-lg);font-size:var(--text-sm)}
.snp-check.is-ok{background:var(--fill-success-soft);color:var(--text-success)}
.snp-check.is-bad{background:var(--fill-error-soft);color:var(--text-danger)}
.snp-check ul{margin:0;padding-left:18px;font-size:var(--text-xs)}
.snp-prev{padding:var(--space-3);border:1px dashed var(--border-subtle);border-radius:var(--radius-lg);font-size:var(--text-sm);color:var(--text-body);background:var(--surface-card)}
@media (max-width:640px){.snp-kinds{grid-template-columns:minmax(0,1fr)}}
`;

const BLANK = { kind: 'tracking', name: '', on: true, provider: 'ga4', value: '', css: '', html: '', spot: 'below-header' };
const kindLabel = (k) => (SNIPPET_KINDS.find(([x]) => x === k) || [0, k])[1];
const detailOf = (s) => {
  if (s.kind === 'tracking') { const t = trackerBy(s.provider); return `${t ? t[1] : s.provider} · ${s.value}`; }
  if (s.kind === 'css') return `${String(s.css || '').length.toLocaleString('en-IN')} characters of CSS`;
  return `${(SNIPPET_SPOTS.find(([k]) => k === s.spot) || [0, ''])[1]} · ${String(s.html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60)}`;
};

export default function Snippets() {
  const [tick, setTick] = useState(0);
  const [ready, setReady] = useState(false);
  const [ed, setEd] = useState(null);       // the snippet being added or changed
  const [tried, setTried] = useState(false);
  useEffect(() => {
    setReady(true);
    const on = () => setTick((x) => x + 1);
    window.addEventListener(SNIPPETS_EVENT, on); window.addEventListener('storage', on);
    return () => { window.removeEventListener(SNIPPETS_EVENT, on); window.removeEventListener('storage', on); };
  }, []);
  const data = useMemo(() => (ready ? { list: getSnippets(), kill: killOf() } : null), [ready, tick]);
  const check = useMemo(() => (ed ? checkSnippet(ed) : null), [ed]);
  const by = (currentUser() || {}).name || 'Staff';
  const open = (s) => { setEd(s ? { ...s } : { ...BLANK }); setTried(false); };
  const save = () => {
    setTried(true);
    const r = saveSnippet(ed, by);
    if (!r.ok) { toast('Not saved: ' + r.problems[0], { tone: 'error' }); return; }
    setEd(null); toast(`${r.snippet.name} saved${r.snippet.on ? ' and on' : ''}`);
  };
  const del = async (s) => {
    if (!(await confirmDialog({ title: `Delete ${s.name}?`, body: 'It comes off the store at once.', confirmLabel: 'Delete', tone: 'danger' }))) return;
    removeSnippet(s.id); setEd(null); toast(`${s.name} deleted`);
  };
  const set = (k, v) => setEd({ ...ed, [k]: v });
  const t = ed && ed.kind === 'tracking' ? trackerBy(ed.provider) : null;

  const body = () => {
    if (!data) return <div className="ix-card" style={{ minHeight: 240 }} aria-busy="true" />;
    const { list, kill } = data;
    return (<>
      {kill ? <div className="snp-kill" role="alert"><Icon name="shield-off" width="18" height="18" aria-hidden="true" /><span><b>GridCommerce has turned snippets off for this store</b>{kill.reason ? kill.reason.replace(/[.!]?$/, '.') : 'Contact GridCommerce support.'} Nothing below is added to the store until it is turned back on.</span></div> : null}
      <section className="ix-card">
        {!list.length ? <EmptyState icon="code-xml" title="No snippets yet" actionLabel="Add snippet" onAction={() => open(null)} /> : (
          <div className="ix-table-wrap ix-table-wrap--show">
            <table className="ix-table">
              <caption className="sr-only">Snippets</caption>
              <thead><tr><th scope="col">Snippet</th><th scope="col">Kind</th><th scope="col">Changed</th><th scope="col">On</th></tr></thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s.id} onClick={() => open(s)} style={{ cursor: 'pointer' }}>
                    <td><button type="button" className="ix-strong" style={{ border: 0, background: 'none', padding: 0, font: 'inherit', cursor: 'pointer', color: 'inherit', textAlign: 'left' }} onClick={(e) => { e.stopPropagation(); open(s); }}>{s.name}</button><span className="snp-sub">{detailOf(s)}</span></td>
                    <td>{kindLabel(s.kind)}</td>
                    <td>{formatDate(s.at)}<span className="snp-sub">{s.by}</span></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="gc-switch" checked={s.on !== false} aria-label={`${s.name} on the store`} onChange={() => { setSnippetOn(s.id, s.on === false); toast(s.on === false ? `${s.name} is on` : `${s.name} is off`); }} />
                      {kill ? <StatusBadge tone="neutral">Off by GridCommerce</StatusBadge> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <details className="gc-disclose" style={{ marginTop: 'var(--space-3)' }}>
        <summary>What is allowed</summary>
        <ul style={{ margin: 'var(--space-2) 0 0', paddingLeft: 18, fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
          <li>Tracking and verification by ID only. GridCommerce writes the code; you can’t add your own script.</li>
          <li>CSS that only changes how the store looks: no @import, no pictures or fonts from other sites, no code inside styles, no selectors that can read what customers type, no fixed boxes over the page.</li>
          <li>Text and simple HTML (headings, links, pictures from https://, lists, tables). No scripts, frames, forms or buttons.</li>
          <li>CSS and HTML never go on these pages: {NO_CODE_PAGES.join(', ')} (checkout, account and payment).</li>
          <li>Up to {SNIPPET_LIMITS.count} snippets. Anything that fails a check is not saved.</li>
        </ul>
      </details>
    </>);
  };

  return (
    <TeamPage screen="Snippets" active="store-snippets" crumb="Online Store" page="Snippets" title="Code snippets" icon="code-xml" css={CSS}
      about="Safe additions to your online store: tracking and verification by ID (Meta Pixel, Google Analytics 4, Google Tag Manager, TikTok, Google and Bing verification), CSS that changes the look, and text or HTML below the header or above the footer. No JavaScript. Each one is checked before it is saved, can be turned on or off, and never runs on checkout, account or payment pages."
      primary={{ label: 'Add snippet', icon: 'plus', onClick: () => open(null) }}>
      {body()}
      <Sheet open={!!ed} title={ed && ed.id ? ed.name || 'Snippet' : 'Add a snippet'} onClose={() => setEd(null)}
        footer={ed ? (<>
          {ed.id ? <button type="button" className="gc-btn gc-btn--flat" onClick={() => del(ed)}>Delete</button> : null}
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEd(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={save}>Save</button>
        </>) : null}>
        {ed ? (
          <div className="snp-ed">
            {!ed.id ? (
              <div className="snp-kinds" role="group" aria-label="Kind of snippet">
                {SNIPPET_KINDS.map(([k, l, d]) => <button key={k} type="button" aria-pressed={ed.kind === k} onClick={() => setEd({ ...BLANK, name: ed.name, kind: k })}><b>{l}</b><small>{d}</small></button>)}
              </div>
            ) : null}
            <div className="snp-fld"><label className="gc-label" htmlFor="snp-name">Name</label><input id="snp-name" className="gc-input" maxLength={60} value={ed.name} onChange={(e) => set('name', e.target.value)} placeholder={ed.kind === 'tracking' ? 'e.g. Facebook pixel' : ed.kind === 'css' ? 'e.g. Rounder product cards' : 'e.g. Eid delivery note'} /></div>
            {ed.kind === 'tracking' ? (<>
              <div className="snp-fld"><label className="gc-label" htmlFor="snp-prov">For</label><select id="snp-prov" className="gc-input gc-select" value={ed.provider} onChange={(e) => set('provider', e.target.value)}>{TRACKERS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
              <div className="snp-fld"><label className="gc-label" htmlFor="snp-val">{t ? t[2] : 'ID'}</label><input id="snp-val" className="gc-input" style={{ fontFamily: 'var(--font-data)' }} value={ed.value} onChange={(e) => set('value', e.target.value.trim())} placeholder={t ? t[4] : ''} autoComplete="off" spellCheck={false} /></div>
              {check.ok ? (<><span className="gc-label">The code GridCommerce adds</span><pre className="snp-code">{check.out}</pre>{t && !t[5] ? <span className="snp-sub">The live store adds this to every page. This demo shows it but doesn’t load other sites.</span> : null}</>) : null}
            </>) : null}
            {ed.kind === 'css' ? (
              <div className="snp-fld"><label className="gc-label" htmlFor="snp-css">CSS</label><textarea id="snp-css" className="gc-input" spellCheck={false} value={ed.css} onChange={(e) => set('css', e.target.value)} placeholder={'.sf-card { box-shadow: none; }\n.sf-btn { letter-spacing: .02em; }'} /><span className="snp-sub">Applies to the store pages only (it is put under .sf-theme). Use the store’s colours with var(--sf-primary), var(--sf-accent) …</span></div>
            ) : null}
            {ed.kind === 'html' ? (<>
              <div className="snp-fld"><label className="gc-label" htmlFor="snp-spot">Where</label><select id="snp-spot" className="gc-input gc-select" value={ed.spot} onChange={(e) => set('spot', e.target.value)}>{SNIPPET_SPOTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
              <div className="snp-fld"><label className="gc-label" htmlFor="snp-html">Text or HTML</label><textarea id="snp-html" className="gc-input" spellCheck={false} value={ed.html} onChange={(e) => set('html', e.target.value)} placeholder={'<p><strong>Eid delivery:</strong> orders placed after 25 March arrive after the holiday.</p>'} /></div>
              {check.ok ? <><span className="gc-label">Preview</span><div className="snp-prev" dangerouslySetInnerHTML={{ __html: check.out }} /></> : null}
            </>) : null}
            {(tried || (ed.kind !== 'tracking' ? (ed.css || ed.html) : ed.value)) ? (
              check.ok ? <div className="snp-check is-ok" role="status"><b><Icon name="shield-check" width="16" height="16" aria-hidden="true" /> Safe to save</b></div>
                : <div className="snp-check is-bad" role="alert"><b>Can’t be saved yet</b><ul>{check.problems.map((p) => <li key={p}>{p}</li>)}</ul></div>
            ) : null}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)' }}><input type="checkbox" checked={ed.on !== false} onChange={(e) => set('on', e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--primary)' }} />On the store</label>
          </div>
        ) : null}
      </Sheet>
    </TeamPage>
  );
}
