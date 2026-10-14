'use client';
// Merchant app · Sign-up step 3 (/onb-store): business name and what the shop sells (lib/shopOnboarding.js › KINDS).
// Both are saved with the shop at the last step (Settings › General: store name and shop type). Continue → /onb-channels.

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, TextInput } from './kit/AppKit';
import { OnbScreen, OnbTitle, ChoiceCard, useDraft } from './onb/OnbKit';
import { KINDS } from '@/lib/shopOnboarding';

export default function OnbStoreScreen() {
  const router = useRouter();
  const [d, set] = useDraft();
  const [shop, setShop] = useState('');
  const [kind, setKind] = useState('');
  const [err, setErr] = useState({});
  useEffect(() => { if (d) { setShop((s) => s || d.shop || ''); setKind((k) => k || d.kind || ''); } }, [d]);
  const first = d && d.name ? String(d.name).trim().split(/\s+/)[0] : '';

  const go = (e) => {
    if (e) e.preventDefault();
    const e2 = {};
    if (!shop.trim()) e2.shop = 'Enter your business name.';
    if (!kind) e2.kind = 'Choose what you sell.';
    setErr(e2);
    if (Object.keys(e2).length) return;
    set({ shop: shop.trim(), kind });
    router.push('/onb-channels');
  };

  return (
    <OnbScreen name="OnbStore" title="Your business" step={3} label="Your business" back="/onb-otp"
      actions={<Button style={{ flex: 2 }} onClick={go}>Continue</Button>}>
      <form onSubmit={go} noValidate>
        <OnbTitle title={first ? `What do you sell, ${first}?` : 'What do you sell?'} sub="We’ll set up the right categories and product fields." />
        <div style={{ marginTop: '20px' }}>
          <Field label="Business name" error={err.shop}>
            <TextInput value={shop} onChange={(v) => { setShop(v); setErr((x) => ({ ...x, shop: '' })); }} placeholder="Nusrat’s Closet" name="shop" autoFocus />
          </Field>
        </div>
        <div role="radiogroup" aria-label="What you sell" className="onbgrid" style={{ marginTop: '18px' }}>
          {KINDS.map((k) => <ChoiceCard key={k.key} on={kind === k.key} icon={k.icon} label={k.label} onClick={() => { setKind(k.key); setErr((x) => ({ ...x, kind: '' })); }} />)}
        </div>
        {err.kind ? <p role="alert" style={{ margin: '10px 0 0', fontSize: 'var(--text-xs-plus)', color: 'var(--err)' }}>{err.kind}</p> : null}
        <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
      </form>
    </OnbScreen>
  );
}
