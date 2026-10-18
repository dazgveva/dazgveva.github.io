'use client';
import { useEffect, useRef, useState } from 'react';
import { CatIcon, InsAvatar, Preview } from '@/components/bits';
import { Icon } from '@/components/Icon';
import { INSURERS, S, SIDE_NAME, acceptFiles, activeInsurers, catById, emit, go, nextSide, setSide, toast } from '@/lib/demo';
import type { CatId, Side } from '@/lib/types';
import { useDemo } from '@/lib/useDemo';
import { HOME_BTN_ACCENT, HOME_BTN_SOFT, cn } from '@/lib/ui';

const h2 = 'text-center text-xl font-bold uppercase tracking-wide text-navy-900 sm:text-2xl';
const row = 'flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-xs';
const chip = 'inline-flex items-center gap-1 text-xs text-zinc-500';
const PACKAGES: [CatId, string, [string, string][]][] = [
  ['max', 'ავარია, ქურდობა, სტიქია, მინები და ევაკუატორი — დაბალი ფრანშიზით.', [['shield', 'სრული დაფარვა'], ['badge-percent', 'დაბალი ფრანშიზა']]],
  ['limited', 'ძირითადი რისკები ან დაფარვა ლიმიტებით — ბალანსი ფასსა და დაცვას შორის.', [['shield', 'ძირითადი რისკები'], ['badge-percent', 'საშუალო ფრანშიზა']]],
  ['cheap', 'მინიმალური დაფარვა ყველაზე დაბალ ფასად.', [['car', 'ავარია + ქურდობა'], ['trending-down', 'ყველაზე დაბალი ფასი']]],
];
const FAQ: [string, string][] = [
  ['ფასიანია თუ არა dazgveva.ge?', 'არა. ჩვენი მომსახურება უფასოა და არ იწვევს სადაზღვევო პროდუქტის გაძვირებას. პრემიას, რომელსაც ხედავთ, თავად სადაზღვევო კომპანია ადგენს.'],
  ['რა ინფორმაციას იღებენ სადაზღვევოები?', 'აუქციონის დროს — მხოლოდ ავტომობილის მონაცემებს (მარკა, მოდელი, წელი, VIN, ღირებულება). სახელს, პირად ნომერს და ტელეფონს იღებს მხოლოდ ის კომპანია, რომლის შეთავაზებასაც აირჩევთ, და ისიც თქვენი თანხმობით. მისამართი არავის გადაეცემა.'],
  ['როგორ ირჩევს AI საუკეთესო შეთავაზებას?', 'შეთავაზებებს ერთი კატეგორიის შიგნით ადარებს: „იაფში“ — ყველაზე დაბალ წლიურ პრემიას, „მაქსსა“ და „ლიმიტირებულში“ — ფასის, ფრანშიზისა და დაფარვის საუკეთესო ბალანსს. თითოეულ არჩევანს მოკლე ახსნა ახლავს.'],
  ['რა ხდება მოთხოვნის გაგზავნის შემდეგ?', 'არჩეულ კომპანიას ანონიმური მოთხოვნა მიუვა. როცა ის თქვენს კონტაქტს მოითხოვს, შეტყობინებას მიიღებთ თქვენთვის სასურველი საშუალებით. თუ 24 საათში არ მოითხოვს, ამასაც გაცნობებთ.'],
  ['საჭიროა რეგისტრაცია?', 'არა. საკმარისია ტექპასპორტის ორივე მხარის ფოტო და ტელეფონის ნომერი.'],
];
const HOW: [string, string, string][] = [
  ['scan-line', 'ატვირთე ტექპასპორტი', 'ორივე მხარის ფოტო — ფაილით ან კამერით.'],
  ['bot', 'AI აფასებს და ეკითხება', 'AI ბაზრის მიხედვით აფასებს ავტომობილს (შეგიძლია შეცვალო) და ყველა პარტნიორის AI აგენტს ერთდროულად ეკითხება.'],
  ['list-checks', 'აირჩიე საუკეთესო', 'თითო კატეგორიაში ერთ საუკეთესო შეთავაზებას ხედავ და ირჩევ, ვინ დაგიკავშირდეს.'],
];
const ACCEPT = '.jpg,.jpeg,.png,.heic,.heif,image/*';

