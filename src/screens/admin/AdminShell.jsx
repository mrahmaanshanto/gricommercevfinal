'use client';
// AdminShell — the frame of every super admin page (/admin): the menu (adminNav.js) with the platform status and the
// person's card (→ My profile) at its foot, and the top bar (AdminTopbar.jsx: crumb, Help, scoped search, quick links,
// View website, Inbox, Alerts, the person's menu). Same look as the merchant panel's shell; styles in src/styles/admin.css.
//
//   <AdminShell active="dashboard">…page…</AdminShell>     active: a page id from adminNav.js (or an ALIAS key)
//
// The menu is a 76px rail below 1280px (or when collapsed by hand) and a drawer below 1024px. While the signed-in person
// has a support access session on a store, a banner sits above every page (access/StoreAccess.jsx › AccessBanner).

import React, { useEffect, useReducer, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { attach, db as platformDB, now as platformNow, isLive, staff as currentStaff } from '@/lib/platform/store';
import { canOpen, roleTitle } from '@/lib/admin/access';
import { useAdminStore } from '@/lib/admin/store';
import { admin as adminStore } from '@/lib/admin/admin';
import { people } from '@/lib/admin/people';
import { ops as opsStore, services } from '@/lib/admin/ops';
import { LAYERS, AREAS, ALIAS, RECORDS, pageById } from './adminNav';
import { Topbar, Search, HelpSheet } from './AdminTopbar';
import { AccessBanner } from './access/StoreAccess';
import { syncServices } from '@/lib/admin/servicesSync';
import { EVENT as SERVICES_EVENT } from '@/lib/platform/services';
import { syncGridShop } from '@/lib/admin/gridShopSync';
import { GS_EVENT } from '@/lib/platform/gridShop';

const LOGO = '/assets/62dadbbb3f365aebdd41bb9975f5931f.png';
const LOGO_MINI = '/assets/9b6f9ad369f1cbde65271a968e6ba1f1.png';
const COLLAPSE_KEY = 'gc.admin.rail';

/** Redraw on every platform change (and once the saved data is loaded). `live` is false on the server render. */
export function usePlatform() {
  const [, force] = useReducer((x) => x + 1, 0);
  // `live` stays false until this component has mounted, even when another part of the page loaded the data first,
  // so the first browser render always matches the server render
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); return attach({ forceUpdate: force }); }, []);
  const live = mounted && isLive();
  return { db: platformDB(), t: platformNow(), live };
}

const read = (k) => { try { return window.localStorage.getItem(k); } catch { return null; } };
const write = (k, v) => { try { if (v == null) window.localStorage.removeItem(k); else window.localStorage.setItem(k, v); } catch { /* ignore */ } };

function useMedia(q) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(q);
    const f = () => setOn(m.matches);
    f(); m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, [q]);
  return on;
}

