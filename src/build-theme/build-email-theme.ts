import { promises as fs } from "node:fs";
import path from "node:path";
import * as esbuild from "esbuild";
import { GetSubject, GetTemplate } from "../types.js";
import type {
  I18nModule,
  TemplateModule,
  BuildEmailThemeOptions,
} from "./types.js";
import { writePropertiesFile, getEmailTemplateFolder } from "./utils.js";
import { renderMessages } from "./render-messages.js";
import { renderTemplate } from "./render-template.js";
import { pathToFileURL } from "node:url";

const esbuildOutDir = "./.temp-emails";
const kcEmailResourcesDir = "/resources";

async function getTemplates(
  dirPath: string,
  filterTemplate?: (filePath: string) => boolean,
) {
  try {
    // Read all items in the directory
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    // Filter out only files
    return items
      .filter((item) => item.isFile())
      .map((file) => path.join(dirPath, file.name))
      .filter((filePath) => {
        if (!filterTemplate) return true;
        return filterTemplate(filePath);
      });
  } catch (err) {
    console.error(`Error scanning directory: ${(err as Error).message}`);
    throw err;
  }
}

async function bundle(
  entryPoints: string[],
  cwd: string,
  outdir: string,
  opts: BuildEmailThemeOptions,
) {
  // we have to use a bundler to preprocess templates code
  // It's better to not use the same bundling configuration used for the
  // frontend theme, because for email templates there might be a different
  // transpiling settings, such as other jsx-pragma or additional transpilation plugins,
  const result = await esbuild.build({
    entryPoints: entryPoints,
    bundle: true,
    outdir,
    absWorkingDir: cwd,
    platform: "node",
    sourcemap: true,
    packages: "external",
    format: "esm",
    target: "node20",
    ...opts.esbuild,
    metafile: true,
  });

  // collect map of entrypoints -> output files
  // esbuild return paths relative to the CWD
  // https://github.com/evanw/esbuild/issues/338
  return Object.entries(result.metafile.outputs).reduce(
    (acc, [filePath, meta]) => {
      if (meta.entryPoint) {
        // Absolute pathes doesn't work on windows.
        // Have to use `pathToFileURL` to convert it to url
        acc[path.resolve(cwd, meta.entryPoint)] = pathToFileURL(
          path.resolve(cwd, filePath),
        ).toString();
      }
      return acc;
    },
    {} as Record<string, string>,
  );
}

/**
 * Build Keycloak email theme.
 */
export async function buildEmailTheme(opts: BuildEmailThemeOptions) {
  const esbuildOutDirPath = path.join(opts.cwd, esbuildOutDir);
  console.log(`Build emails for ${opts.themeNames.join(", ")} themes`);

  const tpls = await getTemplates(
    path.resolve(opts.cwd, opts.templatesSrcDirPath),
    opts.filterTemplate,
  );

  const entryPoints = [...tpls];

  if (opts.i18nSourceFile) {
    entryPoints.push(path.resolve(opts.cwd, opts.i18nSourceFile));
  }

  const bundled = await bundle(entryPoints, opts.cwd, esbuildOutDirPath, opts);

  console.log(`Discovered templates:`);
  const promises = tpls.map(async (file) => {
    const module = await (import(bundled[file]) as Promise<{
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

  let i18nFileModule: I18nModule | undefined;

  if (opts.i18nSourceFile) {
    i18nFileModule = await (import(
      bundled[path.resolve(opts.cwd, opts.i18nSourceFile)]
    ) as Promise<I18nModule>);

    if (!i18nFileModule.getMessages) {
      throw new Error(
        `File ${opts.i18nSourceFile} does not have an exported function getMessages`,
      );
    }
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
  i18nModule: I18nModule | undefined,
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

  if (opts.assetsDirPath) {
    await fs.cp(
      path.resolve(opts.cwd, opts.assetsDirPath),
      path.join(emailThemeFolder, kcEmailResourcesDir),
      {
        force: true,
        recursive: true,
      },
    );
  }
}
