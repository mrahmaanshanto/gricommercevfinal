'use client';
// Releases (/admin/themes/releases?id=REL-0142) — the publishing workflow for themes and landing page templates.
//   Board        Draft → In review → Approved → Published (last 30 days), a card per version with its actions:
//                send for review · approve (never the uploader; Technical ops or an admin) · send back with a reason ·
//                publish now or schedule · cancel a schedule · roll back the live version (reason, confirm) · remove a draft
//   Scheduled    approved versions waiting for their time (they go out on their own when the page is open)
//   Release log  every upload, review, publish, rollback, package and store change, filterable, CSV
// New release picks a theme or template and sends a new version for review. A card opens its details (?id=).
// Data: lib/admin/themes.js (newRelease, submitRelease, approveRelease, rejectRelease, publishRelease, cancelSchedule,
// rollback, deleteDraft, runSchedule). Who acts: the platform's signed-in staff member (switch in the account menu).

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { confirmDialog, toast } from '@/runtime/ui';
import { Sheet, StatusBadge, InfoTip } from '@/components/ui';
import { ShopHeader, MetricStrip, SearchField, KV } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { DAY, TZ, dhaka, dmy, dmhm } from '@/lib/platform/util';
import { staff } from '@/lib/platform/store';
import {
  itemsOf, itemById, releaseById, liveReleaseOf, logOf, rolloutLabel, stageLabel, mayPublish,
  submitRelease, approveRelease, rejectRelease, publishRelease, cancelSchedule, rollback, deleteDraft, cmpVer,
} from '@/lib/admin/themes';
import { AdminShell } from '../AdminShell';
import { TH_CSS, useThemes, Skeleton, Thumb, Row, when, plural, FormSheet, Field, ReleaseSheet } from './themeShared';

const CSS = `
.thr-board{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--space-3);padding:var(--space-3) var(--space-4) var(--space-4)}
.thr-col{display:flex;flex-direction:column;gap:var(--space-2);min-width:0;padding:var(--space-2);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.thr-col__h{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);padding:2px 4px;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.thr-col__h span{font-family:var(--font-data);font-weight:var(--weight-regular);color:var(--text-muted)}
.thr-col__empty{margin:0;padding:var(--space-3) 4px;font-size:var(--text-xs);color:var(--text-muted)}
.thr-card{display:flex;flex-direction:column;gap:6px;min-width:0;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-card);box-shadow:var(--shadow-xs)}
.thr-card__open{display:flex;gap:var(--space-2);align-items:flex-start;min-width:0;padding:0;border:0;background:none;font:inherit;text-align:left;color:inherit;cursor:pointer}
.thr-card__open:focus-visible{outline:2px solid var(--primary);outline-offset:2px;border-radius:var(--radius-sm)}
.thr-card__open .thm-thumb{flex:none;width:44px}
.thr-card__t{display:flex;flex-direction:column;gap:2px;min-width:0}
.thr-card__t b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);overflow-wrap:anywhere}
.thr-card__t small{font-size:var(--text-xs);color:var(--text-muted)}
.thr-card__notes{margin:0;font-size:var(--text-xs);color:var(--text-body);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.thr-card__tags{display:flex;flex-wrap:wrap;gap:4px}
.thr-card__acts{display:flex;flex-wrap:wrap;gap:4px}
.thr-who{margin:0;padding:8px var(--space-4) 0;font-size:var(--text-xs);color:var(--text-muted)}
.thr-logtools{display:flex;flex-wrap:wrap;gap:var(--space-2);padding:0 var(--space-4) var(--space-2)}
.thr-logtools .ix-search{flex:1 1 220px;max-width:320px}
.thr-logtools .gc-select{width:auto;min-width:180px}
@media (max-width:1199px){.thr-board{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:640px){
  .thr-board{grid-template-columns:minmax(0,1fr);padding:var(--space-3)}
  .thr-card__acts .ix-btn{height:36px}
  .thr-logtools{padding:0 var(--space-3) var(--space-2)}
  .thr-logtools .gc-select{flex:1 1 160px;min-width:0}
}
`;

