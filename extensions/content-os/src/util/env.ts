import * as fs from 'node:fs';

export function parseEnv(content: string): Record<string, string> {
    const result: Record<string, string> = {};
    const lines = content.split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
            const key = trimmed.substring(0, eqIdx).trim();
            let value = trimmed.substring(eqIdx + 1).trim();
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            result[key] = value;
        }
    }
    return result;
}

export function loadEnvFile(path: string): void {
    try {
        if (fs.existsSync(path)) {
            const content = fs.readFileSync(path, 'utf-8');
            const parsed = parseEnv(content);
            for (const [k, v] of Object.entries(parsed)) {
                if (!process.env[k]) {
                    process.env[k] = v;
                }
            }
        }
    } catch (err) {
        // Ignore errors for env loading
    }
}
