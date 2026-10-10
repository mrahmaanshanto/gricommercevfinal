'use client';
// Grid AI › Settings › Models & limits — which AI providers the shop uses, the model per tier (main + fallback on another
// provider), which tier each task uses, the monthly budget and what happens at the limit, the per-turn limits, and the
// security switches (mask personal details, own links only, the prompt-injection filter, no-training terms, how long
// traces are kept). Changing a model runs the test set first (lib/gridai/evals.js › releaseGate): a critical failure
// stops the change. Needs "Configure Grid AI". Data: lib/gridai/models.js.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { StatusBadge, InfoTip } from '@/components/ui';
import { ShopHeader } from '@/components/ui/IndexKit';
import { toast, confirmDialog } from '@/runtime/ui';
import { currentUser } from '@/lib/team';
import { can, why } from '@/lib/permissions';
import { BrandLogo } from '@/components/BrandLogo';
import { getModels, saveModels, resetModels, PROVIDERS, CATALOG, TIERS, TASKS, modelBy, USD_BDT } from '@/lib/gridai/models';
import { runAll } from '@/lib/gridai/evals';
import { logAi } from '@/lib/gridai/activity';
import { GaFrame, Switch, Field, AiSettingsTabs } from './gaShared';

const CSS = `
.md-card{display:flex;flex-direction:column}
.md-body{display:grid;gap:var(--space-4);padding:var(--space-4)}
.md-prov{display:flex;align-items:center;gap:var(--space-3);min-height:56px;padding:var(--space-2) var(--space-4);border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.md-prov:first-of-type{border-top:0}
.md-prov>span:nth-child(2){flex:1;min-width:0}
.md-prov b{display:block;font-weight:var(--weight-medium);color:var(--text-heading)}
.md-prov small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.md-tier td .gc-input{min-width:180px}
.md-price{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.md-row3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3) var(--space-4)}
.md-bar{position:sticky;bottom:0;z-index:5;display:flex;align-items:center;justify-content:flex-end;gap:var(--space-2);min-height:52px;padding:8px 24px;border-top:1px solid var(--border-subtle);background:var(--surface-card);box-shadow:0 -8px 22px -14px rgba(15,23,42,.25)}
.md-bar span{margin-right:auto;font-size:var(--text-sm);color:var(--text-muted)}
@media (max-width:640px){.md-row3{grid-template-columns:minmax(0,1fr)}}
`;
const usd = (m) => '$' + m.in + ' / $' + m.out;

