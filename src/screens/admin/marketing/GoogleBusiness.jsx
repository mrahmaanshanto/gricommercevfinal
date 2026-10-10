'use client';
// Google Business (/admin/google-business?tab=profile|reviews|posts|performance|qa) — GridCommerce's own Business
// Profile (Grid Technologies Limited, Banani). Copied from the merchant panel's Google Business page
// (screens/channels/GoogleBusiness.jsx: reviews with AI reply drafts, business info and hours, posts) and fed admin data.
// Title row (View on Google, Create post), five key figures, then the views:
//   Profile      name, categories, description (750 characters), phone, website, address, opening hours, photos by name
//   Reviews      rating trend and stars, then All · Waiting for a reply · 5 · 4 · 3 or below; reply, AI draft, edit, remove
//   Posts        Published · Scheduled · Drafts; create / edit in a side panel with a preview
//   Performance  profile views (Search / Maps), website clicks, calls, direction requests, search terms, 30 or 90 days
//   Q&A          a placeholder (not connected to Google)
// Each card says where its data comes from: Google API, GridCommerce (our own) or Placeholder (lib/admin/marketing2.js
// › GBP_SUPPORT). Nothing is sent to Google in this demo. Data: marketing2 › saveProfile, replyReview, removeReply,
// aiReviewReply, saveGbpPost, deleteGbpPost, addPhoto, removePhoto, answerQuestion, gbpPerformance, ratingTrend.

import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { ChannelIcon, Sheet, EmptyState, InfoTip, StatusBadge } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, KV } from '@/components/ui/IndexKit';
import { ColumnChart, HBars, Legend, CHART_CSS } from '@/components/charts/DashCharts';
import { DAY, ago, dm, dmy, startOfDay } from '@/lib/platform/util';
import {
  GBP_SUPPORT, GBP_CATEGORIES, CTAS, GBP_POST_KINDS, PHOTO_KINDS, gbpPerformance, ratingTrend, aiReviewReply,
  saveProfile, replyReview, removeReply, saveGbpPost, deleteGbpPost, addPhoto, removePhoto, answerQuestion,
} from '@/lib/admin/marketing2';
import { AdminShell } from '../AdminShell';
import { MK_CSS, useMk2, Skeleton, SourceBadge, Stars, Field, ctl, FormError, num, short, plural, dayTime, toInput, fromInput } from './mk2Shared';

const TABS = [['profile', 'Profile'], ['reviews', 'Reviews'], ['posts', 'Posts'], ['performance', 'Performance'], ['qa', 'Q&A']];
const RV = [['all', 'All'], ['open', 'Waiting for a reply'], ['5', '5 stars'], ['4', '4 stars'], ['low', '3 or below']];
const PO = [['published', 'Published'], ['scheduled', 'Scheduled'], ['draft', 'Drafts']];
const ABOUT = 'GridCommerce’s own Google Business Profile: what Google shows for Grid Technologies Limited on Search and Maps, the reviews merchants leave (with AI reply drafts), posts, and how many people view, call, visit the website or ask for directions. Each card says whether it comes from the Google Business Profile APIs, is GridCommerce’s own, or is a placeholder. Nothing is sent to Google in this demo.';
const MAPS = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Grid Technologies Limited Banani Dhaka');

