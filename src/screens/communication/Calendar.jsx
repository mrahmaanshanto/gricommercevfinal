'use client';
// Post calendar — the social posts by day, laid out like a Shopify page (components/ui/IndexKit.jsx): title row, then
// the calendar (month or week, a channel filter) with the picked day's posts beside it. The drafts tray and the best
// times to post open in side panels from the title row.
// Today comes from the app clock (clockNow) after mount; the first render (server and hydration) uses 1 Oct 2026.
// Edit freely: this file is the source for the screen.

import React from 'react';
import Link from 'next/link';
import { DCLogic, Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { toast } from '@/runtime/ui';
import { ChannelIcon, Sheet, StatusBadge } from '@/components/ui';
import { ShopHeader, Menu } from '@/components/ui/IndexKit';
import { clockNow } from '@/lib/settlements';

// ---- logic ----

// key, name, short, (colour: unused, the channel icon brings its own), auto?, account, status, supports, note
const PLAT = [
  ['fb', 'Facebook Page', 'FB', '', true, 'GridShop', 'ok', 'Text, photos, videos, links', 'Posts go out at the scheduled minute.'],
  ['ig', 'Instagram', 'IG', '', true, '@gridshop.bd', 'ok', 'Photos, carousels, Reels', 'Needs a photo or video. Business account linked to the Facebook Page.'],
  ['wa', 'WhatsApp broadcast', 'WA', '', true, '+880 1711-482093', 'ok', 'Template message with photo', 'Goes only to customers who opted in. ৳1.10 per message from the wallet.'],
  ['tt', 'TikTok', 'TT', '', true, '@gridshop', 'renew', 'Videos, photo posts', 'Access expires in 3 days. Reconnect to keep posting.'],
  ['yt', 'YouTube', 'YT', '', true, 'GridShop BD', 'ok', 'Videos and Shorts', 'Needs a video.'],
  ['x', 'X', 'X', '', true, '@gridshopbd', 'off', 'Text up to 280 characters, photos', 'How many posts a month depends on the X API plan.'],
  ['pin', 'Pinterest', 'PIN', '', true, 'Not connected', 'off', 'Pins with photo and link', 'Each pin needs a photo and a link.'],
  ['wac', 'WhatsApp Channel', 'WAC', '', false, 'GridShop Offers', 'manual', 'Reminder with the text ready to copy', 'WhatsApp has no posting API for channels, so a reminder is sent to post by hand.'],
  ['fbg', 'Facebook groups', 'FBG', '', false, '3 groups', 'manual', 'Reminder with the text ready to copy', 'Meta closed group posting by API in 2024, so a reminder is sent to post by hand.'],
  ['li', 'LinkedIn page', 'IN', '', true, 'GridShop Ltd', 'ok', 'Text, photos, links', 'Company page only, not personal profiles.']
];
// platform key -> ChannelIcon channel
const CH = { fb: 'facebook', ig: 'instagram', wa: 'whatsapp', tt: 'tiktok', yt: 'youtube', x: 'x', pin: 'pinterest', wac: 'whatsapp', fbg: 'facebook', li: 'linkedin' };
const ST_ICON = { sched: 'clock', remind: 'bell', done: 'check', draft: 'pencil' };
const plat = (k) => PLAT.find((p) => p[0] === k);

// id, y, m(0-based), d, hour(24), title, platforms, status
const POSTS = [
  ['s1', 2026, 8, 24, 20, 'Weekend deal: bumper cases', ['fb', 'ig'], 'done'], ['s2', 2026, 8, 27, 20, 'Customer review video', ['tt', 'ig'], 'done'], ['s3', 2026, 8, 29, 21, 'Puja collection teaser', ['fb', 'ig', 'tt'], 'sched'],
  ['a', 2026, 9, 1, 20, 'Puja offer: 10% off chargers', ['fb', 'ig', 'wa', 'tt', 'wac'], 'sched'], ['b', 2026, 9, 3, 20, 'Case drop test video', ['tt', 'yt', 'ig'], 'sched'],
  ['c', 2026, 9, 5, 10, 'PUJA10 reminder', ['wa'], 'sched'], ['d', 2026, 9, 8, 10, 'Blog: Puja offers', ['fb', 'li'], 'sched'], ['e', 2026, 9, 8, 19, 'Offer post for the channel', ['wac'], 'remind'],
  ['f', 2026, 9, 10, 18, 'Share in Dhaka gadget groups', ['fbg'], 'remind'], ['h', 2026, 9, 15, 20, 'Reel: 3 ways to protect a phone', ['ig', 'tt', 'yt'], 'sched'],
  ['j', 2026, 9, 20, 21, 'Offer ends tonight', ['fb', 'wa', 'wac', 'fbg'], 'sched'], ['k', 2026, 9, 22, 20, 'Uttara branch opening soon', ['fb', 'ig', 'li'], 'sched'],
  ['m', 2026, 9, 28, 20, 'Weekend deal preview', ['fb', 'ig', 'tt'], 'sched'], ['n', 2026, 9, 30, 19, 'Month-end best sellers', ['fb', 'ig', 'li'], 'sched']
];
const DRAFTS = [['g', 'New MagSafe cases', ['ig', 'pin', 'fb'], 'Photo ready · no date', 12, 21], ['i', 'Last days of PUJA10', ['fb', 'ig', 'wa', 'x'], 'Needs X connected', 18, 11], ['l', 'Customer reviews roundup', ['fb', 'ig'], 'Text only', 25, 20]];
// status -> [label, badge tone, colour]
const ST = { sched: ['Scheduled', 'info', 'var(--info)'], remind: ['Reminder', 'primary', 'var(--primary)'], done: ['Posted', 'success', 'var(--success)'], draft: ['Draft', 'neutral', 'var(--slate-400)'] };
const WD = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'], MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const TODAY0 = [2026, 9, 1];
function todayNow() { const d = new Date(clockNow()); return [d.getFullYear(), d.getMonth(), d.getDate()]; }
const HM = [[1, 1, 1, 1, 1, 2, 2], [2, 2, 2, 2, 2, 3, 3], [2, 2, 2, 2, 3, 3, 4], [3, 3, 3, 3, 3, 4, 4], [4, 3, 3, 3, 4, 4, 3]];
const HML = ['9:00 AM', '12:00 PM', '3:00 PM', '8:00 PM', '10:00 PM'], HMS = ['9 AM', '12 PM', '3 PM', '8 PM', '10 PM'];
function h12(h) { return ((h % 12) || 12) + (h >= 12 ? ' pm' : ' am'); }
const nextDay = (y, m, d) => { const dt = new Date(y, m, d + 1); return [dt.getFullYear(), dt.getMonth(), dt.getDate()]; };
const short = (n) => n.replace(' broadcast', '').replace(' page', '').replace('Facebook Page', 'Facebook');

class Component extends DCLogic {
  state = { today: null, ym: null, f: '', view: 'month', sel: null, moved: {}, placed: {}, dups: [], panel: '' };
  componentDidMount() { this.setState({ today: todayNow() }); }
  renderVals() {
    const s = this.state;
    const TODAY = s.today || TODAY0;
    const ym = s.ym || [TODAY[0], TODAY[1]], f = s.f, view = s.view;
    const sel = s.sel || TODAY.slice();
    const all = POSTS.map((p) => { const q = p.slice(); const mv = s.moved[p[0]]; if (mv) { q[1] = mv[0]; q[2] = mv[1]; q[3] = mv[2]; } return q; })
      .concat(DRAFTS.filter((d) => s.placed[d[0]]).map((d) => [d[0], 2026, 9, d[4], d[5], d[1], d[2], 'draft'])).concat(s.dups);
    const posts = all.filter((p) => !f || p[6].indexOf(f) >= 0);
    const on = (y, m, d) => posts.filter((p) => p[1] === y && p[2] === m && p[3] === d).sort((a, b) => a[4] - b[4]);
    const names = (p) => p[6].map((k) => plat(k)[1]);
    const card = (p) => ({ t: p[5], time: h12(p[4]), sc: ST[p[7]][2], si: ST_ICON[p[7]], st: p[7], full: p[5] + ', ' + h12(p[4]) + ', ' + ST[p[7]][0] + ', on ' + names(p).join(', '), extra: p[6].length > 4 ? '+' + (p[6].length - 4) : '', pl: p[6].slice(0, 4).map((k) => ({ ch: CH[k], n: plat(k)[1] })), pick: () => this.setState({ sel: [p[1], p[2], p[3]] }) });
    const y = ym[0], m = ym[1];
    const first = new Date(y, m, 1).getDay(), lead = (first + 1) % 7, days = new Date(y, m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < lead; i++) { const dt = new Date(y, m, i - lead + 1); cells.push([dt.getFullYear(), dt.getMonth(), dt.getDate(), true]); }
    for (let d = 1; d <= days; d++) cells.push([y, m, d, false]);
    while (cells.length % 7) { const dt2 = new Date(y, m, days + (cells.length - lead - days) + 1); cells.push([dt2.getFullYear(), dt2.getMonth(), dt2.getDate(), true]); }
    const monthPosts = posts.filter((p) => p[1] === y && p[2] === m);
    const isT = (c) => c[0] === TODAY[0] && c[1] === TODAY[1] && c[2] === TODAY[2];
    const isS = (c) => c[0] === sel[0] && c[1] === sel[1] && c[2] === sel[2];
    // the week holding the picked day (weeks start on Saturday)
    const sd = new Date(sel[0], sel[1], sel[2]); const back = (sd.getDay() + 1) % 7; const ws = new Date(sel[0], sel[1], sel[2] - back);
    const week = []; for (let k = 0; k < 7; k++) { const w = new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() + k); week.push([w.getFullYear(), w.getMonth(), w.getDate()]); }
    const cur = on(sel[0], sel[1], sel[2]);
    const shift = (n) => { const p = new Date(sel[0], sel[1], sel[2] + n); this.setState({ sel: [p.getFullYear(), p.getMonth(), p.getDate()], ym: [p.getFullYear(), p.getMonth()] }); };
    const drafts = DRAFTS.filter((d) => !s.placed[d[0]]);
    return {
      title: view === 'month' ? MON[m] + ' ' + y : 'Week of ' + week[0][2] + ' ' + MON[week[0][1]].slice(0, 3) + ' – ' + week[6][2] + ' ' + MON[week[6][1]].slice(0, 3),
      summary: monthPosts.length + ' posts in ' + MON[m] + ' · ' + monthPosts.filter((p) => p[7] === 'sched').length + ' scheduled · ' + monthPosts.filter((p) => p[7] === 'remind').length + ' reminders',
      view, setView: (x) => this.setState({ view: x }), isMonth: view === 'month',
      prev: () => { if (view === 'week') shift(-7); else { const n = new Date(y, m - 1, 1); this.setState({ ym: [n.getFullYear(), n.getMonth()] }); } },
      next: () => { if (view === 'week') shift(7); else { const n = new Date(y, m + 1, 1); this.setState({ ym: [n.getFullYear(), n.getMonth()] }); } },
      today: () => this.setState({ ym: [TODAY[0], TODAY[1]], sel: TODAY.slice() }),
      f, setF: (e) => this.setState({ f: e.target.value }),
      legend: ['sched', 'remind', 'done', 'draft'].map((k) => ({ l: ST[k][0], c: ST[k][2], i: ST_ICON[k] })),
      cells: cells.map((c, idx) => {
        const ev = on(c[0], c[1], c[2]); const sl = isS(c); const fri = idx % 7 === 6;
        return { key: c.join('-'), n: String(c[2]), out: c[3], today: isT(c), sel: sl, fri,
          aria: c[2] + ' ' + MON[c[1]] + (fri ? ', weekend' : '') + ', ' + ev.length + (ev.length === 1 ? ' post' : ' posts') + (sl ? ', selected' : ''),
          ev: ev.slice(0, 2).map(card), dots: ev.slice(0, 3).map((p) => ST[p[7]][2]), dotMore: ev.length > 3 ? '+' + (ev.length - 3) : '',
          more: ev.length > 2, moreL: '+' + (ev.length - 2) + ' more', moreAria: 'Show all ' + ev.length + ' posts on ' + c[2] + ' ' + MON[c[1]],
          pick: () => this.setState({ sel: [c[0], c[1], c[2]] }) };
      }),
      wkHead: week.map((w, i) => ({ d: WD[i], n: String(w[2]), today: isT(w) })),
      wkRows: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map((h) => ({ h: h12(h), c: week.map((w, i) => ({ fri: i === 6, ev: on(w[0], w[1], w[2]).filter((p) => p[4] === h).map((p) => { const cd = card(p); return { ...cd, n: p[6].length }; }) })) })),
      selTitle: sel[2] + ' ' + MON[sel[1]] + (isT(sel) ? ' · today' : ''), selSub: cur.length ? cur.length + (cur.length === 1 ? ' post' : ' posts') : 'No posts',
      selPosts: cur.map((p) => ({ id: p[0], time: h12(p[4]), t: p[5], st: ST[p[7]][0], tone: ST[p[7]][1], si: ST_ICON[p[7]], pl: p[6].map((k) => ({ n: plat(k)[1], ch: CH[k] })),
        dup: () => { const nd = nextDay(p[1], p[2], p[3] + 6); this.setState({ dups: s.dups.concat([['dup' + s.dups.length, nd[0], nd[1], nd[2], p[4], p[5] + ' (repeat)', p[6], 'draft']]) }); toast('Copied as a draft one week later, ' + nd[2] + ' ' + MON[nd[1]] + '.'); },
        move: () => { const nd = nextDay(p[1], p[2], p[3]); this.setState({ moved: { ...s.moved, [p[0]]: nd }, sel: nd, ym: [nd[0], nd[1]] }); toast('“' + p[5] + '” moved to ' + nd[2] + ' ' + MON[nd[1]] + ', same time.'); } })),
      noPosts: cur.length === 0,
      drafts: drafts.map((d) => ({ id: d[0], t: d[1], m: d[3] + ' · ' + d[2].length + ' places', day: d[4] + ' Oct',
        place: () => { this.setState({ placed: { ...s.placed, [d[0]]: 1 }, sel: [2026, 9, d[4]], ym: [2026, 9] }); toast('“' + d[1] + '” added to ' + d[4] + ' October as a draft.'); } })),
      draftCount: drafts.length,
      panel: s.panel, openDrafts: () => this.setState({ panel: 'drafts' }), openBest: () => this.setState({ panel: 'best' }), closePanel: () => this.setState({ panel: '' }),
      hm: HM.map((r, i) => ({ l: HMS[i], c: r.map((x, j) => ({ lvl: x, t: WD[j] + ' ' + HML[i] })) })),
    };
  }
}

