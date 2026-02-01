import * as fs from 'node:fs';
import * as crypto from 'node:crypto';
import { CalendarEvent } from '../agents/schemas.js';

function getHash(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex').slice(0, 16);
}

function parseDate(val: string): string {
    // Simple YYYYMMDDTHHmmssZ -> ISO
    // Or simply return as-is or format nicer. 
    // Let's assume standard basic format and try to make it ISO 8601
    if (!val) return new Date().toISOString();
    // Quick hack for basic ICS dates
    // 20230101T120000Z
    const m = val.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/);
    if (m) {
        return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`;
    }
    // If date-only: 20230101
    const d = val.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (d) {
        return `${d[1]}-${d[2]}-${d[3]}T00:00:00Z`;
    }
    return val;
}

export function readIcsEvents(icsPath: string, _dateISO?: string): CalendarEvent[] {
    if (!fs.existsSync(icsPath)) return [];
    const content = fs.readFileSync(icsPath, 'utf-8');
    const lines = content.split(/\r?\n/);

    const events: CalendarEvent[] = [];
    let current: Partial<CalendarEvent> & { tempDesc?: string[] } = {};
    let inVEvent = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        // Handle multiline folding (lines start with space)
        while (i + 1 < lines.length && lines[i + 1].startsWith(' ')) {
            line += lines[i + 1].substring(1);
            i++;
        }

        if (line.startsWith('BEGIN:VEVENT')) {
            inVEvent = true;
            current = { tempDesc: [] };
        } else if (line.startsWith('END:VEVENT')) {
            inVEvent = false;
            if (current.summary) { // Minimal valid
                const desc = current.tempDesc?.join('\n') || '';
                // Extract tags
                const tags = (current.summary.match(/\[([A-Z0-9-]+)\]/g) || [])
                    .map(t => t.slice(1, -1));
                const tagsDesc = (desc.match(/\[([A-Z0-9-]+)\]/g) || [])
                    .map(t => t.slice(1, -1));
                const allTags = Array.from(new Set([...tags, ...tagsDesc]));

                events.push({
                    event_id: getHash(current.summary + current.start + current.end + desc),
                    summary: current.summary,
                    description: desc,
                    location: current.location || '',
                    start: current.start || '',
                    end: current.end || '',
                    tags: allTags
                });
            }
        } else if (inVEvent) {
            if (line.startsWith('SUMMARY:')) current.summary = line.substring(8);
            else if (line.startsWith('DESCRIPTION:')) current.tempDesc!.push(line.substring(12)); // Accumulate
            else if (line.startsWith('LOCATION:')) current.location = line.substring(9);
            else if (line.startsWith('DTSTART')) {
                const parts = line.split(':');
                if (parts.length > 1) current.start = parseDate(parts.pop()!);
            }
            else if (line.startsWith('DTEND')) {
                const parts = line.split(':');
                if (parts.length > 1) current.end = parseDate(parts.pop()!);
            }
        }
    }
    return events;
}
