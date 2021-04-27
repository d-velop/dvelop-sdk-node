/**
 * A valid authentication-session for the d.velop cloud. Refer to the [documentation](https://developer.d-velop.de/documentation/idpapi/en/identityprovider-app-201523580.html#validating-the-login) for further information.
 * @property {string} id Id for the AuthSession. This key will validate your requests. **The AuthSessionId should be kept secret and never be publicly available**
 * @property {Date} expire Date-Object for the point in time at which the AuthSessionId will no longer be valid.
 */
export interface AuthSession {
  id: string;
  expire: Date;
}