import { TraceContext } from "../trace-context";
import { randomBytes } from "crypto";

/**
 * Factory for the {@link generateTraceContext}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Core
 */
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
 * Generate a new trace-id in its string representation. See [W3C Trace Context](https://www.w3.org/TR/trace-context/) for more information.
 *
 * ```typescript
 * import { generateTraceId } from "@dvelop-sdk/core";
 *
 * const traceId: string = generateTraceId();
 * console.log(traceId); // 4ea7f85225da7d0acc52f7fce3db4a92
 * ```
 * @category Core
 */
export function generateTraceId(): string {
  return randomBytes(16).toString("hex");
}

/**
 * Generates a new span-id and returns the string representation. See [W3C Trace Context](https://www.w3.org/TR/trace-context/) for more information.
 *
 * ```typescript
 * import { generateSpanId } from "@dvelop-sdk/core";
 *
 * const spanId: string = generateSpanId();
 * console.log(spanId); // cacc9b0efc059633
 * ```
 * @category Core
 */
export function generateSpanId(): string {
  return randomBytes(8).toString("hex");
}

/**
 * Generate a new {@link TraceContext}-object. See [W3C Trace Context](https://www.w3.org/TR/trace-context/) for more information.

 * ```typescript
 * import { TraceContext, generateTraceContext } from "@dvelop-sdk/core";
 *
 * const traceContext: TraceContext = generateTraceContext();
 * console.log(traceContext); // { traceId: '14d3ce602b42d045776144889ac22065', parentId: undefined, spanId: '5afd7bd9caad89de', version: 0, sampled: false }
 *
 * // can also be initialized with predefined values
 * const traceContext2: TraceContext = generateTraceContext("4ea7f85225da7d0acc52f7fce3db4a92", "cacc9b0efc059633");
 * console.log(traceContext2); //{ traceId: '4ea7f85225da7d0acc52f7fce3db4a92', parentId: 'cacc9b0efc059633', spanId: '7164846a72d30523', version: 0, sampled: false }
 * ```
 * @category Core
 */
/* istanbul ignore next */
export function generateTraceContext(traceId?: string, parentId?: string, spandId?: string, sampled?: boolean, version?: number): TraceContext {
  return generateTraceContextFactory(generateTraceId, generateSpanId)(traceId, parentId, spandId, sampled, version);
}