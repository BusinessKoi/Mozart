import { DealContext } from '../agents/schemas.js';
import { loadDeals } from './store.js';

function parseLine(line: string): { key: string; value: string } | null {
    const idx = line.indexOf(':');
    if (idx > 0) {
        return {
            key: line.substring(0, idx).trim().toLowerCase(),
            value: line.substring(idx + 1).trim()
        };
    }
    return null;
}

export function extractDealContext(description: string, dealsPath: string): DealContext {
    const lines = description.split('\n');
    const context: Partial<DealContext> = {};

    // 1. Initial Parse
    for (const line of lines) {
        const parsed = parseLine(line);
        if (parsed) {
            if (parsed.key === 'deal_id') context.deal_id = parsed.value;
            else if (parsed.key === 'promise') context.promise = parsed.value;
            else if (parsed.key === 'topic') context.topic = parsed.value;
            else if (parsed.key === 'address') context.address = parsed.value;
        }
    }

    // 2. Load from store if deal_id present
    if (context.deal_id) {
        const deals = loadDeals(dealsPath);
        const stored = deals[context.deal_id];
        if (stored) {
            // Merge: extracted > stored
            context.promise = context.promise || stored.promise;
            context.topic = context.topic || stored.topic;
            context.address = context.address || stored.address;
        }
    }

    // 3. Defaults / Validation
    if (!context.deal_id) {
        // Fallback if no deal_id found in description
        context.deal_id = "unknown";
    }

    // 4. Compute Tokens
    const promise = context.promise || "";
    const promise_tokens = promise.split(/[;,|]/).map(s => s.trim()).filter(Boolean);

    return {
        deal_id: context.deal_id!,
        promise: promise,
        promise_tokens,
        topic: context.topic || "General Update",
        address: context.address || "TBD",
    };
}
