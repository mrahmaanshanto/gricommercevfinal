'use client';
// Social media (/admin/social?tab=calendar|posts|library|engagement) — GridCommerce's own pages (Facebook, Instagram,
// LinkedIn, YouTube, TikTok). Title row (Add media, Create post), the five pages with followers and engagement, then
// four views:
//   Calendar    the month (weeks start on Saturday) with each day's posts by page; the picked day's posts beside it
//               (copied from the merchant panel's Post calendar, screens/communication/Calendar.jsx)
//   Posts       Published · Scheduled · Drafts (counts on the tabs), search and a page filter; a row opens the post
//   Library     images and videos by name and tag; add (by name, simulated upload), edit tags, remove
//   Engagement  reach, reactions, comments, shares and link clicks per page for 7 / 30 / 90 days, by week, top posts
// Create / edit opens the composer in place (?compose=new|SP-1017, SocialComposer.jsx). Publishing is simulated.
// Data: lib/admin/marketing2.js (savePost, deletePost, duplicatePost, reschedulePost, unschedulePost, addAsset,
// removeAsset, setAssetTags, socialSummary).

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { ChannelIcon, Sheet, StatusBadge, EmptyState, InfoTip } from '@/components/ui';
import { ShopHeader, IndexTabs, Pager, Menu, KV, SearchField } from '@/components/ui/IndexKit';
import { ColumnChart, HBars, Legend, CHART_CSS } from '@/components/charts/DashCharts';
import { DAY, TZ, dhaka, startOfDay, dm } from '@/lib/platform/util';
import {
  PLATFORMS, platformBy, POST_STATUS, socialSummary, deletePost, duplicatePost, reschedulePost, unschedulePost, addAsset, removeAsset, setAssetTags,
} from '@/lib/admin/marketing2';
import { AdminShell } from '../AdminShell';
import { MK_CSS, useMk2, Skeleton, num, short, pct, plural, dayTime, Field, ctl } from './mk2Shared';
import SocialComposer from './SocialComposer';

const TABS = [['calendar', 'Calendar'], ['posts', 'Posts'], ['library', 'Library'], ['engagement', 'Engagement']];
const POST_VIEWS = [['published', 'Published'], ['scheduled', 'Scheduled'], ['draft', 'Drafts']];
const WD = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ST_COLOR = { published: 'var(--success)', scheduled: 'var(--info)', draft: 'var(--slate-400)' };
const VIZ = { fb: 'var(--viz-1)', ig: 'var(--viz-2)', li: 'var(--viz-3)', yt: 'var(--viz-4)', tt: 'var(--viz-5)' };
const PAGE = 20;
const ABOUT = 'GridCommerce’s own social pages: followers, a calendar of every post, the posts list, the content library and how each page performs. Create post writes one post for several pages with per-page checks, GridAI help and a preview. Publishing is simulated in this demo.';

