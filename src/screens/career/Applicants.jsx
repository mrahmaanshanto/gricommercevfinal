'use client';
// Applicants — the hiring board (Batch F; the merchant's /hiring-applicants and the super admin's /admin/career/applicants).
// It replaces the Google Sheet: every applicant of a job (or of every job) as a board by stage (drag a card, or use its
// Move button) or as a table with filters and a CSV export. A card opens the applicant (ApplicantSheet: answers, CV, rating,
// interviews, messages, notes, stage history). Moving asks what goes with it (MoveDialog): the message to the candidate,
// the interview's time and place, the reason for a rejection, and Hire (onHire: the merchant opens Add staff prefilled).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet, Dialog, EmptyState } from '@/components/ui';
import { RecordHeader, ShopHeader, SearchField, KV } from '@/components/ui/IndexKit';
import { Pic } from '@/components/ui/Pic';
import {
  getJobs, jobById, getApplications, applicationById, moveStage, rate, addNote, setTags, scheduleInterview, setOutcome, sendMessage, hire,
  templateText, toCsv, statusLink, STAGES, NEXT_STAGE, SOURCES, MODES, TEMPLATE_KEYS, stageLabel, sourceLabel, modeLabel, now,
} from '@/lib/platform/career';
import { StageBadge, Stars, StarPicker, JobBadge, dShort, dTime, ago, sizeText, toLocalInput, fromInput } from './careerShared';
import { ShareJob } from './ShareJob';

const CSS = `
.ap-tools{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-bottom:1px solid var(--border-subtle)}
.ap-tools select{width:auto;min-width:150px}
.ap-tools .ix-search{flex:1 1 200px;min-width:0}
.ap-seg{display:inline-flex;padding:2px;gap:2px;border-radius:var(--radius-full);background:var(--surface-subtle);border:1px solid var(--border-subtle)}
.ap-seg button{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 var(--space-3);border:0;border-radius:var(--radius-full);background:none;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer}
.ap-seg button[aria-pressed="true"]{background:var(--surface-card);color:var(--text-heading);box-shadow:var(--shadow-xs)}
.ap-board{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(168px,1fr);gap:var(--space-3);padding:var(--space-3);overflow-x:auto;scroll-snap-type:x proximity}
.ap-col{display:flex;flex-direction:column;gap:var(--space-2);min-height:220px;padding:var(--space-2);border-radius:var(--radius-lg);background:var(--surface-subtle);scroll-snap-align:start}
.ap-col.is-over{outline:2px dashed var(--primary);outline-offset:-2px;background:var(--fill-primary-soft)}
.ap-col>header{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);padding:2px 4px 4px}
.ap-col>header b{font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading);text-transform:uppercase;letter-spacing:.04em}
.ap-col>header span{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.ap-card{display:flex;flex-direction:column;gap:6px;padding:10px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);box-shadow:var(--shadow-xs);cursor:pointer;text-align:left;font:inherit;color:inherit;width:100%}
.ap-card:hover{border-color:var(--primary)}
.ap-card[draggable="true"]{cursor:grab}
.ap-card.is-drag{opacity:.5}
.ap-card__top{display:flex;align-items:center;gap:8px;min-width:0}
.ap-card__top>span:last-child{min-width:0;flex:1}
.ap-card__top b{display:block;overflow:hidden;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.ap-card__meta{font-size:var(--text-xs);color:var(--text-muted)}
.ap-card__foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px}
.ap-card__foot .ix-btn{margin-left:auto}
.ap-ko{display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs);color:var(--text-danger)}
.ap-iv{display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs);color:var(--text-warning)}
.ap-empty{padding:var(--space-4) var(--space-2);font-size:var(--text-xs);color:var(--text-muted);text-align:center}
.ap-sheet{display:flex;flex-direction:column;gap:var(--space-4)}
.ap-sheet section{display:flex;flex-direction:column;gap:var(--space-2)}
.ap-sheet h3{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ap-head{display:flex;align-items:center;gap:var(--space-3)}
.ap-head b{display:block;font-size:var(--text-md);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ap-acts{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.ap-qa{margin:0;display:flex;flex-direction:column;gap:var(--space-2)}
.ap-qa dt{font-size:var(--text-xs);color:var(--text-muted)}
.ap-qa dd{margin:2px 0 0;font-size:var(--text-sm);color:var(--text-heading);white-space:pre-wrap;overflow-wrap:anywhere}
.ap-qa .is-ko dd{color:var(--text-danger)}
.ap-file{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.ap-file>span{flex:1;min-width:0;overflow-wrap:anywhere;font-size:var(--text-sm)}
.ap-msg{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm);white-space:pre-wrap;overflow-wrap:anywhere}
.ap-photo{width:96px;height:96px;border-radius:var(--radius-lg);object-fit:cover;border:1px solid var(--border-subtle)}
.ap-hist li{font-size:var(--text-xs)!important}
.ap-preview{margin:0;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-body);white-space:pre-wrap}
@media (max-width:640px){.ap-board{grid-auto-columns:minmax(78vw,1fr);padding:var(--space-2)}.ap-tools select{flex:1 1 140px;min-width:0}.ap-tools>select:first-child{flex:1 1 100%}}
`;