export default function Models() {
  const [s, setS] = useState(null);
  const [base, setBase] = useState(null);
  const [me, setMe] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { const v = getModels(); setS(v); setBase(v); setMe(currentUser()); }, []);
  const ready = !!s;
  const mayEdit = ready && can(me, 'ai-configure');
  const dirty = ready && JSON.stringify(s) !== JSON.stringify(base);
  const set = (patch) => setS((x) => ({ ...x, ...patch }));
  const setTier = (tier, key, id) => setS((x) => ({ ...x, tiers: { ...x.tiers, [tier]: { ...x.tiers[tier], [key]: id } } }));
  const modelsChanged = ready && (JSON.stringify(s.tiers) !== JSON.stringify(base.tiers) || JSON.stringify(s.providers) !== JSON.stringify(base.providers) || JSON.stringify(s.taskTier) !== JSON.stringify(base.taskTier));

  const save = () => {
    if (!mayEdit) { toast(why('ai-configure'), { tone: 'info' }); return; }
    if (!Object.values(s.providers).some(Boolean)) { toast('Keep at least one provider on.', { tone: 'error' }); return; }
    const commit = () => { saveModels(s); setBase(s); logAi({ kind: 'settings', title: 'Models & limits changed', detail: modelsChanged ? 'Models changed after the test set passed' : 'Budget, limits or security', by: me.name }); toast('Saved.'); };
    if (!modelsChanged) { commit(); return; }
    // a model change goes live only after the test set passes with the new models
    setBusy(true);
    const before = getModels();
    saveModels(s);
    window.setTimeout(() => {
      const r = runAll(me.name);
      setBusy(false);
      if (r.critical) { saveModels(before); toast(`Not saved: ${r.critical} critical test${r.critical === 1 ? '' : 's'} failed with the new models. See Test AI.`, { tone: 'error' }); return; }
      commit();
      toast(`Tests passed (${r.passed} of ${r.total}). The new models are live.`);
    }, 700);
  };
  const reset = async () => {
    if (!(await confirmDialog({ title: 'Go back to the GridCommerce defaults?', body: 'Providers, models, budget, limits and security switches return to the defaults.', confirmLabel: 'Reset' }))) return;
    resetModels(); const v = getModels(); setS(v); setBase(v); toast('Back to the defaults.');
  };
  const options = (tier) => CATALOG.filter((m) => s.providers[m.provider]).map((m) => <option key={m.id} value={m.id}>{m.name} · {usd(m)}</option>);

  return (
    <GaFrame screen="AiModels" active="ai-behaviour" page="Settings" css={CSS} after={dirty ? (
      <div className="md-bar" role="region" aria-label="Unsaved changes"><span>{modelsChanged ? 'Model changes run the test set before they go live.' : 'Unsaved changes'}</span><button type="button" className="ix-btn" onClick={() => setS(base)}>Discard</button><button type="button" className="ix-btn ix-btn--primary" onClick={save} disabled={busy}>{busy ? 'Testing…' : 'Save'}</button></div>
    ) : null}>
      <ShopHeader icon="sliders-horizontal" title="Settings"
        about="Grid AI uses more than one AI provider so the shop never depends on one. Each kind of task runs on the cheapest model that does it well: rules for greetings and opt-outs, an efficient model for FAQs and summaries, a standard one for selling and orders, a reasoning one for business questions. Prices are per million tokens, in US dollars, as charged by the provider."
        secondary={[{ label: 'Reset to defaults', onClick: reset }]}
        primary={{ label: busy ? 'Testing…' : 'Save', onClick: save, disabled: !dirty || !mayEdit || busy }} />
      <AiSettingsTabs on="models" />
      {!ready ? <div style={{ minHeight: 300 }} aria-busy="true" /> : (<>
        {!mayEdit ? <p className="ga-locked" style={{ margin: 0 }}><Icon name="lock" width="13" height="13" aria-hidden="true" />{why('ai-configure')}</p> : null}

        <section className="ix-card md-card" aria-labelledby="md-p-h">
          <div className="ix-card__head"><h2 id="md-p-h">Providers <InfoTip text="Keys are kept on the server and never shown in the browser. Customer details are masked before text is sent, and providers are used under no-training terms." /></h2></div>
          {PROVIDERS.map((p) => (
            <div key={p.id} className="md-prov">
              <BrandLogo brand={p.brand} size={32} decorative />
              <span><b>{p.name}</b><small>{p.note}</small></span>
              <StatusBadge tone={s.providers[p.id] ? 'success' : 'neutral'}>{s.providers[p.id] ? 'Connected' : 'Off'}</StatusBadge>
              <Switch on={s.providers[p.id]} onToggle={() => set({ providers: { ...s.providers, [p.id]: !s.providers[p.id] } })} label={'Use ' + p.name} disabled={!mayEdit} />
            </div>
          ))}
        </section>

        <section className="ix-card" aria-labelledby="md-t-h">
          <div className="ix-card__head"><h2 id="md-t-h">Models by tier <InfoTip text="When the main model’s provider is off or fails, the fallback answers. Choose the fallback from another provider." /></h2></div>
          <div className="ix-table-wrap ix-table-wrap--show">
            <table className="ix-table ix-table--static gc-table--keep md-tier">
              <caption className="sr-only">Models by tier</caption>
              <thead><tr><th scope="col">Tier</th><th scope="col">Used for</th><th scope="col">Main model</th><th scope="col">Fallback</th></tr></thead>
              <tbody>
                <tr><td><b style={{ fontWeight: 'var(--weight-medium)' }}>0 · Rules</b></td><td className="ix-muted">{TIERS[0].use}</td><td className="ix-muted" colSpan={2}>No model, no cost</td></tr>
                {TIERS.filter((t) => t.tier).map((t) => (
                  <tr key={t.tier}>
                    <td><b style={{ fontWeight: 'var(--weight-medium)' }}>{t.tier} · {t.name}</b></td>
                    <td className="ix-muted">{t.use}</td>
                    <td><select className="gc-input gc-select" aria-label={'Main model for tier ' + t.tier} value={s.tiers[t.tier].main} disabled={!mayEdit} onChange={(e) => setTier(t.tier, 'main', e.target.value)}>{options(t.tier)}</select></td>
                    <td><select className="gc-input gc-select" aria-label={'Fallback model for tier ' + t.tier} value={s.tiers[t.tier].fallback} disabled={!mayEdit} onChange={(e) => setTier(t.tier, 'fallback', e.target.value)}>{options(t.tier)}</select>{modelBy(s.tiers[t.tier].main) && modelBy(s.tiers[t.tier].fallback) && modelBy(s.tiers[t.tier].main).provider === modelBy(s.tiers[t.tier].fallback).provider ? <small className="ix-muted" style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-warning)' }}>Same provider as the main model</small> : null}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="ix-card" aria-labelledby="md-k-h">
          <div className="ix-card__head"><h2 id="md-k-h">Which tier does what</h2></div>
          <div className="ix-table-wrap ix-table-wrap--show">
            <table className="ix-table ix-table--static">
              <caption className="sr-only">Tier per task</caption>
              <thead><tr><th scope="col">Task</th><th scope="col">Tier</th></tr></thead>
              <tbody>{TASKS.map(([k, l, def]) => (
                <tr key={k}><td>{l}</td><td><select className="ix-pick" aria-label={'Tier for ' + l} value={s.taskTier[k] != null ? s.taskTier[k] : def} disabled={!mayEdit} onChange={(e) => set({ taskTier: { ...s.taskTier, [k]: Number(e.target.value) } })}>{TIERS.map((t) => <option key={t.tier} value={t.tier}>{t.tier} · {t.name}{t.tier === def ? ' (default)' : ''}</option>)}</select></td></tr>
              ))}</tbody>
            </table>
          </div>
        </section>

        <section className="ix-card md-card" aria-labelledby="md-b-h">
          <div className="ix-card__head"><h2 id="md-b-h">Budget and limits</h2></div>
          <div className="md-body">
            <div className="md-row3">
              <Field label="Monthly budget (৳)" htmlFor="md-budget" help={'About $' + Math.round(s.budget / USD_BDT) + ' at ৳' + USD_BDT + ' a dollar'}><input id="md-budget" type="number" min="0" className="gc-input" value={s.budget} disabled={!mayEdit} onChange={(e) => set({ budget: Number(e.target.value) || 0 })} /></Field>
              <Field label="Warn at (%)" htmlFor="md-alert"><input id="md-alert" type="number" min="10" max="100" className="gc-input" value={s.alertAt} disabled={!mayEdit} onChange={(e) => set({ alertAt: Number(e.target.value) || 80 })} /></Field>
              <Field label="At the limit" htmlFor="md-limit"><select id="md-limit" className="gc-input gc-select" value={s.atLimit} disabled={!mayEdit} onChange={(e) => set({ atLimit: e.target.value })}><option value="copilot">Autopilot stops, Copilot drafts go on</option><option value="stop">All AI stops until next month</option></select></Field>
            </div>
            <div className="md-row3">
              <Field label="Tool calls per customer reply" htmlFor="md-tools" help="The AI stops and hands over after this many."><input id="md-tools" type="number" min="1" max="6" className="gc-input" value={s.maxTools} disabled={!mayEdit} onChange={(e) => set({ maxTools: Number(e.target.value) || 3 })} /></Field>
              <Field label="Most a single answer may cost (৳)" htmlFor="md-cap"><input id="md-cap" type="number" min="0" step="0.5" className="gc-input" value={s.turnCap} disabled={!mayEdit} onChange={(e) => set({ turnCap: Number(e.target.value) || 0 })} /></Field>
              <Field label="AI replies a minute (whole shop)" htmlFor="md-rate" help="Protects against message loops."><input id="md-rate" type="number" min="1" className="gc-input" value={s.perMinute} disabled={!mayEdit} onChange={(e) => set({ perMinute: Number(e.target.value) || 30 })} /></Field>
            </div>
          </div>
        </section>

        <section className="ix-card md-card" aria-labelledby="md-s-h">
          <div className="ix-card__head"><h2 id="md-s-h">Security and privacy</h2></div>
          <div className="md-body" style={{ gap: 0 }}>
            <div className="ga-sw"><span>Mask personal details<small>Phone numbers and addresses are replaced before text goes to a model, except when an order needs them.</small></span><Switch on={s.maskPersonal} onToggle={() => set({ maskPersonal: !s.maskPersonal })} label="Mask personal details" disabled={!mayEdit} /></div>
            <div className="ga-sw"><span>Links to your own shop only<small>The AI never sends a link to another website.</small></span><Switch on={s.ownLinks} onToggle={() => set({ ownLinks: !s.ownLinks })} label="Links to your own shop only" disabled={!mayEdit} /></div>
            <div className="ga-sw"><span>Block instructions inside messages<small>Messages and documents can’t change the AI’s rules, prices or tools. Attempts are logged.</small></span><Switch on={s.injection} onToggle={() => set({ injection: !s.injection })} label="Block instructions inside messages" disabled={!mayEdit} /></div>
            <div className="ga-sw"><span>No-training terms only<small>Providers may not train their models on your shop’s data.</small></span><Switch on={s.noTraining} onToggle={() => set({ noTraining: !s.noTraining })} label="No-training terms only" disabled={!mayEdit} /></div>
            <div className="ga-sw"><span>Keep AI traces for<small>Traces show how each answer was made, with personal details masked.</small></span><select className="ix-pick" aria-label="Keep AI traces for" value={s.retentionDays} disabled={!mayEdit} onChange={(e) => set({ retentionDays: Number(e.target.value) })}>{[30, 90, 180, 365].map((d) => <option key={d} value={d}>{d} days</option>)}</select></div>
          </div>
        </section>
      </>)}
    </GaFrame>
  );
}
