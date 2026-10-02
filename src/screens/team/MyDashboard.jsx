'use client';
// My dashboard (/my-dashboard) — the signed-in person's day (src/lib/team.js). Everyone gets their tasks, their
// lead follow-ups and (when they are on the HR staff list) their attendance, leave and pay. Each of the 13 roles
// adds its own blocks: live figures from the report definitions (src/lib/reports) and role widgets — order
// pipeline, team on duty, approvals, content queue, systems, HR today.

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { reportBy, reportInEdition } from '@/lib/reports/catalogue';
import { routeInEdition, hasModule, currentEditionId, LOCKED, EDITION_EVENT } from '@/lib/edition';
import { periodOf, fmt } from '@/lib/reports/period';
import { ORDER_STATUSES } from '@/lib/orderStatus';
import { getPosts } from '@/lib/blog';
import { USERS, roleOf, userBy } from '@/lib/team';
import { setStatus, dueState, dayKeyOf, priorityOf, isMine, getTeams, teamBy } from '@/lib/tasks';
import { unreadTotal } from '@/lib/teamChat';
import { OPEN_STAGES, followState, stageOf, STAGE_WEIGHT } from '@/lib/leads';
import { staffBy, cellOf, todayKey, shiftBy, t12, leaveBalance, loanLeft, leaveType, statusOf } from '@/lib/hr';
import { useHr } from '@/screens/staff-hr/hrShared';
import { TeamPage, useMe, useTasks, useLeads, useTick, UserAvatar, userName } from './teamShared';
import { channelsFor, unread, getMessages, CHAT_EVENT } from '@/lib/teamChat';

const CSS = `
.md-hero{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-4) var(--space-6);padding:var(--space-5) var(--space-6);border-radius:var(--radius-xl);background:var(--brand-navy-deep, var(--primary));color:var(--text-inverse)}
.md-hero__av{display:grid;place-items:center;width:64px;height:64px;flex:none;border-radius:var(--radius-full);background:rgba(255,255,255,.14);border:2px solid rgba(255,255,255,.3);font-size:var(--text-xl);font-weight:var(--weight-semibold)}
.md-hero__txt{flex:1 1 300px;min-width:0;display:flex;flex-direction:column;gap:4px}
.md-hero__txt p{margin:0;font-size:var(--text-sm);color:var(--text-on-dark-muted)}
.md-hero h1{margin:0;font-size:var(--text-2xl);font-weight:var(--weight-semibold);color:var(--text-inverse)}
.md-role{display:inline-flex;align-items:center;gap:6px;align-self:flex-start;height:26px;padding:0 10px;border-radius:var(--radius-full);background:rgba(255,255,255,.14);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.md-links{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.md-links a{background:rgba(255,255,255,.12);color:var(--text-inverse);border-color:rgba(255,255,255,.2)}
.md-links a:hover{background:rgba(255,255,255,.2)}
.md-nums{display:grid;grid-template-columns:repeat(3,minmax(80px,1fr));gap:var(--space-2)}
.md-nums > a{display:flex;flex-direction:column;padding:var(--space-3);border-radius:var(--radius-lg);background:rgba(255,255,255,.08);color:inherit;text-decoration:none}
.md-nums b{font-family:var(--font-data);font-size:var(--text-2xl);font-weight:var(--weight-semibold);line-height:1.1}
.md-nums span{font-size:var(--text-xs);color:var(--text-on-dark-muted)}
.md-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,380px);gap:var(--space-5);align-items:start}
.md-col{display:flex;flex-direction:column;gap:var(--space-5);min-width:0}
.md-card{padding:0;overflow:hidden}
.md-card > header{display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:var(--space-2);padding:var(--space-4) var(--space-5) var(--space-3)}
.md-card > header h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.md-card > header p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.md-body{padding:0 var(--space-5) var(--space-5);display:flex;flex-direction:column;gap:var(--space-3)}
.md-kpis{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:var(--space-2)}
.md-kpi{padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);min-width:0}
.md-kpi span{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.md-kpi b{display:block;margin-top:2px;font-family:var(--font-data);font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.md-mini{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.md-mini th{padding:6px 8px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:left;border-bottom:1px solid var(--border-subtle)}
.md-mini td{padding:7px 8px;border-bottom:1px solid var(--border-subtle);color:var(--text-body)}
.md-mini tr.is-me td{background:var(--fill-primary-soft);color:var(--primary);font-weight:var(--weight-medium)}
.md-mini .num{text-align:right;font-family:var(--font-data);white-space:nowrap}
.md-task{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2) 0;border-bottom:1px solid var(--border-subtle)}
.md-task:last-child{border-bottom:0}
.md-task__main{flex:1;min-width:0;text-decoration:none}
.md-task__main b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.md-check{display:grid;place-items:center;width:36px;height:36px;flex:none;margin:-7px;border:0;border-radius:var(--radius-full);background:none;cursor:pointer;padding:0}
.md-check::before{content:'';width:22px;height:22px;border:2px solid var(--border-field);border-radius:var(--radius-full);background:var(--surface-card)}
.md-check:hover::before{border-color:var(--text-success)}
.md-check:focus-visible{outline:2px solid var(--primary)}
.md-pipe{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:var(--space-2)}
.md-pipe a{display:flex;flex-direction:column;gap:2px;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);text-decoration:none;color:inherit}
.md-pipe a:hover{border-color:var(--primary)}
.md-pipe b{font-family:var(--font-data);font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
.md-row{display:flex;align-items:center;gap:var(--space-3);font-size:var(--text-sm)}
.md-row > span:nth-child(2){flex:1;min-width:0}
.md-kv{display:flex;justify-content:space-between;gap:var(--space-3);font-size:var(--text-sm)}
.md-kv > span:first-child{color:var(--text-muted)}
@media (max-width:1180px){.md-grid{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){
  .md-hero{padding:var(--space-4)}
  .md-nums{grid-template-columns:repeat(3,minmax(64px,1fr))}
  /* task rows: the title gets the line; priority and due date go under it */
  .md-task{flex-wrap:wrap;row-gap:2px}
  .md-task:not(.md-follow) > .md-task__main{flex-basis:calc(100% - 40px)}
  .md-task:not(.md-follow) > .md-task__main + *{margin-left:calc(22px + var(--space-3))}
  .md-task > span:empty{display:none}
  /* follow-ups: the date above the name, the call button beside it */
  .md-follow > .md-follow__when{flex:1 1 100%;width:auto!important}
}
`;

