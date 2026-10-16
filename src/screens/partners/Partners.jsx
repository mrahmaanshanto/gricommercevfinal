'use client';
// Grid Partners — Services › Grid Partners (/partners; Batch E): the store browses approved models, influencers and video
// creators. Type tabs, search, and filters for niche, city, followers and budget; each card shows the photo, name with the
// blue tick, type and city, the biggest platform's followers, the from-price and availability. A card opens the profile
// (/partner?h=). Featured partners come first. Closed stores see why (marketAccess 'partners').
// Data: lib/platform/partners.js.

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { EmptyState } from '@/components/ui';
import { ShopHeader, IndexTabs, SearchField } from '@/components/ui/IndexKit';
import { livePartners, settings, TYPES, typeLabel, topPlatform, fromPrice, getRequests, SELF_SHOP } from '@/lib/platform/partners';
import { SvcFrame } from '../services/svcShared';
import { usePartners, PT_CSS, Tick, AvailBadge, TopReach, Avatar, tk } from './partnerShared';

const BANDS = [['', 'Any followers'], ['0-10000', 'Under 10K'], ['10000-50000', '10K–50K'], ['50000-200000', '50K–200K'], ['200000-', '200K or more']];
const BUDGETS = [['', 'Any budget'], ['0-10000', 'Up to ৳10,000'], ['10000-25000', '৳10,000–25,000'], ['25000-', '৳25,000 or more']];
const inBand = (v, band) => { if (!band) return true; const [a, b] = band.split('-'); return v >= Number(a || 0) && (!b || v < Number(b)); };

const CSS = `
.pt-filters{display:flex;flex-wrap:wrap;gap:var(--space-2);padding:var(--space-2) var(--space-4);border-bottom:1px solid var(--border-subtle)}
.pt-filters>.ix-search,.pt-filters>div:first-child{flex:2 1 240px}
.pt-filters select{flex:1 1 150px;width:auto;min-width:0}
.pt-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:var(--space-3);padding:var(--space-4)}
.pt-card{display:flex;flex-direction:column;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);overflow:hidden;color:inherit;text-decoration:none;box-shadow:0 1px 2px rgba(15,23,42,.04)}
.pt-card:hover,.pt-card:focus-visible{border-color:var(--primary)}
.pt-card__pic{position:relative;aspect-ratio:4/3;overflow:hidden;background:var(--surface-subtle)}
.pt-card__pic img{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover;object-position:center 22%}
.pt-card__pic .pt-av{position:absolute;inset:0;width:100%!important;height:100%!important;border-radius:0}
.pt-card__feat{position:absolute;left:8px;top:8px;display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 10px;border-radius:var(--radius-full);background:var(--surface-card);color:var(--primary);font-size:var(--text-xs);font-weight:var(--weight-medium);box-shadow:0 1px 4px rgba(15,23,42,.18)}
.pt-card__body{display:flex;flex-direction:column;gap:4px;padding:var(--space-3) var(--space-3) 0}
.pt-card__name{display:flex;align-items:center;gap:4px;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pt-card__line{font-size:var(--text-xs);color:var(--text-muted)}
.pt-card__foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px;margin-top:auto;padding:var(--space-3)}
.pt-card__price{font-size:var(--text-xs);color:var(--text-muted)}
.pt-card__price b{font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
@media (max-width:640px){.pt-cards{grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2);padding:var(--space-3)}.pt-filters select{flex:1 1 calc(50% - 8px)}.pt-card__foot{padding:var(--space-2) var(--space-3) var(--space-3)}}
`;

function Card({ p }) {
  const fp = fromPrice(p);
  return (
    <Link href={'/partner?h=' + p.handle} className="pt-card" aria-label={`${p.name}, ${typeLabel(p.type)}`}>
      <div className="pt-card__pic">
        {p.photo ? <img src={p.photo} alt="" loading="lazy" /> : <Avatar p={p} size={120} />}
        {p.featured ? <span className="pt-card__feat"><Icon name="sparkles" width="12" height="12" aria-hidden="true" />Featured</span> : null}
      </div>
      <div className="pt-card__body">
        <span className="pt-card__name">{p.name}{p.verified ? <Tick size={14} /> : null}</span>
        <span className="pt-card__line">{typeLabel(p.type)} · {p.city}</span>
        <TopReach p={p} />
      </div>
      <div className="pt-card__foot">
        <span className="pt-card__price">{fp ? <>From <b>{tk(fp)}</b></> : 'Ask for a price'}</span>
        <AvailBadge a={p.availability} />
      </div>
    </Link>
  );
}

