/**
 * RequestSignature is invalid for given appSecret.
 * @category Error
 */
export class InvalidRequestSignatureError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(context: string, public systemBaseUri: string, public tenantId: string, public requestSignature: string) {
    super(`${context}: RequestSignature '${requestSignature}' can not be validated for '${systemBaseUri}' and '${tenantId}' with given appSecret.`);
    Object.setPrototypeOf(this, InvalidRequestSignatureError.prototype);
  }
}