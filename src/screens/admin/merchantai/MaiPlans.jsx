'use client';
// Merchant AI › AI plans & limits (/admin/merchant-ai/plans) — what Grid AI each plan includes: the monthly AI allowance,
// the agents, the model tiers, Autopilot, knowledge storage, AI automations, inbox channels, AI analytics, assistant
// questions a day and the rule at the allowance (Copilot only, stop, or bill the overage at cost + markup). Plus the
// trial's AI and the platform markup. Changes apply to every store on the plan from the next AI turn and are logged.
// Data: lib/admin/merchantAi.js.

import React, { useEffect, useState } from 'react';
import { toast } from '@/runtime/ui';
import { ShopHeader } from '@/components/ui/IndexKit';
import { StatusBadge } from '@/components/ui';
import { useAdminStore } from '@/lib/admin/store';
import { merchantAi, savePlan, saveTrial, setMarkup, AGENTS, TIERS, POLICIES } from '@/lib/admin/merchantAi';
import { taka, dmy } from '@/lib/platform/util';
import { AdminShell } from '../AdminShell';
import { MAI_CSS } from './maiShared';

const PLANS = [['starter', 'Starter'], ['growth', 'Growth'], ['business', 'Business']];
const Sw = ({ on, onToggle, label }) => <button type="button" role="switch" aria-checked={!!on} aria-label={label} className="gc-switch" onClick={onToggle}><span className="gc-switch__knob" /></button>;

