import chalk from "chalk";
import { stopwatch } from "./stopwatch";

export interface Logger {
  write: (text: string) => void;
}

export async function logTask(name: string, task: () => Promise<void>, logger: Logger) {
  logger.write(chalk`{yellow >} ${name}`);
  const duration = await stopwatch(task);
  logger.write(chalk`\r{green ✔ ${name}} {grey (${`${duration}`}ms)}\n`);
}
