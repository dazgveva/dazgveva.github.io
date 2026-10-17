'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Icon } from '@/components/Icon';
import { S, emit, pwRules, sessionUser, submitPassword } from '@/lib/demo';
import { useDemo } from '@/lib/useDemo';
import { btn, card, cn } from '@/lib/ui';

const field = 'mt-1.5 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-hidden focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10';

/** Forced password change at first sign-in. */
export default function PasswordPage() {
  const S_ = useDemo();
  const router = useRouter();
  const u = sessionUser();
  useEffect(() => { if (!u) router.replace('/login/'); }, [u, router]);
  if (!u) return null;
  const rules = pwRules(), ok = rules.every(r => r[1]);
  const set = (k: 'a' | 'b', v: string) => { S.pw = { ...S.pw, [k]: v }; emit(); };
  const onEnter = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && ok) submitPassword(); };
  return (
    <section className="mx-auto max-w-md animate-fade-in px-4 py-10 sm:py-16">
      <div className={card('p-6')}>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-amber-100 text-amber-700"><Icon name="key-round" className="h-5 w-5" /></span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">პაროლის შეცვლა</h1>
        <p className="mt-1 text-sm text-zinc-500">გამარჯობა, <span className="font-mono">{u.username}</span>! ეს თქვენი პირველი შესვლაა — გასაგრძელებლად დააყენეთ ახალი პაროლი.</p>
        <div className="mt-5 space-y-4">
          <label className="block"><span className="text-sm font-medium">ახალი პაროლი</span>
            <input value={S_.pw.a || ''} onChange={e => set('a', e.target.value)} onKeyDown={onEnter} type="password" autoComplete="new-password" className={field} /></label>
          <label className="block"><span className="text-sm font-medium">გაიმეორეთ პაროლი</span>
            <input value={S_.pw.b || ''} onChange={e => set('b', e.target.value)} onKeyDown={onEnter} type="password" autoComplete="new-password" className={field} /></label>
          <ul className="space-y-1 text-sm">
            {rules.map(([t, pass]) => <li key={t} className={cn('flex items-center gap-2', pass ? 'text-emerald-700' : 'text-zinc-500')}><span className={cn('h-1.5 w-1.5 rounded-full', pass ? 'bg-emerald-500' : 'bg-zinc-300')} />{t}</li>)}
          </ul>
          <button disabled={!ok} onClick={submitPassword} className={btn('primary', 'lg', 'w-full')}>პაროლის შენახვა</button>
        </div>
      </div>
    </section>
  );
}
