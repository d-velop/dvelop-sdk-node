import * as crypto from "crypto";
import { InvalidRequestSignatureError } from "../errors";

/**
 * Validate a request-signature against your appSecret.
 *
 * **The requestSignature should be validated for every request when recieving calls from the d.velop cloud.
 * Refer to the [d.velop basics tenant header section](https://developer.d-velop.de/dev/en/basics#tenant-header) for more information.**
 *
 * @param {string} appSecret The secret generated for your app in the cloud-center
 * @param {string} systemBaseUri SystemBaseUri for the tenant (found in 'x-dv-baseuri'-header)
 * @param {string} tenantId ID for the tenant (found in 'x-dv-tenant-id'-header)
 * @param {string} requestSignature ID for the request (found in 'x-dv-sig-1'-header)
 *
 * @throws {@link InvalidRequestSignatureError} indicates that requestSignature was invalid for given appSecret.
 *
 * @example ```typescript
 * validateRequestSignature("ptuQ0b0BskmLLxXsjjhH9Su8ozTvZl6Z/5/HlaORoRg=", "https://header.example.com", "a12be5", "Zjcf28p5aQ6amtbs6s9b9cPyBPdziwUslR2DZqaGUTQ=");
 * ```
 */
export function validateRequestSignature(appSecret: string, systemBaseUri: string, tenantId: string, requestSignature: string): void {

  const errorContext: string = "Failed to validate requestSignature";
  let validSignature: boolean = false;

  try {
    const binarySignatureSecret = Buffer.from(appSecret, "base64");
    const computedHmac = crypto.createHmac("sha256", binarySignatureSecret).update(systemBaseUri + tenantId);
    validSignature = crypto.timingSafeEqual(Buffer.from(requestSignature), Buffer.from(computedHmac.digest("base64")));
  } catch (e) {
    throw new InvalidRequestSignatureError(errorContext, systemBaseUri, tenantId, requestSignature);
  }
  if (!validSignature) {
    throw new InvalidRequestSignatureError(errorContext, systemBaseUri, tenantId, requestSignature);
  }
}