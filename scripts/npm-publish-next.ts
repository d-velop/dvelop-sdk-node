import { readdirSync } from "fs";
import { execSync } from "child_process";

(() => {

  const packages: string[] = readdirSync("./packages");

  const published: string[] = [];
  const unpublished: string[] = [];

  packages.forEach(p => {
    try {
      execSync(`npm publish --tag next -w packages/${p}`);
      console.log(`Published package '${p}'`);
      published.push(p);
    } catch (e) {
      console.error(`Did not publish package '${p}'`);
      unpublished.push(p);
    }
  });

  console.log(`Published ${published.length} packages:`);
  console.log(`${published.join("\n\t")}`);

  console.log(`${unpublished.length} packages were not published:`);
  console.log(`${unpublished.join("\n\t")}`);
})();