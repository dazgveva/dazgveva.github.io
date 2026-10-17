'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, type ReactNode } from 'react';
import { Icon } from '@/components/Icon';
import { AdminShell } from '@/components/Shells';
import { AUTH, INSURERS, S, emit, fillDemoForm, newForm, openModal, resetPassword, restoreInsurer, rnd, saveInsurerForm, testConnection, toast } from '@/lib/demo';
import type { AuthId } from '@/lib/types';
import { useDemo } from '@/lib/useDemo';
import { btn, card, cn } from '@/lib/ui';

export default function AdminInsurerFormPage() {
  return <AdminShell active="adm-insurers"><Suspense><Form /></Suspense></AdminShell>;
}

const fieldCls = 'mt-1.5 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-hidden focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10';

function Form() {
  const S_ = useDemo();
  const qid = useSearchParams().get('id');
  // Opened by URL (or reloaded): build the form for that insurer.
  useEffect(() => {
    const id = qid && S.meta[qid] ? qid : null;
    if (!S.form || S.editIns !== id) { S.editIns = id; S.form = newForm(id); emit(); }
  }, [qid]);
  const f = S_.form, id = S_.editIns, m = id ? S_.meta[id] : null;
  if (!f || (qid && S_.meta[qid] && id !== qid)) return null;

  const set = (key: string, value: string) => { if (key.startsWith('creds.')) f.creds[key.slice(6)] = value; else (f as unknown as Record<string, string>)[key] = value; emit(); };
  const val = (key: string) => key.startsWith('creds.') ? f.creds[key.slice(6)] || '' : String((f as unknown as Record<string, unknown>)[key] ?? '');
  const input = (key: string, label: string, opts: { type?: string; ph?: string; mono?: boolean; hint?: string } = {}) => (
    <label className="block"><span className="text-sm font-medium">{label}</span>
      <input value={val(key)} onChange={e => set(key, e.target.value)} type={opts.type || 'text'} placeholder={opts.ph} spellCheck={opts.mono ? false : undefined}
        className={cn(fieldCls, opts.mono && 'font-mono text-[13px]')} />
      {opts.hint && <span className="mt-1 block text-xs text-zinc-500">{opts.hint}</span>}
    </label>
  );
  const secret = (key: string, label: string) => (
    <div><span className="text-sm font-medium">{label}</span>
      <div className="mt-1.5 flex gap-2">
        <input value={f.creds[key] || ''} onChange={e => set(`creds.${key}`, e.target.value)} spellCheck={false} className="h-10 w-full rounded-lg border border-zinc-200 px-3 font-mono text-[13px] outline-hidden focus:border-zinc-900" />
        <button onClick={() => set(`creds.${key}`, 'dzg_' + rnd(32, '0123456789abcdef'))} className={btn('outline', 'md', 'shrink-0')}><Icon name="refresh-cw" className="h-3.5 w-3.5" />გენერირება</button>
      </div>
    </div>
  );
  const authFields: Record<AuthId, ReactNode> = {
    mtls: <>
      <div className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600">ორმხრივი TLS: ჩვენ წარვადგენთ dazgveva.ge-ს კლიენტის სერტიფიკატს, თქვენ — სერვერის სერტიფიკატს.</div>
      <label className="block"><span className="text-sm font-medium">სადაზღვევოს CA სერტიფიკატი (.pem)</span>
        <input type="file" accept=".pem,.crt,.cer" onChange={e => { if (e.target.files?.[0]) set('creds.caName', e.target.files[0].name); }}
          className="mt-1.5 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-sm file:text-white" />
        {f.creds.caName && <span className="mt-1 flex items-center gap-1 text-xs text-emerald-700"><Icon name="file-check" className="h-3.5 w-3.5" />{f.creds.caName}</span>}
      </label>
      <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 text-sm"><span>dazgveva.ge-ს კლიენტის სერტიფიკატი</span>
        <button onClick={() => toast('პროტოტიპში ფაილი არ იტვირთება.', 'download')} className={btn('outline', 'sm')}><Icon name="download" className="h-3.5 w-3.5" />ჩამოტვირთვა</button></div>
    </>,
    oauth: <>
      {input('creds.tokenUrl', 'Token URL', { ph: 'https://auth.example.ge/oauth/token', mono: true })}
      <div className="grid gap-4 sm:grid-cols-2">{input('creds.clientId', 'Client ID', { mono: true })}{input('creds.clientSecret', 'Client secret', { type: 'password', mono: true })}</div>
      {input('creds.scope', 'Scope', { ph: 'quotes', mono: true })}
    </>,
    hmac: <>
      {secret('secret', 'ხელმოწერის საიდუმლო გასაღები')}
      <div className="grid gap-4 sm:grid-cols-2">
        <div><span className="text-sm font-medium">ალგორითმი</span><div className="mt-1.5 flex h-10 items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3 font-mono text-[13px]">HMAC-SHA256</div></div>
        {input('creds.header', 'ხელმოწერის ჰედერი', { ph: 'X-Dazgveva-Signature', mono: true })}
      </div>
      <div className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600">თითოეულ მოთხოვნას ახლავს დროის ნიშნული და ხელმოწერა — გაყალბებული ან განმეორებული მოთხოვნა უარყოფილია.</div>
    </>,
    apikey: <>{secret('key', 'API გასაღები')}<div className="rounded-lg bg-zinc-50 p-3 font-mono text-xs text-zinc-600">Authorization: Bearer &lt;API გასაღები&gt;</div></>,
  };
  const t = f.test;

  return (
    <>
      <Link href="/admin/insurers/" className={btn('ghost', 'sm', '-ml-3 text-zinc-600')}><Icon name="arrow-left" className="h-4 w-4" />სადაზღვევოები</Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{id ? 'რედაქტირება: ' + INSURERS[id].name : 'სადაზღვევოს დამატება'}</h1>
        {!id && <button onClick={fillDemoForm} className={btn('outline', 'sm', 'border-dashed border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100')}><Icon name="wand-sparkles" className="h-3.5 w-3.5" />დემო: შევსება</button>}
      </div>
      {f.errors.length > 0 && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <div className="flex items-center gap-2 font-medium"><Icon name="circle-alert" className="h-4 w-4" />გთხოვთ, შეასწოროთ:</div>
          <ul className="ml-6 mt-1 list-disc">{f.errors.map(e => <li key={e}>{e}</li>)}</ul>
        </div>
      )}
      <div className="mt-6 grid max-w-5xl gap-6 lg:grid-cols-2">
        <div className={card('space-y-4 p-5')}>
          <h2 className="font-semibold">კომპანია</h2>
          {input('name', 'დასახელება', { ph: 'მაგ. რიონი დაზღვევა' })}
          <label className="block"><span className="text-sm font-medium">აღწერა (შიდა გამოყენებისთვის)</span>
            <textarea value={f.desc} onChange={e => set('desc', e.target.value)} rows={3} className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-hidden focus:border-zinc-900" /></label>
          {!id && input('firstUser', 'პირველი მომხმარებელი (username)', { ph: 'მაგ. rioni.nino', mono: true, hint: 'ერთჯერადი პაროლი შენახვისას შეიქმნება; პირველი შესვლისას შეცვლა სავალდებულოა.' })}
        </div>
        <div className={card('space-y-4 p-5')}>
          <h2 className="font-semibold">AI აგენტი</h2>
          {input('endpoint', 'AI აგენტის API მისამართი', { ph: 'https://agent.example.ge/dazgveva/v1/quote', mono: true })}
          <label className="block"><span className="text-sm font-medium">ავთენტიფიკაციის მეთოდი</span>
            <select value={f.auth} onChange={e => { f.auth = e.target.value as AuthId; f.test = null; emit(); }} className="mt-1.5 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm">
              {(Object.entries(AUTH) as [AuthId, string][]).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select></label>
          {authFields[f.auth]}
          {input('timeout', 'პასუხის ლოდინის დრო (წამი)', { type: 'number' })}
          <div className="rounded-lg border border-zinc-200 p-3">
            <div className="flex items-center justify-between gap-3"><span className="text-sm font-medium">კავშირის შემოწმება</span>
              <button disabled={t === 'running'} onClick={testConnection} className={btn('outline', 'sm')}>
                {t === 'running' ? <><Icon name="loader-circle" className="h-3.5 w-3.5 animate-spin" />მოწმდება…</> : <><Icon name="plug-zap" className="h-3.5 w-3.5" />შემოწმება</>}
              </button></div>
            {t && t !== 'running'
              ? <div className={cn('mt-3 flex items-start gap-2 rounded-md p-2.5 text-sm', t.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800')}><Icon name={t.ok ? 'circle-check' : 'circle-x'} className="mt-0.5 h-4 w-4 shrink-0" /><span>{t.text}</span></div>
              : <p className="mt-1 text-xs text-zinc-500">აგენტს სატესტო მოთხოვნა გაეგზავნება (dazgveva.agent-quote/v1).</p>}
          </div>
        </div>
      </div>
      {id && (
        <div className={card('mt-6 max-w-5xl p-5')}>
          <div className="flex items-center justify-between"><h2 className="font-semibold">მომხმარებლები</h2>
            <button onClick={() => openModal({ type: 'add-user', ins: id })} className={btn('outline', 'sm')}><Icon name="user-plus" className="h-3.5 w-3.5" />მომხმარებლის დამატება</button></div>
          <ul className="mt-3 divide-y divide-zinc-100">
            {S_.users.filter(u => u.insurer === id).map(u => (
              <li key={u.username} className="flex flex-wrap items-center gap-2 py-2.5 text-sm"><span className="font-mono text-[13px]">{u.username}</span>
                {u.demo && <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-900">სადემო</span>}
                {u.mustChange && <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">ელოდება პაროლის შეცვლას</span>}
                <PwResetBtn username={u.username} />
              </li>
            ))}
            {!S_.users.some(u => u.insurer === id) && <li className="py-2.5 text-sm text-zinc-500">მომხმარებელი არ არის.</li>}
          </ul>
        </div>
      )}
      <div className="mt-6 flex max-w-5xl flex-wrap items-center gap-2">
        <button onClick={saveInsurerForm} className={btn('primary')}><Icon name="save" className="h-4 w-4" />შენახვა</button>
        <Link href="/admin/insurers/" className={btn('ghost')}>გაუქმება</Link>
      </div>
      {id && m && (
        <div className="mt-10 max-w-5xl rounded-xl border border-rose-200">
          <div className="border-b border-rose-200 px-5 py-3 font-semibold text-rose-700">საშიში ზონა</div>
          {m.status === 'active'
            ? <div className="flex flex-wrap items-center justify-between gap-3 p-5"><div className="text-sm"><div className="font-medium">დაარქივება</div><div className="text-zinc-500">ახალ აუქციონებზე აღარ მიიწვევა, მომხმარებლები ვეღარ შევლენ. ისტორია შენარჩუნდება.</div></div>
                <button onClick={() => openModal({ type: 'archive', id })} className={btn('outline', 'md', 'text-rose-700')}><Icon name="archive" className="h-4 w-4" />დაარქივება</button></div>
            : <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-100 p-5"><div className="text-sm"><div className="font-medium">აღდგენა</div><div className="text-zinc-500">სადაზღვევო ისევ აქტიური გახდება.</div></div>
                <button onClick={() => restoreInsurer(id)} className={btn('outline')}><Icon name="archive-restore" className="h-4 w-4" />აღდგენა</button></div>
              <div className="flex flex-wrap items-center justify-between gap-3 p-5"><div className="text-sm"><div className="font-medium">სამუდამოდ წაშლა</div><div className="text-zinc-500">კონფიგურაცია, მომხმარებლები და API მონაცემები განადგურდება. გაუქმება შეუძლებელია.</div></div>
                <button onClick={() => openModal({ type: 'delete', id })} className={btn('danger')}><Icon name="trash-2" className="h-4 w-4" />სამუდამოდ წაშლა</button></div>
            </>}
        </div>
      )}
    </>
  );
}

function PwResetBtn({ username }: { username: string }) {
  return (
    <button onClick={() => resetPassword(username)} className={btn('ghost', 'sm', 'ml-auto')}>
      <Icon name="key-round" className="h-3.5 w-3.5" />პაროლის აღდგენა
    </button>
  );
}
