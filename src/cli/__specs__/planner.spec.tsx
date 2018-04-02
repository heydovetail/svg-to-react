import "jest";
import * as path from "path";
import * as planner from "../planner";

describe(planner.createPlan.name, () => {
  it("empty plan for no SVGs", () =>
    expect(planner.createPlan(path.join(__dirname, "examples", "project-empty"))).resolves.toMatchObject({ items: [] }));

  it("plan for SVGs without config", () =>
    expect(planner.createPlan(path.join(__dirname, "examples", "project-no-config"))).resolves.toMatchObject({
      items: [
        {
          config: {
            prettier: {}
          },
          modulePath: path.join(__dirname, "examples", "project-no-config", "Empty.tsx"),
          svgPath: path.join(__dirname, "examples", "project-no-config", "__svgs__", "empty.svg"),
          svgPathRelative: path.join("__svgs__", "empty.svg")
        }
      ]
    }));
});

describe(planner.moduleNameTemplateContext.name, () => {
  it("example", () =>
    expect(planner.moduleNameTemplateContext("foo-Bar_baz.svg")).toMatchObject({
      baseName: "foo-Bar_baz.svg",
      baseNameNoExt: "foo-Bar_baz",
      camelBaseName: "fooBarBaz.svg",
      camelBaseNameNoExt: "fooBarBaz",
      capitalizedCamelBaseName: "FooBarBaz.svg",
      capitalizedCamelBaseNameNoExt: "FooBarBaz"
    }));
});
