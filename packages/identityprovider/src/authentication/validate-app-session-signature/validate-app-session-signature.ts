import { createHash } from "crypto";
import { AppSession } from "../request-app-session/request-app-session";

/**
* Indicates an invalid sign-value
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
 * Validate the sign value which is provided when an appSession is sent to your app. For further information on this process refer to the [documentation](https://developer.d-velop.de/documentation/idpapi/en/identityprovider-app-201523580.html#IdentityproviderApp-Inter-appcommunicationwithappsessions).
 *
 * ```typescript
 *   try {
 *     validateAppSessionSignature("cda-compliance", "qP-7GNoDJ5c", requestBody); //pass or error
 *   } catch(e) {
 *     // respond with 403 - Forbidden
 *   }
 * }
 * ```
 * @throws {@link InvalidAppSessionSignatureError} indicates that the sign-value is not valid
 * @category Authentication
 */
export function validateAppSessionSignature(appName: string, requestId: string, appSession: AppSession): void {
  const expectedSign: string = createHash("sha256").update(appName + appSession.appSessionId + appSession.expire + requestId, "utf8").digest("hex");
  if (expectedSign !== appSession.sign) {
    throw new InvalidAppSessionSignatureError();
  }
}