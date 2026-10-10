'use client';
// Edit plan (/admin/packages/edit?ladder=online&plan=business[&draft=PV-001]) — a change to one plan is a draft of the
// family's next version. The form (plan, price, limits, what each module set does — or, for a Connect plan, which
// modules it includes — when it goes live and who approves) sits on the left; on the right the changes against the
// live version, the stores on the plan and the drafts waiting for a second person, with Approve / Reject for someone
// who may decide (Finance or an Admin, never the person who drafted it).
// Ladders: lib/platform/plans.js (draftFor · draftErrors · diff · saveDraft · submitDraft · decideDraft).
// Connect: lib/admin/packages.js (commsDraftFor · commsDraftErrors · commsDiff · saveCommsDraft · submitCommsDraft ·
// decideCommsDraft). Opening a plan with a saved draft of yours continues it; ?draft= opens a given draft.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { confirmDialog, toast } from '@/runtime/ui';
import { Dialog, StatusBadge, EmptyState, InfoTip, PhoneActionBar } from '@/components/ui';
import { RecordHeader, KV } from '@/components/ui/IndexKit';
import { dmy, ago } from '@/lib/platform/util';
import { SETS, SET_STATES, LIMIT_KEYS, UNLIMITED, APPROVERS, can, moduleBy } from '@/lib/platform/catalogue';
import { staff } from '@/lib/platform/store';
import { draftFor, draftErrors, diff, saveDraft, submitDraft, decideDraft } from '@/lib/platform/plans';
import {
  COMMS, COMMS_LIMITS, COMMS_MODULES, familyLabel, planIdsOf, planNameOf, liveOf, draftsOf, planStats,
  commsDraftFor, commsDraftErrors, commsDiff, saveCommsDraft, submitCommsDraft, decideCommsDraft,
} from '@/lib/admin/packages';
import { AdminShell, usePlatform } from '../AdminShell';
import { PK_CSS, usePackages, money, limitText, plural, Field, ctl, toNum, toDateInput, fromDateInput } from './pkgShared';

const FAMS = ['online', 'retail', 'wholesale', COMMS];
const STATE = { new: ['New draft', 'primary'], draft: ['Draft', 'neutral'], pending: ['Waiting for approval', 'warning'], rejected: ['Rejected', 'error'], approved: ['Approved', 'success'] };
const SIGN = { '+': 'is-add', '−': 'is-del', '~': 'is-chg' };
const AT_LIMIT = [['block', 'Block and offer a top-up'], ['bill', 'Allow and bill the overage']];
const clone = (x) => JSON.parse(JSON.stringify(x));

const CSS = `
.pke-fs{display:flex;flex-direction:column;gap:var(--space-4);min-width:0;margin:0;padding:0;border:0}
.pke-body{padding:var(--space-3) var(--space-4) var(--space-4)}
.pke-lim{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3) var(--space-4)}
.pke-lim__row{display:flex;align-items:flex-end;gap:var(--space-2)}
.pke-lim__row .pk-field{flex:1;min-width:0}
.pke-lim__row .pk-check{min-height:32px;align-items:center;white-space:nowrap;font-size:var(--text-xs)}
.pke-sets{display:flex;flex-direction:column}
.pke-set{display:flex;align-items:center;gap:var(--space-3);min-height:44px;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.pke-set:first-child{border-top:0}
.pke-set>span{flex:1;min-width:0;display:flex;flex-direction:column}
.pke-set small{font-size:var(--text-xs);color:var(--text-muted)}
.pke-set .gc-input{width:190px;flex:none}
.pke-mods{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2)}
.pke-radio{display:flex;flex-direction:column;gap:var(--space-2)}
.pke-side{position:sticky;top:var(--space-4);display:flex;flex-direction:column;gap:var(--space-4)}
.pke-pend{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3) 0;border-top:1px solid var(--border-subtle)}
.pke-pend:first-of-type{border-top:0;padding-top:0}
.pke-pend b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.pke-pend small{font-size:var(--text-xs);color:var(--text-muted)}
.pke-why{margin:0;font-size:var(--text-sm);color:var(--text-body)}
.pke-bar{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:var(--space-2)}
@media (max-width:1023px){.pke-side{position:static}}
@media (max-width:640px){
  .pke-lim,.pke-mods{grid-template-columns:minmax(0,1fr)}
  .pke-set{flex-wrap:wrap;padding:6px 0}
  .pke-set .gc-input{width:100%}
  .pke-bar{display:none}
  .pke-page{padding-bottom:var(--space-16)}
}
`;