const P_LABEL = { week: 'This week', lastmonth: 'Last month', month: 'This month', today: 'Today', yesterday: 'Yesterday' };
const B = (id, preset, title, extra = {}) => ({ id, preset, title, ...extra });
const DH = { place: 'Dhanmondi branch' };
// what each role sees: report blocks (main column), widgets (side column) and quick links
const DASH = {
  ceo: { links: [['Daily summary', '/daily-summary', 'sun'], ['Reports', '/reports-centre', 'file-bar-chart'], ['Leads', '/sales-leads', 'target'], ['HR dashboard', '/hr-dashboard', 'contact']],
    blocks: [B('sales-summary', 'week', 'Sales this week', { top: 4 }), B('profit-by-channel-summary', 'lastmonth', 'Profit by channel', { top: 4 }), B('account-balances', 'month', 'Money now'), B('receivables-payables', 'month', 'Owed to you and by you'), B('staff-cost-vs-sales', 'lastmonth', 'Staff cost against sales')],
    side: ['approvals', 'pipeline', 'teamTasks'] },
  cto: { links: [['Attendance devices', '/attendance-devices', 'fingerprint'], ['Payment gateways', '/account-setup', 'credit-card'], ['Event health', '/event-health', 'activity'], ['Settings', '/set-general', 'settings']],
    blocks: [B('order-source', 'week', 'Orders by source — is tracking catching them?', { top: 5 }), B('pos-audit', 'week', 'POS manager approvals'), B('calls-report', 'week', 'Phone lines')],
    side: ['systems'] },
  content: { links: [['Post calendar', '/calendar', 'calendar'], ['New post', '/composer', 'pen-square'], ['Blog posts', '/blog-posts', 'newspaper'], ['Inbox', '/merchant-inbox', 'inbox']],
    blocks: [B('blog-report', 'month', 'Blog', { top: 4 }), B('comments-report', 'week', 'Comments on posts'), B('order-source', 'week', 'Orders from social')],
    side: ['content'] },
  orders: { links: [['Orders', '/merchant-orders', 'shopping-cart'], ['Courier returns', '/courier-returns', 'package-x'], ['AI calls', '/ai-calls', 'phone-call'], ['Abandoned carts', '/abandoned-carts', 'shopping-basket']],
    blocks: [B('order-funnel', 'week', 'Order funnel'), B('courier-performance', 'week', 'Couriers', { top: 4 }), B('rto-analysis', 'week', 'Returns to origin'), B('order-source', 'week', 'Where orders come from')],
    side: ['orders'] },
  comms: { links: [['Inbox', '/merchant-inbox', 'inbox'], ['Calls', '/merchant-calls', 'phone'], ['Tickets', '/support-tickets', 'life-buoy'], ['Leads', '/sales-leads', 'target']],
    blocks: [B('team-inbox', 'week', 'Inbox', { top: 4 }), B('calls-report', 'week', 'Calls'), B('comments-report', 'week', 'Comments')],
    side: ['orders'] },
  ads: { links: [['Campaigns', '/campaigns', 'layers'], ['Pixels & events', '/pixels-events', 'radar'], ['Coupons', '/coupons', 'ticket-percent'], ['Ad spend report', '/report?id=ad-spend-roas', 'chart-column']],
    blocks: [B('ad-spend-roas', 'lastmonth', 'Ad spend & return', { top: 4 }), B('order-source', 'week', 'Orders by source'), B('new-vs-returning', 'week', 'New and returning buyers'), B('discounts-coupons', 'lastmonth', 'Discounts & coupons')],
    side: [] },
  'wh-manager': { links: [['Stock', '/stock', 'boxes'], ['Receive goods', '/receive-goods', 'package-open'], ['Purchase orders', '/purchase-orders', 'clipboard-list'], ['Transfers', '/transfers', 'arrow-left-right']],
    blocks: [B('stock-value', 'month', 'Stock value'), B('low-stock-reorder', 'month', 'Low stock & reorder', { top: 5 }), B('po-status', 'month', 'Purchase orders'), B('stock-movement', 'week', 'Stock in and out this week')],
    side: ['orders', 'duty:Central Warehouse', 'teamTasks'], team: ['sabbir', 'farhana'] },
  'wh-supervisor': { links: [['Orders to pack', '/merchant-orders', 'package'], ['Receive goods', '/receive-goods', 'package-open'], ['Stock count', '/stock-count', 'clipboard-check'], ['Racks', '/racks', 'layout-grid']],
    blocks: [B('low-stock-reorder', 'month', 'Low stock', { top: 5 }), B('po-status', 'month', 'Deliveries coming')],
    side: ['orders', 'duty:Central Warehouse'] },
  'shop-manager': { links: [['Open register', '/pos', 'scan-line'], ['Counters & cash', '/pos-manage', 'store'], ['Daily summary', '/daily-summary', 'sun'], ['Leads', '/sales-leads', 'target']],
    blocks: [B('sales-summary', 'week', 'Dhanmondi sales this week', { filters: DH }), B('counter-performance', 'week', 'Counters', { filters: DH, top: 3 }), B('sales-by-staff', 'week', 'Sellers this week', { filters: DH, top: 5 }), B('low-stock-reorder', 'month', 'Low stock at Dhanmondi', { filters: DH, top: 4 })],
    side: ['duty:Dhanmondi branch', 'teamTasks'], team: ['sadia', 'rafi'] },
  'shop-supervisor': { links: [['Open register', '/pos', 'scan-line'], ['Cash pickups', '/pos-manage?tab=cash', 'hand-coins'], ['Shifts', '/pos-manage?tab=shifts', 'users'], ['Stock', '/stock', 'boxes']],
    blocks: [B('counter-performance', 'week', 'Counters this week', { filters: DH, top: 3 }), B('shift-z-report', 'week', 'Shift Z-reports', { top: 4 }), B('pos-audit', 'week', 'Manager approvals')],
    side: ['duty:Dhanmondi branch'] },
  seller: { links: [['Open register', '/pos', 'scan-line'], ['Customers', '/all-customers', 'users'], ['Stock', '/stock', 'boxes'], ['Return or exchange', '/return-exchange', 'undo-2']],
    blocks: [B('sales-by-staff', 'week', 'My sales this week', { filters: DH, top: 7, me: true }), B('sales-by-staff', 'lastmonth', 'Last month', { filters: DH, top: 7, me: true })],
    side: [] },
  hr: { links: [['HR dashboard', '/hr-dashboard', 'layout-grid'], ['Attendance', '/attendance', 'calendar-check'], ['Payroll', '/payroll', 'banknote'], ['Add staff', '/staff-create', 'user-plus']],
    blocks: [B('attendance-summary', 'week', 'Attendance this week', { top: 5 }), B('leave-report', 'month', 'Leave'), B('payroll-register', 'lastmonth', 'Last payroll'), B('staff-cost-vs-sales', 'lastmonth', 'Staff cost against sales')],
    side: ['hr', 'teamTasks'], team: USERS.map((u) => u.id) },
  'online-sales': { links: [['Leads', '/sales-leads', 'target'], ['Online orders', '/merchant-orders?channel=online', 'globe'], ['Abandoned carts', '/abandoned-carts', 'shopping-basket'], ['Customers', '/all-customers', 'users']],
    blocks: [B('order-source', 'week', 'Online orders by source'), B('new-vs-returning', 'week', 'New and returning buyers'), B('inactive-customers', 'month', 'Customers to win back', { top: 4 }), B('order-funnel', 'week', 'Order funnel')],
    side: ['pipeline', 'orders'] },
};

