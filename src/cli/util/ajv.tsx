import Ajv = require("ajv");
import chalk from "chalk";
import * as fs from "fs";

export function formatErrorMessage(path: string, validate: Ajv.ValidateFunction): string {
  return `Invalid config ${path}, ${validate
    .errors!.map(e => (e.message !== undefined ? chalk`> {red ${e.message}}` : ""))
    .join("\n")}`;
}

export function readFileOrThrow(path: string, validate: Ajv.ValidateFunction): object {
  const config = JSON.parse(fs.readFileSync(path, "utf8"));
  if (validate(config)) {
    return config;
  } else {
    throw new Error(formatErrorMessage(path, validate));
  }
}
