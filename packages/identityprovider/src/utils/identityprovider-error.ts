import { BadInputError, DvelopSdkError, ForbiddenError, NotFoundError, UnauthorizedError } from "@dvelop-sdk/core";

/**
 * Generic Error for identityprovider-package.
 * @category Error
 */
/* istanbul ignore next */
export class IdentityproviderError extends DvelopSdkError {

  constructor(public message: string, public originalError?: Error) {
    super(message);
    Object.setPrototypeOf(this, IdentityproviderError.prototype);
  }
}

/**
 * Throws a typed error if the response indicates failure.
 * @internal
 * @category Http
 */
export async function ensureSuccessResponse(response: Response): Promise<void> {

  if (response.ok) return;

  let body: any;
  try {
    body = await response.clone().json();
  } catch {
    try {
      body = await response.clone().text();
    } catch {
      body = undefined;
    }
  }

  let reason: string | undefined;
  if (body) {
    reason = typeof body === "string" ? body : (body.reason ?? body.LocalizedMessage ?? undefined);
  }

  switch (response.status) {
  case 400:
    throw new BadInputError(reason ?? "Identityprovider-App responded with Status 400 indicating bad Request-Parameters.");
  case 401:
    throw new UnauthorizedError(reason ?? "Identityprovider-App responded with Status 401 indicating bad authSessionId.");
  case 403:
    throw new ForbiddenError(reason ?? "Identityprovider-App responded with Status 403 indicating a forbidden action.");
  case 404:
    throw new NotFoundError(reason ?? "Identityprovider-App responded with Status 404 indicating a requested resource does not exist.");
  default:
    throw new IdentityproviderError(reason ?? `Identityprovider-App responded with status ${response.status}.`);
  }
}
