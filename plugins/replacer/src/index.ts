import type { Plugin } from "@tibox/tibox-cli";
import _ from "lodash";

export type PluginConfig = Record<string, string>;

export default function replacer(config: PluginConfig): Plugin {
  const fns = _.map(
    config,
    (value, key) => (code: string) => code.replaceAll(`[[${key}]]`, value),
  );
  return {
    name: "replacer",
    transform(code): string {
      let tmp = code;
      _.forEach(fns, (fn) => {
        tmp = fn(tmp);
      });
      return tmp;
    },
  };
}
