import { GetTemplate, GetSubject, GetMessages } from "../types.js";
import type { BuildOptions } from "esbuild";

export type TemplateModule = {
  getTemplate: GetTemplate;
  getSubject: GetSubject;
  file: string;
};
export type I18nModule = { getMessages: GetMessages };

export type BuildEmailThemeOptions = {
  /**
   * Path were your js email templates are stored.
   *
   * Path might be absolute or relative, in case of relative
   * it would be joined with path {@link BuildEmailThemeOptions.cwd}
   *
   * @example
   * ```js
   * "./emails/templates"
   * import.meta.dirname + '/emails/templates'
   * ```
   */
  templatesSrcDirPath: string;
  /**
   * Path were your assets are stored.
   *
   * Path might be absolute or relative, in case of relative
   * it would be joined with path {@link BuildEmailThemeOptions.cwd}
   *
   * @optional
   */
  assetsDirPath?: string;
  /**
   * Path the value of `buildContext.keycloakifyBuildDirPath`
   */
  keycloakifyBuildDirPath: string;

  /**
   * List here all locales you are going to support in your emails.
   *
   * THe build script would be executed for each locale to prerender template.
   *
   * @default [en]
   */
  locales: string[];

  /**
   * Path were i18.ts file is stored.
   *
   * i18n.ts file is needed to override translations for strings which are not presented in emails bodies.
   *
   * Such as required actions, or linkExpirationFormatter messages
   *
   * @optional
   * @example
   * "./emails/i18n.ts"
   */
  i18nSourceFile?: string;

  /**
   * Array of your theme names from keycloakify.
   *
   * You can get this from `buildContext.themeNames`
   */
  themeNames: string[];

  /**
   * Current directory, should always be a root of the project (where vite config is stored)
   *
   * @example
   * import.meta.dirname
   */
  cwd: string;

  /**
   * Options for underlying esbuild. Useful if you want to set additional esbuild plugins.
   *
   * @optional
   */
  esbuild?: BuildOptions;
};
