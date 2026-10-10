'use client';
// AdminShell — the frame of every super admin page (/admin): the menu (adminNav.js), the top bar (where you are,
// search with Ctrl K, alerts, the demo-data chip) and the person's card at the foot of the menu (switch staff, open the
// merchant panel, reset the demo). Same look as the merchant panel's shell; styles in src/styles/admin.css.
//
//   <AdminShell active="dashboard">…page…</AdminShell>     active: a page id from adminNav.js (or an ALIAS key)
//
// The menu is a 76px rail below 1280px (or when collapsed by hand) and a drawer below 1024px.

import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { attach, db as platformDB, now as platformNow, isLive, staff as currentStaff, staffList, setStaff, resetDemo } from '@/lib/platform/store';
import { canOpen, roleTitle } from '@/lib/admin/access';
import { resetAdminStores, useAdminStore } from '@/lib/admin/store';
import { admin as adminStore } from '@/lib/admin/admin';
import { alerts as alertRows } from '@/lib/admin/dashboard';
import { ops as opsStore, services } from '@/lib/admin/ops';
import { LAYERS, AREAS, PAGES, ALIAS, RECORDS, pageById } from './adminNav';

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

/** Close a popover on Escape or a click outside `ref`. */
function useDismiss(open, ref, close) {
  useEffect(() => {
    if (!open) return undefined;
    const off = (e) => { if (ref.current && !ref.current.contains(e.target)) close(); };
    const key = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', off); document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', key); };
  }, [open, ref, close]);
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
  const [menu, setMenu] = useState(false);
  const meRef = useRef(null);
  useDismiss(menu, meRef, () => setMenu(false));
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
        <div className="adm-mewrap" ref={meRef}>
          <button type="button" className="adm-me" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu(!menu)} title={rail ? me.name : undefined}>
            <span className="adm-av" aria-hidden="true">{me.ini}<i /></span>
            <span className="adm-me__txt"><b>{me.name}</b><small>{roleTitle(me.role)}</small></span>
            <Icon name="chevrons-up-down" width="16" height="16" aria-hidden="true" />
          </button>
          {menu ? (
            <div className="adm-pop adm-pop--up" role="menu">
              <div className="adm-pop__label">Signed in as (demo)</div>
              {staffList().map((s) => (
                <button key={s.id} type="button" role="menuitemradio" aria-checked={s.id === me.id} className="adm-pop__item" onClick={() => { setStaff(s.id); setMenu(false); toast(`Signed in as ${s.name}`); }}>
                  <span className="adm-pop__ini" style={{ background: s.color }}>{s.ini}</span>{s.name}<small>{roleTitle(s.role)}</small>
                </button>
              ))}
              <div className="adm-pop__rule" />
              <Link href="/merchant-overview" className="adm-pop__item" role="menuitem"><Icon name="store" width="16" height="16" aria-hidden="true" />Open the merchant panel</Link>
              <button type="button" className="adm-pop__item" role="menuitem" onClick={() => { resetDemo(); resetAdminStores(); setMenu(false); toast('Demo data restarted'); }}><Icon name="rotate-ccw" width="16" height="16" aria-hidden="true" />Restart demo data</button>
            </div>
          ) : null}
        </div>
      </aside>
    </>
  );
}

// ---- search (Ctrl K): pages and stores ---------------------------------------------------------------------------
function Search({ open, onClose, me, db, matrix }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [i, setI] = useState(0);
  const input = useRef(null);
  useEffect(() => { if (open) { setQ(''); setI(0); setTimeout(() => input.current && input.current.focus(), 0); } }, [open]);
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    const pages = PAGES.filter((p) => canOpen(me, p.area, matrix) && (!s || (p.areaLabel + ' ' + p.label).toLowerCase().includes(s)))
      .slice(0, s ? 8 : 6).map((p) => ({ key: 'p' + p.id, group: 'Pages', label: p.label === 'Overview' ? p.areaLabel : p.label, sub: p.areaLabel, href: p.href }));
    const stores = s ? db.shops.filter((x) => (x.name + ' ' + x.id + ' ' + (x.owner || '')).toLowerCase().includes(s)).slice(0, 6)
      .map((x) => ({ key: 's' + x.id, group: 'Merchants', label: x.name, sub: '#' + x.id, href: '/admin/merchant?id=' + x.id })) : [];
    return [...pages, ...stores];
  }, [q, me, db, matrix]);
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
          <input ref={input} value={q} onChange={(e) => { setQ(e.target.value); setI(0); }} onKeyDown={key} placeholder="Search pages and merchants" aria-label="Search pages and merchants"
            role="combobox" aria-expanded="true" aria-controls="adm-cmd-list" aria-activedescendant={results[i] ? 'adm-r-' + results[i].key : undefined} />
          <span className="adm-kbd">Esc</span>
        </label>
        <div className="adm-cmd__list" id="adm-cmd-list" role="listbox">
          {results.length ? results.map((r, k) => {
            const head = r.group !== last ? <div className="adm-cmd__group">{r.group}</div> : null;
            last = r.group;
            return (
              <React.Fragment key={r.key}>
                {head}
                <button type="button" id={'adm-r-' + r.key} role="option" aria-selected={k === i} className={'adm-cmd__item' + (k === i ? ' is-on' : '')} onMouseEnter={() => setI(k)} onClick={() => go(r)}>
                  <Icon name={r.group === 'Merchants' ? 'store' : 'arrow-right'} width="16" height="16" aria-hidden="true" />{r.label}<small>{r.sub}</small>
                </button>
              </React.Fragment>
            );
          }) : <p className="adm-cmd__empty">Nothing found for “{q}”.</p>}
        </div>
      </div>
    </div>
  );
}

