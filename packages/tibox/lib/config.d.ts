import { BuildOptions, ResolvedBuildOptions } from "./build";
import { DevOptions } from "./dev";
export interface ConfigEnv {
    command: "build" | "dev";
    product: string;
    mode: string;
}
export declare type UserConfigFn = (env: ConfigEnv) => UserConfig | Promise<UserConfig>;
export declare type UserConfigExport = UserConfig | Promise<UserConfig> | UserConfigFn;
export interface ProductDetailConfig {
    appid: string;
}
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
    products?: Record<string, ProductDetailConfig>;
    appid?: string;
    projectName?: (project: string, product: string, mode: string) => string;
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
}
export interface InlineConfig extends UserConfig {
    configFile?: string | false;
    envFile?: false;
}
export declare type ResolvedConfig = Readonly<Omit<UserConfig, "plugins" | "alias" | "dedupe" | "assetsInclude" | "optimizeDeps"> & {
    configFile: string | undefined;
    inlineConfig: InlineConfig;
    root: string;
    command: "build" | "dev";
    mode: string;
    isProduction: boolean;
    env: Record<string, any>;
    build: ResolvedBuildOptions;
}>;
export declare function resolveConfig(inlineConfig: InlineConfig, command: "build" | "dev", defaultProduct?: string, defaultMode?: string): Promise<ResolvedConfig>;
export declare function mergeConfig(a: Record<string, any>, b: Record<string, any>, isRoot?: boolean): Record<string, any>;
export declare function loadConfigFromFile(configEnv: ConfigEnv, configFile?: string, configRoot?: string): Promise<{
    path: string;
    config: UserConfig;
    dependencies: string[];
} | null>;
export declare function loadEnv(product: string, mode: string, envDir: string, prefix?: string): Record<string, string>;
