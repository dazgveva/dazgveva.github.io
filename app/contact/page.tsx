'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Icon } from '@/components/Icon';
import { StepActions, Stepper } from '@/components/Shells';
import { CHANNELS, S, emit, fmtPhone, go, phoneValid } from '@/lib/demo';
import type { ChannelId } from '@/lib/types';
import { useDemo } from '@/lib/useDemo';
import { btn, card, cn } from '@/lib/ui';

/** Step 3: phone number, contact channels and the preferred one. */
export default function ContactPage() {
  const S_ = useDemo();
  const router = useRouter();
  const ready = !!(S_.front && S_.back && S_.value);
  useEffect(() => { if (!ready) router.replace(S.front && S.back ? '/value/' : '/'); }, [ready, router]);
  if (!ready) return null;

  const many = S_.channels.length > 1;
  const showErr = S_.phoneTouched && !!S_.phone && !phoneValid();
  const toggle = (id: ChannelId) => {
    S.channels = S.channels.includes(id) ? S.channels.filter(c => c !== id) : [...S.channels, id];
    if (!S.preferred || !S.channels.includes(S.preferred)) S.preferred = S.channels[0] || null;
    emit();
  };

  return (
    <section className="mx-auto max-w-xl animate-fade-in px-4 py-8">
      <div className="mb-6"><Stepper active={2} /></div>
      <h1 className="text-2xl font-bold tracking-tight">როგორ დაგიკავშირდეთ?</h1>
      <div className={card('mt-6 space-y-6 p-5')}>
        <div>
          <label htmlFor="phone" className="text-sm font-medium">მობილურის ნომერი</label>
          <div className="mt-2 flex">
            <span className="inline-flex items-center rounded-l-lg border border-r-0 border-zinc-200 bg-zinc-50 px-3 text-base text-zinc-600 sm:text-sm">+995</span>
            <input id="phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="5XX XX XX XX" value={fmtPhone(S_.phone)}
              onChange={e => { S.phone = e.target.value.replace(/\D/g, '').replace(/^995/, '').slice(0, 9); emit(); }}
              onBlur={() => { S.phoneTouched = true; emit(); }}
              className={cn('h-12 w-full rounded-r-lg border px-3 text-base tracking-wide sm:h-11 outline-hidden focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10', showErr ? 'border-rose-400' : 'border-zinc-200')} />
          </div>
          {showErr && <p className="mt-1.5 text-sm text-rose-600">შეიყვანეთ სწორი მობილურის ნომერი (5XX XX XX XX).</p>}
        </div>
        <div>
          <div className="text-sm font-medium">საკონტაქტო საშუალებები</div>
          <p className="mt-1 text-sm text-zinc-500">შეგიძლიათ აირჩიოთ ერთი ან რამდენიმე.</p>
          <div className="mt-3 grid gap-2.5 min-[480px]:grid-cols-2" role="group">
            {CHANNELS.map(c => {
              const on = S_.channels.includes(c.id), pref = S_.preferred === c.id;
              return (
                <div key={c.id} role="checkbox" aria-checked={on} tabIndex={0} onClick={() => toggle(c.id)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(c.id); } }}
                  className={cn('cursor-pointer select-none rounded-lg border p-3 transition', on ? 'border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-200 hover:border-zinc-400')}>
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md" style={{ background: `${c.color}14`, color: c.color }}><Icon name={c.icon} className="h-4 w-4" /></span>
                    <span className="min-w-0 text-[15px] font-medium leading-tight sm:text-sm">{c.label}</span>
                    <span className={cn('ml-auto grid h-5 w-5 shrink-0 place-items-center rounded-sm border sm:h-4 sm:w-4', on ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-300')}>{on && <Icon name="check" className="h-3 w-3" />}</span>
                  </div>
                  {on && many && (
                    <button type="button" role="radio" aria-checked={pref} onClick={e => { e.stopPropagation(); S.preferred = c.id; emit(); }}
                      className={cn('mt-2 flex w-full items-center gap-2 rounded-md px-1 py-2 text-xs sm:py-1', pref ? 'font-semibold text-zinc-900' : 'text-zinc-500 hover:text-zinc-900')}>
                      <span className={cn('grid h-3.5 w-3.5 place-items-center rounded-full border', pref ? 'border-zinc-900' : 'border-zinc-400')}>{pref && <span className="h-1.5 w-1.5 rounded-full bg-zinc-900" />}</span>
                      უპირატესი{pref && <Icon name="star" className="ml-auto h-3.5 w-3.5 text-amber-400" />}
                    </button>
                  )}
                  {on && !many && <div className="mt-2.5 flex items-center gap-1.5 px-1 text-xs font-semibold"><Icon name="star" className="h-3.5 w-3.5 text-amber-400" />უპირატესი</div>}
                </div>
              );
            })}
          </div>
          {many && <p className="mt-3 text-sm text-zinc-500">აირჩიეთ, რომელი საშუალებით გირჩევნიათ, რომ ჯერ დაგიკავშირდნენ.</p>}
        </div>
        <p className="flex items-start gap-2 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600"><Icon name="lock" className="mt-0.5 h-4 w-4 shrink-0" />თქვენი პირადი მონაცემები სადაზღვევო კომპანიას მხოლოდ მაშინ გადაეცემა, როცა თქვენ მის შეთავაზებას აირჩევთ.</p>
      </div>
      <StepActions back={() => go('value')}>
        <button disabled={!(phoneValid() && S_.channels.length)} onClick={() => go('auction')} className={btn('primary', 'lg')}>შეთავაზებების მოძიება<Icon name="arrow-right" className="h-4 w-4" /></button>
      </StepActions>
    </section>
  );
}
