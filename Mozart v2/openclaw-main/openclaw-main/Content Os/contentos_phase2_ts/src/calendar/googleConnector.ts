import { CalendarEvent, validateCalendarEvent } from "../agents/schemas.js";
import { readJson, exists } from "../util/fs.js";

export interface GoogleCalendarConnector {
  listEventsForDate(targetDateISO: string): Promise<CalendarEvent[]>;
}

function asObj(v: unknown): Record<string, unknown> {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  return {};
}

export class MockGoogleCalendarConnector implements GoogleCalendarConnector {
  constructor(private readonly mockPath: string) {}

  async listEventsForDate(targetDateISO: string): Promise<CalendarEvent[]> {
    if (!exists(this.mockPath)) {
      throw new Error(`Mock calendar file not found: ${this.mockPath}`);
    }
    const raw: unknown = readJson<unknown>(this.mockPath);
    const root = asObj(raw);
    const eventsUnknown = root["events"];
    const events = Array.isArray(eventsUnknown) ? eventsUnknown : [];

    const out: CalendarEvent[] = [];
    for (const e of events) {
      const eo = asObj(e);
      const start = String(eo.start ?? "");
      if (start.slice(0, 10) !== targetDateISO) continue;
      out.push(validateCalendarEvent(e));
    }
    return out;
  }
}

export class DisabledGoogleCalendarConnector implements GoogleCalendarConnector {
  async listEventsForDate(_targetDateISO: string): Promise<CalendarEvent[]> {
    throw new Error(
      "Google Calendar OAuth is not implemented in Phase 2. Use calendar.mode=ics or google.mock=true with a mock events file."
    );
  }
}
