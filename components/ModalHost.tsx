'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  INSURERS, S, activeInsurers, addUser, archiveInsurer, carName, closeModal, deleteInsurer, emit, fmtDate, go, initials,
  leadById, messageText, msgApp, msgChannel, now, revealLead, toast,
} from '@/lib/demo';
import type { Lead, Modal, User } from '@/lib/types';
import { useDemo } from '@/lib/useDemo';
import { btn, cn } from '@/lib/ui';
import { PkgBadges } from './bits';
import { Icon } from './Icon';

const APP_STYLE = {
  whatsapp: { name: 'WhatsApp', head: '#075E54', fg: '#fff', bg: '#ECE5DD' },
  viber:    { name: 'Viber',    head: '#7360F2', fg: '#fff', bg: '#F1EFFD' },
  telegram: { name: 'Telegram', head: '#2AABEE', fg: '#fff', bg: '#DCE8F3' },
  sms:      { name: 'SMS',      head: '#F4F4F5', fg: '#18181b', bg: '#FFFFFF' },
};

export function ModalHost() {
  const S_ = useDemo();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && S.modal) closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const m = S_.modal;
  if (!m) return null;
  return <div className="fixed inset-0 z-[55] overflow-y-auto"><ModalBody m={m} /></div>;
}

/** Bottom sheet on phones (thumb reach, safe-area aware), centred card from sm up. */
function Dialog({ children, wide, dark, role = 'dialog' }: { children: ReactNode; wide?: boolean; dark?: boolean; role?: string }) {
  return (
    <>
      <div onClick={closeModal} className={cn('absolute inset-0', dark ? 'bg-black/60' : 'bg-black/40')} />
      <div className="pointer-events-none relative flex min-h-full flex-col justify-end sm:block">
        <div role={role} aria-modal="true" className={cn('pointer-events-auto relative max-h-[90dvh] w-full animate-sheet-up overflow-y-auto rounded-t-2xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl sm:mx-auto sm:mt-[14vh] sm:max-h-none sm:w-[calc(100%-2rem)] sm:animate-fade-in sm:rounded-xl sm:p-6', wide ? 'sm:max-w-lg' : 'sm:max-w-md')}>
          <div className="mx-auto -mt-1 mb-4 h-1 w-10 rounded-full bg-zinc-200 sm:hidden" />{children}
        </div>
      </div>
    </>
  );
}
/** Dialog buttons: equal-width and full-row on phones, right-aligned from sm up. */
const ACTIONS = 'mt-6 flex flex-wrap justify-end gap-2 [&>button]:flex-1 sm:[&>button]:flex-none';

function ModalBody({ m }: { m: Modal }) {
  if (m.type === 'confirm') return <ConfirmReveal l={leadById(m.id)!} />;
  if (m.type === 'phone') return <Phone l={leadById(m.id)!} msg={m.msg} />;
  if (m.type === 'archive') return (
    <Dialog>
      <h2 className="text-lg font-semibold">დაარქივება: {INSURERS[m.id].name}</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-600"><li>ახალ აუქციონებზე აღარ მიიწვევა.</li><li>მისი მომხმარებლები ვეღარ შევლენ პორტალში.</li><li>ძველი ძიებები და მოთხოვნები შენარჩუნდება. აღდგენა ნებისმიერ დროს შეიძლება.</li></ul>
      <div className={ACTIONS}>
        <button onClick={closeModal} className={btn('outline')}>გაუქმება</button>
        <button onClick={() => archiveInsurer(m.id)} className={btn('primary')}><Icon name="archive" className="h-4 w-4" />დაარქივება</button>
      </div>
    </Dialog>
  );
  if (m.type === 'delete') return <DeleteInsurer id={m.id} />;
  if (m.type === 'otp') return <Otp m={m} />;
  return <AddUser ins={m.ins} />;
}

