'use client';
// Grid AI › Automations — the AI's rules on the shop's one automation engine (lib/automationRules.js, category 'ai'):
// When (trigger) → if (conditions) → then (an agent's action, or a task). Each rule can be paused, opened, tested with a
// sample event (nothing is sent), duplicated, and has its versions and recent runs. Risk-4 actions (bulk messages) are
// only prepared and wait in Activity & approvals. Changing rules needs "Configure Grid AI".

import React, { useState } from 'react';
import { Icon } from '@/runtime/dc';
import { Sheet, StatusBadge } from '@/components/ui';
import { ShopHeader, IndexTabs } from '@/components/ui/IndexKit';
import { toast } from '@/runtime/ui';
import { formatDateTime } from '@/lib/format';
import { currentUser } from '@/lib/team';
import { can, why, PERMS_EVENT } from '@/lib/permissions';
import { getRules, setRuleOn, ruleVersions, restoreVersion, simulate, duplicateRule, runsOf, SAMPLE_EVENTS, TRIGGERS, RULES_EVENT } from '@/lib/automationRules';
import { agentBy } from '@/lib/gridai/agents';
import { GaFrame, Switch, useLive } from './gaShared';

const CSS = `
.au-when{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.au-off td{color:var(--text-muted)}
.au-flow{display:flex;flex-direction:column;margin:0;padding:0;list-style:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.au-flow li{display:flex;gap:var(--space-3);padding:var(--space-3);border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.au-flow li:first-child{border-top:0}
.au-flow small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.au-step{display:grid;flex:none;place-items:center;width:28px;height:28px;border-radius:var(--radius-full);background:var(--surface-subtle);color:var(--text-body)}
.au-step.is-ai{background:var(--fill-primary-soft);color:var(--primary)}
.au-step.is-bad{background:var(--fill-error-soft);color:var(--text-danger)}
.au-step.is-ok{background:var(--fill-success-soft);color:var(--text-success)}
.au-tabs{display:flex;gap:2px;border-bottom:1px solid var(--border-subtle)}
.au-tabs button{height:36px;padding:0 var(--space-3);border:0;border-bottom:2px solid transparent;background:none;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.au-tabs button[aria-selected="true"]{border-bottom-color:var(--primary);color:var(--primary)}
.au-foot{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);width:100%}
.au-foot>.au-left{margin-right:auto}
`;
const STEP_ICON = { trigger: 'zap', condition: 'filter', wait: 'hourglass', action: 'play', stop: 'octagon-x', note: 'info' };
const TABS = [['all', 'All'], ['on', 'Running'], ['off', 'Paused']];

