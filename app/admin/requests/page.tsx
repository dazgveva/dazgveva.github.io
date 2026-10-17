'use client';
import { CatBadge, DemoTag, InsAvatar } from '@/components/bits';
import { Icon } from '@/components/Icon';
import { AdminShell } from '@/components/Shells';
import { INSURERS, S, carName, dateOnly, emit, fmtDate, fullName, go, leadsOf, money, timeOnly } from '@/lib/demo';
import type { Lead, Search } from '@/lib/types';
import { useDemo } from '@/lib/useDemo';
import { STATUS, STATUS_DOT, card, cn } from '@/lib/ui';

const TABS: [string, string][] = [['all', 'ყველა'], ['new', 'ახალი'], ['contact_requested', 'საკონტაქტო მოთხოვნილია'], ['expired', 'ვადაგასული'], ['none', 'არ აირჩია']];

export default function AdminRequestsPage() {
  return <AdminShell active="adm-requests"><Requests /></AdminShell>;
}

function LeadChip({ l }: { l: Lead }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-zinc-200 px-2 py-0.5 text-xs">
      <InsAvatar id={l.insurer} size="h-4 w-4" />{INSURERS[l.insurer].name}<span className={cn('h-1.5 w-1.5 rounded-full', STATUS_DOT[l.status])} title={STATUS[l.status][0]} />
    </span>
  );
}

function Requests() {
  const S_ = useDemo();
  const f = S_.admFilter, insF = S_.admInsurer;
  const match = (s: Search) => {
    const ls = leadsOf(s);
    if (insF !== 'all' && !ls.some(l => l.insurer === insF)) return false;
    if (f === 'all') return true;
    if (f === 'none') return !ls.length;
    return ls.some(l => l.status === f);
  };
  const rows = [...S_.searches].sort((a, b) => b.at - a.at).filter(match);
  const chosen = (s: Search) => s.selected.length ? s.selected.map(c => <CatBadge key={c} id={c} />) : <span className="text-xs text-zinc-400">არ აირჩია</span>;
  const open = (s: Search) => { S.searchId = s.id; go('adm-request', { id: s.id }); };
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">მოთხოვნები</h1>
      <p className="mt-1 text-sm text-zinc-500">თითო ხაზი — კლიენტის ერთი ძიება (აუქციონი) და მისი მოთხოვნები სადაზღვევოებთან.</p>
      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex gap-1 overflow-x-auto rounded-lg bg-zinc-100 p-1 text-sm">
          {TABS.map(([id, label]) => <button key={id} onClick={() => { S.admFilter = id; emit(); }} className={cn('shrink-0 rounded-md px-3 py-1.5', f === id ? 'bg-white font-medium shadow-xs' : 'text-zinc-600 hover:text-zinc-900')}>{label}</button>)}
        </div>
        <select value={insF} onChange={e => { S.admInsurer = e.target.value; emit(); }} className="h-9 rounded-md border border-zinc-200 bg-white px-2 text-sm lg:ml-auto">
          <option value="all">ყველა სადაზღვევო</option>{Object.keys(S_.meta).map(id => <option key={id} value={id}>{INSURERS[id].name}</option>)}
        </select>
      </div>
      {!rows.length ? <div className={card('mt-4 p-10 text-center text-sm text-zinc-500')}>ამ ფილტრით ძიება არ მოიძებნა.</div> : (
        <>
          <div className={card('mt-4 hidden overflow-x-auto xl:block')}>
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-200 text-left text-xs text-zinc-500"><tr><th className="px-3 py-3 font-medium">დრო</th><th className="px-3 py-3 font-medium">კლიენტი</th><th className="px-3 py-3 font-medium">ავტომობილი</th><th className="px-3 py-3 font-medium">არჩეული პაკეტები</th><th className="px-3 py-3 font-medium">მოთხოვნები სადაზღვევოებთან</th><th className="px-3 py-3" /></tr></thead>
              <tbody className="divide-y divide-zinc-100">
                {rows.map(s => (
                  <tr key={s.id} onClick={() => open(s)} className={cn('cursor-pointer hover:bg-zinc-50', s.fromClient && 'bg-amber-50/40')}>
                    <td className="whitespace-nowrap px-3 py-3"><div>{dateOnly(s.at)}</div><div className="text-xs text-zinc-400">{timeOnly(s.at)} · {s.id}</div></td>
                    <td className="px-3 py-3"><div className="font-medium">{fullName(s.client)}</div>{s.fromClient && <DemoTag />}</td>
                    <td className="px-3 py-3"><div>{s.vehicle.make} {s.vehicle.model}</div><div className="text-xs text-zinc-400">{s.vehicle.year} · ≈ {money(s.vehicle.value)}</div></td>
                    <td className="px-3 py-3"><div className="flex flex-wrap gap-1">{chosen(s)}</div></td>
                    <td className="px-3 py-3"><div className="flex flex-wrap gap-1">{leadsOf(s).length ? leadsOf(s).map(l => <LeadChip key={l.id} l={l} />) : <span className="text-xs text-zinc-400">—</span>}</div></td>
                    <td className="px-3 py-3"><Icon name="chevron-right" className="h-4 w-4 text-zinc-400" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 space-y-3 xl:hidden">
            {rows.map(s => (
              <div key={s.id} onClick={() => open(s)} className={card(cn('cursor-pointer p-4', s.fromClient && 'border-amber-200'))}>
                <div className="flex items-start justify-between gap-2"><div><div className="font-semibold">{fullName(s.client)}</div><div className="text-xs text-zinc-500">{fmtDate(s.at)} · {s.id}</div></div><Icon name="chevron-right" className="h-4 w-4 text-zinc-400" /></div>
                <div className="mt-2 text-sm">{carName(s.vehicle)}</div>
                <div className="mt-2 flex flex-wrap gap-1">{chosen(s)}</div>
                <div className="mt-2 flex flex-wrap gap-1">{leadsOf(s).map(l => <LeadChip key={l.id} l={l} />)}</div>
              </div>
            ))}
          </div>
        </>
      )}
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
        {(Object.keys(STATUS) as Lead['status'][]).map(k => <span key={k} className="inline-flex items-center gap-1.5"><span className={cn('h-1.5 w-1.5 rounded-full', STATUS_DOT[k])} />{STATUS[k][0]}</span>)}
      </p>
    </>
  );
}
