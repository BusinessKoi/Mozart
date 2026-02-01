import { describe, it, expect } from "vitest";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { ingestCalendar } from "../src/calendar/ingest.js";
import { generateBrief } from "../src/brief/generator.js";
describe("output file creation", () => {
    it("creates required files under outputs/YYYY-MM-DD/event_id", async () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "contentos-"));
        const cfg = {
            general: { timezone: "America/New_York", log_level: "INFO" },
            paths: { outputs_dir: path.join(tmp, "outputs"), deals_path: path.join("fixtures", "deals.json") },
            calendar: { mode: "ics", ics_path: path.join("fixtures", "calendar.ics"), google: { mock: true, mock_events_path: "", calendar_id: "", credentials_path: "", token_path: "" } },
            ctr_gate: { keyword_overlap_threshold: 0.25 },
            notify: { slack_webhook_url: "", smtp: { host: "", port: 587, username: "", password: "", from_addr: "", to_addr: "", use_tls: true } }
        };
        const { tagged_events } = await ingestCalendar(cfg, "2026-01-31");
        expect(tagged_events.length).toBe(1);
        const { outputDir } = await generateBrief(cfg, tagged_events[0]);
        expect(fs.existsSync(path.join(outputDir, "shoot_brief.json"))).toBe(true);
        expect(fs.existsSync(path.join(outputDir, "shoot_brief.md"))).toBe(true);
        expect(fs.existsSync(path.join(outputDir, "capture_checklist.txt"))).toBe(true);
        // path contract
        expect(outputDir).toContain(path.join("outputs", "2026-01-31"));
    });
});