export default function MyDashboard() {
  const { me, ready } = useMe();
  const { tasks } = useTasks();
  const { leads } = useLeads();
  const { S } = useHr();
  const role = roleOf(me);
  // only what this site's edition has (src/lib/edition.js): report blocks, links and side widgets
  const [ed, setEd] = React.useState(() => (LOCKED ? currentEditionId() : 'full'));
  React.useEffect(() => { const on = () => setEd(currentEditionId()); on(); window.addEventListener(EDITION_EVENT, on); return () => window.removeEventListener(EDITION_EVENT, on); }, []);
  const base = DASH[me.role] || DASH.ceo;
  const SIDE_MODULE = { orders: 'commerce', hr: 'hr' };
  const cfg = ed === 'full' ? base : {
    ...base,
    links: base.links.filter(([, href]) => routeInEdition(href.split('?')[0], ed)),
    blocks: base.blocks.filter((b) => reportInEdition(reportBy(b.id), ed)),
    side: base.side.filter((w) => { const m = SIDE_MODULE[w] || (w.startsWith('duty:') ? 'hr' : null); return !m || hasModule(m, ed); }),
  };
  const now = Date.now();
  const today = dayKeyOf(now);
  const mine = tasks.filter((t) => isMine(t, me.id) && t.status !== 'done');
  const late = mine.filter((t) => dueState(t, today) === 'overdue');
  const dueToday = mine.filter((t) => dueState(t, today) === 'today');
  const myLeads = leads.filter((l) => l.owner === me.id && OPEN_STAGES.includes(l.stage));
  const follow = myLeads.filter((l) => ['overdue', 'today'].includes(followState(l, now)));
  const st = me.staff ? staffBy(S, me.staff) : null;

  return (
    <TeamPage screen="MyDashboard" active="my-dash" crumb="General" page="My dashboard" css={CSS}>
      <section className="md-hero gc-on-dark" aria-label="You">
        <span className="md-hero__av" aria-hidden="true">{me.initials}</span>
        <div className="md-hero__txt">
          <h1>My dashboard</h1>
          <p>{me.name} · {me.place}</p>
          <span className="md-role"><Icon name={role.icon} width="14" height="14" aria-hidden="true" />{role.title}</span>
          <div className="md-links" style={{ marginTop: 'var(--space-2)' }}>{cfg.links.map(([l, href, ic]) => <Link key={href} href={href} className="gc-btn gc-btn--sm"><Icon name={ic} width="16" height="16" aria-hidden="true" /> {l}</Link>)}</div>
        </div>
        <div className="md-nums">
          <Link href="/tasks"><b>{mine.length}</b><span>Open tasks</span></Link>
          <Link href="/tasks"><b style={{ color: late.length ? 'var(--warning)' : undefined }}>{late.length + dueToday.length}</b><span>Due today or late</span></Link>
          {myLeads.length ? <Link href="/sales-leads"><b style={{ color: follow.length ? 'var(--warning)' : undefined }}>{follow.length}</b><span>Follow-ups due</span></Link> : st ? <Link href={`/staff-profile?code=${st.code}`}><b>{(() => { const c = cellOf(S, st.code, todayKey(S)); return c.rec && c.rec.in ? t12(c.rec.in).replace(' ', '') : '—'; })()}</b><span>Clocked in</span></Link> : <Link href="/tasks?scope=gave"><b>{tasks.filter((t) => t.by === me.id && t.assignee !== me.id && t.status !== 'done').length}</b><span>Given to others</span></Link>}
        </div>
      </section>

      <div className="md-grid">
        <div className="md-col">
          <MyTasks tasks={mine} today={today} />
          {myLeads.length ? <MyFollowUps leads={myLeads} now={now} /> : null}
          {ready ? cfg.blocks.map((b, i) => <ReportBlock key={b.id + i} b={b} me={me} />) : <section className="gc-card md-card" style={{ minHeight: 200 }} aria-busy="true" />}
        </div>
        <div className="md-col">
          {cfg.side.includes('approvals') ? <Approvals S={S} tasks={tasks} me={me} /> : null}
          <ChatPeek me={me} ready={ready} />
          {st ? <MeAtWork S={S} st={st} /> : null}
          {/* team-wide summaries go last: the person's own work comes first */}
          {[...cfg.side.filter((w) => w !== 'approvals' && w !== 'pipeline' && w !== 'teamTasks'), ...cfg.side.filter((w) => w === 'pipeline' || w === 'teamTasks')].map((w) => {
            if (w === 'pipeline') return <Pipeline key={w} leads={leads} me={me} />;
            if (w === 'teamTasks') return <TeamTasks key={w} tasks={tasks} team={cfg.team || USERS.filter((u) => u.id !== me.id).map((u) => u.id)} today={today} />;
            if (w === 'orders') return <OrderPipe key={w} />;
            if (w === 'systems') return <Systems key={w} S={S} />;
            if (w === 'content') return <ContentQueue key={w} ready={ready} />;
            if (w === 'hr') return <HrToday key={w} S={S} />;
            if (w.startsWith('duty:')) return <OnDuty key={w} S={S} place={w.slice(5)} />;
            return null;
          })}
        </div>
      </div>
    </TeamPage>
  );
}

