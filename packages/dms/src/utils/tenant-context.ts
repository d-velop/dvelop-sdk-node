export interface TenantContext {
  /** SystemBaseUri for the tenant */
  systemBaseUri: string;
  /** Valid authSessionId */
  authSessionId: string;
}