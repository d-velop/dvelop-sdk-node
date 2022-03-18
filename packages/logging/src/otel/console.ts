/* eslint-disable @typescript-eslint/no-unused-vars,no-undef */

const fakeConsole: Console = {
  // @ts-ignore
  Console: undefined,
  assert(value?: any, ...message: (any)[]): void {},
  clear(): void {},
  count(label?: string): void {},
  countReset(label?: string): void {},
  debug(...message: (any)[]): void {},
  dir(item?: any, options?: any): void {},
  dirxml(...data: any[]): void {},
  error(...data: (any)[]): void {},
  group(...label: any[]): void {},
  groupCollapsed(...data: any[]): void {},
  groupEnd(): void {},
  info(...data: (any)[]): void {},
  log(...data: (any)[]): void {},
  profile(label?: string): void {},
  profileEnd(label?: string): void {},
  table(tabularData?: any, properties?: string[] | ReadonlyArray<string>): void {},
  time(label?: string): void {},
  timeEnd(label?: string): void {},
  timeLog(label?: string, ...data: any[]): void {},
  timeStamp(label?: string): void {},
  trace(...message: (any)[]): void {},
  warn(...data: (any)[]): void {},
  exception(message?: string, ...optionalParams) {},
  memory: undefined
};

const originalConsole = console;

export function disableDefaultConsole(): void {
  // eslint-disable-next-line no-global-assign
  console = fakeConsole;
}

export function enableDefaultConsole(): void {
  // eslint-disable-next-line no-global-assign
  console = originalConsole;
}
