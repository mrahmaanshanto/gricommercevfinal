'use client';
// Services › New custom offer (/admin/service-offer?shop=&request=; Batch D): an instant service for one store when it
// asks for work that is not in the catalogue. Store (or the store's request it answers), what the work is and what is
// included, price before VAT, days to deliver from payment, changes included, category, cover picture, who does it
// (an expert or a team, or choose after payment) and how long the offer is valid. Making it opens the order with the
// payment link to send (email, SMS, WhatsApp, social); the store pays to confirm. Data: lib/platform/services.js.

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import { createOffer, getRequests, getExperts, getTeams, CATS, settings } from '@/lib/platform/services';
import { canUse } from '@/lib/platform/marketAccess';
import { staff } from '@/lib/platform/store';
import { AdminShell, usePlatform } from '../AdminShell';
import { useSvc, qp, tk, SVA_CSS } from './svcAdmin';
import { PicturePicker, MEDIA_CSS } from './SvcMedia';

const lines = (v) => String(v || '').split('\n').map((x) => x.trim()).filter(Boolean);

export default function SvcOffer() {
  const { ready } = useSvc();
  const { db, live } = usePlatform();
  const router = useRouter();
  const [f, setF] = useState(null);
  const [pic, setPic] = useState(false);
  const [err, setErr] = useState({});
  useEffect(() => {
    if (!ready || f) return;
    const rq = qp('request') ? getRequests().find((r) => r.id === qp('request')) : null;
    setF({ shopId: rq ? rq.shopId : qp('shop') || '', requestId: rq ? rq.id : '', title: '', scope: rq ? rq.text : '', includes: '', fee: rq && rq.budget ? String(rq.budget) : '', days: '7', revisions: '1', cat: 'setup', who: '', validDays: String(settings().offerDays || 7), cover: '' });
  }, [ready, f]);
  const shops = useMemo(() => (live ? db.shops.slice().sort((a, b) => a.name.localeCompare(b.name)) : []), [live, db]);
  if (!f) return <AdminShell active="svc-offer" title="New custom offer"><div style={{ minHeight: 400 }} aria-busy="true" /></AdminShell>;
  const set = (p) => setF((x) => ({ ...x, ...p }));
  const shop = shops.find((s) => s.id === f.shopId);
  const gate = f.shopId ? canUse('services', f.shopId) : { ok: true };
  const vat = settings().vatPct;
  const fee = Math.round(Number(String(f.fee).replace(/[^0-9.]/g, '')) || 0);
  const make = () => {
    const [kind, id] = String(f.who).split(':');
    const r = createOffer({ shopId: f.shopId, shopName: shop ? shop.name : f.shopId, requestId: f.requestId || null, title: f.title, scope: f.scope, includes: lines(f.includes), fee: f.fee, days: f.days, revisions: f.revisions, cat: f.cat, cover: f.cover, validDays: f.validDays, expertId: kind === 'expert' ? id : null, teamId: kind === 'team' ? id : null }, (() => { try { return staff().name; } catch { return 'Staff'; } })());
    if (!r.ok) { setErr({ [r.field]: r.error }); toast(r.error, { tone: 'error' }); return; }
    toast('Offer made. Send the payment link.');
    router.push('/admin/service-order?id=' + r.order.id);
  };
  const E = (k) => (err[k] ? <p className="gc-help gc-help--error" role="alert">{err[k]}</p> : null);

  return (
    <AdminShell active="svc-offer" title="New custom offer">
      <style dangerouslySetInnerHTML={{ __html: SVA_CSS + MEDIA_CSS }} />
      <div className="ix-page ix-page--narrow">
        <RecordHeader back="/admin/services?tab=offers" backLabel="Service orders" title="New custom offer" primary={{ label: 'Make offer', icon: 'check', onClick: make }} />
        <section className="ix-card sva-pad" aria-labelledby="sof-who">
          <h2 id="sof-who">For</h2>
          <div><label className="gc-label" htmlFor="sof-shop">Store</label>
            <select id="sof-shop" className="gc-input gc-select" value={f.shopId} onChange={(e) => set({ shopId: e.target.value, requestId: '' })}><option value="">Choose a store…</option>{shops.map((s) => <option key={s.id} value={s.id}>{s.name} · #{s.id}</option>)}</select>{E('shopId')}</div>
          {f.requestId ? <p className="gc-help" style={{ margin: 0 }}>Answers the store’s request {f.requestId}.</p> : null}
          {f.shopId && !gate.ok ? <p className="gc-help gc-help--error" style={{ margin: 0 }}>Services is closed for this store ({gate.code === 'blocked' ? 'blocked' : 'not open to it'}). It can still pay the link; open it in Services › Access if it should see the shop too.</p> : null}
        </section>
        <section className="ix-card sva-pad" aria-labelledby="sof-work">
          <h2 id="sof-work">The work</h2>
          <div><label className="gc-label" htmlFor="sof-t">Name</label><input id="sof-t" className="gc-input" value={f.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Eid campaign kit: 6 banners and 3 product videos" />{E('title')}</div>
          <div><label className="gc-label" htmlFor="sof-s">What it is (the store reads this)</label><textarea id="sof-s" className="gc-input" rows={3} value={f.scope} onChange={(e) => set({ scope: e.target.value })} />{E('scope')}</div>
          <div><label className="gc-label" htmlFor="sof-i">What is included (one per line)</label><textarea id="sof-i" className="gc-input" rows={3} value={f.includes} onChange={(e) => set({ includes: e.target.value })} /></div>
          <div className="sva-grid2">
            <div><label className="gc-label" htmlFor="sof-f">Price before VAT (৳)</label><input id="sof-f" className="gc-input" inputMode="numeric" value={f.fee} onChange={(e) => set({ fee: e.target.value })} />{E('fee')}</div>
            <div><label className="gc-label" htmlFor="sof-d">Days to deliver (from payment)</label><input id="sof-d" className="gc-input" inputMode="numeric" value={f.days} onChange={(e) => set({ days: e.target.value })} />{E('days')}</div>
            <div><label className="gc-label" htmlFor="sof-r">Changes included</label><input id="sof-r" className="gc-input" inputMode="numeric" value={f.revisions} onChange={(e) => set({ revisions: e.target.value })} /></div>
            <div><label className="gc-label" htmlFor="sof-c">Category</label><select id="sof-c" className="gc-input gc-select" value={f.cat} onChange={(e) => set({ cat: e.target.value })}>{CATS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          </div>
          <p className="gc-help" style={{ margin: 0 }}>{fee ? `The store pays ${tk(fee + Math.round((fee * vat) / 100))} (VAT ${vat}% added).` : `VAT ${vat}% is added.`}</p>
          <div>
            <span className="gc-label">Cover picture (optional)</span>
            <div className="smd-cover">
              <span className={'smd-cover__img' + (f.cover ? '' : ' is-tile')} style={f.cover ? { backgroundImage: `url(${f.cover})` } : undefined} aria-hidden="true">{f.cover ? null : <Icon name="sparkles" width="28" height="28" />}</span>
              <span className="smd-acts"><button type="button" className="ix-btn ix-btn--sm" onClick={() => setPic(true)}>{f.cover ? 'Change' : 'Add a picture'}</button>{f.cover ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => set({ cover: '' })}>Remove</button> : null}</span>
            </div>
          </div>
        </section>
        <section className="ix-card sva-pad" aria-labelledby="sof-how">
          <h2 id="sof-how">Who and how long</h2>
          <div className="sva-grid2">
            <div><label className="gc-label" htmlFor="sof-w">Who does it</label>
              <select id="sof-w" className="gc-input gc-select" value={f.who} onChange={(e) => set({ who: e.target.value })}>
                <option value="">Choose after payment</option>
                <optgroup label="Teams">{getTeams().filter((t) => t.active !== false).map((t) => <option key={t.id} value={'team:' + t.id}>{t.name}</option>)}</optgroup>
                <optgroup label="Experts">{getExperts().filter((e) => e.active).map((e) => <option key={e.id} value={'expert:' + e.id}>{e.name}{e.kind === 'partner' ? ' (partner)' : ''}</option>)}</optgroup>
              </select></div>
            <div><label className="gc-label" htmlFor="sof-v">Valid for</label><select id="sof-v" className="gc-input gc-select" value={f.validDays} onChange={(e) => set({ validDays: e.target.value })}>{[3, 7, 14, 30].map((d) => <option key={d} value={String(d)}>{d} days</option>)}</select></div>
          </div>
          <p className="gc-help" style={{ margin: 0 }}>With someone chosen, work starts the moment the store pays. Split it into tasks with payouts on the order.</p>
        </section>
        <div className="sva-row" style={{ justifyContent: 'flex-end' }}><button type="button" className="ix-btn ix-btn--primary" onClick={make}>Make offer</button></div>
      </div>
      <PicturePicker open={pic} title="Cover picture" onPick={({ src }) => { set({ cover: src }); setPic(false); }} onClose={() => setPic(false)} />
    </AdminShell>
  );
}