// ---- the menu -----------------------------------------------------------------------------------------------------
function Sidebar({ active, me, drawer, onClose, live, matrix }) {
  const wide = useMedia('(min-width: 1280px)');
  const narrow = useMedia('(max-width: 1023px)');
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => { setCollapsed(read(COLLAPSE_KEY) === '1'); }, []);
  const rail = !narrow && (!wide || collapsed);
  const here = ALIAS[active] || active;
  const openArea = (AREAS.find((a) => a.pages.some((p) => p.id === here)) || {}).id;
  const areas = AREAS.filter((a) => canOpen(me, a.id, matrix));
  const svc = live ? services(platformNow()).filter((s) => s.status !== 'ok') : [];
  // the person's card opens their own staff record (People)
  const [profileHref, setProfileHref] = useState('/admin/staff');
  useEffect(() => {
    if (!live) return;
    people.load();
    const e = people.get().employees.find((x) => x.staffId === me.id || x.name === me.name);
    setProfileHref(e ? '/admin/staff/view?id=' + e.id : '/admin/staff');
  }, [live, me.id, me.name]);
  const toggle = () => { const next = !collapsed; setCollapsed(next); write(COLLAPSE_KEY, next ? '1' : null); };

  return (
    <>
      {narrow && drawer ? <button type="button" className="adm-backdrop" aria-label="Close menu" onClick={onClose} /> : null}
      <aside className={'adm-side' + (rail ? ' adm-side--rail' : '') + (drawer ? ' is-open' : '')} aria-label="Admin menu">
        <div className="adm-side__head">
          {rail ? <img className="adm-side__mini" src={LOGO_MINI} alt="GridCommerce" /> : <img className="adm-side__logo" src={LOGO} alt="GridCommerce" />}
          {!rail && !narrow ? (
            <button type="button" className="adm-side__toggle" onClick={toggle} aria-label="Collapse menu" title="Collapse menu"><Icon name="panel-left" width="18" height="18" aria-hidden="true" /></button>
          ) : null}
          {narrow ? <button type="button" className="adm-side__toggle" onClick={onClose} aria-label="Close menu"><Icon name="x" width="18" height="18" aria-hidden="true" /></button> : null}
        </div>
        {!rail ? <div className="adm-side__meta"><span className="adm-side__chip">Super admin</span><span className="adm-side__metatxt">GridCommerce staff only</span></div> : null}
        <nav className="adm-side__body" aria-label="Admin">
          {LAYERS.map((layer) => {
            const list = areas.filter((a) => a.layer === layer.id);
            if (!list.length) return null;
            return (
              <React.Fragment key={layer.id}>
                <p className="adm-side__eyebrow">{layer.label}</p>
                {list.map((a) => {
                  const open = a.id === openArea;
                  const first = a.pages[0];
                  const single = a.pages.length === 1;
                  return (
                    <React.Fragment key={a.id}>
                      <Link href={first.href} className={'adm-nav' + (open ? ' adm-nav--open' : '')} aria-current={single && open ? 'page' : undefined}
                        title={rail ? a.label : undefined} onClick={narrow ? onClose : undefined}>
                        <span className="adm-nav__icon"><Icon name={a.icon} width="16" height="16" aria-hidden="true" /></span>
                        <span className="adm-nav__label">{a.label}</span>
                        <span className="adm-nav__mini" aria-hidden="true">{a.label.split(/[ &]/)[0]}</span>
                        {!single ? <span className="adm-nav__chev"><Icon name="chevron-right" width="15" height="15" aria-hidden="true" /></span> : null}
                      </Link>
                      {open && !single && !rail ? (
                        <div className="adm-sub">
                          {a.pages.map((p) => (
                            <Link key={p.id} href={p.href} className={'adm-nav' + (p.id === here ? ' adm-nav--active' : '')} aria-current={p.id === here ? 'page' : undefined}
                              onClick={narrow ? onClose : undefined}>
                              <span className="adm-nav__label">{p.label}</span>
                              {!p.built ? <span className="adm-soon" title={`Planned · step ${p.phase}`}>Soon</span> : null}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            );
          })}
        </nav>
        <Link href="/admin/incidents" className={'adm-status' + (svc.length ? ' adm-status--warn' : '')}>
          <span className="adm-status__row"><i aria-hidden="true" /><span>{svc.length ? `${svc.length} service issue` : 'All systems normal'}</span><span>99.96%</span></span>
          <small>{svc.length ? `${svc[0].name}: ${svc[0].note}` : 'Uptime, last 30 days'}</small>
        </Link>
        <div className="adm-mewrap">
          <Link href={profileHref} className="adm-me" title={rail ? me.name : 'My profile'} onClick={narrow ? onClose : undefined}>
            <span className="adm-av" aria-hidden="true">{me.ini}<i /></span>
            <span className="adm-me__txt"><b>{me.name}</b><small>{roleTitle(me.role)}</small></span>
            <Icon name="chevron-right" width="16" height="16" aria-hidden="true" />
          </Link>
        </div>
      </aside>
    </>
  );
}

/** The frame: menu, top bar, then the page. */
export function AdminShell({ active, title, children }) {
  const { db, t, live } = usePlatform();
  const me = currentStaff();
  // Administration › Roles & permissions (lib/admin/admin.js) decides what the menu shows once it has loaded
  const roles = useAdminStore(adminStore);
  const matrix = roles.live ? roles.data : null;
  useAdminStore(opsStore);   // the status card and the bell follow Platform ops (incidents, paused providers)
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState('');   // '' closed, else the scope it opened with
  const [help, setHelp] = useState(false);
  // Services orders paid, refunded or approved in a merchant's panel reach the books here (lib/admin/servicesSync.js)
  useEffect(() => {
    if (!live) return undefined;
    syncServices(); syncGridShop();
    window.addEventListener(SERVICES_EVENT, syncServices);
    window.addEventListener(GS_EVENT, syncGridShop);   // Grid Shop (Batch D, lib/admin/gridShopSync.js)
    return () => { window.removeEventListener(SERVICES_EVENT, syncServices); window.removeEventListener(GS_EVENT, syncGridShop); };
  }, [live]);
  useEffect(() => {
    const k = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearch('all'); return; }
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || '') || (e.target && e.target.isContentEditable);
      if (e.key === '?' && e.shiftKey && !typing) { e.preventDefault(); setHelp(true); }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, []);
  const page = pageById(ALIAS[active] || active) || RECORDS.find((r) => r.id === active) || null;
  const area = page ? AREAS.find((a) => a.id === page.area || a.pages.some((p) => p.id === page.id)) : null;
  const heading = title || (page ? page.label : 'Admin');
  return (
    <div className="dc-screen ds adm" data-screen="Admin">
      <div className="gc-shell">
        <Sidebar active={active} me={me} drawer={drawer} onClose={() => setDrawer(false)} live={live} matrix={matrix} />
        <main className="gc-shell__main" id="main">
          <Topbar crumb={area ? area.label : 'Admin'} title={heading} onMenu={() => setDrawer(true)} onSearch={(scope) => setSearch(scope || 'all')} onHelp={() => setHelp(true)}
            db={db} t={t} live={live} me={me} matrix={matrix} />
          <div className="gc-shell__content"><AccessBanner />{children}</div>
        </main>
      </div>
      <Search open={!!search} scope={search || 'all'} onClose={() => setSearch('')} me={me} db={db} matrix={matrix} />
      <HelpSheet open={help} onClose={() => setHelp(false)} active={ALIAS[active] || active} title={heading} />
    </div>
  );
}
