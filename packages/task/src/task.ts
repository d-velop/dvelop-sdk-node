/**
 * The context of a task.
 *
 * @property {string} key Technical identifier for this context.
 * @property {string} type Technical identifier for the type of this context.
 * @property {string} name Display name for this context.
 *
 * @example ```typescript
 * {
 *   ...
 *   "context" : {
 *     "key" : "myContextKey",
 *     "type" : "bpm",
 *     "name" : "my context name"
 *   }
 * }
 * ```
 */
export interface TaskContext {
  key?: string;
  type?: string;
  name?: string;
}

/**
 * Metadata for the task.
 *
 * @property {string} key Unique key within these metadata consisting of only alphanumeric characters (1-255 character). Please make sure to use a distinct key for your tasks so that they do not collide with metadata of other task sources.
 * @property {string} caption Label of the metadata field.
 * @property {string} values Value of the metadata field. Currently, only one value is allowed per metadata field. If you use these values for delegation or responsibility rules, note the leading or trailing spaces. The spaces will be considered for the rules.
 * @property {object} i18n You can optionally add localized metadata to captions.
 *
 * @example ```typescript
 * {
 *   ...
 *   "metadata" : [
 *      {
 *        "key" : "invoiceNumber",
 *        "caption" : "Invoice Number",
 *        "values" : ["INV123489"],
 *        "i18n" : {
 *          "caption" : {
 *            "de" : "Rechnungsnummer",
 *            "it" : "Numero di fattura"
 *          }
 *        }
 *      }
 *   ]
 * }
 * ```
 */
export interface TaskMetaData {
  key?: string;
  caption?: string;
  values?: string[];
  i18n?: {
    caption: {
      [key: string]: string;
    }[]
  }
}

/**
 * Links for the task.
 *
 * @property {object} form This URI provides an editing dialog for the task. You can find further details in the section [Adding editing dialogs](https://developer.d-velop.de/documentation/taskapp/en#adding-editing-dialogs).
 * @property {object} callback This URI is displayed as a context action in the user interface to display additional information for the user.
 * @property {object} attachment This URI is called on completion of a task via the method POST.
 * @property {object} process This URI represents the process by which the task was initiated. The process is displayed in the user interface as a separate perspective for the task. To display completed tasks, the resource has to implement a HEAD request, if the resource is behind the same base address.
 * @property {object} changeCallback This URI is called in case of updates to the task via the method POST.
 *
 * @example ```typescript
 * {
 *   ...
 *   "_links" : {
 *     "form" : {
 *       "href" : "https://example.com/form"
 *     }
 *   }
 * }
 * ```
 */
export interface TaskLinks {
  form?: { href: string };
  callback?: { href: string };
  attachment?: { href: string };
  process?: { href: string };
  changeCallback?: { href: string };
}

/**
 * Task representation
 * @property {string} location Location of the task.
 * @property {string} subject Subject of task
 * @property {string} description A textual description of the task
 * @property {string[]} assignees The recipients (Id of users or groups from Identityprovider) of the task
 * @property {string} correlationKey Unique key for the task. Required for creating a task.
 * @property {string} priority Priority between 0 (low) and 100 (high)
 * @property {string} reminderDate Reminder date (format RFC3339)
 * @property {string} dueDate Due date (format RFC3339)
 * @property {string} retentionTime Time until finished task is delted from task database. (format ISO-8601 e.g. P30D for 30 days). Between 0 - 365 days.
 * @property {TaskContext} context Context of the Task. key(string) -> technical identifier; type(string) -> technical identifier for type of context; name(string) -> displayname;
 * @property {TaskMetaData[]} metadata Array of objects containing metadata of the task. key(string) -> technical identifier; caption(string) -> caption of metadata; values(string[]) -> values (0-255 char, currently one value allowed); i18n(object) -> to specify different translations
 * @property {TaskLinks} _links Contains links for the task. form(object) -> uri to form which is displayed on task; callback(object) -> uri is called with POST when task finished; attachment(object) -> uri for attachment as context action; process(object) -> uri of process which created the task; changeCallback(object) -> uri is called with POST when task was changed;
 */

export interface TaskDto {
  subject?: string;
  description?: string;
  assignees?: string[];
  correlationKey?: string;
  priority?: number;
  reminderDate?: string;
  dueDate?: string;
  retentionTime?: string;
  context?: TaskContext;
  metadata?: TaskMetaData[];
  _links?: TaskLinks;
}

export interface Task extends TaskDto {
  location: string;
}

export function instanceOfTask(task: Task | string): task is Task {
  return (task as Task).location !== undefined;
}