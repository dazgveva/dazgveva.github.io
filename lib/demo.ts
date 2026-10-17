/* dazgveva.ge V3 demo — all demo data and logic (no UI). Ported 1:1 from the single-file
   prototype: a mutable state object S, plain functions that change it, and emit() to tell
   React to re-render (see lib/useDemo.ts). Everything runs in the browser only. */
import type {
  AgentReply, AuthId, CatId, ChannelId, Call, Client, CovId, InsurerForm, Lead, LogLine, Meta, Modal,
  ModeId, Offer, Package, Results, Search, Side, Toast, Upload, User, Vehicle, Insurer, DeclineReason,
} from './types';

/* ============================== DATA ============================== */
export const INSURERS: Record<string, Insurer> = {
  kolkheti:  { name: 'კოლხეთი ჯგუფი',    color: '#047857', icon: 'sun' },           // Colchis, land of the Golden Fleece
  iberia:    { name: 'იბერია დაზღვევა',  color: '#1d4ed8', icon: 'castle' },        // the ancient kingdom
  mtkvari:   { name: 'მტკვარი დაზღვევა', color: '#0e7490', icon: 'waves' },         // the river
  kazbegi:   { name: 'ყაზბეგი დაზღვევა', color: '#b45309', icon: 'mountain-snow' }, // the mountain
  argonauti: { name: 'არგონავტი',         color: '#7c3aed', icon: 'sailboat' },      // the Argonauts' ship
};
export const CATS: { id: CatId; label: string; short: string; icon: string; hint: string }[] = [
  { id: 'max',     label: 'მაქსიმალური დაფარვა', short: 'მაქს',          icon: 'infinity',   hint: 'სრული დაფარვა · დაბალი ფრანშიზა' },                  // no limits: everything covered
  { id: 'limited', label: 'ლიმიტირებული დაფარვა', short: 'ლიმიტირებული', icon: 'scale',      hint: 'ძირითადი რისკები · ბალანსი ფასსა და დაცვას შორის' }, // balance of price and protection
  { id: 'cheap',   label: 'იაფი შეთავაზება',      short: 'იაფი',          icon: 'piggy-bank', hint: 'მინიმალური დაფარვა · ყველაზე დაბალი ფასი' },        // lowest price
];
export const COVERAGE: [CovId, string][] = [['collision', 'ავარია'], ['theft', 'ქურდობა'], ['nature', 'სტიქია'], ['glass', 'მინები'], ['towing', 'ევაკუატორი']];
const FULL: CovId[] = COVERAGE.map(c => c[0]);
export const DECLINE: Record<DeclineReason, string> = { not_offered: 'არ სთავაზობს', manual_underwriting: 'საჭიროებს ინდივიდუალურ შეფასებას' };
export const CHANNELS: { id: ChannelId; label: string; icon: string; color: string }[] = [
  { id: 'call',     label: 'სატელეფონო ზარი', icon: 'phone',          color: '#18181b' },
  { id: 'whatsapp', label: 'WhatsApp',        icon: 'message-circle', color: '#16a34a' },
  { id: 'viber',    label: 'Viber',           icon: 'phone-call',     color: '#7c3aed' },
  { id: 'telegram', label: 'Telegram',        icon: 'send',           color: '#0284c7' },
];
export const VEHICLE = { make: 'Toyota', model: 'Camry', year: 2018, value: 52000 };
export const SENT_AT = 1.5;                                  // s: requests go out to the agents
export const AGENT_TIMEOUT_MS = 8000;                        // each agent has 8 s to answer
export const TIMEOUT_AT = SENT_AT + AGENT_TIMEOUT_MS / 1000; // 9.5 s
const o = (premium: number, deductible: number, cov: CovId[]): Offer => ({ premium, deductible, sum: VEHICLE.value, cov });
const BASIC: CovId[] = ['collision', 'theft'];
const CORE: CovId[] = ['collision', 'theft', 'nature'];

/* Insurer agent responses per demo mode. t = seconds after the auction start. */
const DATASETS: Record<ModeId, AgentReply[]> = {
  normal: [
    { id: 'kolkheti', t: 3.6, offers: { max: o(2640, 300, FULL), limited: o(1890, 500, [...CORE, 'glass']), cheap: o(1240, 1000, BASIC) } },
    { id: 'iberia',   t: 4.7, offers: { limited: o(1980, 500, CORE), cheap: o(980, 1000, BASIC) }, declines: { max: 'not_offered' } },
    { id: 'mtkvari',  t: 6.0, offers: { max: o(2790, 300, FULL), limited: o(1720, 500, CORE), cheap: o(1090, 1200, BASIC) } },
    { id: 'kazbegi',  t: 7.8, offers: { cheap: o(1060, 800, BASIC) }, declines: { max: 'manual_underwriting', limited: 'not_offered' } },
    { id: 'argonauti', timeout: true },
  ],
  surprises: [
    { id: 'kolkheti', t: 3.3, offers: { max: o(2640, 300, FULL), cheap: o(1240, 1000, BASIC) }, declines: { limited: 'not_offered' } },
    { id: 'iberia',   t: 5.1, offers: { cheap: o(980, 1000, BASIC) }, declines: { max: 'not_offered', limited: 'not_offered' } },
    { id: 'kazbegi',  t: 6.9, offers: { cheap: o(1060, 800, BASIC) }, declines: { max: 'manual_underwriting', limited: 'not_offered' } },
    { id: 'mtkvari',  timeout: true },
    { id: 'argonauti', timeout: true },
  ],
  same: [
    { id: 'kolkheti', t: 3.6, offers: { max: o(2640, 300, FULL), limited: o(1650, 500, CORE), cheap: o(1240, 1000, BASIC) } },
    { id: 'iberia',   t: 4.7, offers: { limited: o(1980, 500, CORE), cheap: o(980, 1000, BASIC) }, declines: { max: 'not_offered' } },
    { id: 'mtkvari',  t: 6.0, offers: { max: o(2790, 300, FULL), limited: o(1720, 500, CORE), cheap: o(1090, 1200, BASIC) } },
    { id: 'kazbegi',  t: 7.8, offers: { cheap: o(1060, 800, BASIC) }, declines: { max: 'manual_underwriting', limited: 'not_offered' } },
    { id: 'argonauti', timeout: true },
  ],
};
export const MODES: { id: ModeId; label: string }[] = [
  { id: 'normal',    label: 'ჩვეულებრივი' },
  { id: 'surprises', label: 'მოულოდნელობებით' },
  { id: 'same',      label: 'ერთი სადაზღვევო, ორი პაკეტი' },
];

