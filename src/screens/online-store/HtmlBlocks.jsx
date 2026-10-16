'use client';
// HTML blocks — Online Store › HTML blocks (/html-blocks), Module A · A3: reusable content made with the page editor's
// blocks, placed in headers, layouts, mega menus, the footer and the product page's extra tab — and pushed to many spots
// at once (Placements, ?view=placements, Batch A step 3; Custom sections, ?view=custom, step 6: CustomSections.jsx: above / under the header, Home, before the footer, product and
// category pages, cart, checkout, thank-you; pages, categories, products, devices, dates, order).
//   Type views with counts (All · Content · Banner · Mega menu column · Footer · Product page tab · Category text),
//   search by name. Each row: name, type, where it is used, last edited; "…": Edit, Duplicate, Delete (warns where it is
//   used: those places show nothing there afterwards). Add block opens the editor (/html-block-edit).
// Front end only: lib/storefront/blocks.js.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { EmptyState, StatusBadge } from '@/components/ui';
import { ShopHeader, IndexTabs, SearchField, Menu } from '@/components/ui/IndexKit';
import { BLOCK_KINDS, kindOf, usedIn, duplicateBlock, deleteBlock, getBlock } from '@/lib/storefront/blocks';
import { getPlacements, savePlacement, deletePlacement, placeBlock, newPlacement, placementState } from '@/lib/storefront/placements';
import { STATE } from '@/lib/storefront/notices';
import { spotBy } from '@/lib/storefront/schema';
import { showText } from '@/lib/storefront/show';
import { dhakaText } from '@/lib/seo';
import { clockNow } from '@/lib/settlements';
import { StoreFrame, queryParam } from './storeShared';
import { useSf, when, SFB_CSS } from './sfShared';
import { PlacementSheet, PLACEMENT_CSS } from './PlacementSheet';
import { CustomList, CustomSheet, CUSTOM_CSS } from './CustomSections';
import { newCustom, getCustoms, codeLock } from '@/lib/storefront/customs';

const CSS = SFB_CSS + PLACEMENT_CSS + CUSTOM_CSS + `
.hbk-name{display:flex;align-items:center;gap:var(--space-3);min-width:0}
.hbk-ico{display:grid;place-items:center;width:32px;height:32px;flex:none;border-radius:var(--radius-md);background:var(--surface-subtle);color:var(--text-muted)}
.hbk-used{font-size:var(--text-xs);color:var(--text-muted);max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
`;

const whenText = (p) => (p.start || p.end ? [p.start ? 'From ' + dhakaText(p.start) : '', p.end ? 'until ' + dhakaText(p.end) : ''].filter(Boolean).join(' ') : 'Always');