// ---- the top bar ------------------------------------------------------------------------------------------------
function Topbar({ crumb, title, onMenu, onSearch, db, t, live }) {
  const [bell, setBell] = useState(false);
  const ref = useRef(null);
  useDismiss(bell, ref, () => setBell(false));
  const rows = live ? alertRows(db, t) : [];
  return (
    <header className="adm-top">
      <button type="button" className="adm-ib adm-top__menu" onClick={onMenu} aria-label="Open menu"><Icon name="menu" width="20" height="20" aria-hidden="true" /></button>
      <div className="adm-top__id">
        {crumb && crumb !== title ? <><span className="adm-top__crumb">{crumb}</span><span className="adm-top__crumb" aria-hidden="true">/</span></> : null}
        <span className="adm-top__here">{title}</span>
      </div>
      <button type="button" className="adm-top__search" onClick={onSearch} aria-label="Search pages and merchants (Ctrl K)">
        <Icon name="search" width="16" height="16" aria-hidden="true" /><span>Search pages and merchants</span><span className="adm-kbd">Ctrl K</span>
      </button>
      <span className="adm-top__gap" />
      <span className="adm-env" title="Every figure here is demo data; nothing reaches a real store"><i aria-hidden="true" />Demo data</span>
      <div className="adm-bell" ref={ref}>
        <button type="button" className="adm-ib" aria-label={`Alerts${rows.length ? ', ' + rows.length : ''}`} aria-haspopup="true" aria-expanded={bell} onClick={() => setBell(!bell)}>
          <Icon name="bell" width="18" height="18" aria-hidden="true" />{rows.length ? <span className="adm-ib__badge">{rows.length}</span> : null}
        </button>
        {bell ? (
          <div className="adm-pop" role="dialog" aria-label="Alerts">
            <div className="adm-pop__label">Needs someone today</div>
            {rows.length ? rows.map((r) => (
              <Link key={r.key} href={r.href} className="adm-alert" onClick={() => setBell(false)}>
                <span className={'adm-alert__dot' + (r.tone === 'err' ? ' adm-alert__dot--err' : '')} aria-hidden="true" />
                <span><b>{r.title}</b><small>{r.sub}</small></span>
              </Link>
            )) : <p className="adm-cmd__empty">Nothing needs you right now.</p>}
          </div>
        ) : null}
      </div>
    </header>
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
  const [search, setSearch] = useState(false);
  useEffect(() => {
    const k = (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearch(true); } };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, []);
  const page = pageById(ALIAS[active] || active) || RECORDS.find((r) => r.id === active) || null;
  const area = page ? AREAS.find((a) => a.id === page.area || a.pages.some((p) => p.id === page.id)) : null;
  return (
    <div className="dc-screen ds adm" data-screen="Admin">
      <div className="gc-shell">
        <Sidebar active={active} me={me} drawer={drawer} onClose={() => setDrawer(false)} live={live} matrix={matrix} />
        <main className="gc-shell__main" id="main">
          <Topbar crumb={area ? area.label : 'Admin'} title={title || (page ? page.label : 'Admin')} onMenu={() => setDrawer(true)} onSearch={() => setSearch(true)} db={db} t={t} live={live} />
          <div className="gc-shell__content">{children}</div>
        </main>
      </div>
      <Search open={search} onClose={() => setSearch(false)} me={me} db={db} matrix={matrix} />
    </div>
  );
}
