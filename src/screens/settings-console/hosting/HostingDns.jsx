'use client';
// Hosting › DNS — how the domain's DNS is kept (GridCommerce DNS through our nameservers, or at the registrar), the
// nameservers and their check, every record (add / edit / delete in a side panel; the store's own records are locked,
// email records are kept by the Email tab), records for common services, zone import and export, and DNSSEC.

import React, { useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet } from '@/components/ui';
import { SearchField } from '@/components/ui/IndexKit';
import {
  zoneOf, nsState, recState, setDnsMode, checkNameservers, saveRecord, deleteRecord, recordProblem, TYPES, TYPE_HELP, TTLS, ttlLabel,
  TEMPLATES, addTemplate, parseZone, importZone, exportZone, NAMESERVERS, dsRecord, dnssecState, setDnssec, checkDnssec,
} from '@/lib/hosting';
import { recordsFor } from '@/lib/domains';
import { Card, Code, StateBadge, DomainPicker, Switch, done, download, copy } from './hsShared';

const blank = (type = 'A') => ({ id: '', type, name: '', value: '', ttl: 0, priority: 10, weight: 5, port: 443, flags: 0, tag: 'issue' });
const showValue = (r) => (r.type === 'MX' ? `${r.priority} ${r.value}` : r.type === 'SRV' ? `${r.priority} ${r.weight} ${r.port} ${r.value}` : r.type === 'CAA' ? `${r.flags || 0} ${r.tag} "${r.value}"` : r.value);