/* ============================== STATE + STORE ============================== */
export const S = {
  ready: false,
  front: null as Upload | null, back: null as Upload | null, uploadError: null as string | null,
  processing: false, scanError: false, failScan: false,
  phone: '', phoneTouched: false, channels: [] as ChannelId[], preferred: null as ChannelId | null,
  mode: 'normal' as ModeId, results: null as Results | null, selected: new Set<CatId>(),
  aiValue: null as number | null, value: null as number | null, valueMode: 'ai' as 'ai' | 'own', valuating: 0,
  pendingAuction: false,
  navOpen: false,
  insurer: 'kolkheti', leadId: null as string | null, filter: 'all', modal: null as Modal | null, offset: 0,
  leads: [] as Lead[], calls: [] as Call[], lastSent: [] as string[],
  meta: {} as Record<string, Meta>, users: [] as User[], searches: [] as Search[], searchId: null as string | null,
  admFilter: 'all', admInsurer: 'all', insTab: 'active' as 'active' | 'archived', editIns: null as string | null, form: null as InsurerForm | null,
  session: null as { username: string } | null,
  loggingOut: false, // set by logout() so portal guards don't redirect to /login on the way home
  login: { u: '', p: '', error: null as string | null, hint: null as { u: string; p: string } | null },
  pw: {} as { a?: string; b?: string },
  toasts: [] as Toast[],
};

let version = 0;
const listeners = new Set<() => void>();
/** Notify React that S changed. */
export function emit() { version++; listeners.forEach(l => l()); }
export const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const getVersion = () => version;

/* ---------- navigation (the router is registered by DemoProvider) ---------- */
export const PATHS = {
  home: '/', value: '/value/', contact: '/contact/', auction: '/auction/', offers: '/offers/', done: '/done/',
  login: '/login/', pwchange: '/password/',
  'ins-list': '/partner/', 'ins-detail': '/partner/request/', 'ins-api': '/partner/api/', 'ins-profile': '/partner/profile/',
  'adm-overview': '/admin/', 'adm-requests': '/admin/requests/', 'adm-request': '/admin/request/',
  'adm-insurers': '/admin/insurers/', 'adm-ins-form': '/admin/insurers/edit/', 'adm-users': '/admin/users/',
} as const;
export type Screen = keyof typeof PATHS;
let navigate: (path: string) => void = () => {};
export const setNavigator = (fn: (path: string) => void) => { navigate = fn; };
export function go(screen: Screen, query?: Record<string, string>) {
  if (screen === 'auction') S.pendingAuction = true;
  navigate(PATHS[screen] + (query ? '?' + new URLSearchParams(query) : ''));
  emit();
}

/* ---------- toasts & modals ---------- */
let toastSeq = 0;
export function toast(text: string, icon = 'info', action?: Toast['action']) {
  const t: Toast = { id: ++toastSeq, text, icon, action };
  S.toasts = [...S.toasts, t]; emit();
  setTimeout(() => { S.toasts = S.toasts.filter(x => x.id !== t.id); emit(); }, action ? 7000 : 4200);
}
export const openModal = (m: Modal) => { S.modal = m; emit(); };
export const closeModal = () => { S.modal = null; emit(); };

