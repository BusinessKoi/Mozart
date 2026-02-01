import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runCtrGate } from '../src/ctr/gate.js';
test('CTR Gate', async () => {
    const goodBrief = {
        deal_context: {
            promise: 'Get 0% interest for 30 days',
            promise_tokens: ['0% interest']
        },
        quentin: {
            shot_list: ['Get 0% interest for 30 days banner']
        },
        hooks: {
            hooks: ['How to get 0% interest today']
        }
    };
    const reportGood = runCtrGate(goodBrief);
    assert.ok(reportGood.pass, 'Good brief should pass');
    assert.ok(reportGood.confidence_score > 80);
    const badBrief = {
        deal_context: {
            promise: 'Just a chat',
            promise_tokens: ['chat']
        },
        quentin: {
            shot_list: ['A puppy']
        },
        hooks: {
            hooks: ['Hello world']
        }
    };
    const reportBad = runCtrGate(badBrief);
    assert.equal(reportBad.pass, false, 'Bad brief should fail');
    assert.ok(reportBad.fixes, 'Should provide fixes');
});
