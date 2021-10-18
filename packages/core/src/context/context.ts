/** Defines a common d.velop context used across all requests. */
export interface DvelopContext {
  /** SystemBaseUri of a tenant */
  systemBaseUri?: string;
  /** Id of a tenant */
  tenantId?: string;
  /** AuthSessionId used for authorization */
  authSessionId?: string;
  /** RequestId used to track coherent requests over multiple apps */
  requestId?: string;
}