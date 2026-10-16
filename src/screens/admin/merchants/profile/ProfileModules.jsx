'use client';
// Merchant 360° profile › Modules: every module, grouped by set, with what this store has (in plan, add-on, trial,
// locked, off, or set by staff) and a switch. Turning one on or off asks why (setModule); a module set by staff can go
// back to what the package gives. Platform core runs in every store and has no switch.
// Code snippets (Batch C step 8): GridCommerce's kill switch for the store's snippets (lib/admin/snippetGuard.js).

import React, { useEffect, useState } from 'react';
import { StatusBadge } from '@/components/ui';
import { confirmDialog, toast } from '@/runtime/ui';
import { SETS } from '@/lib/platform/catalogue';
import { modulesOf, setModule } from '@/lib/admin/merchants';
import { rightOf } from '@/lib/admin/actionRights';
import { Card, Row } from './profileShared';
import { snippetGuardOf, setSnippetGuard, SNIPPET_GUARD_EVENT } from '@/lib/admin/snippetGuard';
import { MARKET_MODULES, MARKET_EVENT, moduleAccess, canUse, allowShop, disallowShop, blockShop, unblockShop } from '@/lib/platform/marketAccess';
import { staff as currentStaff } from '@/lib/platform/store';

/** Services and Grid Shop for this store (Batch D): open, close or block it here; the rules for all stores are in
 *  Services › Access. */
function MarketCard({ shop, by }) {
  const [, setTick] = useState(0);
  const [why, setWhy] = useState({});
  useEffect(() => { const on = () => setTick((x) => x + 1); window.addEventListener(MARKET_EVENT, on); return () => window.removeEventListener(MARKET_EVENT, on); }, []);
  const right = rightOf('module');
  const act = (fn) => { if (!right.ok) { toast(right.reason); return; } fn(); };
  return (
    <Card title="Services & Grid Shop" action={<a className="ix-btn ix-btn--sm" href="/admin/services/access">Rules for all stores</a>}>
      {MARKET_MODULES.map(([k, l]) => {
        const m = moduleAccess(k), u = canUse(k, shop.id), blocked = (m.blocked || []).find((b) => b.shopId === shop.id);
        return (
          <div key={k} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-2) var(--space-3)', padding: 'var(--space-2) 0', borderTop: k === 'shop' ? '1px solid var(--border-subtle)' : 0 }}>
            <span style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column' }}><b style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>{l}</b><span className="mp-muted" style={{ fontSize: 'var(--text-xs)' }}>{u.ok ? 'This store can use it' : blocked ? 'Blocked: ' + blocked.reason : !m.on ? 'Off for every store' : 'Not open to this store (chosen stores only)'}</span></span>
            <StatusBadge tone={u.ok ? 'success' : blocked ? 'error' : 'neutral'}>{u.ok ? 'Open' : blocked ? 'Blocked' : 'Closed'}</StatusBadge>
            {m.mode === 'chosen' && !blocked ? ((m.allow || []).includes(shop.id) ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => act(() => { disallowShop(k, shop.id, by); toast(`${l} closed for ${shop.name}`); })}>Close</button> : <button type="button" className="ix-btn ix-btn--sm" onClick={() => act(() => { allowShop(k, shop.id, by); toast(`${l} opened for ${shop.name}`); })}>Open for this store</button>) : null}
            {blocked ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => act(() => { unblockShop(k, shop.id, by); toast(`${shop.name} unblocked from ${l}`); })}>Unblock</button> : (<>
              <input className="gc-input" style={{ flex: '1 1 200px' }} value={why[k] || ''} onChange={(e) => setWhy({ ...why, [k]: e.target.value })} placeholder="Why block (the store sees it)" aria-label={`Why block ${l}`} />
              <button type="button" className="ix-btn ix-btn--sm" onClick={() => act(() => { if (!(why[k] || '').trim()) { toast('Write why: the store sees it.', { tone: 'error' }); return; } blockShop(k, shop.id, why[k], by); setWhy({ ...why, [k]: '' }); toast(`${shop.name} blocked from ${l}`); })}>Block</button>
            </>)}
          </div>
        );
      })}
    </Card>
  );
}

