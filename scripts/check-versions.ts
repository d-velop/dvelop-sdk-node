import { execSync } from "child_process";
import { readdirSync } from "fs";

(() => {

  const packages: string[] = readdirSync("./packages");
  packages.forEach(p => {
    // execSync(`npm dist-tag ls --workspaces`);
    if (execSync(`git diff master -- packages/${p}`).toString()) {
      const publishedVersion: string = (JSON.parse(execSync(`npm pack --dry-run --json @dvelop-sdk/${p}@latest`).toString())[0].version);
      const currentVersion: string = (JSON.parse(execSync(`npm pack --dry-run --json -w packages/${p}`).toString())[0].version);
      if (publishedVersion === currentVersion) {
        throw new Error(`Package ${p} changed but version was not raised.`);
      }
    }
  });
})();