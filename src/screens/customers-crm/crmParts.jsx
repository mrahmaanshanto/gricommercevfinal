'use client';
// crmParts — pieces the Customers pages share: the segment builder (rules joined by AND / OR, a live preview count,
// templates from Recovery), the background jobs card (progress, results, download) and their styles.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { Dialog, StatusBadge } from '@/components/ui';
import { segmentFields, opsFor, previewSegment, saveSegment, SEGMENT_TEMPLATES, getSegment, defText } from '@/lib/segments';
import { getJobs, dismissJob, downloadJob, JOBS_EVENT } from '@/lib/bulkJobs';

export const CRM_PARTS_CSS = `
.ac-form{display:flex;flex-direction:column;gap:var(--space-3)}
.ac-field{display:flex;flex-direction:column}
.crm-rules{display:flex;flex-direction:column;gap:var(--space-2)}
.crm-rule{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr) minmax(0,1fr) auto;gap:var(--space-2);align-items:center}
.crm-group{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3);border:1px dashed var(--border-strong);border-radius:var(--radius-lg)}
.crm-join{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.crm-preview{display:flex;flex-wrap:wrap;align-items:baseline;gap:var(--space-2);padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm)}
.crm-preview b{font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading)}
.crm-preview small{flex-basis:100%;font-size:var(--text-xs);color:var(--text-muted)}
.crm-jobs{display:flex;flex-direction:column}
.crm-job{display:flex;flex-direction:column;gap:6px;padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle)}
.crm-job:first-child{border-top:0}
.crm-job__top{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);font-size:var(--text-sm)}
.crm-job__top b{flex:1 1 200px;min-width:0;font-weight:var(--weight-medium);color:var(--text-heading)}
.crm-job__sub{font-size:var(--text-xs);color:var(--text-muted)}
.crm-job ul{margin:0;padding-left:18px;font-size:var(--text-xs);color:var(--text-body)}
.crm-job .gc-progress{height:6px}
@media (max-width:640px){.crm-rule{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.crm-rule>button{justify-self:end}}
`;

const NEW_RULE = { field: 'spent', op: 'gte', value: 10000 };
function blankValue(f) { if (!f) return ''; if (f.options) return f.options[0][0]; if (f.type === 'money') return 10000; if (f.type === 'days') return 30; if (f.type === 'number') return 1; return ''; }

