'use client';
// Merchant 360° profile › Modules: every module, grouped by set, with what this store has (in plan, add-on, trial,
// locked, off, or set by staff) and a switch. Turning one on or off asks why (setModule); a module set by staff can go
// back to what the package gives. Platform core runs in every store and has no switch.

import React, { useState } from 'react';
import { StatusBadge } from '@/components/ui';
import { confirmDialog, toast } from '@/runtime/ui';
import { SETS } from '@/lib/platform/catalogue';
import { modulesOf, setModule } from '@/lib/admin/merchants';
import { Card, Row } from './profileShared';

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

  const flip = (m) => open('module', { code: m.code, name: m.name, on: !m.active });
  const reset = async (m) => {
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
                    {forced ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => reset(m)}>Reset</button> : null}
                    {g.always && g.id === 'platform' ? <span className="mp-muted" style={{ fontSize: 'var(--text-xs)' }}>Always on</span> : (
                      <button type="button" role="switch" className="gc-switch" aria-checked={!!m.active} aria-label={`${m.name} for this store`} onClick={() => flip(m)}><span className="gc-switch__knob" /></button>
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
