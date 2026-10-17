'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Icon } from '@/components/Icon';
import { Stepper } from '@/components/Shells';
import {
  CLIENT_VEHICLE, MARKET, MARKET_BINS, MARKET_STATS, S, VALUE_STEP, emit, go, money, num, valueMax, valueMin, valueOk,
} from '@/lib/demo';
import { useDemo } from '@/lib/useDemo';
import { btn, card, cn } from '@/lib/ui';

/** Step 2: AI market valuation; the client agrees or enters their own value. */
export default function ValuePage() {
  const S_ = useDemo();
  const router = useRouter();
  const hasPhotos = !!(S_.front && S_.back);

  useEffect(() => { if (!hasPhotos) router.replace('/'); }, [hasPhotos, router]);
  useEffect(() => {
    if (!hasPhotos || S.aiValue) return;
    S.valuating = 1; emit();
    const a = setTimeout(() => { S.valuating = 2; emit(); }, 1300);
    const b = setTimeout(() => {
      S.valuating = 0; S.aiValue = MARKET_STATS.median;
      if (!S.value) S.value = S.aiValue;
      emit();
    }, 2700);
    return () => { clearTimeout(a); clearTimeout(b); if (S.valuating) { S.valuating = 0; } };
  }, [hasPhotos]);
  if (!hasPhotos) return null;

  const v = CLIENT_VEHICLE;
  const car = <p className="mt-3 flex items-center gap-1.5 text-sm text-zinc-500"><Icon name="car" className="h-4 w-4" />{v.make} {v.model} · {v.year} · {v.engine} {v.fuel}</p>;

  if (S_.valuating || !S_.aiValue) {
    const steps = ['ვეძებთ მსგავს განცხადებებს ბაზარზე', 'ვითვლით საშუალო ფასს'];
    return (
      <section className="mx-auto max-w-2xl animate-fade-in px-4 py-8">
        <div className="mb-6"><Stepper active={1} /></div>
        <h1 className="text-2xl font-bold tracking-tight">ავტომობილის ღირებულება</h1>{car}
        <div className={card('mt-6 p-6')}>
          <ul className="space-y-3 text-sm">
            {steps.map((t, i) => {
              const done = S_.valuating > i + 1 || !S_.valuating, cur = S_.valuating === i + 1;
              return (
                <li key={t} className={cn('flex items-center gap-3', done || cur ? 'text-zinc-900' : 'text-zinc-400')}>
                  {done ? <Icon name="circle-check" className="h-4 w-4 text-emerald-600" />
                    : cur ? <Icon name="loader-circle" className="h-4 w-4 animate-spin" />
                    : <span className="h-4 w-4 rounded-full border-2 border-zinc-300" />}{t}…
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    );
  }

  const own = S_.valueMode === 'own';
  const setMode = (m: 'ai' | 'own') => { S.valueMode = m; if (m === 'ai') S.value = S.aiValue; emit(); };
  const option = (id: 'ai' | 'own', title: string, right: ReactNode) => (
    <button type="button" role="radio" aria-checked={S_.valueMode === id} onClick={() => setMode(id)}
      className={cn('flex w-full items-center gap-3 rounded-xl border p-4 text-left transition', S_.valueMode === id ? 'border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-200 hover:border-zinc-400')}>
      <span className={cn('grid h-4 w-4 shrink-0 place-items-center rounded-full border', S_.valueMode === id ? 'border-zinc-900' : 'border-zinc-400')}>{S_.valueMode === id && <span className="h-2 w-2 rounded-full bg-zinc-900" />}</span>
      <span className="flex-1 text-sm font-medium">{title}</span>{right}
    </button>
  );
  const ok = S_.valueMode === 'ai' || valueOk(S_.value);

  return (
    <section className="mx-auto max-w-2xl animate-fade-in px-4 py-8">
      <div className="mb-6"><Stepper active={1} /></div>
      <h1 className="text-2xl font-bold tracking-tight">ავტომობილის ღირებულება</h1>
      <p className="mt-2 text-zinc-600">AI-მ ბაზარზე მსგავსი ავტომობილების ფასები გააანალიზა. ამ ღირებულებით განისაზღვრება სადაზღვევო თანხა.</p>
      {car}
      <div className={card('mt-6 p-5')}>
        <div className="flex items-center gap-1.5 text-sm text-zinc-500"><Icon name="sparkles" className="h-4 w-4" />AI-ის შეფასება</div>
        <div className="mt-1 text-4xl font-bold tracking-tight text-[#263A5C]">{money(S_.aiValue)}</div>
        <p className="mt-1 text-sm text-zinc-500">მსგავსი განცხადებების საშუალო (მედიანა). ფასების უმეტესობა: {money(MARKET_STATS.p25)} – {money(MARKET_STATS.p75)}.</p>
        <ValueChart />
      </div>
      <div className="mt-6 space-y-3" role="radiogroup" aria-label="რა ღირებულებით დავაზღვიოთ?">
        <div className="text-sm font-medium">რა ღირებულებით დავაზღვიოთ?</div>
        {option('ai', 'ვეთანხმები AI-ის შეფასებას', <span className="text-sm font-semibold">{money(S_.aiValue)}</span>)}
        {option('own', 'მივუთითებ საკუთარ ღირებულებას', <Icon name="pencil" className="h-4 w-4 text-zinc-400" />)}
        {own && <OwnValue />}
      </div>
      <div className="mt-6 flex items-center justify-between gap-3">
        <button onClick={() => go('home')} className={btn('ghost')}><Icon name="arrow-left" className="h-4 w-4" />უკან</button>
        <button disabled={!ok} onClick={() => { if (S.valueMode === 'ai') S.value = S.aiValue; if (valueOk(S.value)) go('contact'); }} className={btn('primary', 'lg')}>
          გაგრძელება<Icon name="arrow-right" className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

/** The client's own value: number field + slider, difference, warning above 15 %. */
function OwnValue() {
  const S_ = useDemo();
  const [raw, setRaw] = useState(String(S_.value ?? S_.aiValue));
  const set = (v: number) => { S.value = v; emit(); };
  const v = S_.value, ok = valueOk(v);
  const pct = ok ? Math.round((v! - S_.aiValue!) / S_.aiValue! * 100) : 0;
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
      <label htmlFor="val-input" className="text-sm font-medium">შენი ღირებულება</label>
      <div className="mt-2 flex items-center gap-3">
        <div className="flex">
          <input id="val-input" autoFocus type="number" inputMode="numeric" min={valueMin()} max={valueMax()} step={VALUE_STEP} value={raw}
            onChange={e => { setRaw(e.target.value); set(Math.round(+e.target.value)); }}
            className={cn('h-11 w-36 rounded-l-lg border bg-white px-3 text-lg font-semibold outline-hidden focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10', ok ? 'border-zinc-200' : 'border-rose-400')} />
          <span className="inline-flex items-center rounded-r-lg border border-l-0 border-zinc-200 bg-white px-3 text-zinc-500">₾</span>
        </div>
        <span className="text-sm text-zinc-500">{!ok ? '' : pct === 0 ? 'ემთხვევა AI-ის შეფასებას' : `სხვაობა AI-ის შეფასებასთან: ${pct > 0 ? '+' : ''}${pct}%`}</span>
      </div>
      <input type="range" min={valueMin()} max={valueMax()} step={VALUE_STEP} value={ok ? v! : S_.aiValue!} aria-label="ღირებულების შერჩევა"
        onChange={e => { setRaw(e.target.value); set(+e.target.value); }} className="mt-4 w-full accent-[#263A5C]" />
      <div className="flex justify-between text-[11px] text-zinc-400"><span>{money(valueMin())}</span><span>{money(valueMax())}</span></div>
      {!ok && <p className="mt-2 text-sm text-rose-600">ღირებულება უნდა იყოს {money(valueMin())} – {money(valueMax())} ფარგლებში.</p>}
      {ok && Math.abs(pct) > 15 && (
        <p className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-900"><Icon name="triangle-alert" className="mt-0.5 h-3.5 w-3.5 shrink-0" />საბაზროსგან მნიშვნელოვნად განსხვავებულ ღირებულებას სადაზღვევო შეიძლება ხელახლა შეამოწმოს.</p>
      )}
      <p className="mt-3 flex items-start gap-2 text-xs text-zinc-500"><Icon name="info" className="mt-0.5 h-3.5 w-3.5 shrink-0" />მეტი ღირებულება — მეტი სადაზღვევო თანხა და პრემია. ნაკლები — ზარალისას ანაზღაურება შეიძლება არ იყოს საკმარისი.</p>
    </div>
  );
}

/* Single-series histogram: no legend (the title names it), per-bar tooltip on hover/focus,
   labelled markers for the AI estimate and the client's own value, and a table twin. */
function ValueChart() {
  const S_ = useDemo();
  const { lo, hi, bins } = MARKET_BINS, top = Math.max(...bins.map(b => b.n));
  const pos = (v: number) => Math.min(100, Math.max(0, (v - lo) / (hi - lo) * 100));
  const showOwn = S_.valueMode === 'own' && valueOk(S_.value) && S_.value !== S_.aiValue;
  const ownPos = pos(S_.value ?? S_.aiValue!);
  return (
    <figure className="mt-6">
      <figcaption className="text-sm font-medium">მსგავსი ავტომობილების ფასები ბაზარზე</figcaption>
      <p className="text-xs text-zinc-500">{MARKET.length} განცხადება · Toyota Camry, 2017–2019 · ერთი სვეტი = 2 000 ₾ დიაპაზონი</p>
      <div className="relative mt-9 h-36">
        <div className="flex h-full items-end gap-[2px]">
          {bins.map(b => (
            <div key={b.from} tabIndex={0} className="group relative h-full flex-1 outline-hidden" aria-label={`${num(b.from)}–${num(b.to)} ₾: ${b.n} განცხადება`}>
              <div className="absolute inset-x-0 bottom-0 rounded-t-sm bg-sky-200 transition group-hover:bg-sky-400 group-focus:bg-sky-400" style={{ height: `${b.n ? Math.max(4, b.n / top * 100) : 0}%` }} />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-[11px] text-white shadow-sm group-hover:block group-focus:block">{num(b.from)}–{num(b.to)} ₾ · {b.n} განცხ.</div>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 border-l-2 border-dashed border-[#263A5C]" style={{ left: `${pos(S_.aiValue!)}%` }}>
          <span className="absolute -top-7 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#263A5C] px-1.5 py-0.5 text-[11px] font-medium text-white">AI: {money(S_.aiValue!)}</span>
        </div>
        {showOwn && (
          <div className="pointer-events-none absolute inset-y-0 border-l-2 border-sky-600" style={{ left: `${ownPos}%` }}>
            <span className={cn('absolute top-1 whitespace-nowrap rounded-md bg-sky-600 px-1.5 py-0.5 text-[11px] font-medium text-white', ownPos > 70 ? 'right-1' : 'left-1')}>შენი: {money(S_.value!)}</span>
          </div>
        )}
      </div>
      <div className="mt-1.5 flex justify-between border-t border-zinc-200 pt-1 text-[11px] text-zinc-400"><span>{num(lo)} ₾</span><span>{num((lo + hi) / 2)} ₾</span><span>{num(hi)} ₾</span></div>
      <details className="mt-3 text-xs">
        <summary className="cursor-pointer text-zinc-500 hover:text-zinc-900">ცხრილის სახით</summary>
        <table className="mt-2 w-full max-w-xs text-left">
          <thead className="text-zinc-500"><tr><th className="py-1 font-medium">ფასი (₾)</th><th className="py-1 text-right font-medium">განცხადება</th></tr></thead>
          <tbody className="divide-y divide-zinc-100">{bins.map(b => <tr key={b.from}><td className="py-1">{num(b.from)}–{num(b.to)}</td><td className="py-1 text-right">{b.n}</td></tr>)}</tbody>
        </table>
      </details>
    </figure>
  );
}
