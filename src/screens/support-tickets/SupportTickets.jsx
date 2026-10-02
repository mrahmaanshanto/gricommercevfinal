'use client';
// SupportTickets — the ticket desk, laid out like a Shopify list (components/ui/IndexKit.jsx): title row, key
// figures, then one card with the status views, search and filters and a compact table (or the board). A row opens
// the ticket in a side panel: status, owner, team, linked order, activity and the reply box.
// Front end only: the tickets are demo data; changes made here last until the page is left.
// Edit freely: this file is the source for the screen.

import React from 'react';
import Link from 'next/link';
import { DCLogic, Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { toast } from '@/runtime/ui';
import { ChannelIcon, Sheet, StatusBadge, EmptyState } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, LearnMore, Menu, KV } from '@/components/ui/IndexKit';

// ---- logic ----

const CHANNEL_NAME = { instagram: 'Instagram', facebook: 'Facebook', whatsapp: 'WhatsApp', tiktok: 'TikTok', telegram: 'Telegram', linkedin: 'LinkedIn', phone: 'Phone' };
const STATUSES = ['New', 'Assigned', 'In progress', 'Waiting on customer', 'Solved'];
const STATUS_TONE = { New: 'info', Assigned: 'primary', 'In progress': 'warning', 'Waiting on customer': 'neutral', Solved: 'success' };
const PRIORITY_TONE = { Urgent: 'error', High: 'warning', Normal: 'neutral', Low: 'neutral' };
const COL_NOTE = { 'In progress': 'WIP limit 5 per agent', 'Waiting on customer': 'Auto-close after 5 days', Solved: 'Today · CSAT 4.7' };
const AGENTS = ['Rina', 'Tasnim', 'Mehedi'];
const ME = 'Rina';
const TEAMS = ['Order support', 'Payments', 'Delivery', 'Sales'];
const SOON = 'This action is not available in the demo yet.';
// Demo tickets shown on the list, the board and in the ticket panel.
const TICKETS = {
  '2304': { subject: 'Add one more saree to GC-10482 before dispatch', customer: 'Nusrat Jahan', initials: 'NJ', img: '/assets/9f66d32bb99031029a6fbcfd91e221f2.png', imgPos: '52% 22%', meta: 'VIP · 14 orders · ৳84,600 LTV', ch: 'instagram', priority: 'Urgent', status: 'New', sla: 'SLA 18m', hot: true, order: 'GC-10482', orderTotal: '৳4,850', assignee: '', full: true },
  '2303': { subject: 'bKash payment not reflecting on order', customer: 'Rakib Hasan', initials: 'RH', ch: 'whatsapp', priority: 'Normal', status: 'New', sla: '3h left', assignee: '' },
  '2302': { subject: 'Asks for size chart in Bangla', customer: '@tanvir.rides', initials: 'TR', ch: 'tiktok', priority: 'Low', status: 'New', sla: '5h left', assignee: '' },
  '2298': { subject: 'Wrong colour delivered — wants exchange', customer: 'Sadia Ferdous', initials: 'SF', img: '/assets/48a47ed6468079a61846b91934211c40.png', imgPos: '55% 18%', ch: 'facebook', priority: 'High', status: 'Assigned', sla: '2h left', order: 'GC-10455', assignee: 'Tasnim' },
  '2295': { subject: 'Refund not received for GC-10190', customer: 'Farhana Jahan', initials: 'FJ', img: '/assets/25e820cfa3e50978f934abe93e0c3db7.png', imgPos: '50% 20%', ch: 'telegram', priority: 'Normal', status: 'Assigned', sla: 'Overdue 40m', hot: true, order: 'GC-10190', assignee: 'Mehedi' },
  '2290': { subject: 'Wholesale quote for 200 staff kits', customer: 'Imran Rahman', initials: 'IR', meta: 'B2B lead', ch: 'linkedin', priority: 'Normal', status: 'Assigned', sla: '1d left', assignee: 'Rina' },
  '2291': { subject: 'Third complaint about missing refund', customer: 'Arif Karim', initials: 'AK', ch: 'phone', priority: 'Urgent', status: 'In progress', sla: 'SLA 6m', hot: true, assignee: 'Rina' },
  '2287': { subject: 'Courier lost parcel — claim filed', customer: 'Katrina West', initials: 'KW', ch: 'whatsapp', priority: 'High', status: 'In progress', sla: '4h left', assignee: 'Tasnim' },
  '2279': { subject: 'Asked for photo of the damaged item', customer: '@rumana.s', initials: 'RS', ch: 'instagram', priority: 'Normal', status: 'Waiting on customer', sla: 'Waiting 2d', assignee: 'Rina' },
  '2271': { subject: 'Waiting for a new delivery address', customer: 'Shafin Mahmud', initials: 'SM', ch: 'facebook', priority: 'Low', status: 'Waiting on customer', sla: 'Closes in 1d', assignee: 'Mehedi' },
  '2288': { subject: 'Payment verified and order released', customer: 'Rakib Hasan', initials: 'RH', ch: 'whatsapp', priority: 'Normal', status: 'Solved', sla: 'SLA met', assignee: 'Mehedi' },
  '2284': { subject: 'Size exchange arranged for Friday', customer: 'Mahmuda Alam', initials: 'MA', ch: 'instagram', priority: 'Normal', status: 'Solved', sla: 'SLA met', assignee: 'Tasnim' },
};
const TABS = [['all', 'All'], ...STATUSES.map((s) => [s, s])];
const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many || one + 's');

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { view: props.view === 'board' ? 'board' : 'list', tab: 'all', q: '', find: false, ch: '', pri: '', who: '', hot: false, over: {}, sel: '', reply: 'public', draft: '' };
  }
  componentDidMount() {
    // the board is five columns wide: phones open on the list, the board stays one tap away
    if (this.props.view === 'board' && window.matchMedia && window.matchMedia('(max-width: 640px)').matches) this.setState({ view: 'list' });
  }
  tickets() { return Object.keys(TICKETS).map((id) => ({ id, ...TICKETS[id], ...(this.state.over[id] || {}) })); }
  patch(id, p) { this.setState((s) => ({ over: { ...s.over, [id]: { ...(s.over[id] || {}), ...p } } })); }
  renderVals() {
    const st = this.state;
    const all = this.tickets();
    const needle = st.q.trim().toLowerCase();
    const match = (t) => (!needle || ['TKT-' + t.id, t.subject, t.customer, t.order || '', CHANNEL_NAME[t.ch]].join(' ').toLowerCase().includes(needle))
      && (!st.ch || t.ch === st.ch) && (!st.pri || t.priority === st.pri)
      && (!st.who || (st.who === 'none' ? !t.assignee : t.assignee === st.who))
      && (!st.hot || (t.hot && t.status !== 'Solved'));
    const found = all.filter(match);
    const rows = found.filter((t) => st.tab === 'all' || t.status === st.tab);
    const counts = { all: all.length };
    STATUSES.forEach((s) => { counts[s] = all.filter((t) => t.status === s).length; });
    const findOn = !!(needle || st.ch || st.pri || st.who);
    const hasFilters = findOn || st.hot;
    const clear = () => this.setState({ q: '', ch: '', pri: '', who: '', hot: false });
    const open = (id) => () => this.setState({ sel: id, reply: 'public', draft: '' });
    const cur = all.find((t) => t.id === st.sel) || null;
    const decorate = (t) => ({ ...t, ref: 'TKT-' + t.id, channel: CHANNEL_NAME[t.ch], open: open(t.id), label: 'TKT-' + t.id + ', ' + t.subject + ', ' + t.customer + ', ' + CHANNEL_NAME[t.ch] + ', ' + t.priority });
    return {
      isBoard: st.view === 'board',
      toggleView: () => this.setState((s) => ({ view: s.view === 'board' ? 'list' : 'board' })),
      tabs: TABS.map(([k, l]) => ({ key: k, label: l, count: counts[k], id: 'tk-tab-' + k.replace(/\s/g, '-'), on: st.tab === k, onClick: () => this.setState({ tab: k }) })),
      tabLabel: st.tab === 'all' ? 'All tickets' : st.tab + ' tickets',
      figures: [
        // tap to show only the tickets breaching their SLA (tap again to show all)
        { label: 'Breaching SLA', value: String(all.filter((t) => t.hot && t.status !== 'Solved').length), on: st.hot, onClick: () => this.setState((s) => ({ hot: !s.hot })) },
        { label: 'First reply', value: '12m', sub: 'average today' },
        { label: 'Customer rating', value: '4.7', sub: 'of 5' },
      ],
      find: !!(st.find || findOn),
      openFind: () => this.setState({ find: true }),
      closeFind: () => this.setState({ find: false, q: '', ch: '', pri: '', who: '', hot: false }),
      q: st.q, onSearch: (e) => this.setState({ q: e.target.value }),
      ch: st.ch, onCh: (e) => this.setState({ ch: e.target.value }),
      pri: st.pri, onPri: (e) => this.setState({ pri: e.target.value }),
      who: st.who, onWho: (e) => this.setState({ who: e.target.value }),
      hasFilters, clear,
      empty: rows.length === 0,
      emptyTitle: needle ? 'No tickets match “' + st.q.trim() + '”' : 'No tickets match these filters',
      countLabel: rows.length ? 'Showing ' + plural(rows.length, 'ticket') : 'No tickets to show',
      rows: rows.map(decorate),
      columns: STATUSES.map((s) => ({ s, note: COL_NOTE[s] || '', items: found.filter((t) => t.status === s).map(decorate) })),
      newTicket: () => toast(SOON, { tone: 'info' }),
      // the open ticket
      t: cur ? decorate(cur) : null,
      close: () => this.setState({ sel: '' }),
      setStatus: (e) => { const s = e.target.value; this.patch(cur.id, { status: s }); toast('TKT-' + cur.id + ' moved to ' + s); },
      setAssignee: (e) => { const a = e.target.value; this.patch(cur.id, { assignee: a, status: cur.status === 'New' && a ? 'Assigned' : cur.status }); toast(a ? 'Assigned to ' + a : 'Unassigned'); },
      take: () => { this.patch(cur.id, { assignee: ME, status: cur.status === 'New' ? 'Assigned' : cur.status }); toast('Assigned to you'); },
      setTeam: (e) => this.patch(cur.id, { team: e.target.value }),
      solve: () => { this.patch(cur.id, { status: 'Solved', sla: 'SLA met', hot: false }); toast('TKT-' + cur.id + ' solved'); this.setState({ sel: '' }); },
      isPublic: st.reply === 'public',
      setPublic: () => this.setState({ reply: 'public' }),
      setInternal: () => this.setState({ reply: 'internal' }),
      draft: st.draft, onDraft: (e) => this.setState({ draft: e.target.value }),
      send: () => {
        if (!st.draft.trim()) { toast(st.reply === 'public' ? 'Write the reply first' : 'Write the note first', { tone: 'error' }); return; }
        toast(st.reply === 'public' ? 'Reply sent on ' + CHANNEL_NAME[cur.ch] : 'Internal note added');
        this.setState({ draft: '' });
      },
      soon: () => toast(SOON, { tone: 'info' }),
    };
  }
}

