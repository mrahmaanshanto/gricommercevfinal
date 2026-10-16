'use client';
// JobEditor — write a job post and its application form (Batch F; the merchant's /hiring-job and the super admin's
// /admin/career/job). Main column: the job (title, team, place, type, salary, closing date, description, duties, what you
// need) and the form builder (questions after the fixed fields: add, order, remove, required, and a knockout answer that
// rejects an applicant at once). Side column: status with Publish / Pause / Close, sharing (the job link and the share
// sheet), the public page and the job's history. Saves through lib/platform/career.js › saveJob / setJobStatus.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { StatusBadge } from '@/components/ui';
import { RecordHeader, KV } from '@/components/ui/IndexKit';
import { jobById, saveJob, setJobStatus, deleteJob, jobState, jobLink, stageCounts, JOB_TYPES, Q_TYPES, qTypeLabel, salaryText } from '@/lib/platform/career';
import { JobBadge, StageChips, dShort, dTime, toDateInput, fromInput } from './careerShared';
import { ShareJob } from './ShareJob';

const CSS = `
.je-q{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.je-q.is-bad{border-color:var(--text-danger)}
.je-q>header{display:flex;align-items:center;gap:var(--space-2)}
.je-q>header b{flex:1;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em}
.je-q .je-ko{display:flex;flex-direction:column;gap:4px}
.je-fixed{display:flex;flex-wrap:wrap;gap:6px}
.je-fixed span{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-body)}
.je-qs{display:flex;flex-direction:column;gap:var(--space-3)}
.je-add{display:flex;flex-wrap:wrap;gap:var(--space-2);align-items:center}
.je-hist{max-height:220px;overflow:auto}
.je-actions{display:flex;flex-direction:column;gap:var(--space-2)}
.je-actions .ix-btn{justify-content:center}
.je-ko-tag{display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs);color:var(--text-danger)}
`;
const SUGGEST = [
  ['When can you start?', 'select', ['Right away', 'Within 2 weeks', 'Within a month', 'Later']],
  ['Expected salary (৳ a month)', 'number', []],
  ['Do you live in Dhaka?', 'yesno', []],
];
let qn = 0;
const newQ = (label = '', type = 'text', options = []) => ({ id: 'q' + Date.now().toString(36) + (qn++), label, type, options, req: true, knockout: '' });
const blankJob = (owner) => ({ id: '', owner, title: '', team: '', place: '', position: '', type: 'full-time', salaryFrom: '', salaryTo: '', showSalary: true, closesAt: null, description: '', duties: '', needs: '', questions: [newQ('Can you work Fridays?', 'yesno')] });
const toForm = (j) => ({ ...j, salaryFrom: j.salaryFrom ? String(j.salaryFrom) : '', salaryTo: j.salaryTo ? String(j.salaryTo) : '', duties: (j.duties || []).join('\n'), needs: (j.needs || []).join('\n'), questions: (j.questions || []).map((q) => ({ ...q, options: q.options || [] })) });

/**
 * owner · id ('' or 'new' = a new job) · by (who is editing) · listHref · editHref(id) · boardHref(id) · places (suggested
 * places) · positions (HR positions this job can fill; merchants only)
 */
