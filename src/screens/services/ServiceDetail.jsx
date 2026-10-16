'use client';
// Service — one service on its own page, like a Fiverr gig (/service-detail?id=seo; Batch D): the cover and gallery
// (tap a picture to see it large, arrow keys move), what you get, proof of work (real results), who does the work, what
// other shops said, questions; at the side the packages as tabs (price with VAT, delivery days, changes included, what
// it covers) with Continue, add-ons and how it works (on phones a bar at the bottom jumps to the packages). Continue orders it (/service-order?id=&pkg=). A service that needs
// to work inside the store says what it will ask to open. Data: lib/platform/services.js.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { EmptyState, PhoneActionBar } from '@/components/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import { serviceById, ratingOf, catName, areaLabel, settings, getExperts, getOrders, loadOf } from '@/lib/platform/services';
import { SvcFrame, useServices, tk, query, Stars, daysWord, shortDate } from './svcShared';

export const GIG_CSS = `
.sd-hero{position:relative;aspect-ratio:16/9;border-radius:var(--radius-xl);overflow:hidden;background:var(--surface-subtle)}
.sd-hero button{all:unset;display:block;width:100%;height:100%;cursor:zoom-in}
.sd-hero button:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.sd-hero img{display:block;width:100%;height:100%;object-fit:cover;object-position:top center}
.sd-hero figcaption{position:absolute;left:0;right:0;bottom:0;padding:24px 16px 10px;background:linear-gradient(transparent,rgba(15,23,42,.72));color:var(--text-on-dark);font-size:var(--text-sm)}
.sd-tile{display:grid;place-items:center;width:100%;height:100%;background:linear-gradient(135deg,var(--fill-primary-soft),var(--surface-subtle));color:var(--primary)}
.sd-thumbs{display:flex;gap:var(--space-2);overflow-x:auto;padding:2px 2px 4px;scrollbar-width:thin}
.sd-thumbs button{flex:none;width:96px;aspect-ratio:16/10;padding:0;border:2px solid transparent;border-radius:var(--radius-lg);background:var(--surface-subtle) center/cover no-repeat;cursor:pointer}
.sd-thumbs button.is-on{border-color:var(--primary)}
.sd-thumbs button:focus-visible{outline:2px solid var(--primary);outline-offset:1px}
.sd-proof{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:var(--space-3)}
.sd-proof article{display:flex;flex-direction:column;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);overflow:hidden;background:var(--surface-card)}
.sd-proof article button{all:unset;display:block;aspect-ratio:16/10;background:var(--surface-subtle) top center/cover no-repeat;cursor:zoom-in}
.sd-proof article button:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.sd-proof article div{display:flex;flex-direction:column;gap:4px;padding:var(--space-3)}
.sd-proof b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sd-proof small{font-size:var(--text-xs);color:var(--text-muted)}
.sd-result{display:flex;gap:6px;align-items:flex-start;font-size:var(--text-sm);color:var(--text-success)}
.sd-result svg{flex:none;margin-top:3px}
.sd-people{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.sd-people li{display:flex;align-items:center;gap:var(--space-3);padding:10px 0;border-top:1px solid var(--border-subtle)}
.sd-people li:first-child{border-top:0}
.sd-av{display:grid;place-items:center;flex:none;width:40px;height:40px;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary);font-size:var(--text-sm);font-weight:var(--weight-semibold)}
.sd-people span:nth-child(2){flex:1;min-width:0;display:flex;flex-direction:column}
.sd-people b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.sd-people small{font-size:var(--text-xs);color:var(--text-muted)}
.sd-revs{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.sd-revs li{display:flex;flex-direction:column;gap:4px;padding:var(--space-3) 0;border-top:1px solid var(--border-subtle)}
.sd-revs li:first-child{border-top:0;padding-top:0}
.sd-revs header{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;font-size:var(--text-xs);color:var(--text-muted)}
.sd-revs header b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.sd-revs p{font-size:var(--text-sm);color:var(--text-body)}
.sd-score{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-body)}
.sd-score b{font-family:var(--font-data);font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sd-buy{display:flex;flex-direction:column}
.sd-tabs{display:flex;border-bottom:1px solid var(--border-subtle)}
.sd-tabs button{flex:1;min-height:44px;border:0;border-bottom:2px solid transparent;background:none;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-muted);cursor:pointer}
.sd-tabs button[aria-selected="true"]{color:var(--text-heading);border-bottom-color:var(--primary)}
.sd-tabs button:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.sd-pkg{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4)}
.sd-pkg__top{display:flex;justify-content:space-between;align-items:baseline;gap:var(--space-2)}
.sd-pkg__top b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sd-price{font-family:var(--font-data);font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap}
.sd-facts{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:var(--text-sm);color:var(--text-body)}
.sd-facts span{display:inline-flex;align-items:center;gap:6px}
.sd-facts svg{color:var(--text-muted)}
.sd-lightbox{position:fixed;inset:0;z-index:1200;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--space-3);padding:56px 16px 24px;background:rgba(15,23,42,.88)}
.sd-lightbox img{max-width:min(1200px,100%);max-height:calc(100vh - 160px);border-radius:var(--radius-lg);object-fit:contain;background:var(--surface-card)}
.sd-lightbox p{margin:0;color:var(--text-on-dark);font-size:var(--text-sm);text-align:center}
.sd-lightbox .sd-lb-btn{position:absolute;display:grid;place-items:center;width:44px;height:44px;border:0;border-radius:var(--radius-full);background:rgba(255,255,255,.14);color:var(--text-on-dark);cursor:pointer}
.sd-lightbox .sd-lb-btn:focus-visible{outline:2px solid var(--text-on-dark)}
.sd-lb-close{top:12px;right:12px}.sd-lb-prev{left:12px;top:50%}.sd-lb-next{right:12px;top:50%}
@media (min-width:1024px){.sd-side{position:sticky;top:72px}}
@media (max-width:640px){.sd-thumbs button{width:80px}.sd-lightbox .sd-lb-prev,.sd-lightbox .sd-lb-next{top:auto;bottom:16px}}
`;