// ---- styles ----

const CSS = `
.tk-id{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-data)}
.tk-subject{display:block;max-width:360px;overflow:hidden;text-overflow:ellipsis}
.tk-hot{color:var(--text-danger);font-weight:var(--weight-medium)}
.tk-boardtitle{flex:1;padding-left:4px}
.tk-sla{font-size:var(--text-xs)}
.tk-board{display:grid;grid-template-columns:repeat(5,minmax(220px,1fr));gap:var(--space-3);padding:var(--space-3);overflow-x:auto}
.tk-col{display:flex;flex-direction:column;gap:var(--space-2);min-width:0;padding:var(--space-2);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.tk-col__head{display:flex;align-items:baseline;gap:var(--space-2);padding:2px 4px;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.tk-col__head small{font-weight:var(--weight-regular);color:var(--text-muted)}
.tk-col__note{margin:-4px 4px 0;font-size:var(--text-xs);color:var(--text-muted)}
.tk-card{display:flex;flex-direction:column;gap:6px;width:100%;padding:10px;border:0;border-radius:var(--radius-lg);background:var(--surface-card);box-shadow:var(--shadow-xs);font:inherit;text-align:left;color:inherit;cursor:pointer}
.tk-card:hover{box-shadow:var(--shadow-card)}
.tk-card:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
.tk-card__top,.tk-card__foot{display:flex;align-items:center;gap:6px;font-size:var(--text-xs);color:var(--text-muted)}
.tk-card__top .gc-badge{margin-left:auto}
.tk-card__foot>span:last-child{margin-left:auto}
.tk-card__sub{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.tk-empty{padding:var(--space-2) 4px;font-size:var(--text-xs);color:var(--text-muted)}
.tk-who{display:flex;align-items:center;gap:var(--space-3)}
.tk-av{display:grid;flex:none;place-items:center;width:36px;height:36px;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary);font-size:var(--text-xs);font-weight:var(--weight-medium);object-fit:cover}
.tk-who__text{display:flex;flex:1;flex-direction:column;min-width:0}
.tk-who__text b{overflow:hidden;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.tk-who__text small{font-size:var(--text-xs);color:var(--text-muted)}
.tk-subj{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.tk-badges{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.tk-badges .ix-menu{margin-left:auto}
.tk-field{display:flex;gap:var(--space-2)}
.tk-field .gc-input{flex:1;min-width:0}
.tk-h3{margin:0;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.tk-acts{display:flex;flex-direction:column;gap:var(--space-3)}
.tk-act{display:flex;gap:10px;font-size:var(--text-xs-plus);color:var(--text-heading)}
.tk-act>svg{flex:none;margin-top:2px;color:var(--text-muted)}
.tk-act small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.tk-quick{display:flex;flex-wrap:wrap;gap:6px}
.tk-tag{align-self:flex-start}
.tk-order{font-family:var(--font-data)}
.tk-note{background:var(--fill-warning-soft)}
`;

