import crypto from "node:crypto";
import { DemoHookOptimizerOutput, QuentinLiteOutput } from "./schemas.js";

function stableSeed(parts: string[]): number {
  const h = crypto.createHash("sha256").update(parts.join("|")).digest("hex");
  return parseInt(h.slice(0, 8), 16);
}

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

export function runDemoHookOptimizer(inputs: Record<string, unknown>): DemoHookOptimizerOutput {
  const promise = String(inputs["deal_promise"] ?? "a deal most people miss").trim() || "a deal most people miss";
  const topic = String(inputs["topic"] ?? "deal").trim() || "deal";

  const seed = stableSeed([promise, topic]);
  void seed;

  const hooks: [string, string, string, string, string] = [
    `Stop scrolling — this is ${promise}.`,
    `If you think ${topic} is expensive, wait until you see ${promise}.`,
    `I’m about to show you ${promise} — and the catch nobody talks about.`,
    `Here’s how we got ${promise} on a real deal.`,
    `This is exactly what ${promise} looks like in the wild.`,
  ];

  const out: DemoHookOptimizerOutput = {
    hooks,
    intro_rewrite_0_30s:
      `Today we’re breaking down ${promise}. ` +
      `I’ll show the terms, why it works, and the one risk you must understand before copying it.`,
    structural_recommendations: [
      "Open with the promise in first sentence.",
      "Show proof on-screen within 10 seconds.",
      "Explain the mechanism, then the risk, then the takeaway.",
    ],
  };

  assert(out.hooks.length === 5, "DemoHookOptimizerOutput.hooks must be length 5");
  assert(out.intro_rewrite_0_30s.length > 0, "DemoHookOptimizerOutput.intro required");

  return out;
}

export function runQuentinLite(inputs: Record<string, unknown>): QuentinLiteOutput {
  const promise = String(inputs["deal_promise"] ?? "a deal most people miss").trim() || "a deal most people miss";
  const address = String(inputs["address"] ?? "").trim();

  const seed = stableSeed([promise, address]);
  void seed;

  const script_outline = [
    `Hook: State the promise (${promise}).`,
    "Context: What the property/deal is and why it matters.",
    "Terms: Break down price/financing/payment structure in one clear segment.",
    "Mechanism: Why the seller/lender agreed to these terms.",
    "Risks: The 1–2 things that can break the deal.",
    "Close: Who this deal is for and the CTA to the full YouTube breakdown.",
  ];

  const shot_list = [
    "Wide establishing shot of property/street.",
    "On-camera: say the promise in one sentence.",
    "Close-up: show a key document or term on screen (no sensitive data).",
    "Walk-and-talk: why this is rare.",
    "Pointing shot: highlight the proof location/feature.",
    "Cutaway: neighborhood / comps / map screenshot plan.",
    "On-camera: risk statement + mitigation.",
    "Vertical: shock statement version of the promise.",
    "Vertical: how it works in 10 seconds.",
    "Vertical: CTA to full video.",
  ];

  const talking_points = [
    `Promise: ${promise}`,
    "What makes it unusual in today’s market.",
    "The exact number(s): price, time, rate, payment terms.",
    "Why the counterparty accepted it.",
    "What could go wrong and how to defend.",
    "What you’d need to replicate it.",
    "One ethical note / realism check.",
    "CTA: watch the full YouTube breakdown today.",
  ];

  const out: QuentinLiteOutput = { script_outline, shot_list, talking_points };
  assert(out.shot_list.length >= 8, "QuentinLiteOutput.shot_list must be >=8");
  assert(out.talking_points.length >= 8, "QuentinLiteOutput.talking_points must be >=8");
  return out;
}
