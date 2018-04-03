![NPM version](https://img.shields.io/npm/v/@heydovetail/svg-to-react.svg)
![CircleCI badge](https://circleci.com/gh/heydovetail/svg-to-react.svg?style=shield&circle-token=e4858ad05b3f4459ea7ad103d6d84e8623d1a53a)
[![Greenkeeper badge](https://badges.greenkeeper.io/heydovetail/svg-to-react.svg)](https://greenkeeper.io/)
![Module formats](https://img.shields.io/badge/module%20formats-cjs%2C%20esm-green.svg)

Utilising a simple CLI and your existing SVG files, `svg-to-react` allows you to generate optimised React components from your SVG files. With sensible (but overridable defaults), it takes the pain out of integrating SVG images into your React project.

By generating files, `svg-to-react` lets you commit React components to SCM, so you stay in complete control of final production assets.

# Features

* Uses SVGO to minify SVG data
* React props for `size` and `color`
* SVG scale preserved via `viewport`
* Import in [TypeScript](http://www.typescriptlang.org/) or JavaScript
* Modules formatted via [Prettier](https://github.com/prettier/prettier)
* Tiny bundle size
* CLI interface

# Usage

Install via NPM, then run:

```sh
npm install --save-dev @heydovetail/svg-to-react
svg-to-react your/project/path
```

`svg-to-react` will search a directory tree for `__svgs__` folders containing
SVG files (files with an `.svg` extension). For each file, a TypeScript module
will be created in the parent directory containing a React component for the SVG.

Example:

```
$ tree icons/
icons/
└── __svgs__
    ├── arrow-down-mini.svg
    └── arrow-down.svg
$ npm install -g @heydovetail/svg-to-react
$ svg-to-react icons
$ tree icons/
icons/
├── ArrowDown.tsx
├── ArrowDownMini.tsx
└── __svgs__
    ├── arrow-down-mini.svg
    └── arrow-down.svg
```

You can now use those in your React components:

```jsx
import * as React from "react";
import ArrowDown from "./icons/ArrowDown";

export function MyDownButton() {
  return (
    <button>
      <span>
        Down <ArrowDown size={48} color="red"/>
      </span>
    </button>
  );
}
```

## React component props

```ts
interface Props {
    color?: string;
    size?: number | Size;
}

interface Size {
    width?: number;
    height?: number;
}
```

# Configuration (`.config.json`)

A `.config.json` file in `__svgs__` can be used to provide configuration.

## `color` (optional)

**Default:** _omitted_

**Example:** Specify that the color `#000000` should be overridable via the `color` prop.

```json
{
  "color": "#000000"
}
```

## `moduleNameTemplate` (optional)

**Default:** `{capitalizedCamelBaseNameNoExt}.tsx`

**Example:** Specify that modules should use `.tsx` extension.

```json
{
  "moduleNameTemplate": "{capitalizedCamelBaseNameNoExt}.tsx"
}
```

Available variables:

| Variable                        | Example (`foo-Bar_baz.svg`) |
| ------------------------------- | --------------------------- |
| `baseName`                      | `foo-Bar_baz.svg`           |
| `baseNameNoExt`                 | `foo-Bar_baz`               |
| `camelBaseName`                 | `fooBarBaz.svg`             |
| `camelBaseNameNoExt`            | `fooBarBaz`                 |
| `capitalizedCamelBaseName`      | `FooBarBaz.svg`             |
| `capitalizedCamelBaseNameNoExt` | `FooBarBaz`                 |

# NPM script

It's convenient to add a NPM script to your project, so that you can choose
supply the root directoy:

**Example:**

```json
{
  "scripts": {
    "generate:types": "svg-to-react src/"
  }
}
```
