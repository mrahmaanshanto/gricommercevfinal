'use client';
// Merchant app · GridAI (/m-gridai). New in the app's design (cards, list rows, pills, sheets and the chat composer of the
// MHome / MChat boards). Setup stays on the web; the phone runs the day:
//   Ask GridAI       the assistant about the shop: the same engine and answers as the web panel's GridAI
//                    (lib/gridai/engine.js › merchantTurn, components/gridai/Assistant.jsx): figures, tables, lists and
//                    links from the shop's own books, only what this person may open, in Bangla or English; 50 questions
//                    a day (gc.gridai.usage, shared with the web); 👍 / 👎 go to Grid AI › Quality (quality.rate);
//                    "Prepare follow-ups" sends a bulk message for approval (aiApprovals.requestApproval), never sends it
//   Customer messages (editions with the Inbox) how GridAI answers customers: the shop default and each connected chat
//                    channel as Auto / Assist / Off (lib/aiReply.js; Auto needs "Enable auto reply", changing needs
//                    "Configure Grid AI"), office hours, and today's figures from the activity log. Not set up (no chat
//                    channel connected or no AI provider on) → "Set up on the web".
//   Needs your OK    replies GridAI drafted for chats in Assist where the customer is waiting (Approve & send · Edit in
//                    the chat · Reject), and the actions it may only prepare (refunds, big discounts, stock changes, bulk
//                    messages: aiApprovals.decide, which checks "Approve high-risk AI actions" and the 24-hour expiry)
//   Knowledge        what GridAI knows (lib/gridai/knowledge.js sources) — edited on the web (/ai-knowledge)

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AppScreen, AppBar, Content, Section, Card, ListRow, Sheet, Button, Pill, Stat, StatRow, Note, EmptyState, Skeleton,
  TextInput, Icon, useAppData, toast, money,
} from '../kit/AppKit';
import { ME, getConvs, channelName, statusOf } from '@/lib/inbox';
import { currentUser } from '@/lib/team';
import { can, why } from '@/lib/permissions';
import { getAiSettings, saveAiSettings, AI_CONTROLS, AI_MODES, shopControl, AI_EVENT } from '@/lib/aiReply';
import { merchantTurn, customerTurn, MERCHANT_SUGGESTIONS } from '@/lib/gridai/engine';
import { requestApproval, getApprovals, decide, KINDS as APPROVAL_KINDS, APPROVALS_EVENT } from '@/lib/gridai/aiApprovals';
import { rate } from '@/lib/gridai/quality';
import { markRun } from '@/lib/gridai/usage';
import { getActivity, logAi, ACTIVITY_EVENT } from '@/lib/gridai/activity';
import { getSources, KB_EVENT } from '@/lib/gridai/knowledge';
import { CONNECTIONS_EVENT } from '@/lib/connections';
import { Face, ChLogo, XIcon, NoAccess } from './msgParts';
import { access, aiSetup, channelControl, waitingDrafts, personReply, ME_NAME } from './msgData';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const LIMIT = 50;
const USAGE = 'gc.gridai.usage';
const HIDE = 'gc.app.ai.hidden';
const today = () => new Date().toISOString().slice(0, 10);
const loadUsage = () => { try { const u = JSON.parse(window.localStorage.getItem(USAGE)); if (u && u.day === today()) return u; } catch { /* fall through */ } return { day: today(), questions: 18 }; };
const saveUsage = (u) => { try { window.localStorage.setItem(USAGE, JSON.stringify(u)); } catch { /* ignore */ } };
const readHidden = () => { try { return JSON.parse(window.sessionStorage.getItem(HIDE)) || {}; } catch { return {}; } };
const MODE_TONE = { auto: 'ok', assist: 'nav', off: 'grey' };
const MODE_WORD = { auto: 'Auto', assist: 'Assist', off: 'Off' };
const VOICE_SAMPLE = 'আজকে কত টাকার সেল হয়েছে?';
const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hm = (s) => { const [h, m] = String(s || '0:0').split(':').map(Number); return `${h % 12 || 12}${m ? ':' + String(m).padStart(2, '0') : ''} ${h < 12 ? 'AM' : 'PM'}`; };
const isBn = (t) => /[ঀ-৿]/.test(String(t || ''));
// the answers' links point at web pages; the ones the app has open in the app
function appHref(href, ctx) {
  const h = String(href || '');
  let m = /^\/order-detail\?id=([^&]+)/.exec(h);
  if (m && access('/m-orders', ctx)) return '/m-order-detail?id=' + m[1];
  m = /^\/merchant-inbox\?c=([^&]+)/.exec(h);
  if (m && access('/m-inbox', ctx)) return '/m-chat?id=' + m[1];
  if (/^\/merchant-orders/.test(h) && access('/m-orders', ctx)) return '/m-orders';
  if (/^\/stock$/.test(h) && access('/m-stock', ctx)) return '/m-stock';
  return h;
}

