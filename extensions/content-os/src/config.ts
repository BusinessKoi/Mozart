import * as fs from 'node:fs';
import * as path from 'node:path';
import { loadEnvFile } from './util/env.js';
import { parseYaml } from './util/yaml.js';

export interface Config {
    general: {
        timezone: string;
        log_level: string;
    };
    paths: {
        outputs_dir: string;
        deals_path: string;
    };
    calendar: {
        mode: 'ics' | 'google';
        ics_path: string;
        google: {
            mock: boolean;
            mock_events_path: string;
        };
    };
    ctr_gate: {
        keyword_overlap_threshold: number;
    };
    notify: {
        slack_webhook_url?: string;
        smtp_host?: string;
        smtp_port?: number;
        smtp_username?: string;
        smtp_password?: string;
        smtp_from?: string;
        smtp_to?: string;
    };
}

export function loadConfig(configPath: string = 'config.yaml', envPath: string = '.env'): Config {
    loadEnvFile(envPath);

    let rawConfig: any = {};
    if (fs.existsSync(configPath)) {
        const fileContent = fs.readFileSync(configPath, 'utf-8');
        rawConfig = parseYaml(fileContent);
    }

    // Apply defaults & merge
    const config: Config = {
        general: {
            timezone: rawConfig.general?.timezone || 'UTC',
            log_level: rawConfig.general?.log_level || 'INFO',
        },
        paths: {
            outputs_dir: rawConfig.paths?.outputs_dir || 'outputs',
            deals_path: rawConfig.paths?.deals_path || 'data/deals.json',
        },
        calendar: {
            mode: rawConfig.calendar?.mode || 'ics',
            ics_path: rawConfig.calendar?.ics_path || 'calendar.ics',
            google: {
                mock: rawConfig.calendar?.google?.mock ?? true,
                mock_events_path: rawConfig.calendar?.google?.mock_events_path || 'mock_calendar_events.json',
            },
        },
        ctr_gate: {
            keyword_overlap_threshold: rawConfig.ctr_gate?.keyword_overlap_threshold ?? 0.5,
        },
        notify: {
            slack_webhook_url: process.env.SLACK_WEBHOOK_URL || rawConfig.notify?.slack_webhook_url,
            smtp_host: process.env.SMTP_HOST || rawConfig.notify?.smtp_host,
            smtp_port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : (rawConfig.notify?.smtp_port),
            smtp_username: process.env.SMTP_USERNAME || rawConfig.notify?.smtp_username,
            smtp_password: process.env.SMTP_PASSWORD || rawConfig.notify?.smtp_password,
            smtp_from: process.env.SMTP_FROM || rawConfig.notify?.smtp_from,
            smtp_to: process.env.SMTP_TO || rawConfig.notify?.smtp_to,
        },
    };

    return config;
}
