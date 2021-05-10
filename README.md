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

**This project has alpha status. There are currently no npm-releases. Expect things to change.**

This is the official SDK to build Apps for [d.velop cloud](https://www.d-velop.de/cloud/) using
[node.js](https://nodejs.org/en/) and [typescirpt](https://www.typescriptlang.org/).


## Getting started

This SDK is diveded into [apps](https://developer.d-velop.de/dev/de/explore-the-apps). Install individual packages per d-velop App you want to use.
```
npm i @dvelop/identityprovider @dvelop/task
```
``` typescript
import { getAuthSessionByApiKey } from '@dvelop/identityprovider';
import * as taskApp from '@dvelop/task';

(async function main() {
  const authSessionId = await getAuthSessionByApiKey('<SYSTEM_BASE_URI>', '<API_KEY>');
  await taskApp.completeTask(systemBaseUri, authSessionId, '123456');
})();
```

<div align="center">
  <a href="https://d-velop.github.io/dvelop-sdk-node/modules.html"><strong>Explore the docs »</strong></a>
</div>
</br>

## Build an app

This SDK was designed framework agnostic but with [express](https://www.npmjs.com/package/express) in mind.

### Check the request-signature
```
npm i @dvelop/app-router
```
``` typescript
import * as appRouter from '@dvelop/app-router';

// check request signature and set d-velop stuff for further usage
app.use((req, res, next) => {

  const systemBaseUri: string = req.header(appRouter.DVELOP_SYSTEM_BASE_URI_HEADER);
  const tenantId: string = req.header(appRouter.DVELOP_TENANT_ID_HEADER);
  const requestSignature: string = req.header(appRouter.DVELOP_REQUEST_SIGNATURE_HEADER);

  const validRequest: boolean = validateRequestSignature(process.env.APP_SECRET, systemBaseUri, tenantId, requestSignature)

  if (validRequest) {
    req.systemBaseUri = systemBaseUri;
    req.tenantId = tenantId
    req.requestId = req.header(appRouter.DVELOP_REQUEST_ID_HEADER);
    next();
  } else {
    res.status(403).send('Forbidden');
  }
});
```

<div align="center">
  <a href="https://d-velop.github.io/dvelop-sdk-node/modules.html"><strong>Explore the docs »</strong></a>
</div>

</br>

### Authenticate the user

```
npm i @dvelop/identityprovider
```
```typescript
import * as idp from '@dvelop/identityprovider';

// validate authSessionId and set user OR redirect request to login
app.use((req, res, next) => {

  // TODO: const authSessionId: string =

  if(authSessionId) {
    try {
      req.user = await validateAuthSessionId(req.systemBaseUri, authSessionId)
      next();
    } catch (e) {
      if (e.status !== 401) {
        // log error
        res.status(500).send('Internal server error');
      }
    }
  }

  const redirectUri: string = idp.getLoginRedirectionUri(req.originalUrl);
  req.redirect(redirectionUri);
});

// send a personal greeting if userName is defined
app.get((req, res) => {
  const userName: string = req.user.name || "world";
  res.status(200).send(`Hello ${req.user.name}!`)
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