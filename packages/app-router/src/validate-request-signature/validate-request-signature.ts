import * as crypto from "crypto";
import { DvelopContext, DvelopSdkError } from "@dvelop-sdk/core";

/**
 * RequestSignature is invalid for given appSecret.
 * @category Error
 */
export class InvalidRequestSignatureError extends DvelopSdkError {
  // eslint-disable-next-line no-unused-vars
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidRequestSignatureError.prototype);
  }
}

/**
 * Validate a request-signature against your appSecret.
 *
 * **The requestSignature should be validated for every request when recieving calls from the d.velop cloud.
 * Refer to the [d.velop basics tenant header section](https://developer.d-velop.de/dev/en/basics#tenant-header) for more information.**
 *
 * @throws {@link InvalidRequestSignatureError} indicates that requestSignature was invalid for given appSecret.
 *
 * ```typescript
 * validateRequestSignature(process.env.APP_SECRET, "https://header.example.com", "a12be5", "Zjcf28p5aQ6amtbs6s9b9cPyBPdziwUslR2DZqaGUTQ=");
 * ```
 */
export function validateRequestSignature(appSecret: string, systemBaseUri: string, tenantId: string, requestSignature: string): void {

  let validSignature: boolean = false;

  try {
    const binarySignatureSecret = Buffer.from(appSecret, "base64");
    const computedHmac = crypto.createHmac("sha256", binarySignatureSecret).update(systemBaseUri + tenantId);
    validSignature = crypto.timingSafeEqual(Buffer.from(requestSignature), Buffer.from(computedHmac.digest("base64")));
  } catch (e) {
    throw new InvalidRequestSignatureError("Invalid request-signature.");
  }
  if (!validSignature) {
    throw new InvalidRequestSignatureError("Invalid request-signature.");
  }
}

/**
 * Validate a request-signature against your appSecret.
 *
 * **The requestSignature should be validated for every request when recieving calls from the d.velop cloud.
 * Refer to the [d.velop basics tenant header section](https://developer.d-velop.de/dev/en/basics#tenant-header) for more information.**
 *
 * ```typescript
 * validateDvelopContext(process.env.APP_SECRET, {
 *   systemBaseUri: "https://header.example.com",
 *   tenantId: "a12be5",
 *   requestId: "Zjcf28p5aQ6amtbs6s9b9cPyBPdziwUslR2DZqaGUTQ="
 * );
 *
 * @throws {@link InvalidRequestSignatureError} indicates that requestSignature was invalid for given appSecret.
 * ```
 */
export function validateDvelopContext(appSecret: string, context: DvelopContext): void {
  const systemBaseUri = context.systemBaseUri || "";
  const tenantId = context.tenantId || "";
  const requestSignature = context.requestSignature || "";
  validateRequestSignature(appSecret, systemBaseUri, tenantId, requestSignature);
}