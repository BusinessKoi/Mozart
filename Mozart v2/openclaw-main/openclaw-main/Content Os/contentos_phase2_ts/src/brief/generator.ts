import path from "node:path";
import { AppConfig } from "../config.js";
import { CalendarEvent, ShootBrief, validateShootBrief } from "../agents/schemas.js";
import { extractDealContext } from "../deals/extract.js";
import { runDemoHookOptimizer, runQuentinLite } from "../agents/wrappers.js";
import { ensureDir, writeJson, writeText } from "../util/fs.js";
import { renderCaptureChecklist, renderMarkdown } from "./render.js";

function deterministicGeneratedAt(eventStartISO: string): string {
  const d = eventStartISO.slice(0, 10);
  return `${d}T00:00:00.000Z`;
}

function choosePromiseToken(deal: { promise_tokens: string[]; terms: string; price?: number }): string {
  if (deal.promise_tokens.length > 0) return deal.promise_tokens[0];
  if (deal.terms) return deal.terms;
  if (deal.price !== undefined) return `$${deal.price.toLocaleString()}`;
  return "a deal most people miss";
}

export async function generateBrief(cfg: AppConfig, event: CalendarEvent): Promise<{ brief: ShootBrief; outputDir: string; debug: Record<string, unknown> }> {
  const { deal, debug } = extractDealContext(event.description, cfg.paths.deals_path);
  if (!deal.deal_id || deal.deal_id === "UNKNOWN") {
    throw new Error("Missing deal_id. Add 'deal_id: ...' to event description or ensure deals.json has the referenced deal.");
  }

  const promise = choosePromiseToken(deal);
  const hookOut = runDemoHookOptimizer({ deal_promise: promise, topic: event.summary });
  const quentinOut = runQuentinLite({ deal_promise: promise, address: deal.address });

  const youtube_title = `${promise} — Full Deal Breakdown`;
  const thumbnail_concept = `Creator pointing at proof of '${promise}' with clear on-screen term`;

  const do_not_leave_checklist = [
    `Say the promise in one sentence: '${promise}'.`,
    "Capture the single strongest proof shot (document/term/feature) without sensitive data.",
    "Record one vertical shock statement version of the promise.",
    "Record one vertical 'how it works' explanation under 10 seconds.",
  ];

  const briefCandidate: ShootBrief = {
    event,
    deal,
    youtube_title,
    thumbnail_concept,
    hook_variants: hookOut.hooks.slice(0, 3),
    intro_rewrite_0_30s: hookOut.intro_rewrite_0_30s,
    shot_list: quentinOut.shot_list,
    talking_points: quentinOut.talking_points,
    do_not_leave_checklist,
    generated_at: deterministicGeneratedAt(event.start),
  };

  const brief = validateShootBrief(briefCandidate);

  const date = event.start.slice(0, 10);
  const outDir = path.join(cfg.paths.outputs_dir, date, event.id);
  ensureDir(outDir);

  writeJson(path.join(outDir, "shoot_brief.json"), brief);
  writeText(path.join(outDir, "shoot_brief.md"), renderMarkdown(brief));
  writeText(path.join(outDir, "capture_checklist.txt"), renderCaptureChecklist(brief));

  return { brief, outputDir: outDir, debug };
}
