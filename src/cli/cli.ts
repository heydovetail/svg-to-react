import * as path from "path";
import yargs from "yargs";
import { runner } from "./runner";

export async function main() {
  const { argv } = yargs
    .usage("Usage: svg-to-react [path-to-project-root]")
    .option("_", {
      default: [process.cwd()],
      describe: "Convert SVGs in __svgs__ directories to React components"
    })
    .help();

  if (argv.help) {
    yargs.showHelp();
    process.exit(1);
  }

  const rootPath = argv._.shift()!;

  try {
    await runner(path.join(process.cwd(), rootPath));
  } catch (err) {
    console.error(err.stack);
    process.exit(1);
  }
}
