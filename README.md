<div align="center">

  <h1>dvelop-sdk-node</h1>

  <img alt="GitHub" src="https://img.shields.io/github/license/d-velop/dvelop-sdk-node?style=for-the-badge">

  </br>

  <h2>Apps</h2>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/app-router">
    <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/app-router?label=app-router&style=for-the-badge">
  </a>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/identityprovider">
    <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/identityprovider?label=identityprovider&style=for-the-badge">
  </a>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/task">
    <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/task?label=task&style=for-the-badge">
  </a>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/dms">
    <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/dms?label=dms&style=for-the-badge">
  </a>

  <a href="https://www.npmjs.com/package/@dvelop-sdk/business-objects">
    <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/business-objects?label=business-objects&style=for-the-badge">
  </a>

  </br>

<h2>Utilities</h2>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/express-utils">
    <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/express-utils?label=express-utils&style=for-the-badge">
  </a>
<a href="https://www.npmjs.com/package/@dvelop-sdk/logging">
    <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/logging?label=logging&style=for-the-badge">
  </a>

  </br>
  </br>

  <a href="https://d-velop.github.io/dvelop-sdk-node/modules.html"><strong>Explore the docs »</strong></a>

  <a href="https://www.npmjs.com/~d-velop"><strong>Explore on npm »</strong></a>

</div>

</br>

## About

