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

# Contribute to the project

## Workflow
1. Please submit your idea as a Feature Request in the form of a Github Issue. This way we can keep track of ongoing development, warn you about potential problems and give helpful hints.
2. Develop the functionality
3. Create a pull request.

## Feature Request
TBD

## Development
### Get up and runnding
1. Clone the project.
2. Run ```npm i```
3. Run ```npm bootstrap```

If everything worked you should be able to run ```npm test``` with success.

### General
This project uses [TypeScript](https://www.typescriptlang.org/) a kind of next gen typed superset of JavaScript.
If you are new to TypeScript pleas have a look at the *Get Started* section of the
[TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html).
We didn't want to put everything in one big package because not everybody needs all functions of the SDK.
On the other hand multiple git repositories are unnecessary overhead. So we decided to use a single git project
for all SDK packages. Furthermore we decided to use independent versioning because a breaking change
in one package, requiring a new major version for this package, would also result in a new major version for all packages
although there might be no breaking changes in these packages.
The corresponding tool for this so called multi-package repository is [lerna.js](https://lerna.js.org/).
Please read through its documentation to get a basic understanding of how this tool works.


### Style Guide
Please use [this unoffical style guide](https://github.com/basarat/typescript-book/blob/master/docs/styleguide/styleguide.md) when naming things.

### TDD
For developing we recommend Test-driven development (TDD). For every new function/class/file you create there should be its corresponding test-equivalent. Ideally there should be no need to ever run a build command for your development as all testing is done on the typescript code with building behind the scene. For convience while developing test-driven you can run ```npm run test:watch``` which will run all relevant tests when you save a file.

### Use the existing frameworks
Please be very careful when introducing new dependencies and try to use the existing ones whenever possible.
| Functionality | Framework
| :---: | :---:
| HTTP-Requests | axios
| Testing | jest
| Linting | eslint
| Documentation | jsdoc

### Create a new package
TBD

### Commit message

Please use the following template for commit messages which is derived from
[template of the git project](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project):

```
Capitalized, short (50 chars or less) summary of changes

More detailed explanatory text, if necessary.  Wrap it to
about 72 characters or so.  In some contexts, the first
line is treated as the subject of an email and the rest of
the text as the body.  The blank line separating the
summary from the body is critical (unless you omit the body
entirely); tools like rebase can get confused if you run
the two together.

Write your commit message in the imperative: "Fix bug" and not "Fixed bug"
or "Fixes bug."  This convention matches up with commit messages generated
by commands like git merge and git revert.

Further paragraphs come after blank lines.

- Bullet points are okay, too

- Typically a hyphen or asterisk is used for the bullet, followed by a
  single space, with blank lines in between, but conventions vary here
```

## Pull Request

Please be aware of the following notes prior to opening a pull request:

1.  This project is released under the license specified in [LICENSE](LICENSE).
    Any code you submit will be released under that license. Furthermore it's likely
    that we have to reject code which depends on third party code which isn't compatible
    to the aforementioned license.

2.  If you would like to implement support for a significant feature that is not
    yet available, please talk to us beforehand to avoid any
    duplication of effort.

3.  Wherever possible, pull requests should contain tests as appropriate.
    Bugfixes should contain tests that exercise the corrected behavior (i.e., the
    test should fail without the bugfix and pass with it), and new features
    should be accompanied by tests exercising the feature.

4.  Follow the [Code Conventions](#code-conventions).

5.  Pull requests that contain failing tests will not be merged until the test
    failures are addressed. Pull requests that cause a significant drop in the
    test coverage percentage are unlikely to be merged until tests have
    been added.