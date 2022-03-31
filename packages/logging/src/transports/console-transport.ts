import { DvelopContext } from "@dvelop-sdk/core";

export function consoleTransport(_: DvelopContext, event: any): void {
  // eslint-disable-next-line no-console
  console.log(event);
}

