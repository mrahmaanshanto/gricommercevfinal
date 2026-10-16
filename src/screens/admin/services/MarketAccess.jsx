'use client';
// Services › Access (/admin/services/access?m=services|shop; Batch D step 2) — full control over who may use Services
// and Grid Shop: the whole module on or off, every store or chosen stores only, blocked stores (each with a reason the
// store sees), the message closed stores read, and a history of changes. The same switches show per store on the
// merchant's Modules tab. Data: lib/platform/marketAccess.js (shared with the merchant panel).

import React, { useEffect, useMemo, useState } from 'react';
import { toast, confirmDialog } from '@/runtime/ui';
import { StatusBadge, EmptyState } from '@/components/ui';
import { ShopHeader, IndexTabs } from '@/components/ui/IndexKit';
import { MARKET_MODULES, MARKET_EVENT, moduleAccess, setModule, allowShop, disallowShop, blockShop, unblockShop } from '@/lib/platform/marketAccess';
import { staff } from '@/lib/platform/store';
import { AdminShell, usePlatform } from '../AdminShell';
import { SVA_CSS, dTime } from './svcAdmin';

const CSS = `
.ma-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle)}
.ma-row:first-child{border-top:0}
.ma-row>span:first-child{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1 1 280px}
.ma-row b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ma-row small{font-size:var(--text-xs);color:var(--text-muted)}
.ma-add{display:flex;flex-wrap:wrap;gap:var(--space-2);padding:var(--space-3) var(--space-4)}
.ma-add select{flex:1 1 220px;width:auto}
.ma-add input{flex:2 1 260px}
.ma-list{list-style:none;margin:0;padding:0}
.ma-list li{display:flex;align-items:center;gap:var(--space-3);min-height:48px;padding:var(--space-2) var(--space-4);border-top:1px solid var(--border-subtle)}
.ma-list li>span:first-child{flex:1;min-width:0;display:flex;flex-direction:column}
.ma-list small{font-size:var(--text-xs);color:var(--text-muted)}
.ma-card>header{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-3) var(--space-4) 0}
.ma-card>header h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
`;

