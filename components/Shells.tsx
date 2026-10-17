'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fragment, useEffect, type ReactNode } from 'react';
import { INSURERS, S, activeInsurers, demoReset, emit, expireCheck, fastForward, fmtDate, isActive, logout, now, sessionUser, toast } from '@/lib/demo';
import { useDemo, useTick } from '@/lib/useDemo';
import { btn, cn } from '@/lib/ui';
import { InsAvatar } from './bits';
import { Icon } from './Icon';

/** Client flow progress: ტექპასპორტი → ღირებულება → კონტაქტი → აუქციონი → შეთავაზებები */
export function Stepper({ active }: { active: number }) {
  const steps = ['ტექპასპორტი', 'ღირებულება', 'კონტაქტი', 'აუქციონი', 'შეთავაზებები'];
  return (
    <ol className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
      {steps.map((s, i) => {
        const done = i < active, cur = i === active;
        return (
          <Fragment key={s}>
            <li className={cn('flex items-center gap-1.5', cur ? 'font-semibold text-zinc-900' : 'text-zinc-500')}>
              {done
                ? <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-zinc-900 text-white"><Icon name="check" className="h-3.5 w-3.5" /></span>
                : <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-semibold', cur ? 'bg-zinc-900 text-white' : 'border border-zinc-300 text-zinc-500')}>{i + 1}</span>}
              <span className={cur ? '' : 'hidden md:inline'}>{s}</span>
            </li>
            {i < steps.length - 1 && <li className="h-px w-3 bg-zinc-300 sm:w-5" />}
          </Fragment>
        );
      })}
    </ol>
  );
}

/** Demo clock: fast-forward time to show request expiry. */
function DemoBar() {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
      <Icon name="clock" className="h-3.5 w-3.5" /><span>დემო დრო: <b>{fmtDate(now())}</b></span>
      <span className="ml-auto flex gap-1.5">
        <button onClick={() => fastForward(3)} className={btn('outline', 'sm', 'h-7 bg-white px-2')}>+3 სთ</button>
        <button onClick={() => fastForward(24)} className={btn('outline', 'sm', 'h-7 bg-white px-2')}>+24 სთ</button>
        <button onClick={demoReset} title="დემო მონაცემების აღდგენა" className={btn('ghost', 'sm', 'h-7 px-2')}><Icon name="rotate-ccw" className="h-3.5 w-3.5" />აღდგენა</button>
      </span>
    </div>
  );
}

/** Ticks every second while a portal is open: live countdowns, demo clock, and expiry. */
function usePortalClock() {
  useTick(1000);
  useEffect(() => {
    const n = expireCheck();
    if (n) { emit(); toast(`${n} მოთხოვნას ვადა გაუვიდა. კლიენტებს ეცნობათ.`, 'clock'); }
  });
}

/** Redirect to /login (or /password) unless the right person is signed in. */
function useGuard(role: 'admin' | 'partner') {
  const router = useRouter();
  const u = sessionUser();
  const ok = !!u && !u.mustChange && (role === 'partner' || u.role === 'admin');
  useEffect(() => {
    if (!u) { if (!S.loggingOut) router.replace('/login/'); }
    else if (u.mustChange) router.replace('/password/');
    else if (!ok) router.replace('/login/');
  }, [u, ok, router]);
  return ok;
}

const navBtn = (active: boolean) =>
  btn(active ? 'primary' : 'ghost', 'sm', cn('shrink-0 justify-start md:w-full', !active && 'text-zinc-700'));

