'use client';
// Merchant app · Sign in (/onb-sign-in; the app's own sign-in: /app and every /m-* page send people here when nobody is
// signed in, and Sign out comes back here — screens/app/kit/AppSession.jsx). Two ways in:
//   phone + code   the mobile number of a demo account (lib/team.js USERS, with My account changes, e.g. a new shop's
//                  owner) → the demo code on /onb-sign-in-code
//   demo accounts  tap one to sign in at once (each role sees its own app)
// ?next=/m-… returns there after signing in; ?phone= fills the number (from sign-up's "Sign in instead").

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Field, TextInput, Card, ListRow, Avatar, Note, useQuery } from './kit/AppKit';
import { OnbScreen, OnbTitle } from './onb/OnbKit';
import { nextFrom, hasSession } from './kit/AppSession';
import { normPhone, sendCode, accountByPhone } from '@/lib/shopOnboarding';
import { USERS, roleTitles, signInAs, currentUser } from '@/lib/team';
import { withAccount } from '@/lib/myAccount';

export default function OnbSignInScreen() {
  const router = useRouter();
  const q = useQuery();
  const [phone, setPhone] = useState('');
  const [err, setErr] = useState('');
  const [me, setMe] = useState(null);
  useEffect(() => {
    if (!q) return;
    if (q.get('phone')) setPhone(q.get('phone'));
    if (hasSession()) setMe(currentUser());
  }, [q]);
  const next = nextFrom(q);
  const people = useMemo(() => (q ? USERS.map((u) => withAccount(u)) : []), [q]);

  const send = (e) => {
    if (e) e.preventDefault();
    const p = normPhone(phone);
    if (!p) { setErr('Enter a Bangladesh mobile number: 11 digits starting with 01, like 01712-345678.'); return; }
    if (!accountByPhone(p)) { setErr('No account uses this number. Check it, or create a shop.'); return; }
    sendCode(p, 'signin');
    router.push('/onb-sign-in-code?next=' + encodeURIComponent(next));
  };
  const pick = (id) => { if (signInAs(id)) router.replace(next); else setErr('This account is switched off. Ask the shop owner.'); };

  return (
    <OnbScreen name="OnbSignIn" title="Sign in" label="Sign in" back="/onb-welcome"
      actions={<Button style={{ flex: 2 }} onClick={send}>Send code</Button>}>
      <form onSubmit={send} noValidate>
        <OnbTitle title="Welcome back" sub="Sign in with the phone number on your store." />
        {me ? (
          <Note tone="info" icon="user" style={{ marginTop: '18px' }}>
            <div>{`Signed in as ${me.name}.`}</div>
            <Link href={next} style={{ display: 'inline-block', marginTop: '6px', fontWeight: 'var(--weight-medium)', color: 'var(--brand)' }}>Open the app</Link>
          </Note>
        ) : null}
        <div style={{ marginTop: '20px' }}>
          <Field label="Phone number" error={err} help="We will text you a 6-digit code.">
            <TextInput value={phone} onChange={(v) => { setPhone(v); setErr(''); }} placeholder="1712-345678" type="tel" inputMode="tel" prefix="+880" name="phone" autoFocus />
          </Field>
        </div>
        <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
      </form>
      <p className="onbmuted" style={{ margin: '14px 0 0' }}>New here? <Link href="/onb-phone" style={{ color: 'var(--brand)', fontWeight: 'var(--weight-medium)' }}>Create a store</Link></p>
      <div className="sec" style={{ margin: '24px 0 10px' }}><h2>Or use a demo account</h2></div>
      <Card style={{ margin: 0 }}>
        {people.map((u) => (
          <ListRow key={u.id} compact onClick={() => pick(u.id)} avatar={<Avatar text={u.initials} size={36} round />} title={u.name} sub={roleTitles(u).join(' + ') + ' · ' + u.place} />
        ))}
      </Card>
      <p className="onbmuted" style={{ margin: '18px 0 0' }}>GridCommerce staff? <Link href="/c-sign-in" style={{ color: 'var(--brand)', fontWeight: 'var(--weight-medium)' }}>Sign in to the console</Link></p>
    </OnbScreen>
  );
}
