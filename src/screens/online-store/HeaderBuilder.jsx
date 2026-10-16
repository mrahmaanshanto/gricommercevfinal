'use client';
// Header builder — Online Store › Header builder (/header-builder?id=), Module A · A2.
//   Header tabs   the saved headers (one is the default; a layout can pick another): add, duplicate, set default, delete
//   Desktop / Phone   built separately. 3 rows (Top bar · Main row · Bottom row) × 3 areas (Left · Centre · Right).
//                 Each row: on / off, height, colours, sticky. "+ Add" in an area opens the elements (logo, main menu,
//                 All categories, search with category picker, cart, account, wishlist, compare, language EN / বাং,
//                 hotline, WhatsApp, button, HTML block, social icons, short text, divider or space).
//   Element panel the picked element's settings; move it to another area or row, earlier / later, remove
//   Phone menu    what the ☰ drawer holds (and in which order) and the bottom navigation bar
//   Preview       the store with this header, computer or phone, as you edit
//   Save draft · Publish header (restore point first) · Discard changes
// Locked (read-only) when the store's theme doesn't allow header changes (Super admin › Storefront themes).

import React, { useEffect, useMemo, useState } from 'react';
import { ICONS } from '@/lib/storefront/layouts';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, StatusBadge, InfoTip } from '@/components/ui';
import { ShopHeader, IndexTabs } from '@/components/ui/IndexKit';
import { ELEMENTS, elementBy, newElement, ROWS, AREAS, ROW_TONES, DRAWER_ITEMS, NAV_ITEMS, HEADER_SWITCHES, getHeader, defaultHeaderId, saveHeaderDraft, publishHeader, discardHeader, addHeader, duplicateHeader, deleteHeader, setDefaultHeader, headerUses } from '@/lib/storefront/headers';
import { lockOf } from '@/lib/storefront/access';
import { StoreFrame, useStoreMenus, queryParam } from './storeShared';
import { useSf, PreviewFrame, LockNote, BlockPick, DocBadge, when, SFB_CSS } from './sfShared';

const clone = (x) => JSON.parse(JSON.stringify(x));

const CSS = SFB_CSS + `
.hb-top{display:flex;flex-wrap:wrap;align-items:flex-end;gap:var(--space-3);padding:var(--space-4)}
.hb-top>div:first-child{flex:1 1 240px}
.hb-rows{display:flex;flex-direction:column;gap:var(--space-3);padding:0 var(--space-4) var(--space-4)}
.hb-row{border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.hb-row.is-off .hb-areas{opacity:.45}
.hb-rowhead{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-4);padding:var(--space-2) var(--space-3);border-bottom:1px solid var(--border-subtle);font-size:var(--text-sm)}
.hb-rowhead b{font-weight:var(--weight-semibold);color:var(--text-heading);min-width:96px}
.hb-rowhead label{display:inline-flex;align-items:center;gap:6px;color:var(--text-body)}
.hb-rowhead input[type="number"]{width:80px}
.hb-rowhead select{width:auto;min-width:150px}
.hb-areas{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-2);padding:var(--space-2)}
.hb-area{display:flex;flex-direction:column;gap:6px;min-height:84px;padding:var(--space-2);border:1px dashed var(--border-strong);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.hb-area>small{font-size:var(--text-xs);color:var(--text-muted)}
.hb-chip{display:flex;align-items:center;gap:6px;min-height:36px;padding:0 var(--space-2);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);color:var(--text-heading);font:inherit;font-size:var(--text-sm);text-align:left;cursor:pointer}
.hb-chip.on{border-color:var(--primary);box-shadow:0 0 0 1px var(--primary)}
.hb-chip span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hb-add{display:inline-flex;align-items:center;justify-content:center;gap:4px;min-height:36px;border:0;border-radius:var(--radius-lg);background:none;color:var(--primary);font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);cursor:pointer}
.hb-pal{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2)}
.hb-pal button{display:flex;align-items:center;gap:var(--space-2);min-height:44px;padding:0 var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);color:var(--text-heading);font:inherit;font-size:var(--text-sm);text-align:left;cursor:pointer}
.hb-pal button:hover{border-color:var(--primary)}
.hb-moves{display:flex;flex-wrap:wrap;gap:var(--space-1)}
.hb-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px}
.hb-list li{display:flex;align-items:center;gap:var(--space-2);min-height:40px;font-size:var(--text-sm)}
.hb-list li label{flex:1;display:flex;align-items:center;gap:var(--space-2);cursor:pointer}
@media (max-width:767px){.hb-areas{grid-template-columns:minmax(0,1fr)}.hb-pal{grid-template-columns:minmax(0,1fr)}}
`;

