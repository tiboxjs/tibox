/// <reference types="node" />
import { BuildOptions, ResolvedBuildOptions } from "./build";
import { DevOptions } from "./dev";
export interface ConfigEnv {
    command: "build" | "dev";
    product: string;
    mode: string;
}
export declare type UserConfigFn = (env: ConfigEnv) => UserConfig | Promise<UserConfig>;
export declare type UserConfigExport = UserConfig | Promise<UserConfig> | UserConfigFn;
export declare type Plugin = () => NodeJS.ReadWriteStream;
export interface UserConfig {
    /**
     * Project root directory. Can be an absolute path, or a path relative from
     * the location of the config file itself.
     * @default process.cwd()
     */
    root?: string;
    project?: string;
    product?: string;
    mode?: string;
    sourceDir?: string;
    destDir?: string;
    appid?: string;
    projectName?: (project: string, product: string, mode: string) => string;
    ext?: Record<string, any>;
    /**
     * Server specific options, e.g. host, port, https...
     */
    dev?: DevOptions;
    /**
     * Build specific options
     */
    build?: BuildOptions;
    /**
     * Environment files directory. Can be an absolute path, or a path relative from
     * the location of the config file itself.
     * @default root
     */
    envDir?: string;
    plugins?: Plugin[];
}
export interface InlineConfig extends UserConfig {
    configFile?: string | false;
    envFile?: false;
}
export declare type handleDistResult = {
    fileContent: Uint8Array | null;
    dist: string;
};
export declare type gulpHandletype = {
    regExp: RegExp;
    fn: (srcPath: string, distRootPath: string, opts?: Record<string, unknown>) => handleDistResult[] | handleDistResult;
};
export declare type ResolvedConfig = Readonly<Omit<UserConfig, "plugins" | "alias" | "dedupe" | "assetsInclude" | "optimizeDeps"> & {
    configFile: string | undefined;
    inlineConfig: InlineConfig;
    root: string;
    command: "build" | "dev";
    project: string;
    product: string;
    appid: string;
    determinedProjectName: string;
    determinedDestDir: string;
    mode: string;
    isProduction: boolean;
    env: Record<string, any>;
    plugins: Plugin[];
    build: ResolvedBuildOptions;
    replacer?: (key: string) => string;
}>;
export declare function resolveConfig(inlineConfig: InlineConfig, command: "build" | "dev", defaultProduct?: string, defaultMode?: string): Promise<ResolvedConfig>;
export declare function mergeConfig(a: Record<string, any>, b: Record<string, any>, isRoot?: boolean): Record<string, any>;
export declare function loadConfigFromFile(configEnv: ConfigEnv, configFile?: string, configRoot?: string): Promise<{
    path: string;
    config: UserConfig;
    dependencies: string[];
} | null>;
export declare function loadEnv(product: string, mode: string, envDir: string, prefix?: string): Record<string, string>;
