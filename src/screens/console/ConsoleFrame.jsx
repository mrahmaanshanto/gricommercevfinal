'use client';
// The console's sidebar, top bar and search, shared by every console screen (same markup as the design boards).
// Live parts: the badges (stores to call, stores at risk …), the signed-in staff member, the clock, Ctrl K search.
//   <ConsoleSide group="billing" item="collections" toggle={v.toggleSide} label={v.sideLabel} dark={false} />
//   <ConsoleTop group="billing" page="Collections" />
// Each connects to the platform data by itself (lib/platform), so a screen does not have to.

import React, { useEffect, useReducer, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { attach, db as platformDB, now as platformNow, staff as currentStaff, badges as badgeCounts, subState, balance, fmt, catalogue, setStaff, staffList } from '@/lib/platform';

/** Redraw on every platform change (and once loaded). */
export function usePlatform() {
  const [, force] = useReducer((x) => x + 1, 0);
  useEffect(() => attach({ forceUpdate: force }), []);
  return { db: platformDB(), t: platformNow() };
}

export const GROUPS = [
  { id: 'tenants', label: 'Tenants', href: '/merchants', items: [['merchants', 'Merchants', '/merchants'], ['provisioning', 'Provisioning', '/provisioning'], ['domains', 'Domains', '/domains'], ['backups', 'Backups', '/backups']] },
  { id: 'packaging', label: 'Packaging', href: '/module-catalogue', items: [['catalogue', 'Module catalogue', '/module-catalogue'], ['plans', 'Plans', '/plans'], ['entitlements', 'Entitlements', '/entitlements'], ['limits', 'Limits and meters', '/limits']] },
  { id: 'billing', label: 'Billing', href: '/subscriptions', badge: 'billing', tone: 'warn', items: [['subscriptions', 'Subscriptions', '/subscriptions'], ['invoices', 'Invoices', '/invoices'], ['collections', 'Collections', '/collections', 'collections', 'warn'], ['adjustments', 'Adjustments', '/adjustments']] },
  { id: 'monitoring', label: 'Monitoring', href: '/health-risk', badge: 'monitoring', tone: 'warn', items: [['health', 'Health and risk', '/health-risk', 'health', 'warn'], ['funnel', 'Trial funnel', '/trial-funnel'], ['cost', 'Cost to serve', '/cost-to-serve']] },
  { id: 'support', label: 'Support', href: '/support-desk', badge: 'support', tone: '', items: [['tickets', 'Tickets', '/support-desk', 'tickets', ''], ['storeaccess', 'Store access · PIN', '/store-access'], ['accesslog', 'Access log', '/access-log'], ['supportperf', 'Performance', '/support-performance']] },
  { id: 'crm', label: 'Sales CRM', href: '/leads', badge: 'crm', tone: '', items: [['leads', 'Leads', '/leads', 'leads', ''], ['trials', 'Trials', '/trials'], ['leadimport', 'Import leads', '/lead-import']] },
  { id: 'operations', label: 'Operations', href: '/ops-centre', badge: 'operations', tone: 'err', items: [['opscentre', 'Ops centre', '/ops-centre'], ['platform', 'Platform health', '/platform-health'], ['integrations', 'Integrations', '/integrations', 'integrations', 'err'], ['webhooks', 'Webhooks', '/webhooks'], ['queues', 'Queues and jobs', '/queues-jobs'], ['incidents', 'Incidents', '/incidents', 'incidents', 'warn']] },
  { id: 'system', label: 'System', href: '/releases', items: [['releases', 'Releases', '/releases'], ['security', 'Security', '/security'], ['messaging', 'Messaging', '/messaging'], ['cron', 'Scheduled tasks', '/scheduled-tasks'], ['flags', 'Flags and notices', '/flags-notices'], ['staff', 'Staff and roles', '/staff-roles'], ['audit', 'Audit log', '/audit-log']] },
];

const SV = { width: '17', height: '17', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.75', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' };
export function GroupIcon({ id, size = 17 }) {
  const p = { ...SV, width: String(size), height: String(size) };
  switch (id) {
    case 'overview': return <svg {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>;
    case 'tenants': return <svg {...p}><path d="M3 9 4.5 4h15L21 9" /><path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9Z" /><path d="M5 12v9h14v-9" /></svg>;
    case 'packaging': return <svg {...p}><path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z" /><path d="m3 7 9 5 9-5M12 12v10" /></svg>;
    case 'billing': return <svg {...p}><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></svg>;
    case 'monitoring': return <svg {...p}><path d="M3 12h4l3-8 4 16 3-8h4" /></svg>;
    case 'support': return <svg {...p}><path d="M3 14v-2a9 9 0 0 1 18 0v2" /><path d="M21 14v3a2 2 0 0 1-2 2h-2v-7h4M3 14v3a2 2 0 0 0 2 2h2v-7H3" /></svg>;
    case 'crm': return <svg {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></svg>;
    case 'operations': return <svg {...p}><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></svg>;
    case 'system': return <svg {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>;
    default: return null;
  }
}
const Chev = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
);

/** The console sidebar. group/item: the open group and the current page (ids as in GROUPS); none = Overview. */
export function ConsoleSide({ group, item, toggle, label = 'Collapse menu', dark = false }) {
  const { db, t } = usePlatform();
  const me = currentStaff();
  const b = badgeCounts(db, t);
  const [menu, setMenu] = useState(false);
  const badge = (key) => (key && b[key] ? String(b[key]) : '');
  return (
    <aside className="side" aria-label="Console navigation">
      <div className="sidein">
        <div className="sidehead" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '18px 12px 6px 20px' }}>
          <span className="logo-full">
            <img src={dark ? '/assets/2cdd11de6454f32fc6bb856d35bf4f3e.png' : '/assets/62dadbbb3f365aebdd41bb9975f5931f.png'} alt="GridCommerce" style={{ height: '28px', width: 'auto', display: 'block' }} />
          </span>
          <img className="logo-mini" src="/assets/9b6f9ad369f1cbde65271a968e6ba1f1.png" alt="GridCommerce" style={{ height: '32px', width: 'auto' }} />
          <button className="tb sidetoggle" type="button" onClick={toggle} aria-label={label} title={label}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M9 3v18" />
            </svg>
          </button>
        </div>
        <div className="sidemeta" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 20px 12px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', height: '22px', padding: '0 8px', borderRadius: 'var(--radius-md)', background: 'var(--iconbg)', color: 'var(--iconfg)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase' }}>Console</span>
          <span className="ell" style={{ fontSize: 'var(--text-xs)', color: 'var(--sidemuted)' }}>Staff only · views logged</span>
        </div>
        <nav aria-label="Console" className="sidenav">
          <Link href="/console-shell" className={group ? 'nav top' : 'nav top on'} title="Overview" aria-current={group ? undefined : 'page'}>
            <span className="navic"><GroupIcon id="overview" /></span>
            <span className="navtxt">Overview</span>
          </Link>
          <div className="navlabel" style={{ margin: '10px 10px 6px', fontSize: 'var(--text-2xs)', fontWeight: 'var(--weight-medium)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--sidemuted)' }}>Manage</div>
          {GROUPS.map((g) => {
            const open = g.id === group;
            const gb = !open ? badge(g.badge) : '';
            return (
              <React.Fragment key={g.id}>
                <Link href={g.href} className={open ? 'nav grp open' : 'nav grp'} title={g.label} aria-expanded={open ? 'true' : 'false'}>
                  <span className="navic"><GroupIcon id={g.id} /></span>
                  <span className="navtxt">{g.label}</span>
                  {gb ? <span className={'badge ' + (g.tone || '')}>{gb}</span> : null}
                  <span className={open ? 'chev open' : 'chev'} style={gb ? { marginLeft: '8px' } : undefined}><Chev /></span>
                </Link>
                {open ? (
                  <div className="kids">
                    {g.items.map(([id, lab, href, bk, tone]) => {
                      const ib = badge(bk);
                      return (
                        <Link key={id} href={href} className={id === item ? 'nav sub on' : 'nav sub'} aria-current={id === item ? 'page' : undefined}>
                          <span className="navtxt">{lab}</span>
                          {ib ? <span className={'badge ' + (tone || '')}>{ib}</span> : null}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </React.Fragment>
            );
          })}
        </nav>
        <Link href="/ops-centre" className="statuscard" title="1 open incident" style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ flex: 'none', width: '10px', height: '10px', borderRadius: 'var(--radius-full)', background: '#ff9800', boxShadow: '0 0 0 3px rgba(255,152,0,.2)' }} />
            <span className="statustxt" style={{ fontSize: 'var(--text-xs-plus)', fontWeight: 'var(--weight-medium)', color: 'var(--sideink)' }}>1 open incident</span>
            <span className="num statustxt" style={{ marginLeft: 'auto', fontSize: 'var(--text-xs)', color: 'var(--sidemuted)' }}>99.96%</span>
          </div>
          <div className="statustxt ell" style={{ marginTop: '4px', fontSize: 'var(--text-xs)', color: 'var(--sidebody)' }}>Steadfast webhooks delayed · 38 stores</div>
        </Link>
        <div className="me" style={{ position: 'relative' }}>
          <span style={{ position: 'relative', display: 'inline-flex', flex: 'none' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: 'var(--radius-xl)', background: 'linear-gradient(145deg,#2eaee4,#003087)', color: '#fff', fontSize: 'var(--text-xs-plus)', fontWeight: 'var(--weight-semibold)' }}>{me.ini}</span>
            <span style={{ position: 'absolute', right: '-2px', bottom: '-2px', width: '11px', height: '11px', borderRadius: 'var(--radius-full)', background: '#10b981', border: '2px solid var(--side)' }} />
          </span>
          <div className="metxt" style={{ minWidth: '0' }}>
            <div className="ell" style={{ fontSize: 'var(--text-xs-plus)', fontWeight: 'var(--weight-medium)', color: 'var(--sideink)' }}>{me.name}</div>
            <div className="ell" style={{ fontSize: 'var(--text-xs)', color: 'var(--sidemuted)' }}>{me.title} · 2FA on</div>
          </div>
          <button className="tb mebtn" type="button" aria-label="Account and roles" aria-expanded={menu ? 'true' : 'false'} onClick={() => setMenu(!menu)} style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sidemuted)', border: 0, background: 'transparent', cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
          </button>
          {menu ? (
            <div role="menu" className="panel" style={{ position: 'absolute', left: '0', right: '0', bottom: 'calc(100% + 6px)', padding: '6px', zIndex: 6, boxShadow: '0 16px 36px -16px rgba(0,0,0,.35)' }}>
              <div style={{ padding: '6px 10px 4px', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--muted)' }}>Signed in as (demo)</div>
              {staffList().map((s) => (
                <button key={s.id} role="menuitemradio" aria-checked={s.id === me.id ? 'true' : 'false'} className={s.id === me.id ? 'pr on' : 'pr'} type="button" onClick={() => { setStaff(s.id); setMenu(false); }} style={{ minHeight: '38px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none', width: '24px', height: '24px', borderRadius: 'var(--radius-full)', background: s.color, color: '#fff', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)' }}>{s.ini}</span>
                  <span>{s.name}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{s.title}</span>
                </button>
              ))}
              <Link href="/staff-roles" className="pr" style={{ minHeight: '38px', color: 'var(--ink)' }}>Staff and roles</Link>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

/** The console top bar: breadcrumb, search (Ctrl K), environment, clock, notifications, help. */
export function ConsoleTop({ group, page, crumb, theme }) {
  const { t } = usePlatform();
  const [open, setOpen] = useState(false);
  const g = GROUPS.find((x) => x.id === group);
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); setOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <header className="topbar">
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--text-xs-plus)', minWidth: '230px' }}>
        <span className="crumbic"><GroupIcon id={group || 'overview'} size={15} /></span>
        <span style={{ color: 'var(--muted)' }}>{crumb || (g ? g.label : 'Console')}</span>
        <span style={{ color: 'var(--muted)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
        </span>
        <span style={{ fontWeight: 'var(--weight-medium)', color: 'var(--ink)' }}>{page}</span>
      </nav>
      <button className="searchbtn" type="button" onClick={() => setOpen(true)}><span style={{ display: 'inline-flex' }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>Search stores, phones, invoices, leads<span className="kbd">Ctrl K</span></button>
      {' '}
      <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '8px', height: '24px', padding: '0 8px', borderRadius: 'var(--radius-full)', background: 'var(--okbg)', color: 'var(--okt)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)' }}><span style={{ width: '7px', height: '7px', borderRadius: 'var(--radius-lg)', background: '#10b981', boxShadow: '0 0 0 3px rgba(16,185,129,.18)' }} />Production</span>
      {' '}
      <span className="num" style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)', padding: '0 4px' }}>{fmt.topClock(t)}</span>
      {' '}
      <span style={{ width: '1px', height: '24px', background: 'var(--line)' }} />
      {' '}
      <button className="tb" type="button" aria-label="Notifications, 3 unread" style={{ position: 'relative' }}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10 21h4" />
        </svg>
        <span style={{ position: 'absolute', top: '8px', right: '9px', width: '8px', height: '8px', borderRadius: 'var(--radius-lg)', background: '#ff5724', border: '2px solid var(--surface)' }} />
      </button>
      {' '}
      {theme ? (
        <button className="tb" type="button" onClick={theme.toggle} aria-label={theme.label}>
          {theme.dark
            ? <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
            : <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>}
        </button>
      ) : null}
      {theme ? ' ' : null}
      <button className="tb" type="button" aria-label="Help and runbooks">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" />
        </svg>
      </button>
      {open ? <ConsolePalette onClose={() => setOpen(false)} /> : null}
    </header>
  );
}

const PAGES = GROUPS.flatMap((g) => g.items.map(([, label, href]) => ({ label, href, group: g.label })));

/** Ctrl K: find a store (name, tenant number, phone, domain), an invoice or a page. */
export function ConsolePalette({ onClose, initial = '' }) {
  const { db, t } = usePlatform();
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const [sel, setSel] = useState(0);
  const input = useRef(null);
  useEffect(() => { input.current && input.current.focus(); }, []);
  const s = q.trim().toLowerCase();
  const stores = !s ? [] : db.shops.filter((x) => `${x.name} ${x.id} ${x.owner.phone} ${x.dom || ''} ${x.sub}.gridcommerce.com.bd ${x.owner.name}`.toLowerCase().includes(s)).slice(0, 5).map((x) => {
    const st = subState(db, x.id, t);
    return { key: 'S' + x.id, kind: 'store', href: `/merchant-detail?id=${x.id}`, name: x.name, sub: `tenant ${x.id} · ${x.dom || x.sub + '.gridcommerce.com.bd'}`, state: st };
  });
  const invs = !s ? [] : db.invoices.filter((i) => i.id.toLowerCase().includes(s) || (s.length > 2 && (db.shops.find((x) => x.id === i.shopId) || {}).name?.toLowerCase().includes(s) && balance(db, i) > 0)).sort((a, b) => b.issuedAt - a.issuedAt).slice(0, 3).map((i) => {
    const shop = db.shops.find((x) => x.id === i.shopId);
    const left = balance(db, i);
    return { key: 'I' + i.id, kind: 'invoice', href: `/invoices?id=${i.id}`, id: i.id, sub: `${shop ? shop.name : i.shopId} · ${fmt.taka(i.total)} · ${left > 0 ? 'unpaid since ' + fmt.dm(i.dueAt) : 'paid'}` };
  });
  const pages = !s ? PAGES.slice(0, 0) : PAGES.filter((p) => p.label.toLowerCase().includes(s)).slice(0, 4).map((p) => ({ key: 'P' + p.href, kind: 'page', href: p.href, name: p.label, sub: p.group }));
  const all = [...stores, ...invs, ...pages];
  const go = (r) => { if (!r) return; onClose(); router.push(r.href); };
  const onKey = (e) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') { e.preventDefault(); setSel((x) => Math.min(all.length - 1, x + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((x) => Math.max(0, x - 1)); }
    else if (e.key === 'Enter') go(all[sel]);
  };
  const head = { padding: '6px 12px', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--muted)' };
  let i = -1;
  const shape = (st) => st.tone === 'ok' ? <circle cx="10" cy="10" r="7" fill="#10b981" /> : st.tone === 'warn' ? <path d="M10,2 L18,17 L2,17 Z" fill="#ff9800" /> : st.tone === 'err' ? <rect x="4" y="4" width="12" height="12" fill="#ff5724" transform="rotate(45 10 10)" /> : <circle cx="10" cy="10" r="6" fill="none" stroke="#94a3b8" strokeWidth="2.5" />;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: '0', background: 'var(--scrim)', zIndex: 20 }} />
      <div role="dialog" aria-modal="true" aria-label="Search the console" style={{ position: 'fixed', left: '50%', top: '80px', width: 'min(680px, calc(100vw - 32px))', transform: 'translateX(-50%)', borderRadius: 'var(--radius-xl)', background: 'var(--surface)', boxShadow: '0 24px 60px -16px rgba(0,0,0,.45)', overflow: 'hidden', zIndex: 21 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '60px', padding: '0 16px 0 20px', borderBottom: '1px solid var(--line)' }}>
          <span style={{ display: 'inline-flex', color: 'var(--muted)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          </span>
          <label style={{ flexGrow: '1' }}>
            <span style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Search</span>
            <input ref={input} type="search" value={q} onChange={(e) => { setQ(e.target.value); setSel(0); }} onKeyDown={onKey} placeholder="Store, tenant number, phone, domain or invoice" style={{ width: '100%', height: '44px', border: '0', outline: '0', background: 'transparent', font: 'inherit', fontSize: 'var(--text-base)', color: 'var(--ink)' }} />
          </label>
          <button className="btn btng" type="button" onClick={onClose} style={{ minHeight: '32px', padding: '0 10px', fontSize: 'var(--text-xs)' }}>Esc</button>
        </div>
        <div style={{ padding: '10px 10px 6px', maxHeight: '60vh', overflowY: 'auto' }}>
          {!s ? <div style={{ padding: '10px 12px', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>Type a store name, tenant number, phone, domain or invoice number.</div> : null}
          {s && !all.length ? <div style={{ padding: '10px 12px', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>Nothing matches “{q}”.</div> : null}
          {stores.length ? <div style={head}>Stores</div> : null}
          {stores.map((r) => { i++; const k = i; return (
            <button key={r.key} className={k === sel ? 'pr on' : 'pr'} type="button" onMouseEnter={() => setSel(k)} onClick={() => go(r)}>
              <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true" style={{ flex: 'none' }}>{shape(r.state)}</svg>
              <span style={{ fontWeight: 'var(--weight-medium)' }}>{r.name}</span>
              <span className="mono" style={{ color: 'var(--muted)' }}>{r.sub}</span>
              <span style={{ marginLeft: 'auto', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', color: r.state.tone === 'ok' ? 'var(--okt)' : r.state.tone === 'warn' ? 'var(--warnt)' : r.state.tone === 'err' ? 'var(--errt)' : 'var(--muted)' }}>{r.state.label}</span>
            </button>
          ); })}
          {invs.length ? <div style={{ ...head, padding: '10px 12px 6px' }}>Invoices and payments</div> : null}
          {invs.map((r) => { i++; const k = i; return (
            <button key={r.key} className={k === sel ? 'pr on' : 'pr'} type="button" onMouseEnter={() => setSel(k)} onClick={() => go(r)}>
              <span style={{ display: 'inline-flex', color: 'var(--muted)' }}><GroupIcon id="billing" size={16} /></span>
              <span className="mono" style={{ color: 'var(--ink)' }}>{r.id}</span>
              <span style={{ color: 'var(--muted)', fontSize: 'var(--text-xs-plus)' }}>{r.sub}</span>
            </button>
          ); })}
          {pages.length ? <div style={{ ...head, padding: '10px 12px 6px' }}>Pages</div> : null}
          {pages.map((r) => { i++; const k = i; return (
            <button key={r.key} className={k === sel ? 'pr on' : 'pr'} type="button" onMouseEnter={() => setSel(k)} onClick={() => go(r)}>
              <span>{r.name}</span>
              <span style={{ color: 'var(--muted)', fontSize: 'var(--text-xs-plus)' }}>{r.sub}</span>
            </button>
          ); })}
        </div>
        <div style={{ display: 'flex', gap: '18px', padding: '12px 20px', borderTop: '1px solid var(--line)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
          <span><span className="kbd" style={{ margin: '0 4px 0 0' }}>↑↓</span>move</span>
          <span><span className="kbd" style={{ margin: '0 4px 0 0' }}>Enter</span>open</span>
          <span>Opens without animation: it is used many times a day.</span>
        </div>
      </div>
    </>
  );
}

/** A small message at the bottom right (the design's toast). */
export function ConsoleToast({ text, onClose, tone = 'ok' }) {
  useEffect(() => { const id = window.setTimeout(onClose, 6000); return () => window.clearTimeout(id); }, [text, onClose]);
  if (!text) return null;
  return (
    <div role="status" style={{ position: 'fixed', right: '24px', bottom: '24px', zIndex: 30, display: 'flex', alignItems: 'center', gap: '12px', maxWidth: 'min(560px, calc(100vw - 32px))', padding: '12px 16px', borderRadius: 'var(--radius-xl)', background: '#0f172a', color: '#fff', boxShadow: '0 16px 36px -16px rgba(0,0,0,.55)', fontSize: 'var(--text-sm)', lineHeight: '1.45' }}>
      <span style={{ display: 'inline-flex', color: tone === 'err' ? '#ff8a65' : '#4ade9f' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{tone === 'err' ? <><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></> : <path d="M20 6 9 17l-5-5" />}</svg>
      </span>
      {text}
      <button type="button" onClick={onClose} aria-label="Dismiss" style={{ display: 'inline-flex', border: 0, background: 'transparent', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
      </button>
    </div>
  );
}

export { catalogue };
