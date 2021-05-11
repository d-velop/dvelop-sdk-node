<div align="center">
  <img alt="GitHub" src="https://img.shields.io/github/license/d-velop/dvelop-sdk-node?style=for-the-badge">
  <img alt="GitHub milestone" src="https://img.shields.io/github/milestones/progress-percent/d-velop/dvelop-sdk-node/1?style=for-the-badge">
</div>

</br>

<div align="center">
  <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/app-router?label=app-router&style=for-the-badge">
  <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/identityprovider?label=identityprovider&style=for-the-badge">
  <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/task?label=task&style=for-the-badge">
  </div>
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
npm i @dvelop/identityprovider @dvelop/task
```
``` typescript
import { getAuthSessionByApiKey } from '@dvelop/identityprovider';
import * as taskApp from '@dvelop/task';

(async function main() {
  const authSessionId = await getAuthSessionByApiKey('<SYSTEM_BASE_URI>', '<API_KEY>');
  await taskApp.completeTask(systemBaseUri, authSessionId, '<TASK_LOCATION>');
})();
```

<div align="center">
  <a href="https://d-velop.github.io/dvelop-sdk-node/modules.html"><strong>Explore the docs »</strong></a>
</div>
</br>

## Build an app with express

This SDK was designed framework agnostic but with [express](https://www.npmjs.com/package/express) in mind.

```
npm i express cookie-parser @dvelop-sdk/app-router @dvelop-sdk/identityprovider
npm i @types/express @types/cookie-parser -D
```

```typescript
import express, { Application, Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import * as appRouter from "@dvelop-sdk/app-router";
import { validateAuthSessionId, getLoginRedirectionUri, ScimUser } from "@dvelop-sdk/identityprovider";

const app: Application = express();
const appName: string = "acme-lklo";

declare global {
  namespace Express {
    interface Request {
      systemBaseUri?: string;
      tenantId?: string;
      requestId?: string;
      principal?: ScimUser;
    }
  }
}

// Middleware
app.use(cookieParser());

app.use((req: Request, res: Response, next: NextFunction) => {

  const systemBaseUri: string = req.header(appRouter.DVELOP_SYSTEM_BASE_URI_HEADER);
  const tenantId: string = req.header(appRouter.DVELOP_TENANT_ID_HEADER);
  const requestSignature: string = req.header(appRouter.DVELOP_REQUEST_SIGNATURE_HEADER);

  const validRequest: boolean = appRouter.validateRequestSignature(process.env.SIGNATURE_SECRET, systemBaseUri, tenantId, requestSignature)

  if (validRequest) {
    req.systemBaseUri = systemBaseUri;
    req.tenantId = tenantId
    req.requestId = req.header(appRouter.DVELOP_REQUEST_ID_HEADER);
    next();
  } else {
    res.status(403).send('Forbidden');
  }
});

// Routes
app.get(`/${appName}/me`, async (req: Request, res: Response) => {

  let authSessionId: string;

  const authorizationHeader = req.get("Authorization");
  const authorizationCookie = req.cookies["AuthSessionId"];
  if (authorizationHeader) {
    authSessionId = new RegExp(/^bearer (.*)$/, "i").exec(authorizationHeader)[1];
  } else if (authorizationCookie) {
    authSessionId = authorizationCookie;
  }

  try {
    const user: ScimUser = await validateAuthSessionId(req.systemBaseUri, authSessionId);
    req.principal = user;
    res.status(200).send(`Hello ${req.principal.displayName}!`)
  } catch (e) {
    console.log("Unauthorized. Redirecting ...");
    res.redirect(getLoginRedirectionUri(req.originalUrl));
  }
});

app.get(`/${appName}`, (_: Request, res: Response) => {
  res.status(200).send(`Hello from ${process.env.npm_package_name} (${process.env.npm_package_version})!`);
});

app.use("/", (_: Request, res: Response) => {
  res.redirect(`/${appName}`);
});

// Start
app.listen(8000, () => {
  console.log(`Server listening on port 8000`);
});
```

<div align="center">
  <a href="https://d-velop.github.io/dvelop-sdk-node/modules.html"><strong>Explore the docs »</strong></a>
</div>

</br>

## Contributing
This project is maintained by d-velop but is looking for contributers. If you consider contributing to this project please read [CONTRIBUTING](CONTRIBUTING.md) for details on how to get started.


## License
Please read [LICENSE](LICENSE) for licensing information.

## Acknowledgments
Thanks to the following projects for inspiration

* [Starting an Open Source Project](https://opensource.guide/starting-a-project/)
* [README template](https://gist.github.com/PurpleBooth/109311bb0361f32d87a2)
* [CONTRIBUTING template](https://github.com/nayafia/contributing-template/blob/master/CONTRIBUTING-template.md)