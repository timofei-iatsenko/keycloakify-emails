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
   * "./emails/templates"
   */
  templatesSrcDirPath: string;
  keycloakifyBuildDirPath: string;

  /**
   * @default [en]
   */
  locales: string[];

  /**
   * "./emails/i18n.ts"
   */
  i18nSourceFile: string;
  themeNames: string[];

  cwd: string;
  esbuild?: BuildOptions;
};
