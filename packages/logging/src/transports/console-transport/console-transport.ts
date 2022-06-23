export function consoleTransportFactory(
  error: boolean = false,
  _console: Console = console
): (statement: any) => Promise<void> {
  return (statement: any) => {
    return new Promise((resolve, _) => {

      if (typeof statement === "object") {
        statement = JSON.stringify(statement);
      }

      if (error) {
        _console.error(statement);
      } else {
        _console.log(statement);
      }

      resolve();
    });
  };
}