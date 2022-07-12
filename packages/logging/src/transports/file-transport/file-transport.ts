import { createWriteStream, PathLike, WriteStream } from "fs";
import { LoggingError } from "../../error";
import { TransportFn } from "../transport-funtion";

export function fileTransportFactory(
  path: string,
  /* istanbul ignore next */
  _createWriteStream: (path: PathLike, options: { flags: "a" }) => WriteStream = createWriteStream
): TransportFn {
  return (statement: any) => {
    return new Promise((resolve, reject) => {
      try {

        if (typeof statement === "object") {
          statement = JSON.stringify(statement);
        }

        _createWriteStream(path, { flags: "a" })
          .write(`\n${statement}`, () => resolve());
      } catch (e: any) {
        const err: LoggingError = new LoggingError(`Failed to write event to file: '${e.message}'. See 'originalError-property for details.`, e);
        reject(err);
      }
    });
  };
}