import * as crypto from 'node:crypto';
import { DemoHookOptimizerOutput, QuentinLiteOutput } from './schemas.js';

function getHash(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex');
}

export function runDemoHookOptimizer(inputs: { topic: string; promise: string }): DemoHookOptimizerOutput {
    const seed = getHash(`${inputs.topic}|${inputs.promise}`);
    const prefix = seed.slice(0, 4);
    return {
        hooks: [
            `Hook 1 (${prefix}): Stop doing it wrong.`,
            `Hook 2 (${prefix}): Start doing it right.`,
            `Hook 3 (${prefix}): The secret to ${inputs.topic}.`,
            `Hook 4 (${prefix}): Why ${inputs.promise} works.`,
            `Hook 5 (${prefix}): Case study: ${inputs.topic}.`
        ],
        intro_rewrite: `In this video, we're maximizing ${inputs.promise} with specific techniques.`,
        structural_recommendations: [
            "Keep intro under 30s",
            "Show proof early",
            "CTA at 70% mark"
        ]
    };
}

export function runQuentinLite(inputs: { topic: string; address: string }): QuentinLiteOutput {
    const seed = getHash(`${inputs.topic}|${inputs.address}`);
    const prefix = seed.slice(0, 4);
    return {
        shot_list: [
            `Wide shot of exterior ${inputs.address}`,
            `Close up of key details`,
            `Host speaking to camera (${prefix})`,
            `B-roll of interior`
        ],
        talking_points: [
            `Point A: ${inputs.topic} basics`,
            `Point B: Location advantage`,
            `Point C: Final thoughts`
        ],
        script_outline: [
            "Intro",
            "Body Paragraph 1",
            "Body Paragraph 2",
            "Conclusion"
        ]
    };
}