export default function MarketAccess() {
  const { db, live } = usePlatform();
  const [mod, setMod] = useState('services');
  const [tick, setTick] = useState(0);
  const [pick, setPick] = useState('');
  const [blk, setBlk] = useState({ shopId: '', reason: '' });
  const [text, setText] = useState(null);
  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get('m');
    if (MARKET_MODULES.some(([k]) => k === m)) setMod(m);
    const on = () => setTick((x) => x + 1);
    window.addEventListener(MARKET_EVENT, on); window.addEventListener('storage', on);
    return () => { window.removeEventListener(MARKET_EVENT, on); window.removeEventListener('storage', on); };
  }, []);
  const a = useMemo(() => (live ? moduleAccess(mod) : null), [live, mod, tick]);
  useEffect(() => { if (a) setText(a.closedText); }, [mod, live]); // eslint-disable-line react-hooks/exhaustive-deps
  const shops = live ? db.shops.slice().sort((x, y) => x.name.localeCompare(y.name)) : [];
  const nameOf = (id) => (shops.find((s) => s.id === id) || { name: 'Store ' + id }).name;
  const by = (() => { try { return staff().name; } catch { return 'Staff'; } })();
  const go = (k) => { setMod(k); const u = new URL(window.location.href); u.searchParams.set('m', k); window.history.replaceState(null, '', u); };
  const label = (MARKET_MODULES.find(([k]) => k === mod) || [0, ''])[1];

  const flipOn = async () => {
    if (a.on && !(await confirmDialog({ title: `Turn ${label} off for every store?`, body: 'Stores can’t open it or order until you turn it back on. Orders already placed carry on.', confirmLabel: 'Turn off', tone: 'danger' }))) return;
    setModule(mod, { on: !a.on }, by); toast(`${label} is ${a.on ? 'off' : 'on'} for every store`);
  };
  const block = () => {
    if (!blk.shopId) { toast('Pick a store.', { tone: 'error' }); return; }
    if (!blk.reason.trim()) { toast('Write why: the store sees it.', { tone: 'error' }); return; }
    blockShop(mod, blk.shopId, blk.reason, by); toast(`${nameOf(blk.shopId)} blocked from ${label}`); setBlk({ shopId: '', reason: '' });
  };

  return (
    <AdminShell active="svc-access" title="Access">
      <style dangerouslySetInnerHTML={{ __html: SVA_CSS + CSS }} />
      <div className="ix-page">
        <ShopHeader icon="shield-check" title="Access" about="Who may use Services, Grid Shop, Grid Partners and Grid Career: each module on or off, every store or chosen stores only, and blocked stores with the reason they see." />
        <section className="ix-card"><IndexTabs tabs={MARKET_MODULES.map(([k, l]) => ({ key: k, id: 'ma-' + k, label: l, on: mod === k, onClick: () => go(k) }))} label="Module" /></section>
        {!a ? <div className="ix-card" style={{ minHeight: 240 }} aria-busy="true" /> : (<>
          <section className="ix-card ma-card" aria-label={label + ' for every store'}>
            <div className="ma-row">
              <span><b>{label} is {a.on ? 'on' : 'off'}</b><small>{(MARKET_MODULES.find(([k]) => k === mod) || [])[2]}</small></span>
              <button type="button" role="switch" className="gc-switch" aria-checked={a.on} aria-label={`${label} on for stores`} onClick={flipOn}><span className="gc-switch__knob" /></button>
            </div>
            <div className="ma-row">
              <span><b>Who can use it</b><small>{a.mode === 'chosen' ? `Only the ${a.allow.length} store${a.allow.length === 1 ? '' : 's'} you open it for.` : 'Every store, except blocked ones.'}</small></span>
              <select className="gc-input gc-select" style={{ width: 'auto', minWidth: 200 }} value={a.mode} onChange={(e) => { setModule(mod, { mode: e.target.value }, by); toast(e.target.value === 'chosen' ? 'Now open to chosen stores only' : 'Now open to every store'); }} aria-label="Who can use it">
                <option value="all">Every store</option><option value="chosen">Chosen stores only</option>
              </select>
            </div>
            <div className="ma-row">
              <span style={{ flex: '1 1 100%' }}><b>What closed stores read</b><small>Shown on the page when the module is off or not open to them.</small></span>
              <input className="gc-input" style={{ flex: '1 1 320px' }} value={text || ''} onChange={(e) => setText(e.target.value)} aria-label="What closed stores read" />
              <button type="button" className="ix-btn ix-btn--sm" disabled={!text || text === a.closedText} onClick={() => { setModule(mod, { closedText: text.trim() }, by); toast('Saved'); }}>Save</button>
            </div>
          </section>

          {a.mode === 'chosen' ? (
            <section className="ix-card ma-card" aria-labelledby="ma-open">
              <header><h2 id="ma-open">Open for · {a.allow.length}</h2></header>
              <div className="ma-add">
                <select className="gc-input gc-select" value={pick} onChange={(e) => setPick(e.target.value)} aria-label="Store to open it for"><option value="">Choose a store…</option>{shops.filter((s) => !a.allow.includes(s.id)).map((s) => <option key={s.id} value={s.id}>{s.name} · #{s.id}</option>)}</select>
                <button type="button" className="ix-btn ix-btn--primary" disabled={!pick} onClick={() => { allowShop(mod, pick, by); toast(`${label} opened for ${nameOf(pick)}`); setPick(''); }}>Open for this store</button>
              </div>
              {a.allow.length ? <ul className="ma-list">{a.allow.map((id) => <li key={id}><span><b>{nameOf(id)}</b><small>#{id}</small></span><button type="button" className="ix-btn ix-btn--sm" onClick={() => { disallowShop(mod, id, by); toast(`Closed for ${nameOf(id)}`); }}>Close</button></li>)}</ul> : <div style={{ padding: '0 var(--space-4) var(--space-4)' }}><EmptyState icon="store" title="Not open to any store yet" /></div>}
            </section>
          ) : null}

          <section className="ix-card ma-card" aria-labelledby="ma-blk">
            <header><h2 id="ma-blk">Blocked stores · {a.blocked.length}</h2></header>
            <div className="ma-add">
              <select className="gc-input gc-select" value={blk.shopId} onChange={(e) => setBlk({ ...blk, shopId: e.target.value })} aria-label="Store to block"><option value="">Choose a store…</option>{shops.filter((s) => !a.blocked.some((b) => b.shopId === s.id)).map((s) => <option key={s.id} value={s.id}>{s.name} · #{s.id}</option>)}</select>
              <input className="gc-input" value={blk.reason} onChange={(e) => setBlk({ ...blk, reason: e.target.value })} placeholder="Why (the store sees it), e.g. Unpaid service invoice" aria-label="Why" />
              <button type="button" className="ix-btn" onClick={block}>Block</button>
            </div>
            {a.blocked.length ? <ul className="ma-list">{a.blocked.map((b) => <li key={b.shopId}><span><b>{nameOf(b.shopId)}</b><small>{b.reason} · by {b.by}, {dTime(b.at)}</small></span><StatusBadge tone="error">Blocked</StatusBadge><button type="button" className="ix-btn ix-btn--sm" onClick={() => { unblockShop(mod, b.shopId, by); toast(`${nameOf(b.shopId)} unblocked`); }}>Unblock</button></li>)}</ul> : null}
          </section>

          {a.history.length ? (
            <details className="gc-disclose">
              <summary>Changes · {a.history.length}</summary>
              <ul className="ma-list">{a.history.map((h, i) => <li key={i}><span>{h.text}<small>{h.by} · {dTime(h.at)}</small></span></li>)}</ul>
            </details>
          ) : null}
        </>)}
      </div>
    </AdminShell>
  );
}
