'use client';
// GridAI › Behaviour (/admin/gridai/behaviour) — how GridCommerce's own assistant answers leads and merchants and what
// it may do by itself. Copied from the merchant panel's Grid AI › Behaviour (screens/gridai/Behaviour.jsx) and adapted:
//   AI replies        Auto / Assist / Off, hand to a person below a confidence level or after N replies
//   Voice             tone, language (EN / BN / same as the person), reply length
//   Escalation rules  when → which team
//   Human handoff     the triggers that pass a conversation to a person
//   Sensitive actions each one: GridAI may do it / needs approval (and who approves) / never
//   Approvals         how long to wait for the approver, what happens then, notify the approver
//   Working hours     hours, days, what GridAI does outside them
//   Limits            banned topics, never promise or share
//   Change history    who changed what (lib/admin/gridai.js › saveBehaviour writes one line per change)
// One page, one Save (a toast says it worked). Data: lib/admin/gridai.js (store `gridai`).

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { ShopHeader } from '@/components/ui/IndexKit';
import { InfoTip, StatusBadge } from '@/components/ui';
import { gridai, TONES, LANGS, LENGTHS, LEVELS, RULES, HANDOFF, TEAMS, APPROVERS, DAY_NAMES, saveBehaviour, behaviourErrors, behaviourChanges } from '@/lib/admin/gridai';
import { ago } from '@/lib/platform/util';
import { AdminShell } from '../AdminShell';
import { GA_CSS, useGridAi, Switch, Field, Skeleton } from './gridaiShared';

const CSS = `
.bh-sec{scroll-margin-top:80px}
.bh-head{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-subtle)}
.bh-head h2{display:flex;align-items:center;gap:6px;margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.bh-levels{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-2)}
.bh-level{display:flex;flex-direction:column;gap:2px;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;text-align:left;cursor:pointer}
.bh-level b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.bh-level small{font-size:var(--text-xs);color:var(--text-muted);line-height:1.4}
.bh-level:hover{border-color:var(--border-strong)}
.bh-level[aria-checked="true"]{border-color:var(--primary);background:var(--fill-primary-soft)}
.bh-level:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
.bh-rules{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.bh-rules li{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr) auto;align-items:center;gap:var(--space-2);padding:var(--space-2) 0;border-top:1px solid var(--border-subtle)}
.bh-rules li:first-child{border-top:0}
.bh-sens li{grid-template-columns:minmax(0,1.2fr) minmax(0,1fr) minmax(0,1fr)}
.bh-sens span{font-size:var(--text-sm);color:var(--text-heading)}
.bh-days{display:flex;flex-wrap:wrap;gap:6px}
.bh-days button{min-width:44px;height:36px;padding:0 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs);color:var(--text-body);cursor:pointer}
.bh-days button[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary);font-weight:var(--weight-medium)}
.bh-time{display:flex;align-items:center;gap:8px}
.bh-time .gc-input{max-width:140px}
.bh-hist{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.bh-hist li{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-2) var(--space-4);border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-body)}
.bh-hist li:first-child{border-top:0}
.bh-hist li>span{flex:1;min-width:0}
.bh-hist small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.bh-save{position:sticky;bottom:calc(12px + var(--host-badge, 0px));z-index:20;display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3) var(--space-2) var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-lg);font-size:var(--text-sm);color:var(--text-heading)}
.bh-save>span{margin-right:auto;display:flex;align-items:center;gap:8px}
@media (max-width:767px){.bh-levels{grid-template-columns:minmax(0,1fr)}.bh-rules li,.bh-sens li{grid-template-columns:minmax(0,1fr)}.bh-rules li>button{justify-self:end}}
`;

const clone = (x) => JSON.parse(JSON.stringify(x));
const CONFIDENCE = [40, 50, 60, 70, 80];

