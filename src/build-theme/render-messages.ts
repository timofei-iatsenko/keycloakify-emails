import type {
  I18nModule,
  TemplateModule,
  BuildEmailThemeOptions,
} from "./types.js";
import {
  toCamelCase,
  getBaseName,
  writePropertiesFile,
  getEmailTemplateFolder,
} from "./utils.js";
import path from "node:path";

/**
 * Produce `./messages/messages_{locale}.properties` file,
 * executing every template module and i18n.ts
 */
export async function renderMessages(
  i18nModule: I18nModule | undefined,
  templates: TemplateModule[],
  themeName: string,
  locale: string,
  opts: BuildEmailThemeOptions,
) {
  const messages: Record<string, string> = i18nModule
    ? i18nModule.getMessages({
        locale,
        themeName,
      })
    : {};

  for (const mod of templates) {
    messages[toCamelCase(getBaseName(mod.file)) + "Subject"] =
      await mod.getSubject({
        locale,
        themeName,
      });
  }

  await writePropertiesFile(
    path.join(getEmailTemplateFolder(opts, themeName), "messages"),
    `messages_${locale}.properties`,
    messages,
  );
}