export function JobEditor({ owner, id, by, listHref, editHref, boardHref, places = [], positions = null }) {
  const router = useRouter();
  const [f, setF] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [bad, setBad] = useState('');
  const [share, setShare] = useState(false);
  const [tick, setTick] = useState(0);
  const [jid, setJid] = useState(id);
  const job = useMemo(() => (jid && jid !== 'new' ? jobById(jid) : null), [jid, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    setJid(id);
    if (id && id !== 'new') { const j = jobById(id); setF(j ? toForm(j) : false); } else setF(blankJob(owner));
    setDirty(false);
  }, [id, owner]);
  if (f === null) return <div style={{ minHeight: 400 }} aria-busy="true" />;
  if (f === false || (job && job.owner !== owner)) {
    return <section className="ix-card" style={{ padding: 'var(--space-6) var(--space-4)', textAlign: 'center' }}><p>This job was not found.</p><Link className="ix-btn" href={listHref}>Back to jobs</Link></section>;
  }
  const set = (patch) => { setF((x) => ({ ...x, ...patch })); setDirty(true); setBad(''); };
  const setQ = (i, patch) => set({ questions: f.questions.map((q, k) => (k === i ? { ...q, ...patch } : q)) });
  const moveQ = (i, d) => { const qs = f.questions.slice(); const [x] = qs.splice(i, 1); qs.splice(i + d, 0, x); set({ questions: qs }); };
  const dropQ = (i) => set({ questions: f.questions.filter((_, k) => k !== i) });
  const st = job ? jobState(job) : 'draft';
  const counts = job ? stageCounts({ jobId: job.id }) : null;

  const save = (then) => {
    const r = saveJob({ ...f, owner }, by);
    if (r.ok === false) { setBad(r.field || ''); toast(r.error, { tone: 'error' }); setTimeout(() => { const el = document.querySelector('[aria-invalid="true"]'); if (el) el.focus(); }, 0); return null; }
    setDirty(false); setTick((x) => x + 1);
    setF(toForm(r.job));
    if (!f.id) { setJid(r.job.id); try { window.history.replaceState(null, '', editHref(r.job.id)); } catch { /* ignore */ } }
    if (!then) toast(f.id ? 'Job saved' : 'Draft saved. Publish it when it is ready.');
    return r.job;
  };
  const status = async (s) => {
    if (s === 'closed' && !(await confirmDialog({ title: 'Close this job?', body: 'The post comes off your careers page and its link stops taking applications. Applicants stay on the board.', confirmLabel: 'Close job' }))) return;
    const j = dirty || !f.id ? save(true) : job;
    if (!j) return;
    const r = setJobStatus(j.id, s, by);
    if (r.ok === false) { setBad(r.field || ''); toast(r.error, { tone: 'error' }); return; }
    setTick((x) => x + 1);
    toast(s === 'open' ? 'Published: the job is on your careers page' : s === 'paused' ? 'Paused: the post stays up but nobody can apply' : 'Job closed');
    if (s === 'open') setShare(true);
  };
  const remove = async () => {
    if (!(await confirmDialog({ title: 'Delete this draft?', body: 'It has no applicants. This can’t be undone.', confirmLabel: 'Delete', tone: 'danger' }))) return;
    const r = deleteJob(job.id);
    if (r.ok === false) { toast(r.error, { tone: 'error' }); return; }
    toast('Draft deleted'); router.push(listHref);
  };
  const leave = async () => {
    if (dirty && !(await confirmDialog({ title: 'Leave without saving?', body: 'Your changes to this job will be lost.', confirmLabel: 'Leave', tone: 'danger' }))) return;
    router.push(listHref);
  };
  const inv = (k) => (bad === k ? 'true' : undefined);
  const primary = !job ? { label: 'Save draft', onClick: () => save() }
    : st === 'open' ? { label: 'Save', onClick: () => save(), disabled: !dirty }
      : st === 'hidden' ? { label: 'Save', onClick: () => save() }
        : { label: 'Publish', icon: 'send', onClick: () => status('open') };
  const more = [
    job && st === 'open' ? { label: 'Pause applications', onClick: () => status('paused') } : null,
    job && ['open', 'paused', 'expired'].includes(st) ? { label: 'Close job', onClick: () => status('closed') } : null,
    job && st !== 'open' && st !== 'hidden' ? { label: 'Save without publishing', onClick: () => save() } : null,
    job && st === 'draft' && counts && !counts.total ? { label: 'Delete draft', onClick: remove, tone: 'danger' } : null,
  ].filter(Boolean);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <RecordHeader onBack={leave} backLabel="Jobs" title={f.title || 'New job'} badges={job ? <JobBadge job={job} /> : <StatusBadge tone="neutral">Not saved</StatusBadge>}
        meta={job ? `${job.id} · ${job.postedAt ? 'posted ' + dShort(job.postedAt) : 'not published'}${dirty ? ' · unsaved changes' : ''}` : 'Fill in the job, then save it as a draft'}
        about="Write the job and the questions applicants answer. A knockout answer rejects an applicant at once, so the board only shows people who fit. Publish puts it on your careers page; Share posts the link."
        secondary={job ? [{ label: 'Share', icon: 'share-2', onClick: () => setShare(true) }, { label: 'Applicants', href: boardHref(job.id) }] : []}
        more={more} primary={primary} />
      {job && job.hidden ? <p className="cr-note cr-note--error" style={{ margin: 0 }}><Icon name="shield-alert" width="16" height="16" aria-hidden="true" />GridCommerce hid this job from candidates: {job.hidden.reason}. Fix the post, then ask GridCommerce support to show it again.</p> : null}
      {job && st === 'expired' ? <p className="cr-note cr-note--warn" style={{ margin: 0 }}><Icon name="calendar-x" width="16" height="16" aria-hidden="true" />The closing date has passed, so nobody can apply. Pick a later date and save to open it again.</p> : null}
      <div className="ix-record">
        <div className="ix-main">
          <section className="ix-card" aria-labelledby="je-job">
            <header className="ix-card__head"><h2 id="je-job">Job</h2></header>
            <div className="ix-card__body cr-form">
              <div><label className="gc-label" htmlFor="je-title">Job title</label><input id="je-title" className="gc-input" value={f.title} aria-invalid={inv('title')} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Sales executive" /></div>
              <div className="cr-two">
                <div><label className="gc-label" htmlFor="je-place">Where</label><input id="je-place" className="gc-input" list="je-places" value={f.place} aria-invalid={inv('place')} onChange={(e) => set({ place: e.target.value })} placeholder="A branch, a city or Remote" /><datalist id="je-places">{places.map((p) => <option key={p} value={p} />)}</datalist></div>
                <div><label className="gc-label" htmlFor="je-team">Team</label><input id="je-team" className="gc-input" value={f.team} onChange={(e) => set({ team: e.target.value })} placeholder="e.g. Store operations" /></div>
                <div><label className="gc-label" htmlFor="je-type">Type</label><select id="je-type" className="gc-input gc-select" value={f.type} onChange={(e) => set({ type: e.target.value })}>{JOB_TYPES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
                {positions ? (
                  <div><label className="gc-label" htmlFor="je-pos">Position it fills</label><select id="je-pos" className="gc-input gc-select" value={f.position || ''} onChange={(e) => set({ position: e.target.value })}><option value="">Not linked</option>{positions.map((p) => <option key={p.title} value={p.title}>{p.title} · {p.department}</option>)}</select><span className="gc-help">Hire fills Add staff with this position.</span></div>
                ) : (
                  <div><label className="gc-label" htmlFor="je-close2">Applications close</label><input id="je-close2" type="date" className="gc-input" value={toDateInput(f.closesAt)} aria-invalid={inv('closesAt')} onChange={(e) => set({ closesAt: e.target.value ? fromInput(e.target.value + 'T23:59') : null })} /></div>
                )}
              </div>
              <div className="cr-three">
                <div><label className="gc-label" htmlFor="je-from">Salary from (৳ a month)</label><input id="je-from" className="gc-input" inputMode="numeric" value={f.salaryFrom} onChange={(e) => set({ salaryFrom: e.target.value.replace(/\D/g, '') })} /></div>
                <div><label className="gc-label" htmlFor="je-to">to</label><input id="je-to" className="gc-input" inputMode="numeric" value={f.salaryTo} aria-invalid={inv('salaryTo')} onChange={(e) => set({ salaryTo: e.target.value.replace(/\D/g, '') })} /></div>
                {positions ? <div><label className="gc-label" htmlFor="je-close">Applications close</label><input id="je-close" type="date" className="gc-input" value={toDateInput(f.closesAt)} aria-invalid={inv('closesAt')} onChange={(e) => set({ closesAt: e.target.value ? fromInput(e.target.value + 'T23:59') : null })} /></div> : <div />}
              </div>
              <label className="cr-check"><input type="checkbox" checked={f.showSalary !== false} onChange={(e) => set({ showSalary: e.target.checked })} />Show the salary on the post</label>
              <div><label className="gc-label" htmlFor="je-desc">Description</label><textarea id="je-desc" className="gc-input" rows={5} value={f.description} aria-invalid={inv('description')} onChange={(e) => set({ description: e.target.value })} placeholder="What the job is, in a few short paragraphs" /></div>
              <div className="cr-two">
                <div><label className="gc-label" htmlFor="je-duties">What you will do</label><textarea id="je-duties" className="gc-input" rows={5} value={f.duties} onChange={(e) => set({ duties: e.target.value })} placeholder="One per line" /></div>
                <div><label className="gc-label" htmlFor="je-needs">What you need</label><textarea id="je-needs" className="gc-input" rows={5} value={f.needs} onChange={(e) => set({ needs: e.target.value })} placeholder="One per line" /></div>
              </div>
            </div>
          </section>

          <section className="ix-card" aria-labelledby="je-form">
            <header className="ix-card__head"><h2 id="je-form">Application form</h2><span className="ix-muted" style={{ fontSize: 'var(--text-xs)' }}>{f.questions.length} question{f.questions.length === 1 ? '' : 's'}</span></header>
            <div className="ix-card__body cr-form">
              <div><span className="gc-label">Always asked</span><div className="je-fixed">{['Full name', 'Mobile', 'Email (optional)', 'City', 'CV', 'Photo (optional)'].map((x) => <span key={x}><Icon name="lock" width="12" height="12" aria-hidden="true" />{x}</span>)}</div></div>
              <div className="je-qs">
                {f.questions.map((q, i) => (
                  <div key={q.id} className={'je-q' + (bad === 'q' + i ? ' is-bad' : '')}>
                    <header>
                      <b>Question {i + 1} · {qTypeLabel(q.type)}</b>
                      {q.knockout ? <span className="je-ko-tag"><Icon name="ban" width="12" height="12" aria-hidden="true" />Knockout</span> : null}
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Move question ${i + 1} up`} disabled={i === 0} onClick={() => moveQ(i, -1)}><Icon name="arrow-up" width="16" height="16" aria-hidden="true" /></button>
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Move question ${i + 1} down`} disabled={i === f.questions.length - 1} onClick={() => moveQ(i, 1)}><Icon name="arrow-down" width="16" height="16" aria-hidden="true" /></button>
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Remove question ${i + 1}`} onClick={() => dropQ(i)}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button>
                    </header>
                    <div className="cr-two">
                      <div><label className="gc-label" htmlFor={'je-ql' + i}>Question</label><input id={'je-ql' + i} className="gc-input" value={q.label} aria-invalid={bad === 'q' + i ? 'true' : undefined} onChange={(e) => setQ(i, { label: e.target.value })} placeholder="e.g. Can you work Fridays?" /></div>
                      <div><label className="gc-label" htmlFor={'je-qt' + i}>Answer type</label><select id={'je-qt' + i} className="gc-input gc-select" value={q.type} onChange={(e) => setQ(i, { type: e.target.value, knockout: '' })}>{Q_TYPES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
                    </div>
                    {q.type === 'select' ? <div><label className="gc-label" htmlFor={'je-qo' + i}>Choices</label><textarea id={'je-qo' + i} className="gc-input" rows={3} value={(q.options || []).join('\n')} onChange={(e) => setQ(i, { options: e.target.value.split('\n') })} placeholder="One choice per line" /></div> : null}
                    <div className="cr-row" style={{ justifyContent: 'space-between' }}>
                      <label className="cr-check"><input type="checkbox" checked={!!q.req || !!q.knockout} disabled={!!q.knockout} onChange={(e) => setQ(i, { req: e.target.checked })} />Required</label>
                      {q.type === 'yesno' || q.type === 'select' ? (
                        <span className="je-ko" style={{ flex: '1 1 240px', maxWidth: 320 }}>
                          <label className="gc-label" htmlFor={'je-qk' + i} style={{ margin: 0 }}>Reject at once if the answer is</label>
                          <select id={'je-qk' + i} className="gc-input gc-select" value={q.knockout || ''} onChange={(e) => setQ(i, { knockout: e.target.value })}>
                            <option value="">No knockout</option>
                            {(q.type === 'yesno' ? ['Yes', 'No'] : (q.options || []).map((o) => o.trim()).filter(Boolean)).map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
              <div className="je-add">
                <button type="button" className="ix-btn" onClick={() => set({ questions: [...f.questions, newQ()] })}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add question</button>
                {SUGGEST.filter(([l]) => !f.questions.some((q) => q.label === l)).map(([l, t, o]) => <button key={l} type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => set({ questions: [...f.questions, newQ(l, t, o)] })}>+ {l}</button>)}
              </div>
              <span className="gc-help" style={{ margin: 0 }}>An applicant who gives a knockout answer goes straight to Rejected with the reason. Send them the “Not selected” message from the board when you are ready.</span>
            </div>
          </section>
        </div>

        <aside className="ix-side">
          <section className="ix-card" aria-labelledby="je-st">
            <header className="ix-card__head"><h2 id="je-st">Status</h2>{job ? <JobBadge job={job} /> : null}</header>
            <div className="ix-card__body cr-form">
              {job ? <KV rows={[['Posted', job.postedAt ? dShort(job.postedAt) : 'Not yet'], ['Closes', job.closesAt ? dShort(job.closesAt) : 'No date'], ['Views', (job.views || 0).toLocaleString('en-IN')], ['Salary', job.showSalary ? salaryText(job) || '—' : 'Hidden']]} /> : <span className="gc-help" style={{ margin: 0 }}>Save the job to share it or publish it.</span>}
              {counts ? <><StageChips counts={counts} /><Link href={boardHref(job.id)} className="ix-btn" style={{ justifyContent: 'center' }}>Open applicants · {counts.total}</Link></> : null}
            </div>
          </section>
          {job ? (
            <section className="ix-card" aria-labelledby="je-sh">
              <header className="ix-card__head"><h2 id="je-sh">Share</h2></header>
              <div className="ix-card__body je-actions">
                <span className="gc-help" style={{ margin: 0, overflowWrap: 'anywhere', fontFamily: 'var(--font-data)' }}>{jobLink(job)}</span>
                <button type="button" className="ix-btn ix-btn--primary" onClick={() => setShare(true)}><Icon name="share-2" width="16" height="16" aria-hidden="true" />Share on Facebook, WhatsApp, LinkedIn</button>
                <a className="ix-btn" href={jobLink(job) + (st === 'open' ? '' : '&preview=1')} target="_blank" rel="noopener noreferrer"><Icon name="external-link" width="16" height="16" aria-hidden="true" />{st === 'open' ? 'See the public page' : 'Preview the public page'}</a>
              </div>
            </section>
          ) : null}
          {job ? (
            <details className="ix-card gc-disclose">
              <summary>History · {job.history.length}</summary>
              <ul className="cr-list je-hist">{job.history.slice().reverse().map((h, i) => <li key={i}><span>{h.text}<span className="cr-sub">{h.by} · {dTime(h.at)}</span></span></li>)}</ul>
            </details>
          ) : null}
        </aside>
      </div>
      <ShareJob job={job} open={share && !!job} onClose={() => setShare(false)} />
    </>
  );
}
