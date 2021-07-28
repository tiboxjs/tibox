import { InlineConfig } from "../config";
export interface BuildOptions {
}
export interface BuildOutput {
}
/**
 * Bundles the app for production.
 * Returns a Promise containing the build result.
 */
export declare function build(inlineConfig?: InlineConfig): Promise<BuildOutput>;
export declare type ResolvedBuildOptions = Required<Omit<BuildOptions, "base">>;
export declare function resolveBuildOptions(raw?: BuildOptions): ResolvedBuildOptions;
