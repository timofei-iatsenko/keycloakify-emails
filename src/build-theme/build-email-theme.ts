import { promises as fs } from "node:fs";
import path from "node:path";
import * as esbuild from "esbuild";
import { GetSubject, GetTemplate } from "../types.js";
import type {
  I18nModule,
  TemplateModule,
  BuildEmailThemeOptions,
} from "./types.js";
import {
  getBaseName,
  writePropertiesFile,
  getEmailTemplateFolder,
} from "./utils.js";
import { renderMessages } from "./render-messages.js";
import { renderTemplate } from "./render-template.js";

const esbuildOutDir = "./.temp-emails";

async function getTemplates(dirPath: string) {
  try {
    // Read all items in the directory
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    // Filter out only files
    return items
      .filter((item) => item.isFile())
      .map((file) => path.join(dirPath, file.name));
  } catch (err) {
    console.error(`Error scanning directory: ${(err as Error).message}`);
    throw err;
  }
}

async function bundle(
  entryPoints: string[],
  outdir: string,
  opts: BuildEmailThemeOptions,
) {
  // we have to use a bundler to preprocess templates code
  // It's better to not use the same bundling configuration used for the
  // frontend theme, because for email templates there might be a different
  // transpiling settings, such as other jsx-pragma or additional transpilation plugins,
  await esbuild.build({
    entryPoints: entryPoints,
    bundle: true,
    outdir,
    platform: "node",
    sourcemap: true,
    packages: "external",
    format: "esm",
    target: "node20",

    ...opts.esbuild,
  });
}

/**
 * Build Keycloak email theme.
 */
export async function buildEmailTheme(opts: BuildEmailThemeOptions) {
  const esbuildOutDirPath = path.join(opts.cwd, esbuildOutDir);
  console.log(`Build emails for ${opts.themeNames.join(", ")} themes`);

  const tpls = await getTemplates(opts.templatesSrcDirPath);

  // todo: validate that i18nSourceFile file exists and throw error
  // or make it optional?
  await bundle([...tpls, opts.i18nSourceFile], esbuildOutDirPath, opts);

  console.log(`Discovered templates:`);
  const promises = tpls.map(async (file) => {
    const module = await (import(
      path.join(
        esbuildOutDirPath,
        // todo: esbuild change the dist structure based on a common ancestor
        "templates/" + getBaseName(file) + ".js",
      )
    ) as Promise<{
      getTemplate: GetTemplate;
      getSubject: GetSubject;
    }>);

    if (!module.getTemplate) {
      throw new Error(
        `File ${file} does not have an exported function getTemplate`,
      );
    }

    if (!module.getSubject) {
      throw new Error(
        `File ${file} does not have an exported function getSubject`,
      );
    }

    console.log(`- ${file}`);

    return { ...module, file } as TemplateModule;
  });

  const i18nFileModule = await (import(
    path.join(
      import.meta.dirname,
      esbuildOutDir,
      getBaseName(opts.i18nSourceFile) + ".js",
    )
  ) as Promise<I18nModule>);

  if (!i18nFileModule.getMessages) {
    throw new Error(
      `File ${opts.i18nSourceFile} does not have an exported function getMessages`,
    );
  }

  const modules = await Promise.all(promises);

  for (const themeName of opts.themeNames) {
    // i'm intentionally doing this sequentially to avoid
    // concurrency during templates rendering
    await renderThemeVariant(themeName, modules, i18nFileModule, opts);
  }

  await fs.rm(esbuildOutDirPath, {
    recursive: true,
    force: true,
  });

  console.log("Done! 🚀");
}

async function renderThemeVariant(
  themeName: string,
  templates: TemplateModule[],
  i18nModule: I18nModule,
  opts: BuildEmailThemeOptions,
) {
  const emailThemeFolder = getEmailTemplateFolder(opts, themeName);

  for (const mod of templates) {
    await renderTemplate(mod, themeName, opts);
  }

  for (const locale of opts.locales) {
    await renderMessages(i18nModule, templates, themeName, locale, opts);
  }

  await writePropertiesFile(emailThemeFolder, "theme.properties", {
    parent: "base",
    locales: opts.locales.join(","),
  });
}
