import fs from "node:fs";
import crypto from "node:crypto";
import { CalendarEvent, Tag, Tags, validateCalendarEvent } from "../agents/schemas.js";

const TAG_RE = /\[(ON-SITE|FILM|PROPERTY|PACE)\]/gi;

export function parseTags(summary: string, description: string): Tag[] {
  const found = new Set<string>();
  const text = `${summary ?? ""}\n${description ?? ""}`;
  let m: RegExpExecArray | null;
  while ((m = TAG_RE.exec(text)) !== null) {
    found.add(m[1].toUpperCase());
  }
  const out: Tag[] = [];
  for (const t of Tags) {
    if (found.has(t)) out.push(t);
  }
  return out;
}

function stableEventId(summary: string, start: string, end: string, description: string): string {
  const payload = `${summary}|${start}|${end}|${description}`;
  const h = crypto.createHash("sha256").update(payload).digest("hex");
  return h.slice(0, 16);
}

function unfoldLines(ics: string): string[] {
  const raw = ics.split(/\r?\n/);
  const out: string[] = [];
  for (const line of raw) {
    if (line.startsWith(" ") || line.startsWith("\t")) {
      // continuation
      const prev = out.pop() ?? "";
      out.push(prev + line.trimStart());
    } else {
      out.push(line);
    }
  }
  return out;
}

function parseIcsDateTime(v: string): string {
  // Supports YYYYMMDDTHHmmssZ or YYYYMMDDTHHmmss
  const m = v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
  if (!m) throw new Error(`Unsupported ICS datetime: ${v}`);
  const iso = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}.000${m[7] ? "Z" : "Z"}`;
  return iso;
}

export async function readIcsEvents(icsPath: string, targetDateISO: string): Promise<CalendarEvent[]> {
  if (!fs.existsSync(icsPath)) throw new Error(`ICS file not found: ${icsPath}`);
  const text = fs.readFileSync(icsPath, { encoding: "utf-8" });
  const lines = unfoldLines(text);

  const out: CalendarEvent[] = [];
  let inEvent = false;
  let ev: Record<string, string> = {};

  for (const line of lines) {
    if (line.trim() === "BEGIN:VEVENT") {
      inEvent = true;
      ev = {};
      continue;
    }
    if (line.trim() === "END:VEVENT") {
      if (inEvent) {
        const summary = ev["SUMMARY"] ?? "";
        const description = (ev["DESCRIPTION"] ?? "").replace(/\\n/g, "\n");
        const location = ev["LOCATION"] ?? "";
        const startRaw = ev["DTSTART"] ?? "";
        const endRaw = ev["DTEND"] ?? "";
        if (!startRaw || !endRaw) {
          inEvent = false;
          continue;
        }
        const start = parseIcsDateTime(startRaw);
        const end = parseIcsDateTime(endRaw);
        if (start.slice(0, 10) === targetDateISO) {
          const tags = parseTags(summary, description);
          const id = stableEventId(summary, start, end, description);
          const event = validateCalendarEvent({ id, summary, description, location, start, end, tags });
          out.push(event);
        }
      }
      inEvent = false;
      continue;
    }

    if (!inEvent) continue;
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const rawKey = line.slice(0, idx);
    const key = rawKey.split(";")[0].trim().toUpperCase();
    const val = line.slice(idx + 1);
    ev[key] = val;
  }

  return out;
}
