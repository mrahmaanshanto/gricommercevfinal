'use client';
// SEO bulk editor — Online Store › SEO › Bulk editor (/seo-bulk?type=): one grid, like Products › Bulk edit, for the
// web address, meta title, meta description and main image's alt text of many products, categories, pages, posts or
// landing pages at once. Empty title / description = the default (shown greyed). Changed cells are marked; Save
// changes saves every changed row through its own type's save (so an address change still makes its redirect).
// "Only missing" keeps the rows without a description or alt text. Front end only (lib/seoItems.js).

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { EmptyState } from '@/components/ui';
import { ShopHeader, IndexTabs, SearchField } from '@/components/ui/IndexKit';
import { KINDS, LIMITS } from '@/lib/seo';
import { allItems, contextOf, saveSeo, saveHandle, saveAlt, KIND_ORDER } from '@/lib/seoItems';
import { cleanHandleInput } from '@/lib/handles';
import { SEO_EVENT } from '@/lib/redirects';
import { StoreFrame, queryParam } from './storeShared';

const CSS = `
.sb-wrap{overflow-x:auto}
.sb-grid{width:100%;min-width:980px;border-collapse:collapse}
.sb-grid th{position:sticky;top:0;z-index:1;padding:8px 10px;background:var(--surface-subtle);border-bottom:1px solid var(--border-subtle);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:left;white-space:nowrap}
.sb-grid td{padding:8px 10px;border-bottom:1px solid var(--border-subtle);vertical-align:top}
.sb-grid td:first-child{min-width:200px;max-width:240px}
.sb-grid b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.sb-grid small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.sb-grid .gc-input{width:100%;min-width:0}
.sb-grid textarea.gc-input{min-height:56px;resize:vertical}
.sb-grid .is-dirty .gc-input{border-color:var(--primary);background:var(--fill-primary-soft)}
.sb-n{display:block;margin-top:2px;font-size:var(--text-xs);color:var(--text-muted);font-family:var(--font-data)}
.sb-n.is-over{color:var(--text-danger)}
.sb-addr{display:flex;align-items:center;gap:4px;font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.sb-addr .gc-input{font-family:var(--font-data)}
.sb-tools{display:flex;align-items:center;gap:var(--space-2)}
.sb-only{display:inline-flex;align-items:center;gap:6px;font-size:var(--text-sm);color:var(--text-body);cursor:pointer;white-space:nowrap}
.sb-bar{position:sticky;bottom:calc(16px + var(--host-badge, 0px));z-index:5;display:flex;align-items:center;gap:var(--space-2);margin-top:var(--space-3);padding:var(--space-2) var(--space-3);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:0 8px 24px -12px rgba(15,23,42,.35);border:1px solid var(--border-subtle)}
.sb-bar span{flex:1;font-size:var(--text-sm);color:var(--text-heading)}
`;
const PAGE = 50;