function ConfirmReveal({ l }: { l: Lead }) {
  return (
    <Dialog role="alertdialog">
        <h2 className="text-lg font-semibold">საკონტაქტო ინფორმაციის მოთხოვნა</h2>
        <p className="mt-2 text-sm text-zinc-600">მოთხოვნის შემდეგ კლიენტის მონაცემები გაგეხსნებათ, ეს ქმედება დაფიქსირდება და კლიენტი მიიღებს შეტყობინებას, რომ მალე დაუკავშირდებით.</p>
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg bg-zinc-50 p-3 text-sm"><b>{initials(l.client)}</b><span className="text-zinc-400">·</span>{carName(l.vehicle)}<span className="text-zinc-400">·</span><PkgBadges l={l} /></div>
        <div className={ACTIONS}>
          <button onClick={closeModal} className={btn('outline')}>გაუქმება</button>
          <button onClick={() => {
            revealLead(l); S.modal = null; S.leadId = l.id; go('ins-detail', { id: l.id });
            toast(`საკონტაქტო ინფორმაცია გაიხსნა. კლიენტს ეცნობა (${msgChannel(l)}).`, 'lock-open', { label: 'ნახვა', run: () => { S.modal = { type: 'phone', id: l.id, msg: 'reveal' }; emit(); } });
          }} className={btn('primary')}>დადასტურება</button>
        </div>
    </Dialog>
  );
}

/** The client's phone (demo): the message in the client's preferred app. */
function Phone({ l, msg }: { l: Lead; msg: 'reveal' | 'expiry' }) {
  const app = APP_STYLE[msgApp(l)], at = (l.messages.find(x => x.type === msg) || { at: now() }).at;
  const time = fmtDate(at).split(', ')[1];
  return (
    <>
      <div onClick={closeModal} className="absolute inset-0 bg-black/60" />
      <div className="relative mx-auto flex w-[320px] max-w-full animate-fade-in flex-col items-center py-4 sm:py-6">
        <div className="mb-3 text-center text-sm text-white"><div className="font-semibold">კლიენტის ტელეფონი (დემო)</div><div className="opacity-80">{initials(l.client)} · არხი: {msgChannel(l)}</div></div>
        <div className="flex h-[min(560px,calc(100dvh-9.5rem))] w-[300px] flex-col overflow-hidden rounded-[2.6rem] border-[10px] border-zinc-900 bg-white shadow-2xl">
          <div className="flex items-center justify-between px-5 pb-1 pt-2 text-[11px] font-semibold" style={{ background: app.head, color: app.fg }}>
            <span>{time}</span><span className="flex items-center gap-1"><Icon name="signal" className="h-3 w-3" /><Icon name="wifi" className="h-3 w-3" /><Icon name="battery-full" className="h-3.5 w-3.5" /></span>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2.5" style={{ background: app.head, color: app.fg }}>
            <Icon name="chevron-left" className="h-5 w-5 opacity-80" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white"><img src="/logo.svg" alt="" className="h-6 w-auto" /></span>
            <div className="leading-tight"><div className="text-sm font-semibold">dazgveva.ge</div><div className="text-[11px] opacity-75">{app.name}</div></div>
          </div>
          <div className="flex-1 overflow-y-auto p-3" style={{ background: app.bg }}>
            <div className="mx-auto mb-3 w-fit rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] text-zinc-500 shadow-xs">დღეს</div>
            <div className="max-w-[90%] animate-fade-in rounded-2xl rounded-tl-sm px-3 py-2 text-[13px] leading-snug shadow-xs" style={{ background: msgApp(l) === 'sms' ? '#E9E9EB' : '#fff' }}>
              <p className="whitespace-pre-line">{messageText(l, msg)}</p>
              <div className="mt-1 text-right text-[10px] text-zinc-400">{time}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-zinc-200 bg-white px-3 py-2"><div className="h-8 flex-1 rounded-full bg-zinc-100" /><Icon name="send" className="h-4 w-4 text-zinc-400" /></div>
        </div>
        <button onClick={closeModal} className={btn('outline', 'md', 'mt-4 bg-white')}>დახურვა</button>
      </div>
    </>
  );
}

/** GitHub-style permanent delete: type the exact name to enable the button. */
function DeleteInsurer({ id }: { id: string }) {
  const [typed, setTyped] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const n = INSURERS[id].name, users = S.users.filter(u => u.insurer === id).length, ok = typed === n;
  return (
    <Dialog wide>
      <div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-600"><Icon name="triangle-alert" className="h-5 w-5" /></span><h2 className="text-lg font-semibold">სამუდამოდ წაშლა</h2></div>
      <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">ეს ქმედება <b>შეუქცევადია</b>. სამუდამოდ განადგურდება:
        <ul className="mt-1 list-disc pl-5"><li>სადაზღვევოს კონფიგურაცია და აღწერა</li><li>AI აგენტის API მისამართი და ავთენტიფიკაციის მონაცემები</li><li>მომხმარებლები: {users}</li></ul></div>
      <p className="mt-3 text-sm text-zinc-600">ძველი ძიებები და მოთხოვნები დარჩება — სადაზღვევო მათში გამოჩნდება როგორც „წაშლილი სადაზღვევო“.</p>
      <label className="mt-4 block text-sm">დასადასტურებლად ჩაწერეთ <b className="select-all rounded-sm bg-zinc-100 px-1">{n}</b>
        <input ref={ref} value={typed} onChange={e => setTyped(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && ok) deleteInsurer(id); }} autoComplete="off"
          className="mt-2 h-10 w-full rounded-lg border border-zinc-200 px-3 text-base sm:text-sm outline-hidden focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20" /></label>
      <button disabled={!ok} onClick={() => deleteInsurer(id)} className={btn('danger', 'md', 'mt-4 w-full')}>მესმის, წაშალე სამუდამოდ</button>
    </Dialog>
  );
}

