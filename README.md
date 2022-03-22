<div align="center">

  <h1>dvelop-sdk-node</h1>

  <img alt="GitHub" src="https://img.shields.io/github/license/d-velop/dvelop-sdk-node?style=for-the-badge">

  </br>

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
  <a href="https://www.npmjs.com/package/@dvelop-sdk/express-utils">
    <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/express-utils?label=express-utils&style=for-the-badge">
  </a>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/business-objects">
    <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/business-objects?label=business-objects&style=for-the-badge">
  </a>

  </br>

  <a href="https://d-velop.github.io/dvelop-sdk-node/modules.html"><strong>Explore the docs »</strong></a>

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