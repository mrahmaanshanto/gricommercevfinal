'use client';
// Hosting › SSL & security — certificates (automatic Let's Encrypt for the GridCommerce address and each verified
// domain, renew now, upload your own on the Business plan), HTTPS (force HTTPS, HSTS, minimum TLS, www or bare domain),
// security headers, protection (request limits, challenge mode, blocked countries and IPs) and a password on the store
// before launch. Each change applies at once and is written to Settings history.

import React, { useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, StatusBadge } from '@/components/ui';
import {
  certificates, renewCertificate, canUploadCertificate, uploadCertificate, removeCustomCertificate, securityOf, saveSecurity,
  COUNTRIES, ipProblem,
} from '@/lib/hosting';
import { Card, StateBadge, SwitchRow, done, fmtDate } from './hsShared';

const AGES = [[15552000, '6 months'], [31536000, '1 year'], [63072000, '2 years']];

export default function HostingSecurity({ now }) {
  const certs = certificates(now);
  const s = securityOf();
  const [up, setUp] = useState(null);           // { host, cert, key, err, field }
  const [ip, setIp] = useState('');
  const [ipErr, setIpErr] = useState('');
  const [rate, setRate] = useState(null);
  const [pw, setPw] = useState(null);
  const put = (patch, msg = 'Saved') => done(saveSecurity(patch), msg);
  const domain = (certs.find((c) => c.primary) || certs.find((c) => !c.free) || certs[0] || {}).host || 'your domain';

  const upload = () => {
    const res = uploadCertificate(up.host, up.cert, up.key);
    if (res.ok === false) { setUp({ ...up, err: res.error, field: res.field }); return; }
    toast('Certificate uploaded and in use'); setUp(null);
  };
  const addIp = () => {
    const v = ip.trim(); const why = ipProblem(v);
    if (why) { setIpErr(why); return; }
    if (s.ips.includes(v)) { setIpErr('That address is already blocked.'); return; }
    if (put({ ips: [...s.ips, v] }, v + ' blocked')) { setIp(''); setIpErr(''); }
  };

  return (
    <>
      <Card title="Certificates" id="hs-certs" sub="Every address is served over HTTPS. Automatic certificates renew 30 days before they end.">
        <div className="hs-list">
          {certs.map((c) => (
            <div key={c.host} className="hs-row">
              <span className="hs-row__text">
                <span style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>{c.host}{c.primary ? <StatusBadge tone="primary">Primary</StatusBadge> : null}<StateBadge state={c.state} /></span>
                <small>{c.issuer} · covers {c.covers.join(', ')} · {c.state === 'issuing' ? 'issuing now' : `ends ${fmtDate(c.expires)} (${c.daysLeft} days)`}{c.auto ? ' · renews by itself' : ''}</small>
              </span>
              <span className="hs-acts">
                {c.auto ? <button type="button" className="ix-btn ix-btn--sm" disabled={c.state === 'issuing'} onClick={() => done(renewCertificate(c.host), 'Renewing the certificate…')}>Renew now</button> : null}
                {!c.free && !c.custom ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => (canUploadCertificate() ? setUp({ host: c.host, cert: '', key: '', err: '' }) : toast('Your own certificate needs the Business plan.', { tone: 'info' }))}>Use your own</button> : null}
                {c.custom ? <button type="button" className="ix-btn ix-btn--sm" onClick={async () => { if (await confirmDialog({ title: 'Go back to the automatic certificate?', body: 'GridCommerce issues a new one in a moment.', confirmLabel: 'Use automatic' })) done(removeCustomCertificate(c.host), 'Automatic certificate back in use'); }}>Use automatic</button> : null}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="HTTPS" id="hs-https">
        <SwitchRow label="Force HTTPS" help="Visits to http:// are sent to https://." on={s.forceHttps} onChange={(v) => put(v ? { forceHttps: true } : { forceHttps: false, hsts: { on: false, preload: false } }, v ? 'Force HTTPS is on' : 'Force HTTPS is off')} />
        <SwitchRow label="HSTS" help="Browsers remember to use HTTPS and refuse plain http. Turning it off again takes as long as the time below." on={s.hsts.on} disabled={!s.forceHttps} onChange={(v) => put({ hsts: v ? { on: true } : { on: false, preload: false } }, v ? 'HSTS is on' : 'HSTS is off')} />
        {s.hsts.on ? (
          <>
            <div className="hs-row"><span className="hs-row__text">Remember for</span>
              <select className="gc-input gc-select" aria-label="HSTS time" value={s.hsts.maxAge} onChange={(e) => put({ hsts: { maxAge: Number(e.target.value) } })}>{AGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
            <SwitchRow label="Include subdomains" help={'Every name under ' + domain + ' must use HTTPS too.'} on={s.hsts.sub} onChange={(v) => put({ hsts: v ? { sub: true } : { sub: false, preload: false } })} />
            <SwitchRow label="Preload" help="Browsers ship with your domain on their HTTPS-only list. Hard to undo: removal takes months." on={s.hsts.preload} onChange={async (v) => { if (v && !(await confirmDialog({ title: 'Ask browsers to preload HSTS?', body: 'Every subdomain must work over HTTPS for good. Removing the domain from the list takes months.', confirmLabel: 'Turn on preload' }))) return; put({ hsts: { preload: v } }); }} />
          </>
        ) : null}
        <div className="hs-row"><span className="hs-row__text">Oldest TLS allowed<small>1.2 works on every phone still in use.</small></span>
          <select className="gc-input gc-select" aria-label="Oldest TLS allowed" value={s.tls} onChange={(e) => put({ tls: e.target.value })}><option value="1.2">TLS 1.2</option><option value="1.3">TLS 1.3 only</option></select></div>
        <div className="hs-row"><span className="hs-row__text">Show the address as<small>The other one is sent here.</small></span>
          <select className="gc-input gc-select" aria-label="Show the address as" value={s.canonical} onChange={(e) => put({ canonical: e.target.value })}><option value="apex">{domain}</option><option value="www">{'www.' + domain}</option></select></div>
      </Card>

      <Card title="Security headers" id="hs-headers">
        <SwitchRow label="Stop other sites framing the store" help="Blocks clickjacking (X-Frame-Options)." on={s.headers.frame} onChange={(v) => put({ headers: { frame: v } })} />
        <SwitchRow label="Don’t guess file types" help="X-Content-Type-Options: nosniff." on={s.headers.sniff} onChange={(v) => put({ headers: { sniff: v } })} />
        <div className="hs-row"><span className="hs-row__text">Referrer sent to other sites</span>
          <select className="gc-input gc-select" aria-label="Referrer policy" value={s.headers.referrer} onChange={(e) => put({ headers: { referrer: e.target.value } })}>
            <option value="strict-origin-when-cross-origin">Only the domain</option><option value="no-referrer">Nothing</option><option value="same-origin">Only inside the store</option>
          </select></div>
      </Card>

      <Card title="Protection" id="hs-protect">
        <SwitchRow label="Limit requests" help={`Visitors making more than ${s.rate.perMin} requests a minute wait a moment. Stops scrapers and card testing at checkout.`} on={s.rate.on} onChange={(v) => put({ rate: { on: v } })} />
        {s.rate.on ? (
          <div className="hs-row"><span className="hs-row__text">Requests a minute</span>
            <input className="gc-input" inputMode="numeric" aria-label="Requests a minute" value={rate == null ? s.rate.perMin : rate} onChange={(e) => setRate(e.target.value.replace(/\D/g, ''))}
              onBlur={() => { if (rate != null && Number(rate) !== s.rate.perMin) { if (!put({ rate: { perMin: Number(rate) } })) return; } setRate(null); }} /></div>
        ) : null}
        <SwitchRow label="Challenge every visitor" help="For an attack: each visitor waits a few seconds for a check before the store opens." on={s.challenge} onChange={(v) => put({ challenge: v }, v ? 'Every visitor is checked now' : 'Challenge is off')} />
        <div className="hs-row" style={{ alignItems: 'flex-start', flexDirection: 'column' }}>
          <span className="hs-row__text">Block countries<small>Visitors from these countries can’t open the store.</small></span>
          <div className="hs-chips">{COUNTRIES.map(([code, name]) => { const on = s.countries.includes(code); return <button key={code} type="button" className="hs-chip" aria-pressed={on} onClick={() => put({ countries: on ? s.countries.filter((c) => c !== code) : [...s.countries, code] }, (on ? 'Unblocked ' : 'Blocked ') + name)}>{on ? <Icon name="ban" width="12" height="12" aria-hidden="true" /> : null}{name}</button>; })}</div>
        </div>
        <div className="hs-row" style={{ alignItems: 'flex-start', flexDirection: 'column' }}>
          <span className="hs-row__text">Blocked IP addresses</span>
          <div className="hs-chips">{s.ips.map((x) => <span key={x} className="hs-chip" style={{ cursor: 'default' }}>{x}<button type="button" aria-label={'Unblock ' + x} style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex' }} onClick={() => put({ ips: s.ips.filter((i) => i !== x) }, x + ' unblocked')}><Icon name="x" width="12" height="12" aria-hidden="true" /></button></span>)}{!s.ips.length ? <span className="hs-sub">None</span> : null}</div>
          <div className="hs-acts" style={{ width: '100%' }}>
            <input className="gc-input" style={{ flex: '1 1 200px' }} placeholder="185.220.101.0/24" aria-label="IP address to block" value={ip} onChange={(e) => { setIp(e.target.value); setIpErr(''); }} onKeyDown={(e) => { if (e.key === 'Enter') addIp(); }} />
            <button type="button" className="ix-btn ix-btn--sm" onClick={addIp}>Block</button>
          </div>
          {ipErr ? <p className="hs-err" role="alert">{ipErr}</p> : null}
        </div>
      </Card>

      <Card title="Before launch" id="hs-launch">
        <SwitchRow label="Lock the store with a password" help="Only people with the password can see the store. The admin and the POS keep working." on={s.password.on}
          onChange={(v) => { if (v) setPw(''); else put({ password: { on: false } }, 'The store is open to everyone'); }} />
        {pw != null ? (
          <div className="hs-acts">
            <input className="gc-input" style={{ flex: '1 1 200px' }} type="text" aria-label="Store password" placeholder="Store password" value={pw} onChange={(e) => setPw(e.target.value)} />
            <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => { if (put({ password: { on: true, value: pw } }, 'The store is locked. Share the password with your testers.')) setPw(null); }}>Lock store</button>
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => setPw(null)}>Cancel</button>
          </div>
        ) : null}
      </Card>

      <Sheet open={!!up} title={'Your certificate · ' + (up ? up.host : '')} onClose={() => setUp(null)}
        footer={up ? <><button type="button" className="gc-btn gc-btn--neutral" style={{ marginRight: 'auto' }} onClick={() => setUp(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={upload}>Upload</button></> : null}>
        {up ? (
          <div className="hs-form">
            <p className="hs-sub">For an extended-validation certificate or one from your bank. You renew it yourself before it ends.</p>
            <div><label className="gc-label" htmlFor="hs-cert">Certificate (with the chain)</label><textarea id="hs-cert" className="gc-input" rows={6} style={{ fontFamily: 'var(--font-data)' }} placeholder="-----BEGIN CERTIFICATE-----" aria-invalid={up.field === 'cert' || undefined} value={up.cert} onChange={(e) => setUp({ ...up, cert: e.target.value, err: '' })} /></div>
            <div><label className="gc-label" htmlFor="hs-key">Private key</label><textarea id="hs-key" className="gc-input" rows={5} style={{ fontFamily: 'var(--font-data)' }} placeholder="-----BEGIN PRIVATE KEY-----" aria-invalid={up.field === 'key' || undefined} value={up.key} onChange={(e) => setUp({ ...up, key: e.target.value, err: '' })} /></div>
            <p className="hs-sub">The key is stored encrypted and never shown again.</p>
            {up.err ? <p className="hs-err" role="alert">{up.err}</p> : null}
          </div>
        ) : null}
      </Sheet>
    </>
  );
}
