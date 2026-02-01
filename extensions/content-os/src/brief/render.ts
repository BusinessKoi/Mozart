import { ShootBrief } from '../agents/schemas.js';

export function renderMarkdown(brief: ShootBrief): string {
    return `# Shoot Brief: ${brief.deal_context.topic}
**Date:** ${brief.generated_at}
**Event ID:** ${brief.event_id}

## Deal Context
- **Deal ID:** ${brief.deal_context.deal_id}
- **Promise:** ${brief.deal_context.promise}
- **Address:** ${brief.deal_context.address}

## Hook Optimization
### Intro Rewrite
> ${brief.hooks.intro_rewrite}

### Hooks
${brief.hooks.hooks.map(h => `- ${h}`).join('\n')}

### Structural Recommendations
${brief.hooks.structural_recommendations.map(r => `- ${r}`).join('\n')}

## Quentin Production Plan
### Shot List
${brief.quentin.shot_list.map(s => `- [ ] ${s}`).join('\n')}

### Script Outline
${brief.quentin.script_outline.map(o => `1. ${o}`).join('\n')}

### Talking Points
${brief.quentin.talking_points.map(t => `- ${t}`).join('\n')}
`;
}

export function renderCaptureChecklist(brief: ShootBrief): string {
    const parts = [
        `# Capture Checklist: ${brief.event_id}`,
        `LOCATION: ${brief.deal_context.address}`,
        `TOPIC: ${brief.deal_context.topic}`,
        '',
        '## SHOTS',
        ...brief.quentin.shot_list.map(s => `[ ] ${s}`),
        '',
        '## HOOKS TO FILM',
        ...brief.hooks.hooks.map(h => `[ ] ${h}`)
    ];
    return parts.join('\n');
}
