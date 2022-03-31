import { deepMergeObjects, DvelopContext } from "@dvelop-sdk/core";

export type DvelopLogEventSeverity = "error" | "warn" | "info" | "debug" | number;
export type DvelopLogEvent<E> = E & { severity: DvelopLogEventSeverity };
export type FilterFn<E> = (context: DvelopContext, event: DvelopLogEvent<E>) => boolean;
export type FormatFn<E> = (context: DvelopContext, event: DvelopLogEvent<E>) => any;
export type TransportFn = (context: DvelopContext, event: any) => void | Promise<void>;

export interface DvelopLoggerOptions<E> {
  filter?: FilterFn<E>;
  format?: FormatFn<E>;
  transport: TransportFn;
}

export abstract class DvelopLogger<E> {

  constructor(
    public options: DvelopLoggerOptions<E>[],
    public defaults?: Partial<E>,
  ) { }

  error(context: DvelopContext, event: E): void {
    this.log(context, { ...{ severity: "error" }, ...event });
  }

  warn(context: DvelopContext, event: E): void {
    this.log(context, { ...{ severity: "warn" }, ...event });
  }

  info(context: DvelopContext, event: E): void {
    this.log(context, { ...{ severity: "info" }, ...event });
  }

  debug(context: DvelopContext, event: E): void {
    this.log(context, { ...{ severity: "debug" }, ...event });
  }

  log(context: DvelopContext, event: DvelopLogEvent<E>): void {
    this.options.forEach(opt => {
      if (!opt.filter || opt.filter(context, event)) {
        const eventWithDefaults: DvelopLogEvent<E> = this.defaults ? deepMergeObjects(this.defaults, event) as DvelopLogEvent<E> : { ...event };
        const formattedEvent: any = opt.format ? opt.format(context, eventWithDefaults) : eventWithDefaults;
        const promise: void | Promise<void> = opt.transport(context, formattedEvent);
        if (promise && promise.then) {
          promise.then(() => { return; });
        }
      }
    });
  }
}

