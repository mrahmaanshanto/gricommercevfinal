'use client';
// Security (/admin/security) — UI only: no real authentication, sessions or 2FA. Tabs (?tab=):
//   people     2FA per person (turn on / off with a reason, reminders)
//   sessions   active sessions (sign out one, or every other one)
//   history    sign-in history (time, person, result, IP in Bangladesh ranges, device, browser, Dhaka / Chattogram)
//   events     security events (failed sign-ins, new device, 2FA turned off, password reset, IP blocked): review, block IP
//   approvals  which actions need a second person (on / off, amount above, who approves) — one Save
//   policy     password policy and session timeout — one Save
//   ip         IP allow-list (on / off, office addresses) and blocked addresses
// Data: lib/admin/admin.js (setTwoFa, remindTwoFa, signOutSession, signOutOthers, reviewEvent, blockIp, unblockIp,
// saveApprovals, savePolicy, setAllowList, addAllowed, removeAllowed — each writes administrator activity).

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Dialog, StatusBadge, EmptyState, InfoTip } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, Pager } from '@/components/ui/IndexKit';
import { ago, dm, hm, dmy, startOfDay, DAY, taka } from '@/lib/platform/util';
import {
  SEC_TYPES, SEC_LABEL, APPROVER_OPTIONS, PEOPLE, peopleRows, personBy, platformDefaults,
  setTwoFa, remindTwoFa, signOutSession, signOutOthers, reviewEvent, blockIp, unblockIp, saveApprovals, approvalErrors,
  savePolicy, policyErrors, setAllowList, addAllowed, removeAllowed,
} from '@/lib/admin/admin';
import { staff as currentStaff } from '@/lib/platform/store';
import { AdminShell } from '../AdminShell';
import { ADX_CSS, useAdmin, useTab, Skeleton, Field, CardHead, Person, Note, SaveBar, Switch, plural, clone } from './admShared';

const TABS = [['people', 'People & 2FA'], ['sessions', 'Sessions'], ['history', 'Sign-in history'], ['events', 'Security events'], ['approvals', 'Approvals'], ['policy', 'Password & sessions'], ['ip', 'IP addresses']];
const TAB_KEYS = TABS.map((x) => x[0]);
const PAGE = 25;
const EV_ICON = { failed: 'shield-alert', device: 'smartphone', '2fa-off': 'key-round', reset: 'rotate-ccw', ip: 'ban' };

const CSS = `
.sc-rows{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.sc-row{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr) minmax(0,1fr) auto;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.sc-row:first-child{border-top:0}
.sc-row--ev{grid-template-columns:32px minmax(0,1fr) auto}
.sc-cell{display:flex;flex-direction:column;min-width:0;color:var(--text-body)}
.sc-cell small{font-size:var(--text-xs);color:var(--text-muted)}
.sc-cell .adx-fig{font-size:var(--text-xs)}
.sc-acts{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px}
.sc-ico{display:grid;place-items:center;width:32px;height:32px;border-radius:var(--radius-md);background:var(--surface-subtle);color:var(--text-body)}
.sc-ico.is-open{background:var(--fill-warning-soft);color:var(--text-warning)}
.sc-ev b{font-weight:var(--weight-medium);color:var(--text-heading)}
.sc-tools{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-4);border-bottom:1px solid var(--border-subtle)}
.sc-tools .gc-input{width:auto;min-width:160px}
.sc-rule{display:grid;grid-template-columns:auto minmax(0,1.5fr) 160px minmax(0,1fr);align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle)}
.sc-rule:first-child{border-top:0}
.sc-rule>span{display:flex;flex-direction:column;min-width:0;font-size:var(--text-sm);color:var(--text-heading)}
.sc-rule small{font-size:var(--text-xs);color:var(--text-muted)}
.sc-money{position:relative}
.sc-money .gc-input{padding-left:26px}
.sc-money::before{content:'৳';position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:var(--text-sm);color:var(--text-muted)}
.sc-add{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;align-items:end;gap:var(--space-2);padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle)}
@media (max-width:900px){.sc-row{grid-template-columns:minmax(0,1fr) auto}.sc-row .sc-hide{display:none}.sc-rule{grid-template-columns:auto minmax(0,1fr)}.sc-rule>.sc-span{grid-column:2}}
@media (max-width:640px){.sc-row{grid-template-columns:minmax(0,1fr)}.sc-acts{justify-content:flex-start}.sc-row--ev{grid-template-columns:32px minmax(0,1fr)}.sc-row--ev .sc-acts{grid-column:2}.sc-add{grid-template-columns:minmax(0,1fr)}.sc-tools .gc-input{flex:1}}
`;

