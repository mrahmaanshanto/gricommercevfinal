'use client';
// Theme — Online Store › Theme (/theme): the store's look (Module A · A1 + A6).
//   Header     Customize (the theme editor) as the main action; View store; More: Header builder, Layouts, HTML blocks
//   Your look  a live preview of the store's home page, the preset it came from, published / unpublished changes
//   Presets    Signal (electronics), Nokshi (fashion), Counter (grocery and retail) — preview each live with the shop's
//              own products (desktop / phone), import with "choose what to import" and "what will be replaced"; a restore
//              point is made first; products, customers and orders are never touched. Offered per the super admin's
//              theme packages (lib/storefront/access.js › presetOffer).
//   Restore points   the look before each import or publish; Go back undoes in one click (and can itself be undone)
// Front end only: lib/storefront/*.

import React, { useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, StatusBadge, EmptyState } from '@/components/ui';
import { ShopHeader } from '@/components/ui/IndexKit';
import { restoreTo, makeRestorePoint, isDirty } from '@/lib/storefront/store';
import { PRESETS, PARTS, presetBy, whatWillChange, importPreset } from '@/lib/storefront/presets';
import { presetOffer, editing, SWITCHES } from '@/lib/storefront/access';
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
.th-pre__body{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3) var(--space-4) var(--space-4);flex:1}
.th-pre__body b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);display:flex;align-items:center;gap:var(--space-2)}
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
@media (max-width:1023px){.th-look{grid-template-columns:minmax(0,1fr)}.th-presets{grid-template-columns:minmax(0,1fr)}}
`;

const KIND = { import: 'Import', publish: 'Publish', undo: 'Before going back', manual: 'Saved by you' };

function ImportSheet({ id, onClose }) {
  const p = presetBy(id);
  const [parts, setParts] = useState({ theme: true, header: true, layouts: true, blocks: true, menus: false, pages: false });
  const changes = whatWillChange(id, parts);
  const go = async () => {
    if (!PARTS.some((x) => parts[x.key])) { toast('Choose at least one part to import.', { tone: 'error' }); return; }
    if (!(await confirmDialog({ title: `Import ${p.name}?`, body: 'The parts you chose are replaced. A restore point is made first, so you can go back in one click.', confirmLabel: 'Import' }))) return;
    const r = importPreset(id, parts);
    if (!r.ok) { toast(r.error, { tone: 'error' }); return; }
    toast(`${p.name} imported: ${r.parts.join(', ').toLowerCase()}`, { undo: () => { if (r.point) { restoreTo(r.point.id); toast('Import undone'); } } });
    onClose();
  };
  return (
    <Sheet open title={`Import ${p.name}`} onClose={onClose}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={go}>Import</button></>}>
      <div className="sfb-fields">
        <fieldset className="th-parts">
          <legend className="gc-label">What to import</legend>
          {PARTS.map((x) => <label key={x.key}><input type="checkbox" className="gc-check" checked={!!parts[x.key]} onChange={(e) => setParts((s) => ({ ...s, [x.key]: e.target.checked }))} /><span>{x.label}<small>{x.hint}</small></span></label>)}
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

function PreviewSheet({ id, onClose, onImport, allowed }) {
  const p = presetBy(id);
  const [device, setDevice] = useState('desktop');
  const [page, setPage] = useState('/store');
  const src = page + (page.includes('?') ? '&' : '?') + 'preview=1&preset=' + id;
  return (
    <Sheet open title={`${p.name} · preview`} onClose={onClose}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Close</button>{allowed ? <button type="button" className="gc-btn gc-btn--solid" onClick={() => { onClose(); onImport(id); }}>Import {p.name}</button> : null}</>}>
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
      <PreviewFrame src={src} device={device} height={560} title={`${p.name} preview`} />
      <p className="sfb-muted" style={{ marginTop: 8 }}>Your own products, categories and menus, in {p.name}’s look. Nothing changes until you import it.</p>
    </Sheet>
  );
}

export default function Theme() {
  const { ready, d } = useSf();
  const [sheet, setSheet] = useState(null);   // { kind: 'import' | 'preview', id }
  const [device, setDevice] = useState('desktop');
  const cur = d ? presetBy(d.preset) : null;
  const locked = ready ? SWITCHES.filter(([k]) => k !== 'code' && editing()[k] === false).map(([, l]) => l) : [];
  const points = (d && d.restore) || [];
  const dirty = d ? isDirty(d.theme) || (d.headers || []).some((h) => isDirty(h.doc)) || (d.layouts || []).some((l) => l.doc.live && isDirty(l.doc)) : false;

  const goBack = async (pt) => {
    if (!(await confirmDialog({ title: `Go back to “${pt.label}”?`, body: pt.snap && pt.snap.content ? 'The look, menus and store pages go back to how they were then. A restore point of now is made first.' : 'The look goes back to how it was then. A restore point of now is made first.', confirmLabel: 'Go back' }))) return;
    restoreTo(pt.id);
    toast('Your store’s look is back to ' + when(pt.at));
  };
  const save = () => { makeRestorePoint('Saved by you'); toast('Restore point made'); };

  return (
    <StoreFrame screen="Theme" active="store-theme" page="Theme" css={CSS}
      after={<>
        {sheet && sheet.kind === 'import' ? <ImportSheet id={sheet.id} onClose={() => setSheet(null)} /> : null}
        {sheet && sheet.kind === 'preview' ? <PreviewSheet id={sheet.id} allowed={presetOffer(sheet.id).ok} onClose={() => setSheet(null)} onImport={(id) => setSheet({ kind: 'import', id })} /> : null}
      </>}>
      <ShopHeader icon="paintbrush" title="Theme"
        about="How your online store looks. Customize changes colours, fonts and page options; presets give you a finished look in one click. Customers see a change only after you publish it."
        secondary={[{ label: 'View store', icon: 'external-link', onClick: () => window.open('/store', '_blank', 'noopener') }, { label: 'All sections', icon: 'layout-list', onClick: () => window.open('/store-showcase', '_blank', 'noopener') }]}
        more={[{ label: 'Header builder', href: '/header-builder' }, { label: 'Layouts', href: '/layouts' }, { label: 'HTML blocks', href: '/html-blocks' }, { label: 'Menus', href: '/store-menus' }]}
        primary={{ label: 'Customize', icon: 'sliders-horizontal', href: '/theme-editor' }} />

      <section className="ix-card" aria-labelledby="th-cur">
        <div className="ix-card__head"><h2 id="th-cur">Your store</h2><DeviceSwitch device={device} onChange={setDevice} /></div>
        {!ready ? <div style={{ minHeight: 320 }} aria-busy="true" /> : (
          <div className="th-look">
            <PreviewFrame src="/store" device={device} height={380} title="Your store’s home page" />
            <div>
              <dl>
                <dt>Look</dt><dd>{cur.name} · {cur.label}</dd>
                <dt>Status</dt><dd>{dirty ? <StatusBadge tone="warning">Unpublished changes</StatusBadge> : <DocBadge doc={d.theme} />}</dd>
                <dt>Published</dt><dd>{when(d.theme.liveAt)}</dd>
                <dt>Headers</dt><dd>{(d.headers || []).length}</dd>
                <dt>Layouts</dt><dd>{(d.layouts || []).length}</dd>
              </dl>
              {locked.length ? <p className="sfb-lock" style={{ marginTop: 'var(--space-3)' }}><Icon name="lock" width="14" height="14" aria-hidden="true" /><span>Fixed by GridCommerce for your theme: {locked.join(', ')}.</span></p> : null}
              <div className="th-buttons">
                <a className="ix-btn ix-btn--primary" href="/theme-editor">Customize</a>
                <a className="ix-btn" href="/header-builder">Header</a>
                <a className="ix-btn" href="/layouts">Layouts</a>
                <a className="ix-btn" href="/store-showcase" target="_blank" rel="noopener noreferrer">All sections</a>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="ix-card" aria-labelledby="th-pre">
        <div className="ix-card__head"><h2 id="th-pre">Presets</h2></div>
        <div className="th-presets">
          {PRESETS.map((p) => {
            const off = ready ? presetOffer(p.id) : { ok: true, why: '' };
            const isCur = d && d.preset === p.id;
            return (
              <article key={p.id} className={'th-pre' + (isCur ? ' is-cur' : '')}>
                {p.pack ? <span className="th-logo" style={{ background: `color-mix(in srgb, ${p.accent} 8%, var(--surface-card))` }}><img src={p.logo} alt={p.name + ' logo'} loading="lazy" /></span> : <img src={p.image} alt="" loading="lazy" />}
                <div className="th-pre__body">
                  <b><span className="th-dot" style={{ background: p.accent }} aria-hidden="true" />{p.name}{isCur ? <StatusBadge tone="success">In use</StatusBadge> : null}</b>
                  <p>{p.label} · {p.tagline}</p>
                  {off.why ? <p style={{ color: off.ok ? 'var(--text-muted)' : 'var(--text-warning)' }}>{off.why}</p> : null}
                  <div className="th-pre__acts">
                    <button type="button" className="ix-btn ix-btn--sm" onClick={() => setSheet({ kind: 'preview', id: p.id })}><Icon name="eye" width="16" height="16" aria-hidden="true" />Preview</button>
                    <button type="button" className="ix-btn ix-btn--sm" disabled={!off.ok} onClick={() => setSheet({ kind: 'import', id: p.id })}>Import</button>
                  </div>
                </div>
              </article>
            );
          })}
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