// ---- blocks ------------------------------------------------------------------------------------------
function ReportBlock({ b, me }) {
  const def = reportBy(b.id);
  const res = useMemo(() => {
    if (!def || !def.compute) return null;
    try { const p = periodOf(b.preset); return def.compute({ from: p.from, to: p.to, now: Date.now(), filters: b.filters || {} }); } catch { return null; }
  }, [def, b.preset, b.filters]);
  if (!def || !res) return null;
  const kpis = (res.kpis || []).slice(0, 5);
  const NUM = ['money', 'money0', 'int', 'num', 'pct', 'days'];
  const all = res.table ? res.table.columns.filter((c) => !c.key.startsWith('_')) : [];
  // the name column, then the figures
  const cols = all.length ? [all[0], ...all.slice(1).filter((c) => NUM.includes(c.format))].slice(0, b.me ? 6 : 4) : [];
  let rows = res.table && b.top ? res.table.rows.slice(0, b.top) : [];
  const isMe = (r) => b.me && Object.values(r).some((v) => v === me.name);
  if (b.me && res.table) { rows = res.table.rows.slice(0, b.top || 7); }
  const myRow = b.me && res.table ? res.table.rows.find(isMe) : null;
  const href = `/report?id=${b.id}&p=${b.preset}${b.filters ? Object.entries(b.filters).map(([k, v]) => `&f_${k}=${encodeURIComponent(v)}`).join('') : ''}`;
  return (
    <section className="gc-card md-card">
      <header><div><h2>{b.title}</h2><p>{P_LABEL[b.preset] || ''}{b.filters && b.filters.place ? ` · ${b.filters.place}` : ''} · {def.title}</p></div><Link href={href} className="gc-btn gc-btn--sm gc-btn--flat">Open report</Link></header>
      <div className="md-body">
        {b.me ? (
          myRow ? <div className="md-kpis">{cols.slice(1).map((c) => <div key={c.key} className="md-kpi"><span>{c.label}</span><b>{fmt(myRow[c.key], c.format)}</b></div>)}<div className="md-kpi"><span>Rank</span><b>{res.table.rows.indexOf(myRow) + 1} of {res.table.rows.length}</b></div></div> : <p className="tm-sub" style={{ margin: 0 }}>No sales of yours in this period yet.</p>
        ) : kpis.length ? <div className="md-kpis">{kpis.map((k) => <div key={k.key} className="md-kpi"><span>{k.label}</span><b title={fmt(k.value, k.format)}>{fmt(k.value, k.format)}</b>{k.sub ? <span>{k.sub}</span> : null}</div>)}</div> : null}
        {rows.length && cols.length ? (
          <div className="gc-table-wrap">
            <table className="md-mini">
              <thead><tr>{cols.map((c, i) => <th key={c.key} scope="col" className={i ? 'num' : ''}>{c.label}</th>)}</tr></thead>
              <tbody>{rows.map((r, i) => <tr key={i} className={isMe(r) ? 'is-me' : ''}>{cols.map((c, j) => <td key={c.key} className={j ? 'num' : ''}>{fmt(r[c.key], c.format)}</td>)}</tr>)}</tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function MyTasks({ tasks, today }) {
  const list = [...tasks].sort((a, b) => (a.due || '9').localeCompare(b.due || '9')).slice(0, 7);
  return (
    <section className="gc-card md-card">
      <header><div><h2>My tasks</h2><p>{tasks.length ? `${tasks.length} open · tick them off as you go` : 'Nothing open — well done.'}</p></div><Link href="/tasks?new=1" className="gc-btn gc-btn--sm gc-btn--neutral"><Icon name="plus" width="14" height="14" aria-hidden="true" /> Task</Link></header>
      <div className="md-body" style={{ gap: 0 }}>
        {list.map((t) => {
          const ds = dueState(t, today);
          const pr = priorityOf(t.priority);
          return (
            <div key={t.id} className="md-task">
              <button type="button" className="md-check" aria-label={`Mark “${t.title}” done`} onClick={() => { const made = setStatus(t.id, 'done'); toast(made ? 'Done — the next one is on your list.' : 'Done.'); }} />
              <Link href={`/tasks?task=${t.id}`} className="md-task__main"><b>{t.title}</b><span className="tm-sub">{(teamBy(t.team) || { name: '' }).name}{!(t.assignees || []).length ? ' · open for the team' : ''}{t.by !== t.assignee ? ` · from ${userName(t.by).split(' ')[0]}` : ''}</span></Link>
              {t.priority === 'urgent' || t.priority === 'high' ? <span className={'gc-badge gc-badge--' + pr[2]}>{pr[1]}</span> : null}
              <span className={'tm-sub' + (ds === 'overdue' ? ' tm-out' : ds === 'today' ? ' tm-warn' : '')} style={{ whiteSpace: 'nowrap' }}>{ds === 'today' ? 'Today' : ds === 'overdue' ? 'Late' : t.due ? formatDate(new Date(t.due + 'T00:00:00').getTime()) : ''}</span>
            </div>
          );
        })}
        {tasks.length > list.length ? <Link href="/tasks" className="tm-sub" style={{ paddingTop: 'var(--space-2)' }}>+{tasks.length - list.length} more</Link> : null}
      </div>
    </section>
  );
}

function MyFollowUps({ leads, now }) {
  const list = leads.filter((l) => l.next).sort((a, b) => a.next.at - b.next.at).slice(0, 6);
  return (
    <section className="gc-card md-card">
      <header><div><h2>My follow-ups</h2><p>{leads.length} open lead{leads.length === 1 ? '' : 's'} · {formatBDT(leads.reduce((a, l) => a + l.value, 0))}</p></div><Link href="/sales-leads" className="gc-btn gc-btn--sm gc-btn--flat">All leads</Link></header>
      <div className="md-body" style={{ gap: 0 }}>
        {list.map((l) => { const fs = followState(l, now); return (
          <div key={l.id} className="md-task md-follow">
            <span className={'md-follow__when tm-fig' + (fs === 'overdue' ? ' tm-out' : fs === 'today' ? ' tm-warn' : '')} style={{ width: 70, fontSize: 'var(--text-xs)' }}>{fs === 'today' ? formatTime(l.next.at) : formatDate(l.next.at).replace(/ \d{4}$/, '')}</span>
            <Link href={`/sales-leads?lead=${l.id}`} className="md-task__main"><b>{l.name}{l.company ? ` · ${l.company}` : ''}</b><span className="tm-sub">{l.next.what} · {stageOf(l.stage)[1]} · {formatBDT(l.value)}</span></Link>
            <a href={'tel:' + l.phone.replace(/\D/g, '')} className="gc-btn gc-btn--sm gc-btn--neutral" aria-label={`Call ${l.name}`}><Icon name="phone" width="14" height="14" aria-hidden="true" /></a>
          </div>
        ); })}
      </div>
    </section>
  );
}

// ---- side widgets ------------------------------------------------------------------------------------
function MeAtWork({ S, st }) {
  const today = todayKey(S);
  const c = cellOf(S, st.code, today);
  const sh = shiftBy(S, st.shift);
  const bal = leaveBalance(S, st.code);
  const lastRun = [...S.runs].reverse().find((r) => r.kind === 'salary' && (r.lines || []).some((x) => x.code === st.code));
  const line = lastRun ? lastRun.lines.find((x) => x.code === st.code) : null;
  const owe = S.loans.filter((l) => l.code === st.code && l.status === 'run').reduce((a, l) => a + loanLeft(l), 0);
  const status = c.rec && c.rec.in ? `In at ${t12(c.rec.in)}${c.rec.late ? ` · ${c.rec.late} min late` : ''}` : c.plan.kind === 'leave' ? `On ${leaveType(S, c.plan.leave.type).name.toLowerCase()} leave` : c.plan.kind === 'off' ? 'Weekly off' : sh ? `Not in yet · ${sh.name} ${t12(sh.start)}` : 'Not in yet';
  return (
    <section className="gc-card md-card">
      <header><div><h2>Me at work</h2><p>{st.code} · {st.designation}</p></div><Link href={`/staff-profile?code=${st.code}`} className="gc-btn gc-btn--sm gc-btn--flat">My profile</Link></header>
      <div className="md-body">
        <div className="md-kv"><span>Today</span><span className={c.rec && c.rec.late ? 'tm-warn' : 'tm-strong'}>{status}</span></div>
        <div className="md-kv"><span>Shift</span><span className="tm-strong">{sh ? `${sh.name} · ${t12(sh.start)}–${t12(sh.end)}` : '—'}</span></div>
        <div className="md-kv"><span>Leave left</span><span className="tm-strong">Casual {Math.max(0, bal.casual.left)} · Sick {Math.max(0, bal.sick.left)}</span></div>
        {line ? <div className="md-kv"><span>Last salary ({lastRun.title})</span><span className="tm-fig tm-strong">{formatBDT(line.net)}{lastRun.status !== 'paid' ? ' · due' : ''}</span></div> : null}
        {owe ? <div className="md-kv"><span>Advance / loan left</span><span className="tm-fig tm-warn">{formatBDT(owe)}</span></div> : null}
      </div>
    </section>
  );
}

function Approvals({ S, tasks, me }) {
  const review = tasks.filter((t) => t.assignee === me.id && t.status === 'review');
  const leave = S.leave.requests.filter((r) => r.status === 'wait').length;
  const loans = S.loans.filter((l) => l.status === 'req').length;
  const fixes = S.fixes.filter((f) => f.status === 'wait').length;
  const unpaid = S.runs.filter((r) => r.status === 'approved');
  return (
    <section className="gc-card md-card">
      <header><div><h2>Waiting for you</h2><p>Decisions only you can make.</p></div></header>
      <div className="md-body">
        {review.map((t) => <Link key={t.id} href={`/tasks?task=${t.id}`} className="md-row" style={{ textDecoration: 'none', color: 'inherit' }}><span className="tm-tile"><Icon name="stamp" width="16" height="16" aria-hidden="true" /></span><span><span className="tm-strong">{t.title}</span><span className="tm-sub">from {userName(t.by)}</span></span></Link>)}
        {unpaid.map((r) => <Link key={r.id} href="/payroll" className="md-row" style={{ textDecoration: 'none', color: 'inherit' }}><span className="tm-tile"><Icon name="banknote" width="16" height="16" aria-hidden="true" /></span><span><span className="tm-strong">{r.title} salaries to pay</span><span className="tm-sub">{formatBDT(r.total || 0)} approved</span></span></Link>)}
        <div className="md-kv"><span>Leave requests</span><Link href="/leave" className="tm-strong">{leave}</Link></div>
        <div className="md-kv"><span>Advance requests</span><Link href="/loans-advances" className="tm-strong">{loans}</Link></div>
        <div className="md-kv"><span>Attendance fixes</span><Link href="/attendance" className="tm-strong">{fixes}</Link></div>
      </div>
    </section>
  );
}

function Pipeline({ leads, me }) {
  const open = leads.filter((l) => OPEN_STAGES.includes(l.stage));
  const mineOnly = me.role === 'online-sales';
  const list = mineOnly ? open.filter((l) => l.owner === me.id) : open;
  return (
    <section className="gc-card md-card">
      <header><div><h2>Sales pipeline</h2><p>{list.length} open · {formatBDT(list.reduce((a, l) => a + l.value * STAGE_WEIGHT[l.stage], 0))} likely</p></div><Link href="/sales-leads?view=board" className="gc-btn gc-btn--sm gc-btn--flat">Board</Link></header>
      <div className="md-body">
        {OPEN_STAGES.map((k) => { const ls = list.filter((l) => l.stage === k); const [, label, tone] = stageOf(k); return <div key={k} className="md-kv"><span><span className={'gc-badge gc-badge--' + tone}>{label}</span></span><span className="tm-fig tm-strong">{ls.length} · {formatBDT(ls.reduce((a, l) => a + l.value, 0))}</span></div>; })}
      </div>
    </section>
  );
}

function TeamTasks({ tasks, team, today }) {
  const rows = team.map((id) => ({ id, open: tasks.filter((t) => (t.assignees || []).includes(id) && t.status !== 'done'), })).filter((r) => userBy(r.id));
  return (
    <section className="gc-card md-card">
      <header><div><h2>Team tasks</h2><p>Open and late, per person.</p></div><Link href="/tasks?scope=all" className="gc-btn gc-btn--sm gc-btn--flat">All tasks</Link></header>
      <div className="md-body">
        {rows.map((r) => { const late = r.open.filter((t) => dueState(t, today) === 'overdue').length; return <div key={r.id} className="md-row"><UserAvatar id={r.id} size={28} /><span><span className="tm-strong">{userName(r.id)}</span><span className="tm-sub">{roleOf(userBy(r.id)).title}</span></span><span className="tm-sub" style={{ textAlign: 'right' }}>{r.open.length} open{late ? <span className="tm-out"> · {late} late</span> : ''}</span></div>; })}
      </div>
    </section>
  );
}

function OrderPipe() {
  return (
    <section className="gc-card md-card">
      <header><div><h2>Orders by status</h2><p>Every channel, right now.</p></div><Link href="/merchant-orders" className="gc-btn gc-btn--sm gc-btn--flat">Orders</Link></header>
      <div className="md-body"><div className="md-pipe">{ORDER_STATUSES.map((s) => <Link key={s.key} href="/merchant-orders"><span className="tm-sub">{s.label}</span><b>{s.count}</b></Link>)}</div></div>
    </section>
  );
}

function Systems({ S }) {
  const devs = S.devices || [];
  const off = devs.filter((d) => d.status !== 'online');
  return (
    <section className="gc-card md-card">
      <header><div><h2>Systems</h2><p>{off.length ? `${off.length} problem${off.length === 1 ? '' : 's'} need you` : 'Everything is answering'}</p></div></header>
      <div className="md-body">
        {devs.map((d) => <Link key={d.id} href="/attendance-devices" className="md-row" style={{ textDecoration: 'none', color: 'inherit' }}><span className="tm-tile" style={d.status !== 'online' ? { background: 'var(--fill-error-soft)', color: 'var(--text-danger)' } : undefined}><Icon name={d.status === 'online' ? 'fingerprint' : 'wifi-off'} width="16" height="16" aria-hidden="true" /></span><span><span className="tm-strong">{d.name}</span><span className="tm-sub">{d.model} · {d.ip}</span></span><span className={'gc-badge gc-badge--' + (d.status === 'online' ? 'success' : 'error')}>{d.status === 'online' ? 'Online' : 'Offline'}</span></Link>)}
        <div className="md-kv"><span>Website</span><span className="gc-badge gc-badge--success">Up · 99.98%</span></div>
        <div className="md-kv"><span>Domain renewal</span><span className="tm-warn">20 Oct 2026</span></div>
        <div className="md-kv"><span>Payment gateways</span><Link href="/account-setup" className="tm-strong">bKash, SSLCOMMERZ, EPS</Link></div>
      </div>
    </section>
  );
}

function ContentQueue({ ready }) {
  const posts = ready ? getPosts() : [];
  const queue = posts.filter((p) => p.status === 'draft' || p.status === 'scheduled').slice(0, 6);
  return (
    <section className="gc-card md-card">
      <header><div><h2>Content queue</h2><p>Drafts and scheduled blog posts.</p></div><Link href="/blog-posts" className="gc-btn gc-btn--sm gc-btn--flat">Blog</Link></header>
      <div className="md-body">
        {queue.length ? queue.map((p) => <Link key={p.id} href={`/blog-editor?id=${p.id}`} className="md-row" style={{ textDecoration: 'none', color: 'inherit' }}><span className="tm-tile"><Icon name={p.status === 'draft' ? 'file-pen' : 'calendar-clock'} width="16" height="16" aria-hidden="true" /></span><span><span className="tm-strong">{p.title}</span><span className="tm-sub">{p.status === 'draft' ? 'Draft' : 'Scheduled'}</span></span></Link>) : <span className="tm-sub">Nothing waiting.</span>}
      </div>
    </section>
  );
}

function HrToday({ S }) {
  const today = todayKey(S);
  const staff = S.staff.filter((s) => s.status !== 'left');
  const codes = staff.map((s) => cellOf(S, s.code, today).code);
  const n = (list) => codes.filter((c) => list.includes(c)).length;
  return (
    <section className="gc-card md-card">
      <header><div><h2>People today</h2><p>{staff.length} on the staff list</p></div><Link href="/hr-dashboard" className="gc-btn gc-btn--sm gc-btn--flat">HR dashboard</Link></header>
      <div className="md-body">
        <div className="md-pipe">
          <Link href="/attendance"><span className="tm-sub">Present</span><b>{n(['P', 'L', 'HD'])}</b></Link>
          <Link href="/attendance"><span className="tm-sub">Late</span><b>{n(['L'])}</b></Link>
          <Link href="/leave"><span className="tm-sub">On leave</span><b>{n(['V', 'U'])}</b></Link>
          <Link href="/attendance"><span className="tm-sub">Not in yet</span><b>{n(['wait', '?'])}</b></Link>
        </div>
        <div className="md-kv"><span>Leave to decide</span><Link href="/leave" className="tm-strong">{S.leave.requests.filter((r) => r.status === 'wait').length}</Link></div>
        <div className="md-kv"><span>Advances asked</span><Link href="/loans-advances" className="tm-strong">{S.loans.filter((l) => l.status === 'req').length}</Link></div>
        <div className="md-kv"><span>Probation to confirm</span><Link href="/pay-changes" className="tm-strong">{staff.filter((s) => s.status === 'probation').length}</Link></div>
      </div>
    </section>
  );
}

function OnDuty({ S, place }) {
  const today = todayKey(S);
  const here = S.staff.filter((s) => s.status !== 'left' && s.branch === place);
  return (
    <section className="gc-card md-card">
      <header><div><h2>Team at {place.replace(' branch', '')}</h2><p>Who is in today.</p></div><Link href="/attendance" className="gc-btn gc-btn--sm gc-btn--flat">Attendance</Link></header>
      <div className="md-body">
        {here.map((s) => {
          const c = cellOf(S, s.code, today);
          const sh = shiftBy(S, c.plan.shifts[0] || s.shift);
          const k = statusOf(S, s);
          const txt = c.rec && c.rec.in ? `In ${t12(c.rec.in)}${c.rec.late ? ` · ${c.rec.late} min late` : ''}` : c.plan.kind === 'leave' ? 'On leave' : k === 'suspended' ? 'Suspended' : c.plan.kind === 'off' ? 'Weekly off' : sh ? `Not in · ${sh.name} ${t12(sh.start)}` : 'Not in';
          return <Link key={s.code} href={`/staff-profile?code=${s.code}`} className="md-row" style={{ textDecoration: 'none', color: 'inherit' }}><span className="tm-av" style={{ width: 28, height: 28, background: 'var(--surface-subtle)', color: 'var(--text-body)' }} aria-hidden="true">{s.name.split(' ').map((x) => x[0]).join('').slice(0, 2)}</span><span><span className="tm-strong">{s.name}</span><span className="tm-sub">{s.designation}</span></span><span className={'tm-sub' + (c.rec && c.rec.late ? ' tm-warn' : c.rec ? ' tm-in' : '')} style={{ textAlign: 'right' }}>{txt}</span></Link>;
        })}
      </div>
    </section>
  );
}

function ChatPeek({ me, ready }) {
  useTick([CHAT_EVENT]);
  if (!ready) return null;
  const msgs = getMessages();
  const chans = channelsFor(me, undefined, msgs).map((c) => ({ c, n: unread(c.id, me.id, msgs), last: msgs.filter((m) => m.ch === c.id).slice(-1)[0] })).filter((x) => x.last).sort((a, b) => b.n - a.n || b.last.at - a.last.at).slice(0, 4);
  const total = chans.reduce((a, x) => a + x.n, 0);
  return (
    <section className="gc-card md-card">
      <header><div><h2>Team chat</h2><p>{total ? `${total} unread` : 'All caught up'}</p></div><Link href="/team-chat" className="gc-btn gc-btn--sm gc-btn--flat">Open chat</Link></header>
      <div className="md-body">
        {chans.map(({ c, n, last }) => <Link key={c.id} href={`/team-chat?ch=${encodeURIComponent(c.id)}`} className="md-row" style={{ textDecoration: 'none', color: 'inherit' }}>{c.kind === 'dm' ? <UserAvatar id={c.other} size={28} /> : <span className="tm-tile" style={{ width: 28, height: 28 }}><Icon name={c.icon} width="14" height="14" aria-hidden="true" /></span>}<span><span className={n ? 'tm-strong' : ''}>{c.kind === 'channel' ? '# ' + c.name : c.name}</span><span className="tm-sub" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName(last.by).split(' ')[0]}: {last.text}</span></span>{n ? <span className="gc-badge gc-badge--info">{n}</span> : null}</Link>)}
      </div>
    </section>
  );
}
