'use client';
// SetUsers — Settings › Users & roles (/set-users): who can sign in to the shop. Core Settings, so it works on every plan,
// with or without Staff & HR.
//   Users     each person (name, role, places, status, last sign-in); Invite user (name, phone or email, role, places)
//             → Invited, with resend / cancel; change role and places; deactivate / reactivate. Seats used against the
//             plan's seats (lib/planLimits.js); over the limit, inviting asks for an upgrade.
//   Roles     the 13 built-in roles (read-only, with the pages each opens) and custom roles: copy a role, tick the pages
//             it opens, its place scope and POS limits. A custom role drives the menu and the page guard (lib/team.js).
//   Activity  who invited, changed or deactivated whom.
// Data: lib/shopUsers.js (this browser). The invite goes through lib/messaging.js › send (it shows in the delivery
// log); a real invite carries a one-time link where the person sets a password — here the demo link signs in at once.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, StatusBadge, InfoTip } from '@/components/ui';
import { IndexTabs } from '@/components/ui/IndexKit';
import SetFrame from '@/screens/settings-console/SetFrame';
import { NAV } from '@/shell/navigation';
import { ROLES, allUsers, currentUser, roleById, navFor, canSee, managesBilling, SESSION_EVENT } from '@/lib/team';
import { navForEdition, currentEditionId, hasModule } from '@/lib/edition';
import { limitsOf } from '@/lib/planLimits';
import { currentPlan, upgradeHref } from '@/lib/plans';
import { getPlaces } from '@/lib/locations';
import { isBdPhone, isEmail, agoText, withAccount } from '@/lib/myAccount';
import { Pic } from '@/components/ui/Pic';
import { formatDate, formatTime } from '@/lib/format';
import { send } from '@/lib/messaging';
import { domainOf as mailDomain, createMailbox, address as mailAddress, stateOf as mailState } from '@/lib/platform/mail';
import { businessProfile } from '@/lib/businessProfile';
import {
  USERS_EVENT, customRoles, inviteUser, noteInviteSent, resendInvite, cancelInvite, changeUser, setUserStatus,
  saveRole, deleteRole, accessLog, DEFAULT_POS, usersOnRole,
} from '@/lib/shopUsers';

const CSS = `
.su-row{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle)}
.su-row:first-child{border-top:0}
.su-av{display:grid;place-items:center;flex:none;width:32px;height:32px;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary);font-size:var(--text-xs);font-weight:var(--weight-semibold)}
.su-av.is-off{background:var(--surface-subtle);color:var(--text-muted)}
.su-pic{display:flex;flex:none}
.su-pic.is-off{opacity:.5;filter:grayscale(1)}
.su-mid{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.su-name{display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.su-sub{font-size:var(--text-xs);color:var(--text-muted);overflow-wrap:anywhere}
.su-last{flex:none;width:120px;font-size:var(--text-xs);color:var(--text-muted);text-align:right}
.su-acts{flex:none;display:flex;gap:6px}
.su-seats{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4)}
.su-bar{flex:1 1 160px;height:6px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.su-bar i{display:block;height:100%;border-radius:var(--radius-full);background:var(--primary)}
.su-bar.is-over i{background:var(--error)}
.su-seats b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.su-seats small{font-size:var(--text-xs);color:var(--text-muted)}
.su-form{display:flex;flex-direction:column;gap:var(--space-4)}
.su-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.su-err{margin:4px 0 0;font-size:var(--text-xs);color:var(--text-danger)}
.su-help{margin:4px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.su-checks{display:flex;flex-wrap:wrap;gap:6px}
.su-checks label{display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 12px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);font-size:var(--text-sm);cursor:pointer}
.su-checks label:has(input:checked){border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary)}
.su-area{border-top:1px solid var(--border-subtle);padding:var(--space-2) 0}
.su-area:first-child{border-top:0}
.su-area__h{display:flex;align-items:center;gap:var(--space-2);min-height:36px;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.su-area__pages{display:flex;flex-wrap:wrap;gap:4px 14px;padding-left:28px}
.su-area__pages label{display:inline-flex;align-items:center;gap:6px;min-height:32px;font-size:var(--text-sm);color:var(--text-body);cursor:pointer}
.su-opens{margin:0;padding:0;list-style:none}
.su-opens li{padding:var(--space-2) 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.su-opens li:first-child{border-top:0}
.su-opens b{display:block;font-weight:var(--weight-medium);color:var(--text-heading)}
.su-opens span{font-size:var(--text-xs);color:var(--text-muted)}
.su-empty{margin:0;padding:var(--space-3) var(--space-4) var(--space-4);font-size:var(--text-sm);color:var(--text-muted)}
.su-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums;white-space:nowrap}
@media (max-width:640px){.su-row{flex-wrap:wrap;padding:var(--space-3)}.su-last{width:auto;text-align:left;order:3;flex:1 1 100%;padding-left:44px}.su-acts{order:4;padding-left:44px}.su-two{grid-template-columns:1fr}}
`;

