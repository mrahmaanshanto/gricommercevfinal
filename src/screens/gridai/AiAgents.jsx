'use client';
// Grid AI › Agents — the nine jobs of the one shared engine. A list (who it serves, tools, knowledge, model tier, risk,
// 7-day cost, on/off); a row opens the agent in a side panel: purpose, how it answers, when it hands over, the knowledge
// and tools it may use (each tool with its risk level), model tier, risk, limits, and "Test this agent".
// Changing an agent needs "Configure Grid AI". Data: lib/gridai/agents.js; tools from engine.js › TOOLS.

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { Sheet, StatusBadge, InfoTip } from '@/components/ui';
import { ShopHeader, IndexTabs } from '@/components/ui/IndexKit';
import { toast } from '@/runtime/ui';
import { formatBDT } from '@/lib/format';
import { currentUser } from '@/lib/team';
import { can, why, PERMS_EVENT } from '@/lib/permissions';
import { getAgents, saveAgent, setAgentOn, resetAgent, RISK_WORD, AGENTS_EVENT } from '@/lib/gridai/agents';
import { TOOLS, RISK_LEVEL } from '@/lib/gridai/engine';
import { CATEGORIES } from '@/lib/gridai/knowledge';
import { TIERS, modelFor, MODELS_EVENT } from '@/lib/gridai/models';
import { days, sumDays, USAGE_EVENT } from '@/lib/gridai/usage';
import { GaFrame, Switch, Field, useLive } from './gaShared';

const CSS = `
.ag-name{display:flex;align-items:center;gap:10px;min-width:0}
.ag-ico{display:grid;flex:none;place-items:center;width:32px;height:32px;border-radius:var(--radius-md);background:var(--fill-primary-soft);color:var(--primary)}
.ag-name b{display:block;font-weight:var(--weight-medium);color:var(--text-heading)}
.ag-name small{display:block;max-width:360px;overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.ag-off td{color:var(--text-muted)}
.ag-checks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px var(--space-3)}
.ag-checks label{display:flex;align-items:flex-start;gap:8px;min-height:32px;padding:4px 0;font-size:var(--text-sm);color:var(--text-body);cursor:pointer}
.ag-checks label small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.ag-checks input{margin-top:2px}
.ag-foot{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);width:100%}
.ag-foot>.ag-left{margin-right:auto}
@media (max-width:640px){.ag-checks{grid-template-columns:minmax(0,1fr)}}
`;
const TABS = [['all', 'All'], ['customer', 'Answer customers'], ['merchant', 'Help the team']];