const COLS = [['draft', 'Draft'], ['review', 'In review'], ['approved', 'Approved'], ['published', 'Published · 30 days']];
const dateInput = (ms) => new Date(ms + TZ).toISOString().slice(0, 10);
const fromDate = (d, time) => { const [y, m, dd] = String(d).split('-').map(Number); const [h, mi] = String(time || '10:00').split(':').map(Number); return y ? dhaka(y, m - 1, dd, h || 0, mi || 0) : null; };

function RejectSheet({ rel, item, close }) {
  const [reason, setReason] = useState('');
  const [err, setErr] = useState(null);
  const submit = () => {
    const r = rejectRelease(rel.id, reason);
    if (!r.ok) { setErr({ field: /change|few words/i.test(r.error) ? 'reason' : 'form', text: r.error }); return; }
    toast(`${item.name} ${rel.version} sent back to ${rel.uploadedBy}`);
    close();
  };
  return (
    <FormSheet id="thr-rej" title={`Send back ${item.name} ${rel.version}`} close={close} onSubmit={submit} submit="Send back" danger error={err}>
      <p className="thm-note">It goes back to Draft for {rel.uploadedBy}, with your reason.</p>
      <Field id="thr-rej-r" label="What needs to change" error={err && err.field === 'reason' ? err.text : null}>
        <textarea id="thr-rej-r" className={'gc-input' + (err && err.field === 'reason' ? ' gc-input--error' : '')} rows={3} value={reason} onChange={(e) => { setErr(null); setReason(e.target.value); }} />
      </Field>
    </FormSheet>
  );
}

function ScheduleSheet({ rel, item, t, close }) {
  const [f, setF] = useState({ date: dateInput(t + DAY), time: '10:00' });
  const [err, setErr] = useState(null);
  const submit = () => {
    const at = fromDate(f.date, f.time);
    if (!at) { setErr({ field: 'date', text: 'Pick a day.' }); return; }
    if (at <= t + 60000) { setErr({ field: 'date', text: 'Pick a time in the future, or publish it now.' }); return; }
    const r = publishRelease(rel.id, at);
    if (!r.ok) { setErr({ field: 'form', text: r.error }); return; }
    toast(`${item.name} ${rel.version} goes out ${dmy(at)} at ${f.time}`);
    close();
  };
  return (
    <FormSheet id="thr-sch" title={`Schedule ${item.name} ${rel.version}`} close={close} onSubmit={submit} submit="Schedule" error={err}>
      <p className="thm-note">It is published on its own at that time ({rolloutLabel(rel.rollout).toLowerCase()}).</p>
      <div className="thm-two">
        <Field id="thr-sch-d" label="Day" error={err && err.field === 'date' ? err.text : null}>
          <input id="thr-sch-d" type="date" className={'gc-input' + (err && err.field === 'date' ? ' gc-input--error' : '')} min={dateInput(t)} value={f.date} onChange={(e) => { setErr(null); setF({ ...f, date: e.target.value }); }} />
        </Field>
        <Field id="thr-sch-t" label="Time (Dhaka)">
          <input id="thr-sch-t" type="time" className="gc-input" value={f.time} onChange={(e) => { setErr(null); setF({ ...f, time: e.target.value }); }} />
        </Field>
      </div>
    </FormSheet>
  );
}