export default function MGridAIScreen() {
  const { ready, tick, ctx } = useAppData([AI_EVENT, APPROVALS_EVENT, ACTIVITY_EVENT, KB_EVENT, CONNECTIONS_EVENT], { every: 30000 });
  const [mode, setMode] = useState('home');
  const [first, setFirst] = useState('');
  const [sheet, setSheet] = useState(null);     // { kind: 'channel' | 'draft' | 'approval', … }
  const [hidden, setHidden] = useState({});
  const [all, setAll] = useState(false);
  useEffect(() => { if (ready) setHidden(readHidden()); }, [ready]);
  const hide = (key) => { const h = { ...readHidden(), [key]: 1 }; try { window.sessionStorage.setItem(HIDE, JSON.stringify(h)); } catch { /* ignore */ } setHidden(h); };

  const data = useMemo(() => {
    if (!ready || !ctx) return null;
    const setup = aiSetup(ctx.ed);
    const s = setup.settings || getAiSettings();
    const now = Date.now();
    const d0 = new Date(now); d0.setHours(0, 0, 0, 0);
    const act = safe(() => getActivity(), []).filter((a) => a.at >= d0.getTime());
    const convs = setup.comms ? safe(() => getConvs(), []) : [];
    const drafts = setup.ready ? waitingDrafts(convs, now, hidden) : [];
    const approvals = safe(() => getApprovals(now), []).filter((r) => r.status === 'waiting');
    const sources = safe(() => getSources(), []);
    return {
      setup, s, now, drafts, approvals,
      figures: { replied: act.filter((a) => a.kind === 'reply').length, drafts: act.filter((a) => a.kind === 'suggestion').length, people: act.filter((a) => a.kind === 'escalation' || a.kind === 'override').length },
      kb: { ready: sources.filter((x) => x.status === 'ready').length, review: sources.filter((x) => x.status === 'review' || x.status === 'failed').length, total: sources.length },
      open: convs.filter((c) => statusOf(c, now) === 'open').length,
    };
  }, [ready, tick, ctx, hidden]);

  if (ctx && !access('/m-gridai', ctx)) {
    return (
      <AppScreen name="MGridAI" title="GridAI">
        <AppBar title="GridAI" back="/m-more" />
        <Content top={103}><NoAccess title="GridAI isn’t part of your access." /></Content>
      </AppScreen>
    );
  }
  if (mode === 'ask') return <AskGridAI ctx={ctx} first={first} onBack={() => { setMode('home'); setFirst(''); }} />;

  const user = ready ? safe(() => currentUser(), null) : null;
  const mayEdit = !!(user && can(user, 'ai-configure'));
  const mayAuto = !!(user && can(user, 'ai-autoreply'));
  const ask = (q) => { setFirst(q || ''); setMode('ask'); };
  const setChannel = (ch, m) => {
    const s = getAiSettings();
    const c = { ...(s.channels || {}) };
    if (m) c[ch] = m; else delete c[ch];
    saveAiSettings({ ...s, channels: c });
    logAi({ kind: 'settings', title: 'AI replies changed', detail: channelName(ch) + ': ' + (m ? MODE_WORD[m] : 'shop default'), channel: ch, by: user ? user.name : 'You' });
    toast(`${channelName(ch)}: ${m ? MODE_WORD[m] : 'the shop default'}`);
    setSheet(null);
  };
  const setup = data ? data.setup : null;
  const hours = data ? data.s.hours : null;
  const waiting = data ? data.drafts.length + data.approvals.length : 0;

  return (
    <AppScreen name="MGridAI" title="GridAI">
      <AppBar title="GridAI" back="/m-more" />
      <Content top={103}>
        {/* ask */}
        <div className="card" style={{ margin: '2px 20px 0', padding: '18px 20px', background: 'linear-gradient(150deg,#012169,#0a4bb5)', color: '#fff', boxShadow: '0 16px 30px -18px rgba(0,48,135,.7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs-plus)', opacity: '.85' }}><Icon name="sparkles" size={16} />Ask GridAI</div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', marginTop: '4px', letterSpacing: 'var(--tracking-tight)' }}>What do you want to know?</div>
          <button type="button" onClick={() => ask('')} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', height: '46px', marginTop: '12px', padding: '0 6px 0 14px', border: 0, borderRadius: 'var(--radius-xl)', background: 'rgba(255,255,255,.14)', color: 'rgba(255,255,255,.85)', font: 'inherit', fontSize: 'var(--text-sm)', textAlign: 'left', cursor: 'pointer' }}>
            <span style={{ flex: 1 }}>Sales, orders, stock, follow-ups…</span>
            <span style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-lg)', background: '#fff', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><XIcon name="send" size={16} /></span>
          </button>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
            {MERCHANT_SUGGESTIONS.slice(0, 3).map(([q, lang]) => (
              <button key={q} type="button" lang={lang === 'bn' ? 'bn' : undefined} className={lang === 'bn' ? 'bn' : undefined} onClick={() => ask(q)}
                style={{ height: '32px', padding: '0 12px', border: '1px solid rgba(255,255,255,.25)', borderRadius: 'var(--radius-full)', background: 'transparent', color: '#fff', font: 'inherit', fontSize: 'var(--text-xs-plus)', cursor: 'pointer', maxWidth: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q}</button>
            ))}
          </div>
        </div>

        {/* customer messages */}
        {!data ? <><div className="sec"><h2>Customer messages</h2></div><Skeleton rows={3} /></> : setup.comms ? (
          <>
            <Section title="Customer messages" action={setup.ready ? <span style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{hours ? `${hours.days && hours.days.length === 6 && !hours.days.includes(5) ? 'Sat–Thu' : (hours.days || []).map((x) => DAY[x]).join(', ')} · ${hm(hours.from)}–${hm(hours.to)}` : ''}</span> : null}>
              {!setup.ready ? (
                <Card pad>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span className="ico"><Icon name="sparkles" /></span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 'var(--text-sm-plus)', fontWeight: 'var(--weight-semibold)' }}>GridAI messaging isn’t set up</div>
                      <div style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)', lineHeight: '18px', marginTop: '2px' }}>
                        {!setup.chats.length ? 'Connect a chat channel (Facebook, WhatsApp, Instagram …) so GridAI can read and answer messages.' : 'Turn on an AI provider so GridAI can write replies.'} Setup is done on the web.
                      </div>
                    </div>
                  </div>
                  <Button kind="primary" href={!setup.chats.length ? '/connections' : '/ai-models'} style={{ width: '100%', marginTop: '14px' }}>Set up on the web</Button>
                </Card>
              ) : (
                <>
                  <StatRow cols={3} style={{ margin: '0 20px 10px' }}>
                    <Stat label="Answered by GridAI" value={String(data.figures.replied)} tone="ok" />
                    <Stat label="Drafts sent" value={String(data.figures.drafts)} tone="nav" />
                    <Stat label="Handed to people" value={String(data.figures.people)} tone={data.figures.people ? 'warn' : 'grey'} />
                  </StatRow>
                  <Card>
                    <ListRow onClick={mayEdit ? () => setSheet({ kind: 'channel', ch: '' }) : undefined} icon="sparkles" title="Shop default"
                      sub={data.s.mode === 'auto-hours' || data.s.mode === 'auto' ? (AI_MODES.find((x) => x.k === data.s.mode) || AI_MODES[1]).label : 'Every channel follows this unless set'}
                      end={<Pill tone={MODE_TONE[shopControl(data.s)]}>{MODE_WORD[shopControl(data.s)]}</Pill>} chevron={mayEdit} />
                    {setup.chats.map((ch) => {
                      const own = (data.s.channels || {})[ch];
                      const m = channelControl(ch, data.s);
                      return (
                        <ListRow key={ch} onClick={mayEdit ? () => setSheet({ kind: 'channel', ch }) : undefined}
                          avatar={<span className="ico" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}><ChLogo ch={ch} size={24} /></span>}
                          title={channelName(ch)} sub={own ? 'Set for this channel' : 'Follows the shop default'}
                          end={<Pill tone={MODE_TONE[m]}>{MODE_WORD[m]}</Pill>} chevron={mayEdit} />
                      );
                    })}
                  </Card>
                  {!mayEdit ? <div className="help" style={{ margin: '8px 24px 0' }}>{why('ai-configure')}</div> : null}
                </>
              )}
            </Section>
          </>
        ) : null}

        {/* needs your OK */}
        <Section title="Needs your OK" action={data && waiting > 5 ? { label: all ? 'Show less' : `See all ${waiting}`, onClick: () => setAll(!all) } : data && waiting ? <span className="cnt" style={{ alignSelf: 'center' }}>{waiting}</span> : null}>
          {!data ? <Skeleton rows={2} /> : waiting ? (
            <Card>
              {(all ? data.drafts : data.drafts.slice(0, Math.max(2, 5 - Math.min(3, data.approvals.length)))).map(({ c, w, run }) => (
                <ListRow key={c.id} onClick={() => setSheet({ kind: 'draft', c, w, run, text: run.reply })}
                  avatar={<Face name={c.name} avatar={c.avatar} pos={c.pos} ch={c.ch} size={44} />}
                  title={c.name} sub={'Reply ready · “' + run.reply.replace(/\s+/g, ' ').slice(0, 60) + '”'}
                  end={<Pill tone={run.decision && run.decision.act === 'person' ? 'warn' : 'nav'}>{run.decision && run.decision.act === 'person' ? 'Check' : 'Reply'}</Pill>} />
              ))}
              {(all ? data.approvals : data.approvals.slice(0, 5 - Math.min(data.drafts.length, Math.max(2, 5 - Math.min(3, data.approvals.length))))).map((r) => (
                <ListRow key={r.id} onClick={() => setSheet({ kind: 'approval', r, reason: '' })} icon={r.kind === 'refund' ? 'undo' : r.kind === 'discount' ? 'tag' : r.kind === 'stock' ? 'layers' : r.kind === 'bulk-message' ? 'megaphone' : 'alert'}
                  title={r.title} sub={[r.customer, 'expires ' + expiresIn(r.expires, data.now)].filter(Boolean).join(' · ')}
                  end={<Pill tone={r.kind === 'refund' || r.kind === 'payment' ? 'err' : 'warn'}>{(APPROVAL_KINDS[r.kind] || ['Action'])[0].split(' ')[0]}</Pill>} />
              ))}
            </Card>
          ) : <Card><EmptyState icon="check" title="Nothing waiting for you" /></Card>}
        </Section>

        {/* knowledge */}
        <Section title="What GridAI knows">
          <Card>
            <ListRow href="/ai-knowledge" icon="clipboard" title="Knowledge & training"
              sub={data ? `${data.kb.ready} source${data.kb.ready === 1 ? '' : 's'} ready${data.kb.review ? ` · ${data.kb.review} need${data.kb.review === 1 ? 's' : ''} a look` : ''}` : ' '}
              end={<span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', flex: 'none' }}>On the web</span>} />
            <ListRow href="/ai-activity" icon="tasks" title="Activity & approvals" sub="Everything GridAI did and who decided"
              end={<span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', flex: 'none' }}>On the web</span>} />
          </Card>
          <div className="help" style={{ margin: '8px 24px 0' }}>Products, prices, stock and the shop’s policies are read live, so answers stay current. Files, website pages and FAQs are added on the web.</div>
        </Section>
        <div style={{ height: '8px' }} />
      </Content>

      {/* a channel's mode */}
      <Sheet open={!!sheet && sheet.kind === 'channel'} onClose={() => setSheet(null)} title={sheet && sheet.kind === 'channel' ? (sheet.ch ? channelName(sheet.ch) : 'Shop default') : ''}>
        {sheet && sheet.kind === 'channel' ? (() => {
          const cur = sheet.ch ? (data.s.channels || {})[sheet.ch] || '' : shopControl(data.s);
          const opts = sheet.ch ? [['', 'Shop default', 'Follow the shop default (' + MODE_WORD[shopControl(data.s)] + ')'], ...AI_CONTROLS] : AI_CONTROLS;
          const pick = (k) => {
            if (k === 'auto' && !mayAuto) { toast(why('ai-autoreply'), { tone: 'info' }); return; }
            if (sheet.ch) { setChannel(sheet.ch, k); return; }
            const s = getAiSettings();
            const next = k === 'off' ? 'off' : k === 'assist' ? 'suggest' : (s.mode === 'auto' ? 'auto' : 'auto-hours');
            saveAiSettings({ ...s, mode: next });
            logAi({ kind: 'settings', title: 'AI replies changed', detail: 'Shop default: ' + MODE_WORD[k], by: user ? user.name : 'You' });
            toast('Shop default: ' + MODE_WORD[k]);
            setSheet(null);
          };
          return (
            <>
              <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
                {opts.map(([k, l, s]) => (
                  <button key={k || 'default'} type="button" className="row" aria-pressed={cur === k} onClick={() => pick(k)}>
                    <span className="m"><span className="t" style={{ display: 'block' }}>{l}</span><span className="s" style={{ display: 'block', whiteSpace: 'normal' }}>{s}</span></span>
                    {cur === k ? <Icon name="check" size={20} stroke={2.2} /> : null}
                  </button>
                ))}
              </div>
              <div className="help" style={{ marginTop: '10px' }}>{sheet.ch ? 'One chat can still be changed on its own from the chat.' : 'Auto answers by itself only in office hours unless the web settings say “Auto always”.'} Office hours, the questions GridAI may answer and its tone are set on the web.</div>
            </>
          );
        })() : null}
      </Sheet>

      <DraftSheet sheet={sheet && sheet.kind === 'draft' ? sheet : null} onClose={() => setSheet(null)} onDone={(key) => { hide(key); setSheet(null); }} />
      <ApprovalSheet sheet={sheet && sheet.kind === 'approval' ? sheet : null} onClose={() => setSheet(null)} user={user} />
    </AppScreen>
  );
}

