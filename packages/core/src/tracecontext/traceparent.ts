import {DvelopSdkError} from "../errors/errors";

export interface Traceparent {
  version: number;
  traceId: string;
  parentId: string;
  traceFlags: TraceFlags;
}

export enum TraceFlags {
  none = 0,
  sampled = 1 << 0
}

// export interface Traceflags {
//   sampled: boolean;
// }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function parseTraceparent(traceparentHeader: string): Traceparent {
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

function isValidHeader (header: string) {
  return /^[\da-f]{2}-[\da-f]{32}-[\da-f]{16}-[\da-f]{2}$/.test(header);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function buildTraceparent(traceId: string, spanId: string, flags?: TraceFlags): string {
  return "";
}

export function generateSpanId(): string {
  return "";
}

export function generateTraceId(): string {
  return "";
}