function RollbackSheet({ rel, item, data, close }) {
  const [reason, setReason] = useState('');
  const [err, setErr] = useState(null);
  const prev = data.releases.filter((x) => x.itemId === rel.itemId && x.stage === 'published' && x.id !== rel.id).sort((a, b) => cmpVer(b.version, a.version))[0];
  const submit = async () => {
    if (reason.trim().length < 5) { setErr({ field: 'reason', text: 'Say why it is rolled back (a few words).' }); return; }
    if (!(await confirmDialog({ title: `Roll ${item.name} back to ${prev ? prev.version : 'the version before'}?`, body: `Every ${item.kind === 'theme' ? 'store' : 'page'} on ${rel.version} goes back now. ${rel.version} can't be published again; release a fixed version instead.`, confirmLabel: 'Roll back', tone: 'danger' }))) return;
    const r = rollback(rel.id, reason);
    if (!r.ok) { setErr({ field: 'form', text: r.error }); return; }
    toast(`${item.name} rolled back to ${r.to}${r.moved ? ` · ${plural(r.moved, item.kind === 'theme' ? 'store' : 'page')} moved` : ''}`);
    close();
  };
  return (
    <FormSheet id="thr-rb" title={`Roll back ${item.name} ${rel.version}`} close={close} onSubmit={submit} submit="Roll back" danger error={err}>
      <p className="thm-note thm-note--warn">{prev ? `Stores go back to ${prev.version}.` : 'There is no earlier version to go back to.'}</p>
      <Field id="thr-rb-r" label="Reason" error={err && err.field === 'reason' ? err.text : null}>
        <textarea id="thr-rb-r" className={'gc-input' + (err && err.field === 'reason' ? ' gc-input--error' : '')} rows={3} value={reason} onChange={(e) => { setErr(null); setReason(e.target.value); }} />
      </Field>
    </FormSheet>
  );
}

/** The buttons a release card (and its panel) offers at its stage. */
function makeActions(data, open, me) {
  return (rel) => {
    const item = itemById(data, rel.itemId);
    if (!item) return [];
    const mine = rel.uploadedBy === me.name;
    const live = liveReleaseOf(data, rel.itemId);
    const say = (r, ok) => toast(r.ok ? ok : r.error);
    const acts = [];
    if (rel.stage === 'draft') {
      acts.push({ label: 'Send for review', primary: true, onClick: () => say(submitRelease(rel.id), `${item.name} ${rel.version} sent for review`) });
      acts.push({ label: 'Remove', onClick: async () => {
        if (!(await confirmDialog({ title: `Remove the ${rel.version} draft of ${item.name}?`, body: data.releases.filter((x) => x.itemId === rel.itemId).length === 1 ? `It is ${item.name}'s only version, so the ${item.kind} is removed too.` : 'The draft and its notes go away.', confirmLabel: 'Remove', tone: 'danger' }))) return;
        const r = deleteDraft(rel.id);
        toast(r.ok ? (r.removedItem ? `${r.removedItem} removed` : 'Draft removed') : r.error);
      } });
    }
    if (rel.stage === 'review') {
      if (!mine && mayPublish()) acts.push({ label: 'Approve', primary: true, onClick: () => say(approveRelease(rel.id), `${item.name} ${rel.version} approved`) });
      if (!mine && mayPublish()) acts.push({ label: 'Send back', onClick: () => open('reject', rel) });
    }
    if (rel.stage === 'approved' && mayPublish()) {
      acts.push({ label: 'Publish now', primary: true, onClick: async () => {
        if (!(await confirmDialog({ title: `Publish ${item.name} ${rel.version} now?`, body: `${rolloutLabel(rel.rollout)}.${rel.scheduledAt ? ' The schedule is replaced.' : ''}`, confirmLabel: 'Publish' }))) return;
        const r = publishRelease(rel.id);
        toast(r.ok ? `${item.name} ${rel.version} published${r.waiting ? ` · ${plural(r.waiting, item.kind === 'theme' ? 'store' : 'page')} update on the next visit` : r.updated ? ` · ${plural(r.updated, item.kind === 'theme' ? 'store' : 'page')} updated` : ''}` : r.error);
      } });
      if (rel.scheduledAt) acts.push({ label: 'Cancel schedule', onClick: () => say(cancelSchedule(rel.id), 'Schedule cancelled') });
      else acts.push({ label: 'Schedule', onClick: () => open('schedule', rel) });
      if (!mine) acts.push({ label: 'Send back', onClick: () => open('reject', rel) });
    }
    if (rel.stage === 'published' && live && live.id === rel.id && mayPublish()) acts.push({ label: 'Roll back', danger: true, onClick: () => open('rollback', rel) });
    return acts;
  };
}

