import * as React from "react";

export interface CustomSize {
  width?: number;
  height?: number;
}

export interface Props {
  color?: string;
  size?: number | CustomSize;
}

/**
 * A utility for building SVG components.
 *
 * It’s optimised for performance, both runtime execution and code minification.
 * This is why it takes a `displayName` (to allow DOM reconcilitation) and a
 * render function which takes separate positional arguments (for minification).
 *
 * This SVG components this function creates *never* update in response to prop
 * changes. This is a performance optimisation.
 */
export function svg(
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
