import { DvelopSdkError } from "../errors/errors";
import * as crypto from "crypto";

/**
 * Defines the header used for distributed tracing. A Traceparent is based on the [W3C Trace Context specification](https://www.w3.org/TR/trace-context/#traceparent-header).
 */
export interface TraceContext {
  version: number;
  traceId: string;
  parentId?: string;
  spanId: string;
  sampled: boolean;
}

/**
* Indicates an error with the TraceContext.
* @category Error
*/
export class TraceContextError extends DvelopSdkError {
  // eslint-disable-next-line no-unused-vars
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, TraceContextError.prototype);
  }
}

enum BinaryTraceFlags {
  sampled = 0b00000001
}

/**
 * Parses a traceparent header.
 * @param traceparentHeader Value obtained from the traceparent HTTP header.
 */
export function parseTraceparentHeader(traceparentHeader: string): TraceContext {
  if (!isValidHeader(traceparentHeader)) {
    throw new TraceContextError(`traceparent-Header '${traceparentHeader}' is malformed.`);
  }

  const parts = traceparentHeader.split("-");

  return {
    traceId: parts[1],
    spanId: generateSpanId(),
    parentId: parts[2],
    sampled: (parseInt(parts[3], 16) & BinaryTraceFlags.sampled) === BinaryTraceFlags.sampled,
    version: parseInt(parts[0], 16)
  };
}

/**
 * Generates a new traceparent header based on a given traceId, spanId and flags.
 */
export function buildTraceparentHeader(traceContext: TraceContext): string {
  if (!isValidTraceId(traceContext.traceId)) {
    throw new TraceContextError(`TraceId '${traceContext.traceId}' is malformed.`);
  }
  if (!isValidParentId(traceContext.spanId)) {
    throw new TraceContextError(`SpanId '${traceContext.spanId}' is malformed.`);
  }

  let binaryFlags = 0b00000000;
  if (traceContext.sampled) {
    binaryFlags = binaryFlags | BinaryTraceFlags.sampled;
  }

  return `00-${traceContext.traceId}-${traceContext.spanId}-${toHex(binaryFlags)}`;
}

/**
 * Generates a new span-id and returns the string representation.
 */
export function generateSpanId(): string {
  return crypto.randomBytes(8).toString("hex");
}

/**
 * Generates a new trace-id and returns the string representation.
 */
export function generateTraceId(): string {
  return crypto.randomBytes(16).toString("hex");
}

function isValidHeader(header: string) {
  return /^[\da-f]{2}-[\da-f]{32}-[\da-f]{16}-[\da-f]{2}$/.test(header);
}

function isValidTraceId(traceId: string) {
  return /^[\da-f]{32}$/.test(traceId);
}

function isValidParentId(parentId: string) {
  return /^[\da-f]{16}$/.test(parentId);
}

function toHex(n: number): string {
  let h = n.toString(16);
  /* istanbul ignore next */
  if ((h.length % 2) > 0) {
    h = "0" + h;
  }
  return h;
}
