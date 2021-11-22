/**
 * Returns the URI a request should be redirected to in case it does not contain a valid authSessionId. Redirected requests will display a HTML Login for users to authenticate.
 *
 * ```typescript
 * const redirectionUri = getLoginRedirectionUri("https://monster-ag.d-velop.cloud/cda-compliance/feature");
 * redirect(redirectionUri); // respond with 302
 * ```
 *
 * @category Authentication
 */
export function getLoginRedirectionUri(successUri: string): string {
  return `/identityprovider/login?redirect=${encodeURIComponent(successUri)}`;
}


