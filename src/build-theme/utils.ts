import { promises as fs } from "fs";
import path from "node:path";
import * as propertiesParser from "properties-parser";
import type { BuildEmailThemeOptions } from "./types.js";

export function toCamelCase(str: string) {
  if (/^[a-z]+([A-Z][a-z]*)*$/.test(str)) {
    return str;
  }

  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}

export function getEmailTemplateFolder(
  opts: BuildEmailThemeOptions,
  themeName: string,
) {
  return path.join(
    opts.keycloakifyBuildDirPath,
    "/resources/theme",
    themeName,
    "email",
  );
}

export async function writeFile(
  filePath: string,
  filename: string,
  content: string,
) {
  await fs.mkdir(filePath, { recursive: true });
  await fs.writeFile(path.join(filePath, filename), content);
}

export async function writePropertiesFile(
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
export function getBaseName(filePath: string) {
  return path.basename(filePath, path.extname(filePath));
}
