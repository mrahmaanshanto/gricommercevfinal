'use client';
// Edit HTML block — Online Store › HTML blocks › a block (/html-block-edit?id= · ?type= for a new one), Module A · A3.
//   Main   name; content with the page editor's blocks (paragraphs, headings, lists, images, product card, button,
//          table, FAQ, video …) and an Edit / Preview switch
//   Side   type (where it fits); Used in (headers, layouts, mega menus, the footer, the product tab — each opens there)
//   Header Save; More: Duplicate, Delete (warns where it is used)
// Front end only: lib/storefront/blocks.js; blocks from lib/blog.js.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { EmptyState } from '@/components/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import { getCatalog } from '@/lib/stock';
import { newBlock, cloneBlock, BLOCK_TYPES } from '@/lib/blog';
import { getBlock, newHtmlBlock, saveBlock, duplicateBlock, deleteBlock, usedIn, BLOCK_KINDS, kindOf } from '@/lib/storefront/blocks';
import { BLOG_CSS, BlockView } from '@/screens/integrations/blogShared';
import { BLOCK_EDITOR_CSS, BlockEditor, AddMenu } from '@/screens/integrations/BlogEditor';
import { StoreFrame, queryParam } from './storeShared';
import { useSf, when, SFB_CSS } from './sfShared';

const clone = (x) => JSON.parse(JSON.stringify(x));
const CSS = SFB_CSS + `
.hbe-card{display:flex;flex-direction:column;gap:var(--space-3)}
.hbe-pv{padding:var(--space-5) var(--space-4)}
.hbe-uses{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:var(--space-2);font-size:var(--text-sm)}
`;

