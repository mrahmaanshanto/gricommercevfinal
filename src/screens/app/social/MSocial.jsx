'use client';
// Merchant app · Social posts (/m-social). The web's Post calendar (src/screens/communication/Calendar.jsx) on a phone:
//   views     Scheduled · Published · Drafts · Failed (chips with counts). Scheduled and Published show a calendar:
//             a week strip (shop weeks start on Saturday, as on the web) or the month (Week / Month), a dot per post,
//             and the picked day's posts under it. Drafts and Failed are plain lists.
//   pages     All pages + each connected place (lib/connections.js › statusOf): only that place's posts
//   a post    opens a sheet: preview, where it goes (per-place result or check), Reschedule, Publish now, Edit,
//             Duplicate (a draft one week later, as on the web), Delete; failed posts: Try again / Remove failed places
// Data: src/lib/socialPosts.js (posts in this browser; scheduled posts go out on their minute — simulated). Read after mount.

import React, { useEffect, useMemo, useState } from 'react';
import {
  AppScreen, Content, LargeHeader, TabBar, Fab, Sheet, Card, Section, ListRow, Chips, Segmented, Pill, Button, Field,
  TextInput, IconButton, EmptyState, Skeleton, Icon, Note, useAppData, useQuery, toast, confirmDialog,
} from '../kit/AppKit';
import { ChannelIcon } from '@/components/ui';
import { hasModule } from '@/lib/edition';
import { clockNow } from '@/lib/settlements';
import {
  PLATS, platBy, platState, getPosts, countsOf, checksFor, STATUS, publishNow, retryPost, dropFailed, duplicatePost,
  reschedule, removePost, SOCIAL_EVENT,
} from '@/lib/socialPosts';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WD = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const pad = (n) => String(n).padStart(2, '0');
const keyOf = (t) => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const fromKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d).getTime(); };
const addDays = (k, n) => { const d = new Date(fromKey(k)); d.setDate(d.getDate() + n); return keyOf(d.getTime()); };
const weekStart = (k) => addDays(k, -((new Date(fromKey(k)).getDay() + 1) % 7));
const dayName = (k) => WD[(new Date(fromKey(k)).getDay() + 1) % 7];
const dayLabel = (k) => { const d = new Date(fromKey(k)); return `${d.getDate()} ${MON[d.getMonth()].slice(0, 3)}`; };
const h12 = (t) => { const d = new Date(t); const h = d.getHours(); return `${h % 12 || 12}:${pad(d.getMinutes())} ${h < 12 ? 'AM' : 'PM'}`; };
const whenText = (t) => (t ? `${dayName(keyOf(t))} ${dayLabel(keyOf(t))}, ${h12(t)}` : 'No date');
const DOT = { sched: 'var(--brand)', remind: 'var(--sky)', done: 'var(--ok)', failed: 'var(--err)', draft: 'var(--muted)' };
const VIEWS = [['scheduled', 'Scheduled'], ['published', 'Published'], ['drafts', 'Drafts'], ['failed', 'Failed']];
const inView = (p, v) => (v === 'scheduled' ? p.status === 'sched' || p.status === 'remind' : v === 'published' ? p.status === 'done' : v === 'drafts' ? p.status === 'draft' : p.status === 'failed');

