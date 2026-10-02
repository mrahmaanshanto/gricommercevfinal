'use client';
// Attendance devices (/attendance-devices) — the fingerprint / face machines at each place (src/lib/hr.js › devices):
// connection, last sync, punches today; who is enrolled on which machine (fingerprints, face, card); today's punch
// log; and adding a machine. Front end only: syncing pretends the machine answered. A machine is a small card with
// Sync / Edit / Remove (there is no machine page); a person in the enrolment list opens the enrolment dialog.

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Dialog, EmptyState, StatusBadge, InfoTip } from '@/components/ui';
import { MetricStrip, KV, LearnMore } from '@/components/ui/IndexKit';
import { formatDate, formatTime } from '@/lib/format';
import {
  DEVICE_KINDS, HR_PLACES, saveDevice, removeDevice, syncDevice, saveEnrolment, enrolmentOf, punchesOn, todayKey, t12, devicesAt,
} from '@/lib/hr';
import { HrPage, useHr, Person, rowGo } from './hrShared';
import { FORM_CSS, Seg } from '@/screens/staff-profile/staffForm';

const CSS = `
.ad-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr));gap:var(--space-3);padding:var(--space-3) var(--space-4) var(--space-4)}
.ad-dev{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-xl)}
.ad-dev.is-off{border-color:var(--text-danger)}
.ad-dev header{display:flex;align-items:flex-start;gap:var(--space-3)}
.ad-dev header b{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ad-dev .ix-kv{font-size:var(--text-xs)}
.ad-dev .ix-kv dd{font-family:var(--font-data)}
.ad-acts{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.ad-split{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:var(--space-4);align-items:start}
.ad-log{display:flex;flex-direction:column;max-height:520px;overflow:auto}
.ad-log > div{display:flex;align-items:center;gap:var(--space-3);min-height:40px;padding:4px var(--space-4);border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.ad-log > div:first-child{border-top:0}
.ad-log time{width:68px;flex:none;font-family:var(--font-data);color:var(--text-heading)}
.ad-steps{margin:0;padding:0 var(--space-4) var(--space-4) calc(var(--space-4) + 18px);font-size:var(--text-sm);line-height:1.7;color:var(--text-body)}
@media (max-width:1500px){.ad-split{grid-template-columns:minmax(0,1fr)}}
`;
const BRANDS = ['ZKTeco', 'Hikvision', 'Suprema', 'Dahua', 'Other'];

