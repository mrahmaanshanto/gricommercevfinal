'use client';
// The super admin's top bar, laid out like the merchant panel's (gc-topbar.js), left to right:
//   crumb (area / page) · Help · search with a scope (All, Pages, Merchants, Leads, Tickets, Invoices, Staff) and Ctrl K ·
//   quick links (Settings, Invoices, Tasks) · View website · Inbox (unread chats) · Alerts · the signed-in person.
// The person's menu: My tasks, My profile, Settings, Start page, the demo staff switch, the merchant panel, restart the
// demo, Sign out. Help (button or Shift+?) is a side panel with the page's explanation and its area's pages.
// Also here: the search palette (Ctrl K) and the Help panel. Styles: src/styles/admin.css (adm-top*, adm-acc*, adm-help*).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet } from '@/components/ui';
import { staffList, setStaff, resetDemo } from '@/lib/platform/store';
import { canOpen, roleTitle } from '@/lib/admin/access';
import { resetAdminStores, useAdminStore } from '@/lib/admin/store';
import { alerts as alertRows } from '@/lib/admin/dashboard';
import { inbox as inboxStore, lastOf, previewOf, channelName } from '@/lib/admin/inbox';
import { crm } from '@/lib/admin/crm';
import { supportStore } from '@/lib/admin/support';
import { people } from '@/lib/admin/people';
import { LOCKED, EDITIONS, previewEdition } from '@/lib/edition';
import { SYSTEMS } from '@/lib/systems';
import { AREAS, PAGES, pageById } from './adminNav';

export const START_KEY = 'gc.admin.start';
const read = (k) => { try { return window.localStorage.getItem(k); } catch { return null; } };
const write = (k, v) => { try { if (v) window.localStorage.setItem(k, v); else window.localStorage.removeItem(k); } catch { /* ignore */ } };

/** Close a popover on Escape or a click outside `ref`. */
export function useDismiss(open, ref, close) {
  useEffect(() => {
    if (!open) return undefined;
    const off = (e) => { if (ref.current && !ref.current.contains(e.target)) close(); };
    const key = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', off); document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', key); };
  }, [open, ref, close]);
}

/** The employee record behind a staff sign-in (People), for "My profile". */
function employeeOf(me) {
  try { return people.get().employees.find((e) => e.staffId === me.id || e.name === me.name) || null; } catch { return null; }
}
const emailOf = (me) => String(me.name || '').toLowerCase().split(' ')[0] + '@gridcommerce.net';

// ---- search (Ctrl K) -------------------------------------------------------------------------------------------
export const SCOPES = [['all', 'All'], ['pages', 'Pages'], ['merchants', 'Merchants'], ['leads', 'Leads'], ['tickets', 'Tickets'], ['invoices', 'Invoices'], ['staff', 'Staff']];
const SCOPE_AREA = { merchants: 'area-merchants', leads: 'area-crm', tickets: 'area-support', invoices: 'area-billing', staff: 'area-people' };

