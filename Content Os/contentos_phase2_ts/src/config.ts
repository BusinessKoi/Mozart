import process from "node:process";
import fs from "node:fs";
import path from "node:path";
import { loadEnvFile } from "./util/env.js";
import { parseSimpleYaml } from "./util/yaml.js";

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export interface AppConfig {
  general: { timezone: string; log_level: LogLevel };
  paths: { outputs_dir: string; deals_path: string };
  calendar: {
    mode: "ics" | "google";
    ics_path: string;
    google: {
      mock: boolean;
      mock_events_path: string;
      calendar_id: string;
      credentials_path: string;
      token_path: string;
    };
  };
  ctr_gate: { keyword_overlap_threshold: number };
  notify: {
    slack_webhook_url: string;
    smtp: {
      host: string;
      port: number;
      username: string;
      password: string;
      from_addr: string;
      to_addr: string;
      use_tls: boolean;
    };
  };
}

function asObj(v: unknown): Record<string, unknown> {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  return {};
}

function asString(v: unknown, d: string): string {
  return typeof v === "string" ? v : d;
}

function asBoolean(v: unknown, d: boolean): boolean {
  return typeof v === "boolean" ? v : d;
}

function asNumber(v: unknown, d: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : d;
}

function asLogLevel(v: unknown, d: LogLevel): LogLevel {
  const s = typeof v === "string" ? v : "";
  return s === "DEBUG" || s === "INFO" || s === "WARN" || s === "ERROR" ? (s as LogLevel) : d;
}

export function loadConfig(configPath = "config.yaml", envPath = ".env"): AppConfig {
  loadEnvFile(envPath);

  const abs = path.resolve(configPath);
  if (!fs.existsSync(abs)) {
    throw new Error(`Config file not found: ${abs}`);
  }

  const rawText = fs.readFileSync(abs, { encoding: "utf-8" });
  const raw = parseSimpleYaml(rawText);

  const general = asObj(raw.general);
  const pathsObj = asObj(raw.paths);
  const cal = asObj(raw.calendar);
  const google = asObj(asObj(cal.google));
  const ctr = asObj(raw.ctr_gate);
  const notifyObj = asObj(raw.notify);
  const smtp = asObj(notifyObj.smtp);

  const cfg: AppConfig = {
    general: {
      timezone: asString(general.timezone, "America/New_York"),
      log_level: asLogLevel(general.log_level, "INFO"),
    },
    paths: {
      outputs_dir: asString(pathsObj.outputs_dir, "outputs"),
      deals_path: asString(pathsObj.deals_path, "deals.json"),
    },
    calendar: {
      mode: (asString(cal.mode, "ics") === "google" ? "google" : "ics"),
      ics_path: asString(cal.ics_path, "calendar.ics"),
      google: {
        mock: asBoolean(google.mock, true),
        mock_events_path: asString(google.mock_events_path, "mock_calendar_events.json"),
        calendar_id: asString(google.calendar_id, ""),
        credentials_path: asString(google.credentials_path, ""),
        token_path: asString(google.token_path, ""),
      },
    },
    ctr_gate: {
      keyword_overlap_threshold: asNumber(ctr.keyword_overlap_threshold, 0.25),
    },
    notify: {
      slack_webhook_url: asString(notifyObj.slack_webhook_url, ""),
      smtp: {
        host: asString(smtp.host, ""),
        port: asNumber(smtp.port, 587),
        username: asString(smtp.username, ""),
        password: asString(smtp.password, ""),
        from_addr: asString(smtp.from_addr, ""),
        to_addr: asString(smtp.to_addr, ""),
        use_tls: asBoolean(smtp.use_tls, true),
      },
    },
  };

  // env overrides
  const slack = process.env.SLACK_WEBHOOK_URL;
  if (slack && slack.trim()) cfg.notify.slack_webhook_url = slack.trim();
  const smtpHost = process.env.SMTP_HOST;
  if (smtpHost && smtpHost.trim()) cfg.notify.smtp.host = smtpHost.trim();
  const smtpPort = process.env.SMTP_PORT;
  if (smtpPort && smtpPort.trim()) {
    const n = Number(smtpPort);
    if (!Number.isFinite(n)) throw new Error("Invalid SMTP_PORT");
    cfg.notify.smtp.port = n;
  }
  const user = process.env.SMTP_USERNAME;
  if (user && user.trim()) cfg.notify.smtp.username = user.trim();
  const pass = process.env.SMTP_PASSWORD;
  if (pass && pass.trim()) cfg.notify.smtp.password = pass.trim();
  const from = process.env.SMTP_FROM;
  if (from && from.trim()) cfg.notify.smtp.from_addr = from.trim();
  const to = process.env.SMTP_TO;
  if (to && to.trim()) cfg.notify.smtp.to_addr = to.trim();

  // validate threshold bounds
  if (cfg.ctr_gate.keyword_overlap_threshold < 0 || cfg.ctr_gate.keyword_overlap_threshold > 1) {
    throw new Error("ctr_gate.keyword_overlap_threshold must be between 0 and 1");
  }

  return cfg;
}
