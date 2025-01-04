import nodepath from "path";
import fs from "fs/promises";
import { test, describe } from "vitest";
import { compareFolders } from "./utils.js";
import { buildEmailTheme } from "../src/index.js";
import path from "node:path";

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
      i18nSourceFile: path.join(rootDir, "fixtures", "emails", "i18n.ts"),
      templatesSrcDirPath: path.join(
        rootDir,
        "fixtures",
        "emails",
        "templates",
      ),
      assetsDirPath: path.join(rootDir, "fixtures", "emails", "assets"),
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
      i18nSourceFile: path.join(".", "fixtures", "emails", "i18n.ts"),
      templatesSrcDirPath: path.join(".", "fixtures", "emails", "templates"),
      assetsDirPath: path.join(".", "fixtures", "emails", "assets"),
      locales: ["en", "pl"],
      themeNames: ["vanilla", "chocolate"],
      keycloakifyBuildDirPath: actualPath,
    });

    compareFolders(actualPath, expectedPath);
  });

  test("Should work without i18n.ts and assets", async () => {
    const { rootDir, actualPath, expectedPath } = await prepare("no-i18n-ts");

    await buildEmailTheme({
      cwd: rootDir,
      templatesSrcDirPath: path.join(".", "fixtures", "emails", "templates"),
      locales: ["en", "pl"],
      themeNames: ["vanilla"],
      keycloakifyBuildDirPath: actualPath,
    });

    compareFolders(actualPath, expectedPath);
  });
});
