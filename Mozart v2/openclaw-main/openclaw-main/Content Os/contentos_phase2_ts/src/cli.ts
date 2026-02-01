import path from "node:path";
import process from "node:process";
import { loadConfig } from "./config.js";
import { createLogger } from "./util/logger.js";
import { ingestCalendar } from "./calendar/ingest.js";
import { generateBrief } from "./brief/generator.js";
import { readJson } from "./util/fs.js";
import { validateShootBrief } from "./agents/schemas.js";
import { runCtrGate } from "./ctr/gate.js";
import { notify } from "./notify/index.js";

type Cmd = "ingest-calendar" | "generate-brief" | "ctr-gate" | "run";

function parseArgs(argv: string[]): { cmd: Cmd | null; opts: Record<string, string> } {
  const [cmd, ...rest] = argv;
  const opts: Record<string, string> = {};
  let i = 0;
  while (i < rest.length) {
    const a = rest[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const val = rest[i + 1];
      if (!val || val.startsWith("--")) {
        opts[key] = "true";
        i += 1;
      } else {
        opts[key] = val;
        i += 2;
      }
    } else {
      i += 1;
    }
  }
  const c = (cmd as Cmd) || null;
  return { cmd: c, opts };
}

function jsonOut(obj: unknown): void {
  process.stdout.write(JSON.stringify(obj, null, 2) + "\n");
}

function jsonErr(message: string, meta?: Record<string, unknown>): void {
  const payload = { error: message, ...(meta ? { meta } : {}) };
  process.stderr.write(JSON.stringify(payload, null, 2) + "\n");
}

async function main(): Promise<number> {
  try {
    const { cmd, opts } = parseArgs(process.argv.slice(2));
    if (!cmd || !["ingest-calendar", "generate-brief", "ctr-gate", "run"].includes(cmd)) {
      jsonErr("Invalid command", {
        allowed: ["ingest-calendar", "generate-brief", "ctr-gate", "run"],
      });
      return 2;
    }

    const configPath = opts["config"] || "config.yaml";
    const envPath = opts["env"] || ".env";
    const cfg = loadConfig(configPath, envPath);
    const logger = createLogger(cfg.general.log_level);

    if (cmd === "ingest-calendar") {
      const date = opts["date"];
      if (!date) {
        jsonErr("Missing --date YYYY-MM-DD");
        return 2;
      }
      const result = await ingestCalendar(cfg, date);
      jsonOut(result);
      return 0;
    }

    if (cmd === "generate-brief") {
      const date = opts["date"];
      const eventId = opts["event-id"];
      if (!date || !eventId) {
        jsonErr("Missing --date or --event-id");
        return 2;
      }

      const { tagged_events } = await ingestCalendar(cfg, date);
      const event = tagged_events.find((e) => e.id === eventId);
      if (!event) {
        jsonErr("Event not found for date", { date, eventId });
        return 4;
      }

      const { brief, outputDir, debug } = await generateBrief(cfg, event);
      await notify(cfg, logger, `Shoot brief generated: ${outputDir}`);
      jsonOut({ output_dir: outputDir, brief, debug });
      return 0;
    }

    if (cmd === "ctr-gate") {
      const briefPath = opts["brief"];
      if (!briefPath) {
        jsonErr("Missing --brief path/to/shoot_brief.json");
        return 2;
      }
      const raw = readJson<unknown>(briefPath);
      const brief = validateShootBrief(raw);
      const outputDir = path.dirname(briefPath);
      const report = runCtrGate(cfg, brief, outputDir);
      await notify(cfg, logger, `CTR gate ${report.gate_status}: ${outputDir}`);
      jsonOut({ output_dir: outputDir, report });
      return 0;
    }

    // run end-to-end
    const date = opts["date"];
    if (!date) {
      jsonErr("Missing --date YYYY-MM-DD");
      return 2;
    }

    const { tagged_events } = await ingestCalendar(cfg, date);
    const results: Array<Record<string, unknown>> = [];

    for (const ev of tagged_events) {
      try {
        const { brief, outputDir } = await generateBrief(cfg, ev);
        const report = runCtrGate(cfg, brief, outputDir);
        results.push({ event_id: ev.id, output_dir: outputDir, gate_status: report.gate_status, confidence_score: report.confidence_score });
      } catch (e) {
        results.push({ event_id: ev.id, error: String(e) });
      }
    }

    jsonOut({ date, total_tagged_events: tagged_events.length, results });
    return 0;
  } catch (e) {
    jsonErr("Unhandled error", { error: String(e) });
    return 1;
  }
}

main().then((code) => process.exit(code));
