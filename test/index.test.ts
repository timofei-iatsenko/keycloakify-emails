import nodepath from "path";
import fs from "fs/promises";
import { test, describe } from "vitest";
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

describe("Smoke Test", () => {
  test("Should work with absolute path", async () => {
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

  test("Should work with relative path", async () => {
    const { rootDir, actualPath, expectedPath } = await prepare("smoke");

    await buildEmailTheme({
      cwd: rootDir,
      i18nSourceFile: "./fixtures/emails/i18n.ts",
      templatesSrcDirPath: "./fixtures/emails/templates",
      locales: ["en", "pl"],
      themeNames: ["vanilla", "chocolate"],
      keycloakifyBuildDirPath: actualPath,
    });

    compareFolders(actualPath, expectedPath);
  });

  test("Should work without i18n.ts", async () => {
    const { rootDir, actualPath, expectedPath } = await prepare("no-i18n-ts");

    await buildEmailTheme({
      cwd: rootDir,
      templatesSrcDirPath: "./fixtures/emails/templates",
      locales: ["en", "pl"],
      themeNames: ["vanilla"],
      keycloakifyBuildDirPath: actualPath,
    });

    compareFolders(actualPath, expectedPath);
  });
});
