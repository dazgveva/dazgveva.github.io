'use client';
import { useEffect } from 'react';
import { MODES, S, emit, enterPortal, go, resetAll, runScenario, sampleCard, toast, userBy } from '@/lib/demo';
import { useDemo } from '@/lib/useDemo';
import { badge, btn, cn } from '@/lib/ui';
import { Icon } from './Icon';

const SCENARIOS: [string, string, string][] = [
  ['S1', 'კლიენტის ძირითადი გზა', 'ატვირთვა → ღირებულება → კონტაქტი → აუქციონი → არჩევა → დადასტურება'],
  ['S2', 'ატვირთვის დეტალები', 'კამერა / ფაილი, პრევიუ, შეცვლა, წაშლა, შეცდომები'],
  ['S3', 'აუქციონი მოულოდნელობებით', 'უარები, დაგვიანებული პასუხები, კატეგორია შეთავაზების გარეშე'],
  ['S4', 'ერთი სადაზღვევო, ორი პაკეტი', 'მაქს + ლიმიტირებული ერთი კომპანიიდან → ერთი მოთხოვნა'],
  ['S5', 'სადაზღვევო ამუშავებს მოთხოვნას', 'სადაზღვევოს დეშბორდი, კონტაქტის გახსნა'],
  ['S6', 'ვადის გასვლა', '24 საათი, შეტყობინება კლიენტს'],
  ['S7', 'ადმინი ამატებს სადაზღვევოს', 'ფორმა, ავთენტიფიკაცია, კავშირის შემოწმება'],
  ['S8', 'დაარქივება და წაშლა', 'GitHub-ის სტილის დადასტურება'],
  ['S9', 'ადმინი ათვალიერებს ძიებას', 'ლოგი, ყველა შეთავაზება, JSON'],
  ['S10', 'შესვლა და პაროლის შეცვლა', 'თანამშრომლების ეკრანები'],
];

/** Demo navigator: jump to any scenario and change demo settings. */
export function Navigator() {
  const S_ = useDemo();
  const close = () => { S.navOpen = false; emit(); };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && S.navOpen && !S.modal) close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <>
      <button onClick={() => { S.navOpen = true; emit(); }} className={btn('primary', 'lg', 'fixed bottom-4 right-4 z-40 hidden rounded-full shadow-lg sm:inline-flex')}>
        <Icon name="compass" className="h-4 w-4" />სცენარები
      </button>
      {S_.navOpen && (
        <div className="fixed inset-0 z-50">
          <div onClick={close} className="absolute inset-0 bg-black/40" />
          <aside role="dialog" aria-label="სცენარები" className="absolute inset-x-0 bottom-0 flex max-h-[88vh] animate-sheet-up flex-col rounded-t-2xl bg-white shadow-xl sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[420px] sm:animate-sheet-in sm:rounded-none">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
              <div><h2 className="font-semibold">სცენარები</h2><p className="text-xs text-zinc-500">დემო ნავიგატორი · ყველა სცენარი</p></div>
              <button onClick={close} aria-label="დახურვა" className={btn('ghost', 'sm')}><Icon name="x" className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <ul className="space-y-2">
                {SCENARIOS.map(([id, t, d]) => (
                  <li key={id}>
                    <button onClick={() => runScenario(id)} className="w-full rounded-lg border border-zinc-200 p-3 text-left transition hover:border-navy-700">
                      <div className="flex items-center gap-2"><span className={badge('bg-navy-900 text-zinc-50')}>{id}</span><span className="text-sm font-semibold">{t}</span><Icon name="arrow-right" className="ml-auto h-4 w-4 text-zinc-400" /></div>
                      <p className="mt-1 text-xs text-zinc-500">{d}</p>
                    </button>
                  </li>
                ))}
              </ul>

              <h3 className="mt-6 text-sm font-semibold">სადემო პარამეტრები</h3>
              <div className="mt-3 space-y-4 rounded-lg bg-zinc-50 p-4">
                <div>
                  <div className="text-xs font-medium text-zinc-500">აუქციონის რეჟიმი</div>
                  <div className="mt-2 grid gap-1.5">
                    {MODES.map(m => (
                      <button key={m.id} onClick={() => { S.mode = m.id; emit(); toast(`აუქციონის რეჟიმი: ${m.label}`); }}
                        className={cn('flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm', S_.mode === m.id ? 'border-navy-900 bg-white font-medium' : 'border-zinc-200 bg-white/60')}>
                        <span className={cn('grid h-3.5 w-3.5 place-items-center rounded-full border', S_.mode === m.id ? 'border-navy-900' : 'border-zinc-400')}>
                          {S_.mode === m.id && <span className="h-1.5 w-1.5 rounded-full bg-navy-900" />}
                        </span>{m.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div><div className="text-sm font-medium">წაუკითხავი სკანი</div><div className="text-xs text-zinc-500">OCR შეცდომას დააბრუნებს</div></div>
                  <button role="switch" aria-checked={S_.failScan} onClick={() => { S.failScan = !S.failScan; emit(); }}
                    className={cn('relative h-6 w-11 shrink-0 rounded-full transition', S_.failScan ? 'bg-navy-900' : 'bg-zinc-300')}>
                    <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all', S_.failScan ? 'left-[22px]' : 'left-0.5')} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => {
                    S.front = sampleCard('front'); S.back = sampleCard('back'); S.uploadError = null; S.scanError = false;
                    S.navOpen = false; go('home'); toast('სადემო ტექპასპორტი ჩაისვა.', 'image');
                  }} className={btn('outline', 'sm')}><Icon name="image" className="h-3.5 w-3.5" />სადემო ტექპასპორტი</button>
                  <button onClick={() => { S.navOpen = false; resetAll(); go('home'); }} className={btn('outline', 'sm')}><Icon name="rotate-ccw" className="h-3.5 w-3.5" />თავიდან დაწყება</button>
                  <button onClick={() => { S.navOpen = false; enterPortal(userBy('admin')!); }} className={btn('outline', 'sm')}><Icon name="shield-check" className="h-3.5 w-3.5" />ადმინად შესვლა</button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
