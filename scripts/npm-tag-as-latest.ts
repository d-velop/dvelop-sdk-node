import { execSync } from "child_process";

(() => {

  const packages = JSON.parse(execSync(`npm view -ws --json`).toString());

  Object.keys(packages).forEach(packageName => {

    const next: string = packages[packageName]['dist-tags'].next;

    execSync(`npm dist-tag add ${packageName}@${next} latest`);
    execSync(`npm dist-tag rm ${packageName} next`);
    console.log(`Tagged ${packageName}@${next} as latest an removed next tag.`);
  });
})();