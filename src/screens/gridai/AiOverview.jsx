'use client';
// Grid AI › Overview — the AI at a glance: the week's figures (conversations handled, drafts accepted, AI orders, spend
// against the budget), what needs a person (approvals, corrections, failed tests, knowledge to fix, budget), where the AI
// works (Inbox, assistant, automations) and the nine agents with their state. Data: lib/gridai/* (usage, agents,
// approvals, quality, evals, knowledge) and lib/aiReply.js. Figures are worked out after mount (they depend on today).

import React from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { StatusBadge } from '@/components/ui';
import { ShopHeader, MetricStrip } from '@/components/ui/IndexKit';
import { ModuleSetup } from '@/components/ModuleSetup';
import { formatBDT } from '@/lib/format';
import { getAgents, AGENTS_EVENT } from '@/lib/gridai/agents';
import { days, sumDays, budgetState, USAGE_EVENT } from '@/lib/gridai/usage';
import { getApprovals, APPROVALS_EVENT } from '@/lib/gridai/aiApprovals';
import { getCorrections, QUALITY_EVENT } from '@/lib/gridai/quality';
import { lastRun, releaseGate, EVALS_EVENT } from '@/lib/gridai/evals';
import { getSources, KB_EVENT } from '@/lib/gridai/knowledge';
import { getRules, RULES_EVENT } from '@/lib/automationRules';
import { getAiSettings, shopControl, AI_CONTROL_WORD, AI_EVENT } from '@/lib/aiReply';
import { getModels, modelFor, MODELS_EVENT } from '@/lib/gridai/models';
import { GaFrame, useLive } from './gaShared';

const CSS = `
.ov-grid{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:var(--space-4);align-items:start}
.ov-col{display:flex;flex-direction:column;gap:var(--space-4);min-width:0}
.ov-head{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-subtle)}
.ov-head h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ov-todo{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.ov-todo a{display:flex;align-items:center;gap:var(--space-3);min-height:52px;padding:var(--space-2) var(--space-4);border-top:1px solid var(--border-subtle);color:inherit;text-decoration:none;font-size:var(--text-sm)}
.ov-todo li:first-child a{border-top:0}
.ov-todo a:hover{background:var(--surface-subtle)}
.ov-todo b{font-weight:var(--weight-medium);color:var(--text-heading)}
.ov-todo small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.ov-todo .ov-n{margin-left:auto;font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ov-ico{display:grid;flex:none;place-items:center;width:32px;height:32px;border-radius:var(--radius-md);background:var(--surface-subtle);color:var(--text-body)}
.ov-ico.is-warn{background:var(--fill-warning-soft);color:var(--text-warning)}
.ov-ico.is-bad{background:var(--fill-error-soft);color:var(--text-danger)}
.ov-ico.is-ai{background:var(--fill-primary-soft);color:var(--primary)}
.ov-clear{display:flex;align-items:center;gap:var(--space-2);margin:0;padding:var(--space-4);font-size:var(--text-sm);color:var(--text-success)}
.ov-agents{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.ov-agents li{display:flex;align-items:center;gap:var(--space-3);min-height:48px;padding:var(--space-2) var(--space-4);border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.ov-agents li:first-child{border-top:0}
.ov-agents li>span:nth-child(2){flex:1;min-width:0}
.ov-agents b{display:block;font-weight:var(--weight-medium);color:var(--text-heading)}
.ov-agents small{font-size:var(--text-xs);color:var(--text-muted)}
.ov-cost{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.ov-where{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0}
.ov-where a{display:flex;flex-direction:column;gap:4px;padding:var(--space-4);border-left:1px solid var(--border-subtle);color:inherit;text-decoration:none}
.ov-where a:first-child{border-left:0}
.ov-where a:hover{background:var(--surface-subtle)}
.ov-where b{display:flex;align-items:center;gap:6px;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ov-where span{font-size:var(--text-xs);color:var(--text-muted);line-height:1.5}
.ov-budget{padding:var(--space-4);display:flex;flex-direction:column;gap:var(--space-2)}
.ov-bar{height:8px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.ov-bar i{display:block;height:100%;border-radius:var(--radius-full);background:var(--primary)}
.ov-bar.is-warn i{background:var(--warning)}.ov-bar.is-over i{background:var(--error)}
.ov-budget p{margin:0;display:flex;justify-content:space-between;gap:var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.ov-budget p b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
@media (max-width:1023px){.ov-grid{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){.ov-where{grid-template-columns:minmax(0,1fr)}.ov-where a{border-left:0;border-top:1px solid var(--border-subtle)}.ov-where a:first-child{border-top:0}}
`;

const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