function RuleRow({ rule, fields, onChange, onRemove }) {
  const f = fields.find((x) => x.key === rule.field) || fields[0];
  const ops = opsFor(f);
  const noValue = ['never', 'empty', 'yes', 'no'].includes(rule.op);
  const groups = [...new Set(fields.map((x) => x.group))];
  const setField = (key) => { const nf = fields.find((x) => x.key === key); onChange({ field: key, op: opsFor(nf)[0][0], value: blankValue(nf) }); };
  return (
    <div className="crm-rule">
      <select className="gc-input gc-select" aria-label="Field" value={rule.field} onChange={(e) => setField(e.target.value)}>
        {groups.map((g) => <optgroup key={g} label={g}>{fields.filter((x) => x.group === g).map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}</optgroup>)}
      </select>
      <select className="gc-input gc-select" aria-label="Condition" value={rule.op} onChange={(e) => onChange({ ...rule, op: e.target.value })}>
        {ops.map(([k, l]) => <option key={k} value={k}>{l.replace(' … days ago', ' days ago').replace(' … days', ' days')}</option>)}
      </select>
      {noValue ? <span /> : f.options || f.type === 'tags' ? (
        f.options ? <select className="gc-input gc-select" aria-label="Value" value={rule.value} onChange={(e) => onChange({ ...rule, value: e.target.value })}>{f.options.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          : <input className="gc-input" aria-label="Value" value={rule.value} onChange={(e) => onChange({ ...rule, value: e.target.value })} placeholder="VIP" />
      ) : <input className="gc-input" aria-label="Value" inputMode={['number', 'money', 'days'].includes(f.type) ? 'numeric' : undefined} value={rule.value} onChange={(e) => onChange({ ...rule, value: ['number', 'money', 'days'].includes(f.type) ? e.target.value.replace(/[^0-9]/g, '') : e.target.value })} />}
      <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Remove rule" onClick={onRemove}><Icon name="x" width="16" height="16" aria-hidden="true" /></button>
    </div>
  );
}
function JoinPick({ join, onChange, label }) {
  return (
    <span className="crm-join">
      <span>{label}</span>
      <span className="gc-seg" role="group" aria-label={label}>
        {[['and', 'All rules (AND)'], ['or', 'Any rule (OR)']].map(([k, l]) => <button key={k} type="button" className={'gc-seg__btn' + (join === k ? ' gc-seg__btn--active' : '')} aria-pressed={join === k} onClick={() => onChange(k)}>{l}</button>)}
      </span>
    </span>
  );
}

/** The segment builder. segment: a saved segment to change, or null for a new one. rows: the customer list. */
export function SegmentBuilder({ open, segment, rows, onClose, onSaved, by }) {
  const [name, setName] = useState('');
  const [def, setDef] = useState({ join: 'and', rules: [NEW_RULE] });
  const [err, setErr] = useState('');
  const [tpl, setTpl] = useState('');
  useEffect(() => {
    if (!open) return;
    setName(segment ? segment.name : ''); setDef(segment ? JSON.parse(JSON.stringify(segment.def)) : { join: 'and', rules: [NEW_RULE] }); setErr(''); setTpl(segment && segment.templateId ? segment.templateId : '');
  }, [open, segment]);
  const fields = useMemo(() => (open ? segmentFields() : []), [open]);
  const preview = useMemo(() => (open ? previewSegment(def, rows) : { count: 0, sample: [] }), [open, def, rows]);
  if (!open) return null;
  const setRule = (i, r) => setDef({ ...def, rules: def.rules.map((x, j) => (j === i ? r : x)) });
  const setGroupRule = (gi, i, r) => setDef({ ...def, rules: def.rules.map((g, j) => (j === gi ? { ...g, rules: g.rules.map((x, k) => (k === i ? r : x)) } : g)) });
  const pickTpl = (id) => { setTpl(id); const t = getSegment(id); if (t) { setDef(JSON.parse(JSON.stringify(t.def))); if (!name.trim()) setName(t.name); } };
  const save = () => {
    const r = saveSegment({ id: segment && !segment.owner ? segment.id : undefined, name, def, templateId: tpl, by });
    if (!r.ok) { setErr(r.error); return; }
    onSaved(r.segment);
  };
  return (
    <Dialog open title={segment && !segment.owner ? 'Edit segment' : 'New segment'} onClose={onClose} width={720} footer={<>
      <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={onClose}>Cancel</button>
      <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={save}>Save segment</button>
    </>}>
      <div className="ac-form">
        <div className="ly-two">
          <div className="ac-field"><label className="gc-label" htmlFor="sb-name">Segment name</label><input id="sb-name" className={'gc-input' + (err ? ' gc-input--error' : '')} value={name} onChange={(e) => { setName(e.target.value); setErr(''); }} maxLength={60} placeholder="e.g. Lapsed big spenders" />{err ? <p className="gc-help gc-help--error">{err}</p> : null}</div>
          <div className="ac-field"><label className="gc-label" htmlFor="sb-tpl">Start from</label>
            <select id="sb-tpl" className="gc-input gc-select" value={tpl} onChange={(e) => pickTpl(e.target.value)}>
              <option value="">Blank</option>{SEGMENT_TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.kind}</option>)}
            </select>
          </div>
        </div>
        <JoinPick join={def.join} label="Customers who match" onChange={(j) => setDef({ ...def, join: j })} />
        <div className="crm-rules">
          {def.rules.map((r, i) => (r.rules ? (
            <div key={i} className="crm-group">
              <JoinPick join={r.join} label="Group:" onChange={(j) => setDef({ ...def, rules: def.rules.map((g, k) => (k === i ? { ...g, join: j } : g)) })} />
              {r.rules.map((gr, k) => <RuleRow key={k} rule={gr} fields={fields} onChange={(nr) => setGroupRule(i, k, nr)} onRemove={() => setDef({ ...def, rules: def.rules.map((g, j) => (j === i ? { ...g, rules: g.rules.filter((_, m) => m !== k) } : g)).filter((g) => !g.rules || g.rules.length) })} />)}
              <span><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setDef({ ...def, rules: def.rules.map((g, j) => (j === i ? { ...g, rules: [...g.rules, NEW_RULE] } : g)) })}>Add rule to group</button></span>
            </div>
          ) : <RuleRow key={i} rule={r} fields={fields} onChange={(nr) => setRule(i, nr)} onRemove={() => setDef({ ...def, rules: def.rules.filter((_, j) => j !== i) })} />))}
          <span className="ix-chips">
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => setDef({ ...def, rules: [...def.rules, NEW_RULE] })}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add rule</button>
            <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setDef({ ...def, rules: [...def.rules, { join: def.join === 'and' ? 'or' : 'and', rules: [NEW_RULE] }] })}>Add group</button>
          </span>
        </div>
        <div className="crm-preview" role="status" aria-live="polite">
          <b className="ly-fig">{preview.count.toLocaleString('en-IN')}</b><span>{preview.count === 1 ? 'customer matches' : 'customers match'}</span>
          <small>{preview.sample.length ? preview.sample.join(', ') + (preview.count > preview.sample.length ? ' …' : '') : 'No one matches yet.'} · {defText(def) || 'No rules: everyone'}</small>
        </div>
      </div>
    </Dialog>
  );
}