export default function HomePage() {
  const S_ = useDemo();
  const multi = useRef<HTMLInputElement>(null), front = useRef<HTMLInputElement>(null), back = useRef<HTMLInputElement>(null);
  const pick = (side?: Side) => (side === 'front' ? front : side === 'back' ? back : multi).current?.click();
  const any = S_.front || S_.back;

  // "AI ძიების დაწყება": simulated OCR (2 s), then the valuation step (or the unreadable-scan error).
  const scanTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(scanTimer.current), []);
  const scan = () => {
    S.processing = true; S.scanError = false; emit();
    scanTimer.current = setTimeout(() => {
      S.processing = false;
      if (S.failScan) { S.scanError = true; emit(); } else go('value');
    }, 2000);
  };

  return (
    <>
      <input ref={multi} type="file" accept={ACCEPT} multiple hidden onChange={e => { if (e.target.files?.length) acceptFiles(e.target.files); e.target.value = ''; }} />
      <input ref={front} type="file" accept={ACCEPT} hidden onChange={e => { if (e.target.files?.length) acceptFiles(e.target.files, 'front'); e.target.value = ''; }} />
      <input ref={back} type="file" accept={ACCEPT} hidden onChange={e => { if (e.target.files?.length) acceptFiles(e.target.files, 'back'); e.target.value = ''; }} />

      <section id="top" className="relative scroll-mt-24 overflow-hidden lg:flex lg:min-h-[calc(100svh-3.5rem-1px)] lg:items-center">
        <div className="pointer-events-none absolute left-1/2 top-24 h-72 w-[42rem] max-w-[120%] -translate-x-1/2 rounded-full bg-linear-to-b from-brand-100 via-navy-50 to-transparent opacity-70 blur-3xl" />
        <div className="relative mx-auto w-full max-w-3xl px-4 pb-16 pt-14 text-center sm:pt-20 lg:py-12">
          <div className="flex items-center justify-center gap-3 sm:gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="" className="h-20 w-auto sm:h-28" />
            <span className="text-5xl font-bold tracking-tight text-navy-900 sm:text-7xl">dazgveva</span>
          </div>
          <h1 className="mx-auto mt-6 max-w-xl text-sm font-medium uppercase tracking-wider text-zinc-600 sm:text-base">აპოვნინე ხელოვნურ ინტელექტს შენთვის შესაფერისი სადაზღვევო პაკეტი</h1>

          <div className="relative mt-8">
            <div className="pointer-events-none absolute inset-x-12 -bottom-5 h-14 rounded-full bg-linear-to-r from-brand-300 via-navy-200 to-brand-300 opacity-50 blur-2xl" />
            <UploadZone pick={pick} scan={scan} />
          </div>

          {S_.uploadError && <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-rose-600"><Icon name="circle-alert" className="h-4 w-4 shrink-0" />{S_.uploadError}</p>}
          {S_.scanError && (
            <div className="mx-auto mt-4 flex max-w-xl items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-left text-sm text-rose-800">
              <Icon name="triangle-alert" className="mt-0.5 h-4 w-4 shrink-0" />ტექპასპორტის წაკითხვა ვერ მოხერხდა. გთხოვთ, ატვირთოთ უფრო მკაფიო ფოტო.
            </div>
          )}

          {any && (
            <>
              <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3"><Thumb side="front" pick={pick} /><Thumb side="back" pick={pick} /></div>
              {S_.front && S_.back && (
                <button onClick={() => { [S.front, S.back] = [S.back, S.front]; emit(); toast('მხარეები გაიცვალა.', 'arrow-left-right'); }}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-medium sm:px-3 sm:py-1.5 text-zinc-600 hover:bg-zinc-100">
                  <Icon name="arrow-left-right" className="h-3.5 w-3.5" />მხარეების გაცვლა
                </button>
              )}
            </>
          )}

          <div className="mt-8 inline-flex items-start gap-2 rounded-2xl bg-brand-50 px-4 py-2.5 text-left text-sm font-semibold text-brand-800 ring-1 ring-inset ring-brand-200 sm:items-center sm:rounded-full">
            <Icon name="badge-check" className="h-5 w-5 shrink-0" />ჩვენი მომსახურება უფასოა და არ იწვევს სადაზღვევო პროდუქტის გაძვირებას.
          </div>
          <div className="mx-auto mt-4 flex max-w-xl items-start gap-3 rounded-2xl border border-zinc-200 bg-white/80 p-4 text-left">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy-50 text-navy-900"><Icon name="landmark" className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-semibold text-navy-900">დამოუკიდებელი არაკომერციული პლატფორმა</p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600">ჩვენ არ ვართ სადაზღვევო ბროკერი. პლატფორმა არაკომერციული ორგანიზაციის ეგიდით მუშაობს, ამიტომ ფასები სრულად გამჭვირვალეა და მათში ფარული საკომისიო არ არის ჩადებული.</p>
            </div>
          </div>
          <p className="mt-4 text-[11px] text-zinc-400">ეს საიტი დაცულია reCAPTCHA-ით და მოქმედებს Google-ის <a href="#" onClick={e => e.preventDefault()} className="underline">კონფიდენციალურობის პოლიტიკა</a> და <a href="#" onClick={e => e.preventDefault()} className="underline">მომსახურების პირობები</a>.</p>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-5xl scroll-mt-24 px-4 py-14">
        <h2 className={h2}>როგორ მუშაობს</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {HOW.map(([ic, t, d], i) => (
            <div key={t} className="rounded-2xl border border-zinc-200 bg-white p-5 text-left">
              <div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-navy-900"><Icon name={ic} className="h-5 w-5" /></span><span className="text-3xl font-bold text-zinc-100">{i + 1}</span></div>
              <h3 className="mt-4 font-semibold">{t}</h3><p className="mt-1 text-sm text-zinc-500">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="packages" className="mx-auto max-w-5xl scroll-mt-24 px-4 py-14">
        <h2 className={h2}>სამი პაკეტი</h2>
        <p className="mt-2 text-center text-sm text-zinc-500">შეთავაზებებს მხოლოდ ერთი კატეგორიის შიგნით ვადარებთ — მსგავსს მსგავსთან.</p>
        <div className="mt-8 space-y-3">
          {PACKAGES.map(([id, d, chips]) => (
            <div key={id} className={row}>
              <CatIcon id={id} />
              <div className="min-w-0 flex-1 text-left">
                <div className="font-semibold">{catById(id).label}</div>
                <p className="mt-0.5 text-sm text-zinc-500">{d}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">{chips.map(([ci, ct]) => <span key={ct} className={chip}><Icon name={ci} className="h-3.5 w-3.5" />{ct}</span>)}</div>
              </div>
              <button onClick={() => document.getElementById('top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} aria-label="ძიების დაწყება"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-700 transition hover:bg-zinc-200"><Icon name="arrow-up-right" className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </section>

      <section id="partners" className="mx-auto max-w-5xl scroll-mt-24 px-4 py-14">
        <h2 className={h2}>პარტნიორი სადაზღვევოები</h2>
        <p className="mt-2 text-center text-sm text-zinc-500">ყოველ ძიებაზე ყველა მათგანის AI აგენტს ერთდროულად ვეკითხებით. ერთი დახურული რაუნდი — არავინ ხედავს კონკურენტის ფასს.</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {activeInsurers().map(id => <div key={id} className={row}><InsAvatar id={id} size="h-12 w-12" /><div className="min-w-0 flex-1 truncate text-left font-semibold">{INSURERS[id].name}</div></div>)}
        </div>
        <p className="mt-6 text-center text-sm text-zinc-500">ხართ სადაზღვევო კომპანია? დააკავშირეთ თქვენი AI აგენტი ჩვენს API-სთან და მიიღეთ მოთხოვნები პირდაპირ კლიენტებისგან.</p>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 text-center">
        <h2 className={h2}>ვინ ვართ</h2>
        <p className="mt-4 text-zinc-600">dazgveva.ge არის დამოუკიდებელი შუამავალი მძღოლებსა და სადაზღვევო კომპანიებს შორის. ჩვენი მიზანია, მარტივად იპოვოთ თქვენთვის სასურველი პაკეტი და კომპანია.</p>
      </section>

      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-14">
        <h2 className={h2}>ხშირად დასმული კითხვები</h2>
        <div className="mt-8 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group px-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-medium [&::-webkit-details-marker]:hidden">{q}<Icon name="plus" className="h-4 w-4 shrink-0 text-zinc-400 transition group-open:rotate-45" /></summary>
              <p className="pb-4 text-left text-sm leading-relaxed text-zinc-600">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

/* Upload area: a drop zone that asks for the next side of the tech passport (Google-style wording:
   "drop here" + "or choose a file"); once both sides are in, it turns into the start-search bar. */
function UploadZone({ pick, scan }: { pick: (side?: Side) => void; scan: () => void }) {
  const S_ = useDemo();
  const [drag, setDrag] = useState(false);
  const target = nextSide();
  if (!target) return (
    <div className="relative flex flex-col gap-2 rounded-3xl border border-zinc-200 bg-white p-2 shadow-xs sm:flex-row sm:items-center sm:rounded-full sm:pl-6">
      <div className="flex flex-1 items-center gap-3 px-3 py-2 text-left sm:px-0"><Icon name="circle-check" className="h-5 w-5 shrink-0 text-emerald-600" /><span className="text-sm font-medium sm:text-base">ორივე მხარე ატვირთულია</span></div>
      <button onClick={scan} disabled={S_.processing} className={HOME_BTN_ACCENT}>
        {S_.processing ? <><Icon name="loader-circle" className="h-4 w-4 animate-spin" />ტექპასპორტი მუშავდება…</> : <><Icon name="sparkles" className="h-4 w-4" />AI ძიების დაწყება</>}
      </button>
    </div>
  );
  return (
    <div onClick={() => pick()}
      onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); acceptFiles(e.dataTransfer.files); }}
      className={cn('relative flex cursor-pointer flex-col items-center gap-3 rounded-3xl border-2 border-dashed px-6 py-8 transition',
        S_.uploadError ? 'border-rose-300 bg-rose-50/40' : 'border-zinc-300 bg-white/80 hover:border-brand-500 hover:bg-brand-50/50', drag && 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-300')}>
      <span className="inline-flex items-center gap-2 rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold text-navy-800">{target === 'front' ? 1 : 2} / 2 · ტექპასპორტის {SIDE_NAME[target]}</span>
      <span className="grid h-14 w-20 place-items-center rounded-xl border-2 border-zinc-300 text-zinc-400"><Icon name={target === 'front' ? 'credit-card' : 'scan-line'} className="h-7 w-7" /></span>
      <p className="hidden text-base font-medium text-zinc-800 sm:block">ჩააგდე ფოტო აქ</p>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-zinc-400 sm:inline">ან</span>
        <button onClick={e => { e.stopPropagation(); pick(); }} className={HOME_BTN_SOFT}><Icon name="image-up" className="h-4 w-4" /><span className="sm:hidden">აირჩიე ფოტო</span><span className="hidden sm:inline">აირჩიე ფაილი</span></button>
      </div>
      <p className="text-xs text-zinc-400">JPG, PNG ან HEIC · მაქს. 10 მბ{target === 'front' && !S_.back ? ' · შეგიძლია ორივე ფოტო ერთად აირჩიო' : ''}</p>
    </div>
  );
}

function Thumb({ side, pick }: { side: Side; pick: (side?: Side) => void }) {
  const S_ = useDemo();
  const f = S_[side], isNext = nextSide() === side;
  if (!f) return (
    <div className={cn('flex aspect-[1.586] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed text-xs', isNext ? 'border-brand-400 bg-brand-50/60 text-navy-800' : 'border-zinc-200 text-zinc-400')}>
      <Icon name={side === 'front' ? 'credit-card' : 'scan-line'} className="h-5 w-5" /><span className="font-medium">{SIDE_NAME[side]}</span>{isNext && <span className="text-zinc-500">ახლა ეს მხარე</span>}
    </div>
  );
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div className="relative aspect-[1.586] bg-zinc-50">
        <Preview url={f.url} name={f.name} alt={SIDE_NAME[side]} />
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium shadow-xs"><Icon name="circle-check" className="h-3 w-3 text-emerald-600" />{SIDE_NAME[side]}</span>
      </div>
      <div className="flex divide-x divide-zinc-200 border-t border-zinc-200 text-xs font-medium">
        <button onClick={() => pick(side)} className="flex flex-1 items-center justify-center gap-1.5 py-3 hover:bg-zinc-50 sm:py-2"><Icon name="refresh-cw" className="h-3.5 w-3.5" />შეცვლა</button>
        <button onClick={() => { setSide(side, null); S.scanError = false; emit(); }} className="flex flex-1 items-center justify-center gap-1.5 py-3 text-rose-600 hover:bg-rose-50 sm:py-2"><Icon name="trash-2" className="h-3.5 w-3.5" />წაშლა</button>
      </div>
    </div>
  );
}
