import { TraceContext } from "../trace-context";
import { randomBytes } from "crypto";


export function generateTraceContextFactory(
  generateTraceId: () => string,
  generateSpanId: () => string
): (traceId?: string, parentId?: string, spanId?: string, sampled?: boolean, version?: number) => TraceContext {
  return (traceId?: string, parentId?: string, spanId?: string, sampled?: boolean, version?: number) => {
    return {
      traceId: traceId ? traceId : generateTraceId(),
      parentId: parentId,
      spanId: spanId ? spanId : generateSpanId(),
      version: version ? version : 0,
      sampled: sampled ? sampled : false,
    };
  };
}


/**
 * Generates a new trace-id and returns the string representation.
 */
export function generateTraceId(): string {
  return randomBytes(16).toString("hex");
}

/**
 * Generates a new span-id and returns the string representation.
 */
export function generateSpanId(): string {
  return randomBytes(8).toString("hex");
}

/**
 *
 * @returns
 */
/* istanbul ignore next */
export function generateTraceContext(traceId?: string, parentId?: string, spandId?: string, sampled?: boolean, version?: number): TraceContext {
  return generateTraceContextFactory(generateTraceId, generateSpanId)(traceId, parentId, spandId, sampled, version);
}