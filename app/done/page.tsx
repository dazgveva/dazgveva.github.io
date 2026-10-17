'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CatBadge, InsAvatar } from '@/components/bits';
import { Icon } from '@/components/Icon';
import { CATS, INSURERS, S, chById, go, money, resetAll } from '@/lib/demo';
import type { CatId, Pick } from '@/lib/types';
import { useDemo } from '@/lib/useDemo';
import { btn, card } from '@/lib/ui';

/** Confirmation: one request per chosen insurer. */
export default function DonePage() {
  const S_ = useDemo();
  const router = useRouter();
  useEffect(() => { if (!S.results || !S.lastSent.length) router.replace('/'); }, [router]);
  if (!S_.results || !S_.lastSent.length) return null;

  const groups: Record<string, { cat: CatId; w: Pick }[]> = {};
  for (const c of CATS) if (S_.selected.has(c.id)) { const w = S_.results[c.id]!; (groups[w.insurer] ||= []).push({ cat: c.id, w }); }
  const pref = S_.preferred ? chById(S_.preferred) : null;
  return (
    <section className="mx-auto max-w-xl animate-fade-in px-4 py-12">
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Icon name="circle-check" className="h-7 w-7" /></span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">მოთხოვნა გაიგზავნა</h1>
        <p className="mt-2 text-zinc-600">არჩეული სადაზღვევო კომპანია/კომპანიები 24 საათის განმავლობაში დაგიკავშირდებათ.</p>
      </div>
      <div className="mt-8 space-y-3">
        {Object.entries(groups).map(([id, items]) => (
          <div key={id} className={card('p-4')}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2"><InsAvatar id={id} /><span className="font-semibold">{INSURERS[id].name}</span></div>
              <span className="text-xs text-zinc-500">1 მოთხოვნა · პაკეტი: {items.length}</span>
            </div>
            <ul className="mt-3 space-y-2">
              {items.map(({ cat, w }) => <li key={cat} className="flex items-center justify-between text-sm"><CatBadge id={cat} /><span className="font-medium">{money(w.premium)} <span className="font-normal text-zinc-500">/ წელი</span></span></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-zinc-50 p-3 text-sm"><Icon name="star" className="h-4 w-4 text-amber-400" />უპირატესი საშუალება: <b>{pref ? pref.label : '—'}</b></div>
      <div className="mt-8 text-center"><button onClick={() => { resetAll(); go('home'); }} className={btn('outline')}><Icon name="rotate-ccw" className="h-4 w-4" />ახალი მოთხოვნა</button></div>
      <div className="mt-10 rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 text-sm">
        <div className="flex items-center gap-2 font-medium text-amber-900"><Icon name="presentation" className="h-4 w-4" />დემო: ნახეთ, როგორ მიიღო მოთხოვნა სადაზღვევომ</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {S_.lastSent.map(id => (
            <button key={id} onClick={() => { S.insurer = id; S.filter = 'all'; S.session = { username: (S.users.find(u => u.insurer === id && u.demo) || S.users.find(u => u.insurer === id))!.username }; go('ins-list'); }} className={btn('outline', 'sm', 'bg-white')}>
              <InsAvatar id={id} size="h-5 w-5" />დეშბორდი: {INSURERS[id].name}<Icon name="arrow-right" className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