export default function AiAutomations() {
  const data = useLive(() => ({ rules: getRules().filter((r) => r.cat === 'ai' || String(r.id).startsWith('copy-')), me: currentUser() }), [RULES_EVENT, PERMS_EVENT]);
  const [tab, setTab] = useState('all');
  const [openId, setOpenId] = useState('');
  const [pane, setPane] = useState('rule');
  const [ev, setEv] = useState('');
  const [sim, setSim] = useState(null);
  const ready = !!data;
  const mayEdit = ready && can(data.me, 'ai-configure');
  const list = ready ? data.rules.filter((r) => tab === 'all' || (tab === 'on' ? r.on : !r.on)) : [];
  const rule = ready && openId ? data.rules.find((r) => r.id === openId) : null;
  const locked = () => toast(why('ai-configure'), { tone: 'info' });
  const toggle = (r) => { if (!mayEdit) { locked(); return; } setRuleOn(r.id, !r.on); toast(r.name + (r.on ? ' paused.' : ' is running.')); };
  const open = (r) => { setOpenId(r.id); setPane('rule'); setSim(null); setEv(((SAMPLE_EVENTS[r.trigger] || [])[0] || {}).id || ''); };
  const test = () => { const e = (SAMPLE_EVENTS[rule.trigger] || []).find((x) => x.id === ev); setSim(simulate(rule, e)); };
  const tabs = TABS.map(([k, l]) => ({ key: k, id: 'au-tab-' + k, label: l, count: ready ? data.rules.filter((r) => k === 'all' || (k === 'on' ? r.on : !r.on)).length : null, on: tab === k, onClick: () => setTab(k) }));
  const thenText = (r) => r.actions.map((a) => (a.kind === 'ai' ? a.label : a.kind === 'task' ? a.label : 'Send a message')).join(' · ');

  return (
    <GaFrame screen="AiAutomations" active="ai-automations" page="Automations" css={CSS} after={(
      <Sheet open={!!rule} title={rule ? rule.name : ''} onClose={() => setOpenId('')}
        footer={rule ? <div className="au-foot"><span className="au-left"><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" disabled={!mayEdit} onClick={() => { const c = duplicateRule(rule.id); if (c) { setOpenId(c.id); toast('Copied. The copy is paused until you turn it on.'); } }}>Duplicate</button></span><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" disabled={!mayEdit} onClick={() => toggle(rule)}>{rule.on ? 'Pause' : 'Turn on'}</button></div> : null}>
        {rule ? (
          <div className="ga-body" style={{ padding: 0 }}>
            <div className="au-tabs" role="tablist" aria-label="Rule">
              {[['rule', 'Rule'], ['test', 'Test'], ['runs', 'Recent runs'], ['versions', 'Versions']].map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={pane === k} onClick={() => setPane(k)}>{l}</button>)}
            </div>
            {pane === 'rule' ? (
              <ol className="au-flow">
                <li><span className="au-step" aria-hidden="true"><Icon name="zap" width="14" height="14" /></span><span><b style={{ fontWeight: 'var(--weight-medium)' }}>When</b><small>{TRIGGERS[rule.trigger]}</small></span></li>
                {rule.conditions.map((c) => <li key={c.label}><span className="au-step" aria-hidden="true"><Icon name="filter" width="14" height="14" /></span><span><b style={{ fontWeight: 'var(--weight-medium)' }}>If</b><small>{c.label}</small></span></li>)}
                {rule.wait ? <li><span className="au-step" aria-hidden="true"><Icon name="hourglass" width="14" height="14" /></span><span><b style={{ fontWeight: 'var(--weight-medium)' }}>Wait</b><small>{rule.wait} hours</small></span></li> : null}
                {rule.actions.map((a, i) => <li key={i}><span className={'au-step' + (a.kind === 'ai' ? ' is-ai' : '')} aria-hidden="true"><Icon name={a.kind === 'ai' ? 'sparkles' : 'list-checks'} width="14" height="14" /></span><span><b style={{ fontWeight: 'var(--weight-medium)' }}>Then{a.kind === 'ai' && a.agent ? ' · ' + ((agentBy(a.agent) || {}).name || a.agent) + ' agent' : a.owner ? ' · ' + a.owner : ''}</b><small>{a.label}{a.risk === 4 ? ' · waits for approval' : a.risk === 2 ? ' · as a draft' : ''}</small></span></li>)}
              </ol>
            ) : null}
            {pane === 'test' ? (<>
              <div className="ga-field"><label className="gc-label" htmlFor="au-ev">Sample event</label>
                <select id="au-ev" className="gc-input gc-select" value={ev} onChange={(e) => { setEv(e.target.value); setSim(null); }}>{(SAMPLE_EVENTS[rule.trigger] || []).map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select>
              </div>
              <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" style={{ alignSelf: 'flex-start' }} onClick={test}><Icon name="play" width="14" height="14" aria-hidden="true" />Run the test</button>
              {sim ? (
                <ol className="au-flow" aria-label="Test result">{sim.steps.map((s, i) => (
                  <li key={i}><span className={'au-step' + (s.ok === false ? ' is-bad' : s.kind === 'action' ? ' is-ok' : '')} aria-hidden="true"><Icon name={STEP_ICON[s.kind] || 'dot'} width="14" height="14" /></span><span><b style={{ fontWeight: 'var(--weight-medium)' }}>{s.label}</b><small>{s.detail}</small></span></li>
                ))}</ol>
              ) : <p className="gc-help" style={{ margin: 0 }}>Nothing is sent and nothing changes.</p>}
            </>) : null}
            {pane === 'runs' ? (
              runsOf(rule.id).length ? <ol className="au-flow">{runsOf(rule.id).map((r, i) => <li key={i}><span className={'au-step' + (r.ok ? ' is-ok' : ' is-bad')} aria-hidden="true"><Icon name={r.ok ? 'check' : 'arrow-up-right'} width="14" height="14" /></span><span><b style={{ fontWeight: 'var(--weight-medium)' }}>{r.label}</b><small>{formatDateTime(new Date(r.at))} · {r.detail}</small></span></li>)}</ol>
                : <p className="gc-help" style={{ margin: 0 }}>This rule hasn’t run yet.</p>
            ) : null}
            {pane === 'versions' ? (
              <ol className="au-flow">{ruleVersions(rule.id).map((v) => <li key={v.v}><span className="au-step" aria-hidden="true">{v.v}</span><span style={{ flex: 1 }}><b style={{ fontWeight: 'var(--weight-medium)' }}>{v.note}</b><small>{formatDateTime(new Date(v.at))} · {v.by}{v.current ? ' · current' : ''}</small></span>{!v.current ? <button type="button" className="ix-btn ix-btn--sm" disabled={!mayEdit} onClick={() => { restoreVersion(rule.id, v.v, data.me.name); toast('Version ' + v.v + ' restored as a new version.'); }}>Restore</button> : null}</li>)}</ol>
            ) : null}
          </div>
        ) : null}
      </Sheet>
    )}>
      <ShopHeader icon="workflow" title="Automations"
        about="GridAI’s automations run on the shop’s one automation engine: when something happens, check the conditions and permissions, then let an agent act. Sending happens only within consent, quiet hours and channel windows; bulk messages and other high-risk actions are prepared and wait for a person. Pause a rule any time; every change keeps a version."
        more={[{ label: 'All automations', href: '/automations' }, { label: 'Activity & approvals', href: '/ai-activity' }]} />
      <section className="ix-card" aria-label="AI automations">
        <div className="ix-bar"><IndexTabs tabs={tabs} label="Automations" /></div>
        {!ready ? <div style={{ minHeight: 240 }} aria-busy="true" /> : (<>
          <ul className="ix-plist" aria-label="AI automations">{list.map((r) => (
            <li key={r.id}><button type="button" className="ix-pitem" onClick={() => open(r)}>
              <span className="ix-pitem__top"><b>{r.name}</b><StatusBadge tone={r.on ? 'success' : 'neutral'}>{r.on ? 'Running' : 'Paused'}</StatusBadge></span>
              <span className="ix-pitem__mid">When {String(TRIGGERS[r.trigger] || '').toLowerCase()} · {r.runs || 0} runs</span>
            </button></li>
          ))}</ul>
          <div className="ix-table-wrap">
            <table className="ix-table">
              <caption className="sr-only">AI automations</caption>
              <thead><tr><th scope="col">Automation</th><th scope="col">Then</th><th scope="col" className="ix-num">Runs · 30 days</th><th scope="col">Running</th></tr></thead>
              <tbody>{list.map((r) => (
                <tr key={r.id} className={r.on ? '' : 'au-off'} onClick={(e) => { if (!e.target.closest('button')) open(r); }}>
                  <td><button type="button" className="ix-strong" style={{ textAlign: 'left' }} onClick={() => open(r)}><b>{r.name}</b></button><span className="au-when">When {String(TRIGGERS[r.trigger] || '').toLowerCase()}</span></td>
                  <td className="ix-muted">{thenText(r)}</td>
                  <td className="ix-num">{r.runs || 0}</td>
                  <td><Switch on={r.on} onToggle={() => toggle(r)} label={(r.on ? 'Pause ' : 'Run ') + r.name} disabled={!mayEdit} /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>)}
        <div className="ix-foot"><span>{ready ? list.length + ' automations' : ''}</span>{ready && !mayEdit ? <span className="ga-locked"><Icon name="lock" width="13" height="13" aria-hidden="true" />{why('ai-configure')}</span> : null}</div>
      </section>
    </GaFrame>
  );
}