export default function MaiPlans() {
  const s = useAdminStore(merchantAi);
  const [edit, setEdit] = useState(null);
  const [trial, setTrial] = useState(null);
  const [markup, setMk] = useState('');
  useEffect(() => { if (s.live && !edit) { setEdit(JSON.parse(JSON.stringify(s.data.plans))); setTrial({ ...s.data.trial }); setMk(String(s.data.markup)); } }, [s.live]); // eslint-disable-line react-hooks/exhaustive-deps
  const ready = s.live && !!edit;
  const set = (pid, k, v) => setEdit((e) => ({ ...e, [pid]: { ...e[pid], [k]: v } }));
  const flip = (pid, k, v) => setEdit((e) => { const cur = e[pid][k]; return { ...e, [pid]: { ...e[pid], [k]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v].sort() } }; });
  const dirty = ready && (JSON.stringify(edit) !== JSON.stringify(s.data.plans) || JSON.stringify(trial) !== JSON.stringify(s.data.trial) || Number(markup) !== s.data.markup);
  const save = () => {
    PLANS.forEach(([pid]) => savePlan(pid, { ...edit[pid], allowance: Number(edit[pid].allowance) || 0, knowledgeMB: Number(edit[pid].knowledgeMB) || 0, automations: Number(edit[pid].automations) || 0, channels: Number(edit[pid].channels) || 0, assistant: Number(edit[pid].assistant) || 0 }));
    saveTrial({ ...trial, allowance: Number(trial.allowance) || 0, days: Number(trial.days) || 14 });
    const r = setMarkup(markup);
    if (!r.ok) { toast(r.error, { tone: 'error' }); return; }
    toast('Saved. Stores on these plans get it from their next AI turn.');
  };

  return (
    <AdminShell active="mai-plans" title="AI plans & limits">
      <style dangerouslySetInnerHTML={{ __html: MAI_CSS }} />
      <div className="ix-page">
        <ShopHeader icon="sliders-horizontal" title="AI plans & limits"
          about="What Grid AI each plan includes. The allowance is how much AI a store may use a month (provider cost); past it, the plan's rule applies: Copilot only, stop, or keep going and bill the overage at cost plus the markup. A store can be given extra credits or its own rule on Usage & credits."
          secondary={[{ label: 'Discard', onClick: () => { setEdit(JSON.parse(JSON.stringify(s.data.plans))); setTrial({ ...s.data.trial }); setMk(String(s.data.markup)); }, disabled: !dirty }]}
          primary={{ label: 'Save', onClick: save, disabled: !dirty }} />
        {!ready ? <div className="mai-skel" aria-busy="true" /> : (<>
          <div className="mai-plans">
            {PLANS.map(([pid, name]) => { const p = edit[pid]; return (
              <section key={pid} className="ix-card mai-plan" aria-labelledby={'mp-' + pid}>
                <div className="mai-plan__head"><h2 id={'mp-' + pid}>{name}</h2><b>{taka(Number(p.allowance) || 0)}<span className="mai-sub" style={{ display: 'inline', marginLeft: 4 }}>a month</span></b></div>
                <div className="mai-plan__body">
                  <label className="mai-field"><span>AI allowance a month (৳)</span><input className="gc-input" inputMode="numeric" value={p.allowance} onChange={(e) => set(pid, 'allowance', e.target.value)} /></label>
                  <div className="mai-field"><span>Agents</span><div className="mai-checks">{AGENTS.map(([k, l]) => <label key={k}><input type="checkbox" className="gc-check" checked={p.agents.includes(k)} onChange={() => flip(pid, 'agents', k)} />{l}</label>)}</div></div>
                  <div className="mai-field"><span>Model tiers</span><div className="mai-checks">{TIERS.map(([k, l]) => <label key={k}><input type="checkbox" className="gc-check" checked={p.tiers.includes(k)} onChange={() => flip(pid, 'tiers', k)} />{k} · {l}</label>)}</div></div>
                  <div className="mai-sw"><span>Autopilot (AI replies by itself)</span><Sw on={p.autopilot} onToggle={() => set(pid, 'autopilot', !p.autopilot)} label={'Autopilot on ' + name} /></div>
                  <div className="mai-sw"><span>AI analytics</span><Sw on={p.analytics} onToggle={() => set(pid, 'analytics', !p.analytics)} label={'AI analytics on ' + name} /></div>
                  <label className="mai-field"><span>Knowledge storage (MB)</span><input className="gc-input" inputMode="numeric" value={p.knowledgeMB} onChange={(e) => set(pid, 'knowledgeMB', e.target.value)} /></label>
                  <label className="mai-field"><span>AI automations</span><input className="gc-input" inputMode="numeric" value={p.automations} onChange={(e) => set(pid, 'automations', e.target.value)} /></label>
                  <label className="mai-field"><span>Inbox channels with AI</span><input className="gc-input" inputMode="numeric" value={p.channels} onChange={(e) => set(pid, 'channels', e.target.value)} /></label>
                  <label className="mai-field"><span>Assistant questions a day (per person)</span><input className="gc-input" inputMode="numeric" value={p.assistant} onChange={(e) => set(pid, 'assistant', e.target.value)} /></label>
                  <label className="mai-field"><span>At the allowance</span><select className="gc-input gc-select" value={p.overage} onChange={(e) => set(pid, 'overage', e.target.value)}>{POLICIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
                </div>
              </section>
            ); })}
          </div>
          <div className="mai-grid2">
            <section className="ix-card" aria-labelledby="mp-trial">
              <div className="ix-card__head"><h2 id="mp-trial">Trial and pricing</h2></div>
              <div className="mai-card-body">
                <div className="mai-row"><label className="mai-field" style={{ flex: '1 1 160px' }}><span>Trial AI allowance (৳)</span><input className="gc-input" inputMode="numeric" value={trial.allowance} onChange={(e) => setTrial({ ...trial, allowance: e.target.value })} /></label><label className="mai-field" style={{ flex: '1 1 120px' }}><span>Trial days</span><input className="gc-input" inputMode="numeric" value={trial.days} onChange={(e) => setTrial({ ...trial, days: e.target.value })} /></label></div>
                <div className="mai-sw"><span>Autopilot during the trial</span><Sw on={trial.autopilot} onToggle={() => setTrial({ ...trial, autopilot: !trial.autopilot })} label="Autopilot during the trial" /></div>
                <label className="mai-field"><span>Markup on overage and credit packs (%)</span><input className="gc-input" inputMode="numeric" value={markup} onChange={(e) => setMk(e.target.value)} /></label>
                <p className="gc-help" style={{ margin: 0 }}>Overage is billed at the provider cost plus this markup, on the next invoice.</p>
              </div>
            </section>
            <section className="ix-card" aria-labelledby="mp-hist">
              <div className="ix-card__head"><h2 id="mp-hist">Changes</h2><StatusBadge tone="neutral">{s.data.history.length}</StatusBadge></div>
              <div className="mai-card-body"><ul className="mai-hist">{s.data.history.slice(0, 10).map((h, i) => <li key={i}><b>{h.text}</b><span>{h.by} · {dmy(h.at)}</span></li>)}</ul></div>
            </section>
          </div>
        </>)}
      </div>
    </AdminShell>
  );
}
