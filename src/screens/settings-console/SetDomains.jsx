'use client';
// SetDomains — Settings › Domains (/set-domains): the store's free GridCommerce address (<name>.gridcommerce.com.bd) and
// custom domains (lib/domains.js). Adding a domain shows the DNS records to add at the registrar; "Check now" verifies
// them, then the SSL certificate is issued. A verified domain with SSL can be made primary (customers are sent there).
// Demo: checks move on with the clock; ?dns=failed makes the next check fail.

import React from 'react';
import { DCLogic, Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Dialog, StatusBadge } from '@/components/ui';
import SetFrame from '@/screens/settings-console/SetFrame';
import { getDomains, addDomain, checkDomain, makePrimary, primaryToSub, removeDomain, subdomainOf, setSubdomain, SUBDOMAIN_BASE, DOMAINS_EVENT } from '@/lib/domains';

const CSS = `
.sd-row{display:flex;align-items:center;gap:12px;padding:12px 16px;border-top:1px solid var(--border-subtle)}
.sd-row:first-of-type{border-top:0}
.sd-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.sd-host{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);overflow-wrap:anywhere}
.sd-sub{font-size:var(--text-xs);color:var(--text-muted)}
.sd-acts{display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-end}
.sd-recs{margin:0 16px 14px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:auto}
.sd-recs table{width:100%;border-collapse:collapse;font-size:var(--text-xs)}
.sd-recs th,.sd-recs td{padding:7px 10px;border-top:1px solid var(--border-subtle);text-align:left;white-space:nowrap}
.sd-recs thead th{border-top:0;background:var(--surface-subtle);color:var(--text-muted);font-weight:var(--weight-medium)}
.sd-recs td{font-family:var(--font-data);color:var(--text-heading)}
.sd-recs button{border:0;background:none;padding:0;font:inherit;color:var(--text-link);cursor:pointer}
.sd-form{display:flex;flex-direction:column;gap:8px}
.sd-lbl{display:flex;flex-direction:column;gap:6px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-heading)}
.sd-inline{display:flex;align-items:center;gap:6px}
.sd-inline .gc-input{flex:1;min-width:0}
.sd-suffix{flex:none;font-size:var(--text-sm);color:var(--text-muted)}
.sd-err{margin:0;font-size:var(--text-xs);color:var(--text-danger)}
.sd-empty{margin:0;padding:12px 16px 16px;font-size:var(--text-sm);color:var(--text-muted)}
@media (max-width:640px){.sd-row{flex-wrap:wrap}.sd-acts{justify-content:flex-start}}
`;

const STATE = { pending: ['Records not checked', 'neutral'], verifying: ['Checking DNS', 'info'], verified: ['Verified', 'success'], failed: ['Records not found', 'error'] };
const SSL = { none: null, provisioning: ['SSL being issued', 'info'], active: ['SSL active', 'success'], error: ['SSL failed', 'error'] };

export default class SetDomains extends DCLogic {
  constructor(p) { super(p); this.state = { list: [], sub: 'gridshop', add: null, edit: null, open: '' }; }
  componentDidMount() {
    this.read = () => this.setState({ list: getDomains(), sub: subdomainOf() });
    this.read();
    window.addEventListener(DOMAINS_EVENT, this.read);
    // the check moves with the clock: refresh while something is in progress
    this.timer = setInterval(() => { if (this.state.list.some((d) => d.state === 'verifying' || d.ssl === 'provisioning')) this.read(); }, 5000);
  }
  componentWillUnmount() { window.removeEventListener(DOMAINS_EVENT, this.read); clearInterval(this.timer); }