This is the official SDK to build apps for [d.velop cloud](https://www.d-velop.de/cloud/) using
[node.js](https://nodejs.org/en/) and [typescript](https://www.typescriptlang.org/).


## Getting started

This SDK is diveded into [apps](https://developer.d-velop.de/dev/de/explore-the-apps). Install individual packages per d-velop app you want to use.
```
npm i @dvelop-sdk/dms
```
``` typescript
import { Repository, getRepository } from "@dvelop-sdk/dms";

(async function main() {

  const repo: Repository = await getRepository({
    systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud",
    authSessionId: "dQw4w9WgXcQ"
  }, {
    repositoryId: "qnydFmqHuVo",
  });

  console.log(repo.name); // Booty Bay Documents
})();
```



```
npm i @dvelop-sdk/task
```
``` typescript
import { createTask } from "@dvelop-sdk/task";

(async function main() {

  const taskLocation = await createTask({
    systemBaseUri: "https://umbrella-corp.d-velop.cloud",
    authSessionId: "dQw4w9WgXcQ"
  }, {
    subject: "Cover up lab accident",
    assignees: ["XiFkyR35v2Y"]
  });

  console.log(taskLocation); // some/task/location
})();
```

You can also run them in ES6 javascript without typescript:
```
npm i @dvelop-sdk/dms
```
```json
//package.json
{
  "type":"module"
}
```
```javascript
//main.js

import { Repository, getRepository } from "@dvelop-sdk/dms";

async function main() {

  const repo = await getRepository({
    systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud",
    authSessionId: "dQw4w9WgXcQ"
  }, {
    repositoryId: "qnydFmqHuVo",
  });

  console.log(repo.name); // Booty Bay Documents
}

await main();
```

<div align="center">
  <a href="https://d-velop.github.io/dvelop-sdk-node/modules.html"><strong>Explore the docs »</strong></a>
</div>
</br>

## Build a d.velop app in no time with express

This SDK was designed framework agnostic but with [express](https://www.npmjs.com/package/express) in mind.

Install dependencies:
```
npm i express cookie-parser @dvelop-sdk/express-utils
npm i typescript @types/express @types/cookie-parser -D
```
Be sure to set the ```esModuleInterop```-flag for typescript:
```json
//tsconfig.json

{
  "compilerOptions": {
    "esModuleInterop": true,
    // ...
  }
}
```

Set up your app:
```typescript

import express, { Application, NextFunction, Request, Response } from "express"
import cookieParser from "cookie-parser";
import { authenticationMiddleware, contextMiddleware, validateSignatureMiddlewareFactory, InvalidRequestSignatureError, UnauthorizedError, redirectToLoginPage } from "@dvelop-sdk/express-utils";

const app: Application = express();
const appName: string = "acme-myapp";
const appPort: number = 5000;

app.use(cookieParser());
app.use(contextMiddleware); // Make the req.dvelopContext-property available
app.use(validateSignatureMiddlewareFactory(process.env.APP_SECRET)); // Check the d.velop signature.

app.get(`/${appName}/me`, authenticationMiddleware, (req: Request, res: Response) => {
  res.status(200).send(`<h1>Hello ${req.dvelopContext.user.displayName}</h1>`);
});

app.get(`/${appName}`, (req: Request, res: Response) => {
  res.status(200).send(`<h1>Hello Tenant ${req.dvelopContext.systemBaseUri} (${req.dvelopContext.tenantId})</h1>`);
});

app.use((err: any, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof InvalidRequestSignatureError) {
    res.status(403).send("Forbidden"); // Indicates a problem with the App-Secret
  } else if (err instanceof UnauthorizedError) {
    redirectToLoginPage(req, res); // Not authenticated => send to IDP login-page
  } else {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(appPort, () => {
  console.log(`D.velop app listening on port ${appPort} ...`);
});
```

Don't forget to set your APP_SECRET and then start your app:
```
npx tsc && node src/main.js
```

The ```req.dvelopContext```-property can now be used for other SDK-functions.


<div align="center">
  <a href="https://d-velop.github.io/dvelop-sdk-node/modules.html"><strong>Explore the docs »</strong></a>
</div>

</br>


## Advanced Topics

Every SDK method accepts an optional third parameter `options` of type `DvelopOptions`. This lets you customize the HTTP request or intercept the raw response — without needing to understand factory functions or internal abstractions.

```typescript
import { DvelopOptions } from "@dvelop-sdk/core";
```

### Timeout

```javascript
import { getRepository } from "@dvelop-sdk/dms";

const repo = await getRepository(context, { repositoryId: "qnydFmqHuVo" }, {
  initOverwrite: { signal: AbortSignal.timeout(5000) }
});
```

### Disable TLS verification (Node.js 18+, plain JavaScript only)

Pass an undici `dispatcher` via `initOverwrite`. TypeScript will flag the unknown property — use plain JavaScript or a type cast:

```javascript
import { Agent } from "undici";
import { getRepository } from "@dvelop-sdk/dms";

const repo = await getRepository(context, { repositoryId: "qnydFmqHuVo" }, {
  initOverwrite: { dispatcher: new Agent({ connect: { rejectUnauthorized: false } }) }
});
```

### Add extra headers

```javascript
const repo = await getRepository(context, { repositoryId: "qnydFmqHuVo" }, {
  initOverwrite: { headers: { "x-my-header": "value" } }
});
```

### Access the raw response

Use `onResponse` to intercept or replace the default JSON transform. Return a value to use it as the method's result; return `undefined` (or nothing) to let the default transform run.

```javascript
// Replace the result with raw JSON
const raw = await getRepository(context, { repositoryId: "qnydFmqHuVo" }, {
  onResponse: async (response) => response.json()
});

// Log a header without replacing the result
const repo = await getRepository(context, { repositoryId: "qnydFmqHuVo" }, {
  onResponse: (response) => {
    console.log("ETag:", response.headers.get("etag"));
    // returns undefined → default transform still runs
  }
});
```

All HTTP is handled by `dvelopFetch` from the `@dvelop-sdk/core` package, which sets the standard d.velop headers (`Authorization`, `x-dv-request-id`, `traceparent`) and calls the built-in Node.js `fetch`.

## Contributing
This project is maintained by d-velop but is looking for contributers. If you consider contributing to this project please read [CONTRIBUTING](CONTRIBUTING.md) for details on how to get started.


## License
Please read [LICENSE](LICENSE) for licensing information.

## Acknowledgments
Thanks to the following projects for inspiration

* [Starting an Open Source Project](https://opensource.guide/starting-a-project/)
* [README template](https://gist.github.com/PurpleBooth/109311bb0361f32d87a2)
* [CONTRIBUTING template](https://github.com/nayafia/contributing-template/blob/main/CONTRIBUTING-template.md)