const CSS = `
.so-pages{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));overflow:hidden}
.so-page{display:flex;flex-direction:column;gap:4px;min-width:0;padding:var(--space-3) var(--space-4);border-left:1px solid var(--border-subtle)}
.so-page:first-child{border-left:0}
.so-page__top{display:flex;align-items:center;gap:8px;min-width:0}
.so-page__top span{display:flex;flex-direction:column;min-width:0}
.so-page__top b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.so-page__top small{overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.so-page__n{font-family:var(--font-data);font-size:var(--text-base);font-weight:var(--weight-semibold);color:var(--text-heading)}
.so-page__sub{font-size:var(--text-xs);color:var(--text-muted)}
.so-page__sub .up{color:var(--text-success)}
.so-page__warn{display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs);color:var(--text-warning)}
.so-cal{display:grid;grid-template-columns:minmax(0,1fr) minmax(240px,300px);gap:var(--space-4);align-items:start}
.cal-bar{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:8px 12px;border-bottom:1px solid var(--border-subtle)}
.cal-bar h2{margin:0 auto 0 4px;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cal-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr))}
.cal-wd{padding:8px;border-bottom:1px solid var(--border-subtle);background:var(--surface-subtle);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.cal-wd.is-fri{color:var(--text-warning)}
.cal-wd__s{display:none}
.dc{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:4px;min-width:0;min-height:108px;padding:6px;overflow:hidden;border-right:1px solid var(--border-subtle);border-bottom:1px solid var(--border-subtle);background:var(--surface-card)}
.dc:nth-child(7n){border-right:0}
.dc.is-fri{background:color-mix(in srgb,var(--warning) 4%,var(--surface-card))}
.dc:hover{background:var(--surface-subtle)}
.dc.is-sel{background:var(--fill-primary-soft);box-shadow:inset 0 0 0 2px var(--primary)}
.dn{display:flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:0;border-radius:var(--radius-full);background:none;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-heading);cursor:pointer}
.dn::after{content:"";position:absolute;inset:0}
.dn:focus-visible{outline:0}
.dn:focus-visible::after{outline:2px solid var(--primary);outline-offset:-2px}
.dc.is-out .dn{opacity:.4}
.dc.is-today .dn{background:var(--primary);color:var(--text-inverse);opacity:1}
.pc{position:relative;z-index:1;display:flex;flex-direction:column;gap:2px;width:100%;min-width:0;padding:4px 6px;border:0;border-left:3px solid;border-radius:var(--radius-md);background:var(--surface-subtle);font:inherit;text-align:left;cursor:pointer;overflow:hidden}
.pc:hover{background:var(--slate-200)}
.pc:focus-visible,.more:focus-visible{outline:2px solid var(--primary);outline-offset:1px}
.pc .t{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere;font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);color:var(--text-heading)}
.pc__meta{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;font-size:var(--text-xs);color:var(--text-muted)}
.more{position:relative;z-index:1;padding:2px 4px;border:0;border-radius:var(--radius-sm);background:none;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--primary);cursor:pointer}
.dc-dots{display:none}
.cal-legend{display:flex;flex-wrap:wrap;gap:var(--space-3)}
.cal-legend span{display:inline-flex;align-items:center;gap:4px}
.cal-legend i{width:8px;height:8px;border-radius:var(--radius-full)}
.cal-post{display:flex;flex-direction:column;gap:6px;padding:10px var(--space-4);border-top:1px solid var(--border-subtle)}
.cal-post__top{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
.cal-post__top .ix-menu{margin-left:auto}
.cal-post__t{padding:0;border:0;background:none;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);text-align:left;cursor:pointer}
.cal-post__t:hover{color:var(--primary)}
.cal-post__pl{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:var(--text-xs);color:var(--text-body)}
.cal-post__pl span{display:inline-flex;align-items:center;gap:4px}
.cal-empty{margin:0;padding:var(--space-3) var(--space-4);font-size:var(--text-sm);color:var(--text-muted)}
.so-snip{display:block;max-width:420px;overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.so-tools{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:8px 12px;border-bottom:1px solid var(--border-subtle)}
.so-tools .ix-search{flex:1 1 220px;max-width:320px}
.so-lib{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,200px),1fr));gap:var(--space-3);padding:var(--space-4)}
.so-asset{display:flex;flex-direction:column;min-width:0;overflow:hidden;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card)}
.so-asset__img{display:flex;align-items:flex-end;justify-content:space-between;height:96px;padding:8px;background:var(--fill-warning-soft);color:var(--text-warning)}
.so-asset__img.is-video{background:var(--fill-primary-soft);color:var(--primary)}
.so-asset__img small{padding:1px 8px;border-radius:var(--radius-full);background:var(--surface-card);font-size:var(--text-xs);color:var(--text-body)}
.so-asset__body{display:flex;flex-direction:column;gap:4px;padding:8px 10px}
.so-asset__body b{overflow:hidden;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.so-asset__body small{font-size:var(--text-xs);color:var(--text-muted)}
.so-asset__tags{display:flex;flex-wrap:wrap;gap:4px}
.so-asset__tags span{padding:0 6px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-body)}
.so-asset__foot{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);margin-top:auto;padding:2px 4px 2px 10px;border-top:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-muted)}
.so-eng{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:var(--space-4);align-items:start}
.so-big{display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-6)}
.so-big div{display:flex;flex-direction:column;gap:2px}
.so-big b{font-family:var(--font-data);font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--text-heading)}
.so-big span{font-size:var(--text-xs);color:var(--text-muted)}
.so-stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:var(--space-2)}
.so-stats div{display:flex;flex-direction:column;gap:2px;padding:var(--space-2);border-radius:var(--radius-lg);background:var(--surface-page)}
.so-stats span{font-size:var(--text-xs);color:var(--text-muted)}
.so-stats b{font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.so-pp{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-2) 0;border-top:1px solid var(--border-subtle)}
.so-pp__head{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.so-text{margin:0;font-size:var(--text-sm);line-height:20px;color:var(--text-heading);white-space:pre-line;overflow-wrap:anywhere}
@media (max-width:1023px){.so-cal,.so-eng{grid-template-columns:minmax(0,1fr)}}
@media (max-width:900px){.so-pages{display:flex;overflow-x:auto;scroll-snap-type:x mandatory}.so-page{flex:0 0 180px;scroll-snap-align:start}}
@media (max-width:640px){
  .cal-bar h2{flex:1 1 100%;order:-1;margin:0}
  .cal-wd{padding:6px 0;text-align:center}
  .cal-wd__l{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
  .cal-wd__s{display:inline}
  .dc{min-height:52px;align-items:center;padding:4px 2px 6px}
  .dc>.pc,.dc>.more{display:none}
  .dn{width:32px;height:32px}
  .dc-dots{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:3px;max-width:100%}
  .dc-dots i{width:6px;height:6px;border-radius:var(--radius-full)}
  .so-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
  .so-tools .ix-search{max-width:none}
}
`;

