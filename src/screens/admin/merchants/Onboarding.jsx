'use client';
// Onboarding (/admin/onboarding) — where the onboarding team gets new stores live and through their trial.
// Three views: Setting up (provisioning runs in progress, a 7-step bar from STAGES that moves with the clock),
// Stopped (runs that failed: the step, the error, Retry with an optional new address) and Trials (stores in their
// first 14 days: day N of the trial, setup checklist, last sign-in, onboarder; ending in 3 days or less is marked).
// A row opens a side panel: summary, the run's steps or the setup checklist, the sessions log and the actions
// (assign onboarder, log a session, extend trial, send sign-in link, retry, open the merchant profile).
// Data: lib/admin/merchants › onboardingRows, lib/platform (views › runState / provisioning, merchant › merchantView
// onboarding, shops, billing). Worked out after the saved data loads, so the UTC prerender shows the outline only.

import React, { useEffect, useReducer, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, Pager, Menu, KV } from '@/components/ui/IndexKit';
import { Sheet, EmptyState, StatusBadge } from '@/components/ui';
import { onboardingRows, assignManager, ownerOf } from '@/lib/admin/merchants';
import { retryRun, subdomainFree, logSession, sendReset } from '@/lib/platform/shops';
import { extendTrial, subOf, subState } from '@/lib/platform/billing';
import { provisioning, runState } from '@/lib/platform/views';
import { merchantView } from '@/lib/platform/merchant';
import { commit } from '@/lib/platform/store';
import { STAGES, ONBOARDERS, PLAN_NAME, ladderLabel } from '@/lib/platform/catalogue';
import { DAY, dur, dmy, hm, ago, lastSeen, startOfDay } from '@/lib/platform/util';
import { AdminShell, usePlatform } from '../AdminShell';

