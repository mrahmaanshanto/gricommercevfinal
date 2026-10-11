'use client';
// Merchant app · Devices (/m-settings-devices, from Settings). The devices this phone works with when it sells or
// counts stock (settings/settingsData.js › gc.app.devices):
//   Receipt printer   pair over Bluetooth or USB (a search finds the demo printers), paper 58 / 80 mm, test print, forget
//   Barcode scanner   the phone's camera on / off, beep, vibrate; a paired Bluetooth / USB scanner; try it in Scan
//   Cash drawer       open after a cash sale (through the printer's drawer port), open now
// A browser has no device driver, so pairing and printing are a demo; the counters' own devices are set on the web
// (POS › Counters, lib/hardware.js).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AppScreen, AppBar, Content, Card, Button, Sheet, Segmented, Pill, Icon, Skeleton,
  useAppData, toast, confirmDialog, dateText,
} from '../kit/AppKit';
import { canUse } from '../kit/appNav';
import { hasModule } from '@/lib/edition';
import { businessProfile } from '@/lib/businessProfile';
import { GroupLabel, SetRow, SwitchRow, SETTINGS_CSS } from './settingsParts';
import { getDevices, setDevices, FOUND, beep } from './settingsData';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const CSS = SETTINGS_CSS + `
[data-screen="MSettingsDevices"] .slip{margin:4px auto 0;width:220px;padding:16px 14px 20px;background:#fff;border:1px dashed #cbd5e1;font-family:var(--font-data);font-size:var(--text-xs);line-height:18px;color:var(--ink);text-align:center}
[data-screen="MSettingsDevices"] .slip hr{border:0;border-top:1px dashed #cbd5e1;margin:8px 0}`;

