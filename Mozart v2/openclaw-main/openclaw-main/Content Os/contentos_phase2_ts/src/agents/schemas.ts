export const Tags = ["ON-SITE", "FILM", "PROPERTY", "PACE"] as const;
export type Tag = typeof Tags[number];

export interface CalendarEvent {
  id: string;
  summary: string;
  description: string;
  location: string;
  start: string; // ISO
  end: string;   // ISO
  tags: Tag[];
}

export interface DealContext {
  deal_id: string;
  address: string;
  price?: number;
  terms: string;
  promise_tokens: string[];
  notes: string;
}

export interface DemoHookOptimizerOutput {
  hooks: [string, string, string, string, string];
  intro_rewrite_0_30s: string;
  structural_recommendations: string[];
}

export interface QuentinLiteOutput {
  script_outline: string[];
  shot_list: string[];
  talking_points: string[];
}

export interface ShootBrief {
  event: CalendarEvent;
  deal: DealContext;
  youtube_title: string;
  thumbnail_concept: string;
  hook_variants: string[];
  intro_rewrite_0_30s: string;
  shot_list: string[];
  talking_points: string[];
  do_not_leave_checklist: string[];
  generated_at: string;
}

export interface CTRGateReport {
  gate_status: "pass" | "fail";
  reasons: string[];
  fixes: Record<string, unknown>;
  confidence_score: number;
  overlap_score: number;
  title_has_promise: boolean;
  hook_has_promise: boolean;
  thumbnail_aligns: boolean;
}

function isIsoDateTime(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}T/.test(s);
}

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

export function validateCalendarEvent(u: unknown): CalendarEvent {
  const o = (u && typeof u === "object" && !Array.isArray(u)) ? (u as Record<string, unknown>) : {};
  const id = String(o.id ?? "");
  assert(id.length > 0, "CalendarEvent.id required");
  const summary = String(o.summary ?? "");
  const description = String(o.description ?? "");
  const location = String(o.location ?? "");
  const start = String(o.start ?? "");
  const end = String(o.end ?? "");
  assert(isIsoDateTime(start), "CalendarEvent.start must be ISO datetime");
  assert(isIsoDateTime(end), "CalendarEvent.end must be ISO datetime");
  const tagsIn = Array.isArray(o.tags) ? o.tags : [];
  const tags: Tag[] = [];
  for (const t of tagsIn) {
    if (typeof t === "string" && (Tags as readonly string[]).includes(t)) tags.push(t as Tag);
  }
  return { id, summary, description, location, start, end, tags };
}

export function validateDealContext(u: unknown): DealContext {
  const o = (u && typeof u === "object" && !Array.isArray(u)) ? (u as Record<string, unknown>) : {};
  const deal_id = String(o.deal_id ?? "");
  assert(deal_id.length > 0, "DealContext.deal_id required");
  const address = String(o.address ?? "");
  const terms = String(o.terms ?? "");
  const notes = String(o.notes ?? "");
  const price = typeof o.price === "number" && Number.isFinite(o.price) ? o.price : undefined;
  const promise_tokens = Array.isArray(o.promise_tokens) ? o.promise_tokens.map(String).filter((s) => s.trim().length > 0) : [];
  return { deal_id, address, price, terms, promise_tokens, notes };
}

export function validateShootBrief(u: unknown): ShootBrief {
  const o = (u && typeof u === "object" && !Array.isArray(u)) ? (u as Record<string, unknown>) : {};
  const event = validateCalendarEvent(o.event);
  const deal = validateDealContext(o.deal);
  const youtube_title = String(o.youtube_title ?? "");
  assert(youtube_title.length > 0, "ShootBrief.youtube_title required");
  const thumbnail_concept = String(o.thumbnail_concept ?? "");
  assert(thumbnail_concept.length > 0, "ShootBrief.thumbnail_concept required");
  const hook_variants = Array.isArray(o.hook_variants) ? o.hook_variants.map(String).filter((s) => s.trim().length > 0) : [];
  assert(hook_variants.length >= 3, "ShootBrief.hook_variants must be >=3");
  const intro_rewrite_0_30s = String(o.intro_rewrite_0_30s ?? "");
  assert(intro_rewrite_0_30s.length > 0, "ShootBrief.intro_rewrite_0_30s required");
  const shot_list = Array.isArray(o.shot_list) ? o.shot_list.map(String).filter((s) => s.trim().length > 0) : [];
  assert(shot_list.length >= 8, "ShootBrief.shot_list must be >=8");
  const talking_points = Array.isArray(o.talking_points) ? o.talking_points.map(String).filter((s) => s.trim().length > 0) : [];
  assert(talking_points.length >= 8, "ShootBrief.talking_points must be >=8");
  const do_not_leave_checklist = Array.isArray(o.do_not_leave_checklist) ? o.do_not_leave_checklist.map(String).filter((s) => s.trim().length > 0) : [];
  assert(do_not_leave_checklist.length >= 3, "ShootBrief.do_not_leave_checklist must be >=3");
  const generated_at = String(o.generated_at ?? "");
  assert(isIsoDateTime(generated_at), "ShootBrief.generated_at must be ISO datetime");
  return { event, deal, youtube_title, thumbnail_concept, hook_variants, intro_rewrite_0_30s, shot_list, talking_points, do_not_leave_checklist, generated_at };
}

export function validateCtrGateReport(u: unknown): CTRGateReport {
  const o = (u && typeof u === "object" && !Array.isArray(u)) ? (u as Record<string, unknown>) : {};
  const gate_status = String(o.gate_status ?? "");
  assert(gate_status === "pass" || gate_status === "fail", "CTRGateReport.gate_status invalid");
  const reasons = Array.isArray(o.reasons) ? o.reasons.map(String) : [];
  const fixes = (o.fixes && typeof o.fixes === "object" && !Array.isArray(o.fixes)) ? (o.fixes as Record<string, unknown>) : {};
  const confidence_score = typeof o.confidence_score === "number" ? o.confidence_score : 0;
  const overlap_score = typeof o.overlap_score === "number" ? o.overlap_score : 0;
  const title_has_promise = Boolean(o.title_has_promise);
  const hook_has_promise = Boolean(o.hook_has_promise);
  const thumbnail_aligns = Boolean(o.thumbnail_aligns);
  return { gate_status: gate_status as "pass"|"fail", reasons, fixes, confidence_score, overlap_score, title_has_promise, hook_has_promise, thumbnail_aligns };
}