function ElementPanel({ el, onChange, onMove, onRemove, menus, locked }) {
  const def = elementBy(el.type);
  const why = def && def.lock ? lockOf(def.lock) : '';
  const dis = !!locked || !!why;
  return (
    <div className="sfb-fields">
      <LockNote text={why} />
      {el.type === 'notice' ? <p className="sfb-muted">Shows the notices placed “Inside the header” in <a href="/store-notices">Store notices</a>. Nothing shows when there is none.</p> : null}
      {(def ? def.settings : []).map(([k, l, t, , ch]) => {
        const id = 'hb-' + el.id + '-' + k;
        if (t === 'bool') return <div key={k} className="sfb-row"><span id={id}>{l}</span><button type="button" role="switch" className="gc-switch" aria-checked={el[k] !== false && !!el[k]} aria-labelledby={id} disabled={dis} onClick={() => onChange({ [k]: !el[k] })}><span className="gc-switch__knob" /></button></div>;
        if (t === 'choice') return <div key={k} className="sfb-field"><label className="gc-label" htmlFor={id}>{l}</label><select id={id} className="gc-input gc-select" value={el[k] === true ? 'beside' : el[k] === false ? 'none' : el[k]} disabled={dis} onChange={(e) => onChange({ [k]: e.target.value })}>{ch.map(([v, x]) => <option key={v} value={v}>{x}</option>)}</select></div>;
        if (t === 'number') return <div key={k} className="sfb-field"><label className="gc-label" htmlFor={id}>{l}</label><input id={id} type="number" min={0} max={6} className="gc-input" value={Number(el[k]) || 0} disabled={dis} onChange={(e) => onChange({ [k]: Math.max(0, Math.min(6, Number(e.target.value) || 0)) })} /></div>;
        if (t === 'icon') return <div key={k} className="sfb-field"><label className="gc-label" htmlFor={id}>{l}</label><select id={id} className="gc-input gc-select" value={el[k] || ''} disabled={dis} onChange={(e) => onChange({ [k]: e.target.value })}><option value="">None</option>{ICONS.map((x) => <option key={x} value={x}>{x.replace(/-/g, ' ')}</option>)}</select></div>;
        if (t === 'menu') return <div key={k} className="sfb-field"><label className="gc-label" htmlFor={id}>{l}</label><select id={id} className="gc-input gc-select" value={el[k]} disabled={dis} onChange={(e) => onChange({ [k]: e.target.value })}>{menus.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>;
        if (t === 'block') return <div key={k} className="sfb-field"><label className="gc-label" htmlFor={id}>{l}</label><BlockPick id={id} value={el[k]} onChange={(x) => onChange({ [k]: x })} /></div>;
        return <div key={k} className="sfb-field"><label className="gc-label" htmlFor={id}>{l}</label><input id={id} className="gc-input" value={el[k] || ''} disabled={dis} placeholder={k === 'number' ? 'From Settings › General' : ''} onChange={(e) => onChange({ [k]: e.target.value })} /></div>;
      })}
      {!locked ? (
        <div className="sfb-field">
          <span className="gc-label">Move</span>
          <div className="hb-moves">
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => onMove('left')}><Icon name="arrow-left" width="16" height="16" aria-hidden="true" />Area</button>
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => onMove('right')}>Area<Icon name="arrow-right" width="16" height="16" aria-hidden="true" /></button>
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => onMove('up')}><Icon name="arrow-up" width="16" height="16" aria-hidden="true" />Row</button>
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => onMove('down')}><Icon name="arrow-down" width="16" height="16" aria-hidden="true" />Row</button>
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => onMove('earlier')} aria-label="Earlier in the area">Earlier</button>
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => onMove('later')} aria-label="Later in the area">Later</button>
          </div>
          <button type="button" className="ix-btn ix-btn--sm" style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }} onClick={onRemove}><Icon name="trash-2" width="16" height="16" aria-hidden="true" />Remove</button>
        </div>
      ) : null}
    </div>
  );
}