export default function MSettingsDevicesScreen() {
  const { ready, tick, ctx } = useAppData(['gc:app-settings']);
  const dev = useMemo(() => (ready ? getDevices() : null), [ready, tick]);
  const [sheet, setSheet] = useState('');       // pair | test
  const [kind, setKind] = useState('printer');  // what the pair sheet looks for
  const [via, setVia] = useState('bluetooth');
  const [phase, setPhase] = useState('');       // searching | found | connecting
  const [picked, setPicked] = useState('');
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const search = (v = via) => {
    setPhase('searching');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPhase('found'), 1400);
    setVia(v);
  };
  const openPair = (k) => { setKind(k); setPicked(''); setSheet('pair'); search(via); };
  const connect = (d) => {
    setPicked(d.name);
    setPhase('connecting');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (kind === 'printer') setDevices({ printer: { name: d.name, via, paper: /80 mm/.test(d.sub) ? '80' : '58', at: Date.now() } });
      else setDevices({ scanner: { external: { name: d.name, via } } });
      setSheet('');
      setPhase('');
      toast(d.name + ' connected');
    }, 900);
  };
  const forget = async (what) => {
    const name = what === 'printer' ? dev.printer.name : dev.scanner.external.name;
    const ok = await confirmDialog({ title: `Forget ${name}?`, body: 'You can pair it again any time.', confirmLabel: 'Forget', tone: 'danger' });
    if (!ok) return;
    if (what === 'printer') setDevices({ printer: null }); else setDevices({ scanner: { external: null } });
    toast(name + ' forgotten');
  };
  const set = (patch, msg) => { setDevices(patch); if (msg) toast(msg); };

  const shop = ready ? safe(() => businessProfile().brand.name, 'Your shop') : '';
  const p = dev && dev.printer;
  const ext = dev && dev.scanner.external;
  const list = FOUND[via].filter((d) => d.kind === kind);
  const scanHref = ctx && canUse('/m-scan', ctx) ? '/m-scan' : null;
  const counters = ctx && hasModule('pos', ctx.ed);

  return (
    <AppScreen name="MSettingsDevices" title="Devices" css={CSS}>
      <AppBar title="Devices" back="/m-settings" />
      <Content top={103} bottom={0}>
        {!dev ? <Skeleton rows={3} /> : (
          <>
            <GroupLabel>Receipt printer</GroupLabel>
            <Card>
              {p ? (
                <>
                  <div className="lrow">
                    <span className="set-ico"><Icon name="receipt" size={20} /></span>
                    <span style={{ flex: '1', minWidth: '0' }}>
                      <span className="ell" style={{ display: 'block', fontSize: 'var(--text-sm-plus)', fontWeight: 'var(--weight-medium)' }}>{p.name}</span>
                      <span style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{p.via === 'usb' ? 'USB' : 'Bluetooth'} · paired {dateText(p.at)}</span>
                    </span>
                    <Pill tone="ok" shape>Connected</Pill>
                  </div>
                  <div className="lrow">
                    <span style={{ flex: '1', fontSize: 'var(--text-sm-plus)', fontWeight: 'var(--weight-medium)' }}>Paper</span>
                    <Segmented items={[{ key: '58', label: '58 mm' }, { key: '80', label: '80 mm' }]} value={p.paper} onChange={(k) => set({ printer: { ...p, paper: k } })} style={{ margin: '0', width: '180px' }} />
                  </div>
                  <div className="lrow" style={{ gap: '10px' }}>
                    <Button kind="soft" style={{ flex: 1 }} onClick={() => setSheet('test')}>Test print</Button>
                    <Button kind="line" style={{ flex: 1 }} onClick={() => forget('printer')}>Forget</Button>
                  </div>
                </>
              ) : (
                <div className="lrow">
                  <span className="set-ico"><Icon name="receipt" size={20} /></span>
                  <span style={{ flex: '1', minWidth: '0' }}>
                    <span style={{ display: 'block', fontSize: 'var(--text-sm-plus)', fontWeight: 'var(--weight-medium)' }}>No printer yet</span>
                    <span style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>Print receipts from this phone</span>
                  </span>
                  <Button kind="primary" style={{ height: '36px' }} onClick={() => openPair('printer')}>Pair</Button>
                </div>
              )}
            </Card>

            <GroupLabel>Barcode scanner</GroupLabel>
            <Card>
              <SwitchRow label="Use the camera" sub="Scan barcodes with this phone" on={dev.scanner.camera} onChange={(on) => set({ scanner: { camera: on } }, on ? 'Camera scanning on' : 'Camera scanning off')} />
              <SwitchRow label="Beep" sub="A short sound when a code is read" on={dev.scanner.beep} onChange={(on) => { set({ scanner: { beep: on } }); if (on) beep(); }} />
              <SwitchRow label="Vibrate" sub="A buzz when a code is read" on={dev.scanner.vibrate} onChange={(on) => { set({ scanner: { vibrate: on } }); if (on) safe(() => navigator.vibrate && navigator.vibrate(60), null); }} />
              {ext
                ? <SetRow label={ext.name} sub={(ext.via === 'usb' ? 'USB' : 'Bluetooth') + ' scanner · tap to forget'} end={<Pill tone="ok" shape>Connected</Pill>} onClick={() => forget('scanner')} />
                : <SetRow label="Bluetooth or USB scanner" sub="For fast scanning at a desk" value="Pair" onClick={() => openPair('scanner')} />}
              {scanHref ? <SetRow label="Try the scanner" href={scanHref} /> : null}
            </Card>

            <GroupLabel>Cash drawer</GroupLabel>
            <Card>
              <SwitchRow label="Open after a cash sale" sub={p ? 'Through the receipt printer’s drawer port' : 'Pair a receipt printer first'} on={!!(p && dev.drawer.kick)} disabled={!p} onChange={(on) => set({ drawer: { kick: on } })} />
              <div className="lrow">
                <Button kind="line" style={{ flex: 1 }} disabled={!p} onClick={() => toast('Drawer opened')}>Open the drawer now</Button>
              </div>
            </Card>

            {counters ? (
              <div className="card" style={{ margin: '22px 20px 0' }}>
                <SetRow icon="store" label="Counter devices" sub="Each counter’s printer, card terminal and drawer" href="/pos-manage" />
              </div>
            ) : null}
            <div style={{ height: '8px' }} />
          </>
        )}
      </Content>

      <Sheet open={sheet === 'pair'} onClose={() => { setSheet(''); setPhase(''); }} title={kind === 'printer' ? 'Pair a printer' : 'Pair a scanner'}>
        <Segmented items={[{ key: 'bluetooth', label: 'Bluetooth' }, { key: 'usb', label: 'USB' }]} value={via} onChange={(k) => search(k)} style={{ margin: '0 0 12px' }} />
        <div style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)', marginBottom: '4px' }}>
          {via === 'usb' ? 'Plug the device into the phone with a USB OTG cable.' : `Turn the ${kind} on and keep it near the phone.`}
        </div>
        {phase === 'searching' ? (
          <div role="status" aria-label={'Looking for ' + kind + 's'}><Skeleton rows={2} card={false} /></div>
        ) : list.length ? list.map((d) => (
          <button key={d.name} type="button" className="opt" onClick={() => connect(d)} disabled={phase === 'connecting'}>
            <span className="set-ico"><Icon name={kind === 'printer' ? 'receipt' : 'scan'} size={20} /></span>
            <span style={{ flex: '1', minWidth: '0' }}>
              <span className="ell" style={{ display: 'block', fontWeight: 'var(--weight-medium)' }}>{d.name}</span>
              <span style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{phase === 'connecting' && picked === d.name ? 'Connecting…' : d.sub}</span>
            </span>
            {phase === 'connecting' && picked === d.name ? <Pill tone="nav">Connecting</Pill> : <Icon name="chev" size={18} stroke={2} style={{ color: 'var(--text-muted)' }} />}
          </button>
        )) : <div className="empty">Nothing found. Check the device is on.</div>}
        {phase === 'found' ? <Button kind="line" icon="refresh" style={{ width: '100%', marginTop: '10px' }} onClick={() => search()}>Search again</Button> : null}
      </Sheet>

      <Sheet open={sheet === 'test'} onClose={() => setSheet('')} title="Test print" footer={<Button kind="primary" onClick={() => { setSheet(''); toast('Test page sent to ' + (p ? p.name : 'the printer')); }}>Print</Button>}>
        <div className="slip" style={{ width: p && p.paper === '80' ? '280px' : '220px' }}>
          <b style={{ fontWeight: 'var(--weight-semibold)' }}>{shop}</b><br />
          Test print<hr />
          Printer · {p ? p.name : ''}<br />
          Paper · {p ? p.paper : '58'} mm<br />
          {ready ? dateText(Date.now(), { time: true }) : ''}<hr />
          If you can read this, the printer works.
        </div>
      </Sheet>
    </AppScreen>
  );
}
