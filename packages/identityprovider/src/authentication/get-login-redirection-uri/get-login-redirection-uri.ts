/**
 * Returns the URI a request should be redirected to in case it does not contain a valid authSessionId. Redirected requests will display a HTML Login for users to authenticate.
 *
 * @param {string} successUri The URI the request should be redirected to after a successful login
 *
 * @category Authentication
 *
 * @example ```typescript
 * const redirectionUri = getLoginRedirectionUri("<ORIGINAL_URL>");
 * request.redirect(redirectionUri);
 * ```
 */
export function getLoginRedirectionUri(successUri: string): string {
  return `/identityprovider/login?redirect=${encodeURIComponent(successUri)}`;
}


