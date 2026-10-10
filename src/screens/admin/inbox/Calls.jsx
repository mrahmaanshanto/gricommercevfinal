'use client';
// Calls (/admin/calls) — GridCommerce's phone desk. Reuses the merchant panel's Calls screen
// (screens/merchant-calls/MerchantCalls.jsx: title row, today's figures, the log card with the dialer and the team
// beside it) and its Dialer look (components/inbox/Dialer.jsx, copied into inboxDialer.jsx). Data: lib/admin/inbox.js.
//   figures   calls today, answered, minutes and cost this month (call charges + the hotline numbers' rent)
//   log       tabs All · Missed · Follow-up · Outgoing · Incoming (counts on the tabs), search; a row opens the call:
//             facts, recording (demo playback), outcome, note and follow-up date; call back
//   side      assigned numbers (one per team, who answers, hours, this month) and usage this month by number
//   dialer    a sheet: keypad / recent / contacts → the call → outcome and note → logged
// URL: ?dial=01XXXXXXXXX&name=… opens the dialer with the number in it (the Inbox's Call buttons use it); ?tab=followup.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { EmptyState, StatusBadge } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, Pager, Menu, KV } from '@/components/ui/IndexKit';
import { HBars, CHART_CSS } from '@/components/charts/DashCharts';
import { formatBDT } from '@/lib/format';
import { downloadCsv } from '@/lib/reports/period';
import { startOfDay, dm, hm, dmy } from '@/lib/platform/util';
import { useAdminStore } from '@/lib/admin/store';
import {
  inbox, LINES, lineOf, KINDS, OUTCOMES, OUTCOME_TONE, RATE, staffName, firstName, callCost, callUsage, isFollowUp, updateCall, followUpDone, digits,
} from '@/lib/admin/inbox';
import { AdminShell } from '../AdminShell';
import { Avatar, StaffAvatar, Sheet, PARTS_CSS } from './inboxParts';
import { fmtDur, dayLabel } from './inboxThread';
import { DialerFlow, DIALER_CSS, fmtPhone, dateToMs, msToDate } from './inboxDialer';

const TABS = [['all', 'All'], ['missed', 'Missed'], ['followup', 'Follow-up'], ['out', 'Outgoing'], ['in', 'Incoming']];
const DIR = { in: ['Incoming', 'phone-incoming'], out: ['Outgoing', 'phone-outgoing'], missed: ['Missed', 'phone-missed'] };
const PAGE = 20;
const when = (at, t) => `${dayLabel(at, t)} ${hm(at)}`;
const taka2 = (n) => formatBDT(n, { decimals: n % 1 ? 2 : 0 });