export default function SeoBulk() {
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);
  const [kind, setKind] = useState('product');
  const [q, setQ] = useState('');
  const [find, setFind] = useState(false);
  const [only, setOnly] = useState(false);
  const [edits, setEdits] = useState({});
  const [limit, setLimit] = useState(PAGE);

  useEffect(() => {
    const t = queryParam('type');
    if (KINDS[t]) setKind(t);
    setReady(true);
    const bump = () => setTick((n) => n + 1);
    window.addEventListener(SEO_EVENT, bump);
    return () => window.removeEventListener(SEO_EVENT, bump);
  }, []);
  const dirtyN = Object.keys(edits).length;
  useEffect(() => {
    const onUnload = (e) => { if (dirtyN) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [dirtyN]);

  const rows = useMemo(() => (ready ? allItems().map((r) => ({ ...r, ctx: contextOf(r.kind, r.item) })) : []), [ready, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const counts = useMemo(() => Object.fromEntries(KIND_ORDER.map((k) => [k, rows.filter((r) => r.kind === k).length])), [rows]);
  const ql = q.trim().toLowerCase();
  const shown = rows.filter((r) => r.kind === kind && (!ql || (r.title + ' ' + r.handle).toLowerCase().includes(ql))
    && (!only || !String(r.seo.metaDescription).trim() || (r.ctx.images[0] && !String(r.ctx.images[0].alt || '').trim())));
  const key = (r) => r.kind + ':' + r.id;
  const val = (r, f, base) => (edits[key(r)] && edits[key(r)][f] != null ? edits[key(r)][f] : base);
  const edit = (r, f, v, base) => setEdits((e) => {
    const cur = { ...(e[key(r)] || {}), [f]: v };
    if (v === base) delete cur[f];
    const next = { ...e };
    if (Object.keys(cur).length) next[key(r)] = cur; else delete next[key(r)];
    return next;
  });
  const go = async (k) => {
    if (dirtyN && !(await confirmDialog({ title: 'Switch without saving?', body: dirtyN + ' changed row' + (dirtyN === 1 ? ' is' : 's are') + ' not saved yet.', confirmLabel: 'Discard and switch' }))) return;
    setEdits({}); setKind(k); setLimit(PAGE);
    try { window.history.replaceState(window.history.state, '', '/seo-bulk?type=' + k); } catch { /* ignore */ }
  };
  const saveAll = () => {
    let ok = 0;
    const errors = [];
    Object.entries(edits).forEach(([k, e]) => {
      const r = rows.find((x) => key(x) === k);
      if (!r) return;
      if (e.handle != null) { const res = saveHandle(r.kind, r.id, e.handle); if (!res.ok) { errors.push(r.title + ': ' + res.error); return; } }
      const seoPatch = {};
      if (e.metaTitle != null) seoPatch.metaTitle = e.metaTitle;
      if (e.metaDescription != null) seoPatch.metaDescription = e.metaDescription;
      if (Object.keys(seoPatch).length) { const res = saveSeo(r.kind, r.id, seoPatch); if (!res.ok) { errors.push(r.title + ': ' + res.error); return; } }
      if (e.alt != null && r.ctx.images[0]) { const res = saveAlt(r.kind, r.id, r.ctx.images[0], e.alt); if (!res.ok) { errors.push(r.title + ': ' + res.error); return; } }
      ok++;
    });
    setEdits({});
    setTick((n) => n + 1);
    if (errors.length) toast(ok + ' saved. ' + errors.length + ' not saved: ' + errors[0], { tone: 'error' });
    else toast(ok === 1 ? '1 row saved' : ok + ' rows saved');
  };
  const tabs = KIND_ORDER.map((k) => ({ key: k, id: 'sb-tab-' + k, label: KINDS[k].plural, count: ready ? counts[k] : null, on: kind === k, onClick: () => go(k) }));

  return (
    <StoreFrame screen="SeoBulk" active="store-seo" page="SEO bulk editor" css={CSS}>
      <ShopHeader icon="table-properties" title="SEO bulk editor"
        about="Edit the web address, meta title, meta description and main image's alt text of many items at once. Leave a title or description empty to use the default (shown in grey). Changing a live item's address keeps its old address working with a redirect."
        secondary={[{ label: 'SEO', href: '/seo' }]} />
      <section className="ix-card" aria-label="SEO of many items">
        <div className="ix-bar">
          {find ? (<>
            <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or address" onDone={() => { setFind(false); setQ(''); }} autoFocus />
            <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setFind(false); setQ(''); }}>Cancel</button>
          </>) : (<>
            <IndexTabs tabs={tabs} label="What to edit" />
            <span className="ix-tools sb-tools">
              <label className="sb-only"><input type="checkbox" className="gc-check" checked={only} onChange={(e) => setOnly(e.target.checked)} />Only missing</label>
              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
            </span>
          </>)}
        </div>
        {!ready ? <div style={{ minHeight: 280 }} aria-busy="true" /> : shown.length ? (
          <div className="sb-wrap gc-table-wrap">
            <table className="sb-grid gc-table--keep gc-table--scroll">
              <caption className="sr-only">{KINDS[kind].plural}: address, meta title, meta description and image alt text</caption>
              <thead><tr><th scope="col">{KINDS[kind].label}</th><th scope="col">Address</th><th scope="col">Meta title</th><th scope="col">Meta description</th><th scope="col">Main image alt text</th></tr></thead>
              <tbody>{shown.slice(0, limit).map((r) => {
                const e = edits[key(r)] || {};
                const t = val(r, 'metaTitle', r.seo.metaTitle || '');
                const dsc = val(r, 'metaDescription', r.seo.metaDescription || '');
                const img = r.ctx.images[0];
                const handleBase = r.handle || '';
                return (
                  <tr key={key(r)}>
                    <td><b>{r.title}</b><small>{r.live ? 'On the website' : 'Not on the website'}</small></td>
                    <td className={e.handle != null ? 'is-dirty' : ''}><span className="sb-addr"><span aria-hidden="true">{KINDS[r.kind].base}</span><input className="gc-input" aria-label={'Address of ' + r.title} value={val(r, 'handle', handleBase)} onChange={(ev) => edit(r, 'handle', cleanHandleInput(ev.target.value), handleBase)} /></span></td>
                    <td className={e.metaTitle != null ? 'is-dirty' : ''}><input className="gc-input" aria-label={'Meta title of ' + r.title} value={t} placeholder={r.ctx.defaultTitle || r.ctx.title} onChange={(ev) => edit(r, 'metaTitle', ev.target.value, r.seo.metaTitle || '')} /><span className={'sb-n' + ((t || r.ctx.defaultTitle || r.ctx.title || '').length > LIMITS.title ? ' is-over' : '')}>{(t || r.ctx.defaultTitle || r.ctx.title || '').length} / {LIMITS.title}</span></td>
                    <td className={e.metaDescription != null ? 'is-dirty' : ''}><textarea className="gc-input" aria-label={'Meta description of ' + r.title} value={dsc} placeholder="No description yet" onChange={(ev) => edit(r, 'metaDescription', ev.target.value, r.seo.metaDescription || '')} /><span className={'sb-n' + (dsc.length > LIMITS.desc ? ' is-over' : '')}>{dsc.length} / {LIMITS.desc}</span></td>
                    <td className={e.alt != null ? 'is-dirty' : ''}>{img ? <input className="gc-input" aria-label={'Alt text of ' + r.title + '’s main image'} value={val(r, 'alt', img.alt || '')} placeholder="What the image shows" onChange={(ev) => edit(r, 'alt', ev.target.value, img.alt || '')} /> : <small>No image</small>}</td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        ) : <div className="ix-empty"><EmptyState icon="search-check" title={only ? 'Nothing missing here' : 'Nothing here'} body={only ? 'Every one has a description and alt text.' : 'Try another type or search.'} actionLabel={only || ql ? 'Show all' : undefined} onAction={only || ql ? () => { setOnly(false); setQ(''); setFind(false); } : undefined} /></div>}
        <div className="ix-foot">
          <span>{shown.length > limit ? 'First ' + limit + ' of ' + shown.length : shown.length + ' ' + KINDS[kind].plural.toLowerCase()}</span>
          {shown.length > limit ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => setLimit(limit + PAGE)}>Show more</button> : null}
        </div>
      </section>
      {dirtyN ? (
        <div className="sb-bar" role="group" aria-label="Save changes">
          <span>{dirtyN === 1 ? '1 row changed' : dirtyN + ' rows changed'}</span>
          <button type="button" className="ix-btn" onClick={() => setEdits({})}>Discard</button>
          <button type="button" className="ix-btn ix-btn--primary" onClick={saveAll}><Icon name="check" width="16" height="16" aria-hidden="true" />Save changes</button>
        </div>
      ) : null}
    </StoreFrame>
  );
}