export default function AttendanceDevices() {
  const { S } = useHr();
  const today = todayKey(S);
  const devs = S.devices || [];
  const [edit, setEdit] = useState(null);
  const [enrol, setEnrol] = useState(null);
  const [place, setPlace] = useState('');
  const punches = punchesOn(S, today);
  const atMachines = S.staff.filter((s) => s.status !== 'left' && devicesAt(S, s.branch).length);
  const rows = atMachines.filter((s) => !place || s.branch === place).map((s) => ({ s, en: enrolmentOf(S, s) }));
  const missing = atMachines.filter((s) => !enrolmentOf(S, s).ok);
  const off = devs.filter((d) => d.status !== 'online');

  const save = (e) => {
    e.preventDefault();
    if (!edit.name.trim()) { toast('Name the machine', { tone: 'error' }); return; }
    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(edit.ip.trim())) { toast('The IP address looks wrong, e.g. 192.168.10.21', { tone: 'error' }); return; }
    const row = saveDevice({ ...edit, name: edit.name.trim(), ip: edit.ip.trim() });
    toast(edit.id ? `${row.name} saved.` : `${row.name} added. Enrol people at ${row.place} on it.`);
    setEdit(null);
  };
  const sync = (d) => {
    syncDevice(d.id);
    toast(d.status === 'online' ? `${d.name} synced — no new punches since ${formatTime(d.lastSync)}.` : `${d.name} answered again and is back online.`);
  };
  const remove = async (d) => {
    if (!(await confirmDialog({ title: `Remove ${d.name}?`, body: `People at ${d.place} will need the staff app or the POS to clock in. Punches already pulled are kept.`, confirmLabel: 'Remove', tone: 'danger' }))) return;
    removeDevice(d.id);
    toast(`${d.name} removed.`);
  };
  const saveEnrol = (e) => {
    e.preventDefault();
    saveEnrolment(enrol.s.code, { fingers: enrol.fingers, face: enrol.face, card: enrol.card });
    toast(`${enrol.s.name}’s enrolment saved.`);
    setEnrol(null);
  };

  const openEnrol = (s, en) => { const b = s.bio || {}; setEnrol({ s, device: en.device, fingers: b.fingers || 0, face: !!b.face, card: b.card || '' }); };

  return (
    <HrPage screen="AttendanceDevices" active="hr-devices" page="Attendance devices" title="Attendance devices" icon="fingerprint" css={FORM_CSS + CSS}
      about="Fingerprint and face machines at each place, who is enrolled on them, and today’s punches. Each machine sends its punches to GridCommerce over the internet."
      more={[{ label: 'Attendance', href: '/attendance' }, { label: 'Attendance rules', href: '/hr-setup?sec=att' }]}
      primary={{ label: 'Add machine', onClick: () => setEdit({ name: '', place: HR_PLACES[1] || HR_PLACES[0], kind: 'finger', brand: 'ZKTeco', model: '', serial: '', ip: '192.168.', port: 4370 }) }}>
      <MetricStrip label="Machines" items={[
        { label: 'Machines', value: String(devs.length), sub: off.length ? `${off.length} offline` : 'all online' },
        { label: 'Punches today', value: String(punches.length), sub: `${punches.filter((p) => p.device).length} from machines`, href: '/attendance' },
        { label: 'Enrolled', value: `${atMachines.length - missing.length} of ${atMachines.length}`, sub: missing.length ? `${missing.length} not yet` : null },
        { label: 'Last sync', value: devs.length ? formatTime(Math.max(...devs.map((d) => d.lastSync || 0))) : '—', sub: 'every 5 minutes' },
      ]} />

      <section className="ix-card" aria-labelledby="ad-machines">
        <header className="ix-card__head"><h2 id="ad-machines">Machines</h2></header>
        {devs.length ? (
          <div className="ad-grid">
            {devs.map((d) => {
              const isOff = d.status !== 'online';
              const [kind] = DEVICE_KINDS[d.kind] || DEVICE_KINDS.finger;
              const people = S.staff.filter((s) => s.status !== 'left' && s.branch === d.place);
              return (
                <div key={d.id} className={'ad-dev' + (isOff ? ' is-off' : '')}>
                  <header>
                    <div style={{ flex: 1, minWidth: 0 }}><b>{d.name}</b><span className="hr-sub">{d.place} · {kind}</span></div>
                    <StatusBadge tone={isOff ? 'error' : 'success'}>{isOff ? 'Offline' : 'Online'}</StatusBadge>
                  </header>
                  <KV rows={[['Model', `${d.brand} ${d.model || '—'}`], ['Serial', d.serial || '—'], ['Address', `${d.ip}:${d.port}`], ['Last sync', d.lastSync ? `${formatDate(d.lastSync)} ${formatTime(d.lastSync)}` : '—'], ['People', `${people.filter((s) => enrolmentOf(S, s).ok).length} of ${people.length} enrolled`]]} />
                  {isOff && d.note ? <div className="hr-note hr-note--error"><Icon name="wifi-off" width="16" height="16" aria-hidden="true" /><span>{d.note}</span></div> : null}
                  <div className="ad-acts">
                    <button type="button" className="ix-btn ix-btn--sm" onClick={() => sync(d)}><Icon name="refresh-cw" width="16" height="16" aria-hidden="true" />{isOff ? 'Try again' : 'Sync now'}</button>
                    <button type="button" className="ix-btn ix-btn--sm" onClick={() => setEdit({ ...d })}>Edit</button>
                    <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Remove ${d.name}`} onClick={() => remove(d)}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <div className="ix-empty"><EmptyState icon="fingerprint" title="No machines yet" /></div>}
      </section>

      <div className="ad-split">
        <section className="ix-card" aria-labelledby="ad-enrol">
          <header className="ix-card__head">
            <h2 id="ad-enrol">Enrolment <InfoTip text="Save a person’s fingerprint or face on the machine, then mark it here." /></h2>
            <select className={'ix-filter' + (place ? ' is-set' : '')} aria-label="Place" value={place} onChange={(e) => setPlace(e.target.value)}><option value="">All places</option>{[...new Set(devs.map((d) => d.place))].map((p) => <option key={p}>{p}</option>)}</select>
          </header>
          {rows.length ? (
            <>
              <ul className="ix-plist" aria-label="Enrolment">
                {rows.map(({ s, en }) => (
                  <li key={s.code}>
                    <button type="button" className="ix-pitem" onClick={() => openEnrol(s, en)}>
                      <span className="ix-pitem__top"><b>{s.name}</b>{en.ok ? <StatusBadge tone="success">Enrolled</StatusBadge> : <StatusBadge tone="warning">{en.needs} needed</StatusBadge>}</span>
                      <span className="ix-pitem__mid">{en.device ? en.device.name : '—'} · user {(s.bio || {}).uid || Number(s.code.replace(/\D/g, ''))}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="ix-table-wrap" style={{ marginTop: 'var(--space-2)' }}>
                <table className="ix-table gc-table--keep">
                  <caption className="sr-only">Enrolment</caption>
                  <thead><tr><th scope="col">Staff</th><th scope="col">Machine</th><th scope="col" className="ix-num">User no.</th><th scope="col">Saved</th><th scope="col">Status</th></tr></thead>
                  <tbody>{rows.map(({ s, en }) => {
                    const b = s.bio || {};
                    return (
                      <tr key={s.code} onClick={rowGo(() => openEnrol(s, en))}>
                        <td><Person st={s} sub={`clocks in with ${s.checkIn || '—'}`} /></td>
                        <td className="ix-muted">{en.device ? en.device.name : '—'}</td>
                        <td className="ix-num hr-fig">{b.uid || Number(s.code.replace(/\D/g, ''))}</td>
                        <td>{[b.fingers ? `${b.fingers} finger${b.fingers > 1 ? 's' : ''}` : '', b.face ? 'face' : '', b.card ? 'card' : ''].filter(Boolean).join(' · ') || <span className="ix-muted">Nothing</span>}</td>
                        <td>{en.ok ? <StatusBadge tone="success">Enrolled</StatusBadge> : <button type="button" className="ix-btn ix-btn--sm" onClick={() => openEnrol(s, en)}>Enrol · {en.needs}</button>}</td>
                      </tr>
                    );
                  })}</tbody>
                </table>
              </div>
            </>
          ) : <div className="ix-empty"><EmptyState icon="users" title="No one here" /></div>}
        </section>
        <section className="ix-card" aria-labelledby="ad-log">
          <header className="ix-card__head"><h2 id="ad-log">Today’s punches <InfoTip text="Newest first, from the machines, the staff app and POS log-ins." /></h2><Link href="/attendance">Attendance</Link></header>
          {punches.length ? (
            <div className="ad-log" style={{ paddingTop: 'var(--space-2)' }}>
              {punches.map((p, i) => (
                <div key={i}>
                  <time>{t12(p.time)}</time>
                  <Icon name={p.kind === 'in' ? 'log-in' : 'log-out'} width="16" height="16" aria-hidden="true" style={{ color: p.kind === 'in' ? 'var(--text-success)' : 'var(--text-muted)' }} />
                  <span style={{ flex: 1, minWidth: 0 }}><span className="hr-strong">{p.st.name}</span><span className="hr-sub">{p.kind === 'in' ? 'In' : 'Out'} · {p.device ? p.device.name : p.src}</span></span>
                </div>
              ))}
            </div>
          ) : <p className="hr-empty">No punches yet today.</p>}
        </section>
      </div>

      <details className="ix-card gc-disclose">
        <summary>How to connect a new machine</summary>
        <ol className="ad-steps">
          <li>On the machine: Menu › Comm. › Cloud Server Setting. Server address <b className="hr-fig">push.gridcommerce.com.bd</b>, port <b className="hr-fig">8081</b>, HTTPS on.</li>
          <li>Add it here with its serial number (Menu › System Info › Device Info) so its punches are matched to the place.</li>
          <li>Enrol each person with their user number — it is the number in their employee number (EMP-0142 → 142).</li>
          <li>Punches show in Attendance within 5 minutes. If a machine stops answering for 30 minutes, the HR dashboard says so.</li>
        </ol>
      </details>
      <LearnMore topic="attendance devices" />

      <Dialog open={!!edit} title={edit && edit.id ? `Edit · ${edit.name}` : 'Add a machine'} onClose={() => setEdit(null)} width={620}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEdit(null)}>Cancel</button><button type="submit" form="ad-form" className="gc-btn gc-btn--solid">{edit && edit.id ? 'Save' : 'Add machine'}</button></>}>
        {edit ? (
          <form id="ad-form" className="hr-form" onSubmit={save}>
            <div className="hr-two">
              <div><label className="gc-label" htmlFor="ad-name">Name</label><input id="ad-name" className="gc-input" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="e.g. Mirpur back door" data-autofocus /></div>
              <div><label className="gc-label" htmlFor="ad-place">Place</label><select id="ad-place" className="gc-input gc-select" value={edit.place} onChange={(e) => setEdit({ ...edit, place: e.target.value })}>{HR_PLACES.map((p) => <option key={p}>{p}</option>)}</select></div>
            </div>
            <div><span className="gc-label">Reads</span><Seg label="Reads" value={edit.kind} options={Object.entries(DEVICE_KINDS).map(([k, [l]]) => [k, l])} onChange={(v) => setEdit({ ...edit, kind: v })} /></div>
            <div className="hr-three">
              <div><label className="gc-label" htmlFor="ad-brand">Brand</label><select id="ad-brand" className="gc-input gc-select" value={edit.brand} onChange={(e) => setEdit({ ...edit, brand: e.target.value })}>{BRANDS.map((b) => <option key={b}>{b}</option>)}</select></div>
              <div><label className="gc-label" htmlFor="ad-model">Model</label><input id="ad-model" className="gc-input" value={edit.model} onChange={(e) => setEdit({ ...edit, model: e.target.value })} placeholder="K40 Pro" /></div>
              <div><label className="gc-label" htmlFor="ad-serial">Serial number</label><input id="ad-serial" className="gc-input hr-fig" value={edit.serial} onChange={(e) => setEdit({ ...edit, serial: e.target.value.toUpperCase() })} /></div>
              <div><label className="gc-label" htmlFor="ad-ip">IP address</label><input id="ad-ip" className="gc-input hr-fig" inputMode="decimal" value={edit.ip} onChange={(e) => setEdit({ ...edit, ip: e.target.value })} /></div>
              <div><label className="gc-label" htmlFor="ad-port">Port</label><input id="ad-port" className="gc-input hr-fig" inputMode="numeric" value={edit.port} onChange={(e) => setEdit({ ...edit, port: e.target.value.replace(/\D/g, '') })} /></div>
            </div>
            {devs.some((d) => d.id !== edit.id && d.place === edit.place) ? <div className="hr-note hr-note--info"><Icon name="info" width="16" height="16" aria-hidden="true" /><span>{edit.place} already has a machine. People enrolled there need saving on this one too.</span></div> : null}
          </form>
        ) : null}
      </Dialog>
      <Dialog open={!!enrol} title={enrol ? `Enrolment · ${enrol.s.name}` : 'Enrolment'} onClose={() => setEnrol(null)} width={520}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEnrol(null)}>Cancel</button><button type="submit" form="ad-enrol" className="gc-btn gc-btn--solid">Save</button></>}>
        {enrol ? (
          <form id="ad-enrol" className="hr-form" onSubmit={saveEnrol}>
            <p className="gc-help" style={{ margin: 0 }}>On {enrol.device ? enrol.device.name : 'the machine'}: Menu › User Mgt. › New User, user number <b className="hr-fig">{Number(enrol.s.code.replace(/\D/g, ''))}</b>, then save the fingerprint or face. Mark what was saved:</p>
            {!enrol.device || enrol.device.kind !== 'face' ? <div><span className="gc-label">Fingerprints</span><Seg label="Fingerprints" value={enrol.fingers} options={[[0, 'None'], [1, 'One'], [2, 'Two']]} onChange={(v) => setEnrol({ ...enrol, fingers: v })} /></div> : null}
            {enrol.device && (enrol.device.kind === 'face' || enrol.device.kind === 'both') ? <div><span className="gc-label">Face</span><Seg label="Face" value={enrol.face} options={[[false, 'Not yet'], [true, 'Saved']]} onChange={(v) => setEnrol({ ...enrol, face: v })} /></div> : null}
            <div><label className="gc-label" htmlFor="ad-card">Card number</label><input id="ad-card" className="gc-input hr-fig" value={enrol.card} onChange={(e) => setEnrol({ ...enrol, card: e.target.value.replace(/[^\dA-Za-z]/g, '') })} /></div>
          </form>
        ) : null}
      </Dialog>
    </HrPage>
  );
}
