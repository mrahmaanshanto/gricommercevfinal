'use client';
// Workflow builder — one rule of src/lib/automationRules.js on a canvas, in Shopify density (IndexKit RecordHeader).
// `/workflow-builder?id=<rule>` opens THAT rule; with no id it starts from a trigger picker (the triggers the engine
// supports: BUILDER_TRIGGERS). The canvas is drawn from the rule: trigger → conditions (IF; false = nothing happens) →
// wait → actions in order. Nodes open a panel on the right to change them; "Add node" / + offers only what the engine
// runs (conditions on the trigger's own fields, a wait, WhatsApp / SMS / email messages, a task for a team).
// Save writes through the lib (createRule for a new one, saveWorkflow = a new version for an existing one); Turn on / off
// is saved at once (setRuleOn); Delete (custom workflows only) asks first. Test workflow runs the lib's simulator on a
// sample event: nothing is sent. Executions lists the rule's recent runs (runsOf). Kept in this browser (front end only).
// Edit freely: this file is the source for the screen.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { toast, confirmDialog } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { StatusBadge, EmptyState } from '@/components/ui';
import { RecordHeader, IndexTabs } from '@/components/ui/IndexKit';
import {
  ruleBy, setRuleOn, createRule, saveWorkflow, deleteRule, duplicateRule, runsOf, simulate, validateRule,
  SAMPLE_EVENTS, TRIGGERS, BUILDER_TRIGGERS, CONDITION_FIELDS, fieldOf, conditionLabel, OP_LABEL, ACTION_KINDS, TASK_OWNERS,
  MESSAGE_CLASSES, catOfTrigger,
} from '@/lib/automationRules';
import { getTemplates } from '@/lib/messaging';
import { capsOf } from '@/lib/channelCaps';
import { formatDate, formatTime } from '@/lib/format';

// ---- logic ----

const SOFT = { primary: ['var(--fill-primary-soft)', 'var(--primary)'], info: ['var(--fill-info-soft)', 'var(--text-info)'], warning: ['var(--fill-warning-soft)', 'var(--text-warning)'], success: ['var(--fill-success-soft)', 'var(--text-success)'], neutral: ['var(--slate-100)', 'var(--slate-600)'], accent: ['var(--fill-accent-soft)', 'var(--accent-text)'], secondary: ['var(--fill-secondary-soft)', 'var(--secondary-focus)'] };
// node type → [tone, subtitle, icon]
const TY = {
  trig: ['primary', 'Trigger', 'zap'], if: ['info', 'Conditions', 'git-branch'], wait: ['neutral', 'Wait', 'clock'], stop: ['neutral', 'End', 'circle-x'],
  whatsapp: ['success', 'WhatsApp', 'message-circle'], sms: ['secondary', 'SMS', 'message-square'], email: ['accent', 'Email', 'mail'],
  task: ['warning', 'Task', 'bell'], ai: ['primary', 'Grid AI', 'sparkles'],
};
const CATS = [['orders', 'Orders'], ['delivery', 'Delivery'], ['customers', 'Customers'], ['stock', 'Stock'], ['marketing', 'Marketing']];
const NW = 76;
const GAP = 150;
const clone = (x) => JSON.parse(JSON.stringify(x));
const short = (s, n = 42) => (String(s || '').length > n ? String(s).slice(0, n - 1) + '…' : String(s || ''));
const waitText = (h) => (h >= 24 && h % 24 === 0 ? `${h / 24} ${h / 24 === 1 ? 'day' : 'days'}` : `${h} ${h === 1 ? 'hour' : 'hours'}`);
const toDraft = (r) => ({ name: r.name, trigger: r.trigger, cat: r.cat, conditions: clone(r.conditions || []), actions: clone(r.actions || []), wait: r.wait || 0, on: r.on !== false, custom: !!r.custom });
const labeled = (d) => ({ ...d, conditions: d.conditions.map((c) => ({ ...c, label: conditionLabel(d.trigger, c) })) });
const key = (d) => JSON.stringify(d ? { ...labeled(d), custom: undefined } : null);
function tplName(id) { const t = getTemplates().find((x) => x.id === id); return t ? t.name : id; }
function actionName(a) {
  if (a.kind === 'message') return a.template ? tplName(a.template) : 'Send ' + (a.channel === 'email' ? 'an email' : capsOf(a.channel).name);
  return short(a.label, 40) || (a.kind === 'task' ? 'Task' : 'Grid AI step');
}
function actionSub(a) {
  if (a.kind === 'message') return `${capsOf(a.channel).name} · ${a.cls || 'Transactional'}${a.fallback ? ' · if needed' : ''}`;
  if (a.kind === 'task') return 'Task · ' + (a.owner || 'Team');
  return 'Grid AI';
}
function defaultCond(f) {
  if (f.alert) return { field: f.field, op: 'lt', value: 'alert' };
  if (f.type === 'choice') return { field: f.field, op: 'is', value: f.choices[0] };
  if (f.type === 'yesno') return { field: f.field, op: 'is', value: true };
  return { field: f.field, op: f.type === 'money' ? 'gt' : 'gte', value: f.def != null ? f.def : f.type === 'money' ? 5000 : 1 };
}
/** The canvas drawn from the rule: nodes in a row, the IF's false branch to an end node underneath. */
function graph(d) {
  const list = [{ key: 'trig', ty: 'trig', name: TRIGGERS[d.trigger] || d.trigger, sub: 'Trigger' }];
  if (d.conditions.length) list.push({ key: 'if', ty: 'if', name: d.conditions.length === 1 ? conditionLabel(d.trigger, d.conditions[0]) : `${d.conditions.length} conditions, all must match`, sub: 'Conditions' });
  if (d.wait) list.push({ key: 'wait', ty: 'wait', name: 'Wait ' + waitText(d.wait), sub: 'Wait' });
  d.actions.forEach((a, i) => list.push({ key: 'a' + i, ty: a.kind === 'message' ? a.channel : a.kind, name: actionName(a), sub: actionSub(a) }));
  const nodes = list.map((n, i) => ({ ...n, x: 24 + i * GAP, y: 190 }));
  const edges = [];
  for (let i = 1; i < nodes.length; i += 1) edges.push([nodes[i - 1].key, nodes[i].key, nodes[i - 1].key === 'if' ? 'true' : '']);
  const ifN = nodes.find((n) => n.key === 'if');
  if (ifN) { nodes.push({ key: 'stop', ty: 'stop', name: 'Nothing happens', sub: 'End', x: ifN.x + GAP, y: 340 }); edges.push(['if', 'stop', 'false']); }
  const last = list.length ? nodes[list.length - 1] : null;
  const plus = last ? { x: last.x + NW + 14, y: last.y + 24, lab: last.key === 'if' ? 'true' : '', after: last.name } : null;
  return { nodes, edges, plus };
}

