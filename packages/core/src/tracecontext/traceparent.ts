import {DvelopSdkError} from "../errors/errors";

export interface Traceparent {
  version: number;
  traceId: string;
  parentId: string;
  traceFlags: TraceFlags;
}

export enum TraceFlags {
  none = 0b00000000,
  sampled = 0b00000001
}

const unknownFlagsEliminationMask = 0b00000001;

export function parseTraceparentHeader(traceparentHeader: string): Traceparent {
  if(!isValidHeader(traceparentHeader)) {
    throw new DvelopSdkError("Invalid traceparent header");
  }

  const parts = traceparentHeader.split("-");
  if(parts.length !== 4) {
    throw new DvelopSdkError("Invalid traceparent header");
  }

  return {
    traceId: parts[1],
    parentId: parts[2],
    traceFlags: parseInt(parts[3], 16),
    version: parseInt(parts[0], 16)
  };
}

export function buildTraceparentHeader(traceId: string, spanId: string, flags?: TraceFlags): string {
  if(!isValidTraceId(traceId)) {
    throw new DvelopSdkError("Invalid traceId");
  }
  if(!isValidParentId(spanId)) {
    throw new DvelopSdkError("Invalid spanId");
  }

  if(flags == undefined) {
    flags = TraceFlags.sampled;
  } else {
    flags = flags & unknownFlagsEliminationMask;
  }

  return `00-${traceId}-${spanId}-${toHex(flags)}`;
}

export function generateSpanId(): string {
  return "";
}

export function generateTraceId(): string {
  return "";
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
  if ((h.length % 2) > 0) {
    h = "0" + h;
  }
  return h;
}