export default function Calls() {
  const { data, t, live } = useAdminStore(inbox);
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [find, setFind] = useState(false);
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState('');
  const [dialer, setDialer] = useState(null);     // null or { number?, name?, from?, line?, key }
  const [phase, setPhase] = useState('dial');

  useEffect(() => {
    if (!live) return;
    const p = new URLSearchParams(window.location.search);
    if (TABS.some((x) => x[0] === p.get('tab'))) setTab(p.get('tab'));
    const dial = p.get('dial');
    if (dial) { setDialer({ number: dial, name: p.get('name') || '', key: Date.now() }); toast(`${p.get('name') || fmtPhone(dial)} is in the dialer — press Call`, { tone: 'info' }); }
  }, [live]);
  useEffect(() => { setPage(0); }, [tab, q]);

  const calls = live ? data.calls : [];
  const people = useMemo(() => {
    if (!live) return [];
    const seen = new Map();
    data.convs.forEach((c) => { if (c.phone && !seen.has(c.contactKey)) seen.set(c.contactKey, { key: c.contactKey, name: c.name, company: c.company, kind: c.kind, phone: c.phone, shopId: c.shopId }); });
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [live, data]);
  const convOf = (c) => (c.contactKey ? data.convs.filter((x) => x.contactKey === c.contactKey).sort((a, b) => b.messages.length - a.messages.length)[0] : null);

  const needle = q.trim().toLowerCase();
  const base = calls.filter((c) => !needle || [c.name, c.company, c.phone, digits(c.phone), c.note, c.outcome, staffName(c.agent), lineOf(c.line).name].join(' ').toLowerCase().includes(needle));
  const inTab = (c, k) => (k === 'all' ? true : k === 'followup' ? isFollowUp(c) : c.dir === k);
  const rows = base.filter((c) => inTab(c, tab)).sort(tab === 'followup' ? (a, b) => a.followUp - b.followUp : (a, b) => b.at - a.at);
  const shown = rows.slice(page * PAGE, page * PAGE + PAGE);

  const today = calls.filter((c) => c.at >= startOfDay(t));
  const inToday = today.filter((c) => c.dir === 'in').length;
  const missedToday = today.filter((c) => c.dir === 'missed').length;
  const usage = live ? callUsage(calls, t) : null;
  const sel = calls.find((c) => c.id === openId) || null;

  const callBack = (c) => { setOpenId(''); setDialer({ number: c.phone, name: c.name, from: isFollowUp(c) ? c.id : '', line: c.line, key: Date.now() }); };
  const done = (c) => { followUpDone(c.id, true); toast(`Follow-up with ${c.name || fmtPhone(c.phone)} done`, { undo: () => followUpDone(c.id, false) }); };
  const exportCsv = () => {
    downloadCsv('gridcommerce-calls.csv', [['Call', 'Direction', 'Number', 'Name', 'Business', 'Line', 'When', 'Duration (s)', 'Handled by', 'Outcome', 'Note', 'Follow-up', 'Cost (BDT)'],
      ...rows.map((c) => [c.id, DIR[c.dir][0], c.phone, c.name, c.company, lineOf(c.line).number, new Date(c.at).toISOString(), c.dur, c.agent ? staffName(c.agent) : '', c.outcome, c.note, c.followUp ? dmy(c.followUp) : '', callCost(c)])]);
    toast(`${rows.length} calls exported`);
  };
  const outcomeBadge = (c) => (c.outcome ? <StatusBadge tone={OUTCOME_TONE[c.outcome] || 'neutral'}>{c.outcome}</StatusBadge>
    : c.dir === 'missed' ? (isFollowUp(c) ? <StatusBadge tone="warning">Call back</StatusBadge> : <StatusBadge tone="success">Called back</StatusBadge>) : <span className="ix-muted">No outcome</span>);
  const followBadge = (c) => (isFollowUp(c) ? <span className={'gc-badge gc-badge--' + (c.followUp < t ? 'error' : 'info')}>{c.followUp < t ? 'Overdue' : 'Follow up ' + dayLabel(c.followUp, t).replace('Today', 'today')}</span> : null);
  const rowMenu = (c) => [
    { label: c.dir === 'missed' || isFollowUp(c) ? 'Call back' : 'Call again', onClick: () => callBack(c) },
    { label: c.outcome ? 'Edit the outcome' : 'Log the outcome', onClick: () => setOpenId(c.id) },
    isFollowUp(c) ? { label: 'Mark follow-up done', onClick: () => done(c) } : null,
    convOf(c) ? { label: 'Open their chats', href: '/admin/inbox?c=' + convOf(c).id } : null,
    c.shopId ? { label: 'Open merchant', href: '/admin/merchant?id=' + c.shopId } : null,
  ].filter(Boolean);
  const who = (c) => c.name || fmtPhone(c.phone);

  let body;
  if (!live) {
    body = <><div className="cl-skel cl-skel--strip" /><div className="cl-skel" /></>;
  } else {
    body = (<>
      <MetricStrip label="Calls" items={[
        { label: 'Calls today', value: String(today.length), sub: `${inToday} in · ${today.filter((c) => c.dir === 'out').length} out`, icon: 'phone' },
        { label: 'Answered today', value: inToday + missedToday ? Math.round((inToday / (inToday + missedToday)) * 100) + '%' : '—', sub: missedToday ? `${missedToday} missed` : 'of incoming', icon: 'phone-incoming' },
        { label: 'Minutes this month', value: String(usage.minutes), sub: `${usage.inMin} in · ${usage.outMin} out`, icon: 'timer' },
        { label: 'Cost this month', value: taka2(usage.total), sub: `calls ${taka2(usage.cost)} + numbers ${formatBDT(usage.rent)}`, icon: 'wallet' },
      ]} />
      <div className="ix-record">
        <div className="ix-main">
          <section className="ix-card cl-card" aria-label="Call log">
            <div className="ix-bar">
              {find || q ? (<>
                <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, number, note" onDone={() => { setFind(false); setQ(''); }} autoFocus />
                <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setFind(false); setQ(''); }}>Cancel</button>
              </>) : (<>
                <IndexTabs label="Calls" tabs={TABS.map(([k, l]) => ({ key: k, label: l, count: base.filter((c) => inTab(c, k)).length, id: 'cl-tab-' + k, on: tab === k, onClick: () => setTab(k) }))} />
                <span className="ix-tools"><button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search calls" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button></span>
              </>)}
            </div>
            {rows.length ? (<>
              <ul className="ix-plist" aria-label="Calls">
                {shown.map((c) => (
                  <li key={c.id} className="cl-pli">
                    <button type="button" className="ix-pitem" onClick={() => setOpenId(c.id)}>
                      <span className="ix-pitem__top"><b><span className={'cl-dir cl-dir--' + c.dir}><Icon name={DIR[c.dir][1]} width="16" height="16" aria-hidden="true" /></span>{who(c)}</b><span className="ix-muted">{tab === 'followup' ? dm(c.followUp) : when(c.at, t)}</span></span>
                      <span className="ix-pitem__mid">{c.company ? c.company + ' · ' : ''}{c.dur ? fmtDur(c.dur) : 'not connected'}{c.agent ? ' · ' + firstName(staffName(c.agent)) : ''}</span>
                      <span className="ix-pitem__tags">{outcomeBadge(c)}{followBadge(c)}</span>
                    </button>
                    {tab === 'followup' ? <button type="button" className="ix-btn ix-btn--sm ix-btn--icon cl-callic" aria-label={'Call ' + who(c)} onClick={() => callBack(c)}><Icon name="phone" width="16" height="16" /></button>
                      : <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" items={rowMenu(c)} />}
                  </li>
                ))}
              </ul>
              <div className="ix-table-wrap">
                <table className="ix-table gc-table--keep">
                  <caption className="sr-only">Calls, {TABS.find((x) => x[0] === tab)[1]}</caption>
                  <thead>
                    <tr>
                      <th scope="col"><span className="sr-only">Direction</span></th>
                      <th scope="col">Caller</th>
                      <th scope="col">{tab === 'followup' ? 'Follow up' : 'When'}</th>
                      <th scope="col">Number</th>
                      <th scope="col" className="ix-num">Duration</th>
                      <th scope="col">Outcome</th>
                      <th scope="col">Handled by</th>
                      <th scope="col"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((c) => (
                      <tr key={c.id} onClick={(e) => { if (!e.target.closest('a,button')) setOpenId(c.id); }}>
                        <td className="cl-dircell"><span className={'cl-dir cl-dir--' + c.dir} title={DIR[c.dir][0]}><Icon name={DIR[c.dir][1]} width="16" height="16" aria-hidden="true" /><span className="sr-only">{DIR[c.dir][0]}</span></span></td>
                        <td><button type="button" className="ix-strong cl-name" onClick={() => setOpenId(c.id)}>{who(c)}</button>{c.company ? <span className="cl-co">{c.company}</span> : null}</td>
                        <td className="ix-muted">{tab === 'followup' ? <>{followBadge(c)} <span>{dm(c.followUp)}</span></> : when(c.at, t)}</td>
                        <td className="ix-muted">{lineOf(c.line).name}</td>
                        <td className="ix-num">{c.dur ? fmtDur(c.dur) : '—'}</td>
                        <td>{outcomeBadge(c)}</td>
                        <td className={c.agent ? '' : 'ix-muted'}>{c.agent ? firstName(staffName(c.agent)) : 'Nobody'}</td>
                        <td className="ix-num">{tab === 'followup' ? <span className="cl-acts"><button type="button" className="ix-btn ix-btn--sm" onClick={() => done(c)}>Done</button><button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => callBack(c)}><Icon name="phone" width="16" height="16" aria-hidden="true" />Call</button></span>
                          : <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" items={rowMenu(c)} />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pager label={`${page * PAGE + 1}–${Math.min(rows.length, page * PAGE + PAGE)} of ${rows.length}`} atStart={page === 0} atEnd={(page + 1) * PAGE >= rows.length} prev={() => setPage((p) => p - 1)} next={() => setPage((p) => p + 1)} />
            </>) : (
              <div className="ix-empty">{needle ? <EmptyState icon="search-x" title="No calls match" actionLabel="Clear search" onAction={() => { setQ(''); setFind(false); }} />
                : tab === 'followup' ? <EmptyState icon="phone-call" title="No follow-up calls waiting" /> : <EmptyState icon="phone-off" title="No calls here yet" actionLabel="Open the dialer" onAction={() => setDialer({ key: Date.now() })} />}</div>
            )}
          </section>
        </div>

        <div className="ix-side">
          <section className="ix-card" aria-label="Assigned numbers">
            <header className="ix-card__head"><h2>Assigned numbers</h2></header>
            <ul className="cl-lines">
              {usage.lines.map((l) => (
                <li key={l.id}>
                  <span className="cl-lines__top"><b>{l.name}</b><span className="ib-data">{l.number}</span></span>
                  <span className="cl-lines__mid"><span className="cl-team">{l.staff.map((s) => <StaffAvatar key={s} id={s} size={20} />)}</span><span className="ib-sub">{l.team} · {l.hours}</span></span>
                  <span className="ib-sub">{l.calls} calls · {l.minutes} min this month{l.missed ? ` · ${l.missed} missed` : ''}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="ix-card" aria-label="Usage this month">
            <header className="ix-card__head"><h2>Usage this month</h2></header>
            <div className="ix-card__body">
              <HBars rows={usage.lines.filter((l) => l.minutes).map((l, i) => ({ key: l.id, label: l.name, sub: `${l.minutes} min`, value: l.cost, text: taka2(l.cost), color: `var(--viz-${(i % 8) + 1})` }))} />
              <KV rows={[
                ['Call charges', taka2(usage.cost)],
                ['Numbers (rent)', formatBDT(usage.rent)],
                ['Total', <b key="t">{taka2(usage.total)}</b>],
              ]} />
              <p className="ib-sub cl-rate">Incoming ৳{RATE.in.toFixed(2)} and outgoing ৳{RATE.out.toFixed(2)} a started minute.</p>
            </div>
          </section>
        </div>
      </div>
    </>);
  }

  return (
    <AdminShell active="calls">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ix-page cl">
        <ShopHeader icon="phone" title="Calls"
          about="Calls in and out of GridCommerce's numbers (sales, support, billing, onboarding, partners): who called, who answered, the outcome and the note, follow-up calls, and this month's minutes and cost."
          secondary={[{ label: 'Export', icon: 'download', onClick: exportCsv, disabled: !live || !rows.length }]}
          more={[{ label: 'Open the Inbox', href: '/admin/inbox' }]}
          primary={{ label: 'Dialer', icon: 'grid-3x3', onClick: () => setDialer({ key: Date.now() }) }} />
        {body}
      </div>

      <Sheet open={!!dialer} title={phase === 'call' ? 'On a call' : phase === 'outcome' ? 'How did the call go?' : 'Dialer'}
        onClose={() => { if (phase === 'call') { toast('End the call first', { tone: 'error' }); return; } setDialer(null); setPhase('dial'); }}>
        {dialer && live ? (
          <div className="cl-sheetpad">
            <DialerFlow key={dialer.key} start={dialer} people={people} now={t} onPhase={setPhase}
              recent={calls.filter((c, i) => calls.findIndex((x) => digits(x.phone) === digits(c.phone)) === i).slice(0, 8).map((c) => ({ ...c, when: dayLabel(c.at, t) }))}
              onDone={() => { setDialer(null); setPhase('dial'); }} />
          </div>
        ) : null}
      </Sheet>

      {sel ? <CallSheet c={sel} t={t} conv={convOf(sel)} onClose={() => setOpenId('')} onCallBack={() => callBack(sel)} onDone={() => done(sel)} /> : null}
    </AdminShell>
  );
}

/** One call: the facts, the recording, and its outcome, note and follow-up. */
function CallSheet({ c, t, conv, onClose, onCallBack, onDone }) {
  const [f, setF] = useState({ outcome: c.outcome || '', note: c.note || '', follow: msToDate(c.followUp) });
  const [err, setErr] = useState('');
  const [play, setPlay] = useState(null);   // seconds played, or null
  useEffect(() => { setF({ outcome: c.outcome || '', note: c.note || '', follow: msToDate(c.followUp) }); setErr(''); setPlay(null); }, [c.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (play == null) return undefined;
    const id = window.setInterval(() => setPlay((p) => (p == null ? p : p + 1 >= c.dur ? null : p + 1)), 1000);
    return () => window.clearInterval(id);
  }, [play == null, c.dur]); // eslint-disable-line react-hooks/exhaustive-deps
  const line = lineOf(c.line);
  const kind = KINDS[c.kind];
  const save = (e) => {
    e.preventDefault();
    const res = updateCall(c.id, { outcome: f.outcome, note: f.note.trim(), followUp: dateToMs(f.follow) });
    if (!res.ok) { setErr(res.error); return; }
    toast('Call saved');
    onClose();
  };
  return (
    <Sheet open title={c.name || fmtPhone(c.phone)} onClose={onClose}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={onCallBack}><Icon name="phone" width="16" height="16" aria-hidden="true" />{c.dir === 'missed' ? 'Call back' : 'Call again'}</button><button type="submit" form="cl-form" className="gc-btn gc-btn--solid">Save</button></>}>
      <div className="cl-detail">
        <div className="cl-who">
          <Avatar name={c.name || c.phone} size={40} />
          <span><b>{c.name || 'Unknown caller'}</b><span className="ib-sub"><span className="ib-data">{fmtPhone(c.phone)}</span>{c.company ? ' · ' + c.company : ''}</span></span>
          {kind ? <StatusBadge tone={kind.tone}>{kind.label}</StatusBadge> : null}
        </div>
        <div className="cl-links">
          {c.shopId ? <Link className="gc-btn gc-btn--sm gc-btn--neutral" href={'/admin/merchant?id=' + c.shopId}><Icon name="store" width="16" height="16" aria-hidden="true" />Open merchant</Link> : null}
          {c.kind === 'lead' ? <Link className="gc-btn gc-btn--sm gc-btn--neutral" href={'/admin/leads?q=' + encodeURIComponent(c.company || c.name)}><Icon name="target" width="16" height="16" aria-hidden="true" />Open in Leads</Link> : null}
          {conv ? <Link className="gc-btn gc-btn--sm gc-btn--neutral" href={'/admin/inbox?c=' + conv.id}><Icon name="messages-square" width="16" height="16" aria-hidden="true" />Their chats</Link> : null}
        </div>
        <KV rows={[
          ['Direction', DIR[c.dir][0]],
          ['When', `${dmy(c.at)} ${hm(c.at)}`],
          ['Number', `${line.name} · ${line.number}`],
          ['Duration', c.dur ? fmtDur(c.dur) : 'Not connected'],
          ['Handled by', c.agent ? staffName(c.agent) : 'Nobody'],
          ['Cost', taka2(callCost(c))],
        ]} />
        {c.rec ? (
          <div className="cl-rec">
            <button type="button" className="ix-btn ix-btn--icon cl-play" onClick={() => setPlay(play == null ? 0 : null)} aria-label={play == null ? 'Play the recording' : 'Stop the recording'}><Icon name={play == null ? 'play' : 'pause'} width="16" height="16" /></button>
            <span className="gc-progress cl-track"><span className="gc-progress__fill" style={{ width: ((play || 0) / Math.max(1, c.dur)) * 100 + '%' }} /></span>
            <span className="ib-sub ib-data">{fmtDur(play || 0)} / {fmtDur(c.dur)}</span>
          </div>
        ) : null}
        {isFollowUp(c) ? (
          <div className="cl-follow"><Icon name="calendar-clock" width="16" height="16" aria-hidden="true" /><span>Follow-up call {c.followUp < t ? 'was due' : 'due'} {dm(c.followUp)}</span><button type="button" className="gc-btn gc-btn--xs gc-btn--flat" onClick={onDone}>Mark done</button></div>
        ) : null}
        <form id="cl-form" className="cl-form" onSubmit={save}>
          <div><label className="gc-label" htmlFor="cl-oc">Outcome</label><select id="cl-oc" className="gc-input gc-select" value={f.outcome} onChange={(e) => setF({ ...f, outcome: e.target.value })}><option value="">No outcome yet</option>{OUTCOMES.map((o) => <option key={o}>{o}</option>)}</select></div>
          <div><label className="gc-label" htmlFor="cl-fu">Follow-up call{f.outcome === 'Callback needed' ? ' *' : ''}</label><input id="cl-fu" type="date" className="gc-input" value={f.follow} onChange={(e) => setF({ ...f, follow: e.target.value })} /></div>
          <div><label className="gc-label" htmlFor="cl-note">Note</label><textarea id="cl-note" className="gc-input" rows="3" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="What was agreed, for the next person who calls" /></div>
          {err ? <p className="ib-err" role="alert">{err}</p> : null}
        </form>
      </div>
    </Sheet>
  );
}

const CSS = PARTS_CSS + DIALER_CSS + CHART_CSS + `
.cl-skel{height:320px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-card),var(--surface-subtle),var(--surface-card));background-size:200% 100%;animation:cl-sk 1.4s ease infinite}
.cl-skel--strip{height:72px}
@keyframes cl-sk{from{background-position:100% 0}to{background-position:-100% 0}}
@media (prefers-reduced-motion:reduce){.cl-skel{animation:none}}
.cl-card{container-type:inline-size}
@container (max-width:640px){.cl-card .ix-table-wrap{display:none}.cl-card .ix-plist{display:block}}
.cl-dircell{width:36px;padding-right:0!important}
.cl-dir{display:inline-flex;flex:none;align-items:center;vertical-align:middle;color:var(--text-body)}
.cl-dir--in{color:var(--text-success)}.cl-dir--out{color:var(--text-info)}.cl-dir--missed{color:var(--text-danger)}
.ix-pitem__top .cl-dir{margin-right:6px}
.cl-name{padding:0;border:0;background:none;font:inherit;text-align:left;cursor:pointer}
.cl-name:hover{color:var(--primary);text-decoration:underline}
.cl-co{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.cl-acts{display:inline-flex;gap:var(--space-1-5)}
.cl-pli{display:flex;align-items:center;gap:var(--space-1);padding-right:6px;border-bottom:1px solid var(--border-subtle)}
.ix-plist>li.cl-pli:last-child{border-bottom:0}
.cl-pli>.ix-pitem{flex:1;min-width:0;border:0;border-bottom:0;background:none;font:inherit;text-align:left;cursor:pointer}
.cl-pli .ix-pitem__tags{display:flex;flex-wrap:wrap;gap:6px}
.cl-callic{color:var(--text-success)}
.cl-lines{list-style:none;margin:0;padding:var(--space-2) var(--space-4) var(--space-4);display:flex;flex-direction:column}
.cl-lines li{display:flex;flex-direction:column;gap:4px;padding:var(--space-2-5) 0;border-bottom:1px solid var(--border-subtle)}
.cl-lines li:last-child{border-bottom:0}
.cl-lines__top{display:flex;align-items:baseline;justify-content:space-between;gap:var(--space-2);font-size:var(--text-sm)}
.cl-lines__top b{font-weight:var(--weight-medium);color:var(--text-heading)}
.cl-lines__top .ib-data{font-size:var(--text-sm);color:var(--text-heading)}
.cl-lines__mid{display:flex;align-items:center;gap:var(--space-2)}
.cl-team{display:inline-flex}
.cl-team .ib-staff+.ib-staff{margin-left:-6px;box-shadow:0 0 0 2px var(--surface-card)}
.cl-rate{margin:var(--space-3) 0 0}
.cl-sheetpad{padding:var(--space-4) var(--space-5) var(--space-6)}
.cl-detail{display:flex;flex-direction:column;gap:var(--space-4);padding:var(--space-5)}
.cl-who{display:flex;align-items:center;gap:var(--space-3)}
.cl-who>span{flex:1;min-width:0;display:flex;flex-direction:column}
.cl-who b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cl-links{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.cl-detail .ix-kv{margin:0}
.cl-rec{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-page)}
.cl-play{flex:none;border-radius:var(--radius-full)}
.cl-track{flex:1;height:6px}
.cl-follow{display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--fill-info-soft);font-size:var(--text-sm);color:var(--text-info)}
.cl-follow span{flex:1}
.cl-form{display:flex;flex-direction:column;gap:var(--space-3)}
.cl-form .gc-label{margin-bottom:6px}
.cl-form textarea.gc-input{height:auto;min-height:80px;padding:var(--space-2) var(--space-3);resize:vertical;line-height:1.5}
@media (max-width:640px){.cl-pli .ix-menu .ix-btn,.cl-callic{width:36px;height:36px}}
`;