function useWorkflow() {
  const [st, setSt] = useState({ ready: false, id: '', missing: false, draft: null, saved: '' });
  const load = (id) => {
    if (!id || id === 'new') { setSt({ ready: true, id: '', missing: false, draft: null, saved: '' }); return; }
    const r = ruleBy(id);
    if (!r) { setSt({ ready: true, id, missing: true, draft: null, saved: '' }); return; }
    const d = toDraft(r);
    setSt({ ready: true, id, missing: false, draft: d, saved: key(d) });
  };
  useEffect(() => { load(new URLSearchParams(window.location.search).get('id') || ''); }, []);
  return [st, setSt, load];
}

// ---- styles ----

const CSS = `
.wf-card{overflow:clip}
.wfbar{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);min-height:44px;padding:6px 8px;border-bottom:1px solid var(--border-subtle)}
.wfbar .ix-tabs{flex:none}
.wf-note{flex:1;min-width:0;font-size:var(--text-xs);color:var(--text-muted);text-align:right}
.wf-rename{display:flex;flex-wrap:wrap;align-items:flex-end;gap:var(--space-2)}
.wf-rename>div{flex:1 1 280px;min-width:0}
.canvas{position:relative;height:640px;overflow-x:auto;overflow-y:hidden;background-color:var(--slate-50);background-image:radial-gradient(var(--slate-300) 1px,transparent 1px);background-size:20px 20px}
.layer{position:absolute;left:0;top:0;height:640px;transform-origin:0 0;transition:transform 200ms ease}
.node{position:absolute;display:flex;align-items:center;justify-content:center;width:76px;height:76px;padding:0;border:2px solid var(--slate-300);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-xs);font:inherit;cursor:pointer}
.node:hover{border-color:var(--slate-400)}
.node.sel{border-color:var(--primary);box-shadow:0 0 0 4px var(--fill-primary-soft-hover)}
.node.ok{border-color:var(--fill-success)}
.node.trig{border-radius:38px var(--radius-xl) var(--radius-xl) 38px}
.node:focus-visible{outline:2px solid var(--primary);outline-offset:3px}
.ico{display:flex;flex:none;align-items:center;justify-content:center;width:32px;height:32px;border-radius:var(--radius-lg)}
.node .ico{width:40px;height:40px}
.nlab{position:absolute;width:130px;text-align:center;font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);color:var(--slate-800)}
.nsub{display:block;font-size:var(--text-2xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.done{position:absolute;right:-8px;top:-8px;display:flex;align-items:center;justify-content:center;width:20px;height:20px;border:2px solid var(--surface-card);border-radius:var(--radius-full);background:var(--fill-success);color:var(--text-on-dark)}
.port{position:absolute;width:10px;height:10px;border:2px solid var(--slate-50);border-radius:var(--radius-full);background:var(--slate-400)}
.plus{position:absolute;display:inline-flex;align-items:center;justify-content:center;width:24px;height:28px;padding:0;border:1.5px solid var(--slate-400);border-radius:var(--radius-md);background:var(--surface-card);color:var(--slate-600);cursor:pointer}
.plus:hover{border-color:var(--primary);color:var(--primary)}
.plus:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
.elab{position:absolute;padding:1px 6px;border-radius:var(--radius-full);background:var(--slate-50);font-size:var(--text-2xs);font-weight:var(--weight-medium)}
.items{position:absolute;padding:0 4px;background:var(--slate-50);font-size:var(--text-2xs);font-weight:var(--weight-medium);color:var(--text-success)}
.sticky{position:absolute;padding:10px 12px;border:1px solid var(--slate-200);border-radius:var(--radius-lg);background:var(--fill-warning-soft);font-size:var(--text-xs);line-height:18px;color:var(--slate-800)}
.zoom{position:absolute;left:12px;bottom:12px;display:flex;gap:6px}
.zoom .ix-btn{background:var(--surface-card)}
.drawer{position:absolute;top:10px;right:10px;bottom:10px;z-index:5;display:flex;flex-direction:column;width:360px;overflow:hidden;border:1px solid var(--slate-200);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-lg)}
.drawer__head{display:flex;align-items:center;gap:10px;padding:10px 12px 10px 16px;border-bottom:1px solid var(--border-subtle)}
.drawer__head>div{flex:1;min-width:0}
.drawer__title{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.drawer__sub{font-size:var(--text-xs);color:var(--text-muted)}
.drawer__search{padding:10px 16px}
.drawer__list{flex:1;overflow:auto}
.drawer__cat{padding:8px 16px 4px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.drawer__pills{display:flex;gap:6px;padding:8px 16px;border-bottom:1px solid var(--border-subtle)}
.drawer__body{display:flex;flex:1;flex-direction:column;gap:var(--space-3);padding:12px 16px;overflow:auto}
.drawer__body .gc-label{margin-bottom:6px}
.drawer__foot{display:flex;justify-content:space-between;gap:8px;padding:10px 16px;border-top:1px solid var(--border-subtle)}
.drawer__none{padding:16px;font-size:var(--text-xs-plus);color:var(--text-muted)}
.citem{display:flex;align-items:center;gap:12px;width:100%;padding:8px 16px;border:0;background:transparent;font:inherit;text-align:left;cursor:pointer}
.citem:hover{background:var(--slate-50)}
.citem:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.citem b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.citem small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.cond{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:8px;border-radius:var(--radius-lg);background:var(--slate-50)}
.cond .gc-input:first-child{grid-column:1/-1}
.wf-pill{display:inline-flex;align-items:center;height:20px;padding:0 8px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-body);white-space:nowrap}
.wf-pill.is-ok{background:var(--fill-success-soft);color:var(--text-success)}
.wf-addcond{align-self:flex-start}
.wf-hint{display:block;margin-top:4px;font-size:var(--text-xs);color:var(--text-muted)}
.wf-out{margin:0;padding:10px 12px;border-radius:var(--radius-lg);background:var(--surface-subtle);font-family:var(--font-code);font-size:var(--text-xs);line-height:18px;color:var(--text-heading);white-space:pre-wrap}
.wf-id{font-family:var(--font-data)}
.wf-pick__head{padding:var(--space-4) var(--space-4) var(--space-2)}
.wf-pick__head h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.wf-pick{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));padding:0 0 var(--space-3)}
.wf-pick__item{min-height:56px}
.wf-sample{width:auto;max-width:260px;height:32px}
.wf-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.wf-x{justify-self:start}
.wf-check{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-body)}
.wf-check input{width:18px;height:18px;accent-color:var(--primary)}
/* phones: the toolbar wraps; the canvas opens at 100% and pans inside a box at most 70% of the screen tall (never
   taller than the drawing); the node panel sits under the canvas */
.wf-pan{display:none}
@media (max-width:640px){
  .wf-pick{grid-template-columns:minmax(0,1fr)}
  .wf-sample{max-width:100%;flex:1 1 100%}
  .wf-note{flex:1 1 100%;text-align:left}
  .canvas{height:min(70vh,var(--wf-ch,640px));overflow:auto;-webkit-overflow-scrolling:touch}
  .zoom{bottom:auto;top:calc(min(70vh,var(--wf-ch,640px)) - 46px)}
  .wf-pan{position:absolute;right:12px;top:12px;display:block;padding:4px 10px;border:1px solid var(--slate-200);border-radius:var(--radius-full);background:var(--surface-card);font-size:var(--text-xs);color:var(--text-muted);pointer-events:none}
  .drawer{position:relative;top:auto;right:auto;bottom:auto;width:auto;max-height:75vh;margin:0 12px 12px}
}
`;

