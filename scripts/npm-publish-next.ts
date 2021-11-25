import { readdirSync } from "fs";
import { execSync } from "child_process";

(() => {

  const packages: string[] = readdirSync("./packages");

  packages.forEach(p => {
    try {
      execSync(`npm publish --tag next -w packages/${p}`);
      console.log(`Published package '${p}'`);
    } catch (e) {
      console.error(`Did not publish package '${p}'`);
    }
  });
})();