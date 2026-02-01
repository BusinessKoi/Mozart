import { exists, readJson } from "../util/fs.js";

export type DealRecord = Record<string, unknown>;

function asObj(v: unknown): DealRecord {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as DealRecord;
  return {};
}

export function loadDeals(filePath: string): Record<string, DealRecord> {
  if (!exists(filePath)) {
    throw new Error(`deals file not found: ${filePath}`);
  }
  const raw = readJson<unknown>(filePath);
  const o = asObj(raw);
  const out: Record<string, DealRecord> = {};
  for (const [k, v] of Object.entries(o)) {
    out[k] = asObj(v);
  }
  return out;
}

export function getDeal(filePath: string, dealId: string): DealRecord | undefined {
  const all = loadDeals(filePath);
  return all[dealId];
}
