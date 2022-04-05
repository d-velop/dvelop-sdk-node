/* eslint-disable no-dupe-class-members */
import { DvelopContext } from "@dvelop-sdk/core";
import { DvelopLoggerOptions, DvelopLogEvent, Severity } from "./log-event";

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

  constructor(public options: DvelopLoggerOptions) {
    if (options.provider.length === 0) {
      throw new Error("No logging provider defined.");
    }
  }

  /**
   * Log a message with severity `Error`.
   * @param context A {@link DvelopContext}
   * @param message A value containing the body of the log record. Can be for example
   * a human-readable string message (including multi-line) describing the event in
   * a free form or it can be a structured data composed of arrays and maps of other
   * values. Can vary for each occurrence of the event coming from the same source.
   */
  public error(context: DvelopContext, message: string): void;
  /**
   * Log a message with severity `Error`.
   * @param context A {@link DvelopContext}
   * @param event A {@link DvelopLogEvent} object.
   */
  public error(context: DvelopContext, event: DvelopLogEvent): void;
  public error(context: DvelopContext, parameter: string | DvelopLogEvent): void {
    this.log(context, Severity.error, typeof parameter === "string" ? { message: parameter } : parameter);
  }

  /**
   * Log a message with severity `Warn`.
   * @param context A {@link DvelopContext}
   * @param message A value containing the body of the log record. Can be for example
   * a human-readable string message (including multi-line) describing the event in
   * a free form or it can be a structured data composed of arrays and maps of other
   * values. Can vary for each occurrence of the event coming from the same source.
   */
  public warn(context: DvelopContext, message: string): void;
  /**
   * Log a message with severity `Warn`.
   * @param context A {@link DvelopContext}
   * @param event A {@link DvelopLogEvent} object.
   */
  public warn(context: DvelopContext, event: DvelopLogEvent): void;
  public warn(context: DvelopContext, parameter: string | DvelopLogEvent): void {
    this.log(context, Severity.warn, typeof parameter === "string" ? { message: parameter } : parameter);
  }

  /**
   * Log a message with severity `Info`.
   * @param context A {@link DvelopContext}
   * @param message A value containing the body of the log record. Can be for example
   * a human-readable string message (including multi-line) describing the event in
   * a free form or it can be a structured data composed of arrays and maps of other
   * values. Can vary for each occurrence of the event coming from the same source.
   */
  public info(context: DvelopContext, message: string): void;
  /**
   * Log a message with severity `Info`.
   * @param context A {@link DvelopContext}
   * @param event A {@link DvelopLogEvent} object.
   */
  public info(context: DvelopContext, event: DvelopLogEvent): void;
  public info(context: DvelopContext, parameter: string | DvelopLogEvent): void {
    this.log(context, Severity.info, typeof parameter === "string" ? { message: parameter } : parameter);
  }

  /**
   * Log a message with severity `Debug`.
   * @param context A {@link DvelopContext}
   * @param message A value containing the body of the log record. Can be for example
   * a human-readable string message (including multi-line) describing the event in
   * a free form or it can be a structured data composed of arrays and maps of other
   * values. Can vary for each occurrence of the event coming from the same source.
   */
  public debug(context: DvelopContext, message: string): void;
  /**
   * Log a message with severity `Debug`.
   * @param context A {@link DvelopContext}
   * @param event A {@link DvelopLogEvent} object.
   */
  public debug(context: DvelopContext, event: DvelopLogEvent): void;
  public debug(context: DvelopContext, parameter: string | DvelopLogEvent): void {
    this.log(context, Severity.debug, typeof parameter === "string" ? { message: parameter } : parameter);
  }

  private log(context: DvelopContext, severity: Severity, options: DvelopLogEvent): void {
    for (const provider of this.options.provider) {
      provider(context, severity, options);
    }
  }
}
