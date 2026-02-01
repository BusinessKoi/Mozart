// Minimal buffer/process shims if @types/node is missing or conflicting
declare global {
    namespace NodeJS {
        interface ProcessEnv extends Dict<string> { }
    }
}
export { };