// ---- markup ----

export default class SupportTicketsScreen extends Component {
  render() {
    const v = this.renderVals();
    const t = v.t;
    return (
      <div className="dc-screen ds" data-screen="SupportTickets">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <Sidebar sticky="" active="tickets" />
          <div className="gc-shell__main">
            <Topbar crumb="Customers" page="Support tickets" />
            <main className="gc-shell__content">
              <div className="ix-page">
                <ShopHeader icon="life-buoy" title="Support tickets"
                  about="Every customer request that needs follow-up, from chats, calls and comments. Open a ticket to assign it, reply and solve it."
                  secondary={[{ label: v.isBoard ? 'List view' : 'Board view', icon: v.isBoard ? 'list' : 'columns-3', onClick: v.toggleView }]}
                  more={[{ label: 'Inbox', href: '/merchant-inbox' }, { label: 'Team performance', href: '/team-report' }]}
                  primary={{ label: 'New ticket', onClick: v.newTicket }} />

                <MetricStrip label="Ticket figures" items={v.figures} />

                <section className="ix-card" aria-label={v.tabLabel}>
                  <div className="ix-bar">
                    {v.find ? (<>
                      <SearchField value={v.q} onChange={v.onSearch} placeholder="Search tickets, orders, people" onDone={v.closeFind} autoFocus />
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={v.closeFind}>Cancel</button>
                    </>) : (<>
                      {v.isBoard ? <h2 className="ix-section-title tk-boardtitle">Board</h2> : <IndexTabs tabs={v.tabs} label="Ticket status" />}
                      <span className="ix-tools">
                        <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={v.openFind}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
                      </span>
                    </>)}
                  </div>
                  {v.find ? (
                    <div className="ix-filters" role="group" aria-label="Filters">
                      <select aria-label="Channel" className={'ix-filter' + (v.ch ? ' is-set' : '')} value={v.ch} onChange={v.onCh}>
                        <option value="">Channel</option>
                        {Object.keys(CHANNEL_NAME).map((k) => <option key={k} value={k}>{CHANNEL_NAME[k]}</option>)}
                      </select>
                      <select aria-label="Priority" className={'ix-filter' + (v.pri ? ' is-set' : '')} value={v.pri} onChange={v.onPri}>
                        <option value="">Priority</option><option>Urgent</option><option>High</option><option>Normal</option><option>Low</option>
                      </select>
                      <select aria-label="Assignee" className={'ix-filter' + (v.who ? ' is-set' : '')} value={v.who} onChange={v.onWho}>
                        <option value="">Assignee</option><option value={ME}>Mine</option><option value="none">Unassigned</option>
                        {AGENTS.filter((a) => a !== ME).map((a) => <option key={a} value={a}>{a}</option>)}
                      </select>
                      {v.hasFilters ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={v.clear}>Clear all</button> : null}
                    </div>
                  ) : null}

                  {v.isBoard ? (
                    <div className="tk-board">
                      {v.columns.map((c) => (
                        <section key={c.s} className="tk-col" aria-label={c.s}>
                          <h3 className="tk-col__head">{c.s}<small>{c.items.length}</small></h3>
                          {c.note ? <p className="tk-col__note">{c.note}</p> : null}
                          {c.items.length ? c.items.map((k) => (
                            <button key={k.id} type="button" className="tk-card" onClick={k.open} aria-label={k.label}>
                              <span className="tk-card__top"><ChannelIcon channel={k.ch} size={16} decorative /><span className="tk-id">{k.ref}</span><StatusBadge tone={PRIORITY_TONE[k.priority]}>{k.priority}</StatusBadge></span>
                              <span className="tk-card__sub">{k.subject}</span>
                              <span className="tk-card__foot"><span>{k.customer}</span><span className={k.hot ? 'tk-hot' : ''}>{k.sla}</span></span>
                            </button>
                          )) : <p className="tk-empty">No tickets</p>}
                        </section>
                      ))}
                    </div>
                  ) : v.empty ? (
                    <div className="ix-empty"><EmptyState icon="life-buoy" title={v.emptyTitle} actionLabel={v.hasFilters ? 'Clear filters' : undefined} onAction={v.hasFilters ? v.clear : undefined} /></div>
                  ) : (<>
                    <ul className="ix-plist" aria-label={v.tabLabel}>
                      {v.rows.map((k) => (
                        <li key={k.id}>
                          <button type="button" className="ix-pitem" onClick={k.open} aria-label={k.label}>
                            <span className="ix-pitem__top"><b>{k.subject}</b><span className={k.hot ? 'tk-hot' : 'ix-muted'}>{k.sla}</span></span>
                            <span className="ix-pitem__mid">{k.ref} · {k.customer} · {k.assignee || 'Unassigned'}</span>
                            <span className="ix-pitem__tags">
                              <StatusBadge tone={STATUS_TONE[k.status]}>{k.status}</StatusBadge>
                              <StatusBadge tone={PRIORITY_TONE[k.priority]}>{k.priority}</StatusBadge>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="ix-table-wrap">
                      <table className="ix-table gc-table--keep">
                        <caption className="sr-only">{v.tabLabel}</caption>
                        <thead>
                          <tr>
                            <th scope="col">Ticket</th>
                            <th scope="col">Subject</th>
                            <th scope="col">Customer</th>
                            <th scope="col">Status</th>
                            <th scope="col">Priority</th>
                            <th scope="col">SLA</th>
                            <th scope="col">Assignee</th>
                          </tr>
                        </thead>
                        <tbody>
                          {v.rows.map((k) => (
                            <tr key={k.id} className={t && t.id === k.id ? 'is-sel' : ''} onClick={k.open}>
                              <td><span className="tk-id"><ChannelIcon channel={k.ch} size={16} label={k.channel} /><button type="button" className="ix-strong" aria-label={k.label}>{k.ref}</button></span></td>
                              <td><span className="tk-subject">{k.subject}</span></td>
                              <td className="ix-muted">{k.customer}</td>
                              <td><StatusBadge tone={STATUS_TONE[k.status]}>{k.status}</StatusBadge></td>
                              <td><StatusBadge tone={PRIORITY_TONE[k.priority]}>{k.priority}</StatusBadge></td>
                              <td className={k.hot ? 'tk-hot' : 'ix-muted'}>{k.sla}</td>
                              <td className={k.assignee ? '' : 'ix-muted'}>{k.assignee || 'Unassigned'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>)}
                  {v.isBoard ? null : <div className="ix-foot"><span>{v.countLabel}</span></div>}
                </section>
                <LearnMore topic="support tickets" />
              </div>
            </main>
          </div>
        </div>

        <Sheet open={!!t} title={t ? t.ref : 'Ticket'} label="Ticket details" onClose={v.close}
          footer={t ? <>
            <button type="button" className="gc-btn gc-btn--neutral" onClick={v.solve} disabled={t.status === 'Solved'}><Icon name="check-check" width="16" height="16" aria-hidden="true" />Solve ticket</button>
            <button type="button" className="gc-btn gc-btn--solid" onClick={v.send}>{v.isPublic ? 'Send reply' : 'Add note'}</button>
          </> : null}>
          {t ? (<>
            <div className="tk-badges">
              <StatusBadge tone={STATUS_TONE[t.status]}>{t.status}</StatusBadge>
              <StatusBadge tone={PRIORITY_TONE[t.priority]}>{t.priority}</StatusBadge>
              <span className={'tk-sla ' + (t.hot ? 'tk-hot' : 'ix-muted')}>{t.sla}</span>
              <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" items={[{ label: 'Escalate', onClick: v.soon }, { label: 'Snooze 2h', onClick: v.soon }, { label: 'Merge', onClick: v.soon }]} />
            </div>
            <p className="tk-subj">{t.subject}</p>
            <div className="tk-who">
              {t.img ? <img className="tk-av" src={t.img} alt="" style={{ objectPosition: t.imgPos }} /> : <span className="tk-av" aria-hidden="true">{t.initials}</span>}
              <span className="tk-who__text"><b>{t.customer}</b><small>{t.meta || t.channel + ' customer'}</small></span>
              <Link href="/merchant-calls" className="ix-btn ix-btn--sm ix-btn--icon" aria-label={'Call ' + t.customer} title="Call"><Icon name="phone" width="16" height="16" aria-hidden="true" /></Link>
              <Link href="/merchant-inbox" className="ix-btn ix-btn--sm ix-btn--icon" aria-label={'Open conversation with ' + t.customer} title="Open conversation"><Icon name="message-square" width="16" height="16" aria-hidden="true" /></Link>
            </div>
            <div>
              <label className="gc-label" htmlFor="tk-status">Status</label>
              <select id="tk-status" className="gc-input gc-select" value={t.status} onChange={v.setStatus}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
            </div>
            <div>
              <label className="gc-label" htmlFor="tk-owner">Assignee</label>
              <span className="tk-field">
                <select id="tk-owner" className="gc-input gc-select" value={t.assignee} onChange={v.setAssignee}>
                  <option value="">Unassigned</option>{AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                {t.assignee ? null : <button type="button" className="gc-btn gc-btn--soft" onClick={v.take}>Take it</button>}
              </span>
            </div>
            <div>
              <label className="gc-label" htmlFor="tk-team">Team</label>
              <select id="tk-team" className="gc-input gc-select" value={t.team || TEAMS[0]} onChange={v.setTeam}>{TEAMS.map((x) => <option key={x}>{x}</option>)}</select>
            </div>
            <KV rows={[
              ['Channel', t.channel],
              t.order ? ['Linked order', <Link key="o" href={'/merchant-orders?q=' + t.order} className="tk-order">{t.order}{t.orderTotal ? ' · ' + t.orderTotal : ''}</Link>] : null,
              t.full ? ['Tags', 'Created from call · order-change'] : null,
            ]} />
            <button type="button" className="ix-btn ix-btn--sm tk-tag"><Icon name="plus" width="16" height="16" aria-hidden="true" />Tag</button>
            <h3 className="tk-h3">Activity</h3>
            {t.full ? (
              <div className="tk-acts">
                <div className="tk-act"><Icon name="phone-incoming" width="16" height="16" aria-hidden="true" /><span>Ticket created from inbound call by Rina<small>Today 11:06 · recording attached (2:14)</small></span></div>
                <div className="tk-act"><Icon name="quote" width="16" height="16" aria-hidden="true" /><span>“Ekta saree add korte chai, difference bKash e dicchi.”<small>Today 11:04 · call transcript</small></span></div>
                <div className="tk-act"><Icon name="sticky-note" width="16" height="16" aria-hidden="true" /><span>Stock confirmed — 6 left of JAM-114. Courier pickup 5 PM, needs packing hold.<small>Internal note · Rina</small></span></div>
                <div className="tk-act"><Icon name="message-square" width="16" height="16" aria-hidden="true" /><span>Earlier Instagram DM thread merged into this ticket<small>Today 10:11 · 4 messages</small></span></div>
              </div>
            ) : (
              <div className="tk-act"><ChannelIcon channel={t.ch} size={16} decorative /><span>Ticket opened from {t.channel} by {t.customer}<small>{t.status} · {t.sla}</small></span></div>
            )}
            <h3 className="tk-h3">Reply</h3>
            <div className="gc-seg" role="group" aria-label="Reply type">
              <button type="button" className={'gc-seg__btn' + (v.isPublic ? ' gc-seg__btn--active' : '')} aria-pressed={v.isPublic} onClick={v.setPublic}>Reply to customer</button>
              <button type="button" className={'gc-seg__btn' + (!v.isPublic ? ' gc-seg__btn--active' : '')} aria-pressed={!v.isPublic} onClick={v.setInternal}>Internal note</button>
            </div>
            <textarea className={'gc-input' + (v.isPublic ? '' : ' tk-note')} rows="3" value={v.draft} onChange={v.onDraft}
              aria-label={v.isPublic ? 'Reply to ' + t.customer + ' on ' + t.channel : 'Internal note on ' + t.ref}
              placeholder={v.isPublic ? 'Reply on ' + t.channel + ' — the channel the customer used…' : 'Note for the team — the customer will not see this.'} />
            <div className="tk-quick">
              <button type="button" className="ix-btn ix-btn--sm">Payment link</button>
              <button type="button" className="ix-btn ix-btn--sm">Dispatch time</button>
              <button type="button" className="ix-btn ix-btn--sm">Bangla version</button>
            </div>
          </>) : null}
        </Sheet>
      </div>
    );
  }
}
