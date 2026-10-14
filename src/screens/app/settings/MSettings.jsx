'use client';
// Merchant app · Settings (/m-settings). Only what someone running the shop needs on a phone; the shop's own setup
// (store, theme, menus, roles, integrations, plan) stays on the web. Drawn in the boards' settings look (MCallSettings):
//   profile card    → My profile (/m-profile: name, phone, photo, password, two-factor)
//   This phone      Language (EN / বাংলা, setLocale) · Notifications (which alerts this phone gets, gc.app.notify; the
//                   browser's permission) · Devices (/m-settings-devices: receipt printer, barcode scanner, cash drawer)
//   Business        Business info (read only: Settings › General, places, plan, system; "Edit on the web") ·
//                   Payment methods at the counter (read only: the register's tenders and the accounts they pay into)
//   Account         Team profile (the web's /set-profile demo switch, lib/team.js › signInAs) · System (full site only:
//                   Retail, Online, Retail + Online or all modules → previewEdition + /m-home; Super admin → /admin)
//   App             App info (version, "Add to home screen" for iPhone and Android) · Help from GridCommerce · web panel
//   Sign out
// ?sheet=notify opens the notifications sheet (Notifications links here when a kind is off).

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppScreen, AppBar, Content, Card, Sheet, Button, Avatar, Icon, Pill, Segmented, LangSwitch, Note,
  useAppData, useQuery, useLocale, toast,
} from '../kit/AppKit';
import { EDITIONS, LOCKED, hasModule, previewEdition } from '@/lib/edition';
import { SYSTEMS } from '@/lib/systems';
import { USERS, roleTitles, signInAs, signOut } from '@/lib/team';
import { businessProfile } from '@/lib/businessProfile';
import { currentPlan } from '@/lib/plans';
import { getPlaces } from '@/lib/locations';
import { accountBy } from '@/lib/ledger';
import { TERMINALS } from '@/lib/hardware';
import { getCreditRules } from '@/lib/creditRules';
import { getLoyaltySettings } from '@/lib/loyalty';
import { GroupLabel, SetRow, SwitchRow, KV, SETTINGS_CSS } from './settingsParts';
import { getNotify, setNotify, NOTIFY_TYPES, getProfile, getDevices, APP_VERSION, APP_BUILD } from './settingsData';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const CSS = SETTINGS_CSS + `
[data-screen="MSettings"] .steps{margin:0;padding:0 0 0 20px;font-size:var(--text-sm);line-height:22px;color:var(--body)}
[data-screen="MSettings"] .steps li{padding:4px 0}
[data-screen="MSettings"] .logo{flex:none;width:36px;height:36px;border-radius:var(--radius-lg);background:#fff;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;overflow:hidden}
[data-screen="MSettings"] .logo img{width:26px;height:26px;object-fit:contain}`;

const SYS_ICON = { 'retail-wholesale': 'store', online: 'bag', 'retail-online': 'layers', full: 'grid' };

/** The counter's ways to pay (Pos.jsx › TENDERS, plus due and wallet when they are on) and where each one lands. */
function counterMethods() {
  const acc = (id) => safe(() => accountBy(id).name, '');
  const credit = safe(() => getCreditRules(), { allowRetailDue: false });
  const on = safe(() => getLoyaltySettings().on, {});
  const wallet = on.wallet !== false && on.pos !== false;
  return [
    { name: 'Cash', to: acc('drawer') || 'Counter drawers', icon: 'cash' },
    { name: 'Card', to: TERMINALS.map((t) => t.name).join(' · '), icon: 'card' },
    { name: 'bKash', to: acc('bkash'), logo: '/assets/brands/bkash.svg' },
    { name: 'Nagad', to: acc('nagad'), logo: '/assets/brands/nagad.svg' },
    { name: 'Rocket', to: acc('rocket'), logo: '/assets/brands/rocket.webp' },
    { name: 'Due / credit', to: credit.allowRetailDue ? `Up to ${credit.dueDays} days to pay` : 'Off (Customer settings › Credit & dues)', icon: 'receipt', off: !credit.allowRetailDue },
    { name: 'Customer wallet', to: wallet ? 'Loyalty members’ store credit' : 'Off (Loyalty settings)', icon: 'wallet', off: !wallet },
  ];
}

