'use client';
// Merchant 360° profile (/admin/merchant?id=0031&tab=overview) — one store, every basic merchant job without leaving
// the page: the header (state, health, the next step for the state, everything else under More), then eleven tabs.
// Tabs: profile/Profile*.jsx; action sheets: profile/ProfileActions.jsx; shared bits and CSS: profile/profileShared.jsx.
// Data: lib/admin/merchants.js (rows, modules, credits, usage, licence, activity, edits) and lib/platform (billing,
// notes, the merchant view). Every change commits to the platform store, writes to the store's history and redraws.
// ?id= and ?tab= are read after mount (the server render is the outline only); the tab is kept in the address.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { StatusBadge, EmptyState } from '@/components/ui';
import { confirmDialog, toast } from '@/runtime/ui';
import { RecordHeader, IndexTabs } from '@/components/ui/IndexKit';
import { CHART_CSS } from '@/components/charts/DashCharts';
import { pad4 } from '@/lib/platform/util';
import { shopOf, subOf, subState, openInvoices, balance, resumeStore, restoreStore } from '@/lib/platform/billing';
import { merchantView } from '@/lib/platform/merchant';
import { staff } from '@/lib/platform/store';
import { sendReset } from '@/lib/platform/shops';
import { merchantRow, toneOf } from '@/lib/admin/merchants';
import { AdminShell, usePlatform } from '../AdminShell';
import { PROFILE_CSS, HEALTH_TONE } from './profile/profileShared';
import { ActionSheets } from './profile/ProfileActions';
import { OverviewTab } from './profile/ProfileOverview';
import { SubscriptionTab } from './profile/ProfileSubscription';
import { ModulesTab } from './profile/ProfileModules';
import { BillingTab, CreditsTab } from './profile/ProfileBilling';
import { MessagingTab, ResourcesTab, BusinessTab } from './profile/ProfileUsage';
import { SupportTab, ActivityTab, LicenceTab } from './profile/ProfileRecord';

const TABS = [
  ['overview', 'Overview', OverviewTab], ['subscription', 'Subscription', SubscriptionTab], ['modules', 'Modules', ModulesTab],
  ['billing', 'Billing & payments', BillingTab], ['credits', 'Credits', CreditsTab], ['messaging', 'Messaging usage', MessagingTab],
  ['resources', 'Resources', ResourcesTab], ['business', 'Business activity', BusinessTab], ['support', 'Support', SupportTab],
  ['activity', 'Activity', ActivityTab], ['licence', 'Licence', LicenceTab],
];
const TAB_KEYS = TABS.map((x) => x[0]);
const ABOUT = 'One merchant on one page: its package and bill, modules, payments, credits, messaging and resource use, its own trading, support tickets, history and licence. Every action (record a payment, change the package, give a trial or grace, add credits, turn a module on or off, suspend, pause or cancel) is under the buttons at the top or on its tab, and is written to the store’s activity.';

function Skeleton() {
  return (
    <div className="ix-page" aria-busy="true" aria-label="Loading the merchant">
      <div className="mp-skel mp-skel--head" />
      <div className="mp-skel mp-skel--tabs" />
      <div className="ix-record"><div className="mp-skel" /><div className="mp-skel" /></div>
    </div>
  );
}

