import Ajv = require("ajv");
import chalk from "chalk";
import * as fs from "fs";
import * as glob from "glob";
import * as h2xCore from "h2x-core";
import jsx from "h2x-plugin-jsx";
import * as path from "path";
import * as prettier from "prettier";
import SVGO = require("svgo");

const ajv = new Ajv();
const validateConfig = ajv.compile({
  type: "object",
  properties: {
    color: {
      type: "string"
    },
    moduleNamePrefix: {
      type: "string"
    }
  },
  additionalProperties: false
});

async function generate(searchDir = path.resolve(__dirname, "../app/javascript/dovetail")) {
  const svgPaths = glob
    .sync(`**/__svgs__/*.svg`, { cwd: searchDir })
    // Make absolute.
    .map(svgRelPath => path.join(searchDir, svgRelPath));

  console.log(`Generating React components for ${svgPaths.length} SVGs:`);

  for (const svgPath of svgPaths) {
    const taskName = path.relative(process.cwd(), svgPath);
    await logTask(taskName, async () => {
      // Attempt to read a config.
      const config = configForSvgPath(svgPath);
      const tsModuleFileName = config.moduleNamePrefix + filePathToComponentName(path.parse(svgPath).name);
      const svgData = fs.readFileSync(svgPath, "utf8");
      const tsModule = await transform(svgData, config);
      const tsPath = path.resolve(path.join(path.dirname(svgPath), "..", `${tsModuleFileName}.tsx`));
      fs.writeFileSync(tsPath, tsModule);
    });
  }
}

export function main() {
  generate().catch(err => {
    console.error(err.stack);
    process.exit(1);
  });
}

interface Config {
  color?: string;
  width?: string | number;
  height?: string | number;
  moduleNamePrefix: string;
}

function configForSvgPath(svgPath: string): Config {
  const configPath = path.join(path.dirname(svgPath), ".config.json");
  const baseConfig = {
    moduleNamePrefix: ""
  };

  // Look for a .config.json file, and merge that in if its available.
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    if (validateConfig(config)) {
      return {
        ...baseConfig,
        ...config
      };
    } else {
      throw new Error(
        `Invalid config ${configPath}, ${validateConfig
          .errors!.map(e => (e.message !== undefined ? chalk`> {red ${e.message}}` : ""))
          .join("\n")}`
      );
    }
  }

  return baseConfig;
}

//
// Logging
//

async function logTask(name: string, task: () => Promise<void>) {
  const startTime = new Date();
  process.stdout.write(chalk`{yellow >} ${name}`);
  await task();
  const endTime = new Date();
  const duration = endTime.getTime() - startTime.getTime();
  process.stdout.write(chalk`\r{green ✔ ${name}} {grey (${`${duration}`}ms)}\n`);
}

//
// Transform SVG
//

async function transform(svg: string, config: Config): Promise<string> {
  const svgo = new SVGO({
    plugins: [{ removeTitle: true }, { removeViewBox: false }]
  });
  const svgOptimised = (await svgo.optimize(svg)).data;
  const { svg: svgTransformed, width, height } = await h2xTransform(svgOptimised, config);
  const tsModule = renderTypeScript(svgTransformed, {
    ...config,
    width,
    height
  });
  const prettyTsModule = pretty(tsModule);

  return prettyTsModule;
}