export function Search({ open, scope: scope0 = 'all', onClose, me, db, matrix }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [scope, setScope] = useState(scope0);
  const [i, setI] = useState(0);
  const input = useRef(null);
  useEffect(() => {
    if (!open) return;
    setQ(''); setI(0); setScope(scope0);
    crm.load(); supportStore.load(); people.load();
    setTimeout(() => input.current && input.current.focus(), 0);
  }, [open, scope0]);
  const results = useMemo(() => {
    if (!open) return [];
    const s = q.trim().toLowerCase();
    const has = (k) => (scope === 'all' || scope === k) && (!SCOPE_AREA[k] || canOpen(me, SCOPE_AREA[k], matrix));
    const hit = (...xs) => xs.join(' ').toLowerCase().includes(s);
    const out = [];
    if (has('pages')) {
      PAGES.filter((p) => canOpen(me, p.area, matrix) && (!s || hit(p.areaLabel, p.label))).slice(0, s ? 8 : 6)
        .forEach((p) => out.push({ key: 'p' + p.id, group: 'Pages', icon: 'arrow-right', label: p.label === 'Overview' ? p.areaLabel : p.label, sub: p.areaLabel, href: p.href }));
    }
    if (!s) return out;
    if (has('merchants')) db.shops.filter((x) => hit(x.name, x.id, typeof x.owner === 'object' ? x.owner.name : x.owner || '', x.dom || '', x.sub || '')).slice(0, 6)
      .forEach((x) => out.push({ key: 's' + x.id, group: 'Merchants', icon: 'store', label: x.name, sub: '#' + x.id, href: '/admin/merchant?id=' + x.id }));
    if (has('leads')) crm.get().leads.filter((l) => hit(l.name, l.business, l.id, l.mobile || '')).slice(0, 5)
      .forEach((l) => out.push({ key: 'l' + l.id, group: 'Leads', icon: 'handshake', label: l.business, sub: l.name + ' · ' + l.id, href: '/admin/leads/view?id=' + l.id }));
    if (has('tickets')) supportStore.get().tickets.filter((x) => hit(x.id, x.subject)).slice(0, 5)
      .forEach((x) => out.push({ key: 't' + x.id, group: 'Tickets', icon: 'life-buoy', label: x.subject, sub: x.id, href: '/admin/tickets/view?id=' + x.id }));
    if (has('invoices')) db.invoices.filter((x) => hit(x.id, (db.shops.find((sh) => sh.id === x.shopId) || {}).name || '')).slice(0, 5)
      .forEach((x) => out.push({ key: 'i' + x.id, group: 'Invoices', icon: 'receipt', label: x.id, sub: (db.shops.find((sh) => sh.id === x.shopId) || {}).name || '', href: '/admin/invoices/view?id=' + x.id }));
    if (has('staff')) people.get().employees.filter((e) => hit(e.name, e.id, e.designation || '', e.dept || '')).slice(0, 5)
      .forEach((e) => out.push({ key: 'e' + e.id, group: 'Staff', icon: 'id-card', label: e.name, sub: e.designation + ' · ' + e.id, href: '/admin/staff/view?id=' + e.id }));
    return out;
  }, [open, q, scope, me, db, matrix]);
  if (!open) return null;
  const go = (r) => { onClose(); router.push(r.href); };
  const key = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setI((x) => Math.min(results.length - 1, x + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setI((x) => Math.max(0, x - 1)); }
    else if (e.key === 'Enter' && results[i]) { e.preventDefault(); go(results[i]); }
    else if (e.key === 'Escape') onClose();
  };
  let last = '';
  return (
    <div className="adm-cmd-back" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="adm-cmd" role="dialog" aria-modal="true" aria-label="Search">
        <label className="adm-cmd__field">
          <Icon name="search" width="18" height="18" aria-hidden="true" />
          <input ref={input} value={q} onChange={(e) => { setQ(e.target.value); setI(0); }} onKeyDown={key} placeholder="Search merchants, leads, tickets, invoices, staff, pages" aria-label="Search"
            role="combobox" aria-expanded="true" aria-controls="adm-cmd-list" aria-activedescendant={results[i] ? 'adm-r-' + results[i].key : undefined} />
          <span className="adm-kbd">Esc</span>
        </label>
        <div className="adm-cmd__scopes" role="group" aria-label="Search in">
          {SCOPES.map(([k, l]) => <button key={k} type="button" className="adm-chip" aria-pressed={scope === k} onClick={() => { setScope(k); setI(0); input.current && input.current.focus(); }}>{l}</button>)}
        </div>
        <div className="adm-cmd__list" id="adm-cmd-list" role="listbox">
          {results.length ? results.map((r, k) => {
            const head = r.group !== last ? <div className="adm-cmd__group">{r.group}</div> : null;
            last = r.group;
            return (
              <React.Fragment key={r.key}>
                {head}
                <button type="button" id={'adm-r-' + r.key} role="option" aria-selected={k === i} className={'adm-cmd__item' + (k === i ? ' is-on' : '')} onMouseEnter={() => setI(k)} onClick={() => go(r)}>
                  <Icon name={r.icon} width="16" height="16" aria-hidden="true" /><span className="adm-cmd__lab">{r.label}</span><small>{r.sub}</small>
                </button>
              </React.Fragment>
            );
          }) : <p className="adm-cmd__empty">{q.trim() ? `Nothing found for “${q}”.` : 'Type a name, an ID or a phone number.'}</p>}
        </div>
      </div>
    </div>
  );
}

