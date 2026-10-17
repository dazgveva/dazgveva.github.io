'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { CatBadge, DemoTag, InsAvatar, Json, PkgBadges, Row, StatusBadge } from '@/components/bits';
import { Icon } from '@/components/Icon';
import { AdminShell } from '@/components/Shells';
import {
  CATS, DAY, DECLINE, INSURERS, S, SENT_AT, agentRequest, agentResponse, carName, chById, fmtDate, fmtPhone, fullName,
  leadsOf, logText, money, msgChannel, openModal, searchById,
} from '@/lib/demo';
import type { AgentReply, CatId, LogLine, Search } from '@/lib/types';
import { useDemo } from '@/lib/useDemo';
import { btn, card, cn } from '@/lib/ui';

const LOGI: Record<LogLine['kind'], [string, string]> = { ok: ['circle-check', 'text-emerald-600'], info: ['send', 'text-zinc-500'], timeout: ['clock', 'text-amber-600'], warn: ['circle-x', 'text-rose-600'], spin: ['circle-check', 'text-emerald-600'], done: ['sparkles', 'text-zinc-900'] };

export default function AdminRequestPage() {
  return <AdminShell active="adm-requests"><Suspense><Detail /></Suspense></AdminShell>;
}

function OfferCell({ s, r, cat }: { s: Search; r: AgentReply; cat: CatId }) {
  if (r.timeout) return <span className="text-xs text-zinc-400">—</span>;
  const o = r.offers?.[cat], d = r.declines?.[cat];
  if (d) return <span className="text-xs text-rose-600">უარი: {DECLINE[d]}</span>;
  if (!o) return <span className="text-xs text-zinc-400">—</span>;
  const win = s.results[cat]?.insurer === r.id;
  return (
    <div className={cn(win && 'rounded-md bg-emerald-50 px-2 py-1 ring-1 ring-emerald-300')}>
      <div className="font-semibold">{money(o.premium)}</div><div className="text-xs text-zinc-500">ფრანშიზა {money(o.deductible)}</div>
      {win && <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700"><Icon name="sparkles" className="h-3 w-3" />AI არჩევანი</div>}
    </div>
  );
}

function Detail() {
  const S_ = useDemo();
  const router = useRouter();
  const id = useSearchParams().get('id') || S_.searchId;
  const s = searchById(id);
  useEffect(() => { if (!s) router.replace('/admin/requests/'); else S.searchId = s.id; }, [s, router]);
  if (!s) return null;
  const c = s.client, v = s.vehicle, ls = leadsOf(s);
  return (
    <>
      <Link href="/admin/requests/" className={btn('ghost', 'sm', '-ml-3 text-zinc-600')}><Icon name="arrow-left" className="h-4 w-4" />მოთხოვნები</Link>
      <div className="mt-2 flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold tracking-tight">{fullName(c)}</h1>{s.fromClient && <DemoTag className="text-[11px]" />}</div>
      <p className="mt-1 text-sm text-zinc-500">ძიება {s.id} · {fmtDate(s.at)} · {carName(v)}</p>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className={card('p-5')}>
          <h2 className="flex items-center gap-2 font-semibold"><Icon name="user" className="h-4 w-4" />კლიენტი</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <Row k="სახელი, გვარი">{fullName(c)}</Row><Row k="პირადი ნომერი" mono>{c.pid}</Row>
            <div className="col-span-2"><Row k="მისამართი">{c.address || '—'}</Row></div>
            <Row k="ტელეფონი">+995 {fmtPhone(c.phone)}</Row>
            <div><dt className="text-xs text-zinc-500">არხები</dt><dd className="mt-1 flex flex-wrap items-center gap-1">
              {c.channels.map(x => <span key={x} className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-1.5 py-0.5 text-xs">{chById(x).label}{x === c.preferred && <Icon name="star" className="h-3 w-3 text-amber-400" />}</span>)}
            </dd></div>
          </dl>
          <p className="mt-4 text-xs text-zinc-500">მისამართი სადაზღვევოებს არასოდეს გადაეცემა.{s.consentAt ? ` თანხმობა მონაცემების გაზიარებაზე: ${fmtDate(s.consentAt)}.` : ''}</p>
        </div>
        <div className={card('p-5')}>
          <h2 className="flex items-center gap-2 font-semibold"><Icon name="scan-line" className="h-4 w-4" />ტექპასპორტის მონაცემები (OCR)</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <Row k="მარკა, მოდელი">{v.make} {v.model}</Row><Row k="წელი">{v.year}</Row><Row k="VIN" mono>{v.vin}</Row><Row k="სახელმწიფო ნომერი" mono>{v.plate}</Row>
            <Row k="ფერი">{v.color}</Row><Row k="ძარა">{v.body}</Row><Row k="ძრავა">{v.engine}</Row><Row k="საწვავი">{v.fuel}</Row>
          </dl>
        </div>
        <div className={card('p-5')}>
          <h2 className="flex items-center gap-2 font-semibold"><Icon name="sparkles" className="h-4 w-4" />ღირებულება</h2>
          <div className="mt-4 text-3xl font-bold tracking-tight">{money(v.value)}</div>
          <p className="mt-1 text-sm text-zinc-500">{v.aiValue && v.aiValue !== v.value
            ? `კლიენტმა შეცვალა. AI-ის შეფასება: ${money(v.aiValue)} (სხვაობა: ${v.value > v.aiValue ? '+' : ''}${Math.round((v.value - v.aiValue) / v.aiValue * 100)}%)`
            : 'კლიენტმა დაადასტურა AI-ის საბაზრო შეფასება.'}</p>
          <div className="mt-4 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600">აუქციონზე გადაეცა: VIN, მარკა, მოდელი, წელი, ძარა, ძრავა, საწვავი, ფერი. <b>არ გადაეცა:</b> სახელმწიფო ნომერი და პირადი მონაცემები.</div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <div className={card('p-5')}>
          <h2 className="flex items-center gap-2 font-semibold"><Icon name="scroll-text" className="h-4 w-4" />აუქციონის ლოგი</h2>
          <ol className="mt-3 divide-y divide-zinc-100">
            {s.log.map((x, i) => (
              <li key={i} className="flex items-start gap-3 py-2 text-sm">
                <span className="w-12 shrink-0 pt-0.5 text-right font-mono text-xs text-zinc-400">{x.t.toFixed(1)} წმ</span>
                <Icon name={LOGI[x.kind][0]} className={cn('mt-0.5 h-4 w-4 shrink-0', LOGI[x.kind][1])} />
                <span className={cn(x.kind === 'done' && 'font-semibold')}>{logText(x).replace('…', '')}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className={card('overflow-x-auto p-5')}>
          <h2 className="flex items-center gap-2 font-semibold"><Icon name="table-2" className="h-4 w-4" />ყველა შეთავაზება</h2>
          <table className="mt-3 w-full text-sm">
            <thead className="border-b border-zinc-200 text-left text-xs text-zinc-500"><tr><th className="py-2 pr-3 font-medium">სადაზღვევო</th>{CATS.map(ct => <th key={ct.id} className="px-2 py-2 font-medium"><CatBadge id={ct.id} /></th>)}</tr></thead>
            <tbody className="divide-y divide-zinc-100">
              {s.ds.map(r => (
                <tr key={r.id}>
                  <td className="py-2.5 pr-3"><div className="flex items-center gap-2"><InsAvatar id={r.id} size="h-6 w-6" /><div><div className="font-medium">{INSURERS[r.id].name}</div><div className={cn('text-xs', r.timeout ? 'text-amber-600' : 'text-zinc-500')}>{r.timeout ? 'დრო ამოიწურა' : `${r.t!.toFixed(1)} წმ`}</div></div></div></td>
                  {CATS.map(ct => <td key={ct.id} className="px-2 py-2.5 align-top"><OfferCell s={s} r={r} cat={ct.id} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 space-y-1.5 text-xs text-zinc-600">
            {CATS.map(ct => <div key={ct.id}><CatBadge id={ct.id} className="mr-1" />{s.results[ct.id] ? `${INSURERS[s.results[ct.id]!.insurer].name} — ${s.results[ct.id]!.why}` : 'შეთავაზება ვერ მოიძებნა'}</div>)}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className={card('p-5')}>
          <h2 className="flex items-center gap-2 font-semibold"><Icon name="braces" className="h-4 w-4" />აგენტებთან კომუნიკაცია (HTTP)</h2>
          <p className="mt-1 text-xs text-zinc-500">POST · Content-Type: application/json · ყველა აგენტს ერთი და იგივე მოთხოვნა ეგზავნება.</p>
          <div className="mt-3 space-y-2">
            {s.ds.map(r => (
              <details key={r.id} className="group rounded-lg border border-zinc-200">
                <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-sm [&::-webkit-details-marker]:hidden">
                  <InsAvatar id={r.id} size="h-6 w-6" /><span className="font-medium">{INSURERS[r.id].name}</span>
                  <span className={cn('ml-auto text-xs', r.timeout ? 'text-amber-600' : 'text-emerald-700')}>{r.timeout ? 'დრო ამოიწურა · > 8 000 მწმ' : `200 OK · ${Math.round((r.t! - SENT_AT) * 1000)} მწმ`}</span>
                  <Icon name="chevron-down" className="h-4 w-4 text-zinc-400 transition group-open:rotate-180" />
                </summary>
                <div className="grid gap-3 border-t border-zinc-200 p-3 lg:grid-cols-2">
                  <div><div className="text-xs font-medium text-zinc-500">მოთხოვნა → {S_.meta[r.id] ? S_.meta[r.id].endpoint : '—'}</div><Json value={agentRequest(s)} className="mt-2 max-h-72 overflow-auto p-3 text-[11px]" /></div>
                  <div><div className="text-xs font-medium text-zinc-500">პასუხი</div>
                    {r.timeout ? <div className="mt-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">პასუხი 8 000 მწმ-ში არ მოვიდა. აგენტი ამ აუქციონიდან გამოირიცხა.</div> : <Json value={agentResponse(r)} className="mt-2 max-h-72 overflow-auto p-3 text-[11px]" />}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
        <div className={card('p-5')}>
          <h2 className="flex items-center gap-2 font-semibold"><Icon name="send" className="h-4 w-4" />მოთხოვნები სადაზღვევოებთან</h2>
          {!ls.length ? <p className="mt-4 text-sm text-zinc-500">კლიენტს შეთავაზება არ აურჩევია.</p> : (
            <div className="mt-4 space-y-4">
              {ls.map(l => {
                const ev: { at: number; text: string; msg?: 'reveal' | 'expiry'; pending?: boolean }[] = [{ at: l.sentAt, text: 'გაიგზავნა' }];
                if (l.revealedAt) ev.push({ at: l.revealedAt, text: 'საკონტაქტო მოთხოვნილია' });
                if (l.expiredAt) ev.push({ at: l.expiredAt, text: 'ვადა გაუვიდა' });
                l.messages.forEach(m => ev.push({ at: m.at + 1000, text: `კლიენტს გაეგზავნა შეტყობინება · ${msgChannel(l)}`, msg: m.type }));
                if (l.status === 'new') ev.push({ at: l.sentAt + DAY, text: 'ვადის გასვლა', pending: true });
                ev.sort((a, b) => a.at - b.at);
                return (
                  <div key={l.id} className="rounded-lg border border-zinc-200 p-4">
                    <div className="flex flex-wrap items-center gap-2"><InsAvatar id={l.insurer} /><span className="font-semibold">{INSURERS[l.insurer].name}</span><span className="ml-auto"><StatusBadge s={l.status} /></span></div>
                    <div className="mt-2 flex flex-wrap gap-1"><PkgBadges l={l} /><span className="text-xs text-zinc-500">{l.id}</span></div>
                    <ol className="mt-3 space-y-1.5 border-l border-zinc-200 pl-3 text-sm">
                      {ev.map((x, i) => (
                        <li key={i} className={cn(x.pending && 'text-zinc-400')}>
                          <span className="text-xs text-zinc-500">{fmtDate(x.at)}</span> — {x.text}
                          {x.msg && <> <button onClick={() => openModal({ type: 'phone', id: l.id, msg: x.msg! })} className="text-xs font-medium underline underline-offset-2">ნახვა</button></>}
                        </li>
                      ))}
                    </ol>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
