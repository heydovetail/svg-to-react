import * as h2xCore from "h2x-core";
import jsx from "h2x-plugin-jsx";
import * as prettier from "prettier";
import SVGO = require("svgo");
import { Config } from "./config";

export async function transform(svg: string, config: Config): Promise<string> {
  const svgo = new SVGO({
    plugins: [{ removeTitle: true }, { removeViewBox: false }]
  });
  const svgOptimised = (await svgo.optimize(svg)).data;
  const { svg: svgTransformed, size } = await h2xTransform(svgOptimised, config);
  const tsModule = renderEsModule(svgTransformed, config, size);

  return pretty(tsModule, config.prettier);
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

  const { color: configColor } = config;
  if (configColor !== undefined) {
    // Replace `#726D82` with the `color` prop, so that `currentColor` or
    // another color can be used.
    plugins.push(
      h2xPluginMutateAttr({
        predicate: path => path.node.value.toLowerCase() === configColor.toLowerCase(),
        mutate: path => {
          path.node.litteral = true;
          path.node.value = "color";
        }
      })
    );
  }

  return {
    svg: h2xCore.transform(svg, { plugins }) as string,
    size: {
      width: discoveredWidth,
      height: discoveredHeight
    }
  };
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

interface SniffedSize {
  width: string | number | undefined;
  height: string | number | undefined;
}

//
// ES module template
//
function renderEsModule(code: string, config: Config, size: SniffedSize) {
  const args = [
    size.width === undefined ? "width" : `width = ${JSON.stringify(size.width)}`,
    size.height === undefined ? "height" : `height = ${JSON.stringify(size.height)}`
  ];

  // Only include the `color` argument if it was configured. It's not desirable
  // to *always* include it, as linter errors are raised if it's not used.
  // However if a color has been configured, presumably it should be used in the
  // SVG.
  if (config.color !== undefined) {
    args.push("color");
  }

  return `
// tslint:disable
//
//  This file was generated automatically by @heydovetail/svg-to-react and
//  should not be manually edited.
//
import { createSvg } from "@heydovetail/svg-to-react";
import * as React from 'react'

export default createSvg((${args.join(", ")}) => {
  return ${code};
});
`;
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

function pretty(ts: string, prettierOptions: prettier.Options = {}) {
  return prettier.format(ts, { ...prettierOptions, parser: "typescript" });
}