const BOARD = STAGES.map(([k]) => k);
const NEXT_WORD = { new: 'Shortlist', shortlisted: 'Book interview', interview: 'Make offer', offer: 'Hire' };

/** Move an applicant: what goes with it (message, interview, reason, hire). move = { app, to } */
export function MoveDialog({ move, onClose, by, hireNote, onHire }) {
  const [f, setF] = useState({ notify: true, lang: 'en', reason: '', at: '', mode: 'at the shop', with: by || '', link: '', place: '' });
  const [err, setErr] = useState('');
  useEffect(() => {
    if (!move) return;
    const j = jobById(move.app.jobId) || {};
    const d = new Date(now() + 864e5); d.setHours(11, 0, 0, 0);
    setF({ notify: move.to !== 'new', lang: 'en', reason: '', at: toLocalInput(d.getTime()), mode: 'at the shop', with: by || '', link: '', place: j.place || '' });
    setErr('');
  }, [move, by]);
  if (!move) return null;
  const { app, to } = move;
  const tplKey = to === 'interview' ? 'interview' : TEMPLATE_KEYS.some(([k]) => k === to) ? to : '';
  const set = (p) => { setF((x) => ({ ...x, ...p })); setErr(''); };
  const go = () => {
    let r;
    if (to === 'interview') r = scheduleInterview(app.id, { at: fromInput(f.at), mode: f.mode, with: f.with, link: f.link, place: f.place }, { by, notify: f.notify, lang: f.lang });
    else if (to === 'hired') { r = hire(app.id, by); if (r.ok !== false) { onClose(); if (onHire) onHire(r); return; } }
    else r = moveStage(app.id, to, { by, notify: f.notify && !!tplKey, lang: f.lang, reason: f.reason });
    if (r.ok === false) { setErr(r.error); return; }
    toast(to === 'interview' ? `Interview booked${f.notify ? ' · invite sent by SMS' : ''}` : `${app.name} moved to ${stageLabel(to)}${f.notify && tplKey ? ' · message sent' : ''}`);
    onClose();
  };
  const title = to === 'interview' ? 'Book an interview' : to === 'hired' ? `Hire ${app.name}?` : to === 'rejected' ? `Reject ${app.name}?` : `Move to ${stageLabel(to)}`;
  return (
    <Dialog open title={title} onClose={onClose} width={520}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="button" className={'gc-btn ' + (to === 'rejected' ? 'gc-btn--error' : 'gc-btn--solid')} onClick={go}>{to === 'interview' ? 'Book interview' : to === 'hired' ? (hireNote ? 'Hire and add to staff' : 'Mark as hired') : to === 'rejected' ? 'Reject' : 'Move'}</button></>}>
      <div className="cr-form">
        {to === 'interview' ? (<>
          <div className="cr-two">
            <div><label className="gc-label" htmlFor="mv-at">Day and time</label><input id="mv-at" type="datetime-local" className="gc-input" value={f.at} onChange={(e) => set({ at: e.target.value })} data-autofocus /></div>
            <div><label className="gc-label" htmlFor="mv-mode">How</label><select id="mv-mode" className="gc-input gc-select" value={f.mode} onChange={(e) => set({ mode: e.target.value })}>{MODES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
            <div><label className="gc-label" htmlFor="mv-with">With</label><input id="mv-with" className="gc-input" value={f.with} onChange={(e) => set({ with: e.target.value })} placeholder="Who meets them" /></div>
            {f.mode === 'video' ? <div><label className="gc-label" htmlFor="mv-link">Video link</label><input id="mv-link" className="gc-input" value={f.link} onChange={(e) => set({ link: e.target.value })} placeholder="https://meet.google.com/…" /></div>
              : f.mode === 'at the shop' ? <div><label className="gc-label" htmlFor="mv-place">Where</label><input id="mv-place" className="gc-input" value={f.place} onChange={(e) => set({ place: e.target.value })} /></div> : <div />}
          </div>
        </>) : null}
        {to === 'rejected' ? <div><label className="gc-label" htmlFor="mv-why">Why (only your team sees it)</label><input id="mv-why" className="gc-input" list="mv-whys" value={f.reason} onChange={(e) => set({ reason: e.target.value })} placeholder="e.g. Not enough experience" data-autofocus /><datalist id="mv-whys">{['Not enough experience', 'Salary too high', 'Did not come to the interview', 'Lives too far', 'Chose another candidate'].map((x) => <option key={x} value={x} />)}</datalist></div> : null}
        {to === 'hired' ? <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>{hireNote || 'They move to Hired. Add them in People › Staff when they join.'}</p> : null}
        {tplKey && to !== 'hired' ? (<>
          <label className="cr-check"><input type="checkbox" checked={f.notify} onChange={(e) => set({ notify: e.target.checked })} />Send {app.name.split(' ')[0]} the “{(TEMPLATE_KEYS.find(([k]) => k === tplKey) || [0, ''])[1]}” message by SMS{to === 'interview' && app.email ? ' and email' : ''}</label>
          {f.notify ? <>
            <div className="ap-seg" role="group" aria-label="Language">{[['en', 'English'], ['bn', 'বাংলা']].map(([k, l]) => <button key={k} type="button" aria-pressed={f.lang === k} onClick={() => set({ lang: k })}>{l}</button>)}</div>
            <p className="ap-preview">{to === 'interview' ? templateText(app.id, 'interview', f.lang, f.at ? { at: fromInput(f.at), mode: f.mode, link: f.link, place: f.place } : null) : templateText(app.id, tplKey, f.lang)}</p>
          </> : null}
        </>) : null}
        {err ? <p className="cr-err" role="alert">{err}</p> : null}
      </div>
    </Dialog>
  );
}

