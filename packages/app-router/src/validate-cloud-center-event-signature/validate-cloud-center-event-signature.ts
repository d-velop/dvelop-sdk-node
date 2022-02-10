import { createHash, createHmac, timingSafeEqual } from "crypto";
import { DvelopSdkError } from "@dvelop-sdk/core";

/**
 * RequestSignature is invalid for given appSecret.
 * @category Error
 */
export class InvalidCloudCenterEventSignatureError extends DvelopSdkError {
  // eslint-disable-next-line no-unused-vars
  constructor() {
    super("Invalid CloudCenterEvent-signature: A cloud center event was recieved but signature was invalid.");
    Object.setPrototypeOf(this, InvalidCloudCenterEventSignatureError.prototype);
  }
}

/**
 * RequestSignature is invalid for given appSecret.
 * @category Error
 */
export interface ValidateCloudCenterEventSignatureParams {
  httpMethod: string,
  resourcePath: string,
  queryString: string,
  headers: { [key: string]: string | undefined },
  payload: any,
  cloudCenterEventSignature: string
}

/**
 * Validate a cloud-center-event-signature against your appSecret.
 *
 * **The cloud-center-event-signature should be validated for every cloud-center-event.
 * Refer to the [d.velop cloud center API](https://developer.d-velop.de/documentation/ccapi/en) for more information.**
 *
 * @throws {@link InvalidCloudCenterEventSignatureError} indicates that a cloud-center-event had an invalid signature.
 *
 * ```typescript
 * validateCloudCenterEventSignature(
 *   process.env.APP_SECRET,
 *   "POST",
 *   "/myapp/dvelop-cloud-lifecycle-event",
 *   "",
 *   {
 *     "x-dv-signature-algorithm": "DV1-HMAC-SHA256",
 *     "x-dv-signature-headers": "x-dv-signature-algorithm,x-dv-signature-headers,x-dv-signature-timestamp",
 *     "x-dv-signature-timestamp": "2019-08-09T08:49:42Z"
 *   }, {
 *     "type": "subscribe",
 *     "tenantId": "id",
 *     "baseUri": "https://someone.d-velop.cloud"
 *   },
 *   "02783453441665bf27aa465cbbac9b98507ae94c54b6be2b1882fe9a05ec104c"
 * );
 * ```
 */
export function validateCloudCenterEventSignature(appSecret: string, params: ValidateCloudCenterEventSignatureParams): void {

  let validSignature: boolean = false;

  try {
    const normalizedHeaderString: string | undefined = params.headers["x-dv-signature-headers"]?.split(",").reduce((headerString: string, header: string) => {
      return headerString + header.toLowerCase() + ":" + params.headers[header]?.trim() + "\n";
    }, "");
    const sha256Payload: string = createHash("sha256").update(`${JSON.stringify(params.payload)}\n`).digest("hex");
    const normalizedRequestString: string = `${params.httpMethod.toUpperCase()}\n${params.resourcePath}\n${params.queryString}\n${normalizedHeaderString}\n${sha256Payload}`;
    const sha256RequestString: string = createHash("sha256").update(normalizedRequestString).digest("hex");
    const calculatedSignature: string = createHmac("sha256", Buffer.from(appSecret, "base64")).update(sha256RequestString).digest("hex");
    validSignature = timingSafeEqual(Buffer.from(params.cloudCenterEventSignature), Buffer.from(calculatedSignature));
  } catch (e) {
    throw new InvalidCloudCenterEventSignatureError();
  }
  if (!validSignature) {
    throw new InvalidCloudCenterEventSignatureError();
  }
}