export type CatId = 'max' | 'limited' | 'cheap';
export type ChannelId = 'call' | 'whatsapp' | 'viber' | 'telegram';
export type CovId = 'collision' | 'theft' | 'nature' | 'glass' | 'towing';
export type DeclineReason = 'not_offered' | 'manual_underwriting';
export type LeadStatus = 'new' | 'contact_requested' | 'expired';
export type AuthId = 'mtls' | 'oauth' | 'hmac' | 'apikey';
export type ModeId = 'normal' | 'surprises' | 'same';
export type Side = 'front' | 'back';

export interface Offer { premium: number; deductible: number; sum: number; cov: CovId[] }
export interface AgentReply {
  id: string;
  t?: number;
  timeout?: boolean;
  offers?: Partial<Record<CatId, Offer>>;
  declines?: Partial<Record<CatId, DeclineReason>>;
}
export interface Pick extends Offer { insurer: string; why: string; count: number }
export type Results = Record<CatId, Pick | null>;

export interface LogLine {
  t: number;
  kind: 'ok' | 'info' | 'timeout' | 'warn' | 'spin' | 'done';
  text: string;
  insurer?: string; // an agent's reply (updates its status chip)
  who?: string;     // the winner announced on a per-category line
  name?: string;    // insurer name baked into `text` (replaced if the insurer is deleted)
  count?: number;
  id?: string;
}

export interface Vehicle {
  make: string; model: string; year: number; vin: string; plate: string;
  color: string; body: string; engine: string; fuel: string;
  value: number;      // the value the auction used (the client's)
  aiValue?: number;   // AI market estimate, when it differs
}
export interface Client {
  first: string; last: string; pid: string; address?: string;
  phone: string; channels: ChannelId[]; preferred: ChannelId;
}
export interface Search {
  id: string; at: number; fromClient?: boolean;
  client: Client; vehicle: Vehicle;
  ds: AgentReply[]; results: Results; log: LogLine[];
  selected: CatId[]; leadIds: string[]; consentAt?: number;
}
export interface Package { cat: CatId; premium: number; sum: number; deductible: number; cov: CovId[] }
export interface Lead {
  id: string; searchId?: string; insurer: string; sentAt: number; fromClient?: boolean;
  client: Client; vehicle: Vehicle; packages: Package[]; status: LeadStatus;
  messages: { type: 'reveal' | 'expiry'; at: number }[];
  revealedAt?: number; expiredAt?: number;
}
export interface Call { insurer: string; req: string; at: number; timeout: boolean; latency: number; offers: number; declines: number }
export interface Insurer { name: string; color: string; icon?: string; deleted?: boolean }
export interface Meta { status: 'active' | 'archived'; desc: string; endpoint: string; auth: AuthId; timeout: number; creds: Record<string, string> }
export interface User { username: string; role: 'admin' | 'partner'; insurer: string | null; password: string; mustChange: boolean; active: boolean; demo: boolean }
export interface Upload { url: string; name: string }

export interface InsurerForm {
  name: string; desc: string; endpoint: string; auth: AuthId; timeout: number | string;
  creds: Record<string, string>; firstUser: string;
  test: null | 'running' | { ok: boolean; text: string };
  errors: string[];
}

export type Modal =
  | { type: 'confirm'; id: string }
  | { type: 'phone'; id: string; msg: 'reveal' | 'expiry' }
  | { type: 'archive'; id: string }
  | { type: 'delete'; id: string }
  | { type: 'otp'; title: string; u: string; p: string }
  | { type: 'add-user'; ins?: string };

export interface Toast { id: number; text: string; icon: string; action?: { label: string; run: () => void } }
