'use client';
// My account (/my-account) — the signed-in person's own account: name, photo, phone, email and language; password;
// two-step sign-in; the devices signed in and recent sign-ins. Opened from the top bar's account menu (not in the
// side menu). The data is lib/myAccount.js; the parts that need a server (storing the password, sending the code,
// ending sessions on other devices) are simulated there and say so on the page.

import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog, getLocale, setLocale } from '@/runtime/ui';
import { Sheet, StatusBadge } from '@/components/ui';
import { formatDate, formatTime } from '@/lib/format';
import { roleTitles } from '@/lib/team';
import {
  ACCOUNT_EVENT, saveProfile, setPhoto, photoFromFile, passwordProblems, passwordStrength, changePassword, passwordChangedAt,
  twoStepOf, sendTwoStepCode, confirmTwoStep, turnOffTwoStep, devicesOf, signOutDevice, signOutEverywhere, signInsOf, agoText,
} from '@/lib/myAccount';
import { TeamPage, useMe, useTick } from '@/screens/team/teamShared';

const CSS = `
.ma-prof{display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-4)}
.ma-av{display:grid;place-items:center;flex:none;width:64px;height:64px;border-radius:var(--radius-full);overflow:hidden;background:var(--primary);color:#fff;font-size:var(--text-lg);font-weight:var(--weight-semibold)}
.ma-av img{width:100%;height:100%;object-fit:cover}
.ma-prof__btns{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.ma-grid{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.ma-grid .ma-wide{grid-column:1 / -1}
.ma-row{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle)}
.ma-row:first-child{border-top:0}
.ma-row__ic{display:grid;place-items:center;flex:none;width:32px;height:32px;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
.ma-row__mid{flex:1;min-width:0}
.ma-row__t{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ma-row__s{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.ma-line{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-2)}
.ma-line p{margin:0;font-size:var(--text-sm);color:var(--text-body)}
.ma-form{display:flex;flex-direction:column;gap:var(--space-4)}
.ma-meter{display:flex;gap:4px;margin-top:var(--space-2)}
.ma-meter i{flex:1;height:4px;border-radius:var(--radius-full);background:var(--border-subtle)}
.ma-meter[data-s="1"] i:nth-child(-n+1){background:var(--error)}
.ma-meter[data-s="2"] i:nth-child(-n+2){background:var(--warning)}
.ma-meter[data-s="3"] i{background:var(--success)}
.ma-code{font-family:var(--font-data);font-size:var(--text-lg);letter-spacing:.3em}
.ma-demo{margin:0;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--fill-info-soft);color:var(--text-info);font-size:var(--text-xs)}
.ma-seg{display:inline-flex;gap:2px;padding:2px;border-radius:var(--radius-lg);background:var(--surface-subtle)}
.ma-seg button{min-height:32px;padding:0 var(--space-3);border:0;border-radius:var(--radius-md);background:transparent;font:inherit;font-size:var(--text-sm);color:var(--text-body);cursor:pointer}
.ma-seg button[aria-pressed="true"]{background:var(--surface-card);color:var(--primary);font-weight:var(--weight-medium);box-shadow:var(--shadow-card)}
.ma-radio{display:flex;flex-direction:column;gap:var(--space-2)}
.ma-radio label{display:flex;align-items:center;gap:var(--space-2);min-height:36px;padding:0 var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-size:var(--text-sm);cursor:pointer}
.ma-radio label:has(input:checked){border-color:var(--primary);background:var(--fill-primary-soft)}
.ma-check{display:flex;align-items:flex-start;gap:var(--space-2);font-size:var(--text-sm)}
.ma-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums;white-space:nowrap}
@media (max-width:640px){.ma-grid{grid-template-columns:1fr}.ma-row{padding:var(--space-3)}.ma-row .ix-btn{min-height:36px}}
`;

const KIND_ICON = { phone: 'smartphone', tablet: 'tablet', computer: 'monitor' };
const STRENGTH = ['Too weak', 'Fair', 'Good', 'Strong'];

