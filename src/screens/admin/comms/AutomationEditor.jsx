'use client';
// Communications › Automations › one automation (/admin/automations/edit?id=&tab=runs) — the editor in the look of the
// merchant panel's Workflow builder: back to Automations, the name with its On badge, Test run, Save; one card with the
// Editor / Runs views. The editor draws the flow top to bottom on the dotted canvas (trigger → wait → send SMS / email →
// condition → tell a person → stop), a + between steps adds one there, and the picked step's settings sit in the side
// column (trigger and its day, wait time, template and language, the condition, who to tell; move up / down, delete).
// Test run walks the flow for a sample merchant or lead and sends nothing. UI only: lib/admin/comms.js (saveAutomation,
// setAutomationOn, duplicateAutomation, deleteAutomation, automationRuns).

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, StatusBadge, EmptyState, InfoTip } from '@/components/ui';
import { RecordHeader, IndexTabs, KV } from '@/components/ui/IndexKit';
import {
  automationBy, saveAutomation, setAutomationOn, duplicateAutomation, deleteAutomation, automationRuns, sendCounts, stepTitle,
  TRIGGERS, triggerLabel, STEP_TYPES, CONDITIONS, templateBy, contacts, varsFor, smsParts, fill, primaryProvider, CH_LABEL,
} from '@/lib/admin/comms';
import { rng } from '@/lib/platform/util';
import { AdminShell } from '../AdminShell';
import { useComms, COMMS_CSS, Preview, num, money2, plural, whenText } from './commsShared';

// node look, as in the Workflow builder: [icon, background, colour, small label]
const LOOK = {
  trigger: ['zap', 'var(--fill-primary-soft)', 'var(--primary)', 'Trigger'],
  wait: ['clock', 'var(--slate-100)', 'var(--slate-600)', 'Wait'],
  sms: ['message-square', 'var(--fill-secondary-soft)', 'var(--secondary-focus)', 'SMS'],
  email: ['mail', 'var(--fill-info-soft)', 'var(--text-info)', 'Email'],
  condition: ['git-branch', 'var(--fill-warning-soft)', 'var(--text-warning)', 'Condition'],
  notify: ['bell', 'var(--fill-accent-soft)', 'var(--accent-text)', 'Team'],
  stop: ['circle-stop', 'var(--fill-error-soft)', 'var(--text-danger)', 'Stop'],
};
const WHO = ['Account manager', 'Sales team', 'Support team', 'Finance team', 'Onboarding team'];
const UNITS = ['minutes', 'hours', 'days', 'hours before'];
const TRIG_TEXT = {
  trial_day: (v) => `Trial day ${v}`, renewal_in: (v) => `${v} days before renewal`, invoice_overdue: (v) => `Invoice ${v} day${v === 1 ? '' : 's'} overdue`,
  payment_received: () => 'A payment is recorded', store_live: () => 'Store goes live', new_lead: () => 'A lead is added', demo_booked: () => 'A demo is booked',
  ticket_solved: () => 'A ticket is solved', schedule: (v) => v || 'On a schedule',
};
const HAS_DAY = ['trial_day', 'renewal_in', 'invoice_overdue'];

