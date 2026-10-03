'use client';
// SetPrivacy — Settings › Privacy & consent (/set-privacy): the three consents the store asks customers for, kept apart
// (Nayeem's brief #16): marketing (offers by SMS / WhatsApp / email), terms & privacy (accepted at checkout) and cookies
// (the banner; analytics and ads cookies only with the visitor's OK). Each has its text and a version: saving a new text
// makes a new version (lib/consents.js), and each customer's acceptance keeps the version they saw.
// Saving, history, conflicts and the leave-page prompt come from SettingsLogic (SetChrome.jsx).

import React from 'react';
import __Link from 'next/link';
import { SettingsLogic, SetIn, SetErr, SetSw } from '@/screens/settings-console/SetChrome';
import SetFrame from '@/screens/settings-console/SetFrame';
import { CONSENT_TYPES, versionsOf, currentVersion, bumpVersion, acceptedCounts } from '@/lib/consents';
import { whoNow } from '@/lib/settingsHistory';

const URL_OK = (x) => (/^(https?:\/\/[^\s]+|\/[^\s]*)$/.test(x) ? '' : 'Enter a page address like /pages/terms or https://….');

const CSS = `
.sp-body{display:flex;flex-direction:column;gap:14px;padding:12px 16px 16px}
.sp-row{display:flex;align-items:center;gap:12px}
.sp-row__text{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;font-size:var(--text-sm);color:var(--text-heading)}
.sp-row__text small{font-size:var(--text-xs);color:var(--text-muted)}
.sp-fld{display:flex;flex-direction:column;gap:6px}
.sp-lbl{font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-heading)}
.sp-box{display:flex;align-items:center;min-height:var(--control-height);border:1px solid var(--border-field);border-radius:var(--radius-lg);background:var(--surface-card);padding:0 11px;font-size:var(--text-sm);color:var(--text-heading)}
.sp-box--area{padding:9px 11px;line-height:20px}
.sp-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 16px}
.sp-chips{display:flex;flex-wrap:wrap;gap:8px}
.sp-chip{display:inline-flex;align-items:center;gap:8px;height:32px;padding:0 10px;border:1px solid var(--border-field);border-radius:var(--radius-full);font-size:var(--text-xs);color:var(--text-body)}
.sp-ver{width:100%;border-collapse:collapse;font-size:var(--text-xs)}
.sp-ver th,.sp-ver td{padding:6px 8px;border-top:1px solid var(--border-subtle);text-align:left;vertical-align:top}
.sp-ver thead th{border-top:0;color:var(--text-muted);font-weight:var(--weight-medium)}
.sp-ver td:first-child{font-family:var(--font-data);white-space:nowrap}
.sp-ver td.sp-num{text-align:right;font-family:var(--font-data)}
.sp-tag{display:inline-flex;align-items:center;height:20px;padding:0 8px;border-radius:var(--radius-full);background:var(--fill-success-soft);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-success)}
.sp-note{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
@container setcol (max-width:559px){.sp-grid{grid-template-columns:minmax(0,1fr)}}
`;

class Component extends SettingsLogic {
  formId = 'privacy';
  savedMessage = 'Privacy settings saved';
  fields = {
    mkt_ask: { l: 'Ask for marketing consent at checkout', d: true },
    mkt_sms: { l: 'SMS', d: true },
    mkt_whatsapp: { l: 'WhatsApp', d: true },
    mkt_email: { l: 'Email', d: true },
    mkt_text: { l: 'Marketing consent text', d: CONSENT_TYPES.marketing.text, req: true, k: 'area' },
    legal_required: { l: 'Customers must accept to place an order', d: true },
    legal_text: { l: 'Terms consent text', d: CONSENT_TYPES.legal.text, req: true, k: 'area' },
    terms_url: { l: 'Terms of service page', d: '/pages/terms', req: true, check: URL_OK },
    privacy_url: { l: 'Privacy policy page', d: '/pages/privacy', req: true, check: URL_OK },
    cookie_banner: { l: 'Show the cookie banner', d: true },
    cookie_analytics: { l: 'Analytics cookies', d: true },
    cookie_ads: { l: 'Ads cookies', d: true },
    cookie_text: { l: 'Cookie banner text', d: CONSENT_TYPES.cookies.text, req: true, k: 'area' },
  };
  componentDidMount() {
    super.componentDidMount();
    // the texts start from the current versions
    const d = {};
    Object.entries(CONSENT_TYPES).forEach(([t, c]) => { d[c.field] = currentVersion(t).text; });
    Object.entries(d).forEach(([n, text]) => { if (this.fields[n]) this.fields[n] = { ...this.fields[n], d: text }; });
    this.forceUpdate();
  }
  /** A changed text is a new version of that consent. */
  afterSave(vals) {
    Object.entries(CONSENT_TYPES).forEach(([t, c]) => { if (c.field in vals) bumpVersion(t, vals[c.field], whoNow()); });
  }
  renderVals() { return { f: this.f }; }
}

