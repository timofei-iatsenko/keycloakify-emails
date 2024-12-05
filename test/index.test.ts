import nodepath from "path";
import fs from "fs/promises";
import { test } from "vitest";
import { compareFolders } from "./utils.js";
import { buildEmailTheme } from "../src/index.js";

async function prepare(caseFolderName: string) {
  const rootDir = nodepath.join(import.meta.dirname, caseFolderName);

  const actualPath = nodepath.join(rootDir, "actual");
  const expectedPath = nodepath.join(rootDir, "expected");

  await fs.rm(actualPath, {
    recursive: true,
    force: true,
  });

  return { rootDir, actualPath, expectedPath };
}

test("Smoke test", async () => {
  const { rootDir, actualPath, expectedPath } = await prepare("smoke");

  await buildEmailTheme({
    cwd: rootDir,
    i18nSourceFile: rootDir + "/fixtures/emails/i18n.ts",
    templatesSrcDirPath: rootDir + "/fixtures/emails/templates",
    locales: ["en", "pl"],
    themeNames: ["vanilla", "chocolate"],
    keycloakifyBuildDirPath: actualPath,
  });

  compareFolders(actualPath, expectedPath);
});