const CSS = `
[data-screen="MSocial"] .chips{overflow-x:auto;scrollbar-width:none}
[data-screen="MSocial"] .chips::-webkit-scrollbar{display:none}
[data-screen="MSocial"] .pages{overflow-x:auto;scrollbar-width:none;padding-bottom:2px}
[data-screen="MSocial"] .pages::-webkit-scrollbar{display:none}
[data-screen="MSocial"] .pchip{cursor:pointer}
[data-screen="MSocial"] .pchip .gc-channel{width:22px;height:22px}
[data-screen="MSocial"] .cal{margin:0 20px;padding:12px 12px 10px}
[data-screen="MSocial"] .cal-h{display:flex;align-items:center;gap:2px;margin:0 0 8px}
[data-screen="MSocial"] .cal-h b{flex:1;min-width:0;font-size:var(--text-base);font-weight:var(--weight-semibold);padding-left:4px}
[data-screen="MSocial"] .cal-h .seg{margin:0;padding:3px;width:132px}
[data-screen="MSocial"] .cal-h .seg button{height:30px;font-size:var(--text-xs-plus)}
[data-screen="MSocial"] .cal-wd{display:grid;grid-template-columns:repeat(7,1fr);text-align:center;font-size:var(--text-xs);color:var(--muted);margin-bottom:2px}
[data-screen="MSocial"] .cal-wd .fri{color:var(--warn)}
[data-screen="MSocial"] .cal-g{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
[data-screen="MSocial"] .cal-d{display:flex;flex-direction:column;align-items:center;gap:3px;padding:3px 0 4px;border:0;border-radius:var(--radius-lg);background:none;color:var(--ink);cursor:pointer;font:inherit}
[data-screen="MSocial"] .cal-d .w{font-size:var(--text-xs);color:var(--muted)}
[data-screen="MSocial"] .cal-d .n{width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:var(--radius-full);font-size:var(--text-sm);font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
[data-screen="MSocial"] .cal-d.today .n{color:var(--brand);box-shadow:inset 0 0 0 1.5px var(--brand)}
[data-screen="MSocial"] .cal-d.on .n{background:var(--brand);color:#fff;box-shadow:none}
[data-screen="MSocial"] .cal-d.out{opacity:.4}
[data-screen="MSocial"] .cal-d:focus-visible{outline:2px solid var(--brand);outline-offset:1px}
[data-screen="MSocial"] .dots{display:flex;gap:3px;height:6px;align-items:center}
[data-screen="MSocial"] .dots i{width:6px;height:6px;border-radius:var(--radius-full)}
[data-screen="MSocial"] .dots b{font-size:var(--text-2xs);line-height:6px;color:var(--muted);font-weight:var(--weight-medium)}
[data-screen="MSocial"] .thumb{flex:none;width:44px;height:44px;border-radius:var(--radius-xl);overflow:hidden;display:flex;align-items:center;justify-content:center;background:var(--warnbg);color:var(--warn)}
[data-screen="MSocial"] .thumb.video{background:var(--soft);color:var(--brand)}
[data-screen="MSocial"] .thumb.none{background:#eef1f5;color:var(--body)}
[data-screen="MSocial"] .thumb img{width:100%;height:100%;object-fit:cover}
[data-screen="MSocial"] .logos{display:inline-flex;align-items:center;gap:3px;vertical-align:-3px}
[data-screen="MSocial"] .pv{overflow:hidden;border:1px solid var(--line);border-radius:var(--radius-xl)}
[data-screen="MSocial"] .pv-head{display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--line)}
[data-screen="MSocial"] .pv-head b{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold)}
[data-screen="MSocial"] .pv-head small{font-size:var(--text-xs);color:var(--muted)}
[data-screen="MSocial"] .pv-media{display:flex;align-items:flex-end;gap:6px;height:170px;padding:10px;background:var(--warnbg);color:var(--warn);font-size:var(--text-xs);font-weight:var(--weight-medium);position:relative}
[data-screen="MSocial"] .pv-media.video{background:var(--soft);color:var(--brand)}
[data-screen="MSocial"] .pv-media img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
[data-screen="MSocial"] .pv-body{padding:10px 12px;display:flex;flex-direction:column;gap:6px}
[data-screen="MSocial"] .pv-body p{margin:0;font-size:var(--text-sm);line-height:20px;white-space:pre-line;color:var(--ink)}
[data-screen="MSocial"] .pv-tags{font-size:var(--text-sm);color:var(--brand)}
[data-screen="MSocial"] .pv-link{font-family:var(--font-data);font-size:var(--text-xs);color:var(--brand);word-break:break-all}
[data-screen="MSocial"] .pl{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid var(--line)}
[data-screen="MSocial"] .pl:first-child{border-top:0}
[data-screen="MSocial"] .pl .m{flex:1;min-width:0}
[data-screen="MSocial"] .pl .t{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium)}
[data-screen="MSocial"] .pl .s{display:block;font-size:var(--text-xs);color:var(--muted)}
[data-screen="MSocial"] .pl .s.bad{color:var(--err)}
[data-screen="MSocial"] .sh-acts{display:flex;gap:8px;margin-top:14px}
[data-screen="MSocial"] .sh-acts .btn{flex:1;padding:0 10px}
[data-screen="MSocial"] .sh-h3{margin:16px 0 4px;font-size:var(--text-xs-plus);font-weight:var(--weight-semibold);color:var(--muted)}
`;

