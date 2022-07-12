<div align="center">
  <h1>@dvelop-sdk/logging</h1>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/logging">
    <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/logging?style=for-the-badge">
  </a>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/logging">
    <img alt="npm bundle size (scoped)" src="https://img.shields.io/bundlephobia/min/@dvelop-sdk/logging?style=for-the-badge">
  </a>
  <a href="https://github.com/d-velop/dvelop-sdk-node">
    <img alt="GitHub" src="https://img.shields.io/badge/GitHub-dvelop--sdk--node-%23ff0844?logo=github&style=for-the-badge">
  </a>
  <a href="https://github.com/d-velop/dvelop-sdk-node/blob/master/LICENSE">
    <img alt="license" src="https://img.shields.io/github/license/d-velop/dvelop-sdk-node?style=for-the-badge">
  </a>

  </br>

  <p>This package contains functions for logging with the OpenTelemetry.</p>

  <a href="https://d-velop.github.io/dvelop-sdk-node/modules/logging.html"><strong>Explore the docs »</strong></a>

  </br>

  <a href="https://www.npmjs.com/package/@dvelop-sdk/logging"><strong>Install via npm »</strong></a>

  </br>

  <a href="https://github.com/d-velop/dvelop-sdk-node"><strong>Check us out on GitHub »</strong></a>

</div>

## Just let me log
This package expoases a `DvelopLogger` class which is initialized with a level and 1-n `Providers` which hadnle Logging. See [Concepts](##Concepts) for more information.

### Initialize a logger
```typescript
const logger = new DvelopLogger({
  level: "info",// logs info and above
  providers: [
    // Providers define a loggin scheme. Currently only OTEL is supported.
    otelProviderFactory({

      appName: "acme-myapp",
      appVersion: "1.0.0",
      instanceId: "0",

      // Transports define where to send the logs. Mutliple transports can be used.
      transports: [
        consoleTransportFactory(), // logs to console
        fileTransportFactory("./logs.txt") // logs to file 'logs.txt'
      ]
    })
  ],
});
```

Supported LogLevels are `debug`, `info` and `error`, represented by exposed methods.

### Start Logging

The minimal logstatement defines a level and a string to log. The OTEL-Provdider transforms the information.

```typescript
logger.debug({}, "Hello World!");
/**
 * {
 *   "time":"2022-07-07T11:06:34.105Z",
 *   "sev":9,
 *   "body":"Hello World!",
 *   "res":{
 *     "svc":{
 *       "name":"acme-myapp",
 *       "ver":"1.0.0"
 *       "inst": "0"
 *     }
 *   },
 *   "vis":1
 * }
 */

```

For each method the first argument is a `DvelopContext`-object and the second argument a `DvelopLogEvent`-object.

```typescript

try {
  conviceLeonidasThatThisIsMadness();
} catch (error: any) {

  logger.error({
    systemBaseUri: "https://sparta.d-velop.cloud",
    tenantId: "T8r3cWM4JII"
  }, {
    name: "MissionFailedLogger",
    message: "Apperently this is Sparta",
    error: error,
    customAttributes: {
      learnings: "Don't stand near a well"
    }
  });
}
/**
 * {
 *   "time":"479BCT11:11:11.111Z",
 *   "sev":17,
 *   "name":"MissionFailedLogger",
 *   "body":"Apperently this is Sparta",
 *   "tn":"T8r3cWM4JII",
 *   "res":{
 *     "svc":{
 *       "name":"acme-myapp",
 *       "ver":"1.0.0",
 *       "inst": "0"
 *     }
 *   },
 *   "attr":{
 *     "learnings":"Don't stand near a well",
 *     "exception":{
 *       "message":"THIS IS SPARTA",
 *       "type":"RoundHouseKickError",
 *       "stacktrace":"..."
 *     }
 *   },
 *   "vis":1
 * }
 */

```

## Concepts
To work with logging you need to
* Transports
* Providers
* Loggers

### Transports
Transports are responsable for transporting a log-event. Transports are agnostic about the form of the log event.

```typescript
export type TransportFn = (event: any) => Promise<void>;
```

There are currently two default transports supported:
```typescript
import { TransportFn, consoleTransportFactory, fileTransportFactory } from "@dvelop-sdk/logging";

const consoleTransport: TransportFn = consoleTransportFactory();
await consoleTransport("Hello World!"); // log "Hello World" to console in Node.js and Browsers
const fileTransport: TransportFn = fileTransportFactory("./logs.txt");
await fileTransport("Hello World!"); // log "Hello World" to logs.txt
```

You can easily implement your own Transport-Function:
```typescript
async function myTransport(event: any): Promise<void> {
  // jump through hoops
}
```

### Providers
Providers are able to work with the `DvelopLogEvent`-Type. The do transformation and **may** support generic TransportFns, a subset or none (e.g a Syslog-Provider could have a UDP Transport to Port 514 baked in).

```typescript
export type ProviderFn = (context: DvelopContext, event: DvelopLogEvent, level: DvelopLogLevel) => Promise<void>;
```

 One default Provider is supported:
```typescript
import { ProviderFn, otelProviderFactory } from "@dvelop-sdk/logging";

const otel: ProviderFn =  otelProviderFactory({
  appName: "acme-myapp",
  appVersion: "1.0.0",
  instanceId: "0",
  transports: [ consoleTransport, fileTransport, myTransport ]
});
```

D.velop default is to log in a JSON-Format derived from the [Open Telemtry Standard](https://opentelemetry.io/docs/reference/specification/logs/overview). The `otelProviderFactory` creates a `ProviderFn` that is responsable for according transformations (e.g. map level "info" to OTELs numeric severity of 9).

You can easily implement your own Provider-Function:
```typescript

// do a fixed provider
async function myProvider(context: DvelopContext, event: DvelopLogEvent, level: DvelopLogLevel): Promise<void> {
  // jump through hoops
}

// or have some init
async function myProviderFactory(howMuchIsTheFish: number): ProviderFn {
  return (context: DvelopContext, event: DvelopLogEvent, level: DvelopLogLevel) => Promise<void> {
    // jump through hoops
  }
}

// or even support generic TransportFunctions
async function myProviderFactory(transports: TransportFn[]): ProviderFn {
  return (context: DvelopContext, event: DvelopLogEvent, level: DvelopLogLevel) => Promise<void> {
    const formattedEvent: any = {} // jump through hoops
    transports.forEach(t => t(formattedEvent));
  }
}
```

### Logger
Finally we have that can log something. The `DvelopLogger` accepts a level (everything above is logged) and 1-n provider-functions.