// ---- Help ---------------------------------------------------------------------------------------------------------
export function HelpSheet({ open, onClose, active, title }) {
  const page = pageById(active);
  const area = page ? AREAS.find((a) => a.pages.some((p) => p.id === page.id)) : null;
  const [about, setAbout] = useState('');
  useEffect(() => {
    if (!open) return;
    const el = document.querySelector('.gc-shell__content .gc-pagehead__about');
    setAbout(el ? el.textContent.trim() : '');
  }, [open, active]);
  return (
    <Sheet open={open} title={'Help · ' + (title || (page ? page.label : 'Admin'))} onClose={onClose}>
      <div className="adm-help">
        <p>{about || (area ? `${title || page.label} is part of ${area.label}. Everything here is demo data kept in this browser; nothing reaches a real store or service.` : 'Everything here is demo data kept in this browser.')}</p>
        {area && area.pages.length > 1 ? (
          <>
            <h3>In {area.label}</h3>
            <div className="adm-help__links">
              {area.pages.map((p) => <Link key={p.id} href={p.href} onClick={onClose} aria-current={p.id === page.id ? 'page' : undefined}>{p.label}<Icon name="chevron-right" width="14" height="14" aria-hidden="true" /></Link>)}
            </div>
          </>
        ) : null}
        <h3>Keyboard</h3>
        <dl className="adm-help__keys">
          <dt><span className="adm-kbd">Ctrl K</span></dt><dd>Search merchants, leads, tickets, invoices, staff and pages</dd>
          <dt><span className="adm-kbd">Shift ?</span></dt><dd>Open this help</dd>
          <dt><span className="adm-kbd">Esc</span></dt><dd>Close a panel or a menu</dd>
        </dl>
        <h3>Demo</h3>
        <p>Switch the signed-in staff member from your name at the top right to see what each role can open. “Restart demo data” in the same menu puts every figure back.</p>
      </div>
    </Sheet>
  );
}

// ---- the person's menu -------------------------------------------------------------------------------------------
function AccountMenu({ me, matrix, onClose }) {
  const router = useRouter();
  const [start, setStart] = useState('');
  useEffect(() => { setStart(read(START_KEY) || '/admin'); people.load(); }, []);
  const emp = employeeOf(me);
  const pages = PAGES.filter((p) => canOpen(me, p.area, matrix));
  const role = roleTitle(me.role);
  return (
    <div className="adm-pop adm-acc" role="menu" aria-label="Your account">
      <div className="adm-acc__head">
        <span className="adm-av adm-av--lg" aria-hidden="true">{me.ini}<i /></span>
        <span><b>{me.name}</b><small>{role}</small><small>{emailOf(me)}</small></span>
      </div>
      <div className="adm-pop__rule" />
      <Link href="/admin/tasks" className="adm-acc__it" role="menuitem" onClick={onClose}>
        <span className="adm-acc__ic"><Icon name="check" width="16" height="16" aria-hidden="true" /></span><span><b>My tasks</b><small>What is yours to do today</small></span>
      </Link>
      <Link href={emp ? '/admin/staff/view?id=' + emp.id : '/admin/staff'} className="adm-acc__it" role="menuitem" onClick={onClose}>
        <span className="adm-acc__ic"><Icon name="user" width="16" height="16" aria-hidden="true" /></span><span><b>My profile</b><small>Details, attendance, leave and salary</small></span>
      </Link>
      <Link href="/admin/security" className="adm-acc__it" role="menuitem" onClick={onClose}>
        <span className="adm-acc__ic"><Icon name="shield-check" width="16" height="16" aria-hidden="true" /></span><span><b>Sign-in and security</b><small>Two-factor sign-in and sessions</small></span>
      </Link>
      <Link href="/admin/settings" className="adm-acc__it" role="menuitem" onClick={onClose}>
        <span className="adm-acc__ic"><Icon name="settings" width="16" height="16" aria-hidden="true" /></span><span><b>Settings</b><small>Company, billing defaults, notifications</small></span>
      </Link>
      <div className="adm-acc__it adm-acc__row">
        <span className="adm-acc__ic"><Icon name="flag" width="16" height="16" aria-hidden="true" /></span>
        <label htmlFor="adm-start"><b>Start page</b></label>
        <select id="adm-start" className="adm-acc__sel" value={start} onChange={(e) => { setStart(e.target.value); write(START_KEY, e.target.value === '/admin' ? null : e.target.value); toast('Start page saved'); }}>
          {pages.map((p) => <option key={p.id} value={p.href}>{p.label === 'Overview' ? p.areaLabel : p.label}</option>)}
        </select>
      </div>
      <div className="adm-pop__rule" />
      <div className="adm-pop__label">Signed in as (demo)</div>
      {staffList().map((s) => (
        <button key={s.id} type="button" role="menuitemradio" aria-checked={s.id === me.id} className="adm-pop__item" onClick={() => { setStaff(s.id); onClose(); toast(`Signed in as ${s.name}`); }}>
          <span className="adm-pop__ini" style={{ background: s.color }}>{s.ini}</span>{s.name}<small>{roleTitle(s.role)}</small>
          {s.id === me.id ? <Icon name="check" width="16" height="16" aria-hidden="true" className="adm-acc__tick" /> : null}
        </button>
      ))}
      <div className="adm-pop__rule" />
      {LOCKED ? (
        <Link href="/merchant-overview" className="adm-pop__item" role="menuitem"><Icon name="store" width="16" height="16" aria-hidden="true" />Open the merchant panel</Link>
      ) : (
        <>
          <div className="adm-pop__label">Switch system</div>
          {SYSTEMS.map((x) => (
            <button key={x.ed} type="button" className="adm-pop__item" role="menuitem" onClick={() => { previewEdition(x.ed); onClose(); router.push('/merchant-overview?edition=' + x.ed); }}>
              <Icon name={x.icon} width="16" height="16" aria-hidden="true" />{EDITIONS[x.ed].short}<small>{x.blurb}</small>
            </button>
          ))}
        </>
      )}
      <button type="button" className="adm-pop__item" role="menuitem" onClick={() => { resetDemo(); resetAdminStores(); onClose(); toast('Demo data restarted'); }}><Icon name="rotate-ccw" width="16" height="16" aria-hidden="true" />Restart demo data</button>
      <Link href="/merchant-sign-in" className="adm-pop__item" role="menuitem"><Icon name="log-out" width="16" height="16" aria-hidden="true" />Sign out</Link>
    </div>
  );
}