// ---- styles ----

const CSS = `
.cal-layout{grid-template-columns:minmax(0,1fr) minmax(240px,280px)}
@media (max-width:1023px){.cal-layout{grid-template-columns:minmax(0,1fr)}}
.cal-bar{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:8px 12px;border-bottom:1px solid var(--border-subtle)}
.cal-bar h2{margin:0 auto 0 4px;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cal-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr))}
.cal-wd{padding:8px;border-bottom:1px solid var(--border-subtle);background:var(--surface-subtle);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.cal-wd.is-fri{color:var(--text-warning)}
.cal-wd__s{display:none}
.dc{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:4px;min-width:0;min-height:112px;padding:6px;overflow:hidden;border-right:1px solid var(--border-subtle);border-bottom:1px solid var(--border-subtle);background:var(--surface-card)}
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
.pc .t{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere;font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);color:var(--text-heading)}
.pc__meta{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;font-size:var(--text-xs);color:var(--text-muted)}
.pc__icons{display:flex;align-items:center;gap:2px}
.pc__time{display:inline-flex;align-items:center;gap:3px}
.more{position:relative;z-index:1;padding:2px 4px;border:0;border-radius:var(--radius-sm);background:none;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--primary);cursor:pointer}
.more:hover{text-decoration:underline}
.pc:focus-visible,.wev:focus-visible,.more:focus-visible{outline:2px solid var(--primary);outline-offset:1px}
.dc-dots{display:none}
.wk{display:grid;grid-template-columns:52px repeat(7,minmax(0,1fr))}
.wk-head{padding:6px 8px;border-bottom:1px solid var(--border-subtle);background:var(--surface-subtle);display:flex;flex-direction:column;gap:2px;font-size:var(--text-xs);color:var(--text-muted)}
.wk-head b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.wk-head.is-today b{color:var(--primary)}
.wk-h{padding:2px 8px 0 0;border-bottom:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-muted);text-align:right}
.wcell{position:relative;height:40px;border-right:1px solid var(--border-subtle);border-bottom:1px solid var(--border-subtle)}
.wcell.is-fri{background:color-mix(in srgb,var(--warning) 4%,var(--surface-card))}
.wev{position:absolute;left:3px;right:3px;top:2px;z-index:1;padding:3px 6px;border:0;border-left:3px solid;border-radius:var(--radius-md);background:var(--fill-info-soft);font:inherit;font-size:var(--text-xs);line-height:16px;color:var(--text-heading);text-align:left;overflow:hidden;cursor:pointer}
.wev[data-st="done"]{background:var(--fill-success-soft)}.wev[data-st="remind"]{background:var(--fill-primary-soft)}.wev[data-st="draft"]{background:var(--surface-subtle)}
.wev b{display:block;overflow:hidden;font-weight:var(--weight-medium);text-overflow:ellipsis;white-space:nowrap}
.cal-legend{display:flex;flex-wrap:wrap;gap:var(--space-3)}
.cal-legend span{display:inline-flex;align-items:center;gap:4px}
.cal-day{display:flex;flex-direction:column}
.cal-post{display:flex;flex-direction:column;gap:6px;padding:10px 0;border-top:1px solid var(--border-subtle)}
.cal-post__top{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-xs-plus);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
.cal-post__top .ix-menu{margin-left:auto}
.cal-post__t{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.cal-post__pl{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:var(--text-xs);color:var(--text-body)}
.cal-post__pl span{display:inline-flex;align-items:center;gap:4px}
.cal-empty{margin:0;font-size:var(--text-xs-plus);color:var(--text-muted)}
.cal-sub{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.cal-draft{display:flex;align-items:center;gap:var(--space-3);padding:10px 0;border-bottom:1px solid var(--border-subtle)}
.cal-draft:last-child{border-bottom:0}
.cal-draft__text{flex:1;min-width:0;display:flex;flex-direction:column}
.cal-draft__text b{overflow:hidden;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.cal-draft__text small{font-size:var(--text-xs);color:var(--text-muted)}
.cal-hm{display:grid;grid-template-columns:42px repeat(7,minmax(0,1fr));gap:4px;align-items:center;font-size:var(--text-xs);color:var(--text-muted)}
.cal-hm>span:not(.hm){text-align:center;white-space:nowrap}
.hm{aspect-ratio:1.6;border-radius:var(--radius-sm)}
.hm[data-l="0"]{background:var(--surface-subtle)}
.hm[data-l="1"]{background:color-mix(in srgb,var(--primary) 12%,var(--surface-card))}
.hm[data-l="2"]{background:color-mix(in srgb,var(--primary) 30%,var(--surface-card))}
.hm[data-l="3"]{background:color-mix(in srgb,var(--primary) 55%,var(--surface-card))}
.hm[data-l="4"]{background:var(--primary)}
.cal-week{overflow-x:auto}
/* phones: the month grid shows a dot per post (tap a day: its posts are listed under the calendar); one-letter
   weekdays; the week view scrolls sideways inside its own box */
@media (max-width:640px){
  .cal-bar h2{flex:1 1 100%;order:-1;margin:0}
  .cal-wd{padding:6px 0;text-align:center}
  .cal-wd__l{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
  .cal-wd__s{display:inline}
  .dc{min-height:52px;align-items:center;padding:4px 2px 6px}
  .dc>.pc,.dc>.more{display:none}
  .dn{width:32px;height:32px}
  .dc-dots{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:3px;max-width:100%;font-size:var(--text-2xs);line-height:1;color:var(--text-muted)}
  .dc-dots i{width:6px;height:6px;border-radius:var(--radius-full)}
  .cal-week>.wk{min-width:600px}
}
`;

