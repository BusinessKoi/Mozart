declare module "node:fs" {
  export function readFileSync(path: string, opts?: { encoding?: string }): string;
  export function writeFileSync(path: string, data: string, opts?: { encoding?: string }): void;
  export function existsSync(path: string): boolean;
  export function mkdirSync(path: string, opts?: { recursive?: boolean }): void;
  export function mkdtempSync(prefix: string): string;
}

declare module "node:path" {
  export function join(...parts: string[]): string;
  export function dirname(p: string): string;
  export function resolve(...parts: string[]): string;
}

declare module "node:process" {
  export const argv: string[];
  export const env: Record<string, string | undefined>;
  export const stdout: { write(s: string): void };
  export const stderr: { write(s: string): void };
  export function exit(code?: number): never;
}

declare module "node:crypto" {
  export interface Hash {
    update(data: string): Hash;
    digest(encoding: "hex"): string;
  }
  export function createHash(algo: "sha256"): Hash;
}

declare module "node:https" {
  export interface RequestOptions {
    method?: string;
    hostname: string;
    path?: string;
    headers?: Record<string, string | number>;
  }
  export interface IncomingMessage {
    statusCode?: number;
    resume(): void;
  }
  export interface ClientRequest {
    on(event: "error", cb: (e: Error) => void): void;
    write(data: string): void;
    end(): void;
  }
  export function request(opts: RequestOptions, cb: (res: IncomingMessage) => void): ClientRequest;
}

declare module "node:net" {
  export interface Socket {
    once(event: "data", cb: (data: Buffer) => void): void;
    once(event: "error", cb: (e: Error) => void): void;
    off(event: "error", cb: (e: Error) => void): void;
    off(event: "data", cb: (data: Buffer) => void): void;
    write(data: string): void;
    end(): void;
    setTimeout(ms: number): void;
  }
  export function createConnection(opts: { host: string; port: number }): Socket;
}

declare module "node:tls" {
  import type { Socket } from "node:net";
  export function connect(opts: { socket: Socket; servername: string }): Socket;
}

declare module "node:os" {
  export function tmpdir(): string;
}

declare class Buffer {
  static from(s: string, enc: "utf-8" | "base64"): Buffer;
  static byteLength(s: string): number;
  toString(enc: "utf-8" | "base64"): string;
}

declare class URL {
  constructor(url: string);
  hostname: string;
  pathname: string;
  search: string;
}

declare module "node:test" {
  export default function test(name: string, fn: () => void | Promise<void>): void;
}

declare module "node:assert/strict" {
  const assert: {
    ok(value: unknown, message?: string): void;
    equal(actual: unknown, expected: unknown, message?: string): void;
    deepEqual(actual: unknown, expected: unknown, message?: string): void;
  };
  export default assert;
}
