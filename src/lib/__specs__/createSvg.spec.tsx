import "jest";
import * as React from "react";
import { createSvg } from "../createSvg";

describe(createSvg.name, () => {
  const SVG = createSvg((width, height, color) => <div style={{ width, height, color }} />);

  it("supports string size", () => {
    expect(<SVG size="100%" />).toMatchSnapshot();
  });

  it("supports number size", () => {
    expect(<SVG size={50} />).toMatchSnapshot();
  });
});