function Otp({ m }: { m: Extract<Modal, { type: 'otp' }> }) {
  return (
    <Dialog>
      <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Icon name="key-round" className="h-5 w-5" /></span>
      <h2 className="mt-4 text-lg font-semibold">{m.title}</h2>
      <div className="mt-4 space-y-2 rounded-lg bg-zinc-50 p-4 text-sm">
        <div className="flex items-center justify-between gap-2"><span className="text-zinc-500">მომხმარებელი</span><span className="font-mono">{m.u}</span></div>
        <div className="flex items-center justify-between gap-2"><span className="text-zinc-500">ერთჯერადი პაროლი</span>
          <span className="flex items-center gap-1 font-mono font-semibold">{m.p}<CopyBtn text={m.p} /></span></div>
      </div>
      <p className="mt-3 text-xs text-zinc-500">გადაეცით მომხმარებელს უსაფრთხო არხით. ეს პაროლი მეორედ აღარ გამოჩნდება; პირველი შესვლისას მისი შეცვლა სავალდებულოა.</p>
      <div className={ACTIONS}>
        <button onClick={() => { S.modal = null; S.session = null; S.login = { u: m.u, p: m.p, error: null, hint: { u: m.u, p: m.p } }; go('login'); }}
          className={btn('outline', 'md', 'border-dashed border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100')}>დემო: შესვლა ამ მომხმარებლით</button>
        <button onClick={closeModal} className={btn('primary')}>მზადაა</button>
      </div>
    </Dialog>
  );
}

function AddUser({ ins }: { ins?: string }) {
  const [name, setName] = useState(''), [role, setRole] = useState<User['role']>('partner'), [insurer, setInsurer] = useState(ins || activeInsurers()[0]);
  const [err, setErr] = useState('');
  const field = 'mt-1.5 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-base sm:text-sm outline-hidden focus:border-zinc-900';
  return (
    <Dialog>
      <h2 className="text-lg font-semibold">მომხმარებლის დამატება</h2>
      <div className="mt-4 space-y-4">
        <label className="block"><span className="text-sm font-medium">მომხმარებლის სახელი</span>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="მაგ. kolkheti.nino" spellCheck={false} className={cn(field, 'font-mono')} />
          <span className="mt-1 block text-xs text-zinc-500">ლათინური ასოები, ციფრები, წერტილი</span></label>
        <label className="block"><span className="text-sm font-medium">როლი</span>
          <select value={role} onChange={e => setRole(e.target.value as User['role'])} className={field}><option value="partner">სადაზღვევოს თანამშრომელი</option><option value="admin">ადმინისტრატორი</option></select></label>
        <label className="block"><span className="text-sm font-medium">სადაზღვევო</span>
          <select value={insurer} onChange={e => setInsurer(e.target.value)} className={field}>{activeInsurers().map(id => <option key={id} value={id}>{INSURERS[id].name}</option>)}</select></label>
        {err && <p className="text-sm text-rose-600">{err}</p>}
      </div>
      <div className={ACTIONS}>
        <button onClick={closeModal} className={btn('outline')}>გაუქმება</button>
        <button onClick={() => setErr(addUser(name.trim(), role, insurer) || '')} className={btn('primary')}>დამატება</button>
      </div>
    </Dialog>
  );
}

export function CopyBtn({ text }: { text: string }) {
  return (
    <button onClick={() => { try { navigator.clipboard.writeText(text); } catch { /* clipboard may be unavailable */ } toast('დაკოპირდა.', 'copy'); }}
      title="კოპირება" className={btn('ghost', 'sm', 'h-8 px-2 sm:h-6 sm:px-1.5')}><Icon name="copy" className="h-3.5 w-3.5" /></button>
  );
}
