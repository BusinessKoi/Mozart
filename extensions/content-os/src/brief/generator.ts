import * as path from 'node:path';
import { Config } from '../config.js';
import { CalendarEvent, ShootBrief, validateShootBrief } from '../agents/schemas.js';
import { extractDealContext } from '../deals/extract.js';
import { runDemoHookOptimizer, runQuentinLite } from '../agents/wrappers.js';
import { renderMarkdown, renderCaptureChecklist } from './render.js';
import { writeJson, writeText, ensureDir } from '../util/fs.js';

export interface GenerateResult {
    brief: ShootBrief;
    outputDir: string;
}

export function generateBrief(cfg: Config, event: CalendarEvent, dateISO: string): GenerateResult {
    // 1. Context
    const dealContext = extractDealContext(event.description, cfg.paths.deals_path);
    dealContext.topic = event.summary; // Override topic with event summary if needed or use as default

    // 2. Wrappers
    const hooks = runDemoHookOptimizer({ topic: dealContext.topic, promise: dealContext.promise });
    const quentin = runQuentinLite({ topic: dealContext.topic, address: dealContext.address });

    // 3. Assemble Brief
    const brief: ShootBrief = {
        event_id: event.event_id,
        generated_at: event.start, // Deterministic based on event time
        deal_context: dealContext,
        hooks,
        quentin,
        capture_checklist: [] // Will be derived or just stored
    };

    if (!validateShootBrief(brief)) {
        throw new Error(`Generated brief failed validation for event ${event.event_id}`);
    }

    // 4. Output
    // outputs/YYYY-MM-DD/event_id/
    const dateDir = event.start.split('T')[0]; // YYYY-MM-DD
    const outputDir = path.join(cfg.paths.outputs_dir, dateDir, event.event_id);
    ensureDir(outputDir);

    writeJson(path.join(outputDir, 'shoot_brief.json'), brief);
    writeText(path.join(outputDir, 'shoot_brief.md'), renderMarkdown(brief));
    writeText(path.join(outputDir, 'capture_checklist.txt'), renderCaptureChecklist(brief));

    return { brief, outputDir };
}
