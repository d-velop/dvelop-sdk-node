/** Defines a common d.velop context used across all requests. */
export interface DvelopContext {
  /** SystemBaseUri of a tenant */
  systemBaseUri?: string;
  /** AuthSessionId used for authorization */
  authSessionId?: string;
  /** RequestId used to track coherent requests over multiple apps */
  requestId?: string;
  /** TraceId from [W3C Trace Context](https://www.w3.org/TR/trace-context/) used to track coherent requests over multiple apps */
  traceId?: string;
  /** SpanId from [W3C Trace Context](https://www.w3.org/TR/trace-context/) */
  spanId?: string;
  /** Id of a tenant */
  tenantId?: string;
  /** Signature assigned by the app-router.
   * **The requestSignature should be validated for every request when recieving calls from the d.velop cloud.
   * Refer to the [d.velop basics tenant header section](https://developer.d-velop.de/dev/en/basics#tenant-header) for more information.**
   */
  requestSignature?: string;
}
