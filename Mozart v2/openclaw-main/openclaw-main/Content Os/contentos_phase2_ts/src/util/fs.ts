import fs from "node:fs";
import path from "node:path";

export function ensureDir(p: string): void {
  fs.mkdirSync(p, { recursive: true });
}

export function writeText(filePath: string, contents: string): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, contents, { encoding: "utf-8" });
}

export function writeJson(filePath: string, obj: unknown): void {
  const text = JSON.stringify(obj, null, 2);
  writeText(filePath, text + "\n");
}

export function readText(filePath: string): string {
  return fs.readFileSync(filePath, { encoding: "utf-8" });
}

export function readJson<T>(filePath: string): T {
  return JSON.parse(readText(filePath)) as T;
}

export function exists(filePath: string): boolean {
  return fs.existsSync(filePath);
}
