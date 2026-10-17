'use client';
import { Json } from '@/components/bits';
import { PartnerShell } from '@/components/Shells';
import { AGENT_TIMEOUT_MS, CLIENT_VEHICLE, fmtDate, num } from '@/lib/demo';
import { useDemo } from '@/lib/useDemo';
import { badge, card } from '@/lib/ui';

export default function PartnerApiPage() {
  return <PartnerShell active="ins-api"><Api /></PartnerShell>;
}

function Api() {
  const S_ = useDemo();
  const calls = S_.calls.filter(c => c.insurer === S_.insurer).sort((a, b) => b.at - a.at).slice(0, 10);
  const { value, ...veh } = CLIENT_VEHICLE;
  const reqJson = { request_id: 'a3f1…', product: 'casco', categories: ['max', 'limited', 'cheap'],
    vehicle: { vin: veh.vin, make: veh.make, model: veh.model, year: veh.year, body: 'sedan', engine_cc: 2500, fuel: 'petrol', color: 'white' },
    market_value_gel: value, insured_value_gel: value, respond_within_ms: AGENT_TIMEOUT_MS };
  const resJson = { offers: [{ category: 'max', annual_premium_gel: 2640, sum_insured_gel: 52000, deductible_gel: 300, coverage: ['collision', 'theft', 'natural_disaster', 'glass', 'towing'] }],
    declines: [{ category: 'cheap', reason: 'not_offered' }] };
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">API ინტეგრაცია</h1>
      <p className="mt-1 text-sm text-zinc-500">ასე უკავშირდება dazgveva.ge-ს AI აგენტი თქვენს AI აგენტს აუქციონის დროს.</p>
      <div className={card('mt-6 p-5')}>
        <div className="flex items-center justify-between"><h2 className="font-semibold">კავშირის პარამეტრები</h2><span className={badge('bg-emerald-50 font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200')}>აქტიური</span></div>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="text-xs text-zinc-500">AI აგენტის API მისამართი</dt><dd className="mt-0.5 break-all font-mono text-[13px]">https://agent.{S_.insurer}.example/dazgveva/v1/quote</dd></div>
          <div><dt className="text-xs text-zinc-500">ავთენტიფიკაციის მეთოდი</dt><dd className="mt-0.5 font-medium">API გასაღები (Bearer) · HTTPS</dd></div>
          <div><dt className="text-xs text-zinc-500">გასაღები</dt><dd className="mt-0.5 font-mono text-[13px]">dzg_demo_••••••••{S_.insurer.slice(0, 4)}</dd></div>
          <div><dt className="text-xs text-zinc-500">პასუხის ლოდინის დრო</dt><dd className="mt-0.5 font-medium">8 წამი</dd></div>
        </dl>
        <p className="mt-4 text-xs text-zinc-500">პარამეტრებს ცვლის dazgveva.ge-ს ადმინისტრატორი. ჩვენ არასოდეს ვაგზავნით კლიენტის სახელს, პირად ნომერს, ტელეფონს ან სახელმწიფო ნომერს.</p>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className={card('p-5')}><h2 className="font-semibold">მოთხოვნა (ჩვენგან)</h2><Json value={reqJson} className="mt-3" /></div>
        <div className={card('p-5')}><h2 className="font-semibold">პასუხი (თქვენგან)</h2><p className="mt-1 text-xs text-zinc-500">თითო კატეგორიაში მაქსიმუმ ერთი შეთავაზება ან უარი მიზეზით.</p><Json value={resJson} className="mt-3" /></div>
      </div>
      <div className={card('mt-6 overflow-x-auto')}>
        <h2 className="px-5 pt-5 font-semibold">ბოლო გამოძახებები</h2>
        <table className="mt-3 w-full text-sm">
          <thead className="border-y border-zinc-200 text-left text-xs text-zinc-500"><tr><th className="px-5 py-2.5 font-medium">დრო</th><th className="px-5 py-2.5 font-medium">აუქციონი</th><th className="px-5 py-2.5 font-medium">HTTP</th><th className="px-5 py-2.5 font-medium">დაყოვნება</th><th className="px-5 py-2.5 font-medium">შედეგი</th></tr></thead>
          <tbody className="divide-y divide-zinc-100">
            {calls.map((c, i) => (
              <tr key={i}>
                <td className="whitespace-nowrap px-5 py-2.5 text-zinc-600">{fmtDate(c.at)}</td><td className="px-5 py-2.5 font-mono text-xs">{c.req}</td>
                <td className="px-5 py-2.5">{c.timeout ? <span className="font-medium text-amber-600">—</span> : <span className="font-medium text-emerald-700">200</span>}</td>
                <td className="whitespace-nowrap px-5 py-2.5">{c.timeout ? '> 8 000 მწმ' : `${num(c.latency)} მწმ`}</td>
                <td className="whitespace-nowrap px-5 py-2.5">{c.timeout ? <span className="text-amber-700">დრო ამოიწურა</span> : `${c.offers} შეთავაზება${c.declines ? ` · ${c.declines} უარი` : ''}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
