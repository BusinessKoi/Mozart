import { Config } from '../config.js';
import { readIcsEvents } from './icsParser.js';
import { getGoogleEvents } from './googleConnector.js';
import { CalendarEvent } from '../agents/schemas.js';

export interface IngestResult {
    date: string;
    total_events: number;
    tagged_events: CalendarEvent[];
}

export function ingestCalendar(cfg: Config, dateISO: string): IngestResult {
    let allEvents: CalendarEvent[] = [];

    if (cfg.calendar.mode === 'google') {
        if (!cfg.calendar.google.mock) {
            throw new Error('Google OAuth not implemented in Phase 2');
        }
        allEvents = getGoogleEvents(cfg.calendar.google.mock_events_path);
    } else {
        allEvents = readIcsEvents(cfg.calendar.ics_path, dateISO);
    }

    // Filter by date match (simplified for now to just start date string prefix or logic)
    // For Phase 2, we might just ingest everything and let run filter, or filter here.
    // "ingestCalendar --date YYYY-MM-DD" implies filtering.

    const relevantEvents = allEvents.filter(e => e.start.startsWith(dateISO));

    // Filter by tags
    const tagged = relevantEvents.filter(e => e.tags && e.tags.length > 0);

    return {
        date: dateISO,
        total_events: relevantEvents.length,
        tagged_events: tagged
    };
}