// ---- markup ----

function TriggerPicker({ onPick }) {
  return (
    <section className="ix-card" aria-labelledby="wf-pick">
      <div className="wf-pick__head"><h2 id="wf-pick">What starts this workflow?</h2></div>
      <div className="wf-pick">
        {BUILDER_TRIGGERS.map((t) => {
          const ex = (SAMPLE_EVENTS[t] || [])[0];
          return (
            <button key={t} type="button" className="citem wf-pick__item" onClick={() => onPick(t)}>
              <span className="ico" style={{ background: SOFT.primary[0], color: SOFT.primary[1] }}><Icon name="zap" width="16" height="16" aria-hidden="true" /></span>
              <span><b>{TRIGGERS[t]}</b>{ex ? <small>e.g. {ex.label}</small> : null}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/** The panel for one node. */
function NodePanel({ node, d, set, test, onClose, onDelete }) {
  const fields = CONDITION_FIELDS[d.trigger] || [];
  const tone = SOFT[TY[node.ty][0]];
  const setCond = (i, patch) => set({ conditions: d.conditions.map((c, j) => (j === i ? { ...c, ...patch } : c)) });
  const ai = node.key[0] === 'a' ? Number(node.key.slice(1)) : -1;
  const a = ai >= 0 ? d.actions[ai] : null;
  const setAct = (patch) => set({ actions: d.actions.map((x, j) => (j === ai ? { ...x, ...patch } : x)) });
  const tpls = a && a.kind === 'message' ? getTemplates().filter((t) => t.channel === a.channel || t.id === a.template) : [];
  const tpl = a && a.template ? getTemplates().find((t) => t.id === a.template) : null;
  const prev = ai > 0 ? d.actions[ai - 1] : null;
  const result = test ? test.byNode[node.key] : null;
  return (
    <div className="drawer" role="region" aria-label="Node panel">
      <div className="drawer__head">
        <span className="ico" style={{ background: tone[0], color: tone[1] }}><Icon name={TY[node.ty][2]} width="16" height="16" aria-hidden="true" /></span>
        <div><div className="drawer__title">{short(node.name, 48)}</div><div className="drawer__sub">{node.sub}</div></div>
        <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Close panel" onClick={onClose}><Icon name="x" width="16" height="16" aria-hidden="true" /></button>
      </div>
      <div className="drawer__body">
        {node.key === 'trig' ? (<>
          <div><label className="gc-label" htmlFor="wf-trig">Starts when</label>
            <select id="wf-trig" className="gc-input gc-select" value={d.trigger} onChange={(e) => { const t = e.target.value; const ok = (CONDITION_FIELDS[t] || []).map((f) => f.field); set({ trigger: t, cat: catOfTrigger(t), conditions: d.conditions.filter((c) => ok.includes(c.field)) }); }}>
              {(BUILDER_TRIGGERS.includes(d.trigger) ? BUILDER_TRIGGERS : [d.trigger, ...BUILDER_TRIGGERS]).map((t) => <option key={t} value={t}>{TRIGGERS[t]}</option>)}
            </select>
            <span className="wf-hint">Changing it removes conditions the new trigger doesn't have.</span>
          </div>
          <div><label className="gc-label" htmlFor="wf-cat">Category</label>
            <select id="wf-cat" className="gc-input gc-select" value={d.cat} onChange={(e) => set({ cat: e.target.value })}>{CATS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          </div>
        </>) : null}

        {node.key === 'if' ? (<>
          <span className="gc-label">Conditions · all must match</span>
          {d.conditions.map((c, i) => {
            const f = fieldOf(d.trigger, c.field) || fields[0];
            return (
              <div key={i} className="cond">
                <select className="gc-input gc-select" aria-label="Field" value={c.field} onChange={(e) => setCond(i, defaultCond(fieldOf(d.trigger, e.target.value)))}>
                  {fields.map((x) => <option key={x.field} value={x.field}>{x.label}</option>)}
                </select>
                {f && f.type !== 'yesno' ? (
                  <select className="gc-input gc-select" aria-label="Operator" value={c.op} onChange={(e) => setCond(i, { op: e.target.value })}>{f.ops.map((o) => <option key={o} value={o}>{OP_LABEL[o]}</option>)}</select>
                ) : null}
                {f && f.type === 'choice' ? (
                  <select className="gc-input gc-select" aria-label="Value" value={c.value} onChange={(e) => setCond(i, { value: e.target.value })}>{f.choices.map((o) => <option key={o}>{o}</option>)}</select>
                ) : f && f.type === 'yesno' ? (
                  <select className="gc-input gc-select" aria-label="Value" value={c.value ? 'yes' : 'no'} onChange={(e) => setCond(i, { value: e.target.value === 'yes' })}><option value="yes">Yes</option><option value="no">No</option></select>
                ) : f && f.alert && c.value === 'alert' ? (
                  <select className="gc-input gc-select" aria-label="Value" value="alert" onChange={(e) => setCond(i, { value: e.target.value === 'alert' ? 'alert' : 5 })}><option value="alert">The alert level</option><option value="n">A number</option></select>
                ) : (
                  <input className="gc-input" type="number" min="0" aria-label="Value" value={c.value === '' ? '' : c.value} onChange={(e) => setCond(i, { value: e.target.value === '' ? '' : Number(e.target.value) })} />
                )}
                <button type="button" className="ix-btn ix-btn--sm ix-btn--plain wf-x" onClick={() => set({ conditions: d.conditions.filter((_, j) => j !== i) })}>Remove</button>
              </div>
            );
          })}
          {fields.length ? <button type="button" className="ix-btn ix-btn--sm wf-addcond" onClick={() => set({ conditions: [...d.conditions, defaultCond(fields[0])] })}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add condition</button> : null}
        </>) : null}

        {node.key === 'wait' ? (
          <div><label className="gc-label" htmlFor="wf-wait">Wait (hours)</label>
            <input id="wf-wait" className="gc-input" type="number" min="1" value={d.wait} onChange={(e) => set({ wait: Math.max(0, Number(e.target.value) || 0) })} />
            <span className="wf-hint">Then the steps after it run. Customers are never messaged in quiet hours.</span>
          </div>
        ) : null}

        {a && a.kind === 'message' ? (<>
          <div className="gc-cols-2 gc-cols--keep wf-two">
            <div><label className="gc-label" htmlFor="wf-ch">Send by</label>
              <select id="wf-ch" className="gc-input gc-select" value={a.channel} onChange={(e) => setAct({ channel: e.target.value, template: '' })}>{ACTION_KINDS.filter((k) => k.kind === 'message').map((k) => <option key={k.channel} value={k.channel}>{k.label}</option>)}</select>
            </div>
            <div><label className="gc-label" htmlFor="wf-cls">Message type</label>
              <select id="wf-cls" className="gc-input gc-select" value={a.cls || 'Transactional'} onChange={(e) => setAct({ cls: e.target.value })}>{MESSAGE_CLASSES.map((c) => <option key={c}>{c}</option>)}</select>
            </div>
          </div>
          {a.cls === 'Marketing' ? <span className="wf-hint">Offers go only to customers who agreed, outside quiet hours and within the caps.</span> : null}
          <div><label className="gc-label" htmlFor="wf-tpl">Template</label>
            <select id="wf-tpl" className="gc-input gc-select" value={a.template || ''} onChange={(e) => setAct({ template: e.target.value })}>
              <option value="">Write my own</option>
              {tpls.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {a.channel === 'whatsapp' && !a.template ? <span className="wf-hint">{capsOf('whatsapp').text}.</span> : null}
          </div>
          {tpl ? <pre className="wf-out">{tpl.body}</pre> : (
            <div><label className="gc-label" htmlFor="wf-text">Message</label>
              <textarea id="wf-text" className="gc-input" rows={4} value={a.text || ''} onChange={(e) => setAct({ text: e.target.value })} />
              <span className="wf-hint">{'Use {{customer_name}}, {{order_id}} and {{store_name}}.'}</span>
            </div>
          )}
          {prev && prev.kind === 'message' ? (
            <label className="wf-check"><input type="checkbox" checked={!!a.fallback} onChange={() => setAct({ fallback: !a.fallback })} />Only if the message before can't reach them</label>
          ) : null}
        </>) : null}

        {a && (a.kind === 'task' || a.kind === 'ai') ? (<>
          {a.kind === 'task' ? (
            <div><label className="gc-label" htmlFor="wf-owner">Team</label>
              <select id="wf-owner" className="gc-input gc-select" value={a.owner || TASK_OWNERS[0]} onChange={(e) => setAct({ owner: e.target.value })}>{[...new Set([...(a.owner ? [a.owner] : []), ...TASK_OWNERS])].map((o) => <option key={o}>{o}</option>)}</select>
            </div>
          ) : <span className="wf-hint">Grid AI does this within its agent's tools and limits.</span>}
          <div><label className="gc-label" htmlFor="wf-label">What to do</label>
            <input id="wf-label" className="gc-input" value={a.label || ''} onChange={(e) => setAct({ label: e.target.value })} />
            {a.kind === 'task' ? <span className="wf-hint">The rule asks the team; it can't change an order by itself.</span> : null}
          </div>
        </>) : null}

        {node.key === 'stop' ? <p className="wf-hint" style={{ margin: 0 }}>When a condition isn't met, the workflow ends here and nothing is sent.</p> : null}

        {result ? (
          <div><span className="gc-label">Last test</span><pre className="wf-out">{result}</pre></div>
        ) : null}
      </div>
      {node.key !== 'trig' && node.key !== 'stop' ? (
        <div className="drawer__foot">
          <span />
          <button type="button" className="ix-btn ix-btn--sm ix-btn--danger" onClick={onDelete}>{node.key === 'if' ? 'Remove conditions' : node.key === 'wait' ? 'Remove wait' : 'Delete step'}</button>
        </div>
      ) : null}
    </div>
  );
}

export default function WorkflowBuilder() {
  const [wf, setWf, load] = useWorkflow();
  const [sel, setSel] = useState(null);
  const [creator, setCreator] = useState(false);
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('editor');
  const [test, setTest] = useState(null);
  const [sample, setSample] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [z, setZ] = useState(1);
  const [fitZ, setFitZ] = useState(1);
  const canvasEl = useRef(null);
  const d = wf.draft;

  const g = useMemo(() => (d ? graph(d) : { nodes: [], edges: [], plus: null }), [d]);
  // phones: open at 100% so labels stay readable; the % button zooms to fit the whole drawing
  useEffect(() => {
    if (!d || !window.matchMedia || !window.matchMedia('(max-width:640px)').matches) return;
    const w = Math.max(960, Math.max(...g.nodes.map((n) => n.x)) + 116);
    const cw = canvasEl.current ? canvasEl.current.clientWidth : window.innerWidth - 32;
    setFitZ(Math.min(1, Math.max(0.3, Math.floor(((cw - 8) / w) * 100) / 100)));
  }, [!!d]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!wf.ready) return <div className="dc-screen ds" data-screen="WorkflowBuilder" />;

  const isNew = !wf.id;
  const dirty = !!d && (isNew || key(d) !== wf.saved);
  const set = (patch) => { setWf((s) => ({ ...s, draft: { ...s.draft, ...patch } })); setTest(null); };
  const samples = d ? SAMPLE_EVENTS[d.trigger] || [] : [];

  const pick = (t) => { setWf((s) => ({ ...s, draft: { name: 'When ' + TRIGGERS[t].charAt(0).toLowerCase() + TRIGGERS[t].slice(1), trigger: t, cat: catOfTrigger(t), conditions: [], actions: [], wait: 0, on: true, custom: true } })); setCreator(true); setSel(null); };
  const save = () => {
    const err = validateRule(labeled(d));
    if (err) { toast(err, { tone: 'error' }); return; }
    if (isNew) {
      const r = createRule(labeled(d));
      if (r.error) { toast(r.error, { tone: 'error' }); return; }
      window.history.replaceState(window.history.state, '', '/workflow-builder?id=' + r.rule.id);
      load(r.rule.id);
      toast('Workflow saved' + (r.rule.on ? ' and on' : ''));
      return;
    }
    const r = saveWorkflow(wf.id, labeled(d));
    if (r.error) { toast(r.error, { tone: 'error' }); return; }
    load(wf.id);
    toast(`Saved as version ${r.version}`);
  };
  const toggleOn = () => {
    const on = !d.on;
    if (isNew) { set({ on }); return; }
    setRuleOn(wf.id, on);
    setWf((s) => ({ ...s, draft: { ...s.draft, on }, saved: key({ ...JSON.parse(s.saved), on, custom: s.draft.custom }) }));
    toast(on ? 'Workflow on. It runs from the next matching event.' : 'Workflow off.');
  };
  const remove = async () => {
    const ok = await confirmDialog({ title: 'Delete this workflow?', body: 'It stops running and can\'t be brought back.', confirmLabel: 'Delete', tone: 'danger' });
    if (!ok) return;
    const r = deleteRule(wf.id);
    if (r.error) { toast(r.error, { tone: 'error' }); return; }
    toast('Workflow deleted');
    navigate('/automations');
  };
  const duplicate = () => {
    const c = duplicateRule(wf.id);
    if (!c) return;
    window.history.pushState(window.history.state, '', '/workflow-builder?id=' + c.id);
    load(c.id); setSel(null); setTest(null);
    toast('Copied. The copy is off until you turn it on.');
  };
  const runTest = () => {
    const ev = samples.find((x) => x.id === sample) || samples[0];
    if (!ev) { toast('There is no sample event for this trigger yet', { tone: 'info' }); return; }
    if (!d.actions.length) { toast('Add a step first', { tone: 'error' }); return; }
    const out = simulate({ ...labeled(d), on: true }, ev);
    const ran = { trig: true };
    const byNode = { trig: ev.label };
    const condSteps = out.steps.filter((x) => x.kind === 'condition');
    if (d.conditions.length) byNode.if = condSteps.map((x) => `${x.ok ? 'Met' : 'Not met'}: ${x.label} (${x.detail})`).join('\n');
    if (out.matched) {
      if (d.conditions.length) ran.if = true;
      if (d.wait) { ran.wait = true; byNode.wait = 'Waited ' + waitText(d.wait); }
      const acts = out.steps.filter((x) => x.kind === 'action');
      d.actions.forEach((_, i) => { if (acts[i]) { byNode['a' + i] = acts[i].detail; if (acts[i].ok) ran['a' + i] = true; } });
    } else { ran.stop = true; byNode.stop = 'A condition is not met, so nothing happens'; }
    setTest({ ev, out, ran, byNode });
    setTab('editor');
  };
  const addNode = (it) => {
    setCreator(false); setQ('');
    if (it.kind === 'if') { if (!d.conditions.length) set({ conditions: [defaultCond((CONDITION_FIELDS[d.trigger] || [])[0])] }); setSel('if'); return; }
    if (it.kind === 'wait') { if (!d.wait) set({ wait: 24 }); setSel('wait'); return; }
    const a = it.kind === 'message' ? { kind: 'message', channel: it.channel, cls: 'Transactional', text: '' } : { kind: 'task', owner: TASK_OWNERS[0], label: '' };
    set({ actions: [...d.actions, a] });
    setSel('a' + d.actions.length);
  };
  const delNode = () => {
    if (sel === 'if') set({ conditions: [] });
    else if (sel === 'wait') set({ wait: 0 });
    else if (sel && sel[0] === 'a') { const i = Number(sel.slice(1)); set({ actions: d.actions.filter((_, j) => j !== i) }); }
    setSel(null);
  };

  const catalog = d ? [
    ['Flow', [
      (CONDITION_FIELDS[d.trigger] || []).length && !d.conditions.length ? { kind: 'if', ty: 'if', n: 'Condition', s: 'Only go on when it matches' } : null,
      !d.wait ? { kind: 'wait', ty: 'wait', n: 'Wait', s: 'Hours or days before the next step' } : null,
    ].filter(Boolean)],
    ['Messages', ACTION_KINDS.filter((k) => k.kind === 'message').map((k) => ({ kind: 'message', channel: k.channel, ty: k.channel, n: k.label, s: k.about }))],
    ['Team', ACTION_KINDS.filter((k) => k.kind === 'task').map((k) => ({ kind: 'task', ty: 'task', n: k.label, s: k.about }))],
  ].map(([cat, items]) => [cat, items.filter((it) => !q || (it.n + ' ' + it.s).toLowerCase().includes(q.toLowerCase()))]).filter(([, items]) => items.length) : [];

  const byKey = Object.fromEntries(g.nodes.map((n) => [n.key, n]));
  const selNode = sel && byKey[sel] ? byKey[sel] : null;
  const ran = test ? test.ran : {};
  const layerW = Math.max(960, Math.max(0, ...g.nodes.map((n) => n.x)) + 200);
  const canvasH = Math.round(Math.max(520, Math.max(0, ...g.nodes.map((n) => n.y)) + 160) * z + 64) + 'px';
  const runs = !isNew && tab === 'exec' ? runsOf(wf.id) : [];
  const lc = (t) => (t ? t.charAt(0).toLowerCase() + t.slice(1) : '');
  const say = (a) => (a.kind === 'message' ? 'send ' + (a.channel === 'sms' ? 'an SMS' : a.channel === 'email' ? 'an email' : 'a WhatsApp message') : lc(a.label || 'a task'));
  const summary = d ? `When ${lc(TRIGGERS[d.trigger] || '')}${d.conditions.length ? ' and ' + d.conditions.map((c) => lc(conditionLabel(d.trigger, c))).join(' and ') : ''}${d.wait ? ', wait ' + waitText(d.wait) : ''}, then ${d.actions.length ? d.actions.map(say).join(', then ') : '…'}.` : '';

  const header = (
    <RecordHeader back="/automations" backLabel="Rules" title={d ? d.name || 'Untitled workflow' : wf.missing ? 'Workflow not found' : 'New workflow'}
      badges={d ? (d.on ? <StatusBadge tone="success">On</StatusBadge> : <StatusBadge tone="neutral">Off</StatusBadge>) : null}
      meta={d ? `${d.custom ? 'Custom' : 'Ready-made'} · ${(CATS.find((c) => c[0] === d.cat) || CATS[0])[1]}${dirty ? ' · Unsaved changes' : ''}` : ''}
      about="Build a workflow from a trigger, conditions and steps. Test it on a sample event (nothing is sent), save it and turn it on. Executions lists its recent runs."
      secondary={d ? [{ label: d.on ? 'Turn off' : 'Turn on', onClick: toggleOn }] : []}
      more={d ? [{ label: 'Rename', onClick: () => setRenaming(!renaming) }, ...(!isNew ? [{ label: 'Duplicate', onClick: duplicate }] : []), ...(!isNew && d.custom ? [{ label: 'Delete workflow', onClick: remove }] : []), { label: 'Workflow settings', href: '/workflow-settings' }] : [{ label: 'Workflow settings', href: '/workflow-settings' }]}
      primary={d ? { label: dirty ? 'Save' : 'Saved', onClick: save, disabled: !dirty } : null} />
  );

  return (
    <div className="dc-screen ds" data-screen="WorkflowBuilder">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="auto-builder" />
        <main className="gc-shell__main">
          <Topbar crumb="Automation" page="Workflow builder" />
          <div className="gc-shell__content">
            <div className="ix-page">
              {header}

              {wf.missing ? (
                <section className="ix-card"><div className="ix-empty"><EmptyState icon="workflow" title="This workflow was deleted or doesn't exist" actionLabel="Back to rules" onAction={() => navigate('/automations')} /></div></section>
              ) : !d ? <TriggerPicker onPick={pick} /> : (<>
                {renaming ? (
                  <section className="ix-card ix-card--pad">
                    <div className="wf-rename">
                      <div><label className="gc-label" htmlFor="wf-name">Workflow name</label><input id="wf-name" className="gc-input" value={d.name} onChange={(e) => set({ name: e.target.value })} autoFocus /></div>
                      <button type="button" className="ix-btn" onClick={() => setRenaming(false)}>Done</button>
                    </div>
                  </section>
                ) : null}

                <section className="ix-card wf-card" aria-label="Workflow">
                  <div className="wfbar">
                    <IndexTabs tabs={[['editor', 'Editor'], ['exec', 'Executions']].map(([k, l]) => ({ key: k, label: l, id: 'wf-tab-' + k, on: tab === k, onClick: () => setTab(k) }))} label="Workflow view" />
                    <span className="wf-note">{test ? `Last test: ${test.ev.label} · ${test.out.matched ? 'runs' : 'stops at a condition'}. Nothing was sent.` : 'Tests run on a sample event. Nothing is sent.'}</span>
                    {samples.length > 1 ? (
                      <select className="gc-input gc-select wf-sample" aria-label="Sample event" value={sample || samples[0].id} onChange={(e) => { setSample(e.target.value); setTest(null); }}>{samples.map((x) => <option key={x.id} value={x.id}>{short(x.label, 40)}</option>)}</select>
                    ) : null}
                    <button type="button" className="ix-btn ix-btn--sm" onClick={() => { setCreator(true); setSel(null); setTab('editor'); }}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add node</button>
                    <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={runTest}><Icon name="play" width="16" height="16" aria-hidden="true" />Test workflow</button>
                  </div>
                  {tab === 'editor' ? (
                    <div style={{ position: 'relative', '--wf-ch': canvasH }}>
                      <div className="canvas" ref={canvasEl}>
                        <div className="layer" style={{ width: layerW + 'px', transform: 'scale(' + z + ')' }}>
                          <div className="sticky" style={{ left: 24, top: 24, width: 420 }}><b>What it does</b><br />{summary}</div>
                          {g.edges.map(([fa, fb, lab], i) => {
                            const A = byKey[fa], B = byKey[fb];
                            if (!A || !B) return null;
                            const sx = A.x + NW, sy = A.y + NW / 2 + (lab === 'true' ? -14 : lab === 'false' ? 14 : 0), tx = B.x - 2, ty = B.y + NW / 2;
                            const l = Math.min(sx, tx) - 10, t = Math.min(sy, ty) - 10, w = Math.abs(tx - sx) + 20, h = Math.abs(ty - sy) + 20;
                            const x1 = sx - l, y1 = sy - t, x2 = tx - l, y2 = ty - t, mx = (x2 - x1) / 2;
                            const both = ran[fa] && ran[fb];
                            const c = both ? 'var(--fill-success)' : 'var(--slate-400)';
                            return (
                              <React.Fragment key={'e' + i}>
                                <svg width={w} height={h} style={{ position: 'absolute', left: l, top: t, overflow: 'visible', pointerEvents: 'none' }} aria-hidden="true">
                                  <path d={`M${x1} ${y1} C${x1 + mx} ${y1} ${x2 - mx} ${y2} ${x2 - 6} ${y2}`} fill="none" strokeWidth="2" strokeDasharray={both ? undefined : '5 4'} style={{ stroke: c }} />
                                  <path d={`M${x2 - 7} ${y2 - 5} L${x2} ${y2} L${x2 - 7} ${y2 + 5} z`} style={{ fill: c }} />
                                </svg>
                                {lab ? <span className="elab" style={{ left: sx + 6, top: sy - (lab === 'true' ? 18 : -4), color: lab === 'true' ? 'var(--text-success)' : 'var(--text-danger)' }}>{lab}</span> : null}
                              </React.Fragment>
                            );
                          })}
                          {g.nodes.map((n) => {
                            const tone = SOFT[TY[n.ty][0]];
                            const ok = !!ran[n.key];
                            return (
                              <React.Fragment key={n.key}>
                                <button type="button" className={'node' + (n.ty === 'trig' ? ' trig' : '') + (ok ? ' ok' : '') + (sel === n.key ? ' sel' : '')} style={{ left: n.x, top: n.y }} onClick={() => { setSel(n.key); setCreator(false); }} aria-label={n.name}>
                                  <span className="ico" style={{ background: tone[0], color: tone[1] }}><Icon name={TY[n.ty][2]} width="20" height="20" aria-hidden="true" /></span>
                                  {ok ? <span className="done"><Icon name="check" width="12" height="12" role="img" aria-label="Ran in the last test" /></span> : null}
                                </button>
                                {n.ty !== 'trig' ? <span className="port" style={{ left: n.x - 6, top: n.y + NW / 2 - 5 }} /> : null}
                                <span className="nlab" style={{ left: n.x + NW / 2 - 65, top: n.y + NW + 6 }}>{short(n.name)}<span className="nsub">{n.sub}</span></span>
                              </React.Fragment>
                            );
                          })}
                          {g.plus ? (<>
                            <button type="button" className="plus" style={{ left: g.plus.x, top: g.plus.y }} onClick={() => { setCreator(true); setSel(null); }} aria-label={`Add a step after ${g.plus.after}`}><Icon name="plus" width="14" height="14" aria-hidden="true" /></button>
                            {g.plus.lab ? <span className="elab" style={{ left: g.plus.x - 2, top: g.plus.y - 20, color: 'var(--text-success)' }}>{g.plus.lab}</span> : null}
                          </>) : null}
                        </div>
                      </div>
                      <span className="wf-pan" aria-hidden="true">Swipe to move around</span>
                      <div className="zoom">
                        <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" onClick={() => setZ(Math.max(Math.min(0.6, fitZ), +(z - 0.1).toFixed(1)))} aria-label="Zoom out"><Icon name="minus" width="16" height="16" aria-hidden="true" /></button>
                        <button type="button" className="ix-btn ix-btn--sm" onClick={() => setZ(fitZ)} aria-label="Fit to view">{Math.round(z * 100) + '%'}</button>
                        <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" onClick={() => setZ(Math.min(1.2, +(z + 0.1).toFixed(1)))} aria-label="Zoom in"><Icon name="plus" width="16" height="16" aria-hidden="true" /></button>
                      </div>
                      {creator ? (
                        <div className="drawer" role="region" aria-label="Node panel">
                          <div className="drawer__head">
                            <div><div className="drawer__title">Add a step</div><div className="drawer__sub">{g.plus ? `After “${short(g.plus.after, 40)}”` : ''}</div></div>
                            <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Close panel" onClick={() => setCreator(false)}><Icon name="x" width="16" height="16" aria-hidden="true" /></button>
                          </div>
                          <div className="drawer__search"><input className="gc-input" aria-label="Search steps" placeholder="Search steps" value={q} onChange={(e) => setQ(e.target.value)} /></div>
                          <div className="drawer__list">
                            {catalog.map(([cat, items]) => (
                              <React.Fragment key={cat}>
                                <div className="drawer__cat">{cat}</div>
                                {items.map((it) => {
                                  const tone = SOFT[TY[it.ty][0]];
                                  return (
                                    <button key={it.n} type="button" className="citem" onClick={() => addNode(it)}>
                                      <span className="ico" style={{ background: tone[0], color: tone[1] }}><Icon name={TY[it.ty][2]} width="16" height="16" aria-hidden="true" /></span>
                                      <span><b>{it.n}</b><small>{it.s}</small></span>
                                    </button>
                                  );
                                })}
                              </React.Fragment>
                            ))}
                            {!catalog.length ? <div className="drawer__none">No step matches that search.</div> : null}
                          </div>
                        </div>
                      ) : null}
                      {!creator && selNode ? <NodePanel node={selNode} d={d} set={set} test={test} onClose={() => setSel(null)} onDelete={delNode} /> : null}
                    </div>
                  ) : (
                    isNew || !runs.length ? <div className="ix-empty"><EmptyState icon="workflow" title={isNew ? 'Save the workflow to see its runs' : 'No runs yet'} /></div> : (
                      <div className="ix-table-wrap ix-table-wrap--show">
                        <table className="ix-table ix-table--static gc-table--keep">
                          <caption className="sr-only">Executions</caption>
                          <thead><tr><th scope="col">Started</th><th scope="col">Event</th><th scope="col">Result</th><th scope="col">Status</th></tr></thead>
                          <tbody>
                            {runs.map((x) => (
                              <tr key={x.at}>
                                <td className="ix-muted">{formatDate(x.at)}, {formatTime(x.at)}</td>
                                <td className="ix-strong">{x.label}</td>
                                <td className="ix-muted">{x.detail}</td>
                                <td>{x.ok ? <StatusBadge tone="success" icon="check">Done</StatusBadge> : <StatusBadge tone="warning" icon="triangle-alert">Handed over</StatusBadge>}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}
                </section>
              </>)}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
