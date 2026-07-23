import { BadInputError, DvelopSdkError, ForbiddenError, NotFoundError, UnauthorizedError } from "@dvelop-sdk/core";

/**
 * Generic Error for task-package.
 * @category Error
 */
/* istanbul ignore next */
export class TaskError extends DvelopSdkError {

  constructor(public message: string, public originalError?: Error) {
    super(message);
    Object.setPrototypeOf(this, TaskError.prototype);
  }
}

/**
 * Validation for task
 * @category Error
 */
export interface TaskValidation {
  invalidTaskDefinition: boolean;
  missingSubject: boolean;
  invalidSubject: boolean;
  invalidDescription: boolean;
  missingAssignees: boolean;
  invalidSender: boolean;
  invalidAssigneeIDs: string[];
  invalidDueDate: boolean;
  invalidPriority: boolean;
  invalidReminderDate: boolean;
  invalidRetentionTime: boolean;
  invalidHrefs: string[];
  invalidCorrelationKey: boolean;
  missingCorrelationKey: boolean;
  invalidContext: boolean;
  invalidMetadata: boolean;
  invalidOptions: string[];
  invalidDmsReferences: boolean;
}

/**
 * Indicates an invalid task-definition. See ```validation```-property for more information.
 * @category Error
 */
export class InvalidTaskDefinitionError extends BadInputError {

  constructor(public validation: TaskValidation, public originalError?: Error) {
    super("Taskdefinition is invalid. See 'validation'-property for more information.", originalError);
    Object.setPrototypeOf(this, InvalidTaskDefinitionError.prototype);
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
    reason = typeof body === "string" ? body : (body.reason ?? undefined);
  }

  switch (response.status) {
  case 400:
    if (body && typeof body === "object") {
      throw new InvalidTaskDefinitionError(body);
    }
    throw new BadInputError("Task-App responded with Status 400 indicating bad Request-Parameters.");
  case 401:
    throw new UnauthorizedError(reason ?? "Task-App responded with Status 401 indicating bad authSessionId.");
  case 403:
    throw new ForbiddenError("Task-App responded with Status 403 indicating a forbidden action.");
  case 404:
    throw new NotFoundError("Task-App responded with Status 404 indicating a requested resource does not exist.");
  case 429:
    throw new TaskError("Task-App responded with status 429 indicating that you sent too many requests in a short time. Consider throttling your requests.");
  default:
    throw new TaskError(`Task-App responded with status ${response.status}.`);
  }
}