/** One applicant: everything about them, and what to do next. */
export function ApplicantSheet({ id, onClose, by, onMove }) {
  const [, force] = useState(0);
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState({ kind: 'sms', text: '', tpl: '', lang: 'en' });
  const [tags, setTagText] = useState('');
  const a = id ? applicationById(id) : null;
  useEffect(() => { setNote(''); setMsg({ kind: 'sms', text: '', tpl: '', lang: 'en' }); setTagText(a ? (a.tags || []).join(', ') : ''); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!a) return null;
  const j = jobById(a.jobId) || { title: 'Job', questions: [] };
  const refresh = () => force((x) => x + 1);
  const next = NEXT_STAGE[a.stage];
  const pickTpl = (k, lang = msg.lang) => setMsg({ ...msg, tpl: k, lang, text: k ? templateText(a.id, k, lang) : msg.text });
  const send = () => { const r = sendMessage(a.id, { kind: msg.kind, text: msg.text }, by); if (r.ok === false) { toast(r.error, { tone: 'error' }); return; } toast((msg.kind === 'email' ? 'Email' : 'SMS') + ' sent to ' + a.name.split(' ')[0]); setMsg({ ...msg, text: '', tpl: '' }); refresh(); };
  return (
    <Sheet open title={a.name} onClose={onClose}
      footer={<>
        {a.stage !== 'rejected' && a.stage !== 'hired' ? <button type="button" className="gc-btn gc-btn--flat" style={{ marginRight: 'auto', color: 'var(--text-danger)' }} onClick={() => onMove(a, 'rejected')}>Reject</button> : <span style={{ marginRight: 'auto' }} />}
        {next ? <button type="button" className="gc-btn gc-btn--solid" onClick={() => onMove(a, next)}>{NEXT_WORD[a.stage]}</button> : a.stage === 'rejected' ? <button type="button" className="gc-btn gc-btn--neutral" onClick={() => onMove(a, 'new')}>Back to New</button> : null}
      </>}>
      <div className="ap-sheet">
        <div className="ap-head">
          <Pic src={a.photo} name={a.name} kind="person" size={48} />
          <span style={{ minWidth: 0 }}><b>{a.name}</b><span className="cr-sub">{j.title} · applied {ago(a.appliedAt)} · {sourceLabel(a.source)}</span></span>
        </div>
        <div className="ap-acts">
          <StageBadge stage={a.stage} />
          <select className="gc-input gc-select" style={{ width: 'auto', flex: '1 1 160px' }} aria-label="Move to stage" value="" onChange={(e) => { if (e.target.value) onMove(a, e.target.value); }}>
            <option value="">Move to…</option>{STAGES.filter(([k]) => k !== a.stage).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
        {a.stage === 'rejected' && a.reason ? <p className="cr-note cr-note--warn" style={{ margin: 0 }}><Icon name="ban" width="16" height="16" aria-hidden="true" />{a.knockout ? 'Knockout answer: ' : ''}{a.reason}</p> : null}
        {a.staffCode ? <p className="cr-note" style={{ margin: 0 }}><Icon name="user-check" width="16" height="16" aria-hidden="true" />Added to staff as {a.staffCode}.</p> : null}
        <section aria-label="Rating"><h3>Rating</h3><StarPicker value={a.rating || 0} onChange={(n) => { rate(a.id, n, by); refresh(); }} /></section>
        <section aria-label="Contact">
          <h3>Contact</h3>
          <KV rows={[
            ['Mobile', <a key="p" href={'tel:' + a.phone.replace(/\D/g, '')} className="ix-strong">{a.phone}</a>],
            ['Email', a.email ? <a key="e" href={'mailto:' + a.email}>{a.email}</a> : 'Not given'],
            ['City', a.city || '—'], ['Applied', dTime(a.appliedAt)], ['Came from', sourceLabel(a.source)],
            ['Status link', <button key="c" type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={async () => { try { await navigator.clipboard.writeText(statusLink(a.code)); toast('Status link copied'); } catch { toast(statusLink(a.code)); } }}>{a.code}<Icon name="copy" width="14" height="14" aria-hidden="true" /></button>],
          ]} />
        </section>
        <section aria-label="CV">
          <h3>CV{a.photo ? ' and photo' : ''}</h3>
          {a.cv ? <div className="ap-file"><Icon name="file-text" width="18" height="18" aria-hidden="true" /><span>{a.cv.name}<span className="cr-sub">{sizeText(a.cv.size)}</span></span><button type="button" className="ix-btn ix-btn--sm" onClick={() => toast('The file opens on the live site: this demo keeps only its name and size.', { tone: 'info' })}>Open</button></div> : <span className="gc-help" style={{ margin: 0 }}>No CV</span>}
          {a.photo ? <img className="ap-photo" src={a.photo} alt={'Photo of ' + a.name} /> : null}
        </section>
        <section aria-label="Answers">
          <h3>Answers</h3>
          {j.questions.length ? <dl className="ap-qa">{j.questions.map((q) => { const v = a.answers[q.id]; return <div key={q.id} className={a.knockout === q.id ? 'is-ko' : ''}><dt>{q.label}</dt><dd>{v && v.name ? v.name + ' · ' + sizeText(v.size) : v || <span className="ix-muted">No answer</span>}{a.knockout === q.id ? ' · knockout' : ''}</dd></div>; })}</dl> : <span className="gc-help" style={{ margin: 0 }}>This job asks no questions.</span>}
        </section>
        <section aria-label="Interviews">
          <div className="cr-row" style={{ justifyContent: 'space-between' }}><h3>Interviews</h3>{a.stage !== 'rejected' && a.stage !== 'hired' ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => onMove(a, 'interview')}><Icon name="calendar-plus" width="16" height="16" aria-hidden="true" />Book</button> : null}</div>
          {a.interviews.length ? <ul className="cr-list">{a.interviews.map((iv, i) => (
            <li key={i}><span><b style={{ fontWeight: 'var(--weight-medium)' }}>{dTime(iv.at)}</b><span className="cr-sub">{modeLabel(iv.mode)}{iv.with ? ' · with ' + iv.with : ''}{iv.place && iv.mode === 'at the shop' ? ' · ' + iv.place : ''}{iv.link ? ' · ' + iv.link : ''}</span></span>
              <select className="gc-input gc-select" style={{ width: 'auto' }} aria-label="Result" value={iv.outcome || ''} onChange={(e) => { setOutcome(a.id, i, e.target.value, by); refresh(); }}>
                <option value="">Result…</option>{['Passed', 'Failed', 'Did not come', ...(iv.outcome && !['Passed', 'Failed', 'Did not come'].includes(iv.outcome) ? [iv.outcome] : [])].map((x) => <option key={x} value={x}>{x}</option>)}
              </select></li>
          ))}</ul> : <span className="gc-help" style={{ margin: 0 }}>No interview yet.</span>}
        </section>
        <section aria-label="Messages">
          <h3>Messages · {a.messages.length}</h3>
          {a.messages.slice(-4).map((m, i) => <div key={i} className="ap-msg"><span className="cr-sub">{m.kind === 'email' ? 'Email' : 'SMS'} to {m.to || '—'} · {dTime(m.at)} · {m.status}</span>{m.text}</div>)}
          {a.messages.length > 4 ? <span className="gc-help" style={{ margin: 0 }}>{a.messages.length - 4} older message{a.messages.length - 4 === 1 ? '' : 's'}</span> : null}
          <div className="cr-row">
            <div className="ap-seg" role="group" aria-label="Send by">{[['sms', 'SMS'], ['email', 'Email']].map(([k, l]) => <button key={k} type="button" aria-pressed={msg.kind === k} onClick={() => setMsg({ ...msg, kind: k })}>{l}</button>)}</div>
            <select className="gc-input gc-select" style={{ width: 'auto', flex: '1 1 150px' }} aria-label="Message template" value={msg.tpl} onChange={(e) => pickTpl(e.target.value)}><option value="">Write your own…</option>{TEMPLATE_KEYS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            <div className="ap-seg" role="group" aria-label="Language">{[['en', 'EN'], ['bn', 'বাং']].map(([k, l]) => <button key={k} type="button" aria-pressed={msg.lang === k} onClick={() => pickTpl(msg.tpl, k)}>{l}</button>)}</div>
          </div>
          <textarea className="gc-input" style={{ height: 'auto', minHeight: 80, padding: 'var(--space-2) var(--space-3)' }} aria-label="Message" value={msg.text} onChange={(e) => setMsg({ ...msg, text: e.target.value })} placeholder={msg.kind === 'email' && !a.email ? 'No email: send an SMS' : 'Message to ' + a.name.split(' ')[0]} />
          <button type="button" className="ix-btn" style={{ alignSelf: 'flex-start' }} disabled={!msg.text.trim()} onClick={send}><Icon name="send" width="16" height="16" aria-hidden="true" />Send {msg.kind === 'email' ? 'email' : 'SMS'}</button>
        </section>
        <section aria-label="Notes">
          <h3>Notes · {a.notes.length}</h3>
          {a.notes.length ? <ul className="cr-list">{a.notes.map((n, i) => <li key={i}><span>{n.text}<span className="cr-sub">{n.by} · {dTime(n.at)}</span></span></li>)}</ul> : null}
          <textarea className="gc-input" style={{ height: 'auto', minHeight: 64, padding: 'var(--space-2) var(--space-3)' }} aria-label="New note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Only your team sees notes" />
          <button type="button" className="ix-btn" style={{ alignSelf: 'flex-start' }} disabled={!note.trim()} onClick={() => { const r = addNote(a.id, note, by); if (r.ok === false) toast(r.error, { tone: 'error' }); else { setNote(''); toast('Note added'); refresh(); } }}>Add note</button>
        </section>
        <section aria-label="Tags">
          <h3>Tags</h3>
          <div className="cr-link"><input className="gc-input" value={tags} onChange={(e) => setTagText(e.target.value)} placeholder="e.g. Speaks English, Has bike" aria-label="Tags, comma between" /><button type="button" className="ix-btn" onClick={() => { setTags(a.id, tags); toast('Tags saved'); refresh(); }}>Save</button></div>
        </section>
        <details className="gc-disclose" style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
          <summary>Stage history · {a.history.length}</summary>
          <ul className="cr-list ap-hist">{a.history.slice().reverse().map((h, i) => <li key={i}><span>{h.text}<span className="cr-sub">{h.by} · {dTime(h.at)}</span></span></li>)}</ul>
        </details>
      </div>
    </Sheet>
  );
}

/**
 * The applicants page body. owner · jobId (from ?job=, '' = every job) · by · listHref · editHref(id) · boardHref(id)
 * · onHire(result of career.hire) · hireNote (what Hire does, shown before hiring) · ready/tick (useCareer)
 */
export function ApplicantsView({ owner, jobId: initialJob, by, listHref, editHref, boardHref, onHire, hireNote, ready, tick }) {
  const [jobId, setJobId] = useState(initialJob || '');
  const [view, setView] = useState('board');
  const [q, setQ] = useState('');
  const [src, setSrc] = useState('');
  const [stage, setStage] = useState('');
  const [minRate, setMinRate] = useState(0);
  const [open, setOpen] = useState('');
  const [move, setMove] = useState(null);
  const [drag, setDrag] = useState('');
  const [over, setOver] = useState('');
  const [share, setShare] = useState(false);
  useEffect(() => { setJobId(initialJob || ''); }, [initialJob]);
  useEffect(() => { try { const v = window.localStorage.getItem('gc.career.view'); if (v === 'table' || v === 'board') setView(v); } catch { /* ignore */ } const a = new URLSearchParams(window.location.search).get('app'); if (a) setOpen(a); }, []);
  const pickView = (v) => { setView(v); try { window.localStorage.setItem('gc.career.view', v); } catch { /* ignore */ } };
  const jobs = useMemo(() => (ready ? getJobs(owner) : []), [ready, tick, owner]); // eslint-disable-line react-hooks/exhaustive-deps
  const job = jobId ? jobs.find((j) => j.id === jobId) || null : null;
  const all = useMemo(() => (ready ? getApplications({ owner, jobId: jobId || undefined }) : []), [ready, tick, owner, jobId]); // eslint-disable-line react-hooks/exhaustive-deps
  const needle = q.trim().toLowerCase();
  const shown = all.filter((a) => (!src || a.source === src) && (!stage || a.stage === stage) && (!minRate || (a.rating || 0) >= minRate) && (!needle || (a.name + ' ' + a.phone + ' ' + a.email + ' ' + a.city + ' ' + (a.tags || []).join(' ')).toLowerCase().includes(needle)));
  const jobTitle = (id) => (jobs.find((j) => j.id === id) || { title: '' }).title;
  const pickJob = (id) => { setJobId(id); try { window.history.replaceState(null, '', boardHref(id)); } catch { /* ignore */ } };
  const startMove = (app, to) => { if (app.stage === to) return; setMove({ app: applicationById(app.id) || app, to }); };
  const filtered = !!(q || src || stage || minRate);
  const csv = () => {
    const blob = new Blob([toCsv(shown)], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (job ? job.title.replace(/\W+/g, '-').toLowerCase() : 'applicants') + '.csv'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast(`${shown.length} applicant${shown.length === 1 ? '' : 's'} exported`);
  };
  const upcoming = all.filter((a) => a.stage === 'interview' && a.interviews.some((iv) => iv.at > now())).length;
  const ko = all.filter((a) => a.knockout).length;

  const card = (a) => {
    const iv = a.stage === 'interview' ? a.interviews.filter((x) => x.at > now() - 3600e3).sort((x, y) => x.at - y.at)[0] : null;
    const nx = NEXT_STAGE[a.stage];
    return (
      <div key={a.id} className={'ap-card' + (drag === a.id ? ' is-drag' : '')} role="button" tabIndex={0} draggable="true" aria-label={`${a.name}, ${stageLabel(a.stage)}. Open`}
        onDragStart={(e) => { setDrag(a.id); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', a.id); } catch { /* ignore */ } }}
        onDragEnd={() => { setDrag(''); setOver(''); }}
        onClick={(e) => { if (!e.target.closest('button')) setOpen(a.id); }} onKeyDown={(e) => { if (e.key === 'Enter') setOpen(a.id); }}>
        <span className="ap-card__top"><Pic src={a.photo} name={a.name} kind="person" size={32} /><span><b>{a.name}</b><span className="ap-card__meta">{jobId ? '' : jobTitle(a.jobId) + ' · '}{ago(a.appliedAt)} · {sourceLabel(a.source)}</span></span></span>
        {a.knockout ? <span className="ap-ko"><Icon name="ban" width="12" height="12" aria-hidden="true" />Knockout answer</span> : null}
        {iv ? <span className="ap-iv"><Icon name="calendar-clock" width="12" height="12" aria-hidden="true" />{dTime(iv.at)}</span> : null}
        <span className="ap-card__foot"><Stars value={a.rating || 0} size={12} />{nx ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => startMove(a, nx)} aria-label={`${NEXT_WORD[a.stage]}: ${a.name}`}>{NEXT_WORD[a.stage]}<Icon name="arrow-right" width="14" height="14" aria-hidden="true" /></button> : null}</span>
      </div>
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {job ? (
        <RecordHeader back={listHref} backLabel="Jobs" title={job.title} badges={<JobBadge job={job} />} meta={`${job.place} · ${all.length} applicant${all.length === 1 ? '' : 's'}${upcoming ? ` · ${upcoming} interview${upcoming === 1 ? '' : 's'} coming` : ''}${ko ? ` · ${ko} rejected by a knockout answer` : ''}`}
          about="Every applicant for this job by stage. Drag a card to another column, or use its button to take the next step. A card opens the applicant: answers, CV, rating, interview, messages and notes. Table shows the same as a sheet with filters and a CSV export."
          secondary={[{ label: 'Edit job', href: editHref(job.id) }]} more={[{ label: 'Export CSV', onClick: csv }]} primary={{ label: 'Share job', icon: 'share-2', onClick: () => setShare(true) }} />
      ) : (
        <ShopHeader icon="users" title="Applicants" about="Every applicant for every job, by stage. Pick a job to see only its applicants."
          secondary={[{ label: 'Jobs', href: listHref }]} more={[{ label: 'Export CSV', onClick: csv }]} />
      )}
      <section className="ix-card" aria-label="Applicants">
        <div className="ap-tools">
          <select className="gc-input gc-select" aria-label="Job" value={jobId} onChange={(e) => pickJob(e.target.value)}><option value="">Every job</option>{jobs.map((j) => <option key={j.id} value={j.id}>{j.title} · {j.place}</option>)}</select>
          <div className="ap-seg" role="group" aria-label="View"><button type="button" aria-pressed={view === 'board'} onClick={() => pickView('board')}><Icon name="columns-3" width="14" height="14" aria-hidden="true" />Board</button><button type="button" aria-pressed={view === 'table'} onClick={() => pickView('table')}><Icon name="table" width="14" height="14" aria-hidden="true" />Table</button></div>
          <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, mobile, city or tag" />
          <select className="gc-input gc-select" aria-label="Came from" value={src} onChange={(e) => setSrc(e.target.value)}><option value="">Every source</option>{SOURCES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          {view === 'table' ? <select className="gc-input gc-select" aria-label="Stage" value={stage} onChange={(e) => setStage(e.target.value)}><option value="">Every stage</option>{STAGES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select> : null}
          <select className="gc-input gc-select" aria-label="Rating" value={minRate} onChange={(e) => setMinRate(Number(e.target.value))}><option value={0}>Any rating</option>{[3, 4, 5].map((n) => <option key={n} value={n}>{n}+ stars</option>)}</select>
          {filtered ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setQ(''); setSrc(''); setStage(''); setMinRate(0); }}><Icon name="x" width="14" height="14" aria-hidden="true" />Clear</button> : null}
        </div>
        {!ready ? <div style={{ minHeight: 320 }} aria-busy="true" /> : !all.length ? (
          <div className="ix-empty"><EmptyState icon="users" title="No applicants yet" body={job ? 'Share the job link to get applicants.' : undefined} actionLabel={job ? 'Share job' : undefined} onAction={job ? () => setShare(true) : undefined} /></div>
        ) : view === 'board' ? (
          <div className="ap-board" aria-label="Board by stage">
            {BOARD.map((k) => {
              const list = shown.filter((a) => a.stage === k);
              return (
                <section key={k} className={'ap-col' + (over === k ? ' is-over' : '')} aria-label={stageLabel(k) + ', ' + list.length}
                  onDragOver={(e) => { if (drag) { e.preventDefault(); setOver(k); } }} onDragLeave={() => setOver((o) => (o === k ? '' : o))}
                  onDrop={(e) => { e.preventDefault(); const id = drag; setDrag(''); setOver(''); const a = applicationById(id); if (a && a.stage !== k) startMove(a, k); }}>
                  <header><b>{stageLabel(k)}</b><span>{list.length}</span></header>
                  {list.length ? list.map((a) => card(a)) : <p className="ap-empty">{k === 'rejected' ? 'Knockout answers land here' : 'Drop an applicant here'}</p>}
                </section>
              );
            })}
          </div>
        ) : shown.length ? (<>
          <ul className="ix-plist" aria-label="Applicants">
            {shown.map((a) => (
              <li key={a.id}><button type="button" className="ix-pitem ix-pitem--thumb" onClick={() => setOpen(a.id)}>
                <span style={{ gridRow: 'span 2' }}><Pic src={a.photo} name={a.name} kind="person" /></span>
                <span className="ix-pitem__top"><b>{a.name}</b><StageBadge stage={a.stage} /></span>
                <span className="ix-pitem__mid">{jobId ? '' : jobTitle(a.jobId) + ' · '}{sourceLabel(a.source)} · {ago(a.appliedAt)}</span>
              </button></li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table">
              <caption className="sr-only">Applicants</caption>
              <thead><tr><th scope="col">Applicant</th>{jobId ? null : <th scope="col">Job</th>}<th scope="col">Stage</th><th scope="col">Rating</th><th scope="col">Came from</th><th scope="col">City</th><th scope="col">Applied</th></tr></thead>
              <tbody>{shown.map((a) => (
                <tr key={a.id} onClick={(e) => { if (!e.target.closest('a,button')) setOpen(a.id); }}>
                  <td><span className="gc-picrow"><Pic src={a.photo} name={a.name} kind="person" /><span><button type="button" className="ix-strong" onClick={() => setOpen(a.id)}>{a.name}</button><span className="cr-sub">{a.phone}{a.email ? ' · ' + a.email : ''}</span></span></span></td>
                  {jobId ? null : <td>{jobTitle(a.jobId)}</td>}
                  <td><StageBadge stage={a.stage} />{a.knockout ? <span className="cr-sub" style={{ color: 'var(--text-danger)' }}>Knockout</span> : null}</td>
                  <td><Stars value={a.rating || 0} size={12} /></td>
                  <td className="ix-muted">{sourceLabel(a.source)}</td>
                  <td className="ix-muted">{a.city || '—'}</td>
                  <td className="ix-muted">{dShort(a.appliedAt)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>) : <div className="ix-empty"><EmptyState icon="search-x" title="No applicants match" body="Try another filter." /></div>}
        <div className="ix-foot"><span>{shown.length === all.length ? `${all.length} applicant${all.length === 1 ? '' : 's'}` : `${shown.length} of ${all.length} applicants`}</span>{view === 'table' && shown.length ? <button type="button" className="ix-btn ix-btn--sm" onClick={csv}><Icon name="download" width="14" height="14" aria-hidden="true" />CSV</button> : null}</div>
      </section>
      {open ? <ApplicantSheet id={open} by={by} onClose={() => setOpen('')} onMove={startMove} /> : null}
      <MoveDialog move={move} by={by} hireNote={hireNote} onClose={() => setMove(null)} onHire={onHire} />
      {job ? <ShareJob job={job} open={share} onClose={() => setShare(false)} /> : null}
    </>
  );
}