function Diff({ rows, empty = 'No changes yet.' }) {
  if (!rows.length) return <p className="pk-small pk-muted">{empty}</p>;
  return (
    <ul className="pk-diff">
      {rows.map(([s, text], i) => <li key={i}><span className={'pk-diff__s ' + SIGN[s]} aria-hidden="true">{s}</span><span>{text}</span></li>)}
    </ul>
  );
}

export default function PackageEdit() {
  const router = useRouter();
  const { db, t, live } = usePlatform();
  const { data, live: pkLive } = usePackages();
  const ready = live && pkLive;
  const [q, setQ] = useState(null);        // { family, plan, draftId } from the address
  const [f, setF] = useState(null);        // the draft being edited
  const [note, setNote] = useState('');    // "Continuing your saved draft …"
  const [errors, setErrors] = useState({});
  const [reject, setReject] = useState(null);   // { id, comms, note, error }

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQ({ family: p.get('ladder') || '', plan: p.get('plan') || '', draftId: p.get('draft') || '' });
  }, []);

  const family = q && FAMS.includes(q.family) ? q.family : null;
  const plan = family && planIdsOf(family).includes(q.plan) ? q.plan : null;
  const comms = family === COMMS;
  const me = ready ? staff() : null;

  // start the form once the data has loaded: a given draft, your saved draft of this plan, or a new one from live
  useEffect(() => {
    if (!ready || !q || !family || f) return;
    const all = draftsOf(db, data, family);
    let d = q.draftId ? all.find((x) => x.id === q.draftId) : null;
    if (q.draftId && d && d.plan !== plan) d = null;
    if (!d && !q.draftId) {
      d = all.find((x) => x.plan === plan && (x.status === 'draft' || x.status === 'rejected') && x.by === staff().name) || null;
      if (d) setNote(`Continuing your ${d.status === 'rejected' ? 'rejected' : 'saved'} draft ${d.id} from ${ago(d.at, t)}.`);
    }
    const next = d ? clone(d) : comms ? commsDraftFor(data, plan, t) : draftFor(db, family, plan);
    const others = APPROVERS.filter((n) => n !== staff().name);
    if (next.approver === staff().name || !next.approver) next.approver = others[0];
    setF(next);
  }, [ready, q]);   // eslint-disable-line react-hooks/exhaustive-deps

  const back = family ? `/admin/packages${family === 'online' ? '' : '?tab=' + family}` : '/admin/packages';
  const title = family && plan ? `Edit ${planNameOf(family, plan)}` : 'Edit plan';

  if (!ready || !q || (family && plan && !f)) {
    return (
      <AdminShell active="packages" title={title}>
        <style dangerouslySetInnerHTML={{ __html: PK_CSS + CSS }} />
        <div className="ix-page"><div className="pk-skel pk-skel--sm" /><div className="ix-record"><div className="pk-skel" /><div className="pk-skel" /></div></div>
      </AdminShell>
    );
  }
  if (!family || !plan) {
    return (
      <AdminShell active="packages" title="Edit plan">
        <style dangerouslySetInnerHTML={{ __html: PK_CSS + CSS }} />
        <div className="ix-page">
          <RecordHeader back="/admin/packages" backLabel="Back to packages" title="Edit plan" />
          <section className="ix-card"><EmptyState icon="package-x" title="This plan doesn’t exist." actionLabel="Back to packages" onAction={() => router.push('/admin/packages')} /></section>
        </div>
      </AdminShell>
    );
  }

  const liveVer = liveOf(db, data, family, t);
  const base = liveVer.plans[plan];
  const editable = ['new', 'draft', 'rejected'].includes(f.status);
  const changes = comms ? commsDiff(base, f) : diff(base, f);
  const stats = planStats(db, t, family, plan);
  const pending = draftsOf(db, data, family).filter((d) => d.status === 'pending');
  const mayDecide = (d) => me.name !== d.by && (me.role === 'admin' || can(me, 'billing', 'approve'));
  const whyNot = (d) => (me.name === d.by ? 'You drafted this, so someone else approves it.' : 'Only Finance or an Admin can approve.');
  const limits = comms ? COMMS_LIMITS : LIMIT_KEYS;
  const [stLabel, stTone] = STATE[f.status] || STATE.draft;

  const set = (k) => (v) => { setF((old) => ({ ...old, [k]: v })); if (errors[k]) setErrors((e) => ({ ...e, [k]: null })); };
  const setNum = (k) => (e) => set(k)(toNum(e.target.value));
  const setLimit = (k, v) => setF((old) => ({ ...old, limits: { ...old.limits, [k]: v } }));
  const setRule = (id, v) => setF((old) => ({ ...old, sets: { ...old.sets, [id]: v } }));
  const toggleMod = (code) => setF((old) => ({ ...old, modules: old.modules.includes(code) ? old.modules.filter((c) => c !== code) : [...old.modules, code] }));

  const save = () => {
    const r = comms ? saveCommsDraft(f) : saveDraft(f);
    if (!r.ok) { toast(r.error); return; }
    setF(clone(r.draft));
    toast(`Draft ${r.draft.id} saved`);
  };
  const submit = () => {
    const errs = (comms ? commsDraftErrors : draftErrors)({ ...f, basePrice: base.price });
    const list = Object.entries(errs).filter(([, v]) => v);
    if (list.length) { setErrors(errs); toast(list[0][1]); return; }
    if (!changes.length) { toast('Nothing has changed yet.'); return; }
    const r = comms ? submitCommsDraft(f) : submitDraft(f);
    if (!r.ok) {
      if (r.errors) setErrors(r.errors);
      if (r.draft) setF(clone(r.draft));
      toast(r.error);
      return;
    }
    toast(`Sent to ${r.draft.approver} for approval`);
    router.push(back);
  };
  const approve = async (d) => {
    const when = d.liveFrom && d.liveFrom > t ? `It goes live on ${dmy(d.liveFrom)}.` : 'It goes live now.';
    if (!(await confirmDialog({ title: `Approve ${planNameOf(family, d.plan)} version ${d.v}?`, body: `${when} Stores keep the version they bought${d.existing === 'now' ? ', except that stores on this plan move to it now (a price cut)' : ''}.`, confirmLabel: 'Approve' }))) return;
    const r = comms ? decideCommsDraft(d.id, 'approve') : decideDraft(d.id, 'approve');
    if (!r.ok) { toast(r.error); return; }
    toast(`Version ${r.version} approved${r.draft.liveFrom > t ? ', live from ' + dmy(r.draft.liveFrom) : ' and live'}`);
    if (f.id === d.id) setF(clone(r.draft));
  };
  const doReject = () => {
    if (!reject.note.trim()) { setReject({ ...reject, error: 'Say why it is rejected.' }); return; }
    const r = comms ? decideCommsDraft(reject.id, 'reject', reject.note) : decideDraft(reject.id, 'reject', reject.note);
    if (!r.ok) { setReject({ ...reject, error: r.error }); return; }
    toast('Draft rejected; the person who drafted it can change it and send it again');
    if (f.id === reject.id) setF(clone(r.draft));
    setReject(null);
  };

  const err = (k) => errors[k] || null;
  const yearlyHint = f.price ? `Two months free: ${money(f.price * 10)}` : null;

  return (
    <AdminShell active="packages" title={title}>
      <style dangerouslySetInnerHTML={{ __html: PK_CSS + CSS }} />
      <div className="ix-page pke-page">
        <RecordHeader back={back} backLabel="Back to packages" title={title}
          about="A plan change is a draft of the next version. A second person — Finance or an Admin, never the person who drafted it — approves it, and it goes live on its date. Stores keep the version they bought unless the change is a price cut moved to them now."
          badges={<StatusBadge tone={stTone}>{f.status === 'approved' ? `Approved · version ${f.v}` : stLabel}</StatusBadge>}
          meta={<>{familyLabel(family)} · live version {liveVer.v} · {money(base.price)} a month{f.id ? <> · <span className="pk-data">{f.id}</span></> : null}</>}
          secondary={editable ? [{ label: 'Save draft', icon: 'save', onClick: save }] : []}
          primary={editable ? { label: 'Submit for approval', icon: 'send', onClick: submit } : null} />

        {note && editable ? <div className="pk-banner" role="status"><Icon name="file-pen" width="16" height="16" aria-hidden="true" /><p>{note}</p></div> : null}
        {f.status === 'pending' ? <div className="pk-banner pk-banner--warn" role="status"><Icon name="clock" width="16" height="16" aria-hidden="true" /><p>Waiting for {f.approver} since {ago(f.sentAt, t)}. It can’t be changed while it waits.</p></div> : null}
        {f.status === 'rejected' && f.decisionNote ? <div className="pk-banner pk-banner--err" role="status"><Icon name="circle-x" width="16" height="16" aria-hidden="true" /><p>Rejected by {f.decidedBy}: {f.decisionNote}</p></div> : null}
        {f.status === 'approved' ? <div className="pk-banner" role="status"><Icon name="circle-check" width="16" height="16" aria-hidden="true" /><p>Approved by {f.decidedBy} as version {f.v}, {f.liveFrom > t ? 'live from ' + dmy(f.liveFrom) : 'live since ' + dmy(f.liveFrom)}.</p></div> : null}

        <div className="ix-record">
          <fieldset className="pke-fs ix-main" disabled={!editable}>
            <legend className="sr-only">{title}</legend>
            <section className="ix-card" aria-labelledby="pke-h-plan">
              <div className="ix-card__head"><h2 id="pke-h-plan">Plan</h2></div>
              <div className="pke-body pk-two">
                <Field id="pke-name" label="Name" error={err('name')}>
                  <input {...ctl('pke-name', err('name'))} value={f.name} onChange={(e) => set('name')(e.target.value)} />
                </Field>
                <Field id="pke-vis" label="Shown on">
                  <select {...ctl('pke-vis', null, true)} value={f.visibility} onChange={(e) => set('visibility')(e.target.value)}>
                    <option value="Public">Website and sign-up</option>
                    <option value="Hidden">Sales team only</option>
                  </select>
                </Field>
                <Field id="pke-tag" label="One line about it" wide>
                  <input {...ctl('pke-tag')} value={f.tagline} onChange={(e) => set('tagline')(e.target.value)} />
                </Field>
              </div>
            </section>

            <section className="ix-card" aria-labelledby="pke-h-price">
              <div className="ix-card__head"><h2 id="pke-h-price">Price</h2></div>
              <div className="pke-body pk-two">
                <Field id="pke-price" label="Monthly (৳)" error={err('price')}>
                  <input {...ctl('pke-price', err('price'))} inputMode="numeric" value={f.price || ''} onChange={setNum('price')} />
                </Field>
                <Field id="pke-yearly" label="Yearly (৳)" error={err('yearly')} hint={yearlyHint}>
                  <input {...ctl('pke-yearly', err('yearly'))} inputMode="numeric" value={f.yearly || ''} onChange={setNum('yearly')} />
                </Field>
                <Field id="pke-setup" label="Setup fee (৳)">
                  <input {...ctl('pke-setup')} inputMode="numeric" value={f.setup || ''} placeholder="0" onChange={setNum('setup')} />
                </Field>
                <Field id="pke-trial" label="Trial days on this plan">
                  <input {...ctl('pke-trial')} inputMode="numeric" value={f.trialDays || ''} onChange={setNum('trialDays')} />
                </Field>
              </div>
            </section>

            <section className="ix-card" aria-labelledby="pke-h-lim">
              <div className="ix-card__head"><h2 id="pke-h-lim">Limits</h2></div>
              <div className="pke-body pk-form">
                <div className="pke-lim">
                  {limits.map(([k, label, unit]) => {
                    const unl = (f.limits[k] || 0) >= UNLIMITED;
                    return (
                      <div key={k} className="pke-lim__row">
                        <Field id={'pke-l-' + k} label={`${label}${unit && !['orders', 'products', 'seats', 'couriers', 'pages', 'channels', 'contacts'].includes(unit) ? ' (' + unit + ')' : ''}`}>
                          <input {...ctl('pke-l-' + k)} inputMode="numeric" disabled={unl} value={unl ? 'Unlimited' : (f.limits[k] ?? '')} onChange={(e) => setLimit(k, toNum(e.target.value))} />
                        </Field>
                        <label className="pk-check">
                          <input type="checkbox" className="gc-check" checked={unl} onChange={(e) => setLimit(k, e.target.checked ? UNLIMITED : (base.limits[k] >= UNLIMITED ? 0 : base.limits[k]))} />
                          <span>Unlimited</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
                {!comms ? (
                  <div className="pk-two">
                    <Field id="pke-atlimit" label="At the limit">
                      <select {...ctl('pke-atlimit', null, true)} value={f.atLimit} onChange={(e) => set('atLimit')(e.target.value)}>
                        {AT_LIMIT.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                      </select>
                    </Field>
                    <Field id="pke-warn" label="Warn the owner at (%)">
                      <input {...ctl('pke-warn')} inputMode="numeric" value={f.warnAt || ''} onChange={setNum('warnAt')} />
                    </Field>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="ix-card" aria-labelledby="pke-h-mods">
              <div className="ix-card__head">
                <h2 id="pke-h-mods">{comms ? 'Modules included' : 'Module sets'}</h2>
                {!comms ? <InfoTip text="Included: on for every store on the plan. Locked · upgrade: shown with an upgrade button. Add-on: sold on its own. Hidden: not offered on this plan." /> : null}
              </div>
              <div className="pke-body">
                {comms ? (
                  <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }} aria-describedby={err('modules') ? 'pke-mods-err' : undefined}>
                    <legend className="sr-only">Modules included</legend>
                    <div className="pke-mods">
                      {COMMS_MODULES.map((c) => (
                        <label key={c} className="pk-check">
                          <input type="checkbox" className="gc-check" checked={f.modules.includes(c)} onChange={() => toggleMod(c)} />
                          <span>{(moduleBy(c) || {}).name}<small>{c}</small></span>
                        </label>
                      ))}
                    </div>
                    {err('modules') ? <p className="pk-err" id="pke-mods-err" role="alert">{err('modules')}</p> : null}
                  </fieldset>
                ) : (
                  <div className="pke-sets">
                    {SETS.filter((s) => !s.ladder || s.ladder === family).map((s) => {
                      const fixed = s.always || s.ladder === family;
                      return (
                        <div key={s.id} className="pke-set">
                          <span><label htmlFor={'pke-s-' + s.id}>{s.label}</label><small>{s.sub}</small></span>
                          {fixed ? <span style={{ flex: 'none' }} className="pk-muted pk-small">Always included</span> : (
                            <select id={'pke-s-' + s.id} className="gc-input gc-select" value={f.sets[s.id] || (s.id === 'service' ? 'Add-on' : 'Hidden')} onChange={(e) => setRule(s.id, e.target.value)}>
                              {SET_STATES.map((x) => <option key={x} value={x}>{x}</option>)}
                            </select>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            <section className="ix-card" aria-labelledby="pke-h-when">
              <div className="ix-card__head"><h2 id="pke-h-when">When and who</h2></div>
              <div className="pke-body pk-form">
                <div className="pk-two">
                  <Field id="pke-from" label="Goes live" hint="Empty: as soon as it is approved" optional>
                    <input {...ctl('pke-from')} type="date" min={toDateInput(t)} value={toDateInput(f.liveFrom)} onChange={(e) => set('liveFrom')(fromDateInput(e.target.value))} />
                  </Field>
                  <Field id="pke-appr" label="Second approver">
                    <select {...ctl('pke-appr', null, true)} value={f.approver} onChange={(e) => set('approver')(e.target.value)}>
                      {APPROVERS.filter((n) => n !== (f.by || me.name)).map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </Field>
                </div>
                <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }} aria-describedby={err('existing') ? 'pke-ex-err' : undefined}>
                  <legend className="gc-label">Stores already on {base.name}</legend>
                  <div className="pke-radio">
                    <label className="pk-check">
                      <input type="radio" name="pke-existing" className="gc-check gc-check--radio" checked={f.existing !== 'now'} onChange={() => set('existing')('keep')} />
                      <span>Keep their version<small>New stores and plan changes get the new version.</small></span>
                    </label>
                    <label className="pk-check">
                      <input type="radio" name="pke-existing" className="gc-check gc-check--radio" checked={f.existing === 'now'} onChange={() => set('existing')('now')} />
                      <span>Move them when it goes live<small>Only for price cuts.</small></span>
                    </label>
                  </div>
                  {err('existing') ? <p className="pk-err" id="pke-ex-err" role="alert">{err('existing')}</p> : null}
                </fieldset>
                <Field id="pke-why" label="Why this change" error={err('why')}>
                  <textarea {...ctl('pke-why', err('why'))} rows={3} value={f.why} onChange={(e) => set('why')(e.target.value)} placeholder="What it changes for merchants, and why now" />
                </Field>
              </div>
            </section>

            {editable ? (
              <div className="pke-bar">
                <Link href={back} className="gc-btn gc-btn--neutral">Cancel</Link>
                <button type="button" className="gc-btn gc-btn--soft" onClick={save}>Save draft</button>
                <button type="button" className="gc-btn gc-btn--solid" onClick={submit}>Submit for approval</button>
              </div>
            ) : null}
          </fieldset>

          <aside className="ix-side">
            <div className="pke-side">
              <section className="ix-card" aria-labelledby="pke-h-diff">
                <div className="ix-card__head"><h2 id="pke-h-diff">{f.status === 'approved' ? `Changed in version ${f.v}` : `Changes against version ${liveVer.v}`}</h2></div>
                <div className="pke-body pk-form">
                  <Diff rows={changes} />
                  {changes.length ? <p className="pk-small pk-muted">{f.liveFrom ? 'Live from ' + dmy(f.liveFrom) : 'Live when approved'} · {f.existing === 'now' ? 'stores move to it' : 'stores keep their version'}</p> : null}
                </div>
              </section>

              <section className="ix-card" aria-labelledby="pke-h-stores">
                <div className="ix-card__head"><h2 id="pke-h-stores">Stores on {base.name}</h2></div>
                <div className="pke-body">
                  {comms ? <p className="pk-small pk-muted">No store is on a Connect plan yet.</p> : (
                    <KV rows={[
                      ['Stores', String(stats.stores)],
                      ['Paying · on trial', `${stats.paying} · ${stats.trial}`],
                      stats.older ? ['On older versions', String(stats.older)] : null,
                      ['Plan revenue a month', money(stats.mrr)],
                    ]} />
                  )}
                </div>
              </section>

              <section className="ix-card" aria-labelledby="pke-h-pend">
                <div className="ix-card__head"><h2 id="pke-h-pend">Waiting for approval{pending.length ? ' · ' + pending.length : ''}</h2></div>
                <div className="pke-body pk-form">
                  <p className="pk-rule">A change needs a second person: Finance or an Admin who did not draft it. You are {me.name} ({me.title}).</p>
                  {pending.length ? pending.map((d) => {
                    const dBase = liveVer.plans[d.plan];
                    const rows = comms ? commsDiff(dBase, d) : diff(dBase, d);
                    return (
                      <div key={d.id} className="pke-pend">
                        <b>{planNameOf(family, d.plan)} · version {d.v} <span className="pk-muted pk-data">{d.id}</span></b>
                        <small>By {d.by}, sent {ago(d.sentAt, t)} · for {d.approver}{d.liveFrom ? ' · live from ' + dmy(d.liveFrom) : ''}</small>
                        <Diff rows={rows} />
                        {d.why ? <p className="pke-why">“{d.why}”</p> : null}
                        {mayDecide(d) ? (
                          <div className="pk-actions">
                            <button type="button" className="ix-btn ix-btn--sm" onClick={() => setReject({ id: d.id, note: '', error: null })}>Reject</button>
                            <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => approve(d)}>Approve</button>
                          </div>
                        ) : <p className="pk-small pk-muted"><Icon name="lock" width="12" height="12" aria-hidden="true" /> {whyNot(d)}</p>}
                      </div>
                    );
                  }) : <p className="pk-small pk-muted">Nothing is waiting on {familyLabel(family)}.</p>}
                  {pending.length > 1 ? <p className="pk-small pk-muted">{plural(pending.length, 'draft')} on this package.</p> : null}
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>

      {editable ? (
        <PhoneActionBar note={changes.length ? plural(changes.length, 'change') : null} label="Submit for approval">
          <button type="button" className="gc-btn gc-btn--solid" onClick={submit}>Submit for approval</button>
        </PhoneActionBar>
      ) : null}

      <Dialog open={!!reject} title="Reject this change" onClose={() => setReject(null)} width={480}
        footer={<>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setReject(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--solid gc-btn--error" onClick={doReject}>Reject</button>
        </>}>
        {reject ? (
          <Field id="pke-rej" label="Why" error={reject.error}>
            <textarea {...ctl('pke-rej', reject.error)} data-autofocus rows={3} value={reject.note} onChange={(e) => setReject({ ...reject, note: e.target.value, error: null })} placeholder="What should change before it is sent again" />
          </Field>
        ) : null}
      </Dialog>
    </AdminShell>
  );
}
