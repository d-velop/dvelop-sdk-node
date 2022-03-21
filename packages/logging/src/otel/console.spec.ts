import {disableDefaultConsole, enableDefaultConsole} from "./console";

describe("otel logger console helper", () => {
  let originalConsole;

  beforeEach(() => {
    originalConsole = console;
  });

  afterEach(() => {
    // eslint-disable-next-line no-global-assign
    console = originalConsole;
  });

  test("should disable and enable console", () => {
    disableDefaultConsole();
    expect(console).not.toEqual(originalConsole);
    enableDefaultConsole();
    expect(console).toEqual(originalConsole);
  });

});
