'use client';
// Marketing › Google Business (/google-business?tab=&loc=&review=) — connected from Connections; its reviews also
// come into the Inbox. The shop on Google Search and Maps, laid out like a Shopify channel app: the connection with
// its figures (locations, verified, needing attention, new reviews), then six views:
//   Locations      a compact list (status, open now, rating); a row opens its Business info (with View on Google);
//                  hours that Google wants confirmed show as one line with Review
//   Reviews        views (all, unanswered, 5 / 4 / 3-or-below stars) and a location filter; reply or edit a reply; an
//                  AI draft is secondary and never published by itself (Use reply / Regenerate / Edit, then Publish)
//   Business info  name, category, description, phone, website, address, opening hours (Copy Monday to all, closed
//                  days), special hours, attributes — per location, with a sticky bar (place, View on Google, Save)
//   Posts          published, drafts, scheduled; the editor has image, text, button, link and a live preview
//   Media          photos by kind and location; add and remove
//   Services       what the shop offers, with an optional price; a row opens it (Save or Remove)
// Settings, Disconnect and Sync now are in the header. Data: src/lib/channels.js (Google Business section).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { EmptyState, Sheet, PhoneActionBar, InfoTip } from '@/components/ui';
import { ShopHeader, IndexTabs, KV, LearnMore } from '@/components/ui/IndexKit';
import {
  channelBy, gbpLocations, gbpLocation, openNow, time12, confirmHours, getInfo, saveInfo, CATEGORIES, ATTRIBUTES, WEEK,
  getReviews, saveReply, aiReply, getPosts, savePost, deletePost, CTAS, getMedia, addMedia, removeMedia, MEDIA_KINDS,
  getServices, saveService, removeService, startSync, disconnect, ago, agoLow, inTime, syncJob, connectHref,
} from '@/lib/channels';
import { ChannelFrame, ChannelLogo, ConnCard, SyncState, StatusTag, useChannels, readImage } from './chShared';

const TABS = [['locations', 'Locations'], ['reviews', 'Reviews'], ['info', 'Business info'], ['posts', 'Posts'], ['media', 'Media'], ['services', 'Services']];
const TIMES = Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayLabel = (iso) => { const d = new Date(iso + 'T00:00:00'); return isNaN(d) ? iso : `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
const mapsUrl = (l) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(l.name + ' ' + l.area);

// shared with the Inbox's Reviews view (screens/merchant-inbox), which loads it with CH_CSS
export const GB_CSS = `
.gb-tabbar{display:flex;min-width:0}
.gb-panel{display:flex;flex-direction:column;gap:var(--space-4);min-width:0}
.gb-todo{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-4);border-bottom:1px solid var(--border-subtle);background:var(--fill-warning-soft);font-size:var(--text-sm);color:var(--text-heading)}
.gb-todo>svg{flex:none;color:var(--text-warning)}
.gb-todo>span{flex:1;min-width:0}
.gb-loc{display:flex;flex-direction:column;min-width:0}
.gb-loc small{font-size:var(--text-xs);color:var(--text-muted)}
.gb-open{color:var(--text-success);font-weight:var(--weight-medium)}
.gb-closed{color:var(--text-danger);font-weight:var(--weight-medium)}
.gb-stars{display:inline-flex;gap:1px;color:var(--warning)}
.gb-stars .off{color:var(--slate-300)}
.gb-sum{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-1) var(--space-4);padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-muted)}
.gb-sum b{font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.gb-reviews{display:flex;flex-direction:column}
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
.gb-compose{display:flex;flex-direction:column;align-items:flex-start;gap:var(--space-2);margin-left:42px}
.gb-compose>label,.gb-compose>textarea,.gb-compose>.gb-ai,.gb-compose>.gb-compose__row{align-self:stretch}
.gb-compose textarea{min-height:88px;resize:vertical}
.gb-compose__row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.gb-ai{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--fill-primary-soft)}
.gb-ai b{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--primary)}
.gb-ai p{margin:0;font-size:var(--text-sm);color:var(--text-heading)}
.gb-form{display:flex;flex-direction:column;gap:var(--space-4)}
.gb-body{display:flex;flex-direction:column;gap:var(--space-3)}
.gb-h2tip{display:inline-flex;align-items:center;gap:4px}
.gb-grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.gb-locpick{display:inline-flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-body)}
.gb-hour{display:grid;grid-template-columns:110px 110px minmax(0,1fr);align-items:center;gap:var(--space-3);min-height:44px;border-top:1px solid var(--border-subtle)}
.gb-hours>.gb-hour:first-child{border-top:0}
.gb-hour__day{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.gb-hour__times{display:flex;align-items:center;gap:var(--space-2);min-width:0}
.gb-hour__times .gc-input{max-width:150px}
.gb-toggle{display:inline-flex;align-items:center;gap:var(--space-2);min-height:32px;border:0;background:none;padding:0;font:inherit;font-size:var(--text-sm);color:var(--text-body);cursor:pointer}
.gb-special{display:grid;grid-template-columns:150px minmax(0,1fr) 110px minmax(0,1.3fr) 32px;align-items:center;gap:var(--space-3);padding:var(--space-2) 0;border-top:1px solid var(--border-subtle)}
.gb-count{margin:var(--space-1) 0 0;font-size:var(--text-xs);color:var(--text-muted)}
/* Business info's bar: the place, View on Google, and Save — sticky under the top bar (the GridAI button sits bottom right) */
.gb-bar{position:sticky;top:calc(var(--header-height) + var(--space-2));z-index:5;display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-card)}
.gb-bar__save{display:flex;flex:1;align-items:center;justify-content:flex-end;gap:var(--space-2)}
.gb-bar__save small{margin-right:auto;padding-left:var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.gb-posts{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,240px),1fr));gap:var(--space-3);padding:var(--space-4)}
.gb-post{display:flex;flex-direction:column;min-width:0;overflow:hidden;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.gb-post__img{display:grid;place-items:center;aspect-ratio:16/9;color:var(--text-heading);overflow:hidden}
.gb-post__img img{width:100%;height:100%;object-fit:cover}
.gb-post__body{display:flex;flex-direction:column;gap:var(--space-2);flex:1;padding:var(--space-3)}
.gb-post__text{margin:0;font-size:var(--text-sm);color:var(--text-body);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.gb-post__meta{font-size:var(--text-xs);color:var(--text-muted)}
.gb-post__foot{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);padding:var(--space-1) var(--space-2) var(--space-1) var(--space-3);border-top:1px solid var(--border-subtle)}
.gb-cta{display:inline-flex;align-self:flex-start;align-items:center;height:24px;padding:0 var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--primary)}
.gb-prev{border:1px solid var(--border-subtle);border-radius:var(--radius-xl);overflow:hidden;background:var(--surface-card)}
.gb-prev__head{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-3) var(--space-4);font-size:var(--text-xs);color:var(--text-muted)}
.gb-prev__head b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.gb-media{display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:var(--space-3);padding:var(--space-4)}
.gb-tile{position:relative;display:grid;place-items:center;aspect-ratio:1;margin:0;overflow:hidden;border-radius:var(--radius-lg);color:var(--text-heading)}
.gb-tile img{width:100%;height:100%;object-fit:cover}
.gb-tile__kind{position:absolute;left:8px;bottom:8px;padding:2px 8px;border-radius:var(--radius-full);background:var(--surface-card);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body)}
.gb-tile__del{position:absolute;top:6px;right:6px;background:var(--surface-card)!important;box-shadow:var(--shadow-sm)}
.gb-svc{display:flex;align-items:center;gap:var(--space-3);width:100%;min-height:48px;padding:var(--space-2) var(--space-4);border:0;border-top:1px solid var(--border-subtle);background:none;font:inherit;text-align:left;color:inherit;cursor:pointer}
.gb-svc:last-child{border-radius:0 0 var(--radius-xl) var(--radius-xl)}
.gb-svc:hover{background:var(--surface-subtle)}
.gb-svc__text{display:flex;flex-direction:column;flex:1;min-width:0}
.gb-svc__text b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.gb-svc__text small{font-size:var(--text-xs);color:var(--text-muted)}
.gb-svc__price{font-family:var(--font-data);font-size:var(--text-sm);color:var(--text-heading);white-space:nowrap}
@media (max-width:640px){
  .gb-grid2{grid-template-columns:minmax(0,1fr)}
  .gb-hour{grid-template-columns:minmax(0,1fr) auto;padding:var(--space-2) 0}
  .gb-hour__times{grid-column:1 / -1}
  .gb-hour__times .gc-input{max-width:none;flex:1}
  .gb-special{grid-template-columns:minmax(0,1fr) auto;padding:var(--space-3) 0}
  .gb-special>:nth-child(2){grid-column:1 / -1}
  .gb-special>:nth-child(4){grid-column:1 / -1}
  .gb-reply,.gb-compose,.gb-review>p{margin-left:0}
  .gb-review__head .gc-badge{display:none}
  .gb-bar{position:static}
  .gb-bar__save{display:none}
  .gb-todo{flex-wrap:wrap}
}
`;

const Stars = ({ n, size = 14 }) => (
  <span className="gb-stars" role="img" aria-label={`${n} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((i) => <Icon key={i} name="star" width={size} height={size} className={i <= n ? '' : 'off'} fill="currentColor" aria-hidden="true" />)}
  </span>
);

