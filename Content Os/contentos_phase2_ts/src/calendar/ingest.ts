import process from "node:process";
import { AppConfig } from "../config.js";
import { CalendarEvent, Tags } from "../agents/schemas.js";
import { parseTags, readIcsEvents } from "./icsParser.js";
import { DisabledGoogleCalendarConnector, MockGoogleCalendarConnector } from "./googleConnector.js";

export function filterTaggedEvents(events: CalendarEvent[]): CalendarEvent[] {
  return events.filter((e) => e.tags.some((t) => (Tags as readonly string[]).includes(t)));
}

export async function ingestCalendar(cfg: AppConfig, targetDateISO: string): Promise<{ events: CalendarEvent[]; tagged_events: CalendarEvent[] }> {
  const mode = cfg.calendar.mode;
  let events: CalendarEvent[] = [];

  if (mode === "ics") {
    events = await readIcsEvents(cfg.calendar.ics_path, targetDateISO);
  } else {
    const mockPath = process.env.MOCK_CALENDAR_EVENTS_PATH?.trim() || cfg.calendar.google.mock_events_path;
    const connector = cfg.calendar.google.mock ? new MockGoogleCalendarConnector(mockPath) : new DisabledGoogleCalendarConnector();
    events = await connector.listEventsForDate(targetDateISO);

    // ensure tags parsed if not provided in mock
    events = events.map((ev) => {
      if (!ev.tags || ev.tags.length === 0) {
        return { ...ev, tags: parseTags(ev.summary, ev.description) };
      }
      return ev;
    });
  }

  const tagged = filterTaggedEvents(events);
  return { events, tagged_events: tagged };
}
