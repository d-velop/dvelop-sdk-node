import * as crypto from "crypto";

export function validateRequestSignature(appSecret: string, systemBaseUri: string, tenantId: string, requestSignature: string): boolean {
  try {
    const binarySignatureSecret = Buffer.from(appSecret, "base64");
    const computedHmac = crypto.createHmac("sha256", binarySignatureSecret).update(systemBaseUri + tenantId);
    return crypto.timingSafeEqual(Buffer.from(requestSignature), Buffer.from(computedHmac.digest("base64")));
  } catch (e) {
    return false;
  }
}