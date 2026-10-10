'use client';
// Communications › the Campaigns tab of SMS and Email: the channel's campaigns (status, audience, when, delivered,
// opened / clicked, cost) and one side panel to make, schedule, send or read one. Copied from the merchant panel's
// Messaging campaigns (list, "Before sending" counts, results); data: lib/admin/comms.js (saveCampaign, sendCampaign,
// cancelCampaign, audiences).

import React, { useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, StatusBadge, EmptyState } from '@/components/ui';
import { KV } from '@/components/ui/IndexKit';
import { audiences, audienceBy, templateBy, primaryProvider, saveCampaign, sendCampaign, cancelCampaign, smsParts, fill, varsFor, comms, CH_LABEL } from '@/lib/admin/comms';
import { Preview, money, money2, num, pct, plural, whenText, toLocalInput, statusTone } from './commsShared';

const CSS = `
.cp-res{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-2)}
.cp-res div{display:flex;flex-direction:column;gap:2px;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-page)}
.cp-res span{font-size:var(--text-xs);color:var(--text-muted)}
.cp-res b{font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.cp-res small{font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:640px){.cp-res{grid-template-columns:repeat(2,minmax(0,1fr))}}
`;
export const CAMPAIGN_CSS = CSS;

const rate = (a, b) => (b ? (a / b) * 100 : null);

