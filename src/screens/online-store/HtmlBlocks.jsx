'use client';
// HTML blocks — Online Store › HTML blocks (/html-blocks), Module A · A3: reusable content made with the page editor's
// blocks, placed in headers, layouts, mega menus, the footer and the product page's extra tab.
//   Type views with counts (All · Content · Banner · Mega menu column · Footer · Product page tab · Category text),
//   search by name. Each row: name, type, where it is used, last edited; "…": Edit, Duplicate, Delete (warns where it is
//   used: those places show nothing there afterwards). Add block opens the editor (/html-block-edit).
// Front end only: lib/storefront/blocks.js.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { EmptyState, StatusBadge } from '@/components/ui';
import { ShopHeader, IndexTabs, SearchField, Menu } from '@/components/ui/IndexKit';
import { BLOCK_KINDS, kindOf, usedIn, duplicateBlock, deleteBlock } from '@/lib/storefront/blocks';
import { StoreFrame } from './storeShared';
import { useSf, when, SFB_CSS } from './sfShared';

const CSS = SFB_CSS + `
.hbk-name{display:flex;align-items:center;gap:var(--space-3);min-width:0}
.hbk-ico{display:grid;place-items:center;width:32px;height:32px;flex:none;border-radius:var(--radius-md);background:var(--surface-subtle);color:var(--text-muted)}
.hbk-used{font-size:var(--text-xs);color:var(--text-muted);max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
`;

export default function HtmlBlocks() {
  const { ready, d } = useSf();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [find, setFind] = useState(false);
  const blocks = useMemo(() => (d ? (d.blocks || []).slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)) : []), [d]);
  const uses = useMemo(() => Object.fromEntries(blocks.map((b) => [b.id, usedIn(b.id)])), [blocks]);
  const base = blocks.filter((b) => !q.trim() || b.name.toLowerCase().includes(q.trim().toLowerCase()));
  const shown = base.filter((b) => tab === 'all' || b.type === tab);
  const tabs = [{ key: 'all', id: 'hbk-all', label: 'All', count: ready ? base.length : null, on: tab === 'all', onClick: () => setTab('all') },
    ...BLOCK_KINDS.map((k) => ({ key: k.type, id: 'hbk-' + k.type, label: k.label, count: ready ? base.filter((b) => b.type === k.type).length : null, on: tab === k.type, onClick: () => setTab(k.type) }))];

  const remove = async (b) => {
    const u = uses[b.id] || [];
    if (!(await confirmDialog({ title: `Delete “${b.name}”?`, body: u.length ? `It is used in ${u.map((x) => x.where).join(', ')}. Those places show nothing there after this.` : 'It is not used anywhere. It is removed for good.', confirmLabel: 'Delete', tone: 'danger' }))) return;
    deleteBlock(b.id);
    toast(`${b.name} deleted`);
  };
  const dup = (b) => { const c = duplicateBlock(b.id); if (c) { toast(`${c.name} made`); navigate('/html-block-edit?id=' + c.id); } };
  const edit = (b) => '/html-block-edit?id=' + b.id;

  return (
    <StoreFrame screen="HtmlBlocks" active="store-blocks" page="HTML blocks" css={CSS}>
      <ShopHeader icon="blocks" title="HTML blocks"
        about="Reusable content for your store: delivery info, a size guide, a banner, a footer. Make it once and place it in headers, layouts, mega menus, the footer or the product page's extra tab."
        more={[{ label: 'Layouts', href: '/layouts' }, { label: 'Header builder', href: '/header-builder' }]}
        primary={{ label: 'Add block', href: '/html-block-edit?type=' + (tab === 'all' ? 'content' : tab) }} />
      <section className="ix-card" aria-label="HTML blocks">
        <div className="ix-bar">
          {find ? (<>
            <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search blocks" onDone={() => { setFind(false); setQ(''); }} autoFocus />
            <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setFind(false); setQ(''); }}>Cancel</button>
          </>) : (<>
            <IndexTabs tabs={tabs} label="Block type" />
            <span className="ix-tools"><button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search blocks" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button></span>
          </>)}
        </div>
        {!ready ? <div style={{ minHeight: 240 }} aria-busy="true" /> : !shown.length ? (
          <div className="ix-empty"><EmptyState icon="blocks" title={blocks.length ? 'No blocks match' : 'No blocks yet'} body={blocks.length ? 'Try another type or search.' : 'Start with your delivery info.'} actionLabel={blocks.length ? 'Show all' : 'Add block'} onAction={() => { if (blocks.length) { setTab('all'); setQ(''); setFind(false); } else navigate('/html-block-edit?type=content'); }} /></div>
        ) : (<>
          <ul className="ix-plist" aria-label="Blocks">
            {shown.map((b) => <li key={b.id}><Link href={edit(b)} className="ix-pitem"><span className="ix-pitem__top"><b>{b.name}</b><StatusBadge tone="neutral">{kindOf(b.type).label}</StatusBadge></span><span className="ix-pitem__mid">{(uses[b.id] || []).length ? 'Used in ' + uses[b.id].length : 'Not used'} · {when(b.updatedAt)}</span></Link></li>)}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table">
              <caption className="sr-only">{`HTML blocks, ${shown.length} shown`}</caption>
              <thead><tr><th scope="col">Block</th><th scope="col">Type</th><th scope="col">Used in</th><th scope="col">Last edited</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {shown.map((b) => {
                  const u = uses[b.id] || [];
                  return (
                    <tr key={b.id} onClick={(e) => { if (!e.target.closest('a,button')) navigate(edit(b)); }}>
                      <td><span className="hbk-name"><span className="hbk-ico" aria-hidden="true"><Icon name={kindOf(b.type).icon} width="16" height="16" /></span><Link href={edit(b)} className="ix-strong">{b.name}</Link></span></td>
                      <td>{kindOf(b.type).label}</td>
                      <td><span className="hbk-used" title={u.map((x) => x.where).join(', ')}>{u.length ? u.map((x) => x.where).join(', ') : 'Not used'}</span></td>
                      <td className="ix-muted">{when(b.updatedAt)}</td>
                      <td style={{ textAlign: 'right' }}><Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" items={[{ label: 'Edit', href: edit(b) }, { label: 'Duplicate', onClick: () => dup(b) }, { label: 'Delete', onClick: () => remove(b), tone: 'danger' }]} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>)}
        <div className="ix-foot"><span>{shown.length === 1 ? '1 block' : shown.length + ' blocks'}</span></div>
      </section>
    </StoreFrame>
  );
}
