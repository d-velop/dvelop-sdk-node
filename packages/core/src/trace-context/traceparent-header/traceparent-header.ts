import { generateSpanId } from "../generate-trace-context/generate-trace-context";
import { TraceContext } from "../trace-context";
import { TraceContextError } from "../trace-context-error";

enum BinaryTraceFlags {
  sampled = 0b00000001
}

export function parseTraceparentHeaderFactory(generateSpanId: () => string): (traceparentHeader: string, spanId?: string) => TraceContext {
  return (traceparentHeader: string, spanId?: string) => {

    if (!isValidHeader(traceparentHeader)) {
      throw new TraceContextError(`traceparent-Header '${traceparentHeader}' is malformed.`);
    }

    const parts = traceparentHeader.split("-");

    return {
      traceId: parts[1],
      spanId: spanId ? spanId : generateSpanId(),
      parentId: parts[2],
      sampled: (parseInt(parts[3], 16) & BinaryTraceFlags.sampled) === BinaryTraceFlags.sampled,
      version: parseInt(parts[0], 16)
    };
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

/**
 * Parses the traceparent header into a {@link TraceContext}-object
 * @param traceparentHeader Value obtained from the "traceparent"-HTTP-Header
 */
export function parseTraceparentHeader(traceparentHeader: string): TraceContext {
  return parseTraceparentHeaderFactory(generateSpanId)(traceparentHeader);
}