export default function Behaviour() {
  const { data: d, t, live } = useGridAi();
  // the saved settings at once when the data is already loaded (moving between pages); else after it loads
  const [b, setB] = useState(() => (gridai.isLive() ? clone(gridai.get().behaviour) : null));
  const [errs, setErrs] = useState({});
  const [all, setAll] = useState(false);
  const saved = live ? d.behaviour : null;
  const dirty = !!(b && saved && JSON.stringify(b) !== JSON.stringify(saved));
  // load once the data is there, and again when it changes elsewhere (another tab) while nothing is being edited
  useEffect(() => { if (live && (!b || !dirty)) setB(clone(d.behaviour)); }, [live, saved]); // eslint-disable-line react-hooks/exhaustive-deps

  const put = (k, v) => { setB((x) => ({ ...x, [k]: v })); setErrs({}); };
  const putIn = (k, sub, v) => { setB((x) => ({ ...x, [k]: { ...x[k], [sub]: v } })); setErrs({}); };
  const sel = (k, opts, id) => <select id={id || 'bh-' + k} className="gc-input gc-select" value={b[k]} onChange={(e) => put(k, e.target.value)}>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>;
  const setRule = (i, patch) => setB((x) => ({ ...x, escalation: x.escalation.map((r, j) => (j === i ? { ...r, ...patch } : r)) }));
  const setSens = (id, patch) => setB((x) => ({ ...x, sensitive: x.sensitive.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));
  const toggleDay = (n) => setB((x) => { const days = x.hours.days.includes(n) ? x.hours.days.filter((y) => y !== n) : [...x.hours.days, n]; return { ...x, hours: { ...x.hours, days } }; });

  const save = () => {
    const e = behaviourErrors(b);
    if (Object.keys(e).length) { setErrs(e); toast(Object.values(e)[0], { tone: 'error' }); return; }
    const res = saveBehaviour(b);
    if (!res.ok) { toast(res.error, { tone: res.error === 'Nothing changed.' ? 'info' : 'error' }); return; }
    toast(res.changes.length === 1 ? 'Saved: ' + res.changes[0] + '. GridAI uses it from the next message.' : res.changes.length + ' changes saved. GridAI uses them from the next message.');
  };
  const discard = async () => {
    const n = behaviourChanges(saved, b).length;
    if (n > 2 && !(await confirmDialog({ title: 'Discard ' + n + ' changes?', body: 'The settings go back to what is saved.', confirmLabel: 'Discard', tone: 'danger' }))) return;
    setB(clone(saved)); setErrs({});
  };

  const ready = live && b;
  const hist = ready ? (all ? d.history : d.history.slice(0, 6)) : [];

  return (
    <AdminShell active="ai-behaviour">
      <style dangerouslySetInnerHTML={{ __html: GA_CSS + CSS }} />
      {!ready ? <Skeleton label="Loading GridAI behaviour" /> : (
        <div className="ix-page ix-page--narrow">
          <ShopHeader icon="sliders-horizontal" title="Behaviour"
            about="How GridAI answers leads and merchants, when it hands a conversation to a person, which actions need someone’s approval, its working hours and the topics it must avoid. Leads and merchants can never change these."
            more={[{ label: 'Test chat', href: '/admin/gridai/test' }, { label: 'Training', href: '/admin/gridai' }]}
            primary={{ label: 'Save', onClick: save, disabled: !dirty }} />

          {/* ---- AI replies ---- */}
          <section className="ix-card bh-sec" aria-labelledby="bh-replies-h">
            <div className="bh-head"><h2 id="bh-replies-h">AI replies <InfoTip text="How much GridAI does by itself. Assist is a safe start: GridAI writes, a person sends." /></h2><StatusBadge tone={b.level === 'auto' ? 'success' : b.level === 'assist' ? 'primary' : 'neutral'}>{LEVELS.find((l) => l[0] === b.level)[1]}</StatusBadge></div>
            <div className="ga-body">
              <div className="bh-levels" role="radiogroup" aria-label="AI intervention level">
                {LEVELS.map(([k, l, sub]) => <button key={k} type="button" role="radio" aria-checked={b.level === k} className="bh-level" onClick={() => put('level', k)}><b>{l}</b><small>{sub}</small></button>)}
              </div>
              <div className="ga-row">
                <Field label="Hand to a person when GridAI is less sure than" htmlFor="bh-conf">
                  <select id="bh-conf" className="gc-input gc-select" value={b.confidence} onChange={(e) => put('confidence', +e.target.value)}>{CONFIDENCE.map((n) => <option key={n} value={n}>{n}%</option>)}</select>
                </Field>
                <Field label="Hand to a person after" htmlFor="bh-max" help="AI replies without solving it">
                  <select id="bh-max" className="gc-input gc-select" value={b.maxReplies} onChange={(e) => put('maxReplies', +e.target.value)}>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n === 1 ? '1 AI reply' : n + ' AI replies'}</option>)}</select>
                </Field>
              </div>
            </div>
          </section>

          {/* ---- voice ---- */}
          <section className="ix-card bh-sec" aria-labelledby="bh-voice-h">
            <div className="bh-head"><h2 id="bh-voice-h">Voice</h2></div>
            <div className="ga-body">
              <div className="ga-row">
                <Field label="Tone" htmlFor="bh-tone">{sel('tone', TONES)}</Field>
                <Field label="Language" htmlFor="bh-language" help="Auto answers in Bangla when the person writes in Bangla.">{sel('language', LANGS)}</Field>
                <Field label="Reply length" htmlFor="bh-length">{sel('length', LENGTHS)}</Field>
              </div>
            </div>
          </section>

          {/* ---- escalation ---- */}
          <section className="ix-card bh-sec" aria-labelledby="bh-esc-h">
            <div className="bh-head"><h2 id="bh-esc-h">Escalation rules <InfoTip text="When GridAI hands a conversation over, it goes to the team of the first rule that fits." /></h2>
              <button type="button" className="ix-btn ix-btn--sm" onClick={() => put('escalation', [...b.escalation, { id: 'e' + Date.now(), when: '', to: TEAMS[0] }])}><Icon name="plus" width="14" height="14" aria-hidden="true" />Add rule</button></div>
            <div className="ga-body">
              <ul className="bh-rules">
                {b.escalation.map((r, i) => (
                  <li key={r.id}>
                    <input className={'gc-input' + (errs.escalation && !r.when.trim() ? ' gc-input--error' : '')} aria-label={'Rule ' + (i + 1) + ': when'} value={r.when} placeholder="When… (for example: a payment is not found)" onChange={(e) => setRule(i, { when: e.target.value })} />
                    <select className="gc-input gc-select" aria-label={'Rule ' + (i + 1) + ': hand to'} value={r.to} onChange={(e) => setRule(i, { to: e.target.value })}>{TEAMS.map((x) => <option key={x} value={x}>{x}</option>)}</select>
                    <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={'Remove rule ' + (i + 1)} disabled={b.escalation.length === 1} onClick={() => put('escalation', b.escalation.filter((_, j) => j !== i))}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button>
                  </li>
                ))}
              </ul>
              {errs.escalation ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{errs.escalation}</p> : null}
            </div>
          </section>

          {/* ---- handoff ---- */}
          <section className="ix-card bh-sec" aria-labelledby="bh-hand-h">
            <div className="bh-head"><h2 id="bh-hand-h">Human handoff</h2></div>
            <div className="ga-body" style={{ gap: 0 }}>
              {HANDOFF.map(([k, l]) => <div key={k} className="ga-sw"><span>{l}</span><Switch on={!!b.handoff[k]} label={l} onToggle={() => putIn('handoff', k, !b.handoff[k])} /></div>)}
            </div>
          </section>

          {/* ---- sensitive actions ---- */}
          <section className="ix-card bh-sec" aria-labelledby="bh-sens-h">
            <div className="bh-head"><h2 id="bh-sens-h">Sensitive actions <InfoTip text="Actions that touch money or an account. Needs approval: GridAI asks the approver and tells the person it is being checked. Never: GridAI hands the conversation to a person." /></h2></div>
            <div className="ga-body">
              <ul className="bh-rules bh-sens">
                {b.sensitive.map((s) => (
                  <li key={s.id}>
                    <span>{s.label}</span>
                    <select className="gc-input gc-select" aria-label={s.label + ': rule'} value={s.rule} onChange={(e) => setSens(s.id, { rule: e.target.value })}>{RULES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                    <select className="gc-input gc-select" aria-label={s.label + ': approver'} value={s.approver} disabled={s.rule !== 'approval'} onChange={(e) => setSens(s.id, { approver: e.target.value })}>{APPROVERS.map((x) => <option key={x} value={x}>{'Approver: ' + x}</option>)}</select>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ---- approvals ---- */}
          <section className="ix-card bh-sec" aria-labelledby="bh-appr-h">
            <div className="bh-head"><h2 id="bh-appr-h">Approval requirements</h2></div>
            <div className="ga-body">
              <div className="ga-row">
                <Field label="Wait for the approver" htmlFor="bh-wait" error={errs.wait} help="Minutes">
                  <input id="bh-wait" className={'gc-input' + (errs.wait ? ' gc-input--error' : '')} inputMode="numeric" value={b.approvals.waitMin} onChange={(e) => putIn('approvals', 'waitMin', +e.target.value.replace(/[^\d]/g, '') || 0)} />
                </Field>
                <Field label="If nobody answers in time" htmlFor="bh-timeout">
                  <select id="bh-timeout" className="gc-input gc-select" value={b.approvals.onTimeout} onChange={(e) => putIn('approvals', 'onTimeout', e.target.value)}>
                    <option value="person">Hand the conversation to a person</option><option value="wait">Tell the person it is still being checked</option>
                  </select>
                </Field>
              </div>
              <div className="ga-sw"><span>Tell the approver at once<small>In the Inbox and by SMS.</small></span><Switch on={b.approvals.notify} label="Tell the approver at once" onToggle={() => putIn('approvals', 'notify', !b.approvals.notify)} /></div>
            </div>
          </section>

          {/* ---- working hours ---- */}
          <section className="ix-card bh-sec" aria-labelledby="bh-hours-h">
            <div className="bh-head"><h2 id="bh-hours-h">Working hours</h2></div>
            <div className="ga-body">
              <div className="ga-row">
                <Field label="Hours (Dhaka time)" htmlFor="bh-from" error={errs.hours}>
                  <span className="bh-time">
                    <input id="bh-from" type="time" className="gc-input" value={b.hours.from} onChange={(e) => putIn('hours', 'from', e.target.value)} />
                    <span className="ix-muted">to</span>
                    <input type="time" aria-label="Working hours end" className="gc-input" value={b.hours.to} onChange={(e) => putIn('hours', 'to', e.target.value)} />
                  </span>
                </Field>
                <Field label="Outside working hours" htmlFor="bh-outside">
                  <select id="bh-outside" className="gc-input gc-select" value={b.hours.outside} onChange={(e) => putIn('hours', 'outside', e.target.value)}>
                    <option value="answer">GridAI answers; handoffs wait for the morning</option><option value="collect">GridAI only takes a message</option>
                  </select>
                </Field>
              </div>
              <div className="ga-field"><span className="gc-label">Working days</span>
                <div className="bh-days" role="group" aria-label="Working days">{DAY_NAMES.map(([n, l]) => <button key={n} type="button" aria-pressed={b.hours.days.includes(n)} onClick={() => toggleDay(n)}>{l}</button>)}</div>
                {errs.days ? <p className="gc-help gc-help--error" role="alert">{errs.days}</p> : null}
              </div>
            </div>
          </section>

          {/* ---- limits ---- */}
          <section className="ix-card bh-sec" aria-labelledby="bh-lim-h">
            <div className="bh-head"><h2 id="bh-lim-h">Limits <InfoTip text="GridAI keeps these even when someone asks it to do otherwise." /></h2></div>
            <div className="ga-body">
              <div className="ga-row">
                <Field label="Banned topics" htmlFor="bh-banned" help="Separate with commas"><textarea id="bh-banned" className="gc-input ga-area" rows={3} value={b.banned} onChange={(e) => put('banned', e.target.value)} /></Field>
                <Field label="Never promise or share" htmlFor="bh-never"><textarea id="bh-never" className="gc-input ga-area" rows={3} value={b.never} onChange={(e) => put('never', e.target.value)} /></Field>
              </div>
            </div>
          </section>

          {/* ---- history ---- */}
          <section className="ix-card" aria-labelledby="bh-hist-h">
            <div className="bh-head"><h2 id="bh-hist-h">Change history</h2>{d.history.length > 6 ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setAll(!all)}>{all ? 'Show less' : 'Show all ' + d.history.length}</button> : null}</div>
            {hist.length ? (
              <ul className="bh-hist">
                {hist.map((h) => <li key={h.id}><Icon name="history" width="16" height="16" aria-hidden="true" style={{ marginTop: 2, color: 'var(--text-muted)' }} /><span>{h.what}<small>{h.by} · {ago(h.at, t)}</small></span></li>)}
              </ul>
            ) : <p className="ga-body ix-muted" style={{ margin: 0 }}>No changes yet.</p>}
          </section>

          {dirty ? (
            <div className="bh-save" role="region" aria-label="Unsaved changes">
              <span><Icon name="circle-dot" width="14" height="14" aria-hidden="true" />Unsaved changes</span>
              <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={discard}>Discard</button>
              <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={save}>Save</button>
            </div>
          ) : null}
        </div>
      )}
    </AdminShell>
  );
}
