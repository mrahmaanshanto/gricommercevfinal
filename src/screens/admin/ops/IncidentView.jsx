'use client';
// Incident (/admin/incidents/view?id=INC-114) — one incident: severity and status in the header, the status stepper
// (Investigating → Identified → Monitoring → Resolved), the timeline with "Post update" (status + message, "Notify
// affected merchants"), the resolution and the post-mortem; on the right the facts (owner, times), the affected services
// (their state now), the affected stores (links to the merchant) and the linked tickets (T-2291 → the ticket page).
// Resolve asks for a resolution note. Data: lib/admin/ops.js (postUpdate, resolveIncident, reopenIncident, setOwner,
// linkTicket, savePostmortem, services, integration). ?id= is read after mount; the server render is the outline only.

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet, EmptyState } from '@/components/ui';
import { RecordHeader, KV } from '@/components/ui/IndexKit';
import { hm } from '@/lib/platform/util';
import { useAdminStore } from '@/lib/admin/store';
import {
  ops, incidentById, services, INTEGRATIONS, QUEUES, STATUSES, OWNERS, postUpdate, resolveIncident, reopenIncident, setOwner, linkTicket, savePostmortem,
} from '@/lib/admin/ops';
import { AdminShell, usePlatform } from '../AdminShell';
import { OPS_CSS, Card, SevTag, IncTag, StateTag, Field, ctl, when, span, plural, INC_TONE } from './opsShared';

const CSS = `
.iv-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;margin:0;padding:var(--space-3) var(--space-4);list-style:none}
.iv-step{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;font-size:var(--text-xs);color:var(--text-muted)}
.iv-step::before{content:"";position:absolute;top:11px;left:-50%;width:100%;height:2px;background:var(--border-subtle)}
.iv-step:first-child::before{display:none}
.iv-step.is-done::before,.iv-step.is-now::before{background:var(--primary)}
.iv-step__dot{position:relative;z-index:1;display:grid;place-items:center;width:24px;height:24px;border:2px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);color:var(--text-inverse)}
.iv-step.is-done .iv-step__dot{border-color:var(--primary);background:var(--primary)}
.iv-step.is-now .iv-step__dot{border-color:var(--primary);background:var(--surface-card);box-shadow:0 0 0 3px var(--fill-primary-soft)}
.iv-step.is-now .iv-step__dot::after{content:"";width:8px;height:8px;border-radius:var(--radius-full);background:var(--primary)}
.iv-step b{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body)}
.iv-step.is-now b,.iv-step.is-done b{color:var(--text-heading)}
.iv-step small{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.iv-compose{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-subtle);background:var(--surface-page)}
.iv-compose textarea.gc-input{height:auto;min-height:80px;padding:var(--space-2) var(--space-3);resize:vertical;line-height:1.5;background:var(--surface-card)}
.iv-compose__row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3)}
.iv-compose__row .gc-input{width:auto;min-width:160px}
.iv-compose__row .gc-btn{margin-left:auto}
.iv-tl{margin:0;padding:var(--space-3) var(--space-4) var(--space-4);list-style:none}
.iv-ev{position:relative;display:grid;grid-template-columns:20px minmax(0,1fr);gap:var(--space-3);padding-bottom:var(--space-4)}
.iv-ev:last-child{padding-bottom:0}
.iv-ev::before{content:"";position:absolute;top:20px;bottom:0;left:9px;width:2px;background:var(--border-subtle)}
.iv-ev:last-child::before{display:none}
.iv-ev__dot{width:12px;height:12px;margin:4px;border-radius:var(--radius-full);background:var(--border-strong)}
.iv-ev__dot.is-error{background:var(--text-danger)}
.iv-ev__dot.is-warning{background:var(--warning)}
.iv-ev__dot.is-primary{background:var(--primary)}
.iv-ev__dot.is-success{background:var(--success)}
.iv-ev__top{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.iv-ev__top small{font-size:var(--text-xs);color:var(--text-muted)}
.iv-ev p{margin:4px 0 0;font-size:var(--text-sm);color:var(--text-heading);white-space:pre-wrap;overflow-wrap:anywhere}
.iv-ev__note{display:inline-flex;align-items:center;gap:4px;margin-top:4px;font-size:var(--text-xs);color:var(--text-muted)}
.iv-svc{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);min-height:36px;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-heading);text-decoration:none}
.iv-svc:first-child{border-top:0}
a.iv-svc:hover span:first-child{color:var(--primary)}
.iv-comp{margin:var(--space-2) 0 0;padding:0;list-style:none;font-size:var(--text-xs);color:var(--text-muted)}
.iv-comp li{padding:2px 0}
.iv-stores{display:flex;flex-wrap:wrap;gap:6px}
.iv-tk{display:flex;align-items:center;gap:var(--space-2);min-height:36px;font-size:var(--text-sm);color:var(--text-heading);text-decoration:none}
.iv-tk:hover{color:var(--primary)}
.iv-tk svg{color:var(--text-muted)}
.iv-link{display:flex;gap:var(--space-2);margin-top:var(--space-2)}
.iv-link .gc-input{flex:1;min-width:0}
.iv-pm{display:flex;flex-direction:column;gap:var(--space-3);font-size:var(--text-sm);color:var(--text-body)}
.iv-pm h3{margin:0 0 2px;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.iv-pm p{margin:0;white-space:pre-wrap}
.iv-act{display:flex;align-items:flex-start;gap:var(--space-2);padding:4px 0}
.iv-act svg{flex:none;margin-top:2px;color:var(--text-muted)}
.iv-act.is-done svg{color:var(--text-success)}
.iv-act small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.iv-res{margin:0;font-size:var(--text-sm);color:var(--text-heading);white-space:pre-wrap}
@media (max-width:640px){
  .iv-steps{padding:var(--space-3) var(--space-2)}
  .iv-step small{display:none}
  .iv-compose__row .gc-input,.iv-compose__row .gc-btn{flex:1 1 100%;margin-left:0}
  .iv-compose,.iv-tl{padding-inline:var(--space-3)}
}
`;

