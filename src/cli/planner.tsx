import * as glob from "glob";
import memoize = require("lodash.memoize");
import * as path from "path";
import { Config, createConfig } from "./config";
import { renderTextTemplate } from "./util/renderTextTemplate";
import * as text from "./util/text";

export interface PlanItem {
  svgPath: string;
  svgPathRelative: string;
  modulePath: string;
  config: Config;
}

export interface Plan {
  items: PlanItem[];
}

export async function createPlan(rootDirectory: string): Promise<Plan> {
  const getConfig = memoize(createConfig);
  const svgPaths = glob
    .sync(`**/__svgs__/*.svg`, { cwd: rootDirectory })
    // Make absolute.
    .map(svgRelPath => path.join(rootDirectory, svgRelPath));

  const items = [];
  for (const svgPath of svgPaths) {
    const config = await getConfig(path.dirname(svgPath));
    const svgDirectory = path.dirname(svgPath);
    const moduleDirectory = path.dirname(svgDirectory);
    const { moduleNameTemplate = "{capitalizedCamelBaseNameNoExt}.tsx" } = config;

    items.push({
      svgPath: svgPath,
      svgPathRelative: path.relative(rootDirectory, svgPath),
      modulePath: path.join(moduleDirectory, renderTextTemplate(moduleNameTemplate, moduleNameTemplateContext(svgPath))),
      config
    });
  }

  return { items };
}

export function moduleNameTemplateContext(filePath: string): { [name: string]: string } {
  const baseName = path.basename(filePath);
  const baseNameNoExt = path.basename(filePath, ".svg");
  const camelBaseName = text.hyphenToCamelCase(baseName);
  const camelBaseNameNoExt = text.hyphenToCamelCase(baseNameNoExt);
  const capitalizedCamelBaseName = text.firstUpperCase(camelBaseName);
  const capitalizedCamelBaseNameNoExt = text.firstUpperCase(camelBaseNameNoExt);

  return {
    baseName,
    baseNameNoExt,
    camelBaseName,
    camelBaseNameNoExt,
    capitalizedCamelBaseName,
    capitalizedCamelBaseNameNoExt
  };
}