const CSS = `
.onb-skel{height:280px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-card),var(--surface-subtle),var(--surface-card));background-size:200% 100%;animation:onb-sk 1.4s ease infinite}
.onb-skel--strip{height:72px}
@keyframes onb-sk{from{background-position:100% 0}to{background-position:-100% 0}}
.onb-err{display:flex;flex-direction:column;align-items:center;gap:var(--space-3);padding:var(--space-8) var(--space-4);text-align:center;font-size:var(--text-sm);color:var(--text-body)}
.onb-name{padding:0;border:0;background:none;font:inherit;font-weight:var(--weight-semibold);color:var(--text-heading);text-align:left;cursor:pointer}
.onb-name:hover{color:var(--primary);text-decoration:underline}
.onb-name:focus-visible{outline:2px solid var(--primary);outline-offset:2px;border-radius:var(--radius-sm)}
.onb-id{margin-left:6px;font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.onb-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.onb-steps{display:grid;flex:none;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px;width:112px}
.onb-steps i{height:6px;border-radius:var(--radius-full);background:var(--border-subtle)}
.onb-steps i.is-done{background:var(--primary)}
.onb-steps i.is-run{background:var(--primary);opacity:.45;animation:onb-pulse 1s ease-in-out infinite alternate}
.onb-steps i.is-fail{background:var(--error)}
@keyframes onb-pulse{from{opacity:.25}to{opacity:.7}}
.onb-prog{display:flex;align-items:center;gap:var(--space-3);min-width:0}
.onb-prog>span{font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.onb-meter{display:inline-flex;align-items:center;gap:var(--space-2)}
.onb-meter__track{width:56px;height:6px;border-radius:var(--radius-full);background:var(--border-subtle);overflow:hidden}
.onb-meter__track span{display:block;height:100%;border-radius:var(--radius-full);background:var(--primary)}
.onb-problem{display:block;max-width:380px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ix-table tr.onb-soon td:first-child{box-shadow:inset 3px 0 0 var(--warning)}
.ix-table .onb-act{width:1%;text-align:right}
button.ix-pitem{width:100%;border:0;border-bottom:1px solid var(--border-subtle);background:none;font:inherit;text-align:left;cursor:pointer}
.ix-plist>li:last-child>button.ix-pitem{border-bottom:0}
.onb-chip{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 6px 0 10px;border:1px solid var(--primary);border-radius:var(--radius-full);background:var(--fill-primary-soft);font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--primary);cursor:pointer}
.onb-badges{display:flex;flex-wrap:wrap;gap:6px}
.onb-sec{display:flex;flex-direction:column;gap:var(--space-2)}
.onb-sec h3{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);margin:0;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-body)}
.onb-sec h3 small{font-family:var(--font-data);font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.onb-list{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.onb-list li{display:flex;align-items:flex-start;gap:var(--space-2);padding:6px 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-body)}
.onb-list li:first-child{border-top:0}
.onb-list li>svg{flex:none;margin-top:2px;color:var(--text-muted)}
.onb-list li>span{flex:1;min-width:0}
.onb-list li>em{flex:none;font-family:var(--font-data);font-size:var(--text-xs);font-style:normal;color:var(--text-muted)}
.onb-list b{display:block;font-weight:var(--weight-medium);color:var(--text-heading)}
.onb-list small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.onb-list p{margin:2px 0 0;font-size:var(--text-sm);color:var(--text-body)}
.onb-list .is-done>svg{color:var(--text-success)}
.onb-list .is-run>svg{color:var(--primary)}
.onb-list .is-stuck>svg{color:var(--text-warning)}
.onb-list .is-fail>svg{color:var(--text-danger)}
.onb-alert{display:flex;gap:var(--space-2);padding:var(--space-3);border-radius:var(--radius-lg);background:var(--fill-error-soft);font-size:var(--text-sm);color:var(--text-danger)}
.onb-alert>svg{flex:none;margin-top:2px}
.onb-form{display:flex;flex-direction:column;gap:var(--space-3)}
.onb-two{display:grid;grid-template-columns:minmax(0,1fr) 112px;gap:var(--space-3)}
.onb-form .gc-label{margin-bottom:6px}
.onb-form textarea.gc-input{height:auto;min-height:88px;padding:var(--space-2) var(--space-3);resize:vertical;line-height:1.5}
.onb-addr{display:flex;align-items:center;gap:var(--space-2)}
.onb-addr>span{font-size:var(--text-sm);color:var(--text-muted);white-space:nowrap}
.onb-hint{margin:6px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.onb-hint.is-ok{color:var(--text-success)}
.onb-hint.is-bad{color:var(--text-danger)}
.onb-kvsel{max-width:100%}
.onb-empty{padding:var(--space-2) 0;font-size:var(--text-sm);color:var(--text-muted)}
@media (max-width:640px){.onb-two{grid-template-columns:minmax(0,1fr)}}
@media (prefers-reduced-motion:reduce){.onb-skel,.onb-steps i.is-run{animation:none}}
`;

const PAGE = 20;
const TABS = [['setup', 'Setting up'], ['stopped', 'Stopped'], ['trials', 'Trials']];
const KINDS = ['Phone call', 'Video call', 'Visit', 'Chat'];
const ONLY = { quiet: 'No login 3+ days', ending: 'Trial ends in 3 days', unassigned: 'No onboarder' };
const stageName = (key) => (STAGES.find((s) => s[0] === key) || [key, key])[1];
const isAddressProblem = (err) => /subdomain|address|domain name|reserved|taken/i.test(err || '');

