export function parseYaml(content: string): any {
    const lines = content.split('\n');
    const result: any = {};
    const stack: { indent: number; obj: any }[] = [{ indent: -1, obj: result }];

    for (const line of lines) {
        if (!line.trim() || line.trim().startsWith('#')) continue;

        const indent = line.search(/\S/);
        const trimmed = line.trim();
        const colonIdx = trimmed.indexOf(':');

        if (colonIdx === -1) continue;

        const key = trimmed.substring(0, colonIdx).trim();
        const valueRaw = trimmed.substring(colonIdx + 1).trim();

        let value: any = valueRaw;
        if (valueRaw === '') {
            value = {}; // It's a nested object
        } else if (valueRaw === 'true') value = true;
        else if (valueRaw === 'false') value = false;
        else if (!isNaN(Number(valueRaw))) value = Number(valueRaw);
        else if ((valueRaw.startsWith('"') && valueRaw.endsWith('"')) || (valueRaw.startsWith("'") && valueRaw.endsWith("'"))) {
            value = valueRaw.slice(1, -1);
        }

        // Adjust stack based on indentation
        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
            stack.pop();
        }

        const parent = stack[stack.length - 1].obj;
        parent[key] = value;

        if (typeof value === 'object') {
            stack.push({ indent, obj: value });
        }
    }
    return result;
}