function Tags({ rel, t, me, live }) {
  return (
    <span className="thr-card__tags">
      {rel.stage === 'rolledback' ? <StatusBadge tone="error">Rolled back</StatusBadge> : null}
      {rel.stage === 'published' && live ? <StatusBadge tone="success">Live</StatusBadge> : null}
      {rel.rejected && rel.stage === 'draft' ? <StatusBadge tone="error">Sent back</StatusBadge> : null}
      {rel.scheduledAt && rel.stage === 'approved' ? <StatusBadge tone="primary" icon="calendar-clock">{when(rel.scheduledAt, t)}</StatusBadge> : null}
      {rel.stage === 'review' && rel.uploadedBy === me.name ? <StatusBadge tone="neutral">Yours: someone else approves</StatusBadge> : null}
    </span>
  );
}

function DetailSheet({ rel, db, data, t, me, actionsFor, close }) {
  const item = itemById(data, rel.itemId);
  if (!item) return null;
  const live = liveReleaseOf(data, rel.itemId);
  const acts = actionsFor(rel);
  const events = logOf(data, rel.itemId).filter((l) => l.kind === 'release' && l.text.startsWith(rel.version + ' '));
  const storeNames = rel.stores.map((id) => (db.shops.find((x) => x.id === id) || { name: '#' + id }).name);
  return (
    <Sheet open title={`${item.name} ${rel.version}`} onClose={close} footer={(
      <>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={close}>Close</button>
        {acts.map((a) => <button key={a.label} type="button" className={'gc-btn ' + (a.danger ? 'gc-btn--error' : a.primary ? 'gc-btn--solid' : 'gc-btn--neutral')} onClick={a.onClick}>{a.label}</button>)}
      </>
    )}>
      <div className="thm-form">
        <Tags rel={rel} t={t} me={me} live={live && live.id === rel.id} />
        <KV rows={[
          [item.kind === 'theme' ? 'Theme' : 'Template', <Link key="i" href={item.kind === 'theme' ? '/admin/themes/view?id=' + item.id : '/admin/themes/templates?id=' + item.id}>{item.name}</Link>],
          ['Version', <span key="v" className="thm-data">{rel.version}</span>],
          ['Stage', stageLabel(rel.stage)],
          ['Release ID', <span key="r" className="thm-data">{rel.id}</span>],
          ['Notes', rel.notes],
          ['Reaches', rolloutLabel(rel.rollout) + (rel.rollout === 'selected' ? ` (${storeNames.join(', ')})` : '')],
          ['Uploaded', `${rel.uploadedBy} · ${dmhm(rel.uploadedAt)}`],
          rel.submittedAt ? ['Sent for review', dmhm(rel.submittedAt)] : null,
          rel.approvedBy ? ['Approved', `${rel.approvedBy} · ${dmhm(rel.approvedAt)}`] : null,
          rel.scheduledAt ? ['Scheduled for', dmhm(rel.scheduledAt)] : null,
          rel.publishedAt ? ['Published', `${rel.publishedBy} · ${dmhm(rel.publishedAt)}`] : null,
          rel.rolledBackAt ? ['Rolled back', `${rel.rolledBackBy} · ${dmhm(rel.rolledBackAt)} · ${rel.rollbackReason}`] : null,
          rel.rejected && rel.stage === 'draft' ? ['Sent back', `${rel.rejected.by} · ${rel.rejected.reason}`] : null,
        ]} />
        {events.length ? (
          <div>
            <p className="thm-sec" style={{ marginTop: 0 }}>History</p>
            {events.map((l) => <Row key={l.id} title={l.text} sub={`${l.by} · ${when(l.at, t)}`} />)}
          </div>
        ) : null}
        {rel.stage === 'review' && rel.uploadedBy === me.name ? <p className="thm-note">You uploaded this version, so someone else approves it. Switch to Rakib Hasan in the account menu to try the approval.</p> : null}
        {rel.stage !== 'draft' && !mayPublish() ? <p className="thm-note">Only Technical ops or an admin approves and publishes.</p> : null}
      </div>
    </Sheet>
  );
}

