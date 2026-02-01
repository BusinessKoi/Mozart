// Minimal YAML parser for the subset used by config.example.yaml
// Supports:
// - key: value
// - nested maps via 2-space indentation
// - strings in quotes or unquoted
// - numbers, booleans
// Does NOT support arrays or complex YAML features.

function parseScalar(raw: string): unknown {
  const v = raw.trim();
  if (v === "") return "";
  if ((v.startsWith("\"") && v.endsWith("\"")) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  if (v === "true") return true;
  if (v === "false") return false;
  const n = Number(v);
  if (Number.isFinite(n) && /^-?\d+(\.\d+)?$/.test(v)) return n;
  return v;
}

export function parseSimpleYaml(text: string): Record<string, unknown> {
  const root: Record<string, unknown> = {};
  const stack: Array<{ indent: number; obj: Record<string, unknown> }> = [{ indent: 0, obj: root }];

  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const stripped = line.replace(/#.*/, ""); // strip comments
    if (!stripped.trim()) continue;
    const indent = (stripped.match(/^\s*/)?.[0].length) ?? 0;
    const m = stripped.trim().match(/^([A-Za-z0-9_\-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    const rest = m[2];

    while (stack.length > 1 && indent < stack[stack.length - 1].indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].obj;

    if (rest === "" || rest.trim() === "") {
      const child: Record<string, unknown> = {};
      parent[key] = child;
      stack.push({ indent: indent + 2, obj: child });
    } else {
      parent[key] = parseScalar(rest);
    }
  }

  return root;
}