async function h2xTransform(svg: string, config: Config) {
  let discoveredWidth: string | number | undefined;
  let discoveredHeight: string | number | undefined;

  const plugins = [
    jsx,
    h2xPluginStripAttribute("xmlns"),
    h2xPluginRemoveComments,

    // Allow the <svg> `width` and `height` values to be overridden by props.
    // The weird condition checking for the presence of `||` is needed to
    // avoid the replacement occurring multiple times, which is how SVGO
    // works.
    //
    // SVGO repeatedly applies the transformation process over the SVG until
    // the output stablises, which wouldn't happen in our case since we're
    // simply appending to the existing attribute value.
    h2xPluginMutateAttr({
      predicate: path =>
        (path.node.name === "width" || path.node.name === "height") &&
        path.node.value.match(/(width|height)/) === null &&
        (path.parent !== undefined && path.parent.name === "svg"),
      mutate: path => {
        path.node.litteral = true;

        // We want to extract the value to use as the default value for the
        // variable. We can save a couple of bytes by encoding numbers *not* as
        // strings. We use `isNaN` to check if it’s safe to do so.
        const value = isNaN(Number(path.node.value)) ? path.node.value : Number(path.node.value);

        switch (path.node.name) {
          case "width":
            discoveredWidth = value;
            break;
          case "height":
            discoveredHeight = value;
            break;
        }

        // Replace the value with a variable name
        path.node.value = path.node.name;
      }
    })
  ];

  if (config.color !== undefined) {
    // Replace `#726D82` with the `color` prop, so that `currentColor` or
    // another color can be used.
    plugins.push(
      h2xPluginMutateAttr({
        predicate: path => path.node.value === config.color,
        mutate: path => {
          path.node.litteral = true;
          path.node.value = "color";
        }
      })
    );
  }

  return {
    svg: h2xCore.transform(svg, { plugins }) as string,
    width: discoveredWidth,
    height: discoveredHeight
  };
}

//
// filePathToComponentName
//

function firstUpperCase(str: string) {
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
}

function hyphenToCamelCase(str: string) {
  return str.replace(/-(.)/g, (_, chr) => chr.toUpperCase());
}

function filePathToComponentName(svgFileName: string) {
  return firstUpperCase(hyphenToCamelCase(svgFileName));
}

//
// prettier
//

const prettierrc = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), { encoding: "utf8" }))
  .prettier as prettier.Options;

function pretty(ts: string) {
  return prettier.format(ts, { ...prettierrc, parser: "typescript" });
}

//
// h2x
//

function h2xPluginStripAttribute(attribute: string) {
  return () => ({
    visitor: {
      JSXAttribute: {
        enter(path: Path<JSXAttribute>) {
          if (path.node.name === attribute) {
            path.remove();
          }
        }
      }
    }
  });
}

function h2xPluginRemoveComments() {
  return () => ({
    visitor: {
      JSXComment: {
        enter(path: Path<{}>) {
          path.remove();
        }
      }
    }
  });
}

function h2xPluginMutateAttr({
  predicate,
  mutate
}: {
  predicate: (path: Path<JSXAttribute>) => boolean;
  mutate: (path: Path<JSXAttribute>) => void;
}) {
  return () => ({
    visitor: {
      JSXAttribute: {
        enter(path: Path<JSXAttribute>) {
          if (predicate(path)) {
            mutate(path);
          }
        }
      }
    }
  });
}

interface Path<T> {
  remove(): void;
  node: T;
  parent?: {
    name: string;
  };
}

interface JSXAttribute {
  name: string;
  value: string;
  litteral: boolean;
  spread: boolean;
}

//
// TypeScript template
//
function renderTypeScript(code: string, config: Config) {
  const args = [
    config.width === undefined ? "width" : `width = ${JSON.stringify(config.width)}`,
    config.height === undefined ? "height" : `height = ${JSON.stringify(config.height)}`
  ];

  // Only include the `color` argument if it was configured. It's not desirable
  // to *always* include it, as linter errors are raised if it's not used.
  // However if a color has been configured, presumably it should be used in the
  // SVG.
  if (config.color !== undefined) {
    args.push("color");
  }

  return `
//
//  This file was automatically generated and should not be edited.
//  To update this file, update the SVG in __svgs__ then run:
//
//      npm run generate:svgs
//
import { svg } from "dovetail/util/svg";
import * as React from 'react'

export default svg((${args.join(", ")}) => {
  return ${code};
});
`;
}