const CSS = `
.gb-ph{display:inline-flex;align-items:center;height:18px;margin-left:4px;padding:0 6px;border-radius:var(--radius-full);background:var(--fill-warning-soft);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-warning)}
.gb-legend{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);padding:0 var(--space-1);font-size:var(--text-xs);color:var(--text-muted)}
.gb-h2{display:inline-flex;align-items:center;gap:var(--space-2)}
.gb-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:var(--space-4);align-items:start}
.gb-hour{display:grid;grid-template-columns:110px 120px minmax(0,1fr);align-items:center;gap:var(--space-3);min-height:44px;border-top:1px solid var(--border-subtle)}
.gb-hours>.gb-hour:first-child{border-top:0}
.gb-hour__day{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.gb-hour__times{display:flex;align-items:center;gap:var(--space-2);min-width:0}
.gb-hour__times .gc-input{max-width:130px}
.gb-toggle{display:inline-flex;align-items:center;gap:var(--space-2);min-height:32px;font-size:var(--text-sm);color:var(--text-body);cursor:pointer}
.gb-toggle input{width:16px;height:16px;margin:0;accent-color:var(--primary)}
.gb-bar{position:sticky;bottom:calc(var(--space-3) + var(--host-badge, 0px));z-index:5;display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-card)}
.gb-bar small{flex:1;min-width:160px;font-size:var(--text-xs);color:var(--text-muted)}
.gb-photos{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,150px),1fr));gap:var(--space-3)}
.gb-photo{display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.gb-photo__img{display:flex;align-items:flex-end;justify-content:space-between;height:80px;padding:6px;background:var(--fill-info-soft);color:var(--text-info)}
.gb-photo__img small{padding:1px 8px;border-radius:var(--radius-full);background:var(--surface-card);font-size:var(--text-xs);color:var(--text-body)}
.gb-photo__body{display:flex;align-items:center;gap:4px;padding:4px 4px 4px 8px}
.gb-photo__body span{display:flex;flex:1;flex-direction:column;min-width:0}
.gb-photo__body b{overflow:hidden;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.gb-photo__body small{font-size:var(--text-xs);color:var(--text-muted)}
.gb-sum{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-1) var(--space-4);padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-muted)}
.gb-sum b{font-family:var(--font-data);font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading)}
.gb-review{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle)}
.gb-reviews>.gb-review:first-child{border-top:0}
.gb-review__head{display:flex;align-items:center;gap:10px;min-width:0}
.gb-avatar{display:grid;place-items:center;flex:none;width:32px;height:32px;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary);font-size:var(--text-xs);font-weight:var(--weight-semibold)}
.gb-review__who{display:flex;flex-direction:column;flex:1;min-width:0}
.gb-review__who b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.gb-review__who small{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.gb-review>p{margin:0 0 0 42px;font-size:var(--text-sm);line-height:var(--text-sm-lh);color:var(--text-body)}
.gb-reply{display:flex;flex-direction:column;gap:var(--space-1);margin-left:42px;padding:var(--space-2) var(--space-3);border-left:3px solid var(--primary);border-radius:0 var(--radius-lg) var(--radius-lg) 0;background:var(--surface-subtle);font-size:var(--text-sm)}
.gb-reply small{font-size:var(--text-xs);color:var(--text-muted)}
.gb-compose{display:flex;flex-direction:column;gap:var(--space-2);margin-left:42px}
.gb-compose textarea{min-height:88px;resize:vertical}
.gb-compose__row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.gb-ai{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--fill-primary-soft)}
.gb-ai b{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--primary)}
.gb-ai p{margin:0;font-size:var(--text-sm);color:var(--text-heading)}
.gb-posts{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,240px),1fr));gap:var(--space-3);padding:var(--space-4)}
.gb-post{display:flex;flex-direction:column;min-width:0;overflow:hidden;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.gb-post__img{display:flex;align-items:flex-end;gap:6px;height:110px;padding:8px;background:var(--fill-info-soft);font-size:var(--text-xs);color:var(--text-info)}
.gb-post__body{display:flex;flex-direction:column;gap:var(--space-2);flex:1;padding:var(--space-3)}
.gb-post__text{margin:0;font-size:var(--text-sm);color:var(--text-body);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.gb-post__meta{font-size:var(--text-xs);color:var(--text-muted)}
.gb-post__foot{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);padding:var(--space-1) var(--space-2) var(--space-1) var(--space-3);border-top:1px solid var(--border-subtle)}
.gb-cta{display:inline-flex;align-self:flex-start;align-items:center;height:24px;padding:0 var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--primary)}
.gb-prev{overflow:hidden;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card)}
.gb-prev__head{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-3) var(--space-4);font-size:var(--text-xs);color:var(--text-muted)}
.gb-prev__head b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.gb-big{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:var(--space-2)}
.gb-big div{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-page)}
.gb-big span{font-size:var(--text-xs);color:var(--text-muted)}
.gb-big b{font-family:var(--font-data);font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading)}
.gb-big small{font-size:var(--text-xs)}
.gb-up{color:var(--text-success)}.gb-down{color:var(--text-danger)}
.gb-qa{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle)}
.gb-qa b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.gb-qa small{font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:1023px){.gb-grid{grid-template-columns:minmax(0,1fr)}.gb-big{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:640px){
  .gb-hour{grid-template-columns:minmax(0,1fr) auto;padding:var(--space-2) 0}
  .gb-hour__times{grid-column:1 / -1}
  .gb-hour__times .gc-input{max-width:none;flex:1}
  .gb-reply,.gb-compose,.gb-review>p{margin-left:0}
  .gb-big{grid-template-columns:repeat(2,minmax(0,1fr))}
}
`;

const ctaLabel = (k) => (CTAS.find((x) => x[0] === k) || [k, k])[1];
const change = (a, b) => (b ? Math.round(((a - b) / b) * 100) : null);
function Delta({ now, before }) {
  const c = change(now, before);
  if (c == null) return null;
  return <small className={c >= 0 ? 'gb-up' : 'gb-down'}>{c >= 0 ? '+' : ''}{c}% vs before</small>;
}
function CardHead({ id, title, src, tip, children }) {
  return (
    <header className="ix-card__head">
      <h2 id={id} className="gb-h2">{title}{tip ? <InfoTip text={tip} /> : null}<SourceBadge kind={src} /></h2>
      {children}
    </header>
  );
}