// ---- the bar ------------------------------------------------------------------------------------------------------
export function Topbar({ crumb, title, onMenu, onSearch, onHelp, db, t, live, me, matrix }) {
  const [open, setOpen] = useState('');   // '' · 'chat' · 'bell' · 'me'
  const [scope, setScope] = useState('all');
  const ref = useRef(null);
  useDismiss(!!open, ref, () => setOpen(''));
  const box = useAdminStore(inboxStore);
  const rows = live ? alertRows(db, t) : [];
  const convs = box.live && canOpen(me, 'area-inbox', matrix) ? box.data.convs.filter((c) => c.status !== 'closed') : [];
  const unread = convs.filter((c) => c.unread);
  const latest = convs.slice().sort((a, b) => (b.unread ? 1 : 0) - (a.unread ? 1 : 0) || ((lastOf(b) || {}).at || 0) - ((lastOf(a) || {}).at || 0)).slice(0, 6);
  const toggle = (k) => setOpen(open === k ? '' : k);
  return (
    <header className="adm-top" ref={ref}>
      <button type="button" className="adm-ib adm-top__menu" onClick={onMenu} aria-label="Open menu"><Icon name="menu" width="20" height="20" aria-hidden="true" /></button>
      <div className="adm-top__id">
        {crumb && crumb !== title ? <><span className="adm-top__crumb">{crumb}</span><span className="adm-top__crumb" aria-hidden="true">/</span></> : null}
        <span className="adm-top__here">{title}</span>
      </div>
      <button type="button" className="adm-help-btn" onClick={onHelp} aria-label="Help (Shift ?)"><Icon name="circle-help" width="16" height="16" aria-hidden="true" /><span>Help</span></button>
      <div className="adm-top__search">
        <select className="adm-top__scope" aria-label="Search in" value={scope} onChange={(e) => setScope(e.target.value)}>
          {SCOPES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <button type="button" className="adm-top__field" onClick={() => onSearch(scope)} aria-label="Search (Ctrl K)">
          <Icon name="search" width="16" height="16" aria-hidden="true" /><span>Search merchants, leads, tickets…</span><span className="adm-kbd">Ctrl K</span>
        </button>
      </div>
      <span className="adm-top__gap" />
      <div className="adm-top__grp">
        <Link href="/admin/settings" className="adm-ib" aria-label="Settings" title="Settings"><Icon name="settings" width="18" height="18" aria-hidden="true" /></Link>
        <Link href="/admin/invoices" className="adm-ib" aria-label="Invoices" title="Invoices"><Icon name="receipt-text" width="18" height="18" aria-hidden="true" /></Link>
        <Link href="/admin/tasks" className="adm-ib" aria-label="Tasks" title="Tasks"><Icon name="list-checks" width="18" height="18" aria-hidden="true" /></Link>
      </div>
      <a href="https://gridcommerce.net" target="_blank" rel="noreferrer" className="adm-top__site"><Icon name="globe" width="16" height="16" aria-hidden="true" /><span>View website</span><Icon name="external-link" width="14" height="14" aria-hidden="true" /></a>
      <span className="adm-env" title="Every figure here is demo data; nothing reaches a real store"><i aria-hidden="true" />Demo</span>
      {canOpen(me, 'area-inbox', matrix) ? (
        <div className="adm-wrap">
          <button type="button" className="adm-ib adm-ib--chat" aria-label={`Inbox${unread.length ? ', ' + unread.length + ' unread' : ''}`} aria-haspopup="true" aria-expanded={open === 'chat'} onClick={() => toggle('chat')}>
            <Icon name="message-circle" width="18" height="18" aria-hidden="true" />{unread.length ? <span className="adm-ib__badge adm-ib__badge--navy">{unread.length}</span> : null}
          </button>
          {open === 'chat' ? (
            <div className="adm-pop adm-pop--right adm-chats" role="dialog" aria-label="Inbox">
              <div className="adm-pop__head"><span>Inbox</span><Link href="/admin/inbox" onClick={() => setOpen('')}>Open inbox</Link></div>
              {latest.length ? latest.map((c) => {
                const m = lastOf(c);
                return (
                  <Link key={c.id} href={'/admin/inbox?c=' + c.id} className={'adm-chat' + (c.unread ? ' is-unread' : '')} onClick={() => setOpen('')}>
                    <span className="adm-chat__av" aria-hidden="true">{String(c.name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
                    <span className="adm-chat__txt"><b>{c.name}</b><small>{m ? previewOf(m) : ''}</small></span>
                    <span className="adm-chat__side"><small>{channelName(c.ch)}</small>{c.unread ? <i aria-label="Unread" /> : null}</span>
                  </Link>
                );
              }) : <p className="adm-cmd__empty">{box.live ? 'No open conversations.' : 'Loading…'}</p>}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="adm-wrap">
        <button type="button" className="adm-ib" aria-label={`Alerts${rows.length ? ', ' + rows.length : ''}`} aria-haspopup="true" aria-expanded={open === 'bell'} onClick={() => toggle('bell')}>
          <Icon name="bell" width="18" height="18" aria-hidden="true" />{rows.length ? <span className="adm-ib__badge">{rows.length}</span> : null}
        </button>
        {open === 'bell' ? (
          <div className="adm-pop adm-pop--right adm-bellpop" role="dialog" aria-label="Alerts">
            <div className="adm-pop__head"><span>Needs someone today</span><Link href="/admin" onClick={() => setOpen('')}>Dashboard</Link></div>
            {rows.length ? rows.map((r) => (
              <Link key={r.key} href={r.href} className="adm-alert" onClick={() => setOpen('')}>
                <span className={'adm-alert__dot' + (r.tone === 'err' ? ' adm-alert__dot--err' : '')} aria-hidden="true" />
                <span><b>{r.title}</b><small>{r.sub}</small></span>
              </Link>
            )) : <p className="adm-cmd__empty">Nothing needs you right now.</p>}
          </div>
        ) : null}
      </div>
      <div className="adm-wrap">
        <button type="button" className="adm-top__me" aria-haspopup="menu" aria-expanded={open === 'me'} onClick={() => toggle('me')} aria-label={`${me.name}, ${roleTitle(me.role)}: account menu`}>
          <span className="adm-av" aria-hidden="true">{me.ini}<i /></span>
          <span className="adm-top__metxt"><b>{me.name}</b><small>{roleTitle(me.role)}</small></span>
          <Icon name="chevron-down" width="16" height="16" aria-hidden="true" className="adm-top__chev" />
        </button>
        {open === 'me' ? <AccountMenu me={me} matrix={matrix} onClose={() => setOpen('')} /> : null}
      </div>
    </header>
  );
}