// ---- markup ----

export default class CalendarScreen extends Component {
  render() {
    const v = this.renderVals();
    return (
      <div className="dc-screen ds" data-screen="Calendar">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <Sidebar sticky="" active="comm-cal" />
          <main className="gc-shell__main">
            <Topbar crumb="Communication" page="Post calendar" />
            <div className="gc-shell__content">
              <div className="ix-page">
                <ShopHeader icon="calendar-days" title="Post calendar"
                  about="Every social post and reminder by day, in month or week view. Weeks start on Saturday. Pick a day to see its posts, copy one to the next week or move it a day. Drafts without a date wait in the drafts tray."
                  secondary={[{ label: v.draftCount ? 'Drafts · ' + v.draftCount : 'Drafts', onClick: v.openDrafts }]}
                  more={[{ label: 'Best times to post', onClick: v.openBest }, { label: 'Connections', href: '/connections?group=social' }]}
                  primary={{ label: 'Create post', href: '/composer' }} />

                <div className="ix-record cal-layout">
                  <div className="ix-main">
                    <section className="ix-card" aria-label={v.title}>
                      <div className="cal-bar">
                        <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label={v.isMonth ? 'Previous month' : 'Previous week'} onClick={v.prev}><Icon name="chevron-left" width="16" height="16" aria-hidden="true" /></button>
                        <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label={v.isMonth ? 'Next month' : 'Next week'} onClick={v.next}><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button>
                        <h2>{v.title}</h2>
                        <button type="button" className="ix-btn ix-btn--sm" onClick={v.today}>Today</button>
                        <div className="gc-seg" role="radiogroup" aria-label="View">
                          {[['month', 'Month'], ['week', 'Week']].map(([k, l]) => <button key={k} type="button" role="radio" aria-checked={v.view === k} className={'gc-seg__btn' + (v.view === k ? ' gc-seg__btn--active' : '')} onClick={() => v.setView(k)}>{l}</button>)}
                        </div>
                        <select className="ix-pick" aria-label="Channel" value={v.f} onChange={v.setF}>
                          <option value="">All channels</option>
                          {PLAT.map((p) => <option key={p[0]} value={p[0]}>{short(p[1])}</option>)}
                        </select>
                      </div>

                      {v.isMonth ? (<>
                        <div className="cal-grid">
                          {WD.map((w) => <div key={w} className={'cal-wd' + (w === 'Fri' ? ' is-fri' : '')}><span className="cal-wd__l">{w}{w === 'Fri' ? ' · weekend' : ''}</span><span className="cal-wd__s" aria-hidden="true">{w.charAt(0)}</span></div>)}
                        </div>
                        <div className="cal-grid">
                          {v.cells.map((d) => (
                            <div key={d.key} className={'dc' + (d.sel ? ' is-sel' : '') + (d.today ? ' is-today' : '') + (d.out ? ' is-out' : '') + (d.fri ? ' is-fri' : '')}>
                              <button type="button" className="dn" onClick={d.pick} aria-label={d.aria} aria-pressed={d.sel}>{d.n}</button>
                              {d.dots.length ? <span className="dc-dots" aria-hidden="true">{d.dots.map((c, i) => <i key={i} style={{ background: c }} />)}{d.dotMore ? <b>{d.dotMore}</b> : null}</span> : null}
                              {d.ev.map((e, i) => (
                                <button key={i} type="button" className="pc" onClick={e.pick} aria-label={e.full} title={e.full} style={{ borderLeftColor: e.sc }}>
                                  <span className="t">{e.t}</span>
                                  <span className="pc__meta">
                                    <span className="pc__icons" aria-hidden="true">{e.pl.map((x) => <ChannelIcon key={x.n} channel={x.ch} size={14} decorative />)}{e.extra ? <span>{e.extra}</span> : null}</span>
                                    <span className="pc__time"><Icon name={e.si} width="12" height="12" aria-hidden="true" />{e.time}</span>
                                  </span>
                                </button>
                              ))}
                              {d.more ? <button type="button" className="more" onClick={d.pick} aria-label={d.moreAria}>{d.moreL}</button> : null}
                            </div>
                          ))}
                        </div>
                      </>) : (
                        <div className="cal-week">
                          <div className="wk">
                            <div className="wk-head" />
                            {v.wkHead.map((h) => <div key={h.d} className={'wk-head' + (h.today ? ' is-today' : '')}><span>{h.d}</span><b>{h.n}</b></div>)}
                            {v.wkRows.map((r) => (
                              <React.Fragment key={r.h}>
                                <div className="wk-h">{r.h}</div>
                                {r.c.map((c, i) => (
                                  <div key={i} className={'wcell' + (c.fri ? ' is-fri' : '')}>
                                    {c.ev.map((e, j) => (
                                      <button key={j} type="button" className="wev" data-st={e.st} onClick={e.pick} aria-label={e.full} title={e.full} style={{ borderLeftColor: e.sc }}>
                                        <b>{e.t}</b>{e.time} · {e.n} places
                                      </button>
                                    ))}
                                  </div>
                                ))}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="ix-foot">
                        <span>{v.summary}</span>
                        <span className="cal-legend">{v.legend.map((g) => <span key={g.l}><Icon name={g.i} width="12" height="12" aria-hidden="true" style={{ color: g.c }} />{g.l}</span>)}</span>
                      </div>
                    </section>
                  </div>

                  <div className="ix-side">
                    <section className="ix-card" aria-labelledby="cal-day">
                      <header className="ix-card__head"><div><h2 id="cal-day">{v.selTitle}</h2><p className="ix-card__sub">{v.selSub}</p></div></header>
                      <div className="ix-card__body cal-day">
                        {v.selPosts.map((p) => (
                          <div key={p.id + p.time} className="cal-post">
                            <span className="cal-post__top">{p.time}<StatusBadge tone={p.tone} icon={p.si}>{p.st}</StatusBadge>
                              <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" items={[{ label: 'Edit', href: '/composer' }, { label: 'Duplicate', onClick: p.dup }, { label: 'Next day', onClick: p.move }]} />
                            </span>
                            <span className="cal-post__t">{p.t}</span>
                            <span className="cal-post__pl">{p.pl.map((x) => <span key={x.n}><ChannelIcon channel={x.ch} size={14} decorative />{x.n}</span>)}</span>
                          </div>
                        ))}
                        {v.noPosts ? <p className="cal-empty">Nothing on this day. <Link href="/composer">Create a post</Link>.</p> : null}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        <Sheet open={v.panel === 'drafts'} title="Drafts tray" onClose={v.closePanel}>
          <p className="cal-sub">Not on the calendar yet.</p>
          <div>
            {v.drafts.map((d) => (
              <div key={d.id} className="cal-draft">
                <span className="cal-draft__text"><b>{d.t}</b><small>{d.m}</small></span>
                <button type="button" className="ix-btn ix-btn--sm" onClick={d.place}>Add to {d.day}</button>
              </div>
            ))}
            {v.draftCount ? null : <p className="cal-empty">Every draft is on the calendar.</p>}
          </div>
        </Sheet>
        <Sheet open={v.panel === 'best'} title="Best times to post" onClose={v.closePanel}>
          <p className="cal-sub">Darker means more engagement in September. Dhaka time.</p>
          <div className="cal-hm">
            <span />
            {WD.map((w) => <span key={w}>{w.slice(0, 2)}</span>)}
            {v.hm.map((r) => (
              <React.Fragment key={r.l}>
                <span>{r.l}</span>
                {r.c.map((c) => <span key={c.t} className="hm" data-l={c.lvl} title={c.t} />)}
              </React.Fragment>
            ))}
          </div>
          <p className="cal-sub">Best: Thursday and Friday at 8:00 PM. Quietest: mornings before 10:00 AM.</p>
        </Sheet>
      </div>
    );
  }
}
