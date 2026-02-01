import path from "node:path";
import { AppConfig } from "../config.js";
import { CTRGateReport, ShootBrief, validateCtrGateReport } from "../agents/schemas.js";
import { writeJson } from "../util/fs.js";

const PROMISE_TOKEN_RE = /(\$\d[\d,]*|\d+\s*(years?|months?|days?)|\d+%|0%\s*interest|no\s*payments?|paid\s*to\s*buy)/i;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9%$\s]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

function keywordOverlap(a: string, b: string): number {
  const A = new Set(tokenize(a));
  const B = new Set(tokenize(b));
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter += 1;
  const denom = Math.max(A.size, B.size);
  return inter / denom;
}

function firstSentence(text: string): string {
  const s = text.split(/[.!?\n]/)[0] ?? "";
  return s.trim();
}

function extractPromise(title: string, dealFallback: string[]): string | null {
  const m = PROMISE_TOKEN_RE.exec(title);
  if (m) return m[0];
  for (const t of dealFallback) {
    if (t && t.trim()) return t.trim();
  }
  return null;
}

function proposeFixes(promise: string): { titles: string[]; overlays: string[]; hook: string } {
  const p = promise.trim();
  const titles = [
    `${p} — The Real Breakdown`,
    `How ${p} Actually Works`,
    `I Found ${p} (Proof + Terms)`,
  ];
  const overlays = [
    p.split(/\s+/).slice(0, 4).join(" ") || "PROOF",
    "SHOW ME TERMS",
  ].map((o) => o.split(/\s+/).slice(0, 4).join(" "));

  const hook = `This is ${p} — and I’ll show the exact terms in 10 seconds.`;
  return { titles, overlays, hook };
}

export function runCtrGate(cfg: AppConfig, brief: ShootBrief, outputDir: string): CTRGateReport {
  const promise = extractPromise(brief.youtube_title, brief.deal.promise_tokens);
  const title_has_promise = promise !== null && promise.length > 0;

  const overlap_score = title_has_promise ? keywordOverlap(brief.youtube_title, brief.thumbnail_concept) : 0;
  const thumbnail_aligns = overlap_score >= cfg.ctr_gate.keyword_overlap_threshold;

  const firstSentences = brief.hook_variants.map(firstSentence);
  const hook_has_promise = title_has_promise
    ? firstSentences.every((s) => s.toLowerCase().includes((promise as string).toLowerCase()) || PROMISE_TOKEN_RE.test(s))
    : false;

  const reasons: string[] = [];
  if (!title_has_promise) reasons.push("Title missing concrete deal promise token.");
  if (title_has_promise && !thumbnail_aligns) reasons.push(`Thumbnail concept misaligned with title promise (overlap=${overlap_score.toFixed(2)}).`);
  if (title_has_promise && !hook_has_promise) reasons.push("Hook variants do not reference the same promise in the first sentence.");

  const gate_status = reasons.length === 0 ? "pass" : "fail";

  let fixes: Record<string, unknown> = {};
  if (gate_status === "fail") {
    const p = promise ?? "a better deal promise";
    const f = proposeFixes(p);
    fixes = {
      rewritten_titles: f.titles,
      thumbnail_text_overlays: f.overlays,
      revised_hook_line: f.hook,
    };
  }

  const confidence_score = (title_has_promise ? 40 : 0) + (thumbnail_aligns ? 30 : 0) + (hook_has_promise ? 30 : 0);

  const reportCandidate: CTRGateReport = {
    gate_status,
    reasons,
    fixes,
    confidence_score,
    overlap_score,
    title_has_promise,
    hook_has_promise,
    thumbnail_aligns,
  };

  const report = validateCtrGateReport(reportCandidate);
  writeJson(path.join(outputDir, "ctr_gate_report.json"), report);
  return report;
}
