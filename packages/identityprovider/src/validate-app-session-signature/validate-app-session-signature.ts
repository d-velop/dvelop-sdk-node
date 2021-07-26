import { createHash } from "crypto";
import { InvalidAppSessionSignatureError } from "../index";

/**
 * Validate the sign value which is provided when an appSession is sent.
 *
 * @param {string} appName App that requested the appSession
 * @param {string} requestId The requestId that was sent when requesting an appSession
 * @param {string} authSessionId The authSessionId provided to your callback
 * @param {string} expire The expire value provided to your callback
 * @param {string} sign The sign value provided to your callback
 *
 * @throws {@link InvalidAppSessionSignatureError} indicates that the sign value is not valid
 *
 * //TODO: example
 */
export function validateAppSessionSignature(appName: string, requestId: string, authSessionId: string, expire: string, sign: string): void {
  const expectedSign: string = createHash("sha256").update(appName + authSessionId + expire + requestId, "utf8").digest("hex");
  if (expectedSign !== sign) {
    throw new InvalidAppSessionSignatureError();
  }
}