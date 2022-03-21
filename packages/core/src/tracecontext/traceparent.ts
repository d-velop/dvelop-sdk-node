import {DvelopSdkError} from "../errors/errors";
import * as crypto from "crypto";

/**
 * Defines the header used for distributed tracing. A Traceparent is based on the [W3C Trace Context specification](https://www.w3.org/TR/trace-context/#traceparent-header).
 */
export interface Traceparent {
  version: number;
  traceId: string;
  parentId: string;
  traceFlags: TraceFlags;
}

/**
 *  Represents [trace-flags](https://www.w3.org/TR/trace-context/#trace-flags) as part of the traceparent header.
 */
export interface TraceFlags {
  sampled: boolean;
}

enum BinaryTraceFlags {
  sampled = 0b00000001
}

/**
 * Parses a traceparent header.
 * @param traceparentHeader Value obtained from the traceparent HTTP header.
 */
export function parseTraceparentHeader(traceparentHeader: string): Traceparent {
  if(!isValidHeader(traceparentHeader)) {
    throw new DvelopSdkError("Invalid traceparent header");
  }

  const parts = traceparentHeader.split("-");

  return {
    traceId: parts[1],
    parentId: parts[2],
    traceFlags: parseBinaryTraceFlags(parseInt(parts[3], 16)),
    version: parseInt(parts[0], 16)
  };
}

/**
 * Generates a new traceparent header based on a given traceId, spanId and flags.
 */
export function buildTraceparentHeader(traceId: string, spanId: string, flags?: TraceFlags): string {
  if(!isValidTraceId(traceId)) {
    throw new DvelopSdkError("Invalid traceId");
  }
  if(!isValidParentId(spanId)) {
    throw new DvelopSdkError("Invalid spanId");
  }

  if(flags === undefined) {
    flags = {
      sampled: true
    };
  }

  let binaryFlags = 0b00000000;
  if(flags.sampled) {
    binaryFlags = binaryFlags | BinaryTraceFlags.sampled;
  }

  return `00-${traceId}-${spanId}-${toHex(binaryFlags)}`;
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

function parseBinaryTraceFlags(flags: number): TraceFlags {
  return {
    sampled: (flags & BinaryTraceFlags.sampled) === BinaryTraceFlags.sampled
  };
}

function isValidHeader (header: string) {
  return /^[\da-f]{2}-[\da-f]{32}-[\da-f]{16}-[\da-f]{2}$/.test(header);
}

function isValidTraceId (traceId: string) {
  return /^[\da-f]{32}$/.test(traceId);
}

function isValidParentId (parentId: string) {
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
