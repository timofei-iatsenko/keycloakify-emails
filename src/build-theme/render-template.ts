import type {TemplateModule, BuildEmailThemeOptions} from "./types.js";
import {getEmailTemplateFolder, getBaseName, writeFile} from "./utils.js";
import path from "node:path";

/**
 * Execute template for html + plain text and for each locale.
 */
export async function renderTemplate(
  mod: TemplateModule,
  themeName: string,
  opts: BuildEmailThemeOptions,
) {
  const emailThemeFolder = getEmailTemplateFolder(opts, themeName);

  const ftlName = getBaseName(mod.file) + ".ftl";
  const entryPointContent = `<#include "./" + locale + "/${ftlName}">`;

  // write ftl html entrypoint
  await writeFile(
    path.join(emailThemeFolder, "html"),
    ftlName,
    entryPointContent,
  );

  // write ftl text entrypoint
  await writeFile(
    path.join(emailThemeFolder, "text"),
    ftlName,
    entryPointContent,
  );

  for (const locale of opts.locales) {
    for (const type of ["html", "text"] as const) {
      const html = await mod.getTemplate({
        themeName,
        locale,
        plainText: type === "text",
      });

      // write ftl file
      await writeFile(path.join(emailThemeFolder, type, locale), ftlName, html);
    }
  }
}