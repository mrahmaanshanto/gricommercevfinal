'use client';
// SetHosting — Settings › Hosting (/set-hosting?tab=): the store is hosted on GridCommerce, and this is where a merchant
// sets everything a web host would offer (lib/hosting.js). Tabs:
//   Overview   the address customers see, certificate, email checks, uptime, bandwidth, and what needs doing
//   Domains    the GridCommerce address and custom domains (SetDomains, embedded; /set-domains opens this tab)
//   DNS        GridCommerce DNS or the registrar, nameservers, records, services, zone import / export, DNSSEC
//   Email      mailbox provider, order emails from the domain, SPF, DKIM, DMARC, MTA-STS, records, test email
//   SSL & security · Speed & cache · Files & verification · Backups · Usage
// Website-only tabs (Speed, Files) show only in editions with the online store. Front end only: the live platform's DNS
// servers, CDN and certificate service do the work; states move on with the clock here.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { IndexTabs, MetricStrip } from '@/components/ui/IndexKit';
import { ColumnChart } from '@/components/charts/DashCharts';
import { hasModule } from '@/lib/edition';
import { currentPlan } from '@/lib/plans';
import { subdomainOf, SUBDOMAIN_BASE, TARGET_IP, TARGET_HOST } from '@/lib/domains';
import {
  hostedDomains, certificates, emailStatus, healthItems, usage, UPTIME, zoneOf, nsState, HOSTING_EVENT, DOMAINS_EVENT, OVERAGE, NAMESERVERS,
} from '@/lib/hosting';
import SetFrame from '@/screens/settings-console/SetFrame';
import SetDomains from '@/screens/settings-console/SetDomains';
import HostingDns from './hosting/HostingDns';
import HostingEmail from './hosting/HostingEmail';
import HostingSecurity from './hosting/HostingSecurity';
import { HostingSpeed, HostingFiles, HostingBackups } from './hosting/HostingMore';
import { HS_CSS, Card, NoDomain } from './hosting/hsShared';

const TABS = [['overview', 'Overview'], ['domains', 'Domains'], ['dns', 'DNS'], ['email', 'Email'], ['security', 'SSL & security'], ['speed', 'Speed & cache', 'online'], ['files', 'Files & verification', 'online'], ['backups', 'Backups'], ['usage', 'Usage']];
const gb = (n) => (n >= 100 ? Math.round(n) : Math.round(n * 10) / 10) + ' GB';
const big = (n) => (n >= 1e6 ? Math.round(n / 1e5) / 10 + 'M' : n >= 1e3 ? Math.round(n / 100) / 10 + 'K' : String(n));

export default function SetHosting({ tab: startTab = 'overview' }) {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState(startTab);
  const [host, setHost] = useState('');
  const [now, setNow] = useState(0);
  const [, setTick] = useState(0);

  useEffect(() => {
    const bump = () => { setNow(Date.now()); setTick((n) => n + 1); };
    bump(); setReady(true);
    const q = new URLSearchParams(window.location.search).get('tab');
    if (q && TABS.some((t) => t[0] === q)) setTab(q);
    [HOSTING_EVENT, DOMAINS_EVENT].forEach((e) => window.addEventListener(e, bump));
    const t = window.setInterval(bump, 3000);   // checks and certificates move on with the clock
    return () => { [HOSTING_EVENT, DOMAINS_EVENT].forEach((e) => window.removeEventListener(e, bump)); window.clearInterval(t); };
  }, []);

  const online = ready ? hasModule('online') : true;
  const tabs = TABS.filter((t) => !t[2] || online);
  const go = (k) => { setTab(k); try { window.history.replaceState(window.history.state, '', '/set-hosting' + (k === 'overview' ? '' : '?tab=' + k)); } catch { /* ignore */ } };
  const domains = ready ? hostedDomains(now) : [];
  const custom = domains.length ? domains.find((d) => d.host === host) || domains.find((d) => d.primary) || domains[0] : null;
  const cur = custom ? custom.host : '';
  const primary = domains.find((d) => d.primary);
  const sub = ready ? subdomainOf() + '.' + SUBDOMAIN_BASE : '';

  let body = null;
  if (!ready) body = <div style={{ minHeight: 320 }} aria-busy="true" />;
  else if (tab === 'overview') body = <Overview now={now} domains={domains} primary={primary} sub={sub} go={go} />;
  else if (tab === 'domains') body = <SetDomains embedded />;
  else if (tab === 'dns') body = cur ? <HostingDns domains={domains} host={cur} setHost={setHost} now={now} goTab={go} /> : <NoDomain onDomains={() => go('domains')} />;
  else if (tab === 'email') body = cur ? <HostingEmail key={cur} domains={domains} host={cur} setHost={setHost} now={now} goTab={go} /> : <NoDomain onDomains={() => go('domains')} />;
  else if (tab === 'security') body = <HostingSecurity now={now} />;
  else if (tab === 'speed') body = <HostingSpeed now={now} />;
  else if (tab === 'files') body = <HostingFiles />;
  else if (tab === 'backups') body = <HostingBackups now={now} />;
  else if (tab === 'usage') body = <Usage now={now} />;

  return (
    <SetFrame screen="SetHosting" active="hosting" title="Hosting" meta={ready ? 'Customers go to ' + (primary ? primary.host : sub) : ''}
      about="Your store is hosted on GridCommerce. Connect your domain, keep its DNS here, set up email records (SPF, DKIM and DMARC), and control certificates, security, speed, root files and backups. Usage shows bandwidth and storage against your plan.">
      <style dangerouslySetInnerHTML={{ __html: HS_CSS }} />
      <div className="ix-card hs-tabs"><div className="ix-bar"><IndexTabs label="Hosting" tabs={tabs.map(([k, l]) => ({ key: k, label: l, id: 'hs-tab-' + k, on: tab === k, onClick: () => go(k) }))} /></div></div>
      {body}
    </SetFrame>
  );
}

