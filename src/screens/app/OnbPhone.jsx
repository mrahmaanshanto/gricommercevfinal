'use client';
// Merchant app · Sign-up step 1 (/onb-phone): your name and mobile number. The number must be a Bangladesh mobile
// (01X, 11 digits; +880 is fine). A number that already has an account is sent to sign in instead. Continue makes the
// demo SMS code (lib/shopOnboarding.js › sendCode) and opens /onb-otp.

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Field, TextInput, Note } from './kit/AppKit';
import { OnbScreen, OnbTitle, useDraft } from './onb/OnbKit';
import { normPhone, sendCode, accountByPhone, showPhone } from '@/lib/shopOnboarding';

export default function OnbPhoneScreen() {
  const router = useRouter();
  const [d, set] = useDraft();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [err, setErr] = useState({});
  const [known, setKnown] = useState(null);
  useEffect(() => { if (d && !name && !phone) { setName(d.name || ''); setPhone(d.phoneText || ''); } }, [d]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (e) => {
    if (e) e.preventDefault();
    const e2 = {};
    const p = normPhone(phone);
    if (!name.trim()) e2.name = 'Enter your name.';
    if (!p) e2.phone = 'Enter a Bangladesh mobile number: 11 digits starting with 01, like 01712-345678.';
    setErr(e2);
    if (Object.keys(e2).length) return;
    const acc = accountByPhone(p);
    if (acc) { setKnown(acc); return; }
    set({ name: name.trim(), phoneText: phone, phone: p, signupVerified: d && d.signupVerified === p ? p : '' });
    if (!(d && d.signupVerified === p)) sendCode(p, 'signup');
    router.push('/onb-otp');
  };

  return (
    <OnbScreen name="OnbPhone" title="Create account" step={1} label="Create account" back="/onb-welcome"
      actions={<Button style={{ flex: 2 }} onClick={go}>Continue</Button>}>
      <form onSubmit={go} noValidate>
        <OnbTitle title="Let’s set up your shop" sub="Two minutes. No card needed — start free." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '22px' }}>
          <Field label="Your name" error={err.name}>
            <TextInput value={name} onChange={(v) => { setName(v); setErr((x) => ({ ...x, name: '' })); }} placeholder="Nusrat Jahan" name="name" autoFocus />
          </Field>
          <Field label="Mobile number" error={err.phone} help="We’ll text you a 6-digit code to check it’s yours.">
            <TextInput value={phone} onChange={(v) => { setPhone(v); setKnown(null); setErr((x) => ({ ...x, phone: '' })); }} placeholder="1712-345678" type="tel" inputMode="tel" prefix="+880" name="phone" />
          </Field>
        </div>
        {known ? (
          <Note tone="warn" icon="alert" style={{ marginTop: '16px' }}>
            <div>{`${showPhone(normPhone(phone))} already has an account (${known.name}).`}</div>
            <Link href={'/onb-sign-in?phone=' + normPhone(phone)} style={{ display: 'inline-block', marginTop: '6px', fontWeight: 'var(--weight-medium)', color: 'var(--brand)' }}>Sign in instead</Link>
          </Note>
        ) : null}
        <p className="onbmuted" style={{ margin: '16px 0 0' }}>By continuing you agree to GridCommerce’s Terms and Privacy Policy.</p>
        <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
      </form>
    </OnbScreen>
  );
}