export default function Security() {
  const { d, t, live, pdb } = useAdmin();
  const [tab, setTab] = useTab('people', TAB_KEYS);
  const [off, setOff] = useState(null);          // turn 2FA off: { id, reason, error }
  const [block, setBlock] = useState(null);      // block an IP: { ip, reason, error }
  const [hf, setHf] = useState({ person: '', result: '' });
  const [hp, setHp] = useState(0);
  const [ef, setEf] = useState({ type: '', status: 'open' });
  const [rules, setRules] = useState(null);
  const [pol, setPol] = useState(null);
  const [errs, setErrs] = useState({});
  const [add, setAdd] = useState({ cidr: '', label: '', error: '', field: '' });

  const savedRules = live ? d.approvals : null;
  const savedPol = live ? d.policy : null;
  const rulesDirty = !!(rules && savedRules && JSON.stringify(rules) !== JSON.stringify(savedRules));
  const polDirty = !!(pol && savedPol && JSON.stringify(pol) !== JSON.stringify(savedPol));
  useEffect(() => { if (live && (!rules || !rulesDirty)) setRules(clone(d.approvals)); }, [live, savedRules]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (live && (!pol || !polDirty)) setPol(clone(d.policy)); }, [live, savedPol]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setHp(0); }, [hf]);

  if (!live || !rules || !pol) {
    return <AdminShell active="security" title="Security"><style dangerouslySetInnerHTML={{ __html: ADX_CSS + CSS }} /><Skeleton label="Loading security" /></AdminShell>;
  }

  const me = currentStaff();
  const people = peopleRows(d);
  const activeP = people.filter((p) => p.state === 'active');
  const with2fa = activeP.filter((p) => p.twofa.on);
  const without = people.filter((p) => p.state !== 'inactive' && !p.twofa.on);
  const failed7 = d.logins.filter((l) => !l.ok && l.at >= startOfDay(t) - 6 * DAY).length;
  const openEv = d.secEvents.filter((e) => e.status === 'open').length;
  const mySession = d.sessions.filter((s) => s.person === me.id).sort((a, b) => b.lastAt - a.lastAt)[0] || null;
  const defaults = platformDefaults(pdb);

  // ---- actions ----
  const remind = (ids) => {
    const res = remindTwoFa(ids);
    if (!res.ok) { toast(res.error, { tone: 'info' }); return; }
    toast(res.n === 1 ? 'Reminder sent' : `Reminder sent to ${plural(res.n, 'person', 'people')}`);
  };
  const turnOn = (p) => {
    const res = setTwoFa(p.id, true);
    if (!res.ok) { toast(res.error, { tone: 'error' }); return; }
    toast(`2FA turned on for ${p.name} · they set up the app at their next sign-in (demo: no code is sent)`);
  };
  const doOff = () => {
    const res = setTwoFa(off.id, false, off.reason);
    if (!res.ok) { setOff({ ...off, error: res.error }); return; }
    toast(`2FA turned off for ${personBy(off.id).name} · logged as a security event`);
    setOff(null);
  };
  const signOut = async (s) => {
    const p = personBy(s.person);
    if (mySession && s.id === mySession.id) { toast('That is this browser. Use the account menu to sign out.', { tone: 'info' }); return; }
    if (!(await confirmDialog({ title: `Sign out ${p ? p.name : 'this session'}?`, body: `${s.device} · ${s.browser} · ${s.ip}. They need to sign in again on that device.`, confirmLabel: 'Sign out', tone: 'danger' }))) return;
    const res = signOutSession(s.id);
    toast(res.ok ? 'Session signed out' : res.error, res.ok ? {} : { tone: 'error' });
  };
  const signOutAll = async () => {
    const n = d.sessions.filter((s) => !mySession || s.id !== mySession.id).length;
    if (!n) { toast('No other sessions are open.', { tone: 'info' }); return; }
    if (!(await confirmDialog({ title: `Sign out ${plural(n, 'other session')}?`, body: 'Everyone else must sign in again. This browser stays signed in.', confirmLabel: 'Sign out all', tone: 'danger' }))) return;
    const res = signOutOthers(mySession ? mySession.id : null);
    toast(res.ok ? `${plural(res.n, 'session')} signed out` : res.error, res.ok ? {} : { tone: 'error' });
  };
  const review = (e) => { const res = reviewEvent(e.id); toast(res.ok ? 'Marked as reviewed' : res.error, res.ok ? {} : { tone: 'info' }); };
  const doBlock = () => {
    const res = blockIp(block.ip, block.reason);
    if (!res.ok) { setBlock({ ...block, error: res.error }); return; }
    toast(`${block.ip.trim()} blocked · it can’t reach the sign-in page`);
    setBlock(null);
  };
  const unblock = async (b) => {
    if (!(await confirmDialog({ title: `Unblock ${b.ip}?`, body: 'It can reach the sign-in page again.', confirmLabel: 'Unblock' }))) return;
    const res = unblockIp(b.ip);
    toast(res.ok ? `${b.ip} unblocked` : res.error, res.ok ? {} : { tone: 'error' });
  };
  const saveRules = () => {
    const e = approvalErrors(rules);
    if (Object.keys(e).length) { setErrs(e); toast(Object.values(e)[0], { tone: 'error' }); return; }
    const res = saveApprovals(rules);
    if (!res.ok) { toast(res.error, { tone: res.error === 'Nothing changed.' ? 'info' : 'error' }); return; }
    setErrs({});
    toast(res.changes.length === 1 ? 'Saved: ' + res.changes[0] : `${res.changes.length} approval rules saved`);
  };
  const savePol = () => {
    const e = policyErrors(pol);
    if (Object.keys(e).length) { setErrs(e); toast(Object.values(e)[0], { tone: 'error' }); return; }
    const res = savePolicy(pol);
    if (!res.ok) { toast(res.error, { tone: res.error === 'Nothing changed.' ? 'info' : 'error' }); return; }
    setErrs({});
    toast(res.changes.length === 1 ? 'Saved: ' + res.changes[0] : `${res.changes.length} settings saved`);
  };
  const toggleAllow = async () => {
    if (!d.ip.on && !(await confirmDialog({ title: 'Turn the IP allow-list on?', body: `Only the ${plural(d.ip.allow.length, 'address', 'addresses')} on the list can sign in to the super admin. Anyone working from home or a phone network is shut out.`, confirmLabel: 'Turn on', tone: 'danger' }))) return;
    const res = setAllowList(!d.ip.on);
    toast(res.ok ? `IP allow-list turned ${d.ip.on ? 'on' : 'off'}` : res.error, res.ok ? {} : { tone: 'error' });
  };
  const doAdd = () => {
    const res = addAllowed(add.cidr, add.label);
    if (!res.ok) { setAdd({ ...add, error: res.error, field: res.field || 'cidr' }); return; }
    toast(`${add.cidr.trim()} added to the allow-list`);
    setAdd({ cidr: '', label: '', error: '', field: '' });
  };
  const removeAllow = async (a) => {
    if (!(await confirmDialog({ title: `Remove ${a.cidr}?`, body: `${a.label} can’t sign in while the allow-list is on.`, confirmLabel: 'Remove', tone: 'danger' }))) return;
    const res = removeAllowed(a.id);
    toast(res.ok ? 'Address removed' : res.error, res.ok ? {} : { tone: 'error' });
  };
  const setRule = (id, patch) => { setRules((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r))); setErrs({}); };
  const putPol = (k, v) => { setPol((p) => ({ ...p, [k]: v })); setErrs({}); };
  const numIn = (k, label, help) => (
    <Field label={label} htmlFor={'sc-' + k} error={errs[k]} help={help}>
      <input id={'sc-' + k} className={'gc-input adx-fig' + (errs[k] ? ' gc-input--error' : '')} inputMode="numeric" value={pol[k]}
        onChange={(e) => putPol(k, e.target.value.replace(/[^\d]/g, '') === '' ? '' : +e.target.value.replace(/[^\d]/g, ''))} />
    </Field>
  );

  const tabs = TABS.map(([k, l]) => ({ key: k, id: 'sc-tab-' + k, label: l, on: tab === k, onClick: () => setTab(k),
    count: k === 'sessions' ? d.sessions.length : k === 'events' ? openEv : null }));

  // ---- tab bodies ----
  let body = null;
  if (tab === 'people') {
    body = (
      <ul className="sc-rows" aria-label="People and 2FA">
        {people.map((p) => (
          <li key={p.id} className="sc-row">
            <Person p={p} sub={p.roleTitle + (p.state === 'invited' ? ' · invited' : p.state === 'inactive' ? ' · left' : '')} />
            <span className="sc-cell">
              {p.twofa.on ? <StatusBadge tone="success">2FA on · {p.twofa.method}</StatusBadge> : <StatusBadge tone={p.state === 'inactive' ? 'neutral' : 'warning'}>2FA off</StatusBadge>}
              {!p.twofa.on && p.twofa.remindedAt ? <small>Reminded {ago(p.twofa.remindedAt, t)}</small> : null}
            </span>
            <span className="sc-cell sc-hide">{p.last ? <>{ago(p.last.at, t)}<small>{p.last.city} · {p.last.device}</small></> : <span className="ix-muted">Never signed in</span>}</span>
            <span className="sc-acts">
              {p.state === 'inactive' ? <span className="ix-muted" style={{ fontSize: 'var(--text-xs)' }}>No access</span>
                : p.twofa.on ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setOff({ id: p.id, reason: '', error: '' })}>Turn off</button>
                  : <>
                    <button type="button" className="ix-btn ix-btn--sm" onClick={() => remind([p.id])}>Send reminder</button>
                    <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => turnOn(p)}>Turn on</button>
                  </>}
            </span>
          </li>
        ))}
      </ul>
    );
  } else if (tab === 'sessions') {
    const list = d.sessions.slice().sort((a, b) => b.lastAt - a.lastAt);
    body = (
      <>
        <CardHead id="sc-ses-h" title={`Active sessions · ${list.length}`} tip={<InfoTip text={`A session ends after ${d.policy.timeoutMin} minutes without activity, or ${d.policy.maxHours} hours after signing in (Password & sessions).`} />}>
          <button type="button" className="ix-btn ix-btn--sm" onClick={signOutAll}><Icon name="log-out" width="16" height="16" aria-hidden="true" />Sign out all others</button>
        </CardHead>
        {list.length ? (
          <ul className="sc-rows" aria-labelledby="sc-ses-h">
            {list.map((s) => {
              const p = personBy(s.person);
              const here = mySession && s.id === mySession.id;
              return (
                <li key={s.id} className="sc-row">
                  <Person p={p} sub={p ? p.title : ''} />
                  <span className="sc-cell">{s.device} · {s.browser}<small><span className="adx-fig">{s.ip}</span> · {s.city}</small></span>
                  <span className="sc-cell sc-hide">Active {ago(s.lastAt, t)}<small>Signed in {dm(s.startedAt)} {hm(s.startedAt)}</small></span>
                  <span className="sc-acts">
                    {here ? <StatusBadge tone="primary">This browser</StatusBadge> : <button type="button" className="ix-btn ix-btn--sm" onClick={() => signOut(s)}>Sign out</button>}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : <div className="ix-empty"><EmptyState icon="monitor" title="No one is signed in right now." actionLabel="See sign-in history" onAction={() => setTab('history')} /></div>}
      </>
    );
  } else if (tab === 'history') {
    const all = d.logins.slice().sort((a, b) => b.at - a.at).filter((l) => (!hf.person || l.person === hf.person) && (!hf.result || (hf.result === 'ok' ? l.ok : !l.ok)));
    const pages = Math.max(1, Math.ceil(all.length / PAGE));
    const pg = Math.min(hp, pages - 1);
    const rows = all.slice(pg * PAGE, pg * PAGE + PAGE);
    body = (
      <>
        <div className="sc-tools" role="search" aria-label="Filter sign-ins">
          <select className="gc-input gc-select" aria-label="Person" value={hf.person} onChange={(e) => setHf({ ...hf, person: e.target.value })}>
            <option value="">Everyone</option>
            {PEOPLE.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select className="gc-input gc-select" aria-label="Result" value={hf.result} onChange={(e) => setHf({ ...hf, result: e.target.value })}>
            <option value="">Any result</option><option value="ok">Signed in</option><option value="failed">Failed</option>
          </select>
        </div>
        {!rows.length ? <div className="ix-empty"><EmptyState title="No sign-ins match." actionLabel="Clear filters" onAction={() => setHf({ person: '', result: '' })} /></div> : (
          <>
            <ul className="ix-plist" aria-label="Sign-in history">
              {rows.map((l) => { const p = personBy(l.person); return (
                <li key={l.id}><div className="ix-pitem">
                  <span className="ix-pitem__top"><b>{p ? p.name : l.person}</b><span className="adx-id">{dm(l.at)} {hm(l.at)}</span></span>
                  <span className="ix-pitem__mid"><span className="adx-fig">{l.ip}</span> · {l.device} · {l.browser} · {l.city}</span>
                  <span className="ix-pitem__tags">{l.ok ? <StatusBadge tone="success">Signed in</StatusBadge> : <StatusBadge tone="error">Failed · {l.reason}</StatusBadge>}</span>
                </div></li>
              ); })}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table gc-table--keep">
                <caption className="sr-only">Sign-in history</caption>
                <thead><tr><th scope="col">Time</th><th scope="col">Person</th><th scope="col">Result</th><th scope="col">IP address</th><th scope="col">Device</th><th scope="col">Location</th></tr></thead>
                <tbody>
                  {rows.map((l) => { const p = personBy(l.person); return (
                    <tr key={l.id}>
                      <td className="adx-id" title={dmy(l.at)}>{dm(l.at)} {hm(l.at)}</td>
                      <td>{p ? p.name : l.person}</td>
                      <td>{l.ok ? <StatusBadge tone="success">Signed in</StatusBadge> : <StatusBadge tone="error">Failed · {l.reason}</StatusBadge>}</td>
                      <td className="adx-fig">{l.ip}</td>
                      <td className="ix-muted">{l.device} · {l.browser}</td>
                      <td className="ix-muted">{l.city}</td>
                    </tr>
                  ); })}
                </tbody>
              </table>
            </div>
          </>
        )}
        <Pager label={all.length ? `${pg * PAGE + 1}–${pg * PAGE + rows.length} of ${all.length}` : '0 sign-ins'} atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setHp(pg - 1)} next={() => setHp(pg + 1)} />
      </>
    );
  } else if (tab === 'events') {
    const base = d.secEvents.slice().sort((a, b) => b.at - a.at).filter((e) => !ef.status || e.status === ef.status);
    const list = base.filter((e) => !ef.type || e.type === ef.type);
    const blocked = new Set(d.ip.blocked.map((b) => b.ip));
    body = (
      <>
        <div className="sc-tools">
          <div className="adx-chips" role="group" aria-label="Event type">
            <button type="button" aria-pressed={!ef.type} onClick={() => setEf({ ...ef, type: '' })}>All · {base.length}</button>
            {SEC_TYPES.map(([k, l]) => <button key={k} type="button" aria-pressed={ef.type === k} onClick={() => setEf({ ...ef, type: k })}>{l} · {base.filter((e) => e.type === k).length}</button>)}
          </div>
          <select className="gc-input gc-select" aria-label="Status" value={ef.status} onChange={(e) => setEf({ ...ef, status: e.target.value })} style={{ marginLeft: 'auto' }}>
            <option value="open">Open</option><option value="reviewed">Reviewed</option><option value="">Open and reviewed</option>
          </select>
        </div>
        {list.length ? (
          <ul className="sc-rows" aria-label="Security events">
            {list.map((e) => {
              const p = personBy(e.person);
              return (
                <li key={e.id} className="sc-row sc-row--ev">
                  <span className={'sc-ico' + (e.status === 'open' ? ' is-open' : '')} aria-hidden="true"><Icon name={EV_ICON[e.type]} width="16" height="16" /></span>
                  <span className="sc-cell sc-ev">
                    <b>{SEC_LABEL[e.type]} · {e.text}</b>
                    <small>{ago(e.at, t)} · {dm(e.at)} {hm(e.at)}{p ? ' · ' + p.name : ''}{e.ip ? <> · <span className="adx-fig">{e.ip}</span></> : null}{e.device ? ' · ' + e.device : ''}{e.city ? ' · ' + e.city : ''}</small>
                    {e.status === 'reviewed' && e.reviewedBy ? <small>Reviewed by {e.reviewedBy} {ago(e.reviewedAt, t)}</small> : null}
                  </span>
                  <span className="sc-acts">
                    {e.type === 'failed' && e.ip && !blocked.has(e.ip) ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => setBlock({ ip: e.ip, reason: e.text, error: '' })}>Block IP</button> : null}
                    {e.type === '2fa-off' && d.twofa[e.person] && !d.twofa[e.person].on ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => remind([e.person])}>Remind about 2FA</button> : null}
                    {e.status === 'open' ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => review(e)}>Mark reviewed</button> : <StatusBadge tone="neutral">Reviewed</StatusBadge>}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : <div className="ix-empty"><EmptyState icon="shield-check" title={ef.status === 'open' ? 'No open security events.' : 'No events of this kind.'} actionLabel="Show all events" onAction={() => setEf({ type: '', status: '' })} /></div>}
      </>
    );
  } else if (tab === 'approvals') {
    body = (
      <>
        <div style={{ padding: 'var(--space-3) var(--space-4) 0' }}><Note>These are the company’s rules. The platform already asks a second person for credits above {taka(defaults.adjThreshold)} and for every plan version; changing a rule here records it for when the super admin has a server.</Note></div>
        <ul className="sc-rows" aria-label="Approval rules">
          {rules.map((r) => (
            <li key={r.id} className="sc-rule">
              <Switch on={r.on} label={r.label} onToggle={() => setRule(r.id, { on: !r.on })} />
              <span>{r.label}<small>{r.on ? 'Needs a second person, never the one who asked' : 'One person can do it'}{r.live === 'adjThreshold' ? ` · platform now: above ${taka(defaults.adjThreshold)}` : r.live === 'plans' ? ' · platform now: always' : ''}</small></span>
              <span className="sc-span">
                {r.threshold !== null ? (
                  <span className="sc-money"><input className={'gc-input adx-fig' + (errs[r.id] ? ' gc-input--error' : '')} inputMode="numeric" aria-label={r.label + ': amount above'} value={r.threshold} disabled={!r.on}
                    onChange={(e) => setRule(r.id, { threshold: e.target.value.replace(/[^\d]/g, '') === '' ? 0 : +e.target.value.replace(/[^\d]/g, '') })} /></span>
                ) : <small className="ix-muted" style={{ fontSize: 'var(--text-xs)' }}>Any amount</small>}
              </span>
              <span className="sc-span">
                <select className="gc-input gc-select" aria-label={r.label + ': approver'} value={r.approver} disabled={!r.on} onChange={(e) => setRule(r.id, { approver: e.target.value })}>
                  {APPROVER_OPTIONS.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </span>
            </li>
          ))}
        </ul>
      </>
    );
  } else if (tab === 'policy') {
    body = (
      <div className="adx-body">
        <Note>UI only: no passwords or sessions are checked in this demo. The values are kept for the real sign-in.</Note>
        <section aria-labelledby="sc-pw-h" className="adx-form">
          <h3 id="sc-pw-h" className="ix-section-title" style={{ margin: 0 }}>Passwords</h3>
          <div className="adx-row adx-row--3">
            {numIn('minLength', 'Minimum length', 'Characters, 8–64')}
            {numIn('expiryDays', 'Expires after', 'Days; 0 = never')}
            {numIn('reuse', 'Can’t reuse the last', 'Passwords')}
          </div>
          <div>
            {[['upper', 'Needs a capital letter'], ['number', 'Needs a number'], ['symbol', 'Needs a symbol']].map(([k, l]) => (
              <div key={k} className="adx-sw"><span>{l}</span><Switch on={pol[k]} label={l} onToggle={() => putPol(k, !pol[k])} /></div>
            ))}
          </div>
          <div className="adx-row">
            {numIn('lockAfter', 'Lock the account after', 'Failed sign-ins in a row')}
            {numIn('lockMinutes', 'Keep it locked for', 'Minutes')}
          </div>
        </section>
        <section aria-labelledby="sc-ss-h" className="adx-form">
          <h3 id="sc-ss-h" className="ix-section-title" style={{ margin: 0 }}>Sessions and 2FA</h3>
          <div className="adx-row adx-row--3">
            {numIn('timeoutMin', 'Sign out after no activity', 'Minutes')}
            {numIn('maxHours', 'Longest session', 'Hours, then sign in again')}
            {numIn('rememberDays', 'Remember a device for', 'Days without 2FA; 0 = never')}
          </div>
          <Field label="2FA is required for" htmlFor="sc-req">
            <select id="sc-req" className="gc-input gc-select" value={pol.require2fa} onChange={(e) => putPol('require2fa', e.target.value)}>
              <option value="all">Everyone</option>
              <option value="money">People who can approve money or change roles (Admin, Management, Finance)</option>
              <option value="optional">Nobody (optional)</option>
            </select>
          </Field>
        </section>
      </div>
    );
  } else if (tab === 'ip') {
    body = (
      <>
        <div className="adx-body" style={{ paddingBottom: 0 }}>
          <div className="adx-sw" style={{ borderTop: 0 }}>
            <span>Only these addresses can sign in<small>{d.ip.on ? 'On: everyone else is shut out of the super admin.' : 'Off: anyone with a password and 2FA can sign in from anywhere.'}</small></span>
            <Switch on={d.ip.on} label="IP allow-list" onToggle={toggleAllow} />
          </div>
        </div>
        <CardHead id="sc-allow-h" title={`Allowed addresses · ${d.ip.allow.length}`} />
        {d.ip.allow.length ? (
          <ul className="sc-rows" aria-labelledby="sc-allow-h">
            {d.ip.allow.map((a) => (
              <li key={a.id} className="sc-row">
                <span className="sc-cell"><span className="adx-fig">{a.cidr}</span><small>{a.label}</small></span>
                <span className="sc-cell sc-hide">Added by {a.by}<small>{dmy(a.at)}</small></span>
                <span className="sc-hide" />
                <span className="sc-acts"><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => removeAllow(a)}>Remove</button></span>
              </li>
            ))}
          </ul>
        ) : <p className="adx-body ix-muted" style={{ margin: 0 }}>No addresses yet.</p>}
        <div className="sc-add">
          <Field label="Address or range" htmlFor="sc-cidr" error={add.field === 'cidr' ? add.error : ''}>
            <input id="sc-cidr" className={'gc-input adx-fig' + (add.field === 'cidr' ? ' gc-input--error' : '')} placeholder="103.108.140.0/24" value={add.cidr} onChange={(e) => setAdd({ ...add, cidr: e.target.value, error: '', field: '' })} />
          </Field>
          <Field label="Place" htmlFor="sc-label" error={add.field === 'label' ? add.error : ''}>
            <input id="sc-label" className={'gc-input' + (add.field === 'label' ? ' gc-input--error' : '')} placeholder="Banani office" value={add.label} onChange={(e) => setAdd({ ...add, label: e.target.value, error: '', field: '' })} />
          </Field>
          <button type="button" className="ix-btn" onClick={doAdd}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add</button>
        </div>
        <CardHead id="sc-block-h" title={`Blocked addresses · ${d.ip.blocked.length}`}>
          <button type="button" className="ix-btn ix-btn--sm" onClick={() => setBlock({ ip: '', reason: '', error: '' })}><Icon name="ban" width="16" height="16" aria-hidden="true" />Block an address</button>
        </CardHead>
        {d.ip.blocked.length ? (
          <ul className="sc-rows" aria-labelledby="sc-block-h">
            {d.ip.blocked.map((b) => (
              <li key={b.ip} className="sc-row">
                <span className="sc-cell"><span className="adx-fig">{b.ip}</span><small>{b.reason}</small></span>
                <span className="sc-cell sc-hide">Blocked by {b.by}<small>{dmy(b.at)}</small></span>
                <span className="sc-hide" />
                <span className="sc-acts"><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => unblock(b)}>Unblock</button></span>
              </li>
            ))}
          </ul>
        ) : <p className="adx-body ix-muted" style={{ margin: 0 }}>Nothing is blocked.</p>}
      </>
    );
  }

  return (
    <AdminShell active="security" title="Security">
      <style dangerouslySetInnerHTML={{ __html: ADX_CSS + CSS }} />
      <div className="ix-page">
        <ShopHeader icon="lock" title="Security"
          about="Who uses two-factor sign-in, who is signed in now and from where, every sign-in and security event, which actions need a second person, the password and session rules and the office addresses allowed to sign in. UI only: no real authentication, sessions or 2FA run in this demo."
          secondary={[{ label: 'Activity log', href: '/admin/activity?tab=security' }]}
          primary={{ label: 'Send 2FA reminders', icon: 'key-round', onClick: () => remind(without.map((p) => p.id)), disabled: !without.length }} />

        <MetricStrip items={[
          { label: '2FA on', value: `${with2fa.length} of ${activeP.length}`, sub: activeP.length ? Math.round((with2fa.length / activeP.length) * 100) + '%' : '', icon: 'key-round', onClick: () => setTab('people') },
          { label: 'Failed sign-ins · 7 days', value: String(failed7), icon: 'shield-alert', onClick: () => { setHf({ person: '', result: 'failed' }); setTab('history'); } },
          { label: 'Session timeout', value: `${d.policy.timeoutMin} min`, icon: 'clock', onClick: () => setTab('policy') },
          { label: 'IP allow-list', value: d.ip.on ? 'On' : 'Off', sub: plural(d.ip.allow.length, 'address', 'addresses'), icon: 'globe-lock', onClick: () => setTab('ip') },
        ]} />

        <section className="ix-card" aria-label={TABS.find((x) => x[0] === tab)[1]}>
          <div className="ix-bar"><IndexTabs tabs={tabs} label="Security sections" /></div>
          {body}
        </section>

        {tab === 'approvals' && rulesDirty ? <SaveBar onSave={saveRules} onDiscard={() => { setRules(clone(d.approvals)); setErrs({}); }} label="Unsaved approval rules" /> : null}
        {tab === 'policy' && polDirty ? <SaveBar onSave={savePol} onDiscard={() => { setPol(clone(d.policy)); setErrs({}); }} label="Unsaved password and session settings" /> : null}
        {(tab !== 'approvals' && rulesDirty) || (tab !== 'policy' && polDirty) ? (
          <Note warn>Unsaved changes in {[rulesDirty && tab !== 'approvals' ? <button key="a" type="button" className="adx-link" onClick={() => setTab('approvals')}>Approvals</button> : null, polDirty && tab !== 'policy' ? <button key="p" type="button" className="adx-link" onClick={() => setTab('policy')}>Password & sessions</button> : null].filter(Boolean).reduce((a, x) => (a.length ? [...a, ' and ', x] : [x]), [])}.</Note>
        ) : null}
      </div>

      <Dialog open={!!off} title={off ? `Turn off 2FA for ${personBy(off.id).name}?` : ''} onClose={() => setOff(null)} width={480}
        footer={<>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setOff(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--solid gc-btn--error" onClick={doOff}>Turn off</button>
        </>}>
        {off ? (
          <div className="adx-form">
            <Note warn>They sign in with a password only until 2FA is on again. This is logged as a security event.</Note>
            <Field label="Why" htmlFor="sc-off" error={off.error}>
              <input id="sc-off" className={'gc-input' + (off.error ? ' gc-input--error' : '')} data-autofocus placeholder="For example: lost their phone" value={off.reason} onChange={(e) => setOff({ ...off, reason: e.target.value, error: '' })} />
            </Field>
          </div>
        ) : null}
      </Dialog>

      <Dialog open={!!block} title="Block an address" onClose={() => setBlock(null)} width={480}
        footer={<>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setBlock(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--sm gc-btn--solid gc-btn--error" onClick={doBlock}>Block</button>
        </>}>
        {block ? (
          <div className="adx-form">
            <Field label="IP address" htmlFor="sc-bip">
              <input id="sc-bip" className="gc-input adx-fig" data-autofocus placeholder="103.145.13.87" value={block.ip} onChange={(e) => setBlock({ ...block, ip: e.target.value, error: '' })} />
            </Field>
            <Field label="Reason" htmlFor="sc-brs" error={block.error}>
              <input id="sc-brs" className={'gc-input' + (block.error ? ' gc-input--error' : '')} value={block.reason} onChange={(e) => setBlock({ ...block, reason: e.target.value, error: '' })} />
            </Field>
          </div>
        ) : null}
      </Dialog>
    </AdminShell>
  );
}
