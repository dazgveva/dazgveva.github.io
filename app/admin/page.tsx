'use client';
import { Icon } from '@/components/Icon';
import { AdminShell } from '@/components/Shells';
import { DAY, INSURERS, S, carName, fmtDate, fullName, go, leadsOf, now } from '@/lib/demo';
import { useDemo } from '@/lib/useDemo';
import { card } from '@/lib/ui';

export default function AdminOverviewPage() {
  return <AdminShell active="adm-overview"><Overview /></AdminShell>;
}

function Overview() {
  const S_ = useDemo();
  const t = now(), leads = S_.leads;
  const recent = S_.searches.filter(s => s.at > t - DAY).length;
  const rev = leads.filter(l => l.status === 'contact_requested').length, exp = leads.filter(l => l.status === 'expired').length;
  const kpi = (label: string, value: string | number, sub: string, icon: string) => (
    <div className={card('p-5')}>
      <div className="flex items-center justify-between text-sm text-zinc-500">{label}<Icon name={icon} className="h-4 w-4" /></div>
      <div className="mt-2 text-3xl font-bold tracking-tight">{value}</div><div className="mt-1 text-xs text-zinc-500">{sub}</div>
    </div>
  );
  const ev: { at: number; icon: string; text: string; sid: string }[] = [];
  S_.searches.forEach(s => {
    ev.push({ at: s.at, icon: 'gavel', text: `აუქციონი: ${fullName(s.client)} · ${carName(s.vehicle)}`, sid: s.id });
    leadsOf(s).forEach(l => {
      ev.push({ at: l.sentAt, icon: 'send', text: `მოთხოვნა გაეგზავნა: ${INSURERS[l.insurer].name}`, sid: s.id });
      if (l.revealedAt) ev.push({ at: l.revealedAt, icon: 'lock-open', text: `${INSURERS[l.insurer].name}: საკონტაქტო მოთხოვნილია`, sid: s.id });
      if (l.expiredAt) ev.push({ at: l.expiredAt, icon: 'clock', text: `${INSURERS[l.insurer].name}: ვადა გაუვიდა`, sid: s.id });
    });
  });
  ev.sort((a, b) => b.at - a.at);
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">მიმოხილვა</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpi('აუქციონები (24 სთ)', recent, `სულ: ${S_.searches.length}`, 'gavel')}
        {kpi('მოთხოვნები სადაზღვევოებთან', leads.length, `ახალი: ${leads.filter(l => l.status === 'new').length}`, 'send')}
        {kpi('საკონტაქტო მოთხოვნილია', leads.length ? Math.round(rev / leads.length * 100) + '%' : '—', `${rev} / ${leads.length}`, 'lock-open')}
        {kpi('ვადაგასული', exp, 'სადაზღვევომ 24 სთ-ში არ მოითხოვა', 'clock')}
      </div>
      <div className={card('mt-6')}>
        <h2 className="px-5 pt-5 font-semibold">ბოლო აქტივობა</h2>
        <ul className="mt-3 divide-y divide-zinc-100">
          {ev.slice(0, 10).map((x, i) => (
            <li key={i}>
              <button onClick={() => { S.searchId = x.sid; go('adm-request', { id: x.sid }); }} className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm hover:bg-zinc-50">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-zinc-100"><Icon name={x.icon} className="h-3.5 w-3.5" /></span>
                <span className="min-w-0 flex-1 truncate">{x.text}</span><span className="shrink-0 text-xs text-zinc-500">{fmtDate(x.at)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
