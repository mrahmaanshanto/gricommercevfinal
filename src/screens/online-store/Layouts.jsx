'use client';
// Layouts — Online Store › Layouts (/layouts), Module A · A4: the page templates the store is drawn with (Home,
// Product page, Category page, Page, Cart, Search, Page not found), each made of sections.
//   Views by page kind with counts; each row: name, kind, condition (all, one category, one product or one page), its
//   header (default or its own), status (Published · Unpublished changes · Draft), last edited. "…": Edit, Duplicate,
//   Delete. Add layout picks the kind. The most specific published layout wins on a page; without one, the built-in
//   default shows. Front end only: lib/storefront/layouts.js.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { EmptyState, Sheet } from '@/components/ui';
import { ShopHeader, IndexTabs, Menu } from '@/components/ui/IndexKit';
import { KINDS, kindBy, condText, addLayout, duplicateLayout, deleteLayout } from '@/lib/storefront/layouts';
import { lockOf } from '@/lib/storefront/access';
import { allProducts } from '@/lib/products';
import { getPages } from '@/lib/storePages';
import { StoreFrame } from './storeShared';
import { useSf, DocBadge, LockNote, when, SFB_CSS } from './sfShared';

/** Names for condition refs (product ids, page ids; category paths name themselves). */
export function refNames() {
  const out = {};
  try { allProducts().forEach((p) => { out[p.id] = p.name; }); } catch { /* ignore */ }
  try { getPages().forEach((p) => { out[p.id] = p.title; }); } catch { /* ignore */ }
  return out;
}

export default function Layouts() {
  const { ready, d } = useSf();
  const [tab, setTab] = useState('all');
  const [pick, setPick] = useState(false);
  const names = useMemo(() => (ready ? refNames() : {}), [ready]);
  const list = d ? d.layouts || [] : [];
  const shown = list.filter((l) => tab === 'all' || l.kind === tab).sort((a, b) => KINDS.findIndex((k) => k.kind === a.kind) - KINDS.findIndex((k) => k.kind === b.kind));
  const headers = d ? Object.fromEntries((d.headers || []).map((h) => [h.id, h.name])) : {};
  const locked = ready ? lockOf('sections') : '';
  const tabs = [{ key: 'all', id: 'ly-all', label: 'All', count: ready ? list.length : null, on: tab === 'all', onClick: () => setTab('all') },
    ...KINDS.map((k) => ({ key: k.kind, id: 'ly-' + k.kind, label: k.label, count: ready ? list.filter((l) => l.kind === k.kind).length : null, on: tab === k.kind, onClick: () => setTab(k.kind) }))];
  const add = (kind) => { const l = addLayout(kind); navigate('/layout-edit?id=' + l.id); };
  const dup = (l) => { const c = duplicateLayout(l.id); if (c) { toast(`${c.name} made (a draft)`); navigate('/layout-edit?id=' + c.id); } };
  const remove = async (l) => {
    if (!(await confirmDialog({ title: `Delete ${l.name}?`, body: 'Pages it drew use the next layout that fits, or the built-in one.', confirmLabel: 'Delete', tone: 'danger' }))) return;
    deleteLayout(l.id); toast(`${l.name} deleted`);
  };
  const edit = (l) => '/layout-edit?id=' + l.id;
  const L = (l) => l.doc.draft || {};

  return (
    <StoreFrame screen="Layouts" active="store-layouts" page="Layouts"
      after={<Sheet open={pick} title="Add a layout for…" onClose={() => setPick(false)}>
        <div className="ly-kinds">{KINDS.map((k) => <button key={k.kind} type="button" onClick={() => { setPick(false); add(k.kind); }}><Icon name={k.icon} width="16" height="16" aria-hidden="true" /><span>{k.label}</span></button>)}</div>
      </Sheet>}>
      <style dangerouslySetInnerHTML={{ __html: SFB_CSS + '.ly-kinds{display:flex;flex-direction:column;gap:var(--space-2)}.ly-kinds button{display:flex;align-items:center;gap:var(--space-3);min-height:44px;padding:0 var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);color:var(--text-heading);font:inherit;font-size:var(--text-sm);text-align:left;cursor:pointer}.ly-kinds button:hover{border-color:var(--primary)}' }} />
      <ShopHeader icon="layout-dashboard" title="Layouts"
        about="Each kind of page in your store is built from sections: the home page, product and category pages, store pages, the cart, search and page not found. A layout can be for every page of its kind, one category, one product or one page."
        more={[{ label: 'HTML blocks', href: '/html-blocks' }, { label: 'Header builder', href: '/header-builder' }]}
        primary={{ label: 'Add layout', onClick: () => setPick(true) }} />
      <LockNote text={locked ? locked + ' You can still change what each section shows.' : ''} />
      <section className="ix-card" aria-label="Layouts">
        <div className="ix-bar"><IndexTabs tabs={tabs} label="Page kind" /></div>
        {!ready ? <div style={{ minHeight: 240 }} aria-busy="true" /> : !shown.length ? (
          <div className="ix-empty"><EmptyState icon="layout-dashboard" title="No layout for this kind yet" body="The built-in layout shows until you add one." actionLabel="Add layout" onAction={() => add(tab === 'all' ? 'home' : tab)} /></div>
        ) : (<>
          <ul className="ix-plist" aria-label="Layouts">
            {shown.map((l) => <li key={l.id}><Link href={edit(l)} className="ix-pitem"><span className="ix-pitem__top"><b>{l.name}</b><DocBadge doc={l.doc} /></span><span className="ix-pitem__mid">{kindBy(l.kind).label} · {condText(L(l).cond, names)} · {(L(l).sections || []).length} sections</span></Link></li>)}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table">
              <caption className="sr-only">{`Layouts, ${shown.length} shown`}</caption>
              <thead><tr><th scope="col">Layout</th><th scope="col">Page</th><th scope="col">Shows on</th><th scope="col">Header</th><th scope="col">Status</th><th scope="col">Last edited</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {shown.map((l) => (
                  <tr key={l.id} onClick={(e) => { if (!e.target.closest('a,button')) navigate(edit(l)); }}>
                    <td><Link href={edit(l)} className="ix-strong">{l.name}</Link><div className="sfb-muted">{(L(l).sections || []).length} sections</div></td>
                    <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name={kindBy(l.kind).icon} width="16" height="16" aria-hidden="true" />{kindBy(l.kind).label}</span></td>
                    <td>{condText(L(l).cond, names)}</td>
                    <td className="ix-muted">{L(l).header ? headers[L(l).header] || 'Default' : 'Default'}</td>
                    <td><DocBadge doc={l.doc} /></td>
                    <td className="ix-muted">{when(l.updatedAt)}</td>
                    <td style={{ textAlign: 'right' }}><Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" items={[{ label: 'Edit', href: edit(l) }, { label: 'Duplicate', onClick: () => dup(l) }, { label: 'Delete', onClick: () => remove(l), tone: 'danger' }]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>)}
        <div className="ix-foot"><span>{shown.length === 1 ? '1 layout' : shown.length + ' layouts'}</span></div>
      </section>
    </StoreFrame>
  );
}