function Stepper({ inc }) {
  const at = {};
  for (const u of inc.updates) if (!at[u.status]) at[u.status] = u.at;
  if (inc.resolvedAt) at.Resolved = inc.resolvedAt;
  const cur = STATUSES.indexOf(inc.status);
  return (
    <section className="ix-card" aria-label="Status">
      <ol className="iv-steps">
        {STATUSES.map((s, i) => {
          const cls = i < cur || inc.status === 'Resolved' ? 'is-done' : i === cur ? 'is-now' : '';
          return (
            <li key={s} className={'iv-step ' + cls} aria-current={i === cur ? 'step' : undefined}>
              <span className="iv-step__dot" aria-hidden="true">{cls === 'is-done' ? <Icon name="check" width="12" height="12" /> : null}</span>
              <b>{s}</b><small>{at[s] && i <= cur ? hm(at[s]) : '—'}</small>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Skeleton() {
  return (
    <div className="ix-page" aria-busy="true" aria-label="Loading the incident">
      <div className="ops-skel ops-skel--strip" />
      <div className="ix-record"><div className="ops-skel" /><div className="ops-skel" /></div>
    </div>
  );
}

const NEXT = { Investigating: 'Identified', Identified: 'Monitoring', Monitoring: 'Monitoring' };

export default function IncidentView() {
  const router = useRouter();
  const { db, live: plive } = usePlatform();
  const { t, live: olive } = useAdminStore(ops);
  const live = plive && olive;
  const [id, setId] = useState(null);
  const [draft, setDraft] = useState({ status: '', text: '', notify: true, error: '' });
  const [sheet, setSheet] = useState(null);   // { kind: 'resolve'|'pm'|'stores', … }
  const [ticket, setTicket] = useState({ v: '', error: '' });
  const box = useRef(null);

  useEffect(() => { setId(String(new URLSearchParams(window.location.search).get('id') || '').trim().toUpperCase()); }, []);
  const inc = live && id ? incidentById(id) : null;
  useEffect(() => { if (inc) setDraft((d) => ({ ...d, status: d.status || NEXT[inc.status] || inc.status })); }, [inc ? inc.id + inc.status : '']);   // eslint-disable-line react-hooks/exhaustive-deps

  if (!live || id == null) return <AdminShell active="incidents" title="Incident"><style dangerouslySetInnerHTML={{ __html: OPS_CSS + CSS }} /><Skeleton /></AdminShell>;
  if (!inc) {
    return (
      <AdminShell active="incidents" title="Incident">
        <style dangerouslySetInnerHTML={{ __html: OPS_CSS + CSS }} />
        <div className="ix-page">
          <RecordHeader back="/admin/incidents" backLabel="Back to incidents" title="Incident" />
          <section className="ix-card"><EmptyState icon="siren" title={id ? `No incident ${id}` : 'No incident picked'} body="Check the number, or open it from the list." actionLabel="Back to incidents" onAction={() => router.push('/admin/incidents')} /></section>
        </div>
      </AdminShell>
    );
  }

  const active = inc.status !== 'Resolved';
  const svcs = services(t);
  const shopName = (sid) => ((db.shops || []).find((z) => z.id === sid) || {}).name || '#' + sid;
  const it = inc.integration ? INTEGRATIONS.find((i) => i.key === inc.integration) : null;
  const n = (inc.stores || []).length;
  const updates = inc.updates.slice().reverse();

  // ---- actions ----
  const focusBox = () => setTimeout(() => { if (box.current) { box.current.scrollIntoView({ block: 'center', behavior: 'smooth' }); box.current.focus(); } }, 0);
  const post = () => {
    const res = postUpdate(inc.id, { status: draft.status || inc.status, text: draft.text, notify: draft.notify && n > 0 });
    if (!res.ok) { setDraft({ ...draft, error: res.error }); return; }
    setDraft({ status: '', text: '', notify: draft.notify, error: '' });
    toast('Update posted' + (res.notified ? ` · sent to ${plural(res.notified, 'merchant')} by SMS and email` : ''));
  };
  const doSheet = () => {
    if (sheet.kind === 'resolve') {
      const res = resolveIncident(inc.id, sheet.note, sheet.notify && n > 0);
      if (!res.ok) { setSheet({ ...sheet, error: res.error }); return; }
      setSheet(null);
      toast(inc.id + ' resolved' + (res.notified ? ` · ${plural(res.notified, 'merchant')} told` : ''));
    } else if (sheet.kind === 'pm') {
      const old = (inc.postmortem && inc.postmortem.actions) || [];
      const actions = sheet.actions.split('\n').map((line) => line.trim()).filter(Boolean).map((text) => { const o = old.find((a) => a.text === text); return { text, owner: o ? o.owner : inc.owner, done: o ? o.done : false }; });
      const res = savePostmortem(inc.id, { summary: sheet.summary, cause: sheet.cause, impact: sheet.impact, actions });
      if (!res.ok) { setSheet({ ...sheet, error: res.error, field: res.field }); return; }
      setSheet(null);
      toast('Post-mortem saved');
    }
  };
  const openPm = () => {
    const p = inc.postmortem || {};
    setSheet({ kind: 'pm', summary: p.summary || '', cause: p.cause || '', impact: p.impact || (n ? plural(n, 'store') + ' affected.' : ''), actions: (p.actions || []).map((a) => a.text).join('\n'), error: '' });
  };
  const toggleAction = (i) => {
    const p = inc.postmortem;
    const actions = p.actions.map((a, k) => (k === i ? { ...a, done: !a.done } : a));
    const res = savePostmortem(inc.id, { ...p, actions });
    if (!res.ok) toast(res.error);
  };
  const doLink = () => {
    const res = linkTicket(inc.id, ticket.v);
    if (!res.ok) { setTicket({ ...ticket, error: res.error }); return; }
    setTicket({ v: '', error: '' });
    toast(res.ticket + ' linked');
  };
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.origin + '/admin/incidents/view?id=' + inc.id); toast('Incident link copied'); } catch { toast('Copy failed: copy the address from the browser bar'); }
  };

  const primary = active ? { label: 'Post update', icon: 'megaphone', onClick: focusBox } : !inc.postmortem ? { label: 'Write post-mortem', icon: 'file-text', onClick: openPm } : null;
  const secondary = active ? [{ label: 'Resolve', icon: 'circle-check', onClick: () => setSheet({ kind: 'resolve', note: '', notify: true, error: '' }) }] : [];
  const more = [
    !active ? { label: 'Reopen', onClick: () => { const r = reopenIncident(inc.id); toast(r.ok ? inc.id + ' reopened' : r.error); } } : null,
    !active && inc.postmortem ? { label: 'Edit post-mortem', onClick: openPm } : null,
    { label: 'Copy incident link', onClick: copyLink },
    it ? { label: 'Open ' + it.name, href: '/admin/integrations?app=' + it.key } : null,
    { label: 'Servers', href: '/admin/servers' },
  ].filter(Boolean);

  return (
    <AdminShell active="incidents" title={inc.id}>
      <style dangerouslySetInnerHTML={{ __html: OPS_CSS + CSS }} />
      <div className="ix-page">
        <RecordHeader back="/admin/incidents" backLabel="Back to incidents" title={inc.title}
          about="One platform incident: its status steps, the timeline of updates (each can be sent to the affected merchants by SMS and email), who owns it, the services and stores it touches, the tickets about it, and after it is resolved the post-mortem."
          badges={<><SevTag s={inc.severity} /><IncTag s={inc.status} /></>}
          meta={<><span className="ops-data">{inc.id}</span> · started {when(inc.startedAt, t)} · {active ? 'open for ' : 'lasted '}{span((inc.resolvedAt || t) - inc.startedAt)} · {plural(n, 'store')}</>}
          secondary={secondary} more={more} primary={primary} />

        <Stepper inc={inc} />

        <div className="ix-record">
          <div className="ix-main">
            <Card title="Timeline" flush action={<span className="ops-small">{plural(inc.updates.length, 'update')}</span>}>
              {active ? (
                <div className="iv-compose">
                  <label className="sr-only" htmlFor="iv-text">Update</label>
                  <textarea id="iv-text" ref={box} className={'gc-input' + (draft.error ? ' gc-input--error' : '')} rows={3} value={draft.text} aria-invalid={draft.error ? true : undefined}
                    placeholder="What changed, what we are doing, when the next update comes" onChange={(e) => setDraft({ ...draft, text: e.target.value, error: '' })}
                    onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); post(); } }} />
                  {draft.error ? <p className="gc-help gc-help--error" role="alert">{draft.error}</p> : null}
                  <div className="iv-compose__row">
                    <select className="gc-input gc-select" aria-label="Status after this update" value={draft.status || inc.status} onChange={(e) => setDraft({ ...draft, status: e.target.value, error: '' })}>
                      {STATUSES.filter((s) => s !== 'Resolved').map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <label className="ops-check"><input type="checkbox" checked={draft.notify && n > 0} disabled={!n} onChange={(e) => setDraft({ ...draft, notify: e.target.checked })} />Notify affected merchants ({n})</label>
                    <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={post}><Icon name="megaphone" width="16" height="16" aria-hidden="true" />Post update</button>
                  </div>
                </div>
              ) : null}
              <ol className="iv-tl" aria-label="Updates, newest first">
                {updates.map((u) => (
                  <li key={u.id} className="iv-ev">
                    <span className={'iv-ev__dot is-' + (INC_TONE[u.status] || 'neutral')} aria-hidden="true" />
                    <div>
                      <span className="iv-ev__top"><IncTag s={u.status} /><small>{when(u.at, t)} · {u.by}</small></span>
                      <p>{u.text}</p>
                      {u.notified ? <span className="iv-ev__note"><Icon name="send" width="12" height="12" aria-hidden="true" />Sent to {plural(u.notified, 'merchant')} by SMS and email</span> : null}
                    </div>
                  </li>
                ))}
              </ol>
            </Card>

            {!active ? (
              <Card title="Resolution">
                <p className="iv-res">{inc.resolution || 'No resolution note.'}</p>
              </Card>
            ) : null}

            {!active ? (
              <Card title="Post-mortem" action={inc.postmortem ? <button type="button" className="ix-btn ix-btn--sm" onClick={openPm}>Edit</button> : null}>
                {inc.postmortem ? (
                  <div className="iv-pm">
                    <div><h3>What happened</h3><p>{inc.postmortem.summary}</p></div>
                    <div><h3>Cause</h3><p>{inc.postmortem.cause}</p></div>
                    {inc.postmortem.impact ? <div><h3>Impact</h3><p>{inc.postmortem.impact}</p></div> : null}
                    {inc.postmortem.actions.length ? (
                      <div>
                        <h3>Follow-up</h3>
                        {inc.postmortem.actions.map((a, i) => (
                          <button key={a.text} type="button" className={'iv-act ops-sortbtn' + (a.done ? ' is-done' : '')} aria-pressed={a.done} onClick={() => toggleAction(i)} style={{ textAlign: 'left' }}>
                            <Icon name={a.done ? 'circle-check' : 'circle'} width="16" height="16" aria-hidden="true" />
                            <span>{a.text}<small>{a.owner}{a.done ? ' · done' : ' · open'}</small></span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <p className="ops-small">{inc.postmortem.by}{inc.postmortem.at ? ' · ' + when(inc.postmortem.at, t) : ''}</p>
                  </div>
                ) : (
                  <EmptyState icon="file-text" title={inc.severity === 'SEV1' || inc.severity === 'SEV2' ? 'A post-mortem is due for this incident.' : 'No post-mortem written.'} actionLabel="Write post-mortem" onAction={openPm} />
                )}
              </Card>
            ) : null}
          </div>

          <div className="ix-side">
            <Card title="Details">
              <KV rows={[
                ['Severity', inc.severity],
                ['Owner', active ? (
                  <select key="o" className="gc-input gc-select" aria-label="Owner" style={{ width: 'auto', height: 28 }} value={inc.owner} onChange={(e) => { const r = setOwner(inc.id, e.target.value); toast(r.ok ? 'Owner: ' + e.target.value : r.error); }}>
                    {OWNERS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : inc.owner],
                ['Started', when(inc.startedAt, t)],
                ['Detected', when(inc.detectedAt, t)],
                inc.monitoringAt ? ['Monitoring since', when(inc.monitoringAt, t)] : null,
                inc.resolvedAt ? ['Resolved', when(inc.resolvedAt, t)] : null,
                [active ? 'Open for' : 'Lasted', span((inc.resolvedAt || t) - inc.startedAt)],
                ['Declared by', inc.by],
              ]} />
            </Card>

            <Card title="Affected services">
              {(inc.services || []).map((k) => {
                const v = svcs.find((s) => s.key === k);
                const ig = INTEGRATIONS.find((i) => i.service === k);
                const href = ig ? '/admin/integrations?app=' + ig.key : k === 'api' ? '/admin/apis' : '/admin/servers';
                return <Link key={k} href={href} className="iv-svc"><span>{v ? v.name : k}</span>{v ? <StateTag s={v.status === 'ok' ? 'ok' : v.status === 'down' ? 'down' : 'warn'} /> : null}</Link>;
              })}
              {(inc.components || []).length || (inc.queues || []).length ? (
                <ul className="iv-comp">
                  {(inc.components || []).map((c) => <li key={c}>{c}</li>)}
                  {(inc.queues || []).filter((q) => !(inc.components || []).some((c) => c.toLowerCase().includes((QUEUES.find((y) => y.key === q) || {}).name.toLowerCase()))).map((q) => <li key={q}>Queue {q}</li>)}
                </ul>
              ) : null}
            </Card>

            <Card title={`Affected stores (${n})`} action={n > 10 ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => setSheet({ kind: 'stores' })}>Show all</button> : null}>
              {n ? (
                <div className="iv-stores">
                  {inc.stores.slice(0, 10).map((sid) => <Link key={sid} href={'/admin/merchant?id=' + sid} className="ops-chip">{shopName(sid)} <span className="ops-data">#{sid}</span></Link>)}
                  {n > 10 ? <span className="ops-chip">+{n - 10} more</span> : null}
                </div>
              ) : <p className="ops-muted" style={{ margin: 0 }}>No store named yet.</p>}
            </Card>

            <Card title="Linked tickets">
              {(inc.tickets || []).length ? inc.tickets.map((tk) => (
                <Link key={tk} href={'/admin/tickets/view?id=' + tk} className="iv-tk"><Icon name="life-buoy" width="16" height="16" aria-hidden="true" /><span className="ops-data">{tk}</span></Link>
              )) : <p className="ops-muted" style={{ margin: 0 }}>No tickets linked.</p>}
              <div className="iv-link">
                <label className="sr-only" htmlFor="iv-tk">Ticket number</label>
                <input id="iv-tk" className={'gc-input' + (ticket.error ? ' gc-input--error' : '')} placeholder="T-2291" value={ticket.v} onChange={(e) => setTicket({ v: e.target.value, error: '' })} onKeyDown={(e) => { if (e.key === 'Enter') doLink(); }} />
                <button type="button" className="ix-btn" onClick={doLink}>Link</button>
              </div>
              {ticket.error ? <p className="gc-help gc-help--error" role="alert">{ticket.error}</p> : null}
            </Card>
          </div>
        </div>
      </div>

      <Sheet open={!!sheet && sheet.kind !== 'stores'} title={sheet && sheet.kind === 'resolve' ? 'Resolve ' + inc.id : 'Post-mortem'} onClose={() => setSheet(null)}
        footer={<>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setSheet(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={doSheet}>{sheet && sheet.kind === 'resolve' ? 'Resolve' : 'Save post-mortem'}</button>
        </>}>
        {sheet && sheet.kind === 'resolve' ? (
          <div className="ops-form">
            <p>{inc.title} · open for {span(t - inc.startedAt)}</p>
            <Field id="iv-note" label="What fixed it" error={sheet.error} hint="Shown on the incident and sent to merchants when you notify them.">
              <textarea id="iv-note" {...ctl(sheet.error)} data-autofocus rows={4} value={sheet.note} onChange={(e) => setSheet({ ...sheet, note: e.target.value, error: '' })} placeholder="e.g. Steadfast fixed their webhook sender; the backlog has cleared and statuses are up to date." />
            </Field>
            <label className="ops-check"><input type="checkbox" checked={sheet.notify && n > 0} disabled={!n} onChange={(e) => setSheet({ ...sheet, notify: e.target.checked })} />Notify affected merchants by SMS and email ({n})</label>
          </div>
        ) : null}
        {sheet && sheet.kind === 'pm' ? (
          <div className="ops-form">
            <Field id="pm-sum" label="What happened" error={sheet.field === 'summary' ? sheet.error : ''}>
              <textarea id="pm-sum" {...ctl(sheet.field === 'summary')} data-autofocus rows={3} value={sheet.summary} onChange={(e) => setSheet({ ...sheet, summary: e.target.value, error: '' })} />
            </Field>
            <Field id="pm-cause" label="Cause" error={sheet.field === 'cause' ? sheet.error : ''}>
              <textarea id="pm-cause" {...ctl(sheet.field === 'cause')} rows={2} value={sheet.cause} onChange={(e) => setSheet({ ...sheet, cause: e.target.value, error: '' })} />
            </Field>
            <Field id="pm-impact" label="Impact">
              <textarea id="pm-impact" {...ctl(false)} rows={2} value={sheet.impact} onChange={(e) => setSheet({ ...sheet, impact: e.target.value })} />
            </Field>
            <Field id="pm-actions" label="Follow-up actions" hint={`One per line. Owner: ${inc.owner} (change it later on the action).`}>
              <textarea id="pm-actions" {...ctl(false)} rows={4} value={sheet.actions} onChange={(e) => setSheet({ ...sheet, actions: e.target.value })} />
            </Field>
            {sheet.error && !sheet.field ? <p className="ops-formerr" role="alert">{sheet.error}</p> : null}
          </div>
        ) : null}
      </Sheet>

      <Sheet open={!!sheet && sheet.kind === 'stores'} title={`Affected stores (${n})`} onClose={() => setSheet(null)}
        footer={<button type="button" className="gc-btn gc-btn--neutral" onClick={() => setSheet(null)}>Close</button>}>
        <ul className="ops-list">
          {(inc.stores || []).map((sid) => (
            <li key={sid}><span className="ops-list__main"><Link href={'/admin/merchant?id=' + sid} className="ix-strong">{shopName(sid)}</Link><small className="ops-data">#{sid}</small></span></li>
          ))}
        </ul>
      </Sheet>
    </AdminShell>
  );
}