  doAdd = () => {
    const err = addDomain(this.state.add.host);
    if (err) { this.setState({ add: { ...this.state.add, err } }); return; }
    const host = this.state.add.host.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
    this.setState({ add: null, open: host });
    toast('Domain added. Add the DNS records, then check.');
  };
  doSub = () => {
    const err = setSubdomain(this.state.edit.name);
    if (err) { this.setState({ edit: { ...this.state.edit, err } }); return; }
    this.setState({ edit: null });
    toast('Address changed');
  };
  check = (h) => { checkDomain(h); toast('Checking DNS. This takes a minute.'); };
  primary = (h) => { const e = makePrimary(h); toast(e || 'Primary domain changed', e ? { tone: 'error' } : undefined); };
  remove = async (d) => {
    if (await confirmDialog({ title: `Remove ${d.host}?`, body: d.primary ? `Customers will go to ${this.state.sub}.${SUBDOMAIN_BASE} instead.` : 'Customers using this address won’t reach the store.', confirmLabel: 'Remove domain', tone: 'danger' })) {
      removeDomain(d.host); toast('Domain removed');
    }
  };
  copy = (text) => { if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast('Copied'), () => {}); };

  render() {
    const { list, sub, add, edit, open } = this.state;
    const primary = list.find((d) => d.primary);
    const subHost = sub + '.' + SUBDOMAIN_BASE;
    return (
      <SetFrame screen="SetDomains" active="domains" title="Domains" meta={'Customers go to ' + (primary ? primary.host : subHost)}
        about="The store's web addresses: the free GridCommerce address and your own domains. Add the DNS records your domain needs, check them, and the SSL certificate is issued. The primary domain is the one customers are sent to.">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <section className="ix-card set-card" aria-label="GridCommerce address">
          <div className="set-head set-head--top"><span style={{ display: 'block' }}><h2 className="set-title">GridCommerce address</h2></span></div>
          <div className="sd-row">
            <div className="sd-main">
              <span className="sd-host">{subHost}{!primary ? <StatusBadge tone="primary">Primary</StatusBadge> : null}<StatusBadge tone="success">SSL active</StatusBadge></span>
              <span className="sd-sub">Free, always works{primary ? ' and sends customers to ' + primary.host : ''}.</span>
            </div>
            <div className="sd-acts">
              {primary ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => { primaryToSub(); toast('Primary domain changed'); }}>Make primary</button> : null}
              <button type="button" className="ix-btn ix-btn--sm" onClick={() => this.setState({ edit: { name: sub, err: '' } })}>Change</button>
            </div>
          </div>
        </section>

        <section className="ix-card set-card" aria-label="Custom domains">
          <div className="set-head set-head--top">
            <span style={{ display: 'block' }}><h2 className="set-title">Custom domains</h2></span>
            <span style={{ marginLeft: 'auto' }}><button type="button" className="ix-btn ix-btn--sm" onClick={() => this.setState({ add: { host: '', err: '' } })}><Icon name="plus" width="14" height="14" aria-hidden="true" />Connect domain</button></span>
          </div>
          {list.length ? list.map((d) => {
            const st = STATE[d.state] || STATE.pending;
            const ssl = SSL[d.ssl];
            const showRecs = open === d.host || d.state === 'pending' || d.state === 'failed';
            return (
              <React.Fragment key={d.host}>
                <div className="sd-row">
                  <div className="sd-main">
                    <span className="sd-host">{d.host}{d.primary ? <StatusBadge tone="primary">Primary</StatusBadge> : null}<StatusBadge tone={st[1]}>{st[0]}</StatusBadge>{ssl ? <StatusBadge tone={ssl[1]}>{ssl[0]}</StatusBadge> : null}</span>
                    <span className="sd-sub">{d.state === 'failed' ? 'We couldn’t find the records below. DNS changes can take up to 24 hours.' : d.state === 'verified' && d.ssl === 'active' ? 'Ready.' : d.state === 'verified' ? 'Verified. The certificate takes a minute.' : d.state === 'verifying' ? 'Checking the records…' : 'Add these records where you bought the domain, then check.'}</span>
                  </div>
                  <div className="sd-acts">
                    {d.state !== 'verified' ? <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" disabled={d.state === 'verifying'} onClick={() => this.check(d.host)}>Check now</button> : null}
                    {d.state === 'verified' && d.ssl === 'active' && !d.primary ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => this.primary(d.host)}>Make primary</button> : null}
                    {!showRecs ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => this.setState({ open: d.host })}>DNS records</button> : null}
                    <button type="button" className="ix-btn ix-btn--sm" onClick={() => this.remove(d)}>Remove</button>
                  </div>
                </div>
                {showRecs ? (
                  <div className="sd-recs">
                    <table>
                      <caption className="sr-only">{'DNS records for ' + d.host}</caption>
                      <thead><tr><th scope="col">Type</th><th scope="col">Name</th><th scope="col">Value</th><th scope="col"><span className="sr-only">Copy</span></th></tr></thead>
                      <tbody>{d.records.map((r) => <tr key={r.type + r.name}><td>{r.type}</td><td>{r.name}</td><td>{r.value}</td><td><button type="button" onClick={() => this.copy(r.value)}>Copy</button></td></tr>)}</tbody>
                    </table>
                  </div>
                ) : null}
              </React.Fragment>
            );
          }) : <p className="sd-empty">No custom domain yet. Connect one you own, like gridshop.com.bd.</p>}
        </section>

        <Dialog open={!!add} title="Connect domain" onClose={() => this.setState({ add: null })}
          footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => this.setState({ add: null })}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={this.doAdd}>Next</button></>}>
          {add ? (
            <div className="sd-form">
              <label className="sd-lbl">Domain<input className="gc-input" value={add.host} data-autofocus placeholder="gridshop.com.bd" onChange={(e) => this.setState({ add: { host: e.target.value, err: '' } })} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); this.doAdd(); } }} /></label>
              {add.err ? <p className="sd-err" role="alert">{add.err}</p> : null}
            </div>
          ) : null}
        </Dialog>
        <Dialog open={!!edit} title="Change GridCommerce address" onClose={() => this.setState({ edit: null })}
          footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => this.setState({ edit: null })}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={this.doSub}>Save</button></>}>
          {edit ? (
            <div className="sd-form">
              <label className="sd-lbl">Address<span className="sd-inline"><input className="gc-input" value={edit.name} data-autofocus onChange={(e) => this.setState({ edit: { name: e.target.value, err: '' } })} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); this.doSub(); } }} /><span className="sd-suffix">.{SUBDOMAIN_BASE}</span></span></label>
              <p className="sd-sub" style={{ margin: 0 }}>Links to the old address stop working.</p>
              {edit.err ? <p className="sd-err" role="alert">{edit.err}</p> : null}
            </div>
          ) : null}
        </Dialog>
      </SetFrame>
    );
  }
}
