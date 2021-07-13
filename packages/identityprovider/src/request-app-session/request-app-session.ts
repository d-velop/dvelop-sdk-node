import axios from "axios";

/**
 * Request an appSession to be posted to the specified callback.
 *
 * @param {string} systemBaseUri SystemBaseUri for the tenant
 * @param {string} appName AppName of the requesting app
 * @param {string} callback CallbackUri with leading slash and appName
 * @param {string} requestId Unique requestId
 *
 * @example ```typescript
 * await requestAppSession("https://monster-ag.d-velop.cloud", "monster-hello", "/monster-hello/give/me/my/appsession", "UUID")
 * ```
 */
export async function requestAppSession(systemBaseUri: string, appName: string, callback: string, requestId: string): Promise<void> {

  const errorContext: string = "Failed to request appSession";

  try {
    await axios.post("/identityprovider/appsession", {
      appname: appName,
      callback: callback,
      requestid: requestId
    }, {
      baseURL: systemBaseUri,
      headers: {
        "Content-Type": "application/json",
        "Origin": systemBaseUri
      }
    });
  } catch (e) {
    e.message = `${errorContext}: ${e.message}`;
    throw e;
  }
}