export default function GoogleBusiness() {
  const { data, t, live } = useMk2();
  const [tab, setTab] = useState(null);
  const [postEdit, setPostEdit] = useState(null);
  const [rvView, setRvView] = useState('all');

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setTab(TABS.some(([k]) => k === p.get('tab')) ? p.get('tab') : 'profile');
  }, []);
  const go = (k) => {
    setTab(k);
    const p = new URLSearchParams();
    if (k !== 'profile') p.set('tab', k);
    window.history.replaceState(window.history.state, '', window.location.pathname + (p.toString() ? '?' + p : ''));
  };

  if (!live || !tab) return <AdminShell active="google-business" title="Google Business"><style dangerouslySetInnerHTML={{ __html: MK_CSS + CSS }} /><Skeleton label="Loading Google Business" /></AdminShell>;

  const g = data.gbp;
  const total = g.reviews.length;
  const avg = total ? g.reviews.reduce((a, r) => a + r.stars, 0) / total : 0;
  const waiting = g.reviews.filter((r) => !r.reply).length;
  const perf = gbpPerformance(t, 30);
  const weekly = (f) => { const out = []; for (let i = 0; i < perf.days.length; i += 6) out.push(perf.days.slice(i, i + 6).reduce((a, d) => a + d[f], 0)); return out; };
  const newPost = () => { go('posts'); setPostEdit({ kind: 'update', text: '', cta: 'learn', link: 'https://gridcommerce.net/', photo: g.photos[0] ? g.photos[0].id : null, st: 'published', at: null }); };
  const tabs = TABS.map(([k, label]) => ({ key: k, id: 'gb-tab-' + k, label: k === 'qa' ? <>{label} <span className="gb-ph">Placeholder</span></> : label, count: k === 'reviews' && waiting ? waiting : null, on: tab === k, onClick: () => go(k) }));

  return (
    <AdminShell active="google-business" title="Google Business">
      <style dangerouslySetInnerHTML={{ __html: MK_CSS + CSS + CHART_CSS }} />
      <div className="ix-page">
        <ShopHeader icon="map-pin" title="Google Business" about={ABOUT}
          secondary={[{ label: 'View on Google', icon: 'external-link', onClick: () => window.open(MAPS, '_blank', 'noopener') }]}
          more={[{ label: 'Social media', href: '/admin/social' }]}
          primary={{ label: 'Create post', icon: 'plus', onClick: newPost }} />

        <MetricStrip label="Profile at a glance" items={[
          { label: 'Rating', value: avg.toFixed(1), sub: plural(total, 'review'), icon: 'star', onClick: () => { setRvView('all'); go('reviews'); } },
          { label: 'Waiting for a reply', value: num(waiting), icon: 'message-square-text', onClick: () => { setRvView('open'); go('reviews'); } },
          { label: 'Profile views · 30 days', value: short(perf.totals.views), spark: weekly('views'), onClick: () => go('performance') },
          { label: 'Website clicks · 30 days', value: num(perf.totals.website), icon: 'mouse-pointer-click', spark: weekly('website') },
          { label: 'Calls · 30 days', value: num(perf.totals.calls), spark: weekly('calls') },
        ]} />

        <section className="ix-card mk-tabs" aria-label="Views"><IndexTabs tabs={tabs} label="Google Business views" /></section>
        <p className="gb-legend"><span>Data from:</span><SourceBadge kind="google" /><span>Business Profile APIs</span><SourceBadge kind="ours" /><span>worked out by GridCommerce</span><SourceBadge kind="placeholder" /><span>not connected yet</span></p>

        <div role="tabpanel" aria-labelledby={'gb-tab-' + tab} className="ix-page">
          {tab === 'profile' ? <Profile key={g.profile.updatedAt} g={g} /> : null}
          {tab === 'reviews' ? <Reviews g={g} t={t} view={rvView} setView={setRvView} /> : null}
          {tab === 'posts' ? <Posts g={g} t={t} onEdit={setPostEdit} onNew={newPost} /> : null}
          {tab === 'performance' ? <Performance t={t} /> : null}
          {tab === 'qa' ? <Questions g={g} t={t} /> : null}
        </div>
      </div>
      <PostEditor key={postEdit ? postEdit.id || 'new' : 'none'} post={postEdit} g={g} onClose={() => setPostEdit(null)} />
    </AdminShell>
  );
}

