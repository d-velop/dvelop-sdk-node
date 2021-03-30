/**
 * This module contains functionality for the [Identityprovider-App](https://developer.d-velop.de/documentation/idpapi/en/identityprovider-app-201523580.html) in the d.velop cloud.
 * @module identityprovider
 */
export { AuthSession } from "./get-auth-session/auth-session";
export { getAuthSession } from "./get-auth-session/get-auth-session";
export { ScimUser } from "./validate-auth-session-id/scrim-user";
export { validateAuthSessionId } from "./validate-auth-session-id/validate-auth-session-id";