export default function Overview() {
  const d = useLive(() => {
    const now = Date.now();
    const week = sumDays(days(7, now));
    const prev = sumDays(days(14, now).slice(0, 7));
    const agents = getAgents();
    const ap = getApprovals().filter((r) => r.status === 'waiting');
    const corr = getCorrections().filter((c) => c.status === 'waiting');
    const run = lastRun();
    const kb = getSources().filter((s) => s.status === 'failed' || s.status === 'review');
    const rules = getRules().filter((r) => r.cat === 'ai');
    const m = getModels();
    return { week, prev, agents, ap, corr, run, gate: releaseGate(), kb, rules, budget: budgetState(now), ctl: shopControl(getAiSettings()), main: modelFor(2, m), byAgent: week.byAgent };
  }, [AGENTS_EVENT, USAGE_EVENT, APPROVALS_EVENT, QUALITY_EVENT, EVALS_EVENT, KB_EVENT, RULES_EVENT, AI_EVENT, MODELS_EVENT]);
  const ready = !!d;
  const w = ready ? d.week : null;
  const change = (a, b) => (b ? Math.round(((a - b) / b) * 100) : 0);
  const todo = ready ? [
    d.ap.length ? { href: '/ai-activity', icon: 'shield-check', tone: 'is-warn', title: 'Approve AI actions', sub: d.ap.slice(0, 2).map((r) => r.title).join(' · '), n: d.ap.length } : null,
    d.corr.length ? { href: '/ai-knowledge#corrections', icon: 'pencil-line', tone: 'is-warn', title: 'Review corrections', sub: 'Staff corrected the AI; check before it learns', n: d.corr.length } : null,
    !d.run ? { href: '/ai-test?tab=cases', icon: 'flask-conical', tone: 'is-ai', title: 'Run the test set', sub: 'Check prices, stock, Bangla and safety before you switch Autopilot on', n: '' } : d.run.critical ? { href: '/ai-test?tab=cases', icon: 'flask-conical', tone: 'is-bad', title: 'Fix failed tests', sub: d.gate.why, n: d.run.critical } : null,
    d.kb.length ? { href: '/ai-knowledge', icon: 'book-open', tone: 'is-warn', title: 'Fix knowledge sources', sub: d.kb.map((s) => s.name).slice(0, 2).join(' · '), n: d.kb.length } : null,
    d.budget.state !== 'ok' ? { href: '/ai-usage', icon: 'wallet', tone: d.budget.state === 'over' ? 'is-bad' : 'is-warn', title: d.budget.state === 'over' ? 'AI budget used up' : 'AI budget at ' + d.budget.pct + '%', sub: d.budget.state === 'over' ? 'Autopilot is paused; drafts go on' : 'Raise the budget or lower the tiers', n: '' } : null,
  ].filter(Boolean) : [];

  return (
    <GaFrame screen="AiOverview" active="ai-overview" page="Overview" css={CSS}>
      <ShopHeader icon="sparkles" title="Grid AI"
        about="Grid AI is one assistant for the whole shop. In the Inbox it drafts replies (Copilot) or answers simple questions by itself (Autopilot), suggests products from the live catalogue, takes orders and spots leads. For the team it answers business questions from the shop’s own books. It only uses tools it is allowed, high-risk actions wait for a person, and every answer can be traced and rated."
        secondary={[{ label: 'Test AI', href: '/ai-test' }]}
        more={[{ label: 'Knowledge & training', href: '/ai-knowledge' }, { label: 'Settings', href: '/ai-behaviour' }, { label: 'Usage & billing', href: '/ai-usage' }]}
        primary={{ label: 'Ask GridAI', href: '/grid-ai' }} />
      <ModuleSetup area="area-gridai" />
      <MetricStrip label="Last 7 days" items={[
        { label: 'Conversations GridAI handled', value: ready ? w.aiHandled.toLocaleString('en-IN') : '—', sub: ready ? pct(w.aiHandled, w.convs) + '% of all · ' + (change(w.aiHandled, d.prev.aiHandled) >= 0 ? '+' : '') + change(w.aiHandled, d.prev.aiHandled) + '%' : '', icon: 'bot' },
        { label: 'Drafts accepted', value: ready ? pct(w.accepted + w.edited, w.drafts) + '%' : '—', sub: ready ? w.accepted.toLocaleString('en-IN') + ' as written, ' + w.edited + ' edited' : '', icon: 'wand-sparkles' },
        { label: 'Orders from chats', value: ready ? String(w.aiOrders) : '—', sub: ready ? formatBDT(w.aiRevenue) : '', icon: 'shopping-bag' },
        { label: 'AI spend this month', value: ready ? formatBDT(d.budget.spent) : '—', sub: ready ? d.budget.pct + '% of ' + formatBDT(d.budget.budget) : '', icon: 'wallet', href: '/ai-usage' },
      ]} />

      <section className="ix-card" aria-label="Where GridAI works">
        <div className="ov-where">
          <Link href="/merchant-inbox"><b><Icon name="inbox" width="16" height="16" aria-hidden="true" />Inbox</b><span>{ready ? 'Shop default: ' + AI_CONTROL_WORD[d.ctl] + (d.ctl === 'assist' ? ' (Copilot drafts, a person sends)' : d.ctl === 'auto' ? ' (Autopilot for simple questions)' : '') : ''}</span></Link>
          <Link href="/grid-ai"><b><Icon name="message-square-text" width="16" height="16" aria-hidden="true" />Assistant</b><span>Ask about sales, orders, stock and follow-ups in Bangla or English. Answers follow each person’s access.</span></Link>
          <Link href="/ai-automations"><b><Icon name="workflow" width="16" height="16" aria-hidden="true" />Automations</b><span>{ready ? d.rules.filter((r) => r.on).length + ' of ' + d.rules.length + ' on · follow-ups, leads, hand-overs, restock' : ''}</span></Link>
        </div>
      </section>

      <div className="ov-grid">
        <div className="ov-col">
          <section className="ix-card" aria-labelledby="ov-todo-h">
            <div className="ov-head"><h2 id="ov-todo-h">Needs you</h2>{ready && todo.length ? <StatusBadge tone="warning">{todo.length}</StatusBadge> : null}</div>
            {!ready ? <div style={{ minHeight: 120 }} aria-busy="true" /> : todo.length ? (
              <ul className="ov-todo">{todo.map((t) => (
                <li key={t.title}><Link href={t.href}><span className={'ov-ico ' + t.tone} aria-hidden="true"><Icon name={t.icon} width="16" height="16" /></span><span><b>{t.title}</b><small>{t.sub}</small></span>{t.n !== '' ? <span className="ov-n">{t.n}</span> : <Icon name="chevron-right" width="16" height="16" aria-hidden="true" style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />}</Link></li>
              ))}</ul>
            ) : <p className="ov-clear"><Icon name="circle-check" width="16" height="16" aria-hidden="true" />Nothing waiting. GridAI is running within its limits.</p>}
          </section>
          <section className="ix-card" aria-labelledby="ov-ag-h">
            <div className="ov-head"><h2 id="ov-ag-h">Agents</h2><Link className="ix-btn ix-btn--sm ix-btn--plain" href="/ai-agents">Manage</Link></div>
            <ul className="ov-agents">{(ready ? d.agents : []).map((a) => (
              <li key={a.id}>
                <span className="ov-ico is-ai" aria-hidden="true"><Icon name={a.icon} width="16" height="16" /></span>
                <span><b>{a.name}</b><small>{a.surface === 'customer' ? 'Answers customers' : 'Helps the team'} · tier {a.tier}</small></span>
                <span className="ov-cost">{formatBDT(Math.round(d.byAgent[a.id] || 0))} · 7 days</span>
                <StatusBadge tone={a.on ? 'success' : 'neutral'}>{a.on ? 'On' : 'Off'}</StatusBadge>
              </li>
            ))}</ul>
          </section>
        </div>
        <div className="ov-col">
          <section className="ix-card" aria-labelledby="ov-b-h">
            <div className="ov-head"><h2 id="ov-b-h">This month’s AI budget</h2><Link className="ix-btn ix-btn--sm ix-btn--plain" href="/ai-usage">Details</Link></div>
            {ready ? (
              <div className="ov-budget">
                <div className={'ov-bar' + (d.budget.state === 'warn' ? ' is-warn' : d.budget.state === 'over' ? ' is-over' : '')} role="progressbar" aria-label="Budget used" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.min(100, d.budget.pct)}><i style={{ width: Math.min(100, d.budget.pct) + '%' }} /></div>
                <p><span>Spent</span><b>{formatBDT(d.budget.spent)} of {formatBDT(d.budget.budget)}</b></p>
                <p><span>Cost per conversation</span><b>{formatBDT(Math.round((w.cost / Math.max(1, w.convs)) * 100) / 100, { decimals: 2 })}</b></p>
                <p><span>Main model for replies</span><b>{d.main.name}</b></p>
              </div>
            ) : <div style={{ minHeight: 100 }} aria-busy="true" />}
          </section>
          <section className="ix-card" aria-labelledby="ov-q-h">
            <div className="ov-head"><h2 id="ov-q-h">Quality</h2><Link className="ix-btn ix-btn--sm ix-btn--plain" href="/ai-analytics">Analytics</Link></div>
            {ready ? (
              <div className="ov-budget">
                <p><span>Last test run</span><b>{d.run ? d.run.passed + ' of ' + d.run.total + ' passed' : 'Not run yet'}</b></p>
                <p><span>Handed to a person</span><b>{pct(w.escalations, w.aiHandled)}%</b></p>
                <p><span>First reply (AI)</span><b>{w.firstReply} s</b></p>
                <p><span>Safety incidents</span><b>{w.unsafe}</b></p>
              </div>
            ) : <div style={{ minHeight: 100 }} aria-busy="true" />}
          </section>
        </div>
      </div>
    </GaFrame>
  );
}
