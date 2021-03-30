/**
 * A valid authentication-session for the d.velop cloud. Refer to the [documentation](https://developer.d-velop.de/documentation/idpapi/en/identityprovider-app-201523580.html#validating-the-login) for further information.
 * @property {string} id Id for the Authsession. This Key will validate your requests. **The AuthsessionId should be kept secret and never be publicly available**
 * @property {Date} expire Date-Object for the point in time at which the AuthsessionId will no longer be valid.
 */
export interface Authsession {
  id: string;
  expire: Date;
}