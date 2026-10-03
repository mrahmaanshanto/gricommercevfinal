'use client';
// MessagingCampaigns — /campaigns-messaging (Nayeem's brief #11, "Messaging Campaigns"): send a message to a group of
// customers. Three views on one route:
//   Campaigns (list)  status tabs (Draft · Scheduled · Sending · Completed), this month's figures; a row opens it.
//   ?id=<id> | new    the campaign: segment, channels, template, when; "Before sending" counts who can get it
//                     (eligible, no consent, can't be reached, quiet hours, over the cap) and the cost from the
//                     GridCommerce credits; then Send / Schedule; results once sent (sent, delivered, read, clicked, orders).
//   ?view=templates   message templates with their class (Transactional · Service · Marketing · Security), channel,
//                     language and version; editing one keeps the old version.
//   ?view=log         the delivery log of every message the shop sent (orders, campaigns, reminders, loyalty, reports).
// Paid-ad campaigns are a different page (/campaigns). Front end only: src/lib/campaigns.js, src/lib/messaging.js.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { toast, confirmDialog } from '@/runtime/ui';
import { EmptyState, StatusBadge, Dialog, InfoTip } from '@/components/ui';
import { ShopHeader, RecordHeader, MetricStrip, IndexTabs, SearchField, LearnMore, KV } from '@/components/ui/IndexKit';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { clockNow } from '@/lib/settlements';
import {
  STATUS, getCampaigns, campaignBy, saveCampaign, deleteCampaign, setCampaignStatus, precheck, sendCampaign, runDue, resultsOf, getSegments, segmentName, CAMPAIGN_EVENT,
} from '@/lib/campaigns';
import { getTemplates, templateBy, saveTemplate, templateVersions, deliveryLog, retry, fill, baseVars, send, CLASSES, SOURCES, STATUS_TONE, CHANNEL_WORD, MSG_EVENT } from '@/lib/messaging';
import { CLASS_INFO } from '@/lib/messagePolicy';
import { SEND_CHANNELS, capsOf } from '@/lib/channelCaps';
import { getNotifySettings } from '@/lib/notifications';

