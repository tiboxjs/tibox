export interface DevOptions {
    watch: boolean;
}
export declare type ResolvedDevOptions = Required<Omit<DevOptions, "base">>;
