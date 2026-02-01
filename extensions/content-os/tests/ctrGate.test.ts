import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runCtrGate } from '../src/ctr/gate.js';
import { ShootBrief } from '../src/agents/schemas.js';

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
    } as ShootBrief;

    const mockCfg = { ctr_gate: { keyword_overlap_threshold: 0.5 } };
    const reportGood = runCtrGate(mockCfg, goodBrief, 'test_out');
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
    } as ShootBrief;

    const reportBad = runCtrGate(mockCfg, badBrief, 'test_out');
    assert.equal(reportBad.pass, false, 'Bad brief should fail');
    assert.ok(reportBad.fixes, 'Should provide fixes');
});
