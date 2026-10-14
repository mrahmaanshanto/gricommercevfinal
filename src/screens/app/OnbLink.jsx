'use client';
// Merchant app · Sign-up step 5 (/onb-link): the shop link <handle>.gridcommerce.com.bd. Starts from the business name;
// checked as you type (lib/shopOnboarding.js › checkHandle: format, then a demo list of links other shops use, with
// suggestions). Create my shop saves every answer (createShop: Settings › General, the system, Stock setup, the link,
// the owner's name and mobile) and signs the owner in → /onb-product (optional first product) → /onb-done.

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, Note, Pill, Icon, toast } from './kit/AppKit';
import { OnbScreen, OnbTitle, useDraft } from './onb/OnbKit';
import { checkHandle, slugOf, createShop, KINDS, SUBDOMAIN_BASE } from '@/lib/shopOnboarding';

export default function OnbLinkScreen() {
  const router = useRouter();
  const [d, set] = useDraft();
  const [handle, setHandle] = useState('');
  const [state, setState] = useState({ busy: false, res: null });
  const [err, setErr] = useState(null);
  const timer = useRef(0);
  const started = useRef(false);

  const check = (h) => {
    window.clearTimeout(timer.current);
    setState({ busy: true, res: null });
    timer.current = window.setTimeout(() => setState({ busy: false, res: checkHandle(h) }), 450);   // like a server round trip
  };
  useEffect(() => {
    if (!d || started.current) return;
    started.current = true;
    const h = d.handle || slugOf(d.shop) || '';
    setHandle(h);
    if (h) check(h);
  }, [d]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const change = (v) => {
    const h = v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 32);
    setHandle(h); setErr(null);
    if (h) check(h); else setState({ busy: false, res: null });
  };
  const create = () => {
    const res = checkHandle(handle);
    if (!res.ok) { setState({ busy: false, res }); return; }
    const answers = { ...d, handle };
    set({ handle });
    const out = createShop({ ...answers, phone: d.signupVerified || '' });
    if (!out.ok) { setErr(out); return; }
    toast('Your shop is ready');
    (out.problems || []).forEach((pr) => toast(pr, { tone: 'info' }));
    router.push('/onb-product');
  };

  const ok = state.res && state.res.ok;
  const kind = d ? (KINDS.find((k) => k.key === d.kind) || {}).label : '';
  return (
    <OnbScreen name="OnbLink" title="Shop link" step={5} label="Shop link" back="/onb-channels"
      actions={<Button style={{ flex: 2 }} onClick={create} disabled={!handle || state.busy || (state.res && !state.res.ok)}>Create my shop</Button>}>
      <OnbTitle title="Pick your shop link" sub="Customers order from here. Add your own domain later." />
      <div style={{ marginTop: '20px' }}>
        <Field label="Shop link" error={state.res && !state.res.ok ? state.res.reason : ''}>
          <span className="inp f" style={{ paddingRight: '10px' }}>
            <input value={handle} onChange={(e) => change(e.target.value)} aria-label="Shop link" autoCapitalize="none" autoCorrect="off" spellCheck={false} name="handle" placeholder="yourshop" />
            <span style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>{'.' + SUBDOMAIN_BASE}</span>
          </span>
        </Field>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '32px', marginTop: '8px' }} aria-live="polite">
        {state.busy ? <span className="onbmuted">Checking…</span> : ok ? <Pill tone="ok" shape>Available</Pill> : null}
      </div>
      {state.res && !state.res.ok && state.res.suggestions.length ? (
        <div style={{ marginTop: '4px' }}>
          <span className="onbmuted">Try one of these:</span>
          <div className="onbchips" style={{ marginTop: '8px' }}>
            {state.res.suggestions.map((s) => <button key={s} type="button" onClick={() => change(s)}>{s}</button>)}
          </div>
        </div>
      ) : null}
      {d && d.shop ? (
        <div className="card" style={{ marginTop: '20px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className="ico"><Icon name="store" size={22} /></span>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontWeight: 'var(--weight-semibold)' }}>{d.shop}</span>
            <span className="onbmuted ell" style={{ display: 'block' }}>{(handle || 'yourshop') + '.' + SUBDOMAIN_BASE}</span>
            {kind ? <span className="onbmuted" style={{ display: 'block' }}>{kind}</span> : null}
          </span>
        </div>
      ) : null}
      {err ? (
        <Note tone="err" icon="alert" style={{ marginTop: '16px' }}>
          <div>{err.error}</div>
          {err.step && err.step !== '/onb-link' ? <a href={err.step} style={{ display: 'inline-block', marginTop: '6px', fontWeight: 'var(--weight-medium)', color: 'var(--brand)' }}>Go to that step</a> : null}
        </Note>
      ) : null}
    </OnbScreen>
  );
}
