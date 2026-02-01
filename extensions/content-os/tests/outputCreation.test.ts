import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Config } from '../src/config.js';
import { generateBrief } from '../src/brief/generator.js';
import { CalendarEvent } from '../src/agents/schemas.js';

test('Output Creation', async () => {
    const cfg = {
        paths: {
            outputs_dir: path.resolve('test_outputs'),
            deals_path: path.resolve('fixtures/deals.json')
        }
    } as Config;

    const event: CalendarEvent = {
        event_id: 'evt_test',
        summary: 'Test Event',
        description: 'Deal_ID: deal_123',
        start: '2025-01-01T10:00:00Z',
        end: '2025-01-01T11:00:00Z',
        location: 'Studio',
        tags: ['FILM']
    };

    const res = generateBrief(cfg, event, '2025-01-01');

    assert.ok(fs.existsSync(res.outputDir), 'Output dir created');
    assert.ok(fs.existsSync(path.join(res.outputDir, 'shoot_brief.json')), 'JSON created');
    assert.ok(fs.existsSync(path.join(res.outputDir, 'shoot_brief.md')), 'Markdown created');
    assert.ok(fs.existsSync(path.join(res.outputDir, 'capture_checklist.txt')), 'Checklist created');

    // Clean up
    fs.rmSync(res.outputDir, { recursive: true, force: true });
});
