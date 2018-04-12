import "jest";
import * as path from "path";
import * as runner from "../runner";

class TestTextFileWriter {
  public files = new Map<string, string>();

  public constructor(private readonly rootDirectory = __dirname) {}

  public writeSync: runner.TextFileWriter = (filePath, content) => {
    this.files.set(path.relative(this.rootDirectory, filePath), content);
  };
}

class TestLogger {
  public text = "";

  public write = (text: string) => {
    this.text += text;
  };
}

jest.mock("../util/stopwatch", () => ({
  // Mock stopwatch to always return 42 milliseconds
  stopwatch: (fn: () => Promise<void>) => fn().then(() => 42)
}));

describe(runner.runner.name, () => {
  async function test(example: string) {
    const rootDirectory = path.join(__dirname, "examples");
    const fs = new TestTextFileWriter(rootDirectory);
    const logger = new TestLogger();
    await runner.runner(path.join(rootDirectory, example), fs.writeSync, logger);
    expect(fs.files).toMatchSnapshot();
    expect(logger.text).toMatchSnapshot();
  }

  it("project-long-hex-color-equivalence", () => test("project-long-hex-color-equivalence"));
  it("project-no-config", () => test("project-no-config"));
  it("project-short-hex-color-equivalence", () => test("project-short-hex-color-equivalence"));
  it("project-svg-with-ids", () => test("project-svg-with-ids"));
  it("project-with-config", () => test("project-with-config"));
});
