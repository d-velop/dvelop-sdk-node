import { LoggingError } from "../../error";

export function consoleTransportFactory(
  error: boolean = false,
  _console: Console = console
): (statement: any) => Promise<void> {
  return (statement: any) => {
    return new Promise((resolve, reject) => {
      try {

        if (typeof statement === "object") {
          statement = JSON.stringify(statement);
        }

        if (error) {
          _console.error(statement);
        } else {
          _console.log(statement);
        }

        resolve();
      } catch (e: any) {
        const err: LoggingError = new LoggingError(`Failed to write event to console: '${e.message}'. See 'originalError-property for details.`, e);
        reject(err);
      }


    });
  };
}