const CSS = `
.ae-card{overflow:clip}
.ae-bar{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);min-height:44px;padding:6px 8px;border-bottom:1px solid var(--border-subtle)}
.ae-bar .ix-tabs{flex:none}
.ae-note{flex:1;min-width:0;font-size:var(--text-xs);color:var(--text-muted);text-align:right}
.ae-wrap{display:grid;grid-template-columns:minmax(0,1fr) 340px;align-items:start}
.ae-canvas{display:flex;flex-direction:column;align-items:center;min-height:560px;padding:var(--space-6) var(--space-4) var(--space-8);background-color:var(--slate-50);background-image:radial-gradient(var(--slate-300) 1px,transparent 1px);background-size:20px 20px}
.ae-node{display:flex;align-items:center;gap:var(--space-3);width:min(100%,380px);min-height:60px;padding:10px 12px;border:2px solid var(--slate-300);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-xs);font:inherit;text-align:left;cursor:pointer}
.ae-node:hover{border-color:var(--slate-400)}
.ae-node.is-sel{border-color:var(--primary);box-shadow:0 0 0 4px var(--fill-primary-soft-hover)}
.ae-node.is-trig{border-radius:30px var(--radius-xl) var(--radius-xl) 30px}
.ae-node.is-bad{border-color:var(--warning)}
.ae-node:focus-visible{outline:2px solid var(--primary);outline-offset:3px}
.ae-ico{flex:none;display:grid;place-items:center;width:36px;height:36px;border-radius:var(--radius-lg)}
.ae-node__txt{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.ae-node__txt small{font-size:var(--text-2xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.ae-node__txt b{overflow:hidden;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.ae-node__n{flex:none;font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.ae-link{position:relative;display:flex;flex-direction:column;align-items:center;height:52px}
.ae-link::before{content:'';position:absolute;top:0;bottom:0;left:50%;width:2px;margin-left:-1px;background:var(--slate-400)}
.ae-link.is-ran::before{background:var(--fill-success)}
.ae-plus{position:relative;z-index:1;display:grid;place-items:center;width:28px;height:28px;margin-top:12px;padding:0;border:1.5px solid var(--slate-400);border-radius:var(--radius-full);background:var(--surface-card);color:var(--slate-600);cursor:pointer}
.ae-plus:hover,.ae-plus[aria-expanded="true"]{border-color:var(--primary);color:var(--primary)}
.ae-plus:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
.ae-no{position:absolute;left:calc(50% + 14px);top:16px;padding:1px 8px;border-radius:var(--radius-full);background:var(--slate-50);font-size:var(--text-2xs);font-weight:var(--weight-medium);color:var(--text-danger);white-space:nowrap}
.ae-add{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;width:min(100%,380px);margin:4px 0 8px;padding:8px;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-lg)}
.ae-add button{display:flex;align-items:center;gap:8px;min-height:36px;padding:6px 8px;border:0;border-radius:var(--radius-lg);background:none;font:inherit;font-size:var(--text-xs);color:var(--text-heading);text-align:left;cursor:pointer}
.ae-add button:hover{background:var(--surface-subtle)}
.ae-add .ae-ico{width:24px;height:24px}
.ae-end{margin-top:8px;font-size:var(--text-xs);color:var(--text-muted)}
.ae-side{display:flex;flex-direction:column;gap:var(--space-4);padding:var(--space-4);border-left:1px solid var(--border-subtle);min-width:0}
.ae-side h3{display:flex;align-items:center;gap:var(--space-2);margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ae-acts{display:flex;flex-wrap:wrap;gap:var(--space-2);padding-top:var(--space-3);border-top:1px solid var(--border-subtle)}
.ae-runs{padding:0 var(--space-4) var(--space-2)}
.ae-test{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.ae-test li{display:flex;gap:var(--space-2);padding:8px 0;border-top:1px solid var(--border-subtle)}
.ae-test li:first-child{border-top:0}
.ae-test li>svg{flex:none;margin-top:2px}
.ae-test li.is-ok>svg{color:var(--text-success)}
.ae-test li.is-no>svg{color:var(--text-danger)}
.ae-test li.is-skip>svg{color:var(--text-muted)}
.ae-test span{display:flex;flex-direction:column;gap:2px;min-width:0}
.ae-test b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ae-test small{font-size:var(--text-xs);color:var(--text-muted);overflow-wrap:anywhere}
@media (max-width:1100px){.ae-wrap{grid-template-columns:minmax(0,1fr)}.ae-side{border-left:0;border-top:1px solid var(--border-subtle)}}
@media (max-width:640px){.ae-note{flex:1 1 100%;text-align:left}.ae-canvas{min-height:0;padding:var(--space-4) var(--space-3)}.ae-add{grid-template-columns:repeat(2,minmax(0,1fr))}}
`;

const shape = (a) => ({ name: a.name, trigger: a.trigger, value: a.value, audience: a.audience, kind: a.kind, steps: a.steps.map((s) => ({ ...s })) });

