import { AppConfig } from "../config.js";
import { Logger } from "../util/logger.js";
import { notifySlack } from "./slack.js";
import { sendSmtp } from "./email.js";

export async function notify(cfg: AppConfig, logger: Logger, message: string): Promise<void> {
  try {
    if (cfg.notify.slack_webhook_url && cfg.notify.slack_webhook_url.trim()) {
      await notifySlack(cfg.notify.slack_webhook_url, message);
    }
  } catch (e) {
    logger.warn("Slack notification failed", { error: String(e) });
  }

  try {
    const smtp = cfg.notify.smtp;
    if (smtp.host && smtp.to_addr && smtp.from_addr) {
      await sendSmtp(
        {
          host: smtp.host,
          port: smtp.port,
          username: smtp.username,
          password: smtp.password,
          from_addr: smtp.from_addr,
          to_addr: smtp.to_addr,
          use_tls: smtp.use_tls,
        },
        "ContentOS Phase-2 Notification",
        message
      );
    }
  } catch (e) {
    logger.warn("Email notification failed", { error: String(e) });
  }

  if (
    (!cfg.notify.slack_webhook_url || !cfg.notify.slack_webhook_url.trim()) &&
    (!cfg.notify.smtp.host || !cfg.notify.smtp.to_addr || !cfg.notify.smtp.from_addr)
  ) {
    logger.info("Notification (logged only)", { message });
  }
}