function expiresIn(t, now) {
  const m = Math.max(0, Math.round((t - now) / 60000));
  return m >= 60 ? `in ${Math.floor(m / 60)} h` : `in ${m} min`;
}

/** A reply GridAI drafted: send it (as written or edited), edit it in the chat, or reject it. */
function DraftSheet({ sheet, onClose, onDone }) {
  const [text, setText] = useState('');
  useEffect(() => { if (sheet) setText(sheet.text); }, [sheet && sheet.c.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!sheet) return null;
  const { c, w, run } = sheet;
  const key = c.id + ':' + w.id;
  const approve = () => {
    const body = text.trim();
    if (!body) { toast('The reply is empty', { tone: 'error' }); return; }
    const edited = body !== run.reply.trim();
    const real = safe(() => customerTurn(c), null);     // the metered turn the draft stands for (the preview was free)
    const ok = personReply(c.id, [{ from: 'agent', by: ME, type: 'text', text: body, status: 'sent', aiDraft: real ? real.id : '' }]);
    if (!ok) { toast('A teammate is replying in this chat. Try again in a moment.', { tone: 'error' }); return; }
    if (real) markRun(real.id, edited ? 'edited' : 'accepted');
    logAi({ kind: 'suggestion', title: edited ? 'Draft edited and sent' : 'Draft sent as written', detail: body.slice(0, 90), channel: c.ch, customer: c.name, conv: c.id, by: ME_NAME });
    toast(`Reply sent to ${c.name}`);
    onDone(key);
  };
  const reject = () => {
    logAi({ kind: 'override', title: 'Draft rejected', detail: run.reply.slice(0, 90), channel: c.ch, customer: c.name, conv: c.id, by: ME_NAME });
    toast('Draft rejected. The chat stays open for a person.');
    onDone(key);
  };
  return (
    <Sheet open onClose={onClose} title={c.name}
      footer={<>
        <Button kind="line" onClick={reject}>Reject</Button>
        <Button kind="primary" style={{ flex: 2 }} onClick={approve}><XIcon name="send" size={18} />Approve &amp; send</Button>
      </>}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>
        <ChLogo ch={c.ch} size={18} />{channelName(c.ch)} · waiting since {new Date(w.at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
      </div>
      <div lang={isBn(w.text) ? 'bn' : undefined} style={{ maxWidth: '86%', padding: '10px 14px', borderRadius: 'var(--radius-xl) var(--radius-xl) var(--radius-xl) var(--radius-md)', background: 'var(--soft)', fontSize: 'var(--text-sm-plus)', lineHeight: '21px' }}>{w.text || (w.type === 'voice' ? 'Voice message' : w.type === 'image' ? 'Photo' : 'Message')}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '14px 0 8px', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', color: 'var(--brand)' }}><Icon name="sparkles" size={13} />GridAI’s reply{run.agentName ? ' · ' + run.agentName : ''}</div>
      <TextInput multiline value={text} onChange={setText} />
      {run.decision && run.decision.act === 'person' ? <Note tone="warn" icon="alert" style={{ marginTop: '10px' }}>{run.decision.reason}. Check before you send.</Note> : null}
      <Link href={'/m-chat?id=' + encodeURIComponent(c.id) + '&edit=1'} style={{ display: 'inline-block', marginTop: '12px', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--brand)' }}>Open the chat to edit</Link>
    </Sheet>
  );
}

/** An action GridAI may only prepare: approve or reject (a reason is needed). */
function ApprovalSheet({ sheet, onClose, user }) {
  const [reason, setReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  useEffect(() => { setReason(''); setRejecting(false); }, [sheet && sheet.r.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!sheet) return null;
  const r = sheet.r;
  const go = (verdict) => {
    const res = decide(r.id, verdict, { by: user ? user.name : 'You', user, reason });
    if (!res.ok) { toast(res.error, { tone: 'error' }); return; }
    toast(verdict === 'approve' ? 'Approved: ' + r.title : 'Rejected: ' + r.title);
    onClose();
  };
  return (
    <Sheet open onClose={onClose} title={r.title}
      footer={rejecting ? <>
        <Button kind="line" onClick={() => setRejecting(false)}>Back</Button>
        <Button kind="danger" style={{ flex: 2 }} onClick={() => go('reject')} disabled={!reason.trim()}>Reject</Button>
      </> : <>
        <Button kind="line" onClick={() => setRejecting(true)}>Reject</Button>
        <Button kind="primary" style={{ flex: 2 }} onClick={() => go('approve')}>Approve</Button>
      </>}>
      <Pill tone="warn">{(APPROVAL_KINDS[r.kind] || ['Action'])[0]}</Pill>
      <div className="card" style={{ marginTop: '12px', boxShadow: 'none', border: '1px solid var(--line)' }}>
        {[['What', r.detail], ['The change', r.change], ['Why', r.reason], ['For', r.customer], ['Record', r.record], ['Amount', r.amount ? money(r.amount) : ''], ['Asked from', r.from]].filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="lrow" style={{ padding: '10px 14px', alignItems: 'flex-start' }}>
            <span style={{ width: '92px', flex: 'none', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{k}</span>
            <span style={{ flex: 1, minWidth: 0, fontSize: 'var(--text-sm)' }}>{v}</span>
          </div>
        ))}
      </div>
      {rejecting ? <div style={{ marginTop: '12px' }}><TextInput multiline value={reason} onChange={setReason} placeholder="Why is it rejected?" autoFocus /></div>
        : <div className="help" style={{ marginTop: '10px' }}>Approving does it now. Requests expire after 24 hours.</div>}
    </Sheet>
  );
}

/** The assistant chat about the shop. */
function AskGridAI({ ctx, first, onBack }) {
  const [chat, setChat] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [usage, setUsage] = useState({ day: '', questions: 0 });
  const [rated, setRated] = useState({});
  const [why, setWhy] = useState('');
  const [listening, setListening] = useState(false);
  const log = useRef(null);
  const timer = useRef(0);
  const asked = useRef(false);
  useEffect(() => { setUsage(loadUsage()); return () => window.clearTimeout(timer.current); }, []);
  useEffect(() => { if (log.current) log.current.scrollTop = log.current.scrollHeight; }, [chat, busy, why]);
  const left = Math.max(0, LIMIT - usage.questions);
  function ask(question, voice) {
    const q = String(question || '').trim();
    if (!q || busy) return;
    if (!left) { toast(`You have used all ${LIMIT} questions for today. They reset at midnight.`, { tone: 'info' }); return; }
    setChat((c) => [...c, { who: 'me', text: q, voice }]);
    setText('');
    setBusy(true);
    setUsage((u) => { const n = { ...u, questions: u.questions + 1 }; saveUsage(n); return n; });
    timer.current = window.setTimeout(() => {
      const run = safe(() => merchantTurn(q, currentUser()), null);
      setChat((c) => [...c, { who: 'ai', run: run || { id: 'x' + Date.now(), blocks: [{ type: 'text', text: 'Something went wrong. Try again.' }], steps: [] } }]);
      setBusy(false);
    }, 650);
  }
  useEffect(() => { if (first && !asked.current && usage.day) { asked.current = true; ask(first); } }, [first, usage.day]); // eslint-disable-line react-hooks/exhaustive-deps
  const approve = (block) => {
    const me = currentUser();
    const r = requestApproval({ kind: block.approval.kind, title: block.approval.title, detail: 'Asked in the app by ' + me.name, change: 'Send a personal follow-up to each customer through their chat channel', reason: 'Bulk messages always wait for a person.', from: 'Assistant', customer: block.approval.count + ' customers' });
    toast('Sent for approval: ' + r.title, { tone: 'info' });
  };
  const mark = (run, verdict) => {
    const t = (run.blocks.find((b) => b.type === 'text') || {}).text || run.kind;
    safe(() => rate(run, verdict, '', currentUser().name, t), null);
    setRated((x) => ({ ...x, [run.id]: verdict }));
    toast(verdict === 'correct' ? 'Thanks. Marked as correct.' : 'Thanks. The team will look at it.');
  };
  const voice = () => { if (!listening) { setListening(true); return; } setListening(false); ask(VOICE_SAMPLE, true); };

  return (
    <AppScreen name="MGridAI" title="Ask GridAI" css={ASK_CSS}>
      <AppBar title="Ask GridAI" onBack={onBack} actions={<span className="num" style={{ width: '64px', textAlign: 'right', fontSize: 'var(--text-xs)', color: 'var(--muted)', paddingRight: '8px' }}>{usage.day ? `${usage.questions}/${LIMIT}` : ''}</span>} />
      <div className="content ga-log" ref={log} aria-live="polite" style={{ top: '103px', bottom: '96px', padding: '6px 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {!chat.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
            <div style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--muted)', padding: '0 12px' }}>Ask about sales, orders, stock, follow-ups or customers, in Bangla or English. Answers use only what you can open.</div>
            <div className="card">
              {MERCHANT_SUGGESTIONS.map(([q, lang]) => (
                <button key={q} type="button" className="row" onClick={() => ask(q)} style={{ minHeight: '52px', padding: '10px 16px' }}>
                  <span className="ico" style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)' }}><Icon name="sparkles" size={16} /></span>
                  <span className={'m' + (lang === 'bn' ? ' bn' : '')} lang={lang === 'bn' ? 'bn' : undefined} style={{ fontSize: 'var(--text-sm)', color: 'var(--ink)' }}>{q}</span>
                </button>
              ))}
            </div>
          </div>
        ) : chat.map((m, i) => (m.who === 'me' ? (
          <div key={i} lang={isBn(m.text) ? 'bn' : undefined} style={{ alignSelf: 'flex-end', maxWidth: '80%', padding: '10px 14px 9px', borderRadius: 'var(--radius-xl) var(--radius-xl) var(--radius-md) var(--radius-xl)', background: 'linear-gradient(160deg,#0a4bb5,#003087)', color: '#fff', fontSize: 'var(--text-sm-plus)', lineHeight: '21px' }}>
            {m.voice ? <XIcon name="mic" size={13} style={{ verticalAlign: '-2px', marginRight: '6px' }} /> : null}{m.text}
          </div>
        ) : (
          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <span style={{ width: '28px', height: '28px', flex: 'none', borderRadius: 'var(--radius-full)', background: 'var(--soft)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="sparkles" size={14} /></span>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Blocks blocks={m.run.blocks} ctx={ctx} onApproval={approve} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                {m.run.steps && m.run.steps.length ? <button type="button" className="ga-foot" aria-expanded={why === m.run.id} onClick={() => setWhy(why === m.run.id ? '' : m.run.id)}>Why this answer</button> : null}
                <button type="button" className="ga-foot" aria-pressed={rated[m.run.id] === 'correct'} aria-label="Good answer" onClick={() => mark(m.run, 'correct')}><XIcon name="thumbsUp" size={14} /></button>
                <button type="button" className="ga-foot" aria-pressed={rated[m.run.id] === 'incorrect'} aria-label="Wrong answer" onClick={() => mark(m.run, 'incorrect')}><XIcon name="thumbsDown" size={14} /></button>
              </div>
              {why === m.run.id ? (
                <div className="card" style={{ padding: '10px 14px', boxShadow: 'none', border: '1px solid var(--line)' }}>
                  {m.run.steps.map((s, k) => <div key={k} style={{ fontSize: 'var(--text-xs-plus)', lineHeight: '18px', padding: '3px 0' }}><b style={{ fontWeight: 'var(--weight-medium)' }}>{s.label}</b> <span style={{ color: 'var(--muted)' }}>{s.detail}</span></div>)}
                </div>
              ) : null}
            </div>
          </div>
        )))}
        {busy ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} role="status" aria-label="GridAI is working">
            <span style={{ width: '28px', height: '28px', flex: 'none', borderRadius: 'var(--radius-full)', background: 'var(--soft)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="sparkles" size={14} /></span>
            <span style={{ display: 'flex', gap: '4px', padding: '10px 14px', borderRadius: 'var(--radius-xl)', background: 'var(--card)' }}><i className="ga-dot" /><i className="ga-dot" /><i className="ga-dot" /></span>
          </div>
        ) : null}
      </div>
      <div className="composer" style={{ position: 'absolute', left: '0', right: '0', bottom: '0', padding: '10px 0 34px', background: 'linear-gradient(to top,var(--bg) 70%,rgba(245,247,250,0))', zIndex: '6' }}>
        <form onSubmit={(e) => { e.preventDefault(); ask(text); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 12px', padding: '6px 6px 6px 16px', borderRadius: '26px', background: 'var(--card)', boxShadow: '0 6px 20px -10px rgba(15,23,42,.25),0 0 0 1px var(--line)' }}>
          {listening
            ? <span role="status" style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--err)' }}>Listening… tap stop to ask</span>
            : <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder={left ? 'Ask GridAI…' : 'No questions left today'} aria-label="Your question" disabled={!left} style={{ flex: 1, minWidth: 0, height: '40px', border: 0, outline: 0, background: 'transparent', font: 'inherit', fontSize: 'var(--text-sm-plus)', color: 'var(--ink)' }} />}
          <button type="button" className="ib" aria-label={listening ? 'Stop and ask' : 'Ask by voice'} aria-pressed={listening} onClick={voice} disabled={!left} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', background: listening ? 'var(--errbg)' : 'transparent', color: listening ? 'var(--err)' : 'var(--ink)' }}><XIcon name="mic" size={20} /></button>
          {listening ? null : <button type="submit" className="ib" aria-label="Send question" disabled={!text.trim() || busy || !left} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', background: 'var(--brand)', color: '#fff', opacity: !text.trim() || busy ? 0.5 : 1 }}><XIcon name="send" size={18} /></button>}
        </form>
      </div>
    </AppScreen>
  );
}

const ASK_CSS = `
[data-screen="MGridAI"] .ga-log > :first-child{margin-top:auto}
[data-screen="MGridAI"] .ga-foot{display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 8px;border:0;border-radius:var(--radius-full);background:none;font:inherit;font-size:var(--text-xs);color:var(--muted);cursor:pointer}
[data-screen="MGridAI"] .ga-foot[aria-pressed="true"]{color:var(--brand);background:var(--soft)}
[data-screen="MGridAI"] .ga-dot{width:6px;height:6px;border-radius:var(--radius-full);background:var(--text-muted);animation:ga-dot 1s infinite ease-in-out}
[data-screen="MGridAI"] .ga-dot:nth-child(2){animation-delay:.15s}[data-screen="MGridAI"] .ga-dot:nth-child(3){animation-delay:.3s}
@keyframes ga-dot{0%,80%,100%{opacity:.3;transform:translateY(0)}40%{opacity:1;transform:translateY(-2px)}}
@media (prefers-reduced-motion:reduce){[data-screen="MGridAI"] .ga-dot{animation:none}}
@media (max-width:480px){
  [data-screen="MGridAI"] > .ph:not([data-board]) > .content.ga-log{padding-bottom:calc(72px + max(12px, var(--app-sab, 0px)) + var(--space-4)) !important}
}
`;

/** An answer's blocks: text, figures, tables, lists and actions, in the app's cards. */
function Blocks({ blocks, ctx, onApproval }) {
  return (blocks || []).map((b, i) => {
    if (b.type === 'text') return <div key={i} lang={isBn(b.text) ? 'bn' : undefined} style={{ alignSelf: 'flex-start', maxWidth: '100%', padding: '10px 14px 9px', borderRadius: 'var(--radius-xl) var(--radius-xl) var(--radius-xl) var(--radius-md)', background: 'var(--card)', boxShadow: '0 1px 2px rgba(15,23,42,.06)', fontSize: 'var(--text-sm-plus)', lineHeight: '21px', color: 'var(--ink)' }}>{b.text}</div>;
    if (b.type === 'figures') {
      return (
        <div key={i}>
          {b.title ? <div style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)', margin: '0 0 6px 2px' }}>{b.title}</div> : null}
          <StatRow cols={2}>{b.items.map(([k, v], n) => <Stat key={k} label={k} value={v} tone={n === 0 ? 'nav' : 'grey'} />)}</StatRow>
        </div>
      );
    }
    if (b.type === 'table') {
      return (
        <div key={i} className="card" style={{ overflow: 'hidden' }}>
          {b.title ? <div style={{ padding: '10px 14px 0', fontSize: 'var(--text-xs-plus)', fontWeight: 'var(--weight-medium)', color: 'var(--ink)' }}>{b.title}</div> : null}
          <div className="lrow" style={{ padding: '8px 14px', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
            {b.head.map((h, k) => <span key={k} style={{ flex: k === 0 ? 2 : 1, textAlign: k === 0 ? 'left' : 'right', minWidth: 0 }}>{h}</span>)}
          </div>
          {b.rows.map((r, n) => (
            <div key={n} className="lrow" style={{ padding: '9px 14px', fontSize: 'var(--text-sm)' }}>
              {r.map((cell, k) => <span key={k} className={k ? 'num' : 'ell'} style={{ flex: k === 0 ? 2 : 1, textAlign: k === 0 ? 'left' : 'right', minWidth: 0, fontWeight: k === r.length - 1 && k ? 'var(--weight-medium)' : undefined }}>{cell}</span>)}
            </div>
          ))}
        </div>
      );
    }
    if (b.type === 'list') {
      return (
        <div key={i} className="card">
          {b.items.map((it, n) => <ListRow key={n} compact href={it.href ? appHref(it.href, ctx) : undefined} title={it.title} sub={it.sub} />)}
          {b.more ? <div style={{ padding: '8px 16px 10px', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)', borderTop: '1px solid var(--line)' }}>and {b.more} more</div> : null}
        </div>
      );
    }
    if (b.type === 'action') {
      if (b.approval) return <Button key={i} kind="soft" onClick={() => onApproval(b)} style={{ alignSelf: 'flex-start' }}>{b.label}</Button>;
      return <Button key={i} kind="soft" href={appHref(b.href, ctx)} style={{ alignSelf: 'flex-start' }}>{b.label}</Button>;
    }
    return null;
  });
}