export default function MerchantProfile() {
  const { db, t, live } = usePlatform();
  const [q, setQ] = useState(null);           // { id, tab } from the address, after mount
  const [sheet, setSheet] = useState(null);   // the open action sheet: { kind, n, …params }
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    let id = (p.get('id') || '').trim();
    if (/^\d{1,4}$/.test(id)) id = pad4(Number(id));
    const tab = TAB_KEYS.includes(p.get('tab')) ? p.get('tab') : 'overview';
    setQ({ id, tab });
  }, []);

  const go = (tab) => {
    setQ((x) => ({ ...x, tab }));
    try {
      const p = new URLSearchParams(window.location.search);
      p.set('id', q.id); p.set('tab', tab);
      window.history.replaceState(null, '', window.location.pathname + '?' + p.toString());
    } catch { /* ignore */ }
  };
  const open = (kind, params = {}) => setSheet({ kind, n: Date.now(), ...params });
  const close = () => setSheet(null);

  if (!live || !q) {
    return <AdminShell active="merchant" title="Merchant"><style dangerouslySetInnerHTML={{ __html: PROFILE_CSS }} /><Skeleton /></AdminShell>;
  }

  const shop = q.id ? shopOf(db, q.id) : null;
  if (!shop) {
    return (
      <AdminShell active="merchant" title="Merchant">
        <style dangerouslySetInnerHTML={{ __html: PROFILE_CSS }} />
        <div className="ix-page">
          <RecordHeader back="/admin/merchants" backLabel="Back to merchants" title="Merchant" />
          <section className="ix-card">
            <EmptyState icon="store" title={q.id ? `No store with the ID ${q.id}` : 'No store picked'} body="Check the ID, or open the store from the list." actionLabel="Back to merchants" onAction={() => { window.location.href = '/admin/merchants'; }} />
          </section>
        </div>
      </AdminShell>
    );
  }

  let ctx = null;
  let error = null;
  try {
    const sub = subOf(db, shop.id);
    const st = subState(db, shop.id, t);
    const row = merchantRow(db, shop, t);
    const view = merchantView(db, t, shop.id, staff());
    const owed = openInvoices(db, shop.id).reduce((s, i) => s + balance(db, i), 0);
    ctx = { db, t, me: staff(), shop, sub, st, row, view, owed, open, go, retry };
  } catch (e) {
    error = e;
  }

  if (error) {
    return (
      <AdminShell active="merchant" title={shop.name}>
        <style dangerouslySetInnerHTML={{ __html: PROFILE_CSS }} />
        <div className="ix-page">
          <RecordHeader back="/admin/merchants" backLabel="Back to merchants" title={shop.name} />
          <section className="ix-card"><div className="mp-err" role="alert">
            <Icon name="triangle-alert" width="24" height="24" aria-hidden="true" />
            <p style={{ margin: 0 }}>This store&rsquo;s record could not be worked out.</p>
            <button type="button" className="ix-btn" onClick={() => setRetry((n) => n + 1)}>Try again</button>
          </div></section>
        </div>
      </AdminShell>
    );
  }

  const { sub, st, row, view, owed } = ctx;
  const key = st.key;
  const late = key === 'grace' || key === 'pastdue' || (key === 'suspended' && !shop.control);
  const closed = key === 'cancelled' || key === 'archived';
  const setup = key === 'setup' || key === 'failed';
  const paying = key === 'active' || key === 'grace' || key === 'pastdue';

  // the actions
  const A = {
    pay: { label: 'Record payment', icon: 'banknote', onClick: () => open('pay') },
    plan: { label: 'Change package', icon: 'package', onClick: () => open('plan') },
    extendTrial: { label: 'Extend trial', icon: 'hourglass', onClick: () => open('trial') },
    activateTrial: { label: 'Activate trial', icon: 'hourglass', onClick: () => open('trial') },
    reactivate: { label: 'Reactivate', icon: 'power', onClick: () => (shop.control === 'suspended' ? open('control', { action: 'unsuspend' }) : open('pay')) },
    resume: { label: 'Resume store', icon: 'play', onClick: async () => { if (await confirmDialog({ title: `Resume ${shop.name}?`, body: 'The storefront opens again and billing restarts today.', confirmLabel: 'Resume' })) { resumeStore(shop.id); toast('Store resumed'); } } },
    restore: { label: 'Restore store', icon: 'archive-restore', onClick: async () => { if (await confirmDialog({ title: `Restore ${shop.name}?`, body: 'The store opens again with its data, and billing starts today.', confirmLabel: 'Restore' })) { restoreStore(shop.id); toast('Store restored'); } } },
  };
  const primary = key === 'suspended' ? A.reactivate
    : late ? A.pay
      : key === 'trial' ? A.extendTrial
        : key === 'paused' ? A.resume
          : closed ? A.restore
            : key === 'setup' ? A.activateTrial
              : key === 'failed' ? null
                : A.plan;
  const secondary = [owed > 0 && !(primary === A.reactivate && !shop.control) ? A.pay : null, closed || setup ? null : A.plan].filter((a) => a && a !== primary);
  const more = [
    { label: 'Edit details', onClick: () => open('edit') },
    key === 'trial' || primary === A.activateTrial ? null : !paying && key !== 'suspended' ? { label: 'Activate trial', onClick: () => open('trial') } : null,
    late && openInvoices(db, shop.id).some((i) => i.dueAt < t + 864e5) ? { label: 'Extend grace', onClick: () => open('grace'), tone: 'danger' } : null,
    { label: 'Add credits', onClick: () => open('credits') },
    { label: 'Enable or disable a module', onClick: () => go('modules') },
    { label: 'Assign account manager', onClick: () => open('manager') },
    { label: 'Send password reset', onClick: async () => { if (await confirmDialog({ title: 'Send a password reset link?', body: `The owner gets a reset link by SMS${shop.owner && shop.owner.phone ? ' at ' + shop.owner.phone : ''}.`, confirmLabel: 'Send link' })) { sendReset(shop.id); toast('Reset link sent by SMS'); } } },
    key === 'suspended' ? (primary === A.reactivate ? null : A.reactivate) : closed || setup ? null : { label: 'Suspend store', onClick: () => open('control', { action: 'suspend' }), tone: 'danger' },
    shop.control === 'readonly' ? { label: 'Restore full access', onClick: () => open('control', { action: 'unsuspend' }) } : null,
    key === 'paused' ? (primary === A.resume ? null : A.resume) : paying || key === 'trial' ? { label: 'Pause store', onClick: () => open('control', { action: 'pause' }), tone: 'danger' } : null,
    closed ? (primary === A.restore ? null : A.restore) : setup ? null : { label: 'Cancel store', onClick: () => open('control', { action: 'cancel' }), tone: 'danger' },
    { label: 'Review activity', onClick: () => go('activity') },
  ].filter(Boolean).map(({ icon, ...a }) => a);

  const Tab = (TABS.find((x) => x[0] === q.tab) || TABS[0])[2];
  const counts = { billing: openInvoices(db, shop.id).length || null, support: view.support.tickets.filter((x) => x.open).length || null };

  return (
    <AdminShell active="merchant" title={shop.name}>
      <style dangerouslySetInnerHTML={{ __html: PROFILE_CSS + CHART_CSS }} />
      <div className="ix-page">
        <RecordHeader back="/admin/merchants" backLabel="Back to merchants" title={shop.name} about={ABOUT}
          badges={<>
            <StatusBadge tone={toneOf(key)}>{st.label}</StatusBadge>
            <StatusBadge tone={HEALTH_TONE[row.healthTone] || 'neutral'} icon="heart-pulse">Health {row.health}</StatusBadge>
          </>}
          meta={<><span className="mp-data">#{shop.id}</span> · {row.packageName}<span className="mp-wide"> · {row.owner || 'No owner'} · {row.domain}</span></>}
          secondary={secondary} more={more} primary={primary} />

        <section className="ix-card mp-tabs" aria-label="Sections">
          <IndexTabs label="Merchant sections" tabs={TABS.map(([k, l]) => ({ key: k, id: 'mp-tab-' + k, label: l, count: counts[k], on: q.tab === k, onClick: () => go(k) }))} />
        </section>

        <div role="tabpanel" aria-labelledby={'mp-tab-' + q.tab} className="ix-page">
          <Tab ctx={ctx} />
        </div>
      </div>
      <ActionSheets sheet={sheet} ctx={ctx} close={close} />
    </AdminShell>
  );
}