const initials = (n) => String(n || '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
/** "Rongdhonu F." — another shop's name, shortened. */
const shopShort = (n) => { const w = String(n || '').split(/\s+/); return w.length > 1 ? `${w[0]} ${w[1][0]}.` : w[0]; };

/** A picture shown large; arrows move, Esc closes. */
export function Lightbox({ pics, at, onAt, onClose }) {
  useEffect(() => {
    if (at == null) return undefined;
    const k = (e) => { if (e.key === 'Escape') onClose(); else if (e.key === 'ArrowRight') onAt((at + 1) % pics.length); else if (e.key === 'ArrowLeft') onAt((at - 1 + pics.length) % pics.length); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [at, pics.length, onAt, onClose]);
  if (at == null || !pics[at]) return null;
  const p = pics[at];
  return (
    <div className="sd-lightbox" role="dialog" aria-modal="true" aria-label={p.caption || 'Picture'} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <button type="button" className="sd-lb-btn sd-lb-close" aria-label="Close" autoFocus onClick={onClose}><Icon name="x" width="20" height="20" /></button>
      {pics.length > 1 ? <button type="button" className="sd-lb-btn sd-lb-prev" aria-label="Previous picture" onClick={() => onAt((at - 1 + pics.length) % pics.length)}><Icon name="chevron-left" width="20" height="20" /></button> : null}
      <img src={p.src} alt={p.caption || ''} />
      <p>{p.caption}{pics.length > 1 ? ` · ${at + 1} of ${pics.length}` : ''}</p>
      {pics.length > 1 ? <button type="button" className="sd-lb-btn sd-lb-next" aria-label="Next picture" onClick={() => onAt((at + 1) % pics.length)}><Icon name="chevron-right" width="20" height="20" /></button> : null}
    </div>
  );
}

export default function ServiceDetail() {
  const { ready, tick } = useServices();
  const s = ready ? serviceById(query('id')) : null;
  const [pkgAt, setPkgAt] = useState(null);
  const [shown, setShown] = useState(0);
  const [big, setBig] = useState(null);       // index into `all` for the lightbox
  const data = useMemo(() => {
    if (!s) return null;
    const orders = getOrders().filter((o) => o.serviceId === s.id);
    const revs = [];
    orders.forEach((o) => {
      if (o.rating) revs.push({ shop: o.shopName, stars: o.rating.stars, text: o.rating.text, at: o.rating.at });
      (o.reports || []).forEach((r) => { if (r.rating) revs.push({ shop: o.shopName, stars: r.rating.stars, text: r.rating.text, at: r.at, note: `Month ${r.month} report` }); });
    });
    const people = getExperts().filter((e) => e.active && e.skills.includes(s.id)).map((e) => ({ e, done: getOrders().filter((o) => o.expertId === e.id && ['closed', 'delivered'].includes(o.status)).length, load: loadOf(e.id) }));
    return { revs: revs.sort((a, b) => (b.at || 0) - (a.at || 0)), people };
  }, [s, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return <SvcFrame gate="services" screen="ServiceDetail" active="svc-shop" page="Service"><div style={{ minHeight: 400 }} aria-busy="true" /></SvcFrame>;
  if (!s || s.status !== 'live') {
    return (
      <SvcFrame gate="services" screen="ServiceDetail" active="svc-shop" page="Service" narrow>
        <RecordHeader back="/services" backLabel="Services" title="Service not found" />
        <section className="ix-card ix-empty"><EmptyState icon="briefcase" title="This service is not on sale" body="It may be paused for now." actionLabel="See all services" onAction={() => { window.location.href = '/services'; }} /></section>
      </SvcFrame>
    );
  }
  const r = ratingOf(s.id);
  const vat = settings().vatPct;
  const monthly = s.cycle === 'monthly';
  const gallery = (s.gallery || []).length ? s.gallery : s.cover ? [{ src: s.cover, caption: '' }] : [];
  const proof = s.proof || [];
  const all = [...gallery, ...proof.filter((p) => p.src).map((p) => ({ src: p.src, caption: [p.title, p.result].filter(Boolean).join(' · ') }))];
  const def = Math.min(1, s.packages.length - 1);
  const pi = pkgAt == null ? def : pkgAt;
  const p = s.packages[pi];
  const cur = gallery[Math.min(shown, Math.max(0, gallery.length - 1))];

  return (
    <SvcFrame gate="services" screen="ServiceDetail" active="svc-shop" page={s.name} css={GIG_CSS}
      after={<>
        <Lightbox pics={all} at={big} onAt={setBig} onClose={() => setBig(null)} />
        <PhoneActionBar label="Order" note={<>From <b>{tk(Math.min(...s.packages.map((x) => x.price)))}</b>{monthly ? ' a month' : ''}</>}>
          <button type="button" className="gc-btn gc-btn--solid" onClick={() => { const n = document.getElementById('sd-pkg'); if (n) n.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}>See packages</button>
        </PhoneActionBar>
      </>}>
      <RecordHeader back="/services" backLabel="Services" title={s.name}
        badges={<span className="gc-badge gc-badge--slate">{monthly ? 'Monthly' : 'One-time'}</span>}
        meta={<>{catName(s.cat)}{r.count ? <> · <Stars value={r.avg} size={12} /> {r.avg.toFixed(1)} from {r.count} rating{r.count === 1 ? '' : 's'}</> : ' · New service'}</>}
        about={s.blurb} />
      <div className="ix-record">
        <div className="ix-main">
          <section className="ix-card svc-pad" aria-label="Pictures">
            <figure className="sd-hero" style={{ margin: 0 }}>
              {cur ? (
                <button type="button" onClick={() => setBig(Math.min(shown, gallery.length - 1))} aria-label={'See larger' + (cur.caption ? ': ' + cur.caption : '')}><img src={cur.src} alt={cur.caption || s.name} /></button>
              ) : <span className="sd-tile" aria-hidden="true"><Icon name={s.icon || 'briefcase'} width="56" height="56" /></span>}
              {cur && cur.caption ? <figcaption>{cur.caption}</figcaption> : null}
            </figure>
            {gallery.length > 1 ? (
              <div className="sd-thumbs" role="group" aria-label="Gallery">
                {gallery.map((g, i) => <button key={i} type="button" className={i === shown ? 'is-on' : ''} aria-pressed={i === shown} aria-label={g.caption || 'Picture ' + (i + 1)} style={{ backgroundImage: `url(${g.src})` }} onClick={() => setShown(i)} />)}
              </div>
            ) : null}
          </section>

          <section className="ix-card svc-pad" aria-labelledby="sd-get">
            <h2 id="sd-get">About this service</h2>
            <p style={{ color: 'var(--text-body)' }}>{s.blurb}</p>
            <ul className="svc-list">{(s.gets || []).map((g) => <li key={g}><Icon name="check" width="14" height="14" aria-hidden="true" />{g}</li>)}</ul>
            {s.brief.some((f) => f.id === 'spend') ? <p className="svc-note"><Icon name="info" width="16" height="16" aria-hidden="true" />Ad spend is not in the price: you pay Meta or Google for the ads directly. Our fee is for running them.</p> : null}
          </section>

          {proof.length || (s.samples || []).length ? (
            <section className="ix-card svc-pad" aria-labelledby="sd-proof">
              <h2 id="sd-proof">Proof of work</h2>
              {proof.length ? (
                <div className="sd-proof">
                  {proof.map((x, i) => (
                    <article key={i}>
                      {x.src ? <button type="button" aria-label={'See larger: ' + (x.title || 'proof of work')} style={{ backgroundImage: `url(${x.src})` }} onClick={() => setBig(gallery.length + proof.slice(0, i).filter((y) => y.src).length)} /> : null}
                      <div>
                        <b>{x.title}</b>
                        {x.client ? <small>{x.client}</small> : null}
                        {x.result ? <span className="sd-result"><Icon name="trending-up" width="14" height="14" aria-hidden="true" />{x.result}</span> : null}
                      </div>
                    </article>
                  ))}
                </div>
              ) : <ul className="svc-list">{s.samples.map((x) => <li key={x}><Icon name="award" width="14" height="14" aria-hidden="true" />{x}</li>)}</ul>}
            </section>
          ) : null}

          {data && data.people.length ? (
            <section className="ix-card svc-pad" aria-labelledby="sd-who">
              <h2 id="sd-who">Who does the work</h2>
              <ul className="sd-people">
                {data.people.map(({ e, done }) => (
                  <li key={e.id}>
                    <span className="sd-av" aria-hidden="true">{initials(e.name)}</span>
                    <span><b>{e.name}</b><small>{e.kind === 'partner' ? 'GridCommerce partner' : 'GridCommerce team'}{done ? ` · ${done} order${done === 1 ? '' : 's'} done` : ''}</small></span>
                    {e.rating ? <span className="svc-meta"><Stars value={e.rating} size={12} /> {e.rating.toFixed(1)}</span> : null}
                  </li>
                ))}
              </ul>
              <p className="gc-help" style={{ margin: 0 }}>GridCommerce picks who is free and best for your brief; a lead checks the work before you see it.</p>
            </section>
          ) : null}

          <section className="ix-card svc-pad" aria-labelledby="sd-rev">
            <h2 id="sd-rev">What shops said</h2>
            {data && data.revs.length ? (<>
              <div className="sd-score"><b>{r.avg.toFixed(1)}</b><Stars value={r.avg} /><span>{r.count} rating{r.count === 1 ? '' : 's'}</span></div>
              <ul className="sd-revs">
                {data.revs.slice(0, 6).map((v, i) => (
                  <li key={i}>
                    <header><b>{shopShort(v.shop)}</b><Stars value={v.stars} size={12} />{v.note ? <span>{v.note}</span> : null}<span>{shortDate(v.at)}</span></header>
                    {v.text ? <p>{v.text}</p> : null}
                  </li>
                ))}
              </ul>
            </>) : <p className="gc-help" style={{ margin: 0 }}>No ratings yet. Shops rate the work when it is done.</p>}
          </section>

          {(s.faq || []).length ? (
            <section className="ix-card svc-pad" aria-labelledby="sd-faq">
              <h2 id="sd-faq">Questions</h2>
              {s.faq.map((f) => <details key={f.q} className="gc-disclose"><summary>{f.q}</summary><p style={{ marginTop: 6, color: 'var(--text-body)' }}>{f.a}</p></details>)}
            </section>
          ) : null}
        </div>

        <aside className="ix-side" aria-label="Packages">
          <div className="sd-side" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <section className="ix-card sd-buy" aria-label="Choose a package">
              {s.packages.length > 1 ? (
                <div className="sd-tabs" role="tablist" aria-label="Packages">
                  {s.packages.map((x, i) => <button key={x.id} type="button" role="tab" id={'sd-tab-' + x.id} aria-selected={i === pi} aria-controls="sd-pkg" onClick={() => setPkgAt(i)}>{x.name}</button>)}
                </div>
              ) : null}
              <div className="sd-pkg" id="sd-pkg" role={s.packages.length > 1 ? 'tabpanel' : undefined} aria-labelledby={s.packages.length > 1 ? 'sd-tab-' + p.id : undefined}>
                <div className="sd-pkg__top"><b>{p.name}</b><span className="sd-price">{tk(p.price)}</span></div>
                <span className="gc-help" style={{ margin: 0 }}>{monthly ? 'a month' : 'once'} + {vat}% VAT · {tk(Math.round(p.price * (1 + vat / 100)))} in all</span>
                <span className="sd-facts">
                  <span><Icon name="clock" width="14" height="14" aria-hidden="true" />{monthly ? 'Report every month' : daysWord(p.days) + ' delivery'}</span>
                  <span><Icon name="refresh-cw" width="14" height="14" aria-hidden="true" />{p.revisions ? p.revisions + (p.revisions === 1 ? ' change' : ' changes') : 'No changes'}</span>
                </span>
                <ul className="svc-list">{p.includes.map((x) => <li key={x}><Icon name="check" width="14" height="14" aria-hidden="true" />{x}</li>)}</ul>
                <Link href={`/service-order?id=${s.id}&pkg=${p.id}`} className="gc-btn gc-btn--solid" style={{ textDecoration: 'none' }}>Continue · {tk(p.price)}<Icon name="arrow-right" width="16" height="16" aria-hidden="true" /></Link>
                {s.addons && s.addons.length ? (
                  <div>
                    <span className="gc-label">Add-ons (pick them next)</span>
                    <ul className="svc-list">{s.addons.map((a) => <li key={a.id}><Icon name="plus" width="14" height="14" aria-hidden="true" style={{ color: 'var(--text-muted)' }} />{a.name} · {tk(a.price)}</li>)}</ul>
                  </div>
                ) : null}
              </div>
            </section>
            <section className="ix-card svc-pad">
              <h2>How it works</h2>
              <ol className="svc-howto">
                <li>Pick a package and answer a short brief.</li>
                <li>Pay with bKash, Nagad, card or GridCommerce credits.</li>
                <li>An expert starts within one working day. Follow the updates in My services.</li>
                <li>{monthly ? 'Each month you get a report to approve.' : 'You approve the work, or ask for a change.'}</li>
              </ol>
              {s.access && s.access.needed ? <p className="svc-note"><Icon name="key-round" width="16" height="16" aria-hidden="true" />The expert will ask to open {areaLabel(s.access.area).toLowerCase()} of your store, for up to {s.access.minutes} minutes at a time. You approve each time; every change is logged.</p> : null}
              {monthly ? <p className="gc-help" style={{ margin: 0 }}>The first month is paid now; the next months are billed with your subscription. Stop any time: it ends with the month you are in.</p> : null}
              <p className="gc-help" style={{ margin: 0 }}>Need something not listed? <Link href="/my-services?ask=1">Ask for a custom offer</Link>.</p>
            </section>
          </div>
        </aside>
      </div>
    </SvcFrame>
  );
}
