import { consoleTransportFactory } from "./console-transport";

describe("consoleTransportFactory", () => {

  describe("default inputs", () => {

    let log: jest.SpyInstance = jest.spyOn(console, "log");
    let error: jest.SpyInstance = jest.spyOn(console, "error");
    let consoleTransport: (statement: any) => Promise<void>;

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should call console.log on no error-input specified", () => {
      consoleTransport = consoleTransportFactory();
      consoleTransport("HiItsMeStatement");

      expect(log).toHaveBeenCalledTimes(1);
      expect(error).not.toHaveBeenCalled();
    });

    it("should call console.log on error-input false", () => {
      consoleTransport = consoleTransportFactory(false);
      consoleTransport("HiItsMeStatement");

      expect(log).toHaveBeenCalledTimes(1);
      expect(error).not.toHaveBeenCalled();
    });

    it("should call console.error on error-input true", () => {
      consoleTransport = consoleTransportFactory(true);
      consoleTransport("HiItsMeStatement");

      expect(error).toHaveBeenCalledTimes(1);
      expect(log).not.toHaveBeenCalled();
    });
  });

  [
    true, false
  ].forEach(err => {
    describe(`console.${err ? "error" : "log"}`, () => {

      let _console: Console;
      let consoleTransport: (statement: any) => Promise<void>;

      const log = jest.fn();
      const error = jest.fn();

      const called = err ? error : log;
      const uncalled = err ? log : error;

      beforeEach(() => {

        jest.resetAllMocks();

        _console = {
          log,
          error
        } as unknown as Console;

        consoleTransport = consoleTransportFactory(err, _console);
      });

      [
        undefined, true, 4, "string"
      ].forEach(testCase => {

        it(`should write ${testCase}`, async () => {

          await consoleTransport(testCase);

          expect(called).toHaveBeenCalledTimes(1);
          expect(called).toHaveBeenLastCalledWith(testCase);
          expect(uncalled).not.toHaveBeenCalled();
        });
      });


      [
        null, {}, { a: "a" }, { a: "a", b: { c: "c" } }, [], [1, 2], ["hi", "ho"], [{ a: "a" }, { a: "a", b: { c: "c" } }]
      ].forEach(testCase => {
        it(`should write object: ${JSON.stringify(testCase)} as string `, async () => {

          await consoleTransport(testCase);

          expect(called).toHaveBeenCalledTimes(1);
          expect(called).toHaveBeenLastCalledWith(JSON.stringify(testCase));
          expect(uncalled).not.toHaveBeenCalled();
        });
      });
    });
  });

});