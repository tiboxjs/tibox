import fs from "fs";
import os from "os";
import { TaskOptions } from "../libs/options";

export default function extTask(options: TaskOptions): () => Promise<any> {
  return async () => {
    // TODO: 待优化
    console.log(`extTask`);
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