export default function AutomationEditor() {
  const router = useRouter();
  const { data, t, live } = useComms();
  const [q, setQ] = useState(null);
  useEffect(() => { const p = new URLSearchParams(window.location.search); setQ({ id: p.get('id') || '', tab: p.get('tab') === 'runs' ? 'runs' : 'editor' }); }, []);
  const a = live && q ? automationBy(data, q.id) : null;
  let page;
  if (!live || !q) page = <div className="ix-page" aria-busy="true"><div className="cm-skel cm-skel--strip" /><div className="cm-skel" style={{ height: 560 }} /></div>;
  else if (!a) page = <section className="ix-card"><div className="ix-empty"><EmptyState icon="workflow" title="This automation doesn’t exist." actionLabel="All automations" onAction={() => router.push('/admin/automations')} /></div></section>;
  else page = <Editor key={a.id} a={a} data={data} t={t} firstTab={q.tab} />;
  return (
    <AdminShell active="automations" title={a ? a.name : 'Automation'}>
      <style dangerouslySetInnerHTML={{ __html: COMMS_CSS + CSS }} />
      <div className="ix-page">{page}</div>
    </AdminShell>
  );
}

function Editor({ a, data, t, firstTab = 'editor' }) {
  const router = useRouter();
  const [d, setD] = useState(() => shape(a));
  const [sel, setSel] = useState(a.steps[0].id);
  const [adding, setAdding] = useState(null);     // index after which a step is being added
  const [tab, setTab] = useState(firstTab);
  const [test, setTest] = useState(null);          // { who, steps } after a test run
  const [ran, setRan] = useState([]);
  const dirty = JSON.stringify(d) !== JSON.stringify(shape(a));
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const steps = d.steps;
  const idx = steps.findIndex((s) => s.id === sel);
  const cur = idx >= 0 ? steps[idx] : null;
  const setStep = (patch) => setD((x) => ({ ...x, steps: x.steps.map((s) => (s.id === sel ? { ...s, ...patch } : s)) }));
  const nextId = () => 's' + (Math.max(0, ...steps.map((s) => Number(String(s.id).replace(/\D/g, '')) || 0)) + 1);
  const add = (after, type) => {
    const id = nextId();
    const tpl = type === 'sms' || type === 'email' ? (data.templates.find((x) => x.ch === type && x.status === 'Active' && x.purpose === (d.audience === 'leads' ? 'promo' : 'reminder')) || data.templates.find((x) => x.ch === type && x.status === 'Active') || {}).id : undefined;
    const s = { id, type, ...(type === 'wait' ? { n: 1, unit: 'days' } : {}), ...(tpl ? { tpl, lang: 'auto' } : {}), ...(type === 'condition' ? { field: CONDITIONS[0] } : {}), ...(type === 'notify' ? { who: WHO[0] } : {}) };
    setD((x) => { const n = x.steps.slice(); n.splice(after + 1, 0, s); return { ...x, steps: n }; });
    setSel(id); setAdding(null); setRan([]);
  };
  const move = (dir) => {
    if (idx < 1) return;
    const to = idx + dir;
    if (to < 1 || to >= steps.length) return;
    setD((x) => { const n = x.steps.slice(); const [s] = n.splice(idx, 1); n.splice(to, 0, s); return { ...x, steps: n }; });
  };
  const remove = () => {
    if (idx < 1) return;
    const prev = steps[idx - 1].id;
    setD((x) => ({ ...x, steps: x.steps.filter((s) => s.id !== sel) }));
    setSel(prev); toast('Step removed. Save to keep the change.');
  };
  const setTrigger = (trigger) => {
    const value = HAS_DAY.includes(trigger) ? (trigger === 'trial_day' ? 7 : trigger === 'renewal_in' ? 7 : 1) : trigger === 'schedule' ? '1st of the month, 10:00' : undefined;
    const audience = (TRIGGERS.find((x) => x[0] === trigger) || [])[2] || d.audience;
    setD((x) => ({ ...x, trigger, value, audience, kind: trigger === 'schedule' ? 'schedule' : x.kind === 'schedule' ? 'event' : x.kind, steps: x.steps.map((s, i) => (i === 0 ? { ...s, when: TRIG_TEXT[trigger](value) } : s)) }));
  };
  const setValue = (value) => setD((x) => ({ ...x, value, steps: x.steps.map((s, i) => (i === 0 ? { ...s, when: TRIG_TEXT[x.trigger](value) } : s)) }));

  const save = () => {
    const r = saveAutomation(a.id, d);
    if (!r.ok) { toast(r.error, { tone: 'error' }); return; }
    toast('Automation saved');
  };
  const toggleOn = () => {
    if (dirty) { toast('Save your changes first.', { tone: 'error' }); return; }
    const r = setAutomationOn(a.id, !a.on);
    toast(r.ok ? (a.on ? 'Automation turned off. Messages already waiting are not sent.' : 'Automation turned on. It runs from the next matching event.') : r.error, r.ok ? undefined : { tone: 'error' });
  };
  const dup = () => { const r = duplicateAutomation(a.id); if (r.ok) { toast('Copy made, turned off'); router.push('/admin/automations/edit?id=' + r.id); } };
  const del = async () => {
    if (!(await confirmDialog({ title: `Delete “${a.name}”?`, body: 'It stops at once and can’t be brought back. Messages already sent stay in the history.', confirmLabel: 'Delete', tone: 'danger' }))) return;
    const r = deleteAutomation(a.id);
    if (r.ok) { toast('Automation deleted'); router.push('/admin/automations'); }
  };
  const back = async () => {
    if (dirty && !(await confirmDialog({ title: 'Leave without saving?', body: 'Your changes to this automation are lost.', confirmLabel: 'Leave', tone: 'danger' }))) return;
    router.push('/admin/automations');
  };
  const runTest = () => {
    const pool = contacts().filter((c) => c.k === (d.audience === 'leads' ? 'lead' : 'merchant'));
    const r = rng(a.id + steps.length + (test ? test.n + 1 : 0));
    const who = r.pick(pool);
    const prov = { sms: primaryProvider(data, 'sms'), email: primaryProvider(data, 'email') };
    const out = [];
    const path = [];
    let stopped = false;
    for (const s of steps) {
      if (stopped) { out.push({ s, kind: 'skip', title: stepTitle(data, s), note: 'Not reached' }); continue; }
      path.push(s.id);
      if (s.type === 'trigger') out.push({ s, kind: 'ok', title: s.when, note: `Matched for ${who.org} (${who.name})` });
      else if (s.type === 'wait') out.push({ s, kind: 'skip', title: `Wait ${s.n} ${s.unit}`, note: 'Skipped in a test' });
      else if (s.type === 'sms' || s.type === 'email') {
        const tp = templateBy(data, s.tpl);
        if (!tp) { out.push({ s, kind: 'no', title: stepTitle(data, s), note: 'No template picked: this step would fail' }); stopped = true; continue; }
        const lang = s.lang === 'auto' ? who.lang || 'en' : s.lang;
        const side = tp[lang] && tp[lang].body ? tp[lang] : tp.en;
        const text = fill(side.body, varsFor(who, t));
        const parts = s.type === 'sms' ? smsParts(text).parts : 1;
        const p = prov[s.type];
        out.push({ s, kind: p ? 'ok' : 'no', title: `Would send “${tp.name}” to ${s.type === 'sms' ? who.phone : who.email}`, note: p ? `${lang === 'bn' ? 'Bangla' : 'English'} · ${s.type === 'sms' ? plural(parts, 'part') + ' · ' : ''}${money2(parts * p.rate)} via ${p.name}` : `No ${CH_LABEL[s.type]} provider is on` });
      } else if (s.type === 'condition') {
        const yes = r() < 0.6;
        out.push({ s, kind: yes ? 'ok' : 'no', title: `${s.field}: ${yes ? 'yes' : 'no'}`, note: yes ? 'Carries on' : 'The flow stops here for this recipient' });
        if (!yes) stopped = true;
      } else if (s.type === 'notify') out.push({ s, kind: 'ok', title: `Would tell the ${String(s.who).toLowerCase()}`, note: 'A task and a notification in the panel' });
      else { out.push({ s, kind: 'ok', title: 'Stop', note: 'The flow ends' }); stopped = true; }
    }
    setRan(path);
    setTest({ who, out, n: (test ? test.n : 0) + 1 });
  };

  const c = sendCounts(data, a, t);
  const runs = automationRuns(data, a, t);
  const badStep = (s) => (s.type === 'sms' || s.type === 'email') && !templateBy(data, s.tpl);
  const tpls = (ch) => data.templates.filter((x) => x.ch === ch && (x.status === 'Active' || (cur && x.id === cur.tpl)));

  const stepSettings = cur ? (() => {
    if (cur.type === 'trigger') {
      return (
        <div className="cm-form">
          <div className="cm-field"><label className="gc-label" htmlFor="ae-trig">Starts when</label>
            <select id="ae-trig" className="gc-input gc-select" value={d.trigger} onChange={(e) => setTrigger(e.target.value)}>{TRIGGERS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          {HAS_DAY.includes(d.trigger) ? (
            <div className="cm-field"><label className="gc-label" htmlFor="ae-day">{d.trigger === 'trial_day' ? 'Trial day' : d.trigger === 'renewal_in' ? 'Days before renewal' : 'Days overdue'}</label>
              <input id="ae-day" type="number" min="1" max="60" className="gc-input cm-fig" value={d.value ?? ''} onChange={(e) => setValue(Math.max(1, Math.min(60, Number(e.target.value) || 1)))} /></div>
          ) : d.trigger === 'schedule' ? (
            <div className="cm-field"><label className="gc-label" htmlFor="ae-sch">When</label>
              <select id="ae-sch" className="gc-input gc-select" value={d.value} onChange={(e) => setValue(e.target.value)}>
                {['1st of the month, 10:00', 'Every Sunday, 10:00', 'Every day, 09:00', 'Before planned maintenance, 18:00'].map((x) => <option key={x}>{x}</option>)}
              </select></div>
          ) : null}
          <div className="cm-field"><label className="gc-label" htmlFor="ae-aud">Sends to</label>
            <select id="ae-aud" className="gc-input gc-select" value={d.audience} onChange={(e) => setD({ ...d, audience: e.target.value })}><option value="merchants">Merchants (store owners)</option><option value="leads">Leads</option></select></div>
          <div className="cm-field"><span className="gc-label">Kind</span>
            <div className="ix-chips" role="group" aria-label="Kind">{[['event', 'Event'], ['schedule', 'Scheduled'], ['sequence', 'Sequence']].map(([k, l]) => <button key={k} type="button" className="ix-chip" aria-pressed={d.kind === k} onClick={() => setD({ ...d, kind: k })}>{l}</button>)}</div></div>
        </div>
      );
    }
    if (cur.type === 'wait') {
      return (
        <div className="cm-two">
          <div className="cm-field"><label className="gc-label" htmlFor="ae-n">Wait</label><input id="ae-n" type="number" min="1" className="gc-input cm-fig" value={cur.n} onChange={(e) => setStep({ n: Math.max(1, Number(e.target.value) || 1) })} /></div>
          <div className="cm-field"><label className="gc-label" htmlFor="ae-unit">Unit</label><select id="ae-unit" className="gc-input gc-select" value={cur.unit} onChange={(e) => setStep({ unit: e.target.value })}>{UNITS.map((u) => <option key={u}>{u}</option>)}</select></div>
        </div>
      );
    }
    if (cur.type === 'sms' || cur.type === 'email') {
      const tp = templateBy(data, cur.tpl);
      const lang = cur.lang === 'bn' ? 'bn' : 'en';
      const sideT = tp ? (tp[lang] && tp[lang].body ? tp[lang] : tp.en) : null;
      return (
        <div className="cm-form">
          <div className="cm-field"><label className="gc-label" htmlFor="ae-tpl">Template</label>
            <select id="ae-tpl" className={'gc-input gc-select' + (tp ? '' : ' gc-input--error')} value={cur.tpl || ''} onChange={(e) => setStep({ tpl: e.target.value })}>
              <option value="">Pick a template</option>{tpls(cur.type).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
            {tp ? <Link href={'/admin/templates/edit?id=' + tp.id} className="gc-help" style={{ margin: 0 }}>Edit this template</Link> : <p className="gc-help gc-help--error" style={{ margin: 0 }}>Pick a template, or the step fails.</p>}</div>
          <div className="cm-field"><label className="gc-label" htmlFor="ae-lang">Language <InfoTip text="Recipient’s language uses the language on the merchant or lead (Bangla or English); English when the Bangla text is empty." /></label>
            <select id="ae-lang" className="gc-input gc-select" value={cur.lang || 'auto'} onChange={(e) => setStep({ lang: e.target.value })}><option value="auto">Recipient’s language</option><option value="en">English</option><option value="bn">বাংলা</option></select></div>
          {sideT ? <Preview ch={cur.type} subject={sideT.subject} body={sideT.body} vars={varsFor(null, t)} lang={lang} /> : null}
        </div>
      );
    }
    if (cur.type === 'condition') {
      return (
        <div className="cm-field"><label className="gc-label" htmlFor="ae-cond">Go on only if</label>
          <select id="ae-cond" className="gc-input gc-select" value={cur.field} onChange={(e) => setStep({ field: e.target.value })}>{CONDITIONS.map((x) => <option key={x}>{x}</option>)}</select>
          <p className="gc-help" style={{ margin: 0 }}>When it is not true, the flow stops for that {d.audience === 'leads' ? 'lead' : 'store'}.</p></div>
      );
    }
    if (cur.type === 'notify') {
      return (
        <div className="cm-field"><label className="gc-label" htmlFor="ae-who">Tell</label>
          <select id="ae-who" className="gc-input gc-select" value={cur.who} onChange={(e) => setStep({ who: e.target.value })}>{WHO.map((x) => <option key={x}>{x}</option>)}</select>
          <p className="gc-help" style={{ margin: 0 }}>They get a task with the store or lead and a notification in the panel.</p></div>
      );
    }
    return <p className="cm-empty" style={{ margin: 0 }}>The flow ends here.</p>;
  })() : null;

  return (
    <>
      <RecordHeader onBack={back} backLabel="Automations" title={d.name || 'Untitled automation'}
        badges={<StatusBadge tone={a.on ? 'success' : 'neutral'}>{a.on ? 'On' : 'Off'}</StatusBadge>}
        meta={`${triggerLabel(d.trigger)} · sends to ${d.audience === 'leads' ? 'leads' : 'merchants'} · ${num(c.d30)} sent in 30 days · changed ${whenText(a.updatedAt, t)} by ${a.by}`}
        about="Build the flow from its trigger down: waits, SMS and email from templates, conditions that stop it, and people to tell. Test run walks it for a sample merchant or lead and sends nothing. Save, then turn it on."
        secondary={[{ label: 'Test run', icon: 'play', onClick: runTest }]}
        more={[{ label: a.on ? 'Turn off' : 'Turn on', onClick: toggleOn }, { label: 'Duplicate', onClick: dup }, { label: 'Delete', onClick: del, tone: 'danger' }]}
        primary={{ label: dirty ? 'Save' : 'Saved', icon: dirty ? undefined : 'check', onClick: save, disabled: !dirty }} />

      <section className="ix-card ae-card" aria-label="Automation">
        <div className="ae-bar">
          <IndexTabs label="Automation views" tabs={[['editor', 'Editor'], ['runs', 'Runs']].map(([k, l]) => ({ key: k, id: 'ae-tab-' + k, label: l, count: k === 'runs' ? runs.length : null, on: tab === k, onClick: () => setTab(k) }))} />
          <span className="ae-note">{test ? `Last test: ${test.who.org} · ${test.out.filter((x) => x.kind !== 'skip').length} of ${steps.length} steps ran · nothing sent` : 'Test run uses a real merchant or lead. Nothing is sent.'}</span>
        </div>
        {tab === 'editor' ? (
          <div className="ae-wrap">
            <div className="ae-canvas" aria-label="Steps">
              {steps.map((s, i) => {
                const look = LOOK[s.type];
                return (
                  <React.Fragment key={s.id}>
                    <button type="button" className={'ae-node' + (s.type === 'trigger' ? ' is-trig' : '') + (sel === s.id ? ' is-sel' : '') + (badStep(s) ? ' is-bad' : '')} aria-pressed={sel === s.id} onClick={() => { setSel(s.id); setAdding(null); }}>
                      <span className="ae-ico" style={{ background: look[1], color: look[2] }} aria-hidden="true"><Icon name={look[0]} width="18" height="18" /></span>
                      <span className="ae-node__txt"><small>{look[3]}</small><b>{s.type === 'trigger' ? s.when : stepTitle(data, s).replace(/^(SMS|Email): /, '')}</b></span>
                      {ran.includes(s.id) ? <Icon name="circle-check" width="16" height="16" aria-label="Ran in the test" style={{ color: 'var(--text-success)' }} /> : <span className="ae-node__n">{i === 0 ? '' : i}</span>}
                    </button>
                    {s.type !== 'stop' ? (
                      <div className={'ae-link' + (ran.includes(s.id) && steps[i + 1] && ran.includes(steps[i + 1].id) ? ' is-ran' : '')}>
                        <button type="button" className="ae-plus" aria-label={`Add a step after “${s.type === 'trigger' ? s.when : stepTitle(data, s)}”`} aria-expanded={adding === i} onClick={() => setAdding(adding === i ? null : i)}><Icon name="plus" width="14" height="14" aria-hidden="true" /></button>
                        {s.type === 'condition' ? <span className="ae-no">if not: stop</span> : null}
                      </div>
                    ) : null}
                    {adding === i ? (
                      <div className="ae-add" role="menu" aria-label="Add a step">
                        {STEP_TYPES.map(([k, l]) => <button key={k} type="button" role="menuitem" onClick={() => add(i, k)}><span className="ae-ico" style={{ background: LOOK[k][1], color: LOOK[k][2] }} aria-hidden="true"><Icon name={LOOK[k][0]} width="14" height="14" /></span>{l}</button>)}
                      </div>
                    ) : null}
                  </React.Fragment>
                );
              })}
              {steps[steps.length - 1].type !== 'stop' ? <span className="ae-end">End of the flow</span> : null}
            </div>
            <aside className="ae-side" aria-label="Settings">
              <div className="cm-field"><label className="gc-label" htmlFor="ae-name">Name</label><input id="ae-name" className="gc-input" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} /></div>
              {cur ? (
                <>
                  <h3><span className="ae-ico" style={{ width: 28, height: 28, background: LOOK[cur.type][1], color: LOOK[cur.type][2] }} aria-hidden="true"><Icon name={LOOK[cur.type][0]} width="16" height="16" /></span>{idx === 0 ? 'Trigger' : `Step ${idx} · ${(STEP_TYPES.find((x) => x[0] === cur.type) || [])[1]}`}</h3>
                  {stepSettings}
                  {idx > 0 ? (
                    <div className="ae-acts">
                      <button type="button" className="ix-btn ix-btn--sm" onClick={() => move(-1)} disabled={idx <= 1}><Icon name="arrow-up" width="16" height="16" aria-hidden="true" />Up</button>
                      <button type="button" className="ix-btn ix-btn--sm" onClick={() => move(1)} disabled={idx >= steps.length - 1}><Icon name="arrow-down" width="16" height="16" aria-hidden="true" />Down</button>
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--danger" onClick={remove}><Icon name="trash-2" width="16" height="16" aria-hidden="true" />Delete step</button>
                    </div>
                  ) : null}
                </>
              ) : <p className="cm-empty">Pick a step to change it.</p>}
              <KV rows={[['Sent, 7 days', num(c.d7)], ['Failed, 7 days', c.f7 ? String(c.f7) : '0'], ['Last run', a.lastRun ? whenText(a.lastRun, t) : 'Never']]} />
            </aside>
          </div>
        ) : (
          <div className="ae-runs">
            {runs.length ? (
              <ul className="ae-test" aria-label="Runs">
                {runs.map((r) => (
                  <li key={r.id} className={r.ok ? 'is-ok' : 'is-no'}>
                    <Icon name={r.ok ? 'circle-check' : 'circle-x'} width="16" height="16" aria-hidden="true" />
                    <span><b>{r.who}</b><small>{whenText(r.at, t)} · {r.path}{r.ok ? '' : ' · ' + r.note}</small></span>
                  </li>
                ))}
              </ul>
            ) : <div className="ix-empty"><EmptyState icon="history" title={a.on ? 'It hasn’t run yet.' : 'It is off, so it doesn’t run.'} actionLabel={a.on ? undefined : 'Turn on'} onAction={a.on ? undefined : toggleOn} /></div>}
          </div>
        )}
      </section>

      <Sheet open={!!test} title="Test run" onClose={() => setTest(null)}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setTest(null)}>Close</button><button type="button" className="gc-btn gc-btn--solid" onClick={runTest}>Run again</button></>}>
        {test ? (
          <div className="cm-form">
            <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>For <b>{test.who.org}</b> · {test.who.name}. Nothing was sent{dirty ? '; this uses your unsaved steps' : ''}.</p>
            <ol className="ae-test" aria-label="What would happen">
              {test.out.map((x, i) => (
                <li key={i} className={'is-' + x.kind}>
                  <Icon name={x.kind === 'ok' ? 'circle-check' : x.kind === 'no' ? 'circle-x' : 'circle-dashed'} width="16" height="16" aria-hidden="true" />
                  <span><b>{x.title}</b><small>{x.note}</small></span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </Sheet>
    </>
  );
}
