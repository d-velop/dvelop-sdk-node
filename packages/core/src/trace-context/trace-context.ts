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