function Overview({ now, domains, primary, sub, go }) {
  const certs = certificates(now);
  const mainCert = certs.find((c) => c.primary) || certs[0];
  const status = primary ? emailStatus(primary.host, now) : [];
  const okMail = status.filter((s) => s.state === 'ok').length;
  const u = usage(now);
  const items = healthItems(now);
  const z = primary ? zoneOf(primary.host) : null;
  return (
    <>
      <MetricStrip label="Hosting" items={[
        { label: 'Address', value: primary ? primary.host : sub, sub: primary ? 'your domain' : 'free address' },
        { label: 'Certificate', value: mainCert ? (mainCert.state === 'issuing' ? 'Issuing' : mainCert.daysLeft + ' days') : '—', sub: mainCert && mainCert.auto ? 'renews by itself' : 'left' , onClick: () => go('security') },
        { label: 'Email checks', value: status.length ? `${okMail} of ${status.length}` : '—', sub: status.length ? 'records working' : 'no email yet', onClick: () => go('email') },
        { label: 'Bandwidth', value: gb(u.gb), sub: 'of ' + u.limits.bw + ' GB', onClick: () => go('usage') },
      ]} />
      <Card title={items.length ? 'To do' : 'All set'} id="hs-todo">
        {items.length ? (
          <div className="hs-list">
            {items.slice(0, 5).map((x, i) => (
              <div key={i} className="hs-attn"><i className={'hs-dot hs-dot--' + x.tone} aria-hidden="true" /><span>{x.text}</span><button type="button" className="ix-btn ix-btn--sm" onClick={() => go(x.tab)}>Open</button></div>
            ))}
          </div>
        ) : <p className="hs-sub">Domain, certificates, email and backups are all in order.</p>}
      </Card>
      <Card title="Your hosting" id="hs-facts">
        <div className="hs-list">
          <div className="hs-row"><span className="hs-row__text">Plan<small>{currentPlan().name} · {u.limits.bw} GB bandwidth and {u.limits.storage} GB storage a month</small></span><Link href="/subscription" className="ix-btn ix-btn--sm">Plan & billing</Link></div>
          <div className="hs-row"><span className="hs-row__text">Servers<small>Dhaka, Singapore and Mumbai, nearest to each visitor</small></span></div>
          <div className="hs-row"><span className="hs-row__text">Point your domain to<small style={{ fontFamily: 'var(--font-data)' }}>A {TARGET_IP} · CNAME www {TARGET_HOST}</small></span></div>
          {z ? <div className="hs-row"><span className="hs-row__text">DNS for {primary.host}<small>{z.mode === 'gc' ? `GridCommerce DNS (${NAMESERVERS.join(', ')}) · ${nsState(z, now) === 'active' ? 'working' : 'waiting for the registrar'}` : 'Kept at your registrar'}</small></span><button type="button" className="ix-btn ix-btn--sm" onClick={() => go('dns')}>DNS</button></div> : null}
          <div className="hs-row"><span className="hs-row__text">Uptime, last 30 days: {UPTIME.days30}%<small>Last incident {UPTIME.incidents[0].at} · {UPTIME.incidents[0].mins} minutes · {UPTIME.incidents[0].what}</small></span></div>
          {!domains.length ? <div className="hs-row"><span className="hs-row__text">Own domain<small>None yet. Customers use {sub}.</small></span><button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => go('domains')}><Icon name="globe" width="14" height="14" aria-hidden="true" />Connect</button></div> : null}
        </div>
      </Card>
    </>
  );
}

function Usage({ now }) {
  const u = usage(now);
  const fmtDay = (t) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const pct = (a, b) => Math.min(100, Math.round((a / b) * 100));
  const over = Math.max(0, u.forecastGb - u.limits.bw);
  return (
    <>
      <MetricStrip label="This month" items={[
        { label: 'Bandwidth', value: gb(u.gb), sub: 'of ' + u.limits.bw + ' GB · ' + pct(u.gb, u.limits.bw) + '%' },
        { label: 'By month end', value: gb(u.forecastGb), sub: over ? 'over by ' + over + ' GB' : 'at this pace' },
        { label: 'Requests', value: big(u.requests), sub: 'of ' + big(u.limits.requests) },
        { label: 'Storage', value: gb(u.storage), sub: 'of ' + u.limits.storage + ' GB' },
      ]} />
      <Card title="Bandwidth by day" id="hs-bw">
        <ColumnChart label="Bandwidth by day this month, GB" data={u.byDay.map((d) => ({ label: new Date(d.day).getDate() + '', title: fmtDay(d.day), values: [d.gb] }))} series={[{ name: 'Bandwidth', color: 'var(--viz-1)' }]} fmt={(v) => (Math.round(v * 10) / 10) + ' GB'} tickFmt={(v) => Math.round(v * 10) / 10 + ''} height={200} />
      </Card>
      <Card title="Where it goes" id="hs-where">
        <div className="hs-list">
          {u.pages.map(([n, g]) => (
            <div key={n} className="hs-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
              <span className="hs-card__head"><span className="hs-row__text">{n}</span><span className="hs-sub">{gb(g)}</span></span>
              <span className="hs-bar"><i style={{ width: pct(g, u.gb || 1) + '%' }} /></span>
            </div>
          ))}
        </div>
        <p className="hs-sub">Above the plan: ৳{OVERAGE.bw} a GB of bandwidth, ৳{OVERAGE.storage} a GB of storage, billed with the subscription. Turning on WebP and AVIF (Speed & cache) saves the most.</p>
      </Card>
    </>
  );
}
