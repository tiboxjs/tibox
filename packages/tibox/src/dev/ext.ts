import fs from "fs-extra";

import os from "os";
import { TaskOptions } from "../libs/options";

export default function extTask(options: TaskOptions): () => Promise<any> {
  return async () => {
    // TODO: 待优化
    await fs.ensureDir(options.destDir);
    console.log(`哈啊哈哈哈哈哈`);
    const stream = fs.createWriteStream(`${options.destDir}/ext.js`);
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
