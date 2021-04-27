/**
 * The context of a task.
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

  /** Technical identifier for this context. */
  key?: string;

  /** Technical identifier for the type of this context. */
  type?: string;

  /** Display name for this context. */
  name?: string;
}

/**
 * Metadata for the task.
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

  /** Unique key within these metadata consisting of only alphanumeric characters (1-255 character). Please make sure to use a distinct key for your tasks so that they do not collide with metadata of other task sources. */
  key?: string;

  /** Label of the metadata field. */
  caption?: string;

  /** Value of the metadata field. Currently, only one value is allowed per metadata field. If you use these values for delegation or responsibility rules, note the leading or trailing spaces. The spaces will be considered for the rules. */
  values?: string[];

  /** You can optionally add localized metadata to captions. */
  i18n?: {
    caption: {
      [key: string]: string;
    }[]
  }
}

/**
 * Links for the task. With these you can interact with the Task-App in an asynchronous way. [Explore the documentation]{@link https://developer.d-velop.de/documentation/taskapp/en#creating-a-task}.
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

  /** This URI provides an editing dialog for the task. You can find further details in the section [Adding editing dialogs]{@link https://developer.d-velop.de/documentation/taskapp/en#adding-editing-dialogs}. */
  form?: { href: string };

  /** This URI is displayed as a context action in the user interface to display additional information for the user. */
  attachment?: { href: string };

  /** This URI is called on completion of a task. */
  callback?: { href: string };

  /** This URI represents the process by which the task was initiated. The process is displayed in the user interface as a separate perspective for the task. */
  process?: { href: string };

  /** This URI is called in case of updates to the task. */
  changeCallback?: { href: string };
}

export interface Task {

  /** Location of the task. This should be treated like an ID. */
  location?: string;

  /** Subject of the task */
  subject?: string;

  /** A textual description of the task. */
  description?: string;

  /** The recipients of the task. IDs for users and groups are provided by the [Identityprovider]{@link identityprovider}. */
  assignees?: string[];

  /** Unique key for the task. Required for creating a task. */
  correlationKey?: string;

  /** Priority between 0 (low) and 100 (high) */
  priority?: number;

  /**
   * Reminder date in [RFC3339]{@link https://tools.ietf.org/html/rfc3339} format
   *
   * @example ```typescript
   * {
   *   ...
   *   "reminderDate" : "2018-07-31T20:16:17.000+02:00"
   * }
   * ```
   */
  reminderDate?: string;

  /**
   * Reminder date in [RFC3339]{@link https://tools.ietf.org/html/rfc3339} format
   *
   * @example ```typescript
   * {
   *   ...
   *   "dueDate" : "2018-08-15T20:16:17.000+02:00"
   * }
   * ```
   */
  dueDate?: string;

  /**
   * Time until finished task is deleted from task database in [ISO-8601](https://www.w3.org/TR/NOTE-datetime#:~:text=by%20Markus%20Kuhn.-,ISO%208601%20describes%20a%20large%20number%20of%20date%2Ftime%20formats,ISO%208601%20dates%20and%20times.) format.
   *
   * @default 30 days
   *
   * @example ```typescript
   * {
   *   ...
   *   "retentionTime" : "P30D" // 30 days
   * }
   * ```
   */
  retentionTime?: string;

  /** Context for the Task (See {@link TaskContext}) */
  context?: TaskContext;

  /** Metadata of the Task (See {@link TaskMetaData}) */
  metaData?: TaskMetaData[];

  /** Links for the task (See {@link TaskLinks}) */
  _links?: TaskLinks;
}