import { DvelopContext } from "@dvelop-sdk/core";
import { consoleTransport } from "../transports/console-transport";
import { httpTransportFactory } from "../transports/http-transport";
import { DvelopLogEvent, DvelopLogger, TransportFn } from "./logger";

export interface MyLogEvent {
  message: string;
  app?: string;
}

function format(_: DvelopContext, event: DvelopLogEvent<MyLogEvent>): string {

  let level: string;
  if (event.severity === "debug") {
    level = "[\x1b[90mDEBUG\x1b[0m]";
  } else if (event.severity === "info") {
    level = "[\x1b[32mINFO\x1b[0m] ";
  } else if (event.severity === "warn") {
    level = "[\x1b[33mWARN\x1b[0m] ";
  } else {
    level = "[\x1b[31mERROR\x1b[0m]";
  }

  const appString: string = event.app ? `\n${event.app} reported:\n` : "";
  const date: Date = new Date();
  const time: string = `\x1b[90m\x1b[1m${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}\x1b[0m`;

  return `${appString}${level} ${time} ${event.message}`;
}

export class DvelopSimpleLogger extends DvelopLogger<MyLogEvent> {
  constructor(transports: TransportFn[], defaults?: Partial<MyLogEvent>) {
    super(transports.map(t => {
      return {
        format: format,
        transport: t
      };
    }), defaults);
  }
}

// ====== USAGE ============================
const logger = new DvelopSimpleLogger([consoleTransport, httpTransportFactory({
  method: "POST",
  url: "https://eo86l449srg01vl.m.pipedream.net"
})], { app: "LoggingApp" });

logger.debug({}, {
  message: "blub"
});

logger.info({}, {
  message: "blub"
});
logger.warn({}, {
  message: "blub",
});
logger.error({}, {
  message: "blub"
});