// Dhaka wall-clock pieces of a time
const parts = (ms) => { const d = new Date(ms + TZ); return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), wd: d.getUTCDay() }; };
const h12 = (ms) => { const h = new Date(ms + TZ).getUTCHours(); const mi = new Date(ms + TZ).getUTCMinutes(); return ((h % 12) || 12) + (mi ? ':' + String(mi).padStart(2, '0') : '') + (h >= 12 ? ' pm' : ' am'); };
const engOf = (p) => (p.stats ? Object.values(p.stats).reduce((a, s) => ({ reach: a.reach + s.reach, eng: a.eng + s.reactions + s.comments + s.shares, clicks: a.clicks + s.clicks }), { reach: 0, eng: 0, clicks: 0 }) : null);
const Icons = ({ list, size = 14 }) => <span className="mk-icons" aria-label={list.map((k) => platformBy(k).name).join(', ')}>{list.map((k) => <ChannelIcon key={k} channel={platformBy(k).channel} size={size} decorative />)}</span>;

export default function Social() {
  const { data, t, live } = useMk2();
  const [q, setQ] = useState(null);              // { tab, compose }
  const [open, setOpen] = useState(null);        // published post id in the side panel
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQ({ tab: TABS.some(([k]) => k === p.get('tab')) ? p.get('tab') : 'calendar', compose: p.get('compose') || null, view: p.get('view') || null });
  }, []);
  const nav = (patch) => {
    const next = { ...q, ...patch };
    setQ(next);
    const p = new URLSearchParams();
    if (next.compose) p.set('compose', next.compose); else if (next.tab !== 'calendar') p.set('tab', next.tab);
    if (!next.compose && next.view) p.set('view', next.view);
    const s = p.toString();
    window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
    window.scrollTo(0, 0);
  };
  const openPost = (p) => { if (p.status === 'published') setOpen(p.id); else nav({ compose: p.id }); };

  if (!live || !q) return <AdminShell active="social" title="Social media"><style dangerouslySetInnerHTML={{ __html: MK_CSS + CSS }} /><Skeleton label="Loading social media" /></AdminShell>;

  if (q.compose) {
    const exists = q.compose === 'new' || data.social.posts.some((p) => p.id === q.compose && p.status !== 'published');
    return (
      <AdminShell active="social" title={q.compose === 'new' ? 'Create post' : 'Edit post'}>
        <style dangerouslySetInnerHTML={{ __html: MK_CSS + CSS }} />
        {exists ? <SocialComposer key={q.compose} id={q.compose} data={data} t={t} onDone={(st) => nav({ compose: null, tab: st ? 'posts' : q.tab, view: st || q.view })} />
          : <div className="ix-page"><section className="ix-card ix-empty"><EmptyState icon="file-x" title="This post can’t be edited." body="It was published or removed." actionLabel="Back to social media" onAction={() => nav({ compose: null })} /></section></div>}
      </AdminShell>
    );
  }

  const sum30 = socialSummary(data, t, 30);
  const drafts = data.social.posts.filter((p) => p.status === 'draft').length;
  const tabs = TABS.map(([k, label]) => ({ key: k, id: 'so-tab-' + k, label, on: q.tab === k, onClick: () => nav({ tab: k }) }));
  const post = open ? data.social.posts.find((p) => p.id === open) : null;

  return (
    <AdminShell active="social" title="Social media">
      <style dangerouslySetInnerHTML={{ __html: MK_CSS + CSS + CHART_CSS }} />
      <div className="ix-page">
        <ShopHeader icon="share-2" title="Social media" about={ABOUT}
          secondary={[{ label: 'Add media', icon: 'upload', onClick: () => setAdding(true) }, { label: drafts ? `Drafts · ${drafts}` : 'Drafts', onClick: () => nav({ tab: 'posts', view: 'draft' }) }]}
          more={[{ label: 'Google Business', href: '/admin/google-business' }]}
          primary={{ label: 'Create post', icon: 'plus', onClick: () => nav({ compose: 'new' }) }} />

        <section className="ix-card so-pages" aria-label="GridCommerce’s pages">
          {data.social.pages.map((pg) => {
            const pl = platformBy(pg.key);
            const row = sum30.rows.find((r) => r.key === pg.key);
            return (
              <div key={pg.key} className="so-page">
                <span className="so-page__top"><ChannelIcon channel={pl.channel} size={24} decorative /><span><b>{pl.name}</b><small title={pg.handle}>{pg.handle}</small></span></span>
                <span className="so-page__n">{short(pg.followers)} <span className="so-page__sub">{pg.unit}</span></span>
                <span className="so-page__sub"><span className="up">+{num(pg.new30)}</span> in 30 days · {pct(row && row.rate)} engaged</span>
                {pg.status === 'renew' ? <span className="so-page__warn"><Icon name="clock-alert" width="12" height="12" aria-hidden="true" />{pg.note}</span> : null}
              </div>
            );
          })}
        </section>

        <section className="ix-card mk-tabs" aria-label="Views"><IndexTabs tabs={tabs} label="Social media views" /></section>
        <div role="tabpanel" aria-labelledby={'so-tab-' + q.tab} className="ix-page">
          {q.tab === 'calendar' ? <CalendarView data={data} t={t} onOpen={openPost} onCreate={() => nav({ compose: 'new' })} /> : null}
          {q.tab === 'posts' ? <PostsView data={data} t={t} view={q.view} setView={(v) => nav({ view: v })} onOpen={openPost} onCreate={() => nav({ compose: 'new' })} /> : null}
          {q.tab === 'library' ? <LibraryView data={data} t={t} onAdd={() => setAdding(true)} /> : null}
          {q.tab === 'engagement' ? <EngagementView data={data} t={t} onOpen={(id) => setOpen(id)} /> : null}
        </div>
      </div>

      <PostSheet post={post} data={data} onClose={() => setOpen(null)} onEditCopy={(id) => { setOpen(null); nav({ compose: id }); }} />
      <AssetSheet open={adding} onClose={() => setAdding(false)} />
    </AdminShell>
  );
}

