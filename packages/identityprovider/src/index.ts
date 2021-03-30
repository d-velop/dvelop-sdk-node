/**
 * This module contains functionality for the [Identityprovider-App](https://developer.d-velop.de/documentation/idpapi/en/identityprovider-app-201523580.html) in the d.velop cloud.
 * @module identityprovider
 */
export { AuthSession } from "./get-authsession/auth-session";
export { getAuthSession } from "./get-authsession/get-auth-session";
export { ScimUser } from "./validate-authsession-id/scrim-user";
export { validateAuthsessionId } from "./validate-authsession-id/validate-authsession-id";