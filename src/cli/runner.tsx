import * as fs from "fs";
import { createPlan } from "./planner";
import { transform } from "./transform";
import { Logger, logTask } from "./util/logger";

export interface TextFileWriter {
  (path: string, content: string): void;
}

export async function runner(
  rootPath: string,
  writeFile: TextFileWriter = fs.writeFileSync,
  logger: Logger = process.stdout
): Promise<void> {
  const plan = await createPlan(rootPath);

  logger.write(`Generating React components for ${plan.items.length} SVGs:\n`);

  for (const { svgPathRelative, modulePath, config, svgPath } of plan.items) {
    await logTask(
      svgPathRelative,
      async () => {
        const esModule = await transform(fs.readFileSync(svgPath, "utf8"), config);
        writeFile(modulePath, esModule);
      },
      logger
    );
  }
}
