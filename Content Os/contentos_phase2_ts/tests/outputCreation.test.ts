import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import type { AppConfig } from "../src/config.js";
import { ingestCalendar } from "../src/calendar/ingest.js";
import { generateBrief } from "../src/brief/generator.js";

test("creates required output files", async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "contentos-"));
  const cfg = ({
    paths: { outputs_dir: path.join(tmp, "outputs"), deals_path: path.join("fixtures", "deals.json") },
    calendar: { mode: "ics", ics_path: path.join("fixtures", "calendar.ics"), google: { mock: true, mock_events_path: "", calendar_id: "", credentials_path: "", token_path: "" } },
    ctr_gate: { keyword_overlap_threshold: 0.25 },
  } as unknown) as AppConfig;

  const { tagged_events } = await ingestCalendar(cfg, "2026-01-31");
  assert.equal(tagged_events.length, 1);

  const { outputDir } = await generateBrief(cfg, tagged_events[0]);
  assert.ok(fs.existsSync(path.join(outputDir, "shoot_brief.json")));
  assert.ok(fs.existsSync(path.join(outputDir, "shoot_brief.md")));
  assert.ok(fs.existsSync(path.join(outputDir, "capture_checklist.txt")));
  assert.ok(outputDir.includes(path.join("outputs", "2026-01-31")));
});