const STATUS = { active: ['Active', 'success'], invited: ['Invited', 'info'], off: ['Deactivated', 'neutral'] };
const POS_CHOICE = [['yes', 'Allowed'], ['pin', 'Needs a manager PIN'], ['no', 'Not allowed']];
const statusOf = (u) => (u.status === 'off' ? 'off' : u.status === 'invited' ? 'invited' : 'active');
const builtInIds = Object.keys(ROLES);
const preview = (r) => ({ id: 'role:' + r, name: '', role: ROLES[r] ? r : (roleById(r) || {}).base || 'seller', roles: [r] });

// open to everyone (lib/team.js › BASE): not in the page picker
const ALWAYS = ['my-dash', 'tasks', 'team-chat', 'ai-assistant'];
/** The menu areas and their pages in this edition, for the page picker and "what it opens". */
function areasInEdition() {
  return navForEdition(NAV, currentEditionId()).flatMap((g) => g.items).filter((it) => it.children && it.children.some((c) => !c.hidden))
    .map((it) => ({ id: it.id, label: it.label, pages: it.children.filter((c) => !c.hidden && !ALWAYS.includes(c.id)).map((c) => ({ id: c.id, label: c.label, hidden: it.children.filter((h) => h.hidden && h.under === c.id).map((h) => h.id) })) })).filter((a) => a.pages.length);
}
/** What a role opens: [{ area, pages: [labels] }] from the person's resolved menu. */
function opensOf(roleId) {
  try {
    return navFor(preview(roleId)).flatMap((g) => g.items).map((it) => ({ area: it.label, pages: (it.children || []).filter((c) => !c.hidden && !c.locked).map((c) => c.label) })).filter((a) => a.pages.length);
  } catch { return []; }
}
const placeNames = () => { try { return getPlaces({ active: true }).filter((p) => !p.noSale || p.type === 'Warehouse').map((p) => p.name); } catch { return []; } };

function Field({ id, label, error, help, children }) {
  return (
    <div>
      <label className="gc-label" htmlFor={id}>{label}</label>
      {children}
      {error ? <p className="su-err" role="alert">{error}</p> : help ? <p className="su-help">{help}</p> : null}
    </div>
  );
}

function RolePicker({ id, value, onChange, roles }) {
  return (
    <select id={id} className="gc-input gc-select" value={value} onChange={(e) => onChange(e.target.value)}>
      <optgroup label="Built-in roles">{builtInIds.map((r) => <option key={r} value={r}>{ROLES[r].title}</option>)}</optgroup>
      {roles.length ? <optgroup label="Your roles">{roles.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}</optgroup> : null}
    </select>
  );
}

function Places({ value, onChange, all }) {
  const on = (n) => value.includes(n);
  return (
    <div className="su-checks" role="group" aria-label="Places">
      {all.map((n) => (
        <label key={n}><input type="checkbox" className="gc-check" checked={on(n)} onChange={() => onChange(on(n) ? value.filter((x) => x !== n) : [...value, n])} />{n}</label>
      ))}
    </div>
  );
}

