#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { loadConfig } from './config.js';
import { logger } from './util/logger.js';
import { ingestCalendar } from './calendar/ingest.js';
import { generateBrief } from './brief/generator.js';
import { runCtrGate } from './ctr/gate.js';
import { readJson, writeJson, exists } from './util/fs.js';
import { ShootBrief } from './agents/schemas.js';

async function main() {
    const args = parseArgs({
        options: {
            date: { type: 'string' },
            'event-id': { type: 'string' },
            brief: { type: 'string' },
            config: { type: 'string', default: 'config.yaml' },
            env: { type: 'string', default: '.env' },
        },
        allowPositionals: true,
    });

    const command = args.positionals[0];
    const cfg = loadConfig(args.values.config, args.values.env);

    try {
        if (command === 'ingest-calendar') {
            const date = args.values.date;
            if (!date) throw new Error('Missing --date');
            const result = ingestCalendar(cfg, date);
            console.log(JSON.stringify(result, null, 2));

        } else if (command === 'generate-brief') {
            const date = args.values.date;
            const eventId = args.values['event-id'];
            if (!date || !eventId) throw new Error('Missing --date or --event-id');

            const ingest = ingestCalendar(cfg, date);
            const event = ingest.tagged_events.find(e => e.event_id === eventId);
            if (!event) throw new Error(`Event ${eventId} not found or not tagged`);

            const res = generateBrief(cfg, event, date);
            console.log(JSON.stringify(res, null, 2));

        } else if (command === 'ctr-gate') {
            const briefPath = args.values.brief;
            if (!briefPath) throw new Error('Missing --brief');

            const brief = readJson<ShootBrief>(briefPath);
            const report = runCtrGate(brief, cfg.ctr_gate.keyword_overlap_threshold);

            // Write report next to brief? Prompt says "Write ctr_gate_report.json and return report"
            // inferred location: same dir as brief or outputs/...
            // "outputs/matrix/event_id/ctr_gate_report.json"
            // If briefPath is .../shoot_brief.json, we can put it in .../ctr_gate_report.json
            if (exists(briefPath)) {
                const reportPath = briefPath.replace('shoot_brief.json', 'ctr_gate_report.json');
                writeJson(reportPath, report);
            }

            console.log(JSON.stringify(report, null, 2));

        } else if (command === 'run') {
            // "run --date YYYY-MM-DD"
            // Implies: Ingest -> For each tagged event -> Generate Brief -> CTR Gate -> Report -> Notify
            const date = args.values.date;
            if (!date) throw new Error('Missing --date');

            const ingest = ingestCalendar(cfg, date);
            const results = [];

            for (const event of ingest.tagged_events) {
                const gen = generateBrief(cfg, event, date);
                const report = runCtrGate(gen.brief, cfg.ctr_gate.keyword_overlap_threshold);
                const reportPath = gen.outputDir + '/ctr_gate_report.json';
                writeJson(reportPath, report);

                results.push({
                    event_id: event.event_id,
                    brief_generated: true,
                    ctr_pass: report.pass,
                    output_dir: gen.outputDir
                });
            }
            console.log(JSON.stringify({ date, processed: results.length, details: results }, null, 2));

        } else {
            throw new Error(`Unknown command: ${command}`);
        }
    } catch (err: any) {
        logger.error(err.message);
        process.exit(1);
    }
}

main();
