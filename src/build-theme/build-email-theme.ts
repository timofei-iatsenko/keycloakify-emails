import { promises as fs } from "node:fs";
import path from "node:path";
import * as esbuild from "esbuild";
import { GetMessages, GetSubject, GetTemplate } from "../types.js";
import * as propertiesParser from "properties-parser";
import type { BuildOptions } from "esbuild";

const esbuildOutDir = "./.temp-emails";

type TemplateModule = {
  getTemplate: GetTemplate;
  getSubject: GetSubject;
  file: string;
};

type I18nModule = { getMessages: GetMessages };

/**
 *
 * @param {string} dirPath
 */
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
      throw new Error(`File ${file} does not have an exported function getTemplate`);
    }

    if (!module.getSubject) {
      throw new Error(`File ${file} does not have an exported function getSubject`);
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
    await renderTheme(themeName, modules, i18nFileModule, opts);
  }

  await fs.rm(esbuildOutDirPath, {
    recursive: true,
    force: true,
  });

  console.log("Done! 🚀");
}

function toCamelCase(str: string) {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}

async function renderTheme(
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
    const messages: Record<string, string> = i18nModule.getMessages({
      locale,
      themeName,
    });

    for (const mod of templates) {
      messages[toCamelCase(getBaseName(mod.file)) + "Subject"] = await mod.getSubject({
        locale,
        themeName,
      });
    }

    await writePropertiesFile(
      path.join(emailThemeFolder, "messages"),
      `messages_${locale}.properties`,
      messages,
    );
  }

  await writePropertiesFile(emailThemeFolder, "theme.properties", {
    parent: "base",
    locales: opts.locales.join(","),
  });
}

async function renderTemplate(
  mod: TemplateModule,
  themeName: string,
  opts: BuildEmailThemeOptions,
) {
  const emailThemeFolder = getEmailTemplateFolder(opts, themeName);

  const ftlName = getBaseName(mod.file) + ".ftl";
  const entryPointContent = `<#include "./" + locale + "/${ftlName}">`;

  // write ftl html entrypoint
  await writeFile(path.join(emailThemeFolder, "html"), ftlName, entryPointContent);

  // write ftl text entrypoint
  await writeFile(path.join(emailThemeFolder, "text"), ftlName, entryPointContent);

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

function getEmailTemplateFolder(opts: BuildEmailThemeOptions, themeName: string) {
  return path.join(opts.keycloakifyBuildDirPath, themeName, "email");
}

async function writeFile(filePath: string, filename: string, content: string) {
  await fs.mkdir(filePath, { recursive: true });
  await fs.writeFile(path.join(filePath, filename), content);
}

async function writePropertiesFile(
  path: string,
  filename: string,
  properties: Record<string, string>,
) {
  const editor = propertiesParser.createEditor();
  for (const [key, value] of Object.entries(properties)) {
    editor.set(key, value);
  }

  await writeFile(path, filename, editor.toString());
}
/**
 * get a basename (filename) from a pth without an extension
 * @param filePath
 */
function getBaseName(filePath: string) {
  return path.basename(filePath, path.extname(filePath));
}
