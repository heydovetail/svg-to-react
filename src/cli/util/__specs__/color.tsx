import "jest";
import * as color from "../color";

describe(color.normalizeHex.name, () => {
  function test(input: string, expected: string) {
    expect(color.normalizeHex(input)).toBe(expected);
  }

  it("case-insensitive long", () => test("#AaAAaA", "#aaa"));
  it("case-insensitive short", () => test("#a0C", "#a0c"));
  it("letters and digits ", () => test("#AA44BB", "#a4b"));
  it("incompressable ", () => test("#AbAAAA", "#abaaaa"));
});
