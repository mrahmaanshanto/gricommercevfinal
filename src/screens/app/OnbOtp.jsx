'use client';
// Merchant app · Sign-up step 2 (/onb-otp): the 6-digit SMS code. Demo: no SMS is sent; the code is shown on screen
// ("Fill it in"). Resend after 30 s makes a new code; five wrong tries need a new code (lib/shopOnboarding.js).
// Verify → /onb-store. A real shop's server sends the SMS and checks the code.

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Note, toast } from './kit/AppKit';
import { OnbScreen, OnbTitle, CodeBoxes, useDraft, useCountdown, mmss } from './onb/OnbKit';
import { checkCode, sendCode, showPhone, CODE_WAIT } from '@/lib/shopOnboarding';

export default function OnbOtpScreen() {
  const router = useRouter();
  const [d] = useDraft();
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const left = useCountdown(d && d.signupCodeAt, CODE_WAIT);
  const phone = d && d.signupPhone;
  const verified = !!(d && phone && d.signupVerified === phone);

  const verify = (c = code) => {
    if (verified) { router.push('/onb-store'); return; }
    const e = checkCode(c, 'signup');
    setErr(e);
    if (!e) router.push('/onb-store');
  };
  const resend = () => { if (!phone) return; sendCode(phone, 'signup'); setCode(''); setErr(''); toast('New code ready'); };

  return (
    <OnbScreen name="OnbOtp" title="Verify number" step={2} label="Verify number" back="/onb-phone"
      actions={<Button style={{ flex: 2 }} onClick={() => verify()} disabled={!phone}>Verify</Button>}>
      <OnbTitle title="Check your SMS" sub={phone ? `Enter the 6-digit code for +880 ${showPhone(phone).slice(1)}.` : 'Enter your mobile number first.'} />
      {!d ? null : !phone ? (
        <Button kind="soft" href="/onb-phone" style={{ marginTop: '22px' }}>Enter your number</Button>
      ) : verified ? (
        <Note tone="ok" icon="check" style={{ marginTop: '22px' }}>This number is verified.</Note>
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
            <Link href="/onb-phone" className="onblink" style={{ display: 'inline-flex', alignItems: 'center' }}>Change number</Link>
          </div>
          <Note tone="info" icon="phone" style={{ marginTop: '20px' }}>
            <div className="onbdemo">
              <span>Demo: no SMS is sent. Your code is <b>{d.signupCode}</b></span>
              <button type="button" className="onblink" style={{ padding: '0 4px' }} onClick={() => { setCode(d.signupCode || ''); setErr(''); }}>Fill it in</button>
            </div>
          </Note>
        </>
      )}
    </OnbScreen>
  );
}
