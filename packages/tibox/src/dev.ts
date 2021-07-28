export interface DevOptions {
  watch: boolean;
}

export type ResolvedDevOptions = Required<Omit<DevOptions, "base">>;