/** Everything the page shows, from the platform data at time t. */
function build(db, t) {
  const setup = [], stopped = [], trials = [];
  for (const r of onboardingRows(db, t)) {
    const shop = db.shops.find((s) => s.id === r.id);
    const sub = subOf(db, r.id);
    const owner = ownerOf(shop);
    const base = {
      id: r.id, name: r.name, owner: owner.name, phone: owner.phone, address: `${shop.sub}.gridcommerce.com.bd`,
      packageName: `${ladderLabel(sub.ladder)} · ${PLAN_NAME[sub.plan]}`, signedUp: shop.createdAt, by: shop.by || null, am: shop.am || null,
      run: r.run || null,
    };
    if (r.trialLeft == null) {
      const rs = r.run ? runState(r.run, t) : null;
      const at = rs ? rs.stages.findIndex((s) => s.st === 'running' || s.st === 'failed') : -1;
      const done = rs ? rs.stages.filter((s) => s.st === 'done').length : 0;
      const row = { ...base, kind: rs && rs.status === 'failed' ? 'stopped' : 'setup', rs, done, current: at >= 0 ? rs.stages[at].label : rs && rs.status === 'live' ? 'Going live' : 'Waiting to start', error: r.error || '' };
      if (row.kind === 'stopped') {
        const fi = STAGES.findIndex((s) => s[0] === r.run.failedAt);
        row.stoppedAt = r.run.startedAt + r.run.stages.slice(0, fi + 1).reduce((s, x) => s + x.ms, 0);
        row.stage = stageName(r.run.failedAt);
        stopped.push(row);
      } else setup.push(row);
    } else {
      const st = subState(db, r.id, t);
      const steps = merchantView(db, t, r.id).onboarding.steps;
      const checked = steps.filter((s) => /d-done/.test(s.cls)).length;
      trials.push({
        ...base, kind: 'trials', day: st.days, of: sub.trialDays, left: st.left, endsAt: startOfDay(sub.trialStart) + sub.trialDays * DAY,
        checked, total: steps.length, stuck: steps.some((s) => /d-stuck/.test(s.cls)), lastActive: r.lastActive,
      });
    }
  }
  setup.sort((a, b) => b.signedUp - a.signedUp);
  stopped.sort((a, b) => b.stoppedAt - a.stoppedAt);
  trials.sort((a, b) => a.left - b.left || a.name.localeCompare(b.name));
  const prov = provisioning(db, t);
  return {
    lists: { setup, stopped, trials },
    figs: {
      median: prov.kpis.median, success: prov.kpis.success, unassigned: trials.filter((r) => !r.am).length,
      quiet: trials.filter((r) => r.lastActive >= 3).length, ending: trials.filter((r) => r.left <= 3).length,
    },
  };
}

const leftText = (n) => (n <= 1 ? 'Last day' : `${n} days left`);

function Steps({ rs }) {
  return (
    <span className="onb-steps" aria-hidden="true">
      {(rs ? rs.stages : STAGES.map(() => ({ st: 'todo' }))).map((s, i) => (
        <i key={i} className={s.st === 'done' ? 'is-done' : s.st === 'running' ? 'is-run' : s.st === 'failed' ? 'is-fail' : ''} />
      ))}
    </span>
  );
}

function Meter({ value, total }) {
  return (
    <span className="onb-meter" aria-label={`${value} of ${total} setup steps done`}>
      <span className="onb-meter__track" aria-hidden="true"><span style={{ width: Math.round((value / Math.max(1, total)) * 100) + '%' }} /></span>
      <span className="onb-fig">{value}/{total}</span>
    </span>
  );
}