// ---- Profile ----------------------------------------------------------------------------------------------------
function Profile({ g }) {
  const p = g.profile;
  const initial = () => ({ name: p.name, category: p.category, extra: [...p.extra], description: p.description, phone: p.phone, website: p.website, address: { ...p.address }, hours: p.hours.map((h) => ({ ...h })) });
  const [f, setF] = useState(initial);
  const [err, setErr] = useState(null);       // { error, field }
  const [dirty, setDirty] = useState(false);
  const [photo, setPhoto] = useState(null);   // { name, kind, error }
  const set = (patch) => { setF((x) => ({ ...x, ...patch })); setDirty(true); setErr(null); };
  const setHour = (i, patch) => set({ hours: f.hours.map((h, k) => (k === i ? { ...h, ...patch } : h)) });
  const save = () => {
    const r = saveProfile(f);
    if (!r.ok) { setErr(r); const el = document.getElementById('gp-' + r.field); if (el) { el.focus(); el.scrollIntoView({ block: 'center' }); } return; }
    setDirty(false); toast('Profile saved · Google may take up to 10 minutes to show it');
  };
  const e = (k) => (err && err.field === k ? err.error : '');
  const copyFirst = () => { const h = f.hours[0]; set({ hours: f.hours.map((x) => ({ ...x, open: h.open, close: h.close, closed: x.day === 'Friday' ? x.closed : h.closed })) }); toast('Saturday’s hours copied to the other days (Friday kept)'); };
  const doAddPhoto = () => {
    const r = addPhoto(photo);
    if (!r.ok) { setPhoto({ ...photo, error: r.error }); return; }
    setPhoto(null); toast('Photo added');
  };
  const delPhoto = async (ph) => {
    if (!(await confirmDialog({ title: `Remove ${ph.name}?`, body: 'It is taken off the Google profile.', confirmLabel: 'Remove', tone: 'danger' }))) return;
    const r = removePhoto(ph.id);
    toast(r.ok ? 'Photo removed' : r.error, r.ok ? undefined : { tone: 'error' });
  };
  return (
    <>
      <div className="gb-grid">
        <section className="ix-card" aria-labelledby="gp-about">
          <CardHead id="gp-about" title="About" src={GBP_SUPPORT.profile} />
          <div className="mk-body">
            <Field id="gp-name" label="Business name" error={e('name')}><input id="gp-name" {...ctl(e('name'))} value={f.name} onChange={(ev) => set({ name: ev.target.value })} /></Field>
            <Field id="gp-category" label="Primary category" error={e('category')}>
              <select id="gp-category" {...ctl(e('category'), true)} value={f.category} onChange={(ev) => set({ category: ev.target.value })}>{GBP_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
            </Field>
            <div className="gc-field">
              <span className="gc-label">More categories</span>
              <div className="mk-checks" role="group" aria-label="More categories">
                {GBP_CATEGORIES.filter((c) => c !== f.category).map((c) => (
                  <label key={c} className="mk-check"><input type="checkbox" checked={f.extra.includes(c)} onChange={() => set({ extra: f.extra.includes(c) ? f.extra.filter((x) => x !== c) : [...f.extra, c] })} />{c}</label>
                ))}
              </div>
            </div>
            <Field id="gp-description" label="Description" error={e('description')} hint={`${f.description.length} / 750`}>
              <textarea id="gp-description" {...ctl(e('description'))} rows={6} value={f.description} onChange={(ev) => set({ description: ev.target.value })} />
            </Field>
          </div>
        </section>

        <section className="ix-card" aria-labelledby="gp-contact">
          <CardHead id="gp-contact" title="Contact and address" src={GBP_SUPPORT.profile} />
          <div className="mk-body">
            <div className="mk-two">
              <Field id="gp-phone" label="Phone" error={e('phone')}><input id="gp-phone" {...ctl(e('phone'))} inputMode="tel" value={f.phone} onChange={(ev) => set({ phone: ev.target.value })} /></Field>
              <Field id="gp-website" label="Website" error={e('website')}><input id="gp-website" {...ctl(e('website'))} inputMode="url" value={f.website} onChange={(ev) => set({ website: ev.target.value })} /></Field>
            </div>
            <Field id="gp-line1" label="Street" error={e('line1')}><input id="gp-line1" {...ctl(e('line1'))} value={f.address.line1} onChange={(ev) => set({ address: { ...f.address, line1: ev.target.value } })} /></Field>
            <div className="mk-three">
              <Field id="gp-area" label="Area"><input id="gp-area" className="gc-input" value={f.address.area} onChange={(ev) => set({ address: { ...f.address, area: ev.target.value } })} /></Field>
              <Field id="gp-city" label="City"><input id="gp-city" className="gc-input" value={f.address.city} onChange={(ev) => set({ address: { ...f.address, city: ev.target.value } })} /></Field>
              <Field id="gp-post" label="Postcode"><input id="gp-post" className="gc-input" inputMode="numeric" value={f.address.postcode} onChange={(ev) => set({ address: { ...f.address, postcode: ev.target.value } })} /></Field>
            </div>
            <KV rows={[['Verified', p.verified ? 'Yes' : 'No'], ['Open since', p.opened ? dmy(Date.parse(p.opened)) : '—'], ['Last saved', `${dayTime(p.updatedAt)} · ${p.updatedBy}`]]} />
          </div>
        </section>
      </div>

      <section className="ix-card" aria-labelledby="gp-hours">
        <CardHead id="gp-hours" title="Opening hours" src={GBP_SUPPORT.hours} tip="Dhaka time. Support on phone and WhatsApp runs longer; these are the office hours.">
          <button type="button" className="ix-btn ix-btn--sm" onClick={copyFirst}><Icon name="copy" width="16" height="16" aria-hidden="true" />Copy Saturday to all</button>
        </CardHead>
        <div className="mk-body gb-hours" id="gp-hours-list">
          {f.hours.map((h, i) => (
            <div key={h.day} className="gb-hour">
              <span className="gb-hour__day">{h.day}</span>
              <label className="gb-toggle"><input type="checkbox" checked={!h.closed} onChange={() => setHour(i, { closed: !h.closed })} />{h.closed ? 'Closed' : 'Open'}</label>
              {h.closed ? <span /> : (
                <span className="gb-hour__times">
                  <input type="time" className="gc-input" aria-label={h.day + ' opens'} value={h.open} onChange={(ev) => setHour(i, { open: ev.target.value })} />
                  <span>to</span>
                  <input type="time" className="gc-input" aria-label={h.day + ' closes'} value={h.close} onChange={(ev) => setHour(i, { close: ev.target.value })} />
                </span>
              )}
            </div>
          ))}
          {e('hours') ? <p className="gc-help gc-help--error" role="alert">{e('hours')}</p> : null}
        </div>
      </section>

      <section className="ix-card" aria-labelledby="gp-photos">
        <CardHead id="gp-photos" title="Photos" src={GBP_SUPPORT.photos}>
          <button type="button" className="ix-btn ix-btn--sm" onClick={() => setPhoto({ name: '', kind: 'Office', error: '' })}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add photo</button>
        </CardHead>
        <div className="mk-body">
          <div className="gb-photos">
            {g.photos.map((ph) => (
              <div key={ph.id} className="gb-photo">
                <div className="gb-photo__img"><Icon name="image" width="20" height="20" aria-hidden="true" /><small>{ph.kind}</small></div>
                <div className="gb-photo__body">
                  <span><b title={ph.name}>{ph.name}</b><small>{num(ph.views)} views</small></span>
                  <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={'Remove ' + ph.name} onClick={() => delPhoto(ph)}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="gb-bar" role="region" aria-label="Save profile">
        <small>{dirty ? 'Unsaved changes' : `Saved ${dayTime(p.updatedAt)} by ${p.updatedBy}`}</small>
        {err && !err.field ? <FormError error={err.error} /> : null}
        <button type="button" className="gc-btn gc-btn--neutral" disabled={!dirty} onClick={() => { setF(initial()); setDirty(false); setErr(null); }}>Discard</button>
        <button type="button" className="gc-btn gc-btn--solid" disabled={!dirty} onClick={save}>Save</button>
      </div>

      <Sheet open={!!photo} title="Add photo" onClose={() => setPhoto(null)} footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setPhoto(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={doAddPhoto}>Add</button></>}>
        {photo ? (
          <div className="mk-form">
            <Field id="gp-ph-name" label="File name" hint="e.g. training-day-october.jpg" error={photo.error}><input id="gp-ph-name" data-autofocus {...ctl(photo.error)} value={photo.name} onChange={(ev) => setPhoto({ ...photo, name: ev.target.value, error: '' })} /></Field>
            <Field id="gp-ph-kind" label="Kind"><select id="gp-ph-kind" className="gc-input gc-select" value={photo.kind} onChange={(ev) => setPhoto({ ...photo, kind: ev.target.value })}>{PHOTO_KINDS.map((k) => <option key={k}>{k}</option>)}</select></Field>
            <p className="mk-note">Demo: the photo is added by name; nothing is uploaded to Google.</p>
          </div>
        ) : null}
      </Sheet>
    </>
  );
}

// ---- Reviews ------------------------------------------------------------------------------------------------------
function Reviews({ g, t, view, setView }) {
  const reviews = [...g.reviews].sort((a, b) => b.at - a.at);
  const list = reviews.filter((r) => view === 'all' || (view === 'open' ? !r.reply : view === 'low' ? r.stars <= 3 : r.stars === Number(view)));
  const total = reviews.length;
  const avg = total ? reviews.reduce((a, r) => a + r.stars, 0) / total : 0;
  const waiting = reviews.filter((r) => !r.reply).length;
  const answered = reviews.filter((r) => r.reply && r.replyAt);
  const hrs = answered.length ? answered.reduce((a, r) => a + (r.replyAt - r.at), 0) / answered.length / 3600e3 : null;
  const trend = ratingTrend(g.reviews, t, 6);
  const tabs = RV.map(([k, label]) => ({ key: k, id: 'rv-tab-' + k, label, count: k === 'open' ? waiting || null : null, on: view === k, onClick: () => setView(k) }));
  return (
    <>
      <div className="gb-grid">
        <section className="ix-card" aria-labelledby="rv-trend">
          <CardHead id="rv-trend" title="Rating by month" src={GBP_SUPPORT.trend} tip="Average stars of the reviews left each month, worked out by GridCommerce from the reviews Google sends." />
          <div className="mk-body">
            <ColumnChart label="Average rating by month, last 6 months" data={trend.map((m) => ({ label: m.label, title: `${m.label} · ${plural(m.n, 'review')}`, values: [m.avg == null ? null : Math.round(m.avg * 10) / 10] }))}
              series={[{ name: 'Average rating', color: 'var(--viz-1)' }]} height={170} fmt={(v) => (v == null ? '—' : Number(v).toFixed(1))} tickFmt={(v) => String(Math.round(v * 10) / 10)} />
          </div>
        </section>
        <section className="ix-card" aria-labelledby="rv-stars">
          <CardHead id="rv-stars" title="Stars" src={GBP_SUPPORT.reviews} />
          <div className="mk-body">
            <HBars rows={[5, 4, 3, 2, 1].map((s) => { const n = reviews.filter((r) => r.stars === s).length; return { key: 's' + s, label: `${s} star${s === 1 ? '' : 's'}`, value: n, text: num(n), color: s >= 4 ? 'var(--viz-1)' : s === 3 ? 'var(--viz-4)' : 'var(--viz-6)' }; })} />
            <p className="mk-note">Replies take {hrs == null ? '—' : hrs < 24 ? Math.round(hrs) + ' hours' : Math.round(hrs / 24) + ' days'} on average.</p>
          </div>
        </section>
      </div>
      <section className="ix-card" aria-label="Reviews">
        <div className="gb-sum">
          <span className="mk-row"><b>{avg.toFixed(1)}</b><Stars n={Math.round(avg)} /></span>
          <span>{plural(total, 'review')}</span>
          <span className={waiting ? 'ix-warn' : ''}>{waiting} waiting for a reply</span>
          <SourceBadge kind={GBP_SUPPORT.reviews} />
        </div>
        <div className="ix-bar"><IndexTabs tabs={tabs} label="Show reviews" /></div>
        {list.length ? <div className="gb-reviews">{list.map((r) => <ReviewCard key={r.id} r={r} t={t} />)}</div>
          : <div className="ix-empty"><EmptyState icon="message-square-text" title={view === 'open' ? 'Every review has a reply.' : 'No reviews here.'} actionLabel={view !== 'all' ? 'Show all reviews' : undefined} onAction={() => setView('all')} /></div>}
      </section>
    </>
  );
}

function ReviewCard({ r, t }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');
  const [ai, setAi] = useState(null);        // { text, n } | 'busy'
  const [err, setErr] = useState('');
  const box = useRef(null);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const start = () => { setText(r.reply || ''); setEditing(true); setAi(null); setErr(''); setTimeout(() => box.current && box.current.focus(), 0); };
  const gen = (n) => { setAi('busy'); clearTimeout(timer.current); timer.current = setTimeout(() => setAi({ text: aiReviewReply(r, n), n }), 700); };
  const publish = () => { const res = replyReview(r.id, text); if (!res.ok) { setErr(res.error); return; } setEditing(false); setAi(null); toast('Reply published'); };
  const remove = async () => {
    if (!(await confirmDialog({ title: 'Remove this reply?', body: 'It is taken off Google. The review stays.', confirmLabel: 'Remove', tone: 'danger' }))) return;
    const res = removeReply(r.id); toast(res.ok ? 'Reply removed' : res.error);
  };
  return (
    <article className="gb-review" aria-label={`Review by ${r.name}`}>
      <div className="gb-review__head">
        <span className="gb-avatar" aria-hidden="true">{r.name.charAt(0)}</span>
        <span className="gb-review__who"><b>{r.name}</b><small><Stars n={r.stars} size={12} /><span>{ago(r.at, t)}</span>{r.shop ? <span>· {r.shop}</span> : null}</small></span>
        {!r.reply && !editing ? <StatusBadge tone="warning" icon="message-square-text">No reply yet</StatusBadge> : null}
      </div>
      <p>{r.text}</p>
      {r.reply && !editing ? (
        <div className="gb-reply">
          <small>Reply by {r.replyBy || 'GridCommerce'} · {ago(r.replyAt, t)}</small>
          <span>{r.reply}</span>
          <span className="gb-compose__row">
            <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={start}><Icon name="pencil" width="16" height="16" aria-hidden="true" />Edit reply</button>
            <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={remove}>Remove</button>
          </span>
        </div>
      ) : null}
      {!r.reply && !editing ? <div className="gb-compose"><span className="gb-compose__row"><button type="button" className="ix-btn ix-btn--sm" onClick={start}><Icon name="reply" width="16" height="16" aria-hidden="true" />Reply</button></span></div> : null}
      {editing ? (
        <div className="gb-compose">
          <label className="gc-label" htmlFor={'rp-' + r.id}>{r.reply ? 'Edit the reply' : 'Your reply'}</label>
          <textarea ref={box} id={'rp-' + r.id} className={'gc-input' + (err ? ' gc-input--error' : '')} value={text} maxLength={4096} onChange={(e) => { setText(e.target.value); setErr(''); }} placeholder="A short, friendly reply" />
          {ai === 'busy' ? <div className="gb-ai" role="status"><b><Icon name="loader" width="14" height="14" aria-hidden="true" /> Writing a draft…</b></div> : null}
          {ai && ai !== 'busy' ? (
            <div className="gb-ai" role="region" aria-label="AI suggested reply">
              <b><Icon name="sparkles" width="14" height="14" aria-hidden="true" /> AI suggested reply <SourceBadge kind={GBP_SUPPORT.aiReply} /></b>
              <p>{ai.text}</p>
              <div className="gb-compose__row">
                <button type="button" className="ix-btn ix-btn--sm" onClick={() => { setText(ai.text); setAi(null); }}>Use reply</button>
                <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => gen(ai.n + 1)}>Another version</button>
              </div>
              <small className="mk-note">Check it before you publish. Nothing is posted until you press Publish reply.</small>
            </div>
          ) : null}
          {err ? <p className="gc-help gc-help--error" role="alert">{err}</p> : null}
          <div className="gb-compose__row">
            {ai ? null : <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => gen(0)}><Icon name="sparkles" width="16" height="16" aria-hidden="true" />AI draft</button>}
            <span style={{ flex: 1 }} />
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => { setEditing(false); setAi(null); }}>Cancel</button>
            <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={publish} disabled={!text.trim()}>Publish reply</button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

// ---- Posts --------------------------------------------------------------------------------------------------------
function Posts({ g, t, onEdit, onNew }) {
  const [f, setF] = useState('published');
  const posts = g.posts;
  const list = posts.filter((p) => p.st === f).sort((a, b) => (f === 'scheduled' ? a.at - b.at : b.at - a.at));
  const del = async (p) => {
    if (!(await confirmDialog({ title: 'Delete this post?', body: p.st === 'published' ? 'It is removed from Google too.' : 'The post is deleted.', confirmLabel: 'Delete', tone: 'danger' }))) return;
    const r = deleteGbpPost(p.id); toast(r.ok ? 'Post deleted' : r.error);
  };
  const tabs = PO.map(([k, label]) => ({ key: k, id: 'gpo-tab-' + k, label, count: posts.filter((p) => p.st === k).length, on: f === k, onClick: () => setF(k) }));
  const photoName = (id) => (g.photos.find((x) => x.id === id) || {}).name;
  return (
    <section className="ix-card" aria-label="Posts">
      <div className="ix-bar"><IndexTabs tabs={tabs} label="Posts by status" /><span className="ix-tools"><SourceBadge kind={GBP_SUPPORT.posts} /></span></div>
      {list.length ? (
        <div className="gb-posts">
          {list.map((p) => (
            <article key={p.id} className="gb-post">
              <div className="gb-post__img"><Icon name="image" width="16" height="16" aria-hidden="true" />{photoName(p.photo) || 'No photo'}</div>
              <div className="gb-post__body">
                <span className="mk-row"><StatusBadge tone="neutral">{(GBP_POST_KINDS.find((k) => k[0] === p.kind) || [0, 'Update'])[1]}</StatusBadge></span>
                <p className="gb-post__text">{p.text}</p>
                {p.cta ? <span className="gb-cta">{ctaLabel(p.cta)}</span> : null}
                <span className="gb-post__meta">{p.st === 'published' ? `Published ${ago(p.at, t).toLowerCase()} · ${num(p.views)} views · ${num(p.clicks)} clicks` : p.st === 'scheduled' ? `Goes live ${dayTime(p.at)}` : `Draft · ${p.by}`}</span>
              </div>
              <div className="gb-post__foot">
                <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => onEdit({ ...p })}><Icon name="pencil" width="16" height="16" aria-hidden="true" />Edit</button>
                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Delete post" onClick={() => del(p)}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button>
              </div>
            </article>
          ))}
        </div>
      ) : <div className="ix-empty"><EmptyState icon="newspaper" title={f === 'draft' ? 'No drafts.' : f === 'scheduled' ? 'Nothing scheduled.' : 'No posts yet.'} actionLabel="Create post" onAction={onNew} /></div>}
    </section>
  );
}

function PostEditor({ post, g, onClose }) {
  const [v, setV] = useState(post ? { ...post, st: post.st === 'scheduled' ? 'scheduled' : 'published' } : null);
  const [err, setErr] = useState('');
  if (!post || !v) return null;
  const set = (patch) => { setV({ ...v, ...patch }); setErr(''); };
  const needLink = v.cta && v.cta !== 'call';
  const finish = (st) => {
    const r = saveGbpPost({ ...v, st, at: v.at });
    if (!r.ok) { setErr(r.error); return; }
    toast(st === 'published' ? 'Post published on Google' : st === 'scheduled' ? `Scheduled for ${dayTime(v.at)}` : 'Draft saved');
    onClose();
  };
  const photo = g.photos.find((x) => x.id === v.photo);
  return (
    <Sheet open title={post.id ? 'Edit post' : 'Create post'} onClose={onClose}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => finish('draft')}>Save draft</button><button type="button" className="gc-btn gc-btn--solid" onClick={() => finish(v.st)}>{v.st === 'scheduled' ? 'Schedule' : 'Publish'}</button></>}>
      <div className="mk-form">
        <div className="gc-field"><span className="gc-label">Type</span><div className="gc-seg" role="radiogroup" aria-label="Type">{GBP_POST_KINDS.map(([k, l]) => <button key={k} type="button" role="radio" aria-checked={v.kind === k} className={'gc-seg__btn' + (v.kind === k ? ' gc-seg__btn--active' : '')} onClick={() => set({ kind: k })}>{l}</button>)}</div></div>
        <Field id="gpo-photo" label="Photo"><select id="gpo-photo" className="gc-input gc-select" value={v.photo || ''} onChange={(e) => set({ photo: e.target.value || null })}><option value="">No photo</option>{g.photos.map((ph) => <option key={ph.id} value={ph.id}>{ph.name}</option>)}</select></Field>
        <Field id="gpo-text" label="Text" hint={`${v.text.length} / 1500`}><textarea id="gpo-text" data-autofocus className="gc-input" rows={5} maxLength={1500} value={v.text} onChange={(e) => set({ text: e.target.value })} placeholder="News, an offer, a training day…" /></Field>
        <div className="mk-two">
          <Field id="gpo-cta" label="Button"><select id="gpo-cta" className="gc-input gc-select" value={v.cta} onChange={(e) => set({ cta: e.target.value })}>{CTAS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
          {needLink ? <Field id="gpo-link" label="Link"><input id="gpo-link" className="gc-input" inputMode="url" value={v.link || ''} onChange={(e) => set({ link: e.target.value })} placeholder="https://" /></Field> : <div />}
        </div>
        <div className="gc-field">
          <span className="gc-label">When</span>
          <div className="gc-seg" role="radiogroup" aria-label="When">{[['published', 'Publish now'], ['scheduled', 'Schedule']].map(([k, l]) => <button key={k} type="button" role="radio" aria-checked={v.st === k} className={'gc-seg__btn' + (v.st === k ? ' gc-seg__btn--active' : '')} onClick={() => set({ st: k, at: k === 'scheduled' ? v.at || startOfDay(Date.now()) + DAY + 11 * 3600e3 : v.at })}>{l}</button>)}</div>
          {v.st === 'scheduled' ? <input type="datetime-local" className="gc-input" aria-label="Publish on" value={toInput(v.at)} onChange={(e) => set({ at: fromInput(e.target.value) })} /> : null}
        </div>
        <FormError error={err} />
        <div className="gc-field">
          <span className="gc-label">Preview</span>
          <div className="gb-prev" aria-label="How the post looks on Google">
            <div className="gb-prev__head"><ChannelIcon channel="gbp" size={28} decorative /><span><b>{g.profile.name}</b><br />{v.st === 'scheduled' ? 'Scheduled' : 'Just now'}</span></div>
            <div className="gb-post__img"><Icon name="image" width="16" height="16" aria-hidden="true" />{photo ? photo.name : 'No photo'}</div>
            <div className="gb-post__body"><p className="gb-post__text" style={{ WebkitLineClamp: 6 }}>{v.text || 'Your text shows here.'}</p>{v.cta ? <span className="gb-cta">{ctaLabel(v.cta)}</span> : null}</div>
          </div>
        </div>
      </div>
    </Sheet>
  );
}

// ---- Performance ----------------------------------------------------------------------------------------------------
function Performance({ t }) {
  const [days, setDays] = useState(30);
  const p = gbpPerformance(t, days);
  const step = days > 30 ? 7 : 3;
  const buckets = [];
  for (let i = 0; i < p.days.length; i += step) {
    const w = p.days.slice(i, i + step);
    const s = (f) => w.reduce((a, d) => a + d[f], 0);
    buckets.push({ label: dm(w[0].day), title: (step === 7 ? 'Week of ' : '') + dm(w[0].day), search: s('search'), maps: s('maps'), website: s('website'), calls: s('calls'), directions: s('directions') });
  }
  const T = p.totals, B = p.prev;
  const FIG = [['views', 'Profile views'], ['search', 'On Search'], ['maps', 'On Maps'], ['website', 'Website clicks'], ['calls', 'Calls'], ['directions', 'Direction requests']];
  const max = Math.max(1, ...p.keywords.map((k) => k.n));
  return (
    <>
      <section className="ix-card" aria-labelledby="pf-head">
        <CardHead id="pf-head" title="Performance" src={GBP_SUPPORT.performance} tip="From the Business Profile Performance API. Compared with the same number of days before.">
          <div className="gc-seg" role="radiogroup" aria-label="Period">{[[30, '30 days'], [90, '90 days']].map(([k, l]) => <button key={k} type="button" role="radio" aria-checked={days === k} className={'gc-seg__btn' + (days === k ? ' gc-seg__btn--active' : '')} onClick={() => setDays(k)}>{l}</button>)}</div>
        </CardHead>
        <div className="mk-body">
          <div className="gb-big">{FIG.map(([k, l]) => <div key={k}><span>{l}</span><b>{num(T[k])}</b><Delta now={T[k]} before={B[k]} /></div>)}</div>
        </div>
      </section>
      <div className="gb-grid">
        <section className="ix-card" aria-label="Profile views">
          <div className="ix-card__head"><h2>Profile views</h2></div>
          <div className="mk-body">
            <ColumnChart key={'v' + days} label={`Profile views on Search and Maps, last ${days} days`} data={buckets.map((b) => ({ label: b.label, title: b.title, values: [b.search, b.maps] }))}
              series={[{ name: 'Search', color: 'var(--viz-1)' }, { name: 'Maps', color: 'var(--viz-3)' }]} fmt={num} tickFmt={short} height={200} />
            <Legend items={[{ name: 'Search', color: 'var(--viz-1)' }, { name: 'Maps', color: 'var(--viz-3)' }]} />
          </div>
        </section>
        <section className="ix-card" aria-label="Interactions">
          <div className="ix-card__head"><h2>What people did</h2></div>
          <div className="mk-body">
            <ColumnChart key={'i' + days} label={`Website clicks, calls and direction requests, last ${days} days`} data={buckets.map((b) => ({ label: b.label, title: b.title, values: [b.website, b.calls, b.directions] }))}
              series={[{ name: 'Website clicks', color: 'var(--viz-1)' }, { name: 'Calls', color: 'var(--viz-2)' }, { name: 'Directions', color: 'var(--viz-4)' }]} fmt={num} height={200} />
            <Legend items={[{ name: 'Website clicks', color: 'var(--viz-1)' }, { name: 'Calls', color: 'var(--viz-2)' }, { name: 'Directions', color: 'var(--viz-4)' }]} />
          </div>
        </section>
      </div>
      <section className="ix-card" aria-labelledby="pf-kw">
        <CardHead id="pf-kw" title="Searches that showed the profile" src={GBP_SUPPORT.keywords} />
        <div className="mk-body"><HBars rows={p.keywords.map((k) => ({ key: k.q, label: k.q, value: k.n, text: num(k.n), color: 'var(--viz-1)' }))} /></div>
        <div className="ix-foot"><span>Top {p.keywords.length} of {num(T.search)} searches · bars to {num(max)}</span></div>
      </section>
    </>
  );
}

// ---- Q&A (placeholder) -------------------------------------------------------------------------------------------
function Questions({ g, t }) {
  const [open, setOpen] = useState(null);   // { id, text, error }
  const save = () => {
    const r = answerQuestion(open.id, open.text);
    if (!r.ok) { setOpen({ ...open, error: r.error }); return; }
    setOpen(null); toast('Answer saved (not sent to Google)');
  };
  const list = [...g.qa].sort((a, b) => (!a.a) - (!b.a) || b.at - a.at);
  return (
    <section className="ix-card" aria-labelledby="qa-head">
      <CardHead id="qa-head" title="Questions and answers" src={GBP_SUPPORT.qa} tip="Kept here for later. These questions are demo data and answers are not sent to Google." />
      <div className="mk-banner mk-banner--warn" style={{ margin: '0 var(--space-4) var(--space-3)' }}><Icon name="construction" width="18" height="18" aria-hidden="true" /><p>Placeholder: Q&amp;A is not connected to Google yet. Nothing here is published.</p></div>
      {list.map((q) => (
        <div key={q.id} className="gb-qa">
          <b>{q.q}</b>
          <small>Asked by {q.by} · {ago(q.at, t)}</small>
          {q.a ? <div className="gb-reply"><small>Answer · {ago(q.answeredAt, t)}</small><span>{q.a}</span></div> : null}
          {open && open.id === q.id ? (
            <div className="mk-form">
              <textarea className={'gc-input' + (open.error ? ' gc-input--error' : '')} aria-label="Answer" rows={3} value={open.text} onChange={(e) => setOpen({ ...open, text: e.target.value, error: '' })} />
              {open.error ? <p className="gc-help gc-help--error" role="alert">{open.error}</p> : null}
              <span className="gb-compose__row"><button type="button" className="ix-btn ix-btn--sm" onClick={() => setOpen(null)}>Cancel</button><button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={save}>Save answer</button></span>
            </div>
          ) : <span className="gb-compose__row"><button type="button" className="ix-btn ix-btn--sm" onClick={() => setOpen({ id: q.id, text: q.a || '', error: '' })}>{q.a ? 'Edit answer' : 'Answer'}</button></span>}
        </div>
      ))}
    </section>
  );
}