export default function MSettingsScreen() {
  const router = useRouter();
  const query = useQuery();
  const loc = useLocale();
  const { ready, tick, ctx } = useAppData(['gc:app-settings', 'gc:plan']);
  const [sheet, setSheet] = useState('');
  const [howTo, setHowTo] = useState('iphone');
  const [install, setInstall] = useState(null);
  const [perm, setPerm] = useState('');

  useEffect(() => { if (query && query.get('sheet')) setSheet(query.get('sheet')); }, [query]);
  useEffect(() => {
    const ua = navigator.userAgent || '';
    if (/android/i.test(ua)) setHowTo('android');
    setPerm(typeof Notification === 'undefined' ? 'none' : Notification.permission);
    const keep = (e) => { e.preventDefault(); setInstall(e); };
    window.addEventListener('beforeinstallprompt', keep);
    return () => window.removeEventListener('beforeinstallprompt', keep);
  }, []);

  const user = ctx ? ctx.user : null;
  const ed = ctx ? ctx.ed : 'full';
  const data = useMemo(() => {
    if (!ready || !ctx) return null;
    const bp = safe(() => businessProfile(), null);
    const places = safe(() => getPlaces({ active: true }), []);
    return {
      bp,
      shop: (bp && bp.brand.name) || 'Your shop',
      profile: getProfile(ctx.user),
      notify: getNotify(),
      devices: getDevices(),
      branches: places.filter((p) => p.type === 'Branch').map((p) => p.name),
      warehouses: places.filter((p) => p.type === 'Warehouse' && !p.noSale).map((p) => p.name),
      plan: safe(() => currentPlan().name, ''),
      pay: counterMethods(),
    };
  }, [ready, tick, ctx]);

  const has = (m) => hasModule(m, ed);
  const types = NOTIFY_TYPES.filter((t) => !t.module || has(t.module));
  const onCount = data ? types.filter((t) => data.notify[t.key]).length : 0;
  const titles = user ? roleTitles(user).join(' + ') : '';
  const close = () => setSheet('');

  const toggle = (key, on) => { setNotify({ [key]: on }); toast(on ? 'Turned on' : 'Turned off'); };
  const askPermission = async () => {
    if (typeof Notification === 'undefined') { toast('This browser cannot show alerts', { tone: 'info' }); return; }
    try { const p = await Notification.requestPermission(); setPerm(p); toast(p === 'granted' ? 'Alerts are allowed on this phone' : 'Alerts stay blocked. Change it in the phone’s settings.', { tone: p === 'granted' ? undefined : 'info' }); } catch { /* ignore */ }
  };
  const switchTo = (id) => { signInAs(id); close(); toast('Switched to ' + (USERS.find((u) => u.id === id) || {}).name); };
  const switchSystem = (id) => { previewEdition(id); close(); router.push('/m-home'); };
  const out = () => { signOut(); router.replace('/onb-sign-in'); };
  const installNow = async () => { if (!install) return; install.prompt(); try { await install.userChoice; } catch { /* ignore */ } setInstall(null); };

  const printer = data && data.devices.printer;
  return (
    <AppScreen name="MSettings" title="Settings" css={CSS}>
      <AppBar title="Settings" back="/m-more" />
      <Content top={103} bottom={0}>
        <Card href="/m-profile" style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '2px 20px 0', padding: '16px' }}>
          {data && data.profile && data.profile.photo
            ? <img src={data.profile.photo} alt="" style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-xl)', objectFit: 'cover', flex: 'none' }} />
            : <Avatar text={user ? user.initials : ''} size={52} />}
          <span style={{ flex: '1', minWidth: '0' }}>
            <span className="ell" style={{ display: 'block', fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)' }}>{data && data.profile ? data.profile.name : ' '}</span>
            <span className="ell" style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{user ? `${titles} · ${user.email}` : ' '}</span>
          </span>
          <Icon name="chev" size={18} stroke={2} style={{ color: 'var(--text-muted)' }} />
        </Card>

        <GroupLabel>This phone</GroupLabel>
        <div className="card" style={{ margin: '0 20px' }}>
          <SetRow icon="globe" label="Language" end={<LangSwitch />} />
          <SetRow icon="bell" label="Notifications" value={data ? (onCount === types.length ? 'All on' : onCount ? `${onCount} of ${types.length} on` : 'Off') : ''} onClick={() => setSheet('notify')} />
          {has('pos') || has('catalog') ? <SetRow icon="receipt" label="Devices" sub="Receipt printer, scanner, cash drawer" value={printer ? printer.name : ''} href="/m-settings-devices" /> : null}
        </div>

        <GroupLabel>Business</GroupLabel>
        <div className="card" style={{ margin: '0 20px' }}>
          <SetRow icon="store" label="Business info" value={data ? data.shop : ''} onClick={() => setSheet('business')} />
          {has('pos') ? <SetRow icon="card" label="Payment methods" sub="What the counter takes" onClick={() => setSheet('pay')} /> : null}
        </div>

        <GroupLabel>Account</GroupLabel>
        <div className="card" style={{ margin: '0 20px' }}>
          <SetRow icon="users" label="Team profile" sub="Demo: use the app as a team member" value={titles} onClick={() => setSheet('team')} />
          {!LOCKED ? <SetRow icon={SYS_ICON[ed] || 'grid'} label="System" sub="Switch system or open Super admin" value={EDITIONS[ed] ? EDITIONS[ed].short : ''} onClick={() => setSheet('system')} /> : null}
        </div>

        <GroupLabel>App</GroupLabel>
        <div className="card" style={{ margin: '0 20px' }}>
          <SetRow icon="mobile" label="App info" sub="Version and add to home screen" value={APP_VERSION} onClick={() => setSheet('about')} />
          <SetRow icon="ticket" label="Help from GridCommerce" sub="Ask our team, see your requests" href="/help-support" />
          <SetRow icon="globe" label="Open the web panel" sub="Store setup, reports and everything else" href="/merchant-overview" />
        </div>

        <button type="button" className="row" onClick={out} style={{ margin: '14px 20px 0', width: 'calc(100% - 40px)', color: 'var(--err)', fontWeight: 'var(--weight-medium)', justifyContent: 'center' }}>
          <Icon name="logout" size={20} />Sign out
        </button>
        <div style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--muted)', margin: '4px 0 0' }}>GridCommerce {APP_VERSION}</div>
      </Content>

      <Sheet open={sheet === 'notify'} onClose={close} title="Notifications">
        {perm && perm !== 'granted' ? (
          <Note tone={perm === 'denied' ? 'warn' : 'info'} icon="bell" style={{ marginBottom: '12px' }}>
            {perm === 'denied' ? 'Alerts are blocked for this site. Allow them in the phone’s settings.' : perm === 'none' ? 'This browser cannot show alerts. The list stays in Notifications.' : (
              <span>Let this phone show alerts. <button type="button" onClick={askPermission} style={{ border: 0, background: 'none', padding: 0, font: 'inherit', color: 'var(--brand)', fontWeight: 'var(--weight-medium)', cursor: 'pointer' }}>Allow</button></span>
            )}
          </Note>
        ) : null}
        <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
          {types.map((t) => <SwitchRow key={t.key} label={t.label} sub={t.sub} on={!!(data && data.notify[t.key])} onChange={(on) => toggle(t.key, on)} />)}
          <SwitchRow label="Sound" sub="Play a sound with each alert" on={!!(data && data.notify.sound)} onChange={(on) => toggle('sound', on)} />
        </div>
      </Sheet>

      <Sheet open={sheet === 'business'} onClose={close} title="Business info" footer={<Button kind="soft" icon="globe" href="/set-general">Edit on the web</Button>}>
        {data && data.bp ? (
          <>
            <KV k="Shop name">{data.shop}</KV>
            {data.bp.legal.name ? <KV k="Legal name">{data.bp.legal.name}</KV> : null}
            {data.bp.contact.phone ? <KV k="Phone"><span className="num">{data.bp.contact.phone}</span></KV> : null}
            {data.bp.contact.email ? <KV k="Email">{data.bp.contact.email}</KV> : null}
            {data.bp.contact.address ? <KV k="Address">{data.bp.contact.address}</KV> : null}
            {data.branches.length ? <KV k={data.branches.length === 1 ? 'Branch' : `Branches (${data.branches.length})`}>{data.branches.join(', ')}</KV> : null}
            {data.warehouses.length ? <KV k={data.warehouses.length === 1 ? 'Warehouse' : `Warehouses (${data.warehouses.length})`}>{data.warehouses.join(', ')}</KV> : null}
            {data.bp.legal.bin ? <KV k="BIN"><span className="mono">{data.bp.legal.bin}</span></KV> : null}
            <KV k="Plan">{data.plan}</KV>
            <KV k="System">{EDITIONS[ed] ? EDITIONS[ed].name : ''}</KV>
          </>
        ) : null}
      </Sheet>

      <Sheet open={sheet === 'pay'} onClose={close} title="Payment methods" footer={<Button kind="soft" icon="globe" href="/set-payments">Edit on the web</Button>}>
        {data ? data.pay.map((m) => (
          <div key={m.name} className="opt" style={{ cursor: 'default', opacity: m.off ? 0.6 : 1 }}>
            {m.logo ? <span className="logo"><img src={m.logo} alt="" /></span> : <span className="set-ico"><Icon name={m.icon} size={20} /></span>}
            <span style={{ flex: '1', minWidth: '0' }}>
              <span style={{ display: 'block', fontWeight: 'var(--weight-medium)' }}>{m.name}</span>
              <span style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{m.to}</span>
            </span>
            {m.off ? <Pill tone="grey">Off</Pill> : <Pill tone="ok">On</Pill>}
          </div>
        )) : null}
      </Sheet>

      <Sheet open={sheet === 'team'} onClose={close} title="Team profile">
        <div style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)', margin: '-4px 0 6px' }}>The app shows what this person can open.</div>
        {USERS.map((u) => (
          <button key={u.id} type="button" className="opt" onClick={() => switchTo(u.id)} aria-pressed={!!user && user.id === u.id}>
            <Avatar text={u.initials} size={36} />
            <span style={{ flex: '1', minWidth: '0' }}>
              <span className="ell" style={{ display: 'block', fontWeight: 'var(--weight-medium)' }}>{u.name}</span>
              <span className="ell" style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{roleTitles(u).join(' + ')} · {u.place}</span>
            </span>
            {user && user.id === u.id ? <Icon name="check" size={20} stroke={2.2} style={{ color: 'var(--brand)' }} /> : null}
          </button>
        ))}
      </Sheet>

      <Sheet open={sheet === 'system'} onClose={close} title="Switch system">
        {[...SYSTEMS.map((s) => ({ ed: s.ed, blurb: s.blurb })), { ed: 'full', blurb: 'Every module, for the demo' }].map((s) => (
          <button key={s.ed} type="button" className="opt" onClick={() => switchSystem(s.ed)} aria-pressed={ed === s.ed}>
            <span className="set-ico"><Icon name={SYS_ICON[s.ed] || 'store'} size={20} /></span>
            <span style={{ flex: '1', minWidth: '0' }}>
              <span style={{ display: 'block', fontWeight: 'var(--weight-medium)' }}>{EDITIONS[s.ed].short}</span>
              <span style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{s.blurb}</span>
            </span>
            {ed === s.ed ? <Icon name="check" size={20} stroke={2.2} style={{ color: 'var(--brand)' }} /> : null}
          </button>
        ))}
        <a className="opt" href="/admin">
          <span className="set-ico" style={{ background: '#003087', color: '#fff' }}><Icon name="briefcase" size={20} /></span>
          <span style={{ flex: '1', minWidth: '0' }}>
            <span style={{ display: 'block', fontWeight: 'var(--weight-medium)' }}>Super admin</span>
            <span style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>GridCommerce team · merchants, billing, company</span>
          </span>
          <Icon name="chev" size={18} stroke={2} style={{ color: 'var(--text-muted)' }} />
        </a>
      </Sheet>

      <Sheet open={sheet === 'about'} onClose={close} title="App info" footer={install ? <Button kind="primary" icon="download" onClick={installNow}>Install the app</Button> : null}>
        <KV k="Version"><span className="num">{APP_VERSION}</span></KV>
        <KV k="Build">{APP_BUILD}</KV>
        <KV k="System">{EDITIONS[ed] ? EDITIONS[ed].name : ''}</KV>
        <KV k="Language">{loc === 'bn' ? 'বাংলা' : 'English'}</KV>
        <div className="sec" style={{ margin: '20px 0 10px' }}><h2>Add to home screen</h2></div>
        <Segmented items={[{ key: 'iphone', label: 'iPhone' }, { key: 'android', label: 'Android' }]} value={howTo} onChange={setHowTo} style={{ margin: '0 0 12px' }} />
        {howTo === 'iphone' ? (
          <ol className="steps">
            <li>Open this page in Safari.</li>
            <li>Tap the Share button at the bottom.</li>
            <li>Tap <b style={{ fontWeight: 'var(--weight-medium)' }}>Add to Home Screen</b>, then <b style={{ fontWeight: 'var(--weight-medium)' }}>Add</b>.</li>
            <li>Open GridCommerce from its icon. It opens full screen, like an app.</li>
          </ol>
        ) : (
          <ol className="steps">
            <li>Open this page in Chrome.</li>
            <li>Tap the ⋮ menu at the top right.</li>
            <li>Tap <b style={{ fontWeight: 'var(--weight-medium)' }}>Add to Home screen</b> or <b style={{ fontWeight: 'var(--weight-medium)' }}>Install app</b>.</li>
            <li>Open GridCommerce from its icon.</li>
          </ol>
        )}
      </Sheet>
    </AppScreen>
  );
}
