'use client';
// Grid AI › Behaviour — how the AI answers and what it may say. One page, one Save:
//   AI replies       shop default Auto / Assist / Off, per channel, office hours, what it may answer alone, hand-over
//   Voice            business, tone, language (Bangla / English / Banglish), how to address customers
//   Hours & contact  working and support hours, contact, escalation contacts
//   Delivery & pay   areas, time, payment methods, the largest discount the AI may mention
//   Rules            refund, return, warranty, escalation
//   Limits           restricted topics, never promise, never disclose, stock / price / links / alternatives
//   Products         suggestions: on, how many, price, image, link, stock
//   Permissions      who may do what with Grid AI (lib/permissions.js)
// Data: lib/gridai/profile.js (voice, rules, limits, products) and lib/aiReply.js (replies, hours, channels).
// Editing needs "Configure Grid AI"; choosing Auto also needs "Enable auto reply".

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { InfoTip, StatusBadge } from '@/components/ui';
import { ShopHeader, LearnMore } from '@/components/ui/IndexKit';
import { toast, confirmDialog } from '@/runtime/ui';
import { currentUser, USERS, roleTitles } from '@/lib/team';
import { can, why, PERMISSIONS, permsOf, setPerm, changedFor, resetPerms, PERMS_EVENT } from '@/lib/permissions';
import { getAiSettings, saveAiSettings, AI_INTENTS, AI_CONTROLS, shopControl } from '@/lib/aiReply';
import { getProfile, saveProfile, resetProfile, TONES, LANGS, BANGLISH, ADDRESSING, paymentMethods } from '@/lib/gridai/profile';
import { logAi } from '@/lib/gridai/activity';
import { GaFrame, Switch, Field } from './gaShared';

const CSS = `
.bh-sec{scroll-margin-top:80px}
.bh-head{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-subtle)}
.bh-head h2{display:flex;align-items:center;gap:6px;margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.bh-chans{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.bh-chans li{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:48px;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-heading)}
.bh-chans li:first-child{border-top:0}
.bh-chans li>span{flex:1;min-width:0}
.ga-field .bh-chans select.gc-input{width:220px;flex:none}
.bh-checks{display:flex;flex-wrap:wrap;gap:var(--space-1) var(--space-5)}
.bh-checks label{display:inline-flex;align-items:center;gap:8px;min-height:36px;font-size:var(--text-sm);color:var(--text-body);cursor:pointer}
.bh-days{display:flex;flex-wrap:wrap;gap:6px}
.bh-days button{min-width:44px;height:36px;padding:0 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-size:var(--text-xs);color:var(--text-body);cursor:pointer}
.bh-days button[aria-pressed="true"]{border-color:var(--primary);background:var(--fill-primary-soft);color:var(--primary);font-weight:var(--weight-medium)}
.bh-perm-wrap{overflow-x:auto}
.bh-perm{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.bh-perm th,.bh-perm td{padding:8px 10px;border-top:1px solid var(--border-subtle);text-align:center;white-space:nowrap}
.bh-perm th:first-child,.bh-perm td:first-child{text-align:left;position:sticky;left:0;background:var(--surface-card)}
.bh-perm thead th{border-top:0;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);white-space:normal;min-width:88px;vertical-align:bottom}
.bh-perm td small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.bh-save{position:sticky;bottom:calc(12px + var(--host-badge, 0px));z-index:20;display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3) var(--space-2) var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-lg);font-size:var(--text-sm);color:var(--text-heading)}
.bh-save>span{margin-right:auto;display:flex;align-items:center;gap:8px}
@media (max-width:640px){.bh-chans li{flex-direction:column;align-items:stretch;gap:var(--space-1);padding-block:var(--space-2)}.ga-field .bh-chans select.gc-input{width:100%}}
`;

const CHANNELS = [['facebook', 'Facebook Messenger'], ['instagram', 'Instagram messages'], ['whatsapp', 'WhatsApp'], ['web', 'Website chat'], ['email', 'Email'], ['comments', 'Facebook & Instagram comments']];
const DAY_NAMES = [[6, 'Sat'], [0, 'Sun'], [1, 'Mon'], [2, 'Tue'], [3, 'Wed'], [4, 'Thu'], [5, 'Fri']];

