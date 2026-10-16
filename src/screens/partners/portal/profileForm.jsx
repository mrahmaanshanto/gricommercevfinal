'use client';
// profileForm — the form parts the Join page (/grid-partners/join) and the profile editor (/gp-profile) share (Batch E):
// toggles for niches and languages, the platforms rows (network, handle, followers), samples (upload a photo with
// readPicture or add a video link, each with a caption), the rate card (packages: name, price, what is included), the
// phone check with a demo code (1234) and a picture field (photo, cover).

import React, { useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { readPicture } from '@/lib/readPicture';
import { NETS, sendCode, verifyCode } from '@/lib/platform/partners';

export const blankPlatform = () => ({ net: 'instagram', handle: '', followers: '', url: '' });
export const blankPackage = () => ({ id: '', name: '', price: '', includes: '' });
/** A partner's packages as form rows (includes as lines). */
export const pkgRows = (list) => (list || []).map((k) => ({ ...k, price: String(k.price || ''), includes: (k.includes || []).join('\n') }));
export const platRows = (list) => (list || []).map((x) => ({ ...x, followers: String(x.followers || '') }));

export function Toggles({ options, value, onChange, label, max }) {
  const on = (o) => value.includes(o);
  const flip = (o) => {
    if (on(o)) onChange(value.filter((x) => x !== o));
    else if (max && value.length >= max) toast(`Pick up to ${max}.`, { tone: 'error' });
    else onChange([...value, o]);
  };
  return <div className="pt-toggles" role="group" aria-label={label}>{options.map((o) => <button key={o} type="button" className="pt-toggle" aria-pressed={on(o)} onClick={() => flip(o)}>{on(o) ? <Icon name="check" width="12" height="12" aria-hidden="true" /> : null}{o}</button>)}</div>;
}

export function PlatformRows({ rows, onChange }) {
  const set = (i, patch) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  return (<>
    <ul className="pt-rows pt-rows--plat">
      {rows.map((r, i) => (
        <li key={i}>
          <select className="gc-input gc-select" value={r.net} onChange={(e) => set(i, { net: e.target.value })} aria-label={'Platform ' + (i + 1)}>{Object.entries(NETS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          <input className="gc-input" value={r.handle} onChange={(e) => set(i, { handle: e.target.value })} placeholder="@yourname" aria-label={'Handle on platform ' + (i + 1)} />
          <input className="gc-input" inputMode="numeric" value={r.followers} onChange={(e) => set(i, { followers: e.target.value })} placeholder="Followers" aria-label={'Followers on platform ' + (i + 1)} />
          <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={'Remove platform ' + (i + 1)} onClick={() => onChange(rows.filter((_, j) => j !== i))}><Icon name="trash-2" width="16" height="16" /></button>
        </li>
      ))}
    </ul>
    <div><button type="button" className="ix-btn ix-btn--sm" onClick={() => onChange([...rows, blankPlatform()])}><Icon name="plus" width="14" height="14" aria-hidden="true" />Add platform</button></div>
  </>);
}

export function SampleRows({ rows, onChange }) {
  const file = useRef(null);
  const [busy, setBusy] = useState(false);
  const set = (i, patch) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const upload = async (e) => {
    const fs = Array.from(e.target.files || []);
    e.target.value = '';
    if (!fs.length) return;
    setBusy(true);
    const add = [];
    for (const f of fs.slice(0, 6)) {
      try { const { src } = await readPicture(f, { max: 900, quality: 0.72 }); add.push({ kind: 'photo', src, link: '', caption: f.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ') }); } catch (err) { toast(err.message, { tone: 'error' }); }
    }
    setBusy(false);
    if (add.length) onChange([...rows, ...add]);
  };
  return (<>
    {rows.length ? (
      <ul className="pt-rows pt-rows--smp">
        {rows.map((r, i) => (
          <li key={i}>
            <span className="pt-smp-thumb" style={r.src ? { backgroundImage: `url(${r.src})` } : undefined} aria-hidden="true">{r.src ? null : <Icon name="video" width="22" height="22" />}</span>
            <span className="pt-smp-fields">
              <input className="gc-input" value={r.caption} onChange={(e) => set(i, { caption: e.target.value })} placeholder="What it is, for whom" aria-label={'Caption of sample ' + (i + 1)} />
              {r.kind === 'video' ? <input className="gc-input" value={r.link} onChange={(e) => set(i, { link: e.target.value })} placeholder="https://youtube.com/… or a TikTok / Instagram / Facebook link" aria-label={'Video link of sample ' + (i + 1)} /> : null}
            </span>
            <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={'Remove sample ' + (i + 1)} onClick={() => onChange(rows.filter((_, j) => j !== i))}><Icon name="trash-2" width="16" height="16" /></button>
          </li>
        ))}
      </ul>
    ) : null}
    <div className="pt-row">
      <button type="button" className="ix-btn ix-btn--sm" disabled={busy} onClick={() => file.current && file.current.click()}><Icon name="image-plus" width="14" height="14" aria-hidden="true" />{busy ? 'Reading…' : 'Upload photos'}</button>
      <button type="button" className="ix-btn ix-btn--sm" onClick={() => onChange([...rows, { kind: 'video', src: '', link: '', caption: '' }])}><Icon name="link-2" width="14" height="14" aria-hidden="true" />Add a video link</button>
      <input ref={file} type="file" accept="image/*" multiple hidden onChange={upload} />
    </div>
  </>);
}

export function PackageRows({ rows, onChange }) {
  const set = (i, patch) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  return (<>
    <ul className="pt-rows pt-rows--pkg">
      {rows.map((r, i) => (
        <li key={i}>
          <input className="gc-input" value={r.name} onChange={(e) => set(i, { name: e.target.value })} placeholder="e.g. One Reel or TikTok" aria-label={'Package ' + (i + 1) + ' name'} />
          <input className="gc-input" inputMode="numeric" value={r.price} onChange={(e) => set(i, { price: e.target.value })} placeholder="Price ৳" aria-label={'Package ' + (i + 1) + ' price'} />
          <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={'Remove package ' + (i + 1)} onClick={() => onChange(rows.filter((_, j) => j !== i))}><Icon name="trash-2" width="16" height="16" /></button>
          <textarea className="gc-input" rows={2} value={r.includes} onChange={(e) => set(i, { includes: e.target.value })} placeholder="What is included (one per line)" aria-label={'Package ' + (i + 1) + ' includes'} />
        </li>
      ))}
    </ul>
    <div><button type="button" className="ix-btn ix-btn--sm" onClick={() => onChange([...rows, blankPackage()])}><Icon name="plus" width="14" height="14" aria-hidden="true" />Add package</button></div>
  </>);
}

/** Phone with a demo code check. verified / onVerified(bool). */
export function PhoneCheck({ phone, verified, onPhone, onVerified, err }) {
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const send = () => { const r = sendCode(phone); if (r.ok === false) { toast(r.error, { tone: 'error' }); return; } setSent(true); setCode(''); toast(r.hint); };
  const check = () => { const r = verifyCode(code); if (r.ok === false) { toast(r.error, { tone: 'error' }); return; } onVerified(true); setSent(false); toast('Phone number checked'); };
  return (
    <div className="pt-phone">
      <label className="gc-label" htmlFor="pt-phone">Mobile number</label>
      <div className="pt-share__link">
        <input id="pt-phone" className="gc-input" inputMode="tel" value={phone} onChange={(e) => { onPhone(e.target.value); onVerified(false); setSent(false); }} placeholder="01XXX-XXXXXX" aria-invalid={!!err} />
        {verified ? <span className="gc-badge gc-badge--success" style={{ alignSelf: 'center' }}><Icon name="check" width="12" height="12" aria-hidden="true" />Checked</span>
          : <button type="button" className="ix-btn" onClick={send}>{sent ? 'Send again' : 'Send code'}</button>}
      </div>
      {sent && !verified ? (
        <div className="pt-share__link" style={{ marginTop: 'var(--space-2)' }}>
          <label className="sr-only" htmlFor="pt-code">Code</label>
          <input id="pt-code" className="gc-input" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} placeholder="4-digit code" autoComplete="one-time-code" />
          <button type="button" className="ix-btn ix-btn--primary" onClick={check}>Check</button>
        </div>
      ) : null}
      {sent && !verified ? <p className="gc-help" style={{ margin: '4px 0 0' }}>Demo: the code is 1234.</p> : null}
      {err ? <p className="gc-help gc-help--error" role="alert">{err}</p> : null}
    </div>
  );
}

/** Upload one picture (photo or cover). */
export function PicField({ label, src, onChange, round, max = 720 }) {
  const file = useRef(null);
  const pick = async (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try { const r = await readPicture(f, { max }); onChange(r.src); } catch (err) { toast(err.message, { tone: 'error' }); }
  };
  return (
    <div className="pt-picfield">
      <span className={'pt-picfield__pic' + (round ? ' is-round' : '')} style={src ? { backgroundImage: `url(${src})` } : undefined} aria-hidden="true">{src ? null : <Icon name="image" width="20" height="20" />}</span>
      <span className="pt-picfield__main">
        <b>{label}</b>
        <span className="pt-row">
          <button type="button" className="ix-btn ix-btn--sm" onClick={() => file.current && file.current.click()}><Icon name="upload" width="14" height="14" aria-hidden="true" />{src ? 'Change' : 'Upload'}</button>
          {src ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => onChange('')}>Remove</button> : null}
        </span>
      </span>
      <input ref={file} type="file" accept="image/*" hidden onChange={pick} aria-label={label} />
    </div>
  );
}

export const FORM_CSS = `
.pt-picfield{display:flex;align-items:center;gap:var(--space-3)}
.pt-picfield__pic{display:grid;place-items:center;flex:none;width:96px;height:64px;border-radius:var(--radius-lg);border:1px solid var(--border-subtle);background:var(--surface-subtle) center/cover no-repeat;color:var(--text-muted)}
.pt-picfield__pic.is-round{width:64px;border-radius:var(--radius-full);background-position:top center}
.pt-picfield__main{display:flex;flex-direction:column;gap:6px}
.pt-picfield__main b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.pt-types{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-2)}
.pt-type{display:flex;flex-direction:column;align-items:flex-start;gap:6px;padding:var(--space-3);border:1px solid var(--border-field);border-radius:var(--radius-lg);cursor:pointer;font-size:var(--text-sm)}
.pt-type:has(input:checked){border-color:var(--primary);background:var(--fill-primary-soft)}
.pt-type input{position:absolute;opacity:0;pointer-events:none}
.pt-type:has(input:focus-visible){outline:2px solid var(--primary);outline-offset:1px}
.pt-type b{font-weight:var(--weight-semibold);color:var(--text-heading)}
.pt-type small{font-size:var(--text-xs);color:var(--text-muted)}
.pt-type svg{color:var(--primary)}
.pt-handle{display:flex;align-items:center;border:1px solid var(--border-field);border-radius:var(--radius-lg);background:var(--surface-card);overflow:hidden}
.pt-handle span{padding:0 0 0 10px;font-size:var(--text-sm);color:var(--text-muted);white-space:nowrap}
.pt-handle input{flex:1;min-width:0;border:0;box-shadow:none}
.pt-sec{display:flex;flex-direction:column;gap:var(--space-3)}
.pt-sec>h2{display:flex;align-items:center;gap:8px}
.pt-sec>h2 small{font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
@media (max-width:640px){.pt-types{grid-template-columns:1fr}.pt-picfield__pic{width:80px}}
`;
