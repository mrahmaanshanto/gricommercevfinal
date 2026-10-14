'use client';
// Services — Services › Get expert help (/services): what GridCommerce's experts can do for the shop, by category (Grow
// sales · Look · Setup · Content). Each card: what it is, the starting price (a month for SEO and ads), delivery time and
// rating; it opens the service (/service-detail?id=). What a shop sees follows its edition and plan (set in super admin).
// Orders in progress are one line at the top, linking My services. Data: lib/platform/services.js.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { EmptyState } from '@/components/ui';
import { ShopHeader, IndexTabs } from '@/components/ui/IndexKit';
import { currentEditionId } from '@/lib/edition';
import { currentPlanId } from '@/lib/plans';
import { CATS, catalogFor, ratingOf, getOrders, stateOf, SELF_SHOP } from '@/lib/platform/services';
import { SvcFrame, useServices, tk, Stars, daysWord } from './svcShared';

export default function Services() {
  const { ready, tick } = useServices();
  const [cat, setCat] = useState('all');
  const list = useMemo(() => (ready ? catalogFor({ edition: currentEditionId(), plan: currentPlanId() }) : []), [ready, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const mine = useMemo(() => (ready ? getOrders(SELF_SHOP).map((o) => ({ o, st: stateOf(o) })) : []), [ready, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const active = mine.filter((x) => !['closed', 'cancelled', 'refunded'].includes(x.st.status));
  const needs = mine.filter((x) => x.st.status === 'waiting' || x.st.status === 'delivered' || (x.o.quotes || []).some((q) => q.status === 'sent'));
  const shown = list.filter((s) => cat === 'all' || s.cat === cat);
  const tabs = [{ key: 'all', id: 'svc-tab-all', label: 'All', count: ready ? list.length : null, on: cat === 'all', onClick: () => setCat('all') },
    ...CATS.map((c) => ({ key: c.id, id: 'svc-tab-' + c.id, label: c.name, count: ready ? list.filter((s) => s.cat === c.id).length : null, on: cat === c.id, onClick: () => setCat(c.id) }))];

  return (
    <SvcFrame screen="Services" active="svc-shop" page="Get expert help">
      <ShopHeader icon="briefcase-business" title="Get expert help"
        about="Experts from GridCommerce and its partners do the work for you: SEO, Meta and Google ads, branding, store design, product upload, moving from another platform, store setup and product writing. Pick a package, answer a short brief and pay; an expert is assigned within a working day. You follow the work, message the expert and approve it in My services."
        primary={{ label: active.length ? `My services (${active.length})` : 'My services', href: '/my-services' }} />
      {needs.length ? (
        <Link href="/my-services?tab=you" className="svc-note" style={{ textDecoration: 'none', background: 'var(--fill-warning-soft)' }}>
          <Icon name="bell-dot" width="16" height="16" aria-hidden="true" style={{ color: 'var(--text-warning)' }} />
          <span><b style={{ fontWeight: 'var(--weight-medium)' }}>{needs.length === 1 ? '1 order needs you' : needs.length + ' orders need you'}</b> · {needs.map((x) => x.st.svc.name).join(', ')}</span>
        </Link>
      ) : null}
      <section className="ix-card" aria-label="Services">
        <div className="ix-bar"><IndexTabs tabs={tabs} label="Service categories" /></div>
        {!ready ? <div style={{ minHeight: 320 }} aria-busy="true" /> : shown.length ? (
          <div className="svc-pad">
            <div className="svc-grid">
              {shown.map((s) => {
                const from = Math.min(...s.packages.map((p) => p.price));
                const r = ratingOf(s.id);
                const fast = Math.min(...s.packages.map((p) => p.days));
                return (
                  <Link key={s.id} href={'/service-detail?id=' + s.id} className="svc-card">
                    <span className="svc-card__top"><span className="svc-ico" aria-hidden="true"><Icon name={s.icon || 'briefcase'} width="18" height="18" /></span><b>{s.name}</b></span>
                    <p>{s.blurb}</p>
                    <span className="svc-card__foot">
                      <span><span className="svc-price">From {tk(from)}</span>{s.cycle === 'monthly' ? ' a month' : ''}</span>
                      <span>{s.cycle === 'monthly' ? 'Monthly' : 'From ' + daysWord(fast)}</span>
                      {r.count ? <span><Stars value={r.avg} size={12} /> {r.avg.toFixed(1)} ({r.count})</span> : <span>New</span>}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : <div className="ix-empty"><EmptyState icon="briefcase" title="No services here yet" body="Try another category." /></div>}
      </section>
    </SvcFrame>
  );
}