export default function HeaderBuilder() {
  const { ready, d } = useSf();
  const { menus } = useStoreMenus();
  const [id, setId] = useState('');
  const [work, setWork] = useState(null);
  const [name, setName] = useState('');
  const [base, setBase] = useState('');
  const [device, setDevice] = useState('desktop');
  const [sel, setSel] = useState(null);       // { row, area, id }
  const [pal, setPal] = useState(null);       // { row, area }
  const locked = ready ? lockOf('header') : '';

  const open = (h) => { const W = clone(h.doc.draft); setId(h.id); setWork(W); setName(h.name); setBase(JSON.stringify([W, h.name])); setSel(null); try { window.history.replaceState(window.history.state, '', '/header-builder?id=' + h.id); } catch { /* ignore */ } };
  useEffect(() => {
    if (!ready || id) return;
    const want = getHeader(queryParam('id')) || getHeader(defaultHeaderId());
    if (want) open(want);
  }, [ready, id]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = !!work && JSON.stringify([work, name]) !== base;
  useEffect(() => {
    const on = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', on);
    return () => window.removeEventListener('beforeunload', on);
  }, [dirty]);

  const h = ready && id ? getHeader(id) : null;
  const isDefault = !!h && h.id === defaultHeaderId();
  const switchTo = async (x) => {
    if (x.id === id) return;
    if (dirty && !(await confirmDialog({ title: 'Leave without saving?', body: `Your changes to ${name} are not saved.`, confirmLabel: 'Leave', tone: 'danger' }))) return;
    open(x);
  };

  const dev = work ? work[device] : null;
  const setRow = (r, patch) => setWork((W) => ({ ...W, [device]: { ...W[device], rows: { ...W[device].rows, [r]: { ...W[device].rows[r], ...patch } } } }));
  const setDev = (patch) => setWork((W) => ({ ...W, [device]: { ...W[device], ...patch } }));
  const findSel = () => (sel && dev ? (dev.rows[sel.row][sel.area] || []).find((e) => e.id === sel.id) || null : null);
  const selEl = findSel();
  const addEl = (type) => {
    const el = newElement(type);
    const { row, area } = pal;
    setRow(row, { [area]: [...(dev.rows[row][area] || []), el], ...(dev.rows[row].on ? {} : { on: true }) });
    setPal(null); setSel({ row, area, id: el.id });
  };
  const changeEl = (patch) => { const { row, area } = sel; setRow(row, { [area]: dev.rows[row][area].map((e) => (e.id === sel.id ? { ...e, ...patch } : e)) }); };
  const removeEl = () => { const { row, area } = sel; const gone = selEl; const before = clone(work); setRow(row, { [area]: dev.rows[row][area].filter((e) => e.id !== sel.id) }); setSel(null); toast(`${elementBy(gone.type).label} removed`, { undo: () => setWork(before) }); };
  const moveEl = (dir) => {
    const { row, area } = sel;
    const W = clone(work);
    const rows = W[device].rows;
    const list = rows[row][area];
    const i = list.findIndex((e) => e.id === sel.id);
    const [el] = list.splice(i, 1);
    const ai = AREAS.findIndex((a) => a[0] === area);
    const ri = ROWS.findIndex((r) => r[0] === row);
    let to = { row, area };
    if (dir === 'earlier' || dir === 'later') { list.splice(Math.max(0, Math.min(list.length, i + (dir === 'earlier' ? -1 : 1))), 0, el); setWork(W); return; }
    if (dir === 'left' && ai > 0) to.area = AREAS[ai - 1][0];
    if (dir === 'right' && ai < 2) to.area = AREAS[ai + 1][0];
    if (dir === 'up' && ri > 0) to.row = ROWS[ri - 1][0];
    if (dir === 'down' && ri < 2) to.row = ROWS[ri + 1][0];
    rows[to.row][to.area] = [...(rows[to.row][to.area] || []), el];
    if (!rows[to.row].on) rows[to.row].on = true;
    setWork(W); setSel({ ...to, id: el.id });
  };

  const saveDraft = () => { saveHeaderDraft(id, work, name); setBase(JSON.stringify([work, name])); toast('Draft saved. Customers still see the published header.'); };
  const publish = () => { publishHeader(id, work, name); setBase(JSON.stringify([work, name])); toast(`${name} published${isDefault ? '' : ' (it shows where a layout picks it, or set it as the default)'}`); };
  const discard = async () => {
    if (!(await confirmDialog({ title: 'Discard changes?', body: 'The header goes back to its published version.', confirmLabel: 'Discard', tone: 'danger' }))) return;
    discardHeader(id); const x = getHeader(id); if (x) open(x); toast('Changes discarded');
  };
  const add = () => { const x = addHeader('New header'); open(x); toast('Header added: build it, then publish'); };
  const dup = () => { const x = duplicateHeader(id); if (x) { open(x); toast(`${x.name} made`); } };
  const del = async () => {
    const uses = headerUses(id);
    if (!(await confirmDialog({ title: `Delete ${name}?`, body: uses.length ? `${uses.join(', ')} use it; they go back to the default header.` : 'It is removed for good.', confirmLabel: 'Delete', tone: 'danger' }))) return;
    deleteHeader(id); setId(''); setWork(null); toast('Header deleted');
  };
  const makeDefault = () => { setDefaultHeader(id); toast(`${name} is now the default header`); };

  const tabs = ready ? (d.headers || []).map((x) => ({ key: x.id, id: 'hb-tab-' + x.id, label: x.name + (x.id === defaultHeaderId() ? ' · Default' : ''), on: x.id === id, onClick: () => switchTo(x) })) : [];
  const drawer = (dev && dev.drawer) || [];
  const moveDrawer = (k, dir) => { const l = drawer.slice(); const i = l.indexOf(k); const j = i + dir; if (j < 0 || j >= l.length) return; [l[i], l[j]] = [l[j], l[i]]; setDev({ drawer: l }); };
  const previewSrc = useMemo(() => '/store?preview=1&header=' + encodeURIComponent(id), [id]);

  return (
    <StoreFrame screen="HeaderBuilder" active="store-header" page="Header builder" css={CSS}
      after={<Sheet open={!!pal} title="Add to the header" onClose={() => setPal(null)}>
        <div className="hb-pal">{ELEMENTS.filter((e) => device === 'desktop' || e.type !== 'menu').map((e) => <button key={e.type} type="button" onClick={() => addEl(e.type)}><Icon name={e.icon} width="16" height="16" aria-hidden="true" />{e.label}</button>)}</div>
        {device === 'mobile' ? <p className="sfb-muted" style={{ marginTop: 'var(--space-3)' }}>On a phone the main menu lives in the ☰ drawer (Phone menu).</p> : null}
      </Sheet>}>
      <ShopHeader icon="panel-top" title="Header builder"
        about="Build the top of your store: rows, areas and what sits in them, separately for computers and phones. Keep several headers; the default shows everywhere unless a layout picks another."
        secondary={[{ label: 'Save draft', onClick: saveDraft, disabled: !work || !!locked }]}
        more={[{ label: 'Add a header', onClick: add }, { label: 'Duplicate', onClick: dup }, !isDefault ? { label: 'Set as default', onClick: makeDefault } : null, { label: 'Discard changes', onClick: discard }, !isDefault ? { label: 'Delete', onClick: del, tone: 'danger' } : null].filter(Boolean)}
        primary={{ label: 'Publish header', icon: 'upload', onClick: publish, disabled: !work || !!locked }} />
      <LockNote text={locked} />

      <section className="ix-card" aria-label="Headers">
        <div className="ix-bar">{ready ? <IndexTabs tabs={tabs} label="Saved headers" /> : <span />}<span className="ix-tools"><button type="button" className="ix-btn ix-btn--sm" onClick={add} disabled={!!locked}><Icon name="plus" width="16" height="16" aria-hidden="true" />Header</button></span></div>
        {!work ? <div style={{ minHeight: 240 }} aria-busy="true" /> : (<>
          <div className="hb-top">
            <div><label className="gc-label" htmlFor="hb-name">Name</label><input id="hb-name" className="gc-input" value={name} disabled={!!locked} onChange={(e) => setName(e.target.value)} /></div>
            <span style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              {dirty ? <StatusBadge tone="warning">Not saved</StatusBadge> : <DocBadge doc={h && h.doc} />}
              {isDefault ? <StatusBadge tone="info">Default</StatusBadge> : headerUses(id).length ? <StatusBadge tone="neutral">{'Used by ' + headerUses(id).join(', ')}</StatusBadge> : null}
              <span className="sfb-muted">{h && h.doc.liveAt ? 'Published ' + when(h.doc.liveAt) : 'Not published yet'}</span>
            </span>
          </div>
          <div className="ix-bar" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <IndexTabs label="Device" tabs={[{ key: 'desktop', id: 'hb-d', label: 'Computer', on: device === 'desktop', onClick: () => { setDevice('desktop'); setSel(null); } }, { key: 'mobile', id: 'hb-m', label: 'Phone', on: device === 'mobile', onClick: () => { setDevice('mobile'); setSel(null); } }]} />
          </div>
          <div className="ix-record" style={{ padding: 'var(--space-4) 0 0' }}>
            <div className="ix-main">
              <div className="hb-rows">
                {ROWS.map(([rk, rl]) => {
                  const r = dev.rows[rk];
                  return (
                    <div key={rk} className={'hb-row' + (r.on ? '' : ' is-off')}>
                      <div className="hb-rowhead">
                        <b>{rl}</b>
                        <label><button type="button" role="switch" className="gc-switch" aria-checked={!!r.on} aria-label={rl + ' on'} disabled={!!locked} onClick={() => setRow(rk, { on: !r.on })}><span className="gc-switch__knob" /></button>Show</label>
                        <label>Height <input type="number" className="gc-input" min={28} max={140} value={r.height} disabled={!!locked} onChange={(e) => setRow(rk, { height: Math.max(28, Math.min(140, Number(e.target.value) || 28)) })} aria-label={rl + ' height in px'} />px</label>
                        <label>Colours <select className="gc-input gc-select" value={r.tone} disabled={!!locked} onChange={(e) => setRow(rk, { tone: e.target.value })} aria-label={rl + ' colours'}>{ROW_TONES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
                        <label><button type="button" role="switch" className="gc-switch" aria-checked={!!r.sticky} aria-label={rl + ' sticky'} disabled={!!locked} onClick={() => setRow(rk, { sticky: !r.sticky })}><span className="gc-switch__knob" /></button>Sticky</label>
                      </div>
                      <div className="hb-areas">
                        {AREAS.map(([ak, al]) => (
                          <div key={ak} className="hb-area" aria-label={`${rl}, ${al}`}>
                            <small>{al}</small>
                            {(r[ak] || []).map((el) => { const def = elementBy(el.type); return <button key={el.id} type="button" className={'hb-chip' + (sel && sel.id === el.id ? ' on' : '')} aria-pressed={!!sel && sel.id === el.id} onClick={() => setSel({ row: rk, area: ak, id: el.id })}><Icon name={def ? def.icon : 'square'} width="16" height="16" aria-hidden="true" /><span>{def ? def.label : el.type}{el.type === 'text' && el.text ? ': ' + el.text : ''}</span></button>; })}
                            {!locked ? <button type="button" className="hb-add" onClick={() => setPal({ row: rk, area: ak })}><Icon name="plus" width="14" height="14" aria-hidden="true" />Add</button> : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <aside className="ix-side" style={{ padding: '0 var(--space-4) var(--space-4) 0' }}>
              <section className="ix-card ix-card--pad" aria-label="How the header behaves" style={{ boxShadow: 'none', border: '1px solid var(--border-subtle)' }}>
                <h2 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>Behaviour</h2>
                {HEADER_SWITCHES.map(([k, l, help]) => (
                  <div key={k} className="sfb-row">
                    <span id={'hb-sw-' + k} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{l}<InfoTip text={help} /></span>
                    <button type="button" role="switch" className="gc-switch" aria-checked={!!work[k]} aria-labelledby={'hb-sw-' + k} disabled={!!locked} onClick={() => setWork((W) => ({ ...W, [k]: !W[k] }))}><span className="gc-switch__knob" /></button>
                  </div>
                ))}
                {work.overHero ? <p className="sfb-muted" style={{ marginTop: 'var(--space-2)' }}>Works when Home’s first section is a hero banner.</p> : null}
              </section>
              <section className="ix-card ix-card--pad" aria-label="Element settings" style={{ boxShadow: 'none', border: '1px solid var(--border-subtle)' }}>
                {selEl ? (<>
                  <h2 style={{ margin: '0 0 var(--space-3)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>{elementBy(selEl.type).label}</h2>
                  <ElementPanel el={selEl} menus={menus} locked={locked} onChange={changeEl} onMove={moveEl} onRemove={removeEl} />
                </>) : <p className="sfb-muted">Pick an element to change it, or press Add in an area.</p>}
              </section>
              {device === 'mobile' ? (
                <section className="ix-card ix-card--pad" aria-label="Phone menu" style={{ boxShadow: 'none', border: '1px solid var(--border-subtle)' }}>
                  <h2 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>Phone menu (☰)</h2>
                  <ul className="hb-list">
                    {[...drawer, ...DRAWER_ITEMS.map((x) => x[0]).filter((k) => !drawer.includes(k))].map((k) => {
                      const on = drawer.includes(k);
                      const label = (DRAWER_ITEMS.find((x) => x[0] === k) || [k, k])[1];
                      return (
                        <li key={k}>
                          <label><input type="checkbox" className="gc-check" checked={on} disabled={!!locked} onChange={() => setDev({ drawer: on ? drawer.filter((x) => x !== k) : [...drawer, k] })} />{label}</label>
                          {on ? <><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Move ${label} up`} disabled={!!locked} onClick={() => moveDrawer(k, -1)}><Icon name="arrow-up" width="16" height="16" /></button><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Move ${label} down`} disabled={!!locked} onClick={() => moveDrawer(k, 1)}><Icon name="arrow-down" width="16" height="16" /></button></> : null}
                        </li>
                      );
                    })}
                  </ul>
                  <div className="sfb-row" style={{ marginTop: 'var(--space-3)' }}><span id="hb-bn">Bottom navigation bar</span><button type="button" role="switch" className="gc-switch" aria-checked={!!dev.bottomNav} aria-labelledby="hb-bn" disabled={!!locked} onClick={() => setDev({ bottomNav: !dev.bottomNav })}><span className="gc-switch__knob" /></button></div>
                  {dev.bottomNav ? (
                    <ul className="hb-list">
                      {NAV_ITEMS.map(([k, l]) => { const on = (dev.navItems || []).includes(k); return <li key={k}><label><input type="checkbox" className="gc-check" checked={on} disabled={!!locked || (!on && (dev.navItems || []).length >= 5)} onChange={() => setDev({ navItems: on ? dev.navItems.filter((x) => x !== k) : [...(dev.navItems || []), k] })} />{l}</label></li>; })}
                    </ul>
                  ) : null}
                </section>
              ) : null}
            </aside>
          </div>
        </>)}
      </section>

      {work ? (
        <section className="ix-card" aria-labelledby="hb-pv">
          <div className="ix-card__head"><h2 id="hb-pv">Preview · {device === 'mobile' ? 'phone' : 'computer'}</h2></div>
          <div style={{ padding: 'var(--space-3) var(--space-4) var(--space-4)' }}><PreviewFrame src={previewSrc} device={device === 'mobile' ? 'phone' : 'desktop'} parts={[['header:' + id, work]]} height={device === 'mobile' ? 560 : 420} title="Header preview" /></div>
        </section>
      ) : null}
    </StoreFrame>
  );
}
