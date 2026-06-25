# Contributing to the d.velop SDK for Node.js

Thank you for considering contributing to this project. It will help us to make this project more valuable for the
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

You can file bug reports on the [issues page](https://github.com/d-velop/dvelop-sdk-node/issues). Please name this issue ``Bug: <SHORT_DESCRIPTION>``.

Please follow the following steps prior to filing a bug report.

1.  Search through existing [issues](https://github.com/d-velop/dvelop-sdk-node/issues) to ensure that
    your specific issue has not yet been reported.

2.  Ensure that you have tested the latest version of the SDK.
    Although you may have an issue against an older version of the SDK, we cannot provide bug fixes for old versions.
    It's also possible that the bug may have been fixed in the latest version.

When filing an issue, make sure to answer the following questions:

1.  What package and version of the SDK are you using?

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
For this project to work you need [node.js](https://nodejs.org/en/) installed. We recommend the latest stable version. As this project makes use of [workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces) you need at least npm 7 which ships with Node.js 15.

1. Clone the project via:
> ```git clone https://github.com/d-velop/dvelop-sdk-node.git```

2. Install dependecies via:
> ```npm i```

3. Build via:
> ```npm run build```

4. Teast via:
>```npm test```

## Development

### General
This SDK is devided into multiple packages. Ideally we want to keep a *one package per app* structure. If you want to contribute a new package please mention this in your feature request.

### Technologies
We already committed to some tools and frameworks to handle certain things. If you want to contribute within that scope please use the existing things at your disposal.

* [npm workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces) for package management.

* [typescirpt](https://www.typescriptlang.org/) is used for development. If you are familiar with javascript and/or typed languages this should not cause problems. Have a look at the [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) for a quick start.

* [axios](https://www.npmjs.com/package/axios) is used for HTTP requests. It is *pro forma* abstracted in [@dvelop-sdk/core](https://www.npmjs.com/package/@dvelop-sdk/core) meaning that we ship it from there and it is abstracted however all axios properties and utilities should work.

* [jest](https://jestjs.io/) is used for testing.

* [eslint](https://eslint.org/) is used for linting and code conventions.

* [typedoc](https://typedoc.org/) is used for documentation.

## Development workflow

### Build-in commands

This project comes with several utility commands. You can find the implementation in the ```package.json``` file.

</br>

> ```npm run test```

Runs all tests for the project. *This command will be run automatically on commit*

</br>

> ```npm run test:watch```

Continously runs tests on save that touch on changed files. This command should be run for development.

</br>

> ```npm run lint```

Compares written code against the eslint specifications. *This command will be run automatically on commit*

</br>

> ```npm run lint:fix```

Trys to fix linting errors automatically. This should be your first action on linting errors.

</br>

> ```npm run build```

Build javascript files for the project. While you can safely run this command there should be no reason you ever have to.

</br>

> ```npm run build:force```

Rebuild **all** javascript files for the project. While you can safely run this command there should be no reason you ever have to.

</br>

> ```npm run license```

Runs automated license checking on the project dependencies. This command should be executed when adding a dependency to the project.

</br>

> ```npm run docs```

Generate [typedoc](https://typedoc.org/) documentation locally in ```/docs``` which is ignored by git. Feel free to generate and have a look.

### TDD
For developing we recommend Test-driven development (TDD). For every new function/class/file you create there should be its corresponding test-equivalent. Ideally there should be no need to ever run a build command for your development as all testing is done on the typescript code with building behind the scene. For convience while developing test-driven you can run ```npm run test:watch``` which will run all relevant tests when you save a file.

### Adding a dependency
Adding dependencies can be done by executing ```npm i dependency``` in the corresponding package (not the root). Please be aware that you should consult us before adding dependencies. Dependencies should not be added on the root level by you, unless specifically mentioned by us.

### Documentation
As mentioned we are using [typedoc](https://typedoc.org/) to document code. A documentation is generated from inline documentation and provided via [GitHub Pages](https://pages.github.com/).

- **Functions**
  - Should be annotated above function definition
  - must contain
    - A general description of what the function achieves
    - a short example
    - ```@throws {@link <ERROR_CLASS>} <DESCRIPTION>``` for every expected error
    - ```@category``` if a module provides multiple distict functionalities
  - Example:
     ```
      /**
       * Provides a greeting string.
       *
       * @throws {@link UnknownPersonError} indicated that the person to be greeted was not found.
       *
       * ```typescript
       * const greeting: string = sayHi("Emma Watson");
       * console.log(greeting) //print "Moin moin Emma Watson!"
       * ```
       *
       * @category Social
       */
       export function sayHi(to: string): string {
         ...
      ```

- **Interfaces**
  - Should be annotated above for gerenal information and ```@category```
  - Should be annotated inline for every property
  - must contain
    - A general description
    - A description for each property
  - Example:
    ```
    /**
     * This is my interface. It faces inter really well.
     * @category MyStuff
     */
    export interface MyInterface {

      /**
       * Value held by my interface. **DO NOT put numbers here**
       */
      value: string;
    }
    ```

- **Errors**
  - Should be annotated above for general information
  - Should always be annotated with ```@category Error``` regardless of context.
  - Example:
    ```
     /**
      * Music is playing but its not Britney.
      * @category Error
      */
     export class UppsIDidItAgainError extends Error {
       ...
    ```

### Git
This repository uses Git as VSC tool for code. Github is used as the remote repository.

#### What to commit

A commit should contain a _"logical unit of change"_.

> You should make new commits often, based around logical units of change. Over time, commits should tell a story of the history of your repository and how it came to be the way that it currently is.

<div align="right">
<a href=https://github.com/git-guides/git-commit>github docs</a>
</div>

Additionally the code should be *complete* after each commit, meaning that the changes made compile with all guidelines formulated and pass the CI (launchable, tested, linted, formatted, etc.)

A cool practical approach  was formulated in by Jason McCreary:
> I make a commit when:
> 1. I complete a unit of work.
> 2. I have changes I may want to undo.
<div align="right">
<a href=https://github.com/git-guides/git-commit>When to make a Git commit</a>
</div>


#### Commit messages

Commit messages should be structured according to [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary)

```text
<type>[optional scope]: <description>
<blank line>
[optional body]
<blank line>
[optional footer(s)]
```

- **types**

    Currently the following types are predominantly used:

    | type     | used for |
    |----------|----------|
    | feat     | Feature (or milestone for a feature) |
    | fix      | Bugfix |
    | ci       | Changes to CI or project behavior. For now this includes types `build`, `test` and `docs`. |
    | refactor | Code changes without any changes to behavior (except performance). For not this includes type `perf` and `style` |
    | revert   | Revert a commit |

- **scope**

    Scopes are optional and may be used where they appear appropriate. Remember that this might be redundant with the branch-name as branches get merged and deleted.

- **description**

    A short summary of the code changes.
    - use the imperative, present tense: "change" not "changed" nor "changes"
    - don't capitalize the first letter
    - don't append dot `.`

- **body**

    A longer commit body may be provided after the short description, providing additional contextual information about the code changes (e.g. enumeration of changes or contrast with previous behavior).
    - use the imperative, present tense: "change" not "changed" nor "changes"
    - capitalize the first letter
    - may append dot `.`

- **footer(s)**

    Footers may be added in the form of key-value-pairs. They may be used for

    - [Github Keyword](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/using-keywords-in-issues-and-pull-request)

        `Closes #42`

    - References to commit SHAs

        `Ref: a215868`

    - Breaking Changes

        `BREAKING CHANGE: <description of change>`


- **examples**

    ```
    feat: add salt to noodle water
    ```

    ```
    fix: exhaust hood turns of randomly

    Change exhaust hood behavior to not depend on water temperature
    ```

    ```
    feat(carbonara): add pancetta as final ingredient

    Add pancetta (italian bacon) to recipe:
    - is cut into cubes
    - is cooked (although is commonly eaten raw)
    - expected to be seasoned with rosemary and sage

    BREAKING CHANGE: the dish is no longer vegetarian
    ```

    ```
    revert: commit introduces bug where pasta is not al dente anymore

    Ref: a215868
    ```


#### Where to commit

This repo uses part of the [Git flow branching strategy](https://www.gitkraken.com/learn/git/git-flow).

| branch-name   | details                            | commit directly | merge into
|---------------|------------------------------------|-----|--------------------|
| `main`        | most recent release                | no  | -                  |
| `development` | next release                       | yes | `main`             |
| `feature/*`   | a feature currently in development | yes | `development`       |
| `hotfix/*`    | a bug currently fixed              | yes | `main` & `development` |

We consciously omit
- `release/*`
- `support/*`


## Pull Request

Please be aware of the following notes prior to opening a pull request:

1.  This project is released under the license specified in [LICENSE](LICENSE).
    Any code you submit will be released under that license. Furthermore it's likely
    that we have to reject code which depends on third party code which isn't compatible
    to the aforementioned license. You can check compatibility with ```npm run license```.

2.  Wherever possible, pull requests should contain tests as appropriate. Bugfixes should contain tests that exercise the corrected behavior (i.e., the test should fail without the bugfix and pass with it), and new features should be accompanied by tests exercising the feature.

3. A pull request will automatically trigger a large set of actions (CI). These will run various tests and other QA-measures. Pull requests that contain failing tests will not be merged until the test failures are addressed. Pull requests that cause a significant drop in the test coverage percentage are unlikely to be merged until tests have been added.

## Live End-to-End Testing

The SDK has two test layers:

- **Unit** (`*.spec.ts`, under `packages/**/src`) — mock `dvelopFetch`, run by
  `npm test`. These live inside the packages.
- **Live e2e** (`*.e2e.spec.ts`) — real HTTP calls against a real tenant, run by
  `npm run test:e2e` (`e2e/jest.e2e.json`).

Live e2e is **opt-in** and **credential-gated**: suites self-skip (`describe.skip`)
when the required env vars are missing, so `npm test` and contributors without a
tenant stay green.

### Layout

Everything e2e lives in the top-level `e2e/` folder, outside `packages/`:

```
e2e/
  jest.e2e.json             # e2e jest config (rootDir = e2e/)
  tsconfig.json             # ts-jest compiler options (NodeNext/ES2022)
  helpers/
    context.ts              # env read + API-Key → authSessionId bootstrap
    marker.ts               # unique per-run marker
  specs/
    task.e2e.spec.ts
    identityprovider.e2e.spec.ts
```

The folder is dev-only: it is **not** a `tsc -b` project reference and is never
built or published — ts-jest compiles it on demand. It **is** linted (the eslint
config and `npm run lint` include `e2e/**/*.ts`).

The `.env` / `.env.example` files stay at the **repo root**, because
`dotenv/config` loads `.env` relative to the current working directory (the repo
root when npm runs the script).

### Running

1. Copy `.env.example` to `.env` and fill in the values. **Use a dedicated test
   tenant and a dedicated API-Key — never production credentials.** `.env` is
   gitignored.
2. Run:
   ```bash
   npm run test:e2e
   ```
   This builds all packages first (`tsc -b`), then runs the e2e suites serially
   (`--runInBand`). The suites import the SDK via its package names
   (`@dvelop-sdk/task`, …), i.e. they test the **built `lib/` artifacts** exactly
   as a consumer would — which is why the build runs first.

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DVELOP_E2E_SYSTEM_BASE_URI` | yes | Tenant base URI, e.g. `https://tenant.d-velop.cloud` |
| `DVELOP_E2E_API_KEY` | yes | Admin API-Key, exchanged for a live authSessionId at run start |

### Design contract

- **Auth**: the bootstrap (`e2e/helpers/context.ts`) exchanges the API-Key for a
  live `authSessionId` via `getAuthSession`, then resolves the authenticated user
  via `validateAuthSessionId`. This exercises the auth flow on every run.
- **Isolation**: every created resource is tagged with a unique run marker
  (`sdk-e2e-<timestamp>-<rand>`, see `e2e/helpers/marker.ts`) so concurrent runs
  and leftovers from crashed runs never collide on a shared tenant.
- **Self-cleaning**: each suite deletes what it created in `afterAll`. Cleanup is
  best-effort — it logs a warning on failure and never throws, so a cleanup error
  cannot mask a real assertion failure. (`afterAll`, not `afterEach`, because
  per-test purges are fragile under parallel runs.)
- **Dev-only helpers**: `e2e/helpers/` is never built or published. The whole
  `e2e/` folder is not a TypeScript project reference and is excluded from
  `tsc -b`; it is only compiled on demand by ts-jest when an e2e suite imports it.

### Coverage

| Package | Status | Notes |
|---|---|---|
| `task` | ✅ Phase 1 | Full CRUD lifecycle (create → read → update → search → complete), delete in cleanup |
| `identityprovider` | ✅ Phase 1 | `getAuthSession`, `validateAuthSessionId` |
| `dms` | ⏳ Phase 2 | Needs extra config (repository / source / category / property IDs) |
| `business-objects` | ⏳ Phase 2 | Needs a deployed bo-set/model |

Not covered by design:

- `identityprovider.requestAppSession` — POSTs to an async external callback URI;
  no hermetic, self-contained way to assert its effect.
- `core`, `app-router`, `express-utils`, `logging` — no direct SDK HTTP calls
  (`core`'s `dvelopFetch` is exercised transitively by every e2e call).

### CI

`.github/workflows/e2e.yml` runs the suites **nightly** and on **manual dispatch**
— never on pull requests. Credentials come from repository Actions secrets; if they
are unset the suites self-skip.