const CH = { whatsapp: 'WhatsApp', sms: 'SMS', email: 'Email' };
const TABS = [['all', 'All'], ['draft', 'Draft'], ['scheduled', 'Scheduled'], ['sending', 'Sending'], ['completed', 'Completed']];
const money = (n) => formatBDT(n, { decimals: n % 1 ? 2 : 0 });
const num = (n) => Math.round(n || 0).toLocaleString('en-IN');
const when = (t) => (t ? `${formatDate(t)}, ${formatTime(t)}` : '—');
const toLocalInput = (t) => { if (!t) return ''; const d = new Date(t); const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };
const getQ = () => (typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search));
function setQ(params) {
  const u = new URL(window.location.href);
  ['id', 'view', 'campaign'].forEach((k) => u.searchParams.delete(k));
  Object.entries(params).forEach(([k, v]) => { if (v) u.searchParams.set(k, v); });
  window.history.pushState(window.history.state, '', u.pathname + u.search);
}
function useTick(events) {
  const [n, setN] = useState(0);
  useEffect(() => { setN(1); const on = () => setN((x) => x + 1); events.forEach((e) => window.addEventListener(e, on)); return () => events.forEach((e) => window.removeEventListener(e, on)); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return n;
}

export default function MessagingCampaigns() {
  const tick = useTick([CAMPAIGN_EVENT, MSG_EVENT, 'storage']);
  const [route, setRoute] = useState({ id: '', view: '' });
  useEffect(() => {
    runDue();
    const read = () => { const q = getQ(); setRoute({ id: q.get('id') || '', view: q.get('view') || '' }); };
    read();
    window.addEventListener('popstate', read);
    return () => window.removeEventListener('popstate', read);
  }, []);
  const go = (p) => { setQ(p); setRoute({ id: p.id || '', view: p.view || '' }); window.scrollTo(0, 0); };

  return (
    <div className="dc-screen ds" data-screen="MessagingCampaigns">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="msg-campaigns" />
        <main className="gc-shell__main">
          <Topbar crumb="Marketing" page="Messaging campaigns" />
          <div className="gc-shell__content">
            {route.id ? <CampaignRecord key={route.id} id={route.id} tick={tick} go={go} />
              : route.view === 'templates' ? <Templates tick={tick} go={go} />
                : route.view === 'log' ? <DeliveryLog tick={tick} go={go} />
                  : <CampaignList tick={tick} go={go} />}
          </div>
        </main>
      </div>
    </div>
  );
}

// ---- the list ------------------------------------------------------------------------------------------------------------
function CampaignList({ tick, go }) {
  const [tab, setTab] = useState('all');
  const data = useMemo(() => {
    if (!tick) return null;
    const t = clockNow();
    const m0 = new Date(t); m0.setDate(1); m0.setHours(0, 0, 0, 0);
    const list = getCampaigns().map((c) => ({ ...c, r: resultsOf(c) }));
    const month = list.filter((c) => c.sentAt && c.sentAt >= m0.getTime() - 32 * 864e5);
    const sum = (k) => month.reduce((a, c) => a + (c.r[k] || 0), 0);
    return { list, sent: sum('sent'), delivered: sum('delivered'), suppressed: sum('suppressed'), cost: sum('cost'), orders: sum('orders') };
  }, [tick]);
  const rows = data ? data.list.filter((c) => tab === 'all' || c.status === tab || (tab === 'scheduled' && c.status === 'paused')) : [];
  const count = (k) => (data ? data.list.filter((c) => k === 'all' || c.status === k).length : null);
  return (
    <div className="ix-page">
      <ShopHeader icon="send" title="Messaging campaigns"
        about="Send a message to a group of customers on WhatsApp, SMS or email. Before it goes out you see how many can get it and what it costs; afterwards, what it sold. Every message checks consent, the Don’t message list, quiet hours and message limits."
        secondary={[{ label: 'Templates', onClick: () => go({ view: 'templates' }) }, { label: 'Delivery log', onClick: () => go({ view: 'log' }) }]}
        more={[{ label: 'Message settings', href: '/workflow-settings' }, { label: 'Ad campaigns', href: '/campaigns' }]}
        primary={{ label: 'New campaign', onClick: () => go({ id: 'new' }) }} />
      <MetricStrip label="Last 30 days" items={[
        { label: 'Messages sent', value: data ? num(data.sent) : '—', sub: 'last 30 days' },
        { label: 'Delivered', value: data ? num(data.delivered) : '—' },
        { label: 'Not sent', value: data ? num(data.suppressed) : '—', sub: 'no consent or blocked' },
        { label: 'Message cost', value: data ? money(data.cost) : '—' },
        { label: 'Orders', value: data ? num(data.orders) : '—', sub: 'after a click' },
      ]} />
      <section className="ix-card" aria-label="Campaigns">
        <div className="ix-bar"><IndexTabs label="Campaigns by status" tabs={TABS.map(([k, l]) => ({ key: k, label: l, count: count(k), id: 'mc-tab-' + k, on: tab === k, onClick: () => setTab(k) }))} /></div>
        {!data ? <div className="ix-empty"><EmptyState icon="loader" title="Reading campaigns" /></div> : !rows.length ? (
          <div className="ix-empty"><EmptyState icon="send" title="No campaigns here" actionLabel="New campaign" onAction={() => go({ id: 'new' })} /></div>
        ) : (<>
          <ul className="ix-plist" aria-label="Campaigns">
            {rows.map((c) => (
              <li key={c.id}><button type="button" className="ix-pitem" onClick={() => go({ id: c.id })}>
                <span className="ix-pitem__top"><b>{c.name}</b><StatusBadge tone={STATUS[c.status][1]}>{STATUS[c.status][0]}</StatusBadge></span>
                <span className="ix-pitem__mid">{segmentName(c.segment)} · {c.channels.map((x) => CH[x]).join(' + ')}</span>
                <span className="ix-pitem__mid">{c.sentAt ? `${num(c.r.delivered)} delivered · ${num(c.r.orders)} orders` : c.schedule.mode === 'later' ? when(c.schedule.at) : 'Not sent'}</span>
              </button></li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table gc-table--keep">
              <thead><tr><th scope="col">Campaign</th><th scope="col">Status</th><th scope="col">Channel</th><th scope="col">When</th><th scope="col" className="ix-num">Delivered</th><th scope="col" className="ix-num">Orders</th></tr></thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} onClick={(e) => { if (e.target.closest('a,button')) return; go({ id: c.id }); }}>
                    <td><button type="button" className="ix-strong" onClick={() => go({ id: c.id })}>{c.name}</button><span className="mc-sub">{segmentName(c.segment)}</span></td>
                    <td><StatusBadge tone={STATUS[c.status][1]}>{STATUS[c.status][0]}</StatusBadge></td>
                    <td>{c.channels.map((x) => CH[x]).join(' + ')}</td>
                    <td className="ix-muted">{c.sentAt ? when(c.sentAt) : c.schedule.mode === 'later' ? when(c.schedule.at) : '—'}</td>
                    <td className="ix-num">{c.sentAt ? num(c.r.delivered) : '—'}</td>
                    <td className="ix-num">{c.sentAt ? num(c.r.orders) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>)}
        <div className="ix-foot"><span>{rows.length} {rows.length === 1 ? 'campaign' : 'campaigns'}</span></div>
      </section>
      <LearnMore topic="messaging campaigns" />
    </div>
  );
}

// ---- one campaign ----------------------------------------------------------------------------------------------------------
const BLANK = { name: '', objective: 'Sales', segment: 'all', channels: ['whatsapp', 'sms'], template: 'T-EID-WA', vars: { offer: '10% off', coupon_code: '', link: 'https://gridshop.com.bd/offers' }, schedule: { mode: 'now', at: null }, status: 'draft', utm: '' };
function CampaignRecord({ id, tick, go }) {
  const isNew = id === 'new';
  const [c, setC] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [check, setCheck] = useState(null);
  // read the campaign (again after a send or a scheduled run), unless there are unsaved changes
  useEffect(() => { if (!tick || dirty) return; setC(isNew ? { ...BLANK, vars: { ...BLANK.vars } } : campaignBy(id)); }, [id, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const done = c && (c.status === 'completed' || c.status === 'sending' || c.status === 'cancelled');
  // the counts follow every change (debounced a little: a segment can be hundreds of people)
  useEffect(() => { if (!c || done) return undefined; const h = window.setTimeout(() => setCheck(precheck(c)), 150); return () => window.clearTimeout(h); }, [c, done, tick]);
  if (!c) return <div className="ix-page"><EmptyState icon={tick ? 'search-x' : 'loader'} title={tick ? 'Campaign not found' : 'Reading the campaign'} actionLabel={tick ? 'All campaigns' : undefined} onAction={() => go({})} /></div>;
  const set = (patch) => { setC((x) => ({ ...x, ...patch })); setDirty(true); };
  const setVar = (k, v) => set({ vars: { ...c.vars, [k]: v } });
  const tpl = templateBy(c.template);
  const templates = getTemplates().filter((x) => x.cls === 'Marketing' && SEND_CHANNELS.includes(x.channel));
  const preview = tpl ? fill(tpl.body, { ...baseVars(), customer_name: 'Nusrat', ...c.vars }) : '';
  const r = done ? resultsOf(c) : null;
  const save = (status) => {
    const out = saveCampaign({ ...c, ...(isNew ? {} : { id: c.id }), status: status || (c.status === 'scheduled' && c.schedule.mode !== 'later' ? 'draft' : c.status) });
    if (out.error) { toast(out.error, { tone: 'error' }); return null; }
    setDirty(false);
    if (isNew) go({ id: out.campaign.id });
    return out.campaign;
  };
  const sendNow = async () => {
    if (!check || !check.eligible) { toast('Nobody in this segment can get it now', { tone: 'error' }); return; }
    if (!check.enough) { toast('Not enough GridCommerce credits. Top up first.', { tone: 'error' }); return; }
    if (!(await confirmDialog({ title: `Send to ${num(check.eligible + check.quiet)} customers?`, body: `It costs about ${money(check.cost)} from your credits.${check.quiet ? ` ${num(check.quiet)} wait for quiet hours to end.` : ''} Each person is checked again as it goes out.`, confirmLabel: 'Send' }))) return;
    const saved = save('draft');
    if (!saved) return;
    const res = sendCampaign(saved.id);
    if (res.error) { toast(res.error, { tone: 'error' }); return; }
    toast(res.queued ? `Sending. ${num(res.queued)} go out after quiet hours.` : `Sent to ${num(res.sent)} customers`);
    go({ id: saved.id });
  };
  const schedule = () => {
    if (c.schedule.mode !== 'later') { set({ schedule: { mode: 'later', at: clockNow() + 864e5 } }); return; }
    const saved = save('scheduled');
    if (saved) toast(`Scheduled for ${when(saved.schedule.at)}`);
  };
  const testSend = () => {
    const to = getNotifySettings().adminPhone;
    const out = send({ source: 'Campaigns', event: 'Test · ' + (c.name || 'campaign'), cls: 'Marketing', channel: c.channels[0] === 'email' ? 'sms' : c.channels[0], to: { name: 'Shop', phone: to }, template: c.template, vars: c.vars, internal: true });
    toast(out.status === 'Failed' ? 'The test didn’t go. Try again.' : `Test sent to ${to}`);
  };
  const remove = async () => {
    if (!(await confirmDialog({ title: 'Delete this campaign?', body: 'It hasn’t been sent. This can’t be undone.', confirmLabel: 'Delete', tone: 'danger' }))) return;
    deleteCampaign(c.id); toast('Campaign deleted'); go({});
  };
  const st = STATUS[c.status] || STATUS.draft;
  return (
    <div className="ix-page">
      <RecordHeader onBack={() => go({})} backLabel="Campaigns" title={isNew ? 'New campaign' : c.name}
        badges={isNew ? null : <StatusBadge tone={st[1]}>{st[0]}</StatusBadge>}
        meta={done ? `Sent ${when(c.sentAt)} · ${segmentName(c.segment)}` : c.schedule.mode === 'later' && c.schedule.at ? `Goes out ${when(c.schedule.at)}` : undefined}
        about="Pick who gets it, the channels and the message, then send now or at a time. The counts show who can get it right now; each person is checked again when it goes out."
        secondary={done ? [] : [{ label: 'Save draft', onClick: () => { if (save()) toast('Draft saved'); } }, { label: 'Send a test', onClick: testSend }]}
        more={done || isNew ? [] : [c.status === 'scheduled' ? { label: 'Back to draft', onClick: () => { setCampaignStatus(c.id, 'draft'); toast('Moved back to draft'); } } : null, { label: 'Delete', onClick: remove, tone: 'danger' }].filter(Boolean)}
        primary={done ? undefined : c.schedule.mode === 'later' ? { label: dirty || c.status !== 'scheduled' ? 'Schedule' : 'Scheduled', onClick: schedule } : { label: 'Send now', onClick: sendNow }} />
      <div className="ix-record">
        <div className="ix-main">
          {done ? <Results c={c} r={r} go={go} /> : null}
          <section className="ix-card" aria-labelledby="mc-what">
            <header className="ix-card__head"><h2 id="mc-what">Campaign</h2></header>
            <div className="ix-card__body mc-form">
              <div className="mc-field"><label className="gc-label" htmlFor="mc-name">Name</label><input id="mc-name" className="gc-input" value={c.name} disabled={done} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Eid early access" /></div>
              <div className="mc-field"><label className="gc-label" htmlFor="mc-seg">Customers</label>
                <select id="mc-seg" className="gc-input gc-select" value={c.segment} disabled={done} onChange={(e) => set({ segment: e.target.value })}>{getSegments().map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
              </div>
              <div className="mc-field"><span className="gc-label">Channels <InfoTip text="Tried in this order: if the first can’t reach someone, the next one is used." /></span>
                <div className="ix-chips" role="group" aria-label="Channels">
                  {SEND_CHANNELS.map((ch) => { const on = c.channels.includes(ch); return <button key={ch} type="button" className="ix-chip" aria-pressed={on} disabled={done} onClick={() => set({ channels: on ? c.channels.filter((x) => x !== ch) : [...c.channels, ch] })}>{on ? <Icon name="check" width="14" height="14" aria-hidden="true" /> : null}{CH[ch]}</button>; })}
                </div>
              </div>
            </div>
          </section>
          <section className="ix-card" aria-labelledby="mc-msg">
            <header className="ix-card__head"><h2 id="mc-msg">Message</h2><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => go({ view: 'templates' })}>Templates</button></header>
            <div className="ix-card__body mc-form">
              <div className="mc-field"><label className="gc-label" htmlFor="mc-tpl">Template</label>
                <select id="mc-tpl" className="gc-input gc-select" value={c.template} disabled={done} onChange={(e) => set({ template: e.target.value })}>{templates.map((x) => <option key={x.id} value={x.id}>{x.name} · {CH[x.channel]} · v{x.version}</option>)}</select>
              </div>
              <div className="mc-two">
                <div className="mc-field"><label className="gc-label" htmlFor="mc-offer">Offer</label><input id="mc-offer" className="gc-input" value={c.vars.offer || ''} disabled={done} onChange={(e) => setVar('offer', e.target.value)} /></div>
                <div className="mc-field"><label className="gc-label" htmlFor="mc-code">Coupon code</label><input id="mc-code" className="gc-input mc-code" value={c.vars.coupon_code || ''} disabled={done} onChange={(e) => setVar('coupon_code', e.target.value.toUpperCase().replace(/\s/g, ''))} /></div>
              </div>
              <div className="mc-field"><label className="gc-label" htmlFor="mc-link">Link</label><input id="mc-link" className="gc-input" value={c.vars.link || ''} disabled={done} onChange={(e) => setVar('link', e.target.value)} /></div>
              {tpl ? <div className="mc-bubble" aria-label="Preview"><span className="mc-bubble__head">{CH[tpl.channel]} · {tpl.cls}{tpl.providerStatus ? ' · ' + tpl.providerStatus : ''}</span><p>{preview}</p>{(tpl.buttons || []).length && capsOf(tpl.channel).buttons ? <span className="mc-bubble__btn">{tpl.buttons[0]}</span> : null}</div> : null}
            </div>
          </section>
          {!done ? (
            <section className="ix-card" aria-labelledby="mc-when">
              <header className="ix-card__head"><h2 id="mc-when">When</h2></header>
              <div className="ix-card__body mc-form">
                <div className="ix-chips" role="group" aria-label="When">
                  <button type="button" className="ix-chip" aria-pressed={c.schedule.mode !== 'later'} onClick={() => set({ schedule: { mode: 'now', at: null } })}>Send now</button>
                  <button type="button" className="ix-chip" aria-pressed={c.schedule.mode === 'later'} onClick={() => set({ schedule: { mode: 'later', at: c.schedule.at || clockNow() + 864e5 } })}>At a time</button>
                </div>
                {c.schedule.mode === 'later' ? <div className="mc-field"><label className="gc-label" htmlFor="mc-at">Date and time</label><input id="mc-at" type="datetime-local" className="gc-input" value={toLocalInput(c.schedule.at)} onChange={(e) => set({ schedule: { mode: 'later', at: new Date(e.target.value).getTime() || null } })} /></div> : null}
              </div>
            </section>
          ) : null}
        </div>
        <aside className="ix-side">
          {!done ? (
            <section className="ix-card" aria-labelledby="mc-check">
              <header className="ix-card__head"><h2 id="mc-check">Before sending <InfoTip text="Worked out for the send time. Consent comes from Customers; the rest from Message settings." /></h2></header>
              <div className="ix-card__body">
                {!check ? <p className="mc-help">Counting…</p> : (<>
                  <KV rows={[
                    ['In the segment', num(check.segment)],
                    ['No consent', check.noConsent ? '− ' + num(check.noConsent) : '0'],
                    ['Can’t be reached', check.suppressed + check.invalid ? '− ' + num(check.suppressed + check.invalid) : '0'],
                    ['Over the message limit', check.capped ? '− ' + num(check.capped) : '0'],
                    check.quiet ? ['Wait for quiet hours', num(check.quiet)] : null,
                  ]} />
                  <dl className="ix-sum"><dt className="is-total">Will get it</dt><dd className="is-total">{num(check.eligible + check.quiet)}</dd></dl>
                  <p className="mc-help">{Object.entries(check.byChannel).map(([k, n]) => `${CH[k]} ${num(n)}`).join(' · ')}</p>
                  <dl className="ix-sum"><dt>Cost</dt><dd>{money(check.cost)}</dd><dt>Credits left</dt><dd className={check.enough ? '' : 'ix-bad'}>{money(check.credits)}</dd></dl>
                  {!check.enough ? <p className="mc-help ix-bad">Not enough credits. Top up in Wallet &amp; credits.</p> : null}
                </>)}
              </div>
            </section>
          ) : null}
          <section className="ix-card" aria-labelledby="mc-facts">
            <header className="ix-card__head"><h2 id="mc-facts">Details</h2></header>
            <div className="ix-card__body"><KV rows={[['Kind', 'Marketing'], ['Customers', segmentName(c.segment)], ['Tracking', c.utm || '—'], ['Made by', c.by || '—']]} /></div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Results({ c, r, go }) {
  const pct = (a, b) => (b ? Math.round((a / b) * 100) + '%' : '—');
  return (
    <section className="ix-card" aria-labelledby="mc-res">
      <header className="ix-card__head"><h2 id="mc-res">Results</h2>{!c.results ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => go({ view: 'log', campaign: c.id })}>Delivery log</button> : null}</header>
      <div className="ix-card__body">
        <div className="mc-results">
          {[['Sent', num(r.sent), ''], ['Delivered', num(r.delivered), pct(r.delivered, r.sent)], ['Read', num(r.read), pct(r.read, r.delivered)], ['Clicked', num(r.clicked), pct(r.clicked, r.delivered)], ['Orders', num(r.orders), money(r.revenue)]].map(([l, v, s]) => (
            <div key={l} className="mc-res"><span>{l}</span><b>{v}</b>{s ? <small>{s}</small> : null}</div>
          ))}
        </div>
        <p className="mc-help">{num(r.suppressed)} not sent (consent, blocked or limits){r.failed ? ` · ${num(r.failed)} failed` : ''}{r.queued ? ` · ${num(r.queued)} waiting for quiet hours` : ''} · cost {money(r.cost)}. Read shows only where the channel tells us. Orders are counted from clicks; Reports has the full picture.</p>
      </div>
    </section>
  );
}

// ---- templates ------------------------------------------------------------------------------------------------------------
function Templates({ tick, go }) {
  const [cls, setCls] = useState('all');
  const [edit, setEdit] = useState(null);
  const list = tick ? getTemplates() : [];
  const rows = list.filter((t) => cls === 'all' || t.cls === cls);
  const saveIt = (e) => {
    e.preventDefault();
    const out = saveTemplate(edit);
    if (out.error) { toast(out.error, { tone: 'error' }); return; }
    setEdit(null);
    toast(out.template.version > (edit.version || 0) && edit.id ? `Saved as version ${out.template.version}` : 'Template saved');
  };
  return (
    <div className="ix-page">
      <RecordHeader onBack={() => go({})} backLabel="Campaigns" title="Message templates"
        about="Messages used by campaigns, automations, reminders, loyalty and reports. Each has a class: Transactional and Security always go; Service waits for quiet hours; Marketing needs consent and keeps to the limits. Saved replies in the Inbox are separate."
        primary={{ label: 'New template', onClick: () => setEdit({ name: '', channel: 'sms', cls: 'Marketing', lang: 'English', subject: '', body: '' }) }} />
      <section className="ix-card" aria-label="Templates">
        <div className="ix-bar"><IndexTabs label="Templates by class" tabs={[['all', 'All'], ...CLASSES.map((x) => [x, x])].map(([k, l]) => ({ key: k, label: l, count: list.filter((t) => k === 'all' || t.cls === k).length, id: 'mt-tab-' + k, on: cls === k, onClick: () => setCls(k) }))} /></div>
        <ul className="ix-plist" aria-label="Templates">
          {rows.map((t) => (
            <li key={t.id}><button type="button" className="ix-pitem" onClick={() => setEdit({ ...t })}>
              <span className="ix-pitem__top"><b>{t.name}</b><StatusBadge tone={CLASS_INFO[t.cls].tone}>{t.cls}</StatusBadge></span>
              <span className="ix-pitem__mid">{CH[t.channel] || t.channel} · {t.lang} · v{t.version}</span>
            </button></li>
          ))}
        </ul>
        <div className="ix-table-wrap">
          <table className="ix-table gc-table--keep">
            <thead><tr><th scope="col">Template</th><th scope="col">Class</th><th scope="col">Channel</th><th scope="col">Language</th><th scope="col">Version</th><th scope="col">Approval</th></tr></thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} onClick={(e) => { if (e.target.closest('button')) return; setEdit({ ...t }); }}>
                  <td><button type="button" className="ix-strong" onClick={() => setEdit({ ...t })}>{t.name}</button></td>
                  <td><StatusBadge tone={CLASS_INFO[t.cls].tone}>{t.cls}</StatusBadge></td>
                  <td>{CH[t.channel] || t.channel}</td>
                  <td className="ix-muted">{t.lang}</td>
                  <td className="ix-muted">v{t.version}</td>
                  <td>{t.providerStatus ? <StatusBadge tone={t.providerStatus === 'Approved' ? 'success' : t.providerStatus === 'Rejected' ? 'error' : 'warning'}>{t.providerStatus}</StatusBadge> : <span className="ix-muted">Not needed</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ix-foot"><span>{rows.length} {rows.length === 1 ? 'template' : 'templates'}</span></div>
      </section>
      <Dialog open={!!edit} title={edit && edit.id ? edit.name : 'New template'} onClose={() => setEdit(null)} width={600}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEdit(null)}>Cancel</button><button type="submit" form="mt-form" className="gc-btn gc-btn--solid">Save</button></>}>
        {edit ? (
          <form id="mt-form" className="mc-form" onSubmit={saveIt} noValidate>
            <div className="mc-field"><label className="gc-label" htmlFor="mt-name">Name</label><input id="mt-name" className="gc-input" data-autofocus value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
            <div className="mc-two">
              <div className="mc-field"><label className="gc-label" htmlFor="mt-ch">Channel</label><select id="mt-ch" className="gc-input gc-select" value={edit.channel} onChange={(e) => setEdit({ ...edit, channel: e.target.value })}>{SEND_CHANNELS.map((x) => <option key={x} value={x}>{CH[x]}</option>)}</select></div>
              <div className="mc-field"><label className="gc-label" htmlFor="mt-cls">Class <InfoTip text={CLASS_INFO[edit.cls].about} /></label><select id="mt-cls" className="gc-input gc-select" value={edit.cls} onChange={(e) => setEdit({ ...edit, cls: e.target.value })}>{CLASSES.map((x) => <option key={x}>{x}</option>)}</select></div>
            </div>
            <div className="mc-field"><label className="gc-label" htmlFor="mt-lang">Language</label><select id="mt-lang" className="gc-input gc-select" value={edit.lang} onChange={(e) => setEdit({ ...edit, lang: e.target.value })}><option>English</option><option>Bangla</option></select></div>
            {edit.channel === 'email' ? <div className="mc-field"><label className="gc-label" htmlFor="mt-sub">Subject</label><input id="mt-sub" className="gc-input" value={edit.subject || ''} onChange={(e) => setEdit({ ...edit, subject: e.target.value })} /></div> : null}
            <div className="mc-field"><label className="gc-label" htmlFor="mt-body">Message</label><textarea id="mt-body" className="gc-input mc-area" rows="4" value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value })} /><p className="mc-help">Use {'{{customer_name}}'}, {'{{offer}}'}, {'{{coupon_code}}'}, {'{{link}}'}, {'{{store_name}}'}.{edit.channel === 'whatsapp' ? ' A changed WhatsApp template waits for approval again.' : ''}</p></div>
            {edit.id ? (
              <div className="mc-field"><span className="gc-label">Versions</span>
                {templateVersions(edit.id).map((x) => <div key={x.v} className="mc-ver"><b>v{x.v}{x.current ? ' · live' : ''}</b><span>{x.by} · {formatDate(x.at)}</span><p>{x.body}</p></div>)}
              </div>
            ) : null}
          </form>
        ) : null}
      </Dialog>
    </div>
  );
}

// ---- delivery log ---------------------------------------------------------------------------------------------------------
function DeliveryLog({ tick, go }) {
  const q0 = getQ();
  const [source, setSource] = useState('');
  const [channel, setChannel] = useState('');
  const [status, setStatus] = useState('');
  const [q, setQq] = useState('');
  const [campaign] = useState(q0.get('campaign') || '');
  const [open, setOpen] = useState(null);
  const rows = useMemo(() => (tick ? deliveryLog({ source, channel, status, campaignId: campaign }) : []), [tick, source, channel, status, campaign]);
  const needle = q.trim().toLowerCase();
  const shown = rows.filter((r) => !needle || [r.to, r.address, r.event, r.text].join(' ').toLowerCase().includes(needle)).slice(0, 200);
  const filters = !!(source || channel || status || needle);
  return (
    <div className="ix-page">
      <RecordHeader onBack={() => go({})} backLabel="Campaigns" title="Delivery log" meta={campaign ? `Campaign ${(campaignBy(campaign) || { name: campaign }).name}` : undefined}
        about="Every message the shop sent, from every area: order updates, campaigns, cart reminders, loyalty messages and reports. Not sent means consent, the Don’t message list, an address that doesn’t work or a message limit stopped it." />
      <section className="ix-card" aria-label="Messages">
        <div className="ix-bar"><SearchField value={q} onChange={(e) => setQq(e.target.value)} placeholder="Search name, number, message" /></div>
        <div className="ix-filters" role="group" aria-label="Filters">
          <select aria-label="Area" className={'ix-filter' + (source ? ' is-set' : '')} value={source} onChange={(e) => setSource(e.target.value)}><option value="">Area</option>{SOURCES.map((x) => <option key={x}>{x}</option>)}</select>
          <select aria-label="Channel" className={'ix-filter' + (channel ? ' is-set' : '')} value={channel} onChange={(e) => setChannel(e.target.value)}><option value="">Channel</option>{SEND_CHANNELS.map((x) => <option key={x} value={x}>{CH[x]}</option>)}</select>
          <select aria-label="Status" className={'ix-filter' + (status ? ' is-set' : '')} value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Status</option>{Object.keys(STATUS_TONE).map((x) => <option key={x}>{x}</option>)}</select>
          {filters ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setSource(''); setChannel(''); setStatus(''); setQq(''); }}>Clear all</button> : null}
        </div>
        {!shown.length ? <div className="ix-empty"><EmptyState icon="inbox" title={tick ? 'No messages match' : 'Reading the log'} /></div> : (<>
          <ul className="ix-plist" aria-label="Messages">
            {shown.map((r) => (
              <li key={r.id}><button type="button" className="ix-pitem" onClick={() => setOpen(r)}>
                <span className="ix-pitem__top"><b>{r.to || r.address}</b><StatusBadge tone={STATUS_TONE[r.status] || 'neutral'}>{r.status === 'Read' && r.channel === 'email' ? 'Opened' : r.status}</StatusBadge></span>
                <span className="ix-pitem__mid">{r.source} · {r.event} · {CHANNEL_WORD[r.channel] || r.channel}</span>
              </button></li>
            ))}
          </ul>
          <div className="ix-table-wrap">
            <table className="ix-table gc-table--keep">
              <thead><tr><th scope="col">Sent</th><th scope="col">To</th><th scope="col">Message</th><th scope="col">Channel</th><th scope="col">Status</th><th scope="col" className="ix-num">Cost</th></tr></thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id} onClick={() => setOpen(r)}>
                    <td className="ix-muted">{when(r.at)}</td>
                    <td><button type="button" className="ix-strong" onClick={() => setOpen(r)}>{r.to || r.address}</button></td>
                    <td><span className="mc-cut">{r.event || r.text}</span><span className="mc-sub">{r.source} · {r.cls}</span></td>
                    <td>{CHANNEL_WORD[r.channel] || r.channel}</td>
                    <td><StatusBadge tone={STATUS_TONE[r.status] || 'neutral'}>{r.status === 'Read' && r.channel === 'email' ? 'Opened' : r.status}</StatusBadge></td>
                    <td className="ix-num">{r.cost ? money(r.cost) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>)}
        <div className="ix-foot"><span>{shown.length < rows.length ? `${shown.length} of ${num(rows.length)} messages` : `${num(rows.length)} messages`}</span></div>
      </section>
      <Dialog open={!!open} title="Message" onClose={() => setOpen(null)} width={560}
        footer={open && open.status === 'Failed' && !open.fromNotify && !open.demo ? <><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setOpen(null)}>Close</button><button type="button" className="gc-btn gc-btn--solid" onClick={() => { retry(open.id); setOpen(null); toast('Sent again'); }}>Send again</button></> : undefined}>
        {open ? (
          <div className="mc-form">
            <KV rows={[['To', `${open.to || ''}${open.address && open.address !== open.to ? ' · ' + open.address : ''}`], ['From', `${open.source} · ${open.event || ''}`], ['Class', open.cls], ['Channel', CHANNEL_WORD[open.channel] || open.channel], ['Status', open.status + (open.reason ? ' · ' + open.reason : '')], open.templateId ? ['Template', `${(templateBy(open.templateId) || { name: open.templateId }).name} v${open.templateVersion || 1}`] : null, ['Sent', when(open.at)], open.readAt ? [open.channel === 'email' ? 'Opened' : 'Read', when(open.readAt)] : null, open.clickedAt ? ['Clicked', when(open.clickedAt)] : null, open.nextAt && open.status === 'Queued' ? ['Goes out', when(open.nextAt)] : null, ['Cost', open.cost ? money(open.cost) : '—']]} />
            {open.text ? <div className="mc-bubble"><p>{open.text}</p></div> : null}
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}

const CSS = `
.mc-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.mc-cut{display:block;max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mc-form{display:flex;flex-direction:column;gap:var(--space-3)}
.mc-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.mc-field .gc-label{margin:0}
.mc-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.mc-code{font-family:var(--font-data);text-transform:uppercase}
.mc-area{height:auto;resize:vertical}
.mc-help{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.mc-bubble{display:flex;flex-direction:column;gap:6px;max-width:420px;padding:var(--space-3);border-radius:var(--radius-xl);background:var(--fill-success-soft)}
.mc-bubble p{margin:0;font-size:var(--text-sm);line-height:1.5;color:var(--text-heading);white-space:pre-wrap;overflow-wrap:anywhere}
.mc-bubble__head{font-size:var(--text-xs);color:var(--text-muted)}
.mc-bubble__btn{align-self:stretch;padding:6px;border-radius:var(--radius-lg);background:var(--surface-card);text-align:center;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--primary)}
.mc-results{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:var(--space-3);margin-bottom:var(--space-3)}
.mc-res{display:flex;flex-direction:column;gap:2px;min-width:0}
.mc-res span{font-size:var(--text-xs);color:var(--text-muted)}
.mc-res b{font-size:var(--text-sm);font-weight:var(--weight-semibold);font-family:var(--font-data);color:var(--text-heading)}
.mc-res small{font-size:var(--text-xs);color:var(--text-muted)}
.mc-ver{display:flex;flex-direction:column;gap:2px;padding:8px 0;border-bottom:1px solid var(--border-subtle)}
.mc-ver:last-child{border-bottom:0}
.mc-ver b{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-heading)}
.mc-ver span{font-size:var(--text-xs);color:var(--text-muted)}
.mc-ver p{margin:0;font-size:var(--text-xs);color:var(--text-body);white-space:pre-wrap;overflow-wrap:anywhere}
@media (max-width:640px){.mc-two{grid-template-columns:minmax(0,1fr)}.mc-results{grid-template-columns:repeat(2,minmax(0,1fr))}}
`;