export function PartnerShell({ active, children }: { active: 'ins-list' | 'ins-api' | 'ins-profile'; children: ReactNode }) {
  useDemo(); usePortalClock();
  const ok = useGuard('partner');
  if (!ok) return null;
  if (!isActive(S.insurer)) S.insurer = activeInsurers()[0];
  const newCount = S.leads.filter(l => l.insurer === S.insurer && l.status === 'new').length;
  const items: [typeof active, string, string, string, number?][] = [
    ['ins-list', '/partner/', 'inbox', 'მოთხოვნები', newCount], ['ins-api', '/partner/api/', 'plug', 'API ინტეგრაცია'], ['ins-profile', '/partner/profile/', 'building-2', 'პროფილი'],
  ];
  return (
    <div className="mx-auto flex max-w-[1600px] flex-col md:flex-row">
      <aside className="border-b border-zinc-200 bg-zinc-50/50 md:min-h-[calc(100vh-3.5rem)] md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <div className="p-4">
          <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">სადაზღვევოს პორტალი</div>
          <div className="mt-2 flex items-center gap-2"><InsAvatar id={S.insurer} size="h-8 w-8" /><div className="min-w-0"><div className="truncate text-sm font-semibold">{INSURERS[S.insurer].name}</div><div className="text-xs text-zinc-500">{S.insurer}.demo</div></div></div>
          <label className="mt-3 block text-[11px] text-zinc-500">დემო: შესული სადაზღვევო
            <select value={S.insurer} onChange={e => { S.insurer = e.target.value; S.filter = 'all'; emit(); }} className="mt-1 h-8 w-full rounded-md border border-zinc-200 bg-white px-2 text-xs text-zinc-900">
              {activeInsurers().map(id => <option key={id} value={id}>{INSURERS[id].name}</option>)}
            </select>
          </label>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col">
          {items.map(([id, href, ic, label, count]) => (
            <Link key={id} href={href} className={navBtn(active === id)}>
              <Icon name={ic} className="h-4 w-4" />{label}
              {!!count && <span className={cn('ml-auto rounded-full px-1.5 text-[11px]', active === id ? 'bg-white/20' : 'bg-sky-100 text-sky-700')}>{count}</span>}
            </Link>
          ))}
          <button onClick={logout} className={btn('ghost', 'sm', 'shrink-0 justify-start text-zinc-500 md:mt-4 md:w-full')}><Icon name="log-out" className="h-4 w-4" />გასვლა</button>
        </nav>
      </aside>
      <div className="min-w-0 flex-1 px-4 py-6 md:px-8"><DemoBar />{children}</div>
    </div>
  );
}

export function AdminShell({ active, children }: { active: 'adm-overview' | 'adm-requests' | 'adm-insurers' | 'adm-users'; children: ReactNode }) {
  useDemo(); usePortalClock();
  const ok = useGuard('admin');
  if (!ok) return null;
  const items: [typeof active, string, string, string][] = [
    ['adm-overview', '/admin/', 'layout-dashboard', 'მიმოხილვა'], ['adm-requests', '/admin/requests/', 'list-checks', 'მოთხოვნები'],
    ['adm-insurers', '/admin/insurers/', 'building-2', 'სადაზღვევოები'], ['adm-users', '/admin/users/', 'users', 'მომხმარებლები'],
  ];
  return (
    <div className="mx-auto flex max-w-[1600px] flex-col md:flex-row">
      <aside className="border-b border-zinc-200 bg-zinc-50/50 md:min-h-[calc(100vh-3.5rem)] md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <div className="p-4">
          <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">ადმინისტრირება</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="mt-2 flex items-center gap-2"><img src="/logo.svg" alt="" className="h-8 w-auto" /><div><div className="text-sm font-semibold">dazgveva.ge</div><div className="text-xs text-zinc-500">admin</div></div></div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col">
          {items.map(([id, href, ic, label]) => <Link key={id} href={href} className={navBtn(active === id)}><Icon name={ic} className="h-4 w-4" />{label}</Link>)}
          <button onClick={logout} className={btn('ghost', 'sm', 'shrink-0 justify-start text-zinc-500 md:mt-4 md:w-full')}><Icon name="log-out" className="h-4 w-4" />გასვლა</button>
        </nav>
      </aside>
      <div className="min-w-0 flex-1 px-4 py-6 md:px-8"><DemoBar />{children}</div>
    </div>
  );
}
