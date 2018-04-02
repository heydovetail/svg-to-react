import Ajv = require("ajv");
import * as fs from "fs";
import * as path from "path";
import * as prettier from "prettier";
import * as ajvUtil from "./util/ajv";

export interface Config {
  color?: string;
  moduleNameTemplate?: string;
  prettier?: prettier.Options;
}

const ajv = new Ajv();
const validateConfig = ajv.compile({
  type: "object",
  properties: {
    color: {
      type: "string"
    },
    moduleNameTemplate: {
      type: "string"
    }
  },
  additionalProperties: false
});

export async function createConfig(directoryPath: string): Promise<Config> {
  const prettierConfig = await createPrettierConfig(directoryPath);
  const configPath = path.join(directoryPath, ".config.json");

  // Look for a .config.json file, and merge that in if its available.
  if (fs.existsSync(configPath)) {
    return {
      ...ajvUtil.readFileOrThrow(configPath, validateConfig),
      prettier: prettierConfig
    };
  }

  return { prettier: prettierConfig };
}

export async function createPrettierConfig(fileOrDirectoryPath: string): Promise<prettier.Options> {
  const prettierrc = await prettier.resolveConfig(fileOrDirectoryPath);
  return prettierrc !== null ? prettierrc : {};
}
