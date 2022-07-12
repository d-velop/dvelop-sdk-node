import { TraceContext } from "../trace-context/trace-context";

/** Defines a common d.velop context used across all requests. */
export interface DvelopContext {
  /** SystemBaseUri of a tenant */
  systemBaseUri?: string;
  /** Id of a tenant */
  tenantId?: string;
  /** Signature assigned by the app-router.
   * **The requestSignature should be validated for every request when recieving calls from the d.velop cloud.
   * Refer to the [d.velop basics tenant header section](https://developer.d-velop.de/dev/en/basics#tenant-header) for more information.**
   */
  requestSignature?: string;
  /** AuthSessionId used for authorization */
  authSessionId?: string;
  /** RequestId used to track coherent requests over multiple apps */
  requestId?: string;
  /** [W3C Trace Context](https://www.w3.org/TR/trace-context/) */
  traceContext?: TraceContext;
}
