'use client';
import { InsAvatar } from '@/components/bits';
import { Icon } from '@/components/Icon';
import { DEMO_PASSWORD, S, emit, isActive, submitLogin } from '@/lib/demo';
import { useDemo } from '@/lib/useDemo';
import { btn, card } from '@/lib/ui';

const field = 'mt-1.5 h-10 w-full rounded-lg border border-zinc-200 px-3 text-base sm:text-sm outline-hidden focus:border-navy-700 focus:ring-2 focus:ring-brand-400/40';

/** Staff sign-in. Not linked from the public site: staff open /login directly. */
export default function LoginPage() {
  const S_ = useDemo();
  const L = S_.login;
  const demo = S_.users.filter(u => u.demo && u.insurer && isActive(u.insurer));
  const onEnter = (e: React.KeyboardEvent) => { if (e.key === 'Enter') submitLogin(); };
  return (
    <section className="mx-auto grid max-w-4xl animate-fade-in gap-6 px-4 py-10 sm:py-16 md:grid-cols-[1fr_300px]">
      <div className={card('p-6')}>
        <h1 className="text-2xl font-bold tracking-tight">შესვლა</h1>
        <p className="mt-1 text-sm text-zinc-500">მხოლოდ ადმინისტრატორისა და პარტნიორი სადაზღვევოების თანამშრომლებისთვის.</p>
        {L.hint && <div className="mt-4 rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><div className="font-medium">დემო: ახალი მომხმარებელი</div>username <b className="font-mono">{L.hint.u}</b> · ერთჯერადი პაროლი <b className="font-mono">{L.hint.p}</b></div>}
        <div className="mt-5 space-y-4">
          <label className="block"><span className="text-sm font-medium">მომხმარებლის სახელი</span>
            <input value={L.u} onChange={e => { L.u = e.target.value; emit(); }} onKeyDown={onEnter} autoComplete="username" spellCheck={false} className={`${field} font-mono`} /></label>
          <label className="block"><span className="text-sm font-medium">პაროლი</span>
            <input value={L.p} onChange={e => { L.p = e.target.value; emit(); }} onKeyDown={onEnter} type="password" autoComplete="current-password" className={field} /></label>
          {L.error && <p className="flex items-center gap-1.5 text-sm text-rose-600"><Icon name="circle-alert" className="h-4 w-4" />{L.error}</p>}
          <button onClick={submitLogin} className={btn('primary', 'lg', 'w-full')}>შესვლა</button>
        </div>
        <p className="mt-4 text-xs text-zinc-500">ანგარიშს ქმნის მხოლოდ ადმინისტრატორი. პაროლის აღდგენისთვის მიმართეთ მას.</p>
      </div>
      <aside className={card('h-fit p-5')}>
        <h2 className="text-sm font-semibold">სადემო ანგარიშები</h2>
        <p className="mt-1 text-xs text-zinc-500">სადაზღვევოები · პაროლი: <span className="font-mono">{DEMO_PASSWORD}</span></p>
        <ul className="mt-3 space-y-1.5">
          {demo.map(u => (
            <li key={u.username}>
              <button onClick={() => { S.login = { u: u.username, p: DEMO_PASSWORD, error: null, hint: null }; emit(); }}
                className="flex w-full items-center gap-2 rounded-md border border-zinc-200 px-2.5 py-2 text-left text-sm hover:border-navy-700">
                <InsAvatar id={u.insurer!} size="h-5 w-5" /><span className="font-mono text-xs">{u.username}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
}