export default function GoogleBusiness() {
  const router = useRouter();
  const { ready, c } = useChannels();
  const [tab, setTab] = useState('locations');
  const [review, setReview] = useState(null);     // location whose hours are being confirmed
  const [loc, setLoc] = useState('');             // location for Business info and Media
  const meta = channelBy('gbp');
  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    const t = u.get('tab');
    if (t && TABS.some((x) => x[0] === t)) setTab(t);
    if (u.get('review')) setReview(u.get('review'));
    if (u.get('loc')) setLoc(u.get('loc'));
  }, []);
  const go = (t, extra) => {
    setTab(t);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', t);
    ['review', 'loc'].forEach((k) => url.searchParams.delete(k));
    if (extra && extra.loc) { url.searchParams.set('loc', extra.loc); setLoc(extra.loc); }
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
  };

  const frame = (body) => <ChannelFrame screen="GoogleBusiness" active="ch-gbp" page="Google Business" crumb="Marketing" css={GB_CSS}>{body}</ChannelFrame>;
  const head = (acts) => <ShopHeader icon="map-pin" title="Google Business" about="Your shop on Google Search and Maps." {...acts} />;
  if (!ready) return frame(head({}));
  const conn = c.conn.gbp;
  if (!conn) {
    return frame(<>
      {head({ primary: { label: meta.empty.action, href: connectHref('gbp') } })}
      <section className="ix-card ix-empty">
        <EmptyState icon="map-pin" title={meta.empty.title} body={meta.empty.body} actionLabel={meta.empty.action} onAction={() => router.push(connectHref('gbp'))} />
      </section>
    </>);
  }

  const locs = gbpLocations();
  const reviews = getReviews();
  const fresh = reviews.filter((r) => !r.reply && c.now - r.at < 7 * 864e5).length;
  const unanswered = reviews.filter((r) => !r.reply).length;
  const attention = locs.filter((l) => l.st === 'attention').length;
  const job = syncJob('gbp', c);
  const doDisconnect = async () => {
    if (!(await confirmDialog({ title: 'Disconnect Google Business?', body: 'Your profile stays on Google, but hours, posts and replies stop updating from GridCommerce.', confirmLabel: 'Disconnect', tone: 'danger' }))) return;
    disconnect('gbp'); toast('Google Business disconnected');
  };
  const curLoc = loc && locs.some((l) => l.id === loc) ? loc : locs[0].id;
  const tabs = TABS.map(([id, label]) => ({ key: id, id: 'gb-tab-' + id, label, count: id === 'reviews' && unanswered ? unanswered : null, on: tab === id, onClick: () => go(id) }));

  return frame(<>
    {head({
      secondary: [{ label: 'Settings', href: '/channel-settings#gbp' }],
      more: [{ label: 'Disconnect', onClick: doDisconnect, tone: 'danger' }],
      primary: { label: 'Sync now', onClick: () => { if (startSync('gbp')) toast('Syncing Google Business…'); }, disabled: !!job },
    })}

    <ConnCard ch="gbp" title="Google Search & Maps" since={`${conn.account} · last sync ${job ? 'now' : agoLow(conn.lastSync, c.now)}`} facts={[
      ['Locations', <span className="ch-data">{locs.length}</span>],
      ['Verified', <span className="ch-data">{locs.filter((l) => l.st === 'verified').length}</span>],
      ['Need attention', <span className={'ch-data' + (attention ? ' ix-warn' : '')}>{attention}</span>],
      ['New reviews', <span className="ch-data">{fresh}</span>],
    ]} />

    <SyncState ch="gbp" c={c} />

    <div className="gb-tabbar"><IndexTabs tabs={tabs} label="Google Business" /></div>

    <div id="gb-panel" role="tabpanel" aria-labelledby={'gb-tab-' + tab} className="gb-panel">
      {tab === 'locations' ? <Locations locs={locs} now={c.now} onReview={setReview} onManage={(id) => go('info', { loc: id })} /> : null}
      {tab === 'reviews' ? <Reviews reviews={reviews} locs={locs} now={c.now} /> : null}
      {tab === 'info' ? <BusinessInfo key={curLoc} locs={locs} loc={curLoc} setLoc={(id) => go('info', { loc: id })} /> : null}
      {tab === 'posts' ? <Posts now={c.now} locs={locs} /> : null}
      {tab === 'media' ? <Media key={curLoc} locs={locs} loc={curLoc} setLoc={(id) => go('media', { loc: id })} /> : null}
      {tab === 'services' ? <Services /> : null}
    </div>
    <LearnMore topic="Google Business" />

    <HoursReview id={review} onClose={() => setReview(null)} onEdit={(id) => { setReview(null); go('info', { loc: id }); }} />
  </>);
}