/** Turn every code snippet of this store off (a reason the merchant sees) or back on. */
function SnippetGuard({ shop }) {
  const [g, setG] = useState({ off: false });
  const [why, setWhy] = useState('');
  useEffect(() => { const load = () => setG(snippetGuardOf(shop.id)); load(); window.addEventListener(SNIPPET_GUARD_EVENT, load); return () => window.removeEventListener(SNIPPET_GUARD_EVENT, load); }, [shop.id]);
  const right = rightOf('module');
  const by = (() => { try { return (currentStaff() || {}).name || 'Staff'; } catch { return 'Staff'; } })();
  const flip = async () => {
    if (!right.ok) { toast(right.reason); return; }
    if (!g.off) {
      if (!why.trim()) { toast('Write why: the store sees it.', { tone: 'error' }); document.getElementById('mp-snip-why')?.focus(); return; }
      if (!(await confirmDialog({ title: `Turn off ${shop.name}'s code snippets?`, body: 'Every snippet (tracking IDs, CSS, text) comes off the store at once. The store sees your reason.', confirmLabel: 'Turn off', tone: 'danger' }))) return;
      setSnippetGuard(shop.id, true, why, by); setWhy(''); toast('Code snippets turned off for this store');
    } else { setSnippetGuard(shop.id, false, '', by); toast('Code snippets are allowed again'); }
  };
  return (
    <Card title="Code snippets" action={<StatusBadge tone={g.off ? 'error' : 'success'}>{g.off ? 'Off by GridCommerce' : 'Allowed'}</StatusBadge>}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 'var(--space-3)' }}>
        {g.off ? <p className="mp-muted" style={{ margin: 0, flex: '1 1 260px', fontSize: 'var(--text-sm)' }}>Turned off{g.by ? ' by ' + g.by : ''}: {g.reason}</p>
          : <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 6 }}><label className="gc-label" htmlFor="mp-snip-why">If you turn them off: why (the store sees it)</label><input id="mp-snip-why" className="gc-input" value={why} onChange={(e) => setWhy(e.target.value)} placeholder="e.g. A CSS snippet hid the checkout button" /></div>}
        <button type="button" className={'ix-btn' + (g.off ? ' ix-btn--primary' : '')} onClick={flip}>{g.off ? 'Allow snippets again' : 'Turn off all snippets'}</button>
      </div>
    </Card>
  );
}

const STATE = {
  in: ['In plan', 'success'], addon: ['Add-on', 'success'], trial: ['Trial', 'primary'], locked: ['Locked', 'neutral'],
  off: ['Off', 'neutral'], on: ['On · set by staff', 'warning'], blocked: ['Off · set by staff', 'error'],
};
const VIEWS = [['all', 'All'], ['active', 'On'], ['off', 'Off'], ['staff', 'Set by staff']];

export function ModulesTab({ ctx }) {
  const { db, t, shop, open } = ctx;
  const [view, setView] = useState('all');
  const mods = modulesOf(db, shop, t);
  const pick = (m) => (view === 'active' ? m.active : view === 'off' ? !m.active : view === 'staff' ? m.state === 'on' || m.state === 'blocked' : true);
  const groups = SETS.map((s) => ({ ...s, mods: mods.filter((m) => m.set === s.id && pick(m)) })).filter((g) => g.mods.length);
  const count = { all: mods.length, active: mods.filter((m) => m.active).length, off: mods.filter((m) => !m.active).length, staff: mods.filter((m) => m.state === 'on' || m.state === 'blocked').length };

  // turning a module on or off for one store needs Edit on Plans & modules (Roles & permissions)
  const right = rightOf('module');
  const flip = (m) => (right.ok ? open('module', { code: m.code, name: m.name, on: !m.active }) : toast(right.reason));
  const reset = async (m) => {
    if (!right.ok) { toast(right.reason); return; }
    if (!(await confirmDialog({ title: `${m.name} back to the package?`, body: 'The store gets what its package gives for this module.', confirmLabel: 'Reset' }))) return;
    const r = setModule(shop.id, m.code, null);
    toast(r.ok ? `${m.name} follows the package again` : r.error);
  };

  return (
    <>
      <div className="mp-tools">
        <div className="ix-chips" role="group" aria-label="Show modules">
          {VIEWS.map(([k, l]) => <button key={k} type="button" className="ix-chip" aria-pressed={view === k} onClick={() => setView(k)}>{l} · {count[k]}</button>)}
        </div>
        <span style={{ flex: 1 }} />
        <button type="button" className="ix-btn" onClick={() => open('modtrial')}>Start a module trial</button>
      </div>
      {!right.ok ? <p className="mp-muted" style={{ margin: 0, fontSize: 'var(--text-xs)' }}>{right.reason}</p> : null}
      <SnippetGuard shop={shop} />
      <MarketCard shop={shop} by={(() => { try { return (currentStaff() || {}).name || 'Staff'; } catch { return 'Staff'; } })()} />
      {groups.length ? groups.map((g) => (
        <Card key={g.id} title={g.label} action={<span className="mp-muted" style={{ fontSize: 'var(--text-xs)' }}>{g.sub}</span>} flush>
          <div className="mp-mods">
            {g.mods.map((m) => {
              const [label, tone] = STATE[m.state] || STATE.off;
              const forced = m.state === 'on' || m.state === 'blocked';
              return (
                <Row key={m.code} title={<>{m.name} <span className="mp-muted mp-data">{m.code}</span></>}
                  sub={<StatusBadge tone={tone}>{label}{m.state === 'trial' && m.note ? ' · ' + m.note.replace('Trial · ', '') : ''}</StatusBadge>}
                  end={<>
                    {forced && right.ok ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => reset(m)}>Reset</button> : null}
                    {g.always && g.id === 'platform' ? <span className="mp-muted" style={{ fontSize: 'var(--text-xs)' }}>Always on</span> : (
                      <button type="button" role="switch" className="gc-switch" aria-checked={!!m.active} aria-label={`${m.name} for this store`} onClick={() => flip(m)} disabled={!right.ok} title={right.ok ? undefined : right.reason}><span className="gc-switch__knob" /></button>
                    )}
                  </>} />
              );
            })}
          </div>
        </Card>
      )) : <Card><p className="mp-empty">No modules in this view.</p></Card>}
    </>
  );
}
