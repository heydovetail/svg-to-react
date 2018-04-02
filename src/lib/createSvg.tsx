import * as React from "react";

export interface Size {
  width?: number;
  height?: number;
}

export interface Props {
  color?: string;
  size?: number | Size;
}

/**
 * Build an SVG component
 *
 * Optimised for performance, both runtime execution and code minification. It
 * uses a named component (to enable DOM reconcilitation) and a render function
 * which uses positional arguments (for better minification).
 */
export function createSvg(
  render: (width: number | string | undefined, height: number | string | undefined, color: string) => React.ReactNode
) {
  return class SVG extends React.PureComponent<Props> {
    public render() {
      const { color = "currentColor", size = {} } = this.props;
      const width = typeof size === "number" ? size : size.width;
      const height = typeof size === "number" ? size : size.height;
      return <span style={{ lineHeight: 0, display: "block" }}>{render(width, height, color)}</span>;
    }
  };
}