export default function HtmlBlockEdit() {
  const { ready } = useSf();
  const router = useRouter();
  const [b, setB] = useState(null);
  const [isNew, setIsNew] = useState(true);
  const [base, setBase] = useState('');
  const [missing, setMissing] = useState(false);
  const [mode, setMode] = useState('edit');
  const [menuAt, setMenuAt] = useState(null);
  const [catalog, setCatalog] = useState([]);

  useEffect(() => {
    if (!ready || b || missing) return;
    setCatalog(getCatalog());
    const id = queryParam('id');
    if (id) { const x = getBlock(id); if (!x) { setMissing(true); return; } setB(clone(x)); setIsNew(false); setBase(JSON.stringify(x)); return; }
    const t = queryParam('type');
    const n = newHtmlBlock(BLOCK_KINDS.some((k) => k.type === t) ? t : 'content');
    setB(n); setIsNew(true); setBase(JSON.stringify(n));
  }, [ready, b, missing]);

  const dirty = !!b && JSON.stringify(b) !== base;
  useEffect(() => {
    const on = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', on);
    return () => window.removeEventListener('beforeunload', on);
  }, [dirty]);

  if (missing) {
    return <StoreFrame screen="HtmlBlockEdit" active="store-blocks" page="HTML block" narrow><RecordHeader back="/html-blocks" backLabel="HTML blocks" title="HTML block" /><section className="ix-card"><EmptyState icon="blocks" title="This block no longer exists" actionLabel="All blocks" onAction={() => router.push('/html-blocks')} /></section></StoreFrame>;
  }
  const set = (patch) => setB((x) => ({ ...x, ...patch }));
  const setBlock = (id, patch) => setB((x) => ({ ...x, blocks: x.blocks.map((k) => (k.id === id ? { ...k, ...patch } : k)) }));
  const insertBlock = (at, type) => { const k = newBlock(type); setB((x) => { const l = x.blocks.slice(); l.splice(at, 0, k); return { ...x, blocks: l }; }); setMenuAt(null); };
  const moveBlock = (id, dir) => setB((x) => { const i = x.blocks.findIndex((k) => k.id === id); const j = i + dir; if (i < 0 || j < 0 || j >= x.blocks.length) return x; const l = x.blocks.slice(); [l[i], l[j]] = [l[j], l[i]]; return { ...x, blocks: l }; });
  const dupBlock = (id) => setB((x) => { const i = x.blocks.findIndex((k) => k.id === id); const l = x.blocks.slice(); l.splice(i + 1, 0, cloneBlock(x.blocks[i])); return { ...x, blocks: l }; });
  const delBlock = (id) => { const i = b.blocks.findIndex((k) => k.id === id); const gone = b.blocks[i]; setB((x) => ({ ...x, blocks: x.blocks.filter((k) => k.id !== id) })); toast(`${(BLOCK_TYPES.find((t) => t.type === gone.type) || { label: 'Block' }).label} deleted`, { undo: () => setB((x) => { const l = x.blocks.slice(); l.splice(i, 0, gone); return { ...x, blocks: l }; }) }); };

  const save = () => {
    if (!String(b.name || '').trim()) { toast('Give the block a name.', { tone: 'error' }); const el = document.getElementById('hbe-name'); if (el) el.focus(); return; }
    const s = saveBlock(b);
    setB(clone(s)); setBase(JSON.stringify(s));
    if (isNew) { setIsNew(false); try { window.history.replaceState(window.history.state, '', '/html-block-edit?id=' + s.id); } catch { /* ignore */ } }
    toast(`${s.name} saved${usedIn(s.id).length ? ' · it shows wherever it is used' : ''}`);
  };
  const remove = async () => {
    if (isNew) { router.push('/html-blocks'); return; }
    const u = usedIn(b.id);
    if (!(await confirmDialog({ title: `Delete “${b.name}”?`, body: u.length ? `It is used in ${u.map((x) => x.where).join(', ')}. Those places show nothing there after this.` : 'It is not used anywhere. It is removed for good.', confirmLabel: 'Delete', tone: 'danger' }))) return;
    deleteBlock(b.id); setBase(JSON.stringify(b)); toast('Block deleted'); router.push('/html-blocks');
  };
  const dup = () => { const c = duplicateBlock(b.id); if (c) { setB(clone(c)); setBase(JSON.stringify(c)); try { window.history.replaceState(window.history.state, '', '/html-block-edit?id=' + c.id); } catch { /* ignore */ } toast(`${c.name} made`); } };
  const uses = b && !isNew ? usedIn(b.id) : [];
  const insertRow = (at) => (menuAt === at ? <AddMenu key={'m' + at} onPick={(t) => insertBlock(at, t)} onClose={() => setMenuAt(null)} />
    : <div key={'i' + at} className="be-ins"><button type="button" className="be-plus" aria-label={at === 0 ? 'Add a block at the start' : `Add a block after block ${at}`} title="Add a block" onClick={() => setMenuAt(at)}><Icon name="plus" width="16" height="16" /></button></div>);

  return (
    <StoreFrame screen="HtmlBlockEdit" active="store-blocks" page={isNew ? 'Add block' : 'Edit block'} css={BLOG_CSS + BLOCK_EDITOR_CSS + CSS} narrow>
      {!b ? <div style={{ minHeight: 320 }} aria-busy="true" /> : (<>
        <RecordHeader back="/html-blocks" backLabel="HTML blocks" title={b.name || (isNew ? 'Add block' : 'Untitled block')}
          meta={<>{kindOf(b.type).label}{dirty ? ' · Unsaved changes' : isNew ? ' · not saved yet' : ' · edited ' + when(b.updatedAt)}</>}
          about="A reusable piece of content. Build it from blocks; it shows wherever you place it."
          more={[!isNew ? { label: 'Duplicate', onClick: dup } : null, { label: isNew ? 'Discard' : 'Delete', onClick: remove, tone: 'danger' }].filter(Boolean)}
          primary={{ label: 'Save', icon: 'check', onClick: save }} />
        <div className="ix-record">
          <div className="ix-main">
            <section className="ix-card ix-card--pad hbe-card" aria-label="Name">
              <div><label className="gc-label" htmlFor="hbe-name">Name *</label><input id="hbe-name" className="gc-input" value={b.name} placeholder="e.g. Delivery info" onChange={(e) => set({ name: e.target.value })} data-autofocus /></div>
            </section>
            <section className="ix-card ix-card--pad hbe-card" aria-label="Content">
              <div className="be-chead">
                <h2>Content</h2>
                <div className="gc-seg" role="group" aria-label="Edit or preview" style={{ marginLeft: 'auto' }}>
                  <button type="button" className={'gc-seg__btn' + (mode === 'edit' ? ' gc-seg__btn--active' : '')} aria-pressed={mode === 'edit'} onClick={() => setMode('edit')}>Edit</button>
                  <button type="button" className={'gc-seg__btn' + (mode === 'preview' ? ' gc-seg__btn--active' : '')} aria-pressed={mode === 'preview'} onClick={() => setMode('preview')}>Preview</button>
                </div>
              </div>
              {mode === 'preview' ? (
                <div className="hbe-pv"><article className="bl-article" data-preview="">{b.blocks.map((k) => <BlockView key={k.id} block={k} catalog={catalog} />)}</article></div>
              ) : (<>
                <div className="be-blocks">
                  {insertRow(0)}
                  {b.blocks.map((k, i) => (
                    <React.Fragment key={k.id}>
                      <BlockEditor b={k} i={i} count={b.blocks.length} catalog={catalog} onChange={(patch) => setBlock(k.id, patch)} onMove={(dir) => moveBlock(k.id, dir)} onDup={() => dupBlock(k.id)} onDel={() => delBlock(k.id)} />
                      {insertRow(i + 1)}
                    </React.Fragment>
                  ))}
                </div>
                {!b.blocks.length ? <EmptyState icon="pilcrow" title="No content yet" body="Add a paragraph, a picture or a button." actionLabel="Add a paragraph" onAction={() => insertBlock(0, 'p')} /> : null}
              </>)}
            </section>
          </div>
          <aside className="ix-side">
            <section className="ix-card ix-card--pad hbe-card" aria-label="Type">
              <label className="gc-label" htmlFor="hbe-type">Type</label>
              <select id="hbe-type" className="gc-input gc-select" value={b.type} onChange={(e) => set({ type: e.target.value })}>{BLOCK_KINDS.map((k) => <option key={k.type} value={k.type}>{k.label}</option>)}</select>
              <p className="sfb-muted">{kindOf(b.type).hint}</p>
            </section>
            <section className="ix-card ix-card--pad hbe-card" aria-label="Used in">
              <h2 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>Used in</h2>
              {uses.length ? <ul className="hbe-uses">{uses.map((u) => <li key={u.where}><Link href={u.href} className="bl-link">{u.where}</Link></li>)}</ul> : <p className="sfb-muted">Not used yet. Place it in a layout, the header builder, a mega menu or the theme’s footer.</p>}
            </section>
          </aside>
        </div>
      </>)}
    </StoreFrame>
  );
}
