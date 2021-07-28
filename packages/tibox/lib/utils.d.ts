import debug from "debug";
export declare function slash(p: string): string;
interface DebuggerOptions {
    onlyWhenFocused?: boolean | string;
}
export declare function createDebugger(ns: string, options?: DebuggerOptions): debug.Debugger["log"];
export declare const isWindows: boolean;
export declare function normalizePath(id: string): string;
export declare function isObject(value: unknown): value is Record<string, any>;
export declare function lookupFile(dir: string, formats: string[], pathOnly?: boolean): string | undefined;
export {};
