'use client';
// Notifications (/notifications, opened from the bell's "View all"; hidden under Home) — everything that asked for
// someone's attention, newest first (lib/notificationCentre.js): new orders, payments due, low stock, late payouts,
// approvals, meeting notes, support tickets, mentions and the other to-dos pages report.
//   Tabs        All · Unread · Settings (?tab=settings)
//   List        type chips filter it; a row opens the page where it is done and marks it read; Mark all read
//   Settings    per person: for each type In the app · Sound · Email · SMS, and quiet hours (no sound). Saved at once.
// Front end only: email and SMS go out from the server once it is built; this page keeps the person's choice.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { navigate } from '@/runtime/routes';
import { toast } from '@/runtime/ui';
import { EmptyState, InfoTip } from '@/components/ui';
import { IndexTabs } from '@/components/ui/IndexKit';
import { currentUser, SESSION_EVENT } from '@/lib/team';
import { ACTIONS_EVENT } from '@/lib/actionItems';
import { TYPES, CHANNELS, NOTIFY_EVENT, feed, refreshFeed, markRead, markAllRead, getPrefs, savePrefs, agoText, chime } from '@/lib/notificationCentre';
import { TeamPage } from '@/screens/team/teamShared';

const CSS = `
.nt-chips{display:flex;flex-wrap:wrap;gap:var(--space-2);padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-subtle)}
.nt-list{list-style:none;margin:0;padding:0}
.nt-row{display:grid;grid-template-columns:32px minmax(0,1fr) auto 10px;align-items:start;column-gap:var(--space-3);width:100%;padding:var(--space-3) var(--space-4);border:0;border-bottom:1px solid var(--border-subtle);background:none;font:inherit;text-align:left;color:inherit;cursor:pointer}
.nt-list>li:last-child .nt-row{border-bottom:0}
.nt-row:hover{background:var(--surface-subtle)}
.nt-ic{display:grid;place-items:center;width:32px;height:32px;border-radius:var(--radius-lg);background:var(--surface-subtle);color:var(--primary)}
.nt-ic.is-high{background:var(--fill-warning-soft);color:var(--text-warning)}
.nt-ic.is-critical{background:var(--fill-error-soft);color:var(--text-danger)}
.nt-t{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nt-row.is-unread .nt-t{font-weight:var(--weight-semibold)}
.nt-d{display:block;font-size:var(--text-xs);color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nt-w{font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.nt-dot{width:8px;height:8px;margin-top:6px;border-radius:var(--radius-full)}
.nt-row.is-unread .nt-dot{background:var(--primary)}
.nt-prefs{list-style:none;margin:0;padding:0}
.nt-pref{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-2) var(--space-4);padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-subtle)}
.nt-pref b{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.nt-pref .ix-chips{display:flex;flex-wrap:wrap;gap:var(--space-1-5)}
.nt-quiet{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4)}
.nt-quiet label{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-body)}
.nt-quiet input[type="time"]{width:120px}
.nt-saved{font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:640px){
  .nt-row{padding:var(--space-3)}
  .nt-pref{padding:var(--space-3)}
  .nt-pref .ix-chip{height:36px}
  .nt-chips .ix-chip{height:36px}
}
`;

