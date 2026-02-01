import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as path from 'node:path';
import { extractDealContext } from '../src/deals/extract.js';
test('Deal Extraction', async () => {
    const dealsPath = path.resolve(process.cwd(), 'fixtures/deals.json');
    // case 1: with deal_id
    const desc1 = `Deal_ID: deal_123\nExtra: Info`;
    const ctx1 = extractDealContext(desc1, dealsPath);
    assert.equal(ctx1.deal_id, 'deal_123');
    assert.equal(ctx1.promise, 'Sell your home for $1M in 30 days', 'Should load promise from store');
    assert.ok(ctx1.promise_tokens[0].includes('$1M'));
    // case 2: override
    const desc2 = `Deal_ID: deal_123\nPromise: New Promise 0%`;
    const ctx2 = extractDealContext(desc2, dealsPath);
    assert.equal(ctx2.promise, 'New Promise 0%');
    // case 3: no deal_id
    const desc3 = `Start: Now`;
    const ctx3 = extractDealContext(desc3, dealsPath);
    assert.equal(ctx3.deal_id, 'unknown');
});
