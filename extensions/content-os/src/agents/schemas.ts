export interface CalendarEvent {
    event_id: string;
    summary: string;
    description: string;
    location: string;
    start: string; // ISO
    end: string; // ISO
    tags: string[];
}

export interface DealContext {
    deal_id: string;
    promise: string;
    promise_tokens: string[];
    topic: string;
    address: string;
    talking_points?: string[];
    [key: string]: any;
}

export interface DemoHookOptimizerOutput {
    hooks: string[];
    intro_rewrite: string;
    structural_recommendations: string[];
}

export interface QuentinLiteOutput {
    shot_list: string[];
    talking_points: string[];
    script_outline: string[];
}

export interface ShootBrief {
    event_id: string;
    generated_at: string;
    deal_context: DealContext;
    hooks: DemoHookOptimizerOutput;
    quentin: QuentinLiteOutput;
    capture_checklist: string[];
}

export interface CTRGateReport {
    pass: boolean;
    confidence_score: number;
    checks: {
        promise_token_present: boolean;
        thumbnail_overlap: boolean;
        hook_promise_match: boolean;
    };
    fixes?: {
        rewritten_titles: string[];
        thumbnail_text_overlays: string[];
        revised_hook_lines: string[];
    };
}

export function validateCalendarEvent(e: any): e is CalendarEvent {
    return typeof e.event_id === 'string' && typeof e.summary === 'string' && typeof e.start === 'string';
}

export function validateDealContext(d: any): d is DealContext {
    return typeof d.deal_id === 'string' && typeof d.promise === 'string' && Array.isArray(d.promise_tokens);
}

export function validateShootBrief(b: any): b is ShootBrief {
    return validateDealContext(b.deal_context) && b.hooks && b.quentin;
}

export function validateCtrGateReport(r: any): r is CTRGateReport {
    return typeof r.pass === 'boolean' && typeof r.confidence_score === 'number';
}
