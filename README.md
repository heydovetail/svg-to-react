# @heydovetail/svg-to-react

Generate React components from SVG images.

![NPM version](https://img.shields.io/npm/v/@heydovetail/svg-to-react.svg)
![CircleCI badge](https://circleci.com/gh/heydovetail/svg-to-react.svg?&style=shield&circle-token=725b76ea98f40ff114fede5bb20035465ae8a26f)
[![Greenkeeper badge](https://badges.greenkeeper.io/heydovetail/svg-to-react.svg)](https://greenkeeper.io/)

# Features

* Props for `width`, `height`, and `currentColor`
* SVG scale preserved via `viewport`
* Importable components with TypeScript or JavaScript
* Modules formatted via [Prettier](https://github.com/prettier/prettier)
* `pkg.module` ES module distribution
* `pkg.main` CJS module distribution
* Minimal bundle size
* CLI

# Usage

`svg-to-react` will search a directory tree for `__svgs__` folders containing
SVG files (files with an `.svg` extension). For each file, a TypeScript module
will be created in the parent directory containing a React component for the SVG.

```
src/
..
FILL IN
```

# Configuration (`.config.json`)

A `.config.json` file in `__svgs__` can be used to provide configuration.

## `color` (optional)

**Example:** Specify that the color "#000000" should be overiddable via the `color` prop.

```json
{
  "color": "#000000"
}
```

## `moduleNameTemplate` (optional)

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
