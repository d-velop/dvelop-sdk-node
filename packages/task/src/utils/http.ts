
import { DvelopContext, DvelopHttpRequestConfig, DvelopHttpResponse, DvelopHttpClient, defaultDvelopHttpClientFactory, BadInputError, UnauthorizedError, ForbiddenError, NotFoundError, DvelopSdkError } from "@dvelop-sdk/core";
export { DvelopHttpRequestConfig as HttpConfig, DvelopHttpResponse as HttpResponse } from "@dvelop-sdk/core";


/**
* Generic Error for task-package.
* @category Error
*/
/* istanbul ignore next */
export class TaskError extends DvelopSdkError {
  // eslint-disable-next-line no-unused-vars
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
  // eslint-disable-next-line no-unused-vars
  constructor(public validation: TaskValidation, public originalError?: Error) {
    super("Taskdefinition is invalid. See 'validation'-property for more information.", originalError);
    Object.setPrototypeOf(this, InvalidTaskDefinitionError.prototype);
  }
}

/**
 * Factory used to create the default httpRequestFunction. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Http
 */
export function _defaultHttpRequestFunctionFactory(httpClient: DvelopHttpClient): (context: DvelopContext, config: DvelopHttpRequestConfig) => Promise<DvelopHttpResponse> {
  return async (context: DvelopContext, config: DvelopHttpRequestConfig) => {

    try {
      return await httpClient.request(context, config);
    } catch (error: any) {

      if (error.response) {

        switch (error.response.status) {
        case 400:
          if (error.response.data) {
            throw new InvalidTaskDefinitionError(error.response.data, error);
          } else {
            throw new BadInputError("Task-App responded with Status 400 indicating bad Request-Parameters. See 'originalError'-property for details.", error);
          }

        case 401:
          throw new UnauthorizedError(error.response.data || "Task-App responded with Status 401 indicating bad authSessionId.", error);

        case 403:
          throw new ForbiddenError("Task-App responded with Status 403 indicating a forbidden action. See 'originalError'-property for details.", error);

        case 404:
          throw new NotFoundError("Task-App responded with Status 404 indicating a requested resource does not exist. See 'originalError'-property for details.", error);
        case 429:
          throw new TaskError("Task-App responded with status 429 indicating that you sent too many requests in a short time. Consider throttling your requests.", error);
        default:
          throw new TaskError(`Task-App responded with status ${error.response.status}. See 'originalError'-property for details.`, error);
        }
      } else {
        throw new TaskError(`Request to Task-App failed: ${error.message}. See 'originalError'-property for details.`, error);
      }
    }
  };
}

/**
 * Default httpRequestFunction used in task-package.
 * @internal
 * @category Http
 */
/* istanbul ignore next */
export async function _defaultHttpRequestFunction(context: DvelopContext, config: DvelopHttpRequestConfig): Promise<DvelopHttpResponse> {
  return _defaultHttpRequestFunctionFactory(defaultDvelopHttpClientFactory())(context, config);
}