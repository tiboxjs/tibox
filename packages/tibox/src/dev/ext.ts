import fs from "fs-extra";

import os from "os";
import path from "path";
import { TaskOptions } from "../libs/options";

export default function extTask(options: TaskOptions): () => Promise<any> {
  return async () => {
    // TODO: 待优化
    await fs.ensureDir(path.resolve(options.destDir, "ext/"));
    const stream = fs.createWriteStream(`${options.destDir}/ext/ext.js`);
    stream.write(
      Buffer.from(
        `module.exports = ${JSON.stringify(
          options.resolvedConfig.ext || {},
          null,
          2
        )}${os.EOL}`
      )
    );
    return stream;
  };
}