// ---- Calendar ---------------------------------------------------------------------------------------------------
function CalendarView({ data, t, onOpen, onCreate }) {
  const today = parts(t);
  const [ym, setYm] = useState([today.y, today.m]);
  const [sel, setSel] = useState(startOfDay(t));
  const [f, setF] = useState('');
  const posts = data.social.posts.filter((p) => p.at && p.status !== 'draft' && (!f || p.platforms.includes(f)));
  const onDay = (day) => posts.filter((p) => p.at >= day && p.at < day + DAY).sort((a, b) => a.at - b.at);
  const [y, m] = ym;
  const first = dhaka(y, m, 1);
  const lead = (parts(first).wd + 1) % 7;
  const start = first - lead * DAY;
  const daysIn = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const n = Math.ceil((lead + daysIn) / 7) * 7;
  const cells = Array.from({ length: n }, (_, i) => start + i * DAY);
  const monthPosts = posts.filter((p) => { const x = parts(p.at); return x.y === y && x.m === m; });
  const cur = onDay(sel);
  const shift = (k) => { const d = new Date(Date.UTC(y, m + k, 1)); setYm([d.getUTCFullYear(), d.getUTCMonth()]); };
  const sp = parts(sel);
  const act = async (p, what) => {
    let r;
    if (what === 'dup') { r = duplicatePost(p.id); if (r.ok) toast('Copied as a draft'); }
    if (what === 'next') { r = reschedulePost(p.id, p.at + DAY); if (r.ok) { toast(`Moved to ${dm(p.at + DAY)}, same time`); setSel(startOfDay(p.at + DAY)); } }
    if (what === 'draft') { r = unschedulePost(p.id); if (r.ok) toast('Moved back to drafts'); }
    if (what === 'del') {
      if (!(await confirmDialog({ title: 'Delete this post?', body: p.status === 'published' ? 'It is removed from this list (not from the pages).' : 'The post and its schedule are deleted.', confirmLabel: 'Delete', tone: 'danger' }))) return;
      r = deletePost(p.id); if (r.ok) toast('Post deleted');
    }
    if (r && !r.ok) toast(r.error, { tone: 'error' });
  };
  return (
    <div className="so-cal">
      <section className="ix-card" aria-label={MON[m] + ' ' + y}>
        <div className="cal-bar">
          <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Previous month" onClick={() => shift(-1)}><Icon name="chevron-left" width="16" height="16" aria-hidden="true" /></button>
          <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Next month" onClick={() => shift(1)}><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button>
          <h2>{MON[m]} {y}</h2>
          <button type="button" className="ix-btn ix-btn--sm" onClick={() => { setYm([today.y, today.m]); setSel(startOfDay(t)); }}>Today</button>
          <select className="ix-pick" aria-label="Page" value={f} onChange={(e) => setF(e.target.value)}>
            <option value="">All pages</option>
            {PLATFORMS.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}
          </select>
        </div>
        <div className="cal-grid">{WD.map((w) => <div key={w} className={'cal-wd' + (w === 'Fri' ? ' is-fri' : '')}><span className="cal-wd__l">{w}</span><span className="cal-wd__s" aria-hidden="true">{w.charAt(0)}</span></div>)}</div>
        <div className="cal-grid">
          {cells.map((day, idx) => {
            const c = parts(day);
            const ev = onDay(day);
            const isSel = day === sel;
            const fri = idx % 7 === 6;
            return (
              <div key={day} className={'dc' + (isSel ? ' is-sel' : '') + (day === startOfDay(t) ? ' is-today' : '') + (c.m !== m ? ' is-out' : '') + (fri ? ' is-fri' : '')}>
                <button type="button" className="dn" onClick={() => setSel(day)} aria-pressed={isSel} aria-label={`${c.d} ${MON[c.m]}, ${plural(ev.length, 'post')}`}>{c.d}</button>
                {ev.length ? <span className="dc-dots" aria-hidden="true">{ev.slice(0, 3).map((p) => <i key={p.id} style={{ background: ST_COLOR[p.status] }} />)}</span> : null}
                {ev.slice(0, 2).map((p) => (
                  <button key={p.id} type="button" className="pc" style={{ borderLeftColor: ST_COLOR[p.status] }} onClick={() => { setSel(day); onOpen(p); }} title={`${p.title}, ${h12(p.at)}, ${POST_STATUS[p.status][0]}`}>
                    <span className="t">{p.title}</span>
                    <span className="pc__meta"><Icons list={p.platforms.slice(0, 4)} size={14} />{h12(p.at)}</span>
                  </button>
                ))}
                {ev.length > 2 ? <button type="button" className="more" onClick={() => setSel(day)}>+{ev.length - 2} more</button> : null}
              </div>
            );
          })}
        </div>
        <div className="ix-foot">
          <span>{plural(monthPosts.length, 'post')} in {MON[m]} · {monthPosts.filter((p) => p.status === 'scheduled').length} scheduled</span>
          <span className="cal-legend">{['published', 'scheduled'].map((k) => <span key={k}><i style={{ background: ST_COLOR[k] }} />{POST_STATUS[k][0]}</span>)}</span>
        </div>
      </section>

      <section className="ix-card" aria-labelledby="so-day">
        <header className="ix-card__head"><div><h2 id="so-day">{sp.d} {MON[sp.m]}{sel === startOfDay(t) ? ' · today' : ''}</h2><p className="ix-card__sub">{cur.length ? plural(cur.length, 'post') : 'No posts'}</p></div></header>
        {cur.map((p) => (
          <div key={p.id} className="cal-post">
            <span className="cal-post__top">{h12(p.at)}<StatusBadge tone={POST_STATUS[p.status][1]}>{POST_STATUS[p.status][0]}</StatusBadge>
              <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" items={[
                p.status === 'published' ? { label: 'See results', onClick: () => onOpen(p) } : { label: 'Edit', onClick: () => onOpen(p) },
                { label: 'Duplicate', onClick: () => act(p, 'dup') },
                p.status === 'scheduled' ? { label: 'Move to the next day', onClick: () => act(p, 'next') } : null,
                p.status === 'scheduled' ? { label: 'Back to draft', onClick: () => act(p, 'draft') } : null,
                { label: 'Delete', onClick: () => act(p, 'del'), tone: 'danger' },
              ].filter(Boolean)} />
            </span>
            <button type="button" className="cal-post__t" onClick={() => onOpen(p)}>{p.title}</button>
            <span className="cal-post__pl">{p.platforms.map((k) => <span key={k}><ChannelIcon channel={platformBy(k).channel} size={14} decorative />{platformBy(k).name}</span>)}</span>
          </div>
        ))}
        {!cur.length ? <p className="cal-empty">Nothing on this day. <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={onCreate}>Create a post</button></p> : null}
      </section>
    </div>
  );
}