export default function HtmlBlocks() {
  const { ready, d } = useSf();
  const [view, setView] = useState('blocks');
  const [pdraft, setPdraft] = useState(null);   // { isNew, value }
  const [now, setNow] = useState(0);
  const [cedit, setCedit] = useState(null);   // the custom section open in the editor
  useEffect(() => { setNow(clockNow()); const v = queryParam('view'); if (v === 'placements' || v === 'custom') setView(v); }, []);
  const go = (v) => { setView(v); try { window.history.replaceState(window.history.state, '', v === 'blocks' ? '/html-blocks' : '/html-blocks?view=' + v); } catch { /* ignore */ } };
  const customs = useMemo(() => (ready ? getCustoms() : []), [ready, d]);
  const canCode = ready && !codeLock();
  const placements = useMemo(() => (ready ? getPlacements() : []), [ready, d]);
  const savePl = () => {
    const x = pdraft.value;
    if (pdraft.isNew) { const made = placeBlock(x.block, x.spots, { show: x.show, start: x.start, end: x.end, order: x.order }); toast(made.length === 1 ? 'Block placed' : `Block placed in ${made.length} spots`); }
    else { savePlacement(x); toast('Placement saved'); }
    setPdraft(null);
  };
  const removePl = async (p) => {
    if (!(await confirmDialog({ title: 'Remove this placement?', body: `${(getBlock(p.block) || {}).name || 'The block'} stops showing at ${(spotBy(p.spot) || {}).label || p.spot}. The block itself stays.`, confirmLabel: 'Remove', tone: 'danger' }))) return;
    deletePlacement(p.id); toast('Placement removed');
  };
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

  const placeNew = (block = '') => setPdraft({ isNew: true, value: { ...newPlacement({ block }), spots: [] } });
  return (
    <StoreFrame screen="HtmlBlocks" active="store-blocks" page="HTML blocks" css={CSS}
      after={<>
        <PlacementSheet open={!!pdraft} draft={pdraft && pdraft.value} setDraft={(v) => setPdraft((x) => ({ ...x, value: v }))} onSave={savePl} onClose={() => setPdraft(null)} isNew={!!(pdraft && pdraft.isNew)} />
        {cedit ? <CustomSheet key={cedit.id} def={cedit} onClose={() => setCedit(null)} onSaved={() => setCedit(null)} /> : null}
      </>}>
      <ShopHeader icon="blocks" title="HTML blocks"
        about="Reusable content for your store: delivery info, a size guide, a banner, a footer. Make it once and place it in headers, layouts, mega menus, the footer or the product page's extra tab — or push it to many spots at once from Placements, for chosen pages, devices and dates."
        more={[{ label: 'Layouts', href: '/layouts' }, { label: 'Header builder', href: '/header-builder' }, view === 'placements' ? { label: 'Add block', href: '/html-block-edit?type=content' } : { label: 'Place a block', onClick: () => placeNew() }]}
        primary={view === 'placements' ? { label: 'Place a block', onClick: () => placeNew() } : view === 'custom' ? (canCode ? { label: 'New custom section', onClick: () => setCedit(newCustom()) } : { label: 'Ask for a custom section', href: '/service-detail?id=store-design' }) : { label: 'Add block', href: '/html-block-edit?type=' + (tab === 'all' ? 'content' : tab) }} />
      <div className="gc-seg" role="group" aria-label="Show" style={{ alignSelf: 'flex-start' }}>
        <button type="button" className={'gc-seg__btn' + (view === 'blocks' ? ' gc-seg__btn--active' : '')} aria-pressed={view === 'blocks'} onClick={() => go('blocks')}>Blocks{ready ? ' · ' + blocks.length : ''}</button>
        <button type="button" className={'gc-seg__btn' + (view === 'placements' ? ' gc-seg__btn--active' : '')} aria-pressed={view === 'placements'} onClick={() => go('placements')}>Placements{ready ? ' · ' + placements.length : ''}</button>
        <button type="button" className={'gc-seg__btn' + (view === 'custom' ? ' gc-seg__btn--active' : '')} aria-pressed={view === 'custom'} onClick={() => go('custom')}>Custom sections{ready ? ' · ' + customs.length : ''}</button>
      </div>
      {view === 'custom' ? <CustomList ready={ready} d={d} onEdit={(c) => setCedit(c)} /> : view === 'placements' ? (
        <section className="ix-card" aria-label="Placements">
          {!ready ? <div style={{ minHeight: 200 }} aria-busy="true" /> : !placements.length ? (
            <div className="ix-empty"><EmptyState icon="blocks" title="No block is placed yet" body="Push a block to many spots at once: under the header, on product pages, at checkout." actionLabel="Place a block" onAction={() => placeNew()} /></div>
          ) : (<>
            <ul className="ix-plist" aria-label="Placements">
              {placements.map((p) => { const st = STATE[placementState(p, now || Date.now())]; return <li key={p.id}><button type="button" className="ix-pitem" onClick={() => setPdraft({ isNew: false, value: JSON.parse(JSON.stringify(p)) })}><span className="ix-pitem__top"><b>{(getBlock(p.block) || {}).name || 'Deleted block'}</b><StatusBadge tone={st.tone}>{st.label}</StatusBadge></span><span className="ix-pitem__mid">{(spotBy(p.spot) || {}).label || p.spot} · {whenText(p)}</span></button></li>; })}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table">
                <caption className="sr-only">{`Placements, ${placements.length}`}</caption>
                <thead><tr><th scope="col">Block</th><th scope="col">Where</th><th scope="col">Who sees it</th><th scope="col">When</th><th scope="col">Order</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {placements.map((p) => {
                    const st = STATE[placementState(p, now || Date.now())];
                    const blk = getBlock(p.block);
                    return (
                      <tr key={p.id} onClick={(e) => { if (!e.target.closest('a,button')) setPdraft({ isNew: false, value: JSON.parse(JSON.stringify(p)) }); }}>
                        <td>{blk ? <Link href={'/html-block-edit?id=' + blk.id} className="ix-strong">{blk.name}</Link> : <span className="ix-muted">Deleted block</span>}</td>
                        <td>{(spotBy(p.spot) || {}).label || p.spot}</td>
                        <td className="ix-muted">{showText(p.show)}</td>
                        <td className="ix-muted">{whenText(p)}</td>
                        <td className="ix-num">{p.order || 0}</td>
                        <td><StatusBadge tone={st.tone}>{st.label}</StatusBadge></td>
                        <td style={{ textAlign: 'right' }}><Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" items={[{ label: 'Edit', onClick: () => setPdraft({ isNew: false, value: JSON.parse(JSON.stringify(p)) }) }, { label: p.on ? 'Turn off' : 'Turn on', onClick: () => { savePlacement({ ...p, on: !p.on }); toast(p.on ? 'Placement turned off' : 'Placement turned on'); } }, { label: 'Remove', onClick: () => removePl(p), tone: 'danger' }]} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>)}
          <div className="ix-foot"><span>{placements.length === 1 ? '1 placement' : placements.length + ' placements'}</span></div>
        </section>
      ) : (
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
                      <td style={{ textAlign: 'right' }}><Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" items={[{ label: 'Edit', href: edit(b) }, { label: 'Place in the store', onClick: () => placeNew(b.id) }, { label: 'Duplicate', onClick: () => dup(b) }, { label: 'Delete', onClick: () => remove(b), tone: 'danger' }]} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>)}
        <div className="ix-foot"><span>{shown.length === 1 ? '1 block' : shown.length + ' blocks'}</span></div>
      </section>
      )}
    </StoreFrame>
  );
}
