<div align="center">
  <img alt="GitHub" src="https://img.shields.io/github/license/d-velop/dvelop-sdk-node?style=for-the-badge">
</div>

</br>

<div align="center">
  <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/app-router?label=app-router&style=for-the-badge">
  <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/identityprovider?label=identityprovider&style=for-the-badge">
  <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/task?label=task&style=for-the-badge">
</div>

</br>

<div align="center">
  <img alt="GitHub milestone" src="https://img.shields.io/github/milestones/progress-percent/d-velop/dvelop-sdk-node/2?style=for-the-badge">
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
npm i @dvelop-sdk/task
```
``` typescript
import { createTask, InvalidTaskError } from "@dvelop-sdk/task";

(async () => {

  try {
    const task = await createTask(systemBaseUri, apiKey, {
      subject: "Remember to be awesome!",
      assignees: ["1'm-74lk1n6-70-y0u"]
    });
    console.log("Task was created:", task);
  } catch (e) {
    if (e instanceof InvalidTaskError) {
      console.error(e.validation);
    } else {
      console.error(e.message)
    }
  }
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

async function main() {
  try {
    const task = await createTask(systemBaseUri, apiKey, {
      subject: "Remember to be awesome!",
      assignees: ["1'm-74lk1n6-70-y0u"]
    });
    console.log("Task was created:", task);
  } catch (e) {
    if (e instanceof InvalidTaskError) {
      console.error(e.validation);
    } else {
      console.error(e.message)
    }
  }
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
import * as appRouter from "@dvelop-sdk/app-router";
import * as idp from "@dvelop-sdk/identityprovider";

// ATTENTION: This should never be checked into version control
const APP_SECRET = process.env.APP_SECRET;

export function validateSignatureAndSetDvelopContext(req: Request, res: Response, next: NextFunction) {

  const systemBaseUri: string = req.header(appRouter.DVELOP_SYSTEM_BASE_URI_HEADER);
  const tenantId: string = req.header(appRouter.DVELOP_TENANT_ID_HEADER);
  const requestSignature: string = req.header(appRouter.DVELOP_REQUEST_SIGNATURE_HEADER);

  try {
    appRouter.validateRequestSignature(APP_SECRET, systemBaseUri, tenantId, requestSignature);
  } catch (e) {
    if (e instanceof appRouter.InvalidRequestSignatureError) {
      console.log(e);
      res.status(403).send('Forbidden');
    }
  }

  req.systemBaseUri = systemBaseUri;
  req.tenantId = tenantId
  req.requestId = req.header(appRouter.DVELOP_REQUEST_ID_HEADER);
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
    const user: idp.ScimUser = await idp.validateAuthSessionId(req.systemBaseUri, authSessionId);
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
### Custom axios instance
Under the hood this SDK makes extensive use of the axios-framework. All calls made use a fresh axios-instance. It is possible to intercept this instance-creation and provide your own factory method.

```
TODO
```

### Transformers
The methods provided by this SDK run an additionla transformation on API-Responses recieved. This is because:
1. We provide additional utility-methods (eg. dmsObject.getFile())
2. Not every property provided by our APIs is considered public. The main difference between public and non-public properties is that non-public properties can appear, change and disappear without notice.

It is recommended that you stick with the default implementation. If you however choose to access additional properties you can do so by providing a transformer to a function. It will have access to the ```AxiosResponse```-object which does not only provide the json response in the ```data```-property but also headers, statuscodes, initial config and the request made. Check out the axios docs for more information.

``` typescript
import { getRepository, internals } from "@dvelop-sdk/dms";

const raw: internals.GetRepositoryDto = await getRepository<internals.GetRepositoryDto>(
  { systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud", authSessionId: "dQw4w9WgXcQ" },
  { repositoryId: repoId },
  (response: AxiosResponse<internals.GetRepositoryDto>) => response.data
);
console.log(raw); //Raw JSON API response
```

``` typescript
import { getRepository, internals } from "@dvelop-sdk/dms";

const name: string = await getRepository<string>(
  { systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud", authSessionId: "dQw4w9WgXcQ" },
  { repositoryId: repoId },
 (response: AxiosResponse<internals.GetRepositoryDto>) => response.data.name
;
console.log(name); //Booty Bay Document
```

Under the hood we provide a transformer-type and implement that type with a default transformer.
```typescript
export type GetRepositoryTransformer<T> = (response: AxiosResponse<any>, context: Context, params: GetRepositoryParams) => T;

export const getRepositoryDefaultTransformer: GetRepositoryTransformer<Repository> = (response: AxiosResponse<any>, context: Context, params: GetRepositoryParams) => {
// our way of transforming
}

const getRepositoryCustomTransformer: GetRepositoryTransformer<string> = (res) => res.data.name
```

## Contributing
This project is maintained by d-velop but is looking for contributers. If you consider contributing to this project please read [CONTRIBUTING](CONTRIBUTING.md) for details on how to get started.


## License
Please read [LICENSE](LICENSE) for licensing information.

## Acknowledgments
Thanks to the following projects for inspiration

* [Starting an Open Source Project](https://opensource.guide/starting-a-project/)
* [README template](https://gist.github.com/PurpleBooth/109311bb0361f32d87a2)
* [CONTRIBUTING template](https://github.com/nayafia/contributing-template/blob/master/CONTRIBUTING-template.md)