export default function SetUsers() {
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);
  const [tab, setTab] = useState('users');
  const [invite, setInvite] = useState(null);
  const [edit, setEdit] = useState(null);
  const [roleEd, setRoleEd] = useState(null);
  const [view, setView] = useState('');
  useEffect(() => {
    setReady(true);
    const q = new URLSearchParams(window.location.search);
    if (q.get('tab') === 'roles' || q.get('tab') === 'activity') setTab(q.get('tab'));
    const re = () => setTick((n) => n + 1);
    window.addEventListener(USERS_EVENT, re); window.addEventListener(SESSION_EVENT, re); window.addEventListener('gc:plan', re);
    return () => { window.removeEventListener(USERS_EVENT, re); window.removeEventListener(SESSION_EVENT, re); window.removeEventListener('gc:plan', re); };
  }, []);

  const data = useMemo(() => {
    if (!ready) return null;
    const me = currentUser();
    // you first, then invites waiting, then everyone else; deactivated people last
    const rank = (u) => (u.id === me.id ? 0 : u.status === 'invited' ? 1 : u.status === 'off' ? 3 : 2);
    const users = allUsers().map((u, i) => ({ u, i })).sort((a, b) => rank(a.u) - rank(b.u) || a.i - b.i).map((x) => x.u);
    const roles = customRoles();
    const seats = limitsOf().seats;
    const used = users.filter((u) => statusOf(u) !== 'off').length;
    return { me, users, roles, seats, used, over: seats != null && used >= seats, plan: currentPlan(), places: placeNames(), log: accessLog(), areas: areasInEdition(), billing: managesBilling(me) };
  }, [ready, tick]);

  // open the invite form from the Home checklist (?invite=1)
  useEffect(() => { if (ready && data && new URLSearchParams(window.location.search).get('invite') === '1' && !data.over) setInvite({ name: '', phone: '', email: '', role: 'seller', places: [], errs: {} }); }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const by = data ? data.me.name : 'Owner';
  const roleTitle = (id) => (roleById(id) || { title: id }).title;
  const baseOf = (id) => (ROLES[id] ? id : ((data && data.roles.find((r) => r.id === id)) || {}).base || 'seller');

  // ---- invite ----
  const sendInvite = (u) => {
    const first = u.name.split(' ')[0];
    const link = window.location.origin + '/my-dashboard?as=' + encodeURIComponent(u.id);
    const r = send({ source: 'Automations', event: 'staff.invite', internal: true, channels: u.phone ? ['sms', 'email'] : ['email'], to: { name: u.name, phone: u.phone, email: u.email },
      text: `Hi ${first}, you’re invited to {{store_name}} on GridCommerce as ${roleTitle(u.roles[0])}. Join: ${link}`, subject: 'You’re invited to join the team', ref: u.id,
      vars: { store_name: (() => { try { return businessProfile().brand.name; } catch { return 'the shop'; } })() } });
    noteInviteSent(u.id, { channel: r.row.channel, status: r.status, reason: r.row.reason });
    return r;
  };
  const doInvite = () => {
    const f = invite; const errs = {};
    if (!f.name.trim()) errs.name = 'Enter their name.';
    if (!f.phone.trim() && !f.email.trim()) errs.phone = 'Enter a mobile number or an email.';
    if (f.phone.trim() && !isBdPhone(f.phone)) errs.phone = 'Enter an 11-digit mobile number, like 01711-000001.';
    if (f.email.trim() && !isEmail(f.email)) errs.email = 'Enter an email address, like name@shop.com.';
    const dupe = data.users.find((u) => statusOf(u) !== 'off' && ((f.phone.trim() && String(u.phone).replace(/\D/g, '').slice(-10) === f.phone.replace(/\D/g, '').slice(-10)) || (f.email.trim() && String(u.email).toLowerCase() === f.email.trim().toLowerCase())));
    if (dupe) errs[f.phone.trim() ? 'phone' : 'email'] = dupe.name + ' already uses this.';
    if (Object.keys(errs).length) { setInvite({ ...f, errs }); return; }
    const u = inviteUser({ name: f.name, phone: f.phone, email: f.email, role: f.role, base: baseOf(f.role), places: f.places }, by);
    const r = sendInvite(u);
    // Business email: a mailbox for them at the shop's domain (Settings › Business email)
    const md = mailDomain();
    if (f.mailbox !== false && md && md.state === 'active' && mailState(md).seatsLeft > 0) {
      const mb = createMailbox(md.id, { local: f.mailLocal || f.name.split(' ')[0].toLowerCase(), name: f.name.trim(), invite: true, staff: f.name.trim() });
      if (!mb.ok) toast(`${u.name} is invited, but the mailbox wasn’t made: ${mb.error}`, { tone: 'error' });
      else toast(`${mailAddress(md, mb.mailbox.local)} made for ${u.name}`);
    }
    setInvite(null);
    if (r.status === 'Failed' || r.status === 'Suppressed') toast(`${u.name} is invited, but the message didn’t go: ${r.row.reason || 'not sent'}. Copy the link and send it yourself.`, { tone: 'error' });
    else toast(`Invite sent to ${u.name} by ${r.row.channel === 'email' ? 'email' : 'SMS'}`);
  };
  const resend = (u) => { if (resendInvite(u.id, by)) { const r = sendInvite(u); toast(r.status === 'Failed' || r.status === 'Suppressed' ? 'The invite didn’t go: ' + (r.row.reason || 'not sent') : 'Invite sent again', r.status === 'Failed' || r.status === 'Suppressed' ? { tone: 'error' } : undefined); } };
  const copyLink = (u) => {
    const link = window.location.origin + '/my-dashboard?as=' + encodeURIComponent(u.id);
    if (navigator.clipboard) navigator.clipboard.writeText(link).then(() => toast('Invite link copied'), () => toast('Couldn’t copy. The link is ' + link, { tone: 'error' }));
  };
  const cancel = async (u) => {
    if (await confirmDialog({ title: `Cancel the invite for ${u.name}?`, body: 'The link they got stops working.', confirmLabel: 'Cancel invite', tone: 'danger' })) { cancelInvite(u.id, by); toast('Invite cancelled'); }
  };

  // ---- change, deactivate ----
  const isOwner = (u) => (u.roles || [u.role]).includes('ceo') && !u.invited;
  const doEdit = () => {
    changeUser(edit.u, { role: edit.role, base: baseOf(edit.role), places: edit.places }, by, roleTitle(edit.role));
    setEdit(null); toast('Role saved');
  };
  const toggleOff = async (u) => {
    if (statusOf(u) === 'off') {
      if (data.over) { toast('No seat free. Upgrade or deactivate someone first.', { tone: 'error' }); return; }
      setUserStatus(u, 'active', by); toast(u.name + ' can sign in again'); return;
    }
    if (u.id === data.me.id) { toast('You can’t deactivate yourself.', { tone: 'error' }); return; }
    if (isOwner(u)) { toast('The owner can’t be deactivated.', { tone: 'error' }); return; }
    if (await confirmDialog({ title: `Deactivate ${u.name}?`, body: 'They are signed out and can’t sign in. Their sales, orders and notes stay.', confirmLabel: 'Deactivate', tone: 'danger' })) { setUserStatus(u, 'off', by); toast(u.name + ' is deactivated'); }
  };

  // ---- custom roles ----
  const newRole = (from = 'seller', src) => {
    const pu = preview(from);
    const pages = data.areas.flatMap((a) => a.pages).filter((p) => canSee(pu, p.id)).map((p) => p.id);
    setRoleEd(src ? { id: src.id, title: src.title, base: src.base, pages: data.areas.flatMap((a) => a.pages).filter((p) => src.access.includes(p.id)).map((p) => p.id), scope: src.scope || 'all', pos: { ...DEFAULT_POS, ...(src.pos || {}) }, errs: {} }
      : { title: (ROLES[from] ? ROLES[from].title : 'New role') + ' (copy)', base: ROLES[from] ? from : 'seller', pages, scope: 'all', pos: { ...DEFAULT_POS }, errs: {} });
  };
  const doRole = () => {
    const f = roleEd; const errs = {};
    if (!f.title.trim()) errs.title = 'Give the role a name.';
    else if ([...builtInIds.map((r) => ROLES[r].title), ...data.roles.filter((r) => r.id !== f.id).map((r) => r.title)].some((t) => t.toLowerCase() === f.title.trim().toLowerCase())) errs.title = 'Another role has this name.';
    if (!f.pages.length) errs.pages = 'Tick at least one page.';
    const d = Number(f.pos.maxDiscount);
    if (!(d >= 0 && d <= 100)) errs.disc = 'Enter 0 to 100.';
    if (Object.keys(errs).length) { setRoleEd({ ...f, errs }); return; }
    // a ticked page brings its create pages (Add product with All products)
    const hidden = data.areas.flatMap((a) => a.pages).filter((p) => f.pages.includes(p.id)).flatMap((p) => p.hidden);
    const base = ROLES[f.base] || ROLES.seller;
    saveRole({ id: f.id, title: f.title, base: f.base, icon: base.icon, tone: base.tone, blurb: 'Custom role, copied from ' + base.title + '.', access: [...f.pages, ...hidden], scope: f.scope, pos: { ...f.pos, maxDiscount: d } }, by);
    setRoleEd(null); toast(f.id ? 'Role saved' : 'Role added');
  };
  const removeRole = async (r) => {
    const n = usersOnRole(r.id).length;
    if (await confirmDialog({ title: `Delete ${r.title}?`, body: n ? `${n} ${n === 1 ? 'person goes' : 'people go'} back to ${ROLES[r.base] ? ROLES[r.base].title : 'their base role'}.` : 'Nobody has this role.', confirmLabel: 'Delete role', tone: 'danger' })) { deleteRole(r.id, by); toast('Role deleted'); }
  };

  const seatsLine = data ? (data.seats == null ? data.used + ' seats used' : `${data.used} of ${data.seats} seats used`) : '';
  return (
    <SetFrame screen="SetUsers" active="users" title="Users & roles" meta={data ? seatsLine + ' · ' + data.plan.name + ' plan' : ''}
      about="Who can sign in to the shop and what each person can open. Invite people, give them a role and the places they work at, or deactivate them. Make your own roles by copying a built-in one and ticking the pages it opens, its places and its POS limits. Works on every plan, with or without Staff & HR."
      aside={data && tab === 'users' ? <button type="button" className="gc-btn gc-btn--solid" disabled={data.over} onClick={() => setInvite({ name: '', phone: '', email: '', role: 'seller', places: [], errs: {} })}><Icon name="user-plus" width="16" height="16" aria-hidden="true" />Invite user</button>
        : data && tab === 'roles' ? <button type="button" className="gc-btn gc-btn--solid" onClick={() => newRole('seller')}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add role</button> : null}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {!data ? null : (<>
        <IndexTabs label="Users and roles" tabs={[
          { key: 'users', id: 'su-t-users', label: 'Users', count: data.users.filter((u) => statusOf(u) !== 'off').length, on: tab === 'users', onClick: () => setTab('users') },
          { key: 'roles', id: 'su-t-roles', label: 'Roles', count: builtInIds.length + data.roles.length, on: tab === 'roles', onClick: () => setTab('roles') },
          { key: 'activity', id: 'su-t-act', label: 'Activity', on: tab === 'activity', onClick: () => setTab('activity') },
        ]} />

        {tab === 'users' ? (<>
          <section className="ix-card set-card" aria-label="Seats">
            <div className="su-seats">
              <span><b>{data.used}</b>{data.seats != null ? <> of <b>{data.seats}</b></> : null} seats used <InfoTip text="Everyone who is active or invited takes a seat. Deactivated people don’t." /></span>
              {data.seats != null ? <span className={'su-bar' + (data.over ? ' is-over' : '')} aria-hidden="true"><i style={{ width: Math.min(100, Math.round((data.used / data.seats) * 100)) + '%' }} /></span> : null}
              {data.over ? <>
                <small>{data.used > data.seats ? `${data.used - data.seats} over the ${data.plan.name} plan’s seats.` : 'No seat free.'} Deactivate someone or upgrade to invite more.</small>
                {data.billing ? <Link className="ix-btn ix-btn--sm" href={upgradeHref('')}>Upgrade</Link> : null}
              </> : <small>{data.seats - data.used} free on the {data.plan.name} plan</small>}
            </div>
          </section>
          <section className="ix-card set-card" aria-label="People">
            {data.users.map((u) => {
              const st = statusOf(u); const [label, tone] = STATUS[st];
              const places = u.places && u.places.length ? u.places.join(', ') : u.invited ? 'All places' : u.place;
              const last = u.id === data.me.id ? 'Signed in now' : u.lastSignIn ? 'Signed in ' + agoText(u.lastSignIn).toLowerCase() : st === 'invited' ? 'Invited ' + formatDate(u.invitedAt) : 'No sign-in yet';
              const sent = (u.sends || [])[0];
              return (
                <div className="su-row" key={u.id}>
                  <span className={'su-pic' + (st === 'off' ? ' is-off' : '')}><Pic src={(withAccount(u) || {}).photo || u.photo || ''} name={u.name} kind="person" /></span>
                  <span className="su-mid">
                    <span className="su-name">{u.name}{u.id === data.me.id ? <StatusBadge tone="info">You</StatusBadge> : null}<StatusBadge tone={tone}>{label}</StatusBadge></span>
                    <span className="su-sub">{(u.roles || [u.role]).map(roleTitle).join(' + ')} · {places}</span>
                    {st === 'invited' && sent ? <span className="su-sub">{'Invite by ' + (sent.channel === 'email' ? 'email' : 'SMS') + ': ' + (sent.status === 'Failed' || sent.status === 'Suppressed' ? 'not sent (' + (sent.reason || sent.status) + ')' : sent.status.toLowerCase())}</span> : null}
                  </span>
                  <span className="su-last">{last}</span>
                  <span className="su-acts">
                    {st === 'invited' ? <>
                      <button type="button" className="ix-btn ix-btn--sm" onClick={() => resend(u)}>Resend</button>
                      <button type="button" className="ix-btn ix-btn--sm" onClick={() => copyLink(u)} aria-label={'Copy invite link for ' + u.name}>Copy link</button>
                      <button type="button" className="ix-btn ix-btn--sm" onClick={() => cancel(u)}>Cancel</button>
                    </> : <>
                      {st !== 'off' && !isOwner(u) ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => setEdit({ u, role: (u.roles || [u.role])[0], places: (u.places && u.places.slice()) || (u.place && data.places.includes(u.place) ? [u.place] : []) })}>Change role</button> : null}
                      {!isOwner(u) && u.id !== data.me.id ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => toggleOff(u)}>{st === 'off' ? 'Reactivate' : 'Deactivate'}</button> : null}
                    </>}
                  </span>
                </div>
              );
            })}
          </section>
          {hasModule('hr') ? <p className="su-help">Salary, attendance and documents for staff are in <Link href="/all-staff">Staff &amp; HR</Link>.</p> : null}
        </>) : null}

        {tab === 'roles' ? (<>
          <section className="ix-card set-card" aria-labelledby="su-own-h">
            <div className="set-head set-head--top"><span style={{ display: 'block' }}><h2 className="set-title" id="su-own-h">Your roles</h2></span></div>
            {data.roles.length ? data.roles.map((r) => {
              const n = data.users.filter((u) => statusOf(u) !== 'off' && (u.roles || []).includes(r.id)).length;
              const pos = r.pos || DEFAULT_POS;
              return (
                <div className="su-row" key={r.id}>
                  <span className="su-av" aria-hidden="true"><Icon name={r.icon || 'user-cog'} width="16" height="16" /></span>
                  <span className="su-mid">
                    <span className="su-name">{r.title}</span>
                    <span className="su-sub">{r.access.length} pages · {r.scope === 'own' ? 'Own places only' : 'All places'} · discount up to {pos.maxDiscount}% · {n} {n === 1 ? 'person' : 'people'}</span>
                  </span>
                  <span className="su-acts">
                    <button type="button" className="ix-btn ix-btn--sm" onClick={() => newRole(r.base, r)}>Edit</button>
                    <button type="button" className="ix-btn ix-btn--sm" onClick={() => removeRole(r)}>Delete</button>
                  </span>
                </div>
              );
            }) : <p className="su-empty">No roles of your own yet. Copy a built-in role to make one.</p>}
          </section>
          <section className="ix-card set-card" aria-labelledby="su-built-h">
            <div className="set-head set-head--top"><span style={{ display: 'block' }}><h2 className="set-title" id="su-built-h">Built-in roles</h2></span></div>
            {builtInIds.map((id) => {
              const r = ROLES[id];
              const n = data.users.filter((u) => statusOf(u) !== 'off' && (u.roles || [u.role]).includes(id)).length;
              return (
                <div className="su-row" key={id}>
                  <span className="su-av" aria-hidden="true"><Icon name={r.icon} width="16" height="16" /></span>
                  <span className="su-mid"><span className="su-name">{r.title}</span><span className="su-sub">{r.blurb} · {n} {n === 1 ? 'person' : 'people'}</span></span>
                  <span className="su-acts">
                    <button type="button" className="ix-btn ix-btn--sm" onClick={() => setView(id)} aria-label={'What ' + r.title + ' can open'}>What it opens</button>
                    {id !== 'ceo' ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => newRole(id)} aria-label={'Copy ' + r.title}>Copy</button> : null}
                  </span>
                </div>
              );
            })}
          </section>
        </>) : null}

        {tab === 'activity' ? (
          <section className="ix-card set-card" aria-label="Activity">
            {data.log.length ? (
              <div className="gc-table-wrap">
                <table className="ix-table">
                  <thead><tr><th scope="col">When</th><th scope="col">Who</th><th scope="col">What</th></tr></thead>
                  <tbody>{data.log.map((x, i) => <tr key={i}><td className="su-fig">{formatDate(x.at)} {formatTime(x.at)}</td><td>{x.by}</td><td>{x.text}</td></tr>)}</tbody>
                </table>
              </div>
            ) : <p className="su-empty">Nothing yet. Invites, role changes and deactivations show here.</p>}
          </section>
        ) : null}
      </>)}

      <Sheet open={!!invite} title="Invite user" onClose={() => setInvite(null)}
        footer={invite ? <><button type="button" className="gc-btn gc-btn--neutral" style={{ marginRight: 'auto' }} onClick={() => setInvite(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={doInvite}>Send invite</button></> : null}>
        {invite ? (
          <div className="su-form">
            <Field id="su-name" label="Name" error={invite.errs.name}><input id="su-name" className="gc-input" data-autofocus value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value, errs: {} })} /></Field>
            <div className="su-two">
              <Field id="su-phone" label="Mobile number" error={invite.errs.phone}><input id="su-phone" className="gc-input" inputMode="tel" placeholder="01711-000001" value={invite.phone} onChange={(e) => setInvite({ ...invite, phone: e.target.value, errs: {} })} /></Field>
              <Field id="su-email" label="Email" error={invite.errs.email}><input id="su-email" className="gc-input" type="email" placeholder="name@shop.com" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value, errs: {} })} /></Field>
            </div>
            <Field id="su-role" label="Role" help={(roleById(invite.role) || {}).blurb}><RolePicker id="su-role" value={invite.role} roles={data ? data.roles : []} onChange={(v) => setInvite({ ...invite, role: v })} /></Field>
            <div><span className="gc-label">Places they work at</span><Places value={invite.places} all={data ? data.places : []} onChange={(v) => setInvite({ ...invite, places: v })} /><p className="su-help">{invite.places.length ? '' : 'None ticked: all places.'}</p></div>
            {(() => { const md = mailDomain(); if (!md || md.state !== 'active') return null; const local = invite.mailLocal != null ? invite.mailLocal : (invite.name.split(' ')[0] || '').toLowerCase(); if (mailState(md).seatsLeft <= 0) return <p className="su-help">All Business email mailboxes are in use. <Link href="/email?tab=plan" className="bl-link">Buy one more</Link> to give them a mailbox.</p>; return (
              <div>
                <label className="su-check" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)' }}><input type="checkbox" className="gc-check" checked={invite.mailbox !== false} onChange={(e) => setInvite({ ...invite, mailbox: e.target.checked })} />Make a Business email mailbox</label>
                {invite.mailbox !== false ? <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}><input className="gc-input" aria-label="Mailbox address" value={local} onChange={(e) => setInvite({ ...invite, mailLocal: e.target.value.toLowerCase() })} style={{ flex: 1, minWidth: 0 }} /><span style={{ fontFamily: 'var(--font-data)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>@{md.domain}</span></span> : null}
              </div>
            ); })()}
            <p className="su-help">They get a link by SMS (or email) to join. They take a seat until you cancel the invite.</p>
          </div>
        ) : null}
      </Sheet>

      <Sheet open={!!edit} title={edit ? 'Change role · ' + edit.u.name : ''} onClose={() => setEdit(null)}
        footer={edit ? <><button type="button" className="gc-btn gc-btn--neutral" style={{ marginRight: 'auto' }} onClick={() => setEdit(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={doEdit}>Save</button></> : null}>
        {edit ? (
          <div className="su-form">
            <Field id="su-erole" label="Role" help={(roleById(edit.role) || {}).blurb}><RolePicker id="su-erole" value={edit.role} roles={data ? data.roles : []} onChange={(v) => setEdit({ ...edit, role: v })} /></Field>
            <div><span className="gc-label">Places they work at</span><Places value={edit.places} all={data ? data.places : []} onChange={(v) => setEdit({ ...edit, places: v })} /><p className="su-help">{edit.places.length ? '' : 'None ticked: all places.'}</p></div>
            <p className="su-help">The menu changes the next time they open a page.</p>
          </div>
        ) : null}
      </Sheet>

      <Sheet open={!!view} title={view && ROLES[view] ? ROLES[view].title + ' can open' : ''} onClose={() => setView('')}
        footer={view && view !== 'ceo' ? <button type="button" className="gc-btn gc-btn--solid" onClick={() => { const v = view; setView(''); setTab('roles'); newRole(v); }}>Copy this role</button> : null}>
        {view ? (view === 'ceo' ? <p className="su-help" style={{ fontSize: 'var(--text-sm)' }}>Everything in the shop.</p> : (
          <ul className="su-opens">{opensOf(view).map((a) => <li key={a.area}><b>{a.area}</b><span>{a.pages.join(' · ')}</span></li>)}</ul>
        )) : null}
      </Sheet>

      <Sheet open={!!roleEd} title={roleEd && roleEd.id ? 'Edit role' : 'Add role'} onClose={() => setRoleEd(null)}
        footer={roleEd ? <><button type="button" className="gc-btn gc-btn--neutral" style={{ marginRight: 'auto' }} onClick={() => setRoleEd(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={doRole}>Save role</button></> : null}>
        {roleEd && data ? (
          <div className="su-form">
            <Field id="su-rname" label="Role name" error={roleEd.errs.title}><input id="su-rname" className="gc-input" value={roleEd.title} onChange={(e) => setRoleEd({ ...roleEd, title: e.target.value, errs: {} })} /></Field>
            {!roleEd.id ? (
              <Field id="su-rbase" label="Start from" help="Its pages are ticked below. Change any.">
                <select id="su-rbase" className="gc-input gc-select" value={roleEd.base} onChange={(e) => { const t = roleEd.title; newRole(e.target.value); setRoleEd((x) => (x ? { ...x, title: t.endsWith('(copy)') ? ROLES[e.target.value].title + ' (copy)' : t } : x)); }}>
                  {builtInIds.filter((r) => r !== 'ceo').map((r) => <option key={r} value={r}>{ROLES[r].title}</option>)}
                </select>
              </Field>
            ) : null}
            <div>
              <span className="gc-label">Pages it opens</span>
              {roleEd.errs.pages ? <p className="su-err" role="alert">{roleEd.errs.pages}</p> : null}
              <div>
                {data.areas.map((a) => {
                  const ids = a.pages.map((p) => p.id);
                  const n = ids.filter((id) => roleEd.pages.includes(id)).length;
                  const all = n === ids.length;
                  return (
                    <div className="su-area" key={a.id}>
                      <label className="su-area__h"><input type="checkbox" className="gc-check" checked={all} ref={(el) => { if (el) el.indeterminate = n > 0 && !all; }}
                        onChange={() => setRoleEd({ ...roleEd, pages: all ? roleEd.pages.filter((x) => !ids.includes(x)) : [...new Set([...roleEd.pages, ...ids])], errs: {} })} />{a.label}</label>
                      <div className="su-area__pages">
                        {a.pages.map((p) => <label key={p.id}><input type="checkbox" className="gc-check" checked={roleEd.pages.includes(p.id)} onChange={() => setRoleEd({ ...roleEd, pages: roleEd.pages.includes(p.id) ? roleEd.pages.filter((x) => x !== p.id) : [...roleEd.pages, p.id], errs: {} })} />{p.label}</label>)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="su-help">Tasks, team chat, My dashboard and Ask GridAI are open to everyone.</p>
            </div>
            <div>
              <span className="gc-label">Places</span>
              <div className="su-checks" role="radiogroup" aria-label="Places">
                <label><input type="radio" className="gc-check gc-check--radio" name="su-scope" checked={roleEd.scope === 'all'} onChange={() => setRoleEd({ ...roleEd, scope: 'all' })} />All places</label>
                <label><input type="radio" className="gc-check gc-check--radio" name="su-scope" checked={roleEd.scope === 'own'} onChange={() => setRoleEd({ ...roleEd, scope: 'own' })} />Only the places set on the person</label>
              </div>
            </div>
            <div>
              <span className="gc-label">At the POS</span>
              <div className="su-form" style={{ gap: 'var(--space-3)' }}>
                <Field id="su-disc" label="Highest discount (%)" error={roleEd.errs.disc} help="Above this, the register stops the discount.">
                  <input id="su-disc" className="gc-input" inputMode="decimal" value={roleEd.pos.maxDiscount} onChange={(e) => setRoleEd({ ...roleEd, pos: { ...roleEd.pos, maxDiscount: e.target.value.replace(/[^\d.]/g, '') }, errs: {} })} style={{ maxWidth: 120 }} />
                </Field>
                <div className="su-two">
                  <Field id="su-ref" label="Refunds"><select id="su-ref" className="gc-input gc-select" value={roleEd.pos.refunds} onChange={(e) => setRoleEd({ ...roleEd, pos: { ...roleEd.pos, refunds: e.target.value } })}>{POS_CHOICE.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
                  <Field id="su-price" label="Change a price"><select id="su-price" className="gc-input gc-select" value={roleEd.pos.priceChange} onChange={(e) => setRoleEd({ ...roleEd, pos: { ...roleEd.pos, priceChange: e.target.value } })}>{POS_CHOICE.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Sheet>
    </SetFrame>
  );
}
