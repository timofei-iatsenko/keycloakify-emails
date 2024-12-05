[![License][badge-license]][license]
[![Version][badge-version]][package]
[![Downloads][badge-downloads]][package]

# keycloakify-emails

> esbuild plugin to compile [Lingui](https://lingui.dev) macro

## Description

The plugin will add a babel with `@lingui/babel-plugin-lingui-macro` to your esbuild setup.

Plugin will process only files where macro import is found.

If you already have babel or SWC in your esbuild pipeline consider to use `@lingui/babel-plugin-lingui-macro` or `@lingui/swc-plugin` directly.

## Installation

```sh
npm install --save-dev keycloakify-emails
# yarn add --dev keycloakify-emails
```

## Usage

```ts
import { pluginLinguiMacro } from "keycloakify-emails";

await esbuild.build({
  plugins: [pluginLinguiMacro()],
});
```

## License

This package is licensed under [MIT][license] license.

[license]: https://github.com/timofei-iatsenko/keycloakify-emails/blob/main/LICENSE
[linguijs]: https://github.com/lingui/js-lingui
[package]: https://www.npmjs.com/package/keycloakify-emails
[badge-downloads]: https://img.shields.io/npm/dw/keycloakify-emails.svg
[badge-version]: https://img.shields.io/npm/v/keycloakify-emails.svg
[badge-license]: https://img.shields.io/npm/l/keycloakify-emails.svg