export default function Behaviour() {
  const [base, setBase] = useState(null);     // { p, ai } as saved
  const [p, setP] = useState(null);
  const [ai, setAi] = useState(null);
  const [me, setMe] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const load = () => { const pp = getProfile(), aa = getAiSettings(); setBase({ p: pp, ai: aa }); setP(pp); setAi(aa); setMe(currentUser()); };
    load();
    const perms = () => setTick((t) => t + 1);
    window.addEventListener(PERMS_EVENT, perms);
    return () => window.removeEventListener(PERMS_EVENT, perms);
  }, []);

  const ready = !!(p && ai && me);
  const mayEdit = ready && can(me, 'ai-configure');
  const mayAuto = ready && can(me, 'ai-autoreply');
  const dirty = ready && (JSON.stringify(p) !== JSON.stringify(base.p) || JSON.stringify(ai) !== JSON.stringify(base.ai));
  const put = (k, v) => setP((x) => ({ ...x, [k]: v }));
  const putProd = (k, v) => setP((x) => ({ ...x, products: { ...x.products, [k]: v } }));
  const inp = (k) => ({ id: 'bh-' + k, value: p[k] == null ? '' : p[k], disabled: !mayEdit, onChange: (e) => put(k, e.target.value) });
  const pick = (k, opts) => <select className="gc-input gc-select" {...inp(k)}>{opts.map((o) => (Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o} value={o}>{o}</option>))}</select>;
  const area = (k, rows = 3) => <textarea className="gc-input ga-area" rows={rows} {...inp(k)} />;

  const shop = ready ? shopControl(ai) : 'assist';
  const setShop = (m) => {
    if (m === 'auto' && !mayAuto) { toast(why('ai-autoreply'), { tone: 'info' }); return; }
    setAi((a) => ({ ...a, mode: m === 'off' ? 'off' : m === 'assist' ? 'suggest' : a.mode === 'auto' ? 'auto' : 'auto-hours' }));
  };
  const setChannel = (ch, m) => {
    if (m === 'auto' && !mayAuto) { toast(why('ai-autoreply'), { tone: 'info' }); return; }
    setAi((a) => { const c = { ...(a.channels || {}) }; if (m) c[ch] = m; else delete c[ch]; return { ...a, channels: c }; });
  };
  const toggleIntent = (k) => setAi((a) => ({ ...a, intents: a.intents.includes(k) ? a.intents.filter((x) => x !== k) : [...a.intents, k] }));
  const toggleDay = (d) => setAi((a) => { const days = a.hours.days.includes(d) ? a.hours.days.filter((x) => x !== d) : [...a.hours.days, d]; return { ...a, hours: { ...a.hours, days } }; });

  const save = () => {
    const changes = {};
    Object.keys(p).forEach((k) => { if (JSON.stringify(p[k]) !== JSON.stringify(base.p[k])) changes[k] = p[k]; });
    if (Object.keys(changes).length) saveProfile(changes, me.name);
    if (JSON.stringify(ai) !== JSON.stringify(base.ai)) { saveAiSettings(ai); logAi({ kind: 'settings', title: 'AI replies changed', detail: 'Shop default: ' + shopControl(ai), by: me.name }); }
    setBase({ p, ai }); toast('Behaviour saved. The AI uses it from the next message.');
  };
  const discard = () => { setP(base.p); setAi(base.ai); };
  const reset = async () => {
    if (!(await confirmDialog({ title: 'Go back to the shop settings?', body: 'Voice, rules, limits and product suggestions return to what your shop settings say. AI replies and permissions don’t change.', confirmLabel: 'Reset' }))) return;
    resetProfile(me.name); const pp = getProfile(); setP(pp); setBase((b) => ({ ...b, p: pp })); toast('Back to the shop settings.');
  };

  return (
    <GaFrame screen="Behaviour" active="ai-behaviour" page="Behaviour" css={CSS}>
      <ShopHeader icon="sliders-horizontal" title="Behaviour"
        about="How Grid AI answers your customers and what it may say: reply mode per channel, office hours, voice and language, your rules, the limits it must keep, product suggestions and who may change Grid AI. Customers can never change these — only people with permission."
        secondary={[{ label: 'Reset to shop settings', onClick: reset }]}
        more={[{ label: 'Knowledge', href: '/ai-knowledge' }, { label: 'AI provider and budget', href: '/set-ai' }]}
        primary={{ label: 'Save', onClick: save, disabled: !dirty || !mayEdit }} />

      {!ready ? <div style={{ minHeight: 300 }} aria-busy="true" /> : (<>
        {!mayEdit ? <p className="ga-locked" style={{ margin: 0 }}><Icon name="lock" width="13" height="13" aria-hidden="true" />{why('ai-configure')}</p> : null}

        {/* ---- AI replies ---- */}
        <section id="replies" className="ix-card bh-sec" aria-labelledby="bh-replies-h">
          <div className="bh-head"><h2 id="bh-replies-h">AI replies <InfoTip text="Auto: the AI answers simple questions by itself and hands the rest to a person. Assist: the AI writes a reply, a person sends it. Off: the AI stays out. Each conversation can be changed in the Inbox." /></h2><StatusBadge tone={shop === 'auto' ? 'success' : shop === 'assist' ? 'info' : 'neutral'}>{'Shop default: ' + AI_CONTROLS.find((c) => c[0] === shop)[1]}</StatusBadge></div>
          <div className="ga-body">
            <div className="gc-seg" role="group" aria-label="Shop default">
              {AI_CONTROLS.map(([k, l]) => <button key={k} type="button" disabled={!mayEdit} className={'gc-seg__btn' + (shop === k ? ' gc-seg__btn--active' : '')} aria-pressed={shop === k} onClick={() => setShop(k)}>{l}</button>)}
            </div>
            {shop === 'auto' ? <div className="ga-sw"><span>Auto also outside office hours<small>Off: outside office hours the AI only suggests, so nobody is surprised.</small></span><Switch on={ai.mode === 'auto'} disabled={!mayEdit} label="Auto also outside office hours" onToggle={() => setAi((a) => ({ ...a, mode: a.mode === 'auto' ? 'auto-hours' : 'auto' }))} /></div> : null}
            <div className="ga-field"><span className="gc-label">Per channel</span>
              <ul className="bh-chans">{CHANNELS.map(([k, l]) => (
                <li key={k}><span>{l}</span>
                  <select className="gc-input gc-select" aria-label={l} disabled={!mayEdit} value={(ai.channels || {})[k] || ''} onChange={(e) => setChannel(k, e.target.value)}>
                    <option value="">{'Shop default (' + AI_CONTROLS.find((c) => c[0] === shop)[1] + ')'}</option>
                    {AI_CONTROLS.map(([c, cl]) => <option key={c} value={c}>{cl}</option>)}
                  </select>
                </li>
              ))}</ul>
            </div>
            <div className="ga-row">
              <Field label="Office hours" htmlFor="bh-from">
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input id="bh-from" type="time" className="gc-input" disabled={!mayEdit} value={ai.hours.from} onChange={(e) => setAi((a) => ({ ...a, hours: { ...a.hours, from: e.target.value } }))} />
                  <span className="ix-muted">to</span>
                  <input type="time" aria-label="Office hours end" className="gc-input" disabled={!mayEdit} value={ai.hours.to} onChange={(e) => setAi((a) => ({ ...a, hours: { ...a.hours, to: e.target.value } }))} />
                </span>
              </Field>
              <Field label="Hand to a person after" htmlFor="bh-esc" help="AI replies without solving it">
                <select id="bh-esc" className="gc-input gc-select" disabled={!mayEdit} value={ai.escalateAfter} onChange={(e) => setAi((a) => ({ ...a, escalateAfter: +e.target.value }))}>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n === 1 ? '1 AI reply' : n + ' AI replies'}</option>)}</select>
              </Field>
            </div>
            <div className="ga-field"><span className="gc-label">Work days</span>
              <div className="bh-days" role="group" aria-label="Work days">{DAY_NAMES.map(([d, l]) => <button key={d} type="button" disabled={!mayEdit} aria-pressed={ai.hours.days.includes(d)} onClick={() => toggleDay(d)}>{l}</button>)}</div>
            </div>
            <div className="ga-field"><span className="gc-label">What the AI may answer by itself <InfoTip text="In Auto, questions not ticked here get a suggested reply for a person to send." /></span>
              <div className="bh-checks">{AI_INTENTS.map(([k, l]) => <label key={k}><input type="checkbox" className="gc-check" disabled={!mayEdit} checked={ai.intents.includes(k)} onChange={() => toggleIntent(k)} />{l}</label>)}</div>
            </div>
          </div>
        </section>

        {/* ---- voice ---- */}
        <section id="voice" className="ix-card bh-sec" aria-labelledby="bh-voice-h">
          <div className="bh-head"><h2 id="bh-voice-h">Voice</h2></div>
          <div className="ga-body">
            <div className="ga-row">
              <Field label="Business name" htmlFor="bh-businessName"><input className="gc-input" {...inp('businessName')} /></Field>
              <Field label="Business type" htmlFor="bh-businessType"><input className="gc-input" {...inp('businessType')} placeholder="For example: online fashion shop" /></Field>
              <Field label="Brand tone" htmlFor="bh-tone">{pick('tone', TONES)}</Field>
              <Field label="How to address customers" htmlFor="bh-addressing">{pick('addressing', ADDRESSING)}</Field>
              <Field label="Preferred language" htmlFor="bh-language">{pick('language', LANGS)}</Field>
              <Field label="When the customer writes Banglish" htmlFor="bh-banglish" help="Banglish is Bangla written in English letters, like “dam koto?”">{pick('banglish', BANGLISH)}</Field>
            </div>
          </div>
        </section>

        {/* ---- hours & contact ---- */}
        <section id="hours" className="ix-card bh-sec" aria-labelledby="bh-hours-h">
          <div className="bh-head"><h2 id="bh-hours-h">Hours & contact</h2></div>
          <div className="ga-body">
            <div className="ga-row">
              <Field label="Working hours" htmlFor="bh-workingHours" help="What the AI tells customers"><input className="gc-input" {...inp('workingHours')} /></Field>
              <Field label="Support hours" htmlFor="bh-supportHours"><input className="gc-input" {...inp('supportHours')} /></Field>
              <Field label="Contact information" htmlFor="bh-contactInfo"><input className="gc-input" {...inp('contactInfo')} /></Field>
              <Field label="Escalation contacts" htmlFor="bh-escalationContacts" help="Shared when a customer asks for a manager"><input className="gc-input" {...inp('escalationContacts')} /></Field>
            </div>
          </div>
        </section>

        {/* ---- delivery & payments ---- */}
        <section id="delivery" className="ix-card bh-sec" aria-labelledby="bh-delivery-h">
          <div className="bh-head"><h2 id="bh-delivery-h">Delivery & payments <InfoTip text="Filled from Settings › Delivery and Payments. Change the words here; the charges themselves stay in Settings." /></h2></div>
          <div className="ga-body">
            <div className="ga-row">
              <Field label="Delivery areas" htmlFor="bh-deliveryAreas">{area('deliveryAreas', 2)}</Field>
              <Field label="Expected delivery time" htmlFor="bh-deliveryTime">{area('deliveryTime', 2)}</Field>
            </div>
            <div className="ga-field"><span className="gc-label">Payment methods the AI mentions</span>
              <div className="bh-checks">{[...new Set([...paymentMethods(), ...p.payments, 'Rocket'])].map((m) => <label key={m}><input type="checkbox" className="gc-check" disabled={!mayEdit} checked={p.payments.includes(m)} onChange={() => put('payments', p.payments.includes(m) ? p.payments.filter((x) => x !== m) : [...p.payments, m])} />{m}</label>)}</div>
            </div>
            <Field label="Largest discount the AI may mention (৳)" htmlFor="bh-maxDiscount" help="Anything bigger becomes an approval request.">
              <input className="gc-input" inputMode="numeric" style={{ maxWidth: 200 }} {...inp('maxDiscount')} onChange={(e) => put('maxDiscount', +e.target.value.replace(/[^\d]/g, '') || 0)} />
            </Field>
          </div>
        </section>

        {/* ---- rules ---- */}
        <section id="rules" className="ix-card bh-sec" aria-labelledby="bh-rules-h">
          <div className="bh-head"><h2 id="bh-rules-h">Rules</h2></div>
          <div className="ga-body">
            <div className="ga-row">
              <Field label="Refund rules" htmlFor="bh-refundRules">{area('refundRules')}</Field>
              <Field label="Return rules" htmlFor="bh-returnRules">{area('returnRules')}</Field>
              <Field label="Warranty rules" htmlFor="bh-warrantyRules">{area('warrantyRules')}</Field>
              <Field label="When to hand to a person" htmlFor="bh-escalationRules">{area('escalationRules')}</Field>
            </div>
          </div>
        </section>

        {/* ---- limits ---- */}
        <section id="limits" className="ix-card bh-sec" aria-labelledby="bh-limits-h">
          <div className="bh-head"><h2 id="bh-limits-h">Limits <InfoTip text="The AI keeps these even if a customer asks it to do otherwise." /></h2></div>
          <div className="ga-body">
            <div className="ga-row">
              <Field label="Topics to avoid" htmlFor="bh-restrictedTopics">{area('restrictedTopics', 2)}</Field>
              <Field label="Never promise" htmlFor="bh-neverPromise">{area('neverPromise', 2)}</Field>
              <Field label="Never share" htmlFor="bh-neverDisclose">{area('neverDisclose', 2)}</Field>
            </div>
            <div>
              {[['showPrice', 'Show product prices'], ['showStockQty', 'Show the exact stock number', 'Off: the AI says “in stock” or “few left” instead.'], ['shareLinks', 'Share product links'], ['suggestAlternatives', 'Suggest other products when one is out of stock']].map(([k, l, sub]) => (
                <div key={k} className="ga-sw"><span>{l}{sub ? <small>{sub}</small> : null}</span><Switch on={!!p[k]} disabled={!mayEdit} label={l} onToggle={() => put(k, !p[k])} /></div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- product suggestions ---- */}
        <section id="products" className="ix-card bh-sec" aria-labelledby="bh-products-h">
          <div className="bh-head"><h2 id="bh-products-h">Product suggestions</h2></div>
          <div className="ga-body">
            <div className="ga-sw"><span>Let the AI suggest products<small>From your catalogue: what the customer asks for, budget, colour, category and what is in stock.</small></span><Switch on={p.products.allow} disabled={!mayEdit} label="Let the AI suggest products" onToggle={() => putProd('allow', !p.products.allow)} /></div>
            {p.products.allow ? (<>
              <Field label="Products per suggestion" htmlFor="bh-pmax">
                <select id="bh-pmax" className="gc-input gc-select" style={{ maxWidth: 200 }} disabled={!mayEdit} value={p.products.max} onChange={(e) => putProd('max', +e.target.value)}>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}</select>
              </Field>
              <div className="bh-checks">{[['price', 'Price'], ['image', 'Image'], ['link', 'Link'], ['stock', 'Stock status']].map(([k, l]) => <label key={k}><input type="checkbox" className="gc-check" disabled={!mayEdit} checked={!!p.products[k]} onChange={() => putProd(k, !p.products[k])} />{'Include ' + l.toLowerCase()}</label>)}</div>
            </>) : null}
          </div>
        </section>

        {/* ---- permissions ---- */}
        <section id="perms" className="ix-card bh-sec" aria-labelledby="bh-perms-h" data-tick={tick}>
          <div className="bh-head"><h2 id="bh-perms-h">Permissions <InfoTip text="Each role has these by default. Tick or untick to change one person. Saved at once." /></h2>{USERS.some((u) => changedFor(u.id)) ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" disabled={!mayEdit} onClick={() => { resetPerms(); logAi({ kind: 'settings', title: 'Permissions back to role defaults', by: me.name }); toast('Permissions are back to the role defaults.'); }}>Back to role defaults</button> : null}</div>
          <div className="bh-perm-wrap">
            <table className="bh-perm gc-table--keep">
              <caption className="sr-only">Grid AI permissions per person</caption>
              <thead><tr><th scope="col">Person</th>{PERMISSIONS.map(([id, l, d]) => <th key={id} scope="col" title={d}>{l}</th>)}</tr></thead>
              <tbody>
                {USERS.map((u) => (
                  <tr key={u.id}>
                    <td><b style={{ fontWeight: 'var(--weight-medium)' }}>{u.name}</b><small>{roleTitles(u).join(', ')}{changedFor(u.id) ? ' · changed' : ''}</small></td>
                    {PERMISSIONS.map(([id, l]) => <td key={id}><input type="checkbox" className="gc-check" aria-label={l + ': ' + u.name} disabled={!mayEdit || (u.id === me.id && id === 'ai-configure')} checked={permsOf(u).includes(id)} onChange={(e) => { setPerm(u.id, id, e.target.checked); logAi({ kind: 'settings', title: (e.target.checked ? 'Gave ' : 'Took ') + '“' + l + '”' + (e.target.checked ? ' to ' : ' from ') + u.name, by: me.name }); }} /></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {dirty ? (
          <div className="bh-save" role="region" aria-label="Unsaved changes">
            <span><Icon name="circle-dot" width="14" height="14" aria-hidden="true" />Unsaved changes</span>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={discard}>Discard</button>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={save} disabled={!mayEdit}>Save</button>
          </div>
        ) : null}
        <LearnMore topic="Grid AI behaviour" />
      </>)}
    </GaFrame>
  );
}

