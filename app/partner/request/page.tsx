'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { CatBadge, ChIcon, Countdown, DemoTag, Row, StatusBadge } from '@/components/bits';
import { Icon } from '@/components/Icon';
import { CopyBtn } from '@/components/ModalHost';
import { PartnerShell } from '@/components/Shells';
import { COVERAGE, DAY, S, chById, fmtDate, fmtPhone, initials, leadById, maskName, money, msgChannel, openModal } from '@/lib/demo';
import { useDemo } from '@/lib/useDemo';
import { btn, card, cn } from '@/lib/ui';

export default function PartnerRequestPage() {
  return <PartnerShell active="ins-list"><Suspense><Detail /></Suspense></PartnerShell>;
}

function Detail() {
  const S_ = useDemo();
  const router = useRouter();
  const id = useSearchParams().get('id') || S_.leadId;
  const l = leadById(id);
  const valid = !!l && l.insurer === S_.insurer;
  useEffect(() => { if (!valid) router.replace('/partner/'); else S.leadId = id; }, [valid, id, router]);
  if (!valid || !l) return null;

  const v = l.vehicle, c = l.client;
  const ev: { at: number; icon: string; text: string; msg?: 'reveal' | 'expiry'; pending?: boolean }[] = [{ at: l.sentAt, icon: 'inbox', text: 'მოთხოვნა შემოვიდა' }];
  if (l.revealedAt) ev.push({ at: l.revealedAt, icon: 'lock-open', text: 'საკონტაქტო ინფორმაცია მოთხოვნილია' });
  if (l.expiredAt) ev.push({ at: l.expiredAt, icon: 'clock', text: 'მოთხოვნას ვადა გაუვიდა' });
  for (const m of l.messages) ev.push({ at: m.at + 1000, icon: 'message-square', text: `კლიენტს ეცნობა · ${msgChannel(l)}`, msg: m.type });
  if (l.status === 'new') ev.push({ at: l.sentAt + DAY, icon: 'hourglass', text: 'ვადის გასვლა', pending: true });
  ev.sort((a, b) => a.at - b.at);

  return (
    <>
      <Link href="/partner/" className={btn('ghost', 'sm', '-ml-3 text-zinc-600')}><Icon name="arrow-left" className="h-4 w-4" />მოთხოვნები</Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{initials(c)}</h1><StatusBadge s={l.status} />{l.fromClient && <DemoTag />}
        {l.status === 'new' && <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1 text-sm"><Icon name="hourglass" className="h-3.5 w-3.5" />დარჩენილი დრო: <Countdown l={l} /></span>}
      </div>
      <p className="mt-1 text-sm text-zinc-500">მოთხოვნა {l.id} · მიღებულია {fmtDate(l.sentAt)}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-6">
          <div className={card('p-5')}>
            <h2 className="flex items-center gap-2 font-semibold"><Icon name="car" className="h-4 w-4" />ავტომობილი</h2>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <Row k="მარკა, მოდელი">{v.make} {v.model}</Row><Row k="წელი">{v.year}</Row><Row k="ფერი">{v.color}</Row>
              <Row k="VIN" mono>{v.vin}</Row><Row k="სახელმწიფო ნომერი" mono>{v.plate}</Row><Row k="ძარა">{v.body}</Row>
              <Row k="ძრავა">{v.engine}</Row><Row k="საწვავი">{v.fuel}</Row>
            </dl>
            <div className="mt-4 rounded-lg bg-zinc-50 p-3 text-sm">
              <div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-zinc-600"><Icon name="sparkles" className="h-3.5 w-3.5" />სადაზღვევო ღირებულება</span><b>{money(v.value)}</b></div>
              <div className="mt-1 text-xs text-zinc-500">{v.aiValue && v.aiValue !== v.value ? `კლიენტმა მიუთითა · AI-ის საბაზრო შეფასება: ${money(v.aiValue)}` : 'AI-ის საბაზრო შეფასება, კლიენტმა დაადასტურა'}</div>
            </div>
          </div>
          <div className={card('p-5')}>
            <h2 className="flex items-center gap-2 font-semibold"><Icon name="package-check" className="h-4 w-4" />არჩეული პაკეტები</h2>
            <div className="mt-4 space-y-3">
              {l.packages.map(p => (
                <div key={p.cat} className="rounded-lg border border-zinc-200 p-4">
                  <div className="flex items-center justify-between"><CatBadge id={p.cat} full /><span className="text-lg font-bold">{money(p.premium)} <span className="text-xs font-normal text-zinc-500">/ წელი</span></span></div>
                  <div className="mt-2 text-sm text-zinc-600">სადაზღვევო თანხა {money(p.sum)} · ფრანშიზა {money(p.deductible)}</div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                    {COVERAGE.map(([k, lb]) => p.cov.includes(k)
                      ? <span key={k} className="inline-flex items-center gap-1"><Icon name="check" className="h-3 w-3 text-emerald-600" />{lb}</span>
                      : <span key={k} className="inline-flex items-center gap-1 text-zinc-400 line-through">{lb}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className={card('p-5')}>
            <h2 className="flex items-center gap-2 font-semibold"><Icon name="contact" className="h-4 w-4" />საკონტაქტო ინფორმაცია</h2>
            <div className="mt-4">
              {l.status === 'new' && <>
                <dl className="select-none space-y-3 text-sm">
                  <Row k="სახელი, გვარი"><span className="font-mono tracking-wider text-zinc-400">{maskName(c)}</span></Row>
                  <Row k="პირადი ნომერი"><span className="font-mono tracking-wider text-zinc-400">•••••••••••</span></Row>
                  <Row k="ტელეფონი"><span className="font-mono tracking-wider text-zinc-400">+995 5•• •• •• ••</span></Row>
                  <div><dt className="text-xs text-zinc-500">საკონტაქტო საშუალებები</dt><dd className="mt-1 flex gap-1">{c.channels.map(x => <ChIcon key={x} id={x} />)}</dd></div>
                </dl>
                <button onClick={() => openModal({ type: 'confirm', id: l.id })} className={btn('primary', 'md', 'mt-5 w-full')}><Icon name="lock-open" className="h-4 w-4" />საკონტაქტოს მოთხოვნა</button>
                <p className="mt-2 text-xs text-zinc-500">ხელმისაწვდომია ვადის გასვლამდე: {fmtDate(l.sentAt + DAY)}</p>
              </>}
              {l.status === 'contact_requested' && <>
                <dl className="space-y-3 text-sm">
                  <Row k="სახელი, გვარი">{c.first} {c.last}</Row>
                  <div><dt className="text-xs text-zinc-500">პირადი ნომერი</dt><dd className="mt-0.5 flex items-center gap-2 font-mono text-[13px] font-medium">{c.pid}<CopyBtn text={c.pid} /></dd></div>
                  <div><dt className="text-xs text-zinc-500">ტელეფონი</dt><dd className="mt-0.5 flex items-center gap-2 font-medium">+995 {fmtPhone(c.phone)}<CopyBtn text={`+995${c.phone}`} /></dd></div>
                  <div><dt className="text-xs text-zinc-500">საკონტაქტო საშუალებები</dt><dd className="mt-1.5 space-y-1.5">
                    {c.channels.map(x => <div key={x} className="flex items-center gap-2"><ChIcon id={x} /><span>{chById(x).label}</span>{x === c.preferred && <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold"><Icon name="star" className="h-3.5 w-3.5 text-amber-400" />უპირატესი</span>}</div>)}
                  </dd></div>
                </dl>
                <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">ჯერ დაუკავშირდით: <b>{chById(c.preferred).label}</b></div>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500"><Icon name="bell" className="h-3.5 w-3.5" />კლიენტს ეცნობა, რომ ელოდოს თქვენს დაკავშირებას.</p>
              </>}
              {l.status === 'expired' && <>
                <div className="flex items-start gap-3 rounded-lg bg-zinc-50 p-4 text-sm text-zinc-600"><Icon name="lock" className="mt-0.5 h-4 w-4 shrink-0" />მოთხოვნას ვადა გაუვიდა — საკონტაქტო ინფორმაცია მიუწვდომელია.</div>
                <div className="mt-3 flex gap-1">{c.channels.map(x => <ChIcon key={x} id={x} />)}</div>
              </>}
            </div>
          </div>
          <div className={card('p-5')}>
            <h2 className="flex items-center gap-2 font-semibold"><Icon name="history" className="h-4 w-4" />ისტორია</h2>
            <ol className="mt-4 space-y-4">
              {ev.map((x, i) => (
                <li key={i} className={cn('flex gap-3', x.pending && 'text-zinc-400')}>
                  <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-full', x.pending ? 'border border-dashed border-zinc-300' : 'bg-zinc-100')}><Icon name={x.icon} className="h-3.5 w-3.5" /></span>
                  <div className="min-w-0 text-sm"><div className="font-medium">{x.text}</div><div className="text-xs text-zinc-500">{fmtDate(x.at)}</div>
                    {x.msg && <button onClick={() => openModal({ type: 'phone', id: l.id, msg: x.msg! })} className="mt-1 inline-flex items-center gap-1 text-xs font-medium underline underline-offset-2"><Icon name="smartphone" className="h-3.5 w-3.5" />შეტყობინების ნახვა</button>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