export default function Releases() {
  const { db, data, t, ready } = useThemes();
  const [sheet, setSheet] = useState(null);   // { kind, rel?, n }
  const [detail, setDetail] = useState(null);
  const [logItem, setLogItem] = useState('');
  const [q, setQ] = useState('');
  const [logAll, setLogAll] = useState(false);
  const me = ready ? staff() : { name: 'Mahin Khan', role: 'admin', title: 'Admin' };

  useEffect(() => { const id = new URLSearchParams(window.location.search).get('id'); if (id) setDetail(id); }, []);
  const openDetail = (id) => {
    setDetail(id);
    try {
      const p = new URLSearchParams(window.location.search);
      if (id) p.set('id', id); else p.delete('id');
      const s = p.toString();
      window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
    } catch { /* ignore */ }
  };
  const open = (kind, rel) => setSheet({ kind, rel, n: Date.now() });
  const actionsFor = makeActions(data, open, me);

  const header = (
    <ShopHeader icon="rocket" title="Releases"
      about="Every new theme or template version goes Draft → In review → Approved → Published. The person who uploaded a version never approves it; Technical ops or an admin approves, publishes now or schedules it, and can roll back the live version. The log keeps every step."
      secondary={ready ? [{ label: 'Export log', icon: 'download', onClick: () => exportLog() }] : []}
      more={[{ label: 'Theme library', href: '/admin/themes' }, { label: 'Templates', href: '/admin/themes/templates' }]}
      primary={ready ? { label: 'New release', icon: 'rocket', onClick: () => open('new') } : null} />
  );

  if (!ready) {
    return (
      <AdminShell active="theme-releases" title="Releases">
        <style dangerouslySetInnerHTML={{ __html: TH_CSS + CSS }} />
        <Skeleton label="Loading releases" header={header} />
      </AdminShell>
    );
  }

  const since = t - 30 * DAY;
  const col = (k) => data.releases.filter((r) => (k === 'published' ? (r.stage === 'published' || r.stage === 'rolledback') && r.publishedAt >= since : r.stage === k))
    .sort((a, b) => (k === 'published' ? b.publishedAt - a.publishedAt : (b.submittedAt || b.uploadedAt) - (a.submittedAt || a.uploadedAt)));
  const scheduled = data.releases.filter((r) => r.stage === 'approved' && r.scheduledAt).sort((a, b) => a.scheduledAt - b.scheduledAt);
  const pub30 = data.releases.filter((r) => r.publishedAt && r.publishedAt >= since).length;
  const rb30 = data.releases.filter((r) => r.rolledBackAt && r.rolledBackAt >= since).length;
  const reviewed = data.releases.filter((r) => r.approvedAt && r.submittedAt && r.approvedAt >= t - 90 * DAY);
  const avgH = reviewed.length ? Math.round(reviewed.reduce((n, r) => n + (r.approvedAt - r.submittedAt), 0) / reviewed.length / 3600e3) : null;
  const s = q.trim().toLowerCase();
  const log = logOf(data, logItem || null).filter((l) => !s || `${l.text} ${l.by} ${(itemById(data, l.itemId) || {}).name || ''}`.toLowerCase().includes(s));
  const shownLog = logAll ? log : log.slice(0, 15);
  const detailRel = detail ? releaseById(data, detail) : null;

  function exportLog() {
    downloadCsv('gridcommerce-theme-release-log.csv', [
      ['When', 'Who', 'Theme or template', 'Kind', 'What'],
      ...logOf(data).map((l) => [dmhm(l.at), l.by, (itemById(data, l.itemId) || {}).name || l.itemId, l.kind, l.text]),
    ]);
    toast('Release log exported');
  }

  const card = (rel) => {
    const item = itemById(data, rel.itemId);
    if (!item) return null;
    const live = liveReleaseOf(data, rel.itemId);
    const acts = actionsFor(rel);
    const by = rel.stage === 'published' || rel.stage === 'rolledback' ? `${rel.publishedBy} · ${when(rel.publishedAt, t)}` : rel.stage === 'approved' ? `Approved by ${rel.approvedBy} · ${when(rel.approvedAt, t)}` : `${rel.uploadedBy} · ${when(rel.submittedAt || rel.uploadedAt, t)}`;
    return (
      <div key={rel.id} className="thr-card">
        <button type="button" className="thr-card__open" onClick={() => openDetail(rel.id)} aria-label={`${item.name} ${rel.version}, ${stageLabel(rel.stage)}: open details`}>
          <Thumb item={item} small />
          <span className="thr-card__t"><b>{item.name} <span className="thm-data">{rel.version}</span></b><small>{item.kind === 'theme' ? 'Theme' : 'Template'} · {by}</small></span>
        </button>
        <p className="thr-card__notes">{rel.stage === 'draft' && rel.rejected ? `Sent back: ${rel.rejected.reason}` : rel.stage === 'rolledback' ? `Rolled back: ${rel.rollbackReason}` : rel.notes}</p>
        <Tags rel={rel} t={t} me={me} live={live && live.id === rel.id} />
        {acts.length ? (
          <span className="thr-card__acts">
            {acts.map((a) => <button key={a.label} type="button" className={'ix-btn ix-btn--sm' + (a.primary ? ' ix-btn--primary' : a.danger ? ' ix-btn--danger' : '')} onClick={a.onClick}>{a.label}</button>)}
          </span>
        ) : null}
      </div>
    );
  };

  return (
    <AdminShell active="theme-releases" title="Releases">
      <style dangerouslySetInnerHTML={{ __html: TH_CSS + CSS }} />
      <div className="ix-page">
        {header}
        <MetricStrip items={[
          { label: 'Published · 30 days', value: pub30, icon: 'rocket' },
          { label: 'Rolled back · 30 days', value: rb30, icon: 'undo-2' },
          { label: 'Average review time', value: avgH == null ? '—' : avgH < 48 ? `${avgH} h` : `${Math.round(avgH / 24)} days`, icon: 'clock' },
        ]} />

        <section className="ix-card" aria-labelledby="thr-board-h">
          <div className="ix-card__head">
            <h2 id="thr-board-h">Workflow</h2>
            <InfoTip label="About the workflow" text="Whoever uploads a version can send it for review but never approves it. Technical ops or an admin approves, then publishes it now or on a date. Only the live version can be rolled back; stores go back to the version before it." />
          </div>
          <p className="thr-who">Acting as {me.name} ({me.title || me.role}){mayPublish() ? ' · can approve and publish' : ' · can upload and send for review'}</p>
          <div className="thr-board">
            {COLS.map(([k, l]) => {
              const list = col(k);
              return (
                <section key={k} className="thr-col" aria-label={l}>
                  <div className="thr-col__h">{l}<span>{list.length}</span></div>
                  {list.length ? (k === 'published' ? list.slice(0, 8) : list).map(card) : <p className="thr-col__empty">{k === 'review' ? 'Nothing waiting for review.' : k === 'approved' ? 'Nothing approved and waiting.' : k === 'draft' ? 'No drafts.' : 'Nothing published in 30 days.'}</p>}
                  {k === 'published' && list.length > 8 ? <p className="thr-col__empty">{list.length - 8} more in the release log.</p> : null}
                </section>
              );
            })}
          </div>
        </section>

        <section className="ix-card" aria-labelledby="thr-sch-h">
          <div className="ix-card__head"><h2 id="thr-sch-h">Scheduled · {scheduled.length}</h2></div>
          <div className="ix-card__body">
            {scheduled.length ? scheduled.map((rel) => {
              const item = itemById(data, rel.itemId);
              return (
                <Row key={rel.id}
                  title={<button type="button" className="ix-strong" style={{ border: 0, background: 'none', padding: 0, font: 'inherit', cursor: 'pointer' }} onClick={() => openDetail(rel.id)}>{item ? item.name : rel.itemId} <span className="thm-data">{rel.version}</span></button>}
                  sub={`${dmhm(rel.scheduledAt)} · ${rolloutLabel(rel.rollout)} · approved by ${rel.approvedBy}`}
                  end={mayPublish() ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => { const r = cancelSchedule(rel.id); toast(r.ok ? 'Schedule cancelled' : r.error); }}>Cancel</button> : null} />
              );
            }) : <p className="thm-empty">Nothing scheduled.</p>}
          </div>
        </section>

        <section className="ix-card" aria-labelledby="thr-log-h">
          <div className="ix-card__head"><h2 id="thr-log-h">Release log</h2></div>
          <div className="thr-logtools">
            <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the log" onDone={() => setQ('')} />
            <select className="gc-input gc-select" aria-label="Theme or template" value={logItem} onChange={(e) => setLogItem(e.target.value)}>
              <option value="">All themes and templates</option>
              <optgroup label="Themes">{itemsOf(data, 'theme').map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</optgroup>
              <optgroup label="Templates">{itemsOf(data, 'template').map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</optgroup>
            </select>
          </div>
          {shownLog.length ? (
            <>
              <ul className="ix-plist">
                {shownLog.map((l) => (
                  <li key={l.id}><div className="ix-pitem"><span className="ix-pitem__top"><b>{(itemById(data, l.itemId) || {}).name || l.itemId}</b><span className="thm-small thm-muted">{when(l.at, t)}</span></span><span className="ix-pitem__mid" style={{ whiteSpace: 'normal' }}>{l.text} · {l.by}</span></div></li>
                ))}
              </ul>
              <div className="ix-table-wrap">
                <table className="ix-table ix-table--static gc-table--keep">
                  <caption className="sr-only">Release log</caption>
                  <thead><tr><th scope="col">When</th><th scope="col">Who</th><th scope="col">Theme or template</th><th scope="col">What</th></tr></thead>
                  <tbody>
                    {shownLog.map((l) => {
                      const it = itemById(data, l.itemId);
                      return (
                        <tr key={l.id}>
                          <td className="ix-muted">{when(l.at, t)}</td>
                          <td>{l.by}</td>
                          <td>{it ? <Link href={it.kind === 'theme' ? '/admin/themes/view?id=' + it.id : '/admin/themes/templates?id=' + it.id}>{it.name}</Link> : <span className="ix-muted">{l.itemId}</span>}</td>
                          <td style={{ whiteSpace: 'normal' }}>{l.text}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : <div className="ix-card__body"><p className="thm-empty">Nothing in the log matches.</p></div>}
          <div className="ix-foot">
            <span>{plural(shownLog.length, 'entry', 'entries')}{shownLog.length !== log.length ? ` of ${log.length}` : ''}</span>
            {log.length > 15 ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setLogAll(!logAll)}>{logAll ? 'Show fewer' : 'Show all'}</button> : null}
          </div>
        </section>
      </div>

      {detailRel && !sheet ? <DetailSheet rel={detailRel} db={db} data={data} t={t} me={me} actionsFor={actionsFor} close={() => openDetail(null)} /> : null}
      {sheet && sheet.kind === 'new' ? <ReleaseSheet key={sheet.n} pick close={() => setSheet(null)} /> : null}
      {sheet && sheet.kind === 'reject' ? <RejectSheet key={sheet.n} rel={sheet.rel} item={itemById(data, sheet.rel.itemId)} close={() => setSheet(null)} /> : null}
      {sheet && sheet.kind === 'schedule' ? <ScheduleSheet key={sheet.n} rel={sheet.rel} item={itemById(data, sheet.rel.itemId)} t={t} close={() => setSheet(null)} /> : null}
      {sheet && sheet.kind === 'rollback' ? <RollbackSheet key={sheet.n} rel={sheet.rel} item={itemById(data, sheet.rel.itemId)} data={data} close={() => setSheet(null)} /> : null}
    </AdminShell>
  );
}