function Field({ id, label, error, children, wide }) {
  return (
    <div className={wide ? 'ma-wide' : undefined}>
      <label className="gc-label" htmlFor={id}>{label}</label>
      {children}
      {error ? <p className="gc-help gc-help--error" id={id + '-err'} role="alert">{error}</p> : null}
    </div>
  );
}

export default function MyAccount() {
  const { me, ready } = useMe();
  useTick([ACCOUNT_EVENT, 'gc:locale']);
  const [now, setNow] = useState(0);
  useEffect(() => { setNow(Date.now()); const t = window.setInterval(() => setNow(Date.now()), 60000); return () => window.clearInterval(t); }, []);

  // ---- profile ----
  const [form, setForm] = useState(null);
  const [errs, setErrs] = useState({});
  useEffect(() => { if (ready) setForm({ name: me.name, phone: me.phone || '', email: me.email || '' }); }, [ready, me.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const dirty = !!form && (form.name !== me.name || form.phone !== (me.phone || '') || form.email !== (me.email || ''));
  const saveProf = () => {
    const r = saveProfile(me.id, form);
    setErrs(r.errors);
    if (r.ok) toast('Profile saved', { tone: 'success' });
  };
  const fileRef = useRef(null);
  const pickPhoto = async (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try { setPhoto(me.id, await photoFromFile(f)); toast('Photo updated', { tone: 'success' }); } catch (err) { toast(err.message, { tone: 'error' }); }
  };
  const removePhoto = async () => {
    if (await confirmDialog({ title: 'Remove your photo?', body: 'Your initials show instead.', confirmLabel: 'Remove', tone: 'danger' })) { setPhoto(me.id, ''); toast('Photo removed', { tone: 'success' }); }
  };

  // ---- password ----
  const [pw, setPw] = useState(null);
  const savePw = () => {
    const r = changePassword(me.id, pw);
    if (!r.ok) { setPw({ ...pw, errors: r.errors }); return; }
    setPw(null);
    toast(pw.signOutOthers ? 'Password changed. Other devices are signed out.' : 'Password changed', { tone: 'success' });
  };

  // ---- two-step sign-in ----
  const two = ready ? twoStepOf(me.id) : { on: false, method: 'sms' };
  const [ts, setTs] = useState(null); // { method, code (demo), entered, error }
  const sendCode = () => { const code = sendTwoStepCode(me.id, ts.method); setTs({ ...ts, sent: code, entered: '', error: '' }); };
  const confirmCode = () => {
    const r = confirmTwoStep(me.id, ts.entered);
    if (!r.ok) { setTs({ ...ts, error: r.error }); return; }
    setTs(null);
    toast('Two-step sign-in is on', { tone: 'success' });
  };
  const turnOff = async () => {
    if (await confirmDialog({ title: 'Turn off two-step sign-in?', body: 'Signing in will need only your password. Anyone who learns it can open your account.', confirmLabel: 'Turn off', tone: 'danger' })) {
      turnOffTwoStep(me.id);
      toast('Two-step sign-in is off', { tone: 'info' });
    }
  };

  // ---- devices ----
  const devices = ready && now ? devicesOf(me.id, now) : [];
  const others = devices.filter((d) => !d.current);
  const outOne = (d) => { signOutDevice(me.id, d.id); toast('Signed out of ' + d.name, { tone: 'success' }); };
  const outAll = async () => {
    if (await confirmDialog({ title: 'Sign out everywhere else?', body: `${others.length} other ${others.length === 1 ? 'device' : 'devices'} will need to sign in again. You stay signed in here.`, confirmLabel: 'Sign out', tone: 'danger' })) {
      signOutEverywhere(me.id);
      toast('Signed out of every other device', { tone: 'success' });
    }
  };
  const signIns = ready && now ? signInsOf(me.id, now) : [];
  const pwAt = ready ? passwordChangedAt(me.id) : null;
  const locale = ready ? getLocale() : 'en';
  const shownPhone = (p) => String(p || '').replace(/^(\d{5})(\d{6})$/, '$1-$2');

  return (
    <TeamPage screen="MyAccount" active="" crumb="Account" page="My account" title="My account" icon="circle-user-round" css={CSS}
      about="Your own account: the name, photo, phone and email your team sees, the language you use, your password, two-step sign-in and the devices that are signed in. Shop settings are in Settings.">
      <div className="ix-record">
        <div className="ix-main">
          <section className="ix-card" aria-labelledby="ma-prof-h">
            <div className="ix-card__head"><h2 id="ma-prof-h">Profile</h2></div>
            <div className="ix-card__body">
              {!form ? null : (
                <>
                  <div className="ma-prof">
                    <span className="ma-av" aria-hidden="true">{me.photo ? <img src={me.photo} alt="" /> : me.initials}</span>
                    <div>
                      <div className="ma-prof__btns">
                        <button type="button" className="ix-btn ix-btn--sm" onClick={() => fileRef.current && fileRef.current.click()}>{me.photo ? 'Change photo' : 'Add photo'}</button>
                        {me.photo ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={removePhoto}>Remove</button> : null}
                      </div>
                      <span className="ma-row__s" style={{ marginTop: 6 }}>JPG or PNG. Shown in the top bar and to your team.</span>
                      <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} aria-label="Choose a photo" />
                    </div>
                  </div>
                  <div className="ma-grid">
                    <Field id="ma-name" label="Name" error={errs.name} wide>
                      <input id="ma-name" className="gc-input" value={form.name} autoComplete="name" aria-invalid={!!errs.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </Field>
                    <Field id="ma-phone" label="Mobile number" error={errs.phone}>
                      <input id="ma-phone" className="gc-input" type="tel" inputMode="tel" value={form.phone} autoComplete="tel" aria-invalid={!!errs.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </Field>
                    <Field id="ma-email" label="Email" error={errs.email}>
                      <input id="ma-email" className="gc-input" type="email" value={form.email} autoComplete="email" aria-invalid={!!errs.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </Field>
                  </div>
                </>
              )}
            </div>
            <div className="ix-card__foot">
              <button type="button" className="gc-btn gc-btn--neutral" disabled={!dirty} onClick={() => { setForm({ name: me.name, phone: me.phone || '', email: me.email || '' }); setErrs({}); }}>Discard</button>
              <button type="button" className="gc-btn gc-btn--solid" disabled={!dirty} onClick={saveProf}>Save</button>
            </div>
          </section>

          <section className="ix-card" aria-labelledby="ma-sec-h">
            <div className="ix-card__head"><h2 id="ma-sec-h">Password and sign-in</h2></div>
            <div role="list">
              <div className="ma-row" role="listitem">
                <span className="ma-row__ic"><Icon name="key-round" width="16" height="16" aria-hidden="true" /></span>
                <span className="ma-row__mid"><span className="ma-row__t">Password</span><span className="ma-row__s">{pwAt ? 'Last changed ' + formatDate(pwAt) : 'Not changed from this account yet'}</span></span>
                <button type="button" className="ix-btn ix-btn--sm" onClick={() => setPw({ current: '', next: '', confirm: '', signOutOthers: true, errors: {} })}>Change password</button>
              </div>
              <div className="ma-row" role="listitem">
                <span className="ma-row__ic"><Icon name="shield-check" width="16" height="16" aria-hidden="true" /></span>
                <span className="ma-row__mid">
                  <span className="ma-row__t">Two-step sign-in {two.on ? <StatusBadge tone="success">On</StatusBadge> : <StatusBadge tone="warning">Off</StatusBadge>}</span>
                  <span className="ma-row__s">{two.on ? `A code by ${two.method === 'sms' ? 'SMS to ' + shownPhone(me.phone) : 'email to ' + me.email} after your password${two.since ? ' · since ' + formatDate(two.since) : ''}` : 'Ask for a code after your password, so a stolen password is not enough.'}</span>
                </span>
                {two.on
                  ? <button type="button" className="ix-btn ix-btn--sm" onClick={turnOff}>Turn off</button>
                  : <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => setTs({ method: me.phone ? 'sms' : 'email', sent: '', entered: '', error: '' })}>Turn on</button>}
              </div>
            </div>
          </section>

          <section className="ix-card" aria-labelledby="ma-dev-h">
            <div className="ix-card__head">
              <h2 id="ma-dev-h">Signed-in devices</h2>
              {others.length ? <button type="button" className="ix-btn ix-btn--sm ix-btn--danger" onClick={outAll}>Sign out everywhere else</button> : null}
            </div>
            <div role="list" style={{ marginTop: 8 }}>
              {devices.map((d) => (
                <div className="ma-row" role="listitem" key={d.id}>
                  <span className="ma-row__ic"><Icon name={KIND_ICON[d.kind] || 'monitor'} width="16" height="16" aria-hidden="true" /></span>
                  <span className="ma-row__mid">
                    <span className="ma-row__t">{d.name} {d.current ? <StatusBadge tone="info">This device</StatusBadge> : null}</span>
                    <span className="ma-row__s">{d.place} · {d.current ? 'Active now' : 'Last active ' + agoText(d.lastAt, now).toLowerCase()}</span>
                  </span>
                  {d.current ? null : <button type="button" className="ix-btn ix-btn--sm" onClick={() => outOne(d)} aria-label={'Sign out of ' + d.name}>Sign out</button>}
                </div>
              ))}
              {ready && !others.length ? <p className="ma-row ma-row__s" style={{ margin: 0 }}>No other device is signed in.</p> : null}
            </div>
          </section>

          <section className="ix-card" aria-labelledby="ma-log-h">
            <div className="ix-card__head"><h2 id="ma-log-h">Recent sign-ins</h2></div>
            <div className="gc-table-wrap" style={{ marginTop: 8 }}>
              <table className="ix-table">
                <thead><tr><th scope="col">When</th><th scope="col">What</th><th scope="col">Device</th><th scope="col">Place</th></tr></thead>
                <tbody>
                  {signIns.map((x, i) => (
                    <tr key={i}>
                      <td className="ma-fig">{formatDate(x.at)} {formatTime(x.at)}</td>
                      <td>{x.ok ? x.what : <StatusBadge tone="error">{x.what}</StatusBadge>}</td>
                      <td>{x.device}</td>
                      <td>{x.place}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="ix-side">
          <section className="ix-card ix-card--pad" aria-labelledby="ma-lang-h">
            <div className="ma-line">
              <h2 id="ma-lang-h" className="ix-section-title">Language</h2>
              <span className="ma-seg" role="group" aria-label="Language">
                <button type="button" aria-pressed={locale === 'en'} onClick={() => { if (locale !== 'en') { setLocale('en'); toast('Language set to English', { tone: 'info' }); } }}>English</button>
                <button type="button" lang="bn" aria-pressed={locale === 'bn'} onClick={() => { if (locale !== 'bn') { setLocale('bn'); toast('ভাষা বাংলা করা হয়েছে', { tone: 'info' }); } }}>বাংলা</button>
              </span>
            </div>
          </section>
          <section className="ix-card ix-card--pad" aria-labelledby="ma-role-h">
            <h2 id="ma-role-h" className="ix-section-title">Your role</h2>
            <dl className="ix-kv" style={{ marginTop: 'var(--space-3)' }}>
              <dt>Role</dt><dd>{ready ? roleTitles(me).join(' + ') : ''}</dd>
              <dt>Works at</dt><dd>{me.place || '—'}</dd>
            </dl>
            <p className="ma-row__s" style={{ marginTop: 'var(--space-3)' }}>The shop owner sets roles in Settings › Users &amp; roles.</p>
          </section>
          <p className="ma-demo">Demo: no password is stored, codes are shown on screen instead of sent, and the devices are sample rows. Your name, photo and settings stay in this browser.</p>
        </aside>
      </div>

      <Sheet open={!!pw} title="Change password" onClose={() => setPw(null)}
        footer={pw ? <><button type="button" className="gc-btn gc-btn--neutral" style={{ marginRight: 'auto' }} onClick={() => setPw(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={savePw}>Change password</button></> : null}>
        {pw ? (
          <form className="ma-form" onSubmit={(e) => { e.preventDefault(); savePw(); }}>
            <p className="ma-demo">Demo: no password is stored, so any current password works. The new one is checked and the change is logged.</p>
            <Field id="ma-cur" label="Current password" error={pw.errors.current}>
              <input id="ma-cur" className="gc-input" type="password" autoComplete="current-password" value={pw.current} aria-invalid={!!pw.errors.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
            </Field>
            <Field id="ma-new" label="New password" error={pw.errors.next}>
              <input id="ma-new" className="gc-input" type="password" autoComplete="new-password" value={pw.next} aria-invalid={!!pw.errors.next} aria-describedby="ma-new-meter" onChange={(e) => setPw({ ...pw, next: e.target.value })} />
              <div className="ma-meter" data-s={pw.next ? Math.max(1, passwordStrength(pw.next)) : 0} aria-hidden="true"><i /><i /><i /></div>
              <p className="gc-help" id="ma-new-meter">{pw.next ? (passwordProblems(pw.next).length ? 'Still needs ' + passwordProblems(pw.next).join(', ') + '.' : STRENGTH[passwordStrength(pw.next)]) : 'At least 8 characters, with a letter and a number.'}</p>
            </Field>
            <Field id="ma-conf" label="New password again" error={pw.errors.confirm}>
              <input id="ma-conf" className="gc-input" type="password" autoComplete="new-password" value={pw.confirm} aria-invalid={!!pw.errors.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
            </Field>
            <label className="ma-check"><input type="checkbox" checked={pw.signOutOthers} onChange={(e) => setPw({ ...pw, signOutOthers: e.target.checked })} /> <span>Sign out of other devices</span></label>
            <button type="submit" hidden>Change password</button>
          </form>
        ) : null}
      </Sheet>

      <Sheet open={!!ts} title="Turn on two-step sign-in" onClose={() => setTs(null)}
        footer={ts ? <><button type="button" className="gc-btn gc-btn--neutral" style={{ marginRight: 'auto' }} onClick={() => setTs(null)}>Cancel</button>{ts.sent ? <button type="button" className="gc-btn gc-btn--solid" onClick={confirmCode}>Turn on</button> : <button type="button" className="gc-btn gc-btn--solid" onClick={sendCode}>Send code</button>}</> : null}>
        {ts ? (
          <div className="ma-form">
            <div>
              <span className="gc-label">Where to send the code</span>
              <div className="ma-radio" role="radiogroup" aria-label="Where to send the code">
                <label><input type="radio" name="ma-m" checked={ts.method === 'sms'} disabled={!me.phone} onChange={() => setTs({ ...ts, method: 'sms', sent: '', error: '' })} /> SMS to {me.phone ? shownPhone(me.phone) : 'your mobile (add it in Profile)'}</label>
                <label><input type="radio" name="ma-m" checked={ts.method === 'email'} onChange={() => setTs({ ...ts, method: 'email', sent: '', error: '' })} /> Email to {me.email}</label>
              </div>
            </div>
            {ts.sent ? (
              <>
                <p className="ma-demo">Demo: nothing is sent. Your code is <b className="ma-fig">{ts.sent}</b>.</p>
                <Field id="ma-code" label="6-digit code" error={ts.error}>
                  <input id="ma-code" className="gc-input ma-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={ts.entered} aria-invalid={!!ts.error} autoFocus
                    onChange={(e) => setTs({ ...ts, entered: e.target.value.replace(/\D/g, '').slice(0, 6), error: '' })}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); confirmCode(); } }} />
                </Field>
                <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" style={{ alignSelf: 'flex-start' }} onClick={sendCode}>Send a new code</button>
              </>
            ) : <p className="gc-help" style={{ margin: 0 }}>We send a 6-digit code. Enter it here to finish. After that, every sign-in asks for a new code.</p>}
          </div>
        ) : null}
      </Sheet>
    </TeamPage>
  );
}
