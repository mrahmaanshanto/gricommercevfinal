'use client';
// Merchant app · My profile (/m-profile, from Settings). The signed-in person (lib/team.js) with this phone's changes
// (settings/settingsData.js › gc.app.profile): photo (resized to 256 px), name, mobile number; the sign-in email and
// role are shown, not edited. Security: change password (rules checked, demo: nothing is sent) and two-factor sign-in
// (a code by SMS to the mobile number; demo: any 6 digits). The web has no personal profile page yet (the account
// menu's "My profile" opens Settings › Security), so this is the app's own.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AppScreen, AppBar, Content, ActionBar, Button, Field, TextInput, Sheet, Avatar, Card,
  useAppData, toast, confirmDialog, dateText,
} from '../kit/AppKit';
import { roleTitles } from '@/lib/team';
import { GroupLabel, SetRow, SwitchRow, SETTINGS_CSS } from './settingsParts';
import { getProfile, saveProfile, checkProfile, checkPassword } from './settingsData';

const CSS = SETTINGS_CSS;

/** A picked photo, made square and 256 px, as a data URL. */
function shrink(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const c = document.createElement('canvas');
      c.width = 256; c.height = 256;
      c.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 256, 256);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('not an image')); };
    img.src = url;
  });
}

export default function MProfileScreen() {
  const { ready, tick, ctx } = useAppData(['gc:app-settings']);
  const user = ctx ? ctx.user : null;
  const saved = useMemo(() => (ready && user ? getProfile(user) : null), [ready, tick, user]);
  const [form, setForm] = useState(null);
  const [errs, setErrs] = useState({});
  const [sheet, setSheet] = useState('');
  const [pw, setPw] = useState({ current: '', next: '', again: '' });
  const [pwErrs, setPwErrs] = useState({});
  const [code, setCode] = useState('');
  const fileRef = useRef(null);

  useEffect(() => { if (saved && (!form || form.id !== user.id)) setForm({ id: user.id, name: saved.name, phone: saved.phone, photo: saved.photo }); }, [saved, user, form]);

  const dirty = !!(form && saved && (form.name !== saved.name || form.phone !== saved.phone || form.photo !== saved.photo));
  const set = (k) => (v) => { setForm((f) => ({ ...f, [k]: v })); setErrs({}); };

  const pick = async (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try { const photo = await shrink(f); setForm((x) => ({ ...x, photo })); } catch { toast('Pick a photo (JPG or PNG)', { tone: 'error' }); }
  };
  const save = () => {
    const e = checkProfile(form);
    if (Object.keys(e).length) { setErrs(e); return; }
    saveProfile(user, { name: form.name.trim(), phone: form.phone.trim(), photo: form.photo || '' });
    toast('Profile saved');
  };
  const savePassword = () => {
    const e = checkPassword(pw);
    setPwErrs(e);
    if (Object.keys(e).length) return;
    saveProfile(user, { passwordAt: Date.now() });
    setPw({ current: '', next: '', again: '' });
    setSheet('');
    toast('Password changed. Other devices are signed out.');
  };
  const twofa = async (on) => {
    if (on) { setCode(''); setSheet('2fa'); return; }
    const ok = await confirmDialog({ title: 'Turn off two-factor sign-in?', body: 'Anyone with your password could then sign in. Keep it on to stay safe.', confirmLabel: 'Turn off', tone: 'danger' });
    if (ok) { saveProfile(user, { twofa: false }); toast('Two-factor sign-in is off'); }
  };
  const verify = () => {
    if (!/^\d{6}$/.test(code.trim())) { toast('Type the 6-digit code', { tone: 'error' }); return; }
    saveProfile(user, { twofa: true });
    setSheet('');
    toast('Two-factor sign-in is on');
  };

  const photo = form ? form.photo : '';
  return (
    <AppScreen name="MProfile" title="My profile" css={CSS}>
      <AppBar title="My profile" back="/m-settings" />
      <Content top={103} bottom={98}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '6px 20px 0' }}>
          {photo
            ? <img src={photo} alt="Your photo" style={{ width: '88px', height: '88px', borderRadius: 'var(--radius-full)', objectFit: 'cover' }} />
            : <Avatar text={user ? user.initials : ''} size={88} round />}
          <span style={{ display: 'flex', gap: '8px' }}>
            <Button kind="soft" style={{ height: '36px' }} onClick={() => fileRef.current && fileRef.current.click()}>{photo ? 'Change photo' : 'Add a photo'}</Button>
            {photo ? <Button kind="line" style={{ height: '36px' }} onClick={() => set('photo')('')}>Remove</Button> : null}
          </span>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pick} />
        </div>

        <Card pad="16px" style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Field label="Name" error={errs.name}>
            <TextInput value={form ? form.name : ''} onChange={set('name')} name="name" />
          </Field>
          <Field label="Mobile number" error={errs.phone} help="Sign-in codes and alerts come to this number.">
            <TextInput value={form ? form.phone : ''} onChange={set('phone')} type="tel" inputMode="tel" name="phone" />
          </Field>
          <Field label="Email" help="You sign in with it. Change it on the web.">
            <span className="inp" style={{ background: 'var(--bg)', color: 'var(--body)' }}>{user ? user.email : ''}</span>
          </Field>
        </Card>

        <GroupLabel>Role</GroupLabel>
        <div className="card" style={{ margin: '0 20px' }}>
          <SetRow label={user ? roleTitles(user).join(' + ') : ' '} sub={user ? user.place : ''} />
        </div>

        <GroupLabel>Security</GroupLabel>
        <div className="card" style={{ margin: '0 20px' }}>
          <SetRow icon="edit" label="Change password" sub={saved && saved.passwordAt ? 'Changed ' + dateText(saved.passwordAt) : 'Use 8 or more letters and numbers'} onClick={() => { setPwErrs({}); setSheet('password'); }} />
          <SwitchRow icon="phone" label="Two-factor sign-in" sub={`A code by SMS to ${saved ? saved.phone : 'your phone'} on a new device`} on={!!(saved && saved.twofa)} onChange={twofa} />
        </div>
        <div style={{ height: '8px' }} />
      </Content>
      <ActionBar>
        <Button kind="primary" disabled={!dirty} onClick={save}>Save changes</Button>
      </ActionBar>

      <Sheet open={sheet === 'password'} onClose={() => setSheet('')} title="Change password" footer={<Button kind="primary" onClick={savePassword}>Change password</Button>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Field label="Current password" error={pwErrs.current}><TextInput type="password" value={pw.current} onChange={(v) => setPw((p) => ({ ...p, current: v }))} name="current-password" /></Field>
          <Field label="New password" error={pwErrs.next} help="8 or more characters, letters and a number"><TextInput type="password" value={pw.next} onChange={(v) => setPw((p) => ({ ...p, next: v }))} name="new-password" /></Field>
          <Field label="New password again" error={pwErrs.again}><TextInput type="password" value={pw.again} onChange={(v) => setPw((p) => ({ ...p, again: v }))} name="confirm-password" /></Field>
        </div>
      </Sheet>

      <Sheet open={sheet === '2fa'} onClose={() => setSheet('')} title="Turn on two-factor sign-in" footer={<Button kind="primary" onClick={verify}>Verify and turn on</Button>}>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--body)', marginBottom: '14px' }}>We sent a 6-digit code to <b className="num" style={{ fontWeight: 'var(--weight-medium)' }}>{saved ? saved.phone : ''}</b>.</div>
        <Field label="Code" help="Demo: any 6 digits work.">
          <TextInput value={code} onChange={(v) => setCode(v.replace(/[^0-9]/g, '').slice(0, 6))} inputMode="numeric" placeholder="000000" autoFocus name="one-time-code" />
        </Field>
      </Sheet>
    </AppScreen>
  );
}
