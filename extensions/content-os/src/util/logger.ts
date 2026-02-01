export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export class Logger {
    constructor(private level: LogLevel = 'INFO') { }

    private shouldLog(level: LogLevel): boolean {
        const levels: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
        return levels.indexOf(level) >= levels.indexOf(this.level);
    }

    private log(level: LogLevel, message: string, data?: any): void {
        if (!this.shouldLog(level)) return;
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            ...(data || {}),
        };
        // Log everything to stderr to keep stdout clean for CLI JSON output
        process.stderr.write(JSON.stringify(entry) + '\n');
    }

    debug(message: string, data?: any) { this.log('DEBUG', message, data); }
    info(message: string, data?: any) { this.log('INFO', message, data); }
    warn(message: string, data?: any) { this.log('WARN', message, data); }
    error(message: string, data?: any) {
        // Write errors to stderr so they don't pollute stdout JSON pipeline if needed,
        // OR just write to stdout as JSON. User requested "JSON-only stdout; JSON error on stderr".
        // Let's write structured JSON to stderr for errors.
        const entry = {
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            message,
            ...(data || {}),
        };
        process.stderr.write(JSON.stringify(entry) + '\n');
    }
}

export const createLogger = (level?: LogLevel) => new Logger(level || 'INFO');
export const logger = new Logger(process.env.LOG_LEVEL as LogLevel || 'INFO');