// ---- Posts --------------------------------------------------------------------------------------------------------
function PostsView({ data, t, view, setView, onOpen, onCreate }) {
  const v = POST_VIEWS.some(([k]) => k === view) ? view : 'published';
  const [s, setS] = useState('');
  const [f, setF] = useState('');
  const [page, setPage] = useState(0);
  useEffect(() => { setPage(0); }, [v, s, f]);
  const needle = s.trim().toLowerCase();
  const all = data.social.posts;
  const list = all.filter((p) => p.status === v && (!f || p.platforms.includes(f)) && (!needle || (p.title + ' ' + p.text + ' ' + p.tags.join(' ')).toLowerCase().includes(needle)))
    .sort((a, b) => (v === 'scheduled' ? a.at - b.at : (b.at || b.createdAt) - (a.at || a.createdAt)));
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const pg = Math.min(page, pages - 1);
  const rows = list.slice(pg * PAGE, pg * PAGE + PAGE);
  const tabs = POST_VIEWS.map(([k, label]) => ({ key: k, id: 'sp-tab-' + k, label, count: all.filter((p) => p.status === k).length, on: v === k, onClick: () => setView(k) }));
  return (
    <section className="ix-card" aria-label="Posts">
      <div className="ix-bar"><IndexTabs tabs={tabs} label="Posts by status" /></div>
      <div className="so-tools">
        <SearchField value={s} onChange={(e) => setS(e.target.value)} placeholder="Search posts" />
        <select className={'ix-filter' + (f ? ' is-set' : '')} aria-label="Page" value={f} onChange={(e) => setF(e.target.value)}>
          <option value="">All pages</option>
          {PLATFORMS.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}
        </select>
      </div>
      {!list.length ? (
        <div className="ix-empty">{needle || f ? <EmptyState title="No posts match." actionLabel="Clear search" onAction={() => { setS(''); setF(''); }} /> : <EmptyState icon="send" title={`No ${POST_VIEWS.find(([k]) => k === v)[1].toLowerCase()} posts.`} actionLabel="Create post" onAction={onCreate} />}</div>
      ) : (<>
        <ul className="ix-plist" aria-label="Posts">
          {rows.map((p) => { const e = engOf(p); return (
            <li key={p.id}><button type="button" className="ix-pitem" onClick={() => onOpen(p)}>
              <span className="ix-pitem__top"><b>{p.title}</b><Icons list={p.platforms} /></span>
              <span className="ix-pitem__mid">{p.at ? dayTime(p.at) : 'No date'}{e ? ` · reach ${short(e.reach)} · ${short(e.eng)} engagements` : ''}</span>
            </button></li>
          ); })}
        </ul>
        <div className="ix-table-wrap">
          <table className="ix-table gc-table--keep">
            <caption className="sr-only">Posts</caption>
            <thead><tr><th scope="col">Post</th><th scope="col">Pages</th><th scope="col">{v === 'draft' ? 'Edited' : v === 'scheduled' ? 'Goes out' : 'Published'}</th>{v === 'published' ? <><th scope="col" className="ix-num">Reach</th><th scope="col" className="ix-num">Engagements</th><th scope="col" className="ix-num">Link clicks</th></> : null}<th scope="col">By</th></tr></thead>
            <tbody>
              {rows.map((p) => { const e = engOf(p); return (
                <tr key={p.id} tabIndex={0} onClick={() => onOpen(p)} onKeyDown={(ev) => { if (ev.key === 'Enter') onOpen(p); }}>
                  <td><span className="mk-cell" style={{ maxWidth: 420 }}><b>{p.title}</b><span className="so-snip">{p.text.split('\n').slice(1).join(' ') || p.text}</span></span></td>
                  <td><Icons list={p.platforms} size={16} /></td>
                  <td className="ix-muted" style={{ whiteSpace: 'nowrap' }}>{p.at && v !== 'draft' ? dayTime(p.at) : dayTime(p.updatedAt || p.createdAt)}</td>
                  {v === 'published' ? <><td className="ix-num mk-fig">{num(e.reach)}</td><td className="ix-num mk-fig">{num(e.eng)}</td><td className="ix-num mk-fig">{num(e.clicks)}</td></> : null}
                  <td className="ix-muted">{p.by}</td>
                </tr>
              ); })}
            </tbody>
          </table>
        </div>
      </>)}
      <Pager label={list.length ? `${pg * PAGE + 1}–${pg * PAGE + rows.length} of ${list.length}` : '0 posts'} atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />
    </section>
  );
}

