import { readJson } from '../util/fs.js';

export interface DealRecord {
    deal_id: string;
    promise?: string;
    topic?: string;
    address?: string;
    [key: string]: any;
}

export function loadDeals(dealsPath: string): Record<string, DealRecord> {
    try {
        return readJson<Record<string, DealRecord>>(dealsPath);
    } catch (err) {
        return {};
    }
}
