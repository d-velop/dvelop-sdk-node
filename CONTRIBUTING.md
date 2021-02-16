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

## Get started
Run ```npm i```

# Code Conventions

## Style Guide

Please use [this unoffical style guide](https://github.com/basarat/typescript-book/blob/master/docs/styleguide/styleguide.md) when naming things.

## Documentation

Please use [TSDoc](https://tsdoc.org/) to document the code.

## Naming of Tests

TBD

## Commit message

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

## Installing

TBD

## Coding
This project uses [TypeScript](https://www.typescriptlang.org/) a kind of next gen typed superset of JavaScript.
If you are new to TypeScript pleas have a look at the *Get Started* section of the
[TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html).

### References

- [Writing middleware for use in Express apps](https://expressjs.com/en/guide/writing-middleware.html)

## Build
This is a multi-package repository which uses
[TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html#composite).

The build process can be invoked with `npm run <command>` and supports the following commands:

- `test` run the tests
- `watch-test` watch for changes and automatically rerun tests
- `build` incremental build, that is build all files which were changed since the last invocation
- `watch` watch for changes and automatically build the corresponding files
- `cleanbuild` force a clean build

It can be invoked for the whole repository or an individual [package](./packages) be switching to the corresponding
package directory.

```
# build all packages
npm run build

# build the tenant package only
cd packages\tenant
npm run build
```


## Projectstructure
We didn't want to put everything in one big package because not everybody needs all functions of the SDK.
On the other hand multiple git repositories are unnecessary overhead. So we decided to use a single git project
for all SDK packages. Furthermore we decided to use independent versioning because a breaking change
in one package, requiring a new major version for this package, would also result in a new major version for all packages
although there might be no breaking changes in these packages.
The corresponding tool for this so called multi-package repository is [lerna.js](https://lerna.js.org/).
Please read through its documentation to get a basic understanding of how this tool works.


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

