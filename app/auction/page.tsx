'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { InsAvatar } from '@/components/bits';
import { Icon } from '@/components/Icon';
import { Stepper } from '@/components/Shells';
import { INSURERS, S, auctionDataset, emit, go, makeClientSearch } from '@/lib/demo';
import type { LogLine, Search } from '@/lib/types';
import { useDemo } from '@/lib/useDemo';
import { card, cn } from '@/lib/ui';

const LOG_ICON: Record<LogLine['kind'], [string, string]> = {
  ok: ['circle-check', 'text-emerald-600'], info: ['send', 'text-zinc-500'], timeout: ['clock', 'text-amber-600'],
  warn: ['circle-x', 'text-rose-600'], spin: ['loader-circle', 'text-zinc-500 animate-spin'], done: ['sparkles', 'text-zinc-900'],
};

/** Step 4: the live sealed auction (~14 s). The log shows only what happens, when it happens. */
export default function AuctionPage() {
  useDemo();
  const router = useRouter();
  const [search, setSearch] = useState<Search | null>(null);
  const [shown, setShown] = useState(0);
  const [started, setStarted] = useState(false);
  const logBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!S.pendingAuction) { router.replace('/'); return; }
    S.pendingAuction = false;
    const s = makeClientSearch(auctionDataset());
    S.results = s.results; S.selected = new Set(); emit();
    setSearch(s);
    const timers = s.log.map((line, i) => setTimeout(() => setShown(i + 1), line.t * 1000));
    timers.push(setTimeout(() => go('offers'), s.log[s.log.length - 1].t * 1000 + 1200));
    const raf = requestAnimationFrame(() => setStarted(true));
    return () => { timers.forEach(clearTimeout); cancelAnimationFrame(raf); };
  }, [router]);

  useEffect(() => { logBox.current?.scrollTo({ top: logBox.current.scrollHeight }); }, [shown]);
  if (!search) return null;

  const lines = search.log.slice(0, shown);
  const done = lines.some(l => l.kind === 'done');
  const total = search.log[search.log.length - 1].t;
  const chip = (id: string) => {
    const l = lines.find(x => x.insurer === id);
    if (!l) return <><Icon name="loader-circle" className="h-3.5 w-3.5 animate-spin" /><span>ველოდებით პასუხს…</span></>;
    const [ic, cls, txt] = l.kind === 'ok' ? ['circle-check', 'text-emerald-600', `${l.count} შეთავაზება`] : l.kind === 'warn' ? ['circle-x', 'text-rose-600', 'უარი'] : ['clock', 'text-amber-600', 'დრო ამოიწურა'];
    return <><Icon name={ic} className={cn('h-3.5 w-3.5', cls)} /><span>{txt}</span></>;
  };

  return (
    <section className="mx-auto max-w-2xl animate-fade-in px-4 py-8">
      <div className="mb-6"><Stepper active={3} /></div>
      <h1 className="text-2xl font-bold tracking-tight">{done ? 'აუქციონი დასრულდა' : 'მიმდინარეობს აუქციონი'}</h1>
      <p className="mt-2 text-zinc-600">ჩვენი AI აგენტი სადაზღვევო კომპანიებს ეკითხება. ეს რამდენიმე წამს გაგრძელდება.</p>
      <div className="mt-6 h-2 overflow-hidden rounded-full bg-zinc-100">
        <div className="h-full rounded-full bg-zinc-900" style={{ width: started ? '100%' : '0%', transition: `width ${total}s linear` }} />
      </div>
      {/* Phones: one compact row per insurer (full names, status on the right); tiles from sm up. */}
      <div className="mt-5 divide-y divide-zinc-100 rounded-lg border border-zinc-200 sm:grid sm:grid-cols-3 sm:gap-2 sm:divide-y-0 sm:rounded-none sm:border-0">
        {search.ds.map(r => (
          <div key={r.id} className="flex items-center justify-between gap-3 px-3 py-2.5 sm:block sm:rounded-lg sm:border sm:border-zinc-200 sm:py-2">
            <div className="flex min-w-0 items-center gap-2 text-sm font-medium"><InsAvatar id={r.id} size="h-6 w-6 sm:h-5 sm:w-5" /><span className="truncate">{INSURERS[r.id].name}</span></div>
            <div className="flex shrink-0 items-center gap-1.5 text-xs text-zinc-500 sm:mt-1">{chip(r.id)}</div>
          </div>
        ))}
      </div>
      <div className={card('mt-5')}>
        <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-2.5 text-sm font-medium">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>ლაივ-ლოგი
        </div>
        <div ref={logBox} className="max-h-80 overflow-y-auto px-4">
          <ol className="divide-y divide-zinc-100" aria-live="polite">
            {lines.map((line, i) => {
              const [ic, cls] = line.kind === 'spin' && done ? ['circle-check', 'text-emerald-600'] : LOG_ICON[line.kind];
              return (
                <li key={i} className="flex animate-fade-in items-start gap-3 py-2">
                  <span className="w-12 shrink-0 pt-0.5 text-right font-mono text-xs text-zinc-400">{line.t.toFixed(1)} წმ</span>
                  <Icon name={ic} className={cn('mt-0.5 h-4 w-4 shrink-0', cls)} />
                  <span className={cn('text-sm', line.kind === 'done' && 'font-semibold')}>{line.text}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
