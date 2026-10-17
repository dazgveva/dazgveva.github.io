'use client';
import { ChIcon, Countdown, DemoTag, PkgBadges, StatusBadge, StatusDot } from '@/components/bits';
import { Icon } from '@/components/Icon';
import { PartnerShell } from '@/components/Shells';
import { S, carName, dateOnly, emit, fmtDate, go, initials, openModal, timeOnly } from '@/lib/demo';
import type { Lead } from '@/lib/types';
import { useDemo } from '@/lib/useDemo';
import { btn, card, cn } from '@/lib/ui';

const TABS: [string, string][] = [['all', 'ყველა'], ['new', 'ახალი'], ['contact_requested', 'საკონტაქტო მოთხოვნილია'], ['expired', 'ვადაგასული']];

export default function PartnerRequestsPage() {
  return <PartnerShell active="ins-list"><Requests /></PartnerShell>;
}

function Requests() {
  const S_ = useDemo();
  const mine = S_.leads.filter(l => l.insurer === S_.insurer).sort((a, b) => b.sentAt - a.sentAt);
  const count = (id: string) => id === 'all' ? mine.length : mine.filter(l => l.status === id).length;
  const rows = S_.filter === 'all' ? mine : mine.filter(l => l.status === S_.filter);
  const open = (l: Lead) => { S.leadId = l.id; go('ins-detail', { id: l.id }); };
  const reveal = (l: Lead, full?: boolean) => (
    <button onClick={e => { e.stopPropagation(); openModal({ type: 'confirm', id: l.id }); }} className={btn('primary', 'sm', full && 'w-full')}>
      <Icon name="lock-open" className="h-3.5 w-3.5" />საკონტაქტოს მოთხოვნა
    </button>
  );
  return (
    <>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">მოთხოვნები</h1><p className="mt-1 text-sm text-zinc-500">კლიენტებმა თქვენი შეთავაზება აირჩიეს. საკონტაქტო ინფორმაციის მოთხოვნა შეგიძლიათ 24 საათის განმავლობაში.</p></div>
      </div>
      <div className="mt-5 flex gap-1 overflow-x-auto rounded-lg bg-zinc-100 p-1 text-sm" role="tablist">
        {TABS.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={S_.filter === id} onClick={() => { S.filter = id; emit(); }}
            className={cn('shrink-0 rounded-md px-3 py-1.5', S_.filter === id ? 'bg-white font-medium shadow-xs' : 'text-zinc-600 hover:text-zinc-900')}>{label} <span className="text-zinc-400">{count(id)}</span></button>
        ))}
      </div>
      {!rows.length ? <div className={card('mt-4 p-10 text-center text-sm text-zinc-500')}>ამ ფილტრით მოთხოვნა არ არის.</div> : (
        <>
          <div className={card('mt-4 hidden overflow-x-auto xl:block')}>
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-200 text-left text-xs text-zinc-500"><tr>
                <th className="px-3 py-3 font-medium">გაგზავნის დრო</th><th className="px-3 py-3 font-medium">კლიენტი</th><th className="px-3 py-3 font-medium">ავტომობილი</th>
                <th className="px-3 py-3 font-medium">პაკეტები</th><th className="px-3 py-3 font-medium">საკონტაქტო საშუალებები</th><th className="px-3 py-3 font-medium">დარჩენილი დრო</th>
                <th className="px-3 py-3 font-medium">სტატუსი</th><th className="px-3 py-3" /></tr></thead>
              <tbody className="divide-y divide-zinc-100">
                {rows.map(l => (
                  <tr key={l.id} onClick={() => open(l)} className={cn('cursor-pointer hover:bg-zinc-50', l.fromClient && 'bg-amber-50/40')}>
                    <td className="whitespace-nowrap px-3 py-3"><div>{dateOnly(l.sentAt)}</div><div className="text-xs text-zinc-400">{timeOnly(l.sentAt)}</div></td>
                    <td className="px-3 py-3"><div className="font-semibold">{initials(l.client)}</div>{l.fromClient && <DemoTag />}</td>
                    <td className="px-3 py-3"><div>{l.vehicle.make} {l.vehicle.model}</div><div className="text-xs text-zinc-400">{l.vehicle.year}</div></td>
                    <td className="px-3 py-3"><div className="flex flex-wrap gap-1"><PkgBadges l={l} /></div></td>
                    <td className="px-3 py-3"><div className="flex gap-1">{l.client.channels.map(c => <ChIcon key={c} id={c} />)}</div></td>
                    <td className="px-3 py-3"><Countdown l={l} /></td>
                    <td className="px-3 py-3"><StatusDot s={l.status} /></td>
                    <td className="px-3 py-3 text-right">{l.status === 'new' ? reveal(l) : <Icon name="chevron-right" className="ml-auto h-4 w-4 text-zinc-400" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 space-y-3 xl:hidden">
            {rows.map(l => (
              <div key={l.id} onClick={() => open(l)} className={card(cn('cursor-pointer p-4', l.fromClient && 'border-amber-200'))}>
                <div className="flex items-start justify-between gap-2"><div><div className="font-semibold">{initials(l.client)}{l.fromClient && <DemoTag className="ml-1" />}</div><div className="text-xs text-zinc-500">{fmtDate(l.sentAt)}</div></div><StatusBadge s={l.status} /></div>
                <div className="mt-2 text-sm">{carName(l.vehicle)}</div>
                <div className="mt-2 flex flex-wrap items-center gap-1"><PkgBadges l={l} /></div>
                <div className="mt-3 flex items-center justify-between gap-2"><div className="flex gap-1">{l.client.channels.map(c => <ChIcon key={c} id={c} />)}</div><div className="text-xs text-zinc-500">{l.status === 'new' ? 'დარჩა: ' : ''}<Countdown l={l} /></div></div>
                {l.status === 'new' && <div className="mt-3">{reveal(l, true)}</div>}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
