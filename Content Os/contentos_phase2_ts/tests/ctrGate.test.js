import { describe, it, expect } from "vitest";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { runCtrGate } from "../src/ctr/gate.js";
import { ShootBriefSchema } from "../src/agents/schemas.js";
const cfg = {
    general: { timezone: "America/New_York", log_level: "INFO" },
    paths: { outputs_dir: "outputs", deals_path: "deals.json" },
    calendar: { mode: "ics", ics_path: "calendar.ics", google: { mock: true, mock_events_path: "mock_calendar_events.json", calendar_id: "", credentials_path: "", token_path: "" } },
    ctr_gate: { keyword_overlap_threshold: 0.1 },
    notify: { slack_webhook_url: "", smtp: { host: "", port: 587, username: "", password: "", from_addr: "", to_addr: "", use_tls: true } }
};
describe("CTR gate", () => {
    it("passes when title/thumbnail/hooks align", () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "contentos-"));
        const brief = ShootBriefSchema.parse({
            event: {
                id: "evt1",
                summary: "Property Walkthrough",
                description: "[ON-SITE] deal_id: DEAL_123",
                location: "123 Oak",
                start: "2026-01-31T15:00:00.000Z",
                end: "2026-01-31T16:00:00.000Z",
                tags: ["ON-SITE"],
            },
            deal: { deal_id: "DEAL_123", address: "123 Oak", price: 485000, terms: "0% interest for 24 months", promise_tokens: ["0% interest"], notes: "" },
            youtube_title: "0% interest — Full Deal Breakdown",
            thumbnail_concept: "Creator pointing at proof of '0% interest' with clear on-screen term",
            hook_variants: [
                "Stop scrolling — this is 0% interest.",
                "If you think deal is expensive, wait until you see 0% interest.",
                "I’m about to show you 0% interest — and the catch nobody talks about.",
            ],
            intro_rewrite_0_30s: "Intro...",
            shot_list: Array.from({ length: 8 }, (_, i) => `Shot ${i + 1}`),
            talking_points: Array.from({ length: 8 }, (_, i) => `Point ${i + 1}`),
            do_not_leave_checklist: ["a", "b", "c"],
            generated_at: "2026-01-31T00:00:00.000Z",
        });
        const report = runCtrGate(cfg, brief, tmp);
        expect(report.gate_status).toBe("pass");
        expect(fs.existsSync(path.join(tmp, "ctr_gate_report.json"))).toBe(true);
    });
    it("fails and provides fixes when missing promise", () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "contentos-"));
        const brief = ShootBriefSchema.parse({
            event: {
                id: "evt2",
                summary: "Property Walkthrough",
                description: "[ON-SITE] deal_id: DEAL_123",
                location: "123 Oak",
                start: "2026-01-31T15:00:00.000Z",
                end: "2026-01-31T16:00:00.000Z",
                tags: ["ON-SITE"],
            },
            deal: { deal_id: "DEAL_123", address: "123 Oak", price: 485000, terms: "seller financing", promise_tokens: [], notes: "" },
            youtube_title: "Full Deal Breakdown",
            thumbnail_concept: "Generic thumbnail concept",
            hook_variants: ["Stop scrolling.", "You need to see this.", "Here we go."],
            intro_rewrite_0_30s: "Intro...",
            shot_list: Array.from({ length: 8 }, (_, i) => `Shot ${i + 1}`),
            talking_points: Array.from({ length: 8 }, (_, i) => `Point ${i + 1}`),
            do_not_leave_checklist: ["a", "b", "c"],
            generated_at: "2026-01-31T00:00:00.000Z",
        });
        const report = runCtrGate(cfg, brief, tmp);
        expect(report.gate_status).toBe("fail");
        const fixes = report.fixes;
        expect(Array.isArray(fixes.rewritten_titles)).toBe(true);
        expect(fixes.thumbnail_text_overlays[0].split(/\s+/).length).toBeLessThanOrEqual(4);
        expect(typeof fixes.revised_hook_line).toBe("string");
    });
});
