import { readdirSync } from "fs";
import { execSync } from "child_process";

(() => {

  const packages: string[] = readdirSync("./packages");

  try {
    packages.forEach(p => {
      execSync(`license-checker --start ./packages/${p} --production --onlyAllow Apache-2.0;MIT;ISC;BSD-2-Clause;BSD-3-Clause`);
    });
  } catch(e) {
    console.error(`License check unsuccessful: ${e}`);
    throw e;
  }
})();