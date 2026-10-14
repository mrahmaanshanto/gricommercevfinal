'use client';
// Service — one service (/service-detail?id=seo): what you get, the packages side by side (price with VAT, delivery
// days, changes included, what each covers), add-ons, how it works, sample work, questions and the rating. Choose a
// package to order it (/service-order?id=&pkg=). A service that needs to work inside the store says what it will ask to
// open (the owner approves it later, for a set time). Data: lib/platform/services.js.

import React from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { EmptyState } from '@/components/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import { serviceById, ratingOf, catName, areaLabel, settings } from '@/lib/platform/services';
import { SvcFrame, useServices, tk, query, Stars, daysWord } from './svcShared';

export default function ServiceDetail() {
  const { ready } = useServices();
  const s = ready ? serviceById(query('id')) : null;
  if (!ready) return <SvcFrame screen="ServiceDetail" active="svc-shop" page="Service"><div style={{ minHeight: 400 }} aria-busy="true" /></SvcFrame>;
  if (!s || s.status !== 'live') {
    return (
      <SvcFrame screen="ServiceDetail" active="svc-shop" page="Service" narrow>
        <RecordHeader back="/services" backLabel="Services" title="Service not found" />
        <section className="ix-card ix-empty"><EmptyState icon="briefcase" title="This service is not on sale" body="It may be paused for now." actionLabel="See all services" onAction={() => { window.location.href = '/services'; }} /></section>
      </SvcFrame>
    );
  }
  const r = ratingOf(s.id);
  const vat = settings().vatPct;
  const monthly = s.cycle === 'monthly';
  return (
    <SvcFrame screen="ServiceDetail" active="svc-shop" page={s.name}>
      <RecordHeader back="/services" backLabel="Services" title={s.name}
        badges={<span className="gc-badge gc-badge--slate">{monthly ? 'Monthly' : 'One-time'}</span>}
        meta={<>{catName(s.cat)}{r.count ? <> · <Stars value={r.avg} size={12} /> {r.avg.toFixed(1)} from {r.count} rating{r.count === 1 ? '' : 's'}</> : ' · New service'}</>}
        about={s.blurb} />
      <div className="ix-record">
        <div className="ix-main">
          <section className="ix-card svc-pad" aria-labelledby="sd-get">
            <h2 id="sd-get">What you get</h2>
            <p style={{ color: 'var(--text-body)' }}>{s.blurb}</p>
            <ul className="svc-list">{(s.gets || []).map((g) => <li key={g}><Icon name="check" width="14" height="14" aria-hidden="true" />{g}</li>)}</ul>
          </section>
          <section className="ix-card svc-pad" aria-labelledby="sd-pkgs">
            <h2 id="sd-pkgs">Packages</h2>
            <div className="svc-pkgs">
              {s.packages.map((p, i) => (
                <div key={p.id} className={'svc-pkg' + (i === Math.min(1, s.packages.length - 1) ? ' is-on' : '')}>
                  <h3>{p.name}</h3>
                  <span className="svc-pkg__price">{tk(p.price)} <small>{monthly ? 'a month' : 'once'} + {vat}% VAT</small></span>
                  <span className="svc-meta"><span>{monthly ? 'Report every month' : 'Delivered in ' + daysWord(p.days)}</span><span>{p.revisions ? p.revisions + (p.revisions === 1 ? ' change' : ' changes') + ' included' : 'No changes'}</span></span>
                  <ul>{p.includes.map((x) => <li key={x}><Icon name="check" width="14" height="14" aria-hidden="true" />{x}</li>)}</ul>
                  <Link href={`/service-order?id=${s.id}&pkg=${p.id}`} className={'gc-btn gc-btn--sm ' + (i === Math.min(1, s.packages.length - 1) ? 'gc-btn--solid' : 'gc-btn--neutral')} style={{ marginTop: 'auto', textDecoration: 'none' }}>Choose {p.name}</Link>
                </div>
              ))}
            </div>
            {s.addons && s.addons.length ? (
              <div>
                <span className="gc-label">Add-ons (pick them when you order)</span>
                <ul className="svc-list">{s.addons.map((a) => <li key={a.id}><Icon name="plus" width="14" height="14" aria-hidden="true" style={{ color: 'var(--text-muted)' }} />{a.name} · {tk(a.price)}</li>)}</ul>
              </div>
            ) : null}
            {s.brief.some((f) => f.id === 'spend') ? <p className="svc-note"><Icon name="info" width="16" height="16" aria-hidden="true" />Ad spend is not in the price: you pay Meta or Google for the ads directly. Our fee is for running them.</p> : null}
          </section>
          {(s.faq || []).length ? (
            <section className="ix-card svc-pad" aria-labelledby="sd-faq">
              <h2 id="sd-faq">Questions</h2>
              {s.faq.map((f) => <details key={f.q} className="gc-disclose"><summary>{f.q}</summary><p style={{ marginTop: 6, color: 'var(--text-body)' }}>{f.a}</p></details>)}
            </section>
          ) : null}
        </div>
        <aside className="ix-side" aria-label="How it works">
          <section className="ix-card svc-pad">
            <h2>How it works</h2>
            <ol className="svc-howto">
              <li>Pick a package and answer a short brief.</li>
              <li>Pay with bKash, Nagad, card or GridCommerce credits.</li>
              <li>An expert starts within one working day.</li>
              <li>{monthly ? 'Each month you get a report to approve.' : 'You approve the work, or ask for a change.'}</li>
            </ol>
            {s.access && s.access.needed ? <p className="svc-note"><Icon name="key-round" width="16" height="16" aria-hidden="true" />The expert will ask to open {areaLabel(s.access.area).toLowerCase()} of your store, for up to {s.access.minutes} minutes at a time. You approve each time; every change is logged.</p> : null}
            {monthly ? <p className="gc-help" style={{ margin: 0 }}>The first month is paid now; the next months are billed with your subscription. Stop any time: it ends with the month you are in.</p> : null}
          </section>
          {(s.samples || []).length ? (
            <section className="ix-card svc-pad">
              <h2>Sample work</h2>
              <ul className="svc-list">{s.samples.map((x) => <li key={x}><Icon name="award" width="14" height="14" aria-hidden="true" />{x}</li>)}</ul>
            </section>
          ) : null}
        </aside>
      </div>
    </SvcFrame>
  );
}
