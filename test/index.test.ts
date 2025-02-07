import nodepath from "path";
import fs from "fs/promises";
import { test, describe, expect } from "vitest";
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
      assetsDirPath: rootDir + "/fixtures/emails/assets",
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
      assetsDirPath: "./fixtures/emails/assets",
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
      templatesSrcDirPath: "./fixtures/emails/templates",
      locales: ["en", "pl"],
      themeNames: ["vanilla"],
      keycloakifyBuildDirPath: actualPath,
    });

    compareFolders(actualPath, expectedPath);
  });

  test("Should ignore email-test.html", async () => {
    const { rootDir, actualPath, expectedPath } = await prepare(
      "with-template-filter",
    );

    await buildEmailTheme({
      cwd: rootDir,
      templatesSrcDirPath: "./fixtures/emails/templates",
      filterTemplate: (filePath) => !filePath.endsWith(".html"),
      locales: ["en"],
      themeNames: ["vanilla"],
      keycloakifyBuildDirPath: actualPath,
    });

    compareFolders(actualPath, expectedPath);
  });

  test("Should break compilation for email-test.html", async () => {
    const { rootDir, actualPath } = await prepare("with-template-filter");
    await expect(() =>
      buildEmailTheme({
        cwd: rootDir,
        templatesSrcDirPath: "./fixtures/emails/templates",
        locales: ["en"],
        themeNames: ["vanilla"],
        keycloakifyBuildDirPath: actualPath,
      }),
    ).rejects.toThrowError();
  });
});
