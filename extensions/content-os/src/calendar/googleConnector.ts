import { CalendarEvent, validateCalendarEvent } from '../agents/schemas.js';
import { readJson } from '../util/fs.js';

export function getGoogleEvents(mockPath: string): CalendarEvent[] {
    try {
        const data = readJson<{ events: CalendarEvent[] }>(mockPath);
        if (!data.events || !Array.isArray(data.events)) return [];
        return data.events.filter(validateCalendarEvent);
    } catch (err) {
        return [];
    }
}
