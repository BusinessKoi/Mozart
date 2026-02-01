import { DealContext, validateDealContext } from "../agents/schemas.js";
import { getDeal } from "./store.js";

const FIELD_RE = /^\s*([A-Za-z0-9 _-]+)\s*:\s*(.+?)\s*$/;

export function parseStructuredFields(description: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of (description || "").split(/\r?\n/)) {
    const m = FIELD_RE.exec(line);
    if (!m) continue;
    const key = m[1].trim().toLowerCase().replace(/\s+/g, "_");
    const val = m[2].trim();
    if (key && val) out[key] = val;
  }
  return out;
}

function splitPromiseTokens(promise: string): string[] {
  return (promise || "")
    .split(/[;|,]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function extractDealContext(description: string, dealsPath: string): { deal: DealContext; debug: Record<string, unknown> } {
  const fields = parseStructuredFields(description);
  const deal_id = fields["deal_id"] ?? fields["deal"] ?? "";

  const fallback = deal_id ? getDeal(dealsPath, deal_id) : null;

  const address = fields["address"] ?? (typeof fallback?.["address"] === "string" ? String(fallback["address"]) : "");
  const terms = fields["terms"] ?? (typeof fallback?.["terms"] === "string" ? String(fallback["terms"]) : "");
  const promiseRaw = fields["promise"] ?? (typeof fallback?.["promise"] === "string" ? String(fallback["promise"]) : "");

  const priceFromFields = fields["price"] ? Number(fields["price"].replace(/[^0-9.]/g, "")) : NaN;
  const priceFromFallback = typeof fallback?.["price"] === "number" ? (fallback["price"] as number) : NaN;

  const dealCandidate: DealContext = {
    deal_id: deal_id || "UNKNOWN",
    address,
    price: Number.isFinite(priceFromFields) ? priceFromFields : Number.isFinite(priceFromFallback) ? priceFromFallback : undefined,
    terms,
    promise_tokens: splitPromiseTokens(promiseRaw),
    notes: fields["notes"] ?? (typeof fallback?.["notes"] === "string" ? String(fallback["notes"]) : ""),
  };

  const deal = validateDealContext(dealCandidate);

  return {
    deal,
    debug: {
      used_fallback: Boolean(fallback),
      extracted_fields: fields,
    },
  };
}