export default function Partners() {
  const { ready, tick } = usePartners();
  const [type, setType] = useState('all');
  const [q, setQ] = useState('');
  const [f, setF] = useState({ niche: '', city: '', band: '', budget: '' });
  const list = useMemo(() => (ready ? livePartners().slice().sort((a, b) => (b.featured - a.featured) || (b.verified - a.verified) || ((topPlatform(b) || { followers: 0 }).followers - (topPlatform(a) || { followers: 0 }).followers)) : []), [ready, tick]);
  const st = ready ? settings() : { niches: [], cities: [] };
  const open = ready ? getRequests({ shopId: SELF_SHOP }).filter((r) => ['sent', 'accepted'].includes(r.status)).length : 0;
  const words = q.trim().toLowerCase();
  const shown = list.filter((p) => (type === 'all' || p.type === type)
    && (!words || [p.name, p.handle, p.city, p.bio, ...(p.niches || [])].join(' ').toLowerCase().includes(words))
    && (!f.niche || (p.niches || []).includes(f.niche)) && (!f.city || p.city === f.city)
    && inBand((topPlatform(p) || { followers: 0 }).followers, f.band) && inBand(fromPrice(p), f.budget));
  const tabs = [{ key: 'all', id: 'pt-tab-all', label: 'All', count: ready ? list.length : null, on: type === 'all', onClick: () => setType('all') },
    ...Object.entries(TYPES).map(([k, t]) => ({ key: k, id: 'pt-tab-' + k, label: t.plural, count: ready ? list.filter((p) => p.type === k).length : null, on: type === k, onClick: () => setType(k) }))];
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const any = Object.values(f).some(Boolean) || words;
  return (
    <SvcFrame gate="partners" screen="Partners" active="gp-browse" page="Grid Partners" css={PT_CSS + CSS}>
      <ShopHeader icon="users-round" title="Grid Partners"
        about="Grid Partners: models, influencers and video creators who work with online shops. Every partner is checked by GridCommerce (followers, sample work, phone and ID) before they show here. Open a profile to see their work and rate card, then send Request a quote. Once the partner accepts, you both see each other’s phone and email and agree the work directly. GridCommerce does not take a fee or handle the payment."
        primary={{ label: open ? `My requests (${open})` : 'My requests', icon: 'inbox', href: '/partner-requests' }} />
      <section className="ix-card" aria-label="Partners">
        <div className="ix-bar"><IndexTabs tabs={tabs} label="Partner type" /></div>
        <div className="pt-filters">
          <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, niche or city" />
          <select className="gc-input gc-select" value={f.niche} onChange={set('niche')} aria-label="Niche"><option value="">Any niche</option>{st.niches.map((n) => <option key={n} value={n}>{n}</option>)}</select>
          <select className="gc-input gc-select" value={f.city} onChange={set('city')} aria-label="City"><option value="">Any city</option>{st.cities.map((n) => <option key={n} value={n}>{n}</option>)}</select>
          <select className="gc-input gc-select" value={f.band} onChange={set('band')} aria-label="Followers">{BANDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          <select className="gc-input gc-select" value={f.budget} onChange={set('budget')} aria-label="Budget">{BUDGETS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        </div>
        {!ready ? <div style={{ minHeight: 360 }} aria-busy="true" /> : shown.length ? (
          <div className="pt-cards">{shown.map((p) => <Card key={p.id} p={p} />)}</div>
        ) : <div className="ix-empty"><EmptyState icon="users-round" title="No partners match" body={any ? 'Try fewer filters.' : 'New partners show here once approved.'} actionLabel={any ? 'Clear filters' : undefined} onAction={any ? () => { setF({ niche: '', city: '', band: '', budget: '' }); setQ(''); } : undefined} /></div>}
        {ready ? <div className="ix-foot"><span>{shown.length} of {list.length} partners</span></div> : null}
      </section>
    </SvcFrame>
  );
}
