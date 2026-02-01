
import process from "node:process";

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export interface Logger {
  debug(msg: string, meta?: Record<string, unknown>): void;
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
}

function shouldLog(current: LogLevel, level: LogLevel): boolean {
  const order: Record<LogLevel, number> = { DEBUG: 10, INFO: 20, WARN: 30, ERROR: 40 };
  return order[level] >= order[current];
}

export function createLogger(level: LogLevel): Logger {
  const base = (lvl: LogLevel, msg: string, meta?: Record<string, unknown>) => {
    const payload = {
      ts: new Date().toISOString(),
      level: lvl,
      msg,
      ...(meta ? { meta } : {}),
    };
    const line = JSON.stringify(payload);
    if (lvl === "ERROR") {
      process.stderr.write(line + "\n");
    } else {
      process.stdout.write(line + "\n");
    }
  };

  return {
    debug: (m, meta) => { if (shouldLog(level, "DEBUG")) base("DEBUG", m, meta); },
    info: (m, meta) => { if (shouldLog(level, "INFO")) base("INFO", m, meta); },
    warn: (m, meta) => { if (shouldLog(level, "WARN")) base("WARN", m, meta); },
    error: (m, meta) => { if (shouldLog(level, "ERROR")) base("ERROR", m, meta); },
  };
}
