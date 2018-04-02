import "jest";
import * as path from "path";
import * as config from "../config";

describe(config.createPrettierConfig.name, () => {
  it("reads parent package.json", () =>
    expect(
      config.createPrettierConfig(path.join(__dirname, "examples", "prettier-config-package-json", "src", "index.js"))
    ).resolves.toMatchObject({ printWidth: 111 }));

  it("reads sibling package.json", () =>
    expect(
      config.createPrettierConfig(path.join(__dirname, "examples", "prettier-config-package-json", "package.json"))
    ).resolves.toMatchObject({ printWidth: 111 }));

  it("reads child package.json", () =>
    expect(
      config.createPrettierConfig(path.join(__dirname, "examples", "prettier-config-package-json"))
    ).resolves.toMatchObject({ printWidth: 111 }));

  it("reads sibling .prettierrc", () =>
    expect(
      config.createPrettierConfig(path.join(__dirname, "examples", "prettier-config-prettierrc", "index.js"))
    ).resolves.toMatchObject({ printWidth: 111 }));

  it("reads child .prettierrc", () =>
    expect(config.createPrettierConfig(path.join(__dirname, "examples", "prettier-config-prettierrc"))).resolves.toMatchObject({
      printWidth: 111
    }));

  it("reads parent .prettierrc", () =>
    expect(
      config.createPrettierConfig(path.join(__dirname, "examples", "prettier-config-parent-prettierrc", "src", "index.js"))
    ).resolves.toMatchObject({ printWidth: 111 }));
});

describe(config.createConfig.name, () => {
  it("creates implicit config", () =>
    expect(config.createConfig(path.join(__dirname, "examples", "config-implicit"))).resolves.toMatchObject({}));

  it("throws on invalid config (unknown properties)", () =>
    expect(config.createConfig(path.join(__dirname, "examples", "config-invalid"))).rejects.toThrowError(
      /should NOT have additional properties/
    ));

  it("valid config", () =>
    expect(config.createConfig(path.join(__dirname, "examples", "config-valid"))).resolves.toMatchObject({
      color: "#CCC",
      prettier: {
        printWidth: 1
      }
    }));
});
