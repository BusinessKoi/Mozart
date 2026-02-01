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

export function runCtrGate(brief: ShootBrief, threshold: number = 0.5): CTRGateReport {
    const promise = brief.deal_context.promise || "";
    const title = `PROMISE: ${promise}`; // Hypothetical title derived from promise for Phase 2 validation
    // Realistically, the "Title" might be in the hook or explicitly defined.
    // The brief schema doesn't have a "title" field, but the prompt says 
    // "Title must contain...". Let's assume the PROMISE itself acts as the core of the title,
    // OR we look at `hook[0]` as a title candidate, OR we just check the promise tokens against themselves?
    // Re-reading: "Title must contain >=1 concrete promise token... Thumbnail aligns with title promise..."
    // The brief has `hooks`. Let's assume Hooks act as potential Titles.

    // Requirement: "Title must contain >=1 concrete promise token"
    // Let's check if the PROMISE itself contains concrete tokens (regex based on prompt examples).
    // "($X, X years/months/days, X%, “0% interest”, “no payments”, “paid to buy”)"

    const concreteRegex = /(\$\d+|\d+\s*(years|months|days|%)|0%\s*interest|no\s*payments|paid\s*to\s*buy)/i;
    const hasConcretePromise = concreteRegex.test(promise);

    // Requirement: "Thumbnail aligns with title promise via keyword overlap score >= threshold"
    // We don't have thumbnail image analysis here. 
    // BUT, we might have text description of thumbnail? 
    // The schema for `ShootBrief` doesn't strictly have a thumbnail description section outputted by QuentinLite or DemoHook.
    // QuentinLite has `shot_list`. Maybe we check the FIRST shot?
    const thumbnailDesc = brief.quentin.shot_list[0] || "";
    const overlap = getOverlapScore(promise, thumbnailDesc);
    const thumbnailPass = overlap >= threshold;

    // Requirement: "Hook variants first sentence includes promise token"
    // Check the first generated hook.
    const firstHook = brief.hooks.hooks[0] || "";
    // Check if any promise token is in the hook.
    const hookPass = brief.deal_context.promise_tokens.some(token =>
        firstHook.toLowerCase().includes(token.toLowerCase())
    );

    const passed = hasConcretePromise && thumbnailPass && hookPass;

    // Calculate confidence score
    let score = 0;
    if (hasConcretePromise) score += 40;
    if (thumbnailPass) score += 30;
    if (hookPass) score += 30;

    const report: CTRGateReport = {
        pass: passed,
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
