import { ShootBrief, CTRGateReport } from '../agents/schemas.js';

function getOverlapScore(text1: string, text2: string): number {
    const t1 = new Set(text1.toLowerCase().match(/\w+/g) || []);
    const t2 = new Set(text2.toLowerCase().match(/\w+/g) || []);
    if (t1.size === 0) return 0;
    let intersection = 0;
    for (const w of t1) {
        if (t2.has(w)) intersection++;
    }
    return intersection / t1.size; // Simple overlap ratio based on t1
}

export function runCtrGate(cfg: any, brief: ShootBrief, outputDir: string): CTRGateReport & { gate_status: "PASS" | "FAIL" } {
    const threshold = cfg.ctr_gate?.keyword_overlap_threshold ?? 0.5;
    const promise = brief.deal_context.promise || "";
    // ... logic same as before ... using new threshold variable

    // Check PROMISE tokens
    const concreteRegex = /(\$\d+|\d+\s*(years|months|days|%)|0%\s*interest|no\s*payments|paid\s*to\s*buy)/i;
    const hasConcretePromise = concreteRegex.test(promise);

    // Check Thumbnail overlap
    const thumbnailDesc = brief.quentin.shot_list[0] || "";
    const overlap = getOverlapScore(promise, thumbnailDesc);
    const thumbnailPass = overlap >= threshold;

    // Check Hook match
    const firstHook = brief.hooks.hooks[0] || "";
    const hookPass = brief.deal_context.promise_tokens.some(token =>
        firstHook.toLowerCase().includes(token.toLowerCase())
    );

    const passed = hasConcretePromise && thumbnailPass && hookPass;

    // Calculate confidence score
    let score = 0;
    if (hasConcretePromise) score += 40;
    if (thumbnailPass) score += 30;
    if (hookPass) score += 30;

    const report: CTRGateReport & { gate_status: "PASS" | "FAIL" } = {
        pass: passed,
        gate_status: passed ? "PASS" : "FAIL",
        confidence_score: score,
        checks: {
            promise_token_present: hasConcretePromise,
            thumbnail_overlap: thumbnailPass,
            hook_promise_match: hookPass
        }
    };

    if (!passed) {
        report.fixes = {
            rewritten_titles: [
                `FIXED: ${promise} (Official)`,
                `URGENT: ${promise} [Explained]`,
                `HOW TO: ${promise}`
            ],
            thumbnail_text_overlays: [
                "STOP DOING THIS",
                "THE SECRET REVEALED"
            ],
            revised_hook_lines: [
                `You need to know about ${brief.deal_context.promise_tokens[0] || "this topic"}.`
            ]
        };
    }

    return report;
}