/** The table (two-line list on phones). */
export function CampaignList({ rows, ch, t, onOpen, label }) {
  return (
    <>
      <ul className="ix-plist" aria-label={label}>
        {rows.map((c) => (
          <li key={c.id}><button type="button" className="ix-pitem" onClick={() => onOpen(c.id)}>
            <span className="ix-pitem__top"><b>{c.name}</b><StatusBadge tone={statusTone(c.status)}>{c.status}</StatusBadge></span>
            <span className="ix-pitem__mid">{(audienceBy(c.audience, t) || { label: c.audience }).label} · {c.at ? whenText(c.at, t) : 'Not scheduled'}</span>
            {c.status === 'Sent' ? <span className="ix-pitem__mid">{num(c.delivered)} delivered{ch === 'email' ? ` · ${pct(rate(c.opened, c.delivered), 0)} opened` : ''} · {pct(rate(c.clicked, c.delivered), 1)} clicked</span> : null}
          </button></li>
        ))}
      </ul>
      <div className="ix-table-wrap">
        <table className="ix-table gc-table--keep">
          <caption className="sr-only">{label}</caption>
          <thead><tr>
            <th scope="col">Campaign</th><th scope="col">Status</th><th scope="col">When</th><th scope="col" className="ix-num">Sent</th><th scope="col" className="ix-num">Delivered</th>
            {ch === 'email' ? <th scope="col" className="ix-num">Opened</th> : null}<th scope="col" className="ix-num">Clicked</th><th scope="col" className="ix-num">Cost</th>
          </tr></thead>
          <tbody>
            {rows.map((c) => {
              const sent = c.status === 'Sent';
              return (
                <tr key={c.id} tabIndex={0} onClick={() => onOpen(c.id)} onKeyDown={(e) => { if (e.key === 'Enter') onOpen(c.id); }}>
                  <td><span className="cm-row__main" style={{ maxWidth: 300 }}><b>{c.name}</b><small>{(audienceBy(c.audience, t) || { label: c.audience }).label} · {c.by}</small></span></td>
                  <td><StatusBadge tone={statusTone(c.status)}>{c.status}</StatusBadge></td>
                  <td className="ix-muted" style={{ whiteSpace: 'nowrap' }}>{c.at ? whenText(c.at, t) : '—'}</td>
                  <td className="ix-num"><span className="cm-fig">{sent ? num(c.sent) : '—'}</span></td>
                  <td className="ix-num"><span className="cm-fig">{sent ? pct(rate(c.delivered, c.sent), 0) : '—'}</span></td>
                  {ch === 'email' ? <td className="ix-num"><span className="cm-fig">{sent ? pct(rate(c.opened, c.delivered), 0) : '—'}</span></td> : null}
                  <td className="ix-num"><span className="cm-fig">{sent ? pct(rate(c.clicked, c.delivered), 1) : '—'}</span></td>
                  <td className="ix-num"><span className="cm-fig">{sent ? money(c.cost) : '—'}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

/** Make, schedule, send or read one campaign. id: a campaign id, 'new', or null (closed). */
export function CampaignSheet(props) {
  // mounted per campaign, so its form starts from that campaign
  return props.id ? <CampaignForm key={props.id} {...props} /> : null;
}
function CampaignForm({ id, ch, data, t, onClose, onSaved }) {
  const c = id !== 'new' ? data.campaigns.find((x) => x.id === id) : null;
  const [f, setF] = useState(() => {
    const tpls = data.templates.filter((x) => x.ch === ch && x.status === 'Active');
    return c ? { name: c.name, audience: c.audience, tpl: c.tpl, lang: c.lang || 'en', when: c.status === 'Scheduled' ? 'later' : 'draft', at: c.at }
      : { name: '', audience: ch === 'sms' ? 'trials-ending' : 'leads', tpl: (tpls.find((x) => x.purpose === 'promo') || tpls[0] || {}).id || '', lang: 'en', when: 'draft', at: null };
  });
  const [err, setErr] = useState('');
  const auds = useMemo(() => audiences(t), []); // eslint-disable-line react-hooks/exhaustive-deps
  if (id !== 'new' && !c) return null;

  const sent = c && c.status === 'Sent';
  const tpl = templateBy(data, f.tpl);
  const au = auds.find((a) => a.key === f.audience);
  const n = au ? (f.audience === 'leads' && ch === 'email' ? au.list.length + 1200 : au.list.length) : 0;
  const v = varsFor(au && au.list[0], t);
  const side = tpl ? (tpl[f.lang] && tpl[f.lang].body ? tpl[f.lang] : tpl.en) : { subject: '', body: '' };
  const parts = ch === 'sms' ? smsParts(fill(side.body, v)).parts : 1;
  const prov = primaryProvider(data, ch);
  const cost = prov ? n * parts * prov.rate : 0;
  const set = (p) => { setF((x) => ({ ...x, ...p })); setErr(''); };

  const save = (mode) => {
    const res = saveCampaign({ id: c ? c.id : null, ch, name: f.name, audience: f.audience, tpl: f.tpl, lang: f.lang, at: f.at, schedule: mode === 'later' });
    if (!res.ok) { setErr(res.error); return null; }
    return res.id;
  };
  const doSave = () => { const nid = save('draft'); if (nid) { toast('Draft saved'); onSaved && onSaved(nid); onClose(); } };
  const doSchedule = () => { const nid = save('later'); if (nid) { toast(`Scheduled for ${whenText(f.at, t)}`); onClose(); } };
  const doSend = async () => {
    if (!n) { setErr('Nobody is in this audience right now.'); return; }
    if (prov && cost > prov.balance) { setErr(`${prov.name} has ${money(prov.balance)}; this needs about ${money(cost)}. Top up first.`); return; }
    const ok = await confirmDialog({ title: `Send to ${num(n)} ${au && au.key.includes('lead') ? 'leads' : 'merchants'}?`, body: `It costs about ${money2(cost)} through ${prov ? prov.name : 'the provider'}. It can’t be stopped once it starts.`, confirmLabel: 'Send now' });
    if (!ok) return;
    const nid = save('draft'); if (!nid) return;
    const res = sendCampaign(nid);
    if (!res.ok) { setErr(res.error); return; }
    toast(`Campaign sent to ${num(res.sent)} · ${money(res.cost)}`);
    onClose();
  };
  const unschedule = () => { const r = cancelCampaign(c.id); if (r.ok) toast('Moved back to draft'); else toast(r.error, { tone: 'error' }); onClose(); };

  if (sent) {
    return (
      <Sheet open title={c.name} onClose={onClose} footer={<button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Close</button>}>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="cm-form">
          <div className="cp-res" aria-label="Results">
            <div><span>Sent</span><b>{num(c.sent)}</b></div>
            <div><span>Delivered</span><b>{num(c.delivered)}</b><small>{pct(rate(c.delivered, c.sent))}</small></div>
            <div><span>Failed</span><b>{num(c.failed)}</b></div>
            {ch === 'email' ? <div><span>Opened</span><b>{num(c.opened)}</b><small>{pct(rate(c.opened, c.delivered))}</small></div> : null}
            <div><span>Clicked</span><b>{num(c.clicked)}</b><small>{pct(rate(c.clicked, c.delivered))}</small></div>
            <div><span>Sign-ups</span><b>{num(c.signups)}</b></div>
          </div>
          <KV rows={[['Audience', (audienceBy(c.audience, t) || { label: c.audience }).label], ['Sent', whenText(c.at, t)], ['Template', tpl ? tpl.name : c.tpl], ['Language', c.lang === 'bn' ? 'বাংলা' : 'English'], ['Cost', money(c.cost)], ['By', c.by], ['ID', <span key="i" className="cm-id">{c.id}</span>]]} />
          <Preview ch={ch} subject={side.subject} body={side.body} vars={varsFor(null, t)} lang={c.lang} />
        </div>
      </Sheet>
    );
  }

  const later = f.when === 'later';
  return (
    <Sheet open title={c ? c.name : `New ${CH_LABEL[ch]} campaign`} onClose={onClose}
      footer={<>
        {c && c.status === 'Scheduled' ? <button type="button" className="gc-btn gc-btn--flat" onClick={unschedule}>Back to draft</button> : null}
        <button type="button" className="gc-btn gc-btn--neutral" onClick={doSave}>Save draft</button>
        {later ? <button type="button" className="gc-btn gc-btn--solid" onClick={doSchedule}>Schedule</button> : <button type="button" className="gc-btn gc-btn--solid" onClick={doSend}>Send now</button>}
      </>}>
      <div className="cm-form">
        <div className="cm-field"><label className="gc-label" htmlFor="cp-name">Name</label><input id="cp-name" data-autofocus className="gc-input" value={f.name} placeholder="e.g. Puja offer for new shops" onChange={(e) => set({ name: e.target.value })} /></div>
        <div className="cm-field">
          <label className="gc-label" htmlFor="cp-aud">Who gets it</label>
          <select id="cp-aud" className="gc-input gc-select" value={f.audience} onChange={(e) => set({ audience: e.target.value })}>
            {auds.map((a) => <option key={a.key} value={a.key}>{a.label} ({a.key === 'leads' && ch === 'email' ? a.list.length + 1200 : a.list.length})</option>)}
          </select>
          <p className="gc-help">{au ? au.note : ''}{f.audience === 'leads' && ch === 'email' ? ' · includes the website’s newsletter sign-ups' : ''}</p>
        </div>
        <div className="cm-two">
          <div className="cm-field">
            <label className="gc-label" htmlFor="cp-tpl">Template</label>
            <select id="cp-tpl" className="gc-input gc-select" value={f.tpl} onChange={(e) => set({ tpl: e.target.value })}>
              {data.templates.filter((x) => x.ch === ch && (x.status === 'Active' || x.id === f.tpl)).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </div>
          <div className="cm-field">
            <span className="gc-label">Language</span>
            <div className="ix-chips" role="group" aria-label="Language">{[['en', 'English'], ['bn', 'বাংলা']].map(([k, l]) => <button key={k} type="button" className="ix-chip" aria-pressed={f.lang === k} onClick={() => set({ lang: k })}>{l}</button>)}</div>
          </div>
        </div>
        <Preview ch={ch} subject={side.subject} body={side.body} vars={v} lang={f.lang} from={ch === 'sms' && prov ? prov.sender : undefined} />
        <div className="cm-field">
          <span className="gc-label">When</span>
          <div className="ix-chips" role="group" aria-label="When">
            <button type="button" className="ix-chip" aria-pressed={!later} onClick={() => set({ when: 'draft' })}>Send now</button>
            <button type="button" className="ix-chip" aria-pressed={later} onClick={() => set({ when: 'later', at: f.at || comms.now() + DAYMS })}>At a time</button>
          </div>
          {later ? <input type="datetime-local" aria-label="Date and time" className="gc-input" value={toLocalInput(f.at)} onChange={(e) => set({ at: new Date(e.target.value).getTime() || null })} /> : null}
        </div>
        <div className="cm-total">
          <dl className="ix-sum">
            <dt>Recipients</dt><dd>{num(n)}</dd>
            {ch === 'sms' ? <><dt>SMS each</dt><dd>{parts}</dd></> : null}
            <dt className="is-total">Cost, about</dt><dd className="is-total">{money2(cost)}</dd>
          </dl>
          <span className="cm-count"><span>{prov ? `${prov.name} · balance ${money(prov.balance)}` : `No ${CH_LABEL[ch]} provider is on`}</span></span>
        </div>
        {err ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}><Icon name="circle-alert" width="14" height="14" aria-hidden="true" /> {err}</p> : null}
      </div>
    </Sheet>
  );
}
const DAYMS = 864e5;

/** The Campaigns tab body: the list, its empty state, and the side panel. */
export function CampaignsPanel({ ch, data, t, open, setOpen }) {
  const rows = data.campaigns.filter((c) => c.ch === ch);
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {rows.length ? <CampaignList rows={rows} ch={ch} t={t} onOpen={setOpen} label={`${CH_LABEL[ch]} campaigns`} />
        : <div className="ix-empty"><EmptyState icon="megaphone" title="No campaigns yet." actionLabel="New campaign" onAction={() => setOpen('new')} /></div>}
      <div className="ix-foot"><span>{plural(rows.length, 'campaign')} · {num(rows.filter((c) => c.status === 'Sent').reduce((a, c) => a + c.sent, 0))} {ch === 'sms' ? 'SMS' : 'emails'} sent</span></div>
      <CampaignSheet id={open} ch={ch} data={data} t={t} onClose={() => setOpen(null)} />
    </>
  );
}
