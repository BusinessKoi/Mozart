import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as path from 'node:path';
import { readIcsEvents } from '../src/calendar/icsParser.js';

test('ICS Tag Parsing', async (t) => {
    const fixturePath = path.resolve(process.cwd(), 'fixtures/calendar.ics');
    const events = readIcsEvents(fixturePath);

    // Should find 2 events total (based on fixture)
    assert.equal(events.length, 2);

    const tagged = events.find(e => e.summary.includes('[FILM]'));
    assert.ok(tagged, 'Should find the tagged event');

    assert.ok(tagged.tags.includes('FILM'), 'Should extract tag from summary');
    assert.ok(tagged.tags.includes('ON-SITE'), 'Should extract tag from description');

    const untagged = events.find(e => e.summary === 'Untagged Event');
    assert.ok(untagged);
    assert.deepEqual(untagged.tags, [], 'Untagged event should have empty attributes');
});
