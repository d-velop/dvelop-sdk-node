<div align="center">
  <img alt="GitHub" src="https://img.shields.io/github/license/d-velop/dvelop-sdk-node?style=for-the-badge">
</div>

</br>

<div align="center">
  <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/app-router?label=app-router&style=for-the-badge">
  <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/identityprovider?label=identityprovider&style=for-the-badge">
  <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/task?label=task&style=for-the-badge">
  <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/dms?label=dms&style=for-the-badge">
</div>

</br>

<div align="center">
  <h1>dvelop-sdk-node</h1>
  <a href="https://d-velop.github.io/dvelop-sdk-node/modules.html"><strong>Explore the docs »</strong></a>
</div>

</br>

## About

This is the official SDK to build apps for [d.velop cloud](https://www.d-velop.de/cloud/) using
[node.js](https://nodejs.org/en/) and [typescirpt](https://www.typescriptlang.org/).


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

You can also run them in ES6 javascript:
```
npm i @dvelop-sdk/task
```
```json
//package.json
{
  "type":"module",
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
npm i typescript express cookie-parser @dvelop-sdk/app-router @dvelop-sdk/identityprovider
```
```
npm i @types/express @types/cookie-parser ts-node-dev -D
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
// src/middleware/dvelop.ts

import { Request, Response, NextFunction } from "express";
import { DVELOP_SYSTEM_BASE_URI_HEADER, DVELOP_TENANT_ID_HEADER, DVELOP_REQUEST_ID_HEADER, DVELOP_REQUEST_SIGNATURE_HEADER } from "@dvelop-sdk/core";
import * as appRouter from "@dvelop-sdk/app-router";
import * as idp from "@dvelop-sdk/identityprovider";

// ATTENTION: This should never be checked into version control
const APP_SECRET = process.env.APP_SECRET;

export function validateSignatureAndSetDvelopContext(req: Request, res: Response, next: NextFunction) {

  const systemBaseUri: string = req.header(DVELOP_SYSTEM_BASE_URI_HEADER);
  const tenantId: string = req.header(DVELOP_TENANT_ID_HEADER);
  const requestSignature: string = req.header(DVELOP_REQUEST_SIGNATURE_HEADER);

  try {
    appRouter.validateDvelopContext(APP_SECRET, {
      systemBaseUri: systemBaseUri,
      tenantId: tenantId,
      requestSignature: requestSignature
    });
  } catch (e) {
    if (e instanceof appRouter.InvalidRequestSignatureError) {
      console.log(e);
      res.status(403).send('Forbidden');
    }
  }

  req.systemBaseUri = systemBaseUri;
  req.tenantId = tenantId
  req.requestId = req.header(DVELOP_REQUEST_ID_HEADER);
  next();
}

export async function validateUser(req: Request, res: Response, next: NextFunction) {

  let authSessionId: string;

  const authorizationHeader = req.get("Authorization");
  const authorizationCookie = req.cookies["AuthSessionId"];
  if (authorizationHeader) {
    authSessionId = new RegExp(/^bearer (.*)$/, "i").exec(authorizationHeader)[1];
  } else if (authorizationCookie) {
    authSessionId = authorizationCookie;
  }

  try {
    const user: idp.DvelopUser = await idp.validateAuthSessionId({
      systemBaseUri: req.systemBaseUri,
      authSessionId: authSessionId
    });
    req.user = user;
    next();
  } catch (e) {
    if (e instanceof idp.UnauthorizedError) {
      res.redirect(idp.getLoginRedirectionUri(req.originalUrl));
    }
  }
};
```

```typescript
// src/main.ts
import express, { Application, Request, Response } from "express"
import { ScimUser } from "@dvelop-sdk/identityprovider";
import { validateSignatureAndSetDvelopContext, validateUser } from "./middleware/dvelop";
import cookieParser from "cookie-parser";

declare global {
  namespace Express {
    interface Request {
      systemBaseUri?: string;
      tenantId?: string;
      requestId?: string;
      user?: ScimUser
    }
  }
}

const app: Application = express();
const appName: string = "acme-myapp";
const appPort: number = 8001;

app.use(validateSignatureAndSetDvelopContext);

app.use(cookieParser());
app.use(validateUser);

app.get(`/${appName}/me`, (req: Request, res: Response) => {

  res.status(200).send(`
    <h1>Hello ${req.user.displayName}</h1>
    <p>Greetings from ${process.env.npm_package_name} (${process.env.npm_package_version})!</p>
  `);
});

app.get(`/${appName}`, (req: Request, res: Response) => {
  res.status(200).send(`
    <h1>Hello Tenant ${req.tenantId} (${req.systemBaseUri})</h1>
    <p>Greetings from ${process.env.npm_package_name} (${process.env.npm_package_version})!</p>
  `);
});

app.use("/", (_: Request, res: Response) => {
  res.redirect(`/${appName}`);
});

// Start
app.listen(appPort, () => {
  console.log(`D.velop app listening on port ${appPort} ...`);
});
```


Don't forget to set your APP_SECRET and then start your app:
```
npx ts-node-dev src/main.ts
```

<div align="center">
  <a href="https://d-velop.github.io/dvelop-sdk-node/modules.html"><strong>Explore the docs »</strong></a>
</div>

</br>


## Advanced Topics
**Attention: Currently only available in @dvelop-sdk/dms**

Under the hood this SDK uses a functional programming approach. Generally all top-level SDK methods are created by factory-methods. This allows to inject default implementations and at the same time give consumers next-to-full control over steps taken.

SDK-functions usually have at two seperate steps:
- A HTTP-Call to the corresponding app
- A transform-function which handles the JSON-response

Let's look at the getRepository-factoryFunction:
```typescript
export function getRepositoryFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: GetRepositoryParams) => T,
): (context: DvelopContext, params: GetRepositoryParams) => Promise<T> {
  return async (context: DvelopContext, params: GetRepositoryParams) => {
    const response: HttpResponse = await httpRequestFunction(context, {
      method: "GET",
      url: "/dms",
      follows: ["repo"],
      templates: { "repositoryid": params.repositoryId }
    });
    return transformFunction(response, context, params);
  };
}

export async function getRepository(context: DvelopContext, params: GetRepositoryParams): Promise<Repository> {
  return getRepositoryFactory(defaultHttpRequestFunction, getRepositoryDefaultTransformFunction)(context, params);
}
```

The getRepository-function itself is a function in the form of
```typescript
(context: DvelopContext, params: GetRepositoryParams) => Promise<Repository>
```

The getRepository-factoryFunction is a function that returns this function. As input it requires two functions itself that are used:
- A HTTP-Function which accepts a DvelopContext and a DvelopHttpConfig to make the Http-Request
  ```typescript
  (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>
  ```

- A transform-function which accepts a DvelopHttpResponse, the initial context and the initial paramters. It returns a generic type.
  ```typescript
  (response: HttpResponse, context: DvelopContext, params: GetRepositoryParams) => T
  ```

The exported getRepository-function itself is created by this factory with default implementations. This gives you control over the individual tasks done by the method.

- You can access the original response and transform it in any way you want:
  ```typescript
    const myGetRepositoryFunction = getRepositoryFactory(
      // inject the default httpRequestFunction
      defaultHttpRequestFunction,

      // inject a custom transform-function
      (response: HttpResponse, context: DvelopContext, params: GetRepositoryParams) => {
        return `The name of a repository in '${context.systemBaseUri}' is '${response.data.name}.'`;
      }
    );

    const info: string = myGetRepositoryFunction({
      systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud",
      authSessionId: "dQw4w9WgXcQ"
    }, {
      repositoryId: "qnydFmqHuVo"
    });

    console.log(info); // The name of a repository in 'https://steamwheedle-cartel.d-velop.cloud' is 'Booty Bay Documents'.
  ```

- You can supply a different httpRequestFunction
- Some methods have additional steps (eg. the createDmsObject-function needs a storeFile-function which uploads a file and provides a download-url).

All DvelopHttp-stuff is provided by the ```@dvelop-sdk/core``` package. At the moment it mostly wraps ```axios``` as its main http-framework.

## Contributing
This project is maintained by d-velop but is looking for contributers. If you consider contributing to this project please read [CONTRIBUTING](CONTRIBUTING.md) for details on how to get started.


## License
Please read [LICENSE](LICENSE) for licensing information.

## Acknowledgments
Thanks to the following projects for inspiration

* [Starting an Open Source Project](https://opensource.guide/starting-a-project/)
* [README template](https://gist.github.com/PurpleBooth/109311bb0361f32d87a2)
* [CONTRIBUTING template](https://github.com/nayafia/contributing-template/blob/master/CONTRIBUTING-template.md)