/** A post's first picture (or a tinted tile with its kind). */
function Thumb({ post, size = 44 }) {
  const m = (post.media || [])[0];
  const st = { width: size + 'px', height: size + 'px' };
  if (m && m.src && m.kind === 'photo') return <span className="thumb" style={st}><img src={m.src} alt="" /></span>;
  if (m) return <span className={'thumb' + (m.kind === 'video' ? ' video' : '')} style={st}><Icon name={m.kind === 'video' ? 'zap' : 'gift'} size={20} /></span>;
  return <span className="thumb none" style={st}><Icon name="edit" size={20} /></span>;
}
function Logos({ plats, max = 4 }) {
  return (
    <span className="logos" aria-hidden="true">
      {plats.slice(0, max).map((k) => { const p = platBy(k); return p ? <ChannelIcon key={k} channel={p.ch} size={14} decorative /> : null; })}
      {plats.length > max ? <span>+{plats.length - max}</span> : null}
    </span>
  );
}
function PostRow({ post, onOpen, showDate }) {
  const [label, tone] = STATUS[post.status] || STATUS.draft;
  const names = post.plats.map((k) => (platBy(k) || {}).short).filter(Boolean).join(', ');
  const failedN = Object.values(post.results || {}).filter((r) => r === 'failed').length;
  const when = post.at ? (showDate ? whenText(post.at) : h12(post.at)) : `${post.plats.length} ${post.plats.length === 1 ? 'place' : 'places'} · no date`;
  return (
    <ListRow
      onClick={() => onOpen(post.id)}
      avatar={<Thumb post={post} />}
      title={post.title}
      sub={<><Logos plats={post.plats} /> {when}{post.status === 'failed' && failedN ? ` · ${failedN} failed` : ''}</>}
      pill={{ tone, text: label }}
      chevron={false}
    />
  );
}

