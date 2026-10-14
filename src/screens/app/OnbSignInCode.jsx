'use client';
// Merchant app · Sign-in code (/onb-sign-in-code): the 6-digit code for the number typed on /onb-sign-in. Demo: no SMS
// leaves the browser; the code is shown on screen. Right code → signs in as the account using that number
// (lib/shopOnboarding.js › accountByPhone) → ?next= or /m-home. Resend after 30 s.

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Note, useQuery, toast } from './kit/AppKit';
import { OnbScreen, OnbTitle, CodeBoxes, useDraft, useCountdown, mmss } from './onb/OnbKit';
import { nextFrom } from './kit/AppSession';
import { checkCode, sendCode, showPhone, accountByPhone, CODE_WAIT } from '@/lib/shopOnboarding';
import { signInAs } from '@/lib/team';

export default function OnbSignInCodeScreen() {
  const router = useRouter();
  const q = useQuery();
  const [d] = useDraft();
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const left = useCountdown(d && d.signinCodeAt, CODE_WAIT);
  const phone = d && d.signinPhone;
  const back = '/onb-sign-in' + (q && q.get('next') ? '?next=' + encodeURIComponent(q.get('next')) : '');

  const verify = (c = code) => {
    const e = checkCode(c, 'signin');
    if (e) { setErr(e); return; }
    const acc = accountByPhone(phone);
    if (!acc) { setErr('No account uses this number any more.'); return; }
    if (!signInAs(acc.id)) { setErr('This account is switched off. Ask the shop owner.'); return; }
    router.replace(nextFrom(q));
  };
  const resend = () => { if (!phone) return; sendCode(phone, 'signin'); setCode(''); setErr(''); toast('New code ready'); };

  return (
    <OnbScreen name="OnbSignInCode" title="Enter the code" label="Sign in" back={back}
      actions={<Button style={{ flex: 2 }} onClick={() => verify()} disabled={!phone}>Verify</Button>}>
      <OnbTitle title="Enter the code" sub={phone ? `For +880 ${showPhone(phone).slice(1)}.` : 'Enter your phone number first.'} />
      {!d ? null : !phone ? (
        <Button kind="soft" href={back} style={{ marginTop: '22px' }}>Enter your number</Button>
      ) : (
        <>
          <div style={{ marginTop: '24px' }}>
            <CodeBoxes value={code} onChange={(v) => { setCode(v); setErr(''); }} bad={!!err} onDone={(v) => verify(v)} />
          </div>
          {err ? <p role="alert" style={{ margin: '10px 0 0', fontSize: 'var(--text-xs-plus)', color: 'var(--err)' }}>{err}</p> : null}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: 'var(--text-sm)' }}>
            {left > 0
              ? <span className="num" style={{ color: 'var(--muted)' }}>Resend code in <b style={{ color: 'var(--ink)' }}>{mmss(left)}</b></span>
              : <button type="button" className="onblink" onClick={resend}>Resend code</button>}
            <Link href={back} className="onblink" style={{ display: 'inline-flex', alignItems: 'center' }}>Change</Link>
          </div>
          <Note tone="info" icon="phone" style={{ marginTop: '20px' }}>
            <div className="onbdemo">
              <span>Demo: no SMS is sent. Your code is <b>{d.signinCode}</b></span>
              <button type="button" className="onblink" style={{ padding: '0 4px' }} onClick={() => { setCode(d.signinCode || ''); setErr(''); }}>Fill it in</button>
            </div>
          </Note>
          <p className="onbmuted" style={{ margin: '16px 0 0' }}>Never share this code, even with GridCommerce staff.</p>
        </>
      )}
    </OnbScreen>
  );
}