function Versions({ type }) {
  const list = versionsOf(type);
  const counts = Object.fromEntries(acceptedCounts(type).map((x) => [x.v, x.count]));
  return (
    <table className="sp-ver">
      <caption className="sr-only">Versions</caption>
      <thead><tr><th scope="col">Version</th><th scope="col">Text</th><th scope="col">Since</th><th scope="col" style={{ textAlign: 'right' }}>Accepted by</th></tr></thead>
      <tbody>
        {list.map((x, i) => (
          <tr key={x.v}>
            <td>v{x.v} {i === 0 ? <span className="sp-tag">Current</span> : null}</td>
            <td>{x.text}</td>
            <td>{new Date(x.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
            <td className="sp-num">{(counts[x.v] || 0).toLocaleString('en-IN')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const Row = ({ f, n, sub }) => (
  <div className="sp-row">
    <span className="sp-row__text">{(f.def(n) || {}).l}{sub ? <small>{sub}</small> : null}</span>
    <SetSw f={f} n={n} />
  </div>
);
const Area = ({ f, n }) => (
  <div className="sp-fld">
    <label htmlFor={f.id(n)} className="sp-lbl">{(f.def(n) || {}).l}</label>
    <div className="set-box sp-box sp-box--area"><SetIn f={f} n={n} labelled rows={2} /></div>
    <SetErr f={f} n={n} />
  </div>
);
const Text = ({ f, n }) => (
  <div className="sp-fld">
    <label htmlFor={f.id(n)} className="sp-lbl">{(f.def(n) || {}).l}</label>
    <div className="set-box sp-box"><SetIn f={f} n={n} labelled /></div>
    <SetErr f={f} n={n} />
  </div>
);

export default class SetPrivacy extends Component {
  render() {
    const { f } = this.renderVals();
    const chip = (n) => (
      <label key={n} className="sp-chip"><input type="checkbox" id={f.id(n)} checked={!!f.get(n, false)} onChange={f.on(n)} />{(f.def(n) || {}).l}</label>
    );
    return (
      <SetFrame screen="SetPrivacy" active="privacy" title="Privacy & consent" tips f={f}
        about="Three separate consents: marketing messages, terms and privacy at checkout, and cookies. Each text has a version, and each customer's acceptance keeps the version they saw. Tracking consent never counts as permission to send marketing, and saying no to marketing never stops order and security messages.">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <section id="marketing" className="ix-card set-card">
          <div className="set-head set-head--top"><span style={{ display: 'block' }}><h2 className="set-title">Marketing messages</h2></span><span style={{ marginLeft: 'auto', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>v{currentVersion('marketing').v}</span></div>
          <div className="sp-body">
            <Row f={f} n="mkt_ask" sub="The box is never ticked for them." />
            <div className="sp-fld" role="group" aria-label="Channels"><span className="sp-lbl">Channels</span><div className="sp-chips">{['mkt_sms', 'mkt_whatsapp', 'mkt_email'].map(chip)}</div></div>
            <Area f={f} n="mkt_text" />
            <p className="sp-note set-help set-help--keep">Order and delivery messages are sent either way. Each customer’s answer is kept on their profile.</p>
            <Versions type="marketing" />
          </div>
        </section>
        <section id="legal" className="ix-card set-card">
          <div className="set-head set-head--top"><span style={{ display: 'block' }}><h2 className="set-title">Terms & privacy</h2></span><span style={{ marginLeft: 'auto', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>v{currentVersion('legal').v}</span></div>
          <div className="sp-body">
            <Row f={f} n="legal_required" />
            <Area f={f} n="legal_text" />
            <div className="sp-grid"><Text f={f} n="terms_url" /><Text f={f} n="privacy_url" /></div>
            <p className="sp-note set-help set-help--keep">A new text is a new version. Customers who accepted an older one are asked again at their next checkout.</p>
            <Versions type="legal" />
          </div>
        </section>
        <section id="cookies" className="ix-card set-card">
          <div className="set-head set-head--top"><span style={{ display: 'block' }}><h2 className="set-title">Cookies</h2></span><span style={{ marginLeft: 'auto', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>v{currentVersion('cookies').v}</span></div>
          <div className="sp-body">
            <Row f={f} n="cookie_banner" />
            <Row f={f} n="cookie_analytics" sub="Visit counts. Off until the visitor allows them." />
            <Row f={f} n="cookie_ads" sub="Meta, Google and TikTok pixels. Off until the visitor allows them." />
            <Area f={f} n="cookie_text" />
            <p className="sp-note">What each pixel received is on <__Link href="/event-health">Event health</__Link>.</p>
            <Versions type="cookies" />
          </div>
        </section>
      </SetFrame>
    );
  }
}
