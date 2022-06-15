import { generateSpanId } from "../generate-trace-context/generate-trace-context";
import { TraceContext } from "../trace-context";
import { TraceContextError } from "../trace-context-error";

enum BinaryTraceFlags {
  sampled = 0b00000001
}

/**
 * Factory for the {@link parseTraceparentHeader}-function.
 * @internal
 * @category Core
 */
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
 * Generates a corresponding traceparent-HTTP-Header for a {@link TraceContext}-object. See [W3C Trace Context](https://www.w3.org/TR/trace-context/) for more information.
 *
 * ```typescript
 * import { buildTraceparentHeader } from "@dvelop-sdk/core"
 *
 * const traceparentHeader: string = buildTraceparentHeader(traceContext);
 * console.log(traceparentHeader); // 00-00cbe959725ad2d75abd9d47017604d7-d84f4664cc5d1266-00
 * ```
 * @category Core
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
 * Parses the traceparent-HTTP-header into a {@link TraceContext}-object. See [W3C Trace Context](https://www.w3.org/TR/trace-context/) for more information.
 *
 * ```typescript
 * import { parseTraceparentHeader } from "@dvelop-sdk/core";
 *
 * const traceContext: TraceContext = parseTraceparentHeader("00-00cbe959725ad2d75abd9d47017604d7-d84f4664cc5d1266-00")
 * console.log(traceContext); // { traceId: '00cbe959725ad2d75abd9d47017604d7', spanId: '48743343d1130693', parentId: 'd84f4664cc5d1266', sampled: false, version: 0 }
 * ```
 * @category Core
 */
export function parseTraceparentHeader(traceparentHeader: string): TraceContext {
  return parseTraceparentHeaderFactory(generateSpanId)(traceparentHeader);
}