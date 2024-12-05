import * as fs from "node:fs";
import path from "node:path";
import * as os from "node:os";
import { expect } from "vitest";

type Listing = { [filename: string]: string };

// on windows line endings are different,
// so direct comparison to snapshot would file if not normalized
export const normalizeLineEndings = (str: string) =>
  str.replace(/\r?\n/g, "\r\n");

export function listingToHumanReadable(listing: Listing): string {
  const output: string[] = [];
  Object.entries(listing).forEach(([filename, value]) => {
    output.push("#######################");
    output.push(`Filename: ${filename}`);
    output.push("#######################");
    output.push("");
    output.push(normalizeLineEndings(value));
    output.push("");
  });

  return output.join("\n");
}

export function compareFolders(pathA: string, pathB: string) {
  const listingA = listingToHumanReadable(readFsToListing(pathA));
  const listingB = listingToHumanReadable(readFsToListing(pathB));

  expect(listingA).toBe(listingB);
}

/**
 * Create fixtures from provided listing in temp folder
 * Alternative for mock-fs which is also mocking nodejs require calls
 *
 * returns a path to tmp directory with fixtures
 */
export async function createFixtures(listing: Listing) {
  const tmpDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), `test-${process.pid}`),
  );

  for (const [filename, value] of Object.entries(listing)) {
    await fs.promises.mkdir(path.join(tmpDir, path.dirname(filename)), {
      recursive: true,
    });
    await fs.promises.writeFile(path.join(tmpDir, filename), value);
  }
  return tmpDir;
}

/**
 * Print FS to the listing, handy to use with snapshots
 */
export function readFsToListing(
  directory: string,
  filter?: (filename: string) => boolean,
): Record<string, string> {
  const out: Record<string, string> = {};

  function readDirRecursive(currentDir: string, parentPath = ""): void {
    const entries = fs.readdirSync(currentDir);

    entries.forEach((entry) => {
      const filepath = path.join(currentDir, entry);
      const relativePath = parentPath ? `${parentPath}/${entry}` : entry;

      if (fs.lstatSync(filepath).isDirectory()) {
        readDirRecursive(filepath, relativePath);
      } else if (!filter || filter(entry)) {
        out[relativePath] = fs.readFileSync(filepath, "utf-8");
      }
    });
  }

  readDirRecursive(directory);
  return out;
}
