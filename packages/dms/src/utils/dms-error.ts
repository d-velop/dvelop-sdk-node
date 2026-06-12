import { BadInputError, DvelopSdkError, ForbiddenError, NotFoundError, UnauthorizedError } from "@dvelop-sdk/core";

/**
 * Generic Error for dms-package.
 * @category Error
 */
/* istanbul ignore next */
export class DmsError extends DvelopSdkError {

  constructor(public message: string, public originalError?: Error) {
    super(message);
    Object.setPrototypeOf(this, DmsError.prototype);
  }
}

async function readErrorBody(response: Response): Promise<any> {
  try {
    return await response.clone().json();
  } catch {
    try {
      return await response.clone().text();
    } catch {
      return undefined;
    }
  }
}

function reasonFrom(body: any): string | undefined {
  if (!body) return undefined;
  if (typeof body === "string") return body;
  return body.reason ?? body.LocalizedMessage ?? undefined;
}

/**
 * Throws a typed error if the response indicates failure.
 * @internal
 * @category Http
 */
export async function ensureSuccessResponse(response: Response): Promise<void> {
  if (response.ok) return;

  const body = await readErrorBody(response);
  const reason = reasonFrom(body);

  switch (response.status) {
  case 400:
    throw new BadInputError(reason ?? "DMS-App responded with Status 400 indicating bad Request-Parameters.");
  case 401:
    throw new UnauthorizedError(reason ?? "DMS-App responded with Status 401 indicating bad authSessionId.");
  case 403:
    throw new ForbiddenError(reason ?? "DMS-App responded with Status 403 indicating a forbidden action.");
  case 404:
    throw new NotFoundError(reason ?? "DMS-App responded with Status 404 indicating a requested resource does not exist.");
  default:
    throw new DmsError(reason ?? `DMS-App responded with status ${response.status}.`);
  }
}
