import { execSync } from "child_process";

(() => {

  try {
    const packages: { name: string, version: string }[] = JSON.parse(execSync(`lerna list --json`).toString());
    packages.forEach(p => {
      execSync(`npm dist-tag add ${p.name}@${p.version} latest`);
      console.log(`Successfully tagged ${p.name}@${p.version} as 'latest'`);
    });
  } catch(e) {
    console.error(`Tagging unsuccessful.`);
  }
})();