export default function MSocialScreen() {
  const { ready, tick, ctx } = useAppData([SOCIAL_EVENT, 'gc:connections']);
  const q = useQuery();
  const [view, setView] = useState('scheduled');
  const [page, setPage] = useState('');
  const [mode, setMode] = useState('week');
  const [sel, setSel] = useState(null);          // day key
  const [openId, setOpenId] = useState('');
  const [today, setToday] = useState(null);

  useEffect(() => {
    if (!ready) return;
    const t = keyOf(safe(() => clockNow(), Date.now()));
    setToday(t);
    setSel((s) => s || t);
  }, [ready]);
  useEffect(() => {
    if (!q) return;
    const v = q.get('view');
    if (v && VIEWS.some(([k]) => k === v)) setView(v);
    if (q.get('id')) setOpenId(q.get('id'));
    if (q.get('day')) setSel(q.get('day'));
  }, [q]);

  const posts = useMemo(() => (ready ? safe(() => getPosts(), []) : []), [ready, tick]);
  // the connected places, for the page filter (manual places follow their app)
  const pages = useMemo(() => (ready ? PLATS.filter((p) => p.auto && platState(p.key).state !== 'off') : []), [ready, tick]);
  const shown = posts.filter((p) => !page || p.plats.includes(page));
  const counts = countsOf(shown);
  const list = shown.filter((p) => inView(p, view));
  const calendar = view === 'scheduled' || view === 'published';
  const comms = ctx ? hasModule('comms', ctx.ed) : true;

  // calendar
  const day = sel || today;
  const byDay = useMemo(() => {
    const m = {};
    list.forEach((p) => { if (p.at) (m[keyOf(p.at)] = m[keyOf(p.at)] || []).push(p); });
    Object.values(m).forEach((a) => a.sort((x, y) => x.at - y.at));
    return m;
  }, [list]);
  let cells = [];
  let title = '';
  if (day) {
    if (mode === 'week') {
      const ws = weekStart(day);
      cells = Array.from({ length: 7 }, (_, i) => ({ k: addDays(ws, i), out: false }));
      const a = cells[0].k, b = cells[6].k;
      title = `${dayLabel(a)} – ${dayLabel(b)}`;
    } else {
      const d = new Date(fromKey(day));
      const first = keyOf(new Date(d.getFullYear(), d.getMonth(), 1).getTime());
      const last = keyOf(new Date(d.getFullYear(), d.getMonth() + 1, 0).getTime());
      let k = weekStart(first);
      while (k <= last || cells.length % 7) { cells.push({ k, out: k < first || k > last }); k = addDays(k, 1); }
      title = `${MON[d.getMonth()]} ${d.getFullYear()}`;
    }
  }
  const step = (n) => {
    if (!day) return;
    if (mode === 'week') { setSel(addDays(day, 7 * n)); return; }
    const d = new Date(fromKey(day));
    setSel(keyOf(new Date(d.getFullYear(), d.getMonth() + n, 1).getTime()));
  };
  const dayPosts = day ? byDay[day] || [] : [];
  const nextUp = !dayPosts.length && view === 'scheduled' ? list.filter((p) => p.at && keyOf(p.at) > (day || '')).sort((a, b) => a.at - b.at)[0] : null;

  const open = posts.find((p) => p.id === openId) || null;

  return (
    <AppScreen name="MSocial" title="Social posts" css={CSS}>
      <Content top={47} bottom={0}>
        <LargeHeader title="Social posts" eyebrow={ready ? `${counts.scheduled} scheduled · ${counts.drafts} drafts` : ' '}
          actions={<IconButton icon="calendar" label="Today" soft onClick={() => { if (today) setSel(today); }} />} />
        {!comms ? (
          <Card style={{ marginTop: '18px' }}><EmptyState icon="megaphone" title="Social posts are not part of this plan." /></Card>
        ) : (<>
          <Chips style={{ marginTop: '14px' }} value={view} onChange={setView}
            items={VIEWS.map(([k, l]) => ({ key: k, label: l, n: ready ? counts[k] : undefined }))} />
          {pages.length ? (
            <div className="chips pages" role="group" aria-label="Page" style={{ marginTop: '10px' }}>
              <button type="button" className={'pchip' + (!page ? ' on' : '')} aria-pressed={!page} onClick={() => setPage('')}>All pages</button>
              {pages.map((p) => (
                <button key={p.key} type="button" className={'pchip' + (page === p.key ? ' on' : '')} aria-pressed={page === p.key} onClick={() => setPage(page === p.key ? '' : p.key)}>
                  <ChannelIcon channel={p.ch} size={22} decorative />{p.short}
                </button>
              ))}
            </div>
          ) : null}

          {!ready ? <div style={{ marginTop: '18px' }}><Skeleton rows={4} /></div> : calendar ? (<>
            <div className="card cal" style={{ marginTop: '14px' }}>
              <div className="cal-h">
                <button type="button" className="ib" aria-label={mode === 'week' ? 'Previous week' : 'Previous month'} onClick={() => step(-1)}><Icon name="back" size={20} stroke={2} /></button>
                <button type="button" className="ib" aria-label={mode === 'week' ? 'Next week' : 'Next month'} onClick={() => step(1)}><Icon name="chev" size={20} stroke={2} /></button>
                <b className="ell">{title}</b>
                <Segmented items={[{ key: 'week', label: 'Week' }, { key: 'month', label: 'Month' }]} value={mode} onChange={setMode} />
              </div>
              {mode === 'month' ? <div className="cal-wd" aria-hidden="true">{WD.map((w) => <span key={w} className={w === 'Fri' ? 'fri' : ''}>{w.charAt(0)}</span>)}</div> : null}
              <div className="cal-g">
                {cells.map((c) => {
                  const ev = byDay[c.k] || [];
                  const on = c.k === day;
                  const d = new Date(fromKey(c.k));
                  return (
                    <button key={c.k} type="button" className={'cal-d' + (on ? ' on' : '') + (c.k === today ? ' today' : '') + (c.out ? ' out' : '')}
                      aria-pressed={on} aria-label={`${dayName(c.k)} ${d.getDate()} ${MON[d.getMonth()]}, ${ev.length} ${ev.length === 1 ? 'post' : 'posts'}`}
                      onClick={() => setSel(c.k)}>
                      {mode === 'week' ? <span className="w">{dayName(c.k)}</span> : null}
                      <span className="n">{d.getDate()}</span>
                      <span className="dots" aria-hidden="true">{ev.slice(0, 3).map((p) => <i key={p.id} style={{ background: DOT[p.status] }} />)}{ev.length > 3 ? <b>+</b> : null}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Section title={day ? `${dayName(day)} ${dayLabel(day)}${day === today ? ' · today' : ''}` : ' '}
              action={<span style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{dayPosts.length ? `${dayPosts.length} ${dayPosts.length === 1 ? 'post' : 'posts'}` : ''}</span>}>
              {dayPosts.length ? (
                <Card>{dayPosts.map((p) => <PostRow key={p.id} post={p} onOpen={setOpenId} />)}</Card>
              ) : (
                <Card>
                  <EmptyState icon="calendar" title={view === 'published' ? 'Nothing went out on this day.' : 'Nothing on this day.'}
                    action={view === 'scheduled' ? { label: 'Create post', href: day && day >= (today || '') ? `/m-post-new?day=${day}` : '/m-post-new' } : null} />
                  {nextUp ? <ListRow onClick={() => { setSel(keyOf(nextUp.at)); }} icon="clock" title={`Next: ${nextUp.title}`} sub={whenText(nextUp.at)} /> : null}
                </Card>
              )}
            </Section>
          </>) : (
            <div style={{ marginTop: '14px' }}>
              {list.length ? (
                <Card>{[...list].sort((a, b) => (b.publishedAt || b.at || b.createdAt || 0) - (a.publishedAt || a.at || a.createdAt || 0)).map((p) => <PostRow key={p.id} post={p} onOpen={setOpenId} showDate />)}</Card>
              ) : (
                <Card><EmptyState icon={view === 'failed' ? 'check' : 'edit'} title={view === 'failed' ? 'No failed posts.' : 'No drafts.'} action={view === 'drafts' ? { label: 'Create post', href: '/m-post-new' } : null} /></Card>
              )}
            </div>
          )}
        </>)}
        <div style={{ height: '8px' }} />
      </Content>
      {comms ? <Fab href={day && day >= (today || '') && calendar ? `/m-post-new?day=${day}` : '/m-post-new'} label="Create post" /> : null}
      <PostSheet post={open} onClose={() => setOpenId('')} />
    </AppScreen>
  );
}

/** The post: preview, places and actions. */
function PostSheet({ post, onClose }) {
  const [move, setMove] = useState(null);   // { date, time } while rescheduling
  const [pv, setPv] = useState('');
  useEffect(() => { setMove(null); setPv(''); }, [post && post.id]);
  if (!post) return null;
  const [label, tone] = STATUS[post.status] || STATUS.draft;
  const checks = checksFor(post);
  const pvKey = pv && post.plats.includes(pv) ? pv : post.plats[0];
  const pvPlat = platBy(pvKey);
  const pvState = pvPlat ? platState(pvKey) : {};
  const media = post.media || [];
  const m0 = media[0];
  const textFor = pvKey === 'x' && Array.from(post.text || '').length > 280 ? Array.from(post.text).slice(0, 230).join('') + '…' : post.text;
  const tags = pvKey === 'x' ? (post.tags || []).slice(0, 2) : (post.tags || []);
  const sched = post.status === 'sched' || post.status === 'remind';

  const doPublish = () => {
    const r = publishNow(post.id);
    if (r.empty) { toast('Pick at least one place to post.', { tone: 'error' }); return; }
    if (!r.ok && r.bad.length) { toast(`${r.bad.length} ${r.bad.length === 1 ? 'place needs' : 'places need'} fixing first: ${r.bad.map((b) => b.name).join(', ')}.`, { tone: 'error' }); return; }
    const auto = r.post.plats.filter((k) => (platBy(k) || {}).auto).length;
    const man = r.post.plats.length - auto;
    toast(`Posting now to ${auto} ${auto === 1 ? 'place' : 'places'}${man ? `, with ${man} ${man === 1 ? 'reminder' : 'reminders'} to post by hand` : ''}.`);
    onClose();
  };
  const startMove = () => {
    const base = post.at && post.at > Date.now() ? post.at : Date.now() + 864e5;
    const d = new Date(base);
    setMove({ date: keyOf(base), time: `${pad(post.at ? d.getHours() : 20)}:${pad(post.at ? d.getMinutes() : 0)}` });
  };
  const saveMove = () => {
    const at = new Date(`${move.date}T${move.time || '20:00'}:00`).getTime();
    if (!move.date || Number.isNaN(at)) { toast('Pick a date and time.', { tone: 'error' }); return; }
    if (at < safe(() => clockNow(), Date.now())) { toast('That time has passed. Use Publish now instead.', { tone: 'error' }); return; }
    reschedule(post.id, at);
    toast(`“${post.title}” moved to ${whenText(at)}.`);
    onClose();
  };
  const dup = () => { const c = duplicatePost(post.id, 7); if (c) toast(c.at ? `Copied as a draft one week later, ${dayLabel(keyOf(c.at))}.` : 'Copied as a draft.'); onClose(); };
  const del = async () => {
    if (!(await confirmDialog({ title: 'Delete this post?', body: post.status === 'done' ? 'It comes off the calendar here. Posts already on the pages stay there.' : 'It will not go out.', confirmLabel: 'Delete', tone: 'danger' }))) return;
    removePost(post.id); toast('Post deleted.'); onClose();
  };
  const retry = () => {
    const r = retryPost(post.id);
    if (r && r.status === 'done') { toast('Posted on every place.'); onClose(); return; }
    const still = r ? Object.keys(r.errors || {}).map((k) => (platBy(k) || {}).short).filter(Boolean) : [];
    toast(`Still failing on ${still.join(', ') || 'a place'}. Fix it on the web (Connections), or remove it.`, { tone: 'error' });
  };
  const drop = () => { dropFailed(post.id); toast('Failed places removed.'); onClose(); };

  let footer;
  if (move) footer = <><Button kind="line" onClick={() => setMove(null)}>Back</Button><Button onClick={saveMove} style={{ flex: 2 }}>Save time</Button></>;
  else if (sched) footer = <><Button kind="line" onClick={startMove}>Reschedule</Button><Button onClick={doPublish} style={{ flex: 2 }}>Publish now</Button></>;
  else if (post.status === 'draft') footer = <><Button kind="line" onClick={startMove}>Schedule</Button><Button onClick={doPublish} style={{ flex: 2 }}>Publish now</Button></>;
  else if (post.status === 'failed') footer = <><Button kind="line" onClick={drop}>Remove failed</Button><Button onClick={retry} style={{ flex: 2 }}>Try again</Button></>;
  else footer = <><Button kind="line" onClick={onClose}>Close</Button><Button kind="soft" onClick={dup} style={{ flex: 2 }}>Duplicate</Button></>;

  return (
    <Sheet open title={post.title} onClose={onClose} footer={footer}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '-4px 0 12px', fontSize: 'var(--text-sm)', color: 'var(--body)' }}>
        <Pill tone={tone} shape>{label}</Pill>
        <span>{post.status === 'done' || post.status === 'failed' ? whenText(post.publishedAt || post.at) : post.at ? whenText(post.at) : 'No date yet'}</span>
      </div>

      {move ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Field label="Date"><TextInput type="date" value={move.date} onChange={(v) => setMove({ ...move, date: v })} /></Field>
          <Field label="Time" help="Dhaka time. Best: Thursday and Friday at 8:00 PM."><TextInput type="time" value={move.time} onChange={(v) => setMove({ ...move, time: v })} /></Field>
        </div>
      ) : (<>
        {post.plats.length > 1 ? (
          <div className="chips pages" role="tablist" aria-label="Preview on" style={{ padding: 0, margin: '0 0 10px' }}>
            {post.plats.map((k) => { const p = platBy(k); return p ? <button key={k} type="button" role="tab" aria-selected={k === pvKey} className={'pchip' + (k === pvKey ? ' on' : '')} onClick={() => setPv(k)}><ChannelIcon channel={p.ch} size={22} decorative />{p.short}</button> : null; })}
          </div>
        ) : null}
        <div className="pv">
          <div className="pv-head">
            {pvPlat ? <ChannelIcon channel={pvPlat.ch} size={32} decorative /> : null}
            <span style={{ minWidth: 0 }}><b className="ell">{pvState.account || (pvPlat ? pvPlat.name : '')}</b><small>{pvPlat ? pvPlat.name : ''}{post.at ? ' · ' + whenText(post.at) : ''}</small></span>
          </div>
          {m0 && pvKey !== 'x' ? (
            <div className={'pv-media' + (m0.kind === 'video' ? ' video' : '')}>
              {m0.src && m0.kind === 'photo' ? <img src={m0.src} alt="" /> : null}
              {m0.src && m0.kind === 'photo' ? null : <><Icon name={m0.kind === 'video' ? 'zap' : 'gift'} size={18} />{m0.name}</>}
              {media.length > 1 ? <span className="pill p-grey" style={{ position: 'absolute', right: '10px', bottom: '10px' }}>+{media.length - 1}</span> : null}
            </div>
          ) : null}
          <div className="pv-body">
            <p>{textFor}</p>
            {tags.length ? <span className="pv-tags">{tags.join(' ')}</span> : null}
            {post.link && pvKey !== 'ig' ? <span className="pv-link">{post.link}</span> : null}
          </div>
        </div>

        <h3 className="sh-h3">{post.status === 'done' || post.status === 'failed' ? 'Where it went' : 'Where it goes'}</h3>
        <div>
          {post.plats.map((k) => {
            const p = platBy(k);
            if (!p) return null;
            const res = (post.results || {})[k];
            const ck = checks.find((c) => c.key === k) || {};
            let pill, sub, bad = false;
            if (res === 'ok') { pill = <Pill tone="ok">Posted</Pill>; sub = platState(k).account || p.supports; }
            else if (res === 'failed') { pill = <Pill tone="err">Failed</Pill>; sub = (post.errors || {})[k] || 'Did not go out.'; bad = true; }
            else if (res === 'reminder') { pill = <Pill tone="nav">Reminder sent</Pill>; sub = 'Posted by hand from the reminder.'; }
            else {
              const T = { bad: ['err', 'Fix'], warn: ['warn', 'Check'], info: ['nav', 'Info'], ok: ['ok', 'Ready'] }[ck.tone || 'ok'];
              pill = <Pill tone={T[0]}>{T[1]}</Pill>; sub = ck.msg; bad = ck.tone === 'bad';
            }
            return (
              <div key={k} className="pl">
                <ChannelIcon channel={p.ch} size={28} decorative />
                <span className="m"><span className="t">{p.name}</span><span className={'s' + (bad ? ' bad' : '')}>{sub}</span></span>
                {pill}
              </div>
            );
          })}
        </div>
        {post.status === 'failed' ? <Note tone="warn" icon="alert" style={{ marginTop: '10px' }}>Connect the place on the web (Settings › Connections), then try again — or remove it.</Note> : null}

        <div className="sh-acts">
          {post.status !== 'done' ? <Button kind="soft" icon="edit" href={`/m-post-new?id=${encodeURIComponent(post.id)}`}>Edit</Button> : null}
          {post.status !== 'done' ? <Button kind="soft" onClick={dup}>Duplicate</Button> : null}
          <Button kind="danger" onClick={del}>Delete</Button>
        </div>
      </>)}
    </Sheet>
  );
}
