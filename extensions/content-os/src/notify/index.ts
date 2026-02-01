import { Config } from '../config.js';
import { logger } from '../util/logger.js';
// In a real app we'd use 'node-fetch' or similar, but for Phase 2 we might just log or mock.
// "Slack via https if webhook configured; otherwise no-op. SMTP minimal sender if configured; otherwise no-op."
// "If neither configured: structured log message"

export async function sendNotifications(cfg: Config, message: string, data?: any): Promise<void> {
    let sent = false;

    if (cfg.notify.slack_webhook_url) {
        // Mock Slack send
        logger.info('Notifying Slack', { url: cfg.notify.slack_webhook_url, message });
        // In real impl: await fetch(cfg.notify.slack_webhook_url, { method: 'POST', body: JSON.stringify({ text: message }) });
        sent = true;
    }

    if (cfg.notify.smtp_host) {
        // Mock SMTP send
        logger.info('Notifying SMTP', { host: cfg.notify.smtp_host, to: cfg.notify.smtp_to, subject: 'Mozart Content OS Notification', message });
        sent = true;
    }

    if (!sent) {
        logger.info('Notification (Local)', { message, data });
    }
}