// ---- the side panel --------------------------------------------------------------------------------------------
function StorePanel({ row, db, t, onClose }) {
  const [form, setForm] = useState(null);           // null · 'session'
  const [kind, setKind] = useState(KINDS[0]);
  const [minutes, setMinutes] = useState('');
  const [note, setNote] = useState('');
  const [newSub, setNewSub] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { setForm(null); setNote(''); setMinutes(''); setNewSub(''); setError(''); }, [row.id]);

  const ob = merchantView(db, t, row.id).onboarding;
  const profile = `/admin/merchant?id=${row.id}&tab=overview`;
  const onboarders = row.am && !ONBOARDERS.includes(row.am) ? [...ONBOARDERS, row.am] : ONBOARDERS;

  const assign = (name) => {
    const res = assignManager([row.id], name || null);
    if (res && res.ok) toast(name ? `${name} is onboarding ${row.name}` : `${row.name} has no onboarder now`);
  };
  const signIn = () => {
    const res = sendReset(row.id);
    toast(res && res.phone ? `Sign-in link sent to ${res.phone}` : 'Sign-in link sent');
  };
  const extend = async (days) => {
    const to = row.endsAt + days * DAY;
    const ok = await confirmDialog({ title: `Extend the trial by ${days} days?`, body: `${row.name}'s trial ends on ${dmy(to)} instead of ${dmy(row.endsAt)}. The first bill moves with it.`, confirmLabel: 'Extend trial' });
    if (!ok) return;
    const res = extendTrial(row.id, days);
    if (res.ok) toast(`Trial extended to ${dmy(to)}`); else toast(res.error, { tone: 'error' });
  };
  const saveSession = () => {
    const res = logSession(row.id, { kind, minutes: Number(minutes) || 0, note });
    if (!res.ok) { setError(res.error); return; }
    toast('Session logged');
    setForm(null); setNote(''); setMinutes(''); setError('');
  };
  const addressProblem = row.kind === 'stopped' && isAddressProblem(row.error);
  const check = newSub.trim() ? subdomainFree(db, newSub) : null;
  const retry = () => {
    const res = retryRun(row.run.id, newSub.trim() || undefined);
    if (!res.ok) { setError(res.error); return; }
    toast(`Setup restarted from ${row.stage}`);
    setNewSub(''); setError('');
  };

  const more = [
    ...(row.kind === 'trials' ? [{ label: 'Extend trial by 7 days', icon: 'calendar-plus', onClick: () => extend(7) }, { label: 'Extend trial by 14 days', icon: 'calendar-plus', onClick: () => extend(14) }] : []),
    ...(row.kind !== 'trials' ? [{ label: 'Log a session', icon: 'notebook-pen', onClick: () => { setForm('session'); setError(''); } }] : []),
    { label: 'Send sign-in link', icon: 'send', onClick: signIn },
    ...(row.kind !== 'setup' ? [{ label: 'Open merchant profile', icon: 'external-link', href: profile }] : []),
  ];

  let footer;
  if (form === 'session') {
    footer = (<>
      <button type="button" className="ix-btn" onClick={() => { setForm(null); setError(''); }}>Cancel</button>
      <button type="button" className="ix-btn ix-btn--primary" onClick={saveSession}>Save session</button>
    </>);
  } else {
    const primary = row.kind === 'stopped'
      ? <button type="button" className="ix-btn ix-btn--primary" onClick={retry} disabled={!!(check && !check.ok)}><Icon name="rotate-ccw" width="16" height="16" aria-hidden="true" /><span>Retry setup</span></button>
      : row.kind === 'trials'
        ? <button type="button" className="ix-btn ix-btn--primary" onClick={() => { setForm('session'); setError(''); }}><Icon name="notebook-pen" width="16" height="16" aria-hidden="true" /><span>Log a session</span></button>
        : <Link href={profile} className="ix-btn ix-btn--primary"><Icon name="external-link" width="16" height="16" aria-hidden="true" /><span>Open merchant profile</span></Link>;
    footer = (<><Menu label="More" items={more} />{primary}</>);
  }

  const badge = row.kind === 'stopped' ? <StatusBadge tone="error">Stopped at {row.stage}</StatusBadge>
    : row.kind === 'setup' ? <StatusBadge tone="primary" icon="loader">{row.current}</StatusBadge>
      : <StatusBadge tone={row.left <= 3 ? 'warning' : 'success'}>Trial · day {row.day} of {row.of}</StatusBadge>;

  return (
    <Sheet open title={row.name} label={`${row.name}, onboarding`} onClose={onClose} footer={footer}>
      <div className="onb-badges">
        {badge}
        {row.kind === 'trials' && row.left <= 3 ? <StatusBadge tone="warning" icon="clock">{leftText(row.left)}</StatusBadge> : null}
        {row.kind === 'trials' && row.lastActive >= 3 ? <StatusBadge tone="neutral" icon="moon">No login for {row.lastActive} days</StatusBadge> : null}
      </div>

      {form === 'session' ? (
        <section className="onb-sec" aria-label="Log a session">
          <h3>Log a session</h3>
          <div className="onb-form">
            <div className="onb-two">
              <div>
                <label className="gc-label" htmlFor="onb-kind">Kind</label>
                <select id="onb-kind" className="gc-input gc-select" value={kind} onChange={(e) => setKind(e.target.value)} data-autofocus>
                  {KINDS.map((k) => <option key={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label className="gc-label" htmlFor="onb-min">Minutes</label>
                <input id="onb-min" className="gc-input onb-fig" type="number" min="0" step="5" inputMode="numeric" placeholder="30" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="gc-label" htmlFor="onb-note">What was done</label>
              <textarea id="onb-note" className={'gc-input' + (error ? ' gc-input--error' : '')} value={note} onChange={(e) => { setNote(e.target.value); setError(''); }} placeholder="Imported products, set up bKash and Steadfast" aria-invalid={!!error} aria-describedby={error ? 'onb-note-err' : undefined} />
              {error ? <p id="onb-note-err" className="onb-hint is-bad" role="alert">{error}</p> : null}
            </div>
          </div>
        </section>
      ) : null}

      {row.kind === 'stopped' ? (
        <section className="onb-sec" aria-label="Why it stopped">
          <div className="onb-alert" role="alert"><Icon name="circle-alert" width="16" height="16" aria-hidden="true" /><span>{row.error || 'The setup stopped.'}</span></div>
          {form !== 'session' ? (
            <div className="onb-form">
              <div>
                <label className="gc-label" htmlFor="onb-sub">{addressProblem ? 'New address' : 'New address (optional)'}</label>
                <div className="onb-addr">
                  <input id="onb-sub" className={'gc-input onb-fig' + (check && !check.ok ? ' gc-input--error' : '')} value={newSub} onChange={(e) => { setNewSub(e.target.value.toLowerCase().replace(/\s+/g, '')); setError(''); }}
                    placeholder={row.address.split('.')[0] + '-bd'} autoComplete="off" spellCheck={false} aria-describedby="onb-sub-hint" />
                  <span>.gridcommerce.com.bd</span>
                </div>
                <p id="onb-sub-hint" className={'onb-hint' + (check ? (check.ok ? ' is-ok' : ' is-bad') : '')} aria-live="polite">
                  {check ? (check.ok ? 'Free to use' : check.why) : addressProblem ? 'Agree a new name with the owner, or leave empty to try the same address again.' : 'Leave empty to keep ' + row.address + '.'}
                </p>
              </div>
              {error ? <p className="onb-hint is-bad" role="alert">{error}</p> : null}
            </div>
          ) : null}
        </section>
      ) : null}

      <KV rows={[
        ['Owner', row.phone ? `${row.owner} · ${row.phone}` : row.owner],
        ['Package', row.packageName],
        ['Address', <span key="a" className="onb-fig">{row.address}</span>],
        ['Signed up', `${dmy(row.signedUp)} ${hm(row.signedUp)}${row.by ? ' · by ' + row.by : ''}`],
        row.kind === 'trials' ? ['Trial ends', `${dmy(row.endsAt)} · ${leftText(row.left).toLowerCase()}`] : null,
        row.kind === 'trials' ? ['Last active', lastSeen(row.lastActive)] : null,
        row.kind === 'setup' && row.rs ? ['Time so far', <span key="t" className="onb-fig">{dur(row.rs.elapsed)}</span>] : null,
        ['Onboarder', (
          <select key="o" className="ix-pick onb-kvsel" aria-label="Onboarder" value={row.am || ''} onChange={(e) => assign(e.target.value)}>
            <option value="">Unassigned</option>
            {onboarders.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        )],
      ]} />

      {row.kind === 'trials' ? (
        <section className="onb-sec" aria-label="Setup checklist">
          <h3>Setup checklist<small>{row.checked} of {row.total}</small></h3>
          <ul className="onb-list">
            {ob.steps.map((s) => {
              const st = /d-done/.test(s.cls) ? 'done' : /d-stuck/.test(s.cls) ? 'stuck' : 'todo';
              return (
                <li key={s.key} className={'is-' + st}>
                  <Icon name={st === 'done' ? 'circle-check' : st === 'stuck' ? 'circle-alert' : 'circle'} width="16" height="16" aria-hidden="true" />
                  <span><b>{s.label}</b><small>{s.who}</small></span>
                  <em>{st === 'done' ? s.date : ''}</em>
                </li>
              );
            })}
          </ul>
        </section>
      ) : row.rs ? (
        <section className="onb-sec" aria-label="Setup steps">
          <h3>Setup steps<small>{row.done} of {STAGES.length}</small></h3>
          <ul className="onb-list">
            {row.rs.stages.map((s) => (
              <li key={s.key} className={'is-' + (s.st === 'running' ? 'run' : s.st === 'failed' ? 'fail' : s.st)}>
                <Icon name={s.st === 'done' ? 'circle-check' : s.st === 'running' ? 'loader' : s.st === 'failed' ? 'circle-x' : 'circle'} width="16" height="16" aria-hidden="true" />
                <span><b>{s.label}</b></span>
                <em>{s.st === 'done' ? dur(s.ms) : s.st === 'running' ? 'Running' : s.st === 'failed' ? 'Stopped here' : 'Waiting'}</em>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="onb-sec" aria-label="Sessions">
        <h3>Sessions<small>{ob.sessions.length}</small></h3>
        {ob.sessions.length ? (
          <ul className="onb-list">
            {ob.sessions.map((s) => (
              <li key={s.key}>
                <Icon name={/visit|person/i.test(s.title) ? 'map-pin' : /video/i.test(s.title) ? 'video' : /chat/i.test(s.title) ? 'message-square' : 'phone'} width="16" height="16" aria-hidden="true" />
                <span><b>{s.title}</b><small>{s.when}</small>{s.text ? <p>{s.text}</p> : null}</span>
              </li>
            ))}
          </ul>
        ) : <p className="onb-empty">No sessions yet.</p>}
      </section>
    </Sheet>
  );
}

// ---- the page -----------------------------------------------------------------------------------------------------
export default function Onboarding() {
  const router = useRouter();
  const { db, t, live } = usePlatform();
  const [, redraw] = useReducer((x) => x + 1, 0);
  const [tab, setTab] = useState(null);
  const [only, setOnly] = useState(null);           // null · 'quiet' · 'ending' · 'unassigned' (Trials)
  const [find, setFind] = useState(false);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(null);           // store id in the side panel
  const [retryN, setRetryN] = useState(0);

  // ?tab=setup|stopped|trials and ?id=<store> open a view or a store
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const want = p.get('tab');
      if (TABS.some(([k]) => k === want)) setTab(want);
      if (p.get('id')) setOpen(p.get('id'));
    } catch { /* ignore */ }
  }, []);

  let data = null, failed = null;
  if (live) {
    try { data = build(db, t); } catch (e) { failed = { e, retryN }; }
  }
  const lists = data ? data.lists : { setup: [], stopped: [], trials: [] };
  const running = lists.setup.filter((r) => r.rs && r.rs.status === 'running').length;
  const finished = lists.setup.filter((r) => r.rs && r.rs.status === 'live').map((r) => r.id).join(',');

  // runs move every second while one is in progress; a finished run goes live at once (the billing engine's tick)
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(redraw, 1000);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => { if (finished) commit(() => null); }, [finished]);

  const auto = lists.stopped.length ? 'stopped' : lists.setup.length ? 'setup' : 'trials';
  const view = tab || auto;
  const s = q.trim().toLowerCase();
  let rows = lists[view].filter((r) => !s || (r.name + ' ' + r.id + ' ' + (r.owner || '') + ' ' + (r.am || '')).toLowerCase().includes(s));
  if (view === 'trials' && only === 'quiet') rows = rows.filter((r) => r.lastActive >= 3);
  if (view === 'trials' && only === 'ending') rows = rows.filter((r) => r.left <= 3);
  if (view === 'trials' && only === 'unassigned') rows = rows.filter((r) => !r.am);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const pg = Math.min(page, pages - 1);
  const shown = rows.slice(pg * PAGE, pg * PAGE + PAGE);
  const go = (k) => { setTab(k); setPage(0); if (k !== 'trials') setOnly(null); };
  const filterTrials = (k) => { setTab('trials'); setPage(0); setOnly(only === k ? null : k); };
  const clearFind = () => { setQ(''); setFind(false); setOnly(null); setPage(0); };
  const openRow = (id) => setOpen(id);
  const sel = open ? [...lists.setup, ...lists.stopped, ...lists.trials].find((r) => r.id === open) : null;

  const header = (
    <ShopHeader title="Onboarding"
      about="Where the onboarding team gets new stores live and through their trial. Setting up shows setups in progress, step by step; Stopped shows setups that failed, with the error and a retry (with a new address when the old one is taken); Trials shows stores in their first 14 days with the setup checklist, last sign-in and onboarder. Open a store for its checklist and sessions, to assign an onboarder, log a session, extend the trial or send a sign-in link."
      primary={{ label: 'Add merchant', icon: 'plus', href: '/admin/merchants/new' }} />
  );

  let body;
  if (!live) {
    body = (<div className="ix-page" aria-busy="true" aria-label="Loading onboarding"><div className="onb-skel onb-skel--strip" /><div className="onb-skel" /></div>);
  } else if (failed) {
    body = (
      <section className="ix-card"><div className="onb-err" role="alert">
        <Icon name="triangle-alert" width="24" height="24" aria-hidden="true" />
        <p style={{ margin: 0 }}>The onboarding list could not be worked out.</p>
        <button type="button" className="ix-btn" onClick={() => setRetryN((n) => n + 1)}>Try again</button>
      </div></section>
    );
  } else {
    const f = data.figs;
    const empty = {
      setup: ['No store is being set up right now.', 'Add merchant', () => router.push('/admin/merchants/new')],
      stopped: ['No setup has stopped.', 'View trials', () => go('trials')],
      trials: ['No store is in its first 14 days.', 'Add merchant', () => router.push('/admin/merchants/new')],
    }[view];
    const filtered = !!(s || (view === 'trials' && only));
    body = (
      <>
        <MetricStrip label="Onboarding figures" items={[
          { label: 'Time to go live', value: f.median ? dur(f.median) : '—', sub: `${f.success}% first time`, icon: 'timer' },
          { label: 'No login 3+ days', value: String(f.quiet), sub: 'trials', icon: 'moon', onClick: () => filterTrials('quiet'), on: view === 'trials' && only === 'quiet' },
          { label: 'Trial ends in 3 days', value: String(f.ending), sub: 'trials', icon: 'hourglass', onClick: () => filterTrials('ending'), on: view === 'trials' && only === 'ending' },
          { label: 'No onboarder', value: String(f.unassigned), sub: 'trials', icon: 'user-x', onClick: () => filterTrials('unassigned'), on: view === 'trials' && only === 'unassigned' },
        ]} />

        <section className="ix-card" aria-label={(TABS.find(([k]) => k === view) || [])[1]}>
          <div className="ix-bar">
            {find ? (<>
              <SearchField value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Search store, ID, owner or onboarder" onDone={clearFind} autoFocus />
              <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={clearFind}>Cancel</button>
            </>) : (<>
              <IndexTabs label="Onboarding views" tabs={TABS.map(([k, l]) => ({ key: k, id: 'onb-tab-' + k, label: l, count: lists[k].length, on: view === k, onClick: () => go(k) }))} />
              <span className="ix-tools">
                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
              </span>
            </>)}
          </div>
          {view === 'trials' && only ? (
            <div className="ix-filters" role="group" aria-label="Filters">
              <button type="button" className="onb-chip" onClick={() => setOnly(null)} aria-label={`Remove filter: ${ONLY[only]}`}>
                {ONLY[only]}<Icon name="x" width="14" height="14" aria-hidden="true" />
              </button>
            </div>
          ) : null}

          {!shown.length ? (
            <div className="ix-empty">
              {filtered
                ? <EmptyState icon="search-x" title="No store matches." actionLabel="Clear search" onAction={clearFind} />
                : <EmptyState icon={view === 'stopped' ? 'circle-check' : 'store'} title={empty[0]} actionLabel={empty[1]} onAction={empty[2]} />}
            </div>
          ) : (
            <>
              <ul className="ix-plist" aria-label="Stores">
                {shown.map((r) => (
                  <li key={r.id}>
                    <button type="button" className="ix-pitem" onClick={() => openRow(r.id)}>
                      {view === 'setup' ? (<>
                        <span className="ix-pitem__top"><b>{r.name}</b><span className="onb-fig">{r.rs ? dur(r.rs.elapsed) : '—'}</span></span>
                        <span className="ix-pitem__mid">{r.current} · step {Math.min(r.done + 1, STAGES.length)} of {STAGES.length}</span>
                        <span className="ix-pitem__tags"><Steps rs={r.rs} /></span>
                      </>) : view === 'stopped' ? (<>
                        <span className="ix-pitem__top"><b>{r.name}</b><span>{ago(r.stoppedAt, t)}</span></span>
                        <span className="ix-pitem__mid">{r.error}</span>
                        <span className="ix-pitem__tags"><StatusBadge tone="error">Stopped at {r.stage}</StatusBadge></span>
                      </>) : (<>
                        <span className="ix-pitem__top"><b>{r.name}</b><span>Day {r.day} of {r.of}</span></span>
                        <span className="ix-pitem__mid">Setup {r.checked} of {r.total} · active {lastSeen(r.lastActive).toLowerCase()} · {r.am || 'Unassigned'}</span>
                        {r.left <= 3 || r.lastActive >= 3 ? (
                          <span className="ix-pitem__tags">
                            {r.left <= 3 ? <StatusBadge tone="warning" icon="clock">{leftText(r.left)}</StatusBadge> : null}
                            {r.lastActive >= 3 ? <StatusBadge tone="neutral" icon="moon">No login {r.lastActive} days</StatusBadge> : null}
                          </span>
                        ) : null}
                      </>)}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="ix-table-wrap">
                <table className="ix-table gc-table--keep">
                  <caption className="sr-only">{(TABS.find(([k]) => k === view) || [])[1]}</caption>
                  <thead>
                    {view === 'setup' ? (
                      <tr><th scope="col">Store</th><th scope="col">Progress</th><th scope="col" className="ix-num">Time so far</th><th scope="col">Started</th><th scope="col">Signed up by</th></tr>
                    ) : view === 'stopped' ? (
                      <tr><th scope="col">Store</th><th scope="col">Stopped at</th><th scope="col">Problem</th><th scope="col">When</th><th scope="col"><span className="sr-only">Action</span></th></tr>
                    ) : (
                      <tr><th scope="col">Store</th><th scope="col">Trial</th><th scope="col">Setup</th><th scope="col">Last active</th><th scope="col">Onboarder</th></tr>
                    )}
                  </thead>
                  <tbody>
                    {shown.map((r) => {
                      const name = <><button type="button" className="onb-name" onClick={(e) => { e.stopPropagation(); openRow(r.id); }}>{r.name}</button><span className="onb-id">#{r.id}</span></>;
                      if (view === 'setup') return (
                        <tr key={r.id} onClick={() => openRow(r.id)}>
                          <td>{name}</td>
                          <td><span className="onb-prog" aria-label={`${r.current}, ${r.done} of ${STAGES.length} steps done`}><Steps rs={r.rs} /><span>{r.current} · {Math.min(r.done + 1, STAGES.length)} of {STAGES.length}</span></span></td>
                          <td className="ix-num onb-fig">{r.rs ? dur(r.rs.elapsed) : '—'}</td>
                          <td className="ix-muted onb-fig">{hm(r.run ? r.run.startedAt : r.signedUp)}</td>
                          <td className="ix-muted">{r.by || '—'}</td>
                        </tr>
                      );
                      if (view === 'stopped') return (
                        <tr key={r.id} onClick={() => openRow(r.id)}>
                          <td>{name}</td>
                          <td><StatusBadge tone="error">{r.stage}</StatusBadge></td>
                          <td><span className="onb-problem" title={r.error}>{r.error}</span></td>
                          <td className="ix-muted">{ago(r.stoppedAt, t)}</td>
                          <td className="onb-act"><button type="button" className="ix-btn ix-btn--sm" onClick={(e) => { e.stopPropagation(); openRow(r.id); }}><Icon name="rotate-ccw" width="16" height="16" aria-hidden="true" />Retry</button></td>
                        </tr>
                      );
                      return (
                        <tr key={r.id} className={r.left <= 3 ? 'onb-soon' : undefined} onClick={() => openRow(r.id)}>
                          <td>{name}</td>
                          <td>
                            <span className="onb-fig">Day {r.day} of {r.of}</span>
                            {r.left <= 3 ? <> <StatusBadge tone="warning" icon="clock">{leftText(r.left)}</StatusBadge></> : <span className="ix-muted"> · {leftText(r.left).toLowerCase()}</span>}
                          </td>
                          <td><Meter value={r.checked} total={r.total} /></td>
                          <td className={r.lastActive >= 3 ? 'ix-warn' : 'ix-muted'}>{lastSeen(r.lastActive)}</td>
                          <td className={r.am ? '' : 'ix-muted'}>{r.am || 'Unassigned'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {rows.length > PAGE ? (
                <Pager label={`${pg * PAGE + 1}–${Math.min(rows.length, pg * PAGE + PAGE)} of ${rows.length}`} atStart={pg === 0} atEnd={pg >= pages - 1}
                  prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />
              ) : null}
            </>
          )}
        </section>
      </>
    );
  }

  return (
    <AdminShell active="onboarding">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ix-page">
        {header}
        {body}
      </div>
      {sel ? <StorePanel row={sel} db={db} t={t} onClose={() => setOpen(null)} /> : null}
    </AdminShell>
  );
}
