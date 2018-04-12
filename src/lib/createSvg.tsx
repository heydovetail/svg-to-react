import * as React from "react";

export type CssValue = number | string;

export interface Size {
  width?: CssValue;
  height?: CssValue;
}

export interface Props {
  color?: string;
  size?: CssValue | Size;
}

/**
 * Build an SVG component
 *
 * Optimised for performance, both runtime execution and code minification. It
 * uses a named component (to enable DOM reconcilitation) and a render function
 * which uses positional arguments (for better minification).
 */
export function createSvg(
  render: (width: CssValue | undefined, height: CssValue | undefined, color: string) => React.ReactNode
) {
  return class SVG extends React.PureComponent<Props> {
    public render() {
      const { color = "currentColor", size = {} } = this.props;
      const width = typeof size === "object" ? size.width : size;
      const height = typeof size === "object" ? size.height : size;
      return <span style={{ lineHeight: 0, display: "block" }}>{render(width, height, color)}</span>;
    }
  };
}
