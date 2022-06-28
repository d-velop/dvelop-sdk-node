/* eslint-disable no-dupe-class-members */
import { deepMergeObjects, DvelopContext } from "@dvelop-sdk/core";
import { DvelopLogEvent, DvelopLogLevel } from "./log-event";

/**
 * Type definition of logging providers.
 */
export type ProviderFn = (context: DvelopContext, event: DvelopLogEvent, level: DvelopLogLevel) => Promise<void>;

/**
 * Options needed to create a new {@link DvelopLogger}
 */
export interface DvelopLoggerOptions {
  providers: ProviderFn[];
  level?: DvelopLogLevel;
  defaults?: Partial<DvelopLogEvent>;
}

/**
 * General Logger class. This class does not log itself, but is a wrapper that wraps logging providers.
 * Each logging provider can decide how and where it logs a log statement.
 *
 * If you create a new instance, you have to define at least one {@link ProviderFn} in the options.
 *
 * This package delivers an {@link otelProviderFactory} function, to create a logging provider that
 * logs a log statement in the otel log format.
 */
export class DvelopLogger {

  public options: DvelopLoggerOptions;
  private mergeLogEvents: (...events: Partial<DvelopLogEvent>[]) => DvelopLogEvent;

  constructor(options: DvelopLoggerOptions);
  constructor(options: DvelopLoggerOptions, mergeLogEvents: (...events: Partial<DvelopLogEvent>[]) => DvelopLogEvent);
  constructor(options: DvelopLoggerOptions, mergeLogEvents: (...events: Partial<DvelopLogEvent>[]) => DvelopLogEvent = deepMergeObjects) {
    if (options.providers.length === 0) {
      throw new Error("No logging provider defined.");
    } else {
      this.options = options;
      this.mergeLogEvents = mergeLogEvents;
    }
  }

  /**
   * Log a message with severity `Error`.
   * @param context A {@link DvelopContext}
   * @param message A value containing the body of the log record. Can be a
   * human-readable string message (including multi-line) describing the event
   * in a free form. To pass structured data composed of arrays and maps of
   * other values, use a {@link DvelopLogEvent} instead of a string message.
   * Can vary for each occurrence of the event coming from the same source.
   */
  public error(context: DvelopContext, message: string): void;
  /**
   * Log a message with severity `Error`.
   * @param context A {@link DvelopContext}
   * @param event A {@link DvelopLogEvent} object.
   */
  public error(context: DvelopContext, event: DvelopLogEvent): void;
  public error(context: DvelopContext, parameter: string | DvelopLogEvent): void {
    this.log(context, (typeof parameter === "string" ? { message: parameter } : parameter), "error");
  }

  // /**
  //  * Log a message with severity `Warn`.
  //  * @param context A {@link DvelopContext}
  //  * @param message A value containing the body of the log record. Can be a
  //  * human-readable string message (including multi-line) describing the event
  //  * in a free form. To pass structured data composed of arrays and maps of
  //  * other values, use a {@link DvelopLogEvent} instead of a string message.
  //  * Can vary for each occurrence of the event coming from the same source.
  //  */
  // public warn(context: DvelopContext, message: string): void;
  // /**
  //  * Log a message with severity `Warn`.
  //  * @param context A {@link DvelopContext}
  //  * @param event A {@link DvelopLogEvent} object.
  //  */
  // public warn(context: DvelopContext, event: DvelopLogEvent): void;
  // public warn(context: DvelopContext, parameter: string | DvelopLogEvent): void {
  //   this.log(context, (typeof parameter === "string" ? { message: parameter } : parameter), "warn");
  // }

  /**
   * Log a message with severity `Info`.
   * @param context A {@link DvelopContext}
   * @param message A value containing the body of the log record. Can be a
   * human-readable string message (including multi-line) describing the event
   * in a free form. To pass structured data composed of arrays and maps of
   * other values, use a {@link DvelopLogEvent} instead of a string message.
   * Can vary for each occurrence of the event coming from the same source.
   */
  public info(context: DvelopContext, message: string): void;
  /**
   * Log a message with severity `Info`.
   * @param context A {@link DvelopContext}
   * @param event A {@link DvelopLogEvent} object.
   */
  public info(context: DvelopContext, event: DvelopLogEvent): void;
  public info(context: DvelopContext, parameter: string | DvelopLogEvent): void {
    this.log(context, (typeof parameter === "string" ? { message: parameter } : parameter), "info");
  }

  /**
   * Log a message with severity `Debug`.
   * @param context A {@link DvelopContext}
   * @param message A value containing the body of the log record. Can be a
   * human-readable string message (including multi-line) describing the event
   * in a free form. To pass structured data composed of arrays and maps of
   * other values, use a {@link DvelopLogEvent} instead of a string message.
   * Can vary for each occurrence of the event coming from the same source.
   */
  public debug(context: DvelopContext, message: string): void;
  /**
   * Log a message with severity `Debug`.
   * @param context A {@link DvelopContext}
   * @param event A {@link DvelopLogEvent} object.
   */
  public debug(context: DvelopContext, event: DvelopLogEvent): void;
  public debug(context: DvelopContext, parameter: string | DvelopLogEvent): void {
    this.log(context, (typeof parameter === "string" ? { message: parameter } : parameter), "debug");
  }

  private log(context: DvelopContext, event: DvelopLogEvent, level: DvelopLogLevel): void {

    let fullEvent: DvelopLogEvent = event;

    if (this.options.defaults) {
      fullEvent = this.mergeLogEvents(this.options.defaults, event);
    }

    for (const provider of this.options.providers) {
      provider(context, fullEvent, level);
    }
  }
}