export default function Agents() {
  const data = useLive(() => ({ agents: getAgents(), me: currentUser(), cost: sumDays(days(7)).byAgent }), [AGENTS_EVENT, PERMS_EVENT, MODELS_EVENT, USAGE_EVENT]);
  const [tab, setTab] = useState('all');
  const [edit, setEdit] = useState(null);
  const ready = !!data;
  const mayEdit = ready && can(data.me, 'ai-configure');
  const list = ready ? data.agents.filter((a) => tab === 'all' || a.surface === tab) : [];
  const tabs = TABS.map(([k, l]) => ({ key: k, id: 'ag-tab-' + k, label: l, count: ready ? data.agents.filter((a) => k === 'all' || a.surface === k).length : null, on: tab === k, onClick: () => setTab(k) }));
  const locked = () => toast(why('ai-configure'), { tone: 'info' });
  const toggle = (a) => { if (!mayEdit) { locked(); return; } setAgentOn(a.id, !a.on, data.me.name); toast(a.name + (a.on ? ' agent is off. Its questions go to a person.' : ' agent is on.')); };
  const open = (a) => setEdit({ ...a, tools: [...a.tools], knowledge: [...a.knowledge] });
  const flip = (k, v) => setEdit((e) => ({ ...e, [k]: e[k].includes(v) ? e[k].filter((x) => x !== v) : [...e[k], v] }));
  const save = () => {
    const { id, purpose, instructions, escalate, tools, knowledge, tier, risk, maxReplies, monthly, on } = edit;
    saveAgent(id, { purpose, instructions, escalate, tools, knowledge, tier: Number(tier), risk, maxReplies: Number(maxReplies) || 0, monthly: Number(monthly) || 0, on }, data.me.name);
    toast(edit.name + ' agent saved.');
    setEdit(null);
  };
  const tools = edit ? TOOLS.filter((t) => t.surface === 'both' || t.surface === edit.surface) : [];

  return (
    <GaFrame screen="AiAgents" active="ai-agents" page="Agents" css={CSS} after={(
      <Sheet open={!!edit} title={edit ? edit.name + ' agent' : ''} onClose={() => setEdit(null)}
        footer={edit ? <div className="ag-foot"><span className="ag-left"><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" disabled={!mayEdit} onClick={() => { resetAgent(edit.id); setEdit(null); toast('Back to the GridCommerce defaults.'); }}>Reset</button></span><Link className="gc-btn gc-btn--sm gc-btn--neutral" href={'/ai-test?agent=' + (edit ? edit.id : '')}>Test this agent</Link><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" disabled={!mayEdit} onClick={save}>Save</button></div> : null}>
        {edit ? (
          <div className="ga-body" style={{ padding: 0 }}>
            <div className="ga-sw" style={{ borderTop: 0 }}><span>Agent is on<small>{edit.surface === 'customer' ? 'When off, its questions are drafted for a person instead.' : 'When off, the assistant doesn’t answer these questions.'}</small></span><Switch on={edit.on} onToggle={() => setEdit({ ...edit, on: !edit.on })} label={'Use the ' + edit.name + ' agent'} disabled={!mayEdit} /></div>
            <Field label="Purpose" htmlFor="ag-purpose"><textarea id="ag-purpose" className="gc-input ga-area" rows={3} value={edit.purpose} disabled={!mayEdit} onChange={(e) => setEdit({ ...edit, purpose: e.target.value })} /></Field>
            <Field label="How it answers" optional htmlFor="ag-instr" help="Added to the shop’s voice in Behaviour. Example: keep it under three sentences; always offer cash on delivery."><textarea id="ag-instr" className="gc-input ga-area" rows={3} value={edit.instructions} disabled={!mayEdit} onChange={(e) => setEdit({ ...edit, instructions: e.target.value })} /></Field>
            <Field label="When it hands over" htmlFor="ag-esc"><textarea id="ag-esc" className="gc-input ga-area" rows={2} value={edit.escalate} disabled={!mayEdit} onChange={(e) => setEdit({ ...edit, escalate: e.target.value })} /></Field>
            <fieldset className="ga-field" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="gc-label">Tools it may use <InfoTip text="Level 1 reads, level 2 drafts, level 3 acts only when switched on, level 4 always waits for a person. A tool the agent may not use is never offered to the model." /></legend>
              <div className="ag-checks">{tools.map((t) => (
                <label key={t.id}><input type="checkbox" className="gc-check" checked={edit.tools.includes(t.id)} disabled={!mayEdit} onChange={() => flip('tools', t.id)} /><span>{t.label}<small>Level {t.risk} · {RISK_LEVEL[t.risk][0]} · {t.area}</small></span></label>
              ))}</div>
            </fieldset>
            <fieldset className="ga-field" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="gc-label">Knowledge it may read</legend>
              <div className="ag-checks">{CATEGORIES.map(([k, l]) => (
                <label key={k}><input type="checkbox" className="gc-check" checked={edit.knowledge.includes(k)} disabled={!mayEdit} onChange={() => flip('knowledge', k)} /><span>{l}</span></label>
              ))}</div>
            </fieldset>
            <div className="ga-row">
              <Field label="Model tier" htmlFor="ag-tier" help={'Now: ' + modelFor(Number(edit.tier)).name}><select id="ag-tier" className="gc-input gc-select" value={edit.tier} disabled={!mayEdit} onChange={(e) => setEdit({ ...edit, tier: e.target.value })}>{TIERS.filter((t) => t.tier).map((t) => <option key={t.tier} value={t.tier}>{t.tier} · {t.name}</option>)}</select></Field>
              <Field label="Risk" htmlFor="ag-risk"><select id="ag-risk" className="gc-input gc-select" value={edit.risk} disabled={!mayEdit} onChange={(e) => setEdit({ ...edit, risk: e.target.value })}>{Object.entries(RISK_WORD).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}</select></Field>
              <Field label="AI replies per conversation" optional htmlFor="ag-max" help="0 = no limit. After it, a person takes over."><input id="ag-max" type="number" min="0" className="gc-input" value={edit.maxReplies} disabled={!mayEdit} onChange={(e) => setEdit({ ...edit, maxReplies: e.target.value })} /></Field>
              <Field label="Monthly limit (৳)" optional htmlFor="ag-month" help="0 = the shop budget only."><input id="ag-month" type="number" min="0" className="gc-input" value={edit.monthly} disabled={!mayEdit} onChange={(e) => setEdit({ ...edit, monthly: e.target.value })} /></Field>
            </div>
          </div>
        ) : null}
      </Sheet>
    )}>
      <ShopHeader icon="bot" title="Agents"
        about="Agents are jobs of the same Grid AI engine, not separate AIs. Each has a purpose, the knowledge and tools it may use, how it answers, when it hands over, its model tier and limits. The engine picks the agent from what the message is about."
        secondary={[{ label: 'Test AI', href: '/ai-test' }]}
        more={[{ label: 'Models & limits', href: '/ai-models' }, { label: 'Behaviour', href: '/ai-behaviour' }]} />
      <section className="ix-card" aria-label="Agents">
        <div className="ix-bar"><IndexTabs tabs={tabs} label="Agents" /></div>
        {!ready ? <div style={{ minHeight: 240 }} aria-busy="true" /> : (<>
          <ul className="ix-plist" aria-label="Agents">
            {list.map((a) => (
              <li key={a.id}><button type="button" className="ix-pitem" onClick={() => open(a)}>
                <span className="ix-pitem__top"><b>{a.name}</b><StatusBadge tone={a.on ? 'success' : 'neutral'}>{a.on ? 'On' : 'Off'}</StatusBadge></span>
                <span className="ix-pitem__mid">{a.tools.length} tools · tier {a.tier} · {formatBDT(Math.round(data.cost[a.id] || 0))} in 7 days</span>
              </button></li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table">
              <caption className="sr-only">Agents</caption>
              <thead><tr><th scope="col">Agent</th><th scope="col">Serves</th><th scope="col" className="ix-num">Tools</th><th scope="col">Model tier</th><th scope="col">Risk</th><th scope="col" className="ix-num">Cost · 7 days</th><th scope="col">On</th></tr></thead>
              <tbody>{list.map((a) => (
                <tr key={a.id} className={a.on ? '' : 'ag-off'} onClick={(e) => { if (!e.target.closest('button')) open(a); }}>
                  <td><span className="ag-name"><span className="ag-ico" aria-hidden="true"><Icon name={a.icon} width="16" height="16" /></span><span><button type="button" className="ix-strong" style={{ textAlign: 'left' }} onClick={() => open(a)}><b>{a.name}</b></button><small>{a.purpose}</small></span></span></td>
                  <td>{a.surface === 'customer' ? 'Customers' : 'Shop team'}</td>
                  <td className="ix-num">{a.tools.length}</td>
                  <td>{a.tier} · {(TIERS.find((t) => t.tier === Number(a.tier)) || {}).name}</td>
                  <td><StatusBadge tone={RISK_WORD[a.risk][1]}>{RISK_WORD[a.risk][0]}</StatusBadge></td>
                  <td className="ix-num">{formatBDT(Math.round(data.cost[a.id] || 0))}</td>
                  <td><Switch on={a.on} onToggle={() => toggle(a)} label={(a.on ? 'Turn off ' : 'Turn on ') + a.name} disabled={!mayEdit} /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>)}
        <div className="ix-foot"><span>{ready ? list.length + ' agents · one engine' : ''}</span>{ready && !mayEdit ? <span className="ga-locked"><Icon name="lock" width="13" height="13" aria-hidden="true" />{why('ai-configure')}</span> : null}</div>
      </section>
      <section className="ix-card" aria-labelledby="ag-tools-h">
        <div className="ix-card__head"><h2 id="ag-tools-h">Tools and risk levels <InfoTip text="Every action the AI can take goes through one of these tools. The tool checks the shop, the person or customer, permissions, the input and the rules on the server side, and writes an audit entry." /></h2></div>
        <div className="ix-table-wrap ix-table-wrap--show">
          <table className="ix-table ix-table--static">
            <caption className="sr-only">Tools</caption>
            <thead><tr><th scope="col">Tool</th><th scope="col">Area</th><th scope="col">For</th><th scope="col">Level</th><th scope="col">Policy</th></tr></thead>
            <tbody>{TOOLS.map((t) => (
              <tr key={t.id}><td><b style={{ fontWeight: 'var(--weight-medium)' }}>{t.label}</b></td><td className="ix-muted">{t.area}</td><td className="ix-muted">{t.surface === 'both' ? 'Customers and team' : t.surface === 'customer' ? 'Customers' : 'Team'}</td><td>{t.risk} · {RISK_LEVEL[t.risk][0]}</td><td className="ix-muted">{RISK_LEVEL[t.risk][1]}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </section>
    </GaFrame>
  );
}