export default function Notifications() {
  const [tick, setTick] = useState(0);
  const [tab, setTab] = useState('all');
  const [type, setType] = useState('');
  useEffect(() => {
    const u = new URL(window.location.href);
    const t = u.searchParams.get('tab');
    if (t === 'settings' || t === 'unread') setTab(t);
    const bump = () => { refreshFeed(); setTick((n) => n + 1); };
    bump();
    const evs = [NOTIFY_EVENT, ACTIONS_EVENT, SESSION_EVENT, 'gc:ledger', 'gc:orders', 'gc:inbox', 'storage'];
    evs.forEach((e) => window.addEventListener(e, bump));
    return () => evs.forEach((e) => window.removeEventListener(e, bump));
  }, []);
  const pick = (t) => {
    setTab(t);
    const u = new URL(window.location.href);
    if (t === 'all') u.searchParams.delete('tab'); else u.searchParams.set('tab', t);
    window.history.replaceState(window.history.state, '', u.pathname + u.search);
  };

  const user = tick ? currentUser() : null;
  const rows = useMemo(() => (tick ? feed({ user }) : []), [tick, user]);
  const unread = rows.filter((n) => !n.read).length;
  const types = TYPES.filter(([k]) => rows.some((n) => n.type === k));
  const shown = rows.filter((n) => (tab !== 'unread' || !n.read) && (!type || n.type === type));
  const open = (n) => { markRead(n.id, user); navigate(n.href); };
  const tabs = [
    { key: 'all', id: 'nt-tab-all', label: 'All', count: tick ? rows.length : null, on: tab === 'all', onClick: () => pick('all') },
    { key: 'unread', id: 'nt-tab-unread', label: 'Unread', count: tick ? unread : null, on: tab === 'unread', onClick: () => pick('unread') },
    { key: 'settings', id: 'nt-tab-settings', label: 'Settings', on: tab === 'settings', onClick: () => pick('settings') },
  ];

  return (
    <TeamPage screen="Notifications" active="notifications" crumb="Home" page="Notifications" title="Notifications" icon="bell" css={CSS}
      about="Everything that needs someone: new orders, payments due, low stock, late payouts, approvals, meeting notes, support tickets and mentions. Settings decide which ones you get and how."
      secondary={unread && tab !== 'settings' ? [{ label: 'Mark all read', onClick: () => { markAllRead(user); toast('All marked as read'); } }] : []}>
      <section className="ix-card" aria-label="Notifications">
        <div className="ix-bar"><IndexTabs tabs={tabs} label="Show" /></div>
        {tab === 'settings' ? <Prefs user={user} /> : (<>
          {types.length > 1 ? (
            <div className="nt-chips" role="group" aria-label="Type">
              <button type="button" className="ix-chip" aria-pressed={!type} onClick={() => setType('')}>All types</button>
              {types.map(([k, label]) => <button key={k} type="button" className="ix-chip" aria-pressed={type === k} onClick={() => setType(type === k ? '' : k)}>{label}</button>)}
            </div>
          ) : null}
          {!tick ? <p className="gc-help" style={{ padding: 'var(--space-4)' }}>Loading…</p> : shown.length ? (
            <ul className="nt-list">
              {shown.map((n) => (
                <li key={n.id}>
                  <button type="button" className={'nt-row' + (n.read ? '' : ' is-unread')} onClick={() => open(n)}>
                    <span className={'nt-ic' + (n.severity === 'critical' ? ' is-critical' : n.severity === 'high' ? ' is-high' : '')} aria-hidden="true"><Icon name={n.icon} width="16" height="16" /></span>
                    <span style={{ minWidth: 0 }}><span className="nt-t">{n.title}</span><span className="nt-d">{n.detail}</span></span>
                    <span className="nt-w">{agoText(n.at)}</span>
                    <i className="nt-dot" role={n.read ? undefined : 'img'} aria-label={n.read ? undefined : 'Unread'} aria-hidden={n.read ? 'true' : undefined} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="ix-empty"><EmptyState icon="bell" title={tab === 'unread' ? 'You’re all caught up' : 'Nothing needs you right now'} actionLabel={type ? 'Show all types' : undefined} onAction={type ? () => setType('') : undefined} /></div>
          )}
        </>)}
      </section>
    </TeamPage>
  );
}

function Prefs({ user }) {
  const [p, setP] = useState(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (user) setP(getPrefs(user)); }, [user]);
  if (!p) return <p className="gc-help" style={{ padding: 'var(--space-4)' }}>Loading…</p>;
  const save = (next) => { setP(next); savePrefs(next, user); setSaved(true); };
  const flip = (k, ch) => {
    const on = !p.types[k][ch];
    save({ ...p, types: { ...p.types, [k]: { ...p.types[k], [ch]: on } } });
    if (ch === 'sound' && on) chime();   // let them hear it
  };
  return (
    <>
      <ul className="nt-prefs" aria-label="What you get">
        {TYPES.map(([k, label, icon]) => (
          <li key={k} className="nt-pref">
            <b><Icon name={icon} width="16" height="16" aria-hidden="true" />{label}</b>
            <span className="ix-chips" role="group" aria-label={label}>
              {CHANNELS.map(([ch, cl]) => <button key={ch} type="button" className="ix-chip" aria-pressed={!!p.types[k][ch]} onClick={() => flip(k, ch)}>{cl}</button>)}
            </span>
          </li>
        ))}
      </ul>
      <div className="nt-quiet">
        <label><input type="checkbox" className="gc-check" checked={!!p.quiet.on} onChange={(e) => save({ ...p, quiet: { ...p.quiet, on: e.target.checked } })} />Quiet hours (no sound)</label>
        <label>From <input type="time" className="gc-input" value={p.quiet.from} disabled={!p.quiet.on} onChange={(e) => save({ ...p, quiet: { ...p.quiet, from: e.target.value } })} /></label>
        <label>To <input type="time" className="gc-input" value={p.quiet.to} disabled={!p.quiet.on} onChange={(e) => save({ ...p, quiet: { ...p.quiet, to: e.target.value } })} /></label>
        <InfoTip text="Email and SMS go to the address and phone in My account. They are sent by GridCommerce's server; in this demo your choice is kept." />
        {saved ? <span className="nt-saved" role="status">Saved for {user ? user.name : 'you'}</span> : null}
      </div>
    </>
  );
}