// ---- Locations ----------------------------------------------------------------------------------------------
function Locations({ locs, now, onReview, onManage }) {
  const due = locs.filter((l) => l.st === 'attention');
  return (
    <section className="ix-card" aria-label="Locations">
      {due.map((l) => (
        <div key={l.id} className="gb-todo" role="status">
          <Icon name="triangle-alert" width="16" height="16" aria-hidden="true" />
          <span>Opening hours need confirmation · {l.name}</span>
          <button type="button" className="ix-btn ix-btn--sm" onClick={() => onReview(l.id)}>Review</button>
        </div>
      ))}
      <ul className="ix-plist" aria-label="Locations">
        {locs.map((l) => {
          const o = openNow(l, now);
          return (
            <li key={l.id}>
              <button type="button" className="ix-pitem" onClick={() => onManage(l.id)}>
                <span className="ix-pitem__top"><b>{l.name}</b><StatusTag st={l.st === 'verified' ? 'verified' : 'attention'} /></span>
                <span className="ix-pitem__mid">{o.text} · ★ {l.rating} · {l.reviews} reviews</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="ix-table-wrap">
        <table className="ix-table gc-table--keep">
          <caption className="sr-only">Locations on Google</caption>
          <thead><tr><th scope="col">Location</th><th scope="col">Status</th><th scope="col">Now</th><th scope="col">Rating</th></tr></thead>
          <tbody>
            {locs.map((l) => {
              const o = openNow(l, now);
              return (
                <tr key={l.id} onClick={() => onManage(l.id)}>
                  <td><span className="gb-loc"><span className="ix-strong">{l.name}</span><small>{l.serviceArea || l.area}</small></span></td>
                  <td><StatusTag st={l.st === 'verified' ? 'verified' : 'attention'} /></td>
                  <td><span className={o.open ? 'gb-open' : 'gb-closed'}>{o.text}</span>{o.sub ? <span className="ix-muted"> · {o.sub}</span> : null}</td>
                  <td><span className="ch-data ix-strong">{l.rating}</span> <span className="ix-muted">· {l.reviews} reviews</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function HoursReview({ id, onClose, onEdit }) {
  const l = id ? gbpLocation(id) : null;
  if (!l) return null;
  const done = () => { confirmHours(l.id); toast('Hours confirmed'); onClose(); };
  return (
    <Sheet open title={`Confirm hours · ${l.name}`} onClose={onClose}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => onEdit(l.id)}>Edit hours</button><button type="button" className="gc-btn gc-btn--solid" onClick={done}>Hours are correct</button></>}>
      <div className="ch-sheet">
        <p className="gc-help" style={{ margin: 0 }}>Google asked you to check these hours. Customers see them on Search and Maps.</p>
        <KV rows={WEEK.map(([d, name]) => [name, l.hours[d] && l.hours[d].open ? `${time12(l.hours[d].from)} – ${time12(l.hours[d].to)}` : 'Closed'])} />
      </div>
    </Sheet>
  );
}

// ---- Reviews ------------------------------------------------------------------------------------------------
const RV_FILTERS = [['all', 'All'], ['open', 'Unanswered'], ['5', '5 star'], ['4', '4 star'], ['low', '3 star or below']];
/** The review list with replies and AI drafts. Also the Inbox's Reviews view. */
export function Reviews({ reviews, locs, now }) {
  const [f, setF] = useState('all');
  const [where, setWhere] = useState('');
  const list = reviews.filter((r) => (f === 'all' || (f === 'open' ? !r.reply : f === 'low' ? r.stars <= 3 : r.stars === Number(f))) && (!where || r.loc === where));
  const avg = locs.reduce((a, l) => a + l.rating * l.reviews, 0) / Math.max(1, locs.reduce((a, l) => a + l.reviews, 0));
  const total = locs.reduce((a, l) => a + l.reviews, 0);
  const unanswered = reviews.filter((r) => !r.reply).length;
  const tabs = RV_FILTERS.map(([id, label]) => ({ key: id, id: 'rv-tab-' + id, label, count: id === 'open' && unanswered ? unanswered : null, on: f === id, onClick: () => setF(id) }));
  return (
    <section className="ix-card" aria-label="Reviews">
      <div className="gb-sum">
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><b>{avg.toFixed(1)}</b><Stars n={Math.round(avg)} /></span>
        <span>{total.toLocaleString('en-IN')} reviews</span>
        <span className={unanswered ? 'ix-warn' : ''}>{unanswered} waiting for a reply</span>
      </div>
      <div className="ix-bar">
        <IndexTabs tabs={tabs} label="Show reviews" />
        {locs.length > 1 ? (
          <span className="ix-tools">
            <select className={'ix-filter' + (where ? ' is-set' : '')} aria-label="Location" value={where} onChange={(e) => setWhere(e.target.value)}>
              <option value="">All locations</option>
              {locs.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </span>
        ) : null}
      </div>
      {list.length ? <div className="gb-reviews">{list.map((r) => <ReviewCard key={r.id} r={r} loc={locs.find((l) => l.id === r.loc)} now={now} />)}</div>
        : <div className="ix-empty"><EmptyState icon="message-square-text" title={f === 'open' ? 'All reviews have a reply' : 'No reviews here'} body={f === 'open' ? 'Nice work. New reviews will show up here.' : 'Try another filter.'} actionLabel={f !== 'all' || where ? 'Show all reviews' : undefined} onAction={() => { setF('all'); setWhere(''); }} /></div>}
    </section>
  );
}

function ReviewCard({ r, loc, now }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');
  const [ai, setAi] = useState(null);        // { text, n } | 'busy'
  const box = useRef(null);
  const start = () => { setText(r.reply || ''); setEditing(true); setAi(null); setTimeout(() => box.current && box.current.focus(), 0); };
  const gen = (n) => { setAi('busy'); setTimeout(() => setAi({ text: aiReply(r, n), n }), 900); };
  const publish = () => { if (!text.trim()) return; saveReply(r.id, text); setEditing(false); setAi(null); toast('Reply published'); };
  return (
    <article className="gb-review" aria-label={`Review by ${r.name}`}>
      <div className="gb-review__head">
        <span className="gb-avatar" aria-hidden="true">{r.name.charAt(0)}</span>
        <span className="gb-review__who"><b>{r.name}</b><small><Stars n={r.stars} size={12} /><span>{ago(r.at, now)}</span>{loc ? <span>· {loc.name}</span> : null}</small></span>
        {!r.reply && !editing ? <span className="gc-badge gc-badge--warning"><Icon name="message-square-text" width="12" height="12" aria-hidden="true" />No reply yet</span> : null}
      </div>
      <p>{r.text}</p>
      {r.reply && !editing ? (
        <div className="gb-reply">
          <small>Your reply · {ago(r.replyAt, now)}</small>
          <span>{r.reply}</span>
          <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" style={{ alignSelf: 'flex-start', marginLeft: -10 }} onClick={start}><Icon name="pencil" width="16" height="16" aria-hidden="true" />Edit reply</button>
        </div>
      ) : null}
      {!r.reply && !editing ? <div className="gb-compose"><button type="button" className="ix-btn ix-btn--sm" onClick={start}><Icon name="reply" width="16" height="16" aria-hidden="true" />Reply</button></div> : null}
      {editing ? (
        <div className="gb-compose">
          <label className="gc-label" htmlFor={'rp-' + r.id}>{r.reply ? 'Edit your reply' : 'Your reply'}</label>
          <textarea ref={box} id={'rp-' + r.id} className="gc-input" value={text} maxLength={4000} onChange={(e) => setText(e.target.value)} placeholder="Write a short, friendly reply" />
          {ai === 'busy' ? <div className="gb-ai" role="status"><b><span className="ch-spin" aria-hidden="true" /> Writing a draft…</b></div> : null}
          {ai && ai !== 'busy' ? (
            <div className="gb-ai" role="region" aria-label="AI suggested reply">
              <b><Icon name="sparkles" width="14" height="14" aria-hidden="true" /> AI suggested reply</b>
              <p>{ai.text}</p>
              <div className="gb-compose__row">
                <button type="button" className="ix-btn ix-btn--sm" onClick={() => { setText(ai.text); setAi(null); }}>Use reply</button>
                <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => gen(ai.n + 1)}>Regenerate</button>
                <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setText(ai.text); setAi(null); setTimeout(() => box.current && box.current.focus(), 0); }}>Edit</button>
              </div>
              <small className="gc-help" style={{ margin: 0 }}>Check it before you publish. Nothing is posted until you press Publish reply.</small>
            </div>
          ) : null}
          <div className="gb-compose__row">
            {ai ? null : <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => gen(0)}><Icon name="sparkles" width="16" height="16" aria-hidden="true" />Generate AI reply</button>}
            <span style={{ flex: 1 }} />
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => { setEditing(false); setAi(null); }}>Cancel</button>
            <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={publish} disabled={!text.trim()}>Publish reply</button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

// ---- Business info ------------------------------------------------------------------------------------------
/** The place being edited (when there are several) and its profile on Google Maps, for the top of a view. */
function LocPicker({ locs, loc, setLoc, label = 'Location' }) {
  const l = locs.find((x) => x.id === loc) || locs[0];
  return (<>
    {locs.length > 1 ? (
      <span className="gb-locpick">
        <label htmlFor="gb-loc">{label}</label>
        <select id="gb-loc" className="ix-pick" value={loc} onChange={(e) => setLoc(e.target.value)}>
          {locs.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
      </span>
    ) : null}
    {l ? <a className="ix-btn ix-btn--sm ix-btn--plain" href={mapsUrl(l)} target="_blank" rel="noreferrer">View on Google<Icon name="external-link" width="14" height="14" aria-hidden="true" /></a> : null}
  </>);
}

function BusinessInfo({ locs, loc, setLoc }) {
  const start = useMemo(() => getInfo(loc), [loc]);
  const [v, setV] = useState(start);
  const [saved, setSaved] = useState(start);
  const isDirty = JSON.stringify(v) !== JSON.stringify(saved);
  const set = (patch) => setV({ ...v, ...patch });
  const setDay = (d, patch) => set({ hours: { ...v.hours, [d]: { ...v.hours[d], ...patch } } });
  const copyMon = () => { const m = v.hours.mon; set({ hours: Object.fromEntries(WEEK.map(([d]) => [d, { ...m }])) }); toast('Monday copied to every day'); };
  const setSp = (id, patch) => set({ special: v.special.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  const addSp = () => set({ special: [...v.special, { id: 'sp' + Date.now().toString(36), date: '', label: '', open: false, from: '10:00', to: '20:00' }] });
  const save = (e) => {
    if (e) e.preventDefault();
    if (!v.name.trim()) { toast('Add the business name', { tone: 'error' }); return; }
    saveInfo(loc, v); setSaved(v);
    toast('Saved. Google can take up to 3 days to show changes.');
  };
  const one = locs.length === 1;
  const timeSelect = (label, value, onChange) => <select className="gc-input gc-select" aria-label={label} value={value} onChange={onChange}>{TIMES.map((t) => <option key={t} value={t}>{time12(t)}</option>)}</select>;
  return (
    <form id="gb-info" className="gb-form" onSubmit={save} noValidate>
      <div className="gb-bar">
        <LocPicker locs={locs} loc={loc} setLoc={(id) => { if (isDirty) toast('Unsaved changes were left behind'); setLoc(id); }} />
        <span className="gb-bar__save">
          <small>{isDirty ? 'You have unsaved changes.' : 'Changes can take up to 3 days to show on Google.'}</small>
          <button type="button" className="ix-btn" disabled={!isDirty} onClick={() => setV(saved)}>Discard</button>
          <button type="submit" className="ix-btn ix-btn--primary" disabled={!isDirty}>Save changes</button>
        </span>
      </div>
      <section className="ix-card ix-card--open" aria-labelledby="gb-about">
        <header className="ix-card__head"><h2 id="gb-about">About</h2></header>
        <div className="ix-card__body gb-body">
          <div className="gb-grid2">
            <div><label className="gc-label" htmlFor="gb-name">Business name</label><input id="gb-name" className="gc-input" value={v.name} onChange={(e) => set({ name: e.target.value })} /></div>
            <div><label className="gc-label" htmlFor="gb-cat">Category</label><select id="gb-cat" className="gc-input gc-select" value={v.category} onChange={(e) => set({ category: e.target.value })}>{CATEGORIES.map((x) => <option key={x}>{x}</option>)}</select></div>
          </div>
          <div>
            <label className="gc-label gb-h2tip" htmlFor="gb-desc">Description <InfoTip text="What you sell and why people come to you." /></label>
            <textarea id="gb-desc" className="gc-input" rows={3} maxLength={750} value={v.description} onChange={(e) => set({ description: e.target.value })} style={{ minHeight: 88 }} />
            <p className="gb-count">{v.description.length} / 750</p>
          </div>
        </div>
      </section>
      <section className="ix-card" aria-labelledby="gb-contact">
        <header className="ix-card__head"><h2 id="gb-contact">Contact and address</h2></header>
        <div className="ix-card__body gb-body">
          <div className="gb-grid2">
            <div><label className="gc-label" htmlFor="gb-phone">Phone</label><input id="gb-phone" className="gc-input" inputMode="tel" value={v.phone} onChange={(e) => set({ phone: e.target.value })} /></div>
            <div><label className="gc-label" htmlFor="gb-web">Website</label><input id="gb-web" className="gc-input" inputMode="url" value={v.website} onChange={(e) => set({ website: e.target.value })} /></div>
          </div>
          <div>
            <label className="gc-label" htmlFor="gb-addr">{one && v.address.includes('hidden') ? 'Address (hidden from customers)' : 'Address'}</label>
            <textarea id="gb-addr" className="gc-input" rows={2} value={v.address} onChange={(e) => set({ address: e.target.value })} style={{ minHeight: 60 }} />
          </div>
        </div>
      </section>
      <section className="ix-card" aria-labelledby="gb-hours">
        <header className="ix-card__head"><h2 id="gb-hours">Opening hours</h2><button type="button" className="ix-btn ix-btn--sm" onClick={copyMon}><Icon name="copy" width="16" height="16" aria-hidden="true" />Copy Monday to all</button></header>
        <div className="ix-card__body gb-hours">
          {WEEK.map(([d, name]) => {
            const h = v.hours[d] || { open: false, from: '10:00', to: '20:00' };
            return (
              <div key={d} className="gb-hour">
                <span className="gb-hour__day">{name}</span>
                <button type="button" className="gb-toggle" role="switch" aria-checked={!!h.open} aria-label={`${name} open`} onClick={() => setDay(d, { open: !h.open })}>
                  <span className="gc-switch" aria-hidden="true"><span className="gc-switch__knob" /></span>{h.open ? 'Open' : 'Closed'}
                </button>
                <span className="gb-hour__times">
                  {h.open ? (<>
                    {timeSelect(`${name} opens at`, h.from, (e) => setDay(d, { from: e.target.value }))}
                    <span className="ix-muted">—</span>
                    {timeSelect(`${name} closes at`, h.to, (e) => setDay(d, { to: e.target.value }))}
                  </>) : <span className="ix-muted" style={{ fontSize: 'var(--text-sm)' }}>Closed all day</span>}
                </span>
              </div>
            );
          })}
        </div>
      </section>
      <section className="ix-card ix-card--open" aria-labelledby="gb-special">
        <header className="ix-card__head"><h2 id="gb-special" className="gb-h2tip">Special hours <InfoTip text="Holidays and other days with different hours." /></h2><button type="button" className="ix-btn ix-btn--sm" onClick={addSp}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add a date</button></header>
        <div className="ix-card__body" style={{ paddingTop: v.special.length ? undefined : 0 }}>
          {v.special.map((s) => (
            <div key={s.id} className="gb-special">
              <input type="date" className="gc-input" aria-label="Date" value={s.date} onChange={(e) => setSp(s.id, { date: e.target.value })} />
              <input className="gc-input" aria-label="Name of the day" placeholder="e.g. Victory Day" value={s.label} onChange={(e) => setSp(s.id, { label: e.target.value })} />
              <button type="button" className="gb-toggle" role="switch" aria-checked={!!s.open} aria-label={`${s.label || dayLabel(s.date)} open`} onClick={() => setSp(s.id, { open: !s.open })}><span className="gc-switch" aria-hidden="true"><span className="gc-switch__knob" /></span>{s.open ? 'Open' : 'Closed'}</button>
              <span className="gb-hour__times">{s.open ? (<>
                {timeSelect('Opens at', s.from, (e) => setSp(s.id, { from: e.target.value }))}
                <span className="ix-muted">—</span>
                {timeSelect('Closes at', s.to, (e) => setSp(s.id, { to: e.target.value }))}
              </>) : <span className="ix-muted" style={{ fontSize: 'var(--text-sm)' }}>Closed all day</span>}</span>
              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Remove ${s.label || 'this date'}`} onClick={() => set({ special: v.special.filter((x) => x.id !== s.id) })}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button>
            </div>
          ))}
        </div>
      </section>
      <section className="ix-card ix-card--open" aria-labelledby="gb-attrs">
        <header className="ix-card__head"><h2 id="gb-attrs" className="gb-h2tip">Attributes <InfoTip text="Tap what is true for this place. Google shows them on your profile." /></h2></header>
        <div className="ix-card__body">
          <div className="ix-chips">
            {ATTRIBUTES.map(([k, label]) => <button key={k} type="button" className="ix-chip" aria-pressed={!!v.attrs[k]} onClick={() => set({ attrs: { ...v.attrs, [k]: !v.attrs[k] } })}>{v.attrs[k] ? <Icon name="check" width="14" height="14" aria-hidden="true" /> : null}{label}</button>)}
          </div>
        </div>
      </section>
      <PhoneActionBar note={isDirty ? 'Unsaved changes' : null}>
        <button type="submit" form="gb-info" className="gc-btn gc-btn--solid" disabled={!isDirty}>Save changes</button>
      </PhoneActionBar>
    </form>
  );
}

// ---- Posts --------------------------------------------------------------------------------------------------
const POST_TABS = [['published', 'Published'], ['draft', 'Drafts'], ['scheduled', 'Scheduled']];
const BLANK_POST = { st: 'draft', text: '', cta: 'order', link: 'https://gridshop.com.bd', tone: '#e7efff', icon: 'store', locs: 'all' };
function Posts({ now, locs }) {
  const [f, setF] = useState('published');
  const [edit, setEdit] = useState(null);
  const posts = getPosts();
  const list = posts.filter((p) => p.st === f).sort((a, b) => (f === 'scheduled' ? a.at - b.at : b.at - a.at));
  const del = async (p) => { if (await confirmDialog({ title: 'Delete this post?', body: p.st === 'published' ? 'It is removed from Google too.' : 'The post is deleted.', confirmLabel: 'Delete', tone: 'danger' })) { deletePost(p.id); toast('Post deleted'); } };
  const tabs = POST_TABS.map(([id, label]) => ({ key: id, id: 'po-tab-' + id, label, count: posts.filter((p) => p.st === id).length, on: f === id, onClick: () => setF(id) }));
  return (
    <section className="ix-card" aria-label="Posts">
      <div className="ix-bar">
        <IndexTabs tabs={tabs} label="Show posts" />
        <span className="ix-tools"><button type="button" className="ix-btn ix-btn--sm" onClick={() => setEdit({ ...BLANK_POST })}><Icon name="plus" width="16" height="16" aria-hidden="true" />Create post</button></span>
      </div>
      {list.length ? (
        <div className="gb-posts">
          {list.map((p) => (
            <article key={p.id} className="gb-post">
              <div className="gb-post__img" style={{ background: p.tone || 'var(--surface-subtle)' }}>{p.img ? <img src={p.img} alt="" /> : <Icon name={p.icon || 'image'} width="32" height="32" aria-hidden="true" />}</div>
              <div className="gb-post__body">
                <p className="gb-post__text">{p.text}</p>
                {p.cta ? <span className="gb-cta">{(CTAS.find((x) => x[0] === p.cta) || [])[1]}</span> : null}
                <span className="gb-post__meta">{p.st === 'published' ? `Published ${agoLow(p.at, now)}${p.views ? ' · seen ' + p.views.toLocaleString('en-IN') + ' times' : ''}` : p.st === 'scheduled' ? `Goes live ${inTime(p.at, now)}` : `Draft · edited ${agoLow(p.at, now)}`}{locs.length > 1 ? ' · all locations' : ''}</span>
              </div>
              <div className="gb-post__foot">
                <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setEdit(p)}><Icon name="pencil" width="16" height="16" aria-hidden="true" />Edit</button>
                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Delete post" onClick={() => del(p)}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button>
              </div>
            </article>
          ))}
        </div>
      ) : <div className="ix-empty"><EmptyState icon="newspaper" title={f === 'draft' ? 'No drafts' : f === 'scheduled' ? 'Nothing scheduled' : 'No posts yet'} body="Posts show on your Google profile: offers, news and new arrivals." actionLabel="Create post" onAction={() => setEdit({ ...BLANK_POST })} /></div>}
      <PostEditor post={edit} onClose={() => setEdit(null)} onSaved={(st) => setF(st)} />
    </section>
  );
}

function PostEditor({ post, onClose, onSaved }) {
  const [v, setV] = useState(null);
  const [when, setWhen] = useState('now');
  const [at, setAt] = useState('');
  const file = useRef(null);
  useEffect(() => { if (post) { setV({ ...post }); setWhen(post.st === 'scheduled' ? 'later' : 'now'); setAt(post.st === 'scheduled' ? new Date(post.at - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''); } else setV(null); }, [post]);
  if (!post || !v) return null;
  const set = (patch) => setV({ ...v, ...patch });
  const pick = async (e) => { const f = e.target.files && e.target.files[0]; if (!f) return; try { set({ img: await readImage(f, 960) }); } catch (x) { toast(x.message, { tone: 'error' }); } };
  const needLink = v.cta && v.cta !== 'call';
  const ok = v.text.trim().length > 0 && (!needLink || /^https?:\/\/\S+\.\S+/.test(v.link || '')) && (when === 'now' || at);
  const finish = (st) => {
    const rec = { ...v, st, at: st === 'scheduled' ? new Date(at).getTime() : Date.now() };
    savePost(rec);
    toast(st === 'published' ? 'Post published' : st === 'scheduled' ? 'Post scheduled' : 'Draft saved');
    onSaved(st); onClose();
  };
  const ctaLabel = (CTAS.find((x) => x[0] === v.cta) || [])[1];
  const radio = { display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', minHeight: 32 };
  return (
    <Sheet open title={post.id ? 'Edit post' : 'Create post'} onClose={onClose}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => finish('draft')} disabled={!v.text.trim()}>Save draft</button><button type="button" className="gc-btn gc-btn--solid" onClick={() => finish(when === 'now' ? 'published' : 'scheduled')} disabled={!ok}>{when === 'now' ? 'Publish' : 'Schedule'}</button></>}>
      <div className="ch-sheet">
        <div>
          <span className="gc-label">Image</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span className="ch-preview" style={{ width: 96, height: 72, background: v.img ? undefined : v.tone }}>{v.img ? <img src={v.img} alt="Post image" /> : <Icon name={v.icon || 'image'} width="24" height="24" aria-hidden="true" />}</span>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => file.current && file.current.click()}><Icon name="upload" width="16" height="16" aria-hidden="true" /> {v.img ? 'Change' : 'Add image'}</button>
            {v.img ? <button type="button" className="gc-btn gc-btn--sm gc-btn--flat" onClick={() => set({ img: null })}>Remove</button> : null}
          </span>
          <input ref={file} type="file" accept="image/*" hidden onChange={pick} />
        </div>
        <div>
          <label className="gc-label" htmlFor="po-text">Text</label>
          <textarea id="po-text" className="gc-input" rows={4} maxLength={1500} value={v.text} onChange={(e) => set({ text: e.target.value })} placeholder="What’s new? An offer, new arrivals, holiday hours…" style={{ minHeight: 110 }} />
          <p className="gc-help">{v.text.length} / 1500</p>
        </div>
        <div className="gb-grid2">
          <div><label className="gc-label" htmlFor="po-cta">Button</label><select id="po-cta" className="gc-input gc-select" value={v.cta} onChange={(e) => set({ cta: e.target.value })}>{CTAS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          {needLink ? <div><label className="gc-label" htmlFor="po-link">Link</label><input id="po-link" className="gc-input" inputMode="url" value={v.link || ''} onChange={(e) => set({ link: e.target.value })} placeholder="https://" /></div> : <div />}
        </div>
        <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <legend className="gc-label">When</legend>
          <label style={radio}><input type="radio" className="gc-check gc-check--radio" name="po-when" checked={when === 'now'} onChange={() => setWhen('now')} /> Publish now</label>
          <label style={radio}><input type="radio" className="gc-check gc-check--radio" name="po-when" checked={when === 'later'} onChange={() => setWhen('later')} /> Schedule</label>
          {when === 'later' ? <input type="datetime-local" className="gc-input" aria-label="Publish on" value={at} onChange={(e) => setAt(e.target.value)} /> : null}
        </fieldset>
        <div>
          <span className="gc-label">Preview</span>
          <div className="gb-prev" aria-label="How the post looks on Google">
            <div className="gb-prev__head"><ChannelLogo ch="gbp" size={28} /><span><b>GridShop</b><br />{when === 'now' ? 'Just now' : 'Scheduled'}</span></div>
            <div className="gb-post__img" style={{ background: v.img ? undefined : v.tone }}>{v.img ? <img src={v.img} alt="" /> : <Icon name={v.icon || 'image'} width="32" height="32" aria-hidden="true" />}</div>
            <div className="gb-post__body"><p className="gb-post__text" style={{ WebkitLineClamp: 6 }}>{v.text || 'Your text shows here.'}</p>{v.cta ? <span className="gb-cta">{ctaLabel}</span> : null}</div>
          </div>
        </div>
      </div>
    </Sheet>
  );
}

// ---- Media --------------------------------------------------------------------------------------------------
function Media({ locs, loc, setLoc }) {
  const [kind, setKind] = useState('');
  const [, bump] = useState(0);
  const file = useRef(null);
  const all = getMedia(loc);
  const list = all.filter((m) => !kind || m.kind === kind);
  const add = async (e) => {
    const files = [...(e.target.files || [])].slice(0, 6);
    if (!files.length) return;
    const out = [];
    for (const f of files) { try { out.push({ id: 'm' + Date.now().toString(36) + out.length, kind: kind || 'products', img: await readImage(f, 640) }); } catch (x) { toast(x.message, { tone: 'error' }); } }
    if (out.length) { addMedia(loc, out); bump((x) => x + 1); toast(out.length === 1 ? 'Photo added' : `${out.length} photos added`); }
    e.target.value = '';
  };
  const del = async (m) => { if (await confirmDialog({ title: 'Remove this photo?', body: 'It is removed from your Google profile.', confirmLabel: 'Remove', tone: 'danger' })) { removeMedia(loc, m.id); bump((x) => x + 1); toast('Photo removed'); } };
  const kindName = (k) => (MEDIA_KINDS.find((x) => x[0] === k) || [])[1];
  const tabs = [['', 'All'], ...MEDIA_KINDS].map(([k, l]) => ({ key: k || 'all', id: 'md-tab-' + (k || 'all'), label: l, count: k ? all.filter((m) => m.kind === k).length : all.length, on: kind === k, onClick: () => setKind(k) }));
  const pickPhotos = () => file.current && file.current.click();
  return (
    <section className="ix-card" aria-label="Photos">
      <div className="ix-bar">
        <IndexTabs tabs={tabs} label="Photo type" />
        <span className="ix-tools">
          {locs.length > 1 ? (
            <select className="ix-filter is-set" aria-label="Location" value={loc} onChange={(e) => setLoc(e.target.value)}>
              {locs.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          ) : null}
          <button type="button" className="ix-btn ix-btn--sm" onClick={pickPhotos}><Icon name="upload" width="16" height="16" aria-hidden="true" />Add photos</button>
          <input ref={file} type="file" accept="image/*" multiple hidden onChange={add} />
        </span>
      </div>
      {list.length ? (
        <div className="gb-media">
          {list.map((m) => (
            <figure key={m.id} className="gb-tile" style={{ background: m.tone || 'var(--surface-subtle)' }}>
              {m.img ? <img src={m.img} alt={kindName(m.kind) + ' photo'} /> : <Icon name={m.icon || 'image'} width="28" height="28" aria-hidden="true" />}
              <figcaption className="gb-tile__kind">{kindName(m.kind)}</figcaption>
              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon gb-tile__del" aria-label="Remove photo" onClick={() => del(m)}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button>
            </figure>
          ))}
        </div>
      ) : <div className="ix-empty"><EmptyState icon="image" title="No photos here" body="Add photos of the shop front, the inside and your best products." actionLabel="Add photos" onAction={pickPhotos} /></div>}
    </section>
  );
}

// ---- Services -----------------------------------------------------------------------------------------------
function Services() {
  const [edit, setEdit] = useState(null);
  const [, bump] = useState(0);
  const list = getServices();
  const save = (e) => {
    e.preventDefault();
    if (!edit.name.trim()) return;
    saveService({ ...edit, name: edit.name.trim() }); setEdit(null); bump((x) => x + 1);
    toast('Service saved');
  };
  const del = async (s) => { if (await confirmDialog({ title: `Remove ${s.name}?`, body: 'It is removed from your Google profile.', confirmLabel: 'Remove', tone: 'danger' })) { removeService(s.id); setEdit(null); bump((x) => x + 1); toast('Service removed'); } };
  return (<>
    <section className="ix-card ix-card--open" aria-labelledby="gb-svc-h">
      <header className="ix-card__head">
        <h2 id="gb-svc-h" className="gb-h2tip">Services <InfoTip text="What you offer besides products. Shown on your Google profile." /></h2>
        <button type="button" className="ix-btn ix-btn--sm" onClick={() => setEdit({ name: '', desc: '', price: '' })}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add service</button>
      </header>
      {list.length ? (
        <div style={{ marginTop: 'var(--space-3)' }}>
          {list.map((s) => (
            <button key={s.id} type="button" className="gb-svc" onClick={() => setEdit({ ...s })} aria-label={`Edit ${s.name}`}>
              <span className="gb-svc__text"><b>{s.name}</b>{s.desc ? <small>{s.desc}</small> : null}</span>
              <span className="gb-svc__price">{s.price || ''}</span>
              <Icon name="chevron-right" width="16" height="16" aria-hidden="true" className="ix-muted" />
            </button>
          ))}
        </div>
      ) : <div className="ix-empty"><EmptyState icon="list-checks" title="No services yet" body="Add delivery, gift wrapping, repairs or anything else you offer." /></div>}
    </section>
    {edit ? (
      <Sheet open title={edit.id ? 'Edit service' : 'Add service'} onClose={() => setEdit(null)}
        footer={<>{edit.id ? <button type="button" className="gc-btn gc-btn--flat" style={{ marginRight: 'auto', color: 'var(--text-danger)' }} onClick={() => del(edit)}>Remove</button> : null}<button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEdit(null)}>Cancel</button><button type="submit" form="gb-svc" className="gc-btn gc-btn--solid" disabled={!edit.name.trim()}>Save service</button></>}>
        <form id="gb-svc" className="ch-sheet" onSubmit={save} noValidate>
          <div><label className="gc-label" htmlFor="sv-name">Name</label><input id="sv-name" className="gc-input" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="e.g. Home delivery" autoFocus /></div>
          <div><label className="gc-label" htmlFor="sv-desc">Description</label><textarea id="sv-desc" className="gc-input" rows={3} maxLength={300} value={edit.desc} onChange={(e) => setEdit({ ...edit, desc: e.target.value })} style={{ minHeight: 80 }} /></div>
          <div><label className="gc-label" htmlFor="sv-price">Price (optional)</label><input id="sv-price" className="gc-input" value={edit.price} onChange={(e) => setEdit({ ...edit, price: e.target.value })} placeholder="e.g. From ৳60, Free" /></div>
        </form>
      </Sheet>
    ) : null}
  </>);
}
