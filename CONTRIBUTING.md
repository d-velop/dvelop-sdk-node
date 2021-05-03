# Contributing to the d.velop SDK for Node.js

Thank you for considering contributing to this project. It will help to make this project more valuable for the
community.

We value any feedback and contributions whether it's a bug report, bugfix, additional feature or documentation.
Please read this document before submitting an issue or pull request to ensure that your contributions can
be handled effectively.

Please note that this project is in an early stage and we still have to learn how to run an open source project.
So please be patient with us.

# How to report a bug

## Security vulnerability

Please do **NOT** open an issue if you find a security vulnerability.
Instead send an e-mail to ``securityissue@d-velop.de`` .

In order to determine whether you are dealing with a security issue, ask yourself these two questions:
* Can I access something that's not mine, or something I shouldn't have access to?
* Can I disable something for other people?

If the answer to either of those two questions are "yes", then you're probably dealing with a security issue.
Note that even if you answer "no" to both questions, you may still be dealing with a security issue,
so if you're unsure, just email us.

## File a bug report.

You can file bug reports on the [issues page](https://github.com/d-velop/dvelop-sdk-node/issues).

Please follow the following steps prior to filing a bug report.

1.  Search through existing [issues](https://github.com/d-velop/dvelop-sdk-node/issues) to ensure that
    your specific issue has not yet been reported.

2.  Ensure that you have tested the latest version of the SDK.
    Although you may have an issue against an older version of the SDK, we cannot provide bug fixes for old versions.
    It's also possible that the bug may have been fixed in the latest version.

When filing an issue, make sure to answer the following questions:

1.  What version of the SDK are you using?

2.  What operating system are you using?

3.  What did you do?

4.  What did you expect to see?

5.  What did you see instead?

# How to submit a feature request

You can submit feature requests on the [issues page](https://github.com/d-velop/dvelop-sdk-node/issues).

# Contribute to the project

## Prequisits

### Before you start
Before you consider contributing please submit a feature request. This way we can discuss the scope and warn you potential problems of your idea.

### Get up and running
For this project to work you need [node.js]() installed. We recommend the latest stable version. We also higly recommend [git]().

1. Clone the project via:
> ```git clone https://github.com/d-velop/dvelop-sdk-node.git```

2. Install dependecies via:
> ```npm i```

</br>

If everything worked you should be able to run:
>```npm test```

## Development

### General
This SDK is devided into multiple packages. Ideally we want to keep a *one package per app* structure. If you want to contribute a new package please mention this in your feature request issue.

### Technologies

* [typescirpt](https://www.typescriptlang.org/) is used for development. If you are familiar with javascript and/or typed languages this should not cause problems. Have a look at the [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) for a quick start.

* [lerna.js](https://lerna.js.org/) to maintain the project on the root level and manage the indivual packages.

* [axios](https://www.npmjs.com/package/axios) is used for HTTP requests.

* [jest](https://jestjs.io/) is used for testing

* [eslint](https://eslint.org/) is used for linting and code conventions

* [typedoc](https://typedoc.org/) is used for documentation.

### Development workflow

### Build-in commands

This project comes with several utility commands. You can find the implementation in the ```package.json``` file.

</br>

> ```npm run prepare```

Runs a lerna bootstrap command. This is triggered by the [npm lifecycle] an should usually never get executed on its own.

</br>

> ```npm run test```

Runs all tests for the project. *This command will be run automatically on commit*

</br>

> ```npm run test:watch```

Continiusly runs tests on save that touch on changed files. This command should be run for development.

</br>

> ```npm run lint```

Compares written code against the eslint specifications. *This command will be run automatically on commit*

</br>

> ```npm run lint:fix```

Trys to fix linting errors automatically.

</br>

> ```npm run build```

Build javascript files for the project. While you can safely run this command there should be no reason you ever have to.

</br>

> ```npm run build:force```

Rebuild **all** javascript files for the project. While you can safely run this command there should be no reason you ever have to.

</br>

> ```npm run license```

Runs automated license checking on the project dependencies.

</br>

> ```npm run docs```

Generate [typedoc](https://typedoc.org/) documentation locally in ```/docs``` which is ignored by git. Feel free to generate for inspection.

</br>

> ```npm run release```

Checks packages for changes and asks you for version updates and commits an update. This should be the last command (and commit) before a pull request.

### TDD
For developing we recommend Test-driven development (TDD). For every new function/class/file you create there should be its corresponding test-equivalent. Ideally there should be no need to ever run a build command for your development as all testing is done on the typescript code with building behind the scene. For convience while developing test-driven you can run ```npm run test:watch``` which will run all relevant tests when you save a file.

### Commit clean code
Ideally your commits should include a single valuable contribution that is tested, linted and documented. On every commit ```npm test``` and ```npm lint``` is run by default and your commit gets aborted if one of these fails.


## Pull Request

Please be aware of the following notes prior to opening a pull request:

1.  This project is released under the license specified in [LICENSE](LICENSE).
    Any code you submit will be released under that license. Furthermore it's likely
    that we have to reject code which depends on third party code which isn't compatible
    to the aforementioned license.

2.  Wherever possible, pull requests should contain tests as appropriate. Bugfixes should contain tests that exercise the corrected behavior (i.e., the test should fail without the bugfix and pass with it), and new features should be accompanied by tests exercising the feature.

3.  Pull requests that contain failing tests will not be merged until the test
    failures are addressed. Pull requests that cause a significant drop in the
    test coverage percentage are unlikely to be merged until tests have
    been added.

4. A pull request will automatically trigger a large set of actions (CI).