export default function HostingDns({ domains, host, setHost, now, goTab }) {
  const z = zoneOf(host);
  const ns = nsState(z, now);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [rec, setRec] = useState(null);       // the record being added / edited
  const [tpl, setTpl] = useState(null);       // { id, answer, err }
  const [imp, setImp] = useState(null);       // { text, err }
  const preview = useMemo(() => (imp && imp.text ? parseZone(imp.text, host) : null), [imp, host]);
  const list = z.records.filter((r) => (!type || r.type === type) && (!q || (r.name + ' ' + r.value).toLowerCase().includes(q.toLowerCase())));
  const gc = z.mode === 'gc';
  const ds = dsRecord(host);
  const dsState = dnssecState(z, now);

  const mode = async (m) => {
    if (m === z.mode) return;
    if (m === 'registrar' && !(await confirmDialog({ title: 'Keep DNS at your registrar?', body: 'Records you added here stop working once the nameservers point back to your registrar. Add them there first.', confirmLabel: 'Keep DNS at registrar' }))) return;
    if (done(setDnsMode(host, m), m === 'gc' ? 'GridCommerce DNS is on. Now change the nameservers at your registrar.' : 'DNS is kept at your registrar')) setQ('');
  };
  const save = () => {
    const why = recordProblem(rec, z.records);
    if (why) { setRec({ ...rec, err: why }); return; }
    const res = saveRecord(host, rec);
    if (res.ok === false) { setRec({ ...rec, err: res.error }); return; }
    toast(rec.id ? 'Record changed. It goes live in a few seconds.' : 'Record added. It goes live in a few seconds.');
    setRec(null);
  };
  const remove = async (r) => {
    if (await confirmDialog({ title: `Delete the ${r.type} record ${r.name}?`, body: 'Anything that uses it stops working once the change spreads.', confirmLabel: 'Delete record', tone: 'danger' })) done(deleteRecord(host, r.id), 'Record deleted');
  };
  const addTpl = () => {
    const res = addTemplate(host, tpl.id, tpl.answer);
    if (res.ok === false) { setTpl({ ...tpl, err: res.error }); return; }
    toast(res.count === 1 ? '1 record added' : res.count + ' records added');
    setTpl(null);
  };
  const doImport = () => {
    const res = importZone(host, imp.text);
    if (res.ok === false) { setImp({ ...imp, err: res.error }); return; }
    toast(`${res.added} added${res.problems.length ? ', ' + res.problems.length + ' not added' : ''}${res.skipped ? ', ' + res.skipped + ' skipped' : ''}`);
    setImp(res.problems.length ? { text: '', err: res.problems.slice(0, 4).join(' · ') } : null);
  };
  const tplDef = tpl ? TEMPLATES.find((t) => t.id === tpl.id) : null;

  return (
    <>
      <Card title="How DNS is kept" id="hs-dns-mode">
        <DomainPicker domains={domains} host={host} onChange={setHost} />
        <div className="hs-opts" role="group" aria-label="How DNS is kept">
          <button type="button" className="hs-opt" aria-pressed={gc} onClick={() => mode('gc')}>
            <b><Icon name="server" width="16" height="16" aria-hidden="true" />GridCommerce DNS</b>
            <small>Point the nameservers to us. We keep every record, email is set up in one click.</small>
          </button>
          <button type="button" className="hs-opt" aria-pressed={!gc} onClick={() => mode('registrar')}>
            <b><Icon name="building-2" width="16" height="16" aria-hidden="true" />At your registrar</b>
            <small>Keep DNS where you bought the domain and add the store’s records there.</small>
          </button>
        </div>
        {gc ? (
          <>
            <div className="hs-card__head"><span className="hs-row__text">Nameservers at your registrar</span><StateBadge state={ns === 'active' ? 'active' : ns === 'checking' ? 'checking' : 'pending'} /></div>
            {NAMESERVERS.map((n) => <Code key={n} text={n} label={n} />)}
            {ns !== 'active' ? (
              <div className="hs-acts">
                <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" disabled={ns === 'checking'} onClick={() => done(checkNameservers(host), 'Checking the nameservers. This takes a moment.')}>Check nameservers</button>
                <span className="hs-sub">Replace the old nameservers with these two. Changes can take a few hours to spread.</span>
              </div>
            ) : <p className="hs-sub">Your registrar points to GridCommerce. Records below are live on the internet.</p>}
          </>
        ) : (
          <>
            <p className="hs-sub">Add these records at your registrar. Everything else (email, other services) you keep there too.</p>
            {recordsFor(host).map((r) => <Code key={r.type + r.name} text={`${r.type}  ${r.name}  ${r.value}`} label={r.type + ' record'} />)}
            <p className="hs-sub">Email records are listed in the <button type="button" className="bl-link" onClick={() => goTab('email')}>Email</button> tab.</p>
          </>
        )}
      </Card>

      {gc ? (
        <Card title={'Records · ' + host} id="hs-dns-recs"
          actions={<span className="hs-acts">
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => setTpl({ id: TEMPLATES[0].id, answer: '', err: '' })}>Add for a service</button>
            <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => setRec({ ...blank(), err: '' })}><Icon name="plus" width="14" height="14" aria-hidden="true" />Add record</button>
          </span>}>
          <div className="hs-acts">
            <span style={{ flex: '1 1 200px' }}><SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search names and values" /></span>
            <select className="ix-filter" aria-label="Record type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">All types</option>{TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="hs-list" role="table" aria-label={'DNS records for ' + host}>
            <div className="hs-rec hs-rec--head" role="row"><span role="columnheader">Type</span><span role="columnheader">Name</span><span role="columnheader">Value</span><span role="columnheader" className="hs-rec__ttl">TTL</span><span role="columnheader">Status</span><span role="columnheader"><span className="sr-only">Actions</span></span></div>
            {list.map((r) => (
              <div key={r.id} className="hs-rec" role="row">
                <b role="cell">{r.type}</b>
                <span role="cell" className="hs-rec__name">{r.name}</span>
                <span role="cell" className="hs-rec__val">{showValue(r)}{r.sys ? <small><Icon name="lock" width="12" height="12" aria-hidden="true" /> The store needs this record</small> : r.managed === 'email' ? <small>Kept by the Email tab</small> : null}</span>
                <span role="cell" className="hs-rec__ttl">{ttlLabel(r.ttl)}</span>
                <span role="cell" className="hs-rec__state"><StateBadge state={recState(r, now)} /></span>
                <span role="cell" className="hs-rec__acts">
                  {r.sys ? <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Copy value" title="Copy" onClick={() => copy(r.value)}><Icon name="copy" width="14" height="14" aria-hidden="true" /></button>
                    : r.managed === 'email' ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => goTab('email')}>Email</button>
                    : <>
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label={'Edit ' + r.type + ' ' + r.name} title="Edit" onClick={() => setRec({ ...blank(), ...r, err: '' })}><Icon name="pencil" width="14" height="14" aria-hidden="true" /></button>
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label={'Delete ' + r.type + ' ' + r.name} title="Delete" onClick={() => remove(r)}><Icon name="trash-2" width="14" height="14" aria-hidden="true" /></button>
                    </>}
                </span>
              </div>
            ))}
            {!list.length ? <p className="hs-sub" style={{ padding: 'var(--space-3) 0' }}>No records match.</p> : null}
          </div>
          <div className="hs-acts">
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => setImp({ text: '', err: '' })}><Icon name="file-up" width="14" height="14" aria-hidden="true" />Import zone file</button>
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => { download(host + '.zone.txt', exportZone(host)); toast('Zone file downloaded'); }}><Icon name="download" width="14" height="14" aria-hidden="true" />Export zone file</button>
            <span className="hs-sub">{z.records.length} records</span>
          </div>
        </Card>
      ) : null}

      {gc ? (
        <Card title="DNSSEC" id="hs-dnssec" sub="Signs your DNS answers so nobody can fake them. Your registrar holds the DS record."
          actions={<Switch on={!!(z.dnssec && z.dnssec.on)} label="DNSSEC" onChange={(on) => done(setDnssec(host, on), on ? 'DNSSEC is on. Add the DS record at your registrar.' : 'DNSSEC is off. Remove the DS record at your registrar first.')} />}>
          {z.dnssec && z.dnssec.on ? (
            <>
              <div className="hs-card__head"><span className="hs-row__text">DS record for your registrar</span><StateBadge state={dsState === 'active' ? 'active' : dsState === 'checking' ? 'checking' : 'waiting'} /></div>
              <div className="hs-two">
                <div><span className="hs-sub">Key tag</span><Code text={String(ds.keyTag)} label="key tag" /></div>
                <div><span className="hs-sub">Algorithm · Digest type</span><Code text={`${ds.algorithm} (ECDSA P-256) · ${ds.digestType} (SHA-256)`} label="algorithm" /></div>
              </div>
              <div><span className="hs-sub">Digest</span><Code text={ds.digest} label="digest" /></div>
              {dsState !== 'active' ? <div><button type="button" className="ix-btn ix-btn--sm ix-btn--primary" disabled={dsState === 'checking'} onClick={() => done(checkDnssec(host), 'Checking the DS record…')}>Check DS record</button></div> : null}
            </>
          ) : null}
        </Card>
      ) : null}

      <Sheet open={!!rec} title={rec && rec.id ? 'Edit record' : 'Add record'} onClose={() => setRec(null)}
        footer={rec ? <><button type="button" className="gc-btn gc-btn--neutral" style={{ marginRight: 'auto' }} onClick={() => setRec(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={save}>Save record</button></> : null}>
        {rec ? (
          <div className="hs-form">
            <div><label className="gc-label" htmlFor="hs-r-type">Type</label>
              <select id="hs-r-type" className="gc-input gc-select" value={rec.type} disabled={!!rec.id} onChange={(e) => setRec({ ...rec, type: e.target.value, err: '' })}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
              <p className="hs-sub" style={{ marginTop: 4 }}>{TYPE_HELP[rec.type]}</p></div>
            <div><label className="gc-label" htmlFor="hs-r-name">Name</label>
              <input id="hs-r-name" className="gc-input" value={rec.name} placeholder={rec.type === 'SRV' ? '_sip._tls' : '@ or www'} onChange={(e) => setRec({ ...rec, name: e.target.value, err: '' })} />
              <p className="hs-sub" style={{ marginTop: 4 }}>{(rec.name || '@') === '@' ? host : (rec.name || '') + '.' + host}</p></div>
            {['MX', 'SRV'].includes(rec.type) ? (
              <div className="hs-two">
                <div><label className="gc-label" htmlFor="hs-r-pri">Priority</label><input id="hs-r-pri" className="gc-input" inputMode="numeric" value={rec.priority} onChange={(e) => setRec({ ...rec, priority: e.target.value.replace(/\D/g, ''), err: '' })} /></div>
                {rec.type === 'SRV' ? <div><label className="gc-label" htmlFor="hs-r-w">Weight</label><input id="hs-r-w" className="gc-input" inputMode="numeric" value={rec.weight} onChange={(e) => setRec({ ...rec, weight: e.target.value.replace(/\D/g, ''), err: '' })} /></div> : null}
              </div>
            ) : null}
            {rec.type === 'SRV' ? <div><label className="gc-label" htmlFor="hs-r-port">Port</label><input id="hs-r-port" className="gc-input" inputMode="numeric" value={rec.port} onChange={(e) => setRec({ ...rec, port: e.target.value.replace(/\D/g, ''), err: '' })} /></div> : null}
            {rec.type === 'CAA' ? (
              <div className="hs-two">
                <div><label className="gc-label" htmlFor="hs-r-tag">Allows</label><select id="hs-r-tag" className="gc-input gc-select" value={rec.tag} onChange={(e) => setRec({ ...rec, tag: e.target.value, err: '' })}><option value="issue">issue (certificates)</option><option value="issuewild">issuewild (wildcards)</option><option value="iodef">iodef (report address)</option></select></div>
                <div><label className="gc-label" htmlFor="hs-r-flags">Flags</label><select id="hs-r-flags" className="gc-input gc-select" value={rec.flags} onChange={(e) => setRec({ ...rec, flags: Number(e.target.value) })}><option value={0}>0</option><option value={128}>128 (critical)</option></select></div>
              </div>
            ) : null}
            <div><label className="gc-label" htmlFor="hs-r-val">{{ A: 'IPv4 address', AAAA: 'IPv6 address', CNAME: 'Points to', MX: 'Mail server', TXT: 'Text', SRV: 'Target', CAA: 'Authority', NS: 'Nameserver' }[rec.type]}</label>
              {rec.type === 'TXT'
                ? <textarea id="hs-r-val" className="gc-input" rows={4} value={rec.value} onChange={(e) => setRec({ ...rec, value: e.target.value, err: '' })} />
                : <input id="hs-r-val" className="gc-input" value={rec.value} placeholder={{ A: '103.112.54.20', AAAA: '2001:db8::1', CNAME: 'example.com', MX: 'mail.example.com', SRV: 'sip.example.com', CAA: 'letsencrypt.org', NS: 'ns1.example.com' }[rec.type]} onChange={(e) => setRec({ ...rec, value: e.target.value, err: '' })} />}</div>
            <div><label className="gc-label" htmlFor="hs-r-ttl">TTL</label>
              <select id="hs-r-ttl" className="gc-input gc-select" value={rec.ttl} onChange={(e) => setRec({ ...rec, ttl: Number(e.target.value) })}>{TTLS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
              <p className="hs-sub" style={{ marginTop: 4 }}>How long the world keeps the old answer. Auto is 5 minutes.</p></div>
            {rec.err ? <p className="hs-err" role="alert">{rec.err}</p> : null}
          </div>
        ) : null}
      </Sheet>

      <Sheet open={!!tpl} title="Add records for a service" onClose={() => setTpl(null)}
        footer={tpl ? <><button type="button" className="gc-btn gc-btn--neutral" style={{ marginRight: 'auto' }} onClick={() => setTpl(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={addTpl}>Add records</button></> : null}>
        {tpl ? (
          <div className="hs-form">
            <div className="hs-list" role="radiogroup" aria-label="Service">
              {TEMPLATES.map((t) => (
                <label key={t.id} className="hs-row" style={{ cursor: 'pointer' }}>
                  <input type="radio" name="hs-tpl" checked={tpl.id === t.id} onChange={() => setTpl({ id: t.id, answer: '', err: '' })} />
                  <span className="hs-row__text">{t.label}{t.ask ? <small>Needs: {t.ask}</small> : null}</span>
                </label>
              ))}
            </div>
            {tplDef && tplDef.ask ? <div><label className="gc-label" htmlFor="hs-tpl-a">{tplDef.ask}</label><input id="hs-tpl-a" className="gc-input" value={tpl.answer} onChange={(e) => setTpl({ ...tpl, answer: e.target.value, err: '' })} /></div> : null}
            {tplDef ? <div><span className="hs-sub">Will add</span>{tplDef.make(tpl.answer || '…').map((r, i) => <Code key={i} text={`${r.type}  ${r.name}  ${showValue({ ...r, flags: r.flags || 0 })}`} label="record" />)}</div> : null}
            {tpl.err ? <p className="hs-err" role="alert">{tpl.err}</p> : null}
          </div>
        ) : null}
      </Sheet>

      <Sheet open={!!imp} title="Import zone file" onClose={() => setImp(null)}
        footer={imp ? <><button type="button" className="gc-btn gc-btn--neutral" style={{ marginRight: 'auto' }} onClick={() => setImp(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" disabled={!preview || !preview.records.length} onClick={doImport}>{preview && preview.records.length ? `Import ${preview.records.length} records` : 'Import'}</button></> : null}>
        {imp ? (
          <div className="hs-form">
            <p className="hs-sub">Paste the zone file from your old DNS host (BIND format). Records already here are kept; the store’s own records can’t be replaced.</p>
            <textarea className="gc-input" rows={10} aria-label="Zone file" style={{ fontFamily: 'var(--font-data)' }} placeholder={'www   3600  IN  CNAME  example.com.\n@     3600  IN  MX     10 mail.example.com.'} value={imp.text} onChange={(e) => setImp({ text: e.target.value, err: '' })} />
            {preview ? <p className="hs-sub">{preview.records.length} records found{preview.skipped.length ? `, ${preview.skipped.length} lines skipped` : ''}.</p> : null}
            {preview && preview.records.length ? <div className="hs-list">{preview.records.slice(0, 8).map((r, i) => <span key={i} className="hs-code"><span>{r.type} · {r.name} · {showValue(r)}</span></span>)}</div> : null}
            {imp.err ? <p className="hs-err" role="alert">{imp.err}</p> : null}
          </div>
        ) : null}
      </Sheet>
    </>
  );
}
