import { createHash } from "crypto";

/**
*
* @category Error
*/
export class InvalidAppSessionSignatureError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor() {
    super("Invalid AppSessionSingature: An AppSession was sent that contains no valid signature.");
    Object.setPrototypeOf(this, InvalidAppSessionSignatureError.prototype);
  }
}

/**
 * Validate the sign value which is provided when an appSession is sent. For further information on this process refer to the [documentation](https://developer.d-velop.de/documentation/idpapi/en/identityprovider-app-201523580.html#IdentityproviderApp-Inter-appcommunicationwithappsessions).
 *
 * @param {string} appName App that requested the appSession
 * @param {string} requestId The requestId that was sent when requesting an appSession
 * @param {string} authSessionId The authSessionId provided to your callback
 * @param {string} expire The expire value provided to your callback
 * @param {string} sign The sign value provided to your callback
 * @throws {@link InvalidAppSessionSignatureError} indicates that the sign value is not valid
 *
 * @category Authentication
 *
 * @example ```typescript
 * acceptPostRequest(req: Request, res: Respone) {
 *   try {
 *     validateAppSessionSignature("acme-app", "requestIdUsedOnAppSessionRequest", req.body.authSessionId, req.body.expire, req.body.sign); //pass or error
 *   } catch(e) {
 *     res.send("Forbidden");
 *   }
 * }
 * ```
 */
export function validateAppSessionSignature(appName: string, requestId: string, authSessionId: string, expire: string, sign: string): void {
  const expectedSign: string = createHash("sha256").update(appName + authSessionId + expire + requestId, "utf8").digest("hex");
  if (expectedSign !== sign) {
    throw new InvalidAppSessionSignatureError();
  }
}