/* ============================== HELPERS ============================== */
export const money = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₾';
export const num = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
export const catById = (id: CatId) => CATS.find(c => c.id === id)!;
export const chById = (id: ChannelId) => CHANNELS.find(c => c.id === id)!;
export const fmtPhone = (d: string) => [d.slice(0, 3), d.slice(3, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(' ');
export const phoneValid = () => /^5\d{8}$/.test(S.phone);

/* Sample tech-passport images (SVG) so the demo works without real photos */
export function sampleCard(side: Side): Upload {
  const rows = side === 'front'
    ? [['A', 'AA-123-BB'], ['E', '4T1B11HK5JU000000'], ['D.1', 'TOYOTA'], ['D.3', 'CAMRY'], ['B', '2018'], ['R', 'თეთრი / WHITE']]
    : [['C.1.1', 'ბერიძე / BERIDZE'], ['C.1.2', 'გიორგი / GIORGI'], ['პ/ნ', '01001012345'], ['C.1.3', 'თბილისი, ნიმუშის ქ. 1'], ['P.1', '2494 სმ³'], ['P.3', 'ბენზინი / PETROL']];
  const lines = rows.map((r, i) => `<text x="60" y="${200 + i * 50}" font-size="22" fill="#52525b" font-family="sans-serif">${r[0]}</text><text x="170" y="${200 + i * 50}" font-size="26" fill="#18181b" font-family="monospace" font-weight="600">${r[1]}</text>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="856" height="540" viewBox="0 0 856 540">
    <rect width="856" height="540" rx="32" fill="#e8f1ec"/><rect x="16" y="16" width="824" height="508" rx="24" fill="none" stroke="#9fc5b0" stroke-width="3"/>
    <text x="60" y="80" font-size="30" font-weight="700" fill="#14532d" font-family="sans-serif">საქართველო · GEORGIA</text>
    <text x="60" y="120" font-size="20" fill="#166534" font-family="sans-serif">სატრანსპორტო საშუალების რეგისტრაციის მოწმობა · ${side === 'front' ? 'წინა მხარე' : 'უკანა მხარე'}</text>
    ${lines}
    <text x="796" y="500" text-anchor="end" font-size="18" fill="#71717a" font-family="sans-serif">ნიმუში · SAMPLE</text></svg>`;
  return { url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), name: `tech-passport-${side}.svg` };
}

export function prefill() {
  S.front = sampleCard('front'); S.back = sampleCard('back');
  S.uploadError = null;
  S.phone = '599123456'; S.channels = ['whatsapp', 'call']; S.preferred = 'whatsapp';
  S.aiValue = S.value = VEHICLE.value; S.valueMode = 'ai';
}

export function resetAll() {
  Object.assign(S, {
    front: null, back: null, uploadError: null, processing: false, scanError: false,
    phone: '', phoneTouched: false, channels: [], preferred: null, results: null, selected: new Set(),
    aiValue: null, value: null, valueMode: 'ai', valuating: 0, pendingAuction: false,
  });
}

/* ============================== AUCTION LOGIC ============================== */
/* Our AI's pick per category: cheapest premium for "cheap"; premium + 0.3 × deductible for the others. */
export function pickBest(ds: AgentReply[]): Results {
  const res = {} as Results;
  for (const cat of CATS) {
    const cands = ds.filter(r => !r.timeout && r.offers && r.offers[cat.id]).map(r => ({ insurer: r.id, ...r.offers![cat.id]! }));
    if (!cands.length) { res[cat.id] = null; continue; }
    const score = (x: Offer) => cat.id === 'cheap' ? x.premium : x.premium + 0.3 * x.deductible;
    cands.sort((a, b) => score(a) - score(b));
    const w = cands[0], next = cands[1];
    let why: string;
    if (!next) why = 'ერთადერთი შეთავაზება ამ კატეგორიაში';
    else {
      const diff = `სხვაობა მომდევნო შეთავაზებასთან: ${money(next.premium - w.premium)}`;
      why = cat.id === 'cheap' ? `ყველაზე დაბალი წლიური პრემია · ${diff}`
          : cat.id === 'max'   ? `სრული დაფარვა საუკეთესო ფასად, ფრანშიზა ${money(w.deductible)} · ${diff}`
          :                      `ძირითადი რისკები საუკეთესო ფასად · ${diff}`;
    }
    res[cat.id] = { ...w, why, count: cands.length };
  }
  return res;
}

export function buildLog(ds: AgentReply[], results: Results, value: number): LogLine[] {
  const L: LogLine[] = [
    { t: 0.0, kind: 'ok', text: 'ავტომობილის მონაცემები ანონიმიზებულია — პირადი ინფორმაცია არ გადაეცემა' },
    { t: 0.8, kind: 'ok', text: `ავტომობილის ღირებულება: ${money(value)}` },
    { t: SENT_AT, kind: 'info', text: `მოთხოვნა გაეგზავნა ${ds.length} სადაზღვევო კომპანიას · პასუხის ლოდინი ${AGENT_TIMEOUT_MS / 1000} წმ` },
  ];
  let total = 0;
  for (const r of ds) {
    const name = INSURERS[r.id].name;
    if (r.timeout) { L.push({ t: TIMEOUT_AT, kind: 'timeout', insurer: r.id, name, text: `${name}: პასუხი დროულად ვერ მივიღეთ` }); continue; }
    const n = Object.keys(r.offers || {}).length; total += n;
    const dec = Object.entries(r.declines || {}).map(([c, why]) => ` · „${catById(c as CatId).short}“ — ${DECLINE[why as DeclineReason]}`).join('');
    L.push({ t: r.t!, kind: n ? 'ok' : 'warn', insurer: r.id, name, count: n,
      text: n ? `${name}: მიღებულია ${n} შეთავაზება${dec}` : `${name}: შეთავაზება არ მოუწოდებია${dec}` });
  }
  L.sort((a, b) => a.t - b.t);
  const last = Math.max(...L.map(l => l.t));
  L.push({ t: last + 0.5, kind: 'spin', id: 'compare', text: `AI აგენტი ადარებს ${total} შეთავაზებას…` });
  let t = last + 1.3;
  for (const c of CATS) {
    const w = results[c.id];
    if (w) { const name = INSURERS[w.insurer].name; L.push({ t, kind: 'ok', who: w.insurer, name, text: `„${c.short}“: საუკეთესო — ${name} · ${money(w.premium)}` }); }
    else L.push({ t, kind: 'warn', text: `„${c.short}“: ამ კატეგორიაში შეთავაზება ვერ მოიძებნა` });
    t += 0.7;
  }
  L.push({ t: +(t - 0.3).toFixed(1), kind: 'done', text: 'შერჩეულია საუკეთესო შეთავაზებები' });
  return L.map(l => ({ ...l, t: +l.t.toFixed(1) }));
}

/** A log line's text with the insurer's current name (a deleted insurer shows as „წაშლილი სადაზღვევო“). */
export const logText = (x: LogLine) => x.name ? x.text.replace(x.name, INSURERS[(x.insurer || x.who)!].name) : x.text;

/* ============================== INSURER SIDE ============================== */
export const HOUR = 3600e3, DAY = 24 * HOUR;
export const now = () => Date.now() + S.offset;
const pad = (n: number) => String(n).padStart(2, '0');
export const fmtDate = (t: number) => { const d = new Date(t); return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
export const timeOnly = (t: number) => fmtDate(t).split(', ')[1];
export const dateOnly = (t: number) => fmtDate(t).split(', ')[0];
export const fmtLeft = (ms: number) => { if (ms <= 0) return '—'; const h = Math.floor(ms / HOUR), m = Math.floor(ms % HOUR / 60000); return h ? `${h} სთ ${m} წთ` : `${m} წთ`; };
export const initials = (c: Client) => `${c.first[0]}. ${c.last[0]}.`;
export const maskName = (c: Client) => `${c.first[0]}${'*'.repeat(c.first.length - 1)} ${c.last[0]}${'*'.repeat(c.last.length - 1)}`;
export const fullName = (c: Client) => `${c.first} ${c.last}`;
export const leadById = (id: string | null | undefined) => S.leads.find(l => l.id === id);
export const msgApp = (l: Lead) => l.client.preferred === 'call' ? 'sms' : l.client.preferred;
export const msgChannel = (l: Lead) => l.client.preferred === 'call' ? 'SMS' : chById(l.client.preferred).label;
export const carName = (v: { make: string; model: string; year: number }) => `${v.make} ${v.model} · ${v.year}`;

export const CLIENT_VEHICLE: Vehicle = { make: 'Toyota', model: 'Camry', year: 2018, vin: '4T1B11HK5JU000000', plate: 'AA-123-BB', color: 'თეთრი', body: 'სედანი', engine: '2.5 ლ', fuel: 'ბენზინი', value: 52000 };
const DEMO_CLIENT = { first: 'გიორგი', last: 'ბერიძე', pid: '01001012345', address: 'თბილისი, ნიმუშის ქ. 1' };
const SEED_CARS: Vehicle[] = [
  { make: 'Hyundai', model: 'Tucson', year: 2020, vin: 'KM8J3CA46LU000214', plate: 'TT-482-KA', color: 'ვერცხლისფერი', body: 'ჯიპი', engine: '2.0 ლ', fuel: 'ბენზინი', value: 68000 },
  { make: 'Mercedes-Benz', model: 'E 220', year: 2017, vin: 'WDD2130041A000377', plate: 'GG-915-LL', color: 'შავი', body: 'სედანი', engine: '2.0 ლ', fuel: 'დიზელი', value: 74000 },
  { make: 'Toyota', model: 'Prius', year: 2015, vin: 'JTDKN3DU5F0000481', plate: 'BB-207-ZZ', color: 'თეთრი', body: 'ჰეჩბეკი', engine: '1.8 ლ', fuel: 'ჰიბრიდი', value: 31000 },
  { make: 'Kia', model: 'Sportage', year: 2021, vin: 'U5YPG81ABML000562', plate: 'ZZ-640-NN', color: 'ლურჯი', body: 'ჯიპი', engine: '2.4 ლ', fuel: 'ბენზინი', value: 79000 },
  { make: 'Subaru', model: 'Forester', year: 2016, vin: 'JF2SJAHC9GH000673', plate: 'MM-318-OO', color: 'ნაცრისფერი', body: 'ჯიპი', engine: '2.5 ლ', fuel: 'ბენზინი', value: 38000 },
  { make: 'Lexus', model: 'RX 350', year: 2019, vin: '2T2BZMCA7KC000789', plate: 'LX-777-RX', color: 'თეთრი', body: 'ჯიპი', engine: '3.5 ლ', fuel: 'ბენზინი', value: 112000 },
  { make: 'Honda', model: 'CR-V', year: 2018, vin: '2HKRW2H85JH000894', plate: 'HH-524-CR', color: 'წითელი', body: 'ჯიპი', engine: '1.5 ლ', fuel: 'ბენზინი', value: 59000 },
];
const SEED_PEOPLE: Client[] = [
  { first: 'ნინო', last: 'კაპანაძე', pid: '01024056789', address: 'ბათუმი, ნიმუშის ქ. 12', phone: '577214365', channels: ['call'], preferred: 'call' },
  { first: 'დავით', last: 'გელაშვილი', pid: '01008033412', address: 'თბილისი, ნიმუშის გამზ. 7', phone: '591447120', channels: ['viber', 'call'], preferred: 'viber' },
  { first: 'მარიამ', last: 'ჯაფარიძე', pid: '01017029954', address: 'ქუთაისი, ნიმუშის ქ. 3', phone: '555903218', channels: ['whatsapp', 'telegram'], preferred: 'telegram' },
  { first: 'ლევან', last: 'ხუციშვილი', pid: '01031047706', address: 'თბილისი, ნიმუშის ქ. 45', phone: '599660482', channels: ['whatsapp'], preferred: 'whatsapp' },
  { first: 'თამარ', last: 'ლომიძე', pid: '01005061183', address: 'რუსთავი, ნიმუშის ქ. 9', phone: '568120947', channels: ['call', 'whatsapp', 'viber'], preferred: 'call' },
  { first: 'ირაკლი', last: 'ჩხეიძე', pid: '01042015530', address: 'თელავი, ნიმუშის ქ. 2', phone: '593781256', channels: ['telegram'], preferred: 'telegram' },
  { first: 'ანა', last: 'მესხი', pid: '01019074421', address: 'ზუგდიდი, ნიმუშის ქ. 18', phone: '551336907', channels: ['viber'], preferred: 'viber' },
];
const PKG_RULES: Record<CatId, [number, number, CovId[]]> = { max: [0.05, 300, FULL], limited: [0.033, 500, CORE], cheap: [0.019, 1000, BASIC] };
let leadSeq = 1040, callSeq = 300;

/* Demo history is generated as real searches (auction + offers + requests), so the
   admin view and every insurer dashboard show the same, consistent data. */
const AGENT_PROFILE: Record<string, { t: number; f: Partial<Record<CatId, number>>; ded: Partial<Record<CatId, number>>; cov?: Partial<Record<CatId, CovId[]>>; dec?: Partial<Record<CatId, DeclineReason>> }> = {
  kolkheti:  { t: 3.6, f: { max: 1.00, limited: 1.03, cheap: 1.10 }, ded: { max: 300, limited: 500, cheap: 1000 }, cov: { limited: [...CORE, 'glass'] } },
  iberia:    { t: 4.7, f: { limited: 1.06, cheap: 1.00 }, ded: { limited: 500, cheap: 1000 }, dec: { max: 'not_offered' } },
  mtkvari:   { t: 6.0, f: { max: 1.02, limited: 1.00, cheap: 1.05 }, ded: { max: 300, limited: 500, cheap: 1200 } },
  kazbegi:   { t: 7.8, f: { cheap: 0.98 }, ded: { cheap: 800 }, dec: { max: 'manual_underwriting', limited: 'not_offered' } },
  argonauti: { t: 5.4, f: { max: 0.99, limited: 1.00, cheap: 1.02 }, ded: { max: 250, limited: 500, cheap: 900 } },
};
const STD_COV: Record<CatId, CovId[]> = { max: FULL, limited: CORE, cheap: BASIC };
/* [hours ago, chosen packages, request status (one per request or one for all), hours until contacts were requested] */
type SeedRow = [number, CatId[], Lead['status'] | Lead['status'][] | null, number?];
const SEED_SEARCHES: SeedRow[] = [
  [0.8,  ['max'], 'new'],
  [2.5,  ['max', 'cheap'], 'contact_requested', 1.5],
  [5,    ['cheap'], 'contact_requested', 0.5],
  [9,    ['max', 'limited'], 'new'],
  [12,   [], null],
  [21.3, ['limited', 'cheap'], 'new'],
  [26,   ['max'], 'contact_requested', 20],
  [30,   ['cheap'], 'contact_requested', 2],
  [50,   ['limited'], 'expired'],
  [70,   ['max', 'limited', 'cheap'], ['contact_requested', 'expired', 'expired'], 3],
];

/* Spread the demo wins so every insurer's dashboard has a few requests */
const SEED_FAVOR: Record<number, Partial<Record<CatId, string>>> = { 7: { cheap: 'iberia' } };
function seedDataset(i: number, value: number): AgentReply[] {
  return Object.entries(AGENT_PROFILE).map(([id, pr], k) => {
    if (id === 'argonauti' && i % 2 === 0) return { id, timeout: true };
    const offers: Partial<Record<CatId, Offer>> = {};
    CATS.forEach((c, ci) => {
      if (!pr.f[c.id]) return;
      const jitter = (((i + 1) * 31 + k * 17 + ci * 7) % 11 - 5) / 100 - (SEED_FAVOR[i] && SEED_FAVOR[i][c.id] === id ? 0.1 : 0);
      offers[c.id] = { premium: Math.round(value * PKG_RULES[c.id][0] * pr.f[c.id]! * (1 + jitter) / 10) * 10,
        deductible: pr.ded[c.id]!, sum: value, cov: (pr.cov && pr.cov[c.id]) || STD_COV[c.id] };
    });
    return { id, t: +(pr.t + ((i + k) % 4) * 0.2).toFixed(1), offers, declines: pr.dec ? { ...pr.dec } : undefined };
  });
}

function recordCalls(s: Search) {
  s.ds.forEach(r => S.calls.push({ insurer: r.id, req: s.id, at: s.at + (r.timeout ? TIMEOUT_AT : r.t!) * 1000, timeout: !!r.timeout,
    latency: r.timeout ? AGENT_TIMEOUT_MS : Math.round((r.t! - SENT_AT) * 1000), offers: r.timeout ? 0 : Object.keys(r.offers || {}).length, declines: Object.keys(r.declines || {}).length }));
}

function seedData() {
  const base = Date.now(), searches: Search[] = [], leads: Lead[] = [];
  SEED_SEARCHES.forEach(([ago, chosen, status, rev], i) => {
    const car = SEED_CARS[(i * 3) % SEED_CARS.length], p = SEED_PEOPLE[i % SEED_PEOPLE.length];
    const ds = seedDataset(i, car.value), results = pickBest(ds);
    const s: Search = { id: 'Q-' + (++callSeq), at: base - ago * HOUR, client: { ...p, channels: [...p.channels] }, vehicle: car, ds, results,
      log: buildLog(ds, results, car.value), selected: chosen.filter(c => results[c]), leadIds: [] };
    const groups: Record<string, CatId[]> = {};
    s.selected.forEach(c => (groups[results[c]!.insurer] ||= []).push(c));
    Object.entries(groups).forEach(([ins, cats], j) => {
      const st = (Array.isArray(status) ? status[j] || status[status.length - 1] : status)!;
      const sentAt = s.at + 90e3;
      const l: Lead = { id: 'R-' + (++leadSeq), searchId: s.id, insurer: ins, sentAt, client: s.client, vehicle: car, status: st, messages: [],
        packages: cats.map(c => { const w = results[c]!; return { cat: c, premium: w.premium, sum: w.sum, deductible: w.deductible, cov: w.cov }; }) };
      if (st === 'contact_requested') { l.revealedAt = sentAt + rev! * HOUR; l.messages.push({ type: 'reveal', at: l.revealedAt }); }
      if (st === 'expired') { l.expiredAt = sentAt + DAY; l.messages.push({ type: 'expiry', at: l.expiredAt }); }
      leads.push(l); s.leadIds.push(l.id);
    });
    if (s.leadIds.length) s.consentAt = s.at + 90e3;
    searches.push(s);
  });
  return { searches, leads };
}

function initData() {
  const d = seedData();
  S.searches = d.searches; S.leads = d.leads; S.calls = [];
  S.searches.forEach(recordCalls);
}

/** Restore the demo data (keeps the client's own requests, restarted). */
export function demoReset() {
  const cs = S.searches.filter(x => x.fromClient), cl = S.leads.filter(l => l.fromClient);
  cs.forEach(x => { x.at = Date.now(); });
  cl.forEach(l => { l.status = 'new'; l.sentAt = Date.now(); l.messages = []; delete l.revealedAt; delete l.expiredAt; });
  const d = seedData(); S.offset = 0; S.searches = [...cs, ...d.searches]; S.leads = [...cl, ...d.leads]; S.calls = []; S.searches.forEach(recordCalls);
  emit(); toast('დემო მონაცემები აღდგა.', 'rotate-ccw');
}

/* One request per insurer; several packages from the same insurer go into the same request. */
export function createClientLeads() {
  const groups: Record<string, Package[]> = {};
  for (const c of CATS) if (S.selected.has(c.id)) {
    const w = S.results![c.id]!;
    (groups[w.insurer] ||= []).push({ cat: c.id, premium: w.premium, sum: w.sum, deductible: w.deductible, cov: w.cov });
  }
  const t = now(), srch = searchById(S.searchId);
  for (const [ins, packages] of Object.entries(groups)) {
    const l: Lead = { id: 'R-' + (++leadSeq), searchId: srch && srch.id, insurer: ins, sentAt: t, fromClient: true, vehicle: srch ? srch.vehicle : CLIENT_VEHICLE, packages, status: 'new', messages: [],
      client: srch ? srch.client : { ...DEMO_CLIENT, phone: S.phone, channels: [...S.channels], preferred: S.preferred! } };
    S.leads.unshift(l);
    if (srch) srch.leadIds.push(l.id);
  }
  if (srch) { srch.selected = CATS.map(c => c.id).filter(c => S.selected.has(c)); srch.consentAt = t; }
  S.lastSent = Object.keys(groups);
}

export function expireCheck() {
  const t = now(); let n = 0;
  for (const l of S.leads) if (l.status === 'new' && t >= l.sentAt + DAY) {
    l.status = 'expired'; l.expiredAt = l.sentAt + DAY; l.messages.push({ type: 'expiry', at: l.expiredAt }); n++;
  }
  return n;
}

export function revealLead(l: Lead) {
  l.status = 'contact_requested'; l.revealedAt = now();
  l.messages.push({ type: 'reveal', at: l.revealedAt });
}

export function messageText(l: Lead, type: 'reveal' | 'expiry') {
  const ins = INSURERS[l.insurer].name, name = l.client.first;
  return type === 'reveal'
    ? `გამარჯობა, ${name}!\nგაცნობებთ, რომ სადაზღვევო კომპანიამ — ${ins} — მიიღო თქვენი საკონტაქტო ინფორმაცია თქვენ მიერ არჩეული შეთავაზების თაობაზე და მალე დაგიკავშირდებათ.\nუპირატესი საშუალება: ${chById(l.client.preferred).label}.\nგთხოვთ, ელოდოთ მათ დაკავშირებას — ახალი მოთხოვნის გაგზავნა საჭირო არ არის.\nპატივისცემით, dazgveva.ge`
    : `გამარჯობა, ${name}!\nგაცნობებთ, რომ თქვენ მიერ არჩეულმა სადაზღვევო კომპანიამ — ${ins} — 24 საათის განმავლობაში ვერ მოახერხა თქვენთან დაკავშირება, ამიტომ მოთხოვნას ვადა გაუვიდა. ბოდიშს გიხდით შეფერხებისთვის.\nგირჩევთ, თავიდან სცადოთ — ახალი შეთავაზებების მოძიება სულ რამდენიმე წუთს დაგჭირდებათ: dazgveva.ge\nთქვენი მონაცემები სხვა კომპანიას არ გადასცემია.\nპატივისცემით, dazgveva.ge`;
}

export function ensureClientLead(ins = 'kolkheti') {
  const find = () => S.leads.find(l => l.fromClient && l.insurer === ins && l.status === 'new');
  if (find()) return find();
  if (!isActive(ins)) return undefined;
  prefill(); S.mode = 'normal'; S.results = makeClientSearch(auctionDataset('normal')).results; S.selected = new Set<CatId>(['max', 'cheap']);
  createClientLeads();
  return find();
}

/* ============================== ADMIN + STAFF ============================== */
export const AUTH: Record<AuthId, string> = {
  mtls:   'mTLS — კლიენტის სერტიფიკატი',
  oauth:  'OAuth 2.0 — client credentials',
  hmac:   'HMAC ხელმოწერა',
  apikey: 'API გასაღები (Bearer)',
};
export const DEMO_PASSWORD = 'DazgvevaDemo1!';
const NEW_COLORS = ['#0f766e', '#9333ea', '#c2410c', '#4d7c0f', '#0369a1', '#a21caf'];
export const isActive = (id: string) => !!(S.meta[id] && S.meta[id].status === 'active');
export const activeInsurers = () => Object.keys(S.meta).filter(isActive);
export const searchById = (id: string | null | undefined) => S.searches.find(x => x.id === id);
export const userBy = (name: string | undefined | null) => S.users.find(u => u.username === name);
export const sessionUser = () => userBy(S.session?.username);
export const leadsOf = (s: Search) => s.leadIds.map(leadById).filter(Boolean) as Lead[];
export const rnd = (n: number, abc = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789') => Array.from({ length: n }, () => abc[Math.floor(Math.random() * abc.length)]).join('');
export const makeOtp = () => `Tmp-${rnd(4, '23456789')}-${rnd(4)}`;

function initMeta() {
  INSURERS.alazani = { name: 'ალაზანი დაზღვევა', color: '#be123c', icon: 'grape' }; // the Alazani valley
  const desc: Record<string, string> = {
    kolkheti: 'დიდი პორტფელი, სწრაფი API. საკონტაქტო პირი: ციფრული გაყიდვების გუნდი.',
    iberia: 'ძლიერია იაფ სეგმენტში, „მაქს“ კატეგორიას არ სთავაზობს.',
    mtkvari: 'სტაბილური პასუხები სამივე კატეგორიაში.',
    kazbegi: 'ძვირ ავტომობილებს ინდივიდუალურად აფასებს.',
    argonauti: 'API ზოგჯერ აგვიანებს — ლოდინის დრო გადასახედია.',
    alazani: 'დროებით შეჩერებული პარტნიორობა (დემო: არქივი).',
  };
  const auth: Record<string, AuthId> = { kolkheti: 'mtls', iberia: 'oauth', mtkvari: 'hmac', kazbegi: 'apikey', argonauti: 'apikey', alazani: 'apikey' };
  S.meta = {};
  Object.keys(INSURERS).forEach(id => {
    S.meta[id] = { status: id === 'alazani' ? 'archived' : 'active', desc: desc[id], endpoint: `https://agent.${id}.example/dazgveva/v1/quote`,
      auth: auth[id], timeout: 8, creds: auth[id] === 'oauth' ? { tokenUrl: `https://auth.${id}.example/oauth/token`, clientId: 'dazgveva-platform', clientSecret: '••••••••', scope: 'quotes' }
        : auth[id] === 'hmac' ? { secret: 'dzg_' + rnd(24, '0123456789abcdef'), header: 'X-Dazgveva-Signature' }
        : auth[id] === 'mtls' ? { caName: `${id}-ca.pem` } : { key: 'dzg_' + rnd(24, '0123456789abcdef') } };
  });
  S.users = [{ username: 'admin', role: 'admin', insurer: null, password: rnd(16), mustChange: false, active: true, demo: false }];
  Object.keys(INSURERS).forEach(id => S.users.push({ username: `${id}.demo`, role: 'partner', insurer: id, password: DEMO_PASSWORD, mustChange: false, active: true, demo: true }));
}

/* Auction participants: every active built-in agent + any agent the admin added */
export function auctionDataset(mode: ModeId = S.mode): AgentReply[] {
  const v = S.value || VEHICLE.value, f = v / VEHICLE.value;   // premiums follow the value the client confirmed
  const scale = (x: Offer): Offer => ({ ...x, premium: Math.round(x.premium * f / 10) * 10, sum: v });
  const ds = DATASETS[mode].filter(r => isActive(r.id))
    .map(r => r.timeout ? r : { ...r, offers: Object.fromEntries(Object.entries(r.offers!).map(([c, x]) => [c, scale(x as Offer)])) });
  Object.keys(S.meta).filter(id => isActive(id) && !AGENT_PROFILE[id]).forEach((id, k) => {
    const offers: Partial<Record<CatId, Offer>> = {};
    CATS.forEach(c => offers[c.id] = { premium: Math.round(v * PKG_RULES[c.id][0] * (1.06 + k * 0.02) / 10) * 10,
      deductible: PKG_RULES[c.id][1], sum: v, cov: STD_COV[c.id] });
    ds.push({ id, t: 5.0 + k * 0.5, offers });
  });
  return ds;
}

export function makeClientSearch(ds: AgentReply[]) {
  const results = pickBest(ds);
  const s: Search = { id: 'Q-' + (++callSeq), at: now(), fromClient: true,
    client: { ...DEMO_CLIENT, phone: S.phone, channels: [...S.channels], preferred: S.preferred! },
    vehicle: { ...CLIENT_VEHICLE, value: S.value || CLIENT_VEHICLE.value, aiValue: S.aiValue || CLIENT_VEHICLE.value },
    ds, results, log: [], selected: [], leadIds: [] };
  s.log = buildLog(ds, results, s.vehicle.value);
  S.searches.unshift(s); S.searchId = s.id;
  recordCalls(s);
  return s;
}

/* ---------- agent JSON (what actually goes over the wire) ---------- */
const BODY_EN: Record<string, string> = { 'სედანი': 'sedan', 'ჯიპი': 'suv', 'ჰეჩბეკი': 'hatchback' };
const FUEL_EN: Record<string, string> = { 'ბენზინი': 'petrol', 'დიზელი': 'diesel', 'ჰიბრიდი': 'hybrid' };
const COV_EN: Record<CovId, string> = { collision: 'collision', theft: 'theft', nature: 'natural_disaster', glass: 'glass', towing: 'towing' };
export const agentRequest = (s: Search) => ({ request_id: s.id, product: 'casco', categories: CATS.map(c => c.id),
  vehicle: { vin: s.vehicle.vin, make: s.vehicle.make, model: s.vehicle.model, year: s.vehicle.year, body: BODY_EN[s.vehicle.body] || s.vehicle.body,
    engine_cc: Math.round(parseFloat(s.vehicle.engine) * 1000), fuel: FUEL_EN[s.vehicle.fuel] || s.vehicle.fuel, color: s.vehicle.color },
  market_value_gel: s.vehicle.aiValue || s.vehicle.value, insured_value_gel: s.vehicle.value, respond_within_ms: AGENT_TIMEOUT_MS });
export const agentResponse = (r: AgentReply) => ({
  offers: Object.entries(r.offers || {}).map(([c, x]) => ({ category: c, annual_premium_gel: x!.premium, sum_insured_gel: x!.sum, deductible_gel: x!.deductible, coverage: x!.cov.map(k => COV_EN[k]) })),
  declines: Object.entries(r.declines || {}).map(([c, reason]) => ({ category: c, reason })) });

export function newForm(id?: string | null): InsurerForm {
  if (!id) return { name: '', desc: '', endpoint: 'https://', auth: 'apikey', timeout: 8, creds: {}, firstUser: '', test: null, errors: [] };
  const m = S.meta[id];
  return { name: INSURERS[id].name, desc: m.desc || '', endpoint: m.endpoint, auth: m.auth, timeout: m.timeout, creds: { ...m.creds }, firstUser: '', test: null, errors: [] };
}

export function saveInsurerForm() {
  const f = S.form!, id = S.editIns, err: string[] = [];
  if (!f.name.trim()) err.push('მიუთითეთ დასახელება.');
  if (!/^https:\/\/[^\s/]+\.[^\s/]+/.test(f.endpoint.trim())) err.push('API მისამართი უნდა იწყებოდეს https://-ით.');
  const need: Record<AuthId, [string, string][]> = { oauth: [['tokenUrl', 'Token URL'], ['clientId', 'Client ID'], ['clientSecret', 'Client secret']], hmac: [['secret', 'ხელმოწერის გასაღები']], apikey: [['key', 'API გასაღები']], mtls: [['caName', 'CA სერტიფიკატი']] };
  need[f.auth].forEach(([k, l]) => { if (!(f.creds[k] || '').trim()) err.push(`შეავსეთ: ${l}.`); });
  if (!(+f.timeout >= 1 && +f.timeout <= 15)) err.push('ლოდინის დრო: 1-დან 15 წამამდე.');
  if (!id) {
    if (!/^[a-z0-9._-]{3,}$/.test(f.firstUser.trim())) err.push('პირველი მომხმარებლის სახელი: ლათინური ასოები, ციფრები, წერტილი (მინ. 3).');
    else if (userBy(f.firstUser.trim())) err.push('ასეთი მომხმარებელი უკვე არსებობს.');
  }
  f.errors = err;
  if (err.length) { emit(); window.scrollTo({ top: 0 }); return; }
  const data = { desc: f.desc.trim(), endpoint: f.endpoint.trim(), auth: f.auth, timeout: +f.timeout, creds: { ...f.creds } };
  if (id) {
    INSURERS[id].name = f.name.trim(); Object.assign(S.meta[id], data);
    go('adm-insurers'); toast('ცვლილებები შენახულია.', 'save');
  } else {
    const nid = 'ins' + Date.now().toString(36);
    INSURERS[nid] = { name: f.name.trim(), color: NEW_COLORS[Object.keys(S.meta).length % NEW_COLORS.length], icon: 'building-2' };
    S.meta[nid] = { status: 'active', ...data };
    const otp = makeOtp();
    S.users.push({ username: f.firstUser.trim(), role: 'partner', insurer: nid, password: otp, mustChange: true, active: true, demo: false });
    S.insTab = 'active'; go('adm-insurers');
    openModal({ type: 'otp', title: `სადაზღვევო დაემატა: ${INSURERS[nid].name}`, u: f.firstUser.trim(), p: otp });
    toast('ახალი აგენტი შემდეგ აუქციონზე უკვე მიიწვევა.', 'gavel');
  }
}

export function testConnection() {
  const f = S.form!; f.test = 'running'; emit();
  setTimeout(() => {
    if (S.form !== f) return;
    const ep = (f.endpoint || '').trim();
    f.test = !/^https:\/\/[^\s/]+\.[^\s/]+/.test(ep) ? { ok: false, text: 'მისამართი უნდა იყოს სრული და იწყებოდეს https://-ით.' }
      : /fail|timeout|down/.test(ep) ? { ok: false, text: 'კავშირი ვერ დამყარდა: აგენტმა 5 წამში არ უპასუხა (timeout).' }
      : { ok: true, text: `200 OK · ${600 + Math.floor(Math.random() * 700)} მწმ · სატესტო მოთხოვნაზე დაბრუნდა 3 შეთავაზება. კონტრაქტი dazgveva.agent-quote/v1 — ვალიდურია.` };
    emit();
  }, 1300);
}

export function fillDemoForm() {
  Object.assign(S.form!, { name: 'რიონი დაზღვევა', desc: 'ახალი პარტნიორი, პილოტური პერიოდი 3 თვე.', endpoint: 'https://agent.rioni.example/dazgveva/v1/quote',
    auth: 'oauth', timeout: 8, firstUser: 'rioni.nino', creds: { tokenUrl: 'https://auth.rioni.example/oauth/token', clientId: 'dazgveva-platform', clientSecret: 'rioni-' + rnd(16), scope: 'quotes' }, errors: [] });
  emit();
}

export function archiveInsurer(id: string) {
  S.meta[id].status = 'archived'; S.modal = null;
  if (S.insurer === id) S.insurer = activeInsurers()[0];
  S.insTab = 'archived'; go('adm-insurers'); toast(`${INSURERS[id].name}: დაარქივდა.`, 'archive');
}
export function restoreInsurer(id: string) {
  S.meta[id].status = 'active'; S.insTab = 'active'; go('adm-insurers'); toast(`${INSURERS[id].name}: აღდგა და ისევ აქტიურია.`, 'archive-restore');
}
export function deleteInsurer(id: string) {
  const name = INSURERS[id].name;
  delete S.meta[id];
  S.users = S.users.filter(u => u.insurer !== id);
  INSURERS[id] = { name: 'წაშლილი სადაზღვევო', color: '#a1a1aa', icon: 'circle-off', deleted: true };
  S.modal = null; S.insTab = 'archived'; go('adm-insurers'); toast(`${name} სამუდამოდ წაიშალა.`, 'trash-2');
}

export function addUser(name: string, role: User['role'], ins: string): string | null {
  const msg = !/^[a-z0-9._-]{3,}$/.test(name) ? 'მომხმარებლის სახელი: ლათინური ასოები, ციფრები, წერტილი (მინ. 3).' : userBy(name) ? 'ასეთი მომხმარებელი უკვე არსებობს.' : '';
  if (msg) return msg;
  const otp = makeOtp();
  S.users.push({ username: name, role, insurer: role === 'admin' ? null : ins, password: otp, mustChange: true, active: true, demo: false });
  openModal({ type: 'otp', title: 'მომხმარებელი დაემატა', u: name, p: otp });
  return null;
}
export function resetPassword(username: string) {
  const u = userBy(username)!, otp = makeOtp();
  u.password = otp; u.mustChange = true;
  openModal({ type: 'otp', title: 'პაროლი აღდგა', u: u.username, p: otp });
}

export function enterPortal(u: User) {
  S.session = { username: u.username };
  if (u.role === 'admin') go('adm-overview');
  else { S.insurer = u.insurer!; S.filter = 'all'; go('ins-list'); }
}
export function logout() {
  S.session = null; S.loggingOut = true; go('home'); toast('გამოხვედით.', 'log-out');
}
export function submitLogin() {
  const L = S.login, u = userBy(L.u.trim());
  if (!u || u.password !== L.p) { L.error = 'მომხმარებლის სახელი ან პაროლი არასწორია.'; emit(); return; }
  if (!u.active || (u.insurer && !isActive(u.insurer))) { L.error = 'ანგარიში დეაქტივირებულია. მიმართეთ ადმინისტრატორს.'; emit(); return; }
  S.login = { u: '', p: '', error: null, hint: null };
  S.session = { username: u.username };
  if (u.mustChange) { S.pw = {}; go('pwchange'); } else enterPortal(u);
}
export const pwRules = (): [string, boolean][] => {
  const a = S.pw.a || '', b = S.pw.b || '';
  return [['min. 10 სიმბოლო', a.length >= 10], ['დიდი და პატარა ასო', /[a-z]/.test(a) && /[A-Z]/.test(a)], ['მინიმუმ ერთი ციფრი', /\d/.test(a)], ['პაროლები ემთხვევა', !!a && a === b]];
};
export function submitPassword() {
  const u = sessionUser();
  if (!u || !pwRules().every(r => r[1])) return;
  if (S.pw.a === u.password) { toast('ახალი პაროლი ერთჯერადისგან უნდა განსხვავდებოდეს.', 'circle-alert'); return; }
  u.password = S.pw.a!; u.mustChange = false; S.pw = {};
  toast('პაროლი შეიცვალა. კეთილი იყოს თქვენი მობრძანება!', 'circle-check');
  enterPortal(u);
}

/* ============================== VALUATION (step 2) ============================== */
/* Asking prices of comparable listings (Toyota Camry, 2017–2019). Deterministic for the demo and
   shifted so that their median is exactly the demo car's value. */
export const MARKET = (() => {
  let x = 966118; const r = () => (x = (x * 16807) % 2147483647) / 2147483647;
  const raw = Array.from({ length: 38 }, () => VEHICLE.value + (r() + r() + r() - 1.5) * 9000).sort((a, b) => a - b);
  const med = (raw[18] + raw[19]) / 2;
  return raw.map(v => Math.round((v - med + VEHICLE.value) / 100) * 100);
})();
const quantile = (arr: number[], q: number) => { const i = (arr.length - 1) * q, a = Math.floor(i); return arr[a] + (arr[Math.ceil(i)] - arr[a]) * (i - a); };
export const MARKET_STATS = {
  median: Math.round(quantile(MARKET, 0.5) / 500) * 500,
  p25: Math.round(quantile(MARKET, 0.25) / 100) * 100,
  p75: Math.round(quantile(MARKET, 0.75) / 100) * 100,
};
export const MARKET_BINS = (() => {
  const w = 2000, lo = Math.floor(MARKET[0] / w) * w, hi = Math.ceil((MARKET[MARKET.length - 1] + 1) / w) * w;
  const bins: { from: number; to: number; n: number }[] = [];
  for (let f = lo; f < hi; f += w) bins.push({ from: f, to: f + w, n: MARKET.filter(v => v >= f && v < f + w).length });
  return { lo, hi, bins };
})();
export const VALUE_STEP = 500;
export const valueMin = () => Math.round(S.aiValue! * 0.6 / VALUE_STEP) * VALUE_STEP;
export const valueMax = () => Math.round(S.aiValue! * 1.4 / VALUE_STEP) * VALUE_STEP;
export const valueOk = (v: number | null) => v != null && Number.isFinite(v) && v >= valueMin() && v <= valueMax();

/* ============================== UPLOADS ============================== */
export const SIDE_NAME: Record<Side, string> = { front: 'წინა მხარე', back: 'უკანა მხარე' };
export const nextSide = (): Side | null => !S.front ? 'front' : !S.back ? 'back' : null;
const validFile = (f: File) => (/^image\/(jpeg|png|heic|heif)$/.test(f.type) || /\.(jpe?g|png|heic|heif)$/i.test(f.name)) && f.size <= 10 * 1024 * 1024;
export function setSide(side: Side, val: Upload | null) {
  const cur = S[side];
  if (cur && cur.url.startsWith('blob:')) URL.revokeObjectURL(cur.url);
  S[side] = val;
  S.aiValue = S.value = null; S.valueMode = 'ai';
}
/* Files fill the next empty side (front, then back); a replace targets one side. */
export function acceptFiles(files: FileList | File[], side?: Side) {
  S.uploadError = null; S.scanError = false;
  for (const file of [...files].slice(0, 2)) {
    const target = side || nextSide();
    if (!target) break;
    if (!validFile(file)) { S.uploadError = 'ფაილი ვერ აიტვირთა. გამოიყენეთ JPG, PNG ან HEIC, მაქს. 10 მბ.'; continue; }
    setSide(target, { url: URL.createObjectURL(file), name: file.name });
    if (side) break;
  }
  emit();
}

/* ============================== SCENARIOS ============================== */
export function runScenario(id: string) {
  S.navOpen = false;
  resetAll();
  if (id === 'S1') { S.mode = 'normal'; go('home'); toast('ატვირთეთ ორივე მხარე ან ნავიგატორში აირჩიეთ „სადემო ტექპასპორტი“.'); }
  if (id === 'S2') { go('home'); toast('სცადეთ PDF ან 10 მბ-ზე დიდი ფაილი. წაუკითხავი სკანისთვის ჩართეთ გადამრთველი ნავიგატორში.'); }
  if (id === 'S3') { S.mode = 'surprises'; prefill(); go('auction'); }
  if (id === 'S4') {
    S.mode = 'same'; prefill(); S.results = makeClientSearch(auctionDataset('same')).results;
    S.selected = new Set<CatId>(['max', 'limited']); go('offers');
    toast('მაქს და ლიმიტირებული ერთი კომპანიისაა — გაგზავნისას მას ერთი მოთხოვნა მიუვა ორი პაკეტით.', 'info');
  }
  if ((id === 'S5' || id === 'S6') && !isActive('kolkheti')) { go('home'); toast('კოლხეთი ჯგუფი დაარქივებულია — აღადგინეთ ადმინ პანელში.', 'archive'); return; }
  if (id === 'S5') {
    const l = ensureClientLead()!; S.insurer = 'kolkheti'; S.leadId = l.id; S.session = { username: 'kolkheti.demo' }; go('ins-detail', { id: l.id });
    toast('ასე ხედავს სადაზღვევო კლიენტის მოთხოვნას. დააჭირეთ „საკონტაქტოს მოთხოვნა“.', 'inbox');
  }
  if (id === 'S6') {
    ensureClientLead(); S.insurer = 'kolkheti'; S.filter = 'all'; S.session = { username: 'kolkheti.demo' }; go('ins-list');
    toast('დააჭირეთ „+24 სთ“ ყვითელ დემო ზოლზე: ახალ მოთხოვნებს ვადა გაუვა და კლიენტებს შეტყობინება გაეგზავნებათ.', 'clock');
  }
  if (id === 'S7') {
    S.session = { username: 'admin' }; S.editIns = null; S.form = newForm(); go('adm-ins-form');
    toast('შეავსეთ ფორმა (ან „დემო: შევსება“), შეცვალეთ ავთენტიფიკაციის მეთოდი, შემდეგ „შემოწმება“ და „შენახვა“.', 'building-2');
  }
  if (id === 'S8') {
    S.session = { username: 'admin' }; S.insTab = Object.values(S.meta).some(m => m.status === 'archived') ? 'archived' : 'active'; go('adm-insurers');
    toast('არქივიდან სცადეთ „აღდგენა“ ან „სამუდამოდ წაშლა“; აქტიურის ტაბზე — „დაარქივება“.', 'archive');
  }
  if (id === 'S9') {
    let srch = S.searches.find(x => x.fromClient && x.leadIds.length);
    if (!srch && isActive('kolkheti')) { ensureClientLead(); srch = S.searches.find(x => x.fromClient && x.leadIds.length); }
    S.session = { username: 'admin' }; S.searchId = (srch || S.searches[0]).id; go('adm-request', { id: S.searchId });
    toast('აქ ჩანს ყველაფერი: კლიენტი, OCR, შეფასება, ლოგი, ყველა შეთავაზება, JSON და ისტორია.', 'search');
  }
  if (id === 'S10') {
    let u = userBy('kolkheti.nino');
    if (!u) { u = { username: 'kolkheti.nino', role: 'partner', insurer: 'kolkheti', password: makeOtp(), mustChange: true, active: true, demo: false }; S.users.push(u); }
    if (!u.mustChange) { u.password = makeOtp(); u.mustChange = true; }
    S.session = null; S.login = { u: u.username, p: u.password, error: null, hint: { u: u.username, p: u.password } }; go('login');
    toast('ადმინმა შექმნა ახალი მომხმარებელი ერთჯერადი პაროლით. დააჭირეთ „შესვლა“.', 'log-in');
  }
}

/** Fast-forward the demo clock; new requests may expire. */
export function fastForward(h: number) {
  S.offset += h * HOUR;
  const mine = S.leads.filter(l => l.insurer === S.insurer && l.status === 'new').map(l => l.id);
  const n = expireCheck(), m = mine.filter(id => leadById(id)!.status === 'expired').length;
  emit();
  toast(n ? `დემო დრო: +${h} სთ. ${m || n} მოთხოვნას ვადა გაუვიდა — კლიენტებს ეცნობათ.` : `დემო დრო: +${h} სთ.`, 'clock');
}

/** Called once in the browser. */
export function initDemo() {
  if (S.ready) return;
  initMeta(); initData(); S.ready = true;
}