const KIND_ICON = { tag: 'tag', untag: 'tag', segment: 'users', consent: 'shield-check', export: 'download' };
/** Background jobs: progress while running, then done / skipped / failed with the reasons. */
export function JobsCard({ onChanged }) {
  const [jobs, setJobs] = useState([]);
  const [open, setOpen] = useState({});
  useEffect(() => {
    let wasRunning = false;
    const tick = () => {
      const j = getJobs();
      setJobs(j);
      const running = j.some((x) => !x.done);
      if (wasRunning && !running && onChanged) onChanged();
      wasRunning = running;
    };
    tick();
    const t = setInterval(tick, 400);
    window.addEventListener(JOBS_EVENT, tick);
    return () => { clearInterval(t); window.removeEventListener(JOBS_EVENT, tick); };
  }, [onChanged]);
  if (!jobs.length) return null;
  return (
    <section className="ix-card" aria-label="Background jobs">
      <header className="ix-card__head"><h2>Background jobs</h2></header>
      <div className="crm-jobs">
        {jobs.slice(0, 4).map((j) => {
          const r = j.results || { done: 0, skipped: [], failed: [] };
          return (
            <div key={j.id} className="crm-job">
              <div className="crm-job__top">
                <Icon name={KIND_ICON[j.kind] || 'list'} width="16" height="16" aria-hidden="true" />
                <b>{j.label}</b>
                {j.done ? <StatusBadge tone={r.failed.length ? 'warning' : 'success'}>{r.failed.length ? 'Done with problems' : 'Done'}</StatusBadge> : <StatusBadge tone="info">{j.progress}%</StatusBadge>}
                {j.done && j.file ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => downloadJob(j)}><Icon name="download" width="16" height="16" aria-hidden="true" />Download</button> : null}
                {j.done && (r.skipped.length || r.failed.length) ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" aria-expanded={!!open[j.id]} onClick={() => setOpen({ ...open, [j.id]: !open[j.id] })}>{open[j.id] ? 'Hide details' : 'Details'}</button> : null}
                {j.done ? <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Dismiss" onClick={() => { dismissJob(j.id); setJobs(getJobs()); }}><Icon name="x" width="16" height="16" aria-hidden="true" /></button> : null}
              </div>
              {j.done ? (
                <span className="crm-job__sub">{r.done} done · {r.skipped.length} skipped · {r.failed.length} failed{j.file && j.file.masked ? ' · phone numbers and emails are masked' : ''}</span>
              ) : (<>
                <span className="gc-progress" role="progressbar" aria-valuenow={j.progress} aria-valuemin={0} aria-valuemax={100} aria-label={j.label}><span className="gc-progress__fill" style={{ display: 'block', width: j.progress + '%' }} /></span>
                <span className="crm-job__sub">{(j.processed || 0).toLocaleString('en-IN')} of {j.ids.length.toLocaleString('en-IN')} · runs in the background, you can keep working</span>
              </>)}
              {open[j.id] ? <ul>{r.failed.map((x) => <li key={'f' + x.id}>{x.name}: {x.why}</li>)}{r.skipped.map((x) => <li key={'s' + x.id}>{x.name}: {x.why}</li>)}</ul> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
