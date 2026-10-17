'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CatIcon, InsAvatar } from '@/components/bits';
import { Icon } from '@/components/Icon';
import { Stepper } from '@/components/Shells';
import { CATS, COVERAGE, INSURERS, S, VEHICLE, createClientLeads, emit, go, money } from '@/lib/demo';
import type { CatId } from '@/lib/types';
import { useDemo } from '@/lib/useDemo';
import { card, cn } from '@/lib/ui';

/** Step 5: the best offer per package. Choosing and consenting are one action: the send button
   carries the consent, and the text next to it names exactly which companies get the data. */
export default function OffersPage() {
  const S_ = useDemo();
  const router = useRouter();
  useEffect(() => { if (!S.results) router.replace('/'); }, [router]);
  if (!S_.results) return null;

  const n = S_.selected.size;
  const names = [...new Set(CATS.filter(c => S_.selected.has(c.id)).map(c => INSURERS[S_.results![c.id]!.insurer].name))];
  return (
    <section className="mx-auto max-w-6xl animate-fade-in px-4 py-8">
      <div className="mb-6"><Stepper active={4} /></div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">საუკეთესო შეთავაზებები თქვენთვის</h1>
          <p className="mt-1 text-zinc-600">შეგიძლიათ აირჩიოთ ერთი, ორი ან სამივე შეთავაზება.</p></div>
        <p className="flex items-center gap-1.5 text-sm text-zinc-500"><Icon name="car" className="h-4 w-4" />{VEHICLE.make} {VEHICLE.model} · {VEHICLE.year} · {money(S_.value || VEHICLE.value)}</p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">{CATS.map(c => <OfferCard key={c.id} cat={c.id} />)}</div>
      <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-zinc-200 bg-white/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] backdrop-blur md:static md:mx-0 md:rounded-xl md:border md:p-5 md:shadow-none">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-xs text-zinc-600 sm:max-w-xl sm:text-sm">
            <Icon name={n ? 'lock' : 'mouse-pointer-click'} className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{n
              ? <>შენი სახელი, გვარი, პირადი ნომერი და საკონტაქტო ინფორმაცია გადაეცემა მხოლოდ {names.length > 1 ? 'არჩეულ კომპანიებს' : 'არჩეულ კომპანიას'}: <b className="text-zinc-900">{names.join(', ')}</b>.</>
              : 'აირჩიე ერთი, ორი ან სამივე შეთავაზება — ბარათზე დაჭერით.'}</span>
          </p>
          <button disabled={!n} onClick={() => { createClientLeads(); go('done'); }}
            className="inline-flex w-full shrink-0 flex-col items-center justify-center rounded-xl bg-zinc-900 px-6 py-2.5 text-white sm:w-auto transition hover:bg-zinc-800 disabled:pointer-events-none disabled:opacity-40">
            <span className="flex items-center gap-2 text-[15px] font-semibold"><Icon name="send" className="h-4 w-4" />მოთხოვნის გაგზავნა{n ? ` (${n})` : ''}</span>
            <span className="text-xs text-white/75">ვირჩევ და ვეთანხმები მონაცემების გაზიარებას</span>
          </button>
        </div>
      </div>
    </section>
  );
}

function OfferCard({ cat }: { cat: CatId }) {
  const S_ = useDemo();
  const c = CATS.find(x => x.id === cat)!, w = S_.results![cat];
  const head = (
    <div className="flex items-center gap-3 md:min-h-[5.5rem]">
      <CatIcon id={cat} />
      <div className="min-w-0"><h3 className="text-lg font-bold leading-tight">{c.label}</h3><p className="mt-0.5 text-xs text-zinc-500">{c.hint}</p></div>
    </div>
  );
  if (!w) return (
    <div className={card('flex flex-col bg-zinc-50/60 p-5')}>{head}
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center text-sm text-zinc-500"><Icon name="search-x" className="h-6 w-6" />ამ კატეგორიაში შეთავაზება ვერ მოიძებნა</div>
    </div>
  );
  const on = S_.selected.has(cat);
  const toggle = () => { if (S.selected.has(cat)) S.selected.delete(cat); else S.selected.add(cat); S.selected = new Set(S.selected); emit(); };
  return (
    <div onClick={toggle} className={card(cn('flex cursor-pointer flex-col p-5 transition', on ? 'ring-2 ring-zinc-900' : 'hover:border-zinc-400'))}>
      {head}
      <div className="mt-4 flex items-center gap-3 border-t border-zinc-100 pt-4"><InsAvatar id={w.insurer} size="h-10 w-10" />
        <div className="min-w-0"><div className="truncate font-semibold">{INSURERS[w.insurer].name}</div><div className="text-xs text-zinc-500">საუკეთესო {w.count} შეთავაზებიდან</div></div></div>
      <div className="mt-4"><div className="text-3xl font-bold tracking-tight">{money(w.premium)}</div><div className="text-sm text-zinc-500">წლიური პრემია</div></div>
      <dl className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-zinc-50 p-3 text-sm">
        <div><dt className="text-xs text-zinc-500">სადაზღვევო თანხა</dt><dd className="font-medium">{money(w.sum)}</dd></div>
        <div><dt className="text-xs text-zinc-500">ფრანშიზა</dt><dd className="font-medium">{money(w.deductible)}</dd></div>
      </dl>
      <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm md:grid-cols-1">
        {COVERAGE.map(([k, l]) => w.cov.includes(k)
          ? <li key={k} className="flex items-center gap-2"><Icon name="check" className="h-4 w-4 text-emerald-600" />{l}</li>
          : <li key={k} className="flex items-center gap-2 text-zinc-400"><Icon name="minus" className="h-4 w-4" /><span className="line-through">{l}</span></li>)}
      </ul>
      <div className="mt-4 rounded-lg border border-zinc-200 p-3 text-sm"><div className="flex items-center gap-1.5 font-medium"><Icon name="sparkles" className="h-3.5 w-3.5" />რატომ ეს შეთავაზება?</div><p className="mt-1 text-zinc-600">{w.why}</p></div>
      <div className="mt-auto pt-4">
        <div role="checkbox" aria-checked={on} className={cn('flex items-center gap-2.5 rounded-lg border px-3 py-3 text-sm font-medium md:py-2.5', on ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200')}>
          <span className={cn('grid h-4 w-4 place-items-center rounded-sm border', on ? 'border-white bg-white text-zinc-900' : 'border-zinc-400')}>{on && <Icon name="check" className="h-3 w-3" />}</span>ვირჩევ
        </div>
      </div>
    </div>
  );
}