// ---- Library --------------------------------------------------------------------------------------------------------
function LibraryView({ data, onAdd }) {
  const [s, setS] = useState('');
  const [kind, setKind] = useState('');
  const [tag, setTag] = useState('');
  const [edit, setEdit] = useState(null);   // { id, text, error }
  const lib = data.social.library;
  const tags = [...new Set(lib.flatMap((a) => a.tags))].sort();
  const needle = s.trim().toLowerCase();
  const list = lib.filter((a) => (!kind || a.kind === kind) && (!tag || a.tags.includes(tag)) && (!needle || (a.name + ' ' + a.tags.join(' ')).toLowerCase().includes(needle))).sort((a, b) => b.addedAt - a.addedAt);
  const usedIn = (id) => data.social.posts.filter((p) => p.media.includes(id)).length;
  const remove = async (a) => {
    if (!(await confirmDialog({ title: `Remove ${a.name}?`, body: 'Published posts keep their copy; it can’t be picked for new posts.', confirmLabel: 'Remove', tone: 'danger' }))) return;
    const r = removeAsset(a.id);
    toast(r.ok ? 'File removed' : r.error, r.ok ? undefined : { tone: 'error' });
  };
  const saveTags = () => {
    const r = setAssetTags(edit.id, edit.text.split(/[,\s]+/));
    if (!r.ok) { setEdit({ ...edit, error: r.error }); return; }
    setEdit(null); toast('Tags saved');
  };
  return (
    <section className="ix-card" aria-label="Content library">
      <div className="so-tools">
        <SearchField value={s} onChange={(e) => setS(e.target.value)} placeholder="Search by name or tag" />
        <div className="gc-seg" role="radiogroup" aria-label="Kind">{[['', 'All'], ['image', 'Images'], ['video', 'Videos']].map(([k, l]) => <button key={k} type="button" role="radio" aria-checked={kind === k} className={'gc-seg__btn' + (kind === k ? ' gc-seg__btn--active' : '')} onClick={() => setKind(k)}>{l}</button>)}</div>
        <select className={'ix-filter' + (tag ? ' is-set' : '')} aria-label="Tag" value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="">All tags</option>
          {tags.map((x) => <option key={x} value={x}>#{x}</option>)}
        </select>
      </div>
      {list.length ? (
        <div className="so-lib">
          {list.map((a) => (
            <article key={a.id} className="so-asset" aria-label={a.name}>
              <div className={'so-asset__img' + (a.kind === 'video' ? ' is-video' : '')}><Icon name={a.kind === 'video' ? 'circle-play' : 'image'} width="24" height="24" aria-hidden="true" /><small>{a.dims}</small></div>
              <div className="so-asset__body">
                <b title={a.name}>{a.name}</b>
                <small>{a.size} · added {dm(a.addedAt)} by {a.by.split(' ')[0]}</small>
                <span className="so-asset__tags">{a.tags.map((x) => <span key={x}>#{x}</span>)}</span>
              </div>
              <div className="so-asset__foot">
                <span>{usedIn(a.id) ? `In ${plural(usedIn(a.id), 'post')}` : 'Not used yet'}</span>
                <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" items={[{ label: 'Edit tags', onClick: () => setEdit({ id: a.id, text: a.tags.join(', '), error: '' }) }, { label: 'Remove', onClick: () => remove(a), tone: 'danger' }]} />
              </div>
            </article>
          ))}
        </div>
      ) : <div className="ix-empty">{needle || kind || tag ? <EmptyState title="Nothing matches." actionLabel="Clear filters" onAction={() => { setS(''); setKind(''); setTag(''); }} /> : <EmptyState icon="images" title="The library is empty." actionLabel="Add media" onAction={onAdd} />}</div>}
      <div className="ix-foot"><span>{plural(list.length, 'file')} · {lib.filter((a) => a.kind === 'video').length} videos, {lib.filter((a) => a.kind === 'image').length} images</span></div>
      <Sheet open={!!edit} title="Edit tags" onClose={() => setEdit(null)} footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEdit(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={saveTags}>Save</button></>}>
        {edit ? <div className="mk-form"><Field id="so-tags" label="Tags" hint="Separate with commas, e.g. offer, puja, story" error={edit.error}><input id="so-tags" data-autofocus {...ctl(edit.error)} value={edit.text} onChange={(e) => setEdit({ ...edit, text: e.target.value, error: '' })} /></Field></div> : null}
      </Sheet>
    </section>
  );
}

function AssetSheet({ open, onClose }) {
  const [f, setF] = useState({ name: '', kind: 'image', tags: '' });
  const [err, setErr] = useState('');
  useEffect(() => { if (open) { setF({ name: '', kind: 'image', tags: '' }); setErr(''); } }, [open]);
  const save = () => {
    const r = addAsset({ name: f.name, kind: f.kind, tags: f.tags.split(/[,\s]+/) });
    if (!r.ok) { setErr(r.error); return; }
    toast('Added to the library'); onClose();
  };
  return (
    <Sheet open={open} title="Add media" onClose={onClose} footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={save}>Add</button></>}>
      <div className="mk-form">
        <div className="gc-field"><span className="gc-label">Kind</span><div className="gc-seg" role="radiogroup" aria-label="Kind">{[['image', 'Image'], ['video', 'Video']].map(([k, l]) => <button key={k} type="button" role="radio" aria-checked={f.kind === k} className={'gc-seg__btn' + (f.kind === k ? ' gc-seg__btn--active' : '')} onClick={() => setF({ ...f, kind: k })}>{l}</button>)}</div></div>
        <Field id="so-name" label="File name" hint={f.kind === 'video' ? 'e.g. merchant-story-sylhet-tea.mp4' : 'e.g. winter-offer-banner.png'} error={err}>
          <input id="so-name" data-autofocus {...ctl(err)} value={f.name} onChange={(e) => { setF({ ...f, name: e.target.value }); setErr(''); }} />
        </Field>
        <Field id="so-ntags" label="Tags" optional hint="Separate with commas"><input id="so-ntags" className="gc-input" value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} /></Field>
        <p className="mk-note">Demo: the file is added by name; nothing is uploaded.</p>
      </div>
    </Sheet>
  );
}

// ---- Engagement ---------------------------------------------------------------------------------------------------
function EngagementView({ data, t, onOpen }) {
  const [days, setDays] = useState(30);
  const s = socialSummary(data, t, days);
  const T = s.total;
  return (
    <>
      <section className="ix-card" aria-label="Engagement">
        <div className="ix-card__head">
          <h2>Engagement <InfoTip text="From posts published in the period. Engagement rate = reactions, comments and shares divided by reach." /></h2>
          <div className="gc-seg" role="radiogroup" aria-label="Period">{[[7, '7 days'], [30, '30 days'], [90, '90 days']].map(([k, l]) => <button key={k} type="button" role="radio" aria-checked={days === k} className={'gc-seg__btn' + (days === k ? ' gc-seg__btn--active' : '')} onClick={() => setDays(k)}>{l}</button>)}</div>
        </div>
        <div className="mk-body">
          <div className="so-big">
            <div><b>{num(T.reach)}</b><span>Reach</span></div>
            <div><b>{num(T.reactions)}</b><span>Reactions</span></div>
            <div><b>{num(T.comments)}</b><span>Comments</span></div>
            <div><b>{num(T.shares)}</b><span>Shares</span></div>
            <div><b>{num(T.clicks)}</b><span>Link clicks</span></div>
            <div><b>{pct(T.rate)}</b><span>Engagement rate</span></div>
          </div>
          {T.posts ? (<>
            <ColumnChart key={days} label={`Engagements by page per week, last ${days} days`} data={s.weeks} series={PLATFORMS.map((p) => ({ name: p.name, color: VIZ[p.key] }))} fmt={num} tickFmt={short} height={200} />
            <Legend items={PLATFORMS.map((p) => ({ name: p.name, color: VIZ[p.key] }))} />
          </>) : <p className="mk-note">No posts were published in these {days} days.</p>}
        </div>
      </section>
      <div className="so-eng">
        <section className="ix-card" aria-label="By page">
          <div className="ix-card__head"><h2>By page</h2></div>
          <div className="ix-table-wrap">
            <table className="ix-table ix-table--static gc-table--keep gc-table--scroll">
              <caption className="sr-only">Engagement by page, last {days} days</caption>
              <thead><tr><th scope="col">Page</th><th scope="col" className="ix-num">Posts</th><th scope="col" className="ix-num">Reach</th><th scope="col" className="ix-num">Reactions</th><th scope="col" className="ix-num">Comments</th><th scope="col" className="ix-num">Shares</th><th scope="col" className="ix-num">Link clicks</th><th scope="col" className="ix-num">Rate</th></tr></thead>
              <tbody>
                {s.rows.map((r) => (
                  <tr key={r.key}>
                    <td><span className="mk-row" style={{ flexWrap: 'nowrap' }}><ChannelIcon channel={r.channel} size={18} decorative />{r.name}</span></td>
                    <td className="ix-num mk-data">{num(r.posts)}</td><td className="ix-num mk-fig">{num(r.reach)}</td><td className="ix-num mk-data">{num(r.reactions)}</td>
                    <td className="ix-num mk-data">{num(r.comments)}</td><td className="ix-num mk-data">{num(r.shares)}</td><td className="ix-num mk-data">{num(r.clicks)}</td><td className="ix-num mk-data">{pct(r.rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="ix-card" aria-label="Top posts">
          <div className="ix-card__head"><h2>Top posts</h2></div>
          <div className="mk-body">
            {s.top.length ? <HBars rows={s.top.map((p, i) => ({ key: p.id, label: p.title, sub: dm(p.at) + ' · reach ' + short(p.reach), value: p.eng, text: num(p.eng), color: 'var(--viz-1)', href: '#' + p.id }))}
              Link={({ href, className, children }) => <button type="button" className={className} style={{ width: '100%', border: 0, background: 'none', font: 'inherit', textAlign: 'left', cursor: 'pointer' }} onClick={() => onOpen(href.slice(1))}>{children}</button>} />
              : <p className="mk-note">No posts in this period.</p>}
          </div>
        </section>
      </div>
    </>
  );
}

// ---- a published post ------------------------------------------------------------------------------------------------
function PostSheet({ post, data, onClose, onEditCopy }) {
  if (!post) return null;
  const e = engOf(post);
  const media = post.media.map((m) => data.social.library.find((x) => x.id === m)).filter(Boolean);
  const dup = () => { const r = duplicatePost(post.id); if (!r.ok) { toast(r.error, { tone: 'error' }); return; } toast('Copied as a draft'); onEditCopy(r.id); };
  return (
    <Sheet open title={post.title} onClose={onClose} footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Close</button><button type="button" className="gc-btn gc-btn--solid" onClick={dup}>Duplicate and edit</button></>}>
      <div className="mk-form">
        <KV rows={[['Published', dayTime(post.at)], ['By', post.by], ['Media', media.length ? media.map((m) => m.name).join(', ') : 'Text only'], post.link ? ['Link', <span key="l" className="mk-data" style={{ overflowWrap: 'anywhere' }}>{post.link}</span>] : null, ['ID', <span key="i" className="mk-data">{post.id}</span>]]} />
        <p className="so-text">{post.text}{post.tags.length ? '\n\n' + post.tags.join(' ') : ''}</p>
        <div className="mk-sum">
          <div><span>Reach</span><b>{num(e.reach)}</b></div>
          <div><span>Engagements</span><b>{num(e.eng)}</b></div>
          <div><span>Link clicks</span><b>{num(e.clicks)}</b></div>
        </div>
        {post.platforms.map((k) => {
          const st = post.stats[k] || {};
          const pl = platformBy(k);
          return (
            <div key={k} className="so-pp">
              <span className="so-pp__head"><ChannelIcon channel={pl.channel} size={18} decorative />{pl.name}</span>
              <div className="so-stats">
                {[['Reach', st.reach], ['Reactions', st.reactions], ['Comments', st.comments], ['Shares', st.shares], ['Clicks', st.clicks]].map(([l, v]) => <div key={l}><span>{l}</span><b>{num(v || 0)}</b></div>)}
              </div>
            </div>
          );
        })}
        {!e.reach ? <p className="mk-note">Just posted: figures come in from the pages within the hour.</p> : null}
      </div>
    </Sheet>
  );
}
