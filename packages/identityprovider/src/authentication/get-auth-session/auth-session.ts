/**
 * Used for authentication in the d.velop cloud. Refer to the [documentation](https://developer.d-velop.de/documentation/idpapi/en/identityprovider-app-201523580.html#validating-the-login) for further information.
 * @category Authentication
 */
export interface AuthSession {

  /**
   * This key will validate your requests (usually sent as Bearer-Token). **The AuthSessionId should be kept secret and never be publicly available**
   */
  id: string;


  /**
   * Date at which the AuthSessionId will no longer be valid.
   */
  expire: Date;
}