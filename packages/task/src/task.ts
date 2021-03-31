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
 * @property {object} context Context of the Task. key(string) -> technical identifier; type(string) -> technical identifier for type of context; name(string) -> displayname;
 * @property {object[]} metadata Array of objects containing metadata of the task. key(string) -> technical identifier; caption(string) -> caption of metadata; values(string[]) -> values (0-255 char, currently one value allowed); i18n(object) -> to specify different translations
 * @property {object} _links Contains links for the task. form(object) -> uri to form which is displayed on task; callback(object) -> uri is called with POST when task finished; attachment(object) -> uri for attachment as context action; process(object) -> uri of process which created the task; changeCallback(object) -> uri is called with POST when task was changed;
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
    context?: {
        key: string;
        type: string;
        name: string;
    }
    metadata?: {
        key: string;
        caption: string;
        values: string[];
        i18n?: {
            caption: {
                [key: string]: string;
            }[]
        }
    }[];
    _links?: {
        form?: { href: string};
        callback?: {href: string};
        attachment?: {href: string};
        process?: {href: string};
        changeCallback?: {href: string};
    }
}

export interface Task extends TaskDto{
    location: string;
}

export function instanceOfTask(task: Task | string):task is Task{
  return (task as Task).location !== undefined;
}